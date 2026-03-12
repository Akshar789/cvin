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

interface ElegantTemplateProps {
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

export default function ElegantTemplate({ data, previewMode = false, isArabic = false, settings }: ElegantTemplateProps) {
  const personalInfo = data?.personalInfo || {};
  const experience = data?.experience || [];
  const education = data?.education || [];
  const skills = data?.skills;
  const languages = data?.languages || [];
  const certifications = data?.certifications || [];

  const activeSection = settings?.activeSection;

  const fullSummary = data?.professionalSummary || data?.summary || '';
  const fullName = personalInfo?.fullName || personalInfo?.name || 'Your Name';

  let primaryColor = '#6b7280';
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
    <div style={{ textAlign: 'center', marginBottom: '14px' }}>
      <h2 style={{
        fontSize: '12pt',
        fontWeight: '400',
        color: primaryColor,
        letterSpacing: '3px',
        textTransform: 'uppercase',
        margin: '0 0 6px 0',
        fontFamily: 'Georgia, "Times New Roman", serif'
      }}>
        {children}
      </h2>
      <div style={{
        width: '40px',
        height: '1px',
        backgroundColor: primaryColor,
        margin: '0 auto',
        opacity: 0.5
      }} />
    </div>
  );

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`${previewMode ? 'scale-75 origin-top' : ''}`}
      style={{
        width: '210mm',
        minHeight: '297mm',
        fontFamily: 'Georgia, "Times New Roman", serif',
        padding: '20mm 22mm',
        backgroundColor: '#FFFFFF',
        boxSizing: 'border-box',
        color: '#444444',
        fontSize: '10pt',
        lineHeight: '1.6'
      }}
    >
      <div data-cv-section="personalInfo" style={{ textAlign: 'center', marginBottom: '20px', ...getSectionBlurStyle('personalInfo', activeSection) }}>
        <h1 style={{
          fontSize: '32pt',
          fontWeight: '400',
          color: '#2d2d2d',
          margin: '0 0 8px 0',
          fontFamily: 'Georgia, "Times New Roman", serif',
          letterSpacing: '2px'
        }}>
          {fullName}
        </h1>
        <div style={{
          width: '60px',
          height: '1px',
          backgroundColor: primaryColor,
          margin: '0 auto 10px auto'
        }} />
        {getJobTitle(personalInfo, isArabic) && (
          <div style={{
            fontSize: '11pt',
            color: primaryColor,
            fontStyle: 'italic',
            marginBottom: '10px',
            letterSpacing: '1px'
          }}>
            {getJobTitle(personalInfo, isArabic)}
          </div>
        )}
        <div style={{
          fontSize: '8.5pt',
          color: '#888',
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          {personalInfo?.phone && <span>{personalInfo.phone}</span>}
          {personalInfo?.email && <span>{personalInfo.email}</span>}
          {personalInfo?.location && <span>{personalInfo.location}</span>}
          {personalInfo?.nationality && <span>{personalInfo.nationality}</span>}
          {personalInfo?.linkedin && <span>{personalInfo.linkedin}</span>}
        </div>
      </div>

      {fullSummary && (
        <div data-cv-section="summary" style={{ marginBottom: '24px', ...getSectionBlurStyle('summary', activeSection) }}>
          <SectionTitle>{isArabic ? 'الملخص المهني' : 'Summary'}</SectionTitle>
          <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_b]:font-bold [&_i]:italic" style={{
            fontSize: '10pt',
            color: '#555',
            lineHeight: '1.75',
            textAlign: 'center',
            fontStyle: 'italic',
            margin: '0',
            padding: '0 20px'
          }} dangerouslySetInnerHTML={{ __html: fullSummary }} />
        </div>
      )}

      {experience.length > 0 && (
        <div data-cv-section="experience" style={{ marginBottom: '24px', ...getSectionBlurStyle('experience', activeSection) }}>
          <SectionTitle>{isArabic ? 'الخبرة المهنية' : 'Experience'}</SectionTitle>
          {experience.map((exp, idx) => {
            const experienceHtml = getExperienceHtml(exp);
            return (
              <div key={idx} style={{ marginBottom: '16px' }}>
                <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                  <div style={{
                    fontSize: '11pt',
                    fontWeight: '600',
                    color: '#2d2d2d',
                    fontFamily: 'Georgia, "Times New Roman", serif'
                  }}>
                    {exp.position || exp.title}
                  </div>
                  <div style={{ fontSize: '10pt', color: '#777', fontStyle: 'italic' }}>
                    {exp.company}{exp.location && `, ${exp.location}`}
                  </div>
                  <div style={{ fontSize: '9pt', color: primaryColor }}>
                    {exp.startDate} – {exp.endDate || (isArabic ? 'الحاضر' : 'Present')}
                  </div>
                </div>
                {experienceHtml && (
                  <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-1 [&_li]:mb-0.5 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic" style={{
                    fontSize: '9pt',
                    color: '#555',
                    lineHeight: '1.7'
                  }} dangerouslySetInnerHTML={{ __html: experienceHtml }} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {education.length > 0 && (
        <div data-cv-section="education" style={{ marginBottom: '24px', ...getSectionBlurStyle('education', activeSection) }}>
          <SectionTitle>{isArabic ? 'التعليم' : 'Education'}</SectionTitle>
          {education.map((edu, idx) => (
            <div key={idx} style={{ textAlign: 'center', marginBottom: '10px' }}>
              <div style={{
                fontSize: '11pt',
                fontWeight: '600',
                color: '#2d2d2d',
                fontFamily: 'Georgia, "Times New Roman", serif'
              }}>
                {edu.degree}{(edu.field || edu.fieldOfStudy) && ` in ${edu.field || edu.fieldOfStudy}`}
              </div>
              <div style={{ fontSize: '10pt', color: '#777', fontStyle: 'italic' }}>
                {edu.institution || edu.school}
              </div>
              {(edu.endDate || edu.graduationYear) && (
                <div style={{ fontSize: '9pt', color: primaryColor }}>
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
        <div data-cv-section="skills" style={{ marginBottom: '24px', ...getSectionBlurStyle('skills', activeSection) }}>
          <SectionTitle>{isArabic ? 'المهارات' : 'Skills'}</SectionTitle>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
            {skillsList.map((skill, idx) => (
              <span key={idx} style={{
                display: 'inline-block',
                padding: '4px 16px',
                borderRadius: '20px',
                fontSize: '9pt',
                color: primaryColor,
                border: `1px solid ${primaryColor}50`,
                backgroundColor: `${primaryColor}08`
              }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {certsList.length > 0 && (
        <div data-cv-section="certifications" style={{ marginBottom: '24px', ...getSectionBlurStyle('certifications', activeSection) }}>
          <SectionTitle>{isArabic ? 'الشهادات' : 'Certifications'}</SectionTitle>
          <div style={{ textAlign: 'center', fontSize: '9pt', color: '#555', lineHeight: '1.8' }}>
            {certsList.map((cert, idx) => (
              <div key={idx}>
                {cert.name}{cert.issuer && <span style={{ color: '#999' }}> — {cert.issuer}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {languagesList.length > 0 && (
        <div data-cv-section="languages" style={{ marginBottom: '24px', ...getSectionBlurStyle('languages', activeSection) }}>
          <SectionTitle>{isArabic ? 'اللغات' : 'Languages'}</SectionTitle>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '9pt',
            color: '#555'
          }}>
            {languagesList.map((lang, idx) => (
              <span key={idx}>
                {lang.name}{lang.level && <span style={{ color: '#999' }}> ({lang.level})</span>}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
