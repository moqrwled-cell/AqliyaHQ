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
  Check,
  Zap
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
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        alert('ميزة التعرف الصوتي غير مدعومة مباشرة في هذا المتصفح. استخدم زر الاتصال الصوتي المباشر.');
        return;
      }

      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'ar-SA';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsRecording(true);
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsRecording(false);
          tacticalAudio.playConfirm();
        };
        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
        recognition.start();
      } catch (e) {
        setIsRecording(false);
      }
    } else {
      setIsRecording(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    tacticalAudio.playConfirm();
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full min-h-0 craft-surface rounded-xl p-3.5 sm:p-4 overflow-hidden text-right border craft-border shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b craft-border mb-3 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-zinc-100">مستشار العمليات (Chief of Staff)</h2>
              <span className="text-[10px] font-telemetry px-1.5 py-0.5 rounded bg-zinc-800/80 border craft-border text-zinc-400">
                ACTIVE AI
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-telemetry text-zinc-400 mt-0.5">
              <Circle className={`h-1.5 w-1.5 fill-current ${hasApiKey ? 'text-emerald-400 animate-pulse' : 'text-amber-500'}`} />
              <span className="text-emerald-400 font-bold">{hasApiKey ? 'GEMINI 3.5 FLASH • ONLINE' : 'API KEY REQUIRED'}</span>
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
            className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-700/60 px-2.5 py-1.5 rounded-lg transition-all active:scale-95 shadow-sm"
            title="مكالمة صوتية حية بدون لمس الشاشة"
          >
            <PhoneCall className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span className="hidden sm:inline">اتصال صوتي حي</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg bg-zinc-800/80 border craft-border text-zinc-400 hover:text-zinc-100 transition-colors"
            title="إعدادات المفاتيح والنظام"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Tactical Action Pills */}
      <div className="flex gap-1.5 pb-2.5 overflow-x-auto scrollbar-none mb-2 border-b craft-border flex-shrink-0">
        <button
          onClick={() => setInputText('أعطني موجز الموقف الصباحي SITREP وأولويات اليوم')}
          className="px-2.5 py-1 rounded-md bg-zinc-900 border craft-border text-[11px] text-zinc-300 hover:text-white whitespace-nowrap hover:bg-zinc-800 transition-all font-sans"
        >
          ✨ موجز SITREP
        </button>
        <button
          onClick={() => setInputText('ما هو الموقف الحالي لمشروع NexusOS وما الخطوة القادمة؟')}
          className="px-2.5 py-1 rounded-md bg-zinc-900 border craft-border text-[11px] text-cyan-300 hover:text-white whitespace-nowrap hover:bg-zinc-800 transition-all font-sans"
        >
          🎯 تحليل NexusOS
        </button>
        <button
          onClick={() => setInputText('استعرض لي أفضل الحلول المخزنة في بنك الاستخبارات للربط مع مشروعنا')}
          className="px-2.5 py-1 rounded-md bg-zinc-900 border craft-border text-[11px] text-purple-300 hover:text-white whitespace-nowrap hover:bg-zinc-800 transition-all font-sans"
        >
          💡 حلول الاستخبارات
        </button>
      </div>

      {/* Messages Stream (Fluid Scrollable Area) */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-3 pr-1 text-xs mb-3 scrollbar-tactical">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-start pl-6' : 'items-end pr-2'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1 text-[10px] font-telemetry text-zinc-500">
              <span>{msg.role === 'user' ? 'الـقـائـد' : 'مستشار العمليات (Gemini Flash)'}</span>
              <span>•</span>
              <span>
                {new Date(msg.created_at || Date.now()).toLocaleTimeString('ar-SA', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div
              className={`rounded-xl p-3.5 leading-relaxed max-w-[92%] relative border ${
                msg.role === 'user'
                  ? 'bg-zinc-800/90 border-zinc-700/80 text-zinc-100 shadow-sm'
                  : 'bg-zinc-900/90 craft-border text-zinc-200 shadow-md'
              }`}
            >
              <div className="whitespace-pre-wrap selectable-text text-xs leading-relaxed">{msg.content}</div>

              {msg.role === 'assistant' && (
                <div className="mt-2.5 pt-2 border-t craft-border flex items-center justify-between text-[11px] text-zinc-400">
                  <button
                    onClick={() => tacticalAudio.speakTactical(msg.content)}
                    className="flex items-center gap-1 hover:text-cyan-300 transition-colors"
                  >
                    <Volume2 className="h-3 w-3" />
                    <span>استماع صوتي</span>
                  </button>

                  <button
                    onClick={() => handleCopy(msg.content, msg.id)}
                    className="flex items-center gap-1 hover:text-zinc-200 transition-colors"
                  >
                    {copiedId === msg.id ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">تم النسخ</span>
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
          <div className="flex flex-col items-end pr-2 animate-pulse">
            <div className="rounded-xl p-3 bg-zinc-900/80 border craft-border text-zinc-400 text-xs flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
              <span>المستشار يحلل المعطيات عبر Google Gemini...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="relative flex items-center gap-2 border-t craft-border pt-3 flex-shrink-0">
        <button
          onClick={handleVoiceToggle}
          className={`p-2.5 rounded-xl border transition-all ${
            isRecording
              ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
              : 'bg-zinc-900 border craft-border text-zinc-400 hover:text-zinc-200'
          }`}
          title={isRecording ? 'إيقاف التسجيل' : 'إملاء صوتي'}
        >
          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="وجه سؤالاً، قراراً، أو استشارة تكتيكية للقائد..."
          disabled={isGenerating}
          className="flex-1 rounded-xl border craft-border bg-black/60 px-3.5 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-cyan-500 focus:bg-black/90 transition-all"
        />

        <button
          onClick={handleSend}
          disabled={!inputText.trim() || isGenerating}
          className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white transition-all active:scale-95 shadow-md shadow-cyan-950/50"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
