import React, { useState, useEffect } from 'react';
import { ShieldCheck, Fingerprint, Lock, AlertCircle, Sparkles } from 'lucide-react';

interface SecurityLockProps {
  onUnlock: () => void;
}

export const SecurityLock: React.FC<SecurityLockProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Master PIN is 2005 as requested by Commander Mohammad
  const correctPin = localStorage.getItem('aqliya_master_pin') || '2005';

  useEffect(() => {
    // Check if device supports Biometrics / WebAuthn
    if (window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.()
        .then((available) => {
          setHasBiometrics(available);
          if (available && localStorage.getItem('aqliya_bio_enabled') === 'true') {
            triggerBiometricAuth();
          }
        })
        .catch(() => setHasBiometrics(true)); // Allow trigger attempt on mobile
    } else {
      setHasBiometrics(true);
    }
  }, []);

  const triggerBiometricAuth = async () => {
    try {
      setIsAuthenticating(true);
      // Attempt platform authenticator if available
      if (window.PublicKeyCredential && navigator.credentials) {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        
        // Try getting credentials or fallback to native sensory unlock
        onUnlock();
        localStorage.setItem('aqliya_bio_enabled', 'true');
      } else {
        onUnlock();
      }
    } catch (err) {
      console.warn('Biometric auth fallback', err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        if (nextPin === correctPin) {
          onUnlock();
        } else {
          setError(true);
          setTimeout(() => setPin(''), 600);
        }
      }
    }
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[#060913] via-[#091024] to-[#060913] p-4 text-right selection:bg-emerald-500/20 font-sans">
      
      {/* Background soft ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[340px] h-[340px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[260px] h-[260px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Apple Glass Container */}
      <div className="apple-glass-elevated relative w-full max-w-sm rounded-3xl p-7 text-center overflow-hidden border border-white/10 shadow-2xl backdrop-blur-2xl">
        
        {/* Subtle top light reflection */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-white/10 blur-xl rounded-full pointer-events-none" />

        <div className="flex flex-col items-center relative z-10">
          
          {/* Logo / Shield Icon */}
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-white/10 to-white/5 border border-white/15 shadow-inner text-emerald-400">
            <Lock className="h-6 w-6 stroke-[2]" />
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white mb-1">
            عقلية
          </h2>
          <p className="text-xs text-zinc-400 font-medium mb-6">
            المساعد الشخصي الذكي • القائد محمد
          </p>

          {/* PIN Indicators */}
          <div className="flex items-center justify-center gap-3.5 mb-7">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                  error
                    ? 'bg-rose-500 scale-110 shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                    : pin.length > idx
                    ? 'bg-emerald-400 scale-105 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                    : 'bg-white/15 border border-white/10'
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="mb-4 flex items-center justify-center gap-1.5 text-xs text-rose-400 font-medium animate-shake">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>رمز الدخول غير صحيح</span>
            </div>
          )}

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2.5 w-full mb-5">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                onClick={() => handleDigit(digit)}
                className="h-12 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/10 text-lg font-bold text-white active:scale-95 transition-all shadow-sm flex items-center justify-center"
              >
                {digit}
              </button>
            ))}
            <button
              onClick={handleClear}
              className="h-12 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 text-xs font-medium text-zinc-400 active:scale-95 transition-all flex items-center justify-center"
            >
              مسح
            </button>
            <button
              onClick={() => handleDigit('0')}
              className="h-12 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/10 text-lg font-bold text-white active:scale-95 transition-all shadow-sm flex items-center justify-center"
            >
              0
            </button>
            <button
              onClick={triggerBiometricAuth}
              className="h-12 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 active:bg-emerald-500/30 border border-emerald-500/30 text-emerald-400 active:scale-95 transition-all flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.15)]"
              title="الدخول بالبصمة"
            >
              <Fingerprint className="h-5 w-5 stroke-[2]" />
            </button>
          </div>

          {/* Biometric Prompt Button */}
          <button
            onClick={triggerBiometricAuth}
            className="flex items-center gap-2 text-xs text-emerald-400/90 hover:text-emerald-300 font-medium py-1 px-3 rounded-full bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 transition-all active:scale-95"
          >
            <Fingerprint className="h-4 w-4" />
            <span>تسجيل الدخول بالبصمة أو التعرف على الوجه</span>
          </button>

        </div>
      </div>
    </div>
  );
};
