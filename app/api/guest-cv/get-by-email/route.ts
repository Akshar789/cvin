import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/server/db';

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'SELECT id, template_id, updated_at FROM guest_cvs WHERE email = $1 ORDER BY updated_at DESC LIMIT 1',
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({
      found: true,
      hasExistingData: true,
      updatedAt: result.rows[0].updated_at,
    });
  } catch (error) {
    console.error('Error checking guest CV:', error);
    return NextResponse.json(
      { error: 'Failed to check data' },
      { status: 500 }
    );
  }
}
