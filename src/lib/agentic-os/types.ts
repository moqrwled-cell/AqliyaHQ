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
  retryCount?: number;
  durationMs?: number;
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
  dispatchStrategy?: TaskDispatchStrategy;
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

// ============================================================================
// PHASE 4 ENHANCEMENTS: COMMUNICATION, DISPATCH, LOGS, & VERIFICATION
// ============================================================================

export type MessageType =
  | 'intel_request'
  | 'intel_response'
  | 'architecture_spec'
  | 'risk_assessment'
  | 'life_constraint'
  | 'synthesis_request'
  | 'final_report';

export interface AgentCommunicationMessage {
  id: string;
  sender: AgentRole;
  recipient: AgentRole | 'all';
  messageType: MessageType;
  title: string;
  payload: Record<string, any>;
  taskId?: string;
  timestamp: string;
}

export interface ExecutionLogEntry {
  id: string;
  taskId: string;
  agent: AgentRole;
  action: string;
  status: 'started' | 'success' | 'failed' | 'retrying' | 'waiting_approval';
  timestamp: string;
  durationMs?: number;
  retryCount?: number;
  error?: string;
  outputSnippet?: string;
}

export interface VerificationResult {
  isValid: boolean;
  confidence: number;
  checksPassed: string[];
  checksFailed: string[];
  reason: string;
  retrySuggested: boolean;
}

export type TaskDispatchStrategy = 
  | 'single_agent'         // إسناد أحادي لوكيل تخصصي دون تشغيل الأسطول (منع الهدر)
  | 'sequential_swarm'      // تشغيل متسلسل بحسب التبعيات
  | 'hierarchical_nexus';   // قيادة مركزية بإشراف Nexus وتوزيع مهام متعدد على الوكلاء

export interface AgentExecutionContext {
  dossier: any;
  memories: any[];
  missions: any[];
  intel: any[];
  battleLogs: any[];
  dispatchTelemetry: (entry: Omit<TelemetryLogEntry, 'id' | 'timestamp'>) => void;
  requestApproval: (task: AgentTaskNode, reason: string) => Promise<boolean>;
  onStateMutation?: (type: string, payload: any) => Promise<void>;
  sendMessage?: (msg: Omit<AgentCommunicationMessage, 'id' | 'timestamp'>) => void;
  getThreadMessages?: (taskId: string) => AgentCommunicationMessage[];
}
