// ============================================================================
// AQLIYA HQ — MASTER TEST RUNNER: ALL 11 PHASES VERIFICATION
// ============================================================================

import { execSync } from 'child_process';
import path from 'path';

interface PhaseSuite {
  phase: number;
  name: string;
  file: string;
  expectedTests: number;
}

const SUITES: PhaseSuite[] = [
  { phase: 2, name: 'نواة الذكاء وتصنيف النوايا (Intelligence Core)', file: 'test_intelligence_core.ts', expectedTests: 10 },
  { phase: 3, name: 'الذاكرة الدائمة ورسم المعرفة (Persistent Memory & Graph)', file: 'test_memory_graph.ts', expectedTests: 7 },
  { phase: 4, name: 'سرب الوكلاء المستقلين (Autonomous Swarm & DAG)', file: 'test_agent_orchestration.ts', expectedTests: 7 },
  { phase: 5, name: 'محرك تنفيذ الأدوات وحماية الملفات (Tool Execution)', file: 'test_tool_execution_engine.ts', expectedTests: 7 },
  { phase: 6, name: 'مركز إدارة المهام والتحكم التكتيكي (Mission Control Deck)', file: 'test_mission_control.ts', expectedTests: 7 },
  { phase: 7, name: 'إدارة الحياة والمشاريع الـ 19 (Project & Life Intelligence)', file: 'test_project_life_intelligence.ts', expectedTests: 7 },
  { phase: 8, name: 'رادار الفرص ومصفوفة التقييم (Opportunity Radar)', file: 'test_opportunity_radar.ts', expectedTests: 7 },
  { phase: 9, name: 'الواجهة التنفيذية والأركان العشرة (Executive Experience)', file: 'test_executive_experience.ts', expectedTests: 7 },
  { phase: 10, name: 'الأمان العسكري والمزامنة بدون اتصال (Offline & Security)', file: 'test_offline_security.ts', expectedTests: 7 },
  { phase: 11, name: 'الفحص التكاملي الشامل للنظام (Final System Integration)', file: 'test_final_system_integration.ts', expectedTests: 7 },
];

async function runAll() {
  console.log('================================================================================');
  console.log('🎖️  AQLIYA HQ — MASTER CUMULATIVE TEST RUNNER (ALL 11 PHASES)');
  console.log('================================================================================\n');

  let totalPassed = 0;
  let totalExpected = 0;
  const results: Array<{ phase: number; name: string; status: 'PASSED' | 'FAILED'; tests: number }> = [];

  for (const suite of SUITES) {
    totalExpected += suite.expectedTests;
    process.stdout.write(`⏳ تشغيل المرحلة ${suite.phase}: ${suite.name}... `);

    const fullPath = path.join(process.cwd(), 'tests', suite.file);
    try {
      execSync(`npx tsx "${fullPath}"`, {
        stdio: 'pipe',
        encoding: 'utf-8',
      });
      console.log(`✅ [${suite.expectedTests}/${suite.expectedTests} اجتاز]`);
      totalPassed += suite.expectedTests;
      results.push({ phase: suite.phase, name: suite.name, status: 'PASSED', tests: suite.expectedTests });
    } catch (err: any) {
      console.log(`❌ [فشل]`);
      results.push({ phase: suite.phase, name: suite.name, status: 'FAILED', tests: 0 });
    }
  }

  console.log('\n================================================================================');
  console.log(`📊 MASTER SCORECARD: ${totalPassed}/${totalExpected} TESTS PASSED (${((totalPassed / totalExpected) * 100).toFixed(1)}%)`);
  console.log('================================================================================\n');

  results.forEach((r) => {
    const icon = r.status === 'PASSED' ? '✅' : '❌';
    console.log(`${icon} المرحلة ${r.phase.toString().padStart(2, ' ')}: ${r.name.padEnd(50, ' ')} -> ${r.tests} اختبارات`);
  });

  if (totalPassed === totalExpected) {
    console.log('\n🌟 تم اجتياز كافة اختبارات المراحل الـ 11 بنسبة 100% بنجاح تام!');
    process.exit(0);
  } else {
    console.error(`\n⚠️ هناك اختبارات لم تجتز بنجاح (${totalPassed}/${totalExpected}).`);
    process.exit(1);
  }
}

runAll();
