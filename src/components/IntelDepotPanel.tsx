import React, { useState } from 'react';
import { 
  Database, 
  Video, 
  Flame, 
  ExternalLink, 
  Plus, 
  Search, 
  Lightbulb, 
  Sparkles,
  Bookmark,
  X
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

    setTitle('');
    setUrl('');
    setProblemSolved('');
    setKeyTakeaways('');
    setTagInput('');
    setSelectedMissionId('');
    setShowAddModal(false);
  };

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
    <div className="flex flex-col h-full craft-surface rounded-2xl p-4 overflow-hidden text-right">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b craft-border mb-3 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-zinc-800/80 border craft-border text-zinc-200">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-zinc-100">بنك الاستخبارات والحلول</h2>
              <span className="text-[10px] font-telemetry px-1.5 py-0.5 rounded bg-zinc-800/80 border craft-border text-zinc-400">
                INTEL DEPOT
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">خزانة الفيديوهات والريلزات والحلول السريعة</p>
          </div>
        </div>

        <button
          onClick={() => {
            tacticalAudio.playBlip();
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 text-xs font-medium text-zinc-200 bg-zinc-800/80 hover:bg-zinc-700/80 border craft-border px-3 py-1.5 rounded-lg transition-all active:scale-95 shadow-sm"
        >
          <Plus className="h-3.5 w-3.5 text-zinc-300" />
          <span>حفظ رابط جديد</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex rounded-lg bg-zinc-900 p-0.5 border craft-border">
          <button
            onClick={() => {
              tacticalAudio.playBlip();
              setActiveTab('all');
            }}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
              activeTab === 'all'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
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
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
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
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Video className="h-3 w-3 text-cyan-400" />
            <span>مشاهدة لاحقاً</span>
          </button>
        </div>

        <div className="relative flex-1 min-w-[140px] max-w-xs">
          <Search className="absolute right-2.5 top-2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في الحلول والوسوم..."
            className="w-full rounded-lg border craft-border bg-black/60 pr-8 pl-3 py-1 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-zinc-500"
          />
        </div>
      </div>

      {/* Cards List */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border craft-border bg-zinc-900/60 p-3 hover:bg-zinc-900/90 transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="p-1 rounded-md bg-zinc-800 border craft-border text-zinc-400 font-telemetry text-[10px] uppercase">
                    {item.platform || 'WEB'}
                  </span>
                  <h4 className="text-xs font-bold text-zinc-100 truncate flex-1">{item.title}</h4>
                </div>

                <select
                  value={item.status || 'unreviewed'}
                  onChange={(e) => onUpdateStatus(item.id, e.target.value as any)}
                  className="text-[10px] font-telemetry rounded px-1.5 py-0.5 border craft-border outline-none bg-zinc-800 text-zinc-300 cursor-pointer"
                >
                  <option value="unreviewed">لم تراجع</option>
                  <option value="reviewed">تمت المشاهدة</option>
                  <option value="implemented">تم تطبيق الحل</option>
                </select>
              </div>

              {item.problem_solved && (
                <div className="mb-2 rounded-lg bg-zinc-950/70 border craft-border p-2 text-xs text-zinc-300 flex items-start gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-zinc-200">الحل المستفاد: </span>
                    <span className="leading-relaxed">{item.problem_solved}</span>
                  </div>
                </div>
              )}

              {item.key_takeaways && (
                <p className="text-[11px] text-zinc-400 mb-2 leading-relaxed bg-black/20 p-1.5 rounded border craft-border">
                  {item.key_takeaways}
                </p>
              )}

              <div className="flex items-center justify-between text-[11px] pt-1.5 border-t craft-border">
                <div className="flex flex-wrap items-center gap-1.5">
                  {item.tags?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-[10px] text-zinc-400 border craft-border font-telemetry"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] font-medium text-zinc-300 hover:text-white transition-colors"
                >
                  <span>فتح الرابط</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Bookmark className="h-7 w-7 text-zinc-700 mb-2" />
            <p className="text-xs text-zinc-400 font-bold mb-1">لا توجد عناصر في هذا القسم</p>
            <p className="text-[11px] text-zinc-600 max-w-xs font-telemetry">
              // اضغط على "حفظ رابط جديد" لإيداع ريلزات الحلول أو الفيديوهات
            </p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSubmit}
            className="craft-surface-elevated w-full max-w-md rounded-2xl p-5 text-right shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 mb-3 border-b craft-border">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-zinc-300" />
                <span>حفظ رابط استخباراتي جديد</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 mb-4 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">الرابط (URL) *</label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://instagram.com/reel/... أو https://youtube.com/..."
                  className="w-full rounded-lg border craft-border bg-black/60 px-3 py-1.5 text-zinc-100 outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">عنوان المقطع / الفيديو</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: حل مشكلة الأداء في قواعد البيانات"
                  className="w-full rounded-lg border craft-border bg-black/60 px-3 py-1.5 text-zinc-100 outline-none focus:border-zinc-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-400 block mb-1">التصنيف</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-lg border craft-border bg-black/60 px-3 py-1.5 text-zinc-200 outline-none"
                  >
                    <option value="solution_reel">ريلز يتضمن حلاً</option>
                    <option value="watch_later">فيديو للمشاهدة لاحقاً</option>
                    <option value="article">مقال / مرجع</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">المشروع ذو الصلة</label>
                  <select
                    value={selectedMissionId}
                    onChange={(e) => setSelectedMissionId(e.target.value)}
                    className="w-full rounded-lg border craft-border bg-black/60 px-3 py-1.5 text-zinc-200 outline-none"
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
                <label className="text-zinc-200 block mb-1 font-bold">
                  ما هو الحل الذي يقدمه هذا المقطع؟
                </label>
                <textarea
                  value={problemSolved}
                  onChange={(e) => setProblemSolved(e.target.value)}
                  placeholder="مثال: طريقة عمل Caching لتقليل زمن الاستجابة إلى 20ms..."
                  className="w-full rounded-lg border craft-border bg-black/60 px-3 py-1.5 text-zinc-100 outline-none resize-none leading-relaxed"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">الوسوم (مفصولة بفواصل)</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="NexusOS, performance, security"
                  className="w-full rounded-lg border craft-border bg-black/60 px-3 py-1.5 text-zinc-200 outline-none focus:border-zinc-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-zinc-100 text-zinc-950 font-bold hover:bg-white active:scale-95 text-xs transition-all shadow-sm"
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
