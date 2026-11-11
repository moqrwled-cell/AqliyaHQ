import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  FolderKanban, 
  Cpu, 
  Brain, 
  PhoneCall, 
  Settings, 
  Lock, 
  FileDown, 
  Circle,
  Sparkles,
  CalendarCheck,
  ShieldAlert,
  Compass
} from 'lucide-react';

interface HeaderHUDProps {
  onLock: () => void;
  onOpenVoiceCall: () => void;
  onOpenBriefing: () => void;
  onOpenWatchdog: () => void;
  watchdogCount: number;
  activeMainView: 'focus' | 'deck' | 'workspace' | 'vault_browser' | 'accounts' | 'swarm' | 'memory' | 'project_life' | 'opportunity_radar';
  onSelectMainView: (view: 'focus' | 'deck' | 'workspace' | 'vault_browser' | 'accounts' | 'swarm' | 'memory' | 'project_life' | 'opportunity_radar') => void;
  onExportMarkdown: () => void;
  onOpenSettings: () => void;
  isOnline: boolean;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  onLock,
  onOpenVoiceCall,
  onOpenBriefing,
  onOpenWatchdog,
  watchdogCount,
  activeMainView,
  onSelectMainView,
  onExportMarkdown,
  onOpenSettings,
  isOnline,
}) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 apple-glass border-b border-white/5 px-4 py-2.5 backdrop-blur-2xl flex-shrink-0">
      <div className="flex flex-wrap items-center justify-between gap-3 max-w-[1700px] mx-auto">
        
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectMainView('deck')}
            className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-b from-emerald-400 to-emerald-600 text-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 transition-all"
          >
            <Sparkles className="h-4.5 w-4.5 stroke-[2.5]" />
          </button>

          <div className="text-right">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                عـقـلـيـة
              </h1>
              <span className="text-xs text-zinc-400 font-medium">| المساعد الشخصي الذكي</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Circle className={`h-1.5 w-1.5 fill-current ${isOnline ? 'text-emerald-400' : 'text-amber-400'}`} />
                <span>{isOnline ? 'مزامنة سحابية متصلة' : 'الوضع المحلي أوفلاين'}</span>
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-emerald-400 font-medium">محمد قرمان</span>
            </div>
          </div>
        </div>

        {/* Navigation & Section Switches */}
        <div className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1 rounded-2xl border border-white/5">
          <button
            onClick={() => onSelectMainView('focus')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeMainView === 'focus'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>خطة اليوم 🎯</span>
          </button>

          <button
            onClick={() => onSelectMainView('deck')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeMainView === 'deck'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            غرفة التحكم
          </button>

          <button
            onClick={() => onSelectMainView('workspace')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeMainView === 'workspace'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>بيئة العمل التكتيكية</span>
          </button>

          <button
            onClick={() => onSelectMainView('project_life')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeMainView === 'project_life'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FolderKanban className="h-3.5 w-3.5 text-emerald-400" />
            <span>المشاريع والحياة (19)</span>
          </button>

          <button
            onClick={() => onSelectMainView('opportunity_radar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeMainView === 'opportunity_radar'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Compass className="h-3.5 w-3.5 text-emerald-400" />
            <span>رادار الفرص والأفكار</span>
          </button>

          <button
            onClick={() => onSelectMainView('vault_browser')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeMainView === 'vault_browser'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>مستكشف Obsidian</span>
          </button>

          <button
            onClick={() => onSelectMainView('accounts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeMainView === 'accounts'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <KeyRound className="h-3.5 w-3.5 text-emerald-400" />
            <span>خزينة الحسابات</span>
          </button>

          <button
            onClick={() => onSelectMainView('swarm')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeMainView === 'swarm'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Cpu className="h-3.5 w-3.5 text-emerald-400" />
            <span>فريق الوكلاء</span>
          </button>

          <button
            onClick={() => onSelectMainView('memory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeMainView === 'memory'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Brain className="h-3.5 w-3.5 text-emerald-400" />
            <span>الملف والذاكرة</span>
          </button>
        </div>

        {/* Operational Quick Actions */}
        <div className="flex items-center gap-2">
          
          {/* Daily SITREP Trigger */}
          <button
            onClick={onOpenBriefing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-zinc-200 transition-all active:scale-95"
            title="جلسة الانطلاق الصباحي واستخلاص المساء"
          >
            <CalendarCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">إحاطة اليوم</span>
          </button>

          {/* Watchdog Alert */}
          {watchdogCount > 0 && (
            <button
              onClick={onOpenWatchdog}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all active:scale-95"
              title="تنبيهات المتابعة والركود"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
              <span>{watchdogCount}</span>
            </button>
          )}

          {/* Voice Call */}
          <button
            onClick={onOpenVoiceCall}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-semibold text-emerald-300 active:scale-95 transition-all"
            title="محادثة صوتية سريعة مع المستشار"
          >
            <PhoneCall className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden lg:inline">محادثة صوتية</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 text-zinc-400 hover:text-white transition-all active:scale-95"
            title="الإعدادات"
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Lock Screen */}
          <button
            onClick={onLock}
            className="p-2 rounded-xl bg-white/[0.03] hover:bg-rose-500/10 border border-white/10 text-zinc-400 hover:text-rose-400 transition-all active:scale-95"
            title="قفل التطبيق"
          >
            <Lock className="h-4 w-4" />
          </button>

          {/* Time display */}
          <div className="hidden xl:block text-xs text-zinc-400 font-mono pr-2 border-r border-white/10">
            {timeStr}
          </div>

        </div>
      </div>
    </header>
  );
};
