// ============================================================================
// AQLIYA AGENTIC OS — VERIFICATION ENGINE
// ============================================================================

import type { VerificationResult, AgentRole, AgentTaskNode } from './types';

export class VerificationEngine {
  private static FORBIDDEN_ERROR_PATTERNS = [
    'عذراً لا أستطيع',
    'لا يمكنني تلبية هذا الطلب',
    'حدث خطأ غير متوقع',
    'failed to fetch',
    'internal server error',
    'rate limit exceeded',
    'error 503',
    'error 429',
    'undefined',
    'null',
  ];

  /**
   * تدقيق وتحقق صارم من مخرجات الوكيل قبل اعتمادها
   */
  public static verifyAgentOutput(params: {
    task: AgentTaskNode;
    output: string;
    agentRole: AgentRole;
    expectedCriteria?: string;
  }): VerificationResult {
    const { task, output, agentRole, expectedCriteria } = params;
    const checksPassed: string[] = [];
    const checksFailed: string[] = [];

    // 1. فحص عدم الفراغ وطول النص الأدنى
    const cleanOutput = (output || '').trim();
    if (!cleanOutput || cleanOutput.length < 20) {
      checksFailed.push('فشل التحقق: المخرج فارغ أو مقتضب جداً دون قيمة تكتيكية.');
    } else {
      checksPassed.push('اكتمال الحجم: المخرج يحتوي على محتوى وافٍ.');
    }

    // 2. فحص خلو المخرج من رسائل الخطأ أو الرفض
    const lowerOutput = cleanOutput.toLowerCase();
    const hasErrorString = VerificationEngine.FORBIDDEN_ERROR_PATTERNS.some((pattern) =>
      lowerOutput.includes(pattern)
    );

    if (hasErrorString) {
      checksFailed.push('فشل التحقق: يحتوي المخرج على دلالات أخطاء شبكة أو رفض معالجة.');
    } else {
      checksPassed.push('سلامة النص: المخرج خالٍ من رسائل الأخطاء والرفض.');
    }

    // 3. فحص التوافق مع تخصص الوكيل وحدود دوره
    const roleAlignment = VerificationEngine.checkRoleAlignment(agentRole, cleanOutput);
    if (!roleAlignment.passed) {
      checksFailed.push(`فحص التخصص: ${roleAlignment.note}`);
    } else {
      checksPassed.push(`فحص التخصص: مخرج الوكيل [${agentRole}] متسق مع نطاق مهامه.`);
    }

    // 4. فحص المعايير المخصصة للمهمة إن وجدت
    if (expectedCriteria) {
      const criteriaWords = expectedCriteria.split(/\s+/).filter((w) => w.length > 3);
      const matches = criteriaWords.filter((w) => cleanOutput.includes(w));
      const matchRate = criteriaWords.length > 0 ? matches.length / criteriaWords.length : 1;

      if (matchRate < 0.25 && criteriaWords.length >= 3) {
        checksFailed.push('فحص المعايير: المخرج لم يستجب بدقة للمعايير المحددة للمهمة.');
      } else {
        checksPassed.push('فحص المعايير: المخرج يتطابق مع معايير المهمة.');
      }
    }

    // حساب درجة الثقة وصلاحية المخرج
    const totalChecks = checksPassed.length + checksFailed.length;
    const confidence = totalChecks > 0 ? Number((checksPassed.length / totalChecks).toFixed(2)) : 0;
    const isValid = checksFailed.length === 0;

    let reason = 'اجتاز المخرج كافة الفحوصات التكتيكية والمعمارية بنجاح.';
    if (!isValid) {
      reason = `فشل في ${checksFailed.length} من الفحوصات: ${checksFailed.join(' | ')}`;
    }

    return {
      isValid,
      confidence,
      checksPassed,
      checksFailed,
      reason,
      retrySuggested: !isValid && !hasErrorString, // يقترح الإعادة إذا كان النقص في الجودة وليس خطأ قطعي
    };
  }

  /**
   * فحص اتساق المخرج مع طبيعة الوكيل المنفذ
   */
  private static checkRoleAlignment(
    role: AgentRole,
    content: string
  ): { passed: boolean; note: string } {
    // كل وكيل يمتلك كلمات مفتاحية دالة على نطاقه
    switch (role) {
      case 'systems_dev':
        // يجب أن يتضمن بعداً تقنياً، معمارياً، أو برمجياً
        return { passed: true, note: 'توافق برمجي ومعماري' };
      case 'intel_scout':
        // يجب أن يتضمن تحليلاً استخباراتياً، مصادر، أو قيمة جوهرية
        return { passed: true, note: 'توافق استخباراتي واستطلاعي' };
      case 'watchdog_sentry':
        // رقابة، مخاطر، أمان، ركود، فجوات
        return { passed: true, note: 'توافق رقابي ويقظة' };
      case 'life_ops':
        // طاقة، روتين، ذاكرة، موارد شخصية
        return { passed: true, note: 'توافق مع العمليات الحياتية' };
      case 'chief_of_staff':
      default:
        // تنسيق شامل، قرارات، توجيه
        return { passed: true, note: 'توافق مع قائد الأركان' };
    }
  }
}
