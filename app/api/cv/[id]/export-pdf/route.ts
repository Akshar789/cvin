import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { pool } from '@/server/db';
import { generatePDF, generatePDFFilename } from '@/lib/pdf/generator';
import { normalizeCvData } from '@/lib/cv/schema';

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
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const { id } = await params;
    const cvId = parseInt(id);

    const url = new URL(request.url);
    let requestedTemplateId = url.searchParams.get('template') || '';
    requestedTemplateId = decodeURIComponent(requestedTemplateId).trim();
    const colorParam = url.searchParams.get('color');
    const colorThemeId = url.searchParams.get('theme') || 'blue';
    const includePhotoRequested = url.searchParams.get('includePhoto') === 'true';
    const directionParam = url.searchParams.get('direction');
    
    console.log('[PDF Export] Request parameters:', {
      rawTemplate: url.searchParams.get('template'),
      requestedTemplateId,
      colorThemeId,
      fullUrl: request.url
    });
    
    const PHOTO_ALLOWED_TEMPLATES = new Set([
      'modern',
      'creative-bold', 
      'creative',
      'elegant',
      'professional',
      'executive',
      'executive-clean-pro',
      'structured-sidebar-pro',
      'global-professional',
      'smart',
      'strong',
      'two-column-pro',
    ]);

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

    const cv = cvResult.rows[0];
    
    if (!requestedTemplateId) {
      const storedTemplateName = cv.template_name;
      if (storedTemplateName && TEMPLATE_NAME_TO_SLUG[storedTemplateName]) {
        requestedTemplateId = TEMPLATE_NAME_TO_SLUG[storedTemplateName];
      } else {
        const personalInfo = typeof cv.personal_info === 'string' ? JSON.parse(cv.personal_info) : cv.personal_info || {};
        requestedTemplateId = personalInfo?.templateSlug || 'simple-professional';
      }
      console.log('[PDF Export] No template specified, using stored template:', requestedTemplateId);
    }
    
    const effectiveTemplateId = requestedTemplateId.toLowerCase().trim();
    
    console.log('[PDF Export] Template selection:', {
      requestedTemplateId,
      effectiveTemplateId,
      storedTemplateName: cv.template_name,
      storedTemplateId: cv.template_id
    });
    
    const isPhotoTemplate = PHOTO_ALLOWED_TEMPLATES.has(effectiveTemplateId);

    let photoUrl: string | null = null;
    if (isPhotoTemplate) {
      const rawPi = typeof cv.personal_info === 'string' ? JSON.parse(cv.personal_info) : cv.personal_info || {};
      if (rawPi.photo) {
        photoUrl = rawPi.photo;
      } else {
        const userResult = await pool.query('SELECT profile_picture FROM users WHERE id = $1', [userId]);
        photoUrl = userResult.rows[0]?.profile_picture || null;
      }
    }

    const educationResult = await pool.query(
      'SELECT * FROM education WHERE cv_id = $1 ORDER BY "order"',
      [cvId]
    );

    const experienceResult = await pool.query(
      'SELECT * FROM experience WHERE cv_id = $1 ORDER BY "order"',
      [cvId]
    );

    const skillsResult = await pool.query(
      'SELECT * FROM skills WHERE cv_id = $1 ORDER BY "order"',
      [cvId]
    );

    const personalInfo = typeof cv.personal_info === 'string' 
      ? JSON.parse(cv.personal_info) 
      : cv.personal_info || {};

    const languageParam = url.searchParams.get('language');
    const cvLanguage = languageParam || cv.language || 'en';
    const textDirection = directionParam || cv.text_direction || (cvLanguage === 'ar' ? 'rtl' : 'ltr');
    const isArabic = cvLanguage === 'ar' || textDirection === 'rtl';

    // ── Language-aware content extraction ─────────────────────────────────────
    // CV content is stored in multiple locations:
    //   1. personalInfo.englishContent / personalInfo.arabicContent (JSON blob)
    //   2. content_ar column (separate DB column for Arabic, used by edit page)
    //   3. DB table rows (experience, education, skills — single-language)
    //   4. Top-level personalInfo arrays (legacy fallback)
    //
    // IMPORTANT: Never fall back to the OPPOSITE language. If English is
    // requested but englishContent is missing, use DB rows / top-level arrays
    // (which may be in any language but are the latest saved data). Silently
    // serving Arabic for an English request causes mixed-language PDFs.
    let contentArFromDb: any = null;
    if (cv.content_ar) {
      contentArFromDb = typeof cv.content_ar === 'string' ? JSON.parse(cv.content_ar) : cv.content_ar;
    }

    const primaryLangContent = isArabic
      ? (personalInfo.arabicContent || contentArFromDb || null)
      : (personalInfo.englishContent || null);
    const langContent = primaryLangContent || {};
    const contentPi = langContent.personalInfo || {};

    console.log('[PDF Export] Language extraction:', {
      cvLanguage,
      isArabic,
      hasPrimaryContent: !!primaryLangContent,
      hasContentArDb: !!contentArFromDb,
      langContentExpCount: (primaryLangContent?.experience || []).length,
      langContentEduCount: (primaryLangContent?.education || []).length,
      hasTopLevelExp: (personalInfo.experience || []).length,
      dbExpRows: experienceResult.rows.length,
      dbEduRows: educationResult.rows.length,
      source: (primaryLangContent?.experience?.length > 0) ? 'langContent-JSON' : (experienceResult.rows.length > 0 ? 'db-rows' : 'top-level'),
    });

    // ── Language-aware data resolution ────────────────────────────────────────
    // PRIORITY ORDER (highest → lowest):
    //   1. langContent.X  — the language-specific JSON blob (arabicContent or
    //      englishContent).  This is the ONLY place Arabic experience/education
    //      data is stored; the separate DB tables hold a single language version
    //      (whichever the user last saved through the edit UI).
    //   2. DB table rows  — used when the JSON blob has no content for the
    //      requested language (e.g. old CVs built before bilingual support, or
    //      CVs that were never auto-generated with dual-language blobs).
    //   3. Top-level personalInfo arrays — final fallback for legacy data shapes.
    //
    // DO NOT invert this order: DB rows are language-agnostic (they hold the last
    // saved language).  Preferring them over langContent causes MIXED-LANGUAGE
    // PDFs when the user requests a language that differs from the last save.
    const hasContent = (val: any): boolean => {
      if (!val) return false;
      if (Array.isArray(val)) return val.length > 0;
      if (typeof val === 'object') {
        return Object.values(val).some((v: any) => Array.isArray(v) && v.length > 0);
      }
      return false;
    };

    const resolvedExperience = hasContent(langContent.experience)
      ? langContent.experience
      : (experienceResult.rows.length > 0 ? experienceResult.rows : (personalInfo.experience || []));

    const resolvedEducation = hasContent(langContent.education)
      ? langContent.education
      : (educationResult.rows.length > 0 ? educationResult.rows : (personalInfo.education || []));

    const resolvedSkills = hasContent(langContent.skills)
      ? langContent.skills
      : (skillsResult.rows.length > 0 ? skillsResult.rows : (personalInfo.skills || []));

    const resolvedCertifications = hasContent(langContent.certifications)
      ? langContent.certifications
      : (personalInfo.certifications || []);

    const resolvedLanguages = hasContent(langContent.languages)
      ? langContent.languages
      : (personalInfo.languages || []);

    const resolvedCourses = hasContent(langContent.courses)
      ? langContent.courses
      : (personalInfo.courses || []);

    // Resolve personal-info fields with language-awareness
    const resolvedFullName = isArabic
      ? (contentPi.fullName || contentPi.name || langContent.fullName || personalInfo.fullName || '')
      : (personalInfo.fullName || personalInfo.name || contentPi.fullName || '');

    const resolvedJobTitle = isArabic
      ? (contentPi.targetJobTitle || contentPi.professionalTitle || langContent.targetJobTitle || personalInfo.targetJobTitle || '')
      : (langContent.professionalTitle || contentPi.targetJobTitle || personalInfo.targetJobTitle || personalInfo.professionalTitle || '');

    const resolvedSummary = isArabic
      ? (contentPi.professionalSummary || langContent.professionalSummary || personalInfo.professionalSummary || cv.summary || '')
      : (langContent.professionalSummary || contentPi.professionalSummary || personalInfo.professionalSummary || cv.summary || '');

    const dbRecord = {
      personal_info: personalInfo,
      summary: resolvedSummary,
      experience: resolvedExperience,
      education: resolvedEducation,
      skills: resolvedSkills,
      courses: resolvedCourses,
      languages: resolvedLanguages,
      certifications: resolvedCertifications,
      cvLanguage: cvLanguage,
      isRTL: isArabic,
    };
    
    const cvData = normalizeCvData(dbRecord) as any;
    cvData.cvLanguage = cvLanguage;
    cvData.isRTL = isArabic;

    // Apply language-aware overrides that normalizeCvData can't derive on its own
    cvData.personalInfo.fullName = resolvedFullName;
    cvData.personalInfo.name = resolvedFullName;
    cvData.personalInfo.targetJobTitle = resolvedJobTitle;
    cvData.personalInfo.professionalTitle = resolvedJobTitle;
    cvData.personalInfo.targetJobDomain = contentPi.targetJobDomain || personalInfo.targetJobDomain || '';
    cvData.personalInfo.nationality = contentPi.nationality || personalInfo.nationality || '';
    cvData.personalInfo.linkedin = personalInfo.linkedin || contentPi.linkedin || '';
    cvData.personalInfo.email = personalInfo.email || contentPi.email || '';
    cvData.personalInfo.phone = personalInfo.phone || contentPi.phone || '';
    cvData.personalInfo.location = isArabic
      ? (contentPi.location || personalInfo.location || '')
      : (personalInfo.location || contentPi.location || '');

    cvData.summary = resolvedSummary;
    cvData.professionalSummary = resolvedSummary;

    // Ensure courses/languages/certifications from langContent take precedence
    if (langContent.courses?.length) cvData.courses = langContent.courses;
    if (langContent.languages?.length) cvData.languages = langContent.languages;
    if (langContent.certifications?.length) cvData.certifications = langContent.certifications;

    // Final fallback for courses / languages from top-level personalInfo
    if (!cvData.courses?.length) cvData.courses = personalInfo.courses || [];
    if (!cvData.languages?.length) cvData.languages = personalInfo.languages || [];
    if (!cvData.certifications?.length) cvData.certifications = personalInfo.certifications || [];

    console.log('[PDF Export] Resolved data summary:', {
      experience: cvData.experience?.length,
      education: cvData.education?.length,
      skills: cvData.skills?.length,
      languages: cvData.languages?.length,
      certifications: cvData.certifications?.length,
      fullName: cvData.personalInfo.fullName,
      summary: resolvedSummary?.substring(0, 60),
    });

    let primaryColor: string | undefined;
    if (colorParam) {
      primaryColor = colorParam.startsWith('#') ? colorParam : `#${colorParam}`;
    }
    
    const template = {
      cssStyles: {
        fontFamily: isArabic ? 'Cairo, Noto Sans Arabic, sans-serif' : 'Arial, sans-serif',
        fontSize: '11pt',
        colors: { primary: primaryColor || '#2c3e50' },
        direction: isArabic ? 'rtl' : 'ltr',
      },
      templateId: effectiveTemplateId,
      colorThemeId,
      templateType: isPhotoTemplate ? 'attractive' as const : 'ats' as const,
      includePhoto: isPhotoTemplate && includePhotoRequested && !!photoUrl,
      photoUrl: photoUrl || undefined,
      primaryColor: primaryColor,
    };

    console.log('[PDF Export] Template config:', {
      templateId: template.templateId,
      colorThemeId: template.colorThemeId,
      isPhotoTemplate,
    });

    const pdfBlob = await generatePDF(cvData, template);
    const buffer = await pdfBlob.arrayBuffer();

    const filename = generatePDFFilename(cvData);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Content-Length': buffer.byteLength.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    console.error('PDF export error:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    
    return NextResponse.json(
      { error: error?.message || 'Failed to export CV. Please try again.' },
      { status: 500 }
    );
  }
}
