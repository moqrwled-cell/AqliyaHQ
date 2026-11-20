import React, { useState, useRef } from 'react';
import { Key, Database, ExternalLink, Check, Sparkles, X, RefreshCw, Download, Upload, HardDrive, ShieldCheck } from 'lucide-react';
import { geminiConfig } from '../lib/gemini';
import { supabase } from '../lib/supabase';
import { tacticalAudio } from '../lib/audio';
import { UnifiedStorage } from '../lib/storage/unifiedStorage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState(geminiConfig.getApiKey());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testingDb, setTestingDb] = useState(false);
  const [dbStatus, setDbStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = UnifiedStorage.getStorageStats();

  if (!isOpen) return null;

  const handleSave = () => {
    tacticalAudio.playConfirm();
    geminiConfig.setApiKey(apiKey);
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
      const { error } = await supabase.from('missions').select('id').limit(1);
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

  const handleExportBackup = () => {
    tacticalAudio.playSuccess();
    UnifiedStorage.exportFullBackupJSON();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    tacticalAudio.playBlip();
    setImportStatus('جارٍ استعادة البيانات والتحقق...');
    const result = await UnifiedStorage.importFullBackupJSON(file);

    if (result.success) {
      tacticalAudio.playSuccess();
      setImportStatus(result.message);
      setTimeout(() => setImportStatus(null), 4000);
    } else {
      tacticalAudio.playAlert();
      setImportStatus(result.message);
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-[#0d1117] border border-white/10 p-5 text-right relative overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            <div>
              <h3 className="text-sm font-bold text-white">إعدادات المنظومة والنسخ الاحتياطي</h3>
              <p className="text-[11px] text-zinc-400">Google Gemini • حماية البيانات • قاعدة Supabase</p>
            </div>
            <div className="p-2 rounded-xl bg-white/[0.05] border border-white/10 text-zinc-300">
              <Key className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="space-y-4 text-xs overflow-y-auto flex-1 pr-1">
          {/* Persistent Backup & Restore (Full Data Protection) */}
          <div className="rounded-xl p-3.5 bg-white/[0.03] border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 font-mono">
                {stats.goalsCount} أهداف • {stats.tasksCount} مهام • {stats.intelCount} استخبارات ({stats.storageUsedKb} KB)
              </span>
              <label className="font-bold text-white flex items-center gap-1.5">
                <HardDrive className="h-3.5 w-3.5 text-amber-400" />
                <span>النسخ الاحتياطي وحماية البيانات (JSON)</span>
              </label>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              تصدير ملف شامل لجميع بياناتك وأهدافك وروابطك المحفوظة، أو استعادتها بلمسة واحدة لضمان عدم ضياع أي بيانات أبداً عند تحديث التطبيق.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex-1 py-2 px-3 rounded-xl bg-white/[0.06] hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/10 active:scale-98 transition-all"
              >
                <Download className="h-3.5 w-3.5 text-amber-400" />
                <span>تصدير نسخة كاملة</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 px-3 rounded-xl bg-white/[0.06] hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/10 active:scale-98 transition-all"
              >
                <Upload className="h-3.5 w-3.5 text-cyan-400" />
                <span>استيراد واستعادة</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {importStatus && (
              <div className="p-2 rounded-lg bg-white/[0.05] border border-white/10 text-[11px] text-zinc-200 text-center animate-in fade-in">
                {importStatus}
              </div>
            )}
          </div>

          {/* Google Gemini API Key */}
          <div className="rounded-xl p-3.5 bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <span>مفتاح جديد</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
                <button
                  type="button"
                  onClick={() => {
                    const restored = geminiConfig.resetToDefaultKey();
                    setApiKey(restored);
                    tacticalAudio.playConfirm();
                  }}
                  className="text-[10px] text-zinc-400 hover:text-white underline font-mono"
                >
                  استعادة المفتاح المدمج
                </button>
              </div>
              <label className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>مفتاح Google Gemini API</span>
              </label>
            </div>

            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy... أو المفتاح المدمج"
              className="w-full rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs font-mono text-white outline-none focus:border-cyan-500/50"
            />
            <p className="text-[10px] text-emerald-400/90 leading-relaxed flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              <span>المفتاح مدمج ومحفوظ محلياً داخل التطبيق ليعمل دائماً دون انقطاع.</span>
            </p>
          </div>

          {/* Supabase Status */}
          <div className="rounded-xl p-3.5 bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestDatabase}
                disabled={testingDb}
                className="text-[11px] text-zinc-300 hover:text-white flex items-center gap-1 border border-white/10 px-2 py-0.5 rounded-lg bg-white/[0.05]"
              >
                <RefreshCw className={`h-2.5 w-2.5 ${testingDb ? 'animate-spin' : ''}`} />
                <span>فحص الاتصال</span>
              </button>
              <span className="font-bold text-white flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-emerald-400" />
                <span>مزامنة Supabase السحابية</span>
              </span>
            </div>

            <div className="space-y-1 text-[11px] font-mono text-zinc-400 bg-black/40 p-2.5 rounded-xl border border-white/5">
              <div className="flex justify-between">
                <span className="text-zinc-200">zydgpjqllgthkqabphth</span>
                <span>PROJECT ID:</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-400 font-bold">
                  {dbStatus === 'success' ? 'CONNECTED // 100%' : dbStatus === 'error' ? 'ERROR' : 'ACTIVE_HEALTHY'}
                </span>
                <span>STATUS:</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white transition-colors"
          >
            إغلاق
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 active:scale-95 transition-all shadow-sm"
          >
            {savedSuccess ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>تم الحفظ</span>
              </>
            ) : (
              <span>حفظ التغييرات</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
