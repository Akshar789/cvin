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

interface CompactTemplateProps {
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

export default function CompactTemplate({ data, previewMode = false, isArabic = false, settings }: CompactTemplateProps) {
  const personalInfo = data?.personalInfo || {};
  const experience = data?.experience || [];
  const education = data?.education || [];
  const skills = data?.skills;
  const languages = data?.languages || [];
  const certifications = data?.certifications || [];

  const activeSection = settings?.activeSection;

  const fullSummary = data?.professionalSummary || data?.summary || '';
  const fullName = personalInfo?.fullName || personalInfo?.name || 'Your Name';

  let primaryColor = '#374151';
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
      fontSize: '9.5pt',
      fontWeight: '700',
      color: primaryColor,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '4px',
      marginTop: '0',
      paddingBottom: '2px',
      borderBottom: `1px solid #d1d5db`,
      fontFamily: 'Arial, Helvetica, sans-serif'
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
        fontFamily: 'Arial, Helvetica, sans-serif',
        padding: '12mm 14mm',
        backgroundColor: '#FFFFFF',
        boxSizing: 'border-box',
        color: '#333',
        fontSize: '9pt',
        lineHeight: '1.35'
      }}
    >
      <div data-cv-section="personalInfo" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '8px',
        paddingBottom: '6px',
        borderBottom: `2px solid ${primaryColor}`,
        ...getSectionBlurStyle('personalInfo', activeSection)
      }}>
        <div>
          <h1 style={{
            fontSize: '20pt',
            fontWeight: '700',
            color: '#1a1a1a',
            margin: '0',
            fontFamily: 'Arial, Helvetica, sans-serif'
          }}>
            {fullName}
          </h1>
          {getJobTitle(personalInfo, isArabic) && (
            <div style={{ fontSize: '9pt', color: primaryColor, marginTop: '2px' }}>
              {getJobTitle(personalInfo, isArabic)}
            </div>
          )}
        </div>
        <div style={{
          textAlign: isArabic ? 'left' : 'right',
          fontSize: '8pt',
          color: '#666',
          lineHeight: '1.5',
          whiteSpace: 'nowrap'
        }}>
          {personalInfo?.phone && <div>{personalInfo.phone}</div>}
          {personalInfo?.email && <div>{personalInfo.email}</div>}
          {personalInfo?.location && <div>{personalInfo.location}</div>}
          {personalInfo?.nationality && <div>{personalInfo.nationality}</div>}
          {personalInfo?.linkedin && <div>{personalInfo.linkedin}</div>}
        </div>
      </div>

      {fullSummary && (
        <div data-cv-section="summary" style={{ marginBottom: '8px', ...getSectionBlurStyle('summary', activeSection) }}>
          <SectionTitle>{isArabic ? 'الملخص المهني' : 'SUMMARY'}</SectionTitle>
          <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_b]:font-bold [&_i]:italic" style={{
            fontSize: '8.5pt',
            color: '#444',
            lineHeight: '1.45',
            textAlign: 'justify',
            margin: '0'
          }} dangerouslySetInnerHTML={{ __html: fullSummary }} />
        </div>
      )}

      {experience.length > 0 && (
        <div data-cv-section="experience" style={{ marginBottom: '8px', ...getSectionBlurStyle('experience', activeSection) }}>
          <SectionTitle>{isArabic ? 'الخبرة المهنية' : 'EXPERIENCE'}</SectionTitle>
          {experience.map((exp, idx) => {
            const experienceHtml = getExperienceHtml(exp);
            return (
              <div key={idx} style={{ marginBottom: '8px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline'
                }}>
                  <div>
                    <span style={{ fontSize: '9pt', fontWeight: '700', color: '#1a1a1a' }}>
                      {exp.position || exp.title}
                    </span>
                    <span style={{ color: '#888', fontSize: '8.5pt' }}> | {exp.company}</span>
                    {exp.location && <span style={{ color: '#aaa', fontSize: '8pt' }}>, {exp.location}</span>}
                  </div>
                  <div style={{ fontSize: '8pt', color: primaryColor, whiteSpace: 'nowrap' }}>
                    {exp.startDate} – {exp.endDate || (isArabic ? 'الحاضر' : 'Present')}
                  </div>
                </div>
                {experienceHtml && (
                  <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-1 [&_li]:mb-0.5 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic" style={{
                    fontSize: '8.5pt',
                    color: '#555',
                    lineHeight: '1.4'
                  }} dangerouslySetInnerHTML={{ __html: experienceHtml }} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {education.length > 0 && (
        <div data-cv-section="education" style={{ marginBottom: '8px', ...getSectionBlurStyle('education', activeSection) }}>
          <SectionTitle>{isArabic ? 'التعليم' : 'EDUCATION'}</SectionTitle>
          {education.map((edu, idx) => (
            <div key={idx} style={{ marginBottom: '4px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline'
              }}>
                <div>
                  <span style={{ fontSize: '9pt', fontWeight: '600', color: '#1a1a1a' }}>
                    {edu.degree}{(edu.field || edu.fieldOfStudy) && ` in ${edu.field || edu.fieldOfStudy}`}
                  </span>
                  <span style={{ color: '#888', fontSize: '8.5pt' }}> — {edu.institution || edu.school}</span>
                </div>
                {(edu.endDate || edu.graduationYear) && (
                  <div style={{ fontSize: '8pt', color: primaryColor, whiteSpace: 'nowrap' }}>
                    {edu.startDate ? `${edu.startDate} – ${edu.endDate || 'Present'}` : edu.graduationYear || edu.endDate}
                  </div>
                )}
              </div>
              {edu.description && (
                <div style={{ fontSize: '8.5pt', color: '#666', lineHeight: '1.5', marginTop: '3px' }}>
                  {edu.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{
        display: 'flex',
        gap: '16px'
      }}>
        {skillsList.length > 0 && (
          <div data-cv-section="skills" style={{ flex: 1, marginBottom: '8px', ...getSectionBlurStyle('skills', activeSection) }}>
            <SectionTitle>{isArabic ? 'المهارات' : 'SKILLS'}</SectionTitle>
            <div style={{ fontSize: '8.5pt', color: '#555', lineHeight: '1.5' }}>
              {skillsList.join(' • ')}
            </div>
          </div>
        )}

        {languagesList.length > 0 && (
          <div data-cv-section="languages" style={{ flex: 1, marginBottom: '8px', ...getSectionBlurStyle('languages', activeSection) }}>
            <SectionTitle>{isArabic ? 'اللغات' : 'LANGUAGES'}</SectionTitle>
            <div style={{ fontSize: '8.5pt', color: '#555', lineHeight: '1.5' }}>
              {languagesList.map((lang, idx) => (
                <div key={idx}>
                  {lang.name}{lang.level && ` (${lang.level})`}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {certsList.length > 0 && (
        <div data-cv-section="certifications" style={{ marginBottom: '8px', ...getSectionBlurStyle('certifications', activeSection) }}>
          <SectionTitle>{isArabic ? 'الشهادات' : 'CERTIFICATIONS'}</SectionTitle>
          <div style={{ fontSize: '8.5pt', color: '#555', lineHeight: '1.5' }}>
            {certsList.map((cert, idx) => (
              <span key={idx}>
                {cert.name}{cert.issuer && ` (${cert.issuer})`}
                {idx < certsList.length - 1 && ' • '}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
