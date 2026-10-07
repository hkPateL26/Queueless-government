'use client';

import React, { useState, useMemo } from 'react';
import { 
  QrCode, Clock, MapPin, UserCheck, AlertTriangle, 
  Download, Share2, CheckCircle2, ShieldCheck, Printer,
  Volume2, ArrowRight, RefreshCw, Smartphone, Layers, X,
  Calendar, Navigation, FileCheck2, Star, CheckCircle, Shield,
  ExternalLink, Bell, Sparkles, MessageSquare
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { speakGuidance } from '@/lib/voice';
import { BookingDetails } from './SlotBookingModal';
import { SchemeItem } from '@/lib/schemes-data';

interface DigitalTokenPassProps {
  booking: BookingDetails;
  scheme: SchemeItem | null;
  citizenName: string;
  onClose?: () => void;
  lang?: 'en' | 'gu' | 'hi';
}

export function DigitalTokenPass({
  booking,
  scheme,
  citizenName,
  onClose,
  lang = 'gu'
}: DigitalTokenPassProps) {
  // Late shifting state
  const [shiftCount, setShiftCount] = useState<number>(0);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(18);
  const [currentSlotTime, setCurrentSlotTime] = useState<string>(booking.slot.timeRange);
  const [aheadInQueue, setAheadInQueue] = useState<number>(2);

  // Phase 3 Enhancements: Gate Verifier & SMS Modal States
  const [verifierOpen, setVerifierOpen] = useState<boolean>(false);
  const [smsModalOpen, setSmsModalOpen] = useState<boolean>(false);

  const handleRunningLate = () => {
    triggerHaptic('warning');
    const newCount = shiftCount + 1;
    setShiftCount(newCount);
    setEstimatedMinutes(prev => prev + 36);
    setAheadInQueue(prev => prev + 3);

    speakGuidance("તમારો ટોકન ૩ સ્લોટ પાછળ ખસેડવામાં આવ્યો છે. કાઉન્ટર તમારો નંબર છોડશે નહીં.");
    alert(`⚠️ મોડું થવાની વિનંતી મંજૂર!\n\nતમારો ટોકન ૩ સ્લોટ (+૩૬ મિનિટ) આગળ ધકેલવામાં આવ્યો છે.\nનવો અંદાજિત સમય: +${estimatedMinutes + 36} મિનિટ પછી.\nકાઉન્ટર અધિકારી તમારો વારો સ્કીપ નહીં કરે.`);
  };

  const handleDownload = () => {
    triggerHaptic('success');
    speakGuidance("ટોકન પાસ ડાઉનલોડ થઈ રહ્યો છે.");
    window.print();
  };

  const handleWhatsAppShare = () => {
    triggerHaptic('tap');
    const msg = encodeURIComponent(
      `🏛️ ગુજરાત સરકાર ઈ-જન સેવા ટોકન પાસ\n` +
      `ટોકન નંબર: ${booking.tokenNumber}\n` +
      `યોજના/સેવા: ${scheme ? scheme.titleGu : 'જન સેવા'}\n` +
      `કચેરી: ${booking.taluka.officeNameGu}, ${booking.district.nameGu}\n` +
      `કાઉન્ટર: ${booking.counterNumber} (${booking.counterNameGu})\n` +
      `સમય સ્લોટ: ${currentSlotTime}\n` +
      `GRTSA માન્ય ડિજિટલ પાસ.`
    );
    window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
  };

  const handleAddToCalendar = () => {
    triggerHaptic('success');
    speakGuidance("ગૂગલ કેલેન્ડર અને એલાર્મ એડ થઈ રહ્યું છે.");
    const ymd = booking.date.replace(/-/g, '');
    const startTimeParts = booking.slot.startTime.split(':');
    const startH = (startTimeParts[0] || '10').padStart(2, '0');
    const startM = (startTimeParts[1] || '30').padStart(2, '0');
    
    const title = encodeURIComponent(`🏛️ સરકારી કચેરી એપોઇન્ટમેન્ટ: ${scheme ? scheme.titleGu : 'જન સેવા'} (${booking.tokenNumber})`);
    const details = encodeURIComponent(`ટોકન નંબર: ${booking.tokenNumber}\nકચેરી: ${booking.taluka.officeNameGu}\nકાઉન્ટર: ${booking.counterNumber} (${booking.counterNameGu})\nઅધિકારી: ${booking.officerName}\n\nGRTSA 2013 માન્ય QueueLess ડિજિટલ પાસ.`);
    const location = encodeURIComponent(`${booking.taluka.officeNameGu}, ${booking.district.nameGu}`);
    
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${ymd}T${startH}${startM}00/${ymd}T${startH}${startM}00`;
    window.open(gCalUrl, '_blank');
  };

  const docsList = useMemo(() => {
    if (scheme && scheme.requiredDocs && scheme.requiredDocs.length > 0) {
      return scheme.requiredDocs.map(d => d.nameGu);
    }
    return [
      'અસલ આધાર કાર્ડ (Original UIDAI)',
      'ચાલુ વર્ષનો આવકનો દાખલો (Original)',
      '૨ પાસપોર્ટ સાઇઝ કલર ફોટા',
      'રેશનકાર્ડ નકલ / સરનામા પુરાવો'
    ];
  }, [scheme]);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl border-2 border-[#003366]/20 overflow-hidden text-[#1F2937]">
      {/* GOVERNMENT OFFICIAL HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#003366] via-[#005A9C] to-[#003366] text-white p-4 sm:p-5 relative overflow-hidden">
        {/* Tricolor top border indicator */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex">
          <div className="flex-1 bg-[#FF9933]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#138808]" />
        </div>

        <div className="flex items-start sm:items-center justify-between gap-2">
          <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-[#FF9933] font-bold shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[9px] sm:text-[11px] font-bold tracking-wider uppercase bg-white/20 px-1.5 py-0.5 rounded text-white whitespace-nowrap">
                  GUJARAT GOV
                </span>
                <span className="flex items-center gap-1 text-[9px] sm:text-[11px] font-bold text-green-300">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400 animate-pulse" />
                  સક્રિય
                </span>
                {booking.isPriority && (
                  <span className="bg-[#FF9933] text-slate-900 font-extrabold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs animate-pulse">
                    ⭐ વરિષ્ઠ/દિવ્યાંગ પ્રાયોરિટી પાસ
                  </span>
                )}
              </div>
              <h2 className="text-sm sm:text-lg font-bold text-white mt-0.5 truncate">
                ઈ-જન સેવા ટોકન પાસ
              </h2>
              <p className="text-[10px] sm:text-xs text-blue-100 truncate">
                {booking.taluka.officeNameGu}
              </p>
            </div>
          </div>

          {/* TOKEN CHIP & CLOSE BUTTON */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="text-right">
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-blue-200 block">ટોકન ક્રમાંક</span>
              <span className="text-xl sm:text-3xl font-extrabold font-mono text-[#FF9933] drop-shadow-sm">
                {booking.tokenNumber}
              </span>
            </div>
            {onClose && (
              <button
                onClick={() => {
                  triggerHaptic('tap');
                  onClose();
                }}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition shrink-0"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PASS CONTENT */}
      <div className="p-4 sm:p-6 space-y-5">
        
        {/* CITIZEN & SCHEME SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 block">નાગરિકનું નામ (Citizen Name)</span>
            <span className="text-sm font-bold text-gray-900">{citizenName}</span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500 block">યોજના / સેવા (Service)</span>
            <span className="text-sm font-bold text-[#003366]">
              {scheme ? scheme.titleGu : 'સામાન્ય જન સેવા'}
            </span>
          </div>
        </div>

        {/* QR CODE & COUNTER ROUTING GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          
          {/* QR Code Container */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50/50 to-indigo-50/50 rounded-2xl border border-blue-200 text-center">
            <div className="bg-white p-3 rounded-xl shadow-md border border-gray-200 relative group">
              {/* Fallback SVG QR Code */}
              <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none">
                <rect width="100" height="100" fill="white" />
                {/* Outer corners */}
                <rect x="5" y="5" width="26" height="26" fill="#003366" rx="3" />
                <rect x="9" y="9" width="18" height="18" fill="white" />
                <rect x="13" y="13" width="10" height="10" fill="#003366" />

                <rect x="69" y="5" width="26" height="26" fill="#003366" rx="3" />
                <rect x="73" y="9" width="18" height="18" fill="white" />
                <rect x="77" y="13" width="10" height="10" fill="#003366" />

                <rect x="5" y="69" width="26" height="26" fill="#003366" rx="3" />
                <rect x="9" y="73" width="18" height="18" fill="white" />
                <rect x="13" y="77" width="10" height="10" fill="#003366" />

                {/* Data blocks */}
                <rect x="36" y="8" width="8" height="8" fill="#005A9C" />
                <rect x="48" y="12" width="12" height="6" fill="#FF9933" />
                <rect x="36" y="24" width="6" height="12" fill="#138808" />
                <rect x="46" y="22" width="16" height="8" fill="#003366" />
                <rect x="8" y="38" width="14" height="6" fill="#003366" />
                <rect x="26" y="40" width="8" height="14" fill="#005A9C" />
                <rect x="40" y="38" width="20" height="20" fill="#003366" rx="2" />
                <circle cx="50" cy="48" r="4" fill="#FF9933" />
                <rect x="66" y="38" width="10" height="10" fill="#138808" />
                <rect x="80" y="44" width="12" height="6" fill="#003366" />
                <rect x="38" y="64" width="14" height="6" fill="#005A9C" />
                <rect x="58" y="64" width="8" height="14" fill="#FF9933" />
                <rect x="44" y="76" width="16" height="14" fill="#003366" />
                <rect x="68" y="72" width="12" height="10" fill="#138808" />
                <rect x="82" y="68" width="10" height="22" fill="#005A9C" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/5 rounded-xl pointer-events-none">
                <span className="text-[10px] font-bold bg-[#003366] text-white px-2 py-0.5 rounded shadow">
                  Qless-GRTSA-Scan
                </span>
              </div>
            </div>

            <span className="text-[10px] font-mono text-gray-500 mt-2">
              કચેરી સ્કેનર ID: QLESS-{booking.tokenNumber.replace('#', '')}-GP
            </span>
            <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full mt-1">
              ✓ ઑફલાઇન QR માન્ય (No Internet Required)
            </span>
          </div>

          {/* Counter, Time, and Queue Details */}
          <div className="md:col-span-7 space-y-3">
            
            {/* Auto-routed Counter Box */}
            <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#003366] text-white font-bold flex items-center justify-center text-sm">
                    {booking.counterNumber}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-blue-950">
                      કાઉન્ટર {booking.counterNumber}: {booking.counterNameGu}
                    </h4>
                    <span className="text-[11px] text-gray-600 block">
                      અધિકારી: <strong>{booking.officerName}</strong>
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                  સીધો પ્રવેશ
                </span>
              </div>
            </div>

            {/* Time Slot & Queue Estimate */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-[10px] font-semibold text-gray-500 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#005A9C]" />
                  સમય સ્લોટ
                </span>
                <span className="text-xs font-bold text-gray-900 mt-1 block">
                  {currentSlotTime}
                </span>
                <span className="text-[10px] text-gray-500 font-mono">
                  તારીખ: {booking.date}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-[10px] font-semibold text-gray-500 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-[#138808]" />
                  કતારમાં સ્થિતિ
                </span>
                <span className="text-xs font-bold text-[#138808] mt-1 block">
                  આગળ {aheadInQueue} નાગરિકો બાકી
                </span>
                <span className="text-[10px] text-gray-500">
                  અંદાજિત રાહ: ~{estimatedMinutes} મિનિટ
                </span>
              </div>
            </div>

            {/* Jurisdiction Location */}
            <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-2 text-xs text-gray-700">
              <MapPin className="w-4 h-4 text-[#005A9C] shrink-0" />
              <span className="truncate">
                {booking.taluka.officeNameGu}, જિલ્લો: {booking.district.nameGu}
              </span>
            </div>

          </div>
        </div>

        {/* 1. TRANSIT & TRAVEL BUFFER: LEAVE HOME BY */}
        <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50/70 rounded-xl border border-blue-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#005A9C] text-white flex items-center justify-center shrink-0">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#003366]">ઘરેથી નીકળવાનો સાચો સમય (Leave Home By)</p>
              <p className="text-[10.5px] text-slate-600">
                અંદાજિત અંતર: <strong>૧૮ કિ.મી. (~૩૫ મિનિટ મુસાફરી)</strong>
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs sm:text-sm font-black text-blue-900 bg-white border border-blue-300 px-2 sm:px-2.5 py-1 rounded-lg">
              {booking.leaveHomeBy || '10:45 AM'}
            </span>
            <span className="block text-[8.5px] font-bold text-emerald-700 mt-0.5">૧૦ મિ. બફર સામેલ</span>
          </div>
        </div>

        {/* 2. PHYSICAL ORIGINAL DOCUMENTS CHECKLIST TO CARRY */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#003366] flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-[#005A9C]" />
              <span>કચેરીએ સાથે લઈ જવાના અસલ કાગળો (Physical Documents Checklist)</span>
            </span>
            <span className="text-[9.5px] text-emerald-700 font-extrabold bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
              ઓરિજિનલ ફરજિયાત
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {docsList.slice(0, 4).map((doc, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#138808] shrink-0" />
                <span className="font-semibold text-slate-800 text-[11px] truncate">{doc}</span>
              </div>
            ))}
          </div>
          <p className="text-[9.5px] text-slate-500">
            * નોંધ: કાઉન્ટર પર અધિકારી સમક્ષ અસલ કાગળો રજૂ કરવાથી અરજી તે જ દિવસે મંજૂર થશે.
          </p>
        </div>

        {/* PHASE 3 DYNAMIC FEATURE: "I'M RUNNING LATE" (+3 SLOTS SHIFTER) */}
        <div className="p-4 bg-amber-50/80 border-2 border-amber-300 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-amber-950">
                  કચેરી પહોંચવામાં મોડું થાય છે? (Running Late?)
                </h4>
                {shiftCount > 0 && (
                  <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-2 py-0.2 rounded-full">
                    {shiftCount} વખત ખસેડેલ
                  </span>
                )}
              </div>
              <p className="text-[11px] text-amber-800 mt-0.5">
                એક ક્લિકમાં ટોકન ૩ સ્લોટ (+૩૬ મિનિટ) આગળ ખસેડો જેથી કાઉન્ટર પર તમારો નંબર કેન્સલ ન થાય!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRunningLate}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>+૩ સ્લોટ ખસેડો (+36m)</span>
          </button>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>પ્રિન્ટ / PDF</span>
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="px-3 py-2 rounded-xl bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>વોટ્સએપ શેર</span>
            </button>
            <button
              onClick={handleAddToCalendar}
              className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#005A9C] border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>કેલેન્ડર એલાર્મ</span>
            </button>
            <button
              onClick={() => {
                triggerHaptic('tap');
                setVerifierOpen(true);
              }}
              className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>ગેટ સ્કેનર</span>
            </button>
            <button
              onClick={() => {
                triggerHaptic('tap');
                setSmsModalOpen(true);
              }}
              className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#FF9933]" />
              <span>સરકારી SMS</span>
            </button>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold transition ml-auto"
            >
              ડેશબોર્ડ પર જાઓ
            </button>
          )}
        </div>
      </div>
    </div>

      {/* 1. GATE SECURITY KIOSK SCANNER SIMULATOR MODAL */}
      {verifierOpen && (
        <div 
          onClick={() => setVerifierOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 modal-backdrop animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 max-w-md w-full border border-slate-700 shadow-2xl relative overflow-hidden"
          >
            {/* Top scanning HUD */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Gate Kiosk Scanner • Live
                </span>
              </div>
              <button 
                onClick={() => setVerifierOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300"
              >
                ✕
              </button>
            </div>

            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40 flex items-center justify-center mx-auto text-2xl shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                <ShieldCheck className="w-9 h-9" />
              </div>

              <div>
                <span className="text-[10px] font-black tracking-widest text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-0.5 rounded-full uppercase">
                  ✓ કચેરી પ્રવેશ મંજૂર (ENTRY AUTHORIZED)
                </span>
                <h3 className="text-lg font-black text-white mt-1.5">{citizenName}</h3>
                <p className="text-xs text-slate-400 font-mono">QLESS-{booking.tokenNumber.replace('#','')}-GP • 12-DIGIT HASH</p>
              </div>

              <div className="bg-slate-800/80 rounded-2xl p-3.5 border border-slate-700/80 text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-700 pb-1.5">
                  <span className="text-slate-400">ટોકન ક્રમાંક:</span>
                  <span className="font-mono font-black text-[#FF9933]">{booking.tokenNumber}</span>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-1.5">
                  <span className="text-slate-400">ફાળવેલ કાઉન્ટર:</span>
                  <span className="font-bold text-white">કાઉન્ટર {booking.counterNumber} ({booking.counterNameGu})</span>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-1.5">
                  <span className="text-slate-400">અધિકારી:</span>
                  <span className="font-bold text-white">{booking.officerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">માન્ય પ્રવેશ વિન્ડો:</span>
                  <span className="font-bold text-emerald-400">{booking.slot.startTime} ± ૧૫ મિનિટ</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed">
                કચેરી ગેટ ૧ સિક્યોરિટી ગાર્ડ વેરિફિકેશન સિસ્ટમ દ્વારા પ્રમાણિત. નાગરિકને સીધા કાઉન્ટર {booking.counterNumber} પર જવા મંજૂરી આપેલ છે.
              </p>

              <button
                onClick={() => setVerifierOpen(false)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl text-xs transition active:scale-95"
              >
                વેરિફિકેશન પૂર્ણ કરો (Done)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. OFFICIAL GOVERNMENT SMS DISPATCH SIMULATOR MODAL */}
      {smsModalOpen && (
        <div 
          onClick={() => setSmsModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 modal-backdrop animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full border border-slate-200 shadow-2xl relative"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#005A9C] flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h4 className="text-xs font-black text-[#003366]">સત્તાવાર સરકારી SMS સિમ્યુલેશન</h4>
                  <p className="text-[10px] text-slate-400 font-mono">GSDC-GUJGOV • 55412</p>
                </div>
              </div>
              <button 
                onClick={() => setSmsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {/* Simulated SMS Bubble */}
            <div className="bg-[#F5F7FA] border border-slate-200 rounded-2xl p-4 space-y-2 text-left">
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span className="font-bold text-[#005A9C]">🏛️ GSDC-GUJGOV</span>
                <span>હમણાં જ • SMS</span>
              </div>
              <p className="text-xs font-medium text-slate-800 leading-relaxed">
                નમસ્તે <strong>{citizenName}</strong>, આપનો ઈ-જન સેવા ટોકન ક્રમાંક <strong>{booking.tokenNumber}</strong> તારીખ {booking.date}, સમય <strong>{booking.slot.timeRange}</strong> માટે {booking.taluka.officeNameGu} (કાઉન્ટર {booking.counterNumber}) ખાતે સફળતાપૂર્વક કન્ફર્મ થયેલ છે.
              </p>
              <p className="text-[11px] text-slate-600">
                કૃપા કરીને અસલ આધાર કાર્ડ અને કાગળો સાથે સમયસર હાજર રહેવું.
              </p>
              <div className="pt-1 text-[11px] font-mono text-[#005A9C] font-bold">
                ડિજિટલ પાસ લિંક: <span className="underline">qless.guj.gov.in/t/{booking.tokenNumber.replace('#','')}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  triggerHaptic('success');
                  navigator.clipboard?.writeText(`🏛️ GSDC-GUJGOV: આપનો ટોકન ${booking.tokenNumber} (${booking.taluka.officeNameGu}) કન્ફર્મ થયેલ છે.`);
                  alert("SMS લખાણ ક્લિપબોર્ડ પર કોપી થયું!");
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition"
              >
                ટેક્સ્ટ કોપી કરો
              </button>
              <button
                onClick={() => setSmsModalOpen(false)}
                className="flex-1 bg-[#003366] hover:bg-[#002244] text-white font-bold py-2.5 rounded-xl text-xs transition"
              >
                સમજાઈ ગયું (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
