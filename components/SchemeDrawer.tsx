'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, CheckSquare, Square, Share2, Camera, ShieldCheck, 
  Clock, IndianRupee, Volume2, VolumeX, ArrowRight, FileCheck2, Lock, 
  CheckCircle2, HelpCircle, ExternalLink, AlertCircle, Info, Building2,
  Upload, Loader2, AlertTriangle, RefreshCw, Sparkles, FileText
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { speakGuidance, stopVoice, toggleVoice, isVoiceSpeaking, subscribeSpeechState } from '@/lib/voice';
import { 
  SchemeItem, 
  getSchemeEligibility, 
  getSchemeOfficialSource, 
  getSchemeStructuredBenefit,
  getProcessingTimelineInfo
} from '@/lib/schemes-data';
import { 
  getLocalizedSchemeTitle,
  getLocalizedSchemeCategory,
  getLocalizedSchemeBenefit,
  getLocalizedSchemeDepartment,
  getLocalizedSchemeEligibility,
  getLocalizedDocName
} from '@/lib/scheme-translations';
import { GovLogo } from '@/components/GovLogo';
import { Language } from '@/lib/translations';
import { inspectUploadedFileStrict } from '@/lib/ocr-validator';

export interface DocVerificationState {
  status: 'idle' | 'scanning' | 'passed' | 'failed';
  extractedDetails?: string;
  reasonEn?: string;
  reasonGu?: string;
  fileName?: string;
}

interface SchemeDrawerProps {
  scheme: SchemeItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenScanner: () => void;
  isLoggedIn?: boolean;
  onCollectToken?: (scheme: SchemeItem) => void;
  lang?: Language;
}

