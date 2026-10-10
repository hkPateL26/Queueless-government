'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building, ShieldCheck, MapPin, AlertTriangle, Users, Clock, 
  ArrowRight, FileText, CheckCircle2, ChevronRight, Download, 
  Printer, ArrowLeft, RefreshCw, BarChart3, TrendingUp, AlertCircle, 
  Send, Sparkles, Filter, ExternalLink, Activity, Award, Star,
  Lock, EyeOff, Check, Globe, ChevronDown, X, LogOut, UserCheck,
  FileCheck, Landmark, CheckSquare, Layers
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { speakGuidance } from '@/lib/voice';
import { GovLogo } from '@/components/GovLogo';
import { GovTelemetryMarquee } from '@/components/GovTelemetryMarquee';
import { Language } from '@/lib/translations';
import { 
  getActiveOfficer, clearOfficerSession, OfficerAccount, OFFICIAL_SEED_OFFICERS 
} from '@/lib/admin-auth';
import { FirebaseBadge } from '@/components/FirebaseBadge';

interface PendingApproval {
  id: string;
  tokenNumber: string;
  citizenNameGu: string;
  schemeTitleGu: string;
  counterNumber: number;
  clerkNameGu: string;
  waitingMinutes: number;
  incomeDeclaredGu: string;
  status: 'PENDING_APPROVAL' | 'APPROVED';
}

const INITIAL_APPROVALS: PendingApproval[] = [
  {
    id: 'appr-1',
    tokenNumber: '#A-40',
    citizenNameGu: 'હસમુખભાઈ જે. સોલંકી',
    schemeTitleGu: 'આવકનો દાખલો (રાજ્ય સરકાર પ્રમાણપત્ર)',
    counterNumber: 1,
    clerkNameGu: 'શ્રી આર. વી. ચૌહાણ (કાઉન્ટર ૧)',
    waitingMinutes: 7,
    incomeDeclaredGu: '₹ ૧,૨૦,૦૦૦ (તલાટી પંચનામું માન્ય)',
    status: 'PENDING_APPROVAL'
  },
  {
    id: 'appr-2',
    tokenNumber: '#B-19',
    citizenNameGu: 'તૃષા સોમૈયા',
    schemeTitleGu: 'સમાજ કલ્યાણ & પેન્શન યોજના',
    counterNumber: 1,
    clerkNameGu: 'શ્રી આર. વી. ચૌહાણ (કાઉન્ટર ૧)',
    waitingMinutes: 9,
    incomeDeclaredGu: '₹ ૯૫,૦૦૦ (ચકાસાયેલ)',
    status: 'PENDING_APPROVAL'
  },
  {
    id: 'appr-3',
    tokenNumber: '#R-12',
    citizenNameGu: 'કાંતિલાલ એમ. પટેલ',
    schemeTitleGu: 'નવું બારકોડેડ રેશનકાર્ડ વિભાજન',
    counterNumber: 2,
    clerkNameGu: 'શ્રીમતી બી. એમ. વાળા (કાઉન્ટર ૨)',
    waitingMinutes: 14,
    incomeDeclaredGu: '₹ ૧,૮૦,૦૦૦ (રેશન પુરવઠો રિપોર્ટ)',
    status: 'PENDING_APPROVAL'
  }
];

