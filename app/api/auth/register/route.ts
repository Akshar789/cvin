import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { users } from '@/shared/schema';
import { hashPassword } from '@/lib/auth/password';
import { signToken } from '@/lib/auth/jwt';
import { eq } from 'drizzle-orm';
import { migrateGuestCvs } from '@/lib/auth/migrateGuestCv';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      username, 
      password, 
      fullName, 
      language
    } = body;

    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'Email, username, and password are required' },
        { status: 400 }
      );
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    const existingUsername = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUsername.length > 0) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        email,
        username,
        password: hashedPassword,
        fullName: fullName || null,
        language: language || 'en',
        subscriptionTier: 'free',
        onboardingCompleted: true,
      })
      .returning();

    const migratedCvId = await migrateGuestCvs(newUser.id, newUser.email);

    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
      subscriptionTier: newUser.subscriptionTier,
      onboardingCompleted: newUser.onboardingCompleted,
    });

    return NextResponse.json(
      {
        token,
        migratedCvId,
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          fullName: newUser.fullName,
          subscriptionTier: newUser.subscriptionTier,
          language: newUser.language,
          onboardingCompleted: newUser.onboardingCompleted,
          freeCredits: newUser.freeCredits,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}
