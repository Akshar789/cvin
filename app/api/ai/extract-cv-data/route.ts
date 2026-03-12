import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { checkRateLimit } from '@/lib/middleware/rateLimiting';
import { db } from '@/server/db';
import { users } from '@/shared/schema';
import { eq, sql } from 'drizzle-orm';
import { CV_EXTRACTION_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import openai from '@/lib/ai/openaiClient';

const EXTRACTION_PROMPT = `You are a CV data extraction expert. Extract structured information from CV/resume documents.

STRICT RULES:
- Extract ONLY information that is explicitly present in the document
- DO NOT invent, assume, or add any information not in the document
- If a section is missing or empty, return null or empty array for that section
- Preserve dates, company names, job titles, and other details EXACTLY as written
- If information is ambiguous or unclear, extract what you can see literally
- DO NOT fill in gaps with assumptions

Return the data in this exact format:
{
  "personalInfo": {
    "name": "extracted name or null",
    "email": "extracted email or null",
    "phone": "extracted phone or null",
    "location": "extracted location or null"
  },
  "summary": "extracted professional summary or null",
  "experience": [
    {
      "company": "company name as written",
      "position": "job title as written",
      "location": "location as written or null",
      "startDate": "date as written",
      "endDate": "date as written or Present",
      "description": "responsibilities and achievements as written"
    }
  ],
  "education": [
    {
      "institution": "university name as written",
      "degree": "degree type as written",
      "field": "field of study as written",
      "startDate": "date as written",
      "endDate": "date as written",
      "description": "additional details as written or null"
    }
  ],
  "skills": [
    {
      "category": "skill category",
      "skillsList": ["skill1", "skill2", "skill3"]
    }
  ]
}

If any section is NOT found in the CV, return an empty array or null for that section. DO NOT fabricate data.`;

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const rateLimit = checkRateLimit(user.userId);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.message },
        { status: 429 }
      );
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.userId),
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const isPremium = dbUser.subscriptionTier !== 'free';

    if (!isPremium && (!dbUser.freeCredits || dbUser.freeCredits <= 0)) {
      return NextResponse.json(
        { 
          error: "You've used all 5 free AI generations. Upgrade to continue building professional CVs with AI.",
          creditsRemaining: 0,
          requiresUpgrade: true
        },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('fileType') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit. Please upload a smaller file.' },
        { status: 413 }
      );
    }

    const isAdvancedAI = user.subscriptionTier === 'plus' || user.subscriptionTier === 'annual' || user.subscriptionTier === 'premium' || user.subscriptionTier === 'lifetime' || user.subscriptionTier === 'yearly';
    const model = isAdvancedAI ? "gpt-4o" : "gpt-4o-mini";

    let extractedData: any = {};

    if (fileType === 'pdf' || file.type === 'application/pdf') {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const pdfParse = require('pdf-parse');
      
      const pdfData = await pdfParse(buffer);
      const extractedText = pdfData.text;

      if (!extractedText || extractedText.trim().length === 0) {
        return NextResponse.json(
          { error: 'No text could be extracted from the PDF. Please try a different document.' },
          { status: 400 }
        );
      }

      const response = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: CV_EXTRACTION_SYSTEM_PROMPT + "\n\n" + EXTRACTION_PROMPT
          },
          {
            role: "user",
            content: `Extract all relevant CV information from this document text. 

IMPORTANT: Only extract what you can actually see in the text. Do not add or assume anything.

CV Text:
${extractedText}`
          }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 3000,
      });

      extractedData = JSON.parse(response.choices[0].message.content || '{}');
    } else if (fileType === 'docx' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const mammoth = require('mammoth');
      
      const result = await mammoth.extractRawText({ buffer });
      const extractedText = result.value;

      if (!extractedText || extractedText.trim().length === 0) {
        return NextResponse.json(
          { error: 'No text could be extracted from the DOCX file. Please try a different document.' },
          { status: 400 }
        );
      }

      const response = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: CV_EXTRACTION_SYSTEM_PROMPT + "\n\n" + EXTRACTION_PROMPT
          },
          {
            role: "user",
            content: `Extract all relevant CV information from this document text.

IMPORTANT: Only extract what you can actually see in the text. Do not add or assume anything.

CV Text:
${extractedText}`
          }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 3000,
      });

      extractedData = JSON.parse(response.choices[0].message.content || '{}');
    } else if (file.type.startsWith('image/')) {
      if (!isAdvancedAI) {
        return NextResponse.json(
          { error: 'Image extraction is a Plus tier feature. Please upgrade or use PDF documents instead.' },
          { status: 403 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString('base64');
      const mimeType = file.type;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: CV_EXTRACTION_SYSTEM_PROMPT
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Extract any relevant CV/resume information from this image. 

STRICT RULES:
- Extract ONLY what you can actually see in the image
- If it's a photo of a person (not a document), return empty data
- If it's a document (CV, certificate, etc.), extract all visible text and structure it
- DO NOT assume or add any information not visible in the image

Return the data in the standard CV JSON format.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64}`
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 2000,
      });

      extractedData = JSON.parse(response.choices[0].message.content || '{}');
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload PDF, DOCX, or image files.' },
        { status: 400 }
      );
    }

    let creditsRemaining = 999;
    
    if (!isPremium) {
      const result = await db.execute(sql`
        UPDATE users 
        SET free_credits = GREATEST(free_credits - 1, 0)
        WHERE id = ${user.userId}
        RETURNING free_credits
      `);
      
      const updatedCredits = (result as any).rows?.[0]?.free_credits ?? 0;
      creditsRemaining = Math.max(updatedCredits, 0);
    }

    return NextResponse.json({ 
      extractedData,
      creditsRemaining
    });
  } catch (error: any) {
    console.error('CV extraction error:', error);
    return NextResponse.json(
      { error: 'Failed to extract data from document' },
      { status: 500 }
    );
  }
});
