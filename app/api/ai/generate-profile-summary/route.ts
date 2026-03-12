import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { db } from '@/server/db';
import { users } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import openai from '@/lib/ai/openaiClient';

function truncateSummary(text: string, maxLength: number = 500): string {
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  const lastSentenceEnd = Math.max(truncated.lastIndexOf('.'), truncated.lastIndexOf('!'), truncated.lastIndexOf('?'));
  if (lastSentenceEnd > 0) return text.substring(0, lastSentenceEnd + 1).trim();
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > 0) return text.substring(0, lastSpace).trim() + '...';
  return truncated.trim() + '...';
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    let isPremium = false;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const authenticatedUser = verifyToken(authHeader.substring(7));
        const dbUser = await db.query.users.findFirst({
          where: eq(users.id, authenticatedUser.userId),
        });
        if (dbUser) isPremium = dbUser.subscriptionTier !== 'free';
      } catch (error) {}
    }

    const body = await request.json();
    const {
      targetJobTitle, careerLevel, industry, yearsOfExperience,
      mostRecentJobTitle, mostRecentCompany, employmentStatus, educationLevel,
      educationField, skills, role: userRole,
      language, variations: requestVariations,
      experiences,
    } = body;

    const model = isPremium ? 'gpt-4o' : 'gpt-4o-mini';
    const lang = language === 'ar' ? 'Arabic' : 'English';
    const wantVariations = requestVariations === true || requestVariations === 3;
    const isStudent = userRole === 'student';

    const calculatedDuration = calculateExperienceDuration(experiences);
    const experienceYearsDisplay = calculatedDuration !== null
      ? `${calculatedDuration} [PROGRAMMATICALLY CALCULATED — USE THIS EXACTLY]`
      : (yearsOfExperience || 'Not specified');

    const experienceTimeline = buildExperienceTimeline(experiences);

    const systemPrompt = `You are a professional career coach and CV writer. Create compelling, concise professional summaries (3-4 lines maximum) that highlight a candidate's strengths${isStudent ? ', education, and potential' : ', experience, and career aspirations'}. Write ONLY in ${lang}. Never mix languages. Keep each summary under 400 characters. Be impactful and professional.

CRITICAL RULES ABOUT EXPERIENCE DURATION:
- If "Total Experience Duration" is marked as [PROGRAMMATICALLY CALCULATED], that value is 100% accurate — computed directly from real employment dates on the server.
- You MUST use that exact duration (e.g. "2 years and 9 months"). Do NOT shorten it, round it, or change it.
- You MUST NOT recalculate or re-estimate the duration from the Employment History dates yourself.
- You MUST NOT guess or approximate any duration.
- Violating these rules produces incorrect CVs that destroy user trust.`;

    const profileContext = `${isStudent ? 'Role: Student / Fresh Graduate' : 'Role: Professional / Employer'}
Target Job Title: ${targetJobTitle || 'Not specified'}
Career Level: ${careerLevel || 'Not specified'}
Industry: ${industry || 'Not specified'}
Total Experience Duration: ${experienceYearsDisplay}
Education Level: ${educationLevel || 'Not specified'}${educationField ? `\nField of Study: ${educationField}` : ''}${skills ? `\nKey Skills: ${skills}` : ''}
Most Recent Job: ${mostRecentJobTitle || mostRecentCompany ? `${mostRecentJobTitle || ''} at ${mostRecentCompany || ''}`.trim() : 'Not specified'}
Employment Status: ${employmentStatus || 'Not specified'}${experienceTimeline ? `\n\nEmployment History (reference for roles/companies only — do NOT recalculate duration from these dates):\n${experienceTimeline}` : ''}`;

    if (wantVariations) {
      const userPrompt = `Generate exactly 3 different professional summary options for a ${isStudent ? 'student/fresh graduate' : 'professional'} with the following profile:

${profileContext}

IMPORTANT RULES:
- Each summary MUST be exactly 3-4 sentences (concise and impactful)
- Each summary MUST be under 400 characters
- ${isStudent ? 'Focus on education, skills, and career potential' : 'Focus on experience, achievements, and expertise'}
- ${skills ? `Naturally incorporate these key skills: ${skills}` : 'Highlight relevant professional competencies'}
- Write ALL summaries ONLY in ${lang}
- Make it professional and ATS-friendly

Return EXACTLY in this format:
OPTION_1
[summary text here]

OPTION_2
[summary text here]

OPTION_3
[summary text here]

Make each option distinct:
- Option 1: Professional and balanced
- Option 2: Achievement-focused and impactful
- Option 3: Concise and direct`;

      const response = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_completion_tokens: 1200,
        temperature: 0.85,
      });

      const rawContent = response.choices[0].message.content || '';
      const variations = parseVariations(rawContent, language === 'ar');

      if (body.bilingual) {
        const otherLang = language === 'ar' ? 'English' : 'Arabic';
        try {
          const translateRes = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: `Translate the following CV summaries to ${otherLang}. Return ONLY valid JSON with the same structure.` },
              { role: 'user', content: JSON.stringify({ variations: variations.map(v => v.text) }) },
            ],
            max_completion_tokens: 1500,
            temperature: 0.3,
            response_format: { type: 'json_object' },
          });
          const translated = JSON.parse(translateRes.choices[0].message.content || '{}');
          const translatedVariations = (translated.variations || []).map((text: string, i: number) => ({
            title: variations[i]?.title || '',
            text: typeof text === 'string' ? truncateSummary(text, 500) : '',
          }));
          if (language === 'ar') {
            return NextResponse.json({ variations, variationsEn: translatedVariations });
          }
          return NextResponse.json({ variations, variationsAr: translatedVariations });
        } catch (e) {
          console.error('Bilingual summary variations error:', e);
        }
      }

      return NextResponse.json({ variations });
    }

    const userPrompt = `Generate a professional summary (bio) for a ${isStudent ? 'student/fresh graduate' : 'professional'} with the following profile:

${profileContext}

Write a compelling professional summary (3-4 sentences) in ${lang} that:
1. ${isStudent ? 'Highlights their education and potential' : 'Highlights their experience and expertise'}
2. Emphasizes their career goals and target role
3. ${skills ? `Naturally incorporates key skills: ${skills}` : 'Showcases their value proposition'}
4. Is ATS-optimized and uses industry keywords

IMPORTANT: Keep it concise, professional, and impactful. Maximum 400 characters total. Write ONLY in ${lang}. 3-4 lines maximum.`;

    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_completion_tokens: 300,
    });

    const rawSummary = response.choices[0].message.content || '';
    const summary = truncateSummary(rawSummary, 500);

    let result: any = { summary };

    if (body.bilingual) {
      const otherLang = language === 'ar' ? 'English' : 'Arabic';
      try {
        const translateRes = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: `Translate the following professional summary to ${otherLang}. Return ONLY the translated text.` },
            { role: 'user', content: summary },
          ],
          max_completion_tokens: 400,
          temperature: 0.3,
        });
        const translatedSummary = truncateSummary(translateRes.choices[0].message.content?.trim() || '', 500);
        if (language === 'ar') {
          result.summaryEn = translatedSummary;
        } else {
          result.summaryAr = translatedSummary;
        }
      } catch (e) {
        console.error('Bilingual summary translation error:', e);
      }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Profile summary generation error:', error);
    return NextResponse.json({ error: 'Failed to generate professional summary' }, { status: 500 });
  }
}

