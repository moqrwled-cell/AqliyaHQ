import React, { useState, useEffect, useMemo } from 'react';
import { 
  Brain, 
  Sparkles, 
  Plus, 
  Trash2, 
  Tag, 
  Star, 
  Clock, 
  Shield, 
  Target, 
  Zap, 
  Compass, 
  Check, 
  Bookmark,
  Award,
  Layers,
  HelpCircle,
  MessageSquare,
  Send,
  UserCheck,
  Search,
  AlertTriangle,
  FolderKanban,
  FileText,
  Share2,
  Workflow
} from 'lucide-react';
import type { CommanderDossier, CommanderMemory, BattleLog } from '../types';
import { PersistentMemoryStore } from '../lib/memory-graph/memoryStore';
import { KnowledgeGraphEngine } from '../lib/memory-graph/knowledgeGraphEngine';
import type { MemoryLayer, AnyMemoryEntry, ProjectMemoryEntry, DecisionMemoryEntry, ExperienceMemoryEntry } from '../lib/memory-graph/types';

interface MindVaultPanelProps {
  dossier: CommanderDossier | null;
  memories: CommanderMemory[];
  battleLogs: BattleLog[];
  onAddMemory: (memory: Omit<CommanderMemory, 'id' | 'created_at'>) => Promise<void>;
  onDeleteMemory: (id: string) => Promise<void>;
  onUpdateDossier: (dossier: Partial<CommanderDossier>) => Promise<void>;
}

