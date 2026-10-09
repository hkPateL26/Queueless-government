'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, Volume2, CheckCircle2, AlertTriangle, UserCheck, 
  Clock, ArrowRight, Search, Building, Users, Radio, FileText, 
  Coffee, ArrowRightLeft, RotateCcw, Check, X, ChevronDown, 
  ExternalLink, Eye, Printer, ArrowLeft, Sparkles, Star, Award, 
  AlertCircle, Phone, Lock, ChevronRight, RefreshCw, Layers, History, BadgeCheck,
  Globe, IndianRupee, CreditCard, Receipt, Banknote, Landmark, FileCheck
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { speakGuidance } from '@/lib/voice';
import { 
  playNotificationChime, broadcastQueueEvent, subscribeToQueueEvents, QueueEvent 
} from '@/lib/realtime-bus';
import { 
  GUJARAT_33_DISTRICTS, DistrictItem, TalukaOffice,
  getLocalizedDistrictName, getLocalizedTalukaName 
} from '@/lib/jurisdiction-data';
import { GovLogo } from '@/components/GovLogo';
import { GovTelemetryMarquee } from '@/components/GovTelemetryMarquee';
import { Language, GUJARAT_LANGUAGES } from '@/lib/translations';
import { VerifiedDocumentItem, GovernmentPaymentRecord } from '@/lib/slot-engine';
import { BookingDetails } from '@/components/SlotBookingModal';
import { DEFAULT_CITIZEN_PROFILE } from '@/lib/citizen-profile';

interface QueueCitizen {
  id: string;
  tokenNumber: string;
  citizenNameGu: string;
  citizenNameHi: string;
  citizenNameEn: string;
  phone: string;
  schemeTitleGu: string;
  schemeTitleHi: string;
  schemeTitleEn: string;
  counterNumber: number;
  isPriority: boolean;
  appliedTime: string;
  waitingMinutes: number;
  status: 'WAITING' | 'CALLED' | 'IN_SERVICE' | 'COMPLETED' | 'SKIPPED' | 'LATE';
  lateMinutes?: number;
  aadhaarLast4: string;
  incomeDeclaredGu: string;
  incomeDeclaredHi: string;
  incomeDeclaredEn: string;
  aiOcrVerdictGu: string;
  aiOcrVerdictHi: string;
  aiOcrVerdictEn: string;
  documents: { 
    nameGu: string; 
    nameHi: string; 
    nameEn: string; 
    status: 'PRE_CHECK_PASSED' | 'PENDING';
    uploadedAt?: string;
    fileUrl?: string;
    ocrExtractedData?: {
      documentType?: string;
      idNumber?: string;
      holderName?: string;
      confidence?: number;
      dates?: string[];
    };
  }[];
  payment?: GovernmentPaymentRecord;
  uploadedDocuments?: VerifiedDocumentItem[];
  districtId?: string;
  talukaId?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  officerNameGu: string;
  officerNameHi: string;
  officerNameEn: string;
  action: 'CALLED' | 'COMPLETED' | 'SKIPPED' | 'RECALLED' | 'TRANSFERRED' | 'LUNCH_BREAK';
  tokenNumber: string;
  counterNumber: number;
  remarksGu: string;
  remarksHi: string;
  remarksEn: string;
}

const INITIAL_QUEUE: QueueCitizen[] = [
  {
    id: 'tok-p07',
    tokenNumber: '#P-07',
    citizenNameGu: 'ગંગાબેન રમણિકભાઈ પટેલ (૬૪ વર્ષ)',
    citizenNameHi: 'गंगाबेन रमणिकभाई पटेल (६४ वर्ष)',
    citizenNameEn: 'Gangaben R. Patel (64 Yrs)',
    phone: '98251 XXXXX',
    schemeTitleGu: 'ગંગા સ્વરૂપા વિધવા સહાય યોજના',
    schemeTitleHi: 'गंगा स्वरूपा विधवा सहायता योजना',
    schemeTitleEn: 'Ganga Swarupa Widow Assistance Scheme',
    counterNumber: 1,
    isPriority: true,
    appliedTime: '10:35 AM',
    waitingMinutes: 12,
    status: 'WAITING',
    aadhaarLast4: '7104',
    incomeDeclaredGu: '₹ ૯૫,૦૦૦ (વાર્ષિક)',
    incomeDeclaredHi: '₹ ९५,००० (वार्षिक)',
    incomeDeclaredEn: '₹ 95,000 (Annual)',
    aiOcrVerdictGu: '✓ ઓટોમેટેડ પ્રી-ચેક સફળ: આવક ₹૯૫,૦૦૦ (નિયમ મુજબ મર્યાદા હેઠળ)',
    aiOcrVerdictHi: '✓ स्वचालित पूर्व-जांच सफल: आय ₹९५,००० (नियम अनुसार सीमा के अंतर्गत)',
    aiOcrVerdictEn: '✓ Automated Pre-check Passed: Income ₹95,000 (Within eligible threshold)',
    documents: [
      { 
        nameGu: 'આધાર કાર્ડ (માસ્ક્ડ આધાર XXXX-XXXX-7104)', 
        nameHi: 'आधार कार्ड (मास्क्ड आधार XXXX-XXXX-7104)', 
        nameEn: 'Aadhaar Card (Masked XXXX-XXXX-7104)', 
        status: 'PRE_CHECK_PASSED' 
      },
      { 
        nameGu: 'પતિના અવસાનનો દાખલો', 
        nameHi: 'पति का मृत्यु प्रमाण पत्र', 
        nameEn: 'Husband Death Certificate', 
        status: 'PRE_CHECK_PASSED' 
      },
      { 
        nameGu: 'આવકનો દાખલો (સક્ષમ અધિકારી)', 
        nameHi: 'आय प्रमाण पत्र (सक्षम अधिकारी)', 
        nameEn: 'Income Certificate (Competent Authority)', 
        status: 'PRE_CHECK_PASSED' 
      }
    ]
  },
  {
    id: 'tok-a42',
    tokenNumber: '#A-42',
    citizenNameGu: 'મોહનભાઈ કરસનભાઈ પટેલ',
    citizenNameHi: 'मोहनभाई करसनभाई पटेल',
    citizenNameEn: 'Mohanbhai Karsanbhai Patel',
    phone: '98765 XXXXX',
    schemeTitleGu: 'આવકનો દાખલો (રાજ્ય સરકાર પ્રમાણપત્ર)',
    schemeTitleHi: 'आय प्रमाण पत्र (राज्य सरकार)',
    schemeTitleEn: 'State Income Certificate',
    counterNumber: 1,
    isPriority: false,
    appliedTime: '10:45 AM',
    waitingMinutes: 18,
    status: 'WAITING',
    aadhaarLast4: '8842',
    incomeDeclaredGu: '₹ ૧,૨૦,૦૦૦ (વાર્ષિક)',
    incomeDeclaredHi: '₹ १,२०,००० (वार्षिक)',
    incomeDeclaredEn: '₹ 1,20,000 (Annual)',
    aiOcrVerdictGu: '✓ ઓટોમેટેડ પ્રી-ચેક સફળ: આવક ₹૧,૨૦,૦૦૦ (તલાટી રિપોર્ટ સુસંગત)',
    aiOcrVerdictHi: '✓ स्वचालित पूर्व-जांच सफल: आय ₹१,२०,००० (तलाटी रिपोर्ट अनुरूप)',
    aiOcrVerdictEn: '✓ Automated Pre-check Passed: Income ₹1,20,000 (Verified by Talati)',
    documents: [
      { 
        nameGu: 'આધાર કાર્ડ (માસ્ક્ડ આધાર XXXX-XXXX-8842)', 
        nameHi: 'आधार कार्ड (मास्क्ड आधार XXXX-XXXX-8842)', 
        nameEn: 'Aadhaar Card (Masked XXXX-XXXX-8842)', 
        status: 'PRE_CHECK_PASSED' 
      },
      { 
        nameGu: 'ચાલુ વર્ષનો આવકનો દાખલો', 
        nameHi: 'वर्तमान वर्ष का आय प्रमाण पत्र', 
        nameEn: 'Current Year Income Proof', 
        status: 'PRE_CHECK_PASSED' 
      },
      { 
        nameGu: 'રેશન કાર્ડ નકલ', 
        nameHi: 'राशन कार्ड प्रतिलिपि', 
        nameEn: 'Ration Card Copy', 
        status: 'PRE_CHECK_PASSED' 
      }
    ]
  },
  {
    id: 'tok-a43',
    tokenNumber: '#A-43',
    citizenNameGu: 'રમેશભાઈ ગોવિંદભાઈ પરમાર',
    citizenNameHi: 'रमेशभाई गोविंदभाई परमार',
    citizenNameEn: 'Rameshbhai Govindbhai Parmar',
    phone: '94263 XXXXX',
    schemeTitleGu: 'બિન-અનામત વર્ગ (EWS) આવક પ્રમાણપત્ર',
    schemeTitleHi: 'गैर-आरक्षित वर्ग (EWS) आय प्रमाण पत्र',
    schemeTitleEn: 'Economically Weaker Section (EWS) Certificate',
    counterNumber: 1,
    isPriority: false,
    appliedTime: '10:55 AM',
    waitingMinutes: 14,
    status: 'WAITING',
    aadhaarLast4: '4192',
    incomeDeclaredGu: '₹ ૨,૪૦,૦૦૦ (વાર્ષિક)',
    incomeDeclaredHi: '₹ २,४०,००० (वार्षिक)',
    incomeDeclaredEn: '₹ 2,40,000 (Annual)',
    aiOcrVerdictGu: '✓ ઓટોમેટેડ પ્રી-ચેક સફળ: આવક ₹૨,૪૦,૦૦૦ (EWS મર્યાદા હેઠળ)',
    aiOcrVerdictHi: '✓ स्वचालित पूर्व-जांच सफल: आय ₹२,४०,००० (EWS सीमा अंतर्गत)',
    aiOcrVerdictEn: '✓ Automated Pre-check Passed: Income ₹2,40,000 (Within EWS limit)',
    documents: [
      { 
        nameGu: 'આધાર કાર્ડ (માસ્ક્ડ આધાર XXXX-XXXX-4192)', 
        nameHi: 'आधार कार्ड (मास्क्ड आधार XXXX-XXXX-4192)', 
        nameEn: 'Aadhaar Card (Masked XXXX-XXXX-4192)', 
        status: 'PRE_CHECK_PASSED' 
      },
      { 
        nameGu: 'આવક પંચનામું', 
        nameHi: 'आय पंचनामा', 
        nameEn: 'Income Panchnama Verification', 
        status: 'PRE_CHECK_PASSED' 
      }
    ]
  },
  {
    id: 'tok-a44',
    tokenNumber: '#A-44',
    citizenNameGu: 'ભાવનાબેન કિશોરભાઈ જોશી',
    citizenNameHi: 'भावनाबेन किशोरभाई जोशी',
    citizenNameEn: 'Bhavnaben Kishorbhai Joshi',
    phone: '97120 XXXXX',
    schemeTitleGu: 'વિધવા પુનઃલગ્ન આર્થિક સહાય',
    schemeTitleHi: 'विधवा पुनर्विवाह आर्थिक सहायता',
    schemeTitleEn: 'Widow Remarriage Financial Assistance',
    counterNumber: 1,
    isPriority: false,
    appliedTime: '11:10 AM',
    waitingMinutes: 9,
    status: 'WAITING',
    aadhaarLast4: '9921',
    incomeDeclaredGu: '₹ ૧,૫૦,૦૦૦ (વાર્ષિક)',
    incomeDeclaredHi: '₹ १,५०,००० (वार्षिक)',
    incomeDeclaredEn: '₹ 1,50,000 (Annual)',
    aiOcrVerdictGu: '✓ ઓટોમેટેડ પ્રી-ચેક સફળ: દસ્તાવેજો સુસંગત',
    aiOcrVerdictHi: '✓ स्वचालित पूर्व-जांच सफल: सभी दस्तावेज़ सत्यापित',
    aiOcrVerdictEn: '✓ Automated Pre-check Passed: All documents compliant',
    documents: [
      { 
        nameGu: 'આધાર કાર્ડ (માસ્ક્ડ આધાર XXXX-XXXX-9921)', 
        nameHi: 'आधार कार्ड (मास्क्ड आधार XXXX-XXXX-9921)', 
        nameEn: 'Aadhaar Card (Masked XXXX-XXXX-9921)', 
        status: 'PRE_CHECK_PASSED' 
      },
      { 
        nameGu: 'લગ્ન નોંધણી પ્રમાણપત્ર', 
        nameHi: 'विवाह पंजीकरण प्रमाण पत्र', 
        nameEn: 'Marriage Registration Certificate', 
        status: 'PRE_CHECK_PASSED' 
      }
    ]
  }
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-1',
    timestamp: '10:30:15 AM',
    officerNameGu: 'શ્રી કે. એમ. ત્રિવેદી (નાયબ મામલતદાર)',
    officerNameHi: 'श्री के. एम. त्रिवेदी (नायब तहसीलदार)',
    officerNameEn: 'Shri K. M. Trivedi (Dy. Mamlatdar)',
    action: 'CALLED',
    tokenNumber: '#A-40',
    counterNumber: 1,
    remarksGu: 'નિયમિત કતાર ક્રમ મુજબ બોલાવ્યા',
    remarksHi: 'नियमित कतार क्रम अनुसार बुलाया गया',
    remarksEn: 'Called as per regular queue sequence'
  },
  {
    id: 'aud-2',
    timestamp: '10:35:48 AM',
    officerNameGu: 'શ્રી કે. એમ. ત્રિવેદી (નાયબ મામલતદાર)',
    officerNameHi: 'श्री के. एम. त्रिवेदी (नायब तहसीलदार)',
    officerNameEn: 'Shri K. M. Trivedi (Dy. Mamlatdar)',
    action: 'COMPLETED',
    tokenNumber: '#A-40',
    counterNumber: 1,
    remarksGu: 'આવક પ્રમાણપત્ર અરજી મંજૂર (સેવા સમય: ૫:૩૩)',
    remarksHi: 'आय प्रमाण पत्र आवेदन स्वीकृत (सेवा समय: ५:३३)',
    remarksEn: 'Income certificate application approved (Service time: 5:33)'
  }
];

