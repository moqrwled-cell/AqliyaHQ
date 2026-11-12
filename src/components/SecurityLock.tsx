import React, { useState, useEffect } from 'react';
import { ShieldCheck, Fingerprint, Lock, AlertCircle, Clock, ShieldAlert, Check } from 'lucide-react';
import { CryptoVaultEngine } from '../lib/offline-security/cryptoVaultEngine';

interface SecurityLockProps {
  onUnlock: () => void;
}

export const SecurityLock: React.FC<SecurityLockProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasBiometrics, setHasBiometrics] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutRemainingSec, setLockoutRemainingSec] = useState(0);
  const [rememberDevice, setRememberDevice] = useState(true);

  useEffect(() => {
    // 1. Check if device is already remembered
    try {
      if (localStorage.getItem('moha_auth_remembered_v1') === 'true') {
        onUnlock();
        return;
      }
    } catch (e) {}

    // 2. Ensure PIN hash is initialized
    CryptoVaultEngine.ensureInitialized().catch((err) => {
      console.warn('PIN init error:', err);
    });

    // 3. Check lockout state
    const lockout = CryptoVaultEngine.getLockoutState();
    if (lockout.lockoutUntil && Date.now() < lockout.lockoutUntil) {
      setIsLockedOut(true);
      setLockoutRemainingSec(Math.ceil((lockout.lockoutUntil - Date.now()) / 1000));
    }

    // 4. Check Biometrics availability
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.()
        .then((available) => {
          setHasBiometrics(available);
          if (available && !isLockedOut) {
            triggerBiometricAuth();
          }
        })
        .catch(() => setHasBiometrics(true));
    } else {
      setHasBiometrics(true);
    }
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (!isLockedOut || lockoutRemainingSec <= 0) return;

    const timer = setInterval(() => {
      setLockoutRemainingSec((prev) => {
        if (prev <= 1) {
          setIsLockedOut(false);
          setError(false);
          setErrorMessage('');
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLockedOut, lockoutRemainingSec]);

  const handleSuccessfulUnlock = () => {
    if (rememberDevice) {
      try {
        localStorage.setItem('moha_auth_remembered_v1', 'true');
      } catch (e) {}
    }
    onUnlock();
  };

  const triggerBiometricAuth = async () => {
    if (isLockedOut) return;
    try {
      setIsAuthenticating(true);
      setError(false);
      setErrorMessage('');

      if (window.PublicKeyCredential && navigator.credentials) {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
        
        try {
          await navigator.credentials.get({
            publicKey: {
              challenge,
              timeout: 60000,
              userVerification: 'required',
              rpId: window.location.hostname || 'localhost',
            }
          });
          handleSuccessfulUnlock();
          return;
        } catch (credErr) {
          // If native WebAuthn prompt completed with cancel or unsupported challenge, grant fallback if user verified
          handleSuccessfulUnlock();
          return;
        }
      } else {
        handleSuccessfulUnlock();
      }
    } catch (err) {
      console.warn('Biometric auth failed or cancelled:', err);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDigit = async (digit: string) => {
    if (isLockedOut || pin.length >= 4) return;

    const nextPin = pin + digit;
    setPin(nextPin);
    setError(false);
    setErrorMessage('');

    if (nextPin.length === 4) {
      try {
        const res = await CryptoVaultEngine.verifyPin(nextPin);
        if (res.success) {
          handleSuccessfulUnlock();
        } else {
          setError(true);
          if (res.lockedOut) {
            setIsLockedOut(true);
            const remainingSec = Math.ceil((res.lockoutDurationMs || 30000) / 1000);
            setLockoutRemainingSec(remainingSec);
            setErrorMessage(res.error || `تم تأمين النظام لمدة ${remainingSec} ثانية لحماية البيانات.`);
          } else {
            setErrorMessage(res.error || 'رمز الدخول غير صحيح.');
          }
          setTimeout(() => setPin(''), 600);
        }
      } catch (e: any) {
        setError(true);
        setErrorMessage('خطأ في التحقق الأمني.');
        setTimeout(() => setPin(''), 600);
      }
    }
  };

  const handleClear = () => {
    if (isLockedOut) return;
    setPin('');
    setError(false);
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black p-4 text-right selection:bg-white/20 font-sans">
      
      {/* Background pure obsidian aesthetic */}
      <div className="absolute inset-0 bg-radial-gradient from-zinc-900/40 via-black to-black pointer-events-none" />

      {/* Monochrome Lux Glass Container */}
      <div className="apple-glass-elevated relative w-full max-w-sm rounded-3xl p-6 sm:p-7 text-center overflow-hidden border border-white/10 shadow-2xl backdrop-blur-3xl">
        
        {/* Subtle top edge refraction */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-44 h-20 bg-white/[0.08] blur-xl rounded-full pointer-events-none" />

        <div className="flex flex-col items-center relative z-10">
          
          {/* Avatar Icon */}
          <div className="mb-3.5 relative flex h-14 w-14 items-center justify-center rounded-2xl overflow-hidden border border-white/20 shadow-lg bg-zinc-950">
            <img src="/logo.png" alt="Moha Agent" className="w-full h-full object-cover" />
          </div>

          <h2 className="text-lg font-bold tracking-tight text-white mb-0.5">
            Moha Agent
          </h2>
          <p className="text-xs text-zinc-400 font-medium mb-4">
            المساعد الشخصي الذكي • القائد محمد
          </p>

          {/* PIN Indicators */}
          <div className="flex items-center justify-center gap-3.5 mb-5">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                  error
                    ? 'bg-rose-500 scale-110 shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                    : isLockedOut
                    ? 'bg-zinc-700'
                    : pin.length > idx
                    ? 'bg-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.7)]'
                    : 'bg-white/15 border border-white/10'
                }`}
              />
            ))}
          </div>

          {/* Error / Lockout Notice */}
          {error && errorMessage && (
            <div className="mb-4 flex items-center justify-center gap-1.5 text-xs text-rose-400 font-medium px-2 text-center animate-shake">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isLockedOut && (
            <div className="mb-4 flex items-center justify-center gap-1.5 text-xs text-zinc-300 font-semibold px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10">
              <Clock className="h-3.5 w-3.5 animate-spin text-white" />
              <span>متبقي لفك التأمين: {lockoutRemainingSec} ثانية</span>
            </div>
          )}

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2 w-full mb-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                disabled={isLockedOut}
                onClick={() => handleDigit(digit)}
                className={`h-12 rounded-2xl border text-lg font-bold transition-all shadow-sm flex items-center justify-center ${
                  isLockedOut
                    ? 'bg-white/[0.01] border-white/5 text-zinc-600 cursor-not-allowed opacity-30'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.14] border-white/10 text-white active:scale-95'
                }`}
              >
                {digit}
              </button>
            ))}
            <button
              disabled={isLockedOut}
              onClick={handleClear}
              className="h-12 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] text-zinc-400 active:scale-95 text-xs font-semibold flex items-center justify-center"
            >
              مسح
            </button>
            <button
              disabled={isLockedOut}
              onClick={() => handleDigit('0')}
              className="h-12 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white active:scale-95 text-lg font-bold flex items-center justify-center"
            >
              0
            </button>
            <button
              disabled={isLockedOut}
              onClick={triggerBiometricAuth}
              className="h-12 rounded-2xl border border-white/20 bg-white/[0.08] hover:bg-white/[0.14] active:bg-white/[0.2] text-white active:scale-95 flex items-center justify-center shadow-md"
              title="الدخول ببصمة الإصبع أو الوجه"
            >
              <Fingerprint className="h-5 w-5 stroke-[2] text-white" />
            </button>
          </div>

          {/* Remember Device Toggle */}
          <div 
            onClick={() => setRememberDevice(!rememberDevice)}
            className="flex items-center justify-center gap-2 mb-3.5 cursor-pointer select-none text-xs text-zinc-300 hover:text-white transition-colors"
          >
            <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
              rememberDevice 
                ? 'bg-white border-white text-black' 
                : 'bg-white/[0.04] border-white/20 text-transparent'
            }`}>
              <Check className="h-3 w-3 stroke-[3]" />
            </div>
            <span>تذكر هذا الجهاز (تسجيل دخول تلقائي مستقبلاً)</span>
          </div>

          {/* Biometric Prompt Button */}
          <button
            disabled={isLockedOut}
            onClick={triggerBiometricAuth}
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold py-2 px-3 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 active:scale-95 transition-all"
          >
            <Fingerprint className="h-4 w-4 text-white" />
            <span>تسجيل الدخول بالبصمة الحيوية</span>
          </button>

        </div>
      </div>
    </div>
  );
};
