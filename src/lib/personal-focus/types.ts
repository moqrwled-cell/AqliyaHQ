// ============================================================================
// AQLIYA HQ — MOHAMMAD PERSONAL FOCUS & REALITY DATA TYPES
// ============================================================================

export type WorkShiftDayType = 'work_morning' | 'full_focus_day' | 'friday_off';

export interface DailyPersonalPlan {
  date: string;
  isWorkMorning: boolean; // 7:00 AM - 11:00 AM
  shiftBadge: string;
  energyTarget: 'high' | 'balanced';
  
  // 1. الكلية التطبيقية والكلاس روم
  classroomTasks: {
    id: string;
    subject: string;
    taskTitle: string;
    dueDate?: string;
    completed: boolean;
    type: 'lecture' | 'assignment' | 'exam' | 'face_to_face';
  }[];

  // 2. مشروع نيكسيس (المحامين الأمريكيين)
  nexusTargets: {
    dailyEmailTarget: number;
    sentCount: number;
    repliesCount: number;
    recommendedHook: string;
    completed: boolean;
  };

  // 3. البناء الجسدي وزيادة الوزن (54 كجم -> 70 كجم)
  nutritionAndWorkout: {
    currentWeightKg: number;
    targetWeightKg: number;
    targetCalories: number;
    meals: {
      id: string;
      title: string;
      calories: number;
      ingredients: string;
      alternativeMeal: string;
      completed: boolean;
    }[];
    workoutType: 'Push' | 'Pull' | 'Legs' | 'Upper' | 'Rest_Mobility';
    workoutTitle: string;
    workoutExercises: string[];
    mobilityExercises: string[];
    workoutCompleted: boolean;
  };

  // 4. الإنجليزية وكورسيرا
  selfGrowth: {
    englishPracticeMinutes: number;
    englishCompleted: boolean;
    englishFocusPhrase: string;
    courseraModuleTitle: string;
    courseraCompleted: boolean;
  };

  // 5. كافيه روما (حماية البيانات)
  romaCafeBackupDone: boolean;
}

export interface TelegramSITREPMessage {
  telegramReportText: string;
  generatedAt: string;
  tasksCompleted: number;
  totalTasks: number;
}
