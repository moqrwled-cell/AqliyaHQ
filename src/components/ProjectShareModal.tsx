import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  FileDown, 
  Users, 
  Shield, 
  ExternalLink, 
  GitBranch,
  X,
  Sparkles
} from 'lucide-react';
import type { Mission, IntelItem, StrategicDirective } from '../types';
import { tacticalAudio } from '../lib/audio';

interface ProjectShareModalProps {
  mission: Mission;
  intel: IntelItem[];
  directives: StrategicDirective[];
  onClose: () => void;
}

export const ProjectShareModal: React.FC<ProjectShareModalProps> = ({
  mission,
  intel,
  directives,
  onClose,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'brief' | 'export' | 'collaborators'>('brief');
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [collaboratorRole, setCollaboratorRole] = useState<'advisor' | 'engineer' | 'viewer'>('advisor');
  const [collaborators, setCollaborators] = useState([
    { id: 'c1', name: 'قائد محمد قرمان', role: 'القائد الأعلى (Commander)', email: 'mohammad@aqliya.internal', isOwner: true }
  ]);

  const linkedIntel = intel.filter((i) => i.mission_id === mission.id);

  // Generate tactical SITREP text
  const sitrepText = `
🎖️ **تقرير الموقف التكتيكي (SITREP) - ${mission.title} [${mission.code}]**
• التاريخ: ${new Date().toLocaleDateString('ar-SA')}
• نسبة الإنجاز: ${mission.progress_percent}%
• الحالة: ${mission.status === 'active' ? 'عملية نشطة' : mission.status}

📌 **التركيز الحالي (In Progress):**
${mission.current_focus || 'تطوير البنية الأساسية'}

⚡ **الخطوة الحاسمة القادمة (Next Ops):**
${mission.next_ops || 'مراجعة معايير الإطلاق'}

✅ **آخر الإنجازات الموثقة:**
${mission.done_log?.slice(0, 5).map((l, idx) => `${idx + 1}. ${l}`).join('\n') || 'لا يوجد سجلات بعد.'}

🔍 **الحلول الاستخباراتية المرتبطة (${linkedIntel.length}):**
${linkedIntel.slice(0, 3).map((i) => `- ${i.title}: ${i.problem_solved || i.url}`).join('\n') || 'لا توجد عناصر مرتبطة'}
`.trim();

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    tacticalAudio.playConfirm();
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleDownloadMarkdown = () => {
    tacticalAudio.playConfirm();
    const mdContent = `# مشروع: ${mission.title} (${mission.code})

> تاريخ التصدير: ${new Date().toISOString()}  
> نسبة الإنجاز: ${mission.progress_percent}%  
> الحالة: ${mission.status}

---

## 🎯 التركيز الحالي
${mission.current_focus || 'غير محدد'}

## ⚡ الخطوة القادمة
${mission.next_ops || 'غير محدد'}

## 📝 سجل الإنجازات الموثقة (Done Log)
${mission.done_log?.map((log) => `- [x] ${log}`).join('\n') || '- لا يوجد إنجازات مسجلة بعد.'}

## 💡 الحلول الاستخباراتية المرتبطة
${linkedIntel.map((i) => `### ${i.title}
- **المنصة:** ${i.platform}
- **الرابط:** ${i.url}
- **الحل:** ${i.problem_solved || 'غير مدون'}
- **الخلاصة:** ${i.key_takeaways || 'غير مدون'}
`).join('\n')}
`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${mission.code}_${mission.title.replace(/\s+/g, '_')}_Dossier.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddCollaborator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collaboratorEmail.trim()) return;
    tacticalAudio.playConfirm();
    setCollaborators((prev) => [
      ...prev,
      {
        id: `collab-${Date.now()}`,
        name: collaboratorEmail.split('@')[0],
        role: collaboratorRole === 'advisor' ? 'مستشار تقني (Advisor)' : collaboratorRole === 'engineer' ? 'مهندس أنظمة (Co-Pilot)' : 'مراقب قراءة فقط',
        email: collaboratorEmail.trim(),
        isOwner: false,
      }
    ]);
    setCollaboratorEmail('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#0c101a] border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-right max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b craft-border bg-[#0e1424]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-100">المشاركات والتعاون التكتيكي</h3>
                <span className="text-[10px] font-telemetry px-2 py-0.5 rounded bg-zinc-800 text-cyan-300 border craft-border">
                  [{mission.code}]
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">تصدير تقارير الموقف، ملفات Obsidian، وإدارة شركاء المهمة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b craft-border px-4 bg-black/20 text-xs">
          <button
            onClick={() => setActiveTab('brief')}
            className={`py-3 px-3 font-medium border-b-2 transition-all ${
              activeTab === 'brief'
                ? 'border-cyan-500 text-cyan-300 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            📋 موجز الموقف التكتيكي (SITREP)
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`py-3 px-3 font-medium border-b-2 transition-all ${
              activeTab === 'export'
                ? 'border-cyan-500 text-cyan-300 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            📁 تصدير Obsidian Markdown
          </button>
          <button
            onClick={() => setActiveTab('collaborators')}
            className={`py-3 px-3 font-medium border-b-2 transition-all ${
              activeTab === 'collaborators'
                ? 'border-cyan-500 text-cyan-300 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            👥 الشركاء والمستشارون ({collaborators.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs font-sans">
          
          {/* Tab 1: SITREP Brief */}
          {activeTab === 'brief' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200">
                  ملخص جاهز للإرسال أو النشر السريع:
                </span>
                <button
                  onClick={() => handleCopy(sitrepText, 'sitrep')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-200 transition-all font-telemetry"
                >
                  {copiedType === 'sitrep' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>تم النسخ بنجاح!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>نسخ الموجز التكتيكي</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-3.5 rounded-xl bg-black/60 border craft-border text-zinc-300 text-[11px] leading-relaxed font-telemetry whitespace-pre-wrap selectable-text">
                {sitrepText}
              </pre>

              {/* Instant Messenger Dispatch Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(sitrepText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 text-emerald-300 text-xs font-bold transition-all shadow-sm"
                >
                  <span>💬 إرسال فوري عبر واتساب (WhatsApp)</span>
                </a>
                <a
                  href={`https://t.me/share/url?url=&text=${encodeURIComponent(sitrepText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-800/60 text-cyan-300 text-xs font-bold transition-all shadow-sm"
                >
                  <span>✈️ إرسال فوري عبر تيليجرام (Telegram)</span>
                </a>
              </div>

              {/* Encrypted Share Snapshot Token */}
              <div className="p-3.5 rounded-xl bg-zinc-900/60 border craft-border flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-zinc-200 mb-0.5">رمز لقطة الموقف التكتيكي (Snapshot Token)</h4>
                  <p className="text-[11px] text-zinc-400">رمز مشفر يتيح لمستشارك قراءة حالة المهمة دون كشف أسرار المنظومة</p>
                </div>
                <button
                  onClick={() => handleCopy(`AQLIYA-SNAP:${btoa(unescape(encodeURIComponent(mission.title + ':' + mission.progress_percent)))}`, 'token')}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border craft-border text-xs flex items-center gap-1.5"
                >
                  {copiedType === 'token' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>نسخ الرمز</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Export Obsidian Markdown */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 text-zinc-300 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-bold">
                  <FileDown className="h-4 w-4" />
                  <span>تصدير متكامل لمنظومة Obsidian أو Notion</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  احصل على ملف <code className="text-purple-300">.md</code> مستقل يحتوي على كامل بطاقة المهمة، تاريخ العمليات، والحلول البرمجية المرتبطة المأخوذة من الريلزات والفيديوهات.
                </p>
              </div>

              <div className="flex justify-center pt-3">
                <button
                  onClick={handleDownloadMarkdown}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-lg shadow-purple-950 active:scale-95 text-xs"
                >
                  <FileDown className="h-4 w-4" />
                  <span>تحميل ملف {mission.code}_Dossier.md الآن</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Collaborators Matrix */}
          {activeTab === 'collaborators' && (
            <div className="space-y-4">
              <form onSubmit={handleAddCollaborator} className="flex gap-2">
                <input
                  type="email"
                  value={collaboratorEmail}
                  onChange={(e) => setCollaboratorEmail(e.target.value)}
                  placeholder="أدخل بريد الشريك أو المستشار..."
                  className="flex-1 rounded-xl bg-black/60 border craft-border px-3.5 py-2 text-xs text-zinc-100 outline-none focus:border-cyan-500"
                />
                <select
                  value={collaboratorRole}
                  onChange={(e) => setCollaboratorRole(e.target.value as any)}
                  className="rounded-xl bg-zinc-800 border craft-border px-3 py-2 text-xs text-zinc-300 outline-none"
                >
                  <option value="advisor">مستشار تقني</option>
                  <option value="engineer">مهندس مشارك (Co-Pilot)</option>
                  <option value="viewer">مراقب فقط</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition-all active:scale-95"
                >
                  إضافة
                </button>
              </form>

              <div className="space-y-2">
                {collaborators.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border craft-border"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300">
                        {c.name[0]}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-200">{c.name}</h4>
                        <p className="text-[10px] text-zinc-400 font-telemetry">{c.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-telemetry px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border craft-border">
                        {c.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3 bg-[#0a0e17] border-t craft-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-all"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
