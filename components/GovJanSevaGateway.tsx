'use client';

import React, { useState, useMemo } from 'react';
import { 
  Building2, MapPin, Calendar, Clock, Ticket, Search, 
  CheckCircle2, ArrowRight, ShieldCheck, ChevronRight,
  ExternalLink, Layers, Sparkles, Navigation, UserCheck
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { Language, t } from '@/lib/translations';
import { GovLogo } from '@/components/GovLogo';
import { GUJARAT_33_DISTRICTS } from '@/lib/jurisdiction-data';
import { BookingDetails } from '@/components/SlotBookingModal';

interface GovJanSevaGatewayProps {
  currentUser: { name: string; role: string; area: string; token: string } | null;
  activeBooking: BookingDetails | null;
  onOpenTokenTracker: () => void;
  onOpenSlotModal: () => void;
  onOpenTokenPassModal: () => void;
  onLoginDemo?: () => void;
  onExploreServices?: () => void;
  lang: Language;
}

export function GovJanSevaGateway({
  currentUser,
  activeBooking,
  onOpenTokenTracker,
  onOpenSlotModal,
  onOpenTokenPassModal,
  onLoginDemo,
  onExploreServices,
  lang
}: GovJanSevaGatewayProps) {
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('rajkot');
  const [selectedTalukaId, setSelectedTalukaId] = useState<string>('gondal');

  const isGu = lang === 'gu';
  const isHi = lang === 'hi';
  const isMr = lang === 'mr';
  const isEn = lang === 'en';

  const selectedDistrict = useMemo(() => {
    return GUJARAT_33_DISTRICTS.find(d => d.id === selectedDistrictId) || GUJARAT_33_DISTRICTS[0];
  }, [selectedDistrictId]);

  const selectedTaluka = useMemo(() => {
    return selectedDistrict.talukas.find(t => t.id === selectedTalukaId) || selectedDistrict.talukas[0];
  }, [selectedDistrict, selectedTalukaId]);

  const handleDistrictChange = (distId: string) => {
    triggerHaptic('tap');
    setSelectedDistrictId(distId);
    const dist = GUJARAT_33_DISTRICTS.find(d => d.id === distId);
    if (dist && dist.talukas.length > 0) {
      setSelectedTalukaId(dist.talukas[0].id);
    }
  };

  const getDistrictDisplayName = (dist: typeof selectedDistrict) => {
    if (isEn) return dist.nameEn;
    return dist.nameGu;
  };

  const getTalukaDisplayName = (tal: typeof selectedTaluka) => {
    if (isEn) return tal.nameEn;
    if (isHi || isMr) return `${tal.nameGu} (${tal.nameEn})`;
    return tal.nameGu;
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col justify-between transition duration-200">
      
      {/* 🏛️ OFFICIAL GOV HEADER BAR */}
      <div className="bg-[#003366] text-white p-4 sm:p-5 relative overflow-hidden">
        {/* Subtle Ashoka / Gujarat emblem background tint */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
        
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <GovLogo className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 drop-shadow-md" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-400/20 text-[#FF9933] border border-amber-400/30 px-2 py-0.5 rounded">
                  {isGu 
                    ? 'ગુજરાત સરકાર • મહેસૂલ વિભાગ' 
                    : isHi 
                    ? 'गुजरात सरकार • राजस्व विभाग' 
                    : isMr 
                    ? 'गुजरात शासन • महसूल विभाग' 
                    : 'Govt of Gujarat • Revenue Dept'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight mt-1">
                {isGu 
                  ? 'જન સેવા કેન્દ્ર • અધિકૃત ડેસ્ક' 
                  : isHi 
                  ? 'जन सेवा केंद्र • आधिकारिक डेस्क' 
                  : isMr 
                  ? 'जन सेवा केंद्र • अधिकृत डेस्क' 
                  : 'Jan Seva Kendra • Official Gateway'}
              </h3>
            </div>
          </div>

          {/* Live Kacheri Status Pill */}
          <div className="text-right shrink-0">
            <span className="inline-flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {isGu ? 'કચેરી ખુલ્લી છે' : isHi ? 'कार्यालय खुला है' : isMr ? 'कार्यालय सुरू आहे' : 'Kacheri Open'}
              </span>
            </span>
            <p className="text-[9px] text-blue-200 mt-1 font-mono">10:30 AM – 6:10 PM</p>
          </div>
        </div>
      </div>

      {/* 🧭 JURISDICTION SELECTOR & LIVE RADAR */}
      <div className="p-4 sm:p-5 space-y-4">
        
        {/* District & Taluka Selectors */}
        <div className="bg-[#F5F7FA] border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span className="flex items-center gap-1 text-[#003366] font-extrabold">
              <MapPin className="w-3.5 h-3.5 text-[#FF9933]" />
              <span>
                {isGu ? 'કચેરી અધિકારક્ષેત્ર પસંદ કરો' : isHi ? 'कार्यालय अधिकार क्षेत्र चुनें' : isMr ? 'कार्यालय अधिकार क्षेत्र निवडा' : 'Select Office Jurisdiction'}
              </span>
            </span>
            <span className="text-[10px] text-slate-400">
              {isGu ? '૩૩ જિલ્લાઓ • ૨૫૦+ તાલુકાઓ' : isHi ? '३३ जिले • २५०+ तहसील' : isMr ? '३३ जिल्हे • २५०+ तालुके' : '33 Districts • 250+ Talukas'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* District Dropdown */}
            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">
                {isGu ? 'જિલ્લો (District):' : isHi ? 'ज़िला (District):' : isMr ? 'जिल्हा (District):' : 'District:'}
              </label>
              <select
                value={selectedDistrictId}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#003366] focus:border-[#005A9C] outline-none shadow-xs truncate"
              >
                {GUJARAT_33_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {getDistrictDisplayName(d)}
                  </option>
                ))}
              </select>
            </div>

            {/* Taluka Dropdown */}
            <div>
              <label className="text-[10px] font-bold text-slate-600 block mb-1">
                {isGu ? 'તાલુકો / કચેરી:' : isHi ? 'तहसील / कार्यालय:' : isMr ? 'तालुका / कार्यालय:' : 'Taluka / Office:'}
              </label>
              <select
                value={selectedTalukaId}
                onChange={(e) => {
                  triggerHaptic('tap');
                  setSelectedTalukaId(e.target.value);
                }}
                className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#003366] focus:border-[#005A9C] outline-none shadow-xs truncate"
              >
                {selectedDistrict.talukas.map((t) => (
                  <option key={t.id} value={t.id}>
                    {getTalukaDisplayName(t)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Live Center Telemetry Stats Strip */}
          <div className="pt-2 border-t border-slate-200/80 grid grid-cols-3 gap-2 text-center">
            <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-xs">
              <p className="text-[9px] font-bold text-slate-400 uppercase">
                {isGu ? 'વર્તમાન ટોકન' : isHi ? 'वर्तमान टोकन' : isMr ? 'सध्याचा टोकन' : 'Current'}
              </p>
              <p className="text-sm font-black text-[#003366] font-mono mt-0.5">#A-42</p>
            </div>
            <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-xs">
              <p className="text-[9px] font-bold text-slate-400 uppercase">
                {isGu ? 'સરેરાશ સમય' : isHi ? 'औसत प्रतीक्षा' : isMr ? 'सरासरी वेळ' : 'Avg Wait'}
              </p>
              <p className="text-sm font-black text-[#138808] font-mono mt-0.5">~14 min</p>
            </div>
            <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-xs">
              <p className="text-[9px] font-bold text-slate-400 uppercase">
                {isGu ? 'કાઉન્ટર' : isHi ? 'सक्रिय काउंटर' : isMr ? 'सक्रिय काउंटर' : 'Counters'}
              </p>
              <p className="text-sm font-black text-[#FF9933] font-mono mt-0.5">4 Open</p>
            </div>
          </div>
        </div>

        {/* 🎫 CONDITIONAL: ACTIVE CITIZEN TOKEN PASS */}
        {(activeBooking || currentUser) && (
          <div className="bg-gradient-to-r from-blue-50 to-amber-50 border-2 border-[#005A9C] rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-[#003366] text-[#FF9933] flex flex-col items-center justify-center font-black shrink-0 shadow-xs">
                <span className="text-[9px] text-blue-200 leading-none">TOKEN</span>
                <span className="text-sm leading-tight">{activeBooking ? activeBooking.tokenNumber : (currentUser?.token || '#A-42')}</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded border border-emerald-300">
                    {isGu ? 'સક્રિય પાસ' : isHi ? 'सक्रिय पास' : isMr ? 'सक्रिय पास' : 'ACTIVE PASS'}
                  </span>
                  <p className="text-xs font-black text-[#003366] truncate">{isGu ? 'હરિ પટેલ' : isHi ? 'हरि पटेल' : isMr ? 'हरी पटेल' : 'Hari Patel'}</p>
                </div>
                <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                  {activeBooking 
                    ? `${activeBooking.slot.timeRange} • ${activeBooking.taluka.nameGu || activeBooking.taluka.nameEn}` 
                    : (isGu ? '૧૧:૩૦ AM સ્લોટ • કાઉન્ટર ૧' : isHi ? '११:३० AM स्लॉट • काउंटर १' : isMr ? '११:३० AM स्लॉट • काउंटर १' : '11:30 AM Slot • Counter 1')}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                triggerHaptic('tap');
                if (activeBooking) onOpenTokenPassModal();
                else onOpenTokenTracker();
              }}
              className="px-3 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-[11px] font-extrabold shadow-sm active:scale-95 transition shrink-0 cursor-pointer"
            >
              {isGu ? 'પાસ જુઓ' : isHi ? 'पास देखें' : isMr ? 'पास पहा' : 'View Pass'}
            </button>
          </div>
        )}

        {/* 🚀 PRIMARY OFFICIAL ACTION DESK */}
        <div className="space-y-2.5">
          
          {/* Action 1: Book Appointment Slot */}
          <button
            onClick={() => {
              triggerHaptic('success');
              onOpenSlotModal();
            }}
            className="w-full bg-[#005A9C] hover:bg-[#003366] text-white p-3 sm:p-3.5 rounded-2xl shadow-md transition active:scale-[0.98] flex items-center justify-between gap-3 text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/10 group-hover:bg-white/20 flex items-center justify-center text-white shrink-0 transition">
                <Calendar className="w-5 h-5 text-[#FF9933]" />
              </div>
              <div className="min-w-0">
                <h4 className="font-extrabold text-sm sm:text-base leading-tight">
                  {isGu 
                    ? 'ઓનલાઇન સ્લોટ / ટોકન બુક કરો' 
                    : isHi 
                    ? 'ऑनलाइन स्लॉट / टोकन बुक करें' 
                    : isMr 
                    ? 'ऑनलाईन स्लॉट / टोकन बुक करा' 
                    : 'Book Appointment Slot / Token'}
                </h4>
                <p className="text-[10.5px] text-blue-100 font-medium truncate mt-0.5">
                  {isGu 
                    ? 'કતાર વગર સીધો પ્રવેશ • ૨ મિનિટમાં સ્લોટ પુષ્ટિ' 
                    : isHi 
                    ? 'बिना कतार सीधा प्रवेश • २ मिनट में पुष्टि' 
                    : isMr 
                    ? 'रांगेविना थेट प्रवेश • २ मिनिटांत पुष्टी' 
                    : 'Queue-free direct entry • Instant confirmation'}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition shrink-0" />
          </button>

          {/* Action 2: Track Live Token */}
          <button
            onClick={() => {
              triggerHaptic('tap');
              onOpenTokenTracker();
            }}
            className="w-full bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-[#005A9C] p-3 rounded-2xl shadow-xs transition active:scale-[0.98] flex items-center justify-between gap-3 text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center text-[#005A9C] shrink-0 transition">
                <Search className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-[#003366] leading-tight">
                  {isGu 
                    ? 'લાઈવ ટોકન સ્થિતિ ચકાસો (Track Token)' 
                    : isHi 
                    ? 'लाइव टोकन स्थिति जांचें (Track Token)' 
                    : isMr 
                    ? 'थेट टोकन स्थिती तपासा (Track Token)' 
                    : 'Check Live Token Status'}
                </h4>
                <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                  {isGu 
                    ? 'તમારો વર્તમાન નંબર અને અંદાજિત સમય જુઓ' 
                    : isHi 
                    ? 'कतार में अपना नंबर व समय जांचें' 
                    : isMr 
                    ? 'रांगेतील आपला क्रमांक व वेळ तपासा' 
                    : 'Check live queue position & wait time'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#005A9C] group-hover:translate-x-0.5 transition shrink-0" />
          </button>

        </div>

      </div>

      {/* ⚖️ STATUTORY SERVICE GUARANTEE FOOTER */}
      <div className="p-3 sm:p-3.5 bg-slate-50 border-t border-slate-200 text-center">
        <div className="flex items-center justify-center gap-1.5 text-[10.5px] font-black text-[#003366]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#138808] shrink-0" />
          <span>
            {isGu 
              ? 'ગુજરાત જાહેર સેવા હક અધિનિયમ ૨૦૧૩ (GRTSA) હેઠળ ૧૦૦% સમયબદ્ધ સેવા બાંહેધરી' 
              : isHi 
              ? 'गुजरात लोक सेवा अधिकार अधिनियम २०१३ (GRTSA) के तहत १००% समयबद्ध सेवा गारंटी' 
              : isMr 
              ? 'गुजरात लोकसेवा हक्क कायदा २०१३ (GRTSA) अंतर्गत १००% वेळेवर सेवा हमी' 
              : '100% Timely Service Guarantee under GRTSA 2013'}
          </span>
        </div>
        <p className="text-[9.5px] text-slate-400 mt-0.5">
          {isGu 
            ? 'સમયમર્યાદા: ૨૪ કલાકથી ૭ દિવસ • ૧૦૦% પારદર્શક ટ્રેકિંગ' 
            : isHi 
            ? 'समय-सीमा: २४ घंटे से ७ दिन • १००% पारदर्शी ट्रैकिंग' 
            : isMr 
            ? 'वेळ मर्यादा: २४ तास ते ७ दिवस • १००% पारदर्शक ट्रॅकिंग' 
            : 'Delivery Norm: 24h - 7 Days • 100% Transparent Tracking'}
        </p>
      </div>

    </div>
  );
}
