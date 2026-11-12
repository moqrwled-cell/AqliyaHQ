import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  Zap, 
  BatteryCharging, 
  BatteryWarning, 
  Check, 
  Send, 
  X, 
  Clock, 
  Lightbulb, 
  AlertTriangle,
  FolderGit2,
  Bookmark,
  CheckCircle2
} from 'lucide-react';
import type { Mission, IntelItem, StrategicDirective, CommanderMemory, WatchdogAlert, BattleLog } from '../types';
import { tacticalAudio } from '../lib/audio';
import { getTodayDiscoveryQuestion } from '../lib/commanderDiscovery';
import { askCommanderAI } from '../lib/gemini';

interface SITREPBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  missions: Mission[];
  intel: IntelItem[];
  directives: StrategicDirective[];
  memories: CommanderMemory[];
  watchdogAlerts: WatchdogAlert[];
  onSaveBriefing: (params: {
    energyLevel: 'high' | 'medium' | 'low';
    focusSummary: string;
    discoveryAnswer?: string;
    discoveryQuestion?: string;
    newMemoryContent?: string;
  }) => Promise<void>;
}

export const SITREPBriefingModal: React.FC<SITREPBriefingModalProps> = ({
  isOpen,
  onClose,
  missions,
  intel,
  directives,
  memories,
  watchdogAlerts,
  onSaveBriefing,
}) => {
  const currentHour = new Date().getHours();
  const isMorning = currentHour >= 5 && currentHour < 15;
  const isEvening = currentHour >= 18 || currentHour < 5;

  const [energyLevel, setEnergyLevel] = useState<'high' | 'medium' | 'low'>('high');
  const [focusInput, setFocusInput] = useState(
    isMorning
      ? missions[0]?.current_focus || 'مواصلة بناء معمارية NexusOS والمقر التكتيكي'
      : ''
  );
  const [discoveryAnswer, setDiscoveryAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSuccess, setCompletedSuccess] = useState(false);

  const discoveryQ = getTodayDiscoveryQuestion(memories.length);
  const criticalAlerts = watchdogAlerts.filter((a) => a.severity === 'critical' || a.severity === 'warning').slice(0, 3);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    tacticalAudio.playConfirm();
    setIsSubmitting(true);

    try {
      let extractedMemory = '';
      if (discoveryAnswer.trim()) {
        extractedMemory = `القائد محمد يقرر: ${discoveryAnswer.trim()} (في سياق: ${discoveryQ.question})`;
      }

      await onSaveBriefing({
        energyLevel,
        focusSummary: focusInput.trim() || 'إنجاز العمليات اليومية',
        discoveryAnswer: discoveryAnswer.trim() || undefined,
        discoveryQuestion: discoveryQ.question,
        newMemoryContent: extractedMemory || undefined,
      });

      setCompletedSuccess(true);
      tacticalAudio.playConfirm();
      setTimeout(() => {
        setCompletedSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-right max-h-[92vh]">
        
        {/* Tactical Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/10 border border-white/15 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-100">
                  {isMorning ? 'موجز الموقف الصباحي (Morning SITREP)' : 'مساءلة المساء ومراجعة المعركة (Evening Debrief)'}
                </h3>
                <span className="text-[10px] font-telemetry px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                  CHIEF OF STAFF
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isMorning
                  ? 'المستشار يطمئن على جاهزيتك، يسألك ليكتشف أبعاداً جديدة، ويرتب أولويات يومك.'
                  : 'المستشار يراجع معك ما أنجزته اليوم، ويوثق الدروس في سجل المعركة والذاكرة.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4 text-xs font-sans scrollbar-tactical">
          
          {/* 1. Energy & Focus Check */}
          <div className="rounded-xl p-3.5 bg-zinc-900/60 border craft-border space-y-2.5">
            <label className="font-bold text-zinc-200 flex items-center gap-2 text-xs">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>مستوى الطاقة الذهنية والجاهزية الحالية:</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setEnergyLevel('high')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                  energyLevel === 'high'
                    ? 'bg-emerald-950/50 border-emerald-500/70 text-emerald-300 font-bold shadow-sm'
                    : 'bg-black/40 border craft-border text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Zap className="h-4 w-4 mb-1 text-emerald-400" />
                <span className="text-[11px]">طاقة قصوى وتركيز</span>
              </button>

              <button
                type="button"
                onClick={() => setEnergyLevel('medium')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                  energyLevel === 'medium'
                    ? 'bg-cyan-950/50 border-cyan-500/70 text-cyan-300 font-bold shadow-sm'
                    : 'bg-black/40 border craft-border text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <BatteryCharging className="h-4 w-4 mb-1 text-cyan-400" />
                <span className="text-[11px]">وضع مستقر ومتزن</span>
              </button>

              <button
                type="button"
                onClick={() => setEnergyLevel('low')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                  energyLevel === 'low'
                    ? 'bg-amber-950/50 border-amber-500/70 text-amber-300 font-bold shadow-sm'
                    : 'bg-black/40 border craft-border text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <BatteryWarning className="h-4 w-4 mb-1 text-amber-400" />
                <span className="text-[11px]">إجهاد / بحاجة لهدوء</span>
              </button>
            </div>
          </div>

          {/* 2. Proactive AI Discovery Question (يعرف عنك كل شيء ويراكم الأفكار) */}
          <div className="rounded-xl p-3.5 bg-gradient-to-br from-[#121929] to-[#0c111e] border border-cyan-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-telemetry uppercase text-cyan-400 font-bold flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                <span>سؤال اليوم الاستكشافي // لتراكم الذاكرة الذاتية</span>
              </span>
              <span className="text-[9px] font-telemetry text-zinc-400 bg-black/40 px-1.5 py-0.5 rounded border craft-border">
                FACT #{memories.length + 1}
              </span>
            </div>
            
            <p className="text-xs font-bold text-zinc-100 leading-relaxed">
              «{discoveryQ.question}»
            </p>
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              {discoveryQ.contextHint}
            </p>

            <textarea
              value={discoveryAnswer}
              onChange={(e) => setDiscoveryAnswer(e.target.value)}
              placeholder="اكتب إجابتك أو خاطرتك بكل أريحية وصراحة، وسيقوم المستشار بتحليلها وحفظها في بنك ذاكرته عنك..."
              rows={2}
              className="w-full rounded-xl bg-black/70 border craft-border px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-cyan-500/60 resize-none leading-relaxed"
            />
          </div>

          {/* 3. Primary Focus / Debrief Log */}
          <div className="rounded-xl p-3.5 bg-zinc-900/60 border craft-border space-y-2">
            <label className="font-bold text-zinc-200 flex items-center gap-1.5 text-xs">
              <FolderGit2 className="h-4 w-4 text-emerald-400" />
              <span>
                {isMorning ? 'الهدف المحوري أو الأولوية الكبرى لليوم:' : 'أهم إنجاز أو خطوة حاسمة تحققت اليوم:'}
              </span>
            </label>
            <textarea
              value={focusInput}
              onChange={(e) => setFocusInput(e.target.value)}
              placeholder={
                isMorning
                  ? 'ما هو الشيء الأكثر حسماً الذي تركز عليه اليوم؟'
                  : 'وثق باختصار ما تم إنجازه أو ما واجهته خلال معركة اليوم...'
              }
              rows={2}
              className="w-full rounded-xl bg-black/60 border craft-border px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-emerald-500/60 resize-none leading-relaxed"
            />
          </div>

          {/* 4. Watchdog Radar (تنبيهات ما نسيته) */}
          {criticalAlerts.length > 0 && (
            <div className="rounded-xl p-3 bg-amber-950/20 border border-amber-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  <span>رادار المراقبة // تنبيهات لا تنساها اليوم ({criticalAlerts.length})</span>
                </span>
                <span className="text-[9px] font-telemetry text-amber-400/80">WATCHDOG SCAN</span>
              </div>
              <div className="space-y-1.5">
                {criticalAlerts.map((alt) => (
                  <div key={alt.id} className="p-2 rounded-lg bg-black/40 border craft-border flex items-start justify-between gap-2">
                    <div>
                      <h5 className="font-bold text-zinc-200 text-[11px]">{alt.title}</h5>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{alt.reason}</p>
                    </div>
                    {alt.daysStale > 0 && (
                      <span className="text-[9px] font-telemetry px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        {alt.daysStale}d
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2 border-t craft-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-all"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={isSubmitting || completedSuccess}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-950 active:scale-95"
            >
              {completedSuccess ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-200" />
                  <span>تم اعتماد الموقف وحفظ الذاكرة بنجاح!</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>{isMorning ? 'اعتماد خطة الصباح وتحديث الذاكرة' : 'توثيق مساءلة اليوم واعتماد الإنجاز'}</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
