// ============================================================================
// AQLIYA INTELLIGENCE CORE — INTENT & PERMISSION CLASSIFIER
// ============================================================================

import type { AgentRole } from '../agentic-os/types';
import type { RequestIntent, PermissionLevel, UserRequestPayload } from './types';

export class IntentClassifier {
  /**
   * تصنيف الطلب حاسوبياً بدقة وتحديد الوكيل المختص ومستوى الصلاحيات
   */
  public static classify(rawInput: string, conversationId?: string): UserRequestPayload {
    const text = rawInput.trim();
    const lower = text.toLowerCase();

    let intent: RequestIntent = 'conversational_advisor';
    let targetAgent: AgentRole = 'chief_of_staff';
    let complexity: 'simple_conversational' | 'multi_step_task' = 'simple_conversational';
    let permissionLevel: PermissionLevel = 'read_only';

    // 1. فحص نوايا الرقابة والركود والأمان (Watchdog & Safety)
    if (
      lower.includes('راكد') ||
      lower.includes('متأخر') ||
      lower.includes('ركود') ||
      lower.includes('تنبيه') ||
      lower.includes('أمان') ||
      lower.includes('تحذير') ||
      lower.includes('مخاطر') ||
      lower.includes('مهام معلقة')
    ) {
      intent = 'safety_watchdog';
      targetAgent = 'watchdog_sentry';
      permissionLevel = 'read_only';
    }
    // 2. فحص نوايا الاستخبارات وتحليل المحتوى والروابط (Intel & Reels)
    else if (
      lower.includes('ريلز') ||
      lower.includes('رابط') ||
      lower.includes('يوتيوب') ||
      lower.includes('استخبارات') ||
      lower.includes('حلول تقنية') ||
      lower.includes('فكرة جديدة') ||
      lower.includes('لخص') ||
      lower.includes('محتوى')
    ) {
      intent = 'intel_analysis';
      targetAgent = 'intel_scout';
      permissionLevel = lower.includes('أضف') || lower.includes('احفظ') ? 'low_risk' : 'read_only';
    }
    // 3. فحص نوايا العمليات الحياتية والذاكرة والروتين (Life Ops & Memory)
    else if (
      lower.includes('ذاكر') ||
      lower.includes('وثق') ||
      lower.includes('عادات') ||
      lower.includes('طاقة') ||
      lower.includes('روتين') ||
      lower.includes('إرهاق') ||
      lower.includes('نوم') ||
      lower.includes('توازن') ||
      lower.includes('استكشاف الذات')
    ) {
      intent = 'life_ops_memory';
      targetAgent = 'life_ops';
      permissionLevel = lower.includes('وثق') || lower.includes('احفظ') || lower.includes('سجل') ? 'low_risk' : 'read_only';
    }
    // 4. فحص نوايا البناء البرمجي والكود والأنظمة (Code & Systems)
    else if (
      lower.includes('برمج') ||
      lower.includes('كود') ||
      lower.includes('قاعدة بيانات') ||
      lower.includes('معمارية') ||
      lower.includes('استعلامات') ||
      lower.includes('حل تقني') ||
      lower.includes('bugs') ||
      lower.includes('خطوة قادمة')
    ) {
      intent = 'code_engineering';
      targetAgent = 'systems_dev';
      permissionLevel = lower.includes('عدل') || lower.includes('حدث') ? 'medium_risk' : 'read_only';
    }
    // 5. فحص التخطيط الاستراتيجي وتفكيك المهام (Strategic Planning & DAG)
    else if (
      lower.includes('فكك') ||
      lower.includes('خطة') ||
      lower.includes('إطلاق') ||
      lower.includes('استراتيج') ||
      lower.includes('أهداف') ||
      lower.includes('مشروع جديد') ||
      lower.includes('مبادئ قيادية')
    ) {
      intent = 'strategic_planning';
      targetAgent = 'chief_of_staff';
      complexity = lower.includes('فكك') || lower.includes('خطة') || lower.includes('مشروع جديد') ? 'multi_step_task' : 'simple_conversational';
      permissionLevel = lower.includes('مشروع جديد') || lower.includes('تأسيس') ? 'high_critical' : 'read_only';
    }
    // 6. استعلام عن حالة مشروع (Project Status Query)
    else if (
      lower.includes('مشروع') ||
      lower.includes('روما') ||
      lower.includes('nexus') ||
      lower.includes('نسبة إنجاز') ||
      lower.includes('إحاطة الصباح') ||
      lower.includes('أولويات')
    ) {
      intent = 'project_status_query';
      targetAgent = 'chief_of_staff';
      permissionLevel = 'read_only';
    }

    // فحص إضافي لمستوى الصلاحيات عند طلب إنشاء أو تعديل جوهري
    if (lower.includes('أنشئ مشروع') || lower.includes('أضف مشروع') || lower.includes('حذف') || lower.includes('مسح')) {
      permissionLevel = 'high_critical';
      complexity = 'multi_step_task';
    }

    const requiresHumanApproval = permissionLevel === 'high_critical';

    return {
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      rawInput: text,
      timestamp: new Date().toISOString(),
      conversationId,
      intent,
      complexity,
      targetAgent,
      currentStage: 'UNDERSTANDING',
      permissionLevel,
      requiresHumanApproval,
    };
  }
}
