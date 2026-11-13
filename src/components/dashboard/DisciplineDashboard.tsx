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
  Plus, 
  Target, 
  Clock,
  Sparkles,
  Moon,
  Sun
} from 'lucide-react';
import { PersonalFocusEngine } from '../../lib/personal-focus/personalFocusEngine';
import type { DailyPersonalPlan } from '../../lib/personal-focus/types';
import { SleepTrackerEngine, type YearSleepStats, type SleepDayCell } from '../../lib/sleepTrackerEngine';
import { SleepLoggerModal } from '../mobile/SleepLoggerModal';

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
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [weightInput, setWeightInput] = useState('54');

  // Sleep engine stats
  const [sleepStats, setSleepStats] = useState<YearSleepStats>(() => SleepTrackerEngine.getYearStats(2026));
  const [selectedSleepDay, setSelectedSleepDay] = useState<SleepDayCell | null>(null);

  useEffect(() => {
    const handleSleepUpdate = () => {
      setSleepStats(SleepTrackerEngine.getYearStats(2026));
    };
    window.addEventListener('moha:sleep-updated', handleSleepUpdate);
    return () => window.removeEventListener('moha:sleep-updated', handleSleepUpdate);
  }, []);

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
  const currentStreakDays = 12;
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
    <div className="flex flex-col h-full bg-black text-right font-sans select-none overflow-y-auto pb-32 px-2 sm:px-3 pt-2.5 space-y-3">
      
      {/* 1. Header Card: Overall Discipline & Current Streak */}
      <div className="p-3.5 sm:p-4 rounded-2xl apple-glass border border-white/10 shadow-lg space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.06] border border-white/10 text-xs font-mono font-bold text-white">
            <Flame className="h-4 w-4 text-white animate-pulse" />
            <span>ستريك {currentStreakDays} يوماً متواصلاً 🔥</span>
          </div>
          <div className="text-right">
            <h2 className="text-sm font-bold text-white">لوحة التطور والالتزام</h2>
            <p className="text-[11px] text-zinc-400">مراقبة النوم، البناء البدني، ونمو الأعمال</p>
          </div>
        </div>

        {/* Big Key Metrics Row */}
        <div className="grid grid-cols-3 gap-2 pt-0.5 text-center">
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] text-zinc-400 block mb-0.5">معدل الانضباط</span>
            <span className="text-xl font-black font-mono text-white">{averageDisciplineScore}%</span>
            <span className="text-[9px] text-zinc-500 block mt-0.5">ممتاز ومستمر</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] text-zinc-400 block mb-0.5">الوزن الحالي</span>
            <span className="text-xl font-black font-mono text-white">{currentWeight} كجم</span>
            <span className="text-[9px] text-zinc-500 block mt-0.5">الهدف: 70 كجم</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] text-zinc-400 block mb-0.5">متوسط النوم</span>
            <span className="text-xl font-black font-mono text-white">{sleepStats.averageFormatted}</span>
            <span className="text-[9px] text-zinc-500 block mt-0.5">استشفاء عضلي</span>
          </div>
        </div>
      </div>

      {/* 2. Sleep Consistency & Recovery Matrix (Exact Visual Match to User Screenshot!) */}
      <div className="p-3.5 sm:p-4 rounded-2xl apple-glass border border-white/10 space-y-3 shadow-lg">
        
        {/* Header row: 2026 • 314 nights • avg 8h 12m (LTR matching screenshot) + Log Sleep Button */}
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <button
            onClick={() => setShowSleepModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-black font-bold text-xs shadow-md active:scale-95 transition-all hover:bg-zinc-200"
          >
            <Moon className="h-3.5 w-3.5 text-black" />
            <span>توثيق نوم</span>
          </button>

          <div dir="ltr" className="text-left">
            <div className="flex items-baseline gap-2 text-white">
              <span className="text-2xl font-black font-mono tracking-tight">{sleepStats.year}</span>
              <span className="text-xs text-zinc-400 font-mono">
                • {sleepStats.totalNights} nights • avg {sleepStats.averageFormatted}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 text-right" dir="rtl">مصفوفة استشفاء النوم وتجدد طاقة الجسم</p>
          </div>
        </div>

        {/* Selected Day Info Banner (Tapped Dot) */}
        {selectedSleepDay && (
          <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-between text-xs animate-in fade-in duration-150">
            <button 
              onClick={() => setSelectedSleepDay(null)}
              className="text-[10px] text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-white/[0.05]"
            >
              إغلاق ✕
            </button>
            <div className="flex items-center gap-2" dir="ltr">
              <span className="font-mono text-zinc-300">{selectedSleepDay.dateStr}</span>
              <span className="text-zinc-600">•</span>
              {selectedSleepDay.durationMinutes ? (
                <span className="font-bold text-white font-mono">
                  {Math.floor(selectedSleepDay.durationMinutes / 60)}h {selectedSleepDay.durationMinutes % 60}m 
                  {selectedSleepDay.sleepTime ? ` (${selectedSleepDay.sleepTime} - ${selectedSleepDay.wakeTime})` : ''}
                </span>
              ) : (
                <span className="text-zinc-500">غير موثق بعد</span>
              )}
            </div>
          </div>
        )}

        {/* The Heatmap Scrollable Matrix (Horizontal Scroll with 7 Rows of Dots, LTR) */}
        <div dir="ltr" className="overflow-x-auto pb-1.5 select-none scrollbar-none" style={{ scrollbarWidth: 'none' }}>
          <div className="min-w-[690px] space-y-1.5 pt-1">
            
            {/* Month Labels Row (precisely aligned above respective week columns) */}
            <div className="relative h-4 text-[10px] text-zinc-400 font-mono">
              {sleepStats.gridColumns.map((col, idx) => {
                if (!col.monthLabel) return null;
                const leftPos = idx * 13;
                return (
                  <span 
                    key={idx} 
                    className="absolute font-semibold text-zinc-300 pointer-events-none"
                    style={{ left: `${leftPos}px` }}
                  >
                    {col.monthLabel}
                  </span>
                );
              })}
            </div>

            {/* 7 Rows of Dots (Days of the week) */}
            <div className="flex gap-[3px]">
              {sleepStats.gridColumns.map((col, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-[3px] flex-shrink-0">
                  {col.days.map((day, dayIdx) => {
                    const isSelected = selectedSleepDay?.dateStr === day.dateStr;
                    
                    // Exact colors matching user screenshot
                    let dotClass = 'bg-[#18181b] border border-zinc-800'; // untracked
                    if (day.category === 'less6') {
                      dotClass = 'bg-[#ef4444] shadow-[0_0_4px_rgba(239,68,68,0.6)]'; // red < 6h
                    } else if (day.category === 'h6') {
                      dotClass = 'bg-[#0f766e]'; // dark teal 6h
                    } else if (day.category === 'h7') {
                      dotClass = 'bg-[#10b981]'; // mid green 7h
                    } else if (day.category === 'h8') {
                      dotClass = 'bg-[#34d399] shadow-[0_0_6px_rgba(52,211,153,0.85)]'; // bright mint glow 8h
                    } else if (day.category === 'h9plus') {
                      dotClass = 'bg-[#f59e0b] shadow-[0_0_4px_rgba(245,158,11,0.5)]'; // orange 9h+
                    }

                    return (
                      <button
                        key={dayIdx}
                        onClick={() => day.dateStr.startsWith('pad') ? null : setSelectedSleepDay(day)}
                        disabled={day.dateStr.startsWith('pad')}
                        title={day.durationMinutes ? `${day.dateStr}: ${Math.floor(day.durationMinutes / 60)}h ${day.durationMinutes % 60}m` : day.dateStr}
                        className={`w-2.5 h-2.5 rounded-full transition-transform hover:scale-150 active:scale-125 ${dotClass} ${
                          isSelected ? 'ring-2 ring-white scale-125' : ''
                        } ${day.dateStr.startsWith('pad') ? 'opacity-0 pointer-events-none' : ''}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Legend matching user screenshot (LTR) */}
        <div dir="ltr" className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] text-zinc-400 font-mono">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
              <span>&lt; 6h</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#0f766e]" />
              <span>6h</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#10b981]" />
              <span>7h</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#34d399] shadow-[0_0_4px_#34d399]" />
              <span className="text-white font-bold">8h</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
              <span>9h+</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-[#18181b] border border-zinc-800" />
            <span>• not tracked</span>
          </div>
        </div>

      </div>

      {/* 3. Physical Transformation Tracker: 54kg -> 70kg */}
      <div className="p-3.5 sm:p-4 rounded-2xl apple-glass border border-white/10 space-y-3 shadow-lg">
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
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[10px] text-zinc-400 block">هدف السعرات اليومي</span>
            <span className="text-sm font-bold font-mono text-white">3,000 سعرة</span>
            <span className="text-[10px] text-zinc-400 block">بدون خلاط وبدون غاز</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
            <span className="text-[10px] text-zinc-400 block">جلسات الكاليسثينكس</span>
            <span className="text-sm font-bold font-mono text-white">4 أيام / أسبوع</span>
            <span className="text-[10px] text-zinc-400 block">+ 10 دقائق مرونة يومياً</span>
          </div>
        </div>
      </div>

      {/* 4. Monthly Discipline Heatmap (تقويم الالتزام والنشاط الشهري) */}
      <div className="p-3.5 sm:p-4 rounded-2xl apple-glass border border-white/10 space-y-3 shadow-lg">
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
      </div>

      {/* 5. Nexus Legal AI Outreach Performance */}
      <div className="p-3.5 sm:p-4 rounded-2xl apple-glass border border-white/10 space-y-3 shadow-lg">
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
            <span className="font-mono text-white">{emailProgressPct}% من الهدف الشهري</span>
            <span className="text-zinc-400">المستهدف: 20 إيميل يومياً</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/[0.05] border border-white/10 overflow-hidden">
            <div 
              className="h-full rounded-full bg-white transition-all duration-500 shadow-sm"
              style={{ width: `${emailProgressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Modal: Update Body Weight */}
      {showWeightModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="apple-glass w-full max-w-sm rounded-3xl p-5 border border-white/15 shadow-2xl space-y-3 text-right bg-[#0a0a0c]">
            <h3 className="text-sm font-bold text-white">تسجيل الوزن الجديد</h3>
            <p className="text-xs text-zinc-400">
              أدخل وزنك الحالي لمطابقة السعرات مع معادلة الزيادة العلمية (هدف 70 كجم).
            </p>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">الوزن بالكيلوغرام:</label>
              <input
                type="number"
                step="0.1"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="w-full rounded-xl bg-white/[0.05] border border-white/10 px-3 py-2 text-white font-mono text-center text-lg focus:outline-none focus:border-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowWeightModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs text-zinc-400 hover:text-white"
              >
                إلغاء
              </button>
              <button
                onClick={handleUpdateWeight}
                className="px-5 py-2 rounded-xl bg-white text-black font-bold text-xs"
              >
                تحديث الوزن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Sleep Logger */}
      <SleepLoggerModal
        isOpen={showSleepModal}
        onClose={() => setShowSleepModal(false)}
        onSave={() => setSleepStats(SleepTrackerEngine.getYearStats(2026))}
      />

    </div>
  );
};
