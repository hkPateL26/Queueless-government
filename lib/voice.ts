import { Language } from './translations';

/**
 * Universal Multi-Language Text-to-Speech (TTS) Utility (lib/voice.ts)
 * Automatically speaks in the user's selected language:
 * - Hindi (hi) -> hi-IN voice (or Hindi engine)
 * - English (en) -> en-IN / en-US voice
 * - Marathi (mr) -> mr-IN voice (or Hindi engine fallback)
 * - Gujarati (gu) -> gu-IN voice
 * - Kutchi (khi) -> gu-IN voice (Kutchi phonetics in Gujarati script)
 * 
 * Supports:
 * - speakGuidance(text, lang)
 * - stopVoice()
 * - isVoiceSpeaking()
 * - toggleVoice(text, lang)
 */

let isCurrentlySpeaking = false;
const speechListeners: Set<(speaking: boolean) => void> = new Set();

export const subscribeSpeechState = (listener: (speaking: boolean) => void) => {
  speechListeners.add(listener);
  return () => {
    speechListeners.delete(listener);
  };
};

const notifySpeechState = (speaking: boolean) => {
  isCurrentlySpeaking = speaking;
  speechListeners.forEach(listener => {
    try {
      listener(speaking);
    } catch {}
  });
};

/**
 * Immediately stop and cancel any ongoing speech output
 */
export const stopVoice = () => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    notifySpeechState(false);
  } catch (err) {
    console.warn('Speech cancellation error:', err);
  }
};

/**
 * Check if the browser is currently speaking
 */
export const isVoiceSpeaking = (): boolean => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  return window.speechSynthesis.speaking || isCurrentlySpeaking;
};

/**
 * Speak text in the exact selected language voice
 */
export const speakGuidance = (
  text: string, 
  langInput?: Language | string,
  onEnd?: () => void
) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    // Stop any current voice first
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
      // Exact match first (e.g., 'hi-IN', 'gu-IN', 'mr-IN', 'en-IN')
      let matchedVoice = voices.find(v => v.lang.toLowerCase().replace('_', '-') === bcp47.toLowerCase());
      
      // Prefix match second
      if (!matchedVoice) {
        matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
      }
      
      // Name-based match (for voices labeled 'Hindi', 'Gujarati', 'Marathi', etc.)
      if (!matchedVoice) {
        if (activeLang === 'hi') matchedVoice = voices.find(v => v.name.toLowerCase().includes('hindi') || v.name.toLowerCase().includes('india'));
        else if (activeLang === 'gu' || activeLang === 'khi') matchedVoice = voices.find(v => v.name.toLowerCase().includes('gujarati'));
        else if (activeLang === 'mr') matchedVoice = voices.find(v => v.name.toLowerCase().includes('marathi'));
        else if (activeLang === 'en') matchedVoice = voices.find(v => v.name.toLowerCase().includes('india') || v.lang.startsWith('en'));
      }

      // Fallbacks
      if (!matchedVoice && langPrefix === 'mr') {
        matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith('hi') || v.name.toLowerCase().includes('hindi'));
      }
      if (!matchedVoice && (activeLang === 'khi' || langPrefix === 'gu')) {
        matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith('gu') || v.lang.toLowerCase().startsWith('hi') || v.name.toLowerCase().includes('hindi'));
      }

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    utterance.onstart = () => {
      notifySpeechState(true);
    };

    utterance.onend = () => {
      notifySpeechState(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      notifySpeechState(false);
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis non-blocking error:', err);
    notifySpeechState(false);
  }
};

/**
 * Toggle speech: If already speaking, stops audio. If stopped, speaks the given text in chosen language.
 * Returns true if speech started, false if speech stopped.
 */
export const toggleVoice = (text: string, langInput?: Language | string): boolean => {
  if (isVoiceSpeaking()) {
    stopVoice();
    return false;
  } else {
    speakGuidance(text, langInput);
    return true;
  }
};
