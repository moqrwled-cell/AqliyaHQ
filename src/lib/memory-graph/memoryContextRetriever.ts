// ============================================================================
// AQLIYA PERSISTENT MEMORY CONTEXT RETRIEVER — 7-LAYER TARGETED EXTRACTION
// ============================================================================

import type { MemoryLayer, AnyMemoryEntry } from './types';
import { PersistentMemoryStore } from './memoryStore';
import { KnowledgeGraphEngine } from './knowledgeGraphEngine';
import type { RequestIntent } from '../intelligence-core/types';

export class MemoryContextRetriever {
  /**
   * استرجاع السياق المخصص بدقة استناداً إلى نية الطلب والـ Knowledge Graph
   */
  public static retrieveTargetedContext(params: {
    userPrompt: string;
    intent: RequestIntent;
    activeProjectId?: string;
  }): {
    targetLayers: MemoryLayer[];
    matchedEntries: AnyMemoryEntry[];
    structuredSummary: string;
    decisionGuidance?: string;
    projectDeepSteps?: string;
    knownErrorsAndLessons?: string;
  } {
    const { userPrompt, intent, activeProjectId } = params;
    const lower = userPrompt.toLowerCase();

    let targetLayers: MemoryLayer[] = [];
    let decisionGuidance: string | undefined;
    let projectDeepSteps: string | undefined;
    let knownErrorsAndLessons: string | undefined;

    // 1. تحديد الطبقات المستهدفة حسب النية (Targeted Layer Resolution)
    const isAskingDecision = lower.includes('قرار') || lower.includes('قرارات') || lower.includes('أختار') || lower.includes('مفاضلة') || lower.includes('حسم');
    const isAskingErrors = lower.includes('خطأ') || lower.includes('أخطاء') || lower.includes('مشاكل') || lower.includes('ثغرة') || lower.includes('وقاية') || lower.includes('bugs');
    const isAskingSteps = lower.includes('خطوات') || lower.includes('خطوة') || lower.includes('تفاصيل المشروع') || lower.includes('المسار الكامل');

    if (isAskingDecision) {
      targetLayers = ['decisions', 'identity', 'experience', 'goals'];
      const decisionCtx = KnowledgeGraphEngine.getDecisionSupportContext(userPrompt);
      if (decisionCtx.relevantDecisions.length > 0 || decisionCtx.applicablePrinciples.length > 0) {
        decisionGuidance = `
### ⚖️ دليل دعم اتخاذ القرار (Decision Support):
- **المبادئ الحاكمة المعتمدة للقائد:**
${decisionCtx.applicablePrinciples.map((p) => `  * ${p}`).join('\n')}
- **قرارات سابقة مشابهة:**
${decisionCtx.relevantDecisions.map((d) => `  * [${d.title}]: تم اختيار (${d.chosenOption}) والسبب: ${d.rationale}`).join('\n') || '  * لا توجد قرارات مطابقة تماماً، استند إلى المبادئ أعلاه.'}
- **أخطاء سابقة يجب تجنبها في هذا القرار:**
${decisionCtx.pastErrorsToAvoid.map((e) => `  * ⚠️ احذر من: ${e.title} -> القاعدة: ${e.preventiveRule}`).join('\n') || '  * لا توجد أخطاء سابقة مسجلة لهذا الموضوع.'}
`.trim();
      }
    } else if (isAskingErrors) {
      targetLayers = ['experience', 'projects'];
      const errors = KnowledgeGraphEngine.getErrorsAndLessons();
      if (errors.length > 0) {
        knownErrorsAndLessons = `
### 🛡️ سجل الأخطاء والدروس المستفادة والقواعد الوقائية:
${errors.map((e) => `- **[${e.errorType}] ${e.title}:**\n  * السبب الجذري: ${e.rootCause}\n  * الحل: ${e.resolution}\n  * 🔒 القاعدة الوقائية: ${e.preventiveRule}`).join('\n\n')}
`.trim();
      }
    } else if (intent === 'code_engineering' || intent === 'project_status_query' || isAskingSteps) {
      targetLayers = ['projects', 'experience', 'goals'];
    } else if (intent === 'life_ops_memory') {
      targetLayers = ['identity', 'operational'];
    } else if (intent === 'intel_analysis') {
      targetLayers = ['knowledge', 'projects'];
    } else {
      targetLayers = ['identity', 'goals', 'projects'];
    }

    // 2. فحص ما إذا كان هناك مشروع محدد واستخراج كافة تفاصيله وخطواته (Deep Project Inspection)
    let projectCodeOrId = activeProjectId;
    if (!projectCodeOrId) {
      if (lower.includes('روما') || lower.includes('كفي') || lower.includes('roma')) projectCodeOrId = 'ROMA-SYS';
      else if (lower.includes('نكسس') || lower.includes('nexus') || lower.includes('عقلية')) projectCodeOrId = 'NEXUS-CORE';
      else if (lower.includes('جغرافيا') || lower.includes('خرائط') || lower.includes('geo')) projectCodeOrId = 'GEO-ACAD';
      else if (lower.includes('تنظيم الحياة') || lower.includes('life')) projectCodeOrId = 'LIFE-OPS';
    }

    if (projectCodeOrId) {
      const fullProj = KnowledgeGraphEngine.getProjectFullContext(projectCodeOrId);
      if (fullProj.project) {
        projectDeepSteps = `
### 📂 التفاصيل الكاملة للمشروع [${fullProj.project.code}] ${fullProj.project.title}:
- **نسبة الإنجاز:** ${fullProj.project.progressPercent}%
- **التركيز الحالي:** ${fullProj.project.currentFocus}
- **الخطوة القادمة (Next Ops):** ${fullProj.project.nextOps}
- **مكدس التقنيات:** ${fullProj.project.techStack.join(', ')}
- **خطوات التنفيذ التفصيلية كلها:**
${fullProj.steps.map((s) => `  ${s.stepNumber}. [${s.status === 'completed' ? 'مكتملة ✅' : s.status === 'current' ? 'جارية ⚡' : 'مستقبلية ⏳'}] ${s.title}: ${s.description}`).join('\n')}
- **الأخطاء والعقبات المعروفة بالمشروع:**
${fullProj.knownErrors.map((err) => `  * ⚠️ ${err}`).join('\n') || '  * لا توجد عقبات مسجلة حالياً.'}
- **ملفات أوبسيديان التوثيقية المتاحة:**
${fullProj.obsidianFiles.map((f) => `  * 📄 ${f}`).join('\n')}
`.trim();
      }
    }

    // 3. البحث السياقي المركز في الطبقات المستهدفة
    const searchResults = PersistentMemoryStore.search({
      query: userPrompt,
      layers: targetLayers,
      minImportance: 5,
    });

    const matchedEntries = searchResults.slice(0, 6).map((r) => r.entry);

    // تجميع الملخص السياقي الهيكلي
    const summarySections: string[] = [];

    if (decisionGuidance) {
      summarySections.push(decisionGuidance);
    }

    if (projectDeepSteps) {
      summarySections.push(projectDeepSteps);
    }

    if (knownErrorsAndLessons) {
      summarySections.push(knownErrorsAndLessons);
    }

    if (matchedEntries.length > 0) {
      summarySections.push(
        `### 🧠 الذكريات المسترجعة من الطبقات المتخصصة (${targetLayers.join(', ')}):\n` +
        matchedEntries.map((e) => `- [طبقة ${e.layer}] **${e.title}:** ${e.content}`).join('\n')
      );
    }

    return {
      targetLayers,
      matchedEntries,
      structuredSummary: summarySections.join('\n\n') || 'سياق الذاكرة العام للمنظومة.',
      decisionGuidance,
      projectDeepSteps,
      knownErrorsAndLessons,
    };
  }
}
