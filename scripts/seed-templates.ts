import { db } from '../server/db';
import { templates } from '../shared/schema';
import { TEMPLATE_FAMILIES } from '../config/templates';

async function seedTemplates() {
  console.log('✅ Seeding templates to database...');

  try {
    await db.delete(templates);
    console.log('Cleared existing templates.');

    for (let i = 0; i < TEMPLATE_FAMILIES.length; i++) {
      const family = TEMPLATE_FAMILIES[i];
      await db.insert(templates).values({
        name: family.name,
        description: family.description,
        isPremium: family.isPremium,
        language: 'en',
        previewImage: `/templates/${family.id}-preview.png`,
        cssStyles: {
          ...family.cssStyles,
          templateId: family.id,
          nameAr: family.nameAr,
          descriptionAr: family.descriptionAr,
          features: family.features,
          featuresAr: family.featuresAr,
          previewType: family.previewType,
          supportedColorThemes: family.supportedColorThemes,
        },
        layout: family.layout,
      });
      console.log(`✅ Template ${i + 1}: ${family.name} - seeded`);
    }

    console.log(`\n✅ All ${TEMPLATE_FAMILIES.length} templates seeded successfully!`);
  } catch (error) {
    console.error('❌ Error seeding templates:', error);
    process.exit(1);
  }

  process.exit(0);
}

seedTemplates();
