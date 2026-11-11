// ============================================================================
// MOHA AGENT — ADVANCED ALARM ENGINE (WEB AUDIO API + NATIVE VIBRATION)
// ============================================================================

export type RingtoneToneId = 'military' | 'radar' | 'gentle' | 'siren' | 'cyber';

export interface RingtoneOption {
  id: RingtoneToneId;
  nameArabic: string;
  descriptionArabic: string;
}

export const AVAILABLE_RINGTONES: RingtoneOption[] = [
  {
    id: 'military',
    nameArabic: 'بوق الاستيقاظ العسكري (Military Reveille)',
    descriptionArabic: 'نغمات حماسية تصاعدية لليقظة والنشاط الفوري',
  },
  {
    id: 'radar',
    nameArabic: 'رادار النخبة النبضي (Radar Pulse)',
    descriptionArabic: 'نبضات صوتية دورية متكررة عالية الوضوح',
  },
  {
    id: 'gentle',
    nameArabic: 'رنين هادئ تصاعدي (Gentle Chime)',
    descriptionArabic: 'طبقات هارمونية ناعمة للاستيقاظ دون فزع',
  },
  {
    id: 'cyber',
    nameArabic: 'تنبيه إلكتروني حاد (Cyber Digital)',
    descriptionArabic: 'الصفير الكلاسيكي الرقمي للساعات الذكية',
  },
  {
    id: 'siren',
    nameArabic: 'إنذار الطوارئ التكتيكي (Tactical Siren)',
    descriptionArabic: 'نغمة ترددية مستمرة وقوية جداً للنوم الثقيل',
  },
];

export interface AlarmItem {
  id: string;
  time: string; // 'HH:mm' e.g. '06:00'
  label: string; // e.g. 'استيقاظ باكر وبداية اليوم'
  enabled: boolean;
  tone: RingtoneToneId;
  volume: number; // 0.1 to 1.0
  repeatDays?: number[]; // [0,1,2,3,4,6] etc.
  lastTriggeredDate?: string; // 'YYYY-MM-DD'
}

const STORAGE_KEY_ALARMS = 'moha_alarms_v1';

export class AlarmEngine {
  private static audioCtx: AudioContext | null = null;
  private static isPlaying = false;
  private static activeOscillators: OscillatorNode[] = [];
  private static intervalHandle: any = null;
  private static playbackLoopTimer: any = null;
  private static currentlyRingingAlarm: AlarmItem | null = null;

