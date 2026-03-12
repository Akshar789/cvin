/**
 * Profile Form Dropdown Options
 * Bilingual support for all standardized profile fields
 */

export interface DropdownOption {
  value: string;
  labelEn: string;
  labelAr: string;
}

export const CAREER_LEVELS: DropdownOption[] = [
  { value: 'entry', labelEn: 'Entry Level', labelAr: 'مبتدئ' },
  { value: 'mid', labelEn: 'Mid-Level', labelAr: 'متوسط الخبرة' },
  { value: 'senior', labelEn: 'Senior', labelAr: 'أقدم' },
  { value: 'lead', labelEn: 'Lead / Manager', labelAr: 'قيادي / مدير' },
  { value: 'executive', labelEn: 'Executive / Director', labelAr: 'تنفيذي / مدير عام' },
  { value: 'c-level', labelEn: 'C-Level (VP, CEO, etc.)', labelAr: 'مستوى تنفيذي عالي' },
];

export const YEARS_OF_EXPERIENCE: DropdownOption[] = [
  { value: '0-1', labelEn: 'Less than 1 year', labelAr: 'أقل من سنة' },
  { value: '1-3', labelEn: '1-3 years', labelAr: '1-3 سنوات' },
  { value: '3-5', labelEn: '3-5 years', labelAr: '3-5 سنوات' },
  { value: '5-7', labelEn: '5-7 years', labelAr: '5-7 سنوات' },
  { value: '7-10', labelEn: '7-10 years', labelAr: '7-10 سنوات' },
  { value: '10-15', labelEn: '10-15 years', labelAr: '10-15 سنة' },
  { value: '15+', labelEn: '15+ years', labelAr: '15+ سنة' },
];

export const EDUCATION_LEVELS: DropdownOption[] = [
  { value: 'high-school', labelEn: 'High School', labelAr: 'ثانوية عامة' },
  { value: 'diploma', labelEn: 'Diploma', labelAr: 'دبلوم' },
  { value: 'bachelor', labelEn: 'Bachelor\'s Degree', labelAr: 'بكالوريوس' },
  { value: 'master', labelEn: 'Master\'s Degree', labelAr: 'ماجستير' },
  { value: 'phd', labelEn: 'Doctorate (PhD)', labelAr: 'دكتوراه' },
  { value: 'professional', labelEn: 'Professional Certification', labelAr: 'شهادة مهنية' },
];

export const EMPLOYMENT_STATUS: DropdownOption[] = [
  { value: 'employed', labelEn: 'Currently Employed', labelAr: 'موظف حاليًا' },
  { value: 'unemployed', labelEn: 'Unemployed / Job Seeking', labelAr: 'باحث عن عمل' },
  { value: 'student', labelEn: 'Student', labelAr: 'طالب' },
  { value: 'self-employed', labelEn: 'Self-Employed / Freelancer', labelAr: 'عمل حر' },
  { value: 'retired', labelEn: 'Retired', labelAr: 'متقاعد' },
];

export const PREFERRED_LANGUAGES: DropdownOption[] = [
  { value: 'Arabic', labelEn: 'Arabic Only', labelAr: 'العربية فقط' },
  { value: 'English', labelEn: 'English Only', labelAr: 'الإنجليزية فقط' },
  { value: 'Both', labelEn: 'Both Arabic & English', labelAr: 'العربية والإنجليزية' },
];

