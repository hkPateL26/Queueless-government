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
Your mandate: ZERO FRAUD, ZERO MISMATCH, STRICT QUALITY CONTROL, ABSOLUTELY NO FALSE POSITIVES.

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
   - "7/12 & 8-A Land Record" (૭/૧૨ અને ૮-અ જમીન ઉતારો / જમીનની નકલ)
   - "Other / Invalid / Irrelevant Document / Not a Document" (અન્ય / અમાન્ય દસ્તાવેજ)

2. STRICT DOCUMENT TYPE MATCHING & FRAUD PREVENTION:
   - FOR "7/12 & 8-A Land Record" (૭/૧૨ અને ૮-અ જમીનની નકલ / ઉતારો):
     * The document MUST be an authentic AnyRoR Gujarat Revenue Record (મહેસૂલ વિભાગ, ગાંધીનગર / AnyRoR / ગામ નમૂના નં. ૭, ૧૨ અથવા ૮-અ, ખાતા નંબર, સર્વે નંબર, અથવા ડિજિટલ સહી).
     * If the uploaded file is NOT a 7/12 or 8-A Land Record (such as a random image, photo of a person/nature, textbook, notes, college assignment, marksheet, fee receipt, electricity bill, Aadhaar card, blank paper, unrelated document):
       -> "matchesExpected": false
       -> "isValidForGovt": false
       -> "qualityScore": 10
       -> "needsNewDocument": true
       -> "actionableAdvice": "❌ અમાન્ય દસ્તાવેજ: અપલોડ કરેલ ફાઇલ ૭/૧૨ કે ૮-અ જમીન ઉતારો નથી. AnyRoR પોર્ટલ (anyror.gujarat.gov.in) અથવા કચેરીની સત્તાવાર ૭/૧૨ અને ૮-અ જમીનની નકલ જ અપલોડ કરો."

   - FOR "Passport Size Photograph / Photo Proof":
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

   - FOR "Birth Certificate" or "School Leaving Certificate" and the image is a Marksheet:
     -> "matchesExpected": false
     -> "isValidForGovt": false
     -> "qualityScore": 15
     -> "actionableAdvice": "❌ ખોટો દસ્તાવેજ: તમે માર્કશીટ (ગુણપત્રક) અપલોડ કરી છે. અહીં માત્ર જન્મનો દાખલો અથવા LC જ માન્ય છે. માર્કશીટ ચાલશે નહીં."

   - FOR "Aadhaar Card / Photo ID":
     * If uploaded document is an authentic Aadhaar card:
       -> "matchesExpected": true, "isValidForGovt": true, "qualityScore": 98
     * If user uploaded electricity bill, fee receipt, or random file:
       -> "matchesExpected": false, "isValidForGovt": false, "qualityScore": 15
       -> "actionableAdvice": "❌ ખોટો દસ્તાવેજ: ઓળખ પુરાવા તરીકે સત્તાવાર આધાર કાર્ડ જ અપલોડ કરવું."

   - FOR "Income Certificate" (આવકનો દાખલો):
     * Must be an authentic Gujarat Revenue Dept / Mamlatdar / Taluka Magistrate Income Certificate.
     * If older than 3 financial years:
       -> "isValidForGovt": false
       -> "needsUpdate": true
       -> "actionableAdvice": "❌ મુદત પૂર્ણ (Expired): આ આવકનો દાખલો ૩ નાણાકીય વર્ષથી વધુ જૂનો છે. ગુજરાત મહેસૂલ નિયમો મુજબ નવો દાખલો કઢાવવો ફરજિયાત છે."

   - FOR "Bonafide Certificate / School or College Study Proof":
     * Any authentic School, College, or University Bonafide Certificate containing student name, registration number, official round seal and signature:
       -> "matchesExpected": true, "isValidForGovt": true, "qualityScore": 95
       -> "actionableAdvice": "✅ માન્ય બોનાફાઇડ પ્રમાણપત્ર: સંસ્થાની સત્તાવાર મોહર અને વિદ્યાર્થી વિગતો પ્રમાણિત છે."

   - FOR "Ration Card" (રેશન કાર્ડ):
     * Food & Civil Supplies Ration card:
       -> "matchesExpected": true, "isValidForGovt": true, "qualityScore": 97
       -> "actionableAdvice": "✅ માન્ય રેશન કાર્ડ: અન્ન અને નાગરિક પુરવઠા વિભાગનું સત્તાવાર રેશન કાર્ડ પ્રમાણિત છે."

   - GENERAL STRICT REJECTION CLAUSE:
     * If the image is blank, random, blurry, unreadable, or unrelated to the requested government document:
       -> "matchesExpected": false
       -> "isValidForGovt": false
       -> "qualityScore": 5
       -> "actionableAdvice": "❌ અમાન્ય ફાઇલ: અપલોડ કરેલ ઇમેજ વાંચી શકાતી નથી અથવા સરકારી દસ્તાવેજ નથી. કૃપા કરીને સ્પષ્ટ અસલ દસ્તાવેજ અપલોડ કરો."

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

    // Try gemini-3.5-flash first, fallback to gemini-3.5-flash-lite, then gemini-3.8-flash
    const candidateModels = ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.8-flash'];
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
              extractedDetailsGu: isValid ? detailsGu : undefined,
              extractedDetailsEn: isValid ? detailsEn : undefined,
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
