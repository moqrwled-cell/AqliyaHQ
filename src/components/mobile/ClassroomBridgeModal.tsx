import React, { useState } from 'react';
import { 
  ClassroomEngine 
} from '../../lib/classroom/classroomEngine';
import type { 
  ClassroomCourse 
} from '../../lib/classroom/classroomEngine';
import { 
  GraduationCap, 
  X, 
  Sparkles, 
  ExternalLink, 
  Plus, 
  BookOpen, 
  Calendar, 
  Check, 
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'import' | 'guide' | 'courses'>('import');

  // New course form
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseUrl, setNewCourseUrl] = useState('https://classroom.google.com');
  const [newCourseSchedule, setNewCourseSchedule] = useState('');

  if (!isOpen) return null;

  const handleParseText = () => {
    if (!announcementText.trim()) return;
    const result = ClassroomEngine.parseClassroomAnnouncement(announcementText);
    setParseResult(result.summary);
    setAnnouncementText('');
    if (onTaskAdded) {
      onTaskAdded();
    }
    setTimeout(() => {
      setParseResult(null);
    }, 4000);
  };

  const handleAddCourse = () => {
    if (!newCourseName.trim()) return;
    const updated = ClassroomEngine.addCourse({
      name: newCourseName.trim(),
      classroomUrl: newCourseUrl.trim() || 'https://classroom.google.com',
      scheduleDescription: newCourseSchedule.trim() || 'مقرر دراسي بالكلية',
    });
    setCourses([...updated]);
    setNewCourseName('');
    setNewCourseSchedule('');
    setShowAddCourse(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-[#0a0f1d] border border-blue-500/30 shadow-2xl p-4 sm:p-5 text-right font-sans max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-shrink-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">جسر كلاس روم والكلية</h3>
            <div className="p-1.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.03] border border-white/5 my-3 flex-shrink-0">
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'import'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            الاستيراد الذكي ⚡
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'courses'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            مساقاتي الدراسية ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'guide'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            طرق الربط 📖
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto space-y-4 py-1 flex-1">
          
          {/* TAB 1: Smart Announcement & Exam Importer */}
          {activeTab === 'import' && (
            <div className="space-y-3.5">
              <div className="p-3 rounded-2xl bg-blue-950/30 border border-blue-500/20 text-xs text-blue-200/90 leading-relaxed">
                ✨ <strong>التقاط المواعيد بذكاء:</strong> انسخ أي إعلان نزله دكتور المادة، أو موعد اختبار، أو رابط لقاء وجاهي من الكلاس روم، والصقه هنا. سيقوم Moha Agent بتحليله وجدولته مباشرة في خطة يومك!
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

              {/* Sample Prompts */}
              <div className="pt-2 border-t border-white/5 space-y-2">
                <span className="text-[11px] text-zinc-400 block">نماذج سريعة للتجربة:</span>
                <div className="space-y-1.5">
                  <button
                    onClick={() => setAnnouncementText('امتحان نصفي لمادة نظم معلومات إدارية يوم الثلاثاء القادم وجاهي')}
                    className="w-full text-right p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 text-[11px] text-zinc-300 flex items-center justify-between"
                  >
                    <ArrowRight className="h-3 w-3 text-blue-400" />
                    <span>امتحان نصفي لمادة نظم معلومات إدارية يوم الثلاثاء القادم وجاهي</span>
                  </button>
                  <button
                    onClick={() => setAnnouncementText('تسليم تكليف دراسة حالة إدارة الأعمال والتكنولوجيا قبل الخميس')}
                    className="w-full text-right p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 text-[11px] text-zinc-300 flex items-center justify-between"
                  >
                    <ArrowRight className="h-3 w-3 text-blue-400" />
                    <span>تسليم تكليف دراسة حالة إدارة الأعمال والتكنولوجيا قبل الخميس</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Courses Directory */}
          {activeTab === 'courses' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowAddCourse(!showAddCourse)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 text-xs font-semibold transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{showAddCourse ? 'إلغاء' : 'إضافة مادة جديدة'}</span>
                </button>
                <span className="text-xs font-bold text-zinc-400">مساقات الكلية التطبيقية</span>
              </div>

              {showAddCourse && (
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-blue-500/30 space-y-2.5 animate-in slide-in-from-top-2">
                  <input
                    type="text"
                    value={newCourseName}
                    onChange={e => setNewCourseName(e.target.value)}
                    placeholder="اسم المادة (مثال: بحوث العمليات)"
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-zinc-500 outline-none"
                  />
                  <input
                    type="text"
                    value={newCourseSchedule}
                    onChange={e => setNewCourseSchedule(e.target.value)}
                    placeholder="الموعد (مثال: أحد وثلاثاء 11:30)"
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-zinc-500 outline-none"
                  />
                  <button
                    onClick={handleAddCourse}
                    className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                  >
                    حفظ المساق
                  </button>
                </div>
              )}

              <div className="space-y-2.5">
                {courses.map(course => (
                  <div
                    key={course.id}
                    className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-blue-500/30 transition-all flex items-center justify-between gap-3"
                  >
                    <a
                      href={course.classroomUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center gap-1.5 flex-shrink-0"
                    >
                      <span>فتح</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>

                    <div className="flex-1 text-right">
                      <h4 className="text-xs font-bold text-white mb-0.5">{course.name}</h4>
                      <p className="text-[11px] text-zinc-400">{course.scheduleDescription}</p>
                    </div>

                    <div className="p-2 rounded-xl bg-blue-950/40 text-blue-400 flex-shrink-0">
                      <BookOpen className="h-4 w-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Guide on How to Link Classroom */}
          {activeTab === 'guide' && (
            <div className="space-y-3.5 text-xs text-zinc-300 leading-relaxed">
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <h4 className="font-bold text-blue-400 flex items-center gap-1.5">
                  <Layers className="h-4 w-4" />
                  <span>كيف يتم ربط كلاس روم مع Moha Agent؟</span>
                </h4>
                <p>
                  نظراً لأن دراستك في <strong>الكلية التطبيقية</strong> تعتمد على Google Classroom، هناك 3 طرق لتحقيق أقصى استفادة:
                </p>
              </div>

              {/* Method 1 */}
              <div className="p-3 rounded-2xl bg-blue-950/20 border border-blue-500/20 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-[11px] flex items-center justify-center font-mono">1</span>
                  <span>الطريقة الأولى: الاستيراد الذكي الفوري (موصى بها حالياً ⚡)</span>
                </div>
                <p className="text-[11px] text-zinc-400 pr-6">
                  لا تحتاج أي حسابات مطورين أو إعدادات معقدة. بمجرد أن ينزل الدكتور إعلان أو تكليف، انسخ النص واضغط "تحليل وجدولة تلقائية"، وسيتولى الذكاء الاصطناعي استخراج نوع الحدث وتاريخه وإضافته لجدول يومك.
                </p>
              </div>

              {/* Method 2 */}
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                  <span className="w-5 h-5 rounded-full bg-zinc-700 text-[11px] flex items-center justify-center font-mono">2</span>
                  <span>الطريقة الثانية: مزامنة تقويم Google Calendar</span>
                </div>
                <p className="text-[11px] text-zinc-400 pr-6">
                  كلاس روم يقوم تلقائياً بإنشاء تقويم لجميع واجباتك وامتحاناتك في تقويم Google الخاص بحسابك. يمكنك الوصول لمواعيدك متزامنة مباشرة دون الحاجة لفتح كل مساق بشكل منفصل.
                </p>
              </div>

              {/* Method 3 */}
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                  <span className="w-5 h-5 rounded-full bg-zinc-700 text-[11px] flex items-center justify-center font-mono">3</span>
                  <span>الطريقة الثالثة: ربط Google Classroom API الرسمي (OAuth 2.0)</span>
                </div>
                <p className="text-[11px] text-zinc-400 pr-6">
                  إذا أردت ربطاً برمجياً كاملاً يسحب درجاتك ومقرراتك وإعلاناتك تلقائياً كل دقيقة، يتم تفعيل Classroom API من Google Cloud Console وإدخال مفتاح الـ Client ID في Moha Agent.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400 flex-shrink-0">
          <button
            onClick={ClassroomEngine.openGoogleClassroom}
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold"
          >
            <span>فتح Google Classroom</span>
            <ExternalLink className="h-3 w-3" />
          </button>
          <span>تتبع محاضراتك وامتحاناتك لحظة بلحظة</span>
        </div>

      </div>
    </div>
  );
};
