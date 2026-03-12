import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { comparePassword } from '@/lib/auth/password';
import { pool } from '@/server/db';

export const POST = requireAuth(
  async (request: NextRequest, user) => {
    try {
      const { password } = await request.json();

      if (!password) {
        return NextResponse.json({ error: 'Password is required to confirm account deletion' }, { status: 400 });
      }

      const result = await pool.query('SELECT password FROM users WHERE id = $1', [user.userId]);
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const storedHash = result.rows[0].password;
      if (storedHash) {
        const isMatch = await comparePassword(password, storedHash);
        if (!isMatch) {
          return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
        }
      }

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        const cvsResult = await client.query('SELECT id FROM cvs WHERE user_id = $1', [user.userId]);
        const cvIds = cvsResult.rows.map((r: any) => r.id);

        if (cvIds.length > 0) {
          const placeholders = cvIds.map((_: any, i: number) => `$${i + 1}`).join(',');
          await client.query(`DELETE FROM education WHERE cv_id IN (${placeholders})`, cvIds);
          await client.query(`DELETE FROM experience WHERE cv_id IN (${placeholders})`, cvIds);
          await client.query(`DELETE FROM skills WHERE cv_id IN (${placeholders})`, cvIds);
          await client.query(`DELETE FROM cover_letters WHERE cv_id IN (${placeholders})`, cvIds);
          await client.query(`DELETE FROM custom_sections WHERE cv_id IN (${placeholders})`, cvIds);
          await client.query(`DELETE FROM cv_exports WHERE cv_id IN (${placeholders})`, cvIds);
        }

        await client.query('DELETE FROM cvs WHERE user_id = $1', [user.userId]);

        const safeDelete = async (table: string) => {
          try { await client.query(`DELETE FROM ${table} WHERE user_id = $1`, [user.userId]); } catch {}
        };
        await safeDelete('user_consent');
        await safeDelete('subscriptions');
        await safeDelete('usage_logs');
        await safeDelete('ai_usage_logs');

        try {
          await client.query(
            `INSERT INTO data_access_log (user_id, action, data_type, status, reason)
            VALUES ($1, 'delete', 'all', 'completed', 'User requested full account deletion')`,
            [user.userId]
          );
        } catch {}

        await client.query('DELETE FROM users WHERE id = $1', [user.userId]);

        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }

      return NextResponse.json({ message: 'Account deleted successfully' });
    } catch (error: any) {
      console.error('Account deletion error:', error);
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
    }
  }
);
