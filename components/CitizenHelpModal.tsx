'use client';

import React from 'react';
import { 
  X, Phone, Clock, FileText, CheckCircle2, Shield, AlertTriangle, 
  HelpCircle, ExternalLink, MessageSquare, Headphones, Award
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { speakGuidance } from '@/lib/voice';
import { Language, t } from '@/lib/translations';

interface CitizenHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export function CitizenHelpModal({ isOpen, onClose, lang }: CitizenHelpModalProps) {
  if (!isOpen) return null;

  const handleClose = () => {
    triggerHaptic('tap');
    onClose();
  };

  // Body scroll lock on modal open
  React.useEffect(() => {
    if (isOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [isOpen]);

  const isGu = lang === 'gu';
  const isHi = lang === 'hi';
  const isMr = lang === 'mr';
  const isEn = lang === 'en';

  const faqs = [
    {
      q: isGu 
        ? '૧. શું મારે જન સેવા કેન્દ્ર પર સવારે વહેલા લાઈનમાં ઊભા રહેવું પડશે?' 
        : isHi 
        ? '१. क्या मुझे जन सेवा केंद्र पर सुबह जल्दी कतार में खड़ा रहना पड़ेगा?'
        : isMr
        ? '१. मला जन सेवा केंद्रावर सकाळी लवकर रांगेत उभे राहावे लागेल का?'
        : '1. Do I need to stand in physical lines early morning at Jan Seva Kendra?',
      a: isGu
        ? 'ના. QueueLess પોર્ટલ દ્વારા તમે ઘરેથી જ તમારો સ્લોટ અને ટોકન બુક કરી શકો છો. તમને ફાળવેલા સમયથી ૧૦ મિનિટ પહેલાં પહોંચીને પ્રવેશદ્વારે QR સ્કેન કરી સીધા કાઉન્ટર પર જઈ શકાય છે.'
        : isHi
        ? 'नहीं। QueueLess पोर्टल द्वारा आप घर बैठे स्लॉट और टोकन प्राप्त कर सकते हैं। अपने स्लॉट समय से 10 मिनट पहले पहुंचकर क्यूआर कोड स्कैन करें और काउंटर पर उपस्थित हों।'
        : isMr
        ? 'नाही. QueueLess पोर्टलद्वारे आपण घरबसल्या अधिकृत स्लॉट आणि टोकन मिळवू शकता. ठरलेल्या वेळेच्या १० मिनिटे आधी पोहोचून प्रवेशद्वारावर क्यूआर कोड स्कॅन करून थेट काउंटरवर जाता येते.'
        : 'No. You can book an official virtual token slot in advance. Arrive 10 minutes prior to your allocated slot and scan your digital QR pass at the entrance.'
    },
    {
      q: isGu
        ? '૨. જો હું ટ્રાફિક કે અન્ય કારણસર મોડો પહોંચું તો શું મારો વારો રદ થશે?'
        : isHi
        ? '२. यदि मैं ट्रैफिक या व्यक्तिगत कारण से देर से पहुँचूँ तो क्या मेरा नंबर रद्द होगा?'
        : isMr
        ? '२. ट्रॅफिक किंवा इतर कारणामुळे मला उशीर झाल्यास माझा नंबर रद्द होईल का?'
        : '2. What if I arrive late due to traffic or emergencies? Will my turn be cancelled?',
      a: isGu
        ? 'ના, વારો રદ નહીં થાય. તમારા ડિજિટલ ટોકન પાસમાં "હું મોડો પડીશ (+૨૦ મિનિટ)" બટન ઉપલબ્ધ છે. તેને દબાવતાં કાઉન્ટર અધિકારીને સિસ્ટમ દ્વારા આપમેળે જાણ થાય છે અને તમારો વારો આગળ ખસેડાય છે.'
        : isHi
        ? 'नहीं, रद्द नहीं होगा। अपने डिजिटल टोकन पास पर "मैं देर से पहुँचूँगा (+20 मिनट)" बटन दबाएं। काउंटर अधिकारी को स्वचालित सूचना मिल जाएगी और आपका स्लॉट आगे स्थानांतरित हो जाएगा।'
        : isMr
        ? 'नाही, रद्द होणार नाही. आपल्या डिजिटल टोकन पासवर "मला उशीर होईल (+२० मिनिटे)" बटण आहे. त्यावर क्लिक केल्यास काउंटर अधिकाऱ्याला त्वरित माहिती मिळते आणि आपला नंबर पुढे सरकवला जातो.'
        : 'No. Use the "Running Late (+20 mins)" button on your digital pass to shift your queue slot safely without losing your appointment.'
    },
    {
      q: isGu
        ? '૩. કચેરી મુલાકાત વખતે કયા મુખ્ય દસ્તાવેજો સાથે રાખવા જરૂરી છે?'
        : isHi
        ? '३. कार्यालय भ्रमण के समय कौन से आवश्यक दस्तावेज साथ रखने चाहिए?'
        : isMr
        ? '३. कार्यालयात जाताना कोणती मुख्य कागदपत्रे सोबत ठेवणे आवश्यक आहे?'
        : '3. Which mandatory documents should I carry during my office visit?',
      a: isGu
        ? 'અસલ આધાર કાર્ડ, રેશનકાર્ડ, ૨ પાસપોર્ટ સાઇઝ ફોટો અને પસંદ કરેલી યોજનાનું એપ્લિકેશન પ્રી-ચેક પ્રિન્ટ અથવા ડિજિટલ રસીદ. કેમેરા સ્કેનર દ્વારા તમે ઘરેથી જ દસ્તાવેજોની ચકાસણી કરી શકો છો.'
        : isHi
        ? 'मूल आधार कार्ड, राशन कार्ड, 2 पासपोर्ट फोटो और संबंधित सेवा का आवेदन पत्र। आप पोर्टल के कैमरा स्कैनर से घर बैठे दस्तावेजों की पूर्व-जांच कर सकते हैं।'
        : isMr
        ? 'मूळ आधार कार्ड, रेशनकार्ड, २ पासपोर्ट फोटो आणि संबंधित योजनेची डिजिटल पावती. पोर्टलवरील कॅमेरा स्कॅनरद्वारे आपण घरबसल्या कागदपत्रांची पूर्व-तपासणी करू शकता.'
        : 'Original Aadhaar Card, Ration Card, 2 passport size photographs, and pre-verified documents. You can run pre-validation using the Portal Camera Scanner.'
    },
    {
      q: isGu
        ? '૪. ગુજરાત લોક સેવા હક્ક અધિનિયમ (GRTSA ૨૦૧૩) શું છે?'
        : isHi
        ? '४. गुजरात लोक सेवा अधिकार अधिनियम (GRTSA 2013) क्या है?'
        : isMr
        ? '४. गुजरात लोकसेवा हक्क कायदा (GRTSA २०१३) काय आहे?'
        : '4. What is the Gujarat Right to Public Services Act (GRTSA 2013)?',
      a: isGu
        ? 'આ કાયદા હેઠળ દરેક નાગરિકને નિશ્ચિત સમયમર્યાદા (SLA) માં સરકારી સેવા મેળવવાનો કાનૂની અધિકાર છે. જો નિયત સમયમાં સેવા ન મળે તો જવાબદાર અધિકારી વિરુદ્ધ કલેક્ટર કક્ષાએ આપમેળે એસ્કેલેશન થાય છે.'
        : isHi
        ? 'इस अधिनियम के तहत प्रत्येक नागरिक को समयबद्ध लोक सेवा प्राप्त करने का वैधानिक अधिकार है। समय पर सेवा न मिलने पर संबंधित प्राधिकारी के विरुद्ध स्वतः एस्केलेशन होता है।'
        : isMr
        ? 'या कायद्यानुसार प्रत्येक नागरिकाला विहित मुदतीत शासकीय सेवा मिळवण्याचा कायदेशीर हक्क आहे. मुदतीत सेवा न मिळाल्यास जिल्हाधिकारी स्तरावर तक्रार आपोआप दाखल होते.'
        : 'GRTSA 2013 legally guarantees time-bound service delivery for Gujarat citizens. Non-compliance automatically escalates to District Collector oversight.'
    }
  ];

  return (
    <div 
      onClick={handleClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden modal-backdrop animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden h-[92dvh] max-h-[92dvh] sm:h-auto sm:max-h-[88vh] flex flex-col animate-in slide-in-from-bottom duration-200"
      >
        {/* MOBILE BOTTOM SHEET DRAG PILL */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-[#003366] shrink-0">
          <div className="w-12 h-1.5 bg-white/40 rounded-full" />
        </div>

        {/* MODAL HEADER */}
        <div className="bg-[#003366] text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF9933] text-slate-900 flex items-center justify-center font-black shadow-md">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-900/80 text-blue-200 px-2 py-0.5 rounded border border-blue-700">
                  {isGu ? 'ગુજરાત સરકાર • GAD' : isHi ? 'गुजरात सरकार • GAD' : isMr ? 'गुजरात शासन • GAD' : 'Govt of Gujarat • GAD'}
                </span>
                <span className="text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isGu ? 'સહાય ડેસ્ક કાર્યરત' : isHi ? 'हेल्प डेस्क सक्रिय' : isMr ? 'मदत डेस्क कार्यरत' : 'Help Desk Active'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5">
                {isGu ? 'નાગરિક સહાય અને ફરિયાદ નિવારણ ડેસ્ક' : isHi ? 'नागरिक सहायता एवं शिकायत निवारण डेस्क' : isMr ? 'नागरिक सहाय्य व तक्रार निवारण डेस्क' : 'Citizen Help & Grievance Redressal Desk'}
              </h2>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close Help Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 modal-scroll-area flex-1">
          {/* OFFICIAL HELPLINES GRID */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#005A9C]" />
              <span>{isGu ? 'સત્તાવાર ટોલ-ફ્રી હેલ્પલાઇન નંબરો' : isHi ? 'आधिकारिक टोल-फ्री हेल्पलाइन नंबर' : isMr ? 'अधिकृत टोल-फ्री हेल्पलाइन क्रमांक' : 'Official Toll-Free Helplines'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3.5 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#003366] text-white flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-600">
                    {isGu ? 'જન સેવા કેન્દ્ર હેલ્પલાઇન (ટોલ ફ્રી)' : isHi ? 'जन सेवा केंद्र हेल्पलाइन (टोल फ्री)' : isMr ? 'जन सेवा केंद्र हेल्पलाइन (टोल फ्री)' : 'Jan Seva Kendra Helpline (Toll Free)'}
                  </p>
                  <a href="tel:18002335500" className="text-lg font-black text-[#003366] hover:underline block leading-tight">
                    1800-233-5500
                  </a>
                  <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#FF9933]" />
                    <span>{isGu ? 'સોમ-શનિ • ૧૦:૩૦ AM થી ૦૬:૧૦ PM' : isHi ? 'सोम-शनि • 10:30 AM से 06:10 PM' : isMr ? 'सोम-शनि • १०:३० AM ते ०६:१० PM' : 'Mon-Sat • 10:30 AM to 06:10 PM'}</span>
                  </p>
                </div>
              </div>

              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FF9933] text-slate-900 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-600">
                    {isGu ? 'મુખ્યમંત્રી ફરિયાદ નિવારણ (CM Helpline)' : isHi ? 'मुख्यमंत्री शिकायत निवारण (CM Helpline)' : isMr ? 'मुख्यमंत्री तक्रार निवारण (CM Helpline)' : 'Chief Minister Grievance (CM Helpline)'}
                  </p>
                  <a href="tel:1076" className="text-lg font-black text-amber-950 hover:underline block leading-tight">
                    1076
                  </a>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {isGu ? '૨૪x૭ અવિરત નાગરિક સેવા' : isHi ? '24x7 निरंतर नागरिक सेवा' : isMr ? '२४x७ अखंड नागरिक सेवा' : '24x7 Round the Clock Service'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* GRTSA 2013 CITIZENS' CHARTER SLA HIGHLIGHT */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-[#138808]" />
              <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                {isGu ? 'ગુજરાત લોક સેવા હક્ક અધિનિયમ (GRTSA ૨૦૧૩) બાંહેધરી' : isHi ? 'गुजरात लोक सेवा अधिकार अधिनियम (GRTSA 2013) गारंटी' : isMr ? 'गुजरात लोकसेवा हक्क कायदा (GRTSA २०१३) हमी' : 'GRTSA 2013 Service Delivery Guarantee'}
              </h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {isGu 
                ? 'રાજ્ય સરકારના કાનૂની માળખા હેઠળ તમામ આવક દાખલા, જાતિ પ્રમાણપત્રો અને રેશન સેવાઓ સમયબદ્ધ SLA માં આપવી ફરજિયાત છે. જો સમયમર્યાદા ચૂકી જવાય તો જિલ્લા કલેક્ટરના સુપરવિઝન હેઠળ કેસ આપમેળે પ્રાયોરિટીમાં આવે છે.'
                : isHi
                ? 'राज्य सरकार के विधिक ढांचे के तहत आय प्रमाण पत्र, जाति प्रमाण पत्र व राशन सेवाएं समयबद्ध एसएलए में देना अनिवार्य है। विलंब होने पर जिला कलेक्टर पर्यवेक्षण में स्वतः प्राथमिकता मिलती है।'
                : isMr
                ? 'शासकीय नियमांनुसार सर्व उत्पन्न दाखले, जात प्रमाणपत्रे व शिधापत्रिका सेवा वेळेत देणे बंधनकारक आहे. मुदत उलटल्यास जिल्हाधिकारी यांच्या देखरेखीखाली प्रकरण आपोआप प्राधान्याने हाताळले जाते.'
                : 'All certificates and civic services are legally bounded by strict SLA timelines. Delays trigger automatic priority escalation to District Collector monitoring.'}
            </p>
          </div>

          {/* FREQUENTLY ASKED QUESTIONS (FAQS) */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-[#FF9933]" />
              <span>{isGu ? 'નાગરિક સામાન્ય પ્રશ્નોત્તરી (FAQs)' : isHi ? 'नागरिक सामान्य प्रश्नोत्तरी (FAQs)' : isMr ? 'नागरिक नेहमी विचारले जाणारे प्रश्न (FAQs)' : 'Citizen Frequently Asked Questions'}</span>
            </h3>

            <div className="space-y-2.5">
              {faqs.map((faq, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left">
                  <p className="text-xs font-bold text-[#003366] mb-1">
                    {faq.q}
                  </p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 pb-[max(0.85rem,env(safe-area-inset-bottom))] flex items-center justify-between text-xs shrink-0 sticky bottom-0 z-20">
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            {isGu ? 'સામાન્ય વહીવટ વિભાગ • સચિવાલય, ગાંધીનગર' : isHi ? 'सामान्य प्रशासन विभाग • सचिवालय, गांधीनगर' : isMr ? 'सामान्य प्रशासन विभाग • सचिवालय, गांधीनगर' : 'General Administration Dept • Sachivalaya, Gandhinagar'}
          </span>
          <button
            onClick={handleClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] active:scale-95 text-white font-bold transition cursor-pointer"
          >
            {isGu ? 'સમજાઈ ગયું (બંધ કરો)' : isHi ? 'समझ गया (बंद करें)' : isMr ? 'समजले (बंद करा)' : 'Understood (Close)'}
          </button>
        </div>
      </div>
    </div>
  );
}
