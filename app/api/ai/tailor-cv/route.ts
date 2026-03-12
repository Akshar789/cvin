import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { tailorCVToJob } from '@/lib/ai/openai';
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

    const isPaidTier = user.subscriptionTier === 'regular' || user.subscriptionTier === 'plus' || user.subscriptionTier === 'annual' || user.subscriptionTier === 'premium' || user.subscriptionTier === 'lifetime' || user.subscriptionTier === 'monthly' || user.subscriptionTier === 'yearly';
    if (!isPaidTier) {
      return NextResponse.json(
        { error: 'Tailor CV is a paid feature. Upgrade to Regular ($9.99/month) for unlimited CV customization!' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { cvData, jobDescription } = body;

    if (!cvData || !jobDescription) {
      return NextResponse.json(
        { error: 'CV data and job description are required' },
        { status: 400 }
      );
    }

    const isAdvancedAI = user.subscriptionTier === 'plus' || user.subscriptionTier === 'annual' || user.subscriptionTier === 'premium' || user.subscriptionTier === 'lifetime' || user.subscriptionTier === 'yearly';
    const tailoredCV = await tailorCVToJob(cvData, jobDescription, isAdvancedAI);

    return NextResponse.json({ tailoredCV });
  } catch (error: any) {
    console.error('Tailor CV error:', error);
    return NextResponse.json(
      { error: 'Failed to tailor CV' },
      { status: 500 }
    );
  }
});
