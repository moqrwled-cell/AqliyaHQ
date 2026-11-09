import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  Sparkles, 
  Send, 
  Mic, 
  Square, 
  RotateCcw, 
  Layers, 
  CheckCircle2, 
  ShieldAlert,
  Play,
  Terminal,
  Bot
} from 'lucide-react';
import type { 
  AgenticPlanDAG, 
  AgentTaskNode, 
  AgentRole, 
  TelemetryLogEntry, 
  AgentExecutionContext 
} from '../../lib/agentic-os/types';
import { generatePlanDAGFromDirective } from '../../lib/agentic-os/taskDAGEngine';
import { AgentExecutionBus } from '../../lib/agentic-os/agentExecutionBus';
import { AgentFleetCards } from './AgentFleetCards';
import { TaskDAGVisualizer } from './TaskDAGVisualizer';
import { LiveTelemetryFeed } from './LiveTelemetryFeed';
import { HumanApprovalModal } from './HumanApprovalModal';
import { tacticalAudio } from '../../lib/audio';

interface AgenticCommandDeckProps {
  missions: any[];
  intel: any[];
  memories: any[];
  dossier: any;
  battleLogs: any[];
  onOpenVoiceCall: () => void;
  onStateMutation?: (type: string, payload: any) => Promise<void>;
}

