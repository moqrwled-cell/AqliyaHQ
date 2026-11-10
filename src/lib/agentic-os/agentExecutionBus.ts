// ============================================================================
// AQLIYA AGENTIC OS — EXECUTION BUS & AUTONOMOUS AGENT ORCHESTRATOR
// ============================================================================

import type {
  AgenticPlanDAG,
  AgentTaskNode,
  AgentRole,
  AgentExecutionContext,
} from './types';
import { AGENT_FLEET } from './agentRegistry';
import { TaskDispatcher } from './taskDispatcher';
import { ExecutionManager } from './executionManager';
import { AgentCommunicationHub } from './agentCommunicationHub';
import { ExecutionLogsManager } from './executionLogs';
import { tacticalAudio } from '../audio';

export class AgentExecutionBus {
  private dag: AgenticPlanDAG;
  private context: AgentExecutionContext;
  private executionManager: ExecutionManager;
  private onDAGUpdate: (dag: AgenticPlanDAG) => void;
  private onAgentStatusChange: (role: AgentRole, status: string, currentTask?: string) => void;

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

    this.executionManager = new ExecutionManager(
      this.dag,
      this.context,
      {
        taskTimeoutMs: 15000,
        maxRetries: 2,
        backoffBaseMs: 500,
      },
      {
        onDAGUpdate: (updatedDag) => {
          this.dag = updatedDag;
          this.onDAGUpdate(updatedDag);
        },
        onAgentStatusChange: (role, status, taskTitle) => {
          this.onAgentStatusChange(role, status, taskTitle);
        },
      }
    );
  }

  public updateDAG(dag: AgenticPlanDAG) {
    this.dag = dag;
    this.executionManager = new ExecutionManager(
      this.dag,
      this.context,
      { taskTimeoutMs: 15000, maxRetries: 2, backoffBaseMs: 500 },
      {
        onDAGUpdate: (updatedDag) => {
          this.dag = updatedDag;
          this.onDAGUpdate(updatedDag);
        },
        onAgentStatusChange: (role, status, taskTitle) => {
          this.onAgentStatusChange(role, status, taskTitle);
        },
      }
    );
  }

  /**
   * تشغيل خطة الوكلاء كاملة
   */
  public async startExecution(): Promise<AgenticPlanDAG> {
    try {
      tacticalAudio.playConfirm();
    } catch {
      // Audio optional in CLI/testing environments
    }

    const finalDag = await this.executionManager.executePlan();

    // إعادة كافة الوكلاء لحالة الاستعداد بعد إتمام الخطة
    Object.keys(AGENT_FLEET).forEach((role) => {
      this.onAgentStatusChange(role as AgentRole, 'idle');
    });

    if (finalDag.overallStatus === 'completed') {
      try {
        tacticalAudio.playConfirm();
      } catch {}
    } else {
      try {
        tacticalAudio.playAlert();
      } catch {}
    }

    return finalDag;
  }

  /**
   * إيقاف مؤقت للخطة
   */
  public pauseExecution() {
    this.dag.overallStatus = 'paused';
    this.onDAGUpdate({ ...this.dag });
  }

  /**
   * اعتماد مهمة معلقة تتطلب موافقة القائد
   */
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

    try {
      tacticalAudio.playConfirm();
    } catch {}

    await this.executionManager.executeSingleTaskWithRetry(task);
    await this.startExecution();
  }

  /**
   * رفض مهمة حرجة من قبل القائد
   */
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

    try {
      tacticalAudio.playAlert();
    } catch {}
  }

  public getDAG(): AgenticPlanDAG {
    return this.dag;
  }

  public static getCommunicationHub() {
    return AgentCommunicationHub;
  }

  public static getLogsManager() {
    return ExecutionLogsManager;
  }
}
