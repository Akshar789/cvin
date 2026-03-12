import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/server/db';
import { requireAdmin } from '@/lib/auth/adminMiddleware';

export const GET = requireAdmin(async (request: NextRequest, user) => {
  try {
    const statsQuery = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM cvs) AS total_cvs,
        (SELECT COUNT(*) FROM users WHERE subscription_tier = 'premium') AS premium_users,
        (SELECT COUNT(*) FROM users WHERE subscription_tier = 'free') AS free_users,
        (SELECT COUNT(*) FROM guest_cvs) AS guest_cvs,
        (SELECT COUNT(*) FROM guest_users) AS guest_users,
        (SELECT COUNT(*) FROM career_tips) AS total_tips,
        (SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days') AS new_users_7d,
        (SELECT COUNT(*) FROM cvs WHERE created_at > NOW() - INTERVAL '7 days') AS new_cvs_7d
    `);

    const recentUsersQuery = await pool.query(`
      SELECT id, email, full_name AS "fullName", subscription_tier AS "subscriptionTier", created_at AS "createdAt"
      FROM users ORDER BY created_at DESC LIMIT 10
    `);

    const templateStatsQuery = await pool.query(`
      SELECT template_id AS "templateId", COUNT(*) AS count
      FROM cvs WHERE template_id IS NOT NULL
      GROUP BY template_id ORDER BY count DESC LIMIT 10
    `);

    const s = statsQuery.rows[0];
    return NextResponse.json({
      stats: {
        totalUsers: parseInt(s.total_users),
        totalCVs: parseInt(s.total_cvs),
        premiumUsers: parseInt(s.premium_users),
        freeUsers: parseInt(s.free_users),
        guestCvs: parseInt(s.guest_cvs),
        guestUsers: parseInt(s.guest_users),
        totalTips: parseInt(s.total_tips),
        newUsers7d: parseInt(s.new_users_7d),
        newCvs7d: parseInt(s.new_cvs_7d),
      },
      recentUsers: recentUsersQuery.rows,
      templateStats: templateStatsQuery.rows,
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
});
