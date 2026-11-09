import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 'https://zydgpjqllgthkqabphth.supabase.co';
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5ZGdwanFsbGd0aGtxYWJwaHRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQwODA2MDksImV4cCI6MjEwOTY1NjYwOX0.rpWxWfDfRtGdjKo7NWmIY38F795r5w6sRIsgGaQo5n8';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Offline-First Local Storage Helpers
export const offlineStorage = {
  save: (key: string, data: any) => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`aqliya_${key}`, JSON.stringify(data));
      }
    } catch (e) {
      console.warn('Offline storage write failed', e);
    }
  },
  get: <T>(key: string, fallback: T): T => {
    try {
      if (typeof localStorage !== 'undefined') {
        const item = localStorage.getItem(`aqliya_${key}`);
        return item ? JSON.parse(item) : fallback;
      }
      return fallback;
    } catch (e) {
      console.warn('Offline storage read failed', e);
      return fallback;
    }
  },
  queueSyncAction: (action: { table: string; type: 'insert' | 'update' | 'delete'; data: any }) => {
    try {
      const queue = offlineStorage.get<any[]>('sync_queue', []);
      queue.push({ ...action, timestamp: new Date().toISOString() });
      offlineStorage.save('sync_queue', queue);
    } catch (e) {
      console.error('Failed to queue offline action', e);
    }
  },
  getSyncQueue: () => offlineStorage.get<any[]>('sync_queue', []),
  clearSyncQueue: () => offlineStorage.save('sync_queue', []),
};
