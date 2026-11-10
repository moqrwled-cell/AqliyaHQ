// ============================================================================
// AQLIYA HQ — OPPORTUNITY RADAR VIEW (Phase 8)
// Executive Apple Liquid Glass Interface for Idea & Opportunity Evaluation
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  Compass,
  Sparkles,
  Search,
  Plus,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Shield,
  Layers,
  TrendingUp,
  FolderPlus,
  Share2,
  Clock,
  Zap,
  Check,
  X,
  Radio,
  FileText,
  Filter,
  DollarSign,
  Info,
} from 'lucide-react';
import { OpportunityRadarEngine } from '../../lib/opportunity-radar/opportunityRadarEngine';
import type {
  IdeaOpportunity,
  OpportunityVerdict,
  OpportunityCategory,
  OpportunityPlatform,
  OpportunityRadarStats,
} from '../../lib/opportunity-radar/types';
import { tacticalAudio } from '../../lib/audio';

interface OpportunityRadarViewProps {
  onNavigateToProjects?: (slug?: string) => void;
  onRefreshTelemetry?: () => void;
}

export const OpportunityRadarView: React.FC<OpportunityRadarViewProps> = ({
  onNavigateToProjects,
  onRefreshTelemetry,
}) => {
  const [opportunities, setOpportunities] = useState<IdeaOpportunity[]>(() =>
    OpportunityRadarEngine.getAllOpportunities()
  );
  const [stats, setStats] = useState<OpportunityRadarStats>(() =>
    OpportunityRadarEngine.getStats()
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVerdictFilter, setSelectedVerdictFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedOpportunity, setSelectedOpportunity] = useState<IdeaOpportunity | null>(null);

  // Quick Capture Form State
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newProblem, setNewProblem] = useState('');
  const [newBeneficiary, setNewBeneficiary] = useState('');
  const [newCost, setNewCost] = useState('');
  const [newProjectSlug, setNewProjectSlug] = useState('');
  const [notificationMsg, setNotificationMsg] = useState('');

  const refreshList = () => {
    setOpportunities(OpportunityRadarEngine.getAllOpportunities());
    setStats(OpportunityRadarEngine.getStats());
  };

  const handleCreateOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newProblem.trim()) return;

    tacticalAudio.playConfirm();
    const created = OpportunityRadarEngine.createOpportunity({
      title: newTitle.trim(),
      rawSourceUrl: newUrl.trim() || undefined,
      problemSolved: newProblem.trim(),
      targetBeneficiary: newBeneficiary.trim() || undefined,
      estimatedCost: newCost.trim() || 'مجاني / استثمار في الوقت',
      linkedProjectSlug: newProjectSlug.trim() || undefined,
    });

    setNewTitle('');
    setNewUrl('');
    setNewProblem('');
    setNewBeneficiary('');
    setNewCost('');
    setNewProjectSlug('');
    setIsQuickCaptureOpen(false);

    setNotificationMsg(`تم تقييم الفكرة «${created.title}» بنجاح! الجدوى: ${created.evaluation.overallViabilityScore}%`);
    setTimeout(() => setNotificationMsg(''), 4000);
    refreshList();
  };

  const handleConvertToProject = async (opp: IdeaOpportunity) => {
    tacticalAudio.playConfirm();
    const res = await OpportunityRadarEngine.convertOpportunity(opp.id, opp.linkedProjectSlug);
    setNotificationMsg(res.message);
    setTimeout(() => setNotificationMsg(''), 4000);
    refreshList();
    if (selectedOpportunity && selectedOpportunity.id === opp.id) {
      setSelectedOpportunity(OpportunityRadarEngine.getOpportunityById(opp.id));
    }
  };

  const handleUpdateStatus = (oppId: string, status: IdeaOpportunity['status']) => {
    tacticalAudio.playConfirm();
    OpportunityRadarEngine.updateOpportunityStatus(oppId, status);
    refreshList();
    if (selectedOpportunity && selectedOpportunity.id === oppId) {
      setSelectedOpportunity(OpportunityRadarEngine.getOpportunityById(oppId));
    }
  };

  // Filtered list
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((o) => {
      const matchVerdict =
        selectedVerdictFilter === 'all' || o.evaluation.verdict === selectedVerdictFilter;
      const matchCat =
        selectedCategoryFilter === 'all' || o.category === selectedCategoryFilter;
      const matchQuery =
        !searchQuery.trim() ||
        o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.problemSolved.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.targetBeneficiary && o.targetBeneficiary.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (o.linkedProjectSlug && o.linkedProjectSlug.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchVerdict && matchCat && matchQuery;
    });
  }, [opportunities, selectedVerdictFilter, selectedCategoryFilter, searchQuery]);

  return (
    <div className="flex flex-col h-full rounded-3xl apple-glass p-3 sm:p-5 overflow-hidden text-zinc-100">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/5 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Compass className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-white">رادار الفرص وتحليل الأفكار (Opportunity Radar)</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              المرحلة 8 المعتمدة
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            محرك تقييم استراتيجي صارم مبني على مصفوفة المعايير الستة لمنع تشتيت جهود القائد ومطابقة الفرص مع مشاريع الـ 19
          </p>
        </div>

        <button
          onClick={() => {
            tacticalAudio.playConfirm();
            setIsQuickCaptureOpen(!isQuickCaptureOpen);
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>التقاط أو فحص فكرة جديدة</span>
        </button>
      </div>

      {/* Notification Toast */}
      {notificationMsg && (
        <div className="mb-3 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between animate-fadeIn">
          <span>{notificationMsg}</span>
          <button onClick={() => setNotificationMsg('')} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Quick Capture Drawer / Form */}
      {isQuickCaptureOpen && (
        <form
          onSubmit={handleCreateOpportunity}
          className="mb-4 p-4 rounded-2xl bg-white/[0.04] border border-emerald-500/30 space-y-3 flex-shrink-0 animate-fadeIn"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>فحص وتقييم فكرة أو ريلز جديد</span>
            </h4>
            <span className="text-[10px] text-zinc-400">سيتم حساب مصفوفة المعايير الستة تلقائياً</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">عنوان الفكرة / موضوع الرابط</label>
              <input
                type="text"
                placeholder="مثال: نظام تدقيق ملفات أوتوماتيكي..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">رابط المصدر (إن وجد: Reels / TikTok / YouTube / GitHub)</label>
              <input
                type="text"
                placeholder="https://..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">المشكلة الحقيقية التي تحلها الفكرة</label>
            <textarea
              rows={2}
              placeholder="اشرح المشكلة الفعلية دون مبالغة أو افتراضات غير واقعية..."
              value={newProblem}
              onChange={(e) => setNewProblem(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white focus:outline-none focus:border-emerald-500/50"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">المستفيد النهائي</label>
              <input
                type="text"
                placeholder="مثال: رواد كفي روما / عملاء SaaS..."
                value={newBeneficiary}
                onChange={(e) => setNewBeneficiary(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">التكلفة التقديرية (مجاني أم يتطلب ميزانية؟)</label>
              <input
                type="text"
                placeholder="مثال: مجاني / صفر تكلفة إضافية"
                value={newCost}
                onChange={(e) => setNewCost(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">المشروع المرتبط من مشاريع الـ 19</label>
              <input
                type="text"
                placeholder="مثال: os-nexus-os أو business-roma-cafe"
                value={newProjectSlug}
                onChange={(e) => setNewProjectSlug(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsQuickCaptureOpen(false)}
              className="px-3 py-1.5 rounded-xl bg-white/[0.05] text-xs text-zinc-400 hover:text-white"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-md"
            >
              إجراء فحص الجدوى التكتيكي الآن
            </button>
          </div>
        </form>
      )}

      {/* Top Telemetry & Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-4 flex-shrink-0">
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
          <span className="text-[10px] text-zinc-400 font-semibold">إجمالي الفرص المفحوصة</span>
          <span className="text-xl font-mono font-bold text-white mt-1">{stats.totalOpportunities}</span>
        </div>

        <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex flex-col justify-between">
          <span className="text-[10px] text-emerald-300 font-semibold">فرص حاسمة للتنفيذ</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xl font-mono font-bold text-emerald-400">{stats.criticalPriorityCount}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">أولوية</span>
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex flex-col justify-between">
          <span className="text-[10px] text-blue-300 font-semibold">فرص واعدة ومجدية</span>
          <span className="text-xl font-mono font-bold text-blue-400 mt-1">{stats.promisingCount}</span>
        </div>

        <div className="p-3 rounded-2xl bg-purple-500/5 border border-purple-500/20 flex flex-col justify-between">
          <span className="text-[10px] text-purple-300 font-semibold">تم تحويلها لخطوات مشاريع</span>
          <span className="text-xl font-mono font-bold text-purple-400 mt-1">{stats.convertedCount}</span>
        </div>

        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between col-span-2 sm:col-span-1">
          <span className="text-[10px] text-zinc-400 font-semibold">متوسط معدل الجدوى</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-xl font-mono font-bold text-emerald-400">{stats.averageViabilityScore}%</span>
            <span className="text-[10px] text-zinc-500 font-mono">مرجح</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 flex-shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {[
            { id: 'all', label: 'كافة التقييمات' },
            { id: 'critical_priority', label: 'حاسمة للتنفيذ (85%+)' },
            { id: 'promising_opportunity', label: 'واعدة (70-84%)' },
            { id: 'shelved_backlog', label: 'مؤجلة بالأرشيف' },
            { id: 'rejected', label: 'مرفوضة' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedVerdictFilter(f.id)}
              className={`px-3 py-1 rounded-xl text-xs whitespace-nowrap transition-all ${
                selectedVerdictFilter === f.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                  : 'bg-white/[0.03] text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="ابحث في الفرص والمشكلات المحلولة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-8 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredOpportunities.map((opp) => {
          const isCrit = opp.evaluation.verdict === 'critical_priority';
          const isProm = opp.evaluation.verdict === 'promising_opportunity';
          const isConverted = opp.status === 'converted_to_project';

          const scoreColor = isCrit
            ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
            : isProm
            ? 'text-blue-400 border-blue-500/30 bg-blue-500/10'
            : 'text-amber-400 border-amber-500/30 bg-amber-500/10';

          return (
            <div
              key={opp.id}
              className={`p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border transition-all flex flex-col justify-between ${
                isCrit
                  ? 'border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.06)]'
                  : isConverted
                  ? 'border-purple-500/30'
                  : 'border-white/10'
              }`}
            >
              <div>
                {/* Header & Badges */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.05] text-zinc-400">
                      {opp.platform.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.05] text-zinc-400">
                      {opp.category}
                    </span>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${scoreColor}`}>
                    جدوى {opp.evaluation.overallViabilityScore}%
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-white mb-1.5 leading-snug">{opp.title}</h3>

                {/* Problem Solved */}
                <p className="text-xs text-zinc-300 line-clamp-2 mb-3 leading-relaxed">
                  <span className="text-zinc-500 font-semibold ml-1">المشكلة:</span>
                  {opp.problemSolved}
                </p>

                {/* Linked Project if any */}
                {opp.linkedProjectSlug && (
                  <div className="p-2 rounded-xl bg-white/[0.02] border border-white/5 mb-3 text-[11px] flex items-center justify-between">
                    <span className="text-zinc-400">مرتبط بمشروع:</span>
                    <span className="font-mono text-emerald-400 font-bold">{opp.linkedProjectSlug}</span>
                  </div>
                )}

                {/* 6-Criteria Mini Visualizer */}
                <div className="grid grid-cols-3 gap-1.5 text-[10px] p-2 rounded-xl bg-white/[0.02] border border-white/5 mb-3">
                  <div>
                    <span className="text-zinc-500">الأثر:</span>{' '}
                    <span className="font-bold text-zinc-200">{opp.evaluation.valueScore}%</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">السهولة:</span>{' '}
                    <span className="font-bold text-zinc-200">{opp.evaluation.effortScore}%</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">التكلفة:</span>{' '}
                    <span className="font-bold text-zinc-200">{opp.evaluation.costScore}%</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">الأمان:</span>{' '}
                    <span className="font-bold text-zinc-200">{opp.evaluation.riskScore}%</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">الملاءمة:</span>{' '}
                    <span className="font-bold text-zinc-200">{opp.evaluation.strategicFitScore}%</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">السرعة:</span>{' '}
                    <span className="font-bold text-zinc-200">{opp.evaluation.timeToMarketScore}%</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedOpportunity(opp)}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs text-zinc-300 hover:text-white transition-all"
                >
                  التفاصيل والمنطق
                </button>

                <div className="flex items-center gap-1.5">
                  {isConverted ? (
                    <span className="text-[11px] px-2.5 py-1 rounded-xl bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>مدمجة بالمشروع</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleConvertToProject(opp)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 transition-all flex items-center gap-1"
                      title="تحويل إلى خطوة في المشروع وتوثيقها في الذاكرة"
                    >
                      <FolderPlus className="h-3.5 w-3.5" />
                      <span>تحويل لمشروع</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Opportunity Detail Modal */}
      {selectedOpportunity && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="w-full max-w-2xl max-h-[90vh] rounded-3xl apple-glass p-5 border border-white/15 flex flex-col space-y-4 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{selectedOpportunity.title}</h3>
                  <span className="text-xs text-zinc-400 font-mono">({selectedOpportunity.platform})</span>
                </div>
                {selectedOpportunity.rawSourceUrl && (
                  <a
                    href={selectedOpportunity.rawSourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <span>فتح المصدر الخارجي</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <button
                onClick={() => setSelectedOpportunity(null)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1 text-xs">
              {/* Verdict & Viability Banner */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300 text-sm">
                    الحكم التكتيكي: {selectedOpportunity.evaluation.verdict === 'critical_priority' ? 'فرصة حاسمة للتنفيذ' : selectedOpportunity.evaluation.verdict === 'promising_opportunity' ? 'فرصة واعدة ومجدية' : selectedOpportunity.evaluation.verdict === 'shelved_backlog' ? 'مؤجلة في الأرشيف' : 'مرفوضة'}
                  </span>
                  <span className="font-mono font-bold text-emerald-400 text-base">
                    {selectedOpportunity.evaluation.overallViabilityScore}%
                  </span>
                </div>
                <p className="text-zinc-300 leading-relaxed">
                  {selectedOpportunity.evaluation.verdictRationale}
                </p>
              </div>

              {/* The 6 Criteria Full Matrix */}
              <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <h4 className="font-bold text-white text-[11px] uppercase tracking-wider mb-2">
                  مصفوفة المعايير الستة (The 6-Criteria Matrix)
                </h4>
                <div className="space-y-2">
                  {[
                    { label: 'القيمة الاستراتيجية والأثر الواقعي (25%)', val: selectedOpportunity.evaluation.valueScore },
                    { label: 'الملاءمة مع رؤية القائد ومشاريع الـ 19 (25%)', val: selectedOpportunity.evaluation.strategicFitScore },
                    { label: 'سهولة التنفيذ وإمكانية الإنجاز (15%)', val: selectedOpportunity.evaluation.effortScore },
                    { label: 'انخفاض التكلفة المالية والمجانية (15%)', val: selectedOpportunity.evaluation.costScore },
                    { label: 'درجة الأمان وانخفاض المخاطر (10%)', val: selectedOpportunity.evaluation.riskScore },
                    { label: 'سرعة التنفيذ والوصول للنتيجة (10%)', val: selectedOpportunity.evaluation.timeToMarketScore },
                  ].map((crit, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-400">{crit.label}</span>
                        <span className="font-mono font-bold text-zinc-200">{crit.val}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${crit.val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Problem, Beneficiary & Resources */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <span className="font-bold text-zinc-300 block">المشكلة الحقيقية المحلولة:</span>
                  <p className="text-zinc-400">{selectedOpportunity.problemSolved}</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <span className="font-bold text-zinc-300 block">المستفيد النهائي:</span>
                  <p className="text-zinc-400">{selectedOpportunity.targetBeneficiary}</p>
                </div>
              </div>

              {/* Resources & Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <span className="font-bold text-zinc-300 block">الموارد والأدوات المطلوبة:</span>
                  <ul className="text-zinc-400 space-y-0.5 list-disc list-inside">
                    {selectedOpportunity.requiredResources.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <span className="font-bold text-zinc-300 block">التكلفة المالية المقدرة:</span>
                  <p className="text-zinc-400">{selectedOpportunity.estimatedCost}</p>
                </div>
              </div>

              {/* Risks & Alternatives */}
              <div className="p-3 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-1.5">
                <span className="font-bold text-red-400 block">عوامل الخطر والتحديات الميدانية:</span>
                <ul className="text-zinc-300 space-y-0.5 list-disc list-inside">
                  {selectedOpportunity.riskFactors.map((rf, i) => (
                    <li key={i}>{rf}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleUpdateStatus(selectedOpportunity.id, 'rejected')}
                  className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold"
                >
                  رفض الفكرة
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedOpportunity.id, 'shelved_backlog' as any)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 text-xs"
                >
                  تأجيل في الأرشيف
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleConvertToProject(selectedOpportunity)}
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-md"
                >
                  تحويل إلى خطوة في المشروع
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
