// ============================================================================
// AQLIYA INTELLIGENCE CORE — CORE ARCHITECTURAL CONTRACTS & TYPES
// ============================================================================

import type { AgentRole } from '../agentic-os/types';
import type { Mission, IntelItem, CommanderDossier, CommanderMemory, StrategicDirective, BattleLog } from '../../types';

export type IntelligenceStage =
  | 'UNDERSTANDING'      // 1. فهم قصد القائد وطبيعة الطلب
  | 'CONTEXT_RETRIEVAL' // 2. استرجاع السياق المخصص بدقة
  | 'PLANNING'          // 3. تخطيط وتفكيك المهام وتحديد التبعيات
  | 'PERMISSION_CHECK'  // 4. فحص مستوى الصلاحيات والتأكد من الأمان
  | 'AGENT_ASSIGNMENT'  // 5. اختيار وتكليف الوكيل المختص
  | 'EXECUTION'         // 6. تشغيل الأدوات وتنفيذ المهام
  | 'VERIFICATION'      // 7. التحقق البرمجي التلقائي من المخرجات
  | 'FINAL_REPORT';     // 8. صياغة التقرير التنفيذي النهائي الموحد

export type RequestIntent =
  | 'strategic_planning'      // تخطيط استراتيجي وأهداف كبرى
  | 'code_engineering'        // بناء برمجي، كود، وهندسة أنظمة
  | 'intel_analysis'          // تحليل روابط، ريلز، ومصادر
  | 'safety_watchdog'         // فحص الركود، الأمان، والتنبيهات
  | 'life_ops_memory'         // روتين، طاقة، وتوثيق ذكريات
  | 'conversational_advisor'  // استشارة عامة وتوجيه تكتيكي
  | 'project_status_query';   // استعلام عن مشروع أو مهمة محددة

export type PermissionLevel =
  | 'read_only'       // استعلام وقراءة آمنة (لا يتطلب موافقة)
  | 'low_risk'       // تدوين ملاحظة أو سجل معركة (لا يتطلب موافقة)
  | 'medium_risk'    // تحديث نسبة إنجاز أو خطوة قادمة لمشروع
  | 'high_critical'; // إنشاء مشروع جديد، تعديل ملفات، أو حذف بيانات (يتطلب موافقة القائد صراحة)

export interface UserRequestPayload {
  id: string;
  rawInput: string;
  timestamp: string;
  conversationId?: string;
  associatedProjectId?: string;
  intent: RequestIntent;
  complexity: 'simple_conversational' | 'multi_step_task';
  targetAgent: AgentRole;
  currentStage: IntelligenceStage;
  permissionLevel: PermissionLevel;
  requiresHumanApproval: boolean;
}

export interface RetrievedContext {
  primaryProject: Mission | null;
  relevantMissions: Mission[];
  relevantIntel: IntelItem[];
  relevantMemories: CommanderMemory[];
  relevantDirectives: StrategicDirective[];
  dossier: CommanderDossier | null;
  contextSummary: string;
}

export interface CoreTaskPlan {
  id: string;
  title: string;
  description: string;
  assignedAgent: AgentRole;
  dependencies: string[];
  suggestedTool?: string;
  inputPayload?: Record<string, any>;
  permissionLevel: PermissionLevel;
  requiresApproval: boolean;
  status: 'pending' | 'in_progress' | 'waiting_approval' | 'completed' | 'failed';
  verificationCriteria: string;
  outputResult?: string;
  isVerified?: boolean;
}

export interface IntelligenceSessionState {
  sessionId: string;
  activeProjectId?: string;
  activeDirectiveId?: string;
  lastIntent?: RequestIntent;
  lastStage: IntelligenceStage;
  turnCount: number;
  history: Array<{
    userPrompt: string;
    agentSummary: string;
    stageReached: IntelligenceStage;
    timestamp: string;
  }>;
}

export interface IntelligenceProcessingResult {
  requestId: string;
  intent: RequestIntent;
  primaryAgent: AgentRole;
  stageLogs: Array<{
    stage: IntelligenceStage;
    message: string;
    timestamp: string;
    metadata?: any;
  }>;
  plan?: CoreTaskPlan[];
  requiresApproval: boolean;
  approvalTask?: CoreTaskPlan;
  verificationPassed: boolean;
  finalReportMarkdown: string;
  suggestedNextOps?: string;
}
