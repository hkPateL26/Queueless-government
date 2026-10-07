/**
 * QueueLess Real-time Event Bus (lib/realtime-bus.ts)
 * Zero-server inter-tab and inter-branch live synchronization via BroadcastChannel API
 * with LocalStorage fallback & synthesized Web Audio Gov Chime.
 */

export interface QueueEvent {
  type: 'TOKEN_CALLED' | 'TOKEN_COMPLETED' | 'TOKEN_SKIPPED' | 'LATE_SHIFTED' | 'OFFICER_STATUS';
  tokenNumber: string;
  counterNumber?: number;
  counterNameGu?: string;
  talukaId?: string;
  timestamp: number;
  payload?: any;
}

const CHANNEL_NAME = 'qless-queue-realtime-bus';

/**
 * Synthesizes an official two-tone "Airport-style" chime using Web Audio API
 * No external MP3 files required!
 */
export const playOfficialGovChime = () => {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const now = ctx.currentTime;
    
    // Tone 1: 523.25 Hz (C5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.6);

    // Tone 2: 659.25 Hz (E5) after 220ms
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, now + 0.22);
    gain2.gain.setValueAtTime(0.22, now + 0.22);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.22);
    osc2.stop(now + 0.9);
  } catch (err) {
    console.warn('Web Audio chime unavailable:', err);
  }
};

/**
 * Broadcast an event to all open browser tabs (Citizen <-> Officer <-> TV Screen)
 */
export const broadcastQueueEvent = (event: QueueEvent) => {
  if (typeof window === 'undefined') return;

  // 1. BroadcastChannel API (Modern Zero-Latency)
  try {
    if ('BroadcastChannel' in window) {
      const bc = new BroadcastChannel(CHANNEL_NAME);
      bc.postMessage(event);
      bc.close();
    }
  } catch (e) {
    console.warn('BroadcastChannel error:', e);
  }

  // 2. LocalStorage StorageEvent Fallback
  try {
    localStorage.setItem('qless_last_event', JSON.stringify(event));
  } catch (e) {
    // Ignore storage quota
  }
};

/**
 * Subscribe to real-time events across all tabs
 */
export const subscribeToQueueEvents = (callback: (event: QueueEvent) => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  let bc: BroadcastChannel | null = null;

  // Handler for BroadcastChannel
  if ('BroadcastChannel' in window) {
    try {
      bc = new BroadcastChannel(CHANNEL_NAME);
      bc.onmessage = (msg) => {
        if (msg.data) callback(msg.data);
      };
    } catch (e) {
      console.warn('BroadcastChannel subscription error:', e);
    }
  }

  // Handler for LocalStorage storage event
  const storageHandler = (e: StorageEvent) => {
    if (e.key === 'qless_last_event' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        callback(parsed);
      } catch {
        // ignore
      }
    }
  };
  window.addEventListener('storage', storageHandler);

  return () => {
    if (bc) {
      bc.close();
    }
    window.removeEventListener('storage', storageHandler);
  };
};
