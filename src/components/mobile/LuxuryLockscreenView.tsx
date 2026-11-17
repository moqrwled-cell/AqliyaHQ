// ============================================================================
// MOHA AGENT — LUXURY LOCKSCREEN & EISENHOWER TASK MATRIX VIEW
// Exact Visual & Functional Implementation of Mohammad's Luxury Lockscreen
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Flame, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Circle, 
  Plus, 
  X, 
  Bell, 
  Sparkles, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  Sliders,
  Layers,
  Flashlight,
  Camera,
  Check
} from 'lucide-react';
import { 
  LockscreenEngine, 
  type LockscreenTask, 
  type TaskQuadrant, 
  type YearProgressInfo 
} from '../../lib/lockscreenEngine';

interface LuxuryLockscreenViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LuxuryLockscreenView: React.FC<LuxuryLockscreenViewProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'year_progress'>('matrix');
  const [tasks, setTasks] = useState<LockscreenTask[]>(() => LockscreenEngine.getTasks());
  const [yearInfo, setYearInfo] = useState<YearProgressInfo>(() => LockscreenEngine.getYearProgressInfo(2026));
  const [periodFocus, setPeriodFocus] = useState(() => LockscreenEngine.getPeriodFocus());

  // Quick Task Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetQuadrant, setTargetQuadrant] = useState<TaskQuadrant>('urgent_important');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [notificationSynced, setNotificationSynced] = useState(false);

  // Live Clock
  const [currentTime, setCurrentTime] = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  });

  // Arabic Date Formatted
  const [currentDateAr, setCurrentDateAr] = useState(() => {
    const d = new Date();
    const daysAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const monthsAr = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    return `${daysAr[d.getDay()]} ${d.getDate()} ${monthsAr[d.getMonth()]}`;
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentTime(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      setTasks(LockscreenEngine.getTasks());
      setPeriodFocus(LockscreenEngine.getPeriodFocus());
      setYearInfo(LockscreenEngine.getYearProgressInfo(2026));
    };

    window.addEventListener('moha:lockscreen-tasks-updated', handleUpdate);
    window.addEventListener('moha:period-focus-updated', handleUpdate);
    return () => {
      window.removeEventListener('moha:lockscreen-tasks-updated', handleUpdate);
      window.removeEventListener('moha:period-focus-updated', handleUpdate);
    };
  }, []);

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    LockscreenEngine.toggleTask(id);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    LockscreenEngine.addTask({
      quadrant: targetQuadrant,
      title: newTaskTitle.trim(),
      time: newTaskTime.trim() || undefined,
      color: targetQuadrant === 'urgent_important' ? '#f97316' : targetQuadrant === 'important' ? '#3b82f6' : targetQuadrant === 'urgent' ? '#eab308' : '#a1a1aa',
    });

    setNewTaskTitle('');
    setNewTaskTime('');
    setShowAddModal(false);
  };

  const handleSyncNotification = async () => {
    const success = await LockscreenEngine.syncLockscreenNotification();
    setNotificationSynced(true);
    setTimeout(() => setNotificationSynced(false), 3000);
  };

  // Quadrant Filtering
  const qUrgentImportant = tasks.filter((t) => t.quadrant === 'urgent_important');
  const qImportant = tasks.filter((t) => t.quadrant === 'important');
  const qUrgent = tasks.filter((t) => t.quadrant === 'urgent');
  const qSomeday = tasks.filter((t) => t.quadrant === 'someday');

  // Mini 7-day strip (Centered around today)
  const now = new Date();
  const currentDayIndex = now.getDay(); // 0 is Sunday
  const daysLetters = [
    { label: 'ح', num: now.getDate() - currentDayIndex, isToday: currentDayIndex === 0 },
    { label: 'ن', num: now.getDate() - currentDayIndex + 1, isToday: currentDayIndex === 1 },
    { label: 'ث', num: now.getDate() - currentDayIndex + 2, isToday: currentDayIndex === 2 },
    { label: 'ر', num: now.getDate() - currentDayIndex + 3, isToday: currentDayIndex === 3 },
    { label: 'خ', num: now.getDate() - currentDayIndex + 4, isToday: currentDayIndex === 4 },
    { label: 'ج', num: now.getDate() - currentDayIndex + 5, isToday: currentDayIndex === 5 },
    { label: 'س', num: now.getDate() - currentDayIndex + 6, isToday: currentDayIndex === 6 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-3xl text-white font-sans select-none overflow-y-auto animate-in fade-in duration-200">
      
      {/* Background Ambience (Burj Khalifa Luxury Glow) */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-black/80 to-black pointer-events-none" />

      {/* Top Lock Indicator & Close Button */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-3 pb-1">
        <button
          onClick={onClose}
          className="p-2 rounded-2xl bg-white/10 hover:bg-white/15 text-zinc-300 hover:text-white transition-all backdrop-blur-md active:scale-95"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-zinc-300 font-mono shadow-sm">
          <Lock className="h-3 w-3 text-white" />
          <span>شاشة القفل التكتيكية</span>
        </div>

        <button
          onClick={handleSyncNotification}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-2xl bg-white/10 hover:bg-white/20 text-[11px] font-bold text-zinc-200 transition-all active:scale-95 border border-white/10"
          title="تثبيت إشعار شاشة القفل على جوال أندرويد"
        >
          <Bell className="h-3.5 w-3.5 text-amber-400" />
          <span>{notificationSynced ? 'تم التثبيت ✓' : 'تثبيت إشعار'}</span>
        </button>
      </div>

      <div className="relative z-10 flex-1 px-3 sm:px-4 pb-20 space-y-3.5 max-w-md mx-auto w-full">
        
        {/* Date & Huge Luxury Display Clock (Exact Match to Image 1 & 2) */}
        <div className="text-center pt-1 pb-1">
          <p className="text-sm font-medium text-zinc-300 mb-0.5 tracking-wide">{currentDateAr}</p>
          <div className="relative inline-block">
            <h1 className="text-7xl sm:text-8xl font-black tracking-tight text-white/95 font-mono drop-shadow-[0_4px_24px_rgba(255,255,255,0.25)]">
              {currentTime}
            </h1>
          </div>
        </div>

        {/* View Switcher Bar (مصفوفة المهام vs تقدم سنة 2026) */}
        <div className="flex items-center p-1 rounded-2xl bg-white/[0.06] border border-white/10 text-xs font-bold">
          <button
            onClick={() => setActiveTab('matrix')}
            className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'matrix'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>مصفوفة المهام (4x4)</span>
          </button>

          <button
            onClick={() => setActiveTab('year_progress')}
            className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'year_progress'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>تقدم 2026 ({yearInfo.percentage}%)</span>
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: EISENHOWER TASK MATRIX & 7-DAY MINI CALENDAR (IMAGE 1) */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'matrix' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            
            {/* 7-Day Mini Calendar Strip with Event Pills (Matching Image 1) */}
            <div className="p-3 rounded-2xl apple-glass border border-white/10 shadow-lg">
              <div className="grid grid-cols-7 gap-1 text-center font-mono">
                {daysLetters.map((d, idx) => (
                  <div key={idx} className="flex flex-col items-center space-y-1">
                    <span className="text-[11px] text-zinc-400">{d.label}</span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      d.isToday
                        ? 'bg-white text-black ring-2 ring-amber-400 shadow-md font-black'
                        : 'text-zinc-300 hover:bg-white/10'
                    }`}>
                      {Math.max(1, d.num)}
                    </div>
                    {/* Event indicators */}
                    <div className="flex flex-col gap-0.5 w-full px-0.5">
                      <div className="h-1 rounded-full bg-blue-500/80 w-full" />
                      {idx % 2 === 0 && <div className="h-1 rounded-full bg-amber-500/80 w-full" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4 Quadrants 2x2 Grid (Matching Image 1) */}
            <div className="grid grid-cols-2 gap-2.5 text-right">
              
              {/* Quadrant 1: مهم وعاجل (Urgent & Important) */}
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-orange-500/30 space-y-2 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[175px]">
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-l from-orange-500 to-red-500" />
                
                <div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                    <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-mono font-bold flex items-center justify-center">
                      {qUrgentImportant.filter(t => !t.completed).length}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-orange-300">
                      <span>مهم وعاجل</span>
                      <Flame className="h-3.5 w-3.5 text-orange-400" />
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1.5">
                    {qUrgentImportant.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggle(task.id)}
                        className="flex items-start gap-1.5 cursor-pointer group text-[11px] leading-tight"
                      >
                        <button className="mt-0.5 flex-shrink-0 text-orange-400">
                          {task.completed ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Circle className="h-3.5 w-3.5" />}
                        </button>
                        <span className={`flex-1 transition-all ${task.completed ? 'line-through text-zinc-500' : 'text-zinc-200 group-hover:text-white'}`}>
                          {task.title}
                          {task.time && <span className="block text-[9px] text-orange-400 font-mono mt-0.5">{task.time}</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setTargetQuadrant('urgent_important');
                    setShowAddModal(true);
                  }}
                  className="w-full py-1 text-[10px] text-zinc-400 hover:text-white rounded-lg bg-white/[0.03] hover:bg-white/[0.07] transition-all flex items-center justify-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>إضافة</span>
                </button>
              </div>

              {/* Quadrant 2: مهم (Important) */}
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-blue-500/30 space-y-2 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[175px]">
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-l from-blue-500 to-cyan-500" />
                
                <div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                    <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-mono font-bold flex items-center justify-center">
                      {qImportant.filter(t => !t.completed).length}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-blue-300">
                      <span>مهم</span>
                      <span className="w-2 h-2 rounded-sm bg-blue-400" />
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1.5">
                    {qImportant.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggle(task.id)}
                        className="flex items-start gap-1.5 cursor-pointer group text-[11px] leading-tight"
                      >
                        <button className="mt-0.5 flex-shrink-0 text-blue-400">
                          {task.completed ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Circle className="h-3.5 w-3.5" />}
                        </button>
                        <span className={`flex-1 transition-all ${task.completed ? 'line-through text-zinc-500' : 'text-zinc-200 group-hover:text-white'}`}>
                          {task.title}
                          {task.time && <span className="block text-[9px] text-blue-400 font-mono mt-0.5">{task.time}</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setTargetQuadrant('important');
                    setShowAddModal(true);
                  }}
                  className="w-full py-1 text-[10px] text-zinc-400 hover:text-white rounded-lg bg-white/[0.03] hover:bg-white/[0.07] transition-all flex items-center justify-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>إضافة</span>
                </button>
              </div>

              {/* Quadrant 3: عاجل (Urgent) */}
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-amber-500/30 space-y-2 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[175px]">
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-l from-amber-500 to-yellow-500" />
                
                <div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-mono font-bold flex items-center justify-center">
                      {qUrgent.filter(t => !t.completed).length}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-300">
                      <span>عاجل</span>
                      <span className="text-amber-400 text-xs">⚡</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1.5">
                    {qUrgent.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggle(task.id)}
                        className="flex items-start gap-1.5 cursor-pointer group text-[11px] leading-tight"
                      >
                        <button className="mt-0.5 flex-shrink-0 text-amber-400">
                          {task.completed ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Circle className="h-3.5 w-3.5" />}
                        </button>
                        <span className={`flex-1 transition-all ${task.completed ? 'line-through text-zinc-500' : 'text-zinc-200 group-hover:text-white'}`}>
                          {task.title}
                          {task.time && <span className="block text-[9px] text-amber-400 font-mono mt-0.5">{task.time}</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setTargetQuadrant('urgent');
                    setShowAddModal(true);
                  }}
                  className="w-full py-1 text-[10px] text-zinc-400 hover:text-white rounded-lg bg-white/[0.03] hover:bg-white/[0.07] transition-all flex items-center justify-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>إضافة</span>
                </button>
              </div>

              {/* Quadrant 4: يوماً ما (Someday) */}
              <div className="p-3 rounded-2xl bg-white/[0.04] border border-zinc-700/40 space-y-2 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[175px]">
                <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-l from-zinc-500 to-zinc-700" />
                
                <div>
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                    <span className="w-5 h-5 rounded-full bg-zinc-700/30 text-zinc-400 text-[10px] font-mono font-bold flex items-center justify-center">
                      {qSomeday.filter(t => !t.completed).length}
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-zinc-400">
                      <span>يوماً ما</span>
                      <span className="text-zinc-500 text-xs">≡</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1.5">
                    {qSomeday.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggle(task.id)}
                        className="flex items-start gap-1.5 cursor-pointer group text-[11px] leading-tight"
                      >
                        <button className="mt-0.5 flex-shrink-0 text-zinc-500">
                          {task.completed ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Circle className="h-3.5 w-3.5" />}
                        </button>
                        <span className={`flex-1 transition-all ${task.completed ? 'line-through text-zinc-600' : 'text-zinc-300 group-hover:text-white'}`}>
                          {task.title}
                          {task.dateStr && <span className="block text-[9px] text-zinc-500 font-mono mt-0.5">{task.dateStr}</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setTargetQuadrant('someday');
                    setShowAddModal(true);
                  }}
                  className="w-full py-1 text-[10px] text-zinc-400 hover:text-white rounded-lg bg-white/[0.03] hover:bg-white/[0.07] transition-all flex items-center justify-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>إضافة</span>
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 2: 2026 YEAR PROGRESS & 12 CAPSULES (MATCHING IMAGE 2)   */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'year_progress' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            
            {/* Year Capsule Widget (Exact Match to Image 2) */}
            <div className="p-4 rounded-3xl apple-glass border border-white/10 space-y-3 shadow-xl">
              <div className="flex items-center justify-between pb-1 border-b border-white/5">
                <span className="text-2xl font-black font-mono text-white tracking-tight">{yearInfo.percentage}%</span>
                <span className="text-xl font-black font-mono text-white tracking-tight">{yearInfo.year}</span>
              </div>

              {/* 12 Capsules row */}
              <div className="grid grid-cols-12 gap-1.5 text-center font-mono py-1">
                {yearInfo.monthsCapsules.map((m, idx) => (
                  <div key={idx} className="flex flex-col items-center space-y-1.5">
                    {/* The Capsule Tube */}
                    <div className="w-5 h-11 rounded-full bg-white/[0.08] border border-white/10 p-0.5 overflow-hidden flex flex-col justify-end">
                      <div
                        className="w-full rounded-full bg-white transition-all duration-500"
                        style={{ height: `${m.fillPercentage}%` }}
                      />
                    </div>
                    {/* Month letter */}
                    <span className={`text-[11px] font-bold ${m.isCurrent ? 'text-white' : 'text-zinc-500'}`}>
                      {m.letter}
                    </span>
                  </div>
                ))}
              </div>

              {/* Days Info footer */}
              <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-zinc-400 border-t border-white/5">
                <span>أيام متبقية: {yearInfo.daysRemaining}</span>
                <span>مضى {yearInfo.percentage}% من السنة</span>
              </div>
            </div>

            {/* Full Month Calendar Widget (Exact Match to Image 2) */}
            <div className="p-3.5 rounded-3xl apple-glass border border-white/10 space-y-2.5 shadow-xl text-right" dir="rtl">
              {/* Header */}
              <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
                <span className="text-xs font-bold font-mono text-white tracking-wide">أكتوبر 2026</span>
                <span className="w-6 h-5 rounded-full bg-white text-black text-[11px] font-black font-mono flex items-center justify-center shadow-sm">
                  14
                </span>
              </div>

              {/* Day Headers (Right to Left: ن ث ر خ ج س ح) */}
              <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-zinc-400 pb-1 border-b border-white/5">
                <span>ن</span>
                <span>ث</span>
                <span>ر</span>
                <span>خ</span>
                <span>ج</span>
                <span>س</span>
                <span>ح</span>
              </div>

              {/* Days Grid with Color Event Chips */}
              <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px]">
                {[
                  // Week 1
                  { d: 28, cur: false, chips: ['تمرين 30...', 'اجتماع الفر...'] },
                  { d: 29, cur: false, chips: ['الرد على ل...', 'الرد على ي...'] },
                  { d: 30, cur: false, chips: ['الرد على ا...', 'طبيب الأسن...'] },
                  { d: 1, cur: true, chips: ['الرد على ر...', 'بادِل'] },
                  { d: 2, cur: true, chips: ['عشاء الفريق', 'دفع الفواتير'] },
                  { d: 3, cur: true, chips: ['يوغا', 'ترتيب الد...'] },
                  { d: 4, cur: true, chips: ['زيارة حدي...'] },

                  // Week 2
                  { d: 5, cur: true, chips: ['اجتماع الفر...'] },
                  { d: 6, cur: true, chips: ['الرد على ر...', 'النادي'] },
                  { d: 7, cur: true, chips: ['شراء أغرا...', 'قراءة 10...'] },
                  { d: 8, cur: true, chips: ['الرد على ا...', 'اجتماع فرد...'] },
                  { d: 9, cur: true, chips: ['تمرين 30...', 'ترتيب الم...'] },
                  { d: 10, cur: true, isToday: true, chips: ['رحلة إلى جدة', 'الرد على ا...'] },
                  { d: 11, cur: true, chips: ['تخطيط الأ...'] },

                  // Week 3
                  { d: 12, cur: true, chips: ['رحلة إلى جدة'] },
                  { d: 13, cur: true, chips: ['الفحص الس...', 'عرض تقديم...'] },
                  { d: 14, cur: true, chips: [] },
                  { d: 15, cur: true, chips: ['بادِل'] },
                  { d: 16, cur: true, chips: ['حفلة موسيق...'] },
                  { d: 17, cur: true, chips: ['يوغا'] },
                  { d: 18, cur: true, chips: ['شراء أغرا...'] },

                  // Week 4
                  { d: 19, cur: true, chips: ['عيد ميلاد أمي', 'اجتماع الفر...'] },
                  { d: 20, cur: true, chips: ['النادي'] },
                  { d: 21, cur: true, chips: ['إرجاع طل...'] },
                  { d: 22, cur: true, chips: ['بادِل'] },
                  { d: 23, cur: true, chips: [] },
                  { d: 24, cur: true, chips: ['يوغا', 'زواج صديقي'] },
                  { d: 25, cur: true, chips: ['تحضير ور...'] },

                  // Week 5
                  { d: 26, cur: true, chips: ['ورشة عمل', 'غداء الفريق'] },
                  { d: 27, cur: true, chips: ['النادي'] },
                  { d: 28, cur: true, chips: [] },
                  { d: 29, cur: true, chips: ['بادِل'] },
                  { d: 30, cur: true, chips: ['تجديد اشت...'] },
                  { d: 31, cur: true, chips: ['يوغا'] },
                  { d: 1, cur: false, chips: ['هايكنج'] },
                ].map((item, idx) => {
                  const getChipColor = (chipText: string) => {
                    if (chipText.includes('جدة') || chipText.includes('عيد') || chipText.includes('زواج') || chipText.includes('عشاء') || chipText.includes('حدي')) return 'bg-rose-500/90 text-white';
                    if (chipText.includes('تمرين') || chipText.includes('اجتماع') || chipText.includes('قراءة') || chipText.includes('تخطيط') || chipText.includes('عرض') || chipText.includes('تحضير')) return 'bg-sky-500/90 text-white';
                    if (chipText.includes('الرد') || chipText.includes('شراء') || chipText.includes('طبيب') || chipText.includes('حفلة') || chipText.includes('إرجاع') || chipText.includes('غداء') || chipText.includes('هايكنج') || chipText.includes('تجديد')) return 'bg-amber-600/90 text-white';
                    if (chipText.includes('بادِل') || chipText.includes('النادي') || chipText.includes('يوغا') || chipText.includes('الفحص')) return 'bg-emerald-600/90 text-white';
                    if (chipText.includes('ورشة')) return 'bg-purple-600/90 text-white';
                    if (chipText.includes('فواتير')) return 'bg-red-600/90 text-white';
                    return 'bg-zinc-700/80 text-zinc-200';
                  };

                  return (
                    <div key={idx} className="flex flex-col items-center min-h-[46px] p-0.5 rounded-lg hover:bg-white/5 transition-all">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        item.isToday 
                          ? 'bg-white text-black font-black ring-2 ring-white/50 shadow-md' 
                          : item.cur ? 'text-zinc-200' : 'text-zinc-600'
                      }`}>
                        {item.d}
                      </div>

                      {/* Event Chips List */}
                      <div className="w-full flex flex-col gap-0.5 mt-0.5">
                        {item.chips.slice(0, 2).map((chip, cIdx) => (
                          <div
                            key={cIdx}
                            className={`w-full py-0.2 px-0.5 rounded text-[7.5px] leading-tight truncate text-right font-sans font-medium ${getChipColor(chip)}`}
                            title={chip}
                          >
                            {chip}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Strategic Focus Card */}
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1.5 text-right">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 font-bold">
                  {periodFocus.periodTitle}
                </span>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                  <span>الهدف الاستراتيجي الحاكم</span>
                </span>
              </div>
              <p className="text-xs text-zinc-200 leading-relaxed font-sans">
                {periodFocus.focus}
              </p>
              {periodFocus.deadline && (
                <span className="text-[10px] text-zinc-400 block pt-0.5 font-mono">
                  الموعد المستهدف: {periodFocus.deadline}
                </span>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Bottom Hardware Shortcuts: Flashlight & Camera (Matching iPhone / Android Lockscreen in Images) */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-2 pb-6 max-w-md mx-auto w-full">
        {/* Camera Shortcut */}
        <button 
          onClick={() => alert('كاميرا شاشة القفل')}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white backdrop-blur-md transition-all active:scale-90 shadow-lg"
          title="الكاميرا"
        >
          <Camera className="h-5 w-5" />
        </button>

        {/* Swipe Page Dots */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
          <button 
            onClick={() => setActiveTab('matrix')}
            className={`h-2 rounded-full transition-all ${activeTab === 'matrix' ? 'w-5 bg-white shadow-sm' : 'w-2 bg-white/30'}`}
          />
          <button 
            onClick={() => setActiveTab('year_progress')}
            className={`h-2 rounded-full transition-all ${activeTab === 'year_progress' ? 'w-5 bg-white shadow-sm' : 'w-2 bg-white/30'}`}
          />
        </div>

        {/* Flashlight Shortcut */}
        <button 
          onClick={() => alert('فلاش شاشة القفل')}
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white backdrop-blur-md transition-all active:scale-90 shadow-lg"
          title="الفلاش"
        >
          <Flashlight className="h-5 w-5" />
        </button>
      </div>

      {/* Quick Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="apple-glass-elevated w-full max-w-sm rounded-3xl p-5 border border-white/10 space-y-3.5 text-right">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h3 className="text-sm font-bold text-white">إضافة مهمة جديدة</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="text-[11px] text-zinc-300 block mb-1">القسم المستهدف:</label>
                <select
                  value={targetQuadrant}
                  onChange={(e) => setTargetQuadrant(e.target.value as TaskQuadrant)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white"
                >
                  <option value="urgent_important">🔥 مهم وعاجل</option>
                  <option value="important">🟦 مهم</option>
                  <option value="urgent">⚡ عاجل</option>
                  <option value="someday">≡ يوماً ما</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-zinc-300 block mb-1">عنوان المهمة:</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="مثال: مراجعة العقد مع المحامي..."
                  className="w-full p-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-300 block mb-1">الوقت أو الموعد (اختياري):</label>
                <input
                  type="text"
                  value={newTaskTime}
                  onChange={(e) => setNewTaskTime(e.target.value)}
                  placeholder="مثال: 18:00 أو غداً"
                  className="w-full p-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-white focus:outline-none focus:border-white font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 rounded-xl bg-white/[0.05] text-zinc-300 text-xs"
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

    </div>
  );
};
