// ============================================================================
// AQLIYA HQ — EXECUTIVE COMMAND CENTER DASHBOARD (Phase 9)
// Apple Liquid Glass High-Command Interface for Commander Mohammad Qrman
// ============================================================================

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Zap,
  Target,
  Compass,
  HeartPulse,
  FolderKanban,
  Brain,
  Cpu,
  KeyRound,
  ShieldAlert,
  Settings,
  PhoneCall,
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Flame,
  Activity,
  Layers,
  ChevronRight,
  Check,
  Send,
  ExternalLink,
  RefreshCw,
  SlidersHorizontal,
  Bot
} from 'lucide-react';
import type {
  Mission,
  IntelItem,
  StrategicDirective,
  CommanderDossier,
  BattleLog,
  CommanderMemory,
  WatchdogAlert
} from '../../types';
import { ProjectLifeEngine } from '../../lib/project-life/projectLifeEngine';
import { OpportunityRadarEngine } from '../../lib/opportunity-radar/opportunityRadarEngine';
import { MissionControlEngine } from '../../lib/agentic-os/missionControlEngine';
import { tacticalAudio } from '../../lib/audio';

export type ExecutiveSection = 
  | 'command_center'
  | 'ai_advisor'
  | 'mission_control'
  | 'projects'
  | 'life_ops'
  | 'knowledge_vault'
  | 'memory'
  | 'opportunity_radar'
  | 'accounts'
  | 'settings';

interface ExecutiveCommandCenterProps {
  missions: Mission[];
  intel: IntelItem[];
  directives: StrategicDirective[];
  dossier: CommanderDossier | null;
  memories: CommanderMemory[];
  battleLogs: BattleLog[];
  watchdogAlerts: WatchdogAlert[];
  onNavigateSection: (section: ExecutiveSection) => void;
  onOpenVoiceCall: () => void;
  onOpenBriefing: () => void;
  onOpenWatchdog: () => void;
  onSwitchToTacticalWorkspace: () => void;
}

