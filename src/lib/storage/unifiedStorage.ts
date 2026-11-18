// ============================================================================
// AQLIYA HQ — UNIFIED PERSISTENT STORAGE & BACKUP ENGINE (v2.0)
// Prevents any data loss, enables 1-tap JSON export & restore,
// and manages dynamic goals, tasks, intel, habits, sleep, and settings.
// ============================================================================

export interface SystemGoal {
  id: string;
  title: string;
  description: string;
  category: 'business' | 'fitness' | 'academic' | 'personal';
  targetValue?: string; // e.g. "3 deals", "70 kg", "3000 kcal"
  currentValue?: string;
  progressPercent: number; // 0 to 100
  priority: 'high' | 'medium' | 'low';
  deadline?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TacticalTask {
  id: string;
  title: string;
  category?: string;
  quadrant: 'urgent_important' | 'important' | 'urgent' | 'someday';
  dueDate?: string;
  dueTime?: string;
  isCompleted: boolean;
  priorityScore?: number;
  source?: 'user' | 'advisor' | 'classroom' | 'share';
  createdAt: string;
  updatedAt: string;
}

export interface SavedIntelItem {
  id: string;
  url: string;
  title: string;
  source: 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'web';
  category: 'dev' | 'business' | 'fitness' | 'mindset' | 'ai' | 'general';
  summary: string;
  keyTakeaways: string[];
  problemSolved?: string;
  tags: string[];
  thumbnailUrl?: string;
  author?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SleepRecord {
  id: string;
  dateStr: string;
  sleepTime: string;
  wakeTime?: string;
  durationMinutes?: number;
  qualityRating?: number; // 1 to 5
  recoveryIndex?: number; // 0 to 100
  notes?: string;
}

export interface HabitLog {
  dateStr: string;
  caloriesConsumed: number;
  caloriesTarget: number;
  workoutDone: boolean;
  workoutType?: string;
  weightKg?: number;
  waterLiters?: number;
}

export interface AqliyaFullBackup {
  schemaVersion: '2.0.0';
  exportDate: string;
  appVersion: string;
  data: {
    goals: SystemGoal[];
    tasks: TacticalTask[];
    intel: SavedIntelItem[];
    sleepLogs: SleepRecord[];
    habitLogs: Record<string, HabitLog>;
    dashDropNotes: Array<{ id: string; text: string; date: string }>;
    periodFocus: { focus: string; periodTitle: string; deadline?: string };
    userProfile: {
      name: string;
      city: string;
      theme: 'dark' | 'light';
    };
  };
}

// Storage Keys Constants
export const STORAGE_KEYS = {
  GOALS: 'aqliya_goals_v2',
  TASKS: 'aqliya_tasks_v2',
  INTEL: 'aqliya_saved_intel_v2',
  SLEEP: 'aqliya_sleep_records_v2',
  HABITS: 'aqliya_habit_logs_v2',
  DASHDROP: 'aqliya_dashdrop_v2',
  FOCUS: 'aqliya_period_focus_v2',
  PROFILE: 'aqliya_user_profile_v2',
  AUTO_SNAPSHOT: 'aqliya_auto_snapshot_v2',
  GEMINI_KEY: 'aqliya_gemini_api_key',
} as const;

export class UnifiedStorage {
  // --------------------------------------------------------------------------
  // 1. DYNAMIC GOALS (User & Advisor modifiable — NOT hardcoded!)
  // --------------------------------------------------------------------------
  public static getGoals(): SystemGoal[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('UnifiedStorage: Failed reading goals', e);
    }
    // Seed default initial goals if empty
    const defaults = this.getDefaultGoals();
    this.saveGoals(defaults);
    return defaults;
  }

  public static saveGoals(goals: SystemGoal[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
      window.dispatchEvent(new CustomEvent('aqliya:goals-updated', { detail: goals }));
    } catch (e) {
      console.error('UnifiedStorage: Failed saving goals', e);
    }
  }

