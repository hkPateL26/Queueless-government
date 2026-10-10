export interface FamilyMember {
  id: string;
  nameGu: string;
  nameEn: string;
  relationGu: string;
  relationEn: string;
  relationType: 'self' | 'spouse' | 'child' | 'parent' | 'sibling' | 'other';
  aadhaarMasked: string;
  mobile: string;
  isSameMobile: boolean;
  status: 'verified' | 'pending_otp' | 'pending_ai_check';
  documentProofType?: 'ration_card' | 'birth_certificate' | 'marriage_certificate' | 'aadhaar_family_sheet';
  documentProofNumber?: string;
  documentFileName?: string;
  documentFileSize?: string;
  documentFilePreview?: string;
  aiMatchConfidence?: number;
  addedAt?: string;
}

export interface CitizenAadhaarProfile {
  nameGu: string;
  nameEn: string;
  aadhaarMasked: string;
  mobile: string;
  villageGu: string;
  villageEn: string;
  talukaId: string;
  talukaGu: string;
  talukaEn: string;
  districtId: string;
  districtGu: string;
  districtEn: string;
  pincode: string;
  fullAddressGu: string;
  fullAddressEn: string;
  familyMembers: FamilyMember[];
}

export interface NearbyKacheriService {
  nameGu: string;
  nameEn: string;
  counterNumber: number;
  officerNameGu: string;
  status: 'open' | 'lunch' | 'busy';
  currentToken: string;
  waitingCount: number;
  estimatedMinutes: number;
}

export interface NearbyKacheriInfo {
  id: string;
  nameGu: string;
  nameEn: string;
  talukaId: string;
  talukaNameGu: string;
  talukaNameEn: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  travelMinutes: number;
  crowdPercentage: number;
  avgWaitMinutes: number;
  activeCountersCount: number;
  isRecommendedFastest: boolean;
  recommendationReasonGu?: string;
  recommendationReasonEn?: string;
  servicesAvailable: NearbyKacheriService[];
  modifiableServicesGu: string[];
  modifiableServicesEn: string[];
}

export interface GujaratKacheriMaster {
  id: string;
  nameGu: string;
  nameEn: string;
  talukaId: string;
  talukaNameGu: string;
  talukaNameEn: string;
  latitude: number;
  longitude: number;
  baseCrowdPercentage: number;
  baseAvgWaitMinutes: number;
  activeCountersCount: number;
  servicesAvailable: NearbyKacheriService[];
  modifiableServicesGu: string[];
  modifiableServicesEn: string[];
}

export const DEFAULT_CITIZEN_PROFILE: CitizenAadhaarProfile = {
  nameGu: 'તૃષા સોમૈયા',
  nameEn: 'Trusha Somaiya',
  aadhaarMasked: 'XXXX XXXX 8842',
  mobile: '9876543210',
  villageGu: 'ગોમટા',
  villageEn: 'Gomta',
  talukaId: 'gondal',
  talukaGu: 'ગોંડલ',
  talukaEn: 'Gondal',
  districtId: 'rajkot',
  districtGu: 'રાજકોટ',
  districtEn: 'Rajkot',
  pincode: '360311',
  fullAddressGu: 'ઘર નં. ૪૪, રામજી મંદિર ચોક, મુ. ગોમટા, તાલુકો: ગોંડલ, જિલ્લો: રાજકોટ - ૩૬૦૩૧૧ (ગુજરાત)',
  fullAddressEn: 'House No. 44, Ramji Mandir Chowk, Village: Gomta, Taluka: Gondal, District: Rajkot - 360311 (Gujarat)',
  familyMembers: [
    {
      id: 'mem-1',
      nameGu: 'તૃષા સોમૈયા',
      nameEn: 'Trusha Somaiya',
      relationGu: 'સ્વયં (મુખ્ય સભ્ય)',
      relationEn: 'Self (Head of Family)',
      relationType: 'self',
      aadhaarMasked: 'XXXX XXXX 8842',
      mobile: '9876543210',
      isSameMobile: true,
      status: 'verified',
      documentProofType: 'aadhaar_family_sheet',
      documentProofNumber: 'AADH-GUJ-8842',
      documentFileName: 'Aadhaar_Card_TrushaSomaiya.pdf',
      documentFileSize: '1.2 MB',
      aiMatchConfidence: 99.8,
      addedAt: '2026-01-10'
    },
    {
      id: 'mem-2',
      nameGu: 'હરિ પટેલ',
      nameEn: 'Hari Patel',
      relationGu: 'પતિ',
      relationEn: 'Spouse (Husband)',
      relationType: 'spouse',
      aadhaarMasked: 'XXXX XXXX 1294',
      mobile: '9876543210',
      isSameMobile: true,
      status: 'verified',
      documentProofType: 'marriage_certificate',
      documentProofNumber: 'MR-GUJ-2012-004812',
      documentFileName: 'Marriage_Certificate_Trusha_Hari.pdf',
      documentFileSize: '1.5 MB',
      aiMatchConfidence: 99.4,
      addedAt: '2026-01-15'
    },
    {
      id: 'mem-3',
      nameGu: 'આયુષ પટેલ',
      nameEn: 'Aayush Patel',
      relationGu: 'પુત્ર',
      relationEn: 'Child (Son)',
      relationType: 'child',
      aadhaarMasked: 'XXXX XXXX 6531',
      mobile: '9876543210',
      isSameMobile: true,
      status: 'verified',
      documentProofType: 'birth_certificate',
      documentProofNumber: 'BC-GONDAL-2015-842',
      documentFileName: 'Birth_Certificate_Form5_Aayush.pdf',
      documentFileSize: '980 KB',
      aiMatchConfidence: 98.9,
      addedAt: '2026-02-01'
    },
    {
      id: 'mem-4',
      nameGu: 'પરસોત્તમભાઈ પટેલ',
      nameEn: 'Parsottambhai Patel',
      relationGu: 'સસરા (વરિષ્ઠ નાગરિક)',
      relationEn: 'Father-in-law (Senior Citizen)',
      relationType: 'parent',
      aadhaarMasked: 'XXXX XXXX 4410',
      mobile: '9825123456',
      isSameMobile: false,
      status: 'verified',
      documentProofType: 'ration_card',
      documentProofNumber: 'RC-NFSA-GJ-10948271',
      documentFileName: 'NFSA_Ration_Card_Joint.pdf',
      documentFileSize: '2.1 MB',
      aiMatchConfidence: 97.6,
      addedAt: '2026-02-18'
    }
  ]
};

