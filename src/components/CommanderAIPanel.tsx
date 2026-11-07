import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  PhoneCall, 
  Volume2, 
  Settings,
  Circle,
  Copy,
  Check
} from 'lucide-react';
import type { ChatMessage, Mission, IntelItem, CommanderDossier, CommanderMemory } from '../types';
import { tacticalAudio } from '../lib/audio';
import { askCommanderAI, geminiConfig } from '../lib/gemini';

interface CommanderAIPanelProps {
  messages: ChatMessage[];
  missions: Mission[];
  intel: IntelItem[];
  dossier: CommanderDossier | null;
  memories: CommanderMemory[];
  onSendMessage: (msg: ChatMessage) => void;
  onOpenVoiceCall: () => void;
  onOpenSettings: () => void;
}

export const CommanderAIPanel: React.FC<CommanderAIPanelProps> = ({
  messages,
  missions,
  intel,
  dossier,
  memories,
  onSendMessage,
  onOpenVoiceCall,
  onOpenSettings,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasApiKey = geminiConfig.hasApiKey();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleSend = async () => {
    if (!inputText.trim() || isGenerating) return;
    const userText = inputText.trim();
    setInputText('');
    tacticalAudio.playConfirm();

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userText,
      created_at: new Date().toISOString(),
    };
    onSendMessage(userMsg);

    // Call real Gemini API
    setIsGenerating(true);
    try {
      const reply = await askCommanderAI(userText, {
        dossier,
        missions,
        intel,
        memories,
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: reply,
        created_at: new Date().toISOString(),
      };
      onSendMessage(aiMsg);
      tacticalAudio.playBlip();
    } catch (e: any) {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `تعذر إكمال الاستشارة: ${e?.message || 'خطأ غير معروف'}`,
        created_at: new Date().toISOString(),
      };
      onSendMessage(errMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVoiceToggle = () => {
    if (!isRecording) {
      tacticalAudio.playAlert();
      setIsRecording(true);
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const rec = new SpeechRec();
        rec.lang = 'ar-SA';
        rec.onresult = (e: any) => {
          const transcript = e.results[0][0].transcript;
          setInputText((prev) => (prev ? prev + ' ' + transcript : transcript));
          setIsRecording(false);
          tacticalAudio.playConfirm();
        };
        rec.onerror = () => setIsRecording(false);
        rec.onend = () => setIsRecording(false);
        rec.start();
      } else {
        setTimeout(() => setIsRecording(false), 2000);
      }
    } else {
      tacticalAudio.playBlip();
      setIsRecording(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="flex flex-col h-full craft-surface rounded-2xl p-4 overflow-hidden text-right">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b craft-border mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-zinc-800/80 border craft-border text-zinc-200">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-zinc-100">مستشار العمليات</h2>
              <span className="text-[10px] font-telemetry px-1.5 py-0.5 rounded bg-zinc-800/80 border craft-border text-zinc-400">
                AI COPILOT
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-telemetry text-zinc-400 mt-0.5">
              <Circle className={`h-1.5 w-1.5 fill-current ${hasApiKey ? 'text-emerald-500' : 'text-amber-500'}`} />
              <span>{hasApiKey ? 'GEMINI 1.5 FLASH • LIVE' : 'API KEY REQUIRED'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Hands-Free Voice Call */}
          <button
            onClick={() => {
              tacticalAudio.playConfirm();
              onOpenVoiceCall();
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-2.5 py-1.5 rounded-lg transition-all active:scale-95"
            title="مكالمة صوتية حية بدون لمس"
          >
            <PhoneCall className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">اتصال صوتي</span>
          </button>

          {!hasApiKey && (
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all text-xs flex items-center gap-1"
              title="أدخل مفتاح Google Gemini API"
            >
              <Settings className="h-3.5 w-3.5" />
              <span className="text-[10px]">تفعيل الذكاء</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex gap-1.5 pb-2.5 overflow-x-auto scrollbar-none mb-2 border-b craft-border">
        <button
          onClick={() => setInputText('أعطني موجز الموقف الصباحي SITREP وأولويات اليوم')}
          className="px-2.5 py-1 rounded-md bg-zinc-900 border craft-border text-[11px] text-zinc-300 hover:text-white whitespace-nowrap hover:bg-zinc-800 transition-all"
        >
          ✨ موجز SITREP
        </button>
        <button
          onClick={() => setInputText('ما هو الموقف الحالي لمشروع NexusOS وما الخطوة القادمة؟')}
          className="px-2.5 py-1 rounded-md bg-zinc-900 border craft-border text-[11px] text-zinc-300 hover:text-white whitespace-nowrap hover:bg-zinc-800 transition-all"
        >
          🎯 تحليل NexusOS
        </button>
        <button
          onClick={() => setInputText('استعرض لي أفضل الحلول المخزنة في بنك الاستخبارات للربط مع مشروعنا')}
          className="px-2.5 py-1 rounded-md bg-zinc-900 border craft-border text-[11px] text-zinc-300 hover:text-white whitespace-nowrap hover:bg-zinc-800 transition-all"
        >
          💡 حلول الاستخبارات
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
            <div className="flex items-center gap-1.5 mb-1 text-[10px] font-telemetry text-zinc-500">
              <span>{msg.role === 'user' ? 'الـقـائـد' : 'مستشار العمليات (Gemini)'}</span>
              <span>•</span>
              <span>{new Date(msg.created_at || Date.now()).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            <div
              className={`rounded-xl p-3 leading-relaxed max-w-[92%] relative border ${
                msg.role === 'user'
                  ? 'bg-zinc-800/90 border-zinc-700/80 text-zinc-100 shadow-sm'
                  : 'bg-zinc-900/90 craft-border text-zinc-200'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {msg.role === 'assistant' && (
                <div className="mt-2.5 pt-2 border-t craft-border flex items-center justify-between text-[11px] text-zinc-400">
                  <button
                    onClick={() => tacticalAudio.speakTactical(msg.content)}
                    className="flex items-center gap-1 hover:text-zinc-200 transition-colors"
                  >
                    <Volume2 className="h-3 w-3" />
                    <span>استماع صوتي</span>
                  </button>

                  <button
                    onClick={() => handleCopy(msg.id, msg.content)}
                    className="flex items-center gap-1 hover:text-zinc-200 transition-colors"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span>تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>نسخ</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-telemetry py-2">
            <Sparkles className="h-3.5 w-3.5 animate-spin" />
            <span>المستشار يستحضر السياق ويحلل البيانات عبر Gemini...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer */}
      <div className="flex items-center gap-2 pt-2 border-t craft-border">
        <button
          onClick={handleVoiceToggle}
          className={`p-2 rounded-xl border transition-all active:scale-95 ${
            isRecording
              ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
              : 'bg-zinc-900 craft-border text-zinc-400 hover:text-white'
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
          placeholder="تحدث مع المستشار أو أصدر توجيهاً تكتيكياً..."
          className="flex-1 rounded-xl border craft-border bg-black/60 px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-zinc-500 transition-colors"
        />

        <button
          onClick={handleSend}
          disabled={isGenerating || !inputText.trim()}
          className="p-2 rounded-xl bg-zinc-100 text-zinc-950 font-bold hover:bg-white active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
