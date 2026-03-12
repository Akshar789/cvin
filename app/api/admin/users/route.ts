import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/server/db';
import { requireAdmin } from '@/lib/auth/adminMiddleware';

export const GET = requireAdmin(async (request: NextRequest, user) => {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = 50;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        u.id, u.email, u.full_name AS "fullName", u.phone_number AS "phoneNumber",
        u.location, u.target_job_title AS "targetJobTitle", u.career_level AS "careerLevel",
        u.subscription_tier AS "subscriptionTier", u.onboarding_completed AS "onboardingCompleted",
        u.created_at AS "createdAt",
        (SELECT COUNT(*) FROM cvs WHERE user_id = u.id) AS "cvCount"
      FROM users u
    `;
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` WHERE u.email ILIKE $1 OR u.full_name ILIKE $1`;
    }

    query += ` ORDER BY u.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const countQuery = search
      ? await pool.query(`SELECT COUNT(*) FROM users WHERE email ILIKE $1 OR full_name ILIKE $1`, params)
      : await pool.query(`SELECT COUNT(*) FROM users`);

    const result = await pool.query(query, params);

    return NextResponse.json({
      users: result.rows,
      total: parseInt(countQuery.rows[0].count),
      page,
      totalPages: Math.ceil(parseInt(countQuery.rows[0].count) / limit),
    });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
});
