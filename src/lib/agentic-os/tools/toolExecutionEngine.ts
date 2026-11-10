// ============================================================================
// AQLIYA AGENTIC OS — UNIFIED TOOL EXECUTION ENGINE
// ============================================================================

import type { AgentRole, AgentExecutionContext, AgentToolResult } from '../types';
import type { ToolExecutionRecord, EnhancedToolDefinition } from './types';
import { ENHANCED_TOOL_REGISTRY } from './agentToolsRegistry';
import { ExecutionLogsManager } from '../executionLogs';

export class ToolExecutionEngine {
  private static auditRecords: ToolExecutionRecord[] = [];

  /**
   * تشغيل أداة مع تدقيق الصلاحيات والمطابقة الأمنية والتتبع التام
   */
  public static async executeTool(params: {
    toolName: string;
    callerAgent: AgentRole;
    args: Record<string, any>;
    context: AgentExecutionContext;
    isPreApproved?: boolean;
  }): Promise<AgentToolResult> {
    const { toolName, callerAgent, args, context, isPreApproved } = params;
    const startTime = Date.now();
    const recordId = `tool-exec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // 1. فحص وجود الأداة في السجل الموحد
    const tool: EnhancedToolDefinition | undefined = ENHANCED_TOOL_REGISTRY[toolName];
    if (!tool) {
      const err = `الأداة غير مسجلة في السجل الموحد: ${toolName}`;
      ToolExecutionEngine.recordAudit({
        id: recordId,
        toolName,
        callerAgent,
        inputs: args,
        permissionLevel: 'read_only',
        status: 'failed',
        durationMs: 0,
        error: err,
        timestamp: new Date().toISOString(),
      });
      return { success: false, summary: err, error: err };
    }

    // 2. فحص صلاحية الوكيل في استدعاء الأداة (Role-Based Access Control)
    if (!tool.allowedAgents.includes(callerAgent)) {
      const err = `انتهاك أمني: الوكيل [${callerAgent}] غير مصرح له باستخدام الأداة [${tool.nameAr} (${toolName})]. المصرح لهم: ${tool.allowedAgents.join(', ')}`;
      ToolExecutionEngine.recordAudit({
        id: recordId,
        toolName,
        callerAgent,
        inputs: args,
        permissionLevel: tool.permissionLevel,
        status: 'denied',
        durationMs: 0,
        error: err,
        timestamp: new Date().toISOString(),
      });

      context.dispatchTelemetry({
        agentRole: callerAgent,
        level: 'warn',
        message: err,
      });

      return { success: false, summary: err, error: 'Permission Denied' };
    }

    // 3. فحص المعاملات المطلوبة (Schema Validation)
    for (const input of tool.inputs) {
      if (input.required && (args[input.name] === undefined || args[input.name] === null || args[input.name] === '')) {
        const err = `فشل التحقق من مدخلات الأداة: الحقل [${input.name}] مطلوب (${input.description})`;
        return { success: false, summary: err, error: err };
      }
    }

    // 4. فحص مستوى الصلاحيات والحاجة لاعتماد القائد (Human-in-the-Loop)
    if (tool.requiresApproval && !isPreApproved) {
      context.dispatchTelemetry({
        agentRole: callerAgent,
        level: 'approval_request',
        message: `الأداة الحرجة [${tool.nameAr}] تتطلب موافقة القائد محمد قبل التنفيذ.`,
      });

      const approved = await context.requestApproval(
        {
          id: `task-approval-${recordId}`,
          title: `طلب تنفيذ أداة: ${tool.nameAr}`,
          description: `الوكيل: ${callerAgent} | المعاملات: ${JSON.stringify(args)}`,
          assignedAgent: callerAgent,
          dependencies: [],
          status: 'waiting_approval',
          requiresHumanApproval: true,
          executionLogs: [],
          createdAt: new Date().toISOString(),
        },
        `يرغب الوكيل [${callerAgent}] في تنفيذ الأداة ذات الصلاحية الحرجة [${tool.nameAr}]`
      );

      if (!approved) {
        const denyMsg = `تم رفض تنفيذ الأداة [${tool.nameAr}] بواسطة القائد محمد.`;
        ToolExecutionEngine.recordAudit({
          id: recordId,
          toolName,
          callerAgent,
          inputs: args,
          permissionLevel: tool.permissionLevel,
          status: 'denied',
          durationMs: Date.now() - startTime,
          resultSummary: denyMsg,
          timestamp: new Date().toISOString(),
        });

        return { success: false, summary: denyMsg, error: 'Commander Denied Approval' };
      }
    }

    // 5. تنفيذ الأداة
    try {
      context.dispatchTelemetry({
        agentRole: callerAgent,
        level: 'tool_call',
        message: `[${callerAgent}] ينفذ أداة: ${tool.nameAr}...`,
      });

      const result = await tool.execute(args, context);
      const durationMs = Date.now() - startTime;

      ToolExecutionEngine.recordAudit({
        id: recordId,
        toolName,
        callerAgent,
        inputs: args,
        permissionLevel: tool.permissionLevel,
        status: result.success ? 'success' : 'failed',
        durationMs,
        resultSummary: result.summary,
        error: result.error,
        timestamp: new Date().toISOString(),
      });

      if (result.success) {
        ExecutionLogsManager.logSuccess(recordId, callerAgent, `أداة: ${tool.nameAr}`, durationMs, result.summary);
        context.dispatchTelemetry({
          agentRole: callerAgent,
          level: 'success',
          message: `اكتمل تنفيذ [${tool.nameAr}] بنجاح (${durationMs}ms): ${result.summary}`,
        });
      } else {
        ExecutionLogsManager.logFailure(recordId, callerAgent, `أداة: ${tool.nameAr}`, result.error || result.summary, durationMs);
        context.dispatchTelemetry({
          agentRole: callerAgent,
          level: 'warn',
          message: `تعثر تنفيذ [${tool.nameAr}]: ${result.summary}`,
        });
      }

      return result;
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      const errMsg = err?.message || 'خطأ غير متوقع أثناء تشغيل الأداة';

      ToolExecutionEngine.recordAudit({
        id: recordId,
        toolName,
        callerAgent,
        inputs: args,
        permissionLevel: tool.permissionLevel,
        status: 'failed',
        durationMs,
        error: errMsg,
        timestamp: new Date().toISOString(),
      });

      ExecutionLogsManager.logFailure(recordId, callerAgent, `أداة: ${tool.nameAr}`, errMsg, durationMs);

      return { success: false, summary: `خطأ أثناء تنفيذ الأداة: ${errMsg}`, error: errMsg };
    }
  }

  /**
   * جلب سجلات التدقيق
   */
  public static getAuditRecords(): ToolExecutionRecord[] {
    return ToolExecutionEngine.auditRecords;
  }

  /**
   * مسح سجلات التدقيق
   */
  public static clearAudit(): void {
    ToolExecutionEngine.auditRecords = [];
  }

  /**
   * تسجيل عملية تدقيق
   */
  private static recordAudit(entry: ToolExecutionRecord): void {
    ToolExecutionEngine.auditRecords.push(entry);
  }

  /**
   * استرجاع قائمة الأدوات المتاحة لوكيل محدد
   */
  public static getToolsForAgent(agent: AgentRole): EnhancedToolDefinition[] {
    return Object.values(ENHANCED_TOOL_REGISTRY).filter((t) => t.allowedAgents.includes(agent));
  }

  /**
   * جلب كافة الأدوات المعرفة
   */
  public static getAllTools(): EnhancedToolDefinition[] {
    return Object.values(ENHANCED_TOOL_REGISTRY);
  }
}
