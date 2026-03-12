import { db } from '../server/db';
import { jobDomains, careerLevels, uaeCities } from '../shared/schema';

async function seed() {
  console.log('Seeding lookup tables...');

  const jobDomainData = [
    { slug: 'hr-people-ops', nameEn: 'Human Resources & People Operations', nameAr: 'الموارد البشرية وعمليات الأفراد', keywords: ['hr', 'موارد', 'بشرية', 'people', 'recruitment', 'talent', 'employee'], sortOrder: 1 },
    { slug: 'sales-business-dev', nameEn: 'Sales & Business Development', nameAr: 'المبيعات وتطوير الأعمال', keywords: ['sales', 'مبيعات', 'business', 'أعمال', 'revenue', 'client'], sortOrder: 2 },
    { slug: 'engineering-technical', nameEn: 'Engineering & Technical', nameAr: 'الهندسة والتقنية', keywords: ['engineering', 'هندسة', 'technical', 'تقني', 'developer', 'مطور'], sortOrder: 3 },
    { slug: 'finance-accounting', nameEn: 'Finance & Accounting', nameAr: 'المالية والمحاسبة', keywords: ['finance', 'مالية', 'accounting', 'محاسبة', 'budget', 'audit'], sortOrder: 4 },
    { slug: 'marketing-communications', nameEn: 'Marketing & Communications', nameAr: 'التسويق والاتصالات', keywords: ['marketing', 'تسويق', 'communications', 'اتصالات', 'brand', 'digital'], sortOrder: 5 },
    { slug: 'it-software-dev', nameEn: 'IT & Software Development', nameAr: 'تقنية المعلومات وتطوير البرمجيات', keywords: ['it', 'تقنية', 'software', 'برمجيات', 'development', 'تطوير', 'programming'], sortOrder: 6 },
    { slug: 'operations-supply-chain', nameEn: 'Operations & Supply Chain', nameAr: 'العمليات وسلسلة التوريد', keywords: ['operations', 'عمليات', 'supply', 'توريد', 'chain', 'logistics'], sortOrder: 7 },
    { slug: 'customer-service-support', nameEn: 'Customer Service & Support', nameAr: 'خدمة العملاء والدعم', keywords: ['customer', 'عملاء', 'service', 'خدمة', 'support', 'دعم'], sortOrder: 8 },
    { slug: 'healthcare-medical', nameEn: 'Healthcare & Medical', nameAr: 'الرعاية الصحية والطب', keywords: ['healthcare', 'صحة', 'medical', 'طب', 'health', 'رعاية'], sortOrder: 9 },
    { slug: 'education-training', nameEn: 'Education & Training', nameAr: 'التعليم والتدريب', keywords: ['education', 'تعليم', 'training', 'تدريب', 'teaching', 'تدريس'], sortOrder: 10 },
    { slug: 'project-management', nameEn: 'Project Management', nameAr: 'إدارة المشاريع', keywords: ['project', 'مشروع', 'management', 'إدارة', 'pmo', 'agile'], sortOrder: 11 },
    { slug: 'design-creative', nameEn: 'Design & Creative', nameAr: 'التصميم والإبداع', keywords: ['design', 'تصميم', 'creative', 'إبداع', 'graphic', 'ux', 'ui'], sortOrder: 12 },
    { slug: 'legal-compliance', nameEn: 'Legal & Compliance', nameAr: 'القانون والامتثال', keywords: ['legal', 'قانون', 'compliance', 'امتثال', 'regulatory', 'law'], sortOrder: 13 },
    { slug: 'quality-safety-env', nameEn: 'Quality, Safety & Environment', nameAr: 'الجودة والسلامة والبيئة', keywords: ['quality', 'جودة', 'safety', 'سلامة', 'environment', 'بيئة', 'qhse'], sortOrder: 14 },
    { slug: 'data-analytics', nameEn: 'Data & Analytics', nameAr: 'البيانات والتحليلات', keywords: ['data', 'بيانات', 'analytics', 'تحليلات', 'bi', 'insights'], sortOrder: 15 },
    { slug: 'hospitality-tourism', nameEn: 'Hospitality & Tourism', nameAr: 'الضيافة والسياحة', keywords: ['hospitality', 'ضيافة', 'tourism', 'سياحة', 'hotel', 'travel'], sortOrder: 16 },
    { slug: 'transportation-logistics', nameEn: 'Transportation & Logistics', nameAr: 'النقل واللوجستيات', keywords: ['transportation', 'نقل', 'logistics', 'لوجستيات', 'shipping', 'delivery'], sortOrder: 17 },
    { slug: 'procurement-contracts', nameEn: 'Procurement & Contracts', nameAr: 'المشتريات والعقود', keywords: ['procurement', 'مشتريات', 'contracts', 'عقود', 'purchasing', 'vendor'], sortOrder: 18 },
    { slug: 'admin-office-mgmt', nameEn: 'Administration & Office Management', nameAr: 'الإدارة وإدارة المكاتب', keywords: ['admin', 'إدارة', 'office', 'مكتب', 'administration', 'secretary'], sortOrder: 19 },
    { slug: 'research-development', nameEn: 'Research & Development', nameAr: 'البحث والتطوير', keywords: ['research', 'بحث', 'development', 'تطوير', 'r&d', 'innovation'], sortOrder: 20 },
    { slug: 'manufacturing-production', nameEn: 'Manufacturing & Production', nameAr: 'التصنيع والإنتاج', keywords: ['manufacturing', 'تصنيع', 'production', 'إنتاج', 'factory', 'plant'], sortOrder: 21 },
    { slug: 'consulting-advisory', nameEn: 'Consulting & Advisory', nameAr: 'الاستشارات والإرشاد', keywords: ['consulting', 'استشارات', 'advisory', 'إرشاد', 'consultant', 'strategy'], sortOrder: 22 },
    { slug: 'real-estate-property', nameEn: 'Real Estate & Property Management', nameAr: 'العقارات وإدارة الممتلكات', keywords: ['real estate', 'عقارات', 'property', 'ممتلكات', 'leasing', 'facilities'], sortOrder: 23 },
    { slug: 'retail-ecommerce', nameEn: 'Retail & E-Commerce', nameAr: 'التجزئة والتجارة الإلكترونية', keywords: ['retail', 'تجزئة', 'ecommerce', 'تجارة', 'electronic', 'إلكترونية', 'store'], sortOrder: 24 },
  ];

  const careerLevelData = [
    { slug: 'entry', nameEn: 'Entry Level', nameAr: 'مبتدئ', sortOrder: 1 },
    { slug: 'mid', nameEn: 'Mid-Level', nameAr: 'متوسط الخبرة', sortOrder: 2 },
    { slug: 'senior', nameEn: 'Senior', nameAr: 'أقدم', sortOrder: 3 },
    { slug: 'lead', nameEn: 'Lead / Manager', nameAr: 'قيادي / مدير', sortOrder: 4 },
    { slug: 'executive', nameEn: 'Executive / Director', nameAr: 'تنفيذي / مدير عام', sortOrder: 5 },
    { slug: 'c-level', nameEn: 'C-Level (VP, CEO, etc.)', nameAr: 'مستوى تنفيذي عالي', sortOrder: 6 },
  ];

  const uaeCityData = [
    { nameEn: 'Abu Dhabi', nameAr: 'أبو ظبي', emirate: 'Abu Dhabi', sortOrder: 1 },
    { nameEn: 'Dubai', nameAr: 'دبي', emirate: 'Dubai', sortOrder: 2 },
    { nameEn: 'Sharjah', nameAr: 'الشارقة', emirate: 'Sharjah', sortOrder: 3 },
    { nameEn: 'Ajman', nameAr: 'عجمان', emirate: 'Ajman', sortOrder: 4 },
    { nameEn: 'Ras Al Khaimah', nameAr: 'رأس الخيمة', emirate: 'Ras Al Khaimah', sortOrder: 5 },
    { nameEn: 'Fujairah', nameAr: 'الفجيرة', emirate: 'Fujairah', sortOrder: 6 },
    { nameEn: 'Umm Al Quwain', nameAr: 'أم القيوين', emirate: 'Umm Al Quwain', sortOrder: 7 },
    { nameEn: 'Al Ain', nameAr: 'العين', emirate: 'Abu Dhabi', sortOrder: 8 },
    { nameEn: 'Khor Fakkan', nameAr: 'خورفكان', emirate: 'Sharjah', sortOrder: 9 },
    { nameEn: 'Kalba', nameAr: 'كلباء', emirate: 'Sharjah', sortOrder: 10 },
    { nameEn: 'Dibba Al-Fujairah', nameAr: 'دبا الفجيرة', emirate: 'Fujairah', sortOrder: 11 },
    { nameEn: 'Dibba Al-Hisn', nameAr: 'دبا الحصن', emirate: 'Sharjah', sortOrder: 12 },
    { nameEn: 'Madinat Zayed', nameAr: 'مدينة زايد', emirate: 'Abu Dhabi', sortOrder: 13 },
    { nameEn: 'Ruwais', nameAr: 'الرويس', emirate: 'Abu Dhabi', sortOrder: 14 },
    { nameEn: 'Jebel Ali', nameAr: 'جبل علي', emirate: 'Dubai', sortOrder: 15 },
    { nameEn: 'Hatta', nameAr: 'حتا', emirate: 'Dubai', sortOrder: 16 },
    { nameEn: 'Liwa', nameAr: 'ليوا', emirate: 'Abu Dhabi', sortOrder: 17 },
    { nameEn: 'Masafi', nameAr: 'مسافي', emirate: 'Fujairah', sortOrder: 18 },
  ];

  for (const domain of jobDomainData) {
    await db.insert(jobDomains).values(domain).onConflictDoNothing();
  }
  console.log(`Seeded ${jobDomainData.length} job domains`);

  for (const level of careerLevelData) {
    await db.insert(careerLevels).values(level).onConflictDoNothing();
  }
  console.log(`Seeded ${careerLevelData.length} career levels`);

  for (const city of uaeCityData) {
    await db.insert(uaeCities).values(city).onConflictDoNothing();
  }
  console.log(`Seeded ${uaeCityData.length} UAE cities`);

  console.log('Done!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
