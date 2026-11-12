import React from 'react';
import { 
  X, 
  Sparkles, 
  TrendingUp, 
  Briefcase, 
  Bot, 
  LayoutGrid, 
  BookOpen, 
  AlarmClock, 
  GraduationCap, 
  Zap, 
  Lock, 
  ChevronLeft,
  Flame,
  ShieldCheck,
  Send
} from 'lucide-react';

interface MobileSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onSelectTab: (tab: any) => void;
  onOpenAlarm: () => void;
  onOpenClassroom: () => void;
  onOpenUpdate: () => void;
  onLockSystem: () => void;
}

export const MobileSideDrawer: React.FC<MobileSideDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  onOpenAlarm,
  onOpenClassroom,
  onOpenUpdate,
  onLockSystem,
}) => {
  if (!isOpen) return null;

  const navItems = [
    {
      id: 'focus',
      title: 'خطة اليوم والتركيز',
      subtitle: 'الجدول اليومي، السعرات 3000kcal، والمهام',
      icon: Sparkles,
      badge: 'الرئيسية',
    },
    {
      id: 'discipline',
      title: 'لوحة التطور والالتزام',
      subtitle: 'الستريك، منحنى الوزن 70kg، ومعدل الأيام والشهور',
      icon: TrendingUp,
      badge: 'جديد 🔥',
    },
    {
      id: 'missions',
      title: 'المشاريع المركزية',
      subtitle: 'Nexus Legal AI، مقهى روما، وتوسّع العمليات',
      icon: Briefcase,
    },
    {
      id: 'ai',
      title: 'المستشار التكتيكي الذكي',
      subtitle: 'تحليلات تكتيكية واستشارات فورية عبر Gemini',
      icon: Bot,
    },
    {
      id: 'deck',
      title: 'غرفة القيادة المركزية',
      subtitle: 'مؤشرات الأداء الشاملة والرقابة الذاتية',
      icon: LayoutGrid,
    },
    {
      id: 'intel',
      title: 'بنك الاستخبارات والمحتوى',
      subtitle: 'الفيديوهات المحللة، روابط المونتاج، والمعرفة',
      icon: BookOpen,
    },
  ];

  const handleItemClick = (id: string) => {
    onSelectTab(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Container (Sliding from Right for RTL) */}
      <div className="w-[85%] max-w-[340px] h-full bg-[#0a0a0c] border-r border-white/10 shadow-2xl flex flex-col justify-between p-5 text-right overflow-y-auto animate-in slide-in-from-right duration-200">
        
        {/* Top: Profile & Close */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-white/[0.05] border border-white/10 text-zinc-400 hover:text-white active:scale-95 transition-all"
              aria-label="إغلاق القائمة"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <h3 className="text-sm font-bold text-white">محمد قرمان</h3>
                <span className="text-[11px] text-zinc-400 flex items-center justify-end gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>Moha Agent • نشط</span>
                </span>
              </div>
              <div className="h-10 w-10 rounded-2xl overflow-hidden border border-white/20 bg-zinc-900 shadow-md">
                <img src="/logo.png" alt="Moha" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          {/* Navigation Section with Written Titles */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block px-1 mb-1">
              أقسام المنظومة
            </span>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all text-right border ${
                    isActive
                      ? 'bg-white text-black border-white shadow-lg'
                      : 'bg-white/[0.03] text-zinc-300 border-white/5 hover:bg-white/[0.07] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-black text-white'
                          : 'bg-white/10 text-white border border-white/15'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    <ChevronLeft className={`h-4 w-4 ${isActive ? 'text-black' : 'text-zinc-600'}`} />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`text-xs font-bold ${isActive ? 'text-black' : 'text-white'}`}>
                        {item.title}
                      </div>
                      <div className={`text-[10px] leading-tight ${isActive ? 'text-zinc-700' : 'text-zinc-400'}`}>
                        {item.subtitle}
                      </div>
                    </div>
                    <div className={`p-2 rounded-xl ${
                      isActive ? 'bg-black/10 text-black' : 'bg-white/[0.05] text-zinc-300'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Tools & Utilities Section */}
          <div className="space-y-1.5 pt-3 border-t border-white/10">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block px-1 mb-1">
              الأدوات السريعة
            </span>

            {/* Smart Alarm Modal Trigger */}
            <button
              onClick={() => {
                onOpenAlarm();
                onClose();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] transition-all text-right text-zinc-300 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4 text-zinc-600" />
              <div className="flex items-center gap-2.5">
                <div>
                  <span className="text-xs font-bold block text-white">منبه Moha الذكي</span>
                  <span className="text-[10px] text-zinc-400">ضبط منبه الاستيقاظ والنغمات</span>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.05] text-white">
                  <AlarmClock className="h-4 w-4" />
                </div>
              </div>
            </button>

            {/* Classroom Bridge Trigger */}
            <button
              onClick={() => {
                onOpenClassroom();
                onClose();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] transition-all text-right text-zinc-300 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4 text-zinc-600" />
              <div className="flex items-center gap-2.5">
                <div>
                  <span className="text-xs font-bold block text-white">جسر كلاس روم</span>
                  <span className="text-[10px] text-zinc-400">مزامنة مهام ومحاضرات الكلية</span>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.05] text-white">
                  <GraduationCap className="h-4 w-4" />
                </div>
              </div>
            </button>

            {/* OTA Live Update Trigger */}
            <button
              onClick={() => {
                onOpenUpdate();
                onClose();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] transition-all text-right text-zinc-300 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4 text-zinc-600" />
              <div className="flex items-center gap-2.5">
                <div>
                  <span className="text-xs font-bold block text-white">تحديث المنظومة الهوائي</span>
                  <span className="text-[10px] text-zinc-400">جلب أحدث نسخة بنقرة واحدة</span>
                </div>
                <div className="p-2 rounded-xl bg-white/[0.05] text-white">
                  <Zap className="h-4 w-4" />
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Bottom: Lock System */}
        <div className="pt-4 border-t border-white/10">
          <button
            onClick={() => {
              onLockSystem();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/[0.05] border border-white/10 text-xs font-bold text-zinc-300 hover:text-white hover:bg-red-950/20 hover:border-red-500/30 active:scale-98 transition-all"
          >
            <Lock className="h-4 w-4 text-zinc-400" />
            <span>قفل المنظومة يدوياً</span>
          </button>
        </div>

      </div>
    </div>
  );
};
