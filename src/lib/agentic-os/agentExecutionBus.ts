// ============================================================================
// AQLIYA AGENTIC OS — EXECUTION BUS & AUTONOMOUS LOOP
// ============================================================================

import type { AgenticPlanDAG, AgentTaskNode, AgentRole, TelemetryLogEntry, AgentExecutionContext } from './types';
import { AGENT_FLEET } from './agentRegistry';
import { AGENT_TOOLS } from './tools/agentToolsRegistry';
import { askCommanderAI } from '../gemini';
import { tacticalAudio } from '../audio';

export class AgentExecutionBus {
  private dag: AgenticPlanDAG;
  private context: AgentExecutionContext;
  private onDAGUpdate: (dag: AgenticPlanDAG) => void;
  private onAgentStatusChange: (role: AgentRole, status: string, currentTask?: string) => void;
  private isRunning: boolean = false;

  constructor(params: {
    dag: AgenticPlanDAG;
    context: AgentExecutionContext;
    onDAGUpdate: (dag: AgenticPlanDAG) => void;
    onAgentStatusChange: (role: AgentRole, status: string, currentTask?: string) => void;
  }) {
    this.dag = params.dag;
    this.context = params.context;
    this.onDAGUpdate = params.onDAGUpdate;
    this.onAgentStatusChange = params.onAgentStatusChange;
  }

  public updateDAG(dag: AgenticPlanDAG) {
    this.dag = dag;
  }

  public async startExecution() {
    if (this.isRunning) return;
    this.isRunning = true;
    tacticalAudio.playConfirm();

    this.dag.overallStatus = 'running';
    this.onDAGUpdate({ ...this.dag });

    this.context.dispatchTelemetry({
      agentRole: 'chief_of_staff',
      level: 'info',
      message: `بدء تشغيل خطة الوكلاء للمهمة: "${this.dag.commanderDirective}"`,
    });

    await this.stepLoop();
  }

  public pauseExecution() {
    this.isRunning = false;
    this.dag.overallStatus = 'paused';
    this.onDAGUpdate({ ...this.dag });
  }

  public async grantApproval(taskId: string) {
    const task = this.dag.tasks.find((t) => t.id === taskId);
    if (!task) return;

    task.approvalGranted = true;
    task.status = 'in_progress';
    this.onDAGUpdate({ ...this.dag });

    this.context.dispatchTelemetry({
      agentRole: task.assignedAgent,
      level: 'success',
      message: `تم اعتماد الإجراء الحرج للمهمة [${task.title}] من قبل القائد محمد. الاستئناف الفوري.`,
    });

    tacticalAudio.playConfirm();
    await this.executeTask(task);
    await this.stepLoop();
  }

  public rejectApproval(taskId: string, reason?: string) {
    const task = this.dag.tasks.find((t) => t.id === taskId);
    if (!task) return;

    task.status = 'failed';
    task.outputResult = `تم الرفض بواسطة القائد: ${reason || 'تم إلغاء الإجراء'}`;
    this.onDAGUpdate({ ...this.dag });

    this.context.dispatchTelemetry({
      agentRole: task.assignedAgent,
      level: 'warn',
      message: `تم رفض الإجراء للمهمة [${task.title}] من قبل القائد.`,
    });

    tacticalAudio.playAlert();
    this.stepLoop();
  }

