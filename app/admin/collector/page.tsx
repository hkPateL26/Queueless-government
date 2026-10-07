'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building, ShieldCheck, MapPin, AlertTriangle, Users, Clock, 
  ArrowRight, FileText, CheckCircle2, ChevronRight, Download, 
  Printer, ArrowLeft, RefreshCw, BarChart3, TrendingUp, AlertCircle, 
  Send, Sparkles, Filter, ExternalLink, Activity, Award, Star,
  Lock, EyeOff, Check
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { speakGuidance } from '@/lib/voice';
import { GUJARAT_33_DISTRICTS, DistrictItem, TalukaOffice } from '@/lib/jurisdiction-data';
import { GovLogo } from '@/components/GovLogo';

interface DistrictMetric {
  id: string;
  nameGu: string;
  nameEn: string;
  headquarters: string;
  totalTokensToday: number;
  completedTokens: number;
  waitingCount: number;
  avgHandlingMinutes: number; // Desk Handling Time
  avgWaitingMinutes: number;  // Citizen Waiting Time
  queueDelayCount: number;    // Configurable delay count (>30 min)
  noShowCount: number;
  transferCount: number;
  activeCounters: number;
  totalCounters: number;
  officeCapacity: number;     // Configurable office capacity
  status: 'OPTIMAL' | 'MODERATE' | 'CONGESTED';
}

interface QueueDelayAlert {
  id: string;
  tokenNumber: string;
  districtGu: string;
  talukaGu: string;
  counterNumber: number;
  counterNameGu: string;
  waitingMinutes: number;
  schemeTitleGu: string;
  delayReason: string;
  escalationSent: boolean;
}

const INITIAL_QUEUE_DELAYS: QueueDelayAlert[] = [
  {
    id: 'delay-1',
    tokenNumber: '#A-19',
    districtGu: 'રાજકોટ',
    talukaGu: 'ગોંડલ જન સેવા કેન્દ્ર',
    counterNumber: 2,
    counterNameGu: 'રેશનકાર્ડ & અન્ન પુરવઠો',
    waitingMinutes: 38,
    schemeTitleGu: 'નવું બારકોડેડ રેશનકાર્ડ મેળવવા બાબત',
    delayReason: 'કાઉન્ટર ૨ પર દસ્તાવેજ ચકાસણી ભીડ',
    escalationSent: false
  },
  {
    id: 'delay-2',
    tokenNumber: '#A-31',
    districtGu: 'અમદાવાદ',
    talukaGu: 'દસ્ક્રોઈ મામલતદાર કચેરી',
    counterNumber: 3,
    counterNameGu: 'ઈ-ધરા ૭/૧૨ જમીન રેકોર્ડ',
    waitingMinutes: 34,
    schemeTitleGu: '૭/૧૨ હકપત્રક વારસાઈ નોંધણી',
    delayReason: 'જમીન નોંધણી પોર્ટલ ટ્રાફિક',
    escalationSent: false
  }
];

