import React, { useState } from 'react';
import { 
  Database, 
  Video, 
  Flame, 
  ExternalLink, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle, 
  Tag, 
  PlaySquare, 
  Camera, 
  Lightbulb, 
  Sparkles,
  Bookmark
} from 'lucide-react';
import type { IntelItem, IntelCategory, IntelPlatform, Mission } from '../types';
import { tacticalAudio } from '../lib/audio';

interface IntelDepotPanelProps {
  items: IntelItem[];
  missions: Mission[];
  onAddItem: (item: Omit<IntelItem, 'id' | 'created_at' | 'updated_at'>) => void;
  onUpdateStatus: (id: string, status: IntelItem['status']) => void;
}

export const IntelDepotPanel: React.FC<IntelDepotPanelProps> = ({
  items,
  missions,
  onAddItem,
  onUpdateStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'watch_later' | 'solution_reel'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<IntelCategory>('solution_reel');
  const [problemSolved, setProblemSolved] = useState('');
  const [keyTakeaways, setKeyTakeaways] = useState('');
  const [selectedMissionId, setSelectedMissionId] = useState<string>('');
  const [tagInput, setTagInput] = useState('');

  // Auto-detect platform from URL
  const detectPlatform = (link: string): IntelPlatform => {
    const l = link.toLowerCase();
    if (l.includes('youtube.com') || l.includes('youtu.be')) return 'youtube';
    if (l.includes('instagram.com')) return 'instagram';
    if (l.includes('tiktok.com')) return 'tiktok';
    if (l.includes('twitter.com') || l.includes('x.com')) return 'twitter';
    if (l.includes('github.com')) return 'github';
    return 'web';
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    // If user hasn't set title yet, suggest title based on domain
    if (!title) {
      if (newUrl.includes('instagram.com/reel')) {
        setTitle('ريلز تقني استخباراتي');
        setCategory('solution_reel');
      } else if (newUrl.includes('youtube.com') || newUrl.includes('youtu.be')) {
        setTitle('فيديو للمشاهدة لاحقاً');
        setCategory('watch_later');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    tacticalAudio.playConfirm();

    const platform = detectPlatform(url);
    const tags = tagInput
      .split(/[, ]+/)
      .filter((t) => t.trim().length > 0)
      .map((t) => t.replace('#', ''));

    onAddItem({
      title: title.trim() || 'رابط استخباراتي جديد',
      url: url.trim(),
      category,
      platform,
      problem_solved: problemSolved.trim() || null,
      key_takeaways: keyTakeaways.trim() || null,
      mission_id: selectedMissionId || null,
      tags,
      status: 'unreviewed',
      thumbnail_url: null,
    });

    // Reset Form
    setTitle('');
    setUrl('');
    setProblemSolved('');
    setKeyTakeaways('');
    setTagInput('');
    setSelectedMissionId('');
    setShowAddModal(false);
  };

  // Filtered Items
  const filteredItems = items.filter((item) => {
    if (activeTab !== 'all' && item.category !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = item.title.toLowerCase().includes(q);
      const inProblem = item.problem_solved?.toLowerCase().includes(q);
      const inTags = item.tags?.some((t) => t.toLowerCase().includes(q));
      if (!inTitle && !inProblem && !inTags) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full hud-panel rounded-xl border border-slate-800 p-4 overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800/80 mb-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>بنك الاستخبارات والحلول</span>
              <span className="text-[10px] font-mono-hud text-amber-400">// INTEL DEPOT</span>
            </h2>
            <p className="text-[11px] text-slate-400">خزانة الفيديوهات والريلزات والحلول السريعة</p>
          </div>
        </div>

        <button
          onClick={() => {
            tacticalAudio.playBlip();
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 px-3 py-1.5 rounded-lg transition-all active:scale-95 glow-amber"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>حفظ رابط جديد</span>
        </button>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        {/* Category Filter Tabs */}
        <div className="flex rounded-lg bg-slate-900/80 p-0.5 border border-slate-800">
          <button
            onClick={() => {
              tacticalAudio.playBlip();
              setActiveTab('all');
            }}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            الكل ({items.length})
          </button>
          <button
            onClick={() => {
              tacticalAudio.playBlip();
              setActiveTab('solution_reel');
            }}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all flex items-center gap-1 ${
              activeTab === 'solution_reel'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="h-3 w-3 text-amber-400" />
            <span>ريلزات الحلول</span>
          </button>
          <button
            onClick={() => {
              tacticalAudio.playBlip();
              setActiveTab('watch_later');
            }}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all flex items-center gap-1 ${
              activeTab === 'watch_later'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Video className="h-3 w-3 text-cyan-400" />
            <span>مشاهدة لاحقاً</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative flex-1 min-w-[140px] max-w-xs">
          <Search className="absolute right-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في الحلول والوسوم..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900/60 pr-8 pl-3 py-1 text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-amber-500/40"
          />
        </div>
      </div>

      {/* Cards Matrix Grid */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-800/90 bg-[#0a0d15]/90 p-3 hover:border-slate-700 transition-all hover:bg-[#0c101a] group"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="p-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 shrink-0">
                    {item.platform === 'youtube' && <PlaySquare className="h-3.5 w-3.5 text-red-400" />}
                    {item.platform === 'instagram' && <Camera className="h-3.5 w-3.5 text-pink-400" />}
                    {item.platform === 'tiktok' && <Flame className="h-3.5 w-3.5 text-cyan-400" />}
                    {!['youtube', 'instagram', 'tiktok'].includes(item.platform) && (
                      <Bookmark className="h-3.5 w-3.5 text-amber-400" />
                    )}
                  </span>
                  <h4 className="text-xs font-bold text-white truncate flex-1">{item.title}</h4>
                </div>

                {/* Status Badge */}
                <select
                  value={item.status}
                  onChange={(e) => onUpdateStatus(item.id, e.target.value as any)}
                  className={`text-[10px] font-mono-hud font-bold rounded px-1.5 py-0.5 border outline-none bg-slate-950 cursor-pointer ${
                    item.status === 'implemented'
                      ? 'border-emerald-500/40 text-emerald-400'
                      : item.status === 'reviewed'
                      ? 'border-cyan-500/40 text-cyan-400'
                      : 'border-slate-700 text-slate-400'
                  }`}
                >
                  <option value="unreviewed">لم تراجع</option>
                  <option value="reviewed">تمت المشاهدة</option>
                  <option value="implemented">تم تطبيق الحل</option>
                </select>
              </div>

              {/* Problem Solved & Solution Callout */}
              {item.problem_solved && (
                <div className="mb-2 rounded-lg bg-amber-500/10 border border-amber-500/20 p-2 text-xs text-amber-200/90 flex items-start gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-300">الحل المستفاد: </span>
                    <span>{item.problem_solved}</span>
                  </div>
                </div>
              )}

              {/* Key Takeaways */}
              {item.key_takeaways && (
                <p className="text-[11px] text-slate-300 mb-2 leading-relaxed bg-slate-900/40 p-1.5 rounded border border-slate-800/40">
                  {item.key_takeaways}
                </p>
              )}

              {/* Tags & Actions */}
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/50">
                <div className="flex flex-wrap items-center gap-1.5">
                  {item.tags?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] text-slate-400 border border-slate-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <span>فتح الرابط</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Bookmark className="h-8 w-8 text-slate-700 mb-2" />
            <p className="text-xs text-slate-400 font-bold mb-1">لا توجد عناصر استخباراتية في هذا القسم</p>
            <p className="text-[11px] text-slate-600 max-w-xs font-mono-hud">
              // استخدم زر "حفظ رابط جديد" أو شارك المقطع مباشرة من هاتفك
            </p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSubmit}
            className="hud-panel w-full max-w-md rounded-xl border border-slate-800 p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>التقاط وتخزين رابط استخباراتي</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-medium">الرابط (URL) *</label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://www.instagram.com/reel/... أو https://youtube.com/..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-slate-100 outline-none focus:border-amber-500/50"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">عنوان المقطع / الفيديو</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: حل مشكلة الأمان في خوادم Node.js"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-slate-100 outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">التصنيف</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-slate-200 outline-none"
                  >
                    <option value="solution_reel">ريلز يتضمن حلاً</option>
                    <option value="watch_later">فيديو للمشاهدة لاحقاً</option>
                    <option value="article">مقال / مرجع</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">المشروع ذو الصلة</label>
                  <select
                    value={selectedMissionId}
                    onChange={(e) => setSelectedMissionId(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-slate-200 outline-none"
                  >
                    <option value="">(عام - بدون مشروع محدد)</option>
                    {missions.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title} [{m.code}]
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-amber-300 block mb-1 font-bold">
                  ما هو الحل الذي يقدمه هذا المقطع؟ (مهم للبحث والاسترجاع)
                </label>
                <textarea
                  value={problemSolved}
                  onChange={(e) => setProblemSolved(e.target.value)}
                  placeholder="مثال: طريقة عمل 캐시 لحظي للسيرفر لتقليل الضغط بنسبة 80%..."
                  className="w-full rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-1.5 text-slate-100 outline-none resize-none"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 font-medium">الوسوم (مفصولة بفواصل)</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="NexusOS, security, backend, database"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-slate-200 outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-xs font-bold text-amber-300 hover:bg-amber-500/30"
              >
                تخزين في الاستخبارات
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
