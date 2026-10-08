import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      imageBase64, 
      fileBase64, 
      mimeType = 'image/jpeg', 
      fileName = 'document', 
      targetDocNameGu, 
      targetDocNameEn, 
      applicantName = 'હરિ પટેલ (Hari Patel)' 
    } = body;

    const dataBase64 = fileBase64 || imageBase64;
    if (!dataBase64) {
      return NextResponse.json({ error: 'Missing document data' }, { status: 400 });
    }

    let apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const envPath = path.join(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
          const content = fs.readFileSync(envPath, 'utf8');
          const m = content.match(/GEMINI_API_KEY\s*=\s*(.+)/);
          if (m) apiKey = m[1].trim();
        }
      } catch (e) {
        console.warn('Could not read .env.local file directly:', e);
      }
    }

    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured', fallback: true }, { status: 200 });
    }

    const expectedDocType = targetDocNameGu 
      ? `${targetDocNameGu}${targetDocNameEn ? ` (${targetDocNameEn})` : ''}`
      : 'Government Document (સત્તાવાર સરકારી દસ્તાવેજ)';

    const masterPrompt = `You are the STRICT Chief Document Verification Officer for an Official Government Portal.
Your mandate: ZERO FRAUD, ZERO MISMATCH, STRICT QUALITY CONTROL.
CRITICAL RULES & CONDITIONS:
1. Identify the EXACT type of document shown in this image or PDF:
   - "Academic Marksheet / Statement of Marks" (શૈક્ષણિક માર્કશીટ / ગુણપત્રક)
   - "Birth Certificate" (જન્મનો દાખલો)
   - "School Leaving Certificate / Transfer Certificate" (શાળા છોડ્યાનું પ્રમાણપત્ર / LC)
   - "Aadhaar Card" (આધાર કાર્ડ)
   - "PAN Card" (પાન કાર્ડ)
   - "Ration Card" (રેશન કાર્ડ)
   - "Income Certificate" (આવકનો દાખલો)
   - "Caste Certificate" (જાતિનો દાખલો)
   - "Electricity Bill / Utility Bill" (લાઈટ બિલ / વીજળી બિલ)
   - "Property Tax Receipt / Index 2" (વેરા બિલ / દસ્તાવેજ)
   - "Voter ID / Election Card" (ચૂંટણી કાર્ડ)
   - "Driving License" (ડ્રાઇવિંગ લાયસન્સ)
   - "Passport Size Photograph" (અરજદારનો રંગીન પાસપોર્ટ ફોટો)
   - "Signature / Handwritten Stroke" (અરજદારની સહી)
   - "Bonafide Certificate / School or College Study Proof" (શાળા / કૉલેજ / યુનિવર્સિટી બોનાફાઇડ પ્રમાણપત્ર)
   - "Bank Passbook / Cancelled Cheque" (બેંક પાસબુક / રદ કરેલ ચેક)
   - "7/12 & 8-A Land Record" (૭/૧૨ અને ૮-અ જમીન ઉતારો)
   - "Other / Invalid Document"

2. STRICT MISMATCH ENFORCEMENT:
   - If expected is "Passport Size Photograph / Photo Proof":
     * The uploaded image MUST be a clear portrait of a human face (head & shoulders).
     * If user uploaded a Signature (સહી), Marksheet, Certificate, Bill, or Document without a human face:
       -> "matchesExpected": false
       -> "isValidForGovt": false
       -> "qualityScore": 5
       -> "actionableAdvice": "❌ ખોટો ફોટો: તમે સહી અથવા અન્ય દસ્તાવેજ અપલોડ કર્યો છે. અહીં ફક્ત અરજદારનો અસલ પાસપોર્ટ સાઇઝ રંગીન ફોટો (ચહેરો) જ માન્ય છે."
     * If it is a real human face portrait with plain/solid background:
       -> "matchesExpected": true
       -> "isValidForGovt": true
       -> "qualityScore": 95
       -> "actionableAdvice": "✅ માન્ય પાસપોર્ટ સાઇઝ ફોટો: ચહેરો સ્પષ્ટ છે અને સ્વીકાર્ય છે."
   - If expected is "Birth Certificate" or "School Leaving Certificate" and the image is a Marksheet (Statement of Marks):
     * A marksheet is NOT a proof of birth or leaving certificate!
     -> "matchesExpected": false
     -> "isValidForGovt": false
     -> "qualityScore": 15
     -> "actionableAdvice": "❌ ખોટો દસ્તાવેજ: તમે માર્કશીટ (ગુણપત્રક) અપલોડ કરી છે. અહીં માત્ર જન્મનો દાખલો અથવા LC જ માન્ય છે. માર્કશીટ ચાલશે નહીં."
   - If expected is "Aadhaar Card / Photo ID" and user uploaded an "Electricity Bill":
     -> "matchesExpected": false
     -> "isValidForGovt": false
     -> "qualityScore": 15
     -> "actionableAdvice": "❌ ખોટો દસ્તાવેજ: તમે લાઈટ બિલ અપલોડ કર્યું છે. અહીં ઓળખ પુરાવા તરીકે આધાર કાર્ડ જ અપલોડ કરવું."
   - If expected is "Bonafide Certificate / School or College Study Proof / શાળા બોનાફાઇડ":
     * Any authentic School, College, or University Bonafide Certificate (such as Atmiya University) containing student name, registration number, official round seal and signature:
     -> "matchesExpected": true
     -> "isValidForGovt": true
     -> "qualityScore": 95
     -> "actionableAdvice": "✅ માન્ય બોનાફાઇડ પ્રમાણપત્ર: સંસ્થાની સત્તાવાર મોહર અને વિદ્યાર્થી વિગતો પ્રમાણિત છે."
   - If expected is "Aadhaar Card" and the image is an authentic Aadhaar card:
     -> "matchesExpected": true
     -> "isValidForGovt": true
     -> "qualityScore": 98
     -> "actionableAdvice": "✅ માન્ય આધાર કાર્ડ: ભારત સરકાર / UIDAI સત્તાવાર ઓળખ કાર્ડ પ્રમાણિત છે."
   - If expected is "Ration Card" and image is a Food & Civil Supplies Ration card:
     -> "matchesExpected": true
     -> "isValidForGovt": true
     -> "qualityScore": 97
     -> "actionableAdvice": "✅ માન્ય રેશન કાર્ડ: અન્ન અને નાગરિક પુરવઠા વિભાગનું સત્તાવાર રેશન કાર્ડ પ્રમાણિત છે."
   - If expected is "Income Certificate" and image is Gujarat Revenue Dept income certificate:
     -> "matchesExpected": true
     -> "isValidForGovt": true
     -> "qualityScore": 98
     -> "actionableAdvice": "✅ માન્ય આવકનો દાખલો: મહેસૂલ વિભાગ દ્વારા પ્રમાણિત દાખલો સ્વીકાર્ય છે."
   - If the image is extremely blurry, cropped, unreadable, or dark:
     -> "matchesExpected": true (or false if unidentifiable)
     -> "isValidForGovt": false
     -> "qualityScore": 25
     -> "actionableAdvice": "⚠️ ઝાંખો દસ્તાવેજ: દસ્તાવેજ વાંચી શકાતો નથી. કૃપા કરીને સ્પષ્ટ અને સીધો ફોટો ફરીથી પાડીને અપલોડ કરો."

3. RETURN FORMAT:
Return ONLY a valid JSON object matching this schema without any markdown wrapping or text:
{
  "documentType": string,
  "documentNameGu": string,
  "qualityScore": number,
  "isValidForGovt": boolean,
  "matchesExpected": boolean,
  "needsUpdate": boolean,
  "needsNewDocument": boolean,
  "actionableAdvice": string,
  "extractedInfo": {
    "detectedName": string or null,
    "documentNumberMasked": string or null,
    "yearOrDate": string or null
  },
  "verificationPoints": [
    { "point": string, "status": "pass" | "fail", "note": string }
  ]
}
====================
EXPECTED DOCUMENT REQUIREMENT FOR THIS SLOT: "${expectedDocType}"
ORIGINAL FILENAME UPLOADED BY USER: "${fileName}"
====================`;

    // Try gemini-3.1-flash-lite first, fallback to gemini-3.5-flash
    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.5-flash'];
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    { text: masterPrompt },
                    {
                      inlineData: {
                        mimeType: mimeType.includes('pdf') ? 'application/pdf' : mimeType || 'image/jpeg',
                        data: dataBase64
                      }
                    }
                  ]
                }
              ],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.1
              }
            })
          }
        );

        const data = await response.json();
        if (data.error) {
          lastError = data.error;
          continue;
        }

        const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textOutput) {
          const parsed = JSON.parse(textOutput);

          // 🛡️ Code-Level Double Safeguard:
          // If mismatch or not valid for govt, strictly drop qualityScore and reject
          if (parsed.matchesExpected === false) {
            parsed.isValidForGovt = false;
            if (parsed.qualityScore > 30) {
              parsed.qualityScore = 15;
            }
          }

          const isMismatch = parsed.matchesExpected === false || parsed.isValidForGovt === false || parsed.qualityScore < 40;
          const isValid = !isMismatch;

          const info = parsed.extractedInfo || {};
          const partsGu: string[] = [];
          const partsEn: string[] = [];

          if (info.detectedName) {
            partsGu.push(`અરજદાર/વિદ્યાર્થી: ${info.detectedName}`);
            partsEn.push(`Applicant/Student: ${info.detectedName}`);
          }
          if (info.documentNumberMasked) {
            partsGu.push(`નંબર: ${info.documentNumberMasked}`);
            partsEn.push(`ID/Reg: ${info.documentNumberMasked}`);
          }
          if (info.yearOrDate) {
            partsGu.push(`તારીખ/વર્ષ: ${info.yearOrDate}`);
            partsEn.push(`Date/Year: ${info.yearOrDate}`);
          }
          if (parsed.actionableAdvice) {
            partsGu.push(parsed.actionableAdvice);
            partsEn.push(parsed.actionableAdvice);
          }

          const detailsGu = partsGu.length > 0 ? partsGu.join(' • ') : parsed.actionableAdvice;
          const detailsEn = partsEn.length > 0 ? partsEn.join(' • ') : parsed.actionableAdvice;

          return NextResponse.json({
            success: true,
            source: `gemini-${model}`,
            result: {
              isValid,
              status: isValid ? 'passed' : 'failed',
              detectedDocumentType: parsed.documentType || parsed.documentNameGu,
              documentNameGu: parsed.documentNameGu,
              confidenceScore: (parsed.qualityScore || 90) / 100,
              qualityScore: parsed.qualityScore,
              reasonGu: parsed.actionableAdvice,
              reasonEn: parsed.actionableAdvice,
              actionableAdvice: parsed.actionableAdvice,
              extractedDetailsGu: detailsGu,
              extractedDetailsEn: detailsEn,
              extractedInfo: parsed.extractedInfo,
              verificationPoints: parsed.verificationPoints,
              matchesExpected: parsed.matchesExpected,
              isValidForGovt: parsed.isValidForGovt,
              isBlurry: parsed.qualityScore < 30 && (parsed.actionableAdvice?.includes('ઝાંખો') || parsed.actionableAdvice?.includes('blurry'))
            }
          });
        }
      } catch (err: any) {
        lastError = err;
      }
    }

    return NextResponse.json({
      success: false,
      fallback: true,
      error: lastError?.message || 'Gemini API call failed'
    });
  } catch (error: any) {
    console.error('Gemini Document Verification Error:', error);
    return NextResponse.json(
      { success: false, fallback: true, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
