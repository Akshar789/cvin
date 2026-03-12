import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { pool } from '@/server/db';
import { isValidSaudiPhone, normalizeSaudiPhone } from '@/lib/utils/phoneValidation';

const normalizeLinkedInUrl = (url: string): { normalized: string; isValid: boolean } => {
  const trimmed = url.trim();
  
  if (!trimmed) {
    return { normalized: '', isValid: true };
  }
  
  let fullUrl = trimmed;
  if (!trimmed.match(/^https?:\/\//i)) {
    fullUrl = 'https://' + trimmed;
  }
  
  try {
    const urlObj = new URL(fullUrl);
    
    const host = urlObj.host.toLowerCase();
    const isLinkedIn = host === 'linkedin.com' || host === 'www.linkedin.com';
    if (!isLinkedIn) {
      return { normalized: trimmed, isValid: false };
    }
    
    if (!urlObj.pathname || urlObj.pathname === '/') {
      return { normalized: trimmed, isValid: false };
    }
    
    const canonical = `https://www.linkedin.com${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
    return { normalized: canonical, isValid: true };
  } catch (e) {
    return { normalized: trimmed, isValid: false };
  }
};

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    const userId = decoded.userId;

    const data = await request.json();

    console.log('[/api/profile/update] Updating userId:', userId);
    console.log('[/api/profile/update] professionalSummary to save:', data.professionalSummary);

    let normalizedLinkedIn = data.linkedin || null;
    if (data.linkedin) {
      const result = normalizeLinkedInUrl(data.linkedin);
      if (!result.isValid) {
        return NextResponse.json(
          { error: 'Invalid LinkedIn URL. Must be in format: https://www.linkedin.com/in/your-profile' },
          { status: 400 }
        );
      }
      normalizedLinkedIn = result.normalized;
    }

    const rawPhone = data.phone || data.phoneNumber || null;
    let normalizedPhone: string | null = null;
    if (rawPhone) {
      if (!isValidSaudiPhone(rawPhone)) {
        return NextResponse.json({ error: 'Please enter a valid Saudi phone number' }, { status: 400 });
      }
      normalizedPhone = normalizeSaudiPhone(rawPhone);
    }

    if (data.onboardingCompleted === true) {
      await pool.query(
        `UPDATE users SET
          phone_number = $1,
          location = $2,
          nationality = $3,
          linkedin = $4,
          target_job_domain = $5,
          career_level = $6,
          industry = $7,
          years_of_experience = $8,
          preferred_language = $9,
          education_level = $10,
          most_recent_job_title = $11,
          most_recent_company = $12,
          employment_status = $13,
          strengths = $14,
          career_interests = $15,
          professional_summary = $16,
          onboarding_completed = true,
          updated_at = NOW()
        WHERE id = $17`,
        [
          normalizedPhone,
          data.location || null,
          data.nationality || null,
          normalizedLinkedIn,
          data.targetJobDomain || null,
          data.careerLevel || null,
          data.industry || null,
          data.yearsOfExperience || null,
          data.preferredLanguage || 'Both',
          data.educationLevel || null,
          data.mostRecentJobTitle || null,
          data.mostRecentCompany || null,
          data.employmentStatus || null,
          data.strengths ? JSON.stringify(data.strengths) : null,
          data.careerInterests ? JSON.stringify(data.careerInterests) : null,
          data.professionalSummary || null,
          userId,
        ]
      );
    } else {
      await pool.query(
        `UPDATE users SET
          phone_number = $1,
          location = $2,
          nationality = $3,
          linkedin = $4,
          target_job_domain = $5,
          career_level = $6,
          industry = $7,
          years_of_experience = $8,
          preferred_language = $9,
          education_level = $10,
          most_recent_job_title = $11,
          most_recent_company = $12,
          employment_status = $13,
          strengths = $14,
          career_interests = $15,
          professional_summary = $16,
          updated_at = NOW()
        WHERE id = $17`,
        [
          normalizedPhone,
          data.location || null,
          data.nationality || null,
          normalizedLinkedIn,
          data.targetJobDomain || null,
          data.careerLevel || null,
          data.industry || null,
          data.yearsOfExperience || null,
          data.preferredLanguage || 'Both',
          data.educationLevel || null,
          data.mostRecentJobTitle || null,
          data.mostRecentCompany || null,
          data.employmentStatus || null,
          data.strengths ? JSON.stringify(data.strengths) : null,
          data.careerInterests ? JSON.stringify(data.careerInterests) : null,
          data.professionalSummary || null,
          userId,
        ]
      );
    }

    console.log('[/api/profile/update] Update complete');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  return PUT(request);
}