// Complete Industry/Sector list for Saudi/GCC market
export const INDUSTRIES: DropdownOption[] = [
  // Core Saudi Industries
  { value: 'oil-gas', labelEn: 'Oil & Gas', labelAr: 'النفط والغاز' },
  { value: 'petrochemicals', labelEn: 'Petrochemicals', labelAr: 'البتروكيماويات' },
  { value: 'energy', labelEn: 'Energy & Utilities', labelAr: 'الطاقة والمرافق' },
  { value: 'renewable-energy', labelEn: 'Renewable Energy', labelAr: 'الطاقة المتجددة' },
  { value: 'mining', labelEn: 'Mining & Minerals', labelAr: 'التعدين والمعادن' },
  { value: 'defense', labelEn: 'Defense & Military', labelAr: 'الدفاع والعسكرية' },
  
  // Government & Public
  { value: 'government', labelEn: 'Government', labelAr: 'القطاع الحكومي' },
  { value: 'semi-government', labelEn: 'Semi-Government', labelAr: 'شبه حكومي' },
  
  // Technology & IT
  { value: 'technology', labelEn: 'Technology', labelAr: 'التقنية' },
  { value: 'fintech', labelEn: 'FinTech', labelAr: 'التقنية المالية' },
  { value: 'telecommunications', labelEn: 'Telecommunications', labelAr: 'الاتصالات' },
  { value: 'e-commerce', labelEn: 'E-Commerce', labelAr: 'التجارة الإلكترونية' },
  
  // Financial Services
  { value: 'banking', labelEn: 'Banking', labelAr: 'البنوك' },
  { value: 'insurance', labelEn: 'Insurance', labelAr: 'التأمين' },
  { value: 'investment', labelEn: 'Investment & Asset Management', labelAr: 'الاستثمار وإدارة الأصول' },
  
  // Healthcare
  { value: 'healthcare', labelEn: 'Healthcare & Hospitals', labelAr: 'الرعاية الصحية والمستشفيات' },
  { value: 'pharmaceuticals', labelEn: 'Pharmaceuticals', labelAr: 'الأدوية' },
  { value: 'medical-devices', labelEn: 'Medical Devices', labelAr: 'الأجهزة الطبية' },
  
  // Education
  { value: 'education-k12', labelEn: 'Education (K-12)', labelAr: 'التعليم (المدارس)' },
  { value: 'higher-education', labelEn: 'Higher Education', labelAr: 'التعليم العالي' },
  { value: 'training', labelEn: 'Training & Development', labelAr: 'التدريب والتطوير' },
  
  // Construction & Real Estate
  { value: 'construction', labelEn: 'Construction', labelAr: 'الإنشاءات' },
  { value: 'real-estate', labelEn: 'Real Estate', labelAr: 'العقار' },
  { value: 'facilities-management', labelEn: 'Facilities Management', labelAr: 'إدارة المرافق' },
  
  // Transportation & Logistics
  { value: 'transportation', labelEn: 'Transportation', labelAr: 'النقل' },
  { value: 'logistics', labelEn: 'Logistics & Supply Chain', labelAr: 'الخدمات اللوجستية وسلسلة الإمداد' },
  { value: 'aviation', labelEn: 'Aviation', labelAr: 'الطيران' },
  { value: 'maritime', labelEn: 'Maritime & Shipping', labelAr: 'الملاحة والشحن البحري' },
  
  // Manufacturing
  { value: 'manufacturing', labelEn: 'Manufacturing', labelAr: 'التصنيع' },
  { value: 'automotive', labelEn: 'Automotive', labelAr: 'السيارات' },
  { value: 'fmcg', labelEn: 'FMCG (Consumer Goods)', labelAr: 'السلع الاستهلاكية' },
  
  // Retail & Consumer
  { value: 'retail', labelEn: 'Retail', labelAr: 'التجزئة' },
  { value: 'food-beverage', labelEn: 'Food & Beverage', labelAr: 'الأغذية والمشروبات' },
  { value: 'hospitality', labelEn: 'Hospitality & Hotels', labelAr: 'الضيافة والفنادق' },
  { value: 'tourism', labelEn: 'Tourism & Travel', labelAr: 'السياحة والسفر' },
  { value: 'restaurants', labelEn: 'Restaurants & Cafes', labelAr: 'المطاعم والمقاهي' },
  
  // Professional Services
  { value: 'consulting', labelEn: 'Consulting', labelAr: 'الاستشارات' },
  { value: 'legal', labelEn: 'Legal Services', labelAr: 'الخدمات القانونية' },
  { value: 'accounting', labelEn: 'Accounting & Audit', labelAr: 'المحاسبة والتدقيق' },
  { value: 'hr-recruitment', labelEn: 'HR & Recruitment', labelAr: 'الموارد البشرية والتوظيف' },
  
  // Media & Entertainment
  { value: 'media', labelEn: 'Media & Broadcasting', labelAr: 'الإعلام والبث' },
  { value: 'entertainment', labelEn: 'Entertainment & Events', labelAr: 'الترفيه والفعاليات' },
  { value: 'sports', labelEn: 'Sports', labelAr: 'الرياضة' },
  { value: 'marketing-agencies', labelEn: 'Marketing & Advertising', labelAr: 'التسويق والإعلان' },
  
  // Security
  { value: 'security', labelEn: 'Security Services', labelAr: 'خدمات الأمن' },
  { value: 'cybersecurity', labelEn: 'Cybersecurity', labelAr: 'الأمن السيبراني' },
  
  // Agriculture & Environment
  { value: 'agriculture', labelEn: 'Agriculture', labelAr: 'الزراعة' },
  { value: 'environment', labelEn: 'Environment & Sustainability', labelAr: 'البيئة والاستدامة' },
  { value: 'water', labelEn: 'Water & Desalination', labelAr: 'المياه والتحلية' },
  
  // Other
  { value: 'non-profit', labelEn: 'Non-Profit & NGO', labelAr: 'القطاع غير الربحي' },
  { value: 'religious', labelEn: 'Religious Services', labelAr: 'الخدمات الدينية' },
  { value: 'other', labelEn: 'Other', labelAr: 'أخرى' },
];

