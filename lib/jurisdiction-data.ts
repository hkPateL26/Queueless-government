export interface ServiceCenterConfig {
  serviceHours: {
    startTime: string; // '10:30'
    endTime: string;   // '18:10'
    displayEn: string;
    displayGu: string;
  };
  lunchBreak: {
    startTime: string; // '13:30'
    endTime: string;   // '14:00'
    displayEn: string;
    displayGu: string;
  };
  workingDays: number[]; // [1, 2, 3, 4, 5, 6]
  defaultCapacityPerHour: number;
  sourceReference: string;
}

export interface CounterDefinition {
  number: number;
  nameGu: string;
  nameEn: string;
  officerName: string;
  services: string[];
  capacityPerHour?: number;
}

export interface ServiceCenter {
  id: string;
  nameGu: string;
  nameEn: string;
  centerType: 'jan_seva_kendra' | 'mamlatdar_office' | 'taluka_seva_sadan' | 'sub_registrar';
  distanceKm: number;
  addressGu: string;
  addressEn: string;
  availabilityNoteGu?: string;
  availabilityNoteEn?: string;
  config: ServiceCenterConfig;
  counters: CounterDefinition[];
}

export interface TalukaOffice {
  id: string;
  nameGu: string;
  nameEn: string;
  officeNameGu: string;
  officeNameEn: string;
  serviceCenters?: ServiceCenter[];
  counters: CounterDefinition[];
}

export interface DistrictItem {
  id: string;
  nameGu: string;
  nameEn: string;
  headquarters: string;
  talukas: TalukaOffice[];
}

// Standard taluka counters helper according to Gujarat Revenue & Jan Seva norms
function createStandardTalukaCounters(talukaNameGu: string, talukaNameEn: string): CounterDefinition[] {
  return [
    { number: 1, nameGu: 'સમાજ કલ્યાણ & પેન્શન', nameEn: 'Social Welfare & Pension', officerName: 'કે. એમ. ત્રિવેદી', services: ['widow', 'pension', 'divyang', 'scholarship', 'welfare'] },
    { number: 2, nameGu: 'જન સેવા પ્રમાણપત્રો (આવક/જાતિ)', nameEn: 'Certificates (Income/Caste)', officerName: 'પી. આર. જાડેજા', services: ['income', 'caste', 'ews', 'cremilayer'] },
    { number: 3, nameGu: 'રેશનકાર્ડ & પુરવઠા સેવા', nameEn: 'Ration Card & Food Supply', officerName: 'એસ. ટી. પટેલ', services: ['ration', 'nfsa', 'bpl'] },
    { number: 4, nameGu: 'ઈ-ધરા કેન્દ્ર (૭/૧૨ & ખેતી)', nameEn: 'E-Dhara (7/12 & Land Records)', officerName: 'વી. કે. મહેતા', services: ['land', '712', '8a', 'ikhedut', 'agriculture'] },
    { number: 5, nameGu: 'આધાર કેન્દ્ર (UIDAI બાયોમેટ્રિક)', nameEn: 'Aadhaar Biometric Center', officerName: 'એ. જે. સોલંકી', services: ['aadhaar', 'biometric', 'update'] },
    { number: 6, nameGu: 'આવાસ યોજના & જનરલ ડેસ્ક', nameEn: 'Housing & General Desk', officerName: 'એન. બી. ચાવડા', services: ['awas', 'housing', 'pmay', 'general'] }
  ];
}

// Helper to construct a TalukaOffice
function createTaluka(
  id: string, 
  nameGu: string, 
  nameEn: string, 
  customCounters?: CounterDefinition[]
): TalukaOffice {
  return {
    id,
    nameGu,
    nameEn,
    officeNameGu: `${nameGu} - જન સેવા કેન્દ્ર • મામલતદાર કચેરી`,
    officeNameEn: `${nameEn} - Jan Seva Kendra • Mamlatdar Office`,
    counters: customCounters || createStandardTalukaCounters(nameGu, nameEn)
  };
}

