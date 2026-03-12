import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/server/db';
import { verifyToken } from '@/lib/auth/jwt';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userEmail = decoded.email;
    const { id } = await params;
    const guestCvId = parseInt(id);

    if (isNaN(guestCvId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const result = await pool.query(
      'DELETE FROM guest_cvs WHERE id = $1 AND email = $2 RETURNING id',
      [guestCvId, userEmail]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Guest CV not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Guest CV delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete guest CV' },
      { status: 500 }
    );
  }
}
