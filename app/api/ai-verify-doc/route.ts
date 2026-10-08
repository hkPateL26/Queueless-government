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
A citizen has submitted this document file (${fileName}) for official government verification.

Target Required Document: ${targetDocNameGu} (${targetDocNameEn || ''})
Expected Applicant Name: ${applicantName}

Strict Examination Guidelines:
1. Document Identification:
   - What document is this? Is it strictly and authentically the required document: '${targetDocNameGu}'?
   - If it is ANYTHING else (e.g. college study material, university lecture notes, unit syllabus, assignment PDF, college fee receipt, Atmiya University fee receipt, light bill, bank slip, resume, portfolio, random photo, selfie), you MUST REJECT it (isValid: false).
   - Specifically:
     * If it is a college fee receipt (e.g., Atmiya University): State in Gujarati: "❌ અમાન્ય દસ્તાવેજ: અપલોડ કરેલ કાગળ આત્મીય યુનિવર્સિટી ફી રસીદ (College Fee Receipt) છે, જે સત્તાવાર સરકારી ${targetDocNameGu} નથી! કૃપા કરીને અસલ સત્તાવાર દસ્તાવેજ અપલોડ કરો."
     * If it is college study material / PDF notes (e.g. unit material, presentation, study PDF): State in Gujarati: "❌ અમાન્ય દસ્તાવેજ: અપલોડ કરેલ ફાઇલ (${fileName}) કૉલેજ અભ્યાસ સામગ્રી / પીડીએફ છે, જે સત્તાવાર સરકારી ${targetDocNameGu} નથી! કૃપા કરીને અસલ દસ્તાવેજ અપલોડ કરો."
     * If it is a utility bill or other private document: State in Gujarati: "❌ અમાન્ય દસ્તાવેજ: અપલોડ કરેલ કાગળ ખાનગી દસ્તાવેજ છે, જે માંગેલ સરકારી ${targetDocNameGu} સાથે મેળ ખાતો નથી."

2. Quality & Authenticity:
   - If the image or PDF is blurry, dark, cropped, or illegible, set isValid: false and explain that the photo is out of focus or text is unreadable.

3. Statutory Rules:
   - 'આધાર કાર્ડ' (Aadhaar Card): Must have UIDAI emblem, 12-digit number (masked/unmasked), or Aadhaar QR code.
   - 'આવકનો દાખલો' (Income Certificate): Must be issued by Gujarat Revenue Department within 3 financial years. If issued in 2021 or older, reject as EXPIRED (મુદત પૂર્ણ).
   - 'રેશન કાર્ડ' (Ration Card): Must have Food & Civil Supplies barcode, booklet details, or NFSA category.

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
