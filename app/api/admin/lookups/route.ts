import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/server/db';
import { requireAdmin } from '@/lib/auth/adminMiddleware';

export const GET = requireAdmin(async (request: NextRequest, user) => {
  try {
    const url = new URL(request.url);
    const table = url.searchParams.get('table');

    const allowedTables: Record<string, string> = {
      'job_domains': 'SELECT id, slug, name_en AS "nameEn", name_ar AS "nameAr", is_active AS "isActive", sort_order AS "sortOrder" FROM job_domains ORDER BY sort_order',
      'career_levels': 'SELECT id, slug, name_en AS "nameEn", name_ar AS "nameAr", is_active AS "isActive", sort_order AS "sortOrder" FROM career_levels ORDER BY sort_order',
      'saudi_cities': 'SELECT id, name_en AS "nameEn", name_ar AS "nameAr", region, is_active AS "isActive", sort_order AS "sortOrder" FROM saudi_cities ORDER BY sort_order',
    };

    if (!table || !allowedTables[table]) {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 });
    }

    const result = await pool.query(allowedTables[table]);
    return NextResponse.json({ items: result.rows, table });
  } catch (error) {
    console.error('Admin lookups error:', error);
    return NextResponse.json({ error: 'Failed to fetch lookups' }, { status: 500 });
  }
});

export const POST = requireAdmin(async (request: NextRequest, user) => {
  try {
    const { table, nameEn, nameAr, slug, region, sortOrder } = await request.json();

    if (table === 'job_domains') {
      await pool.query(
        `INSERT INTO job_domains (slug, name_en, name_ar, sort_order) VALUES ($1, $2, $3, $4)`,
        [slug, nameEn, nameAr, sortOrder || 0]
      );
    } else if (table === 'career_levels') {
      await pool.query(
        `INSERT INTO career_levels (slug, name_en, name_ar, sort_order) VALUES ($1, $2, $3, $4)`,
        [slug, nameEn, nameAr, sortOrder || 0]
      );
    } else if (table === 'saudi_cities') {
      await pool.query(
        `INSERT INTO saudi_cities (name_en, name_ar, region, sort_order) VALUES ($1, $2, $3, $4)`,
        [nameEn, nameAr, region || '', sortOrder || 0]
      );
    } else {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin lookups create error:', error);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
});

export const PATCH = requireAdmin(async (request: NextRequest, user) => {
  try {
    const { table, id, nameEn, nameAr, isActive, sortOrder, slug, region } = await request.json();

    const allowedTables = ['job_domains', 'career_levels', 'saudi_cities'];
    if (!allowedTables.includes(table)) {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (nameEn !== undefined) { updates.push(`name_en = $${i++}`); values.push(nameEn); }
    if (nameAr !== undefined) { updates.push(`name_ar = $${i++}`); values.push(nameAr); }
    if (isActive !== undefined) { updates.push(`is_active = $${i++}`); values.push(isActive); }
    if (sortOrder !== undefined) { updates.push(`sort_order = $${i++}`); values.push(sortOrder); }
    if (slug !== undefined && table !== 'saudi_cities') { updates.push(`slug = $${i++}`); values.push(slug); }
    if (region !== undefined && table === 'saudi_cities') { updates.push(`region = $${i++}`); values.push(region); }

    if (!updates.length) return NextResponse.json({ error: 'No updates' }, { status: 400 });

    values.push(id);
    await pool.query(`UPDATE ${table} SET ${updates.join(', ')} WHERE id = $${i}`, values);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin lookups update error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
});
