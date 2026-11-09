// ============================================================================
// AQLIYA AGENTIC OS — TASK DAG DECOMPOSITION ENGINE
// ============================================================================

import type { AgenticPlanDAG, AgentTaskNode, AgentRole } from './types';
import { askCommanderAI } from '../gemini';

export async function generatePlanDAGFromDirective(
  directive: string,
  context: {
    missions: any[];
    intel: any[];
    memories: any[];
  }
): Promise<AgenticPlanDAG> {
  const dagId = `dag-${Date.now()}`;

  const systemInstructions = `أنت محرك التخطيط التكتيكي لنظام تشغيل الوكلاء AQLIYA Agentic OS للقائد محمد.
مهمتك: تحويل التوجيه الإستراتيجي للقائد إلى شبكة مهام مترابطة (DAG - Directed Acyclic Graph) ينفذها أسطول الوكلاء المتخصصين.

الوكلاء المتاحون لتفويض المهام لهم:
1. "chief_of_staff": التخطيط والتنسيق الشامل وصياغة القرارات الكبرى.
2. "intel_scout": فحص الروابط والمصادر واستخلاص الأفكار من بنك الاستخبارات.
3. "systems_dev": كتابة وهندسة الحلول البرمجية وتحديث المشاريع وأهدافها.
4. "watchdog_sentry": فحص الركود والتحقق من المهل الزمنية والتنبيهات.
5. "life_ops": تدوين الذكريات، متابعة الروتين اليومي، والجانب المعنوي.

المشاريع النشطة حالياً لدى القائد:
${context.missions.slice(0, 5).map((m) => `- [${m.code}] ${m.title} (نسبة الإنجاز: ${m.progress_percent}%)`).join('\n')}

المطلوب إخراج مصفوفة مهام بصيغة JSON حصراً بهذا الهيكل الدقيق:
{
  "tasks": [
    {
      "id": "task-1",
      "title": "عنوان تكتيكي موجز للمهمة",
      "description": "تفاصيل ما يجب على الوكيل تنفيذه بالضبط",
      "assignedAgent": "chief_of_staff" | "intel_scout" | "systems_dev" | "watchdog_sentry" | "life_ops",
      "dependencies": [], // معرفات المهام السابقة التي تعتمد عليها
      "requiresHumanApproval": false, // true فقط إذا كان الإجراء كبيراً أو تعديلاً جوهرياً
      "suggestedTool": "record_commander_memory" | "create_mission_objective" | "update_mission_progress" | "curate_intel_solution" | "dispatch_battle_log" | "request_commander_decision"
    }
  ]
}

قواعد صارمة:
- قسم الهدف إلى 3 إلى 5 مهام واضحة ومتسلسلة منطقياً.
- اجعل أول مهمة تخطيط أو استكشاف (بدون تبعيات dependencies: []).
- اربط المهام اللاحقة بالمهام السابقة في حقل dependencies لضمان التسلسل الصحيح.
- لا تضع أي نص خارج كتلة JSON.`;

  try {
    const rawResponse = await askCommanderAI(
      `التوجيه الإستراتيجي للقائد:\n"${directive}"\n\nقم بتفكيك هذا التوجيه فوراً إلى مصفوفة مهام DAG بصيغة JSON الصافية.`,
      {
        missions: context.missions,
        intel: context.intel,
        memories: context.memories,
        dossier: null,
      }
    );

    // Extract JSON block
    let cleanedJson = rawResponse.trim();
    if (cleanedJson.includes('```json')) {
      cleanedJson = cleanedJson.split('```json')[1].split('```')[0].trim();
    } else if (cleanedJson.includes('```')) {
      cleanedJson = cleanedJson.split('```')[1].split('```')[0].trim();
    }

    const parsed = JSON.parse(cleanedJson);
    const taskNodes: AgentTaskNode[] = (parsed.tasks || []).map((t: any, idx: number) => ({
      id: t.id || `task-${idx + 1}`,
      title: t.title || `مهمة ${idx + 1}`,
      description: t.description || '',
      assignedAgent: validateAgentRole(t.assignedAgent),
      dependencies: Array.isArray(t.dependencies) ? t.dependencies : [],
      status: 'pending',
      requiresHumanApproval: Boolean(t.requiresHumanApproval),
      executionLogs: [],
      createdAt: new Date().toISOString(),
      inputPayload: { suggestedTool: t.suggestedTool },
    }));

    // If no tasks returned, fallback to default template
    if (taskNodes.length === 0) {
      return createFallbackDAG(dagId, directive);
    }

    return {
      id: dagId,
      commanderDirective: directive,
      tasks: taskNodes,
      overallStatus: 'idle',
      currentStepIndex: 0,
      totalTokensUsed: 1200,
      createdAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn('Failed to parse dynamic DAG from AI, generating resilient fallback', err);
    return createFallbackDAG(dagId, directive);
  }
}

function validateAgentRole(role: string): AgentRole {
  const validRoles: AgentRole[] = ['chief_of_staff', 'intel_scout', 'systems_dev', 'watchdog_sentry', 'life_ops'];
  return validRoles.includes(role as any) ? (role as AgentRole) : 'chief_of_staff';
}

function createFallbackDAG(dagId: string, directive: string): AgenticPlanDAG {
  const tasks: AgentTaskNode[] = [
    {
      id: 'task-1',
      title: 'تحليل وتأطير التوجيه الاستراتيجي',
      description: `يقوم قائد الأركان بتشريح الهدف: "${directive}" وتحديد متطلبات التنفيذ.`,
      assignedAgent: 'chief_of_staff',
      dependencies: [],
      status: 'pending',
      requiresHumanApproval: false,
      executionLogs: [],
      createdAt: new Date().toISOString(),
      inputPayload: { suggestedTool: 'dispatch_battle_log' },
    },
    {
      id: 'task-2',
      title: 'رصد الموارد والحلول الاستخباراتية',
      description: 'يقوم وكيل الاستخبارات بفحص الروابط ذات الصلة بالهدف وتلخيص النقاط الجوهرية.',
      assignedAgent: 'intel_scout',
      dependencies: ['task-1'],
      status: 'pending',
      requiresHumanApproval: false,
      executionLogs: [],
      createdAt: new Date().toISOString(),
      inputPayload: { suggestedTool: 'curate_intel_solution' },
    },
    {
      id: 'task-3',
      title: 'تحديد المعالم الهندسية والخطوة القادمة',
      description: 'يقوم وكيل الأنظمة بضبط الخطوات التنفيذية وتحديث سجل المشروع.',
      assignedAgent: 'systems_dev',
      dependencies: ['task-2'],
      status: 'pending',
      requiresHumanApproval: true,
      executionLogs: [],
      createdAt: new Date().toISOString(),
      inputPayload: { suggestedTool: 'update_mission_progress' },
    },
    {
      id: 'task-4',
      title: 'التدقيق والتوثيق في بنك الذاكرة',
      description: 'يقوم وكيل العمليات الحياتية بتوثيق القرارات المستخلصة في Mind Vault.',
      assignedAgent: 'life_ops',
      dependencies: ['task-3'],
      status: 'pending',
      requiresHumanApproval: false,
      executionLogs: [],
      createdAt: new Date().toISOString(),
      inputPayload: { suggestedTool: 'record_commander_memory' },
    },
  ];

  return {
    id: dagId,
    commanderDirective: directive,
    tasks,
    overallStatus: 'idle',
    currentStepIndex: 0,
    totalTokensUsed: 850,
    createdAt: new Date().toISOString(),
  };
}
