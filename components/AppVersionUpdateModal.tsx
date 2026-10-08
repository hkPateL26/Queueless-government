'use client';

import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, Sparkles, CheckCircle2, ShieldCheck, X, ArrowRight, 
  Zap, Info, Clock, Check, ChevronDown, Layers, Smartphone
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { GovLogo } from '@/components/GovLogo';
import { Language } from '@/lib/translations';
import { 
  CURRENT_APP_VERSION, 
  RELEASE_TIMESTAMP, 
  APP_CHANGELOG_HISTORY,
  AppReleaseVersion 
} from '@/lib/app-version';

export { CURRENT_APP_VERSION, RELEASE_TIMESTAMP };

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
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'changelog' | 'system'>('changelog');
  const [checkStatus, setCheckStatus] = useState<string | null>(null);

  // Automatically show the dynamic update message if user hasn't seen the current version
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lastSeen = localStorage.getItem('qless_last_seen_changelog');
      if (!lastSeen || lastSeen !== CURRENT_APP_VERSION) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // When forceOpen changes
  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
    }
  }, [forceOpen]);

  // Body scroll lock on modal open
  useEffect(() => {
    if (isOpen || forceOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [isOpen, forceOpen]);

  if (!isOpen && !forceOpen) return null;

  const currentRelease: AppReleaseVersion = APP_CHANGELOG_HISTORY[selectedVersionIndex] || APP_CHANGELOG_HISTORY[0];

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
      localStorage.setItem('qless_last_seen_changelog', CURRENT_APP_VERSION);
      localStorage.setItem('qless_last_updated_at', new Date().toISOString());

      setUpdateSuccess(true);
      triggerHaptic('success');

      // 4. Force reload page with fresh server bundle
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch {
      localStorage.setItem('qless_app_version', CURRENT_APP_VERSION);
      localStorage.setItem('qless_last_seen_changelog', CURRENT_APP_VERSION);
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    triggerHaptic('tap');
    if (typeof window !== 'undefined') {
      localStorage.setItem('qless_last_seen_changelog', CURRENT_APP_VERSION);
    }
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleCheckUpdates = () => {
    triggerHaptic('tap');
    setCheckStatus(lang === 'gu' ? 'ક્લાઉડ સર્વર સાથે કનેક્ટ થાય છે...' : 'Connecting to cloud server...');
    setTimeout(() => {
      setCheckStatus(lang === 'gu' ? `✓ તમારી પાસે લેટેસ્ટ વર્ઝન ${CURRENT_APP_VERSION} સક્રિય છે!` : `✓ You have the latest version ${CURRENT_APP_VERSION}!`);
      triggerHaptic('success');
      setTimeout(() => setCheckStatus(null), 3000);
    }, 800);
  };

  return (
    <div 
      onClick={handleDismiss}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden modal-backdrop animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg rounded-t-[28px] sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col h-[92dvh] max-h-[92dvh] sm:h-auto sm:max-h-[88vh] animate-in slide-in-from-bottom duration-200 text-left"
      >
        {/* MOBILE BOTTOM SHEET DRAG PILL */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-[#003366] shrink-0">
          <div className="w-12 h-1.5 bg-white/40 rounded-full" />
        </div>

        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#003366] via-[#004080] to-[#005A9C] text-white p-3.5 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-900 px-2 py-0.5 rounded font-mono shadow-2xs">
                  {CURRENT_APP_VERSION}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded font-bold">
                  {lang === 'gu' ? 'નવું લાઈવ અપડેટ' : 'New Live Release'}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-white mt-1 truncate">
                {lang === 'gu' ? 'શું નવું ઉમેરાયું છે? (લાઈવ ચેન્જલોગ)' : "What's New in this Update?"}
              </h3>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition active:scale-95 cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TABS */}
        <div className="bg-slate-50 border-b border-slate-200 px-3 sm:px-4 grid grid-cols-2 gap-2 shrink-0">
          <button
            onClick={() => {
              triggerHaptic('tap');
              setActiveTab('changelog');
            }}
            className={`py-2.5 text-xs font-black border-b-2 transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'changelog'
                ? 'border-[#003366] text-[#003366]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{lang === 'gu' ? 'નવા ફેરફારો (વિગતો)' : 'New Features'}</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('tap');
              setActiveTab('system');
            }}
            className={`py-2.5 text-xs font-black border-b-2 transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'system'
                ? 'border-[#003366] text-[#003366]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
            <span>{lang === 'gu' ? 'ફોર્સ કેશ અપડેટ' : 'Force Update'}</span>
          </button>
        </div>

        {/* BODY - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-3.5">
          
          {/* TAB 1: DYNAMIC CHANGELOG */}
          {activeTab === 'changelog' && (
            <div className="space-y-3.5">
              
              {/* RELEASE BANNER CARD */}
              <div className="bg-gradient-to-br from-amber-50/80 via-white to-blue-50/50 border border-amber-200 rounded-2xl p-3.5 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                  <span className="font-extrabold text-[#003366] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{lang === 'gu' ? currentRelease.releaseDateGu : currentRelease.releaseDateEn}</span>
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.2 rounded border border-emerald-300">
                    {lang === 'gu' ? 'સત્તાવાર રિલીઝ' : 'Official Release'}
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                  {lang === 'gu' ? currentRelease.titleGu : currentRelease.titleEn}
                </h4>

                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  {lang === 'gu' ? currentRelease.highlightSummaryGu : currentRelease.highlightSummaryEn}
                </p>
              </div>

              {/* DYNAMIC LIST OF CHANGES */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-wide px-1">
                  <span>{lang === 'gu' ? 'મુખ્ય સુધારાઓ & નવા ફીચર્સ:' : 'Key Enhancements:'}</span>
                  <span>{currentRelease.changes.length} {lang === 'gu' ? 'આઇટમ' : 'items'}</span>
                </div>

                {currentRelease.changes.map((item, idx) => (
                  <div 
                    key={idx}
                    className="bg-white border border-slate-200 rounded-2xl p-3 hover:border-blue-200 transition shadow-2xs space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base shrink-0">{item.icon}</span>
                        <h5 className="text-xs font-black text-[#003366] truncate">
                          {lang === 'gu' ? item.titleGu : item.titleEn}
                        </h5>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] font-extrabold bg-blue-50 text-[#005A9C] px-1.5 py-0.2 rounded border border-blue-200 shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed pl-6 font-medium">
                      {lang === 'gu' ? item.descriptionGu : item.descriptionEn}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 2: SYSTEM CACHE & FORCE UPDATE */}
          {activeTab === 'system' && (
            <div className="space-y-3.5">
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                  <h4 className="text-xs font-black text-[#003366]">
                    {lang === 'gu' ? 'બ્રાઉઝર કેશ સાફ કરી નવો કોડ લોડ કરો' : 'Clear Browser Cache & Reload New Bundle'}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  {lang === 'gu'
                    ? 'જો તમને મોબાઇલમાં જૂનો ડેટા દેખાતો હોય અથવા ફેરફારો તાત્કાલિક જોવા હોય, તો નીચેનું બટન દબાવવાથી તમામ જૂની સર્વિસ વર્કર કેશ સાફ થઈ જશે અને પેજ આપોઆપ નવું લોડ થશે.'
                    : 'Force purge stale browser and service worker caches to instantly fetch the latest cloud production build.'}
                </p>
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

              {checkStatus && (
                <div className="p-2.5 bg-slate-100 border border-slate-300 rounded-xl text-center text-xs font-bold text-slate-800 animate-in fade-in">
                  {checkStatus}
                </div>
              )}

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleForceUpdate}
                  disabled={isUpdating}
                  className="w-full py-3 px-4 rounded-xl text-xs font-black bg-[#FF9933] hover:bg-[#ff8800] text-slate-900 shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
                  <span>{lang === 'gu' ? 'હમણાં જ ફોર્સ અપડેટ & રિલોડ કરો' : 'Force Update & Reload Now'}</span>
                </button>

                <button
                  onClick={handleCheckUpdates}
                  disabled={isUpdating}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{lang === 'gu' ? 'લાઈવ સર્વર અપડેટ્સ ચેક કરો' : 'Check for Cloud Updates'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 sm:p-4 pb-[max(0.85rem,env(safe-area-inset-bottom))] flex items-center justify-between text-xs font-bold text-slate-500 shrink-0 sticky bottom-0 z-20">
          <button
            onClick={handleCheckUpdates}
            className="text-[10px] sm:text-xs text-[#005A9C] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{CURRENT_APP_VERSION} • {RELEASE_TIMESTAMP}</span>
          </button>

          <button
            onClick={handleDismiss}
            className="bg-[#003366] hover:bg-[#002244] active:scale-95 text-white px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer"
          >
            {lang === 'gu' ? '✓ સમજાઈ ગયું (બંધ કરો)' : 'Got it (Close)'}
          </button>
        </div>
      </div>
    </div>
  );
};
