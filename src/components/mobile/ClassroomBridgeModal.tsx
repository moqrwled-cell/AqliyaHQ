import React, { useState, useEffect } from 'react';
import { 
  ClassroomEngine,
  type ClassroomCourse 
} from '../../lib/classroom/classroomEngine';
import { 
  GmailClassroomBridge,
  type GmailClassroomConfig,
  type ParsedClassroomEmail 
} from '../../lib/classroom/gmailClassroomBridge';
import { VideoAnalysisEngine } from '../../lib/videoAnalysisEngine';
import { 
  GraduationCap, 
  X, 
  Sparkles, 
  ExternalLink, 
  Plus, 
  BookOpen, 
  Check, 
  Mail,
  RefreshCw,
  BellRing,
  Terminal,
  Copy,
  ShieldCheck,
  Zap,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { tacticalAudio } from '../../lib/audio';

interface ClassroomBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskAdded?: () => void;
}

export const ClassroomBridgeModal: React.FC<ClassroomBridgeModalProps> = ({ 
  isOpen, 
  onClose,
  onTaskAdded 
}) => {
  const [courses, setCourses] = useState<ClassroomCourse[]>(() => ClassroomEngine.getCourses());
  const [announcementText, setAnnouncementText] = useState('');
  const [parseResult, setParseResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'gmail' | 'import' | 'courses' | 'ytdlp'>('gmail');

  // Gmail Bridge State
  const [gmailConfig, setGmailConfig] = useState<GmailClassroomConfig>(() => GmailClassroomBridge.getConfig());
  const [emailInput, setEmailInput] = useState(gmailConfig.emailAddress || '');
  const [isSyncingGmail, setIsSyncingGmail] = useState(false);
  const [gmailSyncResult, setGmailSyncResult] = useState<string | null>(null);

  // Termux YT-DLP Local Engine State
  const [isLocalDaemonActive, setIsLocalDaemonActive] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);

  // New course form
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseUrl, setNewCourseUrl] = useState('https://classroom.google.com');
  const [newCourseSchedule, setNewCourseSchedule] = useState('');

  useEffect(() => {
    if (isOpen) {
      setGmailConfig(GmailClassroomBridge.getConfig());
      // Check local Termux YT-DLP Daemon health
      VideoAnalysisEngine.checkLocalDaemonHealth().then(active => {
        setIsLocalDaemonActive(active);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLinkEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    const updated = GmailClassroomBridge.linkAccount(emailInput.trim());
    setGmailConfig(updated);
    setGmailSyncResult(`تم ربط البريد الأكاديمي بنجاح: ${emailInput.trim()}`);
    setTimeout(() => setGmailSyncResult(null), 4000);
  };

  const handleUnlinkEmail = () => {
    const updated = GmailClassroomBridge.unlinkAccount();
    setGmailConfig(updated);
    setEmailInput('');
  };

  const handleSyncGmailNow = async () => {
    setIsSyncingGmail(true);
    setGmailSyncResult('جارٍ فحص رسائل الكلاس روم والتكليفات الحديثة...');
    tacticalAudio.playBlip();

    try {
      const res = await GmailClassroomBridge.syncClassroomEmails();
      setGmailSyncResult(res.message);
      if (res.tasksAdded.length > 0 && onTaskAdded) {
        onTaskAdded();
      }
    } catch (err: any) {
      setGmailSyncResult(`فشل الفحص: ${err.message || 'حدث خطأ غير متوقع'}`);
    } finally {
      setIsSyncingGmail(false);
      setTimeout(() => setGmailSyncResult(null), 5000);
    }
  };

  const handleParseText = () => {
    if (!announcementText.trim()) return;
    const result = ClassroomEngine.parseClassroomAnnouncement(announcementText);
    setParseResult(result.summary);
    setAnnouncementText('');
    if (onTaskAdded) {
      onTaskAdded();
    }
    setTimeout(() => {
      setParseResult(null), 4000;
    });
  };

  const handleAddCourse = () => {
    if (!newCourseName.trim()) return;
    const updated = ClassroomEngine.addCourse({
      name: newCourseName.trim(),
      classroomUrl: newCourseUrl.trim() || 'https://classroom.google.com',
      scheduleDescription: newCourseSchedule.trim() || 'مقرر دراسي بالكلية التطبيقية',
    });
    setCourses([...updated]);
    setNewCourseName('');
    setNewCourseSchedule('');
    setShowAddCourse(false);
  };

  const handleDeleteCourse = (id: string) => {
    const updated = ClassroomEngine.deleteCourse(id);
    setCourses([...updated]);
  };

  const termuxSetupCommand = 'pkg update -y && pkg install -y python ffmpeg curl && curl -sSL "https://raw.githubusercontent.com/moqrwled-cell/AqliyaHQ/main/scripts/setup-termux.sh" -o setup.sh && bash setup.sh';

  const handleCopyTermuxCommand = () => {
    try {
      navigator.clipboard.writeText(termuxSetupCommand);
      setCopiedCommand(true);
      tacticalAudio.playBlip();
      setTimeout(() => setCopiedCommand(false), 2500);
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-[#090d16] border border-blue-500/30 shadow-2xl p-4 sm:p-5 text-right font-sans max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-shrink-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div>
              <h3 className="text-base font-bold text-white">جسر الكلاس روم ومحركات الأندرويد</h3>
              <p className="text-[11px] text-zinc-400">مراقبة التكليفات الأكاديمية ومحرك YT-DLP المحلي</p>
            </div>
            <div className="p-2 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/[0.03] border border-white/5 my-3 flex-shrink-0 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('gmail')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
              activeTab === 'gmail'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Mail className="h-3.5 w-3.5" />
            <span>ربط البريد والإشعارات</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
              activeTab === 'import'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>استيراد سريع</span>
          </button>

          <button
            onClick={() => setActiveTab('courses')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
              activeTab === 'courses'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>مساقاتي ({courses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ytdlp')}
            className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center justify-center gap-1 ${
              activeTab === 'ytdlp'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>YT-DLP الجوال</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto space-y-4 py-1 flex-1 text-xs">
          
          {/* ==================================================================== */}
          {/* TAB 1: GMAIL & ANDROID NOTIFICATION BRIDGE */}
          {/* ==================================================================== */}
          {activeTab === 'gmail' && (
            <div className="space-y-3.5">
              
              {/* Status Banner */}
              <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/20 text-zinc-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-blue-400" />
                    <span className="font-bold text-white">الربط الرسمي لكلاس روم عبر Gmail</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    gmailConfig.isLinked 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                      : 'bg-zinc-800 text-zinc-400 border-white/10'
                  }`}>
                    {gmailConfig.isLinked ? 'متصل بنجاح 🟢' : 'جاهز للربط'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  يقوم Moha Agent بفحص رسائل الكلاس روم التلقائية الواردة لبريدك واستخراج الواجبات، التكليفات، ومواعيد التسليم وجدولتها في <strong>شاشة القفل ومصفوفة أيزنهاور</strong> فوراً.
                </p>
              </div>

              {gmailSyncResult && (
                <div className="p-3 rounded-2xl bg-blue-500/20 border border-blue-500/40 text-blue-200 text-xs flex items-center justify-between animate-in zoom-in-95">
                  <span className="font-semibold">{gmailSyncResult}</span>
                  <Check className="h-4 w-4 text-blue-400" />
                </div>
              )}

              {/* Form: Link Email */}
              <form onSubmit={handleLinkEmail} className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2.5">
                <label className="text-zinc-300 font-bold block">
                  البريد الجامعي / حساب جوجل للكلاس روم:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="student@college.edu.ps أو gmail.com..."
                    className="flex-1 p-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs outline-none focus:border-blue-500"
                    required
                  />
                  {gmailConfig.isLinked ? (
                    <button
                      type="button"
                      onClick={handleUnlinkEmail}
                      className="px-3 py-2.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 font-bold transition-all"
                    >
                      فصل
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all active:scale-95 shadow"
                    >
                      ربط الحساب
                    </button>
                  )}
                </div>
              </form>

              {/* Sync Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSyncGmailNow}
                  disabled={isSyncingGmail}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${isSyncingGmail ? 'animate-spin' : ''}`} />
                  <span>فحص بريد الكلاس روم وسحب الواجبات الآن</span>
                </button>
              </div>

              {/* Android Native Notification Interception (Companion Assistant) */}
              <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/25 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BellRing className="h-4 w-4 text-emerald-400" />
                    <span className="font-bold text-white">مساعد إشعارات أندرويد الذكي (Listener)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    مفعّل مدمجاً
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  إذا وصلك أي إشعار على شاشة هاتفك من تطبيق <strong>Gmail</strong> أو <strong>Google Classroom</strong> عن واجب أو اختبار، يقوم هذا المساعد بالتقاطه وتفريغه في مصفوفة مهام اليوم تلقائياً وبدون أي تدخل منك!
                </p>
              </div>

            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 2: SMART MANUAL IMPORTER */}
          {/* ==================================================================== */}
          {activeTab === 'import' && (
            <div className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-blue-950/30 border border-blue-500/20 text-xs text-blue-200/90 leading-relaxed">
                ✨ <strong>التقاط المواعيد بذكاء:</strong> انسخ أي إعلان نزله دكتور المادة، أو موعد اختبار، أو رابط لقاء وجاهي من الكلاس روم أو قروب الواتساب، والصقه هنا. سيقوم Moha Agent بتحليله وجدولته مباشرة في شاشة القفل وخطة اليوم!
              </div>

              {parseResult && (
                <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between animate-in zoom-in-95">
                  <span className="font-semibold">{parseResult}</span>
                  <Check className="h-4 w-4 text-emerald-400" />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5">
                  الصق نص الإعلان أو الواجب من كلاس روم:
                </label>
                <textarea
                  rows={4}
                  value={announcementText}
                  onChange={e => setAnnouncementText(e.target.value)}
                  placeholder="مثال: إعلان هام لطلاب إدارة أعمال تكنولوجيا: سيكون هناك اختبار نصفي يوم الأحد القادم الساعة 10:00 صباحاً في قاعة 204..."
                  className="w-full p-3 rounded-2xl bg-black/40 border border-white/10 text-xs text-white placeholder-zinc-500 outline-none focus:border-blue-500/50 leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleParseText}
                  disabled={!announcementText.trim()}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-white font-extrabold text-xs shadow-lg shadow-blue-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>تحليل وجدولة تلقائية في الخطة اليومية</span>
                </button>
                <button
                  onClick={ClassroomEngine.openGoogleClassroom}
                  className="px-3.5 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-semibold text-zinc-300 active:scale-95 transition-all flex items-center gap-1.5"
                  title="فتح موقع كلاس روم"
                >
                  <span>كلاس روم</span>
                  <ExternalLink className="h-3.5 w-3.5 text-blue-400" />
                </button>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 3: REGISTERED COURSES */}
          {/* ==================================================================== */}
          {activeTab === 'courses' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-white/5">
                <span className="text-xs font-bold text-zinc-300">مساقات الفصل الحالي بالكلية التطبيقية:</span>
                <button
                  onClick={() => setShowAddCourse(!showAddCourse)}
                  className="px-2.5 py-1 rounded-lg bg-blue-600/30 text-blue-300 hover:bg-blue-600/50 border border-blue-500/30 text-[11px] font-bold flex items-center gap-1 transition-all"
                >
                  <Plus className="h-3 w-3" />
                  <span>إضافة مساق</span>
                </button>
              </div>

              {showAddCourse && (
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-blue-500/30 space-y-2 animate-in fade-in">
                  <input
                    type="text"
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    placeholder="اسم المساق (مثال: بحوث العمليات)"
                    className="w-full p-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs outline-none"
                  />
                  <input
                    type="text"
                    value={newCourseSchedule}
                    onChange={(e) => setNewCourseSchedule(e.target.value)}
                    placeholder="الموعد والقاعة (مثال: سبت وأربعاء 9:00 وجاهي قاعة 101)"
                    className="w-full p-2 rounded-xl bg-black/60 border border-white/10 text-white text-xs outline-none"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setShowAddCourse(false)}
                      className="px-3 py-1 rounded-lg text-zinc-400 text-xs"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleAddCourse}
                      className="px-4 py-1 rounded-lg bg-blue-600 text-white font-bold text-xs"
                    >
                      حفظ المساق
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-2"
                  >
                    <div>
                      <h4 className="font-bold text-white text-xs">{course.name}</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{course.scheduleDescription || 'مقرر دراسي'}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <a
                        href={course.classroomUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                        title="فتح المساق"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                        title="حذف"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 4: TERMUX LOCAL YT-DLP ENGINE */}
          {/* ==================================================================== */}
          {activeTab === 'ytdlp' && (
            <div className="space-y-3.5">
              
              {/* Status Card */}
              <div className={`p-3.5 rounded-2xl border transition-all ${
                isLocalDaemonActive
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                  : 'bg-zinc-900 border-white/10 text-zinc-300'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-emerald-400" />
                    <span className="font-bold text-white">محرك YT-DLP المحلي (تيرموكس على الهاتف)</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    isLocalDaemonActive
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-zinc-800 text-zinc-400 border-white/10'
                  }`}>
                    {isLocalDaemonActive ? 'متصل ونشط على هاتفك 🟢' : 'غير متصل حالياً ⚪'}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  يعمل بالكامل داخل معالج هاتفك بدون أي سيرفر أو لابتوب! عند مشاركة أي فيديو من إنستغرام أو تيك توك، يقوم بسحب الكابشن والترجمة تلقائياً وبأقصى سرعة.
                </p>
              </div>

              {/* 1-Click Command */}
              <div className="p-3 rounded-2xl bg-black/60 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-300 font-bold text-[11px]">أمر التثبيت والتشغيل بلمسة واحدة في Termux:</span>
                  <button
                    onClick={handleCopyTermuxCommand}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all"
                  >
                    {copiedCommand ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedCommand ? 'تم النسخ!' : 'نسخ الأمر'}</span>
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-black/80 border border-white/5 font-mono text-[10px] text-emerald-400 select-all overflow-x-auto whitespace-pre-wrap leading-relaxed dir-ltr text-left">
                  {termuxSetupCommand}
                </div>
              </div>

              {/* Steps explanation */}
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2 text-[11px] text-zinc-300">
                <span className="font-bold text-white block">كيف يعمل تلقائياً وبدون أن تشعر؟</span>
                <ol className="list-decimal list-inside space-y-1.5 leading-relaxed text-zinc-300">
                  <li>افتح تطبيق <strong>Termux</strong> على هاتفك والصق الأمر أعلاه مرة واحدة.</li>
                  <li>يبدأ المحرك بالعمل في خلفية الهاتف على المنفذ المحلي <code>127.0.0.1:8765</code>.</li>
                  <li>من الآن فصاعداً: كلما ضغطت <strong>«مشاركة»</strong> على أي فيديو من إنستغرام أو تيك توك، يسحب Moha Agent كامل البيانات من محرك هاتفك في ثانية واحدة تلقائياً!</li>
                </ol>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
