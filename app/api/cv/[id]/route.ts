import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { pool } from '@/server/db';
import { prepareCvForPersistence, normalizeCvData } from '@/lib/cv/schema';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    const userId = decoded.userId;
    
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not configured');
      return NextResponse.json(
        { error: 'Server configuration error: Database connection not configured' },
        { status: 500 }
      );
    }
    
    const { id } = await params;
    const cvId = parseInt(id);

    if (isNaN(cvId)) {
      return NextResponse.json({ error: 'Invalid CV ID' }, { status: 400 });
    }

    const cvResult = await pool.query(
      `SELECT c.*, t.name as template_name
      FROM cvs c
      LEFT JOIN templates t ON c.template_id = t.id
      WHERE c.id = $1 AND c.user_id = $2`,
      [cvId, userId]
    );

    if (!cvResult.rows || cvResult.rows.length === 0) {
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    const cvRecord = cvResult.rows[0];

    const educationResult = await pool.query(
      'SELECT * FROM education WHERE cv_id = $1 ORDER BY "order" ASC',
      [cvId]
    );

    const experienceResult = await pool.query(
      'SELECT * FROM experience WHERE cv_id = $1 ORDER BY "order" ASC',
      [cvId]
    );

    const skillsResult = await pool.query(
      'SELECT * FROM skills WHERE cv_id = $1 ORDER BY "order" ASC',
      [cvId]
    );

    const dbRecord = {
      personal_info: cvRecord.personal_info,
      summary: cvRecord.summary,
      education: educationResult.rows,
      experience: experienceResult.rows,
      skills: skillsResult.rows,
    };

    const normalizedData = normalizeCvData(dbRecord);

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
    
    const templateSlug = cvRecord.template_name 
      ? (TEMPLATE_NAME_TO_SLUG[cvRecord.template_name] || cvRecord.template_name.toLowerCase())
      : null;

    const parsedPersonalInfo = typeof cvRecord.personal_info === 'string' 
      ? JSON.parse(cvRecord.personal_info) 
      : cvRecord.personal_info;
    const personalInfoTemplateSlug = parsedPersonalInfo?.templateSlug || null;
    const colorSettings = parsedPersonalInfo?.colorSettings || null;

    const contentAr = cvRecord.content_ar
      ? (typeof cvRecord.content_ar === 'string' ? JSON.parse(cvRecord.content_ar) : cvRecord.content_ar)
      : null;

    const normalizedCv = {
      id: cvRecord.id,
      userId: cvRecord.user_id,
      title: cvRecord.title,
      templateId: (() => {
        const resolved = templateSlug || personalInfoTemplateSlug || cvRecord.template_id;
        const isNumeric = typeof resolved === 'number' || (typeof resolved === 'string' && /^\d+$/.test(resolved));
        return isNumeric ? 'simple-professional' : resolved;
      })(),
      templateName: cvRecord.template_name,
      colorSettings: colorSettings,
      language: cvRecord.language,
      textDirection: cvRecord.text_direction || 'ltr',
      contentAr: contentAr,
      atsScore: cvRecord.ats_score,
      isPublic: cvRecord.is_public,
      publicSlug: cvRecord.public_slug,
      createdAt: cvRecord.created_at,
      updatedAt: cvRecord.updated_at,
      ...normalizedData,
    };

    return NextResponse.json({ cv: normalizedCv });
  } catch (error: any) {
    console.error('CV fetch error:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    
    let errorMessage = 'Failed to fetch CV';
    
    if (error?.message?.includes('DATABASE_URL') || error?.message?.includes('connection')) {
      errorMessage = 'Database connection error. Please check server configuration.';
    } else if (error?.message?.includes('JWT') || error?.name === 'JsonWebTokenError') {
      errorMessage = 'Authentication error. Please log in again.';
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    const userId = decoded.userId;
    
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is not configured');
      return NextResponse.json(
        { error: 'Server configuration error: Database connection not configured' },
        { status: 500 }
      );
    }
    
    const { id } = await params;
    const cvId = parseInt(id);

    if (isNaN(cvId)) {
      return NextResponse.json({ error: 'Invalid CV ID' }, { status: 400 });
    }

    let cvData;
    try {
      cvData = await request.json();
    } catch (jsonError: any) {
      console.error('[CV Update] JSON parse error:', jsonError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    if (!cvData || typeof cvData !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }
    
    console.log('[CV Update] Received data:', {
      cvId,
      userId,
      hasTemplateId: !!cvData.templateId,
      templateId: cvData.templateId,
      hasPersonalInfo: !!cvData.personalInfo,
      hasExperience: !!cvData.experience,
      hasEducation: !!cvData.education,
      hasSkills: !!cvData.skills,
    });

    const cvCheck = await pool.query(
      'SELECT id FROM cvs WHERE id = $1 AND user_id = $2',
      [cvId, userId]
    );
    
    if (!cvCheck.rows || cvCheck.rows.length === 0) {
      console.error('[CV Update] CV not found:', { cvId, userId });
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    let templateDbId: number | null = null;
    if (cvData.templateId) {
      try {
        if (typeof cvData.templateId === 'number') {
          const templateCheck = await pool.query(
            'SELECT id FROM templates WHERE id = $1 LIMIT 1',
            [cvData.templateId]
          );
          if (templateCheck.rows && templateCheck.rows.length > 0) {
            templateDbId = cvData.templateId;
            console.log('[CV Update] Template ID verified:', templateDbId);
          } else {
            console.warn('[CV Update] Template ID not found in database:', cvData.templateId);
          }
        } else {
          const templateSlug = String(cvData.templateId).toLowerCase().trim();
          const templateMap: Record<string, string> = {
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
          
          const templateName = templateMap[templateSlug];
          if (templateName) {
            try {
              const templateResult = await pool.query(
                'SELECT id FROM templates WHERE LOWER(TRIM(name)) = LOWER(TRIM($1)) LIMIT 1',
                [templateName]
              );
              if (templateResult.rows && templateResult.rows.length > 0) {
                templateDbId = templateResult.rows[0].id;
                console.log('[CV Update] Template found:', { templateSlug, templateName, templateDbId });
              } else {
                console.warn('[CV Update] Template not found in database:', { templateName, templateSlug });
                try {
                  const fallbackResult = await pool.query(
                    'SELECT id FROM templates WHERE LOWER(name) LIKE LOWER($1) LIMIT 1',
                    ['%' + templateName + '%']
                  );
                  if (fallbackResult.rows && fallbackResult.rows.length > 0) {
                    templateDbId = fallbackResult.rows[0].id;
                    console.log('[CV Update] Template found via fallback:', { templateName, templateDbId });
                  }
                } catch (fallbackError: any) {
                  console.warn('[CV Update] Fallback template lookup failed:', fallbackError?.message);
                }
              }
            } catch (dbError: any) {
              console.error('[CV Update] Database error during template lookup:', dbError);
            }
          } else {
            console.warn('[CV Update] Unknown template slug:', { templateSlug });
          }
        }
      } catch (templateError: any) {
        console.error('[CV Update] Template lookup error:', {
          message: templateError?.message,
          stack: templateError?.stack,
          templateId: cvData.templateId
        });
      }
    }

    const personalInfo = cvData.personalInfo || {};
    
    let existingPersonalInfo: any = {};
    try {
      const existingCv = await pool.query('SELECT personal_info FROM cvs WHERE id = $1', [cvId]);
      if (existingCv.rows.length > 0) {
        existingPersonalInfo = typeof existingCv.rows[0].personal_info === 'string' 
          ? JSON.parse(existingCv.rows[0].personal_info) 
          : existingCv.rows[0].personal_info || {};
      }
    } catch (e) {}

    let personalInfoForDb: any;
    try {
      let skillsForPi: any[] = [];
      if (Array.isArray(cvData.skills)) {
        skillsForPi = cvData.skills.filter((s: any) => s !== null && s !== undefined);
      } else if (typeof cvData.skills === 'object' && cvData.skills !== null) {
        for (const [cat, list] of Object.entries(cvData.skills)) {
          if (Array.isArray(list) && list.length > 0) {
            skillsForPi.push({ category: cat, skillsList: list });
          }
        }
      }

      personalInfoForDb = {
        name: personalInfo.fullName || personalInfo.name || '',
        fullName: personalInfo.fullName || personalInfo.name || '',
        professionalTitle: personalInfo.professionalTitle || personalInfo.targetJobTitle || '',
        targetJobTitle: personalInfo.targetJobTitle || personalInfo.professionalTitle || '',
        email: personalInfo.email || '',
        phone: personalInfo.phone || '',
        location: personalInfo.location || '',
        nationality: personalInfo.nationality || '',
        linkedin: personalInfo.linkedin || '',
        targetJobDomain: personalInfo.targetJobDomain || '',
        photoUrl: personalInfo.photoUrl || '',
        professionalSummary: cvData.professionalSummary || personalInfo.professionalSummary || '',
        courses: Array.isArray(cvData.courses) ? cvData.courses : [],
        skills: skillsForPi,
        languages: Array.isArray(cvData.languages) ? cvData.languages : [],
        certifications: Array.isArray(cvData.certifications) ? cvData.certifications : [],
        experience: Array.isArray(cvData.experience) ? cvData.experience : [],
        education: Array.isArray(cvData.education) ? cvData.education : [],
        templateSlug: cvData.templateId || personalInfo.templateSlug || existingPersonalInfo.templateSlug || null,
        colorSettings: personalInfo.colorSettings || existingPersonalInfo.colorSettings || null,
        englishContent: personalInfo.englishContent || existingPersonalInfo.englishContent || null,
        arabicContent: personalInfo.arabicContent || existingPersonalInfo.arabicContent || null,
      };
    } catch (infoError: any) {
      console.error('[CV Update] Error preparing personal info:', infoError);
      throw new Error('Invalid personal information data');
    }

    const summary = cvData.professionalSummary || cvData.summary || cvData.personalInfo?.professionalSummary || '';
    
    let personalInfoJson: string;
    try {
      personalInfoJson = JSON.stringify(personalInfoForDb);
    } catch (jsonError: any) {
      console.error('[CV Update] Error stringifying personal info:', jsonError);
      throw new Error('Failed to serialize personal information');
    }
    
    console.log('[CV Update] Preparing to update CV:', {
      cvId,
      hasSummary: !!summary,
      summaryLength: summary?.length || 0,
      templateDbId,
    });
    
    try {
      const textDir = cvData.textDirection || 'ltr';
      const contentArJson = cvData.contentAr ? JSON.stringify(cvData.contentAr) : null;
      if (templateDbId !== null) {
        console.log('[CV Update] Updating CV with template_id:', templateDbId);
        await pool.query(
          `UPDATE cvs SET
            personal_info = $1,
            summary = $2,
            language = $3,
            title = $4,
            template_id = $5,
            text_direction = $6,
            content_ar = COALESCE($9, content_ar),
            updated_at = NOW()
          WHERE id = $7 AND user_id = $8`,
          [personalInfoJson, summary || '', cvData.language || 'en', cvData.title || '', templateDbId, textDir, cvId, userId, contentArJson]
        );
      } else {
        console.log('[CV Update] Updating CV without template_id');
        await pool.query(
          `UPDATE cvs SET
            personal_info = $1,
            summary = $2,
            language = $3,
            title = $4,
            text_direction = $5,
            content_ar = COALESCE($8, content_ar),
            updated_at = NOW()
          WHERE id = $6 AND user_id = $7`,
          [personalInfoJson, summary || '', cvData.language || 'en', cvData.title || '', textDir, cvId, userId, contentArJson]
        );
      }
      console.log('[CV Update] CV record updated successfully');
    } catch (updateError: any) {
      console.error('[CV Update] Error updating CV record:', updateError);
      throw updateError;
    }

    console.log('[CV Update] Deleting existing education, experience, and skills');
    try {
      await pool.query('DELETE FROM education WHERE cv_id = $1', [cvId]);
      await pool.query('DELETE FROM experience WHERE cv_id = $1', [cvId]);
      await pool.query('DELETE FROM skills WHERE cv_id = $1', [cvId]);
      console.log('[CV Update] Existing records deleted');
    } catch (deleteError: any) {
      console.error('[CV Update] Error deleting existing records:', deleteError);
      throw deleteError;
    }

    if (cvData.education && Array.isArray(cvData.education)) {
      console.log('[CV Update] Inserting education entries:', cvData.education.length);
      try {
        for (let i = 0; i < cvData.education.length; i++) {
          const edu = cvData.education[i];
          if (!edu) continue;
          
          const description = edu.description || (edu.achievements ? (Array.isArray(edu.achievements) ? edu.achievements.join('\n') : String(edu.achievements || '')) : '');
          
          await pool.query(
            `INSERT INTO education (cv_id, institution, degree, field, start_date, end_date, description, "order")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              cvId,
              edu.institution || edu.school || '',
              edu.degree || '',
              edu.field || edu.fieldOfStudy || '',
              edu.startDate || null,
              edu.endDate || edu.graduationDate || null,
              description || null,
              i,
            ]
          );
        }
        console.log('[CV Update] Education entries inserted successfully');
      } catch (eduError: any) {
        console.error('[CV Update] Error inserting education:', eduError);
        throw eduError;
      }
    }

    if (cvData.experience && Array.isArray(cvData.experience)) {
      console.log('[CV Update] Inserting experience entries:', cvData.experience.length);
      try {
        for (let i = 0; i < cvData.experience.length; i++) {
          const exp = cvData.experience[i];
          if (!exp) continue;
          
          const responsibilities = exp.responsibilities || exp.achievements || [];
          const description = exp.description || (Array.isArray(responsibilities) ? responsibilities.join('\n') : String(responsibilities || ''));
          
          await pool.query(
            `INSERT INTO experience (cv_id, company, position, location, start_date, end_date, description, achievements, "order")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              cvId,
              exp.company || '',
              exp.position || exp.title || '',
              exp.location || '',
              exp.startDate || null,
              exp.endDate || null,
              description || null,
              JSON.stringify(Array.isArray(responsibilities) ? responsibilities : []),
              i,
            ]
          );
        }
        console.log('[CV Update] Experience entries inserted successfully');
      } catch (expError: any) {
        console.error('[CV Update] Error inserting experience:', expError);
        throw expError;
      }
    }

    if (cvData.skills) {
      let skillsArray: any[] = [];
      
      if (!Array.isArray(cvData.skills) && typeof cvData.skills === 'object' && cvData.skills !== null) {
        const skillsObj = cvData.skills as any;
        if (skillsObj.technical && Array.isArray(skillsObj.technical) && skillsObj.technical.length > 0) {
          skillsArray.push({
            category: 'Technical',
            skillsList: skillsObj.technical
          });
        }
        if (skillsObj.soft && Array.isArray(skillsObj.soft) && skillsObj.soft.length > 0) {
          skillsArray.push({
            category: 'Soft Skills',
            skillsList: skillsObj.soft
          });
        }
        if (skillsObj.tools && Array.isArray(skillsObj.tools) && skillsObj.tools.length > 0) {
          skillsArray.push({
            category: 'Tools',
            skillsList: skillsObj.tools
          });
        }
      } else if (Array.isArray(cvData.skills) && cvData.skills.length > 0) {
        skillsArray = cvData.skills.filter((s: any) => s !== null && s !== undefined);
      }
      
      if (skillsArray.length > 0) {
        for (let i = 0; i < skillsArray.length; i++) {
          const skill = skillsArray[i];
          if (!skill) continue;
          
          const skillsList = skill.skillsList || skill.skills || [];
          if (!Array.isArray(skillsList) || skillsList.length === 0) continue;
          
          await pool.query(
            `INSERT INTO skills (cv_id, category, skills_list, "order")
            VALUES ($1, $2, $3, $4)`,
            [cvId, skill.category || 'General', JSON.stringify(skillsList), i]
          );
        }
      }
    }

    console.log('[CV Update] CV updated successfully');
    return NextResponse.json({ success: true, cvId });
  } catch (error: any) {
    console.error('[CV Update] CV update error:', error);
    console.error('[CV Update] Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      code: error?.code,
      detail: error?.detail,
      hint: error?.hint,
      cause: error?.cause,
    });
    
    let errorMessage = 'Failed to update CV';
    let statusCode = 500;
    
    if (error?.message?.includes('DATABASE_URL') || error?.message?.includes('connection')) {
      errorMessage = 'Database connection error. Please check server configuration.';
      statusCode = 500;
    } else if (error?.message?.includes('JWT') || error?.name === 'JsonWebTokenError') {
      errorMessage = 'Authentication error. Please log in again.';
      statusCode = 401;
    } else if (error?.code === '23505') {
      errorMessage = 'A CV with this information already exists.';
      statusCode = 409;
    } else if (error?.code === '23503') {
      errorMessage = 'Invalid template or reference. Please check your data.';
      statusCode = 400;
    } else if (error?.message?.includes('JSON') || error?.message?.includes('stringify')) {
      errorMessage = 'Invalid data format. Please check your CV data.';
      statusCode = 400;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? {
          message: error?.message,
          code: error?.code,
          name: error?.name,
        } : undefined
      },
      { status: statusCode }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;

    const { id } = await params;
    const cvId = parseInt(id);
    if (isNaN(cvId)) {
      return NextResponse.json({ error: 'Invalid CV ID' }, { status: 400 });
    }

    const body = await request.json();
    const { title } = body;
    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const result = await pool.query(
      `UPDATE cvs SET title = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 RETURNING id, title`,
      [title.trim(), cvId, userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'CV not found or not authorized' }, { status: 404 });
    }

    return NextResponse.json({ id: cvId, title: result.rows[0].title });
  } catch (error: any) {
    console.error('PATCH /api/cv/[id] error:', error);
    return NextResponse.json({ error: 'Failed to rename CV' }, { status: 500 });
  }
}
