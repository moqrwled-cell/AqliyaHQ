import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Flame, 
  Clock, 
  Trash2, 
  Briefcase, 
  Dumbbell, 
  GraduationCap, 
  Sparkles, 
  X, 
  Edit3, 
  SlidersHorizontal 
} from 'lucide-react';
import { UnifiedStorage, type TacticalTask, type SystemGoal } from '../../lib/storage/unifiedStorage';
import { tacticalAudio } from '../../lib/audio';

export const TasksAndGoalsScreen: React.FC = () => {
  const [tasks, setTasks] = useState<TacticalTask[]>(() => UnifiedStorage.getTasks());
  const [goals, setGoals] = useState<SystemGoal[]>(() => UnifiedStorage.getGoals());
  const [activeFilter, setActiveFilter] = useState<'all' | 'urgent_important' | 'important' | 'urgent' | 'someday'>('all');

  // New Task Modal
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskQuadrant, setTaskQuadrant] = useState<'urgent_important' | 'important' | 'urgent' | 'someday'>('important');
  const [taskTime, setTaskTime] = useState('');

  // New Goal Modal
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [goalCategory, setGoalCategory] = useState<'business' | 'fitness' | 'academic' | 'personal'>('business');
  const [goalTarget, setGoalTarget] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      setTasks(UnifiedStorage.getTasks());
      setGoals(UnifiedStorage.getGoals());
    };
    window.addEventListener('aqliya:tasks-updated', handleUpdate);
    window.addEventListener('aqliya:goals-updated', handleUpdate);
    return () => {
      window.removeEventListener('aqliya:tasks-updated', handleUpdate);
      window.removeEventListener('aqliya:goals-updated', handleUpdate);
    };
  }, []);

  const handleToggle = (id: string) => {
    tacticalAudio.playConfirm();
    UnifiedStorage.toggleTask(id);
  };

  const handleDeleteTask = (id: string) => {
    tacticalAudio.playAlert();
    UnifiedStorage.deleteTask(id);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    UnifiedStorage.addTask({
      title: taskTitle.trim(),
      quadrant: taskQuadrant,
      dueTime: taskTime.trim() || undefined,
      isCompleted: false,
      source: 'user',
    });

    setTaskTitle('');
    setTaskTime('');
    setShowAddTask(false);
    tacticalAudio.playSuccess();
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    UnifiedStorage.addGoal({
      title: goalTitle.trim(),
      description: goalDesc.trim(),
      category: goalCategory,
      targetValue: goalTarget.trim() || undefined,
      progressPercent: 10,
      priority: 'high',
      isCompleted: false,
    });

    setGoalTitle('');
    setGoalDesc('');
    setGoalTarget('');
    setShowAddGoal(false);
    tacticalAudio.playSuccess();
  };

  const handleDeleteGoal = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الهدف؟')) {
      UnifiedStorage.deleteGoal(id);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (activeFilter === 'all') return true;
    return t.quadrant === activeFilter;
  });

  return (
    <div className="flex flex-col h-full bg-[#080c14] text-white text-right font-sans selection:bg-white/20 overflow-y-auto pb-28 px-3.5 sm:px-5 pt-3 space-y-4">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <button
          onClick={() => setShowAddTask(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-black font-bold text-xs shadow-md active:scale-95 transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>مهمة جديدة</span>
        </button>

        <div>
          <h2 className="text-sm font-bold text-white">المهام والأهداف الحاكمة</h2>
          <span className="text-[11px] text-zinc-400 font-mono">مصفوفة أيزنهاور ومؤشرات التقدم</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        {[
          { id: 'all', label: 'الكل' },
          { id: 'urgent_important', label: '🔥 مهم وعاجل' },
          { id: 'important', label: '🗂️ مهم' },
          { id: 'urgent', label: '⚡ عاجل' },
          { id: 'someday', label: '≡ يوماً ما' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${
              activeFilter === tab.id
                ? 'bg-white text-black shadow-sm font-bold'
                : 'bg-white/[0.04] text-zinc-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-zinc-500 text-xs">
            لا توجد مهام في هذا القسم حالياً.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                task.isCompleted
                  ? 'bg-white/[0.01] border-white/5 opacity-60'
                  : 'bg-white/[0.03] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-white/[0.05] transition-all"
                  title="حذف المهمة"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                {task.dueTime && (
                  <span className="text-[10px] text-zinc-400 font-mono px-2 py-0.5 rounded-md bg-white/[0.05]">
                    {task.dueTime}
                  </span>
                )}
              </div>

              <div
                onClick={() => handleToggle(task.id)}
                className="flex items-center gap-2.5 text-right flex-1 justify-end cursor-pointer"
              >
                <span className={`text-xs ${task.isCompleted ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                  {task.title}
                </span>
                <button className="text-zinc-400">
                  {task.isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Strategic Goals Section */}
      <div className="pt-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowAddGoal(true)}
            className="text-xs text-amber-400 hover:underline flex items-center gap-1"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>إضافة هدف للمرحلة</span>
          </button>
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>الأهداف الاستراتيجية الحاكمة</span>
          </h3>
        </div>

        <div className="space-y-2">
          {goals.map((g) => (
            <div
              key={g.id}
              className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 text-right"
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleDeleteGoal(g.id)}
                  className="text-zinc-500 hover:text-red-400 p-1"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">{g.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.05] font-mono text-zinc-300">
                    {g.targetValue || `${g.progressPercent}%`}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">{g.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-[#0d1117] border border-white/10 p-5 space-y-3.5 text-right">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <button onClick={() => setShowAddTask(false)} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
              <h3 className="text-sm font-bold text-white">إضافة مهمة تكتيكية</h3>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">عنوان المهمة:</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="مثال: مراجعة العقد مع المحامي..."
                  className="w-full p-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white text-right focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">القسم المستهدف:</label>
                <select
                  value={taskQuadrant}
                  onChange={(e) => setTaskQuadrant(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white text-right"
                >
                  <option value="urgent_important">🔥 مهم وعاجل</option>
                  <option value="important">🗂️ مهم</option>
                  <option value="urgent">⚡ عاجل</option>
                  <option value="someday">≡ يوماً ما</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">الموعد (اختياري):</label>
                <input
                  type="text"
                  value={taskTime}
                  onChange={(e) => setTaskTime(e.target.value)}
                  placeholder="مثال: 18:00 أو غداً"
                  className="w-full p-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white text-right font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="flex-1 py-2 rounded-xl bg-white/[0.05] text-zinc-400 text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-white text-black font-bold text-xs"
                >
                  حفظ المهمة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-[#0d1117] border border-white/10 p-5 space-y-3.5 text-right">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <button onClick={() => setShowAddGoal(false)} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
              <h3 className="text-sm font-bold text-white">إضافة هدف مرحلي جديد</h3>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">اسم الهدف:</label>
                <input
                  type="text"
                  required
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="مثال: إغلاق أول 3 صفقات في NexusOS"
                  className="w-full p-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white text-right focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">الوصف أو التفاصيل:</label>
                <textarea
                  rows={2}
                  value={goalDesc}
                  onChange={(e) => setGoalDesc(e.target.value)}
                  placeholder="تفاصيل الهدف وخطة الوصول..."
                  className="w-full p-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white text-right focus:outline-none focus:border-white resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">المجال:</label>
                <select
                  value={goalCategory}
                  onChange={(e) => setGoalCategory(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white text-right"
                >
                  <option value="business">💼 أعمال وتجارة</option>
                  <option value="fitness">🏋️ لياقة وصحة</option>
                  <option value="academic">🎓 دراسة وأكاديمي</option>
                  <option value="personal">🧠 شخصي وفكري</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">المستهدف الرقمي (اختياري):</label>
                <input
                  type="text"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  placeholder="مثال: 3 صفقات أو 70 كجم"
                  className="w-full p-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white text-right font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddGoal(false)}
                  className="flex-1 py-2 rounded-xl bg-white/[0.05] text-zinc-400 text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-white text-black font-bold text-xs"
                >
                  حفظ الهدف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
