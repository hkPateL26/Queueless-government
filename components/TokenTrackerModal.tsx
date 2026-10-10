'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, Search, Volume2, VolumeX, Clock, Building, Users, CheckCircle2, 
  ArrowRight, Ticket, AlertCircle, ShieldCheck, QrCode
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { speakGuidance, stopVoice, isVoiceSpeaking } from '@/lib/voice';
import { Language, t } from '@/lib/translations';
import { BookingDetails } from '@/components/SlotBookingModal';
import { CardSkeleton } from '@/components/ui/Skeleton';

interface TokenTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookSlot: () => void;
  onViewRadar: () => void;
  activeBooking: BookingDetails | null;
  currentUser: { name: string; token: string; area: string } | null;
  lang: Language;
}

interface MockTokenInfo {
  token: string;
  name: string;
  center: string;
  counter: string;
  ahead: number;
  estMinutes: number;
  status: 'called' | 'waiting' | 'in_service' | 'completed';
}

const getLocalizedTokenData = (cleanQuery: string, l: Language, activeBooking: BookingDetails | null): MockTokenInfo => {
  const isEn = l === 'en';
  const isHi = l === 'hi';
  const isMr = l === 'mr';
  const isGu = l === 'gu' || l === 'khi';

  if (cleanQuery === 'A-42') {
    return {
      token: 'A-42',
      name: isEn ? 'Trusha Somaiya' : isHi ? 'तृषा सोमैया' : isMr ? 'तृषा सोमय्या' : 'તૃષા સોમૈયા',
      center: isEn ? 'Gondal Jan Seva Kendra — Rajkot' : isHi ? 'गोंडल जन सेवा केंद्र — राजकोट' : isMr ? 'गोंडल जन सेवा केंद्र — राजकोट' : 'ગોંડલ જન સેવા કેન્દ્ર — રાજકોટ',
      counter: isEn ? 'Counter 1 (Income/Caste Service)' : isHi ? 'काउंटर १ (आय/जाति सेवा)' : isMr ? 'काउंटर १ (उत्पन्न/जात दाखले)' : 'કાઉન્ટર ૧ (આવક/જાતિ સેવા)',
      ahead: 2,
      estMinutes: 8,
      status: 'waiting'
    };
  }

  if (cleanQuery === 'B-1247') {
    return {
      token: 'B-1247',
      name: isEn ? 'Pravinbhai Shah' : isHi ? 'प्रवीणभाई शाह' : isMr ? 'प्रवीणभाई शाह' : 'પ્રવીણભાઈ શાહ',
      center: isEn ? 'Mamlatdar Office — Gandhinagar West' : isHi ? 'मामलतदार कार्यालय — गांधीनगर पश्चिम' : isMr ? 'मामलतदार कार्यालय — गांधीनगर पश्चिम' : 'મામલતદાર કચેરી — ગાંધીનગર પશ્ચિમ',
      counter: isEn ? 'Counter 3 (Revenue Documents)' : isHi ? 'काउंटर ३ (राजस्व दस्तावेज़)' : isMr ? 'काउंटर ३ (महसूल कागदपत्रे)' : 'કાઉન્ટર ૩ (રેવન્યુ દસ્તાવેજ)',
      ahead: 0,
      estMinutes: 3,
      status: 'called'
    };
  }

  if (cleanQuery === 'C-809') {
    return {
      token: 'C-809',
      name: isEn ? 'Geetaben Vaghela' : isHi ? 'गीताबेन वाघेला' : isMr ? 'गीताबेन वाघेला' : 'ગીતાબેન વાઘેલા',
      center: isEn ? 'Taluka Panchayat — Surat Sachin' : isHi ? 'तहसील पंचायत — सूरत सचिन' : isMr ? 'तालुका पंचायत — सुरत सचिन' : 'તાલુકા પંચાયત — સુરત સચિન',
      counter: isEn ? 'Counter 2 (Aadhaar/Ration Card)' : isHi ? 'काउंटर २ (आधार/राशन कार्ड)' : isMr ? 'काउंटर २ (आधार/रेशन कार्ड)' : 'કાઉન્ટર ૨ (આધાર/રેશનકાર્ડ)',
      ahead: 5,
      estMinutes: 18,
      status: 'waiting'
    };
  }

  return {
    token: cleanQuery || 'A-42',
    name: activeBooking ? (isEn ? 'Citizen' : isHi ? 'नागरिक' : isMr ? 'नागरिक' : 'નાગરિક') : (isEn ? 'Verified Citizen' : isHi ? 'सत्यापित नागरिक' : isMr ? 'सत्यापित नागरिक' : 'પ્રમાણિત નાગરિક'),
    center: activeBooking 
      ? (isEn ? `${activeBooking.taluka.officeNameEn || activeBooking.taluka.officeNameGu}` : `${activeBooking.taluka.officeNameGu}`) 
      : (isEn ? 'Gondal Jan Seva Kendra — Rajkot' : isHi ? 'गोंडल जन सेवा केंद्र — राजकोट' : isMr ? 'गोंडल जन सेवा केंद्र — राजकोट' : 'ગોંડલ જન સેવા કેન્દ્ર — રાજકોટ'),
    counter: activeBooking 
      ? `${isEn ? 'Counter' : isHi ? 'काउंटर' : isMr ? 'काउंटर' : 'કાઉન્ટર'} ${activeBooking.counterNumber}` 
      : (isEn ? 'Counter 1 (General Desk)' : isHi ? 'काउंटर १ (सामान्य सेवा)' : isMr ? 'काउंटर १ (सामान्य सेवा)' : 'કાઉન્ટર ૧ (સામાન્ય સેવા)'),
    ahead: 3,
    estMinutes: 11,
    status: 'waiting'
  };
};

