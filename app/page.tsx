'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, MapPin, Lock, Clock, Search, ArrowRight, 
  RotateCcw, Volume2, QrCode, Ticket, Brain, Crosshair, 
  Users, Building, Award, Bell, CheckCircle2, ChevronDown, Download,
  Layers, ArrowLeft, Calendar, Home as HomeIcon, Radio, Globe, Headphones,
  Compass, Sparkles, ExternalLink, X, Menu
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { speakGuidance } from '@/lib/voice';
import { subscribeToQueueEvents } from '@/lib/realtime-bus';
import { PwaInstallBanner } from '@/components/PwaInstallBanner';
import { SchemesCatalog } from '@/components/SchemesCatalog';
import dynamic from 'next/dynamic';
import type { SchemeBookingMeta } from '@/components/SchemeDrawer';
import { BookingDetails } from '@/components/SlotBookingModal';
import { VerifiedDocumentItem } from '@/lib/slot-engine';
import { GovLogo } from '@/components/GovLogo';
import { GovTelemetryMarquee } from '@/components/GovTelemetryMarquee';
import { GovJanSevaGateway } from '@/components/GovJanSevaGateway';
import { AuthenticQrCode } from '@/components/AuthenticQrCode';
import { SchemeItem, ALL_YOJANAS } from '@/lib/schemes-data';
import { Language, GUJARAT_LANGUAGES, t } from '@/lib/translations';
import { CounterGridSkeleton } from '@/components/ui/Skeleton';
import { CitizenLocationRadar } from '@/components/CitizenLocationRadar';
import { CURRENT_APP_VERSION } from '@/components/AppVersionUpdateModal';

