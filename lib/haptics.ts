/**
 * Mobile Haptic Feedback Utility (lib/haptics.ts)
 * Provides tactile feedback via Web Vibration API on supported mobile devices.
 * Safely guards against Chrome [Intervention] errors when no user activation has occurred.
 */
export type HapticType = 'tap' | 'success' | 'warning' | 'error';

export const triggerHaptic = (type: HapticType = 'tap') => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      // Chrome Intervention Protection:
      // navigator.vibrate is only permitted after the user has interacted with the document
      if (typeof navigator.userActivation !== 'undefined' && !navigator.userActivation.hasBeenActive) {
        return;
      }

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
      // Haptics silently suppressed on unsupported or restricted environments
    }
  }
};
