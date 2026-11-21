import React, { useState, useEffect, useMemo } from 'react';
import { supabase, offlineStorage } from './lib/supabase';
import type { 
  Mission, 
  IntelItem, 
  StrategicDirective, 
  CommanderDossier, 
  BattleLog, 
  ChatMessage,
  CommanderMemory,
  WatchdogAlert
} from './types';
import { HeaderHUD } from './components/HeaderHUD';
import { SecurityLock } from './components/SecurityLock';
import { MissionsPanel } from './components/MissionsPanel';
import { IntelDepotPanel } from './components/IntelDepotPanel';
import { GraphifyRadarPanel } from './components/GraphifyRadarPanel';
import { CommanderAIPanel } from './components/CommanderAIPanel';
import { MindVaultPanel } from './components/MindVaultPanel';
import { AgenticCommandDeck } from './components/agentic-os/AgenticCommandDeck';
import { ProjectsVaultBrowser } from './components/ProjectsVaultBrowser';
import { ProjectLifeIntelligenceHub } from './components/project-life/ProjectLifeIntelligenceHub';
import { OpportunityRadarView } from './components/opportunity-radar/OpportunityRadarView';
import { ExecutiveCommandCenter, type ExecutiveSection } from './components/executive/ExecutiveCommandCenter';
import { AccountsVaultPanel } from './components/AccountsVaultPanel';
import { SITREPBriefingModal } from './components/SITREPBriefingModal';
import { WatchdogDrawer } from './components/WatchdogDrawer';
import { HandsFreeVoiceCall } from './components/HandsFreeVoiceCall';
import { SettingsModal } from './components/SettingsModal';
import { MobileNav } from './components/MobileNav';
import { MobileFocusHub } from './components/mobile/MobileFocusHub';
import { MobileSideDrawer } from './components/mobile/MobileSideDrawer';
import { DisciplineDashboard } from './components/dashboard/DisciplineDashboard';
import { AlarmManagerModal } from './components/mobile/AlarmManagerModal';
import { GoogleWorkspaceHubModal } from './components/google/GoogleWorkspaceHubModal';
import { AlarmRingingOverlay } from './components/mobile/AlarmRingingOverlay';
import { QuickCaptureModal } from './components/QuickCaptureModal';
import { UnifiedBottomNav, type MainNavTab } from './components/navigation/UnifiedBottomNav';
import { FocusedJarvisHomeScreen } from './components/home/FocusedJarvisHomeScreen';
import { TasksAndGoalsScreen } from './components/tasks/TasksAndGoalsScreen';
import { AdvisorProactiveEngine } from './lib/advisor/advisorProactiveEngine';
import { exportObsidianMarkdown, exportPureJSON } from './lib/exportMarkdown';
import { scanSystemWatchdog } from './lib/watchdogEngine';
import { GmailClassroomBridge } from './lib/classroom/gmailClassroomBridge';
import { tacticalAudio } from './lib/audio';
import { Menu, CheckCircle2, X, Sparkles, PhoneCall, Bot } from 'lucide-react';

