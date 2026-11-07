import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  Terminal, 
  ShieldAlert, 
  CheckCircle, 
  RefreshCw,
  PhoneCall,
  Volume2
} from 'lucide-react';
import type { ChatMessage, Mission, IntelItem, CommanderDossier } from '../types';
import { tacticalAudio } from '../lib/audio';

interface CommanderAIPanelProps {
  messages: ChatMessage[];
  missions: Mission[];
  intel: IntelItem[];
  dossier: CommanderDossier | null;
  onSendMessage: (content: string) => void;
  onOpenVoiceCall: () => void;
}

export const CommanderAIPanel: React.FC<CommanderAIPanelProps> = ({
  messages,
  missions,
  intel,
  dossier,
  onSendMessage,
  onOpenVoiceCall,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    tacticalAudio.playConfirm();
    const text = inputText.trim();
    setInputText('');
    onSendMessage(text);

    // AI tactical response generation
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      tacticalAudio.playBlip();
    }, 1000);
  };

  const handleVoiceNoteToggle = () => {
    if (!isRecording) {
      tacticalAudio.playAlert();
      setIsRecording(true);
      // Web Speech Recognition if available
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRec();
        recognition.lang = 'ar-SA';
        recognition.continuous = false;
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText((prev) => (prev ? prev + ' ' + transcript : transcript));
          setIsRecording(false);
          tacticalAudio.playConfirm();
        };
        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
        recognition.start();
      } else {
        setTimeout(() => setIsRecording(false), 2000);
      }
    } else {
      tacticalAudio.playBlip();
      setIsRecording(false);
    }
  };

  const executeQuickAction = (prompt: string) => {
    tacticalAudio.playBlip();
    setInputText(prompt);
  };

  return (
    <div className="flex flex-col h-full hud-panel rounded-xl border border-slate-800 p-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>المستشار الذكي (رفيق الرحلة)</span>
              <span className="text-[10px] font-mono-hud text-cyan-400">// CHIEF OF STAFF</span>
            </h2>
            <p className="text-[11px] text-slate-400">ذاكرة دائمة • مستشار للقرارات والمشاريع</p>
          </div>
        </div>

        {/* Live Call Button */}
        <button
          onClick={() => {
            tacticalAudio.playConfirm();
            onOpenVoiceCall();
          }}
          className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 px-2.5 py-1 rounded-lg transition-all active:scale-95 glow-cyan"
          title="بدء مكالمة صوتية حية بدون لمس"
        >
          <PhoneCall className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
          <span className="hidden sm:inline">مكالمة العمليات</span>
        </button>
      </div>

      {/* Quick Action Chips */}
      <div className="flex gap-1.5 pb-2.5 overflow-x-auto scrollbar-none mb-2 border-b border-slate-800/40">
        <button
          onClick={() => executeQuickAction('أعطني موجز الموقف الصباحي SITREP وأولويات اليوم')}
          className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 hover:text-white whitespace-nowrap hover:border-amber-500/40 active:scale-95 transition-all"
        >
          ✨ موجز SITREP
        </button>
        <button
          onClick={() => executeQuickAction('ما هو الموقف الحالي لمشروع NexusOS وما الخطوة القادمة؟')}
          className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 hover:text-white whitespace-nowrap hover:border-cyan-500/40 active:scale-95 transition-all"
        >
          🎯 تحليل NexusOS
        </button>
        <button
          onClick={() => executeQuickAction('استعرض لي أفضل الحلول المخزنة في بنك الاستخبارات')}
          className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 hover:text-white whitespace-nowrap hover:border-emerald-500/40 active:scale-95 transition-all"
        >
          💡 حلول الاستخبارات
        </button>
        <button
          onClick={() => executeQuickAction('سجل عندك إنجازاً جديداً نفذته اليوم')}
          className="px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 hover:text-white whitespace-nowrap hover:border-purple-500/40 active:scale-95 transition-all"
        >
          ⚔️ توثيق معركة
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs mb-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-start pl-6' : 'items-end pr-2'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono-hud text-slate-500">
              <span>{msg.role === 'user' ? 'الـقـائـد' : 'مستشار العمليات'}</span>
              <span>•</span>
              <span>{new Date(msg.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            <div
              className={`rounded-xl p-3 leading-relaxed max-w-[92%] relative ${
                msg.role === 'user'
                  ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-100'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {msg.role === 'assistant' && (
                <button
                  onClick={() => tacticalAudio.speakTactical(msg.content)}
                  className="mt-2 flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 pt-1 border-t border-slate-800/60"
                  title="استماع صوتي"
                >
                  <Volume2 className="h-3 w-3" />
                  <span>قراءة صوتية</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono-hud">
            <Sparkles className="h-3.5 w-3.5 animate-spin" />
            <span>المستشار يستحضر الذاكرة ويحلل البيانات...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
        <button
          onClick={handleVoiceNoteToggle}
          className={`p-2 rounded-lg border transition-all active:scale-95 ${
            isRecording
              ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
          }`}
          title="تسجيل صوتي فوري"
        >
          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="ناقش المستشار أو أصدر توجيهاً لمشاريعك..."
          className="flex-1 rounded-lg border border-slate-800 bg-slate-950/90 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 outline-none focus:border-cyan-500/50"
        />

        <button
          onClick={handleSend}
          className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30 active:scale-95 transition-all"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
