import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ExternalLink, 
  Check, 
  X, 
  Flame, 
  Video, 
  Lightbulb,
  Radio,
  Share2
} from 'lucide-react';
import type { IntelItem, IntelCategory, IntelPlatform, Mission } from '../types';
import { tacticalAudio } from '../lib/audio';

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

  // Extract URL and platform from raw shared text
  useEffect(() => {
    tacticalAudio.playAlert();
    
    // Regex to extract URL from text (e.g. from Instagram "Check out this reel https://www.instagram.com/reel/...")
    const urlMatch = initialText.match(/(https?:\/\/[^\s]+)/i);
    const extractedUrl = urlMatch ? urlMatch[0] : initialText.trim();
    setUrl(extractedUrl);

    const l = extractedUrl.toLowerCase();
    let detectedPlatform: IntelPlatform = 'web';
    let defaultTitle = 'رابط استخباراتي جديد';
    let defaultCat: IntelCategory = 'solution_reel';

    if (l.includes('instagram.com')) {
      detectedPlatform = 'instagram';
      defaultTitle = 'ريلز إنستغرام استخباراتي';
      defaultCat = 'solution_reel';
    } else if (l.includes('tiktok.com')) {
      detectedPlatform = 'tiktok';
      defaultTitle = 'ريلز تيك توك تقني';
      defaultCat = 'solution_reel';
    } else if (l.includes('youtube.com') || l.includes('youtu.be')) {
      detectedPlatform = 'youtube';
      defaultTitle = 'فيديو يوتيوب للمشاهدة لاحقاً';
      defaultCat = 'watch_later';
    } else if (l.includes('twitter.com') || l.includes('x.com')) {
      detectedPlatform = 'twitter';
      defaultTitle = 'تغريدة استخباراتية';
    } else if (l.includes('github.com')) {
      detectedPlatform = 'github';
      defaultTitle = 'مستودع كود مفتوح';
    }

    setPlatform(detectedPlatform);
    setTitle(defaultTitle);
    setCategory(defaultCat);
    
    // Default link to first mission if available (e.g. NexusOS)
    if (missions.length > 0) {
      setSelectedMissionId(missions[0].id);
    }
  }, [initialText, missions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    tacticalAudio.playConfirm();

    const tags = tagInput
      .split(/[, ]+/)
      .filter((t) => t.trim().length > 0)
      .map((t) => t.replace('#', ''));

    onSave({
      title: title.trim() || 'رابط استخباراتي تم التقاطه',
      url: url.trim(),
      category,
      platform,
      problem_solved: problemSolved.trim() || null,
      key_takeaways: null,
      mission_id: selectedMissionId || null,
      tags,
      status: 'unreviewed',
      thumbnail_url: null,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0c101a] border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-right">
        
        {/* Tactical Header */}
        <div className="flex items-center justify-between p-4 border-b craft-border bg-[#0e1424]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 animate-pulse">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-100">التقاط سريع للاستخبارات</h3>
                <span className="text-[10px] font-telemetry px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {platform.toUpperCase()} INGEST
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">تم استلام الرابط تلقائياً عبر مشاركة النظام</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs font-sans">
          
          {/* Detected URL */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-300 block">الرابط الملتقط</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-xl bg-black/60 border craft-border px-3.5 py-2 text-xs font-telemetry text-cyan-300 outline-none focus:border-cyan-500"
              required
            />
          </div>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-300 block">عنوان العنصر / الفكرة</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl bg-black/60 border craft-border px-3.5 py-2 text-xs text-zinc-100 outline-none focus:border-cyan-500"
              required
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-300 block">تصنيف الاستخبارات</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCategory('solution_reel')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  category === 'solution_reel'
                    ? 'bg-amber-950/40 border-amber-500/60 text-amber-300 font-bold shadow-sm'
                    : 'bg-zinc-900 border craft-border text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Flame className="h-3.5 w-3.5 text-amber-400" />
                <span>ريلز يتضمن حلاً (Solution)</span>
              </button>

              <button
                type="button"
                onClick={() => setCategory('watch_later')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  category === 'watch_later'
                    ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-300 font-bold shadow-sm'
                    : 'bg-zinc-900 border craft-border text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Video className="h-3.5 w-3.5 text-cyan-400" />
                <span>مشاهدة لاحقاً (Watch Later)</span>
              </button>
            </div>
          </div>

          {/* Problem Solved */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
              <span>ما الحل الذي يقدمه هذا المقطع؟ (اختياري)</span>
            </label>
            <textarea
              value={problemSolved}
              onChange={(e) => setProblemSolved(e.target.value)}
              placeholder="مثال: طريقة سريعة لتسريع استجابة نموذج الذكاء أو حل مشكلة في السيرفر..."
              rows={2}
              className="w-full rounded-xl bg-black/60 border craft-border px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-amber-500/50 resize-none leading-relaxed"
            />
          </div>

          {/* Link to Mission */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-300 block">ربط بالمشروع المستهدف</label>
            <select
              value={selectedMissionId}
              onChange={(e) => setSelectedMissionId(e.target.value)}
              className="w-full rounded-xl bg-zinc-900 border craft-border px-3.5 py-2 text-xs text-zinc-200 outline-none"
            >
              <option value="">-- فكرة عامة (غير مرتبطة بمشروع محدد) --</option>
              {missions.map((m) => (
                <option key={m.id} value={m.id}>
                  [{m.code}] {m.title}
                </option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-zinc-300 block">وسوم استخباراتية (مفصولة بمسافة)</label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="ai nexusos automation backend"
              className="w-full rounded-xl bg-black/60 border craft-border px-3.5 py-2 text-xs font-telemetry text-zinc-100 outline-none focus:border-cyan-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t craft-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all shadow-lg shadow-cyan-950 active:scale-95"
            >
              <Check className="h-4 w-4" />
              <span>تأكيد الحفظ في بنك الاستخبارات</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
