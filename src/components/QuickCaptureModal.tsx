import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ExternalLink, 
  Check, 
  X, 
  Share2, 
  Lightbulb, 
  CheckCircle2, 
  RotateCw,
  FolderPlus,
  Play,
  Film
} from 'lucide-react';
import type { IntelItem, IntelCategory, IntelPlatform, Mission } from '../types';
import { VideoAnalysisEngine, CATEGORY_LABELS, type SmartVideoCategory } from '../lib/videoAnalysisEngine';

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
  const [category, setCategory] = useState<SmartVideoCategory>('tech');
  const [platform, setPlatform] = useState<IntelPlatform>('web');
  const [problemSolved, setProblemSolved] = useState('');
  const [keyTakeaways, setKeyTakeaways] = useState('');
  const [selectedMissionId, setSelectedMissionId] = useState<string>(''); // Default: NO project!
  const [tagInput, setTagInput] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [userHint, setUserHint] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);

  useEffect(() => {
    // Run instant deep analysis on incoming text
    runAnalysis(initialText);
  }, [initialText]);

  const runAnalysis = async (text: string, hint?: string) => {
    if (!text || !text.trim()) return;
    setIsAnalyzing(true);
    setAnalysisDone(false);

    try {
      const parsed = VideoAnalysisEngine.parseShareText(text);
      setUrl(parsed.url || text.trim());
      setPlatform(VideoAnalysisEngine.detectPlatform(parsed.url || text));

      const effectiveHint = hint !== undefined ? hint : userHint;
      const analysis = await VideoAnalysisEngine.analyzeVideoShare(text, effectiveHint);

      if (analysis.title) setTitle(analysis.title);
      if (analysis.category) setCategory(analysis.category);
      if (analysis.problemSolved) setProblemSolved(analysis.problemSolved);
      if (analysis.keyTakeaways && analysis.keyTakeaways.length > 0) {
        setKeyTakeaways(analysis.keyTakeaways.join('\n• '));
      }
      if (analysis.tags && analysis.tags.length > 0) {
        setTagInput(analysis.tags.map(t => `#${t.replace('#', '')}`).join(' '));
      }
      if (analysis.thumbnailUrl) {
        setThumbnailUrl(analysis.thumbnailUrl);
      }
      if (analysis.platform) {
        setPlatform(analysis.platform);
      }
      setAnalysisDone(true);
    } catch (e) {
      console.warn('Analysis fallback error:', e);
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
      category: category as IntelCategory,
      platform,
      problem_solved: problemSolved.trim() || null,
      key_takeaways: keyTakeaways.trim() ? `• ${keyTakeaways.trim()}` : null,
      mission_id: selectedMissionId.trim() ? selectedMissionId : null,
      tags: tags.length > 0 ? tags : [category, platform],
      status: 'unreviewed',
      thumbnail_url: thumbnailUrl,
    });

    onClose();
  };

  const availableCategories: SmartVideoCategory[] = [
    'editing',
    'tech',
    'business',
    'fitness',
    'educational',
    'mindset',
    'entertainment',
    'general'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl p-3 sm:p-4 animate-in fade-in duration-200 text-right font-sans overflow-y-auto">
      <div className="apple-glass-elevated w-full max-w-lg rounded-3xl p-5 sm:p-6 border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white shadow-md">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>التقاط وتحليل ذكي للفيديو</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-white font-mono">
                  {platform.toUpperCase()}
                </span>
              </h2>
              <p className="text-xs text-zinc-400">فهم واستخلاص الفائدة الحقيقية بدون كلام عشوائي</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* AI Analysis Status Banner */}
        <div className={`mb-3.5 p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 flex-shrink-0 ${
          isAnalyzing
            ? 'bg-white/10 border-white/20 text-white'
            : analysisDone
            ? 'bg-white/10 border-white/20 text-white'
            : 'bg-white/[0.02] border-white/5 text-zinc-400'
        }`}>
          <div className="flex items-center gap-2">
            {isAnalyzing ? (
              <>
                <Sparkles className="h-4 w-4 text-white animate-spin flex-shrink-0" />
                <span className="text-xs font-medium">جارٍ فحص محتوى الريلز وفهم الفائدة الحقيقية...</span>
              </>
            ) : analysisDone ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-white flex-shrink-0" />
                <span className="text-xs font-bold">تم تحليل الفيديو بنجاح واستخراج الفائدة الدقيقة!</span>
              </>
            ) : (
              <span className="text-xs">رابط جاهز للتحليل</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => runAnalysis(initialText)}
            disabled={isAnalyzing}
            className="p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 hover:text-white transition-all disabled:opacity-50"
            title="إعادة الفحص والتحليل"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSave} className="space-y-3.5 overflow-y-auto pr-1 flex-1">
          
          {/* Quick Topic Hint / Trigger */}
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 font-medium">توجيه فوري للذكاء الاصطناعي (اختر موضوع الفيديو إذا رغبت):</span>
              {userHint && (
                <button
                  type="button"
                  onClick={() => {
                    setUserHint('');
                    runAnalysis(initialText, '');
                  }}
                  className="text-zinc-500 hover:text-red-400 text-[10px]"
                >
                  مسح التوجيه
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: '🎬 مونتاج وبريمير', hint: 'مونتاج فيديو وبرامج تعديل بريمير وكاب كات وافتر افكت' },
                { label: '💻 برمجة وذكاء اصطناعي', hint: 'أدوات ذكاء اصطناعي وتقنية وبرمجة' },
                { label: '💼 مبيعات وبزنس', hint: 'مبيعات وتسويق وإدارة مشاريع' },
                { label: '🏋️‍♂️ تمارين وتغذية', hint: 'تمارين كاليسثينكس وجيم وتغذية وبناء جسم' },
                { label: '📚 إنجليزي ودراسة', hint: 'لغة إنجليزية ودراسة وكورسات' },
                { label: '🧠 عادات وإنتاجية', hint: 'عادات يومية وتنظيم وقت وإنتاجية' },
              ].map((item, idx) => {
                const isActive = userHint === item.hint;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setUserHint(item.hint);
                      runAnalysis(initialText, item.hint);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all active:scale-95 flex items-center gap-1 ${
                      isActive
                        ? 'bg-rose-500/25 border-rose-500/50 text-rose-200 shadow-sm'
                        : 'bg-white/[0.04] border-white/5 text-zinc-300 hover:bg-white/[0.08]'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Thumbnail preview if available */}
          {thumbnailUrl && (
            <div className="relative rounded-2xl overflow-hidden border border-white/10 max-h-36 bg-black/40 flex items-center justify-center group">
              <img 
                src={thumbnailUrl} 
                alt="معاينة الفيديو" 
                className="w-full h-36 object-cover opacity-85 group-hover:opacity-100 transition-opacity" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                <span className="text-[11px] text-white/90 font-medium truncate flex items-center gap-1.5">
                  <Film className="h-3.5 w-3.5 text-emerald-400" />
                  <span>معاينة المحتوى الأصلي</span>
                </span>
              </div>
            </div>
          )}

          {/* 1. Content Title */}
          <div>
            <label className="text-xs text-zinc-300 font-medium block mb-1.5">
              العنوان المناسب للفيديو:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="عنوان واضح يصف موضوع الفيديو..."
              className="w-full rounded-2xl bg-white/[0.04] border border-white/10 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
            />
          </div>

          {/* 2. Interactive Category Chips */}
          <div>
            <label className="text-xs text-zinc-300 font-medium block mb-1.5">
              تصنيف المحتوى (اختر بلمسة واحدة):
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
              {availableCategories.map((catKey) => {
                const info = CATEGORY_LABELS[catKey];
                const isSelected = category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? `${info.color} scale-102 shadow-md`
                        : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span>{info.icon}</span>
                    <span>{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Problem Solved & Key Benefit (Prominent Card) */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/20 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
              <Lightbulb className="h-4 w-4 text-emerald-400" />
              <span>الفائدة المباشرة أو المشكلة التي يحلها:</span>
            </div>
            <textarea
              rows={2}
              value={problemSolved}
              onChange={(e) => setProblemSolved(e.target.value)}
              placeholder="ما هي الزبدة أو الحل العملي الذي يقدمه هذا الفيديو؟"
              className="w-full rounded-xl bg-black/30 border border-white/5 p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 leading-relaxed font-sans"
            />
          </div>

          {/* 4. Practical Key Points / Takeaways */}
          <div>
            <label className="text-xs text-zinc-400 block mb-1">
              النقاط العملية المستفادة:
            </label>
            <textarea
              rows={2}
              value={keyTakeaways}
              onChange={(e) => setKeyTakeaways(e.target.value)}
              placeholder="نقطة 1&#10;نقطة 2"
              className="w-full rounded-2xl bg-white/[0.04] border border-white/10 p-2.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500 leading-relaxed"
            />
          </div>

          {/* 5. URL Display with External Link */}
          <div>
            <label className="text-xs text-zinc-400 block mb-1">الرابط المكتشف:</label>
            <div className="flex items-center gap-2 rounded-2xl bg-white/[0.03] border border-white/10 px-3 py-2">
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-transparent text-[11px] text-zinc-300 focus:outline-none font-mono"
              />
              <a 
                href={url} 
                target="_blank" 
                rel="noreferrer" 
                className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-emerald-400"
                title="فتح الرابط الأصلي"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* 6. Tags & Optional Project Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">الوسوم الذكية:</label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="#تقنية #ذكاء #فيديو"
                className="w-full rounded-2xl bg-white/[0.04] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">
                ربط بمشروع (اختياري - غير إجباري):
              </label>
              <select
                value={selectedMissionId}
                onChange={(e) => setSelectedMissionId(e.target.value)}
                className="w-full rounded-2xl bg-zinc-900 border border-white/10 px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-white"
              >
                <option value="">[ محتوى مستقل - بدون مشروع ]</option>
                {missions.map((m) => (
                  <option key={m.id} value={m.id}>
                    [{m.code}] {m.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/5 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-medium text-zinc-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isAnalyzing}
              className="flex-1 py-2.5 px-6 rounded-2xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
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
