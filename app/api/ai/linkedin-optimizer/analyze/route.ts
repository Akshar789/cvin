import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import openai from '@/lib/ai/openaiClient';

interface CVData {
  name?: string;
  headline?: string;
  about?: string;
  experience?: Array<{
    position: string;
    company: string;
    description?: string;
    responsibilities?: string[];
    startDate?: string;
    endDate?: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    startDate?: string;
    endDate?: string;
  }>;
  skills?: string[];
  certifications?: Array<{
    name: string;
    issuer?: string;
  }>;
  targetJobDomain?: string;
}

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const isPremium = user.subscriptionTier && user.subscriptionTier !== 'free';
    if (!isPremium) {
      return NextResponse.json(
        { error: 'LinkedIn Optimizer is a premium feature. Please upgrade to access this functionality.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { linkedInUrl, cvData, targetJobDomain } = body;

    if (!cvData && !linkedInUrl) {
      return NextResponse.json(
        { error: 'Either CV data or LinkedIn URL is required' },
        { status: 400 }
      );
    }

    const profileData = cvData || {};
    const targetDomain = targetJobDomain || profileData.targetJobDomain || 'general professional';

    const currentHeadline = profileData.headline || `${profileData.experience?.[0]?.position || 'Professional'} | ${targetDomain}`;
    const currentAbout = profileData.about || profileData.professionalSummary || '';
    const experiences = profileData.experience || [];
    const allSkills = [
      ...(profileData.skills?.technical || []),
      ...(profileData.skills?.soft || []),
      ...(profileData.skills?.tools || []),
      ...(Array.isArray(profileData.skills) ? profileData.skills : [])
    ];

    const systemPrompt = `You are an expert LinkedIn profile optimizer with deep knowledge of:
- LinkedIn SEO best practices
- ATS (Applicant Tracking System) optimization
- Personal branding for professionals
- Recruiter preferences and search patterns

CRITICAL RULES:
1. NEVER invent or fabricate information. Only use and reorganize existing content.
2. NEVER add fake companies, achievements, certifications, dates, or job titles.
3. All rewrites must be based ONLY on the provided profile data.
4. Use recruiter-friendly language and industry-specific keywords.
5. Headlines should be 120-220 characters.
6. About sections should be 200-260 words.
7. Use 3-5 bullet points per job with measurable achievements.
8. Apply STAR/CAR framework for experience descriptions.

Respond in JSON format only.`;

    const userPrompt = `Analyze and optimize this LinkedIn profile data:

CURRENT PROFILE DATA:
Name: ${profileData.name || 'Not provided'}
Current Headline: ${currentHeadline}
About/Summary: ${currentAbout || 'Not provided'}
Target Job Domain: ${targetDomain}

Experience:
${experiences.map((exp: any) => `
- Position: ${exp.position || 'Not specified'}
  Company: ${exp.company || 'Not specified'}
  Duration: ${exp.startDate || ''} - ${exp.endDate || 'Present'}
  Description: ${exp.description || ''}
  Responsibilities: ${(exp.responsibilities || []).join('; ') || 'None listed'}
`).join('\n')}

Skills: ${allSkills.join(', ') || 'None listed'}

Certifications: ${(profileData.certifications || []).map((c: any) => c.name).join(', ') || 'None listed'}

Generate the following optimizations (respond in JSON format):

{
  "headlines": [
    {"text": "ATS-friendly headline", "type": "ats", "typeAr": "متوافق مع ATS"},
    {"text": "Keyword-rich headline", "type": "keyword", "typeAr": "غني بالكلمات المفتاحية"},
    {"text": "Recruiter-attractive headline", "type": "recruiter", "typeAr": "جذاب للموظفين"}
  ],
  "aboutVariations": [
    {"text": "Corporate tone version", "tone": "corporate", "toneAr": "نبرة رسمية"},
    {"text": "Conversational tone version", "tone": "conversational", "toneAr": "نبرة محادثة"},
    {"text": "Leadership tone version", "tone": "leadership", "toneAr": "نبرة قيادية"}
  ],
  "experienceImprovements": [
    {
      "position": "Job Title",
      "company": "Company Name",
      "original": "Original description",
      "improved": "Improved description with STAR format and measurable outcomes"
    }
  ],
  "skillsToAdd": [
    {"skill": "Skill name", "reason": "Why to add", "reasonAr": "سبب الإضافة", "priority": "high|medium|low"}
  ],
  "skillsToImprove": [
    {"skill": "Skill name", "reason": "How to improve visibility", "reasonAr": "كيفية تحسين الظهور", "priority": "high|medium|low"}
  ],
  "missingSkills": [
    {"skill": "Skill name", "reason": "Required for target role", "reasonAr": "مطلوب للوظيفة المستهدفة", "priority": "high|medium|low"}
  ],
  "profileScore": {
    "overall": 75,
    "completeness": 80,
    "keywords": 70,
    "summary": 75,
    "experience": 80,
    "achievements": 65,
    "branding": 70
  }
}

IMPORTANT: 
- Only rewrite/reorganize existing content, never fabricate new information
- Base all suggestions on the actual data provided
- Headlines must be under 220 characters
- About sections should be 200-260 words
- Include industry-relevant keywords for ${targetDomain}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 4000,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No response from AI');
    }

    let report;
    try {
      report = JSON.parse(responseContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseContent);
      throw new Error('Invalid AI response format');
    }

    report.generatedAt = new Date().toISOString();

    if (!report.headlines || report.headlines.length === 0) {
      report.headlines = [
        { text: currentHeadline, type: 'original', typeAr: 'الأصلي' }
      ];
    }

    if (!report.aboutVariations || report.aboutVariations.length === 0) {
      report.aboutVariations = [
        { text: currentAbout || 'Please add a professional summary', tone: 'original', toneAr: 'الأصلي' }
      ];
    }

    if (!report.experienceImprovements) {
      report.experienceImprovements = experiences.slice(0, 3).map((exp: any) => ({
        position: exp.position || 'Position',
        company: exp.company || 'Company',
        original: exp.description || (exp.responsibilities || []).join('. ') || 'No description provided',
        improved: exp.description || (exp.responsibilities || []).join('. ') || 'Please add job responsibilities'
      }));
    }

    if (!report.skillsToAdd) report.skillsToAdd = [];
    if (!report.skillsToImprove) report.skillsToImprove = [];
    if (!report.missingSkills) report.missingSkills = [];

    if (!report.profileScore) {
      report.profileScore = {
        overall: 60,
        completeness: 65,
        keywords: 55,
        summary: 60,
        experience: 70,
        achievements: 50,
        branding: 55
      };
    }

    return NextResponse.json({ 
      report,
      success: true
    });

  } catch (error: any) {
    console.error('LinkedIn optimizer analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze profile' },
      { status: 500 }
    );
  }
});
