'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, UserCheck, Users, Plus, Phone, FileText, 
  MapPin, CheckCircle2, AlertTriangle, Sparkles, Lock, ArrowRight,
  Fingerprint, HelpCircle, RefreshCw, Compass
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { speakGuidance } from '@/lib/voice';
import { 
  DEFAULT_CITIZEN_PROFILE, 
  FamilyMember, 
  CitizenAadhaarProfile,
  GOV_JURISDICTION_RULES 
} from '@/lib/citizen-profile';
import { Language } from '@/lib/translations';
import { GovLogo } from '@/components/GovLogo';

interface CitizenProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
  onOpenLocationRadar?: () => void;
}

export function CitizenProfileModal({
  isOpen,
  onClose,
  lang = 'gu',
  onOpenLocationRadar
}: CitizenProfileModalProps) {
  const [profile, setProfile] = useState<CitizenAadhaarProfile>(DEFAULT_CITIZEN_PROFILE);
  const [activeTab, setActiveTab] = useState<'overview' | 'family' | 'jurisdiction'>('overview');
  
  // Add Member State
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberAadhaar, setNewMemberAadhaar] = useState('');
  const [newMemberMobile, setNewMemberMobile] = useState('');
  const [newMemberRelation, setNewMemberRelation] = useState<'spouse' | 'child' | 'parent' | 'sibling'>('child');
  const [selectedProofType, setSelectedProofType] = useState<'ration_card' | 'birth_certificate' | 'marriage_certificate'>('ration_card');
  const [proofDocNumber, setProofDocNumber] = useState('RC-NFSA-GJ-10948271');
  
  // Verification States
  const [aiChecking, setAiChecking] = useState(false);
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);

  // Live Location State
  const [liveLocation, setLiveLocation] = useState<{
    latitude: number;
    longitude: number;
    displayGu: string;
    displayEn: string;
    accuracyMeters: number;
    isGpsLive: boolean;
  }>({
    latitude: 21.9619,
    longitude: 70.7923,
    displayGu: 'ગોંડલ બસ સ્ટેન્ડ નજીક, રાજકોટ',
    displayEn: 'Near Gondal Bus Station, Rajkot',
    accuracyMeters: 8,
    isGpsLive: false
  });

  // Attempt real browser GPS geolocation on open
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLiveLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            displayGu: 'ગોંડલ / રાજકોટ લાઈવ પરિસર (GPS ચોક્કસ)',
            displayEn: 'Gondal / Rajkot Live Area (GPS Precise)',
            accuracyMeters: Math.round(position.coords.accuracy) || 6,
            isGpsLive: true
          });
        },
        () => {
          // Fallback to Gondal coordinates
          setLiveLocation(prev => ({ ...prev, isGpsLive: false }));
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isDifferentMobile = newMemberMobile.trim() !== '' && newMemberMobile.trim() !== profile.mobile;

  // Handle Adding Member
  const handleStartAiVerification = () => {
    if (!newMemberName.trim() || newMemberAadhaar.length < 4) {
      alert(lang === 'gu' ? 'કૃપા કરીને સભ્યનું નામ અને આધારના છેલ્લા ૪ અંક દાખલ કરો.' : 'Please enter member name and Aadhaar digits.');
      return;
    }

    triggerHaptic('tap');
    setAiChecking(true);
    setAiConfidence(null);
    setOtpError(null);

    // Simulate AI document cross-reference with Gujarat Civil Supplies / NFSA Database
    setTimeout(() => {
      setAiChecking(false);
      setAiConfidence(99.4);
      triggerHaptic('success');

      if (isDifferentMobile) {
        setIsOtpStep(true);
        speakGuidance(lang === 'gu' 
          ? `દસ્તાવેજ મેચ થયો! સુરક્ષા માટે ${newMemberMobile} પર મોકલેલ ૬ અંકનો OTP દાખલ કરો.` 
          : 'Document matched! Enter 6-digit OTP sent to member mobile.');
      } else {
        // Same mobile - auto-verified
        finalizeAddMember();
      }
    }, 1200);
  };

  const finalizeAddMember = () => {
    triggerHaptic('success');
    const newId = `mem-${Date.now()}`;
    const relationGuMap = {
      spouse: 'પત્ની',
      child: 'પુત્ર / પુત્રી',
      parent: 'માતા / પિતા',
      sibling: 'ભાઈ / બહેન'
    };
    const relationEnMap = {
      spouse: 'Spouse',
      child: 'Child',
      parent: 'Parent',
      sibling: 'Sibling'
    };

    const newMem: FamilyMember = {
      id: newId,
      nameGu: newMemberName,
      nameEn: newMemberName,
      relationGu: relationGuMap[newMemberRelation],
      relationEn: relationEnMap[newMemberRelation],
      relationType: newMemberRelation,
      aadhaarMasked: `XXXX XXXX ${newMemberAadhaar.slice(-4)}`,
      mobile: newMemberMobile.trim() || profile.mobile,
      isSameMobile: !isDifferentMobile,
      status: 'verified',
      documentProofType: selectedProofType,
      documentProofNumber: proofDocNumber,
      aiMatchConfidence: 99.4,
      addedAt: '2026-03-01'
    };

    setProfile(prev => ({
      ...prev,
      familyMembers: [...prev.familyMembers, newMem]
    }));

    speakGuidance(lang === 'gu' 
      ? `સભ્ય ${newMemberName} સફળતાપૂર્વક પરિવારમાં લિંક થયા!` 
      : `Member ${newMemberName} successfully linked to family!`);

    // Reset Form
    setIsAddingMember(false);
    setIsOtpStep(false);
    setNewMemberName('');
    setNewMemberAadhaar('');
    setNewMemberMobile('');
    setEnteredOtp('');
    setAiConfidence(null);
  };

  const handleVerifyOtp = () => {
    if (enteredOtp.length < 4) {
      setOtpError(lang === 'gu' ? 'કૃપા કરીને માન્ય ૪ થી ૬ અંકનો OTP દાખલ કરો.' : 'Please enter valid OTP.');
      triggerHaptic('warning');
      return;
    }
    finalizeAddMember();
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 modal-backdrop animate-in fade-in duration-150"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col border border-slate-200"
      >
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-[#003366] via-[#004080] to-[#005A9C] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <GovLogo className="w-10 h-10 drop-shadow-md shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-400/20 text-[#FF9933] border border-amber-400/30 px-2 py-0.5 rounded">
                  {lang === 'gu' ? 'સત્તાવાર નાગરિક ઓળખ વૉલ્ટ' : 'Official Citizen Identity Vault'}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded font-bold font-mono">
                  {lang === 'gu' ? 'આધાર પ્રમાણિત' : 'Aadhaar Verified'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                {lang === 'gu' ? `${profile.nameGu} • નાગરિક પ્રોફાઇલ અને પરિવાર` : `${profile.nameEn} • Citizen Profile & Family`}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TAB NAVIGATION */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              triggerHaptic('tap');
              setActiveTab('overview');
            }}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#003366] text-[#003366] font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#FF9933]" />
            <span>{lang === 'gu' ? 'આધાર સરનામું & લાઈવ GPS' : 'Aadhaar Address & GPS'}</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('tap');
              setActiveTab('family');
            }}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'family'
                ? 'border-[#003366] text-[#003366] font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#138808]" />
            <span>{lang === 'gu' ? `પરિવારના સભ્યો (${profile.familyMembers.length})` : `Family Vault (${profile.familyMembers.length})`}</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('tap');
              setActiveTab('jurisdiction');
            }}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'jurisdiction'
                ? 'border-[#003366] text-[#003366] font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
            <span>{lang === 'gu' ? 'સરકારી નિયમ (તાલુકા પ્રૂફ)' : 'Gov Rules & Proof'}</span>
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* TAB 1: OVERVIEW & LOCATION COMPARISON */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              
              {/* Card 1: Official Aadhaar Card Banner */}
              <div className="bg-gradient-to-br from-amber-50/70 via-white to-blue-50/50 border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="w-5 h-5 text-[#FF9933]" />
                    <span className="font-extrabold text-[#003366] text-xs uppercase tracking-wider">
                      {lang === 'gu' ? 'ભારતીય વિશિષ્ટ ઓળખ સત્તામંડળ (UIDAI) • ગુજરાત સર્કલ' : 'Unique Identification Authority of India (UIDAI) • Gujarat'}
                    </span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                    <span>{lang === 'gu' ? 'પ્રમાણિત આધાર' : 'Verified Aadhaar'}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{lang === 'gu' ? 'નાગરિકનું નામ' : 'Citizen Name'}</span>
                    <p className="text-sm font-black text-[#003366] mt-0.5">{lang === 'gu' ? profile.nameGu : profile.nameEn}</p>
                    <p className="text-[11px] font-mono text-slate-500 font-bold mt-1">{profile.aadhaarMasked}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{lang === 'gu' ? 'લિંક થયેલ મોબાઈલ' : 'Linked Mobile'}</span>
                    <p className="text-sm font-black text-[#003366] mt-0.5 font-mono">+91 {profile.mobile}</p>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">
                      ✓ OTP સક્રિય
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{lang === 'gu' ? 'મૂળ કાર્યક્ષેત્ર' : 'Native Jurisdiction'}</span>
                    <p className="text-sm font-black text-[#003366] mt-0.5">
                      {lang === 'gu' ? `${profile.talukaGu}, ${profile.districtGu}` : `${profile.talukaEn}, ${profile.districtEn}`}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">{lang === 'gu' ? `ગામ: ${profile.villageGu}` : `Village: ${profile.villageEn}`}</p>
                  </div>
                </div>
              </div>

              {/* Card 2: Two-Column Location Comparison (Aadhaar Registered vs Live GPS) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Column A: Aadhaar Registered Address */}
                <div className="bg-white border-2 border-blue-200 rounded-2xl p-4 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-blue-100">
                    <span className="text-xs font-black text-[#003366] flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#005A9C]" />
                      <span>{lang === 'gu' ? 'આધાર કાર્ડ નોંધાયેલ સરનામું' : 'Aadhaar Registered Address'}</span>
                    </span>
                    <span className="text-[9px] bg-blue-100 text-[#003366] font-bold px-1.5 py-0.5 rounded">
                      કાયમી
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-bold mt-2.5 leading-relaxed">
                    {lang === 'gu' ? profile.fullAddressGu : profile.fullAddressEn}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between font-bold">
                    <span>તાલુકો: <strong>{lang === 'gu' ? profile.talukaGu : profile.talukaEn}</strong></span>
                    <span>પિનકોડ: <strong>{profile.pincode}</strong></span>
                  </div>
                </div>

                {/* Column B: Real-Time Live GPS Location */}
                <div className="bg-white border-2 border-emerald-300 rounded-2xl p-4 shadow-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                    <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-emerald-600 animate-spin" />
                      <span>{lang === 'gu' ? 'તમારું હાલનું લાઈવ GPS લોકેશન' : 'Current Live GPS Location'}</span>
                    </span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      <span>{liveLocation.isGpsLive ? 'GPS લાઈવ' : 'સિસ્ટમ લાઈવ'}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-800 font-black mt-2.5 leading-relaxed">
                    📍 {lang === 'gu' ? liveLocation.displayGu : liveLocation.displayEn}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between font-bold">
                    <span>ચોક્કસાઈ: <strong>±{liveLocation.accuracyMeters} મીટર</strong></span>
                    <span>અક્ષાંશ/રેખાંશ: <strong className="font-mono">{liveLocation.latitude.toFixed(3)}, {liveLocation.longitude.toFixed(3)}</strong></span>
                  </div>
                </div>
              </div>

              {/* Callout Action to Open Smart Location Radar */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#003366] text-white flex items-center justify-center shrink-0">
                    <Compass className="w-5 h-5 text-[#FF9933]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-[#003366]">
                      {lang === 'gu' ? 'નજીકની કચેરીઓ અને મુક્ત કાઉન્ટર રડાર' : 'Nearby Kacheris & Free Desk Radar'}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      {lang === 'gu' ? 'તમારા લાઈવ લોકેશનથી કઈ કચેરી સૌથી નજીક છે અને ક્યાં ઓછા ટોકન/ભીડ છે તે સરખાવો.' : 'Compare nearby centers to find fastest wait times and free desks.'}
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
                    className="bg-[#003366] hover:bg-[#002244] text-white text-xs font-extrabold px-3.5 py-2 rounded-xl transition active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                  >
                    <span>{lang === 'gu' ? 'કચેરી રડાર સરખાવો' : 'Open Location Radar'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#FF9933]" />
                  </button>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: FAMILY MEMBERS VAULT */}
          {activeTab === 'family' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-[#003366]">
                    {lang === 'gu' ? 'પરિવાર આધાર વૉલ્ટ (Family Linked Members)' : 'Family Linked Members Vault'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {lang === 'gu' 
                      ? 'એક મોબાઈલ નંબર પર લિંક થયેલા પરિવારજનો તથા રેશનકાર્ડ પ્રમાણિત સભ્યો' 
                      : 'Family members linked under same mobile and verified by ration card'}
                  </p>
                </div>

                {!isAddingMember && (
                  <button
                    onClick={() => {
                      triggerHaptic('tap');
                      setIsAddingMember(true);
                    }}
                    className="bg-[#138808] hover:bg-emerald-700 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{lang === 'gu' ? 'નવા સભ્ય ઉમેરો' : 'Add Family Member'}</span>
                  </button>
                )}
              </div>

              {/* ADD MEMBER FORM (IF ACTIVE) */}
              {isAddingMember && (
                <div className="bg-amber-50/60 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 space-y-4 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                    <span className="text-xs font-black text-[#003366] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#FF9933]" />
                      <span>{lang === 'gu' ? 'પરિવારમાં નવા સભ્ય ઉમેરો (AI દસ્તાવેજ ચકાસણી)' : 'Add Family Member (AI Cross-Verification)'}</span>
                    </span>
                    <button
                      onClick={() => setIsAddingMember(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                    >
                      {lang === 'gu' ? 'રદ કરો' : 'Cancel'}
                    </button>
                  </div>

                  {!isOtpStep ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          {lang === 'gu' ? 'સભ્યનું પૂરું નામ *' : 'Full Name *'}
                        </label>
                        <input
                          type="text"
                          value={newMemberName}
                          onChange={(e) => setNewMemberName(e.target.value)}
                          placeholder={lang === 'gu' ? 'દા.ત. મીરાબેન પટેલ' : 'e.g. Miraben Patel'}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-[#003366] focus:outline-none focus:ring-2 focus:ring-[#003366]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          {lang === 'gu' ? 'સંબંધ (Relation) *' : 'Relationship *'}
                        </label>
                        <select
                          value={newMemberRelation}
                          onChange={(e) => setNewMemberRelation(e.target.value as any)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-[#003366] focus:outline-none focus:ring-2 focus:ring-[#003366]"
                        >
                          <option value="spouse">{lang === 'gu' ? 'પત્ની / પતિ (Spouse)' : 'Spouse'}</option>
                          <option value="child">{lang === 'gu' ? 'પુત્ર / પુત્રી (Child)' : 'Child'}</option>
                          <option value="parent">{lang === 'gu' ? 'માતા / પિતા (Parent)' : 'Parent'}</option>
                          <option value="sibling">{lang === 'gu' ? 'ભાઈ / બહેન (Sibling)' : 'Sibling'}</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          {lang === 'gu' ? 'આધાર કાર્ડ નંબર (છેલ્લા ૪ અંક) *' : 'Aadhaar Number (Last 4 Digits) *'}
                        </label>
                        <input
                          type="text"
                          maxLength={4}
                          value={newMemberAadhaar}
                          onChange={(e) => setNewMemberAadhaar(e.target.value.replace(/\D/g, ''))}
                          placeholder="દા.ત. 5521"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#003366] focus:outline-none focus:ring-2 focus:ring-[#003366]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          {lang === 'gu' ? 'મોબાઈલ નંબર (ખાલી રાખશો તો સેમ નંબર ગણાશે)' : 'Mobile (Empty = Same Number)'}
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

                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          {lang === 'gu' ? 'સરકારી પ્રમાણિત દસ્તાવેજ (કુટુંબ પુરાવો) *' : 'Government Family Proof Document *'}
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedProofType('ration_card')}
                            className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                              selectedProofType === 'ration_card' 
                                ? 'bg-[#003366] text-white border-[#003366]' 
                                : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            <span>🍚</span>
                            <span>{lang === 'gu' ? 'રેશનકાર્ડ (NFSA)' : 'Ration Card'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedProofType('birth_certificate')}
                            className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                              selectedProofType === 'birth_certificate' 
                                ? 'bg-[#003366] text-white border-[#003366]' 
                                : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            <span>👶</span>
                            <span>{lang === 'gu' ? 'જન્મ પ્રમાણપત્ર' : 'Birth Cert.'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedProofType('marriage_certificate')}
                            className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                              selectedProofType === 'marriage_certificate' 
                                ? 'bg-[#003366] text-white border-[#003366]' 
                                : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            <span>💍</span>
                            <span>{lang === 'gu' ? 'લગ્ન નોંધણી' : 'Marriage Cert.'}</span>
                          </button>
                        </div>
                      </div>

                      <div className="sm:col-span-2 pt-2 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={aiChecking}
                          onClick={handleStartAiVerification}
                          className="bg-[#003366] hover:bg-[#002244] text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
                        >
                          {aiChecking ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FF9933]" />
                              <span>{lang === 'gu' ? 'AI પરિવાર ડેટા ક્રોસ-ચેક થઈ રહ્યો છે...' : 'AI Cross-Verifying Database...'}</span>
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="w-4 h-4 text-[#FF9933]" />
                              <span>{lang === 'gu' ? 'AI વેરિફિકેશન અને સભ્ય લિંક કરો' : 'Verify & Link Member'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* OTP VERIFICATION STEP FOR SEPARATE PHONE */
                    <div className="bg-white border border-blue-200 rounded-xl p-4 text-center space-y-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-[#003366] mx-auto flex items-center justify-center">
                        <Phone className="w-5 h-5 text-[#005A9C]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-[#003366]">
                          {lang === 'gu' ? 'અલગ મોબાઈલ નંબર સુરક્ષા ચકાસણી (OTP Verification)' : 'Separate Mobile Security Check (OTP)'}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {lang === 'gu' 
                            ? `સભ્ય ${newMemberName} નો નંબર ${newMemberMobile} અલગ હોવાથી સિક્યોરિટી માટે OTP મોકલવામાં આવ્યો છે.` 
                            : `OTP sent to ${newMemberMobile} for authorization.`}
                        </p>
                      </div>

                      <div className="max-w-xs mx-auto">
                        <input
                          type="text"
                          maxLength={6}
                          value={enteredOtp}
                          onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="દા.ત. 123456"
                          className="w-full text-center tracking-widest text-lg font-mono font-black border border-slate-300 rounded-xl py-2 focus:ring-2 focus:ring-[#003366] focus:outline-none"
                        />
                        {otpError && (
                          <p className="text-[10px] text-red-600 font-bold mt-1">{otpError}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsOtpStep(false)}
                          className="text-xs text-slate-500 font-bold px-3 py-1.5"
                        >
                          {lang === 'gu' ? 'પાછા જાઓ' : 'Back'}
                        </button>
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                        >
                          {lang === 'gu' ? 'OTP ચકાસો અને સભ્ય લિંક કરો' : 'Verify OTP & Complete'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* LIST OF LINKED FAMILY MEMBERS */}
              <div className="space-y-2.5">
                {profile.familyMembers.map((member) => (
                  <div 
                    key={member.id}
                    className="bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-blue-200 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                        member.relationType === 'self' 
                          ? 'bg-[#003366] text-white' 
                          : 'bg-blue-50 text-[#005A9C] border border-blue-200'
                      }`}>
                        {member.relationType === 'self' ? '👤' : member.relationType === 'spouse' ? '👩' : member.relationType === 'child' ? '🧒' : '👴'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-[#003366]">
                            {lang === 'gu' ? member.nameGu : member.nameEn}
                          </h4>
                          <span className="text-[9px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.2 rounded border border-slate-200">
                            {lang === 'gu' ? member.relationGu : member.relationEn}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-500 font-bold mt-0.5">
                          આધાર: {member.aadhaarMasked} • મોબાઈલ: +91 {member.mobile}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{member.isSameMobile ? (lang === 'gu' ? 'સેમ મોબાઈલ લિંક્ડ' : 'Same Mobile') : (lang === 'gu' ? 'OTP વેરિફાઈડ' : 'OTP Verified')}</span>
                      </span>
                      <span className="text-[10px] bg-blue-50 text-[#003366] font-bold px-2 py-0.5 rounded-full border border-blue-100">
                        AI {member.aiMatchConfidence || 99.4}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: GOVERNMENT JURISDICTION LAW & PROOF EXPLAINER */}
          {activeTab === 'jurisdiction' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-900 to-[#003366] text-white rounded-2xl p-4 sm:p-5 shadow-xs">
                <span className="text-[10px] bg-amber-400/20 text-[#FF9933] border border-amber-400/30 px-2 py-0.5 rounded font-extrabold uppercase">
                  {GOV_JURISDICTION_RULES.actNameGu}
                </span>
                <h3 className="text-sm sm:text-base font-black text-white mt-1.5">
                  ❓ {GOV_JURISDICTION_RULES.coreQuestionGu}
                </h3>
                <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                  {GOV_JURISDICTION_RULES.summaryAnswerGu}
                </p>
              </div>

              {/* Group 1: Universal / Anywhere in Gujarat Services */}
              <div className="bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">🟢</span>
                  <h4 className="text-xs font-black text-emerald-900">
                    {GOV_JURISDICTION_RULES.serviceGroups[0].groupGu}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-700 font-semibold leading-relaxed">
                  {GOV_JURISDICTION_RULES.serviceGroups[0].descriptionGu}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                  {GOV_JURISDICTION_RULES.serviceGroups[0].examplesGu.map((ex, idx) => (
                    <div key={idx} className="bg-white border border-emerald-200 rounded-lg p-2 text-[10px] font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="text-emerald-600 font-black">✓</span>
                      <span>{ex}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group 2: Jurisdiction-Bound Revenue Services */}
              <div className="bg-amber-50/80 border-2 border-amber-300 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">🔒</span>
                  <h4 className="text-xs font-black text-amber-900">
                    {GOV_JURISDICTION_RULES.serviceGroups[1].groupGu}
                  </h4>
                </div>
                <p className="text-[11px] text-slate-700 font-semibold leading-relaxed">
                  {GOV_JURISDICTION_RULES.serviceGroups[1].descriptionGu}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                  {GOV_JURISDICTION_RULES.serviceGroups[1].examplesGu.map((ex, idx) => (
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
        <div className="bg-slate-50 border-t border-slate-200 p-3 sm:p-4 flex items-center justify-between text-xs font-bold text-slate-500 shrink-0">
          <span>Gujarat Jan Seva Citizen Identity Vault • 2026</span>
          <button
            onClick={onClose}
            className="bg-[#003366] hover:bg-[#002244] text-white px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer"
          >
            {lang === 'gu' ? 'બંધ કરો' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
