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

interface FreshStartTemplateProps {
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

export default function FreshStartTemplate({ data, previewMode = false, isArabic = false, settings }: FreshStartTemplateProps) {
  const personalInfo = data?.personalInfo || {};
  const experience = data?.experience || [];
  const education = data?.education || [];
  const skills = data?.skills;
  const languages = data?.languages || [];
  const certifications = data?.certifications || [];

  const activeSection = settings?.activeSection;

  const fullSummary = data?.professionalSummary || data?.summary || '';
  const fullName = personalInfo?.fullName || personalInfo?.name || 'Your Name';

  let primaryColor = '#4A90A4';
  if (settings?.primaryColor && typeof settings.primaryColor === 'string' && settings.primaryColor.trim()) {
    primaryColor = settings.primaryColor.trim();
    if (!primaryColor.startsWith('#')) {
      primaryColor = '#' + primaryColor;
    }
  }
  const textColor = '#444444';
  const lightBg = '#FAFAFA';

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
    fontWeight: 600,
    color: primaryColor,
    marginBottom: '10px',
    marginTop: '0',
    padding: '5px 14px',
    borderRadius: '20px',
    backgroundColor: primaryColor + '1A',
    display: 'inline-block',
    letterSpacing: '0.5px',
    lineHeight: '1.4'
  };

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`${previewMode ? 'scale-75 origin-top' : ''}`}
      style={{
        width: '210mm',
        minHeight: '297mm',
        fontFamily: 'Arial, Helvetica, sans-serif',
        padding: '20mm 18mm',
        color: textColor,
        fontSize: '10pt',
        lineHeight: '1.5',
        backgroundColor: '#FFFFFF',
        boxSizing: 'border-box',
        direction: isArabic ? 'rtl' : 'ltr'
      }}
    >
      <div data-cv-section="personalInfo" style={{
        marginBottom: '20px',
        paddingBottom: '14px',
        borderBottom: `2px solid ${primaryColor}30`,
        ...getSectionBlurStyle('personalInfo', activeSection)
      }}>
        <h1 style={{
          fontSize: '28pt',
          fontWeight: 700,
          color: primaryColor,
          marginBottom: '6px',
          marginTop: '0',
          lineHeight: '1.1',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          {fullName}
        </h1>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '6px',
          fontSize: '9.5pt',
          color: textColor,
          marginTop: '4px'
        }}>
          {getJobTitle(personalInfo, isArabic) && (
            <span style={{ fontWeight: 600, color: primaryColor }}>
              {getJobTitle(personalInfo, isArabic)}
            </span>
          )}
          {getJobTitle(personalInfo, isArabic) && personalInfo?.phone && (
            <span style={{ color: '#CCCCCC' }}>|</span>
          )}
          {personalInfo?.phone && <span>{personalInfo.phone}</span>}
          {personalInfo?.email && (<><span style={{ color: '#CCCCCC' }}>|</span><span>{personalInfo.email}</span></>)}
          {personalInfo?.location && (<><span style={{ color: '#CCCCCC' }}>|</span><span>{personalInfo.location}</span></>)}
          {personalInfo?.nationality && (<><span style={{ color: '#CCCCCC' }}>|</span><span>{personalInfo.nationality}</span></>)}
          {personalInfo?.linkedin && (<><span style={{ color: '#CCCCCC' }}>|</span><span>{personalInfo.linkedin}</span></>)}
        </div>
      </div>

      {fullSummary && (
        <div data-cv-section="summary" style={{ marginBottom: '18px', ...getSectionBlurStyle('summary', activeSection) }}>
          <div style={{ marginBottom: '8px' }}>
            <span style={sectionHeadingStyle}>
              {isArabic ? 'الملخص المهني' : 'Profile Summary'}
            </span>
          </div>
          <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_b]:font-bold [&_i]:italic" style={{
            fontSize: '9.5pt',
            color: textColor,
            lineHeight: '1.7',
            textAlign: 'justify'
          }} dangerouslySetInnerHTML={{ __html: fullSummary }} />
        </div>
      )}

      {experience.length > 0 && (
        <div data-cv-section="experience" style={{ marginBottom: '18px', ...getSectionBlurStyle('experience', activeSection) }}>
          <div style={{ marginBottom: '10px' }}>
            <span style={sectionHeadingStyle}>
              {isArabic ? 'الخبرة العملية' : 'Work Experience'}
            </span>
          </div>
          {experience.map((exp, idx) => {
            const experienceHtml = getExperienceHtml(exp);
            return (
              <div key={idx} style={{ marginBottom: '14px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  flexWrap: 'wrap'
                }}>
                  <div style={{
                    fontSize: '10.5pt',
                    fontWeight: 700,
                    color: '#333333'
                  }}>
                    {exp.position || exp.title}
                  </div>
                  <div style={{
                    fontSize: '9pt',
                    color: '#888888'
                  }}>
                    {exp.startDate} – {exp.endDate || (isArabic ? 'الحاضر' : 'Present')}
                  </div>
                </div>
                <div style={{
                  fontSize: '9.5pt',
                  color: primaryColor,
                  fontWeight: 500,
                  marginBottom: '4px'
                }}>
                  {exp.company}
                  {exp.location && <span style={{ color: textColor, fontWeight: 'normal' }}> · {exp.location}</span>}
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
        <div data-cv-section="education" style={{ marginBottom: '18px', ...getSectionBlurStyle('education', activeSection) }}>
          <div style={{ marginBottom: '10px' }}>
            <span style={sectionHeadingStyle}>
              {isArabic ? 'التعليم' : 'Education'}
            </span>
          </div>
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
                  fontWeight: 700,
                  color: '#333333'
                }}>
                  {edu.degree}
                  {(edu.field || edu.fieldOfStudy) && ` – ${edu.field || edu.fieldOfStudy}`}
                </div>
                <div style={{ fontSize: '9pt', color: '#888888' }}>
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
                <div style={{ fontSize: '9pt', color: textColor, marginTop: '2px' }}>
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
        <div data-cv-section="skills" style={{ marginBottom: '18px', ...getSectionBlurStyle('skills', activeSection) }}>
          <div style={{ marginBottom: '10px' }}>
            <span style={sectionHeadingStyle}>
              {isArabic ? 'المهارات' : 'Skills'}
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {skillsList.map((skill, idx) => (
              <span key={idx} style={{
                fontSize: '9pt',
                color: primaryColor,
                backgroundColor: primaryColor + '14',
                padding: '4px 12px',
                borderRadius: '14px',
                fontWeight: 500,
                border: `1px solid ${primaryColor}30`
              }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {certsList.length > 0 && (
        <div data-cv-section="certifications" style={{ marginBottom: '18px', ...getSectionBlurStyle('certifications', activeSection) }}>
          <div style={{ marginBottom: '10px' }}>
            <span style={sectionHeadingStyle}>
              {isArabic ? 'الشهادات' : 'Certifications'}
            </span>
          </div>
          <ul style={{
            margin: '0',
            paddingLeft: isArabic ? '0' : '18px',
            paddingRight: isArabic ? '18px' : '0',
            fontSize: '9.5pt',
            color: textColor,
            lineHeight: '1.7'
          }}>
            {certsList.map((cert, idx) => (
              <li key={idx} style={{ marginBottom: '3px' }}>
                <span style={{ fontWeight: 600 }}>{cert.name}</span>
                {cert.issuer && <span style={{ color: '#888888' }}> – {cert.issuer}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {languagesList.length > 0 && (
        <div data-cv-section="languages" style={{ marginBottom: '18px', ...getSectionBlurStyle('languages', activeSection) }}>
          <div style={{ marginBottom: '10px' }}>
            <span style={sectionHeadingStyle}>
              {isArabic ? 'اللغات' : 'Languages'}
            </span>
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '9.5pt',
            color: textColor
          }}>
            {languagesList.map((lang, idx) => (
              <span key={idx} style={{
                padding: '4px 12px',
                borderRadius: '14px',
                backgroundColor: lightBg,
                border: '1px solid #E8E8E8'
              }}>
                <span style={{ fontWeight: 600 }}>{lang.name}</span>
                {lang.level && <span style={{ color: '#888888' }}> · {lang.level}</span>}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
