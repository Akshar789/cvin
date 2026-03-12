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

interface GlobalProfessionalTemplateProps {
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

export default function GlobalProfessionalTemplate({ data, previewMode = false, isArabic = false, settings }: GlobalProfessionalTemplateProps) {
  const personalInfo = data?.personalInfo || {};
  const experience = data?.experience || [];
  const education = data?.education || [];
  const skills = data?.skills;
  const languages = data?.languages || [];
  const certifications = data?.certifications || [];

  const activeSection = settings?.activeSection;

  const fullSummary = data?.professionalSummary || data?.summary || '';
  const fullName = personalInfo?.fullName || personalInfo?.name || 'Your Name';

  let primaryColor = '#0e4d92';
  if (settings?.primaryColor && typeof settings.primaryColor === 'string' && settings.primaryColor.trim()) {
    primaryColor = settings.primaryColor.trim();
    if (!primaryColor.startsWith('#')) {
      primaryColor = '#' + primaryColor;
    }
  }

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

  const SectionTitle = ({ children }: { children: string }) => (
    <h2 style={{
      fontSize: '12pt',
      fontWeight: 'bold',
      color: '#1a1a1a',
      marginTop: '0',
      marginBottom: '10px',
      paddingLeft: isArabic ? '0' : '12px',
      paddingRight: isArabic ? '12px' : '0',
      borderLeft: isArabic ? 'none' : `4px solid ${primaryColor}`,
      borderRight: isArabic ? `4px solid ${primaryColor}` : 'none',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      fontFamily: '"Segoe UI", Roboto, Arial, sans-serif'
    }}>
      {children}
    </h2>
  );

  const contactGrid = [
    personalInfo?.phone && { label: isArabic ? 'الهاتف' : 'Phone', value: personalInfo.phone },
    personalInfo?.email && { label: isArabic ? 'البريد' : 'Email', value: personalInfo.email },
    personalInfo?.location && { label: isArabic ? 'الموقع' : 'Location', value: personalInfo.location },
    personalInfo?.linkedin && { label: 'LinkedIn', value: personalInfo.linkedin }
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`${previewMode ? 'scale-75 origin-top' : ''}`}
      style={{
        width: '210mm',
        minHeight: '297mm',
        fontFamily: '"Segoe UI", Roboto, Arial, sans-serif',
        direction: isArabic ? 'rtl' : 'ltr',
        backgroundColor: '#FFFFFF',
        boxSizing: 'border-box',
        color: '#333',
        fontSize: '10pt',
        lineHeight: '1.5'
      }}
    >
<div data-cv-section="personalInfo" style={getSectionBlurStyle('personalInfo', activeSection)}><div style={{
        height: '6px',
        backgroundColor: primaryColor,
        width: '100%'
      }} />

      <div style={{ padding: '20px 28px 0 28px', textAlign: 'center' }}>
        <h1 style={{
          fontSize: '26pt',
          fontWeight: 'bold',
          color: primaryColor,
          margin: '0 0 4px 0',
          letterSpacing: '1px'
        }}>
          {fullName}
        </h1>
        {getJobTitle(personalInfo, isArabic) && (
          <div style={{
            fontSize: '12pt',
            color: '#555',
            marginBottom: '8px',
            letterSpacing: '0.5px'
          }}>
            {getJobTitle(personalInfo, isArabic)}
          </div>
        )}
        {personalInfo?.nationality && (
          <div style={{
            fontSize: '10pt',
            color: primaryColor,
            fontWeight: '600',
            marginBottom: '12px'
          }}>
            🌍 {personalInfo.nationality}
          </div>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px 24px',
        padding: '10px 28px',
        backgroundColor: '#f8f9fa',
        borderTop: `1px solid ${primaryColor}20`,
        borderBottom: `1px solid ${primaryColor}20`,
        marginBottom: '20px'
      }}>
        {contactGrid.map((item, idx) => (
          <div key={idx} style={{ fontSize: '9pt', color: '#555' }}>
            <strong style={{ color: '#333' }}>{item.label}:</strong> {item.value}
          </div>
        ))}
      </div></div>

      <div style={{ padding: '0 28px 20px 28px' }}>
        {fullSummary && (
          <div data-cv-section="summary" style={{ marginBottom: '20px', ...getSectionBlurStyle('summary', activeSection) }}>
            <SectionTitle>{isArabic ? 'الملخص المهني' : 'Professional Summary'}</SectionTitle>
            <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_b]:font-bold [&_i]:italic" style={{
              fontSize: '10pt',
              color: '#444',
              lineHeight: '1.7',
              textAlign: 'justify',
              margin: '0'
            }} dangerouslySetInnerHTML={{ __html: fullSummary }} />
          </div>
        )}

        {experience.length > 0 && (
          <div data-cv-section="experience" style={{ marginBottom: '20px', ...getSectionBlurStyle('experience', activeSection) }}>
            <SectionTitle>{isArabic ? 'الخبرة المهنية' : 'Professional Experience'}</SectionTitle>
            {experience.map((exp, idx) => {
              const experienceHtml = getExperienceHtml(exp);
              return (
                <div key={idx} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '11pt', fontWeight: 'bold', color: '#1a1a1a' }}>
                      {exp.position || exp.title}
                    </div>
                    <div style={{ fontSize: '9pt', color: '#888' }}>
                      {exp.startDate} - {exp.endDate || (isArabic ? 'الحاضر' : 'Present')}
                    </div>
                  </div>
                  <div style={{ fontSize: '10pt', color: primaryColor, marginBottom: '5px' }}>
                    {exp.company}{exp.location && ` • ${exp.location}`}
                  </div>
                  {experienceHtml && (
                    <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-1 [&_li]:mb-0.5 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic" style={{
                      fontSize: '9pt',
                      color: '#444',
                      lineHeight: '1.65'
                    }} dangerouslySetInnerHTML={{ __html: experienceHtml }} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {education.length > 0 && (
          <div data-cv-section="education" style={{ marginBottom: '20px', ...getSectionBlurStyle('education', activeSection) }}>
            <SectionTitle>{isArabic ? 'التعليم' : 'Education'}</SectionTitle>
            {education.map((edu, idx) => (
              <div key={idx} style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '11pt', fontWeight: 'bold', color: '#1a1a1a' }}>
                  {edu.degree}{(edu.field || edu.fieldOfStudy) && ` in ${edu.field || edu.fieldOfStudy}`}
                </div>
                <div style={{ fontSize: '10pt', color: primaryColor }}>
                  {edu.institution || edu.school || 'Not provided'}
                </div>
                {(edu.endDate || edu.graduationYear) && (
                  <div style={{ fontSize: '9pt', color: '#888' }}>
                    {edu.startDate ? `${edu.startDate} - ${edu.endDate || 'Present'}` : edu.graduationYear || edu.endDate}
                  </div>
                )}
                {edu.description && (
                  <div style={{ fontSize: '9pt', color: '#444', lineHeight: '1.5', marginTop: '3px' }}>
                    {edu.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {skillsList.length > 0 && (
          <div data-cv-section="skills" style={{ marginBottom: '20px', ...getSectionBlurStyle('skills', activeSection) }}>
            <SectionTitle>{isArabic ? 'المهارات' : 'Skills'}</SectionTitle>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {skillsList.map((skill, idx) => (
                <span key={idx} style={{
                  display: 'inline-block',
                  backgroundColor: `${primaryColor}10`,
                  color: primaryColor,
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontSize: '9pt',
                  border: `1px solid ${primaryColor}25`
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {languagesList.length > 0 && (
          <div data-cv-section="languages" style={{ marginBottom: '20px', ...getSectionBlurStyle('languages', activeSection) }}>
            <SectionTitle>{isArabic ? 'اللغات' : 'Languages'}</SectionTitle>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '10pt' }}>
              {languagesList.map((lang, idx) => (
                <span key={idx} style={{ color: '#333' }}>
                  <strong>{lang.name}</strong>{lang.level && ` (${lang.level})`}
                </span>
              ))}
            </div>
          </div>
        )}

        {certsList.length > 0 && (
          <div data-cv-section="certifications" style={{ marginBottom: '20px', ...getSectionBlurStyle('certifications', activeSection) }}>
            <SectionTitle>{isArabic ? 'الشهادات' : 'Certifications'}</SectionTitle>
            <ul style={{ margin: '0', paddingLeft: '18px', fontSize: '9.5pt', color: '#444', lineHeight: '1.7' }}>
              {certsList.map((cert, idx) => (
                <li key={idx} style={{ marginBottom: '3px' }}>
                  {cert.name}{cert.issuer && ` — ${cert.issuer}`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
