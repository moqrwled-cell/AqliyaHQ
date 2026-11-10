// ============================================================================
// AQLIYA AGENTIC OS — AUTONOMOUS AGENT ORCHESTRATION TEST SUITE
// ============================================================================

import { AGENT_FLEET, getAgentByRole } from '../src/lib/agentic-os/agentRegistry';
import { TaskDispatcher } from '../src/lib/agentic-os/taskDispatcher';
import { AgentCommunicationHub } from '../src/lib/agentic-os/agentCommunicationHub';
import { ExecutionLogsManager } from '../src/lib/agentic-os/executionLogs';
import { VerificationEngine } from '../src/lib/agentic-os/verificationEngine';
import { ExecutionManager } from '../src/lib/agentic-os/executionManager';
import type { AgentRole, AgentTaskNode, AgentExecutionContext } from '../src/lib/agentic-os/types';

async function runAgentOrchestrationTests() {
  console.log('================================================================');
  console.log('🚀 بدء اختبارات المرحلة 4: AUTONOMOUS AGENT ORCHESTRATION');
  console.log('================================================================\n');

  let passedTests = 0;
  const totalTests = 7;

  // --------------------------------------------------------------------------
  // TEST 1: فحص سجل الوكلاء واستقلالية التعليمات والصلاحيات
  // --------------------------------------------------------------------------
  console.log('[1/7] فحص سجل الوكلاء الخمسة واستقلالية الأدوار والصلاحيات...');
  const expectedRoles: AgentRole[] = [
    'chief_of_staff',
    'intel_scout',
    'systems_dev',
    'watchdog_sentry',
    'life_ops',
  ];

  let allAgentsValid = true;
  for (const role of expectedRoles) {
    const agent = AGENT_FLEET[role];
    if (!agent || !agent.systemPrompt || agent.allowedTools.length === 0) {
      allAgentsValid = false;
      console.error(`  ❌ نقص في تعريف الوكيل [${role}]`);
    } else {
      console.log(`  ✓ الوكيل: [${agent.nameAr}] (${agent.name}) - الأدوات المصرحة: ${agent.allowedTools.length} أدوات`);
    }
  }

  if (allAgentsValid && Object.keys(AGENT_FLEET).length === 5) {
    console.log('  ✅ تم التحقق: كافة الوكلاء الخمسة مجهزون بتعليمات مستقلة وصلاحيات محددة.\n');
    passedTests++;
  } else {
    console.error('  ❌ فشل في فحص سجل الوكلاء!\n');
  }

  // --------------------------------------------------------------------------
  // TEST 2: فحص موزع المهام والإسناد الفردي (منع استنزاف الأسطول)
  // --------------------------------------------------------------------------
  console.log('[2/7] فحص موزع المهام (Task Dispatcher) ومنع الهدر في الأوامر الفردية...');
  
  const testDirectives = [
    { text: 'اكتب دالة برمجية في TypeScript لحساب نسبة الإنجاز', expectedAgent: 'systems_dev' },
    { text: 'لخص هذا الرابط ومقطع الريلز لاستخراج الفكرة الجوهرية', expectedAgent: 'intel_scout' },
    { text: 'سجل في ذاكرتي أن طاقتي تبلغ ذروتها بعد صلاة الفجر', expectedAgent: 'life_ops' },
    { text: 'افحص المشاريع الراكدة التي لم يطرأ عليها تقدم منذ 48 ساعة', expectedAgent: 'watchdog_sentry' },
  ];

  let allSingleDirectivesPassed = true;
  for (const item of testDirectives) {
    const analysis = TaskDispatcher.determineStrategy(item.text);
    const isSingle = analysis.strategy === 'single_agent';
    const isCorrectAgent = analysis.primaryAgent === item.expectedAgent;

    console.log(`  - الأمر: "${item.text.slice(0, 35)}..."`);
    console.log(`    الاستراتيجية: [${analysis.strategy}] | الوكيل: [${analysis.primaryAgent}] (مطابق: ${isCorrectAgent})`);

    if (!isSingle || !isCorrectAgent) {
      allSingleDirectivesPassed = false;
    }
  }

  if (allSingleDirectivesPassed) {
    console.log('  ✅ تم التحقق: قاعدة منع الهدر تعمل 100% (تشغيل الوكيل المختص حصراً دون إيقاظ الأسطول).\n');
    passedTests++;
  } else {
    console.error('  ❌ فشل: تم رصد استنزاف غير مبرر للأسطول في أوامر فردية!\n');
  }

  // --------------------------------------------------------------------------
  // TEST 3: فحص معمارية إطلاق منتج SaaS (الأسطول المنسق الهرمي)
  // --------------------------------------------------------------------------
  console.log('[3/7] فحص معمارية التنسيق الهرمي ومسار إطلاق منتج SaaS المعياري...');
  const saasDirective = 'حلل فرصة إطلاق منتج SaaS جديد للذكاء الاصطناعي في إدارة الكافيهات';
  const saasDAG = TaskDispatcher.buildSaaSLaunchDAG('dag-saas-test', saasDirective);

  const expectedSequence: AgentRole[] = [
    'chief_of_staff',   // 1. Framing
    'intel_scout',      // 2. Competitor intel
    'systems_dev',      // 3. Tech Architecture
    'life_ops',         // 4. Alignment & Gaza context
    'chief_of_staff',   // 5. Synthesis
    'watchdog_sentry',  // 6. Risk Audit
    'chief_of_staff',   // 7. Final Unified Report
  ];

  const actualSequence = saasDAG.tasks.map((t) => t.assignedAgent);
  const sequenceMatches = actualSequence.every((agent, idx) => agent === expectedSequence[idx]);

  console.log(`  ✓ عدد مهام مسار SaaS: ${saasDAG.tasks.length} مهام مترابطة`);
  saasDAG.tasks.forEach((t, i) => {
    console.log(`    ${i + 1}. [${getAgentByRole(t.assignedAgent).nameAr}] -> ${t.title} (اعتمادية: ${t.dependencies.join(', ') || 'نقطة الانطلاق'})`);
  });

  if (sequenceMatches && saasDAG.dispatchStrategy === 'hierarchical_nexus') {
    console.log('  ✅ تم التحقق: تسلسل إطلاق SaaS المعياري يطابق المتطلبات بدقة هندسية تامة.\n');
    passedTests++;
  } else {
    console.error('  ❌ فشل: التسلسل الهرمي لمسار SaaS غير مطابق للمواصفات!\n');
  }

  // --------------------------------------------------------------------------
  // TEST 4: فحص منصة التواصل وتبادل الرسائل بين الوكلاء (Agent Communication Hub)
  // --------------------------------------------------------------------------
  console.log('[4/7] فحص منصة التواصل وتبادل الرسائل بين الوكلاء (Communication Hub)...');
  AgentCommunicationHub.clearAll();

  // إرسال رسائل تجريبية من الوكلاء
  AgentCommunicationHub.sendMessage({
    sender: 'intel_scout',
    recipient: 'all',
    messageType: 'intel_response',
    title: 'رصد 3 منافسين لخدمة SaaS',
    payload: { summary: 'المنافسون يعانون من بطء التحديث وارتفاع أسعار الاشتراكات الشهرية.', taskId: 't-scout' },
    taskId: 'saas-task-thread',
  });

  AgentCommunicationHub.sendMessage({
    sender: 'systems_dev',
    recipient: 'chief_of_staff',
    messageType: 'architecture_spec',
    title: 'المعمارية السحابية المقترحة',
    payload: { summary: 'البنية تعتمد على Supabase و Edge Functions بتكلفة صفرية في البداية.', taskId: 't-arch' },
    taskId: 'saas-task-thread',
  });

  AgentCommunicationHub.sendMessage({
    sender: 'life_ops',
    recipient: 'chief_of_staff',
    messageType: 'life_constraint',
    title: 'ساعات التركيز والموارد المتاحة',
    payload: { summary: 'تخصيص 90 دقيقة صباحية يومياً بعد الفجر للبناء دون إخلال بالروتين.', taskId: 't-life' },
    taskId: 'saas-task-thread',
  });

  const threadMsgs = AgentCommunicationHub.getTaskThread('saas-task-thread');
  const synthesis = AgentCommunicationHub.getSummaryForSynthesis('saas-task-thread');

  console.log(`  ✓ إجمالي الرسائل المتبادلة في الخيط: ${threadMsgs.length}`);
  console.log(`  ✓ ملخص الاستخبارات المستلم: "${synthesis['intel_scout']?.slice(0, 45)}..."`);
  console.log(`  ✓ ملخص المعمارية المستلم: "${synthesis['systems_dev']?.slice(0, 45)}..."`);
  console.log(`  ✓ ملخص العمليات الحياتية: "${synthesis['life_ops']?.slice(0, 45)}..."`);

  if (threadMsgs.length === 3 && synthesis['intel_scout'] && synthesis['systems_dev']) {
    console.log('  ✅ تم التحقق: منصة التواصل الداخلي بين الوكلاء تعمل بكفاءة ومرونة.\n');
    passedTests++;
  } else {
    console.error('  ❌ فشل في منصة التواصل بين الوكلاء!\n');
  }

  // --------------------------------------------------------------------------
  // TEST 5: فحص سجلات العمليات والتتبع التنفيذي (Execution Logs Manager)
  // --------------------------------------------------------------------------
  console.log('[5/7] فحص سجلات التنفيذ وتتبع الأداء والمهل (Execution Logs Manager)...');
  ExecutionLogsManager.clear();

  ExecutionLogsManager.logStart('task-01', 'chief_of_staff', 'تأطير استراتيجي');
  ExecutionLogsManager.logSuccess('task-01', 'chief_of_staff', 'تأطير استراتيجي', 340, 'تم استخراج الأهداف بنجاح');
  ExecutionLogsManager.logStart('task-02', 'systems_dev', 'بناء واجهة المستخدم');
  ExecutionLogsManager.logRetry('task-02', 'systems_dev', 'بناء واجهة المستخدم', 1, 'مهلة شبكة');
  ExecutionLogsManager.logSuccess('task-02', 'systems_dev', 'بناء واجهة المستخدم', 520, 'تم تثبيت الكود بنجاح');

  const stats = ExecutionLogsManager.getStats();
  const recent = ExecutionLogsManager.getRecentLogs(5);

  console.log(`  ✓ إجمالي العمليات الموثقة: ${stats.totalExecutions}`);
  console.log(`  ✓ العمليات الناجحة: ${stats.successfulCount} | عمليات إعادة المحاولة: ${stats.retriedCount}`);
  console.log(`  ✓ متوسط زمن التنفيذ: ${stats.avgDurationMs}ms`);

  if (stats.totalExecutions === 2 && stats.successfulCount === 2 && stats.retriedCount === 1) {
    console.log('  ✅ تم التحقق: نظام السجلات التنفيذية ومؤشرات الأداء يعمل بدقة متناهية.\n');
    passedTests++;
  } else {
    console.error('  ❌ فشل في نظام السجلات التنفيذية!\n');
  }

  // --------------------------------------------------------------------------
  // TEST 6: فحص محرك التحقق المعماري الصارم (Verification Engine)
  // --------------------------------------------------------------------------
  console.log('[6/7] فحص محرك التحقق المعماري الصارم (Verification Engine)...');

  const sampleTask: AgentTaskNode = {
    id: 't-check',
    title: 'فحص مخرجات كود حقيقي',
    description: 'كتابة مكون React زجاجي',
    assignedAgent: 'systems_dev',
    dependencies: [],
    status: 'pending',
    requiresHumanApproval: false,
    executionLogs: [],
    createdAt: new Date().toISOString(),
  };

  // حالة 1: مخرج سليم ووافٍ
  const validOutput = 'تم إنجاز المكون البرمجي GlassmorphicCard بنجاح باستخدام Tailwind CSS مع تأثير الزجاج الضبابي backdrop-blur وتوافق 100% مع معايير أبل.';
  const resValid = VerificationEngine.verifyAgentOutput({
    task: sampleTask,
    output: validOutput,
    agentRole: 'systems_dev',
    expectedCriteria: 'مكون React زجاجي',
  });

  // حالة 2: مخرج يحتوي على خطأ أو رفض
  const errorOutput = 'حدث خطأ غير متوقع Error 503 failed to fetch data';
  const resError = VerificationEngine.verifyAgentOutput({
    task: sampleTask,
    output: errorOutput,
    agentRole: 'systems_dev',
  });

  // حالة 3: مخرج فارغ أو تافه
  const trivialOutput = 'تم';
  const resTrivial = VerificationEngine.verifyAgentOutput({
    task: sampleTask,
    output: trivialOutput,
    agentRole: 'systems_dev',
  });

  console.log(`  ✓ فحص المخرج السليم: نتيجة [${resValid.isValid}] | ثقة: ${resValid.confidence} (أسباب: ${resValid.reason})`);
  console.log(`  ✓ فحص مخرج الخطأ: نتيجة [${resError.isValid}] | كشف الخطأ: ${resError.checksFailed.length > 0}`);
  console.log(`  ✓ فحص المخرج التافه: نتيجة [${resTrivial.isValid}] | كشف القصر: ${resTrivial.checksFailed.length > 0}`);

  if (resValid.isValid && !resError.isValid && !resTrivial.isValid) {
    console.log('  ✅ تم التحقق: محرك التحقق الصارم يفرز المخرجات السليمة ويكتشف الأخطاء بنسبة 100%.\n');
    passedTests++;
  } else {
    console.error('  ❌ فشل في محرك التحقق الصارم!\n');
  }

  // --------------------------------------------------------------------------
  // TEST 7: تشغيل تجريبي متكامل عبر ExecutionManager (مع المهل وإعادة المحاولة)
  // --------------------------------------------------------------------------
  console.log('[7/7] تشغيل مسار تنفيذي متكامل عبر ExecutionManager مع مهل وإعادة محاولة...');

  const mockContext: AgentExecutionContext = {
    dossier: null,
    memories: [],
    missions: [
      {
        id: 'ROMA-SYS',
        title: 'نظام إدارة كفي روما',
        code: 'ROMA-SYS',
        progress_percent: 85,
        priority: 'high',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: ['cafe', 'production'],
        objectives: [],
      },
    ],
    intel: [],
    battleLogs: [],
    dispatchTelemetry: (entry) => {
      // console.log(`    [Telemetry] [${entry.agentRole}] ${entry.message}`);
    },
    requestApproval: async () => true,
  };

  const directPlanDAG = await TaskDispatcher.dispatchDirective(
    'اكتب وثيقة هندسية سريعة لبنية نظام روما كافيه',
    {
      missions: mockContext.missions,
      intel: [],
      memories: [],
    }
  );

  const manager = new ExecutionManager(
    directPlanDAG,
    mockContext,
    { taskTimeoutMs: 30000, maxRetries: 2, backoffBaseMs: 300 }
  );

  const completedDAG = await manager.executePlan();
  const firstTask = completedDAG.tasks[0];

  console.log(`  ✓ استراتيجية المسار: ${completedDAG.dispatchStrategy}`);
  console.log(`  ✓ حالة الخطة الكلية: ${completedDAG.overallStatus}`);
  console.log(`  ✓ حالة المهمة: [${firstTask?.title}] -> ${firstTask?.status}`);
  if (firstTask?.outputResult) {
    console.log(`  ✓ عينة المخرج: "${firstTask.outputResult.slice(0, 80)}..."`);
  }

  if (completedDAG.overallStatus === 'completed' && firstTask?.status === 'completed') {
    console.log('  ✅ تم التحقق: دورة التنفيذ الذاتية اكتملت بنجاح وحصنت بالمهل والتسجيل والتحقق.\n');
    passedTests++;
  } else {
    console.error('  ❌ فشل في دورة التنفيذ التجريبية عبر ExecutionManager!\n');
  }

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('================================================================');
  console.log(`📊 النتيجة الإجمالية لاختبارات المرحلة 4: ${passedTests}/${totalTests} ناجحة`);
  console.log('================================================================');

  if (passedTests === totalTests) {
    console.log('🏆 المرحلة 4: AUTONOMOUS AGENT ORCHESTRATION مكتملة وموثقة بنجاح 100%!');
    process.exit(0);
  } else {
    console.error('⚠️ توجد اختبارات غير مجتازة، يرجى مراجعة التقارير أعلاه.');
    process.exit(1);
  }
}

runAgentOrchestrationTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
