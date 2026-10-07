'use client';

import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2, Share2, PlusSquare, X, Smartphone, Sparkles, ShieldCheck } from 'lucide-react';
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
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [showDesktopGuide, setShowDesktopGuide] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // 1. Detect if running standalone (already installed)
    if (typeof window !== 'undefined') {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      if (isStandalone) {
        setIsInstalled(true);
      }

      // 2. Detect iOS devices
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIos(isIosDevice);

      // 3. Capture beforeinstallprompt event for 1-Click Installation
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e as BeforeInstallPromptEvent);
      };

      // 4. Capture successful app installed event
      const handleAppInstalled = () => {
        setIsInstalled(true);
        setInstallSuccess(true);
        setDeferredPrompt(null);
        setTimeout(() => {
          setDismissed(true);
        }, 3000);
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

    // Scenario A: Native 1-Click Install via beforeinstallprompt
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setInstallSuccess(true);
          setDeferredPrompt(null);
          setTimeout(() => setDismissed(true), 3500);
        }
      } catch (err) {
        // Handled silently
      }
      return;
    }

    // Scenario B: iOS Device without beforeinstallprompt
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    // Scenario C: Desktop Chrome / Edge or other browser where prompt was either already triggered or waiting
    setShowDesktopGuide(true);
  };

  return (
    <>
      <aside 
        aria-label="PWA Installation Widget"
        className="fixed bottom-16 md:bottom-6 right-3 sm:right-6 z-40 bg-white/95 backdrop-blur-md border border-slate-200 border-t-2 border-t-[#FF9933] shadow-2xl rounded-2xl p-3.5 max-w-xs sm:max-w-sm w-full animate-in slide-in-from-bottom-4 duration-300"
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <GovLogo className="w-8 h-8 drop-shadow-xs" />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border border-white flex items-center justify-center text-[7px] text-white font-bold">
                ✓
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-black uppercase text-[#FF9933] bg-[#003366] px-1.5 py-0.2 rounded tracking-wider">
                  {lang === 'en' ? 'Official PWA App' : lang === 'hi' ? 'आधिकारिक PWA ऐप' : lang === 'mr' ? 'अधिकृत PWA ॲप' : 'સત્તાવાર PWA એપ'}
                </span>
              </div>
              <h4 className="text-xs font-black text-[#003366] leading-tight truncate mt-0.5">
                {installSuccess 
                  ? (lang === 'en' ? '🎉 Installing...' : lang === 'hi' ? '🎉 इंस्टॉल हो रहा है...' : lang === 'mr' ? '🎉 इन्स्टॉल होत आहे...' : '🎉 ઇન્સ્ટોલ થઈ રહી છે...')
                  : (lang === 'en' ? 'QueueLess Kacheri App' : lang === 'hi' ? 'QueueLess कचहरी ऐप' : lang === 'mr' ? 'QueueLess कचेरी ॲप' : 'QueueLess Kacheri એપ')}
              </h4>
            </div>
          </div>

          {/* Explicit Close Button */}
          <button
            onClick={() => {
              triggerHaptic('tap');
              setDismissed(true);
            }}
            className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center text-xs transition cursor-pointer shrink-0"
            title={lang === 'en' ? 'Close' : lang === 'hi' ? 'बंद करें' : lang === 'mr' ? 'बंद करा' : 'બંધ કરો (Close)'}
            aria-label="Close install prompt"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-[10.5px] text-slate-500 mb-2.5 leading-snug">
          {lang === 'en'
            ? 'Install in 1-click on phone or computer to access offline tokens and 39 services.'
            : lang === 'hi'
            ? '१-क्लिक में फोन या कंप्यूटर पर इंस्टॉल कर ऑफलाइन टोकन व ३९ सेवाएं देखें।'
            : lang === 'mr'
            ? '१-क्लिकमध्ये फोन किंवा कॉम्प्युटरवर इन्स्टॉल करा आणि ऑफलाइन टोकन व ३९ सेवा पहा.'
            : '૧-ક્લિકમાં ફોન કે કમ્પ્યુટરમાં ઇન્સ્ટોલ કરી ઓફલાઇન ટોકન અને ૩૯ સેવાઓ જુઓ.'}
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              triggerHaptic('tap');
              setDismissed(true);
            }}
            className="flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold text-slate-500 hover:bg-slate-100 transition text-center cursor-pointer"
          >
            {lang === 'en' ? 'Later' : lang === 'hi' ? 'बाद में' : lang === 'mr' ? 'नंतर' : 'પછીથી'}
          </button>

          <button
            onClick={handleInstallClick}
            className="flex-1 py-1.5 px-3 rounded-xl text-[11px] font-black bg-[#FF9933] hover:bg-amber-600 text-slate-900 shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {installSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-900" />
                <span>{lang === 'en' ? 'Installed' : lang === 'hi' ? 'इंस्टॉल हो गया' : lang === 'mr' ? 'इन्स्टॉल झाले' : 'ઇન્સ્ટોલ થઈ ગયું'}</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 text-slate-900 animate-bounce" />
                <span>{lang === 'en' ? 'Install App' : lang === 'hi' ? 'इंस्टॉल करें' : lang === 'mr' ? 'इन्स्टॉल करा' : 'ઇન્સ્ટોલ કરો'}</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* iOS Safari Home Screen Guide Modal */}
      {showIosGuide && (
        <div 
          onClick={() => setShowIosGuide(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-3 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 text-left space-y-4 animate-in slide-in-from-bottom-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <GovLogo className="w-9 h-9" />
                <div>
                  <h4 className="font-black text-sm text-[#003366]">iPhone / iPad ઇન્સ્ટોલેશન</h4>
                  <p className="text-[10px] text-slate-400">Safari Browser 1-Click Guide</p>
                </div>
              </div>
              <button 
                onClick={() => setShowIosGuide(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-2.5 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="w-7 h-7 rounded-xl bg-[#005A9C] text-white flex items-center justify-center shrink-0 text-xs font-bold">
                  ૧
                </div>
                <div>
                  <p className="font-bold text-slate-800">Safari ના નીચેના બારમાં Share બટન દબાવો</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Share2 className="w-3.5 h-3.5 text-[#005A9C]" />
                    <span>શેર આઇકોન (Square with arrow)</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 bg-amber-50 rounded-2xl border border-amber-200">
                <div className="w-7 h-7 rounded-xl bg-[#FF9933] text-slate-900 flex items-center justify-center shrink-0 text-xs font-bold">
                  ૨
                </div>
                <div>
                  <p className="font-bold text-slate-800">'Add to Home Screen' વિકલ્પ પસંદ કરો</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <PlusSquare className="w-3.5 h-3.5 text-[#FF9933]" />
                    <span>'હોમ સ્ક્રીન પર ઉમેરો' ટેપ કરો</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                <div className="w-7 h-7 rounded-xl bg-[#138808] text-white flex items-center justify-center shrink-0 text-xs font-bold">
                  ૩
                </div>
                <div>
                  <p className="font-bold text-slate-800">જમણી બાજુ ઉપર 'Add' પર ક્લિક કરો</p>
                  <p className="text-[11px] text-slate-500">
                    તમારા ફોનમાં સરકારી લોગો સાથે QueueLess એપ દેખાશે!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full bg-[#003366] text-white font-bold py-2.5 rounded-xl text-xs hover:bg-[#002244] transition"
            >
              સમજાયું (Got it)
            </button>
          </div>
        </div>
      )}

      {/* Desktop Chrome / Edge Guide Modal */}
      {showDesktopGuide && (
        <div 
          onClick={() => setShowDesktopGuide(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-left space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GovLogo className="w-10 h-10 drop-shadow-sm" />
                <div>
                  <h4 className="font-black text-sm text-[#003366]">કમ્પ્યુટર / લેપટોપ ઇન્સ્ટોલેશન</h4>
                  <p className="text-[10.5px] text-slate-500">Chrome / Edge 1-Click App</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDesktopGuide(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-xs text-slate-500 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="w-7 h-7 rounded-xl bg-[#005A9C] text-white flex items-center justify-center shrink-0 text-xs font-bold">
                  ૧
                </div>
                <div>
                  <p className="font-bold text-slate-800">એડ્રેસ બારમાં ઉપર જમણી બાજુ જુઓ</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    બ્રાઉઝરના URL બોક્સની અંદર જમણી બાજુ <span className="font-bold text-[#003366] bg-white px-1.5 py-0.5 rounded border border-blue-200 inline-block">⊕ (Install App)</span> આઇકોન દેખાશે.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-2xl border border-amber-200">
                <div className="w-7 h-7 rounded-xl bg-[#FF9933] text-slate-900 flex items-center justify-center shrink-0 text-xs font-bold">
                  ૨
                </div>
                <div>
                  <p className="font-bold text-slate-800">અથવા બ્રાઉઝર મેનૂમાંથી ઇન્સ્ટોલ કરો</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    ઉપર જમણી બાજુ રહેલા <span className="font-bold">ત્રણ ટપકાં (⋮)</span> પર ક્લિક કરી <span className="font-semibold text-amber-900">'Install QueueLess Kacheri'</span> પસંદ કરો.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <p className="text-[11px] text-emerald-800 font-medium">
                આનાથી તમારા ડેસ્કટોપ પર ગુજરાત સરકારના પ્રતિક સાથે સ્વતંત્ર શોર્ટકટ એપ્લિકેશન ઉમેરાશે.
              </p>
            </div>

            <button
              onClick={() => setShowDesktopGuide(false)}
              className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold py-2.5 rounded-xl text-xs transition"
            >
              સમજાયું (Got it)
            </button>
          </div>
        </div>
      )}
    </>
  );
};