export function App() {
  const [isLocked, setIsLocked] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBriefingOpen, setIsBriefingOpen] = useState(false);
  const [isWatchdogOpen, setIsWatchdogOpen] = useState(false);
  const [isSideDrawerOpen, setIsSideDrawerOpen] = useState(false);
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);
  const [isClassroomModalOpen, setIsClassroomModalOpen] = useState(false);
  const [activeMainView, setActiveMainView] = useState<'focus' | 'discipline' | 'deck' | 'workspace' | 'vault_browser' | 'accounts' | 'swarm' | 'memory' | 'project_life' | 'opportunity_radar'>('focus');
  const [activeLayout, setActiveLayout] = useState<'tri-panel' | 'focused'>('tri-panel');
  const [mobileTab, setMobileTab] = useState<'focus' | 'discipline' | 'deck' | 'workspace' | 'missions' | 'vault_browser' | 'accounts' | 'intel' | 'radar' | 'swarm' | 'memory' | 'ai' | 'project_life' | 'opportunity_radar'>('focus');
  const [mainNavTab, setMainNavTab] = useState<MainNavTab>('home');
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false);
  const [incomingSharedText, setIncomingSharedText] = useState<string | null>(null);
  const [intelToast, setIntelToast] = useState<{ id: number; title: string; url: string } | null>(null);

  useEffect(() => {
    if (intelToast) {
      const timer = setTimeout(() => {
        setIntelToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [intelToast]);

  useEffect(() => {
    AdvisorProactiveEngine.start();
    return () => AdvisorProactiveEngine.stop();
  }, []);

  // Sync state if an external module or advisor modifies intel
  useEffect(() => {
    const handleIntelSync = () => {
      const cached = offlineStorage.get<IntelItem[]>('intel', []);
      if (cached) {
        setIntelItems(cached);
      }
    };
    window.addEventListener('moha:intel-updated', handleIntelSync);
    return () => window.removeEventListener('moha:intel-updated', handleIntelSync);
  }, []);

  // Handle incoming Android system share intent & auto-unlock to capture directly
  useEffect(() => {
    if ((window as any).__AQLIYA_INITIAL_SHARE__) {
      const shareText = (window as any).__AQLIYA_INITIAL_SHARE__;
      setIncomingSharedText(shareText);
      setIsLocked(false);
      delete (window as any).__AQLIYA_INITIAL_SHARE__;
    }

    (window as any).onAqliyaSharedText = (text: string) => {
      if (text && text.trim()) {
        setIncomingSharedText(text.trim());
        setIsLocked(false);
      }
    };

    // Listen for incoming Android system notifications from Google Classroom or Gmail
    (window as any).onAqliyaNotificationReceived = (notif: { package: string; title: string; text: string }) => {
      if (!notif) return;
      console.log('Interception received from Android Notification Listener:', notif);
      const handled = GmailClassroomBridge.handleIncomingNotification(notif);
      if (handled) {
        setIntelToast({
          id: Date.now(),
          title: `تكليف دراسي ملتقط: ${notif.title || notif.text.slice(0, 30)}`,
          url: '',
        });
      }
    };

    return () => {
      delete (window as any).onAqliyaSharedText;
      delete (window as any).onAqliyaNotificationReceived;
    };
  }, []);

  // Ensure lockscreen is bypassed whenever a share arrives
  useEffect(() => {
    if (incomingSharedText) {
      setIsLocked(false);
    }
  }, [incomingSharedText]);

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
        content: 'أهلاً بك في غرفة العمليات المركزية «عقلية»، يا قائد محمد. مستشارك التكتيكي جاهز ومتصل بمحرك Google Gemini فائق السرعة، ومربوط بسجل ذكرياتك ومشروع NexusOS وبنك الاستخبارات وأسطول الوكلاء الذاتي. كيف نتحرك اليوم؟',
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
          // Merge remote items with any pending local items so offline-added items are never erased
          setIntelItems((prevLocal) => {
            const remoteItems = iRes.data as IntelItem[];
            const remoteIds = new Set(remoteItems.map((r) => r.id));
            const pendingLocal = prevLocal.filter((local) => !remoteIds.has(local.id));
            const merged = [...pendingLocal, ...remoteItems];
            offlineStorage.save('intel', merged);
            return merged;
          });
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'commander_memories' }, () => {
        loadData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'commander_dossier' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Compute System Watchdog Alerts
  const watchdogAlerts = useMemo(() => {
    return scanSystemWatchdog({
      missions,
      intel: intelItems,
      directives,
      battleLogs,
      memories,
    });
  }, [missions, intelItems, directives, battleLogs, memories]);

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
    const id = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'intel-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
    const now = new Date().toISOString();
    const newItem: IntelItem = {
      ...item,
      id,
      created_at: now,
      updated_at: now,
    };

    // 1. Instant local persistence & state update (Optimistic UI)
    setIntelItems((prev) => {
      const updated = [newItem, ...prev.filter((i) => i.id !== id)];
      offlineStorage.save('intel', updated);
      return updated;
    });

    // 2. Audio & global event
    tacticalAudio.playSuccess();
    window.dispatchEvent(new CustomEvent('moha:intel-updated', { detail: { type: 'add', item: newItem } }));

    // 3. Trigger toast notification with direct navigation shortcut
    setIntelToast({
      id: Date.now(),
      title: newItem.title,
      url: newItem.url,
    });

    // 4. Cloud sync to Supabase
    try {
      const { data, error } = await (supabase.from('intel_depot') as any)
        .insert({
          id: newItem.id,
          title: newItem.title,
          url: newItem.url,
          category: newItem.category,
          platform: newItem.platform,
          problem_solved: newItem.problem_solved,
          key_takeaways: newItem.key_takeaways,
          mission_id: newItem.mission_id,
          tags: newItem.tags,
          status: newItem.status,
          thumbnail_url: newItem.thumbnail_url,
        })
        .select()
        .single();

      if (error) {
        console.warn('Supabase intel insert error, queuing for offline sync:', error);
        offlineStorage.queueSyncAction({ table: 'intel_depot', type: 'insert', data: newItem });
      } else if (data) {
        setIntelItems((prev) => {
          const synced = prev.map((i) => (i.id === id ? (data as IntelItem) : i));
          offlineStorage.save('intel', synced);
          return synced;
        });
      }
    } catch (e) {
      console.warn('Network offline during intel save, queued:', e);
      offlineStorage.queueSyncAction({ table: 'intel_depot', type: 'insert', data: newItem });
    }
  };

  const handleUpdateIntelItem = async (updated: Partial<IntelItem> & { id: string }) => {
    setIntelItems((prev) => {
      const next = prev.map((item) =>
        item.id === updated.id
          ? { ...item, ...updated, updated_at: new Date().toISOString() }
          : item
      );
      offlineStorage.save('intel', next);
      return next;
    });

    tacticalAudio.playBlip();
    window.dispatchEvent(new CustomEvent('moha:intel-updated', { detail: { type: 'update', updated } }));

    try {
      const { error } = await (supabase.from('intel_depot') as any).update(updated).eq('id', updated.id);
      if (error) {
        console.warn('Supabase intel update error, queuing offline sync:', error);
        offlineStorage.queueSyncAction({ table: 'intel_depot', type: 'update', data: updated });
      }
    } catch (e) {
      offlineStorage.queueSyncAction({ table: 'intel_depot', type: 'update', data: updated });
    }
  };

  const handleDeleteIntelItem = async (id: string) => {
    setIntelItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      offlineStorage.save('intel', next);
      return next;
    });

    tacticalAudio.playBlip();
    window.dispatchEvent(new CustomEvent('moha:intel-updated', { detail: { type: 'delete', id } }));

    try {
      const { error } = await supabase.from('intel_depot').delete().eq('id', id);
      if (error) {
        console.warn('Supabase intel delete error, queuing offline sync:', error);
        offlineStorage.queueSyncAction({ table: 'intel_depot', type: 'delete', data: { id } });
      }
    } catch (e) {
      offlineStorage.queueSyncAction({ table: 'intel_depot', type: 'delete', data: { id } });
    }
  };

  const handleUpdateIntelStatus = async (id: string, status: IntelItem['status']) => {
    setIntelItems((prev) => {
      const next = prev.map((i) => (i.id === id ? { ...i, status, updated_at: new Date().toISOString() } : i));
      offlineStorage.save('intel', next);
      return next;
    });
    try {
      await (supabase.from('intel_depot') as any).update({ status }).eq('id', id);
    } catch (e) {
      offlineStorage.queueSyncAction({ table: 'intel_depot', type: 'update', data: { id, status } });
    }
  };

  const handleAddMemory = async (memory: Omit<CommanderMemory, 'id' | 'created_at'>) => {
    try {
      const { data } = await (supabase.from('commander_memories') as any)
        .insert({
          content: memory.content,
          memory_type: memory.memory_type,
          context_tags: memory.context_tags,
          importance: memory.importance,
          mission_id: memory.mission_id || null,
        })
        .select()
        .single();

      if (data) {
        setMemories((prev) => [data as CommanderMemory, ...prev]);
        offlineStorage.save('memories', [data, ...memories]);
      } else {
        const localMem: CommanderMemory = {
          ...memory,
          id: `mem-local-${Date.now()}`,
          created_at: new Date().toISOString(),
        };
        setMemories((prev) => [localMem, ...prev]);
        offlineStorage.save('memories', [localMem, ...memories]);
      }
    } catch (e) {
      console.warn('Fallback local memory save', e);
      const localMem: CommanderMemory = {
        ...memory,
        id: `mem-local-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      setMemories((prev) => [localMem, ...prev]);
      offlineStorage.queueSyncAction({ table: 'commander_memories', type: 'insert', data: memory });
    }
  };

  const handleDeleteMemory = async (id: string) => {
    const updated = memories.filter((m) => m.id !== id);
    setMemories(updated);
    offlineStorage.save('memories', updated);
    try {
      await supabase.from('commander_memories').delete().eq('id', id);
    } catch (e) {
      offlineStorage.queueSyncAction({ table: 'commander_memories', type: 'delete', data: { id } });
    }
  };

  const handleUpdateDossier = async (updated: Partial<CommanderDossier>) => {
    if (dossier) {
      const nextDossier = { ...dossier, ...updated, updated_at: new Date().toISOString() };
      setDossier(nextDossier);
      offlineStorage.save('dossier', nextDossier);
      try {
        await (supabase.from('commander_dossier') as any).update(updated).eq('id', dossier.id);
      } catch (e) {
        offlineStorage.queueSyncAction({ table: 'commander_dossier', type: 'update', data: updated });
      }
    } else {
      const initialDossier: CommanderDossier = {
        id: 'dossier-cmd-1',
        callsign: 'القائد محمد',
        vision_statement: updated.vision_statement || '',
        core_skills: updated.core_skills || ['AI Agent Architecture', 'Full-stack Engineering'],
        life_history_summary: updated.life_history_summary || '',
        decision_principles: updated.decision_principles || [],
        active_focus: updated.active_focus || '',
        updated_at: new Date().toISOString(),
      };
      setDossier(initialDossier);
      offlineStorage.save('dossier', initialDossier);
      try {
        await (supabase.from('commander_dossier') as any).upsert(initialDossier);
      } catch (e) {
        offlineStorage.queueSyncAction({ table: 'commander_dossier', type: 'insert', data: initialDossier });
      }
    }
  };

  const handleSaveBriefing = async (params: {
    energyLevel: 'high' | 'medium' | 'low';
    focusSummary: string;
    discoveryAnswer?: string;
    discoveryQuestion?: string;
    newMemoryContent?: string;
  }) => {
    const isMorning = new Date().getHours() < 16;
    const entryType = isMorning ? 'daily_brief' : 'debrief';
    const energyLabel = params.energyLevel === 'high' ? 'طاقة مرتفعة ⚡' : params.energyLevel === 'medium' ? 'طاقة متوازنة ⚖️' : 'طاقة منخفضة 🛡️';
    
    const logTitle = isMorning ? `تقرير الانطلاق الصباحي (SITREP)` : `جلسة استخلاص المساء (Debrief)`;
    const logDetails = `[مستوى الجاهزية]: ${energyLabel}\n[التركيز والهدف]: ${params.focusSummary}${
      params.discoveryAnswer ? `\n[استكشاف الذات]: ${params.discoveryQuestion}\nالجواب: ${params.discoveryAnswer}` : ''
    }`;

    try {
      const { data: newLog } = await (supabase.from('battle_logs') as any)
        .insert({
          entry_type: entryType,
          title: logTitle,
          details: logDetails,
        })
        .select()
        .single();

      if (newLog) {
        setBattleLogs((prev) => [newLog as BattleLog, ...prev]);
        offlineStorage.save('logs', [newLog, ...battleLogs]);
      }
    } catch (e) {
      console.warn('Offline log save', e);
    }

    if (params.newMemoryContent && params.newMemoryContent.trim()) {
      await handleAddMemory({
        memory_type: 'fact',
        content: params.newMemoryContent.trim(),
        context_tags: ['discovery', 'sitrep', 'identity'],
        importance: 8,
        mission_id: null,
      });
    }

    handleAddChatMessage({
      id: `sitrep-log-${Date.now()}`,
      role: 'assistant',
      content: `🎯 **تم تسجيل إحاطة ${isMorning ? 'الصباح' : 'المساء'} بنجاح:**\n\n- **الحالة:** ${energyLabel}\n- **الهدف الحاسم:** ${params.focusSummary}\n${
        params.newMemoryContent ? `- **ذاكرة مكتشفة:** تم توثيقها في العقل والذاكرة (Mind Vault).\n` : ''
      }\nغرفة العمليات تتابع مسار التنفيذ الآن!`,
      created_at: new Date().toISOString(),
    });
  };

  // State mutation handler for agents
  const handleStateMutation = async (type: string, payload: any) => {
    switch (type) {
      case 'add_memory':
        setMemories((prev) => [payload, ...prev]);
        offlineStorage.save('memories', [payload, ...memories]);
        break;
      case 'add_mission':
        setMissions((prev) => [payload, ...prev]);
        offlineStorage.save('missions', [payload, ...missions]);
        break;
      case 'update_mission':
        setMissions((prev) =>
          prev.map((m) => (m.id === payload.id ? { ...m, ...payload } : m))
        );
        break;
      case 'add_intel':
        setIntelItems((prev) => [payload, ...prev]);
        offlineStorage.save('intel', [payload, ...intelItems]);
        break;
      case 'add_log':
        setBattleLogs((prev) => [payload, ...prev]);
        offlineStorage.save('logs', [payload, ...battleLogs]);
        break;
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

  const handleExecutiveSectionNavigation = (sec: ExecutiveSection) => {
    if (sec === 'command_center') {
      setActiveMainView('deck');
      setMobileTab('deck');
    } else if (sec === 'ai_advisor') {
      setActiveMainView('workspace');
      setMobileTab('ai');
    } else if (sec === 'mission_control') {
      setActiveMainView('swarm');
      setMobileTab('swarm');
    } else if (sec === 'projects' || sec === 'life_ops') {
      setActiveMainView('project_life');
      setMobileTab('project_life');
    } else if (sec === 'opportunity_radar') {
      setActiveMainView('opportunity_radar');
      setMobileTab('opportunity_radar');
    } else if (sec === 'knowledge_vault') {
      setActiveMainView('vault_browser');
      setMobileTab('vault_browser');
    } else if (sec === 'memory') {
      setActiveMainView('memory');
      setMobileTab('memory');
    } else if (sec === 'accounts') {
      setActiveMainView('accounts');
      setMobileTab('accounts');
    } else if (sec === 'settings') {
      setIsSettingsOpen(true);
    }
  };

  return (
    <div className="h-screen max-h-screen w-screen overflow-hidden bg-black text-white flex flex-col font-sans selection:bg-white/20">
      {/* Header HUD */}
      <HeaderHUD
        onLock={() => setIsLocked(true)}
        onOpenVoiceCall={() => setIsVoiceCallOpen(true)}
        onOpenBriefing={() => setIsBriefingOpen(true)}
        onOpenWatchdog={() => setIsWatchdogOpen(true)}
        watchdogCount={watchdogAlerts.length}
        activeMainView={activeMainView}
        onSelectMainView={(v) => {
          setActiveMainView(v);
          if (v === 'deck') setMobileTab('deck');
          else if (v === 'workspace') setMobileTab('missions');
          else if (v === 'project_life') setMobileTab('project_life');
          else if (v === 'opportunity_radar') setMobileTab('opportunity_radar');
          else if (v === 'vault_browser') setMobileTab('vault_browser');
          else if (v === 'accounts') setMobileTab('accounts');
          else if (v === 'swarm') setMobileTab('swarm');
          else if (v === 'memory') setMobileTab('memory');
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
      />

      {/* Main Command Center Deck */}
      <main className="flex-1 min-h-0 p-2.5 sm:p-3 lg:p-3.5 pb-20 lg:pb-3.5 overflow-hidden w-full flex flex-col">
        {/* Desktop View */}
        {activeMainView === 'focus' ? (
          <div className="hidden lg:flex flex-col h-full min-h-0 flex-1 max-w-3xl mx-auto w-full">
            <FocusedJarvisHomeScreen
              onOpenAdvisor={(prompt) => {
                setIsAdvisorOpen(true);
                if (prompt && prompt.trim()) {
                  handleAddChatMessage({
                    id: `user-${Date.now()}`,
                    role: 'user',
                    content: prompt.trim(),
                    created_at: new Date().toISOString(),
                  });
                }
              }}
              onNavigateTab={(tab) => {
                if (tab === 'tasks') setActiveMainView('workspace');
                else if (tab === 'settings') setIsSettingsOpen(true);
                else if (tab === 'intel') setActiveMainView('deck');
              }}
            />
          </div>
        ) : activeMainView === 'deck' ? (
          <div className="hidden lg:flex flex-col h-full min-h-0 flex-1">
            <ExecutiveCommandCenter
              missions={missions}
              intel={intelItems}
              directives={directives}
              dossier={dossier}
              memories={memories}
              battleLogs={battleLogs}
              watchdogAlerts={watchdogAlerts}
              onNavigateSection={handleExecutiveSectionNavigation}
              onOpenVoiceCall={() => setIsVoiceCallOpen(true)}
              onOpenBriefing={() => setIsBriefingOpen(true)}
              onOpenWatchdog={() => setIsWatchdogOpen(true)}
              onSwitchToTacticalWorkspace={() => {
                setActiveMainView('workspace');
                setMobileTab('missions');
              }}
            />
          </div>
        ) : activeMainView === 'opportunity_radar' ? (
          <div className="hidden lg:flex flex-col h-full min-h-0 flex-1">
            <OpportunityRadarView />
          </div>
        ) : activeMainView === 'project_life' ? (
          <div className="hidden lg:flex flex-col h-full min-h-0 flex-1">
            <ProjectLifeIntelligenceHub />
          </div>
        ) : activeMainView === 'vault_browser' ? (
          <div className="hidden lg:flex flex-col h-full min-h-0 flex-1">
            <ProjectsVaultBrowser />
          </div>
        ) : activeMainView === 'accounts' ? (
          <div className="hidden lg:flex flex-col h-full min-h-0 flex-1">
            <AccountsVaultPanel />
          </div>
        ) : activeMainView === 'memory' ? (
          <div className="hidden lg:flex flex-col h-full min-h-0 flex-1">
            <MindVaultPanel
              dossier={dossier}
              memories={memories}
              battleLogs={battleLogs}
              onAddMemory={handleAddMemory}
              onDeleteMemory={handleDeleteMemory}
              onUpdateDossier={handleUpdateDossier}
            />
          </div>
        ) : activeMainView === 'discipline' ? (
          <div className="hidden lg:flex flex-col h-full min-h-0 flex-1">
            <DisciplineDashboard />
          </div>
        ) : activeMainView === 'swarm' ? (
          <div className="hidden lg:flex flex-col h-full min-h-0 flex-1">
            <AgenticCommandDeck
              missions={missions}
              intel={intelItems}
              memories={memories}
              dossier={dossier}
              battleLogs={battleLogs}
              onOpenVoiceCall={() => setIsVoiceCallOpen(true)}
              onStateMutation={handleStateMutation}
            />
          </div>
        ) : (
          <div className="hidden lg:grid grid-cols-12 gap-3.5 h-full min-h-0 flex-1">
            {/* Left Panel: Missions & NexusOS */}
            <div className="col-span-4 h-full min-h-0 flex flex-col">
              <MissionsPanel
                missions={missions}
                selectedMission={selectedMission}
                intel={intelItems}
                directives={directives}
                onSelectMission={setSelectedMission}
                onUpdateMission={handleUpdateMission}
                onAddMission={handleAddMission}
              />
            </div>

            {/* Center Panel: Intel Depot & Graphify Radar */}
            <div className="col-span-4 h-full min-h-0 flex flex-col gap-3">
              <div className="h-[48%] min-h-0 flex flex-col">
                <IntelDepotPanel
                  items={intelItems}
                  missions={missions}
                  onAddItem={handleAddIntelItem}
                  onUpdateStatus={handleUpdateIntelStatus}
                  onUpdateItem={handleUpdateIntelItem}
                  onDeleteItem={handleDeleteIntelItem}
                />
              </div>
              <div className="flex-1 min-h-0 flex flex-col">
                <GraphifyRadarPanel
                  missions={missions}
                  intel={intelItems}
                  directives={directives}
                  onSelectMission={setSelectedMission}
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

            {/* Right Panel: Commander AI with Intelligence Core */}
            <div className="col-span-4 h-full min-h-0 flex flex-col">
              <CommanderAIPanel
                messages={chatMessages}
                missions={missions}
                intel={intelItems}
                dossier={dossier}
                memories={memories}
                directives={directives}
                battleLogs={battleLogs}
                onSendMessage={handleAddChatMessage}
                onOpenVoiceCall={() => setIsVoiceCallOpen(true)}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onStateMutation={handleStateMutation}
              />
            </div>
          </div>
        )}

        {/* Mobile View */}
        <div className="lg:hidden flex-1 min-h-0 flex flex-col bg-[#080c14]">
          <div className="flex-1 min-h-0 overflow-y-auto">
            {mainNavTab === 'home' && (
              <FocusedJarvisHomeScreen
                onOpenAdvisor={(prompt) => {
                  setIsAdvisorOpen(true);
                  if (prompt && prompt.trim()) {
                    handleAddChatMessage({
                      id: `user-${Date.now()}`,
                      role: 'user',
                      content: prompt.trim(),
                      created_at: new Date().toISOString(),
                    });
                  }
                }}
                onNavigateTab={(tab) => {
                  if (tab === 'settings') setIsSettingsOpen(true);
                  else setMainNavTab(tab);
                }}
                onOpenVoiceCall={() => setIsVoiceCallOpen(true)}
                onOpenBriefing={() => setIsBriefingOpen(true)}
                onOpenAlarm={() => setIsAlarmModalOpen(true)}
                onOpenMenu={() => setIsSideDrawerOpen(true)}
                watchdogCount={watchdogAlerts.length}
              />
            )}

            {mainNavTab === 'tasks' && (
              <TasksAndGoalsScreen />
            )}

            {mainNavTab === 'intel' && (
              <IntelDepotPanel
                items={intelItems}
                missions={missions}
                onAddItem={handleAddIntelItem}
                onUpdateStatus={handleUpdateIntelStatus}
                onUpdateItem={handleUpdateIntelItem}
                onDeleteItem={handleDeleteIntelItem}
              />
            )}
          </div>
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

      {/* Android System Direct Share Capture */}
      {incomingSharedText && (
        <QuickCaptureModal
          initialText={incomingSharedText}
          missions={missions}
          onSave={handleAddIntelItem}
          onClose={() => setIncomingSharedText(null)}
        />
      )}

      {/* SITREP Morning Briefing & Debrief Modal */}
      <SITREPBriefingModal
        isOpen={isBriefingOpen}
        onClose={() => setIsBriefingOpen(false)}
        missions={missions}
        intel={intelItems}
        directives={directives}
        memories={memories}
        watchdogAlerts={watchdogAlerts}
        onSaveBriefing={handleSaveBriefing}
      />

      {/* Autonomous Watchdog Drawer */}
      <WatchdogDrawer
        isOpen={isWatchdogOpen}
        onClose={() => setIsWatchdogOpen(false)}
        alerts={watchdogAlerts}
        onSelectMission={(m) => {
          setSelectedMission(m);
          setIsWatchdogOpen(false);
          setActiveMainView('deck');
          setMobileTab('missions');
        }}
        onAskAI={(prompt) => {
          handleAddChatMessage({
            id: `watchdog-ai-${Date.now()}`,
            role: 'user',
            content: prompt,
            created_at: new Date().toISOString(),
          });
          setIsWatchdogOpen(false);
          setActiveMainView('deck');
          setMobileTab('ai');
        }}
      />

      {/* Mobile Side Navigation Drawer with written titles */}
      <MobileSideDrawer
        isOpen={isSideDrawerOpen}
        onClose={() => setIsSideDrawerOpen(false)}
        activeTab={mobileTab}
        onSelectTab={(tab) => {
          setMobileTab(tab);
          setActiveMainView(tab);
        }}
        onOpenAlarm={() => setIsAlarmModalOpen(true)}
        onOpenClassroom={() => setIsClassroomModalOpen(true)}
        onOpenUpdate={() => {
          // Open update modal in MobileFocusHub or trigger reload
          window.location.reload();
        }}
        onLockSystem={() => {
          try {
            localStorage.removeItem('moha_auth_remembered_v1');
          } catch (e) {}
          setIsLocked(true);
        }}
      />

      {/* Global Alarm Manager Modal */}
      <AlarmManagerModal
        isOpen={isAlarmModalOpen}
        onClose={() => setIsAlarmModalOpen(false)}
      />

      {/* Official Google Workspace & Academic Hub Modal */}
      <GoogleWorkspaceHubModal
        isOpen={isClassroomModalOpen}
        onClose={() => setIsClassroomModalOpen(false)}
      />

      {/* Unified Bottom Navigation (4 Tabs + Center Advisor Trigger) */}
      <UnifiedBottomNav
        activeTab={mainNavTab}
        onSelectTab={(tab) => {
          if (tab === 'settings') {
            setIsSettingsOpen(true);
          } else {
            setMainNavTab(tab);
          }
        }}
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
      />

      {/* Omnipresent Jarvis Advisor Modal / Bottom Sheet */}
      {isAdvisorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end lg:justify-center items-center p-0 lg:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl h-[92vh] lg:h-[82vh] bg-[#090d16] border border-white/15 rounded-t-3xl lg:rounded-3xl flex flex-col overflow-hidden shadow-2xl">
            {/* Advisor Header */}
            <div className="p-3 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAdvisorOpen(false)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95"
                  title="إغلاق"
                >
                  <X className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    setIsAdvisorOpen(false);
                    setIsVoiceCallOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 flex items-center gap-1.5 text-xs font-bold transition-all border border-cyan-500/30 active:scale-95"
                  title="بدء مكالمة صوتية مباشرة"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>مكالمة صوتية</span>
                </button>
              </div>

              <div className="text-right">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 justify-end">
                  <span>المستشار الذكي (Jarvis)</span>
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                </h3>
                <p className="text-[10px] text-zinc-400">ذراعك اليمين • جاهز للتنفيذ والإرشاد</p>
              </div>
            </div>

            {/* Advisor Chat & Tools Body */}
            <div className="flex-1 min-h-0">
              <CommanderAIPanel
                messages={chatMessages}
                missions={missions}
                intel={intelItems}
                dossier={dossier}
                memories={memories}
                directives={directives}
                battleLogs={battleLogs}
                onSendMessage={handleAddChatMessage}
                onOpenVoiceCall={() => {
                  setIsAdvisorOpen(false);
                  setIsVoiceCallOpen(true);
                }}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onStateMutation={handleStateMutation}
              />
            </div>
          </div>
        </div>
      )}

      {/* Global Intel Capture Notification Toast */}
      {intelToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 p-3.5 rounded-2xl bg-black/95 border border-white/20 text-white shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-bottom duration-200 max-w-[92vw] sm:max-w-md">
          <div className="p-2 rounded-xl bg-white/10 text-white shrink-0 border border-white/15">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="text-right flex-1 min-w-0">
            <p className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>تم الحفظ في بنك الاستخبارات بنجاح</span>
              <span className="text-[10px] text-zinc-400">⚡</span>
            </p>
            <p className="text-[11px] text-zinc-400 truncate mt-0.5">{intelToast.title}</p>
          </div>
          <button
            onClick={() => {
              setMobileTab('intel');
              setIntelToast(null);
            }}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-all active:scale-95 whitespace-nowrap shrink-0 shadow"
          >
            عرض الآن ↗
          </button>
          <button
            onClick={() => setIntelToast(null)}
            className="p-1 rounded-lg text-zinc-400 hover:text-white shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Global Alarm Overlay (رنين المنبه في أي مكان بالتطبيق) */}
      <AlarmRingingOverlay />
    </div>
  );
}

export default App;
