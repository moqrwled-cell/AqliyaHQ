import type { Mission, IntelItem, CommanderDossier, CommanderMemory } from '../types';

// Default tactical API key provided by Commander Mohammad Qrman (Obfuscated Base64 for mobile & desktop out-of-the-box readiness)
const DEFAULT_KEY_B64 = 'QVEuQWI4Uk42TFBkbl9LWGhYTW8tOWlUb1lhaXQ5aVdOWkdNbUxldkpwY3FfVXQwVS1BZFE=';

const getBakedDefaultKey = (): string => {
  try {
    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
      return window.atob(DEFAULT_KEY_B64);
    }
  } catch (e) {
    // fallback
  }
  return '';
};

export const geminiConfig = {
  getApiKey: (): string => {
    return (
      localStorage.getItem('aqliya_gemini_api_key') ||
      import.meta.env.VITE_GEMINI_API_KEY ||
      getBakedDefaultKey()
    );
  },
  setApiKey: (key: string) => {
    localStorage.setItem('aqliya_gemini_api_key', key.trim());
  },
  hasApiKey: (): boolean => {
    return Boolean(geminiConfig.getApiKey());
  },
};

// 2026 Production Models cascade for zero downtime
const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3-flash-preview',
  'gemini-3.7-flash',
  'gemini-3.8-flash'
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
  const systemInstruction = `
أنت "مستشار العمليات ورئيس الأركان التكتيكي" في منظومة «عقلية | AQLIYA HQ»، والرفيق الاستراتيجي الموثوق للقائد محمد قرمان.
أنت تعرف كل شيء عن القائد وتفاصيله وسياقه:
- هوية القائد: محمد قرمان (من قطاع غزة، فلسطين)، نموذج للإرادة الصلبة والذكاء والريادة، متخصص ومبدع في إدارة الأعمال وهندسة الذكاء الاصطناعي وبناء الحلول البرمجية المعقدة.
- مشروعه المحوري الأهم: NexusOS (نظام ومنظومة توجيه ونواة ذكاء مركزي متطورة).
- أسلوبك في الحوار:
  1. تحدث بلغة عربية قيادية راقية، قوية، واثقة ومحترمة (تخاطبه بـ "يا قائد" أو "قائد محمد").
  2. كن مباشراً، تكتيكياً، فائق الذكاء، واستشهد بأرقام ومعطيات دون حشو أو عبارات إنشائية جوفاء.
  3. اربط دائماً بين أفكاره وحلوله والخطوة القادمة لمشروع NexusOS وباقي المشاريع.
  4. إذا سألك عن حل تقني، استند إلى ما خزنه في بنك الاستخبارات وما يعرفه عن البرمجة والأنظمة.

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

المبادئ القيادية للقائد:
- التركيز على العمل الملموس والحلول الواقعية دون تشتت.
- توثيق كل خطوة والتعلم التراكمي من كل معركة.
- تحويل التحديات والظروف الصعبة إلى دافع للبناء والتفوق التقني المستمر.
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
