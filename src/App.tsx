import React, { useState, useEffect } from 'react';
import { supabase, offlineStorage } from './lib/supabase';
import type { 
  Mission, 
  IntelItem, 
  StrategicDirective, 
  CommanderDossier, 
  BattleLog, 
  ChatMessage,
  CommanderMemory
} from './types';
import { HeaderHUD } from './components/HeaderHUD';
import { SecurityLock } from './components/SecurityLock';
import { MissionsPanel } from './components/MissionsPanel';
import { IntelDepotPanel } from './components/IntelDepotPanel';
import { GraphifyRadarPanel } from './components/GraphifyRadarPanel';
import { CommanderAIPanel } from './components/CommanderAIPanel';
import { HandsFreeVoiceCall } from './components/HandsFreeVoiceCall';
import { SettingsModal } from './components/SettingsModal';
import { MobileNav } from './components/MobileNav';
import { exportObsidianMarkdown, exportPureJSON } from './lib/exportMarkdown';

export function App() {
  const [isLocked, setIsLocked] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeLayout, setActiveLayout] = useState<'tri-panel' | 'focused'>('tri-panel');
  const [mobileTab, setMobileTab] = useState<'missions' | 'intel' | 'radar' | 'ai'>('ai');
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false);

  // Offline-First initial state loading
  const [missions, setMissions] = useState<Mission[]>(() => offlineStorage.get('missions', []));
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [intelItems, setIntelItems] = useState<IntelItem[]>(() => offlineStorage.get('intel', []));
  const [directives, setDirectives] = useState<StrategicDirective[]>(() => offlineStorage.get('directives', []));
  const [dossier, setDossier] = useState<CommanderDossier | null>(() => offlineStorage.get('dossier', null));
  const [memories, setMemories] = useState<CommanderMemory[]>(() => offlineStorage.get('memories', []));
  const [battleLogs, setBattleLogs] = useState<BattleLog[]>(() => offlineStorage.get('logs', []));
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => 
    offlineStorage.get('chat', [
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: 'أهلاً بك في غرفة العمليات المركزية «عقلية»، يا قائد محمد. مستشارك التكتيكي جاهز ومتصل بمحرك Google Gemini فائق السرعة، ومربوط بسجل ذكرياتك ومشروع NexusOS وبنك الاستخبارات. كيف نتحرك اليوم؟',
        created_at: new Date().toISOString(),
      }
    ])
  );

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        const [mRes, iRes, dRes, dosRes, memRes, logRes] = await Promise.all([
          supabase.from('missions').select('*').order('created_at', { ascending: false }),
          supabase.from('intel_depot').select('*').order('created_at', { ascending: false }),
          supabase.from('strategic_directives').select('*'),
          supabase.from('commander_dossier').select('*').single(),
          supabase.from('commander_memories').select('*').order('importance', { ascending: false }),
          supabase.from('battle_logs').select('*').order('created_at', { ascending: false }).limit(30),
        ]);

        if (mRes.data && mRes.data.length > 0) {
          setMissions(mRes.data as Mission[]);
          offlineStorage.save('missions', mRes.data);
          setSelectedMission(mRes.data[0] as Mission);
        }
        if (iRes.data) {
          setIntelItems(iRes.data as IntelItem[]);
          offlineStorage.save('intel', iRes.data);
        }
        if (dRes.data) {
          setDirectives(dRes.data as StrategicDirective[]);
          offlineStorage.save('directives', dRes.data);
        }
        if (dosRes.data) {
          setDossier(dosRes.data as CommanderDossier);
          offlineStorage.save('dossier', dosRes.data);
        }
        if (memRes.data) {
          setMemories(memRes.data as CommanderMemory[]);
          offlineStorage.save('memories', memRes.data);
        }
        if (logRes.data) {
          setBattleLogs(logRes.data as BattleLog[]);
          offlineStorage.save('logs', logRes.data);
        }
      } catch (err) {
        console.warn('Using local cache', err);
      }
    }

    loadData();

    // Supabase Realtime channel
    const channel = supabase
      .channel('aqliya-realtime-hub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, () => {
        loadData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'intel_depot' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleUpdateMission = async (updated: Partial<Mission> & { id: string }) => {
    setMissions((prev) =>
      prev.map((m) => (m.id === updated.id ? { ...m, ...updated, updated_at: new Date().toISOString() } : m))
    );
    if (selectedMission?.id === updated.id) {
      setSelectedMission((prev) => (prev ? { ...prev, ...updated } : null));
    }

    try {
      await (supabase.from('missions') as any).update(updated).eq('id', updated.id);
    } catch (e) {
      offlineStorage.queueSyncAction({ table: 'missions', type: 'update', data: updated });
    }
  };

  const handleAddMission = async (title: string, code: string) => {
    const newMission: Partial<Mission> = {
      title,
      code,
      status: 'active',
      progress_percent: 0,
      current_focus: 'تأسيس البنية الأولية والتخطيط للمرحلة القادمة',
      next_ops: 'تحديد المعالم التقنية والجدول الزمني',
      done_log: [],
      tags: [],
    };

    try {
      const { data } = await (supabase.from('missions') as any).insert(newMission).select().single();
      if (data) {
        setMissions((prev) => [data as Mission, ...prev]);
        setSelectedMission(data as Mission);
      }
    } catch (e) {
      offlineStorage.queueSyncAction({ table: 'missions', type: 'insert', data: newMission });
    }
  };

  const handleAddIntelItem = async (item: Omit<IntelItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data } = await (supabase.from('intel_depot') as any).insert(item).select().single();
      if (data) {
        setIntelItems((prev) => [data as IntelItem, ...prev]);
      }
    } catch (e) {
      offlineStorage.queueSyncAction({ table: 'intel_depot', type: 'insert', data: item });
    }
  };

  const handleUpdateIntelStatus = async (id: string, status: IntelItem['status']) => {
    setIntelItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    try {
      await (supabase.from('intel_depot') as any).update({ status }).eq('id', id);
    } catch (e) {
      offlineStorage.queueSyncAction({ table: 'intel_depot', type: 'update', data: { id, status } });
    }
  };

  const handleAddChatMessage = (msg: ChatMessage) => {
    const updated = [...chatMessages, msg];
    setChatMessages(updated);
    offlineStorage.save('chat', updated);
  };

  const handleVoiceTranscript = (speech: string, reply: string) => {
    const userMsg: ChatMessage = {
      id: `voice-user-${Date.now()}`,
      role: 'user',
      content: `🎙️ [رسالة صوتية]: ${speech}`,
      created_at: new Date().toISOString(),
    };
    const aiMsg: ChatMessage = {
      id: `voice-ai-${Date.now()}`,
      role: 'assistant',
      content: reply,
      created_at: new Date().toISOString(),
    };
    const next = [...chatMessages, userMsg, aiMsg];
    setChatMessages(next);
    offlineStorage.save('chat', next);
  };

  if (isLocked) {
    return <SecurityLock onUnlock={() => setIsLocked(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-zinc-800">
      {/* Header HUD */}
      <HeaderHUD
        onLock={() => setIsLocked(true)}
        onOpenVoiceCall={() => setIsVoiceCallOpen(true)}
        onTriggerSITREP={() => {
          handleAddChatMessage({
            id: `sitrep-${Date.now()}`,
            role: 'assistant',
            content: `📊 **موجز الموقف التكتيكي (SITREP):**\n\n1. المهمة المحورية: **NexusOS Core** (${missions[0]?.progress_percent || 25}%)\n2. بنك الاستخبارات: **${intelItems.length}** روابط وحلول مسجلة.\n3. أولوية اليوم: التركيز على ${missions[0]?.current_focus || 'بناء المقر'}.\n\nأنت القائد، والهدف واضح. بالتوفيق!`,
            created_at: new Date().toISOString(),
          });
        }}
        onExportMarkdown={() =>
          exportObsidianMarkdown({
            missions,
            directives,
            intel: intelItems,
            logs: battleLogs,
            memories,
          })
        }
        onOpenSettings={() => setIsSettingsOpen(true)}
        isOnline={isOnline}
        activeLayout={activeLayout}
        onToggleLayout={() =>
          setActiveLayout((l) => (l === 'tri-panel' ? 'focused' : 'tri-panel'))
        }
      />

      {/* Main Command Center Deck */}
      <main className="flex-1 p-3 md:p-4 pb-20 lg:pb-4 overflow-hidden max-w-[1700px] w-full mx-auto">
        {/* Desktop View */}
        <div className="hidden lg:grid grid-cols-12 gap-4 h-[calc(100vh-80px)]">
          {/* Left Panel: Missions & NexusOS */}
          <div className="col-span-4 h-full">
            <MissionsPanel
              missions={missions}
              selectedMission={selectedMission}
              onSelectMission={setSelectedMission}
              onUpdateMission={handleUpdateMission}
              onAddMission={handleAddMission}
            />
          </div>

          {/* Center Panel: Intel Depot & Graphify Radar */}
          <div className="col-span-4 h-full flex flex-col gap-4">
            <div className="flex-1 min-h-[50%]">
              <IntelDepotPanel
                items={intelItems}
                missions={missions}
                onAddItem={handleAddIntelItem}
                onUpdateStatus={handleUpdateIntelStatus}
              />
            </div>
            <div className="h-[45%]">
              <GraphifyRadarPanel
                missions={missions}
                intel={intelItems}
                directives={directives}
                onTriggerGraphifyScan={() => {
                  handleAddChatMessage({
                    id: `scan-${Date.now()}`,
                    role: 'assistant',
                    content: 'تم تحديث رادار الأفكار المعرفي عبر محرك Graphify، وربط كافة العقد بالمشاريع والاستراتيجيات بنجاح.',
                    created_at: new Date().toISOString(),
                  });
                }}
              />
            </div>
          </div>

          {/* Right Panel: Commander AI with Gemini 1.5 Flash */}
          <div className="col-span-4 h-full">
            <CommanderAIPanel
              messages={chatMessages}
              missions={missions}
              intel={intelItems}
              dossier={dossier}
              memories={memories}
              onSendMessage={handleAddChatMessage}
              onOpenVoiceCall={() => setIsVoiceCallOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          </div>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden h-[calc(100vh-140px)]">
          {mobileTab === 'missions' && (
            <MissionsPanel
              missions={missions}
              selectedMission={selectedMission}
              onSelectMission={setSelectedMission}
              onUpdateMission={handleUpdateMission}
              onAddMission={handleAddMission}
            />
          )}

          {mobileTab === 'intel' && (
            <IntelDepotPanel
              items={intelItems}
              missions={missions}
              onAddItem={handleAddIntelItem}
              onUpdateStatus={handleUpdateIntelStatus}
            />
          )}

          {mobileTab === 'radar' && (
            <GraphifyRadarPanel
              missions={missions}
              intel={intelItems}
              directives={directives}
              onTriggerGraphifyScan={() => {}}
            />
          )}

          {mobileTab === 'ai' && (
            <CommanderAIPanel
              messages={chatMessages}
              missions={missions}
              intel={intelItems}
              dossier={dossier}
              memories={memories}
              onSendMessage={handleAddChatMessage}
              onOpenVoiceCall={() => setIsVoiceCallOpen(true)}
              onOpenSettings={() => setIsSettingsOpen(true)}
            />
          )}
        </div>
      </main>

      {/* Hands-Free Voice Call */}
      <HandsFreeVoiceCall
        isOpen={isVoiceCallOpen}
        onClose={() => setIsVoiceCallOpen(false)}
        onTranscriptReceived={handleVoiceTranscript}
      />

      {/* Settings Modal (Gemini API & Security) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Mobile Navigation */}
      <MobileNav
        activeTab={mobileTab}
        onSelectTab={setMobileTab}
        onQuickCapture={() => setMobileTab('intel')}
        onOpenVoiceCall={() => setIsVoiceCallOpen(true)}
      />
    </div>
  );
}

export default App;