/**
 * Fuzzy search for dropdown options - matches both Arabic and English
 */
export function searchDropdownOptions(
  options: DropdownOption[],
  query: string
): DropdownOption[] {
  const searchTerm = query.toLowerCase().trim();
  
  if (!searchTerm) {
    return options;
  }
  
  return options.filter(option => {
    const matchesEn = option.labelEn.toLowerCase().includes(searchTerm);
    const matchesAr = option.labelAr.includes(query.trim());
    const matchesValue = option.value.toLowerCase().includes(searchTerm);
    return matchesEn || matchesAr || matchesValue;
  });
}

// Saudi Arabia & GCC focused nationalities
export const NATIONALITIES: DropdownOption[] = [
  // GCC Countries
  { value: 'saudi', labelEn: 'Saudi Arabian', labelAr: 'سعودي' },
  { value: 'emirati', labelEn: 'Emirati (UAE)', labelAr: 'إماراتي' },
  { value: 'kuwaiti', labelEn: 'Kuwaiti', labelAr: 'كويتي' },
  { value: 'qatari', labelEn: 'Qatari', labelAr: 'قطري' },
  { value: 'bahraini', labelEn: 'Bahraini', labelAr: 'بحريني' },
  { value: 'omani', labelEn: 'Omani', labelAr: 'عماني' },
  
  // Arab Countries
  { value: 'egyptian', labelEn: 'Egyptian', labelAr: 'مصري' },
  { value: 'jordanian', labelEn: 'Jordanian', labelAr: 'أردني' },
  { value: 'lebanese', labelEn: 'Lebanese', labelAr: 'لبناني' },
  { value: 'syrian', labelEn: 'Syrian', labelAr: 'سوري' },
  { value: 'palestinian', labelEn: 'Palestinian', labelAr: 'فلسطيني' },
  { value: 'iraqi', labelEn: 'Iraqi', labelAr: 'عراقي' },
  { value: 'yemeni', labelEn: 'Yemeni', labelAr: 'يمني' },
  { value: 'moroccan', labelEn: 'Moroccan', labelAr: 'مغربي' },
  { value: 'tunisian', labelEn: 'Tunisian', labelAr: 'تونسي' },
  { value: 'algerian', labelEn: 'Algerian', labelAr: 'جزائري' },
  { value: 'sudanese', labelEn: 'Sudanese', labelAr: 'سوداني' },
  { value: 'libyan', labelEn: 'Libyan', labelAr: 'ليبي' },
  
  // South Asian (common in Saudi)
  { value: 'indian', labelEn: 'Indian', labelAr: 'هندي' },
  { value: 'pakistani', labelEn: 'Pakistani', labelAr: 'باكستاني' },
  { value: 'bangladeshi', labelEn: 'Bangladeshi', labelAr: 'بنغلاديشي' },
  { value: 'filipino', labelEn: 'Filipino', labelAr: 'فلبيني' },
  { value: 'nepalese', labelEn: 'Nepalese', labelAr: 'نيبالي' },
  { value: 'sri_lankan', labelEn: 'Sri Lankan', labelAr: 'سريلانكي' },
  { value: 'indonesian', labelEn: 'Indonesian', labelAr: 'إندونيسي' },
  { value: 'ethiopian', labelEn: 'Ethiopian', labelAr: 'إثيوبي' },
  { value: 'kenyan', labelEn: 'Kenyan', labelAr: 'كيني' },
  
  // Western Countries
  { value: 'american', labelEn: 'American (USA)', labelAr: 'أمريكي' },
  { value: 'british', labelEn: 'British (UK)', labelAr: 'بريطاني' },
  { value: 'canadian', labelEn: 'Canadian', labelAr: 'كندي' },
  { value: 'australian', labelEn: 'Australian', labelAr: 'أسترالي' },
  { value: 'french', labelEn: 'French', labelAr: 'فرنسي' },
  { value: 'german', labelEn: 'German', labelAr: 'ألماني' },
  
  // Other
  { value: 'prefer_not_to_say', labelEn: 'Prefer not to say', labelAr: 'أفضل عدم الإفصاح' },
  { value: 'other', labelEn: 'Other', labelAr: 'أخرى' },
];