// MASTER GUJARAT GOVERNMENT KACHERI DATABASE WITH EXACT GEOLOCATION COORDINATES
export const GUJARAT_KACHERIS_MASTER: GujaratKacheriMaster[] = [
  {
    id: 'kacheri-gondal',
    nameGu: 'જન સેવા કેન્દ્ર • તાલુકા મામલતદાર કચેરી ગોંડલ',
    nameEn: 'Jan Seva Kendra • Taluka Mamlatdar Office Gondal',
    talukaId: 'gondal',
    talukaNameGu: 'ગોંડલ',
    talukaNameEn: 'Gondal',
    latitude: 21.9619,
    longitude: 70.7923,
    baseCrowdPercentage: 74,
    baseAvgWaitMinutes: 18,
    activeCountersCount: 6,
    servicesAvailable: [
      { nameGu: 'સમાજ કલ્યાણ અને પેન્શન', nameEn: 'Social Welfare & Pension', counterNumber: 1, officerNameGu: 'કે. એમ. ત્રિવેદી', status: 'open', currentToken: 'A-40', waitingCount: 8, estimatedMinutes: 24 },
      { nameGu: 'જન સેવા પ્રમાણપત્રો (આવક/જાતિ)', nameEn: 'Certificates (Income/Caste)', counterNumber: 2, officerNameGu: 'પી. આર. જાડેજા', status: 'busy', currentToken: 'A-41', waitingCount: 5, estimatedMinutes: 15 },
      { nameGu: 'રેશનકાર્ડ & પુરવઠા સેવા', nameEn: 'Ration Card & Food Supply', counterNumber: 3, officerNameGu: 'એસ. ટી. પટેલ', status: 'lunch', currentToken: 'A-38', waitingCount: 3, estimatedMinutes: 25 },
      { nameGu: 'ઈ-ધરા કેન્દ્ર (૭/૧૨ & ખેતી)', nameEn: 'E-Dhara (7/12 & Land Records)', counterNumber: 4, officerNameGu: 'વી. કે. મહેતા', status: 'open', currentToken: 'B-12', waitingCount: 6, estimatedMinutes: 18 },
      { nameGu: 'આધાર કેન્દ્ર (બાયોમેટ્રિક)', nameEn: 'Aadhaar Biometric Center', counterNumber: 5, officerNameGu: 'એ. જે. સોલંકી', status: 'busy', currentToken: 'B-14', waitingCount: 11, estimatedMinutes: 32 },
      { nameGu: 'આવાસ & સામાન્ય પૂછપરછ', nameEn: 'Housing Schemes & General Desk', counterNumber: 6, officerNameGu: 'એન. બી. ચાવડા', status: 'open', currentToken: 'C-08', waitingCount: 4, estimatedMinutes: 12 }
    ],
    modifiableServicesGu: [
      'આવક અને જાતિ પ્રમાણપત્ર વિતરણ',
      'નોન-ક્રીમીલેયર અને EWS સર્ટીફિકેટ',
      'રેશનકાર્ડમાં નામ ઉમેરો/કમી/સુધારો',
      'ઈ-ધરા ૭/૧૨ અને ૮-અ જમીન હક નોંધણી',
      'આધાર કાર્ડ બાયોમેટ્રિક અને મોબાઈલ અપડેટ',
      'વિધવા સહાય અને દિવ્યાંગ પેન્શન સ્વીકૃતિ'
    ],
    modifiableServicesEn: [
      'Income & Caste Certificate Issuance',
      'Non-Creamy Layer & EWS Certificates',
      'Ration Card Name Addition/Deletion/Update',
      'E-Dhara 7/12 & 8-A Land Records RoR',
      'Aadhaar Biometric & Mobile Linking',
      'Widow Pension & Divyang Welfare Approval'
    ]
  },
  {
    id: 'kacheri-kotda-sangani',
    nameGu: 'જન સેવા કેન્દ્ર • તાલુકા મામલતદાર કચેરી કોટડા સાંગાણી',
    nameEn: 'Jan Seva Kendra • Taluka Mamlatdar Office Kotda Sangani',
    talukaId: 'kotda-sangani',
    talukaNameGu: 'કોટડા સાંગાણી',
    talukaNameEn: 'Kotda Sangani',
    latitude: 22.0298,
    longitude: 70.8841,
    baseCrowdPercentage: 28,
    baseAvgWaitMinutes: 6,
    activeCountersCount: 5,
    servicesAvailable: [
      { nameGu: 'સામાજિક સુરક્ષા & વૃદ્ધ પેન્શન', nameEn: 'Social Security Desk', counterNumber: 1, officerNameGu: 'એમ. કે. રાઠોડ', status: 'open', currentToken: 'K-08', waitingCount: 2, estimatedMinutes: 6 },
      { nameGu: 'પ્રમાણપત્ર વિતરણ (આવક/જાતિ)', nameEn: 'Certificates Desk', counterNumber: 2, officerNameGu: 'ડી. બી. ઝાલા', status: 'open', currentToken: 'K-12', waitingCount: 1, estimatedMinutes: 4 },
      { nameGu: 'રેશન કાર્ડ & અન્ન વિતરણ', nameEn: 'Ration Desk', counterNumber: 3, officerNameGu: 'આર. વી. જોશી', status: 'open', currentToken: 'K-04', waitingCount: 2, estimatedMinutes: 5 },
      { nameGu: 'આધાર બાયોમેટ્રિક & અપડેટ', nameEn: 'Aadhaar Center', counterNumber: 4, officerNameGu: 'પી. કે. પરમાર', status: 'open', currentToken: 'K-09', waitingCount: 3, estimatedMinutes: 8 },
      { nameGu: 'ઈ-ધરા જમીન રેકોર્ડ્સ', nameEn: 'E-Dhara Land Records', counterNumber: 5, officerNameGu: 'વી. એસ. ચૌહાણ', status: 'open', currentToken: 'K-03', waitingCount: 1, estimatedMinutes: 5 }
    ],
    modifiableServicesGu: [
      'આધાર કાર્ડ બાયોમેટ્રિક / મોબાઈલ અપડેટ (રાજ્યવ્યાપી સેવા)',
      'આવક અને જાતિ દાખલા (જો રહેઠાણ સંબંધિત તાલુકામાં હોય)',
      'રેશનકાર્ડ સુધારો',
      'ઈ-ધરા ૭/૧૨ નકલો'
    ],
    modifiableServicesEn: [
      'Aadhaar Biometric/Mobile Update (Anywhere in Gujarat)',
      'Income & Caste Certificate (Local Jurisdiction)',
      'Ration Card Corrections',
      'E-Dhara 7/12 Land Record Copies'
    ]
  },
  {
    id: 'kacheri-jetpur',
    nameGu: 'જન સેવા કેન્દ્ર • તાલુકા મામલતદાર કચેરી જેતપુર',
    nameEn: 'Jan Seva Kendra • Taluka Mamlatdar Office Jetpur',
    talukaId: 'jetpur',
    talukaNameGu: 'જેતપુર',
    talukaNameEn: 'Jetpur',
    latitude: 21.7588,
    longitude: 70.6277,
    baseCrowdPercentage: 45,
    baseAvgWaitMinutes: 12,
    activeCountersCount: 6,
    servicesAvailable: [
      { nameGu: 'સમાજ કલ્યાણ શાખા', nameEn: 'Welfare Desk', counterNumber: 1, officerNameGu: 'એસ. એમ. વ્યાસ', status: 'open', currentToken: 'J-18', waitingCount: 4, estimatedMinutes: 12 },
      { nameGu: 'આવક/જાતિ પ્રમાણપત્રો', nameEn: 'Certificates Desk', counterNumber: 2, officerNameGu: 'એન. કે. પટેલ', status: 'busy', currentToken: 'J-22', waitingCount: 5, estimatedMinutes: 15 },
      { nameGu: 'રેશનકાર્ડ સેવા', nameEn: 'Ration Desk', counterNumber: 3, officerNameGu: 'એચ. જી. પંડ્યા', status: 'open', currentToken: 'J-11', waitingCount: 3, estimatedMinutes: 9 },
      { nameGu: 'ઈ-ધરા કેન્દ્ર ૭/૧૨', nameEn: 'E-Dhara Desk', counterNumber: 4, officerNameGu: 'કે. એલ. ગોહેલ', status: 'open', currentToken: 'J-15', waitingCount: 4, estimatedMinutes: 11 },
      { nameGu: 'આધાર સેવા કેન્દ્ર', nameEn: 'Aadhaar Desk', counterNumber: 5, officerNameGu: 'બી. ટી. સોલંકી', status: 'busy', currentToken: 'J-29', waitingCount: 8, estimatedMinutes: 22 },
      { nameGu: 'સામાન્ય પૂછપરછ', nameEn: 'Inquiry Desk', counterNumber: 6, officerNameGu: 'એમ. જે. વાળા', status: 'open', currentToken: 'J-06', waitingCount: 2, estimatedMinutes: 6 }
    ],
    modifiableServicesGu: [
      'આધાર કાર્ડ નોંધણી અને બાયોમેટ્રિક સુધારણા',
      'જેતપુર તાલુકાના મહેસૂલી દાખલાઓ',
      'રેશનકાર્ડ સેવાઓ'
    ],
    modifiableServicesEn: [
      'Aadhaar Enrolment & Biometric Update',
      'Jetpur Taluka Revenue Certificates',
      'Ration Card Modifications'
    ]
  },
  {
    id: 'kacheri-lodhika',
    nameGu: 'જન સેવા કેન્દ્ર • તાલુકા મામલતદાર કચેરી લોધિકા',
    nameEn: 'Jan Seva Kendra • Taluka Mamlatdar Office Lodhika',
    talukaId: 'lodhika',
    talukaNameGu: 'લોધિકા',
    talukaNameEn: 'Lodhika',
    latitude: 22.1481,
    longitude: 70.7188,
    baseCrowdPercentage: 32,
    baseAvgWaitMinutes: 7,
    activeCountersCount: 5,
    servicesAvailable: [
      { nameGu: 'સામાજિક સુરક્ષા શાખા', nameEn: 'Social Welfare Desk', counterNumber: 1, officerNameGu: 'એમ. જે. ગોહિલ', status: 'open', currentToken: 'L-11', waitingCount: 2, estimatedMinutes: 6 },
      { nameGu: 'જન સેવા દાખલાઓ', nameEn: 'Certificates Desk', counterNumber: 2, officerNameGu: 'કે. પી. પરમાર', status: 'open', currentToken: 'L-14', waitingCount: 1, estimatedMinutes: 4 },
      { nameGu: 'રેશનકાર્ડ & પુરવઠા', nameEn: 'Ration Desk', counterNumber: 3, officerNameGu: 'ડી. વી. મહેતા', status: 'open', currentToken: 'L-08', waitingCount: 2, estimatedMinutes: 5 },
      { nameGu: 'આધાર સુધારણા કાઉન્ટર', nameEn: 'Aadhaar Desk', counterNumber: 4, officerNameGu: 'આર. એન. ચૌધરી', status: 'open', currentToken: 'L-19', waitingCount: 3, estimatedMinutes: 9 },
      { nameGu: 'ઈ-ધરા જમીન મહેસૂલ', nameEn: 'E-Dhara Desk', counterNumber: 5, officerNameGu: 'બી. એલ. ત્રિવેદી', status: 'open', currentToken: 'L-05', waitingCount: 1, estimatedMinutes: 3 }
    ],
    modifiableServicesGu: [
      'આધાર બાયોમેટ્રિક & મોબાઈલ લિંકિંગ',
      'લોધિકા તાલુકા આવક/જાતિ દાખલા',
      'રેશનકાર્ડ સુધારા'
    ],
    modifiableServicesEn: [
      'Aadhaar Biometric & Mobile Linking',
      'Income & Caste Certificate',
      'Ration Card Services'
    ]
  },
  {
    id: 'kacheri-rajkot-west',
    nameGu: 'જન સેવા કેન્દ્ર • મામલતદાર કચેરી રાજકોટ પશ્ચિમ (નાના મવા)',
    nameEn: 'Jan Seva Kendra • Mamlatdar Office Rajkot West (Nana Mava)',
    talukaId: 'rajkot-west',
    talukaNameGu: 'રાજકોટ પશ્ચિમ',
    talukaNameEn: 'Rajkot West',
    latitude: 22.2885,
    longitude: 70.7788,
    baseCrowdPercentage: 62,
    baseAvgWaitMinutes: 14,
    activeCountersCount: 7,
    servicesAvailable: [
      { nameGu: 'જન સેવા દાખલા કાઉન્ટર', nameEn: 'Certificates Desk', counterNumber: 1, officerNameGu: 'એસ. બી. જાડેજા', status: 'busy', currentToken: 'RW-32', waitingCount: 6, estimatedMinutes: 18 },
      { nameGu: 'આધાર સુવિધા કેન્દ્ર', nameEn: 'Aadhaar Center', counterNumber: 2, officerNameGu: 'પી. કે. જોશી', status: 'open', currentToken: 'RW-28', waitingCount: 4, estimatedMinutes: 12 },
      { nameGu: 'રેશનકાર્ડ ડેસ્ક', nameEn: 'Ration Desk', counterNumber: 3, officerNameGu: 'એન. આર. વાઘેલા', status: 'open', currentToken: 'RW-19', waitingCount: 3, estimatedMinutes: 9 },
      { nameGu: 'ઈ-ધરા ૭/૧૨ નકલ', nameEn: 'E-Dhara Desk', counterNumber: 4, officerNameGu: 'એચ. સી. પંડ્યા', status: 'open', currentToken: 'RW-22', waitingCount: 5, estimatedMinutes: 15 }
    ],
    modifiableServicesGu: [
      'આધાર કાર્ડ અપડેટ (રાજ્યવ્યાપી)',
      'રાજકોટ પશ્ચિમ વિસ્તાર પ્રમાણપત્રો',
      'રેશનકાર્ડ નામ સુધારો'
    ],
    modifiableServicesEn: [
      'Aadhaar Card Updates (Statewide)',
      'Rajkot West Revenue Certificates',
      'Ration Card Corrections'
    ]
  },
  {
    id: 'kacheri-rajkot-central',
    nameGu: 'જિલ્લા કલેક્ટર કચેરી • મુખ્ય જન સેવા કેન્દ્ર રાજકોટ',
    nameEn: 'District Collectorate • Main Jan Seva Kendra Rajkot',
    talukaId: 'rajkot',
    talukaNameGu: 'રાજકોટ સિટી',
    talukaNameEn: 'Rajkot City',
    latitude: 22.3039,
    longitude: 70.8022,
    baseCrowdPercentage: 81,
    baseAvgWaitMinutes: 22,
    activeCountersCount: 8,
    servicesAvailable: [
      { nameGu: 'જન સેવા પ્રમાણપત્રો', nameEn: 'Revenue Certificates', counterNumber: 1, officerNameGu: 'એ. એમ. શાહ', status: 'busy', currentToken: 'RC-55', waitingCount: 12, estimatedMinutes: 30 },
      { nameGu: 'આધાર સુપર સેન્ટર', nameEn: 'Aadhaar Super Center', counterNumber: 2, officerNameGu: 'વી. ટી. સોલંકી', status: 'busy', currentToken: 'RC-62', waitingCount: 14, estimatedMinutes: 35 },
      { nameGu: 'પુરવઠા અને રેશન શાખા', nameEn: 'Civil Supplies & Ration', counterNumber: 3, officerNameGu: 'જી. પી. પટેલ', status: 'open', currentToken: 'RC-41', waitingCount: 7, estimatedMinutes: 20 },
      { nameGu: 'ઈ-ધરા અને જમીન મહેસૂલ', nameEn: 'Land Records Desk', counterNumber: 4, officerNameGu: 'કે. કે. ચાવડા', status: 'open', currentToken: 'RC-38', waitingCount: 6, estimatedMinutes: 16 }
    ],
    modifiableServicesGu: [
      'આધાર કાર્ડ નવા અને સુધારા (સાર્વત્રિક)',
      'જિલ્લા કક્ષાની અપીલો અને દાખલાઓ',
      'રેશનકાર્ડ અને પુરવઠા પરવાનગી'
    ],
    modifiableServicesEn: [
      'Aadhaar Enrolment & Update (Universal)',
      'District Level Revenue Appeals',
      'Civil Supplies & NFSA Clearances'
    ]
  },
  {
    id: 'kacheri-dhoraji',
    nameGu: 'જન સેવા કેન્દ્ર • તાલુકા મામલતદાર કચેરી ધોરાજી',
    nameEn: 'Jan Seva Kendra • Taluka Mamlatdar Office Dhoraji',
    talukaId: 'dhoraji',
    talukaNameGu: 'ધોરાજી',
    talukaNameEn: 'Dhoraji',
    latitude: 21.7335,
    longitude: 70.4465,
    baseCrowdPercentage: 35,
    baseAvgWaitMinutes: 8,
    activeCountersCount: 5,
    servicesAvailable: [
      { nameGu: 'પ્રમાણપત્ર શાખા', nameEn: 'Certificates Desk', counterNumber: 1, officerNameGu: 'ડી. આર. મકવાણા', status: 'open', currentToken: 'DH-12', waitingCount: 2, estimatedMinutes: 6 },
      { nameGu: 'આધાર કેન્દ્ર', nameEn: 'Aadhaar Desk', counterNumber: 2, officerNameGu: 'એસ. પી. રાઠોડ', status: 'open', currentToken: 'DH-18', waitingCount: 3, estimatedMinutes: 8 }
    ],
    modifiableServicesGu: ['આધાર કાર્ડ સુધારણા', 'ધોરાજી તાલુકા મહેસૂલી દાખલા'],
    modifiableServicesEn: ['Aadhaar Services', 'Dhoraji Revenue Certificates']
  },
  {
    id: 'kacheri-upleta',
    nameGu: 'જન સેવા કેન્દ્ર • તાલુકા મામલતદાર કચેરી ઉપલેટા',
    nameEn: 'Jan Seva Kendra • Taluka Mamlatdar Office Upleta',
    talukaId: 'upleta',
    talukaNameGu: 'ઉપલેટા',
    talukaNameEn: 'Upleta',
    latitude: 21.7329,
    longitude: 70.2828,
    baseCrowdPercentage: 40,
    baseAvgWaitMinutes: 9,
    activeCountersCount: 5,
    servicesAvailable: [
      { nameGu: 'જન સેવા કાઉન્ટર', nameEn: 'Jan Seva Desk', counterNumber: 1, officerNameGu: 'બી. એમ. વાળા', status: 'open', currentToken: 'UP-15', waitingCount: 2, estimatedMinutes: 6 }
    ],
    modifiableServicesGu: ['આધાર અપડેટ', 'ઉપલેટા તાલુકા દાખલા'],
    modifiableServicesEn: ['Aadhaar Updates', 'Upleta Revenue Certificates']
  },
  {
    id: 'kacheri-jasdan',
    nameGu: 'જન સેવા કેન્દ્ર • તાલુકા મામલતદાર કચેરી જસદણ',
    nameEn: 'Jan Seva Kendra • Taluka Mamlatdar Office Jasdan',
    talukaId: 'jasdan',
    talukaNameGu: 'જસદણ',
    talukaNameEn: 'Jasdan',
    latitude: 22.0326,
    longitude: 71.2057,
    baseCrowdPercentage: 48,
    baseAvgWaitMinutes: 11,
    activeCountersCount: 5,
    servicesAvailable: [
      { nameGu: 'જન સેવા શાખા', nameEn: 'Jan Seva Desk', counterNumber: 1, officerNameGu: 'કે. એન. ઝાલા', status: 'open', currentToken: 'JS-20', waitingCount: 4, estimatedMinutes: 11 }
    ],
    modifiableServicesGu: ['આધાર બાયોમેટ્રિક', 'જસદણ તાલુકા દાખલા'],
    modifiableServicesEn: ['Aadhaar Biometric', 'Jasdan Certificates']
  },
  {
    id: 'kacheri-jamnagar',
    nameGu: 'જન સેવા કેન્દ્ર • લાલબંગલો મામલતદાર કચેરી જામનગર',
    nameEn: 'Jan Seva Kendra • Lalbungalow Mamlatdar Office Jamnagar',
    talukaId: 'jamnagar',
    talukaNameGu: 'જામનગર',
    talukaNameEn: 'Jamnagar',
    latitude: 22.4707,
    longitude: 70.0577,
    baseCrowdPercentage: 68,
    baseAvgWaitMinutes: 16,
    activeCountersCount: 6,
    servicesAvailable: [
      { nameGu: 'પ્રમાણપત્ર વિતરણ', nameEn: 'Certificates Desk', counterNumber: 1, officerNameGu: 'પી. વી. જાડેજા', status: 'busy', currentToken: 'JM-34', waitingCount: 7, estimatedMinutes: 20 },
      { nameGu: 'આધાર સેવા કેન્દ્ર', nameEn: 'Aadhaar Desk', counterNumber: 2, officerNameGu: 'એમ. કે. સોલંકી', status: 'open', currentToken: 'JM-29', waitingCount: 5, estimatedMinutes: 14 }
    ],
    modifiableServicesGu: ['આધાર બાયોમેટ્રિક સુધારણા', 'જામનગર મહેસૂલી સેવાઓ'],
    modifiableServicesEn: ['Aadhaar Services', 'Jamnagar Revenue Services']
  },
  {
    id: 'kacheri-junagadh',
    nameGu: 'જન સેવા કેન્દ્ર • જિલ્લા કલેક્ટર કચેરી જૂનાગઢ',
    nameEn: 'Jan Seva Kendra • Collector Office Junagadh',
    talukaId: 'junagadh',
    talukaNameGu: 'જૂનાગઢ',
    talukaNameEn: 'Junagadh',
    latitude: 21.5222,
    longitude: 70.4579,
    baseCrowdPercentage: 55,
    baseAvgWaitMinutes: 13,
    activeCountersCount: 6,
    servicesAvailable: [
      { nameGu: 'પ્રમાણપત્ર શાખા', nameEn: 'Certificates Desk', counterNumber: 1, officerNameGu: 'આર. બી. ચુડાસમા', status: 'open', currentToken: 'JN-22', waitingCount: 4, estimatedMinutes: 12 }
    ],
    modifiableServicesGu: ['આધાર કાર્ડ સેવા', 'જૂનાગઢ સરકારી દાખલા'],
    modifiableServicesEn: ['Aadhaar Desk', 'Junagadh Certificates']
  },
  {
    id: 'kacheri-ahmedabad-subhash',
    nameGu: 'જિલ્લા કલેક્ટર કચેરી • મુખ્ય જન સેવા કેન્દ્ર, સુભાષ બ્રિજ, અમદાવાદ',
    nameEn: 'District Collectorate • Main Jan Seva Kendra, Subhash Bridge, Ahmedabad',
    talukaId: 'ahmedabad-city',
    talukaNameGu: 'અમદાવાદ સિટી',
    talukaNameEn: 'Ahmedabad City',
    latitude: 23.0558,
    longitude: 72.5835,
    baseCrowdPercentage: 85,
    baseAvgWaitMinutes: 24,
    activeCountersCount: 10,
    servicesAvailable: [
      { nameGu: 'જન સેવા સર્ટિફિકેટ કાઉન્ટર', nameEn: 'Certificates Desk', counterNumber: 1, officerNameGu: 'એચ. કે. પરીખ', status: 'busy', currentToken: 'AH-88', waitingCount: 16, estimatedMinutes: 38 },
      { nameGu: 'આધાર સુપર સેન્ટર', nameEn: 'Aadhaar Desk', counterNumber: 2, officerNameGu: 'એમ. જી. વ્યાસ', status: 'busy', currentToken: 'AH-92', waitingCount: 18, estimatedMinutes: 42 }
    ],
    modifiableServicesGu: ['આધાર બાયોમેટ્રિક & મોબાઈલ (સાર્વત્રિક)', 'અમદાવાદ શહેરી મહેસૂલી દાખલા'],
    modifiableServicesEn: ['Aadhaar Services (Universal)', 'Ahmedabad City Certificates']
  },
  {
    id: 'kacheri-ahmedabad-west',
    nameGu: 'જન સેવા કેન્દ્ર • પશ્ચિમ મામલતદાર કચેરી, વસ્ત્રાપુર, અમદાવાદ',
    nameEn: 'Jan Seva Kendra • West Mamlatdar Office, Vastrapur, Ahmedabad',
    talukaId: 'ahmedabad-west',
    talukaNameGu: 'અમદાવાદ પશ્ચિમ',
    talukaNameEn: 'Ahmedabad West',
    latitude: 23.0384,
    longitude: 72.5120,
    baseCrowdPercentage: 58,
    baseAvgWaitMinutes: 14,
    activeCountersCount: 7,
    servicesAvailable: [
      { nameGu: 'જન સેવા દાખલા', nameEn: 'Certificates Desk', counterNumber: 1, officerNameGu: 'પી. ડી. ઠાકોર', status: 'open', currentToken: 'AW-31', waitingCount: 5, estimatedMinutes: 14 }
    ],
    modifiableServicesGu: ['આધાર કાર્ડ સુધારણા', 'અમદાવાદ પશ્ચિમ પ્રમાણપત્રો'],
    modifiableServicesEn: ['Aadhaar Services', 'Ahmedabad West Certificates']
  },
  {
    id: 'kacheri-gandhinagar',
    nameGu: 'જન સેવા કેન્દ્ર • મામલતદાર કચેરી સેક્ટર ૧૧, ગાંધીનગર',
    nameEn: 'Jan Seva Kendra • Mamlatdar Office Sector 11, Gandhinagar',
    talukaId: 'gandhinagar',
    talukaNameGu: 'ગાંધીનગર',
    talukaNameEn: 'Gandhinagar',
    latitude: 23.2156,
    longitude: 72.6369,
    baseCrowdPercentage: 42,
    baseAvgWaitMinutes: 9,
    activeCountersCount: 6,
    servicesAvailable: [
      { nameGu: 'પ્રમાણપત્ર શાખા', nameEn: 'Certificates Desk', counterNumber: 1, officerNameGu: 'વી. આર. પટેલ', status: 'open', currentToken: 'GN-18', waitingCount: 3, estimatedMinutes: 8 }
    ],
    modifiableServicesGu: ['આધાર સેવા કેન્દ્ર (સાર્વત્રિક)', 'ગાંધીનગર મહેસૂલી સેવાઓ'],
    modifiableServicesEn: ['Aadhaar Center', 'Gandhinagar Revenue Services']
  },
  {
    id: 'kacheri-surat-athwa',
    nameGu: 'જન સેવા કેન્દ્ર • કલેક્ટર કચેરી અઠવાલાઇન્સ, સુરત',
    nameEn: 'Jan Seva Kendra • Collector Office Athwalines, Surat',
    talukaId: 'surat-city',
    talukaNameGu: 'સુરત સિટી',
    talukaNameEn: 'Surat City',
    latitude: 21.1702,
    longitude: 72.8011,
    baseCrowdPercentage: 78,
    baseAvgWaitMinutes: 20,
    activeCountersCount: 9,
    servicesAvailable: [
      { nameGu: 'જન સેવા સર્ટિફિકેટ શાખા', nameEn: 'Certificates Desk', counterNumber: 1, officerNameGu: 'એન. પી. સુરતી', status: 'busy', currentToken: 'SR-70', waitingCount: 14, estimatedMinutes: 32 }
    ],
    modifiableServicesGu: ['આધાર કાર્ડ સુધારણા (સાર્વત્રિક)', 'સુરત શહેર મહેસૂલી દાખલા'],
    modifiableServicesEn: ['Aadhaar Services', 'Surat Revenue Certificates']
  },
  {
    id: 'kacheri-vadodara-kothi',
    nameGu: 'જન સેવા કેન્દ્ર • કોઠી કમ્પાઉન્ડ, વડોદરા',
    nameEn: 'Jan Seva Kendra • Kothi Compound, Vadodara',
    talukaId: 'vadodara-city',
    talukaNameGu: 'વડોદરા સિટી',
    talukaNameEn: 'Vadodara City',
    latitude: 22.3072,
    longitude: 73.1812,
    baseCrowdPercentage: 66,
    baseAvgWaitMinutes: 16,
    activeCountersCount: 7,
    servicesAvailable: [
      { nameGu: 'પ્રમાણપત્ર વિતરણ', nameEn: 'Certificates Desk', counterNumber: 1, officerNameGu: 'એસ. એમ. ગાયકવાડ', status: 'open', currentToken: 'VD-45', waitingCount: 6, estimatedMinutes: 16 }
    ],
    modifiableServicesGu: ['આધાર કાર્ડ બાયોમેટ્રિક', 'વડોદરા મહેસૂલી સેવા'],
    modifiableServicesEn: ['Aadhaar Desk', 'Vadodara Revenue Services']
  }
];

