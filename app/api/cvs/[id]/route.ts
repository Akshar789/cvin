import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { cvs, education, experience, skills, coverLetters, customSections, cvExports, templates, users } from '@/shared/schema';
import { requireAuth, optionalAuth } from '@/lib/auth/middleware';
import { eq, and, ilike } from 'drizzle-orm';
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

async function resolveTemplateId(templateId: string | number | null): Promise<number | null> {
  if (!templateId) return null;
  if (typeof templateId === 'number') return templateId;
  if (/^\d+$/.test(templateId)) return parseInt(templateId);
  const dbName = TEMPLATE_NAME_MAP[templateId];
  if (!dbName) return null;
  try {
    const [template] = await db.select().from(templates).where(ilike(templates.name, dbName)).limit(1);
    return template?.id || null;
  } catch { return null; }
}

export const GET = optionalAuth(
  async (request: NextRequest, user) => {
    try {
      const id = request.url.split('/').pop();
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

      return NextResponse.json({ cv });
    } catch (error: any) {
      console.error('Get CV error:', error);
      return NextResponse.json({ error: 'Failed to fetch CV' }, { status: 500 });
    }
  }
);

export const PUT = requireAuth(
  async (request: NextRequest, user) => {
    try {
      const id = request.url.split('/').pop();
      if (!id) {
        return NextResponse.json({ error: 'CV ID is required' }, { status: 400 });
      }
      const cvId = parseInt(id);
      const body = await request.json();

      const [existingCV] = await db.select().from(cvs).where(eq(cvs.id, cvId)).limit(1);

      if (!existingCV) {
        return NextResponse.json({ error: 'CV not found' }, { status: 404 });
      }

      if (existingCV.userId !== user.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      if (body.templateId !== undefined) {
        const resolvedIncomingId = await resolveTemplateId(body.templateId);
        const templateChanged = resolvedIncomingId !== existingCV.templateId;
        if (templateChanged) {
          const [currentUser] = await db.select({ subscriptionTier: users.subscriptionTier }).from(users).where(eq(users.id, user.userId)).limit(1);
          const freshTier = currentUser?.subscriptionTier || 'free';
          const templateAccess = await canUseTemplate(user.userId, body.templateId, freshTier);
          if (!templateAccess.allowed) {
            return NextResponse.json(
              { error: templateAccess.error || 'You do not have access to this template' },
              { status: 403 }
            );
          }
        }
      }

      const updateData: any = { ...body, updatedAt: new Date() };
      if (body.templateId !== undefined) {
        const dbTemplateId = await resolveTemplateId(body.templateId);
        updateData.templateId = dbTemplateId;
      }

      const [updatedCV] = await db
        .update(cvs)
        .set(updateData)
        .where(eq(cvs.id, cvId))
        .returning();

      return NextResponse.json({ cv: updatedCV });
    } catch (error: any) {
      console.error('Update CV error:', error);
      return NextResponse.json({ error: 'Failed to update CV' }, { status: 500 });
    }
  }
);

export const DELETE = requireAuth(
  async (request: NextRequest, user) => {
    try {
      const id = request.url.split('/').pop();
      if (!id) {
        return NextResponse.json({ error: 'CV ID is required' }, { status: 400 });
      }
      const cvId = parseInt(id);

      const [existingCV] = await db.select().from(cvs).where(eq(cvs.id, cvId)).limit(1);

      if (!existingCV) {
        return NextResponse.json({ error: 'CV not found' }, { status: 404 });
      }

      if (existingCV.userId !== user.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      await db.delete(education).where(eq(education.cvId, cvId));
      await db.delete(experience).where(eq(experience.cvId, cvId));
      await db.delete(skills).where(eq(skills.cvId, cvId));
      await db.delete(coverLetters).where(eq(coverLetters.cvId, cvId));
      await db.delete(customSections).where(eq(customSections.cvId, cvId));
      await db.delete(cvExports).where(eq(cvExports.cvId, cvId));
      
      await db.delete(cvs).where(eq(cvs.id, cvId));

      return NextResponse.json({ message: 'CV deleted successfully' });
    } catch (error: any) {
      console.error('Delete CV error:', error);
      return NextResponse.json({ error: 'Failed to delete CV' }, { status: 500 });
    }
  }
);
