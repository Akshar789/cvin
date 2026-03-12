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

interface NordicTemplateProps {
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

export default function NordicTemplate({ data, previewMode = false, isArabic = false, settings }: NordicTemplateProps) {
  const personalInfo = data?.personalInfo || {};
  const experience = data?.experience || [];
  const education = data?.education || [];
  const skills = data?.skills;
  const languages = data?.languages || [];
  const certifications = data?.certifications || [];

  const activeSection = settings?.activeSection;

  const fullSummary = data?.professionalSummary || data?.summary || '';
  const fullName = personalInfo?.fullName || personalInfo?.name || 'Your Name';

  let primaryColor = '#333333';
  if (settings?.primaryColor && typeof settings.primaryColor === 'string' && settings.primaryColor.trim()) {
    primaryColor = settings.primaryColor.trim();
    if (!primaryColor.startsWith('#')) {
      primaryColor = '#' + primaryColor;
    }
  }
  const textColor = '#555555';
  const lightGray = '#d0d0d0';

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

  const hairline: React.CSSProperties = {
    borderTop: `1px solid ${lightGray}`,
    marginTop: '24px',
    marginBottom: '24px',
  };

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`${previewMode ? 'scale-75 origin-top' : ''}`}
      style={{
        width: '210mm',
        minHeight: '297mm',
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        padding: '22mm 20mm',
        color: textColor,
        fontSize: '10pt',
        lineHeight: '1.6',
        backgroundColor: '#ffffff',
        boxSizing: 'border-box',
        direction: isArabic ? 'rtl' : 'ltr'
      }}
    >
      <div data-cv-section="personalInfo" style={{
        marginBottom: '0',
        ...getSectionBlurStyle('personalInfo', activeSection)
      }}>
        <h1 style={{
          fontSize: '30pt',
          fontWeight: 300,
          color: primaryColor,
          margin: '0 0 6px 0',
          letterSpacing: '2px',
          lineHeight: '1.1',
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif"
        }}>
          {fullName}
        </h1>
        {getJobTitle(personalInfo, isArabic) && (
          <div style={{
            fontSize: '11pt',
            color: textColor,
            fontWeight: 300,
            letterSpacing: '1px',
            marginBottom: '8px'
          }}>
            {getJobTitle(personalInfo, isArabic)}
          </div>
        )}
        <div style={{
          fontSize: '8.5pt',
          color: textColor,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          alignItems: 'center',
          marginTop: '4px'
        }}>
          {[
            personalInfo?.email,
            personalInfo?.phone,
            personalInfo?.location,
            personalInfo?.nationality,
            personalInfo?.linkedin
          ].filter(Boolean).map((item, idx, arr) => (
            <React.Fragment key={idx}>
              <span>{item}</span>
              {idx < arr.length - 1 && <span style={{ color: lightGray }}>·</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {fullSummary && (
        <>
          <div style={hairline} />
          <div data-cv-section="summary" style={{ ...getSectionBlurStyle('summary', activeSection) }}>
            <h2 style={{
              fontSize: '10pt',
              fontWeight: 400,
              color: primaryColor,
              letterSpacing: '2px',
              marginTop: '0',
              marginBottom: '10px',
              textTransform: 'lowercase'
            }}>
              {isArabic ? 'الملخص المهني' : 'profile'}
            </h2>
            <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_b]:font-bold [&_i]:italic" style={{
              fontSize: '9pt',
              color: textColor,
              lineHeight: '1.7',
              fontWeight: 300,
            }} dangerouslySetInnerHTML={{ __html: fullSummary }} />
          </div>
        </>
      )}

      {experience.length > 0 && (
        <>
          <div style={hairline} />
          <div data-cv-section="experience" style={{ ...getSectionBlurStyle('experience', activeSection) }}>
            <h2 style={{
              fontSize: '10pt',
              fontWeight: 400,
              color: primaryColor,
              letterSpacing: '2px',
              marginTop: '0',
              marginBottom: '14px',
              textTransform: 'lowercase'
            }}>
              {isArabic ? 'الخبرة العملية' : 'experience'}
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
                      fontSize: '10pt',
                      fontWeight: 500,
                      color: primaryColor,
                    }}>
                      {exp.position || exp.title}
                    </div>
                    <div style={{
                      fontSize: '8.5pt',
                      color: textColor,
                      fontWeight: 300,
                    }}>
                      {exp.startDate} — {exp.endDate || (isArabic ? 'الحاضر' : 'Present')}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '9pt',
                    color: textColor,
                    fontWeight: 300,
                    marginBottom: '6px'
                  }}>
                    {exp.company}
                    {exp.location && <span> · {exp.location}</span>}
                  </div>
                  {experienceHtml && (
                    <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-1 [&_li]:mb-0.5 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic" style={{
                      fontSize: '9pt',
                      color: textColor,
                      lineHeight: '1.6',
                      fontWeight: 300,
                    }} dangerouslySetInnerHTML={{ __html: experienceHtml }} />
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {education.length > 0 && (
        <>
          <div style={hairline} />
          <div data-cv-section="education" style={{ ...getSectionBlurStyle('education', activeSection) }}>
            <h2 style={{
              fontSize: '10pt',
              fontWeight: 400,
              color: primaryColor,
              letterSpacing: '2px',
              marginTop: '0',
              marginBottom: '14px',
              textTransform: 'lowercase'
            }}>
              {isArabic ? 'التعليم' : 'education'}
            </h2>
            {education.map((edu, idx) => (
              <div key={idx} style={{ marginBottom: '12px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: '2px'
                }}>
                  <div style={{
                    fontSize: '10pt',
                    fontWeight: 500,
                    color: primaryColor,
                  }}>
                    {edu.degree}
                    {(edu.field || edu.fieldOfStudy) && `, ${edu.field || edu.fieldOfStudy}`}
                  </div>
                  <div style={{
                    fontSize: '8.5pt',
                    color: textColor,
                    fontWeight: 300,
                  }}>
                    {edu.startDate && edu.endDate
                      ? `${edu.startDate} — ${edu.endDate}`
                      : edu.graduationYear || edu.endDate || ''
                    }
                  </div>
                </div>
                <div style={{
                  fontSize: '9pt',
                  color: textColor,
                  fontWeight: 300,
                }}>
                  {edu.institution || edu.school || ''}
                </div>
                {edu.description && (
                  <div style={{ fontSize: '9pt', color: textColor, lineHeight: '1.5', marginTop: '4px', fontWeight: 300 }}>
                    {edu.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {skillsList.length > 0 && (
        <>
          <div style={hairline} />
          <div data-cv-section="skills" style={{ ...getSectionBlurStyle('skills', activeSection) }}>
            <h2 style={{
              fontSize: '10pt',
              fontWeight: 400,
              color: primaryColor,
              letterSpacing: '2px',
              marginTop: '0',
              marginBottom: '10px',
              textTransform: 'lowercase'
            }}>
              {isArabic ? 'المهارات' : 'skills'}
            </h2>
            <div style={{
              fontSize: '9pt',
              color: textColor,
              lineHeight: '1.8',
              fontWeight: 300,
            }}>
              {skillsList.join(isArabic ? '، ' : ', ')}
            </div>
          </div>
        </>
      )}

      {certsList.length > 0 && (
        <>
          <div style={hairline} />
          <div data-cv-section="certifications" style={{ ...getSectionBlurStyle('certifications', activeSection) }}>
            <h2 style={{
              fontSize: '10pt',
              fontWeight: 400,
              color: primaryColor,
              letterSpacing: '2px',
              marginTop: '0',
              marginBottom: '10px',
              textTransform: 'lowercase'
            }}>
              {isArabic ? 'الشهادات' : 'certifications'}
            </h2>
            <div style={{ fontSize: '9pt', color: textColor, lineHeight: '1.8', fontWeight: 300 }}>
              {certsList.map((cert, idx) => (
                <div key={idx} style={{ marginBottom: '4px' }}>
                  {cert.name}
                  {cert.issuer && <span style={{ color: lightGray }}> — {cert.issuer}</span>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {languagesList.length > 0 && (
        <>
          <div style={hairline} />
          <div data-cv-section="languages" style={{ ...getSectionBlurStyle('languages', activeSection) }}>
            <h2 style={{
              fontSize: '10pt',
              fontWeight: 400,
              color: primaryColor,
              letterSpacing: '2px',
              marginTop: '0',
              marginBottom: '10px',
              textTransform: 'lowercase'
            }}>
              {isArabic ? 'اللغات' : 'languages'}
            </h2>
            <div style={{
              fontSize: '9pt',
              color: textColor,
              lineHeight: '1.8',
              fontWeight: 300,
            }}>
              {languagesList.map((lang, idx, arr) => (
                <React.Fragment key={idx}>
                  <span>{lang.name}{lang.level && ` (${lang.level})`}</span>
                  {idx < arr.length - 1 && <span style={{ color: lightGray }}> · </span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
