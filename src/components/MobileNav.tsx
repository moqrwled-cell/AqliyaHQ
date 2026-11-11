import React from 'react';
import { Sparkles, Target, Bot, Plus, LayoutGrid, PhoneCall } from 'lucide-react';

interface MobileNavProps {
  activeTab: 'focus' | 'deck' | 'workspace' | 'missions' | 'vault_browser' | 'accounts' | 'intel' | 'radar' | 'swarm' | 'memory' | 'ai' | 'project_life' | 'opportunity_radar';
  onSelectTab: (tab: 'focus' | 'deck' | 'workspace' | 'missions' | 'vault_browser' | 'accounts' | 'intel' | 'radar' | 'swarm' | 'memory' | 'ai' | 'project_life' | 'opportunity_radar') => void;
  onQuickCapture: () => void;
  onOpenVoiceCall: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onSelectTab,
  onQuickCapture,
  onOpenVoiceCall,
}) => {
  return (
    <nav 
      aria-label="شريط التنقل السفلي"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 apple-glass border-t border-white/10 px-3 py-2 backdrop-blur-3xl pb-safe"
    >
      <div className="flex items-center justify-between max-w-md mx-auto relative px-1">
        
        {/* 1. خطة اليوم (Primary Focus Hub) */}
        <button
          onClick={() => onSelectTab('focus')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-2xl transition-all ${
            activeTab === 'focus' 
              ? 'text-emerald-400 font-bold scale-105' 
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className="relative">
            <Sparkles className="h-5 w-5 stroke-[2.2]" />
            {activeTab === 'focus' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            )}
          </div>
          <span className="text-[11px] font-medium tracking-tight">اليوم</span>
        </button>

        {/* 2. المشاريع النشطة (Missions: Nexus & Roma Cafe) */}
        <button
          onClick={() => onSelectTab('missions')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-2xl transition-all ${
            activeTab === 'missions' 
              ? 'text-emerald-400 font-bold scale-105' 
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className="relative">
            <Target className="h-5 w-5 stroke-[2]" />
            {activeTab === 'missions' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            )}
          </div>
          <span className="text-[11px] font-medium tracking-tight">المشاريع</span>
        </button>

        {/* 3. Central Action Button (Quick Capture / Voice) */}
        <div className="flex-shrink-0 px-2 -top-4 relative">
          <button
            onClick={onQuickCapture}
            onContextMenu={(e) => {
              e.preventDefault();
              onOpenVoiceCall();
            }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-emerald-400 to-emerald-600 text-zinc-950 shadow-[0_6px_20px_rgba(16,185,129,0.45)] border border-emerald-300/40 active:scale-95 transition-all"
            title="إضافة ملاحظة سريعة (اضغط مطولاً للمكالمة الصوتية)"
          >
            <Plus className="h-6 w-6 stroke-[2.8]" />
          </button>
        </div>

        {/* 4. المستشار الذكي (AI Advisor) */}
        <button
          onClick={() => onSelectTab('ai')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-2xl transition-all ${
            activeTab === 'ai' 
              ? 'text-emerald-400 font-bold scale-105' 
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className="relative">
            <Bot className="h-5 w-5 stroke-[2]" />
            {activeTab === 'ai' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            )}
          </div>
          <span className="text-[11px] font-medium tracking-tight">المستشار</span>
        </button>

        {/* 5. غرفة العمليات / المزيد (Executive Deck) */}
        <button
          onClick={() => onSelectTab('deck')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 py-1 px-2 rounded-2xl transition-all ${
            activeTab === 'deck' 
              ? 'text-emerald-400 font-bold scale-105' 
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <div className="relative">
            <LayoutGrid className="h-5 w-5 stroke-[2]" />
            {activeTab === 'deck' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
            )}
          </div>
          <span className="text-[11px] font-medium tracking-tight">التحكم</span>
        </button>

      </div>
    </nav>
  );
};
