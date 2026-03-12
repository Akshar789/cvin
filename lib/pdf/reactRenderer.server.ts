/**
 * Server-side React-to-HTML Renderer for PDF Generation
 * 
 * This file is server-only and handles React component rendering
 * Uses runtime require to avoid Next.js bundler issues with react-dom/server
 */

// Server-only file - do not import in client components

import React from 'react';

// Import all template components
import SimpleProfessionalTemplate from '@/components/templates/SimpleProfessionalTemplate';
import MinimalistCleanTemplate from '@/components/templates/MinimalistCleanTemplate';
import ClassicTemplate from '@/components/templates/ClassicTemplate';
import ModernTemplate from '@/components/templates/ModernTemplate';
import ExecutiveTemplate from '@/components/templates/ExecutiveTemplate';
import CreativeTemplate from '@/components/templates/CreativeTemplate';
import ExecutiveCleanProTemplate from '@/components/templates/ExecutiveCleanProTemplate';
import StructuredSidebarProTemplate from '@/components/templates/StructuredSidebarProTemplate';
import GlobalProfessionalTemplate from '@/components/templates/GlobalProfessionalTemplate';
import ATSUltraProTemplate from '@/components/templates/ATSUltraProTemplate';
import SmartTemplate from '@/components/templates/SmartTemplate';
import StrongTemplate from '@/components/templates/StrongTemplate';
import ElegantTemplate from '@/components/templates/ElegantTemplate';
import CompactTemplate from '@/components/templates/CompactTemplate';
import TwoColumnProTemplate from '@/components/templates/TwoColumnProTemplate';
import CleanModernTemplate from '@/components/templates/CleanModernTemplate';
import ProfessionalEdgeTemplate from '@/components/templates/ProfessionalEdgeTemplate';
import MetroTemplate from '@/components/templates/MetroTemplate';
import FreshStartTemplate from '@/components/templates/FreshStartTemplate';
import NordicTemplate from '@/components/templates/NordicTemplate';

const TEMPLATE_MAP: Record<string, any> = {
  'classic': ClassicTemplate,
  'classic-ats': ClassicTemplate,
  'ats-optimized': ClassicTemplate,
  'ats': ClassicTemplate,
  'simple-professional': SimpleProfessionalTemplate,
  'simple': SimpleProfessionalTemplate,
  'minimalist-clean': MinimalistCleanTemplate,
  'minimalist': MinimalistCleanTemplate,
  'white-minimalist': MinimalistCleanTemplate,
  'modern': ModernTemplate,
  'executive': ExecutiveTemplate,
  'creative': CreativeTemplate,
  'executive-clean-pro': ExecutiveCleanProTemplate,
  'structured-sidebar-pro': StructuredSidebarProTemplate,
  'global-professional': GlobalProfessionalTemplate,
  'ats-ultra-pro': ATSUltraProTemplate,
  'smart': SmartTemplate,
  'strong': StrongTemplate,
  'elegant': ElegantTemplate,
  'compact': CompactTemplate,
  'two-column-pro': TwoColumnProTemplate,
  'clean-modern': CleanModernTemplate,
  'professional-edge': ProfessionalEdgeTemplate,
  'metro': MetroTemplate,
  'fresh-start': FreshStartTemplate,
  'nordic': NordicTemplate,
};