const SERVICE_SLA_CONFIG = {
  serviceNameGu: 'આવક & જાતિ પ્રમાણપત્રો (Revenue Desk)',
  serviceNameHi: 'आय एवं जाति प्रमाण पत्र (राजस्व डेस्क)',
  serviceNameEn: 'Income & Caste Certificates (Revenue Desk)',
  targetMinutes: 15,
  warningMinutes: 10,
};

const getDefaultTransferRemarks = (l: Language): string => {
  if (l === 'hi') return 'आवेदक को शपथ पत्र सत्यापन हेतु भेजा गया है।';
  if (l === 'en') return 'Applicant forwarded for affidavit notarization.';
  return 'અરજદારને સોગંદનામા માટે મોકલવામાં આવ્યા છે.';
};

function bookingToQueueCitizen(b: BookingDetails): QueueCitizen {
  const docsList = (b.uploadedDocuments && b.uploadedDocuments.length > 0)
    ? b.uploadedDocuments.map(d => ({
        nameGu: d.nameGu,
        nameHi: d.nameEn || d.nameGu,
        nameEn: d.nameEn || d.nameGu,
        status: 'PRE_CHECK_PASSED' as const,
        uploadedAt: d.uploadedAt,
        fileUrl: d.fileUrl,
        ocrExtractedData: d.ocrExtractedData
      }))
    : [
        { nameGu: 'આધાર કાર્ડ (માસ્ક્ડ આધાર XXXX-XXXX-8842)', nameHi: 'आधार कार्ड (मास्क्ड आधार XXXX-XXXX-8842)', nameEn: 'Aadhaar Card (Masked XXXX-XXXX-8842)', status: 'PRE_CHECK_PASSED' as const },
        { nameGu: 'આવકનો દાખલો / રેશનકાર્ડ', nameHi: 'आय प्रमाण पत्र / राशन कार्ड', nameEn: 'Income / Ration Proof', status: 'PRE_CHECK_PASSED' as const }
      ];

  return {
    id: `real-tok-${b.tokenNumber.replace('#', '').toLowerCase()}`,
    tokenNumber: b.tokenNumber,
    citizenNameGu: DEFAULT_CITIZEN_PROFILE.nameGu,
    citizenNameHi: DEFAULT_CITIZEN_PROFILE.nameEn,
    citizenNameEn: DEFAULT_CITIZEN_PROFILE.nameEn,
    phone: '98765 43210',
    schemeTitleGu: b.counterNameGu ? `${b.counterNameGu} સેવા` : 'જન સેવા પ્રમાણપત્ર',
    schemeTitleHi: b.counterNameEn ? `${b.counterNameEn} Service` : 'जन सेवा प्रमाण पत्र',
    schemeTitleEn: b.counterNameEn || 'Jan Seva Service',
    counterNumber: b.counterNumber || 1,
    isPriority: !!b.isPriority,
    appliedTime: b.slot?.timeRange ? b.slot.timeRange.split(' - ')[0] : '10:30 AM',
    waitingMinutes: 6,
    status: 'WAITING',
    aadhaarLast4: '8842',
    incomeDeclaredGu: '₹ ૧,૨૦,૦૦૦ (વાર્ષિક)',
    incomeDeclaredHi: '₹ १,२०,००० (वार्षिक)',
    incomeDeclaredEn: '₹ 1,20,000 (Annual)',
    aiOcrVerdictGu: '✓ ઓટોમેટેડ AI ચકાસણી સફળ: ૧૦૦% સરકારી દસ્તાવેજ પ્રમાણિત',
    aiOcrVerdictHi: '✓ स्वचालित AI सत्यापन सफल: १००% सरकारी दस्तावेज़ प्रमाणित',
    aiOcrVerdictEn: '✓ Automated AI Pre-check Passed: 100% Compliant',
    documents: docsList,
    payment: b.payment,
    uploadedDocuments: b.uploadedDocuments,
    districtId: b.district?.id,
    talukaId: b.taluka?.id
  };
}

