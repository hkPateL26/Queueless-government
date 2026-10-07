'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, Volume2, CheckCircle2, AlertTriangle, UserCheck, 
  Clock, ArrowRight, Search, Building, Users, Radio, FileText, 
  Coffee, ArrowRightLeft, RotateCcw, Check, X, ChevronDown, 
  ExternalLink, Eye, Printer, ArrowLeft, Sparkles, Star, Award, 
  AlertCircle, Phone, Lock, ChevronRight, RefreshCw, Layers
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { speakGuidance } from '@/lib/voice';
import { 
  playOfficialGovChime, broadcastQueueEvent, subscribeToQueueEvents, QueueEvent 
} from '@/lib/realtime-bus';
import { GUJARAT_33_DISTRICTS, DistrictItem, TalukaOffice } from '@/lib/jurisdiction-data';

interface QueueCitizen {
  id: string;
  tokenNumber: string;
  citizenName: string;
  phone: string;
  schemeTitleGu: string;
  schemeTitleEn: string;
  counterNumber: number;
  isPriority: boolean; // Senior Citizen (60+) / Divyangjan
  appliedTime: string;
  status: 'WAITING' | 'SERVING' | 'COMPLETED' | 'SKIPPED' | 'LATE';
  lateMinutes?: number;
  aadhaarLast4: string;
  incomeDeclared: string;
  aiOcrVerdict: string;
  documents: { name: string; status: 'VERIFIED' | 'PENDING' }[];
}

const INITIAL_QUEUE: QueueCitizen[] = [
  {
    id: 'tok-p07',
    tokenNumber: '#P-07',
    citizenName: 'ગંગાબેન રમણિકભાઈ પટેલ (૬૪ વર્ષ)',
    phone: '98251 XXXXX',
    schemeTitleGu: 'ગંગા સ્વરૂપા વિધવા સહાય યોજના',
    schemeTitleEn: 'Ganga Swarupa Vidhva Sahay',
    counterNumber: 1,
    isPriority: true,
    appliedTime: '10:35 AM',
    status: 'WAITING',
    aadhaarLast4: '7104',
    incomeDeclared: '₹ ૯૫,૦૦૦ (વાર્ષિક)',
    aiOcrVerdict: '✓ ઓટોમેટેડ પ્રી-ચેક સફળ: આવક ₹૯૫,૦૦૦ (નિયમ મુજબ મર્યાદા હેઠળ)',
    documents: [
      { name: 'આધાર કાર્ડ (માસ્ક્ડ આધાર XXXX-XXXX-7104)', status: 'VERIFIED' },
      { name: 'પતિના અવસાનનો દાખલો', status: 'VERIFIED' },
      { name: 'આવકનો દાખલો (સક્ષમ અધિકારી)', status: 'VERIFIED' }
    ]
  },
  {
    id: 'tok-a42',
    tokenNumber: '#A-42',
    citizenName: 'મોહનભાઈ કરસનભાઈ પટેલ',
    phone: '98765 XXXXX',
    schemeTitleGu: 'આવકનો દાખલો (રાજ્ય સરકાર પ્રમાણપત્ર)',
    schemeTitleEn: 'Income Certificate',
    counterNumber: 1,
    isPriority: false,
    appliedTime: '10:45 AM',
    status: 'WAITING',
    aadhaarLast4: '8842',
    incomeDeclared: '₹ ૧,૨૦,૦૦૦ (વાર્ષિક)',
    aiOcrVerdict: '✓ ઓટોમેટેડ પ્રી-ચેક સફળ: આવક ₹૧,૨૦,૦૦૦ (તલાટી રિપોર્ટ સુસંગત)',
    documents: [
      { name: 'આધાર કાર્ડ (માસ્ક્ડ આધાર XXXX-XXXX-8842)', status: 'VERIFIED' },
      { name: 'ચાલુ વર્ષનો આવકનો દાખલો', status: 'VERIFIED' },
      { name: 'રેશન કાર્ડ નકલ', status: 'VERIFIED' }
    ]
  },
  {
    id: 'tok-a43',
    tokenNumber: '#A-43',
    citizenName: 'રમેશભાઈ ગોવિંદભાઈ પરમાર',
    phone: '94263 XXXXX',
    schemeTitleGu: 'બિન-અનામત વર્ગ (EWS) આવક પ્રમાણપત્ર',
    schemeTitleEn: 'EWS Certificate',
    counterNumber: 1,
    isPriority: false,
    appliedTime: '10:55 AM',
    status: 'WAITING',
    aadhaarLast4: '4192',
    incomeDeclared: '₹ ૨,૪૦,૦૦૦ (વાર્ષિક)',
    aiOcrVerdict: '✓ ઓટોમેટેડ પ્રી-ચેક સફળ: આવક ₹૨,૪૦,૦૦૦ (EWS મર્યાદા હેઠળ)',
    documents: [
      { name: 'આધાર કાર્ડ (માસ્ક્ડ આધાર XXXX-XXXX-4192)', status: 'VERIFIED' },
      { name: 'આવક પંચનામું', status: 'VERIFIED' }
    ]
  },
  {
    id: 'tok-a44',
    tokenNumber: '#A-44',
    citizenName: 'ભાવનાબેન કિશોરભાઈ જોશી',
    phone: '97120 XXXXX',
    schemeTitleGu: 'વિધવા પુનઃલગ્ન આર્થિક સહાય',
    schemeTitleEn: 'Remarriage Assistance',
    counterNumber: 1,
    isPriority: false,
    appliedTime: '11:10 AM',
    status: 'WAITING',
    aadhaarLast4: '9921',
    incomeDeclared: '₹ ૧,૫૦,૦૦૦ (વાર્ષિક)',
    aiOcrVerdict: '✓ ઓટોમેટેડ પ્રી-ચેક સફળ: દસ્તાવેજો યોગ્ય',
    documents: [
      { name: 'આધાર કાર્ડ (માસ્ક્ડ આધાર XXXX-XXXX-9921)', status: 'VERIFIED' },
      { name: 'લગ્ન નોંધણી પ્રમાણપત્ર', status: 'VERIFIED' }
    ]
  }
];

