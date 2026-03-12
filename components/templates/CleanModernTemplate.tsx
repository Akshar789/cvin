import React from 'react';
import { getSectionBlurStyle } from './SectionBlur';
import { getExperienceHtml, getJobTitle } from './templateUtils';

interface CVData {
  title?: string;
  personalInfo?: {
    name?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    professionalTitle?: string;
    targetJobTitle?: string;
    targetJobDomain?: string;
    photo?: string;
    website?: string;
    linkedin?: string;
    nationality?: string;
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
    achievements?: string[];
  }>;
  skills?: Array<{
    category?: string;
    skillsList?: string[];
  }> | Array<string> | {
    technical?: string[];
    soft?: string[];
    tools?: string[];
  };
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

interface CleanModernTemplateProps {
  data: CVData;
  previewMode?: boolean;
  isArabic?: boolean;
  settings?: {
    primaryColor?: string;
    accentColor?: string;
    headerBg?: string;
    photoUrl?: string;
    activeSection?: string;
  };
}

export default function CleanModernTemplate({ data, previewMode = false, isArabic = false, settings }: CleanModernTemplateProps) {
  const personalInfo = data?.personalInfo || {};
  const experience = data?.experience || [];
  const education = data?.education || [];
  const skills = data?.skills;
  const languages = data?.languages || [];
  const certifications = data?.certifications || [];

  const activeSection = settings?.activeSection;

  const fullSummary = data?.professionalSummary || data?.summary || '';
  const fullName = personalInfo?.fullName || personalInfo?.name || 'Your Name';

  let primaryColor = '#0077B6';
  if (settings?.primaryColor && typeof settings.primaryColor === 'string' && settings.primaryColor.trim()) {
    primaryColor = settings.primaryColor.trim();
    if (!primaryColor.startsWith('#')) {
      primaryColor = '#' + primaryColor;
    }
  }
  const textColor = '#333333';
  const subtleColor = '#666666';

  let skillsList: string[] = [];
  if (skills) {
    if (Array.isArray(skills)) {
      if (skills.length > 0 && typeof skills[0] === 'string') {
        skillsList = skills as string[];
      } else {
        skillsList = (skills as any[]).flatMap(s =>
          Array.isArray(s?.skillsList) ? s.skillsList :
          (typeof s === 'string' ? [s] : [])
        );
      }
    } else if (typeof skills === 'object') {
      const skillsObj = skills as { technical?: string[]; soft?: string[]; tools?: string[] };
      skillsList = [
        ...(skillsObj.technical || []),
        ...(skillsObj.soft || []),
        ...(skillsObj.tools || [])
      ];
    }
  }

  let languagesList: Array<{ name: string; level?: string }> = [];
  if (Array.isArray(languages)) {
    languagesList = languages.map(lang => {
      if (typeof lang === 'string') {
        return { name: lang };
      }
      return {
        name: lang.name || lang.language || '',
        level: lang.level || lang.proficiency
      };
    }).filter(l => l.name);
  }

  let certsList: Array<{ name: string; issuer?: string; date?: string }> = [];
  if (Array.isArray(certifications)) {
    certsList = certifications.map(cert => {
      if (typeof cert === 'string') {
        return { name: cert };
      }
      return {
        name: cert.name || cert.title || '',
        issuer: cert.issuer || cert.organization || undefined,
        date: cert.date || undefined
      };
    }).filter(c => c.name);
  }

  const borderSide = isArabic ? 'borderRight' : 'borderLeft';
  const paddingSide = isArabic ? 'paddingRight' : 'paddingLeft';

  const sectionHeadingStyle: React.CSSProperties = {
    fontSize: '13pt',
    fontWeight: 700,
    color: primaryColor,
    marginBottom: '12px',
    marginTop: '0',
    [borderSide]: `4px solid ${primaryColor}`,
    [paddingSide]: '12px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    lineHeight: '1.3'
  };

  const contactItems = [
    personalInfo?.email,
    personalInfo?.phone,
    personalInfo?.location,
    personalInfo?.nationality,
    personalInfo?.linkedin
  ].filter(Boolean);

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`${previewMode ? 'scale-75 origin-top' : ''}`}
      style={{
        width: '210mm',
        minHeight: '297mm',
        fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
        padding: '20mm',
        color: textColor,
        fontSize: '10pt',
        lineHeight: '1.6',
        backgroundColor: '#FFFFFF',
        boxSizing: 'border-box',
        direction: isArabic ? 'rtl' : 'ltr'
      }}
    >
      <div data-cv-section="personalInfo" style={{
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: `2px solid ${primaryColor}`,
        ...getSectionBlurStyle('personalInfo', activeSection)
      }}>
        <h1 style={{
          fontSize: '28pt',
          fontWeight: 300,
          color: textColor,
          marginBottom: '4px',
          marginTop: '0',
          letterSpacing: '2px',
          lineHeight: '1.2'
        }}>
          {fullName}
        </h1>
        {getJobTitle(personalInfo, isArabic) && (
          <div style={{
            fontSize: '12pt',
            color: primaryColor,
            fontWeight: 500,
            marginBottom: '10px',
            letterSpacing: '0.5px'
          }}>
            {getJobTitle(personalInfo, isArabic)}
          </div>
        )}
        {contactItems.length > 0 && (
          <div style={{
            fontSize: '9pt',
            color: subtleColor,
            lineHeight: '1.6'
          }}>
            {contactItems.join('  |  ')}
          </div>
        )}
      </div>

