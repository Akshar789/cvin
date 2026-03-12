import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import openai from '@/lib/ai/openaiClient';

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const isPremium = user.subscriptionTier && user.subscriptionTier !== 'free';
    if (!isPremium) {
      return NextResponse.json(
        { error: 'Job Analyst is a premium feature. Please upgrade to access this functionality.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { jobDescription, cvData, language = 'en' } = body;

    if (!jobDescription || !jobDescription.trim()) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    if (!cvData) {
      return NextResponse.json(
        { error: 'CV data is required' },
        { status: 400 }
      );
    }

    const isAr = language === 'ar';
    const model = user.subscriptionTier === 'premium' || user.subscriptionTier === 'lifetime' || user.subscriptionTier === 'admin'
      ? 'gpt-4o'
      : 'gpt-4o-mini';

    const cvSkills = [
      ...(cvData.skills?.technical || []),
      ...(cvData.skills?.soft || []),
      ...(cvData.skills?.tools || []),
      ...(Array.isArray(cvData.skills) ? cvData.skills : []),
    ].filter(Boolean);

    const cvSummary = {
      name: cvData.name || cvData.firstName || '',
      jobTitle: cvData.jobTitle || cvData.targetJobTitle || '',
      yearsOfExperience: cvData.yearsOfExperience || 0,
      skills: cvSkills.slice(0, 30),
      experience: (cvData.experience || []).slice(0, 5).map((e: any) => ({
        position: e.position || e.jobTitle || '',
        company: e.company || e.employer || '',
        description: e.description || '',
      })),
      education: (cvData.education || []).slice(0, 3).map((e: any) => ({
        degree: e.degree || '',
        institution: e.institution || e.school || '',
      })),
      certifications: (cvData.certifications || []).slice(0, 5).map((c: any) => c.name || c),
      summary: cvData.professionalSummary || cvData.summary || '',
    };

    const prompt = `You are an expert career coach and job analyst. Analyze the match between this candidate's CV and the given job description.

JOB DESCRIPTION:
${jobDescription.slice(0, 3000)}

CANDIDATE CV SUMMARY:
- Name: ${cvSummary.name}
- Current/Target Job Title: ${cvSummary.jobTitle}
- Years of Experience: ${cvSummary.yearsOfExperience}
- Skills: ${cvSummary.skills.join(', ') || 'Not specified'}
- Work Experience: ${cvSummary.experience.map((e: any) => `${e.position} at ${e.company}`).join('; ') || 'Not specified'}
- Education: ${cvSummary.education.map((e: any) => `${e.degree} from ${e.institution}`).join('; ') || 'Not specified'}
- Certifications: ${cvSummary.certifications.join(', ') || 'None'}
- Professional Summary: ${cvSummary.summary.slice(0, 300) || 'Not provided'}

Provide a comprehensive job match analysis. Respond in ${isAr ? 'Arabic' : 'English'}.

Return ONLY valid JSON (no markdown, no code blocks) with this exact structure:
{
  "overallMatch": <number 0-100>,
  "matchLevel": "<Excellent|Good|Fair|Low>",
  "matchLevelAr": "<ممتاز|جيد|مقبول|منخفض>",
  "summary": "<2-3 sentence match summary>",
  "summaryAr": "<ملخص المطابقة بالعربية>",
  "matchingSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "keyRequirements": [
    { "requirement": "...", "met": true, "note": "..." }
  ],
  "strengths": ["strength1", "strength2", "strength3"],
  "strengthsAr": ["نقطة قوة 1", "نقطة قوة 2"],
  "gaps": ["gap1", "gap2", "gap3"],
  "gapsAr": ["ثغرة 1", "ثغرة 2"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "recommendationsAr": ["توصية 1", "توصية 2", "توصية 3"],
  "cvImprovements": ["improvement1", "improvement2"],
  "cvImprovementsAr": ["تحسين 1", "تحسين 2"],
  "jobTitle": "<extracted job title from JD>",
  "company": "<company name if mentioned, or empty string>",
  "experienceRequired": "<experience requirement from JD>",
  "salaryMentioned": "<salary info if mentioned, or empty string>"
}`;

    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 2000,
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const analysis = JSON.parse(cleaned);

    return NextResponse.json({ analysis, generatedAt: new Date().toISOString() });
  } catch (error: any) {
    console.error('Job analyst error:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Failed to parse AI response. Please try again.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to analyze job description. Please try again.' }, { status: 500 });
  }
});
