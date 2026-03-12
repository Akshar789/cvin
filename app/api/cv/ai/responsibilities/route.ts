import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { pool } from '@/server/db';
import { RESPONSIBILITIES_GENERATION_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import openai from '@/lib/ai/openaiClient';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    const userId = decoded.userId;

    const { jobTitle, company, language, existingResponsibilities, minBulletPoints = 3, maxBulletPoints = 15 } = await request.json();

    if (!jobTitle) {
      return NextResponse.json({ 
        error: 'Job title is required to generate responsibilities',
        responsibilities: [] 
      }, { status: 400 });
    }

    const userResult = await pool.query(
      `SELECT 
        career_level,
        industry,
        years_of_experience,
        target_job_domain,
        target_job_title,
        education_level,
        degree_level,
        education_specialization
      FROM users
      WHERE id = $1`,
      [userId]
    );

    if (!userResult.rows || userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userResult.rows[0];
    const isArabic = language === 'ar' || language === 'Arabic';
    const targetDomain = userData.target_job_domain || userData.target_job_title || 'General';
    
    const careerLevel = userData.career_level || 'entry';
    const yearsExp = parseInt(userData.years_of_experience) || 2;
    
    let targetBullets = 5;
    if (careerLevel.toLowerCase().includes('senior') || careerLevel.toLowerCase().includes('executive') || yearsExp > 7) {
      targetBullets = Math.min(10, maxBulletPoints);
    } else if (careerLevel.toLowerCase().includes('mid') || yearsExp > 3) {
      targetBullets = Math.min(7, maxBulletPoints);
    } else {
      targetBullets = Math.min(5, maxBulletPoints);
    }
    
    targetBullets = Math.max(minBulletPoints, Math.min(targetBullets, maxBulletPoints));

    const hasExistingResponsibilities = existingResponsibilities && Array.isArray(existingResponsibilities) && existingResponsibilities.length > 0;

    const prompt = `
Generate ${targetBullets} professional key responsibilities in ${isArabic ? 'Arabic' : 'English'} for this position.

USER-PROVIDED INFORMATION:
- Job Title: ${jobTitle}
- Company: ${company || 'Not specified'}
- Target Job Domain: ${targetDomain}
- Career Level: ${userData.career_level || 'Not specified'}
- Industry: ${userData.industry || 'Not specified'}
- Years of Experience: ${userData.years_of_experience || 'Not specified'}
- Education Level: ${userData.education_level || 'Not specified'}
- Degree Level: ${userData.degree_level || 'Not provided'}
- Education Specialization/Major: ${userData.education_specialization || 'Not provided'}

IMPORTANT: Tailor the tone and complexity of responsibilities to match the user's degree level (${userData.degree_level || 'Not provided'}) and academic background (${userData.education_specialization || 'Not provided'}).
If either field is "Not provided", use ONLY the explicitly provided values. DO NOT invent, assume, or generate these fields.

${hasExistingResponsibilities ? `EXISTING RESPONSIBILITIES TO ENHANCE:
${JSON.stringify(existingResponsibilities, null, 2)}

Please enhance these existing responsibilities while preserving their core meaning.` : ''}

STRICT RULES:
- Generate exactly ${targetBullets} bullet points
- Base responsibilities ONLY on the provided job title (${jobTitle}), company (${company || 'Not specified'}), and domain (${targetDomain})
- Start each with strong action verbs (Led, Developed, Managed, Implemented, Designed, Executed, Coordinated, Optimized, etc.)
- Focus on typical duties and potential outcomes for this role, but DO NOT invent specific percentages or metrics
- Example of GOOD: "Led cross-functional team initiatives to improve operational efficiency"
- Example of BAD: "Increased revenue by 47% through strategic initiatives" (specific metrics not provided by user)
- Be specific to the ${targetDomain} domain and ${userData.industry || 'specified'} industry
- Tailor complexity and scope to ${userData.career_level || 'entry'} level with ${userData.years_of_experience || '0-2'} years of experience
- Use ATS-friendly professional language
- Each point should be unique, meaningful, and demonstrate value
- Avoid generic statements - be specific to the role

Return ONLY a JSON object with this exact format: {"responsibilities": ["Bullet point 1", "Bullet point 2", ..., "Bullet point ${targetBullets}"]}
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: RESPONSIBILITIES_GENERATION_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.6,
      max_tokens: 800,
      response_format: { type: "json_object" }
    });

    let responsibilitiesContent = completion.choices[0].message.content || '{"responsibilities":[]}';
    responsibilitiesContent = responsibilitiesContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const parsed = JSON.parse(responsibilitiesContent);
    const responsibilities = Array.isArray(parsed.responsibilities) ? parsed.responsibilities : [];

    return NextResponse.json({ responsibilities: Array.isArray(responsibilities) ? responsibilities : [] });
  } catch (error) {
    console.error('Responsibilities generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate responsibilities' },
      { status: 500 }
    );
  }
}
