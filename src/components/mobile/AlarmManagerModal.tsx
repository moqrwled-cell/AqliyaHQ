import React, { useState, useEffect } from 'react';
import { 
  AlarmEngine, 
  AVAILABLE_RINGTONES 
} from '../../lib/alarm/alarmEngine';
import type { 
  AlarmItem, 
  RingtoneToneId 
} from '../../lib/alarm/alarmEngine';
import { 
  AlarmClock, 
  X, 
  Plus, 
  Trash2, 
  Play, 
  Square, 
  Volume2, 
  Check, 
  BellRing, 
  Sparkles,
  Clock
} from 'lucide-react';

interface AlarmManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlarmManagerModal: React.FC<AlarmManagerModalProps> = ({ isOpen, onClose }) => {
  const [alarms, setAlarms] = useState<AlarmItem[]>(() => AlarmEngine.getAlarms());
  const [showAddForm, setShowAddForm] = useState(false);
  
  // New Alarm form state
  const [newTime, setNewTime] = useState('06:00');
  const [newLabel, setNewLabel] = useState('استيقاظ الفجر والنشاط');
  const [newTone, setNewTone] = useState<RingtoneToneId>('military');
  const [newVolume, setNewVolume] = useState(0.85);
  
  const [previewingTone, setPreviewingTone] = useState<RingtoneToneId | null>(null);

