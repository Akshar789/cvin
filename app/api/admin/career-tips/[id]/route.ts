import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/server/db';
import { requireAdmin } from '@/lib/auth/adminMiddleware';

export const PATCH = requireAdmin(async (request: NextRequest, user) => {
  try {
    const id = request.url.split('/career-tips/')[1]?.split('?')[0];
    const { title, content, category, language, isPremium } = await request.json();

    const updates: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (title !== undefined) { updates.push(`title = $${i++}`); values.push(title); }
    if (content !== undefined) { updates.push(`content = $${i++}`); values.push(content); }
    if (category !== undefined) { updates.push(`category = $${i++}`); values.push(category); }
    if (language !== undefined) { updates.push(`language = $${i++}`); values.push(language); }
    if (isPremium !== undefined) { updates.push(`is_premium = $${i++}`); values.push(isPremium); }

    if (!updates.length) return NextResponse.json({ error: 'No updates' }, { status: 400 });

    values.push(id);
    await pool.query(`UPDATE career_tips SET ${updates.join(', ')} WHERE id = $${i}`, values);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin update career tip error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
});

export const DELETE = requireAdmin(async (request: NextRequest, user) => {
  try {
    const id = request.url.split('/career-tips/')[1]?.split('?')[0];
    await pool.query('DELETE FROM career_tips WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete career tip error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
});
