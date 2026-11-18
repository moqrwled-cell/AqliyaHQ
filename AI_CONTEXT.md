# AQLIYA HQ (Moha Agent) — AI Context & System Guide 🤖⚡

> **الغرض من الملف:** هذا المستند مخصص للذكاء الاصطناعي (AI Prompt / Context) ليفهم بنية التطبيق، ما تم إنجازه بالضبط، خريطة الملفات، وطريقة التعديل بدون تعقيد. (محدث بالكامل لكافة المراحل من 0 إلى 8: نظام التشغيل الشخصي التكتيكي الكامل بأسلوب Jarvis).

---

## 1. ملخص المشروع السريع (Quick Summary)
* **اسم التطبيق:** عقلية HQ (AqliyaHQ / Moha Agent).
* **طبيعة النظام:** نظام تشغيل شخصي ذكي تكتيكي بأسلوب Jarvis (Personal Life & Tactical OS) يجمع بين إدارة الأولويات، الأهداف الديناميكية، الاستخبارات ومشاركة المحتوى الفورية، وتكامل جوجل الرسمي، والتنفيذ الفعلي بالذكاء الاصطناعي.
* **المنصات:**
  * تطبيق أندرويد أصيل (Capacitor 8.6 APK) — الأولوية الأولى ومجهز بالكامل.
  * تطبيق سطح مكتب (Electron 45) — مهيأ بالكامل ومبني.
  * منصة ويب سحابية (React 19 + Vite 8 + Tailwind 4).
* **المستخدم والمالك:** القائد **محمد قرمان (Mohammad Qrman)** — غزة، فلسطين.

---

## 2. أهداف القائد الحاكمة (Dynamic User Goals — NOT Hardcoded!)
* جميع الأهداف مخزنة ومعدّلة ديناميكياً عبر محرك **`UnifiedStorage.getGoals()`** وتستطيع أنت أو المستشار تعديلها ويبني عليها التطبيق أولوياته:
  1. **الجانب المهني والتجاري:** مشروع **NexusOS** (إدارة مكاتب المحاماة والعقود). الهدف: إغلاق أول 3 صفقات عملاء.
  2. **الجانب البدني والصحي:** تمارين الكاليسثنكس، استهلاك **3000 سعرة حرارية يومياً**، والوصول لوزن **70 كجم**.
  3. **الجانب الأكاديمي:** متابعة تكليفات واختبارات الكلية عبر تكامل جوجل الرسمي (Classroom + Calendar).
  4. **الجانب الاستثماري العائلي:** تطوير وإدارة قهوة روما ومتابعة الديون والنسخ الاحتياطي.

---

## 3. حزمة التقنيات (Tech Stack)
* **Frontend:** React 19, TypeScript, Tailwind CSS 4, Lucide React, Glisse UI.
* **Storage & Backup (v2.0):** `UnifiedStorage` (Offline-first, 1-Click Full JSON Export/Import, Supabase Cloud Realtime).
* **Mobile & Hardware:** Capacitor 8.6, Android SDK 35/36, Java 21.
* **Desktop:** Electron 45, Electron Builder.
* **AI Engine & Tools:** Google Gemini REST API with Official Function Calling Schemas (`AdvisorToolsEngine`).
* **Google Workspace:** Official Google OAuth 2.0, Calendar v3, Gmail v1, Classroom v1, Tasks v1 (`GoogleWorkspaceService`).
* **Content Extraction:** oEmbed (YouTube, TikTok, Instagram, Web) + Gemini Fallback (Termux YT-DLP optional).
* **Proactive Nudge:** Background Ongoing Lockscreen Notification + Morning/Evening SITREP Nudges (`AdvisorProactiveEngine`).
* **Voice Integration:** Full-Duplex Arabic Web Speech STT & SpeechSynthesis with Live Gemini AI Execution.

---

## 4. خريطة الملفات الجوهرية (Clean Architecture Directory)

