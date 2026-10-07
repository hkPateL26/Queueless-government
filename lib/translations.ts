export type Language = 'en' | 'gu' | 'hi' | 'mr' | 'sd' | 'khi' | 'mwr' | 'bn' | 'ur' | 'or';

export interface LanguageOption {
  code: Language;
  nativeLabel: string;
  englishLabel: string;
  multiLabel: string;
  regionalDescription: string;
  badge: string;
}

export const GUJARAT_LANGUAGES: LanguageOption[] = [
  {
    code: 'gu',
    nativeLabel: 'ગુજરાતી',
    englishLabel: 'Gujarati',
    multiLabel: 'ગુજરાતી (Gujarati)',
    regionalDescription: 'ગુજરાત રાજ્યની સત્તાવાર રાજભાષા (State Official Language)',
    badge: 'રાજ્ય ભાષા'
  },
  {
    code: 'hi',
    nativeLabel: 'हिन्दी',
    englishLabel: 'Hindi',
    multiLabel: 'हिन्दी (Hindi)',
    regionalDescription: 'ગુજરાતમાં વ્યાપક સંપર્ક ભાષા (National / Widely Spoken)',
    badge: 'રાષ્ટ્રભાષા'
  },
  {
    code: 'en',
    nativeLabel: 'English',
    englishLabel: 'English',
    multiLabel: 'English (અંગ્રેજી)',
    regionalDescription: 'સત્તાવાર વહીવટી અને જાહેર સેવાઓ (Administrative Access)',
    badge: 'Official'
  },
  {
    code: 'mr',
    nativeLabel: 'मराठी',
    englishLabel: 'Marathi',
    multiLabel: 'मराठी (Marathi)',
    regionalDescription: 'સુરત, વડોદરા અને દક્ષિણ ગુજરાત સમુદાય (Surat & Vadodara)',
    badge: 'દક્ષિણ-મધ્ય ગુજરાત'
  },
  {
    code: 'sd',
    nativeLabel: 'سنڌي / સિંધી',
    englishLabel: 'Sindhi',
    multiLabel: 'સિંધી • سنڌي (Sindhi)',
    regionalDescription: 'કચ્છ, ગાંધીધામ, અમદાવાદ અને ગોધરા પરિવારો માટે (Kutch & Ahmedabad)',
    badge: 'સિંધી સમાજ'
  },
  {
    code: 'khi',
    nativeLabel: 'કચ્છી',
    englishLabel: 'Kutchi',
    multiLabel: 'કચ્છી (Kutchi)',
    regionalDescription: 'કચ્છ પ્રદેશની સ્થાનિક પ્રાદેશિક ભાષા (Kutch Region)',
    badge: 'કચ્છ જિલ્લો'
  },
  {
    code: 'mwr',
    nativeLabel: 'मारवाड़ी',
    englishLabel: 'Marwari',
    multiLabel: 'मारवाड़ी (Marwari / Rajasthani)',
    regionalDescription: 'અમદાવાદ, સુરત અને રાજકોટ વેપારી વર્ગ (Business Community)',
    badge: 'વેપારી સમુદાય'
  },
  {
    code: 'bn',
    nativeLabel: 'বাংলা',
    englishLabel: 'Bengali',
    multiLabel: 'বাংলা (Bengali)',
    regionalDescription: 'સુરત-અમદાવાદ ડાયમંડ અને ટેક્સટાઇલ કારીગરો માટે (Textile & Gems)',
    badge: 'સુરત-અમદાવાદ'
  },
  {
    code: 'ur',
    nativeLabel: 'اردو',
    englishLabel: 'Urdu',
    multiLabel: 'اردو (Urdu)',
    regionalDescription: 'અમદાવાદ, ભરૂચ અને સુરત વિસ્તારો માટે (Urban Communities)',
    badge: 'શહેરી ગુજરાત'
  },
  {
    code: 'or',
    nativeLabel: 'ଓଡ଼ିଆ',
    englishLabel: 'Odia',
    multiLabel: 'ଓଡ଼ିଆ (Odia)',
    regionalDescription: 'સુરત GIDC, હજીરા ઔદ્યોગિક કામદારો માટે (Industrial Workforce)',
    badge: 'સુરત GIDC'
  }
];

