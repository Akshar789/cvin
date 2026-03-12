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

interface SmartTemplateProps {
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

export default function SmartTemplate({ data, previewMode = false, isArabic = false, settings }: SmartTemplateProps) {
  const personalInfo = data?.personalInfo || {};
  const experience = data?.experience || [];
  const education = data?.education || [];
  const skills = data?.skills;
  const languages = data?.languages || [];
  const certifications = data?.certifications || [];

  const activeSection = settings?.activeSection;

  const fullSummary = data?.professionalSummary || data?.summary || '';
  const fullName = personalInfo?.fullName || personalInfo?.name || 'Your Name';

  let primaryColor = '#0ea5e9';
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

  const SectionIcon = ({ icon }: { icon: string }) => (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '22px',
      height: '22px',
      borderRadius: '4px',
      backgroundColor: `${primaryColor}18`,
      color: primaryColor,
      fontSize: '12px',
      marginRight: isArabic ? '0' : '8px',
      marginLeft: isArabic ? '8px' : '0',
      flexShrink: 0
    }}>{icon}</span>
  );

  const SectionTitle = ({ children, icon }: { children: string; icon: string }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      marginBottom: '12px',
      paddingBottom: '6px',
      borderBottom: `1px solid #e5e7eb`
    }}>
      <SectionIcon icon={icon} />
      <h2 style={{
        fontSize: '12pt',
        fontWeight: '600',
        color: '#1f2937',
        margin: '0',
        letterSpacing: '0.3px',
        fontFamily: '"Segoe UI", Roboto, Arial, sans-serif'
      }}>
        {children}
      </h2>
    </div>
  );

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`${previewMode ? 'scale-75 origin-top' : ''}`}
      style={{
        width: '210mm',
        minHeight: '297mm',
        fontFamily: '"Segoe UI", Roboto, Arial, sans-serif',
        backgroundColor: '#FFFFFF',
        boxSizing: 'border-box',
        color: '#374151',
        fontSize: '10pt',
        lineHeight: '1.5'
      }}
    >
      <div data-cv-section="personalInfo" style={{
        backgroundColor: headerBg,
        padding: '24px 18mm',
        color: '#ffffff',
        ...getSectionBlurStyle('personalInfo', activeSection)
      }}>
        <h1 style={{
          fontSize: '26pt',
          fontWeight: '700',
          margin: '0 0 4px 0',
          fontFamily: '"Segoe UI", Roboto, Arial, sans-serif',
          letterSpacing: '0.5px'
        }}>
          {fullName}
        </h1>
        {getJobTitle(personalInfo, isArabic) && (
          <div style={{
            fontSize: '12pt',
            opacity: 0.9,
            marginBottom: '12px',
            fontWeight: '300'
          }}>
            {getJobTitle(personalInfo, isArabic)}
          </div>
        )}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          fontSize: '9pt',
          opacity: 0.95
        }}>
          {personalInfo?.phone && <span>📞 {personalInfo.phone}</span>}
          {personalInfo?.email && <span>✉ {personalInfo.email}</span>}
          {personalInfo?.location && <span>📍 {personalInfo.location}</span>}
          {personalInfo?.nationality && <span>🌍 {personalInfo.nationality}</span>}
          {personalInfo?.linkedin && <span>🔗 {personalInfo.linkedin}</span>}
        </div>
      </div>

      <div style={{ padding: '20px 18mm' }}>
        {fullSummary && (
          <div data-cv-section="summary" style={{ marginBottom: '22px', ...getSectionBlurStyle('summary', activeSection) }}>
            <SectionTitle icon="📋">{isArabic ? 'الملخص المهني' : 'Professional Summary'}</SectionTitle>
            <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_b]:font-bold [&_i]:italic" style={{
              fontSize: '10pt',
              color: '#4b5563',
              lineHeight: '1.7',
              textAlign: 'justify',
              margin: '0'
            }} dangerouslySetInnerHTML={{ __html: fullSummary }} />
          </div>
        )}

        {experience.length > 0 && (
          <div data-cv-section="experience" style={{ marginBottom: '22px', ...getSectionBlurStyle('experience', activeSection) }}>
            <SectionTitle icon="💼">{isArabic ? 'الخبرة المهنية' : 'Experience'}</SectionTitle>
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
                    <div style={{ fontSize: '11pt', fontWeight: '600', color: '#1f2937' }}>
                      {exp.position || exp.title}
                    </div>
                    <div style={{ fontSize: '9pt', color: primaryColor, fontWeight: '500' }}>
                      {exp.startDate} – {exp.endDate || (isArabic ? 'الحاضر' : 'Present')}
                    </div>
                  </div>
                  <div style={{ fontSize: '10pt', color: '#6b7280', marginBottom: '6px' }}>
                    {exp.company}{exp.location && ` · ${exp.location}`}
                  </div>
                  {experienceHtml && (
                    <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-1 [&_li]:mb-0.5 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic" style={{
                      fontSize: '9pt',
                      color: '#4b5563',
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
            <SectionTitle icon="🎓">{isArabic ? 'التعليم' : 'Education'}</SectionTitle>
            {education.map((edu, idx) => (
              <div key={idx} style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '11pt', fontWeight: '600', color: '#1f2937' }}>
                  {edu.degree}{(edu.field || edu.fieldOfStudy) && ` in ${edu.field || edu.fieldOfStudy}`}
                </div>
                <div style={{ fontSize: '10pt', color: '#6b7280' }}>
                  {edu.institution || edu.school}
                </div>
                {(edu.endDate || edu.graduationYear) && (
                  <div style={{ fontSize: '9pt', color: primaryColor }}>
                    {edu.startDate ? `${edu.startDate} – ${edu.endDate || 'Present'}` : edu.graduationYear || edu.endDate}
                  </div>
                )}
                {edu.description && (
                  <div style={{ fontSize: '9pt', color: '#4b5563', lineHeight: '1.5', marginTop: '3px' }}>
                    {edu.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {skillsList.length > 0 && (
          <div data-cv-section="skills" style={{ marginBottom: '22px', ...getSectionBlurStyle('skills', activeSection) }}>
            <SectionTitle icon="⚡">{isArabic ? 'المهارات' : 'Skills'}</SectionTitle>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {skillsList.map((skill, idx) => (
                <span key={idx} style={{
                  display: 'inline-block',
                  backgroundColor: `${primaryColor}15`,
                  color: primaryColor,
                  padding: '4px 12px',
                  borderRadius: '14px',
                  fontSize: '9pt',
                  fontWeight: '500',
                  border: `1px solid ${primaryColor}30`
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {certsList.length > 0 && (
          <div data-cv-section="certifications" style={{ marginBottom: '22px', ...getSectionBlurStyle('certifications', activeSection) }}>
            <SectionTitle icon="🏆">{isArabic ? 'الشهادات' : 'Certifications'}</SectionTitle>
            <ul style={{
              margin: '0',
              paddingLeft: isArabic ? '0' : '18px',
              paddingRight: isArabic ? '18px' : '0',
              fontSize: '9pt',
              color: '#4b5563',
              lineHeight: '1.7'
            }}>
              {certsList.map((cert, idx) => (
                <li key={idx} style={{ marginBottom: '3px' }}>
                  {cert.name}{cert.issuer && ` – ${cert.issuer}`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {languagesList.length > 0 && (
          <div data-cv-section="languages" style={{ marginBottom: '22px', ...getSectionBlurStyle('languages', activeSection) }}>
            <SectionTitle icon="🌐">{isArabic ? 'اللغات' : 'Languages'}</SectionTitle>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '9pt' }}>
              {languagesList.map((lang, idx) => (
                <span key={idx} style={{ color: '#4b5563' }}>
                  <strong style={{ color: '#1f2937' }}>{lang.name}</strong>
                  {lang.level && ` — ${lang.level}`}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
