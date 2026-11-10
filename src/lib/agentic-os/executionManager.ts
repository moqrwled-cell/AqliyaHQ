// ============================================================================
// AQLIYA AGENTIC OS — AUTONOMOUS EXECUTION MANAGER
// ============================================================================

import type {
  AgenticPlanDAG,
  AgentTaskNode,
  AgentRole,
  AgentExecutionContext,
  VerificationResult,
  MessageType,
} from './types';
import { AGENT_FLEET } from './agentRegistry';
import { AGENT_TOOLS } from './tools/agentToolsRegistry';
import { AgentCommunicationHub } from './agentCommunicationHub';
import { ExecutionLogsManager } from './executionLogs';
import { VerificationEngine } from './verificationEngine';
import { askCommanderAI } from '../gemini';

export interface ExecutionManagerOptions {
  taskTimeoutMs?: number;      // المدى الزمني الأقصى للمهمة (الافتراضي: 15 ثانية)
  maxRetries?: number;         // أقصى عدد لإعادة المحاولة عند الفشل (الافتراضي: 2)
  backoffBaseMs?: number;      // قاعدة التراجع الزمني الأسي (الافتراضي: 600ms)
}

export class ExecutionManager {
  private dag: AgenticPlanDAG;
  private context: AgentExecutionContext;
  private options: Required<ExecutionManagerOptions>;
  private isRunning: boolean = false;
  private onDAGUpdate?: (dag: AgenticPlanDAG) => void;
  private onAgentStatusChange?: (role: AgentRole, status: string, currentTask?: string) => void;

  constructor(
    dag: AgenticPlanDAG,
    context: AgentExecutionContext,
    options?: ExecutionManagerOptions,
    callbacks?: {
      onDAGUpdate?: (dag: AgenticPlanDAG) => void;
      onAgentStatusChange?: (role: AgentRole, status: string, currentTask?: string) => void;
    }
  ) {
    this.dag = dag;
    this.context = context;
    this.options = {
      taskTimeoutMs: options?.taskTimeoutMs ?? 30000,
      maxRetries: options?.maxRetries ?? 2,
      backoffBaseMs: options?.backoffBaseMs ?? 600,
    };
    this.onDAGUpdate = callbacks?.onDAGUpdate;
    this.onAgentStatusChange = callbacks?.onAgentStatusChange;
  }

  /**
   * تشغيل الخطة بأكملها وإدارتها ذاتياً
   */
  public async executePlan(): Promise<AgenticPlanDAG> {
    if (this.isRunning) return this.dag;
    this.isRunning = true;
    this.dag.overallStatus = 'running';
    this.notifyDAGUpdate();

    this.context.dispatchTelemetry({
      agentRole: 'chief_of_staff',
      level: 'info',
      message: `بدء تشغيل خطة الوكلاء [${this.dag.id}] - الاستراتيجية: ${this.dag.dispatchStrategy || 'autonomous'}`,
    });

    try {
      while (this.isRunning) {
        // البحث عن المهام الجاهزة للتنفيذ (التي اكتملت كافة اعتمادياتها)
        const readyTasks = this.getReadyTasks();

        if (readyTasks.length === 0) {
          const hasUnfinished = this.dag.tasks.some(
            (t) => t.status === 'in_progress' || t.status === 'waiting_approval'
          );

          if (!hasUnfinished) {
            const hasFailed = this.dag.tasks.some((t) => t.status === 'failed');
            this.dag.overallStatus = hasFailed ? 'failed' : 'completed';
            this.isRunning = false;
            this.notifyDAGUpdate();

            this.context.dispatchTelemetry({
              agentRole: 'chief_of_staff',
              level: hasFailed ? 'warn' : 'success',
              message: hasFailed
                ? 'انتهت دورة تنفيذ الخطة مع وجود مهام متعثرة.'
                : 'اكتملت جميع مهام الخطة بنجاح تام وتم التحقق من مخرجات الأسطول.',
            });
            break;
          }

          // انتظار في حال وجود مهام معلقة
          await new Promise((r) => setTimeout(r, 200));
          continue;
        }

        // تنفيذ المهام الجاهزة
        for (const task of readyTasks) {
          if (!this.isRunning) break;

          // فحص الحاجة لتفويض بشري صريح
          if (task.requiresHumanApproval && !task.approvalGranted) {
            task.status = 'waiting_approval';
            this.notifyDAGUpdate();
            this.notifyAgentStatus(task.assignedAgent, 'waiting_approval', task.title);

            this.context.dispatchTelemetry({
              agentRole: task.assignedAgent,
              level: 'approval_request',
              message: `المهمة [${task.title}] تتطلب حسم القائد محمد قبل التنفيذ.`,
            });

            const approved = await this.context.requestApproval(task, task.description);
            if (approved) {
              task.approvalGranted = true;
            } else {
              task.status = 'failed';
              task.outputResult = 'تم رفض الإجراء من قبل القائد.';
              this.notifyDAGUpdate();
              continue;
            }
          }

          // تنفيذ المهمة مع إدارة المهل وإعادة المحاولة
          await this.executeSingleTaskWithRetry(task);
        }
      }
    } finally {
      this.isRunning = false;
    }

    return this.dag;
  }

