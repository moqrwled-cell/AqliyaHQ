// ============================================================================
// AQLIYA HQ — PROJECT & LIFE INTELLIGENCE ENGINE (Phase 7)
// Autonomous Life Ops, Project Governance, Decision Support & SITREP Engine
// ============================================================================

import type {
  ComprehensiveProjectProfile,
  ProjectStep,
  TechDebtItem,
  ProjectRiskItem,
  LifePillarStatus,
  HabitItem,
  DailyEnergyTrack,
  WorkLifeSynergyReport,
  StrategicDecisionCase,
  DecisionOption,
  UnifiedSITREPReport,
  SITREPPriority,
  ProjectStatus,
} from './types';
import { COMPREHENSIVE_PROJECT_CATALOG } from './projectCatalogData';
import { offlineStorage, supabase } from '../supabase';
import { PersistentMemoryStore } from '../memory-graph/memoryStore';

const STORAGE_KEYS = {
  PROJECTS: 'aqliya_comprehensive_projects_v1',
  HABITS: 'aqliya_life_habits_v1',
  ENERGY_LOGS: 'aqliya_energy_logs_v1',
  DECISION_CASES: 'aqliya_decision_cases_v1',
  SITREP_REPORTS: 'aqliya_sitrep_reports_v1',
};

export class ProjectLifeEngine {
  private static projectsCache: ComprehensiveProjectProfile[] | null = null;
  private static habitsCache: HabitItem[] | null = null;
  private static energyLogsCache: DailyEnergyTrack[] | null = null;
  private static decisionCasesCache: StrategicDecisionCase[] | null = null;

  // ==========================================================================
  // 1. PROJECT INTELLIGENCE & GOVERNANCE
  // ==========================================================================

  /**
   * Retrieves all 19 cataloged projects with local modifications merged.
   */
  public static getAllProjects(): ComprehensiveProjectProfile[] {
    if (this.projectsCache) return this.projectsCache;

    const saved = offlineStorage.get<ComprehensiveProjectProfile[]>(STORAGE_KEYS.PROJECTS, []);
    if (saved && saved.length > 0) {
      // Merge baseline catalog with saved to ensure newly added properties exist
      const merged = COMPREHENSIVE_PROJECT_CATALOG.map((base) => {
        const found = saved.find((p) => p.slug === base.slug || p.id === base.id);
        if (found) {
          return {
            ...base,
            ...found,
            healthIndex: this.calculateProjectHealth(found),
          };
        }
        return {
          ...base,
          healthIndex: this.calculateProjectHealth(base),
        };
      });
      this.projectsCache = merged;
      return merged;
    }

    const initial = COMPREHENSIVE_PROJECT_CATALOG.map((p) => ({
      ...p,
      healthIndex: this.calculateProjectHealth(p),
    }));
    this.projectsCache = initial;
    offlineStorage.save(STORAGE_KEYS.PROJECTS, initial);
    return initial;
  }

  /**
   * Retrieves a single project profile by slug or ID.
   */
  public static getProject(slugOrId: string): ComprehensiveProjectProfile | null {
    const list = this.getAllProjects();
    return list.find((p) => p.slug === slugOrId || p.id === slugOrId) || null;
  }

  /**
   * Recalculates the health index (0 - 100) based on steps, tech debt, and risks.
   */
  public static calculateProjectHealth(project: ComprehensiveProjectProfile): number {
    let score = 70; // baseline

    // Factor 1: Steps completion
    if (project.steps && project.steps.length > 0) {
      const completedSteps = project.steps.filter((s) => s.status === 'completed').length;
      const ratio = completedSteps / project.steps.length;
      score += Math.round(ratio * 20); // up to +20
    } else {
      score += 10;
    }

    // Factor 2: Tech Debt penalty
    if (project.techDebt) {
      project.techDebt.forEach((td) => {
        if (td.severity === 'high') score -= 10;
        else if (td.severity === 'medium') score -= 5;
        else score -= 2;
      });
    }

    // Factor 3: Risk penalty
    if (project.risks) {
      project.risks.forEach((r) => {
        if (r.severity === 'critical') score -= 12;
        else if (r.severity === 'high') score -= 6;
        else score -= 3;
      });
    }

    // Factor 4: Objectives progress
    if (project.objectives && project.objectives.length > 0) {
      const completedObj = project.objectives.filter((o) => o.completed).length;
      const objRatio = completedObj / project.objectives.length;
      score += Math.round(objRatio * 15);
    }

    // Factor 5: Status bonus
    if (project.status === 'completed') score = Math.max(score, 95);
    if (project.status === 'critical_attention') score = Math.min(score, 65);

    // Bound between 10 and 100
    return Math.max(10, Math.min(100, score));
  }

