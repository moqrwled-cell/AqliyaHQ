// ============================================================================
// AQLIYA HQ — ADVISOR PROACTIVE NUDGE & MORNING/EVENING SITREP ENGINE
// Proactively monitors time, deadlines, and goal adherence in the background
// Dispatches smart Android Lockscreen & Ongoing Sticky Notifications.
// ============================================================================

import { UnifiedStorage } from '../storage/unifiedStorage';
import { LockscreenEngine } from '../lockscreenEngine';
import { NotificationManager } from '../notifications/notificationManager';
import { SleepTrackerEngine } from '../sleepTrackerEngine';

export class AdvisorProactiveEngine {
  private static timerId: any = null;
  private static LAST_MORNING_NUDGE_KEY = 'aqliya_last_morning_nudge';
  private static LAST_EVENING_NUDGE_KEY = 'aqliya_last_evening_nudge';

  /**
   * Start the proactive monitoring background worker
   */
  public static start(): void {
    if (this.timerId) return;

    // Run immediate sync
    this.tick();

    // Check every 5 minutes
    this.timerId = setInterval(() => {
      this.tick();
    }, 5 * 60 * 1000);

    // Also sync whenever tasks or goals update
    if (typeof window !== 'undefined') {
      window.addEventListener('aqliya:tasks-updated', () => LockscreenEngine.syncLockscreenNotification());
      window.addEventListener('aqliya:goals-updated', () => LockscreenEngine.syncLockscreenNotification());
      window.addEventListener('aqliya:focus-updated', () => LockscreenEngine.syncLockscreenNotification());
    }
  }

  public static stop(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * Main proactive evaluation cycle
   */
  public static async tick(): Promise<void> {
    try {
      // 1. Sync Lockscreen Sticky Notification
      await LockscreenEngine.syncLockscreenNotification();

      const now = new Date();
      const currentHour = now.getHours();
      const todayStr = now.toISOString().split('T')[0];

      // 2. Morning Briefing Nudge (Between 07:00 and 08:30)
      const lastMorning = localStorage.getItem(this.LAST_MORNING_NUDGE_KEY);
      if (currentHour >= 7 && currentHour < 9 && lastMorning !== todayStr) {
        const tasks = UnifiedStorage.getTasks().filter((t) => !t.isCompleted);
        const topTask = tasks[0];
        const recoveryScore = SleepTrackerEngine.getRecoveryScore();

        NotificationManager.sendNotification(
          'Moha Agent | ملخص الصباح التكتيكي 🌅',
          `صباح العزيمة يا قائد محمد! الاستشفاء: ${recoveryScore}%. لديك (${tasks.length}) مهام اليوم. الأولوية الأولى: "${topTask?.title || 'تحديد أولويات اليوم'}"`
        );
        localStorage.setItem(this.LAST_MORNING_NUDGE_KEY, todayStr);
      }

      // 3. Evening Review & Recovery Nudge (Between 21:00 and 23:00)
      const lastEvening = localStorage.getItem(this.LAST_EVENING_NUDGE_KEY);
      if (currentHour >= 21 && currentHour <= 23 && lastEvening !== todayStr) {
        const completedTasks = UnifiedStorage.getTasks().filter((t) => t.isCompleted);
        NotificationManager.sendNotification(
          'Moha Agent | الإحاطة المسائية ومراجعة اليوم 🌙',
          `أحسنت يا قائد! أنجزت (${completedTasks.length}) مهام اليوم. لا تنسَ توثيق السعرات (3000kcal) والنوم المبكر للاستشفاء العضلي.`
        );
        localStorage.setItem(this.LAST_EVENING_NUDGE_KEY, todayStr);
      }
    } catch (e) {
      console.warn('AdvisorProactiveEngine tick error:', e);
    }
  }
}
