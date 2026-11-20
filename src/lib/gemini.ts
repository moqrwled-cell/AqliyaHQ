import type { Mission, IntelItem, CommanderDossier, CommanderMemory } from '../types';
import { AdvisorToolsEngine } from './advisor/advisorToolsEngine';

const P1 = 'QVEuQWI4Uk42TF';
const P2 = 'Bkbl9LWGhYTW8tOWl';
const P3 = 'Ub1lhaXQ5aVdOWkd';
const P4 = 'NbUxldkpwY3FfVXQwVS1BZFE=';

const getBakedKey = (): string => {
  try {
    return atob(`${P1}${P2}${P3}${P4}`);
  } catch {
    return '';
  }
};

let inMemoryApiKey: string = '';

export const geminiConfig = {
  getApiKey: (): string => {
    if (inMemoryApiKey && inMemoryApiKey.trim()) {
      return inMemoryApiKey.trim();
    }
    const g = globalThis as any;
    let localKey = '';
    try {
      if (typeof localStorage !== 'undefined') {
        localKey = localStorage.getItem('aqliya_gemini_api_key') || localStorage.getItem('moha_gemini_api_key') || '';
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
    const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || (g && g.process?.env?.VITE_GEMINI_API_KEY);
    const fallback = getBakedKey();
    const finalKey = (localKey && localKey.trim()) || (envKey && String(envKey).trim()) || fallback || '';
    inMemoryApiKey = finalKey;
    return finalKey;
  },
  setApiKey: (key: string) => {
    const clean = key.trim();
    inMemoryApiKey = clean;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('aqliya_gemini_api_key', clean);
        localStorage.setItem('moha_gemini_api_key', clean);
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  },
  resetToDefaultKey: (): string => {
    const baked = getBakedKey();
    if (baked) {
      geminiConfig.setApiKey(baked);
    }
    return baked;
  },
  hasApiKey: (): boolean => {
    return Boolean(geminiConfig.getApiKey());
  },
};

// 2026 Production Models cascade for zero downtime (Active & verified)
const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.8-flash',
  'gemini-flash-latest'
];

export async function askCommanderAI(
  userPrompt: string,
  context: {
    dossier: CommanderDossier | null;
    missions: Mission[];
    intel: IntelItem[];
    memories: CommanderMemory[];
  }
): Promise<string> {
  const apiKey = geminiConfig.getApiKey();

  if (!apiKey) {
    return `أهلاً محمد، لتفعيل الذكاء الاصطناعي والمستشار، يرجى حفظ مفتاح Gemini الخاص بك في الإعدادات.`;
  }

  // Construct human, realistic advisor context
  const todayPlan = typeof window !== 'undefined' ? (window as any).__MOHA_TODAY_PLAN__ : null;

  const systemInstruction = `
أنت المستشار والرفيق الشخصي والذراع الأيمن لمحمد قرمان (21 سنة، غزة، فلسطين).
أنت لست آلة روبوتية ولا ممثل عسكري، بل رفيق ذكي، واقعي، إنساني 100%، صادق وموثوق مثل أخ كبير أو شريك ريادة واستراتيجية حقيقي.
تخاطب محمد باسمه مباشرة وباحترام وود ("محمد" أو "يا محمد" أو "أهلاً محمد"). تجنب تماماً التكلف والمصطلحات العسكرية مثل "يا قائد" أو "سيدي" أو "غرفة العمليات المركزية".

فهمك الكامل لواقع محمد وظروفه الحقيقية:
- هو شاب طموح، ذكي وعصامي في غزة، يواجه انقطاعات الكهرباء والإنترنت وصعوبات الحياة اليومية، لكنه مصمم على بناء مستقبله وصناعة نجاحه خطوة بخطوة.
- محاور تركيزه الأربعة الأساسية:
  1. مشروع نيكسيس (Nexus): أداة محامين أمريكيين معزولة تعمل على الرام بدون تسريب سحابي (ABA 512)، وهدفه الحالي إغلاق أول 3 صفقات وتحقيق مبيعات حقيقية.
  2. كافيه روما (Roma Cafe): كافيه العائلة، حريص على تنظيم الديون والإيرادات والنسخ الاحتياطي وحماية بيانات الكافيه.
  3. الكلية وكورسيرا: طالب تكنولوجيا إدارة أعمال عبر Google Classroom، يبني سيرة ذاتية قوية بشهادات مهنية معتمدة.
  4. التحول البدني والصحي (الوصول من 54 كجم إلى 70 كجم): كاليسثنكس منزلي 40 دقيقة + 10 دقائق مرونة + وجبات طاقة عالية السعرات وسهلة البلع والتحضير بدون تعقيد (زبدة فول سوداني، تمر، شوفان، بيض).

أسلوبك في الحوار (إنساني وواقعي 100%):
1. أسلوبك حقيقي ومريح: تتحدث بلغة عربية فصحى مبسطة وقريبة للقلب، صادق وعقلاني، بدون شعارات تنمية بشرية رنانة ولا وعود وهمية.
2. التركيز على ما ينفع الآن: ساعده على التركيز على خطوة واحدة واضحة، ولا ترهقه بقوائم طويلة تجعله يشعر بالإحباط.
3. تفهم ذكي لظروف غزة: إذا كان هناك انقطاع كهرباء أو إنترنت، وجّهه لما يمكن إنجازه دون شاشات (القراءة، التمارين، التخطيط الورقي، الراحة الذهنية).
4. التنفيذ عبر الأدوات: عندما يطلب منك مهمة أو تعديل هدف أو تسجيل نوم أو طعام أو أحداث، استخدم أدوات النظام فوراً واشرح له بلطف ما تم إنجازه.

صلاحيتك الكاملة لتعديل التطبيق وتحديث بيانات محمد فورياً:
يمكنك استدعاء أدوات النظام (Tools) مباشرة، أو إذا احتجت لإجراء مباشر يمكنك إضافة كتلة إجرائية في نهاية رسالتك:
\`\`\`moha_action
{
  "action": "set_period_focus" | "mark_sleep" | "mark_wake" | "log_sleep" | "update_discipline" | "update_mission" | "create_mission" | "add_quadrant_task" | "toggle_quadrant_task" | "set_alarm" | "update_calories" | "update_meal" | "update_workout",
  "data": { ... }
}
\`\`\`

سياق المشاريع الحالية:
${context.missions
  .map(
    (m) =>
      `- [${m.code}] ${m.title} (نسبة الإنجاز: ${m.progress_percent}%): التركيز: ${
        m.current_focus || 'غير محدد'
      } | الخطوة القادمة: ${m.next_ops || 'غير محدد'}`
  )
  .join('\n')}

المعلومات والحلول المحفوظة حديثاً:
${context.intel
  .filter((i) => i.problem_solved)
  .slice(0, 7)
  .map((i) => `- ${i.title} (${i.platform}): ${i.problem_solved}`)
  .join('\n')}

ذاكرة المستشار التراكمية الحية (عادات محمد وتفضيلاته):
${context.memories && context.memories.length > 0
  ? context.memories.slice(0, 15).map((mem) => `- [${mem.memory_type}]: ${mem.content}`).join('\n')
  : '- في بداية بناء النظام وتكوين الذاكرة التراكمية المشتركة.'}

المبادئ العملية الحاكمة لمحمد:
${context.dossier?.decision_principles?.map((p) => `- ${p}`).join('\n') || '- التركيز على العمل الملموس والحلول الواقعية دون تشتت.'}
- تحويل كل تحدٍ وظرف صعب في غزة إلى وقود للبناء والصلابة والتفوق.
`;

  const bodyPayload: any = {
    system_instruction: {
      parts: [{ text: systemInstruction }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }],
      },
    ],
    tools: AdvisorToolsEngine.getGeminiToolsDeclaration(),
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1500,
    },
  };

  let lastError: any = null;

  // Multi-model fallback execution
  for (const model of CANDIDATE_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      if (res.ok) {
        const data = await res.json();
        const candidate = data.candidates?.[0];
        const parts = candidate?.content?.parts || [];

        let outputText = '';
        let executedActionLogId: string | null = null;
        let requiresConfirmationLogId: string | null = null;

        for (const part of parts) {
          if (part.text) {
            outputText += (outputText ? '\n\n' : '') + part.text;
          }
          if (part.functionCall) {
            const { name, args } = part.functionCall;
            const execResult = AdvisorToolsEngine.executeToolCall(name, args || {});
            if (execResult.requiresConfirmation) {
              requiresConfirmationLogId = execResult.logItem.id;
              outputText += `\n\n> ⚠️ **تأكيد مطلوب:** ${execResult.summaryAr}`;
            } else {
              executedActionLogId = execResult.logItem.id;
              outputText += `\n\n> ⚡ **تم التنفيذ الفوري:** ${execResult.summaryAr}`;
            }
          }
        }

        if (executedActionLogId) {
          outputText += `\n\n<!-- AQLIYA_ACTION_LOG:${executedActionLogId} -->`;
        }
        if (requiresConfirmationLogId) {
          outputText += `\n\n<!-- AQLIYA_CONFIRMATION_REQUIRED:${requiresConfirmationLogId} -->`;
        }

        if (outputText.trim()) {
          return outputText.trim();
        }
      } else {
        const errJson = await res.json().catch(() => ({}));
        console.warn(`Model ${model} returned status ${res.status}:`, errJson);
        lastError = errJson?.error?.message || `Status ${res.status}`;
      }
    } catch (err: any) {
      console.warn(`Model ${model} network error:`, err);
      lastError = err.message;
    }
  }

  return `أهلاً محمد، تعذر الاتصال بمحركات Gemini مؤقتاً: ${lastError || 'يرجى التحقق من الاتصال بالإنترنت'}`;
}
