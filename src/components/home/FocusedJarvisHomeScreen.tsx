import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Flame, 
  Clock, 
  ArrowUpRight, 
  Plus, 
  TrendingUp, 
  Dumbbell, 
  Briefcase, 
  GraduationCap, 
  ChevronLeft, 
  Send, 
  Mic, 
  Zap, 
  Moon, 
  AlertCircle,
  Play,
  RotateCcw
} from 'lucide-react';
import { UnifiedStorage, type SystemGoal, type TacticalTask } from '../../lib/storage/unifiedStorage';
import { SleepTrackerEngine } from '../../lib/sleepTrackerEngine';
import { tacticalAudio } from '../../lib/audio';

interface FocusedJarvisHomeScreenProps {
  onOpenAdvisor: (initialPrompt?: string) => void;
  onNavigateTab: (tab: 'tasks' | 'intel' | 'settings') => void;
}

export const FocusedJarvisHomeScreen: React.FC<FocusedJarvisHomeScreenProps> = ({
  onOpenAdvisor,
  onNavigateTab,
}) => {
  const [goals, setGoals] = useState<SystemGoal[]>(() => UnifiedStorage.getGoals());
  const [tasks, setTasks] = useState<TacticalTask[]>(() => UnifiedStorage.getTasks());
  const [periodFocus, setPeriodFocus] = useState(() => UnifiedStorage.getPeriodFocus());
  const [sleepScore, setSleepScore] = useState(() => SleepTrackerEngine.getRecoveryScore());

  // Focus Timer State
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(25 * 60);

  // Quick Task Add Input
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Quick Advisor Input
  const [advisorPrompt, setAdvisorPrompt] = useState('');

  // Date Formatter
  const todayDateAr = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  useEffect(() => {
    const handleUpdate = () => {
      setGoals(UnifiedStorage.getGoals());
      setTasks(UnifiedStorage.getTasks());
      setPeriodFocus(UnifiedStorage.getPeriodFocus());
      setSleepScore(SleepTrackerEngine.getRecoveryScore());
    };

    window.addEventListener('aqliya:goals-updated', handleUpdate);
    window.addEventListener('aqliya:tasks-updated', handleUpdate);
    window.addEventListener('aqliya:focus-updated', handleUpdate);
    window.addEventListener('aqliya:full-restore-completed', handleUpdate);

    return () => {
      window.removeEventListener('aqliya:goals-updated', handleUpdate);
      window.removeEventListener('aqliya:tasks-updated', handleUpdate);
      window.removeEventListener('aqliya:focus-updated', handleUpdate);
      window.removeEventListener('aqliya:full-restore-completed', handleUpdate);
    };
  }, []);

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((s) => s - 1);
      }, 1000);
    } else if (timerSecondsLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      tacticalAudio.playSuccess();
      alert('اكتملت جلسة التركيز التكتيكية (25 دقيقة)! أحسنت يا قائد.');
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSecondsLeft]);

  // Derive "What should I do now?" (The single top uncompleted task)
  const activeFocusTask = tasks.find((t) => !t.isCompleted && t.quadrant === 'urgent_important') ||
                         tasks.find((t) => !t.isCompleted && t.quadrant === 'important') ||
                         tasks.find((t) => !t.isCompleted) ||
                         null;

  // Derive "What is most important today?" (Top 3 uncompleted tasks)
  const todayTopTasks = tasks.filter((t) => !t.isCompleted).slice(0, 3);

  const handleToggleTask = (id: string) => {
    tacticalAudio.playConfirm();
    UnifiedStorage.toggleTask(id);
  };

  const handleCreateQuickTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;

    UnifiedStorage.addTask({
      title: quickTaskTitle.trim(),
      quadrant: 'important',
      isCompleted: false,
      source: 'user',
    });

    setQuickTaskTitle('');
    setIsAddingTask(false);
    tacticalAudio.playBlip();
  };

  const handleSendToAdvisor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisorPrompt.trim()) return;
    const prompt = advisorPrompt.trim();
    setAdvisorPrompt('');
    onOpenAdvisor(prompt);
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-[#080c14] text-white text-right font-sans selection:bg-white/20 overflow-y-auto pb-28 px-3.5 sm:px-5 pt-3 space-y-4">
      
      {/* Top Header & Context Card */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          {/* Recovery Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[11px] text-zinc-300 font-mono">
            <Moon className="h-3 w-3 text-cyan-400" />
            <span>الاستشفاء {sleepScore}%</span>
          </div>

          {/* Period Focus Pill */}
          <div className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
            <Sparkles className="h-3 w-3" />
            <span>{periodFocus.periodTitle}</span>
          </div>
        </div>

        <div>
          <span className="text-[11px] text-zinc-400 font-mono block">{todayDateAr}</span>
          <h2 className="text-sm font-bold text-white">مرحباً يا قائد محمد 🫡</h2>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. ماذا يجب أن أفعل الآن؟ (What should I do right now?)         */}
      {/* ------------------------------------------------------------- */}
      <section className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500 text-[11px] font-mono">الأولوية الفورية الحاكمة</span>
          <h3 className="font-bold text-white flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-orange-400 animate-pulse" />
            <span>ماذا يجب أن أفعل الآن؟</span>
          </h3>
        </div>

        {activeFocusTask ? (
          <div className="p-4 rounded-2xl bg-gradient-to-l from-orange-500/10 via-white/[0.04] to-white/[0.02] border border-orange-500/30 shadow-xl space-y-3">
            <div className="flex items-start justify-between gap-3">
              <button
                onClick={() => handleToggleTask(activeFocusTask.id)}
                className="p-1 rounded-xl bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-all flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>إنجاز</span>
              </button>

              <div className="flex-1 text-right">
                <span className="text-sm font-bold text-white block leading-snug">
                  {activeFocusTask.title}
                </span>
                {activeFocusTask.dueTime && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-orange-300 font-mono mt-1">
                    <Clock className="h-3 w-3" />
                    <span>الموعد: {activeFocusTask.dueTime}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Timer & Deep Work Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs font-mono">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isTimerRunning
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  {isTimerRunning ? <RotateCcw className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                  <span>{isTimerRunning ? 'إيقاف مؤقت' : 'جلسة تركيز'}</span>
                </button>

                <span className="text-zinc-300 font-bold">{formatTimer(timerSecondsLeft)}</span>
              </div>

              <span className="text-[11px] text-zinc-400 font-sans">وضع العمل العميق (25 دقيقة)</span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center py-6 space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
            <h4 className="text-xs font-bold text-white">لا توجد مهام معلقة الآن! كل شيء تحت السيطرة.</h4>
            <p className="text-[11px] text-zinc-400">يمكنك الاستراحة أو إضافة هدف جديد للمرحلة القادمة.</p>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. ما الأهم اليوم؟ (What is most important today?)              */}
      {/* ------------------------------------------------------------- */}
      <section className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <button
            onClick={() => onNavigateTab('tasks')}
            className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center gap-0.5"
          >
            <span>عرض كل المهام</span>
            <ChevronLeft className="h-3 w-3" />
          </button>

          <h3 className="font-bold text-white flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-cyan-400" />
            <span>ما الأهم اليوم؟ (أهم 3 أولويات)</span>
          </h3>
        </div>

        <div className="space-y-2">
          {todayTopTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => handleToggleTask(task.id)}
              className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-99"
            >
              <div className="flex items-center gap-2">
                {task.dueTime && (
                  <span className="text-[10px] text-zinc-400 font-mono px-2 py-0.5 rounded-md bg-white/[0.05]">
                    {task.dueTime}
                  </span>
                )}
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                  task.quadrant === 'urgent_important'
                    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                    : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                }`}>
                  {task.quadrant === 'urgent_important' ? 'مهم وعاجل' : 'مهم'}
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-right flex-1 justify-end">
                <span className="text-xs text-zinc-200 font-medium">{task.title}</span>
                <button className="text-zinc-400 hover:text-white">
                  <Circle className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Quick Add Task */}
          {isAddingTask ? (
            <form onSubmit={handleCreateQuickTask} className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="px-3 rounded-xl bg-white/[0.05] text-zinc-400 text-xs"
              >
                إلغاء
              </button>
              <input
                type="text"
                autoFocus
                value={quickTaskTitle}
                onChange={(e) => setQuickTaskTitle(e.target.value)}
                placeholder="عنوان المهمة الجديدة..."
                className="flex-1 p-2 rounded-xl bg-white/[0.05] border border-white/15 text-xs text-white text-right focus:outline-none focus:border-white"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs"
              >
                إضافة
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingTask(true)}
              className="w-full py-2.5 rounded-xl border border-dashed border-white/15 hover:border-white/30 text-zinc-400 hover:text-white text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>إضافة مهمة سريعة لليوم</span>
            </button>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. ما الذي يحتاج انتباهي؟ (Vital Attention & Goals Radar)        */}
      {/* ------------------------------------------------------------- */}
      <section className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500 text-[11px] font-mono">مؤشرات الأهداف الحاكمة</span>
          <h3 className="font-bold text-white flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <span>ما الذي يحتاج انتباهي؟</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {goals.map((goal) => {
            const Icon = goal.category === 'business' ? Briefcase :
                         goal.category === 'fitness' ? Dumbbell :
                         goal.category === 'academic' ? GraduationCap : Sparkles;

            const iconColor = goal.category === 'business' ? 'text-amber-400' :
                              goal.category === 'fitness' ? 'text-emerald-400' :
                              goal.category === 'academic' ? 'text-cyan-400' : 'text-purple-400';

            return (
              <div
                key={goal.id}
                className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5 text-right hover:bg-white/[0.05] transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.05] px-2 py-0.5 rounded-full">
                    {goal.targetValue || `${goal.progressPercent}%`}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{goal.title}</span>
                    <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
                  </div>
                </div>

                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                  {goal.description}
                </p>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-l from-emerald-400 to-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(5, goal.progressPercent))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. شريط المستشار الذكي السريع الدائم (Omnipresent Jarvis Prompt) */}
      {/* ------------------------------------------------------------- */}
      <div className="pt-2">
        <form onSubmit={handleSendToAdvisor} className="p-2 rounded-2xl bg-white/[0.04] border border-white/15 shadow-xl flex items-center gap-2">
          <button
            type="submit"
            className="p-2 rounded-xl bg-white text-black hover:bg-zinc-200 transition-all active:scale-95 flex items-center justify-center flex-shrink-0"
            title="إرسال للمستشار"
          >
            <Send className="h-4 w-4" />
          </button>

          <input
            type="text"
            value={advisorPrompt}
            onChange={(e) => setAdvisorPrompt(e.target.value)}
            placeholder="اطلب أي شيء من المستشار... (سجل وزني، أنشئ مهمة، حدث هدف)"
            className="flex-1 bg-transparent text-xs text-white text-right focus:outline-none placeholder:text-zinc-500 pr-1"
          />

          <button
            type="button"
            onClick={() => onOpenAdvisor()}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-cyan-400 transition-all flex items-center justify-center flex-shrink-0"
            title="فتح المستشار الصوتي"
          >
            <Sparkles className="h-4 w-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
