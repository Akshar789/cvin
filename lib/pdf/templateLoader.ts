/**
 * Template Loader for Simple Professional Template
 * Loads the HTML template and injects CV data dynamically
 * Uses the exact HTML structure from the provided template file
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface CVData {
  personalInfo: {
    name?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    professionalTitle?: string;
    targetJobTitle?: string;
  };
  summary?: string;
  professionalSummary?: string;
  experience?: Array<{
    company?: string;
    position?: string;
    title?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    responsibilities?: string[];
    achievements?: string[];
    description?: string;
  }>;
  education?: Array<{
    institution?: string;
    school?: string;
    degree?: string;
    field?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
    graduationYear?: string;
    gpa?: string;
  }>;
  skills?: any;
  languages?: Array<{
    name?: string;
    language?: string;
    level?: string;
    proficiency?: string;
  }> | string[];
  certifications?: Array<{
    name?: string;
    title?: string;
    issuer?: string;
    organization?: string;
    date?: string;
  }>;
}

/**
 * Load the HTML template file
 */
function loadHTMLTemplate(): string {
  try {
    // Try multiple possible paths
    const possiblePaths = [
      join(process.cwd(), 'Gray and White Simple Professional Marketing Manager CV Resume.html'),
      join(process.cwd(), 'public', 'templates', 'Gray and White Simple Professional Marketing Manager CV Resume.html'),
      join(__dirname, '..', '..', 'Gray and White Simple Professional Marketing Manager CV Resume.html'),
    ];
    
    for (const templatePath of possiblePaths) {
      if (existsSync(templatePath)) {
        console.log('[Template Loader] Loading template from:', templatePath);
        return readFileSync(templatePath, 'utf-8');
      }
    }
    
    throw new Error('Template file not found in any of the expected locations');
  } catch (error: any) {
    console.error('[Template Loader] Error loading template:', error.message);
    throw new Error(`Failed to load HTML template file: ${error.message}`);
  }
}

/**
 * Extract text content from HTML template and replace with CV data
 * This function uses a simpler approach: replace the entire body content
 * while preserving the styles and structure
 */