      {fullSummary && (
        <div data-cv-section="summary" style={{ marginBottom: '24px', ...getSectionBlurStyle('summary', activeSection) }}>
          <h2 style={sectionHeadingStyle}>
            {isArabic ? 'الملخص المهني' : 'Professional Summary'}
          </h2>
          <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_b]:font-bold [&_i]:italic" style={{
            fontSize: '9.5pt',
            color: textColor,
            lineHeight: '1.7',
            textAlign: 'justify'
          }} dangerouslySetInnerHTML={{ __html: fullSummary }} />
        </div>
      )}

      {experience.length > 0 && (
        <div data-cv-section="experience" style={{ marginBottom: '24px', ...getSectionBlurStyle('experience', activeSection) }}>
          <h2 style={sectionHeadingStyle}>
            {isArabic ? 'الخبرة العملية' : 'Work Experience'}
          </h2>
          {experience.map((exp, idx) => {
            const experienceHtml = getExperienceHtml(exp);
            return (
              <div key={idx} style={{ marginBottom: '16px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '2px'
                }}>
                  <div style={{
                    fontSize: '11pt',
                    fontWeight: 600,
                    color: textColor
                  }}>
                    {exp.position || exp.title}
                  </div>
                  <div style={{
                    fontSize: '9pt',
                    color: subtleColor,
                    whiteSpace: 'nowrap'
                  }}>
                    {exp.startDate} – {exp.endDate || (isArabic ? 'الحاضر' : 'Present')}
                  </div>
                </div>
                <div style={{
                  fontSize: '9.5pt',
                  color: primaryColor,
                  fontWeight: 500,
                  marginBottom: '6px'
                }}>
                  {exp.company}
                  {exp.location && <span style={{ color: subtleColor, fontWeight: 400 }}> · {exp.location}</span>}
                </div>
                {experienceHtml && (
                  <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-1 [&_li]:mb-0.5 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic" style={{
                    fontSize: '9pt',
                    color: textColor,
                    lineHeight: '1.6'
                  }} dangerouslySetInnerHTML={{ __html: experienceHtml }} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {education.length > 0 && (
        <div data-cv-section="education" style={{ marginBottom: '24px', ...getSectionBlurStyle('education', activeSection) }}>
          <h2 style={sectionHeadingStyle}>
            {isArabic ? 'التعليم' : 'Education'}
          </h2>
          {education.map((edu, idx) => (
            <div key={idx} style={{ marginBottom: '14px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '2px'
              }}>
                <div style={{
                  fontSize: '10.5pt',
                  fontWeight: 600,
                  color: textColor
                }}>
                  {edu.degree}
                  {(edu.field || edu.fieldOfStudy) && ` – ${edu.field || edu.fieldOfStudy}`}
                </div>
                <div style={{
                  fontSize: '9pt',
                  color: subtleColor,
                  whiteSpace: 'nowrap'
                }}>
                  {edu.startDate && edu.endDate
                    ? `${edu.startDate} – ${edu.endDate}`
                    : edu.graduationYear || edu.endDate || ''
                  }
                </div>
              </div>
              <div style={{
                fontSize: '9.5pt',
                color: primaryColor,
                fontWeight: 500
              }}>
                {edu.institution || edu.school || ''}
              </div>
              {edu.gpa && (
                <div style={{ fontSize: '9pt', color: subtleColor, marginTop: '2px' }}>
                  GPA: {edu.gpa}
                </div>
              )}
              {edu.description && (
                <div style={{ fontSize: '9pt', color: textColor, lineHeight: '1.5', marginTop: '4px' }}>
                  {edu.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {skillsList.length > 0 && (
        <div data-cv-section="skills" style={{ marginBottom: '24px', ...getSectionBlurStyle('skills', activeSection) }}>
          <h2 style={sectionHeadingStyle}>
            {isArabic ? 'المهارات' : 'Skills'}
          </h2>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {skillsList.map((skill, idx) => (
              <span key={idx} style={{
                fontSize: '9pt',
                color: textColor,
                padding: '4px 12px',
                border: `1px solid ${primaryColor}33`,
                borderRadius: '4px',
                backgroundColor: `${primaryColor}08`,
                lineHeight: '1.4'
              }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {certsList.length > 0 && (
        <div data-cv-section="certifications" style={{ marginBottom: '24px', ...getSectionBlurStyle('certifications', activeSection) }}>
          <h2 style={sectionHeadingStyle}>
            {isArabic ? 'الشهادات' : 'Certifications'}
          </h2>
          {certsList.map((cert, idx) => (
            <div key={idx} style={{ marginBottom: '6px', fontSize: '9.5pt' }}>
              <span style={{ fontWeight: 600, color: textColor }}>{cert.name}</span>
              {cert.issuer && <span style={{ color: subtleColor }}> – {cert.issuer}</span>}
              {cert.date && <span style={{ color: subtleColor }}> ({cert.date})</span>}
            </div>
          ))}
        </div>
      )}

      {languagesList.length > 0 && (
        <div data-cv-section="languages" style={{ marginBottom: '24px', ...getSectionBlurStyle('languages', activeSection) }}>
          <h2 style={sectionHeadingStyle}>
            {isArabic ? 'اللغات' : 'Languages'}
          </h2>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            {languagesList.map((lang, idx) => (
              <div key={idx} style={{ fontSize: '9.5pt' }}>
                <span style={{ fontWeight: 600, color: textColor }}>{lang.name}</span>
                {lang.level && <span style={{ color: subtleColor }}> – {lang.level}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
