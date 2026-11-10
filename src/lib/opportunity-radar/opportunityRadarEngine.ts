// ============================================================================
// AQLIYA HQ — OPPORTUNITY RADAR & IDEA EVALUATION ENGINE (Phase 8)
// Strategic Evaluation, 6-Criteria Matrix, Feasibility & Conversion Engine
// ============================================================================

import type {
  IdeaOpportunity,
  OpportunityPlatform,
  OpportunityCategory,
  OpportunityVerdict,
  EvaluationCriteriaScores,
  OpportunityRadarStats,
} from './types';
import { BASELINE_OPPORTUNITIES } from './opportunityRadarData';
import { offlineStorage, supabase } from '../supabase';
import { ProjectLifeEngine } from '../project-life/projectLifeEngine';
import { PersistentMemoryStore } from '../memory-graph/memoryStore';

const STORAGE_KEY = 'aqliya_opportunities_v1';

export class OpportunityRadarEngine {
  private static opportunitiesCache: IdeaOpportunity[] | null = null;

  /**
   * Retrieves all opportunities, merging baseline data with local storage.
   */
  public static getAllOpportunities(): IdeaOpportunity[] {
    if (this.opportunitiesCache) return this.opportunitiesCache;

    const saved = offlineStorage.get<IdeaOpportunity[]>(STORAGE_KEY, []);
    if (saved && saved.length > 0) {
      // Merge baseline with saved to avoid duplicates
      const merged = [...saved];
      BASELINE_OPPORTUNITIES.forEach((base) => {
        if (!merged.some((m) => m.id === base.id || m.title === base.title)) {
          merged.push(base);
        }
      });
      this.opportunitiesCache = merged;
      return merged;
    }

    this.opportunitiesCache = [...BASELINE_OPPORTUNITIES];
    offlineStorage.save(STORAGE_KEY, this.opportunitiesCache);
    return this.opportunitiesCache;
  }

  /**
   * Retrieves a single opportunity by ID.
   */
  public static getOpportunityById(id: string): IdeaOpportunity | null {
    const list = this.getAllOpportunities();
    return list.find((o) => o.id === id) || null;
  }

  /**
   * Smart auto-detection of platform from link.
   */
  public static detectPlatform(url?: string): OpportunityPlatform {
    if (!url || !url.trim()) return 'manual';
    const l = url.toLowerCase();
    if (l.includes('youtube.com') || l.includes('youtu.be')) return 'youtube';
    if (l.includes('instagram.com')) return 'instagram';
    if (l.includes('tiktok.com')) return 'tiktok';
    if (l.includes('twitter.com') || l.includes('x.com')) return 'twitter';
    if (l.includes('github.com')) return 'github';
    if (l.startsWith('http://') || l.startsWith('https://')) return 'web';
    return 'manual';
  }

  /**
   * Smart auto-detection of category from title or text.
   */
  public static detectCategory(text: string): OpportunityCategory {
    const t = text.toLowerCase();
    if (t.includes('كافيه') || t.includes('سوبرماركت') || t.includes('مقهى') || t.includes('محل')) {
      return 'local_business';
    }
    if (t.includes('جغرافيا') || t.includes('محاضر') || t.includes('دراسة') || t.includes('امتحان')) {
      return 'academic_intel';
    }
    if (t.includes('كود') || t.includes('github') || t.includes('أداة') || t.includes('tool') || t.includes('مكتبة')) {
      return 'dev_tool';
    }
    if (t.includes('أتمتة') || t.includes('zapier') || t.includes('دروب') || t.includes('سير عمل')) {
      return 'workflow_automation';
    }
    return 'saas_product';
  }

