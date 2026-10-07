'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, MapPin, Lock, Clock, Search, ArrowRight, 
  RotateCcw, Volume2, QrCode, Ticket, Brain, Crosshair, 
  Users, Building, Award, Bell, CheckCircle2, ChevronDown, Download,
  Layers, ArrowLeft, Calendar, Home as HomeIcon, Radio, Globe
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { speakGuidance } from '@/lib/voice';
import { subscribeToQueueEvents } from '@/lib/realtime-bus';
import { PwaInstallBanner } from '@/components/PwaInstallBanner';
import { SchemesCatalog } from '@/components/SchemesCatalog';
import { SchemeDrawer } from '@/components/SchemeDrawer';
import { CameraScannerModal } from '@/components/CameraScannerModal';
import { SlotBookingModal, BookingDetails } from '@/components/SlotBookingModal';
import { DigitalTokenPass } from '@/components/DigitalTokenPass';
import { GovLogo } from '@/components/GovLogo';
import { GovTelemetryMarquee } from '@/components/GovTelemetryMarquee';
import { SchemeItem, ALL_YOJANAS } from '@/lib/schemes-data';
import { Language, GUJARAT_LANGUAGES, t } from '@/lib/translations';

export default function Home() {
  const [view, setView] = useState<'landing' | 'dashboard' | 'services'>('landing');
  const [lang, setLang] = useState<Language>('gu');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [phone, setPhone] = useState('9876543210');
  const [aadhaar4, setAadhaar4] = useState('8842');

  // Load language preference from LocalStorage
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('qless_preferred_lang') as Language | null;
      if (savedLang && (savedLang === 'en' || savedLang === 'gu' || savedLang === 'hi')) {
        setLang(savedLang);
      }
    } catch {}
  }, []);

  // Language switch handler with persistence
  const handleSelectLang = (newLang: Language) => {
    triggerHaptic('tap');
    setLang(newLang);
    try {
      localStorage.setItem('qless_preferred_lang', newLang);
    } catch {}
    setLangMenuOpen(false);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-dropdown="lang"]')) {
        setLangMenuOpen(false);
      }
      if (!target.closest('[data-dropdown="demo"]')) {
        setDemoMenuOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);
  
  // Scheme Drawer & Camera Scanner State
  const [activeScheme, setActiveScheme] = useState<SchemeItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [verifiedSchemes, setVerifiedSchemes] = useState<Record<string, boolean>>({});
  const [pendingTokenScheme, setPendingTokenScheme] = useState<SchemeItem | null>(null);
  const [loginPromptReason, setLoginPromptReason] = useState<string | null>(null);

  // Phase 3: Slot Booking & Digital Pass State
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [tokenPassModalOpen, setTokenPassModalOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState<BookingDetails | null>(null);
  const [lateShiftMinutes, setLateShiftMinutes] = useState<number>(0);

  const [currentUser, setCurrentUser] = useState<{
    name: string;
    role: string;
    area: string;
    token: string;
  } | null>(null);

  // STRICT BACKGROUND BODY SCROLL LOCK WHEN ANY MODAL / DRAWER IS OPEN
  useEffect(() => {
    const isAnyModalOpen = drawerOpen || scannerOpen || slotModalOpen || tokenPassModalOpen || authModalOpen;
    
    if (isAnyModalOpen) {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      document.body.dataset.scrollY = scrollY.toString();
      document.documentElement.classList.add('modal-open');
      document.body.classList.add('modal-open');
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      const scrollY = document.body.dataset.scrollY;
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY, 10));
        delete document.body.dataset.scrollY;
      }
    }

    return () => {
      const scrollY = document.body.dataset.scrollY;
      document.documentElement.classList.remove('modal-open');
      document.body.classList.remove('modal-open');
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY, 10));
        delete document.body.dataset.scrollY;
      }
    };
  }, [drawerOpen, scannerOpen, slotModalOpen, tokenPassModalOpen, authModalOpen]);

  // ESC KEY TO DISMISS ACTIVE MODAL
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (tokenPassModalOpen) setTokenPassModalOpen(false);
        else if (slotModalOpen) setSlotModalOpen(false);
        else if (scannerOpen) setScannerOpen(false);
        else if (drawerOpen) setDrawerOpen(false);
        else if (authModalOpen) setAuthModalOpen(false);
        else if (demoMenuOpen) setDemoMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tokenPassModalOpen, slotModalOpen, scannerOpen, drawerOpen, authModalOpen, demoMenuOpen]);

  // 1-Click Demo Fill Handlers
  const loginAsDemo = (role: 'farmer' | 'officer') => {
    triggerHaptic('success');
    setDemoMenuOpen(false);
    setAuthModalOpen(false);

    const userObj = role === 'farmer' 
      ? {
          name: 'Mohanbhai Patel',
          role: 'Citizen',
          area: 'Rajkot Rural',
          token: '#A-42',
        }
      : {
          name: 'K. M. Trivedi (Mamlatdar)',
          role: 'Desk Officer',
          area: 'Counter 1 • Gondal',
          token: '#A-40',
        };

    setCurrentUser(userObj);

    // If citizen was collecting a token for a scheme, open Slot Booking Modal!
    if (pendingTokenScheme) {
      const targetScheme = pendingTokenScheme;
      setVerifiedSchemes(prev => ({ ...prev, [targetScheme.id]: true }));
      setActiveScheme(targetScheme);
      setPendingTokenScheme(null);
      setLoginPromptReason(null);
      setTimeout(() => {
        triggerHaptic('success');
        speakGuidance(`લૉગિન સફળ! હવે ${targetScheme.titleGu} માટે તમારો કચેરી સ્લોટ અને કાઉન્ટર પસંદ કરો.`);
        setSlotModalOpen(true);
      }, 200);
    } else {
      setView('dashboard');
    }
  };

  const handleOtpSubmit = () => {
    triggerHaptic('success');
    setAuthModalOpen(false);
    
    const userObj = {
      name: 'Mohanbhai Patel',
      role: 'Citizen',
      area: 'Rajkot Rural',
      token: '#A-42',
    };
    setCurrentUser(userObj);

    if (pendingTokenScheme) {
      const targetScheme = pendingTokenScheme;
      setVerifiedSchemes(prev => ({ ...prev, [targetScheme.id]: true }));
      setActiveScheme(targetScheme);
      setPendingTokenScheme(null);
      setLoginPromptReason(null);
      setTimeout(() => {
        triggerHaptic('success');
        speakGuidance(`લૉગિન સફળ! હવે ${targetScheme.titleGu} માટે તમારો કચેરી સ્લોટ અને કાઉન્ટર પસંદ કરો.`);
        setSlotModalOpen(true);
      }, 200);
    } else {
      setView('dashboard');
    }
  };

  const resetSession = () => {
    triggerHaptic('warning');
    setCurrentUser(null);
    setPendingTokenScheme(null);
    setActiveBooking(null);
    setLateShiftMinutes(0);
    setLoginPromptReason(null);
    setDemoMenuOpen(false);
    setView('landing');
  };

  const handleRunningLate = () => {
    triggerHaptic('warning');
    setLateShiftMinutes(prev => prev + 20);
    speakGuidance("વિલંબ નોંધણી સફળ! કાઉન્ટર અધિકારીને તમારા નવા અંદાજિત સમયની જાણ કરવામાં આવી છે.");
    alert("⚠️ વિલંબ નોંધણી મંજૂર!\n\nતમારી અપોઇન્ટમેન્ટનો સમય ૨૦ મિનિટ આગળ ખસેડવામાં આવ્યો છે. કાઉન્ટર અધિકારીને સિસ્ટમ દ્વારા જાણ થઈ ગઈ છે જેથી તમારો વારો સ્કીપ નહીં થાય.");
  };

  const handleSelectScheme = (scheme: SchemeItem) => {
    setActiveScheme(scheme);
    setDrawerOpen(true);
  };

  const handleOpenScanner = () => {
    setDrawerOpen(false);
    setScannerOpen(true);
  };

  // VALIDATION CHECK: Require Login to Collect Token from Drawer
  const handleCollectToken = (scheme: SchemeItem) => {
    setActiveScheme(scheme);
    if (!currentUser) {
      triggerHaptic('warning');
      speakGuidance("ટોકન મેળવવા માટે પહેલાં નાગરિક ઓળખ ચકાસણી કરવી જરૂરી છે.");
      setPendingTokenScheme(scheme);
      setLoginPromptReason(`🔒 "${scheme.titleGu}" નો કચેરી ટોકન કલેક્ટ કરવા માટે નાગરિક ઓળખ ચકાસણી (Citizen Identity Check) જરૂરી છે.`);
      setDrawerOpen(false);
      setAuthModalOpen(true);
      return;
    }

    triggerHaptic('tap');
    setDrawerOpen(false);
    // Open Phase 3 Slot & Counter selection!
    setSlotModalOpen(true);
  };

  // VALIDATION CHECK: Require Login to Collect Token from Camera Scanner
  const handleVerificationSuccess = () => {
    if (!activeScheme) return;

    if (!currentUser) {
      triggerHaptic('warning');
      speakGuidance("દસ્તાવેજ પ્રી-ચેક સફળ! ટોકન ફાળવણી માટે નાગરિક ઓળખ ચકાસણી કરો.");
      setPendingTokenScheme(activeScheme);
      setLoginPromptReason(`🔒 પ્રી-ચેક પૂર્ણ! "${activeScheme.titleGu}" નો ટોકન ફાળવવા માટે નાગરિક ઓળખ ચકાસણી (Citizen Identity Check) જરૂરી છે.`);
      setScannerOpen(false);
      setDrawerOpen(false);
      setAuthModalOpen(true);
      return;
    }

    setVerifiedSchemes(prev => ({ ...prev, [activeScheme.id]: true }));
    setScannerOpen(false);
    setDrawerOpen(false);
    triggerHaptic('success');
    // Open Phase 3 Slot Booking!
    setSlotModalOpen(true);
  };

  // Confirm Slot Booking from Modal
  const handleConfirmBooking = (details: BookingDetails) => {
    setActiveBooking(details);
    setSlotModalOpen(false);
    setCurrentUser(prev => prev ? {
      ...prev,
      area: `${details.taluka.nameGu}, ${details.district.nameGu}`,
      token: details.tokenNumber
    } : {
      name: 'Mohanbhai Patel',
      role: 'Citizen',
      area: `${details.taluka.nameGu}, ${details.district.nameGu}`,
      token: details.tokenNumber
    });
    setTokenPassModalOpen(true);
    setView('dashboard');
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F5F7FA] text-[#1F2937] pb-20 md:pb-0 w-full">
      {/* 🚀 LIVE GUJARAT GOVERNMENT TELEMETRY & SYSTEM HEALTH MARQUEE (CPU, RAM, UPTIME, SERVER HEALTH) */}
      <GovTelemetryMarquee lang={lang} />

      {/* TOP GOV-SERVICE BAR (Government-Service Visual Palette: Navy Blue #003366, Saffron #FF9933, India Green #138808) */}
      <header className="bg-[#003366] text-white text-xs border-b border-blue-900 sticky top-0 z-40">
        <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 h-9 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="flex items-center gap-1.5 font-semibold text-white text-[10px] sm:text-xs truncate">
              <span className="w-2 h-2 rounded-full bg-[#138808] animate-pulse shrink-0" />
              <span className="hidden sm:inline">{t('topBarStatusLive', lang)}</span>
              <span className="sm:hidden">{lang === 'gu' ? 'નેટવર્ક • લાઈવ' : lang === 'hi' ? 'नेटवर्क • लाइव' : 'Network • Live'}</span>
            </span>
            <span className="text-blue-300/40 hidden md:inline">|</span>
            <span className="text-blue-200 hidden md:inline font-mono text-[11px]">{t('topBarFramework', lang)}</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* MULTI-LANGUAGE DROPDOWN SELECTOR (GUJARAT REGIONAL LANGUAGES) */}
            <div className="relative" data-dropdown="lang">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic('tap');
                  setLangMenuOpen(!langMenuOpen);
                }}
                aria-expanded={langMenuOpen}
                aria-haspopup="true"
                aria-label="Select language used in Gujarat"
                className="bg-[#002244] hover:bg-[#001830] text-white border border-blue-700/80 rounded-lg px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-bold shadow-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#FF9933]"
                title="ભાષા પસંદ કરો / Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-[#FF9933] shrink-0" />
                <span className="truncate max-w-[125px] sm:max-w-none">
                  {lang === 'gu' ? 'ગુજરાતી (Gujarati)' : lang === 'hi' ? 'हिन्दी (Hindi)' : 'English (અંગ્રેજી)'}
                </span>
                <ChevronDown className={`w-3 h-3 text-blue-200 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {langMenuOpen && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 mt-1.5 w-72 sm:w-80 bg-white rounded-xl shadow-2xl border border-slate-200 py-1 z-50 text-[#1F2937] text-left animate-in fade-in zoom-in-95"
                >
                  <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 rounded-t-xl">
                    <p className="text-[11px] font-extrabold text-[#003366] flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#FF9933]" />
                      <span>{t('langDropdownTitle', lang)}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {t('langDropdownSub', lang)}
                    </p>
                  </div>

                  <div className="p-1 space-y-0.5">
                    {GUJARAT_LANGUAGES.map((opt) => {
                      const isSelected = lang === opt.code;
                      return (
                        <button
                          key={opt.code}
                          onClick={() => handleSelectLang(opt.code)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs transition flex items-start justify-between gap-2 cursor-pointer ${
                            isSelected 
                              ? 'bg-blue-50/80 text-[#003366] font-bold border border-blue-200' 
                              : 'hover:bg-slate-50 text-slate-700 font-medium'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-[12px] text-slate-900 leading-tight">
                                {opt.multiLabel}
                              </span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold shrink-0 ${
                                isSelected ? 'bg-[#003366] text-white' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {opt.badge}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                              {opt.regionalDescription}
                            </p>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-[#138808] shrink-0 mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ⚡ ONE-CLICK DEMO PERSONAS */}
            <div className="relative" data-dropdown="demo">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic('tap');
                  setDemoMenuOpen(!demoMenuOpen);
                }}
                aria-expanded={demoMenuOpen}
                aria-haspopup="true"
                aria-label="Toggle One-Click Demo Personas Menu"
                className="bg-[#FF9933] hover:bg-amber-600 text-slate-900 font-extrabold px-2 sm:px-3 py-1 rounded-md text-[10px] sm:text-[11px] shadow-sm flex items-center gap-1 transition active:scale-95 cursor-pointer focus-visible:ring-2 focus-visible:ring-white"
                title="One-Click Demo Personas for Evaluation"
              >
                <span>{t('demoPersonasBtn', lang)}</span>
                <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </button>

              {demoMenuOpen && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 mt-1 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 text-[#1F2937] text-left"
                >
                  <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-[#003366] uppercase">
                    {t('demoMenuTitle', lang)}
                  </div>
                  <p className="px-3 pb-1 text-[10px] text-slate-500 leading-tight">
                    {t('demoMenuSubtitle', lang)}
                  </p>
                  <button
                    onClick={() => {
                      loginAsDemo('farmer');
                      setDemoMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-amber-50 flex items-center gap-2.5 text-[#1F2937] hover:text-[#005A9C]"
                  >
                    <span className="w-7 h-7 rounded-lg bg-amber-100 text-[#FF9933] flex items-center justify-center text-xs shrink-0 font-bold">👤</span>
                    <div>
                      <p className="font-bold leading-tight">{t('citizenPersonaTitle', lang)}</p>
                      <p className="text-[10px] text-slate-500">Mohanbhai Patel • Token #A-42 • Rajkot Rural</p>
                    </div>
                  </button>
                  <Link
                    href="/admin/counter"
                    onClick={() => setDemoMenuOpen(false)}
                    className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-blue-50 flex items-center gap-2.5 text-[#1F2937] hover:text-[#005A9C] border-t border-slate-100"
                  >
                    <span className="w-7 h-7 rounded-lg bg-blue-100 text-[#005A9C] flex items-center justify-center text-xs shrink-0 font-bold">🏛️</span>
                    <div>
                      <p className="font-bold leading-tight text-[#003366]">{t('officerPersonaTitle', lang)}</p>
                      <p className="text-[10px] text-slate-500">Counter 1 Operator • Gondal Jan Seva Kendra</p>
                      <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">
                        Designed to fit naturally into existing government-service environments.
                      </p>
                    </div>
                  </Link>
                  <Link
                    href="/admin/collector"
                    onClick={() => setDemoMenuOpen(false)}
                    className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-amber-50 flex items-center gap-2.5 text-[#1F2937] hover:text-[#005A9C] border-t border-slate-100"
                  >
                    <span className="w-7 h-7 rounded-lg bg-amber-100 text-[#FF9933] flex items-center justify-center text-xs shrink-0 font-bold">👑</span>
                    <div>
                      <p className="font-bold leading-tight text-[#003366]">{t('collectorPersonaTitle', lang)}</p>
                      <p className="text-[10px] text-slate-500">33 Districts Heatmap & SLA Watchdog</p>
                    </div>
                  </Link>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    onClick={() => {
                      resetSession();
                      setDemoMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-[11px] text-red-600 hover:bg-red-50 font-bold flex items-center gap-2"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t('resetSessionBtn', lang)}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN NAV */}
      <nav className="bg-white border-b border-slate-200 sticky top-9 z-30 shadow-xs">
        <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 h-14 sm:h-16 flex items-center justify-between">
          <button onClick={() => setView('landing')} className="flex items-center gap-2 sm:gap-3 cursor-pointer">
            <GovLogo className="w-9 h-9 sm:w-11 sm:h-11 shrink-0 drop-shadow-md" />
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-xl tracking-tight text-[#003366] leading-none">{t('appTitle', lang)}</span>
                <span className="text-[9px] sm:text-[10px] bg-amber-50 text-[#FF9933] border border-amber-200 px-1 py-0.5 rounded font-extrabold">{t('appTag', lang)}</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">{t('appSubtitle', lang)}</p>
            </div>
          </button>

          <div className="hidden md:flex items-center gap-7 text-xs font-bold text-slate-600">
            <button onClick={() => setView('landing')} className={view === 'landing' ? 'text-[#005A9C]' : 'hover:text-[#005A9C]'}>{t('navHome', lang)}</button>
            <button onClick={() => setView('services')} className={view === 'services' ? 'text-[#005A9C] font-black' : 'hover:text-[#005A9C] flex items-center gap-1'}>
              <span>{t('navServices', lang)}</span>
              <span className="text-[9px] bg-[#FF9933] text-slate-900 px-1.5 rounded-full font-bold">New</span>
            </button>
            <button onClick={() => setView('dashboard')} className={view === 'dashboard' ? 'text-[#005A9C]' : 'hover:text-[#005A9C]'}>{t('navRadar', lang)}</button>
            <button onClick={() => loginAsDemo('farmer')} className="hover:text-[#005A9C]">{t('navTrackToken', lang)}</button>
            <button onClick={() => triggerHaptic('tap')} className="text-slate-400 hover:text-slate-600">{t('navHelp', lang)}</button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/admin/counter"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#003366] border border-blue-200 text-xs font-black transition active:scale-95 shadow-xs"
            >
              <Building className="w-3.5 h-3.5 text-[#005A9C]" />
              <span>{t('navOfficerDesk', lang)}</span>
            </Link>
            {!currentUser ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => {
                    triggerHaptic('tap');
                    setAuthModalOpen(true);
                  }}
                  className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-[#003366] hover:bg-slate-100 border border-slate-200 cursor-pointer"
                >
                  {t('btnLogin', lang)}
                </button>
                <button
                  onClick={() => {
                    triggerHaptic('tap');
                    setAuthModalOpen(true);
                  }}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-[#005A9C] hover:bg-[#003366] text-white shadow-sm active:scale-95 transition cursor-pointer"
                >
                  {t('btnGetStarted', lang)}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 border border-slate-200 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mohan"
                  alt="Avatar"
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-200 shrink-0"
                />
                <div className="text-left text-xs leading-none">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded border border-amber-200">{t('demoModeBadge', lang)}</span>
                    <p className="font-extrabold text-[#003366] text-[11px] sm:text-xs truncate max-w-[120px] sm:max-w-none">{currentUser.name}</p>
                  </div>
                  <p className="text-[9px] text-[#FF9933] font-bold hidden sm:block mt-0.5">{currentUser.role} • {currentUser.area}</p>
                </div>
                <button onClick={resetSession} className="ml-0.5 text-slate-400 hover:text-red-500 text-xs p-1 cursor-pointer">
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>


      {/* ========================================================= */}
      {/* VIEW: SERVICES & 39 YOJANAS BENTO CATALOG (PHASE 2 ENGINE) */}
      {/* ========================================================= */}
      {view === 'services' && (
        <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
          <div className="mb-4">
            <button
              onClick={() => setView('landing')}
              className="text-xs font-bold text-[#005A9C] hover:text-[#003366] flex items-center gap-1 mb-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> {t('backToHome', lang)}
            </button>
          </div>
          <SchemesCatalog onSelectScheme={handleSelectScheme} lang={lang} />
        </main>
      )}

      {/* ========================================================= */}
      {/* VIEW 1: CITIZEN LANDING PAGE                              */}
      {/* ========================================================= */}
      {view === 'landing' && (
        <main className="flex-1 w-full">
          <section className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-8 sm:pt-10 pb-12 sm:pb-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#003366] text-xs font-semibold">
                <GovLogo className="w-4 h-4 shrink-0" />
                <span>{t('heroBadge', lang)}</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#138808]" />
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-[#003366] tracking-tight leading-tight sm:leading-[1.15] break-words">
                {t('heroTitleLine1', lang)} <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#005A9C] via-[#FF9933] to-[#003366]">
                  {t('heroTitleLine2', lang)}
                </span>
              </h1>

              <p className="text-slate-600 text-xs sm:text-base leading-relaxed max-w-xl">
                {t('heroSubtitle', lang)}
              </p>

              <div className="bg-white p-2 sm:p-2.5 rounded-2xl shadow-xl border border-slate-200 flex flex-col sm:flex-row gap-2 max-w-xl">
                <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 flex-1 min-w-0">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    onFocus={() => setView('services')}
                    placeholder={t('heroSearchPlaceholder', lang)}
                    className="w-full text-xs sm:text-sm bg-transparent outline-none text-[#1F2937] placeholder-slate-400 font-medium"
                  />
                </div>
                <button
                  onClick={() => setView('services')}
                  className="bg-[#005A9C] hover:bg-[#003366] text-white font-bold px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition whitespace-nowrap cursor-pointer"
                >
                  <span>{t('heroExploreBtn', lang)}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FF9933] shrink-0" />
                  <span>{t('heroTagDistricts', lang)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#138808] shrink-0" />
                  <span>{t('heroTagPrivacy', lang)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#005A9C] shrink-0" />
                  <span>{t('heroTagLive', lang)}</span>
                </div>
              </div>
            </div>

            {/* Right: Floating Hero Card */}
            <div className="lg:col-span-5 flex justify-center w-full">
              <div className="relative w-full max-w-[290px] sm:max-w-[340px]">
                <div className="absolute -inset-3 bg-gradient-to-tr from-[#005A9C]/20 via-[#FF9933]/20 to-[#138808]/20 rounded-3xl blur-xl" />
                <div className="relative bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{t('virtualTokenTitle', lang)}</span>
                    <span className="bg-emerald-50 text-[#138808] border border-emerald-200 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#138808] animate-ping" />
                      {t('tokenActiveBadge', lang)}
                    </span>
                  </div>

                  <div className="text-center py-2">
                    <h2 className="text-5xl font-black text-[#003366] tracking-tight">B-1247</h2>
                    <p className="text-xs font-bold text-slate-600 mt-1">{t('tokenCenterDefault', lang)}</p>
                  </div>

                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-amber-800 font-semibold">{t('estimatedWaitLabel', lang)}</p>
                      <p className="text-base font-black text-amber-950">{t('estimatedWaitVal', lang)}</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-[#FF9933] flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col items-center">
                    <div className="w-36 h-36 bg-[#003366] rounded-2xl p-2.5 shadow-inner flex items-center justify-center">
                      <div className="w-full h-full bg-white rounded-xl p-2 flex flex-col justify-between">
                        <div className="flex justify-between">
                          <div className="w-6 h-6 border-4 border-[#003366] rounded-sm p-0.5"><div className="w-full h-full bg-[#003366]" /></div>
                          <div className="w-6 h-6 border-4 border-[#003366] rounded-sm p-0.5"><div className="w-full h-full bg-[#003366]" /></div>
                        </div>
                        <div className="qr-pattern flex-1 my-1" />
                        <div className="flex justify-between items-end">
                          <div className="w-6 h-6 border-4 border-[#003366] rounded-sm p-0.5"><div className="w-full h-full bg-[#003366]" /></div>
                          <span className="text-[8px] font-mono font-bold text-[#003366]">QLESS-GP</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 mt-2 flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t('scanAtEntryText', lang)}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => loginAsDemo('farmer')}
                    className="w-full mt-4 bg-[#003366] hover:bg-[#002244] text-white font-bold py-2.5 rounded-xl text-xs transition active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span>{t('btnViewLiveRadar', lang)}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Curated Top Services Preview on Landing (Limits initial scroll length) */}
          <section className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
            <SchemesCatalog 
              onSelectScheme={handleSelectScheme} 
              lang={lang} 
              maxItems={6}
              onViewAll={() => setView('services')}
            />
          </section>

          {/* STATS COUNTER */}
          <section className="bg-white border-t border-slate-200 py-8 sm:py-12">
            <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-8 sm:mb-14">
                <div className="bg-[#F5F7FA] border border-slate-200 rounded-xl sm:rounded-2xl p-3.5 sm:p-5">
                  <p className="text-[11px] sm:text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#005A9C] shrink-0" />
                    <span>{t('statLiveTokens', lang)}</span>
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#003366] mt-1">12,483</h3>
                  <p className="text-[10px] sm:text-[11px] text-[#138808] font-bold mt-0.5">{t('todayGrowth', lang)}</p>
                </div>

                <div className="bg-[#F5F7FA] border border-slate-200 rounded-xl sm:rounded-2xl p-3.5 sm:p-5">
                  <p className="text-[11px] sm:text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#FF9933] shrink-0" />
                    <span>{t('statAvgWait', lang)}</span>
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#003366] mt-1">14 min</h3>
                  <p className="text-[10px] sm:text-[11px] text-[#138808] font-bold mt-0.5">{t('vsWalkin', lang)}</p>
                </div>

                <div className="bg-[#F5F7FA] border border-slate-200 rounded-xl sm:rounded-2xl p-3.5 sm:p-5">
                  <p className="text-[11px] sm:text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#138808] shrink-0" />
                    <span>{t('statActiveKacheris', lang)}</span>
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#003366] mt-1">250+</h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold mt-0.5">{t('statAllDistricts', lang)}</p>
                </div>

                <div className="bg-[#F5F7FA] border border-slate-200 rounded-xl sm:rounded-2xl p-3.5 sm:p-5">
                  <p className="text-[11px] sm:text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#FF9933] shrink-0" />
                    <span>{t('statGrtsaSla', lang)}</span>
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#003366] mt-1">99.8%</h3>
                  <p className="text-[10px] sm:text-[11px] text-[#138808] font-bold mt-0.5">{t('statTimeBound', lang)}</p>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ========================================================== */}
      {/* VIEW 2: CITIZEN RADAR & DASHBOARD                          */}
      {/* ========================================================== */}
      {view === 'dashboard' && (
        <section className="flex-1 bg-[#F5F7FA] flex flex-col md:flex-row w-full max-w-[1920px] mx-auto">
          <aside className="hidden md:flex md:w-64 bg-[#003366] text-white flex-col justify-between shrink-0">
            <div>
              <div className="p-5 border-b border-blue-900/60 flex items-center gap-3">
                <GovLogo className="w-9 h-9 shrink-0 drop-shadow-sm" />
                <div>
                  <h3 className="font-extrabold text-white text-sm">{t('appTitle', lang)} {t('appTag', lang)}</h3>
                  <p className="text-[10px] text-blue-200">{t('govTechPortal', lang)}</p>
                </div>
              </div>

              <nav className="p-3 space-y-1 text-xs font-bold">
                <button className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl bg-[#005A9C] text-white">
                  <span>{t('dashboardTitle', lang)}</span>
                </button>
                <button
                  onClick={() => {
                    triggerHaptic('tap');
                    setView('services');
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-blue-200 hover:text-white hover:bg-blue-900/50"
                >
                  <Layers className="w-4 h-4 text-[#FF9933]" />
                  <span>{t('navServices', lang)}</span>
                </button>
                <button onClick={() => triggerHaptic('tap')} className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-blue-200 hover:text-white hover:bg-blue-900/50">
                  <span>{t('historyTab', lang)}</span>
                </button>
                <button onClick={() => triggerHaptic('tap')} className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-blue-200 hover:text-white hover:bg-blue-900/50">
                  <span>{t('profileTab', lang)}</span>
                </button>
              </nav>
            </div>

            <div className="p-4 border-t border-blue-900/60 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-amber-400/20 text-[#FF9933] flex items-center justify-center text-xs">
                🇮🇳
              </span>
              <div className="text-[10px] leading-tight">
                <p className="font-bold text-white">{lang === 'gu' ? 'નાગરિક પોર્ટલ' : lang === 'hi' ? 'नागरिक पोर्टल' : 'Citizen Portal'}</p>
                <p className="text-blue-200">{lang === 'gu' ? 'ગુજરાત સરકાર પ્રેરિત ડિઝાઇન' : lang === 'hi' ? 'गुजरात सरकार प्रेरित डिज़ाइन' : 'Gov-Inspired Design System'}</p>
              </div>
            </div>
          </aside>

          {/* Right Main Dashboard */}
          <div className="flex-1 flex flex-col min-w-0">
            <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase hidden sm:inline">{t('liveDistrictLabel', lang)}</span>
                <div className="flex items-center gap-2 bg-[#F5F7FA] border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-[#003366]">
                  <span>🇮🇳</span>
                  <span>{t('districtRajkot', lang)}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2.5">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mohan"
                    alt="Avatar"
                    className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300"
                  />
                  <div className="text-left text-xs leading-none hidden sm:block">
                    <p className="font-extrabold text-[#003366]">{currentUser?.name || 'Mohanbhai Patel'}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{currentUser?.role || 'Citizen'} • {currentUser?.area || 'Rajkot Rural'}</p>
                  </div>
                </div>
                <button className="relative w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-slate-600" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF9933] text-slate-900 font-black text-[9px] flex items-center justify-center">3</span>
                </button>
              </div>
            </header>

            <div className="p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 flex-1 overflow-y-auto">
              
              {/* Left Column: My Live Token Card */}
              <div className="lg:col-span-5 space-y-4 sm:space-y-6">
                <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-[#003366] tracking-tight">{t('myLiveTokenCardTitle', lang)}</span>
                    <span className="bg-emerald-50 text-[#138808] border border-emerald-200 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#138808] animate-ping" />
                      {t('tokenActiveBadge', lang)}
                    </span>
                  </div>

                  <div className="mt-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('virtualTokenTitle', lang)}</p>
                    <h2 className="text-4xl sm:text-5xl font-black text-[#FF9933] tracking-tight mt-0.5">
                      {activeBooking ? activeBooking.tokenNumber : (currentUser?.token || '#A-42')}
                    </h2>
                    <div className="mt-2">
                      <p className="text-xs font-black text-[#003366]">
                        {activeBooking 
                          ? `${t('counterLabel', lang)} ${activeBooking.counterNumber} • ${lang === 'en' ? (activeBooking.counterNameEn || activeBooking.counterNameGu) : activeBooking.counterNameGu}` 
                          : t('defaultServiceTitle', lang)}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {activeBooking ? `${t('officerLabel', lang)} ${activeBooking.officerName}` : t('defaultServiceSub', lang)}
                      </p>
                    </div>
                  </div>

                  <div className="my-5 bg-[#F5F7FA] border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center">
                    <div className="w-44 h-44 bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div className="flex justify-between">
                        <div className="w-8 h-8 border-4 border-[#003366] rounded-sm p-0.5"><div className="w-full h-full bg-[#003366]" /></div>
                        <div className="w-8 h-8 border-4 border-[#003366] rounded-sm p-0.5"><div className="w-full h-full bg-[#003366]" /></div>
                      </div>
                      <div className="qr-pattern flex-1 my-1.5" />
                      <div className="flex justify-between items-end">
                        <div className="w-8 h-8 border-4 border-[#003366] rounded-sm p-0.5"><div className="w-full h-full bg-[#003366]" /></div>
                        <span className="text-[9px] font-mono font-black text-[#003366]">
                          {activeBooking ? `Qless-${activeBooking.tokenNumber.replace('#','')}-GP` : 'Qless-A42-GP'}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] font-mono font-bold text-slate-500 mt-2">
                      {activeBooking ? (lang === 'en' ? (activeBooking.taluka.officeNameEn || activeBooking.taluka.officeNameGu) : activeBooking.taluka.officeNameGu) : 'Qless-A42-GP (Encrypted Token ID)'}
                    </p>
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-sm font-extrabold text-[#003366]">
                      {t('arriveByLabel', lang)} <span className="text-red-600 font-black">
                        {activeBooking 
                          ? (lateShiftMinutes > 0 ? `${activeBooking.slot.startTime} (+${lateShiftMinutes}m)` : activeBooking.slot.startTime) 
                          : (lateShiftMinutes > 0 ? `11:56 AM (+${lateShiftMinutes}m)` : '11:20 AM')}
                      </span>
                    </p>
                    <p className="text-xs font-bold text-[#FF9933]">
                      ⏱️ {activeBooking ? activeBooking.slot.timeRange : '11:30 AM - 12:30 PM'} {lateShiftMinutes > 0 ? t('rescheduledLabel', lang) : t('trafficBufferLabel', lang)}
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button
                      onClick={handleRunningLate}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold py-2.5 px-2 rounded-xl text-[11px] sm:text-xs flex items-center justify-center gap-1 active:scale-95 transition min-h-[44px]"
                      title={t('btnRunningLate', lang)}
                    >
                      <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{t('btnRunningLate', lang)}</span>
                    </button>
                    <button
                      onClick={() => {
                        triggerHaptic('tap');
                        const tokenStr = activeBooking ? activeBooking.tokenNumber : '#A-42';
                        speakGuidance(
                          lang === 'en'
                            ? `Hello ${currentUser?.name || 'Mohanbhai'}, your token number ${tokenStr} is active. Please proceed to the counter on time.`
                            : lang === 'hi'
                              ? `नमस्ते ${currentUser?.name || 'मोहनभाई'}, आपका टोकन नंबर ${tokenStr} सक्रिय है। कृपया समय पर काउंटर पर पहुंचें।`
                              : `નમસ્તે ${currentUser?.name || 'મોહનભાઈ'}, તમારો ટોકન નંબર ${tokenStr} સક્રિય છે. કૃપા કરીને સમયસર કાઉન્ટર પર પહોંચો.`
                        );
                      }}
                      className="bg-blue-50 hover:bg-blue-100 text-[#003366] border border-blue-200 font-bold py-2.5 px-2 rounded-xl text-[11px] sm:text-xs flex items-center justify-center gap-1 active:scale-95 transition min-h-[44px]"
                      title={t('btnListenAudio', lang)}
                    >
                      <Volume2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{t('btnListenAudio', lang)}</span>
                    </button>
                  </div>

                  {activeBooking && (
                    <div className="mt-3">
                      <button
                        onClick={() => {
                          triggerHaptic('tap');
                          setTokenPassModalOpen(true);
                        }}
                        className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
                      >
                        <Ticket className="w-4 h-4 text-[#FF9933]" />
                        <span>{t('btnViewDigitalPass', lang)}</span>
                      </button>
                    </div>
                  )}

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500">{t('queuePosition', lang)}</span>
                    <span className="text-xl font-black text-[#003366] bg-[#F5F7FA] px-3 py-1 rounded-xl font-mono">
                      {lateShiftMinutes > 0 ? '17' : '14'}
                    </span>
                  </div>
                </div>

                {/* ♿ MULTI-MODAL ACCESSIBILITY CHANNELS (PHASE 1 INCLUSIVE DESIGN) */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">♿</span>
                      <h4 className="text-xs font-black text-[#003366] uppercase tracking-wide">
                        {t('multiModalTitle', lang)}
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                      {t('elderlyRuralTag', lang)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                    {t('multiModalDesc', lang)}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="bg-emerald-50/70 border border-emerald-200 p-2 rounded-xl flex items-center gap-1.5">
                      <span className="text-sm">🟢</span>
                      <div>
                        <p className="text-[9px] font-bold text-emerald-800 uppercase">{t('channelVisual', lang)}</p>
                        <p className="text-[10px] font-black text-slate-800 leading-tight">{t('channelVisualDesc', lang)}</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 p-2 rounded-xl flex items-center gap-1.5">
                      <span className="text-sm">🔔</span>
                      <div>
                        <p className="text-[9px] font-bold text-[#005A9C] uppercase">{t('channelChime', lang)}</p>
                        <p className="text-[10px] font-black text-slate-800 leading-tight">{t('channelChimeDesc', lang)}</p>
                      </div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 p-2 rounded-xl flex items-center gap-1.5">
                      <span className="text-sm">🗣️</span>
                      <div>
                        <p className="text-[9px] font-bold text-purple-800 uppercase">{t('channelVoice', lang)}</p>
                        <p className="text-[10px] font-black text-slate-800 leading-tight">{t('channelVoiceDesc', lang)}</p>
                      </div>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 p-2 rounded-xl flex items-center gap-1.5">
                      <span className="text-sm">📳</span>
                      <div>
                        <p className="text-[9px] font-bold text-amber-800 uppercase">{t('channelHaptic', lang)}</p>
                        <p className="text-[10px] font-black text-slate-800 leading-tight">{t('channelHapticDesc', lang)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Queue Radar + Waiting Room Display */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-6">
                
                {/* 📡 PHASE 1: LIVE QUEUE VISUALIZATION / KACHERI RADAR */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-[#003366]">
                          {t('radarHeading', lang)}
                        </h3>
                        <span className="text-xs bg-amber-50 text-[#FF9933] font-bold px-2 py-0.5 rounded border border-amber-200">
                          {t('radarBadge', lang)}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#FF9933] shrink-0" />
                        <span>
                          {t('currentOfficeTitle', lang)} {activeBooking ? (lang === 'en' ? `${activeBooking.taluka.officeNameEn || activeBooking.taluka.officeNameGu}, ${activeBooking.district.nameEn || activeBooking.district.nameGu}` : `${activeBooking.taluka.officeNameGu}, ${activeBooking.district.nameGu}`) : t('defaultOfficeName', lang)}
                        </span>
                      </p>
                    </div>
                    <span className="text-[10px] font-bold bg-[#F5F7FA] text-[#003366] border border-slate-200 px-2.5 py-1 rounded-lg">
                      Queue Display • Phase 1
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-center">
                    <div className="bg-[#F5F7FA] border border-slate-200 rounded-2xl p-4">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('liveWaitEst', lang)}</p>
                      <h4 className="text-3xl sm:text-4xl font-black text-[#138808] mt-1">{lang === 'gu' ? '૧૮ મિનિટ' : lang === 'hi' ? '१८ मिनट' : '18 mins'}</h4>
                      <p className="text-xs text-slate-600 font-semibold mt-1">{t('estServiceTime', lang)}</p>
                      <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-[#005A9C] bg-blue-50 p-2 rounded-lg border border-blue-100">
                        <span>{t('routeBufferDesc', lang)}</span>
                      </div>
                    </div>

                    <div className="bg-[#F5F7FA] border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xs font-bold text-slate-500">{t('crowdGaugeLabel', lang)}</span>
                        <span className="text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span>🟡</span>
                          <span>{t('busyStatus', lang)}</span>
                        </span>
                      </div>

                      <div className="relative w-48 h-24 overflow-hidden">
                        <svg viewBox="0 0 200 100" className="w-full h-full">
                          <path d="M 20 90 A 80 80 0 0 1 180 90" fill="none" stroke="#e2e8f0" strokeWidth="16" strokeLinecap="round" />
                          <path d="M 20 90 A 80 80 0 0 1 155 42" fill="none" stroke="url(#gaugeGrad)" strokeWidth="16" strokeLinecap="round" />
                          <defs>
                            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#138808" />
                              <stop offset="60%" stopColor="#FF9933" />
                              <stop offset="100%" stopColor="#ea580c" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute bottom-0 inset-x-0 flex flex-col items-center">
                          <span className="text-2xl font-black text-[#003366] leading-none">75%</span>
                          <span className="text-[10px] font-bold text-slate-400 mt-0.5">{t('capacityText', lang)}</span>
                        </div>
                      </div>

                      <div className="mt-2 text-[11px] font-bold text-slate-600">
                        <span>{t('activeCountersSummary', lang)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 📺 WAITING HALL DISPLAY & 6 DETAILED COUNTER CARDS */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-base font-black text-[#003366] flex items-center gap-2">
                        <span>🏛️ {t('waitingHallHeading', lang)}</span>
                        <span className="text-xs bg-blue-50 text-[#005A9C] px-2 py-0.5 rounded-md font-bold">{t('waitingHallBadge', lang)}</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {t('waitingHallSub', lang)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-bold border border-slate-200">
                        🕒 10:55 AM Live
                      </span>
                    </div>
                  </div>

                  {/* 6 Rich Counter Cards Grid */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {/* COUNTER 1 */}
                    <div className="rounded-2xl border-2 border-emerald-300 bg-white p-3.5 flex flex-col justify-between shadow-xs">
                      <div>
                        <div className="flex items-center justify-between gap-1 pb-2 border-b border-slate-100">
                          <span className="text-xs font-black tracking-wide text-[#003366] uppercase">
                            {t('counterLabel', lang)} 1
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-[#138808] border border-emerald-300">
                            <span>🟢</span>
                            <span>{t('openBadge', lang)}</span>
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs font-black text-slate-800 leading-tight">{t('counter1Title', lang)}</p>
                          <p className="text-[10px] font-medium text-slate-500 mt-1">
                            {t('counter1Officer', lang)}
                          </p>
                        </div>
                      </div>

                      <div className="my-3 grid grid-cols-2 gap-2">
                        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2 text-center">
                          <p className="text-[9px] font-black uppercase text-emerald-800 tracking-wider">{t('nowServingText', lang)}</p>
                          <p className="text-2xl font-black text-[#003366] font-mono mt-0.5">A-40</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center">
                          <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">{t('nextText', lang)}</p>
                          <p className="text-2xl font-black text-[#FF9933] font-mono mt-0.5">A-41</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-600 flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>8 {t('peopleWaitingSuffix', lang)}</span>
                        </span>
                        <span className="text-[#005A9C] flex items-center gap-1 font-extrabold">
                          <Clock className="w-3 h-3 text-[#FF9933]" />
                          <span>{t('estWaitPrefix', lang)} 24 min</span>
                        </span>
                      </div>
                    </div>

                    {/* COUNTER 2 */}
                    <div className="rounded-2xl border-2 border-amber-300 bg-white p-3.5 flex flex-col justify-between shadow-xs">
                      <div>
                        <div className="flex items-center justify-between gap-1 pb-2 border-b border-slate-100">
                          <span className="text-xs font-black tracking-wide text-[#003366] uppercase">
                            {t('counterLabel', lang)} 2
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-900 border border-amber-300">
                            <span>🟡</span>
                            <span>{t('busyBadge', lang)}</span>
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs font-black text-slate-800 leading-tight">{t('counter2Title', lang)}</p>
                          <p className="text-[10px] font-medium text-slate-500 mt-1">
                            {t('counter2Officer', lang)}
                          </p>
                        </div>
                      </div>

                      <div className="my-3 grid grid-cols-2 gap-2">
                        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2 text-center">
                          <p className="text-[9px] font-black uppercase text-emerald-800 tracking-wider">{t('nowServingText', lang)}</p>
                          <p className="text-2xl font-black text-[#003366] font-mono mt-0.5">A-41</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center">
                          <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">{t('nextText', lang)}</p>
                          <p className="text-2xl font-black text-[#FF9933] font-mono mt-0.5">A-42</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-600 flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>5 {t('peopleWaitingSuffix', lang)}</span>
                        </span>
                        <span className="text-[#005A9C] flex items-center gap-1 font-extrabold">
                          <Clock className="w-3 h-3 text-[#FF9933]" />
                          <span>{t('estWaitPrefix', lang)} 15 min</span>
                        </span>
                      </div>
                    </div>

                    {/* COUNTER 3: LUNCH BREAK */}
                    <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/40 p-3.5 flex flex-col justify-between shadow-xs">
                      <div>
                        <div className="flex items-center justify-between gap-1 pb-2 border-b border-amber-200/60">
                          <span className="text-xs font-black tracking-wide text-[#003366] uppercase">
                            {t('counterLabel', lang)} 3
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                            <span>🟡</span>
                            <span>{t('lunchBreakBadge', lang)}</span>
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs font-black text-slate-800 leading-tight">{t('counter3Title', lang)}</p>
                          <p className="text-[10px] font-medium text-slate-500 mt-1">
                            {t('counter3Officer', lang)}
                          </p>
                        </div>
                      </div>

                      <div className="my-3 py-3 px-2.5 bg-amber-100/70 border border-amber-300 rounded-xl text-center">
                        <div className="inline-flex items-center gap-1 text-xs font-black text-amber-900 mb-0.5">
                          <span>🟡 {t('lunchBreakBadge', lang)}</span>
                        </div>
                        <p className="text-xs font-black text-slate-800">
                          {t('lunchResumesAt', lang)}
                        </p>
                        <div className="mt-2 pt-1 border-t border-amber-200/70 flex items-center justify-around text-[10px] font-bold text-slate-600">
                          <span>{t('nextText', lang)}: <strong className="font-mono text-slate-800">A-39</strong></span>
                          <span>•</span>
                          <span>3 {t('peopleWaitingSuffix', lang)}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-600 flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>3 {t('peopleWaitingSuffix', lang)}</span>
                        </span>
                        <span className="text-amber-800 flex items-center gap-1 font-extrabold">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>{t('lunchResumesIn', lang)}</span>
                        </span>
                      </div>
                    </div>

                    {/* COUNTER 4 */}
                    <div className="rounded-2xl border-2 border-emerald-300 bg-white p-3.5 flex flex-col justify-between shadow-xs">
                      <div>
                        <div className="flex items-center justify-between gap-1 pb-2 border-b border-slate-100">
                          <span className="text-xs font-black tracking-wide text-[#003366] uppercase">
                            {t('counterLabel', lang)} 4
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-[#138808] border border-emerald-300">
                            <span>🟢</span>
                            <span>{t('openBadge', lang)}</span>
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs font-black text-slate-800 leading-tight">{t('counter4Title', lang)}</p>
                          <p className="text-[10px] font-medium text-slate-500 mt-1">
                            {t('counter4Officer', lang)}
                          </p>
                        </div>
                      </div>

                      <div className="my-3 grid grid-cols-2 gap-2">
                        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2 text-center">
                          <p className="text-[9px] font-black uppercase text-emerald-800 tracking-wider">{t('nowServingText', lang)}</p>
                          <p className="text-2xl font-black text-[#003366] font-mono mt-0.5">B-12</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center">
                          <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">{t('nextText', lang)}</p>
                          <p className="text-2xl font-black text-[#FF9933] font-mono mt-0.5">B-13</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-600 flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>6 {t('peopleWaitingSuffix', lang)}</span>
                        </span>
                        <span className="text-[#005A9C] flex items-center gap-1 font-extrabold">
                          <Clock className="w-3 h-3 text-[#FF9933]" />
                          <span>{t('estWaitPrefix', lang)} 18 min</span>
                        </span>
                      </div>
                    </div>

                    {/* COUNTER 5 */}
                    <div className="rounded-2xl border-2 border-amber-300 bg-white p-3.5 flex flex-col justify-between shadow-xs">
                      <div>
                        <div className="flex items-center justify-between gap-1 pb-2 border-b border-slate-100">
                          <span className="text-xs font-black tracking-wide text-[#003366] uppercase">
                            {t('counterLabel', lang)} 5
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-900 border border-amber-300">
                            <span>🟡</span>
                            <span>{t('busyBadge', lang)}</span>
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs font-black text-slate-800 leading-tight">{t('counter5Title', lang)}</p>
                          <p className="text-[10px] font-medium text-slate-500 mt-1">
                            {t('counter5Officer', lang)}
                          </p>
                        </div>
                      </div>

                      <div className="my-3 grid grid-cols-2 gap-2">
                        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2 text-center">
                          <p className="text-[9px] font-black uppercase text-emerald-800 tracking-wider">{t('nowServingText', lang)}</p>
                          <p className="text-2xl font-black text-[#003366] font-mono mt-0.5">B-14</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center">
                          <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">{t('nextText', lang)}</p>
                          <p className="text-2xl font-black text-[#FF9933] font-mono mt-0.5">B-15</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-600 flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>11 {t('peopleWaitingSuffix', lang)}</span>
                        </span>
                        <span className="text-[#005A9C] flex items-center gap-1 font-extrabold">
                          <Clock className="w-3 h-3 text-[#FF9933]" />
                          <span>{t('estWaitPrefix', lang)} 32 min</span>
                        </span>
                      </div>
                    </div>

                    {/* COUNTER 6 */}
                    <div className="rounded-2xl border-2 border-emerald-300 bg-white p-3.5 flex flex-col justify-between shadow-xs">
                      <div>
                        <div className="flex items-center justify-between gap-1 pb-2 border-b border-slate-100">
                          <span className="text-xs font-black tracking-wide text-[#003366] uppercase">
                            {t('counterLabel', lang)} 6
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-[#138808] border border-emerald-300">
                            <span>🟢</span>
                            <span>{t('openBadge', lang)}</span>
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs font-black text-slate-800 leading-tight">{t('counter6Title', lang)}</p>
                          <p className="text-[10px] font-medium text-slate-500 mt-1">
                            {t('counter6Officer', lang)}
                          </p>
                        </div>
                      </div>

                      <div className="my-3 grid grid-cols-2 gap-2">
                        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2 text-center">
                          <p className="text-[9px] font-black uppercase text-emerald-800 tracking-wider">{t('nowServingText', lang)}</p>
                          <p className="text-2xl font-black text-[#003366] font-mono mt-0.5">A-42</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center">
                          <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">{t('nextText', lang)}</p>
                          <p className="text-2xl font-black text-[#FF9933] font-mono mt-0.5">A-43</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-600 flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>2 {t('peopleWaitingSuffix', lang)}</span>
                        </span>
                        <span className="text-[#005A9C] flex items-center gap-1 font-extrabold">
                          <Clock className="w-3 h-3 text-[#FF9933]" />
                          <span>{t('estWaitPrefix', lang)} 6 min</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[11px] text-slate-400 font-medium">
                      {t('liveSyncNote', lang)}
                    </p>
                    <button onClick={() => setView('landing')} className="text-xs font-bold text-[#005A9C] hover:text-[#003366] flex items-center gap-1">
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>← {t('backToHome', lang)}</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>
      )}

      {/* CITIZEN IDENTITY CHECK MODAL */}
      {authModalOpen && (
        <div 
          onClick={() => setAuthModalOpen(false)}
          className="fixed inset-0 bg-[#003366]/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 modal-backdrop animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto modal-scroll-area animate-in zoom-in-95"
          >
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-sm w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center transition"
            >
              ✕
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#005A9C] flex items-center justify-center mx-auto text-xl mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-[#003366]">{t('authModalTitle', lang)}</h3>
              <p className="text-xs text-slate-500 mt-1">{t('authModalSubtitle', lang)}</p>
            </div>

            {loginPromptReason && (
              <div className="mb-4 p-3 bg-amber-50 border-2 border-[#FF9933] rounded-2xl text-amber-950 text-xs font-bold flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-[#FF9933] shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="font-extrabold text-[#003366]">{t('loginMandatoryNotice', lang)}</p>
                  <p className="text-[11px] font-medium text-amber-900 mt-0.5">{loginPromptReason}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>{t('phoneLabel', lang)}</span>
                  <button
                    onClick={() => speakGuidance(lang === 'gu' ? "કૃપા કરીને તમારો દસ આંકડાનો મોબાઈલ નંબર દાખલ કરો." : lang === 'hi' ? "कृपया अपना दस अंकों का मोबाइल नंबर दर्ज करें।" : "Please enter your 10-digit mobile number.")}
                    className="text-[#005A9C] text-[11px] hover:underline flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> {t('listenBtnLabel', lang)}
                  </button>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-slate-300 bg-[#F5F7FA] text-slate-500 text-xs font-bold">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={10}
                    className="w-full text-xs font-medium rounded-r-xl border border-slate-300 p-2.5 outline-none focus:border-[#005A9C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>{t('aadhaarLast4Label', lang)}</span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Aadhaar Masking</span>
                </label>
                <input
                  type="password"
                  value={aadhaar4}
                  onChange={(e) => setAadhaar4(e.target.value)}
                  maxLength={4}
                  placeholder="••••"
                  className="w-full text-xs font-medium rounded-xl border border-slate-300 p-2.5 outline-none focus:border-[#005A9C] tracking-widest text-center text-base"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  {t('aadhaarMaskingNote', lang)}
                </p>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => loginAsDemo('farmer')}
                  className="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl py-2 text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <span>{t('demoLoginBtn', lang)}</span>
                </button>
              </div>

              <button
                onClick={handleOtpSubmit}
                className="w-full bg-[#005A9C] hover:bg-[#003366] text-white font-bold py-3 rounded-xl text-xs shadow-md active:scale-95 transition flex items-center justify-center gap-2"
              >
                <span>{t('getOtpBtn', lang)}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEME DRAWER MODAL */}
      <SchemeDrawer
        scheme={activeScheme}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenScanner={handleOpenScanner}
        isLoggedIn={!!currentUser}
        onCollectToken={handleCollectToken}
        lang={lang}
      />

      {/* CAMSCANNER CAMERA GUIDE MODAL */}
      {activeScheme && (
        <CameraScannerModal
          scheme={activeScheme}
          isOpen={scannerOpen}
          onClose={() => setScannerOpen(false)}
          onVerifiedSuccess={handleVerificationSuccess}
          isLoggedIn={!!currentUser}
        />
      )}

      {/* PHASE 3: 33 DISTRICTS & TALUKAS JURISDICTION + CAPPED SLOT ENGINE */}
      <SlotBookingModal
        isOpen={slotModalOpen}
        onClose={() => setSlotModalOpen(false)}
        scheme={activeScheme}
        onConfirm={handleConfirmBooking}
        lang={lang}
      />

      {/* PHASE 3: DIGITAL TOKEN PASS MODAL */}
      {tokenPassModalOpen && activeBooking && (
        <div 
          onClick={() => setTokenPassModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-5 modal-backdrop animate-in fade-in duration-150"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl max-h-[92vh] overflow-y-auto modal-scroll-area rounded-2xl sm:rounded-3xl shadow-2xl animate-in zoom-in-95"
          >
            <DigitalTokenPass
              booking={activeBooking}
              scheme={activeScheme}
              citizenName={currentUser?.name || 'Mohanbhai Patel'}
              onClose={() => setTokenPassModalOpen(false)}
              lang={lang}
            />
          </div>
        </div>
      )}

      {/* PWA 1-CLICK INSTALL BANNER */}
      <PwaInstallBanner />

      {/* SCREEN READER ACCESSIBLE LIVE REGION FOR QUEUE UPDATES */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {activeBooking ? `ટોકન નંબર ${activeBooking.tokenNumber} સક્રિય છે. કાઉન્ટર ${activeBooking.counterNumber} પર પ્રતીક્ષારત.` : ''}
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav 
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pt-1.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] px-3 flex items-center justify-around shadow-lg"
      >
        <button
          onClick={() => {
            triggerHaptic('tap');
            setView('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold min-h-[44px] justify-center transition active:scale-95 focus-visible:ring-2 focus-visible:ring-[#005A9C] rounded-lg px-2 ${
            view === 'landing' ? 'text-[#005A9C]' : 'text-slate-500 hover:text-slate-700'
          }`}
          aria-label={t('mobNavHome', lang)}
        >
          <HomeIcon className="w-4 h-4" />
          <span>{t('mobNavHome', lang)}</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('tap');
            setView('services');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold min-h-[44px] justify-center transition active:scale-95 focus-visible:ring-2 focus-visible:ring-[#005A9C] rounded-lg px-2 ${
            view === 'services' ? 'text-[#005A9C]' : 'text-slate-500 hover:text-slate-700'
          }`}
          aria-label={t('mobNavServices', lang)}
        >
          <Layers className="w-4 h-4" />
          <span>{t('mobNavServices', lang)}</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('tap');
            if (activeBooking) {
              setTokenPassModalOpen(true);
            } else if (currentUser) {
              setView('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              setAuthModalOpen(true);
            }
          }}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold min-h-[44px] justify-center transition active:scale-95 focus-visible:ring-2 focus-visible:ring-[#005A9C] rounded-lg px-2 ${
            activeBooking ? 'text-[#FF9933]' : 'text-slate-500 hover:text-slate-700'
          }`}
          aria-label={activeBooking ? `${t('mobNavTokenPass', lang)} ${activeBooking.tokenNumber}` : t('mobNavTokenPass', lang)}
        >
          <div className={`w-8 h-8 -mt-3.5 rounded-full flex items-center justify-center border-2 border-white shadow-md transition ${
            activeBooking ? 'bg-[#003366] text-[#FF9933]' : 'bg-slate-200 text-slate-600'
          }`}>
            <Ticket className="w-4 h-4" />
          </div>
          <span>{activeBooking ? activeBooking.tokenNumber : t('mobNavTokenPass', lang)}</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('tap');
            setView('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold min-h-[44px] justify-center transition active:scale-95 focus-visible:ring-2 focus-visible:ring-[#005A9C] rounded-lg px-2 ${
            view === 'dashboard' ? 'text-[#005A9C]' : 'text-slate-500 hover:text-slate-700'
          }`}
          aria-label={t('mobNavRadar', lang)}
        >
          <Radio className="w-4 h-4" />
          <span>{t('mobNavRadar', lang)}</span>
        </button>
      </nav>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 text-center">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-2 flex flex-col items-center">
          <GovLogo className="w-12 h-12 mb-1 drop-shadow-sm" />
          <p className="font-bold text-[#003366]">{t('footerDisclaimer', lang)}</p>
          <p className="text-[11px] text-slate-400">
            {t('footerGrtsaCompliance', lang)}
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/admin/counter"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-[#003366] rounded-lg font-bold text-xs transition"
            >
              <Building className="w-3.5 h-3.5 text-[#005A9C]" />
              <span>{t('footerOperatorConsoleLink', lang)}</span>
            </Link>
            <Link
              href="/admin/collector"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg font-bold text-xs transition"
            >
              <span>{t('footerCollectorLink', lang)}</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
