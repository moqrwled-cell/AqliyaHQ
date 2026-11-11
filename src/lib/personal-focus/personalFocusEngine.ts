// ============================================================================
// AQLIYA HQ — MOHAMMAD PERSONAL FOCUS & BATTLE PLAN ENGINE
// ============================================================================

import type { DailyPersonalPlan, TelegramSITREPMessage, WorkShiftDayType } from './types';
import { offlineStorage } from '../supabase';

const STORAGE_KEY_PLAN = 'mohammad_daily_battle_plan_v1';
const STORAGE_KEY_BACKUP = 'roma_cafe_debts_local_backup_v1';

export class PersonalFocusEngine {
  /**
   * يحسب تلقائياً هل اليوم هو يوم دوام مدرسة (7-11 صباحاً) بناءً على أسبوع المناوبة
   * الأسبوع (أ): أحد، ثلاثاء، خميس
   * الأسبوع (ب): سبت، اثنين، أربعاء
   * الجمعة دائماً إجازة
   */
  public static calculateWorkShift(date: Date = new Date()): {
    isWorkMorning: boolean;
    shiftBadge: string;
    dayType: WorkShiftDayType;
  } {
    const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
    if (dayOfWeek === 5) {
      return {
        isWorkMorning: false,
        shiftBadge: 'يوم الجمعة (إجازة وعبادة وراحة تامة)',
        dayType: 'friday_off',
      };
    }

    // حساب رقم الأسبوع من بداية العام لمعرفة النمط التبادلي
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - startOfYear.getTime()) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);

    const isWeekA = weekNumber % 2 === 0;

    let isWork = false;
    if (isWeekA) {
      // أسبوع (أ): أحد (0)، ثلاثاء (2)، خميس (4)
      isWork = dayOfWeek === 0 || dayOfWeek === 2 || dayOfWeek === 4;
    } else {
      // أسبوع (ب): سبت (6)، اثنين (1)، أربعاء (3)
      isWork = dayOfWeek === 6 || dayOfWeek === 1 || dayOfWeek === 3;
    }

    if (isWork) {
      return {
        isWorkMorning: true,
        shiftBadge: 'دوام المدرسة الصباحي في الكافيه (07:00 - 11:00)',
        dayType: 'work_morning',
      };
    } else {
      return {
        isWorkMorning: false,
        shiftBadge: 'يوم تفرغ كامل للمشاريع والكلية (بدون دوام مدرسة)',
        dayType: 'full_focus_day',
      };
    }
  }

  /**
   * يسترجع أو يولد خطة اليوم الذكية لمحمد تلقائياً
   */
  public static getTodayPlan(): DailyPersonalPlan {
    const todayStr = new Date().toISOString().split('T')[0];
    const saved = offlineStorage.get<DailyPersonalPlan | null>(STORAGE_KEY_PLAN, null);

    if (saved && saved.date === todayStr) {
      return saved;
    }

    const shift = this.calculateWorkShift(new Date());

    // تحديد تمرين اليوم من نمط الـ 4 أيام
    const dayOfWeek = new Date().getDay();
    let workoutType: DailyPersonalPlan['nutritionAndWorkout']['workoutType'] = 'Rest_Mobility';
    let workoutTitle = 'إطالات ومرونة وتدفق دم خفيف (Rest & Mobility)';
    let workoutExercises = [
      'تمدد الصدر والأكتاف بالباب (Doorway Stretch) - 3 جولات دقيقة واحدة',
      'إطالة أوتار الركبة والحوض (Hamstring & Hip Flexor) - 3 جولات',
      'تمرين القطة والجمل للعمود الفقري (Cat-Cow) - 15 تكراراً',
    ];

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      workoutType = 'Push';
      workoutTitle = 'تمارين الدفع المنزلي (صدر، أكتاف أمامية، وتراي)';
      workoutExercises = [
        'تمرين الضغط القياسي (Standard Push-ups) - 4 جولات حتى القرب من الفشل',
        'تمرين الضغط مع رفع القدمين للصدر العلوي (Decline Push-ups) - 3 جولات',
        'تمرين الغطس على حافة الكرسي (Chair Tricep Dips) - 3 جولات 12 تكرار',
        'تمرين البايك للأكتاف (Pike Push-ups) - 3 جولات 8-10 تكرار',
      ];
    } else if (dayOfWeek === 1 || dayOfWeek === 2) {
      workoutType = 'Pull';
      workoutTitle = 'تمارين السحب والظهر (عقلة، ظهر، وبايسبس)';
      workoutExercises = [
        'عقلة قبضة واسعة أو معكوسة (Pull-ups / Chin-ups) - 4 جولات',
        'سحب أفقي تحت الطاولة (Inverted Rows) - 4 جولات 10-12 تكرار',
        'تمرين السوبرمان لتقوية أسفل الظهر (Superman Holds) - 3 جولات 30 ثانية',
      ];
    } else if (dayOfWeek === 3 || dayOfWeek === 4) {
      workoutType = 'Legs';
      workoutTitle = 'تمارين الأرجل القوية وبناء الأساس (Squats & Quads)';
      workoutExercises = [
        'سكوات بوزن الجسم مع النزول البطيء (Tempo Squats) - 4 جولات 15 تكرار',
        'السكوات البلغاري على الكرسي (Bulgarian Split Squats) - 3 جولات لكل رجل',
        'رفع بطات القدم على حافة الدرج (Calf Raises) - 4 جولات 20 تكرار',
      ];
    }

    const newPlan: DailyPersonalPlan = {
      date: todayStr,
      isWorkMorning: shift.isWorkMorning,
      shiftBadge: shift.shiftBadge,
      energyTarget: shift.isWorkMorning ? 'balanced' : 'high',

      // 1. الكلية والكلاس روم
      classroomTasks: [
        {
          id: 'cls-1',
          subject: 'إدارة أعمال تكنولوجيا',
          taskTitle: 'مراجعة أحدث محاضرة مرفوعة وتفريغ ملاحظات الشرح',
          type: 'lecture',
          completed: false,
        },
        {
          id: 'cls-2',
          subject: 'الكلية التطبيقية',
          taskTitle: 'التحقق من مواعيد التكليفات القادمة واللقاء الوجاهي',
          type: 'assignment',
          completed: false,
        },
      ],

      // 2. مشروع نيكسيس (المحامين الأمريكيين)
      nexusTargets: {
        dailyEmailTarget: 20,
        sentCount: 0,
        repliesCount: 0,
        recommendedHook: 'Prevent Attorney-Client Privilege Breach: Run Local Legal Analysis in RAM without Cloud Leakage (ABA Formal Opinion 512 Compliance)',
        completed: false,
      },

      // 3. التغذية والتمارين لزيادة الوزن (54 -> 70 كجم)
      nutritionAndWorkout: {
        currentWeightKg: 54,
        targetWeightKg: 70,
        targetCalories: 2800,
        meals: [
          {
            id: 'meal-morning',
            title: 'وجبة طاقة الصباح (سريعة وسهلة البلع)',
            calories: 450,
            ingredients: 'طبق سيريلاك بالحليب الدافئ أو شوفان منقوع بالعسل وملعقة طحينة',
            alternativeMeal: 'رغيف خبز مع ملعقتين طحينة حمراء ودبس تمر + كوب شاي دافئ',
            completed: false,
          },
          {
            id: 'meal-lunch',
            title: 'غداء العائلة المُعزز بالسعرات',
            calories: 850,
            ingredients: 'وجبة الغداء المنزلية (أرز/بقوليات/خبز) مع إضافة ملعقتين زيت زيتون بكر صافي على الصحن',
            alternativeMeal: 'صحن فول أو حمص بالزيت الوفير مع رغيفين خبز وبيضتين مسلوقتين',
            completed: false,
          },
          {
            id: 'meal-snack',
            title: 'سناك السعرات الكثيفة أثناء العمل/الدراسة',
            calories: 400,
            ingredients: 'حفنة فول سوداني (فستق محمص 50 غرام) + 5 حبات تمر',
            alternativeMeal: 'ساندويتش زبدة فول سوداني أو حلاوة طحينية مع خبز',
            completed: false,
          },
          {
            id: 'meal-night',
            title: 'وجبة ما قبل النوم لبناء الألياف',
            calories: 500,
            ingredients: 'ساندويتش بيض مسلوق وبطاطس مهروسة مع زيت الزيتون أو جبن',
            alternativeMeal: 'كوب حليب دافئ مع ملعقة عسل وقطعة كيك أو بسكويت',
            completed: false,
          },
        ],
        workoutType,
        workoutTitle,
        workoutExercises,
        mobilityExercises: [
          'إطالة الحوض وأوتار الساق (Deep Squat Hold) - دقيقتين',
          'دوران الكتفين والرقبة لتفادي التيبس - 3 جولات',
        ],
        workoutCompleted: false,
      },

      // 4. الإنجليزية وكورسيرا
      selfGrowth: {
        englishPracticeMinutes: 15,
        englishCompleted: false,
        englishFocusPhrase: 'Our offline engine ensures zero client data is transmitted over public networks.',
        courseraModuleTitle: 'Google Project Management / Business Tech Module',
        courseraCompleted: false,
      },

      // 5. كافيه روما
      romaCafeBackupDone: false,
    };

    offlineStorage.save(STORAGE_KEY_PLAN, newPlan);
    return newPlan;
  }

  /**
   * تحديث خطة اليوم وحفظها
   */
  public static savePlan(plan: DailyPersonalPlan): void {
    offlineStorage.save(STORAGE_KEY_PLAN, plan);
  }

  /**
   * تبديل حالة وجبة أو تمرين أو مهمة بنقرة واحدة
   */
  public static toggleMeal(mealId: string): DailyPersonalPlan {
    const plan = this.getTodayPlan();
    const meal = plan.nutritionAndWorkout.meals.find((m) => m.id === mealId);
    if (meal) {
      meal.completed = !meal.completed;
      this.savePlan(plan);
    }
    return plan;
  }

  public static toggleWorkout(): DailyPersonalPlan {
    const plan = this.getTodayPlan();
    plan.nutritionAndWorkout.workoutCompleted = !plan.nutritionAndWorkout.workoutCompleted;
    this.savePlan(plan);
    return plan;
  }

  public static toggleClassroomTask(taskId: string): DailyPersonalPlan {
    const plan = this.getTodayPlan();
    const t = plan.classroomTasks.find((item) => item.id === taskId);
    if (t) {
      t.completed = !t.completed;
      this.savePlan(plan);
    }
    return plan;
  }

  public static incrementNexusSent(count: number = 1): DailyPersonalPlan {
    const plan = this.getTodayPlan();
    plan.nexusTargets.sentCount += count;
    if (plan.nexusTargets.sentCount >= plan.nexusTargets.dailyEmailTarget) {
      plan.nexusTargets.completed = true;
    }
    this.savePlan(plan);
    return plan;
  }

  public static toggleEnglishPractice(): DailyPersonalPlan {
    const plan = this.getTodayPlan();
    plan.selfGrowth.englishCompleted = !plan.selfGrowth.englishCompleted;
    this.savePlan(plan);
    return plan;
  }

  /**
   * أخذ نسخة احتياطية محلية وفورية لديون كافيه روما لضمان عدم ضياعها
   */
  public static backupRomaCafeData(dataToBackup?: any): { success: boolean; timestamp: string; count: number } {
    const sampleDebts = dataToBackup || [
      { id: 'd-1', customer: 'زبائن طاولة الصالة', amount: 45, date: new Date().toISOString() },
      { id: 'd-2', customer: 'حساب مشتريات البن والمستهلكات', amount: 120, date: new Date().toISOString() },
    ];

    offlineStorage.save(STORAGE_KEY_BACKUP, {
      debts: sampleDebts,
      backedUpAt: new Date().toISOString(),
    });

    const plan = this.getTodayPlan();
    plan.romaCafeBackupDone = true;
    this.savePlan(plan);

    return {
      success: true,
      timestamp: new Date().toLocaleTimeString('ar-EG'),
      count: sampleDebts.length,
    };
  }

  /**
   * توليد نص رسالة التيليجرام اليومية لمحمد
   */
  public static generateTelegramSITREP(plan: DailyPersonalPlan): TelegramSITREPMessage {
    const completedMeals = plan.nutritionAndWorkout.meals.filter((m) => m.completed).length;
    const completedClassroom = plan.classroomTasks.filter((t) => t.completed).length;

    let total = plan.nutritionAndWorkout.meals.length + plan.classroomTasks.length + 3; // + workout, nexus, english
    let done = completedMeals + completedClassroom;
    if (plan.nutritionAndWorkout.workoutCompleted) done++;
    if (plan.nexusTargets.completed || plan.nexusTargets.sentCount >= 10) done++;
    if (plan.selfGrowth.englishCompleted) done++;

    const text = `
🫡 إحاطة الموقف اليومية — القائد محمد قرمان
🗓️ التاريخ: ${plan.date}
📍 الروتين: ${plan.shiftBadge}

🎯 مؤشر الإنجاز العام: [${done}/${total}] (${Math.round((done / total) * 100)}%)

1️⃣ الكلية والكلاس روم:
${plan.classroomTasks.map((t) => `${t.completed ? '✅' : '⏳'} ${t.subject}: ${t.taskTitle}`).join('\n')}

2️⃣ مشروع نيكسيس للمحامين:
- الإيميلات المرسلة اليوم: ${plan.nexusTargets.sentCount}/${plan.nexusTargets.dailyEmailTarget}
- خطاف اليوم: ${plan.nexusTargets.recommendedHook.substring(0, 70)}...

3️⃣ الجسم والتغذية (الهدف 70 كجم):
- الوجبات المنجزة: ${completedMeals}/${plan.nutritionAndWorkout.meals.length} وجبات كثيفة السعرات
- تمرين اليوم: ${plan.nutritionAndWorkout.workoutTitle} [${plan.nutritionAndWorkout.workoutCompleted ? 'تم الإنجاز بنجاح 💪' : 'في الانتظار'}]

4️⃣ كافيه روما:
- النسخ الاحتياطي للديون: ${plan.romaCafeBackupDone ? 'محفوظ ومؤمن بنجاح 🛡️' : 'ينتظر الضغط على زر النسخ'}

دمت بعزم وقوة يا بطل غزة! 💪🔥
    `.trim();

    return {
      telegramReportText: text,
      generatedAt: new Date().toISOString(),
      tasksCompleted: done,
      totalTasks: total,
    };
  }
}
