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

export const DEFAULT_CITIZEN_PROFILE: CitizenAadhaarProfile = {
  nameGu: 'હરિ પટેલ',
  nameEn: 'Hari Patel',
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
      nameGu: 'હરિ પટેલ',
      nameEn: 'Hari Patel',
      relationGu: 'સ્વયં (મુખ્ય સભ્ય)',
      relationEn: 'Self (Head of Family)',
      relationType: 'self',
      aadhaarMasked: 'XXXX XXXX 8842',
      mobile: '9876543210',
      isSameMobile: true,
      status: 'verified',
      documentProofType: 'aadhaar_family_sheet',
      documentProofNumber: 'AADH-GUJ-8842',
      aiMatchConfidence: 99.8,
      addedAt: '2026-01-10'
    },
    {
      id: 'mem-2',
      nameGu: 'ગીતાબેન પટેલ',
      nameEn: 'Geetaben Patel',
      relationGu: 'પત્ની',
      relationEn: 'Spouse (Wife)',
      relationType: 'spouse',
      aadhaarMasked: 'XXXX XXXX 1294',
      mobile: '9876543210',
      isSameMobile: true,
      status: 'verified',
      documentProofType: 'ration_card',
      documentProofNumber: 'RC-NFSA-GJ-10948271',
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
      aiMatchConfidence: 98.9,
      addedAt: '2026-02-01'
    },
    {
      id: 'mem-4',
      nameGu: 'પરસોત્તમભાઈ પટેલ',
      nameEn: 'Parsottambhai Patel',
      relationGu: 'પિતા (વરિષ્ઠ નાગરિક)',
      relationEn: 'Parent (Father - Senior Citizen)',
      relationType: 'parent',
      aadhaarMasked: 'XXXX XXXX 4410',
      mobile: '9825123456',
      isSameMobile: false,
      status: 'verified',
      documentProofType: 'ration_card',
      documentProofNumber: 'RC-NFSA-GJ-10948271',
      aiMatchConfidence: 97.6,
      addedAt: '2026-02-18'
    }
  ]
};

export const NEARBY_KACHERIS_DATA: NearbyKacheriInfo[] = [
  {
    id: 'kacheri-gondal',
    nameGu: 'જન સેવા કેન્દ્ર • મામલતદાર કચેરી ગોંડલ',
    nameEn: 'Jan Seva Kendra • Mamlatdar Office Gondal',
    talukaId: 'gondal',
    talukaNameGu: 'ગોંડલ',
    talukaNameEn: 'Gondal',
    distanceKm: 1.8,
    travelMinutes: 5,
    crowdPercentage: 75,
    avgWaitMinutes: 18,
    activeCountersCount: 6,
    isRecommendedFastest: false,
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
    distanceKm: 8.4,
    travelMinutes: 14,
    crowdPercentage: 28,
    avgWaitMinutes: 6,
    activeCountersCount: 5,
    isRecommendedFastest: true,
    recommendationReasonGu: '🟢 સ્માર્ટ સૂચન: આ કચેરીમાં માત્ર ૨૮% ભીડ છે અને કાઉન્ટર ફ્રી છે! જો તમારે આધાર અપડેટ કે સામાન્ય સેવાઓ જોઈતી હોય તો ગોંડલ કરતાં ૧૨ મિનિટ ઝડપી કામ થશે.',
    recommendationReasonEn: '🟢 Smart Advice: Only 28% crowd and free counters! For Aadhaar updates or universal services, save 12 mins over Gondal center.',
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
    nameGu: 'જન સેવા કેન્દ્ર • મામલતદાર કચેરી જેતપુર',
    nameEn: 'Jan Seva Kendra • Mamlatdar Office Jetpur',
    talukaId: 'jetpur',
    talukaNameGu: 'જેતપુર',
    talukaNameEn: 'Jetpur',
    distanceKm: 21.2,
    travelMinutes: 26,
    crowdPercentage: 45,
    avgWaitMinutes: 12,
    activeCountersCount: 6,
    isRecommendedFastest: false,
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
  }
];

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
