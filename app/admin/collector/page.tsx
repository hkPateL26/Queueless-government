'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building, ShieldCheck, MapPin, AlertTriangle, Users, Clock, 
  ArrowRight, FileText, CheckCircle2, ChevronRight, Download, 
  Printer, ArrowLeft, RefreshCw, BarChart3, TrendingUp, AlertCircle, 
  Send, Sparkles, Filter, ExternalLink, Activity, Award, Star
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { speakGuidance } from '@/lib/voice';
import { GUJARAT_33_DISTRICTS, DistrictItem, TalukaOffice } from '@/lib/jurisdiction-data';

interface DistrictMetric {
  id: string;
  nameGu: string;
  nameEn: string;
  headquarters: string;
  totalTokensToday: number;
  completedTokens: number;
  waitingCount: number;
  avgMinutes: number;
  slaBreachCount: number;
  status: 'OPTIMAL' | 'MODERATE' | 'CONGESTED';
}

interface SlaBreachAlert {
  id: string;
  tokenNumber: string;
  citizenName: string;
  districtGu: string;
  talukaGu: string;
  counterNumber: number;
  counterNameGu: string;
  waitingMinutes: number;
  schemeTitleGu: string;
  escalationSent: boolean;
}

const INITIAL_SLA_BREACHES: SlaBreachAlert[] = [
  {
    id: 'sla-1',
    tokenNumber: '#A-19',
    citizenName: 'દેવજીભાઈ બાબુભાઈ પટેલ',
    districtGu: 'રાજકોટ',
    talukaGu: 'ગોંડલ જન સેવા કેન્દ્ર',
    counterNumber: 2,
    counterNameGu: 'રેશનકાર્ડ & અન્ન પુરવઠો',
    waitingMinutes: 38,
    schemeTitleGu: 'નવું બારકોડેડ રેશનકાર્ડ મેળવવા બાબત',
    escalationSent: false
  },
  {
    id: 'sla-2',
    tokenNumber: '#A-31',
    citizenName: 'જયેશભાઈ વલ્લભભાઈ રાદડિયા',
    districtGu: 'અમદાવાદ',
    talukaGu: 'દસ્ક્રોઈ મામલતદાર કચેરી',
    counterNumber: 3,
    counterNameGu: 'ઈ-ધરા ૭/૧૨ જમીન રેકોર્ડ',
    waitingMinutes: 34,
    schemeTitleGu: '૭/૧૨ હકપત્રક વારસાઈ નોંધણી',
    escalationSent: false
  }
];

