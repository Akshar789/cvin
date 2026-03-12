import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { generatePDF } from '@/lib/pdf/generator';
import { normalizeCvData } from '@/lib/cv/schema';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    
    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    const userId = decoded.userId;

    const body = await request.json();
    const { cvData, templateId, primaryColor, direction } = body;

    console.log('[Preview PDF] Received request:', { 
      templateId, 
      primaryColor,
      hasCvData: !!cvData,
      personalInfoName: cvData?.personalInfo?.fullName || cvData?.personalInfo?.name 
    });

    if (!cvData) {
      return NextResponse.json({ error: 'CV data is required' }, { status: 400 });
    }

    // Transform frontend CV data format to match what the PDF generator expects
    const transformedData = {
      personalInfo: {
        name: cvData.personalInfo?.fullName || cvData.personalInfo?.name || '',
        fullName: cvData.personalInfo?.fullName || cvData.personalInfo?.name || '',
        email: cvData.personalInfo?.email || '',
        phone: cvData.personalInfo?.phone || '',
        location: cvData.personalInfo?.location || '',
        professionalTitle: cvData.personalInfo?.professionalTitle || cvData.personalInfo?.targetJobTitle || '',
        targetJobTitle: cvData.personalInfo?.targetJobTitle || cvData.personalInfo?.professionalTitle || '',
        linkedin: cvData.personalInfo?.linkedin || '',
        photo: cvData.personalInfo?.photo || '',
      },
      summary: cvData.professionalSummary || cvData.summary || '',
      professionalSummary: cvData.professionalSummary || cvData.summary || '',
      experience: (cvData.experience || []).map((exp: any) => ({
        company: exp.company || '',
        position: exp.position || exp.title || '',
        title: exp.position || exp.title || '',
        location: exp.location || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        description: exp.description || (Array.isArray(exp.responsibilities) ? exp.responsibilities.join(' ') : ''),
        achievements: Array.isArray(exp.achievements) ? exp.achievements : [],
        responsibilities: Array.isArray(exp.responsibilities) ? exp.responsibilities : [],
      })),
      education: (cvData.education || []).map((edu: any) => ({
        institution: edu.institution || edu.school || '',
        school: edu.institution || edu.school || '',
        degree: edu.degree || '',
        field: edu.field || edu.fieldOfStudy || '',
        fieldOfStudy: edu.field || edu.fieldOfStudy || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || edu.graduationYear || '',
        graduationYear: edu.endDate || edu.graduationYear || '',
        gpa: edu.gpa || '',
        description: edu.description || (Array.isArray(edu.achievements) ? edu.achievements.join(' ') : ''),
      })),
      skills: cvData.skills || [],
      languages: (cvData.languages || []).map((lang: any) => 
        typeof lang === 'string' 
          ? { name: lang, language: lang, level: 'Fluent' }
          : { name: lang.name || lang.language || '', language: lang.name || lang.language || '', level: lang.level || lang.proficiency || 'Fluent' }
      ),
      certifications: (cvData.certifications || cvData.courses || []).map((cert: any) => 
        typeof cert === 'string'
          ? { name: cert, title: cert, issuer: '', organization: '', date: '' }
          : { name: cert.name || cert.title || '', title: cert.name || cert.title || '', issuer: cert.issuer || cert.organization || '', organization: cert.issuer || cert.organization || '', date: cert.date || '' }
      ),
      courses: (cvData.courses || cvData.certifications || []).map((course: any) => 
        typeof course === 'string'
          ? { name: course }
          : { name: course.name || course.title || '' }
      ),
      cvLanguage: cvData.cvLanguage || 'en',
      isRTL: direction === 'rtl' || cvData.isRTL || cvData.cvLanguage === 'ar',
    };

    // Determine template - ensure exact match
    const templateMap: Record<string, string> = {
      'simple-professional': 'simple-professional',
      'minimalist-clean': 'minimalist-clean',
      'ats': 'classic-ats',
      'classic-ats': 'classic-ats',
    };

    const effectiveTemplateId = templateMap[templateId] || templateId || 'minimalist-clean';
    const isArabic = transformedData.isRTL;
    
    // Use the provided primaryColor, or default based on template
    // Ensure color is in correct format (with # if missing)
    let finalPrimaryColor = primaryColor;
    if (!finalPrimaryColor) {
      finalPrimaryColor = effectiveTemplateId === 'minimalist-clean' ? '#B8860B' : '#333333';
    } else if (!finalPrimaryColor.startsWith('#')) {
      finalPrimaryColor = '#' + finalPrimaryColor;
    }

    console.log('[Preview PDF] Template config:', {
      requestedTemplateId: templateId,
      effectiveTemplateId,
      primaryColor,
      finalPrimaryColor,
      templateIdType: typeof templateId,
      primaryColorType: typeof primaryColor,
    });

    const template = {
      cssStyles: {
        fontFamily: isArabic ? 'Cairo, Noto Sans Arabic, sans-serif' : 'Arial, sans-serif',
        fontSize: '11pt',
        colors: { primary: finalPrimaryColor },
        direction: isArabic ? 'rtl' : 'ltr',
      },
      templateId: effectiveTemplateId,
      colorThemeId: 'blue',
      templateType: 'ats' as const,
      includePhoto: false,
      photoUrl: undefined,
      primaryColor: finalPrimaryColor, // Use the final color
    };

    // Generate PDF
    const pdfBlob = await generatePDF(transformedData, template);
    const buffer = await pdfBlob.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    console.error('Preview PDF error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate preview PDF' },
      { status: 500 }
    );
  }
}