  useEffect(() => {
    const handleAlarmsUpdated = (e: any) => {
      if (e.detail) {
        setAlarms([...e.detail]);
      }
    };

    window.addEventListener('moha:alarms-updated', handleAlarmsUpdated);
    return () => {
      window.removeEventListener('moha:alarms-updated', handleAlarmsUpdated);
      AlarmEngine.stopAudioOnly();
    };
  }, []);

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    const updated = AlarmEngine.toggleAlarm(id);
    setAlarms([...updated]);
  };

  const handleDelete = (id: string) => {
    const updated = AlarmEngine.deleteAlarm(id);
    setAlarms([...updated]);
  };

  const handlePlayPreview = (tone: RingtoneToneId) => {
    if (previewingTone === tone) {
      AlarmEngine.stopAudioOnly();
      setPreviewingTone(null);
    } else {
      setPreviewingTone(tone);
      AlarmEngine.playTone(tone, newVolume, false);
      setTimeout(() => {
        setPreviewingTone(null);
      }, 2500);
    }
  };

  const handleSaveNewAlarm = () => {
    AlarmEngine.stopAudioOnly();
    setPreviewingTone(null);
    const updated = AlarmEngine.addAlarm(newTime, newLabel, newTone, newVolume);
    setAlarms([...updated]);
    setShowAddForm(false);
  };

  const setQuickTime = (time: string, label: string, tone: RingtoneToneId) => {
    setNewTime(time);
    setNewLabel(label);
    setNewTone(tone);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-[#0c101c] border border-emerald-500/30 shadow-2xl p-4 sm:p-5 text-right font-sans max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-shrink-0">
          <button
            onClick={() => {
              AlarmEngine.stopAudioOnly();
              onClose();
            }}
            className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">منبه Moha الذكي</h3>
            <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <AlarmClock className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Content (Scrollable) */}
        <div className="overflow-y-auto space-y-4 py-3 flex-1">
          
          {/* Quick Info Box */}
          <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-200/90 leading-relaxed">
            💡 منبه دقيق يعمل بدون إنترنت مع نغمات اصطناعية واهتزاز كامل للهاتف. يمكنك ضبطه على الساعة 6:00 صباحاً للاستيقاظ والتحكم في النغمة ومستوى الصوت.
          </div>

          {/* Alarms List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{showAddForm ? 'إلغاء' : 'إضافة منبه جديد'}</span>
              </button>
              <span className="text-xs font-bold text-zinc-400">المنبهات المجدولة ({alarms.length})</span>
            </div>

            {alarms.map(alarm => {
              const toneObj = AVAILABLE_RINGTONES.find(t => t.id === alarm.tone);
              return (
                <div
                  key={alarm.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    alarm.enabled
                      ? 'bg-white/[0.04] border-emerald-500/30 text-white'
                      : 'bg-white/[0.01] border-white/5 text-zinc-500 opacity-60'
                  }`}
                >
                  {/* Delete & Toggle Switch */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(alarm.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="حذف المنبه"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleToggle(alarm.id)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                        alarm.enabled ? 'bg-emerald-500' : 'bg-zinc-800'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          alarm.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Alarm Info */}
                  <div className="flex-1 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-xs font-medium text-zinc-300">{alarm.label}</span>
                      <span className="text-xl font-black font-mono tracking-wider text-emerald-400">
                        {alarm.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-2 text-[10px] text-zinc-400 mt-0.5">
                      <button
                        onClick={() => handlePlayPreview(alarm.tone)}
                        className="flex items-center gap-1 text-zinc-400 hover:text-emerald-300 transition-colors"
                      >
                        {previewingTone === alarm.tone ? (
                          <Square className="h-3 w-3 text-red-400" />
                        ) : (
                          <Play className="h-3 w-3 text-emerald-400" />
                        )}
                        <span>{toneObj?.nameArabic.split('(')[0] || alarm.tone}</span>
                      </button>
                      <span>•</span>
                      <span>مستوى الصوت: {Math.round(alarm.volume * 100)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Alarm Form */}
          {showAddForm && (
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-emerald-500/30 space-y-3.5 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-1 border-b border-white/5">
                <span className="text-xs text-zinc-400">خصص الوقت والنغمة بالكامل</span>
                <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>ضبط منبه جديد</span>
                </h4>
              </div>

              {/* Quick Presets */}
              <div>
                <span className="text-[11px] text-zinc-400 mb-1.5 block">أوقات مقترحة سريعة:</span>
                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  <button
                    onClick={() => setQuickTime('06:00', 'استيقاظ باكر (6:00 ص)', 'military')}
                    className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-emerald-500/20 hover:text-emerald-300 text-zinc-300 border border-white/5 text-center transition-all"
                  >
                    06:00 ص (استيقاظ)
                  </button>
                  <button
                    onClick={() => setQuickTime('06:30', 'تجهيز دوام المدرسة', 'cyber')}
                    className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-emerald-500/20 hover:text-emerald-300 text-zinc-300 border border-white/5 text-center transition-all"
                  >
                    06:30 ص (الدوام)
                  </button>
                  <button
                    onClick={() => setQuickTime('17:30', 'تمرين الكاليسثينكس', 'radar')}
                    className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-emerald-500/20 hover:text-emerald-300 text-zinc-300 border border-white/5 text-center transition-all"
                  >
                    05:30 م (التمرين)
                  </button>
                </div>
              </div>

              {/* Time Input */}
              <div>
                <label className="text-[11px] text-zinc-300 block mb-1">وقت الرنين (ساعة : دقيقة):</label>
                <div className="flex items-center justify-center p-2 rounded-xl bg-black/40 border border-white/10">
                  <Clock className="h-5 w-5 text-emerald-400 mr-2" />
                  <input
                    type="time"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="bg-transparent text-2xl font-mono font-bold text-white outline-none text-center tracking-widest cursor-pointer"
                  />
                </div>
              </div>

              {/* Label Input */}
              <div>
                <label className="text-[11px] text-zinc-300 block mb-1">تسمية المنبه / الهدف:</label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  placeholder="مثال: استيقاظ باكر لمراجعة الكلية"
                  className="w-full p-2.5 rounded-xl bg-black/30 border border-white/10 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* Tone Selector with Preview */}
              <div>
                <label className="text-[11px] text-zinc-300 block mb-1">اختيار النغمة الصوتية:</label>
                <div className="space-y-1.5">
                  {AVAILABLE_RINGTONES.map(tone => (
                    <div
                      key={tone.id}
                      onClick={() => setNewTone(tone.id)}
                      className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        newTone === tone.id
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
                          : 'bg-white/[0.02] border-white/5 text-zinc-300 hover:bg-white/[0.05]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayPreview(tone.id);
                        }}
                        className="p-1 rounded-lg bg-black/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center gap-1 text-[10px]"
                      >
                        {previewingTone === tone.id ? (
                          <Square className="h-3.5 w-3.5 text-red-400" />
                        ) : (
                          <Play className="h-3.5 w-3.5" />
                        )}
                        <span>معاينة</span>
                      </button>

                      <div className="text-right">
                        <span className="text-xs font-semibold block">{tone.nameArabic}</span>
                        <span className="text-[10px] text-zinc-400">{tone.descriptionArabic}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Volume Slider */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-zinc-300 mb-1">
                  <span className="font-mono text-emerald-400">{Math.round(newVolume * 100)}%</span>
                  <div className="flex items-center gap-1">
                    <Volume2 className="h-3.5 w-3.5 text-zinc-400" />
                    <span>مستوى صوت المنبه:</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={newVolume}
                  onChange={e => setNewVolume(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSaveNewAlarm}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-md shadow-emerald-500/30 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                <span>حفظ وتفعيل المنبه الآن</span>
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400 flex-shrink-0">
          <div className="flex items-center gap-1 text-emerald-400 font-medium">
            <BellRing className="h-3.5 w-3.5" />
            <span>يعمل في الخلفية والموبايل</span>
          </div>
          <span>اضبط على 06:00 وسيرن تلقائياً</span>
        </div>

      </div>
    </div>
  );
};