// ============================================================================
// ALL 33 OFFICIAL DISTRICTS OF GUJARAT & REAL REVENUE TALUKAS
// ============================================================================
export const GUJARAT_33_DISTRICTS: DistrictItem[] = [
  // 1. RAJKOT (રાજકોટ - ૧૪ તાલુકાઓ)
  {
    id: 'rajkot',
    nameGu: 'રાજકોટ',
    nameEn: 'Rajkot',
    headquarters: 'રાજકોટ',
    talukas: [
      createTaluka('gondal', 'ગોંડલ', 'Gondal'),
      createTaluka('rajkot-west', 'રાજકોટ શહેર પશ્ચિમ (નાના મવા)', 'Rajkot City West (Nana Mava)'),
      createTaluka('rajkot-east', 'રાજકોટ શહેર પૂર્વ (આજી)', 'Rajkot City East (Aji)'),
      createTaluka('rajkot-central', 'રાજકોટ સેન્ટ્રલ (કલેક્ટર કચેરી)', 'Rajkot Central (Collectorate)'),
      createTaluka('rajkot-rural', 'રાજકોટ ગ્રામ્ય', 'Rajkot Rural'),
      createTaluka('kotda-sangani', 'કોટડા સાંગાણી', 'Kotda Sangani'),
      createTaluka('jetpur', 'જેતપુર', 'Jetpur'),
      createTaluka('dhoraji', 'ધોરાજી', 'Dhoraji'),
      createTaluka('upleta', 'ઉપલેટા', 'Upleta'),
      createTaluka('lodhika', 'લોધિકા (જીઆઈડીસી)', 'Lodhika (GIDC)'),
      createTaluka('jasdan', 'જસદણ', 'Jasdan'),
      createTaluka('vinchhiya', 'વીંછીયા', 'Vinchhiya'),
      createTaluka('paddhari', 'પડધરી', 'Paddhari'),
      createTaluka('jamkandorna', 'જામકંડોરણા', 'Jamkandorna')
    ]
  },

  // 2. AHMEDABAD (અમદાવાદ - ૧૩ તાલુકાઓ)
  {
    id: 'ahmedabad',
    nameGu: 'અમદાવાદ',
    nameEn: 'Ahmedabad',
    headquarters: 'અમદાવાદ',
    talukas: [
      createTaluka('ahmedabad-city-west', 'અમદાવાદ પશ્ચિમ (ઉસ્માનપુરા)', 'Ahmedabad West (Usmanpura)'),
      createTaluka('ahmedabad-city-east', 'અમદાવાદ પૂર્વ (વસ્ત્રાલ)', 'Ahmedabad East (Vastral)'),
      createTaluka('ahmedabad-city-south', 'અમદાવાદ દક્ષિણ (મણિનગર)', 'Ahmedabad South (Maninagar)'),
      createTaluka('ahmedabad-city-north', 'અમદાવાદ ઉત્તર (ચાંદખેડા)', 'Ahmedabad North (Chandkheda)'),
      createTaluka('daskroi', 'દસ્ક્રોઈ', 'Daskroi'),
      createTaluka('sanand', 'સાણંદ', 'Sanand'),
      createTaluka('dholka', 'ધોળકા', 'Dholka'),
      createTaluka('dhandhuka', 'ધંધુકા', 'Dhandhuka'),
      createTaluka('bavla', 'બાવળા', 'Bavla'),
      createTaluka('viramgam', 'વિરમગામ', 'Viramgam'),
      createTaluka('mandal', 'માંડલ', 'Mandal'),
      createTaluka('detroj', 'દેત્રોજ-રામપુરા', 'Detroj-Rampura'),
      createTaluka('dholera', 'ધોલેરા', 'Dholera')
    ]
  },

  // 3. SURAT (સુરત - ૧૨ તાલુકાઓ)
  {
    id: 'surat',
    nameGu: 'સુરત',
    nameEn: 'Surat',
    headquarters: 'સુરત',
    talukas: [
      createTaluka('surat-city-majura', 'સુરત શહેર (મજૂરા)', 'Surat City (Majura)'),
      createTaluka('surat-city-adajan', 'સુરત શહેર (અડાજણ)', 'Surat City (Adajan)'),
      createTaluka('surat-city-katargam', 'સુરત શહેર (કતારગામ)', 'Surat City (Katargam)'),
      createTaluka('surat-choryasi', 'સુરત ચોર્યાસી', 'Surat Choryasi'),
      createTaluka('olpad', 'ઓલપાડ', 'Olpad'),
      createTaluka('kamrej', 'કામરેજ', 'Kamrej'),
      createTaluka('bardoli', 'બારડોલી', 'Bardoli'),
      createTaluka('palsana', 'પલસાણા', 'Palsana'),
      createTaluka('mandvi-surat', 'માંડવી', 'Mandvi (Surat)'),
      createTaluka('mangrol-surat', 'માંગરોળ', 'Mangrol (Surat)'),
      createTaluka('mahuva-surat', 'મહુવા', 'Mahuva (Surat)'),
      createTaluka('umarpada', 'ઉમરપાડા', 'Umarpada')
    ]
  },

  // 4. VADODARA (વડોદરા - ૧૨ તાલુકાઓ)
  {
    id: 'vadodara',
    nameGu: 'વડોદરા',
    nameEn: 'Vadodara',
    headquarters: 'વડોદરા',
    talukas: [
      createTaluka('vadodara-west', 'વડોદરા પશ્ચિમ (અકોટા)', 'Vadodara West (Akota)'),
      createTaluka('vadodara-east', 'વડોદરા પૂર્વ (વાઘોડિયા રોડ)', 'Vadodara East (Vaghodia Rd)'),
      createTaluka('vadodara-north', 'વડોદરા ઉત્તર (સમા)', 'Vadodara North (Sama)'),
      createTaluka('vadodara-south', 'વડોદરા દક્ષિણ (માંજલપુર)', 'Vadodara South (Manjalpur)'),
      createTaluka('vadodara-rural', 'વડોદરા ગ્રામ્ય', 'Vadodara Rural'),
      createTaluka('padra', 'પાદરા', 'Padra'),
      createTaluka('dabhoi', 'ડભોઈ', 'Dabhoi'),
      createTaluka('karjan', 'કરજણ', 'Karjan'),
      createTaluka('vaghodia', 'વાઘોડિયા', 'Vaghodia'),
      createTaluka('savli', 'સાવલી', 'Savli'),
      createTaluka('desar', 'દેસર', 'Desar'),
      createTaluka('shinor', 'શિનોર', 'Shinor')
    ]
  },

  // 5. GANDHINAGAR (ગાંધીનગર - ૪ તાલુકાઓ)
  {
    id: 'gandhinagar',
    nameGu: 'ગાંધીનગર',
    nameEn: 'Gandhinagar',
    headquarters: 'ગાંધીનગર',
    talukas: [
      createTaluka('gandhinagar-city', 'ગાંધીનગર શહેર (સેક્ટર ૧૧)', 'Gandhinagar City (Sec 11)'),
      createTaluka('kalol', 'કલોલ', 'Kalol'),
      createTaluka('dahegam', 'દહેગામ', 'Dahegam'),
      createTaluka('mansa', 'માણસા', 'Mansa')
    ]
  },

  // 6. BHAVNAGAR (ભાવનગર - ૧૧ તાલુકાઓ)
  {
    id: 'bhavnagar',
    nameGu: 'ભાવનગર',
    nameEn: 'Bhavnagar',
    headquarters: 'ભાવનગર',
    talukas: [
      createTaluka('bhavnagar-city', 'ભાવનગર શહેર', 'Bhavnagar City'),
      createTaluka('bhavnagar-rural', 'ભાવનગર ગ્રામ્ય', 'Bhavnagar Rural'),
      createTaluka('sihor', 'સિહોર', 'Sihor'),
      createTaluka('palitana', 'પાલિતાણા', 'Palitana'),
      createTaluka('talaja', 'તળાજા', 'Talaja'),
      createTaluka('mahuva-bhavnagar', 'મહુવા', 'Mahuva (Bhavnagar)'),
      createTaluka('gariadhar', 'ગારીયાધાર', 'Gariadhar'),
      createTaluka('ghogha', 'ઘોઘા', 'Ghogha'),
      createTaluka('umrala', 'ઉમરાળા', 'Umrala'),
      createTaluka('vallabhipur', 'વલ્લભીપુર', 'Vallabhipur'),
      createTaluka('jesar', 'જેસર', 'Jesar')
    ]
  },

  // 7. JAMNAGAR (જામનગર - ૭ તાલુકાઓ)
  {
    id: 'jamnagar',
    nameGu: 'જામનગર',
    nameEn: 'Jamnagar',
    headquarters: 'જામનગર',
    talukas: [
      createTaluka('jamnagar-city', 'જામનગર શહેર (લાલ બંગલો)', 'Jamnagar City (Lal Bunglow)'),
      createTaluka('jamnagar-rural', 'જામનગર ગ્રામ્ય', 'Jamnagar Rural'),
      createTaluka('lalpur', 'લાલપુર', 'Lalpur'),
      createTaluka('jamjodhpur', 'જામજોધપુર', 'Jamjodhpur'),
      createTaluka('dhrol', 'ધ્રોલ', 'Dhrol'),
      createTaluka('jodiya', 'જોડિયા', 'Jodiya'),
      createTaluka('kalavad', 'કાલાવડ', 'Kalavad')
    ]
  },

  // 8. JUNAGADH (જૂનાગઢ - ૧૦ તાલુકાઓ)
  {
    id: 'junagadh',
    nameGu: 'જૂનાગઢ',
    nameEn: 'Junagadh',
    headquarters: 'જૂનાગઢ',
    talukas: [
      createTaluka('junagadh-city', 'જૂનાગઢ શહેર', 'Junagadh City'),
      createTaluka('junagadh-rural', 'જૂનાગઢ ગ્રામ્ય', 'Junagadh Rural'),
      createTaluka('keshod', 'કેશોદ', 'Keshod'),
      createTaluka('mangrol-junagadh', 'માંગરોળ', 'Mangrol (Junagadh)'),
      createTaluka('manavadar', 'માણાવદર', 'Manavadar'),
      createTaluka('visavadar', 'વિસાવદર', 'Visavadar'),
      createTaluka('malia-hatina', 'માળિયા હાટીના', 'Malia Hatina'),
      createTaluka('vanthali', 'વંથલી', 'Vanthali'),
      createTaluka('mendarda', 'મેંદરડા', 'Mendarda'),
      createTaluka('bhesan', 'ભેસાણ', 'Bhesan')
    ]
  },

  // 9. KUTCH (કચ્છ - ૧૦ તાલુકાઓ)
  {
    id: 'kutch',
    nameGu: 'કચ્છ',
    nameEn: 'Kutch',
    headquarters: 'ભુજ',
    talukas: [
      createTaluka('bhuj', 'ભુજ', 'Bhuj'),
      createTaluka('gandhidham', 'ગાંધીધામ', 'Gandhidham'),
      createTaluka('anjar', 'અંજાર', 'Anjar'),
      createTaluka('mandvi-kutch', 'માંડવી (કચ્છ)', 'Mandvi (Kutch)'),
      createTaluka('mundra', 'મુંદ્રા', 'Mundra'),
      createTaluka('nakhatrana', 'નખત્રાણા', 'Nakhatrana'),
      createTaluka('abdasa', 'અબડાસા', 'Abdasa'),
      createTaluka('lakhpat', 'લખપત', 'Lakhpat'),
      createTaluka('rapar', 'રાપર', 'Rapar'),
      createTaluka('bhachau', 'ભચાઉ', 'Bhachau')
    ]
  },

  // 10. ANAND (આણંદ - ૮ તાલુકાઓ)
  {
    id: 'anand',
    nameGu: 'આણંદ',
    nameEn: 'Anand',
    headquarters: 'આણંદ',
    talukas: [
      createTaluka('anand-city', 'આણંદ', 'Anand'),
      createTaluka('petlad', 'પેટલાદ', 'Petlad'),
      createTaluka('khambhat', 'ખંભાત', 'Khambhat'),
      createTaluka('borsad', 'બોરસદ', 'Borsad'),
      createTaluka('umreth', 'ઉમરેઠ', 'Umreth'),
      createTaluka('anklav', 'આંકલાવ', 'Anklav'),
      createTaluka('sojitra', 'સોજિત્રા', 'Sojitra'),
      createTaluka('tarapur', 'તારાપુર', 'Tarapur')
    ]
  },

  // 11. KHEDA (ખેડા - ૧૦ તાલુકાઓ)
  {
    id: 'kheda',
    nameGu: 'ખેડા',
    nameEn: 'Kheda',
    headquarters: 'નડિયાદ',
    talukas: [
      createTaluka('nadiad', 'નડિયાદ', 'Nadiad'),
      createTaluka('kheda-city', 'ખેડા', 'Kheda'),
      createTaluka('kapadvanj', 'કપડવંજ', 'Kapadvanj'),
      createTaluka('mahudha', 'મહુધા', 'Mahudha'),
      createTaluka('matar', 'માતર', 'Matar'),
      createTaluka('mehmedabad', 'મહેમદાવાદ', 'Mehmedabad'),
      createTaluka('thasra', 'ઠાસરા', 'Thasra'),
      createTaluka('galteshwar', 'ગળતેશ્વર', 'Galteshwar'),
      createTaluka('vaso', 'વસો', 'Vaso'),
      createTaluka('kathlal', 'કઠલાલ', 'Kathlal')
    ]
  },

  // 12. MEHSANA (મહેસાણા - ૧૦ તાલુકાઓ)
  {
    id: 'mehsana',
    nameGu: 'મહેસાણા',
    nameEn: 'Mehsana',
    headquarters: 'મહેસાણા',
    talukas: [
      createTaluka('mehsana-city', 'મહેસાણા', 'Mehsana'),
      createTaluka('kadi', 'કડી', 'Kadi'),
      createTaluka('visnagar', 'વિસનગર', 'Visnagar'),
      createTaluka('vadnagar', 'વડનગર', 'Vadnagar'),
      createTaluka('vijapur', 'વિજાપુર', 'Vijapur'),
      createTaluka('kheralu', 'ખેરાલુ', 'Kheralu'),
      createTaluka('unjha', 'ઊંઝા', 'Unjha'),
      createTaluka('becharaji', 'બેચરાજી', 'Becharaji'),
      createTaluka('satlasana', 'સતલાસણા', 'Satlasana'),
      createTaluka('jotana', 'જોટાણા', 'Jotana')
    ]
  },

  // 13. BANASKANTHA (બનાસકાંઠા - ૧૪ તાલુકાઓ)
  {
    id: 'banaskantha',
    nameGu: 'બનાસકાંઠા',
    nameEn: 'Banaskantha',
    headquarters: 'પાલનપુર',
    talukas: [
      createTaluka('palanpur', 'પાલનપુર', 'Palanpur'),
      createTaluka('deesa', 'ડીસા', 'Deesa'),
      createTaluka('vadgam', 'વડગામ', 'Vadgam'),
      createTaluka('danta', 'દાંતા', 'Danta'),
      createTaluka('amirgadh', 'અમીરગઢ', 'Amirgadh'),
      createTaluka('dantiwada', 'દાંતીવાડા', 'Dantiwada'),
      createTaluka('dhanera', 'ધાનેરા', 'Dhanera'),
      createTaluka('tharad', 'થરાદ', 'Tharad'),
      createTaluka('vav', 'વાવ', 'Vav'),
      createTaluka('suigam', 'સુઈગામ', 'Suigam'),
      createTaluka('bhabhar', 'ભાભર', 'Bhabhar'),
      createTaluka('deodar', 'દિયોદર', 'Deodar'),
      createTaluka('kankrej', 'કાંકરેજ', 'Kankrej'),
      createTaluka('lakhani', 'લાખણી', 'Lakhani')
    ]
  },

  // 14. SABARKANTHA (સાબરકાંઠા - ૮ તાલુકાઓ)
  {
    id: 'sabarkantha',
    nameGu: 'સાબરકાંઠા',
    nameEn: 'Sabarkantha',
    headquarters: 'હિંમતનગર',
    talukas: [
      createTaluka('himatnagar', 'હિંમતનગર', 'Himatnagar'),
      createTaluka('idar', 'ઈડર', 'Idar'),
      createTaluka('prantij', 'પ્રાંતિજ', 'Prantij'),
      createTaluka('talod', 'તલોદ', 'Talod'),
      createTaluka('khedbrahma', 'ખેડબ્રહ્મા', 'Khedbrahma'),
      createTaluka('vadali', 'વડાલી', 'Vadali'),
      createTaluka('vijaynagar', 'વિજયનગર', 'Vijaynagar'),
      createTaluka('poshina', 'પોશીના', 'Poshina')
    ]
  },

  // 15. PATAN (પાટણ - ૯ તાલુકાઓ)
  {
    id: 'patan',
    nameGu: 'પાટણ',
    nameEn: 'Patan',
    headquarters: 'પાટણ',
    talukas: [
      createTaluka('patan-city', 'પાટણ', 'Patan'),
      createTaluka('siddhpur', 'સિદ્ધપુર', 'Siddhpur'),
      createTaluka('chanasma', 'ચાણસ્મા', 'Chanasma'),
      createTaluka('harij', 'હારીજ', 'Harij'),
      createTaluka('radhanpur', 'રાધનપુર', 'Radhanpur'),
      createTaluka('sami', 'સમી', 'Sami'),
      createTaluka('shankheshwar', 'શંખેશ્વર', 'Shankheshwar'),
      createTaluka('santalpur', 'સાંતલપુર', 'Santalpur'),
      createTaluka('saraswati', 'સરસ્વતી', 'Saraswati')
    ]
  },

  // 16. MORBI (મોરબી - ૫ તાલુકાઓ)
  {
    id: 'morbi',
    nameGu: 'મોરબી',
    nameEn: 'Morbi',
    headquarters: 'મોરબી',
    talukas: [
      createTaluka('morbi-city', 'મોરબી', 'Morbi'),
      createTaluka('wankaner', 'વાંકાનેર', 'Wankaner'),
      createTaluka('halvad', 'હળવદ', 'Halvad'),
      createTaluka('tankara', 'ટંકારા', 'Tankara'),
      createTaluka('maliya-miyana', 'માળિયા-મિયાણા', 'Maliya-Miyana')
    ]
  },

  // 17. SURENDRANAGAR (સુરેન્દ્રનગર - ૧૦ તાલુકાઓ)
  {
    id: 'surendranagar',
    nameGu: 'સુરેન્દ્રનગર',
    nameEn: 'Surendranagar',
    headquarters: 'સુરેન્દ્રનગર',
    talukas: [
      createTaluka('wadhwan', 'વઢવાણ', 'Wadhwan'),
      createTaluka('dhrangadhra', 'ધ્રાંગધ્રા', 'Dhrangadhra'),
      createTaluka('dasada-patdi', 'દસાડા-પાટડી', 'Dasada-Patdi'),
      createTaluka('limbdi', 'લીંબડી', 'Limbdi'),
      createTaluka('chotila', 'ચોટીલા', 'Chotila'),
      createTaluka('sayla', 'સાયલા', 'Sayla'),
      createTaluka('muli', 'મૂળી', 'Muli'),
      createTaluka('chuda', 'ચુડા', 'Chuda'),
      createTaluka('thangadh', 'થાનગઢ', 'Thangadh'),
      createTaluka('lakhtar', 'લખતર', 'Lakhtar')
    ]
  },

  // 18. AMRELI (અમરેલી - ૧૧ તાલુકાઓ)
  {
    id: 'amreli',
    nameGu: 'અમરેલી',
    nameEn: 'Amreli',
    headquarters: 'અમરેલી',
    talukas: [
      createTaluka('amreli-city', 'અમરેલી', 'Amreli'),
      createTaluka('babra', ' બાબરા', 'Babra'),
      createTaluka('dhari', 'ધારી', 'Dhari'),
      createTaluka('bagasara', 'બગસરા', 'Bagasara'),
      createTaluka('rajula', 'રાજુલા', 'Rajula'),
      createTaluka('jafrabad', 'જાફરાબાદ', 'Jafrabad'),
      createTaluka('savarkundla', 'સાવરકુંડલા', 'Savarkundla'),
      createTaluka('khambha', 'ખાંભા', 'Khambha'),
      createTaluka('lathi', 'લાઠી', 'Lathi'),
      createTaluka('lilia', 'લીલીયા', 'Lilia'),
      createTaluka('kunkavav-vadia', 'કુંકાવાવ-વાડિયા', 'Kunkavav Vadia')
    ]
  },

  // 19. PORBANDAR (પોરબંદર - ૩ તાલુકાઓ)
  {
    id: 'porbandar',
    nameGu: 'પોરબંદર',
    nameEn: 'Porbandar',
    headquarters: 'પોરબંદર',
    talukas: [
      createTaluka('porbandar-city', 'પોરબંદર', 'Porbandar'),
      createTaluka('ranavav', 'રાણાવાવ', 'Ranavav'),
      createTaluka('kutiyana', 'કુતિયાણા', 'Kutiyana')
    ]
  },

  // 20. DEVBHUMI DWARKA (દેવભૂમિ દ્વારકા - ૪ તાલુકાઓ)
  {
    id: 'devbhumi-dwarka',
    nameGu: 'દેવભૂમિ દ્વારકા',
    nameEn: 'Devbhumi Dwarka',
    headquarters: 'ખંભાળિયા',
    talukas: [
      createTaluka('khambhalia', 'ખંભાળિયા', 'Khambhalia'),
      createTaluka('dwarka-okhamandal', 'દ્વારકા (ઓખામંડળ)', 'Dwarka (Okhamandal)'),
      createTaluka('kalyanpur', 'કલ્યાણપુર', 'Kalyanpur'),
      createTaluka('bhanvad', 'ભાણવડ', 'Bhanvad')
    ]
  },

  // 21. GIR SOMNATH (ગીર સોમનાથ - ૬ તાલુકાઓ)
  {
    id: 'gir-somnath',
    nameGu: 'ગીર સોમનાથ',
    nameEn: 'Gir Somnath',
    headquarters: 'વેરાવળ',
    talukas: [
      createTaluka('veraval-patan', 'વેરાવળ-પાટણ', 'Veraval-Patan'),
      createTaluka('talala', 'તાલાળા', 'Talala'),
      createTaluka('kodinar', 'કોડિનાર', 'Kodinar'),
      createTaluka('sutrapada', 'સુત્રાપાડા', 'Sutrapada'),
      createTaluka('una', 'ઉના', 'Una'),
      createTaluka('gir-gadhada', 'ગીર ગઢડા', 'Gir Gadhada')
    ]
  },

  // 22. BOTAD (બોટાદ - ૪ તાલુકાઓ)
  {
    id: 'botad',
    nameGu: 'બોટાદ',
    nameEn: 'Botad',
    headquarters: 'બોટાદ',
    talukas: [
      createTaluka('botad-city', 'બોટાદ', 'Botad'),
      createTaluka('gadhada', 'ગઢડા', 'Gadhada'),
      createTaluka('barwala', 'બરવાળા', 'Barwala'),
      createTaluka('ranpur', 'રાણપુર', 'Ranpur')
    ]
  },

  // 23. ARAVALLI (અરવલ્લી - ૬ તાલુકાઓ)
  {
    id: 'aravalli',
    nameGu: 'અરવલ્લી',
    nameEn: 'Aravalli',
    headquarters: 'મોડાસા',
    talukas: [
      createTaluka('modasa', 'મોડાસા', 'Modasa'),
      createTaluka('malpur', 'માલપુર', 'Malpur'),
      createTaluka('bayad', 'બાયડ', 'Bayad'),
      createTaluka('dhansura', 'ધનસુરા', 'Dhansura'),
      createTaluka('meghraj', 'મેઘરજ', 'Meghraj'),
      createTaluka('bhiloda', 'ભિલોડા', 'Bhiloda')
    ]
  },

  // 24. PANCHMAHAL (પંચમહાલ - ૭ તાલુકાઓ)
  {
    id: 'panchmahal',
    nameGu: 'પંચમહાલ',
    nameEn: 'Panchmahal',
    headquarters: 'ગોધરા',
    talukas: [
      createTaluka('godhra', 'ગોધરા', 'Godhra'),
      createTaluka('halol', 'હાલોલ', 'Halol'),
      createTaluka('kalol-panchmahal', 'કાલોલ', 'Kalol (Panchmahal)'),
      createTaluka('ghoghamba', 'ઘોઘંબા', 'Ghoghamba'),
      createTaluka('shehera', 'શહેરા', 'Shehera'),
      createTaluka('morva-hadaf', 'મોરવા હડફ', 'Morva Hadaf'),
      createTaluka('jambughoda', 'જાંબુઘોડા', 'Jambughoda')
    ]
  },

  // 25. DAHOD (દાહોદ - ૯ તાલુકાઓ)
  {
    id: 'dahod',
    nameGu: 'દાહોદ',
    nameEn: 'Dahod',
    headquarters: 'દાહોદ',
    talukas: [
      createTaluka('dahod-city', 'દાહોદ', 'Dahod'),
      createTaluka('zalod', 'ઝાલોદ', 'Zalod'),
      createTaluka('limkheda', 'લીમખેડા', 'Limkheda'),
      createTaluka('garbada', 'ગરબાડા', 'Garbada'),
      createTaluka('devgadh-baria', 'દેવગઢ બારિયા', 'Devgadh Baria'),
      createTaluka('fatepura', 'ફતેપુરા', 'Fatepura'),
      createTaluka('dhanpur', 'ધાનપુર', 'Dhanpur'),
      createTaluka('sanjeli', 'સંજેલી', 'Sanjeli'),
      createTaluka('singvad', 'સિંગવડ', 'Singvad')
    ]
  },

  // 26. MAHISAGAR (મહિસાગર - ૬ તાલુકાઓ)
  {
    id: 'mahisagar',
    nameGu: 'મહિસાગર',
    nameEn: 'Mahisagar',
    headquarters: 'લુણાવાડા',
    talukas: [
      createTaluka('lunawada', 'લુણાવાડા', 'Lunawada'),
      createTaluka('santrampur', 'સંતરામપુર', 'Santrampur'),
      createTaluka('kadana', 'કડાણા', 'Kadana'),
      createTaluka('virpur-mahisagar', 'વીરપુર', 'Virpur (Mahisagar)'),
      createTaluka('balasinor', 'બાલાસિનોર', 'Balasinor'),
      createTaluka('khanpur', 'ખાનપુર', 'Khanpur')
    ]
  },

  // 27. CHHOTA UDEPUR (છોટા ઉદેપુર - ૬ તાલુકાઓ)
  {
    id: 'chhota-udepur',
    nameGu: 'છોટા ઉદેપુર',
    nameEn: 'Chhota Udepur',
    headquarters: 'છોટા ઉદેપુર',
    talukas: [
      createTaluka('chhota-udepur-city', 'છોટા ઉદેપુર', 'Chhota Udepur'),
      createTaluka('bodeli', 'બોડેલી', 'Bodeli'),
      createTaluka('sankheda', 'સંખેડા', 'Sankheda'),
      createTaluka('jetpur-pavi', 'જેતપુર પાવી', 'Jetpur Pavi'),
      createTaluka('kavant', 'કવાંટ', 'Kavant'),
      createTaluka('nasvadi', 'નસવાડી', 'Nasvadi')
    ]
  },

  // 28. BHARUCH (ભરૂચ - ૯ તાલુકાઓ)
  {
    id: 'bharuch',
    nameGu: 'ભરૂચ',
    nameEn: 'Bharuch',
    headquarters: 'ભરૂચ',
    talukas: [
      createTaluka('bharuch-city', 'ભરૂચ', 'Bharuch'),
      createTaluka('ankleshwar', 'અંકલેશ્વર', 'Ankleshwar'),
      createTaluka('jambusar', 'જંબુસર', 'Jambusar'),
      createTaluka('amod', 'આમોદ', 'Amod'),
      createTaluka('vagra', 'વાગરા', 'Vagra'),
      createTaluka('hansot', 'હાંસોટ', 'Hansot'),
      createTaluka('zaghadia', 'ઝઘડિયા', 'Zaghadia'),
      createTaluka('valia', 'વાલિયા', 'Valia'),
      createTaluka('netrang', 'નેત્રંગ', 'Netrang')
    ]
  },

  // 29. NARMADA (નર્મદા - ૫ તાલુકાઓ)
  {
    id: 'narmada',
    nameGu: 'નર્મદા',
    nameEn: 'Narmada',
    headquarters: 'રાજપીપળા',
    talukas: [
      createTaluka('rajpipla-nandod', 'નાંદોદ (રાજપીપળા)', 'Nandod (Rajpipla)'),
      createTaluka('dediapada', 'દેડિયાપાડા', 'Dediapada'),
      createTaluka('sagbara', 'સાગબારા', 'Sagbara'),
      createTaluka('tilakwada', 'તિલકવાડા', 'Tilakwada'),
      createTaluka('garudeshwar', 'ગરૂડેશ્વર', 'Garudeshwar')
    ]
  },

  // 30. NAVSARI (નવસારી - ૬ તાલુકાઓ)
  {
    id: 'navsari',
    nameGu: 'નવસારી',
    nameEn: 'Navsari',
    headquarters: 'નવસારી',
    talukas: [
      createTaluka('navsari-city', 'નવસારી', 'Navsari'),
      createTaluka('jalalpore', 'જલાલપોર', 'Jalalpore'),
      createTaluka('gandevi', 'ગણદેવી', 'Gandevi'),
      createTaluka('chikhli', 'ચીખલી', 'Chikhli'),
      createTaluka('vansda', 'વાંસદા', 'Vansda'),
      createTaluka('khergam', 'ખેરગામ', 'Khergam')
    ]
  },

  // 31. VALSAD (વલસાડ - ૬ તાલુકાઓ)
  {
    id: 'valsad',
    nameGu: 'વલસાડ',
    nameEn: 'Valsad',
    headquarters: 'વલસાડ',
    talukas: [
      createTaluka('valsad-city', 'વલસાડ', 'Valsad'),
      createTaluka('pardi', 'પારડી', 'Pardi'),
      createTaluka('vapi', 'વાપી', 'Vapi'),
      createTaluka('umbergaon', 'ઉમરગામ', 'Umbergaon'),
      createTaluka('dharampur', 'ધરમપુર', 'Dharampur'),
      createTaluka('kaprada', 'કપરાડા', 'Kaprada')
    ]
  },

  // 32. DANG (ડાંગ - ૩ તાલુકાઓ)
  {
    id: 'dang',
    nameGu: 'ડાંગ',
    nameEn: 'Dang',
    headquarters: 'આહવા',
    talukas: [
      createTaluka('ahwa', 'આહવા', 'Ahwa'),
      createTaluka('waghai', 'વઘઈ', 'Waghai'),
      createTaluka('subir', 'સુબીર', 'Subir')
    ]
  },

  // 33. TAPI (તાપી - ૭ તાલુકાઓ)
  {
    id: 'tapi',
    nameGu: 'તાપી',
    nameEn: 'Tapi',
    headquarters: 'વ્યારા',
    talukas: [
      createTaluka('vyara', 'વ્યારા', 'Vyara'),
      createTaluka('songadh', 'સોનગઢ', 'Songadh'),
      createTaluka('valod', 'વાલોડ', 'Valod'),
      createTaluka('uchchhal', 'ઉચ્છલ', 'Uchchhal'),
      createTaluka('nizar', 'નિઝર', 'Nizar'),
      createTaluka('dolvan', 'ડોલવણ', 'Dolvan'),
      createTaluka('kukarmunda', 'કુકરમુંડા', 'Kukarmunda')
    ]
  }
];

