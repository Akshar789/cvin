import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { pool } from '@/server/db';
import openai from '@/lib/ai/openaiClient';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
    const userId = decoded.userId;

    const { targetLanguage } = await request.json();
    if (targetLanguage !== 'ar') {
      return NextResponse.json({ error: 'Only Arabic (ar) translation is currently supported' }, { status: 400 });
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

    const [educationResult, experienceResult, skillsResult] = await Promise.all([
      pool.query('SELECT * FROM education WHERE cv_id = $1 ORDER BY "order" ASC', [cvId]),
      pool.query('SELECT * FROM experience WHERE cv_id = $1 ORDER BY "order" ASC', [cvId]),
      pool.query('SELECT * FROM skills WHERE cv_id = $1 ORDER BY "order" ASC', [cvId]),
    ]);

    const personalInfo = typeof cvRecord.personal_info === 'string'
      ? JSON.parse(cvRecord.personal_info)
      : cvRecord.personal_info || {};

    const contentToTranslate = {
      professionalTitle: personalInfo.professionalTitle || personalInfo.targetJobTitle || '',
      targetJobTitle: personalInfo.targetJobTitle || '',
      targetJobDomain: personalInfo.targetJobDomain || '',
      nationality: personalInfo.nationality || '',
      location: personalInfo.location || '',
      summary: cvRecord.summary || personalInfo.professionalSummary || '',
      experience: experienceResult.rows.map((exp: any) => ({
        id: exp.id,
        position: exp.position || '',
        description: exp.description || '',
        location: exp.location || '',
        achievements: exp.achievements ? (typeof exp.achievements === 'string' ? JSON.parse(exp.achievements) : exp.achievements) : [],
      })),
      education: educationResult.rows.map((edu: any) => ({
        id: edu.id,
        degree: edu.degree || '',
        field: edu.field || '',
        description: edu.description || '',
      })),
      skills: skillsResult.rows.map((skill: any) => ({
        id: skill.id,
        category: skill.category || '',
        skillsList: skill.skills_list ? (typeof skill.skills_list === 'string' ? JSON.parse(skill.skills_list) : skill.skills_list) : [],
      })),
      certifications: personalInfo.certifications || [],
      languages: personalInfo.languages || [],
      courses: personalInfo.courses || [],
    };

    const translationPrompt = `You are a professional translator. Translate the following CV content from English to Arabic.

CRITICAL RULES:
1. DO NOT translate: person names, email addresses, phone numbers, dates, company names, institution names, URLs, LinkedIn URLs
2. DO translate: job titles, professional summaries, descriptions, skill names, skill categories, degree names, field of study, certifications, course names, locations (use Arabic names for cities/countries), nationality
3. Keep the EXACT same JSON structure
4. Return ONLY valid JSON, no markdown formatting
5. For skill lists (arrays of strings), translate each skill name to Arabic
6. Maintain professional tone appropriate for a CV/resume

Content to translate:
${JSON.stringify(contentToTranslate, null, 2)}

Return the translated content in the EXACT same JSON structure.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert English-to-Arabic translator specializing in professional CV/resume content. Always return valid JSON only.'
        },
        {
          role: 'user',
          content: translationPrompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    let translatedContent = completion.choices[0].message.content || '{}';
    translatedContent = translatedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const translated = JSON.parse(translatedContent);

    const updatedPersonalInfo = {
      ...personalInfo,
      professionalTitle: translated.professionalTitle || personalInfo.professionalTitle || '',
      targetJobTitle: translated.targetJobTitle || personalInfo.targetJobTitle || '',
      targetJobDomain: translated.targetJobDomain || personalInfo.targetJobDomain || '',
      nationality: translated.nationality || personalInfo.nationality || '',
      location: translated.location || personalInfo.location || '',
      professionalSummary: translated.summary || cvRecord.summary || '',
      certifications: translated.certifications || personalInfo.certifications || [],
      languages: translated.languages || personalInfo.languages || [],
      courses: translated.courses || personalInfo.courses || [],
    };

    const personalInfoJson = JSON.stringify(updatedPersonalInfo);
    const translatedSummary = translated.summary || cvRecord.summary || '';

    await pool.query(
      `UPDATE cvs SET
        personal_info = $1,
        summary = $2,
        language = 'ar',
        text_direction = 'rtl',
        updated_at = NOW()
      WHERE id = $3 AND user_id = $4`,
      [personalInfoJson, translatedSummary, cvId, userId]
    );

    if (translated.experience && Array.isArray(translated.experience)) {
      for (const exp of translated.experience) {
        if (!exp.id) continue;
        const achievements = Array.isArray(exp.achievements) ? JSON.stringify(exp.achievements) : '[]';
        await pool.query(
          `UPDATE experience SET
            position = $1,
            description = $2,
            location = $3,
            achievements = $4
          WHERE id = $5 AND cv_id = $6`,
          [exp.position || '', exp.description || '', exp.location || '', achievements, exp.id, cvId]
        );
      }
    }

    if (translated.education && Array.isArray(translated.education)) {
      for (const edu of translated.education) {
        if (!edu.id) continue;
        await pool.query(
          `UPDATE education SET
            degree = $1,
            field = $2,
            description = $3
          WHERE id = $4 AND cv_id = $5`,
          [edu.degree || '', edu.field || '', edu.description || '', edu.id, cvId]
        );
      }
    }

    if (translated.skills && Array.isArray(translated.skills)) {
      for (const skill of translated.skills) {
        if (!skill.id) continue;
        const skillsList = Array.isArray(skill.skillsList) ? JSON.stringify(skill.skillsList) : '[]';
        await pool.query(
          `UPDATE skills SET
            category = $1,
            skills_list = $2
          WHERE id = $3 AND cv_id = $4`,
          [skill.category || '', skillsList, skill.id, cvId]
        );
      }
    }

    const [updatedCv, updatedEducation, updatedExperience, updatedSkills] = await Promise.all([
      pool.query(
        `SELECT c.*, t.name as template_name
        FROM cvs c
        LEFT JOIN templates t ON c.template_id = t.id
        WHERE c.id = $1 AND c.user_id = $2`,
        [cvId, userId]
      ),
      pool.query('SELECT * FROM education WHERE cv_id = $1 ORDER BY "order" ASC', [cvId]),
      pool.query('SELECT * FROM experience WHERE cv_id = $1 ORDER BY "order" ASC', [cvId]),
      pool.query('SELECT * FROM skills WHERE cv_id = $1 ORDER BY "order" ASC', [cvId]),
    ]);

    const finalCv = updatedCv.rows[0];
    const finalPersonalInfo = typeof finalCv.personal_info === 'string'
      ? JSON.parse(finalCv.personal_info)
      : finalCv.personal_info || {};

    return NextResponse.json({
      success: true,
      cv: {
        id: finalCv.id,
        userId: finalCv.user_id,
        title: finalCv.title,
        templateId: finalCv.template_id,
        templateName: finalCv.template_name,
        language: finalCv.language,
        textDirection: finalCv.text_direction,
        personalInfo: finalPersonalInfo,
        summary: finalCv.summary,
        experience: updatedExperience.rows,
        education: updatedEducation.rows,
        skills: updatedSkills.rows,
        createdAt: finalCv.created_at,
        updatedAt: finalCv.updated_at,
      }
    });
  } catch (error: any) {
    console.error('CV translation error:', error);

    if (error?.name === 'JsonWebTokenError' || error?.message?.includes('jwt')) {
      return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
    }

    return NextResponse.json(
      { error: error?.message || 'Failed to translate CV' },
      { status: 500 }
    );
  }
}
