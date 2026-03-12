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
    linkedin?: string;
    nationality?: string;
    targetJobDomain?: string;
    professionalTitle?: string;
    targetJobTitle?: string;
    photo?: string;
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

interface ExecutiveTemplateProps {
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

export default function ExecutiveTemplate({ data, previewMode = false, isArabic = false, settings }: ExecutiveTemplateProps) {
  const personalInfo = data?.personalInfo || {};
  const experience = data?.experience || [];
  const education = data?.education || [];
  const skills = data?.skills;
  const languages = data?.languages || [];
  const certifications = data?.certifications || [];

  const activeSection = settings?.activeSection;

  const fullSummary = data?.professionalSummary || data?.summary || '';
  const fullName = personalInfo?.fullName || personalInfo?.name || 'Your Name';

  let primaryColor = '#1e3a5f';
  if (settings?.primaryColor && typeof settings.primaryColor === 'string' && settings.primaryColor.trim()) {
    primaryColor = settings.primaryColor.trim();
    if (!primaryColor.startsWith('#')) {
      primaryColor = '#' + primaryColor;
    }
  }
  const headerBg = settings?.headerBg || primaryColor;

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

  const SectionTitle = ({ children }: { children: string }) => (
    <h2 style={{
      fontSize: '13pt',
      fontWeight: 'bold',
      color: primaryColor,
      marginBottom: '10px',
      marginTop: '0',
      paddingBottom: '6px',
      borderBottom: `2px solid ${primaryColor}`,
      letterSpacing: '1px',
      textTransform: 'uppercase',
      fontFamily: 'Georgia, "Times New Roman", serif'
    }}>
      {children}
    </h2>
  );

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`${previewMode ? 'scale-75 origin-top' : ''}`}
      style={{
        width: '210mm',
        minHeight: '297mm',
        fontFamily: 'Georgia, "Times New Roman", serif',
        direction: isArabic ? 'rtl' : 'ltr',
        backgroundColor: '#FFFFFF',
        boxSizing: 'border-box',
        color: '#333333',
        fontSize: '10pt',
        lineHeight: '1.5'
      }}
    >
      <div data-cv-section="personalInfo" style={{
        backgroundColor: headerBg,
        padding: '24px 30px',
        color: '#FFFFFF',
        ...getSectionBlurStyle('personalInfo', activeSection)
      }}>
        <h1 style={{
          fontSize: '28pt',
          fontWeight: 'normal',
          margin: '0 0 4px 0',
          fontFamily: 'Georgia, "Times New Roman", serif',
          letterSpacing: '1px'
        }}>
          {fullName}
        </h1>
        {getJobTitle(personalInfo, isArabic) && (
          <div style={{
            fontSize: '13pt',
            fontStyle: 'italic',
            opacity: 0.9,
            marginBottom: '4px'
          }}>
            {getJobTitle(personalInfo, isArabic)}
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '10px 30px',
        backgroundColor: '#f5f5f5',
        fontSize: '9pt',
        color: '#555',
        borderBottom: `2px solid ${primaryColor}`
      }}>
        {personalInfo?.phone && <span>📞 {personalInfo.phone}</span>}
        {personalInfo?.email && <span>✉ {personalInfo.email}</span>}
        {personalInfo?.location && <span>📍 {personalInfo.location}</span>}
        {personalInfo?.nationality && <span>🌍 {personalInfo.nationality}</span>}
        {personalInfo?.linkedin && <span>🔗 {personalInfo.linkedin}</span>}
      </div>

