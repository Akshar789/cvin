import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { pool } from '@/server/db';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    const userId = decoded.userId;

    const result = await pool.query(
      'SELECT * FROM user_consent WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ 
        consent: {
          dataProcessingConsent: false,
          aiGenerationConsent: false,
          documentStorageConsent: false,
          profileGenerationConsent: false,
          featureUpdatesConsent: false,
          analyticsConsent: false,
          surveyConsent: false,
          profileVisibility: 'private',
          allowAnonDataSharing: false,
          allowAnonStatsSharing: false,
        }
      });
    }

    return NextResponse.json({ consent: result.rows[0] });
  } catch (error) {
    console.error('Consent fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch consent' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    const userId = decoded.userId;

    const body = await request.json();

    const existingResult = await pool.query(
      'SELECT * FROM user_consent WHERE user_id = $1',
      [userId]
    );

    let result;

    if (existingResult.rows.length === 0) {
      result = await pool.query(
        `INSERT INTO user_consent (
          user_id,
          data_processing_consent,
          ai_generation_consent,
          document_storage_consent,
          profile_generation_consent,
          feature_updates_consent,
          analytics_consent,
          survey_consent,
          profile_visibility,
          allow_anon_data_sharing,
          allow_anon_stats_sharing,
          terms_accepted_at,
          privacy_accepted_at,
          last_consent_update_at,
          created_at,
          updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW(), NOW()
        )
        RETURNING *`,
        [
          userId,
          body.dataProcessingConsent || false,
          body.aiGenerationConsent || false,
          body.documentStorageConsent || false,
          body.profileGenerationConsent || false,
          body.featureUpdatesConsent || false,
          body.analyticsConsent || false,
          body.surveyConsent || false,
          body.profileVisibility || 'private',
          body.allowAnonDataSharing || false,
          body.allowAnonStatsSharing || false,
          body.termsAcceptedAt || null,
          body.privacyAcceptedAt || null,
        ]
      );
    } else {
      result = await pool.query(
        `UPDATE user_consent
        SET
          data_processing_consent = $1,
          ai_generation_consent = $2,
          document_storage_consent = $3,
          profile_generation_consent = $4,
          feature_updates_consent = $5,
          analytics_consent = $6,
          survey_consent = $7,
          profile_visibility = $8,
          allow_anon_data_sharing = $9,
          allow_anon_stats_sharing = $10,
          terms_accepted_at = $11,
          privacy_accepted_at = $12,
          last_consent_update_at = NOW(),
          updated_at = NOW()
        WHERE user_id = $13
        RETURNING *`,
        [
          body.dataProcessingConsent !== undefined ? body.dataProcessingConsent : existingResult.rows[0].data_processing_consent,
          body.aiGenerationConsent !== undefined ? body.aiGenerationConsent : existingResult.rows[0].ai_generation_consent,
          body.documentStorageConsent !== undefined ? body.documentStorageConsent : existingResult.rows[0].document_storage_consent,
          body.profileGenerationConsent !== undefined ? body.profileGenerationConsent : existingResult.rows[0].profile_generation_consent,
          body.featureUpdatesConsent !== undefined ? body.featureUpdatesConsent : existingResult.rows[0].feature_updates_consent,
          body.analyticsConsent !== undefined ? body.analyticsConsent : existingResult.rows[0].analytics_consent,
          body.surveyConsent !== undefined ? body.surveyConsent : existingResult.rows[0].survey_consent,
          body.profileVisibility || existingResult.rows[0].profile_visibility,
          body.allowAnonDataSharing !== undefined ? body.allowAnonDataSharing : existingResult.rows[0].allow_anon_data_sharing,
          body.allowAnonStatsSharing !== undefined ? body.allowAnonStatsSharing : existingResult.rows[0].allow_anon_stats_sharing,
          body.termsAcceptedAt || existingResult.rows[0].terms_accepted_at,
          body.privacyAcceptedAt || existingResult.rows[0].privacy_accepted_at,
          userId,
        ]
      );
    }

    return NextResponse.json({ consent: result.rows[0] });
  } catch (error) {
    console.error('Consent update error:', error);
    return NextResponse.json({ error: 'Failed to update consent' }, { status: 500 });
  }
}