export const SchemeDrawer: React.FC<SchemeDrawerProps> = ({
  scheme,
  isOpen,
  onClose,
  onOpenScanner,
  isLoggedIn = false,
  onCollectToken,
  lang = 'gu'
}) => {
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
  const [docVerifications, setDocVerifications] = useState<Record<string, DocVerificationState>>({});
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [showValidationNotice, setShowValidationNotice] = useState(false);

  // Subscribe to speech synthesis state
  useEffect(() => {
    return subscribeSpeechState(setIsPlayingVoice);
  }, []);

  // Body scroll lock and voice stop on drawer open/close
  useEffect(() => {
    if (isOpen && scheme) {
      setShowValidationNotice(false);
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
        stopVoice();
      };
    }
  }, [isOpen, scheme]);

  if (!isOpen || !scheme) return null;

  const isEn = lang === 'en';
  const isHi = lang === 'hi';
  const isMr = lang === 'mr';
  const isGu = lang === 'gu';

  // Calculate Mandatory vs Optional documents
  const mandatoryDocs = scheme.requiredDocs.filter(d => d.required !== false);
  const effectiveMandatoryDocs = mandatoryDocs.length > 0 ? mandatoryDocs : scheme.requiredDocs;
  const totalMandatory = effectiveMandatoryDocs.length;
  
  const verifiedMandatoryDocs = effectiveMandatoryDocs.filter(
    d => docVerifications[d.nameGu]?.status === 'passed'
  );
  const isAllMandatoryVerified = totalMandatory > 0 && verifiedMandatoryDocs.length === totalMandatory;
  const missingMandatoryDocs = effectiveMandatoryDocs.filter(
    d => docVerifications[d.nameGu]?.status !== 'passed'
  );

  const totalDocs = scheme.requiredDocs.length;
  const verifiedCount = Object.values(docVerifications).filter(v => v.status === 'passed').length;
  const progressPercent = Math.round((verifiedMandatoryDocs.length / totalMandatory) * 100);
  const sourceInfo = getSchemeOfficialSource(scheme);
  const benefit = getSchemeStructuredBenefit(scheme);
  const timelineInfo = getProcessingTimelineInfo(scheme);

  const toggleDoc = (docKey: string) => {
    triggerHaptic('tap');
    setCheckedDocs(prev => ({ ...prev, [docKey]: !prev[docKey] }));
  };

  const handleCollectTokenClick = () => {
    if (!isAllMandatoryVerified) {
      triggerHaptic('warning');
      setShowValidationNotice(true);

      const missingNames = missingMandatoryDocs.map((d, i) => `${i + 1}. ${getLocalizedDocName(d, lang)}`).join('\n');
      
      const alertMsg = isEn
        ? `⚠️ Mandatory Documents AI-Verification Required!\n\nTo generate an official government token pass, all mandatory documents must be uploaded and verified by Gemini AI first:\n\nPending Documents (${missingMandatoryDocs.length}):\n${missingNames}\n\nPlease click 'Upload Original Document' above to upload a clear photo or PDF.`
        : isHi
        ? `⚠️ अनिवार्य दस्तावेज़ AI सत्यापन आवश्यक है!\n\nसरकारी टोकन प्राप्त करने के लिए कृपया पहले सभी अनिवार्य दस्तावेज़ अपलोड और AI द्वारा सत्यापित करें:\n\nलंबित दस्तावेज़ (${missingMandatoryDocs.length}):\n${missingNames}\n\nकृपया ऊपर दिए गए 'मूल दस्तावेज़ अपलोड करें' बटन से फोटो या PDF अपलोड करें।`
        : isMr
        ? `⚠️ आवश्यक कागदपत्रे AI पडताळणी आवश्यक आहे!\n\nशासकीय टोकन मिळवण्यासाठी कृपया आधी सर्व आवश्यक कागदपत्रे अपलोड आणि प्रमाणित करा:\n\nलंबित कागदपत्रे (${missingMandatoryDocs.length}):\n${missingNames}\n\nकृपया 'मूळ कागदपत्र अपलोड करा' वरून फोटो किंवा PDF अपलोड करा.`
        : `⚠️ ફરજિયાત દસ્તાવેજ અપલોડ અને AI વેરિફિકેશન અનિવાર્ય છે!\n\nકચેરી ટોકન જનરેટ કરવા માટે તમામ ફરજિયાત દસ્તાવેજો અપલોડ કરી Gemini AI દ્વારા વેરિફાઈ કરવા અનિવાર્ય છે!\n\nબાકી રહેલ ફરજિયાત દસ્તાવેજો (${missingMandatoryDocs.length}):\n${missingNames}\n\nકૃપા કરીને પહેલાં ઉપર આપેલા 'અસલ દસ્તાવેજ અપલોડ કરો' બટન પરથી અસલ ફોટો કે PDF અપલોડ કરો.`;

      speakGuidance(
        isEn 
          ? "Please upload and verify all mandatory documents before collecting your token." 
          : isHi 
          ? "टोकन प्राप्त करने के लिए कृपया पहले सभी अनिवार्य दस्तावेज़ अपलोड और सत्यापित करें।" 
          : "ટોકન મેળવવા માટે પહેલાં તમામ ફરજિયાત દસ્તાવેજો અપલોડ અને AI વેરિફાઈ કરો.",
        lang
      );

      alert(alertMsg);
      return;
    }

    // When all mandatory docs are AI verified, proceed to token collection!
    triggerHaptic('success');
    if (onCollectToken) {
      onCollectToken(scheme);
    }
  };

  const handleRealFileUpload = async (docKey: string, file: File, docNameEn?: string) => {
    triggerHaptic('tap');
    setDocVerifications(prev => ({
      ...prev,
      [docKey]: { status: 'scanning', fileName: file.name }
    }));

    try {
      const res = await inspectUploadedFileStrict(file, docKey, docNameEn);
      if (res.isValid) {
        setDocVerifications(prev => ({
          ...prev,
          [docKey]: {
            status: 'passed',
            fileName: file.name,
            extractedDetails: isEn ? res.extractedDetailsEn : res.extractedDetailsGu
          }
        }));
        setCheckedDocs(prev => ({ ...prev, [docKey]: true }));
        triggerHaptic('success');
        speakGuidance(
          isEn ? 'Document verified successfully.' : isHi ? 'दस्तावेज़ सफलतापूर्वक सत्यापित हो गया है।' : 'દસ્તાવેજ સફળતાપૂર્વક પ્રમાણિત થયો છે.',
          lang
        );
      } else {
        setDocVerifications(prev => ({
          ...prev,
          [docKey]: {
            status: 'failed',
            fileName: file.name,
            reasonEn: res.reasonEn,
            reasonGu: res.reasonGu
          }
        }));
        setCheckedDocs(prev => ({ ...prev, [docKey]: false }));
        triggerHaptic('warning');
        speakGuidance(
          isEn ? 'Document rejected. Please check requirements.' : isHi ? (res.reasonGu ? 'दस्तावेज़ अस्वीकृत हुआ। कृपया नियम जांचें।' : 'दस्तावेज़ अमान्य है।') : (res.reasonGu || 'દસ્તાવેજ અમાન્ય છે.'),
          lang
        );
      }
    } catch (err) {
      console.error('File inspection error:', err);
      setDocVerifications(prev => ({
        ...prev,
        [docKey]: {
          status: 'failed',
          fileName: file.name,
          reasonEn: 'Unable to analyze image. Please upload a clear photo.',
          reasonGu: 'ફોટો વિશ્લેષણ થઈ શક્યું નથી. કૃપા કરીને સ્પષ્ટ ફોટો ફરીથી પાડો.'
        }
      }));
      setCheckedDocs(prev => ({ ...prev, [docKey]: false }));
      triggerHaptic('warning');
    }
  };

  const handleVerifyDoc = (
    docKey: string,
    scenario: 'valid' | 'expired' | 'mismatch' | 'wrong_doc',
    fileNameCustom?: string
  ) => {
    triggerHaptic('tap');
    setDocVerifications(prev => ({
      ...prev,
      [docKey]: { status: 'scanning', fileName: fileNameCustom || 'document_scan.jpg' }
    }));

    setTimeout(() => {
      if (scenario === 'valid') {
        let extracted = '';
        if (docKey.includes('આવક') || docKey.includes('Income')) {
          extracted = isEn 
            ? 'Cert No: INC/GND/2025/11904 • Applicant: Hari Patel • Issue: 22/04/2025 • Valid under 3-Yr Rule' 
            : 'પ્રમાણપત્ર નં: INC/GND/2025/11904 • અરજદાર: હરિ પટેલ • ઇસ્યુ: 22/04/2025 • ૩ વર્ષની સરકારી મુદતમાં માન્ય';
        } else if (docKey.includes('આધાર') || docKey.includes('Aadhaar')) {
          extracted = isEn 
            ? 'Name: Hari Patel • Aadhaar: XXXX-XXXX-8842 • UIDAI Signed QR Verified' 
            : 'અરજદાર: હરિ પટેલ • આધાર: XXXX-XXXX-8842 • UIDAI અધિકૃત QR કોડ પ્રમાણિત';
        } else if (docKey.includes('રેશન') || docKey.includes('Ration')) {
          extracted = isEn 
            ? 'Ration Card: 042100889231 • NFSA Category • Head: Mohanbhai Patel • Verified' 
            : 'રેશન કાર્ડ નં: 042100889231 • NFSA કેટેગરી • મોહનભાઈ પટેલ • પ્રમાણિત';
        } else {
          extracted = isEn 
            ? 'Official Seal Verified • Matching Citizen Identity: Hari Patel' 
            : 'સત્તાવાર મોહર પ્રમાણિત • નાગરિક ઓળખ મેચ: હરિ પટેલ';
        }

        setDocVerifications(prev => ({
          ...prev,
          [docKey]: {
            status: 'passed',
            fileName: fileNameCustom || `${docKey.replace(/[^a-zA-Z0-9]/g, '_')}_Verified.pdf`,
            extractedDetails: extracted
          }
        }));
        setCheckedDocs(prev => ({ ...prev, [docKey]: true }));
        triggerHaptic('success');
        speakGuidance(
          isEn ? 'Document verified successfully.' : isHi ? 'दस्तावेज़ सफलतापूर्वक सत्यापित हुआ।' : 'દસ્તાવેજ સફળતાપૂર્વક પ્રમાણિત થયો છે.',
          lang
        );
      } else if (scenario === 'expired') {
        setDocVerifications(prev => ({
          ...prev,
          [docKey]: {
            status: 'failed',
            fileName: 'Income_Certificate_2021_Expired.pdf',
            reasonEn: 'Expired: Certificate was issued in 2021. Under Gujarat Revenue rules, income certificates are valid for 3 Financial Years. Please obtain a fresh certificate before office visit.',
            reasonGu: 'મુદત પૂર્ણ (Expired): આ આવકનો દાખલો વર્ષ ૨૦૨૧ નો છે. મહેસૂલ વિભાગના નિયમ મુજબ દાખલાની માન્યતા ૩ નાણાકીય વર્ષની હોય છે. કચેરીએ જતાં પહેલાં નવો દાખલો કઢાવવો ફરજિયાત છે.'
          }
        }));
        setCheckedDocs(prev => ({ ...prev, [docKey]: false }));
        triggerHaptic('warning');
        speakGuidance(
          isEn ? 'Document expired. Please update.' : isHi ? 'दस्तावेज़ की अवधि समाप्त हो चुकी है।' : 'દાખલાની મુદત પૂર્ણ થયેલ છે. નવો દાખલો કઢાવવો જરૂરી છે.',
          lang
        );
      } else if (scenario === 'mismatch') {
        setDocVerifications(prev => ({
          ...prev,
          [docKey]: {
            status: 'failed',
            fileName: 'Certificate_Wrong_Name.pdf',
            reasonEn: 'Name Mismatch: The name on this document (Suresh K. Shah) does not match the applicant identity (Hari Patel).',
            reasonGu: 'નામમાં વિસંગતતા (Name Mismatch): દસ્તાવેજમાં નામ (સુરેશ કે. શાહ) છે, જે અરજદારની ઓળખ (હરિ પટેલ) સાથે મેળ ખાતું નથી.'
          }
        }));
        setCheckedDocs(prev => ({ ...prev, [docKey]: false }));
        triggerHaptic('warning');
        speakGuidance(
          isEn ? 'Applicant name mismatch detected.' : isHi ? 'आवेदक का नाम मेल नहीं खाता।' : 'અરજદારનું નામ મેળ ખાતું નથી.',
          lang
        );
      } else if (scenario === 'wrong_doc') {
        const isAadhaarSlot = docKey.includes('આધાર') || docKey.includes('Aadhaar');
        setDocVerifications(prev => ({
          ...prev,
          [docKey]: {
            status: 'failed',
            fileName: isAadhaarSlot ? 'Atmiya_University_Fee_Receipt.jpeg' : 'Electricity_Bill.jpg',
            reasonEn: isAadhaarSlot 
              ? 'Invalid Document: The uploaded file is an Atmiya University Fee Receipt, which is not a government-issued Aadhaar Card. Please upload an authentic Aadhaar Card.'
              : 'Incorrect Document Type: Uploaded file is a utility bill or private receipt, not the required government certificate.',
            reasonGu: isAadhaarSlot
              ? '❌ અમાન્ય દસ્તાવેજ: અપલોડ કરેલ કાગળ આત્મીય યુનિવર્સિટીની ફી રસીદ (College Fee Receipt) છે, જે સત્તાવાર સરકારી આધાર કાર્ડ નથી! કૃપા કરીને અસલ આધાર કાર્ડનો ફોટો અપલોડ કરો.'
              : '❌ ખોટો દસ્તાવેજ: અપલોડ કરેલ કાગળ લાઈટબિલ અથવા ખાનગી રસીદ છે, જે માંગેલ સત્તાવાર સરકારી પ્રમાણપત્ર નથી.'
          }
        }));
        setCheckedDocs(prev => ({ ...prev, [docKey]: false }));
        triggerHaptic('warning');
        speakGuidance(
          isEn ? 'Invalid document type uploaded.' : isHi ? 'अमान्य दस्तावेज़: कृपया सही सरकारी दस्तावेज़ अपलोड करें।' : 'અમાન્ય દસ્તાવેજ: સાચો સરકારી દસ્તાવેજ અપલોડ કરો.',
          lang
        );
      }
    }, 850);
  };

  const displayTitle = getLocalizedSchemeTitle(scheme, lang);
  const displaySecondaryTitle = isEn ? scheme.titleGu : scheme.titleEn;
  const displayCategory = getLocalizedSchemeCategory(scheme, lang);
  const displayBenefit = getLocalizedSchemeBenefit(scheme, lang);
  const displayEligibility = getLocalizedSchemeEligibility(scheme, lang);
  const displayDepartment = getLocalizedSchemeDepartment(scheme, lang);
  const displayTimeline = isEn ? timelineInfo.formattedTimeEn : isMr ? timelineInfo.formattedTimeGu.replace('દિવસ', 'दिवस').replace('તે જ દિવસે', 'त्याच दिवशी') : timelineInfo.formattedTimeGu;

  const handleShareWhatsApp = () => {
    triggerHaptic('success');
    const docList = scheme.requiredDocs.map((d, i) => `${i + 1}. ${getLocalizedDocName(d, lang)}`).join('\n');
    const deliveryText = timelineInfo.isVaries 
      ? (isEn ? 'Varies across offices (Confirm at center)' : isHi ? 'कार्यालय अनुसार अलग (जांचें)' : isMr ? 'कार्यालयनिहाय वेगळे (तपासा)' : 'પ્રક્રિયા સમય અલગ હોઈ શકે છે (કચેરી ખાતે ચકાસો)')
      : displayTimeline;

    const message = isEn
      ? `🏛️ *${scheme.titleEn}*\nBefore You Visit Guidance:\n\n📄 Required Documents:\n${docList}\n\n⏱️ Expected Delivery Time: ${deliveryText}\n🏢 Office Counter Waiting Time: ~15-20 min\n💰 Govt Fee: ${scheme.fee === 0 ? '₹0 (Free)' : `₹${scheme.fee}`}\n🏛️ Dept: ${displayDepartment}\n🔗 Source: ${scheme.officialSource}\n\nℹ️ Automated pre-check guidance. Final verification by authorized government officer.`
      : isMr
      ? `🏛️ *${displayTitle}*\nकार्यालयात जाण्यापूर्वी मार्गदर्शक माहिती:\n\n📄 आवश्यक कागदपत्रे:\n${docList}\n\n⏱️ अपेक्षित वितरण वेळ: ${deliveryText}\n🏢 कार्यालय काउंटर प्रतीक्षा: ~१५-२० मिनिटे\n💰 शासकीय शुल्क: ${scheme.fee === 0 ? '₹० (मोफत)' : `₹${scheme.fee}`}\n🏛️ विभाग: ${displayDepartment}\n🔗 स्रोत: ${scheme.officialSource}\n\nℹ️ स्वयंचलित पूर्व-मार्गदर्शन. अंतिम तपासणी अधिकृत शासकीय अधिकाऱ्याकडून केली जाईल.`
      : isHi
      ? `🏛️ *${displayTitle}*\nकार्यालय जाने से पहले मार्गदर्शन:\n\n📄 आवश्यक दस्तावेज:\n${docList}\n\n⏱️ अपेक्षित समय: ${deliveryText}\n🏢 कार्यालय काउंटर प्रतीक्षा: ~१५-२० मिनट\n💰 सरकारी शुल्क: ${scheme.fee === 0 ? '₹० (मुफ्त)' : `₹${scheme.fee}`}\n🏛️ विभाग: ${displayDepartment}\n🔗 स्रोत: ${scheme.officialSource}\n\nℹ️ स्वचालित पूर्व-मार्गदर्शन। अंतिम सत्यापन अधिकृत सरकारी अधिकारी द्वारा किया जाएगा।`
      : `🏛️ *${scheme.titleGu}*\nકચેરીએ જતાં પહેલાં માર્ગદર્શિકા (Before You Visit):\n\n📄 જરૂરી કાગળો:\n${docList}\n\n⏱️ અપેક્ષિત ડિલિવરી સમય: ${deliveryText}\n🏢 કાઉન્ટર મુલાકાત પ્રતીક્ષા: ~૧૫-૨૦ મિનિટ\n💰 સરકારી ફી: ${scheme.fee === 0 ? '₹૦ (મફત)' : `₹${scheme.fee}`}\n🏛️ વિભાગ: ${scheme.department}\n🔗 સત્તાવાર સ્ત્રોત: ${scheme.officialSource}\n\nℹ️ આ ઓટોમેટેડ પૂર્વ-માર્ગદર્શન છે. આખરી ચકાસણી અધિકૃત સરકારી અધિકારી દ્વારા કરવામાં આવે છે.`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 bg-[#003366]/70 backdrop-blur-xs z-50 flex justify-end modal-backdrop animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-lg h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-in slide-in-from-right duration-250 overscroll-contain overflow-hidden"
      >
        {/* Drawer Header (Fixed) */}
        <div className="bg-[#003366] text-white p-4 sm:p-5 shrink-0 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <GovLogo className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 drop-shadow-md mt-0.5" />
            <div className="space-y-1 min-w-0">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FF9933] bg-[#002244] px-2.5 py-0.5 rounded-full border border-blue-800 inline-block truncate max-w-full">
                {displayCategory} • {displayDepartment}
              </span>
              <h2 className="text-xl font-black text-white mt-1 leading-tight">
                {displayTitle}
              </h2>
              <p className="text-xs text-blue-200">{displaySecondaryTitle}</p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('tap');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Center Body with Touch Action Pan-Y */}
        <div className="flex-1 overflow-y-auto modal-scroll-area p-4 sm:p-5 space-y-4 sm:space-y-5">
            
          {/* 📋 WHAT YOU NEED BEFORE VISITING */}
          <div className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">📌</span>
                <h3 className="text-xs font-black text-amber-950 uppercase tracking-wide">
                  {isEn 
                    ? 'Before You Visit Guidance (Official Info)' 
                    : isHi 
                    ? 'कार्यालय जाने से पहले मार्गदर्शन' 
                    : isMr
                    ? 'कार्यालयात जाण्यापूर्वी मार्गदर्शक माहिती'
                    : 'કચેરીએ જતાં પહેલાં માર્ગદર્શિકા (Before You Visit Guidance)'}
                </h3>
              </div>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                {isEn ? 'Official Info' : isHi ? 'आधिकारिक विवरण' : isMr ? 'अधिकृत माहिती' : 'સત્તાવાર વિગતો'}
              </span>
            </div>

            {/* 4 Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {/* 1. Expected Processing / Delivery Time */}
              <div className="bg-white p-3 rounded-xl border border-amber-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#FF9933]" />
                      <span>
                        {isEn ? 'Expected Processing Time' : isHi ? 'अपेक्षित प्रक्रिया समय' : isMr ? 'अपेक्षित प्रक्रिया वेळ' : 'અપેક્ષિત પ્રક્રિયા / ડિલિવરી સમય'}
                      </span>
                    </p>
                  </div>
                  <p className="font-extrabold text-[#003366] text-sm mt-1 leading-snug">
                    {timelineInfo.isVaries ? (
                      <span className="text-amber-800 text-xs font-bold leading-tight block">
                        {isEn 
                          ? 'Processing time varies — confirm with the concerned office' 
                          : isHi 
                          ? 'प्रक्रिया समय अलग हो सकता है — कार्यालय में जांचें' 
                          : isMr
                          ? 'प्रक्रिया वेळ वेगळी असू शकते — कार्यालयात तपासा'
                          : 'પ્રક્રિયા સમય અલગ હોઈ શકે છે — સંબંધિત કચેરી ખાતે ચકાસો'}
                      </span>
                    ) : (
                      displayTimeline
                    )}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    {timelineInfo.isVaries ? '(Varies across offices)' : `(${displayTimeline})`}
                  </p>
                </div>

                {/* Statutory vs Norm vs Batch Cycle Note */}
                <div className="mt-2 pt-1.5 border-t border-slate-100">
                  {scheme.slaType === 'statutory_grtsa' ? (
                    <div className="bg-blue-50 border border-blue-200 rounded p-1.5 text-[9px] text-blue-900 font-medium">
                      <span className="font-extrabold text-[#005A9C] block">
                        {isEn ? '⚖️ GRTSA 2013 Statutory Service' : isHi ? '⚖️ GRTSA २०१३ अधिसूचित समय-सीमा' : isMr ? '⚖️ GRTSA २०१३ अधिसूचित मुदत' : '⚖️ GRTSA ૨૦૧૩ અધિસૂચિત કાનૂની સમયમર્યાદા'}
                      </span>
                      <p className="text-[8.5px] text-blue-800 mt-0.5">
                        {isEn 
                          ? 'Legally notified public service standard under Gujarat Public Services Act.' 
                          : isMr
                          ? 'गुजरात लोकसेवा हक्क कायदा २०१३ अंतर्गत कायदेशीर मुदत.'
                          : isHi
                          ? 'गुजरात लोक सेवा अधिकार अधिनियम २०१३ के अंतर्गत वैधानिक समय-सीमा।'
                          : scheme.statutorySlaNoteGu || 'ગુજરાત જાહેર સેવા હક્ક અધિનિયમ ૨૦૧૩ હેઠળ કાયદેસર સમયમર્યાદા.'}
                      </p>
                    </div>
                  ) : scheme.slaType === 'departmental_norm' ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded p-1 text-[9px] text-emerald-800 font-medium">
                      {isEn ? '🏛️ Departmental Citizen Charter Standard' : isHi ? '🏛️ सिटीजन चार्टर मानक' : isMr ? '🏛️ सिटिझन चार्टर मानक' : '🏛️ સિટીઝન ચાર્ટર ધોરણ (વિભાગીય સમયગાળો)'}
                    </div>
                  ) : (
                    <div className="bg-slate-100 rounded p-1 text-[9px] text-slate-600">
                      {isEn ? '📋 Batch Scheme / Quota Cycle' : isHi ? '📋 योजना चक्र / कोटा' : isMr ? '📋 योजना चक्र / कोटा' : '📋 યોજના આધારિત ચક્ર / ક્વોટા મંજૂરી (GRTSA લાગુ નથી)'}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Office Appointment / Queue Waiting Time */}
              <div className="bg-white p-3 rounded-xl border border-amber-200 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-[#005A9C]" />
                    <span>
                      {isEn ? 'Office Counter Wait' : isHi ? 'कार्यालय काउंटर प्रतीक्षा' : isMr ? 'कार्यालय काउंटर प्रतीक्षा' : 'કચેરી મુલાકાત પ્રતીક્ષા સમય'}
                    </span>
                  </p>
                  <p className="font-extrabold text-slate-800 text-sm mt-1">
                    {isEn ? '~15-20 min (Counter Duration)' : isHi ? '~१५-२० मिनट (काउंटर समय)' : isMr ? '~१५-२० मिनिटे (काउंटर वेळ)' : '~૧૫-૨૦ મિનિટ (કાઉન્ટર સમય)'}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    {isEn ? 'Office Queue / Counter Waiting Time' : isMr ? 'काउंटरवर सरासरी प्रतीक्षा वेळ' : 'કાઉન્ટર પર સરેરાશ પ્રતીક્ષા સમય'}
                  </p>
                </div>
                <div className="mt-2 pt-1.5 border-t border-slate-100 text-[9px] text-slate-500">
                  {isEn 
                    ? 'ℹ️ Arriving at your token slot guarantees line-free verification.' 
                    : isHi 
                    ? 'ℹ️ स्लॉट समय पर उपस्थित होने से बिना कतार सत्यापन संभव है।' 
                    : isMr
                    ? 'ℹ️ ठरलेल्या वेळेवर पोहोचल्यास रांगेविना त्वरित पडताळणी पूर्ण होते.'
                    : 'ℹ️ ટોકન સ્લોટ પર પહોંચવાથી લાઈન વગર નિર્ધારિત સમયમાં વેરિફિકેશન પૂર્ણ થાય છે.'}
                </div>
              </div>

              {/* 3. Government Fee */}
              <div className="bg-white p-3 rounded-xl border border-amber-200">
                <p className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                  <IndianRupee className="w-3 h-3 text-[#138808]" />
                  <span>
                    {isEn ? 'Government Fee' : isHi ? 'सरकारी शुल्क' : isMr ? 'शासकीय शुल्क' : 'સરકારી નિયત ફી'}
                  </span>
                </p>
                <p className="font-extrabold text-[#138808] text-base mt-1">
                  {scheme.fee === 0 
                    ? (isEn ? '₹0 (Completely Free)' : isHi ? '₹० (पूर्णतः मुफ्त)' : isMr ? '₹० (संपूर्ण मोफत)' : '₹૦ (સંપૂર્ણ મફત)') 
                    : `₹${scheme.fee}`}
                </p>
                <p className="text-[9px] text-slate-400">
                  {scheme.fee === 0 
                    ? (isEn ? 'No government charge' : isMr ? 'कोणतेही शासकीय शुल्क नाही' : isHi ? 'कोई सरकारी शुल्क नहीं' : 'કોઈ સરકારી ચાર્જ નથી') 
                    : (isEn ? 'Official government charge' : isMr ? 'अधिकृत शासकीय सेवा शुल्क' : 'અધિકૃત સરકારી સેવા ફી')}
                </p>
              </div>

              {/* 4. Issuing Department & Official Source */}
              <div className="bg-white p-3 rounded-xl border border-amber-200 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">
                    {isEn ? 'Dept & Official Source' : isHi ? 'विभाग एवं आधिकारिक स्रोत' : isMr ? 'विभाग आणि अधिकृत स्रोत' : 'વિભાગ અને સત્તાવાર સ્ત્રોત'}
                  </p>
                  <p className="font-bold text-[#003366] text-xs mt-1 leading-snug">
                    {displayDepartment}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-1 truncate" title={scheme.officialSource}>
                    🔗 {scheme.officialSource}
                  </p>
                </div>
                <p className="text-[9px] text-slate-400 mt-1">
                  {isEn ? 'Last verified: ' : isHi ? 'अद्यतन: ' : isMr ? 'अद्यतन: ' : 'છેલ્લે અપડેટ: '}{scheme.lastUpdated}
                </p>
              </div>
            </div>

            <div className="text-[11px] text-amber-900 bg-amber-100/60 p-2.5 rounded-xl flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                {isEn ? (
                  <><strong>Please Note:</strong> The <em>Expected Processing Time</em> is the duration required from application submission until certificate/benefit issuance. The <em>Office Counter Time (~15-20 min)</em> is only for on-spot document verification.</>
                ) : isMr ? (
                  <><strong>कृपया लक्षात घ्या:</strong> वर दिलेली <em>अपेक्षित प्रक्रिया वेळ</em> अर्ज सादर केल्यापासून प्रमाणपत्र/लाभ मिळेपर्यंतचा कालावधी आहे. <em>कार्यालयीन वेळ (~१५-२० मिनिटे)</em> ही फक्त काउंटरवर कागदपत्र पडताळणीसाठी आहे.</>
                ) : isHi ? (
                  <><strong>कृपया ध्यान दें:</strong> ऊपर उल्लिखित <em>अपेक्षित प्रक्रिया समय</em> आवेदन जमा करने से प्रमाण पत्र/लाभ जारी होने तक की अवधि है। <em>कार्यालय काउंटर समय (~१५-२० मिनट)</em> केवल सत्यापन के लिए है।</>
                ) : (
                  <><strong>ધ્યાન રાખો:</strong> ઉપર દર્શાવેલ <em>અપેક્ષિત પ્રક્રિયા સમય</em> અરજી જમા થયા પછી પ્રમાણપત્ર/લાભ જારી થવાનો અપેક્ષિત સમય છે, જ્યારે <em>કચેરી મુલાકાત સમય (~૧૫-૨૦ મિ.)</em> ફક્ત કાઉન્ટર પર દસ્તાવેજ જમા/ચકાસણીનો સમય છે.</>
                )}
              </p>
            </div>
          </div>

          {/* 👤 ELIGIBILITY: CAN I APPLY? */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#003366] flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#005A9C]" />
                <span>
                  {isEn ? 'Who Can Apply? (Eligibility Criteria)' : isHi ? 'कौन आवेदन कर सकता है? (पात्रता)' : isMr ? 'कोण अर्ज करू शकते? (पात्रता निकष)' : 'કોણ અરજી કરી શકે? (Eligibility Criteria)'}
                </span>
              </span>
            </div>
            <p className="text-xs font-bold text-slate-800 leading-relaxed">{displayEligibility}</p>
          </div>

          {/* 🌟 STRUCTURED BENEFIT */}
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                <span>
                  {isEn ? '✨ Scheme Benefits' : isHi ? '✨ योजना लाभ' : isMr ? '✨ योजनेचे लाभ' : '✨ યોજના લાભ (Benefits)'}
                </span>
              </span>
              <button
                onClick={() => {
                  triggerHaptic('tap');
                  if (isPlayingVoice || isVoiceSpeaking()) {
                    stopVoice();
                    setIsPlayingVoice(false);
                  } else {
                    setIsPlayingVoice(true);
                    toggleVoice(displayBenefit, lang);
                  }
                }}
                className={`text-xs font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition active:scale-95 cursor-pointer ${
                  isPlayingVoice 
                    ? 'bg-red-100 text-red-700 border border-red-300' 
                    : 'bg-emerald-100/80 text-[#003366] hover:bg-emerald-200/80'
                }`}
              >
                {isPlayingVoice ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                    <span>{isEn ? 'Stop' : isHi ? 'रोकें' : isMr ? 'थांबवा' : 'બંધ કરો'}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-[#005A9C]" />
                    <span>{isEn ? 'Listen' : isHi ? 'सुनें' : isMr ? 'ऐका' : 'સાંભળો'}</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs font-bold text-slate-800 leading-relaxed">{displayBenefit}</p>
            <p className="text-[10px] text-slate-400 italic pt-1">
              {isEn 
                ? '*Actual subsidy amount and approval depends on applicable category norms.' 
                : isMr
                ? '*लाभाची रक्कम व मंजुरी संबंधित विभागाच्या नियमांनुसार राहील.'
                : isHi
                ? '*वास्तविक लाभ राशि संबंधित विभाग के नियमानुसार निर्धारित होगी।'
                : '*વાસ્તવિક લાભની રકમ/મંજૂરી સંબંધિત વિભાગના વર્તમાન નિયમો અને પાત્રતા પર આધારિત છે.'}
            </p>
          </div>

          {/* Document Readiness Progress Gauge */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#003366] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#FF9933]" />
                <span>{isEn ? 'Mandatory Documents AI-Verification' : isHi ? 'अनिवार्य दस्तावेज़ AI सत्यापन' : isMr ? 'आवश्यक कागदपत्रे AI पडताळणी' : 'ફરજિયાત દસ્તાવેજ AI વેરિફિકેશન'}</span>
              </span>
              <span className={`font-black ${isAllMandatoryVerified ? 'text-[#138808]' : 'text-[#FF9933]'}`}>
                {verifiedMandatoryDocs.length}/{totalMandatory} {isEn ? 'verified' : isHi ? 'सत्यापित' : isMr ? 'प्रमाणित' : 'પ્રમાણિત'} ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  isAllMandatoryVerified 
                    ? 'bg-emerald-600' 
                    : 'bg-gradient-to-r from-amber-500 to-[#FF9933]'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500">
              {isEn 
                ? 'Upload original photos or PDFs below. Gemini AI automatically validates seals, QR codes, and authenticity.' 
                : isMr
                ? 'खाली दिलेली मूळ कागदपत्रे किंवा PDF अपलोड करा. जेमिनी AI द्वारे शिक्के व QR कोडची स्वयंचलित पडताळणी केली जाईल.'
                : isHi
                ? 'नीचे मूल दस्तावेज़ फोटो या PDF अपलोड करें। जेमिनी AI द्वारा मुहर और QR कोड का स्वचालित सत्यापन होगा।'
                : 'નીચે અસલ દસ્તાવેજનો ફોટો કે PDF અપલોડ કરો. Gemini AI દ્વારા સત્તાવાર મોહર અને QR કોડનું ઓટોમેટેડ પ્રી-વેરિફિકેશન થશે.'}
            </p>
          </div>

          {/* Required Documents Interactive Checklist */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-[#003366] uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-[#005A9C]" />
              <span>
                {isEn 
                  ? `Required Documents Checklist (${totalDocs} Documents)` 
                  : isHi 
                  ? `आवश्यक दस्तावेज़ चेकलिस्ट (${totalDocs} दस्तावेज़)` 
                  : isMr
                  ? `आवश्यक कागदपत्रांची यादी (${totalDocs} कागदपत्रे)`
                  : `જરૂરી દસ્તાવેજોનું ચેકલિસ્ટ (${totalDocs} Documents)`}
              </span>
            </h4>

            <div className="space-y-3">
              {scheme.requiredDocs.map((doc, idx) => {
                const isChecked = !!checkedDocs[doc.nameGu];
                const docLocalized = getLocalizedDocName(doc, lang);
                const docSecondary = isEn ? doc.nameGu : doc.nameEn;
                const vState = docVerifications[doc.nameGu] || { status: 'idle' };

                return (
                  <div
                    key={idx}
                    className={`p-3 sm:p-3.5 rounded-2xl border transition shadow-xs ${
                      vState.status === 'passed'
                        ? 'bg-gradient-to-r from-emerald-50 to-green-50/80 border-emerald-400 ring-2 ring-emerald-400/20'
                        : vState.status === 'failed'
                        ? 'bg-gradient-to-r from-red-50 to-rose-50/80 border-red-300 ring-2 ring-red-300/20'
                        : vState.status === 'scanning'
                        ? 'bg-blue-50/70 border-blue-300 animate-pulse'
                        : isChecked
                        ? 'bg-emerald-50/60 border-emerald-300'
                        : 'bg-[#F5F7FA] border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Header Row: Checkbox, Name, Status Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div 
                        onClick={() => toggleDoc(doc.nameGu)}
                        className="flex items-start gap-2.5 cursor-pointer select-none min-w-0 flex-1"
                      >
                        <div className="mt-0.5">
                          {vState.status === 'passed' || isChecked ? (
                            <CheckSquare className="w-4 h-4 text-[#138808] shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold leading-tight text-slate-900">{docLocalized}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{docSecondary}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {vState.status === 'passed' ? (
                          <span className="text-[9.5px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                            <CheckCircle2 className="w-3 h-3 text-white shrink-0" />
                            <span>{isEn ? 'AI Verified' : isHi ? 'सत्यापित' : isMr ? 'प्रमाणित' : 'AI પ્રમાણિત'}</span>
                          </span>
                        ) : vState.status === 'failed' ? (
                          <span className="text-[9.5px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                            <AlertTriangle className="w-3 h-3 text-white shrink-0" />
                            <span>{isEn ? 'Action Required' : isHi ? 'अमान्य' : isMr ? 'दुरुस्ती आवश्यक' : 'ધ્યાન જરૂરી'}</span>
                          </span>
                        ) : doc.required ? (
                          <span className="text-[9px] font-bold bg-blue-100 text-[#005A9C] border border-blue-200 px-1.5 py-0.5 rounded">
                            {isEn ? 'Mandatory' : isHi ? 'अनिवार्य' : isMr ? 'अनिवार्य' : 'ફરજિયાત'}
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                            {isEn ? 'Optional' : isHi ? 'वैकल्पिक' : isMr ? 'ऐच्छिक' : 'વૈકલ્પિક'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Scanning In Progress Animation */}
                    {vState.status === 'scanning' && (
                      <div className="mt-2.5 p-2 bg-blue-100/70 border border-blue-200 rounded-xl flex items-center gap-2 text-[11px] text-[#003366] font-bold">
                        <Loader2 className="w-3.5 h-3.5 text-[#005A9C] animate-spin shrink-0" />
                        <span>{isEn ? 'AI Document Analysis in progress (Validating seals, OCR & QR)...' : isHi ? 'AI दस्तावेज़ सत्यापन जारी है (मुहर, OCR एवं QR स्कैनिंग)...' : isMr ? 'AI कागदपत्र तपासणी सुरू आहे (शिक्का, OCR व QR स्कॅनिंग)...' : 'AI દસ્તાવેજ ચકાસણી ચાલુ છે (મોહર, OCR અને QR કોડ સ્કેનિંગ)...'}</span>
                      </div>
                    )}

                    {/* Verified Details Box (GREEN) */}
                    {vState.status === 'passed' && (
                      <div className="mt-2.5 p-2.5 bg-emerald-100/70 border border-emerald-300 rounded-xl space-y-1 text-[11px]">
                        <div className="flex items-center justify-between text-emerald-950 font-black">
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                            <span>{isEn ? 'Authenticity & Validity Verified' : isHi ? 'सत्यापित एवं वैध दस्तावेज़' : isMr ? 'अधिकृत व वैध कागदपत्र' : 'સત્તાવાર દસ્તાવેજ પ્રમાણિત'}</span>
                          </span>
                          <span className="text-[10px] text-emerald-800 font-mono">100% Match</span>
                        </div>
                        <p className="text-emerald-900 text-[10.5px] leading-relaxed">
                          {vState.extractedDetails}
                        </p>
                      </div>
                    )}

                    {/* Failed Reason Box (RED) */}
                    {vState.status === 'failed' && (
                      <div className="mt-2.5 p-2.5 bg-red-100/80 border border-red-300 rounded-xl space-y-1 text-[11px]">
                        <div className="flex items-center justify-between text-red-950 font-black">
                          <span className="flex items-center gap-1 text-red-700">
                            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                            <span>{isEn ? 'Validation Failed' : isHi ? 'सत्यापन विफल / अमान्य' : isMr ? 'पडताळणी अयशस्वी / अमान्य' : 'ચકાસણી નિષ્ફળ / અમાન્ય'}</span>
                          </span>
                        </div>
                        <p className="text-red-900 text-[10.5px] leading-relaxed font-medium">
                          {isEn ? vState.reasonEn : vState.reasonGu}
                        </p>
                      </div>
                    )}

                    {/* Action Toolbar: Real File Upload (No Demo Buttons) */}
                    <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
                      {/* Real File Input Trigger */}
                      <label className="text-[11px] font-bold text-[#003366] bg-white hover:bg-slate-50 border border-slate-300 hover:border-[#005A9C] px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer transition active:scale-95 shadow-2xs">
                        {vState.status === 'failed' ? (
                          <RefreshCw className="w-3.5 h-3.5 text-red-500" />
                        ) : (
                          <Upload className="w-3.5 h-3.5 text-[#FF9933]" />
                        )}
                        <span>
                          {vState.status === 'failed'
                            ? (isEn ? 'Re-upload Document' : isHi ? 'दस्तावेज़ पुनः अपलोड करें' : isMr ? 'कागदपत्र पुन्हा अपलोड करा' : 'સાચો દસ્તાવેજ ફરી અપલોડ કરો')
                            : vState.status === 'passed'
                            ? (isEn ? 'Change / Re-upload' : isHi ? 'दस्तावेज़ बदलें' : isMr ? 'कागदपत्र बदला' : 'ફાઇલ બદલો / ફરી અપલોડ')
                            : (isEn ? 'Upload Original Document' : isHi ? 'मूल दस्तावेज़ अपलोड करें' : isMr ? 'मूळ कागदपत्र अपलोड करा' : 'અસલ દસ્તાવેજ અપલોડ કરો')}
                        </span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              await handleRealFileUpload(doc.nameGu, file, doc.nameEn);
                              e.target.value = '';
                            }
                          }}
                        />
                      </label>

                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-1 rounded-lg">
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        <span>{isEn ? 'Google Gemini AI Verified' : isHi ? 'जेमिनी AI विज़न सत्यापित' : isMr ? 'जेमिनी AI व्हिजन तपासणी' : 'Gemini AI વિઝન સ્કેનિંગ'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Official Source & Reference Banner */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[10.5px] text-slate-500 space-y-1">
            <p className="font-bold text-slate-700">
              {isEn ? 'Official Reference Source:' : isHi ? 'आधिकारिक सरकारी स्रोत:' : isMr ? 'अधिकृत शासकीय स्रोत:' : 'સત્તાવાર સરકારી સંદર્ભ (Official Source):'}
            </p>
            <p>{sourceInfo.source} • {isEn ? 'Last verified:' : isMr ? 'शेवटचे अद्यतन:' : isHi ? 'अंतिम अद्यतन:' : 'છેલ્લી માહિતી:'} {sourceInfo.lastUpdated}</p>
            <p className="text-[9.5px] text-slate-400 italic">
              {isEn 
                ? 'Reference information — confirm with the concerned department during formal submission.' 
                : isMr
                ? 'संदर्भ माहिती — अधिकृत अर्ज सादर करताना संबंधित विभागाशी पडताळणी करा.'
                : isHi
                ? 'संदर्भ जानकारी — अंतिम आवेदन के समय संबंधित विभाग से पुष्टि करें।'
                : 'સંદર્ભ માહિતી — ઔપચારિક જમા કરતી વખતે સંબંધિત વિભાગ સાથે ચકાસો.'}
            </p>
          </div>

          {/* Share on WhatsApp Button */}
          <button
            onClick={handleShareWhatsApp}
            className="w-full bg-emerald-50 hover:bg-emerald-100 text-[#138808] border border-emerald-300 rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>
              {isEn ? 'Share Checklist on WhatsApp' : isHi ? 'व्हाट्सएप पर चेकलिस्ट साझा करें' : isMr ? 'व्हॉट्सॲपवर चेकलिस्ट पाठवा' : 'વોટ્સએપ પર ચેકલિસ્ટ મોકલો (Share on WhatsApp)'}
            </span>
          </button>

        </div>

        {/* Bottom Drawer Actions (Fixed & Sticky) */}
        <div className="p-3 sm:p-4 pb-[max(0.85rem,env(safe-area-inset-bottom))] bg-white border-t border-slate-200 space-y-2.5 shrink-0 sticky bottom-0 z-20">
          
          {/* Verification Status Notice Card */}
          {!isAllMandatoryVerified ? (
            <div className={`p-3 rounded-2xl border transition-all ${
              showValidationNotice 
                ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300/50 animate-pulse' 
                : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-start gap-2.5">
                <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${showValidationNotice ? 'text-amber-600' : 'text-slate-500'}`} />
                <div className="text-[11px] leading-snug">
                  <p className="font-extrabold text-slate-800">
                    {isEn 
                      ? `Mandatory Docs: ${verifiedMandatoryDocs.length}/${totalMandatory} AI-Verified` 
                      : isHi 
                      ? `अनिवार्य दस्तावेज़: ${verifiedMandatoryDocs.length}/${totalMandatory} AI सत्यापित` 
                      : isMr 
                      ? `आवश्यक कागदपत्रे: ${verifiedMandatoryDocs.length}/${totalMandatory} AI प्रमाणित` 
                      : `ફરજિયાત દસ્તાવેજો: ${verifiedMandatoryDocs.length}/${totalMandatory} AI પ્રમાણિત`}
                  </p>
                  <p className="text-slate-600 mt-0.5">
                    {isEn 
                      ? 'Upload original photos or PDFs for all mandatory documents above to collect token.' 
                      : isHi 
                      ? 'टोकन प्राप्त करने के लिए कृपया ऊपर दिए गए सभी अनिवार्य दस्तावेज़ अपलोड करें।' 
                      : isMr 
                      ? 'टोकन मिळवण्यासाठी कृपया सर्व आवश्यक कागदपत्रे अपलोड करा.' 
                      : 'કચેરી ટોકન મેળવવા માટે ઉપર આપેલા તમામ ફરજિયાત દસ્તાવેજો અપલોડ કરો.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2 text-emerald-900 text-[11px] font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isEn 
                  ? '✓ All mandatory documents AI-verified! You can now collect your live token.' 
                  : isHi 
                  ? '✓ सभी अनिवार्य दस्तावेज़ AI सत्यापित हैं! अब आप टोकन प्राप्त कर सकते हैं।' 
                  : isMr 
                  ? '✓ सर्व आवश्यक कागदपत्रे AI प्रमाणित झाली आहेत! आता आपण टोकन मिळवू शकता.' 
                  : '✓ તમામ ફરજિયાત દસ્તાવેજો Gemini AI દ્વારા પ્રમાણિત થયેલ છે! હવે ટોકન મેળવો.'}
              </span>
            </div>
          )}

          {onCollectToken && (
            <button
              onClick={handleCollectTokenClick}
              className={`w-full font-extrabold py-3.5 px-3 rounded-2xl text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 text-center cursor-pointer ${
                isAllMandatoryVerified
                  ? 'bg-emerald-700 hover:bg-emerald-800 text-white ring-2 ring-emerald-500/40 shadow-lg'
                  : 'bg-[#003366] hover:bg-[#002244] text-white'
              }`}
            >
              {isAllMandatoryVerified ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0 animate-pulse" />
                  <span>
                    {isEn 
                      ? '✓ All Docs Verified • Collect Live Token' 
                      : isHi 
                      ? '✓ सभी दस्तावेज़ सत्यापित • कार्यालय टोकन प्राप्त करें' 
                      : isMr 
                      ? '✓ सर्व कागदपत्रे प्रमाणित • थेट टोकन मिळवा' 
                      : '✓ તમામ દસ્તાવેજ પ્રમાણિત • કચેરી ટોકન કલેક્ટ કરો'}
                  </span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-[#FF9933] shrink-0" />
                  <span>
                    {isEn 
                      ? `Upload Docs to Collect Token (${verifiedMandatoryDocs.length}/${totalMandatory})` 
                      : isHi 
                      ? `टोकन हेतु दस्तावेज़ अपलोड करें (${verifiedMandatoryDocs.length}/${totalMandatory})` 
                      : isMr 
                      ? `टोकनसाठी कागदपत्रे अपलोड करा (${verifiedMandatoryDocs.length}/${totalMandatory})` 
                      : `ટોકન મેળવવા દસ્તાવેજ અપલોડ કરો (${verifiedMandatoryDocs.length}/${totalMandatory})`}
                  </span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
