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

interface ProfessionalEdgeTemplateProps {
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

export default function ProfessionalEdgeTemplate({ data, previewMode = false, isArabic = false, settings }: ProfessionalEdgeTemplateProps) {
  const personalInfo = data?.personalInfo || {};
  const experience = data?.experience || [];
  const education = data?.education || [];
  const skills = data?.skills;
  const languages = data?.languages || [];
  const certifications = data?.certifications || [];

  const activeSection = settings?.activeSection;

  const fullSummary = data?.professionalSummary || data?.summary || '';
  const fullName = personalInfo?.fullName || personalInfo?.name || 'Your Name';

  let primaryColor = '#1A5276';
  if (settings?.primaryColor && typeof settings.primaryColor === 'string' && settings.primaryColor.trim()) {
    primaryColor = settings.primaryColor.trim();
    if (!primaryColor.startsWith('#')) {
      primaryColor = '#' + primaryColor;
    }
  }
  const textColor = '#333333';
  const lightTextColor = '#555555';

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

  const jobTitle = personalInfo?.targetJobTitle || personalInfo?.professionalTitle || personalInfo?.targetJobDomain || '';

  const contactItems: string[] = [];
  if (personalInfo?.email) contactItems.push(personalInfo.email);
  if (personalInfo?.phone) contactItems.push(personalInfo.phone);
  if (personalInfo?.location) contactItems.push(personalInfo.location);
  if (personalInfo?.nationality) contactItems.push(personalInfo.nationality);
  if (personalInfo?.linkedin) contactItems.push(personalInfo.linkedin);

  const sectionHeadingStyle: React.CSSProperties = {
    fontSize: '12pt',
    fontWeight: 'bold',
    color: primaryColor,
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    marginBottom: '8px',
    paddingBottom: '6px',
    borderBottom: `2px solid ${primaryColor}`,
    marginTop: '0',
    lineHeight: '1.3'
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
        padding: '24px 20mm',
        marginBottom: '0',
        ...getSectionBlurStyle('personalInfo', activeSection)
      }}>
        <h1 style={{
          fontSize: '28pt',
          fontWeight: 'bold',
          color: '#FFFFFF',
          margin: '0 0 4px 0',
          letterSpacing: '2px',
          lineHeight: '1.2'
        }}>
          {fullName}
        </h1>
        {jobTitle && (
          <div style={{
            fontSize: '13pt',
            color: 'rgba(255,255,255,0.9)',
            fontWeight: '300',
            letterSpacing: '1px',
            marginTop: '2px'
          }}>
            {jobTitle}
          </div>
        )}
      </div>

      {contactItems.length > 0 && (
        <div style={{
          backgroundColor: '#F5F5F5',
          padding: '10px 20mm',
          fontSize: '9pt',
          color: lightTextColor,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px 16px',
          justifyContent: isArabic ? 'flex-end' : 'flex-start',
          borderBottom: '1px solid #E0E0E0'
        }}>
          {contactItems.map((item, idx) => (
            <span key={idx}>
              {item}
              {idx < contactItems.length - 1 && (
                <span style={{ margin: isArabic ? '0 8px 0 0' : '0 0 0 8px', color: '#CCCCCC' }}>|</span>
              )}
            </span>
          ))}
        </div>
      )}

      <div style={{ padding: '20px 20mm 18mm 20mm' }}>
        {fullSummary && (
          <div data-cv-section="summary" style={{ marginBottom: '20px', ...getSectionBlurStyle('summary', activeSection) }}>
            <h2 style={sectionHeadingStyle}>
              {isArabic ? 'الملخص المهني' : 'PROFESSIONAL SUMMARY'}
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
          <div data-cv-section="experience" style={{ marginBottom: '20px', ...getSectionBlurStyle('experience', activeSection) }}>
            <h2 style={sectionHeadingStyle}>
              {isArabic ? 'الخبرة العملية' : 'WORK EXPERIENCE'}
            </h2>
            {experience.map((exp, idx) => {
              const experienceHtml = getExperienceHtml(exp);
              return (
                <div key={idx} style={{ marginBottom: '16px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{
                      fontSize: '11pt',
                      fontWeight: 'bold',
                      color: primaryColor
                    }}>
                      {exp.position || exp.title}
                    </div>
                    <div style={{
                      fontSize: '9pt',
                      color: lightTextColor,
                      fontStyle: 'italic'
                    }}>
                      {exp.startDate} - {exp.endDate || (isArabic ? 'الحاضر' : 'Present')}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '9.5pt',
                    color: textColor,
                    fontWeight: '600',
                    marginBottom: '4px'
                  }}>
                    {exp.company}
                    {exp.location && (
                      <span style={{ fontWeight: 'normal', color: lightTextColor }}> — {exp.location}</span>
                    )}
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
              {isArabic ? 'التعليم' : 'EDUCATION'}
            </h2>
            {education.map((edu, idx) => (
              <div key={idx} style={{ marginBottom: '12px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  flexWrap: 'wrap'
                }}>
                  <div style={{
                    fontSize: '10.5pt',
                    fontWeight: 'bold',
                    color: primaryColor
                  }}>
                    {edu.degree}
                    {(edu.field || edu.fieldOfStudy) && ` — ${edu.field || edu.fieldOfStudy}`}
                  </div>
                  <div style={{
                    fontSize: '9pt',
                    color: lightTextColor,
                    fontStyle: 'italic'
                  }}>
                    {edu.startDate && edu.endDate
                      ? `${edu.startDate} - ${edu.endDate}`
                      : edu.graduationYear || edu.endDate || ''
                    }
                  </div>
                </div>
                <div style={{
                  fontSize: '9.5pt',
                  color: textColor,
                  marginBottom: '2px'
                }}>
                  {edu.institution || edu.school || ''}
                </div>
                {edu.gpa && (
                  <div style={{ fontSize: '9pt', color: lightTextColor }}>
                    GPA: {edu.gpa}
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
              {isArabic ? 'المهارات' : 'SKILLS'}
            </h2>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px'
            }}>
              {skillsList.map((skill, idx) => (
                <span key={idx} style={{
                  fontSize: '9pt',
                  color: textColor,
                  padding: '3px 10px',
                  backgroundColor: '#F0F0F0',
                  borderRadius: '3px',
                  border: `1px solid #E0E0E0`
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
              {isArabic ? 'الشهادات' : 'CERTIFICATIONS'}
            </h2>
            {certsList.map((cert, idx) => (
              <div key={idx} style={{ marginBottom: '6px', fontSize: '9.5pt' }}>
                <span style={{ fontWeight: 'bold', color: textColor }}>{cert.name}</span>
                {cert.issuer && (
                  <span style={{ color: lightTextColor }}> — {cert.issuer}</span>
                )}
                {cert.date && (
                  <span style={{ color: lightTextColor, fontStyle: 'italic' }}> ({cert.date})</span>
                )}
              </div>
            ))}
          </div>
        )}

        {languagesList.length > 0 && (
          <div data-cv-section="languages" style={{ marginBottom: '20px', ...getSectionBlurStyle('languages', activeSection) }}>
            <h2 style={sectionHeadingStyle}>
              {isArabic ? 'اللغات' : 'LANGUAGES'}
            </h2>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              {languagesList.map((lang, idx) => (
                <div key={idx} style={{ fontSize: '9.5pt' }}>
                  <span style={{ fontWeight: 'bold', color: textColor }}>{lang.name}</span>
                  {lang.level && (
                    <span style={{ color: lightTextColor }}> — {lang.level}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
