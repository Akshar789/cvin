import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../../../../lib/auth/jwt";
import { generateIDP } from "../../../../lib/ai/openai";
import { checkRateLimit } from "../../../../lib/middleware/rateLimiting";
import { checkAndTrackUsage } from "../../../../lib/middleware/usageTracking";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const rateLimit = checkRateLimit(decoded.userId);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.message },
        { status: 429 }
      );
    }

    const usageCheck = await checkAndTrackUsage({
      userId: decoded.userId,
      feature: 'idp',
    });

    if (!usageCheck.allowed) {
      return NextResponse.json(
        {
          error: "SUBSCRIPTION_REQUIRED",
          message: usageCheck.message,
          creditsRemaining: usageCheck.creditsRemaining,
        },
        { status: 403 }
      );
    }

    const { cvData, targetRole, timeframe, language } = await req.json();

    if (!cvData) {
      return NextResponse.json(
        { error: "CV data is required" },
        { status: 400 }
      );
    }

    const isAdvancedAI = decoded.subscriptionTier === 'plus' || decoded.subscriptionTier === 'annual' || decoded.subscriptionTier === 'premium' || decoded.subscriptionTier === 'lifetime' || decoded.subscriptionTier === 'yearly';

    const idp = await generateIDP({
      cvData,
      targetRole,
      timeframe,
      language: language || 'en',
      isPremium: isAdvancedAI,
    });

    return NextResponse.json({
      idp,
      creditsRemaining: usageCheck.creditsRemaining,
    });
  } catch (error: any) {
    console.error("IDP generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate IDP" },
      { status: 500 }
    );
  }
}
