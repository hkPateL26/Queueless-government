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

export const GUJARAT_33_DISTRICTS: DistrictItem[] = [
  {
    id: 'rajkot',
    nameGu: 'રાજકોટ',
    nameEn: 'Rajkot',
    headquarters: 'રાજકોટ',
    talukas: [
      {
        id: 'gondal',
        nameGu: 'ગોંડલ',
        nameEn: 'Gondal',
        officeNameGu: 'ગોંડલ - જન સેવા કેન્દ્ર • મામલતદાર કચેરી ગોંડલ',
        officeNameEn: 'Gondal - Jan Seva Kendra • Mamlatdar Office Gondal',
        counters: [
          { number: 1, nameGu: 'સમાજ કલ્યાણ & પેન્શન', nameEn: 'Social Welfare & Pension', officerName: 'કે. એમ. ત્રિવેદી', services: ['widow', 'pension', 'divyang', 'scholarship'] },
          { number: 2, nameGu: 'જન સેવા પ્રમાણપત્રો (આવક/જાતિ)', nameEn: 'Certificates (Income/Caste)', officerName: 'પી. આર. જાડેજા', services: ['income', 'caste', 'ews', 'cremilayer'] },
          { number: 3, nameGu: 'રેશનકાર્ડ & પુરવઠા સેવા', nameEn: 'Ration Card & Food Supply', officerName: 'એસ. ટી. પટેલ', services: ['ration', 'nfsa', 'bpl'] },
          { number: 4, nameGu: 'ઈ-ધરા કેન્દ્ર (૭/૧૨ & ખેતી)', nameEn: 'E-Dhara (7/12 & Land Records)', officerName: 'વી. કે. મહેતા', services: ['land', '712', '8a', 'ikhedut', 'agriculture'] },
          { number: 5, nameGu: 'આધાર કેન્દ્ર (બાયોમેટ્રિક)', nameEn: 'Aadhaar Biometric Center', officerName: 'એ. જે. સોલંકી', services: ['aadhaar', 'biometric', 'update'] },
          { number: 6, nameGu: 'આવાસ & સામાન્ય પૂછપરછ', nameEn: 'Housing Schemes & General Desk', officerName: 'એન. બી. ચાવડા', services: ['awas', 'housing', 'pmay', 'general'] }
        ]
      },
      {
        id: 'rajkot-west',
        nameGu: 'રાજકોટ શહેર પશ્ચિમ (નાના મવા)',
        nameEn: 'Rajkot City West (Nana Mava)',
        officeNameGu: 'રાજકોટ પશ્ચિમ - મામલતદાર કચેરી જન સેવા કેન્દ્ર (નાના મવા રોડ)',
        officeNameEn: 'Rajkot West - Mamlatdar Office Jan Seva Kendra (Nana Mava)',
        counters: [
          { number: 1, nameGu: 'પ્રમાણપત્ર શાખા (આવક/જાતિ)', nameEn: 'Certificates Desk', officerName: 'એસ. બી. જાડેજા', services: ['income', 'caste', 'ews'] },
          { number: 2, nameGu: 'આધાર સુપર સેન્ટર', nameEn: 'Aadhaar Center', officerName: 'પી. કે. જોશી', services: ['aadhaar', 'biometric'] },
          { number: 3, nameGu: 'રેશનકાર્ડ ડેસ્ક', nameEn: 'Ration Desk', officerName: 'એન. આર. વાઘેલા', services: ['ration', 'nfsa'] },
          { number: 4, nameGu: 'ઈ-ધરા જમીન મહેસૂલ', nameEn: 'E-Dhara Desk', officerName: 'એચ. સી. પંડ્યા', services: ['land', '712'] },
          { number: 5, nameGu: 'સમાજ સુરક્ષા & પેન્શન', nameEn: 'Social Security', officerName: 'આર. એમ. દવે', services: ['widow', 'pension'] },
          { number: 6, nameGu: 'સામાન્ય નાગરિક સેવા', nameEn: 'General Services', officerName: 'કે. ટી. મહેતા', services: ['general', 'awas'] }
        ]
      },
      {
        id: 'rajkot-east',
        nameGu: 'રાજકોટ શહેર પૂર્વ (આજી વસાહત)',
        nameEn: 'Rajkot City East (Aji GIDC)',
        officeNameGu: 'રાજકોટ પૂર્વ - મામલતદાર કચેરી જન સેવા કેન્દ્ર (ભાવનગર રોડ)',
        officeNameEn: 'Rajkot East - Mamlatdar Office Jan Seva Kendra (Bhavnagar Rd)',
        counters: [
          { number: 1, nameGu: 'સમાજ કલ્યાણ શાખા', nameEn: 'Social Welfare', officerName: 'એમ. પી. ગોહિલ', services: ['widow', 'pension'] },
          { number: 2, nameGu: 'આવક & જાતિ પ્રમાણપત્રો', nameEn: 'Certificates', officerName: 'બી. એલ. ચાવડા', services: ['income', 'caste'] },
          { number: 3, nameGu: 'પુરવઠા & રેશનકાર્ડ', nameEn: 'Civil Supplies', officerName: 'ડી. કે. ઝાલા', services: ['ration', 'nfsa'] },
          { number: 4, nameGu: 'ઈ-ધરા ૭/૧૨ નકલ', nameEn: 'E-Dhara Land', officerName: 'વી. આર. શાહ', services: ['land', '712'] },
          { number: 5, nameGu: 'આધાર નોંધણી બારી', nameEn: 'Aadhaar Desk', officerName: 'જે. પી. પરમાર', services: ['aadhaar'] }
        ]
      },
      {
        id: 'rajkot-central',
        nameGu: 'રાજકોટ સેન્ટ્રલ (કલેક્ટર કચેરી)',
        nameEn: 'Rajkot Central (Collectorate)',
        officeNameGu: 'રાજકોટ સેન્ટ્રલ - જિલ્લા કલેક્ટર કચેરી મુખ્ય જન સેવા કેન્દ્ર',
        officeNameEn: 'Rajkot Central - District Collectorate Main Jan Seva Kendra',
        counters: [
          { number: 1, nameGu: 'જિલ્લા મહેસૂલી પ્રમાણપત્રો', nameEn: 'Revenue Desk', officerName: 'એ. એમ. શાહ', services: ['income', 'caste', 'ews'] },
          { number: 2, nameGu: 'આધાર સુપર સેન્ટર (UIDAI)', nameEn: 'Aadhaar Super Center', officerName: 'વી. ટી. સોલંકી', services: ['aadhaar', 'biometric'] },
          { number: 3, nameGu: 'જિલ્લા પુરવઠા શાખા', nameEn: 'Food Supplies', officerName: 'જી. પી. પટેલ', services: ['ration', 'nfsa'] },
          { number: 4, nameGu: 'ઈ-ધરા અપીલ & જમીન રેકોર્ડ્સ', nameEn: 'Land Records RoR', officerName: 'કે. કે. ચાવડા', services: ['land', '712'] },
          { number: 5, nameGu: 'સમાજ સુરક્ષા & દિવ્યાંગ સહાય', nameEn: 'Divyang & Pension', officerName: 'એન. એસ. જાડેજા', services: ['widow', 'pension', 'divyang'] },
          { number: 6, nameGu: 'કલેક્ટર અપીલ & પૂછપરછ', nameEn: 'Collectorate Desk', officerName: 'આર. વી. ત્રિવેદી', services: ['general', 'scholarship'] }
        ]
      },
      {
        id: 'rajkot-rural',
        nameGu: 'રાજકોટ ગ્રામ્ય',
        nameEn: 'Rajkot Rural',
        officeNameGu: 'રાજકોટ ગ્રામ્ય - તાલુકા મામલતદાર કચેરી જન સેવા કેન્દ્ર',
        officeNameEn: 'Rajkot Rural - Taluka Mamlatdar Office Jan Seva Kendra',
        counters: [
          { number: 1, nameGu: 'સમાજ કલ્યાણ & પેન્શન', nameEn: 'Welfare & Pension', officerName: 'આર. એન. ગોહિલ', services: ['widow', 'pension', 'welfare'] },
          { number: 2, nameGu: 'આવક & જાતિ પ્રમાણપત્રો', nameEn: 'Certificates (Income/Caste)', officerName: 'ડી. એચ. વાઘેલા', services: ['income', 'caste'] },
          { number: 3, nameGu: 'રેશનકાર્ડ ડેસ્ક', nameEn: 'Ration Desk', officerName: 'એમ. પી. પંચાલ', services: ['ration'] },
          { number: 4, nameGu: 'ઈ-ધરા (૭/૧૨ રેકોર્ડ્સ)', nameEn: 'E-Dhara (7/12 Land)', officerName: 'જે. કે. વ્યાસ', services: ['land', '712', 'ikhedut'] },
          { number: 5, nameGu: 'આધાર બાયોમેટ્રિક', nameEn: 'Aadhaar Biometric', officerName: 'એચ. એલ. રાઠોડ', services: ['aadhaar'] },
          { number: 6, nameGu: 'આવાસ & ગ્રામ વિકાસ', nameEn: 'Rural Housing Desk', officerName: 'બી. એમ. દવે', services: ['awas', 'pmay'] }
        ]
      },
      {
        id: 'kotda-sangani',
        nameGu: 'કોટડા સાંગાણી',
        nameEn: 'Kotda Sangani',
        officeNameGu: 'કોટડા સાંગાણી - તાલુકા મામલતદાર કચેરી જન સેવા કેન્દ્ર',
        officeNameEn: 'Kotda Sangani - Taluka Mamlatdar Office Jan Seva Kendra',
        counters: [
          { number: 1, nameGu: 'સામાજિક સુરક્ષા & પેન્શન', nameEn: 'Social Security', officerName: 'એમ. કે. રાઠોડ', services: ['widow', 'pension'] },
          { number: 2, nameGu: 'પ્રમાણપત્ર વિતરણ (આવક/જાતિ)', nameEn: 'Certificates', officerName: 'ડી. બી. ઝાલા', services: ['income', 'caste'] },
          { number: 3, nameGu: 'રેશનકાર્ડ & અન્ન વિતરણ', nameEn: 'Ration Desk', officerName: 'આર. વી. જોશી', services: ['ration'] },
          { number: 4, nameGu: 'આધાર બાયોમેટ્રિક & અપડેટ', nameEn: 'Aadhaar Desk', officerName: 'પી. કે. પરમાર', services: ['aadhaar'] },
          { number: 5, nameGu: 'ઈ-ધરા જમીન રેકોર્ડ્સ ૭/૧૨', nameEn: 'E-Dhara Land', officerName: 'વી. એસ. ચૌહાણ', services: ['land', '712', 'ikhedut'] }
        ]
      },
      {
        id: 'jetpur',
        nameGu: 'જેતપુર',
        nameEn: 'Jetpur',
        officeNameGu: 'જેતપુર - જન સેવા કેન્દ્ર • મામલતદાર કચેરી જેતપુર',
        officeNameEn: 'Jetpur - Jan Seva Kendra • Mamlatdar Office Jetpur',
        counters: [
          { number: 1, nameGu: 'સમાજ કલ્યાણ', nameEn: 'Social Welfare', officerName: 'ટી. એસ. શેખ', services: ['welfare', 'pension'] },
          { number: 2, nameGu: 'પ્રમાણપત્ર વિતરણ', nameEn: 'Certificates', officerName: 'કે. જી. રામાણી', services: ['income', 'caste'] },
          { number: 3, nameGu: 'પુરવઠા શાખા', nameEn: 'Food Supply', officerName: 'વી. એમ. બોરીચા', services: ['ration'] },
          { number: 4, nameGu: 'ઈ-ધરા ખેતીવાડી', nameEn: 'E-Dhara Agri', officerName: 'એન. કે. ચોવટિયા', services: ['land', 'ikhedut'] },
          { number: 5, nameGu: 'આધાર કાઉન્ટર', nameEn: 'Aadhaar Desk', officerName: 'એમ. ડી. જાની', services: ['aadhaar'] },
          { number: 6, nameGu: 'સામાન્ય સેવા', nameEn: 'General Services', officerName: 'પી. સી. વાળા', services: ['general'] }
        ]
      },
      {
        id: 'dhoraji',
        nameGu: 'ધોરાજી',
        nameEn: 'Dhoraji',
        officeNameGu: 'ધોરાજી - જન સેવા કેન્દ્ર • મામલતદાર કચેરી ધોરાજી',
        officeNameEn: 'Dhoraji - Jan Seva Kendra • Mamlatdar Office Dhoraji',
        counters: [
          { number: 1, nameGu: 'સમાજ કલ્યાણ & પેન્શન', nameEn: 'Social Welfare', officerName: 'એચ. આર. પરમાર', services: ['welfare'] },
          { number: 2, nameGu: 'આવક/જાતિ દાખલા', nameEn: 'Certificates', officerName: 'જે. બી. મકવાણા', services: ['income', 'caste'] },
          { number: 3, nameGu: 'પુરવઠા', nameEn: 'Supplies', officerName: 'કે. એમ. પટેલ', services: ['ration'] },
          { number: 4, nameGu: 'ઈ-ધરા જમીન', nameEn: 'E-Dhara', officerName: 'એસ. કે. જોષી', services: ['land', 'ikhedut'] },
          { number: 5, nameGu: 'આધાર કેન્દ્ર', nameEn: 'Aadhaar', officerName: 'બી. ટી. સોલંકી', services: ['aadhaar'] },
          { number: 6, nameGu: 'આવાસ સેવાઓ', nameEn: 'Housing Desk', officerName: 'એ. વી. મહેતા', services: ['awas'] }
        ]
      },
      {
        id: 'upleta',
        nameGu: 'ઉપલેટા',
        nameEn: 'Upleta',
        officeNameGu: 'ઉપલેટા - જન સેવા કેન્દ્ર • મામલતદાર કચેરી ઉપલેટા',
        officeNameEn: 'Upleta - Jan Seva Kendra • Mamlatdar Office Upleta',
        counters: [
          { number: 1, nameGu: 'સમાજ કલ્યાણ', nameEn: 'Welfare', officerName: 'બી. એમ. વાળા', services: ['welfare'] },
          { number: 2, nameGu: 'પ્રમાણપત્ર વિતરણ', nameEn: 'Certificates', officerName: 'કે. પી. સોલંકી', services: ['income', 'caste'] },
          { number: 3, nameGu: 'પુરવઠા & રેશન', nameEn: 'Supplies', officerName: 'આર. ડી. જાડેજા', services: ['ration'] },
          { number: 4, nameGu: 'ઈ-ધરા ૭/૧૨ રેકોર્ડ', nameEn: 'E-Dhara', officerName: 'એમ. કે. મહેતા', services: ['land', '712'] },
          { number: 5, nameGu: 'આધાર બાયોમેટ્રિક', nameEn: 'Aadhaar', officerName: 'એસ. એલ. પરમાર', services: ['aadhaar'] }
        ]
      },
      {
        id: 'lodhika',
        nameGu: 'લોધિકા (જીઆઈડીસી)',
        nameEn: 'Lodhika (GIDC)',
        officeNameGu: 'લોધિકા - જન સેવા કેન્દ્ર • મામલતદાર કચેરી લોધિકા',
        officeNameEn: 'Lodhika - Jan Seva Kendra • Mamlatdar Office Lodhika',
        counters: [
          { number: 1, nameGu: 'સામાજિક સુરક્ષા શાખા', nameEn: 'Social Welfare', officerName: 'એમ. જે. ગોહિલ', services: ['welfare', 'pension'] },
          { number: 2, nameGu: 'જન સેવા દાખલાઓ', nameEn: 'Certificates', officerName: 'કે. પી. પરમાર', services: ['income', 'caste'] },
          { number: 3, nameGu: 'રેશનકાર્ડ & પુરવઠા', nameEn: 'Ration Desk', officerName: 'ડી. વી. મહેતા', services: ['ration'] },
          { number: 4, nameGu: 'આધાર સુધારણા કાઉન્ટર', nameEn: 'Aadhaar Desk', officerName: 'આર. એન. ચૌધરી', services: ['aadhaar'] },
          { number: 5, nameGu: 'ઈ-ધરા જમીન મહેસૂલ', nameEn: 'E-Dhara', officerName: 'બી. એલ. ત્રિવેદી', services: ['land', '712'] }
        ]
      },
      {
        id: 'jasdan',
        nameGu: 'જસદણ',
        nameEn: 'Jasdan',
        officeNameGu: 'જસદણ - જન સેવા કેન્દ્ર • મામલતદાર કચેરી જસદણ',
        officeNameEn: 'Jasdan - Jan Seva Kendra • Mamlatdar Office Jasdan',
        counters: [
          { number: 1, nameGu: 'સમાજ કલ્યાણ', nameEn: 'Social Welfare', officerName: 'ડી. પી. ખાચર', services: ['welfare'] },
          { number: 2, nameGu: 'પ્રમાણપત્રો', nameEn: 'Certificates', officerName: 'આર. એમ. ડાભી', services: ['income', 'caste'] },
          { number: 3, nameGu: 'પુરવઠા ડેસ્ક', nameEn: 'Supplies', officerName: 'એન. વી. બારૈયા', services: ['ration'] },
          { number: 4, nameGu: 'ઈ-ધરા ૭/૧૨', nameEn: 'E-Dhara', officerName: 'કે. એલ. મિયાત્રા', services: ['land', 'ikhedut'] },
          { number: 5, nameGu: 'આધાર ડેસ્ક', nameEn: 'Aadhaar', officerName: 'એસ. જે. કંટારિયા', services: ['aadhaar'] },
          { number: 6, nameGu: 'આવાસ યોજના', nameEn: 'Housing', officerName: 'એમ. કે. ઝાલા', services: ['awas'] }
        ]
      },
      {
        id: 'vinchhiya',
        nameGu: 'વીંછીયા',
        nameEn: 'Vinchhiya',
        officeNameGu: 'વીંછીયા - જન સેવા કેન્દ્ર • મામલતદાર કચેરી વીંછીયા',
        officeNameEn: 'Vinchhiya - Jan Seva Kendra • Mamlatdar Office Vinchhiya',
        counters: [
          { number: 1, nameGu: 'સામાજિક સુરક્ષા', nameEn: 'Welfare', officerName: 'કે. આર. કોળી', services: ['welfare', 'pension'] },
          { number: 2, nameGu: 'પ્રમાણપત્ર વિતરણ', nameEn: 'Certificates', officerName: 'પી. ડી. વાળા', services: ['income', 'caste'] },
          { number: 3, nameGu: 'રેશનકાર્ડ સેવા', nameEn: 'Ration', officerName: 'એમ. એસ. ચાવડા', services: ['ration'] },
          { number: 4, nameGu: 'ઈ-ધરા ૭/૧૨ જમીન', nameEn: 'E-Dhara', officerName: 'એચ. જી. જોશી', services: ['land', '712'] },
          { number: 5, nameGu: 'આધાર કેન્દ્ર', nameEn: 'Aadhaar', officerName: 'બી. એમ. રાઠોડ', services: ['aadhaar'] }
        ]
      },
      {
        id: 'paddhari',
        nameGu: 'પડધરી',
        nameEn: 'Paddhari',
        officeNameGu: 'પડધરી - જન સેવા કેન્દ્ર • મામલતદાર કચેરી પડધરી',
        officeNameEn: 'Paddhari - Jan Seva Kendra • Mamlatdar Office Paddhari',
        counters: [
          { number: 1, nameGu: 'સમાજ કલ્યાણ', nameEn: 'Welfare', officerName: 'એસ. ટી. જાડેજા', services: ['welfare'] },
          { number: 2, nameGu: 'દાખલા વિતરણ', nameEn: 'Certificates', officerName: 'વી. કે. પટેલ', services: ['income', 'caste'] },
          { number: 3, nameGu: 'પુરવઠા શાખા', nameEn: 'Ration', officerName: 'આર. એમ. મકવાણા', services: ['ration'] },
          { number: 4, nameGu: 'ઈ-ધરા ખેતીવાડી', nameEn: 'E-Dhara', officerName: 'કે. પી. વ્યાસ', services: ['land', '712'] },
          { number: 5, nameGu: 'આધાર કાઉન્ટર', nameEn: 'Aadhaar', officerName: 'જે. ડી. ચૌહાણ', services: ['aadhaar'] }
        ]
      },
      {
        id: 'jamkandorna',
        nameGu: 'જામકંડોરણા',
        nameEn: 'Jamkandorna',
        officeNameGu: 'જામકંડોરણા - જન સેવા કેન્દ્ર • મામલતદાર કચેરી જામકંડોરણા',
        officeNameEn: 'Jamkandorna - Jan Seva Kendra • Mamlatdar Office Jamkandorna',
        counters: [
          { number: 1, nameGu: 'સમાજ કલ્યાણ & પેન્શન', nameEn: 'Welfare', officerName: 'એ. કે. રાદડિયા', services: ['welfare'] },
          { number: 2, nameGu: 'પ્રમાણપત્ર વિતરણ', nameEn: 'Certificates', officerName: 'એમ. પી. જાડેજા', services: ['income', 'caste'] },
          { number: 3, nameGu: 'રેશનકાર્ડ & અન્ન પુરવઠા', nameEn: 'Ration', officerName: 'ડી. એસ. પટેલ', services: ['ration'] },
          { number: 4, nameGu: 'ઈ-ધરા ૭/૧૨ નકલ', nameEn: 'E-Dhara', officerName: 'વી. એલ. સોજીત્રા', services: ['land', '712'] },
          { number: 5, nameGu: 'આધાર સુવિધા ડેસ્ક', nameEn: 'Aadhaar', officerName: 'પી. કે. મોરડિયા', services: ['aadhaar'] }
        ]
      }
    ]
  },
  {
    id: 'ahmedabad',
    nameGu: 'અમદાવાદ',
    nameEn: 'Ahmedabad',
    headquarters: 'અમદાવાદ',
    talukas: [
      {
        id: 'ahmedabad-city-west',
        nameGu: 'અમદાવાદ પશ્ચિમ',
        nameEn: 'Ahmedabad West',
        officeNameGu: 'જન સેવા કેન્દ્ર • મામલતદાર કચેરી પશ્ચિમ અમદાવાદ',
        officeNameEn: 'Jan Seva Kendra • Mamlatdar Office Ahmedabad West',
        counters: [
          { number: 1, nameGu: 'સમાજ કલ્યાણ & પેન્શન', nameEn: 'Social Welfare', officerName: 'એ. પી. શાહ', services: ['welfare'] },
          { number: 2, nameGu: 'દાખલા બારી (આવક/જાતિ)', nameEn: 'Certificates Desk', officerName: 'આર. કે. દેસાઈ', services: ['income', 'caste'] },
          { number: 3, nameGu: 'રેશનકાર્ડ સેવાઓ', nameEn: 'Ration Desk', officerName: 'જે. એમ. પટેલ', services: ['ration'] },
          { number: 4, nameGu: 'જમીન મહેસૂલ શાખા', nameEn: 'Revenue Desk', officerName: 'પી. એલ. ત્રિવેદી', services: ['land', '712'] },
          { number: 5, nameGu: 'બાયોમેટ્રિક આધાર કેન્દ્ર', nameEn: 'UIDAI Center', officerName: 'કે. એન. સોની', services: ['aadhaar'] },
          { number: 6, nameGu: 'PMAY શહેરી આવાસ', nameEn: 'PMAY Urban', officerName: 'એસ. બી. મેવાડા', services: ['awas'] }
        ]
      },
      {
        id: 'daskroi',
        nameGu: 'દસ્ક્રોઈ',
        nameEn: 'Daskroi',
        officeNameGu: 'જન સેવા કેન્દ્ર • મામલતદાર કચેરી દસ્ક્રોઈ',
        officeNameEn: 'Jan Seva Kendra • Mamlatdar Office Daskroi',
        counters: [
          { number: 1, nameGu: 'સમાજ સુરક્ષા', nameEn: 'Social Security', officerName: 'એચ. કે. ઠાકોર', services: ['welfare'] },
          { number: 2, nameGu: 'પ્રમાણપત્રો', nameEn: 'Certificates', officerName: 'એમ. આર. રાવળ', services: ['income', 'caste'] },
          { number: 3, nameGu: 'પુરવઠા વિતરણ', nameEn: 'Supplies', officerName: 'બી. એસ. પ્રજાપતિ', services: ['ration'] },
          { number: 4, nameGu: 'ઈ-ધરા ૭/૧૨', nameEn: 'E-Dhara', officerName: 'વી. ટી. પટેલ', services: ['land', 'ikhedut'] },
          { number: 5, nameGu: 'આધાર કેન્દ્ર', nameEn: 'Aadhaar', officerName: 'જે. એસ. ચૌહાણ', services: ['aadhaar'] },
          { number: 6, nameGu: 'આવાસ સેવાઓ', nameEn: 'Housing', officerName: 'ડી. એન. પંડ્યા', services: ['awas'] }
        ]
      },
      {
        id: 'sanand',
        nameGu: 'સાણંદ',
        nameEn: 'Sanand',
        officeNameGu: 'જન સેવા કેન્દ્ર • મામલતદાર કચેરી સાણંદ',
        officeNameEn: 'Jan Seva Kendra • Mamlatdar Office Sanand',
        counters: [
          { number: 1, nameGu: 'સમાજ કલ્યાણ', nameEn: 'Welfare', officerName: 'કે. બી. વાઘેલા', services: ['welfare'] },
          { number: 2, nameGu: 'દાખલા બારી', nameEn: 'Certificates', officerName: 'એન. પી. જોશી', services: ['income', 'caste'] },
          { number: 3, nameGu: 'રેશનકાર્ડ', nameEn: 'Ration', officerName: 'એસ. એમ. પટેલ', services: ['ration'] },
          { number: 4, nameGu: 'ઈ-ધરા ખેતી', nameEn: 'E-Dhara Land', officerName: 'પી. કે. બારોટ', services: ['land', 'ikhedut'] },
          { number: 5, nameGu: 'આધાર ડેસ્ક', nameEn: 'Aadhaar', officerName: 'એ. આર. પરમાર', services: ['aadhaar'] },
          { number: 6, nameGu: 'સામાન્ય સેવાઓ', nameEn: 'General', officerName: 'ટી. જે. વણકર', services: ['general'] }
        ]
      }
    ]
  },
  {
    id: 'surat',
    nameGu: 'સુરત',
    nameEn: 'Surat',
    headquarters: 'સુરત',
    talukas: [
      {
        id: 'surat-city',
        nameGu: 'સુરત શહેર (મજૂરા)',
        nameEn: 'Surat City (Majura)',
        officeNameGu: 'જન સેવા કેન્દ્ર • મામલતદાર કચેરી મજૂરા સુરત',
        officeNameEn: 'Jan Seva Kendra • Mamlatdar Office Majura Surat',
        counters: [
          { number: 1, nameGu: 'સમાજ સુરક્ષા & પેન્શન', nameEn: 'Social Security', officerName: 'જે. કે. મોદી', services: ['welfare'] },
          { number: 2, nameGu: 'આવક/જાતિ પ્રમાણપત્રો', nameEn: 'Certificates', officerName: 'વી. એમ. પટેલ', services: ['income', 'caste'] },
          { number: 3, nameGu: 'રેશનકાર્ડ ડેસ્ક', nameEn: 'Ration Desk', officerName: 'એચ. પી. કાપડિયા', services: ['ration'] },
          { number: 4, nameGu: 'જમીન મહેસૂલ શાખા', nameEn: 'Revenue Desk', officerName: 'ડી. એલ. ચૌધરી', services: ['land'] },
          { number: 5, nameGu: 'બાયોમેટ્રિક આધાર', nameEn: 'Aadhaar Desk', officerName: 'એસ. એન. ગામીત', services: ['aadhaar'] },
          { number: 6, nameGu: 'શહેરી આવાસ (PMAY)', nameEn: 'PMAY Urban', officerName: 'પી. આર. ગાંધી', services: ['awas'] }
        ]
      },
      {
        id: 'bardoli',
        nameGu: 'બારડોલી',
        nameEn: 'Bardoli',
        officeNameGu: 'જન સેવા કેન્દ્ર • મામલતદાર કચેરી બારડોલી',
        officeNameEn: 'Jan Seva Kendra • Mamlatdar Office Bardoli',
        counters: [
          { number: 1, nameGu: 'સમાજ કલ્યાણ', nameEn: 'Welfare', officerName: 'એન. બી. પટેલ', services: ['welfare'] },
          { number: 2, nameGu: 'પ્રમાણપત્ર વિતરણ', nameEn: 'Certificates', officerName: 'કે. આર. રાઠોડ', services: ['income', 'caste'] },
          { number: 3, nameGu: 'પુરવઠા સેવા', nameEn: 'Supplies', officerName: 'આર. ટી. વસાવા', services: ['ration'] },
          { number: 4, nameGu: 'ઈ-ધરા ૭/૧૨ ખેતી', nameEn: 'E-Dhara Land', officerName: 'એમ. પી. દેસાઈ', services: ['land', 'ikhedut'] },
          { number: 5, nameGu: 'આધાર કેન્દ્ર', nameEn: 'Aadhaar', officerName: 'જે. એચ. મહેતા', services: ['aadhaar'] },
          { number: 6, nameGu: 'આવાસ યોજના', nameEn: 'Housing', officerName: 'એસ. કે. હળપતિ', services: ['awas'] }
        ]
      }
    ]
  },
  {
    id: 'vadodara',
    nameGu: 'વડોદરા',
    nameEn: 'Vadodara',
    headquarters: 'વડોદરા',
    talukas: [
      {
        id: 'vadodara-west',
        nameGu: 'વડોદરા પશ્ચિમ (અકોટા)',
        nameEn: 'Vadodara West (Akota)',
        officeNameGu: 'જન સેવા કેન્દ્ર • મામલતદાર કચેરી અકોટા વડોદરા',
        officeNameEn: 'Jan Seva Kendra • Mamlatdar Office Akota Vadodara',
        counters: [
          { number: 1, nameGu: 'સમાજ કલ્યાણ પેન્શન', nameEn: 'Welfare', officerName: 'એ. એમ. પઠાણ', services: ['welfare'] },
          { number: 2, nameGu: 'પ્રમાણપત્રો (આવક/જાતિ)', nameEn: 'Certificates', officerName: 'કે. પી. પંડ્યા', services: ['income', 'caste'] },
          { number: 3, nameGu: 'રેશનકાર્ડ શાખા', nameEn: 'Ration', officerName: 'વી. એસ. શાહ', services: ['ration'] },
          { number: 4, nameGu: 'મહેસૂલ & ઈ-ધરા', nameEn: 'E-Dhara', officerName: 'પી. એન. જોષી', services: ['land'] },
          { number: 5, nameGu: 'આધાર બાયોમેટ્રિક', nameEn: 'Aadhaar', officerName: 'આર. કે. પરમાર', services: ['aadhaar'] },
          { number: 6, nameGu: 'આવાસ & જનરલ', nameEn: 'Housing Desk', officerName: 'એસ. એલ. દરબાર', services: ['awas'] }
        ]
      }
    ]
  },
  {
    id: 'gandhinagar',
    nameGu: 'ગાંધીનગર',
    nameEn: 'Gandhinagar',
    headquarters: 'ગાંધીનગર',
    talukas: [
      {
        id: 'gandhinagar-city',
        nameGu: 'ગાંધીનગર શહેર',
        nameEn: 'Gandhinagar City',
        officeNameGu: 'જન સેવા કેન્દ્ર • કલેક્ટર કચેરી સંકુલ ગાંધીનગર',
        officeNameEn: 'Jan Seva Kendra • Collectorate Complex Gandhinagar',
        counters: [
          { number: 1, nameGu: 'સમાજ સુરક્ષા શાખા', nameEn: 'Social Welfare', officerName: 'એચ. એન. બ્રહ્મભટ્ટ', services: ['welfare'] },
          { number: 2, nameGu: 'ડિજિટલ પ્રમાણપત્રો', nameEn: 'Digital Certificates', officerName: 'જે. આર. ચૌધરી', services: ['income', 'caste'] },
          { number: 3, nameGu: 'અન્ન & નાગરિક પુરવઠા', nameEn: 'Food Supplies', officerName: 'કે. કે. પટેલ', services: ['ration'] },
          { number: 4, nameGu: 'ઈ-ધરા & જમીન સુધારણા', nameEn: 'E-Dhara Land', officerName: 'વી. બી. પ્રજાપતિ', services: ['land', 'ikhedut'] },
          { number: 5, nameGu: 'UIDAI આધાર કેન્દ્ર', nameEn: 'UIDAI Center', officerName: 'પી. એમ. રાવળ', services: ['aadhaar'] },
          { number: 6, nameGu: 'સ્ટેટ પ્રોટોકોલ & આવાસ', nameEn: 'State Housing Desk', officerName: 'એમ. ટી. વાઘેલા', services: ['awas'] }
        ]
      }
    ]
  },
  {
    id: 'bhavnagar',
    nameGu: 'ભાવનગર',
    nameEn: 'Bhavnagar',
    headquarters: 'ભાવનગર',
    talukas: [
      {
        id: 'bhavnagar-city',
        nameGu: 'ભાવનગર શહેર',
        nameEn: 'Bhavnagar City',
        officeNameGu: 'જન સેવા કેન્દ્ર • મામલતદાર કચેરી ભાવનગર',
        officeNameEn: 'Jan Seva Kendra • Mamlatdar Office Bhavnagar',
        counters: [
          { number: 1, nameGu: 'સમાજ કલ્યાણ', nameEn: 'Social Welfare', officerName: 'ડી. પી. ગોહિલ', services: ['welfare'] },
          { number: 2, nameGu: 'આવક/જાતિ દાખલા', nameEn: 'Certificates', officerName: 'કે. એલ. જાડેજા', services: ['income', 'caste'] },
          { number: 3, nameGu: 'રેશનકાર્ડ શાખા', nameEn: 'Ration Supplies', officerName: 'એન. વી. ત્રિવેદી', services: ['ration'] },
          { number: 4, nameGu: 'ઈ-ધરા ૭/૧૨', nameEn: 'E-Dhara', officerName: 'આર. એમ. મોરી', services: ['land', 'ikhedut'] },
          { number: 5, nameGu: 'આધાર ડેસ્ક', nameEn: 'Aadhaar Desk', officerName: 'પી. જે. સરવૈયા', services: ['aadhaar'] },
          { number: 6, nameGu: 'આવાસ સહાય', nameEn: 'Housing Desk', officerName: 'એસ. ટી. કાંબડ', services: ['awas'] }
        ]
      }
    ]
  },
  {
    id: 'jamnagar',
    nameGu: 'જામનગર',
    nameEn: 'Jamnagar',
    headquarters: 'જામનગર',
    talukas: [
      {
        id: 'jamnagar-city',
        nameGu: 'જામનગર શહેર',
        nameEn: 'Jamnagar City',
        officeNameGu: 'જન સેવા કેન્દ્ર • લાલ બંગલો મામલતદાર કચેરી જામનગર',
        officeNameEn: 'Jan Seva Kendra • Lal Bunglow Mamlatdar Jamnagar',
        counters: [
          { number: 1, nameGu: 'સમાજ કલ્યાણ', nameEn: 'Welfare', officerName: 'એમ. કે. જાડેજા', services: ['welfare'] },
          { number: 2, nameGu: 'દાખલા બારી', nameEn: 'Certificates', officerName: 'પી. એન. ભટ્ટ', services: ['income', 'caste'] },
          { number: 3, nameGu: 'પુરવઠા', nameEn: 'Supplies', officerName: 'આર. કે. પટેલ', services: ['ration'] },
          { number: 4, nameGu: 'ઈ-ધરા', nameEn: 'E-Dhara', officerName: 'જે. એસ. વાળા', services: ['land', 'ikhedut'] },
          { number: 5, nameGu: 'આધાર કેન્દ્ર', nameEn: 'Aadhaar', officerName: 'વી. એમ. સોઢા', services: ['aadhaar'] },
          { number: 6, nameGu: 'આવાસ યોજના', nameEn: 'Housing', officerName: 'કે. એચ. ચુડાસમા', services: ['awas'] }
        ]
      }
    ]
  },
  {
    id: 'junagadh',
    nameGu: 'જૂનાગઢ',
    nameEn: 'Junagadh',
    headquarters: 'જૂનાગઢ',
    talukas: [
      {
        id: 'junagadh-city',
        nameGu: 'જૂનાગઢ શહેર',
        nameEn: 'Junagadh City',
        officeNameGu: 'જન સેવા કેન્દ્ર • મામલતદાર કચેરી જૂનાગઢ',
        officeNameEn: 'Jan Seva Kendra • Mamlatdar Office Junagadh',
        counters: [
          { number: 1, nameGu: 'સમાજ સુરક્ષા', nameEn: 'Welfare', officerName: 'બી. એચ. વાળા', services: ['welfare'] },
          { number: 2, nameGu: 'પ્રમાણપત્રો', nameEn: 'Certificates', officerName: 'કે. વી. સોલંકી', services: ['income', 'caste'] },
          { number: 3, nameGu: 'રેશનકાર્ડ', nameEn: 'Ration', officerName: 'એમ. એન. જોશી', services: ['ration'] },
          { number: 4, nameGu: 'ઈ-ધરા ૭/૧૨', nameEn: 'E-Dhara', officerName: 'આર. પી. ચાવડા', services: ['land', 'ikhedut'] },
          { number: 5, nameGu: 'આધાર ડેસ્ક', nameEn: 'Aadhaar', officerName: 'એ. કે. બાંભણિયા', services: ['aadhaar'] },
          { number: 6, nameGu: 'આવાસ સહાય', nameEn: 'Housing', officerName: 'એસ. એમ. પરમાર', services: ['awas'] }
        ]
      }
    ]
  },
  {
    id: 'kutch',
    nameGu: 'કચ્છ',
    nameEn: 'Kutch',
    headquarters: 'ભુજ',
    talukas: [
      {
        id: 'bhuj',
        nameGu: 'ભુજ',
        nameEn: 'Bhuj',
        officeNameGu: 'જન સેવા કેન્દ્ર • મામલતદાર કચેરી ભુજ-કચ્છ',
        officeNameEn: 'Jan Seva Kendra • Mamlatdar Office Bhuj-Kutch',
        counters: [
          { number: 1, nameGu: 'સમાજ કલ્યાણ & સરહદી સહાય', nameEn: 'Welfare & Border Grants', officerName: 'એ. જે. જાડેજા', services: ['welfare'] },
          { number: 2, nameGu: 'આવક/જાતિ પ્રમાણપત્રો', nameEn: 'Certificates', officerName: 'કે. એમ. મહેશ્વરી', services: ['income', 'caste'] },
          { number: 3, nameGu: 'પુરવઠા સેવા', nameEn: 'Supplies', officerName: 'વી. ટી. ગઢવી', services: ['ration'] },
          { number: 4, nameGu: 'ઈ-ધરા જમીન મહેસૂલ', nameEn: 'E-Dhara Land', officerName: 'પી. એલ. આહીર', services: ['land', 'ikhedut'] },
          { number: 5, nameGu: 'બાયોમેટ્રિક આધાર', nameEn: 'Aadhaar', officerName: 'એચ. કે. છાંગા', services: ['aadhaar'] },
          { number: 6, nameGu: 'કચ્છ આવાસ પુનર્વસન', nameEn: 'Housing Desk', officerName: 'એન. એસ. ભટ્ટી', services: ['awas'] }
        ]
      }
    ]
  },
  {
    id: 'anand',
    nameGu: 'આણંદ',
    nameEn: 'Anand',
    headquarters: 'આણંદ',
    talukas: [
      {
        id: 'anand-city',
        nameGu: 'આણંદ',
        nameEn: 'Anand',
        officeNameGu: 'જન સેવા કેન્દ્ર • મામલતદાર કચેરી આણંદ',
        officeNameEn: 'Jan Seva Kendra • Mamlatdar Office Anand',
        counters: [
          { number: 1, nameGu: 'સમાજ કલ્યાણ', nameEn: 'Welfare', officerName: 'આર. એમ. પટેલ', services: ['welfare'] },
          { number: 2, nameGu: 'પ્રમાણપત્રો', nameEn: 'Certificates', officerName: 'કે. કે. સોલંકી', services: ['income', 'caste'] },
          { number: 3, nameGu: 'રેશનકાર્ડ', nameEn: 'Ration', officerName: 'જે. પી. પરમાર', services: ['ration'] },
          { number: 4, nameGu: 'ઈ-ધરા ૭/૧૨', nameEn: 'E-Dhara', officerName: 'વી. એન. પંડ્યા', services: ['land', 'ikhedut'] },
          { number: 5, nameGu: 'આધાર ડેસ્ક', nameEn: 'Aadhaar', officerName: 'એસ. બી. શાહ', services: ['aadhaar'] },
          { number: 6, nameGu: 'આવાસ ડેસ્ક', nameEn: 'Housing', officerName: 'એમ. એચ. રોહિત', services: ['awas'] }
        ]
      }
    ]
  },
  {
    id: 'mehsana',
    nameGu: 'મહેસાણા',
    nameEn: 'Mehsana',
    headquarters: 'મહેસાણા',
    talukas: [
      {
        id: 'mehsana-city',
        nameGu: 'મહેસાણા',
        nameEn: 'Mehsana',
        officeNameGu: 'જન સેવા કેન્દ્ર • મામલતદાર કચેરી મહેસાણા',
        officeNameEn: 'Jan Seva Kendra • Mamlatdar Office Mehsana',
        counters: [
          { number: 1, nameGu: 'સમાજ કલ્યાણ', nameEn: 'Welfare', officerName: 'પી. કે. ચૌધરી', services: ['welfare'] },
          { number: 2, nameGu: 'દાખલા બારી', nameEn: 'Certificates', officerName: 'એન. જે. પટેલ', services: ['income', 'caste'] },
          { number: 3, nameGu: 'પુરવઠા', nameEn: 'Supplies', officerName: 'કે. વી. પ્રજાપતિ', services: ['ration'] },
          { number: 4, nameGu: 'ઈ-ધરા ખેતીવાડી', nameEn: 'E-Dhara', officerName: 'આર. બી. વ્યાસ', services: ['land', 'ikhedut'] },
          { number: 5, nameGu: 'આધાર કેન્દ્ર', nameEn: 'Aadhaar', officerName: 'એ. ટી. રાવળ', services: ['aadhaar'] },
          { number: 6, nameGu: 'આવાસ સેવા', nameEn: 'Housing', officerName: 'બી. એમ. ઠાકોર', services: ['awas'] }
        ]
      }
    ]
  },
  {
    id: 'banaskantha',
    nameGu: 'બનાસકાંઠા',
    nameEn: 'Banaskantha',
    headquarters: 'પાલનપુર',
    talukas: [
      {
        id: 'palanpur',
        nameGu: 'પાલનપુર',
        nameEn: 'Palanpur',
        officeNameGu: 'જન સેવા કેન્દ્ર • મામલતદાર કચેરી પાલનપુર',
        officeNameEn: 'Jan Seva Kendra • Mamlatdar Office Palanpur',
        counters: [
          { number: 1, nameGu: 'સમાજ સુરક્ષા & આદિજાતિ', nameEn: 'Social Welfare', officerName: 'વી. કે. જોશી', services: ['welfare'] },
          { number: 2, nameGu: 'આવક/જાતિ પ્રમાણપત્રો', nameEn: 'Certificates', officerName: 'એમ. પી. ચૌધરી', services: ['income', 'caste'] },
          { number: 3, nameGu: 'પુરવઠા શાખા', nameEn: 'Food Supplies', officerName: 'આર. એસ. રાજપૂત', services: ['ration'] },
          { number: 4, nameGu: 'ઈ-ધરા ૭/૧૨ કિસાન', nameEn: 'E-Dhara Land', officerName: 'જે. એન. પટેલ', services: ['land', 'ikhedut'] },
          { number: 5, nameGu: 'આધાર બાયોમેટ્રિક', nameEn: 'Aadhaar', officerName: 'કે. એલ. બારોટ', services: ['aadhaar'] },
          { number: 6, nameGu: 'પીએમ આવાસ ગ્રામીણ', nameEn: 'PMAY Gramin', officerName: 'એસ. ડી. વાઘેલા', services: ['awas'] }
        ]
      }
    ]
  },
  {
    id: 'morbi',
    nameGu: 'મોરબી',
    nameEn: 'Morbi',
    headquarters: 'મોરબી',
    talukas: [
      {
        id: 'morbi-city',
        nameGu: 'મોરબી',
        nameEn: 'Morbi',
        officeNameGu: 'જન સેવા કેન્દ્ર • મામલતદાર કચેરી મોરબી',
        officeNameEn: 'Jan Seva Kendra • Mamlatdar Office Morbi',
        counters: [
          { number: 1, nameGu: 'સમાજ કલ્યાણ', nameEn: 'Welfare', officerName: 'કે. એચ. પટેલ', services: ['welfare'] },
          { number: 2, nameGu: 'પ્રમાણપત્રો', nameEn: 'Certificates', officerName: 'આર. વી. ઝાલા', services: ['income', 'caste'] },
          { number: 3, nameGu: 'પુરવઠા ડેસ્ક', nameEn: 'Supplies', officerName: 'એમ. એસ. ડાભી', services: ['ration'] },
          { number: 4, nameGu: 'ઈ-ધરા ૭/૧૨', nameEn: 'E-Dhara', officerName: 'એન. પી. કાલરિયા', services: ['land', 'ikhedut'] },
          { number: 5, nameGu: 'આધાર કેન્દ્ર', nameEn: 'Aadhaar', officerName: 'પી. કે. જાડેજા', services: ['aadhaar'] },
          { number: 6, nameGu: 'આવાસ સેવાઓ', nameEn: 'Housing', officerName: 'વી. એલ. વડગામા', services: ['awas'] }
        ]
      }
    ]
  },
  {
    id: 'surendranagar',
    nameGu: 'સુરેન્દ્રનગર',
    nameEn: 'Surendranagar',
    headquarters: 'સુરેન્દ્રનગર',
    talukas: [
      {
        id: 'wadhwan',
        nameGu: 'વઢવાણ',
        nameEn: 'Wadhwan',
        officeNameGu: 'જન સેવા કેન્દ્ર • મામલતદાર કચેરી વઢવાણ',
        officeNameEn: 'Jan Seva Kendra • Mamlatdar Office Wadhwan',
        counters: [
          { number: 1, nameGu: 'સમાજ કલ્યાણ', nameEn: 'Welfare', officerName: 'એચ. એમ. રાણા', services: ['welfare'] },
          { number: 2, nameGu: 'પ્રમાણપત્રો', nameEn: 'Certificates', officerName: 'કે. બી. મકવાણા', services: ['income', 'caste'] },
          { number: 3, nameGu: 'પુરવઠા', nameEn: 'Supplies', officerName: 'જે. આર. મોરી', services: ['ration'] },
          { number: 4, nameGu: 'ઈ-ધરા ૭/૧૨', nameEn: 'E-Dhara', officerName: 'એસ. એન. પરમાર', services: ['land', 'ikhedut'] },
          { number: 5, nameGu: 'આધાર ડેસ્ક', nameEn: 'Aadhaar', officerName: 'બી. ટી. પંડ્યા', services: ['aadhaar'] },
          { number: 6, nameGu: 'આવાસ યોજના', nameEn: 'Housing', officerName: 'એ. પી. શાહ', services: ['awas'] }
        ]
      }
    ]
  },
  {
    id: 'amreli',
    nameGu: 'અમરેલી',
    nameEn: 'Amreli',
    headquarters: 'અમરેલી',
    talukas: [
      {
        id: 'amreli-city',
        nameGu: 'અમરેલી',
        nameEn: 'Amreli',
        officeNameGu: 'જન સેવા કેન્દ્ર • મામલતદાર કચેરી અમરેલી',
        officeNameEn: 'Jan Seva Kendra • Mamlatdar Office Amreli',
        counters: [
          { number: 1, nameGu: 'સમાજ કલ્યાણ', nameEn: 'Welfare', officerName: 'એમ. આર. ભુવા', services: ['welfare'] },
          { number: 2, nameGu: 'દાખલા બારી', nameEn: 'Certificates', officerName: 'વી. કે. ગોંડલિયા', services: ['income', 'caste'] },
          { number: 3, nameGu: 'પુરવઠા', nameEn: 'Supplies', officerName: 'પી. એસ. કાછડિયા', services: ['ration'] },
          { number: 4, nameGu: 'ઈ-ધરા ૭/૧૨', nameEn: 'E-Dhara', officerName: 'કે. ટી. વઘાસિયા', services: ['land', 'ikhedut'] },
          { number: 5, nameGu: 'આધાર કેન્દ્ર', nameEn: 'Aadhaar', officerName: 'એન. એમ. સાવલિયા', services: ['aadhaar'] },
          { number: 6, nameGu: 'આવાસ સેવા', nameEn: 'Housing', officerName: 'આર. ડી. સુહાગિયા', services: ['awas'] }
        ]
      }
    ]
  },
  {
    id: 'navsari',
    nameGu: 'નવસારી',
    nameEn: 'Navsari',
    headquarters: 'નવસારી',
    talukas: [
      {
        id: 'navsari-city',
        nameGu: 'નવસારી',
        nameEn: 'Navsari',
        officeNameGu: 'જન સેવા કેન્દ્ર • મામલતદાર કચેરી નવસારી',
        officeNameEn: 'Jan Seva Kendra • Mamlatdar Office Navsari',
        counters: [
          { number: 1, nameGu: 'સમાજ સુરક્ષા', nameEn: 'Welfare', officerName: 'જે. એમ. હળપતિ', services: ['welfare'] },
          { number: 2, nameGu: 'પ્રમાણપત્રો', nameEn: 'Certificates', officerName: 'કે. પી. પટેલ', services: ['income', 'caste'] },
          { number: 3, nameGu: 'પુરવઠા ડેસ્ક', nameEn: 'Supplies', officerName: 'આર. બી. નાયક', services: ['ration'] },
          { number: 4, nameGu: 'ઈ-ધરા ૭/૧૨', nameEn: 'E-Dhara', officerName: 'એચ. એન. દેસાઈ', services: ['land', 'ikhedut'] },
          { number: 5, nameGu: 'આધાર કેન્દ્ર', nameEn: 'Aadhaar', officerName: 'વી. એલ. રાઠોડ', services: ['aadhaar'] },
          { number: 6, nameGu: 'આવાસ સેવાઓ', nameEn: 'Housing', officerName: 'એમ. એસ. વસાવા', services: ['awas'] }
        ]
      }
    ]
  },
  {
    id: 'valsad',
    nameGu: 'વલસાડ',
    nameEn: 'Valsad',
    headquarters: 'વલસાડ',
    talukas: [
      {
        id: 'valsad-city',
        nameGu: 'વલસાડ',
        nameEn: 'Valsad',
        officeNameGu: 'જન સેવા કેન્દ્ર • મામલતદાર કચેરી વલસાડ',
        officeNameEn: 'Jan Seva Kendra • Mamlatdar Office Valsad',
        counters: [
          { number: 1, nameGu: 'સમાજ કલ્યાણ', nameEn: 'Welfare', officerName: 'એન. કે. પટેલ', services: ['welfare'] },
          { number: 2, nameGu: 'દાખલા બારી', nameEn: 'Certificates', officerName: 'પી. એમ. ભંડારી', services: ['income', 'caste'] },
          { number: 3, nameGu: 'પુરવઠા શાખા', nameEn: 'Supplies', officerName: 'એસ. ટી. ચૌધરી', services: ['ration'] },
          { number: 4, nameGu: 'ઈ-ધરા ૭/૧૨', nameEn: 'E-Dhara', officerName: 'કે. જે. દેસાઈ', services: ['land', 'ikhedut'] },
          { number: 5, nameGu: 'આધાર ડેસ્ક', nameEn: 'Aadhaar', officerName: 'આર. એચ. આહીર', services: ['aadhaar'] },
          { number: 6, nameGu: 'આવાસ ડેસ્ક', nameEn: 'Housing', officerName: 'બી. પી. ટંડેલ', services: ['awas'] }
        ]
      }
    ]
  },
  {
    id: 'kheda',
    nameGu: 'ખેડા',
    nameEn: 'Kheda',
    headquarters: 'નડિયાદ',
    talukas: [
      {
        id: 'nadiad',
        nameGu: 'નડિયાદ',
        nameEn: 'Nadiad',
        officeNameGu: 'જન સેવા કેન્દ્ર • મામલતદાર કચેરી નડિયાદ',
        officeNameEn: 'Jan Seva Kendra • Mamlatdar Office Nadiad',
        counters: [
          { number: 1, nameGu: 'સમાજ કલ્યાણ', nameEn: 'Welfare', officerName: 'એ. કે. વાઘેલા', services: ['welfare'] },
          { number: 2, nameGu: 'પ્રમાણપત્રો', nameEn: 'Certificates', officerName: 'કે. આર. જોશી', services: ['income', 'caste'] },
          { number: 3, nameGu: 'રેશનકાર્ડ', nameEn: 'Ration', officerName: 'એમ. પી. પટેલ', services: ['ration'] },
          { number: 4, nameGu: 'ઈ-ધરા', nameEn: 'E-Dhara', officerName: 'વી. જે. શાહ', services: ['land', 'ikhedut'] },
          { number: 5, nameGu: 'આધાર', nameEn: 'Aadhaar', officerName: 'પી. ડી. ચૌહાણ', services: ['aadhaar'] },
          { number: 6, nameGu: 'આવાસ', nameEn: 'Housing', officerName: 'એસ. એન. રાવળ', services: ['awas'] }
        ]
      }
    ]
  },
  {
    id: 'patan',
    nameGu: 'પાટણ',
    nameEn: 'Patan',
    headquarters: 'પાટણ',
    talukas: [
      {
        id: 'patan-city',
        nameGu: 'પાટણ',
        nameEn: 'Patan',
        officeNameGu: 'જન સેવા કેન્દ્ર • મામલતદાર કચેરી પાટણ',
        officeNameEn: 'Jan Seva Kendra • Mamlatdar Office Patan',
        counters: [
          { number: 1, nameGu: 'સમાજ સુરક્ષા', nameEn: 'Welfare', officerName: 'આર. કે. પ્રજાપતિ', services: ['welfare'] },
          { number: 2, nameGu: 'પ્રમાણપત્રો', nameEn: 'Certificates', officerName: 'કે. એમ. પટેલ', services: ['income', 'caste'] },
          { number: 3, nameGu: 'પુરવઠા', nameEn: 'Supplies', officerName: 'એન. એસ. ઠાકોર', services: ['ration'] },
          { number: 4, nameGu: 'ઈ-ધરા', nameEn: 'E-Dhara', officerName: 'જે. વી. મોદી', services: ['land', 'ikhedut'] },
          { number: 5, nameGu: 'આધાર', nameEn: 'Aadhaar', officerName: 'વી. ટી. જોશી', services: ['aadhaar'] },
          { number: 6, nameGu: 'આવાસ', nameEn: 'Housing', officerName: 'પી. એચ. દવે', services: ['awas'] }
        ]
      }
    ]
  },
  {
    id: 'porbandar',
    nameGu: 'પોરબંદર',
    nameEn: 'Porbandar',
    headquarters: 'પોરબંદર',
    talukas: [
      {
        id: 'porbandar-city',
        nameGu: 'પોરબંદર',
        nameEn: 'Porbandar',
        officeNameGu: 'જન સેવા કેન્દ્ર • મામલતદાર કચેરી પોરબંદર',
        officeNameEn: 'Jan Seva Kendra • Mamlatdar Office Porbandar',
        counters: [
          { number: 1, nameGu: 'સમાજ કલ્યાણ', nameEn: 'Welfare', officerName: 'એચ. પી. ઓડેદરા', services: ['welfare'] },
          { number: 2, nameGu: 'દાખલા બારી', nameEn: 'Certificates', officerName: 'કે. એન. મોઢવાડિયા', services: ['income', 'caste'] },
          { number: 3, nameGu: 'પુરવઠા', nameEn: 'Supplies', officerName: 'વી. આર. જાડેજા', services: ['ration'] },
          { number: 4, nameGu: 'ઈ-ધરા ૭/૧૨', nameEn: 'E-Dhara', officerName: 'એમ. કે. બોખીરિયા', services: ['land', 'ikhedut'] },
          { number: 5, nameGu: 'આધાર ડેસ્ક', nameEn: 'Aadhaar', officerName: 'જે. એસ. કુછડિયા', services: ['aadhaar'] },
          { number: 6, nameGu: 'આવાસ ડેસ્ક', nameEn: 'Housing', officerName: 'પી. ટી. કારાવદરા', services: ['awas'] }
        ]
      }
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

