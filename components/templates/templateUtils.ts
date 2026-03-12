/**
 * Strip duplicate plain-text bullet content that precedes an HTML list.
 *
 * When the AI generates experience descriptions it sometimes stores BOTH a
 * plain-text bullet paragraph (with • characters) AND an identical <ul><li>
 * list in the same `description` string.  Rendering both causes the content
 * to appear twice in the CV.  This function detects that pattern and removes
 * the plain-text duplicate, keeping only the semantic HTML.
 */
const deduplicateDescription = (raw: string): string => {
  const trimmed = raw.trim();
  if (!trimmed.includes('<ul>') || !trimmed.includes('<li>')) {
    return trimmed;
  }

  const ulIdx = trimmed.indexOf('<ul>');
  const preHtml = trimmed.substring(0, ulIdx).trim();

  if (!preHtml) return trimmed;

  // Only strip the pre-HTML portion when it looks like a plain-text bullet
  // list (every non-empty line starts with •, -, *, or a Unicode bullet).
  const lines = preHtml.split(/\n/).map(l => l.trim()).filter(Boolean);
  const allBullets = lines.length > 0 && lines.every(l => /^[\u2022\-\*•]/.test(l));

  if (allBullets) {
    return trimmed.substring(ulIdx);
  }

  return trimmed;
};

/**
 * Inline job domain lookup table to resolve slugs/IDs to localised display names.
 * Kept here (instead of importing from lib/constants) so this module stays
 * server-and-client safe with no circular dependencies.
 */
const JOB_DOMAIN_MAP: Record<string, { en: string; ar: string }> = {
  'hr-people-ops':            { en: 'Human Resources & People Operations', ar: 'الموارد البشرية وعمليات الأفراد' },
  'sales-business-dev':       { en: 'Sales & Business Development',        ar: 'المبيعات وتطوير الأعمال' },
  'engineering-technical':    { en: 'Engineering & Technical',             ar: 'الهندسة والتقنية' },
  'finance-accounting':       { en: 'Finance & Accounting',                ar: 'المالية والمحاسبة' },
  'marketing-communications': { en: 'Marketing & Communications',          ar: 'التسويق والاتصالات' },
  'it-software-dev':          { en: 'IT & Software Development',           ar: 'تقنية المعلومات وتطوير البرمجيات' },
  'operations-supply-chain':  { en: 'Operations & Supply Chain',           ar: 'العمليات وسلسلة التوريد' },
  'customer-service-support': { en: 'Customer Service & Support',          ar: 'خدمة العملاء والدعم' },
  'healthcare-medical':       { en: 'Healthcare & Medical',                ar: 'الرعاية الصحية والطب' },
  'education-training':       { en: 'Education & Training',                ar: 'التعليم والتدريب' },
  'project-management':       { en: 'Project Management',                  ar: 'إدارة المشاريع' },
  'design-creative':          { en: 'Design & Creative',                   ar: 'التصميم والإبداع' },
  'legal-compliance':         { en: 'Legal & Compliance',                  ar: 'القانون والامتثال' },
  'quality-safety-env':       { en: 'Quality, Safety & Environment',       ar: 'الجودة والسلامة والبيئة' },
  'data-analytics':           { en: 'Data & Analytics',                    ar: 'البيانات والتحليلات' },
  'hospitality-tourism':      { en: 'Hospitality & Tourism',               ar: 'الضيافة والسياحة' },
  'transportation-logistics': { en: 'Transportation & Logistics',          ar: 'النقل واللوجستيات' },
  'procurement-contracts':    { en: 'Procurement & Contracts',             ar: 'المشتريات والعقود' },
  'admin-office-mgmt':        { en: 'Administration & Office Management',  ar: 'الإدارة وإدارة المكاتب' },
  'research-development':     { en: 'Research & Development',              ar: 'البحث والتطوير' },
  'manufacturing-production': { en: 'Manufacturing & Production',          ar: 'التصنيع والإنتاج' },
  'consulting-advisory':      { en: 'Consulting & Advisory',               ar: 'الاستشارات والإرشاد' },
  'real-estate-property':     { en: 'Real Estate & Property Management',   ar: 'العقارات وإدارة الممتلكات' },
  'retail-ecommerce':         { en: 'Retail & E-Commerce',                 ar: 'التجزئة والتجارة الإلكترونية' },
};

/**
 * Resolve a stored targetJobDomain value (which may be a slug, a DB slug, or
 * free-text the user typed) to its correct display name in the requested language.
 */
const resolveDomainName = (raw: string, isArabic: boolean): string => {
  if (!raw) return '';
  const entry = JOB_DOMAIN_MAP[raw];
  if (entry) return isArabic ? entry.ar : entry.en;
  return raw;
};

/**
 * Build the combined job title string shown in every CV header.
 * Format: "targetJobTitle - targetJobDomain" when both are present,
 * otherwise whichever single value exists.
 *
 * Pass isArabic=true when rendering an Arabic CV so the job domain slug is
 * translated to the correct Arabic display name.
 */
export const getJobTitle = (personalInfo: any, isArabic = false): string => {
  const title = personalInfo?.targetJobTitle || personalInfo?.professionalTitle || '';
  const rawDomain = personalInfo?.targetJobDomain || '';
  const domain = resolveDomainName(rawDomain, isArabic);
  if (title && domain) return `${title} - ${domain}`;
  return title || domain;
};

export const getExperienceHtml = (exp: any): string => {
  const rawDescription = exp.description;
  const hasDescription =
    rawDescription && typeof rawDescription === 'string' && rawDescription.trim();
  const hasResponsibilities =
    Array.isArray(exp.responsibilities) && exp.responsibilities.length > 0;
  const hasAchievements =
    Array.isArray(exp.achievements) && exp.achievements.length > 0;

  if (hasDescription) {
    let html = deduplicateDescription(rawDescription);
    if (hasAchievements && !html.includes('<li>')) {
      html += '<ul>' + exp.achievements.map((a: string) => `<li>${a}</li>`).join('') + '</ul>';
    }
    return html;
  }

  if (hasResponsibilities) {
    return '<ul>' + exp.responsibilities.map((r: string) => `<li>${r}</li>`).join('') + '</ul>';
  }

  if (hasAchievements) {
    return '<ul>' + exp.achievements.map((a: string) => `<li>${a}</li>`).join('') + '</ul>';
  }

  return '';
};