// HAVERSINE ACCURATE DISTANCE IN KM
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = R * c;
  return Math.max(0.2, Math.round(dist * 10) / 10);
}

// DYNAMIC REVERSE GEOCODING WITH GUJARAT PROXIMITY RESOLVER
export async function getLiveReverseGeocodedLocation(lat: number, lon: number): Promise<{
  displayGu: string;
  displayEn: string;
  area: string;
  district: string;
  taluka: string;
}> {
  // 1. Try Nominatim with 3.5s timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=16&addressdetails=1`,
      {
        headers: { 'Accept-Language': 'gu,en' },
        signal: controller.signal
      }
    );
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const area = addr.suburb || addr.neighbourhood || addr.road || addr.village || addr.residential || 'સ્થાનિક પરિસર';
        const city = addr.city || addr.town || addr.county || addr.state_district || 'ગુજરાત';
        const state = addr.state || 'ગુજરાત';
        const displayGu = `${area}, ${city} (${state})`;
        const displayEn = `${area}, ${city} (${state})`;
        return {
          displayGu,
          displayEn,
          area: String(area),
          district: String(city),
          taluka: String(addr.county || city)
        };
      }
    }
  } catch (e) {
    // Graceful fallback to offline Gujarat proximity
  }

  // 2. Intelligent proximity-based Gujarat location resolver
  return getGujaratProximityLocation(lat, lon);
}

