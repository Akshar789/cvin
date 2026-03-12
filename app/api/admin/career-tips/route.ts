import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/server/db';
import { requireAdmin } from '@/lib/auth/adminMiddleware';

export const GET = requireAdmin(async (request: NextRequest, user) => {
  try {
    const result = await pool.query(
      `SELECT id, title, content, category, language, is_premium AS "isPremium", created_at AS "createdAt"
      FROM career_tips ORDER BY created_at DESC`
    );
    return NextResponse.json({ tips: result.rows });
  } catch (error) {
    console.error('Admin career tips error:', error);
    return NextResponse.json({ error: 'Failed to fetch career tips' }, { status: 500 });
  }
});

export const POST = requireAdmin(async (request: NextRequest, user) => {
  try {
    const { title, content, category, language, isPremium } = await request.json();
    if (!title || !content || !category) {
      return NextResponse.json({ error: 'Title, content, and category are required' }, { status: 400 });
    }
    const result = await pool.query(
      `INSERT INTO career_tips (title, content, category, language, is_premium)
      VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [title, content, category, language || 'en', isPremium || false]
    );
    return NextResponse.json({ id: result.rows[0].id, success: true });
  } catch (error) {
    console.error('Admin create career tip error:', error);
    return NextResponse.json({ error: 'Failed to create career tip' }, { status: 500 });
  }
});
