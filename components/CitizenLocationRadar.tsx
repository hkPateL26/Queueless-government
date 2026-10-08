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
  NearbyKacheriInfo 
} from '@/lib/citizen-profile';
import { Language } from '@/lib/translations';

interface CitizenLocationRadarProps {
  isOpen?: boolean;
  onClose?: () => void;
  lang?: Language;
  onSelectKacheriForBooking?: (kacheriId: string, talukaId: string) => void;
  isStandaloneCard?: boolean;
}

export function CitizenLocationRadar({
  isOpen = true,
  onClose,
  lang = 'gu',
  onSelectKacheriForBooking,
  isStandaloneCard = false
}: CitizenLocationRadarProps) {
  const [kacheris, setKacheris] = useState<NearbyKacheriInfo[]>(NEARBY_KACHERIS_DATA);
  const [selectedKacheriId, setSelectedKacheriId] = useState<string>('kacheri-gondal');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live Location State
  const [gpsState, setGpsState] = useState<{
    latitude: number;
    longitude: number;
    displayGu: string;
    displayEn: string;
    accuracyMeters: number;
    isLive: boolean;
  }>({
    latitude: 21.9619,
    longitude: 70.7923,
    displayGu: 'ગોંડલ બસ સ્ટેન્ડ નજીક, રાજકોટ',
    displayEn: 'Near Gondal Bus Station, Rajkot',
    accuracyMeters: 8,
    isLive: false
  });

  // Try GPS
  const refreshLocation = () => {
    triggerHaptic('tap');
    setIsRefreshing(true);
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsState({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            displayGu: 'ગોંડલ લાઈવ પરિસર (GPS સક્રિય)',
            displayEn: 'Gondal Live Area (GPS Active)',
            accuracyMeters: Math.round(pos.coords.accuracy) || 5,
            isLive: true
          });
          setIsRefreshing(false);
          triggerHaptic('success');
        },
        () => {
          setIsRefreshing(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    refreshLocation();
  }, []);

  const activeKacheri = kacheris.find(k => k.id === selectedKacheriId) || kacheris[0];

  const content = (
    <div className="space-y-4 sm:space-y-5 w-full max-w-full overflow-hidden">
      
      {/* SECTION 1: TWO-PILL ADDRESS VS GPS COMPARISON */}
      <div className="bg-[#F5F7FA] border border-slate-200 rounded-2xl sm:rounded-3xl p-3 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="text-xs sm:text-sm font-black text-[#003366] uppercase tracking-wide">
              {lang === 'gu' ? 'તમારું સરનામું વિરુદ્ધ હાલનું લાઈવ લોકેશન' : 'Aadhaar Address vs Current Live Location'}
            </h3>
          </div>
          <button
            onClick={refreshLocation}
            disabled={isRefreshing}
            className="text-[11px] font-bold text-[#005A9C] hover:text-[#003366] flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{lang === 'gu' ? 'GPS રીફ્રેશ' : 'Refresh GPS'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3.5 mt-3">
          {/* Card A: Aadhaar Registered */}
          <div className="bg-white border-2 border-blue-200/90 rounded-2xl p-3 sm:p-3.5 shadow-2xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-blue-50">
              <span className="text-[11px] font-black text-[#003366] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#005A9C] shrink-0" />
                <span className="truncate">{lang === 'gu' ? 'આધાર નોંધાયેલ સરનામું (કાયમી)' : 'Aadhaar Registered (Native)'}</span>
              </span>
              <span className="text-[9px] bg-blue-50 text-[#003366] font-bold px-1.5 py-0.2 rounded border border-blue-200 shrink-0">
                {DEFAULT_CITIZEN_PROFILE.talukaGu}
              </span>
            </div>
            <p className="text-xs text-slate-800 font-bold mt-2 leading-relaxed">
              {lang === 'gu' ? DEFAULT_CITIZEN_PROFILE.fullAddressGu : DEFAULT_CITIZEN_PROFILE.fullAddressEn}
            </p>
            <p className="text-[10px] text-slate-500 font-medium mt-1">
              {lang === 'gu' ? 'મહેસૂલી દાખલા (આવક/જાતિ/૭-૧૨) આ કચેરી ક્ષેત્રમાંથી જ માન્ય રહેશે.' : 'Revenue certificates bound to this taluka.'}
            </p>
          </div>

          {/* Card B: Live GPS */}
          <div className="bg-white border-2 border-emerald-300 rounded-2xl p-3 sm:p-3.5 shadow-2xs">
            <div className="flex items-center justify-between pb-1.5 border-b border-emerald-50">
              <span className="text-[11px] font-black text-emerald-800 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-600 animate-spin shrink-0" />
                <span className="truncate">{lang === 'gu' ? 'હાલનું લાઈવ GPS લોકેશન' : 'Current Live GPS Location'}</span>
              </span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.2 rounded shrink-0">
                ±{gpsState.accuracyMeters}m
              </span>
            </div>
            <p className="text-xs text-slate-900 font-black mt-2 leading-relaxed">
              📍 {lang === 'gu' ? gpsState.displayGu : gpsState.displayEn}
            </p>
            <p className="text-[10px] text-slate-500 font-medium mt-1">
              {lang === 'gu' ? 'તમારા આ લાઈવ લોકેશન આધારે નીચેની નજીકની કચેરીઓ સરખાવી છે.' : 'Nearby centers compared based on your live location.'}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 2: NEARBY KACHERI COMPARISON CARDS */}
      <div className="space-y-2.5 sm:space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs sm:text-sm font-black text-[#003366]">
              {lang === 'gu' ? 'નજીકની સરકારી કચેરીઓ (લાઈવ ભીડ & પ્રતીક્ષા સરખામણી)' : 'Nearby Kacheris (Live Wait & Crowd Comparison)'}
            </h4>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
              {lang === 'gu' ? 'કઈ કચેરીમાં ઓછી ભીડ અને મુક્ત કાઉન્ટર છે તે તપાસો' : 'Find centers with least crowd and free counters'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3.5">
          {kacheris.map((k) => {
            const isSelected = k.id === selectedKacheriId;
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
                      {lang === 'gu' ? k.talukaNameGu : k.talukaNameEn}
                    </span>
                    <span className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                      k.crowdPercentage < 40 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : k.crowdPercentage < 65 
                          ? 'bg-blue-100 text-[#003366]' 
                          : 'bg-amber-100 text-amber-900'
                    }`}>
                      {k.crowdPercentage}% {lang === 'gu' ? 'ભીડ' : 'Crowd'}
                    </span>
                  </div>

                  <h5 className="text-xs font-extrabold text-slate-900 mt-2 leading-tight">
                    {lang === 'gu' ? k.nameGu : k.nameEn}
                  </h5>

                  <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-center">
                    <div className="bg-white border border-slate-200 rounded-xl p-1.5">
                      <span className="text-[9px] font-bold text-slate-400 block">{lang === 'gu' ? 'અંતર' : 'Distance'}</span>
                      <span className="text-xs sm:text-sm font-black text-[#003366]">{k.distanceKm} km</span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-1.5">
                      <span className="text-[9px] font-bold text-slate-400 block">{lang === 'gu' ? 'પ્રતીક્ષા' : 'Wait'}</span>
                      <span className="text-xs sm:text-sm font-black text-[#138808]">{k.avgWaitMinutes} min</span>
                    </div>
                  </div>

                  {k.isRecommendedFastest && (
                    <div className="mt-2 bg-emerald-100/80 border border-emerald-300 text-emerald-900 p-1.5 rounded-xl text-[10px] font-extrabold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>{lang === 'gu' ? 'મુક્ત કાઉન્ટર! ૧૨ મિનિટ ઝડપી' : 'Free Counters! Fast Service'}</span>
                    </div>
                  )}
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] sm:text-[11px] font-bold">
                  <span className="text-slate-500">{k.activeCountersCount} {lang === 'gu' ? 'કાઉન્ટર સક્રિય' : 'Counters'}</span>
                  <span className={`flex items-center gap-0.5 ${isSelected ? 'text-[#003366] font-black' : 'text-slate-600'}`}>
                    <span>{isSelected ? (lang === 'gu' ? 'પસંદ કરેલ ✓' : 'Selected ✓') : (lang === 'gu' ? 'વિગતો જુઓ' : 'View Desk')}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: SELECTED CENTER DETAILS & COUNTER MODIFICATIONS */}
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-xs space-y-3.5 sm:space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Building className="w-4 h-4 text-[#FF9933] shrink-0" />
              <h4 className="text-xs sm:text-sm font-black text-[#003366]">
                {lang === 'gu' ? activeKacheri.nameGu : activeKacheri.nameEn}
              </h4>
              <span className="text-[10px] bg-blue-50 text-[#005A9C] font-bold px-2 py-0.5 rounded border border-blue-200">
                {activeKacheri.distanceKm} km ({activeKacheri.travelMinutes} {lang === 'gu' ? 'મિનિટ' : 'mins'})
              </span>
            </div>
            <p className="text-[10.5px] sm:text-[11px] text-slate-500 font-medium mt-0.5">
              {activeKacheri.isRecommendedFastest 
                ? (lang === 'gu' ? activeKacheri.recommendationReasonGu : activeKacheri.recommendationReasonEn)
                : (lang === 'gu' ? 'ગોંડલ તાલુકાના નાગરિકો માટે સત્તાવાર જન સેવા કેન્દ્ર' : 'Official Jan Seva Kendra for Gondal taluka')}
            </p>
          </div>

          {onSelectKacheriForBooking && (
            <button
              onClick={() => {
                triggerHaptic('tap');
                if (onClose) onClose();
                onSelectKacheriForBooking(activeKacheri.id, activeKacheri.talukaId);
              }}
              className="w-full sm:w-auto bg-[#FF9933] hover:bg-[#ff8800] text-slate-900 font-black text-xs px-4 py-2.5 rounded-xl transition active:scale-95 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-900" />
              <span>{lang === 'gu' ? 'આ કચેરીનો સ્લોટ બુક કરો' : 'Book Slot at this Office'}</span>
            </button>
          )}
        </div>

        {/* Counter breakdown for this kacheri */}
        <div>
          <h5 className="text-xs font-black text-[#003366] uppercase tracking-wide mb-2.5">
            {lang === 'gu' ? 'આ કચેરીના કાર્યરત કાઉન્ટર્સ અને લાઈવ ટોકન:' : 'Active Counters & Live Tokens at this Center:'}
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {activeKacheri.servicesAvailable.map((srv) => (
              <div key={srv.counterNumber} className="bg-[#F5F7FA] border border-slate-200 rounded-xl p-3">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-[#003366] uppercase">કાઉન્ટર {srv.counterNumber}</span>
                  <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                    srv.status === 'open' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : srv.status === 'lunch' 
                        ? 'bg-amber-100 text-amber-900' 
                        : 'bg-blue-100 text-[#003366]'
                  }`}>
                    {srv.status === 'open' ? '🟢 ખુલ્લું' : srv.status === 'lunch' ? '🟡 ભોજન વિરામ' : '🔵 વ્યસ્ત'}
                  </span>
                </div>
                <p className="text-xs font-black text-slate-800 mt-1 leading-snug">
                  {lang === 'gu' ? srv.nameGu : srv.nameEn}
                </p>
                <div className="mt-2 pt-1 border-t border-slate-200/80 flex items-center justify-between text-[10px] text-slate-500 font-bold">
                  <span>ચાલુ ટોકન: <strong className="font-mono text-slate-900">{srv.currentToken}</strong></span>
                  <span>પ્રતીક્ષા: <strong className="text-emerald-700">{srv.estimatedMinutes}m</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modifications & services you can do here */}
        <div className="pt-2 border-t border-slate-100">
          <h5 className="text-xs font-black text-[#003366] uppercase tracking-wide mb-2">
            {lang === 'gu' ? 'કચેરીએ જઈને થઈ શકતા સુધારાઓ અને સેવાઓ:' : 'Modification Services Available at this Center:'}
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(lang === 'gu' ? activeKacheri.modifiableServicesGu : activeKacheri.modifiableServicesEn).map((mod, idx) => (
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
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 modal-backdrop animate-in fade-in duration-150"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col border border-slate-200"
      >
        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#003366] via-[#004080] to-[#005A9C] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Compass className="w-5 h-5 text-[#FF9933] animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-400/20 text-[#FF9933] border border-amber-400/30 px-2 py-0.5 rounded">
                  {lang === 'gu' ? 'લાઈવ GPS કચેરી રડાર' : 'Live GPS Kacheri Radar'}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded font-bold font-mono">
                  {lang === 'gu' ? 'ચોક્કસ સ્થાન ટ્રેકિંગ' : 'Precise Geolocation'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                {lang === 'gu' ? 'તમારું લોકેશન, નજીકની કચેરીઓ અને મુક્ત કાઉન્ટર' : 'Your Location, Nearby Kacheris & Free Desks'}
              </h2>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition active:scale-95 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {content}
        </div>

        {/* FOOTER */}
        <div className="bg-slate-50 border-t border-slate-200 p-3 sm:p-4 flex items-center justify-between text-xs font-bold text-slate-500 shrink-0">
          <span>Gujarat Geographic Queue Optimization • GRTSA 2013</span>
          {onClose && (
            <button
              onClick={onClose}
              className="bg-[#003366] hover:bg-[#002244] text-white px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer"
            >
              {lang === 'gu' ? 'બંધ કરો' : 'Close'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
