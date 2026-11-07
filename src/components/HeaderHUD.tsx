import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Shield, 
  Lock, 
  FileDown, 
  Cpu, 
  PhoneCall, 
  Zap, 
  Layers, 
  Wifi, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { tacticalAudio } from '../lib/audio';

interface HeaderHUDProps {
  onLock: () => void;
  onOpenVoiceCall: () => void;
  onTriggerSITREP: () => void;
  onExportMarkdown: () => void;
  onExportJSON: () => void;
  isOnline: boolean;
  activeLayout: 'tri-panel' | 'focused';
  onToggleLayout: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  onLock,
  onOpenVoiceCall,
  onTriggerSITREP,
  onExportMarkdown,
  onExportJSON,
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
    <header className="hud-panel sticky top-0 z-40 border-b border-slate-800/80 px-4 py-2.5 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Operational Status */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/40 glow-emerald">
            <Radio className="h-5 w-5 text-emerald-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>عـقـلـيـة</span>
                <span className="text-[11px] font-mono-hud text-slate-400 font-normal">| AQLIYA HQ</span>
              </h1>
              <span className="rounded bg-emerald-950/60 px-1.5 py-0.5 text-[10px] font-mono-hud font-semibold text-emerald-400 border border-emerald-800/50">
                WAR ROOM HUD
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono-hud text-slate-400">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span>SECURE // SUPABASE REALTIME</span>
              </span>
              <span className="hidden sm:inline-block text-slate-600">•</span>
              <span className="hidden sm:flex items-center gap-1 text-slate-300">
                <Cpu className="h-3 w-3 text-cyan-400" />
                <span>NEXUS-CORE: ACTIVE</span>
              </span>
            </div>
          </div>
        </div>

        {/* Tactical Actions Center */}
        <div className="flex items-center gap-2">
          {/* SITREP Button */}
          <button
            onClick={() => {
              tacticalAudio.playAlert();
              onTriggerSITREP();
            }}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 active:scale-95 transition-all shadow-sm"
            title="موجز الموقف اليومي"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden md:inline">موجز SITREP</span>
          </button>

          {/* Hands-Free Voice Call */}
          <button
            onClick={() => {
              tacticalAudio.playConfirm();
              onOpenVoiceCall();
            }}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 active:scale-95 transition-all shadow-sm glow-cyan"
            title="اتصال لاسلكي مباشر مع المستشار"
          >
            <PhoneCall className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden sm:inline">اتصال مباشر</span>
          </button>

          {/* Obsidian Export */}
          <div className="relative group">
            <button
              onClick={() => {
                tacticalAudio.playConfirm();
                onExportMarkdown();
              }}
              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900/60 px-2.5 py-1.5 text-xs font-mono-hud text-slate-300 hover:border-slate-500 hover:text-white active:scale-95 transition-all"
              title="تصدير المقر إلى Obsidian Markdown Vault"
            >
              <FileDown className="h-3.5 w-3.5 text-purple-400" />
              <span className="hidden lg:inline">تصدير Obsidian</span>
            </button>
          </div>

          {/* Layout Toggle (Desktop only) */}
          <button
            onClick={() => {
              tacticalAudio.playBlip();
              onToggleLayout();
            }}
            className="hidden lg:flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900/60 px-2.5 py-1.5 text-xs font-mono-hud text-slate-300 hover:border-slate-500 active:scale-95 transition-all"
            title="تبديل ترتيب الشاشات"
          >
            <Layers className="h-3.5 w-3.5 text-slate-400" />
            <span>{activeLayout === 'tri-panel' ? 'ثلاثي مرن' : 'شاشة كاملة'}</span>
          </button>

          {/* Military Time */}
          <div className="hidden sm:flex items-center rounded-lg border border-slate-800 bg-[#07090e] px-2.5 py-1 text-xs font-mono-hud font-bold text-emerald-400">
            {timeStr}
          </div>

          {/* Lock Fortress */}
          <button
            onClick={() => {
              tacticalAudio.playAlert();
              onLock();
            }}
            className="flex items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20 active:scale-95 transition-all"
            title="قفل الثكنة"
          >
            <Lock className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
