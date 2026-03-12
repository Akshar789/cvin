import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { pool } from '@/server/db';
import { SKILLS_GENERATION_SYSTEM_PROMPT } from '@/lib/ai/prompts';
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

    const { language, existingSkills, experienceDescriptions } = await request.json();

    const userResult = await pool.query(
      `SELECT 
        target_job_domain,
        target_job_title,
        career_level,
        industry,
        years_of_experience,
        education_level,
        degree_level,
        education_specialization,
        strengths
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

    const hasExistingSkills = existingSkills && (
      (existingSkills.technical && existingSkills.technical.length > 0) ||
      (existingSkills.soft && existingSkills.soft.length > 0) ||
      (existingSkills.professional && existingSkills.professional.length > 0) ||
      (existingSkills.tools && existingSkills.tools.length > 0)
    );

    const hasExperienceDescriptions = Array.isArray(experienceDescriptions) && experienceDescriptions.some((d: string) => d?.trim());

    const prompt = `
Generate highly targeted, role-specific professional skills in ${isArabic ? 'Arabic' : 'English'} for this candidate:

USER PROFILE:
- Target Job Domain: ${targetDomain}
- Target Job Title: ${userData.target_job_title || 'Not specified'}
- Career Level: ${userData.career_level || 'Not specified'}
- Industry: ${userData.industry || 'Not specified'}
- Years of Experience: ${userData.years_of_experience || 'Not specified'}
- Education Specialization/Major: ${userData.education_specialization || 'Not provided'}
- User-Stated Strengths: ${userData.strengths ? JSON.stringify(userData.strengths) : 'Not provided'}
${hasExperienceDescriptions ? `
ACTUAL WORK EXPERIENCE (extract specific skills from these descriptions):
${(experienceDescriptions as string[]).filter((d: string) => d?.trim()).map((d: string, i: number) => `${i + 1}. ${d.trim()}`).join('\n')}` : ''}

SKILLS GENERATION RULES:
- Analyze the experience descriptions above to extract domain-specific skills actually demonstrated
- Avoid overused generic skills: Git, Visual Studio Code, Communication, Problem-solving, Microsoft Office, Teamwork (unless evidence exists in experience)
- Technical skills must be specific to "${targetDomain}" — not generic programming skills
- Tools must be industry-standard for this exact domain and role
- Soft skills must match career level and actual demonstrated behaviors
- Every skill must be directly relevant to the role and defensible from the profile

${hasExistingSkills ? `EXISTING SKILLS (generate complementary skills, avoid repetition):
${JSON.stringify(existingSkills, null, 2)}` : ''}

Return ONLY valid JSON in this exact format:
{
  "technical": ["skill1", "skill2", "skill3"],
  "professional": ["skill1", "skill2"],
  "soft": ["skill1", "skill2", "skill3"],
  "tools": ["tool1", "tool2"]
}

Requirements:
- 4-6 technical: domain-specific hard skills for "${targetDomain}"
- 2-3 professional: industry-aligned competencies
- 2-3 soft: role-appropriate behavioral skills
- 2-3 tools: actual tools/platforms for this specific field
- Use ATS-friendly, industry-standard terminology
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: SKILLS_GENERATION_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.78,
      max_tokens: 600,
      response_format: { type: "json_object" }
    });

    let skillsContent = completion.choices[0].message.content || '{}';
    skillsContent = skillsContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const skills = JSON.parse(skillsContent);

    return NextResponse.json({ skills });
  } catch (error) {
    console.error('Skills generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate skills' },
      { status: 500 }
    );
  }
}
