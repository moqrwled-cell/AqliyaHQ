# AQLIYA HQ (Moha Agent) — AI Context & System Guide 🤖⚡

> **الغرض من الملف:** هذا المستند مخصص للذكاء الاصطناعي (AI Prompt / Context) ليفهم بنية التطبيق، ما تم إنجازه بالضبط، خريطة الملفات، وطريقة التعديل بدون تعقيد. (محدث للمرحلة 1: تنظيف النظام وتأمين التخزين).

---

## 1. ملخص المشروع السريع (Quick Summary)
* **اسم التطبيق:** عقلية HQ (AqliyaHQ / Moha Agent).
* **طبيعة النظام:** نظام تشغيل شخصي ذكي بأسلوب Jarvis (Personal Life & Tactical OS) يجمع بين إدارة الأولويات، الأهداف الديناميكية، الاستخبارات ومشاركة المحتوى، وتكامل جوجل الرسمي.
* **المنصات:**
  * تطبيق أندرويد أصيل (Capacitor 8 APK) — الأولوية الأولى.
  * تطبيق سطح مكتب (Electron 45) — بعد اكتمال الجوال.
  * منصة ويب سحابية (React 19 + Vite 8 + Tailwind 4).
* **المستخدم والمالك:** القائد **محمد قرمان (Mohammad Qrman)** — غزة، فلسطين.

---

## 2. أهداف القائد الحاكمة (Dynamic User Goals — NOT Hardcoded!)
* تم نقل جميع الأهداف من نصوص ثابتة بالكود إلى محرك **`UnifiedStorage.getGoals()`** بحيث تعدلها أنت أو المستشار، ويبني عليها التطبيق أولوياته ديناميكياً:
  1. **الجانب المهني والتجاري:** مشروع **NexusOS** (إدارة مكاتب المحاماة والعقود). الهدف: إغلاق أول 3 صفقات عملاء.
  2. **الجانب البدني والصحي:** تمارين الكاليسثنكس، استهلاك **3000 سعرة حرارية يومياً**، والوصول لوزن **70 كجم**.
  3. **الجانب الأكاديمي:** متابعة تكليفات واختبارات الكلية عبر تكامل جوجل الرسمي.
  4. **الجانب الاستثماري العائلي:** تطوير وإدارة قهوة روما ومتابعة الديون والنسخ الاحتياطي.

---

## 3. حزمة التقنيات (Tech Stack)
* **Frontend:** React 19, TypeScript, Tailwind CSS 4, Lucide React, Glisse UI.
* **Storage & Backup (v2.0):** `UnifiedStorage` (Offline-first, 1-Click Full JSON Export/Import, Supabase Cloud Realtime).
* **Mobile & Hardware:** Capacitor 8.6, Android SDK 35/36, Java 21.
* **Desktop:** Electron 45, Electron Builder.
* **AI Engine:** Google Gemini 3.5 & 2.5 Flash (Function Calling Tools Schema).
* **Skills Tools:** `npx skills` (Vercel Agent Skills / Google Workspace CLI Skills).
* **Local Phone Engine:** Python 3 + YT-DLP + FFmpeg (على تطبيق Termux بمنفذ `127.0.0.1:8765`).

---

## 4. سجل إنجازات المراحل (Phased Execution Log)

### ✅ المرحلة 0: تقرير التدقيق الفني الشامل (Completed)
* فحص المشروع بالكامل وتحديد: (35% شغال فعلاً، 40% وهمي/Canned، 25% مكسور/مشتت).
* اعتماد خطة التحول الـ 8 مراحل لنظام Jarvis.

### ✅ المرحلة 1: تنظيف المشروع وإصلاح التخزين والنسخ الاحتياطي (Completed)
1. **محرك التخزين والنسخ الاحتياطي الشامل (`UnifiedStorage.ts`):**
   * دعم الأهداف الديناميكية (Dynamic Goals)، المهام، الاستخبارات، النوم، والعادات.
   * زر تصدير كامل بنقرة واحدة (Full Backup JSON) باسم `AqliyaHQ_Backup_YYYY-MM-DD.json`.
   * زر استيراد كامل بنقرة واحدة (Full Restore JSON) مع أخذ لقطة أمان تلقائية (Auto Snapshot) قبل الاستبدال لمنع أي ضياع للبيانات.
2. **تأمين الخصوصية والمفاتيح:**
   * إزالة مفتاح Gemini API المكشوف كـ Base64 من كود `src/lib/gemini.ts`.
   * حفظ المفاتيح حصرياً في التخزين المحلي الآمن لجهاز المستخدم.
3. **إلغاء شاشة القفل المعيقة برقم PIN (`SecurityLock`):**
   * فتح التطبيق فورياً دون تعطيل المستخدم.
4. **تبسيط نظام التحديثات:**
   * حذف محرك البث السحابي الوهمي والاستبدال بنافذة فحص وتنزيل مباشرة لآخر APK رسمي من GitHub Releases.

---

## 5. خريطة الملفات الجوهرية (Clean Architecture Directory)

| المسار | الوظيفة |
|---|---|
| `src/lib/storage/unifiedStorage.ts` | محرك التخزين المركزي، إدارة الأهداف الديناميكية، والتصدير/الاستيراد الشامل |
| `src/components/SettingsModal.tsx` | نافذة الإعدادات، مفتاح Gemini الآمن، وأزرار النسخ الاحتياطي والاستعادة |
| `src/lib/updater/systemUpdaterEngine.ts` | فحص تحديثات GitHub Releases الرسمية وتحميل الـ APK المباشر |
| `src/components/mobile/OfficialUpdaterModal.tsx` | نافذة التحديث النظيفة بضغطة زر واحدة |
| `src/lib/gemini.ts` | تهيئة وتوصيل نموذج Google Gemini الآمن بدون مفاتيح مكشوفة |
| `scripts/moha-ytdlp-daemon.py` | خادم بايثون المحلي على منفذ 8765 لتشغيل YT-DLP على أندرويد (اختياري) |
| `android/app/src/main/java/com/aqliya/hq/MainActivity.java` | الجسر الأصيل لأندرويد والتقاط المشاركة المباشرة `ACTION_SEND` |
| `.github/workflows/build-apk.yml` | خط أنابيب البناء السحابي التلقائي وإصدار الـ APK |

---

## 6. الخطوة التالية (Next: Phase 2)
* **المرحلة 2:** إعادة تصميم الواجهة والشاشة الرئيسية لتكون هادئة وبسيطة وتجيب بنظرة واحدة:
  1. *ماذا يجب أن أفعل الآن؟*
  2. *ما الأهم اليوم؟*
  3. *ما الذي يحتاج انتباهي؟*
  مع تنقل سفلي بسيط من 4 أقسام فقط وبار المستشار المتاح من كل مكان.
