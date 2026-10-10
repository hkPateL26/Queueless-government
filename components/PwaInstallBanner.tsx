'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Download, CheckCircle2, X, Sparkles, Smartphone, Share, PlusSquare, MoreVertical, RefreshCw } from 'lucide-react';
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
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop'>('android');
  const [isInstalling, setIsInstalling] = useState(false);

  // Initialize and listen for PWA install prompt
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Check if running inside installed standalone PWA app
    const checkStandalone = () => {
      const standalone = 
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://') ||
        window.location.search.includes('source=pwa') ||
        window.location.search.includes('mode=pwa');
      setIsStandalone(standalone);
    };
    checkStandalone();

    // 2. Detect device type for tailored manual installation steps
    const ua = navigator.userAgent || '';
    if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) {
      setDeviceType('ios');
    } else if (/Android/.test(ua)) {
      setDeviceType('android');
    } else {
      setDeviceType('desktop');
    }

    // 3. Respect user dismissal in the current session
    try {
      if (sessionStorage.getItem('qless_pwa_banner_dismissed') === 'true') {
        setDismissed(true);
      }
    } catch {}

    // 4. Capture deferredPrompt from global window (captured early by layout.tsx)
    if ((window as any).__deferredPwaPrompt) {
      setDeferredPrompt((window as any).__deferredPwaPrompt);
    }

    // 5. Event listeners for beforeinstallprompt and custom ready event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvt = e as BeforeInstallPromptEvent;
      (window as any).__deferredPwaPrompt = promptEvt;
      setDeferredPrompt(promptEvt);
    };

    const handlePromptAvailable = (e: any) => {
      if (e.detail) {
        setDeferredPrompt(e.detail as BeforeInstallPromptEvent);
      }
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setInstallSuccess(true);
      setDeferredPrompt(null);
      (window as any).__deferredPwaPrompt = null;
      try {
        localStorage.setItem('qless_pwa_installed_time', new Date().toISOString());
      } catch {}
      setTimeout(() => {
        setDismissed(true);
      }, 3500);
    };

    // External trigger to open install prompt (from mobile drawer, header, etc.)
    const handleExternalTrigger = () => {
      setDismissed(false);
      handleInstallClick();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-available', handlePromptAvailable);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('qless-trigger-pwa-install', handleExternalTrigger);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-available', handlePromptAvailable);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('qless-trigger-pwa-install', handleExternalTrigger);
    };
  }, []);

  // 1-Click native installation logic
  const handleInstallClick = useCallback(async () => {
    triggerHaptic('success');
    setIsInstalling(true);

    // Retrieve prompt from state or window global
    const promptEvent = deferredPrompt || (typeof window !== 'undefined' ? (window as any).__deferredPwaPrompt : null);

    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice.outcome === 'accepted') {
          setInstallSuccess(true);
          setDeferredPrompt(null);
          (window as any).__deferredPwaPrompt = null;
          try {
            localStorage.setItem('qless_pwa_installed_time', new Date().toISOString());
          } catch {}
          setTimeout(() => {
            setDismissed(true);
          }, 3500);
        } else {
          // User canceled browser prompt
          setIsInstalling(false);
        }
        return;
      } catch (err) {
        console.warn('Native PWA install prompt failed:', err);
      }
    }

    setIsInstalling(false);

    // Fallback: When browser doesn't expose BeforeInstallPromptEvent (iOS Safari, or Chrome already prompted)
    setShowManualGuide(true);
  }, [deferredPrompt]);

  const handleDismiss = () => {
    triggerHaptic('tap');
    setDismissed(true);
    try {
      sessionStorage.setItem('qless_pwa_banner_dismissed', 'true');
    } catch {}
  };

  // If already running standalone inside installed app, hide install banner
  if (isStandalone) return null;

  return (
    <>
      {/* 1. FLOATING CORNER 1-CLICK INSTALL WIDGET */}
      {!dismissed && (
        <aside 
          aria-label="PWA Installation Widget"
          className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-40 bg-white/98 backdrop-blur-md border border-slate-200 border-t-4 border-t-[#FF9933] shadow-2xl rounded-2xl p-3.5 max-w-[350px] w-[calc(100%-1.5rem)] animate-in slide-in-from-bottom-4 duration-300 ring-1 ring-black/5"
        >
          <div className="flex items-start justify-between gap-2.5 mb-2.5">
            <div className="flex items-center gap-3 min-w-0">
              {/* Official HD Square Brand Logo Preview */}
              <div className="relative shrink-0 w-11 h-11 rounded-xl bg-slate-900 border border-slate-200 overflow-hidden shadow-sm flex items-center justify-center p-1">
                <img 
                  src="/brand/queueless-kacheri-favicon-square-hd.png" 
                  alt="QueueLess Kacheri Official HD App Icon" 
                  className="w-full h-full object-contain"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-xs" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black uppercase text-[#FF9933] bg-[#003366] px-1.5 py-0.5 rounded tracking-wider">
                    {lang === 'en' ? 'Official Gujarat Gov App' : lang === 'hi' ? 'गुजरात सरकार आधिकारिक ऐप' : 'સત્તાવાર ગુજરાત સરકાર એપ'}
                  </span>
                </div>
                <h4 className="text-xs font-black text-[#003366] leading-tight truncate mt-0.5">
                  {installSuccess 
                    ? (lang === 'en' ? '✅ App Installed on Device!' : lang === 'hi' ? '✅ ऐप इंस्टॉल हो गया!' : '✅ એપ સફળતાપૂર્વક ઇન્સ્ટોલ થઈ!')
                    : 'QueueLess Kacheri'}
                </h4>
                <p className="text-[10px] text-slate-500 font-medium truncate">
                  {lang === 'en' ? 'Jan Seva Kendra • Zero Queues' : 'જન સેવા કેન્દ્ર • કતાર મુક્ત સેવા'}
                </p>
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

          <p className="text-[11px] text-slate-600 mb-3 leading-snug">
            {installSuccess 
              ? (lang === 'en' ? 'App shortcut created on your device screen. Fast 1-tap token pass access!' : 'હોમ સ્ક્રીન પર સત્તાવાર લોગો સાથે એપ ઉમેરાઈ ગઈ છે. ઝડપી ૧-ટેપ ટોકન પાસ મેળવો!')
              : (lang === 'en' ? 'Install the official app on phone/PC in 1-click for instant live token notifications & offline pass.' : 'સત્તાવાર લોગો સાથે ૧-ક્લિકમાં ફોન કે કોમ્પ્યુટરમાં ઇન્સ્ટોલ કરો અને લાઈવ ટોકન અપડેટ્સ મેળવો.')}
          </p>

          {!installSuccess && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDismiss}
                className="flex-1 py-2 px-2.5 rounded-xl text-[11px] font-bold text-slate-500 hover:bg-slate-100 transition text-center cursor-pointer border border-slate-200"
              >
                {lang === 'en' ? 'Later' : lang === 'hi' ? 'बाद में' : 'પછીથી'}
              </button>

              <button
                onClick={handleInstallClick}
                disabled={isInstalling}
                className="flex-[1.5] py-2 px-3 rounded-xl text-[11px] font-black bg-[#FF9933] hover:bg-amber-500 text-slate-900 shadow-md transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75"
              >
                {isInstalling ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-900" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-slate-900 stroke-[2.5]" />
                )}
                <span>{lang === 'en' ? '1-Click Install App' : lang === 'hi' ? '१-क्लिक इंस्टॉल' : '૧-ક્લિક ઇન્સ્ટોલ કરો'}</span>
              </button>
            </div>
          )}
        </aside>
      )}

      {/* 2. DEVICE-SPECIFIC VISUAL INSTALL GUIDE MODAL (IF NATIVE PROMPT WASN'T DIRECTLY TRIGGERED) */}
      {showManualGuide && (
        <div 
          onClick={() => setShowManualGuide(false)}
          className="fixed inset-0 z-[300] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#003366] via-[#004080] to-[#002244] text-white p-4 flex items-center justify-between border-b-2 border-[#FF9933]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-200 overflow-hidden flex items-center justify-center p-1 shrink-0">
                  <img 
                    src="/brand/queueless-kacheri-favicon-square-hd.png" 
                    alt="App Icon" 
                    className="w-full h-full object-contain" 
                  />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    {lang === 'en' ? 'Install QueueLess Kacheri' : 'QueueLess Kacheri એપ ઇન્સ્ટોલ કરો'}
                  </h3>
                  <p className="text-[10px] text-blue-200 font-medium">
                    {lang === 'en' ? 'Official App on Home Screen' : 'હોમ સ્ક્રીન પર સત્તાવાર લોગો સાથે ઉમેરો'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowManualGuide(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Instruction Body */}
            <div className="p-4 space-y-3.5 text-slate-800">
              <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-3 flex items-center gap-3">
                <img 
                  src="/brand/queueless-kacheri-favicon-square-hd.png" 
                  alt="App Icon" 
                  className="w-12 h-12 rounded-xl object-contain bg-slate-900 p-1 shrink-0 shadow-sm" 
                />
                <div className="min-w-0">
                  <p className="text-xs font-black text-[#003366]">QueueLess Kacheri</p>
                  <p className="text-[10px] text-slate-500 font-mono">queueless-kacheri.gov.in</p>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.2 rounded mt-0.5 inline-block">
                    ✓ સત્તાવાર બ્રાન્ડ લોગો
                  </span>
                </div>
              </div>

              {deviceType === 'ios' ? (
                // iOS Safari Steps
                <div className="space-y-2.5 text-xs">
                  <p className="font-extrabold text-slate-900 text-[11.5px]">
                    iPhone / iPad પર સરળતાથી ઇન્સ્ટોલ કરવા માટેનાં પગલાં:
                  </p>
                  
                  <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-[#003366] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                      ૧
                    </span>
                    <div className="text-[11px] leading-tight text-slate-700">
                      સફારી બ્રાઉઝરમાં નીચે આપેલ <strong className="text-[#005A9C]">શેર (Share ⎋)</strong> બટન પર ક્લિક કરો.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-[#003366] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                      ૨
                    </span>
                    <div className="text-[11px] leading-tight text-slate-700">
                      મેનુમાંથી <strong className="text-[#005A9C]">'Add to Home Screen' (+ હોમ સ્ક્રીન પર ઉમેરો)</strong> પસંદ કરો.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-[10.5px] leading-tight text-emerald-900 font-medium">
                      અધિકૃત QueueLess HD લોગો સાથે એપ સીધી તમારા iPhone હોમ સ્ક્રીન પર ઉમેરાઈ જશે!
                    </div>
                  </div>
                </div>
              ) : (
                // Android & Chrome Desktop Steps
                <div className="space-y-2.5 text-xs">
                  <p className="font-extrabold text-slate-900 text-[11.5px]">
                    તમારા બ્રાઉઝરમાંથી ઇન્સ્ટોલ કરવાનાં સરળ પગલાં:
                  </p>
                  
                  <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-[#003366] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                      ૧
                    </span>
                    <div className="text-[11px] leading-tight text-slate-700">
                      બ્રાઉઝરના ઉપરના જમણા ખૂણે આપેલ <strong className="text-[#005A9C]">૩-ડોટ્સ મેનુ (⋮)</strong> અથવા એડ્રેસ બારના <strong className="text-[#005A9C]">ઇન્સ્ટોલ આઇકોન (⊕)</strong> પર ક્લિક કરો.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="w-5 h-5 rounded-full bg-[#003366] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                      ૨
                    </span>
                    <div className="text-[11px] leading-tight text-slate-700">
                      <strong className="text-[#005A9C]">'Install app'</strong> અથવા <strong className="text-[#005A9C]">'Add to Home screen' (એપ ઇન્સ્ટોલ કરો)</strong> પર ટેપ કરો.
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-[10.5px] leading-tight text-emerald-900 font-medium">
                      QueueLess Kacheri એપ તમારા ફોનમાં ઇન્સ્ટોલ થઈ જશે અને બોટમ નેવિગેશન આપોઆપ ચાલુ થશે!
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setShowManualGuide(false);
                }}
                className="w-full py-2.5 rounded-xl bg-[#003366] hover:bg-[#002244] text-white font-extrabold text-xs shadow-md transition cursor-pointer"
              >
                સમજાઈ ગયું (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
