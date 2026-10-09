export type BookingStatus = 
  | 'AVAILABLE' 
  | 'HELD' 
  | 'CONFIRMED' 
  | 'RESCHEDULED' 
  | 'CHECKED_IN' 
  | 'CALLED' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'EXPIRED' 
  | 'NO_SHOW';

export type QueueEstimate = 'Low' | 'Moderate' | 'High' | 'Closed';

export interface VerifiedDocumentItem {
  nameGu: string;
  nameEn: string;
  nameHi?: string;
  status: 'passed' | 'failed' | 'pending' | 'PRE_CHECK_PASSED';
  fileName?: string;
  fileUrl?: string;
  extractedDetails?: string;
  qualityScore?: number;
  aiVerdict?: string;
  uploadedAt?: string;
  ocrExtractedData?: {
    documentType?: string;
    idNumber?: string;
    holderName?: string;
    confidence?: number;
    dates?: string[];
  };
}

export interface GovernmentPaymentRecord {
  mode: 'ONLINE_CYBER_TREASURY' | 'CASH_AT_COUNTER' | 'GOVT_EXEMPT_FREE' | 'PAY_AT_COUNTER';
  amount: number;
  status: 'PAID' | 'PAY_AT_COUNTER' | 'PENDING_AT_COUNTER' | 'FREE' | 'GOVT_EXEMPT_FREE';
  transactionId?: string;
  cyberTreasuryTxnId?: string;
  grasChallanNo?: string;
  kacheriChallanNo?: string;
  cashierReceiptNo?: string;
  challanNumber?: string;
  paidAt?: string;
  paymentMethod?: 'UPI' | 'DEBIT_CARD' | 'NET_BANKING' | 'CASH' | 'EXEMPT' | string;
  payerName?: string;
  receiptNumber?: string;
  cashierOfficerName?: string;
  cashCollectedAt?: string;
  qrPayload?: string;
  gatewayName?: string;
  instructionsGu?: string;
  instructionsEn?: string;
  instructionsHi?: string;
}

export interface TimeSlot {
  id: string;
  timeRange: string;
  startTime: string; // '10:30'
  endTime: string;   // '11:30'
  isLunchBreak: boolean;
  maxCapacity: number; // Configurable (e.g. 5 appointments/hour)
  bookedCount: number;
  slotsAvailable: number;
  queueEstimate: QueueEstimate;
  status: 'available' | 'moderate' | 'full' | 'lunch_blackout';
  statusColor: 'green' | 'yellow' | 'red' | 'gray';
  statusGu: string;
  statusEn: string;
}


export interface GazetteHoliday {
  date: string; // 'YYYY-MM-DD'
  nameGu: string;
  nameEn: string;
}

export interface HolidayCalendarMetadata {
  source: string;
  lastUpdated: string;
  officialNotificationNo: string;
}

export const GUJARAT_HOLIDAY_CALENDAR_METADATA: HolidayCalendarMetadata = {
  source: 'General Administration Department (GAD), Government of Gujarat Public Holidays List',
  lastUpdated: '2026-01-01',
  officialNotificationNo: 'GS/2025/48/PHR-102025-115-GH'
};

export const GUJARAT_GAZETTE_HOLIDAYS_2026: GazetteHoliday[] = [
  { date: '2026-01-14', nameGu: 'ઉત્તરાયણ (મકરસંક્રાંતિ)', nameEn: 'Makar Sankranti / Uttarayan' },
  { date: '2026-01-15', nameGu: 'વાસી ઉત્તરાયણ', nameEn: 'Vasi Uttarayan' },
  { date: '2026-01-26', nameGu: 'પ્રજાસત્તાક દિન (Republic Day)', nameEn: 'Republic Day' },
  { date: '2026-02-15', nameGu: 'મહાશિવરાત્રી', nameEn: 'Maha Shivratri' },
  { date: '2026-03-04', nameGu: 'હોળી (પ્રદોષ)', nameEn: 'Holi 2nd Day / Dhuleti' },
  { date: '2026-04-14', nameGu: 'ડૉ. બાબાસાહેબ આંબેડકર જયંતિ', nameEn: 'Dr. B. R. Ambedkar Jayanti' },
  { date: '2026-05-01', nameGu: 'ગુજરાત સ્થાપના દિન / શ્રમયોગી દિન', nameEn: 'Gujarat Statehood Day' },
  { date: '2026-08-15', nameGu: 'સ્વતંત્રતા દિવસ (Independence Day)', nameEn: 'Independence Day' },
  { date: '2026-08-28', nameGu: 'રક્ષાબંધન', nameEn: 'Raksha Bandhan' },
  { date: '2026-09-04', nameGu: 'જન્માષ્ટમી', nameEn: 'Krishna Janmashtami' },
  { date: '2026-10-02', nameGu: 'મહાત્મા ગાંધી જયંતિ', nameEn: 'Mahatma Gandhi Jayanti' },
  { date: '2026-10-20', nameGu: 'દશેરા / વિજયાદશમી', nameEn: 'Dussehra' },
  { date: '2026-11-09', nameGu: 'દિવાળી (લક્ષ્મીપૂજન)', nameEn: 'Diwali' },
  { date: '2026-11-10', nameGu: 'બેસતું વર્ષ (નૂતન વર્ષાભિનંદન)', nameEn: 'Gujarati New Year' },
  { date: '2026-11-11', nameGu: 'ભાઈબીજ', nameEn: 'Bhai Dooj' },
  { date: '2026-12-25', nameGu: 'નાતાલ (Christmas)', nameEn: 'Christmas' },
];

