import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { cvs, users } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user's CV count
    const userCvs = await db
      .select({ id: cvs.id })
      .from(cvs)
      .where(eq(cvs.userId, decoded.userId));

    // Get user details for generation count
    const [user] = await db
      .select({
        cvGenerations: users.cvGenerations,
        freeCredits: users.freeCredits,
      })
      .from(users)
      .where(eq(users.id, decoded.userId));

    return NextResponse.json({
      cvCount: userCvs.length,
      cvGenerations: user?.cvGenerations || 0,
      freeCredits: user?.freeCredits || 0,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
