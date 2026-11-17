import { geminiConfig } from './gemini';

export type SmartVideoCategory = 
  | 'tech'          // تقني وبرمجة وذكاء اصطناعي وأدوات
  | 'mindset'       // نصائح وعادات وتطوير ذات وتنظيم وقت
  | 'fitness'       // لياقة وبناء جسم وتغذية وتمارين
  | 'business'      // أعمال ومبيعات وتسويق وريادة
  | 'educational'   // تعليمي وكورسات ولغات (إنجليزية) ودراسة
  | 'editing'       // مونتاج وتعديل فيديو وصناعة محتوى
  | 'entertainment' // ترفيه وترويح ومنوعات
  | 'general';      // مواقع وأدوات عامة ومراجع

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
  audioTranscript?: string | null;
}

export const CATEGORY_LABELS: Record<SmartVideoCategory, { label: string; icon: string; color: string }> = {
  tech: { label: 'تقني وبرمجة وAI', icon: '💻', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  mindset: { label: 'نصائح وتطوير ذات', icon: '🧠', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  fitness: { label: 'لياقة وبناء جسم', icon: '🏋️‍♂️', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  business: { label: 'أعمال ومبيعات', icon: '💼', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  educational: { label: 'تعليمي ودراسة', icon: '📚', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  editing: { label: 'مونتاج وصناعة محتوى', icon: '🎬', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  entertainment: { label: 'ترفيه وترويح', icon: '🎭', color: 'text-pink-400 bg-pink-500/10 border-pink-500/30' },
  general: { label: 'مواقع وأدوات عامة', icon: '🌐', color: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/30' },
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
   * Check if local on-device Termux YT-DLP daemon is running on phone
   */
  public static async checkLocalDaemonHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1200);
      const res = await fetch('http://127.0.0.1:8765/health', { signal: controller.signal });
      clearTimeout(timeout);
      if (res.ok) {
        const data = await res.json();
        return data.status === 'active';
      }
      return false;
    } catch {
      return false;
    }
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

    // 0. High-Priority Local On-Device Termux YT-DLP Daemon (Zero-Server, Zero-Laptop, On-Phone)
    try {
      const localController = new AbortController();
      const localTimeout = setTimeout(() => localController.abort(), 2200);
      const localRes = await fetch('http://127.0.0.1:8765/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalized }),
        signal: localController.signal,
      });
      clearTimeout(localTimeout);
      if (localRes.ok) {
        const localData = await localRes.json();
        if (localData && localData.success !== false && (localData.title || localData.description)) {
          return {
            title: localData.title || null,
            author: localData.uploader || null,
            thumbnailUrl: localData.thumbnail || null,
            description: localData.description || null,
          };
        }
      }
    } catch (e) {
      // Local daemon offline or timed out, seamlessly proceed to web extractors
    }

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

    // 4. Jina Reader fallback for Articles, GitHub, Websites (Extracts clean markdown)
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
   * Fast rule-based heuristic category guess based on text, spoken transcript, and URL signals
   * Balanced across ALL domains: Tech, Mindset, Fitness, Business, Education, Editing, Web Tools
   */
  public static heuristicCategory(text: string, rawUrl: string = '', spokenWords: string = ''): SmartVideoCategory {
    const t = `${text} ${rawUrl} ${spokenWords}`.toLowerCase();

    // 1. Tech, Coding, Programming & AI (برمجة، ذكاء اصطناعي، أدوات، مواقع)
    if (t.match(/(برمج|كود|ذكاء|ai|code|python|javascript|typescript|react|api|أداة|tool|موقع|site|حاسوب|linux|github|web|هندسة|automation|أتمتة|chatgpt|claude|gemini|database|backend|frontend|dev|developer)/i)) {
      return 'tech';
    }

    // 2. Fitness, Bodybuilding & Nutrition (رياضة، بناء جسم، تغذية، زيادة وزن)
    if (t.match(/(تمرين|جسم|عضل|وزن|كاليسثنكس|calisthenics|سعرات|تغذية|بروتين|دايت|صحة|طعام|بناء جسم|ضخامة|كارديو|جيم|gym|workout|biceps|squat|pushup|pullup|أكل|وجبة)/i)) {
      return 'fitness';
    }

    // 3. Business, Sales, Marketing & Projects (بزنس، مبيعات، تسويق، ريادة، صفقات)
    if (t.match(/(مبيعات|تسويق|بزنس|مشروع|فلوس|ربح|عملاء|سيلز|sales|business|marketing|ريادة|شركة|نيكسيس|محامين|تجارة|صفقات|deal|leads|عميل|startup|استثمار|دخل)/i)) {
      return 'business';
    }

    // 4. Mindset, Habits, Productivity & Life Advice (نصائح، عادات، تركيز، إنتاجية، تنظيم وقت)
    if (t.match(/(نصيحة|نصائح|عادات|تركيز|انتاجية|نوم|عقل|كتاب|قراءة|وعي|mindset|productivity|روتين صباحي|انضباط|تطوير ذات|هدوء|تحفيز|حياة)/i)) {
      return 'mindset';
    }

    // 5. Educational, College, Courses & Languages (دراسة، كلية، لغات، إنجليزي، كورسات)
    if (t.match(/(كورس|جامعة|كلية|دراسة|امتحان|لغة|انجليزي|english|شهادة|coursera|محاضرة|كلاس روم|grammar|محادثة|مصطلحات|مذاكرة|بحث)/i)) {
      return 'educational';
    }

    // 6. Video Editing & Content Creation (مونتاج، تعديل فيديو، تصوير، مؤثرات)
    if (t.match(/(مونتاج|تعديل فيديو|تعديل المقاطع|بريمير|premiere|كاب كات|capcut|افتر افكت|after effects|ديفينشي|davinci|فوتوشوب|photoshop|تصوير|كاميرا|b-roll|انتقالات|transitions|color grade|تلوين|صوتيات|sfx|vfx|مؤثرات|صناعة محتوى|إضاءة|إخراج|video edit|keyframes|render|ريندر|cut|تقطيع|كليب)/i)) {
      return 'editing';
    }

    // 7. Entertainment & Fun (ترفيه، منوعات)
    if (t.match(/(ضحك|نكت|كوميدي|ترفيه|مقلب|ميمز|gaming|العاب|game|fun|funny)/i)) {
      return 'entertainment';
    }

    // If it's a direct web tool or site link
    if (rawUrl.startsWith('http') && !rawUrl.includes('instagram') && !rawUrl.includes('tiktok') && !rawUrl.includes('youtube')) {
      return 'general';
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
    author: string | null,
    spokenWords?: string | null
  ): VideoAnalysisResult {
    const catLabel = CATEGORY_LABELS[category].label;

    switch (category) {
      case 'tech':
        return {
          title: realTitle || (spokenWords ? `تقنية وبرمجة: ${spokenWords.slice(0, 45)}` : 'أدوات برمجية وحلول الذكاء الاصطناعي والمواقع الذكية'),
          category: 'tech',
          categoryArabicLabel: catLabel,
          problemSolved: spokenWords ? `تطبيق عملي بناءً على ما تم شرحه: ${spokenWords.slice(0, 80)}` : 'أتمتة المهام واستغلال أدوات ومواقع الذكاء الاصطناعي لتسريع التطوير وحل المشاكل التقنية.',
          keyTakeaways: [
            'الاستفادة من الأداة أو الموقع لتنفيذ المهام البرمجية بأقل جهد ووقت.',
            'دمج تقنيات الأتمتة ونماذج الذكاء الاصطناعي لتحسين جودة الكود وسير العمل.',
            'حفظ الرابط كمرجع تقني سريع للتطبيق عند الحاجة.'
          ],
          tags: ['برمجة', 'ذكاء_اصطناعي', 'تقنية', 'مواقع', platform],
          thumbnailUrl,
          platform: platform as any,
          author,
          originalRawTitle: realTitle,
          audioTranscript: spokenWords || null,
        };

      case 'mindset':
        return {
          title: realTitle || (spokenWords ? `نصيحة وتطوير: ${spokenWords.slice(0, 45)}` : 'نصائح استراتيجية في تطوير العقلية وبناء العادات والإنتاجية'),
          category: 'mindset',
          categoryArabicLabel: catLabel,
          problemSolved: spokenWords ? `تطبيق النصيحة العملية المطروحة: ${spokenWords.slice(0, 80)}` : 'التغلب على التشتت، تنظيم وقت اليوم، وبناء روتين يومي صلب يحافظ على الإنتاجية العالية.',
          keyTakeaways: [
            'تطبيق قاعدة التركيز العميق وتقليل المقاطعات الرقمية أثناء ساعات العمل الحساسة.',
            'بناء العادات بالتدريج والالتزام اليومي المستمر بدلاً من الحماس المؤقت.',
            'إدارة الطاقة الذهنية والجسدية عبر النوم الكافي والهدوء التام.'
          ],
          tags: ['نصائح', 'عادات', 'إنتاجية', 'تطوير_ذات', platform],
          thumbnailUrl,
          platform: platform as any,
          author,
          originalRawTitle: realTitle,
          audioTranscript: spokenWords || null,
        };

      case 'fitness':
        return {
          title: realTitle || (spokenWords ? `تمارين وتغذية: ${spokenWords.slice(0, 45)}` : 'تمارين بناء الجسم، الكاليسثنكس، وزيادة الوزن الصحية'),
          category: 'fitness',
          categoryArabicLabel: catLabel,
          problemSolved: spokenWords ? `تطبيق التمرين أو النصيحة الغذائية: ${spokenWords.slice(0, 80)}` : 'زيادة الوزن الصحية نحو 70 كجم عبر تمارين وزن الجسم وفائض السعرات (3000 سعرة) بوجبات طاقة سريعة.',
          keyTakeaways: [
            'التركيز على تمارين السحب والدفع المركبة بمدى حركي كامل لزيادة الكتلة العضلية.',
            'تناول سعرات عالية الكثافة وسهلة البلع (مثل زبدة الفول والشوفان والتمر) بدون غاز.',
            'النوم العميق 7.5 إلى 8 ساعات لتسريع الاستشفاء العضلي وإفراز الهرمونات البنائية.'
          ],
          tags: ['تمارين', 'كاليسثنكس', 'تغذية', 'بناء_جسم', platform],
          thumbnailUrl,
          platform: platform as any,
          author,
          originalRawTitle: realTitle,
          audioTranscript: spokenWords || null,
        };

      case 'business':
        return {
          title: realTitle || (spokenWords ? `بزنس ومبيعات: ${spokenWords.slice(0, 45)}` : 'استراتيجيات المبيعات وإغلاق الصفقات ونمو المشاريع'),
          category: 'business',
          categoryArabicLabel: catLabel,
          problemSolved: spokenWords ? `الاستراتيجية المطروحة في المقطع: ${spokenWords.slice(0, 80)}` : 'استقطاب العملاء المستهدفين وصياغة عروض مقنعة ترفع نسبة إغلاق الصفقات ومعدل التحويل.',
          keyTakeaways: [
            'صياغة عرض لا يُقاوم يحل مشكلة العميل الجوهرية بأقل مخاطرة.',
            'المتابعة الدقيقة والرسائل المباشرة المؤتمتة لتحويل الفرص إلى إيرادات.',
            'بناء نظام تدفق مالي مستدام وقياس كلفة الاستحواذ على العميل.'
          ],
          tags: ['بزنس', 'مبيعات', 'تسويق', 'ريادة_أعمال', platform],
          thumbnailUrl,
          platform: platform as any,
          author,
          originalRawTitle: realTitle,
          audioTranscript: spokenWords || null,
        };

      case 'educational':
        return {
          title: realTitle || (spokenWords ? `تعليم ولغات: ${spokenWords.slice(0, 45)}` : 'تطوير اللغة الإنجليزية والمهارات الأكاديمية والكورسات'),
          category: 'educational',
          categoryArabicLabel: catLabel,
          problemSolved: spokenWords ? `المحتوى التعليمي المكتشف: ${spokenWords.slice(0, 80)}` : 'إتقان المصطلحات، الاستذكار الفعال للمحاضرات الأكاديمية، واكتساب مهارات عملية جديدة.',
          keyTakeaways: [
            'استخدام تقنية الاسترجاع النشط والتكرار المتباعد لتثبيت المصطلحات.',
            'الممارسة اليومية في سياقات أعمال واقعية لتسريع الطلاقة.',
            'توثيق المهارات المكتسبة في المشاريع العملية.'
          ],
          tags: ['تعليم', 'إنجليزي', 'كورسات', 'دراسة', platform],
          thumbnailUrl,
          platform: platform as any,
          author,
          originalRawTitle: realTitle,
          audioTranscript: spokenWords || null,
        };

      case 'editing':
        return {
          title: realTitle || (spokenWords ? `مونتاج وتعديل: ${spokenWords.slice(0, 45)}` : 'تقنيات المونتاج وتسريع تعديل الفيديو الاحترافي (كاب كات / بريمير)'),
          category: 'editing',
          categoryArabicLabel: catLabel,
          problemSolved: spokenWords ? `تكنيك المونتاج المشروح: ${spokenWords.slice(0, 80)}` : 'تسريع التقطيع وحذف الفراغات الصامتة وضبط الانتقالات والمؤثرات لجذب المشاهدين.',
          keyTakeaways: [
            'استخدام اختصارات الكيبورد والتقطيع السريع (Ripple Delete) لرفع إيقاع الفيديو.',
            'تطبيق تصحيح الألوان والتباين ليناسب شاشات الهواتف.',
            'مزامنة المؤثرات الصوتية (SFX) مع حركة الكلمات لزيادة بقاء المشاهد.'
          ],
          tags: ['مونتاج', 'صناعة_محتوى', 'بريمير', 'كاب_كات', platform],
          thumbnailUrl,
          platform: platform as any,
          author,
          originalRawTitle: realTitle,
          audioTranscript: spokenWords || null,
        };

      default:
        return {
          title: realTitle || (spokenWords ? `محتوى مفيد: ${spokenWords.slice(0, 45)}` : `أداة وموقع مفيد في ${catLabel}`),
          category,
          categoryArabicLabel: catLabel,
          problemSolved: spokenWords ? `الفائدة العملية: ${spokenWords.slice(0, 80)}` : `استخلاص الفائدة المباشرة والتطبيق العملي في مجال ${catLabel}.`,
          keyTakeaways: [
            'التركيز على القيمة التطبيقية الفورية للموقع أو الأداة.',
            'ربط الفائدة بالأولويات اليومية ومشاريع العمل.',
            'حفظ المرجع للوصول السريع إليه عند الحاجة.'
          ],
          tags: [category, platform],
          thumbnailUrl,
          platform: platform as any,
          author,
          originalRawTitle: realTitle,
          audioTranscript: spokenWords || null,
        };
    }
  }

  /**
   * Main Intelligence Pipeline: Extracts metadata, audio transcript, and conducts Deep Gemini Semantic Analysis
   * Truly intelligent across all domains: Tech, Mindset, Fitness, Business, Educational, Editing, Tools
   */
  public static async analyzeVideoShare(
    rawShareText: string, 
    userHint?: string, 
    spokenTranscript?: string
  ): Promise<VideoAnalysisResult> {
    const { url, accompanyingText } = this.parseShareText(rawShareText);
    const platform = this.detectPlatform(url || rawShareText);

    // Step 1: Fetch live real metadata
    const liveData = url ? await this.fetchLiveMetadata(url, platform) : { title: null, author: null, thumbnailUrl: null, description: null };

    // Combine all real signals including user hint and spoken words
    const realTitle = liveData.title || '';
    const realAuthor = liveData.author || '';
    const realDesc = liveData.description || '';
    const cleanSpoken = (spokenTranscript || '').trim();
    const combinedContext = [cleanSpoken, userHint, accompanyingText, realTitle, realDesc, realAuthor].filter(Boolean).join(' | ');

    // Fast heuristic category determination
    const initialCategory = this.heuristicCategory(combinedContext, url || rawShareText, cleanSpoken);

    const apiKey = geminiConfig.getApiKey();
    if (!apiKey) {
      return this.getGuaranteedFallback(
        initialCategory,
        platform,
        realTitle || userHint || null,
        liveData.thumbnailUrl,
        realAuthor || null,
        cleanSpoken || null
      );
    }

    // Step 2: Gemini AI Semantic Extraction with audio listening context
    const prompt = `أنت العقل الاستراتيجي وخبير تحليل الفيديو والمحتوى الرقمي للقائد محمد قرمان.
محمد يحفظ مقاطع ومراجع في كافة المجالات الحياتية والعملية (برمجة، مواقع وأدوات مفيدة، نصائح وعادات وتطوير ذات، رياضة وبناء جسم، مبيعات وبزنس، دراسة ولغات، مونتاج، أو ترفيه).

قام محمد بمشاركة هذا الرابط/المحتوى:
- المنصة: ${platform}
- الرابط: ${url}
- العنوان الأصلي المكتشف: "${realTitle}"
- نص المشاركة / الكابشن المرافق: "${accompanyingText}"
- وصف ومحتوى الموقع/الفيديو المكتشف: "${realDesc}"
- تلميح أو توجيه إضافي من محمد: "${userHint || ''}"
- كلام المتحدث المستمع من صوت الفيديو (Audio Transcript): "${cleanSpoken}"
- المؤلف/القناة: "${realAuthor}"

المطلوب بدقة وتحليل عميق:
1. إذا توفر "كلام المتحدث المستمع من صوت الفيديو":
   - استمع وافهم ما يقوله المتحدث بالصوت بدقة تامة. لا تخمن ولا تفترض مجالات عشوائية.
   - صنف المحتوى إلى مجاله الحقيقي بناءً على كلامه الصوتي.
2. إذا كان الرابط لموقع ويب أو أداة ذكاء اصطناعي أو برمجية:
   - افهم ما تقدمه هذه الأداة/الموقع واشرح فائدتها المباشرة وصنفها "tech" أو "general".
3. تحديد الفئة المناسبة من بين:
   - "tech": برمجة، كود، بايثون، ذكاء اصطناعي، أدوات برمجية، مواقع ومكتبات تقنية.
   - "mindset": نصائح في الحياة، عادات، تركيز، قراءة، تنظيم وقت، نوم، إنتاجية، هدوء نفسي.
   - "fitness": رياضة، تمارين كاليسثنكس، جيم، بناء عضل، تغذية، زيادة وزن، سعرات.
   - "business": مبيعات، تسويق، ريادة أعمال، مشاريع، صفقات، أرباح، عملاء، تجارة.
   - "educational": دراسة، جامعة، كلية، لغات، إنجليزي، كورسات، شهادات.
   - "editing": مونتاج، برامج تعديل فيديو (كاب كات، بريمير، ديفينشي)، تصوير، مؤثرات.
   - "entertainment": ترفيه، ألعاب، كوميديا.
   - "general": مواقع عامة ومراجع مفيدة.

قواعد صارمة جداً (خط أحمر):
- ممنوع منعاً باتاً كتابة عبارات مثل: "غير قادر على قراءة المحتوى" أو "لا يتوفر وصف" أو "محتوى تكتيكي" أو "تحليل دقيق".
- اكتب عنواناً عملياً ذكياً يحدد اسم الأداة أو الموضوع الحقيقي المشروح.
- اكتب المشكلة الحقيقية التي يعالجها والحل المباشر في سطرين مركزين.
- اكتب 3 نقاط فائدة تطبيقية حقيقية وتكنيكات دقيقة مما ورد في المقطع.

أخرج JSON صافٍ فقط بالصيغة التالية دون أي نص خارجه:
{
  "title": "عنوان دقيق وواضح جداً باللغة العربية يحدد الموضوع الحقيقي والأداة المستخدمة",
  "category": "tech" | "mindset" | "fitness" | "business" | "educational" | "editing" | "entertainment" | "general",
  "problemSolved": "المشكلة الدقيقة التي يعالجها الفيديو/الموقع والحل أو الفائدة العملية المباشرة",
  "keyTakeaways": [
    "فائدة عملية وأداة/نصيحة 1",
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
                realAuthor || null,
                cleanSpoken || null
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
              audioTranscript: cleanSpoken || null,
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
      realAuthor || null,
      cleanSpoken || null
    );
  }
}
