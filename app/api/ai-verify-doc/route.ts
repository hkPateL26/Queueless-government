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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured', fallback: true }, { status: 200 });
    }

    const systemPrompt = `
You are an expert Gujarat Government Document Verification AI Officer (ગુજરાત સરકાર સત્તાવાર દસ્તાવેજ ચકાસણી અધિકારી).
A citizen has submitted this document file (${fileName}) for government scheme/service verification.

Target Requirement: ${targetDocNameGu} (${targetDocNameEn || ''})

Document Verification Rules:
1. Genuine Government Document Acceptance:
   - If Target is 'રેશન કાર્ડ અને આધાર કાર્ડ' (Ration Card & Aadhaar Card) or 'આધાર કાર્ડ' (Aadhaar Card) or 'ઓળખનો પુરાવો':
     * Any genuine, authentic Government of India Aadhaar Card (with Government of India banner, Ashok Stambh, photo, 12-digit UID like 7341 3284 1413, or UIDAI emblem) is 100% VALID (isValid: true)!
     * Any genuine Gujarat Government Food & Civil Supplies Ration Card (NFSA or Barcoded) is 100% VALID (isValid: true)!
     * Extract the applicant's name as clearly printed on the document (e.g. Khunt Harkishan Vinodrai / ખૂંટ હરકિશન વિનોદરાય) and masked ID number.
   - If Target is 'આવકનો દાખલો' (Income Certificate):
     * A genuine Gujarat Revenue Department / Mamlatdar certificate issued within 3 Financial Years is 100% VALID (isValid: true).
     * If issued in 2021 or older, reject as EXPIRED (મુદત પૂર્ણ).

2. Strict Rejection of Non-Government / Irrelevant Documents (Must Reject!):
   - College / University Fee Receipts (e.g. Atmiya University Fee Receipt, college challan, tuition fee):
     REJECT (isValid: false)! Reason in Gujarati: "❌ અમાન્ય દસ્તાવેજ: અપલોડ કરેલ કાગળ આત્મીય યુનિવર્સિટી ફી રસીદ (College Fee Receipt) છે, જે સત્તાવાર સરકારી દસ્તાવેજ નથી! કૃપા કરીને અસલ સત્તાવાર દસ્તાવેજ અપલોડ કરો."
   - College Study Material / Lecture Notes / Syllabus PDFs (e.g. unit1Material.pdf, phase.pdf, notes):
     REJECT (isValid: false)! Reason in Gujarati: "❌ અમાન્ય દસ્તાવેજ: અપલોડ કરેલ ફાઇલ કૉલેજ અભ્યાસ સામગ્રી / પીડીએફ છે, જે સત્તાવાર સરકારી દસ્તાવેજ નથી!"
   - Electricity/Utility bills or private letters where not accepted:
     REJECT (isValid: false)!

3. Clarity & Quality:
   - If the photo is heavily blurred or text completely unreadable, set isValid: false with a blur warning. If readable, approve.

Respond strictly in JSON format:
{
  "isValid": boolean,
  "detectedDocumentType": string,
  "confidenceScore": number,
  "reasonGu": string, // Explanation if rejected, or validation message if approved
  "reasonEn": string,
  "extractedDetailsGu": string, // Extracted applicant name & ID (e.g. "અરજદાર: Khunt Harkishan Vinodrai • આધાર નં: XXXX-XXXX-1413 • UIDAI ભારત સરકાર અધિકૃત")
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
