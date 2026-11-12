import React, { useState, useEffect, useMemo } from 'react';
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
  RefreshCw,
  Bell,
  BellRing,
  Calculator,
  Plus,
  X,
  Zap,
  AlarmClock,
  Menu,
  ChevronLeft
} from 'lucide-react';
import { Glass } from 'glisse';
import { PersonalFocusEngine } from '../../lib/personal-focus/personalFocusEngine';
import type { DailyPersonalPlan } from '../../lib/personal-focus/types';
import { NotificationManager } from '../../lib/notifications/notificationManager';
import { SystemUpdaterEngine } from '../../lib/updater/systemUpdaterEngine';
import { AlarmManagerModal } from './AlarmManagerModal';
import { ClassroomBridgeModal } from './ClassroomBridgeModal';
import { AlarmRingingOverlay } from './AlarmRingingOverlay';

interface MobileFocusHubProps {
  onOpenSideDrawer?: () => void;
}

export const MobileFocusHub: React.FC<MobileFocusHubProps> = ({ onOpenSideDrawer }) => {
  const [plan, setPlan] = useState<DailyPersonalPlan>(() => PersonalFocusEngine.getTodayPlan());
  const [copiedHook, setCopiedHook] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [showAlternativeMeal, setShowAlternativeMeal] = useState<Record<string, boolean>>({});
  const [activeSubTab, setActiveSubTab] = useState<'today' | 'nexus' | 'college' | 'body'>('today');

  // Real-time clock state
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeFormatted = useMemo(() => {
    const hours = currentTime.getHours();
    const minutes = String(currentTime.getMinutes()).padStart(2, '0');
    const seconds = String(currentTime.getSeconds()).padStart(2, '0');
    const period = hours >= 12 ? 'م' : 'ص';
    const displayHours = String(hours % 12 || 12).padStart(2, '0');
    return {
      hours: displayHours,
      minutes,
      seconds,
      period,
      fullTime: `${displayHours}:${minutes}:${seconds} ${period}`,
    };
  }, [currentTime]);

  const dateFormatted = useMemo(() => {
    try {
      return currentTime.toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return currentTime.toLocaleDateString('en-US');
    }
  }, [currentTime]);

  // Dynamic Motivational Greeting based on hour of day
  const dynamicGreeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour >= 4 && hour < 9) {
      return {
        title: 'بكور الفجر يصنع القادة',
        quote: 'همّة الصباح الباكر تبني صرح نيكسيس وتصنع فارق الأساطير يا محمد.',
        tag: 'انطلاقة الفجر',
      };
    } else if (hour >= 9 && hour < 14) {
      return {
        title: 'ذروة التركيز والإنتاج',
        quote: 'لا تشتت نفسك؛ 20 إيميل لنائب ومحامٍ تصنع أول صفقة بـ $199.',
        tag: 'تركيز استراتيجي',
      };
    } else if (hour >= 14 && hour < 18) {
      return {
        title: 'ثبات الوتيرة والالتزام',
        quote: 'حافظ على طاقتك، لا تدع السعرات 3000kcal وتكليفات الكلية تفوتك اليوم.',
        tag: 'انضباط صارم',
      };
    } else if (hour >= 18 && hour < 23) {
      return {
        title: 'حصاد الإنجاز والهمّة',
        quote: 'اليوم الذي ينقضي لا يعود؛ استعرض تقدمك واختم يومك بانتصار حقيقي.',
        tag: 'حصاد اليوم',
      };
    } else {
      return {
        title: 'هدوء التخطيط وصناعة الغد',
        quote: 'راحة المحارب استعداداً لغد عظيم؛ استثمر السكون بمراجعة بوصلتك.',
        tag: 'إعداد المستشار',
      };
    }
  }, [currentTime]);

  // Modals state
  const [showCalorieCalc, setShowCalorieCalc] = useState(false);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAlarmModal, setShowAlarmModal] = useState(false);
  const [showClassroomModal, setShowClassroomModal] = useState(false);
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

  const triggerDrawer = () => {
    if (onOpenSideDrawer) {
      onOpenSideDrawer();
    } else {
      window.dispatchEvent(new CustomEvent('moha:open-side-drawer'));
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-right font-sans select-none overflow-y-auto pb-44 px-3 sm:px-4 pt-3 space-y-3.5 overscroll-contain touch-pan-y">
      
      {/* 1. Header: Luxury Digital Clock, Dynamic Greeting & Side Drawer Trigger */}
      <Glass className="p-4 sm:p-5 rounded-3xl apple-glass border border-white/10 shadow-2xl space-y-3.5">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          
          {/* Quick Action Icons in Monochrome Lux */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyTelegramReport}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/[0.05] border border-white/10 text-white text-[11px] font-semibold active:scale-95 transition-all hover:bg-white/10"
              title="نسخ تقرير اليوم للتيليجرام"
            >
              {copiedReport ? <Check className="h-3 w-3 text-white" /> : <Send className="h-3 w-3" />}
              <span>{copiedReport ? 'تم النسخ' : 'تقرير'}</span>
            </button>

            <button
              onClick={handleRequestNotifications}
              className={`p-2 rounded-xl border transition-all active:scale-95 ${
                notifGranted
                  ? 'bg-white/10 text-white border-white/20'
                  : 'bg-white/[0.04] text-zinc-400 border-white/10 animate-pulse'
              }`}
              title={notifGranted ? 'الإشعارات مفعلة' : 'اضغط لتفعيل إشعارات الهاتف'}
            >
              {notifGranted ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            </button>

            <button
              onClick={() => setShowAlarmModal(true)}
              className="p-2 rounded-xl bg-white/[0.05] border border-white/10 text-white hover:bg-white/10 transition-all active:scale-95"
              title="منبه Moha الذكي"
            >
              <AlarmClock className="h-4 w-4" />
            </button>

            <button
              onClick={() => {
                setShowUpdateModal(true);
                handleCheckUpdate();
              }}
              className="p-2 rounded-xl bg-white/[0.05] border border-white/10 text-white hover:bg-white/10 transition-all active:scale-95"
              title="تحديث المنظومة الفوري"
            >
              <Zap className="h-4 w-4" />
            </button>
          </div>

          {/* Menu Drawer Button with Written Text */}
          <button
            onClick={triggerDrawer}
            className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white text-black font-bold text-xs shadow-lg active:scale-95 transition-all hover:bg-zinc-200"
            aria-label="فتح القائمة الجانبية"
          >
            <span>القائمة</span>
            <Menu className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Digital Clock & Dynamic Motivational Message */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
          
          {/* Clock Display */}
          <div className="flex flex-col items-start bg-white/[0.03] border border-white/5 p-3 rounded-2xl min-w-[150px] w-full sm:w-auto">
            <div className="flex items-baseline gap-1 text-white font-mono">
              <span className="text-3xl font-black tracking-tight">{timeFormatted.hours}:{timeFormatted.minutes}</span>
              <span className="text-xs text-zinc-400 font-mono">:{timeFormatted.seconds}</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-white/10 text-white font-bold ml-1">{timeFormatted.period}</span>
            </div>
            <span className="text-[10px] text-zinc-400 mt-1 font-medium">{dateFormatted}</span>
          </div>

          {/* Dynamic Motivational Message */}
          <div className="flex-1 text-right w-full sm:w-auto">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-bold text-white mb-1">
              <Sparkles className="h-3 w-3" />
              <span>{dynamicGreeting.tag}</span>
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">{dynamicGreeting.title}</h3>
            <p className="text-[11px] text-zinc-300 leading-relaxed mt-0.5">{dynamicGreeting.quote}</p>
          </div>

        </div>

        {/* Sub-Banner: Shift Badge & Targets */}
        <div className="flex items-center justify-between pt-2.5 border-t border-white/5 text-[11px]">
          <div className="inline-flex items-center gap-1.5 text-zinc-400">
            <Clock className="h-3.5 w-3.5 text-white" />
            <span>{plan.shiftBadge}</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span className="text-white font-bold">{plan.nutritionAndWorkout.targetCalories} kcal</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-300 font-bold">هدف 70kg</span>
          </div>
        </div>
      </Glass>

      {/* 2. Top Segmented Pills (Monochrome Lux Glass) */}
      <div className="flex items-center justify-between gap-1.5 bg-white/[0.03] p-1 rounded-2xl border border-white/5">
        <button
          onClick={() => setActiveSubTab('today')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
            activeSubTab === 'today'
              ? 'bg-white text-black shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          خطة اليوم
        </button>

        <button
          onClick={() => setActiveSubTab('nexus')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
            activeSubTab === 'nexus'
              ? 'bg-white text-black shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          نيكسيس 💼
        </button>

        <button
          onClick={() => setActiveSubTab('college')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
            activeSubTab === 'college'
              ? 'bg-white text-black shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          الكلية 🎓
        </button>

        <button
          onClick={() => setActiveSubTab('body')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all text-center ${
            activeSubTab === 'body'
              ? 'bg-white text-black shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          الجسم 70kg 🥣
        </button>
      </div>

      {/* 3. SUBTAB: TODAY (MAIN CLEAN BATTLE PLAN) */}
      {activeSubTab === 'today' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          
          {/* Card A: College & Classroom Tasks */}
          <div className="p-4 rounded-3xl apple-glass border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowClassroomModal(true)}
                  className="px-2 py-1 rounded-xl bg-white/10 border border-white/20 text-white flex items-center gap-1 text-[10px] font-bold active:scale-95 transition-all"
                  title="ربط واستيراد إعلانات كلاس روم"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>جسر كلاس روم</span>
                </button>
                <button
                  onClick={() => setShowAddTaskModal(true)}
                  className="text-[11px] text-zinc-300 hover:text-white hover:underline flex items-center gap-1 font-bold"
                >
                  <Plus className="h-3 w-3" />
                  <span>إضافة مهمة</span>
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <GraduationCap className="h-4 w-4 text-white" />
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
                      ? 'bg-white/10 border-white/20 text-zinc-300'
                      : 'bg-white/[0.02] border-white/5 text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <p className={`text-xs font-medium leading-relaxed ${task.completed ? 'line-through opacity-60' : ''}`}>
                    {task.taskTitle}
                  </p>
                  <button className="mt-0.5 flex-shrink-0">
                    {task.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    ) : (
                      <Circle className="h-4 w-4 text-zinc-600" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card B: Nexus Legal Cold Email Targets */}
          <div className="p-4 rounded-3xl apple-glass border border-white/10 space-y-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
              <span className="text-[11px] font-mono text-white font-bold bg-white/10 px-2 py-0.5 rounded-full border border-white/15">
                {plan.nexusTargets.sentCount}/{plan.nexusTargets.dailyEmailTarget} إيميل
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Briefcase className="h-4 w-4 text-white" />
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
                  className="flex items-center gap-1 text-white hover:text-zinc-300 font-semibold"
                >
                  {copiedHook ? <Check className="h-3 w-3 text-white" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedHook ? 'تم النسخ' : 'نسخ الإنجليزية'}</span>
                </button>
                <span className="text-zinc-400 font-medium">خطاف الرسالة القانونية (ABA 512):</span>
              </div>
              <p className="text-[11px] text-zinc-300 font-mono text-left dir-ltr leading-relaxed bg-black/40 p-2 rounded-xl select-all border border-white/5">
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
                className="flex-1 py-2 rounded-xl bg-white text-black hover:bg-zinc-200 border border-white text-xs font-bold active:scale-95 transition-all text-center shadow-md"
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
                  className="text-[10px] px-2 py-0.5 rounded-lg bg-white/10 border border-white/20 text-white font-mono flex items-center gap-1"
                  title="حاسبة السعرات"
                >
                  <Calculator className="h-3 w-3" />
                  <span>{plan.nutritionAndWorkout.targetCalories} kcal</span>
                </button>
                <button
                  onClick={() => setShowAddMealModal(true)}
                  className="text-[11px] text-zinc-300 hover:text-white hover:underline flex items-center gap-1 font-bold"
                >
                  <Plus className="h-3 w-3" />
                  <span>وجبة</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Flame className="h-4 w-4 text-white" />
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
                        ? 'bg-white/10 border-white/20 text-zinc-300'
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
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          ) : (
                            <Circle className="h-4 w-4 text-zinc-600" />
                          )}
                        </button>
                        <span className="text-xs font-bold text-white">{meal.title}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-white font-mono">
                        +{meal.calories} سعرة
                      </span>
                    </div>

                    <p className="text-[11px] text-zinc-400 pr-6 leading-relaxed">
                      {showAlt ? meal.alternativeMeal : meal.ingredients}
                    </p>

                    <button
                      onClick={() =>
                        setShowAlternativeMeal((prev) => ({ ...prev, [meal.id]: !prev[meal.id] }))
                      }
                      className="mt-1.5 text-[10px] text-zinc-500 hover:text-white pr-6 underline flex items-center gap-1"
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
                <Dumbbell className="h-4 w-4 text-white" />
                <span>تمرين اليوم المنزلي (Calisthenics)</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{plan.nutritionAndWorkout.workoutTitle}</span>
                <span className="text-[10px] text-zinc-300 font-mono">علمي لزيادة الكتلة</span>
              </div>

              <div className="space-y-1.5 pr-2 border-r-2 border-white/40">
                {plan.nutritionAndWorkout.workoutExercises.map((ex, idx) => (
                  <p key={idx} className="text-[11px] text-zinc-300">
                    • {ex}
                  </p>
                ))}
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 font-medium">10 دقائق استطالة مفاصل ومرونة</span>
                <button
                  onClick={handleToggleWorkout}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                    plan.nutritionAndWorkout.workoutCompleted
                      ? 'bg-white text-black border-white shadow-md'
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
                <Coffee className="h-4 w-4 text-white" />
                <h4 className="text-xs font-bold text-white">كافيه روما (حماية الديون)</h4>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                {backupStatus || (plan.romaCafeBackupDone ? 'تم أخذ نسخة احتياطية محلية مؤمنة للأبد' : 'احفظ نسخة محلية لتجنب فقدان البيانات أوفلاين')}
              </p>
            </div>

            <button
              onClick={handleBackupRomaCafe}
              className="px-3.5 py-2 rounded-2xl bg-white/[0.05] hover:bg-white/10 border border-white/10 text-xs font-bold text-white active:scale-95 transition-all flex items-center gap-1.5 flex-shrink-0"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>نسخ احتياطي</span>
            </button>
          </div>

          {/* Card F: English & Coursera (15 min habit) */}
          <div className="p-4 rounded-3xl apple-glass border border-white/10 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-white" />
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
                  ? 'bg-white text-black border-white'
                  : 'bg-white/[0.04] text-zinc-300 border-white/10'
              }`}
            >
              {plan.selfGrowth.englishCompleted ? <Check className="h-4 w-4 text-black" /> : 'إنجاز'}
            </button>
          </div>

        </div>
      )}

      {/* 4. SUBTAB: NEXUS SALES HUB */}
      {activeSubTab === 'nexus' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="p-4 rounded-3xl apple-glass border border-white/10 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-white" />
              <span>استراتيجية مبيعات نيكسيس للمحامين الأمريكيين</span>
            </h3>

            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-zinc-200 space-y-1">
              <p className="font-bold text-white">القاعدة الذهبية لتحقيق أول بيعة:</p>
              <p className="text-[11px] leading-relaxed text-zinc-300">
                لا تطلب من المحامي $199 مباشرة من أول رسالة! اعرض عليه تجربة مجانية 14 يوماً بدون بطاقة بنكية، توضح كيف تعمل الأداة على الرام دون إنترنت لمنع تسريب أسرار الموكلين (ABA 512).
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-300 block">صيغة الإيميل البارد المعتمدة:</label>
              <div className="p-3 rounded-2xl bg-black/50 border border-white/10 font-mono text-[11px] text-zinc-300 text-left dir-ltr select-all space-y-2">
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
                className="w-full py-2.5 rounded-2xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
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
                className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold flex items-center gap-1 hover:bg-white/15"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>إضافة تكليف / محاضرة</span>
              </button>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-white" />
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
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white font-mono border border-white/15">
                    {t.completed ? 'منجز' : 'نشط'}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">مسار الشهادات في Coursera:</span>
                <span className="text-[10px] text-zinc-300 font-mono">CV Builder</span>
              </div>
              <p className="text-xs text-white font-medium">
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
                className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Calculator className="h-3.5 w-3.5" />
                <span>حاسبة السعرات</span>
              </button>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Flame className="h-4 w-4 text-white" />
                <span>خطة زيادة الوزن (من 54 إلى 70 كجم)</span>
              </h3>
            </div>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-white">الوزن الحالي: 54 كجم</span>
                <span className="text-zinc-400">الهدف: 70 كجم</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-white h-full w-[35%]" />
              </div>
              <p className="text-[11px] text-zinc-400">
                الهدف اليومي: <strong className="text-white">{plan.nutritionAndWorkout.targetCalories} سعرة</strong> و <strong className="text-white">115 غرام بروتين</strong> لبناء كتلة ومرونة.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowAddMealModal(true)}
                  className="text-xs text-zinc-300 font-bold hover:text-white hover:underline flex items-center gap-1"
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
                    <span className="font-mono text-white text-xs">+{m.calories} سعرة</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Calorie & Macronutrient Calculator */}
      {showCalorieCalc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4">
          <div className="apple-glass w-full max-w-sm rounded-3xl p-5 border border-white/15 shadow-2xl space-y-3 text-right bg-[#0a0a0c]">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Calculator className="h-4 w-4 text-white" />
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
                <div className="flex justify-between pt-1 border-t border-white/5 text-white font-bold">
                  <span>الهدف لزيادة الوزن (+700 سعرة):</span>
                  <span className="font-mono text-white font-bold">{calorieData.targetSurplusCalories} سعرة</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>البروتين اليومي المطلوب:</span>
                  <span className="font-mono font-bold">{calorieData.dailyProteinGrams} غرام</span>
                </div>
              </div>

              <p className="text-[11px] text-zinc-300 leading-relaxed bg-black/50 p-2.5 rounded-xl border border-white/5">
                {calorieData.explanationArabic}
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => handleApplyCaloriePlan(3000)}
                className="flex-1 py-2.5 rounded-2xl bg-white hover:bg-zinc-200 text-black font-bold text-xs active:scale-95 transition-all text-center shadow-lg"
              >
                تطبيق هدف 3000 سعرة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Custom Meal */}
      {showAddMealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4">
          <form onSubmit={handleAddCustomMeal} className="apple-glass w-full max-w-sm rounded-3xl p-5 border border-white/15 shadow-2xl space-y-3 text-right bg-[#0a0a0c]">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
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
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">السعرات التقديرية:</label>
              <input
                type="number"
                required
                value={customMealCalories}
                onChange={(e) => setCustomMealCalories(e.target.value)}
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">المكونات المتوفرة:</label>
              <input
                type="text"
                value={customMealIngredients}
                onChange={(e) => setCustomMealIngredients(e.target.value)}
                placeholder="حليب، تمر، طحينة، خبز..."
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
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
                className="px-5 py-2 rounded-xl bg-white text-black font-bold text-xs"
              >
                إضافة الوجبة
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: Add Classroom Task */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4">
          <form onSubmit={handleAddClassroomTask} className="apple-glass w-full max-w-sm rounded-3xl p-5 border border-white/15 shadow-2xl space-y-3 text-right bg-[#0a0a0c]">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
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
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
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
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
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
                className="px-5 py-2 rounded-xl bg-white text-black font-bold text-xs"
              >
                إضافة المهمة
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: Rapid OTA / Live Update Checker */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4">
          <div className="apple-glass w-full max-w-sm rounded-3xl p-5 border border-white/15 shadow-2xl space-y-3 text-right bg-[#0a0a0c]">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-white" />
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
                  <span className="font-mono text-white font-bold">{SystemUpdaterEngine.CURRENT_VERSION}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">حالة الربط:</span>
                  <span className="text-white">GitHub Main Auto-Sync</span>
                </div>
              </div>

              {updateStatus && (
                <p className="text-[11px] p-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-zinc-200">
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
                className="flex-1 py-2 rounded-xl bg-white text-black text-xs font-bold shadow-md hover:bg-zinc-200"
              >
                تطبيق التحديث فوراً ⚡
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Alarm Manager (ضبط المنبه والنغمات) */}
      <AlarmManagerModal 
        isOpen={showAlarmModal} 
        onClose={() => setShowAlarmModal(false)} 
      />

      {/* MODAL 6: Google Classroom Bridge & Importer */}
      <ClassroomBridgeModal
        isOpen={showClassroomModal}
        onClose={() => setShowClassroomModal(false)}
        onTaskAdded={() => setPlan(PersonalFocusEngine.getTodayPlan())}
      />

      {/* Full-Screen Alarm Ringing Overlay */}
      <AlarmRingingOverlay />

    </div>
  );
};