interface CVData {
  title?: string;
  personalInfo: {
    name?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    professionalTitle?: string;
    targetJobTitle?: string;
    photo?: string;
    linkedin?: string;
    website?: string;
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
    description?: string;
    achievements?: string[];
    responsibilities?: string[];
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
    summary?: string;
  }>;
  skills?: Array<{
    category?: string;
    skillsList: string[];
  }> | Array<string>;
  languages?: Array<{
    name?: string;
    language?: string;
    level?: string;
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

/**
 * Render React template component to HTML string
 */
export function renderTemplateToHTML(
  templateId: string,
  cvData: CVData,
  settings?: {
    primaryColor?: string;
    accentColor?: string;
    headerBg?: string;
    photoUrl?: string;
  }
): string {
  const isRTL = cvData.isRTL || cvData.cvLanguage === 'ar';
  
  const normalizedData = {
    title: cvData.title || '',
    personalInfo: {
      name: cvData.personalInfo?.name || '',
      fullName: cvData.personalInfo?.fullName || cvData.personalInfo?.name || '',
      email: cvData.personalInfo?.email || '',
      phone: cvData.personalInfo?.phone || '',
      location: cvData.personalInfo?.location || '',
      professionalTitle: cvData.personalInfo?.professionalTitle || cvData.personalInfo?.targetJobTitle || '',
      targetJobTitle: cvData.personalInfo?.targetJobTitle || cvData.personalInfo?.professionalTitle || '',
      targetJobDomain: (cvData.personalInfo as any)?.targetJobDomain || '',
      nationality: (cvData.personalInfo as any)?.nationality || '',
      photo: cvData.personalInfo?.photo || settings?.photoUrl,
      linkedin: cvData.personalInfo?.linkedin,
      website: cvData.personalInfo?.website,
    },
    summary: cvData.summary || cvData.professionalSummary || '',
    professionalSummary: cvData.professionalSummary || cvData.summary || '',
    experience: cvData.experience || [],
    education: cvData.education || [],
    skills: cvData.skills || [],
    languages: cvData.languages || [],
    certifications: cvData.certifications || cvData.courses || [],
  };

  let defaultPrimaryColor = '#2563eb';
  if (templateId === 'minimalist-clean' || templateId === 'minimalist') {
    defaultPrimaryColor = '#B8860B';
  } else if (templateId === 'simple-professional' || templateId === 'simple') {
    defaultPrimaryColor = '#333333';
  }
  
  let finalPrimaryColor = defaultPrimaryColor;
  if (settings?.primaryColor && typeof settings.primaryColor === 'string' && settings.primaryColor.trim()) {
    finalPrimaryColor = settings.primaryColor.trim();
    if (!finalPrimaryColor.startsWith('#')) {
      finalPrimaryColor = '#' + finalPrimaryColor;
    }
  }
  
  const normalizedTemplateId = templateId.toLowerCase().trim();

  const COLORED_HEADER_TEMPLATES = new Set([
    'two-column-pro', 'modern', 'creative', 'creative-bold',
    'executive', 'executive-clean-pro', 'structured-sidebar-pro',
    'global-professional', 'smart', 'strong', 'elegant',
  ]);
  const needsColoredHeader = COLORED_HEADER_TEMPLATES.has(normalizedTemplateId);

  const templateSettings = {
    primaryColor: finalPrimaryColor,
    accentColor: settings?.accentColor || '#333333',
    headerBg: settings?.headerBg && settings.headerBg !== '#ffffff'
      ? settings.headerBg
      : (needsColoredHeader ? undefined : '#ffffff'),
    photoUrl: settings?.photoUrl || normalizedData.personalInfo.photo,
  };
  
  console.log('[React Renderer] Template settings:', {
    templateId,
    receivedPrimaryColor: settings?.primaryColor,
    finalPrimaryColor: templateSettings.primaryColor,
    headerBg: templateSettings.headerBg,
    needsColoredHeader,
  });

  const TemplateComponent = TEMPLATE_MAP[normalizedTemplateId] || SimpleProfessionalTemplate;

  if (!TEMPLATE_MAP[normalizedTemplateId]) {
    console.warn(`Unknown template ID: ${templateId}, falling back to simple-professional`);
  }

  const component = React.createElement(TemplateComponent, {
    data: normalizedData,
    previewMode: false,
    isArabic: isRTL,
    settings: templateSettings,
  });

  let htmlContent: string;
  try {
    const ReactDOMServer = require('react-dom/server');
    htmlContent = ReactDOMServer.renderToString(component);
  } catch (error: any) {
    throw new Error(`Failed to render React component to HTML: ${error.message}`);
  }

  const fontFamily = isRTL 
    ? "'Cairo', 'Noto Sans Arabic', 'Amiri', Arial, sans-serif" 
    : "Arial, Helvetica, sans-serif";

  return `<!DOCTYPE html>
<html lang="${isRTL ? 'ar' : 'en'}" dir="${isRTL ? 'rtl' : 'ltr'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CV</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&family=Noto+Sans+Arabic:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html, body {
      width: 210mm;
      min-height: 297mm;
      margin: 0;
      padding: 0;
      font-family: ${fontFamily};
    }

    ${isRTL ? `
    html {
      direction: rtl;
      text-align: right;
    }
    body {
      unicode-bidi: embed;
    }
    ` : ''}

    /* ============================================================
       SMART PAGE BREAK RULES
       Targets data-cv-section attributes used by all templates
       ============================================================ */

    /* Keep section headings glued to their content */
    h1, h2, h3, h4, h5 {
      page-break-after: avoid !important;
      break-after: avoid !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    /* Keep first child after headings on same page */
    h1 + *, h2 + *, h3 + *, h4 + * {
      page-break-before: avoid !important;
      break-before: avoid !important;
    }

    /* Universal heading-to-content glue that works for all template patterns:
       - Templates using <h2> directly (CleanModern, Metro, etc.)
       - Templates using a <div> wrapper around a <span> heading (FreshStart)
       The first direct child of any section should never have a page break
       after it, and the second child should never have a break before it. */
    [data-cv-section] > *:first-child {
      page-break-after: avoid !important;
      break-after: avoid !important;
    }
    [data-cv-section] > *:nth-child(2) {
      page-break-before: avoid !important;
      break-before: avoid !important;
    }

    /* ============================================================
       SECTION CONTAINERS — allow natural flow between sections.
       Never apply break-inside:avoid to whole sections; this causes
       entire sections to jump to the next page leaving large gaps.
       ============================================================ */
    [data-cv-section] {
      page-break-inside: auto;
      break-inside: auto;
    }

    /* Header / summary — small blocks, safe to keep together */
    [data-cv-section="personalInfo"],
    [data-cv-section="summary"] {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    /* ============================================================
       ATOMIC ENTRY RULES — these are the units that must NEVER split.
       Applied at the entry level, not the section level.
       ============================================================ */

    /* Each experience entry (direct child div of the section) */
    [data-cv-section="experience"] > div,
    [data-cv-section="education"] > div {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    /* Each individual certification/language/course item */
    [data-cv-section="certifications"] > div,
    [data-cv-section="certifications"] > p,
    [data-cv-section="certifications"] > li,
    [data-cv-section="languages"] > div,
    [data-cv-section="languages"] > p,
    [data-cv-section="languages"] > li,
    [data-cv-section="courses"] > div,
    [data-cv-section="courses"] > p,
    [data-cv-section="courses"] > li {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    /* Skills — keep each skill category row together, but allow
       the section to start wherever it naturally falls */
    [data-cv-section="skills"] > div,
    [data-cv-section="skills"] > p {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    /* Generic list items */
    li {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    /* Some templates wrap section headings in a div (e.g. heading + decorative line).
       Keep the ul/ol content connected to that wrapper div — prevents a page break
       slipping between the section-header-wrapper-div and its list content. */
    [data-cv-section] > div + ul,
    [data-cv-section] > div + ol {
      page-break-before: avoid !important;
      break-before: avoid !important;
    }

    /* Orphan / widow control for paragraphs */
    p {
      orphans: 2;
      widows: 2;
    }

    /* ============================================================
       PRINT MEDIA — mirror all rules for Puppeteer
       ============================================================ */
    @media print {
      html, body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }

      h1, h2, h3, h4, h5 {
        page-break-after: avoid !important;
        break-after: avoid !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }

      h1 + *, h2 + *, h3 + *, h4 + * {
        page-break-before: avoid !important;
        break-before: avoid !important;
      }

      [data-cv-section] > *:first-child {
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
      [data-cv-section] > *:nth-child(2) {
        page-break-before: avoid !important;
        break-before: avoid !important;
      }

      [data-cv-section="personalInfo"],
      [data-cv-section="summary"] {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }

      [data-cv-section="experience"] > div,
      [data-cv-section="education"] > div {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }

      [data-cv-section="certifications"] > div,
      [data-cv-section="certifications"] > p,
      [data-cv-section="certifications"] > li,
      [data-cv-section="languages"] > div,
      [data-cv-section="languages"] > p,
      [data-cv-section="languages"] > li,
      [data-cv-section="courses"] > div,
      [data-cv-section="courses"] > p,
      [data-cv-section="courses"] > li {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }

      [data-cv-section="skills"] > div,
      [data-cv-section="skills"] > p {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }

      li {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }

      [data-cv-section] > div + ul,
      [data-cv-section] > div + ol {
        page-break-before: avoid !important;
        break-before: avoid !important;
      }

      p {
        orphans: 2;
        widows: 2;
      }
    }
  </style>
</head>
<body>
  ${htmlContent}
</body>
</html>`;
}

