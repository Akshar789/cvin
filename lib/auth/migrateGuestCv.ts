import { pool, db } from '@/server/db';
import { cvs } from '@/shared/schema';

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

export async function migrateGuestCvs(userId: number, userEmail: string): Promise<number | null> {
  try {
    const guestResult = await pool.query(
      'SELECT id, template_id, cv_data FROM guest_cvs WHERE email = $1',
      [userEmail]
    );

    if (guestResult.rows.length === 0) {
      try {
        await pool.query('DELETE FROM guest_users WHERE email = $1', [userEmail]);
      } catch (_) {}
      return null;
    }

    let lastMigratedCvId: number | null = null;

    for (const guestCv of guestResult.rows) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        const cvData = typeof guestCv.cv_data === 'string' ? JSON.parse(guestCv.cv_data) : guestCv.cv_data;
        const generatedContent = cvData?.generatedContent || cvData;

        const personalInfo = generatedContent?.personalInfo || {};
        const fullName = personalInfo?.fullName || personalInfo?.name || 'My CV';
        const summary = generatedContent?.professionalSummary || generatedContent?.summary || '';
        const colorSettings = cvData?.colorSettings || null;
        const templateSlug = guestCv.template_id || cvData?.templateId || null;

        const existingCv = await client.query(
          `SELECT id FROM cvs WHERE user_id = $1 AND title = $2 AND personal_info->>'fullName' = $3 LIMIT 1`,
          [userId, `${fullName}'s CV`, fullName]
        );
        if (existingCv.rows.length > 0) {
          await client.query('DELETE FROM guest_cvs WHERE id = $1', [guestCv.id]);
          await client.query('COMMIT');
          console.log(`[Auth] Skipped duplicate migration for guest CV ${guestCv.id}, existing CV ${existingCv.rows[0].id}`);
          client.release();
          continue;
        }

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
          console.log('[Auth] Reconstructed englishContent from base content');
        }
        if (!arabicContent && englishContent) {
          arabicContent = englishContent;
          console.log('[Auth] Set arabicContent as copy of englishContent (will need translation)');
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

        const contentArForDb = arabicContent && arabicContent !== englishContent
          ? JSON.stringify(arabicContent)
          : null;
        const textDirection = cvData?.language === 'ar' ? 'rtl' : 'ltr';

        console.log(`[Auth] Migration data check: hasEnglish=${!!englishContent}, hasArabic=${!!arabicContent}, hasContentAr=${!!contentArForDb}, lang=${cvData?.language || 'en'}`);


        let templateDbId: number | null = null;
        if (templateSlug) {
          const templateName = SLUG_TO_TEMPLATE_NAME[templateSlug.toLowerCase()];
          if (templateName) {
            const templateResult = await client.query(
              'SELECT id FROM templates WHERE name = $1',
              [templateName]
            );
            if (templateResult.rows.length > 0) {
              templateDbId = templateResult.rows[0].id;
            }
          }
        }

        const cvInsertResult = await client.query(
          `INSERT INTO cvs (user_id, title, personal_info, summary, language, text_direction, content_ar${templateDbId ? ', template_id' : ''}, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7${templateDbId ? ', $8' : ''}, NOW(), NOW()) RETURNING id`,
          templateDbId
            ? [userId, `${fullName}'s CV`, JSON.stringify(enrichedPersonalInfo), summary, cvData?.language || 'en', textDirection, contentArForDb, templateDbId]
            : [userId, `${fullName}'s CV`, JSON.stringify(enrichedPersonalInfo), summary, cvData?.language || 'en', textDirection, contentArForDb]
        );
        const newCvId = cvInsertResult.rows[0].id;

        const experience = generatedContent?.experience || [];
        for (let i = 0; i < experience.length; i++) {
          const exp = experience[i];
          await client.query(
            `INSERT INTO experience (cv_id, company, position, location, start_date, end_date, description, achievements, "order", created_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
            [
              newCvId,
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

        const education = generatedContent?.education || [];
        for (let i = 0; i < education.length; i++) {
          const edu = education[i];
          await client.query(
            `INSERT INTO education (cv_id, institution, degree, field, start_date, end_date, description, "order", created_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
            [
              newCvId,
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
              await client.query(
                `INSERT INTO skills (cv_id, category, skills_list, "order", created_at) VALUES ($1, $2, $3, $4, NOW())`,
                [newCvId, category, JSON.stringify(skillList), order++]
              );
            }
          }
        }

        await client.query('DELETE FROM guest_cvs WHERE id = $1', [guestCv.id]);
        await client.query('COMMIT');
        lastMigratedCvId = newCvId;
      } catch (txError) {
        await client.query('ROLLBACK');
        console.error('[Auth] Transaction failed for guest CV migration:', txError);
      } finally {
        client.release();
      }
    }

    console.log(`[Auth] Auto-migrated ${guestResult.rows.length} guest CV(s) for user ${userId}, lastCvId=${lastMigratedCvId}`);

    try {
      const deleteResult = await pool.query(
        'DELETE FROM guest_users WHERE email = $1',
        [userEmail]
      );
      if (deleteResult.rowCount && deleteResult.rowCount > 0) {
        console.log(`[Auth] Cleaned up guest_users record for ${userEmail}`);
      }
    } catch (cleanupError) {
      console.error('[Auth] Failed to clean up guest_users record:', cleanupError);
    }

    return lastMigratedCvId;
  } catch (error) {
    console.error('[Auth] Failed to auto-migrate guest CVs:', error);
    return null;
  }
}