export function getGujaratProximityLocation(lat: number, lon: number): {
  displayGu: string;
  displayEn: string;
  area: string;
  district: string;
  taluka: string;
} {
  const centers = [
    { nameGu: 'ગોંડલ ટાઉન / સ્ટેશન રોડ', nameEn: 'Gondal Town / Station Rd', lat: 21.9619, lon: 70.7923, taluka: 'ગોંડલ', district: 'રાજકોટ' },
    { nameGu: 'રાજકોટ નાના મવા / યુનિવર્સિટી રોડ', nameEn: 'Rajkot Nana Mava / University Rd', lat: 22.2885, lon: 70.7788, taluka: 'રાજકોટ પશ્ચિમ', district: 'રાજકોટ' },
    { nameGu: 'રાજકોટ સિટી કલેક્ટર પરિસર', nameEn: 'Rajkot City Collectorate', lat: 22.3039, lon: 70.8022, taluka: 'રાજકોટ સિટી', district: 'રાજકોટ' },
    { nameGu: 'કોટડા સાંગાણી પરિસર', nameEn: 'Kotda Sangani Area', lat: 22.0298, lon: 70.8841, taluka: 'કોટડા સાંગાણી', district: 'રાજકોટ' },
    { nameGu: 'જેતપુર નવાગઢ વિસ્તાર', nameEn: 'Jetpur Navagadh Area', lat: 21.7588, lon: 70.6277, taluka: 'જેતપુર', district: 'રાજકોટ' },
    { nameGu: 'લોધિકા જી.આઈ.ડી.સી. પરિસર', nameEn: 'Lodhika GIDC Area', lat: 22.1481, lon: 70.7188, taluka: 'લોધિકા', district: 'રાજકોટ' },
    { nameGu: 'ધોરાજી શહેર વિસ્તાર', nameEn: 'Dhoraji City Area', lat: 21.7335, lon: 70.4465, taluka: 'ધોરાજી', district: 'રાજકોટ' },
    { nameGu: 'ઉપલેટા ટાઉન પરિસર', nameEn: 'Upleta Town Area', lat: 21.7329, lon: 70.2828, taluka: 'ઉપલેટા', district: 'રાજકોટ' },
    { nameGu: 'જસદણ શહેર વિસ્તાર', nameEn: 'Jasdan City Area', lat: 22.0326, lon: 71.2057, taluka: 'જસદણ', district: 'રાજકોટ' },
    { nameGu: 'જામનગર લાલબંગલો પરિસર', nameEn: 'Jamnagar Lalbungalow Area', lat: 22.4707, lon: 70.0577, taluka: 'જામનગર', district: 'જામનગર' },
    { nameGu: 'જૂનાગઢ ગિરનાર રોડ પરિસર', nameEn: 'Junagadh Girnar Rd Area', lat: 21.5222, lon: 70.4579, taluka: 'જૂનાગઢ', district: 'જૂનાગઢ' },
    { nameGu: 'અમદાવાદ આશ્રમ રોડ / સુભાષ બ્રિજ', nameEn: 'Ahmedabad Ashram Rd / Subhash Bridge', lat: 23.0558, lon: 72.5835, taluka: 'અમદાવાદ સિટી', district: 'અમદાવાદ' },
    { nameGu: 'અમદાવાદ વસ્ત્રાપુર / બોડકદેવ', nameEn: 'Ahmedabad Vastrapur / Bodakdev', lat: 23.0384, lon: 72.5120, taluka: 'અમદાવાદ પશ્ચિમ', district: 'અમદાવાદ' },
    { nameGu: 'ગાંધીનગર સેક્ટર ૧૧ / સચિવાલય', nameEn: 'Gandhinagar Sector 11 / Sachivalaya', lat: 23.2156, lon: 72.6369, taluka: 'ગાંધીનગર', district: 'ગાંધીનગર' },
    { nameGu: 'સુરત અઠવાલાઇન્સ / રીંગ રોડ', nameEn: 'Surat Athwalines / Ring Road', lat: 21.1702, lon: 72.8011, taluka: 'સુરત સિટી', district: 'સુરત' },
    { nameGu: 'વડોદરા કોઠી / રાવપુરા', nameEn: 'Vadodara Kothi / Raopura', lat: 22.3072, lon: 73.1812, taluka: 'વડોદરા સિટી', district: 'વડોદરા' }
  ];

  let closest = centers[0];
  let minDistance = calculateDistanceKm(lat, lon, centers[0].lat, centers[0].lon);

  for (let i = 1; i < centers.length; i++) {
    const d = calculateDistanceKm(lat, lon, centers[i].lat, centers[i].lon);
    if (d < minDistance) {
      minDistance = d;
      closest = centers[i];
    }
  }

  if (minDistance <= 25) {
    return {
      displayGu: `${closest.nameGu}, જિલ્લો: ${closest.district}`,
      displayEn: `${closest.nameEn}, District: ${closest.district}`,
      area: closest.nameGu,
      district: closest.district,
      taluka: closest.taluka
    };
  }

  return {
    displayGu: `અક્ષાંશ: ${lat.toFixed(4)}, રેખાંશ: ${lon.toFixed(4)} (ગુજરાત પરિસર)`,
    displayEn: `Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)} (Gujarat Area)`,
    area: 'ગુજરાત લાઈવ લોકેશન',
    district: closest.district,
    taluka: closest.taluka
  };
}

