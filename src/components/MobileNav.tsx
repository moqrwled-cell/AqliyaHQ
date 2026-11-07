import React from 'react';
import { Target, Database, Compass, Bot, Plus, PhoneCall } from 'lucide-react';
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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0d14]/95 border-t border-slate-800/90 px-3 py-2 backdrop-blur-xl">
      <div className="flex items-center justify-around relative">
        {/* Missions Tab */}
        <button
          onClick={() => {
            tacticalAudio.playBlip();
            onSelectTab('missions');
          }}
          className={`flex flex-col items-center gap-1 p-1 text-[11px] font-medium transition-all ${
            activeTab === 'missions' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Target className="h-4 w-4" />
          <span>المهمات</span>
        </button>

        {/* Intel Depot Tab */}
        <button
          onClick={() => {
            tacticalAudio.playBlip();
            onSelectTab('intel');
          }}
          className={`flex flex-col items-center gap-1 p-1 text-[11px] font-medium transition-all ${
            activeTab === 'intel' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Database className="h-4 w-4" />
          <span>الاستخبارات</span>
        </button>

        {/* Central Tactical Action Button (Floating) */}
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
            className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-slate-950 shadow-xl border-2 border-[#0a0d14] glow-emerald active:scale-95 transition-all"
            title="نقرة للالتقاط السريع • ضغطة مطولة للمكالمة الصوتية"
          >
            <Plus className="h-6 w-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Graphify Radar Tab */}
        <button
          onClick={() => {
            tacticalAudio.playBlip();
            onSelectTab('radar');
          }}
          className={`flex flex-col items-center gap-1 p-1 text-[11px] font-medium transition-all ${
            activeTab === 'radar' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Compass className="h-4 w-4" />
          <span>الرادار</span>
        </button>

        {/* Commander AI Tab (Highlighted priority access) */}
        <button
          onClick={() => {
            tacticalAudio.playConfirm();
            onSelectTab('ai');
          }}
          className={`flex flex-col items-center gap-1 p-1 text-[11px] font-medium transition-all relative ${
            activeTab === 'ai' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <Bot className="h-4 w-4 text-cyan-400" />
          <span>المستشار</span>
        </button>
      </div>
    </div>
  );
};
