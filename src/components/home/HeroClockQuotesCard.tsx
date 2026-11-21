import React, { useState, useEffect } from 'react';
import { Shuffle, Sparkles, Moon, PhoneCall, Menu, Clock, Calendar } from 'lucide-react';
import { INSPIRATIONAL_QUOTES, type DailyQuote } from '../../lib/quotes/inspirationalQuotes';
import { tacticalAudio } from '../../lib/audio';

interface HeroClockQuotesCardProps {
  onOpenVoiceCall?: () => void;
  onOpenBriefing?: () => void;
  onOpenAlarm?: () => void;
  onOpenMenu?: () => void;
  watchdogCount?: number;
  sleepScore?: number;
  periodTitle?: string;
}

export const HeroClockQuotesCard: React.FC<HeroClockQuotesCardProps> = ({
  onOpenVoiceCall,
  onOpenBriefing,
  onOpenAlarm,
  onOpenMenu,
  watchdogCount = 0,
  sleepScore,
  periodTitle,
}) => {
  // Live Clock (Bulletproof calculation independent of system locale bugs)
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 12-hour digital time string (e.g. 09:28:45) + AM/PM
  const rawHours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const isPM = rawHours >= 12;
  const hours12 = String(rawHours % 12 || 12).padStart(2, '0');
  const timeDigits = `${hours12}:${minutes}:${seconds}`;
  const amPmArabic = isPM ? 'مساءً' : 'صباحاً';

  // Full Arabic Date (e.g. السبت، 21 نوفمبر 2026)
  const arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const arabicMonths = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  const dayName = arabicDays[now.getDay()];
  const dayNum = now.getDate();
  const monthName = arabicMonths[now.getMonth()];
  const yearNum = now.getFullYear();
  const fullArabicDate = `${dayName}، ${dayNum} ${monthName} ${yearNum}`;

  // Rotating Quotes (105+ Quotes from World Classics & Leaders)
  const getInitialQuoteIndex = () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return Math.abs(dayOfYear) % INSPIRATIONAL_QUOTES.length;
  };

  const [quoteIndex, setQuoteIndex] = useState(getInitialQuoteIndex);

  const handleNextQuote = () => {
    tacticalAudio.playBlip();
    setQuoteIndex((prev) => (prev + 1) % INSPIRATIONAL_QUOTES.length);
  };

  const currentQuote: DailyQuote = INSPIRATIONAL_QUOTES[quoteIndex] || INSPIRATIONAL_QUOTES[0];

  const categoryLabels: Record<string, { label: string; color: string }> = {
    resilience: { label: 'الصمود وتحدي الصعاب', color: 'text-amber-300 bg-amber-500/15 border-amber-500/30' },
    discipline: { label: 'الانضباط وبناء الذات', color: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30' },
    leadership: { label: 'القيادة والرؤية', color: 'text-cyan-300 bg-cyan-500/15 border-cyan-500/30' },
    wisdom: { label: 'حكمة وفلسفة', color: 'text-purple-300 bg-purple-500/15 border-purple-500/30' },
    focus: { label: 'التركيز والإنتاجية', color: 'text-rose-300 bg-rose-500/15 border-rose-500/30' },
  };

  return (
    <div className="w-full rounded-3xl bg-gradient-to-b from-white/[0.08] via-white/[0.03] to-transparent border border-white/10 p-4 sm:p-5 shadow-2xl relative overflow-hidden backdrop-blur-2xl space-y-4 text-right">
      {/* Background ambient lighting */}
      <div className="absolute -top-16 -right-16 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top quick controls & status bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap relative z-10">
        <div className="flex items-center gap-1.5">
          {onOpenVoiceCall && (
            <button
              onClick={onOpenVoiceCall}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-xs text-cyan-300 hover:bg-cyan-500/25 active:scale-95 transition-all flex items-center gap-1.5 font-bold"
              title="مكالمة صوتية مباشرة"
            >
              <PhoneCall className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">اتصال</span>
            </button>
          )}

          {onOpenBriefing && (
            <button
              onClick={onOpenBriefing}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/[0.06] border border-white/10 text-xs text-zinc-300 hover:text-white active:scale-95 transition-all flex items-center gap-1.5 font-bold"
              title="إحاطة اليوم"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">الإحاطة</span>
            </button>
          )}

          {onOpenAlarm && (
            <button
              onClick={onOpenAlarm}
              className="p-1.5 rounded-xl bg-white/[0.06] border border-white/10 text-zinc-300 hover:text-white active:scale-95 transition-all text-sm"
              title="المنبه"
            >
              ⏰
            </button>
          )}

          {watchdogCount > 0 && (
            <div className="px-2 py-1 rounded-xl bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30 flex items-center gap-1">
              <span>⚠️</span>
              <span>{watchdogCount}</span>
            </div>
          )}

          {onOpenMenu && (
            <button
              onClick={onOpenMenu}
              className="p-1.5 rounded-xl bg-white/[0.06] border border-white/10 text-zinc-400 hover:text-white active:scale-95 transition-all"
              title="القائمة"
            >
              <Menu className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {periodTitle && (
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
              <Sparkles className="h-3 w-3" />
              <span>{periodTitle}</span>
            </div>
          )}

          {sleepScore !== undefined && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-[11px] text-zinc-300 font-mono">
              <Moon className="h-3 w-3 text-cyan-400" />
              <span>الاستشفاء {sleepScore}%</span>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. DIGITAL CLOCK & FULL ARABIC DATE                           */}
      {/* ------------------------------------------------------------- */}
      <div className="text-center py-2 relative z-10 space-y-1">
        {/* Digital Time */}
        <div className="flex items-center justify-center gap-2.5">
          <span className="text-3xl sm:text-5xl font-black tracking-widest text-white font-mono drop-shadow-[0_2px_20px_rgba(255,255,255,0.25)]">
            {timeDigits}
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-white/10 border border-white/15 text-xs sm:text-sm font-bold text-amber-300">
            {amPmArabic}
          </span>
        </div>

        {/* Full Date */}
        <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-zinc-300 pt-0.5">
          <Calendar className="h-3.5 w-3.5 text-cyan-400 inline" />
          <span>{fullArabicDate}</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. DYNAMIC INSPIRATIONAL QUOTES CARD (105+ Quotes)            */}
      {/* ------------------------------------------------------------- */}
      <div
        onClick={handleNextQuote}
        className="group relative cursor-pointer rounded-2xl bg-black/50 hover:bg-black/70 border border-white/15 hover:border-white/30 p-4 transition-all duration-300 active:scale-[0.99] shadow-inner"
        title="انقر لتغيير المقولة"
      >
        {/* Card header */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 group-hover:text-cyan-400 transition-colors">
            <Shuffle className="h-3.5 w-3.5 group-hover:rotate-180 transition-transform duration-500" />
            <span>انقر لتغيير الحكمة (105 مقولات)</span>
          </div>

          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${categoryLabels[currentQuote.category]?.color || 'text-zinc-300 bg-white/5 border-white/10'}`}>
            {categoryLabels[currentQuote.category]?.label || 'حكمة قيادية'}
          </span>
        </div>

        {/* Quote text */}
        <p className="text-sm sm:text-base font-bold text-zinc-100 leading-relaxed text-right font-sans mb-3 pr-1">
          «{currentQuote.text}»
        </p>

        {/* Quote Author & Source */}
        <div className="flex items-center justify-start gap-2 text-xs sm:text-sm text-amber-300 font-semibold flex-wrap">
          <span>— {currentQuote.author}</span>
          {currentQuote.source && (
            <>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400 text-xs italic font-serif">({currentQuote.source})</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
