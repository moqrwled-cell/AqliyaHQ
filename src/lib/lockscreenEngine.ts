// ============================================================================
// MOHA AGENT — LUXURY LOCKSCREEN & EISENHOWER TASK MATRIX ENGINE
// Inspired by Mohammad's Luxury Lockscreen Dashboard (2026 Year Progress & Quadrants)
// ============================================================================

import { LocalNotifications } from '@capacitor/local-notifications';
import { UnifiedStorage } from './storage/unifiedStorage';

export type TaskQuadrant = 'urgent_important' | 'important' | 'urgent' | 'someday';

export interface LockscreenTask {
  id: string;
  quadrant: TaskQuadrant;
  title: string;
  time?: string; // e.g. "18:00", "16:00"
  dateStr?: string; // e.g. "2026-10-18"
  completed: boolean;
  color?: string; // For calendar pill
  createdAt: string;
}

export interface YearProgressInfo {
  year: number;
  percentage: number;
  daysPassed: number;
  daysRemaining: number;
  totalDays: number;
  monthsCapsules: {
    letter: string; // ي ف م أ م ي ل غ س ك ب د
    name: string;
    monthIndex: number;
    fillPercentage: number; // 0 to 100
    isCurrent: boolean;
  }[];
}

const STORAGE_TASKS_KEY = 'moha_lockscreen_tasks_v1';
const STORAGE_FOCUS_KEY = 'moha_period_focus_v1';
export const NOTIFICATION_CHANNEL_ID = 'moha_luxury_channel';

