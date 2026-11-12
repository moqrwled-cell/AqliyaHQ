import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Flame, 
  Dumbbell, 
  Briefcase, 
  GraduationCap, 
  Award, 
  CheckCircle2, 
  ChevronRight, 
  Plus, 
  Target, 
  Clock,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { PersonalFocusEngine } from '../../lib/personal-focus/personalFocusEngine';
import type { DailyPersonalPlan } from '../../lib/personal-focus/types';

interface DayLog {
  day: number;
  dateStr: string;
  score: number; // 0 to 100
  workoutDone: boolean;
  caloriesDone: boolean;
  nexusDone: boolean;
  collegeDone: boolean;
}

export const DisciplineDashboard: React.FC = () => {
  const [plan, setPlan] = useState<DailyPersonalPlan>(() => PersonalFocusEngine.getTodayPlan());
  const [currentWeight, setCurrentWeight] = useState(54);
  const [targetWeight] = useState(70);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [weightInput, setWeightInput] = useState('54');

  // Load monthly logs from local storage or generate current month template
  const [monthLogs, setMonthLogs] = useState<DayLog[]>(() => {
    try {
      const raw = localStorage.getItem('moha_discipline_month_logs_v1');
      if (raw) return JSON.parse(raw);
    } catch (e) {}

    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();

    const initial: DayLog[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      // Simulate past days commitment
      const isPast = i < currentDay;
      const isToday = i === currentDay;
      initial.push({
        day: i,
        dateStr: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
        score: isPast ? (i % 7 === 5 ? 70 : 85 + (i % 15)) : isToday ? 80 : 0,
        workoutDone: isPast ? i % 7 !== 5 : false,
        caloriesDone: isPast ? true : false,
        nexusDone: isPast ? i % 2 === 0 : false,
        collegeDone: isPast ? true : false,
      });
    }
    return initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem('moha_discipline_month_logs_v1', JSON.stringify(monthLogs));
    } catch (e) {}
  }, [monthLogs]);

  // Overall statistics
  const currentStreakDays = 12; // أيام الالتزام المتتالية
  const totalEmailsSentMonth = 185;
  const targetEmailsMonth = 450;
  const emailProgressPct = Math.min(100, Math.round((totalEmailsSentMonth / targetEmailsMonth) * 100));

  const weightProgressKg = Math.max(0, currentWeight - 54);
  const totalWeightGoalKg = targetWeight - 54; // 16 kg
  const weightProgressPct = Math.min(100, Math.round((weightProgressKg / totalWeightGoalKg) * 100));

  const averageDisciplineScore = Math.round(
    monthLogs.filter(d => d.score > 0).reduce((acc, curr) => acc + curr.score, 0) / 
    Math.max(1, monthLogs.filter(d => d.score > 0).length)
  );

  const handleUpdateWeight = () => {
    const val = parseFloat(weightInput);
    if (!isNaN(val) && val > 40 && val < 120) {
      setCurrentWeight(val);
      setShowWeightModal(false);
      PersonalFocusEngine.updateCalories(3000, val);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-right font-sans select-none overflow-y-auto pb-36 px-3 sm:px-4 pt-3 space-y-4">
      
      {/* 1. Header Card: Overall Discipline & Current Streak */}
      <div className="p-4 sm:p-5 rounded-3xl apple-glass border border-white/10 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-white/[0.06] border border-white/10 text-xs font-mono font-bold text-white">
            <Flame className="h-4 w-4 text-white animate-pulse" />
            <span>ستريك {currentStreakDays} يوماً متواصلاً 🔥</span>
          </div>
          <div className="text-right">
            <h2 className="text-sm font-bold text-white">لوحة التطور والالتزام</h2>
            <p className="text-[11px] text-zinc-400">مراقبة دقيقة للأداء اليومي والشهري</p>
          </div>
        </div>

        {/* Big Key Metrics Row */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] text-zinc-400 block mb-0.5">معدل الانضباط</span>
            <span className="text-xl font-black font-mono text-white">{averageDisciplineScore}%</span>
            <span className="text-[9px] text-zinc-500 block mt-0.5">ممتاز ومستمر</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] text-zinc-400 block mb-0.5">الوزن الحالي</span>
            <span className="text-xl font-black font-mono text-white">{currentWeight} كجم</span>
            <span className="text-[9px] text-zinc-500 block mt-0.5">الهدف: 70 كجم</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] text-zinc-400 block mb-0.5">إيميلات نيكسيس</span>
            <span className="text-xl font-black font-mono text-white">{totalEmailsSentMonth}</span>
            <span className="text-[9px] text-zinc-500 block mt-0.5">من أصل {targetEmailsMonth}</span>
          </div>
        </div>
      </div>

      {/* 2. Monthly Discipline Heatmap (تقويم الالتزام والنشاط الشهري) */}
      <div className="p-4 rounded-3xl apple-glass border border-white/10 space-y-3">
        <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
            <span className="w-2 h-2 rounded-sm bg-white" />
            <span>مكتمل</span>
            <span className="w-2 h-2 rounded-sm bg-zinc-600 mr-2" />
            <span>جزئي</span>
            <span className="w-2 h-2 rounded-sm bg-zinc-900 border border-white/10 mr-2" />
            <span>قادم</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <Calendar className="h-4 w-4 text-zinc-300" />
            <span>تقويم التزام الشهر (30 يوماً)</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {monthLogs.map((log) => {
            const isFull = log.score >= 85;
            const isMedium = log.score > 0 && log.score < 85;
            const isFuture = log.score === 0;

            return (
              <div
                key={log.day}
                className={`h-11 rounded-xl p-1 border flex flex-col justify-between transition-all ${
                  isFull
                    ? 'bg-white text-black border-white shadow-sm'
                    : isMedium
                    ? 'bg-zinc-800 text-white border-zinc-700'
                    : 'bg-white/[0.02] text-zinc-600 border-white/5'
                }`}
              >
                <span className="text-[10px] font-mono font-bold">{log.day}</span>
                <span className="text-[8px] font-mono self-end">
                  {isFuture ? '-' : `${log.score}%`}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-zinc-400 text-center pt-1">
          كل يوم تلتزم فيه بالوجبات، التمرين، وإيميلات نيكسيس يرفع درجتك نحو الهدف.
        </p>
      </div>

      {/* 3. Physical Transformation Tracker: 54kg -> 70kg */}
      <div className="p-4 rounded-3xl apple-glass border border-white/10 space-y-3">
        <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
          <button
            onClick={() => setShowWeightModal(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-[11px] text-zinc-200 font-semibold active:scale-95 transition-all"
          >
            <Plus className="h-3 w-3" />
            <span>تسجيل وزن جديد</span>
          </button>
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <Dumbbell className="h-4 w-4 text-zinc-300" />
            <span>البناء الجسدي وزيادة الوزن (54 ➔ 70 كجم)</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-white font-bold">{currentWeight} كجم ({weightProgressPct}%)</span>
            <span className="text-zinc-400">التقدم نحو الهدف (+16 كجم مطلوبة)</span>
          </div>
          {/* Custom Progress Bar */}
          <div className="w-full h-3 rounded-full bg-white/[0.05] border border-white/10 overflow-hidden p-0.5">
            <div 
              className="h-full rounded-full bg-white transition-all duration-500 shadow-sm"
              style={{ width: `${Math.max(8, weightProgressPct)}%` }}
            />
          </div>
        </div>

        {/* Nutritional Checklist Breakdown */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[10px] text-zinc-400 block">هدف السعرات اليومي</span>
            <span className="text-sm font-bold font-mono text-white">3,000 سعرة</span>
            <span className="text-[10px] text-zinc-400 block">بدون خلاط وبدون غاز</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[10px] text-zinc-400 block">جلسات الكاليسثينكس</span>
            <span className="text-sm font-bold font-mono text-white">4 أيام / أسبوع</span>
            <span className="text-[10px] text-zinc-400 block">+ 10 دقائق مرونة يومياً</span>
          </div>
        </div>
      </div>

      {/* 4. Nexus Legal AI Outreach Performance */}
      <div className="p-4 rounded-3xl apple-glass border border-white/10 space-y-3">
        <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
          <span className="text-xs font-mono font-bold text-white">
            {totalEmailsSentMonth} / {targetEmailsMonth} إيميل
          </span>
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <Briefcase className="h-4 w-4 text-zinc-300" />
            <span>مشروع نيكسيس للمحامين (Cold Outreach)</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-white">{emailProgressPct}% من مستهدف الشهر</span>
            <span className="text-zinc-400">إرسال 20 إيميل يومياً للمكاتب الأمريكية</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-white/[0.05] border border-white/10 overflow-hidden p-0.5">
            <div 
              className="h-full rounded-full bg-white transition-all duration-500"
              style={{ width: `${Math.max(5, emailProgressPct)}%` }}
            />
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
          <span className="text-zinc-400">عروض التجربة المجانية (14-Day Risk-Free)</span>
          <span className="font-mono font-bold text-white">ABA 512 Hook نشط</span>
        </div>
      </div>

      {/* 5. Academic & Coursera CV Progression */}
      <div className="p-4 rounded-3xl apple-glass border border-white/10 space-y-2.5">
        <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
          <span className="text-[11px] font-mono text-zinc-400">إدارة أعمال وتكنولوجيا</span>
          <div className="flex items-center gap-1.5 text-xs font-bold text-white">
            <GraduationCap className="h-4 w-4 text-zinc-300" />
            <span>الكلية التطبيقية وبناء السيرة الذاتية (CV)</span>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
            <span className="text-[11px] text-zinc-400">تتبع يومي ومتابعة الامتحانات</span>
            <div className="flex items-center gap-1.5 text-white font-medium">
              <CheckCircle2 className="h-3.5 w-3.5 text-white" />
              <span>كلاس روم الكلية</span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
            <span className="text-[11px] text-zinc-400">شهادات مهنية معتمدة للـ CV</span>
            <div className="flex items-center gap-1.5 text-white font-medium">
              <Award className="h-3.5 w-3.5 text-white" />
              <span>كورسات كورسيرا (Coursera)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weight Input Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
          <div className="apple-glass-elevated w-full max-w-xs rounded-3xl p-5 border border-white/10 space-y-4 text-right">
            <h3 className="text-sm font-bold text-white">تسجيل الوزن الحالي</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              سجل وزنك بالكيلوجرام لمتابعة التقدم نحو الهدف المنشود (70 كجم):
            </p>

            <div className="flex items-center justify-center p-3 rounded-2xl bg-white/[0.04] border border-white/10">
              <span className="text-sm font-bold text-zinc-400 ml-2">كجم</span>
              <input
                type="number"
                step="0.1"
                value={weightInput}
                onChange={e => setWeightInput(e.target.value)}
                className="bg-transparent text-2xl font-mono font-bold text-white outline-none text-center w-24"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowWeightModal(false)}
                className="flex-1 py-2 rounded-xl bg-white/[0.04] text-xs font-semibold text-zinc-400 hover:text-white"
              >
                إلغاء
              </button>
              <button
                onClick={handleUpdateWeight}
                className="flex-1 py-2 rounded-xl bg-white text-black text-xs font-bold shadow-md"
              >
                حفظ الوزن
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
