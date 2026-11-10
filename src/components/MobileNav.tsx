import React from 'react';
import { Target, Database, Compass, Bot, Plus, Brain, Cpu, KeyRound, FolderKanban } from 'lucide-react';

interface MobileNavProps {
  activeTab: 'missions' | 'vault_browser' | 'accounts' | 'intel' | 'radar' | 'swarm' | 'memory' | 'ai' | 'project_life';
  onSelectTab: (tab: 'missions' | 'vault_browser' | 'accounts' | 'intel' | 'radar' | 'swarm' | 'memory' | 'ai' | 'project_life') => void;
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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 apple-glass border-t border-white/5 px-2 py-2 backdrop-blur-2xl">
      <div className="flex items-center justify-around relative max-w-md mx-auto">
        
        {/* Projects */}
        <button
          onClick={() => onSelectTab('missions')}
          className={`flex flex-col items-center gap-1 p-1 text-[11px] transition-all ${
            activeTab === 'missions' ? 'text-emerald-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <Target className="h-4 w-4" />
          <span>المشاريع</span>
        </button>

        {/* Vault Browser */}
        <button
          onClick={() => onSelectTab('vault_browser')}
          className={`flex flex-col items-center gap-1 p-1 text-[11px] transition-all ${
            activeTab === 'vault_browser' ? 'text-emerald-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <FolderKanban className="h-4 w-4" />
          <span>الملفات</span>
        </button>

        {/* Central Action Button */}
        <div className="relative -top-3">
          <button
            onClick={onQuickCapture}
            onContextMenu={(e) => {
              e.preventDefault();
              onOpenVoiceCall();
            }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-emerald-400 to-emerald-600 text-zinc-950 shadow-lg shadow-emerald-950/60 border border-emerald-300/30 active:scale-95 transition-all"
            title="إضافة رابط سريع أو محتوى"
          >
            <Plus className="h-5 w-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Accounts Vault */}
        <button
          onClick={() => onSelectTab('accounts')}
          className={`flex flex-col items-center gap-1 p-1 text-[11px] transition-all ${
            activeTab === 'accounts' ? 'text-emerald-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <KeyRound className="h-4 w-4" />
          <span>الحسابات</span>
        </button>

        {/* Advisor AI */}
        <button
          onClick={() => onSelectTab('ai')}
          className={`flex flex-col items-center gap-1 p-1 text-[11px] transition-all ${
            activeTab === 'ai' ? 'text-emerald-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <Bot className="h-4 w-4" />
          <span>المستشار</span>
        </button>

        {/* Memory & Dossier */}
        <button
          onClick={() => onSelectTab('memory')}
          className={`flex flex-col items-center gap-1 p-1 text-[11px] transition-all ${
            activeTab === 'memory' ? 'text-emerald-400 font-bold' : 'text-zinc-400'
          }`}
        >
          <Brain className="h-4 w-4" />
          <span>الذاكرة</span>
        </button>

      </div>
    </div>
  );
};
