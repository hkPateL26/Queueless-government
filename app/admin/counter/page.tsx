'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, Volume2, CheckCircle2, AlertTriangle, UserCheck, 
  Clock, ArrowRight, Search, Building, Users, Radio, FileText, 
  Coffee, ArrowRightLeft, RotateCcw, Check, X, ChevronDown, 
  ExternalLink, Eye, Printer, ArrowLeft, Sparkles, Star, Award, 
  AlertCircle, Phone, Lock, ChevronRight, RefreshCw, Layers, History, BadgeCheck
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { speakGuidance } from '@/lib/voice';
import { 
  playNotificationChime, broadcastQueueEvent, subscribeToQueueEvents, QueueEvent 
} from '@/lib/realtime-bus';
import { GUJARAT_33_DISTRICTS, DistrictItem, TalukaOffice } from '@/lib/jurisdiction-data';
import { GovLogo } from '@/components/GovLogo';
import { GovTelemetryMarquee } from '@/components/GovTelemetryMarquee';

interface QueueCitizen {
  id: string;
  tokenNumber: string;
  citizenName: string;
  phone: string;
  schemeTitleGu: string;
  schemeTitleEn: string;
  counterNumber: number;
  isPriority: boolean; // Configurable policy: Senior Citizen (60+) / Divyangjan
  appliedTime: string;
  waitingMinutes: number; // Citizen Waiting Time (before desk handling)
  status: 'WAITING' | 'CALLED' | 'IN_SERVICE' | 'COMPLETED' | 'SKIPPED' | 'LATE';
  lateMinutes?: number;
  aadhaarLast4: string;
  incomeDeclared: string;
  aiOcrVerdict: string;
  documents: { name: string; status: 'PRE_CHECK_PASSED' | 'PENDING' }[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  officerName: string;
  action: 'CALLED' | 'COMPLETED' | 'SKIPPED' | 'RECALLED' | 'TRANSFERRED' | 'LUNCH_BREAK';
  tokenNumber: string;
  counterNumber: number;
  remarks: string;
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
    waitingMinutes: 12,
    status: 'WAITING',
    aadhaarLast4: '7104',
    incomeDeclared: '₹ ૯૫,૦૦૦ (વાર્ષિક)',
    aiOcrVerdict: '✓ ઓટોમેટેડ પ્રી-ચેક સફળ: આવક ₹૯૫,૦૦૦ (નિયમ મુજબ મર્યાદા હેઠળ)',
    documents: [
      { name: 'આધાર કાર્ડ (માસ્ક્ડ આધાર XXXX-XXXX-7104)', status: 'PRE_CHECK_PASSED' },
      { name: 'પતિના અવસાનનો દાખલો', status: 'PRE_CHECK_PASSED' },
      { name: 'આવકનો દાખલો (સક્ષમ અધિકારી)', status: 'PRE_CHECK_PASSED' }
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
    waitingMinutes: 18,
    status: 'WAITING',
    aadhaarLast4: '8842',
    incomeDeclared: '₹ ૧,૨૦,૦૦૦ (વાર્ષિક)',
    aiOcrVerdict: '✓ ઓટોમેટેડ પ્રી-ચેક સફળ: આવક ₹૧,૨૦,૦૦૦ (તલાટી રિપોર્ટ સુસંગત)',
    documents: [
      { name: 'આધાર કાર્ડ (માસ્ક્ડ આધાર XXXX-XXXX-8842)', status: 'PRE_CHECK_PASSED' },
      { name: 'ચાલુ વર્ષનો આવકનો દાખલો', status: 'PRE_CHECK_PASSED' },
      { name: 'રેશન કાર્ડ નકલ', status: 'PRE_CHECK_PASSED' }
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
    waitingMinutes: 14,
    status: 'WAITING',
    aadhaarLast4: '4192',
    incomeDeclared: '₹ ૨,૪૦,૦૦૦ (વાર્ષિક)',
    aiOcrVerdict: '✓ ઓટોમેટેડ પ્રી-ચેક સફળ: આવક ₹૨,૪૦,૦૦૦ (EWS મર્યાદા હેઠળ)',
    documents: [
      { name: 'આધાર કાર્ડ (માસ્ક્ડ આધાર XXXX-XXXX-4192)', status: 'PRE_CHECK_PASSED' },
      { name: 'આવક પંચનામું', status: 'PRE_CHECK_PASSED' }
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
    waitingMinutes: 9,
    status: 'WAITING',
    aadhaarLast4: '9921',
    incomeDeclared: '₹ ૧,૫૦,૦૦૦ (વાર્ષિક)',
    aiOcrVerdict: '✓ ઓટોમેટેડ પ્રી-ચેક સફળ: દસ્તાવેજો સુસંગત',
    documents: [
      { name: 'આધાર કાર્ડ (માસ્ક્ડ આધાર XXXX-XXXX-9921)', status: 'PRE_CHECK_PASSED' },
      { name: 'લગ્ન નોંધણી પ્રમાણપત્ર', status: 'PRE_CHECK_PASSED' }
    ]
  }
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-1',
    timestamp: '10:30:15 AM',
    officerName: 'શ્રી કે. એમ. ત્રિવેદી (નાયબ મામલતદાર)',
    action: 'CALLED',
    tokenNumber: '#A-40',
    counterNumber: 1,
    remarks: 'નિયમિત કતાર ક્રમ મુજબ બોલાવ્યા'
  },
  {
    id: 'aud-2',
    timestamp: '10:35:48 AM',
    officerName: 'શ્રી કે. એમ. ત્રિવેદી (નાયબ મામલતદાર)',
    action: 'COMPLETED',
    tokenNumber: '#A-40',
    counterNumber: 1,
    remarks: 'આવક પ્રમાણપત્ર અરજી મંજૂર (સેવા સમય: ૫:૩૩)'
  }
];

// Configurable Service Handling Target (in minutes)
const SERVICE_SLA_CONFIG = {
  serviceName: 'આવક & જાતિ પ્રમાણપત્રો (Revenue Desk)',
  targetMinutes: 15,
  warningMinutes: 10,
};

export default function CounterOperatorDesk() {
  // Jurisdiction & Officer Profile
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('rajkot');
  const [selectedTalukaId, setSelectedTalukaId] = useState<string>('gondal');
  const [selectedCounter, setSelectedCounter] = useState<number>(1);
  const [isLunchRecess, setIsLunchRecess] = useState<boolean>(false);
  const [realtimeConnected, setRealtimeConnected] = useState<boolean>(true);

  // Queue state
  const [queue, setQueue] = useState<QueueCitizen[]>(INITIAL_QUEUE);
  const [currentServing, setCurrentServing] = useState<QueueCitizen | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [docModalOpen, setDocModalOpen] = useState<boolean>(false);
  const [transferModalOpen, setTransferModalOpen] = useState<boolean>(false);
  const [targetCounter, setTargetCounter] = useState<number>(2);
  const [transferRemarks, setTransferRemarks] = useState<string>('અરજદારને સોગંદનામા માટે મોકલવામાં આવ્યા છે.');
  const [queueTab, setQueueTab] = useState<'WAITING' | 'SKIPPED'>('WAITING');

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [auditPanelOpen, setAuditPanelOpen] = useState<boolean>(false);

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

  // Desk Handling-Time Stopwatch
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

  // Subscribe to external queue events via backend realtime layer
  useEffect(() => {
    const unsubscribe = subscribeToQueueEvents((event) => {
      if (event.type === 'LATE_SHIFTED') {
        setQueue(prev => prev.map(c => {
          if (c.tokenNumber === event.tokenNumber) {
            return { ...c, status: 'LATE', lateMinutes: (c.lateMinutes || 0) + 30 };
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

  // Add audit trail event
  const addAuditLog = (action: AuditLogEntry['action'], tokenNumber: string, remarks: string) => {
    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      officerName: 'શ્રી કે. એમ. ત્રિવેદી (નાયબ મામલતદાર)',
      action,
      tokenNumber,
      counterNumber: selectedCounter,
      remarks
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  // 1. CALL NEXT TOKEN (Priority Queue Policy Engine)
  const handleCallNext = async (targetCitizen?: QueueCitizen) => {
    triggerHaptic('success');
    playNotificationChime();

    // Pick target citizen or priority-policy-eligible citizen first, then next waiting
    let nextCitizen: QueueCitizen | undefined = targetCitizen;
    if (!nextCitizen) {
      const priorityNext = queue.find(c => (c.status === 'WAITING' || c.status === 'LATE') && c.isPriority);
      nextCitizen = priorityNext || queue.find(c => c.status === 'WAITING' || c.status === 'LATE');
    }

    if (!nextCitizen) {
      alert("કતારમાં હાલ કોઈ નવો નાગરિક પ્રતીક્ષામાં નથી.");
      return;
    }

    // Double-action protection: check if already in service
    if (currentServing && currentServing.id === nextCitizen.id) {
      alert(`ટોકન ${nextCitizen.tokenNumber} હાલમાં આ કાઉન્ટર પર સક્રિય છે.`);
      return;
    }

    setCurrentServing(nextCitizen);
    setElapsedSeconds(0);

    // Update state to IN_SERVICE
    setQueue(prev => prev.map(c => 
      c.id === nextCitizen!.id ? { ...c, status: 'IN_SERVICE' } : c
    ));

    // Audit log
    addAuditLog('CALLED', nextCitizen.tokenNumber, nextCitizen.isPriority 
      ? 'અગ્રતા નીતિ હેઠળ પ્રાથમિકતાથી બોલાવ્યા' 
      : 'નિયમિત કતાર ક્રમ મુજબ બોલાવ્યા');

    // Broadcast through backend realtime layer
    broadcastQueueEvent({
      type: 'TOKEN_CALLED',
      tokenNumber: nextCitizen.tokenNumber,
      counterNumber: selectedCounter,
      counterNameGu: 'આવક & જાતિ પ્રમાણપત્ર',
      talukaId: selectedTalukaId,
      timestamp: Date.now()
    });

    // Voice announcement in Gujarati (with audio chime and visual fallback)
    const voiceMsg = nextCitizen.isPriority
      ? `ધ્યાન આપો, પ્રાથમિકતા ટોકન નંબર ${nextCitizen.tokenNumber}, કાઉન્ટર ${selectedCounter} પર ઉપસ્થિત થાવ.`
      : `ધ્યાન આપો, કાઉન્ટર ${selectedCounter} પર ટોકન નંબર ${nextCitizen.tokenNumber} નો વારો આવી ગયો છે.`;
    speakGuidance(voiceMsg);
  };

  // 2. RE-CALL ACTIVE OR SKIPPED CITIZEN
  const handleReCall = (citizenToReCall?: QueueCitizen) => {
    const target = citizenToReCall || currentServing;
    if (!target) return;

    triggerHaptic('tap');
    playNotificationChime();

    addAuditLog('RECALLED', target.tokenNumber, 'અરજદારને પુનઃ ઘોષણા દ્વારા બોલાવવામાં આવ્યા');

    broadcastQueueEvent({
      type: 'TOKEN_RECALLED',
      tokenNumber: target.tokenNumber,
      counterNumber: selectedCounter,
      counterNameGu: 'આવક & જાતિ પ્રમાણપત્ર',
      talukaId: selectedTalukaId,
      timestamp: Date.now()
    });

    speakGuidance(`ધ્યાન આપો, કાઉન્ટર ${selectedCounter} પર ટોકન નંબર ${target.tokenNumber} ને ફરીથી બોલાવવામાં આવે છે.`);
  };

  // 3. COMPLETE SERVICE & ISSUE PASS
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

    addAuditLog('COMPLETED', completed.tokenNumber, `કામગીરી પૂર્ણ. સેવા સમય: ${formatTime(elapsedSeconds)}`);

    broadcastQueueEvent({
      type: 'TOKEN_COMPLETED',
      tokenNumber: completed.tokenNumber,
      counterNumber: selectedCounter,
      timestamp: Date.now()
    });

    speakGuidance(`ટોકન નંબર ${completed.tokenNumber} ની કામગીરી પૂર્ણ થયેલ છે.`);
    alert(`✅ સફળતાપૂર્વક નિકાલ!\n\nટોકન: ${completed.tokenNumber} (${completed.citizenName})\nડેસ્ક સેવા સમય: ${formatTime(elapsedSeconds)}\nસ્થિતિ: અધિકૃત સરકારી અધિકારી દ્વારા ખરાઈ પૂર્ણ.`);
    setCurrentServing(null);
  };

  // 4. SKIP / ABSENT (Keeps record, does not delete)
  const handleSkipAbsent = () => {
    if (!currentServing) return;
    triggerHaptic('warning');

    const skipped = currentServing;
    setQueue(prev => prev.map(c => 
      c.id === skipped.id ? { ...c, status: 'SKIPPED' } : c
    ));

    setStats(prev => ({ ...prev, skippedCount: prev.skippedCount + 1 }));

    addAuditLog('SKIPPED', skipped.tokenNumber, 'અરજદાર ગેરહાજર (Citizen absent)');

    broadcastQueueEvent({
      type: 'TOKEN_SKIPPED',
      tokenNumber: skipped.tokenNumber,
      counterNumber: selectedCounter,
      timestamp: Date.now()
    });

    speakGuidance(`ટોકન નંબર ${skipped.tokenNumber} ગેરહાજર નોંધાયેલ છે.`);
    setCurrentServing(null);
  };

  // 5. TRANSFER TO ANOTHER COUNTER
  const handleConfirmTransfer = () => {
    if (!currentServing) return;
    triggerHaptic('tap');

    const transferred = currentServing;
    setQueue(prev => prev.filter(c => c.id !== transferred.id));

    addAuditLog(
      'TRANSFERRED', 
      transferred.tokenNumber, 
      `કાઉન્ટર ${selectedCounter} થી કાઉન્ટર ${targetCounter} પર ટ્રાન્સફર. કારણ: ${transferRemarks}`
    );

    broadcastQueueEvent({
      type: 'TOKEN_TRANSFERRED',
      tokenNumber: transferred.tokenNumber,
      counterNumber: targetCounter,
      counterNameGu: `કાઉન્ટર ${targetCounter}`,
      talukaId: selectedTalukaId,
      timestamp: Date.now(),
      payload: { 
        transferredFrom: selectedCounter, 
        transferredTo: targetCounter, 
        remarks: transferRemarks 
      }
    });

    alert(`🔄 કાઉન્ટર ટ્રાન્સફર નોંધાયું!\n\nટોકન: ${transferred.tokenNumber}\nમૂળ કાઉન્ટર: કાઉન્ટર ${selectedCounter}\nનવું કાઉન્ટર: કાઉન્ટર ${targetCounter}\nનોંધ: ${transferRemarks}`);
    setTransferModalOpen(false);
    setCurrentServing(null);
  };

  // 6. TOGGLE LUNCH RECESS
  const handleToggleLunch = () => {
    triggerHaptic('warning');
    const newState = !isLunchRecess;
    setIsLunchRecess(newState);

    addAuditLog('LUNCH_BREAK', '—', newState ? 'ભોજન વિરામ શરૂ (1:10 PM - 2:00 PM)' : 'કામગીરી પુનઃ શરૂ');

    broadcastQueueEvent({
      type: 'COUNTER_STATUS_CHANGED',
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

  // SLA calculations
  const elapsedMinutes = elapsedSeconds / 60;
  const isOverTarget = elapsedMinutes >= SERVICE_SLA_CONFIG.targetMinutes;
  const isApproachingTarget = elapsedMinutes >= SERVICE_SLA_CONFIG.warningMinutes && !isOverTarget;

  // Filter queues
  const waitingList = queue.filter(c => c.status === 'WAITING' || c.status === 'LATE');
  const skippedList = queue.filter(c => c.status === 'SKIPPED');
  const waitingCount = waitingList.length;

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#1F2937] flex flex-col w-full">
      {/* 🚀 LIVE GUJARAT GOVERNMENT TELEMETRY & SYSTEM HEALTH MARQUEE */}
      <GovTelemetryMarquee />

      {/* 🟠 DEMO MODE BANNER */}
      <div className="bg-amber-500 text-slate-900 text-xs px-4 py-1.5 font-bold flex flex-wrap items-center justify-between border-b border-amber-600 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="bg-slate-900 text-amber-300 text-[10px] uppercase font-black px-1.5 py-0.5 rounded">
            🟠 DEMO MODE
          </span>
          <span>
            ડેમો ઓફિસર પર્સોના (મૂલ્યાંકન હેતુ) • વાસ્તવિક સરકારી ડિપ્લોયમેન્ટ માટે ભૂમિકા-આધારિત પ્રમાણીકરણ (RBAC) આવશ્યક છે.
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className={`w-2 h-2 rounded-full ${realtimeConnected ? 'bg-emerald-900 animate-pulse' : 'bg-red-800'}`} />
          <span>{realtimeConnected ? 'રીઅલ-ટાઇમ બેકએન્ડ સિંક સક્રિય' : 'પુનઃ કનેક્ટિંગ...'}</span>
        </div>
      </div>

      {/* 🏛️ COUNTER OPERATOR CONSOLE HEADER */}
      <header className="bg-gradient-to-r from-[#003366] via-[#004080] to-[#002244] text-white border-b-2 border-[#FF9933] shadow-md sticky top-0 z-40">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1 text-xs font-bold"
              title="નાગરિક પોર્ટલ પર પાછા જાઓ"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">નાગરિક પોર્ટલ</span>
            </Link>
            
            <GovLogo className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 drop-shadow-md" />

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest text-[#FF9933] uppercase bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded">
                  જન સેવા અધિકારી ડેસ્ક • પ્રશાસનિક પોર્ટલ
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-300 font-bold hidden md:inline">લાઇવ સિંક્રોનાઇઝ્ડ</span>
              </div>
              <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>કાઉન્ટર ઓપરેટર કન્સોલ • ઈ-જન સેવા ડેસ્ક</span>
              </h1>
            </div>
          </div>

          {/* Officer Persona & Collector Link */}
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
              <p className="text-[10px] text-blue-200 font-mono">નાયબ મામલતદાર • ડેમો પર્સોના</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-amber-400/20 border-2 border-[#FF9933] text-[#FF9933] flex items-center justify-center font-black text-sm shadow">
              KT
            </div>
          </div>
        </div>
      </header>

      {/* 🧭 JURISDICTION & CONFIGURABLE COUNTER SELECTOR STRIP */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 xl:px-12 py-2.5 shadow-xs">
        <div className="w-full max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 font-bold text-[#003366]">
              <Building className="w-4 h-4 text-[#005A9C]" />
              <span>કચેરી & કાઉન્ટર રૂપરેખા:</span>
            </div>

            {/* District Selector */}
            <select
              value={selectedDistrictId}
              onChange={(e) => {
                setSelectedDistrictId(e.target.value);
                const d = GUJARAT_33_DISTRICTS.find(x => x.id === e.target.value);
                if (d && d.talukas[0]) setSelectedTalukaId(d.talukas[0].id);
              }}
              className="bg-slate-50 border border-slate-300 font-bold text-slate-800 rounded-lg px-2.5 py-1 text-xs focus:ring-2 focus:ring-[#003366] max-w-[160px] sm:max-w-[200px] truncate"
            >
              {GUJARAT_33_DISTRICTS.map(d => (
                <option key={d.id} value={d.id}>{d.nameGu} ({d.nameEn})</option>
              ))}
            </select>

            {/* Taluka Selector */}
            <select
              value={selectedTalukaId}
              onChange={(e) => setSelectedTalukaId(e.target.value)}
              className="bg-slate-50 border border-slate-300 font-bold text-slate-800 rounded-lg px-2.5 py-1 text-xs focus:ring-2 focus:ring-[#003366] max-w-[180px] sm:max-w-[220px] truncate"
            >
              {currentDistrict.talukas.map(t => (
                <option key={t.id} value={t.id}>{t.nameGu} ({t.nameEn})</option>
              ))}
            </select>

            {/* Configurable Counter Switcher */}
            <select
              value={selectedCounter}
              onChange={(e) => setSelectedCounter(Number(e.target.value))}
              className="bg-blue-50 border border-blue-300 font-black text-[#003366] rounded-lg px-2.5 py-1 text-xs focus:ring-2 focus:ring-[#003366]"
              title="કોન્ફિગરેબલ સેવા કાઉન્ટર્સ"
            >
              <option value={1}>કાઉન્ટર ૧: આવક & પ્રમાણપત્રો (Revenue)</option>
              <option value={2}>કાઉન્ટર ૨: રેશન કાર્ડ & અન્ન પુરવઠો</option>
              <option value={3}>કાઉન્ટર ૩: ઈ-ધરા ૭/૧૨ જમીન રેકોર્ડ</option>
              <option value={4}>કાઉન્ટર ૪: સામાજિક સુરક્ષા & પેન્શન</option>
              <option value={5}>કાઉન્ટર ૫: આયુષ્માન ભારત & આરોગ્ય</option>
              <option value={6}>કાઉન્ટર ૬: સોગંદનામું & નોટરી એટેસ્ટેશન</option>
            </select>
          </div>

          {/* Audit Log & Lunch Recess Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAuditPanelOpen(!auditPanelOpen)}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 border border-slate-300 transition"
            >
              <History className="w-3.5 h-3.5 text-[#005A9C]" />
              <span>ઓડિટ લોગ ({auditLogs.length})</span>
            </button>

            <button
              onClick={handleToggleLunch}
              className={`px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 transition active:scale-95 ${
                isLunchRecess 
                  ? 'bg-red-600 text-white animate-pulse' 
                  : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>{isLunchRecess ? '⚠️ લંચ રિસેસ સક્રિય (પુનઃ શરૂ કરો)' : '☕ લંચ રિસેસ (1:10 PM)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 📊 KPI SUMMARY STRIP */}
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-4">
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
              <p className="text-[10px] text-slate-500 font-bold uppercase">અગ્રતા નીતિ નિકાલ</p>
              <p className="text-lg font-black text-amber-700">{stats.priorityServed} અગ્રતા</p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">સરેરાશ ડેસ્ક સમય</p>
              <p className="text-lg font-black text-indigo-700">{stats.avgMinutes} મિનિટ</p>
            </div>
          </div>
        </div>
      </div>

      {/* 📜 AUDIT TRAIL LOG PANEL (TOGGLEABLE) */}
      {auditPanelOpen && (
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-3 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-md p-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#005A9C]" />
                <h4 className="text-xs font-black text-[#003366] uppercase tracking-wide">
                  પ્રશાસનિક ઓડિટ ટ્રેઇલ (Administrative Audit Log)
                </h4>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">દરેક ક્રિયાનું ઓટોમેટેડ ઓડિટ રેકોર્ડિંગ</span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {auditLogs.map((log) => (
                <div key={log.id} className="text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                      {log.timestamp}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      log.action === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                      log.action === 'CALLED' ? 'bg-blue-100 text-blue-800' :
                      log.action === 'SKIPPED' ? 'bg-red-100 text-red-800' :
                      log.action === 'TRANSFERRED' ? 'bg-purple-100 text-purple-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {log.action}
                    </span>
                    <span className="font-mono font-bold text-[#003366]">{log.tokenNumber}</span>
                    <span className="text-slate-700">{log.remarks}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    કાઉન્ટર {log.counterNumber} • {log.officerName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 🖥️ MAIN CONSOLE GRID */}
      <main className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-5 grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        
        {/* LEFT COLUMN: ACTIVE SERVING HUD (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* ACTIVE CITIZEN CARD */}
          <div className="bg-white rounded-3xl border-2 border-[#003366]/20 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#003366] to-[#005A9C] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-black uppercase tracking-wider">
                  કાઉન્ટર {selectedCounter} • લાઈવ ડેસ્ક સંચાલન (Now Serving)
                </span>
              </div>
              {currentServing && (
                <div className="bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-full text-xs font-mono font-black flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>ડેસ્ક સેવા સમય: {formatTime(elapsedSeconds)}</span>
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
                          <span className="bg-[#FF9933] text-slate-900 font-black text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            ⭐ અગ્રતા પાસ (Configurable Priority Policy)
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
                      <span className="text-[10px] text-slate-400 block font-mono mt-1">ઓળખ (Masked)</span>
                      <span className="text-xs font-mono font-bold text-slate-700">XXXX-{currentServing.aadhaarLast4}</span>
                    </div>
                  </div>

                  {/* ⏱️ TIME SEPARATION HUD: WAITING TIME vs DESK HANDLING TIME */}
                  <div className="grid grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">કતાર પ્રતીક્ષા સમય</span>
                      <span className="font-mono font-black text-slate-800 text-sm">{currentServing.waitingMinutes} મિનિટ</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">ડેસ્ક સેવા સમય</span>
                      <span className="font-mono font-black text-[#005A9C] text-sm">{formatTime(elapsedSeconds)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">કુલ મુલાકાત સમય</span>
                      <span className="font-mono font-black text-indigo-700 text-sm">
                        {currentServing.waitingMinutes + Math.floor(elapsedSeconds / 60)} મિનિટ
                      </span>
                    </div>
                  </div>

                  {/* OCR & Pre-Verification Box */}
                  <div className="bg-emerald-50/80 border border-emerald-300 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-black text-emerald-900">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        દસ્તાવેજ પ્રી-વેરિફિકેશન સમીક્ષા (Pre-check Results)
                      </span>
                      <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                        Pre-check Passed
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
                        અપલોડ કરેલ કાગળો જુઓ
                      </button>
                    </div>
                  </div>

                  {/* ⏱️ SERVICE SLA / HANDLING-TIME STOPWATCH */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                      <span className="text-slate-600">
                        સેવા હેન્ડલિંગ ટાર્ગેટ ({SERVICE_SLA_CONFIG.serviceName}):
                      </span>
                      <span className={isOverTarget ? 'text-red-600 font-black' : isApproachingTarget ? 'text-amber-600 font-black' : 'text-emerald-700 font-black'}>
                        {isOverTarget ? '🔴 લક્ષ્ય ઓળંગેલ (Target Exceeded)' : isApproachingTarget ? '🟡 લક્ષ્ય નજીક (Approaching Target)' : '🟢 લક્ષ્ય હેઠળ (Within Target)'} • {formatTime(elapsedSeconds)} / {SERVICE_SLA_CONFIG.targetMinutes}:00
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          isOverTarget 
                            ? 'bg-red-500' 
                            : isApproachingTarget 
                              ? 'bg-amber-500' 
                              : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min((elapsedMinutes / SERVICE_SLA_CONFIG.targetMinutes) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Primary Officer Action Buttons */}
                  <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={handleMarkComplete}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
                      title="કામગીરી સફળતાપૂર્વક પૂર્ણ કરો"
                    >
                      <Check className="w-4 h-4" />
                      <span>પૂર્ણ (Done)</span>
                    </button>

                    <button
                      onClick={() => handleReCall()}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-black py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
                      title="અવાજ અને ચાઇમ દ્વારા ફરીથી બોલાવો"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>ફરીથી બોલાવો</span>
                    </button>

                    <button
                      onClick={() => setTransferModalOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
                      title="બીજા કાઉન્ટર પર મોકલો"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                      <span>ટ્રાન્સફર</span>
                    </button>

                    <button
                      onClick={handleSkipAbsent}
                      className="bg-slate-200 hover:bg-red-50 text-slate-700 hover:text-red-600 font-black py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                      title="ગેરહાજર નોંધો (ઓડિટ રેકોર્ડ રહેશે)"
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
                      આગામી અરજદારને બોલાવવા માટે નીચે આપેલા બટન પર ક્લિક કરો. કોન્ફિગરેબલ અગ્રતા નીતિ મુજબ પાત્ર નાગરિકોને પ્રથમ બોલાવાશે.
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
              કતાર સૂચના નિયંત્રણ:
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  triggerHaptic('tap');
                  playNotificationChime();
                  speakGuidance(`ધ્યાન આપો, તમામ અરજદારો પોતાના અસલ આધાર કાર્ડ સાથે કાઉન્ટર ૧ પાસે લાઈનમાં ઉપસ્થિત રહે.`);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition flex items-center gap-1.5"
                title="સામાન્ય કતાર સૂચના"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#005A9C]" />
                <span>સામાન્ય સૂચના અવાજ</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic('success');
                  alert("નવા ટોકન્સ રીઅલ-ટાઇમ બેકએન્ડ પરથી રિફ્રેશ થયા.");
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition flex items-center gap-1.5"
                title="કતાર ડેટા રિફ્રેશ"
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
                <p className="text-[10px] text-slate-400">અગ્રતા નીતિ એન્જિન • વરિષ્ઠ/દિવ્યાંગજન</p>
              </div>

              {/* Tabs for Waiting vs Skipped */}
              <div className="flex items-center gap-1 text-[10px] font-bold">
                <button
                  onClick={() => setQueueTab('WAITING')}
                  className={`px-2 py-1 rounded-lg transition ${queueTab === 'WAITING' ? 'bg-[#003366] text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  પ્રતીક્ષા ({waitingCount})
                </button>
                <button
                  onClick={() => setQueueTab('SKIPPED')}
                  className={`px-2 py-1 rounded-lg transition ${queueTab === 'SKIPPED' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  ગેરહાજર ({skippedList.length})
                </button>
              </div>
            </div>

            {/* Scrollable Citizen List */}
            <div className="space-y-2.5 overflow-y-auto max-h-[580px] pr-1">
              {(queueTab === 'WAITING' ? waitingList : skippedList).map((citizen) => {
                const isCurrentlyServing = currentServing?.id === citizen.id;

                return (
                  <div
                    key={citizen.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isCurrentlyServing
                        ? 'bg-blue-50/80 border-[#003366] shadow-sm'
                        : citizen.isPriority
                          ? 'bg-amber-50/60 border-amber-300'
                          : citizen.status === 'SKIPPED'
                            ? 'bg-red-50/50 border-red-200'
                            : citizen.status === 'LATE'
                              ? 'bg-amber-50/60 border-amber-200'
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
                              ⭐ અગ્રતા
                            </span>
                          )}

                          {citizen.status === 'SKIPPED' && (
                            <span className="bg-red-100 text-red-800 font-bold text-[9px] px-1.5 py-0.5 rounded-full">
                              ગેરહાજર
                            </span>
                          )}

                          {citizen.status === 'LATE' && (
                            <span className="bg-amber-100 text-amber-800 font-bold text-[9px] px-1.5 py-0.5 rounded-full">
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
                          પ્રતીક્ષા: {citizen.waitingMinutes}m
                        </span>

                        {!isCurrentlyServing && citizen.status !== 'COMPLETED' && (
                          <button
                            onClick={() => citizen.status === 'SKIPPED' ? handleReCall(citizen) : handleCallNext(citizen)}
                            className="mt-1.5 bg-[#003366] hover:bg-[#002244] text-white font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 transition active:scale-95 shadow-xs"
                          >
                            <span>{citizen.status === 'SKIPPED' ? 'રી-કોલ' : 'બોલાવો'}</span>
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
                  <h4 className="text-xs font-black text-[#003366]">અરજદાર દસ્તાવેજ નિરીક્ષણ (Officer Review)</h4>
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

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-900">
              <strong>અધિકારી સમીક્ષા આવશ્યક:</strong> આ દસ્તાવેજોનું સિસ્ટમ પ્રી-ચેક (OCR + Rule Engine) પૂર્ણ થયેલ છે. આખરી વહીવટી ખરાઈ અને મંજૂરી સત્તાવાર સરકારી અધિકારી દ્વારા કરવામાં આવે છે.
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
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-600">
                મૂળ કાઉન્ટર: <strong>કાઉન્ટર {selectedCounter} (આવક & પ્રમાણપત્રો)</strong>
              </div>

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
