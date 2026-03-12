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

interface TwoColumnProTemplateProps {
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

export default function TwoColumnProTemplate({ data, previewMode = false, isArabic = false, settings }: TwoColumnProTemplateProps) {
  const personalInfo = data?.personalInfo || {};
  const experience = data?.experience || [];
  const education = data?.education || [];
  const skills = data?.skills;
  const languages = data?.languages || [];
  const certifications = data?.certifications || [];

  const activeSection = settings?.activeSection;

  const fullSummary = data?.professionalSummary || data?.summary || '';
  const fullName = personalInfo?.fullName || personalInfo?.name || 'Your Name';

  let primaryColor = '#1d4ed8';
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


  const SectionTitle = ({ children }: { children: string }) => (
    <h2 style={{
      fontSize: '11pt',
      fontWeight: '700',
      color: primaryColor,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '10px',
      marginTop: '0',
      paddingBottom: '4px',
      borderBottom: `1.5px solid ${primaryColor}30`,
      fontFamily: 'Arial, Helvetica, sans-serif'
    }}>
      {children}
    </h2>
  );

  const SidebarSectionTitle = ({ children }: { children: string }) => (
    <h2 style={{
      fontSize: '10pt',
      fontWeight: '700',
      color: primaryColor,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '8px',
      marginTop: '0',
      paddingBottom: '4px',
      borderBottom: `1.5px solid ${primaryColor}25`,
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
        backgroundColor: '#FFFFFF',
        boxSizing: 'border-box',
        color: '#333',
        fontSize: '10pt',
        lineHeight: '1.5'
      }}
    >
      <div data-cv-section="personalInfo" style={{
        backgroundColor: headerBg,
        padding: '22px 18mm',
        color: '#ffffff',
        ...getSectionBlurStyle('personalInfo', activeSection)
      }}>
        <h1 style={{
          fontSize: '26pt',
          fontWeight: '700',
          margin: '0 0 2px 0',
          letterSpacing: '1px',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          {fullName}
        </h1>
        {getJobTitle(personalInfo, isArabic) && (
          <div style={{
            fontSize: '12pt',
            opacity: 0.9,
            fontWeight: '300',
            letterSpacing: '0.5px',
            marginBottom: '8px'
          }}>
            {getJobTitle(personalInfo, isArabic)}
          </div>
        )}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '9pt',
          opacity: 0.9
        }}>
          {personalInfo?.phone && <span>{personalInfo.phone}</span>}
          {personalInfo?.email && <span>{personalInfo.email}</span>}
          {personalInfo?.location && <span>{personalInfo.location}</span>}
          {personalInfo?.nationality && <span>{personalInfo.nationality}</span>}
          {personalInfo?.linkedin && <span>{personalInfo.linkedin}</span>}
        </div>
      </div>

      <div style={{
        display: 'flex',
        padding: '0'
      }}>
        <div style={{
          flex: '0 0 60%',
          padding: '20px 16px 20px 18mm'
        }}>
          {fullSummary && (
            <div data-cv-section="summary" style={{ marginBottom: '20px', ...getSectionBlurStyle('summary', activeSection) }}>
              <SectionTitle>{isArabic ? 'الملخص المهني' : 'Professional Summary'}</SectionTitle>
              <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_b]:font-bold [&_i]:italic" style={{
                fontSize: '10pt',
                color: '#555',
                lineHeight: '1.65',
                textAlign: 'justify',
                margin: '0'
              }} dangerouslySetInnerHTML={{ __html: fullSummary }} />
            </div>
          )}

          {experience.length > 0 && (
            <div data-cv-section="experience" style={{ marginBottom: '20px', ...getSectionBlurStyle('experience', activeSection) }}>
              <SectionTitle>{isArabic ? 'الخبرة المهنية' : 'Experience'}</SectionTitle>
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
                      <div style={{ fontSize: '10.5pt', fontWeight: '700', color: '#1a1a1a' }}>
                        {exp.position || exp.title}
                      </div>
                      <div style={{ fontSize: '8.5pt', color: primaryColor }}>
                        {exp.startDate} – {exp.endDate || (isArabic ? 'الحاضر' : 'Present')}
                      </div>
                    </div>
                    <div style={{ fontSize: '9.5pt', color: '#777', marginBottom: '5px' }}>
                      {exp.company}{exp.location && `, ${exp.location}`}
                    </div>
                    {experienceHtml && (
                      <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-1 [&_li]:mb-0.5 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic" style={{
                        fontSize: '9pt',
                        color: '#555',
                        lineHeight: '1.6'
                      }} dangerouslySetInnerHTML={{ __html: experienceHtml }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{
          flex: '0 0 40%',
          padding: '20px 18mm 20px 16px',
          backgroundColor: `${primaryColor}06`
        }}>
          {education.length > 0 && (
            <div data-cv-section="education" style={{ marginBottom: '18px', ...getSectionBlurStyle('education', activeSection) }}>
              <SidebarSectionTitle>{isArabic ? 'التعليم' : 'Education'}</SidebarSectionTitle>
              {education.map((edu, idx) => (
                <div key={idx} style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '10pt', fontWeight: '600', color: '#1a1a1a' }}>
                    {edu.degree}
                  </div>
                  {(edu.field || edu.fieldOfStudy) && (
                    <div style={{ fontSize: '9pt', color: '#555' }}>
                      {edu.field || edu.fieldOfStudy}
                    </div>
                  )}
                  <div style={{ fontSize: '9pt', color: '#777' }}>
                    {edu.institution || edu.school}
                  </div>
                  {(edu.endDate || edu.graduationYear) && (
                    <div style={{ fontSize: '8.5pt', color: primaryColor }}>
                      {edu.startDate ? `${edu.startDate} – ${edu.endDate || 'Present'}` : edu.graduationYear || edu.endDate}
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
            <div data-cv-section="skills" style={{ marginBottom: '18px', ...getSectionBlurStyle('skills', activeSection) }}>
              <SidebarSectionTitle>{isArabic ? 'المهارات' : 'Skills'}</SidebarSectionTitle>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {skillsList.map((skill, idx) => (
                  <span key={idx} style={{
                    display: 'inline-block',
                    backgroundColor: `${primaryColor}12`,
                    color: primaryColor,
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '8.5pt',
                    fontWeight: '500'
                  }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {languagesList.length > 0 && (
            <div data-cv-section="languages" style={{ marginBottom: '18px', ...getSectionBlurStyle('languages', activeSection) }}>
              <SidebarSectionTitle>{isArabic ? 'اللغات' : 'Languages'}</SidebarSectionTitle>
              <div style={{ fontSize: '9pt', color: '#555', lineHeight: '1.7' }}>
                {languagesList.map((lang, idx) => (
                  <div key={idx}>
                    <strong style={{ color: '#333' }}>{lang.name}</strong>
                    {lang.level && ` — ${lang.level}`}
                  </div>
                ))}
              </div>
            </div>
          )}

          {certsList.length > 0 && (
            <div data-cv-section="certifications" style={{ marginBottom: '18px', ...getSectionBlurStyle('certifications', activeSection) }}>
              <SidebarSectionTitle>{isArabic ? 'الشهادات' : 'Certifications'}</SidebarSectionTitle>
              <div style={{ fontSize: '9pt', color: '#555', lineHeight: '1.7' }}>
                {certsList.map((cert, idx) => (
                  <div key={idx}>
                    {cert.name}
                    {cert.issuer && <span style={{ color: '#999' }}> — {cert.issuer}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
