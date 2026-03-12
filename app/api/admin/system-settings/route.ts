import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/server/db';
import { requireAdmin } from '@/lib/auth/adminMiddleware';

export const GET = requireAdmin(async (request: NextRequest, user) => {
  try {
    const result = await pool.query(
      `SELECT id, key, value, category, updated_at AS "updatedAt" FROM system_settings ORDER BY category, key`
    );
    return NextResponse.json({ settings: result.rows });
  } catch (error) {
    console.error('Admin settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
});

export const POST = requireAdmin(async (request: NextRequest, user) => {
  try {
    const { key, value, category } = await request.json();
    if (!key) return NextResponse.json({ error: 'Key is required' }, { status: 400 });

    await pool.query(
      `INSERT INTO system_settings (key, value, category, updated_by, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, category = EXCLUDED.category, updated_by = EXCLUDED.updated_by, updated_at = NOW()`,
      [key, JSON.stringify(value), category || 'general', user.userId]
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Admin settings save error:', error);
    return NextResponse.json({ error: 'Failed to save setting' }, { status: 500 });
  }
});
