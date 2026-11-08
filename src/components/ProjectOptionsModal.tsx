import React, { useState } from 'react';
import { 
  Settings2, 
  GitBranch, 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  Archive, 
  Calendar, 
  AlertTriangle,
  X,
  Save,
  Tag
} from 'lucide-react';
import type { Mission } from '../types';
import { tacticalAudio } from '../lib/audio';

interface ProjectOptionsModalProps {
  mission: Mission;
  onUpdateMission: (updated: Partial<Mission> & { id: string }) => void;
  onDeleteMission?: (id: string) => void;
  onClose: () => void;
}

export const ProjectOptionsModal: React.FC<ProjectOptionsModalProps> = ({
  mission,
  onUpdateMission,
  onDeleteMission,
  onClose,
}) => {
  const [title, setTitle] = useState(mission.title);
  const [code, setCode] = useState(mission.code);
  const [description, setDescription] = useState(mission.description || '');
  const [status, setStatus] = useState<Mission['status']>(mission.status || 'active');
  const [githubRepo, setGithubRepo] = useState(
    (mission as any).github_repo || 'https://github.com/moqrwled-cell/AqliyaHQ'
  );
  const [priority, setPriority] = useState<'P0' | 'P1' | 'P2'>('P0');
  
  // Milestones checklist
  const [milestones, setMilestones] = useState<Array<{ id: string; text: string; done: boolean }>>(
    (mission as any).milestones || [
      { id: 'm1', text: 'بناء النواة المركزية وهندسة البيانات', done: true },
      { id: 'm2', text: 'ربط محرك Gemini Flash فائق السرعة', done: true },
      { id: 'm3', text: 'إنشاء تطبيق الجوال المستقل APK وتفعيله', done: false },
      { id: 'm4', text: 'إطلاق شبكة Graphify التفاعلية', done: true },
    ]
  );
  const [newMilestoneText, setNewMilestoneText] = useState('');

  const handleToggleMilestone = (id: string) => {
    tacticalAudio.playBlip();
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, done: !m.done } : m))
    );
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneText.trim()) return;
    tacticalAudio.playConfirm();
    setMilestones((prev) => [
      ...prev,
      { id: `ms-${Date.now()}`, text: newMilestoneText.trim(), done: false },
    ]);
    setNewMilestoneText('');
  };

  const handleDeleteMilestone = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSaveAll = () => {
    tacticalAudio.playConfirm();
    const updatedData: any = {
      id: mission.id,
      title: title.trim() || mission.title,
      code: code.trim().toUpperCase() || mission.code,
      description: description.trim(),
      status,
      github_repo: githubRepo.trim(),
      milestones,
    };
    onUpdateMission(updatedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0c101a] border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-right max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b craft-border bg-[#0e1424]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Settings2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-100">خيارات وإعدادات المهمة</h3>
                <span className="text-[10px] font-telemetry px-2 py-0.5 rounded bg-zinc-800 text-emerald-300 border craft-border">
                  CONFIG & REPO
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">التحكم في معالم المشروع، مستودع GitHub، والمراحل التنفيذية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Form Area */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs font-sans">
          
          {/* Title & Code Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-300 block">اسم المشروع / المهمة</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl bg-black/60 border craft-border px-3.5 py-2 text-xs text-zinc-100 outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-300 block">الرمز التكتيكي (Code)</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-xl bg-black/60 border craft-border px-3.5 py-2 text-xs text-zinc-100 font-telemetry outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-300 block">الوصف والنطاق المعماري</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-xl bg-black/60 border craft-border px-3.5 py-2 text-xs text-zinc-100 outline-none focus:border-emerald-500 resize-none leading-relaxed"
            />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-300 block">حالة العمليات</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-xl bg-zinc-900 border craft-border px-3.5 py-2 text-xs text-zinc-200 outline-none"
              >
                <option value="active">🟢 عملية نشطة (Active Ops)</option>
                <option value="paused">🟡 معلقة مؤقتاً (Paused)</option>
                <option value="completed">🔵 مكتملة ومحققة (Completed)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-300 block">درجة الأولوية القيادية</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full rounded-xl bg-zinc-900 border craft-border px-3.5 py-2 text-xs text-zinc-200 outline-none"
              >
                <option value="P0">🔴 أولوية قصوى P0 (Crucial)</option>
                <option value="P1">🟠 أولوية عالية P1 (High)</option>
                <option value="P2">🟢 أولوية عادية P2 (Standard)</option>
              </select>
            </div>
          </div>

          {/* GitHub Repository Connection */}
          <div className="p-3.5 rounded-xl bg-zinc-900/60 border craft-border space-y-2">
            <label className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
              <GitBranch className="h-4 w-4 text-zinc-400" />
              <span>مستودع GitHub المرتبط بالمهمة</span>
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                placeholder="https://github.com/moqrwled-cell/AqliyaHQ"
                className="flex-1 rounded-xl bg-black/60 border craft-border px-3.5 py-2 text-xs text-zinc-100 font-telemetry outline-none focus:border-cyan-500"
              />
              <a
                href={githubRepo}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center gap-1"
              >
                <span>زيارة</span>
              </a>
            </div>
          </div>

          {/* Milestones & Execution Checklist */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-zinc-200 flex items-center gap-1.5 font-telemetry">
                <CheckSquare className="h-4 w-4 text-emerald-400" />
                <span>المعالم والمهام الفرعية (Milestones Checklist)</span>
              </label>
              <span className="text-[10px] font-telemetry text-zinc-400">
                {milestones.filter((m) => m.done).length} / {milestones.length} مكتملة
              </span>
            </div>

            {/* List */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/50 border craft-border hover:bg-zinc-900/80 transition-all"
                >
                  <button
                    onClick={() => handleToggleMilestone(m.id)}
                    className="flex items-center gap-2.5 text-right flex-1 min-w-0"
                  >
                    {m.done ? (
                      <CheckSquare className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Square className="h-4 w-4 text-zinc-500 shrink-0" />
                    )}
                    <span className={`text-xs ${m.done ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                      {m.text}
                    </span>
                  </button>
                  <button
                    onClick={() => handleDeleteMilestone(m.id)}
                    className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Milestone input */}
            <form onSubmit={handleAddMilestone} className="flex gap-2 pt-1">
              <input
                type="text"
                value={newMilestoneText}
                onChange={(e) => setNewMilestoneText(e.target.value)}
                placeholder="أضف معلماً أو خطوة تنفيذية جديدة..."
                className="flex-1 rounded-xl bg-black/60 border craft-border px-3.5 py-1.5 text-xs text-zinc-100 outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>إضافة</span>
              </button>
            </form>
          </div>

          {/* Delete Danger Zone */}
          {onDeleteMission && (
            <div className="p-3 rounded-xl border border-rose-900/30 bg-rose-950/10 flex items-center justify-between mt-3">
              <div>
                <span className="text-xs font-bold text-rose-300 block">حذف أو أرشفة المهمة</span>
                <span className="text-[10px] text-zinc-400">إزالة المهمة نهائياً من رادار العمليات</span>
              </div>
              <button
                onClick={() => {
                  if (confirm(`هل أنت متأكد من حذف المهمة ${mission.title}؟`)) {
                    onDeleteMission(mission.id);
                    onClose();
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all"
              >
                حذف المهمة
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0a0e17] border-t craft-border flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-all"
          >
            إلغاء
          </button>
          <button
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 px-5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-950 active:scale-95"
          >
            <Save className="h-4 w-4" />
            <span>حفظ التعديلات</span>
          </button>
        </div>

      </div>
    </div>
  );
};
