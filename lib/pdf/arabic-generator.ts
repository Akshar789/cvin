import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function generatePDFFromHTML(cvHTML: string, isRTL: boolean): Promise<Blob> {
  // Create temporary container
  const container = document.createElement('div');
  container.innerHTML = cvHTML;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.style.width = '210mm';
  container.style.backgroundColor = 'white';
  document.body.appendChild(container);

  try {
    // Convert HTML to canvas with proper rendering
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    // Create PDF from canvas
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate dimensions
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // Add image to PDF
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    return pdf.output('blob');
  } finally {
    document.body.removeChild(container);
  }
}

export function generateCVHTML(cvData: any, isRTL: boolean): string {
  const primaryColor = '#2c3e50';
  const textColor = '#374151';
  const bgColor = '#f9fafb';

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
    present: isRTL ? 'الآن' : 'Present'
  };

  let html = `
    <!DOCTYPE html>
    <html dir="${isRTL ? 'rtl' : 'ltr'}">
    <head>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', 'Arial', sans-serif;
          font-size: 11px;
          line-height: 1.6;
          color: ${textColor};
          background: white;
          padding: 20mm;
          direction: ${isRTL ? 'rtl' : 'ltr'};
          text-align: ${isRTL ? 'right' : 'left'};
        }
        .header {
          text-align: center;
          margin-bottom: 15mm;
          padding-bottom: 8mm;
          border-bottom: 2px solid ${primaryColor};
        }
        .name {
          font-size: 24px;
          font-weight: bold;
          color: ${primaryColor};
          margin-bottom: 5mm;
        }
        .contact {
          font-size: 10px;
          color: #666;
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .section {
          margin-bottom: 8mm;
        }
        .section-title {
          font-size: 12px;
          font-weight: bold;
          color: ${primaryColor};
          margin-bottom: 3mm;
          padding-bottom: 2mm;
          border-bottom: 1px solid #ddd;
        }
        .section-content {
          font-size: 11px;
        }
        .experience-item {
          margin-bottom: 5mm;
        }
        .position {
          font-weight: bold;
          font-size: 11px;
          color: ${primaryColor};
          display: flex;
          justify-content: space-between;
          margin-bottom: 1mm;
        }
        .company {
          font-size: 10px;
          color: #666;
          margin-bottom: 2mm;
        }
        .date {
          font-size: 9px;
          color: #999;
          font-style: italic;
        }
        .responsibility {
          margin: 1mm 0;
          padding: ${isRTL ? '0 0 0 10px' : '0 10px 0 0'};
          position: relative;
        }
        .responsibility:before {
          content: '•';
          ${isRTL ? 'margin-left: 5px;' : 'margin-right: 5px;'}
          color: ${primaryColor};
        }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
      <!-- Header -->
      <div class="header">
        <div class="name">${getName()}</div>
        <div class="contact">
          ${getLocation() ? `<span>${getLocation()}</span>` : ''}
          ${getPhone() ? `<span>|</span><span>${getPhone()}</span>` : ''}
          ${getEmail() ? `<span>|</span><span>${getEmail()}</span>` : ''}
        </div>
      </div>
  `;

  // Professional Summary
  if (getSummary()) {
    html += `
      <div class="section">
        <div class="section-title">${labels.summary}</div>
        <div class="section-content">
          ${getSummary()}
        </div>
      </div>
    `;
  }

  // Experience
  if (cvData.experience && Array.isArray(cvData.experience) && cvData.experience.length > 0) {
    html += `<div class="section"><div class="section-title">${labels.experience}</div>`;
    cvData.experience.forEach((exp: any) => {
      html += `
        <div class="experience-item">
          <div class="position">
            <span>${exp.position || 'Position'}</span>
            <span class="date">${exp.startDate || ''} - ${exp.endDate || labels.present}</span>
          </div>
          <div class="company">${exp.company || 'Company'}${exp.location ? ` | ${exp.location}` : ''}</div>
      `;
      if (exp.responsibilities && Array.isArray(exp.responsibilities)) {
        exp.responsibilities.forEach((resp: string) => {
          html += `<div class="responsibility">${resp}</div>`;
        });
      }
      html += `</div>`;
    });
    html += `</div>`;
  }

  // Education
  if (cvData.education && Array.isArray(cvData.education) && cvData.education.length > 0) {
    html += `<div class="section"><div class="section-title">${labels.education}</div>`;
    cvData.education.forEach((edu: any) => {
      html += `
        <div class="experience-item">
          <div class="position">
            <span>${edu.school || 'School'}</span>
            <span class="date">${edu.graduationYear || ''}</span>
          </div>
          <div class="company">${edu.degree || 'Degree'} ${edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}</div>
        </div>
      `;
    });
    html += `</div>`;
  }

  // Skills
  if (cvData.skills) {
    const skillsArray = Array.isArray(cvData.skills) ? cvData.skills : Object.values(cvData.skills).flat();
    if (skillsArray.length > 0) {
      html += `
        <div class="section">
          <div class="section-title">${labels.skills}</div>
          <div class="section-content">
            ${skillsArray.join(', ')}
          </div>
        </div>
      `;
    }
  }

  html += `
    </body>
    </html>
  `;

  return html;
}
