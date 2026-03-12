import { NextRequest, NextResponse } from 'next/server';
import { db, pool } from '@/server/db';
import { cvs, templates, users } from '@/shared/schema';
import { requireAuth, optionalAuth } from '@/lib/auth/middleware';
import { eq, ilike, desc } from 'drizzle-orm';
import { canUseTemplate } from '@/lib/utils/templateAccess';

const TEMPLATE_NAME_MAP: Record<string, string> = {
  'simple-professional': 'Simple Professional',
  'simple': 'Simple Professional',
  'minimalist-clean': 'Minimalist Clean',
  'minimalist': 'Minimalist Clean',
  'white-minimalist': 'Minimalist Clean',
  'classic': 'Classic',
  'classic-ats': 'Classic',
  'ats-optimized': 'Classic',
  'minimal-clean': 'Classic',
  'modern': 'Modern',
  'executive': 'Executive',
  'creative': 'Creative',
  'executive-clean-pro': 'Executive Clean Pro',
  'structured-sidebar-pro': 'Structured Sidebar Pro',
  'global-professional': 'Global Professional',
  'ats-ultra-pro': 'ATS Ultra Pro',
  'smart': 'Smart',
  'strong': 'Strong',
  'elegant': 'Elegant',
  'compact': 'Compact',
  'two-column-pro': 'Two Column Pro',
  'clean-modern': 'Clean Modern',
  'professional-edge': 'Professional Edge',
  'metro': 'Metro',
  'fresh-start': 'Fresh Start',
  'nordic': 'Nordic',
};

async function getTemplateDbId(templateId: string | number | null): Promise<number | null> {
  if (!templateId) return null;
  if (typeof templateId === 'number') return templateId;
  const dbName = TEMPLATE_NAME_MAP[templateId];
  if (!dbName) return null;
  try {
    const [template] = await db.select().from(templates).where(ilike(templates.name, dbName)).limit(1);
    return template?.id || null;
  } catch (e) {
    console.error('Error looking up template:', e);
    return null;
  }
}

const TEMPLATE_NAME_TO_SLUG: Record<string, string> = {
  'Simple Professional': 'simple-professional',
  'Minimalist Clean': 'minimalist-clean',
  'Classic': 'classic',
  'Modern': 'modern',
  'Executive': 'executive',
  'Creative': 'creative',
  'Executive Clean Pro': 'executive-clean-pro',
  'Structured Sidebar Pro': 'structured-sidebar-pro',
  'Global Professional': 'global-professional',
  'ATS Ultra Pro': 'ats-ultra-pro',
  'Smart': 'smart',
  'Strong': 'strong',
  'Elegant': 'elegant',
  'Compact': 'compact',
  'Two Column Pro': 'two-column-pro',
  'Clean Modern': 'clean-modern',
  'Professional Edge': 'professional-edge',
  'Metro': 'metro',
  'Fresh Start': 'fresh-start',
  'Nordic': 'nordic',
  'Professional Classic': 'classic',
};

export const GET = optionalAuth(async (request: NextRequest, user) => {
  try {
    if (!user) {
      return NextResponse.json({ cvs: [] });
    }

    const userCVs = await db
      .select({
        id: cvs.id,
        userId: cvs.userId,
        title: cvs.title,
        personalInfo: cvs.personalInfo,
        summary: cvs.summary,
        templateId: cvs.templateId,
        templateName: templates.name,
        language: cvs.language,
        textDirection: cvs.textDirection,
        atsScore: cvs.atsScore,
        isPublic: cvs.isPublic,
        publicSlug: cvs.publicSlug,
        createdAt: cvs.createdAt,
        updatedAt: cvs.updatedAt,
      })
      .from(cvs)
      .leftJoin(templates, eq(cvs.templateId, templates.id))
      .where(eq(cvs.userId, user.userId))
      .orderBy(desc(cvs.updatedAt));

    const cvsWithRelatedData = await Promise.all(userCVs.map(async (cv) => {
      let slug = cv.templateName 
        ? (TEMPLATE_NAME_TO_SLUG[cv.templateName] || null)
        : null;
      
      if (!slug) {
        const pi = typeof cv.personalInfo === 'string' ? JSON.parse(cv.personalInfo) : cv.personalInfo;
        slug = pi?.templateSlug || null;
      }

      const finalTemplateId = slug || cv.templateId;
      const isNumeric = typeof finalTemplateId === 'number' || (typeof finalTemplateId === 'string' && /^\d+$/.test(finalTemplateId));

      const pi = typeof cv.personalInfo === 'string' ? JSON.parse(cv.personalInfo) : cv.personalInfo;
      const hasLangContent = !!(pi?.englishContent || pi?.arabicContent);
      const hasTopLevelContent = !!(pi?.experience && pi.experience.length > 0);

      let relatedData: any = {};
      if (!hasLangContent && !hasTopLevelContent) {
        try {
          const [expResult, eduResult, skillsResult] = await Promise.all([
            pool.query('SELECT company, position, location, start_date as "startDate", end_date as "endDate", description, achievements, "order" FROM experience WHERE cv_id = $1 ORDER BY "order"', [cv.id]),
            pool.query('SELECT institution, degree, field, start_date as "startDate", end_date as "endDate", description, "order" FROM education WHERE cv_id = $1 ORDER BY "order"', [cv.id]),
            pool.query('SELECT category, skills_list as "skillsList", "order" FROM skills WHERE cv_id = $1 ORDER BY "order"', [cv.id]),
          ]);
          relatedData = {
            experienceRecords: expResult.rows,
            educationRecords: eduResult.rows,
            skillsRecords: skillsResult.rows,
          };
        } catch (e) {
          console.error('Error fetching related data for CV', cv.id, e);
        }
      }

      return {
        ...cv,
        templateId: isNumeric ? 'simple-professional' : finalTemplateId,
        ...relatedData,
      };
    }));

    return NextResponse.json({ cvs: cvsWithRelatedData });
  } catch (error: any) {
    console.error('Get CVs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch CVs' },
      { status: 500 }
    );
  }
});

export const POST = requireAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { title, personalInfo, summary, templateId, language, textDirection } = body;

    if (!title || !personalInfo) {
      return NextResponse.json(
        { error: 'Title and personal info are required' },
        { status: 400 }
      );
    }

    const [currentUser] = await db.select({ subscriptionTier: users.subscriptionTier }).from(users).where(eq(users.id, user.userId)).limit(1);
    const freshTier = currentUser?.subscriptionTier || 'free';
    const templateAccess = await canUseTemplate(user.userId, templateId, freshTier);
    if (!templateAccess.allowed) {
      return NextResponse.json(
        { error: templateAccess.error || 'You do not have access to this template' },
        { status: 403 }
      );
    }

    const dbTemplateId = await getTemplateDbId(templateId);

    const [newCV] = await db
      .insert(cvs)
      .values({
        userId: user.userId,
        title,
        personalInfo,
        summary: summary || null,
        templateId: dbTemplateId,
        language: language || 'en',
        textDirection: textDirection || 'ltr',
      })
      .returning();

    return NextResponse.json({ cv: newCV }, { status: 201 });
  } catch (error: any) {
    console.error('Create CV error:', error);
    return NextResponse.json(
      { error: 'Failed to create CV' },
      { status: 500 }
    );
  }
});
