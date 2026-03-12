import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { pool } from '@/server/db';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    const userId = decoded.userId;

    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const cvResult = await pool.query('SELECT * FROM cvs WHERE user_id = $1', [userId]);
    const consentResult = await pool.query('SELECT * FROM user_consent WHERE user_id = $1', [userId]);

    const exportData = {
      exportDate: new Date().toISOString(),
      user: userResult.rows[0],
      cvs: cvResult.rows,
      consentRecords: consentResult.rows,
      note: 'This is your personal data export as per PDPL Article 18 (Right to Data Portability)'
    };

    await pool.query(
      `INSERT INTO data_access_log (user_id, action, data_type, status, requested_at, completed_at)
      VALUES ($1, 'export', 'all', 'completed', NOW(), NOW())`,
      [userId]
    );

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="data-export.json"',
      },
    });
  } catch (error) {
    console.error('Data export error:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}