export default function CounterOperatorDesk() {
  // Jurisdiction & Officer Profile
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('rajkot');
  const [selectedTalukaId, setSelectedTalukaId] = useState<string>('gondal');
  const [selectedCounter, setSelectedCounter] = useState<number>(1);
  const [isLunchRecess, setIsLunchRecess] = useState<boolean>(false);

  // Queue state
  const [queue, setQueue] = useState<QueueCitizen[]>(INITIAL_QUEUE);
  const [currentServing, setCurrentServing] = useState<QueueCitizen | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [docModalOpen, setDocModalOpen] = useState<boolean>(false);
  const [transferModalOpen, setTransferModalOpen] = useState<boolean>(false);
  const [targetCounter, setTargetCounter] = useState<number>(2);
  const [transferRemarks, setTransferRemarks] = useState<string>('અરજદારને સોગંદનામા માટે મોકલવામાં આવ્યા છે.');

  // Officer stats
  const [stats, setStats] = useState({
    servedToday: 38,
    avgMinutes: 5.4,
    priorityServed: 7,
    skippedCount: 2
  });

  const currentDistrict = useMemo(() => 
    GUJARAT_33_DISTRICTS.find(d => d.id === selectedDistrictId) || GUJARAT_33_DISTRICTS[0],
    [selectedDistrictId]
  );

  const currentTaluka = useMemo(() => 
    currentDistrict.talukas.find(t => t.id === selectedTalukaId) || currentDistrict.talukas[0],
    [currentDistrict, selectedTalukaId]
  );

  // SLA Service Stopwatch (GRTSA 2013: 15 mins target)
  useEffect(() => {
    let timer: any = null;
    if (currentServing) {
      timer = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [currentServing]);

  // Subscribe to external queue events (e.g. citizen running late)
  useEffect(() => {
    const unsubscribe = subscribeToQueueEvents((event) => {
      if (event.type === 'LATE_SHIFTED') {
        setQueue(prev => prev.map(c => {
          if (c.tokenNumber === event.tokenNumber) {
            return { ...c, status: 'LATE', lateMinutes: (c.lateMinutes || 0) + 36 };
          }
          return c;
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  // Format stopwatch mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // 1. CALL NEXT TOKEN (Senior/Divyang First Engine)
  const handleCallNext = (targetCitizen?: QueueCitizen) => {
    triggerHaptic('success');
    playOfficialGovChime();

    // Pick target citizen or priority citizen first, then first waiting
    let nextCitizen: QueueCitizen | undefined = targetCitizen;
    if (!nextCitizen) {
      const priorityNext = queue.find(c => c.status === 'WAITING' && c.isPriority);
      nextCitizen = priorityNext || queue.find(c => c.status === 'WAITING');
    }

    if (!nextCitizen) {
      alert("કતારમાં હાલ કોઈ નવો નાગરિક પ્રતીક્ષામાં નથી.");
      return;
    }

    setCurrentServing(nextCitizen);
    setElapsedSeconds(0);

    // Update queue list
    setQueue(prev => prev.map(c => 
      c.id === nextCitizen!.id ? { ...c, status: 'SERVING' } : c
    ));

    // Broadcast across all connected tabs (Mohanbhai's mobile, TV Screen)
    broadcastQueueEvent({
      type: 'TOKEN_CALLED',
      tokenNumber: nextCitizen.tokenNumber,
      counterNumber: selectedCounter,
      counterNameGu: 'આવક & જાતિ પ્રમાણપત્ર',
      talukaId: selectedTalukaId,
      timestamp: Date.now()
    });

    // Voice announcement in Gujarati
    const voiceMsg = nextCitizen.isPriority
      ? `ધ્યાન આપો, વરિષ્ઠ નાગરિક પ્રાથમિકતા ટોકન નંબર ${nextCitizen.tokenNumber}, કાઉન્ટર ${selectedCounter} પર ઉપસ્થિત થાવ.`
      : `ધ્યાન આપો, કાઉન્ટર ${selectedCounter} પર ટોકન નંબર ${nextCitizen.tokenNumber} નો વારો આવી ગયો છે.`;
    speakGuidance(voiceMsg);
  };

  // 2. COMPLETE SERVICE & ISSUE PASS
  const handleMarkComplete = () => {
    if (!currentServing) return;
    triggerHaptic('success');

    const completed = currentServing;
    setQueue(prev => prev.map(c => 
      c.id === completed.id ? { ...c, status: 'COMPLETED' } : c
    ));

    setStats(prev => ({
      ...prev,
      servedToday: prev.servedToday + 1,
      priorityServed: completed.isPriority ? prev.priorityServed + 1 : prev.priorityServed
    }));

    broadcastQueueEvent({
      type: 'TOKEN_COMPLETED',
      tokenNumber: completed.tokenNumber,
      counterNumber: selectedCounter,
      timestamp: Date.now()
    });

    speakGuidance(`ટોકન નંબર ${completed.tokenNumber} ની કામગીરી સફળતાપૂર્વક પૂર્ણ થયેલ છે.`);
    alert(`✅ સફળતાપૂર્વક નિકાલ!\n\nટોકન: ${completed.tokenNumber} (${completed.citizenName})\nસેવા સમય: ${formatTime(elapsedSeconds)}\nGRTSA પાલન: માન્ય પ્રમાણપત્ર ઈશ્યુ કરાયું.`);
    setCurrentServing(null);
  };

  // 3. SKIP / ABSENT
  const handleSkipAbsent = () => {
    if (!currentServing) return;
    triggerHaptic('warning');

    const skipped = currentServing;
    setQueue(prev => prev.map(c => 
      c.id === skipped.id ? { ...c, status: 'SKIPPED' } : c
    ));

    setStats(prev => ({ ...prev, skippedCount: prev.skippedCount + 1 }));

    broadcastQueueEvent({
      type: 'TOKEN_SKIPPED',
      tokenNumber: skipped.tokenNumber,
      counterNumber: selectedCounter,
      timestamp: Date.now()
    });

    speakGuidance(`ટોકન નંબર ${skipped.tokenNumber} ગેરહાજર નોંધાયેલ છે.`);
    setCurrentServing(null);
  };

  // 4. TRANSFER TO ANOTHER COUNTER
  const handleConfirmTransfer = () => {
    if (!currentServing) return;
    triggerHaptic('tap');

    const transferred = currentServing;
    setQueue(prev => prev.filter(c => c.id !== transferred.id));

    broadcastQueueEvent({
      type: 'TOKEN_CALLED',
      tokenNumber: transferred.tokenNumber,
      counterNumber: targetCounter,
      counterNameGu: `કાઉન્ટર ${targetCounter}`,
      talukaId: selectedTalukaId,
      timestamp: Date.now(),
      payload: { transferred: true, remarks: transferRemarks }
    });

    alert(`🔄 કાઉન્ટર ટ્રાન્સફર મંજૂર!\n\nટોકન: ${transferred.tokenNumber}\nનવું કાઉન્ટર: કાઉન્ટર ${targetCounter}\nનોંધ: ${transferRemarks}`);
    setTransferModalOpen(false);
    setCurrentServing(null);
  };

  // 5. TOGGLE LUNCH RECESS
  const handleToggleLunch = () => {
    triggerHaptic('warning');
    const newState = !isLunchRecess;
    setIsLunchRecess(newState);

    broadcastQueueEvent({
      type: 'OFFICER_STATUS',
      tokenNumber: '',
      counterNumber: selectedCounter,
      timestamp: Date.now(),
      payload: { isLunch: newState }
    });

    if (newState) {
      speakGuidance(`કાઉન્ટર ${selectedCounter} પર લંચ રિસેસ શરૂ થયેલ છે.`);
    } else {
      speakGuidance(`કાઉન્ટર ${selectedCounter} પર કામગીરી પુનઃ શરૂ થયેલ છે.`);
    }
  };

  // Waiting count
  const waitingCount = queue.filter(c => c.status === 'WAITING' || c.status === 'LATE').length;

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#1F2937] flex flex-col">
      {/* 🏛️ COUNTER OPERATOR CONSOLE HEADER */}
      <header className="bg-gradient-to-r from-[#003366] via-[#004080] to-[#002244] text-white border-b-2 border-[#FF9933] shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1 text-xs font-bold"
              title="નાગરિક પોર્ટલ પર પાછા જાઓ"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">નાગરિક પોર્ટલ</span>
            </Link>
            
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-[#FF9933] text-lg shadow-inner">
              🏛️
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest text-[#FF9933] uppercase bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded">
                  જન સેવા અધિકારી ડેસ્ક • સરકારી સેવા ઇન્ટરફેસ
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-300 font-bold hidden md:inline">લાઇવ નેટવર્ક કનેક્ટેડ</span>
              </div>
              <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>ગુજરાત ઈ-જન સેવા • કાઉન્ટર ઓપરેટર કન્સોલ</span>
              </h1>
            </div>
          </div>

          {/* Officer Profile Badge & Collector Link */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/admin/collector"
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-[#FF9933] border border-[#FF9933]/50 text-[11px] sm:text-xs font-black transition flex items-center gap-1"
              title="કલેક્ટર કમાન્ડ સેન્ટર"
            >
              <span>👑 કલેક્ટર ડેશબોર્ડ</span>
            </Link>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-white">શ્રી કે. એમ. ત્રિવેદી</p>
              <p className="text-[10px] text-blue-200 font-mono">નાયબ મામલતદાર (વર્ગ-૨) • GUJ-REV-8492</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-amber-400/20 border-2 border-[#FF9933] text-[#FF9933] flex items-center justify-center font-black text-sm shadow">
              KT
            </div>
          </div>
        </div>
      </header>

      {/* 🧭 JURISDICTION & COUNTER SELECTOR STRIP */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2.5 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 font-bold text-[#003366]">
              <Building className="w-4 h-4 text-[#005A9C]" />
              <span>કચેરી અધિકારક્ષેત્ર:</span>
            </div>

            {/* District Selector */}
            <select
              value={selectedDistrictId}
              onChange={(e) => {
                setSelectedDistrictId(e.target.value);
                const d = GUJARAT_33_DISTRICTS.find(x => x.id === e.target.value);
                if (d && d.talukas[0]) setSelectedTalukaId(d.talukas[0].id);
              }}
              className="bg-slate-50 border border-slate-300 font-bold text-slate-800 rounded-lg px-2.5 py-1 text-xs focus:ring-2 focus:ring-[#003366]"
            >
              {GUJARAT_33_DISTRICTS.map(d => (
                <option key={d.id} value={d.id}>{d.nameGu} ({d.nameEn})</option>
              ))}
            </select>

            {/* Taluka Selector */}
            <select
              value={selectedTalukaId}
              onChange={(e) => setSelectedTalukaId(e.target.value)}
              className="bg-slate-50 border border-slate-300 font-bold text-slate-800 rounded-lg px-2.5 py-1 text-xs focus:ring-2 focus:ring-[#003366]"
            >
              {currentDistrict.talukas.map(t => (
                <option key={t.id} value={t.id}>{t.nameGu} - {t.officeNameGu}</option>
              ))}
            </select>

            {/* Counter Switcher */}
            <select
              value={selectedCounter}
              onChange={(e) => setSelectedCounter(Number(e.target.value))}
              className="bg-blue-50 border border-blue-300 font-black text-[#003366] rounded-lg px-2.5 py-1 text-xs focus:ring-2 focus:ring-[#003366]"
            >
              <option value={1}>કાઉન્ટર ૧: આવક & પ્રમાણપત્રો (Revenue)</option>
              <option value={2}>કાઉન્ટર ૨: રેશન કાર્ડ & અન્ન પુરવઠો</option>
              <option value={3}>કાઉન્ટર ૩: ઈ-ધરા ૭/૧૨ જમીન રેકોર્ડ</option>
              <option value={4}>કાઉન્ટર ૪: સામાજિક સુરક્ષા & પેન્શન</option>
              <option value={5}>કાઉન્ટર ૫: આયુષ્માન ભારત & PMJAY</option>
              <option value={6}>કાઉન્ટર ૬: સોગંદનામું & નોટરી એટેસ્ટેશન</option>
            </select>
          </div>

          {/* Lunch Recess Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleLunch}
              className={`px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 transition active:scale-95 ${
                isLunchRecess 
                  ? 'bg-red-600 text-white animate-pulse' 
                  : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>{isLunchRecess ? '⚠️ લંચ રિસેસ સક્રિય છે' : '☕ લંચ રિસેસ (1:10 PM)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 📊 KPI SUMMARY STRIP */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 w-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#005A9C] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">પેન્ડિંગ કતાર</p>
              <p className="text-lg font-black text-[#003366]">{waitingCount} નાગરિકો</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">આજે નિકાલ</p>
              <p className="text-lg font-black text-emerald-700">{stats.servedToday} પૂર્ણ</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">વરિષ્ઠ ફાસ્ટ-ટ્રેક</p>
              <p className="text-lg font-black text-amber-700">{stats.priorityServed} અગ્રતા</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">સરેરાશ સમય</p>
              <p className="text-lg font-black text-indigo-700">{stats.avgMinutes} મિનિટ</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🖥️ MAIN CONSOLE GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 w-full grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        
        {/* LEFT COLUMN: ACTIVE SERVING HUD (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* ACTIVE CITIZEN CARD */}
          <div className="bg-white rounded-3xl border-2 border-[#003366]/20 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#003366] to-[#005A9C] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-black uppercase tracking-wider">
                  કાઉન્ટર {selectedCounter} • લાઈવ સંચાલન (Now Serving Desk)
                </span>
              </div>
              {currentServing && (
                <div className="bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-full text-xs font-mono font-black flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTime(elapsedSeconds)} / 15:00</span>
                </div>
              )}
            </div>

            <div className="p-5">
              {currentServing ? (
                <div className="space-y-4">
                  
                  {/* Token & Priority Tag */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-black font-mono text-[#FF9933] drop-shadow-xs">
                          {currentServing.tokenNumber}
                        </span>
                        {currentServing.isPriority && (
                          <span className="bg-[#FF9933] text-slate-900 font-black text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                            ⭐ વરિષ્ઠ નાગરિક અગ્રતા પાસ
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-black text-slate-900 mt-1">
                        {currentServing.citizenName}
                      </h3>
                      <p className="text-xs text-[#005A9C] font-bold">
                        {currentServing.schemeTitleGu}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-mono">મોબાઈલ</span>
                      <span className="text-xs font-mono font-bold text-slate-700">{currentServing.phone}</span>
                      <span className="text-[10px] text-slate-400 block font-mono mt-1">આધાર છેલ્લો અંક</span>
                      <span className="text-xs font-mono font-bold text-slate-700">XXXX-{currentServing.aadhaarLast4}</span>
                    </div>
                  </div>

                  {/* OCR & Pre-Verification Box */}
                  <div className="bg-emerald-50/80 border border-emerald-300 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-black text-emerald-900">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        દસ્તાવેજ OCR & પ્રી-વેરિફિકેશન (Pre-check Passed)
                      </span>
                      <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full">
                        ઓટોમેટેડ પ્રી-ચેક
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800 font-semibold leading-relaxed">
                      {currentServing.aiOcrVerdict}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-emerald-200 text-[11px] text-emerald-900">
                      <span>ઘોષિત વાર્ષિક આવક: <strong>{currentServing.incomeDeclared}</strong></span>
                      <button
                        onClick={() => setDocModalOpen(true)}
                        className="underline font-bold text-[#005A9C] hover:text-[#003366] flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        અસલ કાગળો જુઓ
                      </button>
                    </div>
                  </div>

                  {/* GRTSA 2013 SLA Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                      <span className="text-slate-600">GRTSA 2013 નાગરિક અધિકાર પત્રક (SLA ટાર્ગેટ):</span>
                      <span className={elapsedSeconds > 900 ? 'text-red-600 font-black' : 'text-[#005A9C]'}>
                        {formatTime(elapsedSeconds)} / 15:00 મિનિટ
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          elapsedSeconds > 900 
                            ? 'bg-red-500' 
                            : elapsedSeconds > 600 
                              ? 'bg-amber-500' 
                              : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min((elapsedSeconds / 900) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Primary Officer Action Buttons */}
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      onClick={handleMarkComplete}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>કામગીરી પૂર્ણ (Done)</span>
                    </button>

                    <button
                      onClick={() => setTransferModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                      <span>કાઉન્ટર ટ્રાન્સફર</span>
                    </button>

                    <button
                      onClick={handleSkipAbsent}
                      className="bg-slate-200 hover:bg-red-50 text-slate-700 hover:text-red-600 font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span>ગેરહાજર (Skip)</span>
                    </button>
                  </div>

                </div>
              ) : (
                /* No Active Citizen State */
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#005A9C] flex items-center justify-center mx-auto border-2 border-blue-200">
                    <UserCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800">
                      કાઉન્ટર હાલ મુક્ત છે (Ready for Next Citizen)
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      આગામી અરજદારને બોલાવવા માટે નીચે આપેલા બટન પર ક્લિક કરો. વરિષ્ઠ નાગરિકોને નિયમ મુજબ પ્રથમ સ્થાન અપાશે.
                    </p>
                  </div>

                  <button
                    onClick={() => handleCallNext()}
                    disabled={waitingCount === 0}
                    className="bg-[#003366] hover:bg-[#002244] disabled:bg-slate-300 text-white font-black py-3.5 px-6 rounded-2xl text-sm flex items-center justify-center gap-2 mx-auto shadow-xl transition active:scale-95 cursor-pointer"
                  >
                    <Volume2 className="w-5 h-5 text-[#FF9933]" />
                    <span>આગામી ટોકન બોલાવો (Call Next)</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* QUICK BROADCAST ACTION BAR */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
              લાઈવ બ્રોડકાસ્ટ નિયંત્રણ:
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  triggerHaptic('tap');
                  playOfficialGovChime();
                  speakGuidance(`ધ્યાન આપો, તમામ અરજદારો પોતાના અસલ આધાર કાર્ડ સાથે કાઉન્ટર ૧ પાસે લાઈનમાં ઉપસ્થિત રહે.`);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition flex items-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#005A9C]" />
                <span>સામાન્ય સૂચના અવાજ</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic('success');
                  alert("નવા ટોકન્સ લાઈવ રિફ્રેશ થયા.");
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                <span>કતાર રીફ્રેશ</span>
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: WAITING QUEUE STREAM (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col h-full">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div>
                <h3 className="text-sm font-black text-[#003366] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#FF9933]" />
                  <span>પ્રતીક્ષારત નાગરિકોની કતાર ({waitingCount})</span>
                </h3>
                <p className="text-[10px] text-slate-400">વરિષ્ઠ/દિવ્યાંગ નાગરિકો અગ્રતા ક્રમે</p>
              </div>

              <span className="text-[10px] font-bold bg-blue-50 text-[#005A9C] px-2 py-0.5 rounded-full border border-blue-200">
                કાઉન્ટર {selectedCounter}
              </span>
            </div>

            {/* Scrollable Citizen List */}
            <div className="space-y-2.5 overflow-y-auto max-h-[580px] pr-1">
              {queue.map((citizen) => {
                const isCurrentlyServing = currentServing?.id === citizen.id;

                return (
                  <div
                    key={citizen.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isCurrentlyServing
                        ? 'bg-blue-50/80 border-[#003366] shadow-sm'
                        : citizen.isPriority
                          ? 'bg-amber-50/60 border-amber-300'
                          : citizen.status === 'LATE'
                            ? 'bg-red-50/60 border-red-200'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base font-black font-mono text-[#003366]">
                            {citizen.tokenNumber}
                          </span>
                          
                          {citizen.isPriority && (
                            <span className="bg-[#FF9933] text-slate-900 font-black text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                              ⭐ વરિષ્ઠ
                            </span>
                          )}

                          {citizen.status === 'LATE' && (
                            <span className="bg-red-100 text-red-800 font-bold text-[9px] px-1.5 py-0.5 rounded-full">
                              +{citizen.lateMinutes}m મોડું
                            </span>
                          )}

                          {isCurrentlyServing && (
                            <span className="bg-emerald-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full animate-pulse">
                              હાલમાં ચાલુ
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-black text-slate-900 mt-1 line-clamp-1">
                          {citizen.citizenName}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {citizen.schemeTitleGu}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {citizen.appliedTime}
                        </span>

                        {!isCurrentlyServing && citizen.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleCallNext(citizen)}
                            className="mt-1.5 bg-[#003366] hover:bg-[#002244] text-white font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 transition active:scale-95 shadow-xs"
                          >
                            <span>બોલાવો</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </main>

      {/* 📄 1. CITIZEN ORIGINAL DOCUMENTS INSPECTION MODAL */}
      {docModalOpen && currentServing && (
        <div 
          onClick={() => setDocModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 modal-backdrop animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#005A9C] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#003366]">અરજદાર અસલ દસ્તાવેજ નિરીક્ષણ</h4>
                  <p className="text-[10px] text-slate-400 font-mono">ટોકન: {currentServing.tokenNumber} • {currentServing.citizenName}</p>
                </div>
              </div>
              <button 
                onClick={() => setDocModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {currentServing.documents.map((doc, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-slate-800">{doc.name}</span>
                  </div>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    પ્રી-ચેક પાસ (Pre-check Passed)
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-[11px] text-[#003366]">
              <strong>અધિકારી નિરીક્ષણ સૂચના:</strong> આ દસ્તાવેજોનું સિસ્ટમ પ્રી-ચેક (OCR + Rule Engine) પૂર્ણ થયેલ છે. આખરી ખરાઈ અને મંજૂરી અધિકૃત સરકારી અધિકારી દ્વારા કરવામાં આવે છે.
            </div>

            <button
              onClick={() => setDocModalOpen(false)}
              className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold py-2.5 rounded-xl text-xs transition"
            >
              નિરીક્ષણ પૂર્ણ (Close Preview)
            </button>
          </div>
        </div>
      )}

      {/* 🔄 2. CROSS-COUNTER FORWARDING MODAL */}
      {transferModalOpen && currentServing && (
        <div 
          onClick={() => setTransferModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 modal-backdrop animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#005A9C] flex items-center justify-center">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#003366]">કાઉન્ટર ફોરવર્ડ / ટ્રાન્સફર</h4>
                  <p className="text-[10px] text-slate-400 font-mono">ટોકન: {currentServing.tokenNumber}</p>
                </div>
              </div>
              <button 
                onClick={() => setTransferModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">કયા કાઉન્ટર પર મોકલવા માંગો છો?</label>
                <select
                  value={targetCounter}
                  onChange={(e) => setTargetCounter(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                >
                  <option value={2}>કાઉન્ટર ૨: રેશન કાર્ડ & અન્ન પુરવઠો</option>
                  <option value={3}>કાઉન્ટર ૩: ઈ-ધરા ૭/૧૨ જમીન રેકોર્ડ</option>
                  <option value={4}>કાઉન્ટર ૪: સામાજિક સુરક્ષા & પેન્શન</option>
                  <option value={5}>કાઉન્ટર ૫: આયુષ્માન ભારત & આરોગ્ય</option>
                  <option value={6}>કાઉન્ટર ૬: સોગંદનામું & નોટરી એટેસ્ટેશન</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ટ્રાન્સફર નોંધ / કારણ (Remarks):</label>
                <textarea
                  value={transferRemarks}
                  onChange={(e) => setTransferRemarks(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setTransferModalOpen(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition"
              >
                રદ કરો
              </button>
              <button
                onClick={handleConfirmTransfer}
                className="flex-1 bg-[#003366] hover:bg-[#002244] text-white font-bold py-2.5 rounded-xl text-xs transition"
              >
                ટ્રાન્સફર મંજૂર કરો
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
