/**
 * Gujarati Text-to-Speech (TTS) Utility (lib/voice.ts)
 * Uses the Web Speech API with 'gu-IN' where a compatible Gujarati voice is available in the browser.
 * Note: Voice availability depends on browser and OS speech engine support.
 */
export const speakGuidance = (text: string, lang: 'gu-IN' | 'hi-IN' | 'en-IN' = 'gu-IN') => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      console.warn("Gujarati TTS unavailable on this browser/platform");
    }
  }
};
