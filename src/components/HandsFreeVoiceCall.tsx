import React, { useState, useEffect, useRef } from 'react';
import { PhoneOff, Mic, Volume2, Radio, Sparkles } from 'lucide-react';
import { tacticalAudio } from '../lib/audio';
import { askCommanderAI } from '../lib/gemini';
import { offlineStorage } from '../lib/supabase';

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
  const [liveAIReply, setLiveAIReply] = useState('أهلاً بك يا قائد. خط العمليات المباشر مفتوح ومؤمن تماماً، أنا أسمعك بكل وضوح...');
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

    const timer = setTimeout(() => {
      setCallStatus('active');
      tacticalAudio.speakTactical('أهلاً بك يا قائد. خط العمليات المباشر مفتوح، تفضل بالحديث...');
      startContinuousListening();
    }, 1000);

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
        setTimeout(() => {
          if (isOpen) {
            try {
              rec.start();
            } catch (e) {}
          }
        }, 1000);
      };

      rec.onend = () => {
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

  const handleCommanderSpeech = async (speech: string) => {
    setCallStatus('speaking');
    setLiveUserSpeech(speech);
    setLiveAIReply('جارٍ المعالجة والتنفيذ عبر محرك المستشار...');

    try {
      const memories = offlineStorage.get('memories', []);
      const missions = offlineStorage.get('missions', []);
      const intel = offlineStorage.get('intel', []);
      const dossier = offlineStorage.get('dossier', null);

      const reply = await askCommanderAI(speech, {
        dossier,
        missions,
        intel,
        memories,
      });

      // Strip markdown tags and system comments for clean Arabic speech synthesis
      const cleanSpoken = reply
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/[*#>`_-]/g, '')
        .trim();

      setLiveAIReply(cleanSpoken);
      tacticalAudio.speakTactical(cleanSpoken, () => {
        if (isOpen) setCallStatus('listening');
      });
      onTranscriptReceived(speech, reply);
    } catch (err: any) {
      const fallback = `علم يا قائد، تم تسجيل طلبك: "${speech}".`;
      setLiveAIReply(fallback);
      tacticalAudio.speakTactical(fallback);
      onTranscriptReceived(speech, fallback);
      setTimeout(() => {
        if (isOpen) setCallStatus('listening');
      }, 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
      <div className="craft-surface-elevated w-full max-w-lg rounded-3xl p-7 flex flex-col items-center text-center shadow-2xl relative">
        {/* Top bar */}
        <div className="flex items-center justify-between w-full pb-3 border-b craft-border mb-6">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-cyan-400" />
            <span className="text-xs font-telemetry text-zinc-300 font-bold uppercase">
              // TACTICAL COMMS // HANDS-FREE
            </span>
          </div>
          <span className="text-[11px] font-telemetry text-emerald-400 bg-zinc-800 border craft-border px-2 py-0.5 rounded-md">
            FULL DUPLEX
          </span>
        </div>

        {/* Minimalist Acoustic Orb */}
        <div className="my-8 flex items-center justify-center">
          <div className={`h-36 w-36 rounded-full border border-zinc-700/80 flex items-center justify-center transition-all duration-300 ${
            callStatus === 'speaking' || callStatus === 'listening' ? 'scale-105 border-zinc-500' : ''
          }`}>
            <div className={`h-24 w-24 rounded-full border craft-border flex items-center justify-center bg-zinc-900 ${
              callStatus === 'listening' ? 'animate-pulse' : ''
            }`}>
              <div className="h-14 w-14 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-200">
                {callStatus === 'speaking' ? (
                  <Volume2 className="h-6 w-6 text-cyan-400" />
                ) : (
                  <Mic className="h-6 w-6 text-zinc-300" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status text */}
        <div className="mb-5 text-xs font-telemetry text-zinc-400">
          {callStatus === 'connecting' && 'جاري فتح الخط المشفر...'}
          {callStatus === 'listening' && 'المستشار يستمع إليك الآن (تحدث بحرية دون لمس الشاشة)...'}
          {callStatus === 'speaking' && 'المستشار يتحدث الآن...'}
        </div>

        {/* Transcripts */}
        <div className="w-full space-y-2 mb-6 text-xs text-right bg-black/40 p-3.5 rounded-xl border craft-border max-h-36 overflow-y-auto">
          {liveUserSpeech && (
            <div className="text-zinc-200">
              <span className="font-bold font-telemetry text-zinc-500 text-[10px]">الـقـائـد: </span>
              <span>{liveUserSpeech}</span>
            </div>
          )}
          {liveAIReply && (
            <div className="text-zinc-300">
              <span className="font-bold font-telemetry text-zinc-500 text-[10px]">المستشار: </span>
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
          className="flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-2.5 shadow-sm active:scale-95 transition-all text-xs"
        >
          <PhoneOff className="h-4 w-4" />
          <span>إنهاء المكالمة</span>
        </button>
      </div>
    </div>
  );
};
