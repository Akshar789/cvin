import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/server/db';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
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

    const result = await pool.query(
      'SELECT id, email, template_id, cv_data, created_at, updated_at FROM guest_cvs WHERE email = $1 ORDER BY updated_at DESC',
      [userEmail]
    );

    const guestCvs = result.rows.map(row => {
      const cvData = typeof row.cv_data === 'string' ? JSON.parse(row.cv_data) : row.cv_data;
      const generatedContent = cvData?.generatedContent || cvData;
      const personalInfo = generatedContent?.personalInfo || {};
      const fullName = personalInfo?.fullName || personalInfo?.name || 'My CV';
      const templateSlug = row.template_id || cvData?.templateId || null;

      return {
        id: row.id,
        isGuest: true,
        title: `${fullName}'s CV`,
        templateId: templateSlug,
        personalInfo: {
          name: fullName,
          fullName: fullName,
          email: personalInfo?.email || row.email,
          phone: personalInfo?.phone || personalInfo?.phoneNumber || '',
          location: personalInfo?.location || '',
        },
        summary: generatedContent?.professionalSummary || generatedContent?.summary || '',
        updatedAt: row.updated_at,
        createdAt: row.created_at,
      };
    });

    return NextResponse.json({ guestCvs });
  } catch (error: any) {
    console.error('Guest CV list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guest CVs' },
      { status: 500 }
    );
  }
}
