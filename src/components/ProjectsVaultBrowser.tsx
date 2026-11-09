import React, { useState } from 'react';
import { 
  FolderKanban, 
  FileText, 
  Compass, 
  ExternalLink, 
  Coffee, 
  BookOpen, 
  HeartPulse, 
  Cpu, 
  Wrench, 
  Folder, 
  ArrowLeft,
  Search,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface ProjectDoc {
  title: string;
  category: string;
  icon: any;
  description: string;
  files: { name: string; type: 'plan' | 'walkthrough' | 'lecture' | 'media'; preview: string }[];
}

export const ProjectsVaultBrowser: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [activeProject, setActiveProject] = useState<ProjectDoc | null>(null);
  const [activeFilePreview, setActiveFilePreview] = useState<{ name: string; content: string } | null>(null);

  const projectsData: ProjectDoc[] = [
    {
      title: 'موقع إدارة كفي روما (Roma Cafe)',
      category: 'business',
      icon: Coffee,
      description: 'نظام متكامل لإدارة الطاولات، تسجيل النتائج، وقوائم المشروبات لكوفي شوب روما.',
      files: [
        {
          name: 'خطة التنفيذ البرمجية (implementation_plan.md)',
          type: 'plan',
          preview: `# خطة بناء تطبيق كفي روما
- بناء واجهة تسجيل نقاط ألعاب الورق والطاولات.
- تصميم نظام سريع للطلبات والفواتير اليومية.
- ربط الواجهة بقاعدة بيانات محلية سريعة الاستجابة.`,
        },
        {
          name: 'سجل المهام المنجزة (task.md)',
          type: 'walkthrough',
          preview: `## المهام المكتملة:
- [x] إعداد هيكل المشروع والـ UI الأولي
- [x] ضبط حسابات النقاط والنتائج
- [x] إضافة تصميم قائمة المشروبات الاحترافية`,
        },
        {
          name: 'تقرير الإنجاز النهائي (walkthrough.md)',
          type: 'walkthrough',
          preview: `تم بناء الموقع واختباره وتوفير حزمة تشغيل فورية للكافيه بنجاح.`,
        }
      ]
    },
    {
      title: 'تنسيق وترتيب محاضرات الجغرافيا',
      category: 'study',
      icon: BookOpen,
      description: 'الأرشيف الأكاديمي الشامل لجغرافيا العالم الجديد والمحاضرات الإقليمية مع 45 خريطة عالية الدقة.',
      files: [
        {
          name: 'مقرر جغرافيا العالم الجديد (new_world_geography_course.md)',
          type: 'lecture',
          preview: `# جغرافيا العالم الجديد
يشمل دراسة القارة الأمريكية، الموقع الفلكي والجغرافي، التضاريس الكبرى، والأقاليم المناخية والنباتية بالتفصيل.`,
        },
        {
          name: 'المحاضرات الإقليمية 1 إلى 5 (regional_geography_lectures_1_to_5.md)',
          type: 'lecture',
          preview: `# المحاضرات من 1 إلى 5
تتضمن التحليل الطبيعي، تضاريس آسيا وأوروبا، السلاسل الجبلية، الهضاب والسهول مع الخرائط التوضيحية المرفقة.`,
        },
        {
          name: 'المحاضرات الإقليمية 6 إلى 10 (regional_geography_lectures_6_to_10.md)',
          type: 'lecture',
          preview: `# المحاضرات من 6 إلى 10
دراسة تفصيلية للمناخ والتوزيع السكاني والموارد الطبيعية.`,
        }
      ]
    },
    {
      title: 'تطوير تطبيق تنظيم الحياة (To Top Life Ops)',
      category: 'life',
      icon: HeartPulse,
      description: 'المعمارية المخصصة لتنظيم الروتين والعادات اليومية وتتبع الإنجاز الشخصي.',
      files: [
        {
          name: 'خطة بناء التطبيق (implementation_plan.md)',
          type: 'plan',
          preview: `# معمارية تطبيق تنظيم الحياة
- لوحة عادات يومية مع نظام نقاط التحفيز.
- متتبع المهام السريع والتركيز الصباحي.
- تصميم الأيقونات والهوية البصرية الفاخرة.`,
        },
        {
          name: 'مسودة التوجيهات (prompt_draft.md)',
          type: 'plan',
          preview: `المطالبات التكتيكية لتوجيه محرك الذكاء الاصطناعي لفهم جدول القائد بدقة.`,
        }
      ]
    },
    {
      title: 'عقلية | AQLIYA HQ & NexusOS',
      category: 'ai',
      icon: Cpu,
      description: 'نظام تشغيل الوكلاء الذاتي وإدارة العمليات المركزية لمحمد قرمان.',
      files: [
        {
          name: 'معمارية نظام تشغيل الوكلاء (aqlia_agentic_os_blueprint.md)',
          type: 'plan',
          preview: `# نظام التشغيل الذاتي للوكلاء
- أسطول من 5 وكلاء متخصصين.
- شبكة المهام المترابطة Task DAG.
- بوابة الحسم القيادية والتحديث المباشر للملفات.`,
        },
        {
          name: 'المخطط المركزي للنظام (aqlia_system_blueprint.md)',
          type: 'plan',
          preview: `المعمارية الشاملة للربط بين تطبيق سطح المكتب والجوال ومخزن Obsidian.`,
        }
      ]
    }
  ];

  const categories = [
    { id: 'all', label: 'جميع المشاريع' },
    { id: 'business', label: 'الأعمال والكافيه' },
    { id: 'study', label: 'الدراسة والمحاضرات' },
    { id: 'life', label: 'تنظيم الحياة' },
    { id: 'ai', label: 'الذكاء والأنظمة' },
  ];

  const filtered = projectsData.filter((p) => {
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex flex-col h-full rounded-3xl apple-glass p-4 sm:p-5 overflow-hidden">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/5 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FolderKanban className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-white">مستكشف المشاريع ودفاتر Obsidian</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            تصفح كافة وثائق ومشاريع أنتيجرافيتي المحفوظة في مخزنك المركزي (E:\Antigravity_Vault)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="file:///E:/Antigravity_Vault"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs text-zinc-200 transition-all"
            title="فتح مجلد المخزن في ويندوز"
          >
            <Folder className="h-3.5 w-3.5 text-emerald-400" />
            <span>فتح المجلد E:\</span>
          </a>
        </div>
      </div>

      {/* Main View Split: Project Cards or Project Details View */}
      {activeProject ? (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden space-y-3">
          
          {/* Project Header & Back Button */}
          <div className="flex items-center justify-between bg-white/[0.03] p-3 rounded-2xl border border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setActiveProject(null);
                  setActiveFilePreview(null);
                }}
                className="p-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 transition-all"
                title="العودة للقائمة"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h3 className="text-sm font-bold text-white">{activeProject.title}</h3>
                <p className="text-[11px] text-zinc-400">{activeProject.description}</p>
              </div>
            </div>
          </div>

          {/* Documents & File Preview Split */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 min-h-0 overflow-hidden">
            {/* File List */}
            <div className="md:col-span-5 flex flex-col gap-2 overflow-y-auto pr-1">
              <span className="text-xs text-zinc-400 font-medium px-1">المستندات ووثائق المشروع:</span>
              {activeProject.files.map((file, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveFilePreview({ name: file.name, content: file.preview })}
                  className={`text-right p-3 rounded-2xl border transition-all ${
                    activeFilePreview?.name === file.name
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'apple-glass-card border-white/5 text-zinc-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{file.name}</span>
                    <FileText className="h-3.5 w-3.5 opacity-60" />
                  </div>
                  <p className="text-[10px] text-zinc-400 line-clamp-1">{file.preview.split('\n')[0]}</p>
                </button>
              ))}
            </div>

            {/* Document Content Reader */}
            <div className="md:col-span-7 apple-glass-card rounded-2xl p-4 overflow-y-auto flex flex-col min-h-0">
              {activeFilePreview ? (
                <div>
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
                    <span className="text-xs font-bold text-emerald-400">{activeFilePreview.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">MARKDOWN PREVIEW</span>
                  </div>
                  <pre className="text-xs text-zinc-200 whitespace-pre-wrap font-sans leading-relaxed select-text">
                    {activeFilePreview.content}
                  </pre>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                  <FileText className="h-8 w-8 text-zinc-600 mb-2 stroke-[1.5]" />
                  <p className="text-xs">اختر وثيقة من القائمة لعرض محتواها</p>
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        <>
          {/* Filters & Search */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4 flex-shrink-0">
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    selectedCategory === c.id
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-white/[0.03] text-zinc-400 border border-white/5 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="absolute right-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث في المشاريع..."
                className="w-full rounded-xl bg-white/[0.03] border border-white/10 pr-9 pl-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Projects Cards Grid */}
          <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 gap-3 min-h-0">
            {filtered.map((proj, idx) => {
              const IconComp = proj.icon;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveProject(proj);
                    setActiveFilePreview({ name: proj.files[0]?.name || '', content: proj.files[0]?.preview || '' });
                  }}
                  className="apple-glass-card rounded-2xl p-4 flex flex-col justify-between cursor-pointer hover:border-emerald-500/30 hover:shadow-lg transition-all text-right group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                        <IconComp className="h-4.5 w-4.5 stroke-[2]" />
                      </div>
                      <span className="text-[10px] text-zinc-500 bg-white/[0.03] px-2 py-0.5 rounded-full border border-white/5">
                        {proj.files.length} ملفات موثقة
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                      {proj.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-emerald-400 font-medium">
                    <span>تصفح وثائق المشروع</span>
                    <ChevronRight className="h-4 w-4 transform rotate-180 group-hover:-translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

    </div>
  );
};