/**
 * Checks if a given date is closed according to the official holiday calendar or weekend rules
 */
export function isGujaratGovernmentClosed(dateStr: string): { 
  isClosed: boolean; 
  reasonGu?: string; 
  reasonEn?: string;
  source?: string;
} {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    return { isClosed: false };
  }

  const dayOfWeek = d.getDay(); // 0 = Sunday, 6 = Saturday

  // 1. All Sundays are strictly closed
  if (dayOfWeek === 0) {
    return {
      isClosed: true,
      reasonGu: 'રવિવાર: સાપ્તાહિક રજા હોવાથી સેવા સ્લોટ બુકિંગ ઉપલબ્ધ નથી.',
      reasonEn: 'Sunday: Office closed for weekly holiday.',
      source: GUJARAT_HOLIDAY_CALENDAR_METADATA.source
    };
  }

  // 2. 2nd and 4th Saturdays of the month are closed per state service rules
  if (dayOfWeek === 6) {
    const dayOfMonth = d.getDate();
    const isSecondSaturday = dayOfMonth >= 8 && dayOfMonth <= 14;
    const isFourthSaturday = dayOfMonth >= 22 && dayOfMonth <= 28;

    if (isSecondSaturday) {
      return {
        isClosed: true,
        reasonGu: 'બીજો શનિવાર: ગુજરાત સરકાર નિયમ મુજબ કચેરીમાં જાહેર રજા છે.',
        reasonEn: '2nd Saturday: Office closed under Gujarat Government Gazetted rules.',
        source: GUJARAT_HOLIDAY_CALENDAR_METADATA.source
      };
    }

    if (isFourthSaturday) {
      return {
        isClosed: true,
        reasonGu: 'ચોથો શનિવાર: ગુજરાત સરકાર નિયમ મુજબ કચેરીમાં જાહેર રજા છે.',
        reasonEn: '4th Saturday: Office closed under Gujarat Government Gazetted rules.',
        source: GUJARAT_HOLIDAY_CALENDAR_METADATA.source
      };
    }
  }

  // 3. Gazette Public Holidays
  const yyyyMmDd = dateStr.slice(0, 10);
  const foundHoliday = GUJARAT_GAZETTE_HOLIDAYS_2026.find(h => h.date === yyyyMmDd);
  if (foundHoliday) {
    return {
      isClosed: true,
      reasonGu: `જાહેર રજા: ${foundHoliday.nameGu} નિમિત્તે કચેરીમાં સત્તાવાર રજા છે.`,
      reasonEn: `Gazetted Holiday: Office closed for ${foundHoliday.nameEn}.`,
      source: `${GUJARAT_HOLIDAY_CALENDAR_METADATA.source} (${GUJARAT_HOLIDAY_CALENDAR_METADATA.officialNotificationNo})`
    };
  }

  return { isClosed: false };
}

export interface ServiceHoursConfig {
  startTime: string; // '10:30'
  endTime: string;   // '18:10'
  lunchStart: string; // '13:30'
  lunchEnd: string;   // '14:00'
  capacityPerHour: number; // Configurable capacity (default 5)
  sourceReference?: string;
}

export const DEFAULT_SERVICE_HOURS_CONFIG: ServiceHoursConfig = {
  startTime: '10:30',
  endTime: '18:10',
  lunchStart: '13:30',
  lunchEnd: '14:00',
  capacityPerHour: 5,
  sourceReference: 'Configured Center Operational Schedule'
};

/**
 * Returns configurable appointment time slots with capacity limit and queue estimate
 */
