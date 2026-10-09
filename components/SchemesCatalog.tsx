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
import { 
  getLocalizedSchemeTitle,
  getLocalizedSchemeCategory,
  getLocalizedSchemeBenefit,
  getLocalizedSchemeDepartment,
  getLocalizedSchemeEligibility
} from '@/lib/scheme-translations';
import { triggerHaptic } from '@/lib/haptics';
import { GovLogo } from '@/components/GovLogo';
import { Language } from '@/lib/translations';
import { SchemeCardSkeleton } from '@/components/ui/Skeleton';

interface SchemesCatalogProps {
  onSelectScheme: (scheme: SchemeItem) => void;
  lang?: Language;
  maxItems?: number;
  onViewAll?: () => void;
}

export const SchemesCatalog: React.FC<SchemesCatalogProps> = ({ 
  onSelectScheme, 
  lang = 'gu',
  maxItems,
  onViewAll
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(maxItems || 9);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);

  const isEn = lang === 'en';
  const isHi = lang === 'hi';
  const isMr = lang === 'mr';
  const isKhi = lang === 'khi';

  const categories = useMemo(() => [
    { 
      id: 'all', 
      label: isEn ? 'All Schemes (39)' : isHi ? 'सभी योजनाएं (३९)' : isMr ? 'सर्व योजना (३९)' : isKhi ? 'બધી યોજનાયું (૩૯)' : 'તમામ યોજનાઓ (૩૯)' 
    },
    { 
      id: 'agriculture', 
      label: isEn ? 'Agriculture & Farmers (12)' : isHi ? 'कृषि एवं किसान कल्याण (१२)' : isMr ? 'शेती आणि शेतकरी (१२)' : isKhi ? 'ખેતીવાડી ને ખેડૂત (૧૨)' : 'ખેતીવાડી (૧૨)' 
    },
    { 
      id: 'healthcare', 
      label: isEn ? 'Healthcare & Social (9)' : isHi ? 'स्वास्थ्य एवं सामाजिक सुरक्षा (९)' : isMr ? 'आरोग्य आणि समाजकल्याण (९)' : isKhi ? 'આરોગ્ય ને કલ્યાણ (૯)' : 'આરોગ્ય અને કલ્યાણ (૯)' 
    },
    { 
      id: 'education', 
      label: isEn ? 'Education & Scholarship (10)' : isHi ? 'शिक्षा एवं छात्रवृत्ति (१०)' : isMr ? 'शिक्षण आणि शिष्यवृत्ती (१०)' : isKhi ? 'ભણતર ને શિષ્યવૃત્તિ (૧૦)' : 'શિક્ષણ અને શિષ્યવૃત્તિ (૧૦)' 
    },
    { 
      id: 'welfare', 
      label: isEn ? 'Civic & Revenue (8)' : isHi ? 'नागरिक एवं राजस्व प्रमाण पत्र (८)' : isMr ? 'नागरी आणि महसूल दाखले (८)' : isKhi ? 'દાખલા ને મહેસૂલી સેવાયું (૮)' : 'દાખલા અને મહેસૂલી સેવાઓ (૮)' 
    },
  ], [isEn, isHi, isMr, isKhi]);

  const filteredSchemes = useMemo(() => {
    return ALL_YOJANAS.filter(scheme => {
      // Category match
      const catMatch = selectedCategory === 'all' || scheme.category === selectedCategory;
      if (!catMatch) return false;

      // Search match across English, Gujarati, Hindi, Marathi titles and categories
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const localizedTitle = getLocalizedSchemeTitle(scheme, lang).toLowerCase();
        const localizedCat = getLocalizedSchemeCategory(scheme, lang).toLowerCase();
        const localizedDept = getLocalizedSchemeDepartment(scheme, lang).toLowerCase();

        return (
          scheme.titleGu.toLowerCase().includes(q) ||
          scheme.titleEn.toLowerCase().includes(q) ||
          localizedTitle.includes(q) ||
          localizedCat.includes(q) ||
          localizedDept.includes(q) ||
          scheme.department.toLowerCase().includes(q) ||
          scheme.categoryGu.toLowerCase().includes(q) ||
          scheme.categoryEn.toLowerCase().includes(q)
        );
      }

      return true;
    });
  }, [selectedCategory, searchQuery, lang]);

  const displayedSchemes = useMemo(() => {
    if (searchQuery.trim()) {
      return filteredSchemes;
    }
    if (maxItems) {
      return filteredSchemes.slice(0, maxItems);
    }
    return filteredSchemes.slice(0, visibleCount);
  }, [filteredSchemes, searchQuery, maxItems, visibleCount]);

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
                  : isMr 
                  ? '३९ गुजरात लोक सेवा निर्देशिका • अधिकृत मार्गदर्शक'
                  : isKhi
                  ? '૩૯ ગુજરાત ને કચ્છ જાહેર સેવા નિર્દેશિકા • સત્તાવાર માર્ગદર્શિકા'
                  : '39 ગુજરાત જાહેર સેવા નિર્દેશિકા • સત્તાવાર માર્ગદર્શિકા'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#003366] tracking-tight">
              {isEn 
                ? `Schemes Discovery & Document Pre-Verification (${ALL_YOJANAS.length} Services)` 
                : isHi 
                ? `योजना खोज एवं दस्तावेज़ पूर्व-सत्यापन (${ALL_YOJANAS.length} सेवाएं)` 
                : isMr 
                ? `योजना शोध आणि कागदपत्रे पूर्व-तपासणी (${ALL_YOJANAS.length} सेवा)` 
                : isKhi
                ? `યોજના ગોતો & કાગળ પૂર્વ-ચકાસણી (${ALL_YOJANAS.length} સેવાયું)`
                : `યોજના શોધ & દસ્તાવેજ પૂર્વ-ચકાસણી (${ALL_YOJANAS.length} સેવાઓ)`}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {isEn 
                ? 'Verify scheme eligibility, required documents, statutory fees, and expected processing time before visiting the office.' 
                : isHi 
                ? 'कार्यालय जाने से पहले योजना की पात्रता, आवश्यक दस्तावेज, सरकारी शुल्क और अपेक्षित समय जांचें।' 
                : isMr 
                ? 'कार्यालयात जाण्यापूर्वी योजनेची पात्रता, आवश्यक कागदपत्रे, शासकीय शुल्क आणि अंदाजित वेळ तपासा.'
                : isKhi
                ? 'કચેરી તે વેણ્યા પેલા યોજનાજી પાત્રતા, ખપતા કાગળ, સરકારી ફી ને સમય ચકાસો.'
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
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsFiltering(true);
              setTimeout(() => setIsFiltering(false), 180);
            }}
            placeholder={
              isEn 
                ? 'Search schemes: Tractor, MYSY, Income...' 
                : isHi 
                ? 'योजना खोजें: ट्रैक्टर, MYSY, आय प्रमाण पत्र...' 
                : isMr 
                ? 'योजना शोधा: ट्रॅक्टर, MYSY, उत्पन्न दाखला...' 
                : isKhi
                ? 'યોજના અથવા સેવા ગોતો: ટ્રેક્ટર, MYSY, આવક...'
                : 'યોજના અથવા સેવા શોધો: ટ્રેક્ટર, MYSY, આવક...'
            }
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-[#005A9C] shadow-xs"
          />
        </div>
      </div>

      {/* Single Unified Category Filter Bar (No Duplicates, No Emojis) */}
      <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar border-b border-slate-200">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              triggerHaptic('tap');
              setSelectedCategory(c.id);
              setIsFiltering(true);
              setTimeout(() => setIsFiltering(false), 200);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer ${
              selectedCategory === c.id
                ? 'bg-[#003366] text-white shadow-sm ring-2 ring-[#003366]/20'
                : 'bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Schemes Bento Grid / Skeleton Loading */}
      {isFiltering ? (
        <SchemeCardSkeleton count={visibleCount > 6 ? 6 : Math.max(visibleCount, 3)} />
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedSchemes.map((scheme) => {
          const eligibility = getSchemeEligibility(scheme);
          const sourceInfo = getSchemeOfficialSource(scheme);
          const benefit = getSchemeStructuredBenefit(scheme);
          const timelineInfo = getProcessingTimelineInfo(scheme);

          const displayTitle = getLocalizedSchemeTitle(scheme, lang);
          const displaySecondaryTitle = isEn ? scheme.titleGu : scheme.titleEn;
          const displayCategory = getLocalizedSchemeCategory(scheme, lang);
          const displayBenefitHeadline = isEn 
            ? benefit.headlineEn 
            : isMr 
            ? 'शासकीय योजना लाभ' 
            : isHi 
            ? 'सरकारी योजना लाभ' 
            : isKhi 
            ? 'યોજના જો લાભ' 
            : benefit.headlineGu;
          const displayBenefit = getLocalizedSchemeBenefit(scheme, lang);
          const displayEligibility = getLocalizedSchemeEligibility(scheme, lang);
          const displayDepartment = getLocalizedSchemeDepartment(scheme, lang);
          const displayTimeline = isEn 
            ? timelineInfo.formattedTimeEn 
            : isMr 
            ? timelineInfo.formattedTimeGu.replace('દિવસ', 'दिवस').replace('તે જ દિવસે', 'त्याच दिवशी') 
            : isHi
            ? timelineInfo.formattedTimeGu.replace('દિવસ', 'दिन').replace('તે જ દિવસે', 'उसी दिन')
            : isKhi
            ? timelineInfo.formattedTimeGu.replace('દિવસ', 'ડીં').replace('તે જ દિવસે', 'એ જ ડીંયે')
            : timelineInfo.formattedTimeGu;

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
                        ? (isEn ? 'Govt Fee: ₹0 (Free)' : isHi ? 'सरकारी शुल्क: ₹० (मुफ्त)' : isMr ? 'शासकीय शुल्क: ₹० (मोफत)' : isKhi ? 'સરકારી ફી: ₹૦ (મફત)' : 'સરકારી ફી: ₹૦ (મફત)') 
                        : (isEn ? `Govt Fee: ₹${scheme.fee}` : isHi ? `सरकारी शुल्क: ₹${scheme.fee}` : isMr ? `शासकीय शुल्क: ₹${scheme.fee}` : `સરકારી ફી: ₹${scheme.fee}`)}
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
                    {isEn ? `Department: ${displayDepartment}` : isHi ? `विभाग: ${displayDepartment}` : isMr ? `विभाग: ${displayDepartment}` : `વિભાગ: ${scheme.department}`}
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
                      : isMr
                      ? '(पात्रता व अटी शासकीय नियमांनुसार लागू)'
                      : isHi
                      ? '(पात्रता एवं शर्तें सरकारी नियमों के अनुसार)'
                      : isKhi
                      ? '(પાત્રતા ને નિયમો સરકારી જોગવાઈ અનુસાર)'
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
                        : isMr
                        ? 'मी अर्ज करू शकतो का? (पात्रता निकष):'
                        : isKhi
                        ? 'અરજી કેર કરી સગે? (પાત્રતા):'
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
                      <span>
                        {isEn ? 'Expected Delivery:' : isHi ? 'अपेक्षित डिलीवरी:' : isMr ? 'अपेक्षित वितरण:' : 'અપેક્ષિત ડિલિવરી:'}
                      </span>
                    </span>
                    <span className="font-black text-[#003366] text-right">
                      {timelineInfo.isVaries ? (
                        <span className="text-amber-700">
                          {isEn 
                            ? 'Varies (Confirm at office)' 
                            : isHi 
                            ? 'कार्यालय अनुसार अलग (जांचें)' 
                            : isMr
                            ? 'कार्यालयनिहाय वेगळे (तपासा)'
                            : isKhi
                            ? 'અલગ હોઈ સગે (કચેરીએ ચકાસો)'
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
                      {isEn ? 'Timeline Standard:' : isHi ? 'समय-सीमा मानक:' : isMr ? 'वेळ-मर्यादा मानक:' : 'સમયમર્યાદા ધોરણ:'}
                    </span>
                    {scheme.slaType === 'statutory_grtsa' ? (
                      <span className="font-extrabold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded border border-blue-200">
                        {isEn ? '⚖️ GRTSA 2013 Statutory' : isHi ? '⚖️ GRTSA २०१३ अधिसूचित' : isMr ? '⚖️ GRTSA २०१३ अधिसूचित' : '⚖️ GRTSA ૨૦૧૩ અધિસૂચિત'}
                      </span>
                    ) : scheme.slaType === 'departmental_norm' ? (
                      <span className="font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                        {isEn ? '🏛️ Citizen Charter' : isHi ? '🏛️ सिटीजन चार्टर' : isMr ? '🏛️ सिटिझन चार्टर' : '🏛️ સિટીઝન ચાર્ટર'}
                      </span>
                    ) : (
                      <span className="font-medium text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded">
                        {isEn ? '📋 Scheme Cycle / Quota' : isHi ? '📋 योजना चक्र / कोटा' : isMr ? '📋 योजना चक्र / कोटा' : '📋 યોજના ચક્ર / ક્વોટા'}
                      </span>
                    )}
                  </div>

                  {/* Appointment Waiting Time distinction */}
                  <div className="flex items-center justify-between text-[9.5px] text-slate-500 pt-0.5 border-t border-slate-200/60">
                    <span>
                      {isEn ? '🏢 Office Counter Wait:' : isHi ? '🏢 काउंटर प्रतीक्षा अवधि:' : isMr ? '🏢 कार्यालय काउंटर प्रतीक्षा:' : isKhi ? '🏢 કચેરી કાઉન્ટર પ્રતીક્ષા:' : '🏢 કચેરી કાઉન્ટર પ્રતીક્ષા:'}
                    </span>
                    <span className="font-bold text-slate-700">
                      {isEn ? '~15-20 min' : isHi ? '~१५-२० मिनट' : isMr ? '~१५-२० मिनिटे' : '~૧૫-૨૦ મિનિટ'}
                    </span>
                  </div>

                  {/* Official Source & Updated */}
                  <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[9px] text-slate-400">
                    <span className="truncate max-w-[150px]" title={scheme.officialSource}>
                      {isEn ? 'Source: ' : isHi ? 'स्रोत: ' : isMr ? 'स्रोत: ' : 'સ્ત્રોત: '}{scheme.officialSource}
                    </span>
                    <span>
                      {isEn ? 'Updated: ' : isHi ? 'अपडेट: ' : isMr ? 'अद्यतन: ' : 'અપડેટ: '}{scheme.lastUpdated}
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
                      : isMr 
                      ? `${scheme.requiredDocs.length} कागदपत्रे आवश्यक` 
                      : isKhi
                      ? `${scheme.requiredDocs.length} કાગળ ખપે`
                      : `${scheme.requiredDocs.length} કાગળો જરૂરી`}
                  </span>
                </span>

                <span className="text-[#005A9C] group-hover:text-[#003366] flex items-center gap-1 text-[11px] font-extrabold">
                  <span>
                    {isEn ? 'Pre-Check Docs' : isHi ? 'दस्तावेज़ प्री-चेक' : isMr ? 'कागदपत्रे पूर्व-तपासणी' : isKhi ? 'કાગળ પ્રી-ચેક' : 'દસ્તાવેજ પ્રી-ચેક'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Pagination & "View All 39 Schemes" Controls */}
      {maxItems && displayedSchemes.length < filteredSchemes.length && (
        <div className="bg-gradient-to-r from-blue-50 via-white to-amber-50 rounded-2xl p-4 sm:p-6 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm text-center sm:text-left">
          <div className="flex items-center gap-3">
            <GovLogo className="w-10 h-10 shrink-0" />
            <div>
              <h4 className="font-black text-[#003366] text-sm sm:text-base">
                {isEn 
                  ? `Showing top ${displayedSchemes.length} of ${filteredSchemes.length} public services` 
                  : isHi 
                  ? `शीर्ष ${displayedSchemes.length} सेवाएं प्रदर्शित (कुल ${filteredSchemes.length} में से)` 
                  : isMr 
                  ? `प्रमुख ${displayedSchemes.length} सेवा दर्शविल्या आहेत (एकूण ${filteredSchemes.length} पैकी)` 
                  : `મુખ્ય ${displayedSchemes.length} સેવાઓ દર્શાવેલ છે (કુલ ${filteredSchemes.length} સેવાઓમાંથી)`}
              </h4>
              <p className="text-xs text-slate-500">
                {isEn 
                  ? 'Access full directory with document checklists, official forms & online tracking.' 
                  : isHi 
                  ? 'सभी सरकारी सेवाओं, आवश्यक दस्तावेजों और ट्रैकिंग के लिए पूर्ण निर्देशिका खोलें।' 
                  : isMr 
                  ? 'सर्व शासकीय सेवा, आवश्यक कागदपत्रे आणि ट्रॅकिंगसाठी संपूर्ण निर्देशिका उघडा.' 
                  : 'બધા સરકારી દાખલા, જરૂરી પુરાવા અને યોજનાઓની વિગતવાર યાદી જોવા માટે અહીં ક્લિક કરો.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('success');
              if (onViewAll) onViewAll();
              else setVisibleCount(filteredSchemes.length);
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#003366] hover:bg-[#002244] text-white font-extrabold text-xs shadow-md active:scale-95 transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <span>
              {isEn ? 'Explore All 39 Public Services →' : isHi ? 'सभी ३९ सरकारी सेवाएं देखें →' : isMr ? 'सर्व ३९ शासकीय सेवा पहा →' : 'તમામ ૩૯ સરકારી સેવાઓ જુઓ →'}
            </span>
          </button>
        </div>
      )}

      {!maxItems && visibleCount < filteredSchemes.length && (
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => {
              triggerHaptic('tap');
              setVisibleCount(prev => Math.min(prev + 9, filteredSchemes.length));
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-[#003366] font-bold text-xs shadow-xs transition cursor-pointer"
          >
            {isEn 
              ? `Load More (+9) • Showing ${displayedSchemes.length} of ${filteredSchemes.length}` 
              : isHi 
              ? `और देखें (+९) • ${displayedSchemes.length} / ${filteredSchemes.length}` 
              : isMr 
              ? `आणखी पहा (+९) • ${displayedSchemes.length} / ${filteredSchemes.length}` 
              : `વધુ ૯ યોજનાઓ જુઓ (+૯ વધુ) • ${displayedSchemes.length}/${filteredSchemes.length}`}
          </button>
          <button
            onClick={() => {
              triggerHaptic('tap');
              setVisibleCount(filteredSchemes.length);
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#005A9C] font-extrabold text-xs border border-blue-200 transition cursor-pointer"
          >
            {isEn ? 'View All (39)' : isHi ? 'सभी ३९ देखें' : isMr ? 'सर्व ३९ पहा' : 'બધી ૩૯ યોજનાઓ જુઓ'}
          </button>
        </div>
      )}

      {filteredSchemes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-2">
          <p className="text-base font-extrabold text-[#003366]">
            {isEn ? 'No schemes or services found' : isHi ? 'कोई सेवा या योजना नहीं मिली' : isMr ? 'कोणतीही योजना किंवा सेवा आढळली नाही' : 'કોઈ સેવા કે યોજના મળી નથી'}
          </p>
          <p className="text-xs text-slate-500">
            {isEn 
              ? 'Please try a different search keyword or category filter.' 
              : isHi 
              ? 'कृपया अन्य कीवर्ड या श्रेणी फ़िल्टर आज़माएं।' 
              : isMr 
              ? 'कृपया वेगळा कीवर्ड किंवा श्रेणी फिल्टर वापरून पहा.' 
              : 'કૃપા કરીને અન્ય કીવર્ડ અથવા કેટેગરી ફિલ્ટર અજમાવો.'}
          </p>
        </div>
      )}

    </div>
  );
};
