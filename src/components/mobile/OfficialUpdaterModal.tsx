import React, { useState, useEffect } from 'react';
import { SystemUpdaterEngine, type ReleaseInfo } from '../../lib/updater/systemUpdaterEngine';
import { X, Download, RefreshCw, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { tacticalAudio } from '../../lib/audio';

interface OfficialUpdaterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfficialUpdaterModal: React.FC<OfficialUpdaterModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [releaseInfo, setReleaseInfo] = useState<ReleaseInfo | null>(null);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      handleCheck();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheck = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await SystemUpdaterEngine.checkLatestRelease();
      setReleaseInfo(res.release);
      setHasUpdate(res.hasUpdate);
      if (res.error) setErrorMsg(res.error);
    } catch (e: any) {
      setErrorMsg(e.message || 'تعذر الاتصال بـ GitHub');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    tacticalAudio.playSuccess();
    SystemUpdaterEngine.downloadLatestApk(releaseInfo?.apkDownloadUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-[#0d1117] border border-white/10 shadow-2xl p-5 text-right font-sans flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">تحديث تطبيق عقلية HQ</h3>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
        </div>

        {/* Current Version Card */}
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
          <span className="text-[11px] text-zinc-400 block">الإصدار المثبت حالياً:</span>
          <span className="text-xs font-bold text-white font-mono">{SystemUpdaterEngine.CURRENT_VERSION}</span>
        </div>

        {/* Status / Loading */}
        {isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-zinc-400">
            <RefreshCw className="h-6 w-6 animate-spin text-white" />
            <span className="text-xs">جارٍ التحقق من GitHub Releases...</span>
          </div>
        ) : errorMsg ? (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs text-center">
            {errorMsg}
          </div>
        ) : releaseInfo ? (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1 text-right">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-400 font-mono">
                  {new Date(releaseInfo.publishedAt).toLocaleDateString('ar-EG')}
                </span>
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>آخر إصدار رسمي متوفر ({releaseInfo.tagName})</span>
                </span>
              </div>
              <p className="text-xs text-zinc-300 line-clamp-3 font-mono pt-1">
                {releaseInfo.releaseName}
              </p>
            </div>

            <button
              onClick={handleDownload}
              className="w-full py-3 rounded-xl bg-white text-black font-bold text-xs flex items-center justify-center gap-2 hover:bg-zinc-200 active:scale-98 transition-all shadow-lg"
            >
              <Download className="h-4 w-4" />
              <span>تحميل وتثبيت ملف APK المباشر</span>
            </button>
          </div>
        ) : null}

        {/* Footer buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px]">
          <button
            onClick={handleCheck}
            disabled={isLoading}
            className="flex items-center gap-1 text-zinc-400 hover:text-white"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>إعادة الفحص</span>
          </button>

          <a
            href={SystemUpdaterEngine.RELEASES_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-zinc-400 hover:text-white"
          >
            <span>صفحة الإصدارات في GitHub</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
