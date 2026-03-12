import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { improveText } from '@/lib/ai/openai';
import { checkRateLimit } from '@/lib/middleware/rateLimiting';
import { db } from '@/server/db';
import { users } from '@/shared/schema';
import { eq, sql } from 'drizzle-orm';

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

    // Allow AI only if premium OR has credits
    if (!isPremium && (!dbUser.freeCredits || dbUser.freeCredits <= 0)) {
      return NextResponse.json(
        {
          error: 'SUBSCRIPTION_REQUIRED',
          message: "You've used all your free AI credits. Upgrade to Pro for unlimited access.",
          creditsRemaining: 0,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { text, context } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const isAdvancedAI = dbUser.subscriptionTier === 'plus' || dbUser.subscriptionTier === 'annual' || dbUser.subscriptionTier === 'premium' || dbUser.subscriptionTier === 'lifetime' || dbUser.subscriptionTier === 'yearly';
    const improvedText = await improveText(text, context, isAdvancedAI);

    // ONLY decrement credits for FREE users
    if (!isPremium) {
      await db.execute(sql`
        UPDATE users 
        SET free_credits = GREATEST(free_credits - 1, 0)
        WHERE id = ${user.userId}
      `);
    }

    // Return accurate creditsRemaining only for free users
    const creditsRemaining = isPremium ? 999 : Math.max((dbUser.freeCredits || 0) - 1, 0);

    return NextResponse.json({
      improvedText,
      creditsRemaining,
    });
  } catch (error: any) {
    console.error('Improve text error:', error);
    return NextResponse.json(
      { error: 'Failed to improve text' },
      { status: 500 }
    );
  }
});
