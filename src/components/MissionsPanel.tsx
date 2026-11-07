import React, { useState } from 'react';
import { 
  FolderGit2, 
  CheckCircle2, 
  CircleDot, 
  Plus, 
  GitCommit, 
  ArrowUpRight, 
  Target, 
  Activity, 
  TrendingUp,
  Clock,
  Sparkles
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
    <div className="flex flex-col h-full hud-panel rounded-xl border border-slate-800 p-4 overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Target className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>المهمات والمشاريع</span>
              <span className="text-[10px] font-mono-hud text-emerald-400">// MISSIONS</span>
            </h2>
            <p className="text-[11px] text-slate-400">تتبع مسار NexusOS والعمليات النشطة</p>
          </div>
        </div>

        <button
          onClick={() => {
            tacticalAudio.playBlip();
            setShowAddModal(true);
          }}
          className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-lg transition-all active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>مهمة جديدة</span>
        </button>
      </div>

      {/* Missions Selector Tabs */}
      <div className="flex gap-2 pb-3 overflow-x-auto scrollbar-none mb-3">
        {missions.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              tacticalAudio.playBlip();
              onSelectMission(m);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono-hud transition-all whitespace-nowrap border ${
              activeMission?.id === m.id
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 glow-emerald font-bold'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderGit2 className="h-3.5 w-3.5" />
            <span>[{m.code}]</span>
            <span className="font-sans font-medium">{m.title}</span>
          </button>
        ))}
      </div>

      {activeMission ? (
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Mission Telemetry Card */}
          <div className="rounded-xl border border-slate-800/90 bg-[#0a0d14]/80 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-[10px] font-mono-hud text-slate-500 uppercase">MISSION OBJECTIVE</span>
                <h3 className="text-base font-bold text-white">{activeMission.title}</h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono-hud font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                <Activity className="h-3 w-3" />
                <span>{activeMission.progress_percent}% مكتمل</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              {activeMission.description || 'النظام المركزي لإدارة العمليات والذكاء الاصطناعي والمكونات التقنية.'}
            </p>

            {/* Interactive Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-mono-hud text-slate-400">
                <span>مؤشر تقدم المهمة</span>
                <span>{activeMission.progress_percent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={activeMission.progress_percent || 0}
                onChange={(e) => handleProgressChange(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Current Focus vs Next Ops Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Current Focus */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-1.5 font-mono-hud">
                <CircleDot className="h-3.5 w-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>التركيز الحالي // IN PROGRESS</span>
              </div>
              <textarea
                value={activeMission.current_focus || ''}
                onChange={(e) => onUpdateMission({ id: activeMission.id, current_focus: e.target.value })}
                placeholder="ما الذي تعمل عليه في هذا المشروع الآن؟"
                className="w-full bg-transparent text-xs text-slate-200 placeholder:text-slate-600 resize-none outline-none leading-relaxed"
                rows={2}
              />
            </div>

            {/* Next Ops */}
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300 mb-1.5 font-mono-hud">
                <ArrowUpRight className="h-3.5 w-3.5 text-cyan-400" />
                <span>الخطوة القادمة // NEXT OPS</span>
              </div>
              <textarea
                value={activeMission.next_ops || ''}
                onChange={(e) => onUpdateMission({ id: activeMission.id, next_ops: e.target.value })}
                placeholder="ما هي الخطوة الحاسمة التالية؟"
                className="w-full bg-transparent text-xs text-slate-200 placeholder:text-slate-600 resize-none outline-none leading-relaxed"
                rows={2}
              />
            </div>
          </div>

          {/* Done Log Section (سجل ما تم إنجازه) */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-mono-hud">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>سجل ما تم إنجازه // DONE LOG</span>
              </span>
              <span className="text-[10px] font-mono-hud text-slate-500">
                {(activeMission.done_log || []).length} عمليات موثقة
              </span>
            </div>

            {/* Add done item input */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newLogText}
                onChange={(e) => setNewLogText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddDoneLog()}
                placeholder="أضف ما أنجزته للتو (مثال: ربط الـ Supabase API بنجاح)..."
                className="flex-1 rounded-lg border border-slate-800 bg-slate-950/80 px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-emerald-500/40"
              />
              <button
                onClick={handleAddDoneLog}
                className="rounded-lg bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 active:scale-95 transition-all"
              >
                توثيق
              </button>
            </div>

            {/* Done items list */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {(activeMission.done_log || []).length > 0 ? (
                activeMission.done_log.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/40 p-2 rounded-lg border border-slate-800/50"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="flex-1 leading-normal">{item}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-slate-500 font-mono-hud">
                  // لا توجد سجلات منجزة مسجلة بعد — ابدأ بتوثيق أول إنجاز
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Add Mission Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateMission}
            className="hud-panel w-full max-w-sm rounded-xl border border-slate-800 p-5 shadow-2xl"
          >
            <h3 className="text-sm font-bold text-white mb-3">تأسيس مهمة / مشروع جديد</h3>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">اسم المهمة / المشروع</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: NexusOS Web Client"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-emerald-500/40"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">الرمز الكودي (Code)</label>
                <input
                  type="text"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="مثال: NEXUS-WEB"
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-mono-hud text-slate-100 outline-none focus:border-emerald-500/40"
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
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30"
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
