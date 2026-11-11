import React, { useEffect, useState } from 'react';
import { AlarmEngine } from '../../lib/alarm/alarmEngine';
import type { AlarmItem } from '../../lib/alarm/alarmEngine';
import { AlarmClock, BellOff, Hourglass, Volume2 } from 'lucide-react';

export const AlarmRingingOverlay: React.FC = () => {
  const [ringingAlarm, setRingingAlarm] = useState<AlarmItem | null>(null);

  useEffect(() => {
    // Start continuous monitoring on mount
    AlarmEngine.startMonitoring();

    const handleTriggered = (e: any) => {
      if (e.detail) {
        setRingingAlarm(e.detail);
      }
    };

    const handleDismissed = () => {
      setRingingAlarm(null);
    };

    window.addEventListener('moha:alarm-triggered', handleTriggered);
    window.addEventListener('moha:alarm-dismissed', handleDismissed);

    return () => {
      window.removeEventListener('moha:alarm-triggered', handleTriggered);
      window.removeEventListener('moha:alarm-dismissed', handleDismissed);
    };
  }, []);

  if (!ringingAlarm) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 text-center select-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl p-6 bg-gradient-to-b from-red-950/80 via-zinc-950 to-black border-2 border-red-500/50 shadow-2xl shadow-red-950/80 flex flex-col items-center">
        
        {/* Pulsing Alarm Icon */}
        <div className="relative mb-5">
          <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center animate-ping absolute inset-0" />
          <div className="relative w-24 h-24 rounded-full bg-red-600/30 border-2 border-red-400 flex items-center justify-center shadow-lg shadow-red-600/50">
            <AlarmClock className="h-12 w-12 text-white animate-bounce" />
          </div>
        </div>

        {/* Time & Label */}
        <span className="text-4xl font-black font-mono tracking-wider text-white mb-2">
          {ringingAlarm.time}
        </span>
        <h3 className="text-lg font-bold text-red-200 mb-1">
          {ringingAlarm.label}
        </h3>
        <p className="text-xs text-zinc-400 mb-6 flex items-center justify-center gap-1.5">
          <Volume2 className="h-3.5 w-3.5 text-red-400 animate-pulse" />
          <span>المنبه يرن الآن بنشاط كامل يا قائد محمد!</span>
        </p>

        {/* Action Controls */}
        <div className="w-full space-y-2.5">
          <button
            onClick={() => AlarmEngine.dismissAlarm()}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm shadow-lg shadow-red-600/40 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <BellOff className="h-5 w-5" />
            <span>إيقاف المنبه واستيقاظ الآن (Dismiss)</span>
          </button>

          <button
            onClick={() => AlarmEngine.snoozeAlarm(5)}
            className="w-full py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-zinc-300 font-semibold text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Hourglass className="h-4 w-4 text-amber-400" />
            <span>غفوة 5 دقائق (Snooze)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