  /**
   * تنفيذ مهمة فردية مع إدارة المهل والتحقق وإعادة المحاولة
   */
  public async executeSingleTaskWithRetry(task: AgentTaskNode): Promise<boolean> {
    const agent = AGENT_FLEET[task.assignedAgent];
    task.status = 'in_progress';
    task.retryCount = 0;
    this.notifyDAGUpdate();
    this.notifyAgentStatus(task.assignedAgent, 'executing', task.title);

    ExecutionLogsManager.logStart(task.id, task.assignedAgent, task.title);

    while (task.retryCount! <= this.options.maxRetries) {
      const startTime = Date.now();

      try {
        // تنفيذ المهمة مع مهلة زمنية صارمة
        const resultText = await this.executeWithTimeout(
          () => this.runAgentTaskLogic(task),
          this.options.taskTimeoutMs
        );

        const durationMs = Date.now() - startTime;
        task.durationMs = durationMs;

        // تدقيق المخرج عبر Verification Engine
        const verification: VerificationResult = VerificationEngine.verifyAgentOutput({
          task,
          output: resultText,
          agentRole: task.assignedAgent,
          expectedCriteria: task.description,
        });

        if (!verification.isValid) {
          throw new Error(`فشل التحقق المعماري: ${verification.reason}`);
        }

        // نجاح التحقق والتنفيذ
        task.outputResult = resultText;
        task.status = 'completed';
        task.completedAt = new Date().toISOString();
        task.executionLogs.push(`[نجاح] ${resultText.slice(0, 100)}...`);

        ExecutionLogsManager.logSuccess(
          task.id,
          task.assignedAgent,
          task.title,
          durationMs,
          resultText
        );

        // إرسال رسالة تواصل للأجهزة والوكلاء عبر Hub
        const msgType = this.resolveMessageType(task.assignedAgent, task.id);
        AgentCommunicationHub.sendMessage({
          sender: task.assignedAgent,
          recipient: 'all',
          messageType: msgType,
          title: task.title,
          payload: {
            taskId: task.id,
            summary: resultText,
            confidence: verification.confidence,
          },
          taskId: task.id,
        });

        this.context.dispatchTelemetry({
          agentRole: task.assignedAgent,
          level: 'success',
          message: `تم إنجاز وتدقيق المهمة [${task.title}] بنجاح خلال (${durationMs}ms).`,
        });

        this.notifyAgentStatus(task.assignedAgent, 'completed');
        this.notifyDAGUpdate();
        return true;
      } catch (err: any) {
        task.retryCount! += 1;
        const durationMs = Date.now() - startTime;
        const errMsg = err?.message || 'خطأ غير معروف أثناء التنفيذ';

        if (task.retryCount! <= this.options.maxRetries) {
          ExecutionLogsManager.logRetry(
            task.id,
            task.assignedAgent,
            task.title,
            task.retryCount!,
            errMsg
          );

          this.context.dispatchTelemetry({
            agentRole: task.assignedAgent,
            level: 'warn',
            message: `تعثر في المهمة [${task.title}] (${errMsg}). جارٍ إعادة المحاولة ${task.retryCount}/${this.options.maxRetries}...`,
          });

          // تراجع أسي
          const waitTime = this.options.backoffBaseMs * Math.pow(1.5, task.retryCount!);
          await new Promise((r) => setTimeout(r, waitTime));
        } else {
          // استنفاد المحاولات
          task.status = 'failed';
          task.outputResult = `تعثر نهائي: ${errMsg}`;
          ExecutionLogsManager.logFailure(
            task.id,
            task.assignedAgent,
            task.title,
            errMsg,
            durationMs
          );

          this.context.dispatchTelemetry({
            agentRole: task.assignedAgent,
            level: 'error',
            message: `فشل نهائي في تنفيذ المهمة [${task.title}] بعد ${this.options.maxRetries} محاولات: ${errMsg}`,
          });

          this.notifyAgentStatus(task.assignedAgent, 'error');
          this.notifyDAGUpdate();
          return false;
        }
      }
    }

    return false;
  }

