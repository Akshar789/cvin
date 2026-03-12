import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { cvs, education, experience, skills, templates } from '@/shared/schema';
import { optionalAuth } from '@/lib/auth/middleware';
import { eq } from 'drizzle-orm';
import { generatePDF } from '@/lib/pdf/generator';
import { canUseTemplate } from '@/lib/utils/templateAccess';

export const GET = optionalAuth(
  async (request: NextRequest, user) => {
    try {
      const pathParts = request.url.split('/');
      const id = pathParts[pathParts.length - 2];
      if (!id) {
        return NextResponse.json({ error: 'CV ID is required' }, { status: 400 });
      }
      const cvId = parseInt(id);
      const [cv] = await db.select().from(cvs).where(eq(cvs.id, cvId)).limit(1);

      if (!cv) {
        return NextResponse.json({ error: 'CV not found' }, { status: 404 });
      }

      if (!cv.isPublic && (!user || cv.userId !== user.userId)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      if (user && cv.templateId) {
        const templateAccess = await canUseTemplate(user.userId, cv.templateId, user.subscriptionTier || 'free');
        if (!templateAccess.allowed) {
          return NextResponse.json(
            { error: templateAccess.error || 'You do not have access to export with this template' },
            { status: 403 }
          );
        }
      }

      const cvEducation = await db.select().from(education).where(eq(education.cvId, cvId));
      const cvExperience = await db.select().from(experience).where(eq(experience.cvId, cvId));
      const cvSkills = await db.select().from(skills).where(eq(skills.cvId, cvId));

      const url = new URL(request.url);
      const directionParam = url.searchParams.get('direction');
      const textDirection = directionParam || cv.textDirection || (cv.language === 'ar' ? 'rtl' : 'ltr');
      const isArabic = textDirection === 'rtl';

      let template = null;
      if (cv.templateId) {
        [template] = await db.select().from(templates).where(eq(templates.id, cv.templateId)).limit(1);
      }

      if (!template) {
        template = {
          cssStyles: {
            fontFamily: isArabic ? 'Cairo, Noto Sans Arabic, sans-serif' : 'Arial, sans-serif',
            fontSize: '11pt',
            colors: { primary: '#2c3e50' },
            direction: isArabic ? 'rtl' : 'ltr',
          },
        };
      }

      const cvData = {
        ...cv,
        education: cvEducation,
        experience: cvExperience,
        skills: cvSkills,
        isRTL: isArabic,
        cvLanguage: cv.language || 'en',
      };

      const pdfBlob = await generatePDF(cvData, template);
      const buffer = await pdfBlob.arrayBuffer();

      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${cv.title.replace(/[^a-z0-9]/gi, '_')}.pdf"`,
        },
      });
    } catch (error: any) {
      console.error('Export CV error:', error);
      return NextResponse.json({ error: 'Failed to export CV' }, { status: 500 });
    }
  }
);