export default function TalukaMamlatdarPage() {
  const router = useRouter();
  const [officer, setOfficer] = useState<OfficerAccount | null>(null);
  const [approvals, setApprovals] = useState<PendingApproval[]>(INITIAL_APPROVALS);
  const [approvedCount, setApprovedCount] = useState(42);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    const current = getActiveOfficer(true);
    setOfficer(current);
  }, []);

  const handleApprove = (id: string, name: string) => {
    triggerHaptic('success');
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: 'APPROVED' } : a));
    setApprovedCount(prev => prev + 1);
    setToastMsg(`✓ ${name} ની અરજી પર ડિજિટલ સહી (DSC) માન્ય કરી મંજૂર કરવામાં આવી!`);
    setTimeout(() => setToastMsg(null), 3500);
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
                  તાલુકા મામલતદાર કન્સોલ
                </h1>
                <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">
                  ગોંડલ તાલુકો
                </span>
              </div>
              <p className="text-[10.5px] text-blue-200">
                મહેસૂલ વહીવટ • તાલુકા સેવા સદન, ગોંડલ • GRTSA ૨૦૧૩ સત્તાવાર મોનિટરિંગ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-blue-950/70 border border-blue-800 px-3 py-1.5 rounded-xl text-left">
              <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-sm">
                ⚖️
              </div>
              <div>
                <p className="text-xs font-black text-white leading-tight">
                  {officer?.nameGu || 'શ્રી કે. એમ. ત્રિવેદી, GAS'}
                </p>
                <p className="text-[10px] text-amber-300 leading-tight">
                  મામલતદાર & કાર્યપાલક મેજિસ્ટ્રેટ
                </p>
              </div>
            </div>

            <FirebaseBadge lang="gu" />

            <Link
              href="/admin/incharge"
              className="text-xs font-bold text-white bg-blue-800 hover:bg-blue-700 px-3 py-1.5 rounded-xl border border-blue-700 transition flex items-center gap-1.5"
            >
              <span>ઇન્ચાર્જ વ્યુ</span>
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

      {/* Main Container */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Toast */}
        {toastMsg && (
          <div className="bg-emerald-600 text-white p-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-xs font-bold">{toastMsg}</span>
          </div>
        )}

        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
              <span>દૈનિક કુલ અરજીઓ</span>
              <Users className="w-4 h-4 text-[#003366]" />
            </div>
            <p className="text-2xl font-black text-[#003366]">૧૬૪</p>
            <p className="text-[10px] text-emerald-600 font-bold mt-1">↑ ૧૪% વધારો (આજના દિવસે)</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
              <span>પાકો નિકાલ (મંજૂર)</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-700">{approvedCount}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-1">ડિજિટલ DSC સહી સાથે ઇસ્યુ</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
              <span>સરેરાશ નિકાલ સમય</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-slate-800">૧૧.૨ <span className="text-xs font-bold">મિનિટ</span></p>
            <p className="text-[10px] text-emerald-600 font-bold mt-1">✓ GRTSA ૧૫-મિનિટ લક્ષ્યાંક હેઠળ</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
              <span>સક્રિય કાઉન્ટર ડેસ્ક</span>
              <Building className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-blue-900">૬ / ૬</p>
            <p className="text-[10px] text-slate-500 font-medium mt-1">તમામ સ્ટાફ હાજર</p>
          </div>
        </div>

        {/* Statutory Approval Queue */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#003366]" />
                <h2 className="text-sm sm:text-base font-black text-[#003366]">
                  વૈધાનિક અંતિમ મંજૂરી કતાર (Statutory DSC Approval Desk)
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                કારકૂન દ્વારા ચકાસાયેલ પ્રમાણપત્રો પર મામલતદાર દ્વારા કાયદેસરની ડિજિટલ સહી
              </p>
            </div>

            <button
              onClick={() => {
                triggerHaptic('tap');
                setIsExporting(true);
                setTimeout(() => setIsExporting(false), 1200);
              }}
              className="text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>દૈનિક બુલેટિન પ્રિન્ટ</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {approvals.map((item) => (
              <div key={item.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-[#003366] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-lg">
                      {item.tokenNumber}
                    </span>
                    <h3 className="text-sm font-black text-slate-900">
                      {item.citizenNameGu}
                    </h3>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                      {item.clerkNameGu}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-700">
                    {item.schemeTitleGu}
                  </p>

                  <p className="text-[11px] text-slate-500">
                    આવક ઘોષણા: <strong className="text-slate-700">{item.incomeDeclaredGu}</strong> • પ્રતીક્ષા સમય: {item.waitingMinutes} મિનિટ
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {item.status === 'APPROVED' ? (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300">
                      <Check className="w-4 h-4" />
                      <span>મંજૂર & ડિજિટલ સહી થયેલ</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApprove(item.id, item.citizenNameGu)}
                      className="px-4 py-2 rounded-xl text-xs font-black bg-[#003366] hover:bg-blue-900 text-white shadow-sm transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckSquare className="w-4 h-4 text-amber-400" />
                      <span>ડિજિટલ સહી સાથે મંજૂર કરો (DSC Approve)</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Counter Floor Status in Taluka */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-[#003366] flex items-center gap-2">
              <Building className="w-4 h-4 text-[#FF9933]" />
              <span>જન સેવા સદન • કાઉન્ટર ૧ થી ૬ લાઈવ સ્થિતિ</span>
            </h2>
            <Link
              href="/admin/counter"
              className="text-xs font-bold text-[#005A9C] hover:underline flex items-center gap-1"
            >
              <span>કાઉન્ટર ડેસ્ક ખોલો</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-slate-800">કાઉન્ટર ૧: આવક & દાખલા</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium">શ્રી આર. વી. ચૌહાણ (કારકૂન)</p>
              <p className="text-[11px] text-blue-900 font-bold mt-1">સક્રિય કતાર: ૬ નાગરિકો</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-slate-800">કાઉન્ટર ૨: રેશનકાર્ડ સેવા</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium">શ્રીમતી બી. એમ. વાળા (પુરવઠા કારકૂન)</p>
              <p className="text-[11px] text-blue-900 font-bold mt-1">સક્રિય કતાર: ૪ નાગરિકો</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-slate-800">કાઉન્ટર ૩: ઈ-ધરા જમીન રેકોર્ડ</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium">શ્રી એચ. કે. જોશી (તલાટી કમ મંત્રી)</p>
              <p className="text-[11px] text-blue-900 font-bold mt-1">સક્રિય કતાર: ૩ નાગરિકો</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
