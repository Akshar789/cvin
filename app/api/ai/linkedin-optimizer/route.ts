import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { optimizeLinkedInProfile } from '@/lib/ai/openai';
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
        { error: 'LinkedIn Optimizer is a Plus exclusive feature. Upgrade to Plus ($19.99/month) for professional profile optimization with GPT-4!' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { profileData } = body;

    if (!profileData) {
      return NextResponse.json(
        { error: 'Profile data is required' },
        { status: 400 }
      );
    }

    const suggestions = await optimizeLinkedInProfile(profileData, isAdvancedAI);

    return NextResponse.json({ suggestions });
  } catch (error: any) {
    console.error('LinkedIn optimizer error:', error);
    return NextResponse.json(
      { error: 'Failed to optimize profile' },
      { status: 500 }
    );
  }
});
