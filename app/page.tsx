'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, MapPin, Lock, Clock, Search, ArrowRight, 
  RotateCcw, Volume2, QrCode, Ticket, Brain, Crosshair, 
  Users, Building, Award, Bell, CheckCircle2, ChevronDown, Download,
  Layers, ArrowLeft, Calendar, Home as HomeIcon, Radio
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
import { SchemeItem, ALL_YOJANAS } from '@/lib/schemes-data';

export default function Home() {
  const [view, setView] = useState<'landing' | 'dashboard' | 'services'>('landing');
  const [lang, setLang] = useState<'en' | 'gu' | 'hi'>('en');
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [phone, setPhone] = useState('9876543210');
  const [aadhaar4, setAadhaar4] = useState('8842');
  
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
    setLateShiftMinutes(prev => prev + 36);
    speakGuidance("તમારો ટોકન ૩ સ્લોટ પાછળ ખસેડવામાં આવ્યો છે. કાઉન્ટર તમારો નંબર છોડશે નહીં.");
    alert("⚠️ મોડું થવાની વિનંતી મંજૂર!\n\nતમારો ટોકન ૩ સ્લોટ (+૩૬ મિનિટ) આગળ ધકેલવામાં આવ્યો છે. નવો અંદાજિત સમય અપડેટ થયો છે. કાઉન્ટર અધિકારી તમારો વારો સ્કીપ નહીં કરે.");
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
      speakGuidance("ટોકન મેળવવા માટે પહેલાં નાગરિક લૉગિન કરવું ફરજિયાત છે.");
      setPendingTokenScheme(scheme);
      setLoginPromptReason(`🔒 "${scheme.titleGu}" નો કચેરી ટોકન કલેક્ટ કરવા માટે નાગરિક લૉગિન (2FA Civic Login) ફરજિયાત છે.`);
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
      speakGuidance("દસ્તાવેજ પ્રમાણિત! ટોકન મેળવવા માટે પહેલાં નાગરિક લૉગિન કરો.");
      setPendingTokenScheme(activeScheme);
      setLoginPromptReason(`🔒 દસ્તાવેજ પ્રમાણિત! "${activeScheme.titleGu}" નો ટોકન ફાળવવા માટે નાગરિક ઓળખ ચકાસણી (Login) ફરજિયાત છે.`);
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
    <div className="flex-1 flex flex-col min-h-screen bg-[#F5F7FA] text-[#1F2937] pb-20 md:pb-0">
      {/* TOP GOV-SERVICE BAR (Government-Service Visual Palette: Navy Blue #003366, Saffron #FF9933, India Green #138808) */}
      <header className="bg-[#003366] text-white text-xs border-b border-blue-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-9 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="flex items-center gap-1 font-semibold text-white text-[10px] sm:text-xs truncate">
              <span className="w-2 h-2 rounded-full bg-[#138808] animate-pulse shrink-0" />
              <span className="hidden sm:inline">Citizen Service Network • Live Status</span>
              <span className="sm:hidden">Network • Live</span>
            </span>
            <span className="text-blue-300/40 hidden md:inline">|</span>
            <span className="text-blue-200 hidden md:inline font-mono text-[11px]">GRTSA Public Service Framework</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Language Switcher */}
            <div className="flex items-center bg-[#002244] rounded-lg p-0.5 border border-blue-800 text-[10px] sm:text-[11px]">
              {(['en', 'gu', 'hi'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    triggerHaptic('tap');
                    setLang(l);
                  }}
                  className={`px-1.5 sm:px-2 py-0.5 rounded font-bold transition ${
                    lang === l ? 'bg-[#005A9C] text-white' : 'text-blue-200 hover:text-white'
                  }`}
                >
                  {l === 'en' ? 'EN' : l === 'gu' ? 'ગુજરાતી' : 'हिंदी'}
                </button>
              ))}
            </div>

            {/* ⚡ ONE-CLICK DEMO PERSONAS */}
            <div className="relative">
              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setDemoMenuOpen(!demoMenuOpen);
                }}
                className="bg-[#FF9933] hover:bg-amber-600 text-slate-900 font-extrabold px-2 sm:px-3 py-1 rounded-md text-[10px] sm:text-[11px] shadow-sm flex items-center gap-1 transition active:scale-95 cursor-pointer"
                title="One-Click Demo Personas for Evaluation"
              >
                <span>⚡ Demo Personas</span>
                <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </button>

              {demoMenuOpen && (
                <div className="absolute right-0 mt-1 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 text-[#1F2937] text-left">
                  <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-[#003366] uppercase">
                    ઝડપી ડેમો પ્રોફાઇલ્સ (One-Click Demo Personas)
                  </div>
                  <p className="px-3 pb-1 text-[10px] text-slate-500 leading-tight">
                    For jury & test evaluation without manual OTPs or phone entry.
                  </p>
                  <button
                    onClick={() => loginAsDemo('farmer')}
                    className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-amber-50 flex items-center gap-2.5 text-[#1F2937] hover:text-[#005A9C]"
                  >
                    <span className="w-7 h-7 rounded-lg bg-amber-100 text-[#FF9933] flex items-center justify-center text-xs shrink-0 font-bold">👤</span>
                    <div>
                      <p className="font-bold leading-tight">નાગરિક ડેમો પ્રોફાઇલ (Citizen Persona)</p>
                      <p className="text-[10px] text-slate-500">Mohanbhai Patel • Token #A-42 • Rajkot Rural</p>
                    </div>
                  </button>
                  <Link
                    href="/admin/counter"
                    className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-blue-50 flex items-center gap-2.5 text-[#1F2937] hover:text-[#005A9C] border-t border-slate-100"
                  >
                    <span className="w-7 h-7 rounded-lg bg-blue-100 text-[#005A9C] flex items-center justify-center text-xs shrink-0 font-bold">🏛️</span>
                    <div>
                      <p className="font-bold leading-tight text-[#003366]">અધિકારી ડેસ્ક (Officer Console Persona ➔)</p>
                      <p className="text-[10px] text-slate-500">Counter 1 Operator • Gondal Jan Seva Kendra</p>
                      <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">
                        Designed to fit naturally into existing government-service environments.
                      </p>
                    </div>
                  </Link>
                  <Link
                    href="/admin/collector"
                    className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-amber-50 flex items-center gap-2.5 text-[#1F2937] hover:text-[#005A9C] border-t border-slate-100"
                  >
                    <span className="w-7 h-7 rounded-lg bg-amber-100 text-[#FF9933] flex items-center justify-center text-xs shrink-0 font-bold">👑</span>
                    <div>
                      <p className="font-bold leading-tight text-[#003366]">કલેક્ટર કમાન્ડ સેન્ટર ➔</p>
                      <p className="text-[10px] text-slate-500">33 Districts Heatmap & SLA Watchdog</p>
                    </div>
                  </Link>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    onClick={resetSession}
                    className="w-full text-left px-3 py-1.5 text-[11px] text-red-600 hover:bg-red-50 font-bold flex items-center gap-2"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>રીસેટ સેશન (Reset Session)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN NAV */}
      <nav className="bg-white border-b border-slate-200 sticky top-9 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <button onClick={() => setView('landing')} className="flex items-center gap-2 sm:gap-3 cursor-pointer">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#003366] text-white flex items-center justify-center font-black text-base sm:text-xl shadow-md border-2 border-[#FF9933] shrink-0">
              Q
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-xl tracking-tight text-[#003366] leading-none">QueueLess</span>
                <span className="text-[9px] sm:text-[10px] bg-amber-50 text-[#FF9933] border border-amber-200 px-1 py-0.5 rounded font-extrabold">કચેરી</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden sm:block">Government Office Queue Management System</p>
            </div>
          </button>

          <div className="hidden md:flex items-center gap-7 text-xs font-bold text-slate-600">
            <button onClick={() => setView('landing')} className={view === 'landing' ? 'text-[#005A9C]' : 'hover:text-[#005A9C]'}>Home</button>
            <button onClick={() => setView('services')} className={view === 'services' ? 'text-[#005A9C] font-black' : 'hover:text-[#005A9C] flex items-center gap-1'}>
              <span>Services (39 Yojanas)</span>
              <span className="text-[9px] bg-[#FF9933] text-slate-900 px-1.5 rounded-full font-bold">New</span>
            </button>
            <button onClick={() => setView('dashboard')} className={view === 'dashboard' ? 'text-[#005A9C]' : 'hover:text-[#005A9C]'}>Queue Radar (કચેરી રડાર)</button>
            <button onClick={() => loginAsDemo('farmer')} className="hover:text-[#005A9C]">Track Token</button>
            <button onClick={() => triggerHaptic('tap')} className="text-slate-400 hover:text-slate-600">Help & Support</button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/admin/counter"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#003366] border border-blue-200 text-xs font-black transition active:scale-95 shadow-xs"
            >
              <Building className="w-3.5 h-3.5 text-[#005A9C]" />
              <span>અધિકારી ડેસ્ક</span>
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
                  Login
                </button>
                <button
                  onClick={() => {
                    triggerHaptic('tap');
                    setAuthModalOpen(true);
                  }}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-[#005A9C] hover:bg-[#003366] text-white shadow-sm active:scale-95 transition cursor-pointer"
                >
                  Get Started
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
                  <p className="font-extrabold text-[#003366] text-[11px] sm:text-xs truncate max-w-[90px] sm:max-w-none">{currentUser.name}</p>
                  <p className="text-[9px] text-[#FF9933] font-bold hidden sm:block">{currentUser.role} • {currentUser.area}</p>
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
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full">
          <div className="mb-4">
            <button
              onClick={() => setView('landing')}
              className="text-xs font-bold text-[#005A9C] hover:text-[#003366] flex items-center gap-1 mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> હોમ પેજ પર પાછા જાઓ
            </button>
          </div>
          <SchemesCatalog onSelectScheme={handleSelectScheme} />
        </main>
      )}

      {/* ========================================================= */}
      {/* VIEW 1: CITIZEN LANDING PAGE                              */}
      {/* ========================================================= */}
      {view === 'landing' && (
        <main className="flex-1">
          <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#003366] text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-[#005A9C]" />
                <span>Gujarat Government–Inspired Design System • Public Service Framework</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#138808]" />
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-[#003366] tracking-tight leading-tight sm:leading-[1.15] break-words">
                Skip The Queue, <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#005A9C] via-[#FF9933] to-[#003366]">
                  Not Your Work
                </span>
              </h1>

              <p className="text-slate-600 text-xs sm:text-base leading-relaxed max-w-xl">
                Book virtual slot tokens for Mamlatdar offices, Jan Seva Kendras, Aadhaar, RTO, and Taluka Panchayat. Get real-time wait estimates and manage your visit from anywhere in Gujarat.
              </p>

              <div className="bg-white p-2 sm:p-2.5 rounded-2xl shadow-xl border border-slate-200 flex flex-col sm:flex-row gap-2 max-w-xl">
                <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 flex-1 min-w-0">
                  <Search className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    onFocus={() => setView('services')}
                    placeholder="Search: ટ્રેક્ટર, MYSY, આવક દાખલો..."
                    className="w-full text-xs sm:text-sm bg-transparent outline-none text-[#1F2937] placeholder-slate-400 font-medium"
                  />
                </div>
                <button
                  onClick={() => setView('services')}
                  className="bg-[#005A9C] hover:bg-[#003366] text-white font-bold px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition whitespace-nowrap cursor-pointer"
                >
                  <span>Explore 39 Yojanas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FF9933] shrink-0" />
                  <span>33 Districts & 250+ Talukas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#138808] shrink-0" />
                  <span>Secure 2FA & GRTSA</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#005A9C] shrink-0" />
                  <span>Live Updates 24/7</span>
                </div>
              </div>
            </div>

            {/* Right: Floating Hero Card */}
            <div className="lg:col-span-5 flex justify-center w-full">
              <div className="relative w-full max-w-[290px] sm:max-w-[340px]">
                <div className="absolute -inset-3 bg-gradient-to-tr from-[#005A9C]/20 via-[#FF9933]/20 to-[#138808]/20 rounded-3xl blur-xl" />
                <div className="relative bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Your Virtual Token</span>
                    <span className="bg-emerald-50 text-[#138808] border border-emerald-200 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#138808] animate-ping" />
                      ACTIVE
                    </span>
                  </div>

                  <div className="text-center py-2">
                    <h2 className="text-5xl font-black text-[#003366] tracking-tight">B-1247</h2>
                    <p className="text-xs font-bold text-slate-600 mt-1">Gondal Jan Seva Kendra – Rajkot</p>
                  </div>

                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-amber-800 font-semibold">Estimated wait:</p>
                      <p className="text-base font-black text-amber-950">12 mins</p>
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
                      <span>Scan at Office Entry</span>
                    </p>
                  </div>

                  <button
                    onClick={() => loginAsDemo('farmer')}
                    className="w-full mt-4 bg-[#003366] hover:bg-[#002244] text-white font-bold py-2.5 rounded-xl text-xs transition active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span>કચેરી રડાર જુઓ (Live Queue Visualization)</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Preview of Schemes on Landing */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <SchemesCatalog onSelectScheme={handleSelectScheme} />
          </section>

          {/* STATS COUNTER */}
          <section className="bg-white border-t border-slate-200 py-8 sm:py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-8 sm:mb-14">
                <div className="bg-[#F5F7FA] border border-slate-200 rounded-xl sm:rounded-2xl p-3.5 sm:p-5">
                  <p className="text-[11px] sm:text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#005A9C] shrink-0" />
                    <span>Live Tokens</span>
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#003366] mt-1">12,483</h3>
                  <p className="text-[10px] sm:text-[11px] text-[#138808] font-bold mt-0.5">↑ 8.2% today</p>
                </div>

                <div className="bg-[#F5F7FA] border border-slate-200 rounded-xl sm:rounded-2xl p-3.5 sm:p-5">
                  <p className="text-[11px] sm:text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#FF9933] shrink-0" />
                    <span>Avg Wait Time</span>
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#003366] mt-1">14 min</h3>
                  <p className="text-[10px] sm:text-[11px] text-[#138808] font-bold mt-0.5">↓ 22% vs walk-in</p>
                </div>

                <div className="bg-[#F5F7FA] border border-slate-200 rounded-xl sm:rounded-2xl p-3.5 sm:p-5">
                  <p className="text-[11px] sm:text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#138808] shrink-0" />
                    <span>Active Kacheris</span>
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#003366] mt-1">250+</h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold mt-0.5">All 33 Districts</p>
                </div>

                <div className="bg-[#F5F7FA] border border-slate-200 rounded-xl sm:rounded-2xl p-3.5 sm:p-5">
                  <p className="text-[11px] sm:text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#FF9933] shrink-0" />
                    <span>GRTSA SLA</span>
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#003366] mt-1">99.8%</h3>
                  <p className="text-[10px] sm:text-[11px] text-[#138808] font-bold mt-0.5">Time-bound</p>
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
        <section className="flex-1 bg-[#F5F7FA] flex flex-col md:flex-row">
          <aside className="hidden md:flex md:w-64 bg-[#003366] text-white flex-col justify-between shrink-0">
            <div>
              <div className="p-5 border-b border-blue-900/60 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FF9933] text-slate-900 flex items-center justify-center font-black text-sm">
                  Q
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-sm">QueueLess Kacheri</h3>
                  <p className="text-[10px] text-blue-200">GovTech | Citizen Service Portal</p>
                </div>
              </div>

              <nav className="p-3 space-y-1 text-xs font-bold">
                <button className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl bg-[#005A9C] text-white">
                  <span>Dashboard (ડેશબોર્ડ)</span>
                </button>
                <button
                  onClick={() => {
                    triggerHaptic('tap');
                    setView('services');
                  }}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-blue-200 hover:text-white hover:bg-blue-900/50"
                >
                  <Layers className="w-4 h-4 text-[#FF9933]" />
                  <span>Services (39 Yojanas)</span>
                </button>
                <button onClick={() => triggerHaptic('tap')} className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-blue-200 hover:text-white hover:bg-blue-900/50">
                  <span>History</span>
                </button>
                <button onClick={() => triggerHaptic('tap')} className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-blue-200 hover:text-white hover:bg-blue-900/50">
                  <span>Profile</span>
                </button>
              </nav>
            </div>

            <div className="p-4 border-t border-blue-900/60 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-amber-400/20 text-[#FF9933] flex items-center justify-center text-xs">
                🇮🇳
              </span>
              <div className="text-[10px] leading-tight">
                <p className="font-bold text-white">Citizen Portal</p>
                <p className="text-blue-200">Gov-Inspired Design System</p>
              </div>
            </div>
          </aside>

          {/* Right Main Dashboard */}
          <div className="flex-1 flex flex-col min-w-0">
            <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase hidden sm:inline">Live District:</span>
                <div className="flex items-center gap-2 bg-[#F5F7FA] border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-[#003366]">
                  <span>🇮🇳</span>
                  <span>Rajkot District</span>
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
                    <span className="text-xs font-extrabold text-[#003366] tracking-tight">My Live Token</span>
                    <span className="bg-emerald-50 text-[#138808] border border-emerald-200 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#138808] animate-ping" />
                      ACTIVE
                    </span>
                  </div>

                  <div className="mt-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Virtual Token</p>
                    <h2 className="text-4xl sm:text-5xl font-black text-[#FF9933] tracking-tight mt-0.5">
                      {activeBooking ? activeBooking.tokenNumber : (currentUser?.token || '#A-42')}
                    </h2>
                    <div className="mt-2">
                      <p className="text-xs font-black text-[#003366]">
                        {activeBooking ? `કાઉન્ટર ${activeBooking.counterNumber} • ${activeBooking.counterNameGu}` : 'Certificate Services'}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {activeBooking ? `અધિકારી: ${activeBooking.officerName}` : 'Caste & Income Certificate Verification'}
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
                      {activeBooking ? `${activeBooking.taluka.officeNameGu}` : 'Qless-A42-GP (Encrypted Token ID)'}
                    </p>
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-sm font-extrabold text-[#003366]">
                      Arrive by <span className="text-red-600 font-black">
                        {activeBooking 
                          ? (lateShiftMinutes > 0 ? `${activeBooking.slot.startTime} (+${lateShiftMinutes}m)` : activeBooking.slot.startTime) 
                          : (lateShiftMinutes > 0 ? `11:56 AM (+${lateShiftMinutes}m)` : '11:20 AM')}
                      </span>
                    </p>
                    <p className="text-xs font-bold text-[#FF9933]">
                      ⏱️ {activeBooking ? activeBooking.slot.timeRange : '11:30 AM - 12:30 PM'} {lateShiftMinutes > 0 ? `(ખસેડેલ +${lateShiftMinutes}m)` : '(Traffic Buffer included)'}
                    </p>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button
                      onClick={handleRunningLate}
                      className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold py-2.5 px-2 rounded-xl text-[11px] sm:text-xs flex items-center justify-center gap-1 active:scale-95 transition min-h-[44px]"
                      title="Request a 3-slot / 36-minute delay shift"
                    >
                      <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">મોડું થાય છે (+૩ સ્લોટ)</span>
                    </button>
                    <button
                      onClick={() => {
                        triggerHaptic('tap');
                        const tokenStr = activeBooking ? activeBooking.tokenNumber : '#A-42';
                        speakGuidance(`નમસ્તે ${currentUser?.name || 'મોહનભાઈ'}, તમારો ટોકન નંબર ${tokenStr} સક્રિય છે. કૃપા કરીને સમયસર કાઉન્ટર પર પહોંચો.`);
                      }}
                      className="bg-blue-50 hover:bg-blue-100 text-[#003366] border border-blue-200 font-bold py-2.5 px-2 rounded-xl text-[11px] sm:text-xs flex items-center justify-center gap-1 active:scale-95 transition min-h-[44px]"
                      title="Gujarati Text-to-Speech (TTS) Announcement via Web Speech API"
                    >
                      <Volume2 className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">સાંભળો (Gujarati TTS)</span>
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
                        <span>સત્તાવાર ડિજિટલ ટોકન પાસ જુઓ (View Pass)</span>
                      </button>
                    </div>
                  )}

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500">Your Queue Position (કતાર સ્થાન)</span>
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
                        સુલભતા પ્રણાલી (Multi-Modal Accessibility)
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                      Elderly & Rural
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                    Designed for elderly citizens, low literacy, and noisy environments with 4 synchronized notification channels:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="bg-emerald-50/70 border border-emerald-200 p-2 rounded-xl flex items-center gap-1.5">
                      <span className="text-sm">🟢</span>
                      <div>
                        <p className="text-[9px] font-bold text-emerald-800 uppercase">Visual</p>
                        <p className="text-[10px] font-black text-slate-800 leading-tight">NOW SERVING</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 p-2 rounded-xl flex items-center gap-1.5">
                      <span className="text-sm">🔔</span>
                      <div>
                        <p className="text-[9px] font-bold text-[#005A9C] uppercase">Chime</p>
                        <p className="text-[10px] font-black text-slate-800 leading-tight">Web Audio</p>
                      </div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 p-2 rounded-xl flex items-center gap-1.5">
                      <span className="text-sm">🗣️</span>
                      <div>
                        <p className="text-[9px] font-bold text-purple-800 uppercase">Voice (TTS)</p>
                        <p className="text-[10px] font-black text-slate-800 leading-tight">ગુજરાતી અવાજ</p>
                      </div>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 p-2 rounded-xl flex items-center gap-1.5">
                      <span className="text-sm">📳</span>
                      <div>
                        <p className="text-[9px] font-bold text-amber-800 uppercase">Haptic</p>
                        <p className="text-[10px] font-black text-slate-800 leading-tight">Mobile Vibrate</p>
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
                          Live Queue Visualization / Kacheri Radar
                        </h3>
                        <span className="text-xs bg-amber-50 text-[#FF9933] font-bold px-2 py-0.5 rounded border border-amber-200">
                          કચેરી રડાર
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#FF9933] shrink-0" />
                        <span>
                          Current Office: {activeBooking ? `${activeBooking.taluka.officeNameGu}, ${activeBooking.district.nameGu}` : 'જન સેવા કેન્દ્ર • મામલતદાર કચેરી ગોંડલ, રાજકોટ'}
                        </span>
                      </p>
                    </div>
                    <span className="text-[10px] font-bold bg-[#F5F7FA] text-[#003366] border border-slate-200 px-2.5 py-1 rounded-lg">
                      Queue Display • Phase 1
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-center">
                    <div className="bg-[#F5F7FA] border border-slate-200 rounded-2xl p-4">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Live Waiting Time (અંદાજિત સમય)</p>
                      <h4 className="text-3xl sm:text-4xl font-black text-[#138808] mt-1">18 mins</h4>
                      <p className="text-xs text-slate-600 font-semibold mt-1">Est. Service Time: 12:15 PM</p>
                      <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-[#005A9C] bg-blue-50 p-2 rounded-lg border border-blue-100">
                        <span>Route Buffer: 4.2 km (9 mins drive)</span>
                      </div>
                    </div>

                    <div className="bg-[#F5F7FA] border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xs font-bold text-slate-500">Crowd Gauge (ભીડ સ્તર)</span>
                        <span className="text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <span>🟡</span>
                          <span>BUSY (મધ્યમ)</span>
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
                          <span className="text-[10px] font-bold text-slate-400 mt-0.5">Capacity (ક્ષમતા)</span>
                        </div>
                      </div>

                      <div className="mt-2 text-[11px] font-bold text-slate-600">
                        <span>6 Counters Active</span> • <span className="text-[#003366] font-bold">Total Waiting: 35</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 📺 WAITING HALL DISPLAY & 6 DETAILED COUNTER CARDS */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-base font-black text-[#003366] flex items-center gap-2">
                        <span>🏛️ Live Waiting Hall Display</span>
                        <span className="text-xs bg-blue-50 text-[#005A9C] px-2 py-0.5 rounded-md font-bold">કચેરી પ્રતીક્ષા કક્ષ</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Gondal Jan Seva Kendra • 6 Counter Queue Overview (કાઉન્ટર ૧ થી ૬ વિગતવાર સ્થિતિ)
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
                            COUNTER 1 • કાઉન્ટર ૧
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-[#138808] border border-emerald-300">
                            <span>🟢</span>
                            <span>OPEN (ખુલ્લું છે)</span>
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs font-black text-slate-800 leading-tight">Social Welfare & Pension</p>
                          <p className="text-[11px] font-bold text-[#005A9C] leading-tight mt-0.5">સમાજ કલ્યાણ & પેન્શન શાખા</p>
                          <p className="text-[10px] font-medium text-slate-500 mt-1">
                            અધિકારી: <strong className="text-slate-800">શ્રી કે. એમ. ત્રિવેદી</strong>
                          </p>
                        </div>
                      </div>

                      <div className="my-3 grid grid-cols-2 gap-2">
                        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2 text-center">
                          <p className="text-[9px] font-black uppercase text-emerald-800 tracking-wider">NOW SERVING</p>
                          <p className="text-[8px] font-bold text-emerald-700">હાલનો વારો</p>
                          <p className="text-2xl font-black text-[#003366] font-mono mt-0.5">A-40</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center">
                          <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">NEXT</p>
                          <p className="text-[8px] font-bold text-slate-500">આગામી વારો</p>
                          <p className="text-2xl font-black text-[#FF9933] font-mono mt-0.5">A-41</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-600 flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>8 people waiting</span>
                        </span>
                        <span className="text-[#005A9C] flex items-center gap-1 font-extrabold">
                          <Clock className="w-3 h-3 text-[#FF9933]" />
                          <span>Estimated wait: 24 min</span>
                        </span>
                      </div>
                    </div>

                    {/* COUNTER 2 */}
                    <div className="rounded-2xl border-2 border-amber-300 bg-white p-3.5 flex flex-col justify-between shadow-xs">
                      <div>
                        <div className="flex items-center justify-between gap-1 pb-2 border-b border-slate-100">
                          <span className="text-xs font-black tracking-wide text-[#003366] uppercase">
                            COUNTER 2 • કાઉન્ટર ૨
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-900 border border-amber-300">
                            <span>🟡</span>
                            <span>BUSY (કાર્યરત)</span>
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs font-black text-slate-800 leading-tight">Certificates (Income/Caste)</p>
                          <p className="text-[11px] font-bold text-[#005A9C] leading-tight mt-0.5">જન સેવા પ્રમાણપત્રો (આવક/જાતિ)</p>
                          <p className="text-[10px] font-medium text-slate-500 mt-1">
                            અધિકારી: <strong className="text-slate-800">શ્રી પી. આર. જાડેજા</strong>
                          </p>
                        </div>
                      </div>

                      <div className="my-3 grid grid-cols-2 gap-2">
                        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2 text-center">
                          <p className="text-[9px] font-black uppercase text-emerald-800 tracking-wider">NOW SERVING</p>
                          <p className="text-[8px] font-bold text-emerald-700">હાલનો વારો</p>
                          <p className="text-2xl font-black text-[#003366] font-mono mt-0.5">A-41</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center">
                          <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">NEXT</p>
                          <p className="text-[8px] font-bold text-slate-500">આગામી વારો</p>
                          <p className="text-2xl font-black text-[#FF9933] font-mono mt-0.5">A-42</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-600 flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>5 people waiting</span>
                        </span>
                        <span className="text-[#005A9C] flex items-center gap-1 font-extrabold">
                          <Clock className="w-3 h-3 text-[#FF9933]" />
                          <span>Estimated wait: 15 min</span>
                        </span>
                      </div>
                    </div>

                    {/* COUNTER 3: LUNCH BREAK */}
                    <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/40 p-3.5 flex flex-col justify-between shadow-xs">
                      <div>
                        <div className="flex items-center justify-between gap-1 pb-2 border-b border-amber-200/60">
                          <span className="text-xs font-black tracking-wide text-[#003366] uppercase">
                            COUNTER 3 • કાઉન્ટર ૩
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                            <span>🟡</span>
                            <span>LUNCH BREAK</span>
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs font-black text-slate-800 leading-tight">Ration Card & Food Supply</p>
                          <p className="text-[11px] font-bold text-[#005A9C] leading-tight mt-0.5">રેશનકાર્ડ & અન્ન પુરવઠા સેવા</p>
                          <p className="text-[10px] font-medium text-slate-500 mt-1">
                            અધિકારી: <strong className="text-slate-800">શ્રી એસ. ટી. પટેલ</strong>
                          </p>
                        </div>
                      </div>

                      <div className="my-3 py-3 px-2.5 bg-amber-100/70 border border-amber-300 rounded-xl text-center">
                        <div className="inline-flex items-center gap-1 text-xs font-black text-amber-900 mb-0.5">
                          <span>🟡 LUNCH BREAK (ભોજન વિરામ)</span>
                        </div>
                        <p className="text-xs font-black text-slate-800">
                          Resumes at 2:00 PM
                        </p>
                        <p className="text-[10px] font-bold text-amber-800">
                          (બપોરે ૨:૦૦ વાગ્યે શરૂ થશે)
                        </p>
                        <div className="mt-2 pt-1 border-t border-amber-200/70 flex items-center justify-around text-[10px] font-bold text-slate-600">
                          <span>આગામી: <strong className="font-mono text-slate-800">A-39</strong></span>
                          <span>•</span>
                          <span>3 people waiting</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-600 flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>3 people waiting</span>
                        </span>
                        <span className="text-amber-800 flex items-center gap-1 font-extrabold">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Resumes in 25 min</span>
                        </span>
                      </div>
                    </div>

                    {/* COUNTER 4 */}
                    <div className="rounded-2xl border-2 border-emerald-300 bg-white p-3.5 flex flex-col justify-between shadow-xs">
                      <div>
                        <div className="flex items-center justify-between gap-1 pb-2 border-b border-slate-100">
                          <span className="text-xs font-black tracking-wide text-[#003366] uppercase">
                            COUNTER 4 • કાઉન્ટર ૪
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-[#138808] border border-emerald-300">
                            <span>🟢</span>
                            <span>OPEN (ખુલ્લું છે)</span>
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs font-black text-slate-800 leading-tight">E-Dhara (7/12 & Land Records)</p>
                          <p className="text-[11px] font-bold text-[#005A9C] leading-tight mt-0.5">ઈ-ધરા કેન્દ્ર (૭/૧૨ જમીન રેકોર્ડ)</p>
                          <p className="text-[10px] font-medium text-slate-500 mt-1">
                            અધિકારી: <strong className="text-slate-800">શ્રી વી. કે. મહેતા</strong>
                          </p>
                        </div>
                      </div>

                      <div className="my-3 grid grid-cols-2 gap-2">
                        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2 text-center">
                          <p className="text-[9px] font-black uppercase text-emerald-800 tracking-wider">NOW SERVING</p>
                          <p className="text-[8px] font-bold text-emerald-700">હાલનો વારો</p>
                          <p className="text-2xl font-black text-[#003366] font-mono mt-0.5">B-12</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center">
                          <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">NEXT</p>
                          <p className="text-[8px] font-bold text-slate-500">આગામી વારો</p>
                          <p className="text-2xl font-black text-[#FF9933] font-mono mt-0.5">B-13</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-600 flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>6 people waiting</span>
                        </span>
                        <span className="text-[#005A9C] flex items-center gap-1 font-extrabold">
                          <Clock className="w-3 h-3 text-[#FF9933]" />
                          <span>Estimated wait: 18 min</span>
                        </span>
                      </div>
                    </div>

                    {/* COUNTER 5 */}
                    <div className="rounded-2xl border-2 border-amber-300 bg-white p-3.5 flex flex-col justify-between shadow-xs">
                      <div>
                        <div className="flex items-center justify-between gap-1 pb-2 border-b border-slate-100">
                          <span className="text-xs font-black tracking-wide text-[#003366] uppercase">
                            COUNTER 5 • કાઉન્ટર ૫
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-900 border border-amber-300">
                            <span>🟡</span>
                            <span>BUSY (કાર્યરત)</span>
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs font-black text-slate-800 leading-tight">Aadhaar Biometric Center</p>
                          <p className="text-[11px] font-bold text-[#005A9C] leading-tight mt-0.5">આધાર કેન્દ્ર (બાયોમેટ્રિક અપડેટ)</p>
                          <p className="text-[10px] font-medium text-slate-500 mt-1">
                            અધિકારી: <strong className="text-slate-800">શ્રી એ. જે. સોલંકી</strong>
                          </p>
                        </div>
                      </div>

                      <div className="my-3 grid grid-cols-2 gap-2">
                        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2 text-center">
                          <p className="text-[9px] font-black uppercase text-emerald-800 tracking-wider">NOW SERVING</p>
                          <p className="text-[8px] font-bold text-emerald-700">હાલનો વારો</p>
                          <p className="text-2xl font-black text-[#003366] font-mono mt-0.5">B-14</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center">
                          <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">NEXT</p>
                          <p className="text-[8px] font-bold text-slate-500">આગામી વારો</p>
                          <p className="text-2xl font-black text-[#FF9933] font-mono mt-0.5">B-15</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-600 flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>11 people waiting</span>
                        </span>
                        <span className="text-[#005A9C] flex items-center gap-1 font-extrabold">
                          <Clock className="w-3 h-3 text-[#FF9933]" />
                          <span>Estimated wait: 32 min</span>
                        </span>
                      </div>
                    </div>

                    {/* COUNTER 6 */}
                    <div className="rounded-2xl border-2 border-emerald-300 bg-white p-3.5 flex flex-col justify-between shadow-xs">
                      <div>
                        <div className="flex items-center justify-between gap-1 pb-2 border-b border-slate-100">
                          <span className="text-xs font-black tracking-wide text-[#003366] uppercase">
                            COUNTER 6 • કાઉન્ટર ૬
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-[#138808] border border-emerald-300">
                            <span>🟢</span>
                            <span>OPEN (ખુલ્લું છે)</span>
                          </span>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs font-black text-slate-800 leading-tight">Housing Schemes & General Desk</p>
                          <p className="text-[11px] font-bold text-[#005A9C] leading-tight mt-0.5">આવાસ યોજના & સામાન્ય પૂછપરછ</p>
                          <p className="text-[10px] font-medium text-slate-500 mt-1">
                            અધિકારી: <strong className="text-slate-800">શ્રી એન. બી. ચાવડા</strong>
                          </p>
                        </div>
                      </div>

                      <div className="my-3 grid grid-cols-2 gap-2">
                        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-2 text-center">
                          <p className="text-[9px] font-black uppercase text-emerald-800 tracking-wider">NOW SERVING</p>
                          <p className="text-[8px] font-bold text-emerald-700">હાલનો વારો</p>
                          <p className="text-2xl font-black text-[#003366] font-mono mt-0.5">A-42</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center">
                          <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">NEXT</p>
                          <p className="text-[8px] font-bold text-slate-500">આગામી વારો</p>
                          <p className="text-2xl font-black text-[#FF9933] font-mono mt-0.5">A-43</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-600 flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>2 people waiting</span>
                        </span>
                        <span className="text-[#005A9C] flex items-center gap-1 font-extrabold">
                          <Clock className="w-3 h-3 text-[#FF9933]" />
                          <span>Estimated wait: 6 min</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[11px] text-slate-400 font-medium">
                      Phase 1 Queue Visualization • Phase 6 provides Real-Time Synchronization across devices.
                    </p>
                    <button onClick={() => setView('landing')} className="text-xs font-bold text-[#005A9C] hover:text-[#003366] flex items-center gap-1">
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>← Back to Home</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>
      )}

      {/* 2FA AUTH MODAL */}
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
              <h3 className="text-xl font-black text-[#003366]">2FA Civic Login</h3>
              <p className="text-xs text-slate-500 mt-1">Mobile OTP + Citizen Aadhaar Verification</p>
            </div>

            {loginPromptReason && (
              <div className="mb-4 p-3 bg-amber-50 border-2 border-[#FF9933] rounded-2xl text-amber-950 text-xs font-bold flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-[#FF9933] shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="font-extrabold text-[#003366]">ટોકન સુરક્ષા: લૉગિન ફરજિયાત છે</p>
                  <p className="text-[11px] font-medium text-amber-900 mt-0.5">{loginPromptReason}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Mobile Number (મોબાઇલ નંબર)</span>
                  <button
                    onClick={() => speakGuidance("કૃપા કરીને તમારો દસ આંકડાનો મોબાઈલ નંબર દાખલ કરો.")}
                    className="text-[#005A9C] text-[11px] hover:underline flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> સાંભળો
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
                  <span>Aadhaar Card Last 4 Digits (આધાર છેલ્લા ૪ આંકડા)</span>
                  <span className="text-[10px] text-slate-400">UIDAI Safe</span>
                </label>
                <input
                  type="password"
                  value={aadhaar4}
                  onChange={(e) => setAadhaar4(e.target.value)}
                  maxLength={4}
                  className="w-full text-xs font-medium rounded-xl border border-slate-300 p-2.5 outline-none focus:border-[#005A9C] tracking-widest text-center text-base"
                />
              </div>

              <div className="pt-1">
                <button
                  onClick={() => loginAsDemo('farmer')}
                  className="w-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl py-2 text-xs font-bold flex items-center justify-center gap-2 transition"
                >
                  <span>⚡ ઝડપી નાગરિક લૉગિન (Nagrik Login)</span>
                </button>
              </div>

              <button
                onClick={handleOtpSubmit}
                className="w-full bg-[#005A9C] hover:bg-[#003366] text-white font-bold py-3 rounded-xl text-xs shadow-md active:scale-95 transition flex items-center justify-center gap-2"
              >
                <span>Get Secure OTP & Verify</span>
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

      {/* NATIVE MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] px-3 flex items-center justify-around shadow-lg">
        <button
          onClick={() => {
            triggerHaptic('tap');
            setView('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition active:scale-95 ${
            view === 'landing' ? 'text-[#005A9C]' : 'text-slate-500'
          }`}
        >
          <HomeIcon className="w-4 h-4" />
          <span>હોમ</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('tap');
            setView('services');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition active:scale-95 ${
            view === 'services' ? 'text-[#005A9C]' : 'text-slate-500'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>૩૯ યોજના</span>
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
          className="flex flex-col items-center gap-0.5 text-[10px] font-bold transition active:scale-95 text-[#FF9933]"
        >
          <div className="w-8 h-8 -mt-3.5 rounded-full bg-[#003366] text-[#FF9933] flex items-center justify-center border-2 border-white shadow-md">
            <Ticket className="w-4 h-4" />
          </div>
          <span>ટોકન પાસ</span>
        </button>

        <button
          onClick={() => {
            triggerHaptic('tap');
            setView('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold transition active:scale-95 ${
            view === 'dashboard' ? 'text-[#005A9C]' : 'text-slate-500'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>કચેરી રડાર</span>
        </button>
      </nav>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-bold text-[#003366]">QueueLess / NagrikSeva AI © 2026 • Gujarat Government–Inspired Citizen Service Framework</p>
          <p className="text-[11px] text-slate-400">
            GRTSA Service Standard Compliant • Designed for 33 Districts, 250+ Talukas, and 18,000+ Villages
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/admin/counter"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-[#003366] rounded-lg font-bold text-xs transition"
            >
              <Building className="w-3.5 h-3.5 text-[#005A9C]" />
              <span>🏛️ કાઉન્ટર ઓપરેટર કન્સોલ</span>
            </Link>
            <Link
              href="/admin/collector"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg font-bold text-xs transition"
            >
              <span>👑 કલેક્ટર કમાન્ડ સેન્ટર</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
