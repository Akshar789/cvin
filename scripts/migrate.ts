import { db } from '../server/db';
import { templates, careerTips } from '../shared/schema';
import { defaultTemplates } from '../lib/db/templates';

async function migrate() {
  console.log('Starting database migration...');

  try {
    console.log('Seeding templates...');
    for (const template of defaultTemplates) {
      await db.insert(templates).values(template).onConflictDoNothing();
    }
    console.log(`✓ Seeded ${defaultTemplates.length} templates`);

    console.log('Seeding career tips...');
    const careerTipsData = [
      {
        title: 'How to Write a Strong CV Summary',
        content: 'Your CV summary should be concise (3-4 sentences) and highlight your key strengths, experience, and what you bring to the role. Use action words and quantify achievements when possible.',
        category: 'CV Writing',
        language: 'en',
        isPremium: false,
      },
      {
        title: 'ATS Optimization Tips',
        content: 'Use standard section headings, avoid tables and graphics in critical sections, include relevant keywords from the job description, and use a simple, clean format that ATS systems can parse easily.',
        category: 'ATS Tips',
        language: 'en',
        isPremium: false,
      },
      {
        title: 'Interview Preparation Checklist',
        content: 'Research the company thoroughly, prepare answers to common questions, practice your responses, prepare questions to ask, plan your outfit, and arrive 10-15 minutes early.',
        category: 'Interview',
        language: 'en',
        isPremium: true,
      },
      {
        title: 'كيفية كتابة ملخص السيرة الذاتية',
        content: 'يجب أن يكون ملخص سيرتك الذاتية موجزًا (3-4 جمل) ويسلط الضوء على نقاط قوتك الرئيسية وخبرتك وما تقدمه للوظيفة. استخدم كلمات الفعل وحدد الإنجازات عندما يكون ذلك ممكنًا.',
        category: 'كتابة السيرة الذاتية',
        language: 'ar',
        isPremium: false,
      },
      {
        title: 'LinkedIn Profile Optimization',
        content: 'Use a professional photo, write a compelling headline, create a detailed About section with keywords, showcase your accomplishments, get recommendations, and engage with content regularly.',
        category: 'Career Development',
        language: 'en',
        isPremium: true,
      },
    ];

    for (const tip of careerTipsData) {
      await db.insert(careerTips).values(tip).onConflictDoNothing();
    }
    console.log(`✓ Seeded ${careerTipsData.length} career tips`);

    console.log('✓ Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

migrate();
