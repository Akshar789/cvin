import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { db } from '@/server/db';
import { users, usageLogs } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import { generateInterviewPrep } from '@/lib/ai/openai';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const [user] = await db.select().from(users).where(eq(users.id, payload.userId));
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isPremium = user.subscriptionTier === 'premium' || user.subscriptionTier === 'admin';
    
    if (!isPremium && user.freeCredits <= 0) {
      return NextResponse.json({ 
        error: 'SUBSCRIPTION_REQUIRED',
        message: 'You have used all your free credits. Please upgrade to premium for unlimited access.'
      }, { status: 403 });
    }

    const body = await request.json();
    const { cvData, experienceLevel, interviewStage, interviewType, targetRole, industry, language } = body;

    if (!cvData) {
      return NextResponse.json({ error: 'CV data is required' }, { status: 400 });
    }

    const result = await generateInterviewPrep({
      cvData,
      experienceLevel: experienceLevel || user.careerLevel || 'Mid-level',
      interviewStage: interviewStage || 'all',
      interviewType: interviewType || 'both',
      targetRole: targetRole || user.targetJobTitle || user.targetJobDomain,
      industry: industry || user.industry,
      language: language || user.language || 'en',
      isPremium,
    });

    if (!isPremium) {
      await db.update(users)
        .set({ freeCredits: user.freeCredits - 1 })
        .where(eq(users.id, user.id));
    }

    await db.insert(usageLogs).values({
      userId: user.id,
      feature: 'interview_prep',
      tokensUsed: 1000,
    });

    return NextResponse.json({ 
      success: true,
      interviewPrep: result,
      creditsRemaining: isPremium ? 'unlimited' : user.freeCredits - 1,
    });

  } catch (error: any) {
    console.error('Interview prep generation error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate interview preparation content',
      details: error.message 
    }, { status: 500 });
  }
}
