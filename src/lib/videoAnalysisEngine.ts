import { geminiConfig } from './gemini';

export type SmartVideoCategory = 
  | 'editing'       // مونتاج وتعديل فيديو وصناعة محتوى (Premiere, CapCut, DaVinci, After Effects, التصوير)
  | 'tech'          // تقني وبرمجة وذكاء اصطناعي وأدوات
  | 'business'      // أعمال ومبيعات وتسويق وريادة
  | 'fitness'       // لياقة وبناء جسم وتغذية وتمارين
  | 'educational'   // تعليمي وكورسات ولغات (إنجليزية) ودراسة
  | 'mindset'       // تطوير ذات وعادات وتنظيم وقت
  | 'entertainment' // ترفيه وترويح ومنوعات
  | 'general';      // عام ومراجع

export interface VideoAnalysisResult {
  title: string;
  category: SmartVideoCategory;
  categoryArabicLabel: string;
  problemSolved: string;
  keyTakeaways: string[];
  tags: string[];
  thumbnailUrl: string | null;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'github' | 'web';
  author: string | null;
  originalRawTitle: string | null;
}

export const CATEGORY_LABELS: Record<SmartVideoCategory, { label: string; icon: string; color: string }> = {
  editing: { label: 'مونتاج وصناعة محتوى', icon: '🎬', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  tech: { label: 'تقني وبرمجة', icon: '💻', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  business: { label: 'أعمال ومبيعات', icon: '💼', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  fitness: { label: 'لياقة وبناء جسم', icon: '🏋️‍♂️', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  educational: { label: 'تعليمي ودراسة', icon: '📚', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  mindset: { label: 'تطوير ذات وعادات', icon: '🧠', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  entertainment: { label: 'ترفيه وترويح', icon: '🎭', color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },
  general: { label: 'عام ومراجع', icon: '🌐', color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30' },
};

export class VideoAnalysisEngine {
  /**
   * Detect platform from URL
   */
  public static detectPlatform(url: string): 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'github' | 'web' {
    const l = url.toLowerCase();
    if (l.includes('youtube.com') || l.includes('youtu.be')) return 'youtube';
    if (l.includes('instagram.com')) return 'instagram';
    if (l.includes('tiktok.com')) return 'tiktok';
    if (l.includes('twitter.com') || l.includes('x.com')) return 'twitter';
    if (l.includes('github.com')) return 'github';
    return 'web';
  }

  /**
   * Normalizes URLs, particularly converting YouTube Shorts and youtu.be to clean standard watch links
   */
  public static normalizeUrl(rawUrl: string): string {
    let url = rawUrl.trim();

    // 1. YouTube Shorts: https://www.youtube.com/shorts/VIDEO_ID?si=...
    const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/i);
    if (shortsMatch && shortsMatch[1]) {
      return `https://www.youtube.com/watch?v=${shortsMatch[1]}`;
    }

    // 2. youtu.be: https://youtu.be/VIDEO_ID?si=...
    const youtuBeMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/i);
    if (youtuBeMatch && youtuBeMatch[1]) {
      return `https://www.youtube.com/watch?v=${youtuBeMatch[1]}`;
    }

    // 3. Remove tracking query parameters like ?si=, ?igsh=, ?feature=share
    try {
      const parsedUrl = new URL(url);
      parsedUrl.searchParams.delete('si');
      parsedUrl.searchParams.delete('igsh');
      parsedUrl.searchParams.delete('feature');
      parsedUrl.searchParams.delete('utm_source');
      parsedUrl.searchParams.delete('utm_medium');
      return parsedUrl.toString();
    } catch (e) {
      return url;
    }
  }

  /**
   * Extract raw URL and any accompanying share text (captions / descriptions sent by Android Share)
   */
  public static parseShareText(rawText: string): { url: string; accompanyingText: string } {
    const trimmed = rawText.trim();
    const urlMatch = trimmed.match(/(https?:\/\/[^\s]+)/i);
    if (!urlMatch) {
      return { url: '', accompanyingText: trimmed };
    }
    const url = urlMatch[0];
    const accompanyingText = trimmed.replace(url, '').replace(/[\n\r]+/g, ' ').trim();
    return { url, accompanyingText };
  }

  /**
   * Fetch live metadata from YouTube, TikTok, or noembed fallback
   */
  public static async fetchLiveMetadata(url: string, platform: string): Promise<{
    title: string | null;
    author: string | null;
    thumbnailUrl: string | null;
    description: string | null;
  }> {
    const normalized = this.normalizeUrl(url);

    // 1. YouTube & YouTube Shorts
    if (platform === 'youtube') {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(normalized)}&format=json`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data && data.title) {
            return {
              title: data.title,
              author: data.author_name || null,
              thumbnailUrl: data.thumbnail_url || null,
              description: null,
            };
          }
        }
      } catch (e) {}

      // Fallback: noembed for YouTube
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(normalized)}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data && data.title && !data.error) {
            return {
              title: data.title,
              author: data.author_name || null,
              thumbnailUrl: data.thumbnail_url || null,
              description: null,
            };
          }
        }
      } catch (e) {}
    }

    // 2. TikTok oEmbed
    if (platform === 'tiktok') {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data && data.title) {
            return {
              title: data.title,
              author: data.author_name || null,
              thumbnailUrl: data.thumbnail_url || null,
              description: data.title,
            };
          }
        }
      } catch (e) {}
    }

    // 3. noembed.com fallback for Vimeo, Reddit, Twitter, and general links
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data && data.title && !data.error) {
          return {
            title: data.title,
            author: data.author_name || null,
            thumbnailUrl: data.thumbnail_url || null,
            description: data.description || null,
          };
        }
      }
    } catch (e) {}

    // 4. Jina Reader fallback for Articles, GitHub, Blogs (Extracts clean markdown)
    if (platform !== 'instagram' && platform !== 'tiktok') {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(`https://r.jina.ai/${url}`, {
          headers: { 'Accept': 'text/plain' },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const text = await res.text();
          const titleMatch = text.match(/^Title:\s*([^\r\n]+)/im);
          const title = titleMatch ? titleMatch[1].trim() : null;
          const cleanContent = text.replace(/Title:[^\n]+/i, '').replace(/URL Source:[^\n]+/i, '').trim().slice(0, 400);
          return {
            title: title || null,
            author: null,
            thumbnailUrl: null,
            description: cleanContent || null,
          };
        }
      } catch (e) {}
    }

    return { title: null, author: null, thumbnailUrl: null, description: null };
  }

  /**
   * Fast rule-based heuristic category guess based on keywords
   */
  public static heuristicCategory(text: string): SmartVideoCategory {
    const t = text.toLowerCase();

    // 1. Montage, Video Editing, Content Creation (الأولوية الأولى كما طلب القائد)
    if (t.match(/(مونتاج|تعديل فيديو|تعديل المقاطع|بريمير|premiere|كاب كات|capcut|افتر افكت|after effects|ديفينشي|davinci|فوتوشوب|photoshop|تصوير|كاميرا|b-roll|انتقالات|transitions|color grade|تلوين|صوتيات|vfx|مؤثرات|صناعة محتوى|إضاءة|إخراج|video edit|keyframes|render|ريندر|cut)/i)) {
      return 'editing';
    }

    // 2. Fitness & Bodybuilding & Nutrition
    if (t.match(/(تمرين|جسم|عضل|وزن|كاليسثنكس|calisthenics|سعرات|تغذية|بروتين|دايت|صحة|طعام|بناء جسم|ضخامة|كارديو)/i)) {
      return 'fitness';
    }

    // 3. Business & Sales & Marketing
    if (t.match(/(مبيعات|تسويق|بزنس|مشروع|فلوس|ربح|عملاء|سيلز|sales|business|marketing|ريادة|شركة|نيكسيس|محامين|تجارة|صفقات|deal)/i)) {
      return 'business';
    }

    // 4. Tech & Coding & AI
    if (t.match(/(برمج|كود|ذكاء|ai|code|python|react|javascript|api|أداة|tool|تطبيق|حاسوب|linux|github|web|هندسة|automation|أتمتة)/i)) {
      return 'tech';
    }

    // 5. Educational & College & Languages
    if (t.match(/(كورس|جامعة|كلية|دراسة|امتحان|لغة|انجليزي|english|شهادة|coursera|محاضرة|كلاس روم|grammar|محادثة)/i)) {
      return 'educational';
    }

    // 6. Mindset & Habits & Productivity
    if (t.match(/(عادات|تركيز|انتاجية|تحفيز|نوم|عقل|كتاب|قراءة|وعي|mindset|productivity|صباح|روتين)/i)) {
      return 'mindset';
    }

    // 7. Entertainment
    if (t.match(/(ضحك|نكت|كوميدي|ترفيه|مقلب|ميمز|gaming|العاب|game|fun|funny)/i)) {
      return 'entertainment';
    }

    return 'general';
  }

  /**
   * Main Intelligence Pipeline: Extracts metadata and conducts Deep Gemini Semantic Analysis
   */
  public static async analyzeVideoShare(rawShareText: string, userHint?: string): Promise<VideoAnalysisResult> {
    const { url, accompanyingText } = this.parseShareText(rawShareText);
    const platform = this.detectPlatform(url || rawShareText);

    // Step 1: Fetch live real metadata
    const liveData = url ? await this.fetchLiveMetadata(url, platform) : { title: null, author: null, thumbnailUrl: null, description: null };

    // Combine all real signals including any hint from the user
    const realTitle = liveData.title || '';
    const realAuthor = liveData.author || '';
    const realDesc = liveData.description || '';
    const combinedContext = [userHint, accompanyingText, realTitle, realDesc, realAuthor].filter(Boolean).join(' | ');

    // Fallback baseline in case AI fails
    const initialCategory = this.heuristicCategory(combinedContext || rawShareText);
    const fallbackTitle = realTitle || userHint || (accompanyingText.length > 5 ? accompanyingText.slice(0, 50) : `فيديو مفيد: ${CATEGORY_LABELS[initialCategory].label}`);

    const apiKey = geminiConfig.getApiKey();
    if (!apiKey) {
      return {
        title: fallbackTitle,
        category: initialCategory,
        categoryArabicLabel: CATEGORY_LABELS[initialCategory].label,
        problemSolved: realTitle ? `فائدة عملية مرتبطة بـ: ${realTitle}` : 'ملخص مفيد محفوظ في خزانة المعرفة',
        keyTakeaways: [fallbackTitle],
        tags: [initialCategory, platform],
        thumbnailUrl: liveData.thumbnailUrl,
        platform,
        author: realAuthor || null,
        originalRawTitle: realTitle || null,
      };
    }

    // Step 2: Gemini AI Semantic Extraction
    const prompt = `أنت خبير فائق الدقة والذكاء في تحليل محتوى الفيديو واستخراج القيمة العملية للمبدع وصانع المحتوى محمد قرمان.
قام محمد بمشاركة هذا الفيديو:
- المنصة: ${platform}
- الرابط: ${url}
- العنوان الأصلي: "${realTitle}"
- نص المشاركة / الكابشن المرافق: "${accompanyingText}"
- وصف ومحتوى الفيديو: "${realDesc}"
- تلميح أو توضيح إضافي: "${userHint || ''}"
- المؤلف/القناة: "${realAuthor}"

المطلوب بدقة مطلقة:
1. إذا كان الفيديو يتناول المونتاج، أو برامج التعديل (Premiere, CapCut, DaVinci, After Effects, Photoshop)، أو التصوير أو الإخراج أو الصوتيات أو صناعة المحتوى المرئي:
   - يجب تصنيفه حصراً تحت فئة "editing" (مونتاج وصناعة محتوى).
   - ركّز على ذكر التقنيات المحددة (مثل: سرعة التقطيع، التلوين، المؤثرات، اختصارات الكيبورد، حلول التصدير والريندر).
2. إذا كان عن التمارين أو زيادة الوزن أو التغذية: صنفه "fitness" واذكر العضلات أو السعرات أو التمرين بدقة.
3. إذا كان عن المبيعات أو التسويق أو المشاريع: صنفه "business" واذكر استراتيجية البيع أو الاستهداف.
4. إذا كان عن البرمجة أو الذكاء الاصطناعي: صنفه "tech" واذكر الأداة أو الكود.
5. إذا كان عن الإنجليزية أو الكلية أو الكورسات: صنفه "educational".
6. إذا كان عن الترفيه والمنوعات: صنفه "entertainment".
7. صنفه "mindset" فقط إذا كان الفيديو يتحدث تحديداً وبشكل خالص عن عادات العقل أو النوم أو الإنتاجية.

تنبيه حاسم:
- ممنوع منعاً باتاً كتابة عبارات عامة مثل "تحليل دقيق للمحتوى" أو "محتوى تكتيكي" أو الاكتفاء بكلمة واحدة مبهمة.
- اكتب فائدة ملموسة يفهم منها محمد بالضبط ماذا سيتعلم وما المشكلة التي يحلها الفيديو.

أخرج JSON صافٍ فقط بالصيغة التالية:
{
  "title": "عنوان دقيق وواضح جداً باللغة العربية يحدد موضوع الفيديو الحقيقي والأداة المستخدمة",
  "category": "editing" | "tech" | "business" | "fitness" | "educational" | "mindset" | "entertainment" | "general",
  "problemSolved": "المشكلة الدقيقة التي يعالجها الفيديو والحل أو الفائدة العملية المباشرة (سطر إلى سطرين ملخصين الزبدة بوضوح)",
  "keyTakeaways": [
    "فائدة عملية وأداة/اختصار 1",
    "فائدة عملية وتقنية 2",
    "فائدة عملية 3"
  ],
  "tags": ["وسم1", "وسم2", "وسم3"]
}`;

    const candidateModels = [
      'gemini-3.5-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-3.8-flash'
    ];

    for (const model of candidateModels) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.25, // High precision
              maxOutputTokens: 700,
            }
          })
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            let cleaned = text.trim();
            if (cleaned.includes('```json')) {
              cleaned = cleaned.split('```json')[1].split('```')[0].trim();
            } else if (cleaned.includes('```')) {
              cleaned = cleaned.split('```')[1].split('```')[0].trim();
            }

            const parsed = JSON.parse(cleaned);
            const cat = (parsed.category in CATEGORY_LABELS) ? (parsed.category as SmartVideoCategory) : initialCategory;

            return {
              title: parsed.title || fallbackTitle,
              category: cat,
              categoryArabicLabel: CATEGORY_LABELS[cat].label,
              problemSolved: parsed.problemSolved || `فائدة عملية محددة حول موضوع ${CATEGORY_LABELS[cat].label}`,
              keyTakeaways: Array.isArray(parsed.keyTakeaways) && parsed.keyTakeaways.length > 0 ? parsed.keyTakeaways : [fallbackTitle],
              tags: Array.isArray(parsed.tags) ? parsed.tags : [cat, platform],
              thumbnailUrl: liveData.thumbnailUrl,
              platform,
              author: realAuthor || null,
              originalRawTitle: realTitle || null,
            };
          }
        }
      } catch (err) {
        // Fallback to next candidate model
      }
    }

    // Safe fallback if all models failed network
    return {
      title: fallbackTitle,
      category: initialCategory,
      categoryArabicLabel: CATEGORY_LABELS[initialCategory].label,
      problemSolved: realTitle ? `فائدة عملية مرتبطة بـ: ${realTitle}` : `محتوى مفيد متخصص في ${CATEGORY_LABELS[initialCategory].label}`,
      keyTakeaways: [fallbackTitle],
      tags: [initialCategory, platform],
      thumbnailUrl: liveData.thumbnailUrl,
      platform,
      author: realAuthor || null,
      originalRawTitle: realTitle || null,
    };
  }
}
