/**
 * HTML-based PDF Renderer
 * 
 * Uses Puppeteer for high-quality PDF generation with:
 * - Full Arabic font support (Noto Sans Arabic, Cairo, Amiri)
 * - Multi-page rendering with proper page breaks
 * - Template-based HTML generation
 * - Color theme support
 */

import { ColorTheme, getColorTheme, getTemplateFamily } from '@/config/templates';

interface CVData {
  personalInfo: {
    name?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    photoUrl?: string;
    professionalTitle?: string;
    targetJobTitle?: string;
    targetJobDomain?: string;
    nationality?: string;
    linkedin?: string;
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
    description?: string;
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
  courses?: Array<any>;
  cvLanguage?: string;
  isRTL?: boolean;
}

interface RenderOptions {
  templateId?: string;
  colorThemeId?: string;
  cvLanguage?: string;
  templateType?: 'ats' | 'attractive';
  includePhoto?: boolean;
  photoUrl?: string;
  primaryColor?: string;
}

// Generate HTML for CV
export function generateCVHTML(cvData: CVData, options: RenderOptions = {}): string {
  const isRTL = cvData.isRTL || cvData.cvLanguage === 'ar';
  const direction = isRTL ? 'rtl' : 'ltr';
  const colorTheme = getColorTheme(options.colorThemeId || 'blue') || getColorTheme('blue')!;
  
  // Photo rendering decision is made by the API route based on stored template metadata
  // This renderer simply trusts the options passed from the server
  // options.templateType and options.includePhoto are set by server after validating stored template
  
  const templateId = options.templateId?.toLowerCase().trim() || '';
  const isSimpleProfessional = templateId === 'simple-professional' || templateId === 'simple';
  const isMinimalistClean = templateId === 'minimalist-clean' || templateId === 'minimalist' || templateId === 'white-minimalist';
  const templateType: 'ats' | 'attractive' = 'ats';
  const isAttractiveTemplate = false;
  
  try {
    const { renderTemplateToHTML } = require('./reactRenderer.server');
    
    const theme = options.colorThemeId ? getColorTheme(options.colorThemeId) : null;
    
    let finalPrimaryColor = options.primaryColor;
    if (!finalPrimaryColor) {
      finalPrimaryColor = theme?.primary || '#2563eb';
    } else if (!finalPrimaryColor.startsWith('#')) {
      finalPrimaryColor = '#' + finalPrimaryColor;
    }
    
    const settings = {
      primaryColor: finalPrimaryColor,
      accentColor: theme?.accent || '#333333',
      photoUrl: options.photoUrl,
    };
    
    const html = renderTemplateToHTML(templateId, cvData, settings);
    console.log('[HTML Renderer] Using React component rendering for template:', templateId, 'with color:', settings.primaryColor);
    return html;
  } catch (error) {
    console.warn('[HTML Renderer] Failed to render React component, falling back to generated HTML:', error);
  }
  
  console.log('========================================');
  console.log('[HTML Renderer] CRITICAL: Template Rendering');
  console.log('Received Options:', {
    templateId: options.templateId,
    templateType: options.templateType,
    colorThemeId: options.colorThemeId
  });
  console.log('Final Template Type:', templateType);
  console.log('Is Attractive Template:', isAttractiveTemplate);
  console.log('========================================');
  
  const getName = () => cvData.personalInfo?.fullName || cvData.personalInfo?.name || '';
  const getEmail = () => cvData.personalInfo?.email || '';
  const getPhone = () => cvData.personalInfo?.phone || '';
  const getLocation = () => cvData.personalInfo?.location || '';
  const getSummary = () => cvData.professionalSummary || cvData.summary || '';

  const labels = {
    summary: isRTL ? 'الملخص المهني' : 'Professional Summary',
    experience: isRTL ? 'الخبرة المهنية' : 'Professional Experience',
    education: isRTL ? 'التعليم' : 'Education',
    skills: isRTL ? 'المهارات' : 'Skills',
    languages: isRTL ? 'اللغات' : 'Languages',
    certifications: isRTL ? 'الشهادات والدورات' : 'Certifications & Courses',
    present: isRTL ? 'الآن' : 'Present',
    gpa: isRTL ? 'المعدل' : 'GPA',
  };

  // Generate skills HTML
  const renderSkills = () => {
    if (!cvData.skills) return '';
    
    let skillsList: string[] = [];
    
    if (Array.isArray(cvData.skills)) {
      // Handle array format - can be strings or objects with skillsList
      cvData.skills.forEach((s: any) => {
        if (typeof s === 'string') {
          skillsList.push(s);
        } else if (s.skillsList && Array.isArray(s.skillsList)) {
          skillsList.push(...s.skillsList);
        } else if (s.name) {
          skillsList.push(s.name);
        }
      });
    } else if (typeof cvData.skills === 'object') {
      // Handle object format { technical: [], soft: [], tools: [] }
      if (cvData.skills.technical?.length) {
        skillsList.push(...cvData.skills.technical);
      }
      if (cvData.skills.soft?.length) {
        skillsList.push(...cvData.skills.soft);
      }
      if (cvData.skills.tools?.length) {
        skillsList.push(...cvData.skills.tools);
      }
      // Also handle if it's already in normalized format
      if (!skillsList.length && cvData.skills.skillsList) {
        skillsList = Array.isArray(cvData.skills.skillsList) 
          ? cvData.skills.skillsList 
          : [];
      }
    }
    
    // Filter out empty strings
    skillsList = skillsList.filter(s => s && typeof s === 'string' && s.trim());
    
    if (skillsList.length === 0) return '';
    
    const skillsHTML = isSimpleProfessional 
      ? `<div style="font-size: 10pt; color: #5D6064; line-height: 1.6;">${skillsList.join(' • ')}</div>`
      : skillsList.map((skill: string) => `<span class="skill-tag">${skill}</span>`).join('');
    
    return `
      <div class="cv-section" style="${isSimpleProfessional ? 'margin-bottom: 15px;' : ''}">
        <h2 class="section-header" style="${isSimpleProfessional ? 'font-size: 11pt; font-weight: bold; color: #2C2C2C; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; line-height: 1.3; margin-top: 0;' : ''}">${labels.skills}</h2>
        ${skillsHTML}
      </div>
    `;
  };

  // Generate languages HTML
  const renderLanguages = () => {
    if (!cvData.languages?.length) return '';
    
    const langItems = cvData.languages.map((lang: any) => {
      if (typeof lang === 'string') {
        return `<span class="language-item"><span class="language-name">${lang}</span></span>`;
      }
      const name = lang.name || lang.language || '';
      const level = lang.level || lang.proficiency || '';
      return `<span class="language-item">
        <span class="language-name">${name}</span>
        ${level ? `<span class="language-level"> (${level})</span>` : ''}
      </span>`;
    }).filter(Boolean);
    
    let langContent = langItems.join('');
    if (isMinimalistClean) {
      const langNames = cvData.languages.map((lang: any) => {
        if (typeof lang === 'string') return lang;
        const name = lang.name || lang.language || '';
        const level = lang.level || '';
        return `${name}${level ? ` (${level})` : ''}`;
      }).filter(Boolean);
      langContent = `<ul style="margin-left: 20px; padding-left: 0; font-size: 10pt; color: #333333; line-height: 1.8;">
        ${langNames.map(lang => `<li style="margin-bottom: 4px; list-style-type: disc;">${lang}</li>`).join('')}
      </ul>`;
    } else if (isSimpleProfessional) {
      const langStyle = langItems.map(l => l.replace(/<[^>]*>/g, '')).join(' • ');
      langContent = `<div style="font-size: 10pt; color: #5D6064; line-height: 1.6;">${langStyle}</div>`;
    }
    
    const sectionHeaderStyle = isMinimalistClean 
      ? 'font-size: 12pt; font-weight: bold; color: #000000; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;'
      : isSimpleProfessional 
        ? 'font-size: 11pt; font-weight: bold; color: #2C2C2C; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; line-height: 1.3; margin-top: 0;'
        : '';
    
    return `
      <div class="cv-section" style="${isSimpleProfessional ? 'margin-bottom: 15px;' : ''}">
        <h2 class="section-header" style="${sectionHeaderStyle}">${labels.languages}</h2>
        <div class="languages-list" style="${isSimpleProfessional ? 'font-size: 10pt; color: #5D6064; line-height: 1.6;' : ''}">${langContent}</div>
      </div>
    `;
  };

  // Generate certifications HTML
  const renderCertifications = () => {
    const certs = cvData.certifications || cvData.courses || [];
    if (!certs.length) return '';
    
    const certItems = certs.map((cert: any) => {
      if (typeof cert === 'string') {
        return isMinimalistClean 
          ? `<li style="margin-bottom: 4px; list-style-type: disc;">${cert}</li>`
          : `<div class="cert-item"><span class="cert-name">${cert}</span></div>`;
      }
      const name = cert.name || cert.title || '';
      const issuer = cert.issuer || cert.organization || '';
      if (isMinimalistClean) {
        return `<li style="margin-bottom: 4px; list-style-type: disc;">${name}${issuer ? ` by ${issuer}` : ''}</li>`;
      }
      return `<div class="cert-item">
        <span class="cert-name">${name}</span>
        ${issuer ? `<span class="cert-issuer"> - ${issuer}</span>` : ''}
      </div>`;
    }).filter(Boolean);
    
    const sectionHeaderStyle = isMinimalistClean 
      ? 'font-size: 12pt; font-weight: bold; color: #000000; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;'
      : '';
    
    const certsContent = isMinimalistClean
      ? `<ul style="margin-left: 20px; padding-left: 0; font-size: 10pt; color: #333333; line-height: 1.8;">${certItems.join('')}</ul>`
      : certItems.join('');
    
    return `
      <div class="cv-section">
        <h2 class="section-header" style="${sectionHeaderStyle}">${labels.certifications}</h2>
        ${certsContent}
      </div>
    `;
  };

  // Generate experience HTML
  const renderExperience = () => {
    if (!cvData.experience?.length) return '';
    
    const expItems = cvData.experience.map((exp: any) => {
      const position = exp.position || exp.title || '';
      const company = exp.company || '';
      const location = exp.location || '';
      const startDate = exp.startDate || '';
      const endDate = exp.endDate || labels.present;
      const responsibilities = exp.responsibilities || exp.achievements || [];
      
      let responsibilitiesHTML = '';
      if (Array.isArray(responsibilities) && responsibilities.length > 0) {
        if (isMinimalistClean) {
          responsibilitiesHTML = `<div style="font-size: 10pt; color: #333333; line-height: 1.6;">
            ${responsibilities.map((r: string) => `<div style="margin-bottom: 4px;">${r}</div>`).join('')}
          </div>`;
        } else       if (isSimpleProfessional) {
        responsibilitiesHTML = `<ul style="margin-left: 20px; padding-left: 0; font-size: 10pt; color: #5D6064; line-height: 1.6; margin-top: 0; margin-bottom: 0;">
            ${responsibilities.map((r: string) => `<li style="margin-bottom: 4px; list-style-type: disc; list-style-position: outside;">${r}</li>`).join('')}
          </ul>`;
        } else {
          responsibilitiesHTML = `<ul class="bullet-list">
            ${responsibilities.map((r: string) => `<li>${r}</li>`).join('')}
          </ul>`;
        }
      } else if (exp.description) {
        const color = isMinimalistClean ? '#333333' : (isSimpleProfessional ? '#5D6064' : 'var(--cv-text-secondary)');
        responsibilitiesHTML = `<p style="font-size: 10pt; color: ${color}; line-height: 1.7;">${exp.description}</p>`;
      }
      
      if (isMinimalistClean) {
        return `<div style="margin-bottom: 16px; line-height: 1.8;">
          <div style="margin-bottom: 6px;">
            <h3 style="font-size: 11pt; font-weight: bold; color: #000000; margin-bottom: 4px;">${position}</h3>
            <div style="font-size: 10pt; font-weight: bold; color: #333333; margin-bottom: 4px;">${company}</div>
            ${startDate ? `<div style="font-size: 9pt; color: #666666; margin-bottom: 6px;">${startDate} - ${endDate}</div>` : ''}
          </div>
          ${responsibilitiesHTML}
        </div>`;
      }
      
      if (isSimpleProfessional) {
        return `<div style="margin-bottom: 14px; line-height: 1.6;">
          <div style="margin-bottom: 4px;">
            <span style="font-size: 10pt; font-weight: bold; color: #5D6064;">
              ${startDate} - ${endDate}
            </span>
          </div>
          <div style="margin-bottom: 4px;">
            <span style="font-size: 11pt; font-weight: bold; color: #2C2C2C;">
              ${company}
            </span>
            ${location ? `<span style="font-size: 10pt; color: #5D6064; margin-left: 8px;">| ${location}</span>` : ''}
          </div>
          <div style="font-size: 10pt; font-weight: bold; color: #2C2C2C; margin-bottom: 6px; font-style: italic;">
            ${position}
          </div>
          ${responsibilitiesHTML}
        </div>`;
      }
      
      return `<div class="cv-entry">
        <div class="entry-header">
          <span class="entry-title">${position}</span>
          <span class="entry-date">${startDate} - ${endDate}</span>
        </div>
        <div class="entry-subtitle">${company}${location ? ` | ${location}` : ''}</div>
        ${responsibilitiesHTML}
      </div>`;
    });
    
    return `
      <div class="cv-section allow-break">
        <h2 class="section-header" style="${isMinimalistClean ? 'font-size: 12pt; font-weight: bold; color: #000000; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;' : isSimpleProfessional ? 'font-size: 11pt; font-weight: bold; color: #2C2C2C; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; line-height: 1.3; margin-top: 0;' : ''}">${labels.experience}</h2>
        ${expItems.join('')}
      </div>
    `;
  };

  // Generate education HTML
  const renderEducation = () => {
    if (!cvData.education?.length) return '';
    
    const eduItems = cvData.education.map((edu: any) => {
      const institution = edu.institution || edu.school || '';
      const degree = edu.degree || '';
      const field = edu.field || edu.fieldOfStudy || '';
      const endDate = edu.endDate || edu.graduationYear || '';
      const startDate = edu.startDate || '';
      const gpa = edu.gpa || '';
      
      const description = edu.description || '';
      
      if (isMinimalistClean) {
        return `<div style="margin-bottom: 12px; line-height: 1.8;">
          <div style="font-size: 11pt; font-weight: bold; color: #000000; margin-bottom: 4px;">
            ${degree}${field ? ` in ${field}` : ''}
          </div>
          <div style="font-size: 10pt; color: #333333; margin-bottom: 4px;">${institution}</div>
          ${endDate ? `<div style="font-size: 9pt; color: #666666; font-style: italic;">${labels.present === 'Present' ? 'Graduated' : 'تخرج'}: ${endDate}</div>` : ''}
          ${description ? `<div style="font-size: 9pt; color: #333333; line-height: 1.5; margin-top: 3px;">${description}</div>` : ''}
        </div>`;
      }
      
      if (isSimpleProfessional) {
        return `<div style="margin-bottom: 12px; line-height: 1.6;">
          ${startDate ? `<div style="margin-bottom: 4px;">
            <span style="font-size: 10pt; font-weight: bold; color: #5D6064;">
              ${startDate} - ${endDate || labels.present}
            </span>
          </div>` : ''}
          <div style="font-size: 11pt; font-weight: bold; color: #2C2C2C; margin-bottom: 4px; text-transform: uppercase;">
            ${institution}
          </div>
          <div style="font-size: 10pt; color: #5D6064; margin-left: 8px; line-height: 1.5;">
            ${degree}${field ? ` - ${field}` : ''}${gpa ? ` | GPA: ${gpa}` : ''}
          </div>
          ${description ? `<div style="font-size: 9pt; color: #5D6064; line-height: 1.5; margin-top: 3px;">${description}</div>` : ''}
        </div>`;
      }
      
      return `<div class="cv-entry">
        <div class="entry-header">
          <span class="entry-title">${degree}${field ? (isRTL ? ` - ${field}` : ` in ${field}`) : ''}</span>
          ${endDate ? `<span class="entry-date">${startDate ? `${startDate} - ` : ''}${endDate}</span>` : ''}
        </div>
        <div class="entry-subtitle">
          ${institution}
          ${gpa ? ` | ${labels.gpa}: ${gpa}` : ''}
        </div>
        ${description ? `<div style="font-size: 9pt; color: var(--cv-text-secondary); line-height: 1.5; margin-top: 3px;">${description}</div>` : ''}
      </div>`;
    });
    
    return `
      <div class="cv-section">
        <h2 class="section-header" style="${isMinimalistClean ? 'font-size: 12pt; font-weight: bold; color: #000000; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;' : isSimpleProfessional ? 'font-size: 11pt; font-weight: bold; color: #2C2C2C; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; line-height: 1.3; margin-top: 0;' : ''}">${labels.education}</h2>
        ${eduItems.join('')}
      </div>
    `;
  };

  // Build complete HTML
  const html = `
<!DOCTYPE html>
<html lang="${isRTL ? 'ar' : 'en'}" dir="${direction}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CV - ${getName()}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Noto+Sans+Arabic:wght@400;600;700&family=Amiri:wght@400;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    /* Font face declarations for fallback */
    @font-face {
      font-family: 'Cairo';
      src: url('https://fonts.gstatic.com/s/cairo/v26/SLXGc1zY2K0URNToFfH-8tdJdFZdPXm0.woff2') format('woff2');
      font-weight: 400;
      font-display: swap;
    }
    
    @font-face {
      font-family: 'Noto Sans Arabic';
      src: url('https://fonts.gstatic.com/s/notosanskufiarnabic/v0/N0bU2SRelMxiyEKv60A9wyV-sRYCjzV_J-X0N9Ym0-lHQ_MvHbBmT0-Hyn4UGCF1Aw.0.woff2') format('woff2');
      font-weight: 400;
      font-display: swap;
    }

    :root {
      --cv-primary: ${colorTheme.primary};
      --cv-secondary: ${colorTheme.secondary};
      --cv-accent: ${colorTheme.accent};
      --cv-header-bg: ${colorTheme.headerBg};
      --cv-text-primary: ${colorTheme.textPrimary};
      --cv-text-secondary: ${colorTheme.textSecondary};
      --cv-border: ${colorTheme.border};
      --cv-font-family: ${isRTL ? "'Cairo', 'Noto Sans Arabic', 'Amiri', sans-serif" : "'Inter', Arial, sans-serif"};
      --cv-font-size: 11pt;
      --cv-line-height: 1.5;
    }
    
    @page {
      size: A4;
      margin: 15mm 15mm 20mm 15mm;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html, body {
      width: 210mm;
      min-height: 297mm;
      font-family: var(--cv-font-family);
      font-size: var(--cv-font-size);
      line-height: var(--cv-line-height);
      color: var(--cv-text-primary);
      background: white;
    }
    
    html[dir="rtl"] {
      direction: rtl;
      text-align: right;
    }
    
    html[dir="rtl"] body {
      unicode-bidi: embed;
    }
    
    @media print {
      html, body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
    
    .cv-container {
      width: 100%;
      max-width: 210mm;
      margin: 0 auto;
      padding: ${isSimpleProfessional ? '20mm' : '15mm'};
      font-family: ${isSimpleProfessional ? 'Arial, Helvetica, sans-serif' : 'var(--cv-font-family)'};
      color: ${isSimpleProfessional ? '#5D6064' : 'var(--cv-text-primary)'};
      font-size: ${isSimpleProfessional ? '10pt' : 'var(--cv-font-size)'};
      line-height: ${isSimpleProfessional ? '1.5' : 'var(--cv-line-height)'};
    }
    
    .cv-section {
      page-break-inside: avoid;
      break-inside: avoid;
      margin-bottom: 8mm;
    }
    
    .cv-section.allow-break {
      page-break-inside: auto;
      break-inside: auto;
    }
    
    .cv-entry {
      page-break-inside: avoid;
      break-inside: avoid;
      margin-bottom: 4mm;
    }

    h2, h3, h4 {
      page-break-after: avoid !important;
      break-after: avoid !important;
    }
    
    h2 + div, h2 + ul, h2 + ol, h2 + p,
    h3 + div, h3 + ul, h3 + ol, h3 + p {
      page-break-before: avoid !important;
      break-before: avoid !important;
    }

    li {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    p, li, span {
      orphans: 3;
      widows: 3;
    }
    
    .cv-header {
      text-align: center;
      margin-bottom: 8mm;
      padding-bottom: 5mm;
      border-bottom: 2px solid var(--cv-primary);
    }
    
    .cv-header.simple-professional {
      text-align: left;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #5D6064;
    }
    
    .cv-header.simple-professional h1 {
      font-size: 28pt;
      font-weight: bold;
      color: #2C2C2C;
      margin-bottom: 4px;
      letter-spacing: 0.5px;
      line-height: 1.1;
      margin-top: 0;
    }
    
    .cv-header.simple-professional h2 {
      font-size: 12pt;
      font-weight: normal;
      color: #5D6064;
      margin-top: 2px;
      margin-bottom: 0;
      text-transform: uppercase;
      letter-spacing: 1px;
      line-height: 1.2;
    }
    
    .cv-contact-right {
      text-align: right;
      font-size: 9pt;
      color: #5D6064;
      line-height: 1.6;
      flex-shrink: 0;
    }
    
    .cv-header h1 {
      font-size: 22pt;
      font-weight: 700;
      color: var(--cv-primary);
      margin-bottom: 3mm;
    }
    
    .cv-header-with-photo {
      text-align: ${isRTL ? 'right' : 'left'};
    }
    
    .cv-header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 15mm;
      ${isRTL ? 'flex-direction: row-reverse;' : ''}
    }
    
    .cv-header-text {
      flex: 1;
    }
    
    .cv-header-text h1 {
      text-align: ${isRTL ? 'right' : 'left'};
    }
    
    .cv-header-text .cv-contact-info {
      justify-content: ${isRTL ? 'flex-end' : 'flex-start'};
    }
    
    .cv-header-photo {
      flex-shrink: 0;
    }
    
    .profile-photo {
      width: 35mm;
      height: 35mm;
      border-radius: 5mm;
      object-fit: cover;
      border: 2px solid var(--cv-primary);
    }
    
    .cv-contact-info {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 10px;
      font-size: 10pt;
      color: var(--cv-text-secondary);
    }
    
    html[dir="rtl"] .cv-contact-info {
      flex-direction: row-reverse;
    }
    
    .cv-contact-divider {
      color: #cbd5e1;
    }
    
    .section-header {
      font-size: 12pt;
      font-weight: 700;
      color: var(--cv-primary);
      margin-bottom: 4mm;
      padding-bottom: 2mm;
      border-bottom: 1px solid var(--cv-border);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .cv-summary {
      font-size: 10pt;
      line-height: 1.6;
      color: var(--cv-text-primary);
      text-align: justify;
    }
    
    html[dir="rtl"] .cv-summary {
      text-align: right;
    }
    
    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 2mm;
    }
    
    html[dir="rtl"] .entry-header {
      flex-direction: row-reverse;
    }
    
    .entry-title {
      font-size: 11pt;
      font-weight: 600;
      color: var(--cv-primary);
    }
    
    .entry-date {
      font-size: 9pt;
      color: var(--cv-text-secondary);
    }
    
    .entry-subtitle {
      font-size: 10pt;
      color: var(--cv-text-secondary);
      margin-bottom: 2mm;
    }
    
    .bullet-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .bullet-list li {
      position: relative;
      padding-${isRTL ? 'right' : 'left'}: 12px;
      margin-bottom: 2mm;
      font-size: 10pt;
      line-height: 1.5;
    }
    
    .bullet-list li::before {
      content: "•";
      position: absolute;
      ${isRTL ? 'right' : 'left'}: 0;
      color: var(--cv-accent);
    }
    
    .skills-category {
      margin-bottom: 3mm;
    }
    
    .skills-category-name {
      font-weight: 600;
      font-size: 10pt;
      color: var(--cv-text-primary);
      margin-${isRTL ? 'left' : 'right'}: 3px;
    }
    
    .skills-list {
      font-size: 10pt;
      color: var(--cv-text-secondary);
    }
    
    .languages-list {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
    }
    
    .language-item {
      font-size: 10pt;
    }
    
    .language-name {
      font-weight: 600;
      color: var(--cv-text-primary);
    }
    
    .language-level {
      color: var(--cv-text-secondary);
      font-size: 9pt;
    }
    
    .cert-item {
      margin-bottom: 3mm;
    }
    
    .cert-name {
      font-weight: 600;
      font-size: 10pt;
      color: var(--cv-text-primary);
    }
    
    .cert-issuer {
      font-size: 9pt;
      color: var(--cv-text-secondary);
    }
    
    .cv-watermark {
      font-size: 10pt;
      color: #9ca3af;
      text-align: ${isRTL ? 'left' : 'right'};
      margin-top: 15mm;
      padding-top: 5mm;
      border-top: 1px solid #e5e7eb;
      font-style: italic;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="cv-container">
    <!-- Header -->
    ${isSimpleProfessional ? `
    <header class="cv-header simple-professional">
      <div style="margin-bottom: 12px; border-bottom: 2px solid #5D6064; padding-bottom: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div style="flex: 1; padding-right: 20px;">
            <h1 style="font-size: 28pt; font-weight: bold; color: #2C2C2C; margin-bottom: 4px; letter-spacing: 0.5px; line-height: 1.1; margin-top: 0; text-transform: uppercase; font-family: Arial, Helvetica, sans-serif;">${getName().toUpperCase()}</h1>
            ${cvData.personalInfo?.professionalTitle || cvData.personalInfo?.targetJobTitle ? `
            <h2 style="font-size: 12pt; font-weight: normal; color: #5D6064; margin-top: 2px; margin-bottom: 0; text-transform: uppercase; letter-spacing: 1px; line-height: 1.2; font-family: Arial, Helvetica, sans-serif;">${(cvData.personalInfo?.professionalTitle || cvData.personalInfo?.targetJobTitle || '').toUpperCase()}</h2>
            ` : ''}
          </div>
          <div style="text-align: right; font-size: 9pt; color: #5D6064; line-height: 1.6; flex-shrink: 0; font-family: Arial, Helvetica, sans-serif; white-space: nowrap;">
            ${getPhone() ? `<div style="margin-bottom: 2px;">${getPhone()}</div>` : ''}
            ${getEmail() ? `<div style="margin-bottom: 2px;">${getEmail()}</div>` : ''}
            ${getLocation() ? `<div>${getLocation()}</div>` : ''}
          </div>
        </div>
      </div>
    </header>
    ` : `
    <header class="cv-header" style="text-align: center;">
      <h1>${getName()}</h1>
      <div class="cv-contact-info">
        ${getLocation() ? `<span>${getLocation()}</span>` : ''}
        ${getLocation() && (getPhone() || getEmail()) ? '<span class="cv-contact-divider">|</span>' : ''}
        ${getPhone() ? `<span>${getPhone()}</span>` : ''}
        ${getPhone() && getEmail() ? '<span class="cv-contact-divider">|</span>' : ''}
        ${getEmail() ? `<span>${getEmail()}</span>` : ''}
      </div>
    </header>
    `}
    
    ${isSimpleProfessional ? `
    <!-- Two Column Layout for Simple Professional -->
    <div style="display: flex; gap: 15px; align-items: flex-start; width: 100%; box-sizing: border-box; margin-top: 12px;">
      <!-- Left Column -->
      <div style="flex: 1; min-width: 0; max-width: 50%; box-sizing: border-box;">
        <!-- Profile Section (Left) -->
        ${getSummary() ? `
        <div style="margin-bottom: 15px;">
          <h2 style="font-size: 11pt; font-weight: bold; color: #2C2C2C; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; line-height: 1.3; margin-top: 0;">${labels.summary}</h2>
          <p style="font-size: 10pt; color: #5D6064; line-height: 1.6; text-align: justify; margin-bottom: 0; margin-top: 0;">${getSummary()}</p>
        </div>
        ` : ''}
        
        <!-- Work Experience Section (Left) -->
        ${renderExperience()}
        
        <!-- Languages Section (Left) -->
        ${renderLanguages()}
      </div>
      
      <!-- Right Column -->
      <div style="flex: 1; min-width: 0; max-width: 50%; box-sizing: border-box;">
        <!-- Education Section (Right) -->
        ${renderEducation()}
        
        <!-- Skills Section (Right) -->
        ${renderSkills()}
      </div>
    </div>
    
    <!-- Certifications (Full Width) -->
    ${renderCertifications()}
    ` : `
    <!-- Single Column Layout for Other Templates -->
    <!-- Professional Summary -->
    ${getSummary() ? `
    <div class="cv-section" style="${isMinimalistClean ? 'margin-bottom: 15px;' : ''}">
      <h2 class="section-header" style="${isMinimalistClean ? 'font-size: 12pt; font-weight: bold; color: #000000; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;' : ''}">${labels.summary}</h2>
      <p class="cv-summary" style="${isMinimalistClean ? 'font-size: 10pt; color: #333333; line-height: 1.6; text-align: justify;' : ''}">${getSummary()}</p>
    </div>
    ` : ''}
    
    <!-- Experience -->
    ${renderExperience()}
    
    <!-- Education -->
    ${renderEducation()}
    
    <!-- Skills -->
    ${renderSkills()}
    
    <!-- Certifications -->
    ${renderCertifications()}
    
    <!-- Languages -->
    ${renderLanguages()}
    `}
    
    <!-- Watermark -->
    <div class="cv-watermark">CVin | Template: ${options.templateId || 'unknown'} | Type: ${templateType}</div>
  </div>
</body>
</html>
  `.trim();

  return html;
}

// Validate CV data before generation
export function validateCVForGeneration(cvData: CVData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check personal info
  if (!cvData.personalInfo?.name && !cvData.personalInfo?.fullName) {
    errors.push('Name is required');
  }
  if (!cvData.personalInfo?.email) {
    errors.push('Email is required');
  }
  if (!cvData.personalInfo?.phone) {
    errors.push('Phone number is required');
  }
  
  // Check summary
  if (!cvData.summary && !cvData.professionalSummary) {
    errors.push('Professional summary is required');
  }
  
  // Check education
  if (!cvData.education?.length) {
    errors.push('At least one education entry is required');
  }
  
  // Check skills
  const hasSkills = Array.isArray(cvData.skills) 
    ? cvData.skills.length > 0 
    : (cvData.skills?.technical?.length || cvData.skills?.soft?.length || cvData.skills?.tools?.length);
  if (!hasSkills) {
    errors.push('At least one skill is required');
  }
  
  // Check languages
  if (!cvData.languages?.length) {
    errors.push('At least one language is required');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Generate PDF filename
export function generatePDFFilename(cvData: CVData): string {
  const name = cvData.personalInfo?.fullName || cvData.personalInfo?.name || 'CV';
  const sanitizedName = name.replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, '').replace(/\s+/g, '-');
  return `CVin-${sanitizedName}-CV.pdf`;
}
