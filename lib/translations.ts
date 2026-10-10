export type Language = 'gu' | 'hi' | 'en' | (string & {});

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
    regionalDescription: 'રાષ્ટ્રભાષા • વ્યાપક સંપર્ક ભાષા (National Language)',
    badge: 'રાષ્ટ્રભાષા'
  },
  {
    code: 'en',
    nativeLabel: 'English',
    englishLabel: 'English',
    multiLabel: 'English (અંગ્રેજી)',
    regionalDescription: 'સત્તાવાર વહીવટી અને જાહેર સેવાઓ (Administrative Access)',
    badge: 'Official'
  }
];

export const TRANSLATIONS = {
  // Top Header Bar
  topBarStatusLive: {
    en: 'Citizen Service Network • Live Status',
    gu: 'નાગરિક સેવા નેટવર્ક • લાઈવ સ્થિતિ',
    hi: 'नागरिक सेवा नेटवर्क • लाइव स्थिति',
    mr: 'नागरिक सेवा नेटवर्क • थेट स्थिती (Live)'
  },
  topBarFramework: {
    en: 'GRTSA Public Service Framework',
    gu: 'GRTSA જાહેર સેવા માળખું',
    hi: 'GRTSA लोक सेवा ढांचा',
    mr: 'GRTSA लोकसेवा चौकट'
  },
  langDropdownTitle: {
    en: 'Languages used in Gujarat (Select Language)',
    gu: 'ગુજરાતમાં વપરાતી ભાષાઓ (ભાષા પસંદ કરો)',
    hi: 'गुजरात में प्रयुक्त भाषाएं (भाषा चुनें)',
    mr: 'गुजरातमधील भाषा (भाषा निवडा)'
  },
  langDropdownSub: {
    en: 'Select your preferred language for the entire portal',
    gu: 'સમગ્ર પોર્ટલ માટે તમારી પસંદગીની ભાષા પસંદ કરો',
    hi: 'संपूर्ण पोर्टल के लिए अपनी पसंदीदा भाषा चुनें',
    mr: 'संपूर्ण पोर्टलसाठी आपली पसंतीची भाषा निवडा'
  },
  demoPersonasBtn: {
    en: '⚡ Demo Personas',
    gu: '⚡ ડેમો પ્રોફાઇલ્સ',
    hi: '⚡ डेमो प्रोफाइल',
    mr: '⚡ डेमो प्रोफाइल्स'
  },
  demoMenuTitle: {
    en: 'One-Click Demo Personas (Evaluation)',
    gu: 'ઝડપી ડેમો પ્રોફાઇલ્સ (ચકાસણી માટે)',
    hi: 'त्वरित डेमो प्रोफाइल (परीक्षण हेतु)',
    mr: 'त्वरित डेमो प्रोफाइल्स (मूल्यांकनासाठी)'
  },
  demoMenuSubtitle: {
    en: 'For jury & test evaluation without manual OTPs or phone entry.',
    gu: 'OTP કે ફોન નંબર દાખલ કર્યા વગર તાત્કાલિક ટેસ્ટિંગ માટે.',
    hi: 'बिना ओटीपी या फोन नंबर के तुरंत परीक्षण के लिए।',
    mr: 'ओटीपी किंवा फोन नंबर न टाकता त्वरित चाचणीसाठी.'
  },
  citizenPersonaTitle: {
    en: 'Citizen Profile (Hari Patel)',
    gu: 'નાગરિક પ્રોફાઇલ (હરિ પટેલ)',
    hi: 'नागरिक प्रोफाइल (हरि पटेल)',
    mr: 'नागरिक प्रोफाइल (हरी पटेल)'
  },
  officerPersonaTitle: {
    en: 'Officer Console Persona ➔',
    gu: 'અધિકારી કાઉન્ટર ડેસ્ક ➔',
    hi: 'अधिकारी काउंटर डेस्क ➔',
    mr: 'अधिकारी काउंटर डेस्क ➔'
  },
  collectorPersonaTitle: {
    en: 'Collector Command Center ➔',
    gu: 'કલેક્ટર કમાન્ડ સેન્ટર ➔',
    hi: 'कलेक्टर कमांड सेंटर ➔',
    mr: 'जिल्हाधिकारी कमांड सेंटर ➔'
  },
  resetSessionBtn: {
    en: 'Reset Session',
    gu: 'સેશન રીસેટ કરો',
    hi: 'सत्र रीसेट करें',
    mr: 'सत्र रीसेट करा'
  },

  // Main Nav
  appTitle: {
    en: 'QueueLess',
    gu: 'QueueLess',
    hi: 'QueueLess',
    mr: 'QueueLess'
  },
  appTag: {
    en: 'Kacheri',
    gu: 'કચેરી',
    hi: 'कचहरी',
    mr: 'कचेरी'
  },
  appSubtitle: {
    en: 'Government Office Queue Management System',
    gu: 'ગુજરાત સરકારી કચેરી કતાર મુક્તિ વ્યવસ્થાપન પ્રણાલી',
    hi: 'गुजरात सरकारी कार्यालय कतार प्रबंधन प्रणाली',
    mr: 'शासकीय कार्यालय रांग मुक्ती व्यवस्थापन प्रणाली'
  },
  navHome: {
    en: 'Home',
    gu: 'હોમ',
    hi: 'होम',
    mr: 'मुख्यपृष्ठ'
  },
  navServices: {
    en: 'Services (39 Schemes)',
    gu: 'સેવાઓ (૩૯ યોજનાઓ)',
    hi: 'सेवाएं (३९ योजनाएं)',
    mr: 'सेवा (३९ योजना)'
  },
  navRadar: {
    en: 'Queue Radar',
    gu: 'કચેરી રડાર',
    hi: 'कचहरी रडार',
    mr: 'कचेरी रडार'
  },
  navTrackToken: {
    en: 'Track Token',
    gu: 'ટોકન ટ્રેક કરો',
    hi: 'टोकन ट्रैक करें',
    mr: 'टोकन ट्रॅक करा'
  },
  navHelp: {
    en: 'Help & Support',
    gu: 'મદદ અને સહાય',
    hi: 'मदद और सहायता',
    mr: 'मदत आणि सहाय्य'
  },
  navOfficerDesk: {
    en: 'Officer Desk',
    gu: 'અધિકારી ડેસ્ક',
    hi: 'अधिकारी डेस्क',
    mr: 'अधिकारी डेस्क'
  },
  btnLogin: {
    en: 'Login',
    gu: 'લૉગિન',
    hi: 'लॉगिन',
    mr: 'लॉगिन'
  },
  btnGetStarted: {
    en: 'Get Started',
    gu: 'શરૂ કરો',
    hi: 'शुरू करें',
    mr: 'सुरू करा'
  },
  demoModeBadge: {
    en: '🧪 DEMO MODE',
    gu: '🧪 ડેમો મોડ',
    hi: '🧪 डेमो मोड',
    mr: '🧪 डेमो मोड'
  },

  // Hero Section
  heroBadge: {
    en: 'Government of Gujarat • General Administration Department (GAD)',
    gu: 'ગુજરાત સરકાર • સામાન્ય વહીવટ વિભાગ (GAD)',
    hi: 'गुजरात सरकार • सामान्य प्रशासन विभाग (GAD)',
    mr: 'गुजरात शासन • सामान्य प्रशासन विभाग (GAD)'
  },
  heroTitleLine1: {
    en: 'Digital Jan Seva Portal —',
    gu: 'ડિજિટલ જન સેવા પોર્ટલ —',
    hi: 'डिजिटल जन सेवा पोर्टल —',
    mr: 'डिजिटल जन सेवा पोर्टल —'
  },
  heroTitleLine2: {
    en: 'Transparent, Timely & Citizen-Centric Governance',
    gu: 'પારદર્શક, સરળ અને સમયબદ્ધ નાગરિક સેવાઓ',
    hi: 'पारदर्शी, सुलभ और समयबद्ध नागरिक सेवाएं',
    mr: 'पारदर्शक, सुलभ आणि वेळेवर नागरिक सेवा'
  },
  heroSubtitle: {
    en: 'Official slot scheduling and virtual queue token system under the Gujarat Right to Public Services Act (GRTSA 2013). Access 39+ G2C administrative services across all 33 districts and 250+ Talukas.',
    gu: 'ગુજરાત લોક સેવા હક્ક અધિનિયમ (GRTSA ૨૦૧૩) અને નાગરિક અધિકાર પત્ર હેઠળ સત્તાવાર સ્લોટ બુકિંગ તથા વર્ચ્યુઅલ કતાર વ્યવસ્થાપન. રાજ્યના તમામ ૩૩ જિલ્લાઓ અને ૨૫૦+ તાલુકાઓમાં મામલતદાર, જન સેવા કેન્દ્ર અને પંચાયત સેવાઓ સુલભ.',
    hi: 'गुजरात लोक सेवा अधिकार अधिनियम (GRTSA २०१३) और नागरिक अधिकार पत्र के अंतर्गत आधिकारिक स्लॉट बुकिंग व वर्चुअल कतार प्रणाली। राज्य के सभी ३३ जिलों और २५०+ तालुकों में जन सेवा केंद्र, मामलतदार व पंचायत सेवाएं उपलब्ध।',
    mr: 'गुजरात लोकसेवा हक्क कायदा (GRTSA २०१३) आणि नागरिक सनदेनुसार अधिकृत स्लॉट बुकिंग आणि व्हर्च्युअल रांग व्यवस्थापन. राज्यातील सर्व ३३ जिल्हे आणि २५०+ तालुक्यांमध्ये मामलतदार, जन सेवा केंद्र व पंचायत सेवा सहज उपलब्ध.'
  },
  guestDeskTitle: {
    en: 'Citizen Public Action Desk',
    gu: 'નાગરિક જાહેર સેવા ડેસ્ક',
    hi: 'नागरिक लोक सेवा डेस्क',
    mr: 'नागरिक सार्वजनिक सेवा डेस्क'
  },
  guestDeskSubtitle: {
    en: 'Live Queue Tracking & Instant Slot Booking',
    gu: 'લાઈવ ટોકન ટ્રેકિંગ અને ત્વરિત સ્લોટ બુકિંગ',
    hi: 'लाइव टोकन ट्रैकिंग और त्वरित स्लॉट बुकिंग',
    mr: 'थेट टोकन ट्रॅकिंग आणि त्वरित स्लॉट बुकिंग'
  },
  tabTrackToken: {
    en: 'Track Token',
    gu: 'ટોકન ટ્રેક કરો',
    hi: 'टोकन ट्रैक करें',
    mr: 'टोकन ट्रॅक करा'
  },
  tabBookSlot: {
    en: 'Book Slot',
    gu: 'સ્લોટ બુક કરો',
    hi: 'स्लॉट बुक करें',
    mr: 'स्लॉट बुक करा'
  },
  enterTokenPlaceholder: {
    en: 'Enter token no. (e.g. A-42, B-1247)',
    gu: 'ટોકન નંબર દાખલ કરો (દા.ત. A-42, B-1247)',
    hi: 'टोकन संख्या दर्ज करें (उदा. A-42, B-1247)',
    mr: 'टोकन क्रमांक टाका (उदा. A-42, B-1247)'
  },
  btnTrackNow: {
    en: 'Check Live Status',
    gu: 'લાઈવ સ્થિતિ ચકાસો',
    hi: 'लाइव स्थिति जांचें',
    mr: 'थेट स्थिती तपासा'
  },
  helpModalTitle: {
    en: 'Citizen Help & Grievance Support',
    gu: 'નાગરિક સહાય અને ફરિયાદ નિવારણ ડેસ્ક',
    hi: 'नागरिक सहायता और शिकायत निवारण डेस्क',
    mr: 'नागरिक सहाय्य आणि तक्रार निवारण डेस्क'
  },
  helpModalSubtitle: {
    en: 'Government of Gujarat Official Support Channels',
    gu: 'ગુજરાત સરકાર સત્તાવાર સહાય ચેનલો અને સંપર્ક સૂત્રો',
    hi: 'गुजरात सरकार आधिकारिक सहायता चैनल और संपर्क सूत्र',
    mr: 'गुजरात शासन अधिकृत सहाय्य चॅनेल आणि संपर्क'
  },
  heroSearchPlaceholder: {
    en: 'Search: Tractor, MYSY, Income Certificate, Ayushman...',
    gu: 'શોધો: ટ્રેક્ટર, MYSY, આવક દાખલો, આયુષ્માન કાર્ડ...',
    hi: 'खोजें: ट्रैक्टर, MYSY, आय प्रमाण पत्र, आयुष्मान कार्ड...',
    mr: 'शोधा: ट्रॅक्टर, MYSY, उत्पन्न दाखला, आयुष्मान कार्ड...'
  },
  heroExploreBtn: {
    en: 'Explore 39 Schemes',
    gu: '૩૯ યોજનાઓ જુઓ',
    hi: '३९ योजनाएं देखें',
    mr: '३९ योजना पहा'
  },
  heroTagDistricts: {
    en: '33 Districts & 250+ Talukas',
    gu: '૩૩ જિલ્લાઓ અને ૨૫૦+ તાલુકાઓ',
    hi: '३३ जिले और २५०+ तालुका',
    mr: '३३ जिल्हे आणि २५०+ तालुके'
  },
  heroTagPrivacy: {
    en: 'Citizen Identity & Masked Aadhaar',
    gu: 'નાગરિક ઓળખ અને માસ્ક્ડ આધાર',
    hi: 'नागरिक पहचान और मास्क्ड आधार',
    mr: 'नागरिक ओळख आणि सुरक्षित आधार'
  },
  heroTagLive: {
    en: 'Live Updates 24/7',
    gu: '૨૪/૭ લાઈવ અપડેટ્સ',
    hi: '२४/७ लाइव अपडेट',
    mr: '२४/७ थेट अपडेट्स'
  },

  // Floating Virtual Token Card
  virtualTokenTitle: {
    en: 'Your Virtual Token',
    gu: 'તમારો વર્ચ્યુઅલ ટોકન',
    hi: 'आपका वर्चुअल टोकन',
    mr: 'तुमचा व्हर्च्युअल टोकन'
  },
  tokenActiveBadge: {
    en: 'ACTIVE',
    gu: 'સક્રિય',
    hi: 'सक्रिय',
    mr: 'सक्रिय'
  },
  tokenCenterDefault: {
    en: 'Gondal Jan Seva Kendra – Rajkot',
    gu: 'ગોંડલ જન સેવા કેન્દ્ર – રાજકોટ',
    hi: 'गोंडल जन सेवा केंद्र – राजकोट',
    mr: 'गोंडल जन सेवा केंद्र – राजकोट'
  },
  estimatedWaitLabel: {
    en: 'Estimated wait:',
    gu: 'અંદાજિત પ્રતીક્ષા સમય:',
    hi: 'अनुमानित प्रतीक्षा समय:',
    mr: 'अंदाजित प्रतीक्षा वेळ:'
  },
  estimatedWaitVal: {
    en: '12 mins',
    gu: '૧૨ મિનિટ',
    hi: '१२ मिनट',
    mr: '१२ मिनिटे'
  },
  scanAtEntryText: {
    en: 'Scan at Office Entry',
    gu: 'કચેરીના પ્રવેશદ્વારે સ્કેન કરો',
    hi: 'कार्यालय प्रवेश पर स्कैन करें',
    mr: 'कार्यालय प्रवेशद्वारावर स्कॅन करा'
  },
  btnViewLiveRadar: {
    en: 'View Live Queue Radar ➔',
    gu: 'કચેરી રડાર જુઓ (Live Queue) ➔',
    hi: 'कचहरी रडार देखें (Live Queue) ➔',
    mr: 'कचेरी रडार पहा (Live Queue) ➔'
  },

  // Stats Counters
  statLiveTokens: {
    en: 'Live Tokens Today',
    gu: 'આજના સક્રિય ટોકન',
    hi: 'आज के सक्रिय टोकन',
    mr: 'आजचे सक्रिय टोकन'
  },
  statAvgWait: {
    en: 'Avg Counter Wait Time',
    gu: 'સરેરાશ કાઉન્ટર પ્રતીક્ષા',
    hi: 'औसत काउंटर प्रतीक्षा',
    mr: 'सरासरी काउंटर प्रतीक्षा'
  },
  statActiveKacheris: {
    en: 'Active Kacheris',
    gu: 'કાર્યરત સેવા કેન્દ્રો',
    hi: 'सक्रिय सेवा केंद्र',
    mr: 'सक्रिय सेवा केंद्रे'
  },
  statGrtsaSla: {
    en: 'GRTSA SLA Delivery',
    gu: 'GRTSA સમયમર્યાદા પરિપાલન',
    hi: 'GRTSA समय-सीमा अनुपालन',
    mr: 'GRTSA मुदतपूर्ती प्रमाण'
  },
  statAllDistricts: {
    en: 'All 33 Districts',
    gu: 'તમામ ૩૩ જિલ્લાઓ',
    hi: 'सभी ३३ जिले',
    mr: 'सर्व ३३ जिल्हे'
  },
  statTimeBound: {
    en: 'Time-bound Services',
    gu: 'સમયબદ્ધ જાહેર સેવાઓ',
    hi: 'समयबद्ध सार्वजनिक सेवाएं',
    mr: 'वेळेवर लोकसेवा'
  },
  todayGrowth: {
    en: '↑ 8.2% today',
    gu: '↑ ૮.૨% આજે',
    hi: '↑ ८.२% आज',
    mr: '↑ ८.२% आज'
  },
  vsWalkin: {
    en: '↓ 22% vs walk-in',
    gu: '↓ ૨૨% સીધા આવવા કરતાં ઓછો',
    hi: '↓ २२% सीधे आने की तुलना में',
    mr: '↓ २२% थेट येण्यापेक्षा कमी वेळ'
  },

  // Services Page Back Button & Title
  backToHome: {
    en: 'Back to Home',
    gu: 'હોમ પેજ પર પાછા જાઓ',
    hi: 'मुख्य पृष्ठ पर वापस जाएं',
    mr: 'मुख्य पृष्ठावर परत जा'
  },

  // Dashboard Aside & Main
  dashboardTitle: {
    en: 'Citizen Dashboard',
    gu: 'નાગરિક ડેશબોર્ડ',
    hi: 'नागरिक डैशबोर्ड',
    mr: 'नागरिक डॅशबोर्ड'
  },
  govTechPortal: {
    en: 'GovTech | Citizen Service Portal',
    gu: 'સરકારી ટેકનોલોજી | નાગરિક સેવા પોર્ટલ',
    hi: 'सरकारी प्रौद्योगिकी | नागरिक सेवा पोर्टल',
    mr: 'शासकीय तंत्रज्ञान | नागरिक सेवा पोर्टल'
  },
  historyTab: {
    en: 'History',
    gu: 'ઇતિહાસ',
    hi: 'इतिहास',
    mr: 'इतिहास'
  },
  profileTab: {
    en: 'Profile',
    gu: 'પ્રોફાઇલ',
    hi: 'प्रोफाइल',
    mr: 'प्रोफाइल'
  },
  liveDistrictLabel: {
    en: 'Live District:',
    gu: 'લાઈવ જિલ્લો:',
    hi: 'लाइव जिला:',
    mr: 'थेट जिल्हा:'
  },
  districtRajkot: {
    en: 'Rajkot District',
    gu: 'રાજકોટ જિલ્લો',
    hi: 'राजकोट जिला',
    mr: 'राजकोट जिल्हा'
  },
  myLiveTokenCardTitle: {
    en: 'My Live Token',
    gu: 'મારો લાઈવ ટોકન',
    hi: 'मेरा लाइव टोकन',
    mr: 'माझा थेट टोकन'
  },
  defaultServiceTitle: {
    en: 'Certificate Services',
    gu: 'જન સેવા પ્રમાણપત્રો',
    hi: 'प्रमाणपत्र सेवाएं',
    mr: 'दाखले आणि प्रमाणपत्र सेवा'
  },
  defaultServiceSub: {
    en: 'Caste & Income Certificate Verification',
    gu: 'આવક અને જાતિ પ્રમાણપત્ર ચકાસણી',
    hi: 'आय एवं जाति प्रमाण पत्र सत्यापन',
    mr: 'उत्पन्न व जात प्रमाणपत्र पडताळणी'
  },
  counterLabel: {
    en: 'Counter',
    gu: 'કાઉન્ટર',
    hi: 'काउंटर',
    mr: 'काउंटर'
  },
  officerLabel: {
    en: 'Officer:',
    gu: 'અધિકારી:',
    hi: 'अधिकारी:',
    mr: 'अधिकारी:'
  },
  arriveByLabel: {
    en: 'Arrive by',
    gu: 'પહોંચવાનો સમય:',
    hi: 'पहुंचने का समय:',
    mr: 'पोहोचण्याची वेळ:'
  },
  trafficBufferLabel: {
    en: '(Traffic Buffer included)',
    gu: '(ટ્રાફિક બફર સહિત)',
    hi: '(ट्रैफिक बफर सहित)',
    mr: '(वाहतूक बफर समाविष्ट)'
  },
  rescheduledLabel: {
    en: '(Rescheduled)',
    gu: '(ખસેડેલ સમય)',
    hi: '(पुनर्निर्धारित)',
    mr: '(पुनर्नियोजित)'
  },
  btnRunningLate: {
    en: 'Running Late? (+20 min)',
    gu: 'મોડું થશે (+૨૦ મિનિટ)',
    hi: 'देरी होगी (+२० मिनट)',
    mr: 'उशीर होणार? (+२० मिनिटे)'
  },
  btnListenAudio: {
    en: 'Listen (Audio TTS)',
    gu: 'સાંભળો (અવાજ TTS)',
    hi: 'सुनें (ऑडियो TTS)',
    mr: 'ऐका (ऑडिओ TTS)'
  },
  btnViewDigitalPass: {
    en: 'View Official Digital Token Pass',
    gu: 'સત્તાવાર ડિજિટલ ટોકન પાસ જુઓ',
    hi: 'आधिकारिक डिजिटल टोकन पास देखें',
    mr: 'अधिकृत डिजिटल टोकन पास पहा'
  },
  queuePosition: {
    en: 'Your Queue Position',
    gu: 'કતારમાં તમારું સ્થાન',
    hi: 'कतार में आपका स्थान',
    mr: 'रांगेतील तुमचे स्थान'
  },

  // Multi-Modal Accessibility Panel
  multiModalTitle: {
    en: 'Multi-Modal Accessibility System',
    gu: 'સુલભતા પ્રણાલી (Multi-Modal Accessibility)',
    hi: 'सुलभता प्रणाली (Multi-Modal Accessibility)',
    mr: 'सुलभता प्रणाली (Multi-Modal Accessibility)'
  },
  elderlyRuralTag: {
    en: 'Elderly & Rural',
    gu: 'વરિષ્ઠ અને ગ્રામીણ',
    hi: 'वरिष्ठ एवं ग्रामीण',
    mr: 'ज्येष्ठ नागरिक व ग्रामीण'
  },
  multiModalDesc: {
    en: 'Designed for elderly citizens and rural communities with 4 synchronized notification channels:',
    gu: 'વરિષ્ઠ નાગરિકો અને ગ્રામીણ જનતા માટે ૪ સમન્વિત ચેનલો દ્વારા સૂચના:',
    hi: 'वरिष्ठ नागरिकों और ग्रामीण क्षेत्रों के लिए ४ समन्वित चैनलों द्वारा सूचना:',
    mr: 'ज्येष्ठ नागरिक आणि ग्रामीण भागासाठी ४ समन्वित चॅनेलद्वारे सूचना:'
  },
  channelVisual: {
    en: 'Visual',
    gu: 'દ્રશ્ય',
    hi: 'दृश्य',
    mr: 'दृश्य'
  },
  channelChime: {
    en: 'Chime',
    gu: 'ઘંટડી',
    hi: 'घंटी',
    mr: 'घंटी'
  },
  channelVoice: {
    en: 'Voice (TTS)',
    gu: 'અવાજ (TTS)',
    hi: 'आवाज (TTS)',
    mr: 'आवाज (TTS)'
  },
  channelHaptic: {
    en: 'Haptic',
    gu: 'કંપન',
    hi: 'कंपन',
    mr: 'कंपन'
  },
  channelVisualDesc: {
    en: 'NOW SERVING',
    gu: 'હાલનો વારો',
    hi: 'वर्तमान टोकन',
    mr: 'सध्याचा टोकन'
  },
  channelChimeDesc: {
    en: 'Web Audio',
    gu: 'વેબ ઓડિયો',
    hi: 'वेब ऑडियो',
    mr: 'वेब ऑडिओ'
  },
  channelVoiceDesc: {
    en: 'Voice Guidance',
    gu: 'અવાજ માર્ગદર્શન',
    hi: 'आवाज मार्गदर्शन',
    mr: 'आवाज मार्गदर्शन'
  },
  channelHapticDesc: {
    en: 'Mobile Vibrate',
    gu: 'મોબાઇલ વાઇબ્રેશન',
    hi: 'मोबाइल कंपन',
    mr: 'मोबाईल व्हायब्रेशन'
  },

  // Radar & Waiting Hall Display
  radarHeading: {
    en: 'Live Queue Visualization / Kacheri Radar',
    gu: 'લાઈવ કચેરી રડાર દર્શન',
    hi: 'लाइव कचहरी रडार दृश्य',
    mr: 'थेट कचेरी रडार दृश्य'
  },
  radarBadge: {
    en: 'Kacheri Radar',
    gu: 'કચેરી રડાર',
    hi: 'कचहरी रडार',
    mr: 'कचेरी रडार'
  },
  currentOfficeTitle: {
    en: 'Current Office:',
    gu: 'હાલની કચેરી:',
    hi: 'वर्तमान कार्यालय:',
    mr: 'सध्याचे कार्यालय:'
  },
  defaultOfficeName: {
    en: 'Jan Seva Kendra • Mamlatdar Office Gondal, Rajkot',
    gu: 'જન સેવા કેન્દ્ર • મામલતદાર કચેરી ગોંડલ, રાજકોટ',
    hi: 'जन सेवा केंद्र • मामलतदार कार्यालय गोंडल, राजकोट',
    mr: 'जन सेवा केंद्र • मामलतदार कार्यालय गोंडल, राजकोट'
  },
  liveWaitEst: {
    en: 'Live Waiting Time',
    gu: 'અંદાજિત પ્રતીક્ષા સમય',
    hi: 'अनुमानित प्रतीक्षा समय',
    mr: 'अंदाजित प्रतीक्षा वेळ'
  },
  estServiceTime: {
    en: 'Est. Service Time: 12:15 PM',
    gu: 'સેવાનો અંદાજિત સમય: બપોરે ૧૨:૧૫',
    hi: 'अनुमानित सेवा समय: दोपहर १२:१५',
    mr: 'अंदाजित सेवा वेळ: दुपारी १२:१५'
  },
  routeBufferDesc: {
    en: 'Route Buffer: 4.2 km (9 mins drive)',
    gu: 'મુસાફરી બફર: ૪.૨ કિમી (૯ મિનિટ મુસાફરી)',
    hi: 'यात्रा बफर: ४.२ किमी (९ मिनट यात्रा)',
    mr: 'प्रवास बफर: ४.२ किमी (९ मिनिटे प्रवास)'
  },
  crowdGaugeLabel: {
    en: 'Crowd Gauge',
    gu: 'ભીડ સ્તર',
    hi: 'भीड़ स्तर',
    mr: 'गर्दी पातळी'
  },
  busyStatus: {
    en: 'BUSY (Moderate)',
    gu: 'મધ્યમ ભીડ (BUSY)',
    hi: 'मध्यम भीड़ (BUSY)',
    mr: 'मध्यम गर्दी (BUSY)'
  },
  capacityText: {
    en: 'Capacity',
    gu: 'ક્ષમતા',
    hi: 'क्षमता',
    mr: 'क्षमता'
  },
  activeCountersSummary: {
    en: '6 Counters Active • Total Waiting: 35',
    gu: '૬ કાઉન્ટર કાર્યરત • કુલ પ્રતીક્ષારત: ૩૫',
    hi: '६ काउंटर सक्रिय • कुल प्रतीक्षारत: ३५',
    mr: '६ काउंटेर्स सक्रिय • एकूण प्रतीक्षारत: ३५'
  },
  waitingHallHeading: {
    en: 'Live Waiting Hall Display',
    gu: 'કચેરી પ્રતીક્ષા કક્ષ',
    hi: 'कचहरी प्रतीक्षा कक्ष',
    mr: 'कचेरी प्रतीक्षा कक्ष'
  },
  waitingHallBadge: {
    en: 'Hall Display',
    gu: 'કક્ષ દર્શન',
    hi: 'कक्ष दृश्य',
    mr: 'कक्ष प्रदर्शन'
  },
  waitingHallSub: {
    en: 'Gondal Jan Seva Kendra • 6 Counter Queue Overview',
    gu: 'ગોંડલ જન સેવા કેન્દ્ર • કાઉન્ટર ૧ થી ૬ વિગતવાર સ્થિતિ',
    hi: 'गोंडल जन सेवा केंद्र • काउंटर १ से ६ विस्तृत स्थिति',
    mr: 'गोंडल जन सेवा केंद्र • काउंटर १ ते ६ सविस्तर स्थिती'
  },
  counter1Title: {
    en: 'Social Welfare & Pension',
    gu: 'સમાજ કલ્યાણ અને પેન્શન શાખા',
    hi: 'समाज कल्याण एवं पेंशन शाखा',
    mr: 'समाज कल्याण व निवृत्तीवेतन शाखा'
  },
  counter1Officer: {
    en: 'Officer: Shri K. M. Trivedi',
    gu: 'અધિકારી: શ્રી કે. એમ. ત્રિવેદી',
    hi: 'अधिकारी: श्री के. एम. त्रिवेदी',
    mr: 'अधिकारी: श्री के. एम. त्रिवेदी'
  },
  counter2Title: {
    en: 'Certificates (Income/Caste)',
    gu: 'જન સેવા પ્રમાણપત્રો (આવક/જાતિ)',
    hi: 'जन सेवा प्रमाण पत्र (आय/जाति)',
    mr: 'दाखले व प्रमाणपत्रे (उत्पन्न/जात)'
  },
  counter2Officer: {
    en: 'Officer: Shri P. R. Jadeja',
    gu: 'અધિકારી: શ્રી પી. આર. જાડેજા',
    hi: 'अधिकारी: श्री पी. आर. जाडेजा',
    mr: 'अधिकारी: श्री पी. आर. जाडेजा'
  },
  counter3Title: {
    en: 'Ration Card & Food Supply',
    gu: 'રેશનકાર્ડ અને અન્ન પુરવઠા સેવા',
    hi: 'राशन कार्ड एवं खाद्य आपूर्ति सेवा',
    mr: 'रेशनकार्ड व अन्न पुरवठा सेवा'
  },
  counter3Officer: {
    en: 'Officer: Shri S. T. Patel',
    gu: 'અધિકારી: શ્રી એસ. ટી. પટેલ',
    hi: 'अधिकारी: श्री एस. टी. पटेल',
    mr: 'अधिकारी: श्री एस. टी. पटेल'
  },
  counter4Title: {
    en: 'E-Dhara (7/12 & Land Records)',
    gu: 'ઈ-ધરા કેન્દ્ર (૭/૧૨ જમીન રેકોર્ડ)',
    hi: 'ई-धरा केंद्र (७/१२ भूमि रिकॉर्ड)',
    mr: 'ई-धरा केंद्र (७/१२ जमीन महसूल)'
  },
  counter4Officer: {
    en: 'Officer: Shri V. K. Mehta',
    gu: 'અધિકારી: શ્રી વી. કે. મહેતા',
    hi: 'अधिकारी: श्री वी. के. मेहता',
    mr: 'अधिकारी: श्री व्ही. के. मेहता'
  },
  counter5Title: {
    en: 'Aadhaar Biometric Center',
    gu: 'આધાર કેન્દ્ર (બાયોમેટ્રિક અપડેટ)',
    hi: 'आधार केंद्र (बायोमेट्रिक अपडेट)',
    mr: 'आधार केंद्र (बायोमेट्रिक अपडेट)'
  },
  counter5Officer: {
    en: 'Officer: Shri A. J. Solanki',
    gu: 'અધિકારી: શ્રી એ. જે. સોલંકી',
    hi: 'अधिकारी: श्री ए. जे. सोलंकी',
    mr: 'अधिकारी: श्री ए. जे. सोलंकी'
  },
  counter6Title: {
    en: 'Housing Schemes & General Desk',
    gu: 'આવાસ યોજના અને સામાન્ય પૂછપરછ',
    hi: 'आवास योजना एवं सामान्य पूछताछ',
    mr: 'गृहनिर्माण योजना व सामान्य विचारणा'
  },
  counter6Officer: {
    en: 'Officer: Shri N. B. Chavda',
    gu: 'અધિકારી: શ્રી એન. બી. ચાવડા',
    hi: 'अधिकारी: श्री एन. बी. चावड़ा',
    mr: 'अधिकारी: श्री एन. बी. चावडा'
  },
  openBadge: {
    en: 'OPEN',
    gu: 'ખુલ્લું છે',
    hi: 'खुला है',
    mr: 'सुरू आहे'
  },
  busyBadge: {
    en: 'BUSY',
    gu: 'કાર્યરત',
    hi: 'कार्यरत',
    mr: 'व्यस्त'
  },
  lunchBreakBadge: {
    en: 'LUNCH BREAK',
    gu: 'ભોજન વિરામ',
    hi: 'भोजन अवकाश',
    mr: 'दुपारची सुट्टी'
  },
  nowServingText: {
    en: 'NOW SERVING',
    gu: 'હાલનો વારો',
    hi: 'वर्तमान टोकन',
    mr: 'सध्याचा टोकन'
  },
  nextText: {
    en: 'NEXT',
    gu: 'આગામી વારો',
    hi: 'अगला टोकन',
    mr: 'पुढील टोकन'
  },
  peopleWaitingSuffix: {
    en: 'people waiting',
    gu: 'નાગરિકો પ્રતીક્ષામાં',
    hi: 'नागरिक प्रतीक्षा में',
    mr: 'नागरिक प्रतीक्षेत'
  },
  estWaitPrefix: {
    en: 'Estimated wait:',
    gu: 'અંદાજિત પ્રતીક્ષા:',
    hi: 'अनुमानित प्रतीक्षा:',
    mr: 'अंदाजित प्रतीक्षा:'
  },
  lunchResumesAt: {
    en: 'Resumes at 2:00 PM',
    gu: 'બપોરે ૨:૦૦ વાગ્યે શરૂ થશે',
    hi: 'दोपहर २:०० बजे शुरू होगा',
    mr: 'दुपारी २:०० वाजता सुरू होईल'
  },
  lunchResumesIn: {
    en: 'Resumes in 25 min',
    gu: '૨૫ મિનિટમાં શરૂ થશે',
    hi: '२५ मिनट में शुरू होगा',
    mr: '२५ मिनिटांत सुरू होईल'
  },
  liveSyncNote: {
    en: 'Phase 1 Queue Visualization • Phase 6 provides Real-Time Synchronization across devices.',
    gu: 'તબક્કો ૧ કતાર નિરીક્ષણ • તબક્કો ૬ તમામ ઉપકરણો પર રીઅલ-ટાઇમ સિંક્રોનાઇઝેશન પૂરું પાડે છે.',
    hi: 'चरण १ कतार दृश्य • चरण ६ सभी उपकरणों पर रीयल-टाइम सिंक्रोनाइज़ेशन प्रदान करता है।',
    mr: 'टप्पा १ रांग दृश्य • टप्पा ६ सर्व उपकरणांवर रिअल-टाइम समक्रमण प्रदान करतो.'
  },
  publicRadarBannerBadge: {
    en: 'Jan Seva Kendra Live Queue Display',
    gu: 'જન સેવા કેન્દ્ર લાઈવ કતાર ડિસ્પ્લે',
    hi: 'जन सेवा केंद्र लाइव कतार डिस्प्ले',
    mr: 'जन सेवा केंद्र थेट रांग डिस्प्ले'
  },
  publicRadarBannerStatus: {
    en: 'Public Status Board',
    gu: 'જાહેર સ્થિતિ બોર્ડ',
    hi: 'सार्वजनिक स्थिति बोर्ड',
    mr: 'सार्वजनिक स्थिती फलक'
  },
  publicRadarBannerTitle: {
    en: 'Live Queue & Counter Display',
    gu: 'કચેરી લાઈવ કતાર અને કાઉન્ટર સ્થિતિ',
    hi: 'कार्यालय लाइव कतार एवं काउंटर स्थिति',
    mr: 'कार्यालय थेट रांग आणि काउंटर स्थिती'
  },
  publicRadarBannerSub: {
    en: 'Skip physical lines! Book an appointment online before visiting, or track any live token in real-time.',
    gu: 'કચેરીએ લાઈનમાં ઊભા રહ્યા વિના ઘરેથી જ ઓનલાઇન સ્લોટ બુક કરો અથવા તમારો લાઈવ ટોકન ટ્રેક કરો.',
    hi: 'कार्यालय में कतार में खड़े हुए बिना घर से ही ऑनलाइन स्लॉट बुक करें अथवा लाइव टोकन ट्रैक करें।',
    mr: 'कार्यालयात रांगेत उभे न राहता घरूनच ऑनलाइन स्लॉट बुक करा किंवा थेट टोकन ट्रॅक करा.'
  },
  btnBookSlotCTA: {
    en: 'Book Slot / Token Online',
    gu: 'ઓનલાઇન સ્લોટ / ટોકન બુક કરો',
    hi: 'ऑनलाइन स्लॉट / टोकन बुक करें',
    mr: 'ऑनलाइन स्लॉट / टोकन बुक करा'
  },
  btnTrackTokenCTA: {
    en: 'Track Token',
    gu: 'ટોકન ટ્રેક કરો',
    hi: 'टोकन ट्रैक करें',
    mr: 'टोकन ट्रॅक करा'
  },
  queueFreeDeskTitle: {
    en: 'Queue-Free Citizen Entry Desk',
    gu: 'નાગરિક કતાર મુક્તિ પ્રવેશ ડેસ્ક',
    hi: 'नागरिक कतार मुक्ति प्रवेश डेस्क',
    mr: 'नागरिक रांग मुक्ती प्रवेश डेस्क'
  },
  guestDeskBadge: {
    en: 'Public Mode • Zero Wait',
    gu: 'જાહેર મોડ • ઝીરો વેઇટિંગ',
    hi: 'सार्वजनिक मोड • शून्य प्रतीक्षा',
    mr: 'सार्वजनिक मोड • शून्य प्रतीक्षा'
  },
  guestDeskHeadline: {
    en: 'Visit Kacheri Without Standing in Queue',
    gu: 'લાઈનમાં ઊભા રહ્યા વિના કચેરીએ સેવા મેળવો',
    hi: 'कतार में खड़े हुए बिना कार्यालय में सेवा प्राप्त करें',
    mr: 'रांगेत उभे न राहता कार्यालयात सेवा मिळवा'
  },
  guestDeskDesc: {
    en: 'Book your office appointment in 3 simple steps before visiting:',
    gu: 'કચેરીએ જતા પહેલા ફક્ત ૩ સરળ સ્ટેપમાં સ્લોટ બુક કરો:',
    hi: 'कार्यालय जाने से पहले केवल ३ आसान चरणों में स्लॉट बुक करें:',
    mr: 'कार्यालयात जाण्यापूर्वी फक्त ३ सोप्या चरणांत स्लॉट बुक करा:'
  },
  guestStep1: {
    en: '1. Select scheme & pre-verify documents',
    gu: '૧. યોજના પસંદ કરી દસ્તાવેજ પ્રી-ચેક કરો',
    hi: '१. योजना चुनकर दस्तावेज प्री-चेक करें',
    mr: '१. योजना निवडून कागदपत्रे पूर्व-तपासा'
  },
  guestStep2: {
    en: '2. Choose preferred date & time slot',
    gu: '૨. અનુકૂળ તારીખ અને સમય સ્લોટ પસંદ કરો',
    hi: '२. पसंदीदा तारीख एवं समय स्लॉट चुनें',
    mr: '२. सोयीस्कर तारीख आणि वेळ स्लॉट निवडा'
  },
  guestStep3: {
    en: '3. Receive QR pass & walk directly to counter',
    gu: '૩. ડિજિટલ QR પાસ સાથે સીધા કાઉન્ટર પર પહોંચો',
    hi: '३. डिजिटल QR पास के साथ सीधे काउंटर पर पहुंचें',
    mr: '३. डिजिटल QR पाससह थेट काउंटरवर पोहोचा'
  },
  alreadyHaveTokenPrompt: {
    en: 'Already booked an appointment?',
    gu: 'પહેલેથી એપોઇન્ટમેન્ટ બુક કરેલ છે?',
    hi: 'पहले से अपॉइंटमेंट बुक कर चुके हैं?',
    mr: 'आधीच अपॉइंटमेंट बुक केली आहे का?'
  },
  loginPromptBtn: {
    en: 'Citizen Login',
    gu: 'નાગરિક લૉગિન',
    hi: 'नागरिक लॉगिन',
    mr: 'नागरिक लॉगिन'
  },
  loginToViewPassBtn: {
    en: 'Login to View Pass',
    gu: 'પાસ જોવા લૉગિન કરો',
    hi: 'पास देखने के लिए लॉगिन करें',
    mr: 'पास पाहण्यासाठी लॉगिन करा'
  },
  loggedInNoBookingTitle: {
    en: 'Welcome',
    gu: 'નમસ્તે',
    hi: 'नमस्ते',
    mr: 'नमस्कार'
  },
  loggedInNoBookingSub: {
    en: 'You do not have any active appointments or tokens currently.',
    gu: 'તમારી પાસે હાલ કોઈ સક્રિય એપોઇન્ટમેન્ટ કે ટોકન નથી.',
    hi: 'वर्तमान में आपके पास कोई सक्रिय अपॉइंटमेंट या टोकन नहीं है।',
    mr: 'तुमच्याकडे सध्या कोणतीही सक्रिय अपॉइंटमेंट किंवा टोकन नाही.'
  },
  noActiveTokenTitle: {
    en: 'No Active Token',
    gu: 'કોઈ સક્રિય ટોકન નથી',
    hi: 'कोई सक्रिय टोकन नहीं',
    mr: 'कोणताही सक्रिय टोकन नाही'
  },
  noActiveTokenDesc: {
    en: 'Book an appointment slot to get direct queue-free service at the counter.',
    gu: 'કચેરી કાઉન્ટર પર સીધા પ્રવેશ માટે નવો એપોઇન્ટમેન્ટ સ્લોટ બુક કરો.',
    hi: 'कार्यालय काउंटर पर सीधे प्रवेश के लिए नया अपॉइंटमेंट स्लॉट बुक करें।',
    mr: 'कार्यालय काउंटरवर थेट प्रवेशासाठी नवीन अपॉइंटमेंट स्लॉट बुक करा.'
  },
  yourDeskBadge: {
    en: 'YOUR DESK',
    gu: 'તમારું કાઉન્ટર',
    hi: 'आपका काउंटर',
    mr: 'आपले काउंटर'
  },


  // Auth Modal
  authModalTitle: {
    en: 'Citizen Identity Verification',
    gu: 'નાગરિક ઓળખ ચકાસણી',
    hi: 'नागरिक पहचान सत्यापन',
    mr: 'नागरिक ओळख पडताळणी'
  },
  authModalSubtitle: {
    en: 'Enter your mobile number and last 4 digits of Aadhaar for privacy-safe access.',
    gu: 'ગોપનીયતા-સુરક્ષિત સેવા માટે તમારો મોબાઇલ નંબર અને આધારના છેલ્લા ૪ અંક દાખલ કરો.',
    hi: 'गोपनीयता-सुरक्षित सेवा के लिए अपना मोबाइल नंबर और आधार के अंतिम ४ अंक दर्ज करें।',
    mr: 'सुरक्षित सेवेसाठी आपला मोबाईल नंबर आणि आधारचे शेवटचे ४ अंक प्रविष्ट करा.'
  },
  loginMandatoryNotice: {
    en: 'Token Security: Login is required',
    gu: 'ટોકન સુરક્ષા: લૉગિન ફરજિયાત છે',
    hi: 'टोकन सुरक्षा: लॉगिन अनिवार्य है',
    mr: 'टोकन सुरक्षा: लॉगिन आवश्यक आहे'
  },
  phoneLabel: {
    en: 'Mobile Number',
    gu: 'મોબાઇલ નંબર',
    hi: 'मोबाइल नंबर',
    mr: 'मोबाईल नंबर'
  },
  aadhaarLast4Label: {
    en: 'Aadhaar Last 4 Digits',
    gu: 'આધાર કાર્ડના છેલ્લા ૪ અંક',
    hi: 'आधार कार्ड के अंतिम ४ अंक',
    mr: 'आधार कार्डचे शेवटचे ४ अंक'
  },
  aadhaarMaskingNote: {
    en: '🔒 Aadhaar Masking: Only last 4 digits are used for token identity verification. Full Aadhaar numbers are never stored.',
    gu: '🔒 આધાર માસ્કિંગ: ટોકન ઓળખ માટે માત્ર છેલ્લા ૪ અંક વપરાય છે. સંપૂર્ણ આધાર નંબર ક્યારેય સંગ્રહિત થતો નથી.',
    hi: '🔒 आधार मास्किंग: टोकन पहचान के लिए केवल अंतिम ४ अंकों का उपयोग किया जाता है। पूरा आधार नंबर कभी संग्रहीत नहीं किया जाता है।',
    mr: '🔒 आधार मास्किंग: टोकन ओळखीसाठी फक्त शेवटचे ४ अंक वापरले जातात. पूर्ण आधार क्रमांक कधीही संग्रहित केला जात नाही.'
  },
  demoLoginBtn: {
    en: '⚡ Enter as Hari Patel',
    gu: '⚡ હરિ પટેલ તરીકે ઝડપી પ્રવેશ',
    hi: '⚡ हरि पटेल के रूप में त्वरित प्रवेश',
    mr: '⚡ हरी पटेल म्हणून त्वरित प्रवेश'
  },
  getOtpBtn: {
    en: 'Get Secure OTP & Verify',
    gu: 'ઓટીપી મેળવો અને ચકાસો',
    hi: 'ओटीपी प्राप्त करें और सत्यापित करें',
    mr: 'ओटीपी मिळवा आणि पडताळा'
  },
  listenBtnLabel: {
    en: 'Listen',
    gu: 'સાંભળો',
    hi: 'सुनें',
    mr: 'ऐका'
  },

  // Mobile Bottom Navigation
  mobNavHome: {
    en: 'Home',
    gu: 'હોમ',
    hi: 'होम',
    mr: 'मुख्य'
  },
  mobNavServices: {
    en: '39 Schemes',
    gu: '૩૯ યોજના',
    hi: '३९ योजनाएं',
    mr: '३९ योजना'
  },
  mobNavTokenPass: {
    en: 'Token Pass',
    gu: 'ટોકન પાસ',
    hi: 'टोकन पास',
    mr: 'टोकन पास'
  },
  mobNavRadar: {
    en: 'Queue Radar',
    gu: 'કચેરી રડાર',
    hi: 'कचहरी रडार',
    mr: 'कचेरी रडार'
  },
  mobNavMenu: {
    en: 'Menu',
    gu: 'મેનુ',
    hi: 'मेनू',
    mr: 'मेनू'
  },

  // Footer
  footerDisclaimer: {
    en: 'QueueLess / NagrikSeva AI © 2026 • Gujarat Government–Inspired Citizen Service Framework',
    gu: 'QueueLess / નાગરિકસેવા © ૨૦૨૬ • ગુજરાત સરકાર પ્રેરિત નાગરિક સેવા વ્યવસ્થાપન માળખું',
    hi: 'QueueLess / नागरिकसेवा © २०२६ • गुजरात सरकार प्रेरित नागरिक सेवा प्रबंधन ढांचा',
    mr: 'QueueLess / नागरिकसेवा © २०२६ • गुजरात शासन प्रेरित नागरिक सेवा व्यवस्थापन चौकट'
  },
  footerGrtsaCompliance: {
    en: 'GRTSA Service Standard Compliant • Designed for 33 Districts, 250+ Talukas, and 18,000+ Villages',
    gu: 'GRTSA સેવા ધોરણો અનુસાર • ૩૩ જિલ્લાઓ, ૨૫૦+ તાલુકાઓ અને ૧૮,૦૦૦+ ગામો માટે સુલભ',
    hi: 'GRTSA सेवा मानकों के अनुसार • ३३ जिलों, २५०+ तालुकों और १८,०००+ गांवों के लिए सुलभ',
    mr: 'GRTSA सेवा मानकांनुसार • ३३ जिल्हे, २५०+ तालुके आणि १८,०००+ गावांसाठी सुलभ'
  },
  footerOperatorConsoleLink: {
    en: '🏛️ Counter Operator Console',
    gu: '🏛️ કાઉન્ટર ઓપરેટર કન્સોલ',
    hi: '🏛️ काउंटर ऑपरेटर कंसोल',
    mr: '🏛️ काउंटर ऑपरेटर कन्सोल'
  },
  footerCollectorLink: {
    en: '👑 Collector Command Center',
    gu: '👑 કલેક્ટર કમાન્ડ સેન્ટર',
    hi: '👑 कलेक्टर कमांड सेंटर',
    mr: '👑 जिल्हाधिकारी कमांड सेंटर'
  }
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS;

export const KUTCHI_TRANSLATIONS: Partial<Record<TranslationKey, string>> = {
  topBarStatusLive: 'નાગરિક સેવા નેટવર્ક • લાઈવ સ્થિતિ (કચ્છ ને ગુજરાત)',
  topBarFramework: 'GRTSA જાહેર સેવા માળખું',
  langDropdownTitle: 'ગુજરાત ને કચ્છ મેં બોલાતી બોલીયું (ભાષા પસંદ કર્યો)',
  langDropdownSub: 'આખા પોર્ટલ વાસ્તે તમારી પસંદગીજી ભાષા પસંદ કર્યો',
  navHome: 'હોમ (ઘર)',
  navServices: 'સેવાયું (૩૯ યોજનાયું)',
  navRadar: 'કચેરી રડાર',
  navTrackToken: 'ટોકન સ્થિતિ ડીસો',
  navHelp: 'મદદ ને સહાય',
  navOfficerDesk: 'અધિકારી ડેસ્ક',
  btnLogin: 'લૉગિન',
  btnGetStarted: 'ચાલુ કર્યો',
  heroBadge: 'ગુજરાત સરકાર • સામાન્ય વહીવટ વિભાગ (GAD)',
  heroTitleLine1: 'ડિજિટલ જન સેવા પોર્ટલ —',
  heroTitleLine2: 'સાફ, સોરી ને વગતસર નાગરિક સેવાયું',
  heroSubtitle: 'ગુજરાત લોક સેવા હક્ક કાયદા (GRTSA ૨૦૧૩) હેઠળ સત્તાવાર સ્લોટ બુકિંગ ને લાઈવ કતાર વ્યવસ્થા. કચ્છ ને આખા ગુજરાત જે તમામ ૩૩ જિલા ને ૨૫૦+ તાલુકા જે જન સેવા કેન્દ્ર, મામલતદાર ને પંચાયત સેવાયું ઘરબેઠા મેળવ્યો.',
  guestDeskTitle: 'નાગરિક જાહેર સેવા ડેસ્ક',
  guestDeskSubtitle: 'લાઈવ ટોકન ટ્રેકિંગ ને ત્વરિત સ્લોટ બુકિંગ',
  tabTrackToken: 'ટોકન સ્થિતિ ડીસો',
  tabBookSlot: 'સ્લોટ બુક કર્યો',
  enterTokenPlaceholder: 'ટોકન નંબર લખો (દા.ત. A-42)',
  btnTrackNow: 'લાઈવ સ્થિતિ ડીસો',
  heroSearchPlaceholder: 'યોજના અથવા સેવા ગોતો: ટ્રેક્ટર, MYSY, આવક દાખલો...',
  heroExploreBtn: '૩૯ યોજનાયું ડીસો',
  heroTagDistricts: '૩૩ જિલા ને ૨૫૦+ તાલુકા',
  heroTagPrivacy: 'નાગરિક ઓળખ સુરક્ષિત',
  heroTagLive: '૨૪/૭ લાઈવ અપડેટ',
  backToHome: 'પાછા વળો (હોમ)',
  statLiveTokens: 'આજ જે લાઈવ ટોકન',
  todayGrowth: 'રાજ્યવ્યાપી સેવાયું',
  statAvgWait: 'સરેરાશ વારો',
  vsWalkin: 'કતાર વગર ત્વરિત',
  statActiveKacheris: 'સક્રિય કચેરીયું',
  statAllDistricts: 'કચ્છ સહિત તમામ જિલ્લા',
  statGrtsaSla: 'GRTSA સેવા ગેરેંટી',
  statTimeBound: 'સમયસર સેવા નિયમ',
  defaultOfficeName: 'જન સેવા કેન્દ્ર (કચ્છ/ગુજરાત)',
  footerDisclaimer: 'QueueLess / નાગરિકસેવા © ૨૦૨૬ • ગુજરાત સરકાર પ્રેરિત નાગરિક સેવા વ્યવસ્થાપન માળખું',
  footerGrtsaCompliance: 'GRTSA સેવા ધોરણો અનુસાર • ૩૩ જિલ્લાઓ, ૨૫૦+ તાલુકાઓ અને ૧૮,૦૦૦+ ગામો માટે સુલભ'
};

export function t(key: TranslationKey, lang: Language): string {
  const item = TRANSLATIONS[key];
  if (!item) return key;

  // Direct match for requested language
  const direct = (item as any)[lang];
  if (direct) return direct;

  // Kutchi specific translations
  if (lang === 'khi') {
    if (KUTCHI_TRANSLATIONS[key]) return KUTCHI_TRANSLATIONS[key]!;
    return (item as any)['gu'] || (item as any)['hi'] || key;
  }

  // Region-aware fallbacks for Gujarat's multilingual demographics:
  // 1. Marathi (Surat, Navsari, Vadodara) -> Marathi or Hindi or Gujarati
  if (lang === 'mr') return (item as any)['mr'] || (item as any)['hi'] || (item as any)['gu'] || key;
  // 2. Marwari & Sindhi -> Hindi or Gujarati
  if (lang === 'mwr' || lang === 'sd') return (item as any)['hi'] || (item as any)['gu'] || key;
  // 3. Bengali, Odia, Urdu -> Hindi or English
  if (lang === 'bn' || lang === 'or' || lang === 'ur') return (item as any)['hi'] || (item as any)['en'] || (item as any)['gu'] || key;

  return (item as any)['gu'] || (item as any)['en'] || key;
}
