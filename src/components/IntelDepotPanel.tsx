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
  CheckCircle2,
  Film
} from 'lucide-react';
import type { IntelItem, IntelCategory, Mission } from '../types';
import { tacticalAudio } from '../lib/audio';
import { QuickCaptureModal } from './QuickCaptureModal';
import { CATEGORY_LABELS, type SmartVideoCategory } from '../lib/videoAnalysisEngine';

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
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filterTabs: { id: string; label: string; icon?: string }[] = [
    { id: 'all', label: `الكل (${items.length})` },
    { id: 'tech', label: 'تقني', icon: '💻' },
    { id: 'educational', label: 'تعليمي', icon: '📚' },
    { id: 'business', label: 'أعمال', icon: '💼' },
    { id: 'fitness', label: 'صحة وجسم', icon: '🏋️‍♂️' },
    { id: 'mindset', label: 'تطوير ذات', icon: '🧠' },
    { id: 'entertainment', label: 'ترفيه', icon: '🎭' },
    { id: 'solution_reel', label: 'ريلزات وحلول', icon: '⚡' },
  ];

  const filteredItems = items.filter((item) => {
    if (activeTab !== 'all') {
      if (item.category !== activeTab) {
        // Fallback matching: if tag matches or old category
        if (activeTab === 'solution_reel' && item.category !== 'solution_reel') return false;
        if (activeTab !== 'solution_reel' && item.category !== activeTab && !item.tags?.includes(activeTab)) {
          return false;
        }
      }
    }
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
    <div className="flex flex-col h-full min-h-0 craft-surface rounded-xl p-3.5 sm:p-4 overflow-hidden text-right border craft-border shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b craft-border mb-3 gap-2 flex-shrink-0">
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
          className="flex items-center gap-1.5 text-xs font-bold text-zinc-950 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 px-3.5 py-1.5 rounded-xl transition-all active:scale-95 shadow-md shadow-emerald-950/40"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>التقاط وحفظ فيديو جديد</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mb-3">
        {/* Horizontal scrollable category pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                tacticalAudio.playBlip();
                setActiveTab(tab.id);
              }}
              className={`flex-shrink-0 px-2.5 py-1 text-xs rounded-xl font-medium transition-all flex items-center gap-1 ${
                activeTab === tab.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold shadow-sm'
                  : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 border border-white/5'
              }`}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[140px] sm:max-w-xs">
          <Search className="absolute right-2.5 top-2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في الحلول والوسوم..."
            className="w-full rounded-xl border craft-border bg-black/60 pr-8 pl-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Cards List */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-2.5 pr-1 text-xs scrollbar-tactical">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const catInfo = item.category in CATEGORY_LABELS 
              ? CATEGORY_LABELS[item.category as SmartVideoCategory]
              : null;

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-white/5 bg-zinc-900/60 p-3.5 hover:bg-zinc-900/90 transition-all space-y-2.5"
              >
                {/* Header row: Platform + Category + Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="px-2 py-0.5 rounded-lg bg-zinc-800 border border-white/5 text-zinc-300 font-mono text-[10px] uppercase font-bold">
                      {item.platform || 'WEB'}
                    </span>

                    {catInfo && (
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${catInfo.color}`}>
                        {catInfo.icon} {catInfo.label}
                      </span>
                    )}

                    <h4 className="text-xs font-bold text-zinc-100 truncate flex-1">
                      {item.title}
                    </h4>
                  </div>

                  <select
                    value={item.status || 'unreviewed'}
                    onChange={(e) => onUpdateStatus(item.id, e.target.value as any)}
                    className="text-[10px] font-medium rounded-lg px-2 py-0.5 border border-white/10 outline-none bg-zinc-800 text-zinc-300 cursor-pointer"
                  >
                    <option value="unreviewed">لم تراجع</option>
                    <option value="reviewed">تمت المشاهدة</option>
                    <option value="implemented">تم تطبيق الفائدة</option>
                  </select>
                </div>

                {/* Optional Video Thumbnail */}
                {item.thumbnail_url && (
                  <div className="relative rounded-xl overflow-hidden max-h-32 bg-black/40 border border-white/5">
                    <img 
                      src={item.thumbnail_url} 
                      alt={item.title} 
                      className="w-full h-32 object-cover opacity-85 hover:opacity-100 transition-opacity" 
                    />
                  </div>
                )}

                {/* Problem Solved / Direct Value */}
                {item.problem_solved && (
                  <div className="rounded-xl bg-emerald-500/[0.05] border border-emerald-500/20 p-2.5 text-xs text-zinc-200 flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-emerald-300">الفائدة أو المشكلة التي يحلها: </span>
                      <span className="leading-relaxed">{item.problem_solved}</span>
                    </div>
                  </div>
                )}

                {/* Key Takeaways */}
                {item.key_takeaways && (
                  <p className="text-[11px] text-zinc-300 leading-relaxed bg-black/30 p-2 rounded-xl border border-white/5 whitespace-pre-line font-sans">
                    {item.key_takeaways}
                  </p>
                )}

                {/* Footer: Tags & Link */}
                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-white/5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {item.tags?.map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-white/[0.03] px-2 py-0.5 text-[10px] text-zinc-400 border border-white/5 font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <span>فتح الفيديو</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Bookmark className="h-7 w-7 text-zinc-700 mb-2" />
            <p className="text-xs text-zinc-400 font-bold mb-1">لا توجد عناصر في هذا التصنيف</p>
            <p className="text-[11px] text-zinc-600 max-w-xs font-sans">
              شارك أي فيديو أو ريلز من إنستغرام أو تيك توك أو يوتيوب ليتم تحليله تلقائياً وحفظه هنا
            </p>
          </div>
        )}
      </div>

      {/* Smart Video Capture Modal */}
      {showAddModal && (
        <QuickCaptureModal
          initialText=""
          missions={missions}
          onSave={onAddItem}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};