export const MindVaultPanel: React.FC<MindVaultPanelProps> = ({
  dossier,
  memories,
  battleLogs,
  onAddMemory,
  onDeleteMemory,
  onUpdateDossier,
}) => {
  const [activeTab, setActiveTab] = useState<'interview' | 'layers' | 'graph' | 'memories' | 'dossier' | 'timeline'>('layers');
  const [newContent, setNewContent] = useState('');
  const [memoryType, setMemoryType] = useState<CommanderMemory['memory_type']>('fact');
  const [tagInput, setTagInput] = useState('');
  const [importance, setImportance] = useState(5);
  const [isSaving, setIsSaving] = useState(false);

  // 7-Layers state
  const [selectedLayer, setSelectedLayer] = useState<MemoryLayer | 'all'>('projects');
  const [layerSearch, setLayerSearch] = useState('');
  const [selectedProjectDetails, setSelectedProjectDetails] = useState<ProjectMemoryEntry | null>(null);

  // Initialize Memory Store & Graph
  useEffect(() => {
    PersistentMemoryStore.initialize();
    KnowledgeGraphEngine.buildGraph();
  }, []);

  const graphStats = useMemo(() => KnowledgeGraphEngine.getStats(), []);
  const layerStats = useMemo(() => PersistentMemoryStore.getStats(), []);

  const filtered7LayerEntries = useMemo(() => {
    if (layerSearch.trim()) {
      return PersistentMemoryStore.search({
        query: layerSearch.trim(),
        layers: selectedLayer === 'all' ? undefined : [selectedLayer],
      }).map((r) => r.entry);
    }
    if (selectedLayer === 'all') {
      const all: AnyMemoryEntry[] = [];
      const keys: MemoryLayer[] = ['projects', 'decisions', 'experience', 'identity', 'goals', 'knowledge', 'operational'];
      for (const k of keys) {
        all.push(...PersistentMemoryStore.getEntries(k));
      }
      return all;
    }
    return PersistentMemoryStore.getEntries(selectedLayer);
  }, [selectedLayer, layerSearch]);

  // Deep Interview Questions Bank
  const interviewQuestions = [
    {
      id: 'q1',
      domain: 'الرؤية والغاية الكبرى',
      question: 'ما هو هدفك ورؤيتك الأسمى لمشروع NexusOS ومسيرتك خلال السنوات القادمة؟',
      hint: 'مثال: بناء منظومة تقنية وريادية عالمية تنطلق من غزة وتثبت كفاءة العقل الفلسطيني.',
      tag: 'vision',
    },
    {
      id: 'q2',
      domain: 'الروتين اليومي وأوقات التركيز',
      question: 'في أي أوقات تكون في ذروة طاقتك وهدوءك الذهني للبرمجة والتطوير، وكيف يبدأ يومك؟',
      hint: 'مثال: في الصباح الباكر بعد الفجر، أو في ساعات الليل المتأخرة عند استقرار الكهرباء والإنترنت.',
      tag: 'routine',
    },
    {
      id: 'q3',
      domain: 'المبادئ الحاكمة لقراراتك',
      question: 'ما هي القاعدة الأساسية التي تحكم قراراتك في العمل والمال ولا تتنازل عنها أبداً؟',
      hint: 'مثال: الصدق المطلق، عدم تضييع الوقت في الجدال، والتركيز على العمل الملموس فقط.',
      tag: 'principles',
    },
    {
      id: 'q4',
      domain: 'المهارات والاهتمامات التقنية',
      question: 'ما هي أهم المهارات والتقنيات التي تتقنها حالياً وما الذي تريد احترافه قريباً؟',
      hint: 'مثال: أتقن هندسة الذكاء الاصطناعي وتطوير الويب، وأريد التوسع في الأنظمة المستقلة وإدارة الأعمال.',
      tag: 'skills',
    },
    {
      id: 'q5',
      domain: 'إدارة الموارد والمال',
      question: 'ما هي خطتك لإدارة المصاريف والاستثمار المالي وتأمين مستقبلك؟',
      hint: 'مثال: توزيع الدخل بين تطوير المشاريع، الادخار الآمن، ومساعدة العائلة.',
      tag: 'wealth',
    },
    {
      id: 'q6',
      domain: 'حماية التركيز ومكافحة التشتت',
      question: 'ما هو أكثر شيء يشتت انتباهك وتريد من المستشار والوكلاء حمايتك منه وتنبيهك فوراً؟',
      hint: 'مثال: التصفح العشوائي لسوشيال ميديا، أو الانتقال بين المشاريع قبل إكمالها.',
      tag: 'distractions',
    },
    {
      id: 'q7',
      domain: 'الصحة والتحمل في غزة',
      question: 'كيف تحافظ على صحتك النفسية والجسدية في ظل الظروف الصعبة وانقطاع الكهرباء؟',
      hint: 'مثال: الصلاة، القراءة، الرياضة المنزلية، واليقين بأن الشدائد تصنع الرجال.',
      tag: 'health',
    },
  ];

  const [interviewAnswers, setInterviewAnswers] = useState<Record<string, string>>({});
  const [savingQuestionId, setSavingQuestionId] = useState<string | null>(null);

  const handleSaveInterviewAnswer = async (q: typeof interviewQuestions[0]) => {
    const answer = interviewAnswers[q.id];
    if (!answer || !answer.trim() || savingQuestionId) return;

    setSavingQuestionId(q.id);
    try {
      await onAddMemory({
        content: `[${q.domain}]: ${answer.trim()}`,
        memory_type: 'fact',
        context_tags: [q.tag, 'deep_discovery', 'identity'],
        importance: 9,
        mission_id: null,
      });

      // Update dossier principles if relevant
      if (q.tag === 'principles' && dossier) {
        const principles = dossier.decision_principles || [];
        if (!principles.includes(answer.trim())) {
          await onUpdateDossier({
            decision_principles: [answer.trim(), ...principles],
          });
        }
      }

      setInterviewAnswers((prev) => ({ ...prev, [q.id]: '' }));
    } catch (e) {
      console.error(e);
    } finally {
      setSavingQuestionId(null);
    }
  };

  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim() || isSaving) return;
    setIsSaving(true);

    try {
      const tags = tagInput
        .split(/[, ]+/)
        .filter((t) => t.trim().length > 0)
        .map((t) => t.replace('#', ''));

      await onAddMemory({
        content: newContent.trim(),
        memory_type: memoryType,
        context_tags: tags.length > 0 ? tags : ['personal', 'mindset'],
        importance,
        mission_id: null,
      });

      setNewContent('');
      setTagInput('');
      setImportance(5);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const getMemoryTypeBadge = (type: CommanderMemory['memory_type']) => {
    switch (type) {
      case 'decision':
        return { label: 'قرار حاسم', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'preference':
        return { label: 'تفضيل شخصي', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'lesson_learned':
        return { label: 'درس مستفاد', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      default:
        return { label: 'حقيقة موثقة', color: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
    }
  };

  return (
    <div className="flex flex-col h-full rounded-3xl apple-glass p-4 sm:p-5 overflow-hidden text-right">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/5 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Brain className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-white">الملف والذاكرة التراكمية</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            كل ما يعرفه المستشار والوكلاء عن شخصيتك، مبادئك، وقراراتك لتوجيهك بدقة متناهية
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white/[0.03] p-1 rounded-2xl border border-white/5">
          <button
            onClick={() => setActiveTab('layers')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'layers'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            الذاكرة السباعية
          </button>
          <button
            onClick={() => setActiveTab('graph')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'graph'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            رسم المعرفة ({graphStats.totalNodes} عقدة)
          </button>
          <button
            onClick={() => setActiveTab('interview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'interview'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            جلسة التعرف المعمق
          </button>
          <button
            onClick={() => setActiveTab('memories')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'memories'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            الذكريات ({memories.length})
          </button>
          <button
            onClick={() => setActiveTab('dossier')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'dossier'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            ملف القائد
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'timeline'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            سجل الأحداث ({battleLogs.length})
          </button>
        </div>
      </div>

      {/* Tab: 7 Specialized Memory Layers */}
      {activeTab === 'layers' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden space-y-3">
          {/* Sub Header: Search & Layer Filter Pills */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 flex-shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(
                [
                  { key: 'projects', label: 'المشاريع وخطواتها', count: layerStats.projects, icon: FolderKanban },
                  { key: 'decisions', label: 'القرارات وأسبابها', count: layerStats.decisions, icon: Award },
                  { key: 'experience', label: 'الأخطاء والوقاية', count: layerStats.experience, icon: AlertTriangle },
                  { key: 'identity', label: 'الهوية والمبادئ', count: layerStats.identity, icon: UserCheck },
                  { key: 'goals', label: 'الأهداف والخطط', count: layerStats.goals, icon: Target },
                  { key: 'knowledge', label: 'المعرفة وأوبسيديان', count: layerStats.knowledge, icon: Bookmark },
                  { key: 'operational', label: 'العمليات', count: layerStats.operational, icon: Zap },
                  { key: 'all', label: 'الكل', count: Object.values(layerStats).reduce((a, b) => a + b, 0), icon: Layers },
                ] as const
              ).map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setSelectedLayer(tab.key);
                      setSelectedProjectDetails(null);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                      selectedLayer === tab.key
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold shadow-sm'
                        : 'bg-white/[0.03] text-zinc-400 hover:text-white border border-white/5'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                    <span className="text-[10px] opacity-70 bg-white/10 px-1.5 py-0.2 rounded-full font-mono">
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
              <input
                type="text"
                value={layerSearch}
                onChange={(e) => setLayerSearch(e.target.value)}
                placeholder="بحث في الذاكرة السباعية..."
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 pr-8 pl-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/40"
              />
            </div>
          </div>

          {/* Detailed Project Modal/Card overlay if opened */}
          {selectedProjectDetails && (
            <div className="apple-glass-elevated rounded-2xl p-4 border border-emerald-500/30 space-y-3 flex-shrink-0 bg-[#080d1a]">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    [{selectedProjectDetails.code}]
                  </span>
                  <h3 className="text-sm font-bold text-white">{selectedProjectDetails.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedProjectDetails(null)}
                  className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-white/5"
                >
                  إغلاق التفاصيل ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[11px] text-zinc-400 block mb-1">الخطوة القادمة التكتيكية (Next Ops):</span>
                  <p className="text-emerald-300 font-medium bg-emerald-950/20 p-2 rounded-xl border border-emerald-500/20">
                    {selectedProjectDetails.nextOps}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-zinc-400 block mb-1">مكدس التقنيات:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedProjectDetails.techStack.map((tech, i) => (
                      <span key={i} className="text-[10px] bg-white/5 text-zinc-300 px-2 py-0.5 rounded-lg border border-white/5">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Steps List */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-bold text-white block">كافة خطوات التنفيذ التفصيلية ({selectedProjectDetails.steps.length}):</span>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedProjectDetails.steps.map((st) => (
                    <div key={st.stepNumber} className="apple-glass-card rounded-xl p-2.5 border border-white/5 flex items-start gap-2.5">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        st.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : st.status === 'current'
                          ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        خطوة {st.stepNumber}
                      </span>
                      <div className="flex-1">
                        <h5 className="text-xs font-semibold text-white">{st.title}</h5>
                        <p className="text-[11px] text-zinc-300 mt-0.5">{st.description}</p>
                        {st.deliverable && (
                          <span className="text-[10px] text-emerald-400/80 block mt-1">
                            ✓ المخرج: {st.deliverable}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Known Errors & Tech Debt */}
              {selectedProjectDetails.knownErrorsAndTechDebt.length > 0 && (
                <div className="border-t border-white/5 pt-2">
                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>أخطاء وعقبات معروفة تم حلها وتوثيقها للمشروع:</span>
                  </span>
                  <div className="space-y-1">
                    {selectedProjectDetails.knownErrorsAndTechDebt.map((err, i) => (
                      <div key={i} className="text-[11px] text-zinc-300 bg-amber-950/15 p-1.5 rounded-lg border border-amber-500/20">
                        {err}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 7-Layers Stream */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 min-h-0">
            {filtered7LayerEntries.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-12">
                <Layers className="h-8 w-8 text-zinc-600 mb-2 stroke-[1.5]" />
                <p className="text-xs">لا توجد سجلات مطابقة في طبقة {selectedLayer}</p>
              </div>
            ) : (
              filtered7LayerEntries.map((item) => {
                if (item.layer === 'projects') {
                  const proj = item as ProjectMemoryEntry;
                  return (
                    <div
                      key={proj.id}
                      onClick={() => setSelectedProjectDetails(proj)}
                      className="apple-glass-card rounded-2xl p-4 border border-white/5 hover:border-emerald-500/30 cursor-pointer transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            [{proj.code}]
                          </span>
                          <h4 className="text-sm font-bold text-white">{proj.title}</h4>
                        </div>
                        <span className="text-xs font-mono text-emerald-300 font-bold">
                          {proj.progressPercent}% إنجاز
                        </span>
                      </div>

                      <p className="text-xs text-zinc-300 leading-relaxed">{proj.content}</p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5 text-[11px] text-zinc-400">
                        <span className="text-emerald-400/90 font-medium">التركيز: {proj.currentFocus}</span>
                        <span className="text-zinc-500">{proj.steps.length} خطوات تفصيلية • انقر للاستعراض ➔</span>
                      </div>
                    </div>
                  );
                }

                if (item.layer === 'decisions') {
                  const dec = item as DecisionMemoryEntry;
                  return (
                    <div key={dec.id} className="apple-glass-card rounded-2xl p-4 border border-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          ⚖️ قرار حاسم
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          أهمية: {dec.importance}/10
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white">{dec.title}</h4>
                      <p className="text-xs text-zinc-200">{dec.content}</p>

                      <div className="bg-white/[0.02] p-2.5 rounded-xl border border-white/5 space-y-1.5 text-xs">
                        <div>
                          <span className="text-emerald-400 font-semibold">الخيار المعتمد:</span>{' '}
                          <span className="text-zinc-200">{dec.chosenOption}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400 font-semibold">سبب القرار:</span>{' '}
                          <span className="text-zinc-300">{dec.rationale}</span>
                        </div>
                        {dec.decisionPrinciplesApplied.length > 0 && (
                          <div className="text-[11px] text-zinc-400">
                            <span className="font-semibold text-emerald-400">المبادئ المستند عليها:</span>{' '}
                            {dec.decisionPrinciplesApplied.join(' • ')}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                if (item.layer === 'experience') {
                  const exp = item as ExperienceMemoryEntry;
                  return (
                    <div key={exp.id} className="apple-glass-card rounded-2xl p-4 border border-rose-500/20 space-y-2 bg-rose-950/5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          ⚠️ خطأ سابق ودرس مستفاد [{exp.errorType}]
                        </span>
                        <span className="text-[10px] text-zinc-500">أهمية: {exp.importance}/10</span>
                      </div>

                      <h4 className="text-sm font-bold text-white">{exp.title}</h4>
                      <p className="text-xs text-zinc-300">{exp.content}</p>

                      <div className="bg-rose-950/20 p-2.5 rounded-xl border border-rose-500/20 space-y-1 text-xs">
                        <div className="text-zinc-300">
                          <span className="text-amber-400 font-bold">السبب الجذري:</span> {exp.rootCause}
                        </div>
                        <div className="text-zinc-200">
                          <span className="text-emerald-400 font-bold">الحل المطبق:</span> {exp.resolution}
                        </div>
                        <div className="text-emerald-300 font-medium pt-1 border-t border-white/5">
                          <span className="text-white font-bold">🔒 القاعدة الوقائية:</span> {exp.preventiveRule}
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={item.id} className="apple-glass-card rounded-2xl p-3.5 border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        طبقة {item.layer}
                      </span>
                      <span className="text-[10px] text-zinc-500">أهمية: {item.importance}/10</span>
                    </div>
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-zinc-200 leading-relaxed">{item.content}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab: Knowledge Graph Explorer */}
      {activeTab === 'graph' && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden space-y-3">
          <div className="apple-glass-card rounded-2xl p-4 border border-emerald-500/20 bg-emerald-950/10 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Share2 className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">شبكة العلاقات المعرفية الحية (Knowledge Graph)</h3>
              </div>
              <p className="text-xs text-zinc-300">
                تربط القائد بكافة المشاريع، الأهداف، خطوات التنفيذ، القرارات المتخذة، والأخطاء المحمية بقواعد وقائية.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-3 py-1 rounded-xl bg-white/5 text-emerald-300 border border-white/10 font-bold">
                {graphStats.totalNodes} عقدة
              </span>
              <span className="px-3 py-1 rounded-xl bg-white/5 text-cyan-300 border border-white/10 font-bold">
                {graphStats.totalEdges} علاقة ترابط
              </span>
            </div>
          </div>

          {/* Graph Nodes Grid */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {KnowledgeGraphEngine.getGraph().nodes.map((node) => (
                <div key={node.id} className="apple-glass-card rounded-2xl p-3.5 border border-white/5 space-y-1.5 hover:border-emerald-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      node.type === 'project'
                        ? 'bg-blue-500/20 text-blue-300'
                        : node.type === 'decision'
                        ? 'bg-purple-500/20 text-purple-300'
                        : node.type === 'error_lesson'
                        ? 'bg-rose-500/20 text-rose-300'
                        : node.type === 'goal'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {node.type}
                    </span>
                    <span className="text-[10px] text-zinc-500">وزن {node.importance}/10</span>
                  </div>

                  <h5 className="text-xs font-bold text-white">{node.label}</h5>
                  {node.subLabel && <p className="text-[11px] text-zinc-400">{node.subLabel}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Deep Discovery Interview */}
      {activeTab === 'interview' && (
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 min-h-0">
          <div className="apple-glass-card rounded-2xl p-4 border border-emerald-500/20 bg-emerald-950/10">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">جلسة الاستكشاف الذاتي وبناء الوعي</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              كل إجابة تدونها هنا تُحفظ فورياً وتُحقن في عقل **المستشار التكتيكي** و**أسطول الوكلاء**، بحيث لا ينسى أي تفصيلة عن حياتك أو أسلوب تفكيرك أبداً.
            </p>
          </div>

          <div className="space-y-3.5">
            {interviewQuestions.map((q) => (
              <div key={q.id} className="apple-glass-card rounded-2xl p-4 border border-white/5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">{q.domain}</span>
                  <span className="text-[10px] text-zinc-500 bg-white/[0.04] px-2 py-0.5 rounded-full">
                    #{q.tag}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-white leading-relaxed">{q.question}</h4>
                <p className="text-[11px] text-zinc-400">{q.hint}</p>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={interviewAnswers[q.id] || ''}
                    onChange={(e) => setInterviewAnswers({ ...interviewAnswers, [q.id]: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveInterviewAnswer(q)}
                    placeholder="اكتب إجابتك هنا ليحفظها المستشار في ذاكرتك..."
                    className="flex-1 rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
                  />
                  <button
                    onClick={() => handleSaveInterviewAnswer(q)}
                    disabled={!interviewAnswers[q.id]?.trim() || savingQuestionId === q.id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-zinc-950 font-bold text-xs transition-all active:scale-95 flex-shrink-0"
                  >
                    <Check className="h-4 w-4" />
                    <span>{savingQuestionId === q.id ? 'جارٍ الحفظ...' : 'حفظ في الذاكرة'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Memories List & Add */}
      {activeTab === 'memories' && (
        <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0 overflow-hidden">
          {/* Quick Add Form */}
          <div className="md:w-80 apple-glass-card rounded-2xl p-4 border border-white/5 flex flex-col justify-between flex-shrink-0">
            <form onSubmit={handleSaveMemory} className="space-y-3">
              <span className="text-xs font-bold text-white block">إضافة معلومة أو قرار جديد:</span>
              
              <textarea
                rows={3}
                required
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="اكتب ما تريد أن يتذكره المستشار عنك دائماً..."
                className="w-full rounded-xl bg-white/[0.04] border border-white/10 p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 leading-relaxed"
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">النوع:</label>
                  <select
                    value={memoryType}
                    onChange={(e) => setMemoryType(e.target.value as any)}
                    className="w-full rounded-xl bg-[#0e172a] border border-white/10 px-2 py-1.5 text-xs text-white"
                  >
                    <option value="fact">حقيقة</option>
                    <option value="decision">قرار حاسم</option>
                    <option value="preference">تفضيل شخصي</option>
                    <option value="lesson_learned">درس مستفاد</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">الأهمية ({importance}/10):</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={importance}
                    onChange={(e) => setImportance(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 block mb-1">الوسوم:</label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="مثال: #غزة #برمجة #مال"
                  className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving || !newContent.trim()}
                className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all shadow-md active:scale-95 disabled:opacity-40"
              >
                {isSaving ? 'جارٍ الحفظ...' : 'تثبيت في الذاكرة'}
              </button>
            </form>
          </div>

          {/* Memories Stream */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 min-h-0">
            {memories.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-12">
                <Brain className="h-8 w-8 text-zinc-600 mb-2 stroke-[1.5]" />
                <p className="text-xs">لم يتم توثيق أي ذكريات بعد</p>
              </div>
            ) : (
              memories.map((mem) => {
                const badge = getMemoryTypeBadge(mem.memory_type);
                return (
                  <div
                    key={mem.id}
                    className="apple-glass-card rounded-2xl p-3.5 flex items-start justify-between gap-3 border border-white/5"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span className="text-[10px] text-zinc-500">أهمية: {mem.importance}/10</span>
                      </div>
                      <p className="text-xs text-zinc-100 leading-relaxed select-text">{mem.content}</p>
                      
                      {mem.context_tags && mem.context_tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 pt-1">
                          {mem.context_tags.map((t, idx) => (
                            <span key={idx} className="text-[10px] text-zinc-400 bg-white/[0.04] px-1.5 py-0.2 rounded">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => onDeleteMemory(mem.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="حذف"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Commander Dossier */}
      {activeTab === 'dossier' && (
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 min-h-0">
          <div className="apple-glass-card rounded-2xl p-5 border border-white/5 space-y-4">
            <div>
              <span className="text-xs text-emerald-400 font-bold block mb-1">الاسم والرتبة:</span>
              <h3 className="text-base font-bold text-white">{dossier?.callsign || 'محمد قرمان'}</h3>
            </div>

            <div>
              <span className="text-xs text-zinc-400 font-medium block mb-1">بيان الرؤية الكبرى:</span>
              <p className="text-xs text-zinc-200 leading-relaxed bg-white/[0.03] p-3 rounded-xl border border-white/5">
                {dossier?.vision_statement || 'تأسيس منظومة تقنية مستقلة تُمكّن من بناء حلول ذكاء اصطناعي رائدة وتخدم المجتمع.'}
              </p>
            </div>

            <div>
              <span className="text-xs text-zinc-400 font-medium block mb-1">المبادئ الحاكمة لقرارات القائد:</span>
              <div className="space-y-1.5">
                {(dossier?.decision_principles || [
                  'التركيز على العمل الملموس والحلول الواقعية دون تشتت.',
                  'توثيق كل خطوة والتعلم التراكمي من كل معركة وتجربة.',
                  'تحويل تحديات غزة إلى دافع صلب للتميز والابتكار التقني.'
                ]).map((p, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-zinc-300">
                    <Check className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Battle Logs Timeline */}
      {activeTab === 'timeline' && (
        <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 min-h-0">
          {battleLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-12">
              <Clock className="h-8 w-8 text-zinc-600 mb-2 stroke-[1.5]" />
              <p className="text-xs">لا توجد سجلات أحداث موثقة</p>
            </div>
          ) : (
            battleLogs.map((log) => (
              <div key={log.id} className="apple-glass-card rounded-2xl p-3.5 border border-white/5 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{log.title}</h4>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {new Date(log.created_at).toLocaleDateString('ar-EG')}
                  </span>
                </div>
                {log.details && (
                  <p className="text-[11px] text-zinc-300 whitespace-pre-wrap leading-relaxed select-text">
                    {log.details}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};