// Helper to get service centers for a given taluka
export function getTalukaServiceCenters(taluka: TalukaOffice): ServiceCenter[] {
  if (taluka.serviceCenters && taluka.serviceCenters.length > 0) {
    return taluka.serviceCenters;
  }

  const defaultConfig: ServiceCenterConfig = {
    serviceHours: {
      startTime: '10:30',
      endTime: '18:10',
      displayEn: '10:30 AM – 06:10 PM',
      displayGu: '૧૦:૩૦ સવારે – ૦૬:૧૦ સાંજે'
    },
    lunchBreak: {
      startTime: '13:30',
      endTime: '14:00',
      displayEn: '01:30 PM – 02:00 PM',
      displayGu: '૦૧:૩૦ બપોરે – ૦૨:૦૦ બપોરે'
    },
    workingDays: [1, 2, 3, 4, 5, 6],
    defaultCapacityPerHour: 5,
    sourceReference: 'Revenue & Panchayats Department Center Schedule'
  };

  return [
    {
      id: `${taluka.id}-jsk`,
      nameGu: `જન સેવા કેન્દ્ર • ${taluka.nameGu}`,
      nameEn: `Jan Seva Kendra • ${taluka.nameEn}`,
      centerType: 'jan_seva_kendra',
      distanceKm: 8.4,
      addressGu: `તાલુકા પંચાયત કમ્પાઉન્ડ, ${taluka.nameGu}`,
      addressEn: `Taluka Panchayat Compound, ${taluka.nameEn}`,
      availabilityNoteGu: 'સંપૂર્ણ ૩૯ સરકારી સેવાઓ ઉપલબ્ધ',
      availabilityNoteEn: 'Full 39 government services available',
      config: defaultConfig,
      counters: taluka.counters
    },
    {
      id: `${taluka.id}-mamlatdar`,
      nameGu: `મામલતદાર કચેરી / સેવા સદન • ${taluka.nameGu}`,
      nameEn: `Mamlatdar Office / Seva Sadan • ${taluka.nameEn}`,
      centerType: 'mamlatdar_office',
      distanceKm: 10.1,
      addressGu: `કોર્ટ રોડ, સરકારી સેવા સદન, ${taluka.nameGu}`,
      addressEn: `Court Road, Government Seva Sadan, ${taluka.nameEn}`,
      availabilityNoteGu: 'મહેસૂલ & પ્રમાણપત્ર સેવાઓ ઉપલબ્ધ',
      availabilityNoteEn: 'Revenue & Certificate services available',
      config: defaultConfig,
      counters: taluka.counters
    }
  ];
}