// DYNAMICALLY COMPUTE TOP 3 NEAREST GOVERNMENT KACHERIS BASED ON USER COORDINATES
export function getDynamicNearbyKacheris(userLat: number, userLon: number): NearbyKacheriInfo[] {
  const computedList: NearbyKacheriInfo[] = GUJARAT_KACHERIS_MASTER.map((item) => {
    const distanceKm = calculateDistanceKm(userLat, userLon, item.latitude, item.longitude);
    // Dynamic travel time: ~2.2 minutes per km in Gujarat road conditions + 3 mins buffer
    const travelMinutes = Math.max(3, Math.round(distanceKm * 2.1 + 3));
    
    return {
      id: item.id,
      nameGu: item.nameGu,
      nameEn: item.nameEn,
      talukaId: item.talukaId,
      talukaNameGu: item.talukaNameGu,
      talukaNameEn: item.talukaNameEn,
      latitude: item.latitude,
      longitude: item.longitude,
      distanceKm,
      travelMinutes,
      crowdPercentage: item.baseCrowdPercentage,
      avgWaitMinutes: item.baseAvgWaitMinutes,
      activeCountersCount: item.activeCountersCount,
      isRecommendedFastest: false,
      servicesAvailable: item.servicesAvailable,
      modifiableServicesGu: item.modifiableServicesGu,
      modifiableServicesEn: item.modifiableServicesEn
    };
  });

  // Sort ascending by distance
  computedList.sort((a, b) => a.distanceKm - b.distanceKm);

  // Take top 3 closest centers
  const top3 = computedList.slice(0, 3);

  // Check if a nearby center (< 15 km) has much lower crowd (< 40%) compared to the closest one
  let fastestIdx = 0;
  if (top3.length > 1 && top3[0].crowdPercentage > 60 && top3[1].crowdPercentage <= 35 && top3[1].distanceKm <= 12) {
    fastestIdx = 1;
    const timeSaved = Math.max(8, top3[0].avgWaitMinutes - top3[1].avgWaitMinutes);
    top3[1].isRecommendedFastest = true;
    top3[1].recommendationReasonGu = `🟢 સ્માર્ટ સૂચન: આ કચેરીમાં માત્ર ${top3[1].crowdPercentage}% ભીડ છે અને કાઉન્ટર ફ્રી છે! જો તમારે આધાર અપડેટ કે સામાન્ય સેવાઓ જોઈતી હોય તો ${top3[0].talukaNameGu} કરતાં ${timeSaved} મિનિટ ઝડપી કામ થશે.`;
    top3[1].recommendationReasonEn = `🟢 Smart Advice: Only ${top3[1].crowdPercentage}% crowd and free counters! For Aadhaar updates or universal services, save ${timeSaved} mins over ${top3[0].talukaNameEn}.`;
  } else {
    top3[0].isRecommendedFastest = true;
    top3[0].recommendationReasonGu = `🟢 તમારા લાઈવ લોકેશનથી સૌથી નજીકનું સત્તાવાર જન સેવા કેન્દ્ર (અંતર: માત્ર ${top3[0].distanceKm} km, મુસાફરી: ${top3[0].travelMinutes} મિનિટ).`;
    top3[0].recommendationReasonEn = `🟢 Closest official Jan Seva Kendra to your live location (Distance: ${top3[0].distanceKm} km, Travel: ${top3[0].travelMinutes} mins).`;
  }

  return top3;
}

