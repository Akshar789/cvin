import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { evaluateTextAnswer, generateSuggestedAnswer } from '@/lib/ai/interviewEvaluation';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { question, candidateAnswer, cvData, targetRole, industry, language, mode } = body;

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const isPremium = !!(payload.subscriptionTier && payload.subscriptionTier !== 'free');

    if (mode === 'suggest') {
      const suggestedAnswer = await generateSuggestedAnswer({
        question,
        cvData,
        targetRole,
        industry,
        language: language || 'en',
        isPremium,
      });

      return NextResponse.json({ suggestedAnswer });
    }

    if (!candidateAnswer) {
      return NextResponse.json({ error: 'Candidate answer is required for evaluation' }, { status: 400 });
    }

    const evaluation = await evaluateTextAnswer({
      question,
      candidateAnswer,
      cvData,
      targetRole,
      industry,
      language: language || 'en',
      isPremium,
    });

    return NextResponse.json({ evaluation });
  } catch (error: any) {
    console.error('Text answer evaluation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to evaluate answer' },
      { status: 500 }
    );
  }
}
