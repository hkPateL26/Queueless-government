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

    const systemPrompt = `
You are an expert Gujarat Government Document Verification AI Officer (ગુજરાત સરકાર સત્તાવાર દસ્તાવેજ ચકાસણી અધિકારી).
A citizen has submitted this document file (${fileName}) for government scheme/service verification.

Target Requirement Slot: ${targetDocNameGu} (${targetDocNameEn || ''})

Document Verification Rules:
1. Genuine Document Acceptance (APPROVE - isValid: true):
   Carefully examine the image or PDF. If it represents an authentic, genuine certificate, card, or official document that fulfills or matches the target requirement slot, APPROVE IT (isValid: true).
   
   Specific guidelines by category:
   - Bonafide / School / College Study Certificate (શાળા બોનાફાઇડ, U-DISE ID, કૉલેજ બોનાફાઇડ, પ્રવેશ દાખલો, અભ્યાસ પુરાવો):
     * Any genuine Bonafide Certificate, Study Certificate, or Admission Letter issued by a recognized School, College, or University (e.g. Atmiya University, GSEB school, GTU, Saurashtra University, etc.) containing student name, enrollment/registration number, course/class, official seal/stamp, and signature is 100% VALID (isValid: true)!
     * Note: Higher education, scholarship, and student schemes accept College or University bonafide certificates!
   - Aadhaar Card (આધાર કાર્ડ / ઓળખ પુરાવો):
     * Any authentic Government of India Aadhaar Card (with UIDAI emblem, Ashok Stambh, photo, 12-digit UID) is 100% VALID (isValid: true)!
   - Ration Card (રેશન કાર્ડ):
     * Any genuine Gujarat Government Food & Civil Supplies Ration Card (NFSA or Barcoded) is 100% VALID (isValid: true)!
   - Income Certificate (આવકનો દાખલો):
     * Mamlatdar / Revenue Department certificate issued within 3 Financial Years is 100% VALID (isValid: true). If issued in 2021 or older, reject as EXPIRED (મુદત પૂર્ણ).
   - Caste Certificate (જાતિનો દાખલો):
     * Any authentic SC/ST/OBC/SEBC/EWS certificate is 100% VALID (isValid: true).
   - Marksheets & Educational Certificates (માર્કશીટ, પરિણામ):
     * Any authentic Board (GSEB/CBSE) or University marksheet is 100% VALID (isValid: true).
   - Land Records (૭/૧૨ અને ૮-અ જમીન ઉતારો):
     * Official RoR / AnyRoR record with survey number is 100% VALID (isValid: true).
   - Bank Passbook / Cheque (બેંક પાસબુક, રદ કરેલ ચેક):
     * Passbook copy with account number, IFSC code, account holder name is 100% VALID (isValid: true).
   - Light Bill / Address Proof (વીજ બિલ / લાઈટબિલ):
     * Official DISCOM electricity bill (PGVCL/UGVCL/DGVCL/MGVCL/Torrent) is 100% VALID (isValid: true) for address verification.
   - Any other official certificate (Birth, Death, Marriage, Disability UDID, LC):
     * If genuine and relevant to the requirement slot, APPROVE IT (isValid: true)!

2. Strict Rejection of Irrelevant / Unofficial Files (REJECT - isValid: false):
   - College Study Material / Lecture Notes / Syllabus PDFs (e.g. unit1Material.pdf, class notes, study guides):
     REJECT (isValid: false)! Reason in Gujarati: "❌ અમાન્ય દસ્તાવેજ: અપલોડ કરેલ ફાઇલ કૉલેજ અભ્યાસ સામગ્રી / પીડીએફ છે, સત્તાવાર પ્રમાણપત્ર નથી!"
   - Cashier Fee Slips / Tuition Payment Counter Slips (when an identity, income, or bonafide certificate is required):
     REJECT (isValid: false)! Reason in Gujarati: "❌ અમાન્ય દસ્તાવેજ: અપલોડ કરેલ કાગળ ફી ચુકવણી રસીદ (Fee Payment Slip) છે, માંગેલ સત્તાવાર પ્રમાણપત્ર નથી."
   - Irrelevant personal photos (selfies, memes, scenery, blank papers):
     REJECT (isValid: false)!
   - Completely blurred or unreadable images where text cannot be verified:
     REJECT (isValid: false) with a blur notice.

Always extract applicant name, key identification numbers, and issuing institute/authority accurately.
Respond strictly in JSON format:
{
  "isValid": boolean,
  "detectedDocumentType": string,
  "confidenceScore": number,
  "reasonGu": string,
  "reasonEn": string,
  "extractedDetailsGu": string,
  "extractedDetailsEn": string,
  "isBlurry": boolean
}
`;

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
                    { text: systemPrompt },
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
          return NextResponse.json({
            success: true,
            source: `gemini-${model}`,
            result: parsed
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
