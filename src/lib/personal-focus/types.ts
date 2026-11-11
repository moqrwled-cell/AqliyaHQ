// ============================================================================
// MOHA AGENT — PERSONAL FOCUS & REALITY DATA TYPES
// ============================================================================

export type WorkShiftDayType = 'work_morning' | 'full_focus_day' | 'friday_off';

export interface ClassroomTaskItem {
  id: string;
  subject: string;
  taskTitle: string;
  dueDate?: string;
  completed: boolean;
  type: 'lecture' | 'assignment' | 'exam' | 'face_to_face';
}

export interface MealItem {
  id: string;
  title: string;
  calories: number;
  ingredients: string;
  alternativeMeal: string;
  completed: boolean;
}

export interface DailyPersonalPlan {
  date: string;
  isWorkMorning: boolean; // 7:00 AM - 11:00 AM
  shiftBadge: string;
  energyTarget: 'high' | 'balanced';
  
  // 1. الكلية التطبيقية والكلاس روم
  classroomTasks: ClassroomTaskItem[];

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
    meals: MealItem[];
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

export type PlanMutationAction = 
  | 'update_calories'
  | 'update_meal'
  | 'add_meal'
  | 'delete_meal'
  | 'add_classroom_task'
  | 'delete_classroom_task'
  | 'update_coursera'
  | 'update_workout'
  | 'set_target_weight'
  | 'set_alarm';

export interface PlanMutation {
  action: PlanMutationAction;
  data: Record<string, any>;
  descriptionArabic: string;
}
