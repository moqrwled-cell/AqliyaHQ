// ============================================================================
// AQLIYA KNOWLEDGE GRAPH ENGINE — MULTI-RELATIONAL SEMANTIC NETWORK
// ============================================================================

import type {
  KnowledgeGraphData,
  KnowledgeGraphNode,
  KnowledgeGraphEdge,
  GraphNodeType,
  GraphEdgeType,
  ProjectMemoryEntry,
  DecisionMemoryEntry,
  ExperienceMemoryEntry,
  GoalMemoryEntry,
  IdentityMemoryEntry,
  KnowledgeMemoryEntry
} from './types';
import { PersistentMemoryStore } from './memoryStore';
import { AGENT_FLEET } from '../agentic-os/agentRegistry';

export class KnowledgeGraphEngine {
  private static graphData: KnowledgeGraphData = {
    nodes: [],
    edges: [],
    lastIndexedAt: '',
  };

  private static isBuilt = false;

  /**
   * بناء وتحديث الرسم البياني المعرفي بالكامل
   */
  public static buildGraph(): KnowledgeGraphData {
    PersistentMemoryStore.initialize();

    const nodes: KnowledgeGraphNode[] = [];
    const edges: KnowledgeGraphEdge[] = [];

    // 1. عقدة المستخدم المحورية (Commander Mohammad)
    const userNode: KnowledgeGraphNode = {
      id: 'node-user-commander',
      type: 'user',
      label: 'القائد محمد قرمان',
      subLabel: 'غزة، فلسطين | مهندس النظم والريادي',
      importance: 10,
      metadata: { role: 'Supreme Commander' },
    };
    nodes.push(userNode);

    // 2. عقد الوكلاء الخمسة
    Object.values(AGENT_FLEET).forEach((agent) => {
      const agentNode: KnowledgeGraphNode = {
        id: `node-agent-${agent.id}`,
        type: 'agent',
        label: agent.nameAr,
        subLabel: agent.name,
        importance: 8,
        metadata: { role: agent.id, tools: agent.allowedTools },
      };
      nodes.push(agentNode);

      // صلة الوكيل بالمستخدم (مساعد تكتيكي)
      edges.push({
        id: `edge-user-agent-${agent.id}`,
        sourceId: userNode.id,
        targetId: agentNode.id,
        relationship: 'owns',
        description: 'إشراف وتكليف تكتيكي',
        weight: 1.0,
      });
    });

    // 3. عقد ومسارات المشاريع
    const projects = PersistentMemoryStore.getEntries<ProjectMemoryEntry>('projects');
    projects.forEach((proj) => {
      const projNode: KnowledgeGraphNode = {
        id: `node-proj-${proj.id}`,
        type: 'project',
        label: `[${proj.code}] ${proj.title}`,
        subLabel: `إنجاز ${proj.progressPercent}% | ${proj.currentFocus}`,
        importance: proj.importance,
        metadata: {
          code: proj.code,
          category: proj.category,
          techStack: proj.techStack,
          nextOps: proj.nextOps,
        },
      };
      nodes.push(projNode);

      // ربط المشروع بالقائد
      edges.push({
        id: `edge-user-proj-${proj.id}`,
        sourceId: userNode.id,
        targetId: projNode.id,
        relationship: 'owns',
        description: 'مشروع استراتيجي',
        weight: 1.0,
      });

      // ربط المشروع بالوكيل المكلف
      if (proj.assignedAgent) {
        edges.push({
          id: `edge-agent-proj-${proj.id}`,
          sourceId: `node-agent-${proj.assignedAgent}`,
          targetId: projNode.id,
          relationship: 'monitored_by',
          description: 'متابعة وإشراف الوكيل',
          weight: 0.9,
        });
      }

      // إضافة خطوات المشروع كعقد مهام متفرعة
      proj.steps.forEach((step) => {
        const stepNode: KnowledgeGraphNode = {
          id: `node-step-${proj.id}-${step.stepNumber}`,
          type: 'task',
          label: `الخطوة ${step.stepNumber}: ${step.title}`,
          subLabel: `الحالة: ${step.status === 'completed' ? 'مكتملة' : step.status === 'current' ? 'جارية حالياً' : 'مستقبلية'}`,
          importance: 7,
          metadata: { ...step, projectId: proj.id },
        };
        nodes.push(stepNode);

        edges.push({
          id: `edge-proj-step-${proj.id}-${step.stepNumber}`,
          sourceId: projNode.id,
          targetId: stepNode.id,
          relationship: 'implements',
          description: 'خطوة تنفيذية في المشروع',
          weight: 0.8,
        });
      });

      // إضافة وثائق أوبسيديان المرتبطة
      proj.obsidianFiles.forEach((docName, idx) => {
        const docNode: KnowledgeGraphNode = {
          id: `node-doc-${proj.id}-${idx}`,
          type: 'document',
          label: docName,
          subLabel: 'وثيقة أوبسيديان في E:\\Antigravity_Vault',
          importance: 6,
          metadata: { fileName: docName, projectId: proj.id },
        };
        nodes.push(docNode);

        edges.push({
          id: `edge-proj-doc-${proj.id}-${idx}`,
          sourceId: projNode.id,
          targetId: docNode.id,
          relationship: 'documents',
          description: 'توثيق أوبسيديان',
          weight: 0.7,
        });
      });
    });

    // 4. عقد الأهداف وربطها بالمشاريع
    const goals = PersistentMemoryStore.getEntries<GoalMemoryEntry>('goals');
    goals.forEach((goal) => {
      const goalNode: KnowledgeGraphNode = {
        id: `node-goal-${goal.id}`,
        type: 'goal',
        label: goal.title,
        subLabel: goal.successMetric,
        importance: goal.importance,
        metadata: { horizon: goal.horizon, status: goal.status },
      };
      nodes.push(goalNode);

      edges.push({
        id: `edge-user-goal-${goal.id}`,
        sourceId: userNode.id,
        targetId: goalNode.id,
        relationship: 'owns',
        description: 'هدف قيادي',
        weight: 1.0,
      });

      // ربط الهدف بالمشاريع المعنية
      goal.associatedProjectIds.forEach((pId) => {
        edges.push({
          id: `edge-goal-proj-${goal.id}-${pId}`,
          sourceId: goalNode.id,
          targetId: `node-proj-${pId}`,
          relationship: 'implements',
          description: 'المشروع المنفذ للهدف',
          weight: 0.9,
        });
      });
    });

    // 5. عقد القرارات وربطها بالمشاريع والمبادئ
    const decisions = PersistentMemoryStore.getEntries<DecisionMemoryEntry>('decisions');
    decisions.forEach((dec) => {
      const decNode: KnowledgeGraphNode = {
        id: `node-dec-${dec.id}`,
        type: 'decision',
        label: dec.title,
        subLabel: `الخيار المعتمد: ${dec.chosenOption}`,
        importance: dec.importance,
        metadata: {
          rationale: dec.rationale,
          rejectedAlternatives: dec.rejectedAlternatives,
          principles: dec.decisionPrinciplesApplied,
        },
      };
      nodes.push(decNode);

      edges.push({
        id: `edge-user-dec-${dec.id}`,
        sourceId: userNode.id,
        targetId: decNode.id,
        relationship: 'decided_for',
        description: 'قرار قيادي صادر من القائد',
        weight: 1.0,
      });

      if (dec.associatedProjectId) {
        edges.push({
          id: `edge-dec-proj-${dec.id}-${dec.associatedProjectId}`,
          sourceId: decNode.id,
          targetId: `node-proj-${dec.associatedProjectId}`,
          relationship: 'decided_for',
          description: 'قرار متعلق بالمشروع',
          weight: 0.85,
        });
      }
    });

    // 6. عقد الأخطاء والدروس المستفادة والوقاية
    const experiences = PersistentMemoryStore.getEntries<ExperienceMemoryEntry>('experience');
    experiences.forEach((exp) => {
      const expNode: KnowledgeGraphNode = {
        id: `node-exp-${exp.id}`,
        type: 'error_lesson',
        label: exp.title,
        subLabel: `قاعدة وقائية: ${exp.preventiveRule}`,
        importance: exp.importance,
        metadata: {
          errorType: exp.errorType,
          rootCause: exp.rootCause,
          resolution: exp.resolution,
          preventiveRule: exp.preventiveRule,
        },
      };
      nodes.push(expNode);

      if (exp.associatedProjectId) {
        edges.push({
          id: `edge-exp-proj-${exp.id}-${exp.associatedProjectId}`,
          sourceId: expNode.id,
          targetId: `node-proj-${exp.associatedProjectId}`,
          relationship: 'prevented_by',
          description: 'خطأ سابق تم حله وقاعدة وقائية للمشروع',
          weight: 0.9,
        });
      }
    });

    KnowledgeGraphEngine.graphData = {
      nodes,
      edges,
      lastIndexedAt: new Date().toISOString(),
    };

    KnowledgeGraphEngine.isBuilt = true;
    return KnowledgeGraphEngine.graphData;
  }

