import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { careerCoachChat } from '@/lib/ai/openai';
import { checkRateLimit } from '@/lib/middleware/rateLimiting';

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const rateLimit = checkRateLimit(user.userId);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.message },
        { status: 429 }
      );
    }

    const isAdvancedAI = user.subscriptionTier === 'plus' || user.subscriptionTier === 'annual' || user.subscriptionTier === 'premium' || user.subscriptionTier === 'lifetime' || user.subscriptionTier === 'yearly';
    if (!isAdvancedAI) {
      return NextResponse.json(
        { error: 'Career Coach is a Plus exclusive feature. Upgrade to Plus ($19.99/month) for personalized AI career guidance with GPT-4!' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { message, conversationHistory } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const response = await careerCoachChat(message, conversationHistory || [], isAdvancedAI);

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('Career coach chat error:', error);
    return NextResponse.json(
      { error: 'Failed to get response from career coach' },
      { status: 500 }
    );
  }
});