// DEFAULT INITIAL STATE
export const NEARBY_KACHERIS_DATA: NearbyKacheriInfo[] = getDynamicNearbyKacheris(21.9619, 70.7923);

export const GOV_DOCUMENT_VERIFICATION_RULES = {
  ration_card: {
    type: 'ration_card',
    nameGu: 'બારકોડેડ રેશનકાર્ડ (NFSA)',
    nameEn: 'Barcoded NFSA Ration Card',
    placeholder: 'RC-NFSA-GJ-10948271',
    statutoryAct: 'ગુજરાત અન્ન સુરક્ષા નિયમો ૨૦૧૭ (નિયમ ૭)',
    ruleDescriptionGu: 'સંયુક્ત કુટુંબ રસોડું અને એક જ ઘરમાં વસવાટ કરતા તમામ સભ્યોનો સમાવેશ ફરજિયાત છે.',
    ruleDescriptionEn: 'Mandatory joint household & residence proof under Gujarat Food Security Rules 2017.',
    eligibleRelations: ['spouse', 'child', 'parent', 'sibling'],
    checkPointsGu: [
      'NFSA ડેટાબેઝમાં કુટુંબના વડાનું નામ સુસંગત હોવું જરૂરી છે.',
      'રેશનકાર્ડમાં નોંધાયેલ સરનામું આધાર સરનામા સાથે મેળ ખાતું હોવું જોઈએ.',
      'દસ્તાવેજની સ્પષ્ટ પીડીએફ અથવા ફોટો અપલોડ કરવો ફરજિયાત છે.'
    ]
  },
  birth_certificate: {
    type: 'birth_certificate',
    nameGu: 'ડિજિટલ જન્મ પ્રમાણપત્ર (Form 5 / CRSR)',
    nameEn: 'Digital Birth Certificate (Form 5)',
    placeholder: 'BC-GONDAL-2015-842',
    statutoryAct: 'જન્મ અને મરણ નોંધણી અધિનિયમ ૧૯૬૯ (કલમ ૧૨/૧૭)',
    ruleDescriptionGu: 'સગીર સંતાનો (૧૮ વર્ષથી નીચે) માટે કાયદેસર જન્મ પ્રમાણપત્ર ફરજિયાત છે.',
    ruleDescriptionEn: 'Mandatory statutory proof for minor children under RBD Act 1969.',
    eligibleRelations: ['child'],
    checkPointsGu: [
      'પંચાયત અથવા નગરપાલિકા રજિસ્ટ્રારની ડિજિટલ સહી હોવી જોઈએ.',
      'માતા-પિતાનું નામ બાળકના જન્મ પ્રમાણપત્રમાં સ્પષ્ટ હોવું જરૂરી છે.'
    ]
  },
  marriage_certificate: {
    type: 'marriage_certificate',
    nameGu: 'લગ્ન નોંધણી પ્રમાણપત્ર (ફોર્મ ૧)',
    nameEn: 'Marriage Registration Certificate (Form 1)',
    placeholder: 'MR-GUJ-2012-004812',
    statutoryAct: 'ગુજરાત લગ્ન નોંધણી અધિનિયમ ૨૦૦૬',
    ruleDescriptionGu: 'પત્ની અથવા પતિને પરિવારમાં ઉમેરવા માટે સત્તાવાર રજિસ્ટ્રારનું લગ્ન સર્ટીફિકેટ.',
    ruleDescriptionEn: 'Statutory certificate for spouse addition under Gujarat Marriage Act 2006.',
    eligibleRelations: ['spouse'],
    checkPointsGu: [
      'ગુજરાત સરકારના લગ્ન રજિસ્ટ્રાર દ્વારા જારી પ્રમાણપત્ર.',
      'બંને પક્ષકારોની આધાર વિગતો સાથે સરખામણી.'
    ]
  },
  aadhaar_family_sheet: {
    type: 'aadhaar_family_sheet',
    nameGu: 'આધાર ફેમિલી સંમતિ પત્ર & બાયોમેટ્રિક',
    nameEn: 'Aadhaar Family Consent & Biometrics',
    placeholder: 'AADH-GUJ-8842',
    statutoryAct: 'આધાર અધિનિયમ ૨૦૧૬ (કલમ ૮ સંમતિ માળખું)',
    ruleDescriptionGu: 'પુખ્ત સભ્યો માટે આધાર લિંકિંગ અને બાયોમેટ્રિક ડિજિટલ સંમતિ.',
    ruleDescriptionEn: 'UIDAI Aadhaar Act Section 8 informed consent framework.',
    eligibleRelations: ['self', 'spouse', 'parent', 'sibling'],
    checkPointsGu: [
      'સભ્ય તરફથી UIDAI OTP અથવા બાયોમેટ્રિક સંમતિ સ્વીકારવામાં આવે છે.',
      'ગોપનીયતા નિયમો હેઠળ ડેટા સુરક્ષિત રાખવામાં આવે છે.'
    ]
  }
};

