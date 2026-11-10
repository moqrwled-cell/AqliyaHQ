// ============================================================================
// AQLIYA AGENTIC OS — SAFE FILE OPERATIONS & SANDBOX GUARD
// ============================================================================

export interface SafeFileResult {
  success: boolean;
  content?: string;
  bytesWritten?: number;
  filePath?: string;
  error?: string;
}

export class SafeFileOps {
  // المجلدات المسموح بها حصراً للعمليات
  public static ALLOWED_ROOTS = [
    'E:\\AqliyaHQ',
    'E:\\Antigravity_Vault',
    'e:\\aqliyahq',
    'e:\\antigravity_vault',
  ];

  // الملفات المحظور قراءتها أو تعديلها حفاظاً على الأمان التام
  private static FORBIDDEN_FILE_PATTERNS = [
    '.env',
    '.env.local',
    '.git/config',
    'id_rsa',
    'credentials',
    'node_modules',
  ];

  // مخزن ملفات افتراضي للعمل أوفلاين في المتصفح عند عدم توفر نظام الملفات
  private static virtualFileStore: Map<string, string> = new Map();

  /**
   * جلب مكتبة fs الأصلية إذا كانت البيئة تدعم Node.js
   */
  private static getFs(): any {
    try {
      const g = globalThis as any;
      if (typeof g.require === 'function') {
        return g.require('fs');
      }
      if (typeof g.process !== 'undefined' && g.process?.versions?.node) {
        if (typeof g.require === 'function') return g.require('fs');
      }
    } catch {}
    return null;
  }

  private static getPath(): any {
    try {
      const g = globalThis as any;
      if (typeof g.require === 'function') {
        return g.require('path');
      }
      if (typeof g.process !== 'undefined' && g.process?.versions?.node) {
        if (typeof g.require === 'function') return g.require('path');
      }
    } catch {}
    return null;
  }

  /**
   * تدقيق المسار والتحقق من أنه يقع حصراً داخل المجلدات المصرحة
   */
  public static validatePath(inputPath: string): { isValid: boolean; normalizedPath: string; error?: string } {
    let clean = inputPath.trim().replace(/\//g, '\\');

    // منع محاولات اختراق الدليل عبر ..
    if (clean.includes('..\\') || clean.includes('\\..') || clean.includes('../')) {
      return { isValid: false, normalizedPath: clean, error: 'محاولة غير مصرح بها للالتفاف عبر المسارات النسبية (Path Traversal).' };
    }

    // فحص الملفات الحساسة المحظورة
    for (const forbidden of SafeFileOps.FORBIDDEN_FILE_PATTERNS) {
      if (clean.toLowerCase().includes(forbidden.toLowerCase())) {
        return { isValid: false, normalizedPath: clean, error: `الوصول لهذا الملف محظور أمنياً: ${forbidden}` };
      }
    }

    // إذا كان المسار نسبياً، يتم إسناده افتراضياً إلى مجلد أوبسيديان أو المشروع
    if (!clean.match(/^[a-zA-Z]:\\/)) {
      if (clean.startsWith('Projects\\') || clean.endsWith('.md')) {
        clean = `E:\\Antigravity_Vault\\${clean}`;
      } else {
        clean = `E:\\AqliyaHQ\\${clean}`;
      }
    }

    // التحقق من أن المسار يبدأ بأحد المجلدات المصرحة
    const lower = clean.toLowerCase();
    const isAllowed = SafeFileOps.ALLOWED_ROOTS.some((root) => lower.startsWith(root.toLowerCase()));

    if (!isAllowed) {
      return {
        isValid: false,
        normalizedPath: clean,
        error: `المسار يقع خارج النطاق المصرح به. النطاق المسموح به حصراً هو E:\\AqliyaHQ و E:\\Antigravity_Vault`,
      };
    }

    return { isValid: true, normalizedPath: clean };
  }

  /**
   * قراءة آمنة لملف نصي
   */
  public static async readFile(targetPath: string): Promise<SafeFileResult> {
    const val = SafeFileOps.validatePath(targetPath);
    if (!val.isValid) {
      return { success: false, error: val.error };
    }

    const fs = SafeFileOps.getFs();
    if (fs && typeof fs.readFileSync === 'function') {
      try {
        if (!fs.existsSync(val.normalizedPath)) {
          // فحص المخزن الافتراضي إن وجد
          if (SafeFileOps.virtualFileStore.has(val.normalizedPath)) {
            return {
              success: true,
              content: SafeFileOps.virtualFileStore.get(val.normalizedPath),
              filePath: val.normalizedPath,
            };
          }
          return { success: false, error: `الملف غير موجود: ${val.normalizedPath}` };
        }
        const content = fs.readFileSync(val.normalizedPath, 'utf-8');
        return { success: true, content, filePath: val.normalizedPath };
      } catch (err: any) {
        return { success: false, error: `فشل قراءة الملف: ${err.message}` };
      }
    }

    // في بيئة المتصفح: استخدام الذاكرة الافتراضية
    if (SafeFileOps.virtualFileStore.has(val.normalizedPath)) {
      return {
        success: true,
        content: SafeFileOps.virtualFileStore.get(val.normalizedPath),
        filePath: val.normalizedPath,
      };
    }

    return {
      success: true,
      content: `[محتوى افتراضي محفوظ للملف ${val.normalizedPath}]`,
      filePath: val.normalizedPath,
    };
  }

  /**
   * كتابة آمنة لملف نصي (إنشاء أو استبدال)
   */
  public static async writeFile(targetPath: string, content: string): Promise<SafeFileResult> {
    const val = SafeFileOps.validatePath(targetPath);
    if (!val.isValid) {
      return { success: false, error: val.error };
    }

    const fs = SafeFileOps.getFs();
    const pathMod = SafeFileOps.getPath();

    if (fs && typeof fs.writeFileSync === 'function') {
      try {
        if (pathMod && typeof pathMod.dirname === 'function') {
          const dir = pathMod.dirname(val.normalizedPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
        }
        fs.writeFileSync(val.normalizedPath, content, 'utf-8');
        SafeFileOps.virtualFileStore.set(val.normalizedPath, content);
        const g = globalThis as any;
        const bytesWritten = g.Buffer ? g.Buffer.byteLength(content, 'utf-8') : content.length;
        return {
          success: true,
          content,
          bytesWritten,
          filePath: val.normalizedPath,
        };
      } catch (err: any) {
        return { success: false, error: `فشل كتابة الملف: ${err.message}` };
      }
    }

    // بيئة المتصفح
    SafeFileOps.virtualFileStore.set(val.normalizedPath, content);
    return {
      success: true,
      content,
      bytesWritten: content.length,
      filePath: val.normalizedPath,
    };
  }

  /**
   * إلحاق محتوى بنهاية ملف
   */
  public static async appendFile(targetPath: string, additionalContent: string): Promise<SafeFileResult> {
    const readRes = await SafeFileOps.readFile(targetPath);
    const existing = readRes.success ? (readRes.content || '') : '';
    const updated = existing ? `${existing}\n${additionalContent}` : additionalContent;
    return SafeFileOps.writeFile(targetPath, updated);
  }

  /**
   * فحص وجود الملف
   */
  public static fileExists(targetPath: string): boolean {
    const val = SafeFileOps.validatePath(targetPath);
    if (!val.isValid) return false;

    const fs = SafeFileOps.getFs();
    if (fs && typeof fs.existsSync === 'function') {
      return fs.existsSync(val.normalizedPath);
    }
    return SafeFileOps.virtualFileStore.has(val.normalizedPath);
  }
}
