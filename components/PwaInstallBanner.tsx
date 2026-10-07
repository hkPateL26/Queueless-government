'use client';

import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2, Share2, PlusSquare, X, Smartphone, Sparkles, ShieldCheck } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { GovLogo } from '@/components/GovLogo';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
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
        console.warn('Install prompt error:', err);
      }
      return;
    }

    // Scenario B: iOS Device without beforeinstallprompt
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    // Scenario C: Desktop Chrome / Edge or other browser where prompt was either already triggered or waiting
    // Provide explicit clear instructions and trigger manual fallback
    alert(
      "🏛️ ગુજરાત ઈ-જન સેવા (QueueLess) 1-Click Install:\n\n" +
      "૧. બ્રાઉઝરના એડ્રેસ બારમાં ઉપર જમણી બાજુ આવેલ 'Install App (⊕)' આઇકોન પર ક્લિક કરો.\n" +
      "૨. અથવા બ્રાઉઝર મેનૂ (⋮) ➔ 'Install QueueLess Kacheri' પસંદ કરો.\n\n" +
      "તમારી હોમ સ્ક્રીન પર ગુજરાત સરકારનો સત્તાવાર લોગો ધરાવતી એપ સીધી ઉમેરાઈ જશે."
    );
  };

  return (
    <>
      <aside 
        aria-label="PWA Installation Banner"
        className="fixed bottom-[56px] md:bottom-0 inset-x-0 bg-white/98 backdrop-blur-md border-t-2 border-[#FF9933] shadow-2xl p-3 sm:p-4 z-40 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 transition-all animate-in slide-in-from-bottom-2 duration-300"
      >
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Authentic Government Emblem Logo */}
          <div className="relative shrink-0">
            <GovLogo className="w-11 h-11 sm:w-12 sm:h-12" />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[9px] text-white font-bold">
              ✓
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase text-[#FF9933] bg-[#003366] px-2 py-0.5 rounded tracking-wider">
                ગુજરાત સરકાર • સત્તાવાર એપ
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hidden sm:inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#FF9933]" />
                1-Click PWA
              </span>
            </div>
            
            <h4 className="text-xs sm:text-sm font-black text-[#003366] mt-0.5 truncate">
              {installSuccess ? '🎉 એપ સફળતાપૂર્વક ઇન્સ્ટોલ થઈ રહી છે!' : 'એપને ૧-ક્લિકમાં મોબાઇલમાં ઇન્સ્ટોલ કરો'}
            </h4>
            
            <p className="text-[10.5px] sm:text-[11px] text-slate-500 truncate">
              ઇન્ટરનેટ વગર પણ કચેરી ટોકન, QR પાસ અને ૩૯ યોજનાઓ જોવા માટે હોમ સ્ક્રીન પર ઉમેરો.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          <button
            onClick={() => {
              triggerHaptic('tap');
              setDismissed(true);
            }}
            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 transition min-h-[42px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#005A9C]"
            aria-label="Dismiss install banner / પછીથી"
          >
            પછીથી (Later)
          </button>

          <button
            onClick={handleInstallClick}
            className="flex-1 sm:flex-none px-4 sm:px-5 py-2 rounded-xl text-xs font-black bg-[#FF9933] hover:bg-amber-600 text-slate-900 shadow-md transition active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap min-h-[42px] focus-visible:ring-2 focus-visible:ring-[#003366] cursor-pointer"
            aria-label="Install App / ઇન્સ્ટોલ કરો"
          >
            {installSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-900" />
                <span>ઇન્સ્ટોલ થયેલ છે!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-slate-900 animate-bounce" />
                <span>ઇન્સ્ટોલ કરો (Install App)</span>
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
              className="w-full bg-[#003366] text-white font-bold py-2.5 rounded-xl text-xs"
            >
              સમજાયું (Got it)
            </button>
          </div>
        </div>
      )}
    </>
  );
};