export function TokenTrackerModal({
  isOpen,
  onClose,
  onBookSlot,
  onViewRadar,
  activeBooking,
  currentUser,
  lang
}: TokenTrackerModalProps) {
  if (!isOpen) return null;

  const initialToken = activeBooking?.tokenNumber?.replace('#', '') || currentUser?.token?.replace('#', '') || 'A-42';
  const [tokenInput, setTokenInput] = useState(initialToken);
  const [searchToken, setSearchToken] = useState(initialToken);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const isKhi = lang === 'khi';
  const isGu = lang === 'gu' || lang === 'khi';
  const isHi = lang === 'hi';
  const isMr = lang === 'mr';
  const isEn = lang === 'en';

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

  const cleanQuery = searchToken.trim().toUpperCase().replace('#', '');
  const tokenData = getLocalizedTokenData(cleanQuery, lang, activeBooking);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('tap');
    if (tokenInput.trim()) {
      setIsSearching(true);
      setTimeout(() => {
        setSearchToken(tokenInput.trim());
        setIsSearching(false);
      }, 250);
    }
  };

  const selectPreset = (tok: string) => {
    triggerHaptic('tap');
    setTokenInput(tok);
    setIsSearching(true);
    setTimeout(() => {
      setSearchToken(tok);
      setIsSearching(false);
    }, 220);
  };

  const handleVoiceCall = () => {
    triggerHaptic('tap');
    if (isVoiceSpeaking()) {
      stopVoice();
      setIsSpeaking(false);
    } else {
      const msg = isKhi
        ? `ટોકન નંબર ${tokenData.token}, કૃપા કરી ${tokenData.counter} તે વેણ્યો.`
        : isGu
        ? `ટોકન નંબર ${tokenData.token}, કૃપા કરીને ${tokenData.counter} પર પધારો.`
        : isMr
        ? `टोकन क्रमांक ${tokenData.token}, कृपया ${tokenData.counter} वर यावे.`
        : isHi
        ? `टोकन संख्या ${tokenData.token}, कृपया ${tokenData.counter} पर पधारें।`
        : `Token number ${tokenData.token}, please proceed to ${tokenData.counter}.`;
      
      setIsSpeaking(true);
      speakGuidance(msg, lang, () => setIsSpeaking(false));
    }
  };

  return (
    <div 
      onClick={() => {
        stopVoice();
        onClose();
      }}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden modal-backdrop animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-t-[28px] sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden h-[92dvh] max-h-[92dvh] sm:h-auto sm:max-h-[88vh] flex flex-col animate-in slide-in-from-bottom duration-200"
      >
        {/* MOBILE BOTTOM SHEET DRAG PILL */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center bg-[#003366] shrink-0">
          <div className="w-12 h-1.5 bg-white/40 rounded-full" />
        </div>

        {/* HEADER */}
        <div className="bg-[#003366] text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#FF9933] text-slate-900 flex items-center justify-center font-black shadow-md shrink-0">
              <Ticket className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider bg-blue-900/80 text-blue-200 px-1.5 sm:px-2 py-0.5 rounded border border-blue-700 whitespace-nowrap">
                {isGu ? 'લાઈવ કતાર સ્થિતિ' : isHi ? 'लाइव कतार स्थिति' : isMr ? 'थेट रांग स्थिती' : 'Live Queue Status'}
              </span>
              <h2 className="text-sm sm:text-lg font-black text-white tracking-tight mt-0.5 truncate max-w-[200px] xs:max-w-xs sm:max-w-none">
                {isGu ? 'ટોકન ટ્રેક કરો (Token Tracker)' : isHi ? 'टोकन ट्रैक करें (Token Tracker)' : isMr ? 'टोकन ट्रॅक करा (Token Tracker)' : 'Track Office Token'}
              </h2>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('tap');
              stopVoice();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer shrink-0 ml-2"
            aria-label="Close Token Tracker"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 modal-scroll-area flex-1">
          {/* SEARCH FORM */}
          <form onSubmit={handleSearch} className="space-y-2">
            <label className="text-xs font-black text-slate-600 block">
              {isGu ? 'તમારો ટોકન નંબર દાખલ કરો' : isHi ? 'अपनी टोकन संख्या दर्ज करें' : isMr ? 'आपला टोकन क्रमांक प्रविष्ट करा' : 'Enter Your Token Number'}
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder={isMr ? 'उदा. A-42, B-1247' : isHi ? 'उदा. A-42, B-1247' : isEn ? 'e.g. A-42, B-1247' : 'દા.ત. A-42, B-1247'}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-sm text-[#003366] focus:border-[#005A9C] focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-[#005A9C] hover:bg-[#003366] text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition active:scale-95 cursor-pointer whitespace-nowrap"
              >
                {isGu ? 'સ્થિતિ તપાસો' : isHi ? 'स्थिति जांचें' : isMr ? 'स्थिती तपासा' : 'Check Status'}
              </button>
            </div>
          </form>

          {/* QUICK PRESETS CHIPS */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400">
              {isGu ? 'નમૂના ટોકન:' : isHi ? 'नमूना टोकन:' : isMr ? 'नमुना टोकन:' : 'Sample Tokens:'}
            </span>
            {['A-42', 'B-1247', 'C-809'].map((tok) => (
              <button
                key={tok}
                type="button"
                onClick={() => selectPreset(tok)}
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                  searchToken === tok 
                    ? 'bg-[#003366] text-white border-[#003366]' 
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                #{tok}
              </button>
            ))}
          </div>

          {/* LIVE TOKEN STATUS CARD */}
          {isSearching ? (
            <CardSkeleton />
          ) : (
          <div className="bg-slate-50 border-2 border-blue-200 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full bg-blue-100 text-[#003366]">
                {isGu ? 'સત્તાવાર કતાર ટોકન' : isMr ? 'अधिकृत रांग टोकन' : isHi ? 'आधिकारिक कतार टोकन' : 'OFFICIAL QUEUE TOKEN'}
              </span>
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                tokenData.status === 'called'
                  ? 'bg-amber-100 text-amber-900 animate-pulse'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                {tokenData.status === 'called' 
                  ? (isGu ? 'હવે બોલાવવામાં આવેલ' : isMr ? 'आता पाचारण केले' : isHi ? 'अभी बुलाया गया' : 'NOW CALLED') 
                  : (isGu ? 'કતારમાં સક્રિય' : isMr ? 'रांगेत सक्रिय' : isHi ? 'कतार में सक्रिय' : 'WAITING IN QUEUE')}
              </span>
            </div>

            <div className="text-center py-1">
              <h3 className="text-4xl sm:text-5xl font-black text-[#003366] font-mono tracking-tight">
                #{tokenData.token}
              </h3>
              <p className="text-xs font-bold text-slate-700 mt-1">
                {tokenData.name}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                {tokenData.center}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3 text-center min-w-0">
                <p className="text-[9.5px] sm:text-[10px] font-bold text-slate-500 uppercase truncate">
                  {isGu ? 'ફાળવેલ કાઉન્ટર' : isMr ? 'नियुक्त काउंटर' : isHi ? 'आवंटित काउंटर' : 'Assigned Counter'}
                </p>
                <p className="text-xs sm:text-sm font-black text-[#003366] mt-0.5 leading-snug break-words">{tokenData.counter}</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3 text-center min-w-0">
                <p className="text-[9.5px] sm:text-[10px] font-bold text-slate-500 uppercase truncate">
                  {isGu ? 'અંદાજિત પ્રતીક્ષા' : isMr ? 'अंदाजित प्रतीक्षा' : isHi ? 'अनुमानित प्रतीक्षा' : 'Est. Wait'}
                </p>
                <p className="text-xs sm:text-sm font-black text-[#FF9933] mt-0.5">
                  ~{tokenData.estMinutes} {isMr ? 'मिनिटे' : isHi ? 'मिनट' : isEn ? 'min' : 'મિનિટ'}
                </p>
              </div>
            </div>

            <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 flex items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Users className="w-4 h-4 text-[#005A9C] shrink-0" />
                <span className="text-slate-700 font-medium truncate">
                  {tokenData.ahead === 0 
                    ? (isGu ? 'તમારો વારો આવી ગયો છે!' : isMr ? 'तुमचा नंबर आला आहे!' : isHi ? 'आपकी बारी आ चुकी है!' : 'Your turn is now!') 
                    : (isGu ? `તમારા આગળ માત્ર ${tokenData.ahead} નાગરિકો છે.` : isMr ? `तुमच्या पुढे फक्त ${tokenData.ahead} नागरिक आहेत.` : isHi ? `आपके आगे केवल ${tokenData.ahead} नागरिक हैं।` : `${tokenData.ahead} citizens ahead of you.`)}
                </span>
              </div>
              <button
                onClick={handleVoiceCall}
                className={`px-2.5 py-1 rounded-lg border font-bold flex items-center gap-1 transition active:scale-95 cursor-pointer text-[11px] shrink-0 ${
                  isSpeaking
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                    : 'bg-white border-blue-300 text-[#003366] hover:bg-blue-100'
                }`}
                title="ઓડિયો સાંભળો / Audio Announcement"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#FF9933]" />}
                <span>
                  {isSpeaking
                    ? (isEn ? 'Stop' : isHi ? 'रोकें' : isMr ? 'थांबवा' : 'બંધ કરો')
                    : (isGu ? 'જાહેરાત' : isMr ? 'घोषणा' : isHi ? 'घोषणा' : 'Audio')}
                </span>
              </button>
            </div>
          </div>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 pb-[max(0.85rem,env(safe-area-inset-bottom))] flex flex-col sm:flex-row items-center gap-2 justify-between text-xs shrink-0 sticky bottom-0 z-20">
          <button
            onClick={() => {
              triggerHaptic('tap');
              stopVoice();
              onClose();
              onViewRadar();
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-[#003366] font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>
              {isGu ? 'કચેરી રડારમાં લાઈવ જુઓ' : isMr ? 'कचेरी रडारमध्ये थेट पहा' : isHi ? 'कचहरी रडार में लाइव देखें' : 'View in Queue Radar'}
            </span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            onClick={() => {
              triggerHaptic('tap');
              stopVoice();
              onClose();
              onBookSlot();
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#003366] hover:bg-[#002244] text-white font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Ticket className="w-3.5 h-3.5 text-[#FF9933]" />
            <span>
              {isGu ? 'નવો સ્લોટ બુક કરો' : isMr ? 'नवीन स्लॉट बुक करा' : isHi ? 'नया स्लॉट बुक करें' : 'Book New Slot'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
