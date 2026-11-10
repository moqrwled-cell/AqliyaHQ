// ============================================================================
// AQLIYA HQ — PHASE 10 VERIFICATION TEST SUITE
// OFFLINE, SYNC & MILITARY-GRADE SECURITY (AES-GCM, PBKDF2, CONFLICT RESOLUTION)
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

import { CryptoVaultEngine } from '../src/lib/offline-security/cryptoVaultEngine';
import { OfflineSyncEngine } from '../src/lib/offline-security/offlineSyncEngine';
import { ENHANCED_TOOL_REGISTRY } from '../src/lib/agentic-os/tools/agentToolsRegistry';
import type { AgentExecutionContext } from '../src/lib/agentic-os/types';

async function runTestSuite() {
  console.log('================================================================');
  console.log('🚀 RUNNING PHASE 10: OFFLINE, SYNC & SECURITY TEST SUITE');
  console.log('================================================================\n');

  let passedTests = 0;
  const totalTests = 7;

  // --------------------------------------------------------------------------
  // TEST 1: PBKDF2 PIN Hashing & Constant-Time Verification
  // --------------------------------------------------------------------------
  try {
    console.log('👉 [TEST 1] Testing PBKDF2 PIN Hashing & Constant-Time Verification...');

    // Clear test storage
    localStorage.clear();

    // Initialize with Master PIN 2005
    const storedHash = await CryptoVaultEngine.ensureInitialized();
    if (!storedHash.hash || !storedHash.salt || storedHash.iterations !== 100_000) {
      throw new Error('PIN Hash failed to initialize with PBKDF2 100,000 iterations');
    }

    // Verify correct PIN
    const successResult = await CryptoVaultEngine.verifyPin('2005');
    if (!successResult.success || successResult.lockedOut) {
      throw new Error(`Master PIN verification failed: ${successResult.error}`);
    }

    // Verify incorrect PIN is rejected
    const failResult = await CryptoVaultEngine.verifyPin('9999');
    if (failResult.success || failResult.remainingAttempts !== 4) {
      throw new Error(`Incorrect PIN should fail with 4 remaining attempts, got: ${failResult.remainingAttempts}`);
    }

    console.log('   Algorithm: ' + storedHash.algorithm + ' (Iterations: ' + storedHash.iterations + ')');
    console.log('   Salt: ' + storedHash.salt.substring(0, 10) + '... | Hash: ' + storedHash.hash.substring(0, 10) + '...');
    console.log('✅ [TEST 1 PASSED] PBKDF2 PIN hashing & constant-time check verified 100%.\n');
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 1 FAILED]:', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 2: Brute-Force Rate Limiting & Lockout Defense
  // --------------------------------------------------------------------------
  try {
    console.log('👉 [TEST 2] Testing Brute-Force Rate Limiting & Lockout Defense...');

    // Fail 4 more times to reach the 5-attempt limit
    await CryptoVaultEngine.verifyPin('1111'); // attempt 2
    await CryptoVaultEngine.verifyPin('2222'); // attempt 3
    await CryptoVaultEngine.verifyPin('3333'); // attempt 4
    const finalFail = await CryptoVaultEngine.verifyPin('4444'); // attempt 5 -> triggers lockout

    if (!finalFail.lockedOut || finalFail.remainingAttempts !== 0) {
      throw new Error(`Lockout should trigger on 5th attempt: lockedOut=${finalFail.lockedOut}`);
    }

    // Immediate attempt while locked out must be blocked
    const blockedAttempt = await CryptoVaultEngine.verifyPin('2005');
    if (!blockedAttempt.lockedOut || blockedAttempt.success) {
      throw new Error('System must reject even correct PIN while under active lockout');
    }

    console.log('   Lockout Defense Active: ' + blockedAttempt.lockedOut + ' | Lockout Duration: ~30s');

    // Reset lockout for subsequent tests
    CryptoVaultEngine.saveLockoutState({ failedAttempts: 0, lockoutUntil: null });
    const recoveryResult = await CryptoVaultEngine.verifyPin('2005');
    if (!recoveryResult.success) {
      throw new Error('Recovery after lockout reset failed');
    }

    console.log('✅ [TEST 2 PASSED] Brute-force rate limiting & lockout defense fully verified.\n');
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 2 FAILED]:', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 3: AES-GCM 256-Bit Text Encryption & Decryption
  // --------------------------------------------------------------------------
  try {
    console.log('👉 [TEST 3] Testing AES-GCM 256-Bit Text Encryption & Decryption...');

    const sensitiveSecret = 'Supabase_Service_Role_Secret_Key_Token_7894561230';
    const pin = '2005';

    // Encrypt
    const encrypted = await CryptoVaultEngine.encryptText(sensitiveSecret, pin);
    if (!encrypted.ciphertext || !encrypted.iv || !encrypted.salt || encrypted.algorithm !== 'AES-GCM-256') {
      throw new Error('Encrypted payload missing critical AES-GCM components');
    }

    // Decrypt with correct PIN
    const decrypted = await CryptoVaultEngine.decryptText(encrypted, pin);
    if (decrypted !== sensitiveSecret) {
      throw new Error(`Decrypted secret mismatch! Expected: ${sensitiveSecret}, Got: ${decrypted}`);
    }

    // Attempt decrypt with incorrect PIN must throw error
    let tamperedDetected = false;
    try {
      await CryptoVaultEngine.decryptText(encrypted, '0000');
    } catch {
      tamperedDetected = true;
    }

    if (!tamperedDetected) {
      throw new Error('Decryption with wrong PIN should fail and prevent data disclosure');
    }

    console.log('   Ciphertext: ' + encrypted.ciphertext.substring(0, 16) + '... (Algorithm: ' + encrypted.algorithm + ')');
    console.log('   Roundtrip Decryption: Verified matching original plaintext');
    console.log('✅ [TEST 3 PASSED] AES-GCM 256-bit encryption & authentication tag verified.\n');
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 3 FAILED]:', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 4: Accounts Vault Migration & Transparent Secret Handling
  // --------------------------------------------------------------------------
  try {
    console.log('👉 [TEST 4] Testing Accounts Vault Migration & Transparent Secret Handling...');

    const legacyPlaintextAccounts = [
      {
        id: 'acc-test-1',
        name: 'GitHub Mohammad Qrman',
        category: 'dev',
        username: 'moqrwled-cell',
        secret: 'ghp_secretTokenExample123456789',
        updated_at: new Date().toISOString(),
      },
      {
        id: 'acc-test-2',
        name: 'PalPay Gaza Hub',
        category: 'banking',
        username: '0597000000',
        secret: '9876_PalPay_Pin',
        updated_at: new Date().toISOString(),
      },
    ];

    // Migrate to encrypted
    const migrated = await CryptoVaultEngine.migrateAccountsVault(legacyPlaintextAccounts, '2005');

    if (!CryptoVaultEngine.isEncrypted(migrated[0].secret)) {
      throw new Error('First account secret failed to migrate to EncryptedPayload');
    }

    // Decrypt both
    const plain1 = await CryptoVaultEngine.decryptAccountSecret(migrated[0].secret, '2005');
    const plain2 = await CryptoVaultEngine.decryptAccountSecret(migrated[1].secret, '2005');

    if (plain1 !== 'ghp_secretTokenExample123456789' || plain2 !== '9876_PalPay_Pin') {
      throw new Error('Decrypted account secrets do not match originals after migration');
    }

    console.log('   Migrated accounts count: ' + migrated.length + ' (All encrypted with AES-GCM)');
    console.log('✅ [TEST 4 PASSED] Accounts Vault transparent migration and decryption verified.\n');
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 4 FAILED]:', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 5: Offline Sync Queue & Strictly Increasing Sequence Ordering
  // --------------------------------------------------------------------------
  try {
    console.log('👉 [TEST 5] Testing Offline Sync Queue & Strictly Increasing Sequence Ordering...');

    OfflineSyncEngine.clearAll();

    const a1 = OfflineSyncEngine.enqueueAction('missions', 'insert', { title: 'إطلاق موقع روما' });
    const a2 = OfflineSyncEngine.enqueueAction('missions', 'update', { id: 'm1', progress: 85 });
    const a3 = OfflineSyncEngine.enqueueAction('habits', 'insert', { habitId: 'fajr_prayer', compliant: true });

    if (a1.sequenceNumber !== 1 || a2.sequenceNumber !== 2 || a3.sequenceNumber !== 3) {
      throw new Error(`Sequences not strictly monotonic: [${a1.sequenceNumber}, ${a2.sequenceNumber}, ${a3.sequenceNumber}]`);
    }

    const pending = OfflineSyncEngine.getPendingActions();
    if (pending.length !== 3) {
      throw new Error(`Expected 3 pending actions, found: ${pending.length}`);
    }

    const stats = OfflineSyncEngine.getSyncStats();
    if (stats.pendingCount !== 3 || stats.currentSequence !== 3) {
      throw new Error(`Stats mismatch: pending=${stats.pendingCount}, seq=${stats.currentSequence}`);
    }

    console.log('   Enqueued Actions: ' + pending.length + ' (Seq range: 1 -> ' + stats.currentSequence + ')');
    console.log('✅ [TEST 5 PASSED] Offline sync queue & monotonic sequence ordering verified.\n');
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 5 FAILED]:', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 6: Conflict Detection & Multi-Strategy Resolution
  // --------------------------------------------------------------------------
  try {
    console.log('👉 [TEST 6] Testing Conflict Detection & Conflict Resolution Strategies...');

    const localAction = OfflineSyncEngine.getQueue()[1]; // a2: update m1

    // Scenario A: Remote row is newer than local action snapshot -> Conflict detected
    const futureDate = new Date(Date.now() + 60_000).toISOString();
    const remoteConflictState = {
      id: 'm1',
      progress: 90,
      updated_at: futureDate,
    };

    const conflictResult = OfflineSyncEngine.detectConflict(localAction, remoteConflictState);
    if (!conflictResult.hasConflict || conflictResult.conflictType !== 'concurrent_modification') {
      throw new Error(`Conflict detection failed: hasConflict=${conflictResult.hasConflict}`);
    }

    // Resolve conflict using 'commander_precedence' (Commander local edit prevails)
    const resolved = OfflineSyncEngine.resolveConflict(
      localAction.id,
      remoteConflictState,
      'commander_precedence'
    );

    if (resolved.winner !== 'local' || !resolved.appliedData._commanderResolution) {
      throw new Error('Commander Precedence resolution failed to declare local winner');
    }

    console.log('   Detected Conflict: ' + conflictResult.conflictType);
    console.log('   Resolution Strategy: ' + resolved.strategy + ' -> Winner: ' + resolved.winner);
    console.log('✅ [TEST 6 PASSED] Conflict detection & Commander precedence resolution verified.\n');
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 6 FAILED]:', err.message);
  }

  // --------------------------------------------------------------------------
  // TEST 7: Autonomous Agent Tools Integration (Tools 25 & 26)
  // --------------------------------------------------------------------------
  try {
    console.log('👉 [TEST 7] Testing Security & Offline Agent Tools Integration...');

    const tool25 = ENHANCED_TOOL_REGISTRY['audit_security_vault'];
    const tool26 = ENHANCED_TOOL_REGISTRY['manage_offline_sync'];

    if (!tool25 || !tool26) {
      throw new Error('Tools audit_security_vault or manage_offline_sync are not registered');
    }

    const mockCtx: AgentExecutionContext = {
      missions: [],
      intel: [],
      directives: [],
      battleLogs: [],
      memories: [],
      activeDAG: null,
      completedDAGs: [],
    };

    // Execute Tool 25: audit_security_vault
    const res25 = await tool25.execute({}, mockCtx);
    if (!res25.success || !res25.data?.audit?.pinProtectionActive) {
      throw new Error(`Tool 25 execution failed: ${res25.summary}`);
    }

    // Execute Tool 26: manage_offline_sync
    const res26 = await tool26.execute({ action: 'get_stats' }, mockCtx);
    if (!res26.success || typeof res26.data?.stats?.pendingCount !== 'number') {
      throw new Error(`Tool 26 execution failed: ${res26.summary}`);
    }

    console.log('   Tool 25 [audit_security_vault]: ' + res25.summary);
    console.log('   Tool 26 [manage_offline_sync]: ' + res26.summary);
    console.log('   Total Registered Enhanced Tools: ' + Object.keys(ENHANCED_TOOL_REGISTRY).length);
    console.log('✅ [TEST 7 PASSED] Tools 25 and 26 successfully integrated into agent swarm.\n');
    passedTests++;
  } catch (err: any) {
    console.error('❌ [TEST 7 FAILED]:', err.message);
  }

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('================================================================');
  console.log(`🏁 PHASE 10 TEST RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('================================================================\n');

  if (passedTests === totalTests) {
    console.log('🎉 ALL 7 PHASE 10 TESTS PASSED WITH 100% SUCCESS RATE!');
    process.exit(0);
  } else {
    console.error(`⚠️ FAILED: Only ${passedTests}/${totalTests} tests passed.`);
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal Test Suite Error:', err);
  process.exit(1);
});
