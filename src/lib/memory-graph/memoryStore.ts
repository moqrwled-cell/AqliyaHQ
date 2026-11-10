// ============================================================================
// AQLIYA PERSISTENT MEMORY STORE — 7 SPECIALIZED MEMORY LAYERS
// ============================================================================

import type { 
  MemoryLayer, 
  AnyMemoryEntry, 
  IdentityMemoryEntry, 
  GoalMemoryEntry, 
  ProjectMemoryEntry, 
  DecisionMemoryEntry, 
  ExperienceMemoryEntry, 
  OperationalMemoryEntry, 
  KnowledgeMemoryEntry,
  DuplicateDetectionResult,
  ConflictDetectionResult,
  MemorySearchResult
} from './types';
import { offlineStorage } from '../supabase';

export class PersistentMemoryStore {
  private static STORAGE_KEY = 'memories_7layers_v1';
  private static stores: Record<MemoryLayer, AnyMemoryEntry[]> = {
    identity: [],
    goals: [],
    projects: [],
    decisions: [],
    experience: [],
    operational: [],
    knowledge: [],
  };

  private static isInitialized = false;

  /**
   * تهيئة الذاكرة وتحميلها من التخزين المحلي مع بيانات التأسيس الحقيقية
   */
  public static initialize(): void {
    if (PersistentMemoryStore.isInitialized) return;

    try {
      const saved = offlineStorage.get<Record<MemoryLayer, AnyMemoryEntry[]> | null>(
        PersistentMemoryStore.STORAGE_KEY,
        null
      );

      if (saved && typeof saved === 'object' && saved.projects && saved.projects.length > 0) {
        PersistentMemoryStore.stores = saved;
      } else {
        // تحميل البيانات الحقيقية التأسيسية لمنظومة القائد محمد
        PersistentMemoryStore.loadFoundationalBaseline();
        PersistentMemoryStore.persist();
      }
    } catch (e) {
      console.warn('MemoryStore initialization fallback to baseline', e);
      PersistentMemoryStore.loadFoundationalBaseline();
    }

    PersistentMemoryStore.isInitialized = true;
  }

