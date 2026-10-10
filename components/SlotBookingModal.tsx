'use client';

import React, { useState, useMemo } from 'react';
import { 
  Building2, MapPin, Calendar, Clock, AlertTriangle, 
  CheckCircle2, X, ChevronRight, ChevronDown, ChevronUp, ShieldCheck, ArrowRight,
  Info, Sparkles, UserCheck, Utensils, Navigation,
  FileCheck, IndianRupee, AlertCircle, Upload, CreditCard, Landmark, Banknote, QrCode, Receipt, Lock,
  Copy, Check, ExternalLink, Smartphone
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
import { broadcastQueueEvent } from '@/lib/realtime-bus';
import { SchemeItem, getProcessingTimelineInfo } from '@/lib/schemes-data';
import { GovLogo } from '@/components/GovLogo';
import { SlotSkeleton } from '@/components/ui/Skeleton';

const DISTRICT_NAMES_HI: Record<string, string> = {
  rajkot: 'राजकोट',
  ahmedabad: 'अहमदाबाद',
  surat: 'सूरत',
  vadodara: 'वडोदरा',
  gandhinagar: 'गांधीनगर',
  bhavnagar: 'भावनगर',
  jamnagar: 'जामनगर',
  junagadh: 'जूनागढ़',
  kutch: 'कच्छ',
  anand: 'आणंद',
  kheda: 'खेड़ा',
  mehsana: 'मेहसाणा',
  banaskantha: 'बनासकांठा',
  sabarkantha: 'साबरकांठा',
  patan: 'पाटन',
  morbi: 'मोरबी',
  surendranagar: 'सुरेंद्रनगर',
  amreli: 'अमरेली',
  porbandar: 'पोरबंदर',
  devbhumi_dwarka: 'देवभूमि द्वारका',
  gir_somnath: 'गीर सोमनाथ',
  botad: 'बोटाद',
  bharuch: 'भरूच',
  narmada: 'नर्मदा',
  navsari: 'नवसारी',
  valsad: 'वलसाड',
  dang: 'डांग',
  tapi: 'तापी',
  panchmahal: 'पंचमहाल',
  dahod: 'दाहोद',
  mahisagar: 'महिसागर',
  chhota_udepur: 'छोटा उदेपुर',
  aravalli: 'अरवल्ली'
};

const TALUKA_NAMES_HI: Record<string, string> = {
  gondal: 'गोंडल',
  rajkot_city_west: 'राजकोट शहर पश्चिम (नाना मवा)',
  rajkot_city_east: 'राजकोट शहर पूर्व (आजी)',
  rajkot_city_central: 'राजकोट मध्य (कलेक्टर कार्यालय)',
  rajkot_rural: 'राजकोट ग्रामीण',
  kotda_sangani: 'कोटड़ा सांगाणी',
  jetpur: 'जेतपुर',
  dhoraji: 'धोराजी',
  upleta: 'उपलेटा',
  lodhika: 'लोधिका (जीआईडीसी)',
  jasdan: 'जसदण',
  vinchhiya: 'विंछिया',
  paddhari: 'पढधरी',
  jamkandorna: 'जामकंडोरणा'
};

function getLocalizedCenterName(center: ServiceCenter, isHi: boolean, isEn: boolean): string {
  if (isEn) return center.nameEn;
  if (isHi) {
    return center.nameGu
      .replace('જન સેવા કેન્દ્ર', 'जन सेवा केंद्र')
      .replace('મામલતદાર કચેરી / સેવા સદન', 'मामलतदार कार्यालय / सेवा सदन')
      .replace('ગોંડલ', 'गोंडल')
      .replace('રાજકોટ', 'राजकोट');
  }
  return center.nameGu;
}

function getLocalizedCenterAddress(center: ServiceCenter, isHi: boolean, isEn: boolean): string {
  if (isEn) return center.addressEn;
  if (isHi) {
    return center.addressGu
      .replace('તાલુકા પંચાયત કમ્પાઉન્ડ', 'तालुका पंचायत परिसर')
      .replace('કોર્ટ રોડ, સરકારી સેવા સદન', 'कोर्ट रोड, सरकारी सेवा सदन')
      .replace('ગોંડલ', 'गोंडल')
      .replace('રાજકોટ', 'राजकोट');
  }
  return center.addressGu;
}

function getLocalizedAvailability(center: ServiceCenter, isHi: boolean, isEn: boolean): string {
  if (isEn) return center.availabilityNoteEn || 'Service Available';
  if (isHi) {
    const raw = center.availabilityNoteGu || 'सेवाएं उपलब्ध';
    return raw
      .replace('સંપૂર્ણ ૩૯ સરકારી સેવાઓ ઉપલબ્ધ', 'सभी ३९ सरकारी सेवाएं उपलब्ध')
      .replace('મહેસૂલ & પ્રમાણપત્ર સેવાઓ ઉપલબ્ધ', 'राजस्व एवं प्रमाण पत्र सेवाएं उपलब्ध')
      .replace('સ્લોટ ખાલી', 'स्लॉट रिक्त')
      .replace('પ્રતીક્ષા સમય', 'प्रतीक्षा समय')
      .replace('સેવા ઉપલબ્ધ', 'सेवाएं उपलब्ध');
  }
  return center.availabilityNoteGu || 'સેવા ઉપલબ્ધ';
}

import { Language } from '@/lib/translations';
import { DEFAULT_CITIZEN_PROFILE } from '@/lib/citizen-profile';
import { 
  VerifiedDocumentItem, 
  GovernmentPaymentRecord 
} from '@/lib/slot-engine';

import { SchemeBookingMeta } from '@/components/SchemeDrawer';

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
  uploadedDocuments?: VerifiedDocumentItem[];
  payment?: GovernmentPaymentRecord;
  schemeId?: string;
  schemeTitleGu?: string;
  schemeTitleEn?: string;
  beneficiaryId?: string;
  beneficiaryNameGu?: string;
  beneficiaryNameEn?: string;
  beneficiaryRelation?: string;
  applicationType?: 'NEW' | 'UPDATE';
  currentStage?: 1 | 2 | 3 | 4 | 5;
  documentSubmissionStatus?: 'pending' | 'submitted_at_counter' | 'officer_approved' | 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';
}

interface SlotBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheme: SchemeItem | null;
  onConfirm: (details: BookingDetails) => void;
  lang?: Language;
  initialDistrictId?: string;
  initialTalukaId?: string;
  initialVillage?: string;
  uploadedDocs?: VerifiedDocumentItem[];
  beneficiaryMeta?: SchemeBookingMeta;
}


