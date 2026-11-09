import React, { useState } from 'react';
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
  Layers
} from 'lucide-react';
import type { CommanderDossier, CommanderMemory, BattleLog } from '../types';
import { tacticalAudio } from '../lib/audio';

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
  const [activeTab, setActiveTab] = useState<'memories' | 'dossier' | 'timeline'>('memories');
  const [newContent, setNewContent] = useState('');
  const [memoryType, setMemoryType] = useState<CommanderMemory['memory_type']>('fact');
  const [tagInput, setTagInput] = useState('');
  const [importance, setImportance] = useState(5);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim() || isSaving) return;
    tacticalAudio.playConfirm();
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
        return { label: 'قرار حاسم', color: 'bg-emerald-950/60 border-emerald-800 text-emerald-300' };
      case 'preference':
        return { label: 'أسلوب وتفضيل', color: 'bg-cyan-950/60 border-cyan-800 text-cyan-300' };
      case 'lesson_learned':
        return { label: 'درس مستفاد', color: 'bg-amber-950/60 border-amber-800 text-amber-300' };
      default:
        return { label: 'حقيقة شخصية', color: 'bg-purple-950/60 border-purple-800 text-purple-300' };
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 craft-surface rounded-xl p-3.5 sm:p-4 overflow-hidden text-right border craft-border shadow-xl">
      {/* Header HUD */}
      <div className="flex items-center justify-between pb-3 border-b craft-border mb-3 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Brain className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-zinc-100">مستودع العقل والذاكرة التراكمية</h2>
              <span className="text-[10px] font-telemetry px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-800/60 text-purple-300">
                MIND VAULT ({memories.length})
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">كل ما يعرفه المستشار الذكي عن هويتك، قراراتك، ونقاط قوتك</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-lg bg-black/40 border craft-border p-0.5 text-xs font-medium">
          <button
            onClick={() => setActiveTab('memories')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === 'memories' ? 'bg-zinc-800 text-zinc-100 shadow-sm font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            الذاكرة الحية ({memories.length})
          </button>
          <button
            onClick={() => setActiveTab('dossier')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === 'dossier' ? 'bg-zinc-800 text-zinc-100 shadow-sm font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            ملف الهوية
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === 'timeline' ? 'bg-zinc-800 text-zinc-100 shadow-sm font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            سجل المعركة ({battleLogs.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain pr-1 text-xs space-y-3.5 scrollbar-tactical">
        
        {/* Tab 1: Memories & Quick Feed */}
        {activeTab === 'memories' && (
          <div className="space-y-3.5">
            {/* Quick Memory Input Box */}
            <form onSubmit={handleSaveMemory} className="rounded-xl border border-purple-500/30 bg-[#0e1220] p-3.5 space-y-2.5 shadow-md">
              <div className="flex items-center justify-between">
                <span className="font-bold text-zinc-200 flex items-center gap-1.5 text-xs">
                  <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                  <span>علّم المستشار شيئاً جديداً عنك (تراكم الذاكرة)</span>
                </span>
                <span className="text-[10px] text-zinc-500 font-telemetry">AUTONOMOUS LEARNING</span>
              </div>

              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="اكتب حقيقة، قراراً اتخذته، أسلوباً تفضله، أو درساً تعلمته اليوم... وسيحفظه المستشار ليعرفك أفضل للأبد."
                rows={2}
                className="w-full rounded-xl bg-black/60 border craft-border px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-purple-500/60 resize-none leading-relaxed"
                required
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <select
                    value={memoryType}
                    onChange={(e) => setMemoryType(e.target.value as any)}
                    className="rounded-lg bg-zinc-900 border craft-border px-2.5 py-1 text-[11px] text-zinc-300 outline-none cursor-pointer"
                  >
                    <option value="fact">حقيقة شخصية (Fact)</option>
                    <option value="decision">قرار حاسم (Decision)</option>
                    <option value="preference">أسلوب وتفضيل (Preference)</option>
                    <option value="lesson_learned">درس مستفاد (Lesson)</option>
                  </select>

                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="وسوم: #تركيز #nexusos"
                    className="w-36 rounded-lg bg-black/50 border craft-border px-2.5 py-1 text-[11px] text-zinc-200 font-telemetry outline-none focus:border-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!newContent.trim() || isSaving}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs transition-all shadow-md shadow-purple-950 active:scale-95"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>تثبيت في الذاكرة</span>
                </button>
              </div>
            </form>

            {/* Memories List */}
            <div className="space-y-2">
              {memories.length > 0 ? (
                memories.map((mem) => {
                  const badge = getMemoryTypeBadge(mem.memory_type);
                  return (
                    <div
                      key={mem.id}
                      className="rounded-xl border craft-border bg-zinc-900/60 p-3 hover:bg-zinc-900/90 transition-all flex items-start justify-between gap-3 group"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-telemetry px-2 py-0.5 rounded border ${badge.color}`}>
                            {badge.label}
                          </span>
                          <span className="text-[10px] font-telemetry text-zinc-500">
                            {new Date(mem.created_at || Date.now()).toLocaleDateString('ar-SA')}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-200 leading-relaxed font-sans selectable-text">
                          {mem.content}
                        </p>

                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {mem.context_tags?.map((t, idx) => (
                            <span key={idx} className="text-[10px] font-telemetry text-zinc-400 bg-black/30 px-1.5 py-0.5 rounded border craft-border">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm('هل تريد حذف هذه المعلومة من ذاكرة المستشار؟')) {
                            onDeleteMemory(mem.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-500 hover:text-rose-400 transition-opacity"
                        title="حذف المعلومة"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-zinc-500 text-xs">
                  لا توجد ذكريات مسجلة بعد. استخدم صندوق التدوين أعلاه لتغذية ذاكرة المستشار!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Identity & Dossier */}
        {activeTab === 'dossier' && (
          <div className="space-y-3.5">
            <div className="rounded-xl border craft-border bg-zinc-900/80 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b craft-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-sm font-telemetry">
                    MQ
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100">القائد محمد قرمان</h3>
                    <p className="text-[11px] text-zinc-400 font-telemetry">Commander Callsign: {dossier?.callsign || 'Mohammad'}</p>
                  </div>
                </div>
                <span className="text-[10px] font-telemetry px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  GAZA • COMMANDER
                </span>
              </div>

              <div>
                <span className="text-[10px] font-telemetry uppercase text-zinc-500 block mb-1">
                  // الرؤية العليا والغاية الكبرى
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed bg-black/40 p-2.5 rounded-xl border craft-border">
                  {dossier?.vision_statement ||
                    'بناء أنظمة تشغيل وذكاء اصطناعي سيادية فائقة القوة تنطلق من غزة لتصل للعالم، وتحقيق استقلالية تكنولوجية كاملة.'}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-telemetry uppercase text-zinc-500 block mb-1">
                  // المبادئ القيادية الحاكمة للقرارات
                </span>
                <div className="space-y-1">
                  {(dossier?.decision_principles || [
                    'التركيز على العمل الملموس والحلول الواقعية دون تشتت.',
                    'توثيق كل خطوة والتعلم التراكمي من كل معركة.',
                    'تحويل التحديات والظروف الصعبة إلى دافع للبناء والتفوق التقني المستمر.',
                  ]).map((principle, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-zinc-950/60 border craft-border text-zinc-300 text-xs">
                      <Shield className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      <span>{principle}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-telemetry uppercase text-zinc-500 block mb-1">
                  // المهارات الهندسية والتكتيكية الأساسية
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(dossier?.core_skills || [
                    'AI Engineering',
                    'Full-Stack Architecture',
                    'Business Systems',
                    'Supabase & PostgreSQL',
                    'React & TypeScript',
                    'NexusOS Core Design',
                  ]).map((skill, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-zinc-800 border craft-border text-xs text-zinc-300 font-telemetry">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Timeline & Battle Logs */}
        {activeTab === 'timeline' && (
          <div className="space-y-2">
            {battleLogs.length > 0 ? (
              battleLogs.map((log) => (
                <div key={log.id} className="rounded-xl border craft-border bg-zinc-900/60 p-3 hover:bg-zinc-900/90 transition-all flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0 mt-0.5">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-zinc-100">{log.title}</h4>
                      <span className="text-[10px] font-telemetry text-zinc-500">
                        {new Date(log.created_at).toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    {log.details && (
                      <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                        {log.details}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-zinc-500 text-xs">
                لا توجد سجلات في سجل المعركة بعد. وثق أول إنجاز أو أكمل جلسة إحاطة الموقف!
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