  /**
   * تشغيل منطق الوكيل وربط الأدوات والتفكير التكتيكي
   */
  private async runAgentTaskLogic(task: AgentTaskNode): Promise<string> {
    const agent = AGENT_FLEET[task.assignedAgent];

    // جلب الرسائل السابقة المتبادلة بين الوكلاء لتعزيز السياق
    const threadMessages = AgentCommunicationHub.getTaskThread(task.id);
    const interAgentSummary = AgentCommunicationHub.getSummaryForSynthesis();

    let contextSnippet = '';
    if (Object.keys(interAgentSummary).length > 0) {
      contextSnippet = `\nمخرجات الوكلاء الآخرين في هذا المسار حتى الآن:\n${Object.entries(
        interAgentSummary
      )
        .map(([role, summary]) => `- [${role}]: ${summary}`)
        .join('\n')}\n`;
    }

    const prompt = `أنت "${agent.nameAr}" (${agent.name}) في نظام AQLIYA Agentic OS للقائد محمد قرمان.
تعليماتك الخاصة:
${agent.systemPrompt}

المهمة المسندة إليك:
العنوان: ${task.title}
التفاصيل والمتطلبات: ${task.description}
التوجيه الإستراتيجي العام للقائد: "${this.dag.commanderDirective}"
${contextSnippet}

المطلوب:
قدم مخرجاً تكتيكياً حاسماً وواضحاً، يلتزم بحدود تخصصك بدقة دون حشو، ويوفر نتائج عملية واقعية للقائد محمد في غزة.`;

    const aiOutput = await askCommanderAI(prompt, {
      missions: this.context.missions,
      intel: this.context.intel,
      memories: this.context.memories,
      dossier: this.context.dossier,
    });

    const cleanOutput = aiOutput.trim();

    // تشغيل الأداة المحددة إن وجدت
    const suggestedTool = task.inputPayload?.suggestedTool;
    if (suggestedTool && AGENT_TOOLS[suggestedTool]) {
      const toolDef = AGENT_TOOLS[suggestedTool];
      await toolDef.execute(
        {
          title: task.title,
          content: cleanOutput,
          directive: this.dag.commanderDirective,
          mission_id: this.context.missions[0]?.id,
        },
        this.context
      );
    }

    return cleanOutput;
  }

  /**
   * تنفيذ وظيفة غير متزامنة مع مهلة زمنية محددة
   */
  private async executeWithTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
    let timer: any;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(`تجاوزت المهمة المهلة الزمنية المحددة (${timeoutMs}ms)`));
      }, timeoutMs);
    });

    try {
      return await Promise.race([fn(), timeoutPromise]);
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * تحديد نوع الرسالة الصادرة بحسب دور الوكيل ومعرف المهمة
   */
  private resolveMessageType(agent: AgentRole, taskId: string): MessageType {
    if (taskId.includes('final') || taskId.includes('report')) return 'final_report';
    if (agent === 'intel_scout') return 'intel_response';
    if (agent === 'systems_dev') return 'architecture_spec';
    if (agent === 'watchdog_sentry') return 'risk_assessment';
    if (agent === 'life_ops') return 'life_constraint';
    if (agent === 'chief_of_staff') return 'synthesis_request';
    return 'intel_response';
  }

  /**
   * البحث عن المهام الجاهزة للتنفيذ
   */
  private getReadyTasks(): AgentTaskNode[] {
    return this.dag.tasks.filter((t) => {
      if (t.status !== 'pending') return false;
      return t.dependencies.every((depId) => {
        const depTask = this.dag.tasks.find((x) => x.id === depId);
        return depTask && depTask.status === 'completed';
      });
    });
  }

  private notifyDAGUpdate() {
    if (this.onDAGUpdate) {
      this.onDAGUpdate({ ...this.dag });
    }
  }

  private notifyAgentStatus(role: AgentRole, status: string, currentTask?: string) {
    if (this.onAgentStatusChange) {
      this.onAgentStatusChange(role, status, currentTask);
    }
  }

  public getDAG(): AgenticPlanDAG {
    return this.dag;
  }
}
