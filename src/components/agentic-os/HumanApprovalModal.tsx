import React, { useState } from 'react';
import { ShieldAlert, Check, X, AlertTriangle, Cpu, Terminal } from 'lucide-react';
import type { AgentTaskNode } from '../../lib/agentic-os/types';
import { AGENT_FLEET } from '../../lib/agentic-os/agentRegistry';

interface HumanApprovalModalProps {
  task: AgentTaskNode | null;
  onApprove: (taskId: string) => void;
  onReject: (taskId: string, reason: string) => void;
}

export const HumanApprovalModal: React.FC<HumanApprovalModalProps> = ({
  task,
  onApprove,
  onReject,
}) => {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  if (!task) return null;

  const agent = AGENT_FLEET[task.assignedAgent];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border-2 border-amber-500/80 bg-[#090b10] shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden flex flex-col font-sans">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950/60 via-zinc-900 to-amber-950/40 p-4 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-400">
              <ShieldAlert className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-telemetry tracking-widest text-amber-400 uppercase">
                  HUMAN-IN-THE-LOOP // BINDING GATE
                </span>
                <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">
                  بوابة الحسم
                </span>
              </div>
              <h2 className="text-base font-bold text-zinc-100">
                طلب اعتماد من: {agent.nameAr}
              </h2>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 text-right">
          
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3.5 space-y-2">
            <div className="text-xs text-zinc-400 font-telemetry flex items-center justify-between">
              <span>معرف المهمة: {task.id}</span>
              <span className="text-amber-400 font-bold">إجراء حرج يتطلب تفويض القائد</span>
            </div>
            <h3 className="text-sm font-bold text-zinc-100">{task.title}</h3>
            <p className="text-xs leading-relaxed text-zinc-300">{task.description}</p>
          </div>

          {task.inputPayload?.suggestedTool && (
            <div className="rounded-lg bg-zinc-900/60 border border-zinc-800 px-3 py-2 text-xs flex items-center justify-between">
              <span className="text-zinc-400">الأداة المطلوبة للتنفيذ:</span>
              <code className="text-cyan-400 font-mono text-[11px] bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                {task.inputPayload.suggestedTool}
              </code>
            </div>
          )}

          {showRejectInput ? (
            <div className="space-y-2">
              <label className="text-xs text-rose-300">سبب الرفض أو توجيه تصحيحي للوكيل:</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="اكتب التوجيه البديل للوكيل..."
                rows={2}
                className="w-full rounded-xl border border-rose-900/60 bg-rose-950/20 p-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500"
              />
            </div>
          ) : (
            <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 bg-amber-950/20 border border-amber-900/40 p-2.5 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
              <span>لن يقوم الوكيل بأي تغيير دائم في قاعدة البيانات أو النظام دون موافقتك الصريحة.</span>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-950/90 border-t border-zinc-800 flex items-center justify-between gap-3">
          {showRejectInput ? (
            <>
              <button
                onClick={() => setShowRejectInput(false)}
                className="px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
              >
                تراجع
              </button>
              <button
                onClick={() => onReject(task.id, rejectReason)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all"
              >
                <X className="h-4 w-4" />
                <span>تأكيد الرفض</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowRejectInput(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-rose-400 hover:border-rose-900 text-xs transition-all"
              >
                <X className="h-4 w-4" />
                <span>رفض / توجيه آخر</span>
              </button>
              <button
                onClick={() => onApprove(task.id)}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
              >
                <Check className="h-4 w-4 stroke-[3]" />
                <span>اعتماد وتنفيذ فوراً</span>
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
