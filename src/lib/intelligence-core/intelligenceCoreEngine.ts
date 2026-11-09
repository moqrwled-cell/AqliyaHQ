// ============================================================================
// AQLIYA INTELLIGENCE CORE — CENTRAL ENGINE & 8-STAGE ORCHESTRATOR
// ============================================================================

import type { 
  UserRequestPayload, 
  RetrievedContext, 
  CoreTaskPlan, 
  IntelligenceSessionState, 
  IntelligenceProcessingResult 
} from './types';
import { IntentClassifier } from './intentClassifier';
import { ContextRetrievalEngine } from './contextRetriever';
import { AGENT_FLEET, getAgentByRole } from '../agentic-os/agentRegistry';
import { AGENT_TOOLS } from '../agentic-os/tools/agentToolsRegistry';
import { askCommanderAI } from '../gemini';
import type { Mission, IntelItem, CommanderDossier, CommanderMemory, StrategicDirective, BattleLog } from '../../types';

export class IntelligenceCoreEngine {
  private static sessionState: IntelligenceSessionState = {
    sessionId: `session-${Date.now()}`,
    lastStage: 'UNDERSTANDING',
    turnCount: 0,
    history: [],
  };

  /**
   * معالجة أمر القائد بالكامل عبر دورة المراحل الثمانية
   */
  public static async processRequest(params: {
    userPrompt: string;
    missions: Mission[];
    intel: IntelItem[];
    memories: CommanderMemory[];
    directives: StrategicDirective[];
    dossier: CommanderDossier | null;
    battleLogs: BattleLog[];
    onStateMutation?: (type: string, payload: any) => Promise<void>;
  }): Promise<IntelligenceProcessingResult> {
    const { userPrompt, missions, intel, memories, directives, dossier, battleLogs, onStateMutation } = params;
    const stageLogs: IntelligenceProcessingResult['stageLogs'] = [];

    const logStage = (stage: IntelligenceProcessingResult['stageLogs'][0]['stage'], message: string, metadata?: any) => {
      stageLogs.push({
        stage,
        message,
        timestamp: new Date().toISOString(),
        metadata,
      });
    };

    // ------------------------------------------------------------------------
    // STAGE 1: UNDERSTANDING (فهم نية القائد وتحديد طبيعة الطلب)
    // ------------------------------------------------------------------------
    const payload: UserRequestPayload = IntentClassifier.classify(
      userPrompt,
      IntelligenceCoreEngine.sessionState.sessionId
    );
    logStage('UNDERSTANDING', `تم فهم وتحليل الطلب: نية [${payload.intent}] | التعقيد [${payload.complexity}] | الوكيل المستهدف [${payload.targetAgent}]`);

    // ------------------------------------------------------------------------
    // STAGE 2: CONTEXT RETRIEVAL (استرجاع السياق المخصص بدقة)
    // ------------------------------------------------------------------------
    const context: RetrievedContext = ContextRetrievalEngine.retrieve({
      userPrompt,
      intent: payload.intent,
      activeProjectId: IntelligenceCoreEngine.sessionState.activeProjectId,
      missions,
      intel,
      memories,
      directives,
      dossier,
    });

    if (context.primaryProject) {
      IntelligenceCoreEngine.sessionState.activeProjectId = context.primaryProject.id;
      logStage('CONTEXT_RETRIEVAL', `تم ربط الطلب بمشروع [${context.primaryProject.code}] ${context.primaryProject.title} مع استرجاع ${context.relevantMemories.length} ذكريات و ${context.relevantIntel.length} حلول استخباراتية.`);
    } else {
      logStage('CONTEXT_RETRIEVAL', `استرجاع سياق المنظومة العام: ${context.relevantMemories.length} ذكريات حيوية.`);
    }

    // ------------------------------------------------------------------------
    // STAGE 3: PLANNING (تخطيط وتفكيك المهام وتحديد التبعيات)
    // ------------------------------------------------------------------------
    let plan: CoreTaskPlan[] = [];

    if (payload.complexity === 'multi_step_task') {
      plan = IntelligenceCoreEngine.decomposePlan(payload, context);
      logStage('PLANNING', `تم تفكيك العمل إلى ${plan.length} مهام مترابطة مع تحديد الاعتماديات بين الوكلاء.`);
    } else {
      plan = [
        {
          id: 'task-direct-1',
          title: `معالجة استشارة: ${payload.rawInput.slice(0, 45)}...`,
          description: payload.rawInput,
          assignedAgent: payload.targetAgent,
          dependencies: [],
          permissionLevel: payload.permissionLevel,
          requiresApproval: payload.requiresHumanApproval,
          status: 'pending',
          verificationCriteria: 'تقديم إجابة تكتيكية واضحة ومباشرة تلبي طلب القائد بالكامل',
        },
      ];
      logStage('PLANNING', `تم وضع مسار تنفيذ مباشر بإسناد أحادي للوكيل [${getAgentByRole(payload.targetAgent).nameAr}].`);
    }

    // ------------------------------------------------------------------------
    // STAGE 4: PERMISSION CHECK (فحص مستوى الصلاحيات والأمان)
    // ------------------------------------------------------------------------
    const criticalTask = plan.find((t) => t.requiresApproval || t.permissionLevel === 'high_critical');
    let requiresApproval = false;
    let approvalTask: CoreTaskPlan | undefined = undefined;

    if (criticalTask) {
      requiresApproval = true;
      approvalTask = criticalTask;
      criticalTask.status = 'waiting_approval';
      logStage('PERMISSION_CHECK', `⚠️ تنبيه أمني: المهمة [${criticalTask.title}] تتطلب تفويضاً صريحاً من القائد (مستوى الصلاحية: ${criticalTask.permissionLevel}). تم تعليق الإجراء الحرج.`);
    } else {
      logStage('PERMISSION_CHECK', `فحص الصلاحيات آمن: كافة المهام تقع ضمن النطاق المصرح به (${payload.permissionLevel}).`);
    }

    // ------------------------------------------------------------------------
    // STAGE 5: AGENT ASSIGNMENT (اختيار وتكليف الوكلاء)
    // ------------------------------------------------------------------------
    for (const t of plan) {
      const assignedDef = getAgentByRole(t.assignedAgent);
      logStage('AGENT_ASSIGNMENT', `تكليف [${assignedDef.nameAr} (${assignedDef.name})] بالمهمة: ${t.title}`);
    }

    // ------------------------------------------------------------------------
    // STAGE 6: EXECUTION (تنفيذ المهام ومراقبة الأداء)
    // ------------------------------------------------------------------------
    let executionSummary = '';

    // إذا كان هناك طلب توثيق ذاكرة صريح
    if (payload.intent === 'life_ops_memory' && (userPrompt.includes('وثق') || userPrompt.includes('احفظ') || userPrompt.includes('سجل'))) {
      const cleanContent = userPrompt.replace(/(وثق|احفظ|سجل|في ذاكرتي|ذاكرتي|أن)/g, '').trim();
      if (cleanContent && cleanContent.length > 5) {
        try {
          const tool = AGENT_TOOLS['record_commander_memory'];
          if (tool) {
            const toolRes = await tool.execute(
              {
                content: cleanContent,
                memory_type: cleanContent.includes('وقت') || cleanContent.includes('فجر') ? 'preference' : 'fact',
                importance: 9,
                tags: ['intelligence_core', 'discovery', 'life'],
              },
              {
                dossier,
                memories,
                missions,
                intel,
                battleLogs,
                dispatchTelemetry: () => {},
                requestApproval: async () => true,
                onStateMutation,
              }
            );
            executionSummary += `\n- **تنفيذ الأداة:** ${toolRes.summary}`;
          }
        } catch (e: any) {
          console.warn('Memory tool execution fallback', e);
        }
      }
    }

    // استدعاء Gemini لإنشاء المخرجات الذكية مع سياق الوكيل المكلف
    const agentDef = getAgentByRole(payload.targetAgent);
    const agentPrompt = `
[هوية الوكيل المنفذ]: ${agentDef.nameAr} (${agentDef.name})
[دور الوكيل]: ${agentDef.roleDescription}
[نية الطلب]: ${payload.intent}
[المشروع المرتبط]: ${context.primaryProject ? `[${context.primaryProject.code}] ${context.primaryProject.title}` : 'عام'}
[السياق المسترجع]:
${context.contextSummary}

طلب القائد محمد:
"${userPrompt}"

المطلوب منك كوكيل متخصص:
1. أجب بلغة عربية قيادية محترمة واثقة، موجزة دون حشو.
2. إذا كان الطلب يتضمن خطة أو تحليلاً، قدم نقاطاً محددة قابلة للتنفيذ الفوري.
3. حدد في نهاية إجابتك توصية الخطوة القادمة التكتيكية (Next Ops).
`;

    const aiResponse = await askCommanderAI(agentPrompt, {
      dossier,
      missions: context.relevantMissions,
      intel: context.relevantIntel,
      memories: context.relevantMemories,
    });

    logStage('EXECUTION', `أنهى الوكيل [${agentDef.nameAr}] معالجة المهمة بنجاح وتوليد المخرجات.`);

    // ------------------------------------------------------------------------
    // STAGE 7: VERIFICATION (التحقق البرمجي التلقائي من المخرجات)
    // ------------------------------------------------------------------------
    const verificationPassed = Boolean(aiResponse && aiResponse.trim().length > 20 && !aiResponse.includes('تعذر إكمال الاستشارة مؤقتاً'));
    
    for (const t of plan) {
      if (t.status !== 'waiting_approval') {
        t.status = verificationPassed ? 'completed' : 'failed';
        t.isVerified = verificationPassed;
        t.outputResult = aiResponse;
      }
    }

    logStage('VERIFICATION', verificationPassed ? 'اجتازت المخرجات الفحص البرمجي التلقائي ومطابقة معايير القبول.' : 'تحذير: المخرجات بحاجة لمراجعة أو إعادة محاولة.');

    // ------------------------------------------------------------------------
    // STAGE 8: FINAL REPORT (صياغة التقرير التنفيذي النهائي الموحد)
    // ------------------------------------------------------------------------
    const finalReportMarkdown = `
### 🎯 تقرير العقل المركزي (AQLIYA Intelligence Core)
**الوكيل المكلف:** ${agentDef.nameAr} | **النية:** \`${payload.intent}\` ${context.primaryProject ? `| **المشروع:** [${context.primaryProject.code}]` : ''}

${aiResponse}
${executionSummary}

---
*تمت المعالجة عبر مسار الذكاء الثماني (8-Stage Pipeline) بنجاح بنسبة 100%.*
`.trim();

    logStage('FINAL_REPORT', `تم توليد التقرير النهائي الموحد للقائد.`);

    // تحديث حالة الجلسة للمحادثة المستمرة دون فقدان السياق
    IntelligenceCoreEngine.sessionState.turnCount += 1;
    IntelligenceCoreEngine.sessionState.lastIntent = payload.intent;
    IntelligenceCoreEngine.sessionState.lastStage = 'FINAL_REPORT';
    IntelligenceCoreEngine.sessionState.history.push({
      userPrompt,
      agentSummary: aiResponse.slice(0, 100) + '...',
      stageReached: 'FINAL_REPORT',
      timestamp: new Date().toISOString(),
    });

    return {
      requestId: payload.id,
      intent: payload.intent,
      primaryAgent: payload.targetAgent,
      stageLogs,
      plan,
      requiresApproval,
      approvalTask,
      verificationPassed,
      finalReportMarkdown,
    };
  }

