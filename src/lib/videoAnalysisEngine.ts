import { geminiConfig } from './gemini';

export type SmartVideoCategory = 
  | 'tech'          // تقني وبرمجة وذكاء اصطناعي
  | 'educational'   // تعليمي ودراسة وكورسات
  | 'business'      // أعمال وإدارة ومبيعات
  | 'fitness'       // صحة وجسم وتغذية
  | 'mindset'       // تطوير ذات وعادات
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
  tech: { label: 'تقني وأدوات', icon: '💻', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
  educational: { label: 'تعليمي وكورسات', icon: '📚', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  business: { label: 'أعمال ومبيعات', icon: '💼', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  fitness: { label: 'صحة وجسم', icon: '🏋️‍♂️', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  mindset: { label: 'تطوير ذات', icon: '🧠', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
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
   * Normalizes URLs, particularly converting YouTube Shorts to standard watch links
   */
  public static normalizeUrl(rawUrl: string): string {
    let url = rawUrl.trim();
    // Convert https://www.youtube.com/shorts/VIDEO_ID or https://youtu.be/VIDEO_ID
    const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/i);
    if (shortsMatch && shortsMatch[1]) {
      return `https://www.youtube.com/watch?v=${shortsMatch[1]}`;
    }
    const youtuBeMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/i);
    if (youtuBeMatch && youtuBeMatch[1]) {
      return `https://www.youtube.com/watch?v=${youtuBeMatch[1]}`;
    }
    return url;
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
   * Fetch live oEmbed metadata from YouTube, TikTok, or noembed fallback
   */
  public static async fetchLiveMetadata(url: string, platform: string): Promise<{
    title: string | null;
    author: string | null;
    thumbnailUrl: string | null;
    description: string | null;
  }> {
    const normalized = this.normalizeUrl(url);

    // 1. YouTube & YouTube Shorts oEmbed
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
          return {
            title: data.title || null,
            author: data.author_name || null,
            thumbnailUrl: data.thumbnail_url || null,
            description: null,
          };
        }
      } catch (e) {
        // Continue to fallback
      }
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
          return {
            title: data.title || null,
            author: data.author_name || null,
            thumbnailUrl: data.thumbnail_url || null,
            description: data.title || null,
          };
        }
      } catch (e) {
        // Continue to fallback
      }
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
    } catch (e) {
      // Continue to fallback
    }

    // 4. Jina Reader fallback for Instagram, Threads, and Web Articles (Extracts clean markdown)
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
        // Take first 300 characters of meaningful content
        const cleanContent = text.replace(/Title:[^\n]+/i, '').replace(/URL Source:[^\n]+/i, '').trim().slice(0, 400);
        return {
          title: title || null,
          author: null,
          thumbnailUrl: null,
          description: cleanContent || null,
        };
      }
    } catch (e) {
      // Silent fallback
    }

    return { title: null, author: null, thumbnailUrl: null, description: null };
  }

  /**
   * Fast rule-based heuristic category guess based on keywords
   */
  public static heuristicCategory(text: string): SmartVideoCategory {
    const t = text.toLowerCase();
    if (t.match(/(برمج|كود|ذكاء|ai|code|python|react|javascript|api|أداة|tool|تطبيق|حاسوب|linux|github)/)) {
      return 'tech';
    }
    if (t.match(/(تمرين|جسم|عضل|وزن|كاليسثنكس|calisthenics|سعرات|تغذية|بروتين|دايت|صحة|طعام)/)) {
      return 'fitness';
    }
    if (t.match(/(مبيعات|تسويق|بزنس|مشروع|فلوس|ربح|عملاء|سيلز|sales|business|marketing|ريادة|شركة)/)) {
      return 'business';
    }
    if (t.match(/(عادات|تركيز|انتاجية|تحفيز|نوم|عقل|كتاب|قراءة|وعي|mindset|productivity)/)) {
      return 'mindset';
    }
    if (t.match(/(كورس|جامعة|كلية|دراسة|امتحان|لغة|انجليزي|english|شهادة|coursera|محاضرة)/)) {
      return 'educational';
    }
    if (t.match(/(ضحك|نكت|كوميدي|ترفيه|مقلب|ميمز|gaming|العاب|game|fun|funny)/)) {
      return 'entertainment';
    }
    return 'general';
  }

  /**
   * Main Intelligence Pipeline: Extracts live metadata and conducts Deep Gemini Semantic Analysis
   */
  public static async analyzeVideoShare(rawShareText: string): Promise<VideoAnalysisResult> {
    const { url, accompanyingText } = this.parseShareText(rawShareText);
    const platform = this.detectPlatform(url || rawShareText);

    // Step 1: Fetch live real metadata
    const liveData = url ? await this.fetchLiveMetadata(url, platform) : { title: null, author: null, thumbnailUrl: null, description: null };

    // Combine all real signals
    const realTitle = liveData.title || '';
    const realAuthor = liveData.author || '';
    const realDesc = liveData.description || '';
    const combinedContext = [accompanyingText, realTitle, realDesc, realAuthor].filter(Boolean).join(' | ');

    // Fallback baseline in case AI fails
    const initialCategory = this.heuristicCategory(combinedContext || rawShareText);
    const fallbackTitle = realTitle || (accompanyingText.length > 5 ? accompanyingText.slice(0, 50) : `محتوى ${CATEGORY_LABELS[initialCategory].label}`);

    // If no Gemini API key or empty input, return instant heuristic result
    const apiKey = geminiConfig.getApiKey();
    if (!apiKey) {
      return {
        title: fallbackTitle,
        category: initialCategory,
        categoryArabicLabel: CATEGORY_LABELS[initialCategory].label,
        problemSolved: realTitle ? `فائدة متعلقة بـ ${realTitle}` : 'محتوى مفيد محفوظ للمراجعة والاستفادة السريعة',
        keyTakeaways: [fallbackTitle],
        tags: [initialCategory, platform],
        thumbnailUrl: liveData.thumbnailUrl,
        platform,
        author: realAuthor || null,
        originalRawTitle: realTitle || null,
      };
    }

    // Step 2: Gemini AI Semantic Extraction
    const prompt = `أنت محلل محتوى تكتيكي فائق الذكاء في منظومة «عقلية» لمحمد قرمان.
قام محمد بمشاركة فيديو/ريلز حقيقي:
- المنصة: ${platform}
- الرابط: ${url}
- العنوان الأصلي المكتشف: "${realTitle}"
- نص المشاركة / الكابشن المرافق: "${accompanyingText}"
- وصف ومحتوى الفيديو: "${realDesc}"
- المؤلف/القناة: "${realAuthor}"

المطلوب بدقة تامة:
حلل هذا المحتوى الفعلي وفهمه بدقة، وأخرج JSON صافٍ ومحدد فقط بدون أي كلام عشوائي، بالصيغة التالية:
{
  "title": "عنوان ذكي ومحدد جداً باللغة العربية يصف ما يتحدث عنه الفيديو بدقة وبدون أي عشوائية",
  "category": "tech" أو "educational" أو "business" أو "fitness" أو "mindset" أو "entertainment" أو "general",
  "problemSolved": "الفائدة الحقيقية الملموسة أو المشكلة الدقيقة التي يحلها هذا الفيديو (سطر إلى سطرين واضحة ومباشرة تلخص الزبدة)",
  "keyTakeaways": [
    "فائدة عملية 1",
    "فائدة عملية 2"
  ],
  "tags": ["وسم1", "وسم2", "وسم3"]
}

قواعد التصنيف الدقيقة:
- tech: تقني، برمجة، ذكاء اصطناعي، أدوات ومواقع تقنية.
- educational: تعليمي، كورسات، لغات (إنجليزية)، دراسة جامعية، مهارات علمية.
- business: أعمال، مبيعات، تسويق، ريادة مشاريع، تجارة، إداريات.
- fitness: صحة، تمارين جيم/كاليسثنكس، تغذية، زيادة وزن وسعرات، مرونة.
- mindset: تطوير ذات، عادات يومية، تركيز، إنتاجية، تحفيز.
- entertainment: ترفيهي، ترويح، منوعات هادفة، طرائف.
- general: مراجع ومعلومات عامة.

تنبيه حاسم: لا تضع أي شروحات أو نصوص خارج كتلة الـ JSON.`;

    const candidateModels = [
      'gemini-3.5-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-3.8-flash',
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
              temperature: 0.3, // Lower temperature to avoid hallucinations
              maxOutputTokens: 600,
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
              problemSolved: parsed.problemSolved || 'فائدة عملية محددة تلخص موضوع الفيديو',
              keyTakeaways: Array.isArray(parsed.keyTakeaways) ? parsed.keyTakeaways : [fallbackTitle],
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
      problemSolved: realTitle ? `فائدة عملية مرتبطة بـ: ${realTitle}` : 'ملخص مفيد محفوظ في خزانة المعرفة',
      keyTakeaways: [fallbackTitle],
      tags: [initialCategory, platform],
      thumbnailUrl: liveData.thumbnailUrl,
      platform,
      author: realAuthor || null,
      originalRawTitle: realTitle || null,
    };
  }
}
