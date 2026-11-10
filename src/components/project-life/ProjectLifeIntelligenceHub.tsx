// ============================================================================
// AQLIYA HQ — PROJECT & LIFE INTELLIGENCE HUB (Phase 7)
// Executive Apple Liquid Glass Interface for Projects, Life Ops, Decisions & SITREP
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  FolderKanban,
  HeartPulse,
  Scale,
  SunMedium,
  Moon,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Flame,
  ShieldAlert,
  Sparkles,
  Search,
  ExternalLink,
  Target,
  FileText,
  Activity,
  Layers,
  Award,
  BookOpen,
  Coffee,
  Cpu,
  Wrench,
  Check,
  Send,
  HelpCircle,
} from 'lucide-react';
import { ProjectLifeEngine } from '../../lib/project-life/projectLifeEngine';
import type {
  ComprehensiveProjectProfile,
  LifePillarStatus,
  HabitItem,
  StrategicDecisionCase,
  UnifiedSITREPReport,
  ProjectCategory,
  PriorityLevel,
} from '../../lib/project-life/types';
import { tacticalAudio } from '../../lib/audio';

interface ProjectLifeIntelligenceHubProps {
  onOpenVaultFile?: (path: string) => void;
  onRefreshTelemetry?: () => void;
}

export const ProjectLifeIntelligenceHub: React.FC<ProjectLifeIntelligenceHubProps> = ({
  onOpenVaultFile,
  onRefreshTelemetry,
}) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'life' | 'decisions' | 'sitrep'>('projects');

  // --------------------------------------------------------------------------
  // Projects State
  // --------------------------------------------------------------------------
  const [projects, setProjects] = useState<ComprehensiveProjectProfile[]>(() =>
    ProjectLifeEngine.getAllProjects()
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<ComprehensiveProjectProfile | null>(null);
  const [newStepTitle, setNewStepTitle] = useState('');

  // --------------------------------------------------------------------------
  // Life Ops State
  // --------------------------------------------------------------------------
  const [pillars, setPillars] = useState<LifePillarStatus[]>(() =>
    ProjectLifeEngine.getLifePillars()
  );
  const [habits, setHabits] = useState<HabitItem[]>(() =>
    ProjectLifeEngine.getHabits()
  );
  const [energyLevel, setEnergyLevel] = useState<'high' | 'medium' | 'low'>('high');
  const [synergyReport, setSynergyReport] = useState(() =>
    ProjectLifeEngine.calculateWorkLifeSynergy()
  );

  // --------------------------------------------------------------------------
  // Decision Support State
  // --------------------------------------------------------------------------
  const [decisionCases, setDecisionCases] = useState<StrategicDecisionCase[]>(() =>
    ProjectLifeEngine.getDecisionCases()
  );
  const [isNewDilemmaOpen, setIsNewDilemmaOpen] = useState(false);
  const [dilemmaTitle, setDilemmaTitle] = useState('');
  const [dilemmaDesc, setDilemmaDesc] = useState('');
  const [dilemmaProjectSlug, setDilemmaProjectSlug] = useState('');
  const [opt1Title, setOpt1Title] = useState('');
  const [opt1Desc, setOpt1Desc] = useState('');
  const [opt2Title, setOpt2Title] = useState('');
  const [opt2Desc, setOpt2Desc] = useState('');
  const [verdictRationale, setVerdictRationale] = useState('');

  // --------------------------------------------------------------------------
  // SITREP State
  // --------------------------------------------------------------------------
  const [morningSITREP, setMorningSITREP] = useState<UnifiedSITREPReport>(() =>
    ProjectLifeEngine.generateMorningSITREP()
  );
  const [debriefAccomplishments, setDebriefAccomplishments] = useState('');
  const [debriefLessons, setDebriefLessons] = useState('');
  const [debriefPrep, setDebriefPrep] = useState('');
  const [debriefSatisfaction, setDebriefSatisfaction] = useState(9);
  const [debriefSuccessMessage, setDebriefSuccessMessage] = useState('');

  const refreshData = () => {
    setProjects(ProjectLifeEngine.getAllProjects());
    setPillars(ProjectLifeEngine.getLifePillars());
    setHabits(ProjectLifeEngine.getHabits());
    setSynergyReport(ProjectLifeEngine.calculateWorkLifeSynergy());
    setDecisionCases(ProjectLifeEngine.getDecisionCases());
    setMorningSITREP(ProjectLifeEngine.generateMorningSITREP());
  };

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------
  const handleToggleHabit = (habitId: string) => {
    tacticalAudio.playConfirm();
    ProjectLifeEngine.toggleHabit(habitId);
    setHabits(ProjectLifeEngine.getHabits());
    setPillars(ProjectLifeEngine.getLifePillars());
    setSynergyReport(ProjectLifeEngine.calculateWorkLifeSynergy());
  };

  const handleEnergyChange = (level: 'high' | 'medium' | 'low') => {
    tacticalAudio.playConfirm();
    setEnergyLevel(level);
    ProjectLifeEngine.logDailyEnergy({
      date: new Date().toISOString().split('T')[0],
      level,
      focusHoursActual: level === 'high' ? 6 : level === 'medium' ? 4 : 2,
      sleepHours: level === 'high' ? 7.5 : 6,
      notes: `تم تحديث الطاقة القيادية يدوياً إلى ${level}`,
    });
    setSynergyReport(ProjectLifeEngine.calculateWorkLifeSynergy());
    setMorningSITREP(ProjectLifeEngine.generateMorningSITREP(level));
  };

  const handleAddProjectStep = (slug: string) => {
    if (!newStepTitle.trim()) return;
    tacticalAudio.playConfirm();
    ProjectLifeEngine.addOrUpdateStep(slug, {
      title: newStepTitle.trim(),
      status: 'pending',
    });
    setNewStepTitle('');
    refreshData();
    if (selectedProject) {
      setSelectedProject(ProjectLifeEngine.getProject(slug));
    }
  };

  const handleToggleStepStatus = (slug: string, stepId: string, currentStatus: string) => {
    tacticalAudio.playConfirm();
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    const proj = ProjectLifeEngine.getProject(slug);
    const step = proj?.steps.find((s) => s.id === stepId);
    if (step) {
      ProjectLifeEngine.addOrUpdateStep(slug, {
        id: stepId,
        title: step.title,
        status: nextStatus as any,
      });
      refreshData();
      if (selectedProject) {
        setSelectedProject(ProjectLifeEngine.getProject(slug));
      }
    }
  };

  const handleCreateDilemma = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dilemmaTitle.trim() || !dilemmaDesc.trim()) return;

    tacticalAudio.playConfirm();
    ProjectLifeEngine.evaluateDilemma({
      title: dilemmaTitle.trim(),
      dilemmaDescription: dilemmaDesc.trim(),
      projectSlug: dilemmaProjectSlug || undefined,
      rawOptions: [
        {
          title: opt1Title.trim() || 'الخيار المحلي المستقل (Local & Resilient)',
          description: opt1Desc.trim() || 'الاعتماد على الموارد والتخزين المحلي بدون تبعيات خارجية.',
          pros: ['استقلالية 100%', 'سرعة استجابة فورية', 'صفر تكلفة إضافية'],
          cons: ['إدارة النسخ الاحتياطية يدوياً'],
          risks: ['تلف الأجهزة ما لم تؤمن'],
        },
        {
          title: opt2Title.trim() || 'الخيار السحابي الخارجي (External SaaS)',
          description: opt2Desc.trim() || 'استخدام منصات سحابية واشتراكات خارجية.',
          pros: ['إعداد سريع'],
          cons: ['تكاليف اشتراكات شهرية', 'هشاشة عند انقطاع الشبكة'],
          risks: ['حظر الحسابات أو انقطاع الخدمة'],
        },
      ],
    });

    setDilemmaTitle('');
    setDilemmaDesc('');
    setOpt1Title('');
    setOpt1Desc('');
    setOpt2Title('');
    setOpt2Desc('');
    setIsNewDilemmaOpen(false);
    refreshData();
  };

  const handleConfirmVerdict = async (caseId: string, chosenOptionId: string) => {
    tacticalAudio.playConfirm();
    await ProjectLifeEngine.recordCommanderVerdict(caseId, chosenOptionId, verdictRationale);
    setVerdictRationale('');
    refreshData();
  };

  const handleSaveDebrief = async (e: React.FormEvent) => {
    e.preventDefault();
    tacticalAudio.playConfirm();
    const accList = debriefAccomplishments
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const lessList = debriefLessons
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    await ProjectLifeEngine.recordEveningDebrief({
      accomplishments: accList.length > 0 ? accList : ['استكمال خطة العمل التكتيكية اليومية'],
      obstacles: [],
      lessonsLearned: lessList.length > 0 ? lessList : ['الانضباط في ساعات الفجر يصنع فارقاً إنتاجياً حاسماً'],
      tomorrowPrep: debriefPrep.trim() || 'مواصلة بناء المراحل المتقدمة في عقلية',
      overallSatisfaction: debriefSatisfaction,
    });

    setDebriefSuccessMessage('تم تدوين جلسة الاستخلاص وحفظ الدروس في الذاكرة التراكمية بنجاح 🎯');
    setTimeout(() => setDebriefSuccessMessage(''), 3000);
    refreshData();
  };

  // --------------------------------------------------------------------------
  // Filtered Projects
  // --------------------------------------------------------------------------
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        p.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [projects, selectedCategory, searchQuery]);

  return (
    <div className="flex flex-col h-full rounded-3xl apple-glass p-3 sm:p-5 overflow-hidden text-zinc-100">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/5 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FolderKanban className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-white">تكامل إدارة الحياة والمشاريع (Project & Life Intelligence)</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              المرحلة 7 المعتمدة
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            الربط العضوي الوثيق بين مشاريع القائد الـ 19 في أوبسيديان وركائز الحياة والعادات وإدارة الطاقة
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-2xl border border-white/10 text-xs">
          <button
            onClick={() => {
              tacticalAudio.playConfirm();
              setActiveTab('projects');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
              activeTab === 'projects'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FolderKanban className="h-3.5 w-3.5" />
            <span>مركز المشاريع (19)</span>
          </button>

          <button
            onClick={() => {
              tacticalAudio.playConfirm();
              setActiveTab('life');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
              activeTab === 'life'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <HeartPulse className="h-3.5 w-3.5" />
            <span>ذكاء الحياة والعادات</span>
          </button>

          <button
            onClick={() => {
              tacticalAudio.playConfirm();
              setActiveTab('decisions');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
              activeTab === 'decisions'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Scale className="h-3.5 w-3.5" />
            <span>محرك حسم القرارات</span>
          </button>

          <button
            onClick={() => {
              tacticalAudio.playConfirm();
              setActiveTab('sitrep');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
              activeTab === 'sitrep'
                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <SunMedium className="h-3.5 w-3.5" />
            <span>الإحاطة والاستخلاص (SITREP)</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {/* ================================================================= */}
        {/* TAB 1: PROJECTS CENTER */}
        {/* ================================================================= */}
        {activeTab === 'projects' && (
          <div className="flex-1 min-h-0 flex flex-col space-y-3">
            {/* Category Pills & Search */}
            <div className="flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                {[
                  { id: 'all', label: 'كافة المشاريع (19)' },
                  { id: 'business', label: 'الأعمال والكافيه (4)' },
                  { id: 'tech_os', label: 'الذكاء والأنظمة (3)' },
                  { id: 'academics', label: 'الدراسة والجغرافيا (2)' },
                  { id: 'life_ops', label: 'تنظيم الحياة (2)' },
                  { id: 'tools', label: 'الأدوات والشبكات (3)' },
                  { id: 'general', label: 'مشاريع عامة (5)' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-3 py-1 rounded-xl text-xs whitespace-nowrap transition-all ${
                      selectedCategory === c.id
                        ? 'bg-white/10 text-emerald-400 border border-emerald-500/30 font-bold'
                        : 'bg-white/[0.03] text-zinc-400 hover:text-zinc-200 border border-transparent'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="ابحث في اسم أو تفاصيل المشروع..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-3 pr-8 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {/* Project Grid */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredProjects.map((p) => {
                const isCrit = p.priority === 'critical' || p.status === 'critical_attention';
                const healthColor =
                  p.healthIndex >= 90
                    ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                    : p.healthIndex >= 75
                    ? 'text-blue-400 border-blue-500/30 bg-blue-500/10'
                    : 'text-amber-400 border-amber-500/30 bg-amber-500/10';

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProject(p)}
                    className={`p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border transition-all cursor-pointer flex flex-col justify-between ${
                      isCrit ? 'border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]' : 'border-white/10'
                    }`}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.05] text-zinc-400 border border-white/5">
                          {p.vaultFolder.split('/')[0]}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${healthColor}`}
                          >
                            صحة {p.healthIndex}%
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full ${
                              p.status === 'completed'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : p.status === 'active'
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-zinc-500/20 text-zinc-300'
                            }`}
                          >
                            {p.status === 'completed'
                              ? 'منجز'
                              : p.status === 'active'
                              ? 'نشط ميدانياً'
                              : 'في الانتظار'}
                          </span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-sm font-bold text-white mb-1 leading-snug">{p.titleAr}</h3>
                      <p className="text-xs text-zinc-400 line-clamp-2 mb-3 leading-relaxed">
                        {p.description}
                      </p>

                      {/* Current Focus */}
                      <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 mb-3 text-[11px]">
                        <span className="text-zinc-500 font-semibold ml-1">التركيز الحالي:</span>
                        <span className="text-zinc-300">{p.currentFocus}</span>
                      </div>
                    </div>

                    {/* Bottom Progress & Stats */}
                    <div className="pt-2 border-t border-white/5 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400 text-[11px]">نسبة الإنجاز</span>
                        <span className="font-mono font-bold text-emerald-400">{p.progressPercent}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                          style={{ width: `${p.progressPercent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
                        <span>الخطوات: {p.steps.filter((s) => s.status === 'completed').length}/{p.steps.length}</span>
                        {p.techDebt.length > 0 && (
                          <span className="text-amber-400 flex items-center gap-0.5">
                            <AlertTriangle className="h-3 w-3" />
                            {p.techDebt.length} دين تقني
                          </span>
                        )}
                        <span>{p.files.length} وثائق</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: LIFE OPS & HABITS */}
        {/* ================================================================= */}
        {activeTab === 'life' && (
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
            {/* Top Energy & Synergy HUD */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Daily Energy Selector */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-400 font-semibold">مؤشر الجاهزية والطاقة القيادية</span>
                    <Zap className="h-4 w-4 text-emerald-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">حالة الطاقة الحالية لليوم</h3>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'high', label: 'طاقة قصوى', icon: '⚡', color: 'emerald' },
                    { id: 'medium', label: 'متوازنة', icon: '⚖️', color: 'blue' },
                    { id: 'low', label: 'تعافي', icon: '🛡️', color: 'amber' },
                  ].map((e) => (
                    <button
                      key={e.id}
                      onClick={() => handleEnergyChange(e.id as any)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                        energyLevel === e.id
                          ? 'bg-emerald-500 text-slate-950 shadow-md'
                          : 'bg-white/[0.04] text-zinc-400 hover:text-white'
                      }`}
                    >
                      <span className="text-base">{e.icon}</span>
                      <span>{e.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fajr Peak Focus Rhythm */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-400 font-semibold">إيقاع ساعات التركيز القصوى</span>
                    <Clock className="h-4 w-4 text-blue-400" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">نافذة الفجر الذهبية (Peak Block)</h3>
                  <p className="text-xs text-zinc-400">
                    من الساعة 04:30 حتى 08:30 صباحاً — صمت تام وأعلى كفاءة ذهنية للمعمارية والبرمجة.
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300">
                  <span>ساعات النوم والتعافي المستهدفة:</span>
                  <span className="font-bold font-mono">7.2 ساعات</span>
                </div>
              </div>

              {/* Work-Life Synergy Score */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-400 font-semibold">مؤشر الانسجام ومنع الاحتراق</span>
                    <Activity className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-2xl font-bold font-mono text-emerald-400">
                      {synergyReport.overallScore}%
                    </span>
                    <span className="text-xs text-zinc-400">معدل الانسجام التام</span>
                  </div>
                  <p className="text-xs text-zinc-400">{synergyReport.energyProjectAlignment}</p>
                </div>
                <div className="mt-3 flex items-center justify-between text-[11px] p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                  <span>مخاطر الإرهاق (Burnout):</span>
                  <span className="font-bold">
                    {synergyReport.burnoutRisk === 'low'
                      ? 'منخفضة جداً (آمن)'
                      : synergyReport.burnoutRisk === 'moderate'
                      ? 'متوسطة (احذر)'
                      : 'حرجة (الزم الراحة)'}
                  </span>
                </div>
              </div>
            </div>

            {/* 5 Life Pillars Cards */}
            <div>
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                ركائز الحياة الخمس (Life Pillars)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                {pillars.map((pil) => (
                  <div
                    key={pil.pillar}
                    className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between space-y-2"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-white text-[11px]">{pil.nameAr}</span>
                        <span className="font-mono font-bold text-emerald-400">{pil.score}%</span>
                      </div>
                      <p className="text-[10px] text-zinc-400 leading-snug line-clamp-2">
                        {pil.targetFocus}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-white/5 text-[10px] flex items-center justify-between text-zinc-500">
                      <span>{pil.metricLabel}:</span>
                      <span className="font-semibold text-zinc-300">{pil.metricValue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Habit Tracker */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  متتبع العادات اليومية التكتيكي (Habits Tracker)
                </h3>
                <span className="text-xs text-zinc-500">انقر لتسجيل إنجاز اليوم</span>
              </div>

              <div className="space-y-2">
                {habits.map((h) => {
                  const today = new Date().toISOString().split('T')[0];
                  const isDoneToday = !!h.history[today];

                  return (
                    <div
                      key={h.id}
                      className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 flex items-center justify-between gap-3 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleHabit(h.id)}
                          className={`h-7 w-7 rounded-xl flex items-center justify-center transition-all ${
                            isDoneToday
                              ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                              : 'bg-white/5 border border-white/20 text-transparent hover:border-emerald-500/50'
                          }`}
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <div>
                          <h4
                            className={`text-xs font-bold transition-all ${
                              isDoneToday ? 'text-zinc-400 line-through' : 'text-white'
                            }`}
                          >
                            {h.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] text-zinc-500">
                            <span className="px-1.5 py-0.2 rounded bg-white/5 text-zinc-400">
                              {h.timeOfDay === 'fajr'
                                ? 'وقت الفجر'
                                : h.timeOfDay === 'morning'
                                ? 'الصباح'
                                : h.timeOfDay === 'afternoon'
                                ? 'العصر'
                                : 'المساء'}
                            </span>
                            <span>+{h.pointsReward} نقطة</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold">
                          <Flame className="h-3.5 w-3.5" />
                          <span>{h.currentStreak} يوم</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: DECISION SUPPORT ADVISOR */}
        {/* ================================================================= */}
        {activeTab === 'decisions' && (
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
            {/* Action Bar */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">مستشار حسم القرارات الاستراتيجية</h3>
                <p className="text-xs text-zinc-400">
                  مقارنة الخيارات التكتيكية بمبادئ القائد محمد (الاستقلالية المحلية، تجنب الهشاشة السحابية، والجدوى الميدانية)
                </p>
              </div>
              <button
                onClick={() => setIsNewDilemmaOpen(!isNewDilemmaOpen)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md"
              >
                <Plus className="h-4 w-4" />
                <span>طرح معضلة أو خيار جديد</span>
              </button>
            </div>

            {/* New Dilemma Form */}
            {isNewDilemmaOpen && (
              <form
                onSubmit={handleCreateDilemma}
                className="p-4 rounded-2xl bg-white/[0.04] border border-emerald-500/30 space-y-3"
              >
                <h4 className="text-xs font-bold text-emerald-400">تسجيل مفترق طرق لاتخاذ القرار التكتيكي</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">عنوان المعضلة / السؤال</label>
                    <input
                      type="text"
                      placeholder="مثال: اختيار معمارية التخزين لكوفي شوب روما..."
                      value={dilemmaTitle}
                      onChange={(e) => setDilemmaTitle(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-zinc-400 block mb-1">المشروع المرتبط</label>
                    <select
                      value={dilemmaProjectSlug}
                      onChange={(e) => setDilemmaProjectSlug(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    >
                      <option value="">عام / روتين القيادة</option>
                      {projects.map((p) => (
                        <option key={p.slug} value={p.slug}>
                          {p.titleAr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">وصف المأزق وسياق المعركة</label>
                  <textarea
                    rows={2}
                    placeholder="اشرح التحديات الميدانية والضغوط الحالية..."
                    value={dilemmaDesc}
                    onChange={(e) => setDilemmaDesc(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    required
                  />
                </div>

                {/* Option 1 & Option 2 inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                    <span className="text-[11px] font-bold text-zinc-300">الخيار الأول (المقترح الأساسي)</span>
                    <input
                      type="text"
                      placeholder="عنوان الخيار (مثال: اعتماد التخزين المحلي Offline-First)"
                      value={opt1Title}
                      onChange={(e) => setOpt1Title(e.target.value)}
                      className="w-full px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="الشرح الموجز..."
                      value={opt1Desc}
                      onChange={(e) => setOpt1Desc(e.target.value)}
                      className="w-full px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                    <span className="text-[11px] font-bold text-zinc-300">الخيار الثاني (البديل)</span>
                    <input
                      type="text"
                      placeholder="عنوان الخيار (مثال: استخدام قاعدة بيانات سحابية Cloud DB)"
                      value={opt2Title}
                      onChange={(e) => setOpt2Title(e.target.value)}
                      className="w-full px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="الشرح الموجز..."
                      value={opt2Desc}
                      onChange={(e) => setOpt2Desc(e.target.value)}
                      className="w-full px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewDilemmaOpen(false)}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.05] text-xs text-zinc-400 hover:text-white"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-md"
                  >
                    تحليل المعضلة وتوليد التوصية
                  </button>
                </div>
              </form>
            )}

            {/* Cases List */}
            <div className="space-y-3">
              {decisionCases.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Scale className="h-4 w-4 text-emerald-400" />
                      <h4 className="text-sm font-bold text-white">{c.title}</h4>
                      {c.projectSlug && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 text-zinc-400">
                          {c.projectSlug}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full ${
                        c.status === 'decided'
                          ? 'bg-emerald-500/20 text-emerald-300 font-bold'
                          : 'bg-amber-500/20 text-amber-300 font-bold'
                      }`}
                    >
                      {c.status === 'decided' ? 'تم الحسم والتوثيق' : 'معضلة مفتوحة'}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed">{c.dilemmaDescription}</p>

                  {/* Options Comparison */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {c.options.map((opt) => (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border flex flex-col justify-between ${
                          opt.recommended
                            ? 'bg-emerald-500/5 border-emerald-500/30'
                            : 'bg-white/[0.02] border-white/5'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-white">{opt.title}</span>
                            <span
                              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                                opt.alignmentScore >= 80
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-zinc-500/20 text-zinc-400'
                              }`}
                            >
                              تطابق {opt.alignmentScore}%
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 mb-2 leading-snug">{opt.description}</p>

                          <div className="space-y-1 text-[10px]">
                            {opt.pros.map((pro, i) => (
                              <div key={i} className="text-emerald-400 flex items-center gap-1">
                                <Check className="h-3 w-3 flex-shrink-0" />
                                <span>{pro}</span>
                              </div>
                            ))}
                            {opt.cons.map((con, i) => (
                              <div key={i} className="text-zinc-500 flex items-center gap-1">
                                <span>•</span>
                                <span>{con}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {c.status === 'open' && (
                          <button
                            onClick={() => handleConfirmVerdict(c.id, opt.id)}
                            className="mt-3 w-full py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-[11px] transition-all"
                          >
                            اعتماد هذا الخيار وحسم القرار
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Tactical Recommendation */}
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-zinc-300">
                    <span className="text-emerald-400 font-bold ml-1">توصية المحرك التكتيكية:</span>
                    <span>{c.tacticalRecommendation}</span>
                  </div>

                  {/* Commander Verdict Box if decided */}
                  {c.commanderVerdict && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-emerald-300">
                          قرار القائد محمد المعتمد (مسجل في Decision Memory):
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {c.commanderVerdict.decidedAt.split('T')[0]}
                        </span>
                      </div>
                      <p className="text-zinc-200">{c.commanderVerdict.rationale}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: SITREP & DEBRIEF */}
        {/* ================================================================= */}
        {activeTab === 'sitrep' && (
          <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
            {/* Morning SITREP Card */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SunMedium className="h-4 w-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">
                    الإحاطة الصباحية التكتيكية (Morning SITREP)
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {morningSITREP.date}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-zinc-300 whitespace-pre-line leading-relaxed">
                {morningSITREP.executiveSummary}
              </div>

              {/* Top 3 Priorities */}
              <div>
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                  أعلى 3 أولويات تكتيكية لحسمها اليوم
                </h4>
                <div className="space-y-2">
                  {morningSITREP.topPriorities.map((prio) => (
                    <div
                      key={prio.id}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            prio.urgency === 'critical'
                              ? 'bg-red-400'
                              : prio.urgency === 'high'
                              ? 'bg-amber-400'
                              : 'bg-blue-400'
                          }`}
                        />
                        <span className="font-semibold text-white">{prio.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {prio.projectTitle && (
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {prio.projectTitle}
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          مسند لـ {prio.assignedAgent}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Evening Debrief Logger Form */}
            <form
              onSubmit={handleSaveDebrief}
              className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-white">
                    جلسة استخلاص المساء وتثبيت التعلم (Evening Debrief)
                  </h3>
                </div>
                <span className="text-xs text-zinc-500">توثيق الدروس في الذاكرة السباعية</span>
              </div>

              {debriefSuccessMessage && (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                  {debriefSuccessMessage}
                </div>
              )}

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  ما تم إنجازه وحسمه اليوم (كل سطر إنجاز مستقل)
                </label>
                <textarea
                  rows={2}
                  placeholder="• إكمال المرحلة 6 من خارطة التطوير بنجاح&#10;• إنهاء جولة ألعاب في كفي روما..."
                  value={debriefAccomplishments}
                  onChange={(e) => setDebriefAccomplishments(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  الدروس المستفادة ونقاط الإخفاق (تُحفظ في Experience Memory)
                </label>
                <textarea
                  rows={2}
                  placeholder="• التخزين المحلي يمنع أي توقف حتى مع انقطاع الإنترنت الكامل..."
                  value={debriefLessons}
                  onChange={(e) => setDebriefLessons(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">تجهيز معركة الغد</label>
                  <input
                    type="text"
                    placeholder="بدء المرحلة التالية من خارطة التطوير..."
                    value={debriefPrep}
                    onChange={(e) => setDebriefPrep(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">
                    تقييم اليوم القيادي ({debriefSatisfaction} / 10)
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={debriefSatisfaction}
                    onChange={(e) => setDebriefSatisfaction(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>تثبيت استخلاص المساء في الذاكرة التراكمية</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="w-full max-w-2xl max-h-[90vh] rounded-3xl apple-glass p-5 border border-white/15 flex flex-col space-y-4 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{selectedProject.titleAr}</h3>
                  <span className="text-xs text-zinc-400 font-mono">({selectedProject.slug})</span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">{selectedProject.description}</p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1 text-xs">
              {/* Progress & Focus */}
              <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">مؤشر الصحة والجاهزية:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {selectedProject.healthIndex} / 100
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">التركيز الحالي:</span>
                  <span className="font-semibold text-white">{selectedProject.currentFocus}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">المحطة القادمة:</span>
                  <span className="text-zinc-300">{selectedProject.nextMilestone}</span>
                </div>
              </div>

              {/* Steps Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white uppercase text-[11px]">
                    الخطوات التنفيذية ({selectedProject.steps.length})
                  </h4>
                  <span className="text-[10px] text-zinc-500">انقر للتبديل بين منجز / قيد التنفيذ</span>
                </div>

                <div className="space-y-1.5">
                  {selectedProject.steps.map((st) => (
                    <div
                      key={st.id}
                      onClick={() =>
                        handleToggleStepStatus(selectedProject.slug, st.id, st.status)
                      }
                      className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 flex items-center justify-between gap-2 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-4 w-4 rounded-md flex items-center justify-center text-[10px] ${
                            st.status === 'completed'
                              ? 'bg-emerald-500 text-slate-950 font-bold'
                              : 'border border-white/20'
                          }`}
                        >
                          {st.status === 'completed' && <Check className="h-3 w-3" />}
                        </div>
                        <span
                          className={`text-xs ${
                            st.status === 'completed' ? 'text-zinc-400 line-through' : 'text-zinc-200'
                          }`}
                        >
                          {st.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {st.assigneeAgent || 'systems_dev'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Add Step input */}
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="إضافة خطوة تنفيذية جديدة..."
                    value={newStepTitle}
                    onChange={(e) => setNewStepTitle(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white"
                  />
                  <button
                    onClick={() => handleAddProjectStep(selectedProject.slug)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                  >
                    إضافة
                  </button>
                </div>
              </div>

              {/* Tech Debt & Risks */}
              {(selectedProject.techDebt.length > 0 || selectedProject.risks.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedProject.techDebt.length > 0 && (
                    <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                      <h4 className="font-bold text-amber-400 mb-1.5 text-[11px] flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>الديون التقنية ({selectedProject.techDebt.length})</span>
                      </h4>
                      {selectedProject.techDebt.map((td) => (
                        <div key={td.id} className="text-[11px] text-zinc-300 mb-1">
                          <p className="font-semibold">• {td.title}</p>
                          <p className="text-[10px] text-zinc-400 mr-2">{td.impact}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedProject.risks.length > 0 && (
                    <div className="p-3 rounded-2xl bg-red-500/5 border border-red-500/20">
                      <h4 className="font-bold text-red-400 mb-1.5 text-[11px] flex items-center gap-1">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        <span>المخاطر ({selectedProject.risks.length})</span>
                      </h4>
                      {selectedProject.risks.map((rk) => (
                        <div key={rk.id} className="text-[11px] text-zinc-300 mb-1">
                          <p className="font-semibold">• {rk.risk}</p>
                          <p className="text-[10px] text-zinc-400 mr-2">العلاج: {rk.mitigation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Obsidian Files in Vault */}
              <div>
                <h4 className="font-bold text-white uppercase text-[11px] mb-2">
                  وثائق المخزن في أوبسيديان ({selectedProject.files.length})
                </h4>
                <div className="space-y-1.5">
                  {selectedProject.files.map((f, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-zinc-300"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="font-mono text-xs">{f.name}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">{f.relativePath}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-1.5 rounded-xl bg-white/10 text-white font-bold text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
