import React from 'react';
import { Home, CheckSquare, Bookmark, Settings, Sparkles } from 'lucide-react';

export type MainNavTab = 'home' | 'tasks' | 'intel' | 'settings';

interface UnifiedBottomNavProps {
  activeTab: MainNavTab;
  onSelectTab: (tab: MainNavTab) => void;
  onOpenAdvisor: () => void;
}

export const UnifiedBottomNav: React.FC<UnifiedBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenAdvisor,
}) => {
  const tabs = [
    { id: 'home' as MainNavTab, label: 'الرئيسية', icon: Home },
    { id: 'tasks' as MainNavTab, label: 'المهام والأهداف', icon: CheckSquare },
    { id: 'intel' as MainNavTab, label: 'الاستخبارات', icon: Bookmark },
    { id: 'settings' as MainNavTab, label: 'الإعدادات', icon: Settings },
  ];

  return (
    <nav
      aria-label="شريط التنقل الرئيسي الفاخر"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 backdrop-blur-md border-t border-white/10 px-3 py-2 pb-safe"
    >
      <div className="flex items-center justify-between max-w-lg mx-auto relative px-2">
        {/* First 2 Tabs: Home & Tasks */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onSelectTab('home')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'home' ? 'text-white font-bold scale-105' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-[10px]">الرئيسية</span>
          </button>

          <button
            onClick={() => onSelectTab('tasks')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'tasks' ? 'text-white font-bold scale-105' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CheckSquare className="h-5 w-5" />
            <span className="text-[10px]">المهام</span>
          </button>
        </div>

        {/* Center Floating Advisor Trigger */}
        <div className="-mt-6">
          <button
            onClick={onOpenAdvisor}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 text-black flex items-center justify-center shadow-lg hover:shadow-cyan-500/25 active:scale-95 transition-all border-2 border-[#090d16]"
            title="فتح المستشار الذكي (Jarvis)"
          >
            <Sparkles className="h-6 w-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Last 2 Tabs: Intel & Settings */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => onSelectTab('intel')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'intel' ? 'text-white font-bold scale-105' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Bookmark className="h-5 w-5" />
            <span className="text-[10px]">الاستخبارات</span>
          </button>

          <button
            onClick={() => onSelectTab('settings')}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === 'settings' ? 'text-white font-bold scale-105' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Settings className="h-5 w-5" />
            <span className="text-[10px]">الإعدادات</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
