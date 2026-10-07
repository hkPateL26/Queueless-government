'use client';

import React, { useState } from 'react';
import { 
  Play, Volume2, Star, CheckCircle2, ChevronRight, ChevronLeft, 
  Ticket, Calendar, ArrowRight, ShieldCheck, UserCheck, X, Building,
  Clock, Sparkles, MapPin, Award
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { speakGuidance } from '@/lib/voice';
import { Language, t } from '@/lib/translations';
import { GovLogo } from '@/components/GovLogo';
import { BookingDetails } from '@/components/SlotBookingModal';

interface GovHeroShowcaseProps {
  currentUser: { name: string; role: string; area: string; token: string } | null;
  activeBooking: BookingDetails | null;
  onOpenTokenTracker: () => void;
  onOpenSlotModal: () => void;
  onOpenTokenPassModal: () => void;
  onLoginDemo: () => void;
  lang: Language;
}

export function GovHeroShowcase({
  currentUser,
  activeBooking,
  onOpenTokenTracker,
  onOpenSlotModal,
  onOpenTokenPassModal,
  onLoginDemo,
  lang
}: GovHeroShowcaseProps) {
  const [activeTab, setActiveTab] = useState<'video' | 'testimonials' | 'action'>('video');
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [currentTestimonialIdx, setCurrentTestimonialIdx] = useState(0);

  const isGu = lang === 'gu';
  const isHi = lang === 'hi';
  const isMr = lang === 'mr';
  const isEn = lang === 'en';

  const testimonials = [
    {
      name: isGu ? 'રમેશભાઈ પટેલ' : isHi ? 'रमेशभाई पटेल' : isMr ? 'रमेशभाई पटेल' : 'Rameshbhai Patel',
      role: isGu ? 'ખેડૂત • ગોંડલ (રાજકોટ)' : isHi ? 'किसान • गोंडल (राजकोट)' : isMr ? 'शेतकरी • गोंडल (राजकोट)' : 'Farmer • Gondal (Rajkot)',
      service: isGu ? 'આવકનો દાખલો (Income Certificate)' : isHi ? 'आय प्रमाण पत्र' : isMr ? 'उत्पन्न दाखला' : 'Income Certificate',
      quote: isGu 
        ? 'મામલતદાર કચેરીએ આવકના દાખલા માટે વહેલી સવારે લાઈનમાં ઊભા રહેવું ન પડ્યું. QueueLess સ્લોટ દ્વારા માત્ર ૧૨ મિનિટમાં પ્રમાણપત્ર હાથમાં આવી ગયું!'
        : isHi 
        ? 'मामलतदार कार्यालय में आय प्रमाण पत्र के लिए सुबह जल्दी कतार में नहीं लगना पड़ा। QueueLess स्लॉट से मात्र १२ मिनट में प्रमाण पत्र मिल गया!'
        : isMr 
        ? 'मामलतदार कार्यालयात उत्पन्न दाखल्यासाठी सकाळी लवकर रांगेत उभे राहावे लागले नाही. QueueLess स्लॉटमुळे अवघ्या १२ मिनिटांत प्रमाणपत्र मिळाले!'
        : 'Did not have to stand in long queues early morning. Got my income certificate within 12 minutes using QueueLess virtual slot!',
      rating: 5,
      timeSaved: '૨ કલાક બચ્યા (Saved 2 hrs)',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ramesh'
    },
    {
      name: isGu ? 'સુરેશભાઈ મોરે' : isHi ? 'सुरेशभाई मोरे' : isMr ? 'सुरेश मोरे' : 'Suresh More',
      role: isGu ? 'ટેક્સટાઇલ કારીગર • સચિન (સુરત)' : isHi ? 'टेक्सटाइल कारीगर • सचिन (सूरत)' : isMr ? 'टेक्सटाईल कारागीर • सचिन (सुरत)' : 'Textile Artisan • Sachin (Surat)',
      service: isGu ? 'રેશનકાર્ડ સેવા (Ration Card Service)' : isHi ? 'राशन कार्ड सेवा' : isMr ? 'रेशनकार्ड सेवा' : 'Ration Card Service',
      quote: isGu 
        ? 'કામધંધો છોડ્યા વિના બપોરે ફાળવેલા સમયે કચેરી પહોંચ્યો. પ્રવેશદ્વારે QR સ્કેન કરતાં જ કાઉન્ટર ૨ પરથી તરત બોલાવવામાં આવ્યો.'
        : isHi 
        ? 'काम छोड़े बिना दोपहर में निर्धारित समय पर पहुंचा। द्वार पर क्यूआर स्कैन करते ही काउंटर २ से तुरंत बुलावा आया।'
        : isMr 
        ? 'काम न सोडता दुपारी ठरलेल्या वेळी पोहोचलो. प्रवेशद्वारावर QR स्कॅन करताच काउंटर २ वरून लगेच नंबर लागला.'
        : 'Visited during lunch break without missing work. Scanned QR at entry and was directly called to Counter 2.',
      rating: 5,
      timeSaved: 'આખો દિવસ બચ્યો (Full day saved)',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Suresh'
    },
    {
      name: isGu ? 'પ્રિયાબેન જોશી' : isHi ? 'प्रियाबेन जोशी' : isMr ? 'प्रिया जोशी' : 'Priya Joshi',
      role: isGu ? 'કોલેજ વિદ્યાર્થીની • બોડકદેવ (અમદાવાદ)' : isHi ? 'कॉलेज छात्रा • बोडकदेव (अहमदाबाद)' : isMr ? 'महाविद्यालयीन विद्यार्थिनी • अहमदाबाद' : 'College Student • Ahmedabad',
      service: isGu ? 'MYSY શિષ્યવૃત્તિ દસ્તાવેજ ચકાસણી' : isHi ? 'MYSY छात्रवृत्ति सत्यापन' : isMr ? 'MYSY शिष्यवृत्ती पडताळणी' : 'MYSY Scholarship Verification',
      quote: isGu 
        ? 'MYSY સ્કોલરશીપ માટે દસ્તાવેજ વેરિફિકેશન માત્ર ૧૫ મિનિટમાં પૂરું થયું. ભીડ વગર આટલું સ્મૂધ સરકારી કામ પહેલીવાર જોયું!'
        : isHi 
        ? 'MYSY छात्रवृत्ति के लिए दस्तावेज सत्यापन केवल १५ मिनट में पूरा हुआ। बिना भीड़ इतना सुगम सरकारी कार्य पहली बार देखा!'
        : isMr 
        ? 'MYSY शिष्यवृत्तीसाठी कागदपत्र पडताळणी अवघ्या १५ मिनिटांत पूर्ण झाली. कोणत्याही गर्दीशिवाय अतिशय सुरळीत काम झाले!'
        : 'Completed document verification for MYSY scholarship in just 15 minutes. Hassle-free and zero crowd!',
      rating: 5,
      timeSaved: '૯૦ મિનિટ બચી (Saved 90 mins)',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'
    }
  ];

  const handleNextTestimonial = () => {
    triggerHaptic('tap');
    setCurrentTestimonialIdx((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrevTestimonial = () => {
    triggerHaptic('tap');
    setCurrentTestimonialIdx((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const activeItem = testimonials[currentTestimonialIdx];

  const handlePlayExplainer = () => {
    triggerHaptic('tap');
    setVideoModalOpen(true);
    const narration = isGu
      ? 'QueueLess પોર્ટલ વિડીયો માર્ગદર્શિકા. ઘરે બેઠા સરકારી સેવાઓ માટે સ્લોટ બુક કરો અને કચેરીએ સીધા પ્રવેશ મેળવો.'
      : isHi
      ? 'QueueLess पोर्टल वीडियो गाइड। घर बैठे सरकारी सेवाओं के लिए स्लॉट बुक करें और सीधे कार्यालय में प्रवेश पाएं।'
      : isMr
      ? 'QueueLess पोर्टल व्हिडिओ मार्गदर्शक. घरबसल्या शासकीय सेवांसाठी स्लॉट बुक करा आणि थेट कार्यालयात प्रवेश मिळवा.'
      : 'QueueLess portal walkthrough guide. Book government office appointments from home and enjoy zero-queue entry.';
    speakGuidance(narration);
  };

  return (
    <div className="relative w-full max-w-[340px] sm:max-w-[420px]">
      <div className="absolute -inset-3 bg-gradient-to-tr from-[#005A9C]/25 via-[#FF9933]/25 to-[#138808]/25 rounded-3xl blur-xl" />

      {/* IF USER HAS ACTIVE BOOKING OR IS LOGGED IN -> DISPLAY VERIFIED DIGITAL PASS */}
      {currentUser || activeBooking ? (
        <div className="relative bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {isGu ? 'તમારો સત્તાવાર ટોકન પાસ' : isHi ? 'आपका आधिकारिक टोकन पास' : isMr ? 'तुमचा अधिकृत टोकन पास' : 'Your Official Token Pass'}
              </span>
              <span className="text-xs font-black text-[#003366]">{currentUser?.name || 'Mohanbhai Patel'}</span>
            </div>
            <span className="bg-emerald-50 text-[#138808] border border-emerald-200 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#138808] animate-ping" />
              {isGu ? 'સક્રિય' : isHi ? 'सक्रिय' : isMr ? 'सक्रिय' : 'ACTIVE'}
            </span>
          </div>

          <div className="text-center py-2">
            <h2 className="text-5xl font-black text-[#003366] tracking-tight font-mono">
              {activeBooking?.tokenNumber || currentUser?.token || '#A-42'}
            </h2>
            <p className="text-xs font-bold text-slate-600 mt-1">
              {activeBooking ? `${activeBooking.taluka.nameGu} કચેરી • કાઉન્ટર ${activeBooking.counterNumber}` : currentUser?.area || 'ગોંડલ જન સેવા કેન્દ્ર — રાજકોટ'}
            </p>
          </div>

          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] text-amber-800 font-semibold">
                {isGu ? 'સમય સ્લોટ / પ્રતીક્ષા:' : isHi ? 'समय स्लॉट / प्रतीक्षा:' : isMr ? 'वेळ स्लॉट / प्रतीक्षा:' : 'Time Slot / Wait:'}
              </p>
              <p className="text-base font-black text-amber-950 font-mono">
                {activeBooking ? `${activeBooking.slot.timeRange}` : '૧૨ મિનિટ (~12 min)'}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-[#FF9933] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-5 flex flex-col items-center">
            <div className="w-32 h-32 bg-[#003366] rounded-2xl p-2.5 shadow-inner flex items-center justify-center">
              <div className="w-full h-full bg-white rounded-xl p-2 flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-5 h-5 border-4 border-[#003366] rounded-xs p-0.5"><div className="w-full h-full bg-[#003366]" /></div>
                  <div className="w-5 h-5 border-4 border-[#003366] rounded-xs p-0.5"><div className="w-full h-full bg-[#003366]" /></div>
                </div>
                <div className="qr-pattern flex-1 my-1" />
                <div className="flex justify-between items-end">
                  <div className="w-5 h-5 border-4 border-[#003366] rounded-xs p-0.5"><div className="w-full h-full bg-[#003366]" /></div>
                  <span className="text-[7px] font-mono font-bold text-[#003366]">QLESS-GP</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] font-bold text-slate-500 mt-2 flex items-center gap-1.5">
              <span>{isGu ? 'કચેરીના પ્રવેશદ્વારે સ્કેન કરો' : isHi ? 'कार्यालय प्रवेश पर स्कैन करें' : isMr ? 'कार्यालय प्रवेशद्वारावर स्कॅन करा' : 'Scan at Office Entry'}</span>
            </p>
          </div>

          <div className="mt-4">
            <button
              onClick={() => {
                triggerHaptic('tap');
                onOpenTokenPassModal();
              }}
              className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold py-2.5 rounded-xl text-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <Ticket className="w-3.5 h-3.5 text-[#FF9933]" />
              <span>{isGu ? 'સંપૂર્ણ ડિજિટલ પાસ જુઓ' : isHi ? 'पूर्ण डिजिटल पास देखें' : isMr ? 'संपूर्ण डिजिटल पास पहा' : 'View Full Digital Pass'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* GUEST VISITOR SHOWCASE (HOW IT WORKS VIDEO + REAL CITIZEN TESTIMONIALS + ACTION DESK) */
        <div className="relative bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200">
          
          {/* TOP GOV VISION BADGE */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <GovLogo className="w-7 h-7 shrink-0 drop-shadow-xs" />
              <div>
                <span className="text-[11px] font-black text-[#003366] block leading-tight">
                  {isGu ? 'ગુજરાત સરકાર • GAD પોર્ટલ' : isHi ? 'गुजरात सरकार • GAD पोर्टल' : isMr ? 'गुजरात शासन • GAD पोर्टल' : 'Govt of Gujarat • GAD'}
                </span>
                <span className="text-[9px] text-slate-500 font-medium">
                  {isGu ? 'નાગરિક અધિકાર પત્ર & GRTSA ૨૦૧૩' : isHi ? 'नागरिक अधिकार पत्र & GRTSA २०१३' : isMr ? 'नागरिक सनद & GRTSA २०१३' : 'Citizens Charter & GRTSA 2013'}
                </span>
              </div>
            </div>
            <span className="bg-emerald-50 text-[#138808] border border-emerald-200 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#138808] animate-pulse" />
              {isGu ? 'સત્તાવાર સેવા' : isHi ? 'आधिकारिक' : isMr ? 'अधिकृत' : 'Official'}
            </span>
          </div>

          {/* TAB SWITCHER: 1. VIDEO GUIDE | 2. TESTIMONIALS | 3. TRACK TOKEN */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl mb-4 text-xs font-bold">
            <button
              onClick={() => {
                triggerHaptic('tap');
                setActiveTab('video');
              }}
              className={`py-1.5 px-2 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'video' 
                  ? 'bg-white text-[#003366] shadow-xs font-black' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Play className="w-3 h-3 text-[#FF9933] fill-current" />
              <span className="text-[11px] truncate">{isGu ? 'વિડીયો' : isHi ? 'वीडियो' : isMr ? 'व्हिडिओ' : 'Video'}</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('tap');
                setActiveTab('testimonials');
              }}
              className={`py-1.5 px-2 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'testimonials' 
                  ? 'bg-white text-[#003366] shadow-xs font-black' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Award className="w-3 h-3 text-[#138808]" />
              <span className="text-[11px] truncate">{isGu ? 'અનુભવ' : isHi ? 'अनुभव' : isMr ? 'अभिप्राय' : 'Reviews'}</span>
            </button>

            <button
              onClick={() => {
                triggerHaptic('tap');
                setActiveTab('action');
              }}
              className={`py-1.5 px-2 rounded-lg text-center transition cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'action' 
                  ? 'bg-white text-[#003366] shadow-xs font-black' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Ticket className="w-3 h-3 text-[#005A9C]" />
              <span className="text-[11px] truncate">{isGu ? 'ટોકન' : isHi ? 'टोकन' : isMr ? 'टोकन' : 'Token'}</span>
            </button>
          </div>

          {/* TAB 1: 60S VIDEO GUIDE PREVIEW */}
          {activeTab === 'video' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div 
                onClick={handlePlayExplainer}
                className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#003366] to-[#001830] text-white p-4 cursor-pointer group shadow-lg border border-blue-900"
              >
                {/* Background decorative grid */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
                
                <div className="relative z-10 flex flex-col justify-between min-h-[140px]">
                  <div className="flex items-center justify-between">
                    <span className="bg-[#FF9933] text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3 h-3" />
                      <span>૬૦ સેકન્ડ માર્ગદર્શિકા</span>
                    </span>
                    <span className="bg-white/20 backdrop-blur-xs text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                      0:58 min
                    </span>
                  </div>

                  {/* Centered Glowing Play Button */}
                  <div className="my-2 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl border border-white/40">
                      <div className="w-10 h-10 rounded-full bg-[#FF9933] text-slate-950 flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-white leading-tight">
                      {isGu ? 'QueueLess નો ઉપયોગ કઈ રીતે કરવો?' : isHi ? 'QueueLess का उपयोग कैसे करें?' : isMr ? 'QueueLess चा वापर कसा करावा?' : 'How to Use QueueLess Portal?'}
                    </h4>
                    <p className="text-[10px] text-blue-200 mt-0.5 leading-tight">
                      {isGu ? 'સ્લોટ બુકિંગથી કચેરી સુધી ૪ સરળ પગલાં' : isHi ? 'स्लॉट बुकिंग से कार्यालय तक ४ आसान चरण' : isMr ? 'स्लॉट बुकिंग ते कार्यालयापर्यंत ४ सोप्या पायऱ्या' : '4 Easy steps from booking to zero-queue entry'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#005A9C] shrink-0" />
                  <span className="text-[11px] font-bold text-slate-700 leading-tight">
                    {isGu ? 'કચેરીએ જતાં પહેલાં વિડીયો જુઓ' : isHi ? 'कार्यालय जाने से पहले वीडियो देखें' : isMr ? 'कार्यालयात जाण्यापूर्वी व्हिडिओ पहा' : 'Watch video before visiting office'}
                  </span>
                </div>
                <button
                  onClick={handlePlayExplainer}
                  className="text-[10px] font-black text-[#005A9C] hover:underline shrink-0 cursor-pointer"
                >
                  {isGu ? 'પ્લે કરો ➔' : isHi ? 'प्ले करें ➔' : isMr ? 'सुरू करा ➔' : 'Play ➔'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: REAL CITIZEN TESTIMONIALS */}
          {activeTab === 'testimonials' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 relative">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={activeItem.avatar} 
                      alt={activeItem.name}
                      className="w-10 h-10 rounded-full bg-amber-100 border border-amber-300 shrink-0"
                    />
                    <div>
                      <h4 className="text-xs font-black text-[#003366] leading-tight flex items-center gap-1">
                        <span>{activeItem.name}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#138808]" />
                      </h4>
                      <p className="text-[10px] text-slate-500">{activeItem.role}</p>
                    </div>
                  </div>

                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                    {activeItem.timeSaved}
                  </span>
                </div>

                <div className="flex items-center gap-0.5 text-amber-500 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                  <span className="text-[10px] font-bold text-slate-500 ml-1.5">
                    {activeItem.service}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed italic bg-white p-2.5 rounded-xl border border-slate-100">
                  "{activeItem.quote}"
                </p>

                {/* Carousel Controls */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/60">
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {currentTestimonialIdx + 1} / {testimonials.length}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handlePrevTestimonial}
                      className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                      aria-label="Previous Testimonial"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleNextTestimonial}
                      className="p-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                      aria-label="Next Testimonial"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE TOKEN TRACKER & SLOT BOOKING */}
          {activeTab === 'action' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5 text-[#005A9C]" />
                    <span>{t('tabTrackToken', lang)}</span>
                  </label>
                  <span className="text-[9px] text-slate-400 font-mono">GPS/Queue</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="દા.ત. A-42, B-1247"
                    defaultValue="A-42"
                    id="hero-token-action-input"
                    className="flex-1 px-3 py-2 bg-white rounded-xl border border-slate-300 font-mono text-xs font-bold text-[#003366] focus:border-[#005A9C] outline-none"
                  />
                  <button
                    onClick={() => {
                      triggerHaptic('tap');
                      onOpenTokenTracker();
                    }}
                    className="px-3 py-2 bg-[#005A9C] hover:bg-[#003366] text-white text-xs font-bold rounded-xl transition active:scale-95 cursor-pointer whitespace-nowrap shadow-xs"
                  >
                    {t('btnTrackNow', lang)}
                  </button>
                </div>

                <div className="flex items-center gap-1 flex-wrap pt-0.5">
                  <span className="text-[9px] text-slate-400 font-medium">સેમ્પલ:</span>
                  {['A-42', 'B-1247', 'C-809'].map((sample) => (
                    <button
                      key={sample}
                      onClick={() => {
                        triggerHaptic('tap');
                        onOpenTokenTracker();
                      }}
                      className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-white hover:bg-blue-50 border border-slate-200 rounded text-[#003366] cursor-pointer"
                    >
                      #{sample}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  triggerHaptic('tap');
                  onOpenSlotModal();
                }}
                className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold py-2.5 rounded-xl text-xs transition active:scale-95 flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-[#FF9933]" />
                <span>{isGu ? 'ઓનલાઇન સ્લોટ બુક કરો ➔' : isHi ? 'ऑनलाइन स्लॉट बुक करें ➔' : isMr ? 'ऑनलाईन स्लॉट बुक करा ➔' : 'Book Office Slot ➔'}</span>
              </button>
            </div>
          )}

          {/* QUICK DEMO LOGIN LINK */}
          <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <button
              onClick={() => {
                triggerHaptic('tap');
                onOpenSlotModal();
              }}
              className="text-[#005A9C] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Calendar className="w-3 h-3 text-[#FF9933]" />
              <span>{isGu ? 'નવો સ્લોટ બુક કરો' : isHi ? 'नया स्लॉट बुक करें' : isMr ? 'नवीन स्लॉट बुक करा' : 'Book Slot'}</span>
            </button>
            <button
              onClick={() => {
                triggerHaptic('tap');
                onLoginDemo();
              }}
              className="text-amber-800 hover:text-amber-950 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>⚡ {isGu ? 'ટેસ્ટ પ્રોફાઇલ (મોહનભાઈ)' : isHi ? 'टेस्ट प्रोफाइल (मोहनभाई)' : isMr ? 'टेस्ट प्रोफाइल (मोहनभाई)' : 'Test Profile (Mohanbhai)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* EXPLAINER VIDEO MODAL */}
      {videoModalOpen && (
        <div 
          onClick={() => setVideoModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 modal-backdrop animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200 text-slate-800"
          >
            {/* VIDEO MODAL HEADER */}
            <div className="bg-[#003366] text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FF9933] text-slate-950 flex items-center justify-center font-black">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white leading-tight">
                    {isGu ? 'વિડીયો માર્ગદર્શિકા: QueueLess પોર્ટલ' : isHi ? 'वीडियो गाइड: QueueLess पोर्टल' : isMr ? 'व्हिडिओ मार्गदर्शक: QueueLess पोर्टल' : 'Walkthrough Video: QueueLess Portal'}
                  </h3>
                  <p className="text-[10px] text-blue-200">
                    {isGu ? 'સામાન્ય વહીવટ વિભાગ • ગુજરાત સરકાર' : isHi ? 'सामान्य प्रशासन विभाग • गुजरात सरकार' : isMr ? 'सामान्य प्रशासन विभाग • गुजरात शासन' : 'General Administration Dept • Gujarat'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setVideoModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ANIMATED INTERACTIVE VIDEO SIMULATION VIEWPORT */}
            <div className="bg-slate-900 text-white p-5 flex flex-col items-center justify-center relative min-h-[220px]">
              <div className="w-full max-w-md bg-slate-800/80 rounded-2xl p-4 border border-slate-700 shadow-inner space-y-3">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE WALKTHROUGH SIMULATION
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Step-by-Step</span>
                </div>

                {/* 4 INTERACTIVE STEPS */}
                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-700/60 flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#FF9933] text-slate-950 flex items-center justify-center text-[10px] font-black shrink-0">૧</span>
                    <span className="font-semibold text-slate-200">
                      {isGu ? 'યોજના અથવા સરકારી દાખલો પસંદ કરો (૩૯ સેવાઓ)' : 'Select Public Scheme or Certificate (39 Services)'}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-700/60 flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#005A9C] text-white flex items-center justify-center text-[10px] font-black shrink-0">૨</span>
                    <span className="font-semibold text-slate-200">
                      {isGu ? 'કેમેરાથી ઘરે બેઠા દસ્તાવેજ પ્રી-ચેક કરો' : 'Scan & Pre-check documents with camera'}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-700/60 flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#138808] text-white flex items-center justify-center text-[10px] font-black shrink-0">૩</span>
                    <span className="font-semibold text-slate-200">
                      {isGu ? 'તમારી પસંદગીના સમયે કચેરી સ્લોટ બુક કરો' : 'Choose time slot & get virtual token pass'}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-700/60 flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[10px] font-black shrink-0">૪</span>
                    <span className="font-semibold text-slate-200">
                      {isGu ? 'કચેરી પ્રવેશદ્વારે QR સ્કેન કરી સીધા કાઉન્ટર પર પ્રવેશ મેળવો' : 'Scan QR at office entry & walk straight to counter'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => {
                  setVideoModalOpen(false);
                  onOpenSlotModal();
                }}
                className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold py-2.5 rounded-xl text-xs transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Calendar className="w-3.5 h-3.5 text-[#FF9933]" />
                <span>{isGu ? 'સમજાઈ ગયું! હવે સ્લોટ બુક કરો' : isHi ? 'समझ गया! अब स्लॉट बुक करें' : isMr ? 'समजले! आता स्लॉट बुक करा' : 'Got it! Book a Slot Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
