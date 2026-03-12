import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { users, templates } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth/middleware';
import { TEMPLATE_FAMILIES } from '@/config/templates';

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const { templateId } = await request.json();

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const templateConfig = TEMPLATE_FAMILIES.find(t => t.id === templateId);
    if (!templateConfig) {
      return NextResponse.json(
        { error: 'Invalid template ID' },
        { status: 400 }
      );
    }

    if (templateConfig.isPremium) {
      const [userData] = await db.select({ subscriptionTier: users.subscriptionTier })
        .from(users)
        .where(eq(users.id, user.userId))
        .limit(1);

      const tier = (userData?.subscriptionTier || 'free').toLowerCase().trim();
      if (tier === 'free' || tier === '') {
        return NextResponse.json(
          { error: 'Premium subscription required for this template' },
          { status: 403 }
        );
      }
    }

    await db.update(users)
      .set({ selectedTemplate: templateId, updatedAt: new Date() })
      .where(eq(users.id, user.userId));

    return NextResponse.json({
      success: true,
      message: 'Template saved successfully'
    });
  } catch (error) {
    console.error('Error saving template:', error);
    return NextResponse.json(
      { error: 'Failed to save template' },
      { status: 500 }
    );
  }
});
