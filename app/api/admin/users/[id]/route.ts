import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/server/db';
import { requireAdmin } from '@/lib/auth/adminMiddleware';

export const GET = requireAdmin(async (request: NextRequest, admin) => {
  try {
    const id = request.url.split('/admin/users/')[1]?.split('?')[0];
    const userResult = await pool.query(
      `SELECT id, email, full_name AS "fullName", phone_number AS "phoneNumber",
        location, target_job_title AS "targetJobTitle", career_level AS "careerLevel",
        subscription_tier AS "subscriptionTier", onboarding_completed AS "onboardingCompleted",
        created_at AS "createdAt", ai_credits AS "aiCredits"
      FROM users WHERE id = $1`,
      [id]
    );
    if (!userResult.rows.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const cvsResult = await pool.query(
      `SELECT id, title, template_id AS "templateId", is_public AS "isPublic", created_at AS "createdAt", updated_at AS "updatedAt"
      FROM cvs WHERE user_id = $1 ORDER BY updated_at DESC`,
      [id]
    );
    return NextResponse.json({ user: userResult.rows[0], cvs: cvsResult.rows });
  } catch (error) {
    console.error('Admin user detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
});

export const PATCH = requireAdmin(async (request: NextRequest, admin) => {
  try {
    const id = request.url.split('/admin/users/')[1]?.split('?')[0];
    const body = await request.json();
    const { subscriptionTier } = body;

    if (subscriptionTier && !['free', 'premium', 'admin'].includes(subscriptionTier)) {
      return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIdx = 1;

    if (subscriptionTier) {
      updates.push(`subscription_tier = $${paramIdx++}`);
      values.push(subscriptionTier);
    }

    if (!updates.length) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    values.push(id);
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIdx}`, values);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin user update error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
});
