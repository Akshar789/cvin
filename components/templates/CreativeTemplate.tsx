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

interface CreativeTemplateProps {
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

export default function CreativeTemplate({ data, previewMode = false, isArabic = false, settings }: CreativeTemplateProps) {
  const personalInfo = data?.personalInfo || {};
  const experience = data?.experience || [];
  const education = data?.education || [];
  const skills = data?.skills;
  const languages = data?.languages || [];
  const certifications = data?.certifications || [];

  const activeSection = settings?.activeSection;

  const fullSummary = data?.professionalSummary || data?.summary || '';
  const fullName = personalInfo?.fullName || personalInfo?.name || 'Your Name';

  let primaryColor = '#6366f1';
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

  const levelToPercent = (level?: string): number => {
    if (!level) return 60;
    const l = level.toLowerCase();
    if (l.includes('native') || l.includes('expert') || l.includes('c2')) return 100;
    if (l.includes('fluent') || l.includes('advanced') || l.includes('c1')) return 85;
    if (l.includes('proficient') || l.includes('upper') || l.includes('b2')) return 70;
    if (l.includes('intermediate') || l.includes('b1')) return 55;
    if (l.includes('basic') || l.includes('elementary') || l.includes('a')) return 35;
    return 60;
  };

  const SectionTitle = ({ children, light }: { children: string; light?: boolean }) => (
    <h2 style={{
      fontSize: '12pt',
      fontWeight: 'bold',
      color: light ? '#FFFFFF' : primaryColor,
      marginBottom: '10px',
      marginTop: '0',
      textTransform: 'uppercase',
      letterSpacing: '1.5px',
      fontFamily: '"Segoe UI", Roboto, sans-serif'
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
        fontFamily: '"Segoe UI", Roboto, Arial, sans-serif',
        direction: isArabic ? 'rtl' : 'ltr',
        backgroundColor: '#FFFFFF',
        boxSizing: 'border-box',
        display: 'flex',
        color: '#333',
        fontSize: '10pt',
        lineHeight: '1.5'
      }}
    >
      <div style={{
        width: '30%',
        backgroundColor: primaryColor,
        color: '#FFFFFF',
        padding: '24px 18px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px'
      }}>
<div data-cv-section="personalInfo" style={getSectionBlurStyle('personalInfo', activeSection)}><div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.2)',
            margin: '0 auto 12px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '36px',
            border: '3px solid rgba(255,255,255,0.5)',
            overflow: 'hidden'
          }}>
            {(settings?.photoUrl || personalInfo?.photo) ? (
              <img src={settings?.photoUrl || personalInfo?.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
            ) : (
              <span>👤</span>
            )}
          </div>
          <h1 style={{
            fontSize: '16pt',
            fontWeight: 'bold',
            margin: '0 0 4px 0',
            lineHeight: '1.2'
          }}>
            {fullName}
          </h1>
          {getJobTitle(personalInfo, isArabic) && (
            <div style={{ fontSize: '9pt', opacity: 0.85, fontStyle: 'italic' }}>
              {getJobTitle(personalInfo, isArabic)}
            </div>
          )}
        </div>

        <div>
          <SectionTitle light>{isArabic ? 'التواصل' : 'Contact'}</SectionTitle>
          <div style={{ fontSize: '8.5pt', lineHeight: '2', opacity: 0.9 }}>
            {personalInfo?.phone && <div>📞 {personalInfo.phone}</div>}
            {personalInfo?.email && <div>✉ {personalInfo.email}</div>}
            {personalInfo?.location && <div>📍 {personalInfo.location}</div>}
            {personalInfo?.nationality && <div>🌍 {personalInfo.nationality}</div>}
            {personalInfo?.linkedin && <div>🔗 {personalInfo.linkedin}</div>}
          </div>
        </div></div>

        {skillsList.length > 0 && (
          <div data-cv-section="skills" style={getSectionBlurStyle('skills', activeSection)}>
            <SectionTitle light>{isArabic ? 'المهارات' : 'Skills'}</SectionTitle>
            {skillsList.map((skill, idx) => (
              <div key={idx} style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '8.5pt', marginBottom: '3px', opacity: 0.9 }}>{skill}</div>
                <div style={{
                  width: '100%',
                  height: '5px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.min(70 + (idx % 4) * 8, 100)}%`,
                    height: '100%',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    borderRadius: '3px'
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {languagesList.length > 0 && (
          <div data-cv-section="languages" style={getSectionBlurStyle('languages', activeSection)}>
            <SectionTitle light>{isArabic ? 'اللغات' : 'Languages'}</SectionTitle>
            {languagesList.map((lang, idx) => (
              <div key={idx} style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '8.5pt', marginBottom: '3px', opacity: 0.9 }}>
                  {lang.name}{lang.level && ` — ${lang.level}`}
                </div>
                <div style={{
                  width: '100%',
                  height: '5px',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${levelToPercent(lang.level)}%`,
                    height: '100%',
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    borderRadius: '3px'
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{
        width: '70%',
        padding: '24px 24px',
        boxSizing: 'border-box'
      }}>
        {fullSummary && (
          <div data-cv-section="summary" style={{ marginBottom: '22px', ...getSectionBlurStyle('summary', activeSection) }}>
            <SectionTitle>{isArabic ? 'الملخص المهني' : 'About Me'}</SectionTitle>
            <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_b]:font-bold [&_i]:italic" style={{
              fontSize: '10pt',
              color: '#555',
              lineHeight: '1.7',
              textAlign: 'justify',
              margin: '0'
            }} dangerouslySetInnerHTML={{ __html: fullSummary }} />
          </div>
        )}

        {experience.length > 0 && (
          <div data-cv-section="experience" style={{ marginBottom: '22px', ...getSectionBlurStyle('experience', activeSection) }}>
            <SectionTitle>{isArabic ? 'الخبرة المهنية' : 'Experience'}</SectionTitle>
            {experience.map((exp, idx) => {
              const experienceHtml = getExperienceHtml(exp);
              return (
                <div key={idx} style={{ marginBottom: '14px', paddingLeft: '12px', borderLeft: `3px solid ${primaryColor}20` }}>
                  <div style={{ fontSize: '11pt', fontWeight: 'bold', color: '#333' }}>
                    {exp.position || exp.title}
                  </div>
                  <div style={{ fontSize: '9.5pt', color: primaryColor, fontWeight: '600' }}>
                    {exp.company}{exp.location && ` • ${exp.location}`}
                  </div>
                  <div style={{ fontSize: '8.5pt', color: '#999', marginBottom: '6px' }}>
                    {exp.startDate} - {exp.endDate || (isArabic ? 'الحاضر' : 'Present')}
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

        {education.length > 0 && (
          <div data-cv-section="education" style={{ marginBottom: '22px', ...getSectionBlurStyle('education', activeSection) }}>
            <SectionTitle>{isArabic ? 'التعليم' : 'Education'}</SectionTitle>
            {education.map((edu, idx) => (
              <div key={idx} style={{ marginBottom: '10px', paddingLeft: '12px', borderLeft: `3px solid ${primaryColor}20` }}>
                <div style={{ fontSize: '11pt', fontWeight: 'bold', color: '#333' }}>
                  {edu.degree}{(edu.field || edu.fieldOfStudy) && ` in ${edu.field || edu.fieldOfStudy}`}
                </div>
                <div style={{ fontSize: '9.5pt', color: primaryColor }}>
                  {edu.institution || edu.school || 'Not provided'}
                </div>
                {(edu.endDate || edu.graduationYear) && (
                  <div style={{ fontSize: '8.5pt', color: '#999' }}>
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

        {certsList.length > 0 && (
          <div data-cv-section="certifications" style={{ marginBottom: '22px', ...getSectionBlurStyle('certifications', activeSection) }}>
            <SectionTitle>{isArabic ? 'الشهادات' : 'Certifications'}</SectionTitle>
            {certsList.map((cert, idx) => (
              <div key={idx} style={{
                display: 'inline-block',
                backgroundColor: `${primaryColor}10`,
                border: `1px solid ${primaryColor}30`,
                borderRadius: '8px',
                padding: '6px 12px',
                marginRight: '8px',
                marginBottom: '8px',
                fontSize: '9pt'
              }}>
                <strong>{cert.name}</strong>
                {cert.issuer && <span style={{ color: '#777' }}> — {cert.issuer}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
