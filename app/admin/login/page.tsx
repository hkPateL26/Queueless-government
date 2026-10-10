'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, Lock, User, ArrowRight, CheckCircle2, AlertCircle, 
  Building, ChevronRight, Eye, EyeOff, Sparkles, ArrowLeft, RefreshCw,
  KeyRound, Landmark, BadgeCheck, FileText, Check
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { GovLogo } from '@/components/GovLogo';
import { 
  OFFICIAL_SEED_OFFICERS, OfficerAccount, authenticateOfficer, saveOfficerSession 
} from '@/lib/admin-auth';
import { FirebaseBadge } from '@/components/FirebaseBadge';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('operator.c1');
  const [password, setPassword] = useState('Counter1@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<OfficerAccount | null>(OFFICIAL_SEED_OFFICERS[4]);

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('tap');
    setIsLoading(true);
    setErrorMsg(null);

    setTimeout(() => {
      const officer = authenticateOfficer(username, password);
      if (officer) {
        triggerHaptic('success');
        saveOfficerSession(officer);
        router.push(officer.defaultRoute);
      } else {
        triggerHaptic('error');
        setErrorMsg('ખોટું વપરાશકર્તા નામ અથવા પાસવર્ડ. કૃપા કરીને ડેમો ઓળખપત્રોનો ઉપયોગ કરો.');
        setIsLoading(false);
      }
    }, 400);
  };

  const handleQuickPersonaLogin = (officer: OfficerAccount) => {
    triggerHaptic('success');
    setSelectedPersona(officer);
    setUsername(officer.username);
    setPassword(officer.password);
    setIsLoading(true);
    setErrorMsg(null);

    setTimeout(() => {
      saveOfficerSession(officer);
      router.push(officer.defaultRoute);
    }, 350);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-[#002244] to-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Gov Header */}
      <header className="bg-slate-950/80 backdrop-blur-md border-b border-blue-900/50 py-2.5 px-4 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GovLogo className="w-9 h-9 drop-shadow-md" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-white tracking-wide">QueueLess Kacheri</span>
                <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded">SSO</span>
              </div>
              <p className="text-[10px] text-blue-200">ગુજરાત સરકાર • મહેસૂલ વિભાગ • સિંગલ સાઇન-ઓન (Single Sign-On)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <FirebaseBadge lang="gu" />

            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-blue-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl border border-white/15 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>નાગરિક પોર્ટલ</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-700/60 text-blue-300 text-xs font-semibold shadow-inner">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>સત્તાવાર ૫-સ્તરીય ભૂમિકા-આધારિત વહીવટી પ્રવેશ (5-Tier RBAC)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            કચેરી અધિકારી લૉગિન પોર્ટલ
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            રાજ્ય, કલેક્ટર, મામલતદાર, જન સેવા ઇન્ચાર્જ અને કાઉન્ટર ડેસ્ક અધિકૃત પ્રમાણીકરણ
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: 1-Click Quick Evaluator / Judge Access (6 Officer Personas) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-black text-amber-300 uppercase tracking-wider">
                  ઝડપી ડેમો ઓફિસર પ્રવેશ (1-Click Judge Access)
                </h2>
              </div>
              <span className="text-[10px] text-slate-400">મૂલ્યાંકન હેતુ માટે ૧-ક્લિક લૉગિન</span>
            </div>

            <div className="space-y-2.5">
              {OFFICIAL_SEED_OFFICERS.map((officer) => {
                const isSelected = selectedPersona?.id === officer.id;
                return (
                  <button
                    key={officer.id}
                    onClick={() => handleQuickPersonaLogin(officer)}
                    disabled={isLoading}
                    className={`w-full text-left p-3.5 rounded-2xl border transition flex items-start gap-3.5 cursor-pointer group active:scale-[0.99] ${
                      isSelected
                        ? 'bg-blue-900/60 border-amber-400/80 shadow-lg shadow-blue-950/50'
                        : 'bg-slate-900/70 hover:bg-slate-800/80 border-slate-700/60 hover:border-blue-500/50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition">
                      {officer.avatarBadge}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-amber-300 transition truncate">
                          {officer.nameGu}
                        </h3>
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 tracking-wider bg-slate-800 text-blue-300 border border-slate-700">
                          {officer.role.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-[11px] text-amber-400/90 font-bold mt-0.5 leading-snug">
                        {officer.designationGu}
                      </p>

                      <p className="text-[10px] text-slate-400 mt-1 leading-snug line-clamp-1">
                        {officer.descriptionGu}
                      </p>

                      <div className="flex items-center gap-2 mt-1.5 text-[9.5px] text-slate-400 font-mono">
                        <span className="bg-black/40 px-1.5 py-0.2 rounded border border-white/5">
                          ID: {officer.officerCode}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span>યુઝર: <strong className="text-slate-300 font-mono">{officer.username}</strong></span>
                      </div>
                    </div>

                    <div className="shrink-0 self-center pl-1 text-slate-400 group-hover:text-amber-400 transition">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Manual Credentials Login Card */}
          <div className="lg:col-span-5 bg-slate-900/90 border border-blue-900/70 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-blue-950 border border-blue-700 flex items-center justify-center text-amber-400">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">ઓળખપત્ર લૉગિન (Manual Login)</h3>
                <p className="text-[10.5px] text-slate-400">પાસવર્ડ દ્વારા સુરક્ષિત સરકારી પ્રવેશ</p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-950/80 border border-red-700 rounded-xl flex items-start gap-2.5 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleManualLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  વપરાશકર્તા નામ (Username / Service ID)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="દા.ત. operator.c1 અથવા collector.rajkot"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl py-2.5 pl-9.5 pr-3 text-xs text-white placeholder-slate-500 outline-none transition font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  ગુપ્ત પાસવર્ડ (Password)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="પાસવર્ડ દાખલ કરો"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-xl py-2.5 pl-9.5 pr-10 text-xs text-white placeholder-slate-500 outline-none transition font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-900/40 text-[11px] text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ડેમો ટેસ્ટિંગ પાસવર્ડ્સ:</span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">
                  • કાઉન્ટર ૧: <code className="text-amber-300">Counter1@2026</code><br />
                  • કાઉન્ટર ૨: <code className="text-amber-300">Counter2@2026</code><br />
                  • મામલતદાર: <code className="text-amber-300">Gondal@2026</code><br />
                  • કલેક્ટર: <code className="text-amber-300">Rajkot@2026</code>
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-black text-xs bg-gradient-to-r from-[#FF9933] to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>પ્રમાણીકરણ ચકાસી રહ્યું છે...</span>
                  </>
                ) : (
                  <>
                    <span>સત્તાવાર લૉગિન કરો (Sign In)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-800 text-center">
              <p className="text-[10px] text-slate-500">
                ગુજરાત સરકાર • સામાન્ય વહીવટ વિભાગ • GRTSA ૨૦૧૩ માન્ય સિક્યોર્ડ પ્રોટોકોલ
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
