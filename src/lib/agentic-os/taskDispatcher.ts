// ============================================================================
// AQLIYA AGENTIC OS — TASK DISPATCHER
// ============================================================================

import type { AgenticPlanDAG, AgentTaskNode, AgentRole, TaskDispatchStrategy } from './types';
import { generatePlanDAGFromDirective } from './taskDAGEngine';

export class TaskDispatcher {
  /**
   * تحليل التوجيه واختيار استراتيجية التوزيع المناسبة
   * القاعدة الذهبية: منع هدر الموارد وعدم تشغيل الأسطول بأكمله إلا عند الحاجة الحقيقية
   */
  public static determineStrategy(directive: string): {
    strategy: TaskDispatchStrategy;
    primaryAgent: AgentRole;
    reason: string;
  } {
    const text = directive.trim().toLowerCase();

    // 1. فحص طلبات إطلاق المنتجات، المعماريات الكبرى، والفرص الإستراتيجية (تستدعي الأسطول المنظم)
    const isMultiAgentDirective = 
      (text.includes('saas') || text.includes('منتج') || text.includes('مشروع جديد') || text.includes('إطلاق') || text.includes('دراسة جدوى')) ||
      (text.includes('حلل فرصة') || text.includes('خطة استراتيجية') || text.includes('تأسيس منظومة')) ||
      (text.includes('تنسيق الأسطول') || text.includes('شامل'));

    if (isMultiAgentDirective) {
      return {
        strategy: 'hierarchical_nexus',
        primaryAgent: 'chief_of_staff',
        reason: 'توجيه متعدد التخصصات يتطلب تنسيقاً هرمياً بين الوكلاء تحت إشراف Nexus Orchestrator.',
      };
    }

    // 2. فحص المهام التخصصية الفردية (إسناد أحادي لمنع الهدر)
    // أ. البرمجة والأنظمة
    if (
      text.includes('كود') ||
      text.includes('برمجة') ||
      text.includes('دالة') ||
      text.includes('مكتبة') ||
      text.includes('معمارية الكود') ||
      text.includes('typescript') ||
      text.includes('sql') ||
      text.includes('bug') ||
      text.includes('خطأ برمج')
    ) {
      return {
        strategy: 'single_agent',
        primaryAgent: 'systems_dev',
        reason: 'مهمة برمجية تخصصية بحتة، تم توجيهها حصراً لمهندس الأنظمة Systems Architect دون استنزاف الأسطول.',
      };
    }

    // ب. الاستخبارات والرصد
    if (
      text.includes('رابط') ||
      text.includes('فيديو') ||
      text.includes('ريلز') ||
      text.includes('يوتيوب') ||
      text.includes('لخص المقال') ||
      text.includes('ابحث عن') ||
      text.includes('استطلع')
    ) {
      return {
        strategy: 'single_agent',
        primaryAgent: 'intel_scout',
        reason: 'مهمة استطلاعية واستخباراتية، تم توجيهها حصراً لوكيل الاستخبارات Depot Scout.',
      };
    }

    // ج. الرقابة واليقظة
    if (
      text.includes('ركود') ||
      text.includes('فحص المشاريع') ||
      text.includes('مخاطر') ||
      text.includes('أمان') ||
      text.includes('متأخرة') ||
      text.includes('تنبيه')
    ) {
      return {
        strategy: 'single_agent',
        primaryAgent: 'watchdog_sentry',
        reason: 'مهمة رقابية وتدقيق مخاطر، تم توجيهها لحارس اليقظة Sentry Watchdog.',
      };
    }

    // د. العمليات الحياتية والذاكرة
    if (
      text.includes('ذاكر') ||
      text.includes('سجل') ||
      text.includes('احفظ') ||
      text.includes('حفظ') ||
      text.includes('طاق') ||
      text.includes('روتين') ||
      text.includes('نوم') ||
      text.includes('رياضة') ||
      text.includes('صحت') ||
      text.includes('عادات') ||
      text.includes('تفضيل') ||
      text.includes('إرهاق')
    ) {
      return {
        strategy: 'single_agent',
        primaryAgent: 'life_ops',
        reason: 'مهمة رعاية شخصية وتوثيق ذاكرة، تم توجيهها لوكيل العمليات الحياتية Life Ops Warden.',
      };
    }

    // هـ. استشارة عامة أو قرار إداري -> قائد الأركان
    return {
      strategy: 'single_agent',
      primaryAgent: 'chief_of_staff',
      reason: 'استشارة استراتيجية وتوجيه قيادي، يتولاه قائد الأركان Nexus Orchestrator.',
    };
  }

