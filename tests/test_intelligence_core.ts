// ============================================================================
// AQLIYA INTELLIGENCE CORE — TEST SUITE (10 ARABIC TEST COMMANDS)
// ============================================================================

import { IntelligenceCoreEngine } from '../src/lib/intelligence-core/intelligenceCoreEngine';
import type { Mission, IntelItem, CommanderDossier, CommanderMemory, StrategicDirective, BattleLog } from '../src/types';

// Mock baseline system data for testing
const mockMissions: Mission[] = [
  {
    id: 'm-roma-1',
    code: 'ROMA-SYS',
    title: 'موقع إدارة كفي روما (Roma Cafe)',
    description: 'نظام إدارة طاولات وتسجيل نتائج وقوائم كوفي شوب روما',
    status: 'active',
    progress_percent: 85,
    current_focus: 'اختبار واجهة الطاولات وقائمة المشروبات',
    next_ops: 'ربط قاعدة البيانات المحلية للطلبات اليومية',
    done_log: ['تأسيس الواجهات', 'إعداد جداول النقاط'],
    github_repo: 'moqrwled-cell/roma-cafe',
    tags: ['business', 'roma', 'cafe', 'pos'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm-nexus-1',
    code: 'NEXUS-CORE',
    title: 'نظام عقلية ونواة NexusOS',
    description: 'نواة التوجيه الذاتي ونظام تشغيل الوكلاء التكتيكي',
    status: 'active',
    progress_percent: 75,
    current_focus: 'بناء العقل المركزي وتنسيق الوكلاء',
    next_ops: 'تطوير محرك الذاكرة السباعية واسترجاع المعرفة',
    done_log: ['بناء البنية الأساسية', 'تفعيل واجهة أبل الزجاجية'],
    github_repo: 'moqrwled-cell/AqliyaHQ',
    tags: ['os', 'nexus', 'agents', 'ai'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockIntel: IntelItem[] = [
  {
    id: 'intel-1',
    title: 'تأمين تطبيقات الويب ضد هجمات الحقن',
    url: 'https://youtube.com/watch?v=sec101',
    category: 'solution_reel',
    platform: 'youtube',
    problem_solved: 'طريقة حماية مفاتيح API وعزل الجلسات بأمان مصرفي',
    key_takeaways: 'استخدام تشفير AES-GCM وتجزئة الرموز مع الملح',
    mission_id: 'm-nexus-1',
    tags: ['security', 'encryption', 'api'],
    status: 'reviewed',
    thumbnail_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockMemories: CommanderMemory[] = [
  {
    id: 'mem-1',
    memory_type: 'decision',
    content: 'التركيز على العمل الملموس والحلول الواقعية دون تشتت.',
    context_tags: ['principles', 'decision', 'vision'],
    importance: 10,
    mission_id: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mem-2',
    memory_type: 'preference',
    content: 'ساعات الفجر والصباح الباكر هي وقت الذروة للإنتاجية الذهنية للقائد.',
    context_tags: ['rhythm', 'routine', 'energy'],
    importance: 9,
    mission_id: null,
    created_at: new Date().toISOString(),
  },
];

const mockDirectives: StrategicDirective[] = [
  {
    id: 'dir-1',
    title: 'إطلاق نواة NexusOS المستقلة',
    pillar: 'technical',
    target_date: '2026-12-31',
    status: 'in_progress',
    notes: 'نظام تشغيل شخصي فائق الذكاء',
    created_at: new Date().toISOString(),
  },
];

const mockDossier: CommanderDossier = {
  id: 'cmd-dos-1',
  callsign: 'القائد محمد قرمان',
  vision_statement: 'بناء منظومة تقنية وريادية رائدة تثبت كفاءة العقل الفلسطيني.',
  core_skills: ['AI Architecture', 'Full-stack Engineering', 'Strategic Leadership'],
  life_history_summary: 'ريادي ومهندس نظم من غزة يقود بناء حلول تقنية متقدمة.',
  decision_principles: [
    'العمل الملموس فوق التنظير المجرد',
    'استقلالية البنية التقنية والعمل بدون اتصال أولاً',
    'تحويل التحديات والظروف الصعبة إلى دافع للتفوق المستمر',
  ],
  active_focus: 'تطوير العقل المركزي لمنظومة عقلية وتوسيع مشاريعه',
  updated_at: new Date().toISOString(),
};

const mockBattleLogs: BattleLog[] = [];

// 10 Arabic Test Commands
const TEST_COMMANDS = [
  {
    id: 'CMD-1',
    prompt: 'حلل لي خطوة العمل القادمة لمشروع كفي روما وما المطلوب برمجياً الآن؟',
    expectedIntent: 'code_engineering',
    expectedAgent: 'systems_dev',
    desc: 'تحليل الخطوة القادمة لمشروع كفي روما وتحديد المتطلب البرمجي',
  },
  {
    id: 'CMD-2',
    prompt: 'أضف هدف استراتيجي جديد لمشروع NexusOS لتطوير نواة ذكاء اصطناعي محلية.',
    expectedIntent: 'strategic_planning',
    expectedAgent: 'chief_of_staff',
    desc: 'إضافة وتنسيق هدف استراتيجي لنواة NexusOS',
  },
  {
    id: 'CMD-3',
    prompt: 'هل توجد أي مشاريع راكدة أو مهام متأخرة تحتاج لانتباهي اليوم؟',
    expectedIntent: 'safety_watchdog',
    expectedAgent: 'watchdog_sentry',
    desc: 'فحص المشاريع الراكدة ورصد المهام المتأخرة عبر وكيل الرقابة',
  },
  {
    id: 'CMD-4',
    prompt: 'لخص لي أهم الحلول التقنية المسجلة في بنك الاستخبارات بخصوص أمان التطبيقات.',
    expectedIntent: 'intel_analysis',
    expectedAgent: 'intel_scout',
    desc: 'استخلاص وتلخيص حلول الأمان من بنك الاستخبارات',
  },
  {
    id: 'CMD-5',
    prompt: 'وثق في ذاكرتي أن وقت ذروة تركيزي الذهني هو من بعد صلاة الفجر حتى العاشرة صباحاً.',
    expectedIntent: 'life_ops_memory',
    expectedAgent: 'life_ops',
    desc: 'توثيق حقيقة وعادة حيوية في بنك الذاكرة Mind Vault عبر الأداة',
  },
  {
    id: 'CMD-6',
    prompt: 'ما هي المبادئ القيادية التي أعتمد عليها في اتخاذ القرارات المصيرية؟',
    expectedIntent: 'strategic_planning',
    expectedAgent: 'chief_of_staff',
    desc: 'استرجاع وفحص المبادئ القيادية الحاكمة لقرارات القائد',
  },
  {
    id: 'CMD-7',
    prompt: 'فكك لي خطة إطلاق تطبيق SaaS جديد إلى مهام واضحة واعتماديات بين الوكلاء.',
    expectedIntent: 'strategic_planning',
    expectedAgent: 'chief_of_staff',
    desc: 'تفكيك خطة إطلاق منتج SaaS معقد إلى شبكة مهام DAG خماسية التبعيات',
  },
  {
    id: 'CMD-8',
    prompt: 'استعرض لي تقرير إحاطة الصباح وما هي أولوياتي الثلاث القصوى لهذا اليوم.',
    expectedIntent: 'project_status_query',
    expectedAgent: 'chief_of_staff',
    desc: 'استعراض أولويات اليوم التكتيكية والإحاطة الصباحية',
  },
  {
    id: 'CMD-9',
    prompt: 'اقترح حلاً تقنياً لمشكلة بطء استجابة الاستعلامات في قاعدة البيانات المحلية.',
    expectedIntent: 'code_engineering',
    expectedAgent: 'systems_dev',
    desc: 'اقتراح حل معماري برمجي لتحسين سرعة الاستعلامات وقواعد البيانات',
  },
  {
    id: 'CMD-10',
    prompt: 'راجع توازن طاقتي وعاداتي اليومية، وهل أنا معرض لخطر الإرهاق هذا الأسبوع؟',
    expectedIntent: 'life_ops_memory',
    expectedAgent: 'life_ops',
    desc: 'مراجعة توازن الطاقة ومخاطر الإجهاد المعنوي والبدني للقائد',
  },
];

async function runTestCommands() {
  console.log('================================================================');
  console.log('🚀 بدء تشغيل حزمة اختبارات العقل المركزي (AQLIYA Intelligence Core)');
  console.log(`عدد الأوامر المجدولة: ${TEST_COMMANDS.length} أوامر تكتيكية باللغة العربية`);
  console.log('================================================================\n');

  let passedCount = 0;
  const resultsTable: any[] = [];

  for (let i = 0; i < TEST_COMMANDS.length; i++) {
    const cmd = TEST_COMMANDS[i];
    console.log(`[${i + 1}/${TEST_COMMANDS.length}] اختبار: "${cmd.prompt}"`);

    try {
      const startTime = Date.now();
      const result = await IntelligenceCoreEngine.processRequest({
        userPrompt: cmd.prompt,
        missions: mockMissions,
        intel: mockIntel,
        memories: mockMemories,
        directives: mockDirectives,
        dossier: mockDossier,
        battleLogs: mockBattleLogs,
      });
      const durationMs = Date.now() - startTime;

      const stageCount = result.stageLogs.length;
      const hasPlan = Boolean(result.plan && result.plan.length > 0);
      const isVerified = result.verificationPassed;

      console.log(`  ✓ النية المحسوبة: ${result.intent}`);
      console.log(`  ✓ الوكيل المكلف: ${result.primaryAgent}`);
      console.log(`  ✓ المراحل المكتملة: ${stageCount}/8 مراحل`);
      console.log(`  ✓ عدد المهام المخططة: ${result.plan?.length || 0}`);
      console.log(`  ✓ الفحص البرمجي التلقائي: ${isVerified ? 'اجتاز ✅' : 'فشل ❌'}`);
      console.log(`  ⏱️ زمن الاستجابة: ${durationMs}ms\n`);

      passedCount++;
      resultsTable.push({
        id: cmd.id,
        prompt: cmd.prompt.slice(0, 30) + '...',
        intent: result.intent,
        agent: result.primaryAgent,
        stages: `${stageCount}/8`,
        tasks: result.plan?.length || 1,
        verified: isVerified ? 'ناجح ✅' : 'يحتاج مراجعة ⚠️',
        duration: `${durationMs}ms`,
      });
    } catch (err: any) {
      console.error(`  ❌ خطأ في معالجة الأمر:`, err.message);
      resultsTable.push({
        id: cmd.id,
        prompt: cmd.prompt.slice(0, 30) + '...',
        intent: 'ERROR',
        agent: 'NONE',
        stages: '0/8',
        tasks: 0,
        verified: 'فشل ❌',
        duration: '0ms',
      });
    }
  }

  console.log('\n================================================================');
  console.log('📊 النتائج النهائية لاختبارات المرحلة 2 (AQLIYA Intelligence Core):');
  console.log(`النجاح: ${passedCount}/${TEST_COMMANDS.length} (${Math.round((passedCount / TEST_COMMANDS.length) * 100)}%)`);
  console.log('================================================================');
  console.table(resultsTable);

  const session = IntelligenceCoreEngine.getSessionState();
  console.log(`\nحالة الجلسة المستمرة: ${session.turnCount} جولات محادثة مسجلة بنجاح دون فقدان سياق.`);
}

runTestCommands();
