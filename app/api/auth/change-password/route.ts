import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { hashPassword, comparePassword } from '@/lib/auth/password';
import { pool } from '@/server/db';

export const POST = requireAuth(
  async (request: NextRequest, user) => {
    try {
      const { currentPassword, newPassword } = await request.json();

      if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: 'Current and new passwords are required' }, { status: 400 });
      }

      if (newPassword.length < 8) {
        return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
      }

      if (currentPassword === newPassword) {
        return NextResponse.json({ error: 'New password must be different from current password' }, { status: 400 });
      }

      const result = await pool.query('SELECT password FROM users WHERE id = $1', [user.userId]);
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const storedHash = result.rows[0].password;
      if (!storedHash) {
        return NextResponse.json({ error: 'Cannot change password for OAuth accounts' }, { status: 400 });
      }

      const isMatch = await comparePassword(currentPassword, storedHash);
      if (!isMatch) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
      }

      const newHash = await hashPassword(newPassword);
      await pool.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [newHash, user.userId]);

      return NextResponse.json({ message: 'Password changed successfully' });
    } catch (error: any) {
      console.error('Change password error:', error);
      return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
    }
  }
);