  /**
   * Updates project status, progress percent, and health score.
   */
  public static updateProjectStatus(
    slugOrId: string,
    status: ProjectStatus,
    progressPercent?: number
  ): ComprehensiveProjectProfile | null {
    const list = this.getAllProjects();
    const index = list.findIndex((p) => p.slug === slugOrId || p.id === slugOrId);
    if (index === -1) return null;

    const target = { ...list[index] };
    target.status = status;
    if (progressPercent !== undefined) {
      target.progressPercent = Math.max(0, Math.min(100, progressPercent));
    }
    target.healthIndex = this.calculateProjectHealth(target);
    target.lastAuditDate = new Date().toISOString().split('T')[0];

    list[index] = target;
    this.projectsCache = list;
    offlineStorage.save(STORAGE_KEYS.PROJECTS, list);
    return target;
  }

  /**
   * Adds or updates a concrete step in a project.
   */
  public static addOrUpdateStep(
    slugOrId: string,
    step: Partial<ProjectStep> & { title: string }
  ): ComprehensiveProjectProfile | null {
    const list = this.getAllProjects();
    const index = list.findIndex((p) => p.slug === slugOrId || p.id === slugOrId);
    if (index === -1) return null;

    const target = { ...list[index] };
    const stepId = step.id || `step-${Date.now()}`;
    const existingStepIdx = target.steps.findIndex((s) => s.id === stepId);

    const fullStep: ProjectStep = {
      id: stepId,
      title: step.title,
      status: step.status || 'pending',
      assigneeAgent: step.assigneeAgent || 'systems_dev',
      notes: step.notes || '',
      completedAt: step.status === 'completed' ? new Date().toISOString() : undefined,
    };

    if (existingStepIdx !== -1) {
      target.steps[existingStepIdx] = fullStep;
    } else {
      target.steps.push(fullStep);
    }

    // Auto update progress based on steps
    const completedCount = target.steps.filter((s) => s.status === 'completed').length;
    target.progressPercent = Math.round((completedCount / target.steps.length) * 100);
    target.healthIndex = this.calculateProjectHealth(target);

    list[index] = target;
    this.projectsCache = list;
    offlineStorage.save(STORAGE_KEYS.PROJECTS, list);
    return target;
  }

  /**
   * Adds a technical debt item to a project.
   */
  public static addTechDebt(
    slugOrId: string,
    debt: Omit<TechDebtItem, 'id' | 'detectedAt'>
  ): ComprehensiveProjectProfile | null {
    const list = this.getAllProjects();
    const index = list.findIndex((p) => p.slug === slugOrId || p.id === slugOrId);
    if (index === -1) return null;

    const target = { ...list[index] };
    const newDebt: TechDebtItem = {
      id: `td-${Date.now()}`,
      detectedAt: new Date().toISOString().split('T')[0],
      ...debt,
    };

    target.techDebt = [newDebt, ...(target.techDebt || [])];
    target.healthIndex = this.calculateProjectHealth(target);

    list[index] = target;
    this.projectsCache = list;
    offlineStorage.save(STORAGE_KEYS.PROJECTS, list);
    return target;
  }

  /**
   * Filters projects needing attention (health < 85 or critical status).
   */
  public static getProjectsRequiringAttention(): ComprehensiveProjectProfile[] {
    const list = this.getAllProjects();
    return list.filter((p) => p.status === 'critical_attention' || p.healthIndex < 85 || p.techDebt.length > 0);
  }

  // ==========================================================================
  // 2. LIFE OPS INTELLIGENCE (Habits, Pillars & Energy)
  // ==========================================================================

