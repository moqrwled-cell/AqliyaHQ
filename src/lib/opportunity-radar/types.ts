// ============================================================================
// AQLIYA HQ — OPPORTUNITY RADAR & IDEA EVALUATION TYPES (Phase 8)
// ============================================================================

export type OpportunityPlatform = 
  | 'youtube' 
  | 'instagram' 
  | 'tiktok' 
  | 'twitter' 
  | 'github' 
  | 'web' 
  | 'manual';

export type OpportunityCategory = 
  | 'saas_product' 
  | 'local_business' 
  | 'dev_tool' 
  | 'workflow_automation' 
  | 'academic_intel';

export type OpportunityVerdict = 
  | 'critical_priority'    // فرصة حاسمة تستوجب التنفيذ الفوري (85 - 100)
  | 'promising_opportunity' // فرصة واعدة ذات جدوى عالية (70 - 84)
  | 'shelved_backlog'      // فكرة مقبولة لكن تؤجل لعدم ملاءمة التوقيت (50 - 69)
  | 'rejected';             // فكرة مرفوضة لا تناسب الواقع أو تشتت الجهود (< 50)

export type OpportunityStatus = 
  | 'unreviewed' 
  | 'evaluating' 
  | 'approved' 
  | 'converted_to_project' 
  | 'rejected';

export interface EvaluationCriteriaScores {
  valueScore: number;           // 0 - 100: القيمة الاستراتيجية والأثر الواقعي
  effortScore: number;          // 0 - 100: سهولة التنفيذ (100 = يسير، 0 = بالغ التعقيد)
  costScore: number;            // 0 - 100: انخفاض التكلفة (100 = صفر تكلفة، 0 = باهظ)
  riskScore: number;            // 0 - 100: درجة الأمان (100 = آمن جداً، 0 = عالي المخاطر)
  strategicFitScore: number;    // 0 - 100: الملاءمة مع رؤية القائد ومشاريع الـ 19
  timeToMarketScore: number;    // 0 - 100: سرعة الوصول للإنتاجية والنتيجة
  overallViabilityScore: number;// 0 - 100: المتوسط المرجح التكتيكي الكلي
  verdict: OpportunityVerdict;
  verdictRationale: string;     // التحليل المنطقي والعلّة التكتيكية
}

export interface IdeaOpportunity {
  id: string;
  title: string;
  rawSourceUrl?: string;
  platform: OpportunityPlatform;
  category: OpportunityCategory;
  problemSolved: string;        // المشكلة الحقيقية التي تحلها الفكرة
  targetBeneficiary: string;    // المستفيد النهائي أو الشريحة المستهدفة
  requiredResources: string[];  // الموارد والأدوات المطلوبة
  estimatedCost: string;        // التكلفة المالية التقديرية الحقيقية أو مجانية
  riskFactors: string[];        // المخاطر والتحديات الميدانية
  alternatives: string[];       // البدائل القائمة ولماذا هذه الفكرة أفضل
  evaluation: EvaluationCriteriaScores;
  linkedProjectSlug?: string;   // ربطها بأحد مشاريع القائد الـ 19
  status: OpportunityStatus;
  convertedProjectId?: string;
  notes?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface OpportunityRadarStats {
  totalOpportunities: number;
  criticalPriorityCount: number;
  promisingCount: number;
  convertedCount: number;
  rejectedCount: number;
  averageViabilityScore: number;
}