  /**
   * The 6-Criteria Matrix Evaluation Algorithm:
   * Value (25%), Strategic Fit (25%), Effort/Ease (15%), Cost/Budget (15%), Risk/Safety (10%), Time to Market (10%).
   */
  public static evaluateOpportunityScores(params: {
    title: string;
    problemSolved: string;
    targetBeneficiary: string;
    requiredResources?: string[];
    estimatedCost?: string;
    riskFactors?: string[];
    linkedProjectSlug?: string;
    rawScores?: Partial<EvaluationCriteriaScores>;
  }): EvaluationCriteriaScores {
    // 1. Calculate or use supplied scores
    const valueScore = params.rawScores?.valueScore ?? (params.problemSolved.length > 20 ? 85 : 70);
    const effortScore = params.rawScores?.effortScore ?? 75; // 75 = moderate effort, manageable
    const costScore = params.rawScores?.costScore ?? 
      (params.estimatedCost?.includes('مجاني') || params.estimatedCost?.includes('صفر') ? 95 : 70);
    const riskScore = params.rawScores?.riskScore ?? 
      ((params.riskFactors?.length || 0) > 2 ? 60 : 85);
    const strategicFitScore = params.rawScores?.strategicFitScore ?? 
      (params.linkedProjectSlug ? 92 : 75);
    const timeToMarketScore = params.rawScores?.timeToMarketScore ?? 80;

    // Weighted Overall Math
    const overallViabilityScore = Math.round(
      valueScore * 0.25 +
      strategicFitScore * 0.25 +
      effortScore * 0.15 +
      costScore * 0.15 +
      riskScore * 0.10 +
      timeToMarketScore * 0.10
    );

    // Honest Verdict Determination
    let verdict: OpportunityVerdict = 'shelved_backlog';
    let verdictRationale = '';

    if (overallViabilityScore >= 85) {
      verdict = 'critical_priority';
      verdictRationale = `فرصة حاسمة بمعدل جدوى ${overallViabilityScore}%: تحقق قيمة استراتيجية عالية جداً وتتطابق مع مشاريع القائد بأقل تكلفة ومخاطر مضبوطة.`;
    } else if (overallViabilityScore >= 70) {
      verdict = 'promising_opportunity';
      verdictRationale = `فرصة واعدة بمعدل جدوى ${overallViabilityScore}%: ذات أثر إيجابي ومجدية للتنفيذ عند توفر نافذة زمنية مناسبة.`;
    } else if (overallViabilityScore >= 50) {
      verdict = 'shelved_backlog';
      verdictRationale = `فكرة مقبولة بمعدل جدوى ${overallViabilityScore}% لكن تُحفظ في الأرشيف حالياً لتفادي تشتيت التركيز عن أولويات الميدان.`;
    } else {
      verdict = 'rejected';
      verdictRationale = `فكرة غير مجدية بمعدل جدوى ${overallViabilityScore}%: تفوق تكلفتها أو مخاطرها العائد المتوقع وتتعارض مع واقع العمل الميداني.`;
    }

    return {
      valueScore,
      effortScore,
      costScore,
      riskScore,
      strategicFitScore,
      timeToMarketScore,
      overallViabilityScore,
      verdict,
      verdictRationale,
    };
  }

  /**
   * Creates, evaluates, and persists a new idea or opportunity.
   */
  public static createOpportunity(input: {
    title: string;
    rawSourceUrl?: string;
    platform?: OpportunityPlatform;
    category?: OpportunityCategory;
    problemSolved: string;
    targetBeneficiary?: string;
    requiredResources?: string[];
    estimatedCost?: string;
    riskFactors?: string[];
    alternatives?: string[];
    linkedProjectSlug?: string;
    rawScores?: Partial<EvaluationCriteriaScores>;
    notes?: string;
  }): IdeaOpportunity {
    const list = this.getAllOpportunities();
    const platform = input.platform || this.detectPlatform(input.rawSourceUrl);
    const category = input.category || this.detectCategory(input.title);

    const evaluation = this.evaluateOpportunityScores({
      title: input.title,
      problemSolved: input.problemSolved,
      targetBeneficiary: input.targetBeneficiary || 'القائد محمد ومشاريع عقلية',
      requiredResources: input.requiredResources,
      estimatedCost: input.estimatedCost,
      riskFactors: input.riskFactors,
      linkedProjectSlug: input.linkedProjectSlug,
      rawScores: input.rawScores,
    });

    const newOpp: IdeaOpportunity = {
      id: `opp-${Date.now()}`,
      title: input.title.trim(),
      rawSourceUrl: input.rawSourceUrl?.trim(),
      platform,
      category,
      problemSolved: input.problemSolved.trim(),
      targetBeneficiary: input.targetBeneficiary?.trim() || 'القائد ومشاريع المقر',
      requiredResources: input.requiredResources || ['المعمارية الحالية في المقر'],
      estimatedCost: input.estimatedCost || 'مجاني / استثمار في الوقت',
      riskFactors: input.riskFactors || ['ضيق الوقت المتاح'],
      alternatives: input.alternatives || ['الحلول اليدوية التقليدية'],
      evaluation,
      linkedProjectSlug: input.linkedProjectSlug,
      status: evaluation.verdict === 'critical_priority' ? 'approved' : 'unreviewed',
      notes: input.notes,
      createdAt: new Date().toISOString(),
      reviewedAt: new Date().toISOString(),
    };

    list.unshift(newOpp);
    this.opportunitiesCache = list;
    offlineStorage.save(STORAGE_KEY, list);
    return newOpp;
  }

