import type { Mission, IntelItem, CommanderDossier, CommanderMemory } from '../types';

// Default tactical API key provided by Commander Mohammad Qrman (Obfuscated Base64 for mobile & desktop out-of-the-box readiness)
const DEFAULT_KEY_B64 = 'QVEuQWI4Uk42TFBkbl9LWGhYTW8tOWlUb1lhaXQ5aVdOWkdNbUxldkpwY3FfVXQwVS1BZFE=';

const getBakedDefaultKey = (): string => {
  try {
    const g = globalThis as any;
    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
      return window.atob(DEFAULT_KEY_B64);
    }
    if (g && g.Buffer) {
      return g.Buffer.from(DEFAULT_KEY_B64, 'base64').toString('utf-8');
    }
  } catch (e) {
    // fallback
  }
  return '';
};

export const geminiConfig = {
  getApiKey: (): string => {
    const g = globalThis as any;
    const local = typeof localStorage !== 'undefined' ? localStorage.getItem('aqliya_gemini_api_key') : null;
    const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || (g && g.process?.env?.VITE_GEMINI_API_KEY);
    return (
      local ||
      envKey ||
      getBakedDefaultKey()
    );
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

قدرتك الحصرية على تعديل خطة اليوم تلقائياً (AI Action Dispatcher):
إذا طلب منك القائد أي تعديل على خطته اليومية (مثل: حساب السعرات، تغيير وجبة، إضافة كورس كورسيرا، إضافة مهمة كلاس روم، تعديل التمارين)، نفذ طلبه واشرح له الحسابات، ثم أضف في نهاية رسالتك حصراً كتلة إجرائية واحدة بالصيغة التالية ليقوم التطبيق بتنفيذها على الفور:
\`\`\`plan_action
{
  "action": "update_calories" | "update_meal" | "add_meal" | "delete_meal" | "add_classroom_task" | "update_coursera" | "update_workout" | "set_alarm",
  "data": {
    // لحساب السعرات: "calories": 3000, "targetWeight": 70
    // لتعديل وجبة: "mealId": "meal-morning", "title": "...", "calories": 500, "ingredients": "..."
    // لإضافة وجبة: "title": "سناك طاقة", "calories": 400, "ingredients": "..."
    // لإضافة كورس: "courseTitle": "Google Project Management / Marketing"
    // لإضافة مهمة كلاس روم: "subject": "إدارة أعمال", "taskTitle": "...", "type": "assignment"
    // لتعديل تمرين: "title": "...", "exercises": ["..."]
    // لضبط منبه: "time": "06:00", "label": "استيقاظ الفجر والنشاط", "tone": "military" | "radar" | "gentle" | "siren" | "cyber"
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
