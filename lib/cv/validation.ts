/**
 * CV Validation System
 * 
 * Centralized validation for CV mandatory fields and sections.
 * Ensures all required content is present before PDF generation.
 */

export interface ValidationError {
  field: string;
  message: string;
  messageAr: string;
}

export interface SectionValidation {
  id: string;
  name: string;
  nameAr: string;
  isComplete: boolean;
  errors: ValidationError[];
  requiredFields: string[];
}

export interface CVValidationResult {
  isValid: boolean;
  sections: SectionValidation[];
  totalErrors: number;
  completedSections: number;
  totalSections: number;
}

// Validate Personal Information Section
export function validatePersonalInfo(data: any): SectionValidation {
  const errors: ValidationError[] = [];
  const personalInfo = data?.personalInfo || {};
  
  const name = personalInfo.fullName || personalInfo.name || '';
  const email = personalInfo.email || '';
  const phone = personalInfo.phone || '';

  if (!name || name.trim() === '') {
    errors.push({
      field: 'name',
      message: 'Full name is required',
      messageAr: 'الاسم الكامل مطلوب'
    });
  }

  if (!email || email.trim() === '') {
    errors.push({
      field: 'email',
      message: 'Email address is required',
      messageAr: 'البريد الإلكتروني مطلوب'
    });
  } else if (!isValidEmail(email)) {
    errors.push({
      field: 'email',
      message: 'Please enter a valid email address',
      messageAr: 'يرجى إدخال بريد إلكتروني صحيح'
    });
  }

  if (!phone || phone.trim() === '') {
    errors.push({
      field: 'phone',
      message: 'Phone number is required',
      messageAr: 'رقم الهاتف مطلوب'
    });
  }

  return {
    id: 'personalInfo',
    name: 'Personal Information',
    nameAr: 'المعلومات الشخصية',
    isComplete: errors.length === 0,
    errors,
    requiredFields: ['name', 'email', 'phone']
  };
}

// Validate Professional Summary Section
export function validateSummary(data: any): SectionValidation {
  const errors: ValidationError[] = [];
  const summary = data?.professionalSummary || data?.summary || '';

  if (!summary || summary.trim() === '') {
    errors.push({
      field: 'summary',
      message: 'Professional summary is required',
      messageAr: 'الملخص المهني مطلوب'
    });
  } else if (summary.trim().length < 50) {
    errors.push({
      field: 'summary',
      message: 'Summary should be at least 50 characters',
      messageAr: 'يجب أن يكون الملخص 50 حرفًا على الأقل'
    });
  }

  return {
    id: 'summary',
    name: 'Professional Summary',
    nameAr: 'الملخص المهني',
    isComplete: errors.length === 0,
    errors,
    requiredFields: ['summary']
  };
}

// Validate Education Section
export function validateEducation(data: any): SectionValidation {
  const errors: ValidationError[] = [];
  const education = data?.education || [];

  if (!Array.isArray(education) || education.length === 0) {
    errors.push({
      field: 'education',
      message: 'At least one education entry is required',
      messageAr: 'مطلوب إدخال تعليم واحد على الأقل'
    });
  } else {
    education.forEach((edu: any, index: number) => {
      const institution = edu.institution || edu.school || '';
      const degree = edu.degree || '';
      
      if (!institution || institution.trim() === '') {
        errors.push({
          field: `education[${index}].institution`,
          message: `Education #${index + 1}: Institution name is required`,
          messageAr: `التعليم رقم ${index + 1}: اسم المؤسسة مطلوب`
        });
      }
      
      if (!degree || degree.trim() === '') {
        errors.push({
          field: `education[${index}].degree`,
          message: `Education #${index + 1}: Degree is required`,
          messageAr: `التعليم رقم ${index + 1}: الدرجة العلمية مطلوبة`
        });
      }
    });
  }

  return {
    id: 'education',
    name: 'Education',
    nameAr: 'التعليم',
    isComplete: errors.length === 0,
    errors,
    requiredFields: ['institution', 'degree']
  };
}

// Validate Experience Section (with fresh graduate exception)
export function validateExperience(data: any, isFreshGraduate: boolean = false): SectionValidation {
  const errors: ValidationError[] = [];
  const experience = data?.experience || [];

  if (!isFreshGraduate) {
    if (!Array.isArray(experience) || experience.length === 0) {
      errors.push({
        field: 'experience',
        message: 'At least one work experience entry is required',
        messageAr: 'مطلوب إدخال خبرة عمل واحدة على الأقل'
      });
    } else {
      experience.forEach((exp: any, index: number) => {
        const company = exp.company || '';
        const position = exp.position || exp.title || '';
        
        if (!company || company.trim() === '') {
          errors.push({
            field: `experience[${index}].company`,
            message: `Experience #${index + 1}: Company name is required`,
            messageAr: `الخبرة رقم ${index + 1}: اسم الشركة مطلوب`
          });
        }
        
        if (!position || position.trim() === '') {
          errors.push({
            field: `experience[${index}].position`,
            message: `Experience #${index + 1}: Position is required`,
            messageAr: `الخبرة رقم ${index + 1}: المسمى الوظيفي مطلوب`
          });
        }
      });
    }
  }

  return {
    id: 'experience',
    name: 'Work Experience',
    nameAr: 'الخبرة المهنية',
    isComplete: errors.length === 0,
    errors,
    requiredFields: isFreshGraduate ? [] : ['company', 'position']
  };
}

