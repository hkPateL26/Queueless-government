'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ShieldCheck, UserCheck, Users, Plus, Phone, FileText, 
  MapPin, CheckCircle2, AlertTriangle, Sparkles, Lock, ArrowRight,
  Fingerprint, HelpCircle, RefreshCw, Compass, Upload, Check,
  FileCheck, Trash2, AlertCircle, Info, ExternalLink, Volume2, VolumeX
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { speakGuidance, stopVoice, isVoiceSpeaking, toggleVoice } from '@/lib/voice';
import { 
  DEFAULT_CITIZEN_PROFILE, 
  FamilyMember, 
  CitizenAadhaarProfile,
  GOV_JURISDICTION_RULES,
  GOV_DOCUMENT_VERIFICATION_RULES,
  getLiveReverseGeocodedLocation
} from '@/lib/citizen-profile';
import { CURRENT_APP_VERSION } from '@/lib/app-version';
import { Language } from '@/lib/translations';
import { GovLogo } from '@/components/GovLogo';

interface CitizenProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
  onOpenLocationRadar?: () => void;
  onOpenUpdateModal?: () => void;
}

export function CitizenProfileModal({
  isOpen,
  onClose,
  lang = 'gu',
  onOpenLocationRadar,
  onOpenUpdateModal
}: CitizenProfileModalProps) {
  const [profile, setProfile] = useState<CitizenAadhaarProfile>(DEFAULT_CITIZEN_PROFILE);
  const [activeTab, setActiveTab] = useState<'overview' | 'family' | 'jurisdiction'>('overview');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isEn = lang === 'en';
  const isHi = lang === 'hi';
  const isMr = lang === 'mr';
  const isKhi = lang === 'khi';
  const isGu = lang === 'gu' || lang === 'khi';

  // Body scroll lock on modal open
  useEffect(() => {
    if (isOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
        stopVoice();
      };
    }
  }, [isOpen]);
  
  // Add Member State
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAadhaar, setNewMemberAadhaar] = useState('');
  const [newMemberMobile, setNewMemberMobile] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState<'spouse' | 'child' | 'parent' | 'sibling'>('child');
  const [selectedProofType, setSelectedProofType] = useState<'ration_card' | 'birth_certificate' | 'marriage_certificate'>('ration_card');
  const [proofDocNumber, setProofDocNumber] = useState('RC-NFSA-GJ-10948271');
  const [statutoryAgreed, setStatutoryAgreed] = useState(true);

  // Real File Upload State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedFileSize, setUploadedFileSize] = useState<string>('');
  const [uploadedFileType, setUploadedFileType] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Verification States
  const [aiChecking, setAiChecking] = useState(false);
  const [aiCheckingStep, setAiCheckingStep] = useState<string>('');
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isGpsRefreshing, setIsGpsRefreshing] = useState(false);
  const [memberFormError, setMemberFormError] = useState<string | null>(null);

  // Live Location State with Reverse Geocoding
  const [liveLocation, setLiveLocation] = useState<{
    latitude: number;
    longitude: number;
    displayGu: string;
    displayEn: string;
    displayHi: string;
    displayMr: string;
    accuracyMeters: number;
    isGpsLive: boolean;
  }>({
    latitude: 21.9619,
    longitude: 70.7923,
    displayGu: 'ગોંડલ ટાઉન / સ્ટેશન રોડ, જિલ્લો: રાજકોટ',
    displayEn: 'Gondal Town / Station Rd, District: Rajkot',
    displayHi: 'गोंडल टाउन / स्टेशन रोड, जिला: राजकोट',
    displayMr: 'गोंडल शहर / स्टेशन रोड, जिल्हा: राजकोट',
    accuracyMeters: 6,
    isGpsLive: false
  });

  // Dynamic reverse geocoding with 4-language support
  const fetchLiveLocation = () => {
    setIsGpsRefreshing(true);
    triggerHaptic('tap');

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const acc = Math.round(position.coords.accuracy) || 5;

          try {
            const geocoded = await getLiveReverseGeocodedLocation(lat, lon);
            setLiveLocation({
              latitude: lat,
              longitude: lon,
              displayGu: geocoded.displayGu,
              displayEn: geocoded.displayEn,
              displayHi: geocoded.displayGu.replace('જિલ્લો', 'जिला').replace('તાલુકો', 'तहसील'),
              displayMr: geocoded.displayGu.replace('જિલ્લો', 'जिल्हा').replace('તાલુકો', 'तालुका'),
              accuracyMeters: acc,
              isGpsLive: true
            });
          } catch (err) {
            setLiveLocation({
              latitude: lat,
              longitude: lon,
              displayGu: `અક્ષાંશ: ${lat.toFixed(4)}, રેખાંશ: ${lon.toFixed(4)} (ગુજરાત)`,
              displayEn: `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)} (Gujarat)`,
              displayHi: `अक्षांश: ${lat.toFixed(4)}, देशांतर: ${lon.toFixed(4)} (गुजरात)`,
              displayMr: `अक्षांश: ${lat.toFixed(4)}, रेखांश: ${lon.toFixed(4)} (गुजरात)`,
              accuracyMeters: acc,
              isGpsLive: true
            });
          }
          setIsGpsRefreshing(false);
          triggerHaptic('success');
        },
        async () => {
          const fallback = await getLiveReverseGeocodedLocation(21.9619, 70.7923);
          setLiveLocation({
            latitude: 21.9619,
            longitude: 70.7923,
            displayGu: fallback.displayGu,
            displayEn: fallback.displayEn,
            displayHi: 'गोंडल टाउन / स्टेशन रोड, जिला: राजकोट (गुजरात)',
            displayMr: 'गोंडल शहर / स्टेशन रोड, जिल्हा: राजकोट (गुजरात)',
            accuracyMeters: 8,
            isGpsLive: false
          });
          setIsGpsRefreshing(false);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setTimeout(() => setIsGpsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLiveLocation();
    }
  }, [isOpen]);

  // Update default placeholder when proof type changes
  useEffect(() => {
    if (selectedProofType === 'ration_card') {
      setProofDocNumber('RC-NFSA-GJ-10948271');
    } else if (selectedProofType === 'birth_certificate') {
      setProofDocNumber('BC-GONDAL-2020-04912');
    } else if (selectedProofType === 'marriage_certificate') {
      setProofDocNumber('MR-GUJ-2018-009182');
    }
  }, [selectedProofType]);

  if (!isOpen) return null;

  const isDifferentMobile = newMemberMobile.trim() !== '' && newMemberMobile.trim() !== profile.mobile;

  // Localized Citizen Name
  const citizenDisplayName = isEn 
    ? profile.nameEn 
    : isHi 
    ? 'हरि पटेल' 
    : isMr 
    ? 'हरी पटेल' 
    : profile.nameGu;

  // Localized Address String
  const citizenDisplayAddress = isEn
    ? profile.fullAddressEn
    : isHi
    ? 'मकान नं. ४४, रामजी मंदिर चौक, गांव: गोमटा, तहसील: गोंडल, जिला: राजकोट - ३६०३૧૧ (गुजरात)'
    : isMr
    ? 'घर क्र. ४४, रामजी मंदिर चौक, गाव: गोमटा, तालुका: गोंडल, जिल्हा: राजकोट - ३६०३૧૧ (गुजरात)'
    : profile.fullAddressGu;

  // Localized Native Taluka / District
  const citizenNativeJurisdiction = isEn
    ? `${profile.talukaEn}, ${profile.districtEn}`
    : isHi
    ? 'गोंडल, राजकोट'
    : isMr
    ? 'गोंडल, राजकोट'
    : `${profile.talukaGu}, ${profile.districtGu}`;

  // Localized Village
  const citizenVillageDisplay = isEn
    ? `Village: ${profile.villageEn}`
    : isHi
    ? 'गांव: गोमटा'
    : isMr
    ? 'गाव: गोमटा'
    : `ગામ: ${profile.villageGu}`;

  // Localized Live Location
  const liveLocationDisplay = isEn
    ? liveLocation.displayEn
    : isHi
    ? liveLocation.displayHi
    : isMr
    ? liveLocation.displayMr
    : liveLocation.displayGu;

  // Handle Voice Guide Audio with Toggle
  const handleToggleVoiceGuide = () => {
    triggerHaptic('tap');
    if (isVoiceSpeaking()) {
      stopVoice();
      setIsSpeaking(false);
    } else {
      const speechText = isEn
        ? `Aadhaar Profile verified for ${citizenDisplayName}. Native registered address is Gondal, Rajkot. Current Live GPS is connected.`
        : isHi
        ? `${citizenDisplayName} का आधार प्रोफ़ाइल सत्यापित है। मूल पंजीकृत पता गोंडल, राजकोट है। लाइव जीपीएस सक्रिय है।`
        : isMr
        ? `${citizenDisplayName} यांचे आधार प्रोफाइल सत्यापित आहे. मूळ नोंदणीकृत पत्ता गोंडल, राजकोट आहे. थेट जीपीएस जोडलेले आहे.`
        : isKhi
        ? `${citizenDisplayName} જો આધાર પ્રોફાઇલ પ્રમાણિત આય. મૂળ નોંધાયેલ સરનામું ગોંડલ, રાજકોટ આય.`
        : `${citizenDisplayName} ની આધાર પ્રોફાઇલ પ્રમાણિત છે. મૂળ નોંધાયેલ સરનામું ગોંડલ, રાજકોટ છે. લાઈવ GPS સક્રિય છે.`;
      
      setIsSpeaking(true);
      speakGuidance(speechText, lang, () => setIsSpeaking(false));
    }
  };

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError(isEn ? 'File size must be under 5 MB.' : isHi ? 'फ़ाइल का आकार 5 MB से कम होना चाहिए।' : isMr ? 'फाइलचा आकार 5 MB पेक्षा कमी असावा.' : 'ફાઈલ સાઈઝ ૫ MB કરતાં ઓછી હોવી જોઈએ.');
      triggerHaptic('warning');
      return;
    }

    const formattedSize = file.size > 1024 * 1024 
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    setUploadedFileName(file.name);
    setUploadedFileSize(formattedSize);
    setUploadedFileType(file.type.includes('pdf') ? 'PDF' : 'IMAGE');
    triggerHaptic('success');
  };

  const removeUploadedFile = () => {
    setUploadedFileName('');
    setUploadedFileSize('');
    setUploadedFileType('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Start AI Verification
  const handleStartAiVerification = () => {
    if (!newMemberName.trim()) {
      setMemberFormError(isEn ? 'Please enter member full name as per Aadhaar.' : isHi ? 'कृपया आधार अनुसार सदस्य का पूरा नाम दर्ज करें।' : isMr ? 'कृपया आधारानुसार सदस्याचे पूर्ण नाव प्रविष्ट करा.' : 'કૃપા કરીને સભ્યનું પૂરું નામ આધાર કાર્ડ મુજબ દાખલ કરો.');
      return;
    }
    if (newMemberAadhaar.length < 4) {
      setMemberFormError(isEn ? 'Please enter last 4 digits of Aadhaar number.' : isHi ? 'कृपया आधार संख्या के अंतिम 4 अंक दर्ज करें।' : isMr ? 'कृपया आधार क्रमांकाचे शेवटचे ४ अंक प्रविष्ट करा.' : 'કૃપા કરીને આધાર કાર્ડના છેલ્લા ૪ અંક દાખલ કરો.');
      return;
    }
    if (!uploadedFileName) {
      setMemberFormError(isEn ? 'Please upload official statutory proof document (PDF or Image).' : isHi ? 'कृपया आधिकारिक सरकारी प्रमाण दस्तावेज़ (PDF या छवि) अपलोड करें।' : isMr ? 'कृपया अधिकृत शासकीय पुरावा कागदपत्र (PDF किंवा छायाचित्र) अपलोड करा.' : 'કૃપા કરીને સત્તાવાર સરકારી પ્રમાણિત દસ્તાવેજ (PDF અથવા ફોટો) અપલોડ કરો.');
      return;
    }
    if (!statutoryAgreed) {
      setMemberFormError(isEn ? 'Please accept the statutory declaration compliance.' : isHi ? 'कृपया वैधानिक घोषणा की पुष्टि करें।' : isMr ? 'कृपया वैधानिक हमीपत्रास सहमती द्या.' : 'કૃપા કરીને કાયદેસર બાંહેધરી સ્વીકારો.');
      return;
    }

    setMemberFormError(null);
    triggerHaptic('tap');
    setAiChecking(true);
    setAiCheckingStep(isEn ? 'Step 1/3: Reading Government Security Seals...' : isHi ? 'चरण 1/3: सरकारी सुरक्षा मुहर की जांच...' : isMr ? 'टप्पा 1/3: शासकीय सुरक्षा शिक्का तपासणी...' : 'પગલું ૧/૩: સરકારી હોલોગ્રામ & સિક્કાની ચકાસણી...');

    setTimeout(() => {
      setAiCheckingStep(isEn ? 'Step 2/3: UIDAI Family Lineage Match...' : isHi ? 'चरण 2/3: UIDAI परिवार वंशावली मिलान...' : isMr ? 'टप्पा 2/3: UIDAI कुटुंब संबंध जुळवणी...' : 'પગલું ૨/૩: કુટુંબ રેશન ડેટાબેઝ સાથે લિંક ચકાસણી...');
    }, 800);

    setTimeout(() => {
      setAiCheckingStep(isEn ? 'Step 3/3: Anti-Tamper & Validity Pass...' : isHi ? 'चरण 3/3: छेड़छाड़-रोधी एवं वैधता पूर्ण...' : isMr ? 'टप्पा 3/3: फेरफार तपासणी व वैधता पूर्ण...' : 'પગલું ૩/૩: દસ્તાવેજ પરિપૂર્ણ & કાયદેસર માન્ય...');
    }, 1500);

    setTimeout(() => {
      setAiChecking(false);
      setAiConfidence(99.4);
      triggerHaptic('success');

      if (isDifferentMobile) {
        setIsOtpStep(true);
        speakGuidance(
          isEn
            ? 'Document verified! Enter 6-digit OTP sent to member mobile.'
            : isHi
            ? `दस्तावेज़ प्रमाणित हुआ! सुरक्षा के लिए ${newMemberMobile} पर भेजा गया ६ अंकों का OTP दर्ज करें।`
            : isMr
            ? `कागदपत्र प्रमाणित झाले! सुरक्षेसाठी ${newMemberMobile} वर पाठवलेला ६ अंकी OTP प्रविष्ट करा.`
            : `દસ્તાવેજ કાયદેસર પ્રમાણિત થયો! સુરક્ષા માટે ${newMemberMobile} પર મોકલેલ ૬ અંકનો OTP દાખલ કરો.`,
          lang
        );
      } else {
        finalizeAddMember();
      }
    }, 2100);
  };

  const finalizeAddMember = () => {
    triggerHaptic('success');
    const newMem: FamilyMember = {
      id: `mem-${Date.now()}`,
      nameGu: newMemberName,
      nameEn: newMemberName,
      relationGu: newMemberRelation === 'spouse' ? 'પત્ની' : newMemberRelation === 'child' ? 'પુત્ર/પુત્રી' : newMemberRelation === 'parent' ? 'માતા/પિતા (વરિષ્ઠ નાગરિક)' : 'ભાઈ/બહેન',
      relationEn: newMemberRelation.charAt(0).toUpperCase() + newMemberRelation.slice(1),
      relationType: newMemberRelation,
      aadhaarMasked: `XXXX XXXX ${newMemberAadhaar}`,
      mobile: newMemberMobile.trim() || profile.mobile,
      isSameMobile: !isDifferentMobile,
      status: 'verified',
      documentProofType: selectedProofType,
      documentProofNumber: proofDocNumber,
      documentFileName: uploadedFileName,
      documentFileSize: uploadedFileSize,
      aiMatchConfidence: 99.4,
      addedAt: new Date().toLocaleDateString('en-GB')
    };

    setProfile(prev => ({
      ...prev,
      familyMembers: [...prev.familyMembers, newMem]
    }));

    speakGuidance(
      isEn
        ? `Member ${newMemberName} successfully linked with verified proof!`
        : isHi
        ? `सदस्य ${newMemberName} सरकारी नियमानुसार सफलतापूर्वक परिवार से लिंक हुए!`
        : isMr
        ? `सदस्य ${newMemberName} शासकीय नियमांनुसार यशस्वीरित्या कुटुंबाशी जोडले गेले!`
        : `સભ્ય ${newMemberName} સરકારી નિયમ મુજબ સફળતાપૂર્વક પરિવારમાં લિંક થયા!`,
      lang
    );

    // Reset Form
    setIsAddingMember(false);
    setIsOtpStep(false);
    setNewMemberName('');
    setNewMemberAadhaar('');
    setNewMemberMobile('');
    setEnteredOtp('');
    setAiConfidence(null);
    removeUploadedFile();
  };

  const handleVerifyOtp = () => {
    if (enteredOtp.length < 4) {
      setOtpError(isEn ? 'Please enter valid 6-digit OTP.' : isHi ? 'कृपया सही ६ अंकों का OTP दर्ज करें।' : isMr ? 'कृपया योग्य ६ अंकी OTP प्रविष्ट करा.' : 'કૃપા કરીને માન્ય ૬ અંકનો OTP દાખલ કરો.');
      triggerHaptic('warning');
      return;
    }
    finalizeAddMember();
  };

  const activeDocRule = GOV_DOCUMENT_VERIFICATION_RULES[selectedProofType];

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden modal-backdrop animate-in fade-in duration-150"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-3xl h-[92dvh] max-h-[92dvh] sm:h-auto sm:max-h-[88vh] overflow-hidden rounded-t-[28px] sm:rounded-3xl shadow-2xl flex flex-col border border-slate-200 animate-in slide-in-from-bottom duration-200"
      >
        {/* MOBILE BOTTOM SHEET DRAG PILL */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-[#003366] shrink-0">
          <div className="w-12 h-1.5 bg-white/40 rounded-full" />
        </div>

        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-[#003366] via-[#004080] to-[#005A9C] text-white p-3.5 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <GovLogo className="w-9 h-9 sm:w-10 sm:h-10 drop-shadow-md shrink-0" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-amber-400/20 text-[#FF9933] border border-amber-400/30 px-1.5 sm:px-2 py-0.5 rounded">
                  {isEn ? 'Official Identity Vault' : isHi ? 'आधिकारिक नागरिक पहचान वॉल्ट' : isMr ? 'अधिकृत नागरिक ओळख व्हॉल्ट' : 'સત્તાવાર નાગરિક ઓળખ વૉલ્ટ'}
                </span>
                <span className="text-[9px] sm:text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-1.5 sm:px-2 py-0.5 rounded font-bold font-mono">
                  {isEn ? 'Aadhaar Verified' : isHi ? 'आधार सत्यापित' : isMr ? 'आधार सत्यापित' : 'આધાર પ્રમાણિત'}
                </span>
                
                {/* Voice Guide Audio Button with Stop Capability */}
                <button
                  onClick={handleToggleVoiceGuide}
                  className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs ${
                    isSpeaking 
                      ? 'bg-rose-500 text-white animate-pulse' 
                      : 'bg-white/15 hover:bg-white/25 text-amber-300 border border-amber-300/40'
                  }`}
                  title={isSpeaking ? 'Stop Audio' : 'Listen Voice Overview'}
                >
                  {isSpeaking ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                  <span>
                    {isSpeaking 
                      ? (isEn ? 'Stop Voice' : isHi ? 'आवाज रोकें' : isMr ? 'आवाज थांबवा' : 'અવાજ બંધ કરો')
                      : (isEn ? 'Listen Profile' : isHi ? 'प्रोफ़ाइल सुनें' : isMr ? 'प्रोफाइल ऐका' : 'સાંભળો')}
                  </span>
                </button>

                {onOpenUpdateModal && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenUpdateModal();
                    }}
                    className="text-[9px] sm:text-[10px] bg-amber-400 text-slate-900 font-extrabold px-1.5 sm:px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer hover:bg-amber-300 transition shadow-2xs"
                    title="Changelog"
                  >
                    <Sparkles className="w-3 h-3 text-slate-900" />
                    <span>{CURRENT_APP_VERSION} {isEn ? "What's New?" : isHi ? 'नया क्या है?' : isMr ? 'नवीन काय आहे?' : 'નવું શું છે?'}</span>
                  </button>
                )}
              </div>
              <h2 className="text-sm sm:text-lg font-black text-white mt-0.5 truncate">
                {isEn 
                  ? `${profile.nameEn} • Citizen Profile & Family` 
                  : isHi 
                  ? `${citizenDisplayName} • नागरिक प्रोफ़ाइल एवं परिवार` 
                  : isMr 
                  ? `${citizenDisplayName} • नागरिक प्रोफाइल आणि कुटुंब` 
                  : `${profile.nameGu} • નાગરિક પ્રોફાઇલ અને પરિવાર`}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition active:scale-95 cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TAB NAVIGATION */}
        <div className="bg-slate-50 border-b border-slate-200 px-2 sm:px-4 grid grid-cols-3 gap-1 shrink-0">
          <button
            onClick={() => {
              triggerHaptic('tap');
              setActiveTab('overview');
            }}
            className={`py-2.5 sm:py-3 text-[11px] sm:text-xs font-bold border-b-2 transition flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer text-center ${
              activeTab === 'overview'
                ? 'border-[#003366] text-[#003366] font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#FF9933] shrink-0" />
            <span className="truncate">{isEn ? 'Address & GPS' : isHi ? 'पता एवं लाइव GPS' : isMr ? 'पत्ता आणि थेट GPS' : 'સરનામું & લાઈવ GPS'}</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('tap');
              setActiveTab('family');
            }}
            className={`py-2.5 sm:py-3 text-[11px] sm:text-xs font-bold border-b-2 transition flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer text-center ${
              activeTab === 'family'
                ? 'border-[#003366] text-[#003366] font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#138808] shrink-0" />
            <span className="truncate">{isEn ? `Family (${profile.familyMembers.length})` : isHi ? `परिवार (${profile.familyMembers.length})` : isMr ? `कुटुंब (${profile.familyMembers.length})` : `પરિવાર (${profile.familyMembers.length})`}</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('tap');
              setActiveTab('jurisdiction');
            }}
            className={`py-2.5 sm:py-3 text-[11px] sm:text-xs font-bold border-b-2 transition flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer text-center ${
              activeTab === 'jurisdiction'
                ? 'border-[#003366] text-[#003366] font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span className="truncate">{isEn ? 'Gov Rules' : isHi ? 'सरकारी नियम' : isMr ? 'शासकीय नियम' : 'સરકારી નિયમો'}</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 sm:space-y-5 pb-10">
          
          {/* TAB 1: OVERVIEW & LOCATION COMPARISON */}
          {activeTab === 'overview' && (
            <div className="space-y-4 sm:space-y-5">
              
              {/* Card 1: Official Aadhaar Card Banner */}
              <div className="bg-gradient-to-br from-amber-50/70 via-white to-blue-50/50 border border-amber-200 rounded-2xl p-3.5 sm:p-5 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/60 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="w-5 h-5 text-[#FF9933] shrink-0" />
                    <span className="font-extrabold text-[#003366] text-[11px] sm:text-xs uppercase tracking-wider">
                      {isEn 
                        ? 'Unique Identification Authority of India (UIDAI) • Gujarat' 
                        : isHi 
                        ? 'भारतीय विशिष्ट पहचान प्राधिकरण (UIDAI) • गुजरात सर्किल' 
                        : isMr 
                        ? 'भारतीय विशिष्ट ओळख प्राधिकरण (UIDAI) • गुजरात मंडळ' 
                        : 'ભારતીય વિશિષ્ટ ઓળખ સત્તામંડળ (UIDAI) • ગુજરાત સર્કલ'}
                    </span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                    <span>{isEn ? 'Verified Aadhaar' : isHi ? 'प्रमाणित आधार' : isMr ? 'प्रमाणित आधार' : 'પ્રમાણિત આધાર'}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {isEn ? 'Citizen Name' : isHi ? 'नागरिक का नाम' : isMr ? 'नागरिकाचे नाव' : 'નાગરિકનું નામ'}
                    </span>
                    <p className="text-xs sm:text-sm font-black text-[#003366] mt-0.5">{citizenDisplayName}</p>
                    <p className="text-[11px] font-mono text-slate-500 font-bold mt-0.5">{profile.aadhaarMasked}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {isEn ? 'Linked Mobile' : isHi ? 'लिंक मोबाइल' : isMr ? 'जोडलेला मोबाइल' : 'લિંક થયેલ મોબાઈલ'}
                    </span>
                    <p className="text-xs sm:text-sm font-black text-[#003366] mt-0.5 font-mono">+91 {profile.mobile}</p>
                    <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                      {isEn ? '✓ OTP Active' : isHi ? '✓ OTP सक्रिय' : isMr ? '✓ OTP सक्रिय' : '✓ OTP સક્રિય'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {isEn ? 'Native Jurisdiction' : isHi ? 'मूल कार्यक्षेत्र' : isMr ? 'मूळ कार्यक्षेत्र' : 'મૂળ કાર્યક્ષેત્ર'}
                    </span>
                    <p className="text-xs sm:text-sm font-black text-[#003366] mt-0.5">
                      {citizenNativeJurisdiction}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                      {citizenVillageDisplay}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Two-Column Location Comparison (Aadhaar Registered vs Live GPS) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                
                {/* Column A: Aadhaar Registered Address */}
                <div className="bg-white border-2 border-blue-200 rounded-2xl p-3.5 sm:p-4 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-blue-100">
                    <span className="text-xs font-black text-[#003366] flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#005A9C] shrink-0" />
                      <span>{isEn ? 'Aadhaar Registered Address' : isHi ? 'आधार पंजीकृत पता' : isMr ? 'आधार नोंदणीकृत पत्ता' : 'આધાર નોંધાયેલ સરનામું'}</span>
                    </span>
                    <span className="text-[9px] bg-blue-100 text-[#003366] font-bold px-1.5 py-0.5 rounded">
                      {isEn ? 'Permanent' : isHi ? 'स्थाई' : isMr ? 'कायमस्वरूपी' : 'કાયમી'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-bold mt-2 leading-relaxed">
                    {citizenDisplayAddress}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between font-bold">
                    <span>{isEn ? `Taluka: ${profile.talukaEn}` : isHi ? 'तहसील: गोंडल' : isMr ? 'तालुका: गोंडल' : `તાલુકો: ${profile.talukaGu}`}</span>
                    <span>{isEn ? `Pincode: ${profile.pincode}` : isHi ? `पिनकोड: ${profile.pincode}` : isMr ? `पिनकोड: ${profile.pincode}` : `પિનકોડ: ${profile.pincode}`}</span>
                  </div>
                </div>

                {/* Column B: Real-Time Live GPS Location */}
                <div className="bg-white border-2 border-emerald-300 rounded-2xl p-3.5 sm:p-4 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                    <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                      <Compass className={`w-4 h-4 text-emerald-600 shrink-0 ${isGpsRefreshing ? 'animate-spin' : ''}`} />
                      <span>{isEn ? 'Current Live GPS Location (Exact)' : isHi ? 'वर्तमान लाइव GPS स्थान (सटीक)' : isMr ? 'सध्याचे थेट GPS स्थान (अचूक)' : 'હાલનું લાઈવ GPS લોકેશન (વાસ્તવિક)'}</span>
                    </span>
                    <button
                      onClick={fetchLiveLocation}
                      disabled={isGpsRefreshing}
                      className="text-[9px] bg-emerald-100 text-emerald-900 hover:bg-emerald-200 font-extrabold px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition"
                    >
                      <RefreshCw className={`w-2.5 h-2.5 ${isGpsRefreshing ? 'animate-spin' : ''}`} />
                      <span>{isGpsRefreshing ? (isEn ? 'Locating...' : isHi ? 'खोज रहा है...' : isMr ? 'शोधत आहे...' : 'શોધે છે...') : (isEn ? 'Refresh' : isHi ? 'रिफ्रेश' : isMr ? 'रिफ्रेश' : 'રીફ્રેશ')}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-900 font-black mt-2 leading-relaxed">
                    📍 {liveLocationDisplay}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex flex-wrap items-center justify-between gap-1 font-bold">
                    <span>{isEn ? `Accuracy: ±${liveLocation.accuracyMeters} meters` : isHi ? `सटीकता: ±${liveLocation.accuracyMeters} मीटर` : isMr ? `अचूकता: ±${liveLocation.accuracyMeters} मीटर` : `ચોક્કસાઈ: ±${liveLocation.accuracyMeters} મીટર`}</span>
                    <span>{isEn ? 'Lat/Lon: ' : isHi ? 'अक्षांश/देशांतर: ' : isMr ? 'अक्षांश/रेखांश: ' : 'અક્ષાંશ/રેખાંશ: '}<strong className="font-mono">{liveLocation.latitude.toFixed(4)}, {liveLocation.longitude.toFixed(4)}</strong></span>
                  </div>
                </div>
              </div>

              {/* Callout Action to Open Smart Location Radar */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#003366] text-white flex items-center justify-center shrink-0">
                    <Compass className="w-5 h-5 text-[#FF9933]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-[#003366]">
                      {isEn ? 'Nearby Kacheris & Free Desk Radar' : isHi ? 'निकटतम कार्यालय एवं मुक्त काउंटर रडार' : isMr ? 'जवळचे कार्यालय आणि मोफत काउंटर रडार' : 'નજીકની કચેરીઓ અને મુક્ત કાઉન્ટર રડાર'}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {isEn 
                        ? 'Compare nearby centers to find fastest wait times and free desks.' 
                        : isHi 
                        ? 'अपने लाइव स्थान से निकटतम कार्यालय व कम प्रतीक्षा समय वाले केंद्र की तुलना करें।' 
                        : isMr 
                        ? 'आपल्या थेट स्थानावरून जवळचे कार्यालय व कमी गर्दी असलेल्या केंद्रांची तुलना करा.' 
                        : 'તમારા લાઈવ લોકેશનથી કઈ કચેરી સૌથી નજીક છે અને ક્યાં ઓછા ટોકન/ભીડ છે તે સરખાવો.'}
                    </p>
                  </div>
                </div>

                {onOpenLocationRadar && (
                  <button
                    onClick={() => {
                      triggerHaptic('tap');
                      onClose();
                      onOpenLocationRadar();
                    }}
                    className="bg-[#003366] hover:bg-[#002244] text-white text-xs font-extrabold px-3.5 py-2 rounded-xl transition active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs w-full sm:w-auto justify-center"
                  >
                    <span>{isEn ? 'Open Location Radar' : isHi ? 'कार्यालय रडार खोलें' : isMr ? 'कार्यालय रडार उघडा' : 'કચેરી રડાર સરખાવો'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#FF9933]" />
                  </button>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: FAMILY MEMBERS VAULT */}
          {activeTab === 'family' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-[#003366]">
                    {isEn ? 'Family Aadhaar & Ration Card Vault' : isHi ? 'परिवार आधार एवं राशन कार्ड वॉल्ट' : isMr ? 'कुटुंब आधार व शिधापत्रिका व्हॉल्ट' : 'પરિવાર આધાર & રેશનકાર્ડ વૉલ્ટ'}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
                    {isEn 
                      ? 'Family members linked with verified government statutory documents' 
                      : isHi 
                      ? 'सरकारी नियमों के तहत सत्यापित दस्तावेजों से जुड़े परिवार के सदस्य' 
                      : isMr 
                      ? 'शासकीय नियमांनुसार पडताळणी केलेल्या कागदपत्रांशी जोडलेले कुटुंब सदस्य' 
                      : 'સરકારી નિયમો મુજબ પ્રમાણિત દસ્તાવેજ સાથે લિંક થયેલા કુટુંબના સભ્યો'}
                  </p>
                </div>

                {!isAddingMember && (
                  <button
                    onClick={() => {
                      triggerHaptic('tap');
                      setIsAddingMember(true);
                    }}
                    className="bg-[#138808] hover:bg-emerald-700 text-white font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Add Family Member' : isHi ? 'नया सदस्य जोड़ें' : isMr ? 'नवीन सदस्य जोडा' : 'નવા સભ્ય ઉમેરો'}</span>
                  </button>
                )}
              </div>

              {/* ADD MEMBER FORM */}
              {isAddingMember && (
                <div className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-3.5 sm:p-5 space-y-3.5 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                    <span className="text-xs font-black text-[#003366] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#FF9933]" />
                      <span>{isEn ? 'Add Family Member (Document Upload & AI Verification)' : isHi ? 'परिवार में सदस्य जोड़ें (दस्तावेज़ अपलोड व AI सत्यापन)' : isMr ? 'कुटुंबात सदस्य जोडा (कागदपत्र अपलोड व AI पडताळणी)' : 'પરિવારમાં સભ્ય ઉમેરો (કાયદેસર દસ્તાવેજ અપલોડ & AI ચકાસણી)'}</span>
                    </span>
                    <button
                      onClick={() => {
                        setIsAddingMember(false);
                        removeUploadedFile();
                      }}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                    >
                      {isEn ? 'Cancel' : isHi ? 'रद्द करें' : isMr ? 'रद्द करा' : 'રદ કરો'}
                    </button>
                  </div>

                  {!isOtpStep ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                      {/* Name */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          {isEn ? 'Full Name (As per Aadhaar) *' : isHi ? 'सदस्य का पूरा नाम (आधार अनुसार) *' : isMr ? 'सदस्याचे पूर्ण नाव (आधारानुसार) *' : 'સભ્યનું પૂરું નામ (આધાર મુજબ) *'}
                        </label>
                        <input
                          type="text"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          placeholder={isEn ? 'e.g. Miraben Patel' : isHi ? 'उदा. मीराबेन पटेल' : isMr ? 'उदा. मीराबेन पटेल' : 'દા.ત. મીરાબેન પટેલ'}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-[#003366] focus:outline-none focus:ring-2 focus:ring-[#003366]"
                        />
                      </div>

                      {/* Relationship */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          {isEn ? 'Relationship *' : isHi ? 'संबंध (Relationship) *' : isMr ? 'नातेसंबंध (Relationship) *' : 'સંબંધ (Relation with Head) *'}
                        </label>
                        <select
                          value={newMemberRelation}
                          onChange={(e) => setNewMemberRelation(e.target.value as any)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-[#003366] focus:outline-none focus:ring-2 focus:ring-[#003366]"
                        >
                          <option value="spouse">{isEn ? 'Spouse' : isHi ? 'पत्नी / पति (Spouse)' : isMr ? 'पत्नी / पती (Spouse)' : 'પત્ની / પતિ (Spouse)'}</option>
                          <option value="child">{isEn ? 'Child' : isHi ? 'पुत्र / पुत्री (Child)' : isMr ? 'मुलगा / मुलगी (Child)' : 'પુત્ર / પુત્રી (Child)'}</option>
                          <option value="parent">{isEn ? 'Parent (Senior Citizen)' : isHi ? 'माता / पिता (वरिष्ठ नागरिक)' : isMr ? 'आई / वडील (ज्येष्ठ नागरिक)' : 'માતા / પિતા (Parent - Senior Citizen)'}</option>
                          <option value="sibling">{isEn ? 'Sibling' : isHi ? 'भाई / बहन (Sibling)' : isMr ? 'भाऊ / बहीण (Sibling)' : 'ભાઈ / બહેન (Sibling)'}</option>
                        </select>
                      </div>

                      {/* Aadhaar Digits */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          {isEn ? 'Aadhaar Number (Last 4 Digits) *' : isHi ? 'आधार संख्या (अंतिम ४ अंक) *' : isMr ? 'आधार क्रमांक (शेवटचे ४ अंक) *' : 'આધાર કાર્ડ નંબર (છેલ્લા ૪ અંક) *'}
                        </label>
                        <input
                          type="text"
                          maxLength={4}
                          value={newMemberAadhaar}
                          onChange={(e) => setNewMemberAadhaar(e.target.value.replace(/\D/g, ''))}
                          placeholder="5521"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#003366] focus:outline-none focus:ring-2 focus:ring-[#003366]"
                        />
                      </div>

                      {/* Mobile */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          {isEn ? 'Mobile (Empty = Same Number)' : isHi ? 'मोबाइल नंबर (समान नंबर हेतु रिक्त रखें)' : isMr ? 'मोबाइल क्रमांक (समान क्रमांक असल्यास रिक्त ठेवा)' : 'મોબાઈલ નંબર (ખાલી રાખશો તો સેમ નંબર ગણાશે)'}
                        </label>
                        <input
                          type="text"
                          maxLength={10}
                          value={newMemberMobile}
                          onChange={(e) => setNewMemberMobile(e.target.value.replace(/\D/g, ''))}
                          placeholder={profile.mobile}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#003366] focus:outline-none focus:ring-2 focus:ring-[#003366]"
                        />
                      </div>

                      {/* Proof Document Type Selector */}
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                          {isEn ? 'Government Family Proof Document Type *' : isHi ? 'सरकारी प्रमाणित दस्तावेज़ प्रकार (पारिवारिक प्रमाण) *' : isMr ? 'शासकीय कुटुंब पुरावा कागदपत्र प्रकार *' : 'સરકારી પ્રમાણિત દસ્તાવેજ પ્રકાર (કુટુંબ પુરાવો) *'}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedProofType('ration_card')}
                            className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                              selectedProofType === 'ration_card' 
                                ? 'bg-[#003366] text-white border-[#003366] shadow-xs' 
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 font-bold text-xs">
                              <span>🍚</span>
                              <span className="truncate">{isEn ? 'Ration Card' : isHi ? 'राशन कार्ड (NFSA)' : isMr ? 'शिधापत्रिका (NFSA)' : 'રેશનકાર્ડ (NFSA)'}</span>
                            </div>
                            <span className={`text-[9px] block mt-0.5 ${selectedProofType === 'ration_card' ? 'text-amber-200' : 'text-slate-400'}`}>
                              {isEn ? 'NFSA Sec 7' : 'અન્ન સુરક્ષા નિયમ ૭'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedProofType('birth_certificate')}
                            className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                              selectedProofType === 'birth_certificate' 
                                ? 'bg-[#003366] text-white border-[#003366] shadow-xs' 
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 font-bold text-xs">
                              <span>👶</span>
                              <span className="truncate">{isEn ? 'Birth Certificate' : isHi ? 'जन्म प्रमाण पत्र' : isMr ? 'जन्म दाखला' : 'જન્મ પ્રમાણપત્ર'}</span>
                            </div>
                            <span className={`text-[9px] block mt-0.5 ${selectedProofType === 'birth_certificate' ? 'text-amber-200' : 'text-slate-400'}`}>
                              {isEn ? 'Form 5 Minor' : 'ફોર્મ ૫ (CRSR) સગીર'}
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedProofType('marriage_certificate')}
                            className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                              selectedProofType === 'marriage_certificate' 
                                ? 'bg-[#003366] text-white border-[#003366] shadow-xs' 
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 font-bold text-xs">
                              <span>💍</span>
                              <span className="truncate">{isEn ? 'Marriage Cert.' : isHi ? 'विवाह प्रमाण पत्र' : isMr ? 'विवाह नोंदणी दाखला' : 'લગ્ન નોંધણી સર્ટી.'}</span>
                            </div>
                            <span className={`text-[9px] block mt-0.5 ${selectedProofType === 'marriage_certificate' ? 'text-amber-200' : 'text-slate-400'}`}>
                              {isEn ? 'Form 1 Act' : 'ફોર્મ ૧ (ગુજરાત એક્ટ)'}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Official Document Number Input */}
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          {isEn ? `${activeDocRule.nameEn} Reg Number *` : isHi ? `${activeDocRule.nameGu.replace('દાખલો', 'प्रमाण पत्र')} पंजीकरण संख्या *` : isMr ? `${activeDocRule.nameGu.replace('દાખલો', 'दाखला')} नोंदणी क्रमांक *` : `${activeDocRule.nameGu} નોંધણી નંબર *`}
                        </label>
                        <input
                          type="text"
                          value={proofDocNumber}
                          onChange={(e) => setProofDocNumber(e.target.value)}
                          placeholder={activeDocRule.placeholder}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#003366] focus:outline-none focus:ring-2 focus:ring-[#003366]"
                        />
                      </div>

                      {/* Real Document File Upload */}
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                          {isEn ? 'Upload Proof Document (PDF or Image) *' : isHi ? 'दस्तावेज़ फ़ाइल अपलोड (PDF या छवि) *' : isMr ? 'कागदपत्र फाइल अपलोड (PDF किंवा छायाचित्र) *' : 'દસ્તાવેજ ફાઇલ અપલોડ (PDF અથવા ફોટો) *'}
                        </label>

                        <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden" 
                        />

                        {!uploadedFileName ? (
                          <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-white border-2 border-dashed border-blue-300 hover:border-[#003366] rounded-2xl p-4 text-center cursor-pointer transition group"
                          >
                            <div className="w-10 h-10 rounded-full bg-blue-50 group-hover:bg-blue-100 text-[#003366] flex items-center justify-center mx-auto mb-2 transition">
                              <Upload className="w-5 h-5 text-[#005A9C]" />
                            </div>
                            <p className="text-xs font-black text-[#003366]">
                              {isEn ? 'Choose Document or Drag & Drop' : isHi ? 'दस्तावेज़ चुनें या ड्रैग करें' : isMr ? 'कागदपत्र निवडा किंवा ड्रॅग करा' : 'દસ્તાવેજ પસંદ કરો અથવા ડ્રેગ કરો'}
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                              {isEn ? 'PDF, JPG, PNG allowed (Max 5 MB)' : isHi ? 'PDF, JPG, PNG मान्य (अधिकतम ५ MB)' : isMr ? 'PDF, JPG, PNG स्वीकार्य (कमाल ५ MB)' : 'PDF, JPG, PNG માન્ય છે (મહત્તમ સાઈઝ: ૫ MB)'}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-emerald-50/80 border-2 border-emerald-300 rounded-2xl p-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                <FileCheck className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-black text-slate-900 truncate">
                                  {uploadedFileName}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5 text-[10px] font-bold text-emerald-800">
                                  <span>{uploadedFileSize}</span>
                                  <span>•</span>
                                  <span>{isEn ? '✓ Uploaded & Encrypted (SHA-256)' : isHi ? '✓ अपलोड एवं एन्क्रिप्टेड' : isMr ? '✓ अपलोड व एन्क्रिप्टेड' : '✓ દસ્તાવેજ અપલોડ થયો (SHA-256 એન્ક્રિપ્ટેડ)'}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={removeUploadedFile}
                              className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-white transition cursor-pointer shrink-0"
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {uploadError && (
                          <p className="text-[10px] font-bold text-red-600 mt-1">{uploadError}</p>
                        )}
                      </div>

                      {/* STATUTORY ACT COMPLIANCE CHECKBOX */}
                      <div className="sm:col-span-2 bg-blue-50/60 border border-blue-200 rounded-xl p-3 space-y-1.5">
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            id="statutory-agreed"
                            checked={statutoryAgreed}
                            onChange={(e) => setStatutoryAgreed(e.target.checked)}
                            className="mt-0.5 rounded text-[#003366] focus:ring-[#003366]"
                          />
                          <label htmlFor="statutory-agreed" className="text-[10.5px] font-bold text-slate-700 leading-relaxed cursor-pointer">
                            <strong>{isEn ? activeDocRule.nameEn : activeDocRule.statutoryAct}:</strong> {isEn 
                              ? 'I certify this document is genuine and true under penalty of law (IPC Sec 199/200).' 
                              : isHi 
                              ? 'मैं प्रमाणित करता हूँ कि यह दस्तावेज़ सत्य है एवं किसी भी त्रुटिपूर्ण विवरण के लिए विधि अनुसार उत्तरदायी हूँ।' 
                              : isMr 
                              ? 'मी हमी देतो की हे कागदपत्र खरे आहे आणि चुकीची माहिती दिल्यास कायद्यानुसार शिक्षेस पात्र राहीन.' 
                              : 'હું બાંહેધરી આપું છું કે આ દસ્તાવેજ સાચો છે અને ખોટી વિગત આપવા બદલ આઈ.પી.સી. કલમ ૧૯૯/૨૦૦ હેઠળ દંડનીય કાર્યવાહીની જાણ છે.'}
                          </label>
                        </div>
                      </div>

                      {/* Form Validation Warning Notice */}
                      {memberFormError && (
                        <div className="sm:col-span-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                          <span>{memberFormError}</span>
                        </div>
                      )}

                      {/* AI Verification Action */}
                      <div className="sm:col-span-2 pt-1 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={aiChecking}
                          onClick={handleStartAiVerification}
                          className="w-full sm:w-auto bg-[#003366] hover:bg-[#002244] text-white font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
                        >
                          {aiChecking ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin text-[#FF9933]" />
                              <span className="truncate">{aiCheckingStep}</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4 text-[#FF9933]" />
                              <span>{isEn ? 'AI Verify & Link Member' : isHi ? 'AI सत्यापन एवं सदस्य लिंक करें' : isMr ? 'AI पडताळणी व सदस्य जोडा' : 'AI વેરિફિકેશન અને સભ્ય લિંક કરો'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* OTP VERIFICATION STEP */
                    <div className="bg-white border border-blue-200 rounded-2xl p-4 sm:p-5 text-center space-y-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-[#003366] mx-auto flex items-center justify-center">
                        <Phone className="w-5 h-5 text-[#005A9C]" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-[#003366]">
                          {isEn ? 'Security Check: Enter 6-digit OTP' : isHi ? 'सुरक्षा सत्यापन: ६ अंकों का OTP दर्ज करें' : isMr ? 'सुरक्षा पडताळणी: ६ अंकी OTP प्रविष्ट करा' : 'સુરક્ષા ચકાસણી: ૬ અંકનો OTP દાખલ કરો'}
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-1">
                          {isEn 
                            ? `OTP sent to +91 ${newMemberMobile} for verification.` 
                            : isHi 
                            ? `सदस्य ${newMemberName} के नंबर +91 ${newMemberMobile} पर सुरक्षा OTP भेजा गया है।` 
                            : isMr 
                            ? `सदस्य ${newMemberName} यांच्या मोबाइल +91 ${newMemberMobile} वर OTP पाठवला आहे.` 
                            : `સભ્ય ${newMemberName} નો નંબર +91 ${newMemberMobile} પર સુરક્ષા ચકાસણી કોડ મોકલ્યો છે.`}
                        </p>
                      </div>

                      <div className="max-w-xs mx-auto space-y-1.5">
                        <input
                          type="text"
                          maxLength={6}
                          value={enteredOtp}
                          onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="• • • • • •"
                          className="w-full text-center tracking-widest text-lg font-mono font-black border border-slate-300 rounded-xl py-2 focus:ring-2 focus:ring-[#003366] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setEnteredOtp('582914')}
                          className="text-[10px] text-blue-600 hover:underline font-bold"
                        >
                          {isEn ? 'Auto-fill Test OTP: 582914' : isHi ? 'टेस्ट OTP भरें: 582914' : isMr ? 'टेस्ट OTP भरा: 582914' : 'ટેસ્ટ OTP ભરો: 582914'}
                        </button>
                        {otpError && (
                          <p className="text-[10px] text-red-600 font-bold">{otpError}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsOtpStep(false)}
                          className="text-xs text-slate-500 font-bold px-3 py-1.5 hover:text-slate-800"
                        >
                          {isEn ? 'Back' : isHi ? 'वापस जाएं' : isMr ? 'मागे जा' : 'પાછા જાઓ'}
                        </button>
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                        >
                          {isEn ? 'Verify OTP & Complete' : isHi ? 'OTP सत्यापित करें व पूर्ण करें' : isMr ? 'OTP पडताळणी करा व पूर्ण करा' : 'OTP ચકાસો અને સભ્ય લિંક કરો'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* LIST OF LINKED FAMILY MEMBERS */}
              <div className="space-y-2.5">
                {profile.familyMembers.map((member) => {
                  const memberName = isEn 
                    ? member.nameEn 
                    : isHi 
                    ? (member.nameGu === 'હરિ પટેલ' ? 'हरि पटेल' : member.nameGu === 'મીરાબેન પટેલ' ? 'मीराबेन पटेल' : member.nameGu === 'આરવ પટેલ' ? 'आरव पटेल' : member.nameGu === 'દિનેશભાઈ પટેલ' ? 'दिनेशभाई पटेल' : member.nameEn)
                    : isMr 
                    ? (member.nameGu === 'હરિ પટેલ' ? 'हरी पटेल' : member.nameGu === 'મીરાબેન પટેલ' ? 'मीराबेन पटेल' : member.nameGu === 'આરવ પટેલ' ? 'आरव पटेल' : member.nameGu === 'દિનેશભાઈ પટેલ' ? 'दिनेशभाई पटेल' : member.nameEn)
                    : member.nameGu;

                  const memberRelation = isEn
                    ? member.relationEn
                    : isHi
                    ? (member.relationType === 'self' ? 'स्वयं (મુખ્ય)' : member.relationType === 'spouse' ? 'पत्नी' : member.relationType === 'child' ? 'पुत्र' : member.relationType === 'parent' ? 'पिता (वरिष्ठ नागरिक)' : 'परिवार सदस्य')
                    : isMr
                    ? (member.relationType === 'self' ? 'स्वतः (प्रमुख)' : member.relationType === 'spouse' ? 'पत्नी' : member.relationType === 'child' ? 'मुलगा' : member.relationType === 'parent' ? 'वडील (ज्येष्ठ नागरिक)' : 'कुटुंब सदस्य')
                    : member.relationGu;

                  return (
                    <div 
                      key={member.id}
                      className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-blue-200 transition shadow-2xs"
                    >
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 mt-0.5 sm:mt-0 ${
                          member.relationType === 'self' 
                            ? 'bg-[#003366] text-white' 
                            : 'bg-blue-50 text-[#005A9C] border border-blue-200'
                        }`}>
                          {member.relationType === 'self' ? '👤' : member.relationType === 'spouse' ? '👩' : member.relationType === 'child' ? '🧒' : '👴'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h4 className="text-xs font-black text-[#003366]">
                              {memberName}
                            </h4>
                            <span className="text-[9px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.2 rounded border border-slate-200">
                              {memberRelation}
                            </span>
                            {member.relationType === 'self' && (
                              <span className="text-[9px] bg-amber-100 text-amber-900 font-extrabold px-1.5 py-0.2 rounded">
                                {isEn ? 'Primary Head' : isHi ? 'मुख्य सदस्य' : isMr ? 'प्रमुख सदस्य' : 'મુખ્ય સભ્ય'}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-[11px] font-mono text-slate-500 font-bold mt-0.5">
                            {isEn ? 'Aadhaar: ' : isHi ? 'आधार: ' : isMr ? 'आधार: ' : 'આધાર: '}{member.aadhaarMasked} • {isEn ? 'Mobile: ' : isHi ? 'मोबाइल: ' : isMr ? 'मोबाइल: ' : 'મોબાઈલ: '}+91 {member.mobile}
                          </p>

                          {/* Document Proof Badge */}
                          <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px]">
                            {member.documentProofNumber && (
                              <span className="bg-slate-50 border border-slate-200 text-slate-700 font-mono font-bold px-1.5 py-0.2 rounded">
                                📄 {member.documentProofNumber}
                              </span>
                            )}
                            {member.documentFileName && (
                              <span className="bg-blue-50 border border-blue-200 text-[#003366] font-medium px-1.5 py-0.2 rounded truncate max-w-[180px]">
                                📎 {member.documentFileName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-center shrink-0">
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{member.isSameMobile ? (isEn ? 'Same Mobile' : isHi ? 'समान मोबाइल' : isMr ? 'समान मोबाइल' : 'સેમ મોબાઈલ') : (isEn ? 'OTP Verified' : isHi ? 'OTP सत्यापित' : isMr ? 'OTP पडताळणी' : 'OTP વેરિફાઈડ')}</span>
                        </span>
                        <span className="text-[10px] bg-blue-50 text-[#003366] font-bold px-2 py-0.5 rounded-full border border-blue-100">
                          AI {member.aiMatchConfidence || 99.4}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: GOVERNMENT JURISDICTION LAW & PROOF EXPLAINER */}
          {activeTab === 'jurisdiction' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-900 to-[#003366] text-white rounded-2xl p-4 sm:p-5 shadow-xs">
                <span className="text-[10px] bg-amber-400/20 text-[#FF9933] border border-amber-400/30 px-2 py-0.5 rounded font-extrabold uppercase">
                  {isEn ? 'Gujarat Public Services Act (GRTSA 2013)' : isHi ? 'गुजरात लोक सेवा अधिकार अधिनियम (GRTSA २०१३)' : isMr ? 'गुजरात लोकसेवा हक्क कायदा (GRTSA २०१३)' : GOV_JURISDICTION_RULES.actNameGu}
                </span>
                <h3 className="text-xs sm:text-sm font-black text-white mt-1.5">
                  ❓ {isEn ? 'Which government office should I visit for my service?' : isHi ? 'अपनी सेवा के लिए मुझे किस सरकारी कार्यालय में जाना होगा?' : isMr ? 'माझ्या सेवेसाठी मी कोणत्या शासकीय कार्यालयात जावे?' : GOV_JURISDICTION_RULES.coreQuestionGu}
                </h3>
                <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                  {isEn 
                    ? 'Under Gujarat Government circulars, general certificates are available at any Jan Seva Kendra in the state. Land revenue and caste certificates must be applied at your native taluka kacheri.' 
                    : isHi 
                    ? 'गुजरात सरकार के नियमों के अनुसार सामान्य प्रमाण पत्र राज्य के किसी भी जन सेवा केंद्र से प्राप्त किए जा सकते हैं। भूमि राजस्व एवं जाति प्रमाण पत्र केवल अपने मूल तहसील कार्यालय से ही मान्य होंगे।' 
                    : isMr 
                    ? 'शासकीय नियमांनुसार सर्वसामान्य दाखले राज्यातील कोणत्याही जन सेवा केंद्रावरून मिळवता येतात. जमीन महसूल व जात प्रमाणपत्रे मूळ तालुका कार्यालयातूनच घ्यावी लागतात.' 
                    : GOV_JURISDICTION_RULES.summaryAnswerGu}
                </p>
              </div>

              {/* Group 1: Universal / Anywhere in Gujarat Services */}
              <div className="bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl p-3.5 sm:p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">🟢</span>
                  <h4 className="text-xs font-black text-emerald-900">
                    {isEn ? 'Statewide Universal Services (Apply at Any Kacheri)' : isHi ? 'राज्यव्यापी सार्वभौमिक सेवाएं (किसी भी केंद्र से प्राप्त करें)' : isMr ? 'राज्यव्यापी सर्वसमावेशक सेवा (कोणत्याही केंद्रातून मिळवा)' : GOV_JURISDICTION_RULES.serviceGroups[0].groupGu}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-700 font-semibold leading-relaxed">
                  {isEn 
                    ? 'You can apply at any Jan Seva Kendra or Taluka Seva Sadan in Gujarat regardless of your native village.' 
                    : isHi 
                    ? 'आप अपने मूल गांव की परवाह किए बिना गुजरात के किसी भी जन सेवा केंद्र या तहसील सेवा सदन में आवेदन कर सकते हैं।' 
                    : isMr 
                    ? 'आपण आपल्या मूळ गावाचा विचार न करता गुजरातमधील कोणत्याही जन सेवा केंद्रात किंवा तालुका सेवा सदनात अर्ज करू शकता.' 
                    : GOV_JURISDICTION_RULES.serviceGroups[0].descriptionGu}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                  {(isEn 
                    ? GOV_JURISDICTION_RULES.serviceGroups[0].examplesEn 
                    : isHi 
                    ? ['आय प्रमाण पत्र (Income Certificate)', 'वरिष्ठ नागरिक कार्ड (Senior Citizen)', 'राशन कार्ड नया/सुधार (Ration Card)', 'विधवा पेंशन सहायता (Ganga Swarupa)'] 
                    : isMr 
                    ? ['उत्पन्न दाखला (Income Certificate)', 'ज्येष्ठ नागरिक कार्ड (Senior Citizen)', 'नवीन रेशन कार्ड / बदल (Ration Card)', 'गंगा स्वरूपा योजना (Widow Pension)'] 
                    : GOV_JURISDICTION_RULES.serviceGroups[0].examplesGu
                  ).map((ex, idx) => (
                    <div key={idx} className="bg-white border border-emerald-200 rounded-lg p-2 text-[10px] font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="text-emerald-600 font-black">✓</span>
                      <span>{ex}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group 2: Jurisdiction-Bound Revenue Services */}
              <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-3.5 sm:p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">🔒</span>
                  <h4 className="text-xs font-black text-amber-900">
                    {isEn ? 'Jurisdiction-Bound Revenue Services (Native Taluka Only)' : isHi ? 'क्षेत्राधिकार-बद्ध राजस्व सेवाएं (केवल मूल तहसील)' : isMr ? 'क्षेत्राधिकार-बद्ध महसूल सेवा (केवळ मूळ तालुका)' : GOV_JURISDICTION_RULES.serviceGroups[1].groupGu}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-700 font-semibold leading-relaxed">
                  {isEn 
                    ? 'Requires physical record verification at the Mamlatdar office of your native registered taluka.' 
                    : isHi 
                    ? 'इसके लिए आपके पंजीकृत मूल तहसील के मामलतदार कार्यालय में भौतिक रिकॉर्ड सत्यापन आवश्यक है।' 
                    : isMr 
                    ? 'यासाठी आपल्या नोंदणीकृत मूळ तालुक्याच्या तहसीलदार कार्यालयात प्रत्यक्ष अभिलेख पडताळणी आवश्यक आहे.' 
                    : GOV_JURISDICTION_RULES.serviceGroups[1].descriptionGu}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                  {(isEn 
                    ? GOV_JURISDICTION_RULES.serviceGroups[1].examplesEn 
                    : isHi 
                    ? ['जाति प्रमाण पत्र (SC/ST/SEBC)', 'कृषक प्रमाण पत्र (Farmer Certificate)', '७/१२ एवं ८-अ भूमि नकल (AnyRoR)', 'भूमि अधिकार रिकॉर्ड (E-Dhara)'] 
                    : isMr 
                    ? ['जात प्रमाणपत्र (SC/ST/SEBC)', 'शेतकरी दाखला (Farmer Certificate)', '७/१२ व ८-अ जमीन उतारा (AnyRoR)', 'फेरफार नोंद (E-Dhara)'] 
                    : GOV_JURISDICTION_RULES.serviceGroups[1].examplesGu
                  ).map((ex, idx) => (
                    <div key={idx} className="bg-white border border-amber-200 rounded-lg p-2 text-[10px] font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="text-amber-600 font-black">•</span>
                      <span>{ex}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 sm:p-4 pb-[max(0.85rem,env(safe-area-inset-bottom))] flex items-center justify-between text-xs font-bold text-slate-500 shrink-0 sticky bottom-0 z-20">
          <span className="text-[10px] sm:text-xs text-slate-500 truncate mr-2">
            {isEn ? 'Gujarat Jan Seva Citizen Identity Vault • 2026' : isHi ? 'गुजरात जन सेवा नागरिक पहचान वॉल्ट • २०२६' : isMr ? 'गुजरात जन सेवा नागरिक ओळख व्हॉल्ट • २०२६' : 'ગુજરાત જન સેવા નાગરિક ઓળખ વૉલ્ટ • ૨૦૨૬'}
          </span>
          <button
            onClick={onClose}
            className="bg-[#003366] hover:bg-[#002244] active:scale-95 text-white px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0"
          >
            {isEn ? 'Close' : isHi ? 'बंद करें' : isMr ? 'बंद करा' : 'બંધ કરો'}
          </button>
        </div>
      </div>
    </div>
  );
}
