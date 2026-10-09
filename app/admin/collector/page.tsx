'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building, ShieldCheck, MapPin, AlertTriangle, Users, Clock, 
  ArrowRight, FileText, CheckCircle2, ChevronRight, Download, 
  Printer, ArrowLeft, RefreshCw, BarChart3, TrendingUp, AlertCircle, 
  Send, Sparkles, Filter, ExternalLink, Activity, Award, Star,
  Lock, EyeOff, Check, Globe, ChevronDown
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { speakGuidance } from '@/lib/voice';
import { 
  GUJARAT_33_DISTRICTS, DistrictItem, TalukaOffice, 
  getLocalizedDistrictName, getLocalizedDistrictHq, 
  getLocalizedTalukaName, getLocalizedTalukaOffice, guToDeva 
} from '@/lib/jurisdiction-data';
import { GovLogo } from '@/components/GovLogo';
import { GovTelemetryMarquee } from '@/components/GovTelemetryMarquee';
import { Language, GUJARAT_LANGUAGES } from '@/lib/translations';

interface DistrictMetric extends DistrictItem {
  totalTokensToday: number;
  completedTokens: number;
  waitingCount: number;
  avgHandlingMinutes: number;
  avgWaitingMinutes: number;
  queueDelayCount: number;
  noShowCount: number;
  transferCount: number;
  activeCounters: number;
  totalCounters: number;
  officeCapacity: number;
  status: 'OPTIMAL' | 'MODERATE' | 'CONGESTED';
}

interface QueueDelayAlert {
  id: string;
  tokenNumber: string;
  districtGu: string;
  districtHi: string;
  districtEn: string;
  talukaGu: string;
  talukaHi: string;
  talukaEn: string;
  counterNumber: number;
  counterNameGu: string;
  counterNameHi: string;
  counterNameEn: string;
  waitingMinutes: number;
  schemeTitleGu: string;
  schemeTitleHi: string;
  schemeTitleEn: string;
  delayReasonGu: string;
  delayReasonHi: string;
  delayReasonEn: string;
  escalationSent: boolean;
}

const INITIAL_QUEUE_DELAYS: QueueDelayAlert[] = [
  {
    id: 'delay-1',
    tokenNumber: '#A-19',
    districtGu: 'રાજકોટ',
    districtHi: 'राजकोट',
    districtEn: 'Rajkot',
    talukaGu: 'ગોંડલ જન સેવા કેન્દ્ર',
    talukaHi: 'गोंडल जन सेवा केंद्र',
    talukaEn: 'Gondal Jan Seva Kendra',
    counterNumber: 2,
    counterNameGu: 'રેશનકાર્ડ & અન્ન પુરવઠો',
    counterNameHi: 'राशन कार्ड एवं खाद्य आपूर्ति',
    counterNameEn: 'Ration Card & Food Supplies',
    waitingMinutes: 38,
    schemeTitleGu: 'નવું બારકોડેડ રેશનકાર્ડ મેળવવા બાબત',
    schemeTitleHi: 'नया बारकोडेड राशन कार्ड प्राप्त करने हेतु',
    schemeTitleEn: 'Application for New Barcoded Ration Card',
    delayReasonGu: 'કાઉન્ટર ૨ પર દસ્તાવેજ ચકાસણી ભીડ',
    delayReasonHi: 'काउंटर २ पर दस्तावेज़ सत्यापन भीड़',
    delayReasonEn: 'High document verification volume at Desk 2',
    escalationSent: false
  },
  {
    id: 'delay-2',
    tokenNumber: '#A-31',
    districtGu: 'અમદાવાદ',
    districtHi: 'अहमदाबाद',
    districtEn: 'Ahmedabad',
    talukaGu: 'દસ્ક્રોઈ મામલતદાર કચેરી',
    talukaHi: 'दसक्रोई तहसीलदार कार्यालय',
    talukaEn: 'Daskroi Mamlatdar Office',
    counterNumber: 3,
    counterNameGu: 'ઈ-ધરા ૭/૧૨ જમીન રેકોર્ડ',
    counterNameHi: 'ई-धरा ७/१२ भूमि रिकॉर्ड',
    counterNameEn: 'e-Dhara 7/12 Land Records',
    waitingMinutes: 34,
    schemeTitleGu: '૭/૧૨ હકપત્રક વારસાઈ નોંધણી',
    schemeTitleHi: '७/१२ उत्तराधिकार प्रविष्टि',
    schemeTitleEn: '7/12 Land Title Inheritance Record',
    delayReasonGu: 'જમીન નોંધણી પોર્ટલ ટ્રાફિક',
    delayReasonHi: 'भूमि पंजीकरण पोर्टल पर अधिक लोड',
    delayReasonEn: 'Land Registry portal network traffic',
    escalationSent: false
  }
];

