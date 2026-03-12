import { db } from '../server/db';
import { saudiCities } from '../shared/schema';

async function seed() {
  console.log('Seeding Saudi Arabia cities...');

  const saudiCityData = [
    { nameEn: 'Riyadh', nameAr: 'الرياض', region: 'Riyadh', sortOrder: 1 },
    { nameEn: 'Jeddah', nameAr: 'جدة', region: 'Makkah', sortOrder: 2 },
    { nameEn: 'Makkah', nameAr: 'مكة المكرمة', region: 'Makkah', sortOrder: 3 },
    { nameEn: 'Madinah', nameAr: 'المدينة المنورة', region: 'Madinah', sortOrder: 4 },
    { nameEn: 'Dammam', nameAr: 'الدمام', region: 'Eastern', sortOrder: 5 },
    { nameEn: 'Khobar', nameAr: 'الخبر', region: 'Eastern', sortOrder: 6 },
    { nameEn: 'Dhahran', nameAr: 'الظهران', region: 'Eastern', sortOrder: 7 },
    { nameEn: 'Tabuk', nameAr: 'تبوك', region: 'Tabuk', sortOrder: 8 },
    { nameEn: 'Taif', nameAr: 'الطائف', region: 'Makkah', sortOrder: 9 },
    { nameEn: 'Buraidah', nameAr: 'بريدة', region: 'Qassim', sortOrder: 10 },
    { nameEn: 'Khamis Mushait', nameAr: 'خميس مشيط', region: 'Asir', sortOrder: 11 },
    { nameEn: 'Abha', nameAr: 'أبها', region: 'Asir', sortOrder: 12 },
    { nameEn: 'Hail', nameAr: 'حائل', region: 'Hail', sortOrder: 13 },
    { nameEn: 'Jubail', nameAr: 'الجبيل', region: 'Eastern', sortOrder: 14 },
    { nameEn: 'Yanbu', nameAr: 'ينبع', region: 'Madinah', sortOrder: 15 },
    { nameEn: 'Najran', nameAr: 'نجران', region: 'Najran', sortOrder: 16 },
    { nameEn: 'Jizan', nameAr: 'جازان', region: 'Jizan', sortOrder: 17 },
    { nameEn: 'Al Baha', nameAr: 'الباحة', region: 'Al Baha', sortOrder: 18 },
    { nameEn: 'Arar', nameAr: 'عرعر', region: 'Northern Borders', sortOrder: 19 },
    { nameEn: 'Sakakah', nameAr: 'سكاكا', region: 'Al Jouf', sortOrder: 20 },
    { nameEn: 'Al Ahsa', nameAr: 'الأحساء', region: 'Eastern', sortOrder: 21 },
    { nameEn: 'Al Qatif', nameAr: 'القطيف', region: 'Eastern', sortOrder: 22 },
    { nameEn: 'Unaizah', nameAr: 'عنيزة', region: 'Qassim', sortOrder: 23 },
    { nameEn: 'Al Kharj', nameAr: 'الخرج', region: 'Riyadh', sortOrder: 24 },
    { nameEn: 'NEOM', nameAr: 'نيوم', region: 'Tabuk', sortOrder: 25 },
  ];

  for (const city of saudiCityData) {
    await db.insert(saudiCities).values(city).onConflictDoNothing();
  }
  console.log(`Seeded ${saudiCityData.length} Saudi Arabia cities`);

  console.log('Done!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
