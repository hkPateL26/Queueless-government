'use client';

import React, { useState, useMemo } from 'react';
import { 
  Building2, MapPin, Calendar, Clock, AlertTriangle, 
  CheckCircle2, X, ChevronRight, ShieldCheck, ArrowRight,
  Info, Sparkles, UserCheck, Utensils, Navigation,
  FileCheck, IndianRupee
} from 'lucide-react';
import { 
  GUJARAT_33_DISTRICTS, 
  DistrictItem, 
  TalukaOffice, 
  ServiceCenter,
  getTalukaServiceCenters,
  getRecommendedCounter,
  getNearbyVillageCluster,
  VillageClusterCenter
} from '@/lib/jurisdiction-data';
import { 
  generateOfficeSlots, 
  isGujaratGovernmentClosed, 
  TimeSlot,
  checkSlotAvailability,
  PRIORITY_POLICIES,
  PriorityCategory,
  BookingStatus,
  generateSignedQrPayload,
  GUJARAT_HOLIDAY_CALENDAR_METADATA
} from '@/lib/slot-engine';
import { triggerHaptic } from '@/lib/haptics';
import { speakGuidance } from '@/lib/voice';
import { SchemeItem, getProcessingTimelineInfo } from '@/lib/schemes-data';
import { GovLogo } from '@/components/GovLogo';
import { SlotSkeleton } from '@/components/ui/Skeleton';

export interface BookingDetails {
  district: DistrictItem;
  taluka: TalukaOffice;
  serviceCenter: ServiceCenter;
  date: string;
  slot: TimeSlot;
  counterNumber: number;
  counterNameGu: string;
  counterNameEn: string;
  officerName: string;
  tokenNumber: string;
  isPriority?: boolean;
  priorityCategory?: PriorityCategory;
  leaveHomeBy?: string;
  estimatedTravelMinutes?: number;
  safetyBufferMinutes?: number;
  status: BookingStatus;
  verifiableQrPayload?: string;
  qrSignatureHash?: string;
  validUntil?: string;
}

import { Language } from '@/lib/translations';
import { DEFAULT_CITIZEN_PROFILE } from '@/lib/citizen-profile';

interface SlotBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheme: SchemeItem | null;
  onConfirm: (details: BookingDetails) => void;
  lang?: Language;
  initialDistrictId?: string;
  initialTalukaId?: string;
  initialVillage?: string;
}

