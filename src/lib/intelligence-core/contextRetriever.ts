// ============================================================================
// AQLIYA INTELLIGENCE CORE — CONTEXT RETRIEVAL ENGINE
// ============================================================================

import type { Mission, IntelItem, CommanderDossier, CommanderMemory, StrategicDirective } from '../../types';
import type { RetrievedContext, RequestIntent } from './types';
import { MemoryContextRetriever } from '../memory-graph/memoryContextRetriever';

export class ContextRetrievalEngine {
  /**
   * استرجاع السياق المخصص بدقة استناداً إلى نية الطلب والكلمات المفتاحية
   */
  public static retrieve(params: {
    userPrompt: string;
    intent: RequestIntent;
    activeProjectId?: string;
    missions: Mission[];
    intel: IntelItem[];
    memories: CommanderMemory[];
    directives: StrategicDirective[];
    dossier: CommanderDossier | null;
  }): RetrievedContext {
    const { userPrompt, intent, activeProjectId, missions, intel, memories, directives, dossier } = params;
    const lowerPrompt = userPrompt.toLowerCase();

    // 1. تحديد المشروع المرتبط (Associated Project Resolution)
    let primaryProject: Mission | null = null;

    if (activeProjectId) {
      primaryProject = missions.find((m) => m.id === activeProjectId || m.code === activeProjectId) || null;
    }

    if (!primaryProject) {
      // البحث بالرمز أو العنوان أو الكلمات التكتيكية
      for (const m of missions) {
        const codeMatch = lowerPrompt.includes(m.code.toLowerCase());
        const titleMatch = lowerPrompt.includes(m.title.toLowerCase());
        const tagMatch = m.tags.some((t) => lowerPrompt.includes(t.toLowerCase()));

        if (codeMatch || titleMatch || tagMatch) {
          primaryProject = m;
          break;
        }
      }
    }

    // مطابقة تكتيكية للمشاريع الكبرى المعروفة
    if (!primaryProject) {
      if (lowerPrompt.includes('روما') || lowerPrompt.includes('كفي') || lowerPrompt.includes('roma') || lowerPrompt.includes('cafe')) {
        primaryProject = missions.find((m) => m.code.includes('ROMA') || m.title.includes('روما')) || null;
      } else if (lowerPrompt.includes('نكسس') || lowerPrompt.includes('nexus') || lowerPrompt.includes('النواة')) {
        primaryProject = missions.find((m) => m.code.includes('NEXUS') || m.title.includes('NexusOS')) || null;
      } else if (lowerPrompt.includes('جغرافيا') || lowerPrompt.includes('خرائط') || lowerPrompt.includes('geo')) {
        primaryProject = missions.find((m) => m.code.includes('GEO') || m.title.includes('الجغرافيا')) || null;
      } else if (lowerPrompt.includes('تنظيم الحياة') || lowerPrompt.includes('life') || lowerPrompt.includes('عادات')) {
        primaryProject = missions.find((m) => m.code.includes('LIFE') || m.title.includes('تنظيم الحياة')) || null;
      }
    }

    // 2. استدعاء محرك الذاكرة السباعية والـ Knowledge Graph
    const targetedMemory = MemoryContextRetriever.retrieveTargetedContext({
      userPrompt,
      intent,
      activeProjectId: primaryProject ? primaryProject.id : activeProjectId,
    });

    // 3. تصفية الذكريات ذات الصلة فقط (Selective Memory Retrieval)
    const relevantMemories = memories.filter((mem) => {
      if (primaryProject && mem.mission_id === primaryProject.id) return true;
      if (intent === 'life_ops_memory') {
        return (
          mem.context_tags.some((t) => ['rhythm', 'routine', 'energy', 'health', 'discovery', 'life'].includes(t)) ||
          mem.memory_type === 'preference'
        );
      }
      if (intent === 'strategic_planning') {
        return (
          mem.context_tags.some((t) => ['vision', 'strategy', 'principles', 'decision'].includes(t)) ||
          mem.memory_type === 'decision'
        );
      }
      const promptWords = lowerPrompt.split(/\s+/).filter((w) => w.length > 3);
      return promptWords.some((word) => mem.content.toLowerCase().includes(word));
    }).slice(0, 5);

    // 4. تصفية بنك الاستخبارات ذي الصلة (Intel Depot Retrieval)
    const relevantIntel = intel.filter((item) => {
      if (primaryProject && item.mission_id === primaryProject.id) return true;
      const promptWords = lowerPrompt.split(/\s+/).filter((w) => w.length > 3);
      const titleHit = promptWords.some((w) => item.title.toLowerCase().includes(w));
      const problemHit = item.problem_solved && promptWords.some((w) => item.problem_solved!.toLowerCase().includes(w));
      return titleHit || problemHit;
    }).slice(0, 3);

    // 5. تصفية التوجيهات الاستراتيجية
    const relevantDirectives = directives.filter((d) => {
      if (primaryProject && primaryProject.title.includes(d.title)) return true;
      return lowerPrompt.includes(d.pillar) || lowerPrompt.includes(d.title.toLowerCase());
    }).slice(0, 3);

    // بناء ملخص سياقي نصي مكثف يدمج الذاكرة السباعية والـ Knowledge Graph
    const contextParts: string[] = [];

    if (primaryProject) {
      contextParts.push(
        `المشروع المستهدف: [${primaryProject.code}] ${primaryProject.title} (نسبة الإنجاز: ${primaryProject.progress_percent}%) | الخطوة القادمة: ${primaryProject.next_ops || 'غير محددة'}`
      );
    }

    // إدراج تفاصيل الـ Knowledge Graph (القرارات السابقة، خطوات المشروع الكاملة، الأخطاء والوقاية)
    if (targetedMemory.structuredSummary) {
      contextParts.push(targetedMemory.structuredSummary);
    }

    if (relevantMemories.length > 0) {
      contextParts.push(
        `ذكريات إضافية من Supabase:\n` + relevantMemories.map((m) => `- [${m.memory_type}]: ${m.content}`).join('\n')
      );
    }

    return {
      primaryProject,
      relevantMissions: primaryProject ? [primaryProject] : missions.slice(0, 3),
      relevantIntel,
      relevantMemories,
      relevantDirectives,
      dossier,
      contextSummary: contextParts.join('\n\n') || 'سياق العمليات العام لمنظومة عقلية.',
    };
  }
}
