'use client';

import React, { useState } from 'react';
import { 
  X, Search, Volume2, Clock, Building, Users, CheckCircle2, 
  ArrowRight, Ticket, AlertCircle, ShieldCheck, QrCode
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { speakGuidance } from '@/lib/voice';
import { Language, t } from '@/lib/translations';
import { BookingDetails } from '@/components/SlotBookingModal';

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

const PRESET_TOKENS: Record<string, MockTokenInfo> = {
  'A-42': {
    token: 'A-42',
    name: 'હરિ પટેલ (Hari Patel)',
    center: 'ગોંડલ જન સેવા કેન્દ્ર — રાજકોટ',
    counter: 'કાઉન્ટર ૧ (આવક/જાતિ સેવા)',
    ahead: 2,
    estMinutes: 8,
    status: 'waiting'
  },
  'B-1247': {
    token: 'B-1247',
    name: 'પ્રવીણભાઈ શાહ (Pravinbhai Shah)',
    center: 'મામલતદાર કચેરી — ગાંધીનગર પશ્ચિમ',
    counter: 'કાઉન્ટર ૩ (રેવન્યુ દસ્તાવેજ)',
    ahead: 0,
    estMinutes: 3,
    status: 'called'
  },
  'C-809': {
    token: 'C-809',
    name: 'ગીતાબેન વાઘેલા (Geetaben Vaghela)',
    center: 'તાલુકા પંચાયત — સુરત સચિન',
    counter: 'કાઉન્ટર ૨ (આધાર/રેશનકાર્ડ)',
    ahead: 5,
    estMinutes: 18,
    status: 'waiting'
  }
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

  const isGu = lang === 'gu';
  const isHi = lang === 'hi';
  const isMr = lang === 'mr';
  const isEn = lang === 'en';

  const cleanQuery = searchToken.trim().toUpperCase().replace('#', '');
  
  // Lookup from presets or generate dynamic result
  const tokenData: MockTokenInfo = PRESET_TOKENS[cleanQuery] || {
    token: cleanQuery || 'A-42',
    name: activeBooking ? (isMr ? 'नागरिक (Citizen)' : 'નાગરિક (Citizen)') : (isMr ? 'नोंदणीकृत नागरिक (Verified Citizen)' : 'નોંધાયેલ નાગરિક (Verified Citizen)'),
    center: activeBooking ? `${activeBooking.taluka.nameGu} કચેરી` : 'ગોંડલ જન સેવા કેન્દ્ર — રાજકોટ',
    counter: activeBooking ? `કાઉન્ટર ${activeBooking.counterNumber}` : 'કાઉન્ટર ૧ (સામાન્ય સેવા)',
    ahead: 3,
    estMinutes: 11,
    status: 'waiting'
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('tap');
    if (tokenInput.trim()) {
      setSearchToken(tokenInput.trim());
    }
  };

  const selectPreset = (tok: string) => {
    triggerHaptic('tap');
    setTokenInput(tok);
    setSearchToken(tok);
  };

  const handleVoiceCall = () => {
    triggerHaptic('tap');
    const msg = isGu
      ? `ટોકન નંબર ${tokenData.token}, કૃપા કરીને ${tokenData.counter} પર પધારો.`
      : isMr
      ? `टोकन क्रमांक ${tokenData.token}, कृपया ${tokenData.counter} वर यावे.`
      : isHi
      ? `टोकन संख्या ${tokenData.token}, कृपया ${tokenData.counter} पर पधारें।`
      : `Token number ${tokenData.token}, please proceed to ${tokenData.counter}.`;
    speakGuidance(msg);
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 modal-backdrop animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* HEADER */}
        <div className="bg-[#003366] text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FF9933] text-slate-900 flex items-center justify-center font-black shadow-md">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-900/80 text-blue-200 px-2 py-0.5 rounded border border-blue-700">
                {isGu ? 'લાઈવ કતાર સ્થિતિ' : isHi ? 'लाइव कतार स्थिति' : isMr ? 'थेट रांग स्थिती' : 'Live Queue Status'}
              </span>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5">
                {isGu ? 'ટોકન ટ્રેક કરો (Token Tracker)' : isHi ? 'टोकन ट्रैक करें (Token Tracker)' : isMr ? 'टोकन ट्रॅक करा (Token Tracker)' : 'Track Office Token'}
              </h2>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('tap');
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
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
                {tokenData.token === 'A-42' ? (isGu ? 'હરિ પટેલ' : isHi ? 'हरि पटेल' : isMr ? 'हरी पटेल' : 'Hari Patel') : tokenData.name}
              </p>
              <p className="text-[11px] text-slate-500">
                {tokenData.center}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase">
                  {isGu ? 'ફાળવેલ કાઉન્ટર' : isMr ? 'नियुक्त काउंटर' : isHi ? 'आवंटित काउंटर' : 'Assigned Counter'}
                </p>
                <p className="text-sm font-black text-[#003366] mt-0.5">{tokenData.counter}</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase">
                  {isGu ? 'અંદાજિત પ્રતીક્ષા' : isMr ? 'अंदाजित प्रतीक्षा' : isHi ? 'अनुमानित प्रतीक्षा' : 'Est. Wait'}
                </p>
                <p className="text-sm font-black text-[#FF9933] mt-0.5">
                  ~{tokenData.estMinutes} {isMr ? 'मिनिटे' : isHi ? 'मिनट' : isEn ? 'min' : 'મિનિટ'}
                </p>
              </div>
            </div>

            <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#005A9C]" />
                <span className="text-slate-700 font-medium">
                  {tokenData.ahead === 0 
                    ? (isGu ? 'તમારો વારો આવી ગયો છે!' : isMr ? 'तुमचा नंबर आला आहे!' : isHi ? 'आपकी बारी आ चुकी है!' : 'Your turn is now!') 
                    : (isGu ? `તમારા આગળ માત્ર ${tokenData.ahead} નાગરિકો છે.` : isMr ? `तुमच्या पुढे फक्त ${tokenData.ahead} नागरिक आहेत.` : isHi ? `आपके आगे केवल ${tokenData.ahead} नागरिक हैं।` : `${tokenData.ahead} citizens ahead of you.`)}
                </span>
              </div>
              <button
                onClick={handleVoiceCall}
                className="px-2.5 py-1 rounded-lg bg-white border border-blue-300 text-[#003366] font-bold hover:bg-blue-100 flex items-center gap-1 transition active:scale-95 cursor-pointer text-[11px]"
                title="ઓડિયો સાંભળો / Audio Announcement"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#FF9933]" />
                <span>{isGu ? 'જાહેરાત' : isMr ? 'घोषणा' : isHi ? 'घोषणा' : 'Audio'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex flex-col sm:flex-row items-center gap-2 justify-between text-xs shrink-0">
          <button
            onClick={() => {
              triggerHaptic('tap');
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
