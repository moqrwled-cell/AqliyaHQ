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
  tech: { label: 'تقني وبرمجة وAI', icon: '💻', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
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
   * Extract YouTube 11-char Video ID
   */
  public static extractYouTubeId(url: string): string | null {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|live\/))([a-zA-Z0-9_-]{11})/i);
    return match ? match[1] : null;
  }

  /**
   * Normalizes URLs, particularly converting YouTube Shorts and youtu.be to clean standard watch links
   */
  public static normalizeUrl(rawUrl: string): string {
    let url = rawUrl.trim();

    // 1. YouTube normalization
    const ytId = this.extractYouTubeId(url);
    if (ytId) {
      return `https://www.youtube.com/watch?v=${ytId}`;
    }

    // 2. Remove tracking query parameters like ?si=, ?igsh=, ?feature=share
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
   * Fetch live metadata from YouTube, TikTok, Microlink, or noembed fallback
   */
  public static async fetchLiveMetadata(url: string, platform: string): Promise<{
    title: string | null;
    author: string | null;
    thumbnailUrl: string | null;
    description: string | null;
  }> {
    const normalized = this.normalizeUrl(url);

    // 1. YouTube & YouTube Shorts (Fast & 100% Reliable via oEmbed + Thumbnail)
    if (platform === 'youtube') {
      const ytId = this.extractYouTubeId(url);
      const defaultYtThumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;

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
              thumbnailUrl: data.thumbnail_url || defaultYtThumb,
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
              thumbnailUrl: data.thumbnail_url || defaultYtThumb,
              description: null,
            };
          }
        }
      } catch (e) {}

      if (defaultYtThumb) {
        return { title: null, author: null, thumbnailUrl: defaultYtThumb, description: null };
      }
    }

    // 2. High-speed Microlink extraction (Supports OpenGraph, Titles, Descriptions for web & media)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`https://api.microlink.io?url=${encodeURIComponent(normalized)}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && data.data) {
          const d = data.data;
          const cleanTitle = d.title && !d.title.includes('Login • Instagram') && !d.title.includes('Page not found') ? d.title : null;
          const cleanDesc = d.description && !d.description.includes('Create an account or log in to Instagram') ? d.description : null;
          if (cleanTitle || cleanDesc) {
            return {
              title: cleanTitle,
              author: d.author || d.publisher || null,
              thumbnailUrl: d.image?.url || null,
              description: cleanDesc,
            };
          }
        }
      }
    } catch (e) {}

    // 3. TikTok Handle & oEmbed extraction
    if (platform === 'tiktok') {
      const authorMatch = url.match(/@([a-zA-Z0-9_.-]+)/i);
      const parsedAuthor = authorMatch ? `@${authorMatch[1]}` : null;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (data && (data.title || data.author_name)) {
            return {
              title: data.title || null,
              author: data.author_name || parsedAuthor,
              thumbnailUrl: data.thumbnail_url || null,
              description: data.title || null,
            };
          }
        }
      } catch (e) {}
      if (parsedAuthor) {
        return { title: null, author: parsedAuthor, thumbnailUrl: null, description: null };
      }
    }

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
   * Fast rule-based heuristic category guess based on text and URL signals
   */
  public static heuristicCategory(text: string, rawUrl: string = ''): SmartVideoCategory {
    const t = `${text} ${rawUrl}`.toLowerCase();

    // 1. Montage, Video Editing, Content Creation (الأولوية القصوى بناءً على طلب محمد)
    if (t.match(/(مونتاج|تعديل فيديو|تعديل المقاطع|بريمير|premiere|كاب كات|capcut|افتر افكت|after effects|ديفينشي|davinci|فوتوشوب|photoshop|تصوير|كاميرا|b-roll|انتقالات|transitions|color grade|تلوين|صوتيات|sfx|vfx|مؤثرات|صناعة محتوى|إضاءة|إخراج|video edit|keyframes|render|ريندر|cut|تقطيع|كليب|reels|shorts|edit)/i)) {
      return 'editing';
    }

    // 2. Fitness & Bodybuilding & Nutrition
    if (t.match(/(تمرين|جسم|عضل|وزن|كاليسثنكس|calisthenics|سعرات|تغذية|بروتين|دايت|صحة|طعام|بناء جسم|ضخامة|كارديو|جيم|gym|workout|biceps|squat)/i)) {
      return 'fitness';
    }

    // 3. Business & Sales & Marketing
    if (t.match(/(مبيعات|تسويق|بزنس|مشروع|فلوس|ربح|عملاء|سيلز|sales|business|marketing|ريادة|شركة|نيكسيس|محامين|تجارة|صفقات|deal|leads|عميل)/i)) {
      return 'business';
    }

    // 4. Tech & Coding & AI
    if (t.match(/(برمج|كود|ذكاء|ai|code|python|react|javascript|typescript|api|أداة|tool|تطبيق|حاسوب|linux|github|web|هندسة|automation|أتمتة|chatgpt|claude|gemini)/i)) {
      return 'tech';
    }

    // 5. Educational & College & Languages
    if (t.match(/(كورس|جامعة|كلية|دراسة|امتحان|لغة|انجليزي|english|شهادة|coursera|محاضرة|كلاس روم|grammar|محادثة|مصطلحات)/i)) {
      return 'educational';
    }

    // 6. Mindset & Habits & Productivity (فقط إذا كان خالصاً لتنظيم الوقت والعقل)
    if (t.match(/(عادات|تركيز|انتاجية|نوم|عقل|كتاب|قراءة|وعي|mindset|productivity|روتين صباحي)/i)) {
      return 'mindset';
    }

    // 7. Entertainment
    if (t.match(/(ضحك|نكت|كوميدي|ترفيه|مقلب|ميمز|gaming|العاب|game|fun|funny)/i)) {
      return 'entertainment';
    }

    // Default for short-form social videos when completely empty: default to EDITING
    if (rawUrl.includes('instagram.com/reel') || rawUrl.includes('tiktok.com') || rawUrl.includes('youtube.com/shorts')) {
      return 'editing';
    }

    return 'general';
  }

  /**
   * Get rich guaranteed fallback result for a category (No vague "غير قادر على قراءة المحتوى" EVER)
   */
  public static getGuaranteedFallback(
    category: SmartVideoCategory,
    platform: string,
    realTitle: string | null,
    thumbnailUrl: string | null,
    author: string | null
  ): VideoAnalysisResult {
    const catLabel = CATEGORY_LABELS[category].label;

    switch (category) {
      case 'editing':
        return {
          title: realTitle || 'تقنيات المونتاج وتسريع تعديل الفيديو الاحترافي (كاب كات / بريمير)',
          category: 'editing',
          categoryArabicLabel: catLabel,
          problemSolved: 'تسريع عملية تقطيع الفيديو وحذف الفراغات الصامتة وضبط الانتقالات والمؤثرات الصوتية لجذب المشاهدين.',
          keyTakeaways: [
            'استخدام تقنية التقطيع السريع وحذف الفواصل الصامتة (Ripple Delete) لرفع إيقاع الفيديو.',
            'تطبيق تدرجات لونية (Color Grading) ومنحنيات إضاءة تمنح الفيديو مظهراً سينمائياً ملائماً للهواتف.',
            'مزامنة المؤثرات الصوتية (SFX مثل Whoosh و Pop) مع حركة الكلمات والانتقالات لتثبيت انتباه المشاهد.'
          ],
          tags: ['مونتاج', 'صناعة_محتوى', 'بريمير', 'كاب_كات', platform],
          thumbnailUrl,
          platform: platform as any,
          author,
          originalRawTitle: realTitle,
        };

      case 'tech':
        return {
          title: realTitle || 'حلول برمجية وتطبيقات الذكاء الاصطناعي والأتمتة',
          category: 'tech',
          categoryArabicLabel: catLabel,
          problemSolved: 'أتمتة المهام واستغلال أدوات الذكاء الاصطناعي الحديثة لتسريع وتيرة التطوير وكتابة كود عالي الجودة.',
          keyTakeaways: [
            'توظيف نماذج الذكاء الاصطناعي لتوليد الأكواد وحل المشاكل التقنية المعقدة في ثوانٍ.',
            'بناء أدوات وأتمتة مسارات العمل البرمجية لتقليل الأخطاء اليدوية.',
            'الاستفادة من مكتبات المصادر المفتوحة وأحدث واجهات الـ API لتطوير برمجيات معزولة وسريعة.'
          ],
          tags: ['برمجة', 'ذكاء_اصطناعي', 'تقنية', platform],
          thumbnailUrl,
          platform: platform as any,
          author,
          originalRawTitle: realTitle,
        };

      case 'business':
        return {
          title: realTitle || 'استراتيجيات المبيعات وإغلاق الصفقات ونمو المشاريع',
          category: 'business',
          categoryArabicLabel: catLabel,
          problemSolved: 'بناء قنوات استقطاب العملاء المحتملين وتطبيق أساليب إقناع واضحة لزيادة الإيرادات وإغلاق الصفقات.',
          keyTakeaways: [
            'تحديد الجمهور المستهدف بدقة وصياغة عرض لا يُقاوم يحل مشكلة العميل الجوهرية.',
            'استخدام نماذج المتابعة الاحترافية ورسائل البريد المباشرة المؤتمتة لتحويل الفرص إلى عقود.',
            'إدارة خطوط التدفق المالي والحفاظ على هوامش ربح قوية للاستدامة.'
          ],
          tags: ['مبيعات', 'تسويق', 'ريادة_أعمال', platform],
          thumbnailUrl,
          platform: platform as any,
          author,
          originalRawTitle: realTitle,
        };

      case 'fitness':
        return {
          title: realTitle || 'برنامج بناء الجسم، الكاليسثنكس، والتغذية عالية السعرات',
          category: 'fitness',
          categoryArabicLabel: catLabel,
          problemSolved: 'تحقيق الزيادة الوزنية الصحية (من 54 إلى 70 كجم) بتمارين وزن الجسم وفائض سعرات 3000 سعرة يومياً.',
          keyTakeaways: [
            'التركيز على تمارين السحب والدفع والسكوات المركبة بمدى حركي كامل لتحفيز الألياف العضلية.',
            'توزيع السعرات المكثفة على وجبات سهلة الهضم والبلع دون الاعتماد على الخلاط أو الغاز.',
            'الالتزام بالنوم العميق (7.5 إلى 8 ساعات) لتأمين أقصى درجات الاستشفاء وإفراز هرمون النمو.'
          ],
          tags: ['كاليسثنكس', 'تغذية', 'بناء_أجسام', platform],
          thumbnailUrl,
          platform: platform as any,
          author,
          originalRawTitle: realTitle,
        };

      case 'educational':
        return {
          title: realTitle || 'مهارات الدراسة واللغة الإنجليزية وتطوير المسار الأكاديمي',
          category: 'educational',
          categoryArabicLabel: catLabel,
          problemSolved: 'استيعاب المحاضرات الأكاديمية وإتقان المصطلحات الإنجليزية واجتياز الكورسات المتخصصة بكفاءة.',
          keyTakeaways: [
            'استخدام تقنيات الاستذكار الفعال والاسترجاع النشط لتثبيت المعلومات دون نسيان.',
            'ممارسة الاستماع والتحدث اليومي لكسر حاجز اللغة الإنجليزية في بيئة الأعمال.',
            'تطبيق المعرفة النظرية مباشرة في مشاريع عملية تُضاف إلى معرض الأعمال.'
          ],
          tags: ['تعليم', 'إنجليزي', 'كورسات', platform],
          thumbnailUrl,
          platform: platform as any,
          author,
          originalRawTitle: realTitle,
        };

      default:
        return {
          title: realTitle || `محتوى مميز ومفيد في ${catLabel}`,
          category,
          categoryArabicLabel: catLabel,
          problemSolved: `استخلاص الفائدة المباشرة والتطبيق العملي في مجال ${catLabel}.`,
          keyTakeaways: [
            `التركيز على الخطوات التطبيقية الفورية وتدوين النقاط الرئيسية.`,
            `ربط الفائدة بأهداف العمل والإنتاجية الشخصية.`,
            `حفظ المرجع لمراجعته وتطبيقه في اللحظة المناسبة.`
          ],
          tags: [category, platform],
          thumbnailUrl,
          platform: platform as any,
          author,
          originalRawTitle: realTitle,
        };
    }
  }

  /**
   * Main Intelligence Pipeline: Extracts metadata and conducts Deep Gemini Semantic Analysis
   */
  public static async analyzeVideoShare(rawShareText: string, userHint?: string): Promise<VideoAnalysisResult> {
    const { url, accompanyingText } = this.parseShareText(rawShareText);
    const platform = this.detectPlatform(url || rawShareText);

    // Step 1: Fetch live real metadata
    const liveData = url ? await this.fetchLiveMetadata(url, platform) : { title: null, author: null, thumbnailUrl: null, description: null };

    // Combine all real signals including user hint
    const realTitle = liveData.title || '';
    const realAuthor = liveData.author || '';
    const realDesc = liveData.description || '';
    const combinedContext = [userHint, accompanyingText, realTitle, realDesc, realAuthor].filter(Boolean).join(' | ');

    // Fast heuristic category determination
    const initialCategory = this.heuristicCategory(combinedContext, url || rawShareText);

    const apiKey = geminiConfig.getApiKey();
    if (!apiKey) {
      return this.getGuaranteedFallback(
        initialCategory,
        platform,
        realTitle || userHint || null,
        liveData.thumbnailUrl,
        realAuthor || null
      );
    }

    // Step 2: Gemini AI Semantic Extraction with strict instructions
    const prompt = `أنت العقل الاستراتيجي وخبير تحليل الفيديو والمحتوى الرقمي للقائد ومصمم المحتوى محمد قرمان.
قام محمد بمشاركة هذا الفيديو:
- المنصة: ${platform}
- الرابط: ${url}
- العنوان الأصلي المكتشف: "${realTitle}"
- نص المشاركة / الكابشن المرافق: "${accompanyingText}"
- وصف ومحتوى الفيديو: "${realDesc}"
- تلميح أو توجيه إضافي من محمد: "${userHint || ''}"
- المؤلف/القناة: "${realAuthor}"

المطلوب بدقة مطلقة وبشكل لا يقبل الخطأ:
1. تصنيف المحتوى:
   - إذا كان الفيديو يتناول المونتاج، أو برامج التعديل (Premiere, CapCut, DaVinci, After Effects, Photoshop)، أو التصوير، الإخراج، الصوتيات، أو صناعة المحتوى:
     يجب تصنيفه حصراً "editing" (مونتاج وصناعة محتوى).
   - إذا كان عن التمارين، الكاليسثنكس، بناء الجسم، زيادة الوزن، أو السعرات: صنفه "fitness".
   - إذا كان عن المبيعات، التسويق، الصفقات، المشاريع، أو نيكسيس: صنفه "business".
   - إذا كان عن البرمجة، الكود، الأدوات، أو الذكاء الاصطناعي: صنفه "tech".
   - إذا كان عن الدراسة، الجامعة، اللغات، أو الإنجليزية: صنفه "educational".
   - لا تصنفه "mindset" إلا إذا كان يتحدث فقط وحصراً عن العادات الذهنية أو النوم أو التأمل.
   - إذا لم تتوفر معلومات وكان الرابط فيديو ريلز/شورتس/تيك توك: اعتبره "editing" وقدم دليلاً عملياً في تقنيات المونتاج وصناعة الفيديو.

قواعد صارمة جداً (خط أحمر):
- ممنوع منعاً باتاً كتابة عبارات مثل: "غير قادر على قراءة المحتوى" أو "لا يتوفر وصف" أو "محتوى تكتيكي" أو "تحليل دقيق".
- اكتب عنواناً عملياً ذكياً يحدد الأداة والموضوع بدقة.
- اكتب المشكلة الحقيقية التي يعالجها الفيديو والحل المباشر في سطرين مركزين.
- اكتب 3 نقاط فائدة تطبيقية وتكنيكات دقيقة (اختصارات، خطوات، أساليب).

أخرج JSON صافٍ فقط بالصيغة التالية دون أي نص خارجه:
{
  "title": "عنوان دقيق وواضح جداً باللغة العربية يحدد موضوع الفيديو الحقيقي والأداة المستخدمة",
  "category": "editing" | "tech" | "business" | "fitness" | "educational" | "mindset" | "entertainment" | "general",
  "problemSolved": "المشكلة الدقيقة التي يعالجها الفيديو والحل أو الفائدة العملية المباشرة",
  "keyTakeaways": [
    "فائدة عملية وأداة/اختصار 1",
    "فائدة عملية وتقنية 2",
    "فائدة عملية 3"
  ],
  "tags": ["وسم1", "وسم2", "وسم3"]
}`;

    // Fast working models cascade
    const candidateModels = [
      'gemini-flash-lite-latest',
      'gemini-3.5-flash-lite',
      'gemini-flash-latest'
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
              temperature: 0.2,
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
            let cat = (parsed.category in CATEGORY_LABELS) ? (parsed.category as SmartVideoCategory) : initialCategory;

            // If user specifically asked for editing or hinted it, guarantee editing
            if (userHint && userHint.match(/(مونتاج|تعديل|بريمير|كاب كات|فيديو)/i)) {
              cat = 'editing';
            }

            let title = parsed.title?.trim() || '';
            let problem = parsed.problemSolved?.trim() || '';

            // Post-processing Sanitization Shield: Remove any vague or unable-to-read phrases
            const isInvalidText = (str: string) => 
              !str || 
              str.length < 8 || 
              str.includes('غير قادر') || 
              str.includes('لا يمكن قراءة') || 
              str.includes('لا تتوفر') || 
              str.includes('تحليل دقيق') || 
              str.includes('محتوى تكتيكي');

            if (isInvalidText(title) || isInvalidText(problem)) {
              return this.getGuaranteedFallback(
                cat,
                platform,
                realTitle || userHint || null,
                liveData.thumbnailUrl,
                realAuthor || null
              );
            }

            return {
              title,
              category: cat,
              categoryArabicLabel: CATEGORY_LABELS[cat].label,
              problemSolved: problem,
              keyTakeaways: Array.isArray(parsed.keyTakeaways) && parsed.keyTakeaways.length > 0 ? parsed.keyTakeaways : [title],
              tags: Array.isArray(parsed.tags) ? parsed.tags : [cat, platform],
              thumbnailUrl: liveData.thumbnailUrl,
              platform,
              author: realAuthor || null,
              originalRawTitle: realTitle || null,
            };
          }
        }
      } catch (err) {
        // Fallback to next model
      }
    }

    // Safe guaranteed fallback
    return this.getGuaranteedFallback(
      initialCategory,
      platform,
      realTitle || userHint || null,
      liveData.thumbnailUrl,
      realAuthor || null
    );
  }
}
