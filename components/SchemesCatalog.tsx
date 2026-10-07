'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, Clock, ShieldCheck, ArrowRight, FileCheck, 
  ChevronRight, Sparkles, Filter, ExternalLink, HelpCircle, Info
} from 'lucide-react';
import { 
  ALL_YOJANAS, 
  SchemeItem, 
  getSchemeEligibility, 
  getSchemeOfficialSource, 
  getSchemeStructuredBenefit,
  getProcessingTimelineInfo
} from '@/lib/schemes-data';
import { triggerHaptic } from '@/lib/haptics';
import { GovLogo } from '@/components/GovLogo';

interface SchemesCatalogProps {
  onSelectScheme: (scheme: SchemeItem) => void;
  lang?: 'en' | 'gu' | 'hi';
}

export const SchemesCatalog: React.FC<SchemesCatalogProps> = ({ 
  onSelectScheme, 
  lang = 'gu' 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isEn = lang === 'en';
  const isHi = lang === 'hi';

  const categories = useMemo(() => [
    { 
      id: 'all', 
      label: isEn ? 'All Schemes (39)' : isHi ? 'सभी योजनाएं (३९)' : 'તમામ યોજનાઓ (All 39)', 
      icon: '🏛️' 
    },
    { 
      id: 'agriculture', 
      label: isEn ? '🌾 Agriculture (12)' : isHi ? '🌾 कृषि एवं किसान कल्याण (१२)' : '🌾 ખેતીવાડી (૧૨)', 
      icon: '🌾' 
    },
    { 
      id: 'healthcare', 
      label: isEn ? '🏥 Healthcare & Social (9)' : isHi ? '🏥 स्वास्थ्य एवं सामाजिक सुरक्षा (९)' : '🏥 આરોગ્ય અને કલ્યાણ (૯)', 
      icon: '🏥' 
    },
    { 
      id: 'education', 
      label: isEn ? '🎓 Education (10)' : isHi ? '🎓 शिक्षा एवं छात्रवृत्ति (१०)' : '🎓 શિક્ષણ અને શિષ્યવૃત્તિ (૧૦)', 
      icon: '🎓' 
    },
    { 
      id: 'welfare', 
      label: isEn ? '🏛️ Civic & Revenue (8)' : isHi ? '🏛️ नागरिक एवं राजस्व प्रमाण पत्र (८)' : '🏛️ દાખલા અને મહેસૂલી સેવાઓ (૮)', 
      icon: '🏛️' 
    },
  ], [isEn, isHi]);

  const personaFilters = useMemo(() => [
    { 
      id: 'farmer', 
      label: isEn ? 'Farmer (ખેડૂત)' : isHi ? 'किसान (Farmer)' : 'ખેડૂત (Farmer)', 
      icon: '🌾', 
      category: 'agriculture' 
    },
    { 
      id: 'student', 
      label: isEn ? 'Student (વિદ્યાર્થી)' : isHi ? 'छात्र (Student)' : 'વિદ્યાર્થી (Student)', 
      icon: '🎓', 
      category: 'education' 
    },
    { 
      id: 'woman', 
      label: isEn ? 'Women / Mothers' : isHi ? 'महिला / माता (Women)' : 'મહિલા / માતા (Women)', 
      icon: '👩', 
      category: 'healthcare' 
    },
    { 
      id: 'citizen', 
      label: isEn ? 'Certificates / Civic' : isHi ? 'नागरिक प्रमाण पत्र' : 'દાખલા / રેકોર્ડ્સ (Civic)', 
      icon: '📄', 
      category: 'welfare' 
    },
  ], [isEn, isHi]);

  const filteredSchemes = useMemo(() => {
    return ALL_YOJANAS.filter(scheme => {
      // Category match
      const catMatch = selectedCategory === 'all' || scheme.category === selectedCategory;
      
      // Search match (Gujarati or English)
      const q = searchQuery.toLowerCase().trim();
      const searchMatch = !q || 
        scheme.titleGu.toLowerCase().includes(q) ||
        scheme.titleEn.toLowerCase().includes(q) ||
        scheme.benefitGu.toLowerCase().includes(q) ||
        scheme.benefit.toLowerCase().includes(q) ||
        scheme.department.toLowerCase().includes(q) ||
        (scheme.categoryGu && scheme.categoryGu.toLowerCase().includes(q)) ||
        (scheme.categoryEn && scheme.categoryEn.toLowerCase().includes(q));

      return catMatch && searchMatch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-start gap-3.5">
          <GovLogo className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 drop-shadow-md mt-1" />
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#003366] text-xs font-bold border border-blue-200 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#FF9933]" />
              <span>
                {isEn 
                  ? '39 Gujarat Public Services Directory • Structured Reference' 
                  : isHi 
                  ? '३९ गुजरात लोक सेवा निर्देशिका • संरचित संदर्भ' 
                  : '39 ગુજરાત જાહેર સેવા નિર્દેશિકા • સત્તાવાર માર્ગદર્શિકા'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#003366] tracking-tight">
              {isEn 
                ? `Schemes Discovery & Document Pre-Verification (${ALL_YOJANAS.length} Services)` 
                : isHi 
                ? `योजना खोज एवं दस्तावेज़ पूर्व-सत्यापन (${ALL_YOJANAS.length} सेवाएं)` 
                : `યોજના શોધ & દસ્તાવેજ પૂર્વ-ચકાસણી (${ALL_YOJANAS.length} સેવાઓ)`}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {isEn 
                ? 'Verify scheme eligibility, required documents, statutory fees, and expected processing time before visiting the office.' 
                : isHi 
                ? 'कार्यालय जाने से पहले योजना की पात्रता, आवश्यक दस्तावेज, सरकारी शुल्क और अपेक्षित समय जांचें।' 
                : 'કચેરીએ જતાં પહેલાં યોજનાની પાત્રતા, જરૂરી કાગળો, સરકારી ફી અને અંદાજિત સમય ચકાસો.'}
            </p>
          </div>
        </div>

        {/* Live Search Bar */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isEn 
                ? 'Search schemes: Tractor, MYSY, Income...' 
                : isHi 
                ? 'योजना खोजें: ट्रैक्टर, MYSY, आय प्रमाण पत्र...' 
                : 'યોજના અથવા સેવા શોધો: ટ્રેક્ટર, MYSY, આવક...'
            }
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-[#005A9C] shadow-xs"
          />
        </div>
      </div>

      {/* Quick Persona Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> 
          {isEn ? 'Quick Filters:' : isHi ? 'त्वरित फ़िल्टर:' : 'ઝડપી ફિલ્ટર:'}
        </span>
        {personaFilters.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              triggerHaptic('tap');
              if (selectedPersona === p.id) {
                setSelectedPersona(null);
                setSelectedCategory('all');
              } else {
                setSelectedPersona(p.id);
                setSelectedCategory(p.category);
              }
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              selectedPersona === p.id
                ? 'bg-[#FF9933] text-slate-900 shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <span>{p.icon}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar border-b border-slate-200">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              triggerHaptic('tap');
              setSelectedPersona(null);
              setSelectedCategory(c.id);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition flex items-center gap-2 cursor-pointer ${
              selectedCategory === c.id
                ? 'bg-[#003366] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <span>{c.icon}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Schemes Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSchemes.map((scheme) => {
          const eligibility = getSchemeEligibility(scheme);
          const sourceInfo = getSchemeOfficialSource(scheme);
          const benefit = getSchemeStructuredBenefit(scheme);
          const timelineInfo = getProcessingTimelineInfo(scheme);

          const displayTitle = isEn ? scheme.titleEn : scheme.titleGu;
          const displaySecondaryTitle = isEn ? scheme.titleGu : scheme.titleEn;
          const displayCategory = isEn ? scheme.categoryEn : scheme.categoryGu;
          const displayBenefitHeadline = isEn ? benefit.headlineEn : benefit.headlineGu;
          const displayBenefit = isEn ? scheme.benefit : scheme.benefitGu;
          const displayEligibility = isEn ? eligibility.en : eligibility.gu;
          const displayTimeline = isEn ? timelineInfo.formattedTimeEn : timelineInfo.formattedTimeGu;

          return (
            <div
              key={scheme.id}
              onClick={() => {
                triggerHaptic('tap');
                onSelectScheme(scheme);
              }}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#005A9C]/50 transition cursor-pointer flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#005A9C] via-[#FF9933] to-[#138808]" />

              <div className="space-y-3">
                {/* Badges: Department & Fee */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase text-[#003366] bg-[#F5F7FA] border border-slate-200 px-2.5 py-0.5 rounded-full truncate">
                    {displayCategory}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold text-[#138808] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      {scheme.fee === 0 
                        ? (isEn ? 'Govt Fee: ₹0 (Free)' : isHi ? 'सरकारी शुल्क: ₹० (मुफ्त)' : 'સરકારી ફી: ₹૦ (મફત)') 
                        : (isEn ? `Govt Fee: ₹${scheme.fee}` : isHi ? `सरकारी शुल्क: ₹${scheme.fee}` : `સરકારી ફી: ₹${scheme.fee}`)}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3 className="font-extrabold text-[#003366] text-sm sm:text-base leading-snug group-hover:text-[#005A9C] transition">
                    {displayTitle}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                    {displaySecondaryTitle}
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1">
                    {isEn ? `Department: ${scheme.department}` : `વિભાગ: ${scheme.department}`}
                  </p>
                </div>

                {/* Structured Benefit Box */}
                <div className="bg-[#F5F7FA] border border-slate-200/80 rounded-2xl p-3 space-y-1">
                  <p className="text-[10px] font-black text-amber-900 uppercase">
                    {displayBenefitHeadline}
                  </p>
                  <p className="text-[11px] font-bold text-slate-700 line-clamp-2 leading-relaxed">
                    ✨ {displayBenefit}
                  </p>
                  <p className="text-[9.5px] text-slate-400 italic">
                    {isEn 
                      ? '(Amount/eligibility depends on category rules)' 
                      : '(પાત્રતા અને નિયમો સંબંધિત સરકારી જોગવાઈ અનુસાર)'}
                  </p>
                </div>

                {/* "Can I Apply?" Eligibility Snippet */}
                <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-2 text-left">
                  <HelpCircle className="w-3.5 h-3.5 text-[#005A9C] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black text-[#003366]">
                      {isEn 
                        ? 'Can I Apply? (Eligibility Criteria):' 
                        : isHi 
                        ? 'क्या मैं आवेदन कर सकता हूँ? (पात्रता):' 
                        : 'હું અરજી કરી શકું? (Can I Apply?):'}
                    </p>
                    <p className="text-[10.5px] text-slate-600 line-clamp-2 leading-tight mt-0.5">
                      {displayEligibility}
                    </p>
                  </div>
                </div>

                {/* Service Processing Time & Office Waiting Distinction */}
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-[10.5px]">
                  {/* Expected Processing / Delivery Time */}
                  <div className="flex items-start justify-between gap-1.5">
                    <span className="font-bold text-slate-600 flex items-center gap-1 shrink-0">
                      <Clock className="w-3.5 h-3.5 text-[#FF9933] shrink-0" />
                      <span>{isEn ? 'Expected Delivery:' : isHi ? 'अपेक्षित डिलीवरी:' : 'અપેક્ષિત ડિલિવરી:'}</span>
                    </span>
                    <span className="font-black text-[#003366] text-right">
                      {timelineInfo.isVaries ? (
                        <span className="text-amber-700">
                          {isEn 
                            ? 'Varies (Confirm at office)' 
                            : isHi 
                            ? 'कार्यालय अनुसार अलग (जांचें)' 
                            : 'અલગ હોઈ શકે છે (કચેરીએ ચકાસો)'}
                        </span>
                      ) : (
                        displayTimeline
                      )}
                    </span>
                  </div>

                  {/* SLA Type Tag (Only statutory for GRTSA) */}
                  <div className="flex items-center justify-between text-[9.5px]">
                    <span className="text-slate-400">
                      {isEn ? 'Timeline Standard:' : isHi ? 'समय-सीमा मानक:' : 'સમયમર્યાદા ધોરણ:'}
                    </span>
                    {scheme.slaType === 'statutory_grtsa' ? (
                      <span className="font-extrabold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded border border-blue-200">
                        {isEn ? '⚖️ GRTSA 2013 Statutory' : isHi ? '⚖️ GRTSA २०१३ अधिसूचित' : '⚖️ GRTSA ૨૦૧૩ અધિસૂચિત'}
                      </span>
                    ) : scheme.slaType === 'departmental_norm' ? (
                      <span className="font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                        {isEn ? '🏛️ Citizen Charter' : isHi ? '🏛️ सिटीजन चार्टर' : '🏛️ સિટીઝન ચાર્ટર'}
                      </span>
                    ) : (
                      <span className="font-medium text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded">
                        {isEn ? '📋 Scheme Cycle / Quota' : isHi ? '📋 योजना चक्र / कोटा' : '📋 યોજના ચક્ર / ક્વોટા'}
                      </span>
                    )}
                  </div>

                  {/* Appointment Waiting Time distinction */}
                  <div className="flex items-center justify-between text-[9.5px] text-slate-500 pt-0.5 border-t border-slate-200/60">
                    <span>
                      {isEn ? '🏢 Office Counter Wait:' : isHi ? '🏢 काउंटर प्रतीक्षा अवधि:' : '🏢 કચેરી કાઉન્ટર પ્રતીક્ષા:'}
                    </span>
                    <span className="font-bold text-slate-700">
                      {isEn ? '~15-20 min' : '~૧૫-૨૦ મિનિટ'}
                    </span>
                  </div>

                  {/* Official Source & Updated */}
                  <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[9px] text-slate-400">
                    <span className="truncate max-w-[150px]" title={scheme.officialSource}>
                      {isEn ? 'Source: ' : isHi ? 'स्रोत: ' : 'સ્ત્રોત: '}{scheme.officialSource}
                    </span>
                    <span>
                      {isEn ? 'Updated: ' : isHi ? 'अपडेट: ' : 'અપડેટ: '}{scheme.lastUpdated}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Required docs & Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                  <FileCheck className="w-3.5 h-3.5 text-[#005A9C]" />
                  <span>
                    {isEn 
                      ? `${scheme.requiredDocs.length} Docs Required` 
                      : isHi 
                      ? `${scheme.requiredDocs.length} दस्तावेज आवश्यक` 
                      : `${scheme.requiredDocs.length} કાગળો જરૂરી`}
                  </span>
                </span>

                <span className="text-[#005A9C] group-hover:text-[#003366] flex items-center gap-1 text-[11px] font-extrabold">
                  <span>
                    {isEn ? 'Pre-Check Docs' : isHi ? 'दस्तावेज़ प्री-चेक' : 'દસ્તાવેજ પ્રી-ચેક'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSchemes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-2">
          <p className="text-base font-extrabold text-[#003366]">
            {isEn ? 'No schemes or services found' : isHi ? 'कोई सेवा या योजना नहीं मिली' : 'કોઈ સેવા કે યોજના મળી નથી'}
          </p>
          <p className="text-xs text-slate-500">
            {isEn 
              ? 'Please try a different search keyword or category filter.' 
              : isHi 
              ? 'कृपया अन्य कीवर्ड या श्रेणी फ़िल्टर आज़माएं।' 
              : 'કૃપા કરીને અન્ય કીવર્ડ અથવા કેટેગરી ફિલ્ટર અજમાવો.'}
          </p>
        </div>
      )}

    </div>
  );
};
