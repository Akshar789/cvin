import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { db } from '@/server/db';
import { users } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import openai from '@/lib/ai/openaiClient';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    let authenticatedUser = null;
    let isPremium = false;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        authenticatedUser = verifyToken(authHeader.substring(7));
      } catch (error) {}
    }

    if (authenticatedUser) {
      const dbUser = await db.query.users.findFirst({
        where: eq(users.id, authenticatedUser.userId),
      });

      if (dbUser) {
        isPremium = dbUser.subscriptionTier !== 'free';
      }
    }

    const body = await request.json();
    const {
      type,
      role: userRole,
      jobTitle,
      jobDomain,
      yearsOfExperience,
      company,
      position,
      institution,
      degree,
      field,
      existingDescription,
      language,
      regenerate,
    } = body;

    if (!type || !['experience', 'education'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type. Must be experience or education.' }, { status: 400 });
    }

    const lang = language === 'ar' ? 'Arabic' : 'English';
    const model = isPremium ? 'gpt-4o' : 'gpt-4o-mini';
    const isStudent = userRole === 'student';

    let prompt: string;
    let systemPrompt: string;

    if (type === 'experience') {
      systemPrompt = `You are an expert CV writer specializing in creating impactful, ATS-friendly work experience descriptions. Write ONLY in ${lang}. Never mix languages. Use strong action verbs and quantifiable achievements where possible.`;

      if (regenerate && existingDescription) {
        prompt = `Rewrite and improve this work experience description. Provide exactly 3 different improved variations.

Current Description:
${existingDescription}

Context:
- Job Title: ${position || jobTitle || 'Not specified'}
- Company: ${company || 'Not specified'}
- Industry: ${jobDomain || 'Not specified'}
- Experience Level: ${yearsOfExperience || 'Not specified'}

Requirements:
- Keep the same meaning and facts
- Make each version more professional and impactful
- Use strong action verbs (Managed, Led, Implemented, Achieved, etc.)
- ATS-friendly language
- 3-5 bullet points per variation
- Write ONLY in ${lang}
- Plain text with bullet points (use • for bullets)

Return EXACTLY in this format:
VARIATION_1
[bullet points here]

VARIATION_2
[bullet points here]

VARIATION_3
[bullet points here]`;
      } else {
        prompt = `Generate a professional work experience description for a CV.

Context:
- Job Title/Position: ${position || jobTitle || 'Not specified'}
- Company: ${company || 'Not specified'}
- Industry/Domain: ${jobDomain || 'Not specified'}
- Experience Level: ${yearsOfExperience || 'Not specified'}
- Career Stage: ${isStudent ? 'Student/Entry-level' : 'Professional'}

Requirements:
- 3-5 impactful bullet points
- Strong action verbs (Managed, Led, Implemented, Developed, etc.)
- Highlight responsibilities and potential achievements
- ATS-friendly keywords for the industry
- Professional and compelling
- Write ONLY in ${lang}
- Plain text with bullet points (use • for bullets)
- Do NOT invent specific numbers/percentages unless typical for the role

Return ONLY the bullet points, nothing else.`;
      }
    } else {
      systemPrompt = `You are an expert CV writer. Write ONLY in ${lang}. Never mix languages. Generate extremely concise, single-line education summaries suitable for professional CV templates. Keep them clean, polished, and layout-friendly.`;

      if (regenerate && existingDescription) {
        prompt = `Rewrite this education summary as 3 different single-line variations. Each must be a single sentence, maximum 20 words.

Current:
${existingDescription}

Context:
- Institution: ${institution || 'Not specified'}
- Degree: ${degree || 'Not specified'}
- Field of Study: ${field || 'Not specified'}

Rules:
- ONE sentence per variation, maximum 20 words
- No bullet points, no paragraphs, no storytelling
- Professional tone, clean phrasing
- Each variation must differ in focus or wording
- Write ONLY in ${lang}

Return EXACTLY in this format:
VARIATION_1
[single sentence here]

VARIATION_2
[single sentence here]

VARIATION_3
[single sentence here]`;
      } else {
        prompt = `Generate a concise, professional one-line education summary for a CV.

Context:
- Degree: ${degree || 'Not specified'}
- Field of Study: ${field || 'Not specified'}
- Institution: ${institution || 'Not specified'}
- Career Direction: ${jobTitle || jobDomain || 'Not specified'}

Rules:
- EXACTLY one sentence
- Maximum 20 words
- No bullet points, no paragraphs, no multi-line content
- No storytelling, no project details, no lengthy explanations
- Clean phrasing suitable for compact CV templates and sidebars
- Write ONLY in ${lang}

Example format: "Bachelor of Computer Science with focus on software development and web technologies."

Return ONLY the single sentence, nothing else.`;
      }
    }

    const isEducation = type === 'education';
    const maxTokens = isEducation
      ? (regenerate ? 300 : 80)
      : (regenerate ? 2000 : 800);

    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      max_completion_tokens: maxTokens,
      temperature: regenerate ? 0.85 : 0.7,
    });

    const rawContent = response.choices[0].message.content || '';

    const translationSystemPrompt = isEducation
      ? `You are a professional CV translator. Translate this single-line education summary to ${language === 'ar' ? 'English' : 'Arabic'}. Keep it natural, professional, and concise (maximum 20 words). Return ONLY the translated sentence, no explanations.`
      : `Translate the following CV content to ${language === 'ar' ? 'English' : 'Arabic'}. Keep it professional, natural, and context-appropriate for a CV. Return ONLY the translated text.`;

    if (regenerate) {
      const variations = parseVariations(rawContent, language === 'ar');

      if (body.bilingual) {
        const otherLang = language === 'ar' ? 'English' : 'Arabic';
        try {
          const translateRes = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: isEducation
                  ? `You are a professional CV translator. Translate each education summary to ${otherLang}. Keep each natural, professional, and under 20 words. Return ONLY valid JSON with the same structure.`
                  : `Translate the following CV content to ${otherLang}. Keep it professional and natural. Return ONLY valid JSON with the same structure.`,
              },
              { role: 'user', content: JSON.stringify({ variations: variations.map(v => v.text) }) },
            ],
            max_completion_tokens: isEducation ? 300 : 2000,
            temperature: 0.3,
            response_format: { type: 'json_object' },
          });
          const translated = JSON.parse(translateRes.choices[0].message.content || '{}');
          const translatedVariations = (translated.variations || []).map((text: string, i: number) => ({
            title: variations[i]?.title || '',
            text: typeof text === 'string' ? text : '',
          }));
          if (language === 'ar') {
            return NextResponse.json({ variations, variationsEn: translatedVariations });
          }
          return NextResponse.json({ variations, variationsAr: translatedVariations });
        } catch (e) {
          console.error('Bilingual translation error:', e);
        }
      }

      return NextResponse.json({ variations });
    }

    let result: any = { description: rawContent.trim() };

    if (body.bilingual) {
      try {
        const translateRes = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: translationSystemPrompt },
            { role: 'user', content: rawContent.trim() },
          ],
          max_completion_tokens: isEducation ? 80 : 800,
          temperature: 0.3,
        });
        const translatedText = translateRes.choices[0].message.content?.trim() || '';
        if (language === 'ar') {
          result.descriptionEn = translatedText;
        } else {
          result.descriptionAr = translatedText;
        }
      } catch (e) {
        console.error('Bilingual translation error:', e);
      }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Description generation error:', error);
    return NextResponse.json({ error: 'Failed to generate description' }, { status: 500 });
  }
}

function parseVariations(content: string, isArabic: boolean): Array<{ title: string; text: string }> {
  const sections = content.split(/VARIATION_[123]/).filter(s => s.trim());

  if (sections.length >= 3) {
    const titles = isArabic
      ? ['الخيار 1 – احترافي', 'الخيار 2 – مؤثر', 'الخيار 3 – مختصر']
      : ['Option 1 – Professional', 'Option 2 – Impact-Focused', 'Option 3 – Concise'];
    return sections.slice(0, 3).map((text, i) => ({
      title: titles[i],
      text: text.trim(),
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
    const titles = isArabic
      ? ['الخيار 1 – احترافي', 'الخيار 2 – مؤثر', 'الخيار 3 – مختصر']
      : ['Option 1 – Professional', 'Option 2 – Impact-Focused', 'Option 3 – Concise'];
    return chunks.slice(0, 3).map((c, i) => ({
      title: titles[i],
      text: c.join('\n').trim(),
    }));
  }

  return [{
    title: isArabic ? 'النسخة المحسّنة' : 'Improved Version',
    text: content.trim(),
  }];
}