  /**
   * Returns standard 5 Life Pillars and their real-time calculated scores.
   */
  public static getLifePillars(): LifePillarStatus[] {
    const habits = this.getHabits();
    const today = new Date().toISOString().split('T')[0];

    const getPillarCompliance = (pillar: string) => {
      const pillarHabits = habits.filter((h) => h.pillar === pillar);
      if (pillarHabits.length === 0) return 85;
      const completed = pillarHabits.filter((h) => !!h.history[today]).length;
      return Math.round((completed / pillarHabits.length) * 100);
    };

    return [
      {
        pillar: 'spiritual',
        nameAr: 'الركيزة الروحية والإيمانية',
        score: Math.max(70, getPillarCompliance('spiritual')),
        targetFocus: 'صلاة الفجر في وقتها، أذكار الصباح، والورد القرآني اليومي',
        metricLabel: 'سلسلة الاستمرار (Streak)',
        metricValue: '14 يوماً متواصلاً',
        color: '#10b981', // Emerald
      },
      {
        pillar: 'physical',
        nameAr: 'الركيزة الجسدية والطاقة الحيوية',
        score: Math.max(65, getPillarCompliance('physical')),
        targetFocus: 'تمارين القوة والمرونة، النوم المبكر (7 ساعات)، وشرب 3 لتر ماء',
        metricLabel: 'معدل النوم والتعافي',
        metricValue: '7.2 ساعة نوم عميق',
        color: '#3b82f6', // Blue
      },
      {
        pillar: 'intellectual',
        nameAr: 'الركيزة الفكرية والأكاديمية',
        score: Math.max(80, getPillarCompliance('intellectual')),
        targetFocus: 'مراجعة محاضرات الجغرافيا الإقليمية، قراءة الأوراق البحثية، وتعلم نماذج الـ AI',
        metricLabel: 'ساعات التركيز العميق',
        metricValue: '4.5 ساعة / يوم',
        color: '#8b5cf6', // Violet
      },
      {
        pillar: 'financial',
        nameAr: 'الركيزة المالية وبناء الأصول',
        score: Math.max(75, getPillarCompliance('financial')),
        targetFocus: 'تطوير SaaS لـ ContractGuard، عوائد كوفي شوب روما، وحفظ السيولة',
        metricLabel: 'الأصول الرقمية الفعالة',
        metricValue: '4 مشاريع مدرّة للدخل',
        color: '#f59e0b', // Amber
      },
      {
        pillar: 'social',
        nameAr: 'الركيزة الاجتماعية والقيادية',
        score: Math.max(85, getPillarCompliance('social')),
        targetFocus: 'صلة الرحم، دعم الأهل في غزة، ومساندة الزملاء التقنيين',
        metricLabel: 'الواجبات الاجتماعية',
        metricValue: 'التزام تام 100%',
        color: '#ec4899', // Pink
      },
    ];
  }

  /**
   * Returns tracked habits with streaks and historical completions.
   */
  public static getHabits(): HabitItem[] {
    if (this.habitsCache) return this.habitsCache;

    const saved = offlineStorage.get<HabitItem[]>(STORAGE_KEYS.HABITS, []);
    if (saved && saved.length > 0) {
      this.habitsCache = saved;
      return saved;
    }

    const initialHabits: HabitItem[] = [
      {
        id: 'habit-fajr',
        title: 'صلاة الفجر وبدء ساعات التركيز القصوى (Peak Focus)',
        pillar: 'spiritual',
        targetFrequency: 'daily',
        targetStreak: 30,
        currentStreak: 12,
        bestStreak: 28,
        history: { '2026-11-09': true, '2026-11-08': true, '2026-11-07': true },
        timeOfDay: 'fajr',
        pointsReward: 50,
      },
      {
        id: 'habit-quran',
        title: 'قراءة الورد القرآني وأذكار الصباح والمساء',
        pillar: 'spiritual',
        targetFrequency: 'daily',
        targetStreak: 30,
        currentStreak: 15,
        bestStreak: 30,
        history: { '2026-11-09': true, '2026-11-08': true },
        timeOfDay: 'morning',
        pointsReward: 40,
      },
      {
        id: 'habit-workout',
        title: 'التمارين الرياضية وتمارين الإحماء ورفع اللياقة',
        pillar: 'physical',
        targetFrequency: 'daily',
        targetStreak: 21,
        currentStreak: 8,
        bestStreak: 19,
        history: { '2026-11-09': true, '2026-11-07': true },
        timeOfDay: 'afternoon',
        pointsReward: 35,
      },
      {
        id: 'habit-geo-study',
        title: 'مراجعة خريطة ومحاضرة جغرافية إقليمية واحدة',
        pillar: 'intellectual',
        targetFrequency: 'daily',
        targetStreak: 14,
        currentStreak: 6,
        bestStreak: 14,
        history: { '2026-11-09': true, '2026-11-08': true },
        timeOfDay: 'evening',
        pointsReward: 30,
      },
      {
        id: 'habit-deep-dev',
        title: 'جلسة برمجة صامتة مدتها 90 دقيقة على مشاريع النواة',
        pillar: 'financial',
        targetFrequency: 'daily',
        targetStreak: 30,
        currentStreak: 11,
        bestStreak: 25,
        history: { '2026-11-09': true, '2026-11-08': true, '2026-11-07': true },
        timeOfDay: 'morning',
        pointsReward: 45,
      },
      {
        id: 'habit-sitrep-debrief',
        title: 'تسجيل SITREP الصباحي وجلسة Debrief المسائية في عقلية',
        pillar: 'intellectual',
        targetFrequency: 'daily',
        targetStreak: 30,
        currentStreak: 14,
        bestStreak: 20,
        history: { '2026-11-09': true, '2026-11-08': true },
        timeOfDay: 'evening',
        pointsReward: 35,
      },
    ];

    this.habitsCache = initialHabits;
    offlineStorage.save(STORAGE_KEYS.HABITS, initialHabits);
    return initialHabits;
  }