function parseVariations(content: string, isArabic: boolean): Array<{ title: string; text: string }> {
  const sections = content.split(/OPTION_[123]/).filter(s => s.trim());

  const titles = isArabic
    ? ['الخيار ١ – احترافي ومتوازن', 'الخيار ٢ – مؤثر وإنجازي', 'الخيار ٣ – مختصر ومباشر']
    : ['Option 1 – Professional & Balanced', 'Option 2 – Achievement-Focused', 'Option 3 – Concise & Direct'];

  if (sections.length >= 3) {
    return sections.slice(0, 3).map((text, i) => ({
      title: titles[i],
      text: truncateSummary(text.trim(), 500),
    }));
  }

  const lines = content.trim().split('\n');
  const chunks: string[][] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (line.trim() === '' && current.length > 0) {
      chunks.push(current);
      current = [];
    } else if (line.trim()) {
      current.push(line);
    }
  }
  if (current.length > 0) chunks.push(current);

  if (chunks.length >= 3) {
    return chunks.slice(0, 3).map((c, i) => ({
      title: titles[i],
      text: truncateSummary(c.join('\n').trim(), 500),
    }));
  }

  return [{
    title: isArabic ? 'الملخص المهني' : 'Professional Summary',
    text: truncateSummary(content.trim(), 500),
  }];
}

function parseExperienceDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const s = dateStr.trim().toLowerCase();
  if (s === 'present' || s === 'الحاضر' || s === 'حتى الآن' || s === 'current') {
    return new Date();
  }
  const monthNames: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    january: 0, february: 1, march: 2, april: 3, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
  };
  const monthYearMatch = s.match(/([a-z]+)\s+(\d{4})/);
  if (monthYearMatch) {
    const month = monthNames[monthYearMatch[1]];
    const year = parseInt(monthYearMatch[2]);
    if (month !== undefined && !isNaN(year)) {
      return new Date(year, month, 1);
    }
  }
  const yearOnlyMatch = s.match(/^(\d{4})$/);
  if (yearOnlyMatch) {
    return new Date(parseInt(yearOnlyMatch[1]), 0, 1);
  }
  return null;
}

function formatDuration(totalMonths: number): string {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years > 0 && months > 0) return `${years} year${years > 1 ? 's' : ''} and ${months} month${months > 1 ? 's' : ''}`;
  if (years > 0) return `${years} year${years > 1 ? 's' : ''}`;
  return `${months} month${months > 1 ? 's' : ''}`;
}

function calculateExperienceDuration(experiences: any[]): string | null {
  if (!Array.isArray(experiences) || experiences.length === 0) return null;
  let totalMonths = 0;
  let hasValidDates = false;
  const now = new Date();

  for (const exp of experiences) {
    const startStr = exp.startDate || (exp.startMonth && exp.startYear ? `${exp.startMonth} ${exp.startYear}` : '');
    const endStr = exp.endDate || (exp.isCurrent ? 'present' : (exp.endMonth && exp.endYear ? `${exp.endMonth} ${exp.endYear}` : ''));
    const start = parseExperienceDate(startStr);
    const end = parseExperienceDate(endStr) || (exp.isCurrent ? now : null);
    if (start && end && end >= start) {
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      totalMonths += Math.max(0, months);
      hasValidDates = true;
    }
  }

  if (!hasValidDates || totalMonths === 0) return null;
  return formatDuration(totalMonths);
}

function buildExperienceTimeline(experiences: any[]): string {
  if (!Array.isArray(experiences) || experiences.length === 0) return '';
  return experiences
    .filter(exp => exp.position || exp.company)
    .map(exp => {
      const position = exp.position || 'Unknown Role';
      const company = exp.company ? ` at ${exp.company}` : '';
      const start = exp.startDate || (exp.startMonth && exp.startYear ? `${exp.startMonth} ${exp.startYear}` : '');
      const end = exp.endDate || (exp.isCurrent ? 'Present' : exp.endMonth && exp.endYear ? `${exp.endMonth} ${exp.endYear}` : '');
      const dateRange = start || end ? ` (${start}${start && end ? ' – ' : ''}${end})` : '';
      return `• ${position}${company}${dateRange}`;
    })
    .join('\n');
}
