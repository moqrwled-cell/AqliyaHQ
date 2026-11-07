import React, { useState, useEffect } from 'react';
import { supabase, offlineStorage } from './lib/supabase';
import type { 
  Mission, 
  IntelItem, 
  StrategicDirective, 
  CommanderDossier, 
  BattleLog, 
  ChatMessage 
} from './types';
import { HeaderHUD } from './components/HeaderHUD';
import { SecurityLock } from './components/SecurityLock';
import { MissionsPanel } from './components/MissionsPanel';
import { IntelDepotPanel } from './components/IntelDepotPanel';
import { GraphifyRadarPanel } from './components/GraphifyRadarPanel';
import { CommanderAIPanel } from './components/CommanderAIPanel';
import { HandsFreeVoiceCall } from './components/HandsFreeVoiceCall';
import { MobileNav } from './components/MobileNav';
import { exportObsidianMarkdown, exportPureJSON } from './lib/exportMarkdown';
import { tacticalAudio } from './lib/audio';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export function App() {
  // Security State
  const [isLocked, setIsLocked] = useState(true);

  // Layout State
  const [activeLayout, setActiveLayout] = useState<'tri-panel' | 'focused'>('tri-panel');
  const [mobileTab, setMobileTab] = useState<'missions' | 'intel' | 'radar' | 'ai'>('ai');
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false);
  const [showSITREPModal, setShowSITREPModal] = useState(false);

  // Core Data States (Offline-First initial loading)
  const [missions, setMissions] = useState<Mission[]>(() => offlineStorage.get('missions', []));
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [intelItems, setIntelItems] = useState<IntelItem[]>(() => offlineStorage.get('intel', []));
  const [directives, setDirectives] = useState<StrategicDirective[]>(() => offlineStorage.get('directives', []));
  const [dossier, setDossier] = useState<CommanderDossier | null>(() => offlineStorage.get('dossier', null));
  const [battleLogs, setBattleLogs] = useState<BattleLog[]>(() => offlineStorage.get('logs', []));
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => 
    offlineStorage.get('chat', [
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: 'مرحباً بك في غرفة العمليات المركزية «عقلية»، يا قائد. أنا مستشارك ورفيق رحلتك التكتيكية. مشروع NexusOS وبنك الاستخبارات ورادار الأفكار جاهزة بالكامل وتحت إمرتك. كيف نبدأ معركة اليوم؟',
        created_at: new Date().toISOString(),
      }
    ])
  );

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor Network
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

  // Fetch Live Data from Supabase & Subscribe Realtime
  useEffect(() => {
    async function loadData() {
      try {
        const [mRes, iRes, dRes, dosRes, logRes] = await Promise.all([
          supabase.from('missions').select('*').order('created_at', { ascending: false }),
          supabase.from('intel_depot').select('*').order('created_at', { ascending: false }),
          supabase.from('strategic_directives').select('*'),
          supabase.from('commander_dossier').select('*').single(),
          supabase.from('battle_logs').select('*').order('created_at', { ascending: false }).limit(30),
        ]);

        if (mRes.data && mRes.data.length > 0) {
          setMissions(mRes.data);
          offlineStorage.save('missions', mRes.data);
          setSelectedMission(mRes.data[0]);
        }
        if (iRes.data) {
          setIntelItems(iRes.data);
          offlineStorage.save('intel', iRes.data);
        }
        if (dRes.data) {
          setDirectives(dRes.data);
          offlineStorage.save('directives', dRes.data);
        }
        if (dosRes.data) {
          setDossier(dosRes.data);
          offlineStorage.save('dossier', dosRes.data);
        }
        if (logRes.data) {
          setBattleLogs(logRes.data);
          offlineStorage.save('logs', logRes.data);
        }
      } catch (err) {
        console.warn('Using offline data cache', err);
      }
    }

    loadData();

    // Subscribe to Realtime WebSocket changes
    const channel = supabase
      .channel('aqliya-realtime-hub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missions' }, (payload) => {
        loadData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'intel_depot' }, (payload) => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Handlers
  const handleUpdateMission = async (updated: Partial<Mission> & { id: string }) => {
    // Optimistic UI Update
    setMissions((prev) =>
      prev.map((m) => (m.id === updated.id ? { ...m, ...updated, updated_at: new Date().toISOString() } : m))
    );
    if (selectedMission?.id === updated.id) {
      setSelectedMission((prev) => (prev ? { ...prev, ...updated } : null));
    }

    try {
      await supabase.from('missions').update(updated).eq('id', updated.id);
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
      const { data } = await supabase.from('missions').insert(newMission).select().single();
      if (data) {
        setMissions((prev) => [data, ...prev]);
        setSelectedMission(data);
      }
    } catch (e) {
      offlineStorage.queueSyncAction({ table: 'missions', type: 'insert', data: newMission });
    }
  };

  const handleAddIntelItem = async (item: Omit<IntelItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data } = await supabase.from('intel_depot').insert(item).select().single();
      if (data) {
        setIntelItems((prev) => [data, ...prev]);
      }
    } catch (e) {
      offlineStorage.queueSyncAction({ table: 'intel_depot', type: 'insert', data: item });
    }
  };

  const handleUpdateIntelStatus = async (id: string, status: IntelItem['status']) => {
    setIntelItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    try {
      await supabase.from('intel_depot').update({ status }).eq('id', id);
    } catch (e) {
      offlineStorage.queueSyncAction({ table: 'intel_depot', type: 'update', data: { id, status } });
    }
  };

  const handleSendMessage = async (content: string) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    };

    const updated = [...chatMessages, userMsg];
    setChatMessages(updated);
    offlineStorage.save('chat', updated);

    // AI Contextual Tactical Response
    setTimeout(() => {
      let replyContent = `علم يا قائد. بخصوص "${content.slice(0, 35)}..."، تم استحضار المعطيات وربطها بهدفك الاستراتيجي.`;
      const c = content.toLowerCase();

      if (c.includes('nexus') || c.includes('مشروع')) {
        const nexus = missions.find((m) => m.code.includes('NEXUS')) || missions[0];
        replyContent = `مشروع [${nexus?.title || 'NexusOS'}] تقدمه حالياً ${nexus?.progress_percent || 25}%.\n\n• التركيز الحالي: ${nexus?.current_focus || 'تطوير المعمارية'}\n• الخطوة القادمة: ${nexus?.next_ops || 'ربط المستودع'}\n\nجاهز لمساعدتك في صياغة الخطوة القادمة فوراً.`;
      } else if (c.includes('sitrep') || c.includes('صباح') || c.includes('موجز')) {
        replyContent = `📊 **موجز الموقف التكتيكي (SITREP):**\n\n1. المهمة المحورية: **NexusOS Core** (${missions[0]?.progress_percent || 25}%)\n2. بنك الاستخبارات: **${intelItems.length}** روابط وحلول مسجلة.\n3. أولوية اليوم: التركيز على ${missions[0]?.current_focus || 'بناء المقر'}.\n\nأنت القائد، والهدف واضح. بالتوفيق!`;
      } else if (c.includes('حل') || c.includes('ريلز')) {
        const topSolutions = intelItems.filter((i) => i.problem_solved).slice(0, 2);
        if (topSolutions.length > 0) {
          replyContent = `💡 **أبرز الحلول المسجلة في بنكك الاستخباراتي:**\n\n${topSolutions
            .map((s) => `• **${s.title}**: ${s.problem_solved}`)
            .join('\n\n')}\n\nيمكنك استعراض المزيد في تبويب الاستخبارات.`;
        } else {
          replyContent = 'بنك الاستخبارات جاهز. يمكنك مشاركة أي ريلز أو فيديو لحفظه وتوثيق الحل المستفاد منه فوراً.';
        }
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        created_at: new Date().toISOString(),
      };

      setChatMessages((prev) => {
        const next = [...prev, aiMsg];
        offlineStorage.save('chat', next);
        return next;
      });
    }, 700);
  };

  const handleVoiceTranscript = (speech: string, reply: string) => {
    const userMsg: ChatMessage = {
      id: `voice-user-${Date.now()}`,
      role: 'user',
      content: `🎙️ [رسالة صوتية مباشرة]: ${speech}`,
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
    <div className="min-h-screen bg-[#08090d] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30">
      {/* Tactical Top Header */}
      <HeaderHUD
        onLock={() => setIsLocked(true)}
        onOpenVoiceCall={() => setIsVoiceCallOpen(true)}
        onTriggerSITREP={() => {
          setShowSITREPModal(true);
          handleSendMessage('أعطني موجز الموقف الصباحي SITREP وأولويات اليوم');
        }}
        onExportMarkdown={() =>
          exportObsidianMarkdown({
            missions,
            directives,
            intel: intelItems,
            logs: battleLogs,
            memories: [],
          })
        }
        onExportJSON={() =>
          exportPureJSON({
            missions,
            directives,
            intel: intelItems,
            logs: battleLogs,
            dossier,
          })
        }
        isOnline={isOnline}
        activeLayout={activeLayout}
        onToggleLayout={() =>
          setActiveLayout((l) => (l === 'tri-panel' ? 'focused' : 'tri-panel'))
        }
      />

      {/* Main Operational War Room Area */}
      <main className="flex-1 p-3 md:p-4 pb-20 lg:pb-4 overflow-hidden">
        {/* Desktop View: Tri-Panel Draggable Grid */}
        <div className="hidden lg:grid grid-cols-12 gap-4 h-[calc(100vh-80px)]">
          {/* Left Panel: Missions & NexusOS Telemetry (4 cols) */}
          <div className="col-span-4 h-full">
            <MissionsPanel
              missions={missions}
              selectedMission={selectedMission}
              onSelectMission={setSelectedMission}
              onUpdateMission={handleUpdateMission}
              onAddMission={handleAddMission}
            />
          </div>

          {/* Center Panel: Intel Depot & Graphify Radar Toggle (4 cols) */}
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
                  handleSendMessage('أريد مسح وتحديث شبكة الأفكار ورادار Graphify للمشاريع');
                }}
              />
            </div>
          </div>

          {/* Right Panel: Commander AI Companion & Chief of Staff (4 cols) */}
          <div className="col-span-4 h-full">
            <CommanderAIPanel
              messages={chatMessages}
              missions={missions}
              intel={intelItems}
              dossier={dossier}
              onSendMessage={handleSendMessage}
              onOpenVoiceCall={() => setIsVoiceCallOpen(true)}
            />
          </div>
        </div>

        {/* Mobile View: Priority Tabs with Quick Switcher */}
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
              onTriggerGraphifyScan={() => {
                handleSendMessage('مسح وتحديث شبكة Graphify');
              }}
            />
          )}

          {mobileTab === 'ai' && (
            <CommanderAIPanel
              messages={chatMessages}
              missions={missions}
              intel={intelItems}
              dossier={dossier}
              onSendMessage={handleSendMessage}
              onOpenVoiceCall={() => setIsVoiceCallOpen(true)}
            />
          )}
        </div>
      </main>

      {/* Hands-Free Live Voice Call Modal */}
      <HandsFreeVoiceCall
        isOpen={isVoiceCallOpen}
        onClose={() => setIsVoiceCallOpen(false)}
        onTranscriptReceived={handleVoiceTranscript}
      />

      {/* Mobile Bottom Navigation Bar with Priority Chat Access */}
      <MobileNav
        activeTab={mobileTab}
        onSelectTab={setMobileTab}
        onQuickCapture={() => {
          setMobileTab('intel');
        }}
        onOpenVoiceCall={() => setIsVoiceCallOpen(true)}
      />
    </div>
  );
}

export default App;
