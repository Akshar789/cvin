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

interface ExecutiveCleanProTemplateProps {
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

export default function ExecutiveCleanProTemplate({ data, previewMode = false, isArabic = false, settings }: ExecutiveCleanProTemplateProps) {
  const personalInfo = data?.personalInfo || {};
  const experience = data?.experience || [];
  const education = data?.education || [];
  const skills = data?.skills;
  const languages = data?.languages || [];
  const certifications = data?.certifications || [];

  const activeSection = settings?.activeSection;

  const fullSummary = data?.professionalSummary || data?.summary || '';
  const fullName = personalInfo?.fullName || personalInfo?.name || 'Your Name';

  let primaryColor = '#2c2c2c';
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

  const contactItems = [
    personalInfo?.phone,
    personalInfo?.email,
    personalInfo?.location,
    personalInfo?.nationality,
    personalInfo?.linkedin
  ].filter(Boolean);

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`${previewMode ? 'scale-75 origin-top' : ''}`}
      style={{
        width: '210mm',
        minHeight: '297mm',
        fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif',
        direction: isArabic ? 'rtl' : 'ltr',
        padding: '20mm',
        backgroundColor: '#FFFFFF',
        boxSizing: 'border-box',
        color: '#333',
        fontSize: '10pt',
        lineHeight: '1.5'
      }}
    >
<div data-cv-section="personalInfo" style={getSectionBlurStyle('personalInfo', activeSection)}><div style={{ textAlign: 'center', marginBottom: '6px' }}>
        <h1 style={{
          fontSize: '24pt',
          fontWeight: '300',
          color: '#1a1a1a',
          margin: '0',
          textTransform: 'uppercase',
          letterSpacing: '4px'
        }}>
          {fullName}
        </h1>
      </div>

      {getJobTitle(personalInfo, isArabic) && (
        <div style={{
          textAlign: 'center',
          fontSize: '11pt',
          color: '#666',
          marginBottom: '10px',
          letterSpacing: '1px'
        }}>
          {getJobTitle(personalInfo, isArabic)}
        </div>
      )}

      <div style={{
        borderTop: `1px solid ${primaryColor}`,
        borderBottom: '1px solid #ddd',
        padding: '8px 0',
        textAlign: 'center',
        fontSize: '9pt',
        color: '#555',
        marginBottom: '20px'
      }}>
        {contactItems.join('  |  ')}
      </div></div>

