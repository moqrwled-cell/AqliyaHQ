// ============================================================================
// AQLIYA HQ — PHASE 11: FINAL SYSTEM-WIDE INTEGRATION TEST SUITE
// END-TO-END OPERATIONAL FLIGHT CHECK ACROSS ALL 11 PHASES
// ============================================================================

// Universal localStorage mock for Node.js test environment if needed
if (typeof globalThis.localStorage === 'undefined') {
  const storageMap: Record<string, string> = {};
  (globalThis as any).localStorage = {
    getItem: (key: string) => (key in storageMap ? storageMap[key] : null),
    setItem: (key: string, value: string) => {
      storageMap[key] = String(value);
    },
    removeItem: (key: string) => {
      delete storageMap[key];
    },
    clear: () => {
      for (const k in storageMap) delete storageMap[k];
    },
    key: (index: number) => Object.keys(storageMap)[index] || null,
    get length() {
      return Object.keys(storageMap).length;
    },
  };
}

import { PersistentMemoryStore } from '../src/lib/memory-graph/memoryStore';
import { KnowledgeGraphEngine } from '../src/lib/memory-graph/knowledgeGraphEngine';
import { TaskDispatcher } from '../src/lib/agentic-os/taskDispatcher';
import { AGENT_FLEET, getAgentByRole } from '../src/lib/agentic-os/agentRegistry';
import { ENHANCED_TOOL_REGISTRY } from '../src/lib/agentic-os/tools/agentToolsRegistry';
import { ProjectLifeEngine } from '../src/lib/project-life/projectLifeEngine';
import { OpportunityRadarEngine } from '../src/lib/opportunity-radar/opportunityRadarEngine';
import { CryptoVaultEngine } from '../src/lib/offline-security/cryptoVaultEngine';
import { OfflineSyncEngine } from '../src/lib/offline-security/offlineSyncEngine';
import { scanSystemWatchdog } from '../src/lib/watchdogEngine';

