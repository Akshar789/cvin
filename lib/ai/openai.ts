import { 
  TEXT_IMPROVEMENT_SYSTEM_PROMPT, 
  ATS_SCORE_SYSTEM_PROMPT, 
  COVER_LETTER_SYSTEM_PROMPT,
  INTERVIEW_SYSTEM_PROMPT,
  INTERVIEW_PREP_SYSTEM_PROMPT,
  CVIN_AI_SYSTEM_PROMPT
} from './prompts';
import openai from './openaiClient';

export function getModel(isPremium: boolean): string {
  return isPremium ? "gpt-4o" : "gpt-4o-mini";
}

export async function improveText(text: string, context: string = "professional CV", isPremium: boolean = false): Promise<string> {
  const response = await openai.chat.completions.create({
    model: getModel(isPremium),
    messages: [
      {
        role: "system",
        content: TEXT_IMPROVEMENT_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: `Improve the following text for a ${context}. 

STRICT RULES:
- ONLY enhance, rewrite, or improve the text provided
- DO NOT add new information, achievements, or claims not present in the original
- Improve clarity, impact, and ATS-friendliness while preserving the original meaning
- Use stronger action verbs and professional language
- Maintain the same factual content - only improve the presentation

Original Text:
${text}

Return only the improved version of the text with no additional commentary.`,
      },
    ],
    max_completion_tokens: 2048,
  });

  return response.choices[0].message.content || text;
}