  public static addGoal(goal: Omit<SystemGoal, 'id' | 'createdAt' | 'updatedAt'>): SystemGoal {
    const goals = this.getGoals();
    const newGoal: SystemGoal = {
      ...goal,
      id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    goals.unshift(newGoal);
    this.saveGoals(goals);
    return newGoal;
  }

  public static updateGoal(id: string, updates: Partial<SystemGoal>): SystemGoal | null {
    const goals = this.getGoals();
    const idx = goals.findIndex((g) => g.id === id);
    if (idx === -1) return null;
    goals[idx] = { ...goals[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveGoals(goals);
    return goals[idx];
  }

  public static deleteGoal(id: string): boolean {
    const goals = this.getGoals();
    const filtered = goals.filter((g) => g.id !== id);
    if (filtered.length !== goals.length) {
      this.saveGoals(filtered);
      return true;
    }
    return false;
  }

  // --------------------------------------------------------------------------
  // 2. TACTICAL TASKS (Eisenhower Quadrants, Classroom, Daily Priorities)
  // --------------------------------------------------------------------------
  public static getTasks(): TacticalTask[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (raw) return JSON.parse(raw);
      // Migration from legacy lockscreen tasks if exists
      const legacy = localStorage.getItem('moha_lockscreen_tasks_v1');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        const migrated: TacticalTask[] = parsed.map((t: any) => ({
          id: t.id || `task-${Date.now()}`,
          title: t.title,
          quadrant: t.quadrant || 'important',
          dueTime: t.time,
          dueDate: t.dateStr,
          isCompleted: Boolean(t.completed),
          createdAt: t.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        this.saveTasks(migrated);
        return migrated;
      }
    } catch (e) {
      console.warn('UnifiedStorage: Failed reading tasks', e);
    }
    const defaults = this.getDefaultTasks();
    this.saveTasks(defaults);
    return defaults;
  }

  public static saveTasks(tasks: TacticalTask[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      window.dispatchEvent(new CustomEvent('aqliya:tasks-updated', { detail: tasks }));
    } catch (e) {
      console.error('UnifiedStorage: Failed saving tasks', e);
    }
  }

  public static addTask(task: Omit<TacticalTask, 'id' | 'createdAt' | 'updatedAt'>): TacticalTask {
    const tasks = this.getTasks();
    const newTask: TacticalTask = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tasks.unshift(newTask);
    this.saveTasks(tasks);
    return newTask;
  }

  public static toggleTask(id: string): TacticalTask | null {
    const tasks = this.getTasks();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    tasks[idx].isCompleted = !tasks[idx].isCompleted;
    tasks[idx].updatedAt = new Date().toISOString();
    this.saveTasks(tasks);
    return tasks[idx];
  }

  public static deleteTask(id: string): boolean {
    const tasks = this.getTasks();
    const filtered = tasks.filter((t) => t.id !== id);
    if (filtered.length !== tasks.length) {
      this.saveTasks(filtered);
      return true;
    }
    return false;
  }

  // --------------------------------------------------------------------------
  // 3. SAVED INTEL & SMART SHARE ITEMS
  // --------------------------------------------------------------------------
  public static getIntel(): SavedIntelItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.INTEL);
      if (raw) return JSON.parse(raw);
      // Migration from legacy
      const legacy = localStorage.getItem('moha_saved_intel_v1') || localStorage.getItem('aqliya_intel');
      if (legacy) {
        const parsed = JSON.parse(legacy);
        const migrated: SavedIntelItem[] = parsed.map((item: any) => ({
          id: item.id || `intel-${Date.now()}`,
          url: item.url || '',
          title: item.title || 'محتوى محفوظ',
          source: item.platform || 'web',
          category: item.category || 'general',
          summary: item.summary || item.notes || '',
          keyTakeaways: Array.isArray(item.key_takeaways) ? item.key_takeaways : (item.keyTakeaways || []),
          problemSolved: item.problem_solved || item.problemSolved,
          tags: Array.isArray(item.tags) ? item.tags : [],
          thumbnailUrl: item.thumbnail_url || item.thumbnailUrl,
          author: item.author,
          createdAt: item.created_at || new Date().toISOString(),
          updatedAt: item.updated_at || new Date().toISOString(),
        }));
        this.saveIntel(migrated);
        return migrated;
      }
    } catch (e) {
      console.warn('UnifiedStorage: Failed reading intel', e);
    }
    return [];
  }

  public static saveIntel(items: SavedIntelItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.INTEL, JSON.stringify(items));
      window.dispatchEvent(new CustomEvent('aqliya:intel-updated', { detail: items }));
    } catch (e) {
      console.error('UnifiedStorage: Failed saving intel', e);
    }
  }

