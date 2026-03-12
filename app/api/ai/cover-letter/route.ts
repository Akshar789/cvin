import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { generateCoverLetter } from '@/lib/ai/openai';
import { checkRateLimit } from '@/lib/middleware/rateLimiting';
import { db } from '@/server/db';
import { coverLetters } from '@/shared/schema';

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
        { error: 'Cover letters require Regular tier or higher. Upgrade to Regular ($9.99/month) for unlimited professional cover letters!' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { cvData, cvId, jobTitle, company, jobDescription, language } = body;

    if (!cvData || !jobTitle || !company) {
      return NextResponse.json(
        { error: 'CV data, job title, and company are required' },
        { status: 400 }
      );
    }

    const isAdvancedAI = user.subscriptionTier === 'plus' || user.subscriptionTier === 'annual' || user.subscriptionTier === 'premium' || user.subscriptionTier === 'lifetime' || user.subscriptionTier === 'yearly';
    const content = await generateCoverLetter({
      cvData,
      jobTitle,
      company,
      jobDescription,
      language: language || 'en',
      isPremium: isAdvancedAI,
    });

    const [coverLetter] = await db
      .insert(coverLetters)
      .values({
        userId: user.userId,
        cvId: cvId || null,
        title: `Cover Letter - ${company}`,
        content,
        jobTitle,
        company,
        language: language || 'en',
      })
      .returning();

    return NextResponse.json({ coverLetter });
  } catch (error: any) {
    console.error('Generate cover letter error:', error);
    return NextResponse.json(
      { error: 'Failed to generate cover letter' },
      { status: 500 }
    );
  }
});
