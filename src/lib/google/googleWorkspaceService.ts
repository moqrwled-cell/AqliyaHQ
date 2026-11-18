// ============================================================================
// AQLIYA HQ — OFFICIAL GOOGLE WORKSPACE & ACADEMIC INTEGRATION SERVICE
// Real Google OAuth 2.0 Client & REST API connectors for:
// 1. Google Calendar API (v3)
// 2. Gmail API (v1)
// 3. Google Classroom API (v1)
// 4. Google Tasks API (v1)
// ============================================================================

import { tacticalAudio } from '../audio';
import { UnifiedStorage } from '../storage/unifiedStorage';

export interface GoogleAuthState {
  isConnected: boolean;
  userEmail?: string;
  userName?: string;
  userAvatar?: string;
  accessToken?: string;
  expiresAt?: number;
  clientId?: string;
  lastSyncedAt?: string;
  error?: string;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  startDateTime: string;
  endDateTime?: string;
  htmlLink?: string;
  location?: string;
}

export interface GoogleClassroomCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  alternateLink?: string;
}

export interface GoogleClassroomAssignment {
  id: string;
  courseId: string;
  courseName?: string;
  title: string;
  description?: string;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  alternateLink?: string;
  maxPoints?: number;
  state: 'PUBLISHED' | 'DRAFT';
}

export interface GoogleEmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  subject?: string;
  from?: string;
  date?: string;
}

export interface GoogleTaskItem {
  id: string;
  title: string;
  notes?: string;
  due?: string;
  status: 'needsAction' | 'completed';
}

const STORAGE_KEY_AUTH = 'aqliya_google_auth_state_v1';
const DEFAULT_CLIENT_ID = '1047587848981-mock.apps.googleusercontent.com';

const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me',
  'https://www.googleapis.com/auth/tasks',
].join(' ');

