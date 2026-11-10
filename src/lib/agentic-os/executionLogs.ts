// ============================================================================
// AQLIYA AGENTIC OS — EXECUTION LOGS & TRACE RECORDER
// ============================================================================

import type { ExecutionLogEntry, AgentRole } from './types';

export class ExecutionLogsManager {
  private static logs: ExecutionLogEntry[] = [];

  /**
   * تسجيل بدء تنفيذ مهمة
   */
  public static logStart(taskId: string, agent: AgentRole, action: string): ExecutionLogEntry {
    const entry: ExecutionLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      taskId,
      agent,
      action,
      status: 'started',
      timestamp: new Date().toISOString(),
    };
    ExecutionLogsManager.logs.push(entry);
    return entry;
  }

  /**
   * تسجيل نجاح تنفيذ مهمة
   */
  public static logSuccess(
    taskId: string,
    agent: AgentRole,
    action: string,
    durationMs: number,
    outputSnippet?: string
  ): ExecutionLogEntry {
    const entry: ExecutionLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      taskId,
      agent,
      action,
      status: 'success',
      durationMs,
      outputSnippet: outputSnippet ? outputSnippet.slice(0, 150) + '...' : undefined,
      timestamp: new Date().toISOString(),
    };
    ExecutionLogsManager.logs.push(entry);
    return entry;
  }

  /**
   * تسجيل فشل مهمة
   */
  public static logFailure(
    taskId: string,
    agent: AgentRole,
    action: string,
    error: string,
    durationMs?: number
  ): ExecutionLogEntry {
    const entry: ExecutionLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      taskId,
      agent,
      action,
      status: 'failed',
      durationMs,
      error,
      timestamp: new Date().toISOString(),
    };
    ExecutionLogsManager.logs.push(entry);
    return entry;
  }

  /**
   * تسجيل إعادة محاولة
   */
  public static logRetry(
    taskId: string,
    agent: AgentRole,
    action: string,
    retryCount: number,
    reason: string
  ): ExecutionLogEntry {
    const entry: ExecutionLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      taskId,
      agent,
      action,
      status: 'retrying',
      retryCount,
      error: reason,
      timestamp: new Date().toISOString(),
    };
    ExecutionLogsManager.logs.push(entry);
    return entry;
  }

  /**
   * جلب السجلات لمهمة محددة
   */
  public static getLogsForTask(taskId: string): ExecutionLogEntry[] {
    return ExecutionLogsManager.logs.filter((l) => l.taskId === taskId);
  }

  /**
   * جلب السجلات لوكيل محدد
   */
  public static getLogsForAgent(agent: AgentRole): ExecutionLogEntry[] {
    return ExecutionLogsManager.logs.filter((l) => l.agent === agent);
  }

  /**
   * جلب أحدث السجلات
   */
  public static getRecentLogs(limit: number = 30): ExecutionLogEntry[] {
    return ExecutionLogsManager.logs.slice(-limit).reverse();
  }

  /**
   * استخراج إحصائيات الأداء التنفيذي
   */
  public static getStats(): {
    totalExecutions: number;
    successfulCount: number;
    failedCount: number;
    retriedCount: number;
    avgDurationMs: number;
  } {
    const completed = ExecutionLogsManager.logs.filter((l) => l.status === 'success' || l.status === 'failed');
    const successes = ExecutionLogsManager.logs.filter((l) => l.status === 'success');
    const fails = ExecutionLogsManager.logs.filter((l) => l.status === 'failed');
    const retries = ExecutionLogsManager.logs.filter((l) => l.status === 'retrying');

    const totalDuration = successes.reduce((acc, l) => acc + (l.durationMs || 0), 0);
    const avgDurationMs = successes.length > 0 ? Math.round(totalDuration / successes.length) : 0;

    return {
      totalExecutions: completed.length,
      successfulCount: successes.length,
      failedCount: fails.length,
      retriedCount: retries.length,
      avgDurationMs,
    };
  }

  /**
   * تفريغ السجلات
   */
  public static clear(): void {
    ExecutionLogsManager.logs = [];
  }
}
