'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, MapPin, Lock, Clock, Search, ArrowRight, 
  RotateCcw, Volume2, QrCode, Ticket, Brain, Crosshair, 
  Users, Building, Award, Bell, CheckCircle2, ChevronDown, Download,
  Layers, ArrowLeft, Calendar, Home as HomeIcon, Radio, Globe, Headphones,
  Compass, Sparkles, ExternalLink
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
import { CitizenHelpModal } from '@/components/CitizenHelpModal';
import { TokenTrackerModal } from '@/components/TokenTrackerModal';
import { GovJanSevaGateway } from '@/components/GovJanSevaGateway';
import { AuthenticQrCode } from '@/components/AuthenticQrCode';
import { SchemeItem, ALL_YOJANAS } from '@/lib/schemes-data';
import { Language, GUJARAT_LANGUAGES, t } from '@/lib/translations';
import { CounterGridSkeleton } from '@/components/ui/Skeleton';
import { CitizenProfileModal } from '@/components/CitizenProfileModal';
import { CitizenLocationRadar } from '@/components/CitizenLocationRadar';
import { AppVersionUpdateModal, CURRENT_APP_VERSION } from '@/components/AppVersionUpdateModal';

export default function Home() {
  const [view, setView] = useState<'landing' | 'dashboard' | 'services'>('landing');
  const [isRadarLoading, setIsRadarLoading] = useState<boolean>(false);
  const [lang, setLang] = useState<Language>('gu');
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [loginMenuOpen, setLoginMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'citizen' | 'kacheri'>('citizen');
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [tokenTrackerModalOpen, setTokenTrackerModalOpen] = useState(false);
  const [citizenProfileModalOpen, setCitizenProfileModalOpen] = useState(false);
  const [locationRadarModalOpen, setLocationRadarModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [radarViewTab, setRadarViewTab] = useState<'nearby' | 'hall'>('nearby');
  const [targetBookingTalukaId, setTargetBookingTalukaId] = useState<string | undefined>(undefined);
  const [targetBookingDistrictId, setTargetBookingDistrictId] = useState<string | undefined>(undefined);
  const [pendingSlotBooking, setPendingSlotBooking] = useState<BookingDetails | null>(null);
  const [phone, setPhone] = useState('9876543210');
  const [aadhaar4, setAadhaar4] = useState('8842');

  // Load language preference from LocalStorage
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('qless_preferred_lang') as Language | null;
      if (savedLang && GUJARAT_LANGUAGES.some(l => l.code === savedLang)) {
        setLang(savedLang);
      }
    } catch {}
  }, []);

  // Auto-prompt latest update changelog if citizen hasn't seen current version
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const lastSeen = localStorage.getItem('qless_last_seen_changelog');
      if (!lastSeen || lastSeen !== CURRENT_APP_VERSION) {
        const timer = setTimeout(() => {
          setUpdateModalOpen(true);
        }, 900);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Localized Citizen Identity Helpers (Dynamic for gu, hi, en)
  const getCitizenDisplayName = (l: Language) => {
    switch (l) {
      case 'gu': return 'હરિ પટેલ';
      case 'hi': return 'हरि पटेल';
      case 'en': default: return 'Hari Patel';
    }
  };

  const getCitizenRoleArea = (l: Language) => {
    switch (l) {
      case 'gu': return 'નાગરિક • રાજકોટ ગ્રામ્ય';
      case 'hi': return 'नागरिक • राजकोट ग्रामीण';
      case 'en': default: return 'Citizen • Rajkot Rural';
    }
  };

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
      if (!target.closest('[data-dropdown="login"]')) {
        setLoginMenuOpen(false);
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

  // SESSION & VIEW PERSISTENCE (Survives Page Refresh / F5)
  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem('qless_current_user');
      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        // Strictly prevent officer/Mamlatdar from staying logged in on Citizen Portal
        if (parsed.role === 'Desk Officer' || parsed.name?.toLowerCase().includes('mamlatdar') || parsed.name?.toLowerCase().includes('trivedi')) {
          localStorage.removeItem('qless_current_user');
          setCurrentUser(null);
        } else {
          setCurrentUser(parsed);
        }
      }
      const savedBookingStr = localStorage.getItem('qless_active_booking');
      if (savedBookingStr) {
        const parsed = JSON.parse(savedBookingStr);
        setActiveBooking(parsed);
      }
      const savedView = localStorage.getItem('qless_current_view') as any;
      if (savedView && ['landing', 'dashboard', 'services'].includes(savedView)) {
        setView(savedView);
      } else if (savedUserStr && !savedUserStr.toLowerCase().includes('mamlatdar') && !savedUserStr.toLowerCase().includes('trivedi')) {
        setView('dashboard');
      }
    } catch {}
  }, []);

  // Persist currentUser changes
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('qless_current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('qless_current_user');
      }
    } catch {}
  }, [currentUser]);

  // Persist activeBooking changes
  useEffect(() => {
    try {
      if (activeBooking) {
        localStorage.setItem('qless_active_booking', JSON.stringify(activeBooking));
      } else {
        localStorage.removeItem('qless_active_booking');
      }
    } catch {}
  }, [activeBooking]);

  // Persist view changes
  useEffect(() => {
    try {
      localStorage.setItem('qless_current_view', view);
    } catch {}
  }, [view]);

  // STRICT BACKGROUND BODY SCROLL LOCK WHEN ANY MODAL / DRAWER IS OPEN
  useEffect(() => {
    const isAnyModalOpen = drawerOpen || scannerOpen || slotModalOpen || tokenPassModalOpen || authModalOpen || helpModalOpen || tokenTrackerModalOpen || citizenProfileModalOpen || locationRadarModalOpen || updateModalOpen;
    
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
  }, [drawerOpen, scannerOpen, slotModalOpen, tokenPassModalOpen, authModalOpen, helpModalOpen, tokenTrackerModalOpen, citizenProfileModalOpen, locationRadarModalOpen, updateModalOpen]);

  // ESC KEY TO DISMISS ACTIVE MODAL
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (updateModalOpen) setUpdateModalOpen(false);
        else if (citizenProfileModalOpen) setCitizenProfileModalOpen(false);
        else if (locationRadarModalOpen) setLocationRadarModalOpen(false);
        else if (tokenPassModalOpen) setTokenPassModalOpen(false);
        else if (slotModalOpen) setSlotModalOpen(false);
        else if (scannerOpen) setScannerOpen(false);
        else if (drawerOpen) setDrawerOpen(false);
        else if (authModalOpen) setAuthModalOpen(false);
        else if (helpModalOpen) setHelpModalOpen(false);
        else if (tokenTrackerModalOpen) setTokenTrackerModalOpen(false);
        else if (loginMenuOpen) setLoginMenuOpen(false);
        else if (langMenuOpen) setLangMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tokenPassModalOpen, slotModalOpen, scannerOpen, drawerOpen, authModalOpen, helpModalOpen, tokenTrackerModalOpen, citizenProfileModalOpen, locationRadarModalOpen, updateModalOpen, loginMenuOpen, langMenuOpen]);

  // 1-Click Demo Fill Handlers
  const loginAsDemo = (role: 'farmer' = 'farmer') => {
    triggerHaptic('success');
    setAuthModalOpen(false);

    const userObj = {
          name: getCitizenDisplayName(lang),
          role: lang === 'gu' ? 'નાગરિક' : lang === 'hi' ? 'नागरिक' : lang === 'mr' ? 'नागरिक' : 'Citizen',
          area: lang === 'gu' ? 'રાજકોટ ગ્રામ્ય' : lang === 'hi' ? 'राजकोट ग्रामीण' : lang === 'mr' ? 'राजकोट ग्रामीण' : 'Rajkot Rural',
          token: '#A-42',
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
        const schemeTitle = lang === 'en' ? (targetScheme.titleEn || targetScheme.titleGu) : targetScheme.titleGu;
        const msg = lang === 'en'
          ? `Login successful! Please select your office slot and service counter for ${schemeTitle}.`
          : lang === 'hi'
          ? `लॉगिन सफल! अब ${schemeTitle} के लिए अपना कार्यालय स्लॉट और काउंटर चुनें।`
          : `લૉગિન સફળ! હવે ${schemeTitle} માટે તમારો કચેરી સ્લોટ અને કાઉન્ટર પસંદ કરો.`;
        speakGuidance(msg, lang);
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
      name: getCitizenDisplayName(lang),
      role: lang === 'gu' ? 'નાગરિક' : lang === 'hi' ? 'नागरिक' : lang === 'mr' ? 'नागरिक' : 'Citizen',
      area: pendingSlotBooking ? `${pendingSlotBooking.taluka.nameGu}, ${pendingSlotBooking.district.nameGu}` : (lang === 'gu' ? 'રાજકોટ ગ્રામ્ય' : lang === 'hi' ? 'राजकोट ग्रामीण' : lang === 'mr' ? 'राजकोट ग्रामीण' : 'Rajkot Rural'),
      token: pendingSlotBooking ? pendingSlotBooking.tokenNumber : '',
    };
    setCurrentUser(userObj);

    // Flow 1: Citizen was confirming a slot -> Automatically issue official token pass!
    if (pendingSlotBooking) {
      const confirmedDetails = pendingSlotBooking;
      setPendingSlotBooking(null);
      setLoginPromptReason(null);
      setActiveBooking(confirmedDetails);
      setTimeout(() => {
        triggerHaptic('success');
        speakGuidance(
          lang === 'en'
            ? `Mobile verified successfully! Your official token ${confirmedDetails.tokenNumber} is issued.`
            : lang === 'hi'
            ? `ओटीपी सत्यापन सफल! आपका आधिकारिक टोकन ${confirmedDetails.tokenNumber} जारी किया गया है।`
            : `મોબાઈલ ચકાસણી સફળ! તમારો અધિકૃત ટોકન ${confirmedDetails.tokenNumber} જારી થઈ ગયો છે.`,
          lang
        );
        setTokenPassModalOpen(true);
        setView('dashboard');
      }, 200);
      return;
    }

    if (pendingTokenScheme) {
      const targetScheme = pendingTokenScheme;
      setVerifiedSchemes(prev => ({ ...prev, [targetScheme.id]: true }));
      setActiveScheme(targetScheme);
      setPendingTokenScheme(null);
      setLoginPromptReason(null);
      setTimeout(() => {
        triggerHaptic('success');
        const schemeTitle = lang === 'en' ? (targetScheme.titleEn || targetScheme.titleGu) : targetScheme.titleGu;
        const msg = lang === 'en'
          ? `Login successful! Please select your office slot and service counter for ${schemeTitle}.`
          : lang === 'hi'
          ? `लॉगिन सफल! अब ${schemeTitle} के लिए अपना कार्यालय स्लॉट और काउंटर चुनें।`
          : `લૉગિન સફળ! હવે ${schemeTitle} માટે તમારો કચેરી સ્લોટ અને કાઉન્ટર પસંદ કરો.`;
        speakGuidance(msg, lang);
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
    setPendingSlotBooking(null);
    setActiveBooking(null);
    setLateShiftMinutes(0);
    setLoginPromptReason(null);
    setLoginMenuOpen(false);
    try {
      localStorage.removeItem('qless_current_user');
      localStorage.removeItem('qless_active_booking');
      localStorage.setItem('qless_current_view', 'landing');
    } catch {}
    setView('landing');
  };

  const handleBookKacheriSlot = (_kacheriId: string, talukaId: string) => {
    triggerHaptic('tap');
    setTargetBookingDistrictId('rajkot');
    setTargetBookingTalukaId(talukaId);
    setSlotModalOpen(true);
  };

  const handleRunningLate = () => {
    triggerHaptic('warning');
    setLateShiftMinutes(prev => prev + 20);
    const msg = lang === 'en'
      ? "Delay recorded successfully! The counter officer has been notified of your updated arrival time."
      : lang === 'hi'
      ? "विलंब दर्ज सफल! काउंटर अधिकारी को आपके नए आगमन समय की सूचना दे दी गई है।"
      : "વિલંબ નોંધણી સફળ! કાઉન્ટર અધિકારીને તમારા નવા અંદાજિત સમયની જાણ કરવામાં આવી છે.";
    speakGuidance(msg, lang);
    alert(lang === 'en' ? "⚠️ Delay Reported!\n\nYour appointment slot has been shifted by 20 minutes." : lang === 'hi' ? "⚠️ विलंब दर्ज!\n\nआपका अपॉइंटमेंट समय २० मिनट आगे बढ़ा दिया गया है।" : "⚠️ વિલંબ નોંધણી મંજૂર!\n\nતમારી અપોઇન્ટમેન્ટનો સમય ૨૦ મિનિટ આગળ ખસેડવામાં આવ્યો છે. કાઉન્ટર અધિકારીને સિસ્ટમ દ્વારા જાણ થઈ ગઈ છે જેથી તમારો વારો સ્કીપ નહીં થાય.");
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
      const schemeTitle = lang === 'en' ? (scheme.titleEn || scheme.titleGu) : scheme.titleGu;
      const voiceMsg = lang === 'en'
        ? "Citizen identity verification is required to collect your token pass."
        : lang === 'hi'
        ? "टोकन प्राप्त करने के लिए पहले नागरिक पहचान सत्यापन आवश्यक है।"
        : "ટોકન મેળવવા માટે પહેલાં નાગરિક ઓળખ ચકાસણી કરવી જરૂરી છે.";
      speakGuidance(voiceMsg, lang);
      setPendingTokenScheme(scheme);
      setLoginPromptReason(lang === 'en' ? `🔒 Citizen identity check is required to collect token for "${schemeTitle}".` : lang === 'hi' ? `🔒 "${schemeTitle}" का टोकन प्राप्त करने के लिए नागरिक पहचान सत्यापन आवश्यक है।` : `🔒 "${schemeTitle}" નો કચેરી ટોકન કલેક્ટ કરવા માટે નાગરિક ઓળખ ચકાસણી જરૂરી છે.`);
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
      const voiceMsg = lang === 'en'
        ? "Document pre-check passed! Please verify your citizen identity for token allocation."
        : lang === 'hi'
        ? "दस्तावेज़ पूर्व-जांच सफल! टोकन आवंटन के लिए नागरिक पहचान सत्यापन करें।"
        : "દસ્તાવેજ પ્રી-ચેક સફળ! ટોકન ફાળવણી માટે નાગરિક ઓળખ ચકાસણી કરો.";
      speakGuidance(voiceMsg, lang);
      setPendingTokenScheme(activeScheme);
      const schemeTitle = lang === 'en' ? (activeScheme.titleEn || activeScheme.titleGu) : activeScheme.titleGu;
      setLoginPromptReason(lang === 'en' ? `🔒 Pre-check complete! Citizen verification needed for "${schemeTitle}".` : lang === 'hi' ? `🔒 पूर्व-जांच पूर्ण! "${schemeTitle}" के लिए नागरिक सत्यापन आवश्यक है।` : `🔒 પ્રી-ચેક પૂર્ણ! "${schemeTitle}" નો ટોકન ફાળવવા માટે નાગરિક ઓળખ ચકાસણી જરૂરી છે.`);
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
    // SECURITY GATEWAY: If citizen is NOT logged in, require Mobile OTP before issuing official token!
    if (!currentUser) {
      triggerHaptic('warning');
      setPendingSlotBooking(details);
      setSlotModalOpen(false);
      const msg = lang === 'en' 
        ? `🔒 Mobile OTP verification is required to confirm your official appointment slot at ${details.taluka.officeNameEn || details.taluka.officeNameGu}.`
        : lang === 'hi'
        ? `🔒 ${details.taluka.officeNameGu} में आधिकारिक अपॉइंटमेंट स्लॉट की पुष्टि के लिए मोबाइल ओटीपी सत्यापन आवश्यक है।`
        : lang === 'mr'
        ? `🔒 ${details.taluka.officeNameGu} येथे अधिकृत अपॉइंटमेंट स्लॉट निश्चित करण्यासाठी मोबाइल ओटीपी पडताळणी आवश्यक आहे.`
        : `🔒 ${details.taluka.officeNameGu} ખાતે તમારો અધિકૃત સ્લોટ કન્ફર્મ કરવા માટે મોબાઈલ OTP ચકાસણી અનિવાર્ય છે.`;
      setLoginPromptReason(msg);
      speakGuidance(
        lang === 'en'
          ? "Please verify your mobile number via OTP to issue your official token."
          : lang === 'hi'
          ? "आधिकारिक टोकन जारी करने के लिए कृपया मोबाइल ओटीपी सत्यापित करें।"
          : lang === 'mr'
          ? "अधिकृत टोकन मिळवण्यासाठी कृपया मोबाइल ओटीपी पडताळणी करा."
          : "સ્લોટ પસંદગી પૂર્ણ! અધિકૃત ટોકન જારી કરવા માટે કૃપા કરીને મોબાઈલ ઓટીપી ચકાસણી કરો.",
        lang
      );
      setAuthModalOpen(true);
      return;
    }

    setActiveBooking(details);
    setSlotModalOpen(false);
    setCurrentUser(prev => prev ? {
      ...prev,
      area: `${details.taluka.nameGu}, ${details.district.nameGu}`,
      token: details.tokenNumber
    } : {
      name: getCitizenDisplayName(lang),
      role: lang === 'gu' ? 'નાગરિક' : lang === 'hi' ? 'नागरिक' : lang === 'mr' ? 'नागरिक' : 'Citizen',
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
              <span className="sm:hidden">{lang === 'gu' ? 'નેટવર્ક • લાઈવ' : lang === 'hi' ? 'नेटवर्क • लाइव' : lang === 'mr' ? 'नेटवर्क • लाइव्ह' : 'Network • Live'}</span>
            </span>
            <span className="text-blue-300/40 hidden md:inline">|</span>
            <span className="text-blue-200 hidden md:inline font-mono text-[11px]">{t('topBarFramework', lang)}</span>

            {/* ✨ DYNAMIC UPDATE & CHANGELOG BUTTON */}
            <button
              onClick={() => {
                triggerHaptic('tap');
                setUpdateModalOpen(true);
              }}
              className="bg-amber-400 hover:bg-amber-300 text-slate-900 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer shrink-0 animate-pulse border border-amber-300"
              title="નવા અપડેટ્સ & ચેન્જલોગ જુઓ"
            >
              <Sparkles className="w-3 h-3 text-slate-900" />
              <span>{CURRENT_APP_VERSION} {lang === 'gu' ? 'નવું શું છે?' : "What's New?"}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* MULTI-LANGUAGE SELECTOR (GUJARAT REGIONAL LANGUAGES & MOBILE BOTTOM SHEET) */}
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
                  {GUJARAT_LANGUAGES.find(l => l.code === lang)?.multiLabel || 'ગુજરાતી (Gujarati)'}
                </span>
                <ChevronDown className={`w-3 h-3 text-blue-200 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {langMenuOpen && (
                <>
                  {/* MOBILE BOTTOM SHEET DRAWER (Slides up from the bottom on mobile screens) */}
                  <div 
                    onClick={() => setLangMenuOpen(false)}
                    className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center animate-in fade-in duration-200"
                  >
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      className="w-full max-h-[85vh] bg-white rounded-t-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300 text-slate-800"
                    >
                      {/* Drag handle */}
                      <div className="pt-3 pb-1 flex justify-center">
                        <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
                      </div>

                      {/* Bottom Sheet Header */}
                      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-[#003366] flex items-center justify-center">
                            <Globe className="w-4 h-4 text-[#FF9933]" />
                          </div>
                          <div>
                            <h3 className="font-extrabold text-[#003366] text-sm">
                              {t('langDropdownTitle', lang)}
                            </h3>
                            <p className="text-[10px] text-slate-500">
                              {t('langDropdownSub', lang)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setLangMenuOpen(false)}
                          className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Language list inside mobile bottom sheet */}
                      <div className="p-3 overflow-y-auto max-h-[62vh] space-y-1.5 overscroll-contain">
                        {GUJARAT_LANGUAGES.map((opt) => {
                          const isSelected = lang === opt.code;
                          return (
                            <button
                              key={opt.code}
                              onClick={() => handleSelectLang(opt.code)}
                              className={`w-full text-left p-3 rounded-xl transition flex items-center justify-between gap-3 cursor-pointer ${
                                isSelected 
                                  ? 'bg-blue-50 text-[#003366] font-bold border-2 border-[#003366] shadow-xs' 
                                  : 'hover:bg-slate-50 text-slate-700 font-medium border border-slate-100'
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-sm text-slate-900 leading-tight">
                                    {opt.multiLabel}
                                  </span>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                                    isSelected ? 'bg-[#003366] text-white' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {opt.badge}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                                  {opt.regionalDescription}
                                </p>
                              </div>
                              {isSelected && (
                                <CheckCircle2 className="w-5 h-5 text-[#138808] shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* DESKTOP DROPDOWN POPOVER */}
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="hidden md:block absolute right-0 mt-1.5 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 py-1 z-50 text-[#1F2937] text-left animate-in fade-in zoom-in-95"
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

                    <div className="p-1 space-y-0.5 max-h-96 overflow-y-auto">
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
                </>
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
            <button 
              onClick={() => {
                triggerHaptic('tap');
                setView('landing');
              }} 
              className={`transition cursor-pointer ${view === 'landing' ? 'text-[#005A9C] font-extrabold' : 'hover:text-[#005A9C]'}`}
            >
              {t('navHome', lang)}
            </button>
            <button 
              onClick={() => {
                triggerHaptic('tap');
                setView('services');
              }} 
              className={`transition cursor-pointer flex items-center gap-1 ${view === 'services' ? 'text-[#005A9C] font-black' : 'hover:text-[#005A9C]'}`}
            >
              <span>{t('navServices', lang)}</span>
              <span className="text-[9px] bg-[#FF9933] text-slate-900 px-1.5 rounded-full font-bold">39</span>
            </button>
            <button 
              onClick={() => {
                triggerHaptic('tap');
                setIsRadarLoading(true);
                setTimeout(() => setIsRadarLoading(false), 240);
                setView('dashboard');
              }} 
              className={`transition cursor-pointer ${view === 'dashboard' ? 'text-[#005A9C] font-extrabold' : 'hover:text-[#005A9C]'}`}
            >
              {t('navRadar', lang)}
            </button>
            <button 
              onClick={() => {
                triggerHaptic('tap');
                setTokenTrackerModalOpen(true);
              }} 
              className="hover:text-[#005A9C] flex items-center gap-1 transition cursor-pointer text-slate-700"
              title="તમારો ટોકન નંબર દાખલ કરી લાઈવ સ્થિતિ તપાસો"
            >
              <Ticket className="w-3.5 h-3.5 text-[#005A9C]" />
              <span>{t('navTrackToken', lang)}</span>
            </button>
            <button 
              onClick={() => {
                triggerHaptic('tap');
                setHelpModalOpen(true);
              }} 
              className="hover:text-[#005A9C] text-slate-700 flex items-center gap-1 transition cursor-pointer"
              title="ટોલ-ફ્રી હેલ્પલાઇન અને સહાય"
            >
              <Headphones className="w-3.5 h-3.5 text-[#FF9933]" />
              <span>{t('navHelp', lang)}</span>
            </button>
            <Link
              href="/admin/counter"
              className="hover:text-[#005A9C] text-slate-700 flex items-center gap-1 transition cursor-pointer"
              title={lang === 'gu' ? 'કચેરી કાઉન્ટર ઓપરેટર અને કલેક્ટર કન્સોલ' : 'Kacheri Counter & Collector Console'}
            >
              <Building className="w-3.5 h-3.5 text-[#005A9C]" />
              <span>{t('navOfficerDesk', lang)}</span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {!currentUser ? (
              <div 
                className="relative" 
                data-dropdown="login"
              >
                {/* Unified Login Button: Click toggles portal menu with Citizen and Kacheri login */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerHaptic('tap');
                    setLoginMenuOpen(prev => !prev);
                  }}
                  aria-expanded={loginMenuOpen}
                  aria-haspopup="true"
                  aria-label="Portal Login Dropdown"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-black bg-[#005A9C] hover:bg-[#003366] text-white shadow-xs flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
                  title={lang === 'gu' ? 'લૉગિન: નાગરિક અથવા કચેરી અધિકારી' : 'Login: Citizen or Kacheri Officer'}
                >
                  <Lock className="w-3.5 h-3.5 text-[#FF9933]" />
                  <span>{t('btnLogin', lang)}</span>
                  <ChevronDown className={`w-3 h-3 text-blue-200 transition-transform duration-200 ${loginMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {loginMenuOpen && (
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 top-full mt-1.5 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 text-[#1F2937] text-left animate-in fade-in zoom-in-95"
                  >
                    <div className="px-3 py-1.5 border-b border-slate-100 mb-1 flex items-center justify-between">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                        {lang === 'en' ? 'Select Portal Access' : lang === 'hi' ? 'पोर्टल एक्सेस चुनें' : lang === 'mr' ? 'पोर्टल ऍक्सेस निवडा' : 'પોર્ટલ પ્રવેશ પસંદ કરો'}
                      </p>
                      <span className="text-[9px] bg-blue-50 text-[#003366] font-extrabold px-1.5 py-0.5 rounded border border-blue-200">
                        {lang === 'gu' ? '૨ પોર્ટલ' : '2 Portals'}
                      </span>
                    </div>

                    {/* 1. નાગરિક લૉગિન (Citizen Login) */}
                    <button
                      onClick={() => {
                        triggerHaptic('tap');
                        setLoginMenuOpen(false);
                        setLoginPromptReason(null);
                        setAuthModalTab('citizen');
                        setAuthModalOpen(true);
                      }}
                      className="w-full p-2.5 rounded-xl hover:bg-blue-50 transition flex items-start gap-2.5 text-left group cursor-pointer border border-transparent hover:border-blue-200"
                    >
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#003366] group-hover:bg-[#003366] group-hover:text-white flex items-center justify-center shrink-0 transition">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-[#003366]">
                            {lang === 'en' ? 'Citizen Login' : lang === 'hi' ? 'नागरिक लॉगिन' : lang === 'mr' ? 'नागरिक लॉगिन' : 'નાગરિક લૉગિન (Citizen)'}
                          </p>
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded">
                            OTP
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                          {lang === 'en' 
                            ? 'Book slots, Aadhaar identity & digital token pass' 
                            : lang === 'hi' 
                            ? 'स्लॉट बुक करें व डिजिटल टोकन पास पाएं' 
                            : lang === 'mr' 
                            ? 'स्लॉट बुक करा आणि डिजिटल टोकन मिळवा' 
                            : 'સ્લોટ બુકિંગ, આધાર ઓળખ & ડિજિટલ ટોકન પાસ'}
                        </p>
                      </div>
                    </button>

                    {/* 2. કચેરી / અધિકારી લૉગિન (Kacheri / Officer Portal - /admin/counter) */}
                    <Link
                      href="/admin/counter"
                      onClick={() => {
                        triggerHaptic('tap');
                        setLoginMenuOpen(false);
                      }}
                      className="w-full p-2.5 rounded-xl hover:bg-amber-50 transition flex items-start gap-2.5 text-left group cursor-pointer border border-transparent hover:border-amber-200 mt-1"
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center shrink-0 transition">
                        <Building className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 group-hover:text-amber-950">
                            {lang === 'en' ? 'Kacheri / Officer Portal' : lang === 'hi' ? 'कचेरी / अधिकारी पोर्टल' : lang === 'mr' ? 'कचेरी / अधिकारी पोर्टल' : 'કચેરી લૉગિન (Officer Portal)'}
                          </p>
                          <span className="text-[9px] bg-amber-100 text-amber-900 font-extrabold px-1.5 py-0.2 rounded">
                            Gov
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                          {lang === 'en' 
                            ? 'Counter Operator & Collector Console' 
                            : lang === 'hi' 
                            ? 'काउंटर ऑपरेटर व कलेक्टर डैशबोर्ड' 
                            : lang === 'mr' 
                            ? 'काउंटर ऑपरेटर आणि जिल्हाधिकारी डॅशबोर्ड' 
                            : 'કાઉન્ટર ૧ થી ૬ ઓપરેટર & કલેક્ટર કન્સોલ'}
                        </p>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div 
                onClick={() => {
                  triggerHaptic('tap');
                  setCitizenProfileModalOpen(true);
                }}
                className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl cursor-pointer transition select-none group"
                title={lang === 'gu' ? 'આધાર પ્રોફાઇલ અને પરિવાર વિગતો ખોલો' : 'Open Aadhaar Profile & Family Vault'}
              >
                <div className="text-left text-xs leading-none">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[9px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      {lang === 'gu' ? 'પ્રમાણિત નાગરિક' : lang === 'hi' ? 'सत्यापित नागरिक' : lang === 'mr' ? 'सत्यापित नागरिक' : 'Verified Citizen'}
                    </span>
                    <p className="font-extrabold text-[#003366] text-xs sm:text-sm whitespace-nowrap group-hover:text-[#005A9C]">
                      {currentUser?.name || getCitizenDisplayName(lang)}
                    </p>
                  </div>
                  <p className="text-[9px] text-[#005A9C] font-bold hidden sm:block mt-0.5 whitespace-nowrap">
                    {currentUser?.role ? `${currentUser.role} • ${currentUser.area || 'ગુજરાત'}` : getCitizenRoleArea(lang)}
                  </p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    resetSession();
                  }} 
                  title={lang === 'gu' ? 'લૉગઆઉટ / સેશન રીસેટ' : 'Logout / Reset Session'}
                  className="ml-0.5 text-slate-400 hover:text-red-500 text-xs p-1 cursor-pointer"
                >
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

            {/* Right: Official Jan Seva Kendra Administrative Appointment & Jurisdiction Gateway */}
            <div className="lg:col-span-5 flex justify-center w-full">
              <GovJanSevaGateway
                currentUser={currentUser}
                activeBooking={activeBooking}
                onOpenTokenTracker={() => setTokenTrackerModalOpen(true)}
                onOpenSlotModal={() => setSlotModalOpen(true)}
                onOpenTokenPassModal={() => setTokenPassModalOpen(true)}
                lang={lang}
              />
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
      {/* ========================================================== */}
      {/* VIEW 2: CITIZEN RADAR & DASHBOARD (FULL-WIDTH RESPONSIVE) */}
      {/* ========================================================== */}
      {view === 'dashboard' && (
        <main className="flex-1 bg-[#F5F7FA] w-full">
          {/* TOP CITIZEN SUB-NAV & COMMAND BAR */}
          <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
              {/* Back to Home & View Switchers */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    triggerHaptic('tap');
                    setView('landing');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#003366] text-xs font-bold transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t('backToHome', lang)}</span>
                </button>
                <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                <button
                  onClick={() => {
                    triggerHaptic('tap');
                    setView('services');
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#005A9C] text-xs font-bold transition cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-[#FF9933]" />
                  <span>{t('navServices', lang)}</span>
                </button>
              </div>

              {/* Citizen Identity & Kacheri Live Status */}
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 bg-[#F5F7FA] border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-[#003366]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{activeBooking ? (lang === 'en' ? `${activeBooking.taluka.officeNameEn || activeBooking.taluka.officeNameGu}` : `${activeBooking.taluka.officeNameGu}`) : t('defaultOfficeName', lang)}</span>
                </div>
                
                {/* Citizen Profile Pill */}
                {currentUser && (
                  <button
                    onClick={() => {
                      triggerHaptic('tap');
                      setCitizenProfileModalOpen(true);
                    }}
                    className="flex items-center gap-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 px-3 py-1.5 rounded-xl transition text-left cursor-pointer group"
                    title={lang === 'gu' ? 'આધાર પ્રોફાઇલ અને પરિવાર વિગતો ખોલો' : 'Open Aadhaar Profile & Family Vault'}
                  >
                    <div className="text-left text-xs leading-tight">
                      <p className="font-extrabold text-[#003366] group-hover:text-[#005A9C] whitespace-nowrap flex items-center gap-1.5">
                        <span>{currentUser.name || getCitizenDisplayName(lang)}</span>
                        <span className="text-[9px] bg-blue-100 text-[#005A9C] font-mono px-1 py-0.2 rounded font-bold">UID</span>
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap">{currentUser.role || 'નાગરિક'} • {currentUser.area || 'ગુજરાત'}</p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* MAIN DASHBOARD CONTENT GRID */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
            
            {/* Top Quick Banner: 3-State Contextual Display (Active Pass / Logged In Citizen / Public Guest) */}
            {activeBooking ? (
              <div className="mb-6 bg-gradient-to-r from-[#003366] to-[#004d80] rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20 shrink-0">
                    <Ticket className="w-6 h-6 text-[#FF9933]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-400/20 text-[#FF9933] border border-amber-400/30 px-2 py-0.5 rounded">
                        {lang === 'gu' ? 'સત્તાવાર ડિજિટલ એપોઇન્ટમેન્ટ' : lang === 'hi' ? 'आधिकारिक डिजिटल अपॉइंटमेंट' : lang === 'mr' ? 'अधिकृत डिजिटल अपॉइंटमेंट' : 'Official Digital Appointment'}
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded font-mono font-bold">
                        {t('tokenActiveBadge', lang)}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                      {currentUser?.name || getCitizenDisplayName(lang)} • {activeBooking.tokenNumber}
                    </h2>
                    <p className="text-xs text-blue-100 mt-0.5">
                      {t('counterLabel', lang)} {activeBooking.counterNumber} • {lang === 'en' ? (activeBooking.counterNameEn || activeBooking.counterNameGu) : activeBooking.counterNameGu}
                    </p>
                  </div>
                </div>

                {/* Status and Action in Banner */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="bg-white/10 border border-white/15 px-3 py-2 rounded-xl text-xs font-bold backdrop-blur-xs">
                    <span className="text-blue-200 block text-[10px]">{t('arriveByLabel', lang)}</span>
                    <span className="text-amber-300 font-black font-mono text-sm">
                      {lateShiftMinutes > 0 ? `${activeBooking.slot.startTime} (+${lateShiftMinutes}m)` : activeBooking.slot.startTime}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      triggerHaptic('tap');
                      setTokenPassModalOpen(true);
                    }}
                    className="bg-[#FF9933] hover:bg-[#ff8800] text-slate-900 font-extrabold px-3.5 py-2 rounded-xl text-xs shadow-sm transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Ticket className="w-4 h-4 text-slate-900" />
                    <span>{t('btnViewDigitalPass', lang)}</span>
                  </button>
                </div>
              </div>
            ) : currentUser ? (
              /* State 2: Logged-in citizen without active booking */
              <div className="mb-6 bg-gradient-to-r from-[#003366] to-[#004d80] rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20 shrink-0">
                    <Building className="w-6 h-6 text-[#FF9933]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded">
                        🏛️ {t('dashboardTitle', lang)}
                      </span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded font-mono font-bold">
                        {lang === 'gu' ? 'લૉગિન થયેલ' : lang === 'hi' ? 'लॉगिन किया गया' : lang === 'mr' ? 'लॉगिन केले' : 'Logged In'}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                      {t('loggedInNoBookingTitle', lang)}, {currentUser.name || getCitizenDisplayName(lang)}!
                    </h2>
                    <p className="text-xs text-blue-100 mt-0.5">
                      {t('loggedInNoBookingSub', lang)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => {
                      triggerHaptic('tap');
                      setLocationRadarModalOpen(true);
                    }}
                    className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Compass className="w-4 h-4 text-amber-300" />
                    <span>{lang === 'gu' ? '📍 નજીકની કચેરીઓ (GPS રડાર)' : '📍 Nearby Kacheris (Radar)'}</span>
                  </button>
                </div>
              </div>
            ) : (
              /* State 3: Public / Unauthenticated Visitor */
              <div className="mb-6 bg-gradient-to-r from-[#003366] via-[#004080] to-[#005A9C] rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20 shrink-0">
                    <Radio className="w-6 h-6 text-[#FF9933] animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-400/20 text-[#FF9933] border border-amber-400/30 px-2 py-0.5 rounded">
                        {t('publicRadarBannerBadge', lang)}
                      </span>
                      <span className="text-[10px] bg-blue-400/20 text-blue-200 border border-blue-300/30 px-2 py-0.5 rounded font-mono font-bold">
                        {t('publicRadarBannerStatus', lang)}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                      {t('publicRadarBannerTitle', lang)}
                    </h2>
                    <p className="text-xs text-blue-100 mt-0.5 max-w-2xl">
                      {t('publicRadarBannerSub', lang)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => {
                      triggerHaptic('tap');
                      setLocationRadarModalOpen(true);
                    }}
                    className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <Compass className="w-4 h-4 text-amber-300" />
                    <span>{lang === 'gu' ? '📍 લાઈવ કચેરી રડાર' : '📍 Live Radar'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2-Column Responsive Dashboard Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
              
              {/* Left Column (5 cols): Dynamic Action / Token Card + Multi-Modal Channels */}
              <div className="lg:col-span-5 space-y-5 sm:space-y-6">
                
                {/* Dynamic Card 1: Show Active Token Pass ONLY if activeBooking exists */}
                {activeBooking ? (
                  <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#138808]" />
                        <span className="text-xs font-extrabold text-[#003366] tracking-tight">{t('myLiveTokenCardTitle', lang)}</span>
                      </div>
                      <span className="bg-emerald-50 text-[#138808] border border-emerald-200 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#138808] animate-ping" />
                        {t('tokenActiveBadge', lang)}
                      </span>
                    </div>

                    <div className="text-center pt-1">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('virtualTokenTitle', lang)}</p>
                      <h2 className="text-4xl sm:text-5xl font-black text-[#FF9933] tracking-tight mt-1 font-mono">
                        {activeBooking.tokenNumber}
                      </h2>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 border border-blue-200 text-xs font-black text-[#003366]">
                        <span>🏛️</span>
                        <span>
                          {`${t('counterLabel', lang)} ${activeBooking.counterNumber} • ${lang === 'en' ? (activeBooking.counterNameEn || activeBooking.counterNameGu) : activeBooking.counterNameGu}`}
                        </span>
                      </div>
                    </div>

                    {/* 📷 AUTHENTIC HIGH-RES SCANNABLE QR CODE FOR ACTIVE BOOKING */}
                    <div className="py-2 flex justify-center">
                      <AuthenticQrCode
                        payload={`https://queueless.gujarat.gov.in/verify?token=${encodeURIComponent(activeBooking.tokenNumber)}&citizen=${encodeURIComponent(currentUser?.name || getCitizenDisplayName(lang))}&office=RajkotGondal&sig=QL-GUJ-8F3A29`}
                        tokenId={activeBooking.tokenNumber}
                        size={180}
                        label={lang === 'gu' ? 'સત્તાવાર સુરક્ષિત QR ટોકન' : lang === 'hi' ? 'आधिकारिक सुरक्षित QR टोकन' : lang === 'mr' ? 'अधिकृत सुरक्षित QR टोकन' : 'Official Secure QR Token'}
                        subLabel={lang === 'gu' ? `કચેરી ગેટ અથવા કાઉન્ટર ${activeBooking.counterNumber} પર સ્કેન કરો` : `Scan at Kacheri Gate or Desk ${activeBooking.counterNumber}`}
                      />
                    </div>

                    {/* Arrive By & Buffer Info */}
                    <div className="bg-[#F5F7FA] border border-slate-200 rounded-2xl p-3.5 text-center space-y-1">
                      <p className="text-xs font-extrabold text-[#003366]">
                        {t('arriveByLabel', lang)} <span className="text-red-600 font-black font-mono text-sm">
                          {lateShiftMinutes > 0 ? `${activeBooking.slot.startTime} (+${lateShiftMinutes}m)` : activeBooking.slot.startTime}
                        </span>
                      </p>
                      <p className="text-[11px] font-bold text-[#FF9933]">
                        ⏱️ {activeBooking.slot.timeRange} {lateShiftMinutes > 0 ? t('rescheduledLabel', lang) : t('trafficBufferLabel', lang)}
                      </p>
                    </div>

                    {/* Citizen Actions: Running Late + Voice Guidance */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={handleRunningLate}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold py-2.5 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition min-h-[44px] cursor-pointer"
                        title={t('btnRunningLate', lang)}
                      >
                        <RotateCcw className="w-3.5 h-3.5 shrink-0 text-amber-700" />
                        <span className="truncate">{t('btnRunningLate', lang)}</span>
                      </button>
                      <button
                        onClick={() => {
                          triggerHaptic('tap');
                          const tokenStr = activeBooking.tokenNumber;
                          const citizenName = currentUser?.name || getCitizenDisplayName(lang);
                          const counterNum = activeBooking.counterNumber;
                          speakGuidance(
                            lang === 'en'
                              ? `Hello ${citizenName}, your token number ${tokenStr} is active for Counter ${counterNum}. Please proceed to the counter on time.`
                              : lang === 'hi'
                              ? `नमस्ते ${citizenName}, आपका टोकन नंबर ${tokenStr} काउंटर ${counterNum} के लिए सक्रिय है। कृपया समय पर पहुंचें।`
                              : `નમસ્તે ${citizenName}, તમારો ટોકન નંબર ${tokenStr} કાઉન્ટર ${counterNum} માટે સક્રિય છે. કૃપા કરીને સમયસર કાઉન્ટર પર પહોંચો.`,
                            lang
                          );
                        }}
                        className="bg-blue-50 hover:bg-blue-100 text-[#003366] border border-blue-200 font-bold py-2.5 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition min-h-[44px] cursor-pointer"
                        title={t('btnListenAudio', lang)}
                      >
                        <Volume2 className="w-3.5 h-3.5 shrink-0 text-[#005A9C]" />
                        <span className="truncate">{t('btnListenAudio', lang)}</span>
                      </button>
                    </div>

                    {/* Queue Position Pill */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-500">{t('queuePosition', lang)}</span>
                      <span className="text-xl font-black text-[#003366] bg-[#F5F7FA] border border-slate-200 px-3 py-1 rounded-xl font-mono">
                        {lateShiftMinutes > 0 ? '૧૭' : '૧૪'} {lang === 'gu' ? 'નાગરિકો' : 'Citizens'}
                      </span>
                    </div>
                  </div>
                ) : currentUser ? (
                  /* Dynamic Card 1 State B: Logged-in citizen with No Active Token */
                  <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-[#005A9C]" />
                        <span className="text-xs font-extrabold text-[#003366] tracking-tight">{t('myLiveTokenCardTitle', lang)}</span>
                      </div>
                      <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        {t('noActiveTokenTitle', lang)}
                      </span>
                    </div>

                    <div className="text-center py-4 space-y-3">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl text-[#FF9933]">
                        🎫
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-[#003366]">
                          {t('noActiveTokenTitle', lang)}
                        </h3>
                        <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                          {t('noActiveTokenDesc', lang)}
                        </p>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row lg:flex-col gap-2.5">
                        <button
                          onClick={() => {
                            triggerHaptic('tap');
                            setSlotModalOpen(true);
                          }}
                          className="flex-1 w-full bg-[#FF9933] hover:bg-[#ff8800] text-slate-900 font-black py-3 px-4 rounded-xl text-xs sm:text-sm shadow-xs transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Calendar className="w-4 h-4 text-slate-900" />
                          <span>{t('btnBookSlotCTA', lang)}</span>
                        </button>
                        <button
                          onClick={() => {
                            triggerHaptic('tap');
                            setTokenTrackerModalOpen(true);
                          }}
                          className="flex-1 w-full bg-slate-50 hover:bg-slate-100 text-[#003366] border border-slate-200 font-bold py-2.5 sm:py-3 px-4 rounded-xl text-xs sm:text-sm transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                        >
                          <Search className="w-3.5 h-3.5 text-[#005A9C]" />
                          <span>{t('btnTrackTokenCTA', lang)}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Dynamic Card 1 State C: Public Guest Entry Desk (Queue-Free Appointment) */
                  <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#138808]" />
                        <span className="text-xs font-extrabold text-[#003366] tracking-tight">{t('queueFreeDeskTitle', lang)}</span>
                      </div>
                      <span className="bg-blue-50 text-[#005A9C] border border-blue-200 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                        {t('guestDeskBadge', lang)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h3 className="text-sm sm:text-base font-extrabold text-[#003366] leading-snug">
                          {t('guestDeskHeadline', lang)}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {t('guestDeskDesc', lang)}
                        </p>
                      </div>

                      <div className="space-y-2 bg-[#F5F7FA] border border-slate-200 rounded-2xl p-3 text-xs">
                        <div className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold shrink-0">✓</span>
                          <p className="text-slate-700 font-semibold">{t('guestStep1', lang)}</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold shrink-0">✓</span>
                          <p className="text-slate-700 font-semibold">{t('guestStep2', lang)}</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold shrink-0">✓</span>
                          <p className="text-slate-700 font-semibold">{t('guestStep3', lang)}</p>
                        </div>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row lg:flex-col gap-2.5">
                        <button
                          onClick={() => {
                            triggerHaptic('tap');
                            setSlotModalOpen(true);
                          }}
                          className="flex-1 w-full bg-[#FF9933] hover:bg-[#ff8800] text-slate-900 font-black py-3 px-4 rounded-xl text-xs sm:text-sm shadow-xs transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Calendar className="w-4 h-4 text-slate-900" />
                          <span>{t('btnBookSlotCTA', lang)}</span>
                        </button>
                        <button
                          onClick={() => {
                            triggerHaptic('tap');
                            setTokenTrackerModalOpen(true);
                          }}
                          className="flex-1 w-full bg-slate-50 hover:bg-slate-100 text-[#003366] border border-slate-200 font-bold py-2.5 sm:py-3 px-4 rounded-xl text-xs sm:text-sm transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                        >
                          <Search className="w-3.5 h-3.5 text-[#005A9C]" />
                          <span>{t('btnTrackTokenCTA', lang)}</span>
                        </button>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">{t('alreadyHaveTokenPrompt', lang)}</span>
                        <button
                          onClick={() => {
                            triggerHaptic('tap');
                            setAuthModalOpen(true);
                          }}
                          className="font-extrabold text-[#005A9C] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Lock className="w-3 h-3 text-[#FF9933]" />
                          <span>{t('loginToViewPassBtn', lang)}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Card 2: ♿ MULTI-MODAL ACCESSIBILITY CHANNELS */}
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
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-xl flex items-center gap-2">
                      <span className="text-base">🟢</span>
                      <div>
                        <p className="text-[9px] font-bold text-emerald-800 uppercase">{t('channelVisual', lang)}</p>
                        <p className="text-[10px] font-black text-slate-800 leading-tight">{t('channelVisualDesc', lang)}</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-xl flex items-center gap-2">
                      <span className="text-base">🔔</span>
                      <div>
                        <p className="text-[9px] font-bold text-[#005A9C] uppercase">{t('channelChime', lang)}</p>
                        <p className="text-[10px] font-black text-slate-800 leading-tight">{t('channelChimeDesc', lang)}</p>
                      </div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 p-2.5 rounded-xl flex items-center gap-2">
                      <span className="text-base">🗣️</span>
                      <div>
                        <p className="text-[9px] font-bold text-purple-800 uppercase">{t('channelVoice', lang)}</p>
                        <p className="text-[10px] font-black text-slate-800 leading-tight">{t('channelVoiceDesc', lang)}</p>
                      </div>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex items-center gap-2">
                      <span className="text-base">📳</span>
                      <div>
                        <p className="text-[9px] font-bold text-amber-800 uppercase">{t('channelHaptic', lang)}</p>
                        <p className="text-[10px] font-black text-slate-800 leading-tight">{t('channelHapticDesc', lang)}</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column (7 cols): Live Queue Radar & Nearby Kacheris Switcher */}
              <div className="lg:col-span-7 space-y-5 sm:space-y-6">
                
                {/* Modern Tab Bar: Smart Kacheri Radar vs Waiting Hall Counters */}
                <div className="bg-white p-1.5 sm:p-2 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
                    <button
                      onClick={() => {
                        triggerHaptic('tap');
                        setRadarViewTab('nearby');
                      }}
                      className={`px-2 sm:px-3 py-2 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        radarViewTab === 'nearby'
                          ? 'bg-[#003366] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Compass className={`w-3.5 h-3.5 shrink-0 ${radarViewTab === 'nearby' ? 'text-[#FF9933]' : ''}`} />
                      <span className="truncate">{lang === 'gu' ? '📍 સ્માર્ટ રડાર' : '📍 Radar'}</span>
                      <span className="text-[9px] bg-emerald-500 text-white font-mono px-1 py-0.2 rounded font-bold shrink-0">
                        {lang === 'gu' ? 'ઓછી ભીડ' : 'Smart'}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        triggerHaptic('tap');
                        setRadarViewTab('hall');
                      }}
                      className={`px-2 sm:px-3 py-2 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        radarViewTab === 'hall'
                          ? 'bg-[#003366] text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Building className={`w-3.5 h-3.5 shrink-0 ${radarViewTab === 'hall' ? 'text-[#FF9933]' : ''}`} />
                      <span className="truncate">{lang === 'gu' ? '🏛️ ૬ કાઉન્ટર' : '🏛️ Counters'}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      triggerHaptic('tap');
                      if (!currentUser) {
                        setLoginPromptReason(lang === 'gu' ? 'આધાર પ્રોફાઇલ & પરિવાર વૉલ્ટ ઍક્સેસ કરવા માટે કૃપા કરીને લૉગિન કરો.' : 'Please login to access your Aadhaar Profile & Family Vault.');
                        setAuthModalOpen(true);
                      } else {
                        setCitizenProfileModalOpen(true);
                      }
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-[#003366] rounded-xl text-xs font-bold border border-blue-200 transition cursor-pointer"
                    title={lang === 'gu' ? 'આધાર પ્રોફાઇલ & પરિવાર વૉલ્ટ' : 'Aadhaar Profile & Family Vault'}
                  >
                    <Users className="w-3.5 h-3.5 text-[#005A9C]" />
                    <span>{lang === 'gu' ? 'આધાર & પરિવાર વૉલ્ટ' : 'Family Vault'}</span>
                  </button>
                </div>

                {radarViewTab === 'nearby' ? (
                  <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm">
                    <CitizenLocationRadar
                      isStandaloneCard={true}
                      lang={lang}
                      isLoggedIn={!!currentUser}
                      onSelectKacheriForBooking={handleBookKacheriSlot}
                    />
                  </div>
                ) : (
                  <>
                    {/* 📡 LIVE QUEUE VISUALIZATION / KACHERI RADAR */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
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
                        <MapPin className="w-3.5 h-3.5 text-[#FF9933]" />
                        <span>
                          {t('currentOfficeTitle', lang)} {activeBooking ? (lang === 'en' ? `${activeBooking.taluka.officeNameEn || activeBooking.taluka.officeNameGu}, ${activeBooking.district.nameEn || activeBooking.district.nameGu}` : `${activeBooking.taluka.officeNameGu}, ${activeBooking.district.nameGu}`) : t('defaultOfficeName', lang)}
                        </span>
                      </p>
                    </div>
                    <span className="text-[10px] font-bold bg-[#F5F7FA] text-[#003366] border border-slate-200 px-2.5 py-1 rounded-lg">
                      Queue Display • Live Sync
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div className="bg-[#F5F7FA] border border-slate-200 rounded-2xl p-4">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('liveWaitEst', lang)}</p>
                      <h4 className="text-3xl sm:text-4xl font-black text-[#138808] mt-1 font-mono">
                        {lang === 'gu' ? '૧૮ મિનિટ' : lang === 'hi' ? '१८ मिनट' : lang === 'mr' ? '१८ मिनिटे' : '18 mins'}
                      </h4>
                      <p className="text-xs text-slate-600 font-semibold mt-1">{t('estServiceTime', lang)}</p>
                      <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-[#005A9C] bg-blue-50 p-2.5 rounded-xl border border-blue-100">
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
                <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm">
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
                  {isRadarLoading ? (
                    <div className="mt-4">
                      <CounterGridSkeleton count={6} />
                    </div>
                  ) : (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    
                    {/* COUNTER 1 */}
                    {(() => {
                      const isUserDesk = activeBooking?.counterNumber === 1;
                      return (
                        <div className={`rounded-2xl border-2 p-3.5 flex flex-col justify-between shadow-xs ${
                          isUserDesk 
                            ? 'border-[#FF9933] bg-gradient-to-b from-amber-50/50 to-white shadow-md relative ring-2 ring-[#FF9933]/30' 
                            : 'border-emerald-300 bg-white'
                        }`}>
                          <div>
                            <div className={`flex items-center justify-between gap-1 pb-2 border-b ${isUserDesk ? 'border-amber-200' : 'border-slate-100'}`}>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black tracking-wide text-[#003366] uppercase">
                                  {t('counterLabel', lang)} 1
                                </span>
                                {isUserDesk && (
                                  <span className="text-[9px] bg-[#FF9933] text-slate-950 font-black px-1.5 py-0.5 rounded font-mono">
                                    ⭐ {t('yourDeskBadge', lang)}
                                  </span>
                                )}
                              </div>
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
                            <div className={`rounded-xl p-2 text-center ${
                              isUserDesk 
                                ? 'bg-amber-100/80 border-2 border-[#FF9933] animate-pulse' 
                                : 'bg-slate-50 border border-slate-200'
                            }`}>
                              <p className={`text-[9px] font-black uppercase tracking-wider ${isUserDesk ? 'text-amber-900' : 'text-slate-500'}`}>{t('nextText', lang)}</p>
                              <p className={`text-2xl font-black font-mono mt-0.5 ${isUserDesk ? 'text-[#FF9933]' : 'text-slate-800'}`}>A-41</p>
                            </div>
                          </div>

                          <div className={`pt-2 border-t flex items-center justify-between text-[11px] font-bold ${isUserDesk ? 'border-amber-100' : 'border-slate-100'}`}>
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
                      );
                    })()}

                    {/* COUNTER 2 (Assigned Desk ONLY if citizen booked Counter 2) */}
                    {(() => {
                      const isUserDesk = activeBooking?.counterNumber === 2;
                      return (
                        <div className={`rounded-2xl border-2 p-3.5 flex flex-col justify-between shadow-xs ${
                          isUserDesk 
                            ? 'border-[#FF9933] bg-gradient-to-b from-amber-50/50 to-white shadow-md relative ring-2 ring-[#FF9933]/30' 
                            : 'border-amber-300 bg-white'
                        }`}>
                          <div>
                            <div className={`flex items-center justify-between gap-1 pb-2 border-b ${isUserDesk ? 'border-amber-200' : 'border-amber-100'}`}>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black tracking-wide text-[#003366] uppercase">
                                  {t('counterLabel', lang)} 2
                                </span>
                                {isUserDesk && (
                                  <span className="text-[9px] bg-[#FF9933] text-slate-950 font-black px-1.5 py-0.5 rounded font-mono">
                                    ⭐ {t('yourDeskBadge', lang)}
                                  </span>
                                )}
                              </div>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
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
                            <div className={`rounded-xl p-2 text-center ${
                              isUserDesk 
                                ? 'bg-amber-100/80 border-2 border-[#FF9933] animate-pulse' 
                                : 'bg-slate-50 border border-slate-200'
                            }`}>
                              <p className={`text-[9px] font-black uppercase tracking-wider ${isUserDesk ? 'text-amber-900' : 'text-slate-500'}`}>{t('nextText', lang)}</p>
                              <p className={`text-2xl font-black font-mono mt-0.5 ${isUserDesk ? 'text-[#FF9933]' : 'text-slate-800'}`}>A-42</p>
                            </div>
                          </div>

                          <div className={`pt-2 border-t flex items-center justify-between text-[11px] font-bold ${isUserDesk ? 'border-amber-100' : 'border-amber-100'}`}>
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
                      );
                    })()}

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
                    {(() => {
                      const isUserDesk = activeBooking?.counterNumber === 4;
                      return (
                        <div className={`rounded-2xl border-2 p-3.5 flex flex-col justify-between shadow-xs ${
                          isUserDesk 
                            ? 'border-[#FF9933] bg-gradient-to-b from-amber-50/50 to-white shadow-md relative ring-2 ring-[#FF9933]/30' 
                            : 'border-emerald-300 bg-white'
                        }`}>
                          <div>
                            <div className={`flex items-center justify-between gap-1 pb-2 border-b ${isUserDesk ? 'border-amber-200' : 'border-slate-100'}`}>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-black tracking-wide text-[#003366] uppercase">
                                  {t('counterLabel', lang)} 4
                                </span>
                                {isUserDesk && (
                                  <span className="text-[9px] bg-[#FF9933] text-slate-950 font-black px-1.5 py-0.5 rounded font-mono">
                                    ⭐ {t('yourDeskBadge', lang)}
                                  </span>
                                )}
                              </div>
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
                            <div className={`rounded-xl p-2 text-center ${
                              isUserDesk 
                                ? 'bg-amber-100/80 border-2 border-[#FF9933] animate-pulse' 
                                : 'bg-slate-50 border border-slate-200'
                            }`}>
                              <p className={`text-[9px] font-black uppercase tracking-wider ${isUserDesk ? 'text-amber-900' : 'text-slate-500'}`}>{t('nextText', lang)}</p>
                              <p className={`text-2xl font-black font-mono mt-0.5 ${isUserDesk ? 'text-[#FF9933]' : 'text-slate-800'}`}>B-13</p>
                            </div>
                          </div>

                          <div className={`pt-2 border-t flex items-center justify-between text-[11px] font-bold ${isUserDesk ? 'border-amber-100' : 'border-slate-100'}`}>
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
                      );
                    })()}

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

                    {/* COUNTER 6 (FIXED: C-08 / C-09, NO DUPLICATE OF A-42!) */}
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
                          <p className="text-2xl font-black text-[#003366] font-mono mt-0.5">C-08</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center">
                          <p className="text-[9px] font-black uppercase text-slate-500 tracking-wider">{t('nextText', lang)}</p>
                          <p className="text-2xl font-black text-[#FF9933] font-mono mt-0.5">C-09</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                        <span className="text-slate-600 flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>4 {t('peopleWaitingSuffix', lang)}</span>
                        </span>
                        <span className="text-[#005A9C] flex items-center gap-1 font-extrabold">
                          <Clock className="w-3 h-3 text-[#FF9933]" />
                          <span>{t('estWaitPrefix', lang)} 12 min</span>
                        </span>
                      </div>
                    </div>

                  </div>
                  )}

                  {/* Sync and Guarantee Note */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#138808]" />
                      <span>{t('liveSyncNote', lang)}</span>
                    </p>
                    <button 
                      onClick={() => {
                        triggerHaptic('tap');
                        setView('landing');
                      }} 
                      className="text-xs font-bold text-[#005A9C] hover:text-[#003366] flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>← {t('backToHome', lang)}</span>
                    </button>
                  </div>
                </div>
                  </>
                )}

              </div>

            </div>

          </div>
        </main>
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

            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#005A9C] flex items-center justify-center mx-auto text-xl mb-3">
                {authModalTab === 'kacheri' ? <Building className="w-6 h-6 text-[#003366]" /> : <ShieldCheck className="w-6 h-6" />}
              </div>
              <h3 className="text-xl font-black text-[#003366]">
                {authModalTab === 'kacheri' 
                  ? (lang === 'gu' ? 'કચેરી & સરકારી અધિકારી લૉગિન' : lang === 'hi' ? 'कचहरी व सरकारी अधिकारी लॉगिन' : lang === 'mr' ? 'कचेरी व शासकीय अधिकारी लॉगिन' : 'Kacheri & Government Officer Login')
                  : t('authModalTitle', lang)}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {authModalTab === 'kacheri'
                  ? (lang === 'gu' ? 'મામલતદાર કચેરી, જન સેવા કેન્દ્ર ઓપરેટર & કલેક્ટર કન્સોલ' : lang === 'hi' ? 'मामलतदार कार्यालय व जन सेवा केंद्र ऑपरेटर' : lang === 'mr' ? 'तहसीलदार कार्यालय व जन सेवा केंद्र ऑपरेटर' : 'Mamlatdar Office, Jan Seva Kendra Operator & Collector Console')
                  : t('authModalSubtitle', lang)}
              </p>
            </div>

            {/* Login Mode Selector Tabs: Citizen vs Kacheri */}
            <div className="flex items-center p-1 bg-slate-100 rounded-2xl mb-4">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('tap');
                  setAuthModalTab('citizen');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  authModalTab === 'citizen'
                    ? 'bg-white text-[#003366] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{lang === 'gu' ? 'નાગરિક લૉગિન' : lang === 'hi' ? 'नागरिक लॉगिन' : lang === 'mr' ? 'नागरिक लॉगिन' : 'Citizen Login'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('tap');
                  setAuthModalTab('kacheri');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  authModalTab === 'kacheri'
                    ? 'bg-[#003366] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building className="w-3.5 h-3.5 text-[#FF9933]" />
                <span>{lang === 'gu' ? '🏛️ કચેરી લૉગિન' : lang === 'hi' ? '🏛️ कचहरी लॉगिन' : lang === 'mr' ? '🏛️ कचेरी लॉगिन' : '🏛️ Kacheri Login'}</span>
              </button>
            </div>

            {loginPromptReason && authModalTab === 'citizen' && (
              <div className="mb-4 p-3 bg-amber-50 border-2 border-[#FF9933] rounded-2xl text-amber-950 text-xs font-bold flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-[#FF9933] shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="font-extrabold text-[#003366]">{t('loginMandatoryNotice', lang)}</p>
                  <p className="text-[11px] font-medium text-amber-900 mt-0.5">{loginPromptReason}</p>
                </div>
              </div>
            )}

            {authModalTab === 'kacheri' ? (
              /* KACHERI / OFFICER LOGIN TAB CONTENT */
              <div className="space-y-3.5 animate-in fade-in duration-150">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-amber-950">
                        {lang === 'gu' ? 'કચેરી અધિકૃત પોર્ટલ' : 'Official Kacheri Desk'}
                      </h4>
                      <p className="text-[10px] text-amber-800 font-semibold">
                        {lang === 'gu' ? 'કાઉન્ટર ૧ થી ૬ ઓપરેટર્સ & મામલતદાર' : 'Counters 1 to 6 Operators & Mamlatdar'}
                      </p>
                    </div>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    {lang === 'gu' 
                      ? 'લાઈવ કાઉન્ટર કન્સોલ દ્વારા ટોકન કોલિંગ, ઓટોમેટેડ દસ્તાવેજ ચકાસણી, અને અરજદારોના નિકાલ માટે પ્રવેશ કરો.' 
                      : 'Access the live counter console for token calling, automated document inspection, and queue throughput management.'}
                  </p>
                </div>

                <Link
                  href="/admin/counter"
                  onClick={() => {
                    triggerHaptic('tap');
                    setAuthModalOpen(false);
                  }}
                  className="w-full bg-[#003366] hover:bg-[#002244] text-white font-black py-3 px-4 rounded-xl text-xs shadow-md active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Building className="w-4 h-4 text-[#FF9933]" />
                  <span>{lang === 'gu' ? '🏛️ કચેરી કાઉન્ટર કન્સોલ ખોલો' : 'Open Kacheri Counter Console'}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-200" />
                </Link>

                <p className="text-[10px] text-slate-500 text-center pt-1 font-medium">
                  🔒 {lang === 'gu' ? 'GRTSA ૨૦૧૩: સરકારી કચેરી કાઉન્ટર ૧ થી ૬ ઓપરેટર્સ માટે સુરક્ષિત' : 'GRTSA 2013: Authorized for Kacheri Counter 1-6 Operators'}
                </p>
              </div>
            ) : (
              /* CITIZEN LOGIN TAB CONTENT */
              <div className="space-y-4 animate-in fade-in duration-150">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>{t('phoneLabel', lang)}</span>
                    <button
                      onClick={() => speakGuidance(lang === 'khi' ? "કૃપા કરી તમોજો દસ આંકડા જો મોબાઈલ નંબર દાખલ કરિયો." : lang === 'gu' ? "કૃપા કરીને તમારો દસ આંકડાનો મોબાઈલ નંબર દાખલ કરો." : lang === 'hi' ? "कृपया अपना दस अंकों का मोबाइल नंबर दर्ज करें।" : lang === 'mr' ? "कृपया तुमचा १० अंकी मोबाइल क्रमांक प्रविष्ट करा." : "Please enter your 10-digit mobile number.", lang)}
                      className="text-[#005A9C] text-[11px] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> {t('listenBtnLabel', lang)}
                    </button>
                  </label>
                  <div className="flex items-stretch">
                    <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-slate-300 bg-[#F5F7FA] text-slate-700 text-xs font-black shrink-0 whitespace-nowrap select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      maxLength={10}
                      className="w-full text-xs font-bold rounded-r-xl border border-slate-300 p-2.5 outline-none focus:border-[#005A9C] tracking-wider"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-700 whitespace-nowrap">{t('aadhaarLast4Label', lang)}</span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0 whitespace-nowrap">
                      {lang === 'gu' ? '🔒 સુરક્ષિત આધાર માસ્કિંગ' : lang === 'hi' ? '🔒 सुरक्षित आधार मास्किंग' : lang === 'mr' ? '🔒 सुरक्षित आधार मास्किंग' : '🔒 Secure Aadhaar Masking'}
                    </span>
                  </div>
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

                <button
                  onClick={handleOtpSubmit}
                  className="w-full bg-[#005A9C] hover:bg-[#003366] text-white font-bold py-3 rounded-xl text-xs shadow-md active:scale-95 transition flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  <span>{t('getOtpBtn', lang)}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {/* 1-Click Fast Citizen Demo Login */}
                <button
                  type="button"
                  onClick={() => loginAsDemo('farmer')}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold py-2 rounded-xl text-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>⚡</span>
                  <span>{t('demoLoginBtn', lang)}</span>
                </button>
              </div>
            )}
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
          lang={lang}
        />
      )}

      {/* PHASE 3: 33 DISTRICTS & TALUKAS JURISDICTION + CAPPED SLOT ENGINE */}
      <SlotBookingModal
        isOpen={slotModalOpen}
        onClose={() => {
          setSlotModalOpen(false);
          setTargetBookingTalukaId(undefined);
          setTargetBookingDistrictId(undefined);
        }}
        scheme={activeScheme}
        onConfirm={handleConfirmBooking}
        initialDistrictId={targetBookingDistrictId || 'rajkot'}
        initialTalukaId={targetBookingTalukaId || 'gondal'}
        initialVillage="ગોમટા"
        lang={lang}
      />

      {/* CITIZEN AADHAAR PROFILE & FAMILY VAULT MODAL */}
      <CitizenProfileModal
        isOpen={citizenProfileModalOpen}
        onClose={() => setCitizenProfileModalOpen(false)}
        lang={lang}
        onOpenLocationRadar={() => {
          setCitizenProfileModalOpen(false);
          setLocationRadarModalOpen(true);
        }}
        onOpenUpdateModal={() => {
          setCitizenProfileModalOpen(false);
          setUpdateModalOpen(true);
        }}
      />

      {/* STANDALONE CITIZEN LOCATION RADAR MODAL */}
      <CitizenLocationRadar
        isOpen={locationRadarModalOpen}
        onClose={() => setLocationRadarModalOpen(false)}
        lang={lang}
        isLoggedIn={!!currentUser}
        onSelectKacheriForBooking={(kacheriId, talukaId) => {
          setLocationRadarModalOpen(false);
          handleBookKacheriSlot(kacheriId, talukaId);
        }}
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
              citizenName={currentUser?.name || getCitizenDisplayName(lang)}
              onClose={() => setTokenPassModalOpen(false)}
              lang={lang}
            />
          </div>
        </div>
      )}

      {/* CITIZEN HELP & GRIEVANCE SUPPORT MODAL */}
      <CitizenHelpModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        lang={lang}
      />

      {/* TOKEN TRACKER MODAL */}
      <TokenTrackerModal
        isOpen={tokenTrackerModalOpen}
        onClose={() => setTokenTrackerModalOpen(false)}
        onBookSlot={() => setSlotModalOpen(true)}
        onViewRadar={() => setView('dashboard')}
        activeBooking={activeBooking}
        currentUser={currentUser}
        lang={lang}
      />

      {/* PWA 1-CLICK INSTALL BANNER (Floating corner widget with close icon) */}
      <PwaInstallBanner lang={lang} />

      {/* FORCE LIVE APP VERSION UPDATE MODAL */}
      <AppVersionUpdateModal 
        lang={lang} 
        forceOpen={updateModalOpen} 
        onClose={() => setUpdateModalOpen(false)} 
      />

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
              setTokenTrackerModalOpen(true);
            }
          }}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold min-h-[44px] justify-center transition active:scale-95 focus-visible:ring-2 focus-visible:ring-[#005A9C] rounded-lg px-2 ${
            activeBooking ? 'text-[#FF9933]' : 'text-slate-500 hover:text-slate-700'
          }`}
          aria-label={activeBooking ? `${t('mobNavTokenPass', lang)} ${activeBooking.tokenNumber}` : t('mobNavTokenPass', lang)}
        >
          <div className={`w-8 h-8 -mt-3.5 rounded-full flex items-center justify-center border-2 border-white shadow-md transition ${
            activeBooking ? 'bg-[#003366] text-[#FF9933]' : 'bg-[#005A9C] text-white'
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
            <button
              onClick={() => {
                triggerHaptic('tap');
                setUpdateModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-[#003366] border border-blue-200 rounded-lg font-bold text-xs transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FF9933]" />
              <span>{CURRENT_APP_VERSION} {lang === 'gu' ? 'નવા ફેરફારો & અપડેટ્સ' : "What's New"}</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