export async function generateCoverLetter(params: {
  cvData: any;
  jobTitle: string;
  company: string;
  jobDescription?: string;
  language: string;
  isPremium?: boolean;
}): Promise<string> {
  const { cvData, jobTitle, company, jobDescription, language, isPremium = false } = params;

  const prompt = `Generate a professional cover letter in ${language === 'ar' ? 'Arabic' : 'English'} based ONLY on the following user-provided data:

Job Application Details:
- Job Title: ${jobTitle}
- Company: ${company}
${jobDescription ? `- Job Description: ${jobDescription}` : ''}

Candidate Information (USER PROVIDED):
- Name: ${cvData.personalInfo?.name || cvData.personalInfo?.fullName || 'Candidate'}
- Email: ${cvData.personalInfo?.email || ''}
${cvData.summary || cvData.professionalSummary ? `- Summary: ${cvData.summary || cvData.professionalSummary}` : ''}

${cvData.experience && cvData.experience.length > 0 ? `Experience: ${JSON.stringify(cvData.experience)}` : 'Experience: Not provided'}
${cvData.education && cvData.education.length > 0 ? `Education: ${JSON.stringify(cvData.education)}` : 'Education: Not provided'}
${cvData.skills ? `Skills: ${JSON.stringify(cvData.skills)}` : 'Skills: Not provided'}

STRICT RULES:
- Base the cover letter ONLY on the user-provided CV data above
- DO NOT invent achievements, experiences, or qualifications not mentioned
- Highlight relevant experience from the CV that matches the job requirements
- If certain experience is not provided, focus on the skills and qualifications that ARE provided
- Create a compelling, personalized letter that maintains honesty and accuracy`;

  const response = await openai.chat.completions.create({
    model: getModel(isPremium),
    messages: [
      {
        role: "system",
        content: COVER_LETTER_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_completion_tokens: 2048,
  });

  return response.choices[0].message.content || '';
}

export async function calculateATSScore(cvData: any, isPremium: boolean = false): Promise<{
  score: number;
  suggestions: string[];
  strengths: string[];
}> {
  const prompt = `Analyze this CV for ATS (Applicant Tracking System) compatibility and provide a score from 0-100 along with specific suggestions for improvement.

CV Data: ${JSON.stringify(cvData, null, 2)}

STRICT RULES:
- Score based ONLY on the content provided in the CV
- Suggestions should focus on improving PRESENTATION of existing content
- DO NOT suggest adding experience or skills the user hasn't provided
- Focus on formatting, keyword optimization, and structure improvements
- Identify strengths based on what IS present in the CV

Return your analysis in JSON format with:
{
  "score": number (0-100),
  "suggestions": ["suggestion1", "suggestion2", ...],
  "strengths": ["strength1", "strength2", ...]
}`;

  const response = await openai.chat.completions.create({
    model: getModel(isPremium),
    messages: [
      {
        role: "system",
        content: ATS_SCORE_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 2048,
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  return {
    score: result.score || 0,
    suggestions: result.suggestions || [],
    strengths: result.strengths || [],
  };
}

export async function tailorCVToJob(cvData: any, jobDescription: string, isPremium: boolean = false): Promise<any> {
  const prompt = `Tailor this CV to match the following job description. 

STRICT RULES:
- Keep the candidate's ACTUAL experience - DO NOT add fictional jobs or achievements
- Only EMPHASIZE and REWORD existing content to match job requirements
- DO NOT invent new skills, experiences, or accomplishments
- If certain job requirements aren't matched by the CV, leave them unaddressed
- Optimize wording and keywords while maintaining factual accuracy

Job Description:
${jobDescription}

Current CV:
${JSON.stringify(cvData, null, 2)}

Return the complete CV structure with optimized wording. Only modify how existing content is presented, not the facts themselves.`;

  const response = await openai.chat.completions.create({
    model: getModel(isPremium),
    messages: [
      {
        role: "system",
        content: `${CVIN_AI_SYSTEM_PROMPT}

You are an expert CV tailor. Optimize CVs for specific job descriptions while maintaining complete honesty and accuracy. Never add fictional content. Respond with JSON.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 4096,
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}

export async function optimizeLinkedInProfile(profileData: any, isPremium: boolean = false): Promise<string> {
  const prompt = `Optimize this LinkedIn profile for professional visibility and recruiter appeal:

${JSON.stringify(profileData, null, 2)}

STRICT RULES:
- Base suggestions ONLY on the provided profile data
- DO NOT suggest adding fake achievements or experiences
- Focus on improving presentation of existing content
- Recommend keywords relevant to their actual background

Provide specific suggestions for:
- Headline (based on their actual role/target)
- About section (enhancing their actual story)
- Experience descriptions (improving existing content)
- Skills to highlight (from what they actually have)
- Keywords to include (relevant to their real background)`;

  const response = await openai.chat.completions.create({
    model: getModel(isPremium),
    messages: [
      {
        role: "system",
        content: `${CVIN_AI_SYSTEM_PROMPT}

You are a LinkedIn optimization expert. Help professionals improve their LinkedIn profiles for maximum visibility and impact while maintaining honesty.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_completion_tokens: 2048,
  });

  return response.choices[0].message.content || '';
}

export async function generateInterviewQuestions(params: {
  cvData: any;
  jobDescription?: string;
  language: string;
  isPremium?: boolean;
}): Promise<string[]> {
  const { cvData, jobDescription, language, isPremium = false } = params;

  const prompt = `Generate 10-15 likely interview questions in ${language === 'ar' ? 'Arabic' : 'English'} based on this CV${jobDescription ? ' and job description' : ''}.

CV: ${JSON.stringify(cvData, null, 2)}
${jobDescription ? `Job Description: ${jobDescription}` : ''}

RULES:
- Generate questions relevant to the candidate's ACTUAL background in the CV
- Include behavioral questions based on their stated experience
- Include technical questions relevant to their domain
- DO NOT assume experience or skills not mentioned in the CV

Return as JSON array: { "questions": ["question1", "question2", ...] }`;

  const response = await openai.chat.completions.create({
    model: getModel(isPremium),
    messages: [
      {
        role: "system",
        content: INTERVIEW_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 2048,
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  return result.questions || [];
}

export async function careerCoachChat(message: string, conversationHistory: any[] = [], isPremium: boolean = false): Promise<string> {
  const messages: any[] = [
    {
      role: "system",
      content: `${CVIN_AI_SYSTEM_PROMPT}

You are CVin AI Career Coach, a friendly and knowledgeable career advisor. Help users with CV writing, job search strategies, career development, interview preparation, and professional growth. 

RULES:
- Be supportive, practical, and action-oriented
- Base advice on what the user tells you - don't assume their background
- Ask clarifying questions when needed rather than making assumptions
- Never suggest fabricating experience or qualifications`,
    },
    ...conversationHistory,
    {
      role: "user",
      content: message,
    },
  ];

  const response = await openai.chat.completions.create({
    model: getModel(isPremium),
    messages,
    max_completion_tokens: 1024,
  });

  return response.choices[0].message.content || '';
}

export interface InterviewPrepResult {
  beforeInterview: {
    tips: string[];
    personalizedGuidance: string[];
    practiceQuestions: string[];
  };
  duringInterview: {
    expectedQuestionTypes: string[];
    communicationAdvice: string[];
    behaviorGuidelines: string[];
    scenarioQuestions: string[];
  };
  afterInterview: {
    followUpSteps: string[];
    thankYouEmailTemplate: string;
    reflectionQuestions: string[];
    improvementAdvice: string[];
  };
}

export async function generateInterviewPrep(params: {
  cvData: any;
  experienceLevel: string;
  interviewStage: string;
  interviewType: string;
  targetRole?: string;
  industry?: string;
  language: string;
  isPremium?: boolean;
}): Promise<InterviewPrepResult> {
  const { cvData, experienceLevel, interviewStage, interviewType, targetRole, industry, language, isPremium = false } = params;

  const skills = cvData?.skills?.flatMap((s: any) => s.skillsList || []) || [];
  const experiences = cvData?.experience || [];
  const education = cvData?.education || [];

  const prompt = `Generate comprehensive interview preparation content in ${language === 'ar' ? 'Arabic' : 'English'} based on the following candidate profile:

CANDIDATE PROFILE (USER PROVIDED):
- Experience Level: ${experienceLevel}
- Target Job Role: ${targetRole || cvData?.personalInfo?.headline || 'Not specified'}
- Industry: ${industry || 'Not specified'}
- Skills: ${skills.slice(0, 15).join(', ') || 'Not provided'}
- Education: ${education.map((e: any) => `${e.degree} in ${e.field}`).join(', ') || 'Not provided'}
- Work Experience: ${experiences.length} positions
${experiences.slice(0, 3).map((exp: any) => `  - ${exp.position} at ${exp.company}`).join('\n')}

INTERVIEW CONTEXT:
- Interview Stage Focus: ${interviewStage} (Before/During/After)
- Interview Type: ${interviewType} (Technical/Behavioral/Both)

STRICT RULES:
- Base ALL content on the user's ACTUAL CV data provided above
- Generate questions relevant to their stated skills and experience level
- DO NOT invent experiences or skills not mentioned
- Tailor difficulty to their experience level (${experienceLevel})
- Make tips actionable and specific to their background
- Include role-specific content for ${targetRole || 'their target role'}

Generate a complete interview preparation package with:

1. BEFORE INTERVIEW:
   - 5 actionable preparation tips tailored to their profile
   - 3-5 personalized guidance points based on their CV
   - 5-7 practice questions to prepare (mix of technical and behavioral based on interview type)

2. DURING INTERVIEW:
   - Types of questions to expect for their role
   - Communication advice specific to their experience level
   - Behavior guidelines for interview success
   - 5-7 scenario-based questions they might face

3. AFTER INTERVIEW:
   - Follow-up steps and timeline
   - Thank you email template customized for their target role
   - Reflection questions for self-improvement
   - Advice for continuous improvement

Return as JSON with this exact structure:
{
  "beforeInterview": {
    "tips": ["tip1", "tip2", ...],
    "personalizedGuidance": ["guidance1", "guidance2", ...],
    "practiceQuestions": ["question1", "question2", ...]
  },
  "duringInterview": {
    "expectedQuestionTypes": ["type1", "type2", ...],
    "communicationAdvice": ["advice1", "advice2", ...],
    "behaviorGuidelines": ["guideline1", "guideline2", ...],
    "scenarioQuestions": ["question1", "question2", ...]
  },
  "afterInterview": {
    "followUpSteps": ["step1", "step2", ...],
    "thankYouEmailTemplate": "Full email template text here",
    "reflectionQuestions": ["question1", "question2", ...],
    "improvementAdvice": ["advice1", "advice2", ...]
  }
}`;

  const response = await openai.chat.completions.create({
    model: getModel(isPremium),
    messages: [
      {
        role: "system",
        content: INTERVIEW_PREP_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 4096,
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  
  return {
    beforeInterview: {
      tips: result.beforeInterview?.tips || [],
      personalizedGuidance: result.beforeInterview?.personalizedGuidance || [],
      practiceQuestions: result.beforeInterview?.practiceQuestions || [],
    },
    duringInterview: {
      expectedQuestionTypes: result.duringInterview?.expectedQuestionTypes || [],
      communicationAdvice: result.duringInterview?.communicationAdvice || [],
      behaviorGuidelines: result.duringInterview?.behaviorGuidelines || [],
      scenarioQuestions: result.duringInterview?.scenarioQuestions || [],
    },
    afterInterview: {
      followUpSteps: result.afterInterview?.followUpSteps || [],
      thankYouEmailTemplate: result.afterInterview?.thankYouEmailTemplate || '',
      reflectionQuestions: result.afterInterview?.reflectionQuestions || [],
      improvementAdvice: result.afterInterview?.improvementAdvice || [],
    },
  };
}

export async function generateIDP(params: {
  cvData: any;
  targetRole?: string;
  timeframe?: string;
  language: string;
  isPremium?: boolean;
}): Promise<string> {
  const { cvData, targetRole, timeframe = '12 months', language, isPremium = false } = params;

  const prompt = `Create a detailed Individual Development Plan (IDP) in ${language === 'ar' ? 'Arabic' : 'English'} for the following professional:

Current Background (USER PROVIDED):
${JSON.stringify(cvData, null, 2)}

${targetRole ? `Target Role: ${targetRole}` : 'Target: Career advancement and professional growth'}
Timeframe: ${timeframe}

STRICT RULES:
- Base the IDP on the user's ACTUAL current skills and experience shown above
- Identify REALISTIC skill gaps based on their current level
- DO NOT assume they have skills or experience not mentioned
- Goals should be achievable from their current position

Generate a comprehensive IDP that includes:
1. **Professional Goals**: 3-5 specific, measurable career objectives (realistic for their level)
2. **Skill Development Plan**: Technical and soft skills to develop, with specific actions
3. **Action Items**: Concrete steps to achieve each goal
4. **Timeline**: Milestones and deadlines
5. **Key Performance Indicators (KPIs)**: Measurable success metrics
6. **Resources Needed**: Courses, certifications, mentorship, tools
7. **Potential Obstacles**: Challenges and mitigation strategies

Make it actionable, realistic, and tailored to their current experience level.`;

  const response = await openai.chat.completions.create({
    model: getModel(isPremium),
    messages: [
      {
        role: "system",
        content: `${CVIN_AI_SYSTEM_PROMPT}

You are a senior HR Director and career development expert with 20 years of experience. Create detailed, actionable Individual Development Plans (IDPs) based ONLY on the user's actual background and realistic goals.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_completion_tokens: 3072,
  });

  return response.choices[0].message.content || '';
}
