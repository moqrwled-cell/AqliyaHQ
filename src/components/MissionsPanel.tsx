import React, { useState, useRef } from 'react';
import { 
  FolderGit2, 
  CheckCircle2, 
  Plus, 
  ArrowUpRight, 
  Target, 
  TrendingUp,
  X,
  Share2,
  Settings2,
  ArrowUp,
  Sparkles,
  GitBranch,
  CheckSquare
} from 'lucide-react';
import type { Mission, IntelItem, StrategicDirective } from '../types';
import { tacticalAudio } from '../lib/audio';
import { ProjectShareModal } from './ProjectShareModal';
import { ProjectOptionsModal } from './ProjectOptionsModal';

interface MissionsPanelProps {
  missions: Mission[];
  selectedMission: Mission | null;
  intel?: IntelItem[];
  directives?: StrategicDirective[];
  onSelectMission: (mission: Mission) => void;
  onUpdateMission: (updated: Partial<Mission> & { id: string }) => void;
  onAddMission: (title: string, code: string) => void;
  onDeleteMission?: (id: string) => void;
}

export const MissionsPanel: React.FC<MissionsPanelProps> = ({
  missions,
  selectedMission,
  intel = [],
  directives = [],
  onSelectMission,
  onUpdateMission,
  onAddMission,
  onDeleteMission,
}) => {
  const [newLogText, setNewLogText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const activeMission = selectedMission || missions[0];

  const handleAddDoneLog = () => {
    if (!newLogText.trim() || !activeMission) return;
    tacticalAudio.playConfirm();
    const updatedLogs = [newLogText.trim(), ...(activeMission.done_log || [])];
    onUpdateMission({
      id: activeMission.id,
      done_log: updatedLogs,
      progress_percent: Math.min(100, (activeMission.progress_percent || 0) + 5),
    });
    setNewLogText('');
  };

  const handleProgressChange = (newVal: number) => {
    if (!activeMission) return;
    tacticalAudio.playBlip();
    onUpdateMission({
      id: activeMission.id,
      progress_percent: newVal,
    });
  };

  const handleCreateMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    tacticalAudio.playConfirm();
    onAddMission(newTitle, newCode || `OPS-${Math.floor(Math.random() * 900 + 100)}`);
    setNewTitle('');
    setNewCode('');
    setShowAddModal(false);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setShowScrollTop(e.currentTarget.scrollTop > 120);
  };

  const scrollToTop = () => {
    tacticalAudio.playBlip();
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col h-full min-h-0 craft-surface rounded-xl p-3.5 sm:p-4 overflow-hidden text-right border craft-border shadow-xl relative">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b craft-border mb-3 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-zinc-100">المهمات والمشاريع</h2>
              <span className="text-[10px] font-telemetry px-1.5 py-0.5 rounded bg-zinc-800/80 border craft-border text-zinc-400">
                ACTIVE OPS ({missions.length})
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">تتبع مسار NexusOS والعمليات الاستراتيجية</p>
          </div>
        </div>

        <button
          onClick={() => {
            tacticalAudio.playBlip();
            setShowAddModal(true);
          }}
          className="flex items-center gap-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 px-2.5 py-1.5 rounded-lg transition-all active:scale-95 shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>مهمة جديدة</span>
        </button>
      </div>

      {/* Mission Tabs Bar */}
      <div className="flex gap-1.5 pb-2.5 overflow-x-auto scrollbar-none mb-3 flex-shrink-0">
        {missions.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              tacticalAudio.playBlip();
              onSelectMission(m);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-telemetry transition-all whitespace-nowrap border ${
              activeMission?.id === m.id
                ? 'bg-zinc-800 border-emerald-500/60 text-emerald-300 font-bold shadow-md'
                : 'bg-zinc-900/60 craft-border text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <FolderGit2 className="h-3.5 w-3.5" />
            <span>[{m.code}]</span>
            <span className="font-sans font-medium">{m.title}</span>
          </button>
        ))}
      </div>

      {/* Active Mission Workspace (Smooth Scrollable Area) */}
      {activeMission && (
        <div 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1 text-xs space-y-3.5 scrollbar-tactical"
        >
          {/* Main Mission Card */}
          <div className="rounded-xl border craft-border bg-zinc-900/80 p-3.5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-[10px] font-telemetry text-zinc-500 uppercase tracking-wider">
                  MISSION PROFILE
                </span>
                <h3 className="text-sm font-bold text-zinc-100 mt-0.5">{activeMission.title}</h3>
              </div>
              <div className="flex items-center gap-1 text-xs font-telemetry font-bold text-emerald-400 bg-emerald-950/50 border border-emerald-900/80 px-2 py-0.5 rounded">
                <TrendingUp className="h-3 w-3" />
                <span>{activeMission.progress_percent}%</span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              {activeMission.description || 'النظام المركزي لإدارة العمليات والذكاء الاصطناعي والمكونات التقنية.'}
            </p>

            {/* Quick Action Buttons: Options & Share */}
            <div className="flex items-center gap-2 pb-3 mb-3 border-b craft-border">
              <button
                onClick={() => {
                  tacticalAudio.playBlip();
                  setShowShareModal(true);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/60 text-cyan-300 text-xs font-medium transition-all active:scale-95"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>المشاركات والتعاون (SITREP)</span>
              </button>

              <button
                onClick={() => {
                  tacticalAudio.playBlip();
                  setShowOptionsModal(true);
                }}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-zinc-800/90 hover:bg-zinc-700/90 border craft-border text-zinc-200 text-xs font-medium transition-all active:scale-95"
              >
                <Settings2 className="h-3.5 w-3.5 text-zinc-400" />
                <span>خيارات المشروع و GitHub</span>
              </button>
            </div>

            {/* Progress Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-telemetry text-zinc-400">
                <span>مستوى الإنجاز التراكمي</span>
                <span className="text-zinc-200 font-bold">{activeMission.progress_percent}%</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  style={{ width: `${activeMission.progress_percent}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={activeMission.progress_percent || 0}
                onChange={(e) => handleProgressChange(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-transparent h-1 cursor-pointer opacity-70 hover:opacity-100"
              />
            </div>
          </div>

          {/* Current Focus & Next Ops Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Current Focus */}
            <div className="rounded-xl border craft-border bg-zinc-900/60 p-3">
              <span className="text-[10px] font-telemetry text-amber-400/90 font-bold block mb-1.5">
                // التركيز الحالي (IN PROGRESS)
              </span>
              <textarea
                value={activeMission.current_focus || ''}
                onChange={(e) => onUpdateMission({ id: activeMission.id, current_focus: e.target.value })}
                placeholder="ما الذي تركز عليه في هذا المشروع الآن؟"
                className="w-full bg-transparent text-xs text-zinc-200 placeholder:text-zinc-600 resize-none outline-none leading-relaxed"
                rows={2}
              />
            </div>

            {/* Next Ops */}
            <div className="rounded-xl border craft-border bg-zinc-900/60 p-3">
              <span className="text-[10px] font-telemetry text-cyan-400/90 font-bold block mb-1.5">
                // الخطوة القادمة (NEXT OPS)
              </span>
              <textarea
                value={activeMission.next_ops || ''}
                onChange={(e) => onUpdateMission({ id: activeMission.id, next_ops: e.target.value })}
                placeholder="ما هي الخطوة الحاسمة التالية؟"
                className="w-full bg-transparent text-xs text-zinc-200 placeholder:text-zinc-600 resize-none outline-none leading-relaxed"
                rows={2}
              />
            </div>
          </div>

          {/* Done Log Section */}
          <div className="rounded-xl border craft-border bg-zinc-900/60 p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5 font-telemetry">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>سجل الإنجازات الموثقة ({activeMission.done_log?.length || 0})</span>
              </span>
            </div>

            {/* Add Done Log Input */}
            <div className="flex gap-1.5 mb-3">
              <input
                type="text"
                value={newLogText}
                onChange={(e) => setNewLogText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddDoneLog()}
                placeholder="وثق إنجازاً تكتيكياً تم تحقيقه..."
                className="flex-1 rounded-lg border craft-border bg-black/60 px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleAddDoneLog}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-all active:scale-95"
              >
                توثيق
              </button>
            </div>

            {/* List */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {activeMission.done_log && activeMission.done_log.length > 0 ? (
                activeMission.done_log.map((log, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-2 rounded-lg bg-zinc-950/60 border craft-border text-zinc-300"
                  >
                    <span className="text-[10px] font-telemetry text-emerald-400 mt-0.5">#{idx + 1}</span>
                    <span className="flex-1 leading-relaxed">{log}</span>
                  </div>
                ))
              ) : (
                <p className="text-zinc-500 text-center py-3 text-[11px]">
                  لم يتم توثيق إنجازات بعد في هذه المهمة.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Scroll-to-Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="absolute bottom-4 left-4 p-2 rounded-full bg-zinc-800/90 border craft-border text-zinc-300 hover:text-white hover:bg-zinc-700 shadow-xl transition-all animate-in fade-in"
          title="الرجوع للأعلى"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}

      {/* Modals */}
      {showShareModal && activeMission && (
        <ProjectShareModal
          mission={activeMission}
          intel={intel}
          directives={directives}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {showOptionsModal && activeMission && (
        <ProjectOptionsModal
          mission={activeMission}
          onUpdateMission={onUpdateMission}
          onDeleteMission={onDeleteMission}
          onClose={() => setShowOptionsModal(false)}
        />
      )}

      {/* Add Mission Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0c101a] border border-zinc-700 rounded-2xl p-5 shadow-2xl text-right">
            <div className="flex items-center justify-between pb-3 border-b craft-border mb-4">
              <h3 className="text-sm font-bold text-zinc-100">إطلاق مهمة / مشروع جديد</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-zinc-200">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMission} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">اسم المهمة</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: NexusOS Autonomous Engine"
                  className="w-full rounded-xl bg-black/60 border craft-border px-3.5 py-2 text-xs text-zinc-100 outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1">الرمز التكتيكي (Code)</label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  placeholder="مثال: NEXUS-02"
                  className="w-full rounded-xl bg-black/60 border craft-border px-3.5 py-2 text-xs text-zinc-100 font-telemetry outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs hover:bg-zinc-700 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-950 active:scale-95"
                >
                  تأكيد الإطلاق
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
