import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import openai from '@/lib/ai/openaiClient';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    jwt.verify(token, process.env.JWT_SECRET || 'secret');

    const { currentContent, improvementRequest } = await request.json();

    if (!currentContent || !improvementRequest) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const improvePrompt = `You are a professional CV editor. The user has asked for the following improvement to their CV:

"${improvementRequest}"

Current CV content:
${currentContent}

Please provide an improved version of the CV that addresses the user's request. Keep the HTML structure but enhance the content quality, clarity, and impact. Return only the improved HTML content without any explanation.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: improvePrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const improvedContent = completion.choices[0].message.content || '';

    return NextResponse.json({
      improvedContent,
      message: 'CV improved successfully',
    });
  } catch (error) {
    console.error('CV improvement error:', error);
    return NextResponse.json(
      { error: 'Failed to improve CV' },
      { status: 500 }
    );
  }
}