export const AgenticCommandDeck: React.FC<AgenticCommandDeckProps> = ({
  missions,
  intel,
  memories,
  dossier,
  battleLogs,
  onOpenVoiceCall,
  onStateMutation,
}) => {
  const [directiveInput, setDirectiveInput] = useState('');
  const [isPlanning, setIsPlanning] = useState(false);
  const [dag, setDag] = useState<AgenticPlanDAG | null>(null);
  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryLogEntry[]>([
    {
      id: 'init-telemetry',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      agentRole: 'chief_of_staff',
      level: 'info',
      message: 'نظام تشغيل الوكلاء AQLIYA Agentic OS متصل بنواة Google Gemini 3.5 Flash وبنك الذاكرة.',
    },
  ]);

  const [agentStatuses, setAgentStatuses] = useState<
    Record<AgentRole, { status: string; currentTask?: string }>
  >({
    chief_of_staff: { status: 'idle' },
    intel_scout: { status: 'idle' },
    systems_dev: { status: 'idle' },
    watchdog_sentry: { status: 'idle' },
    life_ops: { status: 'idle' },
  });

  const [pendingApprovalTask, setPendingApprovalTask] = useState<AgentTaskNode | null>(null);
  const busRef = useRef<AgentExecutionBus | null>(null);

  const dispatchTelemetry = (entry: Omit<TelemetryLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: TelemetryLogEntry = {
      ...entry,
      id: `tel-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    };
    setTelemetryLogs((prev) => [...prev, newEntry]);
  };

  const requestApproval = async (task: AgentTaskNode, reason: string): Promise<boolean> => {
    setPendingApprovalTask(task);
    return false;
  };

  // Build Context for Tools
  const executionContext: AgentExecutionContext = {
    missions,
    intel,
    memories,
    dossier,
    battleLogs,
    dispatchTelemetry,
    requestApproval,
    onStateMutation,
  };

  // Launch Swarm Directive
  const handleLaunchDirective = async (customText?: string) => {
    const text = customText || directiveInput;
    if (!text.trim() || isPlanning) return;

    tacticalAudio.playConfirm();
    setIsPlanning(true);
    setPendingApprovalTask(null);

    // Update Fleet status
    setAgentStatuses((prev) => ({
      ...prev,
      chief_of_staff: { status: 'planning', currentTask: 'تفكيك التوجيه وبناء الـ DAG' },
    }));

    dispatchTelemetry({
      agentRole: 'chief_of_staff',
      level: 'info',
      message: `تلقي توجيه القائد: "${text}" -> جارٍ تشغيل محرك التخطيط التكتيكي...`,
    });

    try {
      const generatedDAG = await generatePlanDAGFromDirective(text, {
        missions,
        intel,
        memories,
      });

      setDag(generatedDAG);
      setIsPlanning(false);

      dispatchTelemetry({
        agentRole: 'chief_of_staff',
        level: 'success',
        message: `تم بناء الـ DAG بنجاح (${generatedDAG.tasks.length} مهام مترابطة). بدء تشغيل الأسطول...`,
      });

      // Initialize and start bus
      const bus = new AgentExecutionBus({
        dag: generatedDAG,
        context: executionContext,
        onDAGUpdate: (updated) => setDag({ ...updated }),
        onAgentStatusChange: (role, status, currentTask) => {
          setAgentStatuses((prev) => ({
            ...prev,
            [role]: { status, currentTask },
          }));
        },
      });

      busRef.current = bus;
      await bus.startExecution();
    } catch (err: any) {
      setIsPlanning(false);
      dispatchTelemetry({
        agentRole: 'chief_of_staff',
        level: 'error',
        message: `فشل في إنشاء مسار المهام: ${err.message}`,
      });
    }
  };

  const handleApprove = async (taskId: string) => {
    setPendingApprovalTask(null);
    if (busRef.current) {
      await busRef.current.grantApproval(taskId);
    }
  };

  const handleReject = (taskId: string, reason: string) => {
    setPendingApprovalTask(null);
    if (busRef.current) {
      busRef.current.rejectApproval(taskId, reason);
    }
  };

  const quickDirectives = [
    'تحليل الروابط غير المراجعة في بنك الاستخبارات وربطها بمشروع NexusOS',
    'فحص ركود المشاريع عبر وكيل الرقابة واقتراح الخطوات القادمة Next Ops',
    'استخلاص قرارات اليوم وتوثيق إنجاز جديد في سجل المعارك Mind Vault',
  ];

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 gap-3 font-sans overflow-hidden">
      
      {/* 1. Master Directive Input Bar */}
      <div className="rounded-2xl border craft-border bg-[#090b10]/95 p-3 sm:p-4 backdrop-blur-md shadow-lg flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Cpu className="h-3.5 w-3.5" />
            </div>
            <h2 className="text-xs font-bold text-zinc-100 font-telemetry">
              منصة التوجيه الإستراتيجي لأسطول الوكلاء // SWARM DIRECTIVE DISPATCH
            </h2>
          </div>

          <span className="text-[10px] font-telemetry text-zinc-500">
            AQLIYA AGENTIC OS • v2.0
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={directiveInput}
              onChange={(e) => setDirectiveInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLaunchDirective()}
              placeholder="وجّه أسطول الوكلاء بأي مهمة كبرى... (مثال: حلل الاستخبارات وضع خطة NexusOS واربط المهام)"
              disabled={isPlanning}
              className="w-full rounded-xl border craft-border bg-zinc-950/80 px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 text-right font-sans"
            />
          </div>

          <button
            onClick={() => handleLaunchDirective()}
            disabled={isPlanning || !directiveInput.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 disabled:opacity-40 text-zinc-950 text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-95 flex-shrink-0"
          >
            {isPlanning ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin text-zinc-950" />
                <span>جارٍ التخطيط...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4 stroke-[2.5]" />
                <span>إطلاق الأسطول</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Directives Pills */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] text-zinc-500 font-telemetry ml-1">توجيهات سريعة:</span>
          {quickDirectives.map((qd, i) => (
            <button
              key={i}
              onClick={() => {
                setDirectiveInput(qd);
                handleLaunchDirective(qd);
              }}
              className="rounded-lg border craft-border bg-zinc-900/60 hover:bg-zinc-800/80 hover:border-zinc-600 px-2.5 py-1 text-[11px] text-zinc-300 transition-all text-right"
            >
              {qd}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Agent Fleet Cards */}
      <div className="flex-shrink-0">
        <AgentFleetCards
          agentStatuses={agentStatuses}
          activeSwarmCount={Object.values(agentStatuses).filter((s) => s.status === 'executing').length}
        />
      </div>

      {/* 3. Main Split Deck: DAG Canvas (Left) & Telemetry Feed (Right) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
        {/* Left: Task DAG Visualizer */}
        <div className="lg:col-span-6 h-full min-h-0 flex flex-col overflow-hidden">
          <TaskDAGVisualizer
            dag={dag}
            onApproveTask={(task) => setPendingApprovalTask(task)}
          />
        </div>

        {/* Right: Live Telemetry Terminal Feed */}
        <div className="lg:col-span-6 h-full min-h-0 flex flex-col overflow-hidden">
          <LiveTelemetryFeed
            entries={telemetryLogs}
            totalTokens={dag?.totalTokensUsed || 1200}
          />
        </div>
      </div>

      {/* 4. Human-In-The-Loop Approval Modal */}
      <HumanApprovalModal
        task={pendingApprovalTask}
        onApprove={handleApprove}
        onReject={handleReject}
      />

    </div>
  );
};
