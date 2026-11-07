import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  Lock, 
  FileDown, 
  PhoneCall, 
  Sparkles,
  Settings,
  Layers,
  Circle
} from 'lucide-react';
import { tacticalAudio } from '../lib/audio';

interface HeaderHUDProps {
  onLock: () => void;
  onOpenVoiceCall: () => void;
  onTriggerSITREP: () => void;
  onExportMarkdown: () => void;
  onOpenSettings: () => void;
  isOnline: boolean;
  activeLayout: 'tri-panel' | 'focused';
  onToggleLayout: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  onLock,
  onOpenVoiceCall,
  onTriggerSITREP,
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
    <header className="sticky top-0 z-40 bg-[#09090b]/90 border-b craft-border px-4 py-2.5 backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3 max-w-[1700px] mx-auto">
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
                v1.0.0
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-telemetry text-zinc-400 mt-0.5">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Circle className={`h-1.5 w-1.5 fill-current ${isOnline ? 'text-emerald-500' : 'text-amber-500'}`} />
                <span>{isOnline ? 'SUPABASE // REALTIME' : 'OFFLINE MODE'}</span>
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400">NEXUS-CORE: ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Operational Actions */}
        <div className="flex items-center gap-2">
          {/* SITREP Button */}
          <button
            onClick={() => {
              tacticalAudio.playAlert();
              onTriggerSITREP();
            }}
            className="flex items-center gap-1.5 rounded-lg border craft-border bg-zinc-900/80 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:text-white hover:bg-zinc-800/80 active:scale-95 transition-all"
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
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 active:scale-95 transition-all"
            title="اتصال لاسلكي مباشر مع المستشار"
          >
            <PhoneCall className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden sm:inline">مكالمة العمليات</span>
          </button>

          {/* Obsidian Export */}
          <button
            onClick={() => {
              tacticalAudio.playConfirm();
              onExportMarkdown();
            }}
            className="flex items-center gap-1.5 rounded-lg border craft-border bg-zinc-900/60 px-2.5 py-1.5 text-xs font-telemetry text-zinc-300 hover:text-white hover:bg-zinc-800/80 active:scale-95 transition-all"
            title="تصدير المقر إلى Obsidian Markdown Vault"
          >
            <FileDown className="h-3.5 w-3.5 text-zinc-400" />
            <span className="hidden lg:inline">تصدير Vault</span>
          </button>

          {/* Layout Toggle */}
          <button
            onClick={() => {
              tacticalAudio.playBlip();
              onToggleLayout();
            }}
            className="hidden lg:flex items-center gap-1.5 rounded-lg border craft-border bg-zinc-900/60 px-2.5 py-1.5 text-xs font-telemetry text-zinc-300 hover:text-white hover:bg-zinc-800/80 active:scale-95 transition-all"
            title="تبديل ترتيب الشاشات"
          >
            <Layers className="h-3.5 w-3.5 text-zinc-400" />
            <span>{activeLayout === 'tri-panel' ? 'ثلاثي' : 'مركز'}</span>
          </button>

          {/* Settings Modal Trigger */}
          <button
            onClick={() => {
              tacticalAudio.playBlip();
              onOpenSettings();
            }}
            className="flex items-center justify-center rounded-lg border craft-border bg-zinc-900/60 p-2 text-zinc-300 hover:text-white hover:bg-zinc-800/80 active:scale-95 transition-all"
            title="إعدادات المفاتيح والنظام"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>

          {/* Military Time */}
          <div className="hidden sm:flex items-center rounded-lg border craft-border bg-black/40 px-2.5 py-1 text-xs font-telemetry text-zinc-300">
            {timeStr}
          </div>

          {/* Lock Fortress */}
          <button
            onClick={() => {
              tacticalAudio.playAlert();
              onLock();
            }}
            className="flex items-center justify-center rounded-lg border craft-border bg-zinc-900/60 p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 active:scale-95 transition-all"
            title="قفل الثكنة"
          >
            <Lock className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
