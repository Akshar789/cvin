import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { checkRateLimit } from '@/lib/middleware/rateLimiting';
import { db } from '@/server/db';
import { users } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import openai from '@/lib/ai/openaiClient';
import { getModel } from '@/lib/ai/openai';

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const rateLimit = checkRateLimit(user.userId);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.message },
        { status: 429 }
      );
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.userId),
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const isPremium = dbUser.subscriptionTier !== 'free';

    const body = await request.json();
    const { fieldType, currentValue, cvContext, language } = body;

    const validFieldTypes = ['summary', 'experience'];
    if (!fieldType || !validFieldTypes.includes(fieldType)) {
      return NextResponse.json(
        { error: 'Invalid field type.' },
        { status: 400 }
      );
    }

    if (!language || !['en', 'ar'].includes(language)) {
      return NextResponse.json(
        { error: 'Invalid language.' },
        { status: 400 }
      );
    }

    if (!currentValue || currentValue.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please add some content before regenerating.' },
        { status: 400 }
      );
    }

    const isAdvancedAI = isPremium && (
      dbUser.subscriptionTier === 'plus' ||
      dbUser.subscriptionTier === 'annual' ||
      dbUser.subscriptionTier === 'premium' ||
      dbUser.subscriptionTier === 'lifetime' ||
      dbUser.subscriptionTier === 'yearly'
    );

    const lang = language === 'ar' ? 'Arabic' : 'English';
    const isArabic = language === 'ar';

    let contextStr = '';
    if (cvContext) {
      const parts: string[] = [];
      if (cvContext.fullName) parts.push(`Name: ${cvContext.fullName}`);
      if (cvContext.targetJobTitle) parts.push(`Job Title: ${cvContext.targetJobTitle}`);
      if (cvContext.targetJobDomain) parts.push(`Job Domain: ${cvContext.targetJobDomain}`);
      if (cvContext.position) parts.push(`Position: ${cvContext.position}`);
      if (cvContext.company) parts.push(`Company: ${cvContext.company}`);
      if (cvContext.skills && cvContext.skills.length > 0) {
        parts.push(`Key Skills: ${Array.isArray(cvContext.skills) ? cvContext.skills.join(', ') : cvContext.skills}`);
      }
      contextStr = parts.join('\n');
    }

    const opt1Label = isArabic ? 'الخيار 1 – احترافي ومحسّن' : 'Option 1 – Polished & Professional';
    const opt2Label = isArabic ? 'الخيار 2 – أكثر تأثيرًا' : 'Option 2 – Impact-Focused';
    const opt3Label = isArabic ? 'الخيار 3 – مختصر وقوي' : 'Option 3 – Concise & Strong';

    const prompt = `You are a professional CV writing assistant.

Rewrite and improve the following CV ${fieldType === 'summary' ? 'professional summary' : 'work experience description'}.

Requirements:
- Keep the same meaning and facts
- Make it more professional and impactful
- Improve clarity and readability
- Do not make it too long
- Do not invent new information, achievements, or claims not in the original
- Provide exactly 3 different versions
- Language: ${lang} (write ONLY in ${lang})
- Plain text only, no markdown formatting

${contextStr ? `User CV Context:\n${contextStr}\n` : ''}
Current Content:
${currentValue.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}

Return EXACTLY in this format with no extra text:

${opt1Label}
[your improved version 1 here]

${opt2Label}
[your improved version 2 here]

${opt3Label}
[your improved version 3 here]`;

    const response = await openai.chat.completions.create({
      model: getModel(isAdvancedAI),
      messages: [
        {
          role: 'system',
          content: `You are a professional CV writing expert. You improve CV content to be more impactful and ATS-friendly. Always respond in ${lang}. Never add fabricated information. Return plain text only.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_completion_tokens: 3000,
      temperature: 0.8,
    });

    const rawContent = response.choices[0].message.content || '';

    const variations = parseVariations(rawContent, isArabic);

    return NextResponse.json({
      variations,
    });
  } catch (error: any) {
    console.error('Regenerate field error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
});

function parseVariations(content: string, isArabic: boolean): Array<{ title: string; text: string }> {
  const opt1 = isArabic ? 'الخيار 1' : 'Option 1';
  const opt2 = isArabic ? 'الخيار 2' : 'Option 2';
  const opt3 = isArabic ? 'الخيار 3' : 'Option 3';

  const sections = content.split(new RegExp(`(?=${isArabic ? 'الخيار' : 'Option'}\\s*\\d)`, 'g')).filter(s => s.trim());

  if (sections.length >= 3) {
    return sections.slice(0, 3).map((section, idx) => {
      const lines = section.trim().split('\n');
      const title = lines[0].trim();
      const text = lines.slice(1).join('\n').trim();
      return { title, text };
    });
  }

  const lines = content.trim().split('\n').filter(l => l.trim());
  const variations: Array<{ title: string; text: string }> = [];
  let currentTitle = '';
  let currentText: string[] = [];

  for (const line of lines) {
    if (line.includes(opt1) || line.includes(opt2) || line.includes(opt3)) {
      if (currentTitle && currentText.length > 0) {
        variations.push({ title: currentTitle, text: currentText.join('\n').trim() });
      }
      currentTitle = line.trim();
      currentText = [];
    } else {
      currentText.push(line);
    }
  }
  if (currentTitle && currentText.length > 0) {
    variations.push({ title: currentTitle, text: currentText.join('\n').trim() });
  }

  if (variations.length === 0) {
    return [
      { title: isArabic ? 'الخيار 1 – احترافي ومحسّن' : 'Option 1 – Polished & Professional', text: content.trim() },
    ];
  }

  return variations;
}