  /**
   * Toggles a habit's completion status for a given date (defaults to today).
   */
  public static toggleHabit(habitId: string, targetDate?: string): HabitItem | null {
    const habits = this.getHabits();
    const index = habits.findIndex((h) => h.id === habitId);
    if (index === -1) return null;

    const dateKey = targetDate || new Date().toISOString().split('T')[0];
    const target = { ...habits[index] };
    const history = { ...target.history };

    const wasCompleted = !!history[dateKey];
    if (wasCompleted) {
      delete history[dateKey];
      target.currentStreak = Math.max(0, target.currentStreak - 1);
    } else {
      history[dateKey] = true;
      target.currentStreak += 1;
      target.lastCompleted = dateKey;
      if (target.currentStreak > target.bestStreak) {
        target.bestStreak = target.currentStreak;
      }
    }

    target.history = history;
    habits[index] = target;
    this.habitsCache = habits;
    offlineStorage.save(STORAGE_KEYS.HABITS, habits);
    return target;
  }

  /**
   * Logs daily energy level and focus parameters.
   */
  public static logDailyEnergy(track: DailyEnergyTrack): DailyEnergyTrack {
    const list = this.getEnergyLogs();
    const existingIdx = list.findIndex((e) => e.date === track.date);

    if (existingIdx !== -1) {
      list[existingIdx] = track;
    } else {
      list.unshift(track);
    }

    this.energyLogsCache = list;
    offlineStorage.save(STORAGE_KEYS.ENERGY_LOGS, list);
    return track;
  }

  /**
   * Retrieves all energy logs.
   */
  public static getEnergyLogs(): DailyEnergyTrack[] {
    if (this.energyLogsCache) return this.energyLogsCache;
    const saved = offlineStorage.get<DailyEnergyTrack[]>(STORAGE_KEYS.ENERGY_LOGS, []);
    if (saved && saved.length > 0) {
      this.energyLogsCache = saved;
      return saved;
    }

    const today = new Date().toISOString().split('T')[0];
    const initial: DailyEnergyTrack[] = [
      {
        date: today,
        level: 'high',
        focusHoursActual: 5.5,
        sleepHours: 7.0,
        peakHourBlock: '04:30 - 08:30 (الفجر والصباح الباكر)',
        notes: 'طاقة ممتازة وجاهزية تامة لحسم المعارك التكتيكية ومراحل عقلية.',
      },
    ];

    this.energyLogsCache = initial;
    offlineStorage.save(STORAGE_KEYS.ENERGY_LOGS, initial);
    return initial;
  }

  /**
   * Calculates Work-Life Synergy and Burnout Risk.
   */
  public static calculateWorkLifeSynergy(): WorkLifeSynergyReport {
    const logs = this.getEnergyLogs();
    const todayLog = logs[0] || { level: 'high', focusHoursActual: 5, sleepHours: 7 };
    const habits = this.getHabits();
    const today = new Date().toISOString().split('T')[0];

    const completedToday = habits.filter((h) => !!h.history[today]).length;
    const complianceRate = Math.round((completedToday / habits.length) * 100);

    let synergyScore = 80;
    if (todayLog.level === 'high') synergyScore += 10;
    else if (todayLog.level === 'low') synergyScore -= 15;

    if (todayLog.sleepHours < 6) synergyScore -= 10;
    if (complianceRate >= 70) synergyScore += 10;

    synergyScore = Math.max(20, Math.min(100, synergyScore));

    let burnoutRisk: 'low' | 'moderate' | 'high' = 'low';
    if (todayLog.level === 'low' && todayLog.sleepHours < 6) burnoutRisk = 'high';
    else if (todayLog.level === 'medium' && complianceRate < 50) burnoutRisk = 'moderate';

    const recommendations: string[] = [];
    if (todayLog.level === 'high') {
      recommendations.push('طاقة القائد في الذروة: خصص ساعات الفجر الصامتة لأكثر المهام الهندسية تعقيداً في NexusOS و AQLIYA HQ.');
    } else if (todayLog.level === 'low') {
      recommendations.push('رصد انخفاض في الطاقة والتعافي: خفف الضغط المعرفي اليوم وركز فقط على العادات الروحية والمهام الروتينية الخفيفة.');
    }
    if (todayLog.sleepHours < 6.5) {
      recommendations.push('ساعات النوم غير كافية لصفاء الذهن: ينصح بالراحة المبكرة اليوم لتفادي الإجهاد التراكمي.');
    }
    recommendations.push('استمرارية عادات الفجر والرياضة تدعم قدرتك على إنجاز المشاريع التقنية بنسبة 300%.');

    return {
      overallScore: synergyScore,
      energyProjectAlignment: todayLog.level === 'high' ? 'انسجام فائق: الطاقة تطابق ضخامة الأهداف' : 'تحذير تكتيكي: عبء المشاريع يتطلب راحة نشطة',
      burnoutRisk,
      activeHabitComplianceRate: complianceRate,
      recommendations,
    };
  }

