import React from 'react';
import { Target, Database, Compass, Bot, Plus } from 'lucide-react';
import { tacticalAudio } from '../lib/audio';

interface MobileNavProps {
  activeTab: 'missions' | 'intel' | 'radar' | 'ai';
  onSelectTab: (tab: 'missions' | 'intel' | 'radar' | 'ai') => void;
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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/95 border-t craft-border px-3 py-2 backdrop-blur-xl">
      <div className="flex items-center justify-around relative">
        <button
          onClick={() => {
            tacticalAudio.playBlip();
            onSelectTab('missions');
          }}
          className={`flex flex-col items-center gap-1 p-1 text-[11px] transition-all ${
            activeTab === 'missions' ? 'text-zinc-100 font-bold' : 'text-zinc-500'
          }`}
        >
          <Target className="h-4 w-4" />
          <span>المهمات</span>
        </button>

        <button
          onClick={() => {
            tacticalAudio.playBlip();
            onSelectTab('intel');
          }}
          className={`flex flex-col items-center gap-1 p-1 text-[11px] transition-all ${
            activeTab === 'intel' ? 'text-zinc-100 font-bold' : 'text-zinc-500'
          }`}
        >
          <Database className="h-4 w-4" />
          <span>الاستخبارات</span>
        </button>

        {/* Central Tactical Action Button */}
        <div className="relative -top-3">
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
            className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-950 shadow-md border border-zinc-700 active:scale-95 transition-all"
            title="نقرة للالتقاط السريع • ضغطة مطولة للمكالمة الصوتية"
          >
            <Plus className="h-5 w-5 stroke-[2.5]" />
          </button>
        </div>

        <button
          onClick={() => {
            tacticalAudio.playBlip();
            onSelectTab('radar');
          }}
          className={`flex flex-col items-center gap-1 p-1 text-[11px] transition-all ${
            activeTab === 'radar' ? 'text-zinc-100 font-bold' : 'text-zinc-500'
          }`}
        >
          <Compass className="h-4 w-4" />
          <span>الرادار</span>
        </button>

        <button
          onClick={() => {
            tacticalAudio.playConfirm();
            onSelectTab('ai');
          }}
          className={`flex flex-col items-center gap-1 p-1 text-[11px] transition-all ${
            activeTab === 'ai' ? 'text-zinc-100 font-bold' : 'text-zinc-500'
          }`}
        >
          <Bot className="h-4 w-4" />
          <span>المستشار</span>
        </button>
      </div>
    </div>
  );
};
