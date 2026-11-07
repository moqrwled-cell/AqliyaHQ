import React, { useState } from 'react';
import { ShieldCheck, Fingerprint, Lock, AlertTriangle } from 'lucide-react';
import { tacticalAudio } from '../lib/audio';

interface SecurityLockProps {
  onUnlock: () => void;
}

export const SecurityLock: React.FC<SecurityLockProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090b] p-4 text-right">
      <div className="craft-surface-elevated w-full max-w-sm rounded-3xl p-8 text-center relative overflow-hidden">
        <div className="flex flex-col items-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-800/80 border craft-border text-zinc-100 shadow-sm">
            <ShieldCheck className="h-7 w-7 text-emerald-400" />
          </div>

          <h2 className="text-xl font-bold tracking-tight text-zinc-100 mb-0.5">
            عقلية | AQLIYA HQ
          </h2>
          <p className="text-[11px] font-telemetry text-zinc-500 mb-6 uppercase tracking-wider">
            // COMMAND PROTOCOL // SECURE ACCESS
          </p>

          {/* PIN Indicators */}
          <div className="flex items-center justify-center gap-3.5 mb-7">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`h-3.5 w-3.5 rounded-full border transition-all duration-200 ${
                  error
                    ? 'border-red-500 bg-red-500'
                    : pin.length > idx
                    ? 'border-zinc-100 bg-zinc-100'
                    : 'border-zinc-700 bg-zinc-900'
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-1.5 text-xs font-telemetry text-red-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>رمز غير مصرح به // ACCESS DENIED</span>
            </div>
          )}

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2.5 w-full mb-6">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                onClick={() => handleDigit(digit)}
                className="h-13 rounded-xl border craft-border bg-zinc-900/60 text-base font-telemetry font-bold text-zinc-100 hover:bg-zinc-800 hover:text-white active:scale-95 transition-all shadow-sm"
              >
                {digit}
              </button>
            ))}
            <button
              onClick={handleClear}
              className="h-13 rounded-xl border craft-border bg-zinc-900/40 text-xs font-telemetry text-zinc-400 hover:text-zinc-200 active:scale-95 transition-all"
            >
              مسح
            </button>
            <button
              onClick={() => handleDigit('0')}
              className="h-13 rounded-xl border craft-border bg-zinc-900/60 text-base font-telemetry font-bold text-zinc-100 hover:bg-zinc-800 hover:text-white active:scale-95 transition-all shadow-sm"
            >
              0
            </button>
            <button
              onClick={handleBiometric}
              className="h-13 rounded-xl border craft-border bg-zinc-800/80 flex items-center justify-center text-emerald-400 hover:bg-zinc-700 active:scale-95 transition-all"
              title="بصمة القائد"
            >
              <Fingerprint className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-telemetry">
            <Lock className="h-3 w-3" />
            <span>الرمز: 1337 أو انقر البصمة</span>
          </div>
        </div>
      </div>
    </div>
  );
};