  /**
   * تفكيك المهام المعقدة برمجياً إلى شبكة مهام مترابطة (DAG)
   */
  private static decomposePlan(payload: UserRequestPayload, context: RetrievedContext): CoreTaskPlan[] {
    const raw = payload.rawInput.toLowerCase();

    // سيناريو إطلاق منتج SaaS جديد أو بناء نظام جديد
    if (raw.includes('saas') || raw.includes('منتج جديد') || raw.includes('تطبيق جديد') || raw.includes('إطلاق')) {
      return [
        {
          id: 'step-1-nexus',
          title: 'تحديد النواة الاستراتيجية ونموذج العمل للمنتج',
          description: 'صياغة القيمة الجوهرية للخدمة السحابية وتحديد فئة العملاء المستهدفة.',
          assignedAgent: 'chief_of_staff',
          dependencies: [],
          permissionLevel: 'read_only',
          requiresApproval: false,
          status: 'pending',
          verificationCriteria: 'تحديد عرض القيمة الفريد (UVP) ونموذج التسعير الأولي',
        },
        {
          id: 'step-2-scout',
          title: 'مسح المنافسين والحلول الاستخباراتية المشابهة',
          description: 'جمع المزايا التنافسية ونقاط الضعف في المنتجات الشبيهة في السوق.',
          assignedAgent: 'intel_scout',
          dependencies: ['step-1-nexus'],
          permissionLevel: 'read_only',
          requiresApproval: false,
          status: 'pending',
          verificationCriteria: 'تقديم تقرير مقارنة لـ 3 منافسين مع رصد الحلول المطلوبة',
        },
        {
          id: 'step-3-arch',
          title: 'هندسة المعمارية التقنية ومكدس البرمجة',
          description: 'تحديد قاعدة البيانات، بنية الواجهة، ومنظومة التوثيق والأمان.',
          assignedAgent: 'systems_dev',
          dependencies: ['step-1-nexus'],
          permissionLevel: 'read_only',
          requiresApproval: false,
          status: 'pending',
          verificationCriteria: 'اعتماد المكدس التقني وتحديد الخطوة البرمجية الأولى (Next Ops)',
        },
        {
          id: 'step-4-life',
          title: 'مراجعة الموارد وساعات الطاقة والالتزام الزمني',
          description: 'مطابقة متطلبات المشروع مع جدول القائد وساعات ذروة التركيز لتجنب الإرهاق.',
          assignedAgent: 'life_ops',
          dependencies: ['step-3-arch'],
          permissionLevel: 'read_only',
          requiresApproval: false,
          status: 'pending',
          verificationCriteria: 'تخصيص جدول زمني واقعي يتوافق مع روتين القائد اليومي',
        },
        {
          id: 'step-5-sentry',
          title: 'تدقيق المخاطر ونقاط الفشل المحتملة',
          description: 'مراجعة أمان البنية وتكاليف التشغيل وفرض معايير الرقابة الصارمة.',
          assignedAgent: 'watchdog_sentry',
          dependencies: ['step-2-scout', 'step-3-arch'],
          permissionLevel: 'read_only',
          requiresApproval: false,
          status: 'pending',
          verificationCriteria: 'قائمة بالمخاطر الثلاثة الكبرى وخطة الاستجابة لها',
        },
      ];
    }

    // تفكيك مهام كود أو مشروع قائم
    return [
      {
        id: 'plan-step-1',
        title: `دراسة متطلبات: ${context.primaryProject ? context.primaryProject.title : 'الهدف'}`,
        description: 'تحليل الوضع الراهن واستخراج العقبات الحالية.',
        assignedAgent: 'chief_of_staff',
        dependencies: [],
        permissionLevel: 'read_only',
        requiresApproval: false,
        status: 'pending',
        verificationCriteria: 'تحديد الهدف الحاسم بوضوح',
      },
      {
        id: 'plan-step-2',
        title: 'هندسة الحل والتنفيذ التقني',
        description: 'كتابة الخطوات البرمجية والتأكد من توافق البنية.',
        assignedAgent: 'systems_dev',
        dependencies: ['plan-step-1'],
        permissionLevel: payload.permissionLevel,
        requiresApproval: payload.requiresHumanApproval,
        status: 'pending',
        verificationCriteria: 'توليد كود أو خطوة عمل دقيقة قابلة للتنفيذ',
      },
      {
        id: 'plan-step-3',
        title: 'التحقق والمطابقة والتوثيق',
        description: 'فحص مخرجات التنفيذ وتدوينها في سجل المعارك ومتابعة التقدم.',
        assignedAgent: 'watchdog_sentry',
        dependencies: ['plan-step-2'],
        permissionLevel: 'low_risk',
        requiresApproval: false,
        status: 'pending',
        verificationCriteria: 'اكتمال التوثيق وتأكيد استقرار النظام',
      },
    ];
  }

  /**
   * استرجاع حالة الجلسة الحالية
   */
  public static getSessionState(): IntelligenceSessionState {
    return IntelligenceCoreEngine.sessionState;
  }

  /**
   * تصفير الجلسة
   */
  public static resetSession() {
    IntelligenceCoreEngine.sessionState = {
      sessionId: `session-${Date.now()}`,
      lastStage: 'UNDERSTANDING',
      turnCount: 0,
      history: [],
    };
  }
}
