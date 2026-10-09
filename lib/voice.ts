import { Language } from './translations';

/**
 * Universal Multi-Language Text-to-Speech (TTS) Utility (lib/voice.ts)
 * Automatically speaks in the user's selected language:
 * - Hindi (hi) -> hi-IN voice
 * - English (en) -> en-IN / en-US voice
 * - Marathi (mr) -> mr-IN voice
 * - Gujarati (gu) -> gu-IN voice
 * - Kutchi (khi) -> gu-IN voice (Kutchi phonetics in Gujarati script)
 */
export const speakGuidance = (text: string, langInput?: Language | string) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();

    // 1. Determine active language: explicit parameter -> localStorage -> default 'gu'
    let activeLang = langInput;
    if (!activeLang) {
      try {
        activeLang = (localStorage.getItem('qless_preferred_lang') as Language) || 'gu';
      } catch {
        activeLang = 'gu';
      }
    }

    // 2. Map to standard BCP-47 language tag
    let bcp47 = 'gu-IN';
    if (activeLang === 'hi') bcp47 = 'hi-IN';
    else if (activeLang === 'en') bcp47 = 'en-IN';
    else if (activeLang === 'mr') bcp47 = 'mr-IN';
    else if (activeLang === 'khi' || activeLang === 'gu') bcp47 = 'gu-IN';
    else if (typeof activeLang === 'string' && activeLang.includes('-')) bcp47 = activeLang;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = bcp47;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // 3. Find and set best available matching voice in browser
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const langPrefix = bcp47.split('-')[0].toLowerCase();
      // Exact match first
      let matchedVoice = voices.find(v => v.lang.toLowerCase() === bcp47.toLowerCase());
      // Prefix match second (e.g. 'hi', 'mr', 'gu', 'en')
      if (!matchedVoice) {
        matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
      }
      // Fallback for Marathi -> Hindi voice if Marathi not installed
      if (!matchedVoice && langPrefix === 'mr') {
        matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith('hi'));
      }
      // Fallback for Kutchi -> Gujarati voice
      if (!matchedVoice && (activeLang === 'khi' || langPrefix === 'gu')) {
        matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith('gu') || v.lang.toLowerCase().startsWith('hi'));
      }
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis non-blocking error:', err);
  }
};
