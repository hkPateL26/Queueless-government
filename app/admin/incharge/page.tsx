'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building, ShieldCheck, MapPin, AlertTriangle, Users, Clock, 
  ArrowRight, FileText, CheckCircle2, ChevronRight, Download, 
  Printer, ArrowLeft, RefreshCw, BarChart3, TrendingUp, AlertCircle, 
  Send, Sparkles, Filter, ExternalLink, Activity, Award, Star,
  Lock, EyeOff, Check, Globe, ChevronDown, X, LogOut, ArrowRightLeft,
  Coffee, UserCheck
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { GovLogo } from '@/components/GovLogo';
import { GovTelemetryMarquee } from '@/components/GovTelemetryMarquee';
import { 
  getActiveOfficer, clearOfficerSession, OfficerAccount 
} from '@/lib/admin-auth';

interface CounterFloorStatus {
  counterNumber: number;
  serviceTitleGu: string;
  operatorNameGu: string;
  status: 'ACTIVE_SERVING' | 'READY_WAITING' | 'LUNCH_RECESS' | 'SURGE_ASSIST';
  currentToken: string | null;
  queueLength: number;
  avgTimeMinutes: number;
}

const INITIAL_COUNTERS: CounterFloorStatus[] = [
  {
    counterNumber: 1,
    serviceTitleGu: 'આવક & જાતિ દાખલા',
    operatorNameGu: 'શ્રી આર. વી. ચૌહાણ',
    status: 'READY_WAITING',
    currentToken: '#A-42',
    queueLength: 6,
    avgTimeMinutes: 5.4
  },
  {
    counterNumber: 2,
    serviceTitleGu: 'રેશનકાર્ડ & પુરવઠો',
    operatorNameGu: 'શ્રીમતી બી. એમ. વાળા',
    status: 'ACTIVE_SERVING',
    currentToken: '#R-12',
    queueLength: 4,
    avgTimeMinutes: 6.8
  },
  {
    counterNumber: 3,
    serviceTitleGu: 'ઈ-ધરા ૭/૧૨ રેકોર્ડ',
    operatorNameGu: 'શ્રી એચ. કે. જોશી',
    status: 'ACTIVE_SERVING',
    currentToken: '#D-05',
    queueLength: 3,
    avgTimeMinutes: 8.1
  },
  {
    counterNumber: 4,
    serviceTitleGu: 'સોગંદનામા & નોટરી',
    operatorNameGu: 'શ્રી પી. એન. મહેતા',
    status: 'READY_WAITING',
    currentToken: null,
    queueLength: 1,
    avgTimeMinutes: 4.2
  },
  {
    counterNumber: 5,
    serviceTitleGu: 'આધાર ડેસ્ક & e-KYC',
    operatorNameGu: 'શ્રી જે. ડી. વાઘેલા',
    status: 'ACTIVE_SERVING',
    currentToken: '#K-18',
    queueLength: 5,
    avgTimeMinutes: 7.0
  },
  {
    counterNumber: 6,
    serviceTitleGu: 'સાયબર ટ્રેઝરી ચલણ & ફી',
    operatorNameGu: 'શ્રીમતી એસ. આર. સોલંકી',
    status: 'ACTIVE_SERVING',
    currentToken: '#F-21',
    queueLength: 2,
    avgTimeMinutes: 3.1
  }
];