  /**
   * جلب بيانات الرسم البياني (مع إعادة البناء إذا لزم الأمر)
   */
  public static getGraph(): KnowledgeGraphData {
    if (!KnowledgeGraphEngine.isBuilt || KnowledgeGraphEngine.graphData.nodes.length === 0) {
      return KnowledgeGraphEngine.buildGraph();
    }
    return KnowledgeGraphEngine.graphData;
  }

  /**
   * استخراج السياق الكامل لمشروع معين بكافة خطواته وقراراته وأخطائه ووثائقه
   */
  public static getProjectFullContext(projectIdOrCode: string): {
    project: ProjectMemoryEntry | null;
    steps: ProjectMemoryEntry['steps'];
    knownErrors: string[];
    preventiveRules: string[];
    decisions: DecisionMemoryEntry[];
    obsidianFiles: string[];
    connectedGoals: GoalMemoryEntry[];
  } {
    PersistentMemoryStore.initialize();
    const projects = PersistentMemoryStore.getEntries<ProjectMemoryEntry>('projects');
    const target = projects.find(
      (p) => p.id === projectIdOrCode || p.code === projectIdOrCode || p.title.toLowerCase().includes(projectIdOrCode.toLowerCase())
    );

    if (!target) {
      return {
        project: null,
        steps: [],
        knownErrors: [],
        preventiveRules: [],
        decisions: [],
        obsidianFiles: [],
        connectedGoals: [],
      };
    }

    const allDecisions = PersistentMemoryStore.getEntries<DecisionMemoryEntry>('decisions').filter(
      (d) => d.associatedProjectId === target.id
    );

    const allExp = PersistentMemoryStore.getEntries<ExperienceMemoryEntry>('experience').filter(
      (e) => e.associatedProjectId === target.id
    );

    const allGoals = PersistentMemoryStore.getEntries<GoalMemoryEntry>('goals').filter(
      (g) => g.associatedProjectIds.includes(target.id)
    );

    return {
      project: target,
      steps: target.steps,
      knownErrors: [...target.knownErrorsAndTechDebt, ...allExp.map((e) => `${e.title}: ${e.rootCause}`)],
      preventiveRules: allExp.map((e) => e.preventiveRule),
      decisions: allDecisions,
      obsidianFiles: target.obsidianFiles,
      connectedGoals: allGoals,
    };
  }