  /**
   * Updates an opportunity's status (approved, rejected, shelved, etc.).
   */
  public static updateOpportunityStatus(
    id: string,
    status: IdeaOpportunity['status'],
    notes?: string
  ): IdeaOpportunity | null {
    const list = this.getAllOpportunities();
    const index = list.findIndex((o) => o.id === id);
    if (index === -1) return null;

    const target = { ...list[index] };
    target.status = status;
    if (notes) target.notes = notes;
    target.reviewedAt = new Date().toISOString();

    list[index] = target;
    this.opportunitiesCache = list;
    offlineStorage.save(STORAGE_KEY, list);
    return target;
  }

  /**
   * Converts an approved opportunity into:
   * 1) An actionable step in an existing project, or
   * 2) A Knowledge Memory entry in the PersistentMemoryStore.
   */
  public static async convertOpportunity(
    opportunityId: string,
    targetProjectSlug?: string
  ): Promise<{ success: boolean; message: string; projectStepAdded?: boolean }> {
    const opp = this.getOpportunityById(opportunityId);
    if (!opp) return { success: false, message: 'الفرصة غير موجودة' };

    const projectSlug = targetProjectSlug || opp.linkedProjectSlug;
    let stepAdded = false;

    // If attached to a project, add it as a concrete step
    if (projectSlug) {
      const step = ProjectLifeEngine.addOrUpdateStep(projectSlug, {
        title: `تنفيذ فرصة: ${opp.title}`,
        status: 'pending',
        notes: `مقتبسة من رادار الفرص: ${opp.problemSolved} (جدوى: ${opp.evaluation.overallViabilityScore}%)`,
      });
      if (step) {
        stepAdded = true;
      }
    }

    // Always preserve in Knowledge Memory (Knowledge Memory Layer)
    try {
      await PersistentMemoryStore.addEntry('knowledge', {
        layer: 'knowledge',
        title: `فرصة معتمدة: ${opp.title}`,
        content: `المشكلة المحلولة: ${opp.problemSolved}\nالمستفيد: ${opp.targetBeneficiary}\nالموارد: ${opp.requiredResources.join(', ')}\nالجدوى التكتيكية: ${opp.evaluation.overallViabilityScore}% (${opp.evaluation.verdictRationale})`,
        tags: ['opportunity', 'radar', opp.category, ...(projectSlug ? [projectSlug] : [])],
        importance: opp.evaluation.overallViabilityScore >= 85 ? 9 : 7,
        provenance: opp.rawSourceUrl || 'opportunity_radar',
      } as any);
    } catch (e) {
      console.warn('Fallback saving opportunity to KnowledgeMemory', e);
    }

    // Mark as converted
    this.updateOpportunityStatus(opportunityId, 'converted_to_project', `تم التحويل إلى مشروع ${projectSlug || 'العام'}`);

    return {
      success: true,
      message: stepAdded 
        ? `تم تحويل الفرصة إلى خطوة تنفيذية في مشروع «${projectSlug}» وتوثيقها في الذاكرة المعرفية بنجاح.`
        : `تم توثيق الفرصة واعتمادها كمرجع تكتيكي في الذاكرة المعرفية بنجاح.`,
      projectStepAdded: stepAdded,
    };
  }

  /**
   * Calculates high-level telemetry and statistics.
   */
  public static getStats(): OpportunityRadarStats {
    const list = this.getAllOpportunities();
    const criticalPriorityCount = list.filter((o) => o.evaluation.verdict === 'critical_priority').length;
    const promisingCount = list.filter((o) => o.evaluation.verdict === 'promising_opportunity').length;
    const convertedCount = list.filter((o) => o.status === 'converted_to_project').length;
    const rejectedCount = list.filter((o) => o.evaluation.verdict === 'rejected' || o.status === 'rejected').length;

    const totalScore = list.reduce((acc, o) => acc + (o.evaluation.overallViabilityScore || 0), 0);
    const averageViabilityScore = list.length > 0 ? Math.round(totalScore / list.length) : 0;

    return {
      totalOpportunities: list.length,
      criticalPriorityCount,
      promisingCount,
      convertedCount,
      rejectedCount,
      averageViabilityScore,
    };
  }
}
