/**
 * PDF Generator
 * 
 * Uses Puppeteer for high-quality PDF generation with:
 * - Full Arabic font support
 * - Multi-page rendering with proper page breaks
 * - Template-based HTML generation
 * - A4 format (210mm x 297mm)
 */

import puppeteer from 'puppeteer-core';
import { generateCVHTML, validateCVForGeneration, generatePDFFilename } from './htmlRenderer';
import { getColorTheme } from '@/config/templates';

interface CVData {
  personalInfo: {
    name?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    photoUrl?: string;
    professionalTitle?: string;
  };
  summary?: string;
  professionalSummary?: string;
  experience?: any[];
  education?: any[];
  skills?: any;
  languages?: any[];
  certifications?: any[];
  courses?: any[];
  cvLanguage?: string;
  isRTL?: boolean;
}

interface TemplateOptions {
  cssStyles?: {
    fontFamily?: string;
    fontSize?: string;
    colors?: { primary?: string };
    direction?: string;
  };
  templateId?: string;
  colorThemeId?: string;
  templateType?: 'ats' | 'attractive';
  includePhoto?: boolean;
  photoUrl?: string;
  primaryColor?: string;
}

/**
 * Generate PDF using Puppeteer with HTML rendering
 * Supports multi-page CVs with proper page breaks
 */
