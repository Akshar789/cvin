import { NextRequest, NextResponse } from 'next/server';
import openai from '@/lib/ai/openaiClient';

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(p|div|li|ul|ol)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .join('\n');
}

function extractBulletItems(text: string): string[] {
  const lines = text.split('\n').map((l) => l.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean);
  return lines;
}

function isHtmlContent(text: string): boolean {
  return /<[a-z][\s\S]*>/i.test(text);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { targetLanguage, content } = body;

    if (!targetLanguage || !content) {
      return NextResponse.json({ error: 'Missing targetLanguage or content' }, { status: 400 });
    }

    const sourceLang = targetLanguage === 'ar' ? 'English' : 'Arabic';
    const targetLang = targetLanguage === 'ar' ? 'Arabic' : 'English';

    const contentToTranslate = {
      summary: content.summary || content.professionalSummary || '',
      experience: (content.experience || []).map((exp: any) => {
        const rawDesc = exp.description || '';
        const existingResps: string[] = Array.isArray(exp.responsibilities) && exp.responsibilities.length > 0
          ? exp.responsibilities
          : [];
        let responsibilities: string[] = existingResps;
        let description = '';

        if (existingResps.length === 0) {
          if (isHtmlContent(rawDesc)) {
            const stripped = stripHtml(rawDesc);
            responsibilities = extractBulletItems(stripped);
          } else if (rawDesc.trim()) {
            responsibilities = extractBulletItems(rawDesc);
          }
        }

        return {
          position: exp.position || exp.title || '',
          description,
          location: exp.location || '',
          responsibilities,
        };
      }),
      education: (content.education || []).map((edu: any) => ({
        degree: edu.degree || '',
        field: edu.field || edu.fieldOfStudy || '',
        description: isHtmlContent(edu.description || '') ? stripHtml(edu.description) : (edu.description || ''),
      })),
      skills: content.skills || { technical: [], soft: [], tools: [] },
      targetJobTitle: content.personalInfo?.targetJobTitle || content.targetJobTitle || '',
      targetJobDomain: content.personalInfo?.targetJobDomain || content.targetJobDomain || '',
      nationality: content.personalInfo?.nationality || content.nationality || '',
      location: content.personalInfo?.location || content.location || '',
    };

    const translationPrompt = `You are a professional translator. Translate the following CV content from ${sourceLang} to ${targetLang}.

CRITICAL RULES:
1. DO NOT translate: person names, email addresses, phone numbers, dates, company names, institution names, URLs
2. DO translate: ALL other text content including job titles, professional summaries, descriptions, skill names, degree names, field of study, locations, nationality — and any ${sourceLang} words or phrases mixed into the text
3. Keep the EXACT same JSON structure
4. Return ONLY valid JSON, no markdown formatting
5. For skill lists (arrays of strings), translate each skill name to ${targetLang}
6. For responsibilities (arrays of strings), translate each responsibility as a standalone sentence in ${targetLang}
7. Maintain professional tone appropriate for a CV/resume
8. If any ${sourceLang} words appear in the middle of ${targetLang} text (e.g., a greeting or random word), translate those ${sourceLang} words to ${targetLang} as part of the surrounding content
9. Every string value in the JSON must be in ${targetLang} unless it is a name, email, phone, date, company, institution, or URL

Content to translate:
${JSON.stringify(contentToTranslate, null, 2)}

Return the translated content in the EXACT same JSON structure.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert ${sourceLang}-to-${targetLang} translator specializing in professional CV/resume content. Always return valid JSON only.`,
        },
        { role: 'user', content: translationPrompt },
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    });

    let translatedContent = completion.choices[0].message.content || '{}';
    translatedContent = translatedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const translated = JSON.parse(translatedContent);

    return NextResponse.json({ translated });
  } catch (error: any) {
    console.error('Translate content error:', error);
    return NextResponse.json({ error: 'Failed to translate content' }, { status: 500 });
  }
}