  /**
   * دعم اتخاذ القرارات: جلب القرارات السابقة والمبادئ والقواعد الوقائية المتعلقة بموضوع محدد
   */
  public static getDecisionSupportContext(topicKeyword: string): {
    relevantDecisions: DecisionMemoryEntry[];
    applicablePrinciples: string[];
    pastErrorsToAvoid: ExperienceMemoryEntry[];
    strategicGoals: GoalMemoryEntry[];
  } {
    PersistentMemoryStore.initialize();
    const lower = topicKeyword.toLowerCase();

    const decisions = PersistentMemoryStore.getEntries<DecisionMemoryEntry>('decisions').filter(
      (d) => d.title.toLowerCase().includes(lower) || d.context.toLowerCase().includes(lower) || d.rationale.toLowerCase().includes(lower)
    );

    const principles = PersistentMemoryStore.getEntries<IdentityMemoryEntry>('identity')
      .filter((i) => i.aspect === 'non_negotiable_principle')
      .map((i) => i.content);

    const errors = PersistentMemoryStore.getEntries<ExperienceMemoryEntry>('experience').filter(
      (e) => e.title.toLowerCase().includes(lower) || e.content.toLowerCase().includes(lower) || e.preventiveRule.toLowerCase().includes(lower)
    );

    const goals = PersistentMemoryStore.getEntries<GoalMemoryEntry>('goals').filter(
      (g) => g.status === 'in_progress' || g.status === 'active'
    );

    return {
      relevantDecisions: decisions,
      applicablePrinciples: principles,
      pastErrorsToAvoid: errors,
      strategicGoals: goals,
    };
  }

  /**
   * جلب الأخطاء والدروس المستفادة لمشروع أو للمنظومة ككل لمنع تكرار الخطأ
   */
  public static getErrorsAndLessons(projectId?: string): ExperienceMemoryEntry[] {
    PersistentMemoryStore.initialize();
    const all = PersistentMemoryStore.getEntries<ExperienceMemoryEntry>('experience');
    if (!projectId) return all;
    return all.filter((e) => e.associatedProjectId === projectId);
  }

  /**
   * إحصائيات عقد وروابط الـ Knowledge Graph
   */
  public static getStats(): { totalNodes: number; totalEdges: number; nodesByType: Record<GraphNodeType, number> } {
    const graph = KnowledgeGraphEngine.getGraph();
    const nodesByType: Record<GraphNodeType, number> = {
      user: 0,
      project: 0,
      goal: 0,
      task: 0,
      decision: 0,
      document: 0,
      intel: 0,
      agent: 0,
      error_lesson: 0,
    };

    graph.nodes.forEach((n) => {
      if (nodesByType[n.type] !== undefined) {
        nodesByType[n.type]++;
      }
    });

    return {
      totalNodes: graph.nodes.length,
      totalEdges: graph.edges.length,
      nodesByType,
    };
  }
}
