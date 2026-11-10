// ============================================================================
// AQLIYA AGENTIC OS — MILITARY-GRADE CRYPTO & SECURITY VAULT ENGINE
// ============================================================================

import type {
  EncryptedPayload,
  StoredPinHash,
  PinVerificationResult,
  SecurityAuditSummary,
} from './types';

// Constants
const PBKDF2_ITERATIONS = 100_000;
const KEY_LENGTH_BITS = 256;
const SALT_BYTE_LENGTH = 16;
const IV_BYTE_LENGTH = 12;
const MAX_FAILED_ATTEMPTS = 5;
const BASE_LOCKOUT_MS = 30_000; // 30 seconds

// Universal Base64 Helpers (compatible with Browser and Node.js)
export function bytesToBase64(bytes: Uint8Array): string {
  const globalBuffer = (globalThis as any).Buffer;
  if (typeof globalBuffer !== 'undefined') {
    return globalBuffer.from(bytes).toString('base64');
  }
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToBytes(base64: string): Uint8Array {
  const globalBuffer = (globalThis as any).Buffer;
  if (typeof globalBuffer !== 'undefined') {
    return new Uint8Array(globalBuffer.from(base64, 'base64'));
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// In-memory security lock state
interface LockoutState {
  failedAttempts: number;
  lockoutUntil: number | null;
}

export class CryptoVaultEngine {
  private static defaultPin = '2005';
  private static storageKeyPinHash = 'aqliya_sec_pin_hash_v1';
  private static storageKeyLockout = 'aqliya_sec_lockout_state_v1';

  private static getCrypto(): Crypto {
    if (typeof globalThis !== 'undefined' && globalThis.crypto) {
      return globalThis.crypto;
    }
    throw new Error('Web Crypto API is not available in the current environment.');
  }

  // --------------------------------------------------------------------------
  // PIN & AUTHENTICATION MANAGEMENT
  // --------------------------------------------------------------------------

  public static async hashPin(pin: string, saltBytes?: Uint8Array): Promise<StoredPinHash> {
    const cryptoObj = this.getCrypto();
    const salt = saltBytes || cryptoObj.getRandomValues(new Uint8Array(SALT_BYTE_LENGTH));

    const encoder = new TextEncoder();
    const pinKeyMaterial = await cryptoObj.subtle.importKey(
      'raw',
      encoder.encode(pin),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    const derivedBits = await cryptoObj.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      pinKeyMaterial,
      KEY_LENGTH_BITS
    );

    return {
      salt: bytesToBase64(salt),
      hash: bytesToBase64(new Uint8Array(derivedBits)),
      iterations: PBKDF2_ITERATIONS,
      algorithm: 'PBKDF2-SHA-256',
      updatedAt: new Date().toISOString(),
    };
  }

  public static getStoredPinHash(): StoredPinHash | null {
    try {
      if (typeof localStorage === 'undefined') return null;
      const raw = localStorage.getItem(this.storageKeyPinHash);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public static setStoredPinHash(hash: StoredPinHash): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.storageKeyPinHash, JSON.stringify(hash));
    }
  }

  public static getLockoutState(): LockoutState {
    try {
      if (typeof localStorage === 'undefined') {
        return { failedAttempts: 0, lockoutUntil: null };
      }
      const raw = localStorage.getItem(this.storageKeyLockout);
      if (!raw) return { failedAttempts: 0, lockoutUntil: null };
      const parsed = JSON.parse(raw);
      if (parsed.lockoutUntil && Date.now() > parsed.lockoutUntil) {
        return { failedAttempts: 0, lockoutUntil: null };
      }
      return parsed;
    } catch {
      return { failedAttempts: 0, lockoutUntil: null };
    }
  }

  public static saveLockoutState(state: LockoutState): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.storageKeyLockout, JSON.stringify(state));
    }
  }

  /**
   * Initializes PIN hash with Commander Mohammad's default PIN (2005) if not initialized yet.
   */
  public static async ensureInitialized(): Promise<StoredPinHash> {
    const existing = this.getStoredPinHash();
    if (existing) return existing;

    const legacyPin = (typeof localStorage !== 'undefined' && localStorage.getItem('aqliya_master_pin')) || this.defaultPin;
    const initialHash = await this.hashPin(legacyPin);
    this.setStoredPinHash(initialHash);
    return initialHash;
  }

  /**
   * Constant-time verification of Commander PIN with brute-force defense
   */
  public static async verifyPin(enteredPin: string): Promise<PinVerificationResult> {
    const lockout = this.getLockoutState();
    const now = Date.now();

    // Check active lockout
    if (lockout.lockoutUntil && now < lockout.lockoutUntil) {
      const remainingMs = lockout.lockoutUntil - now;
      return {
        success: false,
        lockedOut: true,
        remainingAttempts: 0,
        lockoutDurationMs: remainingMs,
        lockoutUntil: lockout.lockoutUntil,
        error: `النظام مؤمن ضد الهجمات المتكررة. يرجى الانتظار ${Math.ceil(remainingMs / 1000)} ثانية.`,
      };
    }

    const storedHash = await this.ensureInitialized();
    const saltBytes = base64ToBytes(storedHash.salt);
    const candidateHash = await this.hashPin(enteredPin, saltBytes);

    // Constant-time comparison
    const isMatch = this.timingSafeEqual(candidateHash.hash, storedHash.hash);

    if (isMatch) {
      // Reset lockout state on success
      this.saveLockoutState({ failedAttempts: 0, lockoutUntil: null });
      return {
        success: true,
        lockedOut: false,
        remainingAttempts: MAX_FAILED_ATTEMPTS,
      };
    } else {
      // Increment failed attempts
      const newFailed = lockout.failedAttempts + 1;
      let newLockoutUntil: number | null = null;
      let lockoutDurationMs = 0;

      if (newFailed >= MAX_FAILED_ATTEMPTS) {
        const factor = Math.min(newFailed - MAX_FAILED_ATTEMPTS, 5);
        lockoutDurationMs = BASE_LOCKOUT_MS * Math.pow(2, factor);
        newLockoutUntil = now + lockoutDurationMs;
      }

      this.saveLockoutState({
        failedAttempts: newFailed,
        lockoutUntil: newLockoutUntil,
      });

      const remainingAttempts = Math.max(0, MAX_FAILED_ATTEMPTS - newFailed);

      return {
        success: false,
        lockedOut: !!newLockoutUntil,
        remainingAttempts,
        lockoutDurationMs: newLockoutUntil ? lockoutDurationMs : undefined,
        lockoutUntil: newLockoutUntil || undefined,
        error: newLockoutUntil
          ? `تم استنفاد المحاولات وتأمين النظام لمدة ${Math.ceil(lockoutDurationMs / 1000)} ثانية لحماية البيانات.`
          : `رمز الدخول غير صحيح. المحاولات المتبقية: ${remainingAttempts}`,
      };
    }
  }

  /**
   * Updates master PIN to a new value (requires verifying current PIN first)
   */
  public static async updatePin(currentPin: string, newPin: string): Promise<{ success: boolean; error?: string }> {
    if (!newPin || newPin.length < 4) {
      return { success: false, error: 'رمز الدخول الجديد يجب أن يتكون من 4 أرقام على الأقل.' };
    }

    const verification = await this.verifyPin(currentPin);
    if (!verification.success) {
      return { success: false, error: verification.error || 'رمز الدخول الحالي غير صحيح.' };
    }

    const newHash = await this.hashPin(newPin);
    this.setStoredPinHash(newHash);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('aqliya_master_pin', newPin); // synced fallback
    }
    return { success: true };
  }

  // --------------------------------------------------------------------------
  // AES-GCM 256-BIT ENCRYPTION & DECRYPTION
  // --------------------------------------------------------------------------

  private static async deriveAesGcmKey(secretPhrase: string, salt: Uint8Array): Promise<CryptoKey> {
    const cryptoObj = this.getCrypto();
    const encoder = new TextEncoder();
    const keyMaterial = await cryptoObj.subtle.importKey(
      'raw',
      encoder.encode(secretPhrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return await cryptoObj.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: KEY_LENGTH_BITS },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypts plaintext string using AES-GCM-256 with key derived from PIN or passphrase
   */
  public static async encryptText(plainText: string, pinOrPass: string = this.defaultPin): Promise<EncryptedPayload> {
    const cryptoObj = this.getCrypto();
    const salt = cryptoObj.getRandomValues(new Uint8Array(SALT_BYTE_LENGTH));
    const iv = cryptoObj.getRandomValues(new Uint8Array(IV_BYTE_LENGTH));

    const derivedKey = await this.deriveAesGcmKey(pinOrPass, salt);
    const encodedData = new TextEncoder().encode(plainText);

    const ciphertextBuffer = await cryptoObj.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource,
      },
      derivedKey,
      encodedData
    );

    return {
      ciphertext: bytesToBase64(new Uint8Array(ciphertextBuffer)),
      iv: bytesToBase64(iv),
      salt: bytesToBase64(salt),
      version: 1,
      algorithm: 'AES-GCM-256',
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Decrypts AES-GCM-256 encrypted payload
   */
  public static async decryptText(payload: EncryptedPayload, pinOrPass: string = this.defaultPin): Promise<string> {
    const cryptoObj = this.getCrypto();
    const salt = base64ToBytes(payload.salt);
    const iv = base64ToBytes(payload.iv);
    const ciphertext = base64ToBytes(payload.ciphertext);

    const derivedKey = await this.deriveAesGcmKey(pinOrPass, salt);

    try {
      const decryptedBuffer = await cryptoObj.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv as BufferSource,
        },
        derivedKey,
        ciphertext as BufferSource
      );

      return new TextDecoder().decode(decryptedBuffer);
    } catch {
      throw new Error('فشل فك التشفير: مفتاح غير صحيح أو تم التلاعب ببيانات التشفير.');
    }
  }

  // --------------------------------------------------------------------------
  // ACCOUNTS VAULT ENCRYPTION & MIGRATION
  // --------------------------------------------------------------------------

  public static isEncrypted(value: any): value is EncryptedPayload {
    return (
      value &&
      typeof value === 'object' &&
      typeof value.ciphertext === 'string' &&
      typeof value.iv === 'string' &&
      typeof value.salt === 'string' &&
      value.algorithm === 'AES-GCM-256'
    );
  }

  /**
   * Transparently encrypts account secret before storage
   */
  public static async encryptAccountSecret(secret: string, pin: string = this.defaultPin): Promise<EncryptedPayload> {
    return await this.encryptText(secret, pin);
  }

  /**
   * Transparently decrypts account secret when viewed
   */
  public static async decryptAccountSecret(secretData: string | EncryptedPayload, pin: string = this.defaultPin): Promise<string> {
    if (typeof secretData === 'string') {
      // Check if it's JSON stringified EncryptedPayload
      try {
        const parsed = JSON.parse(secretData);
        if (this.isEncrypted(parsed)) {
          return await this.decryptText(parsed, pin);
        }
      } catch {
        // Plaintext string, return directly
        return secretData;
      }
      return secretData;
    }
    if (this.isEncrypted(secretData)) {
      return await this.decryptText(secretData, pin);
    }
    return String(secretData);
  }

  /**
   * Migrates legacy accounts vault from plaintext to AES-GCM encrypted format
   */
  public static async migrateAccountsVault(accounts: any[], pin: string = this.defaultPin): Promise<any[]> {
    const migrated: any[] = [];
    for (const acc of accounts) {
      if (acc.secret && !this.isEncrypted(acc.secret) && typeof acc.secret === 'string' && !acc.secret.startsWith('ENC:')) {
        const encrypted = await this.encryptText(acc.secret, pin);
        migrated.push({
          ...acc,
          secret: encrypted,
          encrypted: true,
          cryptoAlgorithm: 'AES-GCM-256',
        });
      } else {
        migrated.push(acc);
      }
    }
    return migrated;
  }

  // --------------------------------------------------------------------------
  // AUDIT & HEALTH STATUS
  // --------------------------------------------------------------------------

  public static getSecurityAuditSummary(accountsCount: number = 0, encryptedAccountsCount: number = 0, pendingSync: number = 0, syncConflicts: number = 0): SecurityAuditSummary {
    const lockout = this.getLockoutState();
    const storedHash = this.getStoredPinHash();
    const isLockedOut = !!lockout.lockoutUntil && Date.now() < lockout.lockoutUntil;
    const remainingAttempts = isLockedOut ? 0 : Math.max(0, MAX_FAILED_ATTEMPTS - lockout.failedAttempts);

    let rating: SecurityAuditSummary['overallSecurityRating'] = 'EXCELLENT';
    if (isLockedOut || syncConflicts > 0) {
      rating = 'ATTENTION_NEEDED';
    } else if (accountsCount > 0 && encryptedAccountsCount < accountsCount) {
      rating = 'HIGH';
    }

    return {
      pinProtectionActive: !!storedHash,
      pinAlgorithm: storedHash?.algorithm || 'PBKDF2-SHA-256 (100K iter)',
      rateLimitLockoutActive: isLockedOut,
      remainingAttempts,
      failedAttemptsCount: lockout.failedAttempts,
      vaultEncryptionActive: true,
      vaultItemsCount: accountsCount,
      encryptedItemsCount: encryptedAccountsCount,
      syncQueuePendingCount: pendingSync,
      syncConflictsCount: syncConflicts,
      overallSecurityRating: rating,
    };
  }

  // Constant-time string comparison to prevent timing attacks
  private static timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
}
