// Audio Engine - Completely Muted upon user request for a peaceful, luxury experience
// No harsh blips, beeps, or alarms.
class MutedAudioEngine {
  playBlip() {}
  playConfirm() {}
  playAlert() {}
  playSonarPing() {}

  stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  speakTactical(text: string, onEnd?: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      if (onEnd) utterance.onend = onEnd;
      window.speechSynthesis.speak(utterance);
    } catch {
      // safe fallback
    }
  }
}

export const tacticalAudio = new MutedAudioEngine();