export class LockscreenEngine {
  /**
   * Initialize notification channel on Android
   */
  public static async initNotificationChannel(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && 'Capacitor' in window) {
        await LocalNotifications.createChannel({
          id: NOTIFICATION_CHANNEL_ID,
          name: 'قناة المهام وشاشة القفل الفاخرة',
          description: 'إشعارات فاخرة للمهام الحرجة ومصفوفة شاشة القفل وتذكيرات الاستشفاء',
          importance: 5, // High
          visibility: 1, // Public on lockscreen
          sound: 'radar.wav',
          vibration: true,
          lights: true,
          lightColor: '#FFFFFF',
        });
      }
    } catch (e) {
      console.warn('Error creating notification channel:', e);
    }
  }

  /**
   * Get all tasks
   */
  public static getTasks(): LockscreenTask[] {
    try {
      const raw = localStorage.getItem(STORAGE_TASKS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}

    // Seed realistic tasks matching the user's screenshot
    const seed = this.getSeedTasks();
    try {
      localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(seed));
    } catch (e) {}
    return seed;
  }

  /**
   * Save all tasks and notify listeners
   */
  public static saveTasks(tasks: LockscreenTask[]): void {
    try {
      localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(tasks));
      window.dispatchEvent(new CustomEvent('moha:lockscreen-tasks-updated', { detail: tasks }));
    } catch (e) {}
  }

  /**
   * Add a new task
   */
  public static addTask(task: Omit<LockscreenTask, 'id' | 'createdAt' | 'completed'>): LockscreenTask {
    const tasks = this.getTasks();
    const newTask: LockscreenTask = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      completed: false,
      createdAt: new Date().toISOString(),
    };
    tasks.unshift(newTask);
    this.saveTasks(tasks);
    this.syncLockscreenNotification();
    return newTask;
  }

  /**
   * Toggle task completion
   */
  public static toggleTask(id: string): LockscreenTask | null {
    const tasks = this.getTasks();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx >= 0) {
      tasks[idx].completed = !tasks[idx].completed;
      this.saveTasks(tasks);
      this.syncLockscreenNotification();
      return tasks[idx];
    }
    return null;
  }

  /**
   * Delete task
   */
  public static deleteTask(id: string): boolean {
    const tasks = this.getTasks();
    const filtered = tasks.filter((t) => t.id !== id);
    if (filtered.length !== tasks.length) {
      this.saveTasks(filtered);
      this.syncLockscreenNotification();
      return true;
    }
    return false;
  }

  /**
   * Get Current Strategic Period Focus
   */
  public static getPeriodFocus(): { focus: string; periodTitle: string; deadline?: string } {
    try {
      const raw = localStorage.getItem(STORAGE_FOCUS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}

    const defaultFocus = {
      periodTitle: 'مرحلة الانطلاق وإغلاق الصفقات 2026',
      focus: 'التركيز على إغلاق أول 3 صفقات في نظام نيكسيس القانوني، وتثبيت وجبات 3000 سعرة لبناء وزن 70 كجم.',
      deadline: 'نهاية شهر نوفمبر 2026',
    };
    try {
      localStorage.setItem(STORAGE_FOCUS_KEY, JSON.stringify(defaultFocus));
    } catch (e) {}
    return defaultFocus;
  }

  /**
   * Set Current Strategic Period Focus
   */
  public static setPeriodFocus(focus: string, periodTitle: string = 'تركيز الفترة الحالية', deadline?: string): void {
    const data = { focus, periodTitle, deadline };
    try {
      localStorage.setItem(STORAGE_FOCUS_KEY, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('moha:period-focus-updated', { detail: data }));
      this.syncLockscreenNotification();
    } catch (e) {}
  }

  /**
   * Calculate 2026 Year Progress & 12 Month Capsules (Matching Image 2)
   */
  public static getYearProgressInfo(targetYear: number = 2026): YearProgressInfo {
    const now = new Date();
    const isTargetYear = now.getFullYear() === targetYear;

    const startOfYear = new Date(targetYear, 0, 1);
    const endOfYear = new Date(targetYear, 11, 31, 23, 59, 59);
    const totalDays = 365;

    let daysPassed = 0;
    if (isTargetYear) {
      const diffTime = now.getTime() - startOfYear.getTime();
      daysPassed = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    } else if (now.getFullYear() > targetYear) {
      daysPassed = totalDays;
    } else {
      daysPassed = 1;
    }

    const percentage = Math.min(100, Math.round((daysPassed / totalDays) * 100));
    const daysRemaining = Math.max(0, totalDays - daysPassed);

    // 12 Arabic initial letters for the 12 months as in Image 2:
    // ي (يناير), ف (فبراير), م (مارس), أ (أبريل), م (مايو), ي (يونيو), ل (يوليو), غ (أغسطس), س (سبتمبر), ك (أكتوبر), ب (نوفمبر), د (ديسمبر)
    const monthConfigs = [
      { letter: 'ي', name: 'يناير', days: 31 },
      { letter: 'ف', name: 'فبراير', days: 28 },
      { letter: 'م', name: 'مارس', days: 31 },
      { letter: 'أ', name: 'أبريل', days: 30 },
      { letter: 'م', name: 'مايو', days: 31 },
      { letter: 'ي', name: 'يونيو', days: 30 },
      { letter: 'ل', name: 'يوليو', days: 31 },
      { letter: 'غ', name: 'أغسطس', days: 31 },
      { letter: 'س', name: 'سبتمبر', days: 30 },
      { letter: 'ك', name: 'أكتوبر', days: 31 },
      { letter: 'ب', name: 'نوفمبر', days: 30 },
      { letter: 'د', name: 'ديسمبر', days: 31 },
    ];

    const currentMonthIdx = isTargetYear ? now.getMonth() : 10; // 0-based
    const currentDayOfMonth = isTargetYear ? now.getDate() : 14;

    const monthsCapsules = monthConfigs.map((m, idx) => {
      let fill = 0;
      if (idx < currentMonthIdx) {
        fill = 100;
      } else if (idx === currentMonthIdx) {
        fill = Math.round((currentDayOfMonth / m.days) * 100);
      } else {
        fill = 0;
      }

      return {
        letter: m.letter,
        name: m.name,
        monthIndex: idx,
        fillPercentage: fill,
        isCurrent: idx === currentMonthIdx,
      };
    });

    return {
      year: targetYear,
      percentage,
      daysPassed,
      daysRemaining,
      totalDays,
      monthsCapsules,
    };
  }

  /**
   * Sync active urgent/important tasks into an ongoing Android lockscreen notification
   */
  public static async syncLockscreenNotification(): Promise<boolean> {
    const unifiedTasks = UnifiedStorage.getTasks().filter((t) => !t.isCompleted);
    const urgentImportant = unifiedTasks.filter((t) => t.quadrant === 'urgent_important');
    const important = unifiedTasks.filter((t) => t.quadrant === 'important');
    const urgent = unifiedTasks.filter((t) => t.quadrant === 'urgent');

    const focus = UnifiedStorage.getPeriodFocus();

    let notificationTitle = 'Moha Agent | أولويات شاشة القفل ⚡';
    if (urgentImportant.length > 0) {
      notificationTitle = `🔥 مهم وعاجل (${urgentImportant.length}): ${urgentImportant[0].title}`;
    }

    const lines: string[] = [];
    if (urgentImportant.length > 0) {
      lines.push(`🔥 عاجل: ${urgentImportant.map((t) => t.title).join(' • ')}`);
    }
    if (important.length > 0) {
      lines.push(`🟦 مهم: ${important.map((t) => t.title).join(' • ')}`);
    }
    if (urgent.length > 0) {
      lines.push(`⚡ أولوية: ${urgent.map((t) => t.title).join(' • ')}`);
    }
    if (lines.length === 0) {
      lines.push(`🎯 التركيز الحالي: ${focus.focus || focus.periodTitle}`);
    }

    const bodyText = lines.slice(0, 3).join('\n');

    try {
      await this.initNotificationChannel();
      const perms = await LocalNotifications.requestPermissions();
      if (perms.display === 'granted') {
        // Cancel previous sticky notification ID 9001
        try {
          await LocalNotifications.cancel({ notifications: [{ id: 9001 }] });
        } catch (e) {}

        await LocalNotifications.schedule({
          notifications: [
            {
              id: 9001,
              title: notificationTitle,
              body: bodyText,
              channelId: NOTIFICATION_CHANNEL_ID,
              ongoing: true, // Remains on lockscreen
              autoCancel: false,
              extra: { type: 'lockscreen_sync' },
              actionTypeId: 'LOCKSCREEN_ACTION',
            },
          ],
        });
        return true;
      }
    } catch (e) {
      console.warn('Capacitor lockscreen notification sync fallback:', e);
    }
    return false;
  }

  /**
   * Seed tasks matching Image 1
   */
  private static getSeedTasks(): LockscreenTask[] {
    return [
      // 1. مهم وعاجل (Urgent & Important)
      {
        id: 'task-ui-1',
        quadrant: 'urgent_important',
        title: 'الرد على الإيميلات المهمة والعملاء',
        completed: false,
        color: '#f97316',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'task-ui-2',
        quadrant: 'urgent_important',
        title: 'اللحاق بموعد المحاضرة والاجتماع',
        time: '18:00',
        completed: false,
        color: '#ef4444',
        createdAt: new Date().toISOString(),
      },

      // 2. مهم (Important)
      {
        id: 'task-imp-1',
        quadrant: 'important',
        title: 'تمرين كاليسثنكس 40 دقيقة',
        completed: false,
        color: '#3b82f6',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'task-imp-2',
        quadrant: 'important',
        title: 'قراءة 10 صفحات وتدوين الملاحظات',
        completed: false,
        color: '#60a5fa',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'task-imp-3',
        quadrant: 'important',
        title: 'تخطيط الأسبوع القادم وتحديث نيكسيس',
        time: 'غداً',
        completed: false,
        color: '#38bdf8',
        createdAt: new Date().toISOString(),
      },

      // 3. عاجل (Urgent)
      {
        id: 'task-urg-1',
        quadrant: 'urgent',
        title: 'استلام الشحنة وإيداع الفاتورة',
        time: '16:00',
        completed: false,
        color: '#eab308',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'task-urg-2',
        quadrant: 'urgent',
        title: 'الرد على رسائل الفريق والكلية',
        completed: false,
        color: '#facc15',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'task-urg-3',
        quadrant: 'urgent',
        title: 'شراء أغراض وجبات الطاقة للوزن',
        dateStr: '18 أكتوبر',
        completed: false,
        color: '#f59e0b',
        createdAt: new Date().toISOString(),
      },

      // 4. يوماً ما (Someday)
      {
        id: 'task-some-1',
        quadrant: 'someday',
        title: 'ترتيب طلعة نهاية الأسبوع واستعادة النشاط',
        completed: false,
        color: '#a1a1aa',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'task-some-2',
        quadrant: 'someday',
        title: 'ترتيب وتنظيف صور وملفات الجوال',
        completed: false,
        color: '#71717a',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'task-some-3',
        quadrant: 'someday',
        title: 'ترتيب دولاب الملابس والكتب',
        dateStr: '5 نوفمبر',
        completed: false,
        color: '#52525b',
        createdAt: new Date().toISOString(),
      },
    ];
  }
}
