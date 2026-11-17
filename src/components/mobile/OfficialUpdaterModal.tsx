import React, { useState, useEffect } from 'react';
import { 
  SystemUpdaterEngine, 
  type CommitInfo, 
  type ReleaseInfo, 
  type AppRuntimeMode 
} from '../../lib/updater/systemUpdaterEngine';
import { 
  Zap, 
  X, 
  Download, 
  RefreshCw, 
  ExternalLink, 
  Check, 
  Globe, 
  Wifi, 
  Smartphone, 
  GitCommit, 
  ShieldCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { tacticalAudio } from '../../lib/audio';

interface OfficialUpdaterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfficialUpdaterModal: React.FC<OfficialUpdaterModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'official_apk' | 'cloud_stream' | 'wifi_dev'>('official_apk');
  const [isLoading, setIsLoading] = useState(false);
  const [commitInfo, setCommitInfo] = useState<CommitInfo | null>(null);
  const [releaseInfo, setReleaseInfo] = useState<ReleaseInfo | null>(null);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Runtime Mode States
  const [runtimeInfo, setRuntimeInfo] = useState(() => SystemUpdaterEngine.getRuntimeMode());
  const [customCloudUrl, setCustomCloudUrl] = useState(runtimeInfo.customUrl || '');
  const [wifiDevUrl, setWifiDevUrl] = useState('http://192.168.1.15:5173');

  useEffect(() => {
    if (isOpen) {
      loadUpdateData();
      setRuntimeInfo(SystemUpdaterEngine.getRuntimeMode());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const loadUpdateData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await SystemUpdaterEngine.checkLatestUpdate();
      setCommitInfo(res.latestCommit);
      setReleaseInfo(res.latestRelease);
      setHasUpdate(res.hasUpdate);
      if (res.error) setErrorMsg(res.error);
    } catch (e: any) {
      setErrorMsg(e.message || 'تعذر الاتصال بـ GitHub');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadApk = () => {
    tacticalAudio.playSuccess();
    const downloadUrl = releaseInfo?.apkDownloadUrl || SystemUpdaterEngine.DIRECT_APK_URL;
    SystemUpdaterEngine.downloadLatestApk(downloadUrl);
  };

  const handleSwitchToCloud = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCloudUrl.trim()) return;
    tacticalAudio.playConfirm();
    SystemUpdaterEngine.switchRuntimeMode('cloud_mirror', customCloudUrl.trim());
  };

  const handleSwitchToWifi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wifiDevUrl.trim()) return;
    tacticalAudio.playConfirm();
    SystemUpdaterEngine.switchRuntimeMode('wifi_dev', wifiDevUrl.trim());
  };

  const handleSwitchToNativeLocal = () => {
    tacticalAudio.playBlip();
    SystemUpdaterEngine.switchRuntimeMode('native_local');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-[#080c14] border border-white/15 shadow-2xl p-4 sm:p-5 text-right font-sans max-h-[92vh] flex flex-col text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-shrink-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-amber-400" />
                <span>مركز التحديث الرسمي والمبتكر</span>
              </h3>
              <p className="text-[11px] text-zinc-400">تحميل الـ APK المباشر، البث السحابي الحي، والربط المحلي</p>
            </div>
          </div>
        </div>

        {/* Current App Status Badge */}
        <div className="p-3 my-2.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-2 flex-shrink-0">
          <div>
            <span className="text-[10px] text-zinc-400 block font-mono">وضع التشغيل الحالي:</span>
            <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
              {runtimeInfo.mode === 'native_local' && (
                <>
                  <Smartphone className="h-3.5 w-3.5 text-blue-400" />
                  <span>النسخة الأصلية المثبتة (Offline Native APK)</span>
                </>
              )}
              {runtimeInfo.mode === 'cloud_mirror' && (
                <>
                  <Globe className="h-3.5 w-3.5 text-emerald-400" />
                  <span>الوضع السحابي المباشر (Live Cloud)</span>
                </>
              )}
              {runtimeInfo.mode === 'wifi_dev' && (
                <>
                  <Wifi className="h-3.5 w-3.5 text-purple-400" />
                  <span>خادم التطوير المحلي عبر الواي فاي</span>
                </>
              )}
            </span>
          </div>

          <button
            onClick={loadUpdateData}
            disabled={isLoading}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/10 text-zinc-300 hover:text-white transition-all active:scale-95 border border-white/5"
            title="فحص أحدث البيانات"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/5 mb-3 flex-shrink-0">
          <button
            onClick={() => setActiveTab('official_apk')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
              activeTab === 'official_apk'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            <span>تحديث APK الرسمي</span>
          </button>

          <button
            onClick={() => setActiveTab('cloud_stream')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
              activeTab === 'cloud_stream'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Globe className="h-3.5 w-3.5" />
            <span>البث السحابي الحي ⚡</span>
          </button>

          <button
            onClick={() => setActiveTab('wifi_dev')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
              activeTab === 'wifi_dev'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Wifi className="h-3.5 w-3.5" />
            <span>تطوير الواي فاي</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-3.5 py-1 flex-1 text-xs">
          
          {/* ==================================================================== */}
          {/* TAB 1: OFFICIAL APK DOWNLOAD */}
          {/* ==================================================================== */}
          {activeTab === 'official_apk' && (
            <div className="space-y-3">
              
              {/* Commit & Build Details Card */}
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <GitCommit className="h-4 w-4 text-emerald-400" />
                    <span className="font-bold text-white">آخر كود تم دفعه لمستودع GitHub:</span>
                  </div>
                  {commitInfo && (
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-white/10 text-white font-bold">
                      {commitInfo.sha}
                    </span>
                  )}
                </div>

                {commitInfo ? (
                  <div className="space-y-1">
                    <p className="text-zinc-200 font-bold leading-relaxed">{commitInfo.message}</p>
                    <p className="text-[10px] text-zinc-400 flex items-center justify-between pt-1">
                      <span>بواسطة: {commitInfo.author}</span>
                      <span>{new Date(commitInfo.date).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-zinc-400 text-[11px]">جارٍ جلب تفاصيل أحدث التزام...</p>
                )}
              </div>

              {/* Direct APK Download Button (Primary) */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-black border border-emerald-500/30 space-y-3 text-center">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                    <span>حزمة التطبيق الرسمية (APK)</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      GitHub Actions CI/CD
                    </span>
                  </h4>
                  <p className="text-[11px] text-zinc-300 leading-relaxed max-w-sm mx-auto">
                    يتم بناء وتجهيز ملف الـ APK تلقائياً في خوادم GitHub مع كل تعديل نجريه، وجاهز للتثبيت فوق تطبيقك الحالي مباشرة بلمسة واحدة دون فقدان أي بيانات!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadApk}
                  className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-zinc-200 text-black font-extrabold text-xs shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4 stroke-[2.5]" />
                  <span>تنزيل وتثبيت أحدث APK رسمي بلمسة واحدة 📥</span>
                </button>
              </div>

              {/* Secondary Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={SystemUpdaterEngine.openReleasesPage}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>سجل الإصدارات في GitHub</span>
                  <ExternalLink className="h-3 w-3" />
                </button>

                <button
                  type="button"
                  onClick={() => window.open(SystemUpdaterEngine.REPO_COMMITS_URL, '_blank')}
                  className="px-3.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 text-[11px] font-bold transition-all"
                  title="سجل الـ Commits"
                >
                  <GitCommit className="h-3.5 w-3.5" />
                </button>
              </div>

            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 2: LIVE CLOUD STREAM (INNOVATIVE ZERO-INSTALL UPDATES) */}
          {/* ==================================================================== */}
          {activeTab === 'cloud_stream' && (
            <div className="space-y-3.5">
              
              <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/20 text-zinc-200 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-blue-400" />
                  <span className="font-bold text-white">الطريقة المبتكرة: تعديل وتحديث فوري بدون APK!</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  إذا كنت ترغب في أن تعدّل وتجرّب براحتك وبأقصى سرعة بدون تثبيت APK جديد في كل مرة:
                  يمكن للتطبيق استعراض نسختك الحية المحدثة لحظياً على الإنترنت، فيظهر أي كود نعدله على هاتفك خلال 30 ثانية!
                </p>
              </div>

              {/* Form: Live Cloud URL */}
              <form onSubmit={handleSwitchToCloud} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <label className="text-zinc-300 font-bold block text-xs">
                  رابط النسخة السحابية المباشرة (Vercel / Netlify / Custom URL):
                </label>
                
                <input
                  type="text"
                  value={customCloudUrl}
                  onChange={(e) => setCustomCloudUrl(e.target.value)}
                  placeholder="https://aqliyahq.vercel.app أو الرابط المباشر..."
                  className="w-full p-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs outline-none focus:border-white font-mono dir-ltr text-left"
                />

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all active:scale-95 shadow"
                  >
                    تفعيل الوضع السحابي الفوري ⚡
                  </button>

                  {runtimeInfo.mode !== 'native_local' && (
                    <button
                      type="button"
                      onClick={handleSwitchToNativeLocal}
                      className="px-3 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-zinc-300 font-bold border border-white/10 transition-all"
                    >
                      الرجوع للأصلي
                    </button>
                  )}
                </div>
              </form>

            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 3: WI-FI LIVE DEV BRIDGE */}
          {/* ==================================================================== */}
          {activeTab === 'wifi_dev' && (
            <div className="space-y-3.5">
              
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/20 text-zinc-200 space-y-2">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-purple-400" />
                  <span className="font-bold text-white">ربط التطوير المباشر عبر الواي فاي (Hot Reload)</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  عند تشغيل أمر التطوير على جهازك (`npm run dev -- --host`):
                  يمكنك ربط الهاتف بلابتوبك مباشرة على نفس شبكة الواي فاي لتشاهد التعديلات تتغير على شاشة هاتفك في نفس اللحظة التي تكتب فيها الكود!
                </p>
              </div>

              <form onSubmit={handleSwitchToWifi} className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <label className="text-zinc-300 font-bold block text-xs">
                  عنوان IP لجهازك على الشبكة:
                </label>
                
                <input
                  type="text"
                  value={wifiDevUrl}
                  onChange={(e) => setWifiDevUrl(e.target.value)}
                  placeholder="http://192.168.1.15:5173"
                  className="w-full p-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs outline-none focus:border-white font-mono dir-ltr text-left"
                />

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all active:scale-95 shadow"
                  >
                    اتصال باللابتوب فورياً 💻
                  </button>

                  {runtimeInfo.mode !== 'native_local' && (
                    <button
                      type="button"
                      onClick={handleSwitchToNativeLocal}
                      className="px-3 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-zinc-300 font-bold border border-white/10 transition-all"
                    >
                      الرجوع للأصلي
                    </button>
                  )}
                </div>
              </form>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
