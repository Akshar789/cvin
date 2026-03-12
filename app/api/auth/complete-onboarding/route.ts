import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { pool } from '@/server/db';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    const userId = decoded.userId;

    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();

      const phone = (formData.get('phone') as string) || null;
      const location = (formData.get('location') as string) || null;
      const targetJobTitle = (formData.get('targetJobTitle') as string) || null;
      const careerLevel = (formData.get('careerLevel') as string) || null;
      const industry = (formData.get('industry') as string) || null;
      const yearsOfExperience = (formData.get('yearsOfExperience') as string) || null;
      const preferredLanguage = ((formData.get('preferredLanguage') as string) || 'Both');
      const educationLevel = (formData.get('educationLevel') as string) || null;
      const mostRecentJobTitle = (formData.get('mostRecentJobTitle') as string) || null;
      const mostRecentCompany = (formData.get('mostRecentCompany') as string) || null;
      const employmentStatus = (formData.get('employmentStatus') as string) || null;

      await pool.query(
        `UPDATE users SET 
          phone_number = $1,
          location = $2,
          target_job_title = $3,
          career_level = $4,
          industry = $5,
          years_of_experience = $6,
          preferred_language = $7,
          education_level = $8,
          most_recent_job_title = $9,
          most_recent_company = $10,
          employment_status = $11,
          onboarding_completed = true,
          updated_at = NOW()
        WHERE id = $12`,
        [phone, location, targetJobTitle, careerLevel, industry, yearsOfExperience, preferredLanguage, educationLevel, mostRecentJobTitle, mostRecentCompany, employmentStatus, userId]
      );
    } else {
      await pool.query(
        'UPDATE users SET onboarding_completed = true, updated_at = NOW() WHERE id = $1',
        [userId]
      );
    }

    return NextResponse.json({ success: true, message: 'Profile completed successfully' });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}
