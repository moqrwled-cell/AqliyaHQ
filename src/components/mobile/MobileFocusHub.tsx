import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Briefcase, 
  GraduationCap, 
  Dumbbell, 
  Flame, 
  Send, 
  Copy, 
  Check, 
  Coffee, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Bell,
  BellRing,
  Calculator,
  Plus,
  PlusCircle,
  X,
  Zap,
  Edit3
} from 'lucide-react';
import { PersonalFocusEngine } from '../../lib/personal-focus/personalFocusEngine';
import type { DailyPersonalPlan } from '../../lib/personal-focus/types';
import { NotificationManager } from '../../lib/notifications/notificationManager';
import { SystemUpdaterEngine } from '../../lib/updater/systemUpdaterEngine';

export const MobileFocusHub: React.FC = () => {
  const [plan, setPlan] = useState<DailyPersonalPlan>(() => PersonalFocusEngine.getTodayPlan());
  const [copiedHook, setCopiedHook] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [showAlternativeMeal, setShowAlternativeMeal] = useState<Record<string, boolean>>({});
  const [activeSubTab, setActiveSubTab] = useState<'today' | 'nexus' | 'college' | 'body'>('today');

  // Modals state
  const [showCalorieCalc, setShowCalorieCalc] = useState(false);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);

  // Form states for manual additions
  const [customMealTitle, setCustomMealTitle] = useState('');
  const [customMealCalories, setCustomMealCalories] = useState('450');
  const [customMealIngredients, setCustomMealIngredients] = useState('');

  const [customTaskTitle, setCustomTaskTitle] = useState('');
  const [customTaskSubject, setCustomTaskSubject] = useState('إدارة أعمال تكنولوجيا');

  const [notifGranted, setNotifGranted] = useState(() => NotificationManager.isPermissionGranted());

  useEffect(() => {
    setPlan(PersonalFocusEngine.getTodayPlan());
    NotificationManager.startBackgroundRoutine();

    // Listen to real-time plan updates from Commander AI or other components
    const handlePlanUpdate = (e: any) => {
      if (e.detail) {
        setPlan({ ...e.detail });
      }
    };

    window.addEventListener('moha:plan-updated', handlePlanUpdate);
    return () => {
      window.removeEventListener('moha:plan-updated', handlePlanUpdate);
    };
  }, []);

  const handleToggleMeal = (id: string) => {
    const updated = PersonalFocusEngine.toggleMeal(id);
    setPlan({ ...updated });
  };

  const handleToggleWorkout = () => {
    const updated = PersonalFocusEngine.toggleWorkout();
    setPlan({ ...updated });
  };

  const handleToggleClassroom = (id: string) => {
    const updated = PersonalFocusEngine.toggleClassroomTask(id);
    setPlan({ ...updated });
  };

  const handleIncrementNexus = (count: number) => {
    const updated = PersonalFocusEngine.incrementNexusSent(count);
    setPlan({ ...updated });
  };

  const handleToggleEnglish = () => {
    const updated = PersonalFocusEngine.toggleEnglishPractice();
    setPlan({ ...updated });
  };

  const handleCopyHook = () => {
    navigator.clipboard.writeText(plan.nexusTargets.recommendedHook);
    setCopiedHook(true);
    setTimeout(() => setCopiedHook(false), 2000);
  };

  const handleCopyTelegramReport = () => {
    const sitrep = PersonalFocusEngine.generateTelegramSITREP(plan);
    navigator.clipboard.writeText(sitrep.telegramReportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const handleBackupRomaCafe = () => {
    const res = PersonalFocusEngine.backupRomaCafeData();
    setPlan(PersonalFocusEngine.getTodayPlan());
    setBackupStatus(`تم حفظ نسخة احتياطية محلية مؤمنة الساعة ${res.timestamp}`);
    setTimeout(() => setBackupStatus(null), 4000);
  };

  // Notification Permission Activator
  const handleRequestNotifications = async () => {
    const res = await NotificationManager.requestPermission();
    setNotifGranted(res.granted);
    if (res.granted) {
      alert('تم تفعيل إشعارات الهاتف بنجاح! ستصلك تنبيهات الوجبات والتمارين والمهام بانتظام 🫡');
    } else {
      alert('يرجى السماح بالإشعارات من إعدادات المتصفح أو التطبيق.');
    }
  };

  // Add Custom Meal
  const handleAddCustomMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMealTitle.trim()) return;
    const updated = PersonalFocusEngine.addMeal({
      title: customMealTitle.trim(),
      calories: Number(customMealCalories) || 400,
      ingredients: customMealIngredients.trim() || 'وجبة مخصصة بالمنزل',
    });
    setPlan({ ...updated });
    setCustomMealTitle('');
    setCustomMealIngredients('');
    setShowAddMealModal(false);
  };

  // Add Classroom Task
  const handleAddClassroomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTaskTitle.trim()) return;
    const updated = PersonalFocusEngine.addClassroomTask({
      subject: customTaskSubject.trim(),
      taskTitle: customTaskTitle.trim(),
      type: 'assignment',
    });
    setPlan({ ...updated });
    setCustomTaskTitle('');
    setShowAddTaskModal(false);
  };

  // Apply 3000 Calorie Plan
  const handleApplyCaloriePlan = (cals: number) => {
    const updated = PersonalFocusEngine.updateCalories(cals, 70);
    setPlan({ ...updated });
    setShowCalorieCalc(false);
    alert(`تم تعديل هدف السعرات اليومية في خطتك إلى ${cals} سعرة! 💪`);
  };

  // Check & Apply Live OTA Update
  const handleCheckUpdate = async () => {
    setUpdateStatus('جارٍ فحص التحديثات من المستودع...');
    const res = await SystemUpdaterEngine.checkLatestUpdate();
    if (res.error) {
      setUpdateStatus(`تعذر فحص التحديثات: ${res.error}`);
    } else if (res.latestCommit) {
      setUpdateStatus(`أحدث نسخة: [${res.latestCommit.sha}] ${res.latestCommit.message}`);
    }
  };

  const handleApplyUpdateReload = () => {
    SystemUpdaterEngine.applyLiveReload();
  };

  const calorieData = PersonalFocusEngine.calculateCalorieSurplus(182, 54, 70, 21);

  return (
    <div className="flex flex-col h-full bg-[#060913] text-right font-sans select-none overflow-y-auto pb-24 px-3 sm:px-4 pt-3">
      
      {/* 1. Header: Brand Avatar & Quick Actions */}
      <div className="p-4 rounded-3xl apple-glass border border-white/10 mb-3 shadow-lg">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          
          {/* Avatar & Title */}
          <div className="flex items-center gap-2.5">
            <div className="relative h-11 w-11 rounded-2xl overflow-hidden border border-emerald-400/40 shadow-md shadow-emerald-950/60 bg-zinc-900 flex-shrink-0">
              <img src="/logo.png" alt="Moha Agent" className="w-full h-full object-cover" />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-extrabold text-white">Moha Agent</h2>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 font-mono">v1.2</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">مرحباً يا بطل 🫡 • محمد قرمان</p>
            </div>
          </div>

          {/* Quick Buttons: Telegram + Notification */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyTelegramReport}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold active:scale-95 transition-all"
              title="نسخ تقرير اليوم للتيليجرام"
            >
              {copiedReport ? <Check className="h-3 w-3 text-emerald-400" /> : <Send className="h-3 w-3" />}
              <span>{copiedReport ? 'تم النسخ!' : 'تقرير'}</span>
            </button>

            <button
              onClick={handleRequestNotifications}
              className={`p-2 rounded-xl border transition-all active:scale-95 ${
                notifGranted
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
              }`}
              title={notifGranted ? 'الإشعارات مفعلة' : 'اضغط لتفعيل إشعارات الهاتف'}
            >
              {notifGranted ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            </button>

            <button
              onClick={() => {
                setShowUpdateModal(true);
                handleCheckUpdate();
              }}
              className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-cyan-400 hover:text-white transition-all active:scale-95"
              title="تحديث المنظومة وتطبيق التعديلات فورياً"
            >
              <Zap className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Work Shift Badge & Quick Summary */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-white/[0.04] border border-white/5 text-[11px] text-zinc-300">
            <Clock className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-medium">{plan.shiftBadge}</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-400">
            <span className="text-amber-400 font-mono font-bold">{plan.nutritionAndWorkout.targetCalories} kcal</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">هدف 70kg</span>
          </div>
        </div>
      </div>

      {/* 2. Top Segmented Pills (Only 4 Pillars) */}
      <div className="flex items-center justify-between gap-1.5 mb-3 bg-white/[0.03] p-1 rounded-2xl border border-white/5">
        <button
          onClick={() => setActiveSubTab('today')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
            activeSubTab === 'today'
              ? 'bg-emerald-500 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          خطة اليوم
        </button>

        <button
          onClick={() => setActiveSubTab('nexus')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
            activeSubTab === 'nexus'
              ? 'bg-emerald-500 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          نيكسيس 💼
        </button>

        <button
          onClick={() => setActiveSubTab('college')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
            activeSubTab === 'college'
              ? 'bg-emerald-500 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          الكلية 🎓
        </button>

        <button
          onClick={() => setActiveSubTab('body')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
            activeSubTab === 'body'
              ? 'bg-emerald-500 text-zinc-950 shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          الجسم 70kg 🥣
        </button>
      </div>

      {/* 3. SUBTAB: TODAY (MAIN CLEAN BATTLE PLAN) */}
      {activeSubTab === 'today' && (
        <div className="space-y-3">
          
          {/* Card A: College & Classroom Tasks */}
          <div className="p-4 rounded-3xl apple-glass border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
              <button
                onClick={() => setShowAddTaskModal(true)}
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-bold"
              >
                <Plus className="h-3 w-3" />
                <span>إضافة مهمة</span>
              </button>
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <GraduationCap className="h-4 w-4 text-emerald-400" />
                <span>الكلية والكلاس روم</span>
              </div>
            </div>

            <div className="space-y-2">
              {plan.classroomTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleClassroom(task.id)}
                  className={`flex items-start justify-between gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                    task.completed
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                      : 'bg-white/[0.02] border-white/5 text-zinc-200 hover:bg-white/[0.05]'
                  }`}
                >
                  <p className={`text-xs font-medium leading-relaxed ${task.completed ? 'line-through opacity-70' : ''}`}>
                    {task.taskTitle}
                  </p>
                  <button className="mt-0.5 flex-shrink-0">
                    {task.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Circle className="h-4 w-4 text-zinc-500" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card B: Nexus Legal Cold Email Targets */}
          <div className="p-4 rounded-3xl apple-glass border border-white/10 space-y-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                {plan.nexusTargets.sentCount}/{plan.nexusTargets.dailyEmailTarget} إيميل
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Briefcase className="h-4 w-4 text-blue-400" />
                <span>مشروع نيكسيس للمحامين</span>
              </div>
            </div>

            <p className="text-xs text-zinc-300">
              الهدف اليومي: إرسال 20 إيميل للمكاتب الأمريكية لعرض التجربة المجانية 14 يوماً.
            </p>

            <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <button
                  onClick={handleCopyHook}
                  className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  {copiedHook ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedHook ? 'تم النسخ' : 'نسخ الإنجليزية'}</span>
                </button>
                <span className="text-zinc-400 font-medium">خطاف الرسالة القانونية (ABA 512):</span>
              </div>
              <p className="text-[11px] text-zinc-300 font-mono text-left dir-ltr leading-relaxed bg-black/30 p-2 rounded-xl select-all">
                {plan.nexusTargets.recommendedHook}
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                onClick={() => handleIncrementNexus(5)}
                className="flex-1 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-white active:scale-95 transition-all text-center"
              >
                +5 إيميلات أُرسلت
              </button>
              <button
                onClick={() => handleIncrementNexus(1)}
                className="flex-1 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-bold text-emerald-300 active:scale-95 transition-all text-center"
              >
                +1 إيميل فردي
              </button>
            </div>
          </div>

          {/* Card C: Nutrition & Dense Calorie Meals (54kg -> 70kg) */}
          <div className="p-4 rounded-3xl apple-glass border border-white/10 space-y-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCalorieCalc(true)}
                  className="text-[10px] px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono flex items-center gap-1"
                  title="حاسبة السعرات"
                >
                  <Calculator className="h-3 w-3" />
                  <span>{plan.nutritionAndWorkout.targetCalories} kcal</span>
                </button>
                <button
                  onClick={() => setShowAddMealModal(true)}
                  className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                >
                  <Plus className="h-3 w-3" />
                  <span>وجبة</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Flame className="h-4 w-4 text-amber-400" />
                <span>وجبات السعرات الكثيفة (بدون خلاط)</span>
              </div>
            </div>

            <div className="space-y-2">
              {plan.nutritionAndWorkout.meals.map((meal) => {
                const showAlt = showAlternativeMeal[meal.id] || false;
                return (
                  <div
                    key={meal.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      meal.completed
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100'
                        : 'bg-white/[0.02] border-white/5 text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleMeal(meal.id)}
                          className="flex-shrink-0"
                        >
                          {meal.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <Circle className="h-4 w-4 text-zinc-500" />
                          )}
                        </button>
                        <span className="text-xs font-bold">{meal.title}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono">
                        +{meal.calories} سعرة
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-300 pr-6 leading-relaxed">
                      {showAlt ? meal.alternativeMeal : meal.ingredients}
                    </p>

                    <button
                      onClick={() =>
                        setShowAlternativeMeal((prev) => ({ ...prev, [meal.id]: !prev[meal.id] }))
                      }
                      className="mt-1.5 text-[10px] text-zinc-400 hover:text-white pr-6 underline flex items-center gap-1"
                    >
                      <span>{showAlt ? 'عرض الوجبة الأساسية' : 'غير متوفر؟ عرض الوجبة البديلة'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card D: Today's Home Workout & Mobility */}
          <div className="p-4 rounded-3xl apple-glass border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
              <span className="text-[11px] text-zinc-400">40 دقيقة + 10 دقائق مرونة</span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Dumbbell className="h-4 w-4 text-emerald-400" />
                <span>تمرين اليوم المنزلي (Calisthenics)</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{plan.nutritionAndWorkout.workoutTitle}</span>
                <span className="text-[10px] text-emerald-400 font-mono">علمي لزيادة الكتلة</span>
              </div>

              <div className="space-y-1.5 pr-2 border-r-2 border-emerald-500/40">
                {plan.nutritionAndWorkout.workoutExercises.map((ex, idx) => (
                  <p key={idx} className="text-[11px] text-zinc-300">
                    • {ex}
                  </p>
                ))}
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-amber-300 font-medium">10 دقائق استطالة مفاصل ومرونة</span>
                <button
                  onClick={handleToggleWorkout}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    plan.nutritionAndWorkout.workoutCompleted
                      ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                      : 'bg-white/[0.04] text-zinc-300 border-white/10'
                  }`}
                >
                  {plan.nutritionAndWorkout.workoutCompleted ? 'تم إنجاز التمرين 💪' : 'تحديد كمنجز'}
                </button>
              </div>
            </div>
          </div>

          {/* Card E: Roma Cafe Persistent Backup */}
          <div className="p-4 rounded-3xl apple-glass border border-white/10 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Coffee className="h-4 w-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white">كافيه روما (حماية الديون)</h4>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {backupStatus || (plan.romaCafeBackupDone ? 'تم أخذ نسخة احتياطية محلية مؤمنة للأبد' : 'احفظ نسخة محلية لتجنب فقدان البيانات أوفلاين')}
              </p>
            </div>

            <button
              onClick={handleBackupRomaCafe}
              className="px-3.5 py-2 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-emerald-400 active:scale-95 transition-all flex items-center gap-1.5 flex-shrink-0"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>نسخ احتياطي</span>
            </button>
          </div>

          {/* Card F: English & Coursera (15 min habit) */}
          <div className="p-4 rounded-3xl apple-glass border border-white/10 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-400" />
                <h4 className="text-xs font-bold text-white">15 دقيقة إنجليزية + كورسيرا</h4>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {plan.selfGrowth.courseraModuleTitle}
              </p>
            </div>

            <button
              onClick={handleToggleEnglish}
              className={`p-2 rounded-2xl border text-xs font-bold transition-all ${
                plan.selfGrowth.englishCompleted
                  ? 'bg-emerald-500 text-zinc-950 border-emerald-400'
                  : 'bg-white/[0.04] text-zinc-300 border-white/10'
              }`}
            >
              {plan.selfGrowth.englishCompleted ? <Check className="h-4 w-4" /> : 'إنجاز'}
            </button>
          </div>

        </div>
      )}

      {/* 4. SUBTAB: NEXUS SALES HUB */}
      {activeSubTab === 'nexus' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="p-4 rounded-3xl apple-glass border border-white/10 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-400" />
              <span>استراتيجية مبيعات نيكسيس للمحامين الأمريكيين</span>
            </h3>

            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 space-y-1">
              <p className="font-bold">القاعدة الذهبية لتحقيق أول بيعة:</p>
              <p className="text-[11px] leading-relaxed">
                لا تطلب من المحامي $199 مباشرة من أول رسالة! اعرض عليه تجربة مجانية 14 يوماً بدون بطاقة بنكية، توضح كيف تعمل الأداة على الرام دون إنترنت لمنع تسريب أسرار الموكلين (ABA 512).
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 block">صيغة الإيميل البارد المعتمدة:</label>
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 font-mono text-[11px] text-zinc-300 text-left dir-ltr select-all space-y-2">
                <p><strong>Subject:</strong> Privileged document analysis without cloud data leakage</p>
                <p>Hi [Attorney Name],</p>
                <p>Under ABA Formal Opinion 512, sending privileged client files to public AI servers poses serious confidentiality risks.</p>
                <p>We built <strong>Nexus Legal AI</strong> to run 100% in RAM locally on your laptop—zero internet connection required, zero data stored.</p>
                <p>Would you be open to a 14-day zero-risk trial on your local PC to see how it audits case files securely?</p>
                <p>Best regards,<br/>Mohammad Qrman — Lead Systems Architect</p>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(`Subject: Privileged document analysis without cloud data leakage\n\nHi [Attorney Name],\n\nUnder ABA Formal Opinion 512, sending privileged client files to public AI servers poses serious confidentiality risks.\n\nWe built Nexus Legal AI to run 100% in RAM locally on your laptop—zero internet connection required, zero data stored.\n\nWould you be open to a 14-day zero-risk trial on your local PC to see how it audits case files securely?\n\nBest regards,\nMohammad Qrman — Lead Systems Architect`);
                  alert('تم نسخ نص الإيميل بالكامل للحافظة!');
                }}
                className="w-full py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>نسخ نص الإيميل الأمريكي بالكامل</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. SUBTAB: COLLEGE & CLASSROOM */}
      {activeSubTab === 'college' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="p-4 rounded-3xl apple-glass border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowAddTaskModal(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>إضافة تكليف / محاضرة</span>
              </button>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-emerald-400" />
                <span>الكلية التطبيقية • كلاس روم</span>
              </h3>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              تخصص إدارة أعمال تكنولوجيا: مسح ومتابعة كافة المحاضرات والتكليفات واللقاءات الوجاهية.
            </p>

            <div className="space-y-2">
              {plan.classroomTasks.map((t) => (
                <div key={t.id} className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">{t.taskTitle}</p>
                    <span className="text-[10px] text-zinc-400">{t.subject}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-mono">
                    {t.completed ? 'منجز' : 'نشط'}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">مسار الشهادات في Coursera:</span>
                <span className="text-[10px] text-emerald-400 font-mono">CV Builder</span>
              </div>
              <p className="text-xs text-emerald-300 font-medium">
                {plan.selfGrowth.courseraModuleTitle}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6. SUBTAB: BODY TRANSFORMATION (54 -> 70 KG) */}
      {activeSubTab === 'body' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="p-4 rounded-3xl apple-glass border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowCalorieCalc(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5"
              >
                <Calculator className="h-3.5 w-3.5" />
                <span>حاسبة السعرات</span>
              </button>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-400" />
                <span>خطة زيادة الوزن (من 54 إلى 70 كجم)</span>
              </h3>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-400">الوزن الحالي: 54 كجم</span>
                <span className="text-zinc-400">الهدف: 70 كجم</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full w-[35%]" />
              </div>
              <p className="text-[11px] text-zinc-400">
                الهدف اليومي: <strong>{plan.nutritionAndWorkout.targetCalories} سعرة</strong> و <strong>115 غرام بروتين</strong> لبناء كتلة ومرونة.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowAddMealModal(true)}
                  className="text-xs text-emerald-400 font-bold hover:underline flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>إضافة وجبة</span>
                </button>
                <h4 className="text-xs font-bold text-white">قائمة الوجبات النشطة اليوم:</h4>
              </div>

              <div className="space-y-1.5 text-xs text-zinc-300">
                {plan.nutritionAndWorkout.meals.map((m) => (
                  <div key={m.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{m.title}</p>
                      <p className="text-[10px] text-zinc-400">{m.ingredients}</p>
                    </div>
                    <span className="font-mono text-amber-400 text-xs">+{m.calories} سعرة</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Calorie & Macronutrient Calculator */}
      {showCalorieCalc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
          <div className="apple-glass-elevated w-full max-w-sm rounded-3xl p-5 border border-white/10 shadow-2xl space-y-3 text-right">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Calculator className="h-4 w-4 text-amber-400" />
                <span>حاسبة الاحتياج العلمي الدقيق</span>
              </h3>
              <button onClick={() => setShowCalorieCalc(false)} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-400">معدل الحرق الأساسي (BMR):</span>
                  <span className="font-mono text-white font-bold">{calorieData.bmr} سعرة</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">سعرات الثبات مع النشاط:</span>
                  <span className="font-mono text-white font-bold">{calorieData.maintenance} سعرة</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-white/5 text-emerald-400 font-bold">
                  <span>الهدف لزيادة الوزن (+700 سعرة):</span>
                  <span className="font-mono text-amber-400 font-bold">{calorieData.targetSurplusCalories} سعرة</span>
                </div>
                <div className="flex justify-between text-blue-300">
                  <span>البروتين اليومي المطلوب:</span>
                  <span className="font-mono font-bold">{calorieData.dailyProteinGrams} غرام</span>
                </div>
              </div>

              <p className="text-[11px] text-zinc-300 leading-relaxed bg-black/30 p-2.5 rounded-xl border border-white/5">
                {calorieData.explanationArabic}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleApplyCaloriePlan(3000)}
                className="flex-1 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs active:scale-95 transition-all text-center"
              >
                تطبيق هدف 3000 سعرة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Custom Meal */}
      {showAddMealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
          <form onSubmit={handleAddCustomMeal} className="apple-glass-elevated w-full max-w-sm rounded-3xl p-5 border border-white/10 shadow-2xl space-y-3 text-right">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h3 className="text-sm font-bold text-white">إضافة وجبة طاقة مخصصة</h3>
              <button type="button" onClick={() => setShowAddMealModal(false)} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">اسم الوجبة:</label>
              <input
                type="text"
                required
                value={customMealTitle}
                onChange={(e) => setCustomMealTitle(e.target.value)}
                placeholder="مثال: طبق شوفان بالعسل والمكسرات"
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">السعرات التقديرية:</label>
              <input
                type="number"
                required
                value={customMealCalories}
                onChange={(e) => setCustomMealCalories(e.target.value)}
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">المكونات المتوفرة:</label>
              <input
                type="text"
                value={customMealIngredients}
                onChange={(e) => setCustomMealIngredients(e.target.value)}
                placeholder="حليب، تمر، طحينة، خبز..."
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddMealModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs"
              >
                إضافة الوجبة
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: Add Classroom Task */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
          <form onSubmit={handleAddClassroomTask} className="apple-glass-elevated w-full max-w-sm rounded-3xl p-5 border border-white/10 shadow-2xl space-y-3 text-right">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h3 className="text-sm font-bold text-white">إضافة تكليف كلاس روم</h3>
              <button type="button" onClick={() => setShowAddTaskModal(false)} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">المادة:</label>
              <input
                type="text"
                value={customTaskSubject}
                onChange={(e) => setCustomTaskSubject(e.target.value)}
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">عنوان المهمة أو التكليف:</label>
              <input
                type="text"
                required
                value={customTaskTitle}
                onChange={(e) => setCustomTaskTitle(e.target.value)}
                placeholder="تسليم دراسة حالة / حل كويز..."
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddTaskModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs"
              >
                إضافة المهمة
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: Rapid OTA / Live Update Checker */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
          <div className="apple-glass-elevated w-full max-w-sm rounded-3xl p-5 border border-white/10 shadow-2xl space-y-3 text-right">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-cyan-400" />
                <span>مركز التحديث الفوري (Moha Agent OTA)</span>
              </h3>
              <button onClick={() => setShowUpdateModal(false)} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-zinc-300">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-400">الإصدار الحالي:</span>
                  <span className="font-mono text-emerald-400 font-bold">{SystemUpdaterEngine.CURRENT_VERSION}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">حالة الربط:</span>
                  <span className="text-white">GitHub Main Auto-Sync</span>
                </div>
              </div>

              {updateStatus && (
                <p className="text-[11px] p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-200">
                  {updateStatus}
                </p>
              )}

              <p className="text-[11px] text-zinc-400 leading-relaxed">
                بدلاً من تحميل وفك الضغط ونقل الملفات يدوياً، يمكنك الضغط على زر <strong>تطبيق وتحديث الكاش الفوري</strong> لتحديث واجهة هاتفك بأحدث كود مباشرة!
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCheckUpdate}
                className="flex-1 py-2 rounded-xl bg-white/[0.04] text-white text-xs font-bold border border-white/10"
              >
                فحص التحديثات
              </button>
              <button
                onClick={handleApplyUpdateReload}
                className="flex-1 py-2 rounded-xl bg-cyan-500 text-zinc-950 text-xs font-bold shadow-md"
              >
                تطبيق التحديث فوراً ⚡
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
