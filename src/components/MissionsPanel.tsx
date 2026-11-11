import React, { useState, useRef } from 'react';
import { 
  FolderGit2, 
  CheckCircle2, 
  Plus, 
  ArrowUpRight, 
  Target, 
  TrendingUp, 
  X, 
  Share2, 
  Settings2, 
  Sparkles, 
  Briefcase, 
  Coffee, 
  GraduationCap, 
  Dumbbell, 
  ShieldCheck, 
  Copy, 
  Check, 
  Flame, 
  Calculator, 
  PlusCircle, 
  ExternalLink 
} from 'lucide-react';
import type { Mission, IntelItem, StrategicDirective } from '../types';
import { tacticalAudio } from '../lib/audio';
import { PersonalFocusEngine } from '../lib/personal-focus/personalFocusEngine';

interface MissionsPanelProps {
  missions: Mission[];
  selectedMission: Mission | null;
  intel?: IntelItem[];
  directives?: StrategicDirective[];
  onSelectMission: (mission: Mission) => void;
  onUpdateMission: (updated: Partial<Mission> & { id: string }) => void;
  onAddMission: (title: string, code: string) => void;
  onDeleteMission?: (id: string) => void;
}

export const MissionsPanel: React.FC<MissionsPanelProps> = ({
  missions,
  selectedMission,
  onSelectMission,
  onUpdateMission,
  onAddMission,
}) => {
  const [selectedPillar, setSelectedPillar] = useState<'nexus' | 'roma' | 'college' | 'body' | 'custom'>('nexus');
  const [copiedHook, setCopiedHook] = useState(false);
  const [backupMsg, setBackupMsg] = useState<string | null>(null);
  const [newLogText, setNewLogText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCode, setNewCode] = useState('');

  const todayPlan = PersonalFocusEngine.getTodayPlan();

  // 4 Core Master Strategic Pillars tailored to Mohammad Qrman
  const strategicPillars = [
    {
      id: 'nexus',
      code: 'NEXUS-LEGAL',
      title: 'نيكسيس للمحامين (Nexus Legal AI)',
      icon: Briefcase,
      color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-300',
      badge: 'أداة المحامين الأمريكية',
      progress: 65,
      targetMetric: '$199 / $299 لكل مقعد • الهدف: أول مبيعة ثم ملايين $',
      currentFocus: 'إرسال 20 إيميل بارد يومياً وعرض الديمو 14 يوماً مع معالجة خوف اختراق السرية ABA 512',
      nextOps: 'تأمين أول 3 عملاء للتجربة المجانية وجمع تقييمات موثقة',
      checklist: [
        { title: 'معالجة مخاوف الأمان: التأكيد أن الأداة تعمل 100% بالرام معزولة عن الإنترنت', done: true },
        { title: 'خطاف الإيميل الأمريكي ABA Formal Opinion 512 معتمد وجاهز', done: true },
        { title: 'إرسال دفعة الـ 20 إيميل اليومية لمكاتب المحاماة', done: todayPlan.nexusTargets.sentCount >= 20 },
        { title: 'تسجيل فيديو ديمو توضيحي للأداة 90 ثانية لكسر حاجز التردد', done: false },
      ],
    },
    {
      id: 'roma',
      code: 'ROMA-CAFE',
      title: 'كافيه روما العائلي (Roma Cafe POS)',
      icon: Coffee,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300',
      badge: 'نظام إدارة الديون والمبيعات',
      progress: 85,
      targetMetric: 'أرشيف دائم غير قابل للضياع • كشف حساب فوري للزبائن',
      currentFocus: 'حفظ وتأمين بيانات الديون محلياً وسحابياً دون الاعتماد على الدفتر التقليدي',
      nextOps: 'ربط ميزة النسخ الاحتياطي التلقائي الأسبوعي وتصدير كشوفات PDF',
      checklist: [
        { title: 'نظام تسجيل المبيعات والديون يعمل بالكامل على هواتف العمال', done: true },
        { title: 'ميزة النسخ الاحتياطي المحلي التراكمي مفعلة ومؤمنة', done: todayPlan.romaCafeBackupDone },
        { title: 'مراجعة دورية للديون وتحصيل المستحقات أسبوعياً', done: false },
      ],
    },
    {
      id: 'college',
      code: 'COLLEGE-TECH',
      title: 'الكلية والشهادات (Business & Tech + Coursera)',
      icon: GraduationCap,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300',
      badge: 'إدارة أعمال تكنولوجيا + CV',
      progress: 70,
      targetMetric: 'شهادات Coursera تخصصية + معدل امتياز في الكلية التطبيقية',
      currentFocus: 'متابعة الكلاس روم الإلكتروني والتكليفات، ومسار الشهادات الاحترافية',
      nextOps: 'إنهاء موديول كورسيرا الحالي وتحضير ملف تفريغ المحاضرات الوجاهية',
      checklist: [
        { title: 'متابعة إشعارات الكلاس روم اليومية واللقاءات الوجاهية', done: todayPlan.classroomTasks.every(t => t.completed) },
        { title: 'تخصيص 15 دقيقة لمسار كورسيرا المهني لملء السيفي', done: todayPlan.selfGrowth.courseraCompleted },
        { title: 'تدريب الإنجليزية اليومي الخاص بمصطلحات الأعمال', done: todayPlan.selfGrowth.englishCompleted },
      ],
    },
    {
      id: 'body',
      code: 'BODY-70KG',
      title: 'تحول الجسم والكتلة (54kg -> 70kg)',
      icon: Dumbbell,
      color: 'from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-300',
      badge: 'زيادة 16 كجم عضل ومرونة',
      progress: 35,
      targetMetric: '2800 - 3100 سعرة يومياً (بدون خلاط) + 40 دقيقة كاليسثنكس + 10 دقائق مرونة',
      currentFocus: 'تحقيق فائض السعرات عبر وجبات كثيفة وسهلة البلع (سيريلاك، شوفان، زيت زيتون، تمر، طحينية)',
      nextOps: 'الالتزام بجدول الـ 4 أيام المنزلي والاستمرار في أسبوعياً بزيادة 0.5 كجم',
      checklist: [
        { title: 'تناول وجبة طاقة الصباح (سيريلاك أو شوفان دافئ)', done: todayPlan.nutritionAndWorkout.meals[0]?.completed || false },
        { title: 'إضافة ملعقتي زيت زيتون بكر على وجبة الغداء', done: todayPlan.nutritionAndWorkout.meals[1]?.completed || false },
        { title: 'سناك التمر والفستق المحمص أثناء النهار', done: todayPlan.nutritionAndWorkout.meals[2]?.completed || false },
        { title: 'إتمام تمرين اليوم المنزلي وتمارين المرونة 10 دقائق', done: todayPlan.nutritionAndWorkout.workoutCompleted },
      ],
    },
  ];

  const currentPillar = strategicPillars.find(p => p.id === selectedPillar) || strategicPillars[0];

  const handleCopyHook = () => {
    navigator.clipboard.writeText(todayPlan.nexusTargets.recommendedHook);
    setCopiedHook(true);
    setTimeout(() => setCopiedHook(false), 2000);
  };

  const handleBackupCafe = () => {
    const res = PersonalFocusEngine.backupRomaCafeData();
    setBackupMsg(`تم تأمين وحفظ الديون بنجاح (${res.count} سجل) الساعة ${res.timestamp}`);
    setTimeout(() => setBackupMsg(null), 4000);
  };

  return (
    <div className="flex flex-col h-full min-h-0 apple-glass rounded-3xl p-4 sm:p-5 overflow-hidden text-right border border-white/5 shadow-2xl relative select-none">
      
      {/* 1. Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-white/5 mb-3 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">غرفة المشاريع التكتيكية</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-mono font-bold">
                4 PILLARS
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">محاور محمد قرمان الأربعة لبناء الثروة، القوة، والعلم</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 px-3 py-1.5 rounded-xl transition-all active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>مهمة إضافية</span>
        </button>
      </div>

      {/* 2. Top Segmented Pills (The 4 Real Pillars) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3.5 flex-shrink-0">
        {strategicPillars.map((p) => {
          const Icon = p.icon;
          const isSelected = selectedPillar === p.id;
          return (
            <button
              key={p.id}
              onClick={() => {
                tacticalAudio.playBlip();
                setSelectedPillar(p.id as any);
              }}
              className={`p-2.5 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                isSelected
                  ? `bg-white/[0.08] ${p.color} shadow-lg scale-102 border-current`
                  : 'bg-white/[0.02] border-white/5 text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Icon className="h-4 w-4" />
                <span className="text-[10px] font-mono font-bold">{p.progress}%</span>
              </div>
              <p className="text-xs font-bold truncate text-white">{p.title.split('(')[0]}</p>
              <span className="text-[10px] text-zinc-400 mt-0.5 truncate">{p.code}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Pillar Active Workspace */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-3.5 pr-1 text-xs scrollbar-tactical">
        
        {/* Main Card Profile */}
        <div className={`p-4 rounded-3xl apple-glass-card border bg-gradient-to-br ${currentPillar.color} space-y-3`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/10 text-white font-bold">
                {currentPillar.code} • {currentPillar.badge}
              </span>
              <h3 className="text-base font-extrabold text-white mt-1.5">{currentPillar.title}</h3>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/40 border border-white/10 text-xs font-mono font-bold text-emerald-300">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              <span>{currentPillar.progress}%</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/30 border border-white/5 space-y-1">
            <span className="text-[11px] text-zinc-400 block font-medium">الهدف المالي / الرقمي المحدد:</span>
            <p className="text-xs text-emerald-300 font-bold">{currentPillar.targetMetric}</p>
          </div>

          {/* Quick Action Triggers according to Pillar */}
          {currentPillar.id === 'nexus' && (
            <div className="space-y-2 pt-1 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-300 font-medium">خطاف الرسالة القانونية (ABA 512):</span>
                <button
                  onClick={handleCopyHook}
                  className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold hover:underline"
                >
                  {copiedHook ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedHook ? 'تم النسخ!' : 'نسخ الخطاف'}</span>
                </button>
              </div>
              <p className="text-[11px] font-mono text-zinc-300 bg-black/50 p-2.5 rounded-xl border border-white/5 dir-ltr text-left">
                {todayPlan.nexusTargets.recommendedHook}
              </p>
              <div className="flex items-center justify-between text-[11px] text-zinc-300 pt-1">
                <span>الإيميلات المرسلة اليوم:</span>
                <span className="font-mono text-emerald-400 font-bold">{todayPlan.nexusTargets.sentCount}/20 إيميل</span>
              </div>
            </div>
          )}

          {currentPillar.id === 'roma' && (
            <div className="space-y-2 pt-1 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-300">النسخ الاحتياطي لقاعدة الديون:</span>
                <button
                  onClick={handleBackupCafe}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-zinc-950 text-xs font-bold shadow-md active:scale-95 transition-all"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>تأمين الديون الآن 🛡️</span>
                </button>
              </div>
              {backupMsg && (
                <p className="text-[11px] text-emerald-300 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                  {backupMsg}
                </p>
              )}
            </div>
          )}

          {currentPillar.id === 'body' && (
            <div className="space-y-2 pt-1 border-t border-white/10">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300">الوزن الحالي: <strong>54 كجم</strong></span>
                <span className="text-emerald-300">الهدف: <strong>70 كجم</strong> (+16 كجم)</span>
              </div>
              <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden border border-white/5">
                <div className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full w-[35%]" />
              </div>
              <p className="text-[11px] text-zinc-400">
                الهدف اليومي: 2800 - 3100 سعرة حرارية من مصادر كثيفة بدون خلاط.
              </p>
            </div>
          )}

          {currentPillar.id === 'college' && (
            <div className="space-y-1.5 pt-1 border-t border-white/10 text-xs">
              <div className="flex items-center justify-between text-zinc-300">
                <span>الكورس النشط في كورسيرا:</span>
                <span className="text-emerald-300 font-bold">{todayPlan.selfGrowth.courseraModuleTitle}</span>
              </div>
              <p className="text-[11px] text-zinc-400">
                كل كورس تنهيه يعزز ملفك وسيرتك الذاتية في تكنولوجيا إدارة الأعمال.
              </p>
            </div>
          )}
        </div>

        {/* Tactical Checklist for this Pillar */}
        <div className="p-4 rounded-3xl apple-glass-card border border-white/5 space-y-2.5">
          <h4 className="text-xs font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>قائمة المهام التكتيكية المباشرة:</span>
          </h4>

          <div className="space-y-2">
            {currentPillar.checklist.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl border transition-all flex items-start gap-2.5 ${
                  item.done
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : 'bg-white/[0.02] border-white/5 text-zinc-300'
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {item.done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-zinc-500" />
                  )}
                </div>
                <p className={`text-xs leading-relaxed ${item.done ? 'line-through opacity-80' : ''}`}>
                  {item.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Guidance Note */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1 text-xs text-zinc-400">
          <span className="font-bold text-zinc-300">التوجيه الحالي:</span>
          <p className="text-[11px] leading-relaxed text-zinc-300">{currentPillar.currentFocus}</p>
        </div>

      </div>

      {/* Add Custom Mission Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
          <div className="apple-glass-elevated w-full max-w-sm rounded-3xl p-5 border border-white/10 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <h3 className="text-sm font-bold text-white">إضافة مشروع / مهمة جديدة</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">اسم المهمة:</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="مثال: تجهيز عقد شراكة جديدة"
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">رمز المهمة (Code):</label>
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="OPS-501"
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-zinc-400 hover:text-white"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  if (newTitle.trim()) {
                    onAddMission(newTitle.trim(), newCode.trim() || `OPS-${Math.floor(Math.random() * 900 + 100)}`);
                    setNewTitle('');
                    setNewCode('');
                    setShowAddModal(false);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs"
              >
                إضافة
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
