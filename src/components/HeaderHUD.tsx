import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Lock, 
  FileDown, 
  PhoneCall, 
  Sparkles, 
  Settings, 
  Layers, 
  Circle,
  ShieldAlert,
  Brain,
  CalendarCheck,
  Bot,
  Cpu
} from 'lucide-react';
import { tacticalAudio } from '../lib/audio';

interface HeaderHUDProps {
  onLock: () => void;
  onOpenVoiceCall: () => void;
  onOpenBriefing: () => void;
  onOpenWatchdog: () => void;
  watchdogCount: number;
  activeMainView: 'deck' | 'vault' | 'swarm';
  onToggleMindVault: () => void;
  onToggleSwarm: () => void;
  onExportMarkdown: () => void;
  onOpenSettings: () => void;
  isOnline: boolean;
  activeLayout: 'tri-panel' | 'focused';
  onToggleLayout: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  onLock,
  onOpenVoiceCall,
  onOpenBriefing,
  onOpenWatchdog,
  watchdogCount,
  activeMainView,
  onToggleMindVault,
  onToggleSwarm,
  onExportMarkdown,
  onOpenSettings,
  isOnline,
  activeLayout,
  onToggleLayout,
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
    <header className="sticky top-0 z-40 bg-[#09090b]/90 border-b craft-border px-3 sm:px-4 py-2.5 backdrop-blur-md flex-shrink-0">
      <div className="flex flex-wrap items-center justify-between gap-2.5 max-w-[1700px] mx-auto">
        
        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border craft-border text-zinc-100 shadow-sm">
            <Radio className="h-4 w-4 text-emerald-400" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-zinc-100">
                عـقـلـيـة
              </h1>
              <span className="text-[11px] font-telemetry text-zinc-500 font-normal">/ AQLIYA HQ</span>
              <span className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-[10px] font-telemetry text-zinc-300 border craft-border">
                AGENTIC OS
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-telemetry text-zinc-400 mt-0.5">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Circle className={`h-1.5 w-1.5 fill-current ${isOnline ? 'text-emerald-500' : 'text-amber-500'}`} />
                <span>{isOnline ? 'SUPABASE // REALTIME' : 'OFFLINE MODE'}</span>
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-cyan-400 font-bold">SWARM: 5 AGENTS READY</span>
            </div>
          </div>
        </div>

        {/* Operational Actions */}
        <div className="flex items-center gap-2">
          
          {/* Agent Swarm Deck Toggle */}
          <button
            onClick={() => {
              tacticalAudio.playBlip();
              onToggleSwarm();
            }}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-telemetry transition-all active:scale-95 ${
              activeMainView === 'swarm'
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                : 'bg-zinc-900/80 border craft-border text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
            title="غرفة عمليات أسطول الوكلاء الذاتي (Agentic OS)"
          >
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">أسطول الوكلاء</span>
          </button>

          {/* Watchdog Radar Alert Button */}
          <button
            onClick={() => {
              tacticalAudio.playAlert();
              onOpenWatchdog();
            }}
            className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-telemetry transition-all active:scale-95 ${
              watchdogCount > 0
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                : 'bg-zinc-900/60 border craft-border text-zinc-400 hover:text-zinc-200'
            }`}
            title="رادار الرقابة والمتابعة التكتيكية (ما نسيته المنظومة)"
          >
            <ShieldAlert className={`h-3.5 w-3.5 ${watchdogCount > 0 ? 'text-amber-400 animate-pulse' : 'text-zinc-400'}`} />
            <span>الرقابة</span>
            {watchdogCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                {watchdogCount}
              </span>
            )}
          </button>

          {/* Daily SITREP Briefing Trigger */}
          <button
            onClick={() => {
              tacticalAudio.playConfirm();
              onOpenBriefing();
            }}
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-900/50 active:scale-95 transition-all shadow-sm"
            title="إحاطة الموقف اليومي ومساءلة القائد"
          >
            <CalendarCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">إحاطة SITREP</span>
          </button>

          {/* Mind Vault Toggle (عقلية القائد والذاكرة التراكمية) */}
          <button
            onClick={() => {
              tacticalAudio.playBlip();
              onToggleMindVault();
            }}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
              activeMainView === 'vault'
                ? 'bg-purple-950/60 border-purple-500/60 text-purple-200 font-bold shadow-md'
                : 'bg-zinc-900/80 border craft-border text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
            title="مستودع العقل والذاكرة التراكمية للقائد"
          >
            <Brain className="h-3.5 w-3.5 text-purple-400" />
            <span className="hidden md:inline">مستودع العقل</span>
          </button>

          {/* Hands-Free Voice Call */}
          <button
            onClick={() => {
              tacticalAudio.playConfirm();
              onOpenVoiceCall();
            }}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 active:scale-95 transition-all"
            title="اتصال لاسلكي مباشر مع المستشار"
          >
            <PhoneCall className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden lg:inline">مكالمة العمليات</span>
          </button>

          {/* Obsidian Vault Export */}
          <button
            onClick={() => {
              tacticalAudio.playConfirm();
              onExportMarkdown();
            }}
            className="hidden xl:flex items-center gap-1.5 rounded-lg border craft-border bg-zinc-900/60 px-2.5 py-1.5 text-xs font-telemetry text-zinc-300 hover:text-white hover:bg-zinc-800/80 active:scale-95 transition-all"
            title="تصدير المقر إلى Obsidian Markdown Vault"
          >
            <FileDown className="h-3.5 w-3.5 text-zinc-400" />
            <span>Obsidian</span>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="rounded-lg border craft-border bg-zinc-900/80 p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 active:scale-95 transition-all"
            title="إعدادات المنظومة ونموذج الذكاء الاصطناعي"
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Security Lock Button */}
          <button
            onClick={() => {
              tacticalAudio.playAlert();
              onLock();
            }}
            className="rounded-lg border craft-border bg-zinc-900/80 p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 active:scale-95 transition-all"
            title="قفل فوري لغرفة العمليات"
          >
            <Lock className="h-4 w-4" />
          </button>

          {/* Clock Display */}
          <div className="hidden 2xl:flex items-center gap-2 pl-2 border-l craft-border text-xs font-telemetry text-zinc-400">
            <span>{timeStr}</span>
            <span className="text-[10px] text-zinc-600">GZA</span>
          </div>

        </div>
      </div>
    </header>
  );
};
