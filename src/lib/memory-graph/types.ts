// ============================================================================
// AQLIYA PERSISTENT MEMORY & KNOWLEDGE GRAPH — CONTRACTS & TYPES
// ============================================================================

import type { AgentRole } from '../agentic-os/types';

export type MemoryLayer =
  | 'identity'     // 1. معلومات وهوية القائد ومبادئه وتفضيلاته
  | 'goals'        // 2. الأهداف الاستراتيجية والخطط المستقبلية
  | 'projects'     // 3. معلومات المشاريع وتفاصيلها وخطواتها كافة
  | 'decisions'    // 4. القرارات المتخذة وأسبابها والبدائل المرفوضة
  | 'experience'   // 5. التجارب، الأخطاء التقنية، والدروس المستفادة
  | 'operational'  // 6. الالتزامات اليومية وسجلات التنفيذ والمعارك
  | 'knowledge';   // 7. المعرفة، المصادر، الأبحاث، ووثائق أوبسيديان

export type MemoryProvenance = 
  | 'user_direct'       // تم إدخاله مباشرة من القائد محمد
  | 'interview_discovery' // استكشاف الذات وجلسات الاستجواب
  | 'agent_inference'   // استنتاج موثق من أحد الوكلاء الأذكياء
  | 'obsidian_sync'     // مستورد من مستودع أوبسيديان
  | 'code_audit'        // استخلاص من فحص الكود والأنظمة
  | 'git_commit';       // مستخرج من سجلات Git

export interface BaseMemoryEntry {
  id: string;
  layer: MemoryLayer;
  title: string;
  content: string;
  tags: string[];
  importance: number; // 1 إلى 10
  provenance: MemoryProvenance;
  sourceRef?: string; // رابط أو مسار الملف المصدري
  createdAt: string;
  updatedAt: string;
}

// 1. Identity Memory (معلومات المستخدم وتفضيلاته)
export interface IdentityMemoryEntry extends BaseMemoryEntry {
  layer: 'identity';
  aspect: 'profile' | 'core_skill' | 'peak_hours' | 'non_negotiable_principle' | 'habit' | 'constraint';
  confidenceScore: number; // 0.0 - 1.0
}

// 2. Goal Memory (الأهداف والخطط المستقبلية)
export interface GoalMemoryEntry extends BaseMemoryEntry {
  layer: 'goals';
  horizon: 'short_term_week' | 'medium_term_month' | 'strategic_year';
  status: 'active' | 'in_progress' | 'achieved' | 'paused';
  targetDate?: string;
  successMetric: string;
  associatedProjectIds: string[];
}

// 3. Project Memory (معلومات المشاريع وحالتها والخطوات كلها)
export interface ProjectStep {
  stepNumber: number;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  requiredTech?: string[];
  deliverable?: string;
}

export interface ProjectMemoryEntry extends BaseMemoryEntry {
  layer: 'projects';
  code: string;
  category: 'core_os' | 'business_cafe' | 'academics_geo' | 'productivity_life' | 'tools';
  progressPercent: number;
  currentFocus: string;
  nextOps: string;
  techStack: string[];
  steps: ProjectStep[]; // كافة خطوات التنفيذ التفصيلية
  knownErrorsAndTechDebt: string[]; // أخطاء معروفة وعقبات للمشروع
  obsidianFiles: string[];
  assignedAgent: AgentRole;
}

// 4. Decision Memory (القرارات وأسباب اتخاذها)
export interface DecisionMemoryEntry extends BaseMemoryEntry {
  layer: 'decisions';
  context: string;
  chosenOption: string;
  rejectedAlternatives: string[];
  rationale: string; // أسباب اتخاذ القرار
  associatedProjectId?: string;
  decisionPrinciplesApplied: string[]; // المبادئ التي تم الاستناد عليها
  outcome?: string; // النتيجة بعد التنفيذ
}

// 5. Experience Memory (التجارب والأخطاء والدروس المستفادة)
export interface ExperienceMemoryEntry extends BaseMemoryEntry {
  layer: 'experience';
  errorType: 'architectural_pitfall' | 'bug_failure' | 'process_mistake' | 'security_flaw';
  rootCause: string;
  resolution: string;
  preventiveRule: string; // قاعدة صارمة لمنع تكرار الخطأ
  associatedProjectId?: string;
}

// 6. Operational Memory (المهام والالتزامات وسجل التنفيذ)
export interface OperationalMemoryEntry extends BaseMemoryEntry {
  layer: 'operational';
  entryType: 'daily_brief' | 'debrief' | 'battle_log' | 'task_commitment';
  associatedProjectId?: string;
  energyLevel?: 'high' | 'medium' | 'low';
  resolvedAt?: string;
}

// 7. Knowledge Memory (المعلومات والمصادر والأبحاث)
export interface KnowledgeMemoryEntry extends BaseMemoryEntry {
  layer: 'knowledge';
  knowledgeType: 'solution_reel' | 'technical_doc' | 'architecture_pattern' | 'academic_lecture';
  keyTakeaways: string[];
  associatedProjectId?: string;
  externalUrl?: string;
  obsidianVaultPath?: string;
}

export type AnyMemoryEntry =
  | IdentityMemoryEntry
  | GoalMemoryEntry
  | ProjectMemoryEntry
  | DecisionMemoryEntry
  | ExperienceMemoryEntry
  | OperationalMemoryEntry
  | KnowledgeMemoryEntry;

// ============================================================================
// KNOWLEDGE GRAPH CONTRACTS
// ============================================================================

export type GraphNodeType = 
  | 'user' 
  | 'project' 
  | 'goal' 
  | 'task' 
  | 'decision' 
  | 'document' 
  | 'intel' 
  | 'agent' 
  | 'error_lesson';

export type GraphEdgeType = 
  | 'owns'              // المستخدم يملك الهدف أو المشروع
  | 'implements'        // المهمة تنفذ المشروع
  | 'depends_on'        // مهمة تعتمد على مهمة أو مخرج وكيل
  | 'decided_for'       // القرار اتُخذ من أجل مشروع
  | 'documents'         // المستند يوثق مشروعاً أو قراراً
  | 'solved_by'         // الخطأ أو المسألة حُلّت عبر درس مستفاد
  | 'monitored_by'      // المشروع يُراقب بواسطة وكيل
  | 'prevented_by';     // الخطأ يُمنع بواسطة قاعدة وقائية

export interface KnowledgeGraphNode {
  id: string;
  type: GraphNodeType;
  label: string;
  subLabel?: string;
  importance: number;
  metadata: Record<string, any>;
}

export interface KnowledgeGraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationship: GraphEdgeType;
  description?: string;
  weight: number;
}

export interface KnowledgeGraphData {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  lastIndexedAt: string;
}

// Search and Validation Results
export interface MemorySearchResult {
  entry: AnyMemoryEntry;
  matchScore: number;
  matchedField: 'title' | 'content' | 'tags' | 'step';
}

export interface DuplicateDetectionResult {
  isDuplicate: boolean;
  similarityScore: number;
  existingEntry?: AnyMemoryEntry;
  message: string;
}

export interface ConflictDetectionResult {
  hasConflict: boolean;
  conflictingEntry?: AnyMemoryEntry;
  reason: string;
}
