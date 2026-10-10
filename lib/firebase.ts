import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  databaseURL?: string;
}

// Default Gujarat Government DPI Demo Firebase Configuration
export const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDemoKacheriGovGujaratKey2026',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'queueless-kacheri-gov.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'queueless-kacheri-gov',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'queueless-kacheri-gov.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1029384756',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:1029384756:web:a1b2c3d4e5f6',
};

export function getActiveFirebaseConfig(): FirebaseConfig {
  if (typeof window !== 'undefined') {
    try {
      const custom = localStorage.getItem('qless_firebase_custom_config');
      if (custom) {
        const parsed = JSON.parse(custom);
        if (parsed.projectId && parsed.apiKey) {
          return { ...DEFAULT_FIREBASE_CONFIG, ...parsed };
        }
      }
    } catch {
      // ignore
    }
  }
  return DEFAULT_FIREBASE_CONFIG;
}

let cachedApp: FirebaseApp | null = null;
let cachedDb: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  try {
    const config = getActiveFirebaseConfig();
    if (!config || !config.projectId) return null;

    if (getApps().length > 0) {
      cachedApp = getApp();
      return cachedApp;
    }
    cachedApp = initializeApp(config);
    return cachedApp;
  } catch (err) {
    console.warn('[Firebase] App initialization warning:', err);
    return null;
  }
}

export function getFirebaseDb(): Firestore | null {
  try {
    if (cachedDb) return cachedDb;
    const app = getFirebaseApp();
    if (!app) return null;
    cachedDb = getFirestore(app);
    return cachedDb;
  } catch (err) {
    console.warn('[Firebase] Firestore initialization warning:', err);
    return null;
  }
}

export function isFirebaseConfigured(): boolean {
  const config = getActiveFirebaseConfig();
  return Boolean(
    config.apiKey && 
    config.projectId && 
    config.projectId !== 'queueless-kacheri-gov' // Checks if custom/real project has been entered
  );
}