  public static addIntelItem(item: Omit<SavedIntelItem, 'id' | 'createdAt' | 'updatedAt'>): SavedIntelItem {
    const items = this.getIntel();
    const newItem: SavedIntelItem = {
      ...item,
      id: `intel-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    items.unshift(newItem);
    this.saveIntel(items);
    return newItem;
  }

  public static updateIntelItem(id: string, updates: Partial<SavedIntelItem>): SavedIntelItem | null {
    const items = this.getIntel();
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...updates, updatedAt: new Date().toISOString() };
    this.saveIntel(items);
    return items[idx];
  }

  public static deleteIntelItem(id: string): boolean {
    const items = this.getIntel();
    const filtered = items.filter((i) => i.id !== id);
    if (filtered.length !== items.length) {
      this.saveIntel(filtered);
      return true;
    }
    return false;
  }

  // --------------------------------------------------------------------------
  // 4. PERIOD STRATEGIC FOCUS (Overarching North Star)
  // --------------------------------------------------------------------------
  public static getPeriodFocus(): { focus: string; periodTitle: string; deadline?: string } {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.FOCUS);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    const defaultFocus = {
      periodTitle: 'مرحلة إغلاق الصفقات وبناء القوة 2026',
      focus: 'التركيز على إغلاق أول 3 صفقات لمشروع NexusOS، والالتزام بوجبات 3000 سعرة حرارية للوصول لوزن 70 كجم.',
      deadline: 'نهاية ديسمبر 2026',
    };
    try {
      localStorage.setItem(STORAGE_KEYS.FOCUS, JSON.stringify(defaultFocus));
    } catch (e) {}
    return defaultFocus;
  }

  public static setPeriodFocus(focus: string, periodTitle: string = 'تركيز المرحلة الحالية', deadline?: string): void {
    const data = { focus, periodTitle, deadline };
    try {
      localStorage.setItem(STORAGE_KEYS.FOCUS, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('aqliya:focus-updated', { detail: data }));
    } catch (e) {}
  }

  // --------------------------------------------------------------------------
  // 5. ONE-CLICK FULL BACKUP EXPORT (JSON FILE DOWNLOAD)
  // --------------------------------------------------------------------------
  public static exportFullBackupJSON(): void {
    try {
      const backup: AqliyaFullBackup = {
        schemaVersion: '2.0.0',
        exportDate: new Date().toISOString(),
        appVersion: 'v2.0.0 (Jarvis OS)',
        data: {
          goals: this.getGoals(),
          tasks: this.getTasks(),
          intel: this.getIntel(),
          sleepLogs: this.getSleepLogs(),
          habitLogs: this.getHabitLogs(),
          dashDropNotes: this.getDashDropNotes(),
          periodFocus: this.getPeriodFocus(),
          userProfile: this.getUserProfile(),
        },
      };

      const jsonStr = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const now = new Date();
      const datePart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const filename = `AqliyaHQ_Backup_${datePart}.json`;

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      // Save an auto-snapshot locally as safety net
      localStorage.setItem(STORAGE_KEYS.AUTO_SNAPSHOT, jsonStr);
    } catch (e) {
      console.error('Failed to export backup', e);
      alert('حدث خطأ أثناء تصدير النسخة الاحتياطية');
    }
  }

  // --------------------------------------------------------------------------
  // 6. ONE-CLICK FULL RESTORE (IMPORT JSON FILE)
  // --------------------------------------------------------------------------
  public static async importFullBackupJSON(file: File): Promise<{ success: boolean; message: string }> {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as AqliyaFullBackup;

      if (!parsed || !parsed.data) {
        return { success: false, message: 'الملف غير صالح أو لا يحتوي على بنية بيانات عقلية HQ' };
      }

      // 1. Take safety snapshot of current data before overwriting
      try {
        const currentData = {
          goals: this.getGoals(),
          tasks: this.getTasks(),
          intel: this.getIntel(),
        };
        localStorage.setItem(STORAGE_KEYS.AUTO_SNAPSHOT, JSON.stringify(currentData));
      } catch (e) {}

      // 2. Restore each domain safely
      if (Array.isArray(parsed.data.goals)) {
        this.saveGoals(parsed.data.goals);
      }
      if (Array.isArray(parsed.data.tasks)) {
        this.saveTasks(parsed.data.tasks);
      }
      if (Array.isArray(parsed.data.intel)) {
        this.saveIntel(parsed.data.intel);
      }
      if (Array.isArray(parsed.data.sleepLogs)) {
        localStorage.setItem(STORAGE_KEYS.SLEEP, JSON.stringify(parsed.data.sleepLogs));
      }
      if (parsed.data.habitLogs) {
        localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(parsed.data.habitLogs));
      }
      if (Array.isArray(parsed.data.dashDropNotes)) {
        localStorage.setItem(STORAGE_KEYS.DASHDROP, JSON.stringify(parsed.data.dashDropNotes));
      }
      if (parsed.data.periodFocus) {
        this.setPeriodFocus(parsed.data.periodFocus.focus, parsed.data.periodFocus.periodTitle, parsed.data.periodFocus.deadline);
      }
      if (parsed.data.userProfile) {
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(parsed.data.userProfile));
      }

      window.dispatchEvent(new CustomEvent('aqliya:full-restore-completed'));
      return {
        success: true,
        message: `تمت استعادة البيانات بنجاح: ${parsed.data.goals?.length || 0} أهداف، ${parsed.data.tasks?.length || 0} مهام، ${parsed.data.intel?.length || 0} عناصر استخبارات.`,
      };
    } catch (e: any) {
      console.error('Import failed', e);
      return { success: false, message: `فشل استيراد الملف: ${e.message || 'تنسيق تالف'}` };
    }
  }

  // --------------------------------------------------------------------------
  // 7. STORAGE STATS & HEALTH
  // --------------------------------------------------------------------------
  public static getStorageStats(): {
    goalsCount: number;
    tasksCount: number;
    intelCount: number;
    storageUsedKb: number;
    lastSnapshotDate?: string;
  } {
    const goals = this.getGoals();
    const tasks = this.getTasks();
    const intel = this.getIntel();

    let totalChars = 0;
    try {
      for (const k in localStorage) {
        if (k.startsWith('aqliya_') || k.startsWith('moha_')) {
          totalChars += (localStorage.getItem(k) || '').length;
        }
      }
    } catch (e) {}

    return {
      goalsCount: goals.length,
      tasksCount: tasks.length,
      intelCount: intel.length,
      storageUsedKb: Math.round((totalChars * 2) / 1024),
    };
  }

  // --------------------------------------------------------------------------
  // HELPERS
  // --------------------------------------------------------------------------
  public static getSleepLogs(): SleepRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SLEEP) || localStorage.getItem('moha_sleep_logs_v1');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  }

  public static getHabitLogs(): Record<string, HabitLog> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {};
  }

  public static getDashDropNotes(): Array<{ id: string; text: string; date: string }> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.DASHDROP) || localStorage.getItem('moha_dash_drop_v1');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  }

  public static getUserProfile(): { name: string; city: string; theme: 'dark' | 'light' } {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { name: 'محمد قرمان', city: 'غزة، فلسطين', theme: 'dark' };
  }

  private static getDefaultGoals(): SystemGoal[] {
    return [
      {
        id: 'goal-nexus',
        title: 'إغلاق أول 3 صفقات في NexusOS',
        description: 'نظام إدارة مكاتب المحاماة والعقود، استهداف مكاتب متخصصة وإتمام الاشتراكات التجريبية.',
        category: 'business',
        targetValue: '3 صفقات',
        currentValue: '1 تجريبي',
        progressPercent: 33,
        priority: 'high',
        deadline: '2026-12-31',
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'goal-calisthenics',
        title: 'بناء الوزن 70 كجم والكاليسثنكس',
        description: 'تثبيت تمارين الكاليسثنكس اليومية 40 دقيقة، وتناول 3000 سعرة حرارية عالية الكثافة.',
        category: 'fitness',
        targetValue: '70 كجم (3000 Kcal)',
        currentValue: '56 كجم',
        progressPercent: 40,
        priority: 'high',
        deadline: '2027-03-01',
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'goal-college',
        title: 'التفوق في تكليفات الكلية',
        description: 'تسليم كافة تكليفات ومشاريع الكلية الجامعية عبر كلاس روم قبل موعد الاستحقاق.',
        category: 'academic',
        targetValue: '100% تسليم منضبط',
        currentValue: 'مستمر',
        progressPercent: 85,
        priority: 'medium',
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'goal-roma',
        title: 'تطوير إدارة قهوة روما العائلية',
        description: 'تنظيم المبيعات والمصاريف وإدارة الديون بنسخ احتياطي دوري.',
        category: 'business',
        targetValue: 'نظام مستقر ومؤتمت',
        currentValue: 'قيد التطوير',
        progressPercent: 50,
        priority: 'medium',
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  private static getDefaultTasks(): TacticalTask[] {
    return [
      {
        id: 'task-1',
        title: 'الرد على إيميلات عملاء NexusOS والمحامين',
        quadrant: 'urgent_important',
        dueTime: '11:00',
        isCompleted: false,
        priorityScore: 95,
        source: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'task-2',
        title: 'تمرين كاليسثنكس 40 دقيقة (سحب وضغط ومتوازي)',
        quadrant: 'important',
        dueTime: '17:00',
        isCompleted: false,
        priorityScore: 88,
        source: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'task-3',
        title: 'مراجعة تسليم تكليف الكلية الأسبوعي',
        quadrant: 'urgent',
        dueTime: '20:00',
        isCompleted: false,
        priorityScore: 80,
        source: 'classroom',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'task-4',
        title: 'أرشفة وتصنيف ريلزات البرمجة والأعمال المحفوظة',
        quadrant: 'someday',
        isCompleted: false,
        priorityScore: 50,
        source: 'advisor',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }
}
