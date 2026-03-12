import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/server/db';
import openai from '@/lib/ai/openaiClient';

export async function POST(request: NextRequest) {
  try {
    const { email, targetLanguage } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (targetLanguage !== 'ar') {
      return NextResponse.json({ error: 'Only Arabic (ar) translation is currently supported' }, { status: 400 });
    }

    const guestResult = await pool.query(
      'SELECT id, cv_data FROM guest_cvs WHERE email = $1 LIMIT 1',
      [email]
    );

    if (!guestResult.rows || guestResult.rows.length === 0) {
      return NextResponse.json({ error: 'Guest CV not found' }, { status: 404 });
    }

    const guestCv = guestResult.rows[0];
    const cvDataRaw = typeof guestCv.cv_data === 'string'
      ? JSON.parse(guestCv.cv_data)
      : guestCv.cv_data || {};

    const generatedContent = cvDataRaw.generatedContent || {};
    const personalInfo = generatedContent.personalInfo || {};

    const experience = Array.isArray(generatedContent.experience)
      ? generatedContent.experience.map((exp: any, idx: number) => ({
          id: idx,
          position: exp.position || exp.title || '',
          description: exp.description || '',
          location: exp.location || '',
          achievements: Array.isArray(exp.achievements) ? exp.achievements : [],
        }))
      : [];

    const education = Array.isArray(generatedContent.education)
      ? generatedContent.education.map((edu: any, idx: number) => ({
          id: idx,
          degree: edu.degree || '',
          field: edu.field || edu.fieldOfStudy || '',
          description: edu.description || '',
        }))
      : [];

    let skills: any[] = [];
    if (Array.isArray(generatedContent.skills)) {
      skills = generatedContent.skills.map((s: any, idx: number) => ({
        id: idx,
        category: s.category || 'General',
        skillsList: Array.isArray(s.skillsList) ? s.skillsList : (typeof s === 'string' ? [s] : []),
      }));
    } else if (generatedContent.skills && typeof generatedContent.skills === 'object') {
      let idx = 0;
      for (const [category, items] of Object.entries(generatedContent.skills)) {
        if (Array.isArray(items) && items.length > 0) {
          skills.push({ id: idx, category, skillsList: items });
          idx++;
        }
      }
    }

    const contentToTranslate = {
      professionalTitle: personalInfo.professionalTitle || personalInfo.targetJobTitle || '',
      targetJobTitle: personalInfo.targetJobTitle || '',
      targetJobDomain: personalInfo.targetJobDomain || '',
      nationality: personalInfo.nationality || '',
      location: personalInfo.location || '',
      summary: generatedContent.professionalSummary || '',
      experience,
      education,
      skills,
      certifications: Array.isArray(generatedContent.certifications) ? generatedContent.certifications : [],
      languages: Array.isArray(generatedContent.languages) ? generatedContent.languages : [],
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

    const translatedPersonalInfo = {
      ...personalInfo,
      professionalTitle: translated.professionalTitle || personalInfo.professionalTitle || '',
      targetJobTitle: translated.targetJobTitle || personalInfo.targetJobTitle || '',
      targetJobDomain: translated.targetJobDomain || personalInfo.targetJobDomain || '',
      nationality: translated.nationality || personalInfo.nationality || '',
      location: translated.location || personalInfo.location || '',
    };

    const translatedExperience = Array.isArray(translated.experience)
      ? translated.experience.map((exp: any, idx: number) => {
          const original = (generatedContent.experience || [])[idx] || {};
          return {
            ...original,
            position: exp.position || original.position || '',
            title: exp.position || original.title || '',
            description: exp.description || original.description || '',
            location: exp.location || original.location || '',
            achievements: Array.isArray(exp.achievements) ? exp.achievements : (original.achievements || []),
          };
        })
      : generatedContent.experience || [];

    const translatedEducation = Array.isArray(translated.education)
      ? translated.education.map((edu: any, idx: number) => {
          const original = (generatedContent.education || [])[idx] || {};
          return {
            ...original,
            degree: edu.degree || original.degree || '',
            field: edu.field || original.field || '',
            fieldOfStudy: edu.field || original.fieldOfStudy || '',
            description: edu.description || original.description || '',
          };
        })
      : generatedContent.education || [];

    let translatedSkills: any = generatedContent.skills;
    if (translated.skills && Array.isArray(translated.skills)) {
      if (Array.isArray(generatedContent.skills)) {
        translatedSkills = translated.skills.map((s: any) => ({
          category: s.category || 'General',
          skillsList: Array.isArray(s.skillsList) ? s.skillsList : [],
        }));
      } else {
        const result: Record<string, string[]> = {};
        translated.skills.forEach((s: any) => {
          const cat = s.category || 'General';
          result[cat] = Array.isArray(s.skillsList) ? s.skillsList : [];
        });
        translatedSkills = result;
      }
    }

    return NextResponse.json({
      success: true,
      cv: {
        personalInfo: translatedPersonalInfo,
        summary: translated.summary || generatedContent.professionalSummary || '',
        experience: translatedExperience,
        education: translatedEducation,
        skills: translatedSkills,
        certifications: translated.certifications || generatedContent.certifications || [],
        languages: translated.languages || generatedContent.languages || [],
      }
    });
  } catch (error: any) {
    console.error('Guest CV translation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to translate CV' },
      { status: 500 }
    );
  }
}
