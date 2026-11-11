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
import type { ChatMessage, Mission, IntelItem, CommanderDossier, CommanderMemory, StrategicDirective, BattleLog } from '../types';
import { geminiConfig } from '../lib/gemini';
import { IntelligenceCoreEngine } from '../lib/intelligence-core/intelligenceCoreEngine';
import { PersonalFocusEngine } from '../lib/personal-focus/personalFocusEngine';
import type { PlanMutation } from '../lib/personal-focus/types';

interface CommanderAIPanelProps {
  messages: ChatMessage[];
  missions: Mission[];
  intel: IntelItem[];
  dossier: CommanderDossier | null;
  memories: CommanderMemory[];
  directives?: StrategicDirective[];
  battleLogs?: BattleLog[];
  onSendMessage: (msg: ChatMessage) => void;
  onOpenVoiceCall: () => void;
  onOpenSettings: () => void;
  onStateMutation?: (type: string, payload: any) => Promise<void>;
}

export const CommanderAIPanel: React.FC<CommanderAIPanelProps> = ({
  messages,
  missions,
  intel,
  dossier,
  memories,
  directives = [],
  battleLogs = [],
  onSendMessage,
  onOpenVoiceCall,
  onOpenSettings,
  onStateMutation,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeStageText, setActiveStageText] = useState('العقل المركزي: فحص النية وتنسيق الوكيل...');
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

    // Call Intelligence Core Engine (8-Stage Pipeline)
    setIsGenerating(true);
    setActiveStageText('العقل المركزي: فهم الطلب واسترجاع السياق المخصص...');
    try {
      const result = await IntelligenceCoreEngine.processRequest({
        userPrompt: userText,
        missions,
        intel,
        memories,
        directives,
        dossier,
        battleLogs,
        onStateMutation,
      });

      let cleanContent = result.finalReportMarkdown;

      // Extract and execute automated plan mutations if returned by AI
      const planActionMatch = cleanContent.match(/```plan_action\s*([\s\S]*?)\s*```/);
      if (planActionMatch && planActionMatch[1]) {
        try {
          const actionObj = JSON.parse(planActionMatch[1]);
          const res = PersonalFocusEngine.applyMutation(actionObj as PlanMutation);
          if (res.success) {
            cleanContent = cleanContent.replace(
              planActionMatch[0],
              `\n> 🎯 **تم تعديل خطتك اليومية تلقائياً بنجاح:** ${res.message}\n`
            );
          }
        } catch (err) {
          console.warn('Auto mutation parse error:', err);
        }
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: cleanContent,
        created_at: new Date().toISOString(),
      };
      onSendMessage(aiMsg);
    } catch (e: any) {
      onSendMessage({
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `عذراً يا قائد، حدث خطأ أثناء تشغيل العقل المركزي: ${e.message}`,
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
          <div className="h-10 w-10 rounded-2xl overflow-hidden border border-emerald-400/40 bg-zinc-900 shadow-md flex-shrink-0">
            <img src="/logo.png" alt="Moha Agent" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Moha Agent | المستشار التكتيكي</h2>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
              <Circle className={`h-1.5 w-1.5 fill-current ${hasApiKey ? 'text-emerald-400' : 'text-amber-500'}`} />
              <span className="text-emerald-400 font-medium">{hasApiKey ? 'متصل ومربوط بخطتك الحية' : 'مفتاح API مطلوب'}</span>
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
          onClick={() => setInputText('احسب احتياجي اليومي الدقيق من السعرات والبروتين لبناء وزني من 54 إلى 70 كجم وعدّل خطة اليوم')}
          className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-xs text-amber-300 whitespace-nowrap transition-all flex items-center gap-1.5"
        >
          <span>🥣</span>
          <span>احسب احتياجي للسعرات (70 كجم)</span>
        </button>

        <button
          onClick={() => setInputText('غيّر وجبة المساء في خطتي إلى ساندويتش بيض وبطاطس مهروسة مع زيت الزيتون')}
          className="px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 text-xs text-zinc-300 hover:text-white whitespace-nowrap transition-all flex items-center gap-1.5"
        >
          <span>🍳</span>
          <span>تعديل وجبة المساء</span>
        </button>

        <button
          onClick={() => setInputText('أضف كورس إدارة المشاريع الرقمية والتقنية في كورسيرا لتركيزي القادم')}
          className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-xs text-blue-300 whitespace-nowrap transition-all flex items-center gap-1.5"
        >
          <span>🎓</span>
          <span>إضافة كورس كورسيرا</span>
        </button>

        <button
          onClick={() => setInputText('صغ لي إيميل بارد قوي جداً لمحامي أمريكي يعرض ديمو نيكسيس 14 يوماً مع معالجة خوف اختراق السرية ABA 512')}
          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs text-emerald-300 whitespace-nowrap transition-all flex items-center gap-1.5"
        >
          <span>💼</span>
          <span>إيميل مبيعات نيكسيس ABA 512</span>
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
          <div className="flex items-center gap-2 p-3 rounded-2xl apple-glass-card text-emerald-300 text-xs border border-emerald-500/20 max-w-sm">
            <Sparkles className="h-4 w-4 animate-spin text-emerald-400 flex-shrink-0" />
            <span className="font-medium">{activeStageText}</span>
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
