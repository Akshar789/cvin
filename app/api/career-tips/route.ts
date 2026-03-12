import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { careerTips } from '@/shared/schema';
import { optionalAuth } from '@/lib/auth/middleware';
import { eq, and } from 'drizzle-orm';

export const GET = optionalAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'en';
    const category = searchParams.get('category');

    let query = db.select().from(careerTips);
    const conditions = [eq(careerTips.language, language)];

    if (!user || user.subscriptionTier === 'free') {
      conditions.push(eq(careerTips.isPremium, false));
    }

    if (category) {
      conditions.push(eq(careerTips.category, category));
    }

    const tips = await query.where(and(...conditions));

    return NextResponse.json({ tips });
  } catch (error: any) {
    console.error('Get career tips error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch career tips' },
      { status: 500 }
    );
  }
});