      {fullSummary && (
        <div data-cv-section="summary" style={getSectionBlurStyle('summary', activeSection)}>
          <h2 style={{
            fontSize: '11pt',
            fontWeight: '600',
            color: '#1a1a1a',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginTop: '0',
            marginBottom: '8px'
          }}>
            {isArabic ? 'الملخص المهني' : 'Professional Summary'}
          </h2>
          <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_b]:font-bold [&_i]:italic" style={{
            fontSize: '10pt',
            color: '#444',
            lineHeight: '1.7',
            textAlign: 'justify',
            margin: '0 0 16px 0'
          }} dangerouslySetInnerHTML={{ __html: fullSummary }} />
          <hr style={{ border: 'none', borderTop: '1px solid #e5e5e5', margin: '16px 0' }} />
        </div>
      )}

      {experience.length > 0 && (
        <div data-cv-section="experience" style={getSectionBlurStyle('experience', activeSection)}>
          <h2 style={{
            fontSize: '11pt',
            fontWeight: '600',
            color: '#1a1a1a',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginTop: '0',
            marginBottom: '10px'
          }}>
            {isArabic ? 'الخبرة المهنية' : 'Experience'}
          </h2>
          {experience.map((exp, idx) => {
            const experienceHtml = getExperienceHtml(exp);
            return (
              <div key={idx} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <span style={{ fontSize: '10.5pt', fontWeight: 'bold', color: '#1a1a1a' }}>
                      {exp.position || exp.title}
                    </span>
                    <span style={{ color: '#999', margin: '0 6px' }}>|</span>
                    <span style={{ fontSize: '10pt', color: '#555' }}>
                      {exp.company}{exp.location && `, ${exp.location}`}
                    </span>
                  </div>
                  <span style={{ fontSize: '9pt', color: '#888', whiteSpace: 'nowrap' }}>
                    {exp.startDate} – {exp.endDate || (isArabic ? 'الحاضر' : 'Present')}
                  </span>
                </div>
                {experienceHtml && (
                  <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-1 [&_li]:mb-0.5 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic" style={{
                    fontSize: '9pt',
                    color: '#444',
                    lineHeight: '1.6'
                  }} dangerouslySetInnerHTML={{ __html: experienceHtml }} />
                )}
              </div>
            );
          })}
          <hr style={{ border: 'none', borderTop: '1px solid #e5e5e5', margin: '16px 0' }} />
        </div>
      )}

      {education.length > 0 && (
        <div data-cv-section="education" style={getSectionBlurStyle('education', activeSection)}>
          <h2 style={{
            fontSize: '11pt',
            fontWeight: '600',
            color: '#1a1a1a',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginTop: '0',
            marginBottom: '10px'
          }}>
            {isArabic ? 'التعليم' : 'Education'}
          </h2>
          {education.map((edu, idx) => (
            <div key={idx} style={{ marginBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <span style={{ fontSize: '10.5pt', fontWeight: 'bold', color: '#1a1a1a' }}>
                    {edu.degree}{(edu.field || edu.fieldOfStudy) && `, ${edu.field || edu.fieldOfStudy}`}
                  </span>
                  <span style={{ color: '#999', margin: '0 6px' }}>|</span>
                  <span style={{ fontSize: '10pt', color: '#555' }}>
                    {edu.institution || edu.school}
                  </span>
                </div>
                {(edu.endDate || edu.graduationYear) && (
                  <span style={{ fontSize: '9pt', color: '#888', whiteSpace: 'nowrap' }}>
                    {edu.startDate ? `${edu.startDate} – ${edu.endDate || 'Present'}` : edu.graduationYear || edu.endDate}
                  </span>
                )}
              </div>
              {edu.description && (
                <div style={{ fontSize: '9pt', color: '#444', lineHeight: '1.5', marginTop: '3px' }}>
                  {edu.description}
                </div>
              )}
            </div>
          ))}
          <hr style={{ border: 'none', borderTop: '1px solid #e5e5e5', margin: '16px 0' }} />
        </div>
      )}

      {skillsList.length > 0 && (
        <div data-cv-section="skills" style={getSectionBlurStyle('skills', activeSection)}>
          <h2 style={{
            fontSize: '11pt',
            fontWeight: '600',
            color: '#1a1a1a',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginTop: '0',
            marginBottom: '8px'
          }}>
            {isArabic ? 'المهارات' : 'Skills'}
          </h2>
          <p style={{ fontSize: '9.5pt', color: '#444', margin: '0 0 16px 0', lineHeight: '1.8' }}>
            {skillsList.join('  •  ')}
          </p>
          <hr style={{ border: 'none', borderTop: '1px solid #e5e5e5', margin: '16px 0' }} />
        </div>
      )}

      {languagesList.length > 0 && (
        <div data-cv-section="languages" style={getSectionBlurStyle('languages', activeSection)}>
          <h2 style={{
            fontSize: '11pt',
            fontWeight: '600',
            color: '#1a1a1a',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginTop: '0',
            marginBottom: '8px'
          }}>
            {isArabic ? 'اللغات' : 'Languages'}
          </h2>
          <p style={{ fontSize: '9.5pt', color: '#444', margin: '0 0 16px 0' }}>
            {languagesList.map(l => `${l.name}${l.level ? ` (${l.level})` : ''}`).join('  •  ')}
          </p>
          <hr style={{ border: 'none', borderTop: '1px solid #e5e5e5', margin: '16px 0' }} />
        </div>
      )}

      {certsList.length > 0 && (
        <div data-cv-section="certifications" style={getSectionBlurStyle('certifications', activeSection)}>
          <h2 style={{
            fontSize: '11pt',
            fontWeight: '600',
            color: '#1a1a1a',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            marginTop: '0',
            marginBottom: '8px'
          }}>
            {isArabic ? 'الشهادات' : 'Certifications'}
          </h2>
          <ul style={{ margin: '0', paddingLeft: '18px', fontSize: '9.5pt', color: '#444', lineHeight: '1.7' }}>
            {certsList.map((cert, idx) => (
              <li key={idx} style={{ marginBottom: '2px' }}>
                {cert.name}{cert.issuer && ` — ${cert.issuer}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
