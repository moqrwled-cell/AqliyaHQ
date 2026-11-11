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
  Bell
} from 'lucide-react';
import { PersonalFocusEngine } from '../../lib/personal-focus/personalFocusEngine';
import type { DailyPersonalPlan } from '../../lib/personal-focus/types';

export const MobileFocusHub: React.FC = () => {
  const [plan, setPlan] = useState<DailyPersonalPlan>(() => PersonalFocusEngine.getTodayPlan());
  const [copiedHook, setCopiedHook] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [showAlternativeMeal, setShowAlternativeMeal] = useState<Record<string, boolean>>({});
  const [activeSubTab, setActiveSubTab] = useState<'today' | 'nexus' | 'college' | 'body'>('today');

  useEffect(() => {
    setPlan(PersonalFocusEngine.getTodayPlan());
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

  const handleTestNotification = () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('عقلية | تذكير وجبة الطاقة 🥣', {
          body: 'يا محمد، حان وقت وجبة السيريلاك أو الشوفان.. حافظ على استمراريتك نحو الـ 70 كجم!',
          icon: '/logo.svg',
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification('عقلية | تم تفعيل الإشعارات بنجاح 🫡', {
              body: 'سأرسل لك تذكيرات الوجبات والمهام بانتظام على هاتفك.',
            });
          }
        });
      }
    } else {
      alert('تم إرسال تنبيه تجريبي لهاتفك بنجاح!');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#060913] text-right font-sans select-none overflow-y-auto pb-24 px-3 sm:px-4 pt-3">
      
      {/* 1. Header: Greeting & Work Shift Badge */}
      <div className="p-4 rounded-3xl apple-glass border border-white/10 mb-3 shadow-lg">
        <div className="flex items-center justify-between gap-2 mb-2">
          <button
            onClick={handleCopyTelegramReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold active:scale-95 transition-all"
            title="نسخ تقرير اليوم للتيليجرام"
          >
            {copiedReport ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Send className="h-3.5 w-3.5" />}
            <span>{copiedReport ? 'تم النسخ للتيليجرام!' : 'تقرير التيليجرام'}</span>
          </button>

          <span className="text-xs text-zinc-400 font-medium">
            مرحباً يا بطل 🫡 • محمد قرمان
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-white/[0.04] border border-white/5 text-[11px] text-zinc-300">
            <Clock className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-medium">{plan.shiftBadge}</span>
          </div>

          <button
            onClick={handleTestNotification}
            className="p-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-400 hover:text-white"
            title="فحص الإشعارات"
          >
            <Bell className="h-4 w-4" />
          </button>
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
              <span className="text-[11px] text-zinc-400">إدارة أعمال تكنولوجيا</span>
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
              <span className="text-[11px] font-mono text-emerald-400">
                {plan.nexusTargets.sentCount}/{plan.nexusTargets.dailyEmailTarget} إيميل
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                <Briefcase className="h-4 w-4 text-blue-400" />
                <span>مشروع نيكسيس للمحامين</span>
              </div>
            </div>

            <p className="text-xs text-zinc-300">
              الهدف اليومي: إرسال 20 إيميل للمكاتب الأمريكية لعرض التجربة المجانية (Demo).
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
                <span className="text-zinc-400 font-medium">خطاف الرسالة القانونية المقترح:</span>
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
              <span className="text-[11px] font-mono text-amber-400 font-bold">
                الهدف: 70 كجم (الحالي 54)
              </span>
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

              <ul className="space-y-1 text-[11px] text-zinc-300 pr-2 list-disc list-inside">
                {plan.nutritionAndWorkout.workoutExercises.map((ex, i) => (
                  <li key={i}>{ex}</li>
                ))}
              </ul>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={handleToggleWorkout}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    plan.nutritionAndWorkout.workoutCompleted
                      ? 'bg-emerald-500 text-zinc-950 shadow-md'
                      : 'bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 border border-white/10'
                  }`}
                >
                  {plan.nutritionAndWorkout.workoutCompleted ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>تم إنجاز تمرين وإطالات اليوم بنجاح! 💪</span>
                    </>
                  ) : (
                    <>
                      <Circle className="h-4 w-4" />
                      <span>تسجيل إنجاز تمرين اليوم</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Card E: Roma Cafe Instant Debt Backup */}
          <div className="p-4 rounded-3xl apple-glass border border-white/10 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Coffee className="h-4 w-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white">كافيه روما • تأمين الديون</h4>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                حفظ نسخة احتياطية محلية لحماية حسابات الكافيه
              </p>
              {backupStatus && (
                <p className="text-[10px] text-emerald-400 font-medium mt-1 animate-pulse">
                  {backupStatus}
                </p>
              )}
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
                استماع وتدريب لجمل الأعمال لرفع مستواك تلقائياً
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
                لا تطلب من المحامي $199 مباشرة من أول رسالة! اعرض عليه تجربة مجانية 14 يوماً بدون بطاقة بنكية، أو فيديو توضيحي (Demo) يوضح كيف تعمل الأداة على الرام دون إنترنت لمنع تسريب أسرار الموكلين.
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
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-emerald-400" />
              <span>الكلية التطبيقية • كلاس روم</span>
            </h3>

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
                    نشط
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
              <p className="font-bold">نصيحة الكلية:</p>
              <p className="text-[11px] mt-0.5">
                تفريغ أول 30 دقيقة بعد انتهاء دوام المدرسة الصباحي لمتابعة الكلاس روم يضمن تفوقك دون أي تراكمات.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6. SUBTAB: BODY TRANSFORMATION (54 -> 70 KG) */}
      {activeSubTab === 'body' && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="p-4 rounded-3xl apple-glass border border-white/10 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-400" />
              <span>خطة البناء الجسدي وزيادة الوزن (من 54 إلى 70 كجم)</span>
            </h3>

            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-400">الوزن الحالي: 54 كجم</span>
                <span className="text-zinc-400">الهدف الصيفي: 70 كجم</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full w-[35%]" />
              </div>
              <p className="text-[11px] text-zinc-400">
                مطلوب زيادة +16 كجم عضل ومرونة بمعدل 0.5 إلى 0.75 كجم أسبوعياً.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white">الأطعمة الأسهل سعرات في غزة دون خلاط:</h4>
              <div className="space-y-1.5 text-xs text-zinc-300">
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <span>سيريلاك أو شوفان بالحليب الدافئ والعسل</span>
                  <span className="font-mono text-amber-400">~450 سعرة</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <span>إضافة ملعقتين زيت زيتون بكر على غداء العائلة</span>
                  <span className="font-mono text-amber-400">+240 سعرة</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <span>5 حبات تمر + 50 غرام فستق محمص</span>
                  <span className="font-mono text-amber-400">~400 سعرة</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                  <span>ساندويتش طحينة ودبس تمر مع رغيف خبز</span>
                  <span className="font-mono text-amber-400">~380 سعرة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
