'use client';

import React, { useState, useMemo } from 'react';
import { 
  Building2, MapPin, Calendar, Clock, AlertTriangle, 
  CheckCircle2, X, ChevronRight, ShieldCheck, ArrowRight,
  Info, Sparkles, UserCheck, Utensils, Navigation
} from 'lucide-react';
import { 
  GUJARAT_33_DISTRICTS, 
  DistrictItem, 
  TalukaOffice, 
  ServiceCenter,
  getTalukaServiceCenters,
  getRecommendedCounter 
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
import { SchemeItem } from '@/lib/schemes-data';
import { GovLogo } from '@/components/GovLogo';

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

interface SlotBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheme: SchemeItem | null;
  onConfirm: (details: BookingDetails) => void;
  lang?: 'en' | 'gu' | 'hi';
}

export function SlotBookingModal({
  isOpen,
  onClose,
  scheme,
  onConfirm,
  lang = 'gu'
}: SlotBookingModalProps) {
  // District & Taluka state
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('rajkot');
  const [selectedTalukaId, setSelectedTalukaId] = useState<string>('gondal');

  // Service Center state (Requirement 3: Service Center Selection)
  const [selectedCenterId, setSelectedCenterId] = useState<string>('gondal-jsk');

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

  const selectedCenter = useMemo(() => {
    return serviceCenters.find(c => c.id === selectedCenterId) || serviceCenters[0];
  }, [serviceCenters, selectedCenterId]);

  // Handle District Change
  const handleDistrictChange = (distId: string) => {
    setSelectedDistrictId(distId);
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
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 modal-backdrop animate-in fade-in duration-150"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-3xl rounded-t-3xl sm:rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-in slide-in-from-bottom sm:zoom-in-95"
      >
        
        {/* HEADER */}
        <div className="bg-[#003366] text-white p-3.5 sm:p-5 flex items-center justify-between border-b border-blue-900 shrink-0">
          <div className="flex items-center gap-3">
            <GovLogo className="w-10 h-10 shrink-0 drop-shadow-md" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">
                  {lang === 'gu' ? 'અધિકારક્ષેત્ર & સ્લોટ બુકિંગ' : 'Jurisdiction Routing & Appointment Scheduling'}
                </h3>
                <span className="bg-[#005A9C] text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-400">
                  કેપેસિટી કંટ્રોલ્ડ
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                {scheme ? scheme.titleGu : 'ગુજરાતના તમામ ૩૩ જિલ્લાઓ & તાલુકા કેન્દ્રો'}
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
          
          {/* STEP 1: JURISDICTION (DISTRICT & TALUKA) */}
          <section className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-[#005A9C]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                પગલું ૧: જિલ્લો અને તાલુકો પસંદ કરો (District & Taluka)
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  જિલ્લો (District)
                </label>
                <select
                  value={selectedDistrictId}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                >
                  {GUJARAT_33_DISTRICTS.map((dist) => (
                    <option key={dist.id} value={dist.id}>
                      {dist.nameGu} ({dist.nameEn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  તાલુકો (Taluka)
                </label>
                <select
                  value={selectedTalukaId}
                  onChange={(e) => handleTalukaChange(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
                >
                  {selectedDistrict.talukas.map((tal) => (
                    <option key={tal.id} value={tal.id}>
                      {tal.nameGu} - {tal.officeNameGu}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* STEP 2: SERVICE CENTER SELECTION (Requirement 3) */}
          <section className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#005A9C]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  પગલું ૨: સેવા કેન્દ્ર પસંદ કરો (Service Center Selection)
                </h4>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">
                {serviceCenters.length} કેન્દ્રો ઉપલબ્ધ
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {serviceCenters.map((center) => {
                const isSelected = selectedCenterId === center.id;
                return (
                  <button
                    key={center.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic('tap');
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
                          <span>{center.nameGu}</span>
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-[#005A9C] shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {center.addressGu}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        અંદાજિત અંતર: ~{center.distanceKm} કિ.મી.
                      </span>
                      <span className="text-slate-500 font-medium">
                        {center.availabilityNoteGu || 'સેવા ઉપલબ્ધ'}
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
                <span>કચેરી કામકાજનો સમય: <strong>{selectedCenter.config.serviceHours.displayGu}</strong></span>
              </span>
              <span className="text-[11px] text-slate-600">
                (ભોજન રિસેસ: {selectedCenter.config.lunchBreak.displayGu})
              </span>
            </div>
          </section>

          {/* STEP 3: DATE PICKER & SOURCE-BASED HOLIDAY CALENDAR (Requirement 7) */}
          <section className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-[#005A9C]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                પગલું ૩: મુલાકાતની તારીખ પસંદ કરો (Holiday Calendar Validated)
              </h4>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setConflictError(null);
                  triggerHaptic('tap');
                }}
                min="2026-01-01"
                max="2026-12-31"
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005A9C]"
              />

              <div className="text-[11px] text-gray-500 leading-tight">
                રવિવાર & ૨જા/૪થા શનિવારે જાહેર રજા | સત્તાવાર રજા યાદી આધારે માન્ય
              </div>
            </div>

            {/* HOLIDAY WARNING BANNER */}
            {holidayCheck.isClosed && (
              <div className="mt-3 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-800 animate-in fade-in">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h5 className="font-bold text-red-900 flex items-center gap-2">
                    <span>આ તારીખે કચેરી બંધ રહેશે (Office Closed)</span>
                    <span className="bg-red-200 text-red-900 text-[10px] px-2 py-0.2 rounded-full font-bold">
                      નો-બુકિંગ દિવસ
                    </span>
                  </h5>
                  <p className="mt-1 text-red-700 font-medium">
                    {holidayCheck.reasonGu}
                  </p>
                  <p className="text-[10px] text-red-600 font-mono mt-0.5">
                    સ્ત્રોત: {holidayCheck.source || GUJARAT_HOLIDAY_CALENDAR_METADATA.source}
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
                  પગલું ૪: ઉપલબ્ધ સમય સ્લોટ (ક્ષમતા મર્યાદા: {selectedCenter.config.defaultCapacityPerHour} સ્લોટ/કલાક)
                </h4>
              </div>
              <span className="text-[10px] font-semibold text-slate-500">
                ભીડ નિયંત્રણ માટે કલાકદીઠ સીમિત સ્લોટ્સ
              </span>
            </div>

            {holidayCheck.isClosed ? (
              <div className="p-5 text-center text-gray-400 bg-white border border-gray-200 rounded-xl">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-xs font-semibold">પસંદ કરેલ તારીખે સરકારી રજા હોવાથી સ્લોટ્સ ઉપલબ્ધ નથી.</p>
                <p className="text-[11px] text-gray-400 mt-1">કૃપા કરીને અન્ય કામકાજનો દિવસ પસંદ કરો.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {slots.map((slot) => {
                  const isSelected = selectedSlotId === slot.id;
                  const isLunch = slot.isLunchBreak;
                  const isFull = slot.status === 'full';

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
                          {slot.statusGu}
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
                          બુક થયેલ: {slot.bookedCount}/{slot.maxCapacity} • બાકી: {slot.slotsAvailable}
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
                          {slot.statusGu}
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
                    ફાળવેલ કાઉન્ટર: કાઉન્ટર {routing.counterNumber} - {counterDetails.nameGu}
                  </h4>
                  <span className="bg-blue-200 text-blue-900 text-[10px] px-1.5 py-0.2 rounded font-bold">
                    સેવા આધારિત
                  </span>
                </div>
                <p className="text-xs text-blue-800 mt-1">
                  {routing.reasonGu}
                </p>
                <div className="mt-2 text-[11px] text-gray-600 flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-gray-500" />
                  <span>ડેસ્ક અધિકારી: <strong>{counterDetails.officerName}</strong></span>
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
                <p className="text-xs font-bold text-[#003366]">ઘરેથી નીકળવાનો ભલામણ કરેલ સમય (અંદાજિત)</p>
                <p className="text-[10.5px] text-slate-600">
                  અંદાજિત મુસાફરી: ~{transitEstimate.travelMins} મિનિટ ({transitEstimate.distanceKm} કિ.મી.) + {transitEstimate.bufferMins} મિ. બફર
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs sm:text-sm font-black text-blue-900 bg-white border border-blue-300 px-2 sm:px-2.5 py-1 rounded-lg">
                {transitEstimate.leaveHomeBy}
              </span>
              <span className="block text-[8.5px] text-slate-500 mt-0.5">ટ્રાફિક મુજબ પ્લાન કરો</span>
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
                  speakGuidance("પ્રાથમિકતા અગ્રતા સ્લોટ પસંદ થયો છે. વહીવટી માર્ગદર્શિકા મુજબ વિશેષ ટોકન ફાળવાશે.");
                }
              }}
              className="mt-0.5 w-4 h-4 rounded text-amber-600 accent-[#FF9933] cursor-pointer"
            />
            <div className="text-xs text-amber-950 font-bold cursor-pointer select-none flex-1">
              <label htmlFor="priority-check" className="flex flex-wrap items-center gap-1.5 text-[#003366] font-black cursor-pointer">
                <span>♿ પ્રાથમિકતા અપોઇન્ટમેન્ટ સપોર્ટ (Priority Appointment)</span>
                <span className="bg-[#FF9933] text-slate-900 text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase">
                  વહીવટી અગ્રતા નીતિ
                </span>
              </label>
              <p className="text-[11px] text-amber-900/80 font-medium mt-0.5">
                વરિષ્ઠ નાગરિકો (૬૦+) અથવા દિવ્યાંગજનો માટે વહીવટી માર્ગદર્શિકા હેઠળ પ્રાથમિકતા ફ્લેગ (#P-) ફાળવવામાં આવે છે.
              </p>

              {isPriority && (
                <div className="mt-2.5 pt-2 border-t border-amber-200/80 flex items-center gap-2">
                  <span className="text-[10px] text-slate-600">કેટેગરી:</span>
                  <select
                    value={priorityCategory}
                    onChange={(e) => setPriorityCategory(e.target.value as PriorityCategory)}
                    className="bg-white border border-amber-300 rounded px-2 py-1 text-xs text-amber-900 font-bold focus:outline-none"
                  >
                    <option value="senior_citizen">વરિષ્ઠ નાગરિક (૬૦+ વર્ષ)</option>
                    <option value="divyangjan">દિવ્યાંગજન અગ્રતા</option>
                    <option value="medical_priority">તાત્કાલિક તબીબી અગ્રતા</option>
                  </select>
                </div>
              )}
            </div>
          </section>

        </div>

        {/* FOOTER ACTIONS */}
        <div className="bg-gray-50 p-3 sm:p-4 border-t border-gray-200 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              triggerHaptic('tap');
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-200 transition"
          >
            રદ કરો (Cancel)
          </button>

          <button
            disabled={holidayCheck.isClosed || selectedSlot.isLunchBreak || selectedSlot.status === 'full'}
            onClick={handleFinalConfirm}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition ${
              holidayCheck.isClosed || selectedSlot.isLunchBreak || selectedSlot.status === 'full'
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[#003366] hover:bg-[#002244] text-white hover:shadow-lg'
            }`}
          >
            <span>ટોકન સ્લોટ કન્ફર્મ કરો</span>
            <ArrowRight className="w-4 h-4 text-[#FF9933]" />
          </button>
        </div>

      </div>
    </div>
  );
}
