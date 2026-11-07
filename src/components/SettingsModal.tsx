import React, { useState } from 'react';
import { Key, Shield, Database, ExternalLink, Check, Sparkles, X, RefreshCw } from 'lucide-react';
import { geminiConfig } from '../lib/gemini';
import { supabase } from '../lib/supabase';
import { tacticalAudio } from '../lib/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState(geminiConfig.getApiKey());
  const [pin, setPin] = useState(localStorage.getItem('aqliya_master_pin') || '1337');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testingDb, setTestingDb] = useState(false);
  const [dbStatus, setDbStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleSave = () => {
    tacticalAudio.playConfirm();
    geminiConfig.setApiKey(apiKey);
    localStorage.setItem('aqliya_master_pin', pin.trim() || '1337');
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  const handleTestDatabase = async () => {
    tacticalAudio.playBlip();
    setTestingDb(true);
    setDbStatus('idle');
    try {
      const { data, error } = await supabase.from('missions').select('id').limit(1);
      if (error) throw error;
      setDbStatus('success');
      tacticalAudio.playConfirm();
    } catch (e) {
      console.error(e);
      setDbStatus('error');
      tacticalAudio.playAlert();
    } finally {
      setTestingDb(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="craft-surface-elevated w-full max-w-md rounded-2xl p-6 text-right relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b craft-border mb-5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-zinc-800 border craft-border text-zinc-300">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-100">إعدادات المنظومة والمفاتيح</h3>
              <p className="text-[11px] text-zinc-400">Google Gemini API • Supabase Cloud • رمز الأمان</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Google Gemini API Key */}
          <div className="rounded-xl p-3.5 bg-zinc-900/80 border craft-border">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-zinc-200 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>Google Gemini API Key (مجاني وسريع)</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-telemetry"
              >
                <span>احصل على مفتاح مجاني</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>

            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full rounded-lg border craft-border bg-black/60 px-3 py-2 text-xs font-telemetry text-zinc-100 outline-none focus:border-cyan-500/50"
            />
            <p className="text-[10px] text-zinc-500 mt-1.5 leading-relaxed">
              يُستخدم لتشغيل مستشار العمليات الذكي فوراً عبر نموذج <strong>Gemini 1.5 Flash</strong> الفائق السرعة وبدون أي تكلفة.
            </p>
          </div>

          {/* Master PIN */}
          <div className="rounded-xl p-3.5 bg-zinc-900/80 border craft-border">
            <label className="font-bold text-zinc-200 flex items-center gap-1.5 mb-1.5">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span>رمز الدخول السري للقائد (PIN)</span>
            </label>
            <input
              type="text"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full rounded-lg border craft-border bg-black/60 px-3 py-2 text-xs font-telemetry text-zinc-100 outline-none focus:border-emerald-500/50"
            />
            <p className="text-[10px] text-zinc-500 mt-1.5">
              الرمز الحالي المستخدم لقفل الثكنة (الافتراضي: 1337).
            </p>
          </div>

          {/* Supabase Status */}
          <div className="rounded-xl p-3.5 bg-zinc-900/80 border craft-border">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-emerald-400" />
                <span>حالة قاعدة بيانات Supabase</span>
              </span>
              <button
                type="button"
                onClick={handleTestDatabase}
                disabled={testingDb}
                className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 border craft-border px-2 py-0.5 rounded bg-zinc-800/60"
              >
                <RefreshCw className={`h-2.5 w-2.5 ${testingDb ? 'animate-spin' : ''}`} />
                <span>فحص الاتصال</span>
              </button>
            </div>

            <div className="space-y-1 text-[11px] font-telemetry text-zinc-400 bg-black/40 p-2 rounded-lg border craft-border">
              <div className="flex justify-between">
                <span>PROJECT ID:</span>
                <span className="text-zinc-200">zydgpjqllgthkqabphth</span>
              </div>
              <div className="flex justify-between">
                <span>REGION:</span>
                <span className="text-zinc-200">eu-central-1 (Frankfurt)</span>
              </div>
              <div className="flex justify-between">
                <span>STATUS:</span>
                <span className="text-emerald-400 font-bold">
                  {dbStatus === 'success' ? 'CONNECTED // 100%' : dbStatus === 'error' ? 'ERROR' : 'ACTIVE_HEALTHY'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t craft-border">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-zinc-100 text-zinc-950 text-xs font-bold hover:bg-white active:scale-95 transition-all shadow-sm"
          >
            {savedSuccess ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>تم الحفظ</span>
              </>
            ) : (
              <span>حفظ الإعدادات</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
