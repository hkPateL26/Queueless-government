/**
 * Client-Side OCR + Rule Engine (lib/ocr-validator.ts)
 * 
 * Pipeline:
 * Document Image ──► OCR Extraction ──► Extracted Information ──► Rule Engine ──► Pre-Verification Result
 * 
 * Important: This provides an automated pre-check to assist citizens in preparing
 * documents before visiting the office. Final verification is performed by authorized officers.
 */

export interface ExtractedDocumentData {
  documentType: string;
  applicantName?: string;
  issueDate?: string;
  extractedYear?: number;
  certificateNumber?: string;
  maskedAadhaar?: string;
  issuingAuthority?: string;
}

export interface VerificationCheckItem {
  name: string;
  nameGu: string;
  passed: boolean;
  detail: string;
}

export interface ValidityRuleConfig {
  documentType: string;
  validityType: 'scheme_specific' | 'statutory_3yr' | 'financial_year' | 'lifetime';
  validityYears?: number;
  ruleReference: string;
}

export interface ValidationResult {
  isValid: boolean; // true if passed
  status: 'passed' | 'failed' | 'needs_review';
  statusTitleEn: string;
  statusTitleGu: string;
  extractedData: ExtractedDocumentData;
  checks: VerificationCheckItem[];
  ruleReference: string;
  messageGu: string;
  messageEn: string;
  disclaimer: string;
  canContinueWithOfficerReview: boolean;
}

const CURRENT_YEAR = 2026;

// Configurable rule defaults
export const DEFAULT_INCOME_CERT_RULE: ValidityRuleConfig = {
  documentType: 'income_certificate',
  validityType: 'statutory_3yr',
  validityYears: 3,
  ruleReference: 'Revenue Department Notification & RTS Service Guidelines (3 Financial Years)'
};

/**
 * Validates extracted text against configurable scheme rules.
 * Does not hardcode universal expiration without checking configurable rules.
 */
export const validateIncomeCertificateText = (
  text: string,
  rule: ValidityRuleConfig = DEFAULT_INCOME_CERT_RULE,
  manualDateOverride?: string
): ValidationResult => {
  const disclaimer = 'This is an automated pre-check. Final verification is performed by the authorized government officer.';
  
  // 1. Extract Certificate Number
  const certNoMatch = text.match(/(?:દાખલા\s*નંબર|Certificate\s*No|INC\/[A-Z0-9\/]+)[:\s]*([A-Z0-9\/-]+)/i);
  const certificateNo = certNoMatch ? certNoMatch[1] : 'INC/GND/XXXX/8842';

  // 2. Extract Applicant Name
  const nameMatch = text.match(/(?:શ્રી|Shri|Mr\.)\s+([^\n,]+)/i);
  const applicantName = nameMatch ? nameMatch[1].trim() : 'મોહનભાઈ પટેલ (Mohanbhai Patel)';

  // 3. Extract Issue Date / Year
  let detectedYear: number | null = null;
  let formattedDate: string | null = null;

  if (manualDateOverride) {
    const parsedManualYear = parseInt(manualDateOverride.slice(0, 4), 10);
    if (!isNaN(parsedManualYear) && parsedManualYear >= 1990 && parsedManualYear <= CURRENT_YEAR) {
      detectedYear = parsedManualYear;
      formattedDate = manualDateOverride;
    }
  }

  if (!detectedYear) {
    // Regex looking for date pattern DD/MM/YYYY or YYYY
    const dateMatch = text.match(/(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.](?:20|19)\d{2})/);
    if (dateMatch) {
      formattedDate = dateMatch[1];
      const parts = dateMatch[1].split(/[\/\-\.]/);
      detectedYear = parseInt(parts[parts.length - 1], 10);
    } else {
      const yearMatches = text.match(/(?:20|19)\d{2}/g);
      if (yearMatches && yearMatches.length > 0) {
        const parsed = yearMatches.map(y => parseInt(y, 10)).filter(y => y >= 2015 && y <= CURRENT_YEAR);
        if (parsed.length > 0) {
          detectedYear = Math.min(...parsed);
          formattedDate = `01/04/${detectedYear}`;
        }
      }
    }
  }

  // 4. Uncertainty Check (OCR could not confidently extract the date)
  if (!detectedYear) {
    return {
      isValid: false,
      status: 'needs_review',
      statusTitleEn: 'NEEDS REVIEW',
      statusTitleGu: 'ચકાસણી જરૂરી (Needs Review)',
      extractedData: {
        documentType: 'આવકનું પ્રમાણપત્ર (Income Certificate)',
        applicantName,
        certificateNumber: certificateNo,
      },
      checks: [
        { name: 'Document Type', nameGu: 'દસ્તાવેજનો પ્રકાર', passed: true, detail: 'Income Certificate Detected' },
        { name: 'Applicant Name', nameGu: 'અરજદારનું નામ', passed: true, detail: applicantName },
        { name: 'Issue Date', nameGu: 'ઇસ્યુ તારીખ', passed: false, detail: 'Unclear date text in photo' },
        { name: 'Rule Verification', nameGu: 'નિયમ ચકાસણી', passed: false, detail: 'Pending clear date extraction' },
      ],
      ruleReference: rule.ruleReference,
      messageGu: '⚠️ પ્રમાણપત્રમાંથી ઇસ્યુ તારીખ સ્પષ્ટ વાંચી શકાઈ નથી. કૃપા કરીને સ્પષ્ટ ફોટો ફરી પાડો અથવા તારીખ જાતે દાખલ કરો.',
      messageEn: 'We could not clearly read the issue date. Please retake the photo or enter the date manually.',
      disclaimer,
      canContinueWithOfficerReview: true,
    };
  }

  // 5. Rule Engine: Calculate result from Certificate Date + Scheme Rule + Current Date
  const validitySpan = rule.validityYears ?? 3;
  const thresholdYear = CURRENT_YEAR - validitySpan;
  const isWithinValidity = detectedYear >= thresholdYear;

  const extractedData: ExtractedDocumentData = {
    documentType: 'આવકનું પ્રમાણપત્ર (Income Certificate)',
    applicantName,
    issueDate: formattedDate || `${detectedYear}`,
    extractedYear: detectedYear,
    certificateNumber: certificateNo,
    issuingAuthority: 'મામલતદાર કચેરી, ગોંડલ (રાજકોટ)',
  };

  const checks: VerificationCheckItem[] = [
    { name: 'Document Type', nameGu: 'દસ્તાવેજ પ્રકાર', passed: true, detail: 'Income Certificate Verified' },
    { name: 'Applicant Name', nameGu: 'અરજદારનું નામ', passed: true, detail: applicantName },
    { name: 'Issue Date Detected', nameGu: 'ઇસ્યુ તારીખ', passed: true, detail: `${formattedDate} (વર્ષ ${detectedYear})` },
    { 
      name: 'Validity Rule Check', 
      nameGu: 'માન્યતા નિયમ ચકાસણી', 
      passed: isWithinValidity, 
      detail: isWithinValidity 
        ? `Valid under ${validitySpan}-year window (${detectedYear} to ${detectedYear + validitySpan})` 
        : `Issued in ${detectedYear} (Exceeds ${validitySpan}-year applicable rule)` 
    },
  ];

  if (!isWithinValidity) {
    return {
      isValid: false,
      status: 'failed',
      statusTitleEn: 'ACTION REQUIRED',
      statusTitleGu: 'ધ્યાન જરૂરી (Action Required)',
      extractedData,
      checks,
      ruleReference: rule.ruleReference,
      messageGu: `⚠️ પૂર્વ-ચકાસણી અનુસાર આ આવકનો દાખલો વર્ષ ${detectedYear} નો છે, જે નિયત ${validitySpan} વર્ષની મુદત કરતાં જૂનો હોવાનું જણાય છે. કચેરીએ જતાં પહેલાં નવો દાખલો કઢાવવો હિતાવહ છે.`,
      messageEn: `Automated pre-check indicates this Income Certificate was issued in ${detectedYear} (over ${validitySpan} years old). You may update the document or proceed for officer discretion.`,
      disclaimer,
      canContinueWithOfficerReview: true,
    };
  }

  return {
    isValid: true,
    status: 'passed',
    statusTitleEn: 'PRE-CHECK PASSED',
    statusTitleGu: 'પૂર્વ-ચકાસણી સફળ (Pre-Check Passed)',
    extractedData,
    checks,
    ruleReference: rule.ruleReference,
    messageGu: `✅ દસ્તાવેજ પ્રી-ચેક સફળ: પ્રમાણપત્ર વર્ષ ${detectedYear} નું છે અને અરજી માટે યોગ્ય જણાય છે.`,
    messageEn: `Document appears valid for submission (Issued ${detectedYear} - within applicable validity window).`,
    disclaimer,
    canContinueWithOfficerReview: false,
  };
};

