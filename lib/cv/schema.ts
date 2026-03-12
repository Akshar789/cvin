/**
 * Canonical CV Data Contract
 * 
 * This module defines the single source of truth for CV data structure
 * and provides normalization helpers to convert between database records
 * and the canonical format.
 */

// Canonical CV Content Interface
export interface CvContent {
  personalInfo: {
    name: string;
    fullName?: string;
    professionalTitle?: string;
    targetJobTitle?: string;
    targetJobDomain?: string;
    email: string;
    phone: string;
    location: string;
    nationality?: string;
    linkedin?: string;
    photoUrl?: string;
    professionalSummary?: string;
  };
  summary?: string; // Top-level summary (alternative to professionalSummary)
  experience: Array<{
    id?: string;
    company: string;
    position: string;
    location?: string;
    startDate: string;
    endDate?: string;
    description?: string;
    achievements?: string[];
  }>;
  education: Array<{
    id?: string;
    degree: string;
    field: string;
    institution: string;
    startDate?: string;
    endDate?: string;
    gpa?: string;
  }>;
  skills: Array<{
    id?: string;
    category?: string;
    skillsList: string[];
  }>;
  courses: Array<string | {
    id?: string;
    title?: string;
    name?: string;
    institution?: string;
    date?: string;
    year?: string;
  }>;
  languages: Array<{
    id?: string;
    name: string;
    level?: string;
  }>;
  certifications: Array<{
    id?: string;
    name: string;
    issuer?: string;
    date?: string;
    credentialId?: string;
  }>;
}

/**
 * Normalize database records to canonical CvContent format
 * 
 * @param dbRecord - Raw database record with potential nested structures
 * @returns CvContent - Normalized data in canonical format
 */
export function normalizeCvData(dbRecord: any): CvContent {
  const personalInfo = dbRecord.personal_info || {};
  
  const contentData = personalInfo.content || personalInfo;
  
  return {
    personalInfo: {
      name: contentData.personalInfo?.name || 
            contentData.personalInfo?.fullName || 
            contentData.name || 
            contentData.fullName || 
            '',
      fullName: contentData.personalInfo?.fullName ||
                contentData.personalInfo?.name ||
                contentData.fullName ||
                contentData.name ||
                '',
      professionalTitle: contentData.personalInfo?.professionalTitle || 
                        contentData.professionalTitle || 
                        '',
      targetJobTitle: contentData.personalInfo?.targetJobTitle ||
                      contentData.targetJobTitle ||
                      contentData.personalInfo?.professionalTitle ||
                      contentData.professionalTitle ||
                      '',
      targetJobDomain: contentData.personalInfo?.targetJobDomain ||
                       contentData.targetJobDomain ||
                       '',
      email: contentData.personalInfo?.email || 
             contentData.email || 
             '',
      phone: contentData.personalInfo?.phone || 
             contentData.phone || 
             '',
      location: contentData.personalInfo?.location || 
                contentData.location || 
                '',
      nationality: contentData.personalInfo?.nationality ||
                   contentData.nationality ||
                   '',
      linkedin: contentData.personalInfo?.linkedin ||
                contentData.linkedin ||
                '',
      photoUrl: contentData.personalInfo?.photoUrl || 
                contentData.photoUrl || 
                '',
      professionalSummary: contentData.personalInfo?.professionalSummary || 
                          contentData.professionalSummary || 
                          '',
    },
    summary: dbRecord.summary || 
             contentData.summary || 
             contentData.personalInfo?.professionalSummary || 
             '',
    experience: normalizeExperience(
      dbRecord.experience || 
      contentData.experience || 
      []
    ),
    education: normalizeEducation(
      dbRecord.education || 
      contentData.education || 
      []
    ),
    skills: normalizeSkills(
      dbRecord.skills || 
      contentData.skills || 
      []
    ),
    courses: normalizeArray(
      personalInfo.courses || 
      contentData.courses || 
      []
    ),
    languages: normalizeLanguages(
      personalInfo.languages || 
      contentData.languages || 
      []
    ),
    certifications: normalizeCertifications(
      personalInfo.certifications || 
      contentData.certifications || 
      []
    ),
  };
}

/**
 * Prepare CV data for database persistence
 * 
 * @param cvData - CvContent in canonical format
 * @returns Database-ready object
 */
export function prepareCvForPersistence(cvData: any): any {
  const professionalSummary = cvData.professionalSummary || 
    cvData.summary || 
    cvData.personalInfo?.professionalSummary || 
    '';
  
  return {
    personalInfo: {
      ...cvData.personalInfo,
      professionalSummary: professionalSummary,
    },
    professionalSummary: professionalSummary,
    summary: professionalSummary,
    experience: cvData.experience,
    education: cvData.education,
    skills: cvData.skills,
    courses: cvData.courses,
    languages: cvData.languages,
    certifications: cvData.certifications,
  };
}

// Helper functions

