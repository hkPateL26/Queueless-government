export type SlaType = 
  | 'statutory_grtsa'       // Formally notified under Gujarat Right of Citizens to Public Services Act, 2013
  | 'departmental_norm'     // Published Departmental Citizen Charter norm
  | 'scheme_cycle'          // Periodic DBT release / committee batch cycle / academic year
  | 'varies';               // Processing time varies across offices / field inquiries

export type ProcessingTimeUnit = 'working_days' | 'calendar_days' | 'same_day' | 'varies';

export interface SchemeItem {
  id: string;
  category: 'agriculture' | 'healthcare' | 'education' | 'welfare';
  categoryGu: string;
  categoryEn: string;
  titleGu: string;
  titleEn: string;
  department: string;
  benefit: string;
  benefitGu: string;
  benefitType?: string;
  maxIndicativeBenefit?: string;
  fee: number;
  validityYears?: number;
  eligibilityEn?: string;
  eligibilityGu?: string;
  applicationMethod?: string;
  applicationMethodGu?: string;

  // ⏱️ SERVICE-WISE PROCESSING / DELIVERY TIME FIELDS
  processingTime: string;             // e.g. "7 - 14", "1 - 2", "Same Day", "Varies"
  processingTimeUnit: ProcessingTimeUnit;
  slaType: SlaType;
  officialSource: string;
  lastUpdated: string;
  statutorySlaNoteGu?: string;
  statutorySlaNoteEn?: string;
  appointmentWaitEstimateGu?: string; // Counter appointment duration (~15-20 mins)
  appointmentWaitEstimateEn?: string;

  // Backward compatibility alias
  slaDays?: number;

  requiredDocs: Array<{
    nameGu: string;
    nameEn: string;
    checkType: 'income_expiry_3yr' | 'aadhaar_regex' | 'land_record_712' | 'caste_cert' | 'marksheet' | 'generic';
    required: boolean;
    hintGu?: string;
  }>;
  validationRuleDesc: string;
}

export const getSchemeOfficialSource = (scheme: SchemeItem): { source: string; lastUpdated: string; isReferenceOnly: boolean } => {
  return {
    source: scheme.officialSource || `${scheme.department} • Department Guidelines`,
    lastUpdated: scheme.lastUpdated || '2026',
    isReferenceOnly: true,
  };
};

export const getSchemeEligibility = (scheme: SchemeItem): { en: string; gu: string } => {
  return {
    en: scheme.eligibilityEn || 'Gujarat resident citizens meeting departmental income and category guidelines.',
    gu: scheme.eligibilityGu || 'ગુજરાતના કાયમી રહેવાસી અને સંબંધિત વિભાગના આવક/વર્ગ માપદંડ ધરાવતા નાગરિકો.',
  };
};

export const getSchemeStructuredBenefit = (scheme: SchemeItem): { headlineEn: string; headlineGu: string; detailEn: string; detailGu: string } => {
  return {
    headlineEn: scheme.benefitType || 'Benefit: Indicative subsidy / service (amount depends on applicable category/rules)',
    headlineGu: 'યોજના લાભ: સરકારી સહાય / સબસિડી (નિયમાનુસાર પાત્રતા આધારે)',
    detailEn: scheme.benefit,
    detailGu: scheme.benefitGu,
  };
};

export const getProcessingTimelineInfo = (scheme: SchemeItem) => {
  const isVaries = scheme.processingTimeUnit === 'varies' || scheme.processingTime.toLowerCase().includes('varies');
  
  let formattedTimeEn = '';
  let formattedTimeGu = '';

  if (isVaries) {
    formattedTimeEn = 'Processing time varies — confirm with the concerned office';
    formattedTimeGu = 'પ્રક્રિયા સમય અલગ હોઈ શકે છે — સંબંધિત કચેરી ખાતે ચકાસો';
  } else if (scheme.processingTimeUnit === 'same_day') {
    formattedTimeEn = 'Same Day / Immediate (Subject to counter/server availability)';
    formattedTimeGu = 'તે જ દિવસે / તાત્કાલિક (કાઉન્ટર અને સર્વર ઉપલબ્ધતા મુજબ)';
  } else if (scheme.processingTimeUnit === 'working_days') {
    formattedTimeEn = `${scheme.processingTime} Working Days`;
    formattedTimeGu = `${scheme.processingTime} કાર્યકારી દિવસ`;
  } else {
    formattedTimeEn = `${scheme.processingTime} Days`;
    formattedTimeGu = `${scheme.processingTime} દિવસ`;
  }

  let slaBadgeEn = '';
  let slaBadgeGu = '';
  if (scheme.slaType === 'statutory_grtsa') {
    slaBadgeEn = 'Statutory Public Service (GRTSA 2013 Notified)';
    slaBadgeGu = 'અધિસૂચિત જાહેર સેવા (GRTSA ૨૦૧૩ કાનૂની સમયમર્યાદા)';
  } else if (scheme.slaType === 'departmental_norm') {
    slaBadgeEn = 'Departmental Citizen Charter Standard';
    slaBadgeGu = 'વિભાગીય સિટીઝન ચાર્ટર ધોરણ';
  } else if (scheme.slaType === 'scheme_cycle') {
    slaBadgeEn = 'Batch / DBT Scheme Cycle';
    slaBadgeGu = 'બેચ / ડીબીટી મંજૂરી ચક્ર';
  }

  return {
    isVaries,
    formattedTimeEn,
    formattedTimeGu,
    slaBadgeEn,
    slaBadgeGu,
    statutoryNoteEn: scheme.statutorySlaNoteEn,
    statutoryNoteGu: scheme.statutorySlaNoteGu,
    appointmentWaitEstimateEn: scheme.appointmentWaitEstimateEn || 'Counter visit waiting time: ~15-20 min',
    appointmentWaitEstimateGu: scheme.appointmentWaitEstimateGu || 'કાઉન્ટર મુલાકાત પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    officialSource: scheme.officialSource,
    lastUpdated: scheme.lastUpdated || '2025-2026',
    feeTextEn: scheme.fee === 0 ? 'Free (₹0)' : `₹${scheme.fee} (Nominal service fee)`,
    feeTextGu: scheme.fee === 0 ? 'મફત (₹૦)' : `₹${scheme.fee} (નિયત સેવા ફી)`
  };
};


