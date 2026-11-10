// ============================================================================
// AQLIYA AGENTIC OS — OFFLINE, SYNC & SECURITY TYPES
// ============================================================================

export type SyncActionType = 'insert' | 'update' | 'delete';

export type SyncActionStatus = 'pending' | 'syncing' | 'synced' | 'conflict' | 'failed';

export interface SyncAction {
  id: string;
  table: string;
  type: SyncActionType;
  data: any;
  clientTimestamp: string;
  sequenceNumber: number;
  retryCount: number;
  maxRetries: number;
  status: SyncActionStatus;
  errorDetails?: string;
  resolvedAt?: string;
}

export type ConflictType = 'version_mismatch' | 'concurrent_modification' | 'deleted_remotely';

export interface ConflictDetectionResult {
  hasConflict: boolean;
  conflictType?: ConflictType;
  localAction?: SyncAction;
  remoteState?: any;
  detectedAt: string;
}

export type ConflictResolutionStrategy = 
  | 'commander_precedence'  // Local Commander changes override remote (default)
  | 'last_write_wins'       // Higher timestamp wins
  | 'remote_precedence'     // Remote database wins
  | 'manual_review';        // Flagged for Commander explicit review

export interface ResolvedConflict {
  actionId: string;
  table: string;
  strategy: ConflictResolutionStrategy;
  winner: 'local' | 'remote' | 'merged';
  appliedData: any;
  resolvedAt: string;
}

export interface SyncStats {
  pendingCount: number;
  syncedCount: number;
  conflictCount: number;
  failedCount: number;
  isOnline: boolean;
  lastSyncTimestamp: string | null;
  currentSequence: number;
}

// ----------------------------------------------------------------------------
// SECURITY & CRYPTO TYPES
// ----------------------------------------------------------------------------

export interface EncryptedPayload {
  ciphertext: string;  // Base64 encoded
  iv: string;          // Base64 encoded (12 bytes for AES-GCM)
  salt: string;        // Base64 encoded (16 bytes for PBKDF2)
  version: number;     // Crypto scheme version (default 1)
  algorithm: 'AES-GCM-256';
  createdAt: string;
}

export interface StoredPinHash {
  salt: string;        // Base64
  hash: string;        // Base64
  iterations: number;  // Default 100,000
  algorithm: 'PBKDF2-SHA-256';
  updatedAt: string;
}

export interface PinVerificationResult {
  success: boolean;
  lockedOut: boolean;
  remainingAttempts: number;
  lockoutDurationMs?: number;
  lockoutUntil?: number;
  error?: string;
}

export interface SecurityAuditSummary {
  pinProtectionActive: boolean;
  pinAlgorithm: string;
  rateLimitLockoutActive: boolean;
  remainingAttempts: number;
  failedAttemptsCount: number;
  vaultEncryptionActive: boolean;
  vaultItemsCount: number;
  encryptedItemsCount: number;
  syncQueuePendingCount: number;
  syncConflictsCount: number;
  overallSecurityRating: 'EXCELLENT' | 'HIGH' | 'ATTENTION_NEEDED';
}
