import React, { useState } from 'react';
import { 
  X, 
  RotateCcw, 
  Pause, 
  SkipForward, 
  UserCheck, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Bot, 
  Layers,
  Terminal,
  Activity
} from 'lucide-react';
import type { AgentTaskNode, AgentRole } from '../../lib/agentic-os/types';
import { AGENT_FLEET, getAgentByRole } from '../../lib/agentic-os/agentRegistry';

interface TaskDetailModalProps {
  task: AgentTaskNode | null;
  onClose: () => void;
  onPause: (taskId: string) => void;
  onRetry: (taskId: string) => void;
  onSkip: (taskId: string, reason?: string) => void;
  onReassign: (taskId: string, newAgent: AgentRole) => void;
  onManualOverride: (taskId: string, customOutput: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onPause,
  onRetry,
  onSkip,
  onReassign,
  onManualOverride,
}) => {
  if (!task) return null;

  const [isEditingOutput, setIsEditingOutput] = useState(false);
  const [editedOutput, setEditedOutput] = useState(task.outputResult || '');
  const [selectedAgent, setSelectedAgent] = useState<AgentRole>(task.assignedAgent);
  const [skipReason, setSkipReason] = useState('');
  const [showSkipInput, setShowSkipInput] = useState(false);

  const agentDef = getAgentByRole(task.assignedAgent);

  const handleSaveOverride = () => {
    onManualOverride(task.id, editedOutput);
    setIsEditingOutput(false);
  };

  const handleApplyReassign = () => {
    if (selectedAgent !== task.assignedAgent) {
      onReassign(task.id, selectedAgent);
    }
  };

  const handleConfirmSkip = () => {
    onSkip(task.id, skipReason || 'تخطي قيادي من القائد');
    setShowSkipInput(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-fadeIn text-right font-sans">
      <div className="apple-glass-elevated relative w-full max-w-2xl max-h-[90vh] rounded-3xl p-5 sm:p-6 flex flex-col overflow-hidden border border-white/10 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 flex-shrink-0">
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              [{task.id}]
            </span>
            <h3 className="text-sm font-bold text-white">تفاصيل المهمة والتحكم التكتيكي</h3>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Title & Agent Info */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                task.status === 'completed'
                  ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                  : task.status === 'in_progress'
                  ? 'bg-cyan-950/60 border-cyan-800 text-cyan-400 animate-pulse'
                  : task.status === 'waiting_approval'
                  ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400'
              }`}>
                الحالة: {task.status}
              </span>

              <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                <span className="text-zinc-500">الوكيل المكلف:</span>
                <span className="font-bold text-emerald-400">{agentDef.nameAr}</span>
                <span className="text-zinc-500 font-mono">({agentDef.name})</span>
              </div>
            </div>

            <h4 className="text-sm font-bold text-white mb-1.5">{task.title}</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">{task.description}</p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-2.5">
              <span className="text-[10px] text-zinc-500 block mb-0.5">زمن التنفيذ</span>
              <span className="font-mono text-zinc-200">{task.durationMs ? `${task.durationMs}ms` : '—'}</span>
            </div>
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-2.5">
              <span className="text-[10px] text-zinc-500 block mb-0.5">محاولات الإعادة</span>
              <span className="font-mono text-zinc-200">{task.retryCount || 0}</span>
            </div>
            <div className="rounded-xl bg-white/[0.02] border border-white/5 p-2.5">
              <span className="text-[10px] text-zinc-500 block mb-0.5">الاعتماديات</span>
              <span className="font-mono text-zinc-200">{task.dependencies.length > 0 ? task.dependencies.join(', ') : 'بدون'}</span>
            </div>
          </div>

          {/* Output Result / Manual Override */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setIsEditingOutput(!isEditingOutput)}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <Edit3 className="h-3 w-3" />
                <span>{isEditingOutput ? 'إلغاء التعديل' : 'تعديل المخرج يدوياً'}</span>
              </button>
              <span className="text-xs font-bold text-zinc-300">مخرجات المهمة الفعلية</span>
            </div>

            {isEditingOutput ? (
              <div className="space-y-2 mt-2">
                <textarea
                  value={editedOutput}
                  onChange={(e) => setEditedOutput(e.target.value)}
                  rows={5}
                  className="w-full rounded-xl border border-white/10 bg-zinc-950 p-3 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 text-right font-sans"
                  placeholder="أدخل مخرجات التدخل القيادي المباشر..."
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingOutput(false)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 text-xs"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSaveOverride}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    اعتماد المخرج يدوياً
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-black/40 border border-white/5 p-3 text-xs text-zinc-300 leading-relaxed font-sans max-h-48 overflow-y-auto">
                {task.outputResult || <span className="text-zinc-600 italic">لا توجد مخرجات مسجلة لهذه المهمة حتى الآن.</span>}
              </div>
            )}
          </div>

          {/* Reassignment Control */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-3.5 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value as AgentRole)}
                className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
              >
                {(Object.keys(AGENT_FLEET) as AgentRole[]).map((r) => (
                  <option key={r} value={r}>
                    {AGENT_FLEET[r].nameAr} ({AGENT_FLEET[r].name})
                  </option>
                ))}
              </select>
              <button
                onClick={handleApplyReassign}
                disabled={selectedAgent === task.assignedAgent}
                className="px-3 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 disabled:opacity-30 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all"
              >
                تحويل التفويض
              </button>
            </div>
            <span className="text-xs text-zinc-400">إعادة تفويض المهمة لوكيل آخر:</span>
          </div>

          {/* Execution Logs Timeline */}
          {task.executionLogs && task.executionLogs.length > 0 && (
            <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-4">
              <span className="text-xs font-bold text-zinc-300 block mb-2">سجل تتبع التنفيذ</span>
              <div className="space-y-1.5 font-mono text-[11px] text-zinc-400">
                {task.executionLogs.map((log, idx) => (
                  <div key={idx} className="rounded bg-black/20 p-1.5 border border-white/5">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onRetry(task.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-200 transition-all active:scale-95"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>إعادة المحاولة</span>
            </button>

            {task.status === 'in_progress' && (
              <button
                onClick={() => onPause(task.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-300 transition-all active:scale-95"
              >
                <Pause className="h-3.5 w-3.5" />
                <span>إيقاف مؤقت</span>
              </button>
            )}

            <button
              onClick={() => setShowSkipInput(!showSkipInput)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-bold text-rose-300 transition-all active:scale-95"
            >
              <SkipForward className="h-3.5 w-3.5" />
              <span>تخطي المهمة</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-zinc-200"
          >
            إغلاق
          </button>
        </div>

        {/* Skip reason popover */}
        {showSkipInput && (
          <div className="mt-3 p-3 rounded-2xl bg-zinc-950 border border-rose-500/40 space-y-2 animate-slideDown">
            <span className="text-xs text-rose-300 font-bold block">سبب تخطي المهمة:</span>
            <input
              type="text"
              value={skipReason}
              onChange={(e) => setSkipReason(e.target.value)}
              placeholder="مثال: تم إنجاز المتطلب خارج المنظومة / تخطي استراتيجي"
              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-3 py-1.5 text-xs text-white"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowSkipInput(false)}
                className="px-2.5 py-1 text-xs text-zinc-400"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmSkip}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg"
              >
                تأكيد التخطي
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
