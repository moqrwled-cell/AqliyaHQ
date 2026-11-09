import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ExternalLink, 
  Check, 
  X, 
  Share2,
  Video,
  Lightbulb,
  Tag,
  CheckCircle2,
  Brain
} from 'lucide-react';
import type { IntelItem, IntelCategory, IntelPlatform, Mission } from '../types';
import { askCommanderAI } from '../lib/gemini';

interface QuickCaptureModalProps {
  initialText: string;
  missions: Mission[];
  onSave: (item: Omit<IntelItem, 'id' | 'created_at' | 'updated_at'>) => void;
  onClose: () => void;
}

export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({
  initialText,
  missions,
  onSave,
  onClose,
}) => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<IntelCategory>('solution_reel');
  const [platform, setPlatform] = useState<IntelPlatform>('web');
  const [problemSolved, setProblemSolved] = useState('');
  const [selectedMissionId, setSelectedMissionId] = useState<string>('');
  const [tagInput, setTagInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);

  useEffect(() => {
    // Extract URL from shared text
    const urlMatch = initialText.match(/(https?:\/\/[^\s]+)/i);
    const extractedUrl = urlMatch ? urlMatch[0] : initialText.trim();
    setUrl(extractedUrl);

    const l = extractedUrl.toLowerCase();
    let detectedPlatform: IntelPlatform = 'web';
    let defaultTitle = 'رابط ومصدر جديد';
    let defaultCat: IntelCategory = 'solution_reel';

    if (l.includes('instagram.com')) {
      detectedPlatform = 'instagram';
      defaultTitle = 'ريلز إنستغرام';
      defaultCat = 'solution_reel';
    } else if (l.includes('tiktok.com')) {
      detectedPlatform = 'tiktok';
      defaultTitle = 'ريلز تيك توك';
      defaultCat = 'solution_reel';
    } else if (l.includes('youtube.com') || l.includes('youtu.be')) {
      detectedPlatform = 'youtube';
      defaultTitle = 'فيديو يوتيوب';
      defaultCat = 'watch_later';
    } else if (l.includes('twitter.com') || l.includes('x.com')) {
      detectedPlatform = 'twitter';
      defaultTitle = 'تغريدة وفكرة';
    } else if (l.includes('github.com')) {
      detectedPlatform = 'github';
      defaultTitle = 'مستودع كود مفتوح';
    }

    setPlatform(detectedPlatform);
    setTitle(defaultTitle);
    setCategory(defaultCat);

    if (missions.length > 0) {
      setSelectedMissionId(missions[0].id);
    }

    // Trigger AI Auto-Analysis
    autoAnalyzeWithAI(extractedUrl, detectedPlatform, initialText);
  }, [initialText, missions]);

  const autoAnalyzeWithAI = async (link: string, plat: string, rawText: string) => {
    setIsAnalyzing(true);
    try {
      const prompt = `أنت المساعد الذكي لمحمد قرمان. تم استقبال مشاركة رابط/ريلز جديد من ${plat}:
النص والرابط: "${rawText}"

المطلوب: قم بتحليل الرابط/النص واستنتج تلقائياً بصيغة JSON صافية:
{
  "title": "عنوان موجز وذكي بالعربية يصف محتوى الريلز بدقة",
  "problemSolved": "ما هي الفائدة العملية أو الحل التقني الذي يقدمه هذا المحتوى؟",
  "category": "solution_reel" أو "watch_later" أو "article" أو "reference",
  "tags": ["وسم1", "وسم2", "وسم3"]
}
لا تضع أي نصوص خارج كتلة JSON.`;

      const aiResponse = await askCommanderAI(prompt, {
        missions,
        intel: [],
        memories: [],
        dossier: null,
      });

      let cleaned = aiResponse.trim();
      if (cleaned.includes('```json')) {
        cleaned = cleaned.split('```json')[1].split('```')[0].trim();
      } else if (cleaned.includes('```')) {
        cleaned = cleaned.split('```')[1].split('```')[0].trim();
      }

      const parsed = JSON.parse(cleaned);
      if (parsed.title) setTitle(parsed.title);
      if (parsed.problemSolved) setProblemSolved(parsed.problemSolved);
      if (parsed.category) setCategory(parsed.category);
      if (parsed.tags && Array.isArray(parsed.tags)) setTagInput(parsed.tags.map((t: string) => `#${t}`).join(' '));
      setAnalysisDone(true);
    } catch (e) {
      console.warn('AI Reel analysis fallback', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    const tags = tagInput
      .split(/[, ]+/)
      .filter((t) => t.trim().length > 0)
      .map((t) => t.replace('#', ''));

    onSave({
      title: title.trim(),
      url: url.trim(),
      category,
      platform,
      problem_solved: problemSolved.trim() || null,
      key_takeaways: null,
      mission_id: selectedMissionId || null,
      tags: tags.length > 0 ? tags : ['auto_captured'],
      status: 'unreviewed',
      thumbnail_url: null,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-in fade-in duration-200 text-right font-sans">
      <div className="apple-glass-elevated w-full max-w-lg rounded-3xl p-6 border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Share2 className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">التقاط وتحليل ذكي</h2>
              <p className="text-xs text-zinc-400">تم استقبال الرابط من تطبيق خارجي</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* AI Analysis Status Banner */}
        <div className={`mb-4 p-3 rounded-2xl border transition-all flex items-center gap-2.5 ${
          isAnalyzing
            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300'
            : analysisDone
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
            : 'bg-white/[0.02] border-white/5 text-zinc-400'
        }`}>
          {isAnalyzing ? (
            <>
              <Sparkles className="h-4 w-4 text-emerald-400 animate-spin" />
              <span className="text-xs font-medium">جارٍ تحليل محتوى الريلز وتصنيفه ذاتياً بواسطة الذكاء الاصطناعي...</span>
            </>
          ) : analysisDone ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-medium">تم استخلاص الفائدة وتصنيف المحتوى تلقائياً بنجاح!</span>
            </>
          ) : (
            <>
              <Brain className="h-4 w-4 text-zinc-500" />
              <span className="text-xs">رابط جاهز للحفظ في بنك المعرفة</span>
            </>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">عنوان المحتوى:</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">الرابط المستلم:</label>
            <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] border border-white/10 px-3 py-2">
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-transparent text-xs text-zinc-300 focus:outline-none font-mono"
              />
              <a href={url} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-emerald-400">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">الفائدة أو المشكلة التي يحلها:</label>
            <textarea
              rows={2}
              value={problemSolved}
              onChange={(e) => setProblemSolved(e.target.value)}
              placeholder="الملخص العملي لما يقدمه هذا الفيديو..."
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 p-3 text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">ربط بمشروع:</label>
              <select
                value={selectedMissionId}
                onChange={(e) => setSelectedMissionId(e.target.value)}
                className="w-full rounded-xl bg-[#0e172a] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">بدون ربط بمشروع محدد</option>
                {missions.map((m) => (
                  <option key={m.id} value={m.id}>
                    [{m.code}] {m.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">الوسوم:</label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="#ريلز #ذكاء #برمجة"
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <Check className="h-4 w-4 stroke-[3]" />
              <span>حفظ في بنك المعرفة</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
