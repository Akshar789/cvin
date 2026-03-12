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

interface MetroTemplateProps {
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

export default function MetroTemplate({ data, previewMode = false, isArabic = false, settings }: MetroTemplateProps) {
  const personalInfo = data?.personalInfo || {};
  const experience = data?.experience || [];
  const education = data?.education || [];
  const skills = data?.skills;
  const languages = data?.languages || [];
  const certifications = data?.certifications || [];

  const activeSection = settings?.activeSection;

  const fullSummary = data?.professionalSummary || data?.summary || '';
  const fullName = personalInfo?.fullName || personalInfo?.name || 'Your Name';

  let primaryColor = '#0078D7';
  if (settings?.primaryColor && typeof settings.primaryColor === 'string' && settings.primaryColor.trim()) {
    primaryColor = settings.primaryColor.trim();
    if (!primaryColor.startsWith('#')) {
      primaryColor = '#' + primaryColor;
    }
  }
  const textColor = '#333333';
  const lightBg = '#F5F5F5';

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

  let certsList: Array<{ name: string; issuer?: string }> = [];
  if (Array.isArray(certifications)) {
    certsList = certifications.map(cert => {
      if (typeof cert === 'string') {
        return { name: cert };
      }
      return {
        name: cert.name || cert.title || '',
        issuer: cert.issuer || cert.organization || undefined
      };
    }).filter(c => c.name);
  }

  const sectionHeadingStyle: React.CSSProperties = {
    fontSize: '11pt',
    fontWeight: 'bold',
    color: primaryColor,
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    lineHeight: '1.3',
    marginTop: '0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`${previewMode ? 'scale-75 origin-top' : ''}`}
      style={{
        width: '210mm',
        minHeight: '297mm',
        fontFamily: 'Arial, Helvetica, sans-serif',
        color: textColor,
        fontSize: '10pt',
        lineHeight: '1.5',
        backgroundColor: '#FFFFFF',
        boxSizing: 'border-box',
        direction: isArabic ? 'rtl' : 'ltr'
      }}
    >
      <div data-cv-section="personalInfo" style={{
        backgroundColor: primaryColor,
        padding: '28px 24px',
        color: '#FFFFFF',
        ...getSectionBlurStyle('personalInfo', activeSection)
      }}>
        <h1 style={{
          fontSize: '28pt',
          fontWeight: 'bold',
          margin: '0 0 4px 0',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: '#FFFFFF'
        }}>
          {fullName}
        </h1>
        {getJobTitle(personalInfo, isArabic) && (
          <div style={{
            fontSize: '13pt',
            fontWeight: '300',
            letterSpacing: '1px',
            marginBottom: '12px',
            color: 'rgba(255,255,255,0.9)'
          }}>
            {getJobTitle(personalInfo, isArabic)}
          </div>
        )}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '9pt',
          color: 'rgba(255,255,255,0.85)'
        }}>
          {personalInfo?.email && <span>{personalInfo.email}</span>}
          {personalInfo?.phone && <span>{personalInfo.phone}</span>}
          {personalInfo?.location && <span>{personalInfo.location}</span>}
          {personalInfo?.nationality && <span>{personalInfo.nationality}</span>}
          {personalInfo?.linkedin && <span>{personalInfo.linkedin}</span>}
        </div>
      </div>

