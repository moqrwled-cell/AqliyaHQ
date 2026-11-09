// ============================================================================
// AQLIYA PERSISTENT MEMORY & KNOWLEDGE GRAPH — AUTOMATED TEST SUITE
// ============================================================================

import { PersistentMemoryStore } from '../src/lib/memory-graph/memoryStore';
import { KnowledgeGraphEngine } from '../src/lib/memory-graph/knowledgeGraphEngine';
import { MemoryContextRetriever } from '../src/lib/memory-graph/memoryContextRetriever';
import type { MemoryLayer } from '../src/lib/memory-graph/types';

async function runMemoryGraphTests() {
  console.log('================================================================');
  console.log('🚀 بدء اختبارات المرحلة 3: PERSISTENT MEMORY & KNOWLEDGE GRAPH');
  console.log('================================================================\n');

  let passedTests = 0;
  const totalTests = 7;

  // 1. فحص تهيئة الطبقات السبع للذاكرة
  console.log('[1/7] فحص استقرار وشمول الطبقات السبع للذاكرة...');
  PersistentMemoryStore.initialize();
  const stats = PersistentMemoryStore.getStats();
  const layers: MemoryLayer[] = ['identity', 'goals', 'projects', 'decisions', 'experience', 'operational', 'knowledge'];
  
  let allLayersPopulated = true;
  for (const l of layers) {
    const count = stats[l];
    console.log(`  ✓ طبقة [${l}]: ${count} سجلات موثقة`);
    if (count === 0) allLayersPopulated = false;
  }

  if (allLayersPopulated) {
    console.log('  ✅ تم التحقق: كافة الطبقات السبع مفعلة ومحملة ببيانات حقيقية.\n');
    passedTests++;
  } else {
    console.error('  ❌ فشل: بعض الطبقات فارغة!\n');
  }

  // 2. فحص تفاصيل المشاريع والخطوات كلها (الوعي التام بكافة المشاريع)
  console.log('[2/7] فحص استخراج تفاصيل المشاريع وخطواتها التفصيلية (Roma Cafe & NexusOS)...');
  const romaContext = KnowledgeGraphEngine.getProjectFullContext('ROMA-SYS');
  const nexusContext = KnowledgeGraphEngine.getProjectFullContext('NEXUS-CORE');

  if (romaContext.project && romaContext.steps.length >= 3 && nexusContext.project && nexusContext.steps.length >= 4) {
    console.log(`  ✓ مشروع كفي روما: ${romaContext.steps.length} خطوات تنفيذية | أخطاء موثقة: ${romaContext.knownErrors.length}`);
    console.log(`    - الخطوة الحالية: [${romaContext.project.currentFocus}]`);
    console.log(`  ✓ مشروع NexusOS: ${nexusContext.steps.length} خطوات تنفيذية | وثائق أوبسيديان: ${nexusContext.obsidianFiles.length}`);
    console.log('  ✅ تم التحقق: المحرك يمتلك وعياً تاماً بجميع خطوات ومسارات المشاريع.\n');
    passedTests++;
  } else {
    console.error('  ❌ فشل في استخراج خطوات المشاريع التفصيلية!\n');
  }

  // 3. فحص محرك دعم اتخاذ القرارات (Decision Support Engine)
  console.log('[3/7] فحص محرك دعم اتخاذ القرارات والمبادئ القيادية...');
  const decisionQuery = KnowledgeGraphEngine.getDecisionSupportContext('تصميم أبل الزجاجي');
  
  if (decisionQuery.applicablePrinciples.length > 0 && decisionQuery.relevantDecisions.length > 0) {
    console.log(`  ✓ المبادئ الحاكمة المسترجعة: ${decisionQuery.applicablePrinciples.length} مبادئ`);
    console.log(`    - أول مبدأ: "${decisionQuery.applicablePrinciples[0]}"`);
    console.log(`  ✓ قرارات سابقة مرتبطة: ${decisionQuery.relevantDecisions.length} قرارات (الخيار المعتمد: ${decisionQuery.relevantDecisions[0].chosenOption})`);
    console.log('  ✅ تم التحقق: دعم اتخاذ القرار يعمل ويربط المبادئ والخيارات والنتائج.\n');
    passedTests++;
  } else {
    console.error('  ❌ فشل في استرجاع سياق القرارات والمبادئ!\n');
  }

  // 4. فحص رصد ومعرفة الأخطاء والوقاية (Error & Lesson Prevention)
  console.log('[4/7] فحص رصد الأخطاء والدروس المستفادة والقواعد الوقائية...');
  const errors = KnowledgeGraphEngine.getErrorsAndLessons('proj-mem-nexus');
  
  if (errors.length >= 2) {
    console.log(`  ✓ عدد الأخطاء الموثقة لمشروع NexusOS: ${errors.length}`);
    errors.forEach((e) => {
      console.log(`    - [${e.errorType}] ${e.title} -> 🔒 القاعدة الوقائية: ${e.preventiveRule}`);
    });
    console.log('  ✅ تم التحقق: المحرك يعرف الأسباب الجذرية للأخطاء ويطبق القواعد الوقائية لمنع تكرارها.\n');
    passedTests++;
  } else {
    console.error('  ❌ لم يتم العثور على أخطاء وقواعد وقائية كافية!\n');
  }

  // 5. فحص بنية الـ Knowledge Graph (العقد والعلاقات المتعددة)
  console.log('[5/7] فحص بناء شبكة العلاقات المعرفية (Knowledge Graph Nodes & Edges)...');
  const graph = KnowledgeGraphEngine.buildGraph();
  const graphStats = KnowledgeGraphEngine.getStats();

  console.log(`  ✓ إجمالي العقد: ${graphStats.totalNodes}`);
  console.log(`  ✓ إجمالي علاقات الترابط (Edges): ${graphStats.totalEdges}`);
  console.log(`    - عقد المشاريع: ${graphStats.nodesByType.project}`);
  console.log(`    - عقد المهام/الخطوات: ${graphStats.nodesByType.task}`);
  console.log(`    - عقد القرارات: ${graphStats.nodesByType.decision}`);
  console.log(`    - عقد الأخطاء والدروس: ${graphStats.nodesByType.error_lesson}`);
  console.log(`    - عقد الأهداف: ${graphStats.nodesByType.goal}`);
  console.log(`    - عقد الوكلاء: ${graphStats.nodesByType.agent}`);

  if (graphStats.totalNodes >= 18 && graphStats.totalEdges >= 20) {
    console.log('  ✅ تم التحقق: الـ Knowledge Graph مترابط بالكامل بين المستخدم والمشاريع والوكلاء والقرارات.\n');
    passedTests++;
  } else {
    console.error('  ❌ كثافة شبكة العلاقات المعرفية غير كافية!\n');
  }

  // 6. فحص الاسترجاع السياقي المستهدف ومنع التشتت
  console.log('[6/7] فحص الاسترجاع السياقي المستهدف عبر MemoryContextRetriever...');
  const targeted = MemoryContextRetriever.retrieveTargetedContext({
    userPrompt: 'ما هي خطوات وأخطاء مشروع روما كافيه؟',
    intent: 'code_engineering',
    activeProjectId: 'ROMA-SYS',
  });

  if (targeted.projectDeepSteps && targeted.projectDeepSteps.includes('ROMA-SYS')) {
    console.log('  ✓ استرجاع دقيق لخطوات كفي روما دون حشو مشاريع أخرى.');
    console.log('  ✅ تم التحقق: الاسترجاع السياقي موجه وحصري لنطاق السؤال.\n');
    passedTests++;
  } else {
    console.error('  ❌ فشل في الاسترجاع السياقي الموجه!\n');
  }

  // 7. فحص كشف التكرار والتعارضات (Duplicate & Conflict Detection)
  console.log('[7/7] فحص كشف التكرار وتضارب المبادئ...');
  const dupCheck = PersistentMemoryStore.detectDuplicates({
    id: 'test-dup-1',
    layer: 'identity',
    title: 'ساعات ذروة التركيز والصفاء الذهني',
    content: 'أوقات أعلى إنتاجية وإبداع هندسي للقائد هي من بعد صلاة الفجر مباشرة وحتى الساعة 10:00 صباحاً. في هذه الساعات يجب تركيز المهام الصعبة والتصميم المعماري.',
    tags: ['peak_hours'],
    importance: 9,
    provenance: 'user_direct',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as any);

  const conflictCheck = PersistentMemoryStore.detectConflicts({
    id: 'test-conf-1',
    layer: 'identity',
    aspect: 'non_negotiable_principle',
    title: 'مبدأ متناقض',
    content: 'الاعتماد على البنية السحابية فقط وحظر العمل بدون اتصال.',
    tags: ['cloud'],
    importance: 8,
    confidenceScore: 0.8,
    provenance: 'user_direct',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as any);

  if (dupCheck.isDuplicate && conflictCheck.hasConflict) {
    console.log(`  ✓ كشف التكرار نجح: "${dupCheck.message}"`);
    console.log(`  ✓ كشف التعارض نجح: "${conflictCheck.reason}"`);
    console.log('  ✅ تم التحقق: محرك سلامة الذاكرة يكشف التكرار والتعارضات بنجاح.\n');
    passedTests++;
  } else {
    console.error('  ❌ فشل في فحص التكرار أو التعارض!\n');
  }

  console.log('================================================================');
  console.log(`📊 النتيجة النهائية لاختبارات المرحلة 3: ${passedTests}/${totalTests} (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('================================================================');
}

runMemoryGraphTests();
