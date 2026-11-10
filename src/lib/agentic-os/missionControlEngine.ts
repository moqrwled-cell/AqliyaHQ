// ============================================================================
// AQLIYA AGENTIC OS — MISSION CONTROL ENGINE
// ============================================================================

import type {
  AgenticPlanDAG,
  AgentTaskNode,
  AgentRole,
  ExecutionLogEntry,
  TelemetryLogEntry,
} from './types';
import { AGENT_FLEET, getAgentByRole } from './agentRegistry';
import { ExecutionLogsManager } from './executionLogs';
import { AgentCommunicationHub } from './agentCommunicationHub';
import { ToolExecutionEngine } from './tools/toolExecutionEngine';

export interface AgentLiveState {
  role: AgentRole;
  name: string;
  nameAr: string;
  status: 'idle' | 'planning' | 'executing' | 'waiting_approval' | 'completed' | 'error';
  currentTaskTitle?: string;
  lastActiveTimestamp: string;
  latestOutputSnippet?: string;
  currentIssues?: string;
  allowedToolsCount: number;
}

export interface WorkloadMetrics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingApprovalTasks: number;
  failedTasks: number;
  activeAgentsCount: number;
  idleAgentsCount: number;
  totalTokensUsed: number;
  avgDurationMs: number;
  totalRetries: number;
  healthIndex: number; // 0 - 100%
  totalToolExecutions: number;
}

export class MissionControlEngine {
  /**
   * استخراج الحالة الحية الدقيقة لأسطول الوكلاء الخمسة (بدون بيانات وهمية)
   */
  public static getLiveFleetStatus(
    activeDAG: AgenticPlanDAG | null,
    manualStatuses?: Record<AgentRole, { status: string; currentTask?: string }>
  ): AgentLiveState[] {
    const roles: AgentRole[] = [
      'chief_of_staff',
      'intel_scout',
      'systems_dev',
      'watchdog_sentry',
      'life_ops',
    ];

    return roles.map((role) => {
      const def = getAgentByRole(role);
      const logs = ExecutionLogsManager.getLogsForAgent(role);
      const lastLog = logs.length > 0 ? logs[logs.length - 1] : null;
      const latestMsg = AgentCommunicationHub.getLatestMessage(role);

      // فحص المهمة الحالية من الـ DAG
      let currentTaskNode: AgentTaskNode | undefined = undefined;
      if (activeDAG) {
        currentTaskNode = activeDAG.tasks.find(
          (t) => t.assignedAgent === role && (t.status === 'in_progress' || t.status === 'waiting_approval')
        );
      }

      // تحديد الحالة
      let status: AgentLiveState['status'] = 'idle';
      if (manualStatuses && manualStatuses[role]) {
        status = manualStatuses[role].status as AgentLiveState['status'];
      } else if (currentTaskNode) {
        status = currentTaskNode.status === 'waiting_approval' ? 'waiting_approval' : 'executing';
      } else if (lastLog && lastLog.status === 'failed') {
        status = 'error';
      }

      // تحديد آخر خطأ أو مشكلة إن وجدت
      const failedLog = logs.slice().reverse().find((l) => l.status === 'failed');
      const currentIssues = failedLog?.error || undefined;

      // أحدث مخرج
      const latestOutputSnippet =
        currentTaskNode?.outputResult?.slice(0, 120) ||
        (latestMsg?.payload?.summary ? String(latestMsg.payload.summary).slice(0, 120) : undefined) ||
        lastLog?.outputSnippet;

      return {
        role,
        name: def.name,
        nameAr: def.nameAr,
        status,
        currentTaskTitle: currentTaskNode?.title || manualStatuses?.[role]?.currentTask || undefined,
        lastActiveTimestamp: lastLog?.timestamp || latestMsg?.timestamp || new Date().toISOString(),
        latestOutputSnippet,
        currentIssues,
        allowedToolsCount: def.allowedTools.length,
      };
    });
  }