// Validate Certifications Section
export function validateCertifications(data: any): SectionValidation {
  const errors: ValidationError[] = [];
  const certifications = data?.certifications || data?.courses || [];

  if (!Array.isArray(certifications) || certifications.length === 0) {
    errors.push({
      field: 'certifications',
      message: 'At least one certification or course is required',
      messageAr: 'مطلوب شهادة أو دورة واحدة على الأقل'
    });
  } else {
    certifications.forEach((cert: any, index: number) => {
      const name = typeof cert === 'string' ? cert : (cert.name || cert.title || '');
      
      if (!name || name.trim() === '') {
        errors.push({
          field: `certifications[${index}].name`,
          message: `Certification #${index + 1}: Name is required`,
          messageAr: `الشهادة رقم ${index + 1}: الاسم مطلوب`
        });
      }
    });
  }

  return {
    id: 'certifications',
    name: 'Certifications & Courses',
    nameAr: 'الشهادات والدورات',
    isComplete: errors.length === 0,
    errors,
    requiredFields: ['name']
  };
}

// Validate Skills Section
export function validateSkills(data: any): SectionValidation {
  const errors: ValidationError[] = [];
  const skills = data?.skills || {};

  let hasSkills = false;
  
  if (Array.isArray(skills)) {
    hasSkills = skills.length > 0;
  } else if (typeof skills === 'object') {
    const technical = skills.technical || [];
    const soft = skills.soft || [];
    const tools = skills.tools || [];
    hasSkills = technical.length > 0 || soft.length > 0 || tools.length > 0;
  }

  if (!hasSkills) {
    errors.push({
      field: 'skills',
      message: 'At least one skill is required',
      messageAr: 'مطلوب مهارة واحدة على الأقل'
    });
  }

  return {
    id: 'skills',
    name: 'Skills',
    nameAr: 'المهارات',
    isComplete: errors.length === 0,
    errors,
    requiredFields: ['skills']
  };
}

// Validate Languages Section
export function validateLanguages(data: any): SectionValidation {
  const errors: ValidationError[] = [];
  const languages = data?.languages || [];

  if (!Array.isArray(languages) || languages.length === 0) {
    errors.push({
      field: 'languages',
      message: 'At least one language is required',
      messageAr: 'مطلوب لغة واحدة على الأقل'
    });
  } else {
    languages.forEach((lang: any, index: number) => {
      const name = typeof lang === 'string' ? lang : (lang.name || lang.language || '');
      
      if (!name || name.trim() === '') {
        errors.push({
          field: `languages[${index}].name`,
          message: `Language #${index + 1}: Name is required`,
          messageAr: `اللغة رقم ${index + 1}: الاسم مطلوب`
        });
      }
    });
  }

  return {
    id: 'languages',
    name: 'Languages',
    nameAr: 'اللغات',
    isComplete: errors.length === 0,
    errors,
    requiredFields: ['name']
  };
}

// Complete CV Validation
export function validateCV(data: any, options?: { isFreshGraduate?: boolean }): CVValidationResult {
  const isFreshGraduate = options?.isFreshGraduate || false;
  
  const sections: SectionValidation[] = [
    validatePersonalInfo(data),
    validateSummary(data),
    validateEducation(data),
    validateExperience(data, isFreshGraduate),
    validateCertifications(data),
    validateSkills(data),
    validateLanguages(data),
  ];

  const completedSections = sections.filter(s => s.isComplete).length;
  const totalErrors = sections.reduce((acc, s) => acc + s.errors.length, 0);

  return {
    isValid: totalErrors === 0,
    sections,
    totalErrors,
    completedSections,
    totalSections: sections.length,
  };
}

// Get validation errors for a specific section
export function getSectionErrors(data: any, sectionId: string): ValidationError[] {
  switch (sectionId) {
    case 'personalInfo':
      return validatePersonalInfo(data).errors;
    case 'summary':
      return validateSummary(data).errors;
    case 'education':
      return validateEducation(data).errors;
    case 'experience':
      return validateExperience(data).errors;
    case 'certifications':
      return validateCertifications(data).errors;
    case 'skills':
      return validateSkills(data).errors;
    case 'languages':
      return validateLanguages(data).errors;
    default:
      return [];
  }
}

// Check if CV is ready for download
export function isReadyForDownload(data: any, options?: { isFreshGraduate?: boolean }): { ready: boolean; message: string; messageAr: string } {
  const validation = validateCV(data, options);
  
  if (validation.isValid) {
    return {
      ready: true,
      message: 'CV is ready for download',
      messageAr: 'السيرة الذاتية جاهزة للتحميل'
    };
  }

  const incompleteSections = validation.sections.filter(s => !s.isComplete);
  const sectionNames = incompleteSections.map(s => s.name).join(', ');
  const sectionNamesAr = incompleteSections.map(s => s.nameAr).join('، ');

  return {
    ready: false,
    message: `Please complete the following sections: ${sectionNames}`,
    messageAr: `يرجى إكمال الأقسام التالية: ${sectionNamesAr}`
  };
}

// Utility Functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Export validation section order
export const SECTION_ORDER = [
  'personalInfo',
  'summary',
  'education',
  'experience',
  'certifications',
  'skills',
  'languages'
];
