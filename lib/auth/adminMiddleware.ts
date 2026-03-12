import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './jwt';

export function requireAdmin(handler: (req: NextRequest, user: JWTPayload) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      const authHeader = req.headers.get('authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      const user = verifyToken(authHeader.substring(7));
      if (!user) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      if (user.subscriptionTier !== 'admin') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }
      return handler(req, user);
    } catch {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
  };
}
