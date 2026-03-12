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

    await pool.query(
      `INSERT INTO data_access_log (user_id, action, data_type, status, reason)
      VALUES ($1, 'delete', 'all', 'completed', 'User requested data deletion')`,
      [userId]
    );

    await pool.query('DELETE FROM cvs WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM user_consent WHERE user_id = $1', [userId]);
    
    await pool.query(
      `UPDATE users 
      SET email = CONCAT('deleted_', id, '@deleted.local'),
          password = NULL,
          full_name = 'Deleted User',
          phone_number = NULL,
          location = NULL,
          updated_at = NOW()
      WHERE id = $1`,
      [userId]
    );

    return NextResponse.json({ message: 'Data deleted successfully' });
  } catch (error) {
    console.error('Data deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
  }
}