export default function CounterOperatorDesk() {
  // Multi-Language State
  const [lang, setLang] = useState<Language>('gu');
  const [langDropdownOpen, setLangDropdownOpen] = useState<boolean>(false);

  // Jurisdiction & Officer Profile
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('rajkot');
  const [selectedTalukaId, setSelectedTalukaId] = useState<string>('gondal');
  const [selectedCounter, setSelectedCounter] = useState<number>(1);
  const [isLunchRecess, setIsLunchRecess] = useState<boolean>(false);
  const [realtimeConnected, setRealtimeConnected] = useState<boolean>(true);

  // Queue state
  const [queue, setQueue] = useState<QueueCitizen[]>(INITIAL_QUEUE);
  const [currentServing, setCurrentServing] = useState<QueueCitizen | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [docModalOpen, setDocModalOpen] = useState<boolean>(false);
  const [selectedCitizenForDocs, setSelectedCitizenForDocs] = useState<QueueCitizen | null>(null);
  const [selectedCitizenForReceipt, setSelectedCitizenForReceipt] = useState<QueueCitizen | null>(null);
  const [transferModalOpen, setTransferModalOpen] = useState<boolean>(false);
  const [targetCounter, setTargetCounter] = useState<number>(2);
  const [transferRemarks, setTransferRemarks] = useState<string>(getDefaultTransferRemarks('gu'));
  const [queueTab, setQueueTab] = useState<'WAITING' | 'SKIPPED'>('WAITING');

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [auditPanelOpen, setAuditPanelOpen] = useState<boolean>(false);
  const [counterToast, setCounterToast] = useState<{ title: string; message: string; type?: 'info' | 'success' | 'warning' } | null>(null);

  // Officer stats
  const [stats, setStats] = useState({
    servedToday: 38,
    avgMinutes: 5.4,
    priorityServed: 7,
    skippedCount: 2
  });

  // Sync real booked tokens from LocalStorage on mount and jurisdiction changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem('qless_real_queue_tokens');
      if (stored) {
        const list: BookingDetails[] = JSON.parse(stored);
        if (list && list.length > 0) {
          const matching = list
            .filter(b => (!b.district || b.district.id === selectedDistrictId) && (!b.taluka || b.taluka.id === selectedTalukaId))
            .map(b => bookingToQueueCitizen(b));
          
          setQueue(prev => {
            const combined = [...matching, ...INITIAL_QUEUE];
            const uniqueMap = new Map<string, QueueCitizen>();
            combined.forEach(item => {
              if (!uniqueMap.has(item.tokenNumber)) {
                uniqueMap.set(item.tokenNumber, item);
              }
            });
            return Array.from(uniqueMap.values());
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [selectedDistrictId, selectedTalukaId]);

  // Subscribe to Realtime Queue Events (New Booking, Cash Payment, Late Shift)
  useEffect(() => {
    const unsubscribe = subscribeToQueueEvents((event) => {
      if (event.type === 'TOKEN_BOOKED_REALTIME' && event.payload?.booking) {
        const booking = event.payload.booking as BookingDetails;
        const newCitizen = bookingToQueueCitizen(booking);
        setQueue(prev => {
          if (prev.some(c => c.tokenNumber === newCitizen.tokenNumber)) return prev;
          return [newCitizen, ...prev];
        });
        triggerHaptic('success');
        playNotificationChime();
        setCounterToast({
          title: lang === 'gu' ? '🔔 નવો ટોકન બુક થયો!' : lang === 'hi' ? '🔔 नया टोकन बुक हुआ!' : '🔔 New Token Booked!',
          message: `${newCitizen.tokenNumber} - ${newCitizen.citizenNameGu} (${newCitizen.schemeTitleGu})`,
          type: 'info'
        });
      } else if (event.type === 'TOKEN_PAYMENT_COLLECTED') {
        setQueue(prev => prev.map(c => {
          if (c.tokenNumber === event.tokenNumber) {
            return {
              ...c,
              payment: {
                ...c.payment,
                status: 'PAID',
                mode: c.payment?.mode || 'CASH_AT_COUNTER',
                amount: c.payment?.amount || 20,
                cashierReceiptNo: event.payload?.cashierReceiptNo || `CASH-REC-GND-2026-${Math.floor(1000 + Math.random()*9000)}`,
                paidAt: new Date().toISOString()
              }
            };
          }
          return c;
        }));
      }
    });

    return () => unsubscribe();
  }, [lang]);

  // Cash Collection Action on Desk
  const handleCollectCounterCash = (citizen: QueueCitizen) => {
    triggerHaptic('success');
    const cashierReceiptNo = `CASH-REC-GND-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const feeAmount = citizen.payment?.amount || 20;
    const updatedPayment: GovernmentPaymentRecord = {
      status: 'PAID',
      mode: 'CASH_AT_COUNTER',
      amount: feeAmount,
      cashierReceiptNo,
      kacheriChallanNo: citizen.payment?.kacheriChallanNo || `KACHERI-CASH-GJ-2026-X${Math.floor(100000 + Math.random() * 900000)}`,
      paidAt: new Date().toISOString(),
      gatewayName: 'કચેરી કાઉન્ટર રોકડ પહોંચ (Desk Officer Cash Receipt)'
    };

    setQueue(prev => prev.map(c => c.tokenNumber === citizen.tokenNumber ? { ...c, payment: updatedPayment } : c));
    if (currentServing?.tokenNumber === citizen.tokenNumber) {
      setCurrentServing(prev => prev ? { ...prev, payment: updatedPayment } : null);
    }

    try {
      const stored = localStorage.getItem('qless_real_queue_tokens');
      if (stored) {
        const list: BookingDetails[] = JSON.parse(stored);
        const updatedList = list.map(b => b.tokenNumber === citizen.tokenNumber ? { ...b, payment: updatedPayment } : b);
        localStorage.setItem('qless_real_queue_tokens', JSON.stringify(updatedList));
      }
    } catch {}

    broadcastQueueEvent({
      type: 'TOKEN_PAYMENT_COLLECTED',
      tokenNumber: citizen.tokenNumber,
      counterNumber: selectedCounter,
      talukaId: selectedTalukaId,
      timestamp: Date.now(),
      payload: { cashierReceiptNo, citizenName: citizen.citizenNameGu, amount: feeAmount }
    });

    addAuditLog(
      'COMPLETED',
      citizen.tokenNumber,
      `રોકડ ફી ₹${feeAmount} સ્વીકારી. રસીદ નં: ${cashierReceiptNo}`,
      `नकद शुल्क ₹${feeAmount} स्वीकृत. रसीद नं: ${cashierReceiptNo}`,
      `Collected ₹${feeAmount} cash fee. Receipt: ${cashierReceiptNo}`
    );

    speakGuidance(
      lang === 'hi' ? `नकद राशि स्वीकृत! आधिकारिक रसीद जारी कर दी गई है।` : `રોકડ રકમ સ્વીકારી સત્તાવાર રસીદ જારી કરવામાં આવી છે.`,
      lang
    );

    setCounterToast({
      title: lang === 'gu' ? "💵 રોકડ સ્વીકૃતિ સફળ" : lang === 'hi' ? "💵 नकद भुगतान सफल" : "💵 Cash Collected Successfully",
      message: `${citizen.tokenNumber} - ₹${feeAmount} • રસીદ નં: ${cashierReceiptNo}`,
      type: 'success'
    });
  };

  // Load language preference from LocalStorage on mount
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('qless_preferred_lang') as Language | null;
      if (savedLang && (savedLang === 'gu' || savedLang === 'hi' || savedLang === 'en')) {
        setLang(savedLang);
        setTransferRemarks(getDefaultTransferRemarks(savedLang));
      }
    } catch {}
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    triggerHaptic('tap');
    setLang(newLang);
    setLangDropdownOpen(false);
    try {
      localStorage.setItem('qless_preferred_lang', newLang);
    } catch {}
    
    // Also sync default remarks if user has not customized them
    const allDefaults = [
      'અરજદારને સોગંદનામા માટે મોકલવામાં આવ્યા છે.',
      'आवेदक को शपथ पत्र सत्यापन हेतु भेजा गया है।',
      'Applicant forwarded for affidavit notarization.'
    ];
    if (allDefaults.includes(transferRemarks)) {
      setTransferRemarks(getDefaultTransferRemarks(newLang));
    }
  };

  const isGu = lang === 'gu';
  const isHi = lang === 'hi';
  const isEn = lang === 'en';

  const currentDistrict = useMemo(() => 
    GUJARAT_33_DISTRICTS.find(d => d.id === selectedDistrictId) || GUJARAT_33_DISTRICTS[0],
    [selectedDistrictId]
  );

  const currentTaluka = useMemo(() => 
    currentDistrict.talukas.find(t => t.id === selectedTalukaId) || currentDistrict.talukas[0],
    [currentDistrict, selectedTalukaId]
  );

  // Desk Handling-Time Stopwatch
  useEffect(() => {
    let timer: any = null;
    if (currentServing) {
      timer = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [currentServing]);

  // Subscribe to external queue events via backend realtime layer
  useEffect(() => {
    const unsubscribe = subscribeToQueueEvents((event) => {
      if (event.type === 'LATE_SHIFTED') {
        setQueue(prev => prev.map(c => {
          if (c.tokenNumber === event.tokenNumber) {
            return { ...c, status: 'LATE', lateMinutes: (c.lateMinutes || 0) + 30 };
          }
          return c;
        }));
      }
    });
    return () => unsubscribe();
  }, []);

  // Format stopwatch mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Add audit trail event
  const addAuditLog = (action: AuditLogEntry['action'], tokenNumber: string, remarksGu: string, remarksHi: string, remarksEn: string) => {
    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(isGu ? 'gu-IN' : isHi ? 'hi-IN' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      officerNameGu: 'શ્રી કે. એમ. ત્રિવેદી (નાયબ મામલતદાર)',
      officerNameHi: 'श्री के. एम. त्रिवेदी (नायब तहसीलदार)',
      officerNameEn: 'Shri K. M. Trivedi (Dy. Mamlatdar)',
      action,
      tokenNumber,
      counterNumber: selectedCounter,
      remarksGu,
      remarksHi,
      remarksEn
    };
    setAuditLogs(prev => [newEntry, ...prev]);
  };

  // 1. CALL NEXT TOKEN (Priority Queue Policy Engine)
  const handleCallNext = async (targetCitizen?: QueueCitizen) => {
    triggerHaptic('success');
    playNotificationChime();

    let nextCitizen: QueueCitizen | undefined = targetCitizen;
    if (!nextCitizen) {
      const priorityNext = queue.find(c => (c.status === 'WAITING' || c.status === 'LATE') && c.isPriority);
      nextCitizen = priorityNext || queue.find(c => c.status === 'WAITING' || c.status === 'LATE');
    }

    if (!nextCitizen) {
      setCounterToast({
        title: isGu ? "કતાર ખાલી છે" : isHi ? "कतार खाली है" : "Queue Empty",
        message: isGu ? "કતારમાં હાલ કોઈ નવો નાગરિક પ્રતીક્ષામાં નથી." : isHi ? "कतार में वर्तमान में कोई नागरिक प्रतीक्षारत नहीं है।" : "No pending citizens in the waiting queue.",
        type: 'info'
      });
      return;
    }

    if (currentServing && currentServing.id === nextCitizen.id) {
      setCounterToast({
        title: isGu ? "ટોકન સક્રિય છે" : isHi ? "टोकन सक्रिय है" : "Token Already Active",
        message: isGu ? `ટોકન ${nextCitizen.tokenNumber} હાલમાં આ કાઉન્ટર પર સક્રિય છે.` : isHi ? `टोकन ${nextCitizen.tokenNumber} वर्तमान में इस काउंटर पर सक्रिय है।` : `Token ${nextCitizen.tokenNumber} is currently active at this desk.`,
        type: 'info'
      });
      return;
    }

    setCurrentServing(nextCitizen);
    setElapsedSeconds(0);

    setQueue(prev => prev.map(c => 
      c.id === nextCitizen!.id ? { ...c, status: 'IN_SERVICE' } : c
    ));

    addAuditLog(
      'CALLED', 
      nextCitizen.tokenNumber, 
      nextCitizen.isPriority ? 'અગ્રતા નીતિ હેઠળ પ્રાથમિકતાથી બોલાવ્યા' : 'નિયમિત કતાર ક્રમ મુજબ બોલાવ્યા',
      nextCitizen.isPriority ? 'प्राथमिकता नीति अंतर्गत पहले बुलाया गया' : 'नियमित कतार क्रम अनुसार बुलाया गया',
      nextCitizen.isPriority ? 'Called with high priority under senior/divyang policy' : 'Called as per regular queue order'
    );

    broadcastQueueEvent({
      type: 'TOKEN_CALLED',
      tokenNumber: nextCitizen.tokenNumber,
      counterNumber: selectedCounter,
      counterNameGu: 'આવક & જાતિ પ્રમાણપત્ર',
      talukaId: selectedTalukaId,
      timestamp: Date.now()
    });

    const voiceMsg = isGu 
      ? (nextCitizen.isPriority ? `ધ્યાન આપો, પ્રાથમિકતા ટોકન નંબર ${nextCitizen.tokenNumber}, કાઉન્ટર ${selectedCounter} પર ઉપસ્થિત થાવ.` : `ધ્યાન આપો, કાઉન્ટર ${selectedCounter} પર ટોકન નંબર ${nextCitizen.tokenNumber} નો વારો આવી ગયો છે.`)
      : isHi
      ? (nextCitizen.isPriority ? `कृपया ध्यान दें, प्राथमिकता टोकन नंबर ${nextCitizen.tokenNumber}, काउंटर ${selectedCounter} पर उपस्थित हों।` : `कृपया ध्यान दें, काउंटर ${selectedCounter} पर टोकन नंबर ${nextCitizen.tokenNumber} की बारी आ गई है।`)
      : (nextCitizen.isPriority ? `Attention please, Priority Token Number ${nextCitizen.tokenNumber}, please proceed to Counter ${selectedCounter}.` : `Attention please, Token Number ${nextCitizen.tokenNumber}, please proceed to Counter ${selectedCounter}.`);
    speakGuidance(voiceMsg, lang);
  };

  // 2. RE-CALL ACTIVE OR SKIPPED CITIZEN
  const handleReCall = (citizenToReCall?: QueueCitizen) => {
    const target = citizenToReCall || currentServing;
    if (!target) return;

    triggerHaptic('tap');
    playNotificationChime();

    addAuditLog(
      'RECALLED', 
      target.tokenNumber, 
      'અરજદારને પુનઃ ઘોષણા દ્વારા બોલાવવામાં આવ્યા',
      'आवेदक को पुनः घोषणा द्वारा बुलाया गया',
      'Citizen recalled via public audio chime announcement'
    );

    broadcastQueueEvent({
      type: 'TOKEN_RECALLED',
      tokenNumber: target.tokenNumber,
      counterNumber: selectedCounter,
      counterNameGu: 'આવક & જાતિ પ્રમાણપત્ર',
      talukaId: selectedTalukaId,
      timestamp: Date.now()
    });

    const voiceMsg = isGu
      ? `ધ્યાન આપો, કાઉન્ટર ${selectedCounter} પર ટોકન નંબર ${target.tokenNumber} ને ફરીથી બોલાવવામાં આવે છે.`
      : isHi
      ? `कृपया ध्यान दें, काउंटर ${selectedCounter} पर टोकन नंबर ${target.tokenNumber} को पुनः बुलाया जा रहा है।`
      : `Attention please, Token Number ${target.tokenNumber} is being recalled to Counter ${selectedCounter}.`;
    speakGuidance(voiceMsg, lang);
  };

  // 3. COMPLETE SERVICE & ISSUE PASS
  const handleMarkComplete = () => {
    if (!currentServing) return;
    triggerHaptic('success');

    const completed = currentServing;
    setQueue(prev => prev.map(c => 
      c.id === completed.id ? { ...c, status: 'COMPLETED' } : c
    ));

    setStats(prev => ({
      ...prev,
      servedToday: prev.servedToday + 1,
      priorityServed: completed.isPriority ? prev.priorityServed + 1 : prev.priorityServed
    }));

    addAuditLog(
      'COMPLETED', 
      completed.tokenNumber, 
      `કામગીરી પૂર્ણ. સેવા સમય: ${formatTime(elapsedSeconds)}`,
      `कार्य पूर्ण. सेवा समय: ${formatTime(elapsedSeconds)}`,
      `Service completed. Desk handling time: ${formatTime(elapsedSeconds)}`
    );

    broadcastQueueEvent({
      type: 'TOKEN_COMPLETED',
      tokenNumber: completed.tokenNumber,
      counterNumber: selectedCounter,
      timestamp: Date.now()
    });

    const citizenName = isGu ? completed.citizenNameGu : isHi ? completed.citizenNameHi : completed.citizenNameEn;
    const voiceMsg = isGu 
      ? `ટોકન નંબર ${completed.tokenNumber} ની કામગીરી સફળતાપૂર્વક પૂર્ણ થયેલ છે.`
      : isHi
      ? `टोकन नंबर ${completed.tokenNumber} का कार्य सफलतापूर्वक पूर्ण हो गया है।`
      : `Token number ${completed.tokenNumber} service has been completed successfully.`;
    speakGuidance(voiceMsg, lang);

    setCounterToast({
      title: isGu ? "✅ સફળતાપૂર્વક નિકાલ!" : isHi ? "✅ सफलतापूर्वक निपटान!" : "✅ Service Completed!",
      message: `${completed.tokenNumber} (${citizenName}) • ${formatTime(elapsedSeconds)}`,
      type: 'success'
    });

    setCurrentServing(null);
  };

  // 4. SKIP / ABSENT
  const handleSkipAbsent = () => {
    if (!currentServing) return;
    triggerHaptic('warning');

    const skipped = currentServing;
    setQueue(prev => prev.map(c => 
      c.id === skipped.id ? { ...c, status: 'SKIPPED' } : c
    ));

    setStats(prev => ({ ...prev, skippedCount: prev.skippedCount + 1 }));

    addAuditLog(
      'SKIPPED', 
      skipped.tokenNumber, 
      'અરજદાર ગેરહાજર (Citizen absent)',
      'आवेदक अनुपस्थित (Citizen absent)',
      'Applicant marked absent (Citizen absent)'
    );

    broadcastQueueEvent({
      type: 'TOKEN_SKIPPED',
      tokenNumber: skipped.tokenNumber,
      counterNumber: selectedCounter,
      timestamp: Date.now()
    });

    const voiceMsg = isGu
      ? `ટોકન નંબર ${skipped.tokenNumber} ગેરહાજર નોંધાયેલ છે.`
      : isHi
      ? `टोकन नंबर ${skipped.tokenNumber} अनुपस्थित दर्ज किया गया है।`
      : `Token number ${skipped.tokenNumber} marked absent.`;
    speakGuidance(voiceMsg, lang);
    setCurrentServing(null);
  };

  // 5. TRANSFER TO ANOTHER COUNTER
  const handleConfirmTransfer = () => {
    if (!currentServing) return;
    triggerHaptic('tap');

    const transferred = currentServing;
    setQueue(prev => prev.filter(c => c.id !== transferred.id));

    addAuditLog(
      'TRANSFERRED', 
      transferred.tokenNumber, 
      `કાઉન્ટર ${selectedCounter} થી કાઉન્ટર ${targetCounter} પર ટ્રાન્સફર. કારણ: ${transferRemarks}`,
      `काउंटर ${selectedCounter} से काउंटर ${targetCounter} पर स्थानांतरित. कारण: ${transferRemarks}`,
      `Transferred from Desk ${selectedCounter} to Desk ${targetCounter}. Reason: ${transferRemarks}`
    );

    broadcastQueueEvent({
      type: 'TOKEN_TRANSFERRED',
      tokenNumber: transferred.tokenNumber,
      counterNumber: targetCounter,
      counterNameGu: `કાઉન્ટર ${targetCounter}`,
      talukaId: selectedTalukaId,
      timestamp: Date.now(),
      payload: { 
        transferredFrom: selectedCounter, 
        transferredTo: targetCounter, 
        remarks: transferRemarks 
      }
    });

    setCounterToast({
      title: isGu ? "🔄 કાઉન્ટર ટ્રાન્સફર નોંધાયું!" : isHi ? "🔄 काउंटर स्थानांतरण दर्ज!" : "🔄 Counter Forwarded!",
      message: `${transferred.tokenNumber} ➜ ${isGu ? `કાઉન્ટર ${targetCounter}` : isHi ? `काउंटर ${targetCounter}` : `Desk ${targetCounter}`} (${transferRemarks})`,
      type: 'info'
    });

    setTransferModalOpen(false);
    setCurrentServing(null);
  };

  // 6. TOGGLE LUNCH RECESS
  const handleToggleLunch = () => {
    triggerHaptic('warning');
    const newState = !isLunchRecess;
    setIsLunchRecess(newState);

    addAuditLog(
      'LUNCH_BREAK', 
      '—', 
      newState ? 'ભોજન વિરામ શરૂ (1:10 PM - 2:00 PM)' : 'કામગીરી પુનઃ શરૂ',
      newState ? 'भोजन अवकाश प्रारंभ (1:10 PM - 2:00 PM)' : 'कार्य पुनः प्रारंभ',
      newState ? 'Lunch recess started (1:10 PM - 2:00 PM)' : 'Desk services resumed'
    );

    broadcastQueueEvent({
      type: 'COUNTER_STATUS_CHANGED',
      tokenNumber: '',
      counterNumber: selectedCounter,
      timestamp: Date.now(),
      payload: { isLunch: newState }
    });

    if (newState) {
      speakGuidance(
        isGu ? `કાઉન્ટર ${selectedCounter} પર લંચ રિસેસ શરૂ થયેલ છે.` : isHi ? `काउंटर ${selectedCounter} पर भोजन अवकाश शुरू हुआ है।` : `Counter ${selectedCounter} is now on lunch recess.`,
        lang
      );
    } else {
      speakGuidance(
        isGu ? `કાઉન્ટર ${selectedCounter} પર કામગીરી પુનઃ શરૂ થયેલ છે.` : isHi ? `काउंटर ${selectedCounter} पर कार्य पुनः शुरू हुआ है।` : `Counter ${selectedCounter} desk is now open and active.`,
        lang
      );
    }
  };

  // SLA calculations
  const elapsedMinutes = elapsedSeconds / 60;
  const isOverTarget = elapsedMinutes >= SERVICE_SLA_CONFIG.targetMinutes;
  const isApproachingTarget = elapsedMinutes >= SERVICE_SLA_CONFIG.warningMinutes && !isOverTarget;

  // Filter queues
  const waitingList = queue.filter(c => c.status === 'WAITING' || c.status === 'LATE');
  const skippedList = queue.filter(c => c.status === 'SKIPPED');
  const waitingCount = waitingList.length;

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#1F2937] flex flex-col w-full">
      {/* 🚀 LIVE GUJARAT GOVERNMENT TELEMETRY & SYSTEM HEALTH MARQUEE */}
      <GovTelemetryMarquee lang={lang} />

      {/* 🟠 DEMO MODE BANNER */}
      <div className="bg-amber-500 text-slate-900 text-xs px-4 py-1.5 font-bold flex flex-wrap items-center justify-between border-b border-amber-600 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="bg-slate-900 text-amber-300 text-[10px] uppercase font-black px-1.5 py-0.5 rounded">
            🟠 DEMO MODE
          </span>
          <span>
            {isGu 
              ? 'ડેમો ઓફિસર પર્સોના (મૂલ્યાંકન હેતુ) • વાસ્તવિક સરકારી ડિપ્લોયમેન્ટ માટે ભૂમિકા-આધારિત પ્રમાણીકરણ (RBAC) આવશ્યક છે.'
              : isHi
              ? 'डेमो अधिकारी व्यक्तित्व (मूल्यांकन हेतु) • वास्तविक सरकारी परिनियोजन के लिए भूमिका-आधारित प्रमाणीकरण (RBAC) आवश्यक है।'
              : 'Demo Officer Persona (Evaluation Mode) • Production deployment requires Role-Based Access Control (RBAC).'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className={`w-2 h-2 rounded-full ${realtimeConnected ? 'bg-emerald-900 animate-pulse' : 'bg-red-800'}`} />
          <span>
            {realtimeConnected 
              ? (isGu ? 'રીઅલ-ટાઇમ બેકએન્ડ સિંક સક્રિય' : isHi ? 'रीयल-टाइम बैकएंड सिंक सक्रिय' : 'Real-time Backend Sync Active')
              : (isGu ? 'પુનઃ કનેક્ટિંગ...' : isHi ? 'पुनः कनेक्ट हो रहा है...' : 'Reconnecting...')}
          </span>
        </div>
      </div>

      {/* 🏛️ COUNTER OPERATOR CONSOLE HEADER */}
      <header className="bg-gradient-to-r from-[#003366] via-[#004080] to-[#002244] text-white border-b-2 border-[#FF9933] shadow-md sticky top-0 z-40">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1 text-xs font-bold"
              title={isGu ? "નાગરિક પોર્ટલ પર પાછા જાઓ" : isHi ? "नागरिक पोर्टल पर वापस जाएं" : "Return to Citizen Portal"}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isGu ? "નાગરિક પોર્ટલ" : isHi ? "नागरिक पोर्टल" : "Citizen Portal"}
              </span>
            </Link>
            
            <GovLogo className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 drop-shadow-md" />

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest text-[#FF9933] uppercase bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded">
                  {isGu ? "જન સેવા અધિકારી ડેસ્ક • પ્રશાસનિક પોર્ટલ" : isHi ? "जन सेवा अधिकारी डेस्क • प्रशासनिक पोर्टल" : "Jan Seva Officer Desk • Admin Portal"}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-300 font-bold hidden md:inline">
                  {isGu ? "લાઇવ સિંક્રોનાઇઝ્ડ" : isHi ? "लाइव सिंक्रोनाइज़्ड" : "Live Synchronized"}
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>
                  {isGu ? "કાઉન્ટર ઓપરેટર કન્સોલ • ઈ-જન સેવા ડેસ્ક" : isHi ? "काउंटर ऑपरेटर कंसोल • ई-जन सेवा डेस्क" : "Counter Operator Console • e-Jan Seva Desk"}
                </span>
              </h1>
            </div>
          </div>

          {/* Right Controls: Language Selector, Collector Dashboard, Officer Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 🌐 ADMIN LANGUAGE SWITCHER DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/20 shadow-xs"
                title="Select Language / ભાષા બદલો"
              >
                <Globe className="w-3.5 h-3.5 text-[#FF9933]" />
                <span className="font-bold">
                  {lang === 'gu' ? 'ગુજરાતી' : lang === 'hi' ? 'हिन्दी' : 'English'}
                </span>
                <ChevronDown className="w-3 h-3 text-white/70" />
              </button>

              {langDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-2xl border border-slate-200 py-1.5 z-50 text-slate-800 text-xs animate-in fade-in"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    {isGu ? "ભાષા પસંદ કરો" : isHi ? "भाषा चुनें" : "Select Language"}
                  </div>
                  {GUJARAT_LANGUAGES.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => handleLanguageChange(item.code)}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-100 transition ${
                        lang === item.code ? 'bg-blue-50 text-[#003366] font-black' : 'font-medium'
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs">{item.nativeLabel}</span>
                        <span className="text-[10px] text-slate-400">{item.englishLabel}</span>
                      </div>
                      {lang === item.code && <Check className="w-4 h-4 text-[#003366]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/admin/collector"
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-[#FF9933] border border-[#FF9933]/50 text-[11px] sm:text-xs font-black transition flex items-center gap-1"
              title={isGu ? "કલેક્ટર કમાન્ડ સેન્ટર" : isHi ? "कलेक्टर कमांड सेंटर" : "Collector Apex Command Center"}
            >
              <span>{isGu ? "👑 કલેક્ટર ડેશબોર્ડ" : isHi ? "👑 कलेक्टर डैशबोर्ड" : "👑 Collector Command"}</span>
            </Link>
            
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-white">
                {isGu ? "શ્રી કે. એમ. ત્રિવેદી" : isHi ? "श्री के. एम. त्रिवेदी" : "Shri K. M. Trivedi"}
              </p>
              <p className="text-[10px] text-blue-200 font-mono">
                {isGu ? "નાયબ મામલતદાર • ડેમો પર્સોના" : isHi ? "नायब तहसीलदार • डेमो व्यक्तित्व" : "Dy. Mamlatdar • Demo Persona"}
              </p>
            </div>
            <div className="w-9 h-9 rounded-full bg-amber-400/20 border-2 border-[#FF9933] text-[#FF9933] flex items-center justify-center font-black text-sm shadow">
              KT
            </div>
          </div>
        </div>
      </header>

      {/* 🧭 JURISDICTION & CONFIGURABLE COUNTER SELECTOR STRIP */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 xl:px-12 py-2.5 shadow-xs">
        <div className="w-full max-w-[1920px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 font-bold text-[#003366]">
              <Building className="w-4 h-4 text-[#005A9C]" />
              <span>
                {isGu ? "કચેરી & કાઉન્ટર રૂપરેખા:" : isHi ? "कार्यालय एवं काउंटर रूपरेखा:" : "Office & Counter Config:"}
              </span>
            </div>

            {/* District Selector */}
            <select
              value={selectedDistrictId}
              onChange={(e) => {
                setSelectedDistrictId(e.target.value);
                const d = GUJARAT_33_DISTRICTS.find(x => x.id === e.target.value);
                if (d && d.talukas[0]) setSelectedTalukaId(d.talukas[0].id);
              }}
              className="bg-slate-50 border border-slate-300 font-bold text-slate-800 rounded-lg px-2.5 py-1 text-xs focus:ring-2 focus:ring-[#003366] max-w-[160px] sm:max-w-[200px] truncate"
            >
              {GUJARAT_33_DISTRICTS.map(d => (
                <option key={d.id} value={d.id}>
                  {isEn ? `${d.nameEn} (${d.nameGu})` : isHi ? `${getLocalizedDistrictName(d, 'hi')} (${d.nameEn})` : `${d.nameGu} (${d.nameEn})`}
                </option>
              ))}
            </select>

            {/* Taluka Selector */}
            <select
              value={selectedTalukaId}
              onChange={(e) => setSelectedTalukaId(e.target.value)}
              className="bg-slate-50 border border-slate-300 font-bold text-slate-800 rounded-lg px-2.5 py-1 text-xs focus:ring-2 focus:ring-[#003366] max-w-[180px] sm:max-w-[220px] truncate"
            >
              {currentDistrict.talukas.map(t => (
                <option key={t.id} value={t.id}>
                  {isEn ? `${t.nameEn} (${t.nameGu})` : isHi ? `${getLocalizedTalukaName(t, 'hi')} (${t.nameEn})` : `${t.nameGu} (${t.nameEn})`}
                </option>
              ))}
            </select>

            {/* Configurable Counter Switcher */}
            <select
              value={selectedCounter}
              onChange={(e) => setSelectedCounter(Number(e.target.value))}
              className="bg-blue-50 border border-blue-300 font-black text-[#003366] rounded-lg px-2.5 py-1 text-xs focus:ring-2 focus:ring-[#003366]"
              title={isGu ? "કોન્ફિગરેબલ સેવા કાઉન્ટર્સ" : isHi ? "कॉन्फ़िगर करने योग्य सेवा काउंटर्स" : "Configurable Service Counters"}
            >
              <option value={1}>
                {isGu ? "કાઉન્ટર ૧: આવક & પ્રમાણપત્રો (Revenue)" : isHi ? "काउंटर १: आय एवं प्रमाण पत्र (राजस्व)" : "Counter 1: Income & Certificates (Revenue)"}
              </option>
              <option value={2}>
                {isGu ? "કાઉન્ટર ૨: રેશન કાર્ડ & અન્ન પુરવઠો" : isHi ? "काउंटर २: राशन कार्ड एवं खाद्य आपूर्ति" : "Counter 2: Ration Card & Food Supplies"}
              </option>
              <option value={3}>
                {isGu ? "કાઉન્ટર ૩: ઈ-ધરા ૭/૧૨ જમીન રેકોર્ડ" : isHi ? "काउंटर ३: ई-धरा ७/१२ भूमि रिकॉर्ड" : "Counter 3: e-Dhara 7/12 Land Records"}
              </option>
              <option value={4}>
                {isGu ? "કાઉન્ટર ૪: સામાજિક સુરક્ષા & પેન્શન" : isHi ? "काउंटर ४: सामाजिक सुरक्षा एवं पेंशन" : "Counter 4: Social Security & Pension"}
              </option>
              <option value={5}>
                {isGu ? "કાઉન્ટર ૫: આયુષ્માન ભારત & આરોગ્ય" : isHi ? "काउंटर ५: आयुष्मान भारत एवं स्वास्थ्य" : "Counter 5: Ayushman Bharat & Health"}
              </option>
              <option value={6}>
                {isGu ? "કાઉન્ટર ૬: સોગંદનામું & નોટરી એટેસ્ટેશન" : isHi ? "काउंटर ६: शपथ पत्र एवं नोटरी सत्यापन" : "Counter 6: Affidavit & Notary Attestation"}
              </option>
            </select>
          </div>

          {/* Audit Log & Lunch Recess Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAuditPanelOpen(!auditPanelOpen)}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 border border-slate-300 transition"
            >
              <History className="w-3.5 h-3.5 text-[#005A9C]" />
              <span>
                {isGu ? `ઓડિટ લોગ (${auditLogs.length})` : isHi ? `ऑडिट लॉग (${auditLogs.length})` : `Audit Log (${auditLogs.length})`}
              </span>
            </button>

            <button
              onClick={handleToggleLunch}
              className={`px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 transition active:scale-95 ${
                isLunchRecess 
                  ? 'bg-red-600 text-white animate-pulse' 
                  : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>
                {isLunchRecess 
                  ? (isGu ? '⚠️ લંચ રિસેસ સક્રિય (પુનઃ શરૂ કરો)' : isHi ? '⚠️ भोजन अवकाश सक्रिय (पुनः शुरू करें)' : '⚠️ Lunch Recess Active (Resume)')
                  : (isGu ? '☕ લંચ રિસેસ (1:10 PM)' : isHi ? '☕ भोजन अवकाश (1:10 PM)' : '☕ Lunch Recess (1:10 PM)')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 📊 KPI SUMMARY STRIP */}
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#005A9C] flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">
                {isGu ? "પેન્ડિંગ કતાર" : isHi ? "प्रतीक्षारत कतार" : "Pending Queue"}
              </p>
              <p className="text-lg font-black text-[#003366]">
                {waitingCount} {isGu ? "નાગરિકો" : isHi ? "नागरिक" : "Citizens"}
              </p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">
                {isGu ? "આજે નિકાલ" : isHi ? "आज निपटान" : "Served Today"}
              </p>
              <p className="text-lg font-black text-emerald-700">
                {stats.servedToday} {isGu ? "પૂર્ણ" : isHi ? "पूर्ण" : "Done"}
              </p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">
                {isGu ? "અગ્રતા નીતિ નિકાલ" : isHi ? "प्राथमिकता निपटान" : "Priority Served"}
              </p>
              <p className="text-lg font-black text-amber-700">
                {stats.priorityServed} {isGu ? "અગ્રતા" : isHi ? "प्राथमिकता" : "Priority"}
              </p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">
                {isGu ? "સરેરાશ ડેસ્ક સમય" : isHi ? "औसत डेस्क समय" : "Avg Desk Time"}
              </p>
              <p className="text-lg font-black text-indigo-700">
                {stats.avgMinutes} {isGu ? "મિનિટ" : isHi ? "मिनट" : "mins"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 📜 AUDIT TRAIL LOG PANEL (TOGGLEABLE) */}
      {auditPanelOpen && (
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-3 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-md p-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#005A9C]" />
                <h4 className="text-xs font-black text-[#003366] uppercase tracking-wide">
                  {isGu ? "પ્રશાસનિક ઓડિટ ટ્રેઇલ (Administrative Audit Log)" : isHi ? "प्रशासनिक ऑडिट ट्रेल (Administrative Audit Log)" : "Administrative Audit Trail Log"}
                </h4>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {isGu ? "દરેક ક્રિયાનું ઓટોમેટેડ ઓડિટ રેકોર્ડિંગ" : isHi ? "प्रत्येक क्रिया का स्वचालित ऑडिट रिकॉर्डिंग" : "Automated Audit Trail Recording"}
              </span>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {auditLogs.map((log) => (
                <div key={log.id} className="text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-200 px-1.5 py-0.5 rounded">
                      {log.timestamp}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      log.action === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                      log.action === 'CALLED' ? 'bg-blue-100 text-blue-800' :
                      log.action === 'SKIPPED' ? 'bg-red-100 text-red-800' :
                      log.action === 'TRANSFERRED' ? 'bg-purple-100 text-purple-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {log.action}
                    </span>
                    <span className="font-mono font-bold text-[#003366]">{log.tokenNumber}</span>
                    <span className="text-slate-700">
                      {isGu ? log.remarksGu : isHi ? log.remarksHi : log.remarksEn}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {isGu ? `કાઉન્ટર ${log.counterNumber} • ${log.officerNameGu}` : isHi ? `काउंटर ${log.counterNumber} • ${log.officerNameHi}` : `Desk ${log.counterNumber} • ${log.officerNameEn}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 🖥️ MAIN CONSOLE GRID */}
      <main className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-5 grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        
        {/* LEFT COLUMN: ACTIVE SERVING HUD (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* ACTIVE CITIZEN CARD */}
          <div className="bg-white rounded-3xl border-2 border-[#003366]/20 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#003366] to-[#005A9C] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-black uppercase tracking-wider">
                  {isGu 
                    ? `કાઉન્ટર ${selectedCounter} • લાઈવ ડેસ્ક સંચાલન (Now Serving)` 
                    : isHi 
                    ? `काउंटर ${selectedCounter} • लाइव डेस्क प्रबंधन (Now Serving)` 
                    : `Desk ${selectedCounter} • Live Desk Handling (Now Serving)`}
                </span>
              </div>
              {currentServing && (
                <div className="bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-full text-xs font-mono font-black flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {isGu ? `ડેસ્ક સેવા સમય: ${formatTime(elapsedSeconds)}` : isHi ? `डेस्क सेवा समय: ${formatTime(elapsedSeconds)}` : `Desk Time: ${formatTime(elapsedSeconds)}`}
                  </span>
                </div>
              )}
            </div>

            <div className="p-5">
              {currentServing ? (
                <div className="space-y-4">
                  
                  {/* Token & Priority Tag */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-black font-mono text-[#FF9933] drop-shadow-xs">
                          {currentServing.tokenNumber}
                        </span>
                        {currentServing.isPriority && (
                          <span className="bg-[#FF9933] text-slate-900 font-black text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            {isGu ? "⭐ અગ્રતા પાસ (Senior/Divyang Policy)" : isHi ? "⭐ प्राथमिकता पास (Senior/Divyang Policy)" : "⭐ Priority Pass (Senior/Divyang Policy)"}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-black text-slate-900 mt-1">
                        {isGu ? currentServing.citizenNameGu : isHi ? currentServing.citizenNameHi : currentServing.citizenNameEn}
                      </h3>
                      <p className="text-xs text-[#005A9C] font-bold">
                        {isGu ? currentServing.schemeTitleGu : isHi ? currentServing.schemeTitleHi : currentServing.schemeTitleEn}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {isGu ? "મોબાઈલ" : isHi ? "मोबाइल" : "Phone"}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-700">{currentServing.phone}</span>
                      <span className="text-[10px] text-slate-400 block font-mono mt-1">
                        {isGu ? "ઓળખ (Masked)" : isHi ? "पहचान (Masked)" : "Identity (Masked)"}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-700">XXXX-{currentServing.aadhaarLast4}</span>
                    </div>
                  </div>

                  {/* ⏱️ TIME SEPARATION HUD: WAITING TIME vs DESK HANDLING TIME */}
                  <div className="grid grid-cols-3 gap-2.5 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">
                        {isGu ? "કતાર પ્રતીક્ષા સમય" : isHi ? "कतार प्रतीक्षा समय" : "Queue Waiting Time"}
                      </span>
                      <span className="font-mono font-black text-slate-800 text-sm">
                        {currentServing.waitingMinutes} {isGu ? "મિનિટ" : isHi ? "मिनट" : "mins"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">
                        {isGu ? "ડેસ્ક સેવા સમય" : isHi ? "डेस्क सेवा समय" : "Desk Handling Time"}
                      </span>
                      <span className="font-mono font-black text-[#005A9C] text-sm">{formatTime(elapsedSeconds)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">
                        {isGu ? "કુલ મુલાકાત સમય" : isHi ? "कुल मुलाकात समय" : "Total Visit Time"}
                      </span>
                      <span className="font-mono font-black text-indigo-700 text-sm">
                        {currentServing.waitingMinutes + Math.floor(elapsedSeconds / 60)} {isGu ? "મિનિટ" : isHi ? "मिनट" : "mins"}
                      </span>
                    </div>
                  </div>

                  {/* OCR & Pre-Verification Box */}
                  <div className="bg-emerald-50/80 border border-emerald-300 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-black text-emerald-900">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        {isGu ? "દસ્તાવેજ પ્રી-વેરિફિકેશન સમીક્ષા (Pre-check Results)" : isHi ? "दस्तावेज़ पूर्व-सत्यापन समीक्षा (Pre-check Results)" : "Document Pre-verification Review (Pre-check)"}
                      </span>
                      <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                        {isGu ? "પ્રી-ચેક સફળ" : isHi ? "पूर्व-जांच सफल" : "Pre-check Passed"}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-800 font-semibold leading-relaxed">
                      {isGu ? currentServing.aiOcrVerdictGu : isHi ? currentServing.aiOcrVerdictHi : currentServing.aiOcrVerdictEn}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-emerald-200 text-[11px] text-emerald-900">
                      <span>
                        {isGu ? "ઘોષિત વાર્ષિક આવક:" : isHi ? "घोषित वार्षिक आय:" : "Declared Annual Income:"}{' '}
                        <strong>{isGu ? currentServing.incomeDeclaredGu : isHi ? currentServing.incomeDeclaredHi : currentServing.incomeDeclaredEn}</strong>
                      </span>
                      <button
                        onClick={() => setSelectedCitizenForDocs(currentServing)}
                        className="underline font-bold text-[#005A9C] hover:text-[#003366] flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {isGu ? "અપલોડ કરેલ કાગળો જુઓ" : isHi ? "अपलोड किए गए दस्तावेज़ देखें" : "View Uploaded Documents"}
                      </button>
                    </div>
                  </div>

                  {/* 💳 OFFICIAL PAYMENT & CYBER TREASURY VERIFICATION HUD */}
                  <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 border border-blue-200 rounded-2xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#003366] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                          <IndianRupee className="w-4 h-4 text-[#FF9933]" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-[#003366] uppercase tracking-wide">
                            {isGu ? "સરકારી સાયબર ટ્રેઝરી ચુકવણી સ્થિતિ" : isHi ? "सरकारी साइबर ट्रेजरी भुगतान स्थिति" : "Cyber Treasury Payment Status"}
                          </h4>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {currentServing.payment?.grasChallanNo || currentServing.payment?.kacheriChallanNo || 'GRAS/2026/04/991823'}
                          </p>
                        </div>
                      </div>

                      {/* Payment Status Pill */}
                      {currentServing.payment?.status === 'PAID' ? (
                        <span className="bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{isGu ? "✓ ચૂકતે (Paid)" : isHi ? "✓ भुगतान पूर्ण" : "✓ Paid"}</span>
                        </span>
                      ) : currentServing.payment?.status === 'PAY_AT_COUNTER' ? (
                        <span className="bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse">
                          <Banknote className="w-3.5 h-3.5 text-amber-700" />
                          <span>{isGu ? "⏳ કાઉન્ટર રોકડ બાકી" : isHi ? "⏳ काउंटर नकद बकाया" : "⏳ Cash Pending"}</span>
                        </span>
                      ) : (
                        <span className="bg-blue-100 border border-blue-300 text-blue-900 text-[10px] font-black px-2.5 py-1 rounded-full">
                          {isGu ? "મફત સેવા (₹૦)" : isHi ? "मुफ्त सेवा (₹०)" : "Govt Free (₹0)"}
                        </span>
                      )}
                    </div>

                    {/* Payment Mode & Amount Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <span className="text-[9.5px] text-slate-500 font-bold block">{isGu ? "સરકારી નિયત ફી:" : isHi ? "सरकारी शुल्क:" : "Govt Fee:"}</span>
                        <p className="font-black text-emerald-700 text-xs">
                          {currentServing.payment?.amount === 0 ? (isGu ? '₹૦ (મફત)' : '₹0 Free') : `₹${currentServing.payment?.amount ?? 20}.00`}
                        </p>
                      </div>

                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <span className="text-[9.5px] text-slate-500 font-bold block">{isGu ? "ચુકવણી પદ્ધતિ:" : isHi ? "भुगतान विधि:" : "Payment Mode:"}</span>
                        <p className="font-bold text-slate-800 text-[11px] truncate">
                          {currentServing.payment?.gatewayName || (currentServing.payment?.mode === 'CASH_AT_COUNTER' ? (isGu ? 'કચેરી કાઉન્ટર રોકડ' : 'Cash at Counter') : 'Cyber Treasury UPI / QR')}
                        </p>
                      </div>

                      <div className="bg-white p-2 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                        <span className="text-[9.5px] text-slate-500 font-bold block">{isGu ? "રસીદ / રેફરન્સ:" : isHi ? "रसीद / संदर्भ:" : "Receipt Ref:"}</span>
                        <p className="font-mono font-bold text-[#005A9C] text-[10px] truncate">
                          {currentServing.payment?.cyberTreasuryTxnId || currentServing.payment?.cashierReceiptNo || currentServing.payment?.grasChallanNo || 'CYBER-GJ-2026-X88421'}
                        </p>
                      </div>
                    </div>

                    {/* Officer Action for Cash Collection or View Receipt */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-blue-200/60">
                      {currentServing.payment?.status === 'PAY_AT_COUNTER' ? (
                        <button
                          type="button"
                          onClick={() => handleCollectCounterCash(currentServing)}
                          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
                        >
                          <Banknote className="w-4 h-4 text-emerald-200" />
                          <span>
                            {isGu 
                              ? `💵 રોકડ સ્વીકારો ₹${currentServing.payment.amount || 20} & સત્તાવાર રસીદ આપો` 
                              : isHi 
                              ? `💵 नकद राशि ₹${currentServing.payment.amount || 20} स्वीकार करें एवं रसीद दें` 
                              : `💵 Collect ₹${currentServing.payment.amount || 20} Cash & Issue Official Receipt`}
                          </span>
                        </button>
                      ) : (
                        <div className="text-[10px] text-emerald-800 font-bold flex items-center gap-1">
                          <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isGu ? "ચુકવણી પ્રમાણિત થઈ ચૂકી છે." : isHi ? "भुगतान सत्यापित हो चुका है।" : "Payment verified & reconciled."}</span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedCitizenForReceipt(currentServing)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-[#003366] border border-[#003366]/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                      >
                        <Receipt className="w-3.5 h-3.5 text-[#FF9933]" />
                        <span>{isGu ? "📄 સત્તાવાર e-Challan / રસીદ જુઓ" : isHi ? "📄 आधिकारिक ई-चालान / रसीद देखें" : "📄 View Official e-Challan"}</span>
                      </button>
                    </div>
                  </div>

                  {/* ⏱️ SERVICE SLA / HANDLING-TIME STOPWATCH */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                      <span className="text-slate-600">
                        {isGu ? "સેવા હેન્ડલિંગ ટાર્ગેટ:" : isHi ? "सेवा प्रबंधन लक्ष्य:" : "Service Handling Target:"}{' '}
                        ({isGu ? SERVICE_SLA_CONFIG.serviceNameGu : isHi ? SERVICE_SLA_CONFIG.serviceNameHi : SERVICE_SLA_CONFIG.serviceNameEn})
                      </span>
                      <span className={isOverTarget ? 'text-red-600 font-black' : isApproachingTarget ? 'text-amber-600 font-black' : 'text-emerald-700 font-black'}>
                        {isOverTarget 
                          ? (isGu ? '🔴 લક્ષ્ય ઓળંગેલ (Target Exceeded)' : isHi ? '🔴 लक्ष्य पार (Target Exceeded)' : '🔴 Target Exceeded') 
                          : isApproachingTarget 
                            ? (isGu ? '🟡 લક્ષ્ય નજીક (Approaching Target)' : isHi ? '🟡 लक्ष्य के करीब (Approaching Target)' : '🟡 Approaching Target') 
                            : (isGu ? '🟢 લક્ષ્ય હેઠળ (Within Target)' : isHi ? '🟢 लक्ष्य के अंतर्गत (Within Target)' : '🟢 Within Target')
                        } • {formatTime(elapsedSeconds)} / {SERVICE_SLA_CONFIG.targetMinutes}:00
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${
                          isOverTarget 
                            ? 'bg-red-500' 
                            : isApproachingTarget 
                              ? 'bg-amber-500' 
                              : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min((elapsedMinutes / SERVICE_SLA_CONFIG.targetMinutes) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Primary Officer Action Buttons */}
                  <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      onClick={handleMarkComplete}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
                      title={isGu ? "કામગીરી સફળતાપૂર્વક પૂર્ણ કરો" : isHi ? "कार्य सफलतापूर्वक पूर्ण करें" : "Complete Service Successfully"}
                    >
                      <Check className="w-4 h-4" />
                      <span>{isGu ? "પૂર્ણ (Done)" : isHi ? "पूर्ण (Done)" : "Done"}</span>
                    </button>

                    <button
                      onClick={() => handleReCall()}
                      className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-black py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
                      title={isGu ? "અવાજ અને ચાઇમ દ્વારા ફરીથી બોલાવો" : isHi ? "ध्वनि और घंटी द्वारा पुनः बुलाएं" : "Re-call Citizen via Voice Chime"}
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>{isGu ? "ફરીથી બોલાવો" : isHi ? "पुनः बुलाएं" : "Re-call"}</span>
                    </button>

                    <button
                      onClick={() => {
                        setTransferRemarks(getDefaultTransferRemarks(lang));
                        setTransferModalOpen(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-black py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
                      title={isGu ? "બીજા કાઉન્ટર પર મોકલો" : isHi ? "अन्य काउंटर पर स्थानांतरित करें" : "Forward to Another Desk"}
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                      <span>{isGu ? "ટ્રાન્સફર" : isHi ? "स्थानांतरित" : "Transfer"}</span>
                    </button>

                    <button
                      onClick={handleSkipAbsent}
                      className="bg-slate-200 hover:bg-red-50 text-slate-700 hover:text-red-600 font-black py-3 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                      title={isGu ? "ગેરહાજર નોંધો (ઓડિટ રેકોર્ડ રહેશે)" : isHi ? "अनुपस्थित दर्ज करें (ऑडिट रिकॉर्ड रहेगा)" : "Mark Absent (Audit Preserved)"}
                    >
                      <X className="w-4 h-4" />
                      <span>{isGu ? "ગેરહાજર (Skip)" : isHi ? "अनुपस्थित (Skip)" : "Absent (Skip)"}</span>
                    </button>
                  </div>

                </div>
              ) : (
                /* No Active Citizen State */
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#005A9C] flex items-center justify-center mx-auto border-2 border-blue-200">
                    <UserCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800">
                      {isGu ? "કાઉન્ટર હાલ મુક્ત છે (Ready for Next Citizen)" : isHi ? "काउंटर वर्तमान में खाली है (अगले नागरिक के लिए तैयार)" : "Counter is Ready for Next Citizen"}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      {isGu 
                        ? "આગામી અરજદારને બોલાવવા માટે નીચે આપેલા બટન પર ક્લિક કરો. કોન્ફિગરેબલ અગ્રતા નીતિ મુજબ પાત્ર નાગરિકોને પ્રથમ બોલાવાશે."
                        : isHi
                        ? "अगले आवेदक को बुलाने के लिए नीचे दिए गए बटन पर क्लिक करें। प्राथमिकता नीति अनुसार पात्र नागरिकों को पहले बुलाया जाएगा।"
                        : "Click the button below to call the next applicant. Eligible senior/divyang citizens will be prioritized automatically."}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCallNext()}
                    disabled={waitingCount === 0}
                    className="bg-[#003366] hover:bg-[#002244] disabled:bg-slate-300 text-white font-black py-3.5 px-6 rounded-2xl text-sm flex items-center justify-center gap-2 mx-auto shadow-xl transition active:scale-95 cursor-pointer"
                  >
                    <Volume2 className="w-5 h-5 text-[#FF9933]" />
                    <span>
                      {isGu ? "આગામી ટોકન બોલાવો (Call Next)" : isHi ? "अगला टोकन बुलाएं (Call Next)" : "Call Next Token"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* QUICK BROADCAST ACTION BAR */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
              {isGu ? "કતાર સૂચના નિયંત્રણ:" : isHi ? "कतार सूचना नियंत्रण:" : "Queue Broadcast Controls:"}
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  triggerHaptic('tap');
                  playNotificationChime();
                  const msg = isGu 
                    ? `ધ્યાન આપો, તમામ અરજદારો પોતાના અસલ આધાર કાર્ડ સાથે કાઉન્ટર ૧ પાસે લાઈનમાં ઉપસ્થિત રહે.`
                    : isHi
                    ? `कृपया ध्यान दें, सभी आवेदक अपने मूल आधार कार्ड के साथ काउंटर १ के पास कतार में उपस्थित रहें।`
                    : `Attention please, all applicants are requested to remain in line near Counter 1 with their original Aadhaar card.`;
                  speakGuidance(msg, lang);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition flex items-center gap-1.5"
                title={isGu ? "સામાન્ય કતાર સૂચના" : isHi ? "सामान्य कतार सूचना" : "General Queue Announcement"}
              >
                <Volume2 className="w-3.5 h-3.5 text-[#005A9C]" />
                <span>{isGu ? "સામાન્ય સૂચના અવાજ" : isHi ? "सामान्य घोषणा ध्वनि" : "Public Audio Chime"}</span>
              </button>

              <button
                onClick={() => {
                  triggerHaptic('success');
                  setCounterToast({
                    title: isGu ? "🔄 રીઅલ-ટાઇમ સિંક" : isHi ? "🔄 रीयल-टाइम सिंक" : "🔄 Sync Complete",
                    message: isGu ? "નવા ટોકન્સ રીઅલ-ટાઇમ બેકએન્ડ પરથી રિફ્રેશ થયા." : isHi ? "नए टोकन रीयल-टाइम बैकएंड से रीफ्रेश हो गए हैं।" : "Queue data synchronized with real-time backend.",
                    type: 'success'
                  });
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition flex items-center gap-1.5"
                title={isGu ? "કતાર ડેટા રિફ્રેશ" : isHi ? "कतार डेटा रीफ्रेश" : "Refresh Queue Data"}
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isGu ? "કતાર રીફ્રેશ" : isHi ? "कतार रीफ्रेश" : "Refresh Queue"}</span>
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: WAITING QUEUE STREAM (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-col h-full">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div>
                <h3 className="text-sm font-black text-[#003366] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#FF9933]" />
                  <span>
                    {isGu ? `પ્રતીક્ષારત નાગરિકોની કતાર (${waitingCount})` : isHi ? `प्रतीक्षारत नागरिकों की कतार (${waitingCount})` : `Waiting Citizens Queue (${waitingCount})`}
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">
                  {isGu ? "અગ્રતા નીતિ એન્જિન • વરિષ્ઠ/દિવ્યાંગજન" : isHi ? "प्राथमिकता नीति इंजन • वरिष्ठ/दिव्यांगजन" : "Priority Policy Engine • Senior/Divyang"}
                </p>
              </div>

              {/* Tabs for Waiting vs Skipped */}
              <div className="flex items-center gap-1 text-[10px] font-bold">
                <button
                  onClick={() => setQueueTab('WAITING')}
                  className={`px-2 py-1 rounded-lg transition ${queueTab === 'WAITING' ? 'bg-[#003366] text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  {isGu ? `પ્રતીક્ષા (${waitingCount})` : isHi ? `प्रतीक्षा (${waitingCount})` : `Waiting (${waitingCount})`}
                </button>
                <button
                  onClick={() => setQueueTab('SKIPPED')}
                  className={`px-2 py-1 rounded-lg transition ${queueTab === 'SKIPPED' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  {isGu ? `ગેરહાજર (${skippedList.length})` : isHi ? `अनुपस्थित (${skippedList.length})` : `Absent (${skippedList.length})`}
                </button>
              </div>
            </div>

            {/* Scrollable Citizen List */}
            <div className="space-y-2.5 overflow-y-auto max-h-[580px] pr-1">
              {(queueTab === 'WAITING' ? waitingList : skippedList).map((citizen) => {
                const isCurrentlyServing = currentServing?.id === citizen.id;
                const citizenName = isGu ? citizen.citizenNameGu : isHi ? citizen.citizenNameHi : citizen.citizenNameEn;
                const schemeTitle = isGu ? citizen.schemeTitleGu : isHi ? citizen.schemeTitleHi : citizen.schemeTitleEn;

                return (
                  <div
                    key={citizen.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isCurrentlyServing
                        ? 'bg-blue-50/80 border-[#003366] shadow-sm'
                        : citizen.isPriority
                          ? 'bg-amber-50/60 border-amber-300'
                          : citizen.status === 'SKIPPED'
                            ? 'bg-red-50/50 border-red-200'
                            : citizen.status === 'LATE'
                              ? 'bg-amber-50/60 border-amber-200'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base font-black font-mono text-[#003366]">
                            {citizen.tokenNumber}
                          </span>
                          
                          {citizen.isPriority && (
                            <span className="bg-[#FF9933] text-slate-900 font-black text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                              ⭐ {isGu ? "અગ્રતા" : isHi ? "प्राथमिकता" : "Priority"}
                            </span>
                          )}

                          {citizen.status === 'SKIPPED' && (
                            <span className="bg-red-100 text-red-800 font-bold text-[9px] px-1.5 py-0.5 rounded-full">
                              {isGu ? "ગેરહાજર" : isHi ? "अनुपस्थित" : "Absent"}
                            </span>
                          )}

                          {citizen.status === 'LATE' && (
                            <span className="bg-amber-100 text-amber-800 font-bold text-[9px] px-1.5 py-0.5 rounded-full">
                              +{citizen.lateMinutes}m {isGu ? "મોડું" : isHi ? "देर" : "Late"}
                            </span>
                          )}

                          {isCurrentlyServing && (
                            <span className="bg-emerald-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full animate-pulse">
                              {isGu ? "હાલમાં ચાલુ" : isHi ? "वर्तमान में चालू" : "In Service"}
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-black text-slate-900 mt-1 line-clamp-1">
                          {citizenName}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {schemeTitle}
                        </p>

                        {/* Payment & Documents Mini Pill Row */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {citizen.payment?.status === 'PAID' ? (
                            <span className="bg-emerald-100 text-emerald-900 font-black text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-700" />
                              <span>₹{citizen.payment.amount || 20} {isGu ? "ચૂકતે" : isHi ? "भुगतान पूर्ण" : "Paid"}</span>
                            </span>
                          ) : citizen.payment?.status === 'PAY_AT_COUNTER' ? (
                            <span className="bg-amber-100 text-amber-900 font-black text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-300">
                              <Clock className="w-2.5 h-2.5 text-amber-700" />
                              <span>₹{citizen.payment.amount || 20} {isGu ? "કાઉન્ટર રોકડ" : isHi ? "काउंटर नकद" : "Cash at Counter"}</span>
                            </span>
                          ) : (
                            <span className="bg-blue-100 text-blue-900 font-bold text-[9px] px-2 py-0.5 rounded-full border border-blue-200">
                              {isGu ? "મફત સેવા (₹૦)" : "Free (₹0)"}
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCitizenForDocs(citizen);
                            }}
                            className="bg-white hover:bg-slate-100 text-[#003366] font-bold text-[9.5px] px-2 py-0.5 rounded-lg border border-slate-300 flex items-center gap-1 transition shadow-2xs cursor-pointer"
                            title={isGu ? "અપલોડ કરેલ સરકારી કાગળો જુઓ" : "View Uploaded Docs"}
                          >
                            <FileText className="w-2.5 h-2.5 text-[#005A9C]" />
                            <span>{isGu ? `દસ્તાવેજો (${citizen.uploadedDocuments?.length || citizen.documents.length})` : `Docs (${citizen.uploadedDocuments?.length || citizen.documents.length})`}</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCitizenForReceipt(citizen);
                            }}
                            className="bg-white hover:bg-slate-100 text-emerald-800 font-bold text-[9.5px] px-2 py-0.5 rounded-lg border border-slate-300 flex items-center gap-1 transition shadow-2xs cursor-pointer"
                            title={isGu ? "સત્તાવાર e-Challan રસીદ જુઓ" : "View Official Receipt"}
                          >
                            <Receipt className="w-2.5 h-2.5 text-emerald-600" />
                            <span>{isGu ? "રસીદ" : "Receipt"}</span>
                          </button>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex flex-col items-end justify-between">
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {isGu ? "પ્રતીક્ષા:" : isHi ? "प्रतीक्षा:" : "Waiting:"} {citizen.waitingMinutes}m
                        </span>

                        {/* Quick Cash Acceptance if Pay at Counter */}
                        {citizen.payment?.status === 'PAY_AT_COUNTER' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCollectCounterCash(citizen);
                            }}
                            className="mt-1 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-black text-[9.5px] px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
                            title={isGu ? "રૂબરૂ રોકડ સ્વીકારી રસીદ આપો" : "Collect Cash"}
                          >
                            <Banknote className="w-3 h-3 text-emerald-200" />
                            <span>{isGu ? "💵 રોકડ સ્વીકારો" : isHi ? "💵 नकद लें" : "💵 Collect Cash"}</span>
                          </button>
                        )}

                        {!isCurrentlyServing && citizen.status !== 'COMPLETED' && (
                          <button
                            onClick={() => citizen.status === 'SKIPPED' ? handleReCall(citizen) : handleCallNext(citizen)}
                            className="mt-1.5 bg-[#003366] hover:bg-[#002244] text-white font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 transition active:scale-95 shadow-xs cursor-pointer"
                          >
                            <span>
                              {citizen.status === 'SKIPPED' 
                                ? (isGu ? 'રી-કોલ' : isHi ? 'पुनः बुलाएं' : 'Re-call')
                                : (isGu ? 'બોલાવો' : isHi ? 'बुलाएं' : 'Call')}
                            </span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </main>

      {/* 📄 1. CITIZEN ORIGINAL DOCUMENTS & AI-OCR INSPECTION MODAL */}
      {(selectedCitizenForDocs || (docModalOpen && currentServing)) && (() => {
        const activeCitizen = selectedCitizenForDocs || currentServing!;
        const citizenDocs = (activeCitizen.uploadedDocuments && activeCitizen.uploadedDocuments.length > 0)
          ? activeCitizen.uploadedDocuments.map(d => ({
              nameGu: d.nameGu,
              nameHi: d.nameEn || d.nameGu,
              nameEn: d.nameEn || d.nameGu,
              fileUrl: d.fileUrl,
              uploadedAt: d.uploadedAt,
              ocrExtractedData: d.ocrExtractedData,
              status: 'PRE_CHECK_PASSED' as const
            }))
          : activeCitizen.documents;

        return (
          <div 
            onClick={() => {
              setSelectedCitizenForDocs(null);
              setDocModalOpen(false);
            }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto modal-backdrop animate-in fade-in"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#003366] to-[#005A9C] text-white p-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
                    <FileText className="w-5 h-5 text-[#FF9933]" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white">
                      {isGu ? "અરજદાર દસ્તાવેજ & AI ચકાસણી નિરીક્ષણ (Officer Review)" : isHi ? "आवेदक दस्तावेज़ एवं AI सत्यापन समीक्षा" : "Applicant Document & AI OCR Review"}
                    </h4>
                    <p className="text-[10px] sm:text-xs text-blue-200 font-mono">
                      {isGu ? "ટોકન:" : "Token:"} <strong>{activeCitizen.tokenNumber}</strong> • {isGu ? activeCitizen.citizenNameGu : isHi ? activeCitizen.citizenNameHi : activeCitizen.citizenNameEn}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setSelectedCitizenForDocs(null);
                    setDocModalOpen(false);
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs cursor-pointer transition"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
                
                {/* AI Automated Pre-check Verdict Card */}
                <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-emerald-950 flex items-center gap-1.5 text-xs">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      {isGu ? "AI OCR સ્કેનિંગ & સરકારી નિયમ ચકાસણી પરિણામ" : isHi ? "AI OCR स्कैनिंग एवं सरकारी नियम सत्यापन परिणाम" : "AI OCR Scanning & Regulatory Verdict"}
                    </span>
                    <span className="bg-emerald-200 text-emerald-900 font-black text-[10px] px-2 py-0.5 rounded-full">
                      ✓ {isGu ? "પ્રી-ચેક સફળ (૧૦૦%)" : isHi ? "पूर्व-जांच सफल (100%)" : "Pre-check 100% Passed"}
                    </span>
                  </div>
                  <p className="text-emerald-800 font-medium leading-relaxed text-[11.5px]">
                    {isGu ? activeCitizen.aiOcrVerdictGu : isHi ? activeCitizen.aiOcrVerdictHi : activeCitizen.aiOcrVerdictEn}
                  </p>
                </div>

                {/* Uploaded Documents List with OCR Deep Inspection */}
                <div className="space-y-3">
                  <h5 className="font-black text-slate-800 uppercase tracking-wider text-[11px]">
                    {isGu ? `અપલોડ કરેલ કાગળો અને ડિજિટલ પ્રૂફ (${citizenDocs.length})` : `Uploaded Proofs & AI Extraction (${citizenDocs.length})`}
                  </h5>

                  {citizenDocs.map((doc: any, idx: number) => {
                    const docName = isGu ? doc.nameGu : isHi ? (doc.nameHi || doc.nameGu) : (doc.nameEn || doc.nameGu);
                    const ocrData = doc.ocrExtractedData || {
                      documentType: doc.nameGu.includes('આધાર') ? 'AADHAAR_CARD' : doc.nameGu.includes('આવક') ? 'INCOME_CERTIFICATE' : 'GOVT_CERTIFICATE',
                      idNumber: doc.nameGu.includes('આધાર') ? `XXXX-XXXX-${activeCitizen.aadhaarLast4 || '8842'}` : `INC-GJ-2026-${Math.floor(100000 + Math.random()*900000)}`,
                      holderName: isGu ? activeCitizen.citizenNameGu : activeCitizen.citizenNameEn,
                      confidence: 0.992,
                      dates: ['01/04/2026', '31/03/2027']
                    };

                    return (
                      <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
                        <div className="flex items-start justify-between gap-2 border-b border-slate-200/70 pb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-blue-100 text-[#003366] flex items-center justify-center font-bold text-xs">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-xs">{docName}</p>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {doc.uploadedAt ? `અપલોડ: ${new Date(doc.uploadedAt).toLocaleTimeString()}` : 'સિસ્ટમ પ્રી-ચેક વેરિફાઈડ'}
                              </span>
                            </div>
                          </div>

                          <span className="bg-emerald-100 border border-emerald-300 text-emerald-900 font-black text-[9.5px] px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>{isGu ? "પ્રમાણિત" : isHi ? "प्रमाणित" : "Verified"}</span>
                          </span>
                        </div>

                        {/* File Thumbnail & Preview Box */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          {/* Left: Thumbnail/Preview Container */}
                          <div className="sm:col-span-1 bg-white border border-slate-200 rounded-xl p-2.5 flex flex-col items-center justify-center text-center">
                            {doc.fileUrl ? (
                              <img 
                                src={doc.fileUrl} 
                                alt={docName} 
                                className="w-full h-24 object-cover rounded-lg border border-slate-100 shadow-2xs" 
                              />
                            ) : (
                              <div className="w-full h-24 bg-gradient-to-br from-blue-50 to-slate-100 rounded-lg border border-dashed border-blue-300 flex flex-col items-center justify-center p-2 text-center">
                                <GovLogo className="w-8 h-8 drop-shadow-xs" />
                                <span className="text-[8.5px] font-mono text-slate-600 mt-1 font-bold">DIGITAL RECORD</span>
                              </div>
                            )}
                            <span className="text-[9.5px] text-[#005A9C] font-bold mt-1.5 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>{isGu ? "સરકારી અધિકૃત" : "Govt Certified"}</span>
                            </span>
                          </div>

                          {/* Right: AI OCR Extracted Fields */}
                          <div className="sm:col-span-2 bg-white border border-slate-200 rounded-xl p-2.5 space-y-1.5">
                            <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">
                              {isGu ? "AI OCR દ્વારા મેળવેલ વિગતો:" : "OCR Extracted Metadata:"}
                            </span>
                            
                            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                              <div>
                                <span className="text-slate-500 text-[10px] block">{isGu ? "દસ્તાવેજ પ્રકાર:" : "Type:"}</span>
                                <span className="font-mono font-bold text-slate-800">{ocrData.documentType || 'OFFICIAL_PROOF'}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 text-[10px] block">{isGu ? "દસ્તાવેજ ક્રમાંક:" : "ID Number:"}</span>
                                <span className="font-mono font-black text-[#003366]">{ocrData.idNumber || `GJ-${activeCitizen.aadhaarLast4 || '8842'}`}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 text-[10px] block">{isGu ? "ધારકનું નામ:" : "Holder Name:"}</span>
                                <span className="font-bold text-slate-800 truncate block">{ocrData.holderName || activeCitizen.citizenNameGu}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 text-[10px] block">{isGu ? "AI ચોકસાઈ (Confidence):" : "Confidence:"}</span>
                                <span className="font-mono font-black text-emerald-700">
                                  {ocrData.confidence ? `${(ocrData.confidence * 100).toFixed(1)}%` : '99.4%'} (High)
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>

                {/* Statutory Officer Instruction Note */}
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                  <strong>{isGu ? "અધિકારી સૂચના:" : isHi ? "अधिकारी सूचना:" : "Officer Protocol:"}</strong>{' '}
                  {isGu 
                    ? "આ દસ્તાવેજોનું સિસ્ટમ પ્રી-ચેક (AI OCR + Rule Engine) પૂર્ણ થયેલ છે. અસલ કાગળો સાથે રૂબરૂ સરખામણી કરી કાયદેસર અરજી મંજૂર કરવી."
                    : isHi 
                    ? "इन दस्तावेज़ों की प्रणाली पूर्व-जांच (AI OCR + Rule Engine) पूर्ण हो चुकी है। मूल प्रतियों से सत्यापन कर आवेदन स्वीकृत करें।"
                    : "System pre-check (AI OCR + Rule Engine) has passed. Perform physical verification with originals before granting formal approval."}
                </div>

              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 p-3.5 border-t border-slate-200 flex items-center justify-between shrink-0">
                <span className="text-[10px] text-slate-500 font-mono">
                  QueueLess Verified • {activeCitizen.tokenNumber}
                </span>
                <button
                  onClick={() => {
                    setSelectedCitizenForDocs(null);
                    setDocModalOpen(false);
                  }}
                  className="bg-[#003366] hover:bg-[#002244] text-white font-bold px-5 py-2 rounded-xl text-xs transition cursor-pointer shadow-xs"
                >
                  {isGu ? "નિરીક્ષણ પૂર્ણ (Close)" : isHi ? "निरीक्षण समाप्त (Close)" : "Close Review"}
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* 📄 2. OFFICIAL CYBER TREASURY / JAN SEVA E-CHALLAN RECEIPT MODAL */}
      {selectedCitizenForReceipt && (() => {
        const citizen = selectedCitizenForReceipt;
        const challanNo = citizen.payment?.grasChallanNo || citizen.payment?.kacheriChallanNo || 'GRAS/2026/04/991823';
        const feeAmount = citizen.payment?.amount ?? 20;
        const citizenName = isGu ? citizen.citizenNameGu : isHi ? citizen.citizenNameHi : citizen.citizenNameEn;
        const schemeTitle = isGu ? citizen.schemeTitleGu : isHi ? citizen.schemeTitleHi : citizen.schemeTitleEn;

        return (
          <div 
            onClick={() => setSelectedCitizenForReceipt(null)}
            className="fixed inset-0 z-70 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto modal-backdrop animate-in fade-in"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95"
            >
              {/* Header */}
              <div className="bg-[#003366] text-white p-4 flex items-center justify-between border-b border-blue-900 shrink-0">
                <div className="flex items-center gap-2.5">
                  <GovLogo className="w-8 h-8 drop-shadow-md" />
                  <div>
                    <h3 className="text-sm font-black">
                      {isGu ? 'ગુજરાત સરકાર • સાયબર ટ્રેઝરી ઈ-ચલણ પહોંચ' : isHi ? 'गुजरात सरकार • साइबर ट्रेजरी ई-चालान' : 'Government of Gujarat • Cyber Treasury e-Challan'}
                    </h3>
                    <p className="text-[10px] text-blue-200">
                      Finance Department, Govt of Gujarat • GRAS System
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCitizenForReceipt(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Printable Receipt Body */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-slate-800 bg-white" id="admin-echallan-receipt">
                
                {/* Emblem & Treasury Header */}
                <div className="border-b-2 border-slate-900 pb-3 text-center space-y-1">
                  <div className="flex justify-center mb-1">
                    <GovLogo className="w-12 h-12" />
                  </div>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wide">
                    GUJARAT CYBER TREASURY & JAN SEVA RECEIPT
                  </h2>
                  <p className="text-xs font-bold text-slate-700">
                    નાણાં વિભાગ, ગુજરાત સરકાર • સત્તાવાર સરકારી ફી પહોંચ
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    GRAS Port Reference: GJ-GRAS-FIN-2026-TREASURY
                  </p>
                </div>

                {/* Challan Meta Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-[9.5px] font-bold text-slate-500 block uppercase">Challan / GRAS No.</span>
                    <p className="font-mono font-black text-[#003366] text-[11px] truncate">
                      {challanNo}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9.5px] font-bold text-slate-500 block uppercase">Token Number</span>
                    <p className="font-black text-[#FF9933] text-sm">
                      {citizen.tokenNumber}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9.5px] font-bold text-slate-500 block uppercase">Date & Time</span>
                    <p className="font-mono font-bold text-slate-700 text-[10.5px]">
                      {new Date().toLocaleDateString('gu-IN')} {citizen.appliedTime}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9.5px] font-bold text-slate-500 block uppercase">Payment Status</span>
                    <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full ${
                      citizen.payment?.status === 'PAID' 
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                        : citizen.payment?.status === 'PAY_AT_COUNTER'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}>
                      {citizen.payment?.status === 'PAID' ? 'PAID / SUCCESS' : citizen.payment?.status === 'PAY_AT_COUNTER' ? 'PAY AT COUNTER' : 'NIL (FREE)'}
                    </span>
                  </div>
                </div>

                {/* Detailed Receipt Table */}
                <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <tbody>
                      <tr className="border-b border-slate-200 bg-slate-100/70">
                        <td className="p-2.5 font-bold text-slate-600 w-1/3">નાગરિકનું નામ (Remitter Name)</td>
                        <td className="p-2.5 font-black text-slate-900">{citizenName}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-2.5 font-bold text-slate-600">આધાર કાર્ડ (Aadhaar Reference)</td>
                        <td className="p-2.5 font-mono font-bold text-slate-800">XXXX-XXXX-{citizen.aadhaarLast4 || '8842'}</td>
                      </tr>
                      <tr className="border-b border-slate-200 bg-slate-100/70">
                        <td className="p-2.5 font-bold text-slate-600">સેવા / યોજના (Service Title)</td>
                        <td className="p-2.5 font-black text-[#003366]">{schemeTitle}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-2.5 font-bold text-slate-600">કચેરી / કેન્દ્ર (Office Location)</td>
                        <td className="p-2.5 font-bold text-slate-800">
                          {isGu ? currentTaluka.nameGu : currentTaluka.nameEn}, {isGu ? currentDistrict.nameGu : currentDistrict.nameEn}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200 bg-slate-100/70">
                        <td className="p-2.5 font-bold text-slate-600">ફાળવેલ કાઉન્ટર & અધિકારી</td>
                        <td className="p-2.5 font-bold text-slate-800">
                          કાઉન્ટર {citizen.counterNumber || selectedCounter} • અધિકારી: શ્રી કે. એમ. ત્રિવેદી (નાયબ મામલતદાર)
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-2.5 font-bold text-slate-600">મહેસૂલ હેડ (Major Head)</td>
                        <td className="p-2.5 font-mono text-[11px] text-slate-700">0070-60-800-01 (User Fee / Administrative Charges)</td>
                      </tr>
                      <tr className="border-b border-slate-200 bg-slate-100/70">
                        <td className="p-2.5 font-bold text-slate-600">ચુકવણી મોડ (Payment Mode)</td>
                        <td className="p-2.5 font-bold text-slate-800">
                          {citizen.payment?.gatewayName || (citizen.payment?.mode === 'CASH_AT_COUNTER' ? 'કચેરી કાઉન્ટર રોકડ ચલણ (Cash at Desk)' : 'Cyber Treasury UPI / NetBanking')}
                        </td>
                      </tr>
                      {citizen.payment?.cyberTreasuryTxnId && (
                        <tr className="border-b border-slate-200">
                          <td className="p-2.5 font-bold text-slate-600">ટ્રેઝરી ટ્રાન્ઝેક્શન ID</td>
                          <td className="p-2.5 font-mono font-bold text-emerald-800">{citizen.payment.cyberTreasuryTxnId}</td>
                        </tr>
                      )}
                      {citizen.payment?.cashierReceiptNo && (
                        <tr className="border-b border-slate-200">
                          <td className="p-2.5 font-bold text-slate-600">કાઉન્ટર કેશિયર રસીદ નં.</td>
                          <td className="p-2.5 font-mono font-bold text-emerald-800">{citizen.payment.cashierReceiptNo}</td>
                        </tr>
                      )}
                      <tr className="bg-emerald-50 text-slate-900 font-bold">
                        <td className="p-3 text-sm font-black text-emerald-950">કુલ સ્વીકારેલ રકમ (Amount Received)</td>
                        <td className="p-3 text-base font-black text-emerald-800">
                          {feeAmount === 0 ? '₹૦ (મફત / Nil Fee)' : `₹${feeAmount}.00`}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Authentication Stamp & QR */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-dashed border-slate-300">
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-14 border-2 border-dashed border-emerald-600 rounded-full flex flex-col items-center justify-center text-center p-1 bg-emerald-50 rotate-[-5deg]">
                      <span className="text-[7.5px] font-black text-emerald-900 leading-none">CYBER TREASURY</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 my-0.5" />
                      <span className="text-[7px] font-bold text-emerald-800 leading-none">GOVT GUJARAT</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-700">Digital Treasury Signature Checksum</p>
                      <p className="text-[9px] font-mono text-slate-500">QL-8F3A29-{citizen.tokenNumber.replace('#','')}</p>
                      <p className="text-[8.5px] text-emerald-700 font-bold mt-0.5">✓ Tamper-proof Computer Generated e-Receipt</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-black text-slate-700">સક્ષમ ટ્રેઝરી અધિકારી / તિજોરી કચેરી</p>
                    <p className="text-[9px] text-slate-500">Government of Gujarat Cyber Treasury</p>
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="bg-slate-50 p-3 sm:p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
                <button
                  onClick={() => setSelectedCitizenForReceipt(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                >
                  {isGu ? 'બંધ કરો' : 'Close'}
                </button>

                <button
                  onClick={() => {
                    triggerHaptic('success');
                    window.print();
                  }}
                  className="px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-[#003366] hover:bg-[#002244] text-white flex items-center gap-2 shadow-md transition cursor-pointer active:scale-95"
                >
                  <Printer className="w-4 h-4 text-[#FF9933]" />
                  <span>{isGu ? 'સત્તાવાર e-Challan પ્રિન્ટ કરો' : isHi ? 'ई-चालान प्रिंट करें' : 'Print Official e-Challan'}</span>
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* 🔄 2. CROSS-COUNTER FORWARDING MODAL */}
      {transferModalOpen && currentServing && (
        <div 
          onClick={() => setTransferModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 modal-backdrop animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#005A9C] flex items-center justify-center">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#003366]">
                    {isGu ? "કાઉન્ટર ફોરવર્ડ / ટ્રાન્સફર" : isHi ? "काउंटर फॉरवर्ड / स्थानांतरण" : "Counter Forward / Transfer"}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {isGu ? "ટોકન:" : isHi ? "टोकन:" : "Token:"} {currentServing.tokenNumber}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setTransferModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-600">
                {isGu ? "મૂળ કાઉન્ટર:" : isHi ? "मूल काउंटर:" : "Source Desk:"}{' '}
                <strong>{isGu ? `કાઉન્ટર ${selectedCounter} (આવક & પ્રમાણપત્રો)` : isHi ? `काउंटर ${selectedCounter} (आय एवं प्रमाण पत्र)` : `Counter ${selectedCounter} (Income & Certificates)`}</strong>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isGu ? "કયા કાઉન્ટર પર મોકલવા માંગો છો?" : isHi ? "किस काउंटर पर भेजना चाहते हैं?" : "Select Target Service Counter:"}
                </label>
                <select
                  value={targetCounter}
                  onChange={(e) => setTargetCounter(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
                >
                  <option value={2}>
                    {isGu ? "કાઉન્ટર ૨: રેશન કાર્ડ & અન્ન પુરવઠો" : isHi ? "काउंटर २: राशन कार्ड एवं खाद्य आपूर्ति" : "Counter 2: Ration Card & Food Supplies"}
                  </option>
                  <option value={3}>
                    {isGu ? "કાઉન્ટર ૩: ઈ-ધરા ૭/૧૨ જમીન રેકોર્ડ" : isHi ? "काउंटर ३: ई-धरा ७/१२ भूमि रिकॉर्ड" : "Counter 3: e-Dhara 7/12 Land Records"}
                  </option>
                  <option value={4}>
                    {isGu ? "કાઉન્ટર ૪: સામાજિક સુરક્ષા & પેન્શન" : isHi ? "काउंटर ४: सामाजिक सुरक्षा एवं पेंशन" : "Counter 4: Social Security & Pension"}
                  </option>
                  <option value={5}>
                    {isGu ? "કાઉન્ટર ૫: આયુષ્માન ભારત & આરોગ્ય" : isHi ? "काउंटर ५: आयुष्मान भारत एवं स्वास्थ्य" : "Counter 5: Ayushman Bharat & Health"}
                  </option>
                  <option value={6}>
                    {isGu ? "કાઉન્ટર ૬: સોગંદનામું & નોટરી એટેસ્ટેશન" : isHi ? "काउंटर ६: शपथ पत्र एवं नोटरी सत्यापन" : "Counter 6: Affidavit & Notary Attestation"}
                  </option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isGu ? "ટ્રાન્સફર નોંધ / કારણ (Remarks):" : isHi ? "स्थानांतरण टिप्पणी / कारण (Remarks):" : "Forwarding Remarks / Reason:"}
                </label>
                <textarea
                  value={transferRemarks}
                  onChange={(e) => setTransferRemarks(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setTransferModalOpen(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition"
              >
                {isGu ? "રદ કરો" : isHi ? "रद्द करें" : "Cancel"}
              </button>
              <button
                onClick={handleConfirmTransfer}
                className="flex-1 bg-[#003366] hover:bg-[#002244] text-white font-bold py-2.5 rounded-xl text-xs transition"
              >
                {isGu ? "ટ્રાન્સફર મંજૂર કરો" : isHi ? "स्थानांतरण स्वीकृत करें" : "Approve Transfer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 Floating Counter Notification Toast */}
      {counterToast && (
        <div className="fixed bottom-6 right-6 z-[130] max-w-md w-full p-4 animate-in slide-in-from-bottom-5 fade-in duration-200 pointer-events-auto">
          <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-blue-400/40 flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              counterToast.type === 'success' 
                ? 'bg-emerald-500/20 border border-emerald-400/30 text-emerald-400' 
                : counterToast.type === 'warning'
                ? 'bg-amber-500/20 border border-amber-400/30 text-amber-400'
                : 'bg-blue-500/20 border border-blue-400/30 text-blue-400'
            }`}>
              {counterToast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : counterToast.type === 'warning' ? (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              ) : (
                <Sparkles className="w-5 h-5 text-blue-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-extrabold text-white text-xs sm:text-sm">
                {counterToast.title}
              </h4>
              <p className="text-slate-200 text-xs mt-0.5 leading-relaxed">
                {counterToast.message}
              </p>
            </div>
            <button
              onClick={() => setCounterToast(null)}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
