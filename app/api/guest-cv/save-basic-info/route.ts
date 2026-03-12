import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/server/db';
import { isValidSaudiPhone, normalizeSaudiPhone } from '@/lib/utils/phoneValidation';

export async function POST(request: NextRequest) {
  try {
    const { email, templateId, basicInfo } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    let normalizedPhone = '';
    if (basicInfo?.phone) {
      if (!isValidSaudiPhone(basicInfo.phone)) {
        return NextResponse.json({ error: 'Please enter a valid Saudi phone number' }, { status: 400 });
      }
      normalizedPhone = normalizeSaudiPhone(basicInfo.phone);
    }

    const cvData = {
      generatedContent: {
        personalInfo: {
          fullName: basicInfo?.fullName || '',
          name: basicInfo?.fullName || '',
          email: basicInfo?.email || email,
          phone: normalizedPhone,
          phoneNumber: normalizedPhone,
          location: basicInfo?.location || '',
          targetJobDomain: basicInfo?.jobDomain || '',
        },
        professionalSummary: '',
        summary: '',
        experience: [],
        education: [],
        skills: {},
        certifications: [],
        languages: [],
      },
      templateId: templateId || null,
      language: basicInfo?.language || 'en',
      jobDomain: basicInfo?.jobDomain || '',
      careerLevel: basicInfo?.careerLevel || '',
      latestJob: basicInfo?.latestJob || '',
      manualMode: true,
    };

    const existing = await pool.query(
      'SELECT id FROM guest_cvs WHERE email = $1 ORDER BY updated_at DESC LIMIT 1',
      [email]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        'UPDATE guest_cvs SET template_id = $1, cv_data = $2, updated_at = NOW() WHERE id = $3',
        [templateId, JSON.stringify(cvData), existing.rows[0].id]
      );
    } else {
      await pool.query(
        'INSERT INTO guest_cvs (email, template_id, cv_data, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW())',
        [email, templateId, JSON.stringify(cvData)]
      );
    }

    return NextResponse.json({
      success: true,
      cvData,
    });
  } catch (error) {
    console.error('Error saving guest CV:', error);
    return NextResponse.json(
      { error: 'Failed to save data' },
      { status: 500 }
    );
  }
}