export default function CollectorCommandDashboard() {
  // Multi-Language State
  const [lang, setLang] = useState<Language>('gu');
  const [langDropdownOpen, setLangDropdownOpen] = useState<boolean>(false);

  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('rajkot');
  const [delayAlerts, setDelayAlerts] = useState<QueueDelayAlert[]>(INITIAL_QUEUE_DELAYS);
  const [misModalOpen, setMisModalOpen] = useState<boolean>(false);
  const [filterMode, setFilterMode] = useState<'ALL' | 'CONGESTED' | 'DELAY_ALERT'>('ALL');

  // Load language preference from LocalStorage on mount
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('qless_preferred_lang') as Language | null;
      if (savedLang && (savedLang === 'gu' || savedLang === 'hi' || savedLang === 'en')) {
        setLang(savedLang);
      }
    } catch {}
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    triggerHaptic('tap');
    setLang(newLang);
    setLangDropdownOpen(false);
    try {
      localStorage.setItem('qless_preferred_lang', newLang);
    } catch {}
  };

  const isGu = lang === 'gu';
  const isHi = lang === 'hi';
  const isEn = lang === 'en';

  // Dynamic Metrics for all 33 Districts (Calculated relative to Configurable Office Capacity)
  const districtMetrics: DistrictMetric[] = useMemo(() => {
    return GUJARAT_33_DISTRICTS.map((d, index) => {
      const isTop5 = ['ahmedabad', 'surat', 'vadodara', 'rajkot', 'bhavnagar'].includes(d.id);
      const totalTokens = isTop5 ? 850 + (index * 35) : 320 + (index * 18);
      const completed = Math.floor(totalTokens * 0.88);
      const waiting = totalTokens - completed;
      const officeCapacity = isTop5 ? 75 : 40;
      
      const avgHandlingMinutes = isTop5 ? 6.2 + (index % 3) * 0.8 : 5.1 + (index % 2) * 0.5;
      const avgWaitingMinutes = isTop5 ? 18.5 + (index % 4) * 2.1 : 12.0 + (index % 3) * 1.5;
      const delayCount = d.id === 'rajkot' ? 1 : d.id === 'ahmedabad' ? 1 : index % 8 === 0 ? 1 : 0;
      const noShow = Math.floor(totalTokens * 0.03) + (index % 3);
      const transfers = Math.floor(totalTokens * 0.04) + (index % 2);

      const loadRatio = waiting / officeCapacity;
      let status: 'OPTIMAL' | 'MODERATE' | 'CONGESTED' = 'OPTIMAL';
      if (loadRatio > 0.8 || delayCount > 0) {
        status = 'CONGESTED';
      } else if (loadRatio > 0.45) {
        status = 'MODERATE';
      }

      return {
        ...d,
        totalTokensToday: totalTokens,
        completedTokens: completed,
        waitingCount: waiting,
        avgHandlingMinutes: Number(avgHandlingMinutes.toFixed(1)),
        avgWaitingMinutes: Number(avgWaitingMinutes.toFixed(1)),
        queueDelayCount: delayCount,
        noShowCount: noShow,
        transferCount: transfers,
        activeCounters: 6,
        totalCounters: 6,
        officeCapacity,
        status
      };
    });
  }, []);

  const selectedDistrictData = useMemo(() => {
    return GUJARAT_33_DISTRICTS.find(d => d.id === selectedDistrictId) || GUJARAT_33_DISTRICTS[0];
  }, [selectedDistrictId]);

  const selectedDistrictMetric = useMemo(() => {
    return districtMetrics.find(m => m.id === selectedDistrictId) || districtMetrics[0];
  }, [districtMetrics, selectedDistrictId]);

  // Overall State Totals
  const stateTotals = useMemo(() => {
    const totalTokens = districtMetrics.reduce((acc, m) => acc + m.totalTokensToday, 0);
    const totalCompleted = districtMetrics.reduce((acc, m) => acc + m.completedTokens, 0);
    const totalWaiting = districtMetrics.reduce((acc, m) => acc + m.waitingCount, 0);
    const totalDelays = districtMetrics.reduce((acc, m) => acc + m.queueDelayCount, 0);
    const totalNoShows = districtMetrics.reduce((acc, m) => acc + m.noShowCount, 0);
    const totalTransfers = districtMetrics.reduce((acc, m) => acc + m.transferCount, 0);
    
    const avgHandlingTime = (districtMetrics.reduce((acc, m) => acc + m.avgHandlingMinutes, 0) / districtMetrics.length).toFixed(1);
    const avgWaitingTime = (districtMetrics.reduce((acc, m) => acc + m.avgWaitingMinutes, 0) / districtMetrics.length).toFixed(1);

    return {
      totalTokens,
      totalCompleted,
      totalWaiting,
      totalDelays,
      totalNoShows,
      totalTransfers,
      avgHandlingTime,
      avgWaitingTime,
      completionRate: ((totalCompleted / totalTokens) * 100).toFixed(1)
    };
  }, [districtMetrics]);

  // Filtered districts list
  const filteredDistricts = useMemo(() => {
    if (filterMode === 'CONGESTED') {
      return districtMetrics.filter(m => m.status === 'CONGESTED');
    }
    if (filterMode === 'DELAY_ALERT') {
      return districtMetrics.filter(m => m.queueDelayCount > 0);
    }
    return districtMetrics;
  }, [districtMetrics, filterMode]);

  // Create escalation alert
  const handleSendEscalation = (alertId: string, alertRecord: QueueDelayAlert) => {
    triggerHaptic('warning');
    setDelayAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, escalationSent: true } : a
    ));

    const voiceMsg = isGu 
      ? "પ્રશાસનિક કતાર વિલંબ એલર્ટ સફળતાપૂર્વક નોંધાયું."
      : isHi
      ? "प्रशासनिक कतार विलंब अलर्ट सफलतापूर्वक दर्ज किया गया।"
      : "Administrative queue delay escalation logged successfully.";
    speakGuidance(voiceMsg, lang);

    const alertDistrict = isGu ? alertRecord.districtGu : isHi ? alertRecord.districtHi : alertRecord.districtEn;
    const alertTaluka = isGu ? alertRecord.talukaGu : isHi ? alertRecord.talukaHi : alertRecord.talukaEn;
    const alertCounter = isGu ? alertRecord.counterNameGu : isHi ? alertRecord.counterNameHi : alertRecord.counterNameEn;
    const alertReason = isGu ? alertRecord.delayReasonGu : isHi ? alertRecord.delayReasonHi : alertRecord.delayReasonEn;

    const alertMsg = isGu
      ? `🚨 પ્રશાસનિક કતાર વિલંબ એલર્ટ (Demo Alert Created)\n\nજિલ્લો: ${alertDistrict}\nકચેરી: ${alertTaluka}\nકાઉન્ટર: ${alertRecord.counterNumber} (${alertCounter})\nટોકન: ${alertRecord.tokenNumber}\nકારણ: ${alertReason} (${alertRecord.waitingMinutes} મિનિટ પ્રતીક્ષા)\nસ્થિતિ: ડેમો એલર્ટ ડેશબોર્ડ પર સક્રિય નોંધાયેલ.`
      : isHi
      ? `🚨 प्रशासनिक कतार विलंब अलर्ट (Demo Alert Created)\n\nजिला: ${alertDistrict}\nकार्यालय: ${alertTaluka}\nकाउंटर: ${alertRecord.counterNumber} (${alertCounter})\nटोकन: ${alertRecord.tokenNumber}\nकारण: ${alertReason} (${alertRecord.waitingMinutes} मिनट प्रतीक्षा)\nस्थिति: डेमो अलर्ट डैशबोर्ड पर सक्रिय रूप से दर्ज।`
      : `🚨 Administrative Queue Delay Alert (Demo Escalation Created)\n\nDistrict: ${alertDistrict}\nOffice: ${alertTaluka}\nDesk: ${alertRecord.counterNumber} (${alertCounter})\nToken: ${alertRecord.tokenNumber}\nReason: ${alertReason} (${alertRecord.waitingMinutes} mins waiting)\nStatus: Live monitoring escalation logged.`;
    
    alert(alertMsg);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#1F2937] flex flex-col w-full">
      {/* 🚀 LIVE GUJARAT GOVERNMENT TELEMETRY & SYSTEM HEALTH MARQUEE */}
      <GovTelemetryMarquee lang={lang} />

      {/* 🟠 DEMO DATA & DEMO MODE BANNER */}
      <div className="bg-amber-500 text-slate-900 text-xs px-4 py-1.5 font-bold flex flex-wrap items-center justify-between border-b border-amber-600 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="bg-slate-900 text-amber-300 text-[10px] uppercase font-black px-1.5 py-0.5 rounded">
            🟠 DEMO DATA
          </span>
          <span>
            {isGu 
              ? 'નિરીક્ષણ ડેશબોર્ડ ડેમો ડેટા સ્ટ્રીમ • ઉત્પાદન વાતાવરણમાં સત્તાવાર રોલ-બેઝ્ડ ઓથોરાઇઝેશન (RBAC) જરૂરી છે.'
              : isHi
              ? 'निरीक्षण डैशबोर्ड डेमो डेटा स्ट्रीम • उत्पादन वातावरण में आधिकारिक रोल-आधारित प्राधिकरण (RBAC) आवश्यक है।'
              : 'Apex Oversight Dashboard Demo Stream • Production environment mandates official Role-Based Access Control (RBAC).'}
          </span>
        </div>
        <span className="text-[11px] font-mono">
          {isGu ? "રાજ્ય કચેરી મોનિટરિંગ કન્સોલ" : isHi ? "राज्य कार्यालय निगरानी कंसोल" : "Statewide Office Monitoring Console"}
        </span>
      </div>

      {/* 🏛️ EXECUTIVE COLLECTORATE HEADER */}
      <header className="bg-gradient-to-r from-[#002244] via-[#003366] to-[#001933] text-white border-b-2 border-[#FF9933] shadow-lg sticky top-0 z-40">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1 text-xs font-bold"
              title={isGu ? "નાગરિક પોર્ટલ" : isHi ? "नागरिक पोर्टल" : "Citizen Portal"}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isGu ? "પોર્ટલ" : isHi ? "पोर्टल" : "Portal"}
              </span>
            </Link>

            <GovLogo className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 drop-shadow-md" />

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest text-[#FF9933] uppercase bg-amber-950/50 border border-amber-800/50 px-1.5 py-0.5 rounded">
                  {isGu ? "ગુજરાત સરકાર • મહેસૂલ & પ્રશાસન" : isHi ? "गुजरात सरकार • राजस्व एवं प्रशासन" : "Govt of Gujarat • Revenue & Administration"}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] text-emerald-300 font-bold hidden md:inline">
                  {isGu ? "૩૩ જિલ્લા લાઈવ કમાન્ડ સેન્ટર" : isHi ? "३३ जिले लाइव कमांड सेंटर" : "33 Districts Live Command"}
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>
                  {isGu ? "જિલ્લા કલેક્ટર & DDO કમાન્ડ ડેશબોર્ડ" : isHi ? "जिला कलेक्टर एवं डीडीओ कमांड डैशबोर्ड" : "District Collector & DDO Command Dashboard"}
                </span>
              </h1>
            </div>
          </div>

          {/* Collector Profile, Language Switcher & Fast Links */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* 🌐 ADMIN LANGUAGE SWITCHER DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/20 shadow-xs"
                title="Select Language / ભાષા બદલો"
              >
                <Globe className="w-3.5 h-3.5 text-[#FF9933]" />
                <span className="font-bold">
                  {lang === 'gu' ? 'ગુજરાતી' : lang === 'hi' ? 'हिन्दी' : 'English'}
                </span>
                <ChevronDown className="w-3 h-3 text-white/70" />
              </button>

              {langDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-2xl border border-slate-200 py-1.5 z-50 text-slate-800 text-xs animate-in fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    {isGu ? "ભાષા પસંદ કરો" : isHi ? "भाषा चुनें" : "Select Language"}
                  </div>
                  {GUJARAT_LANGUAGES.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => handleLanguageChange(item.code)}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-100 transition ${
                        lang === item.code ? 'bg-blue-50 text-[#003366] font-black' : 'font-medium'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs">{item.nativeLabel}</span>
                        <span className="text-[10px] text-slate-400">{item.englishLabel}</span>
                      </div>
                      {lang === item.code && <Check className="w-4 h-4 text-[#003366]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-white">
                {isGu ? "શ્રી પ્રભાતકુમાર શર્મા, IAS" : isHi ? "श्री प्रभातकुमार शर्मा, IAS" : "Shri Prabhat Kumar Sharma, IAS"}
              </p>
              <p className="text-[10px] text-amber-200 font-mono">
                {isGu ? "જિલ્લા કલેક્ટર • ડેમો પર્સોના" : isHi ? "जिला कलेक्टर • डेमो व्यक्तित्व" : "District Collector • Demo Persona"}
              </p>
            </div>

            <Link
              href="/admin/counter"
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/20"
            >
              <Building className="w-3.5 h-3.5 text-[#FF9933]" />
              <span className="hidden md:inline">
                {isGu ? "કાઉન્ટર ડેસ્ક" : isHi ? "काउंटर डेस्क" : "Counter Desk"}
              </span>
            </Link>

            <button
              onClick={() => setMisModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#FF9933] hover:bg-amber-600 text-slate-900 text-xs font-black transition flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>
                {isGu ? "દૈનિક MIS રિપોર્ટ (Demo)" : isHi ? "दैनिक MIS रिपोर्ट (Demo)" : "Daily MIS Report"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* 🚨 QUEUE DELAY WATCHDOG TICKER */}
      {delayAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-4 sm:px-6 lg:px-8 xl:px-12 py-2.5 shadow-md border-b border-red-800">
          <div className="w-full max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-black">
              <AlertTriangle className="w-4 h-4 animate-bounce text-amber-300 shrink-0" />
              <span>
                {isGu 
                  ? `કતાર વિલંબ ચેતવણી (Queue Delay Watchdog • ${delayAlerts.length} અરજીઓ ૩૦+ મિનિટથી વિલંબિત):` 
                  : isHi 
                  ? `कतार विलंब चेतावनी (Queue Delay Watchdog • ${delayAlerts.length} आवेदन ३०+ मिनट से विलंबित):` 
                  : `Queue Delay Watchdog (${delayAlerts.length} applications delayed 30+ mins):`}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {delayAlerts.map(alert => (
                <div key={alert.id} className="flex items-center gap-2 bg-black/25 px-2.5 py-1 rounded-lg border border-white/20 text-[11px]">
                  <span className="font-mono font-bold text-amber-300">{alert.tokenNumber}</span>
                  <span className="font-semibold">
                    {isGu ? alert.talukaGu : isHi ? alert.talukaHi : alert.talukaEn} ({alert.waitingMinutes}m {isGu ? "વિલંબ" : isHi ? "देरी" : "delayed"})
                  </span>
                  
                  {alert.escalationSent ? (
                    <span className="text-[10px] bg-emerald-500/80 text-white px-1.5 py-0.5 rounded font-bold">
                      {isGu ? "✓ એલર્ટ નોંધાયું" : isHi ? "✓ अलर्ट दर्ज" : "✓ Alert Registered"}
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSendEscalation(alert.id, alert)}
                      className="bg-white text-red-700 hover:bg-amber-100 font-extrabold text-[10px] px-2 py-0.5 rounded transition active:scale-95 shadow-xs cursor-pointer"
                      title={isGu ? "પ્રશાસનિક વિલંબ એલર્ટ જારી કરો" : isHi ? "प्रशासनिक विलंब अलर्ट जारी करें" : "Issue Administrative Delay Escalation"}
                    >
                      {isGu ? "એસ્કેલેટ — ડેમો" : isHi ? "एस्केलेट — डेमो" : "Escalate — Demo"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 📊 STATE-WIDE METRIC SUMMARY CARDS */}
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-5">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              {isGu ? "કુલ ઇશ્યુ ટોકન (રાજ્યભર)" : isHi ? "कुल जारी टोकन (राज्यभर)" : "Total Tokens (Statewide)"}
            </p>
            <p className="text-xl sm:text-2xl font-black text-[#003366] mt-1">{stateTotals.totalTokens.toLocaleString()}</p>
            <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-0.5">
              {isGu ? `નો-શો: ${stateTotals.totalNoShows} • ટ્રાન્સફર: ${stateTotals.totalTransfers}` : isHi ? `नो-शो: ${stateTotals.totalNoShows} • ट्रांसफर: ${stateTotals.totalTransfers}` : `No-shows: ${stateTotals.totalNoShows} • Transfers: ${stateTotals.totalTransfers}`}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              {isGu ? "સફળતાપૂર્વક નિકાલ" : isHi ? "सफलतापूर्वक निपटान" : "Successfully Served"}
            </p>
            <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">{stateTotals.totalCompleted.toLocaleString()}</p>
            <span className="text-[10px] text-slate-500 font-bold">
              {stateTotals.completionRate}% {isGu ? "નિકાલ દર" : isHi ? "निपटान दर" : "Completion Rate"}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              {isGu ? "સરેરાશ કતાર પ્રતીક્ષા સમય" : isHi ? "औसत कतार प्रतीक्षा समय" : "Avg Queue Wait Time"}
            </p>
            <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">
              {stateTotals.avgWaitingTime} {isGu ? "મિનિટ" : isHi ? "मिनट" : "mins"}
            </p>
            <span className="text-[10px] text-amber-700 font-bold">
              {isGu ? "કતારમાં બોલાવવા પહેલાંનો સમય" : isHi ? "कतार में बुलाने से पहले का समय" : "Time before being called"}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              {isGu ? "સરેરાશ ડેસ્ક સેવા સમય" : isHi ? "औसत डेस्क सेवा समय" : "Avg Desk Service Time"}
            </p>
            <p className="text-xl sm:text-2xl font-black text-indigo-700 mt-1">
              {stateTotals.avgHandlingTime} {isGu ? "મિનિટ" : isHi ? "मिनट" : "mins"}
            </p>
            <span className="text-[10px] text-emerald-600 font-bold">
              {isGu ? "અધિકારી ડેસ્ક સેવા સમય ✓" : isHi ? "अधिकारी डेस्क सेवा समय ✓" : "Officer Desk Time ✓"}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 md:col-span-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
              {isGu ? "કતાર વિલંબ ચેતવણી" : isHi ? "कतार विलंब चेतावनी" : "Queue Delay Alerts"}
            </p>
            <p className="text-xl sm:text-2xl font-black text-red-600 mt-1">
              {stateTotals.totalDelays} {isGu ? "કિસ્સા" : isHi ? "मामले" : "Alerts"}
            </p>
            <span className="text-[10px] text-red-700 font-bold">
              {isGu ? "પ્રશાસનિક સમીક્ષા હેઠળ" : isHi ? "प्रशासनिक समीक्षाधीन" : "Under Apex Review"}
            </span>
          </div>
        </div>
      </div>

      {/* 🗺️ MAIN EXECUTIVE CONSOLE: HEATMAP & TALUKA DRILL-DOWN */}
      <main className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-5 grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        
        {/* LEFT COLUMN: 33 DISTRICTS CONGESTION HEATMAP (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
            
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-black text-[#003366] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#FF9933]" />
                  <span>
                    {isGu 
                      ? "ગુજરાત ૩૩ જિલ્લા ભીડ હીટમેપ (District Congestion Index)" 
                      : isHi 
                      ? "गुजरात ३३ जिले भीड़ हीटमैप (District Congestion Index)" 
                      : "Gujarat 33 Districts Congestion Heatmap"}
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">
                  {isGu 
                    ? "ક્ષમતા આધારિત કોન્ફિગરેબલ ભીડ મૂલ્યાંકન • તાલુકા વિગતો જોવા ક્લિક કરો" 
                    : isHi 
                    ? "क्षमता आधारित भीड़ मूल्यांकन • तालुका विवरण देखने के लिए क्लिक करें" 
                    : "Capacity-based Congestion Index • Click any district for Taluka drilldown"}
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 text-[10px] font-bold">
                <button
                  onClick={() => setFilterMode('ALL')}
                  className={`px-2 py-1 rounded-lg transition ${
                    filterMode === 'ALL' ? 'bg-[#003366] text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isGu ? `તમામ (${districtMetrics.length})` : isHi ? `सभी (${districtMetrics.length})` : `All (${districtMetrics.length})`}
                </button>
                <button
                  onClick={() => setFilterMode('CONGESTED')}
                  className={`px-2 py-1 rounded-lg transition ${
                    filterMode === 'CONGESTED' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isGu ? "ભારે ભીડ" : isHi ? "भारी भीड़" : "Congested"}
                </button>
                <button
                  onClick={() => setFilterMode('DELAY_ALERT')}
                  className={`px-2 py-1 rounded-lg transition ${
                    filterMode === 'DELAY_ALERT' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {isGu ? "વિલંબ એલર્ટ" : isHi ? "विलंब अलर्ट" : "Delay Alerts"}
                </button>
              </div>
            </div>

            {/* 33 Districts Interactive Grid with 100% Localized Names */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[480px] overflow-y-auto pr-1">
              {filteredDistricts.map((metric) => {
                const isSelected = metric.id === selectedDistrictId;
                const localizedName = getLocalizedDistrictName(metric, lang);
                const secondaryName = isEn ? metric.nameGu : metric.nameEn;

                return (
                  <button
                    key={metric.id}
                    onClick={() => {
                      triggerHaptic('tap');
                      setSelectedDistrictId(metric.id);
                    }}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected 
                        ? 'bg-blue-50/90 border-[#003366] ring-2 ring-[#003366]/20 shadow-sm'
                        : metric.status === 'CONGESTED'
                          ? 'bg-red-50/60 border-red-200 hover:bg-red-50'
                          : metric.status === 'MODERATE'
                            ? 'bg-amber-50/50 border-amber-200 hover:bg-amber-50'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-black text-xs text-slate-900">
                        {localizedName}
                      </span>
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        metric.status === 'CONGESTED'
                          ? 'bg-red-500 animate-pulse'
                          : metric.status === 'MODERATE'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                      }`} />
                    </div>

                    <p className="text-[10px] text-slate-400 font-mono">
                      {secondaryName}
                    </p>
                    
                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">
                        {isGu ? "પ્રતીક્ષા:" : isHi ? "प्रतीक्षा:" : "Waiting:"} <strong className="text-slate-800">{metric.waitingCount}</strong>
                      </span>
                      <span className="text-slate-500 font-mono">
                        {isGu ? "સેવા:" : isHi ? "सेवा:" : "Desk:"} {metric.avgHandlingMinutes}m
                      </span>
                    </div>

                    {metric.queueDelayCount > 0 && (
                      <span className="mt-1.5 bg-red-600 text-white font-black text-[9px] px-1.5 py-0.2 rounded-full block text-center">
                        ⚠️ {metric.queueDelayCount} {isGu ? "વિલંબ એલર્ટ" : isHi ? "विलंब अलर्ट" : "Delay Alert"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Heatmap Legend */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[10px] text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  {isGu ? "સામાન્ય (<૪૫% ક્ષમતા)" : isHi ? "सामान्य (<४५% क्षमता)" : "Optimal (<45% capacity)"}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  {isGu ? "મધ્યમ (૪૫-૮૦% ક્ષમતા)" : isHi ? "मध्यम (४५-८०% क्षमता)" : "Moderate (45-80% capacity)"}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  {isGu ? "ભારે ભીડ (>૮૦% ક્ષમતા)" : isHi ? "भारी भीड़ (>८०% क्षमता)" : "Congested (>80% capacity)"}
                </span>
              </div>

              <span>
                {isGu ? "સિંક સમય: હમણાં જ (Live)" : isHi ? "सिंक समय: अभी (Live)" : "Sync: Just now (Live)"}
              </span>
            </div>

          </div>

          {/* HOURLY CONGESTION & PEAK SURGE CHART */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black text-[#003366] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#005A9C]" />
                <span>
                  {isGu ? "રાજ્યવ્યાપી પીક અવર્સ કતાર સમયરેખા (Observed Queue Footfall)" : isHi ? "राज्यव्यापी पीक आवर्स कतार समयरेखा (Observed Queue Footfall)" : "Statewide Peak Hours Queue Footfall"}
                </span>
              </h4>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {isGu ? "નોંધાયેલ કતાર ડેટા આધારે" : isHi ? "दर्ज कतार डेटा आधार पर" : "Based on Observed Logs"}
              </span>
            </div>

            {/* Hourly Bar Graph */}
            <div className="grid grid-cols-7 gap-2 items-end h-28 pt-4">
              {[
                { time: '10:30', count: 18, labelGu: 'શરૂઆત', labelHi: 'शुरुआत', labelEn: 'Start' },
                { time: '11:30', count: 48, labelGu: 'પીક રશ', labelHi: 'पीक रश', labelEn: 'Peak Rush' },
                { time: '12:30', count: 52, labelGu: 'મહત્તમ', labelHi: 'अधिकतम', labelEn: 'Max' },
                { time: '13:10', count: 6, labelGu: 'લંચ રિસેસ', labelHi: 'भोजन अवकाश', labelEn: 'Lunch' },
                { time: '14:30', count: 36, labelGu: 'સાંજ સત્ર', labelHi: 'सायं सत्र', labelEn: 'Post-Lunch' },
                { time: '15:30', count: 42, labelGu: 'સાંજ રશ', labelHi: 'सायं रश', labelEn: 'Evening Rush' },
                { time: '17:00', count: 20, labelGu: 'ક્લોઝિંગ', labelHi: 'समापन', labelEn: 'Closing' }
              ].map((slot, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end">
                  <div 
                    className={`w-full rounded-t-lg transition-all ${
                      slot.time === '13:10' 
                        ? 'bg-amber-300' 
                        : slot.count > 45 
                          ? 'bg-red-500' 
                          : 'bg-[#003366]'
                    }`}
                    style={{ height: `${(slot.count / 52) * 100}%` }}
                  />
                  <span className="text-[9px] font-mono font-bold text-slate-700">{slot.time}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 border-t border-slate-100 pt-2">
              <span>
                {isGu ? "સવારે ૧૧:૩૦ - ૧૨:૩૦ પીક સમય (સૌથી વધુ કતાર)" : isHi ? "सुबह ११:३० - १२:३० पीक समय (अधिकतम कतार)" : "11:30 AM - 12:30 PM Peak Footfall window"}
              </span>
              <span>
                {isGu ? "૧:૧૦ - ૨:૦૦ લંચ વિરામ (ઓછી ભીડ)" : isHi ? "१:१० - २:०० भोजन अवकाश (न्यूनतम भीड़)" : "1:10 - 2:00 PM Lunch Recess"}
              </span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: SELECTED DISTRICT TALUKAS & DEMAND RATIO (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* SELECTED DISTRICT DRILL-DOWN CARD */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
            
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#FF9933] uppercase tracking-wider">
                  {isGu ? "જિલ્લા નિરીક્ષણ" : isHi ? "जिला निरीक्षण" : "District Oversight"}
                </span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {selectedDistrictData.talukas.length} {isGu ? "તાલુકા" : isHi ? "तालुक" : "Talukas"}
                </span>
              </div>
              <h3 className="text-lg font-black text-[#003366] mt-0.5">
                {isEn 
                  ? `${selectedDistrictData.nameEn} District (${selectedDistrictData.nameGu})` 
                  : isHi 
                  ? `${getLocalizedDistrictName(selectedDistrictData, 'hi')} ज़िला (${selectedDistrictData.nameEn})` 
                  : `${selectedDistrictData.nameGu} જિલ્લો (${selectedDistrictData.nameEn})`}
              </h3>
              <p className="text-xs text-slate-500">
                {isGu ? "મુખ્ય મથક:" : isHi ? "मुख्यालय:" : "HQ:"} <strong>{getLocalizedDistrictHq(selectedDistrictData, lang)}</strong> • {isGu ? "કુલ ટોકન:" : isHi ? "कुल टोकन:" : "Total Tokens:"} <strong>{selectedDistrictMetric.totalTokensToday}</strong>
              </p>
            </div>

            {/* Talukas List with Counter Readiness */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {selectedDistrictData.talukas.map((taluka) => (
                <div 
                  key={taluka.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-xs font-black text-slate-800">
                      {isEn 
                        ? `${taluka.nameEn} Taluka` 
                        : isHi 
                        ? `${getLocalizedTalukaName(taluka, 'hi')} तालुक` 
                        : `${taluka.nameGu} તાલુકો`}
                    </h5>
                    <p className="text-[10px] text-slate-500 line-clamp-1">
                      {getLocalizedTalukaOffice(taluka, lang)}
                    </p>
                    <span className="text-[9px] font-mono text-[#005A9C] font-bold">
                      {isGu ? "૬ કાઉન્ટર્સ સક્રિય • ક્ષમતા: કોન્ફિગરેબલ" : isHi ? "६ काउंटर सक्रिय • क्षमता: कॉन्फ़िगर करने योग्य" : "6 Desks Active • Capacity: Configurable"}
                    </span>
                  </div>

                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full shrink-0">
                    {isGu ? "કાર્યરત ✓" : isHi ? "सक्रिय ✓" : "Active ✓"}
                  </span>
                </div>
              ))}
            </div>

          </div>

          {/* SERVICE-WISE DEMAND BREAKDOWN */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-3">
            <h4 className="text-xs font-black text-[#003366] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>
                {isGu ? "યોજનાવાર સેવા માંગ દર (Observed Service Breakdown)" : isHi ? "योजनावार सेवा मांग अनुपात (Observed Breakdown)" : "Scheme-wise Service Demand Ratio"}
              </span>
            </h4>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>{isGu ? "આવક & જાતિ પ્રમાણપત્રો (Revenue)" : isHi ? "आय एवं जाति प्रमाण पत्र (राजस्व)" : "Income & Caste Certificates (Revenue)"}</span>
                  <span className="text-[#003366]">{isGu ? "૩૮% (૫,૬૩૦ અરજીઓ)" : isHi ? "३८% (५,६३० आवेदन)" : "38% (5,630 apps)"}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#003366] h-full" style={{ width: '38%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>{isGu ? "ઈ-ધરા ૭/૧૨ & ૮-અ જમીન રેકોર્ડ" : isHi ? "ई-धरा ७/१२ एवं ८-अ भूमि रिकॉर्ड" : "e-Dhara 7/12 & 8-A Land Records"}</span>
                  <span className="text-[#005A9C]">{isGu ? "૨૬% (૩,૮૫૦ અરજીઓ)" : isHi ? "२६% (३,८५० आवेदन)" : "26% (3,850 apps)"}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#005A9C] h-full" style={{ width: '26%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>{isGu ? "રેશન કાર્ડ વિભાજન & પુરવઠો" : isHi ? "राशन कार्ड विभाजन एवं खाद्य आपूर्ति" : "Ration Card & Food Supplies"}</span>
                  <span className="text-amber-700">{isGu ? "૧૮% (૨,૬૬૦ અરજીઓ)" : isHi ? "१८% (२,६६० आवेदन)" : "18% (2,660 apps)"}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#FF9933] h-full" style={{ width: '18%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>{isGu ? "ગંગા સ્વરૂપા વિધવા & વૃદ્ધ પેન્શન" : isHi ? "गंगा स्वरूपा विधवा एवं वृद्धावस्था पेंशन" : "Widow & Old Age Pension Support"}</span>
                  <span className="text-emerald-700">{isGu ? "૧૨% (૧,૭૭૦ અરજીઓ)" : isHi ? "१२% (१,७७० आवेदन)" : "12% (1,770 apps)"}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full" style={{ width: '12%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>{isGu ? "સોગંદનામું & સામાન્ય એટેસ્ટેશન" : isHi ? "शपथ पत्र एवं सामान्य सत्यापन" : "Affidavit & Notary Attestation"}</span>
                  <span className="text-slate-600">{isGu ? "૬% (૮૯૦ અરજીઓ)" : isHi ? "६% (८९० आवेदन)" : "6% (890 apps)"}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-slate-500 h-full" style={{ width: '6%' }} />
                </div>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* 📑 DAILY MIS BULLETIN MODAL (DEMO) */}
      {misModalOpen && (
        <div 
          onClick={() => setMisModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 modal-backdrop animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-6 max-w-xl w-full border border-slate-200 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="text-center border-b border-slate-200 pb-3">
              <span className="text-[10px] font-black text-[#FF9933] uppercase tracking-widest">
                {isGu ? "🏛️ ગુજરાત સરકાર • મહેસૂલ & પ્રશાસન" : isHi ? "🏛️ गुजरात सरकार • राजस्व एवं प्रशासन" : "🏛️ Govt of Gujarat • Revenue & Administration"}
              </span>
              <h3 className="text-base font-black text-[#003366] mt-0.5">
                {isGu ? "દૈનિક ઈ-જન સેવા નિકાલ અહેવાલ (Daily MIS Bulletin — Demo)" : isHi ? "दैनिक ई-जन सेवा निपटान रिपोर्ट (Daily MIS Bulletin — Demo)" : "Daily e-Jan Seva Disposal Bulletin (MIS Report)"}
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">
                {isGu ? "તારીખ:" : isHi ? "दिनांक:" : "Date:"} {new Date().toLocaleDateString(isGu ? 'gu-IN' : isHi ? 'hi-IN' : 'en-IN')} • {isGu ? "સમય:" : isHi ? "समय:" : "Time:"} {new Date().toLocaleTimeString(isGu ? 'gu-IN' : isHi ? 'hi-IN' : 'en-IN')}
              </p>
            </div>

            {/* MIS Summary Table */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-1.5 font-bold">
                <span>{isGu ? "કુલ નોંધાયેલ જિલ્લા:" : isHi ? "कुल पंजीकृत जिले:" : "Total Registered Districts:"}</span>
                <span className="text-[#003366]">{isGu ? "૩૩ જિલ્લા (૨૫૦+ તાલુકા)" : isHi ? "३३ जिले (२५०+ तालुक)" : "33 Districts (250+ Talukas)"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5 font-bold">
                <span>{isGu ? "કુલ જારી કરાયેલ ટોકન્સ:" : isHi ? "कुल जारी टोकन:" : "Total Tokens Issued:"}</span>
                <span>{stateTotals.totalTokens.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5 font-bold">
                <span>{isGu ? "સફળતાપૂર્વક નિકાલ થયેલ સેવાઓ:" : isHi ? "सफलतापूर्वक निपटान सेवाएं:" : "Successfully Served Services:"}</span>
                <span className="text-emerald-700">{stateTotals.totalCompleted.toLocaleString()} ({stateTotals.completionRate}%)</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5 font-bold">
                <span>{isGu ? "સરેરાશ કતાર પ્રતીક્ષા સમય:" : isHi ? "औसत कतार प्रतीक्षा समय:" : "Avg Queue Wait Time:"}</span>
                <span>{stateTotals.avgWaitingTime} {isGu ? "મિનિટ" : isHi ? "मिनट" : "mins"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5 font-bold">
                <span>{isGu ? "સરેરાશ ડેસ્ક સેવા સમય:" : isHi ? "औसत डेस्क सेवा समय:" : "Avg Desk Service Time:"}</span>
                <span>{stateTotals.avgHandlingTime} {isGu ? "મિનિટ" : isHi ? "मिनट" : "mins"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5 font-bold">
                <span>{isGu ? "નો-શો & ટ્રાન્સફર સંખ્યા:" : isHi ? "नो-शो एवं ट्रांसफर संख्या:" : "No-shows & Transfers:"}</span>
                <span>{stateTotals.totalNoShows} {isGu ? "નો-શો" : isHi ? "नो-शो" : "No-shows"} / {stateTotals.totalTransfers} {isGu ? "ટ્રાન્સફર" : isHi ? "ट्रांसफर" : "Transfers"}</span>
              </div>
              <div className="flex justify-between font-bold text-red-600">
                <span>{isGu ? "કતાર વિલંબ ચેતવણી નોંધાયેલ:" : isHi ? "कतार विलंब चेतावनी दर्ज:" : "Queue Delay Escalations:"}</span>
                <span>{stateTotals.totalDelays} {isGu ? "કિસ્સા" : isHi ? "मामले" : "Alerts"}</span>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-[11px] text-[#003366]">
              <strong>{isGu ? "પ્રશાસનિક નોંધ:" : isHi ? "प्रशासनिक टिप्पणी:" : "Administrative Note:"}</strong>{' '}
              {isGu 
                ? "આ અહેવાલ ડેમો મૂલ્યાંકન હેતુ માટે જનરેટ થયેલ છે. વાસ્તવિક ઉત્પાદન પ્રણાલી અધિકૃત ઓડિટ ડેટાબેઝ સાથે સંકલિત થાય છે."
                : isHi
                ? "यह रिपोर्ट डेमो मूल्यांकन हेतु तैयार की गई है। वास्तविक उत्पादन प्रणाली अधिकृत ऑडिट डेटाबेस के साथ एकीकृत होती है।"
                : "This MIS report is generated for demo evaluation purposes. Production deployments synchronize with official audit databases."}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  triggerHaptic('success');
                  window.print();
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isGu ? "પ્રિન્ટ / PDF ડાઉનલોડ" : isHi ? "प्रिंट / PDF डाउनलोड" : "Print / Export PDF"}</span>
              </button>
              
              <button
                onClick={() => setMisModalOpen(false)}
                className="flex-1 bg-[#003366] hover:bg-[#002244] text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                {isGu ? "બંધ કરો (Close)" : isHi ? "बंद करें (Close)" : "Close Report"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