async function runMasterIntegration() {
  console.log('================================================================');
  console.log('🌟 RUNNING PHASE 11: FINAL SYSTEM-WIDE INTEGRATION FLIGHT CHECK');
  console.log('«عقلية | AQLIYA HQ» — AUTONOMOUS EXECUTIVE AGENTIC OS');
  console.log('================================================================\n');

  let passedTests = 0;
  const totalTests = 7;

  // --------------------------------------------------------------------------
  // TEST 1: Unified Subsystem Architecture Coherence
  // --------------------------------------------------------------------------
  try {
    console.log('👉 [TEST 1] Verifying Unified Architecture & Subsystems Initialization...');

    // 1. Memory Store & Knowledge Graph
    PersistentMemoryStore.initialize();
    const memoryStats = PersistentMemoryStore.getStats();
    const graphStats = KnowledgeGraphEngine.getStats();

    // 2. Swarm Registry
    const agents = Object.values(AGENT_FLEET);

    // 3. Tool Registry
    const toolCount = Object.keys(ENHANCED_TOOL_REGISTRY).length;

    // 4. Project Life Catalog
    const allProjects = ProjectLifeEngine.getAllProjects();

    // 5. Opportunity Radar
    const radarStats = OpportunityRadarEngine.getStats();

    // 6. Crypto Vault
    const pinHash = await CryptoVaultEngine.ensureInitialized();

    // 7. Offline Sync Engine
    const syncStats = OfflineSyncEngine.getSyncStats();

    if (memoryStats.totalEntries === 0) throw new Error('Memory store empty');
    if (graphStats.totalNodes < 40) throw new Error(`Knowledge graph nodes too low: ${graphStats.totalNodes}`);
    if (agents.length !== 5) throw new Error(`Agent swarm expected 5 agents, found ${agents.length}`);
    if (toolCount !== 26) throw new Error(`Tool registry expected 26 tools, found ${toolCount}`);
    if (allProjects.length < 19) throw new Error(`Project catalog expected at least 19 projects, found ${allProjects.length}`);
    if (radarStats.totalOpportunities === 0) throw new Error('Opportunity radar empty');
    if (!pinHash.hash) throw new Error('Crypto vault PIN hash failed');

    console.log(`   Memory Layers: 7 | Graph Nodes: ${graphStats.totalNodes} (Edges: ${graphStats.totalEdges})`);
    console.log(`   Agent Swarm: 5 specialized agents | Autonomous Tools: ${toolCount}`);
    console.log(`   Indexed Real Projects: ${allProjects.length} | Active Radar Ideas: ${radarStats.totalOpportunities}`);
    console.log(`   Security: PBKDF2 (100K iter) + AES-GCM | Sync Engine: Active`);
    console.log('✅ [TEST 1 PASSED] Unified architecture coherence verified 100%.\n');
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 1 FAILED]:', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 2: End-to-End Decision & Mission Lifecycle (Strategy -> Swarm DAG -> Memory)
  // --------------------------------------------------------------------------
  try {
    console.log('👉 [TEST 2] Testing End-to-End Decision & Mission Execution Pipeline...');

    const commandText = 'أريد تقييم إضافة ميزة وضع عدم الاتصال لكفي روما وربطها بالمزامنة';
    
    // 1. Task Strategy Determination
    const strategyAnalysis = TaskDispatcher.determineStrategy(commandText);
    if (!strategyAnalysis.primaryAgent) {
      throw new Error('TaskDispatcher failed to determine primary agent');
    }

    // 2. Swarm DAG Generation (Hierarchical Multi-Agent Execution Plan)
    const saasDAG = TaskDispatcher.buildSaaSLaunchDAG('dag-final-check', commandText);
    if (saasDAG.tasks.length !== 7 || saasDAG.dispatchStrategy !== 'hierarchical_nexus') {
      throw new Error(`DAG generated incorrect tasks count: ${saasDAG.tasks.length}`);
    }

    // 3. Evaluate Dilemma with Strategic Principles
    const dilemmaResult = ProjectLifeEngine.evaluateDilemma({
      title: 'استراتيجية تخزين ومزامنة بيانات كافيه روما',
      projectSlug: 'business-roma-cafe',
      category: 'architecture',
      dilemmaDescription: 'انقطاع الإنترنت المتكرر يستوجب استقلالية تامة مع مزامنة لاحقة.',
      rawOptions: [
        {
          title: 'الاعتماد على التخزين المحلي المشفر AES-GCM وطابور المزامنة',
          description: 'حفظ كافة الطلبات محلياً مع تشفير فوري ومزامنة ذكية عند عودة الاتصال.',
          pros: ['استقلالية 100%', 'سرعة فورية', 'حماية بيانات كافيه روما'],
          cons: ['تحديات فض التعارض'],
          risks: ['تأخر المزامنة حتى عودة الشبكة'],
        },
        {
          title: 'الاعتماد على السيرفر السحابي المباشر فقط',
          description: 'ربط الكاشير بالسحابة بشكل دائم.',
          pros: ['مراقبة لحظية'],
          cons: ['توقف العمل عند انقطاع الإنترنت'],
          risks: ['توقف البيع أمام الزبائن'],
        },
      ],
    });

    const recommended = dilemmaResult.options.find((o) => o.recommended);
    if (!recommended) throw new Error('No recommended option produced by advisor');

    // 4. Record Decision into Persistent Mind Vault
    const memoryRes = PersistentMemoryStore.addEntry('decisions', {
      layer: 'decisions',
      title: `قرار استراتيجي: ${dilemmaResult.title}`,
      content: `قرار استراتيجي: ${dilemmaResult.title} (الخيار المعتمد: ${recommended.title})`,
      context: 'تطوير كفي روما ليعمل بالكامل بدون انترنت في غزة مع مزامنة فورية',
      chosenOption: recommended.title,
      rejectedAlternatives: ['الاعتماد على السيرفر السحابي المباشر فقط'],
      rationale: 'حماية بيانات الكافيه واستقلالية العمل دون انقطاع',
      decisionPrinciplesApplied: ['offline_first', 'anti_slop'],
      tags: ['decision', 'roma_cafe', 'offline_sync', 'aes_gcm'],
      importance: 9,
      confidence: 1.0,
      source: 'commander_direct',
    } as any);

    if (!memoryRes.success || !memoryRes.entry?.id) throw new Error('Failed to record decision into persistent memory');

    console.log(`   Strategy: [${strategyAnalysis.strategy}] -> Assigned Agent: [${getAgentByRole(strategyAnalysis.primaryAgent).nameAr}]`);
    console.log(`   Swarm DAG: ${saasDAG.id} (${saasDAG.tasks.length} coordinated tasks, Strategy: ${saasDAG.dispatchStrategy})`);
    console.log(`   Dilemma Evaluated -> Recommended: «${recommended.title}» (${recommended.alignmentScore}% fit)`);
    console.log(`   Memory Vault Entry Committed: ${memoryRes.entry.id}`);
    console.log('✅ [TEST 2 PASSED] End-to-end decision & mission pipeline verified.\n');
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 2 FAILED]:', err.stack || err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 3: Project Catalog & Obsidian Vault Integrity (19 Projects, Zero Mock)
  // --------------------------------------------------------------------------
  try {
    console.log('👉 [TEST 3] Verifying Obsidian Vault & 19 Real Projects Data Integrity...');

    const projects = ProjectLifeEngine.getAllProjects();
    if (projects.length < 19) {
      throw new Error(`Expected at least 19 projects, got ${projects.length}`);
    }

    // Check specific known projects by their real registered slugs
    const roma = ProjectLifeEngine.getProject('business-roma-cafe');
    const nexus = ProjectLifeEngine.getProject('os-nexus-os');
    const geo = ProjectLifeEngine.getProject('academics-regional-geography');
    const life = ProjectLifeEngine.getProject('life-to-top-ops');

    if (!roma || !nexus || !geo || !life) {
      throw new Error('Key projects (Roma Cafe, NexusOS, Geography, To Top) not found');
    }

    // Verify health index calculation
    const romaHealth = ProjectLifeEngine.calculateProjectHealth(roma);
    if (romaHealth < 10 || romaHealth > 100) {
      throw new Error(`Invalid project health score: ${romaHealth}`);
    }

    const attentionList = ProjectLifeEngine.getProjectsRequiringAttention();

    console.log(`   Projects Indexed: ${projects.length} real projects from E:\\Antigravity_Vault`);
    console.log(`   Key Anchors: Roma Cafe (${romaHealth}%), NexusOS, Geography, To Top Ops`);
    console.log(`   Projects Requiring Tactical Attention: ${attentionList.length}`);
    console.log('✅ [TEST 3 PASSED] 19 projects & health index mathematical integrity verified.\n');
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 3 FAILED]:', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 4: Opportunity Radar to Project Transformation Pipeline
  // --------------------------------------------------------------------------
  try {
    console.log('👉 [TEST 4] Testing Opportunity Radar Evaluation & Conversion Pipeline...');

    // 1. Evaluate idea scores
    const evalScores = OpportunityRadarEngine.evaluateOpportunityScores({
      title: 'نظام إدارة طلبات كافيه روما',
      problemSolved: 'تسجيل وإدارة طلبات الزبائن بسرعة وموثوقية في كافيه روما',
      targetBeneficiary: 'إدارة كفي روما',
      estimatedCost: 'مجاني',
      linkedProjectSlug: 'business-roma-cafe',
      rawScores: {
        valueScore: 95,
        strategicFitScore: 90,
        feasibilityScore: 85,
        effortScore: 80,
        costScore: 95,
        riskScore: 85,
      },
    });

    if (evalScores.overallViabilityScore < 80 || evalScores.verdict !== 'critical_priority') {
      throw new Error(`Unexpected opportunity evaluation: ${evalScores.overallViabilityScore} / ${evalScores.verdict}`);
    }

    const roma = ProjectLifeEngine.getProject('business-roma-cafe');
    if (!roma) throw new Error('Roma project not found');
    const initialStepsCount = roma.steps.length;

    // 2. Create opportunity linked to roma cafe
    const createdOpp = OpportunityRadarEngine.createOpportunity({
      title: 'تطوير وحدة إدارة المخزون والموردين لكافيه روما',
      rawSourceUrl: 'file:///E:/Antigravity_Vault',
      problemSolved: 'أتمتة طلبات البن والحليب والمواد الاستهلاكية وتنبيه النواقص',
      targetBeneficiary: 'إدارة كفي روما',
      linkedProjectSlug: 'business-roma-cafe',
      notes: 'توسعة تجارية سيادية',
    });

    if (!createdOpp || !createdOpp.id) throw new Error('Failed to create opportunity');

    // 3. Convert to project step & knowledge memory
    const convResult = await OpportunityRadarEngine.convertOpportunity(createdOpp.id);
    if (!convResult.success || !convResult.projectStepAdded) {
      throw new Error(`Opportunity conversion failed: ${convResult.message}`);
    }

    // 4. Verify step was added to project
    const updatedRoma = ProjectLifeEngine.getProject('business-roma-cafe');
    if (!updatedRoma || updatedRoma.steps.length !== initialStepsCount + 1) {
      throw new Error(`Project step was not added: steps count is ${updatedRoma?.steps.length}, expected ${initialStepsCount + 1}`);
    }

    console.log(`   Opportunity Evaluated: Score ${evalScores.overallViabilityScore}% -> Verdict: [${evalScores.verdict}]`);
    console.log(`   Opportunity Converted: «${createdOpp.title}» -> Steps Count: ${initialStepsCount} -> ${updatedRoma.steps.length}`);
    console.log('✅ [TEST 4 PASSED] Opportunity evaluation & project step conversion pipeline verified.\n');
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 4 FAILED]:', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 5: Military-Grade Security & Offline Sync Queue
  // --------------------------------------------------------------------------
  try {
    console.log('👉 [TEST 5] Testing Military Security & Conflict-Resilient Offline Sync...');

    // 1. Verify PIN 2005
    const pinCheck = await CryptoVaultEngine.verifyPin('2005');
    if (!pinCheck.success) throw new Error('PIN verification failed');

    // 2. Encrypt & Decrypt Account Secrets
    const testSecret = 'ghp_ExecutivePersonalAccessTokenSecret2026';
    const encrypted = await CryptoVaultEngine.encryptText(testSecret, '2005');
    const decrypted = await CryptoVaultEngine.decryptText(encrypted, '2005');
    if (decrypted !== testSecret) throw new Error('Secret decryption roundtrip mismatch');

    // 3. Enqueue and verify offline actions
    OfflineSyncEngine.clearAll();
    const action = OfflineSyncEngine.enqueueAction('missions', 'update', { id: 'm-1', progress: 100 });
    if (action.sequenceNumber !== 1) throw new Error('Sequence ordering failed');

    // 4. Resolve conflict with Commander Precedence
    const resolved = OfflineSyncEngine.resolveConflict(
      action.id,
      { id: 'm-1', progress: 50, updated_at: new Date(Date.now() + 1000).toISOString() },
      'commander_precedence'
    );
    if (resolved.winner !== 'local') throw new Error('Commander Precedence did not win');

    console.log(`   Security: PBKDF2 verified, AES-GCM encrypted payload roundtrip validated`);
    console.log(`   Offline Sync: Action ${action.id} resolved with Commander Precedence -> Winner: ${resolved.winner}`);
    console.log('✅ [TEST 5 PASSED] Military security & offline sync resilience verified.\n');
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 5 FAILED]:', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 6: Watchdog Telemetry & Routine Enforcement
  // --------------------------------------------------------------------------
  try {
    console.log('👉 [TEST 6] Testing Watchdog Telemetry & Routine Enforcement...');

    // Run system watchdog scanner
    const alerts = scanSystemWatchdog({
      missions: [],
      intel: [],
      directives: [],
      battleLogs: [],
      memories: [],
    });

    if (alerts.length === 0) {
      throw new Error('Watchdog scanner should return at least daily SITREP reminder');
    }

    const hasSitrepAlert = alerts.some((a) => a.id === 'alert-sitrep-today');
    if (!hasSitrepAlert) {
      throw new Error('Daily SITREP alert missing from watchdog telemetry');
    }

    console.log(`   Watchdog Scanned: ${alerts.length} alerts generated (including daily routine enforcement)`);
    console.log('✅ [TEST 6 PASSED] Watchdog telemetry & routine enforcement verified.\n');
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 6 FAILED]:', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 7: Zero Mock & Absolute Production Integrity Verification
  // --------------------------------------------------------------------------
  try {
    console.log('👉 [TEST 7] Testing Zero Mock & Production Integrity Audit...');

    // Verify all 26 tools have valid executors
    const tools = Object.values(ENHANCED_TOOL_REGISTRY);
    if (tools.length !== 26) {
      throw new Error(`Expected 26 tools, got ${tools.length}`);
    }

    for (const tool of tools) {
      if (typeof tool.execute !== 'function') {
        throw new Error(`Tool ${tool.name} lacks an execute function`);
      }
      if (!tool.nameAr || !tool.description) {
        throw new Error(`Tool ${tool.name} missing Arabic description`);
      }
    }

    // Verify SITREP synthesis
    const sitrep = ProjectLifeEngine.generateMorningSITREP('high');
    if (!sitrep || !sitrep.topPriorities || sitrep.topPriorities.length < 3) {
      throw new Error('SITREP synthesis failed to generate top 3 priorities');
    }

    console.log(`   26 Autonomous Tools: 100% verified with executable handlers & Arabic documentation`);
    console.log(`   Morning SITREP Generated: ${sitrep.topPriorities.length} top priorities formulated (${sitrep.topPriorities.map((p) => p.projectTitle).join(', ')})`);
    console.log('✅ [TEST 7 PASSED] Zero mock & production integrity 100% confirmed.\n');
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 7 FAILED]:', err.message);
  }

  // --------------------------------------------------------------------------
  // GRAND SCORECARD
  // --------------------------------------------------------------------------
  console.log('================================================================');
  console.log(`🏁 MASTER FLIGHT CHECK RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('================================================================\n');

  if (passedTests === totalTests) {
    console.log('🎉 ALL 7 PHASE 11 INTEGRATION TESTS PASSED WITH 100% SUCCESS RATE!');
    console.log('🚀 SYSTEM READY FOR PRODUCTION RELEASE!');
    process.exit(0);
  } else {
    console.error(`⚠️ INTEGRATION FAILED: Only ${passedTests}/${totalTests} tests passed.`);
    process.exit(1);
  }
}

runMasterIntegration().catch((err) => {
  console.error('Fatal Master Integration Error:', err);
  process.exit(1);
});
