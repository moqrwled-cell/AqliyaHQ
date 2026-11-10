// ============================================================================
// AQLIYA HQ — COMPREHENSIVE PROJECT CATALOG DATA (Phase 7)
// Full indexing of Commander Mohammad's 19 Obsidian Projects
// ============================================================================

import type { ComprehensiveProjectProfile } from './types';

export const COMPREHENSIVE_PROJECT_CATALOG: ComprehensiveProjectProfile[] = [
  // --------------------------------------------------------------------------
  // 1. موقع إدارة كفي روما (Roma Cafe)
  // --------------------------------------------------------------------------
  {
    id: 'proj-roma-cafe',
    slug: 'business-roma-cafe',
    titleAr: 'موقع إدارة كفي روما (Roma Cafe)',
    titleEn: 'Roma Cafe Management Portal',
    category: 'business',
    vaultFolder: 'Business & Cafe/موقع ادارة كفي روما',
    description: 'نظام رقمي متكامل لإدارة الطاولات، تسجيل نتائج ألعاب الورق، وقوائم المشروبات لكوفي شوب روما.',
    status: 'completed',
    progressPercent: 95,
    priority: 'high',
    currentFocus: 'توفير حزم التشغيل المحلية على أجهزة الكافيه واستقرار تسجيل النتائج الميداني',
    nextMilestone: 'إضافة وضع عدم الاتصال (Offline Mode) الكامل مع مزامنة الفواتير',
    objectives: [
      { id: 'obj-roma-1', title: 'بناء واجهة سريعة لتسجيل نتائج ألعاب الورق والطاولات', completed: true },
      { id: 'obj-roma-2', title: 'تصميم قائمة مشروبات ومأكولات تفاعلية حديثة', completed: true },
      { id: 'obj-roma-3', title: 'توفير حزمة تشغيل فورية واستضافة سريعة', completed: true },
      { id: 'obj-roma-4', title: 'نظام فواتير يومي وطباعة الإيصالات', completed: false, targetDate: '2026-12-01' },
    ],
    steps: [
      { id: 'step-roma-1', title: 'إعداد هيكل المشروع والـ UI الأولي المتجاوب', status: 'completed', assigneeAgent: 'systems_dev' },
      { id: 'step-roma-2', title: 'ضبط حسابات النقاط والنتائج الفورية للزبائن', status: 'completed', assigneeAgent: 'systems_dev' },
      { id: 'step-roma-3', title: 'إضافة تصميم قائمة المشروبات الاحترافية', status: 'completed', assigneeAgent: 'chief_of_staff' },
      { id: 'step-roma-4', title: 'اختبار الحزمة الميدانية في مقهى روما', status: 'completed', assigneeAgent: 'watchdog_sentry' },
      { id: 'step-roma-5', title: 'مزامنة الفواتير اليومية مع السحابة أو التخزين المحلي', status: 'in_progress', assigneeAgent: 'systems_dev' },
    ],
    techDebt: [
      { id: 'td-roma-1', title: 'اعتماد الواجهة على التخزين المؤقت المحلي فقط', severity: 'medium', impact: 'فقدان بيانات الجولات عند إعادة ضبط المتصفح', remediation: 'ربط قاعدة بيانات IndexedDB محلية دائمة', detectedAt: '2026-08-29' },
    ],
    risks: [
      { id: 'risk-roma-1', risk: 'انقطاع الإنترنت المفاجئ أثناء جولات الألعاب', severity: 'high', probability: 'high', mitigation: 'تفعيل نمط التشغيل بدون اتصال PWA بالكامل' },
    ],
    failureModes: [
      { scenario: 'تعليق المتصفح أثناء تسجيل جولة حساسة', prevention: 'حفظ كل نقرة تلقائياً في التخزين الدائم واستعادة الحالة فورياً' },
    ],
    decisions: [
      { id: 'dec-roma-1', question: 'اعتماد التخزين المحلي أم خادم خارجي؟', chosenOption: 'تخزين محلي أولاً مع خيار تصدير JSON', rationale: 'انقطاعات الكهرباء والإنترنت في غزة تستلزم الاستقلالية التامة', decidedAt: '2026-08-15', impactSummary: 'نجاح التطبيق بالعمل في أسوأ الظروف' },
    ],
    files: [
      { name: 'implementation_plan.md', type: 'plan', relativePath: 'Business & Cafe/موقع ادارة كفي روما/implementation_plan.md', preview: '# خطة بناء تطبيق كفي روما\n- بناء واجهة تسجيل نقاط ألعاب الورق\n- تصميم نظام سريع للطلبات' },
      { name: 'task.md', type: 'task', relativePath: 'Business & Cafe/موقع ادارة كفي روما/task.md', preview: '## المهام المكتملة:\n- [x] إعداد هيكل المشروع\n- [x] ضبط حسابات النقاط' },
      { name: 'walkthrough.md', type: 'walkthrough', relativePath: 'Business & Cafe/موقع ادارة كفي روما/walkthrough.md', preview: 'تم بناء الموقع واختباره وتوفير حزمة تشغيل فورية بنجاح.' },
    ],
    healthIndex: 94,
    lastAuditDate: '2026-11-09',
  },

  // --------------------------------------------------------------------------
  // 2. تطوير موقع سوبر ماركت مقداد (Meqdad Supermarket)
  // --------------------------------------------------------------------------
  {
    id: 'proj-meqdad-market',
    slug: 'business-meqdad-supermarket',
    titleAr: 'تطوير موقع سوبر ماركت مقداد',
    titleEn: 'Meqdad Supermarket Online Platform',
    category: 'business',
    vaultFolder: 'Business & Cafe/تطوير موقع سوبر ماركت مقداد',
    description: 'منصة تسوق رقمية ومستودع للمنتجات الغذائية والاستهلاكية لسوبرماركت مقداد مع نظام طلبات وسلة تسوق.',
    status: 'active',
    progressPercent: 78,
    priority: 'high',
    currentFocus: 'إكمال محرك فلترة الأصناف حسب الأقسام وعروض التوفير والربط بواتساب',
    nextMilestone: 'إطلاق النسخة التجريبية لسكان الحي لتلقي أول 50 طلباً',
    objectives: [
      { id: 'obj-meq-1', title: 'بناء واجهة مستخدم سريعة لعرض أكثر من 1000 صنف', completed: true },
      { id: 'obj-meq-2', title: 'إرسال تفاصيل السلة فورياً عبر WhatsApp API', completed: true },
      { id: 'obj-meq-3', title: 'لوحة إدارة إضافة المنتجات وتعديل الأسعار', completed: false, targetDate: '2026-11-25' },
    ],
    steps: [
      { id: 'step-meq-1', title: 'تنظيم شجرة الأقسام: ألبان، معلبات، مشروبات، بهارات', status: 'completed', assigneeAgent: 'chief_of_staff' },
      { id: 'step-meq-2', title: 'بناء سلة الشراء وحساب التوتال التلقائي', status: 'completed', assigneeAgent: 'systems_dev' },
      { id: 'step-meq-3', title: 'قالب رسالة الواتساب المتضمن أسماء المنتجات والعنوان', status: 'completed', assigneeAgent: 'systems_dev' },
      { id: 'step-meq-4', title: 'ضبط خادم التخزين للمنتجات والصور محلياً', status: 'in_progress', assigneeAgent: 'systems_dev' },
    ],
    techDebt: [
      { id: 'td-meq-1', title: 'الصور مخزنة محلياً بأحجام كبيرة', severity: 'high', impact: 'بطء تحميل الصفحة على شبكات الجوال الضعيفة', remediation: 'تحويل الصور تلقائياً لصيغة WebP المضغوطة', detectedAt: '2026-10-10' },
    ],
    risks: [
      { id: 'risk-meq-1', risk: 'تغير أسعار السلع بسرعة بسبب تقلبات العملة', severity: 'critical', probability: 'high', mitigation: 'توفير أداة رفع أسعار جماعية بنسبة مئوية فورية' },
    ],
    failureModes: [
      { scenario: 'وصول طلب غير مفهوم عبر الواتساب', prevention: 'صياغة رسالة مشفرة بنصوص واضحة ومحددة السعر الإجمالي' },
    ],
    decisions: [
      { id: 'dec-meq-1', question: 'هل نعتمد بوابة دفع إلكتروني أم الدفع عند الاستلام؟', chosenOption: 'الدفع عند الاستلام (COD)', rationale: 'الوضع النقدي في القطاع يفضل السيولة النقدية اليدوية', decidedAt: '2026-09-02', impactSummary: 'زيادة إقبال المشترين وسهولة التبادل' },
    ],
    files: [
      { name: 'implementation_plan.md', type: 'plan', relativePath: 'Business & Cafe/تطوير موقع سوبر ماركت مقداد/implementation_plan.md' },
      { name: 'task.md', type: 'task', relativePath: 'Business & Cafe/تطوير موقع سوبر ماركت مقداد/task.md' },
    ],
    healthIndex: 82,
    lastAuditDate: '2026-11-08',
  },

  // --------------------------------------------------------------------------
  // 3. تصميم قائمة مشروبات احترافية (Professional Cafe Menu)
  // --------------------------------------------------------------------------
  {
    id: 'proj-cafe-menu',
    slug: 'business-cafe-menu',
    titleAr: 'تصميم قائمة مشروبات احترافية',
    titleEn: 'Professional Cafe Menu Design',
    category: 'business',
    vaultFolder: 'Business & Cafe/تصميم قائمة مشروبات احترافية',
    description: 'تصميم وطباعة منيو فاخر عصري للمشروبات الساخنة والباردة والمأكولات الخفيفة بنسختي الـ QR والورقية.',
    status: 'completed',
    progressPercent: 100,
    priority: 'medium',
    currentFocus: 'أرشفة المطبوعات وتوفير باركود QR سريع يفتح القائمة الرقمية في الهواتف',
    nextMilestone: 'مشروع منجز وموثق بالكامل',
    objectives: [
      { id: 'obj-cmenu-1', title: 'صياغة هوية بصرية مريحة للعين وفخمة', completed: true },
      { id: 'obj-cmenu-2', title: 'توزيع الأصناف حسب الأكثر طلباً وهوامش الربح', completed: true },
    ],
    steps: [
      { id: 'step-cmenu-1', title: 'حصر قائمة المشروبات وتثبيت التسميات الإبداعية', status: 'completed' },
      { id: 'step-cmenu-2', title: 'تصميم القالب بالألوان المتوافقة مع ديكور المقهى', status: 'completed' },
      { id: 'step-cmenu-3', title: 'تصدير نسخة PDF قابلة للطباعة بدقة 300 DPI', status: 'completed' },
    ],
    techDebt: [],
    risks: [],
    failureModes: [],
    decisions: [
      { id: 'dec-cmenu-1', question: 'اعتماد لغة واحدة أم عربي/إنجليزي؟', chosenOption: 'عربي بالخط العريض مع أسماء إنجليزية مصغرة', rationale: 'ملائمة رواد المقهى وطلبة الجامعات', decidedAt: '2026-08-20', impactSummary: 'وضوح فائق للمرتادين' },
    ],
    files: [
      { name: 'task.md', type: 'task', relativePath: 'Business & Cafe/تصميم قائمة مشروبات احترافية/task.md' },
    ],
    healthIndex: 100,
    lastAuditDate: '2026-10-01',
  },

  // --------------------------------------------------------------------------
  // 4. تصميم بطاقات كوفي شوب (Cafe Loyalty & Game Cards)
  // --------------------------------------------------------------------------
  {
    id: 'proj-cafe-cards',
    slug: 'business-cafe-cards',
    titleAr: 'تصميم بطاقات كوفي شوب',
    titleEn: 'Cafe Loyalty & Game Cards',
    category: 'business',
    vaultFolder: 'Business & Cafe/تصميم بطاقات كوفي شوب',
    description: 'بطاقات ولاء للزبائن الدائمين، وبطاقات تسجيل نقاط للألعاب وجولات الورق المتنوعة.',
    status: 'completed',
    progressPercent: 100,
    priority: 'medium',
    currentFocus: 'توزيع البطاقات على الطاولات وتوثيق تفاعل الزبائن',
    nextMilestone: 'إصدار نسخة إلكترونية مدمجة بالتطبيق مستقبلاً',
    objectives: [
      { id: 'obj-ccards-1', title: 'تصميم بطاقات ولاء قابلة للختم (10 مشروبات + 1 مجاناً)', completed: true },
      { id: 'obj-ccards-2', title: 'تصميم بطاقات جداول نقاط للتركس والهند والبلوت', completed: true },
    ],
    steps: [
      { id: 'step-ccards-1', title: 'تجهيز مسودات الطباعة وتحديد أبعاد الكرت', status: 'completed' },
      { id: 'step-ccards-2', title: 'الطباعة وتوزيع الحزم في الكافيه', status: 'completed' },
    ],
    techDebt: [],
    risks: [],
    failureModes: [],
    decisions: [],
    files: [
      { name: 'task.md', type: 'task', relativePath: 'Business & Cafe/تصميم بطاقات كوفي شوب/task.md' },
    ],
    healthIndex: 100,
    lastAuditDate: '2026-09-15',
  },

  // --------------------------------------------------------------------------
  // 5. تنسيق وترتيب محاضرات الجغرافيا (Regional Geography Lectures)
  // --------------------------------------------------------------------------
  {
    id: 'proj-geography-lectures',
    slug: 'academics-regional-geography',
    titleAr: 'تنسيق وترتيب محاضرات الجغرافيا',
    titleEn: 'Regional & World Geography Course',
    category: 'academics',
    vaultFolder: 'Academics & Geography/تنسيق وترتيب محاضرات الجغرافيا',
    description: 'الأرشيف الأكاديمي الشامل لجغرافيا العالم الجديد والمحاضرات الإقليمية مع 45 خريطة جغرافية وطبيعية وتضاريسية عالية الدقة.',
    status: 'completed',
    progressPercent: 100,
    priority: 'high',
    currentFocus: 'المراجعة والتحضير للامتحانات واستخراج الملخصات الذكية عند الطلب',
    nextMilestone: 'تحويل المقرر إلى أسئلة تدريب تفاعلية عبر الذكاء الاصطناعي',
    objectives: [
      { id: 'obj-geo-1', title: 'فهرسة جغرافيا القارة الأمريكية والعالم الجديد بالكامل', completed: true },
      { id: 'obj-geo-2', title: 'دمج الخرائط الجغرافية الطبيعية والتضاريسية مع الشرح النظري', completed: true },
      { id: 'obj-geo-3', title: 'تلخيص المحاضرات الإقليمية من 1 إلى 10 بنظام النقاط المحكمة', completed: true },
    ],
    steps: [
      { id: 'step-geo-1', title: 'تنظيم نصوص المحاضرات وتدقيق أسماء السلاسل الجبلية والهضاب', status: 'completed' },
      { id: 'step-geo-2', title: 'معالجة وتسمية 45 صورة خريطة وربطها بروابط ماركداون تشعبية', status: 'completed' },
      { id: 'step-geo-3', title: 'إنشاء ملفات ملخصات المراجعة السريعة', status: 'completed' },
    ],
    techDebt: [],
    risks: [],
    failureModes: [],
    decisions: [
      { id: 'dec-geo-1', question: 'هل نعتمد صوراً مصغرة أم ملفات صور عالية الدقة؟', chosenOption: 'صور عالية الدقة مع تسميات عربية موضحة', rationale: 'التفاصيل التضاريسية والأقاليم المناخية تتطلب وضوحاً كاملاً', decidedAt: '2026-09-01', impactSummary: 'مرجع أكاديمي متفوق ومرئي تماماً' },
    ],
    files: [
      { name: 'new_world_geography_course.md', type: 'lecture', relativePath: 'Academics & Geography/تنسيق وترتيب محاضرات الجغرافيا/new_world_geography_course.md' },
      { name: 'regional_geography_lectures_1_to_5.md', type: 'lecture', relativePath: 'Academics & Geography/تنسيق وترتيب محاضرات الجغرافيا/regional_geography_lectures_1_to_5.md' },
      { name: 'regional_geography_lectures_6_to_10.md', type: 'lecture', relativePath: 'Academics & Geography/تنسيق وترتيب محاضرات الجغرافيا/regional_geography_lectures_6_to_10.md' },
    ],
    healthIndex: 100,
    lastAuditDate: '2026-11-05',
  },

  // --------------------------------------------------------------------------
  // 6. إنشاء ملف PDF لحل الواجب (Homework PDF Generator)
  // --------------------------------------------------------------------------
  {
    id: 'proj-homework-pdf',
    slug: 'academics-homework-pdf',
    titleAr: 'إنشاء ملف PDF لحل الواجب',
    titleEn: 'Academic Assignment PDF Builder',
    category: 'academics',
    vaultFolder: 'Academics & Geography/إنشاء ملف PDF لحل الواجب',
    description: 'أداة ووثائق تجهيز حلول التكاليف والواجبات الجامعية بصيغة PDF مهندسة ومنسقة باحترافية.',
    status: 'completed',
    progressPercent: 100,
    priority: 'medium',
    currentFocus: 'أرشفة النماذج لاستخدامها في التكاليف القادمة',
    nextMilestone: 'قالب جاهز للاستخدام الفوري',
    objectives: [
      { id: 'obj-hw-1', title: 'تنسيق الحلول بالخطوط الرسمية والألوان الأكاديمية المعتمدة', completed: true },
      { id: 'obj-hw-2', title: 'دمج الصور والمراجع وتوليد ملف PDF عالي الجودة', completed: true },
    ],
    steps: [
      { id: 'step-hw-1', title: 'جمع مادة التكليف ومراجعة الإجابات النموذجية', status: 'completed' },
      { id: 'step-hw-2', title: 'توليد ملفات PDF وتأكيد الطباعة والتسليم', status: 'completed' },
    ],
    techDebt: [],
    risks: [],
    failureModes: [],
    decisions: [],
    files: [
      { name: 'task.md', type: 'task', relativePath: 'Academics & Geography/إنشاء ملف PDF لحل الواجب/task.md' },
    ],
    healthIndex: 100,
    lastAuditDate: '2026-10-25',
  },

  // --------------------------------------------------------------------------
  // 7. تطوير تطبيق تنظيم الحياة (To Top Life Ops)
  // --------------------------------------------------------------------------
  {
    id: 'proj-to-top-life',
    slug: 'life-to-top-ops',
    titleAr: 'تطوير تطبيق تنظيم الحياة (To Top Life Ops)',
    titleEn: 'To Top Life Ops Application',
    category: 'life_ops',
    vaultFolder: 'Life & Productivity/تطوير تطبيق تنظيم الحياة',
    description: 'المعمارية المخصصة لتنظيم الروتين اليومي، العادات الحيوية، إدارة الطاقة، ونقاط الإنجاز الشخصي لمحمد قرمان.',
    status: 'active',
    progressPercent: 88,
    priority: 'critical',
    currentFocus: 'دمج مركز ذكاء الحياة مباشرة في المقر التنفيذي AQLIYA HQ كركيزة سيادية',
    nextMilestone: 'ربط العادات اليومية تلقائياً بمصفوفة الإحاطة الصباحية SITREP',
    objectives: [
      { id: 'obj-top-1', title: 'لوحة عادات يومية مع نظام نقاط التحفيز والاستمرارية (Streak)', completed: true },
      { id: 'obj-top-2', title: 'متتبع المهام السريع والتركيز الصباحي في ساعات ذروة الفجر', completed: true },
      { id: 'obj-top-3', title: 'التكامل الحي مع AQLIYA HQ بدون الحاجة لتطبيق منفصل', completed: true },
    ],
    steps: [
      { id: 'step-top-1', title: 'تحديد الأعمدة الخمسة: الروحية، الجسدية، الفكرية، المالية، الاجتماعية', status: 'completed', assigneeAgent: 'life_ops' },
      { id: 'step-top-2', title: 'بناء مقياس الطاقة اليومية (Energy & Readiness Index)', status: 'completed', assigneeAgent: 'life_ops' },
      { id: 'step-top-3', title: 'تصميم الواجهة الفاخرة المريحة بنمط أبل الزجاجي', status: 'in_progress', assigneeAgent: 'chief_of_staff' },
    ],
    techDebt: [
      { id: 'td-top-1', title: 'تشتت السجلات بين ملفات Markdown المنفصلة', severity: 'medium', impact: 'صعوبة تتبع السلسلة التاريخية للالتزام لشهور', remediation: 'تخزين سجل العادات في قاعدة البيانات المحلية الموحدة', detectedAt: '2026-11-01' },
    ],
    risks: [
      { id: 'risk-top-1', risk: 'تراكم المهام والمشاريع التقنية مما يؤدي لإهمال العادات الجسدية والروحية', severity: 'critical', probability: 'medium', mitigation: 'تنبيهات استباقية من Life Ops Warden عند انخفاض الالتزام' },
    ],
    failureModes: [
      { scenario: 'شعور بالإرهاق والانطفاء (Burnout)', prevention: 'تخفيض حجم المهام المعروضة تلقائياً عند تسجيل طاقة منخفضة' },
    ],
    decisions: [
      { id: 'dec-top-1', question: 'بناء تطبيق منفصل أم دمجه داخل AQLIYA HQ؟', chosenOption: 'دمجه كنواة أصلية داخل عقلية', rationale: 'توحيد واجهة القيادة في مكان واحد يمنع تشتت القائد', decidedAt: '2026-11-08', impactSummary: 'تركيز فائق وسلاسة في الإدارة اليومية' },
    ],
    files: [
      { name: 'implementation_plan.md', type: 'plan', relativePath: 'Life & Productivity/تطوير تطبيق تنظيم الحياة/implementation_plan.md' },
      { name: 'task.md', type: 'task', relativePath: 'Life & Productivity/تطوير تطبيق تنظيم الحياة/task.md' },
      { name: 'prompt_draft.md', type: 'plan', relativePath: 'Life & Productivity/تطوير تطبيق تنظيم الحياة/prompt_draft.md' },
    ],
    healthIndex: 91,
    lastAuditDate: '2026-11-09',
  },

  // --------------------------------------------------------------------------
  // 8. إدارة استهلاك الذاكرة العشوائية (RAM Optimization Engine)
  // --------------------------------------------------------------------------
  {
    id: 'proj-ram-opt',
    slug: 'life-ram-optimization',
    titleAr: 'إدارة استهلاك الذاكرة العشوائية',
    titleEn: 'Windows RAM & Performance Optimizer',
    category: 'life_ops',
    vaultFolder: 'Life & Productivity/إدارة استهلاك الذاكرة العشوائية',
    description: 'تحسين استهلاك الرام وموارد المعالج على نظام ويندوز للحفاظ على سرعة محطات العمل والبرمجة.',
    status: 'completed',
    progressPercent: 95,
    priority: 'medium',
    currentFocus: 'مراقبة العمليات الخلفية لمتصفحات Chrome و VS Code',
    nextMilestone: 'إضافة سكريبت تفريغ كاش الذاكرة التلقائي',
    objectives: [
      { id: 'obj-ram-1', title: 'تحديد العمليات والبرامج الأكثر استنزافاً لموارد الجهاز', completed: true },
      { id: 'obj-ram-2', title: 'ضبط إعدادات Windows Services لتسريع الإقلاع والاستجابة', completed: true },
    ],
    steps: [
      { id: 'step-ram-1', title: 'تحليل استهلاك البرامج وإنشاء دليل الاستبعاد', status: 'completed' },
      { id: 'step-ram-2', title: 'برمجة سكريبت تخفيف الحمل عند تشغيل مشاريع الذكاء الكبيرة', status: 'completed' },
    ],
    techDebt: [],
    risks: [],
    failureModes: [],
    decisions: [],
    files: [
      { name: 'task.md', type: 'task', relativePath: 'Life & Productivity/إدارة استهلاك الذاكرة العشوائية/task.md' },
    ],
    healthIndex: 96,
    lastAuditDate: '2026-10-18',
  },

  // --------------------------------------------------------------------------
  // 9. مشروع NexusOS و ContractGuard
  // --------------------------------------------------------------------------
  {
    id: 'proj-nexus-os',
    slug: 'os-nexus-os',
    titleAr: 'مشروع NexusOS و ContractGuard',
    titleEn: 'NexusOS & ContractGuard Legal AI',
    category: 'tech_os',
    vaultFolder: 'Operating Systems & AI/nexus os',
    description: 'منظومة SaaS متقدمة لفحص ومقارنة وتدقيق العقود القانونية بالذكاء الاصطناعي مع خطة تسويق متكاملة على AppSumo و Whop.',
    status: 'active',
    progressPercent: 92,
    priority: 'critical',
    currentFocus: 'تجهيز مواد إطلاق Whop و AppSumo والتسعير التنافسي للترخيص الدائم',
    nextMilestone: 'إطلاق حملة التدقيق والتسجيل العام لـ ContractGuard',
    objectives: [
      { id: 'obj-nex-1', title: 'بناء محرك فحص البنود التعسفية والديون الخفية في العقود', completed: true },
      { id: 'obj-nex-2', title: 'إعداد تقرير التقييم القانوني المعتمد لـ ContractGuard', completed: true },
      { id: 'obj-nex-3', title: 'تصميم هوية أبل الفاخرة للواجهة (Apple Design System)', completed: true },
      { id: 'obj-nex-4', title: 'إطلاق قوائم المنتجات الرقمية على Whop و AppSumo', completed: false, targetDate: '2026-12-15' },
    ],
    steps: [
      { id: 'step-nex-1', title: 'اعتماد معمارية فحص العقود ومطابقتها للقانون التجاري الأمريكي', status: 'completed', assigneeAgent: 'systems_dev' },
      { id: 'step-nex-2', title: 'إنتاج الصور التسويقية ومقاطع الشرح VSL', status: 'completed', assigneeAgent: 'intel_scout' },
      { id: 'step-nex-3', title: 'إجراء تدقيق تصميم نظام أبل وتصفية التكرار (Unslop)', status: 'completed', assigneeAgent: 'chief_of_staff' },
      { id: 'step-nex-4', title: 'إعداد وثائق التكامل مع Zapier و Make و ActiveCampaign', status: 'completed', assigneeAgent: 'systems_dev' },
      { id: 'step-nex-5', title: 'ربط بوابات الدفع الدولية والتسليم التلقائي للتراخيص', status: 'in_progress', assigneeAgent: 'systems_dev' },
    ],
    techDebt: [
      { id: 'td-nex-1', title: 'حجم ملفات المعاينة والصور داخل المستودع كبير جداً', severity: 'low', impact: 'بطء خفيف عند استنساخ المستودع', remediation: 'نقل الوسائط الثقيلة إلى CDN أو تخزين خارجي عند الإنتاج', detectedAt: '2026-11-03' },
    ],
    risks: [
      { id: 'risk-nex-1', risk: 'تغير سياسات بوابات الدفع الدولية بخصوص الحسابات', severity: 'critical', probability: 'medium', mitigation: 'تجهيز حسابات بديلة متعددة واستخدام منصة Whop كوسيط مرخص' },
    ],
    failureModes: [
      { scenario: 'خطأ في فحص بند قانوني حساس', prevention: 'وضع إخلاء مسؤولية استشاري والتأكيد على المراجعة البشرية المزدوجة' },
    ],
    decisions: [
      { id: 'dec-nex-1', question: 'هل نطلق كاشتراك شهري أم ترخيص دائم LTD؟', chosenOption: 'ترخيص دائم LTD في البداية عبر AppSumo لجمع السيولة ثم اشتراك شهري', rationale: 'جذب أوائل المشترين وبناء قاعدة عملاء فورية', decidedAt: '2026-10-15', impactSummary: 'تحفيز المبيعات وتسريع انتشار العلامة' },
    ],
    files: [
      { name: 'تقرير_تقييم_المحامي_الامريكي_ContractGuard.md', type: 'doc', relativePath: 'Operating Systems & AI/nexus os/تقرير_تقييم_المحامي_الامريكي_ContractGuard.md' },
      { name: 'APPLE_DESIGN_SYSTEM_AUDIT_REPORT.md', type: 'doc', relativePath: 'Operating Systems & AI/nexus os/APPLE_DESIGN_SYSTEM_AUDIT_REPORT.md' },
      { name: 'whop_launch_strategy.md', type: 'plan', relativePath: 'Operating Systems & AI/nexus os/whop_launch_strategy.md' },
      { name: 'VERSIONS.md', type: 'doc', relativePath: 'Operating Systems & AI/nexus os/VERSIONS.md' },
    ],
    healthIndex: 93,
    lastAuditDate: '2026-11-09',
  },

  // --------------------------------------------------------------------------
  // 10. عقلية - AQLIYA HQ Live Repo
  // --------------------------------------------------------------------------
  {
    id: 'proj-aqliya-hq',
    slug: 'os-aqliya-hq-live',
    titleAr: 'عقلية - AQLIYA HQ Live Repo',
    titleEn: 'AQLIYA HQ Autonomous Personal OS',
    category: 'tech_os',
    vaultFolder: 'Operating Systems & AI/عقلية - AQLIYA HQ Live Repo',
    description: 'المقر الرقمي الذاتي ونظام تشغيل الوكلاء السيادي للقائد محمد قرمان، مبني على React + Tailwind + Capacitor + Gemini.',
    status: 'active',
    progressPercent: 85,
    priority: 'critical',
    currentFocus: 'إنجاز المرحلة 7 (تكامل إدارة الحياة والمشاريع) وربط مركز القرار والـ SITREP',
    nextMilestone: 'استكمال مراحل خارطة التطوير الإحدى عشرة حتى الإطلاق الإنتاجي الكامل',
    objectives: [
      { id: 'obj-aql-1', title: 'بناء العقل المركزي Intelligence Core وآلة الحالة من 8 مراحل', completed: true },
      { id: 'obj-aql-2', title: 'بناء الذاكرة السباعية وشبكة رسم المعرفة Knowledge Graph', completed: true },
      { id: 'obj-aql-3', title: 'تشغيل أسطول الوكلاء الخمسة ومحرك الأدوات ومحطة Mission Control', completed: true },
      { id: 'obj-aql-4', title: 'الربط التلقائي بين أهداف الحياة والمشاريع الـ 19', completed: true },
    ],
    steps: [
      { id: 'step-aql-1', title: 'المرحلة 1: التدقيق المعماري والأمني الشامل', status: 'completed' },
      { id: 'step-aql-2', title: 'المرحلة 2: بناء العقل المركزي Intelligence Core', status: 'completed' },
      { id: 'step-aql-3', title: 'المرحلة 3: بناء الذاكرة السباعية والـ Knowledge Graph', status: 'completed' },
      { id: 'step-aql-4', title: 'المرحلة 4: تنسيق أسطول الوكلاء المستقلين', status: 'completed' },
      { id: 'step-aql-5', title: 'المرحلة 5: محرك الأدوات والعمليات الآمنة', status: 'completed' },
      { id: 'step-aql-6', title: 'المرحلة 6: محطة قيادة المهام والأسطول Mission Control', status: 'completed' },
      { id: 'step-aql-7', title: 'المرحلة 7: تكامل إدارة الحياة والمشاريع Project & Life Intelligence', status: 'in_progress' },
    ],
    techDebt: [],
    risks: [
      { id: 'risk-aql-1', risk: 'انقطاع الاتصال بالسحابة أثناء المعارك التكتيكية', severity: 'critical', probability: 'high', mitigation: 'تفعيل العمل دون اتصال Offline-First بنسبة 100%' },
    ],
    failureModes: [
      { scenario: 'تعارض البيانات عند مزامنة Supabase بعد انقطاع طويل', prevention: 'استخدام طابور المزامنة المحلي sync_queue مع حل النزاعات المبني على الطابع الزمني' },
    ],
    decisions: [
      { id: 'dec-aql-1', question: 'اعتماد الهوية البصرية: طابع عسكري جاف أم أبل زجاجي فاخر؟', chosenOption: 'طابع أبل الزجاجي الفاخر بلون كحلي وزمردي وخط عقيق', rationale: 'راحة بصرية دائمة للقائد مع الحفاظ على الانضباط والوقار القيادي', decidedAt: '2026-11-09', impactSummary: 'تجربة استخدام مريحة وفخمة جداً' },
    ],
    files: [
      { name: 'AQLIYA_ARCHITECTURE.md', type: 'doc', relativePath: 'AQLIYA_ARCHITECTURE.md' },
      { name: 'AQLIYA_DEVELOPMENT_ROADMAP.md', type: 'plan', relativePath: 'AQLIYA_DEVELOPMENT_ROADMAP.md' },
    ],
    healthIndex: 98,
    lastAuditDate: '2026-11-10',
  },

  // --------------------------------------------------------------------------
  // 11. إنشاء نظام إدارة الأفكار والمشاريع
  // --------------------------------------------------------------------------
  {
    id: 'proj-ideas-mgmt',
    slug: 'os-ideas-projects-mgmt',
    titleAr: 'إنشاء نظام إدارة الأفكار والمشاريع',
    titleEn: 'Ideas & Projects Management System',
    category: 'tech_os',
    vaultFolder: 'Operating Systems & AI/إنشاء نظام إدارة الأفكار والمشاريع',
    description: 'المخططات الهندسية الأولى لنظام ربط الأفكار والمشاريع وبناء رادار التحليل التكتيكي.',
    status: 'completed',
    progressPercent: 100,
    priority: 'high',
    currentFocus: 'أرشفة المخططات ودمج المخرجات داخل محرك AQLIYA HQ',
    nextMilestone: 'مشروع مدمج بنجاح',
    objectives: [
      { id: 'obj-ipm-1', title: 'رسم معمارية تدفق الأفكار من الالتقاط السريع إلى المشروع المنفذ', completed: true },
    ],
    steps: [
      { id: 'step-ipm-1', title: 'توثيق آليات التصنيف والتقييم الستة', status: 'completed' },
    ],
    techDebt: [],
    risks: [],
    failureModes: [],
    decisions: [],
    files: [
      { name: 'task.md', type: 'task', relativePath: 'Operating Systems & AI/إنشاء نظام إدارة الأفكار والمشاريع/task.md' },
    ],
    healthIndex: 100,
    lastAuditDate: '2026-10-12',
  },

  // --------------------------------------------------------------------------
  // 12. تخصيص واجهة مايكروتك العصرية (Mikrotik Dashboard)
  // --------------------------------------------------------------------------
  {
    id: 'proj-mikrotik-ui',
    slug: 'tools-mikrotik-dashboard',
    titleAr: 'تخصيص واجهة مايكروتك العصرية',
    titleEn: 'Modern Mikrotik Hotspot UI',
    category: 'tools',
    vaultFolder: 'Tools & Engineering/تخصيص واجهة مايكروتك العصرية',
    description: 'واجهة تسجيل دخول حديثة لشبكات مايكروتك (Hotspot Login) بتصميم عصري سريع وخفيف متوافق مع كافة الهواتف.',
    status: 'completed',
    progressPercent: 96,
    priority: 'medium',
    currentFocus: 'تثبيت القالب على أجهزة الراوتر بورد وتأكيد سرعة الفتح',
    nextMilestone: 'إضافة فحص صلاحية الكرت المتبقية فورياً',
    objectives: [
      { id: 'obj-mkt-1', title: 'تصميم صفحة تسجيل دخول هوتسبوت فائقة الخفة (أقل من 100KB)', completed: true },
      { id: 'obj-mkt-2', title: 'عرض معلومات الرصيد والوقت المتبقي وسرعة التنزيل', completed: true },
    ],
    steps: [
      { id: 'step-mkt-1', title: 'تصميم هيكل HTML/CSS المتوافق مع محرك متصفح أندرويد القديم', status: 'completed' },
      { id: 'step-mkt-2', title: 'اختبار الاستجابة على راوتر RouterBOARD 951', status: 'completed' },
    ],
    techDebt: [],
    risks: [],
    failureModes: [],
    decisions: [
      { id: 'dec-mkt-1', question: 'استخدام مكتبات JavaScript خارجية أم كود نقي؟', chosenOption: 'كود Vanilla JS و CSS نقي بدون مكتبات', rationale: 'ذاكرة المايكروتك ومعدل سرعة الشبكة المحلية يتطلبان سرعة استجابة فورية', decidedAt: '2026-09-08', impactSummary: 'تحميل الصفحة في 0.2 ثانية' },
    ],
    files: [
      { name: 'task.md', type: 'task', relativePath: 'Tools & Engineering/تخصيص واجهة مايكروتك العصرية/task.md' },
    ],
    healthIndex: 98,
    lastAuditDate: '2026-10-20',
  },

  // --------------------------------------------------------------------------
  // 13. تخطيط وبناء تطبيق ألعاب بطاقات (Card Game Architecture)
  // --------------------------------------------------------------------------
  {
    id: 'proj-card-app-plan',
    slug: 'tools-card-game-app',
    titleAr: 'تخطيط وبناء تطبيق ألعاب بطاقات',
    titleEn: 'Card Game Engine Planning',
    category: 'tools',
    vaultFolder: 'Tools & Engineering/تخطيط وبناء تطبيق ألعاب بطاقات',
    description: 'التخطيط الهندسي الشامل وقواعد البيانات لبناء محرك رقمي لألعاب الورق الشعبية (تركس، كومبلكس، طرنيب).',
    status: 'completed',
    progressPercent: 90,
    priority: 'medium',
    currentFocus: 'تغذية المشروع الفعلي بالقواعد الحسابية الموثقة',
    nextMilestone: 'ربط المنطق الرياضي بواجهة لعب تفاعلية',
    objectives: [
      { id: 'obj-cgp-1', title: 'توثيق القواعد الحسابية لكل لعبة وجداول العقوبات والمكافآت', completed: true },
    ],
    steps: [
      { id: 'step-cgp-1', title: 'تحليل حالات الفوز والتعادل وتوزيع الأوراق', status: 'completed' },
    ],
    techDebt: [],
    risks: [],
    failureModes: [],
    decisions: [],
    files: [
      { name: 'task.md', type: 'task', relativePath: 'Tools & Engineering/تخطيط وبناء تطبيق ألعاب بطاقات/task.md' },
    ],
    healthIndex: 95,
    lastAuditDate: '2026-10-05',
  },

  // --------------------------------------------------------------------------
  // 14. تطوير لعبة ورق احترافية (Professional Card Game Dev)
  // --------------------------------------------------------------------------
  {
    id: 'proj-card-game-dev',
    slug: 'tools-pro-card-game',
    titleAr: 'تطوير لعبة ورق احترافية',
    titleEn: 'Interactive Pro Card Game',
    category: 'tools',
    vaultFolder: 'Tools & Engineering/تطوير لعبة ورق احترافية',
    description: 'تطبيق برمجي تفاعلي يتيح اللعب الجماعي ومحاكاة الذكاء الاصطناعي للاعبين الافتراضيين.',
    status: 'active',
    progressPercent: 72,
    priority: 'medium',
    currentFocus: 'تحسين ذكاء اللاعب الافتراضي في اختيار الورقة المناسبة',
    nextMilestone: 'إطلاق نسخة تجريبية محلية على شبكة واي فاي الكافيه',
    objectives: [
      { id: 'obj-pcg-1', title: 'بناء منطق اللعبة وشاشة اللعب ثلاثية الأبعاد خفيفة الوزن', completed: true },
      { id: 'obj-pcg-2', title: 'دعم اللعب متعدد اللاعبين عبر شبكة محلية (Local LAN)', completed: false, targetDate: '2026-12-10' },
    ],
    steps: [
      { id: 'step-pcg-1', title: 'برمجة خوارزميات توزيع الورق العشوائي النزيه', status: 'completed' },
      { id: 'step-pcg-2', title: 'تصميم حركة الورق بالأنيميشن السلس', status: 'in_progress' },
    ],
    techDebt: [
      { id: 'td-pcg-1', title: 'الاعتماد على محرك Canvas ثقيل في بعض الأجهزة القديمة', severity: 'medium', impact: 'هبوط معدل الإطارات على الجوالات الضعيفة', remediation: 'تبسيط عمليات إعادة الرسم واستخدام CSS Transforms', detectedAt: '2026-10-28' },
    ],
    risks: [
      { id: 'risk-pcg-1', risk: 'تعقيد ربط الأجهزة المتعددة بدون خادم خارجي', severity: 'medium', probability: 'medium', mitigation: 'استخدام بروتوكول WebRTC المباشر Peer-to-Peer' },
    ],
    failureModes: [],
    decisions: [],
    files: [
      { name: 'task.md', type: 'task', relativePath: 'Tools & Engineering/تطوير لعبة ورق احترافية/task.md' },
    ],
    healthIndex: 85,
    lastAuditDate: '2026-11-04',
  },

  // --------------------------------------------------------------------------
  // 15. تصميم تطبيق لتسجيل النتائج (Score Keeper App)
  // --------------------------------------------------------------------------
  {
    id: 'proj-score-keeper',
    slug: 'general-score-keeper-app',
    titleAr: 'تصميم تطبيق لتسجيل النتائج',
    titleEn: 'Score Keeper App Design',
    category: 'general',
    vaultFolder: 'General & Uncategorized/تصميم تطبيق لتسجيل النتائج',
    description: 'تطبيق مبسط لتسجيل نتائج الألعاب الرياضية وألعاب الطاولة بدون تعقيد.',
    status: 'completed',
    progressPercent: 90,
    priority: 'low',
    currentFocus: 'مدمج ومتاح كأداة سريعة',
    nextMilestone: 'تثبيت الأداء',
    objectives: [
      { id: 'obj-sk-1', title: 'أزرار سريعة للإضافة والطرح مع سجل الجولات', completed: true },
    ],
    steps: [
      { id: 'step-sk-1', title: 'بناء النموذج الأولي واختباره', status: 'completed' },
    ],
    techDebt: [],
    risks: [],
    failureModes: [],
    decisions: [],
    files: [
      { name: 'task.md', type: 'task', relativePath: 'General & Uncategorized/تصميم تطبيق لتسجيل النتائج/task.md' },
    ],
    healthIndex: 94,
    lastAuditDate: '2026-09-22',
  },

  // --------------------------------------------------------------------------
  // 16. دليل احتراف الدروب شوبينج (Dropshipping Pro Guide)
  // --------------------------------------------------------------------------
  {
    id: 'proj-dropshipping',
    slug: 'general-dropshipping-guide',
    titleAr: 'دليل احتراف الدروب شوبينج',
    titleEn: 'Dropshipping Mastery Playbook',
    category: 'general',
    vaultFolder: 'General & Uncategorized/دليل احتراف الدروب شوبينج',
    description: 'دليل مرجعي تفصيلي لاختيار المنتجات الرابحة، إعداد المتاجر، وإدارة الحملات الإعلانية الممولة.',
    status: 'completed',
    progressPercent: 100,
    priority: 'medium',
    currentFocus: 'مرجع جاهز للاستخدام في مشاريع التجارة الإلكترونية',
    nextMilestone: 'تحديث استراتيجيات TikTok Ads لعام 2026',
    objectives: [
      { id: 'obj-ds-1', title: 'توثيق معايير اختيار المنتج الرابح وهوامش الربح فوق 60%', completed: true },
      { id: 'obj-ds-2', title: 'صياغة استراتيجية اختبار الإعلانات بأقل ميزانية ممكنة', completed: true },
    ],
    steps: [
      { id: 'step-ds-1', title: 'كتابة الفصول الخمسة للدليل وتدعيمها بأمثلة عملية', status: 'completed' },
    ],
    techDebt: [],
    risks: [],
    failureModes: [],
    decisions: [],
    files: [
      { name: 'task.md', type: 'task', relativePath: 'General & Uncategorized/دليل احتراف الدروب شوبينج/task.md' },
    ],
    healthIndex: 100,
    lastAuditDate: '2026-08-30',
  },

  // --------------------------------------------------------------------------
  // 17. تحليل الإمكانيات والخدمات المتاحة
  // --------------------------------------------------------------------------
  {
    id: 'proj-capabilities',
    slug: 'general-capabilities-analysis',
    titleAr: 'تحليل الإمكانيات والخدمات المتاحة',
    titleEn: 'Capabilities & Technical Services Audit',
    category: 'general',
    vaultFolder: 'General & Uncategorized/تحليل الإمكانيات والخدمات المتاحة',
    description: 'خارطة المهارات والخدمات البرمجية والتقنية التي يستطيع القائد تقديمها للعملاء والشركات.',
    status: 'completed',
    progressPercent: 100,
    priority: 'medium',
    currentFocus: 'تحديث مصفوفة المهارات في Dossier القائد',
    nextMilestone: 'مرجع مستمر للمشاريع والصفقات',
    objectives: [
      { id: 'obj-cap-1', title: 'حصر الخدمات التقنية ذات العائد المرتفع', completed: true },
    ],
    steps: [
      { id: 'step-cap-1', title: 'تصنيف الخدمات بين تطوير ويب، أنظمة ذكاء، وهندسة شبكات', status: 'completed' },
    ],
    techDebt: [],
    risks: [],
    failureModes: [],
    decisions: [],
    files: [
      { name: 'task.md', type: 'task', relativePath: 'General & Uncategorized/تحليل الإمكانيات والخدمات المتاحة/task.md' },
    ],
    healthIndex: 100,
    lastAuditDate: '2026-09-05',
  },

  // --------------------------------------------------------------------------
  // 18. مشاركة محتوى المتصفح حالياً (Browser Live Sharing)
  // --------------------------------------------------------------------------
  {
    id: 'proj-browser-share',
    slug: 'general-browser-content-share',
    titleAr: 'مشاركة محتوى المتصفح حالياً',
    titleEn: 'Browser Live Content Sharing',
    category: 'general',
    vaultFolder: 'General & Uncategorized/مشاركة محتوى المتصفح حالياً',
    description: 'أداة تتيح إرسال الروابط والمقاطع والأبحاث المفتوحة في المتصفح فورياً إلى بنك الاستخبارات في عقلية.',
    status: 'completed',
    progressPercent: 95,
    priority: 'high',
    currentFocus: 'ربطها بنظام مشاركة أندرويد و Quick Capture',
    nextMilestone: 'دعم التقاط الصور مع النصوص تلقائياً',
    objectives: [
      { id: 'obj-brs-1', title: 'التقاط رابط الصفحة وعنوانها وتلخيصها تلقائياً بالذكاء', completed: true },
    ],
    steps: [
      { id: 'step-brs-1', title: 'بناء وسيط المشاركة Android Share Intent', status: 'completed' },
    ],
    techDebt: [],
    risks: [],
    failureModes: [],
    decisions: [],
    files: [
      { name: 'task.md', type: 'task', relativePath: 'General & Uncategorized/مشاركة محتوى المتصفح حالياً/task.md' },
    ],
    healthIndex: 96,
    lastAuditDate: '2026-11-06',
  },

  // --------------------------------------------------------------------------
  // 19. محادثة_tempmedi (Tempmedi Media Archive)
  // --------------------------------------------------------------------------
  {
    id: 'proj-tempmedi',
    slug: 'general-tempmedi-chat',
    titleAr: 'محادثة_tempmedi (أرشيف الوسائط والملاحظات السريعة)',
    titleEn: 'Tempmedi Media Archive & Rapid Notes',
    category: 'general',
    vaultFolder: 'General & Uncategorized/محادثة_tempmedi',
    description: 'مستودع الملاحظات الصوتية والصور الملتقطة على عجل والملفات المؤقتة قبل فرزها وأرشفتها.',
    status: 'active',
    progressPercent: 80,
    priority: 'low',
    currentFocus: 'فرز الملفات الجديدة وتوجيهها للمشاريع المناسبة عبر الوكيل Scout',
    nextMilestone: 'تفريغ المستودع المؤقت أسبوعياً تلقائياً',
    objectives: [
      { id: 'obj-tmp-1', title: 'استقبال كل ما يتم حفظه سريعاً وتصنيفه لاحقاً', completed: true },
    ],
    steps: [
      { id: 'step-tmp-1', title: 'فحص الملفات غير المصنفة وربطها بالمشاريع الكبرى', status: 'in_progress' },
    ],
    techDebt: [],
    risks: [],
    failureModes: [],
    decisions: [],
    files: [
      { name: 'task.md', type: 'task', relativePath: 'General & Uncategorized/محادثة_tempmedi/task.md' },
    ],
    healthIndex: 88,
    lastAuditDate: '2026-11-02',
  },
];