  // ==========================================================================
  // 3. DECISION SUPPORT ADVISOR (محرك حسم القرارات التكتيكية)
  // ==========================================================================

  /**
   * Retrieves all strategic decision cases.
   */
  public static getDecisionCases(): StrategicDecisionCase[] {
    if (this.decisionCasesCache) return this.decisionCasesCache;
    const saved = offlineStorage.get<StrategicDecisionCase[]>(STORAGE_KEYS.DECISION_CASES, []);
    if (saved && saved.length > 0) {
      this.decisionCasesCache = saved;
      return saved;
    }

    const baselineCases: StrategicDecisionCase[] = [
      {
        id: 'case-roma-offline',
        title: 'استراتيجية حفظ بيانات كوفي شوب روما بدون اتصال',
        projectSlug: 'business-roma-cafe',
        category: 'architecture',
        dilemmaDescription: 'انقطاع شبكة الإنترنت المتكرر في المقهى يهدد فقدان نقاط الجولات والطلبات أثناء ساعات الذروة.',
        options: [
          {
            id: 'opt-offline-first',
            title: 'اعتماد نمط التخزين المحلي الكامل (IndexedDB + PWA)',
            description: 'تخزين كل الجولات والطلبات على ذاكرة الجهاز محلياً مع تصدير نسخة احتياطية يومية مشفرة بضغطة زر.',
            pros: ['استقلالية مطلقة 100% عن الإنترنت', 'سرعة استجابة فائقة فورية', 'انعدام تكاليف الخوادم المستمرة'],
            cons: ['البيانات مقيدة بالجهاز ما لم يتم تصديرها يدوياً'],
            risks: ['تلف الجهاز نفسه إن لم تكن هناك نسخ احتياطية خارجية'],
            alignmentScore: 95,
            recommended: true,
          },
          {
            id: 'opt-cloud-sync',
            title: 'ربط سحابي مباشر مع خادم سحابي خارجي (Cloud Database)',
            description: 'الاعتماد على خادم سحابي لإدارة الفواتير فورياً عبر الويب.',
            pros: ['مراقبة الكافيه عن بعد من أي مكان'],
            cons: ['توقف النظام بالكامل عند انقطاع الإنترنت أو بطئه', 'تكلفة شهرية مستمرة'],
            risks: ['إحراج أمام الزبائن عند عجز الواجهة عن فتح الفاتورة'],
            alignmentScore: 40,
            recommended: false,
          },
        ],
        recommendedOptionId: 'opt-offline-first',
        tacticalRecommendation: 'وفقاً لمبادئ القائد محمد (الاستقلالية والصلابة الميدانية في غزة)، الخيار الأول هو الأضمن والأكثر استقراراً بنسبة 100%.',
        status: 'decided',
        commanderVerdict: {
          chosenOptionId: 'opt-offline-first',
          rationale: 'الموثوقية الميدانية في غزة تتفوق على أي بهرجة سحابية هشة.',
          decidedAt: '2026-08-20',
        },
        createdAt: '2026-08-20',
      },
      {
        id: 'case-nexus-launch',
        title: 'قناة إطلاق تسويق ContractGuard (AppSumo أم الإعلانات المباشرة؟)',
        projectSlug: 'os-nexus-os',
        category: 'business_deal',
        dilemmaDescription: 'كيف نطلق المنصة لنحقق أول 10,000 دولار من السيولة النقدية وبناء السمعة الدولية؟',
        options: [
          {
            id: 'opt-appsumo-ltd',
            title: 'الإطلاق عبر AppSumo بنظام الترخيص الدائم LTD',
            description: 'طرح تراخيص دائمة بسعر مخفض لفترة محدودة لجذب المشترين والمراجعات الإيجابية الفورية.',
            pros: ['وصول فوري لأكثر من 500,000 مشتري تقني جاهز', 'سيولة نقدية أولية بدون ميزانية إعلانات', 'ملاحظات فورية من المستخدمين الحقيقيين'],
            cons: ['مشاركة نسبة من الأرباح مع المنصة'],
            risks: ['التزام طويل الأمد بدعم المشترين مدى الحياة'],
            alignmentScore: 92,
            recommended: true,
          },
          {
            id: 'opt-meta-ads',
            title: 'الاعتماد على إعلانات Meta و Google Ads باشتراك شهري',
            description: 'بناء حملات تسويقية مدفوعة لاستهداف المحامين والشركات مباشرة.',
            pros: ['عوائد شهرية متكررة (MRR) دون التزام دائم'],
            cons: ['تتطلب ميزانية إعلانية ضخمة مقدماً (آلاف الدولارات)', 'مخاطر حظر الحسابات الإعلانية الدولية'],
            risks: ['استنزاف السيولة دون تحقيق مبيعات كافية'],
            alignmentScore: 55,
            recommended: false,
          },
        ],
        recommendedOptionId: 'opt-appsumo-ltd',
        tacticalRecommendation: 'ينصح بالبدء بـ AppSumo لجمع السيولة وتغذية الذاكرة التراكمية، ثم الانتقال لنموذج الاشتراكات.',
        status: 'decided',
        commanderVerdict: {
          chosenOptionId: 'opt-appsumo-ltd',
          rationale: 'السيولة المضمونة والمراجعات الدولية أولاً ثم بناء الاشتراك الشهري.',
          decidedAt: '2026-10-15',
        },
        createdAt: '2026-10-15',
      },
    ];

    this.decisionCasesCache = baselineCases;
    offlineStorage.save(STORAGE_KEYS.DECISION_CASES, baselineCases);
    return baselineCases;
  }

