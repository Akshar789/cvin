import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/server/db';

export async function POST(request: NextRequest) {
  try {
    const { email, cvData, templateId } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const existing = await pool.query(
      'SELECT id FROM guest_cvs WHERE email = $1 LIMIT 1',
      [email]
    );

    if (existing.rows.length > 0) {
      const updateFields: string[] = ['updated_at = NOW()'];
      const values: any[] = [];
      let paramIndex = 1;

      if (cvData !== undefined) {
        updateFields.push(`cv_data = $${paramIndex}`);
        values.push(JSON.stringify(cvData));
        paramIndex++;
      }

      if (templateId !== undefined) {
        updateFields.push(`template_id = $${paramIndex}`);
        values.push(templateId);
        paramIndex++;
      }

      values.push(email);

      await pool.query(
        `UPDATE guest_cvs SET ${updateFields.join(', ')} WHERE email = $${paramIndex}`,
        values
      );
    } else {
      await pool.query(
        'INSERT INTO guest_cvs (email, template_id, cv_data, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())',
        [email, templateId || '', JSON.stringify(cvData || {})]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating guest CV:', error);
    return NextResponse.json({ error: 'Failed to update CV' }, { status: 500 });
  }
}
