import { NextRequest, NextResponse } from 'next/server';
import openai from '@/lib/ai/openaiClient';
import { verifyToken } from '@/lib/auth/jwt';
import { db } from '@/server/db';
import { users } from '@/shared/schema';
import { eq } from 'drizzle-orm';

interface SkillsResponse {
  englishSkills: {
    technical: string[];
    soft: string[];
    tools: string[];
  };
  arabicSkills: {
    technical: string[];
    soft: string[];
    tools: string[];
  };
}

export async function POST(request: NextRequest): Promise<NextResponse<SkillsResponse | { error: string }>> {
  try {
    const body = await request.json();
    const {
      jobTitle,
      jobDomain,
      yearsOfExperience,
      educationField,
      educationDegree,
      role,
      existingSkills,
      experienceDescriptions,
    } = body;

    let isPremium = false;
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const authenticatedUser = verifyToken(authHeader.slice(7));
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, authenticatedUser.userId),
        });
        if (dbUser) {
          isPremium = dbUser.subscriptionTier !== 'free';
        }
      } catch (error) {}
    }

    const model = isPremium ? 'gpt-4o' : 'gpt-4o-mini';

    let profileContext = '';
    if (role === 'student') {
      profileContext = `STUDENT PROFILE:
- Education Field: ${educationField || 'Not specified'}
- Education Degree: ${educationDegree || 'Not specified'}`;
    } else {
      profileContext = `PROFESSIONAL PROFILE:
- Job Title: ${jobTitle || 'Not specified'}
- Job Domain: ${jobDomain || 'Not specified'}
- Years of Experience: ${yearsOfExperience || 'Not specified'}
- Education Field: ${educationField || 'Not specified'}
- Education Degree: ${educationDegree || 'Not specified'}`;
    }

    const hasExistingSkills = existingSkills && (
      (existingSkills.technical && existingSkills.technical.length > 0) ||
      (existingSkills.soft && existingSkills.soft.length > 0) ||
      (existingSkills.tools && existingSkills.tools.length > 0)
    );

    const hasExperienceDescriptions = Array.isArray(experienceDescriptions) && experienceDescriptions.some(d => d?.trim());

    const systemPrompt = `You are a senior career strategist and skills analyst with deep domain expertise. Generate highly specific, role-driven skills based strictly on the candidate's actual profile and work experience. 

CRITICAL RULES:
- Analyze the actual job responsibilities and experience provided to extract implied skills
- Generate skills that are directly relevant to the specific job title and domain — not generic lists
- AVOID these overused generic skills unless directly supported by experience: Git, Visual Studio Code, Communication, Problem-solving, Microsoft Office, Teamwork, Leadership (unless in a management role)
- Mix domain-specific technical skills with practical tools actually used in that field
- Soft skills must match the career level and role (e.g., a developer needs "Code Review" not just "Teamwork")
- Every skill must be defensible given the profile provided
- Return ONLY valid JSON with no markdown, no explanations, no code blocks`;

    const userPrompt = `Analyze this candidate profile and generate highly targeted skills:

${profileContext}
${hasExperienceDescriptions ? `
ACTUAL WORK EXPERIENCE (extract skills from these descriptions):
${experienceDescriptions.filter((d: string) => d?.trim()).map((d: string, i: number) => `${i + 1}. ${d.trim()}`).join('\n')}` : ''}
${hasExistingSkills ? `
EXISTING SKILLS (do not repeat these, generate complementary skills):
${JSON.stringify(existingSkills, null, 2)}` : ''}

Generate skills in BOTH English AND Arabic.

Return ONLY valid JSON in this exact format:
{
  "englishSkills": {
    "technical": ["skill1", "skill2", "skill3"],
    "soft": ["skill1", "skill2"],
    "tools": ["tool1", "tool2"]
  },
  "arabicSkills": {
    "technical": ["مهارة1", "مهارة2", "مهارة3"],
    "soft": ["مهارة1", "مهارة2"],
    "tools": ["أداة1", "أداة2"]
  }
}

REQUIREMENTS:
- 4-6 technical skills: specific to "${role === 'student' ? educationField : (jobTitle || jobDomain)}" — avoid generic
- 2-3 soft skills: role-appropriate, not just "Communication" or "Teamwork"
- 2-4 tools/platforms: actual tools used in this specific field and role
- Arabic must be accurate professional translations, not literal word-for-word
- Each skill must be unique and add value to the CV`;

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.78,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    let responseContent = completion.choices[0].message.content || '{}';
    responseContent = responseContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const skillsData = JSON.parse(responseContent);

    const result: SkillsResponse = {
      englishSkills: {
        technical: skillsData.englishSkills?.technical || [],
        soft: skillsData.englishSkills?.soft || [],
        tools: skillsData.englishSkills?.tools || [],
      },
      arabicSkills: {
        technical: skillsData.arabicSkills?.technical || [],
        soft: skillsData.arabicSkills?.soft || [],
        tools: skillsData.arabicSkills?.tools || [],
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Skills suggestion error:', error);
    return NextResponse.json(
      { error: 'Failed to generate skill suggestions' },
      { status: 500 }
    );
  }
}
