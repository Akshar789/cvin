import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/server/db';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'SELECT id, template_id, cv_data, updated_at FROM guest_cvs WHERE email = $1 ORDER BY updated_at DESC LIMIT 1',
      [email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ found: false });
    }

    const row = result.rows[0];
    return NextResponse.json({
      found: true,
      data: {
        templateId: row.template_id,
        cvData: row.cv_data,
        updatedAt: row.updated_at,
      }
    });
  } catch (error) {
    console.error('Error resuming guest CV:', error);
    return NextResponse.json(
      { error: 'Failed to resume data' },
      { status: 500 }
    );
  }
}