  /**
   * توليد خطة DAG مضبوطة بالاعتماد على الاستراتيجية المحددة
   */
  public static async dispatchDirective(
    directive: string,
    context: {
      missions: any[];
      intel: any[];
      memories: any[];
      dossier?: any;
    }
  ): Promise<AgenticPlanDAG> {
    const { strategy, primaryAgent } = TaskDispatcher.determineStrategy(directive);
    const dagId = `dag-${Date.now()}`;

    // 1. في حالة الإسناد الفردي (Single Agent)
    if (strategy === 'single_agent') {
      const singleTask: AgentTaskNode = {
        id: 'task-1',
        title: `تنفيذ توجيه: ${directive.slice(0, 40)}...`,
        description: directive,
        assignedAgent: primaryAgent,
        dependencies: [],
        status: 'pending',
        requiresHumanApproval: false,
        executionLogs: [],
        createdAt: new Date().toISOString(),
      };

      return {
        id: dagId,
        commanderDirective: directive,
        dispatchStrategy: 'single_agent',
        tasks: [singleTask],
        overallStatus: 'idle',
        currentStepIndex: 0,
        totalTokensUsed: 350,
        createdAt: new Date().toISOString(),
      };
    }

    // 2. في حالة المسار التخصصي الكامل لإطلاق منتج SaaS أو خطة متكاملة
    if (directive.toLowerCase().includes('saas') || directive.includes('منتج')) {
      return TaskDispatcher.buildSaaSLaunchDAG(dagId, directive);
    }

    // 3. مسار التفكيك الديناميكي عبر AI لنظام DAG المتعدد
    const dynamicDAG = await generatePlanDAGFromDirective(directive, context);
    dynamicDAG.dispatchStrategy = strategy;
    return dynamicDAG;
  }

  /**
   * المعمارية القياسية النموذجية لإطلاق وتدقيق منتج SaaS
   * تسلسل: Nexus -> Depot Scout -> Systems Dev -> Life Ops -> Nexus Synthesis -> Sentry -> Final Report
   */
  public static buildSaaSLaunchDAG(dagId: string, directive: string): AgenticPlanDAG {
    const tasks: AgentTaskNode[] = [
      {
        id: 'task-nexus-framing',
        title: 'تحليل وتأطير فرصة SaaS الاستراتيجية',
        description: 'يقوم Nexus Orchestrator بتفكيك التوجيه وتحديد القيمة السوقية والجمهور المستهدف والمخرجات المطلوبة من الأسطول.',
        assignedAgent: 'chief_of_staff',
        dependencies: [],
        status: 'pending',
        requiresHumanApproval: false,
        executionLogs: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'task-scout-intel',
        title: 'استطلاع الحلول المنافسة والمصادر الاستخباراتية',
        description: 'يقوم Depot Scout برصد الحلول المنافسة في السوق، واستخلاص الميزة التنافسية المحتملة للمشروع.',
        assignedAgent: 'intel_scout',
        dependencies: ['task-nexus-framing'],
        status: 'pending',
        requiresHumanApproval: false,
        executionLogs: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'task-systems-architecture',
        title: 'هندسة المعمارية التقنية والـ MVP',
        description: 'يقوم Systems Architect بصياغة متطلبات البنية التحتية، وتحديد حزمة التقنيات (Stack) وتكلفة التشغيل الصفرية.',
        assignedAgent: 'systems_dev',
        dependencies: ['task-scout-intel'],
        status: 'pending',
        requiresHumanApproval: false,
        executionLogs: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'task-life-alignment',
        title: 'مراجعة المواءمة الحياتية والوقت والموارد',
        description: 'يقوم Life Ops Warden بتقييم مدى ملاءمة المشروع لطاقة ووقت القائد محمد والتزاماته الحالية في غزة.',
        assignedAgent: 'life_ops',
        dependencies: ['task-systems-architecture'],
        status: 'pending',
        requiresHumanApproval: false,
        executionLogs: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'task-nexus-synthesis',
        title: 'تجميع وتوليف مخرجات الأسطول وصياغة الاستراتيجية',
        description: 'يقوم Nexus Orchestrator بجمع تقارير الاستخبارات، التقنية، والتوازن الحياتي ودمجها في مسودة قرار موحدة.',
        assignedAgent: 'chief_of_staff',
        dependencies: ['task-life-alignment'],
        status: 'pending',
        requiresHumanApproval: false,
        executionLogs: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'task-sentry-risk-audit',
        title: 'تدقيق المخاطر ونقاط الفشل المحتملة',
        description: 'يقوم Sentry Watchdog بفحص المخاطر الأمنية والمالية وإمكانية الركود والتنفيذ الواقعي قبل العرض النهائي.',
        assignedAgent: 'watchdog_sentry',
        dependencies: ['task-nexus-synthesis'],
        status: 'pending',
        requiresHumanApproval: false,
        executionLogs: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'task-final-unified-report',
        title: 'إصدار التقرير الاستراتيجي الموحد للقائد',
        description: 'يقوم Nexus بتقديم وثيقة التقييم النهائية المصادق عليها متضمنة التوصية الحاسمة وخطوة العمل القادمة.',
        assignedAgent: 'chief_of_staff',
        dependencies: ['task-sentry-risk-audit'],
        status: 'pending',
        requiresHumanApproval: false,
        executionLogs: [],
        createdAt: new Date().toISOString(),
      },
    ];

    return {
      id: dagId,
      commanderDirective: directive,
      dispatchStrategy: 'hierarchical_nexus',
      tasks,
      overallStatus: 'idle',
      currentStepIndex: 0,
      totalTokensUsed: 1400,
      createdAt: new Date().toISOString(),
    };
  }
}
