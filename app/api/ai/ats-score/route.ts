import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { calculateATSScore } from '@/lib/ai/openai';
import { checkRateLimit } from '@/lib/middleware/rateLimiting';
import { checkAndTrackUsage } from '@/lib/middleware/usageTracking';
import { db } from '@/server/db';
import { cvs } from '@/shared/schema';
import { eq } from 'drizzle-orm';

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
      feature: 'ats',
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
    const { cvId, cvData } = body;

    if (!cvData) {
      return NextResponse.json(
        { error: 'CV data is required' },
        { status: 400 }
      );
    }

    const isAdvancedAI = user.subscriptionTier === 'plus' || user.subscriptionTier === 'annual' || user.subscriptionTier === 'premium' || user.subscriptionTier === 'lifetime' || user.subscriptionTier === 'yearly';
    const result = await calculateATSScore(cvData, isAdvancedAI);

    if (cvId) {
      const [cv] = await db.select().from(cvs).where(eq(cvs.id, cvId)).limit(1);
      if (cv && cv.userId === user.userId) {
        await db
          .update(cvs)
          .set({ atsScore: result.score })
          .where(eq(cvs.id, cvId));
      }
    }

    return NextResponse.json({
      ...result,
      creditsRemaining: usageCheck.creditsRemaining,
    });
  } catch (error: any) {
    console.error('ATS score error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate ATS score' },
      { status: 500 }
    );
  }
});
