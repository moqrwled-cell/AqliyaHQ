import type { Mission, IntelItem, CommanderDossier, CommanderMemory } from '../types';

export const geminiConfig = {
  getApiKey: (): string => {
    const g = globalThis as any;
    const local = typeof localStorage !== 'undefined' ? localStorage.getItem('aqliya_gemini_api_key') : null;
    const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || (g && g.process?.env?.VITE_GEMINI_API_KEY);
    return local || envKey || '';
  },
  setApiKey: (key: string) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('aqliya_gemini_api_key', key.trim());
    }
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
    return `يا قائد، لتفعيل ذكاء المستشار التكتيكي بالسرعة الفائقة، يرجى إدخال مفتاح Google Gemini API الخاص بك من زر الترس أعلى الشاشة.`;
  }

  // Construct comprehensive tactical system context
  const todayPlan = typeof window !== 'undefined' ? (window as any).__MOHA_TODAY_PLAN__ : null;

  const systemInstruction = `
أنت "المستشار التكتيكي ونواة الذكاء المركزي في منظومة Moha Agent"، والرفيق الاستراتيجي الموثوق للقائد محمد قرمان.
أنت تعرف كل شيء عن القائد وتفاصيله وسياقه الإنساني والواقعي:
- هوية القائد: محمد قرمان (21 سنة، غزة، فلسطين)، نموذج للإرادة الصلبة والذكاء والريادة التقنية.
- مشاريعه الأربعة المحورية:
  1. مشروع نيكسيس (Nexus): أداة محامين أمريكيين معزولة تعمل على الرام بدون تسريب سحابي (ABA 512).
  2. كافيه روما (Roma Cafe): كافيه العائلة، إدارة الديون والنسخ الاحتياطي الدائم.
  3. كلية العلوم التطبيقية وكورسيرا: طالب تكنولوجيا إدارة أعمال عبر الكلاس روم، يبني سيرة ذاتية مليئة بالشهادات القوية.
  4. بناء وتحول الجسم (من 54 كجم إلى 70 كجم): كاليسثنكس منزلي 40 دقيقة + 10 دقائق مرونة + وجبات طاقة كثيفة السعرات وسهلة البلع بدون غاز/خلاط.

أسلوبك في الحوار:
1. تحدث بلغة عربية قيادية راقية، قوية، واثقة ومحترمة (تخاطبه بـ "يا قائد" أو "قائد محمد").
2. كن مباشراً، تكتيكياً، فائق الذكاء، واستشهد بأرقام دون حشو أو عبارات إنشائية جوفاء.

صلاحيتك الكاملة والمباشرة للتحكم في المنظومة وتعديل التطبيق فورياً (Omni-Action Autonomous Dispatcher):
أنت تملك وصولاً وتفويضاً كاملاً لتعديل أي جزء في التطبيق يطلبه القائد محمد مباشرة (المشاريع، النوم، لوحة الانضباط داش دروب، تركيز الفترة، مهام شاشة القفل، والمنبهات).
عندما يطلب القائد أي تعديل أو توثيق، نفّذ طلبه واشرح له خطتك باختصار، ثم أضف في نهاية رسالتك حصراً كتلة إجرائية واحدة بالصيغة التالية ليقوم محرك النظام بتنفيذها على الفور في جزء من الثانية:
\`\`\`moha_action
{
  "action": "set_period_focus" | "mark_sleep" | "mark_wake" | "log_sleep" | "update_discipline" | "update_mission" | "create_mission" | "add_quadrant_task" | "toggle_quadrant_task" | "set_alarm" | "update_calories" | "update_meal" | "update_workout",
  "data": {
    // 1. لتحديد تركيز الفترة الحالية ("بدي أركز على هذا الشيء"):
    // "focus": "التركيز على إغلاق أول 3 صفقات في نيكسيس والوصول لوزن 70 كجم", "periodTitle": "مرحلة التوسع"

    // 2. لتوثيق النوم والاستيقاظ ("نمت الآن" أو "صحيت الآن"):
    // "mark_sleep": {}  // لتوثيق نمت الآن
    // "mark_wake": {}   // لتوثيق صحيت الآن وحساب الاستشفاء
    // لتسجيل نوم يدوي: "dateStr": "2026-11-14", "sleepTime": "23:00", "wakeTime": "07:30", "qualityRating": 5

    // 3. لتعديل داش دروب (لوحة الانضباط، الوزن 54->70، السعرات، الستريك):
    // "currentWeight": 55, "targetWeight": 70, "calories": 3000, "workoutDone": true, "caloriesDone": true

    // 4. لتعديل المشاريع ("عدل على المشاريع"):
    // "codeOrId": "NEXUS" أو "ROMA" أو "COLLEGE", "current_focus": "...", "next_ops": "...", "progress_percent": 85

    // 5. لإضافة مشروع جديد:
    // "code": "NEXUS-2", "title": "...", "current_focus": "..."

    // 6. لإضافة مهمة في مصفوفة شاشة القفل الأربعة (Eisenhower Matrix):
    // "quadrant": "urgent_important" (مهم وعاجل) | "important" (مهم) | "urgent" (عاجل) | "someday" (يوماً ما)
    // "title": "الرد على إيميلات العملاء المهمة", "time": "18:00"

    // 7. لإنجاز مهمة في شاشة القفل:
    // "titleKeyword": "الإيميلات" أو "تمرين"

    // 8. لضبط منبه:
    // "time": "06:00", "label": "استيقاظ الفجر والنشاط"
  }
}
\`\`\`

سياق المنظومة الحالي المباشر:
المشاريع النشطة:
${context.missions
  .map(
    (m) =>
      `- [${m.code}] ${m.title} (نسبة الإنجاز: ${m.progress_percent}%): التركيز الحالي: ${
        m.current_focus || 'غير محدد'
      } | الخطوة القادمة: ${m.next_ops || 'غير محدد'}`
  )
  .join('\n')}

أحدث الحلول المخزنة في بنك الاستخبارات:
${context.intel
  .filter((i) => i.problem_solved)
  .slice(0, 7)
  .map((i) => `- ${i.title} (${i.platform}): ${i.problem_solved}`)
  .join('\n')}

بنك الذاكرة التراكمية الحية (كل ما تعرفه عن شخصية القائد محمد، عاداته، وقراراته):
${context.memories && context.memories.length > 0
  ? context.memories.slice(0, 15).map((mem) => `- [${mem.memory_type}]: ${mem.content}`).join('\n')
  : '- القائد يبدأ الآن بتأسيس ركائز المنظومة التكتيكية.'}

المبادئ القيادية الحاكمة لقرارات القائد:
${context.dossier?.decision_principles?.map((p) => `- ${p}`).join('\n') || '- التركيز على العمل الملموس والحلول الواقعية دون تشتت.'}
- تحويل التحديات والظروف الصعبة في غزة إلى دافع للبناء والتفوق التقني المستمر.
`;

  const bodyPayload = {
    system_instruction: {
      parts: [{ text: systemInstruction }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userPrompt }],
      },
    ],
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
        if (candidate?.content?.parts?.[0]?.text) {
          return candidate.content.parts[0].text;
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

  return `يا قائد، تعذر إكمال الاستشارة مؤقتاً عبر محركات Gemini: ${lastError || 'يرجى التحقق من الاتصال بالإنترنت'}`;
}