| المسار | الوظيفة |
|---|---|
| `src/lib/storage/unifiedStorage.ts` | محرك التخزين المركزي، إدارة الأهداف الديناميكية، والتصدير/الاستيراد الشامل |
| `src/components/home/FocusedJarvisHomeScreen.tsx` | الشاشة الرئيسية الهادئة التي تجيب عن الأسئلة الـ 3 وجلسات التركيز 25 دقيقة |
| `src/components/navigation/UnifiedBottomNav.tsx` | شريط التنقل السفلي الفاخر الموحد (4 أقسام رئيسية + زر المستشار المركزي الطافي) |
| `src/components/tasks/TasksAndGoalsScreen.tsx` | شاشة إدارة المهام بمصفوفة أيزنهاور الرباعية وإدارة الأهداف الديناميكية بالكامل |
| `src/lib/advisor/advisorToolsEngine.ts` | محرك استدعاء الأدوات الحقيقي، التنفيذ ثم الإخبار، سجل العمليات، التراجع الفوري، وبوابة التأكيد الحساسة |
| `src/lib/advisor/advisorProactiveEngine.ts` | محرك المبادرة التلقائية، إحاطة الصباح ومساء الاستشفاء، وتحديث إشعار شاشة القفل الدائم |
| `src/lib/google/googleWorkspaceService.ts` | محرك ربط جوجل الرسمي (OAuth 2.0, Calendar, Classroom, Gmail, Tasks) |
| `src/components/google/GoogleWorkspaceHubModal.tsx` | نافذة مركز تكامل جوجل الرسمي وحالة الاتصال والبيانات الحقيقية |
| `src/components/CommanderAIPanel.tsx` | واجهة المستشار الذكي الكاملة مع بطاقات التراجع، التأكيد، وبنك الذاكرة طويلة المدى |
| `src/components/HandsFreeVoiceCall.tsx` | المكالمة الصوتية المباشرة مع المستشار بالصوت العربي الطبيعي وتنفيذ الأوامر الفعلي |
| `src/components/QuickCaptureModal.tsx` | الحفظ بلمسة واحدة بدون أسئلة والتصنيف والتلخيص بالخلفية لروابط وتطبيقات المشاركة |
| `src/components/SettingsModal.tsx` | نافذة الإعدادات، مفتاح Gemini الآمن، وأزرار النسخ الاحتياطي والاستعادة |
| `src/lib/updater/systemUpdaterEngine.ts` | فحص تحديثات GitHub Releases الرسمية وتحميل الـ APK المباشر |
| `electron-main.cjs` | ملف تشغيل بيئة سطح المكتب Electron مع نافذة مخصصة خالية من الأخطاء |
| `android/app/src/main/java/com/aqliya/hq/MainActivity.java` | الجسر الأصيل لأندرويد والتقاط المشاركة المباشرة `ACTION_SEND` |
| `.github/workflows/build-apk.yml` | خط أنابيب البناء السحابي التلقائي وإصدار الـ APK |

---

## 5. سجل الإنجاز الكامل للمراحل (Complete Execution Log: Phases 0 -> 8)

### ✅ المرحلة 0: تقرير التدقيق الفني الشامل
* فحص المشروع وتحديد الأجزاء الحقيقية والوهمية واعتماد خطة الـ 8 مراحل.

### ✅ المرحلة 1: تنظيف المشروع والتخزين الآمن والنسخ الاحتياطي
* تأسيس `UnifiedStorage` وتأمين مفتاح Gemini وإلغاء القفل المعيق وتحديث التنزيل الرسمي للـ APK.

### ✅ المرحلة 2: الشاشة الرئيسية المركزة والتنقل الموحد
* تصميم `FocusedJarvisHomeScreen` التي تجيب على الأسئلة الـ 3 مع شريط تنقل 4 أقسام وزر المستشار الطافي في كل مكان.

### ✅ المرحلة 3: المستشار الذكي (الأدوات الحقيقية، الذاكرة، والتراجع)
* بناء `AdvisorToolsEngine` مع مخططات أدوات رسمية لـ Gemini Function Calling.
* مبدأ "التنفيذ ثم الإخبار" مع زر تراجع فوري (Undo) لكل عملية وبوابة تأكيد للعمليات الحساسة.
* إضافة بنك الذاكرة طويلة المدى وعرض وتعديل ما يعرفه المستشار.

### ✅ المرحلة 4: تكامل Google الحقيقي الرسمي
* بناء `GoogleWorkspaceService` وتوصيل تقويم جوجل وجيميل وكلاس روم والمهام عبر واجهات Google REST APIs الرسمية مع عرض حالة الاتصال الشفافة.

### ✅ المرحلة 5: المشاركة ورادار المحتوى بأسلوب الحفظ الذكي الفوري
* تحديث `QuickCaptureModal` لحفظ المحتوى بلمسة واحدة أو تلقائياً خلال 4 ثوانٍ مع المعالجة بالخلفية بدون أسئلة معقدة وحفظ دائم مزدوج في `UnifiedStorage`.

### ✅ المرحلة 6: شاشة القفل الفعلية والمبادرات والتنبيهات
* تفعيل إشعار أندرويد الدائم `ongoing: true` لعرض أولويات القائد على شاشة القفل الفعلية.
* إطلاق `AdvisorProactiveEngine` للملخص الصباحي ومراجعة المساء وتذكيرات السعرات والاستشفاء.

### ✅ المرحلة 7: الصوت التفاعلي المباشر
* ترقية `HandsFreeVoiceCall` للاتصال المباشر بذكاء المستشار باللغة العربية وتحويل الصوت إلى نص وتنفيذ الأوامر ونطق الردود صوتياً.

### ✅ المرحلة 8: نسخة الكمبيوتر (Electron Packaging)
* ضبط إعدادات `electron-main.cjs` و `package.json` لتشغيل وبناء نسخة سطح المكتب للويندوز بسلاسة.