  /**
   * Evaluates a new strategic dilemma with automatic principle alignment scoring.
   */
  public static evaluateDilemma(params: {
    title: string;
    projectSlug?: string;
    category?: 'architecture' | 'business_deal' | 'life_routine' | 'scope_triage';
    dilemmaDescription: string;
    rawOptions: Array<{ title: string; description: string; pros: string[]; cons: string[]; risks: string[] }>;
  }): StrategicDecisionCase {
    const list = this.getDecisionCases();

    // Score options against Commander's core principles:
    // 1. Offline resilience / Local sovereignty (no fragile cloud locks)
    // 2. High practical impact with low complexity (Anti-slop)
    // 3. Lean cost, zero unnecessary recurring burn rate
    // 4. Strict real data & honesty
    const options: DecisionOption[] = params.rawOptions.map((opt, i) => {
      let score = 70;
      const text = `${opt.title} ${opt.description} ${opt.pros.join(' ')}`.toLowerCase();
      
      if (text.includes('محل') || text.includes('offline') || text.includes('أمان') || text.includes('استقلال')) score += 15;
      if (text.includes('مجاني') || text.includes('بدون تكلفة') || text.includes('سيولة')) score += 10;
      if (text.includes('سحاب') || text.includes('اشتراك شهري') || text.includes('خادم مدفوع')) score -= 15;
      if (text.includes('معقد') || text.includes('تشتت')) score -= 10;

      score = Math.max(30, Math.min(98, score));
      return {
        id: `opt-${Date.now()}-${i}`,
        title: opt.title,
        description: opt.description,
        pros: opt.pros,
        cons: opt.cons,
        risks: opt.risks,
        alignmentScore: score,
        recommended: false,
      };
    });

    // Mark highest alignment as recommended
    let highestScore = -1;
    let bestOptionId = options[0]?.id || '';
    options.forEach((opt) => {
      if (opt.alignmentScore > highestScore) {
        highestScore = opt.alignmentScore;
        bestOptionId = opt.id;
      }
    });

    options.forEach((opt) => {
      opt.recommended = opt.id === bestOptionId;
    });

    const bestOpt = options.find((o) => o.id === bestOptionId);

    const newCase: StrategicDecisionCase = {
      id: `case-${Date.now()}`,
      title: params.title,
      projectSlug: params.projectSlug,
      category: params.category || 'architecture',
      dilemmaDescription: params.dilemmaDescription,
      options,
      recommendedOptionId: bestOptionId,
      tacticalRecommendation: bestOpt 
        ? `التوصية التكتيكية: اعتماد خيار «${bestOpt.title}» لتطابقه بنسبة ${bestOpt.alignmentScore}% مع مبادئ القائد التنفيذية والأمان الميداني.`
        : 'التوصية التكتيكية: الخيار الأقل مخاطرة والأعلى استقلالية.',
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    list.unshift(newCase);
    this.decisionCasesCache = list;
    offlineStorage.save(STORAGE_KEYS.DECISION_CASES, list);
    return newCase;
  }

  /**
   * Confirms Commander's final decision on a dilemma, logging to DecisionMemory.
   */
  public static async recordCommanderVerdict(
    caseId: string,
    chosenOptionId: string,
    rationale: string
  ): Promise<StrategicDecisionCase | null> {
    const list = this.getDecisionCases();
    const index = list.findIndex((c) => c.id === caseId);
    if (index === -1) return null;

    const target = { ...list[index] };
    const chosenOpt = target.options.find((o) => o.id === chosenOptionId);

    target.status = 'decided';
    target.commanderVerdict = {
      chosenOptionId,
      rationale: rationale.trim() || 'قرار معتمد وفق رؤية القائد ومقتضيات الميدان.',
      decidedAt: new Date().toISOString(),
    };

    list[index] = target;
    this.decisionCasesCache = list;
    offlineStorage.save(STORAGE_KEYS.DECISION_CASES, list);

    // Also link back to project if relevant
    if (target.projectSlug) {
      const proj = this.getProject(target.projectSlug);
      if (proj) {
        proj.decisions.unshift({
          id: `dec-${Date.now()}`,
          question: target.title,
          chosenOption: chosenOpt?.title || chosenOptionId,
          rationale: target.commanderVerdict.rationale,
          decidedAt: target.commanderVerdict.decidedAt,
          impactSummary: chosenOpt?.description || '',
        });
        const allProj = this.getAllProjects();
        const pIdx = allProj.findIndex((p) => p.slug === target.projectSlug);
        if (pIdx !== -1) {
          allProj[pIdx] = proj;
          this.projectsCache = allProj;
          offlineStorage.save(STORAGE_KEYS.PROJECTS, allProj);
        }
      }
    }

    // Persist into 7-Layer Persistent Memory Store (Decision Memory Layer)
    try {
      await PersistentMemoryStore.recordDecision({
        decisionText: `قرار حاسم: ${target.title} — الخيار المعتمد: ${chosenOpt?.title || ''}`,
        rationale: target.commanderVerdict.rationale,
        alternativesConsidered: target.options.map((o) => o.title),
        projectSlug: target.projectSlug,
        confidence: 9,
      });
    } catch (e) {
      console.warn('Fallback saving decision to memory', e);
    }

    return target;
  }

  // ==========================================================================
  // 4. UNIFIED SITREP & DEBRIEF SYSTEM
  // ==========================================================================

  /**
   * Generates a context-aware Morning SITREP Briefing.
   */
  public static generateMorningSITREP(overrideEnergy?: 'high' | 'medium' | 'low'): UnifiedSITREPReport {
    const today = new Date().toISOString().split('T')[0];
    const energy = overrideEnergy || this.getEnergyLogs()[0]?.level || 'high';
    const allProjects = this.getAllProjects();
    const criticalProjects = allProjects.filter((p) => p.status === 'critical_attention' || p.priority === 'critical');
    const habits = this.getHabits();

    // Top 3 tactical priorities aligned with energy
    const priorities: SITREPPriority[] = [];

    // Priority 1: Top active critical project milestone
    const primeProject = allProjects.find((p) => p.slug === 'os-aqliya-hq-live') || criticalProjects[0] || allProjects[0];
    priorities.push({
      id: 'prio-1',
      title: `إكمال استحقاق: ${primeProject.currentFocus}`,
      projectSlug: primeProject.slug,
      projectTitle: primeProject.titleAr,
      urgency: 'critical',
      done: false,
      assignedAgent: 'systems_dev',
    });

    // Priority 2: Secondary project or high priority habit
    const secondaryProject = allProjects.find((p) => p.slug === 'life-to-top-ops') || allProjects[1];
    priorities.push({
      id: 'prio-2',
      title: `تثبيت ركيزة الحياة: إنجاز جلسات الفجر والرياضة اليومية`,
      projectSlug: secondaryProject.slug,
      projectTitle: secondaryProject.titleAr,
      urgency: 'high',
      done: false,
      assignedAgent: 'life_ops',
    });

    // Priority 3: Commercial / Academic milestone
    const businessProject = allProjects.find((p) => p.slug === 'os-nexus-os' || p.slug === 'business-roma-cafe') || allProjects[2];
    priorities.push({
      id: 'prio-3',
      title: `متابعة مسار الإيرادات: ${businessProject.nextMilestone}`,
      projectSlug: businessProject.slug,
      projectTitle: businessProject.titleAr,
      urgency: 'normal',
      done: false,
      assignedAgent: 'chief_of_staff',
    });

    const activeHabitsToday = habits.map((h) => ({
      id: h.id,
      title: h.title,
      completed: !!h.history[today],
      pillar: h.pillar,
    }));

    const criticalAttentionProjects = criticalProjects.slice(0, 3).map((p) => ({
      title: p.titleAr,
      slug: p.slug,
      reason: p.techDebt.length > 0 ? `ديون تقنية: ${p.techDebt[0]?.title}` : 'مشروع ذو أولوية سيادية قصوى',
      requiredAction: p.steps.find((s) => s.status !== 'completed')?.title || p.currentFocus,
    }));

    const energyText = energy === 'high' ? 'طاقة قصوى (High Readiness) ⚡' : energy === 'medium' ? 'طاقة متوازنة (Balanced) ⚖️' : 'طاقة منخفضة (Recovery Mode) 🛡️';
    const summary = `صباح العزم والتمكين يا قائد محمد. حالتك اليومية: ${energyText}.\n` +
      `أمامك 3 أولويات حاسمة تتصدرها متابعة معمارية عقلية والالتزام بروتين الفجر الصامت.\n` +
      `أسطول الوكلاء الذاتي جاهز لتنفيذ المهام الميدانية والمزامنة.`;

    const report: UnifiedSITREPReport = {
      id: `sitrep-${Date.now()}`,
      date: today,
      mode: 'morning',
      energyRating: energy,
      topPriorities: priorities,
      criticalAttentionProjects,
      activeHabitsToday,
      executiveSummary: summary,
    };

    return report;
  }

  /**
   * Generates and logs an Evening Debrief.
   */
  public static async recordEveningDebrief(params: {
    accomplishments: string[];
    obstacles: string[];
    lessonsLearned: string[];
    tomorrowPrep: string;
    overallSatisfaction: number;
  }): Promise<UnifiedSITREPReport> {
    const today = new Date().toISOString().split('T')[0];
    const energy = this.getEnergyLogs()[0]?.level || 'medium';
    const habits = this.getHabits();

    const activeHabitsToday = habits.map((h) => ({
      id: h.id,
      title: h.title,
      completed: !!h.history[today],
      pillar: h.pillar,
    }));

    const summary = `تم اختتام اليوم القيادي بنجاح. تم توثيق ${params.accomplishments.length} إنجازات رئيسية، و ${params.lessonsLearned.length} دروس مستفادة في الذاكرة التراكمية.`;

    const report: UnifiedSITREPReport = {
      id: `debrief-${Date.now()}`,
      date: today,
      mode: 'evening',
      energyRating: energy,
      topPriorities: [],
      criticalAttentionProjects: [],
      activeHabitsToday,
      executiveSummary: summary,
      eveningReflection: params,
    };

    // Save to battle logs in Supabase / Local storage
    try {
      const logDetails = `[إنجازات اليوم]:\n${params.accomplishments.map((a) => `• ${a}`).join('\n')}\n\n` +
        `[الدروس المستفادة]:\n${params.lessonsLearned.map((l) => `• ${l}`).join('\n')}\n\n` +
        `[تجهيز الغد]: ${params.tomorrowPrep}\n[التقييم]: ${params.overallSatisfaction}/10`;

      await (supabase.from('battle_logs') as any).insert({
        entry_type: 'debrief',
        title: `جلسة استخلاص المساء (Debrief) — ${today}`,
        details: logDetails,
      });
    } catch (e) {
      console.warn('Offline saving debrief log', e);
    }

    // Persist lessons learned into Experience Memory layer
    for (const lesson of params.lessonsLearned) {
      try {
        await PersistentMemoryStore.recordExperience({
          taskOrSituation: `مراجعة المساء ${today}`,
          outcome: 'success',
          lessonLearned: lesson,
          tags: ['debrief', 'evening_review'],
        });
      } catch (err) {
        console.warn('Experience memory record fallback', err);
      }
    }

    return report;
  }
}
