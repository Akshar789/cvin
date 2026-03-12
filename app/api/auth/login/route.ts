import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { users } from '@/shared/schema';
import { comparePassword } from '@/lib/auth/password';
import { signToken } from '@/lib/auth/jwt';
import { eq } from 'drizzle-orm';
import { migrateGuestCvs } from '@/lib/auth/migrateGuestCv';

export async function POST(request: NextRequest) {
  try {
    // Check for required environment variables
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not set');
      return NextResponse.json(
        { error: 'Server configuration error: Database connection not configured' },
        { status: 500 }
      );
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set');
      return NextResponse.json(
        { error: 'Server configuration error: Authentication not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    let user;
    try {
      [user] = await db
        .select({
          id: users.id,
          email: users.email,
          username: users.username,
          password: users.password,
          fullName: users.fullName,
          subscriptionTier: users.subscriptionTier,
          language: users.language,
          onboardingCompleted: users.onboardingCompleted,
          freeCredits: users.freeCredits,
        })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
    } catch (dbError: any) {
      console.error('Database query error:', dbError);
      throw new Error(`Database connection failed: ${dbError?.message || 'Unable to connect to database'}`);
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.onboardingCompleted) {
      try {
        await db
          .update(users)
          .set({ onboardingCompleted: true, updatedAt: new Date() })
          .where(eq(users.id, user.id));
      } catch (e) {
        console.error('Failed to mark onboarding complete on login:', e);
      }
    }

    const migratedCvId = await migrateGuestCvs(user.id, user.email);

    const token = signToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      subscriptionTier: user.subscriptionTier,
      onboardingCompleted: true,
    });

    return NextResponse.json({
      token,
      migratedCvId,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        subscriptionTier: user.subscriptionTier,
        language: user.language,
        onboardingCompleted: true,
        freeCredits: user.freeCredits,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      cause: error?.cause,
    });
    
    // Provide more specific error messages
    let errorMessage = 'Failed to login. Please check your credentials and try again.';
    
    if (error?.message?.includes('DATABASE_URL')) {
      errorMessage = 'Server configuration error: Database connection not configured. Please set DATABASE_URL in .env.local';
    } else if (error?.message?.includes('JWT_SECRET')) {
      errorMessage = 'Server configuration error: Authentication not configured. Please set JWT_SECRET in .env.local';
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
