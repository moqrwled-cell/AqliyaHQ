import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Pause,
  Terminal,
  Bot,
  RefreshCw,
  SlidersHorizontal,
  Activity,
  Zap,
  BarChart3,
  Clock,
  CheckCircle
} from 'lucide-react';
import type { 
  AgenticPlanDAG, 
  AgentTaskNode, 
  AgentRole, 
  TelemetryLogEntry, 
  AgentExecutionContext 
} from '../../lib/agentic-os/types';
import { TaskDispatcher } from '../../lib/agentic-os/taskDispatcher';
import { AgentExecutionBus } from '../../lib/agentic-os/agentExecutionBus';
import { MissionControlEngine, type WorkloadMetrics } from '../../lib/agentic-os/missionControlEngine';
import { AGENT_FLEET, getAgentByRole } from '../../lib/agentic-os/agentRegistry';
import { AgentFleetCards } from './AgentFleetCards';
import { TaskDAGVisualizer } from './TaskDAGVisualizer';
import { LiveTelemetryFeed } from './LiveTelemetryFeed';
import { HumanApprovalModal } from './HumanApprovalModal';
import { TaskDetailModal } from './TaskDetailModal';
import { ToolExecutionEngine } from '../../lib/agentic-os/tools/toolExecutionEngine';
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
  const [activeDeckTab, setActiveDeckTab] = useState<'dag' | 'tasks' | 'telemetry' | 'audit'>('dag');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<AgentTaskNode | null>(null);

  const [telemetryLogs, setTelemetryLogs] = useState<TelemetryLogEntry[]>([
    {
      id: 'init-telemetry',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      agentRole: 'chief_of_staff',
      level: 'info',
      message: 'نظام تشغيل الوكلاء AQLIYA Mission Control متصل ومحرك الأدوات الـ 16 في وضع الجاهزية التامة.',
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

  // Compute live real-time metrics
  const metrics: WorkloadMetrics = useMemo(() => {
    return MissionControlEngine.getWorkloadMetrics(dag);
  }, [dag, telemetryLogs]);

  // Compute live fleet states
  const fleetStates = useMemo(() => {
    return MissionControlEngine.getLiveFleetStatus(dag, agentStatuses);
  }, [dag, agentStatuses]);

  // Auto-refresh interval (every 3 seconds)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      // Re-trigger memo computations
      setAgentStatuses((prev) => ({ ...prev }));
    }, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const dispatchTelemetry = (entry: Omit<TelemetryLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: TelemetryLogEntry = {
      ...entry,
      id: `tel-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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

  // Launch Swarm Directive via TaskDispatcher
  const handleLaunchDirective = async (customText?: string) => {
    const text = customText || directiveInput;
    if (!text.trim() || isPlanning) return;

    try {
      tacticalAudio.playConfirm();
    } catch {}

    setIsPlanning(true);
    setPendingApprovalTask(null);

    setAgentStatuses((prev) => ({
      ...prev,
      chief_of_staff: { status: 'planning', currentTask: 'تحديد استراتيجية التوزيع وبناء الـ DAG' },
    }));

    dispatchTelemetry({
      agentRole: 'chief_of_staff',
      level: 'info',
      message: `تلقي توجيه القائد: "${text}" -> جارٍ تشغيل موزع المهام Task Dispatcher...`,
    });

    try {
      const generatedDAG = await TaskDispatcher.dispatchDirective(text, {
        missions,
        intel,
        memories,
        dossier,
      });

      setDag(generatedDAG);
      setIsPlanning(false);

      dispatchTelemetry({
        agentRole: 'chief_of_staff',
        level: 'success',
        message: `تم توليد مسار المهام [${generatedDAG.dispatchStrategy || 'autonomous'}] بنجاح (${generatedDAG.tasks.length} مهام). بدء تشغيل الأسطول...`,
      });

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

  // Interactive Task Interventions
  const handlePauseTask = (taskId: string) => {
    if (!dag) return;
    const updated = MissionControlEngine.pauseTask(dag, taskId);
    setDag(updated);
    dispatchTelemetry({
      agentRole: 'chief_of_staff',
      level: 'warn',
      message: `تم إيقاف المهمة [${taskId}] مؤقتاً بأمر القائد.`,
    });
  };

  const handleRetryTask = async (taskId: string) => {
    if (!dag) return;
    const updated = MissionControlEngine.retryTask(dag, taskId);
    setDag(updated);
    dispatchTelemetry({
      agentRole: 'chief_of_staff',
      level: 'info',
      message: `أمر إعادة تشغيل المهمة [${taskId}] من القائد...`,
    });
    if (busRef.current) {
      busRef.current.updateDAG(updated);
      await busRef.current.startExecution();
    }
  };

  const handleSkipTask = (taskId: string, reason?: string) => {
    if (!dag) return;
    const updated = MissionControlEngine.skipTask(dag, taskId, reason);
    setDag(updated);
    dispatchTelemetry({
      agentRole: 'chief_of_staff',
      level: 'info',
      message: `تم تخطي المهمة [${taskId}] بقرار قيادي صريح.`,
    });
    if (busRef.current) {
      busRef.current.updateDAG(updated);
      busRef.current.startExecution();
    }
  };

  const handleReassignTask = (taskId: string, newAgent: AgentRole) => {
    if (!dag) return;
    const updated = MissionControlEngine.reassignTask(dag, taskId, newAgent);
    setDag(updated);
    dispatchTelemetry({
      agentRole: 'chief_of_staff',
      level: 'info',
      message: `تم إعادة تفويض المهمة [${taskId}] للوكيل [${newAgent}].`,
    });
  };

  const handleManualOverride = (taskId: string, customOutput: string) => {
    if (!dag) return;
    const updated = MissionControlEngine.manualOverride(dag, taskId, customOutput);
    setDag(updated);
    dispatchTelemetry({
      agentRole: 'chief_of_staff',
      level: 'success',
      message: `تم التدخل اليدوي واعتماد مخرجات القائد للمهمة [${taskId}].`,
    });
    if (busRef.current) {
      busRef.current.updateDAG(updated);
      busRef.current.startExecution();
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

  const handleTogglePlanPause = () => {
    if (!busRef.current || !dag) return;
    if (dag.overallStatus === 'running') {
      busRef.current.pauseExecution();
    } else {
      busRef.current.startExecution();
    }
  };

  const auditRecords = ToolExecutionEngine.getAuditRecords();

  const quickDirectives = [
    'حلل فرصة إطلاق منتج SaaS جديد للذكاء الاصطناعي في إدارة الكافيهات',
    'فحص ركود المشاريع عبر وكيل الرقابة واقتراح الخطوات القادمة Next Ops',
    'اكتب دالة برمجية في TypeScript لفرز المهام التكتيكية',
    'وثق في ذاكرتي أن وقت ذروة تركيزي هو بعد صلاة الفجر',
  ];

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 gap-3 font-sans overflow-hidden">
      
      {/* 1. Master Directive Input Bar */}
      <div className="rounded-3xl apple-glass p-3.5 sm:p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-wide">
                مركز التحكم والعمليات الموحد // AQLIYA MISSION CONTROL
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono border transition-all ${
                autoRefresh
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-white/5 border-white/10 text-zinc-400'
              }`}
            >
              <RefreshCw className={`h-3 w-3 ${autoRefresh ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
              <span>{autoRefresh ? 'تحديث حي' : 'تحديث يدوي'}</span>
            </button>

            <span className="text-[10px] font-mono text-zinc-400">
              صحة المنظومة: <strong className="text-emerald-400 font-bold">{metrics.healthIndex}%</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={directiveInput}
              onChange={(e) => setDirectiveInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLaunchDirective()}
              placeholder="وجّه أسطول الوكلاء... (مثال: حلل فرصة إطلاق SaaS جديد / اكتب كود لفرز المهام)"
              disabled={isPlanning}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 text-right font-sans"
            />
          </div>

          <button
            onClick={() => handleLaunchDirective()}
            disabled={isPlanning || !directiveInput.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 text-black text-xs font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 flex-shrink-0"
          >
            {isPlanning ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin text-black" />
                <span>جارٍ التخطيط...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4 stroke-[2.5]" />
                <span>إطلاق المهمة</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Directives Pills */}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] text-zinc-400 ml-1">توجيهات سريعة:</span>
          {quickDirectives.map((qd, i) => (
            <button
              key={i}
              onClick={() => {
                setDirectiveInput(qd);
                handleLaunchDirective(qd);
              }}
              className="rounded-xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/15 px-2.5 py-1 text-[11px] text-zinc-300 transition-all text-right"
            >
              {qd}
            </button>
          ))}
        </div>
      </div>

      {/* 2. System Health & Workload Metrics HUD Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 flex-shrink-0">
        <div className="rounded-2xl apple-glass p-2.5 flex items-center justify-between">
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block">حالة الأسطول</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              {metrics.activeAgentsCount > 0 ? `${metrics.activeAgentsCount} نشط` : 'في الاستعداد'}
            </span>
          </div>
          <Bot className="h-4 w-4 text-emerald-400" />
        </div>

        <div className="rounded-2xl apple-glass p-2.5 flex items-center justify-between">
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block">المهام الجارية</span>
            <span className="text-xs font-bold text-cyan-400 font-mono">
              {metrics.inProgressTasks} / {metrics.totalTasks}
            </span>
          </div>
          <Activity className="h-4 w-4 text-cyan-400" />
        </div>

        <div className="rounded-2xl apple-glass p-2.5 flex items-center justify-between">
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block">المهام المكتملة</span>
            <span className="text-xs font-bold text-teal-300 font-mono">
              {metrics.completedTasks}
            </span>
          </div>
          <CheckCircle className="h-4 w-4 text-teal-400" />
        </div>

        <div className="rounded-2xl apple-glass p-2.5 flex items-center justify-between">
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block">بانتظار الحسم</span>
            <span className="text-xs font-bold text-amber-400 font-mono">
              {metrics.pendingApprovalTasks}
            </span>
          </div>
          <ShieldAlert className="h-4 w-4 text-amber-400" />
        </div>

        <div className="rounded-2xl apple-glass p-2.5 flex items-center justify-between">
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block">استهلاك الأدوات</span>
            <span className="text-xs font-bold text-purple-300 font-mono">
              {metrics.totalToolExecutions} أداة
            </span>
          </div>
          <Zap className="h-4 w-4 text-purple-400" />
        </div>

        <div className="rounded-2xl apple-glass p-2.5 flex items-center justify-between">
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block">استهلاك Tokens</span>
            <span className="text-xs font-bold text-zinc-200 font-mono">
              {metrics.totalTokensUsed}
            </span>
          </div>
          <BarChart3 className="h-4 w-4 text-zinc-400" />
        </div>
      </div>

      {/* 3. Agent Fleet Cards */}
      <div className="flex-shrink-0">
        <AgentFleetCards
          agentStatuses={agentStatuses}
          activeSwarmCount={metrics.activeAgentsCount}
        />
      </div>

      {/* 4. Navigation View Tabs */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2 flex-shrink-0">
        <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-2xl border border-white/5">
          <button
            onClick={() => setActiveDeckTab('dag')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeDeckTab === 'dag'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            مخطط الـ DAG
          </button>
          <button
            onClick={() => setActiveDeckTab('tasks')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeDeckTab === 'tasks'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            إدارة المهام والتحكم التفاعلي ({dag?.tasks?.length || 0})
          </button>
          <button
            onClick={() => setActiveDeckTab('telemetry')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeDeckTab === 'telemetry'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            بث التتبع الحي ({telemetryLogs.length})
          </button>
          <button
            onClick={() => setActiveDeckTab('audit')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeDeckTab === 'audit'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            سجلات تدقيق الأدوات ({auditRecords.length})
          </button>
        </div>

        {dag && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePlanPause}
              className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 transition-all"
            >
              {dag.overallStatus === 'running' ? (
                <>
                  <Pause className="h-3 w-3 text-amber-400" />
                  <span>إيقاف الخطة</span>
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 text-emerald-400" />
                  <span>استئناف الخطة</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* 5. Main Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeDeckTab === 'dag' && (
          <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
            <div className="lg:col-span-7 h-full min-h-0 flex flex-col overflow-hidden">
              <TaskDAGVisualizer
                dag={dag}
                onApproveTask={(task) => setPendingApprovalTask(task)}
                onSelectTask={(task) => setSelectedTaskForDetail(task)}
              />
            </div>
            <div className="lg:col-span-5 h-full min-h-0 flex flex-col overflow-hidden">
              <LiveTelemetryFeed
                entries={telemetryLogs}
                totalTokens={dag?.totalTokensUsed || 0}
              />
            </div>
          </div>
        )}

        {activeDeckTab === 'tasks' && (
          <div className="h-full rounded-3xl apple-glass p-4 overflow-y-auto space-y-2.5">
            {!dag || dag.tasks.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs">
                لا توجد خطة مهام نشطة حالياً. أرسل توجيهاً لبدء مصفوفة العمليات.
              </div>
            ) : (
              dag.tasks.map((task) => {
                const agent = AGENT_FLEET[task.assignedAgent];
                return (
                  <div
                    key={task.id}
                    className="rounded-2xl bg-white/[0.03] border border-white/5 p-3.5 flex flex-wrap items-center justify-between gap-3 text-right hover:border-white/15 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedTaskForDetail(task)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-200 transition-all"
                      >
                        فتح التحكم والتفاصيل
                      </button>

                      <button
                        onClick={() => handleRetryTask(task.id)}
                        title="إعادة المحاولة"
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>

                      {task.status === 'in_progress' && (
                        <button
                          onClick={() => handlePauseTask(task.id)}
                          title="إيقاف مؤقت"
                          className="p-1.5 rounded-lg bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                        >
                          <Pause className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="text-right flex-1 max-w-xl">
                      <div className="flex items-center justify-end gap-2 mb-1">
                        <span className="text-xs font-bold text-white">{task.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-zinc-400">
                          [{task.id}]
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-1">{task.description}</p>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        task.status === 'completed'
                          ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                          : task.status === 'in_progress'
                          ? 'bg-cyan-950/60 border-cyan-800 text-cyan-400 animate-pulse'
                          : task.status === 'waiting_approval'
                          ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}>
                        {task.status}
                      </span>
                      <span className="text-emerald-400 font-bold">{agent.nameAr}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeDeckTab === 'telemetry' && (
          <div className="h-full flex flex-col">
            <LiveTelemetryFeed
              entries={telemetryLogs}
              totalTokens={dag?.totalTokensUsed || 0}
            />
          </div>
        )}

        {activeDeckTab === 'audit' && (
          <div className="h-full rounded-3xl apple-glass p-4 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
              <span className="text-xs text-zinc-400 font-mono">إجمالي العمليات: {auditRecords.length}</span>
              <h3 className="text-xs font-bold text-white">سجل تدقيق الأدوات التنفيذية (Audit Trail)</h3>
            </div>

            {auditRecords.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs">
                لا توجد سجلات تدقيق حتى الآن.
              </div>
            ) : (
              <div className="space-y-2">
                {auditRecords.slice().reverse().map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="font-mono text-[10px] text-zinc-500">
                      {new Date(rec.timestamp).toLocaleTimeString('ar-EG')}
                    </span>

                    <span className="font-mono text-zinc-400">{rec.durationMs}ms</span>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rec.status === 'success'
                        ? 'bg-emerald-950 text-emerald-400'
                        : rec.status === 'denied'
                        ? 'bg-amber-950 text-amber-400'
                        : 'bg-rose-950 text-rose-400'
                    }`}>
                      {rec.status}
                    </span>

                    <span className="text-zinc-300 flex-1 text-right line-clamp-1">
                      {rec.resultSummary || rec.error || 'تم التنفيذ'}
                    </span>

                    <span className="font-mono text-emerald-400">{rec.toolName}</span>

                    <span className="text-zinc-400 font-bold">{getAgentByRole(rec.callerAgent).nameAr}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. Modals */}
      <HumanApprovalModal
        task={pendingApprovalTask}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <TaskDetailModal
        task={selectedTaskForDetail}
        onClose={() => setSelectedTaskForDetail(null)}
        onPause={handlePauseTask}
        onRetry={handleRetryTask}
        onSkip={handleSkipTask}
        onReassign={handleReassignTask}
        onManualOverride={handleManualOverride}
      />

    </div>
  );
};