function normalizeArray(data: any): any[] {
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === 'object') {
    return [data];
  }
  return [];
}

/**
 * Normalize experience entries from database format to canonical format
 * Maps snake_case fields to camelCase and parses achievements JSON
 */
function normalizeExperience(experiences: any): Array<{
  id?: string;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description?: string;
  achievements?: string[];
  responsibilities?: string[];
}> {
  if (!experiences) return [];
  
  const experienceArray = normalizeArray(experiences);
  
  return experienceArray.map((exp: any) => {
    let achievements = exp.achievements || exp.responsibilities;
    if (typeof achievements === 'string' && achievements.trim()) {
      try {
        achievements = JSON.parse(achievements);
      } catch (e) {
        achievements = achievements.split('\n').filter((a: string) => a.trim());
      }
    }
    
    const achievementsArray = Array.isArray(achievements) ? achievements : [];
    
    return {
      id: exp.id,
      company: exp.company || '',
      position: exp.position || '',
      location: exp.location,
      startDate: exp.startDate || exp.start_date || '',
      endDate: exp.endDate || exp.end_date,
      description: exp.description,
      achievements: achievementsArray,
      responsibilities: achievementsArray,
    };
  });
}

/**
 * Normalize education entries from database format to canonical format
 * Maps snake_case fields to camelCase
 */
function normalizeEducation(education: any): Array<{
  id?: string;
  degree: string;
  field: string;
  institution: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
  description?: string;
}> {
  if (!education) return [];
  
  const educationArray = normalizeArray(education);
  
  return educationArray
    .filter((edu: any) => edu.institution || edu.school || edu.degree)
    .map((edu: any) => ({
      id: edu.id,
      degree: edu.degree || '',
      field: edu.field || edu.fieldOfStudy || '',
      institution: edu.institution || edu.school || '',
      startDate: edu.startDate || edu.start_date || '',
      endDate: edu.endDate || edu.end_date || edu.graduationYear || '',
      gpa: edu.gpa,
      description: edu.description || edu.summary || '',
    }));
}

/**
 * Normalize skills entries from database format to canonical format
 * Maps skills_list to skillsList and removes unwanted fields
 */
function normalizeSkills(skills: any): Array<{id?: string; category?: string; skillsList: string[]}> {
  if (!skills) return [];
  
  if (Array.isArray(skills)) {
    return skills.map((skill: any) => {
      if (typeof skill === 'string') {
        return {
          category: 'General',
          skillsList: [skill],
        };
      }
      
      let skillsList: string[] = [];
      
      if (skill.skillsList && Array.isArray(skill.skillsList)) {
        skillsList = skill.skillsList;
      }
      else if (skill.skillsList && typeof skill.skillsList === 'string') {
        skillsList = skill.skillsList.split(',').map((s: string) => s.trim());
      }
      else if (skill.skills_list) {
        skillsList = Array.isArray(skill.skills_list) 
          ? skill.skills_list 
          : skill.skills_list.split(',').map((s: string) => s.trim());
      }
      else {
        skillsList = [skill.name || 'Skill'];
      }
      
      return {
        id: skill.id,
        category: skill.category || 'General',
        skillsList,
      };
    });
  }

  if (typeof skills === 'object') {
    const result: Array<{category: string; skillsList: string[]}> = [];
    const categoryMap: Record<string, string> = { technical: 'Technical', soft: 'Soft', tools: 'Tools' };
    for (const [key, label] of Object.entries(categoryMap)) {
      const arr = (skills as any)[key];
      if (Array.isArray(arr) && arr.length > 0) {
        result.push({ category: label, skillsList: arr });
      }
    }
    if (result.length > 0) return result;
  }
  
  return [];
}

function normalizeLanguages(languages: any): Array<{id?: string; name: string; level?: string}> {
  if (!languages) return [];
  
  if (Array.isArray(languages)) {
    return languages.map((lang: any) => {
      // If language is a string, convert to object
      if (typeof lang === 'string') {
        return {
          name: lang,
          level: '',
        };
      }
      
      // If language is already an object with name
      return {
        id: lang.id,
        name: lang.name || lang.language || '',
        level: lang.level || lang.proficiency || '',
      };
    });
  }
  
  return [];
}

function normalizeCertifications(certifications: any): Array<{id?: string; name: string; issuer?: string; date?: string; credentialId?: string}> {
  if (!certifications) return [];
  
  if (Array.isArray(certifications)) {
    return certifications.map((cert: any) => {
      // If certification is a string, convert to object
      if (typeof cert === 'string') {
        return {
          name: cert,
          issuer: '',
          date: '',
        };
      }
      
      // If certification is already an object
      return {
        id: cert.id,
        name: cert.name || cert.title || '',
        issuer: cert.issuer || cert.organization || '',
        date: cert.date || cert.year || '',
        credentialId: cert.credentialId || cert.credential_id || '',
      };
    });
  }
  
  return [];
}