export class GoogleWorkspaceService {
  /**
   * Read stored Google Auth state
   */
  public static getAuthState(): GoogleAuthState {
    if (typeof localStorage === 'undefined') {
      return { isConnected: false };
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AUTH);
      if (raw) {
        const parsed: GoogleAuthState = JSON.parse(raw);
        // Check token expiration
        if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
          return {
            ...parsed,
            isConnected: false,
            error: 'انتهت صلاحية جلسة تسجيل الدخول، يرجى إعادة الاتصال بحساب Google.',
          };
        }
        return parsed;
      }
    } catch (e) {
      console.warn('Failed reading Google auth state', e);
    }
    return { isConnected: false };
  }

  /**
   * Save Google Auth state
   */
  public static saveAuthState(state: Partial<GoogleAuthState>): GoogleAuthState {
    const current = this.getAuthState();
    const updated: GoogleAuthState = { ...current, ...state };
    try {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('aqliya:google-auth-updated', { detail: updated }));
    } catch (e) {
      console.error('Failed saving Google auth state', e);
    }
    return updated;
  }

  /**
   * Connect via Google OAuth Access Token
   */
  public static async connectWithAccessToken(token: string, clientId?: string): Promise<{ success: boolean; message: string; user?: any }> {
    try {
      const trimmed = token.trim();
      if (!trimmed) throw new Error('رمز الوصول Access Token مطلوب');

      // Verify token and fetch user profile from Google UserInfo endpoint
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${trimmed}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error_description || err.error || 'رمز الوصول غير صالح أو منتهي الصلاحية');
      }

      const profile = await res.json();
      const expiresAt = Date.now() + 3600 * 1000; // 1 hour typical token lifespan

      this.saveAuthState({
        isConnected: true,
        accessToken: trimmed,
        userEmail: profile.email,
        userName: profile.name,
        userAvatar: profile.picture,
        expiresAt,
        clientId: clientId || this.getAuthState().clientId || DEFAULT_CLIENT_ID,
        lastSyncedAt: new Date().toISOString(),
        error: undefined,
      });

      tacticalAudio.playSuccess();
      return {
        success: true,
        message: `تم ربط حساب Google بنجاح: ${profile.email}`,
        user: profile,
      };
    } catch (err: any) {
      tacticalAudio.playAlert();
      this.saveAuthState({ isConnected: false, error: err.message });
      return { success: false, message: `فشل الاتصال بحساب Google: ${err.message}` };
    }
  }

  /**
   * Generate official OAuth 2.0 Login URL for browser or webview
   */
  public static getOAuthLoginUrl(clientId?: string): string {
    const cid = clientId || this.getAuthState().clientId || DEFAULT_CLIENT_ID;
    const redirectUri = window.location.origin;
    const params = new URLSearchParams({
      client_id: cid,
      redirect_uri: redirectUri,
      response_type: 'token',
      scope: GOOGLE_SCOPES,
      include_granted_scopes: 'true',
      prompt: 'consent',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Disconnect Google Account
   */
  public static disconnect(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_AUTH);
      window.dispatchEvent(new CustomEvent('aqliya:google-auth-updated', { detail: { isConnected: false } }));
      tacticalAudio.playBlip();
    } catch (e) {}
  }

  // ==========================================================================
  // 1. GOOGLE CALENDAR API
  // ==========================================================================
  public static async listCalendarEvents(maxResults = 10): Promise<{ success: boolean; events: GoogleCalendarEvent[]; error?: string }> {
    const auth = this.getAuthState();
    if (!auth.isConnected || !auth.accessToken) {
      return { success: false, events: [], error: 'غير متصل بحساب Google' };
    }

    try {
      const now = new Date().toISOString();
      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
        now
      )}&singleEvents=true&orderBy=startTime&maxResults=${maxResults}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const items: GoogleCalendarEvent[] = (data.items || []).map((item: any) => ({
        id: item.id,
        summary: item.summary || 'حدث بدون عنوان',
        description: item.description,
        startDateTime: item.start?.dateTime || item.start?.date || '',
        endDateTime: item.end?.dateTime || item.end?.date,
        htmlLink: item.htmlLink,
        location: item.location,
      }));

      return { success: true, events: items };
    } catch (err: any) {
      return { success: false, events: [], error: err.message };
    }
  }

  public static async createCalendarEvent(params: {
    summary: string;
    startDateTime: string;
    endDateTime?: string;
    description?: string;
  }): Promise<{ success: boolean; event?: GoogleCalendarEvent; error?: string }> {
    const auth = this.getAuthState();
    if (!auth.isConnected || !auth.accessToken) {
      return { success: false, error: 'غير متصل بحساب Google' };
    }

    try {
      let startIso = params.startDateTime;
      let endIso = params.endDateTime;

      // Handle HH:mm format by attaching today's date
      if (!startIso.includes('T')) {
        const todayStr = new Date().toISOString().split('T')[0];
        startIso = `${todayStr}T${params.startDateTime}:00Z`;
        const startD = new Date(startIso);
        startD.setHours(startD.getHours() + 1);
        endIso = startD.toISOString();
      }

      if (!endIso) {
        const startD = new Date(startIso);
        startD.setHours(startD.getHours() + 1);
        endIso = startD.toISOString();
      }

      const body = {
        summary: params.summary,
        description: params.description || 'تم إنشاؤه عبر نظام عقلية HQ الذكي (Jarvis)',
        start: { dateTime: startIso },
        end: { dateTime: endIso },
      };

      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }

      const created = await res.json();
      tacticalAudio.playSuccess();
      return {
        success: true,
        event: {
          id: created.id,
          summary: created.summary,
          startDateTime: created.start?.dateTime || startIso,
          htmlLink: created.htmlLink,
        },
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // ==========================================================================
  // 2. GOOGLE CLASSROOM API
  // ==========================================================================
  public static async listClassroomCourses(): Promise<{ success: boolean; courses: GoogleClassroomCourse[]; error?: string }> {
    const auth = this.getAuthState();
    if (!auth.isConnected || !auth.accessToken) {
      return { success: false, courses: [], error: 'غير متصل بحساب Google' };
    }

    try {
      const res = await fetch('https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE', {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const courses: GoogleClassroomCourse[] = (data.courses || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        section: c.section,
        descriptionHeading: c.descriptionHeading,
        alternateLink: c.alternateLink,
      }));

      return { success: true, courses };
    } catch (err: any) {
      return { success: false, courses: [], error: err.message };
    }
  }

  public static async listCourseWork(courseId: string): Promise<{ success: boolean; assignments: GoogleClassroomAssignment[]; error?: string }> {
    const auth = this.getAuthState();
    if (!auth.isConnected || !auth.accessToken) {
      return { success: false, assignments: [], error: 'غير متصل بحساب Google' };
    }

    try {
      const res = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const assignments: GoogleClassroomAssignment[] = (data.courseWork || []).map((cw: any) => {
        let dueDate: string | undefined = undefined;
        let dueTime: string | undefined = undefined;
        if (cw.dueDate) {
          dueDate = `${cw.dueDate.year}-${String(cw.dueDate.month).padStart(2, '0')}-${String(cw.dueDate.day).padStart(2, '0')}`;
        }
        if (cw.dueTime) {
          dueTime = `${String(cw.dueTime.hours || 0).padStart(2, '0')}:${String(cw.dueTime.minutes || 0).padStart(2, '0')}`;
        }
        return {
          id: cw.id,
          courseId,
          title: cw.title,
          description: cw.description,
          dueDate,
          dueTime,
          alternateLink: cw.alternateLink,
          maxPoints: cw.maxPoints,
          state: cw.state,
        };
      });

      return { success: true, assignments };
    } catch (err: any) {
      return { success: false, assignments: [], error: err.message };
    }
  }

  /**
   * Sync all pending Classroom assignments into AqliyaHQ Tactical Tasks
   */
  public static async syncClassroomToTacticalTasks(): Promise<{ success: boolean; importedCount: number; message: string }> {
    const coursesRes = await this.listClassroomCourses();
    if (!coursesRes.success || coursesRes.courses.length === 0) {
      return { success: false, importedCount: 0, message: coursesRes.error || 'لا توجد مساقات مسجلة في كلاس روم' };
    }

    let count = 0;
    for (const course of coursesRes.courses) {
      const cwRes = await this.listCourseWork(course.id);
      if (cwRes.success && cwRes.assignments) {
        for (const assign of cwRes.assignments) {
          // Check if already in tasks
          const existing = UnifiedStorage.getTasks().some((t) => t.title.includes(assign.title));
          if (!existing) {
            UnifiedStorage.addTask({
              title: `[كلاس روم: ${course.name}] ${assign.title}`,
              quadrant: 'urgent_important',
              dueDate: assign.dueDate,
              dueTime: assign.dueTime,
              source: 'classroom',
              isCompleted: false,
            });
            count++;
          }
        }
      }
    }

    tacticalAudio.playSuccess();
    return {
      success: true,
      importedCount: count,
      message: `تمت مزامنة تكليفات الكلاس روم بنجاح. أضيف (${count}) تكليف جديد للمهام التكتيكية.`,
    };
  }

  // ==========================================================================
  // 3. GMAIL API
  // ==========================================================================
  public static async listClassroomEmails(maxResults = 10): Promise<{ success: boolean; messages: GoogleEmailMessage[]; error?: string }> {
    const auth = this.getAuthState();
    if (!auth.isConnected || !auth.accessToken) {
      return { success: false, messages: [], error: 'غير متصل بحساب Google' };
    }

    try {
      const q = encodeURIComponent('from:classroom.google.com OR subject:classroom OR subject:تكليف');
      const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${q}&maxResults=${maxResults}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const rawMessages = data.messages || [];
      const detailed: GoogleEmailMessage[] = [];

      for (const m of rawMessages.slice(0, 5)) {
        const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata`, {
          headers: { Authorization: `Bearer ${auth.accessToken}` },
        });
        if (detailRes.ok) {
          const detail = await detailRes.json();
          const headers: any[] = detail.payload?.headers || [];
          const subject = headers.find((h) => h.name.toLowerCase() === 'subject')?.value || 'إشعار كلاس روم';
          const from = headers.find((h) => h.name.toLowerCase() === 'from')?.value || '';
          detailed.push({
            id: m.id,
            threadId: m.threadId,
            snippet: detail.snippet || '',
            subject,
            from,
          });
        }
      }

      return { success: true, messages: detailed };
    } catch (err: any) {
      return { success: false, messages: [], error: err.message };
    }
  }

  public static async createDraft(to: string, subject: string, bodyText: string): Promise<{ success: boolean; error?: string }> {
    const auth = this.getAuthState();
    if (!auth.isConnected || !auth.accessToken) {
      return { success: false, error: 'غير متصل بحساب Google' };
    }

    try {
      const rawEmail = [
        `To: ${to}`,
        `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
        'Content-Type: text/plain; charset=utf-8',
        '',
        bodyText,
      ].join('\r\n');

      const encoded = btoa(unescape(encodeURIComponent(rawEmail))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: { raw: encoded } }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }

      tacticalAudio.playSuccess();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  // ==========================================================================
  // 4. GOOGLE TASKS API
  // ==========================================================================
  public static async listTasks(): Promise<{ success: boolean; tasks: GoogleTaskItem[]; error?: string }> {
    const auth = this.getAuthState();
    if (!auth.isConnected || !auth.accessToken) {
      return { success: false, tasks: [], error: 'غير متصل بحساب Google' };
    }

    try {
      const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const items: GoogleTaskItem[] = (data.items || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        notes: t.notes,
        due: t.due,
        status: t.status,
      }));

      return { success: true, tasks: items };
    } catch (err: any) {
      return { success: false, tasks: [], error: err.message };
    }
  }

  public static async createTask(title: string, notes?: string, due?: string): Promise<{ success: boolean; task?: GoogleTaskItem; error?: string }> {
    const auth = this.getAuthState();
    if (!auth.isConnected || !auth.accessToken) {
      return { success: false, error: 'غير متصل بحساب Google' };
    }

    try {
      const res = await fetch('https://tasks.googleapis.com/tasks/v1/lists/@default/tasks', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, notes, due }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `HTTP ${res.status}`);
      }

      const created = await res.json();
      tacticalAudio.playSuccess();
      return {
        success: true,
        task: {
          id: created.id,
          title: created.title,
          notes: created.notes,
          due: created.due,
          status: created.status,
        },
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
}