export function generateHTMLFromTemplate(cvData: CVData): string {
  const template = loadHTMLTemplate();
  
  const getName = () => cvData.personalInfo?.fullName || cvData.personalInfo?.name || 'Your Name';
  const getEmail = () => cvData.personalInfo?.email || '';
  const getPhone = () => cvData.personalInfo?.phone || '';
  const getLocation = () => cvData.personalInfo?.location || '';
  const getTitle = () => cvData.personalInfo?.professionalTitle || cvData.personalInfo?.targetJobTitle || '';
  const getSummary = () => cvData.professionalSummary || cvData.summary || '';

  // Generate Experience HTML
  const generateExperienceHTML = () => {
    if (!cvData.experience || cvData.experience.length === 0) return '';
    
    return cvData.experience.map((exp) => {
      const position = exp.position || exp.title || '';
      const company = exp.company || '';
      const location = exp.location || '';
      const startDate = exp.startDate || '';
      const endDate = exp.endDate || 'Present';
      const responsibilities = exp.achievements || exp.responsibilities || [];
      const description = exp.description || '';
      
      let responsibilitiesHTML = '';
      if (responsibilities.length > 0) {
        responsibilitiesHTML = `<ul style="margin-left: 25px; padding-left: 0; font-size: 10pt; color: #5D6064; line-height: 1.6;">
          ${responsibilities.map((r: string) => `<li style="margin-bottom: 6px; list-style-type: disc; list-style-position: outside;">${r}</li>`).join('')}
        </ul>`;
      } else if (description) {
        responsibilitiesHTML = `<p style="font-size: 10pt; color: #5D6064; line-height: 1.6;">${description}</p>`;
      }
      
      return `
        <div style="margin-bottom: 16px; line-height: 1.6;">
          <div style="margin-bottom: 6px;">
            <span style="font-size: 10pt; font-weight: bold; color: #5D6064;">
              ${startDate} - ${endDate}
            </span>
          </div>
          <div style="margin-bottom: 6px;">
            <span style="font-size: 12pt; font-weight: bold; color: #2C2C2C; text-transform: uppercase;">
              ${company}
            </span>
            ${location ? `<span style="font-size: 10pt; color: #5D6064; margin-left: 12px;">| ${location}</span>` : ''}
          </div>
          <div style="font-size: 11pt; font-weight: bold; color: #2C2C2C; margin-bottom: 8px; font-style: italic;">
            ${position}
          </div>
          ${responsibilitiesHTML}
        </div>
      `;
    }).join('');
  };

  // Generate Education HTML
  const generateEducationHTML = () => {
    if (!cvData.education || cvData.education.length === 0) return '';
    
    return cvData.education.map((edu) => {
      const institution = edu.institution || edu.school || '';
      const degree = edu.degree || '';
      const field = edu.field || edu.fieldOfStudy || '';
      const endDate = edu.endDate || edu.graduationYear || '';
      const startDate = edu.startDate || '';
      const gpa = edu.gpa || '';
      
      return `
        <div style="margin-bottom: 14px; line-height: 1.6;">
          ${startDate ? `<div style="margin-bottom: 6px;">
            <span style="font-size: 10pt; font-weight: bold; color: #5D6064;">
              ${startDate} - ${endDate || 'Present'}
            </span>
          </div>` : ''}
          <div style="font-size: 12pt; font-weight: bold; color: #2C2C2C; margin-bottom: 6px; text-transform: uppercase;">
            ${institution}
          </div>
          <div style="font-size: 10pt; color: #5D6064; margin-left: 12px; line-height: 1.5;">
            ${degree}${field ? ` - ${field}` : ''}${gpa ? ` | GPA: ${gpa}` : ''}
          </div>
        </div>
      `;
    }).join('');
  };

  // Generate Skills HTML
  const generateSkillsHTML = () => {
    if (!cvData.skills) return '';
    
    let skillsList: string[] = [];
    if (Array.isArray(cvData.skills)) {
      skillsList = cvData.skills.map((s: any) => typeof s === 'string' ? s : s.name || '');
    } else if (typeof cvData.skills === 'object') {
      if (cvData.skills.technical) skillsList.push(...cvData.skills.technical);
      if (cvData.skills.soft) skillsList.push(...cvData.skills.soft);
      if (cvData.skills.languages) skillsList.push(...cvData.skills.languages);
    }
    
    if (skillsList.length === 0) return '';
    
    return `<div style="font-size: 10pt; color: #5D6064; line-height: 1.6;">
      ${skillsList.filter(Boolean).join(' • ')}
    </div>`;
  };

  // Generate Languages HTML
  const generateLanguagesHTML = () => {
    if (!cvData.languages || cvData.languages.length === 0) return '';
    
    const langList = cvData.languages.map((lang: any) => {
      if (typeof lang === 'string') return lang;
      const name = lang.name || lang.language || '';
      const level = lang.level || lang.proficiency || '';
      return `${name}${level ? ` (${level})` : ''}`;
    }).filter(Boolean);
    
    if (langList.length === 0) return '';
    
    return `<div style="font-size: 10pt; color: #5D6064; line-height: 1.6;">
      ${langList.join(' • ')}
    </div>`;
  };

  // Create the new body content with CV data - matching the Gray and White Simple Professional template
  // Two-column layout: Profile (left), Education (right), Work Experience (left), Skills (right), Languages (left)
  const newBodyContent = `
    <div style="width: 210mm; min-height: 297mm; font-family: Arial, Helvetica, sans-serif; padding: 15mm; color: #5D6064; font-size: 10pt; line-height: 1.5; background-color: #FFFFFF; box-sizing: border-box;">
      <!-- Header Section -->
      <div style="margin-bottom: 12px; border-bottom: 2px solid #5D6064; padding-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div style="flex: 1; padding-right: 30px;">
            <h1 style="font-size: 32pt; font-weight: bold; color: #2C2C2C; margin-bottom: 6px; letter-spacing: 1.5px; line-height: 1.1; margin-top: 0; text-transform: uppercase;">
              ${getName().toUpperCase()}
            </h1>
            ${getTitle() ? `
            <h2 style="font-size: 18pt; font-weight: bold; color: #2C2C2C; margin-top: 4px; margin-bottom: 0; text-transform: uppercase; letter-spacing: 1.5px; line-height: 1.2;">
              ${getTitle().toUpperCase()}
            </h2>
            ` : ''}
          </div>
          <div style="text-align: right; font-size: 9pt; color: #5D6064; line-height: 1.8; flex-shrink: 0; font-weight: normal;">
            ${getPhone() ? `<div style="margin-bottom: 4px;">${getPhone()}</div>` : ''}
            ${getEmail() ? `<div style="margin-bottom: 4px;">${getEmail()}</div>` : ''}
            ${getLocation() ? `<div style="margin-bottom: 4px;">${getLocation()}</div>` : ''}
          </div>
        </div>
      </div>

      <!-- Two Column Layout Container -->
      <div style="display: flex; gap: 15px; align-items: flex-start; width: 100%; box-sizing: border-box;">
        <!-- Left Column -->
        <div style="flex: 1; min-width: 0; max-width: 50%; box-sizing: border-box;">
          <!-- Profile Section (Left) -->
          ${getSummary() ? `
          <div style="margin-bottom: 15px;">
            <h2 style="font-size: 14pt; font-weight: bold; color: #2C2C2C; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1.5px; line-height: 1.3; margin-top: 0;">
              PROFILE
            </h2>
            <p style="font-size: 10pt; color: #5D6064; line-height: 1.6; text-align: justify; margin-bottom: 0; margin-top: 0;">
              ${getSummary()}
            </p>
          </div>
          ` : ''}

          <!-- Work Experience Section (Left) -->
          ${cvData.experience && cvData.experience.length > 0 ? `
          <div style="margin-bottom: 15px;">
            <h2 style="font-size: 14pt; font-weight: bold; color: #2C2C2C; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1.5px; line-height: 1.3; margin-top: 0;">
              WORK EXPERIENCE
            </h2>
            <div style="line-height: 1.6;">
              ${generateExperienceHTML()}
            </div>
          </div>
          ` : ''}

          <!-- Languages Section (Left) -->
          ${cvData.languages && cvData.languages.length > 0 ? `
          <div style="margin-bottom: 15px;">
            <h2 style="font-size: 14pt; font-weight: bold; color: #2C2C2C; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1.5px; line-height: 1.3; margin-top: 0;">
              LANGUAGES
            </h2>
            ${generateLanguagesHTML()}
          </div>
          ` : ''}
        </div>

        <!-- Right Column -->
        <div style="flex: 1; min-width: 0; max-width: 50%; box-sizing: border-box;">
          <!-- Education Section (Right) -->
          ${cvData.education && cvData.education.length > 0 ? `
          <div style="margin-bottom: 15px;">
            <h2 style="font-size: 14pt; font-weight: bold; color: #2C2C2C; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1.5px; line-height: 1.3; margin-top: 0;">
              EDUCATION
            </h2>
            <div style="line-height: 1.6;">
              ${generateEducationHTML()}
            </div>
          </div>
          ` : ''}

          <!-- Skills Section (Right) -->
          ${cvData.skills ? `
          <div style="margin-bottom: 15px;">
            <h2 style="font-size: 14pt; font-weight: bold; color: #2C2C2C; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1.5px; line-height: 1.3; margin-top: 0;">
              SKILLS
            </h2>
            ${generateSkillsHTML()}
          </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  // Try to preserve the original template structure
  // The template might have complex CSS with absolute positioning
  // We'll try to inject our content while keeping the styles
  
  // Check if template has a body tag
  const bodyStartRegex = /<body[^>]*>/i;
  const bodyEndRegex = /<\/body>/i;
  
  const bodyStartMatch = template.match(bodyStartRegex);
  const bodyEndMatch = template.match(bodyEndRegex);
  
  if (bodyStartMatch && bodyEndMatch) {
    // Extract head and styles from original template
    const headMatch = template.match(/<head[^>]*>[\s\S]*?<\/head>/i);
    const headContent = headMatch ? headMatch[0] : '';
    
    // Extract style tags that might be outside head
    const styleMatches = template.match(/<style[^>]*>[\s\S]*?<\/style>/gi);
    const styles = styleMatches ? styleMatches.join('\n') : '';
    
    // Build complete HTML with original styles and new content
    const html = `<!DOCTYPE html>
<html lang="en" dir="ltr">
${headContent}
${styles ? `<style>${styles}</style>` : ''}
<body>
${newBodyContent}
</body>
</html>`;
    
    return html;
  }
  
  // Fallback: if we can't find body tags, create a complete HTML structure
  // but try to preserve any styles from the original template
  const styleMatches = template.match(/<style[^>]*>[\s\S]*?<\/style>/gi);
  const styles = styleMatches ? styleMatches.join('\n') : '';
  
  const headMatch = template.match(/<head[^>]*>[\s\S]*?<\/head>/i);
  const headContent = headMatch ? headMatch[0] : '<head><meta charset="UTF-8"><title>CV</title></head>';
  
  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
${headContent}
${styles ? `<style>${styles}</style>` : ''}
<body>
${newBodyContent}
</body>
</html>`;
}

