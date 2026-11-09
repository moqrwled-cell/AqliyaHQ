import React from 'react';
import { Target, Database, Compass, Bot, Plus, Brain, Cpu } from 'lucide-react';
import { tacticalAudio } from '../lib/audio';

interface MobileNavProps {
  activeTab: 'missions' | 'intel' | 'radar' | 'ai' | 'vault' | 'swarm';
  onSelectTab: (tab: 'missions' | 'intel' | 'radar' | 'ai' | 'vault' | 'swarm') => void;
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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/95 border-t craft-border px-1.5 py-1.5 backdrop-blur-xl">
      <div className="flex items-center justify-around relative">
        {/* Missions */}
        <button
          onClick={() => {
            tacticalAudio.playBlip();
            onSelectTab('missions');
          }}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] transition-all ${
            activeTab === 'missions' ? 'text-emerald-400 font-bold' : 'text-zinc-500'
          }`}
        >
          <Target className="h-4 w-4" />
          <span>المشاريع</span>
        </button>

        {/* Intel */}
        <button
          onClick={() => {
            tacticalAudio.playBlip();
            onSelectTab('intel');
          }}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] transition-all ${
            activeTab === 'intel' ? 'text-cyan-400 font-bold' : 'text-zinc-500'
          }`}
        >
          <Database className="h-4 w-4" />
          <span>الاستخبارات</span>
        </button>

        {/* Swarm (Agentic OS) */}
        <button
          onClick={() => {
            tacticalAudio.playConfirm();
            onSelectTab('swarm');
          }}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] transition-all ${
            activeTab === 'swarm' ? 'text-cyan-300 font-bold animate-pulse' : 'text-zinc-500'
          }`}
        >
          <Cpu className="h-4 w-4" />
          <span>الوكلاء</span>
        </button>

        {/* Central Tactical Action Hub */}
        <div className="relative -top-2.5">
          <button
            onClick={() => {
              tacticalAudio.playConfirm();
              onQuickCapture();
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              tacticalAudio.playAlert();
              onOpenVoiceCall();
            }}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-500 text-zinc-950 shadow-lg shadow-cyan-950 border border-cyan-400 active:scale-95 transition-all"
            title="نقرة للالتقاط السريع • ضغطة مطولة للمكالمة الصوتية"
          >
            <Plus className="h-5 w-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Mind Vault */}
        <button
          onClick={() => {
            tacticalAudio.playBlip();
            onSelectTab('vault');
          }}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] transition-all ${
            activeTab === 'vault' ? 'text-purple-400 font-bold' : 'text-zinc-500'
          }`}
        >
          <Brain className="h-4 w-4" />
          <span>الذاكرة</span>
        </button>

        {/* AI Copilot */}
        <button
          onClick={() => {
            tacticalAudio.playConfirm();
            onSelectTab('ai');
          }}
          className={`flex flex-col items-center gap-1 p-1 text-[10px] transition-all ${
            activeTab === 'ai' ? 'text-emerald-400 font-bold' : 'text-zinc-500'
          }`}
        >
          <Bot className="h-4 w-4" />
          <span>المستشار</span>
        </button>
      </div>
    </div>
  );
};
