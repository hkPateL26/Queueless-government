/**
 * QueueLess Multi-Layer Real-Time Synchronization Architecture (lib/realtime-bus.ts)
 * 
 * ┌──────────────────────────────────────────────────────────────────────────────┐
 * │                 PHASE 6: REAL-TIME SYNCHRONIZATION ARCHITECTURE              │
 * ├───────────────────────┬──────────────────────────────────────────────────────┤
 * │ Cross-Device Layer   │ Backend / Realtime Transport (/api/queue-events)     │
 * │ Local Sync Layer     │ BroadcastChannel API (fast tab-to-tab on same device)│
 * │ Fallback Layer       │ localStorage StorageEvent                            │
 * │ Audio Engine         │ Web Audio API — synthesized two-tone chime           │
 * │ Voice Engine         │ Gujarati Web Speech API                              │
 * │ Haptic Engine        │ navigator.vibrate() on supported devices             │
 * └───────────────────────┴──────────────────────────────────────────────────────┘
 */

export interface QueueEvent {
  id?: string;
  type: 
    | 'TOKEN_CALLED' 
    | 'TOKEN_COMPLETED' 
    | 'TOKEN_SKIPPED' 
    | 'TOKEN_RECALLED'
    | 'TOKEN_TRANSFERRED'
    | 'TOKEN_CANCELLED'
    | 'LATE_SHIFTED' 
    | 'OFFICER_STATUS'
    | 'OFFICER_STATUS_CHANGED'
    | 'COUNTER_STATUS_CHANGED'
    | 'QUEUE_UPDATED';
  tokenNumber: string;
  counterNumber?: number;
  counterNameGu?: string;
  talukaId?: string;
  timestamp: number;
  sequence?: number;
  payload?: any;
}

const CHANNEL_NAME = 'qless-queue-realtime-bus';

/**
 * 🔔 Zero-Asset Synthesized Queue Notification Chime
 * Generates an ergonomic, audible two-tone notification chime
 * using the Web Audio API with zero external MP3 file dependencies.
 * - Tone 1: C5 (523.25 Hz)
 * - Tone 2: E5 (659.25 Hz) delayed by 220ms with exponential amplitude decay.
 */
export const playNotificationChime = () => {
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

    // Tone 2: 659.25 Hz (E5) delayed by approx 220ms
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
    console.warn('Web Audio notification chime unavailable:', err);
  }
};

/** Backwards-compatibility alias */
export const playOfficialGovChime = playNotificationChime;

/**
 * 📳 Haptic Notification
 * Triggers hardware vibration on supported mobile devices
 */
export const triggerHapticNotification = () => {
  if (typeof window !== 'undefined' && 'navigator' in window && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate([100, 50, 100]);
    } catch {
      // ignore
    }
  }
};

/**
 * ⚡ Real-Time Cross-Device & Local Broadcast
 * 1. Propagates event to Next.js Backend Transport (/api/queue-events) for other physical devices (Phone <-> Laptop).
 * 2. Propagates locally via BroadcastChannel API for instant zero-latency same-device tabs.
 * 3. Saves to localStorage for storage fallback.
 */
export const broadcastQueueEvent = (event: QueueEvent) => {
  if (typeof window === 'undefined') return;

  if (!event.id) {
    event.id = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }
  if (!event.timestamp) {
    event.timestamp = Date.now();
  }

  // 1. Cross-Device Layer: Send to Backend Event Transport
  try {
    fetch('/api/queue-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    }).catch(err => {
      console.warn('Backend realtime transport warning:', err);
    });
  } catch (e) {
    // Non-blocking
  }

  // 2. Local Sync Layer: BroadcastChannel API (Same-device local communication)
  try {
    if ('BroadcastChannel' in window) {
      const bc = new BroadcastChannel(CHANNEL_NAME);
      bc.postMessage(event);
      bc.close();
    }
  } catch (e) {
    console.warn('BroadcastChannel error:', e);
  }

  // 3. Fallback Layer: LocalStorage StorageEvent
  try {
    localStorage.setItem('qless_last_event', JSON.stringify(event));
  } catch (e) {
    // Ignore storage quota
  }
};

/**
 * 📡 Multi-Layer Event Subscription
 * Receives events from:
 * - Cross-device backend polling (/api/queue-events)
 * - BroadcastChannel (local tabs on same device)
 * - StorageEvent fallback
 */
export const subscribeToQueueEvents = (callback: (event: QueueEvent) => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const processedEventIds = new Set<string>();
  let lastCheckedTimestamp = Date.now() - 5000;

  const handleIncomingEvent = (event: QueueEvent) => {
    const key = event.id || `${event.type}_${event.tokenNumber}_${event.timestamp}`;
    if (processedEventIds.has(key)) return;
    processedEventIds.add(key);

    // Keep set bounded
    if (processedEventIds.size > 200) {
      const first = processedEventIds.values().next().value;
      if (first) processedEventIds.delete(first);
    }

    callback(event);
  };

  let bc: BroadcastChannel | null = null;

  // 1. Local Sync Layer: BroadcastChannel
  if ('BroadcastChannel' in window) {
    try {
      bc = new BroadcastChannel(CHANNEL_NAME);
      bc.onmessage = (msg) => {
        if (msg.data) handleIncomingEvent(msg.data);
      };
    } catch (e) {
      console.warn('BroadcastChannel subscription error:', e);
    }
  }

  // 2. Fallback Layer: StorageEvent
  const storageHandler = (e: StorageEvent) => {
    if (e.key === 'qless_last_event' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        handleIncomingEvent(parsed);
      } catch {
        // ignore
      }
    }
  };
  window.addEventListener('storage', storageHandler);

  // 3. Cross-Device Layer: Background Transport Polling (Every 1.5s for seamless phone <-> laptop sync)
  let isPolling = true;
  const pollBackend = async () => {
    if (!isPolling) return;
    try {
      const res = await fetch(`/api/queue-events?since=${lastCheckedTimestamp}`);
      if (res.ok) {
        const data = await res.json();
        if (data.events && Array.isArray(data.events) && data.events.length > 0) {
          data.events.forEach((ev: QueueEvent) => {
            handleIncomingEvent(ev);
            if (ev.timestamp > lastCheckedTimestamp) {
              lastCheckedTimestamp = ev.timestamp;
            }
          });
        }
      }
    } catch {
      // Ignore network hiccup
    }

    if (isPolling) {
      pollTimer = setTimeout(pollBackend, 1500);
    }
  };

  let pollTimer = setTimeout(pollBackend, 1200);

  return () => {
    isPolling = false;
    clearTimeout(pollTimer);
    if (bc) bc.close();
    window.removeEventListener('storage', storageHandler);
  };
};