  /**
   * تحميل البيانات الحقيقية الشاملة لكافة المشاريع والقرارات والأخطاء والدروس
   */
  private static loadFoundationalBaseline(): void {
    const now = new Date().toISOString();

    // 1. Identity Memory (الهوية والمبادئ وساعات الذروة)
    const identityEntries: IdentityMemoryEntry[] = [
      {
        id: 'id-mem-1',
        layer: 'identity',
        aspect: 'profile',
        title: 'الملف القيادي للقائد محمد قرمان',
        content: 'محمد قرمان من قطاع غزة، فلسطين. مهندس نظم برمجية وريادي، متخصص في معمارية الوكلاء الذاتية، وتطوير الأنظمة الكاملة، والقيادة التقنية تحت الأزمات.',
        tags: ['profile', 'identity', 'commander', 'gaza'],
        importance: 10,
        confidenceScore: 1.0,
        provenance: 'interview_discovery',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'id-mem-2',
        layer: 'identity',
        aspect: 'peak_hours',
        title: 'ساعات ذروة التركيز والصفاء الذهني',
        content: 'أوقات أعلى إنتاجية وإبداع هندسي للقائد هي من بعد صلاة الفجر مباشرة وحتى الساعة 10:00 صباحاً. في هذه الساعات يجب تركيز المهام الصعبة والتصميم المعماري.',
        tags: ['peak_hours', 'routine', 'energy', 'focus'],
        importance: 9,
        confidenceScore: 1.0,
        provenance: 'interview_discovery',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'id-mem-3',
        layer: 'identity',
        aspect: 'non_negotiable_principle',
        title: 'المبدأ القيادي الصارم: العمل الملموس فوق التنظير',
        content: 'لا مساومة على الإنجاز العملي الملموس. لا نعتمد على واجهات شكلية أو أرقام وهمية؛ كل ميزة يجب أن تمتلك محركاً حقيقياً وموثوقاً يمكن التحقق منه.',
        tags: ['principle', 'decision', 'integrity'],
        importance: 10,
        confidenceScore: 1.0,
        provenance: 'interview_discovery',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'id-mem-4',
        layer: 'identity',
        aspect: 'constraint',
        title: 'تحويل ظروف غزة الصعبة إلى دافع للتفوق',
        content: 'الظروف القاسية وانقطاع الكهرباء والإنترنت في غزة تُعامل كمعيار هندسي صارم: يجب أن تكون كافة الأنظمة مصممة لتعمل بدون اتصال أولاً (Offline-First) وبأقصى كفاءة استهلاك.',
        tags: ['offline_first', 'gaza', 'resilience'],
        importance: 10,
        confidenceScore: 1.0,
        provenance: 'interview_discovery',
        createdAt: now,
        updatedAt: now,
      },
    ];

    // 2. Project Memory (تفاصيل المشاريع وخطواتها وأخطائها)
    const projectEntries: ProjectMemoryEntry[] = [
      {
        id: 'proj-mem-nexus',
        layer: 'projects',
        code: 'NEXUS-CORE',
        category: 'core_os',
        title: 'نظام عقلية ونواة NexusOS المركزية',
        content: 'نظام تشغيل تكتيكي شخصي متكامل يدير أسطول وكلاء أذكياء، ويربط مشاريع القائد عبر واجهة أبل الزجاجية، ويعمل دون اتصال أولاً مع مزامنة سحابية هجينة.',
        tags: ['os', 'nexus', 'agents', 'ai', 'architecture'],
        importance: 10,
        provenance: 'code_audit',
        progressPercent: 80,
        currentFocus: 'تفعيل الذاكرة السباعية والـ Knowledge Graph وتوجيه القرارات',
        nextOps: 'ربط محرك التنسيق المستقل بين الوكلاء وأتمتة المزامنة',
        techStack: ['React 19', 'TypeScript', 'Vite', 'Tailwind CSS v4', 'Electron', 'Capacitor Android', 'Supabase'],
        assignedAgent: 'chief_of_staff',
        obsidianFiles: ['NexusOS_Architecture.md', 'AgentSwarm_Specs.md', 'Task_DAG_Design.md'],
        knownErrorsAndTechDebt: [
          'رفض فحص أسرار GitHub (GH013) للمفاتيح الصريحة -> تم الحل بتشفير Base64 والمزامنة عبر GitHub Secrets',
          'انهيار GPU في Electron على بعض كروت الشاشة -> تم الحل بتعطيل التسريع العتادي app.disableHardwareAcceleration()',
          'استدعاء import.meta.env في بيئة Node.js و tsx -> تم الحل بإضافة Optional Chaining',
        ],
        steps: [
          {
            stepNumber: 1,
            title: 'تأسيس المعمارية الأساسية للواجهة والأنماط',
            description: 'بناء واجهات React 19 بتصميم Apple Liquid Glass ودمج خط عقيق الملكي وكتم الأصوات المزعجة.',
            status: 'completed',
            requiredTech: ['Tailwind CSS v4', 'Aqeeq Fonts'],
            deliverable: 'واجهة زجاجية فاخرة تعمل على الويب والويندوز والأندرويد بنجاح',
          },
          {
            stepNumber: 2,
            title: 'بناء العقل المركزي ومسار المراحل الثمانية',
            description: 'فصل التفكير عن مجرد النصوص وبناء دورة حياة (فهم، جلب سياق، تخطيط، فحص صلاحيات، تكليف، تنفيذ، تحقق، تقرير).',
            status: 'completed',
            requiredTech: ['IntelligenceCoreEngine', 'IntentClassifier', 'ContextRetriever'],
            deliverable: 'اجتياز حزمة الاختبارات الآلية للأوامر العشرة باللغة العربية بنسبة 100%',
          },
          {
            stepNumber: 3,
            title: 'بناء الذاكرة السباعية ورسم المعرفة (Knowledge Graph)',
            description: 'فصل طبقات الذاكرة الـ 7 وبناء شبكة العقد والروابط بين المستخدم والمشاريع والأهداف والقرارات والأخطاء.',
            status: 'current',
            requiredTech: ['PersistentMemoryStore', 'KnowledgeGraphEngine'],
            deliverable: 'محرك ذاكرة واسترجاع سياقي دقيق وكشف للتعارضات والتكرار',
          },
          {
            stepNumber: 4,
            title: 'تنسيق الوكلاء المستقلين ومحرك الأدوات الفعلي',
            description: 'بناء موزع المهام، سجل الوكلاء، وتمكين التعديل والبحث الحقيقي في ملفات أوبسيديان ومشاريع الكود.',
            status: 'pending',
            requiredTech: ['TaskDispatcher', 'ToolExecutionEngine', 'HITL'],
            deliverable: 'أسطول وكلاء ينفذ المهام ويقترح التعديلات بأمان تام',
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'proj-mem-roma',
        layer: 'projects',
        code: 'ROMA-SYS',
        category: 'business_cafe',
        title: 'موقع إدارة كفي روما (Roma Cafe)',
        content: 'نظام متكامل وخفيف لإدارة الطاولات، تسجيل نتائج ألعاب الورق، وقوائم المشروبات والفواتير السريعة لكوفي شوب روما.',
        tags: ['business', 'roma', 'cafe', 'pos', 'tables'],
        importance: 9,
        provenance: 'obsidian_sync',
        progressPercent: 85,
        currentFocus: 'اختبار واجهة الطاولات وقائمة المشروبات وضبط التخزين المحلي',
        nextOps: 'ربط قاعدة البيانات المحلية للطلبات اليومية وحسابات الورق السريعة',
        techStack: ['HTML5', 'Tailwind CSS', 'JavaScript', 'IndexedDB / LocalStorage'],
        assignedAgent: 'systems_dev',
        obsidianFiles: ['Roma_Cafe_Plan.md', 'Table_Scoring_Specs.md', 'Drinks_Menu_Catalog.md'],
        knownErrorsAndTechDebt: [
          'خطأ في فقدان نقاط الجولة عند تحديث الصفحة المفاجئ -> تم حله بالتخزين الفوري في LocalStorage مع كل ضغطة',
          'بطء تحميل أيقونات المشروبات على الهواتف الضعيفة -> تم حله بتحويل الأيقونات إلى SVG خفيفة ومدمجة',
        ],
        steps: [
          {
            stepNumber: 1,
            title: 'تصميم واجهة الطاولات وتسجيل النتائج',
            description: 'بناء واجهة سريعة وبديهية لتسجيل نقاط ألعاب الورق وحساب الفائز بنقرة واحدة.',
            status: 'completed',
            deliverable: 'لوحة تفاعلية لإدارة 12 طاولة في آن واحد',
          },
          {
            stepNumber: 2,
            title: 'نظام الطلبات وقائمة المشروبات والفواتير',
            description: 'تصميم قائمة مشروبات مقسمة (ساخنة، باردة، إضافات) مع حساب إجمالي الفاتورة لحظياً.',
            status: 'completed',
            deliverable: 'كتالوج المشروبات وحاسبة الفواتير الفورية',
          },
          {
            stepNumber: 3,
            title: 'حزمة التشغيل المحلية (Offline Ready Package)',
            description: 'تجهيز نسخة خفيفة تعمل مباشرة على أجهزة التابلت والكمبيوتر داخل الكافيه دون اشتراط إنترنت.',
            status: 'current',
            deliverable: 'ملف تشغيل مباشر مع مزامنة احتياطية يومية',
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'proj-mem-geo',
        layer: 'projects',
        code: 'GEO-ACAD',
        category: 'academics_geo',
        title: 'تنسيق وترتيب محاضرات الجغرافيا ومكتبة الخرائط (45 خريطة)',
        content: 'الأرشيف الأكاديمي الشامل لمحاضرات الجغرافيا الإقليمية ومقرر جغرافيا العالم الجديد مع فهرس عالي الدقة لـ 45 خريطة وبطاقات تلخيص.',
        tags: ['study', 'geography', 'maps', 'academics'],
        importance: 8,
        provenance: 'obsidian_sync',
        progressPercent: 90,
        currentFocus: 'فهرسة الخرائط وتوليد بطاقات المراجعة الذكية للامتحانات',
        nextOps: 'ربط بطاقات المراجعة بالمستشار التكتيكي لاختبار المعلومات الجغرافية',
        techStack: ['Obsidian Markdown', 'GIS Map Archive', 'Python Exporter'],
        assignedAgent: 'intel_scout',
        obsidianFiles: ['New_World_Geography.md', 'Regional_Lectures_1_to_5.md', 'Maps_Catalog_45.md'],
        knownErrorsAndTechDebt: [
          'مشكلة تشفير cp1256 عند طباعة أسماء الخرائط العربية في موجه الأوامر -> تم حلها بـ sys.stdout.reconfigure(encoding="utf-8")',
        ],
        steps: [
          {
            stepNumber: 1,
            title: 'تفريغ وتنسيق المحاضرات الإقليمية 1 إلى 10',
            description: 'إعادة صياغة المحاضرات وتنسيق العناوين والمفاهيم الجغرافية بأسلوب أكاديمي منظم.',
            status: 'completed',
            deliverable: 'وثائق ماركدون كاملة للمحاضرات الإقليمية',
          },
          {
            stepNumber: 2,
            title: 'فهرسة وتصنيف مكتبة الـ 45 خريطة جغرافية',
            description: 'ترتيب الخرائط حسب الأقاليم (تضاريس، مناخ، سكان، موارد) وتسميتها بدقة.',
            status: 'completed',
            deliverable: 'فهرس رقمي تفاعلي لـ 45 خريطة عالية الدقة',
          },
          {
            stepNumber: 3,
            title: 'دمج الأرشيف في مستعرض مشاريع عقلية وأوبسيديان',
            description: 'ربط الخرائط بـ ProjectsVaultBrowser لعرضها بنقاء وسرعة فائقة.',
            status: 'completed',
            deliverable: 'استعراض فوري داخل تطبيق عقلية ومستودع أوبسيديان',
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'proj-mem-life',
        layer: 'projects',
        code: 'LIFE-OPS',
        category: 'productivity_life',
        title: 'تطبيق تنظيم الحياة والروتين (To Top Life Ops)',
        content: 'نظام إدارة الحياة، والروتين اليومي، وتتبع العادات وساعات التركيز وحماية القائد من الإرهاق وتشتت الانتباه.',
        tags: ['life', 'habits', 'routine', 'energy', 'productivity'],
        importance: 9,
        provenance: 'interview_discovery',
        progressPercent: 75,
        currentFocus: 'ربط إحاطة الصباح والمساء بمسار إنجاز المشاريع الفعلي',
        nextOps: 'تفعيل التنبيه الذكي لمعدلات الطاقة وساعات النوم',
        techStack: ['React 19', 'Local-First Storage', 'Web Audio / Speech'],
        assignedAgent: 'life_ops',
        obsidianFiles: ['Life_Ops_Habits.md', 'Energy_Rhythm_Guide.md'],
        knownErrorsAndTechDebt: [
          'تراكم المهام غير المكتملة دون مراجعة -> تم حله بإدخال جلسة Debrief المسائية التلقائية',
        ],
        steps: [
          {
            stepNumber: 1,
            title: 'بناء لوحة العادات وسجل الطاقة اليومي',
            description: 'تتبع ثلاث حالات طاقة (عالية، متوازنة، منخفضة) وربطها بساعات الإنجاز.',
            status: 'completed',
            deliverable: 'نافذة SITREPBriefingModal لإحاطة الصباح والمساء',
          },
          {
            stepNumber: 2,
            title: 'استكشاف شخصية القائد وتوثيق المبادئ',
            description: 'جلسات استجواب تفصيلية في 7 محاور حياتية لتعميق فهم المنظومة للقائد.',
            status: 'completed',
            deliverable: 'تبويب استكشاف الذات داخل MindVaultPanel',
          },
        ],
        createdAt: now,
        updatedAt: now,
      },
    ];

    // 3. Decision Memory (القرارات وأسبابها والمبادئ المستندة عليها)
    const decisionEntries: DecisionMemoryEntry[] = [
      {
        id: 'dec-mem-1',
        layer: 'decisions',
        title: 'التحول من الطابع العسكري/السيبراني إلى تصميم أبل الزجاجي الفاخر',
        content: 'استبدال طابع العمليات العسكرية والشاشات السيبرانية المعتمة بواجهة Apple Liquid Glass الهادئة باللونين الكحلي والزمردي وخط عقيق.',
        context: 'واجهة العمليات السابقة كانت تسبب إجهاداً بصرياً وتشتتاً وتفتقر للراحة والعملية التنفيذية.',
        chosenOption: 'اعتماد تصميم أبل الزجاجي (خامات شفافة blur 28px، كحلي عميق، زمردي، وخط عقيق)',
        rejectedAlternatives: [
          'الإبقاء على طابع HUD السيبراني مع تخفيف التوهج',
          'استخدام واجهة كلاسيكية مسطحة بدون تأثيرات زجاجية',
        ],
        rationale: 'توفير بيئة عمل تنفيذية راقية ومريحة للعين لساعات العمل الطويلة، وتجريد النظام من المصطلحات المعقدة غير الضرورية.',
        decisionPrinciplesApplied: ['الراحة والعملية فوق الاستعراض البصري', 'الفخامة الهادئة'],
        associatedProjectId: 'proj-mem-nexus',
        outcome: 'تحسن هائل في تجربة الاستخدام، واجهة محترمة ومريحة تليق بالقائد وتسهل الإنجاز السريع.',
        tags: ['ui', 'design', 'apple_glass', 'decision'],
        importance: 10,
        provenance: 'user_direct',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'dec-mem-2',
        layer: 'decisions',
        title: 'تثبيت رمز الدخول الماستر على 2005 ودعم البصمة الحيوية',
        content: 'تغيير الرمز الافتراضي القديم (1337) إلى الرمز الرسمي (2005) وتفعيل مستشعر البصمة الحيوي على الهاتف.',
        context: 'حاجة القائد لدخول سريع وفوري وآمن دون إدخال رموز معقدة في كل مرة.',
        chosenOption: 'رمز 2005 القيادي + بصمة الإصبع/الوجه المباشرة بنقرة واحدة',
        rejectedAlternatives: ['استخدام كلمة مرور طويلة ومعقدة', 'الدخول بدون قفل أمان'],
        rationale: 'موازنة مثالية بين الأمان القوي وسرعة الوصول اللحظية لغرفة العمليات.',
        decisionPrinciplesApplied: ['السهولة والأمان المترابطان'],
        outcome: 'دخول فوري خلال أقل من ثانية واحدة بالبصمة أو الرمز.',
        tags: ['security', 'pin_2005', 'biometrics', 'decision'],
        importance: 10,
        provenance: 'user_direct',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'dec-mem-3',
        layer: 'decisions',
        title: 'كتم وإلغاء كافة الأصوات المزعجة والتنبيهات الحادة نهائياً',
        content: 'إلغاء أصوات النبضات، الصفارات، والصفير السيبراني من النظام والاعتماد على التجربة الهادئة.',
        context: 'أصوات النقرات والتنبيهات التكتيكية كانت تسبب إزعاجاً مستمراً أثناء العمل والتركيز.',
        chosenOption: 'تحويل محرك الصوت إلى MutedAudioEngine وحصر الصوت فقط في المكالمة الصوتية الهادئة',
        rejectedAlternatives: ['إضافة زر كتم مؤقت', 'تخفيض مستوى الصوت'],
        rationale: 'احترام بيئة التركيز العميق للقائد ومنع أي تشتيت صوتي.',
        decisionPrinciplesApplied: ['حماية هدوء وتركيز القائد'],
        outcome: 'تجربة استخدام صامتة وراقية وفاخرة بنسبة 100%.',
        tags: ['audio', 'silence', 'focus', 'decision'],
        importance: 9,
        provenance: 'user_direct',
        createdAt: now,
        updatedAt: now,
      },
    ];

    // 4. Experience Memory (الأخطاء التقنية والدروس المستفادة والقواعد الوقائية)
    const experienceEntries: ExperienceMemoryEntry[] = [
      {
        id: 'exp-mem-1',
        layer: 'experience',
        title: 'خطأ حظر مفاتيح API في GitHub Push Protection (GH013)',
        content: 'رفض خادم GitHub رفع الكود لاكتشافه مفتاح API تجريبي صريح في الكود المصدري.',
        errorType: 'security_flaw',
        rootCause: 'وضع مفتاح API كنص صريح (Plaintext) داخل كود العميل.',
        resolution: 'تشفير المفتاح الاحتياطي بـ Base64 واستخدام متغيرات البيئة و GitHub Secrets للمفاتيح الإنتاجية.',
        preventiveRule: 'ممنوع منعاً باتاً كتابة أي مفتاح سري أو كلمة مرور كنص صريح في الكود. دائماً استخدم التشفير أو التخزين الآمن.',
        associatedProjectId: 'proj-mem-nexus',
        tags: ['security', 'github', 'secrets', 'api_key', 'lesson'],
        importance: 10,
        provenance: 'code_audit',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'exp-mem-2',
        layer: 'experience',
        title: 'خطأ شاشة Electron السوداء على كروت الشاشة في الويندوز',
        content: 'ظهور شاشة سوداء أو شفافة عند تشغيل تطبيق Electron على بعض أجهزة الويندوز.',
        errorType: 'architectural_pitfall',
        rootCause: 'تعارض التسريع العتادي (Hardware Acceleration) لمتصفح Chromium مع تعريفات بطاقة العرض في بيئة الويندوز.',
        resolution: 'استدعاء app.disableHardwareAcceleration() في بداية electron-main.cjs قبل تهيئة أي نافذة.',
        preventiveRule: 'تعطيل التسريع العتادي دائماً في تطبيقات سطح المكتب الموجهة للأنظمة المتنوعة لضمان استقرار العرض بنسبة 100%.',
        associatedProjectId: 'proj-mem-nexus',
        tags: ['electron', 'gpu', 'windows', 'bug_fix', 'lesson'],
        importance: 9,
        provenance: 'code_audit',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'exp-mem-3',
        layer: 'experience',
        title: 'خطأ تشفير cp1256 في موجه أوامر الويندوز مع النصوص العربية',
        content: 'انهيار سكريبتات بايثون عند طباعة أسماء الملفات أو التقارير التي تحتوي على حروف عربية أو إيموجي.',
        errorType: 'bug_failure',
        rootCause: 'الترميز الافتراضي لموجه أوامر ويندوز (Windows CMD / PowerShell) هو cp1256 بدلاً من UTF-8.',
        resolution: 'إضافة sys.stdout.reconfigure(encoding="utf-8") في السطور الأولى لأي سكريبت بايثون.',
        preventiveRule: 'إلزام كافة سكريبتات وأدوات النظام بضبط مخرجات المحطة الطرفية إلى ترميز UTF-8 صراحة.',
        associatedProjectId: 'proj-mem-geo',
        tags: ['python', 'unicode', 'utf8', 'terminal', 'lesson'],
        importance: 8,
        provenance: 'code_audit',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'exp-mem-4',
        layer: 'experience',
        title: 'خطأ انهيار import.meta.env في بيئة Node.js / CLI',
        content: 'انهيار أدوات الاختبار و TypeScript عند استدعاء ملفات تستخدم import.meta.env خارج خادم Vite.',
        errorType: 'architectural_pitfall',
        rootCause: 'كائن import.meta.env خاص بـ Vite ولا يتوفر بشكل افتراضي في بيئة تشغيل Node.js العادية.',
        resolution: 'استخدام Optional Chaining وفحص النطاق: (typeof import.meta !== "undefined" && import.meta.env?.KEY) || process.env?.KEY.',
        preventiveRule: 'كتابة شفرات المكتبات المشتركة بحيث تكون متوافقة بيئياً (Environment-Agnostic) مع كل من المتصفح و Node.js.',
        associatedProjectId: 'proj-mem-nexus',
        tags: ['vite', 'node', 'typescript', 'architecture', 'lesson'],
        importance: 9,
        provenance: 'code_audit',
        createdAt: now,
        updatedAt: now,
      },
    ];

    // 5. Goal Memory (الأهداف الاستراتيجية وخطط المستقبل)
    const goalEntries: GoalMemoryEntry[] = [
      {
        id: 'goal-mem-1',
        layer: 'goals',
        title: 'إطلاق الإصدار الإنتاجي المستقر من عقلية ونواة NexusOS',
        content: 'اكتمال المراحل الـ 11 لخارطة التطوير، وامتلاك نظام تشغيل وكلاء ذاتي مستقل بالكامل يعمل على لابتوب وهاتف القائد.',
        horizon: 'short_term_week',
        status: 'in_progress',
        successMetric: 'تشغيل كافة الوكلاء، الذاكرة السباعية، محرك الأدوات، ورادار الفرص بنجاح 100%',
        associatedProjectIds: ['proj-mem-nexus'],
        tags: ['nexus', 'agentic_os', 'production', 'goal'],
        importance: 10,
        provenance: 'user_direct',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'goal-mem-2',
        layer: 'goals',
        title: 'تشغيل نظام كفي روما في بيئة العمل الحقيقية',
        content: 'تثبيت حزمة كفي روما على أجهزة الكافيه وبدء تسجيل النقاط والطلبات اليومية واستخراج تقارير الإيرادات.',
        horizon: 'medium_term_month',
        status: 'active',
        successMetric: 'استقرار النظام دون أخطاء لمدة 30 يوماً متواصلة من الاستخدام الميداني',
        associatedProjectIds: ['proj-mem-roma'],
        tags: ['roma', 'cafe', 'business', 'goal'],
        importance: 9,
        provenance: 'user_direct',
        createdAt: now,
        updatedAt: now,
      },
    ];

    // 6. Knowledge Memory (المعرفة والمصادر ووثائق أوبسيديان)
    const knowledgeEntries: KnowledgeMemoryEntry[] = [
      {
        id: 'know-mem-1',
        layer: 'knowledge',
        title: 'معمارية الـ DAG لإدارة مهام الوكلاء الأذكياء (Directed Acyclic Graph)',
        content: 'نموذج لتفكيك المهام الكبيرة إلى عقد مترابطة بأسهم تبعية، يضمن عدم تشغيل المهمة حتى تكتمل جميع المهام المسبقة الاعتماد عليها.',
        knowledgeType: 'architecture_pattern',
        keyTakeaways: [
          'يمنع التضارب بين الوكلاء',
          'يسمح بتشغيل المهام المستقلة بالتوازي',
          'يسهل تتبع نقطة الفشل بدقة',
        ],
        associatedProjectId: 'proj-mem-nexus',
        obsidianVaultPath: 'E:\\Antigravity_Vault\\Projects\\Operating Systems & AI\\عقلية\\Task_DAG_Design.md',
        tags: ['dag', 'architecture', 'agents', 'ai'],
        importance: 9,
        provenance: 'obsidian_sync',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'know-mem-2',
        layer: 'knowledge',
        title: 'مكتبة الخرائط الأكاديمية الـ 45 وقواعد التحليل الجغرافي',
        content: 'دليل تصنيف الخرائط الإقليمية (الموقع الفلكي، خطوط الطول والعرض، حركات الصفائح، والتوزيع الديمغرافي).',
        knowledgeType: 'academic_lecture',
        keyTakeaways: [
          'الربط بين تضاريس الأقاليم والتوزيع السكاني',
          '45 خريطة مرقمة بدقة عالية في مستودع أوبسيديان',
        ],
        associatedProjectId: 'proj-mem-geo',
        obsidianVaultPath: 'E:\\Antigravity_Vault\\Projects\\Academics & Geography\\جغرافيا\\Maps_Catalog_45.md',
        tags: ['geography', 'maps', 'academics'],
        importance: 8,
        provenance: 'obsidian_sync',
        createdAt: now,
        updatedAt: now,
      },
    ];

    // 7. Operational Memory (سجلات التنفيذ والمعارك)
    const operationalEntries: OperationalMemoryEntry[] = [
      {
        id: 'ops-mem-1',
        layer: 'operational',
        title: 'اكتمال بناء واجهة Apple Liquid Glass وتعميم خط عقيق',
        content: 'تم بنجاح تحديث واجهات النظام بالكامل وحذف كافة الأصوات المزعجة وتثبيت الرمز 2005.',
        entryType: 'battle_log',
        associatedProjectId: 'proj-mem-nexus',
        energyLevel: 'high',
        tags: ['redesign', 'apple_glass', 'milestone'],
        importance: 9,
        provenance: 'agent_inference',
        createdAt: now,
        updatedAt: now,
      },
    ];

    PersistentMemoryStore.stores = {
      identity: identityEntries,
      projects: projectEntries,
      decisions: decisionEntries,
      experience: experienceEntries,
      goals: goalEntries,
      knowledge: knowledgeEntries,
      operational: operationalEntries,
    };
  }

  /**
   * حفظ حالة الذاكرة الحالية في التخزين المحلي
   */
  public static persist(): void {
    try {
      offlineStorage.save(PersistentMemoryStore.STORAGE_KEY, PersistentMemoryStore.stores);
    } catch (e) {
      console.warn('Failed to persist memory stores locally', e);
    }
  }

  /**
   * جلب كافة السجلات لطبقة محددة
   */
  public static getEntries<T extends AnyMemoryEntry>(layer: MemoryLayer): T[] {
    PersistentMemoryStore.initialize();
    return (PersistentMemoryStore.stores[layer] || []) as T[];
  }

  /**
   * جلب سجل بواسطة معرفه
   */
  public static getEntryById(id: string): AnyMemoryEntry | null {
    PersistentMemoryStore.initialize();
    for (const layer of Object.keys(PersistentMemoryStore.stores) as MemoryLayer[]) {
      const found = PersistentMemoryStore.stores[layer].find((e) => e.id === id);
      if (found) return found;
    }
    return null;
  }

  /**
   * إضافة سجل جديد إلى الذاكرة مع فحص التكرار التلقائي
   */
  public static addEntry(layer: MemoryLayer, entry: Omit<AnyMemoryEntry, 'id' | 'createdAt' | 'updatedAt'>): { success: boolean; entry?: AnyMemoryEntry; duplicateWarning?: string } {
    PersistentMemoryStore.initialize();

    const newId = `${layer}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const fullEntry: AnyMemoryEntry = {
      ...entry,
      id: newId,
      createdAt: now,
      updatedAt: now,
    } as AnyMemoryEntry;

    // فحص التكرار (Duplicate Detection)
    const dupCheck = PersistentMemoryStore.detectDuplicates(fullEntry);
    if (dupCheck.isDuplicate) {
      return {
        success: false,
        duplicateWarning: dupCheck.message,
        entry: dupCheck.existingEntry,
      };
    }

    PersistentMemoryStore.stores[layer].unshift(fullEntry);
    PersistentMemoryStore.persist();

    return { success: true, entry: fullEntry };
  }

  /**
   * تحديث سجل في الذاكرة
   */
  public static updateEntry(layer: MemoryLayer, id: string, patch: Partial<AnyMemoryEntry>): boolean {
    PersistentMemoryStore.initialize();
    const list = PersistentMemoryStore.stores[layer];
    const index = list.findIndex((e) => e.id === id);

    if (index === -1) return false;

    list[index] = {
      ...list[index],
      ...patch,
      updatedAt: new Date().toISOString(),
    } as AnyMemoryEntry;

    PersistentMemoryStore.persist();
    return true;
  }

  /**
   * حذف سجل من الذاكرة (يشترط تأكيد القائد صراحة)
   */
  public static deleteEntry(layer: MemoryLayer, id: string, userConfirmed: boolean): { success: boolean; error?: string } {
    if (!userConfirmed) {
      return { success: false, error: 'حذف الذاكرة يتطلب تفويضاً صريحاً ومؤكداً من القائد محمد' };
    }

    PersistentMemoryStore.initialize();
    const list = PersistentMemoryStore.stores[layer];
    const initialLen = list.length;
    PersistentMemoryStore.stores[layer] = list.filter((e) => e.id !== id);

    if (PersistentMemoryStore.stores[layer].length < initialLen) {
      PersistentMemoryStore.persist();
      return { success: true };
    }

    return { success: false, error: 'لم يتم العثور على السجل لحذفه' };
  }

  /**
   * بحث سياقي موجه في طبقات محددة
   */
  public static search(params: {
    query: string;
    layers?: MemoryLayer[];
    minImportance?: number;
    projectId?: string;
  }): MemorySearchResult[] {
    PersistentMemoryStore.initialize();
    const { query, layers, minImportance = 1, projectId } = params;
    const lowerQuery = query.toLowerCase().trim();
    const targetLayers = layers && layers.length > 0 ? layers : (Object.keys(PersistentMemoryStore.stores) as MemoryLayer[]);
    const queryTokens = lowerQuery.split(/\s+/).filter((t) => t.length > 2);

    const results: MemorySearchResult[] = [];

    for (const layer of targetLayers) {
      const entries = PersistentMemoryStore.stores[layer];

      for (const entry of entries) {
        if (entry.importance < minImportance) continue;

        // تصفية حسب المشروع إذا طُلب
        if (projectId && 'associatedProjectId' in entry && entry.associatedProjectId && entry.associatedProjectId !== projectId) {
          continue;
        }

        let score = 0;
        let matchedField: MemorySearchResult['matchedField'] = 'content';

        const lowerTitle = entry.title.toLowerCase();
        const lowerContent = entry.content.toLowerCase();
        const lowerTags = entry.tags.map((t) => t.toLowerCase()).join(' ');

        // تطابق كامل في العنوان
        if (lowerTitle.includes(lowerQuery)) {
          score += 10;
          matchedField = 'title';
        } else if (lowerContent.includes(lowerQuery)) {
          score += 6;
          matchedField = 'content';
        } else if (lowerTags.includes(lowerQuery)) {
          score += 5;
          matchedField = 'tags';
        } else {
          // تطابق جزئي بالكلمات
          for (const token of queryTokens) {
            if (lowerTitle.includes(token)) score += 3;
            if (lowerContent.includes(token)) score += 2;
            if (lowerTags.includes(token)) score += 1.5;
          }
        }

        if (score > 0) {
          results.push({
            entry,
            matchScore: score,
            matchedField,
          });
        }
      }
    }

    return results.sort((a, b) => b.matchScore - a.matchScore);
  }

  /**
   * دالة ميسرة للبحث المباشر عن الذكريات
   */
  public static searchMemories(query: string, layer?: MemoryLayer): MemorySearchResult[] {
    return PersistentMemoryStore.search({
      query,
      layers: layer ? [layer] : undefined,
    });
  }

  /**
   * كشف التكرار (Duplicate Detection Engine)
   */
  public static detectDuplicates(entry: AnyMemoryEntry): DuplicateDetectionResult {
    const list = PersistentMemoryStore.stores[entry.layer];
    const lowerContent = entry.content.toLowerCase().trim();

    for (const existing of list) {
      if (existing.id === entry.id) continue;

      const existingLower = existing.content.toLowerCase().trim();

      // تطابق حرفي
      if (existingLower === lowerContent) {
        return {
          isDuplicate: true,
          similarityScore: 1.0,
          existingEntry: existing,
          message: `تطابق تام مع ذاكرة مسجلة سابقاً: [${existing.title}]`,
        };
      }

      // تشابه في العنوان والمحتوى بنسبة عالية
      if (existing.title.toLowerCase() === entry.title.toLowerCase()) {
        return {
          isDuplicate: true,
          similarityScore: 0.9,
          existingEntry: existing,
          message: `يوجد سجل مطابق في العنوان: [${existing.title}]`,
        };
      }
    }

    return { isDuplicate: false, similarityScore: 0.0, message: 'لا يوجد تكرار' };
  }

  /**
   * كشف التعارضات (Conflict Detection Engine)
   */
  public static detectConflicts(entry: AnyMemoryEntry): ConflictDetectionResult {
    // فحص تعارض المبادئ والقيود المعمارية
    if (entry.layer === 'identity') {
      const identityEntries = PersistentMemoryStore.getEntries<IdentityMemoryEntry>('identity');

      for (const p of identityEntries) {
        // تعارض العمل بدون اتصال مقابل الإلزام السحابي
        const pIsOffline = p.content.includes('بدون اتصال') || p.content.includes('Offline-First');
        const entryIsCloudOnly = entry.content.includes('سحابي فقط') || entry.content.includes('سحابية فقط') || entry.content.includes('إلزام سحابي');
        
        if (pIsOffline && entryIsCloudOnly) {
          return {
            hasConflict: true,
            conflictingEntry: p,
            reason: `تعارض معماري مباشر: المبدأ المعتمد يشترط [${p.title}] بينما الذاكرة المدخلة تنص على الإلزام السحابي.`,
          };
        }

        // تعارض العمل الملموس مقابل الواجهات الشكلية
        const pIsConcrete = p.content.includes('العمل الملموس') || p.content.includes('لا نعتمد على واجهات شكلية');
        const entryIsFake = entry.content.includes('واجهة شكلية') || entry.content.includes('بيانات وهمية');
        if (pIsConcrete && entryIsFake) {
          return {
            hasConflict: true,
            conflictingEntry: p,
            reason: `تعارض قيادي صارم: المبدأ المعتمد يحظر الواجهات الشكلية والبيانات غير الحقيقية.`,
          };
        }
      }
    }

    return { hasConflict: false, reason: 'لا توجد تعارضات مرصودة' };
  }

  /**
   * إحصائيات الطبقات السبع
   */
  public static getStats(): Record<MemoryLayer, number> {
    PersistentMemoryStore.initialize();
    return {
      identity: PersistentMemoryStore.stores.identity.length,
      goals: PersistentMemoryStore.stores.goals.length,
      projects: PersistentMemoryStore.stores.projects.length,
      decisions: PersistentMemoryStore.stores.decisions.length,
      experience: PersistentMemoryStore.stores.experience.length,
      operational: PersistentMemoryStore.stores.operational.length,
      knowledge: PersistentMemoryStore.stores.knowledge.length,
    };
  }
}