export async function generatePDF(cvData: CVData, template: TemplateOptions = {}): Promise<Blob> {
  let browser = null;
  
  try {
    // Generate HTML content
    const html = generateCVHTML(cvData, {
      templateId: template.templateId,
      colorThemeId: template.colorThemeId,
      cvLanguage: cvData.cvLanguage,
      templateType: template.templateType,
      includePhoto: template.includePhoto,
      photoUrl: template.photoUrl,
      primaryColor: template.primaryColor,
    });

    // Launch Puppeteer with system Chromium or fallback
    const chromiumPath = process.env.CHROMIUM_PATH || '/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium';
    
    const launchOptions: any = {
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      defaultViewport: { width: 794, height: 1123 }, // A4 at 96 DPI
      headless: true,
    };
    
    // Only set executablePath if it exists (for Nix environments)
    // Otherwise let Puppeteer use bundled Chromium
    try {
      const fs = require('fs');
      if (fs.existsSync(chromiumPath)) {
        launchOptions.executablePath = chromiumPath;
      }
    } catch (e) {
      // If fs check fails, proceed without explicit path
      console.warn('[PDF Generator] Could not verify Chromium path, using default');
    }
    
    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();

    // Set content with proper encoding and longer network wait
    await page.setContent(html, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Wait for fonts to load with timeout
    try {
      await Promise.race([
        page.evaluateHandle('document.fonts.ready'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Font load timeout')), 5000))
      ]);
    } catch (e) {
      console.warn('[PDF Generator] Font loading timeout, proceeding with available fonts');
    }

    // Additional wait for rendering
    await new Promise(resolve => setTimeout(resolve, 800));

    // --- Pass 1: Apply keep-together rules to individual entries (not whole sections) ---
    // Key insight: break-inside:avoid on WHOLE sections causes large gaps because the
    // browser jumps the entire section to the next page. Apply it only to atomic units.
    await page.evaluate(() => {
      const avoidBreak = (el: Element) => {
        const h = el as HTMLElement;
        h.style.pageBreakInside = 'avoid';
        h.style.breakInside = 'avoid';
      };

      // Header and summary — always keep together (small, safe)
      document.querySelectorAll('[data-cv-section="personalInfo"], [data-cv-section="summary"]')
        .forEach(avoidBreak);

      // Experience entries — each job block is a direct child of the section
      document.querySelectorAll('[data-cv-section="experience"] > div')
        .forEach(avoidBreak);

      // Education entries — each education block is a direct child of the section
      document.querySelectorAll('[data-cv-section="education"] > div')
        .forEach(avoidBreak);

      // Individual items within small sections — keep each item together but
      // do NOT keep the whole section together (that causes section-level jumps)
      ['certifications', 'languages', 'courses', 'skills'].forEach(sec => {
        document.querySelectorAll(`[data-cv-section="${sec}"] > div,
          [data-cv-section="${sec}"] > p,
          [data-cv-section="${sec}"] > li`)
          .forEach(avoidBreak);
      });

      // List items and flex tag rows — never split
      document.querySelectorAll('li').forEach(avoidBreak);
      document.querySelectorAll('[style*="flex-wrap"], [style*="flexWrap"]').forEach(avoidBreak);
    });

    // Switch to print media so layout matches actual PDF output, then measure
    await (page as any).emulateMediaType('print');
    await new Promise(resolve => setTimeout(resolve, 600));

    // --- Pass 2: Position-based smart orphan + split detection ---
    // A4 at 96 dpi = 1122.519685... px per page.
    //
    // KEY DESIGN CHOICES:
    //   • All element positions are measured in a single batch BEFORE any DOM
    //     mutations.  If we mutate (pageBreakBefore = 'always') and then call
    //     getBoundingClientRect() again in the same evaluate() call the browser
    //     hasn't yet reflowed, so the rect is stale.  Batch-measuring first
    //     eliminates stale-position bugs entirely.
    //   • We detect two types of "heading" elements:
    //       – Direct <h1..h5> children of a [data-cv-section] container
    //       – Direct <div> first-children that are short (< 50 px) — these are
    //         heading-wrapper divs used by some templates (e.g. FreshStart).
    //   • When we force a heading to the next page we also set breakBefore:avoid
    //     on its immediate next sibling so it travels with the heading.
    //   • Entries (experience/education/etc. blocks) are checked for orphan zone
    //     and boundary-straddle conditions.
    await page.evaluate(() => {
      const PAGE_H = 1122.52;  // A4 @ 96 dpi
      const ORPHAN  = 130;     // px — too little space to start a new heading/entry

      const forceNextPage = (el: HTMLElement) => {
        el.style.pageBreakBefore = 'always';
        el.style.breakBefore = 'page';
        el.style.marginTop = '0';
      };

      const softAvoidBefore = (el: HTMLElement | null) => {
        if (!el) return;
        // Only set if not already forced to a new page by another rule
        if (!el.style.pageBreakBefore || el.style.pageBreakBefore === 'auto') {
          el.style.pageBreakBefore = 'avoid';
          el.style.breakBefore = 'avoid';
        }
      };

      // ── 1. Collect elements ───────────────────────────────────────────────────

      // Direct <h*> children of section containers
      const headingEls = Array.from(document.querySelectorAll(
        '[data-cv-section] > h1, [data-cv-section] > h2, [data-cv-section] > h3, ' +
        '[data-cv-section] > h4, [data-cv-section] > h5'
      )) as HTMLElement[];

      // All direct first-child <div>s of section containers (potential heading wrappers)
      const firstChildDivs = Array.from(
        document.querySelectorAll('[data-cv-section] > div:first-child')
      ) as HTMLElement[];

      // Atomic content entries
      const entryEls = Array.from(document.querySelectorAll(
        '[data-cv-section="experience"] > div, ' +
        '[data-cv-section="education"] > div, ' +
        '[data-cv-section="certifications"] > div, ' +
        '[data-cv-section="certifications"] > p, ' +
        '[data-cv-section="languages"] > div, ' +
        '[data-cv-section="languages"] > p, ' +
        '[data-cv-section="courses"] > div, ' +
        '[data-cv-section="skills"] > div'
      )) as HTMLElement[];

      // ── 2. Pre-measure ALL positions before ANY mutations ─────────────────────
      // Force a synchronous reflow so every rect is fresh and consistent.
      void document.body.getBoundingClientRect();

      const rectOf = new Map<HTMLElement, DOMRect>();
      [...headingEls, ...firstChildDivs, ...entryEls].forEach(el => {
        rectOf.set(el, el.getBoundingClientRect());
      });

      // Now filter firstChildDivs to only those that look like heading wrappers:
      // short height (< 50 px) means it contains only a label/span, not a full entry.
      const headingWrapperDivs = firstChildDivs.filter(div => {
        const r = rectOf.get(div);
        return r && r.height > 0 && r.height < 50;
      });

      // Combined heading set for dedup checks
      const headingSet = new Set<HTMLElement>([...headingEls, ...headingWrapperDivs]);

      // ── 3. Process headings (h1..h5 + heading-wrapper divs) ──────────────────
      headingSet.forEach(el => {
        const rect = rectOf.get(el);
        if (!rect) return;

        const posInPage = rect.top % PAGE_H;
        const spaceLeft = PAGE_H - posInPage;

        if (spaceLeft < ORPHAN && posInPage > 15) {
          forceNextPage(el);
          // Companion: keep the very next sibling with this heading
          softAvoidBefore(el.nextElementSibling as HTMLElement | null);
        }
      });

      // ── 4. Process atomic entries — orphan + boundary-straddle ───────────────
      entryEls.forEach(el => {
        // Skip elements that are also classified as heading wrappers
        if (headingSet.has(el)) return;

        const rect = rectOf.get(el);
        if (!rect || rect.height === 0) return;

        const posInPage = rect.top % PAGE_H;
        const spaceLeft = PAGE_H - posInPage;

        // (a) Orphan zone — too little room to even start this entry
        if (spaceLeft < ORPHAN && posInPage > 15) {
          forceNextPage(el);
          return;
        }

        // (b) Boundary straddle — entry starts past the 45% mark on the page
        //     AND its bottom would cross the page boundary.  Since each entry
        //     has break-inside:avoid, the browser would try to split it despite
        //     the rule; proactively move it to the next page instead.
        if (posInPage > PAGE_H * 0.45 && posInPage + rect.height > PAGE_H) {
          forceNextPage(el);
        }
      });
    });

    // Short settle after DOM mutations before PDF capture
    await new Promise(resolve => setTimeout(resolve, 400));

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
      },
      preferCSSPageSize: true,
      displayHeaderFooter: false,
    });

    await browser.close();
    browser = null;

    // Convert Buffer to Blob - ensure proper ArrayBuffer type
    const arrayBuffer = Buffer.from(pdfBuffer).buffer;
    return new Blob([new Uint8Array(arrayBuffer)], { type: 'application/pdf' });

  } catch (error) {
    console.error('[PDF Generator] Error:', error);
    
    // Fallback to simple jsPDF if Puppeteer fails
    return generateFallbackPDF(cvData, template);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Fallback PDF generator using jsPDF (for when Puppeteer is unavailable)
 */
async function generateFallbackPDF(cvData: CVData, template: TemplateOptions): Promise<Blob> {
  const { default: jsPDF } = await import('jspdf');
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const isRTL = template.cssStyles?.direction === 'rtl' || cvData.isRTL;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (2 * margin);
  let y = margin;

  const primaryColor = { r: 44, g: 62, b: 80 };
  const textColor = { r: 55, g: 65, b: 81 };
  const lightGray = { r: 128, g: 128, b: 128 };

  const getName = () => cvData.personalInfo?.fullName || cvData.personalInfo?.name || '';
  const getEmail = () => cvData.personalInfo?.email || '';
  const getPhone = () => cvData.personalInfo?.phone || '';
  const getLocation = () => cvData.personalInfo?.location || '';
  const getSummary = () => cvData.professionalSummary || cvData.summary || '';

  const checkPageBreak = (requiredSpace: number) => {
    if (y + requiredSpace > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const setNormalFont = () => {
    doc.setFont('helvetica', 'normal');
  };

  const setBoldFont = () => {
    doc.setFont('helvetica', 'bold');
  };

  const drawText = (text: string, xOffset: number = 0, fontSize: number = 10, bold: boolean = false) => {
    doc.setFontSize(fontSize);
    if (bold) setBoldFont();
    else setNormalFont();
    
    const lines = doc.splitTextToSize(text, contentWidth - xOffset);
    lines.forEach((line: string) => {
      checkPageBreak(fontSize / 2 + 2);
      
      const xPos = isRTL ? pageWidth - margin - xOffset : margin + xOffset;
      doc.text(line, xPos, y, { align: isRTL ? 'right' : 'left' });
      y += fontSize / 2.5;
    });
  };

  const drawSectionHeader = (title: string) => {
    checkPageBreak(15);
    y += 3;
    
    doc.setFontSize(12);
    setBoldFont();
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    
    const xPos = isRTL ? pageWidth - margin : margin;
    doc.text(title, xPos, y, { align: isRTL ? 'right' : 'left' });
    y += 4;
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  };

  // Header - Name
  if (cvData.personalInfo) {
    doc.setFontSize(22);
    setBoldFont();
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    
    const name = getName();
    const xPos = pageWidth / 2;
    doc.text(name, xPos, y, { align: 'center' });
    y += 10;

    doc.setFontSize(10);
    setNormalFont();
    doc.setTextColor(textColor.r, textColor.g, textColor.b);
    
    const contactItems = [
      getLocation(),
      getPhone(),
      getEmail()
    ].filter(Boolean);
    
    const contactLine = contactItems.join(' | ');
    doc.text(contactLine, pageWidth / 2, y, { align: 'center' });
    y += 12;
  }

  // Professional Summary
  if (getSummary()) {
    drawSectionHeader(isRTL ? 'الملخص المهني' : 'Professional Summary');
    
    doc.setFontSize(10);
    setNormalFont();
    doc.setTextColor(textColor.r, textColor.g, textColor.b);
    
    drawText(getSummary(), 0, 10, false);
    y += 3;
  }

  // Experience
  if (cvData.experience && Array.isArray(cvData.experience) && cvData.experience.length > 0) {
    drawSectionHeader(isRTL ? 'الخبرة المهنية' : 'Professional Experience');

    cvData.experience.forEach((exp: any) => {
      checkPageBreak(20);

      const position = exp.position || exp.title || 'Position';
      const dateText = `${exp.startDate || ''} - ${exp.endDate || (isRTL ? 'الآن' : 'Present')}`;
      
      doc.setFontSize(11);
      setBoldFont();
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      
      const xPos = isRTL ? pageWidth - margin : margin;
      doc.text(position, xPos, y, { align: isRTL ? 'right' : 'left' });
      y += 4;

      doc.setFontSize(9);
      setNormalFont();
      doc.setTextColor(lightGray.r, lightGray.g, lightGray.b);
      doc.text(dateText, xPos, y, { align: isRTL ? 'right' : 'left' });
      y += 4;

      doc.setFontSize(10);
      doc.setTextColor(textColor.r, textColor.g, textColor.b);
      
      const company = exp.company || '';
      const location = exp.location || '';
      const companyLine = location ? `${company} | ${location}` : company;
      drawText(companyLine, 0, 10, false);
      y += 2;

      const responsibilities = exp.responsibilities || exp.achievements || [];
      if (Array.isArray(responsibilities) && responsibilities.length > 0) {
        doc.setFontSize(9);
        setNormalFont();
        doc.setTextColor(textColor.r, textColor.g, textColor.b);
        
        responsibilities.forEach((resp: string) => {
          checkPageBreak(5);
          const bulletIndent = 5;
          const lines = doc.splitTextToSize(resp, contentWidth - bulletIndent);
          
          const xPosBullet = isRTL ? pageWidth - margin : margin;
          const xPosText = isRTL ? pageWidth - margin - bulletIndent : margin + bulletIndent;
          
          doc.text('•', xPosBullet, y, { align: isRTL ? 'right' : 'left' });
          lines.forEach((line: string, lineIdx: number) => {
            if (lineIdx > 0) {
              checkPageBreak(4);
              y += 4;
            } else {
              y += 4;
            }
            doc.text(line, xPosText, y - 4, { align: isRTL ? 'right' : 'left' });
          });
        });
      }
      y += 3;
    });
  }

  // Education
  if (cvData.education && Array.isArray(cvData.education) && cvData.education.length > 0) {
    drawSectionHeader(isRTL ? 'التعليم' : 'Education');

    cvData.education.forEach((edu: any) => {
      checkPageBreak(15);

      doc.setFontSize(11);
      setBoldFont();
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      
      const xPos = isRTL ? pageWidth - margin : margin;
      doc.text(edu.institution || edu.school || 'School', xPos, y, { align: isRTL ? 'right' : 'left' });
      y += 4;

      doc.setFontSize(9);
      setNormalFont();
      doc.setTextColor(textColor.r, textColor.g, textColor.b);
      const degreeText = `${edu.degree || 'Degree'}${edu.field || edu.fieldOfStudy ? ` in ${edu.field || edu.fieldOfStudy}` : ''} (${edu.endDate || edu.graduationYear || 'Year'})`;
      doc.text(degreeText, xPos, y, { align: isRTL ? 'right' : 'left' });
      y += 5;

      const eduDescription = edu.description || '';
      if (eduDescription) {
        checkPageBreak(5);
        doc.setFontSize(9);
        setNormalFont();
        doc.setTextColor(textColor.r, textColor.g, textColor.b);
        drawText(eduDescription, 0, 9, false);
        y += 2;
      }
    });
  }

  // Skills
  if (cvData.skills) {
    checkPageBreak(10);
    drawSectionHeader(isRTL ? 'المهارات' : 'Skills');

    doc.setFontSize(10);
    setNormalFont();
    doc.setTextColor(textColor.r, textColor.g, textColor.b);
    
    let skillsText = '';
    if (Array.isArray(cvData.skills)) {
      skillsText = cvData.skills.map((s: any) => typeof s === 'string' ? s : s.name || s.skillsList?.join(', ')).join(', ');
    } else if (typeof cvData.skills === 'object') {
      const skillsArray: string[] = [];
      for (const [key, value] of Object.entries(cvData.skills)) {
        if (Array.isArray(value)) {
          skillsArray.push(...value.map(v => typeof v === 'string' ? v : String(v)));
        }
      }
      skillsText = skillsArray.join(', ');
    }
    
    if (skillsText) {
      drawText(skillsText, 0, 10, false);
    }
  }

  // Languages
  if (cvData.languages && Array.isArray(cvData.languages) && cvData.languages.length > 0) {
    checkPageBreak(10);
    drawSectionHeader(isRTL ? 'اللغات' : 'Languages');

    doc.setFontSize(10);
    setNormalFont();
    doc.setTextColor(textColor.r, textColor.g, textColor.b);
    
    const langText = cvData.languages.map((l: any) => {
      if (typeof l === 'string') return l;
      if (typeof l === 'object' && (l.name || l.language)) {
        return `${l.name || l.language}${l.level || l.proficiency ? ` - ${l.level || l.proficiency}` : ''}`;
      }
      return String(l);
    }).filter(Boolean).join(', ');
    
    if (langText) {
      drawText(langText, 0, 10, false);
    }
  }

  // Certifications
  if (cvData.certifications && Array.isArray(cvData.certifications) && cvData.certifications.length > 0) {
    checkPageBreak(10);
    drawSectionHeader(isRTL ? 'الشهادات' : 'Certifications');

    cvData.certifications.forEach((cert: any) => {
      doc.setFontSize(10);
      setBoldFont();
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      
      const xPos = isRTL ? pageWidth - margin : margin;
      doc.text(cert.title || cert.name || 'Certification', xPos, y, { align: isRTL ? 'right' : 'left' });
      y += 4;

      doc.setFontSize(9);
      setNormalFont();
      doc.setTextColor(lightGray.r, lightGray.g, lightGray.b);
      const issuer = cert.issuer || cert.organization || '';
      if (issuer) {
        doc.text(issuer, xPos, y, { align: isRTL ? 'right' : 'left' });
        y += 4;
      }
      y += 2;
    });
  }

  return new Promise((resolve) => {
    const blob = doc.output('blob');
    resolve(blob);
  });
}

// Re-export utilities from htmlRenderer
export { generateCVHTML, validateCVForGeneration, generatePDFFilename } from './htmlRenderer';
