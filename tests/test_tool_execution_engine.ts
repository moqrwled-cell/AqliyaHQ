// ============================================================================
// AQLIYA AGENTIC OS — TOOL EXECUTION ENGINE AUTOMATED TEST SUITE
// ============================================================================

import { ToolExecutionEngine } from '../src/lib/agentic-os/tools/toolExecutionEngine';
import { ENHANCED_TOOL_REGISTRY } from '../src/lib/agentic-os/tools/agentToolsRegistry';
import { SafeFileOps } from '../src/lib/agentic-os/tools/safeFileOps';
import type { AgentExecutionContext, AgentTaskNode } from '../src/lib/agentic-os/types';

async function runToolExecutionEngineTests() {
  console.log('================================================================');
  console.log('🚀 بدء اختبارات المرحلة 5: TOOL EXECUTION ENGINE');
  console.log('================================================================\n');

  let passedTests = 0;
  const totalTests = 7;

  const mockContext: AgentExecutionContext = {
    dossier: null,
    memories: [],
    missions: [
      {
        id: 'm-roma-test',
        code: 'ROMA-SYS',
        title: 'نظام إدارة كفي روما',
        status: 'active',
        progress_percent: 85,
        current_focus: 'ضبط الحسابات المحلية وقوائم المشروبات',
        next_ops: 'إتمام الربط مع قاعدة البيانات',
        done_log: ['إعداد الواجهة الزجاجية'],
        tags: ['cafe', 'business'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'm-nexus-test',
        code: 'NEXUS-CORE',
        title: 'نظام تشغيل عقلية وNexusOS',
        status: 'active',
        progress_percent: 90,
        current_focus: 'بناء محرك تنفيذ الأدوات',
        next_ops: 'إطلاق المرحلة الخامسة',
        done_log: ['المراحل 1 إلى 4 مكتملة بنجاح'],
        tags: ['ai', 'agentic_os'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    intel: [],
    battleLogs: [],
    dispatchTelemetry: () => {},
    requestApproval: async () => true,
    onStateMutation: async () => {},
  };

  // --------------------------------------------------------------------------
  // TEST 1: فحص سجل الأدوات الموحد وشمولية الـ 16 أداة ومخططاتها
  // --------------------------------------------------------------------------
  console.log('[1/7] فحص سجل الأدوات الموحد (Tool Registry Schema & Metadata)...');
  const allTools = ToolExecutionEngine.getAllTools();
  console.log(`  ✓ إجمالي الأدوات المسجلة: ${allTools.length} أداة تنفيذية`);

  const requiredToolNames = [
    'read_file',
    'search_projects',
    'create_note',
    'edit_file',
    'create_task',
    'update_project_status',
    'analyze_document',
    'search_knowledge_vault',
    'interact_obsidian_vault',
    'generate_report',
    'execute_scoped_script',
    'record_commander_memory',
    'create_mission_objective',
    'curate_intel_solution',
    'dispatch_battle_log',
    'request_commander_decision',
  ];

  let allToolsValid = true;
  for (const name of requiredToolNames) {
    const tool = ENHANCED_TOOL_REGISTRY[name];
    if (!tool || !tool.nameAr || !tool.category || !tool.allowedAgents || !tool.inputs) {
      allToolsValid = false;
      console.error(`  ❌ نقص في تعريف الأداة: ${name}`);
    }
  }

  if (allToolsValid && allTools.length >= 16) {
    console.log('  ✅ تم التحقق: كافة الأدوات الـ 16 معرفة بمخطط دقيق ومصنفة الصلاحيات.\n');
    passedTests++;
  } else {
    console.error('  ❌ فشل: نقص في تعريفات الأدوات!\n');
  }

  // --------------------------------------------------------------------------
  // TEST 2: فحص تدقيق الصلاحيات ومنع استخدام الأدوات لغير المصرح لهم (RBAC)
  // --------------------------------------------------------------------------
  console.log('[2/7] فحص تدقيق صلاحيات الوكلاء ومنع الانتهاكات الأمنية (RBAC)...');

  // أ. محاولة وكيل العمليات الحياتية life_ops تنفيذ عملية برمجية عالية الخطورة execute_scoped_script
  const deniedRes = await ToolExecutionEngine.executeTool({
    toolName: 'execute_scoped_script',
    callerAgent: 'life_ops',
    args: { operation: 'calculate_stats' },
    context: mockContext,
  });

  // ب. محاولة مهندس الأنظمة systems_dev تنفيذ نفس الأداة (مصرح له)
  const allowedRes = await ToolExecutionEngine.executeTool({
    toolName: 'execute_scoped_script',
    callerAgent: 'systems_dev',
    args: { operation: 'calculate_stats' },
    context: mockContext,
    isPreApproved: true,
  });

  console.log(`  ✓ فحص الوكيل غير المصرح: نجاح [${deniedRes.success}] | السبب: "${deniedRes.summary.slice(0, 50)}..."`);
  console.log(`  ✓ فحص الوكيل المصرح: نجاح [${allowedRes.success}] | النتيجة: "${allowedRes.summary.slice(0, 50)}..."`);

  if (!deniedRes.success && allowedRes.success) {
    console.log('  ✅ تم التحقق: جدار الصلاحيات يعزل الوكلاء ويمنع الاستخدام غير المصرح به 100%.\n');
    passedTests++;
  } else {
    console.error('  ❌ فشل في فحص الصلاحيات الأمنية للوكلاء!\n');
  }

  // --------------------------------------------------------------------------
  // TEST 3: فحص عزل البيئة ومنع اختراق المسارات (Sandbox & Path Traversal Guard)
  // --------------------------------------------------------------------------
  console.log('[3/7] فحص حماية مسارات الملفات ومنع الاختراق (Path Traversal Guard)...');

  const testPaths = [
    { path: '../../Windows/System32/cmd.exe', shouldPass: false },
    { path: 'C:\\Users\\lenovo\\.env', shouldPass: false },
    { path: 'E:\\AqliyaHQ\\.env.local', shouldPass: false },
    { path: 'E:\\AqliyaHQ\\README.md', shouldPass: true },
    { path: 'E:\\Antigravity_Vault\\00 - لوحة السيطرة والشبكة المعرفية (Antigravity MOC).md', shouldPass: true },
    { path: 'Projects\\Business & Cafe\\test_note.md', shouldPass: true },
  ];

  let allPathChecksPassed = true;
  for (const item of testPaths) {
    const val = SafeFileOps.validatePath(item.path);
    const passed = val.isValid === item.shouldPass;
    console.log(`  - المسار: "${item.path}" -> صالح: ${val.isValid} (متطابق مع التوقع: ${passed})`);
    if (!passed) allPathChecksPassed = false;
  }

  if (allPathChecksPassed) {
    console.log('  ✅ تم التحقق: عزل البيئة البرمجية وحظر المسارات الحساسة يعمل بكفاءة تامة.\n');
    passedTests++;
  } else {
    console.error('  ❌ فشل في فحص أمان مسارات الملفات!\n');
  }

  // --------------------------------------------------------------------------
  // TEST 4: فحص أدوات قراءة وتعديل الملفات وأوبسيديان (File & Obsidian Tools)
  // --------------------------------------------------------------------------
  console.log('[4/7] فحص أدوات الملفات وأوبسيديان (read_file, create_note, edit_file)...');

  // أ. قراءة README.md
  const readRes = await ToolExecutionEngine.executeTool({
    toolName: 'read_file',
    callerAgent: 'chief_of_staff',
    args: { path: 'README.md' },
    context: mockContext,
  });

  // ب. إنشاء ملاحظة أوبسيديان تجريبية
  const createNoteRes = await ToolExecutionEngine.executeTool({
    toolName: 'create_note',
    callerAgent: 'chief_of_staff',
    args: {
      title: 'خطة تدقيق كفي روما التكتيكية',
      content: 'ملاحظة تم إنشاؤها عبر محرك أدوات عقلية للتحقق من المزامنة مع أوبسيديان.',
      folder: 'Projects\\Business & Cafe',
    },
    context: mockContext,
  });

  // ج. تعديل وإلحاق محتوى بملف
  const editRes = await ToolExecutionEngine.executeTool({
    toolName: 'edit_file',
    callerAgent: 'systems_dev',
    args: {
      path: 'Projects\\Business & Cafe\\خطة تدقيق كفي روما التكتيكية.md',
      content: '\n## تحديث الخطوة:\n- تم التدقيق بنجاح.',
      mode: 'append',
    },
    context: mockContext,
    isPreApproved: true,
  });

  console.log(`  ✓ قراءة ملف: نجاح [${readRes.success}] - محتوى مقروء: ${(readRes.data?.content || '').length} حرف`);
  console.log(`  ✓ إنشاء ملاحظة: نجاح [${createNoteRes.success}] - المسار: ${createNoteRes.data?.filePath}`);
  console.log(`  ✓ إلحاق بالملف: نجاح [${editRes.success}] - البايتات: ${editRes.data?.bytesWritten}`);

  if (readRes.success && createNoteRes.success && editRes.success) {
    console.log('  ✅ تم التحقق: أدوات الملفات وأوبسيديان تعمل بكامل طاقتها وسلامتها.\n');
    passedTests++;
  } else {
    console.error('  ❌ فشل في فحص أدوات الملفات وأوبسيديان!\n');
  }

  // --------------------------------------------------------------------------
  // TEST 5: فحص أدوات إدارة المشاريع والمهام (Projects & Tasks Tools)
  // --------------------------------------------------------------------------
  console.log('[5/7] فحص أدوات المشاريع والمهام (search_projects, create_task, update_status)...');

  // أ. البحث داخل المشاريع
  const searchProjRes = await ToolExecutionEngine.executeTool({
    toolName: 'search_projects',
    callerAgent: 'chief_of_staff',
    args: { query: 'روما' },
    context: mockContext,
  });

  // ب. إنشاء خطوة قادمة للمشروع
  const createTaskRes = await ToolExecutionEngine.executeTool({
    toolName: 'create_task',
    callerAgent: 'systems_dev',
    args: {
      title: 'إتمام ربط الجداول المحلية لقائمة المشروبات',
      mission_id: 'm-roma-test',
      priority: 'high',
    },
    context: mockContext,
  });

  // ج. تحديث نسبة الإنجاز وسجل الإنجاز
  const updateStatusRes = await ToolExecutionEngine.executeTool({
    toolName: 'update_project_status',
    callerAgent: 'systems_dev',
    args: {
      mission_id: 'm-roma-test',
      progress_percent: 88,
      done_entry: 'تم ربط مكونات واجهة الطاولات بنجاح.',
    },
    context: mockContext,
  });

  console.log(`  ✓ البحث في المشاريع: ${searchProjRes.data?.missions?.length} نتائج مطابقة`);
  console.log(`  ✓ إنشاء مهمة: ${createTaskRes.summary}`);
  console.log(`  ✓ تحديث الحالة: ${updateStatusRes.summary}`);

  if (searchProjRes.success && createTaskRes.success && updateStatusRes.success) {
    console.log('  ✅ تم التحقق: أدوات المشاريع والمهام تنفذ تحديثاتها التكتيكية بدقة.\n');
    passedTests++;
  } else {
    console.error('  ❌ فشل في أدوات المشاريع والمهام!\n');
  }

  // --------------------------------------------------------------------------
  // TEST 6: فحص أدوات المعرفة والتحليل وإنشاء التقارير (Knowledge & Reports)
  // --------------------------------------------------------------------------
  console.log('[6/7] فحص أدوات المعرفة والتحليل وإنشاء التقارير...');

  // أ. البحث في الذاكرة
  const memSearchRes = await ToolExecutionEngine.executeTool({
    toolName: 'search_knowledge_vault',
    callerAgent: 'life_ops',
    args: { query: 'فجر' },
    context: mockContext,
  });

  // ب. توليد تقرير تكتيكي موحد
  const reportRes = await ToolExecutionEngine.executeTool({
    toolName: 'generate_report',
    callerAgent: 'chief_of_staff',
    args: {
      report_type: 'sitrep',
      title: 'تقرير الجاهزية التكتيكية للمرحلة الخامسة',
      sections: {
        'الوضع الراهن': 'كافة أدوات الوكلاء تم تفعيلها وربطها بنظام الصلاحيات.',
        'المشاريع النشطة': 'كفي روما (88%)، نظام عقلية (90%).',
        'الخطوة القادمة': 'اعتماد جاهزية محرك الأدوات الموحد.',
      },
    },
    context: mockContext,
  });

  console.log(`  ✓ البحث في الذاكرة: نجاح [${memSearchRes.success}] - ${memSearchRes.data?.memories?.length || 0} نتائج`);
  console.log(`  ✓ إنشاء التقرير: نجاح [${reportRes.success}] - طول التقرير: ${(reportRes.data?.reportMarkdown || '').length} حرف`);

  if (memSearchRes.success && reportRes.success) {
    console.log('  ✅ تم التحقق: أدوات استرجاع المعرفة وصياغة التقارير تعمل بامتياز.\n');
    passedTests++;
  } else {
    console.error('  ❌ فشل في فحص أدوات المعرفة والتقارير!\n');
  }

  // --------------------------------------------------------------------------
  // TEST 7: فحص سجلات التدقيق الصارمة وحظر الأوامر الخطيرة (Audit & Safety Guard)
  // --------------------------------------------------------------------------
  console.log('[7/7] فحص سجلات التدقيق الشاملة وحظر أوامر النظام العشوائية...');

  // محاولة تشغيل أمر shell عشوائي محظور
  const maliciousAttempt = await ToolExecutionEngine.executeTool({
    toolName: 'execute_scoped_script',
    callerAgent: 'systems_dev',
    args: { operation: 'bash -c rm -rf /' },
    context: mockContext,
    isPreApproved: true,
  });

  const auditRecords = ToolExecutionEngine.getAuditRecords();
  console.log(`  ✓ محاولة تشغيل أمر نظام محظور: نجاح [${maliciousAttempt.success}] (تم الحظر: ${!maliciousAttempt.success})`);
  console.log(`  ✓ إجمالي سجلات التدقيق الموثقة: ${auditRecords.length} سجل`);

  const hasBlockedRecord = auditRecords.some((r) => r.status === 'denied' || (r.error && r.error.includes('Sandbox')));

  if (!maliciousAttempt.success && hasBlockedRecord && auditRecords.length >= 8) {
    console.log('  ✅ تم التحقق: سجل التدقيق يعمل 100% وتم حظر الاختراق وتوثيق كافة العمليات.\n');
    passedTests++;
  } else {
    console.error('  ❌ فشل في فحص سجل التدقيق وحماية النظام!\n');
  }

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('================================================================');
  console.log(`📊 النتيجة الإجمالية لاختبارات المرحلة 5: ${passedTests}/${totalTests} ناجحة`);
  console.log('================================================================');

  if (passedTests === totalTests) {
    console.log('🏆 المرحلة 5: TOOL EXECUTION ENGINE مكتملة وموثقة بنجاح 100%!');
    process.exit(0);
  } else {
    console.error('⚠️ توجد اختبارات غير مجتازة.');
    process.exit(1);
  }
}

runToolExecutionEngineTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
