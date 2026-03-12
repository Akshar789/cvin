import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { pool } from '@/server/db';
import { CV_GENERATION_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import openai from '@/lib/ai/openaiClient';
import { isValidSaudiPhone, normalizeSaudiPhone } from '@/lib/utils/phoneValidation';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    const userId = decoded.userId;

    const { templateId, language, existingExperience, existingEducation, existingSkills } = await request.json();

    const userResult = await pool.query(
      `SELECT 
        full_name,
        email,
        phone_number,
        location,
        target_job_title,
        target_job_domain,
        career_level,
        industry,
        years_of_experience,
        education_level,
        degree_level,
        education_specialization,
        most_recent_job_title,
        most_recent_company,
        employment_status,
        strengths,
        career_interests,
        preferred_language
      FROM users
      WHERE id = $1`,
      [userId]
    );

    if (!userResult.rows || userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userResult.rows[0];

    if (userData.phone_number && !isValidSaudiPhone(userData.phone_number)) {
      return NextResponse.json({ error: 'Please update your profile with a valid Saudi phone number' }, { status: 400 });
    }
    const normalizedPhone = userData.phone_number ? normalizeSaudiPhone(userData.phone_number) : '';

    const isArabic = language === 'Arabic' || language === 'ar';
    const targetDomain = userData.target_job_domain || userData.target_job_title || 'General';

    const hasExperience = existingExperience && Array.isArray(existingExperience) && existingExperience.length > 0;
    const hasEducation = existingEducation && Array.isArray(existingEducation) && existingEducation.length > 0;
    const hasSkills = existingSkills && (
      (existingSkills.technical && existingSkills.technical.length > 0) ||
      (existingSkills.soft && existingSkills.soft.length > 0)
    );

    const cvPrompt = `
Generate a professional CV in ${isArabic ? 'Arabic' : 'English'} based ONLY on the following user-provided information.

USER PROFILE DATA:
- Name: ${userData.full_name || 'Not provided'}
- Email: ${userData.email || 'Not provided'}
- Phone: ${normalizedPhone || 'Not provided'}
- Location: ${userData.location || 'Not provided'}
- Target Job Domain: ${targetDomain}
- Target Job Title: ${userData.target_job_title || 'Not specified'}
- Career Level: ${userData.career_level || 'Not specified'}
- Industry: ${userData.industry || 'Not specified'}
- Years of Experience: ${userData.years_of_experience || 'Not specified'}
- Education Level: ${userData.education_level || 'Not specified'}
- Degree Level: ${userData.degree_level || 'Not specified'}
- Education Specialization/Major: ${userData.education_specialization || 'Not specified'}
- Most Recent Job: ${userData.most_recent_job_title || 'Not provided'} at ${userData.most_recent_company || 'Not provided'}
- Employment Status: ${userData.employment_status || 'Not specified'}
- Strengths: ${userData.strengths ? JSON.stringify(userData.strengths) : 'Not provided'}
- Career Interests: ${userData.career_interests ? JSON.stringify(userData.career_interests) : 'Not provided'}

IMPORTANT INSTRUCTIONS:
Use the degree level (${userData.degree_level}) and education specialization (${userData.education_specialization}) to:
- Tailor the professional summary to reflect the user's field of study
- Suggest skills aligned with ${userData.education_specialization}
- Ensure tone and keywords match the user's academic background
- Align recommendations with both their specialization and target job domain (${targetDomain})
CRITICAL: DO NOT invent degrees or specializations. Only use the explicit values provided above.

${hasExperience ? `USER-PROVIDED EXPERIENCE:
${JSON.stringify(existingExperience, null, 2)}` : `EXPERIENCE: User has NOT provided any experience entries. DO NOT generate fictional experience. Return "experience": []`}

${hasEducation ? `USER-PROVIDED EDUCATION:
${JSON.stringify(existingEducation, null, 2)}` : `EDUCATION: User has NOT provided specific education entries. You may create a single entry based on their education level (${userData.education_level}) but DO NOT invent specific institutions or dates.`}

${hasSkills ? `USER-PROVIDED SKILLS:
${JSON.stringify(existingSkills, null, 2)}` : `SKILLS: Generate relevant skills for the ${targetDomain} domain at ${userData.career_level} level.`}

CRITICAL INSTRUCTIONS:
1. For personalInfo: Use ONLY the exact data provided above. If a field says "Not provided", leave it as empty string.
2. For professionalSummary: Write a 2-3 sentence summary based ONLY on the profile data (career level, domain, industry, years of experience). DO NOT invent achievements.
3. For experience: ${hasExperience ? 'Enhance the provided experience entries.' : 'Return an EMPTY array []. DO NOT create fictional job entries.'}
4. For education: ${hasEducation ? 'Use the provided education data.' : 'Create one entry based on education level only if it is specified.'}
5. For skills: ${hasSkills ? 'Use the provided skills.' : 'Generate realistic skills for the target domain and career level.'}
6. For certifications: Return empty array [] unless user provided certifications.
7. For languages: Include the CV language (${isArabic ? 'العربية' : 'English'}).

Return ONLY valid JSON in this exact format:
{
  "personalInfo": {
    "fullName": "${userData.full_name || ''}",
    "email": "${userData.email || ''}",
    "phone": "${normalizedPhone || ''}",
    "location": "${userData.location || ''}",
    "targetJobTitle": "${userData.target_job_title || ''}"
  },
  "professionalSummary": "Based ONLY on user profile - 2-3 sentences about their career level, domain expertise, and goals",
  "experience": [],
  "education": [],
  "skills": {
    "technical": [],
    "soft": [],
    "tools": []
  },
  "certifications": [],
  "languages": ["${isArabic ? 'العربية' : 'English'}"]
}

REMEMBER: If user did not provide experience, education, or certifications - return empty arrays. Never fabricate data.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: CV_GENERATION_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: cvPrompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 2500,
      response_format: { type: "json_object" }
    });

    let cvContent = completion.choices[0].message.content || '{}';
    cvContent = cvContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsedCV = JSON.parse(cvContent);

    const otherLang = isArabic ? 'English' : 'Arabic';
    const translatePrompt = `Translate the following CV content from ${isArabic ? 'Arabic' : 'English'} to ${otherLang}.

CRITICAL RULES:
1. DO NOT translate: person names, email addresses, phone numbers, dates, company names, institution names, URLs
2. DO translate: job titles, professional summaries, descriptions, skill names, skill categories, degree names, field of study, certifications, locations
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
      console.error('Translation to other language failed:', translateError);
    }

    const englishContent = isArabic ? translatedCV : parsedCV;
    const arabicContent = isArabic ? parsedCV : translatedCV;

    return NextResponse.json({
      content: parsedCV,
      englishContent: englishContent || null,
      arabicContent: arabicContent || null,
      templateId,
      language
    });
  } catch (error) {
    console.error('CV generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CV' },
      { status: 500 }
    );
  }
}
