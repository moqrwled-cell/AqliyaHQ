// ============================================================================
// AQLIYA AGENTIC OS — TOOL EXECUTION ENGINE TYPES & CONTRACTS
// ============================================================================

import type { AgentRole, AgentExecutionContext, AgentToolResult } from '../types';

export type ToolCategory = 
  | 'files' 
  | 'projects' 
  | 'obsidian' 
  | 'memory' 
  | 'intel' 
  | 'logs' 
  | 'decisions'
  | 'life_ops'
  | 'system';

export type ToolPermissionLevel = 
  | 'read_only'       // استعلام وقراءة دون أي تأثير جانبي
  | 'low_risk'        // كتابة أو تحديث طفيف (تدوين ذاكرة، تسجيل ملاحظة، تحديث تقدم)
  | 'high_critical';  // تعديل ملفات كود حساسة، حذف بيانات، أو إنشاء مشاريع جديدة

export interface ToolInputParam {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  required: boolean;
  default?: any;
}

export interface EnhancedToolDefinition {
  name: string;
  nameAr: string;
  description: string;
  category: ToolCategory;
  permissionLevel: ToolPermissionLevel;
  allowedAgents: AgentRole[];
  inputs: ToolInputParam[];
  outputDescription: string;
  requiresApproval: boolean;
  execute: (args: Record<string, any>, context: AgentExecutionContext) => Promise<AgentToolResult>;
}

export interface ToolExecutionRecord {
  id: string;
  toolName: string;
  callerAgent: AgentRole;
  inputs: Record<string, any>;
  permissionLevel: ToolPermissionLevel;
  status: 'started' | 'success' | 'failed' | 'denied';
  durationMs: number;
  resultSummary?: string;
  error?: string;
  timestamp: string;
}