  private static getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * جلب قائمة المنبهات المحفوظة أو البدء بالإعدادات الافتراضية المناسبة لمحمد
   */
  public static getAlarms(): AlarmItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ALARMS);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to load alarms:', e);
    }

    // المنبهات الافتراضية الذكية المتوافقة مع حياة محمد
    const defaultAlarms: AlarmItem[] = [
      {
        id: 'alarm_default_wake_6am',
        time: '06:00',
        label: 'استيقاظ الفجر والنشاط (6:00 ص)',
        enabled: true,
        tone: 'military',
        volume: 0.9,
      },
      {
        id: 'alarm_default_school_630am',
        time: '06:30',
        label: 'تجهيز دوام المدرسة الصباحي (7-11 ص)',
        enabled: true,
        tone: 'cyber',
        volume: 0.85,
      },
      {
        id: 'alarm_default_workout_530pm',
        time: '17:30',
        label: 'موعد تمرين الكاليسثينكس والمرونة',
        enabled: true,
        tone: 'radar',
        volume: 0.8,
      },
      {
        id: 'alarm_default_dinner_930pm',
        time: '21:30',
        label: 'وجبة العشاء الكثيفة والراحة',
        enabled: false,
        tone: 'gentle',
        volume: 0.75,
      },
    ];

    this.saveAlarms(defaultAlarms);
    return defaultAlarms;
  }

  public static saveAlarms(alarms: AlarmItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_ALARMS, JSON.stringify(alarms));
      window.dispatchEvent(new CustomEvent('moha:alarms-updated', { detail: alarms }));
    } catch (e) {
      console.error('Failed to save alarms:', e);
    }
  }

  public static addAlarm(time: string, label: string, tone: RingtoneToneId = 'military', volume: number = 0.85): AlarmItem[] {
    const alarms = this.getAlarms();
    const newAlarm: AlarmItem = {
      id: `alarm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      time,
      label: label.trim() || 'منبه جديد',
      enabled: true,
      tone,
      volume,
    };
    alarms.push(newAlarm);
    // Sort chronologically
    alarms.sort((a, b) => a.time.localeCompare(b.time));
    this.saveAlarms(alarms);
    return alarms;
  }

  public static updateAlarm(id: string, updates: Partial<AlarmItem>): AlarmItem[] {
    const alarms = this.getAlarms().map(a => (a.id === id ? { ...a, ...updates } : a));
    alarms.sort((a, b) => a.time.localeCompare(b.time));
    this.saveAlarms(alarms);
    return alarms;
  }

  public static toggleAlarm(id: string): AlarmItem[] {
    const alarms = this.getAlarms().map(a => (a.id === id ? { ...a, enabled: !a.enabled } : a));
    this.saveAlarms(alarms);
    return alarms;
  }

  public static deleteAlarm(id: string): AlarmItem[] {
    const alarms = this.getAlarms().filter(a => a.id !== id);
    this.saveAlarms(alarms);
    return alarms;
  }

  /**
   * تشغيل نغمة صوتية مولدة برمجياً (Web Audio Synth) للمعاينة أو الرنين الفعلي
   */
  public static playTone(tone: RingtoneToneId, volume: number = 0.8, loop: boolean = false): void {
    this.stopAudioOnly();

    try {
      const ctx = this.getAudioContext();
      this.isPlaying = true;

      const schedulePattern = () => {
        if (!this.isPlaying) return;

        const now = ctx.currentTime;
        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(volume, now);
        gainNode.connect(ctx.destination);

        if (tone === 'military') {
          // نغمة بوق عسكري حماسية C major: G3, C4, E4, G4, C5
          const notes = [
            { f: 392.00, start: 0.0, dur: 0.18 }, // G4
            { f: 523.25, start: 0.22, dur: 0.18 }, // C5
            { f: 659.25, start: 0.44, dur: 0.18 }, // E5
            { f: 783.99, start: 0.66, dur: 0.35 }, // G5
            { f: 659.25, start: 1.05, dur: 0.18 }, // E5
            { f: 783.99, start: 1.25, dur: 0.45 }, // G5
          ];

          notes.forEach(({ f, start, dur }) => {
            const osc = ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(f, now + start);
            
            const noteGain = ctx.createGain();
            noteGain.gain.setValueAtTime(0, now + start);
            noteGain.gain.linearRampToValueAtTime(volume, now + start + 0.02);
            noteGain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

            osc.connect(noteGain);
            noteGain.connect(ctx.destination);

            osc.start(now + start);
            osc.stop(now + start + dur + 0.05);
            this.activeOscillators.push(osc);
          });

          if (loop && this.isPlaying) {
            this.playbackLoopTimer = setTimeout(() => {
              if (this.isPlaying) schedulePattern();
            }, 2000);
          }

        } else if (tone === 'radar') {
          // نبضات رادار متصاعدة
          for (let i = 0; i < 3; i++) {
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            const startTime = now + (i * 0.28);
            osc.frequency.setValueAtTime(1200 + (i * 200), startTime);
            osc.frequency.exponentialRampToValueAtTime(2400, startTime + 0.15);

            const noteGain = ctx.createGain();
            noteGain.gain.setValueAtTime(volume, startTime);
            noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

            osc.connect(noteGain);
            noteGain.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.22);
            this.activeOscillators.push(osc);
          }

          if (loop && this.isPlaying) {
            this.playbackLoopTimer = setTimeout(() => {
              if (this.isPlaying) schedulePattern();
            }, 1400);
          }

        } else if (tone === 'gentle') {
          // رنين بيانو/أجراس تصاعدي هادئ
          const chords = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
          chords.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            osc.type = 'triangle';
            const startTime = now + (idx * 0.25);
            osc.frequency.setValueAtTime(freq, startTime);

            const noteGain = ctx.createGain();
            noteGain.gain.setValueAtTime(0, startTime);
            noteGain.gain.linearRampToValueAtTime(volume * 0.8, startTime + 0.04);
            noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);

            osc.connect(noteGain);
            noteGain.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.85);
            this.activeOscillators.push(osc);
          });

          if (loop && this.isPlaying) {
            this.playbackLoopTimer = setTimeout(() => {
              if (this.isPlaying) schedulePattern();
            }, 2200);
          }

        } else if (tone === 'siren') {
          // صافرة إنذار مستمرة
          const osc = ctx.createOscillator();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.linearRampToValueAtTime(1400, now + 0.6);
          osc.frequency.linearRampToValueAtTime(600, now + 1.2);

          const sirenGain = ctx.createGain();
          sirenGain.gain.setValueAtTime(volume, now);
          sirenGain.gain.linearRampToValueAtTime(volume, now + 1.19);
          sirenGain.gain.linearRampToValueAtTime(0.001, now + 1.25);

          osc.connect(sirenGain);
          sirenGain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 1.25);
          this.activeOscillators.push(osc);

          if (loop && this.isPlaying) {
            this.playbackLoopTimer = setTimeout(() => {
              if (this.isPlaying) schedulePattern();
            }, 1300);
          }

        } else {
          // Cyber Digital Beep (Classic Clock)
          for (let i = 0; i < 4; i++) {
            const osc = ctx.createOscillator();
            osc.type = 'square';
            const startTime = now + (i * 0.14);
            osc.frequency.setValueAtTime(1800, startTime);

            const beepGain = ctx.createGain();
            beepGain.gain.setValueAtTime(volume * 0.6, startTime);
            beepGain.gain.setValueAtTime(0.001, startTime + 0.08);

            osc.connect(beepGain);
            beepGain.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.09);
            this.activeOscillators.push(osc);
          }

          if (loop && this.isPlaying) {
            this.playbackLoopTimer = setTimeout(() => {
              if (this.isPlaying) schedulePattern();
            }, 1000);
          }
        }
      };

      schedulePattern();
    } catch (err) {
      console.error('Audio synthesizer error:', err);
    }
  }

  public static stopAudioOnly(): void {
    this.isPlaying = false;
    if (this.playbackLoopTimer) {
      clearTimeout(this.playbackLoopTimer);
      this.playbackLoopTimer = null;
    }
    this.activeOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {}
    });
    this.activeOscillators = [];
  }

  /**
   * تشغيل الرنين الكامل للمنبه (صوت متكرر + اهتزاز الهاتف + إشعار)
   */
  public static triggerAlarm(alarm: AlarmItem): void {
    this.currentlyRingingAlarm = alarm;

    // 1. تشغيل الصوت بتكرار مستمر
    this.playTone(alarm.tone, alarm.volume, true);

    // 2. اهتزاز الهاتف إذا كان مدعوماً
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([1000, 400, 1000, 400, 2000]);
      } catch (e) {}
    }

    // 3. إطلاق إشعار عالي الأهمية
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`⏰ منبه Moha Agent: ${alarm.time}`, {
          body: `${alarm.label}\nحان الوقت للتحرك الآن بكل حزم!`,
          icon: '/logo.png',
          requireInteraction: true,
          tag: 'moha-alarm-ringing',
        });
      } catch (e) {}
    }

    // 4. إشعار الواجهة بالرنين لإظهار شاشة المنبه المنبثقة
    window.dispatchEvent(new CustomEvent('moha:alarm-triggered', { detail: alarm }));
  }

  /**
   * إيقاف المنبه بالكامل
   */
  public static dismissAlarm(): void {
    this.stopAudioOnly();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(0);
      } catch (e) {}
    }
    this.currentlyRingingAlarm = null;
    window.dispatchEvent(new CustomEvent('moha:alarm-dismissed'));
  }

  /**
   * غفوة للمنبه (5 دقائق إضافية)
   */
  public static snoozeAlarm(minutes: number = 5): void {
    const current = this.currentlyRingingAlarm;
    this.dismissAlarm();

    if (current) {
      const now = new Date();
      now.setMinutes(now.getMinutes() + minutes);
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const snoozeTime = `${hh}:${mm}`;

      this.addAlarm(snoozeTime, `غفوة: ${current.label}`, current.tone, current.volume);
    }
  }

  public static getCurrentlyRingingAlarm(): AlarmItem | null {
    return this.currentlyRingingAlarm;
  }

  /**
   * بدء محرك الفحص الدائم (يفحص كل ثانية لتوافق الوقت بدقة تامة)
   */
  public static startMonitoring(): void {
    if (this.intervalHandle) return;

    this.intervalHandle = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const todayDateStr = now.toISOString().split('T')[0];

      const alarms = this.getAlarms();
      let hasUpdates = false;

      alarms.forEach(alarm => {
        if (alarm.enabled && alarm.time === currentTimeStr) {
          // التأكد من عدم تكرار الرنين خلال نفس الدقيقة لليوم نفسه
          if (alarm.lastTriggeredDate !== todayDateStr) {
            alarm.lastTriggeredDate = todayDateStr;
            hasUpdates = true;
            this.triggerAlarm(alarm);
          }
        }
      });

      if (hasUpdates) {
        this.saveAlarms(alarms);
      }
    }, 1000);
  }

  public static stopMonitoring(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }
}
