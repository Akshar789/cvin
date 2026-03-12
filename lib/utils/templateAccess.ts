import { db } from '@/server/db';
import { templates } from '@/shared/schema';
import { eq } from 'drizzle-orm';

const PREMIUM_TEMPLATE_SLUGS = new Set([
  'classic',
  'executive',
  'creative',
  'executive-clean-pro',
  'structured-sidebar-pro',
  'global-professional',
  'ats-ultra-pro',
]);

export function isTemplatePremiumBySlug(slug: string): boolean {
  return PREMIUM_TEMPLATE_SLUGS.has(slug);
}

export async function canUseTemplate(userId: number, templateId: number | string | null, userTier: string): Promise<{ allowed: boolean; error?: string }> {
  if (!templateId) {
    return { allowed: true };
  }

  const tierToCheck = (userTier || 'free').toLowerCase().trim();
  const isFreeTier = tierToCheck === 'free' || tierToCheck === '';
  const hasPremiumAccess = !isFreeTier;

  if (typeof templateId === 'string') {
    if (PREMIUM_TEMPLATE_SLUGS.has(templateId) && !hasPremiumAccess) {
      return { allowed: false, error: 'Premium template requires subscription. Please upgrade your plan.' };
    }
    if (!PREMIUM_TEMPLATE_SLUGS.has(templateId)) {
      return { allowed: true };
    }
    return { allowed: true };
  }

  try {
    const [template] = await db.select().from(templates).where(eq(templates.id, templateId)).limit(1);

    if (!template) {
      return { allowed: false, error: 'Template not found' };
    }

    if (!template.isPremium) {
      return { allowed: true };
    }

    if (!hasPremiumAccess) {
      return { allowed: false, error: 'Premium template requires subscription. Please upgrade your plan.' };
    }

    return { allowed: true };
  } catch (error) {
    console.error('[canUseTemplate] Database error:', error);
    return { allowed: true };
  }
}
