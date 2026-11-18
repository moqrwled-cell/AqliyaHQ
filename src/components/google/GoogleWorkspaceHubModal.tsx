// ============================================================================
// AQLIYA HQ — OFFICIAL GOOGLE WORKSPACE & ACADEMIC HUB MODAL
// Real Google OAuth 2.0 Connection Status, Calendar, Classroom, Gmail & Tasks
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  GoogleWorkspaceService, 
  type GoogleAuthState, 
  type GoogleCalendarEvent, 
  type GoogleClassroomCourse, 
  type GoogleClassroomAssignment, 
  type GoogleEmailMessage 
} from '../../lib/google/googleWorkspaceService';
import { 
  X, 
  Calendar, 
  GraduationCap, 
  Mail, 
  CheckSquare, 
  RefreshCw, 
  ExternalLink, 
  Plus, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles,
  Link2,
  LogOut,
  Clock
} from 'lucide-react';
import { tacticalAudio } from '../../lib/audio';

interface GoogleWorkspaceHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleWorkspaceHubModal: React.FC<GoogleWorkspaceHubModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [authState, setAuthState] = useState<GoogleAuthState>(() => GoogleWorkspaceService.getAuthState());
  const [activeTab, setActiveTab] = useState<'calendar' | 'classroom' | 'gmail' | 'tasks'>('classroom');

  // Input Token state for 1-tap manual connect or OAuth callback
  const [accessTokenInput, setAccessTokenInput] = useState('');
  const [clientIdInput, setClientIdInput] = useState(authState.clientId || '');
  const [isConnecting, setIsConnecting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Tab Data States
  const [calendarEvents, setCalendarEvents] = useState<GoogleCalendarEvent[]>([]);
  const [courses, setCourses] = useState<GoogleClassroomCourse[]>([]);
  const [emails, setEmails] = useState<GoogleEmailMessage[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // New Event Form State
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [eventSummary, setEventSummary] = useState('');
  const [eventTime, setEventTime] = useState('');

  useEffect(() => {
    const handleAuthChange = () => {
      setAuthState(GoogleWorkspaceService.getAuthState());
    };
    window.addEventListener('aqliya:google-auth-updated', handleAuthChange);
    return () => window.removeEventListener('aqliya:google-auth-updated', handleAuthChange);
  }, []);

  // Fetch data when active tab changes or connection occurs
  useEffect(() => {
    if (!isOpen || !authState.isConnected) return;

    const loadData = async () => {
      setIsLoadingData(true);
      if (activeTab === 'calendar') {
        const res = await GoogleWorkspaceService.listCalendarEvents(10);
        if (res.success) setCalendarEvents(res.events);
      } else if (activeTab === 'classroom') {
        const res = await GoogleWorkspaceService.listClassroomCourses();
        if (res.success) setCourses(res.courses);
      } else if (activeTab === 'gmail') {
        const res = await GoogleWorkspaceService.listClassroomEmails(10);
        if (res.success) setEmails(res.messages);
      }
      setIsLoadingData(false);
    };

    loadData();
  }, [isOpen, authState.isConnected, activeTab]);

  if (!isOpen) return null;

  const handleConnectToken = async () => {
    if (!accessTokenInput.trim()) return;
    setIsConnecting(true);
    setStatusMessage(null);
    const res = await GoogleWorkspaceService.connectWithAccessToken(accessTokenInput, clientIdInput);
    setStatusMessage(res.message);
    setIsConnecting(false);
    if (res.success) {
      setAccessTokenInput('');
    }
  };

  const handleDisconnect = () => {
    if (confirm('هل أنت متأكد من فصل حساب Google؟')) {
      GoogleWorkspaceService.disconnect();
      setStatusMessage('تم فصل حساب Google بنجاح.');
    }
  };

  const handleSyncClassroom = async () => {
    setIsLoadingData(true);
    const res = await GoogleWorkspaceService.syncClassroomToTacticalTasks();
    alert(res.message);
    setIsLoadingData(false);
  };

  const handleCreateCalendarEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventSummary.trim() || !eventTime) return;
    const res = await GoogleWorkspaceService.createCalendarEvent({
      summary: eventSummary.trim(),
      startDateTime: eventTime,
    });
    if (res.success) {
      alert('تمت إضافة الحدث بنجاح إلى تقويم جوجل!');
      setEventSummary('');
      setEventTime('');
      setShowAddEvent(false);
      // Reload calendar
      const reload = await GoogleWorkspaceService.listCalendarEvents(10);
      if (reload.success) setCalendarEvents(reload.events);
    } else {
      alert(`تعذر إنشاء الحدث: ${res.error}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-[#0a0e17] border border-white/15 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh] text-right text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="text-right">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 justify-end">
              <span>مركز تكامل Google الرسمي</span>
              <span className="text-amber-400">⚡</span>
            </h2>
            <p className="text-[10px] text-zinc-400">ربط حقيقي: التقويم، الكلاس روم، الجيميل، والمهام</p>
          </div>
        </div>

        {/* Account Connection Status Card */}
        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 mb-4 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            {authState.isConnected ? (
              <button
                onClick={handleDisconnect}
                className="px-2.5 py-1 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
                title="فصل الحساب"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>فصل</span>
              </button>
            ) : (
              <a
                href={GoogleWorkspaceService.getOAuthLoginUrl()}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>تسجيل الدخول مع Google</span>
              </a>
            )}
          </div>

          <div className="text-right flex items-center gap-2.5">
            <div>
              <div className="flex items-center gap-1.5 justify-end">
                <span className="text-xs font-bold text-white">
                  {authState.isConnected ? (authState.userName || authState.userEmail) : 'غير متصل بحساب Google'}
                </span>
                <span className={`w-2 h-2 rounded-full ${authState.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`}></span>
              </div>
              <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                {authState.isConnected ? authState.userEmail : 'استخدم OAuth الرسمي للربط الفعلي'}
              </p>
            </div>

            {authState.userAvatar ? (
              <img src={authState.userAvatar} alt="Avatar" className="w-8 h-8 rounded-full border border-white/20" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                G
              </div>
            )}
          </div>
        </div>

        {/* If not connected, offer 1-tap Token paste or manual Connect */}
        {!authState.isConnected && (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4 space-y-2 flex-shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <AlertCircle className="h-4 w-4" />
              <span>ربط سريع ومباشر عبر Access Token أو OAuth</span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              لربط التطبيق بحسابك الجامعي أو الشخصي، يمكنك الضغط على زر "تسجيل الدخول مع Google" أعلاه أو لصق رمز الوصول (Bearer Token):
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={accessTokenInput}
                onChange={(e) => setAccessTokenInput(e.target.value)}
                placeholder="ألصق Google OAuth Access Token هنا..."
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white text-right focus:outline-none focus:border-amber-400 font-mono"
              />
              <button
                onClick={handleConnectToken}
                disabled={isConnecting || !accessTokenInput.trim()}
                className="px-3 py-1.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 active:scale-95 disabled:opacity-40 transition-all"
              >
                {isConnecting ? 'جارٍ التحقق...' : 'ربط'}
              </button>
            </div>
            {statusMessage && (
              <p className="text-[10px] text-amber-200 mt-1">{statusMessage}</p>
            )}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 pb-2 border-b border-white/10 mb-3 flex-shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('classroom')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'classroom' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            <span>كلاس روم</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'calendar' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>التقويم</span>
          </button>

          <button
            onClick={() => setActiveTab('gmail')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'gmail' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            <span>جيميل</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
          {/* TAB 1: CLASSROOM */}
          {activeTab === 'classroom' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                {authState.isConnected && (
                  <button
                    onClick={handleSyncClassroom}
                    disabled={isLoadingData}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 active:scale-95 transition-all flex items-center gap-1 shadow"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
                    <span>سحب التكليفات للمهام التكتيكية</span>
                  </button>
                )}
                <span className="text-xs font-bold text-white">المساقات الدراسية الحالية</span>
              </div>

              {isLoadingData ? (
                <p className="text-center text-xs text-zinc-500 py-6">جارٍ قراءة بيانات كلاس روم من خوادم Google...</p>
              ) : !authState.isConnected ? (
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-2">
                  <GraduationCap className="h-8 w-8 text-zinc-600 mx-auto" />
                  <p className="text-xs text-zinc-400">سجل الدخول بحساب Google لعرض مساقاتك وتكليفات الكلية الحقيقية.</p>
                </div>
              ) : courses.length === 0 ? (
                <p className="text-center text-xs text-zinc-500 py-6">لم يتم العثور على مساقات نشطة حالياً في هذا الحساب.</p>
              ) : (
                courses.map((course) => (
                  <div key={course.id} className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    {course.alternateLink && (
                      <a
                        href={course.alternateLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
                        title="فتح في Google Classroom"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <div className="text-right">
                      <p className="text-xs font-bold text-white">{course.name}</p>
                      <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{course.section || 'مساق جامعي'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: CALENDAR */}
          {activeTab === 'calendar' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                {authState.isConnected && (
                  <button
                    onClick={() => setShowAddEvent(!showAddEvent)}
                    className="px-2.5 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center gap-1 active:scale-95"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>إضافة حدث</span>
                  </button>
                )}
                <span className="text-xs font-bold text-white">الأحداث والمواعيد القادمة</span>
              </div>

              {showAddEvent && (
                <form onSubmit={handleCreateCalendarEvent} className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 space-y-2.5">
                  <input
                    type="text"
                    value={eventSummary}
                    onChange={(e) => setEventSummary(e.target.value)}
                    placeholder="عنوان الحدث (مثال: اجتماع مع عميل NexusOS)..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white text-right focus:outline-none focus:border-cyan-400"
                    required
                  />
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white text-right focus:outline-none focus:border-cyan-400"
                      required
                    />
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-cyan-500 text-black font-bold text-xs hover:bg-cyan-400 active:scale-95"
                    >
                      حفظ في تقويم جوجل ↗
                    </button>
                  </div>
                </form>
              )}

              {isLoadingData ? (
                <p className="text-center text-xs text-zinc-500 py-6">جارٍ قراءة التقويم من Google Calendar...</p>
              ) : !authState.isConnected ? (
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-2">
                  <Calendar className="h-8 w-8 text-zinc-600 mx-auto" />
                  <p className="text-xs text-zinc-400">سجل الدخول لعرض أحداثك وجدولك الزمني الفعلي في Google Calendar.</p>
                </div>
              ) : calendarEvents.length === 0 ? (
                <p className="text-center text-xs text-zinc-500 py-6">لا توجد أحداث قادمة في التقويم.</p>
              ) : (
                calendarEvents.map((evt) => (
                  <div key={evt.id} className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                    {evt.htmlLink && (
                      <a
                        href={evt.htmlLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <div className="text-right">
                      <p className="text-xs font-bold text-white">{evt.summary}</p>
                      <p className="text-[10px] text-zinc-400 font-mono mt-0.5 flex items-center gap-1 justify-end">
                        <span>{new Date(evt.startDateTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                        <Clock className="h-3 w-3 text-cyan-400" />
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: GMAIL */}
          {activeTab === 'gmail' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-white block">إشعارات البريد وتكليفات الكلاس روم</span>

              {isLoadingData ? (
                <p className="text-center text-xs text-zinc-500 py-6">جارٍ فحص بريد Gmail...</p>
              ) : !authState.isConnected ? (
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center space-y-2">
                  <Mail className="h-8 w-8 text-zinc-600 mx-auto" />
                  <p className="text-xs text-zinc-400">سجل الدخول لقراءة رسائل وإشعارات كلاس روم الحقيقية من Gmail.</p>
                </div>
              ) : emails.length === 0 ? (
                <p className="text-center text-xs text-zinc-500 py-6">لا توجد رسائل كلاس روم غير مقروءة في Gmail.</p>
              ) : (
                emails.map((msg) => (
                  <div key={msg.id} className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                    <p className="text-xs font-bold text-white truncate">{msg.subject}</p>
                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{msg.snippet}</p>
                    <p className="text-[10px] text-zinc-500 font-mono text-left">{msg.from}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
