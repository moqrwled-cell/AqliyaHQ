import React, { useState } from 'react';
import { 
  FolderGit2, 
  CheckCircle2, 
  Plus, 
  ArrowUpRight, 
  Target, 
  TrendingUp,
  X
} from 'lucide-react';
import type { Mission } from '../types';
import { tacticalAudio } from '../lib/audio';

interface MissionsPanelProps {
  missions: Mission[];
  selectedMission: Mission | null;
  onSelectMission: (mission: Mission) => void;
  onUpdateMission: (updated: Partial<Mission> & { id: string }) => void;
  onAddMission: (title: string, code: string) => void;
}

export const MissionsPanel: React.FC<MissionsPanelProps> = ({
  missions,
  selectedMission,
  onSelectMission,
  onUpdateMission,
  onAddMission,
}) => {
  const [newLogText, setNewLogText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');

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

  return (
    <div className="flex flex-col h-full craft-surface rounded-2xl p-4 overflow-hidden text-right">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b craft-border mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-zinc-800/80 border craft-border text-zinc-200">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-zinc-100">المهمات والمشاريع</h2>
              <span className="text-[10px] font-telemetry px-1.5 py-0.5 rounded bg-zinc-800/80 border craft-border text-zinc-400">
                ACTIVE OPS
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">تتبع مسار NexusOS والعمليات النشطة</p>
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
          <span>مهمة جديدة</span>
        </button>
      </div>

      {/* Mission Tabs */}
      <div className="flex gap-1.5 pb-2.5 overflow-x-auto scrollbar-none mb-3">
        {missions.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              tacticalAudio.playBlip();
              onSelectMission(m);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-telemetry transition-all whitespace-nowrap border ${
              activeMission?.id === m.id
                ? 'bg-zinc-800 border-zinc-600 text-zinc-100 font-bold shadow-sm'
                : 'bg-zinc-900/60 craft-border text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <FolderGit2 className="h-3.5 w-3.5" />
            <span>[{m.code}]</span>
            <span className="font-sans font-medium">{m.title}</span>
          </button>
        ))}
      </div>

      {activeMission && (
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
          {/* Main Mission Card */}
          <div className="rounded-xl border craft-border bg-zinc-900/80 p-3.5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-[10px] font-telemetry text-zinc-500 uppercase tracking-wider">
                  MISSION PROFILE
                </span>
                <h3 className="text-sm font-bold text-zinc-100 mt-0.5">{activeMission.title}</h3>
              </div>
              <div className="flex items-center gap-1 text-xs font-telemetry font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-2 py-0.5 rounded">
                <TrendingUp className="h-3 w-3" />
                <span>{activeMission.progress_percent}%</span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              {activeMission.description || 'النظام المركزي لإدارة العمليات والذكاء الاصطناعي والمكونات التقنية.'}
            </p>

            {/* Progress Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-telemetry text-zinc-400">
                <span>مستوى الإنجاز التراكمي</span>
                <span className="text-zinc-200">{activeMission.progress_percent}%</span>
              </div>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
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
                <span>سجل الإنجازات الموثقة</span>
              </span>
              <span className="text-[10px] font-telemetry text-zinc-500">
                {(activeMission.done_log || []).length} مهام
              </span>
            </div>

            {/* Input */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newLogText}
                onChange={(e) => setNewLogText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddDoneLog()}
                placeholder="أضف ما أنجزته للتو (مثال: ربط الـ Supabase API بنجاح)..."
                className="flex-1 rounded-lg border craft-border bg-black/60 px-2.5 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-zinc-500"
              />
              <button
                onClick={handleAddDoneLog}
                className="rounded-lg bg-zinc-800 hover:bg-zinc-700 border craft-border px-3 py-1 text-xs font-medium text-zinc-200 active:scale-95 transition-all"
              >
                توثيق
              </button>
            </div>

            {/* Items */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {(activeMission.done_log || []).length > 0 ? (
                activeMission.done_log.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs text-zinc-300 bg-black/30 p-2 rounded-lg border craft-border"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="flex-1 leading-normal">{item}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-zinc-500 font-telemetry">
                  // لا توجد عناصر منجزة مسجلة بعد
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateMission}
            className="craft-surface-elevated w-full max-w-sm rounded-2xl p-5 text-right shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 mb-3 border-b craft-border">
              <h3 className="text-sm font-bold text-zinc-100">تأسيس مهمة / مشروع جديد</h3>
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
                <label className="text-zinc-400 block mb-1">اسم المهمة / المشروع</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: NexusOS Web Client"
                  className="w-full rounded-lg border craft-border bg-black/60 px-3 py-1.5 text-zinc-100 outline-none focus:border-zinc-500"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">الرمز الكودي (Code)</label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="مثال: NEXUS-WEB"
                  className="w-full rounded-lg border craft-border bg-black/60 px-3 py-1.5 font-telemetry text-zinc-100 outline-none focus:border-zinc-500"
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
                className="px-3.5 py-1.5 rounded-lg bg-zinc-100 text-zinc-950 font-bold hover:bg-white active:scale-95 text-xs transition-all"
              >
                تثبيت المهمة
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