export default function CollectorCommandDashboard() {
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('rajkot');
  const [delayAlerts, setDelayAlerts] = useState<QueueDelayAlert[]>(INITIAL_QUEUE_DELAYS);
  const [misModalOpen, setMisModalOpen] = useState<boolean>(false);
  const [filterMode, setFilterMode] = useState<'ALL' | 'CONGESTED' | 'DELAY_ALERT'>('ALL');
  const [lastRefreshed, setLastRefreshed] = useState<string>('હમણાં જ (Live)');

  // Dynamic Metrics for all 33 Districts (Calculated relative to Configurable Office Capacity)
  const districtMetrics: DistrictMetric[] = useMemo(() => {
    return GUJARAT_33_DISTRICTS.map((d, index) => {
      const isTop5 = ['ahmedabad', 'surat', 'vadodara', 'rajkot', 'bhavnagar'].includes(d.id);
      const totalTokens = isTop5 ? 850 + (index * 35) : 320 + (index * 18);
      const completed = Math.floor(totalTokens * 0.88);
      const waiting = totalTokens - completed;
      const officeCapacity = isTop5 ? 75 : 40; // Configurable office capacity
      
      const avgHandlingMinutes = isTop5 ? 6.2 + (index % 3) * 0.8 : 5.1 + (index % 2) * 0.5;
      const avgWaitingMinutes = isTop5 ? 18.5 + (index % 4) * 2.1 : 12.0 + (index % 3) * 1.5;
      const delayCount = d.id === 'rajkot' ? 1 : d.id === 'ahmedabad' ? 1 : index % 8 === 0 ? 1 : 0;
      const noShow = Math.floor(totalTokens * 0.03) + (index % 3);
      const transfers = Math.floor(totalTokens * 0.04) + (index % 2);

      // Status relative to office capacity
      const loadRatio = waiting / officeCapacity;
      let status: 'OPTIMAL' | 'MODERATE' | 'CONGESTED' = 'OPTIMAL';
      if (loadRatio > 0.8 || delayCount > 0) {
        status = 'CONGESTED';
      } else if (loadRatio > 0.45) {
        status = 'MODERATE';
      }

      return {
        id: d.id,
        nameGu: d.nameGu,
        nameEn: d.nameEn,
        headquarters: d.headquarters,
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

  // Create escalation alert (Demo Alert creation without claiming fake external SMS)
  const handleSendEscalation = (alertId: string, alertRecord: QueueDelayAlert) => {
    triggerHaptic('warning');
    setDelayAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, escalationSent: true } : a
    ));
    speakGuidance("પ્રશાસનિક કતાર વિલંબ એલર્ટ સફળતાપૂર્વક નોંધાયું.");
    alert(
      `🚨 પ્રશાસનિક કતાર વિલંબ એલર્ટ (Demo Alert Created)\n\n` +
      `જિલ્લો: ${alertRecord.districtGu}\n` +
      `કચેરી: ${alertRecord.talukaGu}\n` +
      `કાઉન્ટર: ${alertRecord.counterNumber} (${alertRecord.counterNameGu})\n` +
      `ટોકન: ${alertRecord.tokenNumber}\n` +
      `કારણ: ${alertRecord.delayReason} (${alertRecord.waitingMinutes} મિનિટ પ્રતીક્ષા)\n` +
      `સ્થિતિ: ડેમો એલર્ટ ડેશબોર્ડ પર સક્રિય નોંધાયેલ.`
    );
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#1F2937] flex flex-col">
      {/* 🟠 DEMO DATA & DEMO MODE BANNER */}
      <div className="bg-amber-500 text-slate-900 text-xs px-4 py-1.5 font-bold flex flex-wrap items-center justify-between border-b border-amber-600 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="bg-slate-900 text-amber-300 text-[10px] uppercase font-black px-1.5 py-0.5 rounded">
            🟠 DEMO DATA
          </span>
          <span>
            નિરીક્ષણ ડેશબોર્ડ ડેમો ડેટા સ્ટ્રીમ • ઉત્પાદન વાતાવરણમાં સત્તાવાર રોલ-બેઝ્ડ ઓથોરાઇઝેશન (RBAC) જરૂરી છે.
          </span>
        </div>
        <span className="text-[11px] font-mono">રાજ્ય કચેરી મોનિટરિંગ કન્સોલ</span>
      </div>

      {/* 🏛️ EXECUTIVE COLLECTORATE HEADER */}
      <header className="bg-gradient-to-r from-[#002244] via-[#003366] to-[#001933] text-white border-b-2 border-[#FF9933] shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1 text-xs font-bold"
              title="નાગરિક પોર્ટલ"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">પોર્ટલ</span>
            </Link>

            <GovLogo className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 drop-shadow-md" />

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest text-[#FF9933] uppercase bg-amber-950/50 border border-amber-800/50 px-1.5 py-0.5 rounded">
                  ગુજરાત સરકાર • મહેસૂલ & પ્રશાસન
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] text-emerald-300 font-bold hidden md:inline">૩૩ જિલ્લા લાઈવ કમાન્ડ સેન્ટર</span>
              </div>
              <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>જિલ્લા કલેક્ટર & DDO કમાન્ડ ડેશબોર્ડ</span>
              </h1>
            </div>
          </div>

          {/* Collector Profile & Fast Links */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-white">શ્રી પ્રભાતકુમાર શર્મા, IAS</p>
              <p className="text-[10px] text-amber-200 font-mono">જિલ્લા કલેક્ટર • ડેમો પર્સોના</p>
            </div>

            <Link
              href="/admin/counter"
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/20"
            >
              <Building className="w-3.5 h-3.5 text-[#FF9933]" />
              <span className="hidden md:inline">કાઉન્ટર ડેસ્ક</span>
            </Link>

            <button
              onClick={() => setMisModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#FF9933] hover:bg-amber-600 text-slate-900 text-xs font-black transition flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>દૈનિક MIS રિપોર્ટ (Demo)</span>
            </button>
          </div>
        </div>
      </header>

      {/* 🚨 QUEUE DELAY WATCHDOG TICKER */}
      {delayAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-4 sm:px-6 py-2.5 shadow-md border-b border-red-800">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-black">
              <AlertTriangle className="w-4 h-4 animate-bounce text-amber-300 shrink-0" />
              <span>કતાર વિલંબ ચેતવણી (Queue Delay Watchdog • {delayAlerts.length} અરજીઓ ૩૦+ મિનિટથી વિલંબિત):</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {delayAlerts.map(alert => (
                <div key={alert.id} className="flex items-center gap-2 bg-black/25 px-2.5 py-1 rounded-lg border border-white/20 text-[11px]">
                  <span className="font-mono font-bold text-amber-300">{alert.tokenNumber}</span>
                  <span className="font-semibold">{alert.talukaGu} ({alert.waitingMinutes}m વિલંબ)</span>
                  
                  {alert.escalationSent ? (
                    <span className="text-[10px] bg-emerald-500/80 text-white px-1.5 py-0.5 rounded font-bold">
                      ✓ એલર્ટ નોંધાયું
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSendEscalation(alert.id, alert)}
                      className="bg-white text-red-700 hover:bg-amber-100 font-extrabold text-[10px] px-2 py-0.5 rounded transition active:scale-95 shadow-xs"
                      title="પ્રશાસનિક વિલંબ એલર્ટ જારી કરો"
                    >
                      એસ્કેલેટ — ડેમો
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 📊 STATE-WIDE METRIC SUMMARY CARDS (Separating Queue Waiting Time vs Desk Handling Time) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 w-full">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">કુલ ઇશ્યુ ટોકન (રાજ્યભર)</p>
            <p className="text-xl sm:text-2xl font-black text-[#003366] mt-1">{stateTotals.totalTokens.toLocaleString()}</p>
            <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mt-0.5">
              નો-શો: {stateTotals.totalNoShows} • ટ્રાન્સફર: {stateTotals.totalTransfers}
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">સફળતાપૂર્વક નિકાલ</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">{stateTotals.totalCompleted.toLocaleString()}</p>
            <span className="text-[10px] text-slate-500 font-bold">
              {stateTotals.completionRate}% નિકાલ દર
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">સરેરાશ કતાર પ્રતીક્ષા સમય</p>
            <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">{stateTotals.avgWaitingTime} મિનિટ</p>
            <span className="text-[10px] text-amber-700 font-bold">
              કતારમાં બોલાવવા પહેલાંનો સમય
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">સરેરાશ ડેસ્ક સેવા સમય</p>
            <p className="text-xl sm:text-2xl font-black text-indigo-700 mt-1">{stateTotals.avgHandlingTime} મિનિટ</p>
            <span className="text-[10px] text-emerald-600 font-bold">
              અધિકારી ડેસ્ક સેવા સમય ✓
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 md:col-span-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">કતાર વિલંબ ચેતવણી</p>
            <p className="text-xl sm:text-2xl font-black text-red-600 mt-1">{stateTotals.totalDelays} કિસ્સા</p>
            <span className="text-[10px] text-red-700 font-bold">
              પ્રશાસનિક સમીક્ષા હેઠળ
            </span>
          </div>
        </div>
      </div>

      {/* 🗺️ MAIN EXECUTIVE CONSOLE: HEATMAP & TALUKA DRILL-DOWN */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 w-full grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        
        {/* LEFT COLUMN: 33 DISTRICTS CONGESTION HEATMAP (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
            
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-black text-[#003366] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#FF9933]" />
                  <span>ગુજરાત ૩૩ જિલ્લા ભીડ હીટમેપ (District Congestion Index)</span>
                </h3>
                <p className="text-[10px] text-slate-400">ક્ષમતા આધારિત કોન્ફિગરેબલ ભીડ મૂલ્યાંકન • તાલુકા વિગતો જોવા ક્લિક કરો</p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 text-[10px] font-bold">
                <button
                  onClick={() => setFilterMode('ALL')}
                  className={`px-2 py-1 rounded-lg transition ${
                    filterMode === 'ALL' ? 'bg-[#003366] text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  તમામ ({districtMetrics.length})
                </button>
                <button
                  onClick={() => setFilterMode('CONGESTED')}
                  className={`px-2 py-1 rounded-lg transition ${
                    filterMode === 'CONGESTED' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  ભારે ભીડ
                </button>
                <button
                  onClick={() => setFilterMode('DELAY_ALERT')}
                  className={`px-2 py-1 rounded-lg transition ${
                    filterMode === 'DELAY_ALERT' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  વિલંબ એલર્ટ
                </button>
              </div>
            </div>

            {/* 33 Districts Interactive Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[480px] overflow-y-auto pr-1">
              {filteredDistricts.map((metric) => {
                const isSelected = metric.id === selectedDistrictId;

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
                      <span className="font-black text-xs text-slate-900">{metric.nameGu}</span>
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        metric.status === 'CONGESTED'
                          ? 'bg-red-500 animate-pulse'
                          : metric.status === 'MODERATE'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                      }`} />
                    </div>

                    <p className="text-[10px] text-slate-400 font-mono">{metric.nameEn}</p>
                    
                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">પ્રતીક્ષા: <strong className="text-slate-800">{metric.waitingCount}</strong></span>
                      <span className="text-slate-500 font-mono">સેવા: {metric.avgHandlingMinutes}m</span>
                    </div>

                    {metric.queueDelayCount > 0 && (
                      <span className="mt-1.5 bg-red-600 text-white font-black text-[9px] px-1.5 py-0.2 rounded-full block text-center">
                        ⚠️ {metric.queueDelayCount} વિલંબ એલર્ટ
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
                  સામાન્ય (&lt;૪૫% ક્ષમતા)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  મધ્યમ (૪૫-૮૦% ક્ષમતા)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  ભારે ભીડ (&gt;૮૦% ક્ષમતા)
                </span>
              </div>

              <span>સિંક સમય: {lastRefreshed}</span>
            </div>

          </div>

          {/* HOURLY CONGESTION & PEAK SURGE CHART */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black text-[#003366] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#005A9C]" />
                <span>રાજ્યવ્યાપી પીક અવર્સ કતાર સમયરેખા (Observed Queue Footfall)</span>
              </h4>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                નોંધાયેલ કતાર ડેટા આધારે
              </span>
            </div>

            {/* Simulated Hourly Bar Graph */}
            <div className="grid grid-cols-7 gap-2 items-end h-28 pt-4">
              {[
                { time: '10:30', count: 18, label: 'શરૂઆત' },
                { time: '11:30', count: 48, label: 'પીક રશ' },
                { time: '12:30', count: 52, label: 'મહત્તમ' },
                { time: '13:10', count: 6, label: 'લંચ રિસેસ' },
                { time: '14:30', count: 36, label: 'સાંજ સત્ર' },
                { time: '15:30', count: 42, label: 'સાંજ રશ' },
                { time: '17:00', count: 20, label: 'ક્લોઝિંગ' }
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
              <span>સવારે ૧૧:૩૦ - ૧૨:૩૦ પીક સમય (સૌથી વધુ કતાર)</span>
              <span>૧:૧૦ - ૨:૦૦ લંચ વિરામ (ઓછી ભીડ)</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: SELECTED DISTRICT TALUKAS & DEMAND RATIO (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* SELECTED DISTRICT DRILL-DOWN CARD */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
            
            <div className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#FF9933] uppercase tracking-wider">જિલ્લા નિરીક્ષણ</span>
                <span className="text-xs font-mono font-bold text-slate-500">{selectedDistrictData.talukas.length} તાલુકા</span>
              </div>
              <h3 className="text-lg font-black text-[#003366] mt-0.5">
                {selectedDistrictData.nameGu} જિલ્લો ({selectedDistrictData.nameEn})
              </h3>
              <p className="text-xs text-slate-500">
                મુખ્ય મથક: <strong>{selectedDistrictData.headquarters}</strong> • કુલ ટોકન: <strong>{selectedDistrictMetric.totalTokensToday}</strong>
              </p>
            </div>

            {/* Talukas List with Counter Readiness */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {selectedDistrictData.talukas.map((taluka, idx) => (
                <div 
                  key={taluka.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <h5 className="text-xs font-black text-slate-800">{taluka.nameGu} તાલુકો</h5>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{taluka.officeNameGu}</p>
                    <span className="text-[9px] font-mono text-[#005A9C] font-bold">
                      ૬ કાઉન્ટર્સ સક્રિય • ક્ષમતા: કોન્ફિગરેબલ
                    </span>
                  </div>

                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full shrink-0">
                    કાર્યરત ✓
                  </span>
                </div>
              ))}
            </div>

          </div>

          {/* SERVICE-WISE DEMAND BREAKDOWN */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-3">
            <h4 className="text-xs font-black text-[#003366] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>યોજનાવાર સેવા માંગ દર (Observed Service Breakdown)</span>
            </h4>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>આવક & જાતિ પ્રમાણપત્રો (Revenue)</span>
                  <span className="text-[#003366]">૩૮% (૫,૬૩૦ અરજીઓ)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#003366] h-full" style={{ width: '38%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>ઈ-ધરા ૭/૧૨ & ૮-અ જમીન રેકોર્ડ</span>
                  <span className="text-[#005A9C]">૨૬% (૩,૮૫૦ અરજીઓ)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#005A9C] h-full" style={{ width: '26%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>રેશન કાર્ડ વિભાજન & પુરવઠો</span>
                  <span className="text-amber-700">૧૮% (૨,૬૬૦ અરજીઓ)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#FF9933] h-full" style={{ width: '18%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>ગંગા સ્વરૂપા વિધવા & વૃદ્ધ પેન્શન</span>
                  <span className="text-emerald-700">૧૨% (૧,૭૭૦ અરજીઓ)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full" style={{ width: '12%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>સોગંદનામું & સામાન્ય એટેસ્ટેશન</span>
                  <span className="text-slate-600">૬% (૮૯૦ અરજીઓ)</span>
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
                🏛️ ગુજરાત સરકાર • મહેસૂલ & પ્રશાસન
              </span>
              <h3 className="text-base font-black text-[#003366] mt-0.5">
                દૈનિક ઈ-જન સેવા નિકાલ અહેવાલ (Daily MIS Bulletin — Demo)
              </h3>
              <p className="text-[10px] text-slate-500 font-mono">
                તારીખ: {new Date().toLocaleDateString('gu-IN')} • સમય: {new Date().toLocaleTimeString('gu-IN')}
              </p>
            </div>

            {/* MIS Summary Table */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-1.5 font-bold">
                <span>કુલ નોંધાયેલ જિલ્લા:</span>
                <span className="text-[#003366]">૩૩ જિલ્લા (૨૫૦+ તાલુકા)</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5 font-bold">
                <span>કુલ જારી કરાયેલ ટોકન્સ:</span>
                <span>{stateTotals.totalTokens.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5 font-bold">
                <span>સફળતાપૂર્વક નિકાલ થયેલ સેવાઓ:</span>
                <span className="text-emerald-700">{stateTotals.totalCompleted.toLocaleString()} ({stateTotals.completionRate}%)</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5 font-bold">
                <span>સરેરાશ કતાર પ્રતીક્ષા સમય:</span>
                <span>{stateTotals.avgWaitingTime} મિનિટ</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5 font-bold">
                <span>સરેરાશ ડેસ્ક સેવા સમય:</span>
                <span>{stateTotals.avgHandlingTime} મિનિટ</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5 font-bold">
                <span>નો-શો & ટ્રાન્સફર સંખ્યા:</span>
                <span>{stateTotals.totalNoShows} નો-શો / {stateTotals.totalTransfers} ટ્રાન્સફર</span>
              </div>
              <div className="flex justify-between font-bold text-red-600">
                <span>કતાર વિલંબ ચેતવણી નોંધાયેલ:</span>
                <span>{stateTotals.totalDelays} કિસ્સા</span>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-[11px] text-[#003366]">
              <strong>પ્રશાસનિક નોંધ:</strong> આ અહેવાલ ડેમો મૂલ્યાંકન હેતુ માટે જનરેટ થયેલ છે. વાસ્તવિક ઉત્પાદન પ્રણાલી અધિકૃત ઓડિટ ડેટાબેઝ સાથે સંકલિત થાય છે.
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  triggerHaptic('success');
                  window.print();
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>પ્રિન્ટ / PDF ડાઉનલોડ</span>
              </button>
              
              <button
                onClick={() => setMisModalOpen(false)}
                className="flex-1 bg-[#003366] hover:bg-[#002244] text-white font-bold py-2.5 rounded-xl text-xs transition"
              >
                બંધ કરો (Close)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
