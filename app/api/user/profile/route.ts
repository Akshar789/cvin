import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { users } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/lib/auth/jwt';

export async function PUT(request: NextRequest) {
  try {
    console.log('[Profile Update] Request received');
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('[Profile Update] No auth header');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7);
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      console.log('[Profile Update] Invalid token');
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    console.log('[Profile Update] User ID:', decoded.userId);
    const body = await request.json();
    console.log('[Profile Update] Body:', JSON.stringify(body));

    // Build update object with all fields - only include non-undefined values
    const updateData: any = {
      updatedAt: new Date(),
    };
    
    // Add fields only if they're provided (prevents overwriting with undefined)
    if (body.fullName !== undefined) updateData.fullName = body.fullName;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.targetJobTitle !== undefined) updateData.targetJobTitle = body.targetJobTitle;
    if (body.targetJobDomain !== undefined) updateData.targetJobDomain = body.targetJobDomain;
    if (body.careerLevel !== undefined) updateData.careerLevel = body.careerLevel;
    if (body.industry !== undefined) updateData.industry = body.industry;
    if (body.yearsOfExperience !== undefined) updateData.yearsOfExperience = body.yearsOfExperience;
    if (body.preferredLanguage !== undefined) updateData.preferredLanguage = body.preferredLanguage;
    if (body.educationLevel !== undefined) updateData.educationLevel = body.educationLevel;
    if (body.degreeLevel !== undefined) updateData.degreeLevel = body.degreeLevel;
    if (body.educationSpecialization !== undefined) updateData.educationSpecialization = body.educationSpecialization;
    if (body.mostRecentJobTitle !== undefined) updateData.mostRecentJobTitle = body.mostRecentJobTitle;
    if (body.mostRecentCompany !== undefined) updateData.mostRecentCompany = body.mostRecentCompany;
    if (body.employmentStatus !== undefined) updateData.employmentStatus = body.employmentStatus;
    
    // Add missing critical fields
    if (body.phoneNumber !== undefined || body.phone !== undefined) {
      updateData.phoneNumber = body.phoneNumber || body.phone;
    }
    if (body.nationality !== undefined) updateData.nationality = body.nationality;
    if (body.linkedin !== undefined) updateData.linkedin = body.linkedin;
    if (body.professionalSummary !== undefined) updateData.professionalSummary = body.professionalSummary;
    if (body.strengths !== undefined) updateData.strengths = body.strengths;
    if (body.careerInterests !== undefined) updateData.careerInterests = body.careerInterests;

    const updatedUser = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, decoded.userId))
      .returning({
        id: users.id,
        email: users.email,
        username: users.username,
        fullName: users.fullName,
        phoneNumber: users.phoneNumber,
        oauthProvider: users.oauthProvider,
        oauthProviderId: users.oauthProviderId,
        profilePicture: users.profilePicture,
        subscriptionTier: users.subscriptionTier,
        subscriptionEndDate: users.subscriptionEndDate,
        language: users.language,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        onboardingCompleted: users.onboardingCompleted,
        freeCredits: users.freeCredits,
        cvGenerations: users.cvGenerations,
        textImprovements: users.textImprovements,
        interviewSets: users.interviewSets,
        location: users.location,
        nationality: users.nationality,
        linkedin: users.linkedin,
        professionalSummary: users.professionalSummary,
        targetJobTitle: users.targetJobTitle,
        targetJobDomain: users.targetJobDomain,
        careerLevel: users.careerLevel,
        industry: users.industry,
        yearsOfExperience: users.yearsOfExperience,
        preferredLanguage: users.preferredLanguage,
        educationLevel: users.educationLevel,
        degreeLevel: users.degreeLevel,
        educationSpecialization: users.educationSpecialization,
        mostRecentJobTitle: users.mostRecentJobTitle,
        mostRecentCompany: users.mostRecentCompany,
        employmentStatus: users.employmentStatus,
        strengths: users.strengths,
        careerInterests: users.careerInterests,
      });

    if (!updatedUser.length) {
      console.log('[Profile Update] User not found');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('[Profile Update] Success, updated user:', updatedUser[0]?.id);
    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser[0],
    });
  } catch (error: any) {
    console.error('[Profile Update] Error:', error?.message || error);
    return NextResponse.json(
      { error: 'Failed to update profile: ' + (error?.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
