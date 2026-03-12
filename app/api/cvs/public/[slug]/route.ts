import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { cvs, education, experience, skills } from '@/shared/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const [cv] = await db
      .select()
      .from(cvs)
      .where(and(eq(cvs.publicSlug, slug), eq(cvs.isPublic, true)))
      .limit(1);

    if (!cv) {
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    const cvEducation = await db.select().from(education).where(eq(education.cvId, cv.id));
    const cvExperience = await db.select().from(experience).where(eq(experience.cvId, cv.id));
    const cvSkills = await db.select().from(skills).where(eq(skills.cvId, cv.id));

    return NextResponse.json({
      cv: {
        ...cv,
        education: cvEducation,
        experience: cvExperience,
        skills: cvSkills,
      },
    });
  } catch (error: any) {
    console.error('Get public CV error:', error);
    return NextResponse.json({ error: 'Failed to fetch CV' }, { status: 500 });
  }
}
