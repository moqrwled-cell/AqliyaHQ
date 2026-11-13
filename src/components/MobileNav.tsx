import React from 'react';
import { Sparkles, TrendingUp, Briefcase, Bot, Menu } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  onSelectTab: (tab: any) => void;
  onOpenSideDrawer: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenSideDrawer,
}) => {
  const navItems = [
    {
      id: 'focus',
      label: 'اليوم',
      icon: Sparkles,
    },
    {
      id: 'discipline',
      label: 'التطور والنوم',
      icon: TrendingUp,
    },
    {
      id: 'missions',
      label: 'المشاريع',
      icon: Briefcase,
    },
    {
      id: 'ai',
      label: 'المستشار',
      icon: Bot,
    },
    {
      id: 'drawer',
      label: 'القائمة',
      icon: Menu,
      isDrawerTrigger: true,
    },
  ];

  return (
    <nav 
      aria-label="شريط التنقل السفلي الفاخر"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/92 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 pb-safe"
    >
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.isDrawerTrigger) {
                  onOpenSideDrawer();
                } else {
                  onSelectTab(item.id);
                }
              }}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl transition-all active:scale-95 ${
                isActive 
                  ? 'text-white font-bold' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <div className="relative">
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
                )}
              </div>
              <span className={`text-[10px] tracking-tight leading-none ${isActive ? 'text-white font-bold' : 'text-zinc-400 font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
