'use client';

import React, { useState } from 'react';
import { 
  X, CheckSquare, Square, Share2, Camera, ShieldCheck, 
  Clock, IndianRupee, Volume2, ArrowRight, FileCheck2, Lock, 
  CheckCircle2, HelpCircle, ExternalLink, AlertCircle, Info, Building2
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { speakGuidance } from '@/lib/voice';
import { 
  SchemeItem, 
  getSchemeEligibility, 
  getSchemeOfficialSource, 
  getSchemeStructuredBenefit,
  getProcessingTimelineInfo
} from '@/lib/schemes-data';

interface SchemeDrawerProps {
  scheme: SchemeItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenScanner: () => void;
  isLoggedIn?: boolean;
  onCollectToken?: (scheme: SchemeItem) => void;
}

export const SchemeDrawer: React.FC<SchemeDrawerProps> = ({
  scheme,
  isOpen,
  onClose,
  onOpenScanner,
  isLoggedIn = false,
  onCollectToken,
}) => {
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});

  if (!isOpen || !scheme) return null;

  const totalDocs = scheme.requiredDocs.length;
  const verifiedCount = Object.values(checkedDocs).filter(Boolean).length;
  const progressPercent = Math.round((verifiedCount / totalDocs) * 100);
  const eligibility = getSchemeEligibility(scheme);
  const sourceInfo = getSchemeOfficialSource(scheme);
  const benefit = getSchemeStructuredBenefit(scheme);
  const timelineInfo = getProcessingTimelineInfo(scheme);

  const toggleDoc = (docName: string) => {
    triggerHaptic('tap');
    setCheckedDocs(prev => ({ ...prev, [docName]: !prev[docName] }));
  };

  const handleShareWhatsApp = () => {
    triggerHaptic('success');
    const docList = scheme.requiredDocs.map((d, i) => `${i + 1}. ${d.nameGu}`).join('\n');
    const deliveryText = timelineInfo.isVaries ? 'પ્રક્રિયા સમય અલગ હોઈ શકે છે (કચેરી ખાતે ચકાસો)' : timelineInfo.formattedTimeGu;
    const message = `🏛️ *${scheme.titleGu}*\nકચેરીએ જતાં પહેલાં માર્ગદર્શિકા (Before You Visit):\n\n📄 જરૂરી કાગળો:\n${docList}\n\n⏱️ અપેક્ષિત ડિલિવરી સમય: ${deliveryText}\n🏢 કાઉન્ટર મુલાકાત પ્રતીક્ષા: ~૧૫-૨૦ મિનિટ\n💰 સરકારી ફી: ${scheme.fee === 0 ? '₹૦ (મફત)' : `₹${scheme.fee}`}\n🏛️ વિભાગ: ${scheme.department}\n🔗 સત્તાવાર સ્ત્રોત: ${scheme.officialSource} (અપડેટ: ${scheme.lastUpdated})\n\nℹ️ આ ઓટોમેટેડ પૂર્વ-માર્ગદર્શન છે. આખરી ચકાસણી અધિકૃત સરકારી અધિકારી દ્વારા કરવામાં આવે છે.`;
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
        <div className="bg-[#003366] text-white p-4 sm:p-5 shrink-0 flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FF9933] bg-[#002244] px-2.5 py-0.5 rounded-full border border-blue-800">
              {scheme.categoryGu} • {scheme.department}
            </span>
            <h2 className="text-xl font-black text-white mt-1 leading-tight">
              {scheme.titleGu}
            </h2>
            <p className="text-xs text-blue-200">{scheme.titleEn}</p>
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
            
          {/* 📋 WHAT YOU NEED BEFORE VISITING (Requirement 17 & Processing Time) */}
          <div className="bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">📌</span>
                <h3 className="text-xs font-black text-amber-950 uppercase tracking-wide">
                  કચેરીએ જતાં પહેલાં માર્ગદર્શિકા (Before You Visit Guidance)
                </h3>
              </div>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md">
                સત્તાવાર વિગતો
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
                      <span>અપેક્ષિત પ્રક્રિયા / ડિલિવરી સમય</span>
                    </p>
                  </div>
                  <p className="font-extrabold text-[#003366] text-sm mt-1 leading-snug">
                    {timelineInfo.isVaries ? (
                      <span className="text-amber-800 text-xs font-bold leading-tight block">
                        પ્રક્રિયા સમય અલગ હોઈ શકે છે — સંબંધિત કચેરી ખાતે ચકાસો
                      </span>
                    ) : (
                      timelineInfo.formattedTimeGu
                    )}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    {timelineInfo.isVaries ? '(Varies across offices / batch cycles)' : `(${timelineInfo.formattedTimeEn})`}
                  </p>
                </div>

                {/* Statutory vs Norm vs Batch Cycle Note */}
                <div className="mt-2 pt-1.5 border-t border-slate-100">
                  {scheme.slaType === 'statutory_grtsa' ? (
                    <div className="bg-blue-50 border border-blue-200 rounded p-1.5 text-[9px] text-blue-900 font-medium">
                      <span className="font-extrabold text-[#005A9C] block">⚖️ GRTSA ૨૦૧૩ અધિસૂચિત કાનૂની સમયમર્યાદા</span>
                      <p className="text-[8.5px] text-blue-800 mt-0.5">
                        {scheme.statutorySlaNoteGu || 'ગુજરાત જાહેર સેવા હક્ક અધિનિયમ ૨૦૧૩ હેઠળ કાયદેસર સમયમર્યાદા.'}
                      </p>
                    </div>
                  ) : scheme.slaType === 'departmental_norm' ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded p-1 text-[9px] text-emerald-800 font-medium">
                      🏛️ સિટીઝન ચાર્ટર ધોરણ (વિભાગીય સમયગાળો)
                    </div>
                  ) : (
                    <div className="bg-slate-100 rounded p-1 text-[9px] text-slate-600">
                      📋 યોજના આધારિત ચક્ર / ક્વોટા મંજૂરી (GRTSA લાગુ નથી)
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Office Appointment / Queue Waiting Time */}
              <div className="bg-white p-3 rounded-xl border border-amber-200 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-[#005A9C]" />
                    <span>કચેરી મુલાકાત પ્રતીક્ષા સમય</span>
                  </p>
                  <p className="font-extrabold text-slate-800 text-sm mt-1">
                    ~૧૫-૨૦ મિનિટ (કાઉન્ટર સમય)
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    Office Queue / Counter Waiting Time
                  </p>
                </div>
                <div className="mt-2 pt-1.5 border-t border-slate-100 text-[9px] text-slate-500">
                  ℹ️ ટોકન સ્લોટ પર પહોંચવાથી લાઈન વગર નિર્ધારિત સમયમાં વેરિફિકેશન પૂર્ણ થાય છે.
                </div>
              </div>

              {/* 3. Government Fee */}
              <div className="bg-white p-3 rounded-xl border border-amber-200">
                <p className="text-[10px] text-slate-500 font-bold uppercase flex items-center gap-1">
                  <IndianRupee className="w-3 h-3 text-[#138808]" />
                  <span>સરકારી નિયત ફી</span>
                </p>
                <p className="font-extrabold text-[#138808] text-base mt-1">
                  {scheme.fee === 0 ? '₹૦ (સંપૂર્ણ મફત)' : `₹${scheme.fee}`}
                </p>
                <p className="text-[9px] text-slate-400">
                  {scheme.fee === 0 ? 'કોઈ સરકારી ચાર્જ નથી' : 'અધિકૃત સરકારી સેવા ફી'}
                </p>
              </div>

              {/* 4. Issuing Department & Official Source */}
              <div className="bg-white p-3 rounded-xl border border-amber-200 flex flex-col justify-between">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">વિભાગ અને સત્તાવાર સ્ત્રોત</p>
                  <p className="font-bold text-[#003366] text-xs mt-1 leading-snug">
                    {scheme.department}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-1 truncate" title={scheme.officialSource}>
                    🔗 {scheme.officialSource}
                  </p>
                </div>
                <p className="text-[9px] text-slate-400 mt-1">
                  છેલ્લે અપડેટ: {scheme.lastUpdated}
                </p>
              </div>
            </div>

            <div className="text-[11px] text-amber-900 bg-amber-100/60 p-2.5 rounded-xl flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>ધ્યાન રાખો:</strong> ઉપર દર્શાવેલ <em>અપેક્ષિત પ્રક્રિયા સમય</em> અરજી જમા થયા પછી પ્રમાણપત્ર/લાભ જારી થવાનો અપેક્ષિત સમય છે, જ્યારે <em>કચેરી મુલાકાત સમય (~૧૫-૨૦ મિ.)</em> ફક્ત કાઉન્ટર પર દસ્તાવેજ જમા/ચકાસણીનો સમય છે.
              </p>
            </div>
          </div>

          {/* 👤 ELIGIBILITY: CAN I APPLY? */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-[#003366] flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#005A9C]" />
                <span>કોણ અરજી કરી શકે? (Eligibility Criteria)</span>
              </span>
            </div>
            <p className="text-xs font-bold text-slate-800 leading-relaxed">{eligibility.gu}</p>
            <p className="text-[11px] text-slate-500">{eligibility.en}</p>
          </div>

          {/* 🌟 STRUCTURED BENEFIT */}
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                <span>✨ યોજના લાભ (Benefits)</span>
              </span>
              <button
                onClick={() => speakGuidance(scheme.benefitGu)}
                className="text-[#003366] hover:text-[#005A9C] text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" /> સાંભળો
              </button>
            </div>
            <p className="text-xs font-bold text-slate-800 leading-relaxed">{scheme.benefitGu}</p>
            <p className="text-[11px] text-slate-500">{scheme.benefit}</p>
            <p className="text-[10px] text-slate-400 italic pt-1">
              *વાસ્તવિક લાભની રકમ/મંજૂરી સંબંધિત વિભાગના વર્તમાન નિયમો અને પાત્રતા પર આધારિત છે.
            </p>
          </div>

          {/* Document Readiness Progress Gauge */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#003366]">દસ્તાવેજ ઉપલબ્ધતા (Readiness Score)</span>
              <span className={`${progressPercent === 100 ? 'text-[#138808]' : 'text-[#FF9933]'}`}>
                {verifiedCount}/{totalDocs} કાગળો તૈયાર ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#005A9C] via-[#FF9933] to-[#138808] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-500">
              તમારી પાસે હાજર કાગળો પર ટિક કરો અથવા કેમેરા વડે પ્રી-ચેક કરો.
            </p>
          </div>

          {/* Required Documents Interactive Checklist */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-[#003366] uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-[#005A9C]" />
              <span>જરૂરી દસ્તાવેજોનું ચેકલિસ્ટ ({totalDocs} Documents)</span>
            </h4>

            <div className="space-y-2">
              {scheme.requiredDocs.map((doc, idx) => {
                const isChecked = !!checkedDocs[doc.nameGu];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleDoc(doc.nameGu)}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition select-none ${
                      isChecked
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                        : 'bg-[#F5F7FA] border-slate-200 text-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-[#138808] shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <div>
                        <p className="text-xs font-bold leading-tight">{doc.nameGu}</p>
                        <p className="text-[10px] text-slate-500">{doc.nameEn}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {doc.required ? (
                        <span className="text-[9px] font-bold bg-blue-50 text-[#005A9C] border border-blue-200 px-1.5 py-0.5 rounded">
                          ફરજિયાત
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                          વૈકલ્પિક
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Official Source & Reference Banner (Requirement 6) */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[10.5px] text-slate-500 space-y-1">
            <p className="font-bold text-slate-700">સત્તાવાર સરકારી સંદર્ભ (Official Source):</p>
            <p>{sourceInfo.source} • છેલ્લી માહિતી: {sourceInfo.lastUpdated}</p>
            <p className="text-[9.5px] text-slate-400 italic">
              Reference information — confirm with the concerned department during formal submission.
            </p>
          </div>

          {/* Share on WhatsApp Button */}
          <button
            onClick={handleShareWhatsApp}
            className="w-full bg-emerald-50 hover:bg-emerald-100 text-[#138808] border border-emerald-300 rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>વોટ્સએપ પર ચેકલિસ્ટ મોકલો (Share on WhatsApp)</span>
          </button>

        </div>

        {/* Bottom Drawer Actions (Fixed) */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 space-y-2 shrink-0">
          <button
            onClick={() => {
              triggerHaptic('success');
              onOpenScanner();
            }}
            className="w-full bg-[#005A9C] hover:bg-[#003366] text-white font-extrabold py-3 sm:py-3.5 px-3 rounded-2xl text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 text-center cursor-pointer"
          >
            <Camera className="w-4 h-4 text-[#FF9933] shrink-0" />
            <span className="truncate">દસ્તાવેજ પ્રી-ચેક શરૂ કરો (Start Pre-Verification)</span>
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>

          {onCollectToken && (
            <button
              onClick={() => {
                triggerHaptic('tap');
                onCollectToken(scheme);
              }}
              className="w-full bg-amber-50 hover:bg-amber-100 text-[#003366] border border-amber-300 font-extrabold py-2.5 px-3 rounded-2xl text-[11px] sm:text-xs shadow-xs transition active:scale-95 flex items-center justify-center gap-2 text-center cursor-pointer"
            >
              {isLoggedIn ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#138808] shrink-0" />
                  <span>કચેરી ટોકન કલેક્ટ કરો (Collect Live Token)</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-[#FF9933] shrink-0" />
                  <span>ટોકન મેળવવા લૉગિન કરો (Citizen Identity Check)</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