export const TRANSLATIONS = {
  // Top Header Bar
  topBarStatusLive: {
    en: 'Citizen Service Network • Live Status',
    gu: 'નાગરિક સેવા નેટવર્ક • લાઈવ સ્થિતિ',
    hi: 'नागरिक सेवा नेटवर्क • लाइव स्थिति'
  },
  topBarFramework: {
    en: 'GRTSA Public Service Framework',
    gu: 'GRTSA જાહેર સેવા માળખું',
    hi: 'GRTSA लोक सेवा ढांचा'
  },
  langDropdownTitle: {
    en: 'Languages used in Gujarat (Select Language)',
    gu: 'ગુજરાતમાં વપરાતી ભાષાઓ (ભાષા પસંદ કરો)',
    hi: 'गुजरात में प्रयुक्त भाषाएं (भाषा चुनें)'
  },
  langDropdownSub: {
    en: 'Select your preferred language for the entire portal',
    gu: 'સમગ્ર પોર્ટલ માટે તમારી પસંદગીની ભાષા પસંદ કરો',
    hi: 'संपूर्ण पोर्टल के लिए अपनी पसंदीदा भाषा चुनें'
  },
  demoPersonasBtn: {
    en: '⚡ Demo Personas',
    gu: '⚡ ડેમો પ્રોફાઇલ્સ',
    hi: '⚡ डेमो प्रोफाइल'
  },
  demoMenuTitle: {
    en: 'One-Click Demo Personas (Evaluation)',
    gu: 'ઝડપી ડેમો પ્રોફાઇલ્સ (ચકાસણી માટે)',
    hi: 'त्वरित डेमो प्रोफाइल (परीक्षण हेतु)'
  },
  demoMenuSubtitle: {
    en: 'For jury & test evaluation without manual OTPs or phone entry.',
    gu: 'OTP કે ફોન નંબર દાખલ કર્યા વગર તાત્કાલિક ટેસ્ટિંગ માટે.',
    hi: 'बिना ओटीपी या फोन नंबर के तुरंत परीक्षण के लिए।'
  },
  citizenPersonaTitle: {
    en: 'Citizen Persona (Mohanbhai Patel)',
    gu: 'નાગરિક ડેમો પ્રોફાઇલ (મોહનભાઈ પટેલ)',
    hi: 'नागरिक डेमो प्रोफाइल (मोहनभाई पटेल)'
  },
  officerPersonaTitle: {
    en: 'Officer Console Persona ➔',
    gu: 'અધિકારી કાઉન્ટર ડેસ્ક ➔',
    hi: 'अधिकारी काउंटर डेस्क ➔'
  },
  collectorPersonaTitle: {
    en: 'Collector Command Center ➔',
    gu: 'કલેક્ટર કમાન્ડ સેન્ટર ➔',
    hi: 'कलेक्टर कमांड सेंटर ➔'
  },
  resetSessionBtn: {
    en: 'Reset Session',
    gu: 'સેશન રીસેટ કરો',
    hi: 'सत्र रीसेट करें'
  },

  // Main Nav
  appTitle: {
    en: 'QueueLess',
    gu: 'QueueLess',
    hi: 'QueueLess'
  },
  appTag: {
    en: 'Kacheri',
    gu: 'કચેરી',
    hi: 'कचहरी'
  },
  appSubtitle: {
    en: 'Government Office Queue Management System',
    gu: 'ગુજરાત સરકારી કચેરી કતાર મુક્તિ વ્યવસ્થાપન પ્રણાલી',
    hi: 'गुजरात सरकारी कार्यालय कतार प्रबंधन प्रणाली'
  },
  navHome: {
    en: 'Home',
    gu: 'હોમ',
    hi: 'होम'
  },
  navServices: {
    en: 'Services (39 Schemes)',
    gu: 'સેવાઓ (૩૯ યોજનાઓ)',
    hi: 'सेवाएं (३९ योजनाएं)'
  },
  navRadar: {
    en: 'Queue Radar (કચેરી રડાર)',
    gu: 'કચેરી રડાર (Queue Radar)',
    hi: 'कचहरी रडार (Queue Radar)'
  },
  navTrackToken: {
    en: 'Track Token',
    gu: 'ટોકન ટ્રેક કરો',
    hi: 'टोकन ट्रैक करें'
  },
  navHelp: {
    en: 'Help & Support',
    gu: 'મદદ અને સહાય',
    hi: 'मदद और सहायता'
  },
  navOfficerDesk: {
    en: 'Officer Desk',
    gu: 'અધિકારી ડેસ્ક',
    hi: 'अधिकारी डेस्क'
  },
  btnLogin: {
    en: 'Login',
    gu: 'લૉગિન',
    hi: 'लॉगिन'
  },
  btnGetStarted: {
    en: 'Get Started',
    gu: 'શરૂ કરો',
    hi: 'शुरू करें'
  },
  demoModeBadge: {
    en: '🧪 DEMO MODE',
    gu: '🧪 ડેમો મોડ',
    hi: '🧪 डेमो मोड'
  },

  // Hero Section
  heroBadge: {
    en: 'Government of Gujarat • General Administration Department (GAD)',
    gu: 'ગુજરાત સરકાર • સામાન્ય વહીવટ વિભાગ (GAD)',
    hi: 'गुजरात सरकार • सामान्य प्रशासन विभाग (GAD)'
  },
  heroTitleLine1: {
    en: 'Digital Jan Seva Portal —',
    gu: 'ડિજિટલ જન સેવા પોર્ટલ —',
    hi: 'डिजिटल जन सेवा पोर्टल —'
  },
  heroTitleLine2: {
    en: 'Transparent, Timely & Citizen-Centric Governance',
    gu: 'પારદર્શક, સરળ અને સમયબદ્ધ નાગરિક સેવાઓ',
    hi: 'पारदर्शी, सुलभ और समयबद्ध नागरिक सेवाएं'
  },
  heroSubtitle: {
    en: 'Official slot scheduling and virtual queue token system under the Gujarat Right to Public Services Act (GRTSA 2013). Access 39+ G2C administrative services across all 33 districts and 250+ Talukas.',
    gu: 'ગુજરાત લોક સેવા હક્ક અધિનિયમ (GRTSA ૨૦૧૩) અને નાગરિક અધિકાર પત્ર હેઠળ સત્તાવાર સ્લોટ બુકિંગ તથા વર્ચ્યુઅલ કતાર વ્યવસ્થાપન. રાજ્યના તમામ ૩૩ જિલ્લાઓ અને ૨૫૦+ તાલુકાઓમાં મામલતદાર, જન સેવા કેન્દ્ર અને પંચાયત સેવાઓ સુલભ.',
    hi: 'गुजरात लोक सेवा अधिकार अधिनियम (GRTSA २०१३) और नागरिक अधिकार पत्र के अंतर्गत आधिकारिक स्लॉट बुकिंग व वर्चुअल कतार प्रणाली। राज्य के सभी ३३ जिलों और २५०+ तालुकों में जन सेवा केंद्र, मामलतदार व पंचायत सेवाएं उपलब्ध।'
  },
  guestDeskTitle: {
    en: 'Citizen Public Action Desk',
    gu: 'નાગરિક જાહેર સેવા ડેસ્ક',
    hi: 'नागरिक लोक सेवा डेस्क'
  },
  guestDeskSubtitle: {
    en: 'Live Queue Tracking & Instant Slot Booking',
    gu: 'લાઈવ ટોકન ટ્રેકિંગ અને ત્વરિત સ્લોટ બુકિંગ',
    hi: 'लाइव टोकन ट्रैकिंग और त्वरित स्लॉट बुकिंग'
  },
  tabTrackToken: {
    en: 'Track Token',
    gu: 'ટોકન ટ્રેક કરો',
    hi: 'टोकन ट्रैक करें'
  },
  tabBookSlot: {
    en: 'Book Slot',
    gu: 'સ્લોટ બુક કરો',
    hi: 'स्लॉट बुक करें'
  },
  enterTokenPlaceholder: {
    en: 'Enter token no. (e.g. A-42, B-1247)',
    gu: 'ટોકન નંબર દાખલ કરો (દા.ત. A-42, B-1247)',
    hi: 'टोकन संख्या दर्ज करें (उदा. A-42, B-1247)'
  },
  btnTrackNow: {
    en: 'Check Live Status',
    gu: 'લાઈવ સ્થિતિ ચકાસો',
    hi: 'लाइव स्थिति जांचें'
  },
  helpModalTitle: {
    en: 'Citizen Help & Grievance Support',
    gu: 'નાગરિક સહાય અને ફરિયાદ નિવારણ ડેસ્ક',
    hi: 'नागरिक सहायता और शिकायत निवारण डेस्क'
  },
  helpModalSubtitle: {
    en: 'Government of Gujarat Official Support Channels',
    gu: 'ગુજરાત સરકાર સત્તાવાર સહાય ચેનલો અને સંપર્ક સૂત્રો',
    hi: 'गुजरात सरकार आधिकारिक सहायता चैनल और संपर्क सूत्र'
  },
  heroSearchPlaceholder: {
    en: 'Search: Tractor, MYSY, Income Certificate, Ayushman...',
    gu: 'શોધો: ટ્રેક્ટર, MYSY, આવક દાખલો, આયુષ્માન કાર્ડ...',
    hi: 'खोजें: ट्रैक्टर, MYSY, आय प्रमाण पत्र, आयुष्मान कार्ड...'
  },
  heroExploreBtn: {
    en: 'Explore 39 Schemes',
    gu: '૩૯ યોજનાઓ જુઓ',
    hi: '३९ योजनाएं देखें'
  },
  heroTagDistricts: {
    en: '33 Districts & 250+ Talukas',
    gu: '૩૩ જિલ્લાઓ અને ૨૫૦+ તાલુકાઓ',
    hi: '३३ जिले और २५०+ तालुका'
  },
  heroTagPrivacy: {
    en: 'Citizen Identity & Masked Aadhaar',
    gu: 'નાગરિક ઓળખ અને માસ્ક્ડ આધાર',
    hi: 'नागरिक पहचान और मास्क्ड आधार'
  },
  heroTagLive: {
    en: 'Live Updates 24/7',
    gu: '૨૪/૭ લાઈવ અપડેટ્સ',
    hi: '२४/७ लाइव अपडेट'
  },

  // Floating Virtual Token Card
  virtualTokenTitle: {
    en: 'Your Virtual Token',
    gu: 'તમારો વર્ચ્યુઅલ ટોકન',
    hi: 'आपका वर्चुअल टोकन'
  },
  tokenActiveBadge: {
    en: 'ACTIVE',
    gu: 'સક્રિય',
    hi: 'सक्रिय'
  },
  tokenCenterDefault: {
    en: 'Gondal Jan Seva Kendra – Rajkot',
    gu: 'ગોંડલ જન સેવા કેન્દ્ર – રાજકોટ',
    hi: 'गोंडल जन सेवा केंद्र – राजकोट'
  },
  estimatedWaitLabel: {
    en: 'Estimated wait:',
    gu: 'અંદાજિત પ્રતીક્ષા સમય:',
    hi: 'अनुमानित प्रतीक्षा समय:'
  },
  estimatedWaitVal: {
    en: '12 mins',
    gu: '૧૨ મિનિટ',
    hi: '૧૨ मिनट'
  },
  scanAtEntryText: {
    en: 'Scan at Office Entry',
    gu: 'કચેરીના પ્રવેશદ્વારે સ્કેન કરો',
    hi: 'कार्यालय प्रवेश पर स्कैन करें'
  },
  btnViewLiveRadar: {
    en: 'View Live Queue Radar ➔',
    gu: 'કચેરી રડાર જુઓ (Live Queue) ➔',
    hi: 'कचहरी रडार देखें (Live Queue) ➔'
  },

  // Stats Counters
  statLiveTokens: {
    en: 'Live Tokens Today',
    gu: 'આજના સક્રિય ટોકન',
    hi: 'आज के सक्रिय टोकन'
  },
  statAvgWait: {
    en: 'Avg Counter Wait Time',
    gu: 'સરેરાશ કાઉન્ટર પ્રતીક્ષા',
    hi: 'औसत काउंटर प्रतीक्षा'
  },
  statActiveKacheris: {
    en: 'Active Kacheris',
    gu: 'કાર્યરત સેવા કેન્દ્રો',
    hi: 'सक्रिय सेवा केंद्र'
  },
  statGrtsaSla: {
    en: 'GRTSA SLA Delivery',
    gu: 'GRTSA સમયમર્યાદા પરિપાલન',
    hi: 'GRTSA समय-सीमा अनुपालन'
  },
  statAllDistricts: {
    en: 'All 33 Districts',
    gu: 'તમામ ૩૩ જિલ્લાઓ',
    hi: 'सभी ३३ जिले'
  },
  statTimeBound: {
    en: 'Time-bound Services',
    gu: 'સમયબદ્ધ જાહેર સેવાઓ',
    hi: 'समयबद्ध सार्वजनिक सेवाएं'
  },
  todayGrowth: {
    en: '↑ 8.2% today',
    gu: '↑ ૮.૨% આજે',
    hi: '↑ ८.२% आज'
  },
  vsWalkin: {
    en: '↓ 22% vs walk-in',
    gu: '↓ ૨૨% સીધા આવવા કરતાં ઓછો',
    hi: '↓ २२% सीधे आने की तुलना में'
  },

  // Services Page Back Button & Title
  backToHome: {
    en: 'Back to Home',
    gu: 'હોમ પેજ પર પાછા જાઓ',
    hi: 'मुख्य पृष्ठ पर वापस जाएं'
  },

  // Dashboard Aside & Main
  dashboardTitle: {
    en: 'Citizen Dashboard',
    gu: 'નાગરિક ડેશબોર્ડ',
    hi: 'नागरिक डैशबोर्ड'
  },
  govTechPortal: {
    en: 'GovTech | Citizen Service Portal',
    gu: 'સરકારી ટેકનોલોજી | નાગરિક સેવા પોર્ટલ',
    hi: 'सरकारी प्रौद्योगिकी | नागरिक सेवा पोर्टल'
  },
  historyTab: {
    en: 'History',
    gu: 'ઇતિહાસ',
    hi: 'इतिहास'
  },
  profileTab: {
    en: 'Profile',
    gu: 'પ્રોફાઇલ',
    hi: 'प्रोफाइल'
  },
  liveDistrictLabel: {
    en: 'Live District:',
    gu: 'લાઈવ જિલ્લો:',
    hi: 'लाइव जिला:'
  },
  districtRajkot: {
    en: 'Rajkot District',
    gu: 'રાજકોટ જિલ્લો',
    hi: 'राजकोट जिला'
  },
  myLiveTokenCardTitle: {
    en: 'My Live Token',
    gu: 'મારો લાઈવ ટોકન',
    hi: 'मेरा लाइव टोकन'
  },
  defaultServiceTitle: {
    en: 'Certificate Services',
    gu: 'જન સેવા પ્રમાણપત્રો',
    hi: 'प्रमाणपत्र सेवाएं'
  },
  defaultServiceSub: {
    en: 'Caste & Income Certificate Verification',
    gu: 'આવક અને જાતિ પ્રમાણપત્ર ચકાસણી',
    hi: 'आय एवं जाति प्रमाण पत्र सत्यापन'
  },
  counterLabel: {
    en: 'Counter',
    gu: 'કાઉન્ટર',
    hi: 'काउंटर'
  },
  officerLabel: {
    en: 'Officer:',
    gu: 'અધિકારી:',
    hi: 'अधिकारी:'
  },
  arriveByLabel: {
    en: 'Arrive by',
    gu: 'પહોંચવાનો સમય:',
    hi: 'पहुंचने का समय:'
  },
  trafficBufferLabel: {
    en: '(Traffic Buffer included)',
    gu: '(ટ્રાફિક બફર સહિત)',
    hi: '(ट्रैफिक बफर सहित)'
  },
  rescheduledLabel: {
    en: '(Rescheduled)',
    gu: '(ખસેડેલ સમય)',
    hi: '(पुनर्निर्धारित)'
  },
  btnRunningLate: {
    en: 'Running Late? (+20 min)',
    gu: 'મોડું થશે (+૨૦ મિનિટ)',
    hi: 'देरी होगी (+२० मिनट)'
  },
  btnListenAudio: {
    en: 'Listen (Audio TTS)',
    gu: 'સાંભળો (અવાજ TTS)',
    hi: 'सुनें (ऑडियो TTS)'
  },
  btnViewDigitalPass: {
    en: 'View Official Digital Token Pass',
    gu: 'સત્તાવાર ડિજિટલ ટોકન પાસ જુઓ',
    hi: 'आधिकारिक डिजिटल टोकन पास देखें'
  },
  queuePosition: {
    en: 'Your Queue Position',
    gu: 'કતારમાં તમારું સ્થાન',
    hi: 'कतार में आपका स्थान'
  },

  // Multi-Modal Accessibility Panel
  multiModalTitle: {
    en: 'Multi-Modal Accessibility System',
    gu: 'સુલભતા પ્રણાલી (Multi-Modal Accessibility)',
    hi: 'सुलभता प्रणाली (Multi-Modal Accessibility)'
  },
  elderlyRuralTag: {
    en: 'Elderly & Rural',
    gu: 'વરિષ્ઠ અને ગ્રામીણ',
    hi: 'वरिष्ठ एवं ग्रामीण'
  },
  multiModalDesc: {
    en: 'Designed for elderly citizens and rural communities with 4 synchronized notification channels:',
    gu: 'વરિષ્ઠ નાગરિકો અને ગ્રામીણ જનતા માટે ૪ સમન્વિત ચેનલો દ્વારા સૂચના:',
    hi: 'वरिष्ठ नागरिकों और ग्रामीण क्षेत्रों के लिए ४ समन्वित चैनलों द्वारा सूचना:'
  },
  channelVisual: {
    en: 'Visual',
    gu: 'દ્રશ્ય',
    hi: 'दृश्य'
  },
  channelChime: {
    en: 'Chime',
    gu: 'ઘંટડી',
    hi: 'घंटी'
  },
  channelVoice: {
    en: 'Voice (TTS)',
    gu: 'અવાજ (TTS)',
    hi: 'आवाज (TTS)'
  },
  channelHaptic: {
    en: 'Haptic',
    gu: 'કંપન',
    hi: 'कंपन'
  },
  channelVisualDesc: {
    en: 'NOW SERVING',
    gu: 'હાલનો વારો',
    hi: 'वर्तमान टोकन'
  },
  channelChimeDesc: {
    en: 'Web Audio',
    gu: 'વેબ ઓડિયો',
    hi: 'वेब ऑडियो'
  },
  channelVoiceDesc: {
    en: 'Voice Guidance',
    gu: 'અવાજ માર્ગદર્શન',
    hi: 'आवाज मार्गदर्शन'
  },
  channelHapticDesc: {
    en: 'Mobile Vibrate',
    gu: 'મોબાઇલ વાઇબ્રેશન',
    hi: 'मोबाइल कंपन'
  },

  // Radar & Waiting Hall Display
  radarHeading: {
    en: 'Live Queue Visualization / Kacheri Radar',
    gu: 'લાઈવ કચેરી રડાર દર્શન',
    hi: 'लाइव कचहरी रडार दृश्य'
  },
  radarBadge: {
    en: 'Kacheri Radar',
    gu: 'કચેરી રડાર',
    hi: 'कचहरी रडार'
  },
  currentOfficeTitle: {
    en: 'Current Office:',
    gu: 'હાલની કચેરી:',
    hi: 'वर्तमान कार्यालय:'
  },
  defaultOfficeName: {
    en: 'Jan Seva Kendra • Mamlatdar Office Gondal, Rajkot',
    gu: 'જન સેવા કેન્દ્ર • મામલતદાર કચેરી ગોંડલ, રાજકોટ',
    hi: 'जन सेवा केंद्र • मामलतदार कार्यालय गोंडल, राजकोट'
  },
  liveWaitEst: {
    en: 'Live Waiting Time',
    gu: 'અંદાજિત પ્રતીક્ષા સમય',
    hi: 'अनुमानित प्रतीक्षा समय'
  },
  estServiceTime: {
    en: 'Est. Service Time: 12:15 PM',
    gu: 'સેવાનો અંદાજિત સમય: બપોરે ૧૨:૧૫',
    hi: 'अनुमानित सेवा समय: दोपहर १२:१५'
  },
  routeBufferDesc: {
    en: 'Route Buffer: 4.2 km (9 mins drive)',
    gu: 'મુસાફરી બફર: ૪.૨ કિમી (૯ મિનિટ મુસાફરી)',
    hi: 'यात्रा बफर: ४.२ किमी (९ मिनट यात्रा)'
  },
  crowdGaugeLabel: {
    en: 'Crowd Gauge',
    gu: 'ભીડ સ્તર',
    hi: 'भीड़ स्तर'
  },
  busyStatus: {
    en: 'BUSY (Moderate)',
    gu: 'મધ્યમ ભીડ (BUSY)',
    hi: 'मध्यम भीड़ (BUSY)'
  },
  capacityText: {
    en: 'Capacity',
    gu: 'ક્ષમતા',
    hi: 'क्षमता'
  },
  activeCountersSummary: {
    en: '6 Counters Active • Total Waiting: 35',
    gu: '૬ કાઉન્ટર કાર્યરત • કુલ પ્રતીક્ષારત: ૩૫',
    hi: '६ काउंटर सक्रिय • कुल प्रतीक्षारत: ३५'
  },
  waitingHallHeading: {
    en: 'Live Waiting Hall Display',
    gu: 'કચેરી પ્રતીક્ષા કક્ષ',
    hi: 'कचहरी प्रतीक्षा कक्ष'
  },
  waitingHallBadge: {
    en: 'Hall Display',
    gu: 'કક્ષ દર્શન',
    hi: 'कक्ष दृश्य'
  },
  waitingHallSub: {
    en: 'Gondal Jan Seva Kendra • 6 Counter Queue Overview',
    gu: 'ગોંડલ જન સેવા કેન્દ્ર • કાઉન્ટર ૧ થી ૬ વિગતવાર સ્થિતિ',
    hi: 'गोंडल जन सेवा केंद्र • काउंटर १ से ६ विस्तृत स्थिति'
  },
  counter1Title: {
    en: 'Social Welfare & Pension',
    gu: 'સમાજ કલ્યાણ અને પેન્શન શાખા',
    hi: 'समाज कल्याण एवं पेंशन शाखा'
  },
  counter1Officer: {
    en: 'Officer: Shri K. M. Trivedi',
    gu: 'અધિકારી: શ્રી કે. એમ. ત્રિવેદી',
    hi: 'अधिकारी: श्री के. एम. त्रिवेदी'
  },
  counter2Title: {
    en: 'Certificates (Income/Caste)',
    gu: 'જન સેવા પ્રમાણપત્રો (આવક/જાતિ)',
    hi: 'जन सेवा प्रमाण पत्र (आय/जाति)'
  },
  counter2Officer: {
    en: 'Officer: Shri P. R. Jadeja',
    gu: 'અધિકારી: શ્રી પી. આર. જાડેજા',
    hi: 'अधिकारी: श्री पी. आर. जाडेजा'
  },
  counter3Title: {
    en: 'Ration Card & Food Supply',
    gu: 'રેશનકાર્ડ અને અન્ન પુરવઠા સેવા',
    hi: 'राशन कार्ड एवं खाद्य आपूर्ति सेवा'
  },
  counter3Officer: {
    en: 'Officer: Shri S. T. Patel',
    gu: 'અધિકારી: શ્રી એસ. ટી. પટેલ',
    hi: 'अधिकारी: श्री एस. टी. पटेल'
  },
  counter4Title: {
    en: 'E-Dhara (7/12 & Land Records)',
    gu: 'ઈ-ધરા કેન્દ્ર (૭/૧૨ જમીન રેકોર્ડ)',
    hi: 'ई-धरा केंद्र (७/१२ भूमि रिकॉर्ड)'
  },
  counter4Officer: {
    en: 'Officer: Shri V. K. Mehta',
    gu: 'અધિકારી: શ્રી વી. કે. મહેતા',
    hi: 'अधिकारी: श्री वी. के. मेहता'
  },
  counter5Title: {
    en: 'Aadhaar Biometric Center',
    gu: 'આધાર કેન્દ્ર (બાયોમેટ્રિક અપડેટ)',
    hi: 'आधार केंद्र (बायोमेट्रिक अपडेट)'
  },
  counter5Officer: {
    en: 'Officer: Shri A. J. Solanki',
    gu: 'અધિકારી: શ્રી એ. જે. સોલંકી',
    hi: 'अधिकारी: श्री ए. जे. सोलंकी'
  },
  counter6Title: {
    en: 'Housing Schemes & General Desk',
    gu: 'આવાસ યોજના અને સામાન્ય પૂછપરછ',
    hi: 'आवास योजना एवं सामान्य पूछताछ'
  },
  counter6Officer: {
    en: 'Officer: Shri N. B. Chavda',
    gu: 'અધિકારી: શ્રી એન. બી. ચાવડા',
    hi: 'अधिकारी: श्री एन. बी. चावड़ा'
  },
  openBadge: {
    en: 'OPEN',
    gu: 'ખુલ્લું છે',
    hi: 'खुला है'
  },
  busyBadge: {
    en: 'BUSY',
    gu: 'કાર્યરત',
    hi: 'कार्यरत'
  },
  lunchBreakBadge: {
    en: 'LUNCH BREAK',
    gu: 'ભોજન વિરામ',
    hi: 'भोजन अवकाश'
  },
  nowServingText: {
    en: 'NOW SERVING',
    gu: 'હાલનો વારો',
    hi: 'वर्तमान टोकन'
  },
  nextText: {
    en: 'NEXT',
    gu: 'આગામી વારો',
    hi: 'अगला टोकन'
  },
  peopleWaitingSuffix: {
    en: 'people waiting',
    gu: 'નાગરિકો પ્રતીક્ષામાં',
    hi: 'नागरिक प्रतीक्षा में'
  },
  estWaitPrefix: {
    en: 'Estimated wait:',
    gu: 'અંદાજિત પ્રતીક્ષા:',
    hi: 'अनुमानित प्रतीक्षा:'
  },
  lunchResumesAt: {
    en: 'Resumes at 2:00 PM',
    gu: 'બપોરે ૨:૦૦ વાગ્યે શરૂ થશે',
    hi: 'दोपहर २:०० बजे शुरू होगा'
  },
  lunchResumesIn: {
    en: 'Resumes in 25 min',
    gu: '૨૫ મિનિટમાં શરૂ થશે',
    hi: '२५ मिनट में शुरू होगा'
  },
  liveSyncNote: {
    en: 'Phase 1 Queue Visualization • Phase 6 provides Real-Time Synchronization across devices.',
    gu: 'તબક્કો ૧ કતાર નિરીક્ષણ • તબક્કો ૬ તમામ ઉપકરણો પર રીઅલ-ટાઇમ સિંક્રોનાઇઝેશન પૂરું પાડે છે.',
    hi: 'चरण १ कतार दृश्य • चरण ६ सभी उपकरणों पर रीयल-टाइम सिंक्रोनाइज़ेशन प्रदान करता है।'
  },

  // Auth Modal
  authModalTitle: {
    en: 'Citizen Identity Verification',
    gu: 'નાગરિક ઓળખ ચકાસણી',
    hi: 'नागरिक पहचान सत्यापन'
  },
  authModalSubtitle: {
    en: 'Enter your mobile number and last 4 digits of Aadhaar for privacy-safe access.',
    gu: 'ગોપનીયતા-સુરક્ષિત સેવા માટે તમારો મોબાઇલ નંબર અને આધારના છેલ્લા ૪ અંક દાખલ કરો.',
    hi: 'गोपनीयता-सुरक्षित सेवा के लिए अपना मोबाइल नंबर और आधार के अंतिम ४ अंक दर्ज करें।'
  },
  loginMandatoryNotice: {
    en: 'Token Security: Login is required',
    gu: 'ટોકન સુરક્ષા: લૉગિન ફરજિયાત છે',
    hi: 'टोकन सुरक्षा: लॉगिन अनिवार्य है'
  },
  phoneLabel: {
    en: 'Mobile Number',
    gu: 'મોબાઇલ નંબર',
    hi: 'मोबाइल नंबर'
  },
  aadhaarLast4Label: {
    en: 'Aadhaar Last 4 Digits',
    gu: 'આધાર કાર્ડના છેલ્લા ૪ અંક',
    hi: 'आधार कार्ड के अंतिम ४ अंक'
  },
  aadhaarMaskingNote: {
    en: '🔒 Aadhaar Masking: Only last 4 digits are used for token identity verification. Full Aadhaar numbers are never stored.',
    gu: '🔒 આધાર માસ્કિંગ: ટોકન ઓળખ માટે માત્ર છેલ્લા ૪ અંક વપરાય છે. સંપૂર્ણ આધાર નંબર ક્યારેય સંગ્રહિત થતો નથી.',
    hi: '🔒 आधार मास्किंग: टोकन पहचान के लिए केवल अंतिम ४ अंकों का उपयोग किया जाता है। पूरा आधार नंबर कभी संग्रहीत नहीं किया जाता है।'
  },
  demoLoginBtn: {
    en: '⚡ Enter Demo as Mohanbhai',
    gu: '⚡ મોહનભાઈ તરીકે ઝડપી પ્રવેશ',
    hi: '⚡ मोहनभाई के रूप में त्वरित प्रवेश'
  },
  getOtpBtn: {
    en: 'Get Secure OTP & Verify',
    gu: 'ઓટીપી મેળવો અને ચકાસો',
    hi: 'ओटीपी प्राप्त करें और सत्यापित करें'
  },
  listenBtnLabel: {
    en: 'Listen',
    gu: 'સાંભળો',
    hi: 'सुनें'
  },

  // Mobile Bottom Navigation
  mobNavHome: {
    en: 'Home',
    gu: 'હોમ',
    hi: 'होम'
  },
  mobNavServices: {
    en: '39 Schemes',
    gu: '૩૯ યોજના',
    hi: '३९ योजनाएं'
  },
  mobNavTokenPass: {
    en: 'Token Pass',
    gu: 'ટોકન પાસ',
    hi: 'टोकन पास'
  },
  mobNavRadar: {
    en: 'Queue Radar',
    gu: 'કચેરી રડાર',
    hi: 'कचहरी रडार'
  },

  // Footer
  footerDisclaimer: {
    en: 'QueueLess / NagrikSeva AI © 2026 • Gujarat Government–Inspired Citizen Service Framework',
    gu: 'QueueLess / નાગરિકસેવા © ૨૦૨૬ • ગુજરાત સરકાર પ્રેરિત નાગરિક સેવા વ્યવસ્થાપન માળખું',
    hi: 'QueueLess / नागरिकसेवा © २०२६ • गुजरात सरकार प्रेरित नागरिक सेवा प्रबंधन ढांचा'
  },
  footerGrtsaCompliance: {
    en: 'GRTSA Service Standard Compliant • Designed for 33 Districts, 250+ Talukas, and 18,000+ Villages',
    gu: 'GRTSA સેવા ધોરણો અનુસાર • ૩૩ જિલ્લાઓ, ૨૫૦+ તાલુકાઓ અને ૧૮,૦૦૦+ ગામો માટે સુલભ',
    hi: 'GRTSA सेवा मानकों के अनुसार • ३३ जिलों, २५०+ तालुकों और १८,०००+ गांवों के लिए सुलभ'
  },
  footerOperatorConsoleLink: {
    en: '🏛️ Counter Operator Console',
    gu: '🏛️ કાઉન્ટર ઓપરેટર કન્સોલ',
    hi: '🏛️ काउंटर ऑपरेटर कंसोल'
  },
  footerCollectorLink: {
    en: '👑 Collector Command Center',
    gu: '👑 કલેક્ટર કમાન્ડ સેન્ટર',
    hi: '👑 कलेक्टर कमांड सेंटर'
  }
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS;

export function t(key: TranslationKey, lang: Language): string {
  const item = TRANSLATIONS[key];
  if (!item) return key;
  return (item as any)[lang] || (item as any)['gu'] || (item as any)['en'] || key;
}
