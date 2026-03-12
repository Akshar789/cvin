import { db } from "../../server/db";
import { users, usageLogs } from "../../shared/schema";
import { eq } from "drizzle-orm";

export interface UsageTrackingContext {
  userId: number;
  feature: 'cv' | 'text-improvement' | 'interview' | 'ats' | 'cover-letter' | 'idp' | 'linkedin' | 'career-coach';
}

export async function checkAndTrackUsage(
  context: UsageTrackingContext,
  tokensUsed: number = 0
): Promise<{ allowed: boolean; creditsRemaining: number; message?: string }> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, context.userId),
  });

  if (!user) {
    return { allowed: false, creditsRemaining: 0, message: "User not found" };
  }

  const isPremium = user.subscriptionTier === 'regular' || user.subscriptionTier === 'plus' || user.subscriptionTier === 'annual' || user.subscriptionTier === 'premium' || user.subscriptionTier === 'lifetime' || user.subscriptionTier === 'monthly' || user.subscriptionTier === 'yearly';

  if (isPremium) {
    await db.insert(usageLogs).values({
      userId: context.userId,
      feature: context.feature,
      tokensUsed,
    });

    return { allowed: true, creditsRemaining: 999 };
  }

  let allowed = false;
  let creditsRemaining = user.freeCredits;
  let updateData: any = {};

  switch (context.feature) {
    case 'cv':
      if (user.cvGenerations < 3) {
        allowed = true;
        updateData.cvGenerations = user.cvGenerations + 1;
        creditsRemaining = 3 - (user.cvGenerations + 1);
      } else {
        creditsRemaining = 0;
      }
      break;

    case 'text-improvement':
      if (user.textImprovements < 3) {
        allowed = true;
        updateData.textImprovements = user.textImprovements + 1;
        creditsRemaining = 3 - (user.textImprovements + 1);
      } else {
        creditsRemaining = 0;
      }
      break;

    case 'interview':
      if (user.interviewSets < 1) {
        allowed = true;
        updateData.interviewSets = user.interviewSets + 1;
        creditsRemaining = 1 - (user.interviewSets + 1);
      } else {
        creditsRemaining = 0;
      }
      break;

    case 'ats':
      if (user.cvGenerations < 3) {
        allowed = true;
        updateData.cvGenerations = user.cvGenerations + 1;
        creditsRemaining = 3 - (user.cvGenerations + 1);
      } else {
        creditsRemaining = 0;
      }
      break;

    case 'cover-letter':
    case 'idp':
    case 'linkedin':
    case 'career-coach':
      allowed = false;
      creditsRemaining = 0;
      break;

    default:
      allowed = false;
      creditsRemaining = 0;
  }

  if (allowed && Object.keys(updateData).length > 0) {
    await db.update(users)
      .set(updateData)
      .where(eq(users.id, context.userId));

    await db.insert(usageLogs).values({
      userId: context.userId,
      feature: context.feature,
      tokensUsed,
    });
  }

  let message: string | undefined;
  if (!allowed) {
    switch (context.feature) {
      case 'cv':
        message = "You've used all 3 free CVs. Upgrade to Regular ($9.99/month) for unlimited CVs!";
        break;
      case 'text-improvement':
        message = "You've used all 3 free improvements. Upgrade to Regular ($9.99/month) for unlimited improvements!";
        break;
      case 'interview':
        message = "You've used your free interview questions. Upgrade to Regular ($9.99/month) for unlimited interview prep!";
        break;
      case 'ats':
        message = "You've used all 3 free ATS scans. Upgrade to Regular ($9.99/month) for unlimited ATS optimization!";
        break;
      case 'cover-letter':
        message = "Cover letters require Regular tier or higher. Upgrade to Regular ($9.99/month) to create professional cover letters!";
        break;
      case 'idp':
        message = "IDP Generator is a Plus exclusive feature. Upgrade to Plus ($19.99/month) for AI-powered career development plans!";
        break;
      case 'linkedin':
        message = "LinkedIn Optimizer is a Plus exclusive feature. Upgrade to Plus ($19.99/month) for professional profile optimization!";
        break;
      case 'career-coach':
        message = "Career Coach is a Plus exclusive feature. Upgrade to Plus ($19.99/month) for personalized AI career guidance!";
        break;
      default:
        message = "This feature requires a paid subscription. Check our pricing to unlock all features!";
    }
  }

  return {
    allowed,
    creditsRemaining: Math.max(0, creditsRemaining),
    message,
  };
}

export async function getUserUsageStats(userId: number) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    return null;
  }

  const isPremium = user.subscriptionTier === 'regular' || user.subscriptionTier === 'plus' || user.subscriptionTier === 'annual' || user.subscriptionTier === 'premium' || user.subscriptionTier === 'lifetime' || user.subscriptionTier === 'monthly' || user.subscriptionTier === 'yearly';

  return {
    cvGenerations: user.cvGenerations,
    textImprovements: user.textImprovements,
    interviewSets: user.interviewSets,
    cvGenerationsRemaining: isPremium ? 999 : Math.max(0, 3 - user.cvGenerations),
    textImprovementsRemaining: isPremium ? 999 : Math.max(0, 3 - user.textImprovements),
    interviewSetsRemaining: isPremium ? 999 : Math.max(0, 1 - user.interviewSets),
    isPremium,
  };
}
