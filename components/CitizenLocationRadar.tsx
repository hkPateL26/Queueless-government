'use client';

import React, { useState, useEffect } from 'react';
import { 
  MapPin, Compass, Navigation, Clock, Users, ShieldCheck, 
  Sparkles, CheckCircle2, ArrowRight, ExternalLink, RefreshCw,
  Building, Calendar, ChevronRight, AlertCircle, Info, X
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { speakGuidance } from '@/lib/voice';
import { 
  DEFAULT_CITIZEN_PROFILE, 
  NEARBY_KACHERIS_DATA, 
  NearbyKacheriInfo,
  getDynamicNearbyKacheris,
  getLiveReverseGeocodedLocation
} from '@/lib/citizen-profile';
import { Language } from '@/lib/translations';

interface CitizenLocationRadarProps {
  isOpen?: boolean;
  onClose?: () => void;
  lang?: Language;
  onSelectKacheriForBooking?: (kacheriId: string, talukaId: string) => void;
  isStandaloneCard?: boolean;
  isLoggedIn?: boolean;
}

export function CitizenLocationRadar({
  isOpen = true,
  onClose,
  lang = 'gu',
  onSelectKacheriForBooking,
  isStandaloneCard = false,
  isLoggedIn = false
}: CitizenLocationRadarProps) {
  const [kacheris, setKacheris] = useState<NearbyKacheriInfo[]>(NEARBY_KACHERIS_DATA);
  const [selectedKacheriId, setSelectedKacheriId] = useState<string>(NEARBY_KACHERIS_DATA[0]?.id || 'kacheri-gondal');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isEn = lang === 'en';
  const isHi = lang === 'hi';
  const isMr = lang === 'mr';
  const isKhi = lang === 'khi';
  const isGu = lang === 'gu' || lang === 'khi';

  // Live Location State with Dynamic Reverse Geocoding
  const [gpsState, setGpsState] = useState<{
    latitude: number;
    longitude: number;
    displayGu: string;
    displayEn: string;
    displayHi: string;
    displayMr: string;
    accuracyMeters: number;
    isLive: boolean;
  }>({
    latitude: 21.9619,
    longitude: 70.7923,
    displayGu: 'ગોંડલ ટાઉન / સ્ટેશન રોડ, જિલ્લો: રાજકોટ',
    displayEn: 'Gondal Town / Station Rd, District: Rajkot',
    displayHi: 'गोंडल टाउन / स्टेशन रोड, जिला: राजकोट',
    displayMr: 'गोंडल शहर / स्टेशन रोड, जिल्हा: राजकोट',
    accuracyMeters: 6,
    isLive: false
  });

  // Body scroll lock on modal open
  useEffect(() => {
    if (isOpen && !isStandaloneCard) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [isOpen, isStandaloneCard]);

  // Dynamic GPS and Nearest Kacheri Calculation
  const refreshLocation = async () => {
    triggerHaptic('tap');
    setIsRefreshing(true);

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const accuracy = Math.round(pos.coords.accuracy) || 5;

          // Compute dynamic nearest kacheris from real coordinates
          const dynamicKacheris = getDynamicNearbyKacheris(lat, lon);
          setKacheris(dynamicKacheris);
          if (dynamicKacheris.length > 0) {
            setSelectedKacheriId(dynamicKacheris[0].id);
          }

          // Fetch dynamic reverse geocoded address
          try {
            const locDetails = await getLiveReverseGeocodedLocation(lat, lon);
            setGpsState({
              latitude: lat,
              longitude: lon,
              displayGu: locDetails.displayGu,
              displayEn: locDetails.displayEn,
              displayHi: locDetails.displayGu.replace('જિલ્લો', 'जिला').replace('તાલુકો', 'तहसील'),
              displayMr: locDetails.displayGu.replace('જિલ્લો', 'जिल्हा').replace('તાલુકો', 'तालुका'),
              accuracyMeters: accuracy,
              isLive: true
            });
          } catch (err) {
            setGpsState({
              latitude: lat,
              longitude: lon,
              displayGu: `અક્ષાંશ: ${lat.toFixed(4)}, રેખાંશ: ${lon.toFixed(4)} (ગુજરાત)`,
              displayEn: `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)} (Gujarat)`,
              displayHi: `अक्षांश: ${lat.toFixed(4)}, देशांतर: ${lon.toFixed(4)} (गुजरात)`,
              displayMr: `अक्षांश: ${lat.toFixed(4)}, रेखांश: ${lon.toFixed(4)} (गुजरात)`,
              accuracyMeters: accuracy,
              isLive: true
            });
          }

          setIsRefreshing(false);
          triggerHaptic('success');
        },
        async () => {
          // Fallback to initial location (e.g. Gondal)
          const fallbackKacheris = getDynamicNearbyKacheris(21.9619, 70.7923);
          setKacheris(fallbackKacheris);
          if (fallbackKacheris.length > 0) {
            setSelectedKacheriId(fallbackKacheris[0].id);
          }
          const locDetails = await getLiveReverseGeocodedLocation(21.9619, 70.7923);
          setGpsState({
            latitude: 21.9619,
            longitude: 70.7923,
            displayGu: locDetails.displayGu,
            displayEn: locDetails.displayEn,
            displayHi: 'गोंडल टाउन / स्टेशन रोड, जिला: राजकोट (गुजरात)',
            displayMr: 'गोंडल शहर / स्टेशन रोड, जिल्हा: राजकोट (गुजरात)',
            accuracyMeters: 10,
            isLive: false
          });
          setIsRefreshing(false);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    if (isOpen && !isStandaloneCard) {
      refreshLocation();
    }
  }, [isOpen, isStandaloneCard]);

  const activeKacheri = kacheris.find(k => k.id === selectedKacheriId) || kacheris[0] || NEARBY_KACHERIS_DATA[0];

  const getLocalizedKacheriName = (k: NearbyKacheriInfo) => {
    if (isEn) return k.nameEn;
    if (isHi) {
      if (k.nameGu.includes('ગોંડલ')) return 'जन सेवा केंद्र — गोंडल';
      if (k.nameGu.includes('રાજકોટ')) return 'मामलतदार कार्यालय — राजकोट दक्षिण';
      if (k.nameGu.includes('કોટડા')) return 'तहसील सेवा सदन — कोटडा सांगाणी';
      return k.nameEn;
    }
    if (isMr) {
      if (k.nameGu.includes('ગોંડલ')) return 'जन सेवा केंद्र — गोंडल';
      if (k.nameGu.includes('રાજકોટ')) return 'मामलतदार कार्यालय — राजकोट दक्षिण';
      if (k.nameGu.includes('કોટડા')) return 'तालुका सेवा सदन — कोटडा सांगाणी';
      return k.nameEn;
    }
    return k.nameGu;
  };

  const getLocalizedTalukaName = (k: NearbyKacheriInfo) => {
    if (isEn) return k.talukaNameEn;
    if (isHi || isMr) {
      if (k.talukaNameGu.includes('ગોંડલ')) return 'गोंडल';
      if (k.talukaNameGu.includes('રાજકોટ')) return 'राजकोट दक्षिण';
      if (k.talukaNameGu.includes('કોટડા')) return 'कोटडा सांगाणी';
      return k.talukaNameEn;
    }
    return k.talukaNameGu;
  };

  const getLocalizedServiceName = (srv: typeof activeKacheri.servicesAvailable[0]) => {
    if (isEn) return srv.nameEn;
    if (isHi) {
      if (srv.nameGu.includes('આવક')) return 'आय / जाति प्रमाण पत्र';
      if (srv.nameGu.includes('રેશન')) return 'राशन कार्ड / आधार';
      if (srv.nameGu.includes('રેવન્યુ')) return 'राजस्व दस्तावेज़ / 7-12';
      return srv.nameEn;
    }
    if (isMr) {
      if (srv.nameGu.includes('આવક')) return 'उत्पन्न / जात दाखले';
      if (srv.nameGu.includes('રેશન')) return 'शिधापत्रिका / आधार';
      if (srv.nameGu.includes('રેવન્યુ')) return 'महसूल कागदपत्रे / 7-12';
      return srv.nameEn;
    }
    return srv.nameGu;
  };

  const content = (
    <div className="space-y-4 sm:space-y-5 w-full max-w-full overflow-hidden">
      
      {/* SECTION 1: TWO-PILL ADDRESS VS GPS COMPARISON */}
      <div className="bg-[#F5F7FA] border border-slate-200 rounded-2xl sm:rounded-3xl p-3 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="text-xs sm:text-sm font-black text-[#003366] uppercase tracking-wide">
              {isLoggedIn 
                ? (isEn ? 'Aadhaar Address vs Current Live Location' : isHi ? 'आधार पंजीकृत पता बनाम वर्तमान लाइव स्थान' : isMr ? 'आधार नोंदणीकृत पत्ता विरुद्ध थेट स्थान' : 'તમારું આધાર સરનામું વિરુદ્ધ હાલનું લાઈવ લોકેશન')
                : (isEn ? 'Your Current Live GPS Location' : isHi ? 'आपका वर्तमान लाइव GPS स्थान' : isMr ? 'आपले सध्याचे थेट GPS स्थान' : 'તમારું હાલનું લાઈવ GPS લોકેશન')}
            </h3>
          </div>
          <button
            onClick={refreshLocation}
            disabled={isRefreshing}
            className="text-[11px] font-bold text-[#005A9C] hover:text-[#003366] flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs hover:bg-slate-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#FF9933]' : 'text-[#005A9C]'}`} />
            <span>{isEn ? 'Refresh Live GPS' : isHi ? 'लाइव GPS रिफ्रेश' : isMr ? 'थेट GPS रिफ्रेश' : 'લાઈવ GPS રીફ્રેશ'}</span>
          </button>
        </div>

        <div className={`mt-3 ${isLoggedIn ? 'grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3.5' : 'w-full'}`}>
          {/* Card A: Aadhaar Registered (ONLY SHOWN FOR LOGGED IN USERS) */}
          {isLoggedIn && (
            <div className="bg-white border-2 border-blue-200/90 rounded-2xl p-3 sm:p-3.5 shadow-2xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-blue-50">
                <span className="text-[11px] font-black text-[#003366] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#005A9C] shrink-0" />
                  <span className="truncate">{isEn ? 'Aadhaar Registered (Native)' : isHi ? 'आधार पंजीकृत (मूल)' : isMr ? 'आधार नोंदणीकृत (मूळ)' : 'આધાર નોંધાયેલ સરનામું (કાયમી)'}</span>
                </span>
                <span className="text-[9px] bg-blue-50 text-[#003366] font-bold px-1.5 py-0.2 rounded border border-blue-200 shrink-0">
                  {isEn ? DEFAULT_CITIZEN_PROFILE.talukaEn : isHi || isMr ? 'गोंडल' : DEFAULT_CITIZEN_PROFILE.talukaGu}
                </span>
              </div>
              <p className="text-xs text-slate-800 font-bold mt-2 leading-relaxed">
                {isEn ? DEFAULT_CITIZEN_PROFILE.fullAddressEn : isHi ? 'मकान नं. ४४, रामजी मंदिर चौक, गांव: गोमटा, तहसील: गोंडल, जिला: राजकोट - ३६०३૧૧' : isMr ? 'घर क्र. ४४, रामजी मंदिर चौक, गाव: गोमटा, तालुका: गोंडल, जिल्हा: राजकोट - ३६०३૧૧' : DEFAULT_CITIZEN_PROFILE.fullAddressGu}
              </p>
              <p className="text-[10px] text-slate-500 font-medium mt-1">
                {isEn ? 'Revenue certificates bound to this taluka.' : isHi ? 'राजस्व प्रमाण पत्र (आय/जाति/७-१२) इसी तहसील से मान्य होंगे।' : isMr ? 'महसूल दाखले (उत्पन्न/जात/७-१२) या तालुक्यातूनच वैध राहतील.' : 'મહેસૂલી દાખલા (આવક/જાતિ/૭-૧૨) આ કચેરી ક્ષેત્રમાંથી જ માન્ય રહેશે.'}
              </p>
            </div>
          )}

          {/* Card B: Live GPS */}
          <div className="bg-white border-2 border-emerald-300 rounded-2xl p-3 sm:p-3.5 shadow-2xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-emerald-50">
              <span className="text-[11px] font-black text-emerald-800 flex items-center gap-1.5">
                <Compass className={`w-3.5 h-3.5 text-emerald-600 shrink-0 ${gpsState.isLive ? 'animate-spin' : ''}`} />
                <span className="truncate">{isEn ? 'Current Live GPS Location (Exact)' : isHi ? 'वर्तमान लाइव GPS स्थान (सटीक)' : isMr ? 'सध्याचे थेट GPS स्थान (अचूक)' : 'હાલનું લાઈવ GPS લોકેશન (ચોક્કસ)'}</span>
              </span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.2 rounded shrink-0 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span>{gpsState.isLive ? (isEn ? `GPS Active (±${gpsState.accuracyMeters}m)` : isHi ? `GPS सक्रिय (±${gpsState.accuracyMeters}m)` : isMr ? `GPS सक्रिय (±${gpsState.accuracyMeters}m)` : `GPS સક્રિય (±${gpsState.accuracyMeters}m)`) : (isEn ? 'Live Detection' : isHi ? 'लाइव खोज' : isMr ? 'थेट शोध' : 'લાઈવ ડિટેક્શન')}</span>
              </span>
            </div>
            <p className="text-xs text-slate-900 font-black mt-2 leading-relaxed">
              📍 {isEn ? gpsState.displayEn : isHi ? gpsState.displayHi : isMr ? gpsState.displayMr : gpsState.displayGu}
            </p>
            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>{isEn ? 'Lat/Lon: ' : isHi ? 'अक्षांश/देशांतर: ' : isMr ? 'अक्षांश/रेखांश: ' : 'અક્ષાંશ/રેખાંશ: '}{gpsState.latitude.toFixed(4)}, {gpsState.longitude.toFixed(4)}</span>
              <span className="text-emerald-700 font-bold">{isEn ? 'Real-time Linked' : isHi ? 'रीयल-टाइम कनेक्टेड' : isMr ? 'रिअल-टाइम जोडलेले' : 'રીઅલ-ટાઇમ કનેક્ટેડ'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: NEARBY KACHERI COMPARISON CARDS */}
      <div className="space-y-2.5 sm:space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-1">
          <div>
            <h4 className="text-xs sm:text-sm font-black text-[#003366]">
              {isEn ? 'Nearby Kacheris (Live Wait & Crowd Comparison)' : isHi ? 'निकटतम कार्यालय (लाइव भीड़ एवं प्रतीक्षा तुलना)' : isMr ? 'जवळचे कार्यालय (थेट गर्दी व प्रतीक्षा तुलना)' : 'નજીકની સરકારી કચેરીઓ (લાઈવ ભીડ & પ્રતીક્ષા સરખામણી)'}
            </h4>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
              {isEn ? 'Calculated in real-time from your exact coordinates' : isHi ? 'आपके सटीक स्थान से वास्तविक दूरी व समय की गणना' : isMr ? 'आपल्या अचूक स्थानावरून वास्तविक अंतर व वेळेची गणना' : 'તમારા હાલના લાઈવ લોકેશનથી કઈ કચેરી સૌથી નજીક છે તે વાસ્તવિક અંતર સાથે જુઓ'}
            </p>
          </div>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            {isEn ? `${kacheris.length} centers compared` : isHi ? `${kacheris.length} कार्यालयों की तुलना` : isMr ? `${kacheris.length} कार्यालयांची तुलना` : `${kacheris.length} કચેરીઓ સરખાવી`}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3.5">
          {kacheris.map((k) => {
            const isSelected = k.id === activeKacheri.id;
            return (
              <div
                key={k.id}
                onClick={() => {
                  triggerHaptic('tap');
                  setSelectedKacheriId(k.id);
                }}
                className={`rounded-2xl p-3 sm:p-4 border-2 transition cursor-pointer flex flex-col justify-between ${
                  isSelected 
                    ? 'border-[#003366] bg-blue-50/40 shadow-md ring-2 ring-[#003366]/20' 
                    : k.isRecommendedFastest 
                      ? 'border-emerald-400 bg-emerald-50/30 hover:border-emerald-500' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 pb-2 border-b border-slate-100">
                    <span className="text-xs font-black text-[#003366] truncate">
                      {getLocalizedTalukaName(k)}
                    </span>
                    <span className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                      k.crowdPercentage < 40 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : k.crowdPercentage < 65 
                          ? 'bg-blue-100 text-[#003366]' 
                          : 'bg-amber-100 text-amber-900'
                    }`}>
                      {k.crowdPercentage}% {isEn ? 'Crowd' : isHi ? 'भीड़' : isMr ? 'गर्दी' : 'ભીડ'}
                    </span>
                  </div>

                  <h5 className="text-xs font-extrabold text-slate-900 mt-2 leading-tight">
                    {getLocalizedKacheriName(k)}
                  </h5>

                  <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-center">
                    <div className="bg-white border border-slate-200 rounded-xl p-1.5">
                      <span className="text-[9px] font-bold text-slate-400 block">{isEn ? 'Distance' : isHi ? 'दूरी' : isMr ? 'अंतर' : 'વાસ્તવિક અંતર'}</span>
                      <span className="text-xs sm:text-sm font-black text-[#003366]">{k.distanceKm} km</span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-1.5">
                      <span className="text-[9px] font-bold text-slate-400 block">{isEn ? 'Wait' : isHi ? 'प्रतीक्षा' : isMr ? 'प्रतीक्षा' : 'પ્રતીક્ષા'}</span>
                      <span className="text-xs sm:text-sm font-black text-[#138808]">{k.avgWaitMinutes} min</span>
                    </div>
                  </div>

                  {k.isRecommendedFastest && (
                    <div className="mt-2 bg-emerald-100/80 border border-emerald-300 text-emerald-900 p-1.5 rounded-xl text-[10px] font-extrabold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="truncate">{isEn ? '⚡ Free Counters! Fast Service' : isHi ? '⚡ मुक्त काउंटर! त्वरित सेवा' : isMr ? '⚡ मोफत काउंटर! जलद सेवा' : '⚡ મુક્ત કાઉન્ટર! ઝડપી કામગીરી'}</span>
                    </div>
                  )}
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] font-bold">
                  <span className="text-slate-500">{k.activeCountersCount} {isEn ? 'Counters' : isHi ? 'सक्रिय काउंटर' : isMr ? 'सक्रिय काउंटर' : 'કાઉન્ટર સક્રિય'}</span>
                  <span className={`flex items-center gap-0.5 ${isSelected ? 'text-[#003366] font-black' : 'text-slate-600'}`}>
                    <span>{isSelected ? (isEn ? 'Selected ✓' : isHi ? 'चयनित ✓' : isMr ? 'निवडले ✓' : 'પસંદ કરેલ ✓') : (isEn ? 'View Desk' : isHi ? 'विवरण देखें' : isMr ? 'तपशील पहा' : 'વિગતો જુઓ')}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: SELECTED CENTER DETAILS */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-xs space-y-3.5 sm:space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Building className="w-4 h-4 text-[#FF9933] shrink-0" />
              <h4 className="text-xs sm:text-sm font-black text-[#003366]">
                {getLocalizedKacheriName(activeKacheri)}
              </h4>
              <span className="text-[10px] bg-blue-50 text-[#003366] font-bold px-2 py-0.5 rounded border border-blue-200">
                {activeKacheri.distanceKm} km ({activeKacheri.travelMinutes} {isEn ? 'mins travel' : isHi ? 'मिनट यात्रा' : isMr ? 'मिनिटे प्रवास' : 'મિનિટ મુસાફરી'})
              </span>
            </div>
            <p className="text-[10.5px] sm:text-[11px] text-slate-500 font-medium mt-0.5">
              {activeKacheri.isRecommendedFastest 
                ? (isEn ? activeKacheri.recommendationReasonEn : isHi ? 'यह कार्यालय आपके स्थान से सबसे निकटतम है एवं न्यूनतम प्रतीक्षा समय उपलब्ध है।' : isMr ? 'हे कार्यालय आपल्या स्थानावरून सर्वात जवळचे असून कमीत कमी वेळ लागतो.' : activeKacheri.recommendationReasonGu)
                : (isEn ? `This center is ${activeKacheri.distanceKm} km away.` : isHi ? `यह कार्यालय आपके वर्तमान स्थान से ${activeKacheri.distanceKm} किमी दूर है।` : isMr ? `हे कार्यालय आपल्या स्थानापासून ${activeKacheri.distanceKm} किमी अंतरावर आहे.` : `આ કચેરી તમારા હાલના સ્થાનથી ${activeKacheri.distanceKm} કિમી દૂર છે.`)}
            </p>
          </div>

          {onSelectKacheriForBooking && (
            <button
              onClick={() => {
                triggerHaptic('success');
                onSelectKacheriForBooking(activeKacheri.id, activeKacheri.talukaId);
              }}
              className="bg-[#003366] hover:bg-[#002244] text-white text-xs font-black px-4 py-2.5 rounded-xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0"
            >
              <Calendar className="w-4 h-4 text-[#FF9933]" />
              <span>{isEn ? 'Book Token at this Center' : isHi ? 'इस कार्यालय के लिए स्लॉट बुक करें' : isMr ? 'या कार्यालयासाठी स्लॉट बुक करा' : 'આ કચેરી માટે ટોકન સ્લોટ બુક કરો'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </button>
          )}
        </div>

        {/* Live Counters Breakdown */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-[#003366] uppercase tracking-wide">
              {isEn ? 'Live Counters & Estimated Wait Times:' : isHi ? 'लाइव काउंटर स्थिति एवं अनुमानित समय:' : isMr ? 'थेट काउंटर स्थिती व अंदाजित वेळ:' : 'લાઈવ કાઉન્ટર સ્થિતિ & અંદાજિત સમય:'}
            </span>
            <span className="text-[10px] text-slate-500 font-bold">
              {activeKacheri.servicesAvailable.length} {isEn ? 'Counters Open' : isHi ? 'काउंटर खुले' : isMr ? 'काउंटर सुरू' : 'કાઉન્ટર ઓપન'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {activeKacheri.servicesAvailable.map((srv, idx) => (
              <div 
                key={idx}
                className="bg-slate-50 border border-slate-200/90 rounded-xl p-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
                    <span className="text-[10px] font-black text-[#003366]">
                      {isEn ? `Counter ${srv.counterNumber}` : isHi ? `काउंटर ${srv.counterNumber}` : isMr ? `काउंटर ${srv.counterNumber}` : `કાઉન્ટર નં. ${srv.counterNumber}`}
                    </span>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                      srv.status === 'open' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : srv.status === 'busy' 
                          ? 'bg-amber-100 text-amber-900' 
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {srv.status === 'open' 
                        ? (isEn ? 'Open' : isHi ? 'खुला (Open)' : isMr ? 'सुरू (Open)' : 'મુક્ત (Open)') 
                        : srv.status === 'busy' 
                        ? (isEn ? 'Busy' : isHi ? 'व्यस्त (Busy)' : isMr ? 'व्यस्त (Busy)' : 'ચાલુ (Busy)') 
                        : (isEn ? 'Break' : isHi ? 'विराम (Break)' : isMr ? 'सुट्टी (Break)' : 'રીસેસ (Break)')}
                    </span>
                  </div>

                  <h6 className="text-[11px] font-bold text-slate-900 mt-1 leading-tight">
                    {getLocalizedServiceName(srv)}
                  </h6>
                  <p className="text-[9.5px] text-slate-500 mt-0.5">
                    {isEn ? `Officer: ${srv.officerNameGu}` : isHi ? `अधिकारी: ${srv.officerNameGu}` : isMr ? `अधिकारी: ${srv.officerNameGu}` : `અધિકારી: ${srv.officerNameGu}`}
                  </p>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono font-bold">
                  <span className="text-slate-600">{isEn ? 'Token: ' : isHi ? 'टोकन: ' : isMr ? 'टोकन: ' : 'ટોકન: '}<strong className="text-[#003366]">{srv.currentToken}</strong></span>
                  <span className="text-emerald-700">~{srv.estimatedMinutes} {isEn ? 'min' : isHi ? 'मिनट' : isMr ? 'मिनिटे' : 'મિનિટ'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modifications & services you can do here */}
        <div className="pt-2 border-t border-slate-100">
          <h5 className="text-xs font-black text-[#003366] uppercase tracking-wide mb-2">
            {isEn ? 'Modification Services Available at this Center:' : isHi ? 'कार्यालय में उपलब्ध सेवाएं एवं सुधार:' : isMr ? 'कार्यालयात उपलब्ध सेवा व बदल:' : 'કચેરીએ જઈને થઈ શકતા સુધારાઓ અને સેવાઓ:'}
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(isEn ? activeKacheri.modifiableServicesEn : isHi ? [
              'आय प्रमाण पत्र सुधार एवं सत्यापन',
              'राशन कार्ड नाम जोड़ना एवं अलग करना',
              'जाति प्रमाण पत्र एवं शपथ पत्र',
              '7-12 एवं 8-A भूमि नकल प्रमाणीकरण'
            ] : isMr ? [
              'उत्पन्न दाखला बदल व पडताळणी',
              'शिधापत्रिका नाव समाविष्ट करणे व वेगळे करणे',
              'जात प्रमाणपत्र व प्रतिज्ञापत्र',
              '७/१२ व ८-अ जमीन उतारा प्रमाणीकरण'
            ] : activeKacheri.modifiableServicesGu).map((mod, idx) => (
              <div key={idx} className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{mod}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );

  if (isStandaloneCard) {
    return content;
  }

  if (!isOpen) return null;

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden modal-backdrop animate-in fade-in duration-150"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-4xl h-[92dvh] max-h-[92dvh] sm:h-auto sm:max-h-[88vh] overflow-hidden rounded-t-[28px] sm:rounded-3xl shadow-2xl flex flex-col border border-slate-200 animate-in slide-in-from-bottom duration-200"
      >
        {/* MOBILE BOTTOM SHEET DRAG PILL */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-[#003366] shrink-0">
          <div className="w-12 h-1.5 bg-white/40 rounded-full" />
        </div>

        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#003366] via-[#004080] to-[#005A9C] text-white p-3.5 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF9933] animate-spin" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-amber-400/20 text-[#FF9933] border border-amber-400/30 px-1.5 sm:px-2 py-0.5 rounded whitespace-nowrap">
                  {isEn ? 'Live GPS Kacheri Radar' : isHi ? 'लाइव GPS कचहरी रडार' : isMr ? 'थेट GPS कचेरी रडार' : 'લાઈવ GPS કચેરી રડાર'}
                </span>
                <span className="text-[9px] sm:text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-1.5 sm:px-2 py-0.5 rounded font-bold font-mono whitespace-nowrap">
                  {isEn ? 'Precise Geolocation' : isHi ? 'सटीक भू-स्थान' : isMr ? 'अचूक स्थान ट्रॅकिंग' : 'ચોક્કસ સ્થાન ટ્રેકિંગ'}
                </span>
              </div>
              <h2 className="text-xs sm:text-lg font-black text-white mt-0.5 truncate max-w-[200px] xs:max-w-xs sm:max-w-none">
                {isEn ? 'Your Location, Nearby Kacheris & Free Desks' : isHi ? 'आपका स्थान, निकटतम कार्यालय एवं मुक्त काउंटर' : isMr ? 'आपले स्थान, जवळचे कार्यालय आणि मोफत काउंटर' : 'તમારું લોકેશન, નજીકની કચેરીઓ અને મુક્ત કાઉન્ટર'}
              </h2>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close location radar dialog"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition active:scale-95 cursor-pointer shrink-0 ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 overscroll-contain">
          {content}
        </div>

        {/* FOOTER */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 sm:p-4 pb-[max(0.85rem,env(safe-area-inset-bottom))] flex items-center justify-between text-xs font-bold text-slate-500 shrink-0 sticky bottom-0 z-20">
          <span className="text-[10px] sm:text-xs text-slate-500 truncate mr-2">Gujarat Geographic Queue Optimization • GRTSA 2013</span>
          {onClose && (
            <button
              onClick={onClose}
              className="bg-[#003366] hover:bg-[#002244] active:scale-95 text-white px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0"
            >
              {isEn ? 'Close' : isHi ? 'बंद करें' : isMr ? 'बंद करा' : 'બંધ કરો'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
