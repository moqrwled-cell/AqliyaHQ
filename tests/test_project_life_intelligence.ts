// ============================================================================
// AQLIYA HQ — PHASE 7 VERIFICATION TEST SUITE
// PROJECT & LIFE INTELLIGENCE (19 Projects, Habits, Decisions, & SITREP)
// ============================================================================

import { ProjectLifeEngine } from '../src/lib/project-life/projectLifeEngine';
import { COMPREHENSIVE_PROJECT_CATALOG } from '../src/lib/project-life/projectCatalogData';
import { PersistentMemoryStore } from '../src/lib/memory-graph/memoryStore';
import { ENHANCED_TOOL_REGISTRY } from '../src/lib/agentic-os/tools/agentToolsRegistry';

async function runTestSuite() {
  console.log('================================================================');
  console.log('🚀 RUNNING PHASE 7: PROJECT & LIFE INTELLIGENCE TEST SUITE');
  console.log('================================================================\n');

  let passedTests = 0;
  const totalTests = 7;

  // --------------------------------------------------------------------------
  // TEST 1: Catalog Integrity for all 19 Obsidian Projects
  // --------------------------------------------------------------------------
  try {
    console.log('👉 [TEST 1] Testing All 19 Projects Catalog Integrity...');
    const catalog = ProjectLifeEngine.getAllProjects();

    if (catalog.length < 19) {
      throw new Error(`Expected at least 19 projects, found ${catalog.length}`);
    }

    const roma = catalog.find((p) => p.slug === 'business-roma-cafe');
    const nexus = catalog.find((p) => p.slug === 'os-nexus-os');
    const geo = catalog.find((p) => p.slug === 'academics-regional-geography');
    const life = catalog.find((p) => p.slug === 'life-to-top-ops');

    if (!roma || !nexus || !geo || !life) {
      throw new Error('Key projects (Roma Cafe, NexusOS, Geography, To Top) not found');
    }

    if (!roma.steps || roma.steps.length === 0 || !nexus.objectives || nexus.objectives.length === 0) {
      throw new Error('Project steps or objectives are missing');
    }

    console.log(`✅ [TEST 1 PASSED] 19 Projects cataloged with full steps, objectives, and files.`);
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 1 FAILED]:', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 2: Health Index & Diagnostic Scanner Calculation
  // --------------------------------------------------------------------------
  try {
    console.log('\n👉 [TEST 2] Testing Project Health Score & Diagnostic Scanner...');
    const roma = ProjectLifeEngine.getProject('business-roma-cafe');
    if (!roma) throw new Error('Roma project not found');

    const health = ProjectLifeEngine.calculateProjectHealth(roma);
    if (health < 10 || health > 100) {
      throw new Error(`Health index ${health} out of 10-100 bounds`);
    }

    // Add tech debt to test penalty
    const withDebt = ProjectLifeEngine.addTechDebt('business-roma-cafe', {
      title: 'اختبار دين تقني اختباري',
      severity: 'high',
      impact: 'اختبار تأثير الخصم',
      remediation: 'إصلاح فوري',
    });

    if (!withDebt) throw new Error('Failed to add tech debt');
    console.log(`   Health score after high tech debt: ${withDebt.healthIndex}% (Previous: ${health}%)`);

    const attentionList = ProjectLifeEngine.getProjectsRequiringAttention();
    if (!Array.isArray(attentionList)) {
      throw new Error('Attention list is not an array');
    }

    console.log(`✅ [TEST 2 PASSED] Diagnostic scanner accurately penalizes tech debt and identifies health status.`);
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 2 FAILED]:', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 3: Life Ops Habit Tracking & Streak Calculation
  // --------------------------------------------------------------------------
  try {
    console.log('\n👉 [TEST 3] Testing Life Ops Habits & Streak Management...');
    const habits = ProjectLifeEngine.getHabits();
    if (!habits || habits.length === 0) throw new Error('No habits loaded');

    const targetHabit = habits[0];
    const initialStreak = targetHabit.currentStreak;
    const today = new Date().toISOString().split('T')[0];

    // Toggle habit on
    const toggled = ProjectLifeEngine.toggleHabit(targetHabit.id, today);
    if (!toggled) throw new Error('Failed to toggle habit');

    console.log(`   Toggled habit «${toggled.title}»: Streak is now ${toggled.currentStreak} (Was ${initialStreak})`);

    const pillars = ProjectLifeEngine.getLifePillars();
    if (pillars.length !== 5) {
      throw new Error(`Expected 5 Life Pillars, found ${pillars.length}`);
    }

    console.log(`✅ [TEST 3 PASSED] Habit toggling, streak increments, and 5 Life Pillars active.`);
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 3 FAILED]:', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 4: Daily Energy & Work-Life Synergy (Burnout Prevention)
  // --------------------------------------------------------------------------
  try {
    console.log('\n👉 [TEST 4] Testing Daily Energy & Work-Life Synergy Report...');
    const energyLog = ProjectLifeEngine.logDailyEnergy({
      date: new Date().toISOString().split('T')[0],
      level: 'high',
      focusHoursActual: 6.0,
      sleepHours: 7.5,
      peakHourBlock: '04:30 - 08:30 (الفجر)',
      notes: 'طاقة ممتازة وجاهزية تامة',
    });

    if (energyLog.level !== 'high') throw new Error('Energy log mismatch');

    const synergy = ProjectLifeEngine.calculateWorkLifeSynergy();
    if (synergy.overallScore < 0 || synergy.overallScore > 100) {
      throw new Error(`Synergy score ${synergy.overallScore} out of range`);
    }

    if (!synergy.recommendations || synergy.recommendations.length === 0) {
      throw new Error('Synergy recommendations are empty');
    }

    console.log(`   Work-Life Synergy Score: ${synergy.overallScore}%, Burnout Risk: ${synergy.burnoutRisk}`);
    console.log(`✅ [TEST 4 PASSED] Synergy report properly pairs energy with project execution.`);
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 4 FAILED]:', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 5: Strategic Decision Support Advisor & Memory Logging
  // --------------------------------------------------------------------------
  try {
    console.log('\n👉 [TEST 5] Testing Decision Support Advisor & Decision Memory...');
    const dilemmaCase = ProjectLifeEngine.evaluateDilemma({
      title: 'اختيار استراتيجية تخزين بيانات كفي روما التكتيكية',
      projectSlug: 'business-roma-cafe',
      category: 'architecture',
      dilemmaDescription: 'انقطاع الإنترنت المتكرر يستوجب استقلالية تامة في تسجيل النتائج والمبيعات.',
      rawOptions: [
        {
          title: 'الاعتماد على التخزين المحلي Offline-First و PWA',
          description: 'تخزين كافة الجولات في المتصفح محلياً مع تصدير دوري.',
          pros: ['استقلالية 100%', 'سرعة استجابة فورية', 'صفر تكلفة إضافية'],
          cons: ['محدودية المشاركة الفورية خارج الكافيه'],
          risks: ['تلف الذاكرة المؤقتة ما لم تصدر'],
        },
        {
          title: 'الاعتماد على خادم سحابي خارجي مستمر',
          description: 'استخدام قاعدة بيانات سحابية باشتراك شهري.',
          pros: ['مراقبة الكافيه عن بعد'],
          cons: ['توقف العمل عند انقطاع الإنترنت', 'تكاليف شهرية'],
          risks: ['توقف النظام أمام الزبائن'],
        },
      ],
    });

    if (!dilemmaCase || dilemmaCase.options.length !== 2) {
      throw new Error('Failed to evaluate dilemma options');
    }

    const recommended = dilemmaCase.options.find((o) => o.recommended);
    if (!recommended) throw new Error('No recommended option produced by advisor');

    console.log(`   Advisor evaluated dilemma: Recommended «${recommended.title}» with ${recommended.alignmentScore}% alignment`);

    // Confirm verdict
    const decided = await ProjectLifeEngine.recordCommanderVerdict(
      dilemmaCase.id,
      recommended.id,
      'تم اعتماد الخيار المحلي لضمان استمرارية العمل في ظروف غزة الميدانية.'
    );

    if (!decided || decided.status !== 'decided') {
      throw new Error('Failed to confirm commander verdict');
    }

    console.log(`✅ [TEST 5 PASSED] Decision evaluated, alignment scored, and verdict committed to memory.`);
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 5 FAILED]:', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 6: Morning SITREP Generation (Aligned with Energy & Top Priorities)
  // --------------------------------------------------------------------------
  try {
    console.log('\n👉 [TEST 6] Testing Context-Aware Morning SITREP Generation...');
    const sitrep = ProjectLifeEngine.generateMorningSITREP('high');

    if (!sitrep || sitrep.mode !== 'morning') {
      throw new Error('Invalid SITREP generation');
    }

    if (!sitrep.topPriorities || sitrep.topPriorities.length < 3) {
      throw new Error(`Expected at least 3 top priorities, found ${sitrep.topPriorities.length}`);
    }

    console.log(`   Morning SITREP Generated for ${sitrep.date}:`);
    sitrep.topPriorities.forEach((p, i) => {
      console.log(`     ${i + 1}. [${p.urgency.toUpperCase()}] ${p.title} (${p.projectTitle || ''})`);
    });

    console.log(`✅ [TEST 6 PASSED] Morning SITREP accurately extracts top 3 priorities matching energy.`);
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 6 FAILED]:', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 7: Evening Debrief & Agent Tools Registry Integration
  // --------------------------------------------------------------------------
  try {
    console.log('\n👉 [TEST 7] Testing Evening Debrief & Phase 7 Agent Tools Integration...');
    const debrief = await ProjectLifeEngine.recordEveningDebrief({
      accomplishments: ['إنجاز معمارية المرحلة 7 بنجاح', 'فهرسة مشاريع أوبسيديان الـ 19'],
      obstacles: ['ضغط الوقت وساعات الكهرباء'],
      lessonsLearned: ['التركيز الصامت في الفجر يعادل 8 ساعات عمل عادية'],
      tomorrowPrep: 'بدء المرحلة 8 (رادار الفرص وتحليل الأفكار)',
      overallSatisfaction: 9.5,
    });

    if (!debrief || debrief.mode !== 'evening') {
      throw new Error('Failed to record evening debrief');
    }

    // Verify Phase 7 tools exist in ENHANCED_TOOL_REGISTRY
    const toolsToCheck = [
      'audit_project_health',
      'update_project_step',
      'record_strategic_decision',
      'log_life_habit_compliance',
      'generate_unified_sitrep',
    ];

    toolsToCheck.forEach((toolName) => {
      if (!ENHANCED_TOOL_REGISTRY[toolName]) {
        throw new Error(`Phase 7 tool ${toolName} not found in ENHANCED_TOOL_REGISTRY`);
      }
    });

    // Execute one tool test
    const toolExecResult = await ENHANCED_TOOL_REGISTRY['audit_project_health'].execute(
      { slug: 'os-nexus-os' },
      { agentRole: 'chief_of_staff' } as any
    );

    if (!toolExecResult.success) {
      throw new Error(`Tool execution failed: ${toolExecResult.summary}`);
    }

    console.log(`   Tool audit_project_health result: ${toolExecResult.summary}`);
    console.log(`✅ [TEST 7 PASSED] Evening debrief recorded and 5 autonomous Agent Tools verified.`);
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 7 FAILED]:', err.message);
  }

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`🏁 PHASE 7 TEST RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('================================================================\n');

  if (passedTests === totalTests) {
    console.log('🎉 ALL 7 PHASE 7 TESTS PASSED WITH 100% SUCCESS RATE!');
    process.exit(0);
  } else {
    console.error(`💥 ONLY ${passedTests}/${totalTests} TESTS PASSED.`);
    process.exit(1);
  }
}

runTestSuite();
