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
  getSchemeStructuredBenefit 
} from '@/lib/schemes-data';
import { triggerHaptic } from '@/lib/haptics';

interface SchemesCatalogProps {
  onSelectScheme: (scheme: SchemeItem) => void;
}

export const SchemesCatalog: React.FC<SchemesCatalogProps> = ({ onSelectScheme }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', labelGu: 'તમામ યોજનાઓ (All 39)', icon: '🏛️' },
    { id: 'agriculture', labelGu: '🌾 Agriculture (૧૨)', icon: '🌾' },
    { id: 'healthcare', labelGu: '🏥 Healthcare & Social (૯)', icon: '🏥' },
    { id: 'education', labelGu: '🎓 Education (૧૦)', icon: '🎓' },
    { id: 'welfare', labelGu: '🏛️ Civic & Revenue (૮)', icon: '🏛️' },
  ];

  const personaFilters = [
    { id: 'farmer', labelGu: 'ખેડૂત (Farmer)', icon: '🌾', category: 'agriculture' },
    { id: 'student', labelGu: 'વિદ્યાર્થી (Student)', icon: '🎓', category: 'education' },
    { id: 'woman', labelGu: 'મહિલા / માતા (Women)', icon: '👩', category: 'healthcare' },
    { id: 'citizen', labelGu: 'દાખલા / રેકોર્ડ્સ (Civic)', icon: '📄', category: 'welfare' },
  ];

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
        scheme.department.toLowerCase().includes(q) ||
        (scheme.categoryGu && scheme.categoryGu.toLowerCase().includes(q));

      return catMatch && searchMatch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#003366] text-xs font-bold border border-blue-200 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#FF9933]" />
            <span>39 Gujarat Public Services Directory • Structured Reference</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#003366] tracking-tight">
            યોજના શોધ & દસ્તાવેજ પૂર્વ-ચકાસણી ({ALL_YOJANAS.length} Services)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            કચેરીએ જતાં પહેલાં યોજનાની પાત્રતા, જરૂરી કાગળો, સરકારી ફી અને અંદાજિત સમય ચકાસો.
          </p>
        </div>

        {/* Live Search Bar */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="યોજના અથવા સેવા શોધો: ટ્રેક્ટર, MYSY, આવક..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-[#005A9C] shadow-xs"
          />
        </div>
      </div>

      {/* Quick Persona Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> ઝડપી ફિલ્ટર:
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
            <span>{p.labelGu}</span>
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
            <span>{c.labelGu}</span>
          </button>
        ))}
      </div>

      {/* Schemes Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSchemes.map((scheme) => {
          const eligibility = getSchemeEligibility(scheme);
          const sourceInfo = getSchemeOfficialSource(scheme);
          const benefit = getSchemeStructuredBenefit(scheme);

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
                    {scheme.categoryGu}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-bold text-[#138808] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      {scheme.fee === 0 ? 'સરકારી ફી: ₹૦ (મફત)' : `સરકારી ફી: ₹${scheme.fee}`}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <h3 className="font-extrabold text-[#003366] text-sm sm:text-base leading-snug group-hover:text-[#005A9C] transition">
                    {scheme.titleGu}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                    {scheme.titleEn}
                  </p>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1">
                    વિભાગ: {scheme.department}
                  </p>
                </div>

                {/* Structured Benefit Box */}
                <div className="bg-[#F5F7FA] border border-slate-200/80 rounded-2xl p-3 space-y-1">
                  <p className="text-[10px] font-black text-amber-900 uppercase">
                    {benefit.headlineGu}
                  </p>
                  <p className="text-[11px] font-bold text-slate-700 line-clamp-2 leading-relaxed">
                    ✨ {scheme.benefitGu}
                  </p>
                  <p className="text-[9.5px] text-slate-400 italic">
                    (Amount/eligibility depends on applicable category rules)
                  </p>
                </div>

                {/* "Can I Apply?" Eligibility Snippet */}
                <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-2 text-left">
                  <HelpCircle className="w-3.5 h-3.5 text-[#005A9C] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black text-[#003366]">હું અરજી કરી શકું? (Can I Apply?):</p>
                    <p className="text-[10.5px] text-slate-600 line-clamp-2 leading-tight mt-0.5">
                      {eligibility.gu}
                    </p>
                  </div>
                </div>

                {/* Expected SLA & Official Source reference */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium pt-1">
                  <span className="flex items-center gap-1 font-bold text-[#003366]">
                    <Clock className="w-3 h-3 text-[#FF9933]" />
                    <span>અપેક્ષિત નિકાલ: {scheme.slaDays} દિવસ</span>
                  </span>
                  <span className="truncate max-w-[140px] text-slate-400" title={sourceInfo.source}>
                    સ્ત્રોત: {sourceInfo.source}
                  </span>
                </div>
              </div>

              {/* Card Footer: Required docs & Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                  <FileCheck className="w-3.5 h-3.5 text-[#005A9C]" />
                  <span>{scheme.requiredDocs.length} કાગળો જરૂરી</span>
                </span>

                <span className="text-[#005A9C] group-hover:text-[#003366] flex items-center gap-1 text-[11px] font-extrabold">
                  <span>દસ્તાવેજ પ્રી-ચેક</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSchemes.length === 0 && (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-2">
          <p className="text-base font-extrabold text-[#003366]">કોઈ સેવા કે યોજના મળી નથી</p>
          <p className="text-xs text-slate-500">કૃપા કરીને અન્ય કીવર્ડ અથવા કેટેગરી ફિલ્ટર અજમાવો.</p>
        </div>
      )}

    </div>
  );
};
