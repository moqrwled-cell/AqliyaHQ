// ============================================================================
// AQLIYA AGENTIC OS — MISSION CONTROL AUTOMATED TEST SUITE
// ============================================================================

import { MissionControlEngine } from '../src/lib/agentic-os/missionControlEngine';
import type { AgenticPlanDAG, AgentTaskNode, AgentRole } from '../src/lib/agentic-os/types';
import { ExecutionLogsManager } from '../src/lib/agentic-os/executionLogs';

async function runMissionControlTests() {
  console.log('================================================================');
  console.log('🚀 بدء اختبارات المرحلة 6: MISSION CONTROL');
  console.log('================================================================\n');

  let passedTests = 0;
  const totalTests = 7;

  // إعداد مسار مهام اختباري حي
  const sampleDAG: AgenticPlanDAG = {
    id: 'dag-control-test',
    commanderDirective: 'بناء واجهة مراقبة وتحكم فورية لعمليات الوكلاء',
    dispatchStrategy: 'hierarchical_nexus',
    overallStatus: 'running',
    currentStepIndex: 1,
    totalTokensUsed: 1450,
    createdAt: new Date().toISOString(),
    tasks: [
      {
        id: 'task-1-framing',
        title: 'تأطير متطلبات مركز العمليات',
        description: 'تحليل شاشات المراقبة وحساب مؤشرات الأداء الحقيقية.',
        assignedAgent: 'chief_of_staff',
        dependencies: [],
        status: 'completed',
        outputResult: 'تم اعتماد معايير الرصد الستة: الحالة، المهام، التوكنز، الأخطاء، المهل، والتدخل القيادي.',
        requiresHumanApproval: false,
        executionLogs: ['[10:00:00] اكتمل التأطير بنجاح'],
        durationMs: 320,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      },
      {
        id: 'task-2-eng',
        title: 'بناء محرك التحكم في المهام',
        description: 'توفير وظائف الإيقاف المؤقت، الإعادة، التخطي، والتفويض.',
        assignedAgent: 'systems_dev',
        dependencies: ['task-1-framing'],
        status: 'in_progress',
        requiresHumanApproval: false,
        executionLogs: ['[10:01:00] جارٍ التنفيذ الهندسي'],
        durationMs: 150,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'task-3-approval',
        title: 'اعتماد تعديلات البنية الحساسة',
        description: 'إجراء يتطلب حسم القائد محمد قبل الانتقال للتنفيذ.',
        assignedAgent: 'systems_dev',
        dependencies: ['task-2-eng'],
        status: 'waiting_approval',
        requiresHumanApproval: true,
        executionLogs: [],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'task-4-audit',
        title: 'تدقيق الأمان ومؤشر الصحة',
        description: 'فحص استقرار العمليات وخلوها من التعليق.',
        assignedAgent: 'watchdog_sentry',
        dependencies: ['task-3-approval'],
        status: 'pending',
        requiresHumanApproval: false,
        executionLogs: [],
        createdAt: new Date().toISOString(),
      },
    ],
  };

  // تسجيل بعض العمليات في سجل التنفيذ لمحاكاة الواقع
  ExecutionLogsManager.clear();
  ExecutionLogsManager.logStart('task-1-framing', 'chief_of_staff', 'تأطير العمليات');
  ExecutionLogsManager.logSuccess('task-1-framing', 'chief_of_staff', 'تأطير العمليات', 320, 'تم الاعتماد بنجاح');
  ExecutionLogsManager.logStart('task-2-eng', 'systems_dev', 'بناء المحرك');

  // --------------------------------------------------------------------------
  // TEST 1: فحص حالة الأسطول الحية وتتبع الوكلاء الخمسة
  // --------------------------------------------------------------------------
  console.log('[1/7] فحص حالة الأسطول الحية (Live Fleet Status Monitoring)...');
  const fleet = MissionControlEngine.getLiveFleetStatus(sampleDAG);
  console.log(`  ✓ عدد الوكلاء المفحوصين: ${fleet.length}`);

  let allFleetValid = true;
  for (const agent of fleet) {
    console.log(`    - [${agent.nameAr}]: حالة [${agent.status}] | آخر نشاط: ${agent.lastActiveTimestamp.slice(11, 19)} | أدوات مصرحة: ${agent.allowedToolsCount}`);
    if (!agent.name || !agent.nameAr || !agent.status) allFleetValid = false;
  }

  const activeAgents = fleet.filter((a) => a.status === 'executing' || a.status === 'waiting_approval');
  if (allFleetValid && fleet.length === 5 && activeAgents.length > 0) {
    console.log('  ✅ تم التحقق: شاشة الأسطول تعكس الحالة الحية الحقيقية لكافة الوكلاء بدقة.\n');
    passedTests++;
  } else {
    console.error('  ❌ فشل في فحص حالة الأسطول الحية!\n');
  }

  // --------------------------------------------------------------------------
  // TEST 2: فحص مؤشرات الأداء الحقيقية واستهلاك الموارد (Zero Mock Math)
  // --------------------------------------------------------------------------
  console.log('[2/7] فحص مؤشرات الأداء وحجم العمل (Workload Metrics Math)...');
  const metrics = MissionControlEngine.getWorkloadMetrics(sampleDAG);

  console.log(`  ✓ إجمالي المهام: ${metrics.totalTasks}`);
  console.log(`  ✓ المهام المكتملة: ${metrics.completedTasks} | قيد التنفيذ: ${metrics.inProgressTasks} | بانتظار الحسم: ${metrics.pendingApprovalTasks}`);
  console.log(`  ✓ استهلاك التوكنز: ${metrics.totalTokensUsed} tokens`);
  console.log(`  ✓ مؤشر صحة المنظومة: ${metrics.healthIndex}%`);

  const metricsCorrect = 
    metrics.totalTasks === 4 &&
    metrics.completedTasks === 1 &&
    metrics.inProgressTasks === 1 &&
    metrics.pendingApprovalTasks === 1 &&
    metrics.totalTokensUsed === 1450 &&
    metrics.healthIndex === 100;

  if (metricsCorrect) {
    console.log('  ✅ تم التحقق: مؤشرات العمليات واستهلاك الموارد مطابقة 100% للواقع الفعلي دون تزييف.\n');
    passedTests++;
  } else {
    console.error('  ❌ فشل في احتساب مؤشرات الأداء وحجم العمل!\n');
  }

  // --------------------------------------------------------------------------
  // TEST 3: فحص الإيقاف المؤقت للمهمة (Task Pause)
  // --------------------------------------------------------------------------
  console.log('[3/7] فحص التدخل القيادي: إيقاف مهمة جارية مؤقتاً (Pause Task)...');
  const pausedDAG = MissionControlEngine.pauseTask(sampleDAG, 'task-2-eng');
  const pausedTask = pausedDAG.tasks.find((t) => t.id === 'task-2-eng');

  console.log(`  ✓ حالة المهمة بعد الإيقاف: [${pausedTask?.status}]`);
  console.log(`  ✓ آخر بند في سجل التتبع: "${pausedTask?.executionLogs.slice(-1)[0]}"`);

  if (pausedTask && pausedTask.status === 'pending') {
    console.log('  ✅ تم التحقق: نجاح الإيقاف المؤقت للمهمة الجارية وتوثيق أمر القائد.\n');
    passedTests++;
  } else {
    console.error('  ❌ فشل في إيقاف المهمة!\n');
  }

  // --------------------------------------------------------------------------
  // TEST 4: فحص إعادة تشغيل المهمة (Task Retry)
  // --------------------------------------------------------------------------
  console.log('[4/7] فحص التدخل القيادي: إعادة تشغيل مهمة (Retry Task)...');
  const retriedDAG = MissionControlEngine.retryTask(pausedDAG, 'task-2-eng');
  const retriedTask = retriedDAG.tasks.find((t) => t.id === 'task-2-eng');

  console.log(`  ✓ عدد محاولات الإعادة: ${retriedTask?.retryCount}`);
  console.log(`  ✓ حالة المهمة: [${retriedTask?.status}]`);

  if (retriedTask && retriedTask.retryCount === 1 && retriedTask.status === 'pending') {
    console.log('  ✅ تم التحقق: نجاح إعادة تشغيل المهمة واحتساب المحاولة بدقة.\n');
    passedTests++;
  } else {
    console.error('  ❌ فشل في إعادة تشغيل المهمة!\n');
  }

  // --------------------------------------------------------------------------
  // TEST 5: فحص تخطي المهمة بقرار القائد (Skip Task)
  // --------------------------------------------------------------------------
  console.log('[5/7] فحص التدخل القيادي: تخطي مهمة واعتماد استمرار المسار (Skip Task)...');
  const skippedDAG = MissionControlEngine.skipTask(retriedDAG, 'task-4-audit', 'تم التدقيق اليدوي من القائد');
  const skippedTask = skippedDAG.tasks.find((t) => t.id === 'task-4-audit');

  console.log(`  ✓ حالة المهمة بعد التخطي: [${skippedTask?.status}]`);
  console.log(`  ✓ مخرج التخطي: "${skippedTask?.outputResult}"`);

  if (skippedTask && skippedTask.status === 'completed' && skippedTask.outputResult?.includes('تم التدقيق اليدوي')) {
    console.log('  ✅ تم التحقق: نجاح تخطي المهمة وتوثيق السبب في مخرجات النظام.\n');
    passedTests++;
  } else {
    console.error('  ❌ فشل في تخطي المهمة!\n');
  }

  // --------------------------------------------------------------------------
  // TEST 6: فحص إعادة تفويض الوكيل (Task Reassignment)
  // --------------------------------------------------------------------------
  console.log('[6/7] فحص التدخل القيادي: إعادة تفويض وكيل آخر للمهمة (Reassign Task)...');
  const reassignedDAG = MissionControlEngine.reassignTask(skippedDAG, 'task-3-approval', 'watchdog_sentry', 'تغيير نطاق الرقابة');
  const reassignedTask = reassignedDAG.tasks.find((t) => t.id === 'task-3-approval');

  console.log(`  ✓ الوكيل المكلف الجديد: [${reassignedTask?.assignedAgent}]`);
  console.log(`  ✓ توثيق التفويض في السجل: "${reassignedTask?.executionLogs.slice(-1)[0]}"`);

  if (reassignedTask && reassignedTask.assignedAgent === 'watchdog_sentry') {
    console.log('  ✅ تم التحقق: نجاح تحويل تفويض المهمة لوكيل آخر بمرونة كاملة.\n');
    passedTests++;
  } else {
    console.error('  ❌ فشل في إعادة تفويض الوكيل!\n');
  }

  // --------------------------------------------------------------------------
  // TEST 7: فحص التدخل اليدوي واعتماد مخرجات القائد المباشرة (Manual Override)
  // --------------------------------------------------------------------------
  console.log('[7/7] فحص التدخل القيادي: تعديل واعتماد مخرج المهمة يدوياً (Manual Override)...');
  const customVerdict = 'تم اعتماد معمارية واجهة كفي روما ونظام عقلية بقرار قيادي صريح من القائد محمد.';
  const overriddenDAG = MissionControlEngine.manualOverride(reassignedDAG, 'task-2-eng', customVerdict);
  const overriddenTask = overriddenDAG.tasks.find((t) => t.id === 'task-2-eng');

  console.log(`  ✓ حالة المهمة بعد التدخل اليدوي: [${overriddenTask?.status}]`);
  console.log(`  ✓ المخرج المعتمد: "${overriddenTask?.outputResult}"`);

  if (overriddenTask && overriddenTask.status === 'completed' && overriddenTask.outputResult === customVerdict) {
    console.log('  ✅ تم التحقق: نجاح التدخل اليدوي واعتماد مخرجات القائد الفورية.\n');
    passedTests++;
  } else {
    console.error('  ❌ فشل في التدخل اليدوي المباشر!\n');
  }

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('================================================================');
  console.log(`📊 النتيجة الإجمالية لاختبارات المرحلة 6: ${passedTests}/${totalTests} ناجحة`);
  console.log('================================================================');

  if (passedTests === totalTests) {
    console.log('🏆 المرحلة 6: MISSION CONTROL مكتملة وموثقة بنجاح 100%!');
    process.exit(0);
  } else {
    console.error('⚠️ توجد اختبارات غير مجتازة.');
    process.exit(1);
  }
}

runMissionControlTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
