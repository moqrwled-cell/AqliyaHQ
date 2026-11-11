// ============================================================================
// MOHA AGENT — SMART NOTIFICATION & ALARM MANAGER
// ============================================================================

export interface ScheduledReminder {
  id: string;
  title: string;
  body: string;
  time: string; // HH:mm
  category: 'meal' | 'workout' | 'classroom' | 'nexus' | 'shift';
}

export class NotificationManager {
  private static STORAGE_KEY = 'moha_notifications_enabled';

  /**
   * Check if notifications are granted
   */
  public static isPermissionGranted(): boolean {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    return Notification.permission === 'granted';
  }

  /**
   * Request push/local notification permission from Android / Browser
   */
  public static async requestPermission(): Promise<{ granted: boolean; status: string }> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return { granted: false, status: 'unsupported' };
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      if (granted) {
        localStorage.setItem(this.STORAGE_KEY, 'true');
        this.sendNotification(
          'Moha Agent | تم تفعيل الإشعارات بنجاح 🫡',
          'سأقوم بتذكيرك بمواعيد وجبات زيادة الوزن، التمارين، ومهام الكلاس روم بانتظام.'
        );
      }
      return { granted, status: permission };
    } catch (e: any) {
      console.warn('Notification permission error:', e);
      return { granted: false, status: 'error' };
    }
  }

  /**
   * Send an immediate notification
   */
  public static sendNotification(title: string, body: string, icon: string = '/logo.png'): boolean {
    if (!this.isPermissionGranted()) return false;

    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, {
            body,
            icon,
            badge: '/logo.png',
            vibrate: [200, 100, 200],
            tag: `moha-notice-${Date.now()}`,
          } as any);
        });
        return true;
      }

      new Notification(title, {
        body,
        icon,
        badge: icon,
      });
      return true;
    } catch (e) {
      console.warn('Native notification failed:', e);
      return false;
    }
  }

  /**
   * Standard Daily Reminders Routine for Mohammad
   */
  public static getDailyReminders(): ScheduledReminder[] {
    return [
      {
        id: 'rem-wake',
        time: '06:30',
        category: 'shift',
        title: 'Moha Agent | صباح العزيمة يا بطل 🌅',
        body: 'استعد للدوام الصباحي أو يوم الإنجاز.. لا تنسَ كوب الماء ووجبة البداية.',
      },
      {
        id: 'rem-meal-1',
        time: '08:30',
        category: 'meal',
        title: 'Moha Agent | وجبة طاقة الصباح 🥣',
        body: 'طبق السيريلاك أو الشوفان بالحليب الدافئ وزيت الزيتون (+450 سعرة نحو الـ 70 كجم).',
      },
      {
        id: 'rem-meal-2',
        time: '13:30',
        category: 'meal',
        title: 'Moha Agent | غداء الطاقة المُعزز 🍲',
        body: 'لا تنسَ إضافة ملعقتي زيت الزيتون الصافي على صحن الغداء لرفع السعرات بسهولة.',
      },
      {
        id: 'rem-meal-3',
        time: '16:30',
        category: 'meal',
        title: 'Moha Agent | سناك الفول السوداني والتمر 🥜',
        body: 'سناك سهل البلع وسريع يمنحك 400 سعرة كثيفة بدون تعب في الهضم.',
      },
      {
        id: 'rem-workout',
        time: '17:30',
        category: 'workout',
        title: 'Moha Agent | موعد تمرين الكاليسثنكس المنزلي 💪',
        body: '40 دقيقة دفع/سحب + 10 دقائق مرونة واستطالة للمفاصل. ابنِ قوتك اليوم!',
      },
      {
        id: 'rem-college-nexus',
        time: '19:00',
        category: 'nexus',
        title: 'Moha Agent | ساعة الكلاس روم وإيميلات نيكسيس 💼🎓',
        body: 'راجع تكليفات الكلية وتأكد من إرسال إيميلات نيكسيس للمحامين بخطاف ABA 512.',
      },
      {
        id: 'rem-meal-4',
        time: '21:30',
        category: 'meal',
        title: 'Moha Agent | وجبة بناء العضلات قبل النوم 🌙',
        body: 'وجبة البيض والبطاطس أو الحليب بالتمر والعسل لتغذية جسمك طوال الليل.',
      },
    ];
  }

  /**
   * Schedule automated background checks
   */
  public static startBackgroundRoutine(): void {
    if (typeof window === 'undefined') return;

    // Check every 60 seconds
    setInterval(() => {
      if (!this.isPermissionGranted()) return;

      const now = new Date();
      const currentH = String(now.getHours()).padStart(2, '0');
      const currentM = String(now.getMinutes()).padStart(2, '0');
      const currentTime = `${currentH}:${currentM}`;

      const reminders = this.getDailyReminders();
      const matching = reminders.find((r) => r.time === currentTime);

      if (matching) {
        const lastSentKey = `last_sent_${matching.id}_${now.toDateString()}`;
        if (!localStorage.getItem(lastSentKey)) {
          localStorage.setItem(lastSentKey, 'true');
          this.sendNotification(matching.title, matching.body);
        }
      }
    }, 45000);
  }
}