// Helper to determine the best counter for a scheme category or keyword
export function getAutoRoutedCounter(schemeId: string, category: string = ''): { counterNumber: number; reasonGu: string; reasonEn: string } {
  const idLower = schemeId.toLowerCase();
  
  if (idLower.includes('712') || idLower.includes('khedut') || idLower.includes('crop') || idLower.includes('farmer') || idLower.includes('gay') || category === 'agriculture') {
    return {
      counterNumber: 4,
      reasonGu: 'ખેતીવાડી અને જમીન રેકોર્ડ્સ માટે ઈ-ધરા કાઉન્ટર ૪ ફાળવેલ છે.',
      reasonEn: 'Auto-routed to E-Dhara Counter 4 for Agriculture & 7/12 Land Records.'
    };
  }

  if (idLower.includes('aadhaar') || idLower.includes('aadhar')) {
    return {
      counterNumber: 5,
      reasonGu: 'આધાર નોંધણી અને બાયોમેટ્રિક માટે કાઉન્ટર ૫ ફાળવેલ છે.',
      reasonEn: 'Auto-routed to Counter 5 for Aadhaar Biometric updates.'
    };
  }

  if (idLower.includes('income') || idLower.includes('caste') || idLower.includes('cert')) {
    return {
      counterNumber: 2,
      reasonGu: 'આવક અને જાતિના સત્તાવાર દાખલા માટે જન સેવા કાઉન્ટર ૨ ફાળવેલ છે.',
      reasonEn: 'Auto-routed to Counter 2 for Revenue Certificates & RTS delivery.'
    };
  }

  if (idLower.includes('ration') || idLower.includes('nfsa') || idLower.includes('poshan')) {
    return {
      counterNumber: 3,
      reasonGu: 'રેશનકાર્ડ અને અન્ન પુરવઠા સેવાઓ માટે કાઉન્ટર ૩ ફાળવેલ છે.',
      reasonEn: 'Auto-routed to Counter 3 for Food & Civil Supplies.'
    };
  }

  if (idLower.includes('awas') || idLower.includes('pmay') || idLower.includes('deendayal') || idLower.includes('ambedkar')) {
    return {
      counterNumber: 6,
      reasonGu: 'પ્રધાનમંત્રી આવાસ અને ગ્રામ વિકાસ માટે કાઉન્ટર ૬ ફાળવેલ છે.',
      reasonEn: 'Auto-routed to Counter 6 for Housing Assistance.'
    };
  }

  // Default to Counter 1 (Welfare, Pension, Scholarships)
  return {
    counterNumber: 1,
    reasonGu: 'સમાજ કલ્યાણ, પેન્શન અને શિષ્યવૃત્તિ માટે કાઉન્ટર ૧ ફાળવેલ છે.',
    reasonEn: 'Auto-routed to Counter 1 for Social Welfare & DBT Pensions.'
  };
}