      <div style={{ padding: '20px 24px' }}>
        {fullSummary && (
          <div data-cv-section="summary" style={{ marginBottom: '20px', ...getSectionBlurStyle('summary', activeSection) }}>
            <h2 style={sectionHeadingStyle}>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                backgroundColor: primaryColor,
                flexShrink: 0
              }} />
              {isArabic ? 'الملخص المهني' : 'PROFILE'}
            </h2>
            <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_b]:font-bold [&_i]:italic" style={{
              fontSize: '9pt',
              color: textColor,
              lineHeight: '1.7',
              textAlign: 'justify'
            }} dangerouslySetInnerHTML={{ __html: fullSummary }} />
          </div>
        )}

        {experience.length > 0 && (
          <div data-cv-section="experience" style={{ marginBottom: '20px', ...getSectionBlurStyle('experience', activeSection) }}>
            <h2 style={sectionHeadingStyle}>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                backgroundColor: primaryColor,
                flexShrink: 0
              }} />
              {isArabic ? 'الخبرة العملية' : 'WORK EXPERIENCE'}
            </h2>
            {experience.map((exp, idx) => {
              const experienceHtml = getExperienceHtml(exp);
              return (
                <div key={idx} style={{ marginBottom: '14px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: '2px'
                  }}>
                    <div style={{
                      fontSize: '10pt',
                      fontWeight: 'bold',
                      color: primaryColor
                    }}>
                      {exp.position || exp.title}
                    </div>
                    <div style={{
                      fontSize: '9pt',
                      color: '#777'
                    }}>
                      {exp.startDate} - {exp.endDate || (isArabic ? 'الحاضر' : 'Present')}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '9pt',
                    color: textColor,
                    marginBottom: '4px'
                  }}>
                    {exp.company}
                    {exp.location && <span> | {exp.location}</span>}
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
          <div data-cv-section="education" style={{ marginBottom: '20px', ...getSectionBlurStyle('education', activeSection) }}>
            <h2 style={sectionHeadingStyle}>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                backgroundColor: primaryColor,
                flexShrink: 0
              }} />
              {isArabic ? 'التعليم' : 'EDUCATION'}
            </h2>
            {education.map((edu, idx) => (
              <div key={idx} style={{ marginBottom: '12px' }}>
                <div style={{
                  fontSize: '10pt',
                  fontWeight: 'bold',
                  color: primaryColor,
                  marginBottom: '2px'
                }}>
                  {edu.institution || edu.school || 'Not provided'}
                </div>
                <div style={{ fontSize: '9pt', color: textColor, lineHeight: '1.4' }}>
                  {edu.degree}
                  {(edu.field || edu.fieldOfStudy) && ` — ${edu.field || edu.fieldOfStudy}`}
                </div>
                {(edu.startDate || edu.endDate || edu.graduationYear) && (
                  <div style={{ fontSize: '9pt', color: '#777' }}>
                    {edu.startDate && edu.endDate
                      ? `${edu.startDate} - ${edu.endDate}`
                      : edu.graduationYear || edu.endDate || ''
                    }
                  </div>
                )}
                {edu.description && (
                  <div style={{ fontSize: '9pt', color: textColor, lineHeight: '1.5', marginTop: '3px' }}>
                    {edu.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {skillsList.length > 0 && (
          <div data-cv-section="skills" style={{ marginBottom: '20px', ...getSectionBlurStyle('skills', activeSection) }}>
            <h2 style={sectionHeadingStyle}>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                backgroundColor: primaryColor,
                flexShrink: 0
              }} />
              {isArabic ? 'المهارات' : 'SKILLS'}
            </h2>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px'
            }}>
              {skillsList.map((skill, idx) => (
                <span key={idx} style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  backgroundColor: lightBg,
                  border: `1px solid ${primaryColor}20`,
                  fontSize: '8.5pt',
                  color: textColor,
                  lineHeight: '1.4'
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {certsList.length > 0 && (
          <div data-cv-section="certifications" style={{ marginBottom: '20px', ...getSectionBlurStyle('certifications', activeSection) }}>
            <h2 style={sectionHeadingStyle}>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                backgroundColor: primaryColor,
                flexShrink: 0
              }} />
              {isArabic ? 'الشهادات' : 'CERTIFICATIONS'}
            </h2>
            {certsList.map((cert, idx) => (
              <div key={idx} style={{
                fontSize: '9pt',
                color: textColor,
                marginBottom: '4px',
                lineHeight: '1.6'
              }}>
                <span style={{ fontWeight: 'bold' }}>{cert.name}</span>
                {cert.issuer && <span> — {cert.issuer}</span>}
              </div>
            ))}
          </div>
        )}

        {languagesList.length > 0 && (
          <div data-cv-section="languages" style={{ marginBottom: '20px', ...getSectionBlurStyle('languages', activeSection) }}>
            <h2 style={sectionHeadingStyle}>
              <span style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                backgroundColor: primaryColor,
                flexShrink: 0
              }} />
              {isArabic ? 'اللغات' : 'LANGUAGES'}
            </h2>
            <div style={{ fontSize: '9pt', color: textColor, lineHeight: '1.8' }}>
              {languagesList.map((lang, idx) => (
                <div key={idx} style={{ marginBottom: '2px' }}>
                  {lang.name}{lang.level && ` (${lang.level})`}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
