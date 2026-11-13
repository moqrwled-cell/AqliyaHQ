import React, { useState } from 'react';
import { Moon, Sun, Clock, Check, X, Sparkles, Award } from 'lucide-react';
import { SleepTrackerEngine } from '../../lib/sleepTrackerEngine';

interface SleepLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export const SleepLoggerModal: React.FC<SleepLoggerModalProps> = ({ isOpen, onClose, onSave }) => {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const [dateStr, setDateStr] = useState(todayStr);
  const [sleepTime, setSleepTime] = useState('23:30');
  const [wakeTime, setWakeTime] = useState('07:45');
  const [quality, setQuality] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const durationMin = SleepTrackerEngine.calculateDurationMinutes(sleepTime, wakeTime);
  const hours = Math.floor(durationMin / 60);
  const mins = durationMin % 60;
  const category = SleepTrackerEngine.getCategory(durationMin);

  const getCategoryBadge = () => {
    switch (category) {
      case 'h8':
        return { label: '8 ساعات (مثالي للنمو والتركيز) ✨', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'h7':
        return { label: '7 ساعات (جيد وكافٍ) 👍', color: 'bg-green-500/20 text-green-300 border-green-500/30' };
      case 'h9plus':
        return { label: '9+ ساعات (استشفاء عميق) 🛌', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'h6':
        return { label: '6 ساعات (حد أدنى) ⚠️', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30' };
      case 'less6':
      default:
        return { label: 'أقل من 6 ساعات (عجز نوم بحاجة للتعويض) ❌', color: 'bg-red-500/20 text-red-300 border-red-500/30' };
    }
  };

  const badge = getCategoryBadge();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    SleepTrackerEngine.logSleep(dateStr, sleepTime, wakeTime, quality, notes);
    if (onSave) onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 text-right font-sans">
      <div className="apple-glass w-full max-w-sm rounded-3xl p-5 border border-white/15 shadow-2xl space-y-4 bg-[#0a0a0c] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-zinc-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            <div>
              <h3 className="text-sm font-bold text-white">توثيق النوم والاستيقاظ</h3>
              <p className="text-[10px] text-zinc-400">مراقبة الاستشفاء العضلي والصحة</p>
            </div>
            <div className="p-2 rounded-xl bg-white/10 text-white border border-white/10">
              <Moon className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Live Calculation Preview */}
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2 text-center">
          <span className="text-[11px] text-zinc-400 block">ساعات النوم المحسوبة:</span>
          <div className="flex items-baseline justify-center gap-1 font-mono text-white">
            <span className="text-3xl font-black">{hours}</span>
            <span className="text-xs text-zinc-400">ساعة</span>
            <span className="text-2xl font-black mr-2">{mins}</span>
            <span className="text-xs text-zinc-400">دقيقة</span>
          </div>

          <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold border ${badge.color}`}>
            <span>{badge.label}</span>
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSave} className="space-y-3 text-xs">
          <div>
            <label className="text-zinc-400 block mb-1">التاريخ:</label>
            <input
              type="date"
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              className="w-full rounded-xl bg-white/[0.05] border border-white/10 px-3 py-2 text-white font-mono focus:outline-none focus:border-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-zinc-400 block mb-1 flex items-center justify-end gap-1">
                <span>وقت النوم</span>
                <Moon className="h-3 w-3 text-zinc-400" />
              </label>
              <input
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                className="w-full rounded-xl bg-white/[0.05] border border-white/10 px-3 py-2 text-white font-mono text-center focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="text-zinc-400 block mb-1 flex items-center justify-end gap-1">
                <span>وقت الاستيقاظ</span>
                <Sun className="h-3 w-3 text-zinc-400" />
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full rounded-xl bg-white/[0.05] border border-white/10 px-3 py-2 text-white font-mono text-center focus:outline-none focus:border-white"
              />
            </div>
          </div>

          {/* Quality Rating (1 - 5) */}
          <div>
            <label className="text-zinc-400 block mb-1.5">جودة النوم والراحة:</label>
            <div className="flex items-center justify-between gap-1 bg-white/[0.02] p-1.5 rounded-xl border border-white/5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setQuality(star as any)}
                  className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${
                    quality === star
                      ? 'bg-white text-black shadow-md'
                      : 'text-zinc-400 hover:text-white bg-white/[0.03]'
                  }`}
                >
                  {star === 5 ? 'عميق 😴' : star === 4 ? 'ممتاز ✨' : star === 3 ? 'متوسط 😐' : star === 2 ? 'متقطع 😣' : 'سيء ❌'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-zinc-400 block mb-1">ملاحظة (اختياري):</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: نمت بعد تمرين شاق، شربت حليب بالتمر..."
              className="w-full rounded-xl bg-white/[0.05] border border-white/10 px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-white"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/10 text-zinc-300 text-xs font-bold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-2xl bg-white hover:bg-zinc-200 text-black font-bold text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="h-4 w-4" />
              <span>حفظ سجل النوم</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
