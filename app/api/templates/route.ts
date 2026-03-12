import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { templates } from '@/shared/schema';
import { optionalAuth } from '@/lib/auth/middleware';
import { eq, and } from 'drizzle-orm';

export const GET = optionalAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'en';
    const showAll = searchParams.get('showAll') === 'true';

    const conditions = [eq(templates.language, language)];

    if (!showAll && (!user || user.subscriptionTier === 'free')) {
      conditions.push(eq(templates.isPremium, false));
    }

    const availableTemplates = await db.select().from(templates).where(and(...conditions));

    return NextResponse.json({
      success: true,
      templates: availableTemplates
    });
  } catch (error: any) {
    console.error('Get templates error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
});