export default function CollectorCommandDashboard() {
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('rajkot');
  const [slaAlerts, setSlaAlerts] = useState<SlaBreachAlert[]>(INITIAL_SLA_BREACHES);
  const [misModalOpen, setMisModalOpen] = useState<boolean>(false);
  const [filterMode, setFilterMode] = useState<'ALL' | 'CONGESTED' | 'SLA_BREACH'>('ALL');
  const [lastRefreshed, setLastRefreshed] = useState<string>('હમણાં જ (Live)');

  // Dynamic Metrics for all 33 Districts
  const districtMetrics: DistrictMetric[] = useMemo(() => {
    return GUJARAT_33_DISTRICTS.map((d, index) => {
      // Deterministic realistic government data based on district
      const isTop5 = ['ahmedabad', 'surat', 'vadodara', 'rajkot', 'bhavnagar'].includes(d.id);
      const totalTokens = isTop5 ? 850 + (index * 35) : 320 + (index * 18);
      const completed = Math.floor(totalTokens * 0.88);
      const waiting = totalTokens - completed;
      const avgMinutes = isTop5 ? 6.8 + (index % 3) * 1.2 : 5.1 + (index % 2) * 0.8;
      const slaBreaches = d.id === 'rajkot' ? 1 : d.id === 'ahmedabad' ? 1 : index % 7 === 0 ? 1 : 0;

      let status: 'OPTIMAL' | 'MODERATE' | 'CONGESTED' = 'OPTIMAL';
      if (waiting > 45 || slaBreaches > 0) {
        status = 'CONGESTED';
      } else if (waiting > 25) {
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
        avgMinutes: Number(avgMinutes.toFixed(1)),
        slaBreachCount: slaBreaches,
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
    const totalBreaches = districtMetrics.reduce((acc, m) => acc + m.slaBreachCount, 0);
    const avgStateTime = (districtMetrics.reduce((acc, m) => acc + m.avgMinutes, 0) / districtMetrics.length).toFixed(1);

    return {
      totalTokens,
      totalCompleted,
      totalWaiting,
      totalBreaches,
      avgStateTime,
      complianceRate: ((totalCompleted / totalTokens) * 100).toFixed(1)
    };
  }, [districtMetrics]);

  // Filtered districts list
  const filteredDistricts = useMemo(() => {
    if (filterMode === 'CONGESTED') {
      return districtMetrics.filter(m => m.status === 'CONGESTED');
    }
    if (filterMode === 'SLA_BREACH') {
      return districtMetrics.filter(m => m.slaBreachCount > 0);
    }
    return districtMetrics;
  }, [districtMetrics, filterMode]);

  // Send escalation notice to Mamlatdar
  const handleSendEscalation = (alertId: string, officerName: string) => {
    triggerHaptic('warning');
    setSlaAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, escalationSent: true } : a
    ));
    speakGuidance("મામલતદાર કચેરીને તાકીદ સૂચના રવાના કરવામાં આવી છે.");
    alert(`🚨 કલેક્ટર તાકીદ આદેશ રવાના!\n\nઅધિકારી: ${officerName}\nનોંધ: GRTSA 2013 કલમ ૭ મુજબ નાગરિકને ૧૦ મિનિટમાં સેવા આપવી ફરજિયાત છે.`);
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#1F2937] flex flex-col">
      
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

            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border-2 border-[#FF9933] flex items-center justify-center font-bold text-[#FF9933] text-xl shadow-inner">
              👑
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest text-[#FF9933] uppercase bg-amber-950/50 border border-amber-800/50 px-1.5 py-0.5 rounded">
                  ગુજરાત સરકાર • મુખ્ય સચિવાલય
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] text-emerald-300 font-bold hidden md:inline">૩૩ જિલ્લા લાઈવ કમાન્ડ સેન્ટર</span>
              </div>
              <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>જિલ્લા કલેક્ટર & DDO ડેશબોર્ડ • GRTSA વોચડોગ</span>
              </h1>
            </div>
          </div>

          {/* Collector Profile & Fast Links */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-white">શ્રી પ્રભાતકુમાર શર્મા, IAS</p>
              <p className="text-[10px] text-amber-200 font-mono">જિલ્લા કલેક્ટર & મેજિસ્ટ્રેટ, રાજકોટ</p>
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
              <span>દૈનિક MIS રિપોર્ટ</span>
            </button>
          </div>
        </div>
      </header>

      {/* 🚨 LIVE GRTSA SLA ESCALATION WATCHDOG TICKER */}
      {slaAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white px-4 sm:px-6 py-2.5 shadow-md border-b border-red-800">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-black">
              <AlertTriangle className="w-4 h-4 animate-bounce text-amber-300 shrink-0" />
              <span>GRTSA 2013 SLA વિલંબ ચેતવણી ({slaAlerts.length} અરજીઓ ૩૦+ મિનિટથી વિલંબિત):</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {slaAlerts.map(alert => (
                <div key={alert.id} className="flex items-center gap-2 bg-black/25 px-2.5 py-1 rounded-lg border border-white/20 text-[11px]">
                  <span className="font-mono font-bold text-amber-300">{alert.tokenNumber}</span>
                  <span className="font-semibold">{alert.talukaGu} ({alert.waitingMinutes}m વિલંબ)</span>
                  
                  {alert.escalationSent ? (
                    <span className="text-[10px] bg-emerald-500/80 text-white px-1.5 py-0.5 rounded font-bold">
                      ✓ આદેશ રવાના
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSendEscalation(alert.id, `${alert.talukaGu} કાઉન્ટર ${alert.counterNumber}`)}
                      className="bg-white text-red-700 hover:bg-amber-100 font-extrabold text-[10px] px-2 py-0.5 rounded transition active:scale-95 shadow-xs"
                    >
                      તાકીદ આદેશ મોકલો
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 📊 STATE-WIDE METRIC SUMMARY CARDS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 w-full">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">કુલ ઇશ્યુ ટોકન (રાજ્યભર)</p>
            <p className="text-xl sm:text-2xl font-black text-[#003366] mt-1">{stateTotals.totalTokens.toLocaleString()}</p>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> +૧૨.૪% ગઈકાલ કરતાં
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">સફળતાપૂર્વક નિકાલ</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">{stateTotals.totalCompleted.toLocaleString()}</p>
            <span className="text-[10px] text-slate-500 font-bold">
              {stateTotals.complianceRate}% નિકાલ દર
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">કતારમાં પ્રતીક્ષારત</p>
            <p className="text-xl sm:text-2xl font-black text-amber-600 mt-1">{stateTotals.totalWaiting.toLocaleString()}</p>
            <span className="text-[10px] text-amber-700 font-bold">
              સક્રિય કાઉન્ટર્સ પર લાઈવ
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">સરેરાશ નિકાલ સમય</p>
            <p className="text-xl sm:text-2xl font-black text-indigo-700 mt-1">{stateTotals.avgStateTime} મિનિટ</p>
            <span className="text-[10px] text-emerald-600 font-bold">
              GRTSA ૧૫m લક્ષ્ય હેઠળ ✓
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 md:col-span-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">SLA ઉલ્લંઘન ચેતવણી</p>
            <p className="text-xl sm:text-2xl font-black text-red-600 mt-1">{stateTotals.totalBreaches} કિસ્સા</p>
            <span className="text-[10px] text-red-700 font-bold">
              તાકીદ પગલાં હેઠળ
            </span>
          </div>
        </div>
      </div>

      {/* 🗺️ MAIN EXECUTIVE CONSOLE: HEATMAP & TALUKA DRILL-DOWN */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 w-full grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        
        {/* LEFT COLUMN: 33 DISTRICTS LIVE CONGESTION HEATMAP (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
            
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-black text-[#003366] flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#FF9933]" />
                  <span>ગુજરાત ૩૩ જિલ્લા ભીડ હીટમેપ (District Congestion Index)</span>
                </h3>
                <p className="text-[10px] text-slate-400">તાલુકાવાર વિગતો જોવા માટે કોઈપણ જિલ્લા પર ક્લિક કરો</p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 text-[10px] font-bold">
                <button
                  onClick={() => setFilterMode('ALL')}
                  className={`px-2 py-1 rounded-lg transition ${
                    filterMode === 'ALL' ? 'bg-[#003366] text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  તમામ (૩૩)
                </button>
                <button
                  onClick={() => setFilterMode('CONGESTED')}
                  className={`px-2 py-1 rounded-lg transition ${
                    filterMode === 'CONGESTED' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  ભારે ભીડ (Congested)
                </button>
                <button
                  onClick={() => setFilterMode('SLA_BREACH')}
                  className={`px-2 py-1 rounded-lg transition ${
                    filterMode === 'SLA_BREACH' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  SLA એલર્ટ
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
                      <span className="text-slate-500 font-mono">{metric.avgMinutes}m</span>
                    </div>

                    {metric.slaBreachCount > 0 && (
                      <span className="mt-1.5 bg-red-600 text-white font-black text-[9px] px-1.5 py-0.2 rounded-full block text-center">
                        ⚠️ {metric.slaBreachCount} SLA એલર્ટ
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
                  સામાન્ય (&lt;૧૫ પ્રતીક્ષા)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  મધ્યમ (૧૫-૪૫ પ્રતીક્ષા)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  ભારે ભીડ (&gt;૪૫ પ્રતીક્ષા)
                </span>
              </div>

              <span>સિંક સમય: {lastRefreshed}</span>
            </div>

          </div>

          {/* HOURLY CONGESTION & PEAK SURGE CHART */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
            <h4 className="text-xs font-black text-[#003366] flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-[#005A9C]" />
              <span>રાજ્યવ્યાપી પીક અવર્સ સમયરેખા (Peak Hours Footfall 10:30 AM – 6:00 PM)</span>
            </h4>

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
              <span>સવારે ૧૧:૩૦ - ૧૨:૩૦ પીક સમય (સૌથી વધુ ટ્રાફિક)</span>
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
                      ૬ કાઉન્ટર્સ સક્રિય • સ્લોટ ક્ષમતા: ૫/કલાક
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
              <span>યોજનાવાર લોકપ્રિયતા & માંગ દર (Service Demand Breakdown)</span>
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

      {/* 📑 OFFICIAL COLLECTORATE DAILY MIS BULLETIN MODAL */}
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
                🏛️ ગુજરાત સરકાર • મહેસૂલ વિભાગ
              </span>
              <h3 className="text-base font-black text-[#003366] mt-0.5">
                દૈનિક ઈ-જન સેવા નિકાલ અહેવાલ (Daily MIS Bulletin)
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
                <span className="text-emerald-700">{stateTotals.totalCompleted.toLocaleString()} ({stateTotals.complianceRate}%)</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5 font-bold">
                <span>વરિષ્ઠ/દિવ્યાંગજન ફાસ્ટ-ટ્રેક સંખ્યા:</span>
                <span className="text-[#FF9933]">૨,૧૮૦ નાગરિકો</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5 font-bold">
                <span>સરેરાશ કાઉન્ટર નિકાલ સમય:</span>
                <span>{stateTotals.avgStateTime} મિનિટ</span>
              </div>
              <div className="flex justify-between font-bold text-red-600">
                <span>SLA કાયદાકીય ઉલ્લંઘન નોંધાયેલ:</span>
                <span>{stateTotals.totalBreaches} કિસ્સા</span>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-[11px] text-[#003366]">
              <strong>કલેક્ટર શેરો:</strong> રાજ્યના તમામ ૨૫૦+ જન સેવા કેન્દ્રો પર કતાર રહિત સેવા સફળતાપૂર્વક અમલીકરણ થયેલ છે. કાગળની લાઈનો ૯૫% ઘટી છે.
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
