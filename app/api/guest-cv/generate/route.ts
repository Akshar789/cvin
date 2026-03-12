import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/server/db';
import { CV_GENERATION_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import openai from '@/lib/ai/openaiClient';
import { isValidSaudiPhone, normalizeSaudiPhone } from '@/lib/utils/phoneValidation';

export async function POST(request: NextRequest) {
  try {
    const { email, fullName, phone, location, jobDomain, careerLevel, latestJob, templateId, language } = await request.json();

    if (!email || !fullName) {
      return NextResponse.json({ error: 'Email and full name are required' }, { status: 400 });
    }

    let normalizedPhone = '';
    if (phone) {
      if (!isValidSaudiPhone(phone)) {
        return NextResponse.json({ error: 'Please enter a valid Saudi phone number (e.g., +966 5X XXX XXXX or 05XXXXXXXX)' }, { status: 400 });
      }
      normalizedPhone = normalizeSaudiPhone(phone);
    }

    const isArabic = language === 'ar';

    const cvPrompt = `
Generate a professional CV in ${isArabic ? 'Arabic' : 'English'} based ONLY on the following user-provided information.

USER PROFILE DATA:
- Name: ${fullName}
- Email: ${email}
- Phone: ${normalizedPhone || 'Not provided'}
- Location: ${location || 'Not provided'}
- Target Job Domain: ${jobDomain || 'General'}
- Career Level: ${careerLevel || 'Not specified'}
- Most Recent Job Title: ${latestJob || 'Not provided'}

IMPORTANT INSTRUCTIONS:
Generate CV content that is tailored to the user's job domain (${jobDomain}) and career level (${careerLevel}).
Use the most recent job title (${latestJob}) to inform the professional summary and skills.

CRITICAL RULES:
1. For personalInfo: Use ONLY the exact data provided above.
2. For professionalSummary: Write a compelling 2-3 sentence summary based on the profile data. Focus on the career level, domain expertise, and career goals.
3. For experience: Generate 2-3 realistic experience entries based on the job domain, career level, and latest job title. Include realistic responsibilities and achievements using action verbs.
4. For education: Generate 1-2 education entries appropriate for the career level and job domain.
5. For skills: Generate relevant technical and soft skills for the target domain and career level.
6. For certifications: Generate 1-2 relevant certifications for the domain if appropriate, or return empty array.
7. For languages: Include ${isArabic ? 'العربية' : 'English'} and at least one more language.

Return ONLY valid JSON in this exact format:
{
  "personalInfo": {
    "fullName": "${fullName}",
    "email": "${email}",
    "phone": "${normalizedPhone || ''}",
    "location": "${location || ''}",
    "targetJobTitle": "${latestJob || ''}",
    "targetJobDomain": "${jobDomain || ''}"
  },
  "professionalSummary": "2-3 sentence professional summary",
  "experience": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "location": "City, Country",
      "startDate": "YYYY",
      "endDate": "Present or YYYY",
      "description": "Brief role description",
      "achievements": ["Achievement 1", "Achievement 2", "Achievement 3"]
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "Degree Type",
      "field": "Field of Study",
      "startDate": "YYYY",
      "endDate": "YYYY",
      "description": "Optional description"
    }
  ],
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"],
    "tools": ["tool1", "tool2"]
  },
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Organization"
    }
  ],
  "languages": [
    { "name": "${isArabic ? 'العربية' : 'English'}", "level": "${isArabic ? 'اللغة الأم' : 'Native'}" }
  ]
}
`;

    const primaryCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: CV_GENERATION_SYSTEM_PROMPT },
        { role: 'user', content: cvPrompt },
      ],
      temperature: 0.6,
      max_tokens: 3000,
      response_format: { type: "json_object" }
    });

    let cvContent = primaryCompletion.choices[0].message.content || '{}';
    cvContent = cvContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let parsedCV;
    try {
      parsedCV = JSON.parse(cvContent);
    } catch (parseError) {
      const jsonMatch = cvContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedCV = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('AI returned invalid JSON format');
      }
    }

    const otherLang = isArabic ? 'English' : 'Arabic';
    const translatePrompt = `Translate the following CV content from ${isArabic ? 'Arabic' : 'English'} to ${otherLang}.

CRITICAL RULES:
1. DO NOT translate: person names, email addresses, phone numbers, dates, company names, institution names, URLs
2. DO translate: job titles, professional summaries, descriptions, skill names, skill categories, degree names, field of study, certifications, locations (use ${isArabic ? 'English' : 'Arabic'} names for cities/countries)
3. Keep the EXACT same JSON structure
4. Return ONLY valid JSON, no markdown formatting
5. Maintain professional tone appropriate for a CV/resume

Content to translate:
${JSON.stringify(parsedCV, null, 2)}

Return the translated content in the EXACT same JSON structure.`;

    let translatedCV = null;
    try {
      const translateCompletion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: `You are an expert ${isArabic ? 'Arabic-to-English' : 'English-to-Arabic'} translator specializing in professional CV/resume content. Always return valid JSON only.` },
          { role: 'user', content: translatePrompt },
        ],
        temperature: 0.3,
        max_tokens: 3000,
        response_format: { type: "json_object" }
      });

      let translatedContent = translateCompletion.choices[0].message.content || '{}';
      translatedContent = translatedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      translatedCV = JSON.parse(translatedContent);
    } catch (translateError) {
      console.error('Translation to other language failed, continuing with primary only:', translateError);
    }

    const englishContent = isArabic ? translatedCV : parsedCV;
    const arabicContent = isArabic ? parsedCV : translatedCV;

    const fullCvData = {
      basicInfo: { fullName, email, phone: normalizedPhone, location, jobDomain, careerLevel, latestJob },
      generatedContent: parsedCV,
      englishContent: englishContent || null,
      arabicContent: arabicContent || null,
      language: language || 'en',
      createdAt: new Date().toISOString(),
    };

    const existing = await pool.query(
      'SELECT id FROM guest_cvs WHERE email = $1 LIMIT 1',
      [email]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        'UPDATE guest_cvs SET template_id = $1, cv_data = $2, updated_at = NOW() WHERE email = $3',
        [templateId, JSON.stringify(fullCvData), email]
      );
    } else {
      await pool.query(
        'INSERT INTO guest_cvs (email, template_id, cv_data, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())',
        [email, templateId, JSON.stringify(fullCvData)]
      );
    }

    return NextResponse.json({
      success: true,
      content: parsedCV,
      cvData: fullCvData,
      englishContent: englishContent || null,
      arabicContent: arabicContent || null,
      templateId,
    });
  } catch (error: any) {
    console.error('Guest CV generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CV content' },
      { status: 500 }
    );
  }
}
