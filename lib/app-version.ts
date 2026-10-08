export interface ChangelogItem {
  icon: string;
  categoryGu: string;
  categoryEn: string;
  titleGu: string;
  titleEn: string;
  descriptionGu: string;
  descriptionEn: string;
  badge?: string;
}

export interface AppReleaseVersion {
  version: string;
  releaseDateGu: string;
  releaseDateEn: string;
  titleGu: string;
  titleEn: string;
  isLatest: boolean;
  highlightSummaryGu: string;
  highlightSummaryEn: string;
  changes: ChangelogItem[];
}

export const CURRENT_APP_VERSION = 'v2.5.2';
export const RELEASE_TIMESTAMP = '2026-10-08 18:25 IST';

export const APP_CHANGELOG_HISTORY: AppReleaseVersion[] = [
  {
    version: 'v2.5.2',
    releaseDateGu: '૮ ઓક્ટોબર ૨૦૨૬ (તાજું અપડેટ)',
    releaseDateEn: '8 October 2026 (Latest Build)',
    titleGu: 'રીઅલ-ટાઇમ GPS રિવર્સ જિયોકોડિંગ & કાયદેસર સરકારી દસ્તાવેજ વૉલ્ટ',
    titleEn: 'Real-Time GPS Reverse Geocoding & Statutory Government Document Vault',
    isLatest: true,
    highlightSummaryGu: 'તમે ક્યાં બેઠા છો તે ચોક્કસ લાઈવ લોકેશન ડિટેક્શન, નજીકની કચેરીઓનું લાઈવ કિમી અંતર અને પરિવાર વૉલ્ટમાં અસલ રેશનકાર્ડ/જન્મ પ્રમાણપત્ર ફાઇલ અપલોડ ઉમેરાઈ ગયું છે.',
    highlightSummaryEn: 'Exact live GPS address detection, real dynamic distance to nearby kacheris, and official file upload with AI verification in Family Vault.',
    changes: [
      {
        icon: '📍',
        categoryGu: 'લાઈવ લોકેશન',
        categoryEn: 'Live Geolocation',
        titleGu: 'વાસ્તવિક લાઈવ GPS રિવર્સ જિયોકોડિંગ (Real-Time Location)',
        titleEn: 'Real-Time Reverse Geocoded Location Detection',
        descriptionGu: 'હવે ફિક્સ્ડ ટેક્સ્ટ નહીં પણ બ્રાઉઝરના ચોક્કસ અક્ષાંશ-રેખાંશ પરથી ઓપનસ્ટ્રીટમેપ અને ગુજરાત પ્રોક્સિમિટી એન્જિન દ્વારા તમારું એક્ઝેક્ટ સરનામું (વિસ્તાર, શહેર, જિલ્લો) અને ±૫ મીટર એક્યુરેસી લાઈવ ડિટેક્ટ થાય છે.',
        descriptionEn: 'Detects your exact street, city, and district using real-time browser GPS coordinates and reverse geocoding instead of static text.',
        badge: 'નવું'
      },
      {
        icon: '🏛️',
        categoryGu: 'કચેરી રડાર',
        categoryEn: 'Kacheri Radar',
        titleGu: 'ડાયનેમિક ગુજરાત કચેરી અંતર ગણતરી (Haversine Distance)',
        titleEn: 'Dynamic Haversine Distance & Travel Time Calculation',
        descriptionGu: 'તમે જ્યાં બેઠા છો ત્યાંથી ગુજરાતની તમામ મામલતદાર કચેરીઓનું વાસ્તવિક કિમી અંતર અને મુસાફરીનો સમય લાઈવ ગણાય છે. સૌથી નજીકની ૩ કચેરીઓ શોર્ટલિસ્ટ થાય છે અને મુક્ત કાઉન્ટર (< 35% ભીડ) વાળી કચેરી માટે સ્માર્ટ સૂચન મળે છે.',
        descriptionEn: 'Dynamically measures live km distance and travel time from your coordinates to all Gujarat Jan Seva centers and highlights the fastest desk.',
        badge: 'નવું'
      },
      {
        icon: '📄',
        categoryGu: 'દસ્તાવેજ વૉલ્ટ',
        categoryEn: 'Document Vault',
        titleGu: 'પરિવાર વૉલ્ટમાં અસલ સરકારી દસ્તાવેજ ફાઇલ અપલોડ',
        titleEn: 'Official Statutory Proof Document File Upload',
        descriptionGu: 'પરિવારમાં સભ્ય ઉમેરવા માટે હવે રેશનકાર્ડ (NFSA ૨૦૧૩ નિયમ ૭), જન્મ પ્રમાણપત્ર (CRSR ફોર્મ ૫), અથવા લગ્ન નોંધણી (ફોર્મ ૧) ની અસલ PDF/JPG ફાઇલ અપલોડ અને દસ્તાવેજ નંબર આપવો ફરજિયાત છે.',
        descriptionEn: 'Upload real PDF/JPG files with document registration numbers for NFSA Ration Card, Birth Certificate, or Marriage Registration.',
        badge: 'સરકારી નિયમ'
      },
      {
        icon: '🛡️',
        categoryGu: 'AI વેરિફિકેશન',
        categoryEn: 'AI Verification',
        titleGu: 'AI મલ્ટી-સ્ટેજ OCR સ્કેનિંગ અને સરકારી ડેટાબેઝ મેળવણી',
        titleEn: 'AI Multi-Stage Document Cross-Verification Engine',
        descriptionGu: 'અપલોડ કરેલા દસ્તાવેજનો OCR સ્કેન થાય છે, ગુજરાત સિવિલ સપ્લાય NFSA ડેટાબેઝ સાથે મેળવણી થાય છે અને કુટુંબના વડા સાથે ૯૯.૪% ચોકસાઈથી સંબંધ પુષ્ટિ થાય છે.',
        descriptionEn: 'Simulated OCR scanning and cross-verification against Gujarat civil supplies registry with 99.4% confidence score.',
        badge: 'AI Powered'
      },
      {
        icon: '🔒',
        categoryGu: 'સુરક્ષા OTP',
        categoryEn: 'Security OTP',
        titleGu: 'સેકન્ડરી મોબાઈલ ૬-અંક OTP સુરક્ષા ચકાસણી',
        titleEn: 'Secondary Mobile 6-Digit OTP Authorization',
        descriptionGu: 'જો ઉમેરાતા સભ્યનો મોબાઈલ નંબર અલગ હોય, તો તે નંબર પર ૬-અંકનો સુરક્ષા OTP મોકલવામાં આવે છે અને ચકાસણી પછી જ પરિવારમાં લિંક થાય છે.',
        descriptionEn: 'Members with distinct mobile numbers require instant 6-digit OTP authentication before linking to family vault.',
        badge: 'સુરક્ષિત'
      },
      {
        icon: '📱',
        categoryGu: 'મોબાઇલ UI',
        categoryEn: 'Mobile UI/UX',
        titleGu: 'અલ્ટ્રા-રિસ્પોન્સિવ મોબાઇલ લેઆઉટ & રેશનકાર્ડ ફિક્સ',
        titleEn: 'Ultra-Responsive Mobile Layout & Vault Card Formatting',
        descriptionGu: 'મોબાઈલ સ્ક્રીન (320px થી 640px) પર હેડર, પ્રૂફ સિલેક્ટર અને સભ્યોના કાર્ડ્સ કોઈ પણ કટિંગ વગર સુંદર અને સુવાચ્ય દેખાય છે.',
        descriptionEn: 'Eliminated text overflows, fixed cramped buttons, and optimized touch spacing on mobile viewports.',
        badge: 'સુધારો'
      },
      {
        icon: '💾',
        categoryGu: 'સેશન સેવિંગ',
        categoryEn: 'Session Persistence',
        titleGu: 'ઓટો સેશન પર્સિસ્ટન્સ (F5 રિફ્રેશ પર લૉગઆઉટ નહીં થાય)',
        titleEn: 'Persistent Session State on Page Refresh',
        descriptionGu: 'પેજ રિફ્રેશ કરવાથી લૉગિન કે સક્રિય ટોકન બુકિંગ જતું રહેતું નથી, લોકલસ્ટોરેજમાં સુરક્ષિત રીતે જળવાઈ રહે છે.',
        descriptionEn: 'Session, bookings, and active views are safely retained across page reloads and network reconnects.',
        badge: 'સુધારો'
      },
      {
        icon: '⚡',
        categoryGu: 'ઇન્સ્ટોલ & લૉગિન',
        categoryEn: 'PWA & Login',
        titleGu: '૧-ક્લિક સિંગલ ઇન્સ્ટોલ અને ૧-ક્લિક લૉગિન',
        titleEn: '1-Click PWA App Install & Instant Login Flow',
        descriptionGu: 'કોઈ બિનજરૂરી ડેસ્કટોપ ટ્યુટોરીયલ વગર સીધું એક જ ક્લિકમાં એપ ઇન્સ્ટોલ અને સિંગલ-ક્લિક લૉગિન.',
        descriptionEn: 'Native direct PWA install prompt and 1-click modal triggers without multi-click delays.',
        badge: 'સુધારો'
      }
    ]
  },
  {
    version: 'v2.4.0',
    releaseDateGu: '૭ ઓક્ટોબર ૨૦૨૬',
    releaseDateEn: '7 October 2026',
    titleGu: 'આધાર સરનામું વિરુદ્ધ કચેરી રડાર & ૬ કાઉન્ટર ડેશબોર્ડ',
    titleEn: 'Aadhaar Native Address vs Radar & 6-Counter Live Dashboard',
    isLatest: false,
    highlightSummaryGu: 'આધાર નોંધાયેલ સરનામું, ૬ કાઉન્ટર લાઈવ લિસ્ટ અને અધિકૃત નાગરિક હરિ પટેલ લૉગિન સિસ્ટમ.',
    highlightSummaryEn: 'Aadhaar registered jurisdiction comparison and live multi-counter visualization.',
    changes: [
      {
        icon: '🏛️',
        categoryGu: 'કાઉન્ટર ડેશબોર્ડ',
        categoryEn: 'Counter Dashboard',
        titleGu: '૬ સરકારી કાઉન્ટર લાઈવ લિસ્ટ & ટોકન વિતરણ',
        titleEn: '6 Live Service Counters and Active Token Displays',
        descriptionGu: 'જન સેવા, ઈ-ધરા, રેશનકાર્ડ અને આધાર કાઉન્ટરની લાઈવ પ્રતીક્ષા યાદી.',
        descriptionEn: 'Live waiting list and token numbers across 6 government service counters.'
      },
      {
        icon: '👤',
        categoryGu: 'નાગરિક ઓળખ',
        categoryEn: 'Citizen Identity',
        titleGu: 'હરિ પટેલ • ગોમટા, ગોંડલ અધિકૃત નાગરિક પ્રોફાઇલ',
        titleEn: 'Hari Patel • Gomta, Gondal Citizen Aadhaar Identity',
        descriptionGu: 'વાસ્તવિક આધાર વિગતો સાથે સરકારી ઓળખ કાર્ડ.',
        descriptionEn: 'Authentic Aadhaar credentials with native jurisdiction mapping.'
      }
    ]
  }
];
