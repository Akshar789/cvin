import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { pool } from '@/server/db';

const normalizeLinkedInUrl = (url: string): { normalized: string; isValid: boolean } => {
  const trimmed = url.trim();
  
  if (!trimmed) {
    return { normalized: '', isValid: true };
  }
  
  let fullUrl = trimmed;
  if (!trimmed.match(/^https?:\/\//i)) {
    fullUrl = 'https://' + trimmed;
  }
  
  try {
    const urlObj = new URL(fullUrl);
    
    const host = urlObj.host.toLowerCase();
    const isLinkedIn = host === 'linkedin.com' || host === 'www.linkedin.com';
    if (!isLinkedIn) {
      return { normalized: trimmed, isValid: false };
    }
    
    if (!urlObj.pathname || urlObj.pathname === '/') {
      return { normalized: trimmed, isValid: false };
    }
    
    const canonical = `https://www.linkedin.com${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
    return { normalized: canonical, isValid: true };
  } catch (e) {
    return { normalized: trimmed, isValid: false };
  }
};

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    const userId = decoded.userId;

    const { title, templateId, content, contentAr, language, textDirection } = await request.json();

    if (content?.personalInfo?.linkedin) {
      const result = normalizeLinkedInUrl(content.personalInfo.linkedin);
      if (!result.isValid) {
        return NextResponse.json(
          { error: 'Invalid LinkedIn URL. Must be in format: https://www.linkedin.com/in/your-profile' },
          { status: 400 }
        );
      }
      content.personalInfo.linkedin = result.normalized;
    }

    const slug = `${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    const result = await pool.query(
      `INSERT INTO cvs (user_id, title, template_id, personal_info, content_ar, language, text_direction, is_public, public_slug, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, false, $8, NOW(), NOW())
      RETURNING id`,
      [
        userId,
        title || 'My Professional CV',
        templateId === 'ats-optimized' ? 1 : 2,
        JSON.stringify(content),
        contentAr ? JSON.stringify(contentAr) : null,
        language || 'en',
        textDirection || 'ltr',
        slug,
      ]
    );

    return NextResponse.json({
      cvId: result.rows[0].id,
      success: true,
    });
  } catch (error) {
    console.error('CV save error:', error);
    return NextResponse.json(
      { error: 'Failed to save CV' },
      { status: 500 }
    );
  }
}
