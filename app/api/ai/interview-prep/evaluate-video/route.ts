import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { transcribeAudio, evaluateVideoAnswer, getFixedVideoQuestions } from '@/lib/ai/interviewEvaluation';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    const questionId = parseInt(formData.get('questionId') as string);
    const cvDataStr = formData.get('cvData') as string;
    const targetRole = formData.get('targetRole') as string;
    const industry = formData.get('industry') as string;
    const language = (formData.get('language') as string) || 'en';

    if (!videoFile) {
      return NextResponse.json({ error: 'Video file is required' }, { status: 400 });
    }

    if (isNaN(questionId) || questionId < 1 || questionId > 5) {
      return NextResponse.json({ error: 'Invalid question ID' }, { status: 400 });
    }

    const cvData = cvDataStr ? JSON.parse(cvDataStr) : null;
    const isPremium = !!(payload.subscriptionTier && payload.subscriptionTier !== 'free');

    const questions = getFixedVideoQuestions(language as 'en' | 'ar');
    const question = questions[questionId - 1];

    const videoBuffer = Buffer.from(await videoFile.arrayBuffer());

    let transcript: string;
    try {
      transcript = await transcribeAudio(videoBuffer);
    } catch (transcriptionError: any) {
      console.error('Transcription error:', transcriptionError);
      return NextResponse.json(
        { error: 'Failed to transcribe video. Please ensure the video has audio.' },
        { status: 400 }
      );
    }

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: 'No speech detected in the video. Please record again with clear audio.' },
        { status: 400 }
      );
    }

    const evaluation = await evaluateVideoAnswer({
      question,
      transcript,
      cvData,
      targetRole,
      industry,
      language,
      isPremium,
    });

    return NextResponse.json({
      evaluation: {
        ...evaluation,
        transcript,
      },
    });
  } catch (error: any) {
    console.error('Video evaluation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to evaluate video' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
