import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { checkRateLimit } from '@/lib/middleware/rateLimiting';
import { db } from '@/server/db';
import { users } from '@/shared/schema';
import { eq, sql } from 'drizzle-orm';
import openai from '@/lib/ai/openaiClient';

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
          error: "You've used all 5 free AI generations. Upgrade to continue building professional CVs with AI.",
          creditsRemaining: 0,
          requiresUpgrade: true
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { fieldType, currentValue, context } = body;

    if (!fieldType) {
      return NextResponse.json(
        { error: 'Field type is required' },
        { status: 400 }
      );
    }

    const isAdvancedAI = dbUser.subscriptionTier === 'plus' || dbUser.subscriptionTier === 'annual' || dbUser.subscriptionTier === 'premium' || dbUser.subscriptionTier === 'lifetime' || dbUser.subscriptionTier === 'yearly';
    const model = isAdvancedAI ? "gpt-4o" : "gpt-4o-mini";

    let systemPrompt = "";
    let userPrompt = "";

    switch (fieldType) {
      case 'summary':
        systemPrompt = "You are a professional CV writer. Write compelling professional summaries that highlight strengths and achievements.";
        userPrompt = `Write a professional summary based on this context:\n${JSON.stringify(context)}\n\nCurrent text: ${currentValue || 'none'}\n\nGenerate a concise, impactful professional summary (2-3 sentences).`;
        break;
        
      case 'experience_description':
        systemPrompt = "You are an expert at writing achievement-focused job descriptions for CVs.";
        userPrompt = `Write job responsibilities and achievements for:\nPosition: ${context.position}\nCompany: ${context.company}\nCurrent description: ${currentValue || 'none'}\n\nWrite 3-5 bullet points focusing on achievements and impact.`;
        break;
        
      case 'education_description':
        systemPrompt = "You are a professional CV writer. Generate concise, single-line education summaries only. Maximum 20 words per line. No bullet points, no paragraphs.";
        userPrompt = `Generate a professional one-line education summary for a CV.\nDegree: ${context.degree}\nField: ${context.field}\nInstitution: ${context.institution}\nCurrent: ${currentValue || 'none'}\n\nReturn ONLY a single sentence, maximum 20 words. No bullets, no paragraphs.`;
        break;
        
      case 'skills':
        systemPrompt = "You are a skills categorization expert for CVs.";
        userPrompt = `Suggest relevant skills for:\nRole: ${context.targetRole || 'general professional'}\nIndustry: ${context.industry || 'general'}\nExisting skills: ${JSON.stringify(context.existingSkills || [])}\n\nSuggest 5-7 relevant skills to add.`;
        break;
        
      default:
        return NextResponse.json(
          { error: 'Unknown field type' },
          { status: 400 }
        );
    }

    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      max_completion_tokens: 500,
    });

    const suggestion = response.choices[0].message.content || '';

    // ONLY decrement credits for FREE users
    let creditsRemaining = 999; // Default for premium users
    
    if (!isPremium) {
      // Atomically decrement and return the updated value to avoid race conditions
      const result = await db.execute(sql`
        UPDATE users 
        SET free_credits = GREATEST(free_credits - 1, 0)
        WHERE id = ${user.userId}
        RETURNING free_credits
      `);
      
      // Extract the updated credits value from the result
      const updatedCredits = (result as any).rows?.[0]?.free_credits ?? 0;
      creditsRemaining = Math.max(updatedCredits, 0);
    }

    return NextResponse.json({ 
      suggestion,
      creditsRemaining
    });
  } catch (error: any) {
    console.error('Field suggestion error:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestion' },
      { status: 500 }
    );
  }
});
