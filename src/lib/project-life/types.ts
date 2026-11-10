// ============================================================================
// AQLIYA HQ — PROJECT & LIFE INTELLIGENCE TYPE DEFINITIONS (Phase 7)
// ============================================================================

export type ProjectCategory = 
  | 'business' 
  | 'tech_os' 
  | 'academics' 
  | 'life_ops' 
  | 'tools' 
  | 'general';

export type ProjectStatus = 
  | 'active' 
  | 'standby' 
  | 'completed' 
  | 'critical_attention';

export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low';

export interface ProjectObjective {
  id: string;
  title: string;
  completed: boolean;
  targetDate?: string;
  keyMetric?: string;
}

export interface ProjectStep {
  id: string;
  title: string;
  status: 'completed' | 'in_progress' | 'pending';
  assigneeAgent?: 'chief_of_staff' | 'systems_dev' | 'intel_scout' | 'watchdog_sentry' | 'life_ops';
  notes?: string;
  completedAt?: string;
}

export interface TechDebtItem {
  id: string;
  title: string;
  severity: 'high' | 'medium' | 'low';
  impact: string;
  remediation: string;
  detectedAt: string;
}

export interface ProjectRiskItem {
  id: string;
  risk: string;
  severity: 'critical' | 'high' | 'medium';
  probability: 'high' | 'medium' | 'low';
  mitigation: string;
}

export interface ProjectFileRef {
  name: string;
  type: 'plan' | 'task' | 'walkthrough' | 'lecture' | 'media' | 'doc';
  relativePath: string;
  preview?: string;
  sizeBytes?: number;
}

export interface ProjectDecisionLog {
  id: string;
  question: string;
  chosenOption: string;
  rationale: string;
  decidedAt: string;
  impactSummary: string;
}

export interface ComprehensiveProjectProfile {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  category: ProjectCategory;
  vaultFolder: string; // Relative to E:\Antigravity_Vault\Projects
  description: string;
  status: ProjectStatus;
  progressPercent: number; // 0 - 100
  priority: PriorityLevel;
  currentFocus: string;
  nextMilestone: string;
  objectives: ProjectObjective[];
  steps: ProjectStep[];
  techDebt: TechDebtItem[];
  risks: ProjectRiskItem[];
  failureModes: Array<{ scenario: string; prevention: string }>;
  decisions: ProjectDecisionLog[];
  files: ProjectFileRef[];
  healthIndex: number; // 0 - 100 calculated from steps, techDebt, and risks
  lastAuditDate: string;
}

// ----------------------------------------------------------------------------
// Life Ops Intelligence Types
// ----------------------------------------------------------------------------

export type LifePillar = 
  | 'spiritual' 
  | 'physical' 
  | 'intellectual' 
  | 'financial' 
  | 'social';

export interface LifePillarStatus {
  pillar: LifePillar;
  nameAr: string;
  score: number; // 0 - 100
  targetFocus: string;
  metricLabel: string;
  metricValue: string;
  color: string;
}

export interface HabitItem {
  id: string;
  title: string;
  pillar: LifePillar;
  targetFrequency: 'daily' | 'weekly';
  targetStreak: number;
  currentStreak: number;
  bestStreak: number;
  history: Record<string, boolean>; // 'YYYY-MM-DD': true
  lastCompleted?: string;
  timeOfDay?: 'fajr' | 'morning' | 'afternoon' | 'evening';
  pointsReward: number;
}

export interface DailyEnergyTrack {
  date: string; // 'YYYY-MM-DD'
  level: 'high' | 'medium' | 'low';
  focusHoursActual: number;
  sleepHours: number;
  notes?: string;
  peakHourBlock?: string; // e.g., '04:30 - 08:30 (الفجر)'
}

export interface WorkLifeSynergyReport {
  overallScore: number;
  energyProjectAlignment: string;
  burnoutRisk: 'low' | 'moderate' | 'high';
  activeHabitComplianceRate: number; // percentage
  recommendations: string[];
}

// ----------------------------------------------------------------------------
// Decision Support Advisor Types
// ----------------------------------------------------------------------------

export interface DecisionOption {
  id: string;
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  risks: string[];
  alignmentScore: number; // 0 - 100 with Commander principles
  recommended: boolean;
}

export interface StrategicDecisionCase {
  id: string;
  title: string;
  projectSlug?: string;
  category: 'architecture' | 'business_deal' | 'life_routine' | 'scope_triage';
  dilemmaDescription: string;
  options: DecisionOption[];
  recommendedOptionId: string;
  tacticalRecommendation: string;
  commanderVerdict?: {
    chosenOptionId: string;
    rationale: string;
    decidedAt: string;
  };
  status: 'open' | 'decided' | 'shelved';
  createdAt: string;
}

// ----------------------------------------------------------------------------
// Unified SITREP & Debrief Types
// ----------------------------------------------------------------------------

export interface SITREPPriority {
  id: string;
  title: string;
  projectSlug?: string;
  projectTitle?: string;
  urgency: 'critical' | 'high' | 'normal';
  done: boolean;
  assignedAgent?: string;
}

export interface UnifiedSITREPReport {
  id: string;
  date: string;
  mode: 'morning' | 'evening';
  energyRating: 'high' | 'medium' | 'low';
  topPriorities: SITREPPriority[];
  criticalAttentionProjects: Array<{
    title: string;
    slug: string;
    reason: string;
    requiredAction: string;
  }>;
  activeHabitsToday: Array<{
    id: string;
    title: string;
    completed: boolean;
    pillar: LifePillar;
  }>;
  executiveSummary: string;
  eveningReflection?: {
    accomplishments: string[];
    obstacles: string[];
    lessonsLearned: string[];
    tomorrowPrep: string;
    overallSatisfaction: number; // 1-10
  };
}
