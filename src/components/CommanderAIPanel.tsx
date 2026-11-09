import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  PhoneCall, 
  Settings, 
  Circle, 
  Copy, 
  Check,
  User,
  Lightbulb
} from 'lucide-react';
import type { ChatMessage, Mission, IntelItem, CommanderDossier, CommanderMemory } from '../types';
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
    } catch (e: any) {
      onSendMessage({
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `عذراً يا قائد، حدث خطأ أثناء الاتصال بالنموذج: ${e.message}`,
        created_at: new Date().toISOString(),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('المتصفح لا يدعم تحويل الصوت إلى نص.');
      return;
    }

    if (!isRecording) {
      setIsRecording(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'ar-SA';
        recognition.interimResults = false;
        recognition.onresult = (event: any) => {
          const speechResult = event.results[0][0].transcript;
          setInputText((prev) => (prev ? `${prev} ${speechResult}` : speechResult));
          setIsRecording(false);
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
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full min-h-0 apple-glass rounded-3xl p-4 sm:p-5 overflow-hidden text-right border border-white/5 shadow-2xl">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-white/5 mb-3 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Bot className="h-4.5 w-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">المستشار الشخصي الذكي</h2>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
              <Circle className={`h-1.5 w-1.5 fill-current ${hasApiKey ? 'text-emerald-400' : 'text-amber-500'}`} />
              <span className="text-emerald-400 font-medium">{hasApiKey ? 'متصل وجاهز للتشاور' : 'مفتاح API مطلوب'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenVoiceCall}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 px-3 py-1.5 rounded-xl transition-all active:scale-95"
            title="محادثة صوتية سريعة"
          >
            <PhoneCall className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">محادثة صوتية</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-zinc-400 hover:text-white transition-colors"
            title="الإعدادات"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompt Pills */}
      <div className="flex gap-1.5 pb-2.5 overflow-x-auto scrollbar-none mb-2 border-b border-white/5 flex-shrink-0">
        <button
          onClick={() => setInputText('ما هي أولويات عملي وخطتي لليوم بناءً على ملفي الشخصي؟')}
          className="px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 text-xs text-zinc-300 hover:text-white whitespace-nowrap transition-all"
        >
          ✨ ملخص أولويات اليوم
        </button>
        <button
          onClick={() => setInputText('كيف نطور مشروع NexusOS ونربطه بخطتنا القادمة؟')}
          className="px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 text-xs text-zinc-300 hover:text-white whitespace-nowrap transition-all"
        >
          🎯 خطة NexusOS
        </button>
        <button
          onClick={() => setInputText('ما الذي تعلمته عني حتى الآن وما هي نقاط قوتي؟')}
          className="px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 text-xs text-zinc-300 hover:text-white whitespace-nowrap transition-all"
        >
          💡 ما تعرفه عني
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3.5 pr-1 text-xs mb-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-start pl-6' : 'items-end pr-2'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1 text-[11px] text-zinc-400">
              <span>{msg.role === 'user' ? 'محمد قرمان' : 'المستشار الذكي'}</span>
              <span>•</span>
              <span className="font-mono text-[10px]">
                {new Date(msg.created_at).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div
              className={`relative group max-w-[92%] rounded-2xl p-3.5 text-xs leading-relaxed transition-all select-text ${
                msg.role === 'user'
                  ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/30 font-medium'
                  : 'apple-glass-card text-zinc-100 border border-white/10'
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

              {msg.role === 'assistant' && (
                <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="text-[10px] text-emerald-400/80 font-medium">مستشار عقلية</span>
                  <button
                    onClick={() => handleCopy(msg.content, msg.id)}
                    className="opacity-60 group-hover:opacity-100 hover:text-white transition-opacity p-0.5"
                    title="نسخ الرد"
                  >
                    {copiedId === msg.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex items-center gap-2 p-3 rounded-2xl apple-glass-card text-emerald-300 text-xs animate-pulse max-w-[200px]">
            <Sparkles className="h-4 w-4 animate-spin text-emerald-400" />
            <span>المستشار يفكر ويستحضر الذاكرة...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="relative flex items-center gap-2 pt-2 border-t border-white/5 flex-shrink-0">
        <div className="relative flex-1">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="اكتب رسالتك أو استشارتك للمستشار... (Enter للإرسال)"
            rows={1}
            disabled={isGenerating}
            className="w-full rounded-2xl bg-white/[0.04] border border-white/10 px-4 py-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 resize-none leading-relaxed"
          />
        </div>

        <button
          onClick={toggleRecording}
          className={`p-3 rounded-2xl border transition-all active:scale-95 ${
            isRecording
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
              : 'bg-white/[0.04] text-zinc-400 hover:text-white border-white/10'
          }`}
          title="تسجيل صوتي"
        >
          {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>

        <button
          onClick={handleSend}
          disabled={!inputText.trim() || isGenerating}
          className="p-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 text-zinc-950 font-bold shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
          title="إرسال"
        >
          <Send className="h-4 w-4 stroke-[2.5]" />
        </button>
      </div>

    </div>
  );
};
