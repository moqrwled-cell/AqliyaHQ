import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  X, 
  ArrowUpRight, 
  FolderGit2, 
  Database, 
  Clock, 
  Bot, 
  CheckCircle2, 
  Filter
} from 'lucide-react';
import type { WatchdogAlert, Mission } from '../types';
import { tacticalAudio } from '../lib/audio';

interface WatchdogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: WatchdogAlert[];
  onSelectMission?: (m: Mission) => void;
  onAskAI?: (prompt: string) => void;
  onDismissAlert?: (alertId: string) => void;
}

export const WatchdogDrawer: React.FC<WatchdogDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  onSelectMission,
  onAskAI,
  onDismissAlert,
}) => {
  const [filter, setFilter] = useState<'all' | 'projects' | 'intel' | 'directives'>('all');

  if (!isOpen) return null;

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'all') return true;
    return a.pillar === filter;
  });

  const getSeverityBadge = (severity: WatchdogAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return { label: 'حرج جداً', color: 'bg-rose-950/60 border-rose-800 text-rose-300' };
      case 'warning':
        return { label: 'تنبيه ركود', color: 'bg-amber-950/60 border-amber-800 text-amber-300' };
      default:
        return { label: 'ملاحظة استخباراتية', color: 'bg-cyan-950/60 border-cyan-800 text-cyan-300' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0b0f19] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-right max-h-[90vh]">
        
        {/* Header HUD */}
        <div className="flex items-center justify-between p-4 border-b craft-border bg-[#0e1424]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldAlert className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-100">رادار الرقابة والمتابعة التكتيكية (Watchdog)</h3>
                <span className="text-[10px] font-telemetry px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  {alerts.length} ALERTS ACTIVE
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">كشف تلقائي للمشاريع الراكدة، الحلول غير المطبقة، وما نسيته المنظومة</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex border-b craft-border px-4 py-2.5 bg-black/30 text-xs gap-1.5 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg transition-all ${
              filter === 'all' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            الكل ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('projects')}
            className={`px-3 py-1 rounded-lg transition-all ${
              filter === 'projects' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            المشاريع الراكدة ({alerts.filter((a) => a.pillar === 'projects').length})
          </button>
          <button
            onClick={() => setFilter('intel')}
            className={`px-3 py-1 rounded-lg transition-all ${
              filter === 'intel' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            الحلول غير المطبقة ({alerts.filter((a) => a.pillar === 'intel').length})
          </button>
        </div>

        {/* Alerts List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 text-xs font-sans scrollbar-tactical">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alt) => {
              const badge = getSeverityBadge(alt.severity);
              return (
                <div
                  key={alt.id}
                  className="rounded-xl border craft-border bg-zinc-900/70 p-3.5 hover:bg-zinc-900/95 transition-all space-y-2.5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-telemetry px-2 py-0.5 rounded border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <h4 className="text-xs font-bold text-zinc-100">{alt.title}</h4>
                    </div>

                    {alt.daysStale > 0 && (
                      <span className="text-[10px] font-telemetry px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        منذ {alt.daysStale} أيام
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed font-sans bg-black/30 p-2.5 rounded-lg border craft-border">
                    {alt.reason}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1 border-t craft-border gap-2">
                    <div className="flex items-center gap-2">
                      {alt.actionType === 'open_mission' && alt.data && (
                        <button
                          onClick={() => {
                            tacticalAudio.playConfirm();
                            onSelectMission?.(alt.data);
                            onClose();
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-[11px] font-medium transition-all"
                        >
                          <FolderGit2 className="h-3.5 w-3.5" />
                          <span>فتح المشروع للتوثيق</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          tacticalAudio.playConfirm();
                          onAskAI?.(`يا مستشار، لدي تنبيه رقابي بخصوص: ${alt.title}. ما هي توصيتك التكتيكية الصارمة للتحرك؟`);
                          onClose();
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-[11px] font-medium transition-all"
                      >
                        <Bot className="h-3.5 w-3.5" />
                        <span>استشارة المستشار</span>
                      </button>
                    </div>

                    {onDismissAlert && (
                      <button
                        onClick={() => {
                          tacticalAudio.playBlip();
                          onDismissAlert(alt.id);
                        }}
                        className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        تأجيل مؤقت
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-zinc-500 text-xs space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
              <p className="font-bold text-zinc-300">جميع العمليات والمشاريع في أعلى درجات اليقظة والنشاط!</p>
              <p className="text-[11px]">لا توجد مشاريع راكدة أو حلول مهملة حالياً في رادار الرقابة.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0e1424] border-t craft-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-all"
          >
            إغلاق الرادار
          </button>
        </div>

      </div>
    </div>
  );
};
