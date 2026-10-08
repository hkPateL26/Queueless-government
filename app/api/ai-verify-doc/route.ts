import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType = 'image/jpeg', targetDocNameGu, targetDocNameEn, applicantName = 'Hari Patel (હરિ પટેલ)' } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: 'Missing imageBase64' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY not configured', fallback: true }, { status: 200 });
    }

    const systemPrompt = `
You are an expert Gujarat Government Document Verification AI Officer (ગુજરાત સરકાર સત્તાવાર દસ્તાવેજ ચકાસણી અધિકારી).
The citizen has submitted a document photo for official government scheme/service application.

Target Required Document: ${targetDocNameGu} (${targetDocNameEn || ''})
Expected Citizen Identity: ${applicantName}

Inspect the provided image in detail:
1. Document Identification:
   - What document is this? Is it truly the requested government document (${targetDocNameGu})?
   - If it is NOT the requested document (e.g., college fee receipt, Atmiya University fee receipt, tuition challan, electricity bill, private letter, random photo, selfie), you MUST REJECT it.
   - Specifically, if it is a College or University Fee Receipt (like Atmiya University), detect it and state clearly in Gujarati: "આત્મીય યુનિવર્સિટી ફી રસીદ (College Fee Receipt) છે, જે સત્તાવાર સરકારી આધાર કાર્ડ નથી".

2. Quality & Authenticity Check:
   - Check if the image is blurry, out-of-focus, cropped, unreadable, or has flash glare.
   - If blurry or unreadable, set isValid: false with a clear explanation in Gujarati.

3. Statutory Rules:
   - If Target is 'આધાર કાર્ડ' (Aadhaar Card): Must have UIDAI emblem, 12-digit number (masked/unmasked), or Aadhaar QR code.
   - If Target is 'આવકનો દાખલો' (Income Certificate): Must be issued by Gujarat Revenue Department / Mamlatdar within 3 Financial Years. If issued in 2021 or earlier, reject as EXPIRED (મુદત પૂર્ણ).
   - If Target is 'રેશન કાર્ડ' (Ration Card): Must have Food & Civil Supplies barcode, booklet details or NFSA category.

Output strictly in JSON:
{
  "isValid": boolean,
  "detectedDocumentType": string,
  "confidenceScore": number (between 0.0 and 1.0),
  "reasonGu": string, // Detailed Gujarati explanation if rejected
  "reasonEn": string, // English explanation if rejected
  "extractedDetailsGu": string, // Gujarati details if approved (e.g. "અરજદાર: હરિ પટેલ • આધાર: XXXX-XXXX-8842 • UIDAI પ્રમાણિત")
  "extractedDetailsEn": string, // English details if approved
  "isBlurry": boolean,
  "isCollegeOrFeeReceipt": boolean,
  "isExpired": boolean
}
`;

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please verify this uploaded document for '${targetDocNameGu}'. Is it authentic, clear, and matching?`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 600,
        temperature: 0.1
      })
    });

    const data = await openAiResponse.json();

    if (data.error) {
      console.warn('OpenAI API Error:', data.error.message || data.error);
      return NextResponse.json({
        success: false,
        fallback: true,
        error: data.error.message || 'OpenAI API Error',
        errorCode: data.error.code || 'API_ERROR'
      });
    }

    const contentText = data.choices?.[0]?.message?.content;
    if (!contentText) {
      return NextResponse.json({ success: false, fallback: true, error: 'Empty AI response' });
    }

    try {
      const parsed = JSON.parse(contentText);
      return NextResponse.json({
        success: true,
        source: 'openai-gpt-4o-mini',
        result: parsed
      });
    } catch {
      return NextResponse.json({ success: false, fallback: true, error: 'Invalid JSON response from AI' });
    }
  } catch (error: any) {
    console.error('AI Document Verification Error:', error);
    return NextResponse.json({ success: false, fallback: true, error: error.message || 'Internal Error' }, { status: 500 });
  }
}
