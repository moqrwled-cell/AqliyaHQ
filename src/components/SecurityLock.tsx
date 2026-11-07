import React, { useState } from 'react';
import { ShieldCheck, Fingerprint, Lock, KeyRound, AlertTriangle } from 'lucide-react';
import { tacticalAudio } from '../lib/audio';

interface SecurityLockProps {
  onUnlock: () => void;
}

export const SecurityLock: React.FC<SecurityLockProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  // Stored PIN or default 1337 / 0000
  const correctPin = localStorage.getItem('aqliya_master_pin') || '1337';

  const handleDigit = (digit: string) => {
    tacticalAudio.playBlip();
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        if (nextPin === correctPin) {
          tacticalAudio.playConfirm();
          onUnlock();
        } else {
          tacticalAudio.playAlert();
          setError(true);
          setTimeout(() => setPin(''), 600);
        }
      }
    }
  };

  const handleClear = () => {
    tacticalAudio.playBlip();
    setPin('');
    setError(false);
  };

  const handleBiometric = () => {
    tacticalAudio.playConfirm();
    onUnlock();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#06070a] bg-grid-tactical p-4">
      <div className="hud-panel w-full max-w-sm rounded-2xl border border-emerald-500/30 p-8 shadow-2xl relative overflow-hidden">
        {/* Radar scanline */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent h-16 w-full animate-pulse pointer-events-none" />

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 glow-emerald">
            <ShieldCheck className="h-9 w-9 text-emerald-400" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white mb-1">
            عقلية | AQLIYA HQ
          </h2>
          <p className="text-xs font-mono-hud text-emerald-400/80 mb-6 uppercase tracking-widest">
            // RESTRICTED PROTOCOL // FORTRESS LOCK
          </p>

          {/* PIN Indicators */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`h-4 w-4 rounded-full border transition-all duration-300 ${
                  error
                    ? 'border-red-500 bg-red-500/50 scale-110'
                    : pin.length > idx
                    ? 'border-emerald-400 bg-emerald-400 glow-emerald scale-110'
                    : 'border-slate-700 bg-slate-900'
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 text-xs font-mono-hud text-red-400 animate-bounce">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>رمز غير مصرح به // ACCESS DENIED</span>
            </div>
          )}

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-3 w-full mb-6">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                onClick={() => handleDigit(digit)}
                className="h-14 rounded-xl border border-slate-800 bg-slate-900/60 text-lg font-mono-hud font-bold text-slate-200 hover:border-emerald-500/40 hover:bg-emerald-500/10 active:scale-95 transition-all"
              >
                {digit}
              </button>
            ))}
            <button
              onClick={handleClear}
              className="h-14 rounded-xl border border-slate-800 bg-slate-900/40 text-xs font-mono-hud text-slate-400 hover:text-slate-200 active:scale-95 transition-all"
            >
              مسح
            </button>
            <button
              onClick={() => handleDigit('0')}
              className="h-14 rounded-xl border border-slate-800 bg-slate-900/60 text-lg font-mono-hud font-bold text-slate-200 hover:border-emerald-500/40 hover:bg-emerald-500/10 active:scale-95 transition-all"
            >
              0
            </button>
            <button
              onClick={handleBiometric}
              className="h-14 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all"
              title="بصمة القائد"
            >
              <Fingerprint className="h-6 w-6" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono-hud">
            <Lock className="h-3 w-3 text-slate-600" />
            <span>الرمز الافتراضي: 1337 أو انقر البصمة</span>
          </div>
        </div>
      </div>
    </div>
  );
};
