/**
 * Mobile Haptic Feedback Utility (lib/haptics.ts)
 * Provides tactile feedback via Web Vibration API on supported mobile devices.
 * Note: Vibration feedback is available on supported browsers and hardware only.
 */
export type HapticType = 'tap' | 'success' | 'warning' | 'error';

export const triggerHaptic = (type: HapticType = 'tap') => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      switch (type) {
        case 'tap':
          navigator.vibrate(15);
          break;
        case 'success':
          navigator.vibrate(40);
          break;
        case 'warning':
          navigator.vibrate(80);
          break;
        case 'error':
          navigator.vibrate([50, 100, 50]);
          break;
      }
    } catch {
      // Haptics suppressed or unsupported by device policy
    }
  }
};