export const GOV_JURISDICTION_RULES = {
  actNameGu: 'ગુજરાત લોક સેવા હક્ક અધિનિયમ (GRTSA ૨૦૧૩) અને મહેસૂલી નિયમો',
  actNameEn: 'Gujarat Right to Public Services Act (GRTSA 2013) & Revenue Rules',
  coreQuestionGu: 'શું ગોંડલનો નાગરિક અન્ય કોઈપણ તાલુકા કે જિલ્લા માટે લાઈવ ટોકન જનરેટ કરી શકે?',
  coreQuestionEn: 'Can a citizen residing in Gondal generate a token for any other taluka or district in real time?',
  summaryAnswerGu: 'ભાગ્યે જ બધી સેવાઓ માટે શક્ય છે! ગુજરાત સરકારના નિયમ મુજબ સેવાઓને ૨ ભાગમાં વહેંચવામાં આવી છે:',
  summaryAnswerEn: 'It depends strictly on the category of service as defined under Gujarat Government Service Rules:',
  serviceGroups: [
    {
      groupGu: 'કેટેગરી ૧: સાર્વત્રિક / સરનામા-મુક્ત સેવાઓ (Anywhere in Gujarat Services)',
      groupEn: 'Category 1: Universal / Jurisdiction-Free Services',
      allowedAnywhere: true,
      descriptionGu: 'આ સેવાઓ માટે નાગરિક ગોંડલનો હોય તો પણ રાજકોટ, કોટડા સાંગાણી, અમદાવાદ કે સુરતમાં ગમે ત્યાં સ્લોટ બુક કરીને ટોકન લઈ શકે છે. કોઈ તાલુકા બંધન નથી.',
      descriptionEn: 'Citizens can book slots and generate tokens at ANY office across Gujarat regardless of home address.',
      examplesGu: [
        'આધાર કાર્ડ બાયોમેટ્રિક અને મોબાઈલ નંબર અપડેટ (UIDAI / જન સેવા)',
        'RTO સારથી - ડ્રાઇવિંગ લાઇસન્સ ટેસ્ટ સ્લોટ (FaceLess RTO Gujarat)',
        'ઈ-નગર શહેરી સેવાઓ (E-Nagar Urban Portal)',
        'સામાન્ય સરકારી યોજના માહિતી અને પૂછપરછ ડેસ્ક'
      ],
      examplesEn: [
        'Aadhaar Biometric & Mobile Number Update (UIDAI / Jan Seva)',
        'RTO Sarathi Driving License Test Slots (Faceless RTO Gujarat)',
        'E-Nagar Urban Municipal Services',
        'General Scheme Inquiry & Counseling Desks'
      ]
    },
    {
      groupGu: 'કેટેગરી ૨: કાર્યક્ષેત્ર-આધારિત મહેસૂલી સેવાઓ (Jurisdiction-Bound Revenue Services)',
      groupEn: 'Category 2: Jurisdiction-Bound Revenue & Welfare Services',
      allowedAnywhere: false,
      descriptionGu: 'આ સેવાઓ માટે નાગરિક જે તાલુકાનો કાયમી રહીશ હોય (આધાર કાર્ડ મુજબ જ્યાંનું સરનામું હોય) તે જ તાલુકા મામલતદાર કચેરી અથવા જન સેવા કેન્દ્રમાં ટોકન લેવું ફરજિયાત છે. જો અન્ય તાલુકામાં જશે તો તલાટી/મામલતદારની સત્તાક્ષેત્ર ન હોવાથી અરજી કાયદેસર રીતે રદ (Reject) થાય છે.',
      descriptionEn: 'Strictly restricted to the native Taluka Mamlatdar office as per Land Revenue Code & local residency proof.',
      examplesGu: [
        'આવકનો દાખલો (Income Certificate - મામલતદાર કચેરી)',
        'જાતિનો દાખલો (SC/ST/SEBC Caste Certificate)',
        'નોન-ક્રીમીલેયર અને EWS સર્ટીફિકેટ',
        'રેશનકાર્ડમાં સભ્ય ઉમેરવો કે કમી કરવો (NFSA / પુરવઠા કચેરી)',
        'ઈ-ધરા ૭/૧૨ અને ૮-અ જમીન હક નોંધણી (Taluka E-Dhara)',
        'વિધવા સહાય અને દિવ્યાંગ પેન્શન મંજૂરી'
      ],
      examplesEn: [
        'Income Certificate (Taluka Mamlatdar)',
        'Caste Certificate (SC/ST/SEBC)',
        'Non-Creamy Layer & EWS Certificates',
        'Ration Card Family Member Addition/Deletion',
        'E-Dhara 7/12 & 8-A Land Records RoR',
        'Widow Assistance & Divyang Pension Schemes'
      ]
    }
  ]
};