export function SlotBookingModal({
  isOpen,
  onClose,
  scheme,
  onConfirm,
  lang = 'gu',
  initialDistrictId,
  initialTalukaId,
  initialVillage
}: SlotBookingModalProps) {
  // District & Taluka state (Defaulting to Aadhaar linked district & taluka)
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>(initialDistrictId || DEFAULT_CITIZEN_PROFILE.districtId);
  const [selectedTalukaId, setSelectedTalukaId] = useState<string>(initialTalukaId || DEFAULT_CITIZEN_PROFILE.talukaId);

  // Body scroll lock to eliminate background bounce and double scrollbars on mobile & desktop
  React.useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Sync state when props change
  React.useEffect(() => {
    if (initialDistrictId) setSelectedDistrictId(initialDistrictId);
    if (initialTalukaId) setSelectedTalukaId(initialTalukaId);
  }, [initialDistrictId, initialTalukaId, isOpen]);

  // Service Center state (Requirement 3: Service Center Selection)
  const [selectedCenterId, setSelectedCenterId] = useState<string>('gondal-jsk');

  // Nearby Village Cluster state (Rural Rescue: Book in neighbor village if home center is crowded/full)
  const [selectedClusterVillageId, setSelectedClusterVillageId] = useState<string | null>(null);

  const nearbyClusters = useMemo(() => {
    return getNearbyVillageCluster(initialVillage || 'ગોમટા');
  }, [initialVillage]);

  // Date state (defaults to today in 2026 format or current working date)
  const todayStr = useMemo(() => {
    const now = new Date();
    const yyyy = '2026';
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('slot-2');
  const [isPriority, setIsPriority] = useState<boolean>(false);
  const [priorityCategory, setPriorityCategory] = useState<PriorityCategory>('senior_citizen');
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [isRecalculatingSlots, setIsRecalculatingSlots] = useState<boolean>(false);

  const selectedDistrict = useMemo(() => {
    return GUJARAT_33_DISTRICTS.find(d => d.id === selectedDistrictId) || GUJARAT_33_DISTRICTS[0];
  }, [selectedDistrictId]);

  const selectedTaluka = useMemo(() => {
    return selectedDistrict.talukas.find(t => t.id === selectedTalukaId) || selectedDistrict.talukas[0];
  }, [selectedDistrict, selectedTalukaId]);

  // Service Centers for this taluka
  const serviceCenters = useMemo(() => {
    return getTalukaServiceCenters(selectedTaluka);
  }, [selectedTaluka]);

  // Dynamically resolve service center (defaults to selected Taluka center OR neighboring village cluster center)
  const selectedCenter = useMemo(() => {
    if (selectedClusterVillageId) {
      const cluster = nearbyClusters.find(c => c.villageId === selectedClusterVillageId);
      if (cluster) {
        return {
          id: `cluster-${cluster.villageId}`,
          nameGu: cluster.centerNameGu,
          nameEn: cluster.centerNameEn,
          centerType: 'jan_seva_kendra' as const,
          distanceKm: cluster.distanceKm,
          addressGu: `${cluster.villageNameGu}, તાલુકો: ${cluster.talukaNameGu}, જિલ્લો: રાજકોટ`,
          addressEn: `${cluster.villageNameEn}, Taluka: ${cluster.talukaNameGu}, District: Rajkot`,
          availabilityNoteGu: `${cluster.availableSlotsToday} સ્લોટ ખાલી • પ્રતીક્ષા સમય: ~${cluster.estimatedWaitMins} મિ.`,
          availabilityNoteEn: `${cluster.availableSlotsToday} slots free • Wait: ~${cluster.estimatedWaitMins} mins`,
          config: {
            serviceHours: {
              startTime: '10:30',
              endTime: '18:10',
              displayEn: '10:30 AM – 06:10 PM',
              displayGu: '૧૦:૩૦ સવારે – ૦૬:૧૦ સાંજે'
            },
            lunchBreak: {
              startTime: '13:30',
              endTime: '14:00',
              displayEn: '01:30 PM – 02:00 PM',
              displayGu: '૦૧:૩૦ બપોરે – ૦૨:૦૦ બપોરે'
            },
            workingDays: [1, 2, 3, 4, 5, 6],
            defaultCapacityPerHour: 6,
            sourceReference: 'Gujarat Panchayats E-Gram Vishwagram Schedule'
          },
          counters: [
            { 
              number: 1, 
              nameGu: 'ઈ-ગ્રામ જન સુવિધા ડેસ્ક (સર્વ સેવા)', 
              nameEn: 'E-Gram All Services Desk', 
              officerName: 'પંચાયત મંત્રી / VCE સુપરવાઈઝર', 
              services: ['income', 'caste', 'ration', 'land', '712', 'aadhaar', 'general', 'welfare'] 
            }
          ]
        };
      }
    }
    return serviceCenters.find(c => c.id === selectedCenterId) || serviceCenters[0];
  }, [serviceCenters, selectedCenterId, selectedClusterVillageId, nearbyClusters]);

  const timelineInfo = useMemo(() => {
    return scheme ? getProcessingTimelineInfo(scheme) : null;
  }, [scheme]);

  const isEn = lang === 'en';
  const isHi = lang === 'hi';
  const isMr = lang === 'mr';
  const isGu = lang === 'gu';

  // Handle District Change
  const handleDistrictChange = (distId: string) => {
    setSelectedDistrictId(distId);
    setSelectedClusterVillageId(null);
    setIsRecalculatingSlots(true);
    setTimeout(() => setIsRecalculatingSlots(false), 200);
    const dist = GUJARAT_33_DISTRICTS.find(d => d.id === distId);
    if (dist && dist.talukas.length > 0) {
      const firstTal = dist.talukas[0];
      setSelectedTalukaId(firstTal.id);
      const centers = getTalukaServiceCenters(firstTal);
      if (centers.length > 0) {
        setSelectedCenterId(centers[0].id);
      }
    }
    triggerHaptic('tap');
  };

  // Handle Taluka Change
  const handleTalukaChange = (talId: string) => {
    setSelectedTalukaId(talId);
    setSelectedClusterVillageId(null);
    setIsRecalculatingSlots(true);
    setTimeout(() => setIsRecalculatingSlots(false), 200);
    const tal = selectedDistrict.talukas.find(t => t.id === talId);
    if (tal) {
      const centers = getTalukaServiceCenters(tal);
      if (centers.length > 0) {
        setSelectedCenterId(centers[0].id);
      }
    }
    triggerHaptic('tap');
  };

  // Holiday Check with official source reference
  const holidayCheck = useMemo(() => {
    return isGujaratGovernmentClosed(selectedDate);
  }, [selectedDate]);

  // Configurable Slot list (reads center capacity & timings)
  const slots = useMemo(() => {
    const seed = selectedDistrictId.length + selectedTalukaId.length + selectedCenterId.length;
    return generateOfficeSlots(seed, {
      startTime: selectedCenter.config.serviceHours.startTime,
      endTime: selectedCenter.config.serviceHours.endTime,
      lunchStart: selectedCenter.config.lunchBreak.startTime,
      lunchEnd: selectedCenter.config.lunchBreak.endTime,
      capacityPerHour: selectedCenter.config.defaultCapacityPerHour
    });
  }, [selectedDistrictId, selectedTalukaId, selectedCenterId, selectedCenter]);

  const selectedSlot = useMemo(() => {
    return slots.find(s => s.id === selectedSlotId) || slots[0];
  }, [slots, selectedSlotId]);

  // Recommended counter routing based on service metadata + center capabilities
  const routing = useMemo(() => {
    if (!scheme) {
      return {
        counterNumber: 2,
        reasonGu: 'સામાન્ય જન સેવા માટે કાઉન્ટર ૨ ફાળવેલ છે.',
        reasonEn: 'Assigned to General Jan Seva Counter 2 based on service metadata.'
      };
    }
    return getRecommendedCounter(scheme.id, scheme.category || '', selectedCenter);
  }, [scheme, selectedCenter]);

  const counterDetails = useMemo(() => {
    const c = selectedCenter.counters.find(cnt => cnt.number === routing.counterNumber);
    if (c) return c;
    return selectedCenter.counters[0] || {
      number: 1,
      nameGu: 'જન સેવા કેન્દ્ર કાઉન્ટર ૧',
      nameEn: 'Jan Seva Counter 1',
      officerName: 'સરકારી અધિકારી',
      services: []
    };
  }, [selectedCenter, routing.counterNumber]);

  // Recommended departure calculation (Estimate)
  const transitEstimate = useMemo(() => {
    const distanceKm = selectedCenter.distanceKm || 8.4;
    // ~2.5 mins per km in rural/suburban Gujarat
    const travelMins = Math.round(distanceKm * 2.8);
    const bufferMins = 10;
    const totalPriorMins = travelMins + bufferMins;

    const slotHour = parseInt(selectedSlot.startTime.split(':')[0] || '10', 10);
    const slotMinute = parseInt(selectedSlot.startTime.split(':')[1] || '30', 10);
    let depHour = slotHour;
    let depMinute = slotMinute - totalPriorMins;
    if (depMinute < 0) {
      depMinute += 60;
      depHour -= 1;
    }
    const leaveHomeBy = `${String(depHour).padStart(2, '0')}:${String(depMinute).padStart(2, '0')} AM`;

    return {
      distanceKm,
      travelMins,
      bufferMins,
      leaveHomeBy
    };
  }, [selectedCenter, selectedSlot]);

  if (!isOpen) return null;

  const handleFinalConfirm = () => {
    setConflictError(null);

    if (holidayCheck.isClosed) {
      triggerHaptic('warning');
      speakGuidance("પસંદ કરેલ તારીખે કચેરી બંધ છે. કૃપા કરીને અન્ય કામકાજનો દિવસ પસંદ કરો.");
      return;
    }

    if (selectedSlot.isLunchBreak) {
      triggerHaptic('warning');
      speakGuidance("રિસેસના સમયમાં ટોકન બુકિંગ થઈ શકતું નથી.");
      return;
    }

    // Double-Booking Conflict Protection Check (Requirement 21)
    const availabilityCheck = checkSlotAvailability(selectedSlotId, slots);
    if (!availabilityCheck.available) {
      triggerHaptic('error');
      setConflictError(availabilityCheck.reasonGu || 'આ સ્લોટ હમણાં જ પૂર્ણ થઈ ગયો છે. કૃપા કરીને અન્ય સ્લોટ પસંદ કરો.');
      speakGuidance("આ સ્લોટ હમણાં જ પૂર્ણ થઈ ગયો છે. કૃપા કરીને અન્ય સમય પસંદ કરો.");
      return;
    }

    triggerHaptic('success');
    speakGuidance("સ્લોટ બુકિંગ સફળ! તમારો કચેરી ટોકન જારી થયો છે.");

    // Generate token number: #P-07 for Priority, otherwise #A-42
    let tokenNumber = '';
    const activePriorityCat: PriorityCategory = isPriority ? priorityCategory : 'none';
    if (isPriority) {
      const pNum = Math.floor(1 + Math.random() * 15);
      tokenNumber = `#P-${String(pNum).padStart(2, '0')}`;
    } else {
      const tokenLetter = ['A', 'B', 'C', 'D'][routing.counterNumber % 4] || 'A';
      const tokenNum = Math.floor(10 + Math.random() * 89);
      tokenNumber = `#${tokenLetter}-${tokenNum}`;
    }

    // Generate privacy-safe Signed / Tamper-Evident QR Token Payload (Requirement 10)
    const signedQr = generateSignedQrPayload({
      tokenId: tokenNumber,
      serviceId: scheme?.id || 'gen-service',
      serviceTitleEn: scheme?.titleEn || 'Citizen Service',
      centerId: selectedCenter.id,
      centerNameEn: selectedCenter.nameEn,
      counterNumber: routing.counterNumber,
      date: selectedDate,
      slotTime: selectedSlot.timeRange
    });

    onConfirm({
      district: selectedDistrict,
      taluka: selectedTaluka,
      serviceCenter: selectedCenter,
      date: selectedDate,
      slot: selectedSlot,
      counterNumber: routing.counterNumber,
      counterNameGu: counterDetails.nameGu,
      counterNameEn: counterDetails.nameEn,
      officerName: counterDetails.officerName,
      tokenNumber,
      isPriority,
      priorityCategory: activePriorityCat,
      leaveHomeBy: transitEstimate.leaveHomeBy,
      estimatedTravelMinutes: transitEstimate.travelMins,
      safetyBufferMinutes: transitEstimate.bufferMins,
      status: 'CONFIRMED' as BookingStatus,
      verifiableQrPayload: signedQr.payloadJson,
      qrSignatureHash: signedQr.hash,
      validUntil: signedQr.validUntil
    });
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden modal-backdrop animate-in fade-in duration-150"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-3xl rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[92dvh] max-h-[92dvh] sm:h-auto sm:max-h-[88vh] animate-in slide-in-from-bottom duration-200"
      >
        {/* MOBILE BOTTOM SHEET DRAG PILL (WHATSAPP UX) */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-[#003366] shrink-0">
          <div className="w-12 h-1.5 bg-white/40 rounded-full" />
        </div>
        
        {/* HEADER */}
        <div className="bg-[#003366] text-white p-3.5 sm:p-5 flex items-center justify-between border-b border-blue-900 shrink-0">
          <div className="flex items-center gap-3">
            <GovLogo className="w-10 h-10 shrink-0 drop-shadow-md" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">
                  {isEn ? 'Jurisdiction Routing & Appointment Scheduling' : isHi ? 'अधिकार क्षेत्र और अपॉइंटमेंट शेड्यूलिंग' : isMr ? 'अधिकार क्षेत्र आणि अपॉइंटमेंट शेड्यूलिंग' : 'અધિકારક્ષેત્ર & સ્લોટ બુકિંગ'}
                </h3>
                <span className="bg-[#005A9C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-400">
                  {isEn ? 'Capacity Controlled' : isHi ? 'क्षमता नियंत्रित' : isMr ? 'क्षमता नियंत्रित' : 'કેપેસિટી કંટ્રોલ્ડ'}
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                {scheme 
                  ? (isEn ? scheme.titleEn : isMr ? (scheme.titleEn) : isHi ? (scheme.titleEn) : scheme.titleGu) 
                  : (isEn ? 'All 33 Districts & Taluka Centers of Gujarat' : isMr ? 'गुजरातमधील सर्व ३३ जिल्हे आणि तालुका केंद्रे' : isHi ? 'गुजरात के सभी ३३ जिले और तहसील केंद्र' : 'ગુજરાતના તમામ ૩૩ જિલ્લાઓ & તાલુકા કેન્દ્રો')}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('tap');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CONFLICT ERROR ALERT */}
        {conflictError && (
          <div className="bg-red-50 border-b border-red-200 p-3 text-red-900 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{conflictError}</span>
          </div>
        )}

        {/* BODY */}
        <div className="p-3.5 sm:p-6 overflow-y-auto modal-scroll-area space-y-5 sm:space-y-6 flex-1 text-[#1F2937]">
          
          {/* CITIZEN PRE-BOOKING ADVISORY: 4 ESSENTIAL QUESTIONS */}
          {scheme && timelineInfo && (
            <div className="bg-gradient-to-br from-amber-50/90 to-orange-50/80 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏛️</span>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-amber-950 uppercase tracking-wide">
                      {isEn 
                        ? 'Pre-Booking Essential Guidance (Official Reference)' 
                        : isHi 
                        ? 'अपॉइंटमेंट पूर्व आवश्यक मार्गदर्शन (आधिकारिक)' 
                        : isMr
                        ? 'अपॉइंटमेंट पूर्व आवश्यक मार्गदर्शन (अधिकृत)'
                        : 'મુલાકાત પૂર્વે સત્તાવાર માહિતી (Pre-Booking Essential Guidance)'}
                    </h4>
                    <p className="text-[11px] text-amber-800 font-semibold">
                      {isEn ? scheme.titleEn : scheme.titleGu} • {scheme.department}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded-md shrink-0">
                  {isEn ? 'Service Details' : isHi ? 'सेवा विवरण' : isMr ? 'सेवा तपशील' : 'સેવા વિગતો'}
                </span>
              </div>

              {/* 4 Sequential Questions Flow: What docs? → Cost? → How long? → When visit? */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                
                {/* 1. What documents do I need? */}
                <div className="bg-white rounded-xl p-3 border border-amber-200/90 flex flex-col justify-between">
                  <div>
                    <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <FileCheck className="w-3.5 h-3.5 text-[#005A9C]" />
                      <span>{isEn ? '1. Required Docs?' : isHi ? '१. आवश्यक दस्तावेज?' : isMr ? '१. आवश्यक कागदपत्रे?' : '૧. જરૂરી કાગળો?'}</span>
                    </span>
                    <p className="text-xs font-black text-[#003366] mt-1.5">
                      {isEn 
                        ? `${scheme.requiredDocs.length} Docs Required` 
                        : isHi 
                        ? `${scheme.requiredDocs.length} दस्तावेज आवश्यक` 
                        : isMr
                        ? `${scheme.requiredDocs.length} कागदपत्रे आवश्यक`
                        : `${scheme.requiredDocs.length} દસ્તાવેજો જરૂરી`}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight line-clamp-2">
                      {scheme.requiredDocs.map(d => isEn ? d.nameEn : isMr ? d.nameEn : d.nameGu).join(', ')}
                    </p>
                  </div>
                  <p className="text-[9px] text-[#005A9C] font-bold mt-2 pt-1 border-t border-slate-100">
                    {isEn ? 'Carry Original + Photocopy' : isHi ? 'मूल + फोटोकॉपी साथ रखें' : isMr ? 'मूळ + झेरॉक्स सोबत ठेवा' : 'અસલ + ઝેરોક્ષ સાથે રાખવી'}
                  </p>
                </div>

                {/* 2. How much does it cost? */}
                <div className="bg-white rounded-xl p-3 border border-amber-200/90 flex flex-col justify-between">
                  <div>
                    <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <IndianRupee className="w-3.5 h-3.5 text-[#138808]" />
                      <span>{isEn ? '2. Govt Fee?' : isHi ? '२. सरकारी शुल्क?' : isMr ? '२. शासकीय शुल्क?' : '૨. સરકારી ફી કેટલી?'}</span>
                    </span>
                    <p className="text-sm font-black text-[#138808] mt-1.5">
                      {scheme.fee === 0 
                        ? (isEn ? '₹0 (Free)' : isHi ? '₹० (मुफ्त)' : isMr ? '₹० (मोफत)' : '₹૦ (સંપૂર્ણ મફત)') 
                        : `₹${scheme.fee}`}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {scheme.fee === 0 
                        ? (isEn ? 'No government charge' : isMr ? 'कोणतेही शासकीय शुल्क नाही' : 'કોઈ સરકારી ચાર્જ નથી') 
                        : (isEn ? 'Authorized service charge' : isMr ? 'नियमबद्ध सेवा शुल्क' : 'નિયત સરકારી સેવા ફી')}
                    </p>
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium mt-2 pt-1 border-t border-slate-100">
                    {isEn ? 'Official counter receipt' : isMr ? 'काउंटरवर अधिकृत पावती' : 'કાઉન્ટર પર સત્તાવાર રસીદ'}
                  </p>
                </div>

                {/* 3. How long will it take? */}
                <div className="bg-white rounded-xl p-3 border border-amber-200/90 flex flex-col justify-between">
                  <div>
                    <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#FF9933]" />
                      <span>{isEn ? '3. How Long Will It Take?' : isHi ? '३. कितना समय लगेगा?' : isMr ? '३. किती वेळ लागेल?' : '૩. કેટલો સમય લાગશે?'}</span>
                    </span>
                    <p className="text-xs font-black text-[#003366] mt-1.5 leading-snug">
                      {timelineInfo.isVaries ? (
                        <span className="text-amber-800">
                          {isEn ? 'Varies (Confirm at office)' : isHi ? 'कार्यालय अनुसार अलग (जांचें)' : isMr ? 'कार्यालयनिहाय वेगळे (तपासा)' : 'અલગ હોઈ શકે છે (કચેરીએ ચકાસો)'}
                        </span>
                      ) : (
                        isEn ? timelineInfo.formattedTimeEn : isMr ? timelineInfo.formattedTimeGu.replace('દિવસ', 'दिवस') : timelineInfo.formattedTimeGu
                      )}
                    </p>
                    <div className="mt-1">
                      {scheme.slaType === 'statutory_grtsa' ? (
                        <span className="text-[8.5px] font-bold bg-blue-100 text-blue-900 px-1 py-0.5 rounded border border-blue-200">
                          {isEn ? '⚖️ GRTSA Statutory' : isHi ? '⚖️ GRTSA विधिक सीमा' : isMr ? '⚖️ GRTSA वैधानिक मुदत' : '⚖️ GRTSA કાનૂની સમયમર્યાદા'}
                        </span>
                      ) : scheme.slaType === 'departmental_norm' ? (
                        <span className="text-[8.5px] font-bold bg-emerald-100 text-emerald-900 px-1 py-0.5 rounded">
                          {isEn ? '🏛️ Citizen Charter' : isHi ? '🏛️ सिटीजन चार्टर' : isMr ? '🏛️ सिटिझन चार्टर' : '🏛️ સિટીઝન ચાર્ટર ધોરણ'}
                        </span>
                      ) : (
                        <span className="text-[8.5px] text-slate-600 bg-slate-100 px-1 py-0.5 rounded">
                          {isEn ? '📋 Batch Scheme Cycle' : isHi ? '📋 योजना चक्र' : isMr ? '📋 योजना चक्र' : '📋 યોજના ચક્ર આધારિત'}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-2 pt-1 border-t border-slate-100 truncate" title={scheme.officialSource}>
                    {isEn ? 'Source: ' : isMr ? 'स्रोत: ' : 'સ્ત્રોત: '}{scheme.officialSource}
                  </p>
                </div>

                {/* 4. When should I visit & office wait? */}
                <div className="bg-white rounded-xl p-3 border border-amber-200/90 flex flex-col justify-between">
                  <div>
                    <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-[#003366]" />
                      <span>{isEn ? '4. Counter Wait Time?' : isHi ? '४. काउंटर प्रतीक्षा समय?' : isMr ? '४. काउंटर प्रतीक्षा वेळ?' : '૪. કચેરી પ્રતીક્ષા સમય?'}</span>
                    </span>
                    <p className="text-xs font-black text-slate-800 mt-1.5">
                      {isEn ? '~15-20 min (Counter Duration)' : isHi ? '~१५-२० मिनट (काउंटर पर)' : isMr ? '~१५-२० मिनिटे (काउंटरवर)' : '~૧૫-૨૦ મિનિટ (કાઉન્ટર પર)'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {isEn ? 'Zero-queue visit during slot' : isHi ? 'स्लॉट समय पर कतार-मुक्त कार्य' : isMr ? 'ठरलेल्या वेळेत रांगेविना काम' : 'સ્લોટ સમયે હાજર રહેવાથી લાઈન વગર કામ'}
                    </p>
                  </div>
                  <p className="text-[9px] text-emerald-700 font-bold mt-2 pt-1 border-t border-slate-100">
                    {isEn ? 'Select Slot Below 👇' : isHi ? 'नीचे स्लॉट चुनें 👇' : isMr ? 'खाली स्लॉट निवडा 👇' : 'નીચે સ્લોટ પસંદ કરો 👇'}
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* STEP 1: JURISDICTION (AADHAAR-LINKED DISTRICT, TALUKA & VILLAGE) */}
          <section className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#005A9C]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  {isEn ? 'Step 1: Jurisdiction & Native Office (Aadhaar Linked)' : isHi ? 'चरण १: कार्यक्षेत्र एवं मूल कार्यालय (आधार लिंक्ड)' : isMr ? 'पायरी १: कार्यक्षेत्र व मूळ कार्यालय' : 'પગલું ૧: આધાર પ્રમાણિત કાર્યક્ષેત્ર અને કચેરી (District, Taluka & Village)'}
                </h4>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                <span>{isEn ? 'Aadhaar Auto-Selected' : 'આધાર મુજબ આપોઆપ પસંદ'}</span>
              </span>
            </div>

            {/* Aadhaar Verified Native Residence Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-emerald-50/70 border border-blue-200 rounded-xl p-3 mb-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#003366] text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#FF9933]" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase text-[#003366]">
                      {isEn ? 'Aadhaar Verified Native Residence' : isHi ? 'आधार सत्यापित निवास' : 'આધાર કાર્ડ પ્રમાણિત રહેઠાણ'}
                    </span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                      {DEFAULT_CITIZEN_PROFILE.aadhaarMasked}
                    </span>
                  </div>
                  <p className="text-xs font-black text-slate-800 mt-0.5">
                    {isEn 
                      ? 'Village: Gomta • Taluka: Gondal • District: Rajkot (360311)' 
                      : 'ગામ: ગોમટા • તાલુકો: ગોંડલ • જિલ્લો: રાજકોટ (૩૬૦૩૧૧)'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-[#003366] font-bold bg-white px-2 py-1 rounded-md border border-slate-200 shrink-0">
                {isEn ? 'Revenue Bound: Gondal Desk' : 'મહેસૂલી સત્તાક્ષેત્ર: ગોંડલ ડેસ્ક'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  {isEn ? 'District' : isHi ? 'जिला' : isMr ? 'जिल्हा (District)' : 'જિલ્લો (District)'}
                </label>
                <select
                  value={selectedDistrictId}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                >
                  {GUJARAT_33_DISTRICTS.map((dist) => (
                    <option key={dist.id} value={dist.id}>
                      {isEn ? `${dist.nameEn} (${dist.nameGu})` : isMr ? `${dist.nameEn} (${dist.nameGu})` : `${dist.nameGu} (${dist.nameEn})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  {isEn ? 'Taluka' : isHi ? 'तालुका' : isMr ? 'तालुका (Taluka)' : 'તાલુકો (Taluka)'}
                </label>
                <select
                  value={selectedTalukaId}
                  onChange={(e) => handleTalukaChange(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                >
                  {selectedDistrict.talukas.map((tal) => (
                    <option key={tal.id} value={tal.id}>
                      {isEn ? `${tal.nameEn} - ${tal.officeNameEn}` : isMr ? `${tal.nameEn} - ${tal.officeNameEn}` : `${tal.nameGu} - ${tal.officeNameGu}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  {isEn ? 'Aadhaar Village (Gam)' : isHi ? 'आधार गाँव' : isMr ? 'आधार गाव' : 'આધાર ગામ (Village)'}
                </label>
                <div className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 flex items-center justify-between">
                  <span>{isEn ? (initialVillage || 'Gomta') : (initialVillage || 'ગોમટા')}</span>
                  <span className="text-[9px] bg-blue-50 text-[#005A9C] font-bold px-1.5 py-0.5 rounded border border-blue-200">
                    {isEn ? 'Verified' : 'પ્રમાણિત'}
                  </span>
                </div>
              </div>
            </div>

            {/* Jurisdiction Regulatory Notice */}
            <div className="mt-3 bg-amber-50/90 border border-amber-300/80 rounded-xl p-2.5 text-[11px] text-amber-950 font-medium flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>{isEn ? 'Gujarat Government Jurisdiction Rule:' : 'ગુજરાત સરકાર સત્તાવાર મહેસૂલી નિયમ:'}</strong>{' '}
                {isEn 
                  ? 'Income, Caste, and 7/12 land certificates are legally issued only by your resident Taluka Mamlatdar (Gondal). Aadhaar updates and universal services can be scheduled at any center.' 
                  : 'આવક, જાતિ અને ૭/૧૨ ના દાખલા તમારા કાયમી રહેઠાણ મુજબ ગોંડલ મામલતદાર કચેરીમાંથી જ માન્ય રહેશે. આધાર બાયોમેટ્રિક/મોબાઇલ અપડેટ અને RTO સેવાઓ રાજ્યના કોઈપણ કેન્દ્ર પર લઈ શકાય છે.'}
              </p>
            </div>

            {/* NEARBY VILLAGE FREE SLOT FINDER (RURAL RESCUE) */}
            <div className="mt-3.5 bg-gradient-to-br from-emerald-50/95 via-teal-50/70 to-blue-50/60 border-2 border-emerald-300 rounded-2xl p-3 sm:p-4 space-y-3 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                    🌐
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-black text-emerald-950">
                        {isEn 
                          ? 'Nearby Village Free Slot Finder (Cluster E-Gram)' 
                          : 'આજુબાજુના ગામોમાં ઉપલબ્ધ ખાલી સ્લોટ (ક્લસ્ટર ઈ-ગ્રામ કેન્દ્ર)'}
                      </h4>
                      <span className="text-[9px] bg-emerald-200 text-emerald-900 font-extrabold px-1.5 py-0.2 rounded uppercase">
                        {isEn ? 'Panchayat Rule Permitted' : 'પંચાયત નિયમ માન્ય'}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-emerald-800 font-medium mt-0.5">
                      {isEn
                        ? 'If your village is crowded, panchayat rules allow booking at any neighboring cluster Gram Panchayat e-Gram center.'
                        : 'જો તમારા ગામમાં સ્લોટ પૂર્ણ હોય કે ભીડ હોય, તો પંચાયત નિયમ મુજબ આજુબાજુના ગામના ઈ-ગ્રામ કેન્દ્રમાં પણ સ્લોટ બુક કરી શકો છો.'}
                    </p>
                  </div>
                </div>
                {selectedClusterVillageId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClusterVillageId(null);
                      triggerHaptic('tap');
                    }}
                    className="text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-lg transition self-start sm:self-auto shrink-0 shadow-2xs cursor-pointer"
                  >
                    {isEn ? '↺ Reset to Taluka' : '↺ મૂળ કચેરી પર પાછા ફરો'}
                  </button>
                )}
              </div>

              {/* Village cluster grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {nearbyClusters.map((cluster) => {
                  const isSelected = selectedClusterVillageId === cluster.villageId;
                  const isHome = cluster.isCitizenHomeVillage;

                  return (
                    <div
                      key={cluster.villageId}
                      className={`rounded-xl p-3 border transition flex flex-col justify-between text-left relative ${
                        isSelected
                          ? 'bg-white border-emerald-600 ring-2 ring-emerald-500 shadow-md'
                          : isHome
                          ? 'bg-amber-50/70 border-amber-300'
                          : 'bg-white border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                            <span>{isHome ? '🏠' : '📍'}</span>
                            <span>{isEn ? cluster.villageNameEn : cluster.villageNameGu}</span>
                          </span>
                          <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            {cluster.distanceKm} km
                          </span>
                        </div>

                        <p className="text-[10.5px] text-slate-600 font-medium leading-snug line-clamp-1">
                          {isEn ? cluster.centerNameEn : cluster.centerNameGu}
                        </p>

                        <div className="flex items-center gap-1.5 mt-2">
                          <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-full ${
                            cluster.crowdLevel === 'low'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : cluster.crowdLevel === 'moderate'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-red-100 text-red-800 border border-red-300'
                          }`}>
                            {isEn 
                              ? `${cluster.availableSlotsToday} Slots Free` 
                              : `${cluster.availableSlotsToday} સ્લોટ ખાલી`}
                          </span>

                          <span className="text-[9.5px] text-slate-500 font-semibold">
                            ⏳ ~{cluster.estimatedWaitMins} {isEn ? 'min wait' : 'મિ. પ્રતીક્ષા'}
                          </span>
                        </div>

                        <p className="text-[9.5px] text-emerald-800 font-semibold mt-1.5 leading-snug line-clamp-2">
                          {isEn ? cluster.recommendedReasonEn : cluster.recommendedReasonGu}
                        </p>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                        {isSelected ? (
                          <span className="text-[11px] font-black text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{isEn ? 'Center Selected' : 'પસંદ કરેલ કેન્દ્ર'}</span>
                          </span>
                        ) : isHome ? (
                          <span className="text-[10px] text-amber-800 font-bold">
                            {isEn ? 'Home Center (High Rush)' : 'મૂળ કેન્દ્ર (વધુ ભીડ)'}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic('tap');
                              setSelectedClusterVillageId(cluster.villageId);
                              speakGuidance(`${cluster.villageNameGu} કેન્દ્ર પસંદ થયું. ${cluster.availableSlotsToday} સ્લોટ ઉપલબ્ધ છે.`);
                            }}
                            className="w-full text-center text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 px-2 rounded-lg transition shadow-2xs cursor-pointer flex items-center justify-center gap-1"
                          >
                            <span>{isEn ? 'Select This Center' : 'આ કેન્દ્ર પસંદ કરો'}</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* STEP 2: SERVICE CENTER SELECTION (Requirement 3) */}
          <section className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#005A9C]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  {isEn ? 'Step 2: Select Service Center' : isHi ? 'चरण २: सेवा केंद्र चुनें' : isMr ? 'पायरी २: सेवा केंद्र निवडा' : 'પગલું ૨: સેવા કેન્દ્ર પસંદ કરો (Service Center Selection)'}
                </h4>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">
                {isEn ? `${serviceCenters.length} centers available` : isMr ? `${serviceCenters.length} केंद्रे उपलब्ध` : isHi ? `${serviceCenters.length} केंद्र उपलब्ध` : `${serviceCenters.length} કેન્દ્રો ઉપલબ્ધ`}
              </span>
            </div>

            {/* Active Neighboring Village Center Alert Banner */}
            {selectedClusterVillageId && (
              <div className="mb-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-400 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌐</span>
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-200/80 px-1.5 py-0.2 rounded">
                      {isEn ? 'Cluster E-Gram Center Active' : 'ક્લસ્ટર ઈ-ગ્રામ કેન્દ્ર સક્રિય'}
                    </span>
                    <p className="text-xs font-black text-emerald-950 mt-0.5">
                      {isEn ? selectedCenter.nameEn : selectedCenter.nameGu} ({selectedCenter.distanceKm} km)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('tap');
                    setSelectedClusterVillageId(null);
                  }}
                  className="text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-lg transition self-start sm:self-auto shrink-0 shadow-2xs cursor-pointer"
                >
                  {isEn ? 'Switch to Taluka Office' : 'તાલુકા સેવા સદન પસંદ કરો'}
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {serviceCenters.map((center) => {
                const isSelected = !selectedClusterVillageId && selectedCenterId === center.id;
                return (
                  <button
                    key={center.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic('tap');
                      setSelectedClusterVillageId(null);
                      setSelectedCenterId(center.id);
                    }}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-50/80 border-[#005A9C] ring-2 ring-[#005A9C]/30 shadow-xs'
                        : 'bg-white border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-[#003366] flex items-center gap-1.5">
                          <span>📍</span>
                          <span>{isEn ? center.nameEn : center.nameGu}</span>
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-[#005A9C] shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {isEn ? center.addressEn : center.addressGu}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {isEn ? `Est Distance: ~${center.distanceKm} km` : `અંદાજિત અંતર: ~${center.distanceKm} કિ.મી.`}
                      </span>
                      <span className="text-slate-500 font-medium">
                        {isEn ? (center.availabilityNoteEn || 'Service Available') : (center.availabilityNoteGu || 'સેવા ઉપલબ્ધ')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Configured Service Hours Display (Requirement 4) */}
            <div className="mt-3 p-2.5 bg-blue-50/70 border border-blue-200/80 rounded-lg text-xs text-[#003366] flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#005A9C]" />
                <span>
                  {isEn 
                    ? <>Office Hours: <strong>{selectedCenter.config.serviceHours.displayEn}</strong></> 
                    : <>કચેરી કામકાજનો સમય: <strong>{selectedCenter.config.serviceHours.displayGu}</strong></>}
                </span>
              </span>
              <span className="text-[11px] text-slate-600">
                ({isEn ? `Lunch Break: ${selectedCenter.config.lunchBreak.displayEn}` : `ભોજન રિસેસ: ${selectedCenter.config.lunchBreak.displayGu}`})
              </span>
            </div>
          </section>

          {/* STEP 3: DATE PICKER & SOURCE-BASED HOLIDAY CALENDAR (Requirement 7) */}
          <section className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-[#005A9C]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                {isEn ? 'Step 3: Select Visit Date (Holiday Calendar Validated)' : isHi ? 'चरण ३: यात्रा की तिथि चुनें' : isMr ? 'पायरी ३: भेटीची तारीख निवडा (सुट्टी दिनदर्शिकेनुसार)' : 'પગલું ૩: મુલાકાતની તારીખ પસંદ કરો (Holiday Calendar Validated)'}
              </h4>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setIsRecalculatingSlots(true);
                  setTimeout(() => setIsRecalculatingSlots(false), 200);
                  setConflictError(null);
                  triggerHaptic('tap');
                }}
                min="2026-01-01"
                max="2026-12-31"
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
              />

              <div className="text-[11px] text-gray-500 leading-tight">
                {isEn 
                  ? 'Sunday & 2nd/4th Saturday official holiday | Validated per Gujarat official gazette' 
                  : isHi 
                  ? 'रविवार एवं २रे/४थे शनिवार को सरकारी अवकाश | आधिकारिक गजट अनुसार' 
                  : isMr
                  ? 'रविवार आणि २ऱ्या/४थ्या शनिवारी शासकीय सुट्टी | अधिकृत दिनदर्शिकेनुसार'
                  : 'રવિવાર & ૨જા/૪થા શનિવારે જાહેર રજા | સત્તાવાર રજા યાદી આધારે માન્ય'}
              </div>
            </div>

            {/* HOLIDAY WARNING BANNER */}
            {holidayCheck.isClosed && (
              <div className="mt-3 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 animate-in fade-in">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h5 className="font-bold text-red-900 flex items-center gap-2">
                    <span>{isEn ? 'Office Closed on Selected Date' : isHi ? 'इस तिथि को कार्यालय बंद रहेगा' : isMr ? 'निवडलेल्या तारखेला कार्यालय बंद राहील' : 'આ તારીખે કચેરી બંધ રહેશે (Office Closed)'}</span>
                    <span className="bg-red-200 text-red-900 text-[10px] px-2 py-0.2 rounded-full font-bold">
                      {isEn ? 'No-Booking Day' : isHi ? 'नो-बुकिंग दिवस' : isMr ? 'सुट्टीचा दिवस' : 'નો-બુકિંગ દિવસ'}
                    </span>
                  </h5>
                  <p className="mt-1 text-red-700 font-medium">
                    {isEn ? (holidayCheck.reasonEn || holidayCheck.reasonGu) : isHi ? (holidayCheck.reasonEn || holidayCheck.reasonGu) : isMr ? (holidayCheck.reasonEn || holidayCheck.reasonGu) : holidayCheck.reasonGu}
                  </p>
                  <p className="text-[10px] text-red-600 font-mono mt-0.5">
                    {isEn ? 'Source:' : isHi ? 'स्रोत:' : isMr ? 'स्रोत:' : 'સ્ત્રોત:'} {holidayCheck.source || GUJARAT_HOLIDAY_CALENDAR_METADATA.source}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* STEP 4: TIME SLOTS WITH CLEAR AVAILABILITY (Requirements 5 & 6) */}
          <section className="bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#005A9C]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  {isEn 
                    ? `Step 4: Available Time Slots (Cap: ${selectedCenter.config.defaultCapacityPerHour} slots/hr)` 
                    : isHi 
                    ? `चरण ४: उपलब्ध समय स्लॉट (क्षमता: ${selectedCenter.config.defaultCapacityPerHour} स्लॉट/घंटा)` 
                    : isMr
                    ? `पायरी ४: उपलब्ध वेळ स्लॉट (मर्यादा: ${selectedCenter.config.defaultCapacityPerHour} स्लॉट/तास)`
                    : `પગલું ૪: ઉપલબ્ધ સમય સ્લોટ (ક્ષમતા મર્યાદા: ${selectedCenter.config.defaultCapacityPerHour} સ્લોટ/કલાક)`}
                </h4>
              </div>
              <span className="text-[10px] font-semibold text-slate-500">
                {isEn ? 'Capped hourly slots to prevent hall overcrowding' : isHi ? 'भीड़ नियंत्रण हेतु प्रति घंटा सीमित स्लॉट' : isMr ? 'गर्दी टाळण्यासाठी मर्यादित प्रति तास स्लॉट' : 'ભીડ નિયંત્રણ માટે કલાકદીઠ સીમિત સ્લોટ્સ'}
              </span>
            </div>

            {holidayCheck.isClosed ? (
              <div className="p-5 text-center text-gray-400 bg-white border border-gray-200 rounded-xl">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-xs font-semibold">
                  {isEn ? 'Slots are not available as the selected date is an official government holiday.' : isHi ? 'चयनित तिथि पर सरकारी अवकाश होने के कारण स्लॉट उपलब्ध नहीं हैं।' : isMr ? 'निवडलेल्या तारखेला शासकीय सुट्टी असल्याने स्लॉट उपलब्ध नाहीत.' : 'પસંદ કરેલ તારીખે સરકારી રજા હોવાથી સ્લોટ્સ ઉપલબ્ધ નથી.'}
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  {isEn ? 'Please choose another working day.' : isHi ? 'कृपया अन्य कार्य दिवस चुनें।' : isMr ? 'कृपया दुसरा कामकाजाचा दिवस निवडा.' : 'કૃપા કરીને અન્ય કામકાજનો દિવસ પસંદ કરો.'}
                </p>
              </div>
            ) : isRecalculatingSlots ? (
              <SlotSkeleton count={6} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {slots.map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  const isLunch = slot.isLunchBreak;
                  const isFull = slot.status === 'full';

                  const slotStatusLabel = isLunch
                    ? (isEn ? 'Official Lunch Break' : isHi ? 'आधिकारिक भोजन अवकाश' : isMr ? 'अधिकृत दुपारची सुट्टी' : 'સત્તાવાર ભોજન વિરામ')
                    : slot.status === 'full'
                      ? (isEn ? 'Full (0 Left)' : isHi ? 'पूर्ण (० शेष)' : isMr ? 'पूर्ण भरले (० शिल्लक)' : 'હાઉસફુલ (૦ બાકી)')
                      : slot.status === 'moderate'
                        ? (isEn ? 'Filling Fast' : isHi ? 'शीघ्र भर रहा है' : isMr ? 'जलद गतीने भरत आहे' : 'ઝડપથી ભરાઈ રહ્યું છે')
                        : (isEn ? 'Available' : isHi ? 'उपलब्ध' : isMr ? 'उपलब्ध' : 'ઉપલબ્ધ');

                  if (isLunch) {
                    return (
                      <div
                        key={slot.id}
                        className="col-span-1 sm:col-span-2 p-2.5 rounded-xl bg-gray-200/70 border border-gray-300/80 text-gray-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 opacity-80"
                      >
                        <div className="flex items-center gap-2">
                          <Utensils className="w-4 h-4 text-gray-500 shrink-0" />
                          <span className="text-xs font-bold">
                            {slot.timeRange}
                          </span>
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-semibold bg-gray-300 text-gray-700 px-2 py-0.5 rounded-full w-fit">
                          {slotStatusLabel}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={isFull}
                      onClick={() => {
                        triggerHaptic('tap');
                        setSelectedSlotId(slot.id);
                        setConflictError(null);
                      }}
                      className={`p-2.5 sm:p-3 rounded-xl border text-left transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 ${
                        isSelected 
                          ? 'bg-[#003366] text-white border-[#003366] shadow-md ring-2 ring-blue-500/50' 
                          : isFull 
                            ? 'bg-red-50/60 border-red-200 text-gray-400 cursor-not-allowed'
                            : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50/40 text-gray-800'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <span>{slot.timeRange}</span>
                          {isSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#FF9933] shrink-0" />
                          )}
                        </div>
                        <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                          {isEn 
                            ? `Booked: ${slot.bookedCount}/${slot.maxCapacity} • Left: ${slot.slotsAvailable}` 
                            : isHi 
                            ? `बुक: ${slot.bookedCount}/${slot.maxCapacity} • शेष: ${slot.slotsAvailable}` 
                            : isMr 
                            ? `नोंदणीकृत: ${slot.bookedCount}/${slot.maxCapacity} • शिल्लक: ${slot.slotsAvailable}` 
                            : `બુક થયેલ: ${slot.bookedCount}/${slot.maxCapacity} • બાકી: ${slot.slotsAvailable}`}
                        </div>
                      </div>

                      <div className="sm:text-right shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                          slot.statusColor === 'green' 
                            ? isSelected ? 'bg-green-700 text-white' : 'bg-green-100 text-green-800'
                            : slot.statusColor === 'yellow'
                              ? isSelected ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-700'
                        }`}>
                          {slotStatusLabel}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* STEP 5: CONFIGURABLE COUNTER ROUTING */}
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#005A9C] text-white flex items-center justify-center font-bold text-sm shrink-0">
                C{routing.counterNumber}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-blue-900">
                    {isEn 
                      ? `Assigned Counter: Counter ${routing.counterNumber} - ${counterDetails.nameEn}` 
                      : isHi 
                      ? `आवंटित काउंटर: काउंटर ${routing.counterNumber} - ${counterDetails.nameEn}` 
                      : isMr 
                      ? `नियुक्त काउंटर: काउंटर ${routing.counterNumber} - ${counterDetails.nameEn}` 
                      : `ફાળવેલ કાઉન્ટર: કાઉન્ટર ${routing.counterNumber} - ${counterDetails.nameGu}`}
                  </h4>
                  <span className="bg-blue-200 text-blue-900 text-[10px] px-1.5 py-0.2 rounded font-bold">
                    {isEn ? 'Service-Based' : isHi ? 'सेवा आधारित' : isMr ? 'सेवा आधारित' : 'સેવા આધારિત'}
                  </span>
                </div>
                <p className="text-xs text-blue-800 mt-1">
                  {isEn ? routing.reasonEn : routing.reasonGu}
                </p>
                <div className="mt-2 text-[11px] text-gray-600 flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-gray-500" />
                  <span>{isEn ? 'Desk Officer: ' : isHi ? 'डेस्क अधिकारी: ' : isMr ? 'डेस्क अधिकारी: ' : 'ડેસ્ક અધિકારી: '}<strong>{counterDetails.officerName}</strong></span>
                </div>
              </div>
            </div>
          </section>

          {/* STEP 6: RECOMMENDED DEPARTURE (ESTIMATE) (Requirement 16) */}
          <section className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#005A9C] text-white flex items-center justify-center shrink-0">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#003366]">
                  {isEn ? 'Recommended Departure Time (Estimate)' : isHi ? 'घर से प्रस्थान का अनुशंसित समय (अनुमानित)' : isMr ? 'घरातून निघण्याची शिफारस केलेली वेळ (अंदाजे)' : 'ઘરેથી નીકળવાનો ભલામણ કરેલ સમય (અંદાજિત)'}
                </p>
                <p className="text-[10.5px] text-slate-600">
                  {isEn 
                    ? `Estimated transit: ~${transitEstimate.travelMins} mins (${transitEstimate.distanceKm} km) + ${transitEstimate.bufferMins} min buffer`
                    : isHi 
                    ? `अनुमानित यात्रा: ~${transitEstimate.travelMins} मिनट (${transitEstimate.distanceKm} किमी) + ${transitEstimate.bufferMins} मि. बफर`
                    : isMr 
                    ? `अंदाजे प्रवास: ~${transitEstimate.travelMins} मिनिटे (${transitEstimate.distanceKm} किमी) + ${transitEstimate.bufferMins} मि. बफर`
                    : `અંદાજિત મુસાફરી: ~${transitEstimate.travelMins} મિનિટ (${transitEstimate.distanceKm} કિ.મી.) + ${transitEstimate.bufferMins} મિ. બફર`}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs sm:text-sm font-black text-blue-900 bg-white border border-blue-300 px-2 sm:px-2.5 py-1 rounded-lg">
                {transitEstimate.leaveHomeBy}
              </span>
              <span className="block text-[8.5px] text-slate-500 mt-0.5">
                {isEn ? 'Plan according to traffic' : isHi ? 'ट्रैफिक अनुसार योजना बनाएं' : isMr ? 'रहदारीनुसार नियोजन करा' : 'ટ્રાફિક મુજબ પ્લાન કરો'}
              </span>
            </div>
          </section>

          {/* STEP 7: PRIORITY APPOINTMENT SUPPORT (Requirement 8) */}
          <section className="bg-amber-50/80 border border-amber-300 rounded-xl p-3.5 flex items-start gap-3 transition">
            <input 
              type="checkbox" 
              id="priority-check" 
              checked={isPriority} 
              onChange={(e) => {
                triggerHaptic('tap');
                setIsPriority(e.target.checked);
                if (e.target.checked) {
                  speakGuidance(isEn ? 'Priority appointment slot selected.' : isHi ? 'प्राथमिकता अपॉइंटमेंट स्लॉट चयनित।' : isMr ? 'प्राधान्य अपॉइंटमेंट स्लॉट निवडला.' : 'પ્રાથમિકતા અગ્રતા સ્લોટ પસંદ થયો છે. વહીવટી માર્ગદર્શિકા મુજબ વિશેષ ટોકન ફાળવાશે.');
                }
              }}
              className="mt-0.5 w-4 h-4 rounded text-amber-600 accent-[#FF9933] cursor-pointer"
            />
            <div className="text-xs text-amber-950 font-bold cursor-pointer select-none flex-1">
              <label htmlFor="priority-check" className="flex flex-wrap items-center gap-1.5 text-[#003366] font-black cursor-pointer">
                <span>{isEn ? '♿ Priority Appointment Support (Senior / Divyang)' : isHi ? '♿ प्राथमिकता अपॉइंटमेंट सहायता' : isMr ? '♿ प्राधान्य अपॉइंटमेंट सहाय्यता (ज्येष्ठ / दिव्यांग)' : '♿ પ્રાથમિકતા અપોઇન્ટમેન્ટ સપોર્ટ (Priority Appointment)'}</span>
                <span className="bg-[#FF9933] text-slate-900 text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase">
                  {isEn ? 'Priority Policy' : isHi ? 'प्राथमिकता नीति' : isMr ? 'प्राधान्य धोरण' : 'વહીવટી અગ્રતા નીતિ'}
                </span>
              </label>
              <p className="text-[11px] text-amber-900/80 font-medium mt-0.5">
                {isEn 
                  ? 'Senior citizens (60+) or Divyangjan are issued a priority token (#P-) under Gujarat public service guidelines.'
                  : isHi 
                  ? 'वरिष्ठ नागरिकों (६०+) या दिव्यांगजनों के लिए प्राथमिकता टोकन (#P-) प्रदान किया जाता है।' 
                  : isMr
                  ? 'ज्येष्ठ नागरिक (६०+) किंवा दिव्यांग व्यक्तींना शासकीय नियमानुसार प्राधान्य टोकन (#P-) दिले जाते.'
                  : 'વરિષ્ઠ નાગરિકો (૬૦+) અથવા દિવ્યાંગજનો માટે વહીવટી માર્ગદર્શિકા હેઠળ પ્રાથમિકતા ફ્લેગ (#P-) ફાળવવામાં આવે છે.'}
              </p>

              {isPriority && (
                <div className="mt-2.5 pt-2 border-t border-amber-200/80 flex items-center gap-2">
                  <span className="text-[10px] text-slate-600">{isEn ? 'Category:' : isHi ? 'श्रेणी:' : isMr ? 'श्रेणी:' : 'કેટેગરી:'}</span>
                  <select
                    value={priorityCategory}
                    onChange={(e) => setPriorityCategory(e.target.value as PriorityCategory)}
                    className="bg-white border border-amber-300 rounded px-2 py-1 text-xs text-amber-900 font-bold focus:outline-none"
                  >
                    <option value="senior_citizen">{isEn ? 'Senior Citizen (60+ yrs)' : isHi ? 'वरिष्ठ नागरिक (६०+ वर्ष)' : isMr ? 'ज्येष्ठ नागरिक (६०+ वर्षे)' : 'વરિષ્ઠ નાગરિક (૬૦+ વર્ષ)'}</option>
                    <option value="divyangjan">{isEn ? 'Divyangjan Priority' : isHi ? 'दिव्यांगजन प्राथमिकता' : isMr ? 'दिव्यांगजन प्राधान्य' : 'દિવ્યાંગજન અગ્રતા'}</option>
                    <option value="medical_priority">{isEn ? 'Urgent Medical Priority' : isHi ? 'चिकित्सा आपात प्राथमिकता' : isMr ? 'वैद्यकीय तातडीचे प्राधान्य' : 'તાત્કાલિક તબીબી અગ્રતા'}</option>
                  </select>
                </div>
              )}
            </div>
          </section>

        </div>

        {/* FOOTER ACTIONS - STICKY WHATSAPP BOTTOM BAR */}
        <div className="bg-white/95 backdrop-blur-md p-3 sm:p-4 border-t border-slate-200 flex items-center justify-between shrink-0 sticky bottom-0 z-30 pb-[max(0.85rem,env(safe-area-inset-bottom))] shadow-lg">
          <button
            onClick={() => {
              triggerHaptic('tap');
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition cursor-pointer"
          >
            {isEn ? 'Cancel' : isHi ? 'रद्द करें' : isMr ? 'रद्द करा' : 'રદ કરો (Cancel)'}
          </button>

          <button
            disabled={holidayCheck.isClosed || selectedSlot.isLunchBreak || selectedSlot.status === 'full'}
            onClick={handleFinalConfirm}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-md transition cursor-pointer ${
              holidayCheck.isClosed || selectedSlot.isLunchBreak || selectedSlot.status === 'full'
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-[#003366] hover:bg-[#002244] active:scale-[0.98] text-white hover:shadow-lg'
            }`}
          >
            <span>{isEn ? 'Confirm Appointment Slot' : isHi ? 'स्लॉट पुष्टि करें' : isMr ? 'अपॉइंटमेंट स्लॉट निश्चित करा' : 'ટોકન સ્લોટ કન્ફર્મ કરો'}</span>
            <ArrowRight className="w-4 h-4 text-[#FF9933] shrink-0" />
          </button>
        </div>

      </div>
    </div>
  );
}
