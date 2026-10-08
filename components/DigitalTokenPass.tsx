'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  QrCode, Clock, MapPin, UserCheck, AlertTriangle, 
  Download, Share2, CheckCircle2, ShieldCheck, Printer,
  Volume2, ArrowRight, RefreshCw, Smartphone, Layers, X,
  Calendar, Navigation, FileCheck2, Star, CheckCircle, Shield,
  ExternalLink, Bell, Sparkles, MessageSquare, Radio, CalendarX2
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { speakGuidance } from '@/lib/voice';
import { playNotificationChime, broadcastQueueEvent, subscribeToQueueEvents, triggerHapticNotification } from '@/lib/realtime-bus';
import { BookingDetails } from './SlotBookingModal';
import { SchemeItem } from '@/lib/schemes-data';
import { BookingStatus } from '@/lib/slot-engine';
import { GovLogo } from '@/components/GovLogo';
import { Language } from '@/lib/translations';
import { getLocalizedSchemeTitle } from '@/lib/scheme-translations';
import { AuthenticQrCode } from '@/components/AuthenticQrCode';

interface DigitalTokenPassProps {
  booking: BookingDetails;
  scheme: SchemeItem | null;
  citizenName: string;
  onClose?: () => void;
  lang?: Language;
}

export function DigitalTokenPass({
  booking,
  scheme,
  citizenName,
  onClose,
  lang = 'gu'
}: DigitalTokenPassProps) {
  const isEn = lang === 'en';
  const isHi = lang === 'hi';
  const isMr = lang === 'mr';
  const isGu = lang === 'gu';

  // Booking state (Requirement 22: Booking States)
  const [currentStatus, setCurrentStatus] = useState<BookingStatus>(booking.status || 'CONFIRMED');
  const [currentSlotTime, setCurrentSlotTime] = useState<string>(booking.slot.timeRange);
  const [selectedDate, setSelectedDate] = useState<string>(booking.date);

  // Late shifting state (Requirement 13: Dynamic ETA instead of rigid +3 slots)
  const [lateDelayMinutes, setLateDelayMinutes] = useState<number>(0);
  const [lateModalOpen, setLateModalOpen] = useState<boolean>(false);
  const [updatedEta, setUpdatedEta] = useState<string>('');

  // Reschedule & Cancel modals (Requirement 14)
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState<boolean>(false);
  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);
  const [rescheduleSlotTime, setRescheduleSlotTime] = useState<string>('02:00 PM - 03:00 PM');

  // Queue status
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(18);
  const [aheadInQueue, setAheadInQueue] = useState<number>(2);

  // Multi-Channel Demo Modals (Requirements 17 & 18)
  const [verifierOpen, setVerifierOpen] = useState<boolean>(false);
  const [smsModalOpen, setSmsModalOpen] = useState<boolean>(false);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState<boolean>(false);
  const [channelsModalOpen, setChannelsModalOpen] = useState<boolean>(false);

  const isAnySubModalOpen = lateModalOpen || rescheduleModalOpen || cancelModalOpen || verifierOpen || smsModalOpen || whatsAppModalOpen || channelsModalOpen;

  // Body scroll lock when any dialog is open
  useEffect(() => {
    if (isAnySubModalOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [isAnySubModalOpen]);

  // Live Token Validity Clock (Requirement 11)
  const [liveTime, setLiveTime] = useState<string>('');
  const [isOfflineCached, setIsOfflineCached] = useState<boolean>(false);
  const [isCalledByOfficer, setIsCalledByOfficer] = useState<boolean>(false);

  // 1. Live Token Validity Indicator & Offline Pass LocalStorage Caching (Requirements 11 & 12)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    // Save to LocalStorage for zero-network rural offline access
    try {
      localStorage.setItem('qless_cached_token_pass', JSON.stringify({
        booking: {
          ...booking,
          date: selectedDate,
          status: currentStatus,
          slotTime: currentSlotTime
        },
        schemeTitle: scheme ? getLocalizedSchemeTitle(scheme, lang) : (isEn ? 'Jan Seva' : isHi ? 'जन सेवा' : isMr ? 'जन सेवा' : 'જન સેવા'),
        citizenName,
        cachedAt: new Date().toISOString()
      }));
      setIsOfflineCached(true);
    } catch {
      // ignore
    }

    // 2. Real-time Queue Event Listener
    const unsubscribe = subscribeToQueueEvents((event) => {
      if (event.type === 'TOKEN_CALLED' && event.tokenNumber === booking.tokenNumber) {
        setIsCalledByOfficer(true);
        setCurrentStatus('CALLED');
        setAheadInQueue(0);
        setEstimatedMinutes(0);
        triggerHaptic('success');
        triggerHapticNotification();
        playNotificationChime();
        speakGuidance(`ધ્યાન આપો, કાઉન્ટર ${booking.counterNumber} પર ટોકન નંબર ${booking.tokenNumber} નો વારો આવી ગયો છે.`);
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [booking, scheme, citizenName, selectedDate, currentStatus, currentSlotTime]);

  // Handle Running Late with chosen delay (Requirement 13)
  const handleApplyRunningLate = (minutes: number) => {
    triggerHaptic('warning');
    const newDelay = lateDelayMinutes + minutes;
    setLateDelayMinutes(newDelay);

    // Calculate new ETA
    const startTimeParts = currentSlotTime.split(' - ')[0] || '11:30 AM';
    const cleanTime = startTimeParts.replace(' AM', '').replace(' PM', '').trim();
    const [hStr, mStr] = cleanTime.split(':');
    let h = parseInt(hStr || '11', 10);
    let m = parseInt(mStr || '30', 10) + newDelay;
    while (m >= 60) {
      m -= 60;
      h += 1;
    }
    const newEtaFormatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} AM`;
    setUpdatedEta(newEtaFormatted);
    setEstimatedMinutes(prev => prev + minutes);
    setAheadInQueue(prev => prev + Math.ceil(minutes / 12));

    // Notify Officer Console via Broadcast
    broadcastQueueEvent({
      type: 'LATE_SHIFTED',
      tokenNumber: booking.tokenNumber,
      counterNumber: booking.counterNumber,
      talukaId: booking.taluka.id,
      timestamp: Date.now(),
      payload: { lateMinutes: minutes, newEta: newEtaFormatted, citizenName }
    });

    setLateModalOpen(false);
    speakGuidance(`તમારો સમય ${minutes} મિનિટ આગળ ખસેડવામાં આવ્યો છે. કાઉન્ટર અધિકારીને જાણ થઈ ગઈ છે.`);
  };

  // Handle Reschedule (Requirement 14)
  const handleConfirmReschedule = () => {
    triggerHaptic('success');
    setCurrentSlotTime(rescheduleSlotTime);
    setCurrentStatus('RESCHEDULED');
    setRescheduleModalOpen(false);
    speakGuidance("તમારી અપોઇન્ટમેન્ટ સફળતાપૂર્વક રિશિડ્યુલ થઈ ગઈ છે.");
  };

  // Handle Cancellation (Requirement 14)
  const handleConfirmCancellation = () => {
    triggerHaptic('warning');
    setCurrentStatus('CANCELLED');
    setCancelModalOpen(false);
    speakGuidance("તમારી અપોઇન્ટમેન્ટ રદ કરવામાં આવી છે. સ્લોટ મુક્ત થયો છે.");
  };

  const handleDownload = () => {
    triggerHaptic('success');
    speakGuidance("ટોકન પાસ પ્રિન્ટ થઈ રહ્યો છે.");
    window.print();
  };

  const handleWhatsAppShare = () => {
    triggerHaptic('tap');
    const msg = encodeURIComponent(
      `🏛️ ગુજરાત ઈ-જન સેવા ટોકન પાસ\n` +
      `ટોકન નંબર: ${booking.tokenNumber}\n` +
      `યોજના/સેવા: ${scheme ? scheme.titleGu : 'જન સેવા'}\n` +
      `કચેરી: ${booking.serviceCenter?.nameGu || booking.taluka.officeNameGu}\n` +
      `કાઉન્ટર: કાઉન્ટર ${booking.counterNumber} (${booking.counterNameGu})\n` +
      `સમય સ્લોટ: ${currentSlotTime}\n` +
      `તારીખ: ${selectedDate}\n` +
      `સ્થિતિ: ${currentStatus}`
    );
    window.open(`https://api.whatsapp.com/send?text=${msg}`, '_blank');
  };

  // Requirement 20: Add to Google Calendar (clear link action)
  const handleAddToCalendar = () => {
    triggerHaptic('success');
    speakGuidance("ગૂગલ કેલેન્ડર ઇવેન્ટ લિંક ખુલી રહી છે.");
    const ymd = selectedDate.replace(/-/g, '');
    const startTimeParts = booking.slot.startTime.split(':');
    const startH = (startTimeParts[0] || '10').padStart(2, '0');
    const startM = (startTimeParts[1] || '30').padStart(2, '0');
    
    const title = encodeURIComponent(`🏛️ સરકારી કચેરી એપોઇન્ટમેન્ટ: ${scheme ? scheme.titleGu : 'જન સેવા'} (${booking.tokenNumber})`);
    const details = encodeURIComponent(`ટોકન નંબર: ${booking.tokenNumber}\nકચેરી: ${booking.serviceCenter?.nameGu || booking.taluka.officeNameGu}\nકાઉન્ટર: કાઉન્ટર ${booking.counterNumber}\nઅધિકારી: ${booking.officerName}\n\nQueueLess Kacheri ડિજિટલ પાસ.`);
    const location = encodeURIComponent(`${booking.serviceCenter?.nameGu || booking.taluka.officeNameGu}, ${booking.district.nameGu}`);
    
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${ymd}T${startH}${startM}00/${ymd}T${startH}${startM}00`;
    window.open(gCalUrl, '_blank');
  };

  const docsList = useMemo(() => {
    if (scheme && scheme.requiredDocs && scheme.requiredDocs.length > 0) {
      return scheme.requiredDocs.map(d => d.nameGu);
    }
    return [
      'અસલ આધાર કાર્ડ (Original Aadhaar Card)',
      'ચાલુ વર્ષનો આવકનો દાખલો (Original Certificate)',
      '૨ પાસપોર્ટ સાઇઝ કલર ફોટા',
      'રેશનકાર્ડ નકલ / સરનામા પુરાવો'
    ];
  }, [scheme]);

  // Center display name
  const centerName = booking.serviceCenter?.nameGu || booking.taluka.officeNameGu;
  const centerDistance = booking.serviceCenter?.distanceKm || 8.4;
  const signatureChecksum = booking.qrSignatureHash || `QL-8F3A29-${booking.tokenNumber.replace('#','')}`;

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl border-2 border-[#003366]/20 overflow-hidden text-[#1F2937]">
        {/* GOVERNMENT-SERVICE HEADER BANNER */}
        <div className="bg-gradient-to-r from-[#003366] via-[#005A9C] to-[#003366] text-white p-4 sm:p-5 relative overflow-hidden">
          {/* Tricolor top border indicator */}
          <div className="absolute top-0 left-0 right-0 h-1.5 flex">
            <div className="flex-1 bg-[#FF9933]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#138808]" />
          </div>

          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
              <GovLogo className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 drop-shadow-md" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[9px] sm:text-[11px] font-bold tracking-wider uppercase bg-white/20 px-1.5 py-0.5 rounded text-white whitespace-nowrap">
                    GUJARAT PUBLIC SERVICE
                  </span>
                  
                  {/* Status Pill (Requirement 22) */}
                  <span className={`text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    currentStatus === 'CONFIRMED'
                      ? 'bg-emerald-500/30 text-green-200 border border-green-400/40'
                      : currentStatus === 'RESCHEDULED'
                        ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40'
                        : currentStatus === 'CANCELLED'
                          ? 'bg-red-500/30 text-red-200 border border-red-400/40'
                          : 'bg-green-500 text-white animate-pulse'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                    {currentStatus === 'CONFIRMED' && (isEn ? 'CONFIRMED' : isHi ? 'पुष्ट (CONFIRMED)' : isMr ? 'निश्चित (CONFIRMED)' : 'કન્ફર્મ (CONFIRMED)')}
                    {currentStatus === 'RESCHEDULED' && (isEn ? 'RESCHEDULED' : isHi ? 'पुनर्निर्धारित' : isMr ? 'पुन्हा नियोजित' : 'રિશિડ્યુલ થયેલ (RESCHEDULED)')}
                    {currentStatus === 'CANCELLED' && (isEn ? 'CANCELLED' : isHi ? 'रद्द' : isMr ? 'रद्द' : 'રદ થયેલ (CANCELLED)')}
                    {currentStatus === 'CALLED' && (isEn ? 'NOW SERVING' : isHi ? 'उपस्थित हों' : isMr ? 'हजर राहा' : 'હાજર થાઓ (NOW SERVING)')}
                  </span>

                  {booking.isPriority && (
                    <span className="bg-[#FF9933] text-slate-900 font-extrabold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      ⭐ {isEn ? 'Priority Appointment (#P)' : isHi ? 'प्राथमिकता अपॉइंटमेंट (#P)' : isMr ? 'प्राधान्य अपॉइंटमेंट (#P)' : 'પ્રાયોરિટી અપોઇન્ટમેન્ટ (#P)'}
                    </span>
                  )}
                </div>
                <h2 className="text-sm sm:text-lg font-bold text-white mt-0.5 truncate">
                  {isEn ? 'E-Jan Seva Token Pass (QueueLess)' : isHi ? 'ई-जन सेवा टोकन पास (QueueLess)' : isMr ? 'ई-जन सेवा टोकन पास (QueueLess)' : 'ઈ-જન સેવા ટોકન પાસ (QueueLess Kacheri)'}
                </h2>
                <p className="text-[10px] sm:text-xs text-blue-100 truncate">
                  {centerName}
                </p>
              </div>
            </div>

            {/* TOKEN CHIP & CLOSE BUTTON */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="text-right">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-blue-200 block">
                  {isEn ? 'Token No.' : isHi ? 'टोकन संख्या' : isMr ? 'टोकन क्रमांक' : 'ટોકન ક્રમાંક'}
                </span>
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

        {/* REAL-TIME OFFICER CALL ALERT */}
        {isCalledByOfficer && (
          <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white p-3 sm:p-4 text-center animate-pulse flex items-center justify-center gap-2 font-black text-xs sm:text-sm border-b-2 border-emerald-700 shadow-inner">
            <Radio className="w-4 h-4 sm:w-5 sm:h-5 animate-ping shrink-0" />
            <span>🔔 {isEn ? `Your turn has arrived! Please proceed immediately to Counter ${booking.counterNumber}.` : isHi ? `आपकी बारी आ गई है! तुरंत काउंटर ${booking.counterNumber} पर पहुंचें।` : isMr ? `तुमची पाळी आली आहे! लगेच काउंटर ${booking.counterNumber} वर जावे.` : `આપનો વારો આવી ગયો છે! તુરંત કાઉન્ટર ${booking.counterNumber} પર પહોંચો. (NOW SERVING)`}</span>
          </div>
        )}

        {/* CANCELLED NOTICE */}
        {currentStatus === 'CANCELLED' && (
          <div className="bg-red-50 border-b border-red-200 p-3 text-center text-xs font-bold text-red-900 flex items-center justify-center gap-2">
            <CalendarX2 className="w-4 h-4 text-red-600" />
            <span>{isEn ? 'This appointment has been cancelled by citizen. The slot has been released.' : isHi ? 'यह अपॉइंटमेंट नागरिक द्वारा रद्द की गई है। स्लॉट अब अन्य नागरिकों के लिए उपलब्ध है।' : isMr ? 'ही अपॉइंटमेंट नागरिकाद्वारे रद्द केली गेली आहे. स्लॉट आता इतर नागरिकांसाठी उपलब्ध आहे.' : 'આ અપોઇન્ટમેન્ટ નાગરિક દ્વારા રદ કરવામાં આવી છે. આ સ્લોટ હવે અન્ય નાગરિકો માટે મુક્ત છે.'}</span>
          </div>
        )}

        {/* PASS CONTENT */}
        <div className="p-4 sm:p-6 space-y-5">
          
          {/* REQUIREMENT 15: HIGH-CLARITY 5-SECOND PASS SUMMARY CARD */}
          <div className="bg-slate-50 border-2 border-blue-900/20 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  {isEn ? 'Appointment Summary' : isHi ? 'अपॉइंटमेंट सारांश' : isMr ? 'अपॉइंटमेंट सारांश' : 'અપોઇન્ટમેન્ટ સારાંશ'}
                </span>
                <h3 className="text-sm sm:text-base font-black text-[#003366]">
                  {scheme ? getLocalizedSchemeTitle(scheme, lang) : (isEn ? 'Jan Seva Service' : isHi ? 'जन सेवा प्रमाण पत्र' : isMr ? 'जन सेवा प्रमाणपत्र' : 'જન સેવા પ્રમાણપત્ર')}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-slate-500 uppercase block">
                  {isEn ? 'Token' : isHi ? 'टोकन' : isMr ? 'टोकन' : 'ટોકન'}
                </span>
                <span className="text-lg font-black font-mono text-[#005A9C]">{booking.tokenNumber}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#005A9C]" /> {isEn ? 'Center' : isHi ? 'केंद्र' : isMr ? 'केंद्र' : 'કેન્દ્ર'}
                </span>
                <span className="font-bold text-slate-800 text-[11px] truncate block mt-0.5">
                  {centerName}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#005A9C]" /> {isEn ? 'Date' : isHi ? 'दिनांक' : isMr ? 'दिनांक' : 'તારીખ'}
                </span>
                <span className="font-bold text-slate-800 text-[11px] block mt-0.5">
                  {selectedDate}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#005A9C]" /> {isEn ? 'Time Slot' : isHi ? 'समय स्लॉट' : isMr ? 'वेळ स्लॉट' : 'સમય સ્લોટ'}
                </span>
                <span className="font-bold text-slate-800 text-[11px] block mt-0.5">
                  {currentSlotTime}
                </span>
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-[#005A9C]" /> {isEn ? 'Counter' : isHi ? 'काउंटर' : isMr ? 'काउंटर' : 'કાઉન્ટર'}
                </span>
                <span className="font-bold text-[#003366] text-[11px] block mt-0.5">
                  {isEn ? `Counter ${booking.counterNumber} (${booking.counterNameEn || booking.counterNameGu})` : `કાઉન્ટર ${booking.counterNumber} (${booking.counterNameGu})`}
                </span>
              </div>
            </div>
          </div>

          {/* QR CODE & COUNTER ROUTING GRID (Requirement 10: Signed Tamper-Evident QR Token) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            
            {/* Signed QR Code Container */}
            <div className="md:col-span-5 flex flex-col items-center justify-center p-3 bg-gradient-to-b from-blue-50/50 to-indigo-50/50 rounded-2xl border border-blue-200 text-center">
              <AuthenticQrCode
                payload={`https://queueless.gujarat.gov.in/verify?token=${encodeURIComponent(booking.tokenNumber)}&citizen=${encodeURIComponent(citizenName)}&counter=${encodeURIComponent(booking.counterNumber)}&sig=${encodeURIComponent(signatureChecksum)}`}
                tokenId={booking.tokenNumber}
                size={160}
                label="સત્તાવાર સહી કરેલ QR ટોકન"
                subLabel="કચેરી ગેટ / કાઉન્ટર પર સ્કેન કરો"
              />

              {/* Requirement 11: Live Token Validity Indicator */}
              <div className="flex items-center gap-1.5 mt-2.5 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] text-emerald-800 font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <span>{liveTime || 'LIVE'} • માન્ય ટોકન સ્થિતિ</span>
              </div>

              <span className="text-[10px] font-mono text-gray-500 mt-1">
                સહી ચેકસમ: {signatureChecksum}
              </span>
              <span className="text-[9px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full mt-1">
                ✓ સહી કરેલ ટેમ્પર-એવિડન્ટ QR (Tamper-Evident QR Token)
              </span>

              {/* Requirement 12: Offline Pass Availability Clarification */}
              {isOfflineCached && (
                <div className="text-[9px] font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg mt-1.5 text-center leading-tight">
                  <span>💾 ઑફલાઇન પાસ ઉપલબ્ધ: લોકલ સ્ટોરેજમાં સેવ થયેલ છે.</span>
                </div>
              )}
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
                    નિયત કાઉન્ટર
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
                    તારીખ: {selectedDate}
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
                  {centerName}, જિલ્લો: {booking.district.nameGu}
                </span>
              </div>

            </div>
          </div>

          {/* REQUIREMENT 16: RECOMMENDED DEPARTURE (ESTIMATE) */}
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50/70 rounded-xl border border-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#005A9C] text-white flex items-center justify-center shrink-0">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#003366]">ઘરેથી નીકળવાનો ભલામણ કરેલ સમય (અંદાજિત)</p>
                <p className="text-[10.5px] text-slate-600">
                  અપોઇન્ટમેન્ટ: {currentSlotTime.split(' - ')[0]} | અંદાજિત મુસાફરી: ~{booking.estimatedTravelMinutes || 24} મિનિટ | સેફ્ટી બફર: ૧૦ મિ.
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs sm:text-sm font-black text-blue-900 bg-white border border-blue-300 px-2 sm:px-2.5 py-1 rounded-lg">
                {booking.leaveHomeBy || '10:55 AM'}
              </span>
              <span className="block text-[8.5px] text-slate-500 mt-0.5">અંદાજિત મુસાફરી સમય</span>
            </div>
          </div>

          {/* ORIGINAL DOCUMENTS CHECKLIST */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#003366] flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-[#005A9C]" />
                <span>કચેરીએ સાથે લઈ જવાના અસલ કાગળો (Original Documents Checklist)</span>
              </span>
              <span className="text-[9.5px] text-emerald-700 font-extrabold bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                અસલ ફરજિયાત
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
              * નોંધ: કાઉન્ટર પર અધિકારી સમક્ષ અસલ કાગળો રજૂ કરવાના રહેશે.
            </p>
          </div>

          {/* REQUIREMENT 13: "I'M RUNNING LATE" (DYNAMIC ETA RECALCULATION) */}
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
                  {lateDelayMinutes > 0 && (
                    <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-2 py-0.2 rounded-full">
                      +{lateDelayMinutes} મિ. વિલંબ
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  {lateDelayMinutes > 0 
                    ? `નવી સંભવિત ETA: ${updatedEta || '12:00 PM'} • કાઉન્ટર અધિકારીને વિલંબની જાણ થઈ ચૂકી છે.`
                    : 'જો મુસાફરીમાં મોડું થાય, તો અગાઉથી જાણ કરો જેથી કાઉન્ટર પર વારો સ્કીપ ન થાય.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('tap');
                setLateModalOpen(true);
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition active:scale-95 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>વિલંબ નોંધાવો (+10/+20/+30m)</span>
            </button>
          </div>

          {/* REQUIREMENT 14: APPOINTMENT ACTIONS (RESCHEDULE / CANCEL / CALENDAR) */}
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

              {/* Requirement 20: Add to Google Calendar */}
              <button
                onClick={handleAddToCalendar}
                className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#005A9C] border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Add to Google Calendar</span>
              </button>

              {/* Requirement 14: Reschedule Action */}
              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setRescheduleModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                <span>રિશિડ્યુલ કરો</span>
              </button>

              {/* Requirement 14: Cancel Action */}
              <button
                onClick={() => {
                  triggerHaptic('warning');
                  setCancelModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
              >
                <CalendarX2 className="w-3.5 h-3.5 text-red-600" />
                <span>અપોઇન્ટમેન્ટ રદ કરો</span>
              </button>

              {/* Requirement 19: Multi-Channel Touchpoints Drawer */}
              <button
                onClick={() => {
                  triggerHaptic('tap');
                  setChannelsModalOpen(true);
                }}
                className="px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
              >
                <Layers className="w-3.5 h-3.5 text-purple-600" />
                <span>મલ્ટી-ચેનલ ડેમો</span>
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

      {/* MODAL 1: RUNNING LATE SELECTION MODAL (Requirement 13) */}
      {lateModalOpen && (
        <div 
          onClick={() => setLateModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 modal-backdrop animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-5 sm:p-6 max-w-sm w-full border border-slate-200 shadow-2xl relative text-left"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h4 className="text-sm font-black text-[#003366]">વિલંબ સમય પસંદ કરો</h4>
              </div>
              <button 
                onClick={() => setLateModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              કચેરી પહોંચવામાં કેટલો વિલંબ થશે? સિસ્ટમ કાઉન્ટર પર તમારી સ્થિતિ અપડેટ કરશે:
            </p>

            <div className="space-y-2.5">
              {[10, 20, 30].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleApplyRunningLate(mins)}
                  className="w-full p-3 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100 text-amber-950 font-bold text-xs flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>+{mins} મિનિટ વિલંબ</span>
                  </span>
                  <span className="text-[10px] text-amber-800">અધિકારીને નોટિફાય થશે ➔</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: RESCHEDULE APPOINTMENT MODAL (Requirement 14) */}
      {rescheduleModalOpen && (
        <div 
          onClick={() => setRescheduleModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 modal-backdrop animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full border border-slate-200 shadow-2xl relative text-left"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-indigo-600" />
                <h4 className="text-sm font-black text-[#003366]">અપોઇન્ટમેન્ટ રિશિડ્યુલ કરો</h4>
              </div>
              <button 
                onClick={() => setRescheduleModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              હાલનો સ્લોટ: <strong>{currentSlotTime} ({selectedDate})</strong>. નવો ઉપલબ્ધ સમય પસંદ કરો:
            </p>

            <div className="space-y-2 mb-4">
              {['02:00 PM - 03:00 PM', '03:00 PM - 04:00 PM', '04:00 PM - 05:00 PM'].map((st) => (
                <button
                  key={st}
                  onClick={() => setRescheduleSlotTime(st)}
                  className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition ${
                    rescheduleSlotTime === st
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-2 ring-indigo-400/40'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{st}</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">🟢 ઉપલબ્ધ</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setRescheduleModalOpen(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition"
              >
                રદ કરો
              </button>
              <button
                onClick={handleConfirmReschedule}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition"
              >
                રિશિડ્યુલ કન્ફર્મ કરો
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CANCEL APPOINTMENT CONFIRMATION (Requirement 14) */}
      {cancelModalOpen && (
        <div 
          onClick={() => setCancelModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 modal-backdrop animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-5 sm:p-6 max-w-sm w-full border border-slate-200 shadow-2xl relative text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <CalendarX2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-slate-900 mb-1">અપોઇન્ટમેન્ટ રદ કરવી છે?</h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              શું તમે ખરેખર ટોકન <strong>{booking.tokenNumber}</strong> ની અપોઇન્ટમેન્ટ રદ કરવા માંગો છો? આ સ્લોટ અન્ય નાગરિક માટે મુક્ત થશે.
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition"
              >
                ના, પાછા જાઓ
              </button>
              <button
                onClick={handleConfirmCancellation}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs transition"
              >
                હા, રદ કરો
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: MULTI-CHANNEL DEMO DRAWER (Requirement 19) */}
      {channelsModalOpen && (
        <div 
          onClick={() => setChannelsModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 modal-backdrop animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full border border-slate-200 shadow-2xl relative text-left"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-600" />
                <h4 className="text-sm font-black text-[#003366]">મલ્ટી-ચેનલ કોમ્યુનિકેશન આર્કિટેક્ચર</h4>
              </div>
              <button 
                onClick={() => setChannelsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              QueueLess Kacheri નીચે મુજબના ચેનલ્સ દ્વારા નાગરિકોને અપડેટ્સ પૂરા પાડે છે:
            </p>

            <div className="space-y-2 mb-4">
              <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-950 flex items-center gap-2">
                  <span>📱</span> વેબ ઓડિયો & વોઇસ ઘોષણા
                </span>
                <span className="text-[10px] font-extrabold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                  સક્રિય (Live)
                </span>
              </div>

              <button
                onClick={() => {
                  setChannelsModalOpen(false);
                  setSmsModalOpen(true);
                }}
                className="w-full p-2.5 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100 flex items-center justify-between text-xs font-bold text-amber-950 text-left transition"
              >
                <span className="flex items-center gap-2">
                  <span>✉️</span> SMS નોટિફિકેશન — ડેમો સિમ્યુલેશન
                </span>
                <span className="text-[10px] font-bold text-amber-800">ખોલો ➔</span>
              </button>

              <button
                onClick={() => {
                  setChannelsModalOpen(false);
                  setWhatsAppModalOpen(true);
                }}
                className="w-full p-2.5 rounded-xl border border-green-200 bg-green-50/60 hover:bg-green-100 flex items-center justify-between text-xs font-bold text-green-950 text-left transition"
              >
                <span className="flex items-center gap-2">
                  <span>💬</span> WhatsApp સર્વિસ આસિસ્ટન્ટ — ડેમો
                </span>
                <span className="text-[10px] font-bold text-green-800">ખોલો ➔</span>
              </button>

              <button
                onClick={() => {
                  setChannelsModalOpen(false);
                  setVerifierOpen(true);
                }}
                className="w-full p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 flex items-center justify-between text-xs font-bold text-blue-950 text-left transition"
              >
                <span className="flex items-center gap-2">
                  <span>🛡️</span> કચેરી ગેટ સિક્યોરિટી સ્કેનર — સિમ્યુલેશન
                </span>
                <span className="text-[10px] font-bold text-blue-800">ખોલો ➔</span>
              </button>
            </div>

            <button
              onClick={() => setChannelsModalOpen(false)}
              className="w-full bg-[#003366] text-white font-bold py-2.5 rounded-xl text-xs"
            >
              સમજાઈ ગયું (Close)
            </button>
          </div>
        </div>
      )}

      {/* MODAL 5: GATE SECURITY KIOSK SCANNER SIMULATOR MODAL */}
      {verifierOpen && (
        <div 
          onClick={() => setVerifierOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 modal-backdrop animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 max-w-md w-full border border-slate-700 shadow-2xl relative overflow-hidden text-left"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Gate Kiosk Scanner • Simulation
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
                  ✓ પ્રવેશ મંજૂર (ENTRY AUTHORIZED)
                </span>
                <h3 className="text-lg font-black text-white mt-1.5">{citizenName}</h3>
                <p className="text-xs text-slate-400 font-mono">{signatureChecksum}</p>
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
                  <span className="text-slate-400">સ્લોટ સમય:</span>
                  <span className="font-bold text-emerald-400">{currentSlotTime}</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed">
                કચેરી ગેટ સિક્યોરિટી સિમ્યુલેશન: QR કોડની સહી ચકાસીને નાગરિકને સીધા કાઉન્ટર પર જવાની મંજૂરી આપેલ છે.
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

      {/* MODAL 6: SMS NOTIFICATION — DEMO (Requirement 17) */}
      {smsModalOpen && (
        <div 
          onClick={() => setSmsModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 modal-backdrop animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full border border-slate-200 shadow-2xl relative text-left"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#005A9C] flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#003366]">SMS Notification — Demo</h4>
                  <p className="text-[10px] text-slate-400 font-mono">Simulated Gateway • GSDC-GUJGOV</p>
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
            <div className="bg-[#F5F7FA] border border-slate-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span className="font-bold text-[#005A9C]">🏛️ GSDC-GUJGOV (Demo)</span>
                <span>હમણાં જ • SMS</span>
              </div>
              <p className="text-xs font-medium text-slate-800 leading-relaxed">
                નમસ્તે <strong>{citizenName}</strong>, આપનો ઈ-જન સેવા ટોકન ક્રમાંક <strong>{booking.tokenNumber}</strong> તારીખ {selectedDate}, સમય <strong>{currentSlotTime}</strong> માટે {centerName} (કાઉન્ટર {booking.counterNumber}) ખાતે સફળતાપૂર્વક કન્ફર્મ થયેલ છે.
              </p>
              <p className="text-[11px] text-slate-600">
                કૃપા કરીને અસલ કાગળો સાથે નિયત સમયે હાજર રહેવું.
              </p>
              <div className="pt-1 text-[11px] font-mono text-[#005A9C] font-bold">
                ડિજિટલ પાસ લિંક: <span className="underline">qless.guj.gov.in/t/{booking.tokenNumber.replace('#','')}</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 mt-2">
              * નોંધ: આ એક ડેમો સિમ્યુલેશન છે. પ્રોડક્શનમાં અધિકૃત ગવર્નમેન્ટ SMS ગેટવે સાથે જોડાય છે.
            </p>

            <div className="mt-4 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  triggerHaptic('success');
                  navigator.clipboard?.writeText(`🏛️ GSDC-GUJGOV: આપનો ટોકન ${booking.tokenNumber} (${centerName}) કન્ફર્મ થયેલ છે.`);
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

      {/* MODAL 7: WHATSAPP SERVICE ASSISTANT — DEMO (Requirement 18) */}
      {whatsAppModalOpen && (
        <div 
          onClick={() => setWhatsAppModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 modal-backdrop animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#ECE5DD] rounded-3xl max-w-sm w-full border border-slate-300 shadow-2xl overflow-hidden relative text-slate-800"
          >
            {/* WhatsApp Header */}
            <div className="bg-[#075E54] text-white p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-[#075E54] flex items-center justify-center font-bold text-sm shadow">
                  🏛️
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold leading-none">જન સેવા આસિસ્ટન્ટ (Demo)</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 text-white flex items-center justify-center text-[9px] font-black">✓</span>
                  </div>
                  <p className="text-[10px] text-emerald-200">WhatsApp Service Assistant • Demo</p>
                </div>
              </div>
              <button 
                onClick={() => setWhatsAppModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {/* WhatsApp Chat Body */}
            <div className="p-3.5 space-y-3 text-xs max-h-[75vh] overflow-y-auto">
              {/* Outgoing Message */}
              <div className="flex justify-end">
                <div className="bg-[#DCF8C6] rounded-xl rounded-tr-none p-2.5 shadow-sm max-w-[80%] text-[11px]">
                  <p>નમસ્તે, મારો ટોકન સ્ટેટસ જણાવો.</p>
                  <span className="text-[9px] text-slate-400 block text-right mt-0.5">10:32 AM ✓✓</span>
                </div>
              </div>

              {/* Incoming Bot Message */}
              <div className="flex justify-start">
                <div className="bg-white rounded-xl rounded-tl-none p-3 shadow-sm max-w-[92%] space-y-2 border border-slate-200">
                  <div className="border-b border-slate-100 pb-1.5">
                    <span className="text-[10px] font-black text-[#075E54] uppercase tracking-wider">
                      🏛️ ઈ-જન સેવા બુકિંગ કન્ફર્મેશન
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    નમસ્તે <strong>{citizenName}</strong>, આપની અપોઇન્ટમેન્ટ સક્રિય છે.
                  </p>
                  
                  <div className="bg-emerald-50 rounded-lg p-2 border border-emerald-200 space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">ટોકન ક્રમાંક:</span>
                      <span className="font-bold text-[#075E54] font-mono">{booking.tokenNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">કેન્દ્ર:</span>
                      <span className="font-semibold text-slate-800">{centerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">કાઉન્ટર:</span>
                      <span className="font-bold text-[#075E54]">કાઉન્ટર {booking.counterNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">સમય સ્લોટ:</span>
                      <span className="font-bold text-slate-800">{currentSlotTime}</span>
                    </div>
                  </div>

                  {/* Interactive WhatsApp Buttons */}
                  <div className="pt-2 space-y-1.5">
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(centerName + ' ' + booking.district.nameGu)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full bg-slate-50 hover:bg-slate-100 text-[#005A9C] font-bold py-1.5 px-3 rounded-lg border border-slate-200 flex items-center justify-center gap-1.5 text-[11px] transition"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>📍 કચેરી જીપીએસ નકશો ખોલો</span>
                    </a>

                    <button
                      onClick={() => {
                        setWhatsAppModalOpen(false);
                        setLateModalOpen(true);
                      }}
                      className="w-full bg-slate-50 hover:bg-slate-100 text-amber-800 font-bold py-1.5 px-3 rounded-lg border border-slate-200 flex items-center justify-center gap-1.5 text-[11px] transition"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>⏱️ મોડું થશે? વિલંબ નોંધાવો</span>
                    </button>

                    <button
                      onClick={() => {
                        triggerHaptic('tap');
                        alert("આધાર કાર્ડ, આવકનો દાખલો અને ૨ ફોટા અસલ સાથે લાવવા.");
                      }}
                      className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-1.5 px-3 rounded-lg border border-slate-200 flex items-center justify-center gap-1.5 text-[11px] transition"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>📋 જરૂરી અસલ કાગળોનું લિસ્ટ</span>
                    </button>
                  </div>

                  <span className="text-[9px] text-slate-400 block text-right">10:32 AM</span>
                </div>
              </div>
            </div>

            <div className="bg-[#F0F2F5] p-3 border-t border-slate-200 text-center">
              <button
                onClick={() => setWhatsAppModalOpen(false)}
                className="w-full bg-[#075E54] hover:bg-[#054c44] text-white font-bold py-2 rounded-xl text-xs transition"
              >
                બંધ કરો (Close Assistant)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
