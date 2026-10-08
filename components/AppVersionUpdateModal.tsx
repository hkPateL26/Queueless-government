'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, CheckCircle2, ShieldCheck, X, ArrowRight, Zap, Info } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { GovLogo } from '@/components/GovLogo';
import { Language } from '@/lib/translations';

export const CURRENT_APP_VERSION = 'v2.4.1';
export const RELEASE_DATE = 'October 2026';

interface AppVersionUpdateModalProps {
  lang?: Language;
  forceOpen?: boolean;
  onClose?: () => void;
}

export const AppVersionUpdateModal: React.FC<AppVersionUpdateModalProps> = ({
  lang = 'gu',
  forceOpen = false,
  onClose
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedVersion = localStorage.getItem('qless_app_version');
      // If version is missing or older than CURRENT_APP_VERSION, prompt update
      if (!storedVersion || storedVersion !== CURRENT_APP_VERSION) {
        // Show update notification after a short delay
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  if (!isOpen && !forceOpen) return null;

  const handleForceUpdate = async () => {
    triggerHaptic('success');
    setIsUpdating(true);

    try {
      // 1. Purge Web Caches
      if (typeof window !== 'undefined' && 'caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(key => caches.delete(key)));
      }

      // 2. Unregister stale service workers
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.update();
        }
      }

      // 3. Mark version updated in localStorage
      localStorage.setItem('qless_app_version', CURRENT_APP_VERSION);
      localStorage.setItem('qless_last_updated_at', new Date().toISOString());

      setUpdateSuccess(true);
      triggerHaptic('success');

      // 4. Force reload page with fresh server bundle
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch {
      localStorage.setItem('qless_app_version', CURRENT_APP_VERSION);
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    triggerHaptic('tap');
    setIsOpen(false);
    if (onClose) onClose();
  };

  return (
    <div 
      onClick={handleDismiss}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4 modal-backdrop animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col animate-in slide-in-from-bottom-6 duration-200 text-left"
      >
        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#003366] via-[#004080] to-[#005A9C] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <GovLogo className="w-7 h-7 drop-shadow-xs" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-900 px-2 py-0.5 rounded font-mono">
                  {CURRENT_APP_VERSION}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded font-bold">
                  {lang === 'gu' ? 'લાઈવ અપડેટ ઉપલબ્ધ' : 'Live Update Available'}
                </span>
              </div>
              <h3 className="text-base font-black text-white mt-1">
                {lang === 'gu' ? 'નવું વર્ઝન ઉપલબ્ધ છે!' : 'New Version Available!'}
              </h3>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-4 sm:p-5 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {lang === 'gu'
              ? 'કચેરી લાઈવ GPS રડાર, આધાર કાર્ડ સરનામું ઓટો-ફિલ અને મોબાઈલ સ્પીડ માટે નવું સત્તાવાર વર્ઝન લાઈવ થઈ ગયું છે. શ્રેષ્ઠ અનુભવ માટે હમણાં જ ફોર્સ અપડેટ કરો.'
              : 'Official build with live GPS radar, Aadhaar auto-fill, and mobile optimizations is ready. Update now to experience latest features.'}
          </p>

          {/* WHAT'S NEW HIGHLIGHTS */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
            <h4 className="text-xs font-black text-[#003366] uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FF9933]" />
              <span>{lang === 'gu' ? 'નવા ફીચર્સ અને સુધારાઓ:' : "What's New in this update:"}</span>
            </h4>
            
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-bold">{lang === 'gu' ? 'આધાર સરનામું vs લાઈવ GPS ચોક્કસાઈ' : 'Aadhaar Address vs Live GPS Geolocation'}</span>
              </div>
              <div className="flex items-start gap-2 text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-bold">{lang === 'gu' ? 'કોટડા સાંગાણી ઓછી ભીડ/ખાલી કાઉન્ટર ભલામણ' : 'Kotda Sangani Low Crowd Smart Recommendation'}</span>
              </div>
              <div className="flex items-start gap-2 text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-bold">{lang === 'gu' ? 'ફેમિલી વૉલ્ટ & સેકન્ડરી મોબાઈલ OTP સુરક્ષા' : 'Family Vault & Secondary Mobile OTP Verification'}</span>
              </div>
              <div className="flex items-start gap-2 text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-bold">{lang === 'gu' ? 'ઓટો સેવ સેશન: પેજ રિફ્રેશ કરવા પર લૉગઆઉટ નહીં થાય' : 'Persistent Session: No logout on page refresh'}</span>
              </div>
            </div>
          </div>

          {/* STATUS NOTIFICATION */}
          {updateSuccess ? (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2 text-emerald-900 text-xs font-black">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>{lang === 'gu' ? 'અપડેટ સફળ! પેજ રિલોડ થઈ રહ્યું છે...' : 'Update Success! Reloading page...'}</span>
            </div>
          ) : isUpdating ? (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-2 text-[#003366] text-xs font-black">
              <RefreshCw className="w-4 h-4 animate-spin text-[#005A9C]" />
              <span>{lang === 'gu' ? 'કેશ ક્લિયર અને નવું વર્ઝન ડાઉનલોડ થઈ રહ્યું છે...' : 'Clearing cache & downloading latest build...'}</span>
            </div>
          ) : null}

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2.5 pt-1">
            <button
              onClick={handleDismiss}
              disabled={isUpdating}
              className="flex-1 py-3 px-4 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition text-center cursor-pointer disabled:opacity-50"
            >
              {lang === 'gu' ? 'પછીથી' : 'Later'}
            </button>

            <button
              onClick={handleForceUpdate}
              disabled={isUpdating}
              className="flex-2 py-3 px-4 rounded-xl text-xs font-black bg-[#FF9933] hover:bg-[#ff8800] text-slate-900 shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
              <span>{lang === 'gu' ? 'હમણાં જ ફોર્સ અપડેટ કરો' : 'Force Update Now'}</span>
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 text-[10px] text-slate-400 text-center font-bold">
          Gujarat Digital Governance Core • Auto Version Sync Engine
        </div>
      </div>
    </div>
  );
};
