import React, { useState } from 'react';
import { 
  Database, 
  ExternalLink, 
  Plus, 
  Search, 
  Lightbulb, 
  Bookmark, 
  Pencil, 
  Trash2, 
  Copy, 
  Check, 
  X, 
  AlertTriangle,
  FolderPlus,
  Tag,
  Layers,
  Sparkles
} from 'lucide-react';
import type { IntelItem, IntelCategory, IntelPlatform, IntelStatus, Mission } from '../types';
import { tacticalAudio } from '../lib/audio';
import { QuickCaptureModal } from './QuickCaptureModal';
import { CATEGORY_LABELS, type SmartVideoCategory } from '../lib/videoAnalysisEngine';

interface IntelDepotPanelProps {
  items: IntelItem[];
  missions: Mission[];
  onAddItem: (item: Omit<IntelItem, 'id' | 'created_at' | 'updated_at'>) => void;
  onUpdateStatus: (id: string, status: IntelItem['status']) => void;
  onUpdateItem?: (updated: Partial<IntelItem> & { id: string }) => void;
  onDeleteItem?: (id: string) => void;
}

export const IntelDepotPanel: React.FC<IntelDepotPanelProps> = ({
  items,
  missions,
  onAddItem,
  onUpdateStatus,
  onUpdateItem,
  onDeleteItem,
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<IntelItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<IntelItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit Modal Local Form States
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editCategory, setEditCategory] = useState<IntelCategory>('general');
  const [editPlatform, setEditPlatform] = useState<IntelPlatform>('web');
  const [editProblemSolved, setEditProblemSolved] = useState('');
  const [editKeyTakeaways, setEditKeyTakeaways] = useState('');
  const [editTags, setEditTags] = useState('');
  const [editMissionId, setEditMissionId] = useState('');
  const [editStatus, setEditStatus] = useState<IntelStatus>('unreviewed');

  const filterTabs: { id: string; label: string; icon?: string }[] = [
    { id: 'all', label: `الكل (${items.length})` },
    { id: 'tech', label: 'تقني وبرمجة', icon: '💻' },
    { id: 'mindset', label: 'تطوير وعادات', icon: '🧠' },
    { id: 'fitness', label: 'لياقة وصحة', icon: '🏋️‍♂️' },
    { id: 'business', label: 'أعمال ومبيعات', icon: '💼' },
    { id: 'educational', label: 'تعليمي ودراسة', icon: '📚' },
    { id: 'editing', label: 'مونتاج ومحتوى', icon: '🎬' },
    { id: 'solution_reel', label: 'ريلزات وحلول', icon: '⚡' },
    { id: 'general', label: 'مواقع وعام', icon: '🌐' },
  ];

  const filteredItems = items.filter((item) => {
    if (activeTab !== 'all') {
      if (item.category !== activeTab) {
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

  const handleCopyUrl = (id: string, url: string) => {
    try {
      navigator.clipboard.writeText(url);
      tacticalAudio.playBlip();
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.warn('Clipboard failed', e);
    }
  };

  const handleOpenEdit = (item: IntelItem) => {
    setEditingItem(item);
    setEditTitle(item.title);
    setEditUrl(item.url);
    setEditCategory(item.category);
    setEditPlatform(item.platform || 'web');
    setEditProblemSolved(item.problem_solved || '');
    setEditKeyTakeaways(item.key_takeaways || '');
    setEditTags(item.tags?.join(' ') || '');
    setEditMissionId(item.mission_id || '');
    setEditStatus(item.status || 'unreviewed');
    tacticalAudio.playBlip();
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const parsedTags = editTags
      .split(/[, ]+/)
      .filter((t) => t.trim().length > 0)
      .map((t) => t.replace('#', ''));

    const updatedData: Partial<IntelItem> & { id: string } = {
      id: editingItem.id,
      title: editTitle.trim() || editingItem.title,
      url: editUrl.trim() || editingItem.url,
      category: editCategory,
      platform: editPlatform,
      problem_solved: editProblemSolved.trim() || null,
      key_takeaways: editKeyTakeaways.trim() || null,
      tags: parsedTags.length > 0 ? parsedTags : editingItem.tags,
      mission_id: editMissionId.trim() ? editMissionId : null,
      status: editStatus,
    };

    if (onUpdateItem) {
      onUpdateItem(updatedData);
    }
    tacticalAudio.playSuccess();
    setEditingItem(null);
  };

  const handleConfirmDelete = () => {
    if (!deletingItem) return;
    if (onDeleteItem) {
      onDeleteItem(deletingItem.id);
    }
    tacticalAudio.playBlip();
    setDeletingItem(null);
  };

  return (
    <div className="flex flex-col h-full min-h-0 apple-glass-elevated rounded-2xl p-3 sm:p-4 overflow-hidden text-right border border-white/10 shadow-2xl bg-black/40">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-white/5 mb-3 gap-2 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-white/10 border border-white/15 text-white shadow-sm">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">بنك الاستخبارات والمحتوى</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-zinc-300">
                {items.length} عنصر
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">مخزن الروابط، الفيديوهات المحللة، وأفكار المشاريع</p>
          </div>
        </div>

        <button
          onClick={() => {
            tacticalAudio.playBlip();
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 text-xs font-bold text-black bg-white hover:bg-zinc-200 px-3.5 py-1.5 rounded-xl transition-all active:scale-95 shadow-lg"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>إضافة رابط جديد</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mb-3 flex-shrink-0">
        {/* Horizontal scrollable category pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                tacticalAudio.playBlip();
                setActiveTab(tab.id);
              }}
              className={`flex-shrink-0 px-2.5 py-1 text-xs rounded-xl font-medium transition-all flex items-center gap-1 active:scale-95 ${
                activeTab === tab.id
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'bg-white/[0.04] text-zinc-400 hover:text-white border border-white/5'
              }`}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[150px] sm:max-w-xs">
          <Search className="absolute right-2.5 top-2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في الروابط والعناوين..."
            className="w-full rounded-xl border border-white/10 bg-black/60 pr-8 pl-3 py-1.5 text-xs text-white placeholder:text-zinc-500 outline-none focus:border-white/40"
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
                className="rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] p-3.5 transition-all space-y-2.5 backdrop-blur-md"
              >
                {/* Header Row: Platform + Category + Title + Status + Action Buttons */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
                    <span className="px-2 py-0.5 rounded-lg bg-white/10 border border-white/10 text-white font-mono text-[10px] uppercase font-bold">
                      {item.platform || 'WEB'}
                    </span>

                    {catInfo && (
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${catInfo.color}`}>
                        {catInfo.icon} {catInfo.label}
                      </span>
                    )}

                    <h4 className="text-xs font-bold text-white truncate flex-1 min-w-[140px]" title={item.title}>
                      {item.title}
                    </h4>
                  </div>

                  {/* Actions Group: Edit, Delete, Status */}
                  <div className="flex items-center gap-1 shrink-0">
                    <select
                      value={item.status || 'unreviewed'}
                      onChange={(e) => onUpdateStatus(item.id, e.target.value as any)}
                      className="text-[10px] font-medium rounded-lg px-2 py-1 border border-white/10 outline-none bg-black/80 text-zinc-300 cursor-pointer hover:border-white/30"
                    >
                      <option value="unreviewed">لم تراجع</option>
                      <option value="reviewed">تمت المشاهدة</option>
                      <option value="implemented">تم تطبيق الفائدة</option>
                    </select>

                    {/* Edit Button */}
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-white/15 text-zinc-300 hover:text-white transition-all active:scale-95 border border-white/5"
                      title="تعديل هذا الرابط"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => {
                        tacticalAudio.playBlip();
                        setDeletingItem(item);
                      }}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 transition-all active:scale-95 border border-rose-500/20"
                      title="حذف هذا الرابط"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Optional Video Thumbnail */}
                {item.thumbnail_url && (
                  <div className="relative rounded-xl overflow-hidden max-h-32 bg-black/60 border border-white/5">
                    <img 
                      src={item.thumbnail_url} 
                      alt={item.title} 
                      className="w-full h-32 object-cover opacity-85 hover:opacity-100 transition-opacity" 
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Problem Solved / Direct Value */}
                {item.problem_solved && (
                  <div className="rounded-xl bg-white/[0.03] border border-white/10 p-2.5 text-xs text-zinc-200 flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-300 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white">الفائدة / القيمة المستخلصة: </span>
                      <span className="leading-relaxed text-zinc-300">{item.problem_solved}</span>
                    </div>
                  </div>
                )}

                {/* Key Takeaways */}
                {item.key_takeaways && (
                  <p className="text-[11px] text-zinc-300 leading-relaxed bg-black/40 p-2.5 rounded-xl border border-white/5 whitespace-pre-line font-sans">
                    {item.key_takeaways}
                  </p>
                )}

                {/* Footer: Tags, Mission Association, Link Copy & Open */}
                <div className="flex flex-wrap items-center justify-between text-[11px] pt-2 border-t border-white/5 gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {item.tags?.map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-white/[0.04] px-2 py-0.5 text-[10px] text-zinc-400 border border-white/5 font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                    {item.mission_id && (
                      <span className="rounded-lg bg-white/10 px-2 py-0.5 text-[10px] text-white border border-white/15 font-mono">
                        مرتبط بمهمة
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Copy Link Button */}
                    <button
                      onClick={() => handleCopyUrl(item.id, item.url)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/10 text-zinc-300 hover:text-white transition-all border border-white/5 active:scale-95 text-[11px]"
                      title="نسخ الرابط"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400 font-bold">تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>نسخ</span>
                        </>
                      )}
                    </button>

                    {/* Open External Link */}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white text-black hover:bg-zinc-200 font-bold transition-all active:scale-95 text-[11px]"
                      title="فتح الرابط الأصلي"
                    >
                      <span>فتح</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bookmark className="h-8 w-8 text-zinc-700 mb-2" />
            <p className="text-xs text-zinc-300 font-bold mb-1">لا توجد عناصر في هذا التصنيف</p>
            <p className="text-[11px] text-zinc-500 max-w-xs font-sans leading-relaxed">
              شارك أي فيديو أو رابط من إنستغرام أو تيك توك أو يوتيوب ليتم تحليله تلقائياً وحفظه هنا في بنك الاستخبارات.
            </p>
          </div>
        )}
      </div>

      {/* ==================================================================== */}
      {/* 1. EDIT MODAL */}
      {/* ==================================================================== */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-2xl p-3 sm:p-4 animate-in fade-in duration-200 text-right">
          <div className="apple-glass-elevated w-full max-w-lg rounded-3xl p-4 sm:p-5 border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] bg-black">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white">
                  <Pencil className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">تعديل بيانات الرابط</h3>
                  <p className="text-[11px] text-zinc-400">تحديث العنوان، التصنيف، القيمة، والوسوم</p>
                </div>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveEdit} className="space-y-3 overflow-y-auto pr-1 flex-1 text-xs">
              
              {/* Title */}
              <div>
                <label className="text-zinc-300 block mb-1 font-bold">العنوان:</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.05] border border-white/10 px-3 py-2 text-white focus:outline-none focus:border-white text-xs"
                  required
                />
              </div>

              {/* URL */}
              <div>
                <label className="text-zinc-300 block mb-1 font-bold">الرابط:</label>
                <input
                  type="text"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="w-full rounded-xl bg-white/[0.05] border border-white/10 px-3 py-2 text-zinc-200 focus:outline-none focus:border-white font-mono text-[11px]"
                  required
                />
              </div>

              {/* Category Pills */}
              <div>
                <label className="text-zinc-300 block mb-1.5 font-bold">التصنيف والمجال:</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'tech', label: '💻 تقني وبرمجة وAI' },
                    { id: 'mindset', label: '🧠 تطوير ذات وعادات' },
                    { id: 'fitness', label: '🏋️‍♂️ لياقة وبناء جسم' },
                    { id: 'business', label: '💼 بزنس ومبيعات' },
                    { id: 'educational', label: '📚 تعليمي ولغات' },
                    { id: 'editing', label: '🎬 مونتاج وصناعة محتوى' },
                    { id: 'solution_reel', label: '⚡ ريلزات وحلول سريعة' },
                    { id: 'general', label: '🌐 مواقع وأدوات عامة' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setEditCategory(c.id as IntelCategory)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all ${
                        editCategory === c.id
                          ? 'bg-white text-black font-bold border-white'
                          : 'bg-white/[0.04] border-white/5 text-zinc-300 hover:bg-white/[0.08]'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform & Status */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-300 block mb-1 font-bold">المنصة:</label>
                  <select
                    value={editPlatform}
                    onChange={(e) => setEditPlatform(e.target.value as IntelPlatform)}
                    className="w-full rounded-xl bg-zinc-900 border border-white/10 px-2.5 py-2 text-white focus:outline-none"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="twitter">X / Twitter</option>
                    <option value="github">GitHub</option>
                    <option value="web">Web / موقع</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1 font-bold">حالة المراجعة:</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as IntelStatus)}
                    className="w-full rounded-xl bg-zinc-900 border border-white/10 px-2.5 py-2 text-white focus:outline-none"
                  >
                    <option value="unreviewed">لم تراجع</option>
                    <option value="reviewed">تمت المشاهدة</option>
                    <option value="implemented">تم تطبيق الفائدة</option>
                  </select>
                </div>
              </div>

              {/* Problem Solved */}
              <div>
                <label className="text-zinc-300 block mb-1 font-bold">الفائدة / المشكلة التي يحلها:</label>
                <textarea
                  value={editProblemSolved}
                  onChange={(e) => setEditProblemSolved(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl bg-white/[0.05] border border-white/10 p-2.5 text-white focus:outline-none focus:border-white text-xs leading-relaxed"
                />
              </div>

              {/* Key Takeaways */}
              <div>
                <label className="text-zinc-300 block mb-1 font-bold">النقاط الأساسية / التفاصيل:</label>
                <textarea
                  value={editKeyTakeaways}
                  onChange={(e) => setEditKeyTakeaways(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl bg-white/[0.05] border border-white/10 p-2.5 text-white focus:outline-none focus:border-white text-xs leading-relaxed"
                />
              </div>

              {/* Tags & Mission Link */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-300 block mb-1 font-bold">الوسوم:</label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="#برمجة #ريلز"
                    className="w-full rounded-xl bg-white/[0.05] border border-white/10 px-3 py-2 text-white focus:outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 block mb-1 font-bold">ربط بمشروع:</label>
                  <select
                    value={editMissionId}
                    onChange={(e) => setEditMissionId(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-white/10 px-2.5 py-2 text-white focus:outline-none text-xs"
                  >
                    <option value="">[ محتوى مستقل ]</option>
                    {missions.map((m) => (
                      <option key={m.id} value={m.id}>
                        [{m.code}] {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white bg-white/[0.05] hover:bg-white/10 transition-all text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Check className="h-4 w-4 stroke-[2.5]" />
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 2. DELETE CONFIRMATION MODAL */}
      {/* ==================================================================== */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150 text-right">
          <div className="apple-glass-elevated w-full max-w-sm rounded-3xl p-5 border border-rose-500/30 shadow-2xl bg-black space-y-4">
            
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">حذف الرابط نهائياً؟</h3>
                <p className="text-[11px] text-zinc-400">لن يمكنك استرجاع الرابط بعد حذفه</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-zinc-200 space-y-1">
              <p className="font-bold text-white line-clamp-2">{deletingItem.title}</p>
              <p className="text-[10px] text-zinc-400 font-mono truncate">{deletingItem.url}</p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-4 py-2.5 rounded-xl text-zinc-300 hover:text-white bg-white/[0.05] hover:bg-white/10 transition-all text-xs font-semibold"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/50 transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="h-4 w-4" />
                <span>نعم، حذف الرابط</span>
              </button>
            </div>

          </div>
        </div>
      )}

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
