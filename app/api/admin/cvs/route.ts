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
      SELECT c.id, c.title, c.template_id AS "templateId", c.is_public AS "isPublic",
        c.created_at AS "createdAt", c.updated_at AS "updatedAt",
        u.email AS "userEmail", u.full_name AS "userFullName"
      FROM cvs c
      LEFT JOIN users u ON c.user_id = u.id
    `;
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` WHERE c.title ILIKE $1 OR u.email ILIKE $1 OR u.full_name ILIKE $1`;
    }

    query += ` ORDER BY c.updated_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const countQuery = search
      ? await pool.query(`SELECT COUNT(*) FROM cvs c LEFT JOIN users u ON c.user_id = u.id WHERE c.title ILIKE $1 OR u.email ILIKE $1 OR u.full_name ILIKE $1`, params)
      : await pool.query(`SELECT COUNT(*) FROM cvs`);

    const result = await pool.query(query, params);

    return NextResponse.json({
      cvs: result.rows,
      total: parseInt(countQuery.rows[0].count),
      page,
      totalPages: Math.ceil(parseInt(countQuery.rows[0].count) / limit),
    });
  } catch (error) {
    console.error('Admin CVs error:', error);
    return NextResponse.json({ error: 'Failed to fetch CVs' }, { status: 500 });
  }
});