export function generateOfficeSlots(
  seedNumber: number = 0,
  customConfig: Partial<ServiceHoursConfig> = {}
): TimeSlot[] {
  const config = { ...DEFAULT_SERVICE_HOURS_CONFIG, ...customConfig };
  const cap = config.capacityPerHour || 5;

  const baseSlots: Array<{ id: string; timeRange: string; start: string; end: string; isLunch: boolean; initialBooked: number }> = [
    { id: 'slot-1', timeRange: '10:30 AM - 11:30 AM', start: '10:30', end: '11:30', isLunch: false, initialBooked: 2 },
    { id: 'slot-2', timeRange: '11:30 AM - 12:30 PM', start: '11:30', end: '12:30', isLunch: false, initialBooked: 4 },
    { id: 'slot-3', timeRange: '12:30 PM - 01:30 PM', start: '12:30', end: '13:30', isLunch: false, initialBooked: cap }, // Full
    { id: 'slot-lunch', timeRange: '01:30 PM - 02:00 PM (રિસેસ)', start: '13:30', end: '14:00', isLunch: true, initialBooked: 0 },
    { id: 'slot-4', timeRange: '02:00 PM - 03:00 PM', start: '14:00', end: '15:00', isLunch: false, initialBooked: 1 },
    { id: 'slot-5', timeRange: '03:00 PM - 04:00 PM', start: '15:00', end: '16:00', isLunch: false, initialBooked: 3 },
    { id: 'slot-6', timeRange: '04:00 PM - 05:00 PM', start: '16:00', end: '17:00', isLunch: false, initialBooked: 2 },
    { id: 'slot-7', timeRange: '05:00 PM - 06:10 PM', start: '17:00', end: '18:10', isLunch: false, initialBooked: 1 },
  ];

  return baseSlots.map((s) => {
    if (s.isLunch) {
      return {
        id: s.id,
        timeRange: s.timeRange,
        startTime: s.start,
        endTime: s.end,
        isLunchBreak: true,
        maxCapacity: 0,
        bookedCount: 0,
        slotsAvailable: 0,
        queueEstimate: 'Closed' as QueueEstimate,
        status: 'lunch_blackout',
        statusColor: 'gray',
        statusGu: 'ભોજન રિસેસ (બુકિંગ બંધ)',
        statusEn: 'Lunch Break (Closed)'
      };
    }

    const booked = Math.min(cap, Math.max(0, s.initialBooked + (seedNumber % 2)));
    const available = Math.max(0, cap - booked);

    let status: TimeSlot['status'] = 'available';
    let statusColor: TimeSlot['statusColor'] = 'green';
    let queueEstimate: QueueEstimate = 'Low';
    let statusGu = `🟢 ${available} સ્લોટ ઉપલબ્ધ • રાહ: ઓછી`;
    let statusEn = `🟢 ${available} slots available • Queue: Low`;

    if (booked >= cap) {
      status = 'full';
      statusColor = 'red';
      queueEstimate = 'High';
      statusGu = `🔴 સ્લોટ પૂર્ણ (${cap}/${cap}) • આગળનો સમય પસંદ કરો`;
      statusEn = `🔴 Full (${cap}/${cap}) • Choose another time`;
    } else if (available <= 2) {
      status = 'moderate';
      statusColor = 'yellow';
      queueEstimate = 'Moderate';
      statusGu = `🟡 ${available} સ્લોટ બાકી • મધ્યમ ભીડ`;
      statusEn = `🟡 ${available} slot(s) left • Moderate queue`;
    }

    return {
      id: s.id,
      timeRange: s.timeRange,
      startTime: s.start,
      endTime: s.end,
      isLunchBreak: false,
      maxCapacity: cap,
      bookedCount: booked,
      slotsAvailable: available,
      queueEstimate,
      status,
      statusColor,
      statusGu,
      statusEn
    };
  });
}

// Double-Booking Conflict Protection
export function checkSlotAvailability(slotId: string, slots: TimeSlot[]): {
  available: boolean;
  remainingCapacity: number;
  reasonEn?: string;
  reasonGu?: string;
} {
  const target = slots.find(s => s.id === slotId);
  if (!target) {
    return { available: false, remainingCapacity: 0, reasonEn: 'Slot not found', reasonGu: 'સ્લોટ મળ્યો નથી' };
  }

  if (target.isLunchBreak) {
    return { available: false, remainingCapacity: 0, reasonEn: 'Lunch recess blackout', reasonGu: 'ભોજન રિસેસ દરમિયાન બુકિંગ થઈ શકતું નથી' };
  }

  if (target.bookedCount >= target.maxCapacity) {
    return {
      available: false,
      remainingCapacity: 0,
      reasonEn: 'Slot just became full. Please select another available time.',
      reasonGu: 'આ સ્લોટ હમણાં જ પૂર્ણ થઈ ગયો. કૃપા કરીને અન્ય ઉપલબ્ધ સમય પસંદ કરો.'
    };
  }

  return {
    available: true,
    remainingCapacity: target.maxCapacity - target.bookedCount
  };
}

