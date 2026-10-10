'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, Volume2, CheckCircle2, AlertTriangle, UserCheck, 
  Clock, ArrowRight, Search, Building, Users, Radio, FileText, 
  Coffee, ArrowRightLeft, RotateCcw, Check, X, ChevronDown, 
  ExternalLink, Eye, Printer, ArrowLeft, Sparkles, Star, Award, 
  AlertCircle, Phone, Lock, ChevronRight, RefreshCw, Layers, History, BadgeCheck,
  Globe, IndianRupee, CreditCard, Receipt, Banknote, Landmark, FileCheck, FileCheck2,
  ClipboardList, Maximize2, ZoomIn, ZoomOut, QrCode, MapPin, Calendar, Building2, Download, CheckSquare, Square, User
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

interface DocumentStatutoryRule {
  id: string;
  titleGu: string;
  titleHi: string;
  titleEn: string;
  actReference: string;
  criterionGu: string;
  criterionHi: string;
  criterionEn: string;
  status: 'PASSED' | 'PENDING';
  aiVerdictGu: string;
  aiVerdictHi: string;
  aiVerdictEn: string;
}

function getStatutoryDocumentRules(
  docName: string, 
  citizen: QueueCitizen, 
  isGu: boolean, 
  isHi: boolean
): DocumentStatutoryRule[] {
  const isAadhaar = docName.includes('આધાર') || docName.toLowerCase().includes('aadhaar');
  const isIncome = docName.includes('આવક') || docName.toLowerCase().includes('income');
  const isDeath = docName.includes('અવસાન') || docName.includes('મરણ') || docName.toLowerCase().includes('death');
  const isRation = docName.includes('રેશન') || docName.toLowerCase().includes('ration');
  const isMarriage = docName.includes('લગ્ન') || docName.toLowerCase().includes('marriage');
  const isAffidavit = docName.includes('સોગંદ') || docName.includes('બાંયધરી') || docName.includes('સ્ટેમ્પ') || docName.toLowerCase().includes('affidavit') || docName.toLowerCase().includes('stamp');

  if (isAadhaar) {
    return [
      {
        id: 'aadh-1',
        titleGu: 'નિયમ ૧: UIDAI ૧૨-અંક માળખું અને Verhoeff Checksum',
        titleHi: 'नियम १: UIDAI १२-अंकीय संरचना एवं Verhoeff Checksum',
        titleEn: 'Rule 1: UIDAI 12-Digit Structure & Verhoeff Checksum',
        actReference: 'UIDAI Regulations 2016 & IT Act 2000',
        criterionGu: '૧૨ અંકનું કાયદેસર બંધારણ, ફોટો સ્પષ્ટતા સ્કોર > 95% અને QR કોડ અખંડિતતા.',
        criterionHi: '१२ अंक का वैध प्रारूप, फोटो स्पष्टता > ९५% एवं QR कोड अखंडता।',
        criterionEn: 'Valid 12-digit format, photo clarity > 95% and QR code integrity.',
        status: 'PASSED',
        aiVerdictGu: `✓ Verhoeff ગાણિતિક અલ્ગોરિધમ માન્ય. ફોટો સ્કોર ૯૯.૨% (High Precision).`,
        aiVerdictHi: `✓ Verhoeff एल्गोरिथ्म मान्य। फोटो स्पष्टता ९९.२% (सफल)।`,
        aiVerdictEn: `✓ Verhoeff checksum valid. Photo confidence score 99.2%.`
      },
      {
        id: 'aadh-2',
        titleGu: 'નિયમ ૨: માસ્ક્ડ આધાર નિયમ (Masked Aadhaar Circular)',
        titleHi: 'नियम २: मास्क्ड आधार नियम (UIDAI परिपत्र)',
        titleEn: 'Rule 2: Masked Aadhaar Privacy Compliance',
        actReference: 'UIDAI Circular 12011/2018 & Digital Data Protection',
        criterionGu: 'પ્રથમ ૮ અંકો સુરક્ષિત રીતે છુપાવેલા (XXXX-XXXX) હોવા જોઈએ, ફક્ત છેલ્લા ૪ અંક જ દૃશ્યમાન.',
        criterionHi: 'प्रथम ८ अंक सुरक्षित रूप से छिपे होने चाहिए, केवल अंतिम ४ अंक दृश्यमान।',
        criterionEn: 'First 8 digits must be securely masked. Only last 4 digits visible.',
        status: 'PASSED',
        aiVerdictGu: `✓ પ્રથમ ૮ આંકડા સંપૂર્ણ સુરક્ષિત: XXXX-XXXX-${citizen.aadhaarLast4 || '7104'} (૧૦૦% પ્રાઈવસી પાલન).`,
        aiVerdictHi: `✓ प्रथम ८ अंक सुरक्षित: XXXX-XXXX-${citizen.aadhaarLast4 || '7104'} (१००% गोपनीयता)।`,
        aiVerdictEn: `✓ Fully compliant with UIDAI masking: XXXX-XXXX-${citizen.aadhaarLast4 || '7104'}.`
      },
      {
        id: 'aadh-3',
        titleGu: 'નિયમ ૩: નાગરિક નામ અને ઓળખ સુસંગતતા (Name Match)',
        titleHi: 'नियम ३: नागरिक नाम एवं पहचान मिलान',
        titleEn: 'Rule 3: Citizen Identity & Name Matching Threshold',
        actReference: 'Gujarat DPI Interoperability Standards 2024',
        criterionGu: 'અરજી ફોર્મના નામ સાથે આધાર કાર્ડનું નામ ૯૫% થી વધુ ભાષાકીય મેળ ખાવું જોઈએ.',
        criterionHi: 'आवेदन फॉर्म के नाम से आधार का नाम ९५% से अधिक मेल खाना चाहिए।',
        criterionEn: 'Name on Aadhaar must match applicant name with > 95% linguistic similarity.',
        status: 'PASSED',
        aiVerdictGu: `✓ આધાર ઓળખ મેચ સ્કોર: ૯૯.૪% ('${citizen.citizenNameGu}' સુસંગત).`,
        aiVerdictHi: `✓ आधार पहचान मिलान: ९९.४% ('${citizen.citizenNameGu}' सत्यापित)।`,
        aiVerdictEn: `✓ Identity match score: 99.4% ('${citizen.citizenNameEn}' matched).`
      },
      {
        id: 'aadh-4',
        titleGu: 'નિયમ ૪: UIDAI સિક્યોરિટી QR ડિજિટલ સહી ચકાસણી',
        titleHi: 'नियम ४: UIDAI सुरक्षा QR डिजिटल हस्ताक्षर सत्यापन',
        titleEn: 'Rule 4: UIDAI Cryptographic Digital Signature Verification',
        actReference: 'UIDAI Offline XML & QR Cryptography Standard',
        criterionGu: 'QR કોડમાં UIDAI પબ્લિક કી ડિજિટલ હસ્તાક્ષર પ્રમાણિત હોવા અનિવાર્ય.',
        criterionHi: 'QR कोड में UIDAI पब्लिक की डिजिटल हस्ताक्षर प्रमाणित होना अनिवार्य।',
        criterionEn: 'QR code must carry valid UIDAI public key cryptographic signature.',
        status: 'PASSED',
        aiVerdictGu: `✓ UIDAI પબ્લિક કી પ્રમાણિત. ઑફલાઇન ડિજિટલ સાઇન વેરિફાઇડ.`,
        aiVerdictHi: `✓ UIDAI पब्लिक की प्रमाणित। डिजिटल हस्ताक्षर वैध।`,
        aiVerdictEn: `✓ UIDAI public key validated. Cryptographic signature verified.`
      }
    ];
  }

  if (isIncome) {
    return [
      {
        id: 'inc-1',
        titleGu: 'નિયમ ૧: સક્ષમ અધિકારી સત્તાવાર મોહર અને ડિજિટલ સહી',
        titleHi: 'नियम १: सक्षम प्राधिकारी आधिकारिक मुहर एवं डिजिटल हस्ताक्षर',
        titleEn: 'Rule 1: Competent Authority Seal & Digital Signature',
        actReference: 'ગુજરાત મહેસૂલ પરિપત્ર: જમન/૩૯૨૦૧૮/૬૭૫/જ',
        criterionGu: 'ગ્રામ્ય વિસ્તારમાં તલાટી અથવા શહેરી વિસ્તારમાં નાયબ મામલતદાર/મામલતદારની મોહર હોવી અનિવાર્ય.',
        criterionHi: 'ग्रामीण क्षेत्र में तलाटी अथवा शहरी क्षेत्र में तहसीलदार की मुहर अनिवार्य।',
        criterionEn: 'Must bear authorized seal of Talati (Rural) or Dy. Mamlatdar (Urban).',
        status: 'PASSED',
        aiVerdictGu: `✓ નાયબ મામલતદાર કચેરી, ગોંડલ - સત્તાવાર ડિજિટલ સહી અને ગોળ મોહર પ્રમાણિત.`,
        aiVerdictHi: `✓ तहसीलदार कार्यालय - आधिकारिक डिजिटल हस्ताक्षर एवं मुहर सत्यापित।`,
        aiVerdictEn: `✓ Revenue Authority Seal & Digital Signature verified successfully.`
      },
      {
        id: 'inc-2',
        titleGu: 'નિયમ ૨: ૩ નાણાકીય વર્ષની માન્યતા અવધિ (Statutory Validity)',
        titleHi: 'नियम २: ३ वित्तीय वर्ष की वैधता अवधि (राजस्व नियम)',
        titleEn: 'Rule 2: 3-Financial Years Statutory Validity Period',
        actReference: 'મહેસૂલ વિભાગ ઠરાવ ૨૦૧૯ (૩-નાણાકીય વર્ષ માન્યતા)',
        criterionGu: 'દાખલો જારી થયા તારીખથી સતત ૩ નાણાકીય વર્ષ સુધી રાજ્યભરમાં કાયદેસર માન્ય રહે છે.',
        criterionHi: 'जारी तिथि से लगातार ३ वित्तीय वर्षों तक राज्यभर में कानूनी रूप से मान्य।',
        criterionEn: 'Certificate valid for 3 consecutive Financial Years from issue date across Gujarat.',
        status: 'PASSED',
        aiVerdictGu: `✓ ઇશ્યુ વર્ષ ૨૦૨૫. માન્યતા: ૨૦૨૫-૨૬ થી ૨૦૨૭-૨૮ (મુદત અંદર કાયદેસર સક્રિય).`,
        aiVerdictHi: `✓ जारी वर्ष २०२५। वैधता: २०२५-२६ से २०२७-२८ तक (कानूनी रूप से वैध)।`,
        aiVerdictEn: `✓ Issued in 2025. Valid for FY 2025-26 to FY 2027-28 (Fully Active).`
      },
      {
        id: 'inc-3',
        titleGu: 'નિયમ ૩: વાર્ષિક આવક મર્યાદા પાત્રતા (Eligible Income Ceiling)',
        titleHi: 'नियम ३: वार्षिक आय सीमा पात्रता जांच',
        titleEn: 'Rule 3: Statutory Annual Income Ceiling Compliance',
        actReference: 'ગુજરાત સામાજિક ન્યાય & કલ્યાણકારી આવક માપદંડ',
        criterionGu: 'યોજના નિયમ મુજબ વાર્ષિક આવક મર્યાદા: ગ્રામ્ય < ₹૧,૨૦,૦૦૦ / શહેરી < ₹૧,૫૦,૦૦૦.',
        criterionHi: 'योजना अनुसार वार्षिक आय सीमा: ग्रामीण < ₹१,२०,००० / शहरी < ₹१,५०,०००।',
        criterionEn: 'Ceiling: Rural < ₹1,20,000 / Urban < ₹1,50,000 per annum.',
        status: 'PASSED',
        aiVerdictGu: `✓ જાહેર વાર્ષિક આવક ${citizen.incomeDeclaredGu || '₹ ૯૫,૦૦૦'}. પાત્રતા મર્યાદા હેઠળ સંપૂર્ણ પાત્ર.`,
        aiVerdictHi: `✓ घोषित आय ${citizen.incomeDeclaredHi || '₹ ९५,०००'}. निर्धारित सीमा के अंतर्गत पात्र।`,
        aiVerdictEn: `✓ Declared income ${citizen.incomeDeclaredEn || '₹ 95,000'}. Well within permissible limit.`
      },
      {
        id: 'inc-4',
        titleGu: 'નિયમ ૪: બારકોડ અને ડિજિટલ ગુજરાત સીરીયલ ક્રોસ-વેરિફિકેશન',
        titleHi: 'नियम ४: बारकोड एवं डिजिटल गुजरात सत्यापन',
        titleEn: 'Rule 4: Digital Gujarat Portal Serial & Barcode Verification',
        actReference: 'Digital Gujarat Online Database Registry',
        criterionGu: 'બારકોડ અને સર્ટિફિકેટ નંબર ઓનલાઇન પોર્ટલ રેકોર્ડ સાથે સુસંગત હોવા જોઈએ.',
        criterionHi: 'बारकोड और प्रमाण पत्र संख्या ऑनलाइन पोर्टल से मेल खानी चाहिए।',
        criterionEn: 'Barcode & Certificate ID must cross-verify against Digital Gujarat portal.',
        status: 'PASSED',
        aiVerdictGu: `✓ સીરીયલ GJ-REV-INC-2026-${citizen.aadhaarLast4 || '449102'} મહેસૂલ રેકોર્ડ સાથે મેચ.`,
        aiVerdictHi: `✓ सीरियल संख्या राजस्व डेटाबेस में सक्रिय एवं सत्यापित।`,
        aiVerdictEn: `✓ Serial GJ-REV-INC-2026-${citizen.aadhaarLast4 || '449102'} matches state registry.`
      }
    ];
  }

  if (isDeath) {
    return [
      {
        id: 'dth-1',
        titleGu: 'નિયમ ૧: જન્મ-મરણ નોંધણી અધિનિયમ અંતર્ગત ફોર્મ નં. ૬',
        titleHi: 'नियम १: जन्म-मृत्यु पंजीकरण अधिनियम के तहत फॉर्म सं. ६',
        titleEn: 'Rule 1: Statutory Form No. 6 under RBD Act, 1969',
        actReference: 'Registration of Births & Deaths Act 1969 Sec 12/17',
        criterionGu: 'સક્ષમ જન્મ અને મરણ રજિસ્ટ્રાર કચેરી દ્વારા જારી કરેલ વૈધાનિક ફોર્મ-૬ હોવું જરૂરી.',
        criterionHi: 'सक्षम जन्म-मृत्यु रजिस्ट्रार द्वारा जारी फॉर्म-६ होना अनिवार्य।',
        criterionEn: 'Must be official Form No. 6 issued under RBD Act 1969 Section 12/17.',
        status: 'PASSED',
        aiVerdictGu: `✓ સત્તાવાર ફોર્મ-૬ પ્રમાણિત. નોંધણી ક્રમાંક: GJ-RBD-2024-004128.`,
        aiVerdictHi: `✓ आधिकारिक फॉर्म-६ प्रमाणित। पंजीकरण सं: GJ-RBD-2024-004128.`,
        aiVerdictEn: `✓ Official Form 6 verified. Registration No: GJ-RBD-2024-004128.`
      },
      {
        id: 'dth-2',
        titleGu: 'નિયમ ૨: રજિસ્ટ્રાર સત્તાવાર સિક્કો અને નોંધણી ક્રમાંક',
        titleHi: 'नियम २: रजिस्ट्रार आधिकारिक मुहर एवं पंजीकरण क्रमांक',
        titleEn: 'Rule 2: Registrar Official Seal & Record Number',
        actReference: 'Civil Registration System (CRS Gujarat)',
        criterionGu: 'સ્થાનિક પંચાયત/નગરપાલિકા રજિસ્ટ્રારની સત્તાવાર મોહર અને ક્રમાંક પ્રમાણિત હોવા જોઈએ.',
        criterionHi: 'स्थानीय रजिस्ट्रार की मुहर एवं पंजीकरण क्रमांक सत्यापित होना चाहिए।',
        criterionEn: 'Registrar round seal and municipal/panchayat registration number verified.',
        status: 'PASSED',
        aiVerdictGu: `✓ રજિસ્ટ્રાર (જન્મ-મરણ) સત્તાવાર ગોળ મોહર અને અધિકૃત સહી ચકાસાયેલ.`,
        aiVerdictHi: `✓ रजिस्ट्रार आधिकारिक मुहर एवं डिजिटल हस्ताक्षर सत्यापित।`,
        aiVerdictEn: `✓ Registrar official round seal and signature verified.`
      },
      {
        id: 'dth-3',
        titleGu: 'નિયમ ૩: મરણ તારીખ અને સ્થળ પ્રમાણિત',
        titleHi: 'नियम ३: मृत्यु तिथि एवं स्थान सत्यापन',
        titleEn: 'Rule 3: Certified Date and Place of Death',
        actReference: 'Civil Registration Timeliness Mandate',
        criterionGu: 'અવસાનની તારીખ, સ્થળ અને નોંધણી સમયગાળો કાયદાકીય રીતે સ્પષ્ટ હોવો જોઈએ.',
        criterionHi: 'मृत्यु तिथि, स्थान एवं पंजीकरण अवधि स्पष्ट होनी चाहिए।',
        criterionEn: 'Date, place of demise and timely statutory reporting confirmed.',
        status: 'PASSED',
        aiVerdictGu: `✓ અવસાન તારીખ: ૧૪/૧૦/૨૦૨૪ • સ્થળ: સિવિલ હોસ્પિટલ, ગોંડલ (નિયત મુદતમાં નોંધાયેલ).`,
        aiVerdictHi: `✓ मृत्यु तिथि: १४/१०/२०२४ • स्थान: सिविल अस्पताल, गोंडल (समय पर पंजीकृत)।`,
        aiVerdictEn: `✓ Demise Date: 14/10/2024 • Place: Civil Hospital, Gondal (Timely registered).`
      },
      {
        id: 'dth-4',
        titleGu: 'નિયમ ૪: મૃતક પતિના નામની અરજદાર વિગત સાથે સુસંગતતા',
        titleHi: 'नियम ४: दिवंगत पति का नाम आवेदक विवरण से मिलान',
        titleEn: 'Rule 4: Deceased Husband Name Consistency Check',
        actReference: 'ગંગા સ્વરૂપા વિધવા સહાય પાત્રતા માર્ગદર્શિકા',
        criterionGu: 'મૃતક પતિનું નામ અરજદારના આધાર અને રેશનકાર્ડ દસ્તાવેજો સાથે ૧૦૦% સુસંગત હોવું જરૂરી.',
        criterionHi: 'दिवंगत पति का नाम आवेदक के राशन कार्ड व आधार से १००% मेल खाना चाहिए।',
        criterionEn: 'Husband name must match applicant family records with 100% concordance.',
        status: 'PASSED',
        aiVerdictGu: `✓ સ્વ. પતિનું નામ 'રમણિકભાઈ પટેલ' અરજદારના રેશનકાર્ડ સાથે ૧૦૦% મેળ ખાય છે.`,
        aiVerdictHi: `✓ पति का नाम 'रमणिकभाई पटेल' पारिवारिक रिकॉर्ड से १००% सुसंगत।`,
        aiVerdictEn: `✓ Husband name matches applicant records with 100% concordance.`
      }
    ];
  }

  if (isRation) {
    return [
      {
        id: 'rat-1',
        titleGu: 'નિયમ ૧: ૧૨-અંક બારકોડેડ રેશનકાર્ડ (NFSA Barcoded Card)',
        titleHi: 'नियम १: १२-अंकीय बारकोडेड राशन कार्ड (NFSA)',
        titleEn: 'Rule 1: 12-Digit Barcoded Ration Card (NFSA Act)',
        actReference: 'અન્ન અને નાગરિક પુરવઠા વિભાગ, NFSA એક્ટ ૨૦૧૩',
        criterionGu: 'બારકોડેડ ડિજિટલ રેશનકાર્ડ નંબર સક્રિય અને માન્ય હોવો જોઈએ.',
        criterionHi: 'बारकोडेड डिजिटल राशन कार्ड संख्या सक्रिय और मान्य होनी चाहिए।',
        criterionEn: '12-digit computerized barcoded ration card must be active in PDS database.',
        status: 'PASSED',
        aiVerdictGu: `✓ રેશનકાર્ડ નં: 042100889231 (NFSA-PHH કેટેગરી સક્રિય).`,
        aiVerdictHi: `✓ राशन कार्ड संख्या: 042100889231 (NFSA सक्रिय)।`,
        aiVerdictEn: `✓ Ration Card No: 042100889231 (NFSA active).`
      },
      {
        id: 'rat-2',
        titleGu: 'નિયમ ૨: કુટુંબના સભ્યોની યાદીમાં અરજદારનું નામ',
        titleHi: 'नियम २: परिवार सूची में आवेदक का नाम',
        titleEn: 'Rule 2: Applicant Enlistment in Family Roster',
        actReference: 'Targeted Public Distribution System Rules',
        criterionGu: 'અરજદારનું નામ કુટુંબના સભ્યોની અધિકૃત યાદીમાં સામેલ હોવું જોઈએ.',
        criterionHi: 'आवेदक का नाम परिवार सदस्यों की अधिकृत सूची में होना चाहिए।',
        criterionEn: 'Applicant must be registered as head or member in family roster.',
        status: 'PASSED',
        aiVerdictGu: `✓ કુટુંબ યાદીમાં '${citizen.citizenNameGu}' વડા તરીકે સામેલ (૨ સભ્યો નોંધાયેલ).`,
        aiVerdictHi: `✓ परिवार सूची में '${citizen.citizenNameGu}' मुखिया के रूप में दर्ज।`,
        aiVerdictEn: `✓ Applicant verified as head of household (2 members enrolled).`
      },
      {
        id: 'rat-3',
        titleGu: 'નિયમ ૩: સ્થાનિક મહેસૂલી કાર્યક્ષેત્ર સુસંગતતા',
        titleHi: 'नियम ३: स्थानीय प्रशासनिक अधिकार क्षेत्र मिलान',
        titleEn: 'Rule 3: Local Administrative Jurisdiction Alignment',
        actReference: 'Gujarat Land Revenue & Administrative Code',
        criterionGu: 'રેશનકાર્ડનું સરનામું સંબંધિત તાલુકા/જિલ્લા કચેરીના કાર્યક્ષેત્રમાં આવવું જોઈએ.',
        criterionHi: 'राशन कार्ड का पता संबंधित तालुका कार्यालय के अधिकार क्षेत्र में होना चाहिए।',
        criterionEn: 'Ration card address must fall within the serving taluka/district.',
        status: 'PASSED',
        aiVerdictGu: `✓ ગોંડલ તાલુકો, રાજકોટ જિલ્લો - કચેરી કાર્યક્ષેત્ર સાથે સંપૂર્ણ સુસંગત.`,
        aiVerdictHi: `✓ गोंडल तालुका, राजकोट जिला - कार्यालय अधिकार क्षेत्र अनुरूप।`,
        aiVerdictEn: `✓ Gondal taluka, Rajkot district - within jurisdiction.`
      }
    ];
  }

  // Default: Statutory Affidavit / e-Stamp / Marriage / Other
  return [
    {
      id: 'aff-1',
      titleGu: 'નિયમ ૧: બોમ્બે સ્ટેમ્પ અધિનિયમ મુજબ નિયત મૂલ્ય સ્ટેમ્પ',
      titleHi: 'नियम १: बॉम्बे स्टाम्प अधिनियम अनुसार निर्धारित स्टाम्प',
      titleEn: 'Rule 1: Prescribed Stamp Duty under Bombay Stamp Act',
      actReference: 'Bombay Stamp Act 1958 & Revenue Department Guidelines',
      criterionGu: 'નિયત મૂલ્યનું ₹૫૦/- અથવા ₹૩૦૦/- નું સત્તાવાર ઈ-સ્ટેમ્પ પ્રમાણપત્ર હોવું અનિવાર્ય.',
      criterionHi: 'निर्धारित मूल्य ₹५०/- अथवा ₹३००/- का आधिकारिक ई-स्टाम्प होना अनिवार्य।',
      criterionEn: 'Must bear valid ₹50 or ₹300 e-Stamp duty certificate.',
      status: 'PASSED',
      aiVerdictGu: `✓ ઈ-સ્ટેમ્પ સર્ટિફિકેટ નં: IN-GJ99182371, સરકારી સ્ટેમ્પ ડ્યુટી ચુકવણી પ્રમાણિત.`,
      aiVerdictHi: `✓ ई-स्टाम्प संख्या: IN-GJ99182371, स्टाम्प शुल्क प्रमाणित।`,
      aiVerdictEn: `✓ e-Stamp Certificate IN-GJ99182371 duty verified.`
    },
    {
      id: 'aff-2',
      titleGu: 'નિયમ ૨: નોટરી / મેજિસ્ટ્રેટ સિક્કો અને નોંધણી ક્રમાંક',
      titleHi: 'नियम २: नोटरी मुहर एवं पंजीकरण क्रमांक',
      titleEn: 'Rule 2: Notary Public / Executive Magistrate Attestation',
      actReference: 'Notaries Act 1952 & Oath Commissioner Rules',
      criterionGu: 'નોટરી પબ્લિકનું લાયસન્સ, રજિસ્ટર નંબર અને ગોળ સિક્કો માન્ય હોવો જોઈએ.',
      criterionHi: 'नोटरी का लाइसेंस, रजिस्टर क्रमांक एवं मुहर मान्य होनी चाहिए।',
      criterionEn: 'Must bear Notary license number, book register entry and seal.',
      status: 'PASSED',
      aiVerdictGu: `✓ નોટરી ભારત સરકાર, રજિસ્ટ્રેશન નં: 8841/2026, સહી & સિક્કો પ્રમાણિત.`,
      aiVerdictHi: `✓ नोटरी भारत सरकार, पंजीकरण सं: 8841/2026, मुहर प्रमाणित।`,
      aiVerdictEn: `✓ Notary Govt of India, Reg No: 8841/2026 seal and signature verified.`
    },
    {
      id: 'aff-3',
      titleGu: 'નિયમ ૩: યોજના શરત મુજબ કાયદેસર બાંયધરી નિવેદન',
      titleHi: 'नियम ३: योजना शर्तों का कानूनी शपथ पत्र',
      titleEn: 'Rule 3: Statutory Scheme Undertaking Statement',
      actReference: 'Welfare Scheme Statutory Declaration Rules',
      criterionGu: 'યોજનાના નિયમ અનુસાર પુનઃલગ્ન ન કર્યા અંગે અથવા શરતોનું પાલન કર્યાનું સ્પષ્ટ નિવેદન.',
      criterionHi: 'योजना नियमों के अनुसार पुनर्विवाह न करने का स्पष्ट शपथ पत्र।',
      criterionEn: 'Explicit legal undertaking confirming non-remarriage and compliance.',
      status: 'PASSED',
      aiVerdictGu: `✓ કાયદેસર શપથ પર પુનઃલગ્ન ન કર્યાનું બાંયધરી નિવેદન સંપૂર્ણ સ્પષ્ટ.`,
      aiVerdictHi: `✓ कानूनी शपथ पर पुनर्विवाह न करने का शपथ पत्र स्पष्ट।`,
      aiVerdictEn: `✓ Legal undertaking confirmed under statutory oath.`
    }
  ];
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
  const [activeReviewTab, setActiveReviewTab] = useState<'DOCUMENTS' | 'APPLICATION_FORM'>('DOCUMENTS');
  const [previewDocLightbox, setPreviewDocLightbox] = useState<any | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState<number>(1);
  const [physicallyVerifiedDocs, setPhysicallyVerifiedDocs] = useState<Record<string, boolean>>({});
  const [selectedCitizenForReceipt, setSelectedCitizenForReceipt] = useState<QueueCitizen | null>(null);
  const [selectedCitizenForApprovalCert, setSelectedCitizenForApprovalCert] = useState<any | null>(null);
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
    const certNo = `GJ-REV-2026-CERT-${Math.floor(10000 + Math.random() * 90000)}`;
    const approvalPayload = {
      certificateNumber: certNo,
      tokenNumber: completed.tokenNumber,
      citizenNameGu: completed.citizenNameGu,
      citizenNameHi: completed.citizenNameHi,
      citizenNameEn: completed.citizenNameEn,
      schemeTitleGu: completed.schemeTitleGu,
      schemeTitleHi: completed.schemeTitleHi,
      schemeTitleEn: completed.schemeTitleEn,
      aadhaarLast4: completed.aadhaarLast4,
      phone: completed.phone,
      appliedTime: completed.appliedTime,
      counterNumber: selectedCounter,
      officerNameGu: 'શ્રી કે. એમ. ત્રિવેદી (નાયબ મામલતદાર)',
      officerNameHi: 'श्री के. एम. त्रिवेदी (नायब तहसीलदार)',
      officerNameEn: 'Shri K. M. Trivedi (Dy. Mamlatdar)',
      talukaOffice: currentTaluka?.officeNameGu || 'મામલતદાર કચેરી, ગોંડલ',
      districtName: currentDistrict?.nameGu || 'રાજકોટ',
      approvedAt: new Date().toISOString(),
      serviceHandlingTime: formatTime(elapsedSeconds),
      paymentStatus: completed.payment?.status || 'PAID',
      grasChallanNo: completed.payment?.grasChallanNo || completed.payment?.kacheriChallanNo || 'GRAS/2026/04/991823',
      digitalSignatureSha: `SHA256:7a9f${Math.floor(10000000 + Math.random() * 90000000)}b4c1`,
      status: 'APPROVED',
      remarks: 'અસલ દસ્તાવેજો રૂબરૂ ચકાસ્યા બાદ સત્તાવાર મંજૂરી હુકમ જારી કરેલ છે.'
    };

    setQueue(prev => prev.map(c => 
      c.id === completed.id ? { ...c, status: 'COMPLETED' } : c
    ));

    setStats(prev => ({
      ...prev,
      servedToday: prev.servedToday + 1,
      priorityServed: completed.isPriority ? prev.priorityServed + 1 : prev.priorityServed
    }));

    // Update LocalStorage for persistent government records
    try {
      const storedCerts = localStorage.getItem('qless_approved_certificates');
      const certList = storedCerts ? JSON.parse(storedCerts) : [];
      localStorage.setItem('qless_approved_certificates', JSON.stringify([approvalPayload, ...certList]));

      const storedTokens = localStorage.getItem('qless_real_queue_tokens');
      if (storedTokens) {
        const tokenList: BookingDetails[] = JSON.parse(storedTokens);
        const updatedTokens = tokenList.map(b => b.tokenNumber === completed.tokenNumber ? { ...b, status: 'COMPLETED' as any, approvalDetails: approvalPayload } : b);
        localStorage.setItem('qless_real_queue_tokens', JSON.stringify(updatedTokens));
      }
    } catch (e) {
      console.error(e);
    }

    addAuditLog(
      'COMPLETED', 
      completed.tokenNumber, 
      `સેવા મંજૂર (હુકમ: ${certNo}). સેવા સમય: ${formatTime(elapsedSeconds)}`,
      `सेवा स्वीकृत (आदेश: ${certNo}). सेवा समय: ${formatTime(elapsedSeconds)}`,
      `Service approved (Order: ${certNo}). Handling time: ${formatTime(elapsedSeconds)}`
    );

    broadcastQueueEvent({
      type: 'TOKEN_COMPLETED',
      tokenNumber: completed.tokenNumber,
      counterNumber: selectedCounter,
      talukaId: selectedTalukaId,
      timestamp: Date.now(),
      payload: approvalPayload
    });

    const citizenName = isGu ? completed.citizenNameGu : isHi ? completed.citizenNameHi : completed.citizenNameEn;
    const voiceMsg = isGu 
      ? `ટોકન નંબર ${completed.tokenNumber} ની સેવા મંજૂર થયેલ છે. સત્તાવાર પ્રમાણપત્ર નં ${certNo} જારી થયેલ છે.`
      : isHi
      ? `टोकन नंबर ${completed.tokenNumber} की सेवा स्वीकृत हुई। प्रमाण पत्र संख्या ${certNo} जारी किया गया है।`
      : `Token number ${completed.tokenNumber} approved. Certificate number ${certNo} issued.`;
    speakGuidance(voiceMsg, lang);

    setCounterToast({
      title: isGu ? "✅ સેવા સત્તાવાર મંજૂર & પ્રમાણિત!" : isHi ? "✅ सेवा स्वीकृत एवं प्रमाणित!" : "✅ Service Approved & Certified!",
      message: `${completed.tokenNumber} (${citizenName}) • હુકમ નં: ${certNo}`,
      type: 'success'
    });

    setSelectedCitizenForApprovalCert(approvalPayload);
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

                  {/* 🔒 APPOINTMENT SLOT VALIDITY STATUS (Strict Verification) */}
                  <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                      <span className="font-bold text-emerald-950">
                        {isGu ? "📅 નિયત મુલાકાત સ્લોટ:" : isHi ? "📅 नियत स्लॉट:" : "📅 Appointed Slot:"}{' '}
                        <strong className="font-mono text-emerald-900">{currentServing.appliedTime || '11:30 AM - 12:30 PM'}</strong>
                      </span>
                    </div>
                    <span className="text-[10.5px] font-black text-emerald-900 bg-emerald-200/90 border border-emerald-400/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{isGu ? "✓ નિયત તારીખ & સમયમાં માન્ય (Token Validated)" : isHi ? "✓ नियत समय में मान्य" : "✓ Slot Validated"}</span>
                    </span>
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

      {/* 📄 1. CITIZEN ORIGINAL DOCUMENTS, STATUTORY AI RULES & APPLICATION FORM MODAL */}
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
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-5 overflow-y-auto modal-backdrop animate-in fade-in"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#003366] to-[#005A9C] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white shrink-0 shadow-inner">
                    <GovLogo className="w-7 h-7 drop-shadow-md" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs sm:text-base font-black text-white">
                        {isGu ? "અરજદાર દસ્તાવેજ, AI ચકાસણી & સત્તાવાર અરજી ફોર્મ (Officer Dossier Review)" : isHi ? "आवेदक दस्तावेज़, AI सत्यापन एवं सरकारी आवेदन पत्र" : "Applicant Dossier, AI OCR & Official Application Review"}
                      </h4>
                      <span className="bg-[#FF9933] text-slate-900 font-black text-[9.5px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {isGu ? "સત્તાવાર કચેરી ડેસ્ક" : "Official Desk"}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-blue-100 font-mono mt-0.5">
                      {isGu ? "ટોકન:" : "Token:"} <strong className="text-white bg-blue-900/60 px-1.5 py-0.5 rounded text-xs">{activeCitizen.tokenNumber}</strong> • {isGu ? activeCitizen.citizenNameGu : isHi ? activeCitizen.citizenNameHi : activeCitizen.citizenNameEn} • {isGu ? activeCitizen.schemeTitleGu : activeCitizen.schemeTitleEn}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setSelectedCitizenForDocs(null);
                    setDocModalOpen(false);
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs cursor-pointer transition shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* DUAL-TAB NAVIGATION BAR */}
              <div className="flex border-b border-slate-200 bg-slate-100 px-3 sm:px-6 pt-2.5 gap-2 shrink-0">
                <button 
                  onClick={() => setActiveReviewTab('DOCUMENTS')}
                  className={`px-3.5 sm:px-5 py-2.5 font-black text-xs sm:text-sm rounded-t-2xl transition flex items-center gap-2 cursor-pointer ${
                    activeReviewTab === 'DOCUMENTS' 
                      ? 'bg-white text-[#003366] border-t-2 border-t-[#003366] shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>{isGu ? `📑 અપલોડ કરેલ દસ્તાવેજો & AI સરકારી નિયમ સમીક્ષા (${citizenDocs.length})` : isHi ? `📑 अपलोड दस्तावेज़ एवं AI सरकारी नियम समीक्षा (${citizenDocs.length})` : `📑 Uploaded Proofs & Statutory Rules (${citizenDocs.length})`}</span>
                </button>
                <button 
                  onClick={() => setActiveReviewTab('APPLICATION_FORM')}
                  className={`px-3.5 sm:px-5 py-2.5 font-black text-xs sm:text-sm rounded-t-2xl transition flex items-center gap-2 cursor-pointer ${
                    activeReviewTab === 'APPLICATION_FORM' 
                      ? 'bg-white text-[#003366] border-t-2 border-t-[#003366] shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ClipboardList className="w-4 h-4 text-[#FF9933]" />
                  <span>{isGu ? "📋 સત્તાવાર સરકારી અરજી ફોર્મ (Digital Gujarat Form)" : isHi ? "📋 सरकारी आवेदन पत्र (Digital Gujarat Form)" : "📋 Official Scheme Application Form"}</span>
                </button>
              </div>

              {/* MODAL BODY */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs bg-slate-50/50">

                {/* TAB 1: UPLOADED DOCUMENTS & STATUTORY RULES */}
                {activeReviewTab === 'DOCUMENTS' && (
                  <div className="space-y-4 animate-in fade-in">
                    
                    {/* AI Automated Pre-check Verdict Card */}
                    <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 sm:p-4 space-y-2 shadow-xs">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-black text-emerald-950 flex items-center gap-2 text-xs sm:text-sm">
                          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                          {isGu ? "AI OCR સ્કેનિંગ & સરકારી નિયમ ચકાસણી પરિણામ" : isHi ? "AI OCR स्कैनिंग एवं सरकारी नियम सत्यापन परिणाम" : "AI OCR Scanning & Regulatory Verdict"}
                        </span>
                        <span className="bg-emerald-200 text-emerald-950 font-black text-[10.5px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                          <span>✓ {isGu ? "પ્રી-ચેક સફળ (૧૦૦% પાસ)" : isHi ? "पूर्व-जांच सफल (100%)" : "Pre-check 100% Passed"}</span>
                        </span>
                      </div>
                      <p className="text-emerald-900 font-medium leading-relaxed text-[11.5px] sm:text-xs">
                        {isGu ? activeCitizen.aiOcrVerdictGu : isHi ? activeCitizen.aiOcrVerdictHi : activeCitizen.aiOcrVerdictEn}
                      </p>
                      <div className="pt-2 border-t border-emerald-200/70 flex items-center justify-between text-[10px] text-emerald-800">
                        <span>🏛️ ગુજરાત જન સેવા કેન્દ્ર નિયમાવલી મુજબ પ્રમાણિત</span>
                        <span className="font-mono font-bold">UIDAI • REVENUE • CIVIL REGISTRY COMPLIANT</span>
                      </div>
                    </div>

                    {/* Uploaded Documents List with Real Visual Preview & Statutory Rules */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="font-black text-slate-800 uppercase tracking-wider text-[11px] sm:text-xs flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-[#003366]" />
                          <span>{isGu ? `અપલોડ કરેલ કાગળો અને ડિજિટલ પુરાવા (${citizenDocs.length})` : `Uploaded Proofs & AI Verification (${citizenDocs.length})`}</span>
                        </h5>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {isGu ? "દરેક દસ્તાવેજ માટે સ્વતંત્ર કાનૂની નિયમો" : "Individual Statutory Rule Checklists"}
                        </span>
                      </div>

                      {citizenDocs.map((doc: any, idx: number) => {
                        const docName = isGu ? doc.nameGu : isHi ? (doc.nameHi || doc.nameGu) : (doc.nameEn || doc.nameGu);
                        const isAadhaar = doc.nameGu.includes('આધાર') || doc.nameGu.toLowerCase().includes('aadhaar');
                        const isIncome = doc.nameGu.includes('આવક') || doc.nameGu.toLowerCase().includes('income');
                        const isDeath = doc.nameGu.includes('અવસાન') || doc.nameGu.includes('મરણ') || doc.nameGu.toLowerCase().includes('death');
                        const isRation = doc.nameGu.includes('રેશન') || doc.nameGu.toLowerCase().includes('ration');

                        const ocrData = doc.ocrExtractedData || {
                          documentType: isAadhaar ? 'AADHAAR_CARD (UIDAI)' : isIncome ? 'INCOME_CERTIFICATE (REVENUE)' : isDeath ? 'DEATH_CERTIFICATE (FORM 6)' : isRation ? 'RATION_CARD (NFSA)' : 'OFFICIAL_AFFIDAVIT',
                          idNumber: isAadhaar ? `XXXX-XXXX-${activeCitizen.aadhaarLast4 || '7104'}` : isIncome ? `INC-GJ-2026-${activeCitizen.aadhaarLast4 || '449102'}` : isDeath ? 'GJ-RBD-2024-004128' : '042100889231',
                          holderName: isGu ? activeCitizen.citizenNameGu : activeCitizen.citizenNameEn,
                          confidence: 0.994,
                          dates: ['01/04/2025', '31/03/2028']
                        };

                        const docRules = getStatutoryDocumentRules(doc.nameGu, activeCitizen, isGu, isHi);
                        const isPhysicallyVerified = !!physicallyVerifiedDocs[`${activeCitizen.tokenNumber}_${idx}`];

                        return (
                          <div key={idx} className="bg-white border-2 border-slate-200 hover:border-blue-300 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xs transition">
                            
                            {/* Document Card Header */}
                            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-[#003366] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                                  {idx + 1}
                                </div>
                                <div>
                                  <p className="font-black text-slate-900 text-xs sm:text-sm">{docName}</p>
                                  <span className="text-[10.5px] text-slate-500 font-mono">
                                    {doc.uploadedAt ? `અપલોડ: ${new Date(doc.uploadedAt).toLocaleTimeString()}` : 'સિસ્ટમ પ્રોફાઇલ રેકોર્ડ • પ્રી-વેરિફાઈડ'}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="bg-emerald-100 border border-emerald-300 text-emerald-900 font-black text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>{isGu ? "AI પ્રમાણિત" : isHi ? "AI प्रमाणित" : "AI Verified"}</span>
                                </span>
                                <button
                                  onClick={() => {
                                    triggerHaptic('tap');
                                    setPreviewDocLightbox({
                                      docName,
                                      fileUrl: doc.fileUrl,
                                      ocrData,
                                      docRules,
                                      idx,
                                      activeCitizen
                                    });
                                    setLightboxZoom(1);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#003366] font-bold text-[10px] flex items-center gap-1 transition cursor-pointer border border-blue-200 shadow-2xs"
                                >
                                  <Maximize2 className="w-3 h-3 text-[#005A9C]" />
                                  <span>{isGu ? "મોટું જુઓ" : "Enlarge"}</span>
                                </button>
                              </div>
                            </div>

                            {/* Two-Column Grid: Left: Visual Document Preview | Right: AI Metadata & Government Rules */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                              
                              {/* Left Column: Visual Document Preview (Real Upload or Official Government Facsimile) */}
                              <div className="md:col-span-4 bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col justify-between">
                                
                                {doc.fileUrl ? (
                                  <div 
                                    onClick={() => {
                                      setPreviewDocLightbox({
                                        docName,
                                        fileUrl: doc.fileUrl,
                                        ocrData,
                                        docRules,
                                        idx,
                                        activeCitizen
                                      });
                                      setLightboxZoom(1);
                                    }}
                                    className="relative group rounded-lg overflow-hidden border border-slate-200 bg-white h-40 flex items-center justify-center cursor-pointer shadow-inner"
                                  >
                                    <img 
                                      src={doc.fileUrl} 
                                      alt={docName} 
                                      className="w-full h-full object-cover transition group-hover:scale-105" 
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 text-white font-bold text-[11px]">
                                      <Maximize2 className="w-4 h-4" />
                                      <span>{isGu ? "મોટું જુઓ (Zoom)" : "Click to Zoom"}</span>
                                    </div>
                                    <span className="absolute bottom-1.5 right-1.5 bg-emerald-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-xs">
                                      ✓ અસલ નાગરિક અપલોડ
                                    </span>
                                  </div>
                                ) : (
                                  /* Official High-Fidelity Government Document Facsimile Card */
                                  <div 
                                    onClick={() => {
                                      setPreviewDocLightbox({
                                        docName,
                                        fileUrl: null,
                                        ocrData,
                                        docRules,
                                        idx,
                                        activeCitizen
                                      });
                                      setLightboxZoom(1);
                                    }}
                                    className="rounded-xl overflow-hidden border border-slate-300 bg-white shadow-xs cursor-pointer hover:border-[#003366] transition group"
                                  >
                                    {isAadhaar ? (
                                      /* AADHAAR CARD FACSIMILE */
                                      <div className="p-2.5 space-y-1.5 bg-gradient-to-b from-orange-50/40 via-white to-emerald-50/30 text-[9px]">
                                        <div className="h-1 bg-gradient-to-r from-orange-500 via-white to-emerald-600 rounded-full" />
                                        <div className="flex items-center justify-between border-b border-slate-200/60 pb-1">
                                          <div className="flex items-center gap-1">
                                            <GovLogo className="w-4 h-4" />
                                            <span className="font-black text-[#003366] text-[8px] tracking-tight">ભારત સરકાર / GOVT OF INDIA</span>
                                          </div>
                                          <span className="text-[7.5px] font-bold text-orange-700 font-mono">UIDAI</span>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                          <div className="w-12 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 rounded flex flex-col items-center justify-center shrink-0 text-slate-400">
                                            <User className="w-5 h-5 text-blue-700" />
                                            <span className="text-[6.5px] font-bold text-blue-900 mt-0.5">UIDAI PASS</span>
                                          </div>
                                          <div className="space-y-0.5 leading-tight">
                                            <p className="font-black text-slate-900 text-[10px]">{activeCitizen.citizenNameGu}</p>
                                            <p className="text-slate-500 text-[8px]">{activeCitizen.citizenNameEn}</p>
                                            <p className="text-slate-600 text-[7.5px]">જન્મ: ૦૪/૧૧/૧૯૬૧ • સ્ત્રી</p>
                                            <p className="font-mono font-black text-[#003366] text-[10px] tracking-wider pt-0.5">
                                              XXXX XXXX {activeCitizen.aadhaarLast4 || '7104'}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="bg-emerald-50 border border-emerald-200 rounded p-1 text-[7.5px] text-emerald-900 font-bold flex items-center justify-between">
                                          <span>✓ માસ્ક્ડ આધાર પ્રમાણિત</span>
                                          <span className="font-mono">QR VERIFIED</span>
                                        </div>
                                      </div>
                                    ) : isIncome ? (
                                      /* INCOME CERTIFICATE FACSIMILE */
                                      <div className="p-2.5 space-y-1.5 bg-amber-50/30 text-[9px] border-t-2 border-t-amber-600">
                                        <div className="flex items-center justify-between border-b border-amber-200 pb-1">
                                          <div className="flex items-center gap-1">
                                            <GovLogo className="w-4 h-4" />
                                            <span className="font-black text-amber-950 text-[8px]">ગુજરાત સરકાર • મહેસૂલ વિભાગ</span>
                                          </div>
                                          <span className="text-[7px] font-mono text-amber-800 font-bold">DIGITAL GUJARAT</span>
                                        </div>
                                        <div className="text-center py-0.5">
                                          <p className="font-black text-slate-900 text-[9.5px]">સક્ષમ સત્તાધિકારી આવક પ્રમાણપત્ર</p>
                                          <p className="text-[7.5px] text-slate-600 font-mono">INC-GJ-2026-{activeCitizen.aadhaarLast4 || '449102'}</p>
                                        </div>
                                        <div className="bg-white p-1 rounded border border-amber-200 space-y-0.5 text-[8px]">
                                          <p><strong>અરજદાર:</strong> {activeCitizen.citizenNameGu}</p>
                                          <p><strong>વાર્ષિક આવક:</strong> <span className="font-bold text-emerald-800">{activeCitizen.incomeDeclaredGu || '₹ ૯૫,૦૦૦'}</span></p>
                                          <p><strong>કાર્યક્ષેત્ર:</strong> મામલતદાર કચેરી, ગોંડલ (રાજકોટ)</p>
                                        </div>
                                        <div className="bg-emerald-50 border border-emerald-300 rounded p-1 text-[7.5px] text-emerald-900 font-bold flex items-center justify-between">
                                          <span>✓ ૩ નાણાકીય વર્ષ માટે માન્ય</span>
                                          <span className="font-mono">૨૦૨૫-૨૦૨૮</span>
                                        </div>
                                      </div>
                                    ) : isDeath ? (
                                      /* DEATH CERTIFICATE FACSIMILE */
                                      <div className="p-2.5 space-y-1.5 bg-slate-50 text-[9px] border-t-2 border-t-slate-700">
                                        <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                                          <div className="flex items-center gap-1">
                                            <GovLogo className="w-4 h-4" />
                                            <span className="font-black text-slate-800 text-[8px]">જન્મ અને મરણ રજિસ્ટ્રાર કચેરી</span>
                                          </div>
                                          <span className="text-[7px] font-mono text-slate-600 font-bold">FORM NO. 6</span>
                                        </div>
                                        <div className="text-center py-0.5">
                                          <p className="font-black text-slate-900 text-[9.5px]">મરણ પ્રમાણપત્ર (DEATH CERTIFICATE)</p>
                                          <p className="text-[7.5px] text-slate-600 font-mono">GJ-RBD-2024-004128</p>
                                        </div>
                                        <div className="bg-white p-1 rounded border border-slate-200 space-y-0.5 text-[8px]">
                                          <p><strong>મૃતકનું નામ:</strong> સ્વ. રમણિકભાઈ કરસનભાઈ પટેલ</p>
                                          <p><strong>મરણ તારીખ:</strong> ૧૪/૧૦/૨૦૨૪</p>
                                          <p><strong>સ્થળ:</strong> સરકારી સિવિલ હોસ્પિટલ, ગોંડલ</p>
                                        </div>
                                        <div className="bg-blue-50 border border-blue-200 rounded p-1 text-[7.5px] text-blue-900 font-bold flex items-center justify-between">
                                          <span>✓ RBD Act ૧૯૬૯ કલમ ૧૨/૧૭</span>
                                          <span className="font-mono">SEAL VERIFIED</span>
                                        </div>
                                      </div>
                                    ) : isRation ? (
                                      /* RATION CARD FACSIMILE */
                                      <div className="p-2.5 space-y-1.5 bg-emerald-50/40 text-[9px] border-t-2 border-t-emerald-600">
                                        <div className="flex items-center justify-between border-b border-emerald-200 pb-1">
                                          <span className="font-black text-emerald-950 text-[8px]">અન્ન & નાગરિક પુરવઠો, ગુજરાત</span>
                                          <span className="text-[7px] font-mono text-emerald-800 font-bold">NFSA PHH</span>
                                        </div>
                                        <div className="bg-white p-1 rounded border border-emerald-200 space-y-0.5 text-[8px]">
                                          <p className="font-mono font-bold text-slate-800">NO: 042100889231</p>
                                          <p><strong>મુખી:</strong> {activeCitizen.citizenNameGu}</p>
                                          <p><strong>સભ્યો:</strong> ૨ સભ્યો (NFSA પાત્ર)</p>
                                        </div>
                                        <div className="bg-emerald-100 rounded p-1 text-[7.5px] text-emerald-950 font-bold">
                                          ✓ બારકોડેડ રેશનકાર્ડ વેરિફાઈડ
                                        </div>
                                      </div>
                                    ) : (
                                      /* AFFIDAVIT / OTHER FACSIMILE */
                                      <div className="p-2.5 space-y-1.5 bg-amber-50/20 text-[9px] border-t-2 border-t-indigo-600">
                                        <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                                          <span className="font-black text-slate-900 text-[8px]">INDIA NON JUDICIAL • GUJARAT</span>
                                          <span className="text-[7.5px] font-bold text-indigo-700">₹ ૫૦ E-STAMP</span>
                                        </div>
                                        <div className="bg-white p-1 rounded border border-slate-200 space-y-0.5 text-[8px]">
                                          <p className="font-mono text-[7px] text-slate-500">IN-GJ99182371</p>
                                          <p className="font-bold text-slate-800">નોટરાઇઝ્ડ બાંયધરી સોગંદનામું</p>
                                          <p className="text-slate-600">Notary Reg: 8841/2026</p>
                                        </div>
                                        <div className="bg-indigo-50 rounded p-1 text-[7.5px] text-indigo-950 font-bold">
                                          ✓ કાયદેસર શપથ પ્રમાણિત
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-slate-200/80">
                                  <span className="text-[9.5px] text-[#005A9C] font-bold flex items-center gap-1">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    <span>{isGu ? "અધિકૃત પ્રમાણ" : "Govt Certified"}</span>
                                  </span>
                                  <button
                                    onClick={() => {
                                      setPreviewDocLightbox({
                                        docName,
                                        fileUrl: doc.fileUrl,
                                        ocrData,
                                        docRules,
                                        idx,
                                        activeCitizen
                                      });
                                      setLightboxZoom(1);
                                    }}
                                    className="text-[9.5px] text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
                                  >
                                    {isGu ? "🔍 ક્લિક કરી મોટું જુઓ" : "Zoom view"}
                                  </button>
                                </div>

                              </div>

                              {/* Right Column: AI OCR Metadata & Official Gujarat Government Statutory Rules Engine */}
                              <div className="md:col-span-8 space-y-3">
                                
                                {/* OCR Extracted Summary Strip */}
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px]">
                                    <div>
                                      <span className="text-slate-500 text-[9.5px] block">{isGu ? "પ્રકાર:" : "Type:"}</span>
                                      <span className="font-mono font-bold text-slate-800 text-[10px] truncate block">{ocrData.documentType}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 text-[9.5px] block">{isGu ? "ક્રમાંક:" : "ID No:"}</span>
                                      <span className="font-mono font-black text-[#003366] text-[10px] truncate block">{ocrData.idNumber}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 text-[9.5px] block">{isGu ? "ધારકનું નામ:" : "Holder:"}</span>
                                      <span className="font-bold text-slate-800 text-[10px] truncate block">{ocrData.holderName}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-500 text-[9.5px] block">{isGu ? "AI ચોકસાઈ:" : "Confidence:"}</span>
                                      <span className="font-mono font-black text-emerald-700 text-[10px]">
                                        {ocrData.confidence ? `${(ocrData.confidence * 100).toFixed(1)}%` : '99.4%'} (ઉચ્ચ)
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Statutory Rule Engine: Specific Gujarat Government Rules for this document */}
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="font-black text-slate-900 text-[11px] flex items-center gap-1.5">
                                      <Building className="w-3.5 h-3.5 text-[#003366]" />
                                      <span>{isGu ? "🏛️ ગુજરાત સરકાર સત્તાવાર કાનૂની નિયમ ચકાસણી (Statutory Rules):" : "🏛️ Gujarat Statutory Regulatory Checks:"}</span>
                                    </span>
                                    <span className="text-[9.5px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                      {docRules.length}/{docRules.length} નિયમો પાસ
                                    </span>
                                  </div>

                                  <div className="space-y-1.5">
                                    {docRules.map((rule) => (
                                      <div key={rule.id} className="bg-slate-50/80 border border-slate-200/90 rounded-xl p-2.5 text-[11px] space-y-1">
                                        <div className="flex items-start justify-between gap-1.5">
                                          <div>
                                            <span className="font-black text-slate-900 text-[11px] block">
                                              {isGu ? rule.titleGu : isHi ? rule.titleHi : rule.titleEn}
                                            </span>
                                            <span className="text-[9.5px] font-mono text-blue-700 font-bold">
                                              સંદર્ભ: {rule.actReference}
                                            </span>
                                          </div>
                                          <span className="bg-emerald-100 text-emerald-900 font-black text-[9px] px-2 py-0.5 rounded-full shrink-0 border border-emerald-300">
                                            ✓ {isGu ? "પાસ" : "PASSED"}
                                          </span>
                                        </div>
                                        <p className="text-[10.5px] text-emerald-800 font-medium leading-relaxed bg-emerald-50/60 p-1.5 rounded-lg border border-emerald-200/50">
                                          {isGu ? rule.aiVerdictGu : isHi ? rule.aiVerdictHi : rule.aiVerdictEn}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Officer Physical Document Cross-Verification Checkbox */}
                                <div 
                                  onClick={() => {
                                    triggerHaptic('tap');
                                    const key = `${activeCitizen.tokenNumber}_${idx}`;
                                    setPhysicallyVerifiedDocs(prev => ({ ...prev, [key]: !prev[key] }));
                                  }}
                                  className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                                    isPhysicallyVerified 
                                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950' 
                                      : 'bg-white border-slate-300 hover:border-slate-400 text-slate-700'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    {isPhysicallyVerified ? (
                                      <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                                    ) : (
                                      <Square className="w-4 h-4 text-slate-400 shrink-0" />
                                    )}
                                    <span className="font-bold text-[11px]">
                                      {isGu 
                                        ? "અસલ કાગળ સાથે રૂબરૂ સરખામણી પૂર્ણ (Physically Verified with Original)" 
                                        : "Physically Verified with Original Document at Counter"}
                                    </span>
                                  </div>
                                  <span className={`text-[9.5px] font-mono font-bold px-2 py-0.5 rounded ${
                                    isPhysicallyVerified ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {isPhysicallyVerified ? "ચકાસાયેલ ✓" : "અધિકારી ચેકલિસ્ટ"}
                                  </span>
                                </div>

                              </div>

                            </div>

                          </div>
                        );
                      })}
                    </div>

                    {/* Statutory Officer Instruction Note */}
                    <div className="bg-amber-50 p-3 sm:p-4 rounded-2xl border border-amber-200 text-[11.5px] text-amber-950 leading-relaxed space-y-1">
                      <div className="flex items-center gap-1.5 font-black text-amber-900 text-xs">
                        <AlertCircle className="w-4 h-4 text-amber-700" />
                        <span>{isGu ? "અધિકારી કાયદાકીય માર્ગદર્શિકા (Statutory Officer Protocol):" : "Official Officer Protocol:"}</span>
                      </div>
                      <p>
                        {isGu 
                          ? "આ તમામ દસ્તાવેજોનું સિસ્ટમ પ્રી-ચેક (AI OCR + સરકારી નિયમ એન્જિન) ૧૦૦% સફળ થયેલ છે. કાઉન્ટર પર અરજદારના અસલ કાગળો રૂબરૂ મેળવી લીધા બાદ ઉપર આપેલ અરજી ફોર્મ ચકાસી અરજી આખરી મંજૂર કરવી."
                          : "System pre-check (AI OCR + Gujarat Rule Engine) is 100% compliant. Verify physical originals presented by citizen and approve the application."}
                      </p>
                    </div>

                  </div>
                )}

                {/* TAB 2: OFFICIAL DIGITAL GUJARAT SCHEME APPLICATION FORM */}
                {activeReviewTab === 'APPLICATION_FORM' && (
                  <div className="space-y-4 animate-in fade-in">
                    
                    {/* Official Gujarat Government Form Document Paper */}
                    <div className="bg-white border-2 border-slate-300 rounded-2xl p-4 sm:p-6 shadow-sm space-y-5 text-slate-900 print:border-none">
                      
                      {/* Government Form Header */}
                      <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
                        <div className="flex items-center justify-center gap-2">
                          <GovLogo className="w-8 h-8 drop-shadow-sm" />
                          <h3 className="text-base sm:text-lg font-black text-[#003366] tracking-tight">
                            ગુજરાત સરકાર • GOVERNMENT OF GUJARAT
                          </h3>
                        </div>
                        <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
                          મહિલા અને બાળ વિકાસ વિભાગ / સામાજિક ન્યાય & મહેસૂલ વિભાગ
                        </p>
                        <div className="inline-block bg-[#003366] text-white px-4 py-1 rounded-full text-xs sm:text-sm font-black mt-1">
                          {activeCitizen.schemeTitleGu}
                        </div>
                        <p className="text-[10px] text-slate-500 font-mono pt-0.5">
                          પરિશિષ્ટ-૧ (નિયમ-૪ અન્વયે સત્તાવાર ઓનલાઇન અરજી પત્રક) • DIGITAL GUJARAT FORM
                        </p>
                      </div>

                      {/* Official Application Metadata Bar & Citizen Photo */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs w-full sm:w-auto">
                          <div>
                            <span className="text-[10px] text-slate-500 block">અરજી ક્રમાંક (App No):</span>
                            <span className="font-mono font-black text-[#003366] text-xs">
                              GJ-APP-2026-{activeCitizen.aadhaarLast4 || '449102'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">ટોકન ક્રમાંક:</span>
                            <span className="font-mono font-black text-emerald-800 text-xs">
                              {activeCitizen.tokenNumber} (કાઉન્ટર {activeCitizen.counterNumber})
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block">અરજી તારીખ & સમય:</span>
                            <span className="font-mono font-bold text-slate-700 text-xs">
                              ૧૦/૧૦/૨૦૨૬ • {activeCitizen.appliedTime || '10:35 AM'}
                            </span>
                          </div>
                        </div>

                        {/* Citizen Passport Photo Box with UIDAI Verified Stamp */}
                        <div className="flex items-center gap-2.5 shrink-0 bg-white border border-slate-300 p-1.5 rounded-xl shadow-2xs">
                          <div className="w-14 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-300 rounded-lg flex flex-col items-center justify-center text-blue-900 text-center">
                            <User className="w-6 h-6 text-blue-800" />
                            <span className="text-[6.5px] font-bold mt-0.5">PASSPORT</span>
                          </div>
                          <div className="space-y-0.5 text-left">
                            <span className="bg-emerald-100 border border-emerald-300 text-emerald-950 font-black text-[8.5px] px-1.5 py-0.5 rounded block text-center">
                              ✓ આધાર બાયોમેટ્રિક
                            </span>
                            <p className="text-[8.5px] font-mono text-slate-500">UIDAI VERIFIED</p>
                            <p className="text-[8px] text-slate-400 font-mono">SHA-256 HASH</p>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 1: APPLICANT PERSONAL DETAILS */}
                      <div className="space-y-2">
                        <h4 className="font-black text-xs sm:text-sm text-[#003366] border-b border-slate-200 pb-1 flex items-center gap-1.5">
                          <UserCheck className="w-4 h-4 text-[#FF9933]" />
                          <span>ભાગ-૧: અરજદારની સામાન્ય વિગતો (Applicant Identity)</span>
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs bg-slate-50/60 p-3 rounded-xl border border-slate-200/70">
                          <div>
                            <span className="text-[10.5px] text-slate-500 block">અરજદારનું પૂરું નામ:</span>
                            <span className="font-black text-slate-900">{activeCitizen.citizenNameGu}</span>
                          </div>
                          <div>
                            <span className="text-[10.5px] text-slate-500 block">અંગ્રેજીમાં નામ (Name in English):</span>
                            <span className="font-bold text-slate-800">{activeCitizen.citizenNameEn}</span>
                          </div>
                          <div>
                            <span className="text-[10.5px] text-slate-500 block">માસ્ક્ડ આધાર નંબર:</span>
                            <span className="font-mono font-black text-[#003366]">XXXX-XXXX-{activeCitizen.aadhaarLast4 || '7104'}</span>
                          </div>
                          <div>
                            <span className="text-[10.5px] text-slate-500 block">ઉંમર / જન્મ તારીખ:</span>
                            <span className="font-bold text-slate-800">૬૪ વર્ષ (૦૪/૧૧/૧૯૬૧ - વરિષ્ઠ નાગરિક)</span>
                          </div>
                          <div>
                            <span className="text-[10.5px] text-slate-500 block">લિંગ / જાતિ:</span>
                            <span className="font-bold text-slate-800">સ્ત્રી / સામાન્ય (બક્ષીપંચ/SEBC)</span>
                          </div>
                          <div>
                            <span className="text-[10.5px] text-slate-500 block">મોબાઈલ નંબર:</span>
                            <span className="font-mono font-bold text-slate-800">{activeCitizen.phone} (OTP પ્રમાણિત)</span>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 2: PERMANENT RESIDENTIAL ADDRESS & JURISDICTION */}
                      <div className="space-y-2">
                        <h4 className="font-black text-xs sm:text-sm text-[#003366] border-b border-slate-200 pb-1 flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-[#FF9933]" />
                          <span>ભાગ-૨: કાયમી રહેઠાણની વિગતો & મહેસૂલી હકુમત (Address & Jurisdiction)</span>
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-slate-50/60 p-3 rounded-xl border border-slate-200/70">
                          <div className="col-span-2">
                            <span className="text-[10.5px] text-slate-500 block">પૂરું સરનામું:</span>
                            <span className="font-bold text-slate-900">પટેલ શેરી, જૂના પંચાયત ચોક પાસે, ગામ: ગોમટા</span>
                          </div>
                          <div>
                            <span className="text-[10.5px] text-slate-500 block">ગામ / તાલુકો:</span>
                            <span className="font-bold text-slate-800">ગોમટા • ગોંડલ તાલુકો</span>
                          </div>
                          <div>
                            <span className="text-[10.5px] text-slate-500 block">જિલ્લો & પિનકોડ:</span>
                            <span className="font-bold text-slate-800">રાજકોટ • 360311</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-[10.5px] text-slate-500 block">રેશનકાર્ડ નંબર:</span>
                            <span className="font-mono font-bold text-slate-800">042100889231 (NFSA - PHH બારકોડેડ રેશનકાર્ડ)</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-[10.5px] text-slate-500 block">સેવા કેન્દ્ર હકુમત:</span>
                            <span className="font-bold text-[#003366]">જન સેવા કેન્દ્ર, મામલતદાર કચેરી, ગોંડલ</span>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 3: SCHEME SPECIFIC ELIGIBILITY ANSWERS */}
                      <div className="space-y-2">
                        <h4 className="font-black text-xs sm:text-sm text-[#003366] border-b border-slate-200 pb-1 flex items-center gap-1.5">
                          <BadgeCheck className="w-4 h-4 text-[#FF9933]" />
                          <span>ભાગ-૩: યોજના વિશિષ્ટ વિગતો & પાત્રતા પ્રશ્નોત્તરી (Scheme Specific Answers)</span>
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs bg-slate-50/60 p-3 rounded-xl border border-slate-200/70">
                          <div>
                            <span className="text-[10.5px] text-slate-500 block">વાર્ષિક આવક (આવક પ્રમાણપત્ર મુજબ):</span>
                            <span className="font-black text-emerald-800 text-xs">{activeCitizen.incomeDeclaredGu || '₹ ૯૫,૦૦૦ (વાર્ષિક)'}</span>
                          </div>
                          <div>
                            <span className="text-[10.5px] text-slate-500 block">સ્વ. પતિનું નામ:</span>
                            <span className="font-black text-slate-900">સ્વ. રમણિકભાઈ કરસનભાઈ પટેલ</span>
                          </div>
                          <div>
                            <span className="text-[10.5px] text-slate-500 block">પતિના અવસાનની તારીખ:</span>
                            <span className="font-bold text-slate-800">૧૪/૧૦/૨૦૨૪ (મરણ પ્રમાણપત્ર ફોર્મ-૬ સબમિટ)</span>
                          </div>
                          <div>
                            <span className="text-[10.5px] text-slate-500 block">પુનઃલગ્ન કરેલ છે કે કેમ?:</span>
                            <span className="font-black text-emerald-800">ના (પુનઃલગ્ન કરેલ નથી - સોગંદનામું સામેલ)</span>
                          </div>
                          <div>
                            <span className="text-[10.5px] text-slate-500 block">કોઈ અન્ય સહાય/પેન્શન મેળવો છો?:</span>
                            <span className="font-bold text-slate-800">ના (દ્વિતીય સરકારી સહાય નથી)</span>
                          </div>
                          <div>
                            <span className="text-[10.5px] text-slate-500 block">પાત્રતા પરિણામ:</span>
                            <span className="font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px] inline-block">
                              ✓ સરકારી ધોરણો મુજબ પાત્ર
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 4: DIRECT BENEFIT TRANSFER (DBT) BANK ACCOUNT */}
                      <div className="space-y-2">
                        <h4 className="font-black text-xs sm:text-sm text-[#003366] border-b border-slate-200 pb-1 flex items-center gap-1.5">
                          <Landmark className="w-4 h-4 text-[#FF9933]" />
                          <span>ભાગ-૪: ડાયરેક્ટ બેનિફિટ ટ્રાન્સફર (DBT) બેંક ખાતાની વિગત (Direct Benefit Transfer)</span>
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-slate-50/60 p-3 rounded-xl border border-slate-200/70">
                          <div>
                            <span className="text-[10.5px] text-slate-500 block">બેંકનું નામ:</span>
                            <span className="font-black text-slate-900">State Bank of India (SBI)</span>
                          </div>
                          <div>
                            <span className="text-[10.5px] text-slate-500 block">શાખા (Branch):</span>
                            <span className="font-bold text-slate-800">ગોંડલ મુખ્ય શાખા</span>
                          </div>
                          <div>
                            <span className="text-[10.5px] text-slate-500 block">બેંક ખાતા નંબર:</span>
                            <span className="font-mono font-black text-[#003366]">•••• •••• 8821 (Aadhaar Linked)</span>
                          </div>
                          <div>
                            <span className="text-[10.5px] text-slate-500 block">IFSC કોડ:</span>
                            <span className="font-mono font-bold text-slate-800">SBIN0000382</span>
                          </div>
                          <div className="col-span-2 sm:col-span-4 bg-blue-50 border border-blue-200 rounded-lg p-2 text-[11px] text-blue-900 font-bold flex items-center justify-between">
                            <span>🏛️ માસિક પેન્શન રકમ સીધા અરજદારના ઉપરોક્ત NPCI આધાર લિંક્ડ ખાતામાં જમા થશે.</span>
                            <span className="font-mono text-emerald-800">₹ ૧,૨૫૦/- પ્રતિ માસ</span>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 5: STATUTORY DIGITAL SELF-DECLARATION */}
                      <div className="space-y-2">
                        <h4 className="font-black text-xs sm:text-sm text-[#003366] border-b border-slate-200 pb-1 flex items-center gap-1.5">
                          <Lock className="w-4 h-4 text-[#FF9933]" />
                          <span>ભાગ-૫: કાયદેસર ડિજિટલ સ્વ-ઘોષણાપત્ર (Statutory Self-Declaration IPC 199/200)</span>
                        </h4>
                        <div className="bg-amber-50/60 border border-amber-200 p-3 rounded-xl text-[11px] text-amber-950 space-y-1.5 leading-relaxed">
                          <p>
                            <strong>સ્વ-ઘોષણા:</strong> હું આથી સપથપૂર્વક જાહેર કરું છું કે ઉપર જણાવેલ તમામ વિગતો અને અપલોડ કરેલ દસ્તાવેજો મારી જાણ મુજબ સંપૂર્ણ સાચા છે. મેં પુનઃલગ્ન કરેલ નથી અને આ યોજના હેઠળ અગાઉ કોઈ સહાય લીધેલ નથી. જો કોઈ વિગત ખોટી જણાશે તો ભારતીય દંડ સંહિતા (IPC) કલમ ૧૯૯ અને ૨૦૦ હેઠળ કાનૂની કાર્યવાહીને પાત્ર રહીશ.
                          </p>
                          <div className="flex items-center justify-between pt-1 border-t border-amber-200 text-[10px] text-amber-900 font-mono">
                            <span>ડિજિટલ સ્વીકૃતિ: ૧૦/૧૦/૨૦૨૬ • ૧૦:૩૫:૧૨ AM IST</span>
                            <span>Client Device Hash: SHA256-7f8a9c2e</span>
                          </div>
                        </div>
                      </div>

                      {/* SECTION 6: ATTACHED DOCUMENTS & RULES SUMMARY */}
                      <div className="space-y-2">
                        <h4 className="font-black text-xs sm:text-sm text-[#003366] border-b border-slate-200 pb-1 flex items-center gap-1.5">
                          <FileCheck2 className="w-4 h-4 text-[#FF9933]" />
                          <span>ભાગ-૬: બીડાણ કરેલ દસ્તાવેજોની યાદી & નિયમ ચકાસણી સારાંશ ({citizenDocs.length})</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {citizenDocs.map((doc: any, i: number) => (
                            <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between">
                              <span className="font-bold text-slate-800 text-[11px] truncate">
                                {i + 1}. {isGu ? doc.nameGu : doc.nameEn}
                              </span>
                              <span className="bg-emerald-100 text-emerald-900 font-black text-[9.5px] px-2 py-0.5 rounded-full shrink-0">
                                ✓ AI વેરિફાઈડ
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Government Form Action Strip */}
                      <div className="pt-3 border-t-2 border-slate-300 flex items-center justify-between flex-wrap gap-2">
                        <button
                          onClick={() => {
                            triggerHaptic('success');
                            window.print();
                          }}
                          className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                        >
                          <Printer className="w-4 h-4" />
                          <span>🖨️ સત્તાવાર અરજી ફોર્મ પ્રિન્ટ / PDF ડાઉનલોડ કરો</span>
                        </button>

                        <div className="text-right">
                          <p className="text-[10px] text-slate-500 font-mono">Digital Signature Hash:</p>
                          <p className="text-[10px] font-mono font-bold text-[#003366]">GJ-DPI-2026-{activeCitizen.tokenNumber.replace('#', '')}-MAMLATDAR</p>
                        </div>
                      </div>

                    </div>

                  </div>
                )}

              </div>

              {/* MODAL FOOTER */}
              <div className="bg-slate-50 p-3.5 sm:p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
                <span className="text-[10.5px] text-slate-500 font-mono">
                  QueueLess Gujarat DPI Verified • {activeCitizen.tokenNumber}
                </span>
                <button
                  onClick={() => {
                    setSelectedCitizenForDocs(null);
                    setDocModalOpen(false);
                  }}
                  className="bg-[#003366] hover:bg-[#002244] text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-xs"
                >
                  {isGu ? "નિરીક્ષણ પૂર્ણ (Close)" : isHi ? "निरीक्षण समाप्त (Close)" : "Close Review"}
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* 🔍 1.1 DOCUMENT ZOOM LIGHTBOX MODAL */}
      {previewDocLightbox && (() => {
        const { docName, fileUrl, ocrData, docRules, idx, activeCitizen } = previewDocLightbox;
        const isPhysicallyVerified = !!physicallyVerifiedDocs[`${activeCitizen.tokenNumber}_${idx}`];

        return (
          <div 
            onClick={() => setPreviewDocLightbox(null)}
            className="fixed inset-0 z-70 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto modal-backdrop animate-in fade-in"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-3xl w-full border border-slate-300 shadow-2xl overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95"
            >
              {/* Lightbox Header */}
              <div className="bg-[#003366] text-white p-4 flex items-center justify-between border-b border-blue-900 shrink-0">
                <div className="flex items-center gap-2.5">
                  <GovLogo className="w-7 h-7 drop-shadow-md" />
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white">{docName}</h4>
                    <p className="text-[10px] text-blue-200 font-mono">
                      {activeCitizen.tokenNumber} • {activeCitizen.citizenNameGu} • ઝૂમ લેવલ: {(lightboxZoom * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Zoom Controls */}
                  <div className="flex items-center bg-white/10 rounded-xl p-1 gap-1 border border-white/20">
                    <button
                      onClick={() => setLightboxZoom(prev => Math.max(0.75, prev - 0.25))}
                      className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center text-xs font-bold transition cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5 text-white" />
                    </button>
                    <button
                      onClick={() => setLightboxZoom(1)}
                      className="px-2 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center text-[10px] font-mono font-bold transition cursor-pointer"
                      title="Reset Zoom"
                    >
                      {(lightboxZoom * 100).toFixed(0)}%
                    </button>
                    <button
                      onClick={() => setLightboxZoom(prev => Math.min(2.5, prev + 0.25))}
                      className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center text-xs font-bold transition cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>

                  <button
                    onClick={() => setPreviewDocLightbox(null)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Lightbox Body */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-100/60">
                
                {/* Visual Image/Facsimile Container */}
                <div className="bg-white rounded-2xl border-2 border-slate-300 p-4 flex items-center justify-center overflow-hidden min-h-[220px]">
                  <div 
                    style={{ transform: `scale(${lightboxZoom})`, transformOrigin: 'center center', transition: 'transform 0.2s ease-out' }}
                    className="w-full max-w-md"
                  >
                    {fileUrl ? (
                      <img 
                        src={fileUrl} 
                        alt={docName} 
                        className="w-full max-h-[380px] object-contain rounded-xl border border-slate-200 shadow-md"
                      />
                    ) : (
                      /* Rich Facsimile in Lightbox */
                      <div className="p-4 rounded-xl border-2 border-slate-300 bg-white space-y-3 shadow-md text-xs">
                        <div className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center gap-2">
                            <GovLogo className="w-6 h-6" />
                            <span className="font-black text-[#003366] text-sm">ગુજરાત સરકાર • સત્તાવાર દસ્તાવેજ</span>
                          </div>
                          <span className="font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                            VERIFIED ARCHIVE
                          </span>
                        </div>
                        <div className="space-y-1 text-center py-2 bg-slate-50 rounded-lg">
                          <h5 className="font-black text-slate-900 text-sm">{docName}</h5>
                          <p className="font-mono text-[#003366] font-bold text-xs">{ocrData.idNumber}</p>
                          <p className="text-slate-600 font-bold">અરજદાર: {ocrData.holderName}</p>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-[11px] text-emerald-950 font-medium">
                          ✓ આ દસ્તાવેજ સરકારી ડિજિટલ ડેટાબેઝ (UIDAI / Revenue / Civil Registry) સાથે ૧૦૦% મેળ ખાય છે.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Statutory Rules Evaluator Checklist */}
                <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h5 className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>ગુજરાત સરકાર સત્તાવાર કાનૂની નિયમો (Statutory Regulations):</span>
                    </h5>
                    <span className="text-[10px] font-mono text-emerald-800 font-bold">
                      {docRules.length}/{docRules.length} પાસ
                    </span>
                  </div>

                  <div className="space-y-2">
                    {docRules.map((rule: any) => (
                      <div key={rule.id} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-black text-slate-900">{isGu ? rule.titleGu : rule.titleEn}</span>
                            <span className="text-[9.5px] font-mono text-blue-700 block font-bold">
                              સંદર્ભ: {rule.actReference}
                            </span>
                          </div>
                          <span className="bg-emerald-100 text-emerald-900 font-black text-[9.5px] px-2 py-0.5 rounded-full shrink-0">
                            ✓ પાસ
                          </span>
                        </div>
                        <p className="text-[11px] text-emerald-900 font-medium bg-emerald-50/70 p-1.5 rounded-lg border border-emerald-200/60">
                          {isGu ? rule.aiVerdictGu : rule.aiVerdictEn}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Lightbox Footer */}
              <div className="bg-slate-50 p-3.5 sm:p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
                <button
                  onClick={() => {
                    triggerHaptic('tap');
                    const key = `${activeCitizen.tokenNumber}_${idx}`;
                    setPhysicallyVerifiedDocs(prev => ({ ...prev, [key]: !prev[key] }));
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition cursor-pointer ${
                    isPhysicallyVerified 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'bg-white border border-slate-300 text-slate-700 hover:border-slate-400'
                  }`}
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>
                    {isPhysicallyVerified ? "✓ અસલ કાગળ સાથે પ્રમાણિત થઈ ગયું" : "અસલ કાગળ સાથે પ્રમાણિત કરો"}
                  </span>
                </button>

                <button
                  onClick={() => setPreviewDocLightbox(null)}
                  className="bg-[#003366] hover:bg-[#002244] text-white font-bold px-5 py-2 rounded-xl text-xs transition cursor-pointer"
                >
                  બંધ કરો (Close)
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

      {/* 📜 3. OFFICIAL GUJARAT GOVERNMENT SERVICE APPROVAL CERTIFICATE & ORDER MODAL */}
      {selectedCitizenForApprovalCert && (() => {
        const cert = selectedCitizenForApprovalCert;
        const citizenName = isGu ? cert.citizenNameGu : isHi ? (cert.citizenNameHi || cert.citizenNameGu) : (cert.citizenNameEn || cert.citizenNameGu);
        const schemeTitle = isGu ? cert.schemeTitleGu : isHi ? (cert.schemeTitleHi || cert.schemeTitleGu) : (cert.schemeTitleEn || cert.schemeTitleGu);

        return (
          <div 
            onClick={() => setSelectedCitizenForApprovalCert(null)}
            className="fixed inset-0 z-80 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto modal-backdrop animate-in fade-in duration-200"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border-2 border-emerald-600 overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95"
            >
              {/* MODAL HEADER */}
              <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-900 text-white p-4 flex items-center justify-between border-b-2 border-emerald-950 shrink-0">
                <div className="flex items-center gap-2.5">
                  <GovLogo className="w-9 h-9 drop-shadow-md" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9.5px] font-black uppercase tracking-wider bg-emerald-700/80 px-2 py-0.5 rounded text-emerald-100">
                        GUJARAT PUBLIC SERVICES GUARANTEE ACT
                      </span>
                      <span className="text-[9.5px] font-mono text-amber-300 font-bold">
                        {cert.certificateNumber}
                      </span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-black mt-0.5">
                      {isGu ? 'ગુજરાત સરકાર • સત્તાવાર સેવા મંજૂરી પ્રમાણપત્ર & આખરી હુકમ' : isHi ? 'गुजरात सरकार • आधिकारिक स्वीकृति प्रमाण पत्र' : 'Government of Gujarat • Official Approval Order'}
                    </h3>
                    <p className="text-[10px] text-emerald-200">
                      {cert.talukaOffice} • {isGu ? 'જન સેવા કેન્દ્ર' : 'Jan Seva Kendra'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCitizenForApprovalCert(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* PRINTABLE CERTIFICATE CONTENT */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-slate-900 bg-white" id="officer-approval-certificate">
                
                {/* HEADER EMBLEM */}
                <div className="border-b-2 border-slate-900 pb-3 text-center space-y-1">
                  <div className="flex justify-center mb-1">
                    <GovLogo className="w-14 h-14" />
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-slate-950 uppercase tracking-wide">
                    GUJARAT REVENUE & CITIZEN SERVICES
                  </h2>
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#003366]">
                    મહેસૂલ વિભાગ, ગુજરાત સરકાર • સત્તાવાર સેવા મંજૂરી પ્રમાણપત્ર & આખરી હુકમ
                  </h3>
                  <p className="text-[10.5px] text-slate-600 font-mono">
                    Order Ref: {cert.certificateNumber} • {new Date(cert.approvedAt).toLocaleDateString('gu-IN')} {new Date(cert.approvedAt).toLocaleTimeString('gu-IN')}
                  </p>

                  <div className="inline-flex items-center gap-1.5 bg-emerald-100 border border-emerald-400 text-emerald-950 px-3 py-1 rounded-full text-xs font-black mt-1 shadow-2xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>✓ કચેરી કાઉન્ટર દ્વારા સત્તાવાર મંજૂર (OFFICIALLY APPROVED)</span>
                  </div>
                </div>

                {/* DETAILS TABLE */}
                <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <tbody>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-600 w-1/3">નાગરિકનું પૂરું નામ (Applicant Name)</td>
                        <td className="p-2.5 font-black text-slate-950">{citizenName}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-2.5 font-bold text-slate-600">આધાર ઓળખ (Masked Aadhaar)</td>
                        <td className="p-2.5 font-mono font-bold text-slate-800">XXXX-XXXX-{cert.aadhaarLast4 || '8842'}</td>
                      </tr>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-600">યોજના / પ્રમાણપત્ર સેવા (Service Applied)</td>
                        <td className="p-2.5 font-black text-[#003366]">{schemeTitle}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-2.5 font-bold text-slate-600">કચેરી કેન્દ્ર (Service Jurisdiction)</td>
                        <td className="p-2.5 font-bold text-slate-800">{cert.talukaOffice} ({cert.districtName})</td>
                      </tr>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-600">ટોકન ક્રમાંક & ડેસ્ક સમય</td>
                        <td className="p-2.5 font-mono font-bold text-slate-800">
                          {cert.tokenNumber} • સેવા સમય: {cert.serviceHandlingTime}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-2.5 font-bold text-slate-600">મંજૂર કરનાર સક્ષમ અધિકારી</td>
                        <td className="p-2.5 font-black text-emerald-900">
                          {cert.officerNameGu} • કાઉન્ટર {cert.counterNumber}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-600">ચુકવણી ચલણ (Cyber Treasury Challan)</td>
                        <td className="p-2.5 font-mono text-[11px] font-bold text-emerald-800">
                          {cert.grasChallanNo} • ચુકવણી સ્થિતિ: PAID
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* STATUTORY VERIFICATION & DISPOSAL CLAUSE */}
                <div className="bg-emerald-50/70 border-2 border-emerald-300 rounded-xl p-3.5 space-y-2 text-xs leading-relaxed text-emerald-950">
                  <div className="flex items-center gap-1.5 font-black text-emerald-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>સત્તાવાર કચેરી પ્રમાણીકરણ & આખરી હુકમ (Statutory Certificate of Approval):</span>
                  </div>
                  <p className="text-[11.5px] font-medium">
                    આથી પ્રમાણિત કરવામાં આવે છે કે ઉપરોક્ત અરજદારશ્રી <strong>{citizenName}</strong> દ્વારા રજૂ કરાયેલ તમામ અસલ દસ્તાવેજો (ઓળખ પુરાવો, આવક પ્રમાણપત્ર, સોગંદનામું વગેરે) કચેરી કાઉન્ટર {cert.counterNumber} પર સક્ષમ અધિકારી દ્વારા રૂબરૂમાં સંતોષકારક રીતે ચકાસવામાં આવેલ છે. 
                  </p>
                  <p className="text-[11.5px] font-medium">
                    અરજી સંપૂર્ણપણે પરિપૂર્ણ હોવાથી ગુજરાત જાહેર સેવા હક અધિનિયમ અને રાજ્ય સરકારના મહેસૂલી નિયમો હેઠળ આ સેવા / પ્રમાણપત્ર તાત્કાલિક અસરથી <strong>સત્તાવાર રીતે મંજૂર (APPROVED & GRANTED)</strong> કરવામાં આવે છે. આ હુકમ તમામ સરકારી તથા કાનૂની હેતુઓ માટે માન્ય ગણાશે.
                  </p>
                </div>

                {/* DUAL DIGITAL HANDSHAKE & STAMPS */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t-2 border-dashed border-slate-300">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 border-2 border-dashed border-emerald-700 rounded-full flex flex-col items-center justify-center text-center p-1 bg-emerald-50 rotate-[-4deg] shadow-xs">
                      <span className="text-[8px] font-black text-emerald-900 leading-none">GOVT OF GUJARAT</span>
                      <ShieldCheck className="w-5 h-5 text-emerald-700 my-0.5" />
                      <span className="text-[7.5px] font-bold text-emerald-800 leading-none">JAN SEVA SEAL</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-800">Digital Seal & Cryptographic Checksum</p>
                      <p className="text-[9px] font-mono text-slate-600">{cert.digitalSignatureSha}</p>
                      <p className="text-[8.5px] text-emerald-700 font-bold mt-0.5">✓ Tamper-proof Digitally Signed Government Record</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[11px] font-black text-slate-900">{cert.officerNameGu}</p>
                    <p className="text-[10px] text-slate-600 font-bold">નાયબ મામલતદાર / સક્ષમ ઇન્ચાર્જ અધિકારી</p>
                    <p className="text-[9px] text-slate-500">{cert.talukaOffice}</p>
                  </div>
                </div>

              </div>

              {/* MODAL FOOTER BUTTONS */}
              <div className="bg-slate-50 p-3 sm:p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
                <button
                  onClick={() => setSelectedCitizenForApprovalCert(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                >
                  {isGu ? 'બંધ કરો' : 'Close'}
                </button>

                <button
                  onClick={() => {
                    triggerHaptic('success');
                    window.print();
                  }}
                  className="px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-2 shadow-md transition cursor-pointer active:scale-95"
                >
                  <Printer className="w-4 h-4 text-emerald-200" />
                  <span>{isGu ? '📄 સત્તાવાર મંજૂરી પ્રમાણપત્ર પ્રિન્ટ / PDF ડાઉનલોડ' : 'Print / Download Official Approval Order'}</span>
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
