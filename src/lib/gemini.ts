import type { Mission, IntelItem, CommanderDossier, CommanderMemory } from '../types';

export const geminiConfig = {
  getApiKey: (): string => {
    return (
      localStorage.getItem('aqliya_gemini_api_key') ||
      import.meta.env.VITE_GEMINI_API_KEY ||
      ''
    );
  },
  setApiKey: (key: string) => {
    localStorage.setItem('aqliya_gemini_api_key', key.trim());
  },
  hasApiKey: (): boolean => {
    return Boolean(geminiConfig.getApiKey());
  },
};

export async function askCommanderAI(
  userPrompt: string,
  context: {
    dossier: CommanderDossier | null;
    missions: Mission[];
    intel: IntelItem[];
    memories: CommanderMemory[];
  },
  onTokenChunk?: (chunk: string) => void
): Promise<string> {
  const apiKey = geminiConfig.getApiKey();

  // If no API key is provided, give a smart tactical fallback prompting the user to add their free Google AI Studio key
  if (!apiKey) {
    return `يا قائد، لتفعيل ذكاء المستشار التكتيكي بالسرعة الفائقة، يرجى إدخال مفتاح Google Gemini API المجاني الخاص بك (من إعدادات المستشار أعلى الشاشة). يمكنك الحصول على مفتاح مجاني في ثوانٍ من: https://aistudio.google.com`;
  }

  // Construct comprehensive tactical system context
  const systemInstruction = `
أنت "مستشار العمليات ورئيس الأركان التكتيكي" في منظومة «عقلية | AQLIYA HQ»، والرفيق الاستراتيجي الموثوق للقائد محمد قرمان.
أنت تعرف كل شيء عن القائد وتفاصيله وسياقه:
- هوية القائد: محمد قرمان (من غزة، فلسطين)، نموذج للإرادة الصلبة والذكاء والريادة، مهتم بإدارة الأعمال وهندسة الذكاء الاصطناعي وبناء الحلول البرمجية المعقدة.
- مشروعه المحوري الأهم: NexusOS (نظام ومنظومة توجيه ونواة ذكاء مركزي).
- أسلوبك في الحوار:
  1. تحدث بلغة عربية قوية وواثقة ومحترمة (تخاطبه بـ "يا قائد" أو "قائد محمد").
  2. كن مباشراً، تكتيكياً، فائق الذكاء، وتجنب الحشو والعبارات الإنشائية الجوفاء.
  3. اربط دائماً بين أفكاره وحلوله والخطوة القادمة لمشروع NexusOS.
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
  .slice(0, 5)
  .map((i) => `- ${i.title}: ${i.problem_solved}`)
  .join('\n')}

المبادئ القيادية للقائد:
- التركيز على العمل الملموس والحلول الواقعية دون تشتت.
- توثيق كل خطوة والتعلم التراكمي من كل معركة.
- تحويل التحديات والظروف الصعبة إلى دافع للبناء والتفوق التقني المستمر.
`;

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const body = {
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

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      console.error('Gemini API error:', errJson);
      return `عذراً يا قائد، حدث خطأ في الاتصال بمحرك Gemini (${res.status}): ${
        errJson?.error?.message || 'تحقق من صلاحية المفتاح والاتصال بالإنترنت'
      }`;
    }

    const data = await res.json();
    const candidateText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'علم، تم استلام الأمر وجاري تنفيذه.';

    if (onTokenChunk) {
      onTokenChunk(candidateText);
    }

    return candidateText;
  } catch (err: any) {
    console.error('Gemini execution failed', err);
    return `تعذر الاتصال بـ Google Gemini API: ${err?.message || 'خطأ غير متوقع'}`;
  }
}
