/**
 * Job Domains - Broader functional areas replacing narrow job titles
 * Bilingual support: English and Arabic
 */

export interface JobDomain {
  id: string;
  nameEn: string;
  nameAr: string;
  keywords: string[]; // For smart search
}

export const JOB_DOMAINS: JobDomain[] = [
  {
    id: 'hr-people-ops',
    nameEn: 'Human Resources & People Operations',
    nameAr: 'الموارد البشرية وعمليات الأفراد',
    keywords: ['hr', 'موارد', 'بشرية', 'people', 'recruitment', 'talent', 'employee']
  },
  {
    id: 'sales-business-dev',
    nameEn: 'Sales & Business Development',
    nameAr: 'المبيعات وتطوير الأعمال',
    keywords: ['sales', 'مبيعات', 'business', 'أعمال', 'revenue', 'client']
  },
  {
    id: 'engineering-technical',
    nameEn: 'Engineering & Technical',
    nameAr: 'الهندسة والتقنية',
    keywords: ['engineering', 'هندسة', 'technical', 'تقني', 'developer', 'مطور']
  },
  {
    id: 'finance-accounting',
    nameEn: 'Finance & Accounting',
    nameAr: 'المالية والمحاسبة',
    keywords: ['finance', 'مالية', 'accounting', 'محاسبة', 'budget', 'audit']
  },
  {
    id: 'marketing-communications',
    nameEn: 'Marketing & Communications',
    nameAr: 'التسويق والاتصالات',
    keywords: ['marketing', 'تسويق', 'communications', 'اتصالات', 'brand', 'digital']
  },
  {
    id: 'it-software-dev',
    nameEn: 'IT & Software Development',
    nameAr: 'تقنية المعلومات وتطوير البرمجيات',
    keywords: ['it', 'تقنية', 'software', 'برمجيات', 'development', 'تطوير', 'programming']
  },
  {
    id: 'operations-supply-chain',
    nameEn: 'Operations & Supply Chain',
    nameAr: 'العمليات وسلسلة التوريد',
    keywords: ['operations', 'عمليات', 'supply', 'توريد', 'chain', 'logistics']
  },
  {
    id: 'customer-service-support',
    nameEn: 'Customer Service & Support',
    nameAr: 'خدمة العملاء والدعم',
    keywords: ['customer', 'عملاء', 'service', 'خدمة', 'support', 'دعم']
  },
  {
    id: 'healthcare-medical',
    nameEn: 'Healthcare & Medical',
    nameAr: 'الرعاية الصحية والطب',
    keywords: ['healthcare', 'صحة', 'medical', 'طب', 'health', 'رعاية']
  },
  {
    id: 'education-training',
    nameEn: 'Education & Training',
    nameAr: 'التعليم والتدريب',
    keywords: ['education', 'تعليم', 'training', 'تدريب', 'teaching', 'تدريس']
  },
  {
    id: 'project-management',
    nameEn: 'Project Management',
    nameAr: 'إدارة المشاريع',
    keywords: ['project', 'مشروع', 'management', 'إدارة', 'pmo', 'agile']
  },
  {
    id: 'design-creative',
    nameEn: 'Design & Creative',
    nameAr: 'التصميم والإبداع',
    keywords: ['design', 'تصميم', 'creative', 'إبداع', 'graphic', 'ux', 'ui']
  },
  {
    id: 'legal-compliance',
    nameEn: 'Legal & Compliance',
    nameAr: 'القانون والامتثال',
    keywords: ['legal', 'قانون', 'compliance', 'امتثال', 'regulatory', 'law']
  },
  {
    id: 'quality-safety-env',
    nameEn: 'Quality, Safety & Environment',
    nameAr: 'الجودة والسلامة والبيئة',
    keywords: ['quality', 'جودة', 'safety', 'سلامة', 'environment', 'بيئة', 'qhse']
  },
  {
    id: 'data-analytics',
    nameEn: 'Data & Analytics',
    nameAr: 'البيانات والتحليلات',
    keywords: ['data', 'بيانات', 'analytics', 'تحليلات', 'bi', 'insights']
  },
  {
    id: 'hospitality-tourism',
    nameEn: 'Hospitality & Tourism',
    nameAr: 'الضيافة والسياحة',
    keywords: ['hospitality', 'ضيافة', 'tourism', 'سياحة', 'hotel', 'travel']
  },
  {
    id: 'transportation-logistics',
    nameEn: 'Transportation & Logistics',
    nameAr: 'النقل واللوجستيات',
    keywords: ['transportation', 'نقل', 'logistics', 'لوجستيات', 'shipping', 'delivery']
  },
  {
    id: 'procurement-contracts',
    nameEn: 'Procurement & Contracts',
    nameAr: 'المشتريات والعقود',
    keywords: ['procurement', 'مشتريات', 'contracts', 'عقود', 'purchasing', 'vendor']
  },
  {
    id: 'admin-office-mgmt',
    nameEn: 'Administration & Office Management',
    nameAr: 'الإدارة وإدارة المكاتب',
    keywords: ['admin', 'إدارة', 'office', 'مكتب', 'administration', 'secretary']
  },
  {
    id: 'research-development',
    nameEn: 'Research & Development',
    nameAr: 'البحث والتطوير',
    keywords: ['research', 'بحث', 'development', 'تطوير', 'r&d', 'innovation']
  },
  {
    id: 'manufacturing-production',
    nameEn: 'Manufacturing & Production',
    nameAr: 'التصنيع والإنتاج',
    keywords: ['manufacturing', 'تصنيع', 'production', 'إنتاج', 'factory', 'plant']
  },
  {
    id: 'consulting-advisory',
    nameEn: 'Consulting & Advisory',
    nameAr: 'الاستشارات والإرشاد',
    keywords: ['consulting', 'استشارات', 'advisory', 'إرشاد', 'consultant', 'strategy']
  },
  {
    id: 'real-estate-property',
    nameEn: 'Real Estate & Property Management',
    nameAr: 'العقارات وإدارة الممتلكات',
    keywords: ['real estate', 'عقارات', 'property', 'ممتلكات', 'leasing', 'facilities']
  },
  {
    id: 'retail-ecommerce',
    nameEn: 'Retail & E-Commerce',
    nameAr: 'التجزئة والتجارة الإلكترونية',
    keywords: ['retail', 'تجزئة', 'ecommerce', 'تجارة', 'electronic', 'إلكترونية', 'store']
  },
];

/**
 * Search job domains by keyword in both Arabic and English
 */
export function searchJobDomains(query: string, language: 'en' | 'ar' | 'both' = 'both'): JobDomain[] {
  const searchTerm = query.toLowerCase().trim();
  
  if (!searchTerm) {
    return JOB_DOMAINS;
  }
  
  return JOB_DOMAINS.filter(domain => {
    const matchesKeywords = domain.keywords.some(keyword => 
      keyword.toLowerCase().includes(searchTerm)
    );
    
    const matchesEn = language !== 'ar' && domain.nameEn.toLowerCase().includes(searchTerm);
    const matchesAr = language !== 'en' && domain.nameAr.includes(searchTerm);
    
    return matchesKeywords || matchesEn || matchesAr;
  });
}

/**
 * Get job domain display name based on language
 */
export function getJobDomainName(domainId: string, language: 'en' | 'ar' = 'en'): string {
  const domain = JOB_DOMAINS.find(d => d.id === domainId);
  if (!domain) return domainId;
  return language === 'ar' ? domain.nameAr : domain.nameEn;
}