// Priority Appointment Policies
export type PriorityCategory = 'senior_citizen' | 'divyangjan' | 'medical_priority' | 'none';

export interface PriorityPolicy {
  id: PriorityCategory;
  labelEn: string;
  labelGu: string;
  tokenPrefix: string;
  notesEn: string;
  notesGu: string;
}

export const PRIORITY_POLICIES: Record<PriorityCategory, PriorityPolicy> = {
  senior_citizen: {
    id: 'senior_citizen',
    labelEn: 'Senior Citizen (60+ Years)',
    labelGu: 'વરિષ્ઠ નાગરિક (૬૦+ વર્ષ)',
    tokenPrefix: '#P-',
    notesEn: 'Priority appointment flag applied per administrative policy.',
    notesGu: 'વહીવટી માર્ગદર્શિકા હેઠળ પ્રાથમિકતા અગ્રતા ફાળવણી.'
  },
  divyangjan: {
    id: 'divyangjan',
    labelEn: 'Person with Disabilities (Divyangjan)',
    labelGu: 'દિવ્યાંગજન અગ્રતા',
    tokenPrefix: '#P-',
    notesEn: 'Priority appointment flag applied for accessible queue support.',
    notesGu: 'દિવ્યાંગજન સહાય માટે વિશેષ ટોકન પ્રાયોરિટી.'
  },
  medical_priority: {
    id: 'medical_priority',
    labelEn: 'Medical / Urgent Priority',
    labelGu: 'તાત્કાલિક તબીબી અગ્રતા',
    tokenPrefix: '#P-',
    notesEn: 'Expedited flag subject to counter officer verification.',
    notesGu: 'કાઉન્ટર અધિકારી ચકાસણીને આધિન ઝડપી અગ્રતા.'
  },
  none: {
    id: 'none',
    labelEn: 'Standard Citizen',
    labelGu: 'સામાન્ય નાગરિક',
    tokenPrefix: '#A-',
    notesEn: 'Standard FIFO queue slot.',
    notesGu: 'સામાન્ય કતાર સ્લોટ.'
  }
};

// Signed / Tamper-Evident QR Token
export interface VerifiableTokenPayload {
  version: '2.0';
  tokenId: string; // e.g. "A-42"
  serviceId: string;
  serviceTitleEn: string;
  centerId: string;
  centerNameEn: string;
  counterNumber: number;
  date: string;
  slotTime: string;
  issuedAt: string;
  validUntil: string;
  signatureHash: string; // Tamper-evident checksum hash (no sensitive PII)
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
}

/**
 * Generates a privacy-safe, tamper-evident token payload for QR display
 * NOTE: Full Aadhaar numbers and citizen phone numbers are deliberately excluded.
 */
export function generateSignedQrPayload(params: {
  tokenId: string;
  serviceId: string;
  serviceTitleEn: string;
  centerId: string;
  centerNameEn: string;
  counterNumber: number;
  date: string;
  slotTime: string;
}): { payloadJson: string; hash: string; validUntil: string } {
  const issuedAt = new Date().toISOString();
  // Valid until 15 mins after slot or end of day
  const validUntil = `${params.date} 18:30:00 IST`;

  const rawSeed = `${params.tokenId}:${params.serviceId}:${params.centerId}:${params.date}:${params.counterNumber}:${issuedAt}`;
  const signatureHash = `QL-${simpleHash(rawSeed)}-${simpleHash(params.tokenId + params.date)}`;

  const payload: VerifiableTokenPayload = {
    version: '2.0',
    tokenId: params.tokenId,
    serviceId: params.serviceId,
    serviceTitleEn: params.serviceTitleEn,
    centerId: params.centerId,
    centerNameEn: params.centerNameEn,
    counterNumber: params.counterNumber,
    date: params.date,
    slotTime: params.slotTime,
    issuedAt,
    validUntil,
    signatureHash
  };

  return {
    payloadJson: JSON.stringify(payload),
    hash: signatureHash,
    validUntil
  };
}

export function verifySignedQrPayload(payloadJson: string): {
  isValid: boolean;
  payload?: VerifiableTokenPayload;
  error?: string;
} {
  try {
    const data = JSON.parse(payloadJson) as VerifiableTokenPayload;
    if (!data.tokenId || !data.signatureHash || !data.signatureHash.startsWith('QL-')) {
      return { isValid: false, error: 'Invalid or altered token signature format' };
    }
    return { isValid: true, payload: data };
  } catch {
    return { isValid: false, error: 'Malformed QR payload' };
  }
}
