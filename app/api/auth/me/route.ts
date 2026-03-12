import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { users } from '@/shared/schema';
import { requireAuth } from '@/lib/auth/middleware';
import { eq } from 'drizzle-orm';

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    console.log('[Auth/Me] Fetching user:', { userId: user.userId });
    
    // First, try a simple query to check if user exists
    try {
      const [userExists] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, user.userId))
        .limit(1);
      
      if (!userExists) {
        console.error('[Auth/Me] User not found:', { userId: user.userId });
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
    } catch (simpleQueryError: any) {
      console.error('[Auth/Me] Simple query error:', {
        message: simpleQueryError?.message,
        code: simpleQueryError?.code,
        name: simpleQueryError?.name,
      });
      throw simpleQueryError;
    }
    
    // Now try the full query with all fields
    const [currentUser] = await db
      .select({
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
      })
      .from(users)
      .where(eq(users.id, user.userId))
      .limit(1);

    if (!currentUser) {
      console.error('[Auth/Me] User not found after full query:', { userId: user.userId });
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log('[Auth/Me] User found successfully');
    
    // Serialize the response data, handling potential JSON issues
    const responseData = {
      user: {
        ...currentUser,
        // Ensure dates are serializable
        createdAt: currentUser.createdAt ? new Date(currentUser.createdAt).toISOString() : null,
        updatedAt: currentUser.updatedAt ? new Date(currentUser.updatedAt).toISOString() : null,
        subscriptionEndDate: currentUser.subscriptionEndDate ? new Date(currentUser.subscriptionEndDate).toISOString() : null,
      },
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('[Auth/Me] Get user error:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      code: error?.code,
      detail: error?.detail,
      hint: error?.hint,
      cause: error?.cause,
      sql: error?.sql,
      position: error?.position,
    });
    
    // Provide more specific error messages
    let errorMessage = 'Failed to get user';
    let statusCode = 500;
    
    if (error?.message?.includes('DATABASE_URL') || error?.message?.includes('connection')) {
      errorMessage = 'Database connection error. Please check server configuration.';
      statusCode = 500;
    } else if (error?.code === '42P01') { // PostgreSQL table does not exist
      errorMessage = `Database schema error: Table does not exist. ${error?.message || ''}`;
      statusCode = 500;
    } else if (error?.code === '42703') { // PostgreSQL column does not exist
      errorMessage = `Database schema mismatch: Column does not exist. ${error?.message || ''}. Hint: ${error?.hint || 'Check database migration'}`;
      statusCode = 500;
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
          hint: error?.hint,
          position: error?.position,
        } : undefined
      },
      { status: statusCode }
    );
  }
});
