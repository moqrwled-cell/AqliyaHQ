// ============================================================================
// AQLIYA AGENTIC OS — CORE CONTRACTS & TYPES
// ============================================================================

export type AgentRole = 
  | 'chief_of_staff'   // المستشار وقائد الأركان: التخطيط العام والتنسيق
  | 'intel_scout'      // وكيل الاستخبارات: تفريغ الروابط، تلخيص الأفكار وتصنيفها
  | 'systems_dev'      // وكيل البناء البرمجي: المعمارية، الأكواد، وتكامل النظم
  | 'watchdog_sentry'  // وكيل الرقابة واليقظة: مراقبة الركود وتنبيهات الأمان
  | 'life_ops';        // وكيل العمليات الحياتية: الروتين، الطاقة، العادات، والمذكرات

export type AgentStatus = 'idle' | 'planning' | 'executing' | 'waiting_approval' | 'completed' | 'error';

export interface AgentDefinition {
  id: AgentRole;
  name: string;
  nameAr: string;
  roleDescription: string;
  avatarIcon: string;
  color: string;
  accentBorder: string;
  systemPrompt: string;
  allowedTools: string[];
}

export type TaskStatus = 'pending' | 'in_progress' | 'waiting_approval' | 'completed' | 'failed';

export interface AgentTaskNode {
  id: string;
  title: string;
  description: string;
  assignedAgent: AgentRole;
  dependencies: string[]; // IDs of required prerequisite tasks
  status: TaskStatus;
  inputPayload?: Record<string, any>;
  outputResult?: string;
  requiresHumanApproval: boolean;
  approvalGranted?: boolean;
  executionLogs: string[];
  createdAt: string;
  completedAt?: string;
}

export interface AgenticPlanDAG {
  id: string;
  commanderDirective: string;
  tasks: AgentTaskNode[];
  overallStatus: 'idle' | 'running' | 'paused' | 'completed' | 'failed';
  currentStepIndex: number;
  totalTokensUsed: number;
  createdAt: string;
}

export interface TelemetryLogEntry {
  id: string;
  timestamp: string;
  agentRole: AgentRole;
  level: 'info' | 'thought' | 'tool_call' | 'approval_request' | 'success' | 'warn' | 'error';
  message: string;
  metadata?: any;
}

export interface AgentToolDefinition {
  name: string;
  nameAr: string;
  description: string;
  category: 'missions' | 'intel' | 'memory' | 'logs' | 'system';
  requiresApproval: boolean;
  execute: (args: Record<string, any>, context: AgentExecutionContext) => Promise<AgentToolResult>;
}

export interface AgentToolResult {
  success: boolean;
  summary: string;
  data?: any;
  error?: string;
}

export interface AgentExecutionContext {
  dossier: any;
  memories: any[];
  missions: any[];
  intel: any[];
  battleLogs: any[];
  dispatchTelemetry: (entry: Omit<TelemetryLogEntry, 'id' | 'timestamp'>) => void;
  requestApproval: (task: AgentTaskNode, reason: string) => Promise<boolean>;
  onStateMutation?: (type: string, payload: any) => Promise<void>;
}
