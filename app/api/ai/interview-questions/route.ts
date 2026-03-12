import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { generateInterviewQuestions } from '@/lib/ai/openai';
import { checkRateLimit } from '@/lib/middleware/rateLimiting';
import { checkAndTrackUsage } from '@/lib/middleware/usageTracking';

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const rateLimit = checkRateLimit(user.userId);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.message },
        { status: 429 }
      );
    }

    const usageCheck = await checkAndTrackUsage({
      userId: user.userId,
      feature: 'interview',
    });

    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: 'SUBSCRIPTION_REQUIRED',
          message: usageCheck.message,
          creditsRemaining: usageCheck.creditsRemaining,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { cvData, jobDescription, language } = body;

    if (!cvData) {
      return NextResponse.json(
        { error: 'CV data is required' },
        { status: 400 }
      );
    }

    const isAdvancedAI = user.subscriptionTier === 'plus' || user.subscriptionTier === 'annual' || user.subscriptionTier === 'premium' || user.subscriptionTier === 'lifetime' || user.subscriptionTier === 'yearly';
    const questions = await generateInterviewQuestions({
      cvData,
      jobDescription,
      language: language || 'en',
      isPremium: isAdvancedAI,
    });

    return NextResponse.json({ 
      questions,
      creditsRemaining: usageCheck.creditsRemaining,
    });
  } catch (error: any) {
    console.error('Generate interview questions error:', error);
    return NextResponse.json(
      { error: 'Failed to generate interview questions' },
      { status: 500 }
    );
  }
});