export function getRecommendedCounter(
  schemeId: string, 
  category: string = '', 
  serviceCenter?: ServiceCenter
): { counterNumber: number; reasonGu: string; reasonEn: string } {
  if (serviceCenter && serviceCenter.counters && serviceCenter.counters.length > 0) {
    const idLower = schemeId.toLowerCase();
    const catLower = category.toLowerCase();
    const matched = serviceCenter.counters.find(c => 
      c.services.some(s => idLower.includes(s) || catLower.includes(s))
    );
    if (matched) {
      return {
        counterNumber: matched.number,
        reasonGu: `${matched.nameGu} માટે કાઉન્ટર ${matched.number} ફાળવેલ છે (${matched.officerName}).`,
        reasonEn: `Routed to Counter ${matched.number} (${matched.nameEn}) based on service center configuration.`
      };
    }
  }

  return getAutoRoutedCounter(schemeId, category);
}

// ============================================================================
// VILLAGE CLUSTER & NEARBY VILLAGE FREE SLOT DATABASE (RURAL RESCUE ENGINE)
// ============================================================================
export interface VillageClusterCenter {
  villageId: string;
  villageNameGu: string;
  villageNameEn: string;
  talukaId: string;
  talukaNameGu: string;
  centerNameGu: string;
  centerNameEn: string;
  distanceKm: number;
  availableSlotsToday: number;
  totalSlotsToday: number;
  crowdLevel: 'low' | 'moderate' | 'full';
  estimatedWaitMins: number;
  isCitizenHomeVillage: boolean;
  recommendedReasonGu?: string;
  recommendedReasonEn?: string;
}

