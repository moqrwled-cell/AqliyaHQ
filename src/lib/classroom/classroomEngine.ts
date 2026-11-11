// ============================================================================
// MOHA AGENT — GOOGLE CLASSROOM INTEGRATION & SYNC BRIDGE
// ============================================================================

import { PersonalFocusEngine } from '../personal-focus/personalFocusEngine';
import type { ClassroomTaskItem } from '../personal-focus/types';

export interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  instructor?: string;
  classroomUrl: string;
  scheduleDescription?: string; // e.g. "أحد وثلاثاء وجاهي 11:30"
}

export interface ClassroomSyncConfig {
  googleClientId?: string;
  googleAccessToken?: string;
  calendarIcalUrl?: string;
  lastSyncTime?: string;
}

const STORAGE_KEY_COURSES = 'moha_classroom_courses_v1';
const STORAGE_KEY_CONFIG = 'moha_classroom_config_v1';

export class ClassroomEngine {
  /**
   * جلب المواد الدراسية المسجلة لمحمد في الكلية التطبيقية
   */
  public static getCourses(): ClassroomCourse[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_COURSES);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse classroom courses:', e);
    }

    // المقررات الافتراضية لقسم إدارة أعمال وتكنولوجيا بالكلية التطبيقية
    const defaultCourses: ClassroomCourse[] = [
      {
        id: 'course_mgmt_tech',
        name: 'إدارة أعمال وتكنولوجيا (المادة التخصصية)',
        section: 'الفصل الأول - الكلية التطبيقية',
        instructor: 'د. أستاذ المساق',
        classroomUrl: 'https://classroom.google.com',
        scheduleDescription: 'محاضرات إلكترونية مسجلة + نقاش وجاهي',
      },
      {
        id: 'course_accounting_info',
        name: 'نظم معلومات ومحاسبة تكاليف',
        section: 'المستوى الثاني',
        instructor: 'د. منسق المادة',
        classroomUrl: 'https://classroom.google.com',
        scheduleDescription: 'تكليفات أسبوعية على الكلاس روم',
      },
      {
        id: 'course_business_english',
        name: 'لغة إنجليزية للأعمال (Business English)',
        section: 'متطلب تخصص',
        instructor: 'قسم اللغات',
        classroomUrl: 'https://classroom.google.com',
        scheduleDescription: 'تدريب على المصطلحات والمراسلات الإدارية',
      },
    ];

    this.saveCourses(defaultCourses);
    return defaultCourses;
  }

  public static saveCourses(courses: ClassroomCourse[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_COURSES, JSON.stringify(courses));
    } catch (e) {
      console.error('Failed to save courses:', e);
    }
  }

  public static addCourse(course: Omit<ClassroomCourse, 'id'>): ClassroomCourse[] {
    const list = this.getCourses();
    const newCourse: ClassroomCourse = {
      ...course,
      id: `course_${Date.now()}`,
    };
    list.push(newCourse);
    this.saveCourses(list);
    return list;
  }

  public static deleteCourse(id: string): ClassroomCourse[] {
    const list = this.getCourses().filter(c => c.id !== id);
    this.saveCourses(list);
    return list;
  }

  /**
   * جلب إعدادات الربط المباشر
   */
  public static getConfig(): ClassroomSyncConfig {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {};
  }

  public static saveConfig(cfg: Partial<ClassroomSyncConfig>): void {
    const current = this.getConfig();
    const updated = { ...current, ...cfg };
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(updated));
  }

  /**
   * المستورد الذكي (Smart AI Text Parser):
   * يقوم بتحليل أي نص منشور من دكتور الجامعة أو إعلان في الكلاس روم
   * واستخراج المهام ومواعيد الاختبارات واللقاءات الوجاهية تلقائياً
   */
  public static parseClassroomAnnouncement(rawText: string, defaultSubject: string = 'إدارة أعمال تكنولوجيا'): {
    tasksFound: ClassroomTaskItem[];
    detectedType: 'exam' | 'assignment' | 'lecture' | 'face_to_face';
    summary: string;
  } {
    const cleanText = rawText.trim();
    if (!cleanText) {
      return { tasksFound: [], detectedType: 'lecture', summary: 'النص فارغ' };
    }

    let detectedType: 'exam' | 'assignment' | 'lecture' | 'face_to_face' = 'lecture';
    const lower = cleanText.toLowerCase();

    if (cleanText.includes('امتحان') || cleanText.includes('اختبار') || cleanText.includes('نصفي') || cleanText.includes('نهائي') || lower.includes('exam') || lower.includes('quiz')) {
      detectedType = 'exam';
    } else if (cleanText.includes('واجب') || cleanText.includes('تكليف') || cleanText.includes('تسليم') || cleanText.includes('مشروع') || lower.includes('assignment') || lower.includes('task')) {
      detectedType = 'assignment';
    } else if (cleanText.includes('وجاهي') || cleanText.includes('حضور') || cleanText.includes('قاعة') || cleanText.includes('لقاء مباشر')) {
      detectedType = 'face_to_face';
    }

    // استخراج التاريخ المقترح إن وُجد
    let dueDateString: string | undefined = undefined;
    const dateMatch = cleanText.match(/\d{4}[-/]\d{1,2}[-/]\d{1,2}/) || cleanText.match(/\d{1,2}[-/]\d{1,2}/);
    if (dateMatch) {
      dueDateString = dateMatch[0];
    } else if (cleanText.includes('الأحد')) {
      dueDateString = 'يوم الأحد القادم';
    } else if (cleanText.includes('الاثنين')) {
      dueDateString = 'يوم الاثنين القادم';
    } else if (cleanText.includes('الثلاثاء')) {
      dueDateString = 'يوم الثلاثاء القادم';
    } else if (cleanText.includes('الأربعاء')) {
      dueDateString = 'يوم الأربعاء القادم';
    } else if (cleanText.includes('الخميس')) {
      dueDateString = 'يوم الخميس القادم';
    }

    // استخراج عنوان المهمة الذكي (أول سطر أو ملخص موجز)
    const lines = cleanText.split('\n').map(l => l.trim()).filter(Boolean);
    const primaryLine = lines[0] || 'مهمة دراسية جديدة من الكلاس روم';
    const conciseTitle = primaryLine.length > 80 ? primaryLine.substring(0, 77) + '...' : primaryLine;

    const newTask = PersonalFocusEngine.addClassroomTask({
      subject: defaultSubject,
      taskTitle: `[${detectedType === 'exam' ? 'امتحان 🚨' : detectedType === 'assignment' ? 'تسليم تكليف 📝' : detectedType === 'face_to_face' ? 'لقاء وجاهي 🏛️' : 'محاضرة 📚'}] ${conciseTitle} ${dueDateString ? `(${dueDateString})` : ''}`,
      type: detectedType,
      dueDate: dueDateString,
    });

    const tasks = newTask.classroomTasks;
    const addedItem = tasks[tasks.length - 1];

    return {
      tasksFound: addedItem ? [addedItem] : [],
      detectedType,
      summary: `تم التعرف على ${detectedType === 'exam' ? 'موعد اختبار' : detectedType === 'assignment' ? 'تكليف واجب' : detectedType === 'face_to_face' ? 'لقاء وجاهي' : 'محاضرة'} وإضافته لجدولك اليومي بنجاح!`,
    };
  }

  /**
   * فتح تطبيق Google Classroom مباشرة
   */
  public static openGoogleClassroom(): void {
    window.open('https://classroom.google.com', '_blank');
  }
}
