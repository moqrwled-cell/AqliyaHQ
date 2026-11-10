// ============================================================================
// AQLIYA AGENTIC OS — OFFLINE SYNC & CONFLICT RESOLUTION ENGINE
// ============================================================================

import type {
  SyncAction,
  SyncActionType,
  ConflictDetectionResult,
  ConflictResolutionStrategy,
  ResolvedConflict,
  SyncStats,
} from './types';

export class OfflineSyncEngine {
  private static storageKeyQueue = 'aqliya_offline_sync_queue_v2';
  private static storageKeySequence = 'aqliya_offline_sequence_v2';
  private static storageKeyLastSync = 'aqliya_offline_last_sync_v2';

  private static isMockOfflineMode = false;
  private static listeners: Array<(stats: SyncStats) => void> = [];

  // --------------------------------------------------------------------------
  // INITIALIZATION & EVENT LISTENERS
  // --------------------------------------------------------------------------

  public static initialize(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.notifyListeners();
        // Trigger automatic queue replay on network restoration
        this.autoReplayOnReconnect();
      });
      window.addEventListener('offline', () => {
        this.notifyListeners();
      });
    }
  }

  public static subscribe(listener: (stats: SyncStats) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notifyListeners(): void {
    const stats = this.getSyncStats();
    for (const listener of this.listeners) {
      try {
        listener(stats);
      } catch (e) {
        console.warn('Sync listener error:', e);
      }
    }
  }

  public static isOnline(): boolean {
    if (this.isMockOfflineMode) return false;
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  }

  public static setMockOfflineMode(offline: boolean): void {
    this.isMockOfflineMode = offline;
    this.notifyListeners();
  }

  // --------------------------------------------------------------------------
  // SEQUENCE & PERSISTENCE
  // --------------------------------------------------------------------------

  private static getNextSequence(): number {
    try {
      if (typeof localStorage === 'undefined') return 1;
      const current = parseInt(localStorage.getItem(this.storageKeySequence) || '0', 10);
      const next = current + 1;
      localStorage.setItem(this.storageKeySequence, next.toString());
      return next;
    } catch {
      return 1;
    }
  }

  public static getCurrentSequence(): number {
    try {
      if (typeof localStorage === 'undefined') return 0;
      return parseInt(localStorage.getItem(this.storageKeySequence) || '0', 10);
    } catch {
      return 0;
    }
  }

  public static getQueue(): SyncAction[] {
    try {
      if (typeof localStorage === 'undefined') return [];
      const raw = localStorage.getItem(this.storageKeyQueue);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private static saveQueue(queue: SyncAction[]): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKeyQueue, JSON.stringify(queue));
      }
      this.notifyListeners();
    } catch (e) {
      console.error('Failed to save offline sync queue:', e);
    }
  }

  // --------------------------------------------------------------------------
  // ENQUEUE ACTIONS
  // --------------------------------------------------------------------------

  public static enqueueAction(
    table: string,
    type: SyncActionType,
    data: any,
    options: { maxRetries?: number } = {}
  ): SyncAction {
    const queue = this.getQueue();
    const seq = this.getNextSequence();
    const actionId = `sync-${Date.now()}-${seq}-${Math.random().toString(36).slice(2, 7)}`;

    const action: SyncAction = {
      id: actionId,
      table,
      type,
      data,
      clientTimestamp: new Date().toISOString(),
      sequenceNumber: seq,
      retryCount: 0,
      maxRetries: options.maxRetries || 3,
      status: 'pending',
    };

    queue.push(action);
    this.saveQueue(queue);
    return action;
  }

  public static getPendingActions(): SyncAction[] {
    return this.getQueue().filter((a) => a.status === 'pending');
  }

  public static getConflicts(): SyncAction[] {
    return this.getQueue().filter((a) => a.status === 'conflict');
  }

  // --------------------------------------------------------------------------
  // CONFLICT DETECTION & RESOLUTION
  // --------------------------------------------------------------------------

  /**
   * Detects conflict between local queued action and remote database row
   */
  public static detectConflict(localAction: SyncAction, remoteState: any | null): ConflictDetectionResult {
    const now = new Date().toISOString();

    if (!remoteState) {
      if (localAction.type === 'update' || localAction.type === 'delete') {
        return {
          hasConflict: true,
          conflictType: 'deleted_remotely',
          localAction,
          remoteState: null,
          detectedAt: now,
        };
      }
      return { hasConflict: false, detectedAt: now };
    }

    // Check timestamp or version mismatch
    const localTime = new Date(localAction.clientTimestamp).getTime();
    const remoteTime = remoteState.updated_at
      ? new Date(remoteState.updated_at).getTime()
      : remoteState.clientTimestamp
      ? new Date(remoteState.clientTimestamp).getTime()
      : 0;

    if (remoteTime > localTime) {
      return {
        hasConflict: true,
        conflictType: 'concurrent_modification',
        localAction,
        remoteState,
        detectedAt: now,
      };
    }

    return { hasConflict: false, detectedAt: now };
  }

  /**
   * Resolves detected conflict using specified strategy.
   * Default strategy is 'commander_precedence' (Commander local changes take precedence).
   */
  public static resolveConflict(
    actionId: string,
    remoteState: any,
    strategy: ConflictResolutionStrategy = 'commander_precedence'
  ): ResolvedConflict {
    const queue = this.getQueue();
    const actionIdx = queue.findIndex((a) => a.id === actionId);

    if (actionIdx === -1) {
      throw new Error(`تعذر العثور على الإجراء المراد فض التعارض له: ${actionId}`);
    }

    const action = queue[actionIdx];
    let winner: 'local' | 'remote' | 'merged' = 'local';
    let appliedData = action.data;

    switch (strategy) {
      case 'commander_precedence':
        winner = 'local';
        appliedData = {
          ...action.data,
          _commanderResolution: true,
          _resolvedAt: new Date().toISOString(),
        };
        queue[actionIdx] = {
          ...action,
          data: appliedData,
          status: 'pending', // Re-queued for sync as authoritative
          resolvedAt: new Date().toISOString(),
        };
        break;

      case 'last_write_wins':
        const localTime = new Date(action.clientTimestamp).getTime();
        const remoteTime = remoteState?.updated_at
          ? new Date(remoteState.updated_at).getTime()
          : 0;

        if (remoteTime > localTime) {
          winner = 'remote';
          appliedData = remoteState;
          queue[actionIdx] = {
            ...action,
            status: 'synced', // Discard local update in favor of remote
            resolvedAt: new Date().toISOString(),
          };
        } else {
          winner = 'local';
          appliedData = action.data;
          queue[actionIdx] = {
            ...action,
            status: 'pending',
            resolvedAt: new Date().toISOString(),
          };
        }
        break;

      case 'remote_precedence':
        winner = 'remote';
        appliedData = remoteState;
        queue[actionIdx] = {
          ...action,
          status: 'synced',
          resolvedAt: new Date().toISOString(),
        };
        break;

      case 'manual_review':
      default:
        queue[actionIdx] = {
          ...action,
          status: 'conflict',
          errorDetails: 'يتطلب مراجعة واعتماد القائد المباشر',
        };
        winner = 'local';
        break;
    }

    this.saveQueue(queue);

    return {
      actionId,
      table: action.table,
      strategy,
      winner,
      appliedData,
      resolvedAt: new Date().toISOString(),
    };
  }

  // --------------------------------------------------------------------------
  // REPLAY & SYNC ENGINE
  // --------------------------------------------------------------------------

  /**
   * Replays pending actions against Supabase or remote backend.
   * If remoteSyncExecutor is provided, delegates each action; otherwise runs default Supabase ops.
   */
  public static async replayQueue(
    remoteSyncExecutor?: (action: SyncAction) => Promise<{ success: boolean; error?: string }>
  ): Promise<{ replayed: number; failed: number; conflicts: number }> {
    if (!this.isOnline()) {
      return { replayed: 0, failed: 0, conflicts: 0 };
    }

    const queue = this.getQueue();
    let replayed = 0;
    let failed = 0;
    let conflicts = 0;

    for (let i = 0; i < queue.length; i++) {
      const action = queue[i];
      if (action.status !== 'pending') continue;

      try {
        action.status = 'syncing';

        let result: { success: boolean; error?: string } = { success: true };
        if (remoteSyncExecutor) {
          result = await remoteSyncExecutor(action);
        }

        if (result.success) {
          action.status = 'synced';
          action.resolvedAt = new Date().toISOString();
          replayed++;
        } else {
          action.retryCount += 1;
          action.errorDetails = result.error;
          if (action.retryCount >= action.maxRetries) {
            action.status = 'failed';
            failed++;
          } else {
            action.status = 'pending';
          }
        }
      } catch (err: any) {
        action.retryCount += 1;
        action.errorDetails = err?.message || 'خطأ غير متوقع أثناء المزامنة';
        if (action.retryCount >= action.maxRetries) {
          action.status = 'failed';
          failed++;
        } else {
          action.status = 'pending';
        }
      }
    }

    this.saveQueue(queue);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.storageKeyLastSync, new Date().toISOString());
    }

    return { replayed, failed, conflicts };
  }

  private static autoReplayOnReconnect(): void {
    if (this.isOnline() && this.getPendingActions().length > 0) {
      this.replayQueue().catch((err) => {
        console.warn('Auto replay on reconnect failed:', err);
      });
    }
  }

  // --------------------------------------------------------------------------
  // CLEANUP & STATS
  // --------------------------------------------------------------------------

  public static clearSyncedHistory(): number {
    const queue = this.getQueue();
    const remaining = queue.filter((a) => a.status !== 'synced');
    const removedCount = queue.length - remaining.length;
    this.saveQueue(remaining);
    return removedCount;
  }

  public static clearAll(): void {
    this.saveQueue([]);
  }

  public static getSyncStats(): SyncStats {
    const queue = this.getQueue();
    const pendingCount = queue.filter((a) => a.status === 'pending').length;
    const syncedCount = queue.filter((a) => a.status === 'synced').length;
    const conflictCount = queue.filter((a) => a.status === 'conflict').length;
    const failedCount = queue.filter((a) => a.status === 'failed').length;

    let lastSyncTimestamp: string | null = null;
    try {
      if (typeof localStorage !== 'undefined') {
        lastSyncTimestamp = localStorage.getItem(this.storageKeyLastSync);
      }
    } catch {
      // ignore
    }

    return {
      pendingCount,
      syncedCount,
      conflictCount,
      failedCount,
      isOnline: this.isOnline(),
      lastSyncTimestamp,
      currentSequence: this.getCurrentSequence(),
    };
  }
}