export const ALL_YOJANAS: SchemeItem[] = [
  // 🌾 1. AGRICULTURE & FARMING (12 SCHEMES)
  {
    id: 'ikhedut-subsidy-schemes',
    category: 'agriculture',
    categoryGu: 'ખેતીવાડી',
    categoryEn: 'Agriculture & Farming',
    titleGu: 'i-Khedut સબસિડી યોજનાઓ (ટ્રેક્ટર, સાધનો અને સિંચાઈ કિટ્સ)',
    titleEn: 'i-Khedut Subsidy Schemes (Tractors, Tools & Irrigation Kits)',
    department: 'કૃષિ અને ખેડૂત કલ્યાણ વિભાગ',
    benefit: 'Comprehensive single-window portal subsidies for farm machinery, implements and irrigation',
    benefitGu: 'ખેતી યંત્રો, ઓજારો, પાઈપલાઈન અને સિંચાઈ સાધનો માટે સંકલિત સબસિડી પોર્ટલ',
    slaDays: 7,
    fee: 30,
    processingTime: 'Varies',
    processingTimeUnit: 'varies',
    slaType: 'scheme_cycle',
    officialSource: 'i-Khedut Portal (ikhedut.gujarat.gov.in) • કૃષિ અને ખેડૂત કલ્યાણ વિભાગ',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'પોર્ટલ વિન્ડો અને જિલ્લા ક્વોટા અનુસાર બેચ મંજૂરી',
    statutorySlaNoteEn: 'Batch sanction subject to open portal window and district quota',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: '૭/૧૨ અને ૮-અ જમીનની નકલ', nameEn: '7/12 & 8-A Land Record', checkType: 'land_record_712', required: true },
      { nameGu: 'આધાર કાર્ડ', nameEn: 'Aadhaar Card', checkType: 'aadhaar_regex', required: true },
      { nameGu: 'બેંક પાસબુક / રદ કરેલ ચેક', nameEn: 'Bank Passbook / Cancelled Cheque', checkType: 'generic', required: true }
    ],
    validationRuleDesc: 'i-Khedut પોર્ટલ નોંધણી અને 7/12 ખાતા વેરિફિકેશન'
  },
  {
    id: 'ikhedut-tractor',
    category: 'agriculture',
    categoryGu: 'ખેતીવાડી',
    categoryEn: 'Agriculture & Farming',
    titleGu: 'i-Khedut ટ્રેક્ટર સહાય યોજના',
    titleEn: 'i-Khedut Tractor Assistance Scheme',
    department: 'કૃષિ અને ખેડૂત કલ્યાણ વિભાગ',
    benefit: 'Subsidy up to ₹45,000 to ₹60,000 on new tractor purchase',
    benefitGu: 'નવા ટ્રેક્ટરની ખરીદી પર ₹૪૫,૦૦૦ થી ₹૬૦,૦૦૦ સુધીની સરકારી સબસિડી',
    slaDays: 7,
    fee: 50,
    processingTime: 'Varies',
    processingTimeUnit: 'varies',
    slaType: 'scheme_cycle',
    officialSource: 'i-Khedut Portal (ikhedut.gujarat.gov.in) • Directorate of Agriculture, Gujarat',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'પૂર્વ-મંજૂરી લિસ્ટ અને ખરીદી ચકાસણી બાદ ડીબીટી ચુકવણી',
    statutorySlaNoteEn: 'Pre-sanction draw followed by dealer invoice verification and DBT',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: '૭/૧૨ અને ૮-અ જમીનની નકલ', nameEn: '7/12 & 8-A Land Record', checkType: 'land_record_712', required: true },
      { nameGu: 'આધાર કાર્ડ', nameEn: 'Aadhaar Card', checkType: 'aadhaar_regex', required: true },
      { nameGu: 'બેંક પાસબુક / રદ કરેલ ચેક', nameEn: 'Bank Passbook / Cancelled Cheque', checkType: 'generic', required: true },
      { nameGu: 'જાતિનો દાખલો (SC/ST ખેડૂતો માટે)', nameEn: 'Caste Certificate (For SC/ST)', checkType: 'caste_cert', required: false }
    ],
    validationRuleDesc: '7/12 જમીન ખાતા નંબર અને આધાર કાર્ડ નામ મેળવણી ચકાસણી'
  },
  {
    id: 'ikhedut-tools',
    category: 'agriculture',
    categoryGu: 'ખેતીવાડી',
    categoryEn: 'Agriculture & Farming',
    titleGu: 'i-Khedut ખેતી સાધનો/ઓજારો સહાય',
    titleEn: 'i-Khedut Tools & Implements Assistance',
    department: 'કૃષિ અને ખેડૂત કલ્યાણ વિભાગ',
    benefit: 'Subsidy up to 50% on rotavator, thresher, cultivators',
    benefitGu: 'રોટાવેટર, થ્રેશર અને પ્લાઉની ખરીદી પર ૫૦% સુધીની સબસિડી',
    slaDays: 5,
    fee: 30,
    processingTime: 'Varies',
    processingTimeUnit: 'varies',
    slaType: 'scheme_cycle',
    officialSource: 'i-Khedut Portal (ikhedut.gujarat.gov.in) • કૃષિ વિભાગ',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'સાધનો ભૌતિક ચકાસણી અને જિલ્લા લક્ષ્યાંક આધીન',
    statutorySlaNoteEn: 'Physical implement verification and district target allocation',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: '૭/૧૨ અને ૮-અ નકલ', nameEn: '7/12 & 8-A Land Record', checkType: 'land_record_712', required: true },
      { nameGu: 'આધાર કાર્ડ', nameEn: 'Aadhaar Card', checkType: 'aadhaar_regex', required: true },
      { nameGu: 'ઓથોરાઇઝ્ડ ડીલરનું ક્વોટેશન', nameEn: 'Authorized Dealer Quotation', checkType: 'generic', required: true }
    ],
    validationRuleDesc: 'ઓજારોની માન્યતા અને ખેડૂત ખાતા વેરિફિકેશન'
  },
  {
    id: 'ikhedut-drip',
    category: 'agriculture',
    categoryGu: 'ખેતીવાડી',
    categoryEn: 'Agriculture & Farming',
    titleGu: 'i-Khedut ડ્રીપ ઈરીગેશન / ટપક સિંચાઈ સહાય',
    titleEn: 'i-Khedut Irrigation / Drip Irrigation Assistance',
    department: 'GGRC & કૃષિ વિભાગ',
    benefit: '70% to 85% financial assistance on micro irrigation kits',
    benefitGu: 'ટપક/ફુવારા પદ્ધતિ માટે ૭૦% થી ૮૫% સુધીનું આર્થિક અનુદાન (GGRC)',
    slaDays: 7,
    fee: 50,
    processingTime: 'Varies',
    processingTimeUnit: 'varies',
    slaType: 'scheme_cycle',
    officialSource: 'Gujarat Green Revolution Company (ggrc.co.in) & કૃષિ વિભાગ',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'GGRC સર્વે અને ત્રિપક્ષીય કરાર બાદ સબસિડી ચુકવણી',
    statutorySlaNoteEn: 'Field survey by GGRC, tripartite agreement and installation sign-off',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: '૭/૧૨, ૮-અ અને ૧૬ નંબર ફોર્મ', nameEn: '7/12 & 8-A Land Record', checkType: 'land_record_712', required: true },
      { nameGu: 'વીજ બિલ / બોરવેલ દાખલો', nameEn: 'Electricity Bill / Water Source Proof', checkType: 'generic', required: true },
      { nameGu: 'આધાર કાર્ડ', nameEn: 'Aadhaar Card', checkType: 'aadhaar_regex', required: true }
    ],
    validationRuleDesc: 'પાણીનો સ્ત્રોત અને જમીન માપણી વિસ્તાર વેલિડેશન'
  },
  {
    id: 'ikhedut-tarpaulin',
    category: 'agriculture',
    categoryGu: 'ખેતીવાડી',
    categoryEn: 'Agriculture & Farming',
    titleGu: 'i-Khedut તાડપત્રી સહાય યોજના',
    titleEn: 'i-Khedut Tarpaulin Assistance Scheme',
    department: 'કૃષિ અને ખેડૂત કલ્યાણ વિભાગ',
    benefit: '50% to 75% subsidy on purchasing protective tarpaulin sheets',
    benefitGu: 'પાક સંરક્ષણ તાડપત્રી ખરીદી પર ૫૦% થી ૭૫% સહાય (મહત્તમ ૨ નંગ)',
    slaDays: 3,
    fee: 20,
    processingTime: 'Varies',
    processingTimeUnit: 'varies',
    slaType: 'scheme_cycle',
    officialSource: 'i-Khedut Portal (ikhedut.gujarat.gov.in) • કૃષિ અને ખેડૂત કલ્યાણ વિભાગ',
    lastUpdated: '2025-2026',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: '૭/૧૨ નકલ', nameEn: '7/12 Land Record', checkType: 'land_record_712', required: true },
      { nameGu: 'આધાર કાર્ડ', nameEn: 'Aadhaar Card', checkType: 'aadhaar_regex', required: true },
      { nameGu: 'બેંક પાસબુક', nameEn: 'Bank Passbook', checkType: 'generic', required: true }
    ],
    validationRuleDesc: 'ખાતા દીઠ મહત્તમ ૨ તાડપત્રી લિમિટ ચેક'
  },
  {
    id: 'ikhedut-seeds',
    category: 'agriculture',
    categoryGu: 'ખેતીવાડી',
    categoryEn: 'Agriculture & Farming',
    titleGu: 'i-Khedut પ્રમાણિત બિયારણ સહાય યોજના',
    titleEn: 'i-Khedut Certified Seed Assistance',
    department: 'કૃષિ અને સહકાર વિભાગ',
    benefit: 'Subsidized certified seeds for Groundnut, Cotton, Wheat, Pulses',
    benefitGu: 'મગફળી, કપાસ અને ઘઉંના પ્રમાણિત બિયારણની ખરીદી પર સબસિડી',
    slaDays: 3,
    fee: 20,
    processingTime: 'Varies',
    processingTimeUnit: 'varies',
    slaType: 'scheme_cycle',
    officialSource: 'Gujarat State Seed Corporation (gssc.gujarat.gov.in) & i-Khedut',
    lastUpdated: '2025-2026',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: '૭/૧૨ અને ૮-અ નકલ', nameEn: '7/12 Land Record', checkType: 'land_record_712', required: true },
      { nameGu: 'આધાર કાર્ડ', nameEn: 'Aadhaar Card', checkType: 'aadhaar_regex', required: true },
      { nameGu: 'માન્ય જીએસટી બિયારણ બિલ', nameEn: 'Certified Seed GST Bill', checkType: 'generic', required: true }
    ],
    validationRuleDesc: 'માન્ય બિયારણ વેચાણ કેન્દ્ર જીએસટી બિલ ચકાસણી'
  },
  {
    id: 'crop-storage-godown',
    category: 'agriculture',
    categoryGu: 'ખેતીવાડી',
    categoryEn: 'Agriculture & Farming',
    titleGu: 'પાક સંગ્રહ સ્ટ્રક્ચર / ગોડાઉન સહાય',
    titleEn: 'Crop Storage / Godown Assistance Scheme',
    department: 'કૃષિ અને ખેડૂત કલ્યાણ વિભાગ',
    benefit: 'Up to ₹50,000 or 50% subsidy for on-farm crop storage structure',
    benefitGu: 'ખેતરમાં પાક સંગ્રહ ગોડાઉન બનાવવા માટે ₹૫૦,૦૦૦ સુધીની સહાય',
    slaDays: 10,
    fee: 50,
    processingTime: 'Varies',
    processingTimeUnit: 'varies',
    slaType: 'scheme_cycle',
    officialSource: 'i-Khedut Portal (ikhedut.gujarat.gov.in) • કૃષિ વિભાગ',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'બાંધકામ પૂર્ણતા અને સ્ટેજ ચકાસણી બાદ ૨ હપ્તામાં સબસિડી',
    statutorySlaNoteEn: 'Staged construction verification and phased DBT disbursement',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: '૭/૧૨, ૮-અ જમીન નકલ', nameEn: '7/12 & 8-A Land Record', checkType: 'land_record_712', required: true },
      { nameGu: 'આધાર કાર્ડ', nameEn: 'Aadhaar Card', checkType: 'aadhaar_regex', required: true },
      { nameGu: 'ખેતરનો નકશો અને જીઓ-ટેગ ફોટો', nameEn: 'Plot Map & Geo-tagged Photo', checkType: 'generic', required: true }
    ],
    validationRuleDesc: 'જીઓ-ટેગ નકશો અને સ્થળ નિરીક્ષણ વેલિડેશન'
  },
  {
    id: 'pm-kisan',
    category: 'agriculture',
    categoryGu: 'ખેતીવાડી',
    categoryEn: 'Agriculture & Farming',
    titleGu: 'PM-KISAN સન્માન નિધિ યોજના',
    titleEn: 'PM-KISAN Samman Nidhi Yojana',
    department: 'કૃષિ મંત્રાલય (ભારત સરકાર)',
    benefit: '₹6,000 per year direct cash transfer in 3 equal installments',
    benefitGu: 'વાર્ષિક ₹૬,૦૦૦ ની સીધી ખાતામાં સહાય (₹૨,૦૦૦ ના ૩ હપ્તા)',
    slaDays: 3,
    fee: 30,
    processingTime: 'Varies',
    processingTimeUnit: 'varies',
    slaType: 'scheme_cycle',
    officialSource: 'Ministry of Agriculture & Farmers Welfare, GoI (pmkisan.gov.in)',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'ત્રિમાસિક હપ્તા ચક્ર (રૂ. ૨,૦૦૦ પ્રતિ હપ્તો)',
    statutorySlaNoteEn: 'Four-monthly national installment cycle (₹2,000 per trimester)',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: '૭/૧૨ જમીનની નકલ (RoR)', nameEn: 'Land RoR / 7/12', checkType: 'land_record_712', required: true },
      { nameGu: 'આધાર કાર્ડ (મોબાઈલ લિંક્ડ)', nameEn: 'Aadhaar Card (Mobile Linked)', checkType: 'aadhaar_regex', required: true },
      { nameGu: 'NPCI DBT લિંક્ડ બેંક પાસબુક', nameEn: 'NPCI / DBT Linked Bank Passbook', checkType: 'generic', required: true }
    ],
    validationRuleDesc: 'e-KYC અને આધાર સીડેડ બેંક એકાઉન્ટ ઓટો-ચેક'
  },
  {
    id: 'mksy-crop-loss',
    category: 'agriculture',
    categoryGu: 'ખેતીવાડી',
    categoryEn: 'Agriculture & Farming',
    titleGu: 'મુખ્યમંત્રી કિસાન સહાય યોજના (MKSY)',
    titleEn: 'Mukhyamantri Kisan Sahay Yojana',
    department: 'મહેસૂલ અને કૃષિ વિભાગ',
    benefit: 'Zero-premium crop compensation for drought, flood or unseasonal rain',
    benefitGu: 'અતિવૃષ્ટિ કે કમોસમી વરસાદમાં હેક્ટર દીઠ ₹૨૫,૦૦૦ સુધી નુકસાન વળતર',
    slaDays: 7,
    fee: 20,
    processingTime: 'Varies',
    processingTimeUnit: 'varies',
    slaType: 'scheme_cycle',
    officialSource: 'મહેસૂલ અને કૃષિ વિભાગ, ગુજરાત સરકાર',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'કુદરતી આપત્તિ જાહેર થવા અને સર્વે રિપોર્ટ આધારે',
    statutorySlaNoteEn: 'Triggered during notified natural calamities following district survey',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: '૭/૧૨ અને ૮-અ નકલ', nameEn: '7/12 & 8-A Land Record', checkType: 'land_record_712', required: true },
      { nameGu: 'તલાટીનો વાવેતર દાખલો', nameEn: 'Talati Sowing Certificate', checkType: 'generic', required: true },
      { nameGu: 'આધાર કાર્ડ', nameEn: 'Aadhaar Card', checkType: 'aadhaar_regex', required: true }
    ],
    validationRuleDesc: 'વાવેતર પાક અને સર્વે નંબર નુકસાની ટકાવારી ગણતરી'
  },
  {
    id: 'deshi-gay-sahay',
    category: 'agriculture',
    categoryGu: 'ખેતીવાડી',
    categoryEn: 'Agriculture & Farming',
    titleGu: 'દેશી ગાય નિભાવ ખર્ચ સહાય યોજના',
    titleEn: 'Deshi Gay Nibhav Kharch Sahay Yojana',
    department: 'કૃષિ અને પ્રાકૃતિક કૃષિ બોર્ડ',
    benefit: '₹900 per month (₹10,800/yr) for natural cow-based organic farming',
    benefitGu: 'એક દેશી ગાય દીઠ દર મહિને ₹૯૦૦ (વાર્ષિક ₹૧૦,૮૦૦) નિભાવ સહાય',
    slaDays: 5,
    fee: 30,
    processingTime: 'Varies',
    processingTimeUnit: 'varies',
    slaType: 'scheme_cycle',
    officialSource: 'ગુજરાત પ્રાકૃતિક કૃષિ વિકાસ બોર્ડ & i-Khedut',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'ટેગ ચકાસણી બાદ ત્રિમાસિક રૂ. ૨,૭૦૦ ડીબીટી ચુકવણી',
    statutorySlaNoteEn: 'Quarterly ₹2,700 DBT maintenance upon cattle tag verification',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: '૭/૧૨ જમીન નકલ', nameEn: '7/12 Land Record', checkType: 'land_record_712', required: true },
      { nameGu: 'ગાયનો કાનનો ટેગ નંબર (INAF)', nameEn: 'Cow Ear Tag ID (INAF)', checkType: 'generic', required: true },
      { nameGu: 'પ્રાકૃતિક ખેતી તાલીમ પ્રમાણપત્ર', nameEn: 'Natural Farming Certificate', checkType: 'generic', required: true },
      { nameGu: 'આધાર કાર્ડ અને બેંક પાસબુક', nameEn: 'Aadhaar & Bank Passbook', checkType: 'aadhaar_regex', required: true }
    ],
    validationRuleDesc: '૧૨-ડિજિટ પશુ ટેગ આઈડી અને પ્રાકૃતિક ખેતી પ્રમાણપત્ર વેરિફિકેશન'
  },
  {
    id: 'smartphone-sahay',
    category: 'agriculture',
    categoryGu: 'ખેતીવાડી',
    categoryEn: 'Agriculture & Farming',
    titleGu: 'ખેડૂત સ્માર્ટફોન સહાય યોજના',
    titleEn: 'Smartphone Sahay Yojana for Farmers',
    department: 'કૃષિ અને ખેડૂત કલ્યાણ વિભાગ',
    benefit: '40% cost subsidy or up to ₹6,000 for purchasing smartphone',
    benefitGu: 'ખેતી માહિતી માટે સ્માર્ટફોન ખરીદી પર ૪૦% અથવા ₹૬,૦૦૦ સુધી સહાય',
    slaDays: 5,
    fee: 20,
    processingTime: 'Varies',
    processingTimeUnit: 'varies',
    slaType: 'scheme_cycle',
    officialSource: 'i-Khedut Portal (ikhedut.gujarat.gov.in) • કૃષિ વિભાગ',
    lastUpdated: '2025-2026',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: '૭/૧૨ અને ૮-અ નકલ', nameEn: '7/12 & 8-A Land Record', checkType: 'land_record_712', required: true },
      { nameGu: 'આધાર કાર્ડ', nameEn: 'Aadhaar Card', checkType: 'aadhaar_regex', required: true },
      { nameGu: 'સ્માર્ટફોનનું GST બિલ (IMEI સાથે)', nameEn: 'Smartphone GST Bill with IMEI', checkType: 'generic', required: true }
    ],
    validationRuleDesc: 'GST બિલ તારીખ અને IMEI નંબર વેલિડિટી'
  },

  // 🏥 2. HEALTHCARE & SOCIAL SECURITY (9 SCHEMES)
  {
    id: 'pmjay-ayushman',
    category: 'healthcare',
    categoryGu: 'આરોગ્ય',
    categoryEn: 'Healthcare & Social Security',
    titleGu: 'PM-JAY આયુષ્માન કાર્ડ (MAA Card)',
    titleEn: 'PM-JAY / Ayushman Bharat Card',
    department: 'આરોગ્ય અને પરિવાર કલ્યાણ વિભાગ',
    benefit: 'Up to ₹10 Lakh cashless hospitalization cover per family per year',
    benefitGu: 'ગુજરાતના પરિવાર દીઠ વાર્ષિક ₹૧૦ લાખ સુધીની કેશલેસ સરકારી/ખાનગી હોસ્પિટલ સારવાર',
    slaDays: 1,
    fee: 30,
    processingTime: '1 - 2',
    processingTimeUnit: 'working_days',
    slaType: 'departmental_norm',
    officialSource: 'National Health Authority (beneficiary.nha.gov.in) & આરોગ્ય વિભાગ',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'બાયોમેટ્રિક ઇ-કેવાયસી ચકાસણી બાદ ૨૪ થી ૪૮ કલાકમાં કાર્ડ જારી',
    statutorySlaNoteEn: 'Digital card issued within 24-48 hours upon biometric e-KYC',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: 'આધાર કાર્ડ', nameEn: 'Aadhaar Card', checkType: 'aadhaar_regex', required: true },
      { nameGu: 'રેશન કાર્ડ (NFSA અથવા મા કાર્ડ)', nameEn: 'Ration Card (NFSA List)', checkType: 'generic', required: true },
      { nameGu: 'આવકનો દાખલો (જો NFSA ન હોય તો)', nameEn: 'Income Certificate (< ₹4L)', checkType: 'income_expiry_3yr', required: true }
    ],
    validationRuleDesc: '૩-વર્ષ આવક દાખલો (< ₹૪ લાખ) અને રેશનકાર્ડ લિંકિંગ'
  },
  {
    id: 'maa-amrutam',
    category: 'healthcare',
    categoryGu: 'આરોગ્ય',
    categoryEn: 'Healthcare & Social Security',
    titleGu: 'મુખ્યમંત્રી અમૃતમ (મા વાત્સલ્ય યોજના)',
    titleEn: 'Mukhyamantri Amrutam (MAA Vatsalya)',
    department: 'આરોગ્ય કમિશનરેટ, ગુજરાત',
    benefit: '100% free treatment for heart, kidney, cancer, neuro diseases',
    benefitGu: 'કેન્સર, કિડની, હૃદયરોગ અને ન્યુરો જેવી ગંભીર બીમારીઓ માટે નિઃશુલ્ક સારવાર',
    slaDays: 2,
    fee: 30,
    processingTime: '1 - 3',
    processingTimeUnit: 'working_days',
    slaType: 'departmental_norm',
    officialSource: 'આરોગ્ય કમિશનરેટ, ગુજરાત સરકાર (gujhealth.gujarat.gov.in)',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'કિયોસ્ક પર આવક અને રેશનકાર્ડ ખરાઈ બાદ કાર્ડ વિતરણ',
    statutorySlaNoteEn: 'Card issuance at designated kiosk upon income/ration verification',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: 'આધાર કાર્ડ', nameEn: 'Aadhaar Card', checkType: 'aadhaar_regex', required: true },
      { nameGu: 'આવકનો દાખલો (વાર્ષિક ₹૪ લાખથી ઓછી)', nameEn: 'Income Certificate (< ₹4L)', checkType: 'income_expiry_3yr', required: true },
      { nameGu: 'રેશન કાર્ડ', nameEn: 'Ration Card', checkType: 'generic', required: true }
    ],
    validationRuleDesc: 'વાર્ષિક આવક મર્યાદા ₹૪,૦૦,૦૦૦ અને ૩ વર્ષ સમયાવધિ ચેક'
  },
  {
    id: 'ganga-swarupa',
    category: 'healthcare',
    categoryGu: 'આરોગ્ય',
    categoryEn: 'Healthcare & Social Security',
    titleGu: 'ગંગા સ્વરૂપા આર્થિક સહાય (વિધવા પેન્શન)',
    titleEn: 'Ganga Swarupa Financial Assistance Scheme',
    department: 'મહિલા અને બાળ વિકાસ વિભાગ',
    benefit: '₹1,250 per month lifetime pension directly in bank account',
    benefitGu: 'વિધવા માતાઓને દર મહિને ₹૧,૨૫૦ આજીવન સીધી બેંક સહાય',
    slaDays: 5,
    fee: 20,
    processingTime: 'Varies',
    processingTimeUnit: 'varies',
    slaType: 'scheme_cycle',
    officialSource: 'મહિલા અને બાળ વિકાસ વિભાગ (wcd.gujarat.gov.in)',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'મામલતદાર કચેરી ખરાઈ બાદ માસિક પેન્શન ડીબીટી ચક્ર',
    statutorySlaNoteEn: 'Mamlatdar verification followed by monthly treasury DBT cycle',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: 'પતિનો મરણનો દાખલો', nameEn: "Husband's Death Certificate", checkType: 'generic', required: true },
      { nameGu: 'આધાર કાર્ડ', nameEn: 'Aadhaar Card', checkType: 'aadhaar_regex', required: true },
      { nameGu: 'આવકનો દાખલો (૩-વર્ષ માન્ય)', nameEn: 'Income Certificate (3-Year)', checkType: 'income_expiry_3yr', required: true },
      { nameGu: 'પુનઃલગ્ન ન કર્યાનું સોગંદનામું', nameEn: 'Non-Remarriage Affidavit', checkType: 'generic', required: true },
      { nameGu: 'બેંક પાસબુક', nameEn: 'Bank Passbook', checkType: 'generic', required: true }
    ],
    validationRuleDesc: 'મરણ દાખલો તારીખ અને ૩-વર્ષ આવક મર્યાદા (ગ્રામીણ ₹૧.૨L / શહેરી ₹૧.૫L)'
  },
  {
    id: 'pmsby-insurance',
    category: 'healthcare',
    categoryGu: 'આરોગ્ય',
    categoryEn: 'Healthcare & Social Security',
    titleGu: 'પ્રધાનમંત્રી સુરક્ષા વીમા યોજના (PMSBY)',
    titleEn: 'Pradhan Mantri Suraksha Bima Yojana',
    department: 'નાણાં મંત્રાલય / બેંકિંગ ડિવિઝન',
    benefit: '₹2 Lakh accidental death/disability insurance for ₹20/year premium',
    benefitGu: 'વાર્ષિક માત્ર ₹૨૦ ના પ્રીમિયમે ₹૨ લાખનું અકસ્માત મૃત્યુ/દિવ્યાંગતા કવચ',
    slaDays: 1,
    fee: 20,
    processingTime: '1 - 2',
    processingTimeUnit: 'working_days',
    slaType: 'departmental_norm',
    officialSource: 'નાણાં મંત્રાલય, ભારત સરકાર (jansuraksha.gov.in)',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'બેંક શાખા ખાતે ૨૪ કલાકમાં ઓટો-ડેબિટ સર્ટિફિકેટ સક્રિય',
    statutorySlaNoteEn: 'Bank branch auto-debit policy activation within 24-48 hours',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: 'આધાર કાર્ડ', nameEn: 'Aadhaar Card', checkType: 'aadhaar_regex', required: true },
      { nameGu: 'બેંક બચત ખાતું પાસબુક', nameEn: 'Bank Savings Account Passbook', checkType: 'generic', required: true }
    ],
    validationRuleDesc: 'ઉંમર ૧૮ થી ૭૦ વર્ષ આધાર જન્મ તારીખથી ઓટો-વેલિડેટ'
  },
  {
    id: 'matrushakti-yojana',
    category: 'healthcare',
    categoryGu: 'આરોગ્ય',
    categoryEn: 'Healthcare & Social Security',
    titleGu: 'મુખ્યમંત્રી માતૃશક્તિ યોજના (MMY)',
    titleEn: 'Mukhyamantri Matrushakti Yojana',
    department: 'મહિલા અને બાળ વિકાસ વિભાગ',
    benefit: '2 kg Chana, 1 kg Tuver Dal, 1L Groundnut Oil monthly for 1,000 days',
    benefitGu: 'ગર્ભવતી અને ધાત્રી માતાઓને ૧,૦૦૦ દિવસ સુધી દર મહિને મફત પૌષ્ટિક આહાર કીટ',
    slaDays: 2,
    fee: 20,
    processingTime: 'Same Day',
    processingTimeUnit: 'same_day',
    slaType: 'departmental_norm',
    officialSource: 'ઇન્ટિગ્રેટેડ ચાઇલ્ડ ડેવલપમેન્ટ સર્વિસીસ (ICDS), ગુજરાત',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'આંગણવાડી ખાતે TeCHO નોંધણી વખતે તાત્કાલિક કીટ વિતરણ',
    statutorySlaNoteEn: 'Immediate monthly kit allotment upon TeCHO-Health pregnancy entry',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: 'મમતા કાર્ડ (MCP Card)', nameEn: 'Mamta Card (MCP Card)', checkType: 'generic', required: true },
      { nameGu: 'માતા અને પિતાનું આધાર કાર્ડ', nameEn: "Mother & Husband's Aadhaar", checkType: 'aadhaar_regex', required: true },
      { nameGu: 'રેશન કાર્ડ', nameEn: 'Ration Card', checkType: 'generic', required: true }
    ],
    validationRuleDesc: 'મમતા કાર્ડ નોંધણી અને બાળકની પ્રથમ ૧,૦૦૦ દિવસની ગણતરી'
  },
  {
    id: 'chiranjeevi-yojana',
    category: 'healthcare',
    categoryGu: 'આરોગ્ય',
    categoryEn: 'Healthcare & Social Security',
    titleGu: 'ચિરંજીવી યોજના (પ્રસૂતિ સહાય)',
    titleEn: 'Chiranjeevi Yojana (Maternal Delivery Assistance)',
    department: 'આરોગ્ય અને પરિવાર કલ્યાણ વિભાગ',
    benefit: '100% free delivery and cesarean in private empanelled hospitals for BPL/APL',
    benefitGu: 'ખાનગી માન્ય હોસ્પિટલોમાં પણ ૧૦૦% મફત સુવાવડ અને સિઝેરિયન ઓપરેશન',
    slaDays: 1,
    fee: 30,
    processingTime: 'Same Day',
    processingTimeUnit: 'same_day',
    slaType: 'departmental_norm',
    officialSource: 'આરોગ્ય અને પરિવાર કલ્યાણ વિભાગ, ગુજરાત સરકાર',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'માન્ય ખાનગી પ્રસૂતિ હોસ્પિટલમાં દાખલ થતાં જ મફત સારવાર',
    statutorySlaNoteEn: 'Immediate cashless admission at empanelled obstetric nursing homes',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: 'આધાર કાર્ડ', nameEn: 'Aadhaar Card', checkType: 'aadhaar_regex', required: true },
      { nameGu: 'BPL રેશનકાર્ડ અથવા આવકનો દાખલો', nameEn: 'BPL Ration Card / Income Certificate', checkType: 'income_expiry_3yr', required: true },
      { nameGu: 'મમતા કાર્ડ', nameEn: 'Mamta Card', checkType: 'generic', required: true }
    ],
    validationRuleDesc: 'બીપીએલ કાર્ડ અથવા ૩-વર્ષ આવક દાખલો ચકાસણી'
  },
  {
    id: 'poshan-sudha',
    category: 'healthcare',
    categoryGu: 'આરોગ્ય',
    categoryEn: 'Healthcare & Social Security',
    titleGu: 'પોષણ સુધા યોજના',
    titleEn: 'Poshan Sudha Yojana',
    department: 'આદિજાતિ વિકાસ વિભાગ',
    benefit: 'One full hot cooked nutritious meal and iron supplements in tribal areas',
    benefitGu: 'આદિવાસી તાલુકાઓમાં સગર્ભા બહેનોને એક ટંકનું સંપૂર્ણ ગરમ પૌષ્ટિક ભોજન',
    slaDays: 2,
    fee: 20,
    processingTime: 'Same Day',
    processingTimeUnit: 'same_day',
    slaType: 'departmental_norm',
    officialSource: 'આદિજાતિ વિકાસ વિભાગ, ગુજરાત (tribal.gujarat.gov.in)',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'આદિજાતિ તાલુકા આંગણવાડીમાં તાત્કાલિક ભોજન નોંધણી',
    statutorySlaNoteEn: 'Immediate daily fortified hot meal registration at tribal Anganwadis',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: 'આધાર કાર્ડ', nameEn: 'Aadhaar Card', checkType: 'aadhaar_regex', required: true },
      { nameGu: 'મમતા કાર્ડ', nameEn: 'Mamta Card', checkType: 'generic', required: true }
    ],
    validationRuleDesc: 'અધિસૂચિત ૧૪ આદિવાસી જિલ્લા કવરેજ ચેક'
  },
  {
    id: 'janani-suraksha',
    category: 'healthcare',
    categoryGu: 'આરોગ્ય',
    categoryEn: 'Healthcare & Social Security',
    titleGu: 'જનની સુરક્ષા યોજના (JSY)',
    titleEn: 'Janani Suraksha Yojana',
    department: 'આરોગ્ય મંત્રાલય (NHM)',
    benefit: '₹1,400 rural / ₹1,000 urban cash incentive for institutional birth',
    benefitGu: 'સરકારી હોસ્પિટલમાં સુવાવડ કરાવવા પર ગ્રામીણ માતાઓને ₹૧,૪૦૦ રોકડ સહાય',
    slaDays: 2,
    fee: 20,
    processingTime: '7',
    processingTimeUnit: 'working_days',
    slaType: 'departmental_norm',
    officialSource: 'નેશનલ હેલ્થ મિશન (NHM), ગુજરાત',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'સરકારી હોસ્પિટલ પ્રસૂતિ બાદ ૭ દિવસમાં ખાતામાં સહાય',
    statutorySlaNoteEn: 'Institutional delivery assistance credited within 7 working days',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: 'આધાર કાર્ડ', nameEn: 'Aadhaar Card', checkType: 'aadhaar_regex', required: true },
      { nameGu: 'સરકારી સંસ્થાકીય પ્રસૂતિ ડિસ્ચાર્જ કાર્ડ', nameEn: 'Institutional Delivery Slip', checkType: 'generic', required: true },
      { nameGu: 'બેંક પાસબુક', nameEn: 'Bank Passbook', checkType: 'generic', required: true }
    ],
    validationRuleDesc: 'હોસ્પિટલ ડિસ્ચાર્જ સ્લિપ અને બેંક એકાઉન્ટ વેરિફિકેશન'
  },
  {
    id: 'niradhar-vrudh',
    category: 'healthcare',
    categoryGu: 'આરોગ્ય',
    categoryEn: 'Healthcare & Social Security',
    titleGu: 'નિરાધાર વૃદ્ધ સહાય યોજના',
    titleEn: 'Niradhar Vrudh Sahay Yojana (Old Age Pension)',
    department: 'સામાજિક ન્યાય અને અધિકારિતા વિભાગ',
    benefit: '₹1,000 per month pension for citizens aged 60 to 79; ₹1,250 for 80+',
    benefitGu: '૬૦ વર્ષથી વધુ ઉંમરના નિરાધાર વડીલોને દર મહિને ₹૧,૦૦૦ થી ₹૧,૨૫૦ પેન્શન',
    slaDays: 5,
    fee: 20,
    processingTime: 'Varies',
    processingTimeUnit: 'varies',
    slaType: 'scheme_cycle',
    officialSource: 'સામાજિક ન્યાય અને અધિકારિતા વિભાગ (sje.gujarat.gov.in)',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'તાલુકા મામલતદાર મંજૂરી બાદ માસિક સરકારી પેન્શન ચક્ર',
    statutorySlaNoteEn: 'Monthly social security treasury release post Mamlatdar approval',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: 'આધાર કાર્ડ (ઉંમરનો પુરાવો ૬૦+)', nameEn: 'Aadhaar Card (Age Proof 60+)', checkType: 'aadhaar_regex', required: true },
      { nameGu: 'આવકનો દાખલો (૩-વર્ષ માન્ય)', nameEn: 'Income Certificate (3-Year)', checkType: 'income_expiry_3yr', required: true },
      { nameGu: 'બેંક પાસબુક', nameEn: 'Bank Passbook', checkType: 'generic', required: true }
    ],
    validationRuleDesc: 'ઉંમર ૬૦+ વર્ષ અને આવક મર્યાદા ચેક'
  },

  // 🎓 3. EDUCATION & SCHOLARSHIPS (8 SCHEMES)
  {
    id: 'namo-lakshmi',
    category: 'education',
    categoryGu: 'શિક્ષણ',
    categoryEn: 'Education & Scholarships',
    titleGu: 'નમો લક્ષ્મી યોજના (ધો. ૯ થી ૧૨)',
    titleEn: 'Namo Lakshmi Yojana',
    department: 'શિક્ષણ વિભાગ, ગુજરાત',
    benefit: '₹50,000 total scholarship across Std 9, 10, 11 and 12 for girl students',
    benefitGu: 'ધોરણ ૯ થી ૧૨ માં અભ્યાસ કરતી દીકરીઓને કુલ ₹૫૦,૦૦૦ ની શિષ્યવૃત્તિ સહાય',
    slaDays: 3,
    fee: 30,
    processingTime: 'Varies',
    processingTimeUnit: 'varies',
    slaType: 'scheme_cycle',
    officialSource: 'શિક્ષણ વિભાગ, ગુજરાત સરકાર',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'શાળા નામાંકન ખરાઈ બાદ શૈક્ષણિક સત્ર ડીબીટી હપ્તા',
    statutorySlaNoteEn: 'School enrollment verification followed by academic session DBT',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: 'વિદ્યાર્થિનીનું આધાર કાર્ડ', nameEn: 'Student Aadhaar Card', checkType: 'aadhaar_regex', required: true },
      { nameGu: 'શાળા બોનાફાઇડ / U-DISE ID', nameEn: 'School Bonafide / U-DISE ID', checkType: 'generic', required: true },
      { nameGu: 'બેંક પાસબુક', nameEn: 'Bank Passbook', checkType: 'generic', required: true }
    ],
    validationRuleDesc: 'ધોરણ ૯ થી ૧૨ શાળા નામાંકન અને ઉંમર ૧૪-૧૮ વર્ષ'
  },
  {
    id: 'mysy-scholarship',
    category: 'education',
    categoryGu: 'શિક્ષણ',
    categoryEn: 'Education & Scholarships',
    titleGu: 'MYSY (મુખ્યમંત્રી યુવા સ્વાવલંબન યોજના)',
    titleEn: 'Mukhyamantri Yuva Swavalamban Yojana (MYSY)',
    department: 'ઉચ્ચ શિક્ષણ કમિશનરેટ',
    benefit: 'Up to 50% college tuition fee waiver (₹2L for Medical, ₹50K for Engg)',
    benefitGu: 'મેડિકલમાં ₹૨ લાખ અને એન્જિનિયરિંગમાં ₹૫૦,૦૦૦ સુધી કોલેજ ટ્યુશન ફી સહાય',
    slaDays: 7,
    fee: 50,
    processingTime: 'Varies',
    processingTimeUnit: 'varies',
    slaType: 'scheme_cycle',
    officialSource: 'Knowledge Consortium of Gujarat (mysy.gujarat.gov.in)',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'હેલ્પ સેન્ટર કાગળ ચકાસણી અને રાજ્ય સ્કોલરશીપ કમિટી મંજૂરી',
    statutorySlaNoteEn: 'Help center document verification and state sanction committee cycle',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: 'ધો. ૧૦ અથવા ૧૨ ની માર્કશીટ (૮૦+ પર્સન્ટાઈલ)', nameEn: '10th/12th Marksheet (80+ Percentile)', checkType: 'marksheet', required: true },
      { nameGu: 'આવકનો દાખલો (૩-વર્ષ માન્ય, < ₹૬ લાખ)', nameEn: 'Income Certificate (3-Year, < ₹6L)', checkType: 'income_expiry_3yr', required: true },
      { nameGu: 'કોલેજ પ્રવેશ પત્ર અને ફી પહોંચ', nameEn: 'College Admission & Fee Receipt', checkType: 'generic', required: true },
      { nameGu: 'આધાર કાર્ડ અને બેંક પાસબુક', nameEn: 'Aadhaar & Bank Passbook', checkType: 'aadhaar_regex', required: true }
    ],
    validationRuleDesc: '૮૦+ પર્સન્ટાઈલ અને ૩-વર્ષ આવક દાખલો (< ₹૬,૦૦,૦૦૦) કડક ચેક'
  },
  {
    id: 'namo-saraswati',
    category: 'education',
    categoryGu: 'શિક્ષણ',
    categoryEn: 'Education & Scholarships',
    titleGu: 'નમો સરસ્વતી વિજ્ઞાન સાધના યોજના',
    titleEn: 'Namo Saraswati Vigyan Sadhana Yojana',
    department: 'શિક્ષણ વિભાગ, ગુજરાત',
    benefit: '₹25,000 scholarship for students pursuing 11th & 12th Science Stream',
    benefitGu: 'ધોરણ ૧૧ અને ૧૨ વિજ્ઞાન પ્રવાહ (સાયન્સ) ના વિદ્યાર્થીઓને ₹૨૫,૦૦૦ સહાય',
    slaDays: 3,
    fee: 30,
    processingTime: 'Varies',
    processingTimeUnit: 'varies',
    slaType: 'scheme_cycle',
    officialSource: 'શિક્ષણ વિભાગ, ગુજરાત સરકાર',
    lastUpdated: '2025-2026',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: 'આધાર કાર્ડ', nameEn: 'Aadhaar Card', checkType: 'aadhaar_regex', required: true },
      { nameGu: 'ધોરણ ૧૦ ની માર્કશીટ', nameEn: 'Std 10 Marksheet', checkType: 'marksheet', required: true },
      { nameGu: 'સાયન્સ પ્રવાહ પ્રવેશ રસીદ', nameEn: '11th/12th Science Stream Receipt', checkType: 'generic', required: true }
    ],
    validationRuleDesc: 'વિજ્ઞાન પ્રવાહ (ગ્રૂપ A/B/AB) નામાંકન ચકાસણી'
  },
  {
    id: 'digital-gujarat-pre',
    category: 'education',
    categoryGu: 'શિક્ષણ',
    categoryEn: 'Education & Scholarships',
    titleGu: 'ડિજિટલ ગુજરાત શિષ્યવૃત્તિ (પ્રી-મેટ્રિક)',
    titleEn: 'Digital Gujarat Scholarship – Pre-Matric',
    department: 'સામાજિક ન્યાય અને અધિકારીતા વિભાગ',
    benefit: 'Annual scholarship for SC, ST, SEBC, EWS students in Std 1 to 10',
    benefitGu: 'ધોરણ ૧ થી ૧૦ ના SC/ST/OBC વિદ્યાર્થીઓને વાર્ષિક શિષ્યવૃત્તિ અને ગણવેશ સહાય',
    slaDays: 5,
    fee: 20,
    processingTime: 'Varies',
    processingTimeUnit: 'varies',
    slaType: 'scheme_cycle',
    officialSource: 'Digital Gujarat Portal (digitalgujarat.gov.in) • સામાજિક ન્યાય વિભાગ',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'વાર્ષિક સ્કોલરશીપ વિન્ડો અને જિલ્લા સમાજ કલ્યાણ મંજૂરી',
    statutorySlaNoteEn: 'Annual window and District Social Welfare Office verification',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: 'જાતિનો દાખલો', nameEn: 'Caste Certificate', checkType: 'caste_cert', required: true },
      { nameGu: 'આવકનો દાખલો (૩-વર્ષ માન્ય)', nameEn: 'Income Certificate (3-Year)', checkType: 'income_expiry_3yr', required: true },
      { nameGu: 'આધાર કાર્ડ અને બેંક પાસબુક', nameEn: 'Aadhaar & Bank Passbook', checkType: 'aadhaar_regex', required: true }
    ],
    validationRuleDesc: 'જાતિ અને ૩-વર્ષ આવક દાખલો (< ₹૨.૫ લાખ) ચેક'
  },
  {
    id: 'digital-gujarat-post',
    category: 'education',
    categoryGu: 'શિક્ષણ',
    categoryEn: 'Education & Scholarships',
    titleGu: 'ડિજિટલ ગુજરાત શિષ્યવૃત્તિ (પોસ્ટ-મેટ્રિક)',
    titleEn: 'Digital Gujarat Scholarship – Post-Matric',
    department: 'સામાજિક ન્યાય / આદિજાતિ વિકાસ',
    benefit: 'Full maintenance allowance and tuition fees for college/diploma students',
    benefitGu: 'કોલેજ અને ડિપ્લોમાના અનામત વર્ગના વિદ્યાર્થીઓને સંપૂર્ણ ફી અને નિર્વાહ ભથ્થું',
    slaDays: 7,
    fee: 30,
    processingTime: 'Varies',
    processingTimeUnit: 'varies',
    slaType: 'scheme_cycle',
    officialSource: 'Digital Gujarat Portal (digitalgujarat.gov.in) • આદિજાતિ & સામાજિક ન્યાય',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'કોલેજ બોનાફાઇડ ખરાઈ બાદ PFMS પોર્ટલ દ્વારા ડીબીટી ક્રેડિટ',
    statutorySlaNoteEn: 'College verification followed by PFMS direct benefit transfer',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: 'જાતિનો દાખલો', nameEn: 'Caste Certificate', checkType: 'caste_cert', required: true },
      { nameGu: 'આવકનો દાખલો (૩-વર્ષ માન્ય)', nameEn: 'Income Certificate (3-Year)', checkType: 'income_expiry_3yr', required: true },
      { nameGu: 'કોલેજ બોનાફાઇડ અને ફી રસીદ', nameEn: 'College Bonafide & Fee Receipt', checkType: 'generic', required: true },
      { nameGu: 'આધાર કાર્ડ', nameEn: 'Aadhaar Card', checkType: 'aadhaar_regex', required: true }
    ],
    validationRuleDesc: 'કોલેજ માન્યતા અને ૩-વર્ષ આવક મર્યાદા ચકાસણી'
  },
  {
    id: 'cmss-scholarship',
    category: 'education',
    categoryGu: 'શિક્ષણ',
    categoryEn: 'Education & Scholarships',
    titleGu: 'મુખ્યમંત્રી સ્કોલરશીપ સ્કીમ (CMSS)',
    titleEn: 'Chief Minister Scholarship Scheme (CMSS)',
    department: 'શિક્ષણ વિભાગ, ગુજરાત સરકાર',
    benefit: 'Special merit scholarship for underprivileged bright students in higher education',
    benefitGu: 'હોનહાર તેજસ્વી વિદ્યાર્થીઓ માટે ઉચ્ચ અભ્યાસ અર્થે વિશેષ મેરિટ શિષ્યવૃત્તિ',
    slaDays: 7,
    fee: 50,
    processingTime: 'Varies',
    processingTimeUnit: 'varies',
    slaType: 'scheme_cycle',
    officialSource: 'ઉચ્ચ શિક્ષણ કમિશનરેટ (scholarships.gujarat.gov.in)',
    lastUpdated: '2025-2026',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: 'બોર્ડ મેરિટ માર્કશીટ', nameEn: 'Board Merit Marksheet', checkType: 'marksheet', required: true },
      { nameGu: 'આવકનો દાખલો (૩-વર્ષ માન્ય, < ₹૪.૫ લાખ)', nameEn: 'Income Certificate (3-Year, < ₹4.5L)', checkType: 'income_expiry_3yr', required: true },
      { nameGu: 'આધાર કાર્ડ', nameEn: 'Aadhaar Card', checkType: 'aadhaar_regex', required: true }
    ],
    validationRuleDesc: 'મેરિટ રેન્ક અને ૩-વર્ષ આવક પ્રમાણપત્ર'
  },
  {
    id: 'saraswati-sadhana-cycle',
    category: 'education',
    categoryGu: 'શિક્ષણ',
    categoryEn: 'Education & Scholarships',
    titleGu: 'સરસ્વતી સાધના સાયકલ સહાય યોજના',
    titleEn: 'Saraswati Sadhana Bicycle Scheme',
    department: 'સામાજિક ન્યાય અને અધિકારિતા વિભાગ',
    benefit: 'Free brand-new bicycle for girls entering Std 9 in rural and urban schools',
    benefitGu: 'ધોરણ ૯ માં પ્રવેશ મેળવતી દીકરીઓને શાળાએ જવા માટે તદ્દન મફત સાયકલ સહાય',
    slaDays: 3,
    fee: 20,
    processingTime: 'Varies',
    processingTimeUnit: 'varies',
    slaType: 'scheme_cycle',
    officialSource: 'વિકસતી જાતિ કલ્યાણ નિયામક કચેરી, ગુજરાત',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'તાલુકા શાળા બોર્ડ દ્વારા સાયકલ વિતરણ અભિયાન હેઠળ',
    statutorySlaNoteEn: 'Taluka school board physical bicycle distribution drive',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: 'ધોરણ ૮ પાસ માર્કશીટ', nameEn: 'Std 8 Pass Marksheet', checkType: 'marksheet', required: true },
      { nameGu: 'ધોરણ ૯ માં શાળા પ્રવેશ દાખલો', nameEn: 'Std 9 School Admission Slip', checkType: 'generic', required: true },
      { nameGu: 'આધાર કાર્ડ અને જાતિનો દાખલો', nameEn: 'Aadhaar & Caste Certificate', checkType: 'caste_cert', required: true }
    ],
    validationRuleDesc: 'ધોરણ ૯ શાળા પ્રવેશ અને જાતિ કેટેગરી ચેક'
  },
  {
    id: 'foreign-study-loan',
    category: 'education',
    categoryGu: 'શિક્ષણ',
    categoryEn: 'Education & Scholarships',
    titleGu: 'વિદેશ અભ્યાસ લોન સહાય યોજના',
    titleEn: 'Foreign Study Education Loan Assistance',
    department: 'બિનઅનામત શૈક્ષણિક અને આર્થિક વિકાસ નિગમ (GUEEDC)',
    benefit: 'Education loan up to ₹15 Lakh at only 4% simple interest rate',
    benefitGu: 'વિદેશમાં ઉચ્ચ અભ્યાસ માટે માત્ર ૪% ના રાહત દરે ₹૧૫ લાખ સુધીની શૈક્ષણિક લોન',
    slaDays: 10,
    fee: 50,
    processingTime: 'Varies',
    processingTimeUnit: 'varies',
    slaType: 'scheme_cycle',
    officialSource: 'ગુજરાત બિનઅનામત શૈક્ષણિક & આર્થિક વિકાસ નિગમ (gueedc.gujarat.gov.in)',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'નિગમ બોર્ડ સ્ક્રુટિની કમિટી દ્વારા લોન મંજૂરી આદેશ',
    statutorySlaNoteEn: 'Loan sanction letter issued following GUEEDC scrutiny committee meet',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: 'વિદેશી યુનિવર્સિટી I-20 / Offer Letter', nameEn: 'Foreign University Offer Letter / I-20', checkType: 'generic', required: true },
      { nameGu: 'આવકનો દાખલો (૩-વર્ષ માન્ય)', nameEn: 'Income Certificate (3-Year)', checkType: 'income_expiry_3yr', required: true },
      { nameGu: 'પાસપોર્ટ અને વિઝા નકલ', nameEn: 'Passport & Visa Copy', checkType: 'generic', required: true },
      { nameGu: 'આધાર કાર્ડ', nameEn: 'Aadhaar Card', checkType: 'aadhaar_regex', required: true }
    ],
    validationRuleDesc: 'યુનિવર્સિટી માન્યતા, પાસપોર્ટ અને ૩-વર્ષ આવક દાખલો'
  },

  // 🏠 4. HOUSING, EMPLOYMENT & WELFARE (11 SCHEMES)
  {
    id: 'pmay-gramin',
    category: 'welfare',
    categoryGu: 'આવાસ અને કલ્યાણ',
    categoryEn: 'Housing & Family Welfare',
    titleGu: 'પ્રધાનમંત્રી આવાસ યોજના – ગ્રામીણ (PMAY-G)',
    titleEn: 'Pradhan Mantri Awas Yojana – Gramin (PMAY-G)',
    department: 'ગ્રામ વિકાસ મંત્રાલય',
    benefit: '₹1,20,000 financial aid + MGNREGA 90 days wages + ₹12,000 toilet grant',
    benefitGu: 'ગ્રામીણ વિસ્તારમાં પાકું મકાન બનાવવા માટે ₹૧,૨૦,૦૦૦ + મનરેગા મજૂરી સહાય',
    slaDays: 15,
    fee: 50,
    processingTime: 'Varies',
    processingTimeUnit: 'varies',
    slaType: 'scheme_cycle',
    officialSource: 'Ministry of Rural Development (pmayg.nic.in) & ગ્રામ વિકાસ કમિશનરેટ',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'ગ્રામ પંચાયત આવાસ યાદી, જીઓ-ટેગિંગ અને ૩ તબક્કામાં હપ્તા',
    statutorySlaNoteEn: 'PMAY-G priority list, geo-tagging of kutcha house and 3-stage DBT',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: 'કાચું મકાન / પ્લોટ જમીન દસ્તાવેજ', nameEn: 'Plot / Kutcha House Document', checkType: 'generic', required: true },
      { nameGu: 'SECC 2011 / BPL કાર્ડ અથવા જોબ કાર્ડ', nameEn: 'BPL Card / MGNREGA Job Card', checkType: 'generic', required: true },
      { nameGu: 'પરિવારના તમામ આધાર કાર્ડ', nameEn: 'Family Aadhaar Cards', checkType: 'aadhaar_regex', required: true },
      { nameGu: 'બેંક પાસબુક', nameEn: 'Bank Passbook', checkType: 'generic', required: true }
    ],
    validationRuleDesc: 'ભારતમાં અન્ય કોઈ પાકું મકાન ન હોવાની સ્વ-ઘોષણા અને પ્લોટ ચેક'
  },
  {
    id: 'pmay-urban',
    category: 'welfare',
    categoryGu: 'આવાસ અને કલ્યાણ',
    categoryEn: 'Housing & Family Welfare',
    titleGu: 'પ્રધાનમંત્રી આવાસ યોજના – શહેરી (PMAY-U)',
    titleEn: 'Pradhan Mantri Awas Yojana – Urban (PMAY-U)',
    department: 'શહેરી વિકાસ અને ગૃહ નિર્માણ',
    benefit: 'Up to ₹2.50 Lakh interest subsidy (CLSS) on home loan for EWS/LIG',
    benefitGu: 'શહેરમાં મકાન ખરીદવા કે બનાવવા માટે ₹૨.૫૦ લાખ સુધીની વ્યાજ સબસિડી',
    slaDays: 15,
    fee: 50,
    processingTime: 'Varies',
    processingTimeUnit: 'varies',
    slaType: 'scheme_cycle',
    officialSource: 'શહેરી વિકાસ અને શહેરી ગૃહ નિર્માણ વિભાગ (pmay-urban.gov.in)',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'મ્યુનિસિપલ કોર્પોરેશન ડ્રો/લોટરી અને વ્યાજ સબસિડી મંજૂરી',
    statutorySlaNoteEn: 'Municipal allotment lottery and CLSS interest subsidy approval',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: 'આવકનો દાખલો (EWS < ₹૩ લાખ, LIG < ₹૬ લાખ)', nameEn: 'Income Certificate (3-Year)', checkType: 'income_expiry_3yr', required: true },
      { nameGu: 'આધાર કાર્ડ', nameEn: 'Aadhaar Card', checkType: 'aadhaar_regex', required: true },
      { nameGu: 'મકાન પ્લોટ / ફ્લેટ બુકિંગ એગ્રીમેન્ટ', nameEn: 'Allotment / Plot Agreement', checkType: 'generic', required: true }
    ],
    validationRuleDesc: '૩-વર્ષ આવક દાખલો અને શહેરી રહેઠાણ પુરાવો'
  },
  {
    id: 'dr-ambedkar-awas',
    category: 'welfare',
    categoryGu: 'આવાસ અને કલ્યાણ',
    categoryEn: 'Housing & Family Welfare',
    titleGu: 'ડૉ. બાબાસાહેબ આંબેડકર આવાસ યોજના',
    titleEn: 'Dr. Ambedkar Awas Yojana',
    department: 'સામાજિક ન્યાય અને અધિકારિતા વિભાગ',
    benefit: '₹1,20,000 assistance in 3 installments to build house on own plot',
    benefitGu: 'અનુસૂચિત જાતિ (SC) ના પરિવારોને પ્લોટ પર મકાન બાંધકામ માટે ₹૧,૨૦,૦૦૦ સહાય',
    slaDays: 10,
    fee: 30,
    processingTime: 'Varies',
    processingTimeUnit: 'varies',
    slaType: 'scheme_cycle',
    officialSource: 'e-Samaj Kalyan Portal (esamajkalyan.gujarat.gov.in)',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'તાલુકા સ્થળ તપાસ અને ૩ બાંધકામ તબક્કામાં સહાય હપ્તા',
    statutorySlaNoteEn: 'Taluka site inspection and 3-stage construction disbursement',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: 'SC જાતિનો દાખલો', nameEn: 'SC Caste Certificate', checkType: 'caste_cert', required: true },
      { nameGu: 'આવકનો દાખલો (૩-વર્ષ માન્ય, ગ્રામીણ ₹૧.૨L / શહેરી ₹૧.૫L)', nameEn: 'Income Certificate (3-Year)', checkType: 'income_expiry_3yr', required: true },
      { nameGu: 'પ્લોટની માલિકી હક સનદ / દસ્તાવેજ', nameEn: 'Plot Title / Sanad Document', checkType: 'generic', required: true },
      { nameGu: 'આધાર કાર્ડ અને બેંક પાસબુક', nameEn: 'Aadhaar & Bank Passbook', checkType: 'aadhaar_regex', required: true }
    ],
    validationRuleDesc: 'SC જાતિ પ્રમાણપત્ર અને ૩-વર્ષ આવક મર્યાદા'
  },
  {
    id: 'pandit-deendayal-awas',
    category: 'welfare',
    categoryGu: 'આવાસ અને કલ્યાણ',
    categoryEn: 'Housing & Family Welfare',
    titleGu: 'પંડિત દીનદયાળ ઉપાધ્યાય આવાસ યોજના',
    titleEn: 'Pandit Deendayal Awas Yojana',
    department: 'સામાજિક ન્યાય અને સામાજિક કલ્યાણ',
    benefit: '₹1,20,000 financial grant for SEBC/OBC/EWS families to build house',
    benefitGu: 'સામાજિક-શૈક્ષણિક પછાત વર્ગ (OBC) પરિવારોને મકાન બાંધકામ માટે ₹૧,૨૦,૦૦૦ સહાય',
    slaDays: 10,
    fee: 30,
    processingTime: 'Varies',
    processingTimeUnit: 'varies',
    slaType: 'scheme_cycle',
    officialSource: 'e-Samaj Kalyan Portal (esamajkalyan.gujarat.gov.in)',
    lastUpdated: '2025-2026',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: 'SEBC/OBC જાતિનો દાખલો', nameEn: 'SEBC/OBC Caste Certificate', checkType: 'caste_cert', required: true },
      { nameGu: 'આવકનો દાખલો (૩-વર્ષ માન્ય)', nameEn: 'Income Certificate (3-Year)', checkType: 'income_expiry_3yr', required: true },
      { nameGu: 'પ્લોટ / જમીન માલિકી દસ્તાવેજ', nameEn: 'Plot Ownership Document', checkType: 'generic', required: true },
      { nameGu: 'આધાર કાર્ડ', nameEn: 'Aadhaar Card', checkType: 'aadhaar_regex', required: true }
    ],
    validationRuleDesc: '૩-વર્ષ આવક દાખલો અને પ્લોટ માલિકી વેલિડેશન'
  },
  {
    id: 'manav-garima',
    category: 'welfare',
    categoryGu: 'આવાસ અને કલ્યાણ',
    categoryEn: 'Housing & Family Welfare',
    titleGu: 'માનવ ગરિમા યોજના (૨૮ વ્યવસાય કિટ)',
    titleEn: 'Manav Garima Yojana',
    department: 'કુટીર અને ગ્રામોદ્યોગ વિભાગ',
    benefit: 'Free complete toolkit/equipment across 28 self-employment vocations',
    benefitGu: 'કડીયાકામ, સિલાઈ, સુથારી, કડિયાકામ સહિત ૨૮ વ્યવસાયો માટે વિનામૂલ્યે ઓજારોની કીટ',
    slaDays: 7,
    fee: 20,
    processingTime: 'Varies',
    processingTimeUnit: 'varies',
    slaType: 'scheme_cycle',
    officialSource: 'કુટીર અને ગ્રામોદ્યોગ કમિશનરેટ • e-Samaj Kalyan',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'કોમ્પ્યુટરાઇઝ્ડ ડ્રો અને જિલ્લા ટૂલકિટ વિતરણ કેમ્પ',
    statutorySlaNoteEn: 'Computerized lottery draw and district tool-kit distribution camp',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: 'આધાર કાર્ડ અને રેશન કાર્ડ', nameEn: 'Aadhaar & Ration Card', checkType: 'aadhaar_regex', required: true },
      { nameGu: 'જાતિનો દાખલો', nameEn: 'Caste Certificate', checkType: 'caste_cert', required: true },
      { nameGu: 'આવકનો દાખલો (૩-વર્ષ માન્ય, ગ્રામીણ ₹૧.૨L / શહેરી ₹૧.૫L)', nameEn: 'Income Certificate (3-Year)', checkType: 'income_expiry_3yr', required: true },
      { nameGu: 'વ્યવસાય અનુભવ અથવા તાલીમ પ્રમાણપત્ર', nameEn: 'Trade Training / Experience Proof', checkType: 'generic', required: true }
    ],
    validationRuleDesc: 'ઉંમર ૧૮ થી ૬૦ વર્ષ અને ૩-વર્ષ આવક દાખલો (< ₹૧,૨૦,૦૦૦)'
  },
  {
    id: 'vahli-dikri',
    category: 'welfare',
    categoryGu: 'આવાસ અને કલ્યાણ',
    categoryEn: 'Housing & Family Welfare',
    titleGu: 'વ્હાલી દીકરી યોજના',
    titleEn: 'Vahli Dikri Yojana',
    department: 'મહિલા અને બાળ વિકાસ વિભાગ',
    benefit: '₹1,10,000 total aid (₹4K in Std 1, ₹6K in Std 9, ₹1 Lakh at age 18)',
    benefitGu: 'દીકરીના જન્મ પર કુલ ₹૧,૧૦,૦૦૦ સહાય (ધો. ૧ માં ₹૪,૦૦૦, ધો. ૯ માં ₹૬,૦૦૦ અને ૧૮ વર્ષે ₹૧ લાખ)',
    slaDays: 5,
    fee: 20,
    processingTime: 'Varies',
    processingTimeUnit: 'varies',
    slaType: 'scheme_cycle',
    officialSource: 'મહિલા અને બાળ વિકાસ વિભાગ (wcd.gujarat.gov.in)',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'જિલ્લા બાળ સુરક્ષા એકમ (DCPU) દ્વારા પોલિસી પ્રમાણપત્ર',
    statutorySlaNoteEn: 'Bond certificate issued by District Child Protection Unit',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: 'દીકરીનો જન્મનો દાખલો (૦૨/૦૮/૨૦૧૯ પછી)', nameEn: 'Daughter Birth Certificate (After 02/08/2019)', checkType: 'generic', required: true },
      { nameGu: 'માતા-પિતાનું આધાર કાર્ડ અને લગ્ન નોંધણી દાખલો', nameEn: "Parents' Aadhaar & Marriage Certificate", checkType: 'aadhaar_regex', required: true },
      { nameGu: 'આવકનો દાખલો (૩-વર્ષ માન્ય, વાર્ષિક < ₹૨ લાખ)', nameEn: 'Income Certificate (3-Year, < ₹2L)', checkType: 'income_expiry_3yr', required: true }
    ],
    validationRuleDesc: 'જન્મ તારીખ ૦૨/૦૮/૨૦૧૯ પછી અને ૩-વર્ષ આવક દાખલો (< ₹૨,૦૦,૦૦૦)'
  },
  {
    id: 'kunwarbai-mameru',
    category: 'welfare',
    categoryGu: 'આવાસ અને કલ્યાણ',
    categoryEn: 'Housing & Family Welfare',
    titleGu: 'કુંવરબાઈનું મામેરું યોજના',
    titleEn: 'Kunwarbai Nu Mameru Yojana',
    department: 'સામાજિક ન્યાય અને અધિકારિતા વિભાગ',
    benefit: '₹12,000 financial assistance directly deposited in bride’s bank account',
    benefitGu: 'દીકરીના લગ્ન પ્રસંગે કન્યાના બેંક ખાતામાં સીધા ₹૧૨,૦૦૦ જમા સહાય',
    slaDays: 5,
    fee: 20,
    processingTime: 'Varies',
    processingTimeUnit: 'varies',
    slaType: 'scheme_cycle',
    officialSource: 'સામાજિક ન્યાય અને અધિકારિતા વિભાગ • e-Samaj Kalyan',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'લગ્ન નોંધણી ચકાસણી બાદ જિલ્લા સમાજ કલ્યાણ દ્વારા રૂ. ૧૨,૦૦૦ ડીબીટી',
    statutorySlaNoteEn: 'Marriage registration scrutiny followed by ₹12,000 DBT release',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: 'લગ્ન નોંધણી પ્રમાણપત્ર (૨ વર્ષની અંદર)', nameEn: 'Marriage Certificate (Within 2 years)', checkType: 'generic', required: true },
      { nameGu: 'કન્યા અને વરરાજાનું આધાર કાર્ડ', nameEn: "Bride & Groom's Aadhaar Cards", checkType: 'aadhaar_regex', required: true },
      { nameGu: 'આવકનો દાખલો (૩-વર્ષ માન્ય)', nameEn: 'Income Certificate (3-Year)', checkType: 'income_expiry_3yr', required: true },
      { nameGu: 'કન્યાની બેંક પાસબુક', nameEn: "Bride's Bank Passbook", checkType: 'generic', required: true }
    ],
    validationRuleDesc: 'લગ્ન તારીખથી ૨ વર્ષની મર્યાદા, કન્યા ઉંમર ૧૮+ અને ૩-વર્ષ આવક પ્રમાણપત્ર'
  },
  {
    id: 'sathshri-seva-divyang',
    category: 'welfare',
    categoryGu: 'આવાસ અને કલ્યાણ',
    categoryEn: 'Housing & Family Welfare',
    titleGu: 'સંત સૂરદાસ / સાથશ્રી સેવા દિવ્યાંગ પેન્શન',
    titleEn: 'Sathshri Seva / Sant Surdas Divyang Pension',
    department: 'સામાજિક ન્યાય અને સામાજિક સુરક્ષા',
    benefit: '₹1,000 per month financial pension for persons with 80%+ disability',
    benefitGu: '૮૦% કે તેથી વધુ દિવ્યાંગતા ધરાવતા વ્યક્તિઓને દર મહિને ₹૧,૦૦૦ પેન્શન',
    slaDays: 5,
    fee: 20,
    processingTime: 'Varies',
    processingTimeUnit: 'varies',
    slaType: 'scheme_cycle',
    officialSource: 'સમાજ સુરક્ષા નિયામક કચેરી (socialdefence.gujarat.gov.in)',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'UDID ૮૦%+ મેડિકલ બોર્ડ ખરાઈ બાદ માસિક પેન્શન આદેશ',
    statutorySlaNoteEn: 'UDID 80%+ medical board verification and monthly pension order',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: 'UDID / દિવ્યાંગતા પ્રમાણપત્ર (૮૦%+)', nameEn: 'Disability Certificate with UDID (80%+)', checkType: 'generic', required: true },
      { nameGu: 'આધાર કાર્ડ', nameEn: 'Aadhaar Card', checkType: 'aadhaar_regex', required: true },
      { nameGu: 'BPL કાર્ડ અથવા આવકનો દાખલો', nameEn: 'BPL Card / Income Certificate', checkType: 'income_expiry_3yr', required: true },
      { nameGu: 'બેંક પાસબુક', nameEn: 'Bank Passbook', checkType: 'generic', required: true }
    ],
    validationRuleDesc: 'UDID દિવ્યાંગતા ૮૦%+ અને ઉંમર ૦ થી ૬૫ વર્ષ'
  },
  {
    id: 'income-certificate-service',
    category: 'welfare',
    categoryGu: 'આવાસ અને કલ્યાણ',
    categoryEn: 'Housing & Family Welfare',
    titleGu: 'આવકનો દાખલો (૩ વર્ષની માન્યતા)',
    titleEn: 'Income Certificate (3-Year Legal Validity)',
    department: 'મહેસૂલ વિભાગ (મામલતદાર કચેરી)',
    benefit: 'Official digital income certificate valid for 3 financial years for all schemes',
    benefitGu: 'તમામ સરકારી યોજનાઓ માટે સત્તાવાર ૩ નાણાકીય વર્ષ માન્ય આવક પ્રમાણપત્ર',
    slaDays: 3,
    fee: 20,
    processingTime: '7 - 14',
    processingTimeUnit: 'working_days',
    slaType: 'statutory_grtsa',
    officialSource: 'Digital Gujarat Portal (digitalgujarat.gov.in) • મહેસૂલ વિભાગ',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'ગુજરાત લોકસેવા હક અધિનિયમ ૨૦૧૩ અન્વયે અધિસૂચિત સેવા (તલાટી/નાયબ મામલતદાર)',
    statutorySlaNoteEn: 'Statutory Notified Public Service under Gujarat Right of Citizens to Public Services Act, 2013',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    validityYears: 3,
    requiredDocs: [
      { nameGu: 'રેશન કાર્ડ અને આધાર કાર્ડ', nameEn: 'Ration Card & Aadhaar Card', checkType: 'aadhaar_regex', required: true },
      { nameGu: 'તલાટીનો આવક પંચનામુ / દાખલો', nameEn: 'Talati Income Panchnama', checkType: 'generic', required: true },
      { nameGu: 'છેલ્લા વર્ષનું લાઈટ બિલ', nameEn: 'Electricity Bill', checkType: 'generic', required: true },
      { nameGu: 'નોકરીયાત માટે ફોર્મ ૧૬ અથવા IT રિટર્ન', nameEn: 'Form 16 / IT Return / Affidavit', checkType: 'generic', required: false }
    ],
    validationRuleDesc: 'તલાટી પંચનામું અને ૩ નાણાકીય વર્ષ કાનૂની સમયાવધિ GRTSA 2013'
  },
  {
    id: 'caste-certificate-service',
    category: 'welfare',
    categoryGu: 'આવાસ અને કલ્યાણ',
    categoryEn: 'Housing & Family Welfare',
    titleGu: 'જાતિનો દાખલો (SC/ST/SEBC/EWS)',
    titleEn: 'Caste Certificate (SC / ST / SEBC / EWS)',
    department: 'સામાજિક ન્યાય / મામલતદાર કચેરી',
    benefit: 'Official permanent community certificate for education and reservations',
    benefitGu: 'અનામત, શિષ્યવૃત્તિ અને સરકારી નોકરીઓ માટે આજીવન માન્ય જાતિ પ્રમાણપત્ર',
    slaDays: 3,
    fee: 20,
    processingTime: '7 - 14',
    processingTimeUnit: 'working_days',
    slaType: 'statutory_grtsa',
    officialSource: 'Digital Gujarat Portal (digitalgujarat.gov.in) • સામાજિક ન્યાય & મહેસૂલ વિભાગ',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'ગુજરાત લોકસેવા હક અધિનિયમ ૨૦૧૩ અન્વયે અધિસૂચિત સેવા (મામલતદાર/સમાજ કલ્યાણ)',
    statutorySlaNoteEn: 'Statutory Notified Public Service under Gujarat Right of Citizens to Public Services Act, 2013',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: 'શાળા છોડ્યાનું પ્રમાણપત્ર (L.C.)', nameEn: 'School Leaving Certificate (L.C.)', checkType: 'generic', required: true },
      { nameGu: 'પિતા / કાકાનું શાળા છોડ્યાનું પ્રમાણપત્ર', nameEn: "Father's / Uncle's Leaving Certificate", checkType: 'generic', required: true },
      { nameGu: 'આધાર કાર્ડ અને રેશન કાર્ડ', nameEn: 'Aadhaar Card & Ration Card', checkType: 'aadhaar_regex', required: true }
    ],
    validationRuleDesc: '૧૯૭૮ પહેલાંનો ગુજરાત વસવાટ પુરાવો અને પેઢીનામા વેરિફિકેશન'
  },
  {
    id: 'widow-assistance-scheme',
    category: 'welfare',
    categoryGu: 'આવાસ અને કલ્યાણ',
    categoryEn: 'Housing & Family Welfare',
    titleGu: 'ગંગા સ્વરૂપા વિધવા સહાય યોજના (Widow Assistance)',
    titleEn: 'Widow Assistance Scheme (Ganga Swarupa Pension)',
    department: 'સામાજિક ન્યાય અને અધિકારીતા વિભાગ',
    benefit: 'Monthly pension of ₹1,250 directly via DBT bank transfer for destitute widows',
    benefitGu: 'વિધવા માતા-બહેનોને દર મહિને ₹૧,૨૫૦ આર્થિક સહાય પેન્શન સીધું બેંક ખાતામાં',
    slaDays: 15,
    fee: 20,
    processingTime: 'Varies',
    processingTimeUnit: 'varies',
    slaType: 'scheme_cycle',
    officialSource: 'સામાજિક ન્યાય અને અધિકારીતા વિભાગ & મહેસૂલ વિભાગ',
    lastUpdated: '2025-2026',
    statutorySlaNoteGu: 'મામલતદાર કચેરી સ્થળ તપાસ બાદ સમાજ સુરક્ષા ડીબીટી મંજૂરી',
    statutorySlaNoteEn: 'Mamlatdar field enquiry followed by Social Security DBT sanction',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    validityYears: 3,
    requiredDocs: [
      { nameGu: 'પતિના મરણનો દાખલો (Death Certificate)', nameEn: 'Husband Death Certificate', checkType: 'generic', required: true },
      { nameGu: 'આવકનો દાખલો (૩ વર્ષ માન્યતા)', nameEn: 'Income Certificate (3-Yr Validity)', checkType: 'income_expiry_3yr', required: true },
      { nameGu: 'પુનઃલગ્ન ન કર્યાનું સોગંદનામું', nameEn: 'Affidavit of Non-Remarriage', checkType: 'generic', required: true },
      { nameGu: 'આધાર કાર્ડ અને બેંક પાસબુક', nameEn: 'Aadhaar & Bank Passbook', checkType: 'aadhaar_regex', required: true }
    ],
    validationRuleDesc: 'પતિના મૃત્યુ દાખલા અને ૩-વર્ષ આવક પ્રમાણપત્ર કાયદેસરતા ચકાસણી'
  },
  {
    id: 'aadhaar-new-enrollment',
    category: 'welfare',
    categoryGu: 'ઓળખ અને કલ્યાણ',
    categoryEn: 'Identity & Citizen Services',
    titleGu: 'નવું આધાર કાર્ડ નોંધણી (New Aadhaar Enrollment)',
    titleEn: 'New Aadhaar Card Enrollment (UIDAI Fresh Registration)',
    department: 'યુનિક આઇડેન્ટિફિકેશન ઓથોરિટી ઓફ ઇન્ડિયા (UIDAI) & DST ગુજરાત',
    benefit: 'Government 12-digit Biometric Unique Identity Card issued free of cost',
    benefitGu: 'UIDAI દ્વારા ૧૨-અંકનું બાયોમેટ્રિક આધાર કાર્ડ સંપૂર્ણ વિનામૂલ્યે જારી',
    slaDays: 7,
    fee: 30,
    processingTime: '7 - 10',
    processingTimeUnit: 'working_days',
    slaType: 'statutory_grtsa',
    officialSource: 'UIDAI (uidai.gov.in) • વિજ્ઞાન અને ટેકનોલોજી વિભાગ, ગુજરાત',
    lastUpdated: '2026',
    statutorySlaNoteGu: 'બાયોમેટ્રિક સ્કેન બાદ ૭-૧૦ દિવસમાં ડિજિટલ ઈ-આધાર જનરેટ થાય છે',
    statutorySlaNoteEn: 'Biometric capture followed by UIDAI deduplication and e-Aadhaar generation',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત/પ્રતીક્ષા સમય: ~૧૫ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15 min',
    requiredDocs: [
      { nameGu: 'જન્મ તારીખનો પુરાવો (જન્મ પ્રમાણપત્ર / સ્કૂલ લિવિંગ)', nameEn: 'Date of Birth Proof (Birth Cert / LC)', checkType: 'generic', required: true },
      { nameGu: 'સરનામાનો પુરાવો (લાઈટબિલ / રેશનકાર્ડ / વેરા રસીદ)', nameEn: 'Proof of Address (Electricity Bill / Ration Card)', checkType: 'generic', required: true },
      { nameGu: 'ઓળખનો સત્તાવાર પુરાવો (ચૂંટણી કાર્ડ / પાન કાર્ડ / પાસપોર્ટ)', nameEn: 'Proof of Identity (Voter ID / PAN / Passport)', checkType: 'generic', required: true }
    ],
    validationRuleDesc: 'UIDAI સત્તાવાર નિયમાવલી મુજબ ૧૦૦% સરકારી પુરાવા વેરિફિકેશન'
  },
  {
    id: 'aadhaar-address-update',
    category: 'welfare',
    categoryGu: 'ઓળખ અને કલ્યાણ',
    categoryEn: 'Identity & Citizen Services',
    titleGu: 'આધાર કાર્ડમાં સરનામું સુધારો / અપડેટ (Aadhaar Address Update)',
    titleEn: 'Aadhaar Address Update / Correction Service',
    department: 'યુનિક આઇડેન્ટિફિકેશન ઓથોરિટી ઓફ ઇન્ડિયા (UIDAI) & જન સેવા કેન્દ્ર',
    benefit: 'Official Address update on Aadhaar Card as per current residence proof',
    benefitGu: 'હાલના કાયદેસર રહેઠાણ પુરાવા મુજબ આધાર કાર્ડમાં સરનામાનો સત્તાવાર સુધારો',
    slaDays: 3,
    fee: 50,
    processingTime: '3 - 5',
    processingTimeUnit: 'working_days',
    slaType: 'statutory_grtsa',
    officialSource: 'UIDAI Portal & ગુજરાત મહેસૂલ જન સેવા કેન્દ્રો',
    lastUpdated: '2026',
    statutorySlaNoteGu: 'સક્ષમ દસ્તાવેજ ચકાસણી બાદ ૩ દિવસમાં સરનામું અપડેટ',
    statutorySlaNoteEn: 'Updated within 3-5 days after backend document verification',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત સમય: ~૧૦-૧૫ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~10-15 min',
    requiredDocs: [
      { nameGu: 'અસલ આધાર કાર્ડ (Original Aadhaar Card)', nameEn: 'Original Aadhaar Card', checkType: 'aadhaar_regex', required: true },
      { nameGu: 'સરનામાનો માન્ય પુરાવો (લાઈટબિલ / રેશનકાર્ડ / બેંક પાસબુક)', nameEn: 'Valid Address Proof (Electricity / Ration / Bank)', checkType: 'generic', required: true },
      { nameGu: 'સરનામા સુધારા સ્વ-ઘોષણા ફોર્મ', nameEn: 'Aadhaar Address Update Self-Declaration', checkType: 'generic', required: true }
    ],
    validationRuleDesc: 'UIDAI એડ્રેસ વેરિફિકેશન સ્ટાન્ડર્ડ અને રહેઠાણ સરનામું મેચ'
  },
  {
    id: 'aadhaar-demographic-update',
    category: 'welfare',
    categoryGu: 'ઓળખ અને કલ્યાણ',
    categoryEn: 'Identity & Citizen Services',
    titleGu: 'આધાર કાર્ડમાં નામ, જન્મતારીખ & લિંગ સુધારો (Aadhaar Demographic Correction)',
    titleEn: 'Aadhaar Name, DOB & Gender Demographic Update',
    department: 'યુનિક આઇડેન્ટિફિકેશન ઓથોરિટી ઓફ ઇન્ડિયા (UIDAI)',
    benefit: 'Official correction of name, date of birth or gender with gazette/birth proof',
    benefitGu: 'જન્મ પ્રમાણપત્ર અથવા ગેઝેટ પુરાવા આધારે નામ અને જન્મતારીખમાં સુધારો',
    slaDays: 5,
    fee: 50,
    processingTime: '5 - 7',
    processingTimeUnit: 'working_days',
    slaType: 'statutory_grtsa',
    officialSource: 'UIDAI Demographic Update Guidelines • જન સેવા કેન્દ્ર',
    lastUpdated: '2026',
    statutorySlaNoteGu: 'UIDAI હેડક્વાર્ટર ડુપ્લીકેશન ચકાસણી બાદ નવું કાર્ડ જનરેટ',
    statutorySlaNoteEn: 'Demographic correction processed with national backend deduplication',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત સમય: ~૧૫ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15 min',
    requiredDocs: [
      { nameGu: 'અસલ આધાર કાર્ડ (Original Aadhaar Card)', nameEn: 'Original Aadhaar Card', checkType: 'aadhaar_regex', required: true },
      { nameGu: 'જન્મ તારીખ પુરાવો (જન્મ પ્રમાણપત્ર / પાસપોર્ટ / પાન)', nameEn: 'DOB Proof (Birth Certificate / Passport / PAN)', checkType: 'generic', required: true },
      { nameGu: 'નામ સુધારા સત્તાવાર પુરાવો (મેરેજ સર્ટિ. / સરકારી ગેઝેટ)', nameEn: 'Name Change Proof (Marriage Cert / Gazette)', checkType: 'generic', required: false }
    ],
    validationRuleDesc: 'UIDAI બાયોમેટ્રિક ડી-ડુપ્લિકેશન અને સત્તાવાર ગેઝેટ વેરિફિકેશન'
  },
  {
    id: 'aadhaar-biometric-mandatory',
    category: 'welfare',
    categoryGu: 'ઓળખ અને કલ્યાણ',
    categoryEn: 'Identity & Citizen Services',
    titleGu: 'આધાર કાર્ડ બાયોમેટ્રિક & મોબાઈલ નંબર અપડેટ (Biometric & Mobile Update)',
    titleEn: 'Aadhaar Biometric (Iris/Fingerprint) & Mobile Number Update',
    department: 'UIDAI & ઈ-ગ્રામ વિશ્વગ્રામ કેન્દ્રો',
    benefit: 'Mandatory biometrics update at 5 & 15 years (Free), mobile number linking (₹100)',
    benefitGu: '૫ અને ૧૫ વર્ષની ઉંમરે ફરજિયાત બાયોમેટ્રિક અપડેટ (મફત), મોબાઈલ નંબર લિંક (₹૧૦૦)',
    slaDays: 1,
    fee: 50,
    processingTime: '1 - 2',
    processingTimeUnit: 'working_days',
    slaType: 'statutory_grtsa',
    officialSource: 'UIDAI Aadhaar Seva Kendra Regulations',
    lastUpdated: '2026',
    statutorySlaNoteGu: 'કાઉન્ટર પર ફિંગરપ્રિન્ટ અને આઇરીસ સ્કેનિંગ પૂર્ણ થતાં ૨૪ કલાકમાં અપડેટ',
    statutorySlaNoteEn: 'Biometric capture completed on desk, updated within 24-48 hours',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત સમય: ~૧૦-૧૫ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~10-15 min',
    requiredDocs: [
      { nameGu: 'અસલ આધાર કાર્ડ (Original Aadhaar Card)', nameEn: 'Original Aadhaar Card', checkType: 'aadhaar_regex', required: true },
      { nameGu: 'સક્રિય મોબાઈલ નંબર (SMS OTP ચકાસણી)', nameEn: 'Active Mobile Number (OTP Verify)', checkType: 'generic', required: true }
    ],
    validationRuleDesc: 'લાઇવ ફિંગરપ્રિન્ટ & આઇરીસ બાયોમેટ્રિક ઓથેન્ટિકેશન'
  },
  {
    id: 'ration-card-new-barcoded',
    category: 'welfare',
    categoryGu: 'અન્ન & નાગરિક પુરવઠો',
    categoryEn: 'Food & Civil Supplies',
    titleGu: 'નવું બારકોડેડ ડિજિટલ રેશનકાર્ડ (New Barcoded Ration Card)',
    titleEn: 'New Barcoded Digital Ration Card (NFSA / Non-NFSA)',
    department: 'અન્ન, નાગરિક પુરવઠો અને ગ્રાહકોની બાબતોનો વિભાગ',
    benefit: 'Official digital family ration card for subsidized grains and government identity',
    benefitGu: 'સસ્તા અનાજ અને સરકારી કલ્યાણકારી યોજનાઓ માટે સત્તાવાર ડિજિટલ રેશનકાર્ડ',
    slaDays: 15,
    fee: 30,
    processingTime: '7 - 15',
    processingTimeUnit: 'working_days',
    slaType: 'statutory_grtsa',
    officialSource: 'Food & Civil Supplies Department, Gujarat (ipds.gujarat.gov.in)',
    lastUpdated: '2026',
    statutorySlaNoteGu: 'તલાટી/મામલતદાર પુરવઠા શાખા દ્વારા સ્થળ ચકાસણી બાદ જારી',
    statutorySlaNoteEn: 'Mamlatdar supply branch field enquiry followed by barcoded card issuance',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત સમય: ~૧૫-૨૦ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15-20 min',
    requiredDocs: [
      { nameGu: 'તમામ કુટુંબ સભ્યોના આધાર કાર્ડ', nameEn: 'Aadhaar of All Family Members', checkType: 'aadhaar_regex', required: true },
      { nameGu: 'રહેઠાણનો સત્તાવાર પુરાવો (લાઈટબિલ / વેરા રસીદ)', nameEn: 'Proof of Residence (Electricity / Tax Bill)', checkType: 'generic', required: true },
      { nameGu: 'સક્ષમ અધિકારીનો આવકનો દાખલો (૩-વર્ષ માન્ય)', nameEn: 'Income Certificate (3-Yr Validity)', checkType: 'income_expiry_3yr', required: true },
      { nameGu: 'જૂના રેશનકાર્ડમાંથી નામ કમી કર્યાનો દાખલો', nameEn: 'Cancellation Certificate from Old Card', checkType: 'generic', required: false }
    ],
    validationRuleDesc: 'NFSA કુટુંબ પાત્રતા અને પુરવઠા વિભાગ ૧૨-અંક બારકોડ જનરેશન'
  },
  {
    id: 'ration-card-member-add-remove',
    category: 'welfare',
    categoryGu: 'અન્ન & નાગરિક પુરવઠો',
    categoryEn: 'Food & Civil Supplies',
    titleGu: 'રેશનકાર્ડમાં નામ ઉમેરવું / કમી કરવું / સુધારો (Ration Card Member Update)',
    titleEn: 'Ration Card Member Addition, Deletion & Correction',
    department: 'અન્ન, નાગરિક પુરવઠો અને ગ્રાહકોની બાબતોનો વિભાગ',
    benefit: 'Add newborn/spouse or remove deceased/married members from family ration card',
    benefitGu: 'નવા જન્મેલા બાળક/પત્નીનું નામ ઉમેરવું અથવા લગ્ન/અવસાન બાદ નામ કમી કરવું',
    slaDays: 7,
    fee: 20,
    processingTime: '3 - 7',
    processingTimeUnit: 'working_days',
    slaType: 'statutory_grtsa',
    officialSource: 'PDS Portal Gujarat & મામલતદાર પુરવઠા શાખા',
    lastUpdated: '2026',
    statutorySlaNoteGu: 'જન્મ/લગ્ન પ્રમાણપત્ર ચકાસીને ૨-૩ દિવસમાં રેશનકાર્ડ કૂપન અપડેટ',
    statutorySlaNoteEn: 'Updated in PDS database within 3-7 days with revised family roster',
    appointmentWaitEstimateGu: 'કાઉન્ટર મુલાકાત સમય: ~૧૫ મિનિટ',
    appointmentWaitEstimateEn: 'Counter appointment visit duration: ~15 min',
    requiredDocs: [
      { nameGu: 'અસલ બારકોડેડ રેશનકાર્ડ (Original Ration Card)', nameEn: 'Original Barcoded Ration Card', checkType: 'generic', required: true },
      { nameGu: 'ઉમેરવા માટે: સભ્યનું આધાર & જન્મ/લગ્ન પ્રમાણપત્ર', nameEn: 'Addition: Member Aadhaar & Birth/Marriage Cert', checkType: 'generic', required: true },
      { nameGu: 'કમી કરવા માટે: મરણ પ્રમાણપત્ર અથવા લગ્ન નોંધણી દાખલો', nameEn: 'Deletion: Death Cert or Marriage Registration', checkType: 'generic', required: false }
    ],
    validationRuleDesc: 'PDS ડેટાબેઝ કુટુંબ સભ્ય વેરિફિકેશન અને બાયોમેટ્રિક સીડિંગ'
  }
];
