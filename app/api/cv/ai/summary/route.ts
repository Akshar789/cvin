import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { pool } from '@/server/db';
import { SUMMARY_GENERATION_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import openai from '@/lib/ai/openaiClient';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set');
      return NextResponse.json(
        { error: 'JWT secret is not configured' },
        { status: 500 }
      );
    }

    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set');
      return NextResponse.json(
        { error: 'Database connection is not configured' },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in token' }, { status: 401 });
    }

    let requestBody;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      console.error('Request body parse error:', parseError);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { language, existingSummary } = requestBody;

    let consentResult;
    try {
      consentResult = await pool.query(
        'SELECT ai_generation_consent FROM user_consent WHERE user_id = $1',
        [userId]
      );
    } catch (dbError) {
      console.error('Database query error (consent):', dbError);
      return NextResponse.json(
        { error: 'Failed to check user consent' },
        { status: 500 }
      );
    }
    
    if (!consentResult.rows || consentResult.rows.length === 0 || !consentResult.rows[0].ai_generation_consent) {
      return NextResponse.json({ 
        error: 'AI generation consent not provided. Please accept privacy settings to use AI features.' 
      }, { status: 403 });
    }

    let userResult;
    try {
      userResult = await pool.query(
        `SELECT 
          target_job_domain,
          target_job_title,
          career_level,
          industry,
          years_of_experience,
          education_level,
          degree_level,
          education_specialization,
          strengths,
          career_interests,
          most_recent_job_title,
          most_recent_company
        FROM users
        WHERE id = $1`,
        [userId]
      );
    } catch (dbError) {
      console.error('Database query error (user):', dbError);
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      );
    }

    if (!userResult.rows || userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userResult.rows[0];
    const isArabic = language === 'ar' || language === 'Arabic';
    const targetDomain = userData.target_job_domain || userData.target_job_title || 'General';

    const prompt = `
Write a professional CV summary in ${isArabic ? 'Arabic' : 'English'} based ONLY on this user profile data:

USER PROFILE:
- Target Job Domain: ${targetDomain}
- Target Job Title: ${userData.target_job_title || 'Not specified'}
- Career Level: ${userData.career_level || 'Not specified'}
- Industry: ${userData.industry || 'Not specified'}
- Years of Experience: ${userData.years_of_experience || 'Not specified'}
- Education Level: ${userData.education_level || 'Not specified'}
- Degree Level: ${userData.degree_level || 'Not provided'}
- Education Specialization/Major: ${userData.education_specialization || 'Not provided'}
- Most Recent Role: ${userData.most_recent_job_title || 'Not provided'} at ${userData.most_recent_company || 'Not provided'}
- Strengths: ${userData.strengths ? JSON.stringify(userData.strengths) : 'Not provided'}
- Career Interests: ${userData.career_interests ? JSON.stringify(userData.career_interests) : 'Not provided'}

IMPORTANT: Use the degree level (${userData.degree_level || 'Not provided'}) and education specialization (${userData.education_specialization || 'Not provided'}) to tailor the summary. 
If either field is "Not provided", use ONLY the explicitly provided values. DO NOT invent, assume, or generate these fields.
Align the summary with the user's academic background and target job domain.

${existingSummary ? `EXISTING SUMMARY TO IMPROVE:
${existingSummary}

Please enhance this summary while keeping its factual content.` : ''}

STRICT RULES:
- Write 2-3 sentences maximum (60-80 words)
- Base the summary ONLY on the data provided above
- DO NOT invent specific achievements, metrics, or accomplishments
- DO NOT mention specific companies or projects not listed above
- Highlight expertise and value proposition based on career level and domain
- Use ATS-friendly keywords relevant to the ${targetDomain} domain
- Professional, compelling tone appropriate for ${userData.career_level || 'the specified'} level
- Return ONLY the summary text with no additional formatting
`;

    let completion;
    try {
      completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: SUMMARY_GENERATION_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.6,
        max_tokens: 200,
      });
    } catch (openaiError: any) {
      console.error('OpenAI API error:', openaiError);
      const errorMessage = openaiError?.response?.data?.error?.message || openaiError?.message || 'Unknown OpenAI error';
      return NextResponse.json(
        { error: `OpenAI API error: ${errorMessage}` },
        { status: 500 }
      );
    }

    const summary = completion.choices[0].message.content?.trim() || '';

    if (!summary) {
      console.error('Empty summary returned from OpenAI');
      return NextResponse.json(
        { error: 'Failed to generate summary: Empty response from AI' },
        { status: 500 }
      );
    }

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('Summary generation error:', error);
    const errorMessage = error?.message || 'Unknown error occurred';
    return NextResponse.json(
      { error: `Failed to generate summary: ${errorMessage}` },
      { status: 500 }
    );
  }
}