// High-Performance Dynamic Imports for Heavy Modals (Loaded On-Demand)
const SchemeDrawer = dynamic(() => import('@/components/SchemeDrawer').then(m => m.SchemeDrawer), { ssr: false });
const CameraScannerModal = dynamic(() => import('@/components/CameraScannerModal').then(m => m.CameraScannerModal), { ssr: false });
const SlotBookingModal = dynamic(() => import('@/components/SlotBookingModal').then(m => m.SlotBookingModal), { ssr: false });
const DigitalTokenPass = dynamic(() => import('@/components/DigitalTokenPass').then(m => m.DigitalTokenPass), { ssr: false });
const CitizenHelpModal = dynamic(() => import('@/components/CitizenHelpModal').then(m => m.CitizenHelpModal), { ssr: false });
const TokenTrackerModal = dynamic(() => import('@/components/TokenTrackerModal').then(m => m.TokenTrackerModal), { ssr: false });
const CitizenProfileModal = dynamic(() => import('@/components/CitizenProfileModal').then(m => m.CitizenProfileModal), { ssr: false });
const AppVersionUpdateModal = dynamic(() => import('@/components/AppVersionUpdateModal').then(m => m.AppVersionUpdateModal), { ssr: false });

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Changelog is accessible anytime via the top bar "v1.2 Live Updates" badge

  // Localized Citizen Identity Helpers (Dynamic for gu, hi, en, mr, etc.)
  const getCitizenDisplayName = (l: Language, rawName?: string) => {
    const raw = (rawName || '').trim();
    if (!raw || ['હરિ પટેલ', 'हरि पटेल', 'Hari Patel', 'हरी पटेल'].includes(raw)) {
      switch (l) {
        case 'gu': return 'હરિ પટેલ';
        case 'hi': return 'हरि पटेल';
        case 'mr': return 'हरी पटेल';
        case 'en': default: return 'Hari Patel';
      }
    }
    return raw;
  };

  const getCitizenRole = (l: Language, rawRole?: string) => {
    const raw = (rawRole || '').trim();
    if (!raw || ['નાગરિક', 'नागरिक', 'Citizen'].includes(raw)) {
      switch (l) {
        case 'gu': return 'નાગરિક';
        case 'hi': return 'नागरिक';
        case 'mr': return 'नागरिक';
        case 'en': default: return 'Citizen';
      }
    }
    return raw;
  };

  const getCitizenArea = (l: Language, rawArea?: string) => {
    const raw = (rawArea || '').trim();
    if (!raw || ['રાજકોટ ગ્રામ્ય', 'રાજકોટ ગ્રામીણ', 'राजकोट ग्रामीण', 'Rajkot Rural'].includes(raw)) {
      switch (l) {
        case 'gu': return 'રાજકોટ ગ્રામ્ય';
        case 'hi': return 'राजकोट ग्रामीण';
        case 'mr': return 'राजकोट ग्रामीण';
        case 'en': default: return 'Rajkot Rural';
      }
    }
    if (raw.includes('ગોંડલ') || raw.includes('गोंडल') || raw.includes('Gondal')) {
      switch (l) {
        case 'gu': return 'ગોંડલ, રાજકોટ';
        case 'hi': return 'गोंडल, राजकोट';
        case 'mr': return 'गोंडल, राजकोट';
        case 'en': default: return 'Gondal, Rajkot';
      }
    }
    return raw;
  };

  const getCitizenRoleArea = (l: Language, rawArea?: string, rawRole?: string) => {
    const role = getCitizenRole(l, rawRole);
    const area = getCitizenArea(l, rawArea);
    return `${role} • ${area}`;
  };

  // Language switch handler with persistence & instant user relocalization
  const handleSelectLang = (newLang: Language) => {
    triggerHaptic('tap');
    setLang(newLang);
    try {
      localStorage.setItem('qless_preferred_lang', newLang);
    } catch {}

    // Immediately synchronize logged-in user profile to newly selected language!
    setCurrentUser(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        name: getCitizenDisplayName(newLang, prev.name),
        role: getCitizenRole(newLang, prev.role),
        area: getCitizenArea(newLang, prev.area),
      };
      try {
        localStorage.setItem('qless_current_user', JSON.stringify(updated));
      } catch {}
      return updated;
    });

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
  const [bookingHistory, setBookingHistory] = useState<BookingDetails[]>([]);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackedBooking, setTrackedBooking] = useState<BookingDetails | null>(null);
  const [bookingMetaForSlot, setBookingMetaForSlot] = useState<SchemeBookingMeta | null>(null);
  const [lateShiftMinutes, setLateShiftMinutes] = useState<number>(0);
  const [uploadedDocsForBooking, setUploadedDocsForBooking] = useState<VerifiedDocumentItem[]>([]);
  const [toastNotification, setToastNotification] = useState<{ title: string; message: string; type?: 'info' | 'success' | 'warning' } | null>(null);

  const [currentUser, setCurrentUser] = useState<{
    name: string;
    role: string;
    area: string;
    token: string;
  } | null>(null);

  // Check if running inside installed standalone PWA app (vs regular web browser)
  const [isStandaloneApp, setIsStandaloneApp] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkStandalone = () => {
        const isStandalone = 
          window.matchMedia('(display-mode: standalone)').matches ||
          window.matchMedia('(display-mode: fullscreen)').matches ||
          window.matchMedia('(display-mode: minimal-ui)').matches ||
          (window.navigator as any).standalone === true ||
          document.referrer.includes('android-app://') ||
          window.location.search.includes('source=pwa') ||
          window.location.search.includes('mode=pwa') ||
          window.location.search.includes('mode=app') ||
          window.location.search.includes('standalone=true');
        setIsStandaloneApp(isStandalone);
      };
      checkStandalone();
      const mqlStandalone = window.matchMedia('(display-mode: standalone)');
      mqlStandalone.addEventListener?.('change', checkStandalone);
      const mqlFullscreen = window.matchMedia('(display-mode: fullscreen)');
      mqlFullscreen.addEventListener?.('change', checkStandalone);
      window.addEventListener('appinstalled', () => {
        setIsStandaloneApp(true);
      });
      return () => {
        mqlStandalone.removeEventListener?.('change', checkStandalone);
        mqlFullscreen.removeEventListener?.('change', checkStandalone);
      };
    }
  }, []);

  // SESSION & VIEW PERSISTENCE (Survives Page Refresh / F5)
  useEffect(() => {
    try {
      const activeLang = (localStorage.getItem('qless_preferred_lang') as Language) || lang || 'gu';
      const savedUserStr = localStorage.getItem('qless_current_user');
      if (savedUserStr) {
        const parsed = JSON.parse(savedUserStr);
        // Strictly prevent officer/Mamlatdar from staying logged in on Citizen Portal
        if (parsed.role === 'Desk Officer' || parsed.name?.toLowerCase().includes('mamlatdar') || parsed.name?.toLowerCase().includes('trivedi')) {
          localStorage.removeItem('qless_current_user');
          setCurrentUser(null);
        } else {
          // Re-localize user data to the active language right on mount
          const localizedUser = {
            ...parsed,
            name: getCitizenDisplayName(activeLang, parsed.name),
            role: getCitizenRole(activeLang, parsed.role),
            area: getCitizenArea(activeLang, parsed.area),
          };
          setCurrentUser(localizedUser);
          localStorage.setItem('qless_current_user', JSON.stringify(localizedUser));
        }
      }
      const savedBookingStr = localStorage.getItem('qless_active_booking');
      if (savedBookingStr) {
        const parsed = JSON.parse(savedBookingStr);
        setActiveBooking(parsed);
      }
      const savedHistoryStr = localStorage.getItem('qless_booking_history');
      if (savedHistoryStr) {
        try {
          const list = JSON.parse(savedHistoryStr);
          if (Array.isArray(list) && list.length > 0) {
            setBookingHistory(list);
          }
        } catch {}
      } else if (savedBookingStr) {
        try {
          const parsed = JSON.parse(savedBookingStr);
          setBookingHistory([parsed]);
          localStorage.setItem('qless_booking_history', JSON.stringify([parsed]));
        } catch {}
      }

      const savedView = localStorage.getItem('qless_current_view') as any;
      if (savedView && ['landing', 'dashboard', 'services'].includes(savedView)) {
        setView(savedView);
      } else if (savedUserStr && !savedUserStr.toLowerCase().includes('mamlatdar') && !savedUserStr.toLowerCase().includes('trivedi')) {
        setView('dashboard');
      }
    } catch {}
  }, []);

  // Realtime updates for 5-stage lifecycle (Stage 3 Called, Stage 4 Docs Submitted, Stage 5 Order Completed)
  useEffect(() => {
    const unsubscribe = subscribeToQueueEvents((event) => {
      if (event.type === 'TOKEN_DOCS_SUBMITTED' && event.tokenNumber) {
        // Stage 4: Original documents submitted at kacheri desk & verified by officer
        setActiveBooking(prev => {
          if (prev && prev.tokenNumber === event.tokenNumber) {
            const updated: BookingDetails = {
              ...prev,
              currentStage: 4,
              documentSubmissionStatus: 'submitted_at_counter'
            };
            try { localStorage.setItem('qless_active_booking', JSON.stringify(updated)); } catch {}
            return updated;
          }
          return prev;
        });

        setBookingHistory(prev => {
          const updated = prev.map(b => (b.tokenNumber === event.tokenNumber ? {
            ...b,
            currentStage: 4 as const,
            documentSubmissionStatus: 'submitted_at_counter' as const
          } : b));
          try { localStorage.setItem('qless_booking_history', JSON.stringify(updated)); } catch {}
          return updated;
        });

        setTrackedBooking(prev => (prev && prev.tokenNumber === event.tokenNumber ? {
          ...prev,
          currentStage: 4,
          documentSubmissionStatus: 'submitted_at_counter'
        } : prev));

        triggerHaptic('success');
        speakGuidance("કચેરી કાઉન્ટર પર તમારા અસલ દસ્તાવેજો જમા લેવામાં આવ્યા છે અને અધિકારી દ્વારા ભૌતિક ચકાસણી પૂર્ણ થઈ છે.", lang);
        setToastNotification({
          title: "📑 અસલ દસ્તાવેજો કચેરીએ જમા લેવાયા!",
          message: `${event.tokenNumber}: અસલ દસ્તાવેજો અધિકારી દ્વારા ભૌતિક રીતે ચકાસીને જમા લીધા છે. સ્ટેજ ૪ પૂર્ણ!`,
          type: "success"
        });
      } else if (event.type === 'TOKEN_COMPLETED' && event.tokenNumber) {
        // Stage 5: Service officially approved & certificate issued
        setActiveBooking(prev => {
          if (prev && prev.tokenNumber === event.tokenNumber) {
            const updated: BookingDetails = {
              ...prev,
              currentStage: 5,
              status: 'COMPLETED' as any,
              documentSubmissionStatus: 'officer_approved'
            };
            try { localStorage.setItem('qless_active_booking', JSON.stringify(updated)); } catch {}
            return updated;
          }
          return prev;
        });

        setBookingHistory(prev => {
          const updated = prev.map(b => (b.tokenNumber === event.tokenNumber ? {
            ...b,
            currentStage: 5 as const,
            status: 'COMPLETED' as any,
            documentSubmissionStatus: 'officer_approved' as const
          } : b));
          try { localStorage.setItem('qless_booking_history', JSON.stringify(updated)); } catch {}
          return updated;
        });

        setTrackedBooking(prev => (prev && prev.tokenNumber === event.tokenNumber ? {
          ...prev,
          currentStage: 5,
          status: 'COMPLETED' as any,
          documentSubmissionStatus: 'officer_approved'
        } : prev));

        triggerHaptic('success');
        speakGuidance("અભિનંદન! તમારી અરજી સત્તાવાર મંજૂર થઈ છે અને પ્રમાણપત્ર ડિજિટલ સહી સાથે જારી કરવામાં આવ્યું છે.", lang);
        setToastNotification({
          title: "🏆 સત્તાવાર મંજૂરી ઓર્ડર જારી!",
          message: `${event.tokenNumber}: સેવા સફળતાપૂર્વક મંજૂર થઈ છે. તમારું ડિજિટલ પ્રમાણપત્ર તૈયાર છે!`,
          type: "success"
        });
      } else if (event.type === 'TOKEN_CALLED_REALTIME' && event.tokenNumber) {
        // Stage 3: Token called to desk
        setActiveBooking(prev => {
          if (prev && prev.tokenNumber === event.tokenNumber) {
            const updated: BookingDetails = { ...prev, currentStage: 3 };
            try { localStorage.setItem('qless_active_booking', JSON.stringify(updated)); } catch {}
            return updated;
          }
          return prev;
        });

        setBookingHistory(prev => {
          const updated = prev.map(b => (b.tokenNumber === event.tokenNumber ? { ...b, currentStage: 3 as const } : b));
          try { localStorage.setItem('qless_booking_history', JSON.stringify(updated)); } catch {}
          return updated;
        });

        setTrackedBooking(prev => (prev && prev.tokenNumber === event.tokenNumber ? { ...prev, currentStage: 3 } : prev));
      }
    });

    return () => unsubscribe();
  }, [lang]);

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
    const isAnyModalOpen = drawerOpen || scannerOpen || slotModalOpen || tokenPassModalOpen || authModalOpen || helpModalOpen || tokenTrackerModalOpen || citizenProfileModalOpen || locationRadarModalOpen || updateModalOpen || mobileMenuOpen;
    
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
  }, [drawerOpen, scannerOpen, slotModalOpen, tokenPassModalOpen, authModalOpen, helpModalOpen, tokenTrackerModalOpen, citizenProfileModalOpen, locationRadarModalOpen, updateModalOpen, mobileMenuOpen]);

  // ESC KEY TO DISMISS ACTIVE MODAL
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (mobileMenuOpen) setMobileMenuOpen(false);
        else if (updateModalOpen) setUpdateModalOpen(false);
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
  }, [tokenPassModalOpen, slotModalOpen, scannerOpen, drawerOpen, authModalOpen, helpModalOpen, tokenTrackerModalOpen, citizenProfileModalOpen, locationRadarModalOpen, updateModalOpen, loginMenuOpen, langMenuOpen, mobileMenuOpen]);

  // 1-Click Demo Fill Handlers
  const loginAsDemo = (role: 'farmer' = 'farmer') => {
    triggerHaptic('success');
    setAuthModalOpen(false);

    const userObj = {
      name: getCitizenDisplayName(lang),
      role: getCitizenRole(lang),
      area: getCitizenArea(lang),
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
      role: getCitizenRole(lang),
      area: pendingSlotBooking 
        ? (lang === 'en' ? `${pendingSlotBooking.taluka.nameEn || pendingSlotBooking.taluka.nameGu}, ${pendingSlotBooking.district.nameEn || pendingSlotBooking.district.nameGu}` : `${pendingSlotBooking.taluka.nameGu}, ${pendingSlotBooking.district.nameGu}`) 
        : getCitizenArea(lang),
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

  const handleRequestSlotBooking = (preferredScheme?: SchemeItem) => {
    triggerHaptic('tap');
    const target = preferredScheme || activeScheme;
    if (!target) {
      // If no scheme is active, navigate to schemes catalog so citizen can choose their service & upload documents
      setView('services');
      const msg = lang === 'en'
        ? "Please select your required public scheme to upload documents and generate your token."
        : lang === 'hi'
        ? "कृपया पहले अपनी योजना चुनें और दस्तावेज़ अपलोड कर टोकन प्राप्त करें।"
        : "કૃપા કરીને પહેલાં જે યોજનાનો ટોકન મેળવવો હોય તે યોજના પસંદ કરી જરૂરી દસ્તાવેજો અપલોડ કરો.";
      speakGuidance(msg, lang);
      return;
    }

    // Open Scheme Drawer for the target scheme so the citizen uploads & verifies mandatory documents
    setActiveScheme(target);
    setDrawerOpen(true);
  };

  const handleBookKacheriSlot = (_kacheriId: string, talukaId: string) => {
    triggerHaptic('tap');
    setTargetBookingDistrictId('rajkot');
    setTargetBookingTalukaId(talukaId);
    handleRequestSlotBooking();
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
    setToastNotification({
      title: lang === 'en' ? "⏱️ Delay Reported (+20 Mins)" : lang === 'hi' ? "⏱️ विलंब दर्ज (+२० मिनट)" : "⏱️ વિલંબ નોંધણી મંજૂર (+૨૦ મિનિટ)",
      message: lang === 'en' 
        ? "Your appointment slot has been shifted by 20 minutes. Counter officer notified." 
        : lang === 'hi' 
        ? "आपका अपॉइंटमेंट समय २० मिनट आगे बढ़ा दिया गया है। काउंटर अधिकारी को सूचित किया गया।" 
        : "તમારી અપોઇન્ટમેન્ટનો સમય ૨૦ મિનિટ આગળ ખસેડવામાં આવ્યો છે. કાઉન્ટર અધિકારીને સિસ્ટમ દ્વારા જાણ થઈ ગઈ છે જેથી તમારો વારો સ્કીપ નહીં થાય.",
      type: 'warning'
    });
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
  const handleCollectToken = (scheme: SchemeItem, verifiedDocs?: VerifiedDocumentItem[], meta?: SchemeBookingMeta) => {
    setActiveScheme(scheme);
    if (verifiedDocs && verifiedDocs.length > 0) {
      setUploadedDocsForBooking(verifiedDocs);
    }
    if (meta) {
      setBookingMetaForSlot(meta);
    }
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
      setLoginPromptReason(lang === 'en' ? `🔒 Citizen identity check is required to collect token for "${schemeTitle}".` : lang === 'hi' ? `🔒 "${schemeTitle}" का टोकન प्राप्त करने के लिए नागरिक पहचान सत्यापन आवश्यक है।` : `🔒 "${schemeTitle}" નો કચેરી ટોકન કલેક્ટ કરવા માટે નાગરિક ઓળખ ચકાસણી જરૂરી છે.`);
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

  // Gate Kiosk Check-In Simulation (Stage 1 -> Stage 2)
  const handleGateCheckin = (targetBooking: BookingDetails) => {
    triggerHaptic('success');
    const updated: BookingDetails = {
      ...targetBooking,
      currentStage: 2
    };
    setActiveBooking(prev => (prev && prev.tokenNumber === targetBooking.tokenNumber ? updated : prev));
    setBookingHistory(prev => {
      const list = prev.map(b => (b.tokenNumber === targetBooking.tokenNumber ? updated : b));
      try { localStorage.setItem('qless_booking_history', JSON.stringify(list)); } catch {}
      return list;
    });
    setTrackedBooking(updated);
    try { localStorage.setItem('qless_active_booking', JSON.stringify(updated)); } catch {}
    speakGuidance(
      lang === 'hi' 
        ? "कार्यालय गेट चेक-इन सफल! आपकी उपस्थिति दर्ज हो गई है। कृपया टोकन पुकारे जाने की प्रतीक्षा करें।" 
        : "કચેરી ગેટ કિઓસ્ક ચેક-ઇન સફળ! તમારી હાજરી નોંધાઈ ગઈ છે. કાઉન્ટર પર ટોકન કોલની રાહ જુઓ.", 
      lang
    );
    setToastNotification({
      title: "🏛️ કચેરી ગેટ ચેક-ઇન સફળ!",
      message: `${targetBooking.tokenNumber} ની રૂબરૂ હાજરી નોંધાઈ છે. તમારી કતાર સ્થિતિ સક્રિય થઈ ગઈ છે.`,
      type: "success"
    });
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
    setBookingHistory(prev => {
      const updated = [details, ...prev.filter(b => b.tokenNumber !== details.tokenNumber)];
      try { localStorage.setItem('qless_booking_history', JSON.stringify(updated)); } catch {}
      return updated;
    });
    setSlotModalOpen(false);
    setCurrentUser(prev => prev ? {
      ...prev,
      name: getCitizenDisplayName(lang, prev.name),
      role: getCitizenRole(lang, prev.role),
      area: lang === 'en' ? `${details.taluka.nameEn || details.taluka.nameGu}, ${details.district.nameEn || details.district.nameGu}` : `${details.taluka.nameGu}, ${details.district.nameGu}`,
      token: details.tokenNumber
    } : {
      name: getCitizenDisplayName(lang),
      role: getCitizenRole(lang),
      area: lang === 'en' ? `${details.taluka.nameEn || details.taluka.nameGu}, ${details.district.nameEn || details.district.nameGu}` : `${details.taluka.nameGu}, ${details.district.nameGu}`,
      token: details.tokenNumber
    });
    setTokenPassModalOpen(true);
    setView('dashboard');
  };

  return (
    <div className={`flex-1 flex flex-col min-h-screen bg-[#F5F7FA] text-[#1F2937] ${isStandaloneApp ? "pb-20 md:pb-0" : "pb-0"} w-full`}>
      {/* 🚀 LIVE GUJARAT GOVERNMENT TELEMETRY & SYSTEM HEALTH MARQUEE (CPU, RAM, UPTIME, SERVER HEALTH) */}
      <GovTelemetryMarquee lang={lang} />

      {/* TOP GOV-SERVICE BAR (Government-Service Visual Palette: Navy Blue #003366, Saffron #FF9933, India Green #138808) */}
      <header className="bg-[#003366] text-white text-xs border-b border-blue-900 sticky top-0 z-40">
        <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-12 h-9 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="flex items-center gap-1.5 font-semibold text-white text-[10px] sm:text-xs truncate">
              <span className="w-2 h-2 rounded-full bg-[#138808] animate-pulse shrink-0" />
              <span className="hidden sm:inline">{t('topBarStatusLive', lang)}</span>
              <span className="sm:hidden text-[9.5px] font-bold">{lang === 'gu' ? 'લાઈવ' : lang === 'hi' ? 'लाइव' : lang === 'mr' ? 'लाईव्ह' : 'Live'}</span>
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
              <span>{CURRENT_APP_VERSION} <span className="hidden xs:inline">{lang === 'gu' ? 'નવું શું છે?' : "What's New?"}</span></span>
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
                <span className="truncate max-w-[80px] xs:max-w-[125px] sm:max-w-none">
                  <span className="xs:hidden">{GUJARAT_LANGUAGES.find(l => l.code === lang)?.nativeLabel || 'ગુજરાતી'}</span>
                  <span className="hidden xs:inline">{GUJARAT_LANGUAGES.find(l => l.code === lang)?.multiLabel || 'ગુજરાતી (Gujarati)'}</span>
                </span>
                <ChevronDown className={`w-3 h-3 text-blue-200 transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {langMenuOpen && (
                <>
                  {/* MOBILE BOTTOM SHEET DRAWER (Slides up from the bottom on mobile screens) */}
                  <div 
                    onClick={() => setLangMenuOpen(false)}
                    className="md:hidden fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-end justify-center animate-in fade-in duration-200"
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
                      <div className="p-4 pb-8 overflow-y-auto max-h-[75vh] space-y-2 overscroll-contain">
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
          <button onClick={() => setView('landing')} className="flex items-center gap-2 sm:gap-3 cursor-pointer min-w-0">
            <GovLogo className="w-8 h-8 sm:w-11 sm:h-11 shrink-0 drop-shadow-md" />
            <div className="text-left min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-xl tracking-tight text-[#003366] leading-none truncate">{t('appTitle', lang)}</span>
                <span className="text-[9px] sm:text-[10px] bg-amber-100 text-amber-800 border border-amber-300 px-1 py-0.5 rounded font-extrabold shrink-0">{t('appTag', lang)}</span>
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
                className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl cursor-pointer transition select-none group min-w-0"
                title={lang === 'gu' ? 'આધાર પ્રોફાઇલ અને પરિવાર વિગતો ખોલો' : 'Open Aadhaar Profile & Family Vault'}
              >
                <div className="text-left text-xs leading-none min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[9px] font-extrabold px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      <span className="hidden xs:inline">{lang === 'gu' ? 'પ્રમાણિત નાગરિક' : lang === 'hi' ? 'सत्यापित नागरिक' : lang === 'mr' ? 'सत्यापित नागरिक' : 'Verified Citizen'}</span>
                    </span>
                    <p className="font-extrabold text-[#003366] text-xs sm:text-sm group-hover:text-[#005A9C] truncate max-w-[70px] xs:max-w-[120px] sm:max-w-none">
                      {getCitizenDisplayName(lang, currentUser?.name)}
                    </p>
                  </div>
                  <p className="text-[9px] text-[#005A9C] font-bold hidden sm:block mt-0.5 whitespace-nowrap">
                    {getCitizenRoleArea(lang, currentUser?.area, currentUser?.role)}
                  </p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    resetSession();
                  }} 
                  title={lang === 'gu' ? 'લૉગઆઉટ / સેશન રીસેટ' : 'Logout / Reset Session'}
                  className="ml-0.5 text-slate-400 hover:text-red-500 text-xs p-1 cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* 📱 MOBILE HAMBURGER MENU BUTTON (SHOWN IN REGULAR BROWSER; IN INSTALLED PWA APP, BOTTOM NAV IS USED) */}
            {!isStandaloneApp && (
              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setMobileMenuOpen(!mobileMenuOpen);
                }}
                aria-label={mobileMenuOpen ? "નેવિગેશન મેનુ બંધ કરો" : "નેવિગેશન મેનુ ખોલો"}
                className={`md:hidden p-2 rounded-xl border transition active:scale-95 cursor-pointer flex items-center justify-center shrink-0 ${
                  mobileMenuOpen 
                    ? 'bg-amber-500 text-slate-900 border-amber-600 shadow-sm' 
                    : 'bg-slate-100 hover:bg-slate-200 text-[#003366] border-slate-200 shadow-2xs'
                }`}
                title="નેવિગેશન મેનુ / Navigation Menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-slate-950 font-black" />
                ) : (
                  <Menu className="w-5 h-5 text-[#003366]" />
                )}
              </button>
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

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#003366] tracking-tight leading-tight sm:leading-[1.15] break-words">
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

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1 text-xs text-slate-700 font-semibold">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>{t('heroTagDistricts', lang)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
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
                onOpenSlotModal={() => handleRequestSlotBooking()}
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
                  <p className="text-[11px] sm:text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#005A9C] shrink-0" />
                    <span>{t('statLiveTokens', lang)}</span>
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#003366] mt-1">12,483</h3>
                  <p className="text-[10px] sm:text-[11px] text-emerald-800 font-bold mt-0.5">{t('todayGrowth', lang)}</p>
                </div>

                <div className="bg-[#F5F7FA] border border-slate-200 rounded-xl sm:rounded-2xl p-3.5 sm:p-5">
                  <p className="text-[11px] sm:text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#FF9933] shrink-0" />
                    <span>{t('statAvgWait', lang)}</span>
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#003366] mt-1">14 min</h3>
                  <p className="text-[10px] sm:text-[11px] text-emerald-800 font-bold mt-0.5">{t('vsWalkin', lang)}</p>
                </div>

                <div className="bg-[#F5F7FA] border border-slate-200 rounded-xl sm:rounded-2xl p-3.5 sm:p-5">
                  <p className="text-[11px] sm:text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>{t('statActiveKacheris', lang)}</span>
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#003366] mt-1">250+</h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-600 font-semibold mt-0.5">{t('statAllDistricts', lang)}</p>
                </div>

                <div className="bg-[#F5F7FA] border border-slate-200 rounded-xl sm:rounded-2xl p-3.5 sm:p-5">
                  <p className="text-[11px] sm:text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#FF9933] shrink-0" />
                    <span>{t('statGrtsaSla', lang)}</span>
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-black text-[#003366] mt-1">99.8%</h3>
                  <p className="text-[10px] sm:text-[11px] text-emerald-800 font-bold mt-0.5">{t('statTimeBound', lang)}</p>
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
                        <span>{getCitizenDisplayName(lang, currentUser?.name)}</span>
                        <span className="text-[9px] bg-blue-100 text-[#005A9C] font-mono px-1 py-0.2 rounded font-bold">UID</span>
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium whitespace-nowrap">{getCitizenRoleArea(lang, currentUser?.area, currentUser?.role)}</p>
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
                      {getCitizenDisplayName(lang, currentUser?.name)} • {activeBooking.tokenNumber}
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
                      {t('loggedInNoBookingTitle', lang)}, {getCitizenDisplayName(lang, currentUser?.name)}!
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

                      {/* 🏛️ SPECIFIC SCHEME & BENEFICIARY BADGE */}
                      <div className="mt-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/90 rounded-2xl p-3 text-center space-y-1.5 shadow-2xs">
                        <span className="text-[10px] font-extrabold text-[#005A9C] uppercase tracking-wider block">
                          🏛️ સત્તાવાર સરકારી સેવા / યોજના
                        </span>
                        <h3 className="text-xs sm:text-sm font-black text-[#003366] leading-tight">
                          {activeBooking.schemeTitleGu || (lang === 'en' ? (activeBooking.schemeTitleEn || 'જન સેવા પ્રમાણપત્ર') : 'જન સેવા પ્રમાણપત્ર')}
                        </h3>
                        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-0.5">
                          {activeBooking.beneficiaryNameGu && (
                            <span className="text-[10px] sm:text-[10.5px] font-bold bg-white text-slate-800 px-2.5 py-0.5 rounded-full border border-blue-200 shadow-2xs">
                              👤 અરજદાર: {activeBooking.beneficiaryNameGu} {activeBooking.beneficiaryRelation ? `(${activeBooking.beneficiaryRelation})` : ''}
                            </span>
                          )}
                          <span className={`text-[10px] sm:text-[10.5px] font-bold px-2 py-0.5 rounded-full border shadow-2xs ${
                            activeBooking.applicationType === 'UPDATE' 
                              ? 'bg-amber-100 text-amber-900 border-amber-300' 
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}>
                            {activeBooking.applicationType === 'UPDATE' ? '🔄 સુધારો / અપડેટ' : '🆕 નવી અરજી'}
                          </span>
                          {activeBooking.date && (
                            <span className="text-[10px] sm:text-[10.5px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200">
                              📅 {activeBooking.date}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 📷 AUTHENTIC HIGH-RES SCANNABLE QR CODE FOR ACTIVE BOOKING */}
                    <div className="py-2 flex justify-center">
                      <AuthenticQrCode
                        payload={`https://queueless.gujarat.gov.in/verify?token=${encodeURIComponent(activeBooking.tokenNumber)}&citizen=${encodeURIComponent(getCitizenDisplayName(lang, currentUser?.name))}&office=RajkotGondal&sig=QL-GUJ-8F3A29`}
                        tokenId={activeBooking.tokenNumber}
                        size={180}
                        label={lang === 'gu' ? 'સત્તાવાર સુરક્ષિત QR ટોકન' : lang === 'hi' ? 'आधिकारिक सुरक्षित QR टोकन' : lang === 'mr' ? 'अधिकृत सुरक्षित QR टोकन' : 'Official Secure QR Token'}
                        subLabel={lang === 'gu' ? `કચેરી ગેટ અથવા કાઉન્ટર ${activeBooking.counterNumber} પર સ્કેન કરો` : `Scan at Kacheri Gate or Desk ${activeBooking.counterNumber}`}
                      />
                    </div>

                    {/* 🔍 Interactive 5-Stage Kundli Tracking CTA Button */}
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('tap');
                        setTrackedBooking(activeBooking);
                        setTrackingModalOpen(true);
                      }}
                      className="w-full bg-gradient-to-r from-emerald-600 via-green-600 to-[#138808] hover:from-emerald-700 hover:to-emerald-800 text-white font-black py-3 px-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer ring-2 ring-emerald-400/30"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
                      <span className="truncate">🔍 લાઈવ કુંડળી & ૫-સ્ટેજ ટ્રેકિંગ જુઓ (Track Live Kundli)</span>
                    </button>

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
                          const citizenName = getCitizenDisplayName(lang, currentUser?.name);
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
                          onClick={() => handleRequestSlotBooking()}
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
                          onClick={() => handleRequestSlotBooking()}
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

                {/* 📜 CITIZEN BOOKING HISTORY & 5-STAGE LIFECYCLE TRACKER (કુંડળી) */}
                <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3.5">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-sm shadow-2xs">
                        📜
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-[#003366]">
                          {lang === 'en' ? 'Slot Booking History & Kundli Tracker' : 'બુકિંગ ઇતિહાસ & લાઈવ કુંડળી (Timeline)'}
                        </h4>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {lang === 'en' ? 'Track 5-stage kacheri lifecycle' : 'તમામ સ્લોટ અને કચેરી પ્રક્રિયા ૫-સ્ટેજ ટ્રેકિંગ'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      {bookingHistory.length > 0 ? bookingHistory.length : (activeBooking ? 1 : 0)} {lang === 'en' ? 'Slots' : 'સ્લોટ્સ'}
                    </span>
                  </div>

                  {/* History List */}
                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {(bookingHistory.length > 0 ? bookingHistory : (activeBooking ? [activeBooking] : [])).map((item, idx) => {
                      const stage = item.currentStage || (item.status === 'COMPLETED' ? 5 : 1);
                      const stageLabelGu = 
                        stage === 5 ? 'સ્ટેજ ૫: મંજૂર & સર્ટિ જારી' :
                        stage === 4 ? 'સ્ટેજ ૪: કચેરીએ અસલ દસ્તાવેજ જમા' :
                        stage === 3 ? 'સ્ટેજ ૩: કાઉન્ટર પર હાજર' :
                        stage === 2 ? 'સ્ટેજ ૨: કચેરી ગેટ ચેક-ઇન' :
                        'સ્ટેજ ૧: સ્લોટ કન્ફર્મ';

                      return (
                        <div 
                          key={idx}
                          className="p-3 rounded-2xl border border-slate-200 bg-[#F9FAFB] hover:bg-white hover:border-indigo-300 transition shadow-2xs space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-mono font-black text-[#FF9933] bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                                {item.tokenNumber}
                              </span>
                              <h5 className="text-xs font-black text-slate-900 mt-1 leading-snug truncate">
                                {item.schemeTitleGu || (lang === 'en' ? (item.schemeTitleEn || 'જન સેવા પ્રમાણપત્ર') : 'જન સેવા પ્રમાણપત્ર')}
                              </h5>
                              <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                                👤 {item.beneficiaryNameGu || 'હરિ પટેલ'} {item.beneficiaryRelation ? `(${item.beneficiaryRelation})` : ''} • {item.applicationType === 'UPDATE' ? '🔄 સુધારો' : '🆕 નવી અરજી'}
                              </p>
                            </div>

                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border shrink-0 ${
                              stage >= 4 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                                : stage === 3 
                                ? 'bg-blue-50 text-blue-800 border-blue-300'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}>
                              {stageLabelGu}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-200/60">
                            <span>📅 {item.date} • ⏱️ {item.slot?.startTime || '૧૧:૦૦ AM'}</span>
                            <button
                              type="button"
                              onClick={() => {
                                triggerHaptic('tap');
                                setTrackedBooking(item);
                                setTrackingModalOpen(true);
                              }}
                              className="text-[#005A9C] hover:text-[#003366] font-extrabold flex items-center gap-1 cursor-pointer hover:underline"
                            >
                              <span>કુંડળી જુઓ</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {bookingHistory.length === 0 && !activeBooking && (
                      <div className="text-center py-6 text-slate-400 text-xs space-y-1">
                        <p>કોઈ અગાઉના સ્લોટ બુકિંગ ઉપલબ્ધ નથી.</p>
                        <button
                          type="button"
                          onClick={() => handleRequestSlotBooking()}
                          className="text-[#005A9C] font-bold text-xs hover:underline cursor-pointer"
                        >
                          + નવો સ્લોટ બુક કરો
                        </button>
                      </div>
                    )}
                  </div>
                </div>

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
                          <span className="text-[10px] font-bold text-slate-600 font-semibold mt-0.5">{t('capacityText', lang)}</span>
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
        uploadedDocs={uploadedDocsForBooking}
        beneficiaryMeta={bookingMetaForSlot || undefined}
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
              citizenName={getCitizenDisplayName(lang, currentUser?.name)}
              onClose={() => setTokenPassModalOpen(false)}
              lang={lang}
            />
          </div>
        </div>
      )}

      {/* 🚀 5-STAGE INTERACTIVE LIFECYCLE TIMELINE MODAL (કુંડળી & ટ્રેકિંગ) */}
      {trackingModalOpen && trackedBooking && (() => {
        const stage = trackedBooking.currentStage || (trackedBooking.status === 'COMPLETED' ? 5 : 1);
        const stagesList = [
          {
            num: 1,
            titleGu: 'સ્લોટ બુકિંગ & સત્તાવાર QR પાસ જનરેટ',
            titleEn: 'Slot Confirmed & Signed QR Pass Generated',
            descGu: 'તારીખ અને સમય સ્લોટ આરક્ષિત, ડિજિટલી સાઈન થયેલ અધિકૃત QR પાસ જનરેટ.',
            icon: '🎫',
            isDone: stage >= 1,
            isCurrent: stage === 1
          },
          {
            num: 2,
            titleGu: 'કચેરી આગમન & ગેટ કિઓસ્ક QR ચેક-ઇન',
            titleEn: 'Kacheri Arrival & Gate Kiosk Check-In',
            descGu: 'કચેરી પરિસર ગેટ પર કિઓસ્ક સ્કેનર પર QR સ્કેન કરી રૂબરૂ હાજરી નોંધણી.',
            icon: '🏛️',
            isDone: stage >= 2,
            isCurrent: stage === 2,
            canAction: stage === 1
          },
          {
            num: 3,
            titleGu: `કાઉન્ટર ${trackedBooking.counterNumber} પર ટોકન કોલ & રૂબરૂ હાજરી`,
            titleEn: `Counter ${trackedBooking.counterNumber} Calling & Presence`,
            descGu: `${trackedBooking.counterNameGu || 'સત્તાવાર કાઉન્ટર'} પર નાયબ મામલતદાર દ્વારા લાઈવ ડિજિટલ ટોકન કોલિંગ.`,
            icon: '📢',
            isDone: stage >= 3,
            isCurrent: stage === 3
          },
          {
            num: 4,
            titleGu: 'અસલ દસ્તાવેજો કચેરીએ જમા & અધિકારી ભૌતિક ચકાસણી',
            titleEn: 'Original Documents Submission & Officer Physical Verification',
            descGu: 'કાઉન્ટર પર અસલ પ્રમાણપત્રોની ભૌતિક ચકાસણી, મોહર/સહી વેરીફિકેશન અને સત્તાવાર જમા.',
            icon: '📑',
            isDone: stage >= 4,
            isCurrent: stage === 4,
            detail: trackedBooking.documentSubmissionStatus === 'submitted_at_counter'
              ? '✓ અસલ દસ્તાવેજો કચેરીએ સફળતાપૂર્વક જમા લેવાયેલ છે • અધિકારી ચકાસણી પૂર્ણ'
              : 'કાઉન્ટર પર અસલ દસ્તાવેજો રૂબરૂ રજૂ કરી સત્તાવાર જમા કરાવવા જરૂરી'
          },
          {
            num: 5,
            titleGu: 'સત્તાવાર મંજૂરી ઓર્ડર / ડિજિટલ પ્રમાણપત્ર જારી',
            titleEn: 'Official Approval Order & Digitally Signed Certificate',
            descGu: 'નાયબ મામલતદાર દ્વારા SHA-256 ડિજિટલ સહી સાથે મંજૂરી હુકમ અને ઈ-સર્ટિફિકેટ જારી.',
            icon: '🏆',
            isDone: stage >= 5,
            isCurrent: stage === 5
          }
        ];

        return (
          <div 
            onClick={() => setTrackingModalOpen(false)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 modal-backdrop animate-in fade-in duration-200"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border-2 border-indigo-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
            >
              {/* Modal Header */}
              <div className="bg-[#003366] text-white p-4 sm:p-5 flex items-start justify-between">
                <div className="flex items-start gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl shrink-0 border border-white/20">
                    📜
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                      સત્તાવાર નાગરિક સેવા લાઈવ કુંડળી (Lifecycle Tracker)
                    </span>
                    <h3 className="text-base sm:text-lg font-black leading-tight mt-0.5">
                      {trackedBooking.schemeTitleGu || (lang === 'en' ? (trackedBooking.schemeTitleEn || 'જન સેવા પ્રમાણપત્ર') : 'જન સેવા પ્રમાણપત્ર')}
                    </h3>
                    <p className="text-xs text-blue-200 mt-1 flex flex-wrap items-center gap-2">
                      <span className="font-mono font-black text-amber-300 bg-black/30 px-2 py-0.5 rounded-md">
                        {trackedBooking.tokenNumber}
                      </span>
                      <span>•</span>
                      <span>👤 અરજદાર: {trackedBooking.beneficiaryNameGu || 'હરિ પટેલ'} {trackedBooking.beneficiaryRelation ? `(${trackedBooking.beneficiaryRelation})` : ''}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTrackingModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body: 5-Stage Interactive Roadmap */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
                {/* Meta Summary Badge */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold">કચેરી & કાઉન્ટર</span>
                    <span className="font-bold text-[#003366]">
                      {trackedBooking.taluka?.officeNameGu || 'મામલતદાર કચેરી, ગોંડલ'} • કાઉન્ટર {trackedBooking.counterNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold">તારીખ & સમય</span>
                    <span className="font-mono font-bold text-slate-800">
                      📅 {trackedBooking.date} • {trackedBooking.slot?.startTime || '૧૧:૦૦ AM'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-bold">અરજીનો પ્રકાર</span>
                    <span className={`font-black px-2 py-0.5 rounded-full text-[10px] border ${
                      trackedBooking.applicationType === 'UPDATE'
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    }`}>
                      {trackedBooking.applicationType === 'UPDATE' ? '🔄 સુધારો / અપડેટ' : '🆕 નવી અરજી'}
                    </span>
                  </div>
                </div>

                {/* 5 Stages Vertical Roadmap */}
                <div className="space-y-3 pt-1">
                  {stagesList.map((st) => (
                    <div 
                      key={st.num}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition relative ${
                        st.isCurrent
                          ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-400/30 shadow-xs'
                          : st.isDone
                          ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                          : 'bg-slate-50/60 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 shadow-2xs ${
                          st.isDone 
                            ? 'bg-emerald-600 text-white' 
                            : st.isCurrent
                            ? 'bg-[#003366] text-white animate-pulse'
                            : 'bg-slate-200 text-slate-500'
                        }`}>
                          {st.isDone ? '✓' : st.num}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                              {st.titleGu}
                            </h4>
                            <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-full border shrink-0 ${
                              st.isDone
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : st.isCurrent
                                ? 'bg-amber-500 text-slate-950 font-black border-amber-500 animate-pulse'
                                : 'bg-slate-200 text-slate-600 border-slate-300'
                            }`}>
                              {st.isDone ? 'પૂર્ણ (Done)' : st.isCurrent ? 'ચાલુ (Live)' : 'પ્રતીક્ષારત'}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                            {st.descGu}
                          </p>

                          {st.detail && (
                            <div className="mt-2 p-2 bg-white/80 rounded-xl border border-slate-200 text-[10.5px] font-bold text-slate-700 flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{st.detail}</span>
                            </div>
                          )}

                          {/* Action Button for Stage 2 Gate Check-in Simulation */}
                          {st.canAction && (
                            <div className="mt-2.5 pt-2 border-t border-slate-200/80">
                              <button
                                type="button"
                                onClick={() => handleGateCheckin(trackedBooking)}
                                className="bg-[#003366] hover:bg-[#002244] text-white font-black py-2 px-3 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                              >
                                <span>📍</span>
                                <span>કચેરી ગેટ કિયોસ્ક ચેક-ઇન કરો (Arrival Check-In)</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Statutory Guarantee Banner */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[10.5px] text-slate-600 flex items-center justify-between">
                  <span className="font-bold">સત્તાવાર અધિકાર પત્ર: GRTSA ૨૦૧૩</span>
                  <span className="text-emerald-700 font-bold">નાયબ મામલતદાર રજીસ્ટ્રાર પ્રમાણિત</span>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setTrackingModalOpen(false)}
                  className="bg-[#003366] text-white font-bold px-5 py-2.5 rounded-xl text-xs hover:bg-[#002244] transition cursor-pointer"
                >
                  બંધ કરો (Close)
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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
        onBookSlot={() => {
          setTokenTrackerModalOpen(false);
          handleRequestSlotBooking();
        }}
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

      {/* MOBILE BOTTOM NAVIGATION REMOVED PER STRICT USER INSTRUCTION (All navigation accessed via Header Hamburger Menu) */}

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 text-center">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 space-y-2 flex flex-col items-center">
          <GovLogo className="w-12 h-12 mb-1 drop-shadow-sm" />
          <p className="font-bold text-[#003366]">{t('footerDisclaimer', lang)}</p>
          <p className="text-[11px] text-slate-600 font-medium">
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

      {/* 📱 MOBILE BOTTOM NAVIGATION BAR: ONLY DISPLAYED IN INSTALLED PWA APP MODE, NOT IN REGULAR MOBILE BROWSER */}
      {isStandaloneApp && (
        <nav 
          aria-label="Mobile Bottom Navigation"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 pt-1.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] px-3 flex items-center justify-around shadow-lg"
        >
          {/* 1. Home */}
          <button
            onClick={() => {
              triggerHaptic('tap');
              setView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold min-h-[44px] justify-center transition active:scale-95 focus-visible:ring-2 focus-visible:ring-[#005A9C] rounded-lg px-2 cursor-pointer ${
              view === 'landing' ? 'text-[#005A9C]' : 'text-slate-500 hover:text-slate-700'
            }`}
            aria-label={t('mobNavHome', lang)}
          >
            <HomeIcon className="w-4 h-4" />
            <span>{t('mobNavHome', lang)}</span>
          </button>

          {/* 2. Services */}
          <button
            onClick={() => {
              triggerHaptic('tap');
              setView('services');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold min-h-[44px] justify-center transition active:scale-95 focus-visible:ring-2 focus-visible:ring-[#005A9C] rounded-lg px-2 cursor-pointer ${
              view === 'services' ? 'text-[#005A9C]' : 'text-slate-500 hover:text-slate-700'
            }`}
            aria-label={t('mobNavServices', lang)}
          >
            <Layers className="w-4 h-4" />
            <span>{t('mobNavServices', lang)}</span>
          </button>

          {/* 3. Center Elevated Token Pass / Tracker */}
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
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold min-h-[44px] justify-center transition active:scale-95 focus-visible:ring-2 focus-visible:ring-[#005A9C] rounded-lg px-2 cursor-pointer ${
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

          {/* 4. Queue Radar / Timeline */}
          <button
            onClick={() => {
              triggerHaptic('tap');
              setView('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold min-h-[44px] justify-center transition active:scale-95 focus-visible:ring-2 focus-visible:ring-[#005A9C] rounded-lg px-2 cursor-pointer ${
              view === 'dashboard' ? 'text-[#005A9C]' : 'text-slate-500 hover:text-slate-700'
            }`}
            aria-label={t('mobNavRadar', lang)}
          >
            <Radio className="w-4 h-4" />
            <span>{t('mobNavRadar', lang)}</span>
          </button>

          {/* 5. Menu Drawer */}
          <button
            onClick={() => {
              triggerHaptic('tap');
              setMobileMenuOpen(true);
            }}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-bold min-h-[44px] justify-center transition active:scale-95 focus-visible:ring-2 focus-visible:ring-[#005A9C] rounded-lg px-2 cursor-pointer ${
              mobileMenuOpen ? 'text-[#005A9C]' : 'text-slate-500 hover:text-slate-700'
            }`}
            aria-label={t('mobNavMenu', lang)}
          >
            <Menu className="w-4 h-4" />
            <span>{t('mobNavMenu', lang)}</span>
          </button>
        </nav>
      )}

        {/* 📱 MOBILE HAMBURGER SLIDE-OVER DRAWER */}
        {mobileMenuOpen && (
          <div
            onClick={() => {
              triggerHaptic('tap');
              setMobileMenuOpen(false);
            }}
            className="md:hidden fixed inset-0 z-[250] bg-black/80 backdrop-blur-sm flex justify-end modal-backdrop animate-in fade-in duration-200"
            style={{ overscrollBehavior: 'contain', touchAction: 'pan-y' }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-md h-full h-[100dvh] bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 text-slate-800"
            >
              {/* Drawer Header - Sticky at top with high-contrast red close button */}
              <div className="bg-gradient-to-r from-[#003366] via-[#004080] to-[#002244] text-white px-4 py-3 sm:px-5 sm:py-3.5 flex items-center justify-between border-b-2 border-[#FF9933] shrink-0 shadow-md sticky top-0 z-20">
                <div className="flex items-center gap-2.5 min-w-0">
                  <GovLogo className="w-9 h-9 sm:w-10 sm:h-10 drop-shadow-md shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm sm:text-base font-black text-white truncate">QueueLess કચેરી</span>
                      <span className="text-[9px] bg-amber-400 text-slate-900 font-extrabold px-1.5 py-0.2 rounded shrink-0">ગુજરાત</span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-blue-200 font-medium truncate">
                      {lang === 'gu' ? 'જન સેવા નેવિગેશન મેનુ' : lang === 'hi' ? 'जन सेवा नेविगेशन मेनू' : 'Jan Seva Navigation Menu'}
                    </p>
                  </div>
                </div>
                
                {/* Clean Simple Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('tap');
                    setMobileMenuOpen(false);
                  }}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center transition border border-white/20 cursor-pointer shrink-0"
                  aria-label={lang === 'gu' ? 'મેનુ બંધ કરો' : 'Close navigation menu'}
                  title={lang === 'gu' ? 'મેનુ બંધ કરો' : 'Close navigation menu'}
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Drawer Scrollable Body */}
              <div className="flex-1 overflow-y-auto modal-scroll-area p-4 space-y-4 overscroll-contain touch-pan-y">
                
                {/* 1. ACTIVE TOKEN PASS PROMINENT BANNER (IF BOOKED) */}
                {activeBooking && (
                  <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/20 border-2 border-[#FF9933] rounded-2xl p-3.5 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1">
                        <Ticket className="w-3.5 h-3.5 text-[#FF9933]" />
                        <span>{lang === 'gu' ? 'તમારો સક્રિય ટોકન પાસ' : lang === 'hi' ? 'आपका सक्रिय टोकन पास' : 'Your Active Token Pass'}</span>
                      </span>
                      <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse">
                        {lang === 'gu' ? 'લાઇવ સક્રિય' : lang === 'hi' ? 'लाइव सक्रिय' : 'Active'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-black font-mono text-[#003366]">
                          {activeBooking.tokenNumber}
                        </p>
                        <p className="text-[11px] font-bold text-slate-800 line-clamp-1">
                          {lang === 'gu' ? `કાઉન્ટર ${activeBooking.counterNumber} • ${activeBooking.counterNameGu || activeBooking.counterNameEn}` : `Counter ${activeBooking.counterNumber} • ${activeBooking.counterNameEn || activeBooking.counterNameGu}`}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {activeBooking.slot?.timeRange}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        triggerHaptic('tap');
                        setMobileMenuOpen(false);
                        setTokenPassModalOpen(true);
                      }}
                      className="w-full py-2 px-3 bg-[#003366] hover:bg-[#002244] text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <Ticket className="w-3.5 h-3.5 text-[#FF9933]" />
                      <span>{lang === 'gu' ? 'સત્તાવાર ડિજિટલ ટોકન પાસ જુઓ' : lang === 'hi' ? 'आधिकारिक डिजिटल टोकन पास देखें' : 'View Official Digital Token Pass'}</span>
                    </button>
                  </div>
                )}

                {/* 2. CITIZEN IDENTITY / LOGIN SECTION */}
                {currentUser ? (
                  <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#003366] text-white flex items-center justify-center font-black text-xs shrink-0">
                          {currentUser.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-xs text-[#003366] truncate">{currentUser.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">આધાર: XXXX-XXXX-8842</p>
                        </div>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        <span>{lang === 'gu' ? 'પ્રમાણિત' : 'Verified'}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-blue-200/60">
                      <button
                        onClick={() => {
                          triggerHaptic('tap');
                          setMobileMenuOpen(false);
                          setCitizenProfileModalOpen(true);
                        }}
                        className="py-1.5 px-2 bg-white hover:bg-slate-50 text-[#003366] border border-slate-200 rounded-lg text-[10.5px] font-bold flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <Users className="w-3 h-3 text-[#005A9C]" />
                        <span>{lang === 'gu' ? 'પ્રોફાઇલ જુઓ' : lang === 'hi' ? 'प्रोफाइल देखें' : 'View Profile'}</span>
                      </button>
                      <button
                        onClick={() => {
                          triggerHaptic('tap');
                          resetSession();
                          setMobileMenuOpen(false);
                        }}
                        className="py-1.5 px-2 bg-white hover:bg-red-50 text-red-600 border border-slate-200 rounded-lg text-[10.5px] font-bold flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>{lang === 'gu' ? 'લૉગઆઉટ' : lang === 'hi' ? 'लॉगआउट' : 'Logout'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
                    <p className="text-[11px] font-extrabold text-slate-700">
                      {lang === 'gu' ? 'પોર્ટલ લૉગિન પસંદ કરો' : lang === 'hi' ? 'पोर्टल लॉगिन चुनें' : 'Select Portal Login'}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => {
                          triggerHaptic('tap');
                          setMobileMenuOpen(false);
                          setAuthModalTab('citizen');
                          setAuthModalOpen(true);
                        }}
                        className="py-2 px-2 bg-[#005A9C] hover:bg-[#003366] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{lang === 'gu' ? 'નાગરિક લૉગિન' : lang === 'hi' ? 'नागरिक लॉगिन' : 'Citizen Login'}</span>
                      </button>
                      <Link
                        href="/admin/counter"
                        onClick={() => setMobileMenuOpen(false)}
                        className="py-2 px-2 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Building className="w-3.5 h-3.5" />
                        <span>{lang === 'gu' ? 'અધિકારી પોર્ટલ' : lang === 'hi' ? 'अधिकारी पोर्टल' : 'Officer Portal'}</span>
                      </Link>
                    </div>
                  </div>
                )}

                {/* 3. MAIN NAVIGATION MENU OPTIONS */}
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1 mb-1.5">
                    {lang === 'gu' ? 'મુખ્ય સેવાઓ & સુવિધાઓ' : lang === 'hi' ? 'मुख्य सेवाएं एवं सुविधाएं' : 'Main Services & Portals'}
                  </p>

                  {/* 1. હોમ પેજ (Home) */}
                  <button
                    onClick={() => {
                      triggerHaptic('tap');
                      setView('landing');
                      setMobileMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full text-left p-3 rounded-2xl transition flex items-center justify-between cursor-pointer ${
                      view === 'landing' ? 'bg-blue-50 text-[#003366] font-black border border-blue-200 shadow-2xs' : 'hover:bg-slate-50 text-slate-700 font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${view === 'landing' ? 'bg-[#003366] text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <HomeIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs leading-tight">{t('navHome', lang)}</p>
                        <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                          {lang === 'gu' ? 'મુખ્ય પોર્ટલ અને ઝડપી સેવાઓ' : lang === 'hi' ? 'मुख्य पोर्टल व त्वरित सेवाएं' : 'Main portal & quick access'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* 2. સેવાઓ (૩૯ યોજનાઓ) */}
                  <button
                    onClick={() => {
                      triggerHaptic('tap');
                      setView('services');
                      setMobileMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full text-left p-3 rounded-2xl transition flex items-center justify-between cursor-pointer ${
                      view === 'services' ? 'bg-blue-50 text-[#003366] font-black border border-blue-200 shadow-2xs' : 'hover:bg-slate-50 text-slate-700 font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${view === 'services' ? 'bg-[#003366] text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs leading-tight">{t('navServices', lang)}</p>
                          <span className="text-[9px] bg-[#FF9933] text-slate-900 px-1.5 py-0.2 rounded-full font-black">૩૯</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                          {lang === 'gu' ? 'તમામ ૩૯ સરકારી યોજનાઓ અને ફોર્મ્સ' : lang === 'hi' ? 'सभी ३९ सरकारी योजनाएं व फॉर्म' : 'All 39 Govt Schemes & Forms'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* 3. કચેરી રડાર & લાઈવ વેઇટિંગ */}
                  <button
                    onClick={() => {
                      triggerHaptic('tap');
                      setIsRadarLoading(true);
                      setTimeout(() => setIsRadarLoading(false), 240);
                      setView('dashboard');
                      setMobileMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full text-left p-3 rounded-2xl transition flex items-center justify-between cursor-pointer ${
                      view === 'dashboard' ? 'bg-blue-50 text-[#003366] font-black border border-blue-200 shadow-2xs' : 'hover:bg-slate-50 text-slate-700 font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${view === 'dashboard' ? 'bg-[#003366] text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Radio className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs leading-tight">{t('navRadar', lang)}</p>
                        <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                          {lang === 'gu' ? 'લાઈવ વેઇટિંગ સમય અને કતાર સ્થિતિ' : lang === 'hi' ? 'लाइव प्रतीक्षा समय व कतार स्थिति' : 'Live waiting times & queue radar'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* 4. ટોકન ટ્રેક કરો */}
                  <button
                    onClick={() => {
                      triggerHaptic('tap');
                      setMobileMenuOpen(false);
                      setTokenTrackerModalOpen(true);
                    }}
                    className="w-full text-left p-3 rounded-2xl hover:bg-slate-50 transition flex items-center justify-between text-slate-700 font-bold cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#005A9C] flex items-center justify-center">
                        <Ticket className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs leading-tight">{t('navTrackToken', lang)}</p>
                        <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                          {lang === 'gu' ? 'તમારો ટોકન નંબર દાખલ કરી સ્થિતિ જુઓ' : lang === 'hi' ? 'टोकन संख्या डालकर स्थिति देखें' : 'Enter token number to check live status'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* 5. મદદ અને સહાય */}
                  <button
                    onClick={() => {
                      triggerHaptic('tap');
                      setMobileMenuOpen(false);
                      setHelpModalOpen(true);
                    }}
                    className="w-full text-left p-3 rounded-2xl hover:bg-slate-50 transition flex items-center justify-between text-slate-700 font-bold cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#FF9933] flex items-center justify-center">
                        <Headphones className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs leading-tight">{t('navHelp', lang)}</p>
                        <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                          {lang === 'gu' ? 'ટોલ-ફ્રી હેલ્પલાઇન અને સહાયતા' : lang === 'hi' ? 'टोल-फ्री हेल्पलाइन व सहायता' : 'Toll-free helpline & citizen support'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* 6. અધિકારી ડેસ્ક */}
                  <Link
                    href="/admin/counter"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-left p-3 rounded-2xl hover:bg-slate-50 transition flex items-center justify-between text-slate-700 font-bold cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs leading-tight">{t('navOfficerDesk', lang)}</p>
                        <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                          {lang === 'gu' ? 'કાઉન્ટર ૧ થી ૬ ઓપરેટર કન્સોલ' : lang === 'hi' ? 'काउंटर १ से ६ ऑपरेटर कंसोल' : 'Desk Counter 1-6 Operator Console'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </Link>

                  {/* 7. કલેક્ટર ડેશબોર્ડ */}
                  <Link
                    href="/admin/collector"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-left p-3 rounded-2xl hover:bg-amber-50 transition flex items-center justify-between text-amber-950 font-bold cursor-pointer border border-amber-200/80 bg-amber-50/40"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-950 flex items-center justify-center font-black">
                        👑
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs leading-tight">
                            {lang === 'gu' ? 'કલેક્ટર કમાન્ડ સેન્ટર' : lang === 'hi' ? 'कलेक्टर कमांड सेंटर' : 'Collector Apex Command'}
                          </p>
                          <span className="text-[9px] bg-amber-400 text-slate-900 px-1 py-0.2 rounded font-black">APEX</span>
                        </div>
                        <p className="text-[10px] text-amber-800 font-normal mt-0.5">
                          {lang === 'gu' ? '૩૩ જિલ્લા કલેક્ટર કમાન્ડ ડેશબોર્ડ' : lang === 'hi' ? '३३ जिला कलेक्टर कमांड डैशबोर्ड' : '33 Gujarat Districts Collector Apex'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-700" />
                  </Link>
                </div>

                {/* 4. LANGUAGE SELECTOR ROW */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#FF9933]" />
                    <span>{t('langDropdownTitle', lang)}</span>
                  </p>
                  <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
                    {GUJARAT_LANGUAGES.map((item) => (
                      <button
                        key={item.code}
                        onClick={() => {
                          handleSelectLang(item.code);
                          setMobileMenuOpen(false);
                        }}
                        className={`py-2 px-1 rounded-xl text-center transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                          lang === item.code ? 'bg-[#003366] text-white font-black shadow-xs' : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <span className="text-[11px] leading-tight">{item.nativeLabel}</span>
                        <span className="text-[9px] opacity-75">{item.englishLabel}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. APP VERSION & CHANGELOG */}
                <button
                  onClick={() => {
                    triggerHaptic('tap');
                    setMobileMenuOpen(false);
                    setUpdateModalOpen(true);
                  }}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs font-bold text-amber-950 cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>{CURRENT_APP_VERSION} {lang === 'gu' ? 'નવા અપડેટ્સ & ચેન્જલોગ' : "What's New & Updates"}</span>
                  </div>
                  <span className="text-[10px] bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full font-black">જુઓ ➔</span>
                </button>
              </div>

              {/* Drawer Footer */}
              <div className="bg-slate-50 p-3 sm:p-4 border-t border-slate-200 text-center space-y-0.5 shrink-0">
                <p className="text-[11px] font-black text-[#003366]">
                  📞 હેલ્પલાઇન: ૧૮૦૦-૨૩૩-૫૫૦૦ (ટોલ-ફ્રી)
                </p>
                <p className="text-[9.5px] text-slate-400">
                  ગુજરાત સરકાર • સામાન્ય વહીવટ વિભાગ • GRTSA માન્ય
                </p>
              </div>
            </div>
          </div>
        )}

      {/* 🚀 Floating In-App Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-[130] max-w-md w-full p-4 animate-in slide-in-from-bottom-5 fade-in duration-200 pointer-events-auto">
          <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-amber-400/40 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-extrabold text-amber-400 text-xs sm:text-sm">
                {toastNotification.title}
              </h4>
              <p className="text-slate-200 text-xs mt-0.5 leading-relaxed">
                {toastNotification.message}
              </p>
            </div>
            <button
              onClick={() => setToastNotification(null)}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