export default function OfficeInchargePage() {
  const router = useRouter();
  const [officer, setOfficer] = useState<OfficerAccount | null>(null);
  const [counters, setCounters] = useState<CounterFloorStatus[]>(INITIAL_COUNTERS);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const current = getActiveOfficer(true);
    setOfficer(current);
  }, []);

  const handleToggleRecess = (counterNumber: number) => {
    triggerHaptic('tap');
    setCounters(prev => prev.map(c => {
      if (c.counterNumber === counterNumber) {
        const nextStatus = c.status === 'LUNCH_RECESS' ? 'READY_WAITING' : 'LUNCH_RECESS';
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const handleSurgeAssist = (sourceDesk: number, assistDesk: number) => {
    triggerHaptic('success');
    setCounters(prev => prev.map(c => {
      if (c.counterNumber === assistDesk) {
        return { 
          ...c, 
          status: 'SURGE_ASSIST',
          serviceTitleGu: 'કાઉન્ટર ૧ આવક સહાય (Surge Assist)'
        };
      }
      return c;
    }));
    setToastMsg(`✓ કાઉન્ટર ${assistDesk} ને કાઉન્ટર ${sourceDesk} ની ભીડ ઘટાડવા માટે આવક સેવા સોંપવામાં આવી!`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleLogout = () => {
    triggerHaptic('tap');
    clearOfficerSession();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      <GovTelemetryMarquee lang="gu" />

      {/* Header */}
      <header className="bg-[#003366] text-white border-b-2 border-[#FF9933] sticky top-0 z-30 shadow-md">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GovLogo className="w-10 h-10 drop-shadow-md" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white">
                  જન સેવા કેન્દ્ર ઇન્ચાર્જ કન્સોલ
                </h1>
                <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                  ગોંડલ જન સેવા સદન
                </span>
              </div>
              <p className="text-[10.5px] text-blue-200">
                ફ્લોર મેનેજમેન્ટ • કાઉન્ટર ૧ થી ૬ સ્ટાફ સંચાલન & ભીડ નિયંત્રણ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-blue-950/70 border border-blue-800 px-3 py-1.5 rounded-xl text-left">
              <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-sm">
                🏢
              </div>
              <div>
                <p className="text-xs font-black text-white leading-tight">
                  {officer?.nameGu || 'શ્રીમતી પી. આર. જાડેજા'}
                </p>
                <p className="text-[10px] text-amber-300 leading-tight">
                  નાયબ મામલતદાર (JSK ઇન્ચાર્જ)
                </p>
              </div>
            </div>

            <Link
              href="/admin/counter"
              className="text-xs font-bold text-white bg-blue-800 hover:bg-blue-700 px-3 py-1.5 rounded-xl border border-blue-700 transition flex items-center gap-1.5"
            >
              <span>કાઉન્ટર ડેસ્ક</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-white/10 hover:bg-red-500/80 text-white transition cursor-pointer"
              title="સત્ર સમાપ્ત કરો (Logout)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {toastMsg && (
          <div className="bg-emerald-600 text-white p-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-xs font-bold">{toastMsg}</span>
          </div>
        )}

        {/* Floor Summary KPI */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500">કુલ ઉપસ્થિત નાગરિકો</span>
            <p className="text-2xl font-black text-[#003366] mt-1">૨૧ નાગરિકો</p>
            <p className="text-[10px] text-slate-400 mt-1">હોલમાં પ્રતીક્ષારત</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500">સક્રિય કાઉન્ટર્સ</span>
            <p className="text-2xl font-black text-emerald-700 mt-1">૬ / ૬ કાર્યરત</p>
            <p className="text-[10px] text-emerald-600 font-bold mt-1">૧૦૦% સ્ટાફ ઉપલબ્ધ</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500">ભીડ ચેતવણી (Surge Alert)</span>
            <p className="text-2xl font-black text-amber-600 mt-1">કાઉન્ટર ૧</p>
            <p className="text-[10px] text-amber-600 font-bold mt-1">આવકના દાખલામાં સૌથી વધુ ભીડ</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold text-slate-500">સરેરાશ હોલ પ્રતીક્ષા સમય</span>
            <p className="text-2xl font-black text-slate-800 mt-1">૫.૬ મિનિટ</p>
            <p className="text-[10px] text-emerald-600 font-bold mt-1">✓ લક્ષ્યાંકથી ઝડપી</p>
          </div>
        </div>

        {/* Counter Grid */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-black text-[#003366] flex items-center gap-2">
                <Building className="w-5 h-5 text-[#FF9933]" />
                <span>કાઉન્ટર ૧ થી ૬ લાઈવ ફ્લોર સંચાલન બોર્ડ</span>
              </h2>
              <p className="text-xs text-slate-500">
                દરેક કાઉન્ટરની પ્રતીક્ષા કતાર, ઓપરેટર હાજરી અને રી-એલોકેશન કંટ્રોલ
              </p>
            </div>

            <button
              onClick={() => handleSurgeAssist(1, 4)}
              className="text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>કાઉન્ટર ૧ ની ભીડ ઘટાડો ➔ કાઉન્ટર ૪ ને જોડો</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {counters.map((desk) => {
              const isRecess = desk.status === 'LUNCH_RECESS';
              const isSurge = desk.status === 'SURGE_ASSIST';
              return (
                <div 
                  key={desk.counterNumber}
                  className={`p-4 rounded-2xl border transition relative flex flex-col justify-between ${
                    isRecess 
                      ? 'bg-amber-50/70 border-amber-300' 
                      : isSurge
                      ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-300'
                      : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-white bg-[#003366] px-2.5 py-0.5 rounded-lg">
                        કાઉન્ટર {desk.counterNumber}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isRecess 
                          ? 'bg-amber-200 text-amber-900' 
                          : isSurge 
                          ? 'bg-blue-200 text-blue-900 font-bold'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        <span>{isRecess ? 'લંચ રિસેસ' : isSurge ? 'ભીડ સહાયક' : 'કાર્યરત'}</span>
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-slate-900">
                      {desk.serviceTitleGu}
                    </h3>
                    <p className="text-xs font-bold text-slate-500 mt-0.5">
                      ઓપરેટર: <strong className="text-slate-800">{desk.operatorNameGu}</strong>
                    </p>

                    <div className="mt-3 pt-3 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">હાજર ટોકન</span>
                        <span className="font-mono font-black text-slate-800 text-sm">
                          {desk.currentToken || '—'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">કતાર લંબાઈ</span>
                        <span className="font-bold text-[#003366] text-sm">
                          {desk.queueLength} નાગરિકો
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center gap-2">
                    <button
                      onClick={() => handleToggleRecess(desk.counterNumber)}
                      className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold border transition cursor-pointer flex items-center justify-center gap-1 ${
                        isRecess 
                          ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300' 
                          : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
                      }`}
                    >
                      <Coffee className="w-3 h-3" />
                      <span>{isRecess ? 'રિસેસ પૂર્ણ' : 'લંચ રિસેસ'}</span>
                    </button>

                    <Link
                      href={`/admin/counter?counter=${desk.counterNumber}`}
                      className="py-1.5 px-2.5 rounded-xl text-[11px] font-bold bg-[#003366] hover:bg-blue-900 text-white transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>ખોલો</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}
