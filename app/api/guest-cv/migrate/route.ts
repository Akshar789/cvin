import { NextRequest, NextResponse } from 'next/server';
import { pool, db } from '@/server/db';
import { cvs } from '@/shared/schema';
import { verifyToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
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

    const userId = decoded.userId;
    const userEmail = decoded.email;

    let body: any = {};
    try {
      body = await request.json();
    } catch (e) {}
    const guestCvId = body?.guestCvId || null;

    let guestResult;
    if (guestCvId) {
      guestResult = await pool.query(
        'SELECT id, template_id, cv_data FROM guest_cvs WHERE id = $1 AND email = $2',
        [guestCvId, userEmail]
      );
    } else {
      guestResult = await pool.query(
        'SELECT id, template_id, cv_data FROM guest_cvs WHERE email = $1 ORDER BY updated_at DESC LIMIT 1',
        [userEmail]
      );
    }

    if (guestResult.rows.length === 0) {
      return NextResponse.json({ migrated: false, message: 'No guest CV found' });
    }

    const guestCv = guestResult.rows[0];
    const cvData = typeof guestCv.cv_data === 'string' ? JSON.parse(guestCv.cv_data) : guestCv.cv_data;
    const generatedContent = cvData?.generatedContent || cvData;

    const personalInfo = generatedContent?.personalInfo || {};
    const fullName = personalInfo?.fullName || personalInfo?.name || 'My CV';
    const summary = generatedContent?.professionalSummary || generatedContent?.summary || '';
    const colorSettings = cvData?.colorSettings || null;
    const templateSlug = guestCv.template_id || cvData?.templateId || null;

    let englishContent = cvData?.englishContent || generatedContent?.englishContent || null;
    let arabicContent = cvData?.arabicContent || generatedContent?.arabicContent || null;

    const baseContent = {
      personalInfo: personalInfo,
      professionalSummary: summary,
      experience: generatedContent?.experience || [],
      education: generatedContent?.education || [],
      skills: generatedContent?.skills || {},
      certifications: generatedContent?.certifications || [],
      languages: generatedContent?.languages || [],
    };

    if (!englishContent && (baseContent.experience.length > 0 || baseContent.education.length > 0)) {
      englishContent = baseContent;
    }
    if (!arabicContent && englishContent) {
      arabicContent = englishContent;
    }

    const enrichedPersonalInfo: any = {
      ...personalInfo,
      certifications: generatedContent?.certifications || [],
      languages: generatedContent?.languages || [],
      templateSlug: templateSlug,
      colorSettings: colorSettings,
    };

    if (englishContent) {
      enrichedPersonalInfo.englishContent = englishContent;
    }
    if (arabicContent) {
      enrichedPersonalInfo.arabicContent = arabicContent;
    }

    const SLUG_TO_TEMPLATE_NAME: Record<string, string> = {
      'simple-professional': 'Simple Professional',
      'minimalist-clean': 'Minimalist Clean',
      'classic': 'Classic',
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

    let templateDbId: number | null = null;
    if (templateSlug) {
      const templateName = SLUG_TO_TEMPLATE_NAME[templateSlug.toLowerCase()];
      if (templateName) {
        const templateResult = await pool.query(
          'SELECT id FROM templates WHERE name = $1',
          [templateName]
        );
        if (templateResult.rows.length > 0) {
          templateDbId = templateResult.rows[0].id;
        }
      }
      if (!templateDbId) {
        const fallbackResult = await pool.query(
          'SELECT id FROM templates WHERE LOWER(name) = LOWER($1)',
          [templateSlug]
        );
        if (fallbackResult.rows.length > 0) {
          templateDbId = fallbackResult.rows[0].id;
        }
      }
    }

    const insertValues: any = {
      userId: userId,
      title: `${fullName}'s CV`,
      personalInfo: enrichedPersonalInfo,
      summary: summary,
      language: cvData?.language || 'en',
    };
    if (templateDbId) {
      insertValues.templateId = templateDbId;
    }

    const [newCv] = await db
      .insert(cvs)
      .values(insertValues)
      .returning();

    const experience = generatedContent?.experience || [];
    if (experience.length > 0) {
      for (let i = 0; i < experience.length; i++) {
        const exp = experience[i];
        await pool.query(
          `INSERT INTO experience (cv_id, company, position, location, start_date, end_date, description, achievements, "order", created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
          [
            newCv.id,
            exp.company || '',
            exp.position || exp.title || '',
            exp.location || null,
            exp.startDate || '',
            exp.endDate || null,
            exp.description || null,
            JSON.stringify(exp.achievements || exp.responsibilities || []),
            i,
          ]
        );
      }
    }

    const education = generatedContent?.education || [];
    if (education.length > 0) {
      for (let i = 0; i < education.length; i++) {
        const edu = education[i];
        await pool.query(
          `INSERT INTO education (cv_id, institution, degree, field, start_date, end_date, description, "order", created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
          [
            newCv.id,
            edu.institution || edu.school || '',
            edu.degree || '',
            edu.field || edu.fieldOfStudy || '',
            edu.startDate || '',
            edu.endDate || edu.graduationYear || null,
            edu.description || null,
            i,
          ]
        );
      }
    }

    const skills = generatedContent?.skills;
    if (skills) {
      const skillCategories: Record<string, string[]> = {};
      if (Array.isArray(skills)) {
        skillCategories['General'] = skills.map((s: any) => typeof s === 'string' ? s : s.name || '').filter(Boolean);
      } else if (typeof skills === 'object') {
        for (const [category, skillList] of Object.entries(skills)) {
          if (Array.isArray(skillList) && skillList.length > 0) {
            skillCategories[category] = skillList.map((s: any) => typeof s === 'string' ? s : s.name || '').filter(Boolean);
          }
        }
      }

      let order = 0;
      for (const [category, skillList] of Object.entries(skillCategories)) {
        if (skillList.length > 0) {
          await pool.query(
            `INSERT INTO skills (cv_id, category, skills_list, "order", created_at) VALUES ($1, $2, $3, $4, NOW())`,
            [newCv.id, category, JSON.stringify(skillList), order++]
          );
        }
      }
    }

    if (templateSlug) {
      await pool.query(
        'UPDATE users SET selected_template = $1, onboarding_completed = true WHERE id = $2',
        [templateSlug, userId]
      );
    } else {
      await pool.query(
        'UPDATE users SET onboarding_completed = true WHERE id = $1',
        [userId]
      );
    }

    await pool.query('DELETE FROM guest_cvs WHERE id = $1', [guestCv.id]);

    const remainingGuestCvs = await pool.query(
      'SELECT id FROM guest_cvs WHERE email = $1 LIMIT 1',
      [userEmail]
    );
    if (remainingGuestCvs.rows.length === 0) {
      await pool.query('DELETE FROM guest_users WHERE email = $1', [userEmail]);
    }

    return NextResponse.json({
      migrated: true,
      cvId: newCv.id,
      templateId: templateSlug,
      colorSettings: colorSettings,
    });
  } catch (error: any) {
    console.error('Guest CV migration error:', error);
    return NextResponse.json(
      { error: 'Failed to migrate guest CV' },
      { status: 500 }
    );
  }
}