export const ExecutiveCommandCenter: React.FC<ExecutiveCommandCenterProps> = ({
  missions,
  intel,
  directives,
  dossier,
  memories,
  battleLogs,
  watchdogAlerts,
  onNavigateSection,
  onOpenVoiceCall,
  onOpenBriefing,
  onOpenWatchdog,
  onSwitchToTacticalWorkspace,
}) => {
  const [sitrep, setSitrep] = useState(() => ProjectLifeEngine.generateMorningSITREP());
  const [synergyReport, setSynergyReport] = useState(() => ProjectLifeEngine.calculateWorkLifeSynergy());
  const [projectsNeedingAttention, setProjectsNeedingAttention] = useState(() =>
    ProjectLifeEngine.getProjectsRequiringAttention()
  );
  const [opportunityStats, setOpportunityStats] = useState(() =>
    OpportunityRadarEngine.getStats()
  );
  const [workloadMetrics, setWorkloadMetrics] = useState(() =>
    MissionControlEngine.getWorkloadMetrics()
  );
  const [habits, setHabits] = useState(() => ProjectLifeEngine.getHabits());

  const todayStr = useMemo(() => {
    return new Date().toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  const handleToggleHabit = (habitId: string) => {
    tacticalAudio.playConfirm();
    ProjectLifeEngine.toggleHabit(habitId);
    setHabits(ProjectLifeEngine.getHabits());
    setSynergyReport(ProjectLifeEngine.calculateWorkLifeSynergy());
  };

  const criticalWatchdogs = useMemo(() => {
    return watchdogAlerts.filter((a) => a.severity === 'critical' || a.severity === 'warning');
  }, [watchdogAlerts]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4 text-zinc-100 animate-fadeIn">
      {/* --------------------------------------------------------------------- */}
      {/* 1. TOP EXECUTIVE GREETING & RHYTHM HUD */}
      {/* --------------------------------------------------------------------- */}
      <div className="relative overflow-hidden rounded-3xl apple-glass p-5 border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                المقر التنفيذي الموحد AQLIYA HQ
              </span>
              <span className="text-xs text-zinc-400 font-mono">{todayStr}</span>
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight">
              أهلاً بك في غرفة العمليات، يا قائد محمد
            </h2>

            <p className="text-xs text-zinc-300 mt-1 max-w-2xl leading-relaxed">
              {sitrep.executiveSummary}
            </p>
          </div>

          {/* Quick HUD Metrics & Voice Trigger */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenVoiceCall}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/40 active:scale-95 transition-all"
            >
              <PhoneCall className="h-4 w-4" />
              <span>اتصال المستشار الصوتي</span>
            </button>

            <button
              onClick={onOpenBriefing}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs text-zinc-200 transition-all"
            >
              <CalendarCheck className="h-4 w-4 text-emerald-400" />
              <span>إحاطة SITREP</span>
            </button>

            <button
              onClick={onSwitchToTacticalWorkspace}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs text-zinc-200 transition-all"
              title="التبديل إلى بيئة العمل الثلاثية التكتيكية"
            >
              <SlidersHorizontal className="h-4 w-4 text-blue-400" />
              <span className="hidden sm:inline">لوحة العمل الثلاثية</span>
            </button>
          </div>
        </div>

        {/* 4 Quick Telemetry Status Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block font-medium">طاقة اليوم والجاهزية</span>
              <span className="text-xs font-bold text-white">
                {sitrep.energyRating === 'high' ? 'طاقة قصوى ⚡' : sitrep.energyRating === 'medium' ? 'متوازنة ⚖️' : 'وضع التعافي 🛡️'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block font-medium">نافذة الفجر الذهبية</span>
              <span className="text-xs font-bold text-white font-mono">04:30 - 08:30 ص</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block font-medium">مؤشر الانسجام التام</span>
              <span className="text-xs font-bold text-emerald-400 font-mono">
                {synergyReport.overallScore}% (آمن)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block font-medium">صحة المنظومة والأسطول</span>
              <span className="text-xs font-bold text-white font-mono">
                {workloadMetrics.healthIndex}% تشغيل
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 2. THE 10 COMMAND SECTIONS PORTAL TILES */}
      {/* --------------------------------------------------------------------- */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-emerald-400" />
            <span>الأقسام التنفيذية العشرة المنظمة (The 10 Operational Pillars)</span>
          </h3>
          <span className="text-[10px] text-zinc-500">انقر لفتح أي قسم مباشرة</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {[
            {
              id: 'command_center' as ExecutiveSection,
              title: 'غرفة التحكم',
              sub: 'نظرة الموقف الكلي',
              icon: Sparkles,
              color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
              active: true,
            },
            {
              id: 'ai_advisor' as ExecutiveSection,
              title: 'المستشار التكتيكي',
              sub: 'حوار و Gemini AI',
              icon: Bot,
              color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
            },
            {
              id: 'mission_control' as ExecutiveSection,
              title: 'قيادة المهام (DAG)',
              sub: 'أسطول الوكلاء الـ 5',
              icon: Cpu,
              color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
            },
            {
              id: 'projects' as ExecutiveSection,
              title: 'مركز المشاريع (19)',
              sub: 'المشاريع والديون',
              icon: FolderKanban,
              color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
            },
            {
              id: 'life_ops' as ExecutiveSection,
              title: 'ذكاء الحياة',
              sub: 'العادات وإدارة الطاقة',
              icon: HeartPulse,
              color: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
            },
            {
              id: 'opportunity_radar' as ExecutiveSection,
              title: 'رادار الأفكار',
              sub: 'المعايير الستة والفرص',
              icon: Compass,
              color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
            },
            {
              id: 'knowledge_vault' as ExecutiveSection,
              title: 'مستكشف Obsidian',
              sub: 'ملفات E:\\Antigravity',
              icon: Target,
              color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
            },
            {
              id: 'memory' as ExecutiveSection,
              title: 'الذاكرة السباعية',
              sub: 'الملف والقرارات',
              icon: Brain,
              color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
            },
            {
              id: 'accounts' as ExecutiveSection,
              title: 'خزينة الحسابات',
              sub: 'أسرار مشفرة محلياً',
              icon: KeyRound,
              color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
            },
            {
              id: 'settings' as ExecutiveSection,
              title: 'إعدادات الأمان',
              sub: 'PIN 2005 والمزامنة',
              icon: Settings,
              color: 'text-zinc-400 bg-white/5 border-white/10',
            },
          ].map((sec) => {
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                onClick={() => onNavigateSection(sec.id)}
                className={`p-3 rounded-2xl border text-right transition-all flex flex-col justify-between hover:scale-[1.02] active:scale-95 ${
                  sec.active
                    ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                    : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`h-7 w-7 rounded-xl flex items-center justify-center border ${sec.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <ChevronRight className="h-3 w-3 text-zinc-500 rotate-180" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white leading-tight">{sec.title}</h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{sec.sub}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* 3. CORE TWO-COLUMN ACTION WIDGETS */}
      {/* --------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN (7 Cols): Top 3 Priorities & Projects Attention */}
        <div className="lg:col-span-7 space-y-4">
          {/* Top 3 Tactical Priorities */}
          <div className="p-4 rounded-3xl apple-glass border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  أعلى 3 أولويات تكتيكية لحسمها اليوم
                </h3>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono">متوافقة مع طاقة اليوم</span>
            </div>

            <div className="space-y-2">
              {sitrep.topPriorities.map((prio) => (
                <div
                  key={prio.id}
                  className="p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 flex items-center justify-between gap-3 text-xs transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        prio.urgency === 'critical'
                          ? 'bg-red-400 animate-pulse'
                          : prio.urgency === 'high'
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                    <div>
                      <span className="font-semibold text-white block">{prio.title}</span>
                      {prio.projectTitle && (
                        <span className="text-[10px] text-zinc-400 font-mono">
                          المشروع: {prio.projectTitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/5">
                      مسند لـ {prio.assignedAgent}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects Requiring Attention */}
          <div className="p-4 rounded-3xl apple-glass border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  مشاريع تتطلب تدخلاً تكتيكياً أو معالجة ديون ({projectsNeedingAttention.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigateSection('projects')}
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>عرض كافة المشاريع (19)</span>
                <ChevronRight className="h-3 w-3 rotate-180" />
              </button>
            </div>

            <div className="space-y-2">
              {projectsNeedingAttention.slice(0, 3).map((p) => (
                <div
                  key={p.slug}
                  onClick={() => onNavigateSection('projects')}
                  className="p-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 flex items-center justify-between gap-3 cursor-pointer transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{p.titleAr}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        صحة {p.healthIndex}%
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {p.techDebt.length > 0 ? `دين تقني: ${p.techDebt[0]?.title}` : p.currentFocus}
                    </p>
                  </div>

                  <span className="text-xs font-bold font-mono text-emerald-400">
                    {p.progressPercent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 Cols): Daily Habit Streaks & Swarm Operations */}
        <div className="lg:col-span-5 space-y-4">
          {/* Daily Habit Streaks */}
          <div className="p-4 rounded-3xl apple-glass border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">
                  متتبع عادات الفجر والروتين اليومي
                </h3>
              </div>
              <button
                onClick={() => onNavigateSection('life_ops')}
                className="text-[10px] text-zinc-400 hover:text-white"
              >
                الركائز الخمس
              </button>
            </div>

            <div className="space-y-1.5">
              {habits.slice(0, 4).map((h) => {
                const today = new Date().toISOString().split('T')[0];
                const isDone = !!h.history[today];
                return (
                  <div
                    key={h.id}
                    onClick={() => handleToggleHabit(h.id)}
                    className="p-2.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 flex items-center justify-between gap-2 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`h-5 w-5 rounded-lg flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'border border-white/20'
                        }`}
                      >
                        {isDone && <Check className="h-3 w-3" />}
                      </div>
                      <span
                        className={`text-xs ${
                          isDone ? 'text-zinc-400 line-through' : 'text-zinc-200'
                        }`}
                      >
                        {h.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400">
                      <span>{h.currentStreak}d</span>
                      <Flame className="h-3 w-3" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Critical Watchdog & Security Alerts */}
          <div className="p-4 rounded-3xl apple-glass border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">
                  رقابة النظام وحالة الأمان
                </h3>
              </div>
              <button
                onClick={onOpenWatchdog}
                className="text-[10px] text-emerald-400 hover:underline"
              >
                فتح سجل Sentry
              </button>
            </div>

            {criticalWatchdogs.length > 0 ? (
              <div className="space-y-2">
                {criticalWatchdogs.slice(0, 2).map((alert) => (
                  <div
                    key={alert.id}
                    className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200"
                  >
                    <p className="font-bold">{alert.title}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{alert.reason}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                <span>كافة الأنظمة والمزامنة المحلية تعمل باستقرار وأمان 100%.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