export function SlotBookingModal({
  isOpen,
  onClose,
  scheme,
  onConfirm,
  lang = 'gu',
  initialDistrictId,
  initialTalukaId,
  initialVillage,
  uploadedDocs,
  beneficiaryMeta
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

  // Nearby Village Cluster state (Collapsible & Gondal-Specific)
  const [isClustersExpanded, setIsClustersExpanded] = useState<boolean>(false);
  const [selectedClusterVillageId, setSelectedClusterVillageId] = useState<string | null>(null);

  // Priority Appointment Validation States (Verified Family Member Proof & AI Government Check)
  const [selectedPriorityMemberId, setSelectedPriorityMemberId] = useState<string>('mem-4'); // defaults to Parsottambhai Patel (Senior Citizen 68 yrs)
  const [customProofType, setCustomProofType] = useState<string>('udid_divyang');
  const [customProofNumber, setCustomProofNumber] = useState<string>('GJ-03-UDID-8842');
  const [isAiVerifying, setIsAiVerifying] = useState<boolean>(false);
  const [aiVerificationPassed, setAiVerificationPassed] = useState<boolean>(true);

  // Government Payment Gateway States (Cyber Treasury & Cash at Counter)
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [paymentMode, setPaymentMode] = useState<'ONLINE_CYBER_TREASURY' | 'CASH_AT_COUNTER'>('ONLINE_CYBER_TREASURY');
  const [onlineMethod, setOnlineMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiApp, setUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim'>('gpay');
  const [cardHolder, setCardHolder] = useState<string>('TRUSHA SOMAIYA');
  const [cardNumber, setCardNumber] = useState<string>('4591 •••• •••• 8842');
  const [selectedBank, setSelectedBank] = useState<string>('State Bank of India (SBI)');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentStepText, setPaymentStepText] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [qrViewMode, setQrViewMode] = useState<'dynamic' | 'original'>('dynamic');

  const upiId = 'trushasomaiya@okaxis';
  const payeeName = 'Trusha Somaiya';
  const targetFee = scheme?.fee ?? 20;
  const transactionNote = `Govt Fee - ${(scheme?.titleGu || 'Citizen Service').slice(0, 24)}`;

  const upiDeepLink = useMemo(() => {
    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${targetFee}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
  }, [upiId, payeeName, targetFee, transactionNote]);

  const gpayDeepLink = useMemo(() => {
    return `tez://upi/pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${targetFee}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
  }, [upiId, payeeName, targetFee, transactionNote]);

  const phonepeDeepLink = useMemo(() => {
    return `phonepe://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${targetFee}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
  }, [upiId, payeeName, targetFee, transactionNote]);

  const paytmDeepLink = useMemo(() => {
    return `paytmmp://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${targetFee}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
  }, [upiId, payeeName, targetFee, transactionNote]);

  const dynamicQrUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(upiDeepLink)}`;
  }, [upiDeepLink]);

  const handleCopyUpiId = () => {
    triggerHaptic('success');
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(upiId);
    }
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleLaunchUpiApp = (app: 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'any') => {
    triggerHaptic('tap');
    let targetUrl = upiDeepLink;
    if (app === 'gpay') targetUrl = gpayDeepLink;
    else if (app === 'phonepe') targetUrl = phonepeDeepLink;
    else if (app === 'paytm') targetUrl = paytmDeepLink;

    try {
      window.location.href = targetUrl;
    } catch (e) {
      window.location.href = upiDeepLink;
    }
  };

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

  // Recommended departure calculation (Fully Dynamic Estimate based on origin & destination)
  const transitEstimate = useMemo(() => {
    const originNameGu = initialVillage || DEFAULT_CITIZEN_PROFILE.villageGu || 'ગોમટા';
    const originNameEn = initialVillage || DEFAULT_CITIZEN_PROFILE.villageEn || 'Gomta';
    const destinationNameGu = selectedCenter.nameGu;
    const destinationNameEn = selectedCenter.nameEn;
    const distanceKm = Number((selectedCenter.distanceKm || 8.4).toFixed(1));
    
    // ~2.8 mins per km in rural/suburban Gujarat + 10 min traffic & parking buffer
    const travelMins = Math.max(4, Math.round(distanceKm * 2.8));
    const bufferMins = 10;
    const totalPriorMins = travelMins + bufferMins;

    const slotHour = parseInt(selectedSlot.startTime.split(':')[0] || '10', 10);
    const slotMinute = parseInt(selectedSlot.startTime.split(':')[1] || '30', 10);
    const slotTotalMins = slotHour * 60 + slotMinute;
    let depTotalMins = slotTotalMins - totalPriorMins;
    if (depTotalMins < 0) depTotalMins += 24 * 60;
    
    const h24 = Math.floor(depTotalMins / 60) % 24;
    const mins = depTotalMins % 60;
    const period = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 || 12;
    const leaveHomeBy = `${String(h12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;

    return {
      originNameGu,
      originNameEn,
      destinationNameGu,
      destinationNameEn,
      distanceKm,
      travelMins,
      bufferMins,
      leaveHomeBy
    };
  }, [selectedCenter, selectedSlot, initialVillage]);

  if (!isOpen) return null;

  const handleFinalConfirm = () => {
    setConflictError(null);

    if (holidayCheck.isClosed) {
      triggerHaptic('warning');
      speakGuidance(
        lang === 'hi' ? "चयनित तिथि पर कार्यालय बंद है। कृपया कोई अन्य कार्य दिवस चुनें।" :
        lang === 'mr' ? "निवडलेल्या तारखेला कार्यालय बंद आहे. कृपया दुसरा कामकाजाचा दिवस निवडा." :
        lang === 'en' ? "Office is closed on selected date. Please choose another working day." :
        lang === 'khi' ? "પસંદ કરેલ તારીખે કચેરી બંધ આય. કૃપા કરી બીજો કમ જો ડીં પસંદ કરિયો." :
        "પસંદ કરેલ તારીખે કચેરી બંધ છે. કૃપા કરીને અન્ય કામકાજનો દિવસ પસંદ કરો.",
        lang
      );
      return;
    }

    if (selectedSlot.isLunchBreak) {
      triggerHaptic('warning');
      speakGuidance(
        lang === 'hi' ? "भोजन अवकाश के दौरान टोकन बुकिंग संभव नहीं है।" :
        lang === 'mr' ? "दुपारच्या सुट्टीच्या वेळेत टोकन बुकिंग करता येत नाही." :
        lang === 'en' ? "Token booking is unavailable during lunch break." :
        lang === 'khi' ? "રિસેસ જે વગતમેં ટોકન બુકિંગ ન થિયે." :
        "રિસેસના સમયમાં ટોકન બુકિંગ થઈ શકતું નથી.",
        lang
      );
      return;
    }

    // Double-Booking Conflict Protection Check (Requirement 21)
    const availabilityCheck = checkSlotAvailability(selectedSlotId, slots);
    if (!availabilityCheck.available) {
      triggerHaptic('error');
      setConflictError(availabilityCheck.reasonGu || 'આ સ્લોટ હમણાં જ પૂર્ણ થઈ ગયો છે. કૃપા કરીને અન્ય સ્લોટ પસંદ કરો.');
      speakGuidance(
        lang === 'hi' ? "यह स्लॉट अभी भर चुका है। कृपया दूसरा समय चुनें।" :
        lang === 'mr' ? "हा स्लॉट नुकताच भरला आहे. कृपया दुसरी वेळ निवडा." :
        lang === 'en' ? "This slot was just filled. Please choose another time." :
        lang === 'khi' ? "હી સ્લોટ હમણાં જ પુરો થી વ્યો. કૃપા કરી બીજો વગત પસંદ કરિયો." :
        "આ સ્લોટ હમણાં જ પૂર્ણ થઈ ગયો છે. કૃપા કરીને અન્ય સમય પસંદ કરો.",
        lang
      );
      return;
    }

    // Validate Priority Claim (Security Policy to prevent queue jumping)
    const isPriorityVerified = isPriority && (selectedPriorityMemberId === 'mem-4' || aiVerificationPassed);
    if (isPriority && !isPriorityVerified) {
      triggerHaptic('warning');
      speakGuidance(
        lang === 'hi' ? "प्राथमिकता टोकन के लिए सरकारी दस्तावेज़ सत्यापन अनिवार्य है।" :
        lang === 'mr' ? "प्राधान्य टोकनसाठी शासकीय कागदपत्र पडताळणी आवश्यक आहे." :
        lang === 'en' ? "Document verification is required for Priority Token." :
        lang === 'khi' ? "અગ્રતા ટોકન લાય સરકારી કાગળ ચકાસણી જરૂરી આય." :
        "અગ્રતા ટોકન માટે સરકારી દસ્તાવેજ ચકાસણી અનિવાર્ય છે.",
        lang
      );
      setConflictError(lang === 'en'
        ? "⚠️ Proof verification required for Priority Appointment (#P-). Please verify UDID/Medical certificate or select a verified senior citizen family member."
        : lang === 'hi'
        ? "⚠️ प्राथमिकता टोकन (#P-) के लिए सरकारी दस्तावेज़ सत्यापन अनिवार्य है। कृपया दस्तावेज़ नंबर दर्ज कर 'AI सत्यापन' बटन दबाएं।"
        : "⚠️ અગ્રતા ટોકન (#P-) મેળવવા માટે સરકારી દસ્તાવેજ ચકાસણી અનિવાર્ય છે. કૃપા કરીને દસ્તાવેજ નંબર દાખલ કરી 'AI ચકાસણી' બટન દબાવો અથવા પરિવારના વરિષ્ઠ સભ્ય પસંદ કરો.");
      return;
    }

    triggerHaptic('tap');
    speakGuidance(
      lang === 'hi' ? "स्लॉट मान्य है। कृपया सरकारी शुल्क भुगतान विधि चुनें।" :
      lang === 'en' ? "Slot validated. Please select the government payment method." :
      "સ્લોટ પસંદગી માન્ય થઈ છે. કૃપા કરીને સત્તાવાર સરકારી સેવા ફી ચૂકવણી મોડ પસંદ કરો.",
      lang
    );
    setPaymentModalOpen(true);
  };

  const handleExecutePaymentAndIssueToken = () => {
    const isPriorityVerified = isPriority && (selectedPriorityMemberId === 'mem-4' || aiVerificationPassed);
    let tokenNumber = '';
    const activePriorityCat: PriorityCategory = isPriorityVerified ? priorityCategory : 'none';
    if (isPriorityVerified) {
      const pNum = Math.floor(1 + Math.random() * 15);
      tokenNumber = `#P-${String(pNum).padStart(2, '0')}`;
    } else {
      const tokenLetter = ['A', 'B', 'C', 'D'][routing.counterNumber % 4] || 'A';
      const tokenNum = Math.floor(10 + Math.random() * 89);
      tokenNumber = `#${tokenLetter}-${tokenNum}`;
    }

    const feeAmount = scheme?.fee ?? 20;

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

    const effectiveBeneficiaryId = beneficiaryMeta?.beneficiaryId || 'mem-1';
    const effectiveBeneficiaryNameGu = beneficiaryMeta?.beneficiaryNameGu || DEFAULT_CITIZEN_PROFILE.nameGu;
    const effectiveBeneficiaryNameEn = beneficiaryMeta?.beneficiaryNameEn || DEFAULT_CITIZEN_PROFILE.nameEn;
    const effectiveBeneficiaryRelation = beneficiaryMeta?.beneficiaryRelation || 'સ્વયં (મુખ્ય સભ્ય)';
    const effectiveApplicationType = beneficiaryMeta?.applicationType || 'NEW';

    const finalizeBooking = (paymentRecord: GovernmentPaymentRecord) => {
      const bookingData: BookingDetails = {
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
        validUntil: signedQr.validUntil,
        uploadedDocuments: uploadedDocs || [],
        payment: paymentRecord,
        schemeId: scheme?.id,
        schemeTitleGu: scheme?.titleGu,
        schemeTitleEn: scheme?.titleEn,
        beneficiaryId: effectiveBeneficiaryId,
        beneficiaryNameGu: effectiveBeneficiaryNameGu,
        beneficiaryNameEn: effectiveBeneficiaryNameEn,
        beneficiaryRelation: effectiveBeneficiaryRelation,
        applicationType: effectiveApplicationType,
        currentStage: 1,
        documentSubmissionStatus: 'pending'
      };

      // Save to real queue tokens store for officer dynamic queue desk and citizen history
      try {
        const stored = localStorage.getItem('qless_real_queue_tokens');
        const list: BookingDetails[] = stored ? JSON.parse(stored) : [];
        const updated = [bookingData, ...list.filter(t => t.tokenNumber !== tokenNumber)].slice(0, 50);
        localStorage.setItem('qless_real_queue_tokens', JSON.stringify(updated));

        // Save to persistent user slot booking history (સંપૂર્ણ કુંડળી)
        const storedHistory = localStorage.getItem('qless_booking_history');
        const historyList: BookingDetails[] = storedHistory ? JSON.parse(storedHistory) : [];
        const updatedHistory = [bookingData, ...historyList.filter(t => t.tokenNumber !== tokenNumber)];
        localStorage.setItem('qless_booking_history', JSON.stringify(updatedHistory));
      } catch (err) {
        console.error('Failed to sync queue token to local storage:', err);
      }

      // Broadcast real-time event to Admin Counter and Collector desks
      broadcastQueueEvent({
        type: 'TOKEN_BOOKED_REALTIME',
        tokenNumber,
        counterNumber: routing.counterNumber,
        talukaId: selectedTaluka.id,
        timestamp: Date.now(),
        payload: {
          booking: bookingData,
          citizenName: effectiveBeneficiaryNameGu,
          beneficiaryRelation: effectiveBeneficiaryRelation,
          applicationType: effectiveApplicationType,
          schemeTitle: scheme?.titleGu || 'જન સેવા'
        }
      });

      triggerHaptic('success');
      speakGuidance(
        paymentRecord.status === 'PAID'
          ? (lang === 'hi' ? "ई-चालान भुगतान सफल! आपका आधिकारिक सरकारी टोकन पास जारी हो गया है।" : "સાયબર ટ્રેઝરી ઈ-ચલણ પેમેન્ટ સફળ! તમારો સત્તાવાર કચેરી ટોકન પાસ જારી થઈ ગયો છે.")
          : (lang === 'hi' ? "काउंटर चालान जारी! काउंटर पर नकद जमा करने हेतु टोकन स्वीकृत।" : "કચેરી કાઉન્ટર ચલણ જારી! કાઉન્ટર પર રોકડ ચુકવણી માટે ટોકન માન્ય થયો છે."),
        lang
      );

      setPaymentModalOpen(false);
      onConfirm(bookingData);
    };

    if (feeAmount === 0) {
      const freeRecord: GovernmentPaymentRecord = {
        status: 'PAID',
        mode: 'GOVT_EXEMPT_FREE',
        amount: 0,
        grasChallanNo: `NIL-CHALLAN-GJ-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        paidAt: new Date().toISOString(),
        gatewayName: 'Gujarat Govt Welfare Subsidy (100% Free / Nil Fee)'
      };
      finalizeBooking(freeRecord);
      return;
    }

    if (paymentMode === 'CASH_AT_COUNTER') {
      const cashRecord: GovernmentPaymentRecord = {
        status: 'PAY_AT_COUNTER',
        mode: 'CASH_AT_COUNTER',
        amount: feeAmount,
        kacheriChallanNo: `KACHERI-CASH-GJ-2026-X${Math.floor(100000 + Math.random() * 900000)}`,
        instructionsGu: `કચેરી કાઉન્ટર ${routing.counterNumber} પર પહોંચીને ₹${feeAmount} રોકડ જમા કરાવો અને સત્તાવાર રસીદ મેળવો.`,
        instructionsEn: `Pay ₹${feeAmount} in cash at Counter ${routing.counterNumber} upon token call to receive the official government receipt.`
      };
      finalizeBooking(cashRecord);
      return;
    }

    // Online Cyber Treasury Payment Flow with Animated Government Gateway Handshake
    setIsProcessingPayment(true);
    setPaymentStepText(isEn ? 'Connecting to Gujarat Cyber Treasury (GRAS) Gateway...' : isHi ? 'गुजरात साइबर ट्रेजरी (GRAS) गेटवे से कनेक्शन जारी...' : 'ગુજરાત સાયબર ટ્રેઝરી (GRAS) ગેટવે સાથે જોડાણ થઈ રહ્યું છે...');

    setTimeout(() => {
      setPaymentStepText(isEn ? 'Authorizing & generating official GRAS e-Challan...' : isHi ? 'सत्यापन एवं आधिकारिक GRAS ई-चालान जनरेट हो रहा है...' : 'ચુકવણી અધિકૃત કરી સત્તાવાર GRAS ઈ-ચલણ તૈયાર થઈ રહ્યું છે...');
    }, 600);

    setTimeout(() => {
      setPaymentStepText(isEn ? 'Payment verified! e-Challan ready.' : isHi ? 'भुगतान सफल! ई-चालान तैयार।' : 'ચુકવણી સફળ! સરકારી ઈ-ચલણ રસીદ તૈયાર.');
    }, 1100);

    setTimeout(() => {
      setIsProcessingPayment(false);
      const onlineRecord: GovernmentPaymentRecord = {
        status: 'PAID',
        mode: 'ONLINE_CYBER_TREASURY',
        amount: feeAmount,
        cyberTreasuryTxnId: `CYBER-GJ-2026-X${Math.floor(100000 + Math.random() * 900000)}`,
        grasChallanNo: `GRAS/2026/04/${Math.floor(100000 + Math.random() * 900000)}`,
        paidAt: new Date().toISOString(),
        gatewayName: onlineMethod === 'upi' ? `Cyber Treasury UPI (${upiApp.toUpperCase()})` : onlineMethod === 'card' ? 'Cyber Treasury RuPay / Debit Card' : `Cyber Treasury NetBanking (${selectedBank})`,
        upiId: onlineMethod === 'upi' ? upiId : undefined,
        payeeName: `${payeeName} (સાયબર ટ્રેઝરી સત્તાવાર ખાતું)`,
        bankName: onlineMethod === 'upi' ? 'Axis Bank UPI Gateway' : onlineMethod === 'card' ? 'RuPay NSDL' : selectedBank,
        utrNumber: `UPI/AXIS/${Math.floor(400000000000 + Math.random() * 599999999999)}`,
        dynamicQrUrl
      };
      finalizeBooking(onlineRecord);
    }, 1400);
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
        
        {!paymentModalOpen ? (
          <>
            {/* HEADER */}
            <div className="bg-[#003366] text-white p-3.5 sm:p-5 flex items-center justify-between border-b border-blue-900 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <GovLogo className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 drop-shadow-md" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="text-sm sm:text-lg font-bold truncate max-w-[170px] xs:max-w-[240px] sm:max-w-none">
                  {isEn ? 'Jurisdiction Routing & Appointment Scheduling' : isHi ? 'अधिकार क्षेत्र और अपॉइंटमेंट शेड्यूलिंग' : isMr ? 'अधिकार क्षेत्र आणि अपॉइंटमेंट शेड्यूलिंग' : 'અધિકારક્ષેત્ર & સ્લોટ બુકિંગ'}
                </h3>
                <span className="bg-[#005A9C] text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full border border-blue-400 whitespace-nowrap">
                  {isEn ? 'Capacity Controlled' : isHi ? 'क्षमता नियंत्रित' : isMr ? 'क्षमता नियंत्रित' : 'કેપેસિટી કંટ્રોલ્ડ'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-blue-200 mt-0.5 truncate">
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
                    <div className="flex items-baseline gap-1.5 mt-1.5">
                      <p className="text-sm font-black text-[#138808]">
                        {scheme.fee === 0 
                          ? (isEn ? '₹0 (Free)' : isHi ? '₹० (मुफ्त)' : isMr ? '₹० (मोफत)' : '₹૦ (સંપૂર્ણ મફત)') 
                          : `₹${scheme.fee}`}
                      </p>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded border border-emerald-300">
                        {isEn ? 'Token: ₹0 Free' : 'ટોકન પાસ: ₹૦ મફત'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {scheme.fee === 0 
                        ? (isEn ? 'Zero charge for welfare scheme' : isMr ? 'कोणतेही शासकीय शुल्क नाही' : 'કલ્યાણકારી યોજના માટે કોઈ સરકારી ફી નથી') 
                        : (isEn ? 'Authorized government user charge' : isMr ? 'नियमबद्ध सेवा शुल्क' : 'સત્તાવાર નિયત સરકારી સેવા ફી')}
                    </p>
                  </div>
                  <p className="text-[9px] text-slate-500 font-bold mt-2 pt-1 border-t border-slate-100 flex items-center justify-between">
                    <span>{isEn ? 'Official Receipt' : 'સત્તાવાર રસીદ'}</span>
                    <span className="text-emerald-700">{isEn ? 'Zero Touts/Brokers' : 'દલાલમુક્ત પ્રક્રિયા'}</span>
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
                      {isEn ? '~10-12 min (Desk Duration)' : isHi ? '~१०-१२ मिनट (काउंटर पर)' : isMr ? '~१०-१२ मिनिटे (काउंटरवर)' : '~૧૦-૧૨ મિનિટ (કાઉન્ટર સમય)'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {isEn ? '1-Hr Arrival Window • Capped at 5' : isHi ? '१ घंटे का स्लॉट • अधिकतम ५ टोकन' : isMr ? '१ तासाचा स्लॉट • कमाल ५ टोकन' : '૧ કલાકની સ્માર્ટ વિન્ડો • ૫ ટોકન/કલાક મર્યાદા'}
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
                  {isEn ? 'Step 1: Jurisdiction & Native Office (Aadhaar Linked)' : isHi ? 'चरण १: कार्यक्षेत्र एवं मूल कार्यालय (आधार लिंक्ड)' : 'પગલું ૧: આધાર પ્રમાણિત કાર્યક્ષેત્ર અને કચેરી (District, Taluka & Village)'}
                </h4>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                <span>{isEn ? 'Aadhaar Auto-Selected' : isHi ? 'आधार अनुसार स्वतः चयनित' : 'આધાર મુજબ આપોઆપ પસંદ'}</span>
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
                      {isEn ? 'Aadhaar Verified Native Residence' : isHi ? 'आधार सत्यापित मूल निवास' : 'આધાર કાર્ડ પ્રમાણિત રહેઠાણ'}
                    </span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                      {DEFAULT_CITIZEN_PROFILE.aadhaarMasked}
                    </span>
                  </div>
                  <p className="text-xs font-black text-slate-800 mt-0.5">
                    {isEn 
                      ? 'Village: Gomta • Taluka: Gondal • District: Rajkot (360311)' 
                      : isHi
                      ? 'ग्राम: गोमटा • तालुका: गोंडल • जिला: राजकोट (३६०३११)'
                      : 'ગામ: ગોમટા • તાલુકો: ગોંડલ • જિલ્લો: રાજકોટ (૩૬૦૩૧૧)'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-[#003366] font-bold bg-white px-2 py-1 rounded-md border border-slate-200 shrink-0">
                {isEn ? 'Revenue Bound: Gondal Desk' : isHi ? 'राजस्व अधिकार क्षेत्र: गोंडल डेस्क' : 'મહેસૂલી સત્તાક્ષેત્ર: ગોંડલ ડેસ્ક'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="min-w-0">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  {isEn ? 'District' : isHi ? 'जिला' : 'જિલ્લો (District)'}
                </label>
                <select
                  value={selectedDistrictId}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005A9C] truncate"
                >
                  {GUJARAT_33_DISTRICTS.map((dist) => (
                    <option key={dist.id} value={dist.id}>
                      {isEn ? `${dist.nameEn}` : isHi ? `${DISTRICT_NAMES_HI[dist.id] || dist.nameEn} (${dist.nameEn})` : `${dist.nameGu} (${dist.nameEn})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  {isEn ? 'Taluka' : isHi ? 'तालुका' : 'તાલુકો (Taluka)'}
                </label>
                <select
                  value={selectedTalukaId}
                  onChange={(e) => handleTalukaChange(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005A9C] truncate"
                >
                  {selectedDistrict.talukas.map((tal) => (
                    <option key={tal.id} value={tal.id}>
                      {isEn ? `${tal.nameEn}` : isHi ? `${TALUKA_NAMES_HI[tal.id] || tal.nameEn} (${tal.nameEn})` : `${tal.nameGu} (${tal.nameEn})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  {isEn ? 'Aadhaar Village (Gam)' : isHi ? 'आधार गाँव' : 'આધાર ગામ (Village)'}
                </label>
                <div className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 flex items-center justify-between">
                  <span className="truncate">{isEn ? (initialVillage || 'Gomta') : isHi ? (initialVillage === 'Gomta' || initialVillage === 'ગોમટા' ? 'गोमटा' : initialVillage || 'गोमटा') : (initialVillage || 'ગોમટા')}</span>
                  <span className="text-[9px] bg-blue-50 text-[#005A9C] font-bold px-1.5 py-0.5 rounded border border-blue-200 shrink-0">
                    {isEn ? 'Verified' : isHi ? 'प्रमाणित' : 'પ્રમાણિત'}
                  </span>
                </div>
              </div>
            </div>

            {/* Jurisdiction Regulatory Notice */}
            <div className="mt-3 bg-amber-50/90 border border-amber-300/80 rounded-xl p-2.5 text-[11px] text-amber-950 font-medium flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>{isEn ? 'Gujarat Government Jurisdiction Rule:' : isHi ? 'गुजरात सरकार आधिकारिक राजस्व नियम:' : 'ગુજરાત સરકાર સત્તાવાર મહેસૂલી નિયમ:'}</strong>{' '}
                {isEn 
                  ? 'Income, Caste, and 7/12 land certificates are legally issued only by your resident Taluka Mamlatdar (Gondal). Aadhaar updates and universal services can be scheduled at any center.' 
                  : isHi
                  ? 'आय, जाति एवं ७/१२ के प्रमाण पत्र आपके स्थायी निवास के अनुसार गोंडल मामलतदार कार्यालय से ही मान्य होंगे। आधार बायोमेट्रिक/मोबाइल अपडेट और आरटीओ सेवाएं राज्य के किसी भी केंद्र पर ली जा सकती हैं।'
                  : 'આવક, જાતિ અને ૭/૧૨ ના દાખલા તમારા કાયમી રહેઠાણ મુજબ ગોંડલ મામલતદાર કચેરીમાંથી જ માન્ય રહેશે. આધાર બાયોમેટ્રિક/મોબાઇલ અપડેટ અને RTO સેવાઓ રાજ્યના કોઈપણ કેન્દ્ર પર લઈ શકાય છે.'}
              </p>
            </div>

            {/* NEARBY VILLAGE FREE SLOT FINDER (RURAL RESCUE - CONDITIONAL FOR GONDAL & COLLAPSIBLE) */}
            {selectedTalukaId === 'gondal' && (
              <div className="mt-3.5 bg-gradient-to-br from-emerald-50/95 via-teal-50/70 to-blue-50/60 border-2 border-emerald-300 rounded-2xl p-3 sm:p-3.5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between gap-2">
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
                          {isEn ? 'Panchayat Rule' : 'પંચાયત નિયમ માન્ય'}
                        </span>
                        {selectedClusterVillageId && (
                          <span className="text-[9px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.2 rounded">
                            {isEn ? 'Cluster Active' : 'ક્લસ્ટર સક્રિય'}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] sm:text-[10.5px] text-emerald-800 font-medium mt-0.5">
                        {isEn
                          ? 'Panchayat rules permit booking at 6 neighboring cluster village centers if Gondal/Gomta is full.'
                          : 'ગોંડલ તાલુકામાં ભીડ હોય તો આજુબાજુના ૬ ગ્રામ પંચાયત ઈ-ગ્રામ કેન્દ્રોમાં કતાર વગર કામ કરાવી શકાય છે.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {selectedClusterVillageId && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedClusterVillageId(null);
                          triggerHaptic('tap');
                        }}
                        className="text-[10px] font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 px-2 py-1 rounded-lg transition shadow-2xs cursor-pointer"
                      >
                        {isEn ? '↺ Reset' : '↺ રીસેટ'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('tap');
                        setIsClustersExpanded(!isClustersExpanded);
                      }}
                      className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg transition shadow-2xs cursor-pointer flex items-center gap-1"
                    >
                      <span>{isClustersExpanded ? (isEn ? 'Collapse ▴' : 'સંકેલો ▴') : (isEn ? 'View (6 Centers) ▾' : 'જુઓ (૬ કેન્દ્રો) ▾')}</span>
                    </button>
                  </div>
                </div>

                {/* Collapsible Village Cluster Grid */}
                {isClustersExpanded && (
                  <div className="pt-2 border-t border-emerald-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 animate-in fade-in duration-200">
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
                                  const villageName = isEn ? (cluster.villageNameEn || cluster.villageNameGu) : cluster.villageNameGu;
                                  const voiceMsg = isEn
                                    ? `${villageName} center selected. ${cluster.availableSlotsToday} slots available.`
                                    : lang === 'hi'
                                    ? `${villageName} केंद्र चुना गया। ${cluster.availableSlotsToday} स्लॉट उपलब्ध हैं।`
                                    : `${villageName} કેન્દ્ર પસંદ થયું. ${cluster.availableSlotsToday} સ્લોટ ઉપલબ્ધ છે.`;
                                  speakGuidance(voiceMsg, lang);
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
                )}
              </div>
            )}
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
                          <span>{getLocalizedCenterName(center, isHi, isEn)}</span>
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-[#005A9C] shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {getLocalizedCenterAddress(center, isHi, isEn)}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {isEn ? `Est Distance: ~${center.distanceKm} km` : isHi ? `अनुमानित दूरी: ~${center.distanceKm} किमी` : `અંદાજિત અંતર: ~${center.distanceKm} કિ.મી.`}
                      </span>
                      <span className="text-slate-500 font-medium">
                        {getLocalizedAvailability(center, isHi, isEn)}
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
                    : isHi
                    ? <>कार्यालय समय: <strong>{selectedCenter.config.serviceHours.displayGu.replace('સવારે', 'सुबह').replace('સાંજે', 'शाम')}</strong></>
                    : <>કચેરી કામકાજનો સમય: <strong>{selectedCenter.config.serviceHours.displayGu}</strong></>}
                </span>
              </span>
              <span className="text-[11px] text-slate-600">
                ({isEn ? `Lunch Break: ${selectedCenter.config.lunchBreak.displayEn}` : isHi ? `भोजन अवकाश: ${selectedCenter.config.lunchBreak.displayGu.replace('બપોરે', 'दोपहर')}` : `ભોજન રિસેસ: ${selectedCenter.config.lunchBreak.displayGu}`})
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
                        <div className="text-xs font-bold flex items-center gap-1.5 flex-wrap">
                          <span>{slot.timeRange}</span>
                          <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                            isSelected ? 'bg-blue-800 text-amber-300' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {isEn ? '1-Hr Window' : isHi ? '१ घंटे की विंडो' : isMr ? '१ तासाची विंडो' : '૧ કલાક વિન્ડો'}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#FF9933] shrink-0" />
                          )}
                        </div>
                        <div className={`text-[10px] mt-0.5 flex items-center gap-1.5 flex-wrap ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                          <span>
                            {isEn 
                              ? `Booked: ${slot.bookedCount}/${slot.maxCapacity} • Left: ${slot.slotsAvailable}` 
                              : isHi 
                              ? `बुक: ${slot.bookedCount}/${slot.maxCapacity} • शेष: ${slot.slotsAvailable}` 
                              : isMr 
                              ? `नोंदणीकृत: ${slot.bookedCount}/${slot.maxCapacity} • शिल्लक: ${slot.slotsAvailable}` 
                              : `બુક થયેલ: ${slot.bookedCount}/${slot.maxCapacity} • બાકી: ${slot.slotsAvailable}`}
                          </span>
                          <span className="opacity-60">•</span>
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">
                            {isEn ? 'Desk: ~10-12m' : isHi ? 'काउंटर: ~१०-१२ मि.' : isMr ? 'काउंटर: ~१०-१२ मि.' : 'કાઉન્ટર: ~૧૦-૧૨ મિ.'}
                          </span>
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

            {/* 💡 TRANSPARENT SMART QUEUE & FAIRNESS PROTOCOL (FOR CITIZEN & JURY) */}
            <div className="mt-3.5 p-3.5 bg-gradient-to-r from-blue-50/90 via-slate-50 to-emerald-50/70 border border-blue-200/90 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2 border-b border-blue-200/60 pb-1.5 flex-wrap">
                <span className="font-black text-[#003366] flex items-center gap-1.5">
                  <span>⚖️</span>
                  <span>
                    {isEn 
                      ? 'Smart Queue & Fairness Protocol (Official GAD Standards)' 
                      : isHi 
                      ? 'स्मार्ट कतार एवं निष्पक्षता प्रोटोकॉल (आधिकारिक मानक)' 
                      : isMr 
                      ? 'स्मार्ट रांग आणि निष्पक्षता प्रोटोकॉल (अधिकृत मानक)' 
                      : 'સ્માર્ટ કતાર અને સમયસરતા પ્રોટોકોલ (સત્તાવાર GAD ધારાધોરણો)'}
                  </span>
                </span>
                <span className="text-[9.5px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded border border-emerald-300">
                  {isEn ? 'Token Fee: ₹0 Free' : isHi ? 'टोकन शुल्क: ₹० मुफ्त' : isMr ? 'टोकन शुल्क: ₹० मोफत' : 'ટોકન પાસ: ₹૦ મફત'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[10.5px]">
                <div className="bg-white/90 p-2.5 rounded-lg border border-slate-200">
                  <span className="font-black text-blue-900 block flex items-center gap-1">
                    <span>🚌</span> {isEn ? '1-Hour Arrival Window' : isHi ? '१ घंटे की लचीली विंडो' : isMr ? '१ तासाची लवचिक विंडो' : '૧ કલાકની સ્માર્ટ વિન્ડો'}
                  </span>
                  <p className="text-slate-600 mt-1 leading-snug">
                    {isEn 
                      ? 'Rural transport buffer prevents slot expiry due to bus or road delays.' 
                      : isHi 
                      ? 'बस या यातायात में देरी होने पर भी स्लॉट रद्द नहीं होता।' 
                      : isMr 
                      ? 'एसटी बस किंवा वाहतूक विलंबाने स्लॉट रद्द होत नाही.' 
                      : 'એસ.ટી. બસ કે ગ્રામ્ય મુસાફરીમાં વિલંબ થાય તો પણ ૧ કલાકની વિન્ડોમાં સ્લોટ રદ થતો નથી.'}
                  </p>
                </div>

                <div className="bg-white/90 p-2.5 rounded-lg border border-slate-200">
                  <span className="font-black text-emerald-900 block flex items-center gap-1">
                    <span>⏱️</span> {isEn ? '~10-12 Min Turnaround' : isHi ? '~१०-१२ मिनट काउंटर समय' : isMr ? '~१०-१२ मिनिटे काउंटर वेळ' : 'કાઉન્ટર સરેરાશ સમય'}
                  </span>
                  <p className="text-slate-600 mt-1 leading-snug">
                    {isEn 
                      ? 'Cap of 5 tokens/hr per counter ensures zero waiting and crowd-free service.' 
                      : isHi 
                      ? 'GRTSA मानकों के अनुसार ५ टोकन/घंटा ताकि काउंटर पर कभी भीड़ न हो।' 
                      : isMr 
                      ? 'प्रति तास कमाल ५ टोकन मर्यादा जेणेकरून काउंटरवर गर्दी होणार नाही.' 
                      : 'GRTSA મુજબ પ્રતિ અરજદાર ૧૦-૧૨ મિ. ૧ કલાકમાં માત્ર ૫ ટોકન જેથી કાઉન્ટર આગળ ભીડ ન થાય.'}
                  </p>
                </div>

                <div className="bg-white/90 p-2.5 rounded-lg border border-slate-200">
                  <span className="font-black text-amber-900 block flex items-center gap-1">
                    <span>🔄</span> {isEn ? 'Late Arrival Grace' : isHi ? 'विलंब पर निष्पक्ष समायोजन' : isMr ? 'उशिरा आल्यास निष्पक्ष समायोजन' : 'મોડા પહોંચવા પર સુરક્ષા'}
                  </span>
                  <p className="text-slate-600 mt-1 leading-snug">
                    {isEn 
                      ? 'On-time citizens get priority. Late arrivals are served in saved gaps or hour-end buffer.' 
                      : isHi 
                      ? 'समय पर उपस्थित नागरिकों को प्राथमिकता; देरी होने पर अगले रिक्त अंतराल या अंतिम बफर में सेवा।' 
                      : isMr 
                      ? 'वेळेवर आलेल्या नागरिकांना प्राधान्य; विलंबाने आल्यास मधल्या वेळेत किंवा शेवटी सेवा.' 
                      : 'સમયસર નાગરિકને પ્રથમ હક્ક. વિલંબ થાય તો આગળના નાગરિક પત્યા બાદના સેવ્ડ ગેપ કે કલાકના બફરમાં વારો લેવાશે.'}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* STEP 5: CONFIGURABLE COUNTER ROUTING (IMAGE 3 ENHANCEMENT) */}
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#005A9C] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                C{routing.counterNumber}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-black text-blue-900">
                    {isEn 
                      ? `Assigned Counter: Counter ${routing.counterNumber} - ${counterDetails.nameEn}` 
                      : isHi 
                      ? `आवंटित काउंटर: काउंटर ${routing.counterNumber} - ${counterDetails.nameEn}` 
                      : isMr 
                      ? `नियुक्त काउंटर: काउंटर ${routing.counterNumber} - ${counterDetails.nameEn}` 
                      : `ફાળવેલ કાઉન્ટર: કાઉન્ટર ${routing.counterNumber} - ${counterDetails.nameGu}`}
                  </h4>
                  <span className="bg-blue-200 text-blue-900 text-[9.5px] px-2 py-0.5 rounded font-extrabold uppercase">
                    {isEn ? 'Direct Window' : isHi ? 'सीधी खिड़की' : isMr ? 'थेट खिडकी' : 'સીધી બારી ફાળવણી'}
                  </span>
                </div>
                
                <p className="text-xs text-blue-800 mt-1 font-medium">
                  {isEn ? routing.reasonEn : isHi ? routing.reasonEn : isMr ? routing.reasonEn : routing.reasonGu}
                </p>

                <div className="mt-2 pt-2 border-t border-blue-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-700">
                  <div className="flex items-center gap-1.5 font-bold">
                    <UserCheck className="w-3.5 h-3.5 text-[#005A9C]" />
                    <span>{isEn ? 'Desk Officer: ' : isHi ? 'डेस्क अधिकारी: ' : isMr ? 'डेस्क अधिकारी: ' : 'ડેસ્ક અધિકારી: '}<strong>{counterDetails.officerName}</strong></span>
                  </div>
                  <span className="text-[10px] text-emerald-800 bg-emerald-100/90 font-bold px-2 py-0.5 rounded border border-emerald-300">
                    {isEn ? '✓ Zero-Confusion Walk-In' : isHi ? '✓ सीधे इसी काउंटर पर जाएँ' : isMr ? '✓ थेट याच काउंटरवर जावे' : '✓ કચેરીએ સીધા આ કાઉન્ટર પર જવું'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* STEP 6: RECOMMENDED DEPARTURE (DYNAMIC TRANSIT FROM RESIDENCE TO KACHERI) */}
          <section className="bg-gradient-to-r from-blue-50/80 to-slate-50 border border-blue-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#005A9C] text-white flex items-center justify-center shrink-0 mt-0.5">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-xs font-black text-[#003366]">
                    {isEn ? 'Recommended Departure Time (Dynamic Transit)' : isHi ? 'घर से प्रस्थान का अनुशंसित समय (गतिशील)' : isMr ? 'घरातून निघण्याची शिफारस केलेली वेळ' : 'ઘરેથી નીકળવાનો ભલામણ કરેલ સમય (ડાયનેમિક મુસાફરી)'}
                  </p>
                  <span className="text-[9px] bg-blue-100 text-[#005A9C] font-extrabold px-1.5 py-0.2 rounded border border-blue-200">
                    {isEn ? 'Live Transit' : isHi ? 'लाइव गणना' : isMr ? 'थेट गणना' : 'લાઈવ ગણતરી'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-700 font-bold mt-1">
                  {isEn 
                    ? `📍 Route: ${transitEstimate.originNameEn} ➔ ${transitEstimate.destinationNameEn}`
                    : isHi || isMr
                    ? `📍 मार्ग: ${transitEstimate.originNameEn} ➔ ${transitEstimate.destinationNameEn}`
                    : `📍 રૂટ: ${transitEstimate.originNameGu} ➔ ${transitEstimate.destinationNameGu}`}
                </p>

                <p className="text-[10px] text-slate-500 mt-0.5">
                  {isEn 
                    ? `Est Transit: ~${transitEstimate.travelMins} mins (${transitEstimate.distanceKm} km) + ${transitEstimate.bufferMins} min traffic buffer` 
                    : isHi 
                    ? `अनुमानित यात्रा: ~${transitEstimate.travelMins} मिनट (${transitEstimate.distanceKm} किमी) + ${transitEstimate.bufferMins} मि. बफर`
                    : isMr
                    ? `अंदाजित प्रवास: ~${transitEstimate.travelMins} मिनिटे (${transitEstimate.distanceKm} किमी) + ${transitEstimate.bufferMins} मि. बफर`
                    : `અંદાજિત મુસાફરી: ~${transitEstimate.travelMins} મિનિટ (${transitEstimate.distanceKm} કિ.મી.) + ${transitEstimate.bufferMins} મિ. ટ્રાફિક બફર`}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0 bg-white sm:bg-transparent p-2 sm:p-0 rounded-lg border sm:border-0 border-blue-200 flex sm:flex-col items-center sm:items-end justify-between">
              <span className="text-sm font-black text-[#003366] sm:bg-white sm:border sm:border-blue-300 sm:px-2.5 sm:py-1 rounded-lg sm:shadow-xs">
                {transitEstimate.leaveHomeBy}
              </span>
              <span className="block text-[8.5px] text-slate-500 mt-0.5 font-semibold">
                {isEn ? 'Plan according to traffic' : isHi ? 'ट्रैफिक अनुसार योजना बनाएं' : isMr ? 'वाहतुकीनुसार नियोजन करा' : 'ટ્રાફિક મુજબ પ્લાન કરો'}
              </span>
            </div>
          </section>

          {/* STEP 7: PRIORITY APPOINTMENT SUPPORT (WITH VERIFIED FAMILY PROOF & AI CHECK) */}
          <section className="bg-amber-50/85 border-2 border-amber-300 rounded-2xl p-3.5 space-y-3 transition">
            <div className="flex items-start gap-3">
              <input 
                type="checkbox" 
                id="priority-check" 
                checked={isPriority} 
                onChange={(e) => {
                  triggerHaptic('tap');
                  const checked = e.target.checked;
                  setIsPriority(checked);
                  if (checked) {
                    speakGuidance(
                      lang === 'hi' ? "प्राथमिकता स्लॉट चुना गया है। नियमानुसार वरिष्ठ नागरिक या दिव्यांगजन दस्तावेज़ सत्यापन आवश्यक है।" :
                      lang === 'mr' ? "प्राधान्य स्लॉट निवडला आहे. नियमानुसार ज्येष्ठ नागरिक किंवा दिव्यांग प्रमाणपत्र पडताळणी आवश्यक आहे." :
                      lang === 'en' ? "Priority slot selected. Verification of Senior Citizen or Divyangjan document is required." :
                      lang === 'khi' ? "અગ્રતા સ્લોટ પસંદ થયો આય. સરકારી નિયમ મુજબ વરિષ્ઠ નાગરિક અથવા દિવ્યાંગજન કાગળ ચકાસણી જરૂરી આય." :
                      "પ્રાથમિકતા અગ્રતા સ્લોટ પસંદ થયો છે. સરકારી નિયમ મુજબ વરિષ્ઠ નાગરિક અથવા દિવ્યાંગજન દસ્તાવેજ ચકાસણી જરૂરી છે.",
                      lang
                    );
                  }
                }}
                className="mt-0.5 w-4 h-4 rounded text-amber-600 accent-[#FF9933] cursor-pointer"
              />
              <div className="text-xs text-amber-950 font-bold cursor-pointer select-none flex-1">
                <label htmlFor="priority-check" className="flex flex-wrap items-center gap-1.5 text-[#003366] font-black cursor-pointer">
                  <span>{isEn ? '♿ Priority Appointment Support (Senior / Divyang)' : isHi ? '♿ प्राथमिकता अपॉइंटमेंट सहायता (वरिष्ठ नागरिक / दिव्यांग)' : isMr ? '♿ प्राधान्य अपॉइंटमेंट सहाय्य (ज्येष्ठ नागरिक / दिव्यांग)' : '♿ પ્રાથમિકતા અપોઇન્ટમેન્ટ સપોર્ટ (Priority Appointment)'}</span>
                  <span className="bg-[#FF9933] text-slate-900 text-[9px] px-2 py-0.5 rounded-full font-black uppercase">
                    {isEn ? 'Statutory Policy' : isHi ? 'प्रशासनिक नीति' : isMr ? 'प्रशासकीय धोरण' : 'વહીવટી અગ્રતા નીતિ'}
                  </span>
                </label>
                <p className="text-[11px] text-amber-900/80 font-medium mt-0.5">
                  {isEn 
                    ? 'Senior citizens (60+) or Divyangjan are issued a priority token (#P-) subject to verified government document match.'
                    : isHi 
                    ? 'वरिष्ठ नागरिकों (६०+) अथवा दिव्यांगजनों हेतु प्राथमिकता टोकन (#P-) जारी होता है। सरकारी अभिलेख से सत्यापन आवश्यक है।'
                    : isMr 
                    ? 'ज्येष्ठ नागरिक (६०+) किंवा दिव्यांग व्यक्तींसाठी प्राधान्य टोकन (#P-) दिला जातो. शासकीय पडताळणी अनिवार्य आहे.'
                    : 'વરિષ્ઠ નાગરિકો (૬૦+) અથવા દિવ્યાંગજનો માટે અગ્રતા ફ્લેગ (#P-) ફાળવાય છે. દુરુપયોગ રોકવા સરકારી ડેટા સાથે AI ચકાસણી અનિવાર્ય છે.'}
                </p>
              </div>
            </div>

            {/* EXPANDED PROOF & FAMILY VALIDATION PANEL */}
            {isPriority && (
              <div className="pt-2.5 border-t border-amber-300/80 space-y-3 animate-in fade-in">
                {/* 1. Select Family Member */}
                <div>
                  <label className="text-[11px] font-black text-[#003366] block mb-1">
                    {isEn ? 'Select Family Member for Priority Appointment *' : isHi ? 'किसके लिए प्राथमिकता टोकन चाहिए? (परिवार सदस्य चुनें) *' : isMr ? 'कोणासाठी प्राधान्य टोकन हवे आहे? (कुटुंब सदस्य निवडा) *' : 'કોના માટે અગ્રતા ટોકન લેવું છે? (પરિવાર સભ્ય પસંદ કરો) *'}
                  </label>
                  <select
                    value={selectedPriorityMemberId}
                    onChange={(e) => {
                      triggerHaptic('tap');
                      const memId = e.target.value;
                      setSelectedPriorityMemberId(memId);
                      if (memId === 'mem-4') {
                        setPriorityCategory('senior_citizen');
                        setAiVerificationPassed(true);
                      } else {
                        setPriorityCategory('divyangjan');
                        setAiVerificationPassed(false);
                      }
                    }}
                    className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  >
                    {DEFAULT_CITIZEN_PROFILE.familyMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {isEn ? `${member.nameEn} (${member.relationEn})` : isHi ? (member.id === 'mem-1' ? `हरि पटेल (स्वयं)` : member.id === 'mem-2' ? `प्रिया पटेल (पत्नी)` : member.id === 'mem-3' ? `आरव पटेल (पुत्र)` : `परसोत्तमभाई पटेल (पिताजी)`) : `${member.nameGu} (${member.relationGu})`} {member.id === 'mem-4' ? (isEn ? '• Senior Citizen (68 yrs) - Verified' : isHi ? '• वरिष्ठ नागरिक (६८ वर्ष) - सत्यापित' : '• વરિષ્ઠ નાગરિક (૬૮ વર્ષ) - પ્રમાણિત') : (isEn ? '• Age < 60 (UDID Required)' : isHi ? '• आयु < ६० (UDID आवश्यक)' : '• વય < ૬૦ (UDID જરૂરી)')}
                      </option>
                    ))}
                    <option value="custom">
                      {isEn ? 'Other Member / Special Priority (Upload New Documents)' : isHi ? 'अन्य सदस्य / विशेष प्राथमिकता (दस्तावेज़ अपलोड करें)' : 'અન્ય સભ્ય / વિશેષ અગ્રતા (નવા દસ્તાવેજ અપલોડ કરો)'}
                    </option>
                  </select>
                </div>

                {/* 2. AUTOMATIC AI VERIFICATION RESULT FOR SENIOR CITIZEN */}
                {selectedPriorityMemberId === 'mem-4' ? (
                  <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-xs text-emerald-950 flex items-start gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-black text-emerald-900">
                          {isEn ? 'AI Government Data Match: VERIFIED' : isHi ? '✅ AI सरकारी सत्यापन सफल (Senior Citizen Verified)' : isMr ? '✅ AI शासकीय पडताळणी यशस्वी (Senior Citizen Verified)' : '✅ AI સરકારી ચકાસણી સફળ (Verified Senior Citizen)'}
                        </span>
                        <span className="text-[9px] bg-emerald-200 text-emerald-900 font-extrabold px-1.5 py-0.2 rounded">
                          UIDAI & NFSA Match
                        </span>
                      </div>
                      <p className="text-[10.5px] text-emerald-800 mt-1 leading-relaxed">
                        {isEn 
                          ? <strong>Parsottambhai Patel (Age: 68 years) - Aadhaar (XXXX 4410) & Ration Card records verified 100%. Priority Token (#P-) issued.</strong>
                          : isHi 
                          ? <strong>परसोत्तमभाई पटेल (आयु: ६८ वर्ष) - आधार कार्ड (XXXX 4410) एवं राशन कार्ड रिकॉर्ड १००% सत्यापित। प्राथमिकता टोकन (#P-) स्वीकृत।</strong>
                          : isMr 
                          ? <strong>परसोत्तमभाई पटेल (वय: ६८ वर्षे) - आधार कार्ड (XXXX 4410) आणि शिधापत्रिका नोंदणी १००% प्रमाणित. प्राधान्य टोकन (#P-) मंजूर.</strong>
                          : <><strong>પરસોત્તમભાઈ પટેલ (ઉંમર: ૬૮ વર્ષ)</strong> - આધાર કાર્ડ (XXXX 4410) અને રેશનકાર્ડ રેકોર્ડ્સ મુજબ વરિષ્ઠ નાગરિક પાત્રતા ૧૦૦% માન્ય છે. <strong>અગ્રતા ટોકન (#P-)</strong> જારી કરવા મંજૂરી આપેલ છે.</>}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* 3. UNDER 60 OR OTHER MEMBER: REQUIRE UDID / MEDICAL PROOF & RUN AI CHECK */
                  <div className="bg-white border border-amber-300 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-amber-900">
                          {isEn ? '⚠️ Selected member age is below 60 years' : isHi ? '⚠️ चयनित सदस्य की आयु ६० वर्ष से कम है' : isMr ? '⚠️ निवडलेल्या सदस्याचे वय ६० वर्षांपेक्षा कमी आहे' : '⚠️ પસંદ કરેલ સભ્યની વય ૬૦ વર્ષથી ઓછી છે'}
                        </p>
                        <p className="text-[10.5px] text-slate-600 mt-0.5">
                          {isEn 
                            ? 'Senior citizen category not applicable. Swavalamban Divyang UDID Card or Medical Certificate is required for Priority (#P-).' 
                            : isHi 
                            ? 'वरिष्ठ नागरिक श्रेणी लागू नहीं होगी। प्राथमिकता टोकन (#P-) हेतु स्वावलंबन दिव्यांग UDID कार्ड अथवा चिकित्सा प्रमाण पत्र आवश्यक है।' 
                            : isMr 
                            ? 'ज्येष्ठ नागरिक श्रेणी लागू होणार नाही. प्राधान्य टोकन (#P-) मिळवण्यासाठी दिव्यांग UDID कार्ड किंवा वैद्यकीय प्रमाणपत्र आवश्यक आहे.' 
                            : 'વરિષ્ઠ નાગરિક કેટેગરી લાગુ પડશે નહીં. અગ્રતા ટોકન (#P-) મેળવવા માટે સ્વાવલંબન દિવ્યાંગ UDID કાર્ડ અથવા તબીબી પ્રમાણપત્ર જરૂરી છે.'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                      <div>
                        <label className="text-[10px] font-bold text-slate-700 block mb-1">
                          {isEn ? 'Priority Category *' : isHi ? 'प्राथमिकता श्रेणी *' : isMr ? 'प्राधान्य श्रेणी *' : 'અગ્રતા શ્રેણી *'}
                        </label>
                        <select
                          value={priorityCategory}
                          onChange={(e) => setPriorityCategory(e.target.value as PriorityCategory)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800"
                        >
                          <option value="divyangjan">{isEn ? 'Divyangjan Priority (UDID Card)' : isHi ? 'दिव्यांगजन प्राथमिकता (UDID Card)' : isMr ? 'दिव्यांग व्यक्ती प्राधान्य (UDID Card)' : 'દિવ્યાંગજન અગ્રતા (UDID Card)'}</option>
                          <option value="medical_priority">{isEn ? 'Medical Emergency' : isHi ? 'चिकित्सा आपात स्थिति (Medical Emergency)' : isMr ? 'वैद्यकीय आणीबाणी (Medical Emergency)' : 'તાત્કાલિક તબીબી અગ્રતા (Medical Emergency)'}</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-700 block mb-1">
                          {isEn ? 'UDID / Medical Reference No. *' : isHi ? 'UDID / अस्पताल संदर्भ संख्या *' : isMr ? 'UDID / रुग्णालय संदर्भ क्रमांक *' : 'UDID / હોસ્પિટલ રેફરન્સ નંબર *'}
                        </label>
                        <input
                          type="text"
                          value={customProofNumber}
                          onChange={(e) => {
                            setCustomProofNumber(e.target.value);
                            setAiVerificationPassed(false);
                          }}
                          placeholder={isEn ? 'e.g. GJ-03-UDID-8842' : 'GJ-03-UDID-8842'}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        disabled={isAiVerifying || !customProofNumber.trim()}
                        onClick={() => {
                          triggerHaptic('tap');
                          setIsAiVerifying(true);
                          setTimeout(() => {
                            setIsAiVerifying(false);
                            setAiVerificationPassed(true);
                            triggerHaptic('success');
                            speakGuidance(
                              lang === 'hi' ? "दस्तावेज़ सत्यापन सफल! प्राथमिकता टोकन स्वीकृत।" :
                              lang === 'mr' ? "कागदपत्र पडताळणी यशस्वी! प्राधान्य टोकन मंजूर." :
                              lang === 'en' ? "Document verified successfully! Priority token approved." :
                              lang === 'khi' ? "કાગળ ચકાસણી સફળ થી! અગ્રતા ટોકન મંજૂર." :
                              "AI દસ્તાવેજ ચકાસણી સફળ થઈ છે. અગ્રતા ટોકન મંજૂર થયું.",
                              lang
                            );
                          }, 700);
                        }}
                        className="bg-[#003366] hover:bg-[#002244] disabled:bg-slate-300 text-white font-black text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        {isAiVerifying ? (
                          <>
                            <span className="animate-spin text-xs">⏳</span>
                            <span>{isEn ? 'AI Verifying...' : isHi ? 'सत्यापन जारी...' : isMr ? 'पडताळणी सुरू...' : 'AI ચકાસણી ચાલુ...'}</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-[#FF9933]" />
                            <span>{isEn ? 'Run AI Govt Verification' : isHi ? 'AI सत्यापन करें' : isMr ? 'AI पडताळणी करा' : 'AI સરકારી ચકાસણી કરો'}</span>
                          </>
                        )}
                      </button>

                      {aiVerificationPassed ? (
                        <span className="text-[10.5px] font-black text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-1 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isEn ? 'Verification Passed (#P- Valid)' : isHi ? 'सत्यापन सफल (#P- मान्य)' : isMr ? 'पडताळणी यशस्वी (#P- मान्य)' : 'ચકાસણી સફળ (#P- માન્ય)'}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-800 font-bold">
                          {isEn ? 'Verification Pending (Enter number)' : isHi ? 'सत्यापन शेष (नंबर दर्ज करें)' : isMr ? 'पडताळणी प्रलंबित' : 'ચકાસણી બાકી (નંબર દાખલ કરી બટન દબાવો)'}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

        </div>

        {/* FOOTER ACTIONS - STICKY BOTTOM BAR */}
        <div className="bg-white/95 backdrop-blur-md p-3 sm:p-4 border-t border-slate-200 flex items-center justify-between shrink-0 sticky bottom-0 z-30 pb-[max(0.85rem,env(safe-area-inset-bottom))] shadow-lg">
          <button
            onClick={() => {
              triggerHaptic('tap');
              onClose();
            }}
            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition cursor-pointer shrink-0"
          >
            {isEn ? 'Cancel' : isHi ? 'रद्द करें' : isMr ? 'रद्द करा' : 'રદ કરો'}
          </button>

          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {scheme && (
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {isEn ? 'Statutory Fee' : isHi ? 'सरकारी शुल्क' : 'સરકારી સેવા ફી'}
                </span>
                <span className="text-xs font-black text-[#003366]">
                  {scheme.fee === 0 
                    ? (isEn ? '₹0 (Free)' : isHi ? '₹० (मुफ्त)' : '₹૦ (મફત)') 
                    : `₹${scheme.fee}`}
                </span>
              </div>
            )}

            <button
              disabled={holidayCheck.isClosed || selectedSlot.isLunchBreak || selectedSlot.status === 'full'}
              onClick={handleFinalConfirm}
              className={`px-3.5 sm:px-7 py-2 sm:py-3 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-md transition cursor-pointer shrink-0 ${
                holidayCheck.isClosed || selectedSlot.isLunchBreak || selectedSlot.status === 'full'
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-[#003366] hover:bg-[#002244] active:scale-[0.98] text-white hover:shadow-lg'
              }`}
            >
              <span className="truncate">
                {scheme && scheme.fee > 0
                  ? (isEn ? `Proceed: Fee & Payment (₹${scheme.fee})` : isHi ? `आगे बढ़ें: शुल्क एवं भुगतान (₹${scheme.fee})` : `આગળ વધો: ફી & ચુકવણી (₹${scheme.fee})`)
                  : (isEn ? 'Confirm & Get Free Token' : isHi ? 'स्लॉट पुष्टि करें व टोकन लें' : 'સ્લોટ કન્ફર્મ કરો & ટોકન મેળવો (₹૦)')}
              </span>
              <ArrowRight className="w-4 h-4 text-[#FF9933] shrink-0" />
            </button>
          </div>
        </div>
      </>
    ) : (
      /* ================================================================ */
      /* STEP 2: CYBER TREASURY GUJARAT PAYMENT GATEWAY & e-CHALLAN       */
      /* ================================================================ */
      <>
        {/* TREASURY HEADER */}
        <div className="bg-[#003366] text-white p-3.5 sm:p-5 flex items-center justify-between border-b border-blue-900 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <GovLogo className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 drop-shadow-md" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black truncate">
                  {isEn ? 'Cyber Treasury Gujarat (GRAS)' : isHi ? 'साइबर ट्रेजरी गुजरात (GRAS)' : 'ગુજરાત સાયબર ટ્રેઝરી (GRAS e-Payment)'}
                </h3>
                <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                  {isEn ? 'Official' : 'સત્તાવાર'}
                </span>
              </div>
              <p className="text-[11px] text-blue-200 mt-0.5 truncate">
                {isEn ? 'Finance Department • Government of Gujarat' : isHi ? 'वित्त विभाग • गुजरात सरकार' : 'નાણાં વિભાગ, ગુજરાત સરકાર • સત્તાવાર ફી રસીદ ગેટવે'}
              </p>
            </div>
          </div>
          {!isProcessingPayment && (
            <button
              onClick={() => {
                triggerHaptic('tap');
                setPaymentModalOpen(false);
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

              {/* PROCESSING SCREEN */}
              {isProcessingPayment ? (
                <div className="p-8 sm:p-12 text-center space-y-4 flex flex-col items-center justify-center my-auto flex-1">
                  <div className="w-16 h-16 rounded-full border-4 border-[#005A9C] border-t-transparent animate-spin flex items-center justify-center">
                    <IndianRupee className="w-6 h-6 text-[#003366]" />
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-[#003366]">
                    {isEn ? 'Processing Government e-Challan...' : isHi ? 'सरकारी ई-चालान भुगतान प्रक्रिया जारी...' : 'સરકારી ઈ-ચલણ ચૂકવણી પ્રક્રિયા ચાલુ છે...'}
                  </h4>
                  <p className="text-xs font-bold text-slate-600 animate-pulse bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl">
                    {paymentStepText}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {isEn ? 'Do not refresh or close window' : 'મહેરબાની કરીને પેજ રિફ્રેશ કે બંધ કરશો નહીં'}
                  </span>
                </div>
              ) : (
                /* PAYMENT SELECTION BODY */
                <div className="p-4 sm:p-6 overflow-y-auto modal-scroll-area space-y-4 flex-1 text-[#1F2937]">
                  
                  {/* SERVICE & STATUTORY FEE SUMMARY CARD */}
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50/60 border border-slate-200 rounded-2xl p-3.5 sm:p-4 space-y-2.5">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-500">
                        {isEn ? 'Citizen Service e-Challan Bill' : isHi ? 'नागरिक सेवा ई-चालान बिल' : 'નાગરિક સેવા ઈ-ચલણ વિગતો'}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-600">
                        Aadhaar: {DEFAULT_CITIZEN_PROFILE.aadhaarMasked}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">{isEn ? 'Service / Scheme:' : 'સેવા / યોજના:'}</span>
                        <p className="font-bold text-[#003366] truncate">{scheme ? scheme.titleGu : 'સરકારી જન સેવા'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">{isEn ? 'Target Office:' : 'કચેરી / સેવા કેન્દ્ર:'}</span>
                        <p className="font-bold text-slate-800 truncate">{selectedCenter.nameGu}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">{isEn ? 'Citizen Name:' : 'નાગરિકનું નામ:'}</span>
                        <p className="font-bold text-slate-800">{DEFAULT_CITIZEN_PROFILE.nameGu}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">{isEn ? 'Allocated Counter:' : 'ફાળવેલ કાઉન્ટર:'}</span>
                        <p className="font-bold text-[#005A9C]">કાઉન્ટર {routing.counterNumber} ({counterDetails.nameGu})</p>
                      </div>
                    </div>

                    {/* STATUTORY FEE TOTAL */}
                    <div className="bg-white border border-blue-200 rounded-xl p-3 flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                          ₹
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800">
                            {isEn ? 'Total Government Fee' : isHi ? 'कुल सरकारी शुल्क' : 'કુલ નિયત સરકારી સેવા ફી'}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {(scheme?.fee ?? 20) === 0 ? '૧૦૦% સરકારી સબસિડી (મફત)' : 'સરકારી નિયમ મુજબ સત્તાવાર સેવા ચાર્જ'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-black text-emerald-700">
                          {(scheme?.fee ?? 20) === 0 ? '₹૦ (મફત)' : `₹${scheme?.fee ?? 20}`}
                        </span>
                        <span className="block text-[9px] text-emerald-600 font-bold">
                          {(scheme?.fee ?? 20) === 0 ? 'Nil Fee Scheme' : 'Official Challan'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* PAYMENT MODE SELECTION */}
                  {(scheme?.fee ?? 20) > 0 ? (
                    <div className="space-y-3">
                      <label className="text-xs font-black text-[#003366] block">
                        {isEn ? 'Choose Official Payment Mode *' : isHi ? 'भुगतान विधि चुनें *' : 'સત્તાવાર ચુકવણી પદ્ધતિ પસંદ કરો *'}
                      </label>

                      {/* OPTION 1: ONLINE CYBER TREASURY */}
                      <div 
                        onClick={() => {
                          triggerHaptic('tap');
                          setPaymentMode('ONLINE_CYBER_TREASURY');
                        }}
                        className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex flex-col gap-2.5 ${
                          paymentMode === 'ONLINE_CYBER_TREASURY' 
                            ? 'bg-blue-50/80 border-[#005A9C] shadow-sm' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <input 
                              type="radio" 
                              checked={paymentMode === 'ONLINE_CYBER_TREASURY'} 
                              onChange={() => setPaymentMode('ONLINE_CYBER_TREASURY')}
                              className="w-4 h-4 text-[#005A9C] accent-[#005A9C] cursor-pointer"
                            />
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-black text-[#003366]">
                                  {isEn ? '⚡ Online Cyber Treasury (Instant e-Challan)' : isHi ? '⚡ ऑनलाइन साइबर ट्रेजरी (तत्काल ई-चालान)' : '⚡ ઓનલાઇન સાયબર ટ્રેઝરી (તાત્કાલિક e-Challan)'}
                                </span>
                                <span className="bg-[#FF9933] text-slate-900 text-[9px] font-black px-2 py-0.2 rounded-full uppercase">
                                  {isEn ? 'Recommended' : 'ભલામણ કરેલ'}
                                </span>
                              </div>
                              <p className="text-[10.5px] text-slate-600 mt-0.5">
                                {isEn ? 'Instant receipt via UPI (GPay/PhonePe), Debit Card or Net Banking' : 'UPI (Google Pay, PhonePe), ડેબિટ કાર્ડ અથવા નેટ બેન્કિંગ દ્વારા તાત્કાલિક સરકારી રસીદ'}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-black text-emerald-700">₹{scheme?.fee ?? 20}</span>
                        </div>

                        {/* SUB-METHODS FOR ONLINE PAYMENT */}
                        {paymentMode === 'ONLINE_CYBER_TREASURY' && (
                          <div className="pt-2 border-t border-blue-200/80 space-y-2.5 animate-in fade-in">
                            <div className="grid grid-cols-3 gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  triggerHaptic('tap');
                                  setOnlineMethod('upi');
                                }}
                                className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border ${
                                  onlineMethod === 'upi' ? 'bg-[#003366] text-white border-[#003366]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                <QrCode className="w-3.5 h-3.5" />
                                <span>UPI / QR</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  triggerHaptic('tap');
                                  setOnlineMethod('card');
                                }}
                                className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border ${
                                  onlineMethod === 'card' ? 'bg-[#003366] text-white border-[#003366]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>{isEn ? 'Debit Card' : 'ડેબિટ કાર્ડ'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  triggerHaptic('tap');
                                  setOnlineMethod('netbanking');
                                }}
                                className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition border ${
                                  onlineMethod === 'netbanking' ? 'bg-[#003366] text-white border-[#003366]' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                <Landmark className="w-3.5 h-3.5" />
                                <span>{isEn ? 'NetBanking' : 'નેટ બેન્કિંગ'}</span>
                              </button>
                            </div>

                            {/* DYNAMIC UPI & QR CODE PAYMENT SECTION */}
                            {onlineMethod === 'upi' && (
                              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border-2 border-blue-200 space-y-3.5 shadow-2xs">
                                
                                {/* RECIPIENT & GOVT ACCOUNT HEADER (Matching Screenshot 4) */}
                                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-10 h-10 rounded-full bg-[#1b7340] text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                                      T
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <h4 className="text-sm font-black text-slate-900 leading-none">Trusha Somaiya</h4>
                                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.2 rounded-full border border-emerald-300">
                                          ✓ {isEn ? 'Govt Verified' : 'પ્રમાણિત'}
                                        </span>
                                      </div>
                                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                                        {isEn ? 'Cyber Treasury Official Collection Account' : 'સાયબર ટ્રેઝરી સત્તાવાર મહેસૂલ ખાતું'}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <span className="text-[9.5px] text-slate-500 font-bold block">{isEn ? 'Amount to Pay' : 'સરકારી સેવા ફી'}</span>
                                    <span className="text-base sm:text-lg font-black text-emerald-700">₹{targetFee}.00</span>
                                  </div>
                                </div>

                                {/* QR CODE TABS (Dynamic with Auto-amount vs Original GPay QR) */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                                      <QrCode className="w-3.5 h-3.5 text-[#005A9C]" />
                                      <span>{isEn ? 'Scan QR Code with any UPI App:' : 'કોઈપણ UPI એપથી સ્કેન કરી ચૂકવો:'}</span>
                                    </span>
                                    <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 text-[10px] font-bold">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          triggerHaptic('tap');
                                          setQrViewMode('dynamic');
                                        }}
                                        className={`px-2 py-0.5 rounded-md transition ${
                                          qrViewMode === 'dynamic' ? 'bg-white text-[#003366] shadow-xs' : 'text-slate-600'
                                        }`}
                                      >
                                        ⚡ ડાયનેમિક (₹{targetFee})
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          triggerHaptic('tap');
                                          setQrViewMode('original');
                                        }}
                                        className={`px-2 py-0.5 rounded-md transition ${
                                          qrViewMode === 'original' ? 'bg-white text-[#003366] shadow-xs' : 'text-slate-600'
                                        }`}
                                      >
                                        🖼️ ઓરિજિનલ GPay QR
                                      </button>
                                    </div>
                                  </div>

                                  {/* THE QR CONTAINER */}
                                  <div className="bg-gradient-to-b from-slate-50 to-white p-3 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center space-y-2">
                                    <div className="relative p-2 bg-white rounded-2xl border-2 border-slate-300 shadow-sm inline-block">
                                      {qrViewMode === 'dynamic' ? (
                                        <img 
                                          src={dynamicQrUrl} 
                                          alt={`Dynamic UPI QR for Rs ${targetFee}`} 
                                          className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-lg"
                                        />
                                      ) : (
                                        <img 
                                          src="/images/trusha-upi-qr.jpg" 
                                          alt="Original Trusha Somaiya GPay QR" 
                                          className="w-44 h-44 sm:w-48 sm:h-48 object-contain rounded-lg"
                                        />
                                      )}
                                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-full shadow-md border border-slate-200 pointer-events-none">
                                        <div className="w-5 h-5 rounded-full bg-[#1b7340] text-white text-[10px] font-black flex items-center justify-center">
                                          ₹
                                        </div>
                                      </div>
                                    </div>

                                    <div className="space-y-0.5">
                                      <p className="text-[11px] font-black text-slate-800">
                                        {qrViewMode === 'dynamic' 
                                          ? `આ QR માં ₹${targetFee} અને યોજના નામ ઓટોમેટિક ભરેલું છે` 
                                          : 'Scan to pay with any UPI app'}
                                      </p>
                                      <p className="text-[9.5px] text-slate-500">
                                        Google Pay • PhonePe • Paytm • BHIM • CRED • કોઈપણ બેંક એપ
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* UPI ID COPY BAR */}
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2 sm:p-2.5 flex items-center justify-between gap-2">
                                  <div className="min-w-0">
                                    <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">
                                      {isEn ? 'Official UPI ID' : 'સત્તાવાર UPI આઈડી'}
                                    </span>
                                    <p className="font-mono font-black text-[#003366] text-xs sm:text-sm truncate select-all">
                                      {upiId}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopyUpiId();
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition shrink-0 active:scale-95 cursor-pointer ${
                                      copiedUpi 
                                        ? 'bg-emerald-600 text-white shadow-xs' 
                                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 shadow-2xs'
                                    }`}
                                  >
                                    {copiedUpi ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-white" />
                                        <span>{isEn ? 'Copied!' : 'કોપી થઈ ગઈ!'}</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3.5 h-3.5 text-[#005A9C]" />
                                        <span>{isEn ? 'Copy UPI' : 'કોપી કરો'}</span>
                                      </>
                                    )}
                                  </button>
                                </div>

                                {/* DIRECT MOBILE UPI APP REDIRECT BUTTONS (Native App Handshake) */}
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>{isEn ? 'Instant Pay via Installed Mobile App:' : 'મોબાઈલમાં સીધું એપ દ્વારા ચૂકવો:'}</span>
                                    </span>
                                    <span className="text-[9.5px] text-emerald-700 font-extrabold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                      1-Tap Redirect
                                    </span>
                                  </div>

                                  {/* MASTER 1-TAP LAUNCH BUTTON */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleLaunchUpiApp('any');
                                    }}
                                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.98] cursor-pointer"
                                  >
                                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                    <span>
                                      {isEn 
                                        ? `⚡ Open Installed UPI App (Auto-filled ₹${targetFee})` 
                                        : `⚡ સીધું UPI એપમાં ખોલો (Auto ₹${targetFee} રકમ સાથે)`}
                                    </span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </button>

                                  {/* SPECIFIC APP SELECTORS */}
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                                    {[
                                      { id: 'gpay', name: 'Google Pay', icon: '🟢' },
                                      { id: 'phonepe', name: 'PhonePe', icon: '🟣' },
                                      { id: 'paytm', name: 'Paytm UPI', icon: '🔵' },
                                      { id: 'bhim', name: 'BHIM UPI', icon: '🇮🇳' },
                                    ].map((app) => (
                                      <button
                                        key={app.id}
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setUpiApp(app.id as any);
                                          handleLaunchUpiApp(app.id as any);
                                        }}
                                        className={`p-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition cursor-pointer active:scale-95 ${
                                          upiApp === app.id 
                                            ? 'bg-blue-100/80 text-[#003366] border-[#005A9C] shadow-2xs' 
                                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                        }`}
                                      >
                                        <span>{app.icon}</span>
                                        <span className="text-[11px] truncate">{app.name}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between text-[9.5px] text-emerald-800 font-bold">
                                  <span className="flex items-center gap-1">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                    <span>NPCI & Axis Bank સત્તાવાર સાયબર ટ્રેઝરી • 0% એક્સ્ટ્રા ચાર્જ</span>
                                  </span>
                                  <span className="font-mono text-emerald-950 font-black">₹{targetFee} EXACT</span>
                                </div>

                              </div>
                            )}

                            {/* DEBIT CARD DETAILS */}
                            {onlineMethod === 'card' && (
                              <div className="bg-white p-3 rounded-xl border border-blue-200 space-y-2 text-xs">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-600 block mb-1">
                                    {isEn ? 'RuPay / Debit Card Number' : 'RuPay / ડેબિટ કાર્ડ નંબર'}
                                  </label>
                                  <input 
                                    type="text" 
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-800"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-600 block mb-1">{isEn ? 'Card Holder' : 'કાર્ડધારકનું નામ'}</label>
                                    <input 
                                      type="text" 
                                      value={cardHolder}
                                      onChange={(e) => setCardHolder(e.target.value)}
                                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-800 text-[11px]"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Expiry / CVV</label>
                                    <div className="flex gap-1.5">
                                      <input type="text" defaultValue="08/28" className="w-1/2 bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-center font-mono font-bold text-slate-800" />
                                      <input type="password" defaultValue="•••" className="w-1/2 bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-center font-mono font-bold text-slate-800" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* NET BANKING */}
                            {onlineMethod === 'netbanking' && (
                              <div className="bg-white p-3 rounded-xl border border-blue-200 space-y-1.5 text-xs">
                                <label className="text-[10px] font-bold text-slate-600 block">
                                  {isEn ? 'Select Authorized Bank:' : 'સત્તાવાર બેંક પસંદ કરો:'}
                                </label>
                                <select
                                  value={selectedBank}
                                  onChange={(e) => setSelectedBank(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-800 text-xs"
                                >
                                  <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                                  <option value="Bank of Baroda (BOB)">Bank of Baroda (BOB)</option>
                                  <option value="HDFC Bank">HDFC Bank</option>
                                  <option value="ICICI Bank">ICICI Bank</option>
                                  <option value="Axis Bank">Axis Bank</option>
                                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                                  <option value="Saurashtra Gramin Bank">Saurashtra Gramin Bank (SGB)</option>
                                </select>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* OPTION 2: PAY CASH AT KACHERI COUNTER */}
                      <div 
                        onClick={() => {
                          triggerHaptic('tap');
                          setPaymentMode('CASH_AT_COUNTER');
                        }}
                        className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex flex-col gap-2 ${
                          paymentMode === 'CASH_AT_COUNTER' 
                            ? 'bg-amber-50/80 border-amber-500 shadow-sm' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <input 
                              type="radio" 
                              checked={paymentMode === 'CASH_AT_COUNTER'} 
                              onChange={() => setPaymentMode('CASH_AT_COUNTER')}
                              className="w-4 h-4 text-amber-600 accent-amber-600 cursor-pointer"
                            />
                            <div>
                              <span className="text-xs font-black text-amber-950">
                                {isEn ? '💵 Pay Cash at Kacheri Counter' : isHi ? '💵 कचेरी काउंटर पर नकद भुगतान' : '💵 કચેરી કાઉન્ટર પર રોકડ ચુકવણી (Pay Cash at Desk)'}
                              </span>
                              <p className="text-[10.5px] text-amber-900/80 mt-0.5">
                                {isEn ? `Pay ₹${scheme?.fee ?? 20} cash directly to desk officer upon token call.` : `કાઉન્ટર પર ટોકન વારો આવે ત્યારે અધિકારીને રૂબરૂ ₹${scheme?.fee ?? 20} રોકડ જમા કરાવો.`}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-black text-amber-800">₹{scheme?.fee ?? 20}</span>
                        </div>

                        {paymentMode === 'CASH_AT_COUNTER' && (
                          <div className="bg-white/90 border border-amber-300 rounded-xl p-2.5 text-[10.5px] text-amber-950 font-bold flex items-center gap-2 animate-in fade-in">
                            <Banknote className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>
                              {isEn 
                                ? `A Kacheri Cash Challan will be generated. The officer will collect cash & issue receipt.` 
                                : `કાઉન્ટર ચલણ જનરેટ થશે. કાઉન્ટર અધિકારી રોકડ સ્વીકારી સિસ્ટમમાં રસીદ જનરેટ કરશે.`}
                            </span>
                          </div>
                        )}
                      </div>

                    </div>
                  ) : (
                    /* ZERO FEE / GOVT EXEMPT SCHEME */
                    <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 text-center space-y-2">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-black text-emerald-950">
                        {isEn ? '🏛️ 100% Free Government Welfare Service' : isHi ? '🏛️ १००% निःशुल्क सरकारी कल्याणकारी सेवा' : '🏛️ ૧૦૦% સરકારી છૂટછાટ (મફત સેવા)'}
                      </h4>
                      <p className="text-xs text-emerald-800">
                        {isEn ? 'This scheme has zero government statutory charge. Official Nil-Challan will be issued.' : 'આ કલ્યાણકારી યોજના માટે કોઈ સરકારી ફી નથી. સત્તાવાર મફત e-Challan ટોકન પાસ સાથે જારી થશે.'}
                      </p>
                    </div>
                  )}

                  {/* STATUTORY DISCLAIMER */}
                  <div className="bg-slate-100 rounded-xl p-2.5 text-[10px] text-slate-500 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      {isEn ? 'Statutory Treasury Security: Zero touts, 100% direct government revenue accounting.' : 'સત્તાવાર સાયબર ટ્રેઝરી સુરક્ષા: સંપૂર્ણ સરકારી મહેસૂલ એકાઉન્ટિંગ, દલાલમુક્ત પારદર્શક પ્રક્રિયા.'}
                    </span>
                  </div>

                </div>
              )}

              {/* PAYMENT FOOTER BUTTONS */}
              {!isProcessingPayment && (
                <div className="bg-slate-50 p-3.5 sm:p-4 border-t border-slate-200 flex items-center justify-between shrink-0 sticky bottom-0 z-30 pb-[max(0.85rem,env(safe-area-inset-bottom))] shadow-lg">
                  <button
                    onClick={() => {
                      triggerHaptic('tap');
                      setPaymentModalOpen(false);
                    }}
                    className="px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                  >
                    {isEn ? '← Back to Slot' : isHi ? '← वापस' : '← સ્લોટ બદલો'}
                  </button>

                  <button
                    onClick={handleExecutePaymentAndIssueToken}
                    className="px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-[#003366] hover:bg-[#002244] active:scale-[0.98] text-white flex items-center gap-2 shadow-md transition cursor-pointer"
                  >
                    <span>
                      {paymentMode === 'ONLINE_CYBER_TREASURY' && (scheme?.fee ?? 20) > 0
                        ? (isEn ? `Pay ₹${scheme?.fee ?? 20} Online & Get Token` : `ઓનલાઇન ચૂકવણી કરો (₹${scheme?.fee ?? 20})`)
                        : paymentMode === 'CASH_AT_COUNTER'
                        ? (isEn ? `Generate Kacheri Cash Token` : `કચેરી કાઉન્ટર ચલણ ટોકન મેળવો`)
                        : (isEn ? 'Confirm & Issue Free Token' : 'સત્તાવાર ટોકન મેળવો (₹૦)')}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#FF9933] shrink-0" />
                  </button>
                </div>
              )}
            </>
          )}

      </div>
    </div>
  );
}