export const VILLAGE_CLUSTERS_DATABASE: Record<string, VillageClusterCenter[]> = {
  // Gomta cluster in Gondal taluka
  gomta: [
    {
      villageId: 'gomta',
      villageNameGu: 'ગોમટા (તમારું ગામ)',
      villageNameEn: 'Gomta (Your Village)',
      talukaId: 'gondal',
      talukaNameGu: 'ગોંડલ',
      centerNameGu: 'ગોમટા ગ્રામ પંચાયત • ઈ-ગ્રામ વિશ્વગ્રામ કેન્દ્ર',
      centerNameEn: 'Gomta Gram Panchayat • E-Gram Center',
      distanceKm: 0.2,
      availableSlotsToday: 1,
      totalSlotsToday: 24,
      crowdLevel: 'full',
      estimatedWaitMins: 38,
      isCitizenHomeVillage: true,
      recommendedReasonGu: '⚠️ આજે ગોમટા કેન્દ્રમાં સ્લોટ લગભગ ફૂલ છે (૮૮% ભીડ).',
      recommendedReasonEn: 'High rush at Gomta center today.'
    },
    {
      villageId: 'moviya',
      villageNameGu: 'મોવીયા',
      villageNameEn: 'Moviya',
      talukaId: 'gondal',
      talukaNameGu: 'ગોંડલ',
      centerNameGu: 'મોવીયા ગ્રામ પંચાયત • ઈ-ગ્રામ જન સુવિધા કેન્દ્ર',
      centerNameEn: 'Moviya Gram Panchayat • E-Gram Kendra',
      distanceKm: 4.2,
      availableSlotsToday: 8,
      totalSlotsToday: 24,
      crowdLevel: 'low',
      estimatedWaitMins: 6,
      isCitizenHomeVillage: false,
      recommendedReasonGu: '🟢 સ્માર્ટ ભલામણ: ગોમટાથી માત્ર ૪.૨ કિમી! આજે ૮ સ્લોટ ખાલી છે અને રાહ જોવાનો સમય માત્ર ૬ મિનિટ છે.',
      recommendedReasonEn: 'Fastest: Just 4.2 km from Gomta with 8 free slots and 6 min wait.'
    },
    {
      villageId: 'shrinathgadh',
      villageNameGu: 'શ્રીનાથગઢ',
      villageNameEn: 'Shrinathgadh',
      talukaId: 'gondal',
      talukaNameGu: 'ગોંડલ',
      centerNameGu: 'શ્રીનાથગઢ ગ્રામ પંચાયત કેન્દ્ર',
      centerNameEn: 'Shrinathgadh Gram Panchayat Center',
      distanceKm: 5.5,
      availableSlotsToday: 11,
      totalSlotsToday: 20,
      crowdLevel: 'low',
      estimatedWaitMins: 4,
      isCitizenHomeVillage: false,
      recommendedReasonGu: '🟢 ત્વરિત સેવા: કતાર વગર તાત્કાલિક પ્રમાણપત્ર વિતરણ ઉપલબ્ધ.',
      recommendedReasonEn: 'Quick service with instant certificate processing.'
    },
    {
      villageId: 'biliyala',
      villageNameGu: 'બીલીયાળા',
      villageNameEn: 'Biliyala',
      talukaId: 'gondal',
      talukaNameGu: 'ગોંડલ',
      centerNameGu: 'બીલીયાળા ગ્રામ પંચાયત • ઈ-ધરા & જન સેવા',
      centerNameEn: 'Biliyala Gram Panchayat E-Gram Desk',
      distanceKm: 6.1,
      availableSlotsToday: 6,
      totalSlotsToday: 20,
      crowdLevel: 'moderate',
      estimatedWaitMins: 10,
      isCitizenHomeVillage: false,
      recommendedReasonGu: 'હાઈવે ટચ કેન્દ્ર, આધાર અને મહેસૂલી દાખલા માટે અનુકૂળ.',
      recommendedReasonEn: 'Highway touch center for convenient access.'
    },
    {
      villageId: 'bhojrajpara',
      villageNameGu: 'ભોજરાજપરા / ગોંડલ સબ-સેન્ટર',
      villageNameEn: 'Bhojrajpara / Gondal Sub-Center',
      talukaId: 'gondal',
      talukaNameGu: 'ગોંડલ',
      centerNameGu: 'ભોજરાજપરા જન સુવિધા કેન્દ્ર',
      centerNameEn: 'Bhojrajpara Jan Suvidha Kendra',
      distanceKm: 7.8,
      availableSlotsToday: 9,
      totalSlotsToday: 25,
      crowdLevel: 'low',
      estimatedWaitMins: 8,
      isCitizenHomeVillage: false,
      recommendedReasonGu: 'ગોંડલ ટાઉન નજીકનું આધુનિક કેન્દ્ર.',
      recommendedReasonEn: 'Modern e-center near Gondal town.'
    },
    {
      villageId: 'kotda-sangani-sub',
      villageNameGu: 'કોટડા સાંગાણી સબ-સેન્ટર',
      villageNameEn: 'Kotda Sangani Sub-Center',
      talukaId: 'kotda-sangani',
      talukaNameGu: 'કોટડા સાંગાણી',
      centerNameGu: 'તાલુકા જન સેવા કેન્દ્ર કોટડા સાંગાણી',
      centerNameEn: 'Jan Seva Kendra Kotda Sangani',
      distanceKm: 9.2,
      availableSlotsToday: 14,
      totalSlotsToday: 30,
      crowdLevel: 'low',
      estimatedWaitMins: 5,
      isCitizenHomeVillage: false,
      recommendedReasonGu: 'માત્ર ૨૮% ભીડ, રાજ્યવ્યાપી આધાર અને સાર્વત્રિક સેવાઓ માટે શ્રેષ્ઠ.',
      recommendedReasonEn: 'Only 28% crowd with 14 available slots.'
    }
  ]
};

export function getNearbyVillageCluster(villageName: string = 'ગોમટા'): VillageClusterCenter[] {
  return VILLAGE_CLUSTERS_DATABASE['gomta'] || [];
}