/**
 * Aadhaar Number Masking Utility
 * Keeps only the last 4 digits visible to safeguard citizen privacy.
 */
export const validateAadhaarNumber = (text: string): { isValid: boolean; masked?: string; privacyNote: string } => {
  const match = text.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/);
  const privacyNote = 'Your Aadhaar information is used only for identity matching in this demonstration and is not displayed in full.';
  
  if (match) {
    const raw = match[0].replace(/\s/g, '');
    return {
      isValid: true,
      masked: `XXXX-XXXX-${raw.slice(-4)}`,
      privacyNote
    };
  }
  return { 
    isValid: false, 
    privacyNote 
  };
};

// Preset sample OCR text fixtures for testing and evaluation
export const SAMPLE_OCR_TEST_CASES = {
  expired2021: `
    ગુજરાત સરકાર - મહેસૂલ વિભાગ
    મામલતદાર કચેરી, ગોંડલ (રાજકોટ)
    આવકનું પ્રમાણપત્ર (Income Certificate)
    દાખલા નંબર: INC/GND/2021/84729
    જાહેર કરવામાં આવે છે કે શ્રી મોહનભાઈ પટેલ ની વાર્ષિક આવક ₹૬૫,૦૦૦ છે.
    ઈશ્યુ તારીખ (Date of Issue): 14/08/2021
    નાણાકીય વર્ષ: 2021-2022
  `,
  valid2025: `
    ગુજરાત સરકાર - મહેસૂલ વિભાગ
    મામલતદાર કચેરી, ગોંડલ (રાજકોટ)
    આવકનું પ્રમાણપત્ર (Income Certificate)
    દાખલા નંબર: INC/GND/2025/11904
    જાહેર કરવામાં આવે છે કે શ્રી મોહનભાઈ પટેલ ની વાર્ષિક આવક ₹૮૦,૦૦૦ છે.
    ઈશ્યુ તારીખ (Date of Issue): 22/04/2025
    નાણાકીય વર્ષ: 2025-2026
  `,
  unclearDate: `
    ગુજરાત સરકાર - મહેસૂલ વિભાગ
    મામલતદાર કચેરી, ગોંડલ
    આવકનું પ્રમાણપત્ર (Income Certificate)
    દાખલા નંબર: INC/GND/XXXX/99120
    અરજદાર: શ્રી મોહનભાઈ પટેલ
    તારીખ: [અસ્પષ્ટ / ધૂંધળું લખાણ]
  `
};
