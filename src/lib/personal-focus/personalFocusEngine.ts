// ============================================================================
// AQLIYA HQ — MOHAMMAD PERSONAL FOCUS & BATTLE PLAN ENGINE
// ============================================================================

import type { DailyPersonalPlan, TelegramSITREPMessage, WorkShiftDayType, PlanMutation } from './types';
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
   * تحديث خطة اليوم وحفظها وبث حدث التحديث
   */
  public static savePlan(plan: DailyPersonalPlan): void {
    offlineStorage.save(STORAGE_KEY_PLAN, plan);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('moha:plan-updated', { detail: plan }));
    }
  }

  /**
   * حساب الاحتياج اليومي الدقيق للسعرات والبروتين لبناء الوزن
   */
  public static calculateCalorieSurplus(
    heightCm: number = 182,
    currentWeightKg: number = 54,
    targetWeightKg: number = 70,
    age: number = 21
  ): {
    bmr: number;
    maintenance: number;
    targetSurplusCalories: number;
    dailyProteinGrams: number;
    explanationArabic: string;
  } {
    // Mifflin-St Jeor Formula for Men
    const bmr = Math.round(10 * currentWeightKg + 6.25 * heightCm - 5 * age + 5);
    // Activity factor for morning work + bodyweight training
    const maintenance = Math.round(bmr * 1.45);
    // Aggressive clean surplus for hardgainer (+700 kcal)
    const targetSurplusCalories = maintenance + 700;
    const dailyProteinGrams = Math.round(currentWeightKg * 2.1); // ~115g

    return {
      bmr,
      maintenance,
      targetSurplusCalories,
      dailyProteinGrams,
      explanationArabic: `بناءً على طولك (${heightCm} سم) ووزنك الحالي (${currentWeightKg} كجم) وعمرك (${age} سنة): معدل الحرق الأساسي (BMR) هو ${bmr} سعرة. مع نشاطك الحركي الصباحي، ثبات الوزن يتطلب ${maintenance} سعرة. لزيادة الوزن والوصول إلى ${targetWeightKg} كجم بنجاح، هدفك اليومي هو ${targetSurplusCalories} سعرة مع ${dailyProteinGrams} غرام بروتين.`,
    };
  }

  /**
   * تحديث هدف السعرات والوزن
   */
  public static updateCalories(targetCalories: number, targetWeightKg?: number): DailyPersonalPlan {
    const plan = this.getTodayPlan();
    plan.nutritionAndWorkout.targetCalories = targetCalories;
    if (targetWeightKg) {
      plan.nutritionAndWorkout.targetWeightKg = targetWeightKg;
    }
    this.savePlan(plan);
    return plan;
  }

  /**
   * تعديل وجبة محددة
   */
  public static updateMeal(
    mealId: string,
    updates: Partial<{ title: string; calories: number; ingredients: string; alternativeMeal: string }>
  ): DailyPersonalPlan {
    const plan = this.getTodayPlan();
    const meal = plan.nutritionAndWorkout.meals.find((m) => m.id === mealId);
    if (meal) {
      if (updates.title) meal.title = updates.title;
      if (updates.calories) meal.calories = updates.calories;
      if (updates.ingredients) meal.ingredients = updates.ingredients;
      if (updates.alternativeMeal) meal.alternativeMeal = updates.alternativeMeal;
      this.savePlan(plan);
    }
    return plan;
  }

  /**
   * إضافة وجبة جديدة
   */
  public static addMeal(meal: {
    title: string;
    calories: number;
    ingredients: string;
    alternativeMeal?: string;
  }): DailyPersonalPlan {
    const plan = this.getTodayPlan();
    const newMeal = {
      id: `meal-${Date.now()}`,
      title: meal.title,
      calories: meal.calories || 400,
      ingredients: meal.ingredients,
      alternativeMeal: meal.alternativeMeal || 'وجبة بديلة متوفرة بالمنزل',
      completed: false,
    };
    plan.nutritionAndWorkout.meals.push(newMeal);
    this.savePlan(plan);
    return plan;
  }

  /**
   * حذف وجبة
   */
  public static deleteMeal(mealId: string): DailyPersonalPlan {
    const plan = this.getTodayPlan();
    plan.nutritionAndWorkout.meals = plan.nutritionAndWorkout.meals.filter((m) => m.id !== mealId);
    this.savePlan(plan);
    return plan;
  }

  /**
   * إضافة مهمة جديدة للكلاس روم
   */
  public static addClassroomTask(task: {
    subject: string;
    taskTitle: string;
    dueDate?: string;
    type?: 'lecture' | 'assignment' | 'exam' | 'face_to_face';
  }): DailyPersonalPlan {
    const plan = this.getTodayPlan();
    const newTask = {
      id: `cls-${Date.now()}`,
      subject: task.subject || 'إدارة أعمال تكنولوجيا',
      taskTitle: task.taskTitle,
      dueDate: task.dueDate,
      type: task.type || 'assignment',
      completed: false,
    };
    plan.classroomTasks.push(newTask);
    this.savePlan(plan);
    return plan;
  }

  /**
   * حذف مهمة كلاس روم
   */
  public static deleteClassroomTask(taskId: string): DailyPersonalPlan {
    const plan = this.getTodayPlan();
    plan.classroomTasks = plan.classroomTasks.filter((t) => t.id !== taskId);
    this.savePlan(plan);
    return plan;
  }

  /**
   * تحديث كورس كورسيرا النشط
   */
  public static updateCourseraCourse(courseTitle: string): DailyPersonalPlan {
    const plan = this.getTodayPlan();
    plan.selfGrowth.courseraModuleTitle = courseTitle;
    this.savePlan(plan);
    return plan;
  }

  /**
   * تحديث جدول التمرين اليومي
   */
  public static updateWorkout(
    title: string,
    exercises: string[],
    mobilityExercises?: string[]
  ): DailyPersonalPlan {
    const plan = this.getTodayPlan();
    plan.nutritionAndWorkout.workoutTitle = title;
    if (exercises && exercises.length > 0) {
      plan.nutritionAndWorkout.workoutExercises = exercises;
    }
    if (mobilityExercises && mobilityExercises.length > 0) {
      plan.nutritionAndWorkout.mobilityExercises = mobilityExercises;
    }
    this.savePlan(plan);
    return plan;
  }

  /**
   * تطبيق تعديل شامل من المستشار الذكي (AI Mutation Dispatcher)
   */
  public static applyMutation(mutation: PlanMutation): { success: boolean; plan: DailyPersonalPlan; message: string } {
    const { action, data } = mutation;
    let plan = this.getTodayPlan();

    switch (action) {
      case 'update_calories':
        plan = this.updateCalories(Number(data.calories), data.targetWeight ? Number(data.targetWeight) : undefined);
        return { success: true, plan, message: `تم تحديث هدف السعرات إلى ${data.calories} سعرة يومياً.` };

      case 'update_meal':
        plan = this.updateMeal(data.mealId, data);
        return { success: true, plan, message: `تم تحديث بيانات الوجبة بنجاح.` };

      case 'add_meal':
        plan = this.addMeal({
          title: data.title,
          calories: Number(data.calories) || 450,
          ingredients: data.ingredients,
          alternativeMeal: data.alternativeMeal,
        });
        return { success: true, plan, message: `تمت إضافة وجبة جديدة: "${data.title}" (+${data.calories} سعرة).` };

      case 'delete_meal':
        plan = this.deleteMeal(data.mealId);
        return { success: true, plan, message: `تم حذف الوجبة بنجاح.` };

      case 'add_classroom_task':
        plan = this.addClassroomTask({
          subject: data.subject || 'الكلية التطبيقية',
          taskTitle: data.taskTitle,
          dueDate: data.dueDate,
          type: data.type || 'assignment',
        });
        return { success: true, plan, message: `تمت إضافة مهمة كلاس روم: "${data.taskTitle}".` };

      case 'delete_classroom_task':
        plan = this.deleteClassroomTask(data.taskId);
        return { success: true, plan, message: `تم حذف المهمة بنجاح.` };

      case 'update_coursera':
        plan = this.updateCourseraCourse(data.courseTitle);
        return { success: true, plan, message: `تم تعيين كورس كورسيرا النشط: "${data.courseTitle}".` };

      case 'update_workout':
        plan = this.updateWorkout(data.title, data.exercises, data.mobilityExercises);
        return { success: true, plan, message: `تم تحديث جدول التمرين: "${data.title}".` };

      default:
        return { success: false, plan, message: 'إجراء غير معروف.' };
    }
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
