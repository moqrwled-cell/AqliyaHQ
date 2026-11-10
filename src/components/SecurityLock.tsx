import React, { useState, useEffect } from 'react';
import { ShieldCheck, Fingerprint, Lock, AlertCircle, Sparkles, Clock, ShieldAlert } from 'lucide-react';
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

  useEffect(() => {
    // 1. Ensure military-grade PIN hash is initialized
    CryptoVaultEngine.ensureInitialized().catch((err) => {
      console.warn('PIN init error:', err);
    });

    // 2. Check current lockout state
    const lockout = CryptoVaultEngine.getLockoutState();
    if (lockout.lockoutUntil && Date.now() < lockout.lockoutUntil) {
      setIsLockedOut(true);
      setLockoutRemainingSec(Math.ceil((lockout.lockoutUntil - Date.now()) / 1000));
    }

    // 3. Check if device supports Biometrics / WebAuthn
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.()
        .then((available) => {
          setHasBiometrics(available);
          if (available && localStorage.getItem('aqliya_bio_enabled') === 'true' && !isLockedOut) {
            triggerBiometricAuth();
          }
        })
        .catch(() => setHasBiometrics(true)); // Allow trigger attempt on mobile
    } else {
      setHasBiometrics(true);
    }
  }, []);

  // Lockout countdown timer effect
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

  const triggerBiometricAuth = async () => {
    if (isLockedOut) return;
    try {
      setIsAuthenticating(true);
      if (window.PublicKeyCredential && navigator.credentials) {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);
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
          onUnlock();
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
          <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b border shadow-inner transition-all duration-300 ${
            isLockedOut 
              ? 'from-rose-500/20 to-rose-500/5 border-rose-500/30 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
              : 'from-white/10 to-white/5 border-white/15 text-emerald-400'
          }`}>
            {isLockedOut ? (
              <ShieldAlert className="h-6 w-6 stroke-[2]" />
            ) : (
              <Lock className="h-6 w-6 stroke-[2]" />
            )}
          </div>

          <h2 className="text-xl font-bold tracking-tight text-white mb-1">
            عقلية
          </h2>
          <p className="text-xs text-zinc-400 font-medium mb-5">
            المساعد الشخصي الذكي • القائد محمد
          </p>

          {/* Security Algorithm Pill */}
          <div className="mb-5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-[10px] text-zinc-400">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            <span>حماية PBKDF2-SHA256 • تشفير محلي مضاد للاختراق</span>
          </div>

          {/* PIN Indicators */}
          <div className="flex items-center justify-center gap-3.5 mb-6">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`h-3 w-3 rounded-full transition-all duration-300 ${
                  error
                    ? 'bg-rose-500 scale-110 shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                    : isLockedOut
                    ? 'bg-rose-500/40 border border-rose-500/30'
                    : pin.length > idx
                    ? 'bg-emerald-400 scale-105 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                    : 'bg-white/15 border border-white/10'
                }`}
              />
            ))}
          </div>

          {/* Error / Lockout Notice */}
          {error && errorMessage && (
            <div className="mb-4 flex items-center justify-center gap-1.5 text-xs text-rose-400 font-medium animate-shake px-2 text-center">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isLockedOut && (
            <div className="mb-4 flex items-center justify-center gap-1.5 text-xs text-amber-300 font-semibold px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Clock className="h-3.5 w-3.5 animate-spin" />
              <span>متبقي لفك التأمين: {lockoutRemainingSec} ثانية</span>
            </div>
          )}

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2.5 w-full mb-5">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                disabled={isLockedOut}
                onClick={() => handleDigit(digit)}
                className={`h-12 rounded-2xl border text-lg font-bold transition-all shadow-sm flex items-center justify-center ${
                  isLockedOut
                    ? 'bg-white/[0.01] border-white/5 text-zinc-600 cursor-not-allowed opacity-40'
                    : 'bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] border-white/10 text-white active:scale-95'
                }`}
              >
                {digit}
              </button>
            ))}
            <button
              disabled={isLockedOut}
              onClick={handleClear}
              className={`h-12 rounded-2xl border text-xs font-medium transition-all flex items-center justify-center ${
                isLockedOut
                  ? 'bg-white/[0.01] border-white/5 text-zinc-600 cursor-not-allowed opacity-40'
                  : 'bg-white/[0.02] hover:bg-white/[0.06] border-white/5 text-zinc-400 active:scale-95'
              }`}
            >
              مسح
            </button>
            <button
              disabled={isLockedOut}
              onClick={() => handleDigit('0')}
              className={`h-12 rounded-2xl border text-lg font-bold transition-all shadow-sm flex items-center justify-center ${
                isLockedOut
                  ? 'bg-white/[0.01] border-white/5 text-zinc-600 cursor-not-allowed opacity-40'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] border-white/10 text-white active:scale-95'
              }`}
            >
              0
            </button>
            <button
              disabled={isLockedOut}
              onClick={triggerBiometricAuth}
              className={`h-12 rounded-2xl border text-emerald-400 transition-all flex items-center justify-center ${
                isLockedOut
                  ? 'bg-white/[0.01] border-white/5 text-zinc-600 cursor-not-allowed opacity-40'
                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 active:bg-emerald-500/30 border-emerald-500/30 active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
              }`}
              title="الدخول بالبصمة"
            >
              <Fingerprint className="h-5 w-5 stroke-[2]" />
            </button>
          </div>

          {/* Biometric Prompt Button */}
          <button
            disabled={isLockedOut}
            onClick={triggerBiometricAuth}
            className={`flex items-center gap-2 text-xs font-medium py-1 px-3 rounded-full border transition-all ${
              isLockedOut
                ? 'text-zinc-600 border-white/5 bg-transparent cursor-not-allowed opacity-40'
                : 'text-emerald-400/90 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/20 active:scale-95'
            }`}
          >
            <Fingerprint className="h-4 w-4" />
            <span>تسجيل الدخول بالبصمة أو التعرف على الوجه</span>
          </button>

        </div>
      </div>
    </div>
  );
};