/**
 * Get label for a dropdown option
 */
export function getDropdownLabel(
  options: DropdownOption[],
  value: string,
  language: 'en' | 'ar' = 'en'
): string {
  const option = options.find(opt => opt.value === value);
  if (!option) return value;
  return language === 'ar' ? option.labelAr : option.labelEn;
}

/**
 * Job Domain Required Fields Mapping
 * Different domains may require different profile information
 */
export interface DomainRequiredFields {
  domainId: string;
  requiredFields: string[];
  recommendedFields: string[];
}

export const DOMAIN_REQUIREMENTS: DomainRequiredFields[] = [
  {
    domainId: 'hr-people-ops',
    requiredFields: ['phone', 'location', 'nationality', 'careerLevel', 'yearsOfExperience', 'educationLevel'],
    recommendedFields: ['linkedin', 'mostRecentJobTitle', 'mostRecentCompany', 'employmentStatus'],
  },
  {
    domainId: 'engineering-technical',
    requiredFields: ['phone', 'location', 'careerLevel', 'yearsOfExperience', 'educationLevel', 'mostRecentJobTitle'],
    recommendedFields: ['nationality', 'linkedin', 'mostRecentCompany', 'employmentStatus'],
  },
  {
    domainId: 'it-software-dev',
    requiredFields: ['phone', 'location', 'careerLevel', 'yearsOfExperience', 'educationLevel', 'mostRecentJobTitle'],
    recommendedFields: ['linkedin', 'mostRecentCompany'],
  },
  {
    domainId: 'finance-accounting',
    requiredFields: ['phone', 'location', 'nationality', 'careerLevel', 'yearsOfExperience', 'educationLevel', 'employmentStatus'],
    recommendedFields: ['mostRecentJobTitle', 'mostRecentCompany'],
  },
  {
    domainId: 'healthcare-medical',
    requiredFields: ['phone', 'location', 'nationality', 'careerLevel', 'yearsOfExperience', 'educationLevel', 'mostRecentJobTitle', 'employmentStatus'],
    recommendedFields: ['mostRecentCompany'],
  },
  {
    domainId: 'sales-business-dev',
    requiredFields: ['phone', 'location', 'careerLevel', 'yearsOfExperience', 'employmentStatus'],
    recommendedFields: ['nationality', 'linkedin', 'educationLevel', 'mostRecentJobTitle', 'mostRecentCompany'],
  },
  // Default for all other domains
  {
    domainId: 'default',
    requiredFields: ['phone', 'location', 'careerLevel', 'yearsOfExperience'],
    recommendedFields: ['nationality', 'educationLevel', 'employmentStatus'],
  },
];

/**
 * Get required fields for a specific job domain
 */
export function getRequiredFieldsForDomain(domainId: string): {
  required: string[];
  recommended: string[];
} {
  const domainReq = DOMAIN_REQUIREMENTS.find(dr => dr.domainId === domainId);
  
  if (!domainReq) {
    // Return default requirements
    const defaultReq = DOMAIN_REQUIREMENTS.find(dr => dr.domainId === 'default')!;
    return {
      required: defaultReq.requiredFields,
      recommended: defaultReq.recommendedFields,
    };
  }
  
  return {
    required: domainReq.requiredFields,
    recommended: domainReq.recommendedFields,
  };
}
