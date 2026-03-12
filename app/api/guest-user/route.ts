import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { guestUsers } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import { isValidSaudiPhone, normalizeSaudiPhone } from '@/lib/utils/phoneValidation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, fullName, phone, location, jobDomain, careerLevel, latestJob, templateId } = body;

    if (!email || !fullName) {
      return NextResponse.json({ error: 'Email and full name are required' }, { status: 400 });
    }

    let normalizedPhone: string | null = null;
    if (phone) {
      if (!isValidSaudiPhone(phone)) {
        return NextResponse.json({ error: 'Please enter a valid Saudi phone number (e.g., +966 5X XXX XXXX or 05XXXXXXXX)' }, { status: 400 });
      }
      normalizedPhone = normalizeSaudiPhone(phone);
    }

    const existing = await db.select().from(guestUsers).where(eq(guestUsers.email, email)).limit(1);

    if (existing.length > 0) {
      const [updated] = await db.update(guestUsers)
        .set({
          fullName,
          phoneNumber: normalizedPhone,
          location: location || null,
          targetJobDomain: jobDomain || null,
          careerLevel: careerLevel || null,
          latestJobTitle: latestJob || null,
          templateId: templateId || null,
          updatedAt: new Date(),
        })
        .where(eq(guestUsers.email, email))
        .returning();

      return NextResponse.json({ success: true, guestUser: updated, isNew: false });
    }

    const [guestUser] = await db.insert(guestUsers)
      .values({
        email,
        fullName,
        phoneNumber: normalizedPhone,
        location: location || null,
        targetJobDomain: jobDomain || null,
        careerLevel: careerLevel || null,
        latestJobTitle: latestJob || null,
        templateId: templateId || null,
      })
      .returning();

    return NextResponse.json({ success: true, guestUser, isNew: true });
  } catch (error) {
    console.error('Error saving guest user:', error);
    return NextResponse.json({ error: 'Failed to save guest user data' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const [guestUser] = await db.select().from(guestUsers).where(eq(guestUsers.email, email)).limit(1);

    if (!guestUser) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({ found: true, guestUser });
  } catch (error) {
    console.error('Error fetching guest user:', error);
    return NextResponse.json({ error: 'Failed to fetch guest user' }, { status: 500 });
  }
}
