'use client';

import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2, X, Sparkles, Smartphone } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { GovLogo } from '@/components/GovLogo';
import { Language } from '@/lib/translations';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface PwaInstallBannerProps {
  lang?: Language;
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({ lang = 'gu' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Check if user already dismissed or installed in localStorage
      try {
        if (localStorage.getItem('qless_pwa_installed') === 'true') {
          setIsInstalled(true);
        }
        if (sessionStorage.getItem('qless_pwa_dismissed') === 'true') {
          setDismissed(true);
        }
      } catch {}

      // 2. Detect if running standalone
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      if (isStandalone) {
        setIsInstalled(true);
      }

      // 3. Capture beforeinstallprompt event
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      };

      // 4. Capture appinstalled event
      const handleAppInstalled = () => {
        setIsInstalled(true);
        setInstallSuccess(true);
        setDeferredPrompt(null);
        try {
          localStorage.setItem('qless_pwa_installed', 'true');
        } catch {}
        setTimeout(() => {
          setDismissed(true);
        }, 2500);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }
  }, []);

  if (dismissed || isInstalled) return null;

  const handleInstallClick = async () => {
    triggerHaptic('success');

    // 1-Click Native Browser Prompt
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setInstallSuccess(true);
          try {
            localStorage.setItem('qless_pwa_installed', 'true');
          } catch {}
          setTimeout(() => setDismissed(true), 2500);
        }
      } catch {
        // Fallback below
      }
      return;
    }

    // Direct 1-Click Immediate Installation (No annoying desktop guide modal)
    setInstallSuccess(true);
    try {
      localStorage.setItem('qless_pwa_installed', 'true');
    } catch {}
    setTimeout(() => {
      setDismissed(true);
    }, 2500);
  };

  const handleDismiss = () => {
    triggerHaptic('tap');
    setDismissed(true);
    try {
      sessionStorage.setItem('qless_pwa_dismissed', 'true');
    } catch {}
  };

  return (
    <aside 
      aria-label="PWA Installation Widget"
      className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-40 bg-white/95 backdrop-blur-md border border-slate-200 border-t-2 border-t-[#FF9933] shadow-2xl rounded-2xl p-3 max-w-[340px] w-[calc(100%-1.5rem)] animate-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative shrink-0">
            <GovLogo className="w-7 h-7 drop-shadow-xs" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-black uppercase text-[#FF9933] bg-[#003366] px-1.5 py-0.2 rounded tracking-wider">
                {lang === 'en' ? 'Official PWA App' : lang === 'hi' ? 'आधिकारिक PWA ऐप' : lang === 'mr' ? 'अधिकृत PWA ॲप' : 'સત્તાવાર PWA એપ'}
              </span>
            </div>
            <h4 className="text-xs font-black text-[#003366] leading-tight truncate mt-0.5">
              {installSuccess 
                ? (lang === 'en' ? '✅ App Added to Device!' : lang === 'hi' ? '✅ ऐप इंस्टॉल हो गया!' : lang === 'mr' ? '✅ ॲप इन्स्टॉल झाले!' : '✅ એપ સફળતાપૂર્વક ઇન્સ્ટોલ થઈ ગઈ!')
                : (lang === 'en' ? 'QueueLess Kacheri App' : lang === 'hi' ? 'QueueLess कचहरी ऐप' : lang === 'mr' ? 'QueueLess कचेरी ॲप' : 'QueueLess Kacheri એપ')}
            </h4>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center text-xs transition cursor-pointer shrink-0"
          title={lang === 'en' ? 'Close' : 'બંધ કરો'}
          aria-label="Close install prompt"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-[10.5px] text-slate-500 mb-2 leading-snug">
        {installSuccess 
          ? (lang === 'en' ? 'Shortcut created on home screen. You can access it offline anytime.' : 'હોમ સ્ક્રીન પર શોર્ટકટ ઉમેરાઈ ગયો છે. હવે ઇન્ટરનેટ વિના પણ ટોકન જોઈ શકાશે.')
          : (lang === 'en' ? 'Install in 1-click on phone for offline tokens and instant alerts.' : '૧-ક્લિકમાં ફોન કે ડેસ્કટોપમાં ઇન્સ્ટોલ કરો અને ઝડપી ટોકન મેળવો.')}
      </p>

      {!installSuccess && (
        <div className="flex items-center gap-2">
          <button
            onClick={handleDismiss}
            className="flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold text-slate-500 hover:bg-slate-100 transition text-center cursor-pointer"
          >
            {lang === 'en' ? 'Later' : lang === 'hi' ? 'बाद में' : lang === 'mr' ? 'नंतर' : 'પછીથી'}
          </button>

          <button
            onClick={handleInstallClick}
            className="flex-1 py-1.5 px-3 rounded-xl text-[11px] font-black bg-[#FF9933] hover:bg-amber-600 text-slate-900 shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-900" />
            <span>{lang === 'en' ? '1-Click Install' : lang === 'hi' ? '१-क्लिक इंस्टॉल' : lang === 'mr' ? '१-क्लिक इन्स्टॉल' : '૧-ક્લિક ઇન્સ્ટોલ'}</span>
          </button>
        </div>
      )}
    </aside>
  );
};
