import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  ExternalLink, 
  Check, 
  X, 
  Share2, 
  Lightbulb, 
  CheckCircle2, 
  RotateCw,
  Film,
  Mic,
  MicOff,
  Volume2,
  Wand2,
  Globe,
  Code2,
  Brain,
  Dumbbell,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import type { IntelItem, IntelCategory, IntelPlatform, Mission } from '../types';
import { VideoAnalysisEngine, CATEGORY_LABELS, type SmartVideoCategory } from '../lib/videoAnalysisEngine';
import { UnifiedStorage } from '../lib/storage/unifiedStorage';

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
  const [category, setCategory] = useState<SmartVideoCategory>('general');
  const [platform, setPlatform] = useState<IntelPlatform>('web');
  const [problemSolved, setProblemSolved] = useState('');
  const [keyTakeaways, setKeyTakeaways] = useState('');
  const [selectedMissionId, setSelectedMissionId] = useState<string>(''); // Default: independent
  const [tagInput, setTagInput] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [userHint, setUserHint] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [isManualEdit, setIsManualEdit] = useState(true);

  // Audio Scanner Speech Recognition States
  const [isListeningAudio, setIsListeningAudio] = useState(false);
  const [capturedSpeech, setCapturedSpeech] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Run instant deep analysis on incoming text/link
    runAnalysis(initialText);

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [initialText]);

  const runAnalysis = async (text: string, hint?: string, spokenWords?: string) => {
    if (!text || !text.trim()) return;
    setIsAnalyzing(true);
    setAnalysisDone(false);

    try {
      const parsed = VideoAnalysisEngine.parseShareText(text);
      setUrl(parsed.url || text.trim());
      setPlatform(VideoAnalysisEngine.detectPlatform(parsed.url || text));

      const effectiveHint = hint !== undefined ? hint : userHint;
      const effectiveSpoken = spokenWords !== undefined ? spokenWords : capturedSpeech;

      const analysis = await VideoAnalysisEngine.analyzeVideoShare(text, effectiveHint, effectiveSpoken);

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

  /**
   * Start / Stop Listening to the video audio from the phone speaker or mic
   */
  const toggleAudioScanner = () => {
    if (isListeningAudio) {
      // Stop and immediately analyze what was heard
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListeningAudio(false);
      if (capturedSpeech.trim()) {
        runAnalysis(initialText, userHint, capturedSpeech.trim());
      }
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('التعرف على الصوت يتطلب تفعيل صلاحية الميكروفون في المتصفح أو التطبيق.');
      return;
    }

    try {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRec();
      rec.lang = 'ar-SA';
      rec.continuous = true;
      rec.interimResults = true;

      rec.onstart = () => {
        setIsListeningAudio(true);
        setCapturedSpeech('');
      };

      rec.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        setCapturedSpeech(transcript.trim());
      };

      rec.onerror = (e: any) => {
        console.warn('Speech error:', e);
        setIsListeningAudio(false);
      };

      rec.onend = () => {
        setIsListeningAudio(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.warn('Could not start recognition:', err);
      setIsListeningAudio(false);
    }
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsManualEdit(true);

    const effectiveUrl = url.trim() || initialText.trim() || 'https://aqliya.internal';
    const effectiveTitle = title.trim() || (effectiveUrl ? `محتوى محفوظ [${platform.toUpperCase()}]` : 'محتوى استخباري جديد');

    const tags = tagInput
      .split(/[, ]+/)
      .filter((t) => t.trim().length > 0)
      .map((t) => t.replace('#', ''));

    // Permanent safe storage in UnifiedStorage
    try {
      UnifiedStorage.addIntelItem({
        title: effectiveTitle,
        url: effectiveUrl,
        category: (category as any) || 'general',
        source: (platform as any) || 'web',
        problemSolved: problemSolved.trim() || undefined,
        summary: keyTakeaways.trim() || problemSolved.trim() || 'تم حفظ المحتوى',
        keyTakeaways: keyTakeaways.trim() ? [keyTakeaways.trim()] : [],
        tags: tags.length > 0 ? tags : [category, platform],
        thumbnailUrl: thumbnailUrl || undefined,
      });
    } catch (e) {
      console.warn('Failed saving to UnifiedStorage:', e);
    }

    onSave({
      title: effectiveTitle,
      url: effectiveUrl,
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

  const domainOptions = [
    { key: 'tech', label: '💻 برمجة وتقنية وAI', hint: 'برمجة وكود وأدوات ذكاء اصطناعي ومكتبات تقنية' },
    { key: 'general', label: '🌐 مواقع وأدوات مفيدة', hint: 'مواقع ويب مفيدة وأدوات تختصر الوقت' },
    { key: 'mindset', label: '🧠 نصائح وعادات وتطوير', hint: 'نصائح في الحياة والتركيز وتنظيم الوقت والإنتاجية' },
    { key: 'fitness', label: '🏋️‍♂️ رياضة ولياقة وتغذية', hint: 'تمارين كاليسثنكس وجيم وبناء عضل وزيادة وزن وسعرات' },
    { key: 'business', label: '💼 بزنس ومبيعات ومشاريع', hint: 'مبيعات وتسويق وريادة أعمال وإغلاق صفقات ومشاريع' },
    { key: 'educational', label: '📚 دراسة وكورسات ولغات', hint: 'دراسة ومحاضرات أكاديمية ولغة إنجليزية وكورسات' },
    { key: 'editing', label: '🎬 مونتاج وصناعة محتوى', hint: 'مونتاج فيديو وبرامج تعديل بريمير وكاب كات وافتر افكت' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-2xl p-3 sm:p-4 animate-in fade-in duration-200 text-right font-sans overflow-y-auto">
      <div className="apple-glass-elevated w-full max-w-lg rounded-3xl p-4 sm:p-5 border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-2.5 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white shadow-md">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>تحليل ومشاركة المحتوى الذكي</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-white font-mono">
                  {platform.toUpperCase()}
                </span>
              </h2>
              <p className="text-xs text-zinc-400">فهم حقيقي لكلام الفيديو والمواقع في كافة المجالات</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Top Save & Quick Action Bar */}
        <div className="p-2.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-2 mb-3 flex-shrink-0">
          <button
            onClick={() => handleSave()}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 fill-current" />
            <span>حفظ الاستخبارات بلمسة واحدة</span>
          </button>
          <span className="text-[11px] text-zinc-400">
            راجع البيانات أو عدّلها ثم اضغط حفظ
          </span>
        </div>

        {/* 1. Instant Audio Scanner Card (استماع وتحليل صوت الفيديو) */}
        <div className={`p-3 rounded-2xl border transition-all mb-2.5 ${
          isListeningAudio
            ? 'bg-rose-500/15 border-rose-500/40 text-white shadow-lg'
            : 'bg-white/[0.03] border-white/10 text-zinc-200'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <Volume2 className={`h-4 w-4 ${isListeningAudio ? 'text-rose-400 animate-pulse' : 'text-zinc-300'}`} />
              <span className="text-xs font-bold text-white">ماسح صوت الفيديو (فهم كلام المتحدث)</span>
            </div>
            <span className="text-[10px] text-zinc-400">تحليل فوري بدون تخمين</span>
          </div>

          <p className="text-[11px] text-zinc-400 leading-relaxed mb-2">
            شغّل صوت الفيديو على سماعة الهاتف أو تحدث بنفسك، وسيقوم Moha Agent بالاستماع وتحليل الفكرة حرفياً:
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleAudioScanner}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${
                isListeningAudio
                  ? 'bg-rose-500 text-white animate-pulse shadow-md'
                  : 'bg-white text-black hover:bg-zinc-200 shadow'
              }`}
            >
              {isListeningAudio ? (
                <>
                  <MicOff className="h-4 w-4 animate-bounce" />
                  <span>جارٍ الاستماع للصوت... (اضغط للتحليل الآن ⚡)</span>
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  <span>🎙️ استماع وتحليل صوت الفيديو في ثوانٍ</span>
                </>
              )}
            </button>
          </div>

          {capturedSpeech && (
            <div className="mt-2 p-2.5 rounded-xl bg-black/40 border border-white/10 text-[11px] text-zinc-200">
              <span className="text-zinc-400 block text-[10px] mb-0.5 font-bold">ما تم التقاطه من الصوت:</span>
              <p className="font-mono text-emerald-300">"{capturedSpeech}"</p>
              <div className="mt-1.5 flex justify-end">
                <button
                  type="button"
                  onClick={() => runAnalysis(initialText, userHint, capturedSpeech)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-bold"
                >
                  إعادة استخلاص الفائدة من هذا الكلام ⚡
                </button>
              </div>
            </div>
          )}
        </div>

        {/* AI Analysis Status Banner */}
        <div className={`mb-2.5 p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-2.5 flex-shrink-0 ${
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
                <span className="text-xs font-medium">جارٍ استخلاص الفائدة الدقيقة وتحليل المحتوى...</span>
              </>
            ) : analysisDone ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <span className="text-xs font-bold">تم فهم وتوثيق المحتوى بدقة!</span>
              </>
            ) : (
              <span className="text-xs">رابط جاهز للتحليل</span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleSave()}
              className="px-3 py-1 rounded-xl bg-white text-black font-bold text-xs flex items-center gap-1 shadow-md active:scale-95 transition-all hover:bg-zinc-200"
              title="حفظ فوري في بنك الاستخبارات"
            >
              <Check className="h-3.5 w-3.5" />
              <span>حفظ فوري ⚡</span>
            </button>

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
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSave} className="space-y-3 overflow-y-auto pr-1 flex-1">
          
          {/* Quick Domain Selector (كافة المجالات بدون تحيز) */}
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-300 font-bold">اختر مجال المحتوى (أو اضغط زر الصوت أعلاه):</span>
              {userHint && (
                <button
                  type="button"
                  onClick={() => {
                    setUserHint('');
                    runAnalysis(initialText, '', capturedSpeech);
                  }}
                  className="text-zinc-500 hover:text-red-400 text-[10px]"
                >
                  إعادة ضبط
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {domainOptions.map((item, idx) => {
                const isSelected = category === item.key || userHint === item.hint;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setUserHint(item.hint);
                      setCategory(item.key as SmartVideoCategory);
                      runAnalysis(initialText, item.hint, capturedSpeech);
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all active:scale-95 flex items-center gap-1 ${
                      isSelected
                        ? 'bg-white text-black font-bold border-white shadow-sm'
                        : 'bg-white/[0.04] border-white/5 text-zinc-300 hover:bg-white/[0.08]'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick 1-line text hint */}
            <div className="pt-1">
              <input
                type="text"
                value={userHint}
                onChange={(e) => setUserHint(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    runAnalysis(initialText, userHint, capturedSpeech);
                  }
                }}
                placeholder="تلميح إضافي (مثال: أداة ذكاء اصطناعي، تمرين باي، نصيحة نوم...)"
                className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-1.5 text-[11px] text-zinc-200 focus:outline-none focus:border-white font-sans"
              />
            </div>
          </div>

          {/* Thumbnail preview if available */}
          {thumbnailUrl && (
            <div className="relative rounded-2xl overflow-hidden border border-white/10 max-h-32 bg-black/40 flex items-center justify-center group">
              <img 
                src={thumbnailUrl} 
                alt="معاينة الفيديو" 
                className="w-full h-32 object-cover opacity-85 group-hover:opacity-100 transition-opacity" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                <span className="text-[11px] text-white/90 font-medium truncate flex items-center gap-1.5">
                  <Film className="h-3.5 w-3.5 text-emerald-400" />
                  <span>معاينة المرجع الأصلي</span>
                </span>
              </div>
            </div>
          )}

          {/* 1. Content Title */}
          <div>
            <label className="text-xs text-zinc-300 font-medium block mb-1">
              عنوان المحتوى / الأداة:
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="عنوان واضح يحدد الموضوع الحقيقي بدقة..."
              className="w-full rounded-2xl bg-white/[0.04] border border-white/10 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-white font-medium"
            />
          </div>

          {/* 2. Problem Solved & Key Benefit */}
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Lightbulb className="h-4 w-4 text-amber-400" />
              <span>الفائدة المباشرة أو الحل العملي المستفاد:</span>
            </div>
            <textarea
              rows={2}
              value={problemSolved}
              onChange={(e) => setProblemSolved(e.target.value)}
              placeholder="ما هي الزبدة أو الحل العملي الذي يقدمه هذا الفيديو أو الموقع؟"
              className="w-full rounded-xl bg-black/30 border border-white/5 p-2 text-xs text-zinc-200 focus:outline-none focus:border-white leading-relaxed font-sans"
            />
          </div>

          {/* 3. Practical Key Points / Takeaways */}
          <div>
            <label className="text-xs text-zinc-400 block mb-1">
              النقاط العملية والخطوات المستفادة:
            </label>
            <textarea
              rows={2}
              value={keyTakeaways}
              onChange={(e) => setKeyTakeaways(e.target.value)}
              placeholder="نقطة 1&#10;نقطة 2&#10;نقطة 3"
              className="w-full rounded-2xl bg-white/[0.04] border border-white/10 p-2 text-xs text-zinc-300 focus:outline-none focus:border-white leading-relaxed font-sans"
            />
          </div>

          {/* 4. URL Display */}
          <div>
            <label className="text-xs text-zinc-400 block mb-1">الرابط المكتشف:</label>
            <div className="flex items-center gap-2 rounded-2xl bg-white/[0.03] border border-white/10 px-3 py-1.5">
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
                className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white"
                title="فتح الرابط الأصلي"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* 5. Tags & Project Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">الوسوم:</label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="#برمجة #مواقع #نصائح"
                className="w-full rounded-2xl bg-white/[0.04] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">
                ربط بمشروع (اختياري):
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
          <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-white/5 flex-shrink-0">
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
