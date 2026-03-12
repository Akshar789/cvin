import { getModel } from "./openai";
import openai from './openaiClient';

export interface TextAnswerEvaluation {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  suggestedAnswer: string;
}

export interface VideoAnswerEvaluation {
  score: number;
  feedback: string;
  contentStrengths: string[];
  contentImprovements: string[];
  deliveryTips: string[];
  suggestedAnswer: string;
  transcript: string;
}

const FIXED_VIDEO_QUESTIONS = {
  en: [
    "Tell me about yourself / Introduce Yourself",
    "Why do you want to work here?",
    "Give us three of your strengths and three of your weaknesses?",
    "What can you bring to this company?",
    "Do you have any questions for us?"
  ],
  ar: [
    "أخبرني عن نفسك / قدم نفسك",
    "لماذا تريد العمل هنا؟",
    "أعطنا ثلاث نقاط قوة وثلاث نقاط ضعف لديك؟",
    "ماذا يمكنك أن تقدم لهذه الشركة؟",
    "هل لديك أي أسئلة لنا؟"
  ]
};

export function getFixedVideoQuestions(language: 'en' | 'ar'): string[] {
  return FIXED_VIDEO_QUESTIONS[language];
}

export async function generateSuggestedAnswer(params: {
  question: string;
  cvData: any;
  targetRole?: string;
  industry?: string;
  language: string;
  isPremium?: boolean;
}): Promise<string> {
  const { question, cvData, targetRole, industry, language, isPremium = false } = params;

  const skills = cvData?.skills?.flatMap((s: any) => s.skillsList || []) || [];
  const experiences = cvData?.experience || [];

  const prompt = `Generate a professional interview answer in ${language === 'ar' ? 'Arabic' : 'English'} for the following question.

QUESTION: ${question}

CANDIDATE PROFILE:
- Target Role: ${targetRole || cvData?.personalInfo?.headline || 'Not specified'}
- Industry: ${industry || 'Not specified'}
- Skills: ${skills.slice(0, 10).join(', ') || 'Not provided'}
- Experience: ${experiences.slice(0, 3).map((exp: any) => `${exp.position} at ${exp.company}`).join('; ') || 'Not provided'}

REQUIREMENTS:
- Create a compelling, professional answer based on the candidate's actual background
- Use the STAR method (Situation, Task, Action, Result) where applicable
- Keep the answer concise but impactful (2-3 paragraphs max)
- Make it sound natural and conversational, not rehearsed
- DO NOT invent experiences or skills not present in the profile

Return ONLY the answer text, no explanations or headers.`;

  const response = await openai.chat.completions.create({
    model: getModel(isPremium),
    messages: [
      {
        role: "system",
        content: "You are an expert interview coach helping candidates prepare compelling, authentic answers based on their real experience.",
      },
      { role: "user", content: prompt },
    ],
    max_completion_tokens: 1024,
  });

  return response.choices[0].message.content || '';
}

export async function evaluateTextAnswer(params: {
  question: string;
  candidateAnswer: string;
  cvData: any;
  targetRole?: string;
  industry?: string;
  language: string;
  isPremium?: boolean;
}): Promise<TextAnswerEvaluation> {
  const { question, candidateAnswer, cvData, targetRole, industry, language, isPremium = false } = params;

  const skills = cvData?.skills?.flatMap((s: any) => s.skillsList || []) || [];
  const experiences = cvData?.experience || [];

  const prompt = `Evaluate the following interview answer in ${language === 'ar' ? 'Arabic' : 'English'}.

QUESTION: ${question}

CANDIDATE'S ANSWER: ${candidateAnswer}

CANDIDATE PROFILE:
- Target Role: ${targetRole || 'Not specified'}
- Industry: ${industry || 'Not specified'}
- Skills: ${skills.slice(0, 10).join(', ') || 'Not provided'}
- Experience Summary: ${experiences.slice(0, 2).map((exp: any) => `${exp.position} at ${exp.company}`).join('; ') || 'Not provided'}

Evaluate the answer and provide:
1. A score from 1-10 (10 being excellent)
2. Brief overall feedback
3. 2-3 specific strengths of the answer
4. 2-3 specific areas for improvement
5. A suggested improved version of the answer (based on their actual profile, don't invent new experiences)

Return as JSON:
{
  "score": number,
  "feedback": "overall feedback",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "suggestedAnswer": "improved answer text"
}`;

  const response = await openai.chat.completions.create({
    model: getModel(isPremium),
    messages: [
      {
        role: "system",
        content: "You are an expert interview coach evaluating candidate responses. Provide constructive, actionable feedback while being encouraging. Base all suggestions on the candidate's actual background.",
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 2048,
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  
  return {
    score: result.score || 5,
    feedback: result.feedback || '',
    strengths: result.strengths || [],
    improvements: result.improvements || [],
    suggestedAnswer: result.suggestedAnswer || '',
  };
}

export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  const uint8Array = new Uint8Array(audioBuffer);
  const file = new File([uint8Array], 'audio.webm', { type: 'audio/webm' });
  
  const response = await openai.audio.transcriptions.create({
    file: file,
    model: "whisper-1",
    response_format: "text",
  });

  return response;
}

export async function evaluateVideoAnswer(params: {
  question: string;
  transcript: string;
  cvData: any;
  targetRole?: string;
  industry?: string;
  language: string;
  isPremium?: boolean;
}): Promise<Omit<VideoAnswerEvaluation, 'transcript'>> {
  const { question, transcript, cvData, targetRole, industry, language, isPremium = false } = params;

  const skills = cvData?.skills?.flatMap((s: any) => s.skillsList || []) || [];
  const experiences = cvData?.experience || [];

  const prompt = `Evaluate the following video interview response in ${language === 'ar' ? 'Arabic' : 'English'}.

QUESTION: ${question}

TRANSCRIPT OF CANDIDATE'S RESPONSE: ${transcript}

CANDIDATE PROFILE:
- Target Role: ${targetRole || 'Not specified'}
- Industry: ${industry || 'Not specified'}
- Skills: ${skills.slice(0, 10).join(', ') || 'Not provided'}
- Experience: ${experiences.slice(0, 2).map((exp: any) => `${exp.position} at ${exp.company}`).join('; ') || 'Not provided'}

Evaluate the verbal content and provide:
1. A score from 1-10 (10 being excellent)
2. Brief overall feedback on content and clarity
3. 2-3 content strengths
4. 2-3 content areas for improvement
5. 2-3 delivery/presentation tips (based on transcript patterns like filler words, sentence structure, etc.)
6. A suggested improved version of the answer

Return as JSON:
{
  "score": number,
  "feedback": "overall feedback",
  "contentStrengths": ["strength1", "strength2"],
  "contentImprovements": ["improvement1", "improvement2"],
  "deliveryTips": ["tip1", "tip2"],
  "suggestedAnswer": "improved answer text"
}`;

  const response = await openai.chat.completions.create({
    model: getModel(isPremium),
    messages: [
      {
        role: "system",
        content: "You are an expert interview coach analyzing video interview responses. Evaluate the content quality and provide constructive feedback on both what was said and how it was communicated.",
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    max_completion_tokens: 2048,
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  
  return {
    score: result.score || 5,
    feedback: result.feedback || '',
    contentStrengths: result.contentStrengths || [],
    contentImprovements: result.contentImprovements || [],
    deliveryTips: result.deliveryTips || [],
    suggestedAnswer: result.suggestedAnswer || '',
  };
}