  /**
   * احتساب مؤشرات الأداء واستهلاك الموارد الحقيقية (Real-time Math - No Mock)
   */
  public static getWorkloadMetrics(activeDAG: AgenticPlanDAG | null): WorkloadMetrics {
    const logStats = ExecutionLogsManager.getStats();
    const auditRecords = ToolExecutionEngine.getAuditRecords();

    const tasks = activeDAG ? activeDAG.tasks : [];
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
    const pendingApprovalTasks = tasks.filter((t) => t.status === 'waiting_approval').length;
    const failedTasks = tasks.filter((t) => t.status === 'failed').length;

    // احتساب الوكلاء النشطين
    const fleetStatus = MissionControlEngine.getLiveFleetStatus(activeDAG);
    const activeAgentsCount = fleetStatus.filter(
      (a) => a.status === 'executing' || a.status === 'planning' || a.status === 'waiting_approval'
    ).length;
    const idleAgentsCount = 5 - activeAgentsCount;

    // حساب استهلاك التوكنز الحقيقي
    const totalTokensUsed = activeDAG ? activeDAG.totalTokensUsed : 0;

    // مؤشر صحة المنظومة (Health Index)
    const totalExecs = logStats.totalExecutions;
    let healthIndex = 100;
    if (totalExecs > 0) {
      const successRatio = logStats.successfulCount / totalExecs;
      healthIndex = Math.round(successRatio * 100);
    }

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingApprovalTasks,
      failedTasks,
      activeAgentsCount,
      idleAgentsCount,
      totalTokensUsed,
      avgDurationMs: logStats.avgDurationMs,
      totalRetries: logStats.retriedCount,
      healthIndex,
      totalToolExecutions: auditRecords.length,
    };
  }

  /**
   * إيقاف مؤقت لمهمة جارية
   */
  public static pauseTask(dag: AgenticPlanDAG, taskId: string): AgenticPlanDAG {
    const target = dag.tasks.find((t) => t.id === taskId);
    if (target && target.status === 'in_progress') {
      target.status = 'pending';
      target.executionLogs.push(`[${new Date().toLocaleTimeString('ar-EG')}] تم إيقاف المهمة مؤقتاً بأمر يدوي من القائد.`);
    }
    return { ...dag };
  }

  /**
   * إعادة تشغيل أو إعادة محاولة مهمة متعثرة أو متوقفة
   */
  public static retryTask(dag: AgenticPlanDAG, taskId: string): AgenticPlanDAG {
    const target = dag.tasks.find((t) => t.id === taskId);
    if (target) {
      target.status = 'pending';
      target.retryCount = (target.retryCount || 0) + 1;
      target.executionLogs.push(`[${new Date().toLocaleTimeString('ar-EG')}] أمر إعادة تشغيل المهمة بواسطة القائد (محاولة ${target.retryCount}).`);
    }
    return { ...dag };
  }

  /**
   * تخطي مهمة واعتبارها مكتملة استثنائياً لمواصلة تدفق المسار
   */
  public static skipTask(dag: AgenticPlanDAG, taskId: string, reason?: string): AgenticPlanDAG {
    const target = dag.tasks.find((t) => t.id === taskId);
    if (target) {
      target.status = 'completed';
      target.outputResult = `[تم التخطي بقرار القائد]: ${reason || 'تم تجاوز المهمة استراتيجياً'}`;
      target.completedAt = new Date().toISOString();
      target.executionLogs.push(`[${new Date().toLocaleTimeString('ar-EG')}] تم تخطي المهمة بقرار قيادي صريح.`);
    }
    return { ...dag };
  }

  /**
   * تفويض وكيل آخر للقيام بمهمة محددة
   */
  public static reassignTask(
    dag: AgenticPlanDAG,
    taskId: string,
    newAgent: AgentRole,
    reason?: string
  ): AgenticPlanDAG {
    const target = dag.tasks.find((t) => t.id === taskId);
    if (target) {
      const oldAgent = target.assignedAgent;
      target.assignedAgent = newAgent;
      target.executionLogs.push(
        `[${new Date().toLocaleTimeString('ar-EG')}] تم تغيير تفويض المهمة من [${oldAgent}] إلى [${newAgent}] ${reason ? `(${reason})` : ''}.`
      );
    }
    return { ...dag };
  }

  /**
   * التدخل اليدوي وتعديل مخرج المهمة مباشرة بواسطة القائد
   */
  public static manualOverride(
    dag: AgenticPlanDAG,
    taskId: string,
    customOutput: string
  ): AgenticPlanDAG {
    const target = dag.tasks.find((t) => t.id === taskId);
    if (target) {
      target.outputResult = customOutput;
      target.status = 'completed';
      target.completedAt = new Date().toISOString();
      target.executionLogs.push(
        `[${new Date().toLocaleTimeString('ar-EG')}] تم التدخل اليدوي واعتماد مخرجات مخصصة بواسطة القائد محمد.`
      );
    }
    return { ...dag };
  }
}
