import React from 'react';
import { 
  GitCommit, 
  ArrowDown, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  AlertCircle,
  Play,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import type { AgenticPlanDAG, AgentTaskNode } from '../../lib/agentic-os/types';
import { AGENT_FLEET } from '../../lib/agentic-os/agentRegistry';

interface TaskDAGVisualizerProps {
  dag: AgenticPlanDAG | null;
  onApproveTask: (task: AgentTaskNode) => void;
}

export const TaskDAGVisualizer: React.FC<TaskDAGVisualizerProps> = ({
  dag,
  onApproveTask,
}) => {
  if (!dag || dag.tasks.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center rounded-2xl border craft-border bg-[#090b10]/80 p-6 text-center text-zinc-500 font-telemetry">
        <Layers className="h-10 w-10 text-zinc-700 mb-3 stroke-[1.5]" />
        <h4 className="text-sm font-bold text-zinc-300">مخطط المهام المترابطة (DAG) غير مفعل حالياً</h4>
        <p className="text-xs text-zinc-500 mt-1 max-w-sm">
          أصدر توجيهاً جديداً للقائد في شريط الأوامر بالأعلى، وسيقوم محرك التخطيط برسم شبكة المهام وتوزيعها على الوكلاء هنا فوراً.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: AgentTaskNode['status']) => {
    switch (status) {
      case 'completed':
        return { label: 'مكتمل', color: 'bg-emerald-950/60 border-emerald-800 text-emerald-400', icon: CheckCircle2 };
      case 'in_progress':
        return { label: 'قيد التنفيذ', color: 'bg-cyan-950/60 border-cyan-800 text-cyan-400 animate-pulse', icon: Play };
      case 'waiting_approval':
        return { label: 'بانتظار الاعتماد', color: 'bg-amber-950/60 border-amber-800 text-amber-300 animate-bounce', icon: ShieldAlert };
      case 'failed':
        return { label: 'فشل / مرفوض', color: 'bg-rose-950/60 border-rose-800 text-rose-400', icon: AlertCircle };
      default:
        return { label: 'في الانتظار', color: 'bg-zinc-900 border-zinc-800 text-zinc-500', icon: Clock };
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border craft-border bg-[#090b10]/90 backdrop-blur-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b craft-border bg-zinc-950/80 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <GitCommit className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-bold text-zinc-200">
            مخطط تدفق المهام // TASK DAG PIPELINE
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-telemetry">
          <span className="text-zinc-500">حالة المسار:</span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
            dag.overallStatus === 'completed'
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              : dag.overallStatus === 'running'
              ? 'bg-cyan-950 text-cyan-400 border border-cyan-800 animate-pulse'
              : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
          }`}>
            {dag.overallStatus.toUpperCase()}
          </span>
        </div>
      </div>

      {/* DAG Flow Canvas */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {dag.tasks.map((task, idx) => {
          const agent = AGENT_FLEET[task.assignedAgent];
          const badge = getStatusBadge(task.status);
          const BadgeIcon = badge.icon;

          return (
            <React.Fragment key={task.id}>
              {/* Task Node Card */}
              <div
                className={`relative rounded-xl border p-3.5 transition-all text-right ${
                  task.status === 'in_progress'
                    ? 'border-cyan-500/70 bg-cyan-950/20 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
                    : task.status === 'waiting_approval'
                    ? 'border-amber-500/80 bg-amber-950/20 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                    : task.status === 'completed'
                    ? 'border-emerald-900/60 bg-emerald-950/10'
                    : 'border-zinc-800/80 bg-zinc-950/50 opacity-80'
                }`}
              >
                {/* Node Top bar */}
                <div className="flex items-center justify-between mb-2">
                  {/* Status Badge */}
                  <span
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold ${badge.color}`}
                  >
                    <BadgeIcon className="h-3 w-3" />
                    <span>{badge.label}</span>
                  </span>

                  {/* Assigned Agent */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-telemetry text-zinc-300 font-bold">
                      {agent.nameAr}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">[{task.id}]</span>
                  </div>
                </div>

                {/* Task Title & Details */}
                <h4 className="text-xs font-bold text-zinc-100 mb-1">{task.title}</h4>
                <p className="text-[11px] leading-relaxed text-zinc-400">{task.description}</p>

                {/* Output or Logs */}
                {task.outputResult && (
                  <div className="mt-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800/80 p-2 text-[11px] text-zinc-300 font-sans border-r-2 border-r-emerald-500">
                    <span className="text-[9px] text-zinc-500 font-telemetry block mb-0.5">
                      مخرجات الوكيل:
                    </span>
                    {task.outputResult}
                  </div>
                )}

                {/* Action button if waiting for approval */}
                {task.status === 'waiting_approval' && (
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => onApproveTask(task)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all"
                    >
                      <ShieldAlert className="h-3.5 w-3.5" />
                      <span>اتخاذ قرار الحسم الآن</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Connecting Arrow between nodes */}
              {idx < dag.tasks.length - 1 && (
                <div className="flex justify-center -my-1 text-zinc-700">
                  <ArrowDown className="h-4 w-4" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
