import React, { useState, useEffect, useRef } from 'react';
import { PhoneOff, Mic, Volume2, Sparkles, Radio, Shield } from 'lucide-react';
import { tacticalAudio } from '../lib/audio';

interface HandsFreeVoiceCallProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscriptReceived: (userSpeech: string, aiReply: string) => void;
}

export const HandsFreeVoiceCall: React.FC<HandsFreeVoiceCallProps> = ({
  isOpen,
  onClose,
  onTranscriptReceived,
}) => {
  const [callStatus, setCallStatus] = useState<'connecting' | 'active' | 'listening' | 'speaking'>('connecting');
  const [liveUserSpeech, setLiveUserSpeech] = useState('');
  const [liveAIReply, setLiveAIReply] = useState('أهلاً بك يا قائد. الخط مفتوح ومؤمن تماماً، أنا أسمعك بكل وضوح...');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      tacticalAudio.stopSpeaking();
      return;
    }

    tacticalAudio.playConfirm();
    setCallStatus('connecting');

    // Simulate connection delay then start hands-free voice loop
    const timer = setTimeout(() => {
      setCallStatus('active');
      tacticalAudio.speakTactical('أهلاً بك يا قائد. خط العمليات المباشر مفتوح، تفضل بالحديث...');
      startContinuousListening();
    }, 1200);

    return () => {
      clearTimeout(timer);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      tacticalAudio.stopSpeaking();
    };
  }, [isOpen]);

  const startContinuousListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRec();
      rec.lang = 'ar-SA';
      rec.continuous = true;
      rec.interimResults = true;

      rec.onstart = () => {
        setCallStatus('listening');
      };

      rec.onresult = (event: any) => {
        let interim = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interim += transcript;
          }
        }

        if (interim) {
          setLiveUserSpeech(interim);
        }

        if (finalTranscript.trim()) {
          setLiveUserSpeech(finalTranscript);
          handleCommanderSpeech(finalTranscript.trim());
        }
      };

      rec.onerror = () => {
        // Auto restart on error for hands-free durability
        setTimeout(() => {
          if (isOpen) {
            try {
              rec.start();
            } catch (e) {}
          }
        }, 1000);
      };

      rec.onend = () => {
        // Auto restart if call is still active
        if (isOpen) {
          try {
            rec.start();
          } catch (e) {}
        }
      };

      try {
        rec.start();
        recognitionRef.current = rec;
      } catch (e) {}
    }
  };

  const handleCommanderSpeech = (speech: string) => {
    setCallStatus('speaking');
    tacticalAudio.playBlip();

    // Contextual Tactical Speech Response
    let reply = `علم، يا قائد. استمعت إليك بخصوص "${speech.slice(0, 30)}...". تم تسجيل الفكرة وربطها بالموقف التكتيكي لمشروع NexusOS. كيف تود توجيه الخطوة القادمة؟`;

    if (speech.includes('nexus') || speech.includes('مشروع')) {
      reply = 'مشروع NexusOS حالياً في حالة تركيز كاملة على المعمارية المركزية. سجلت توجيهك وسأقوم بتحديث مؤشر الإنجاز فوراً.';
    } else if (speech.includes('حل') || speech.includes('ريلز')) {
      reply = 'لديك حلول تقنية مسجلة في بنك الاستخبارات تتطابق مع ما ذكرته، أقترح استعراض ريلز الأمان لتسريع الإنجاز.';
    }

    setLiveAIReply(reply);
    tacticalAudio.speakTactical(reply);
    onTranscriptReceived(speech, reply);

    setTimeout(() => {
      setCallStatus('listening');
    }, 4500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 bg-grid-tactical p-4 backdrop-blur-xl">
      <div className="hud-panel w-full max-w-lg rounded-2xl border border-cyan-500/40 p-6 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
        {/* Radar scan ring */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

        {/* Top bar */}
        <div className="flex items-center justify-between w-full pb-3 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-mono-hud text-cyan-300 font-bold uppercase">
              // TACTICAL LIVE COMMS // HANDS-FREE
            </span>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] font-mono-hud text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>FULL DUPLEX LIVE</span>
          </span>
        </div>

        {/* Animated Audio Visualizer Rings */}
        <div className="relative my-8 flex items-center justify-center">
          <div className={`h-40 w-40 rounded-full border-2 border-cyan-500/30 flex items-center justify-center transition-all duration-500 ${
            callStatus === 'speaking' || callStatus === 'listening' ? 'scale-110 border-cyan-400/60 glow-cyan' : ''
          }`}>
            <div className={`h-28 w-28 rounded-full border border-cyan-400/50 flex items-center justify-center bg-cyan-500/10 ${
              callStatus === 'listening' ? 'animate-pulse' : ''
            }`}>
              <div className="h-16 w-16 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300">
                {callStatus === 'speaking' ? (
                  <Volume2 className="h-8 w-8 animate-bounce" />
                ) : (
                  <Mic className="h-8 w-8 animate-pulse" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Live Status Text */}
        <div className="mb-6 space-y-1">
          <div className="text-xs font-mono-hud text-slate-400 uppercase">
            {callStatus === 'connecting' && 'جاري فتح الخط المشفر...'}
            {callStatus === 'listening' && 'المستشار يستمع إليك الآن (تحدث بحرية دون لمس الشاشة)...'}
            {callStatus === 'speaking' && 'المستشار يتحدث الآن...'}
          </div>
        </div>

        {/* Transcripts Display */}
        <div className="w-full space-y-2 mb-6 text-xs text-right bg-slate-950/70 p-3 rounded-xl border border-slate-800 max-h-36 overflow-y-auto">
          {liveUserSpeech && (
            <div className="text-emerald-300">
              <span className="font-bold font-mono-hud text-slate-500 text-[10px]">الـقـائـد: </span>
              <span>{liveUserSpeech}</span>
            </div>
          )}
          {liveAIReply && (
            <div className="text-cyan-200">
              <span className="font-bold font-mono-hud text-slate-500 text-[10px]">المستشار: </span>
              <span>{liveAIReply}</span>
            </div>
          )}
        </div>

        {/* End Call Button */}
        <button
          onClick={() => {
            tacticalAudio.playAlert();
            onClose();
          }}
          className="flex items-center gap-2 rounded-xl bg-red-600/90 hover:bg-red-700 text-white font-bold px-6 py-2.5 shadow-lg active:scale-95 transition-all glow-amber"
        >
          <PhoneOff className="h-4 w-4" />
          <span>إنهاء المكالمة</span>
        </button>
      </div>
    </div>
  );
};