  private async stepLoop() {
    if (!this.isRunning) return;

    // Find all pending tasks whose dependencies are completed
    const readyTasks = this.dag.tasks.filter((t) => {
      if (t.status !== 'pending') return false;
      const allDepsDone = t.dependencies.every((depId) => {
        const depTask = this.dag.tasks.find((x) => x.id === depId);
        return depTask && depTask.status === 'completed';
      });
      return allDepsDone;
    });

    if (readyTasks.length === 0) {
      // Check if any task is still in progress or waiting approval
      const waiting = this.dag.tasks.some((t) => t.status === 'in_progress' || t.status === 'waiting_approval');
      if (!waiting) {
        const allCompleted = this.dag.tasks.every((t) => t.status === 'completed');
        this.dag.overallStatus = allCompleted ? 'completed' : 'failed';
        this.isRunning = false;
        this.onDAGUpdate({ ...this.dag });

        // Reset all agent statuses to idle
        Object.keys(AGENT_FLEET).forEach((role) => {
          this.onAgentStatusChange(role as AgentRole, 'idle');
        });

        this.context.dispatchTelemetry({
          agentRole: 'chief_of_staff',
          level: allCompleted ? 'success' : 'warn',
          message: allCompleted
            ? `اكتمل تنفيذ كافة مهام الخطة بنجاح تام! المنظومة في وضع الاستعداد.`
            : `توقف تنفيذ الخطة لوجود مهام مرفوضة أو غير مكتملة.`,
        });

        if (allCompleted) tacticalAudio.playConfirm();
      }
      return;
    }

    // Execute ready tasks (sequential execution to avoid context collisions)
    for (const task of readyTasks) {
      if (!this.isRunning) break;

      if (task.requiresHumanApproval && !task.approvalGranted) {
        task.status = 'waiting_approval';
        this.onDAGUpdate({ ...this.dag });
        this.onAgentStatusChange(task.assignedAgent, 'waiting_approval', task.title);

        this.context.dispatchTelemetry({
          agentRole: task.assignedAgent,
          level: 'approval_request',
          message: `المهمة [${task.title}] تتطلب حسم واعتماد القائد قبل التنفيذ.`,
        });

        tacticalAudio.playAlert();
        await this.context.requestApproval(task, task.description);
        return; // Pause until approval granted
      }

      await this.executeTask(task);
    }

    // Next step iteration
    if (this.isRunning) {
      setTimeout(() => this.stepLoop(), 400);
    }
  }

  private async executeTask(task: AgentTaskNode) {
    task.status = 'in_progress';
    this.onDAGUpdate({ ...this.dag });
    this.onAgentStatusChange(task.assignedAgent, 'executing', task.title);

    const agent = AGENT_FLEET[task.assignedAgent];

    this.context.dispatchTelemetry({
      agentRole: task.assignedAgent,
      level: 'thought',
      message: `[${agent.nameAr}]: جارٍ تفكيك وتنفيذ المهمة -> ${task.title}`,
    });

    try {
      // 1. Simulate agent reasoning / call AI if needed
      const prompt = `أنت ${agent.nameAr}.
المهمة الموكلة إليك:
العنوان: ${task.title}
التفاصيل: ${task.description}
التوجيه العام للقائد: ${this.dag.commanderDirective}

أعطني ملخصاً تكتيكياً حاسماً (سطرين إلى 3 أسطر) يوضح ما تم إنجازه بدقة وما هي النتيجة المباشرة للقائد.`;

      const aiResult = await askCommanderAI(prompt, {
        missions: this.context.missions,
        intel: this.context.intel,
        memories: this.context.memories,
        dossier: this.context.dossier,
      });

      task.outputResult = aiResult.trim();
      task.executionLogs.push(`[${new Date().toLocaleTimeString()}] ${aiResult.slice(0, 120)}...`);

      // 2. Execute tool if designated in payload
      const suggestedTool = task.inputPayload?.suggestedTool;
      if (suggestedTool && AGENT_TOOLS[suggestedTool]) {
        const toolDef = AGENT_TOOLS[suggestedTool];
        const toolRes = await toolDef.execute(
          {
            title: task.title,
            content: aiResult,
            directive: this.dag.commanderDirective,
            mission_id: this.context.missions[0]?.id,
          },
          this.context
        );

        task.executionLogs.push(`[أداة ${toolDef.nameAr}]: ${toolRes.summary}`);
      }

      task.status = 'completed';
      task.completedAt = new Date().toISOString();
      this.dag.totalTokensUsed += 450;
      this.onDAGUpdate({ ...this.dag });

      this.context.dispatchTelemetry({
        agentRole: task.assignedAgent,
        level: 'success',
        message: `تم إنجاز المهمة [${task.title}] بنجاح.`,
      });

      this.onAgentStatusChange(task.assignedAgent, 'completed');
    } catch (err: any) {
      task.status = 'failed';
      task.outputResult = `خطأ أثناء التنفيذ: ${err.message || 'فشل غير متوقع'}`;
      this.onDAGUpdate({ ...this.dag });

      this.context.dispatchTelemetry({
        agentRole: task.assignedAgent,
        level: 'error',
        message: `فشل في تنفيذ المهمة [${task.title}]: ${err.message}`,
      });

      this.onAgentStatusChange(task.assignedAgent, 'error');
    }
  }
}