      <div style={{ padding: '20px 30px' }}>
        {fullSummary && (
          <div data-cv-section="summary" style={{ marginBottom: '22px', ...getSectionBlurStyle('summary', activeSection) }}>
            <SectionTitle>{isArabic ? 'الملخص المهني' : 'Executive Summary'}</SectionTitle>
            <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_b]:font-bold [&_i]:italic" style={{
              fontSize: '10pt',
              color: '#333',
              lineHeight: '1.7',
              textAlign: 'justify',
              margin: '0',
              borderLeft: isArabic ? 'none' : `4px solid ${primaryColor}`,
              borderRight: isArabic ? `4px solid ${primaryColor}` : 'none',
              paddingLeft: isArabic ? '0' : '14px',
              paddingRight: isArabic ? '14px' : '0'
            }} dangerouslySetInnerHTML={{ __html: fullSummary }} />
          </div>
        )}

        {experience.length > 0 && (
          <div data-cv-section="experience" style={{ marginBottom: '22px', ...getSectionBlurStyle('experience', activeSection) }}>
            <SectionTitle>{isArabic ? 'الخبرة المهنية' : 'Professional Experience'}</SectionTitle>
            {experience.map((exp, idx) => {
              const experienceHtml = getExperienceHtml(exp);
              return (
                <div key={idx} style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '11pt', fontWeight: 'bold', color: primaryColor }}>
                      {exp.position || exp.title}
                    </div>
                    <div style={{ fontSize: '9pt', color: '#777', fontStyle: 'italic' }}>
                      {exp.startDate} - {exp.endDate || (isArabic ? 'الحاضر' : 'Present')}
                    </div>
                  </div>
                  <div style={{ fontSize: '10pt', color: '#555', marginBottom: '6px' }}>
                    {exp.company}{exp.location && ` • ${exp.location}`}
                  </div>
                  {experienceHtml && (
                    <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-1 [&_li]:mb-0.5 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic" style={{
                      fontSize: '9pt',
                      color: '#333',
                      lineHeight: '1.65'
                    }} dangerouslySetInnerHTML={{ __html: experienceHtml }} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {education.length > 0 && (
          <div data-cv-section="education" style={{ marginBottom: '22px', ...getSectionBlurStyle('education', activeSection) }}>
            <SectionTitle>{isArabic ? 'التعليم' : 'Education'}</SectionTitle>
            {education.map((edu, idx) => (
              <div key={idx} style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '11pt', fontWeight: 'bold', color: primaryColor }}>
                  {edu.degree}{(edu.field || edu.fieldOfStudy) && ` in ${edu.field || edu.fieldOfStudy}`}
                </div>
                <div style={{ fontSize: '10pt', color: '#555' }}>
                  {edu.institution || edu.school || 'Not provided'}
                </div>
                {(edu.endDate || edu.graduationYear) && (
                  <div style={{ fontSize: '9pt', color: '#777', fontStyle: 'italic' }}>
                    {edu.startDate ? `${edu.startDate} - ${edu.endDate || 'Present'}` : edu.graduationYear || edu.endDate}
                  </div>
                )}
                {edu.description && (
                  <div style={{ fontSize: '9pt', color: '#555', lineHeight: '1.5', marginTop: '3px' }}>
                    {edu.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {skillsList.length > 0 && (
          <div data-cv-section="skills" style={{ marginBottom: '22px', ...getSectionBlurStyle('skills', activeSection) }}>
            <SectionTitle>{isArabic ? 'المهارات' : 'Skills'}</SectionTitle>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {skillsList.map((skill, idx) => (
                <span key={idx} style={{
                  display: 'inline-block',
                  backgroundColor: `${primaryColor}15`,
                  color: primaryColor,
                  padding: '4px 14px',
                  borderRadius: '4px',
                  fontSize: '9pt',
                  border: `1px solid ${primaryColor}30`
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {languagesList.length > 0 && (
          <div data-cv-section="languages" style={{ marginBottom: '22px', ...getSectionBlurStyle('languages', activeSection) }}>
            <SectionTitle>{isArabic ? 'اللغات' : 'Languages'}</SectionTitle>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '10pt' }}>
              {languagesList.map((lang, idx) => (
                <span key={idx} style={{ color: '#333' }}>
                  <strong>{lang.name}</strong>{lang.level && ` — ${lang.level}`}
                </span>
              ))}
            </div>
          </div>
        )}

        {certsList.length > 0 && (
          <div data-cv-section="certifications" style={{ marginBottom: '22px', ...getSectionBlurStyle('certifications', activeSection) }}>
            <SectionTitle>{isArabic ? 'الشهادات' : 'Certifications'}</SectionTitle>
            <ul style={{ margin: '0', paddingLeft: '18px', fontSize: '9pt', color: '#333', lineHeight: '1.7' }}>
              {certsList.map((cert, idx) => (
                <li key={idx} style={{ marginBottom: '3px' }}>
                  {cert.name}{cert.issuer && ` — ${cert.issuer}`}{cert.date && ` (${cert.date})`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
