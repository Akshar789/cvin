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

interface ATSUltraProTemplateProps {
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

export default function ATSUltraProTemplate({ data, previewMode = false, isArabic = false, settings }: ATSUltraProTemplateProps) {
  const personalInfo = data?.personalInfo || {};
  const experience = data?.experience || [];
  const education = data?.education || [];
  const skills = data?.skills;
  const languages = data?.languages || [];
  const certifications = data?.certifications || [];

  const activeSection = settings?.activeSection;

  const fullSummary = data?.professionalSummary || data?.summary || '';
  const fullName = personalInfo?.fullName || personalInfo?.name || 'Your Name';

  let headerBg = '#f5f5f5';
  if (settings?.headerBg && typeof settings.headerBg === 'string' && settings.headerBg.trim()) {
    headerBg = settings.headerBg.trim();
    if (!headerBg.startsWith('#')) {
      headerBg = '#' + headerBg;
    }
  } else if (settings?.primaryColor && typeof settings.primaryColor === 'string' && settings.primaryColor.trim()) {
    headerBg = settings.primaryColor.trim() + '10';
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
        fontFamily: 'Arial, Helvetica, sans-serif',
        direction: isArabic ? 'rtl' : 'ltr',
        backgroundColor: '#FFFFFF',
        boxSizing: 'border-box',
        color: '#000',
        fontSize: '10pt',
        lineHeight: '1.5'
      }}
    >
      <div data-cv-section="personalInfo" style={{
        backgroundColor: headerBg,
        padding: '18px 24px',
        borderBottom: '1px solid #ddd',
        ...getSectionBlurStyle('personalInfo', activeSection)
      }}>
        <h1 style={{
          fontSize: '22pt',
          fontWeight: 'bold',
          color: '#000',
          margin: '0 0 2px 0'
        }}>
          {fullName}
        </h1>
        {getJobTitle(personalInfo, isArabic) && (
          <div style={{
            fontSize: '11pt',
            color: '#333',
            marginBottom: '6px'
          }}>
            {getJobTitle(personalInfo, isArabic)}
          </div>
        )}
        <div style={{ fontSize: '9pt', color: '#444' }}>
          {contactItems.join('  |  ')}
        </div>
      </div>

      <div style={{ padding: '18px 24px' }}>
        {fullSummary && (
          <div data-cv-section="summary" style={{ marginBottom: '18px', ...getSectionBlurStyle('summary', activeSection) }}>
            <h2 style={{
              fontSize: '11pt',
              fontWeight: 'bold',
              color: '#000',
              textTransform: 'uppercase',
              marginTop: '0',
              marginBottom: '6px',
              letterSpacing: '1px'
            }}>
              {isArabic ? 'الملخص المهني' : 'PROFESSIONAL SUMMARY'}
            </h2>
            <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_b]:font-bold [&_i]:italic" style={{
              fontSize: '10pt',
              color: '#222',
              lineHeight: '1.65',
              textAlign: 'justify',
              margin: '0'
            }} dangerouslySetInnerHTML={{ __html: fullSummary }} />
          </div>
        )}

        {experience.length > 0 && (
          <div data-cv-section="experience" style={{ marginBottom: '18px', ...getSectionBlurStyle('experience', activeSection) }}>
            <h2 style={{
              fontSize: '11pt',
              fontWeight: 'bold',
              color: '#000',
              textTransform: 'uppercase',
              marginTop: '0',
              marginBottom: '8px',
              letterSpacing: '1px'
            }}>
              {isArabic ? 'الخبرة المهنية' : 'WORK EXPERIENCE'}
            </h2>
            {experience.map((exp, idx) => {
              const experienceHtml = getExperienceHtml(exp);
              return (
                <div key={idx} style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '10.5pt', fontWeight: 'bold', color: '#000' }}>
                    {exp.position || exp.title}
                  </div>
                  <div style={{ fontSize: '10pt', color: '#333' }}>
                    {exp.company}{exp.location && `, ${exp.location}`}
                  </div>
                  <div style={{ fontSize: '9pt', color: '#666', marginBottom: '5px' }}>
                    {exp.startDate} - {exp.endDate || (isArabic ? 'الحاضر' : 'Present')}
                  </div>
                  {experienceHtml && (
                    <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-1 [&_li]:mb-0.5 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic" style={{
                      fontSize: '9.5pt',
                      color: '#222',
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
            <h2 style={{
              fontSize: '11pt',
              fontWeight: 'bold',
              color: '#000',
              textTransform: 'uppercase',
              marginTop: '0',
              marginBottom: '8px',
              letterSpacing: '1px'
            }}>
              {isArabic ? 'التعليم' : 'EDUCATION'}
            </h2>
            {education.map((edu, idx) => (
              <div key={idx} style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '10.5pt', fontWeight: 'bold', color: '#000' }}>
                  {edu.degree}{(edu.field || edu.fieldOfStudy) && ` in ${edu.field || edu.fieldOfStudy}`}
                </div>
                <div style={{ fontSize: '10pt', color: '#333' }}>
                  {edu.institution || edu.school || 'Not provided'}
                </div>
                {(edu.endDate || edu.graduationYear) && (
                  <div style={{ fontSize: '9pt', color: '#666' }}>
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
          <div data-cv-section="skills" style={{ marginBottom: '18px', ...getSectionBlurStyle('skills', activeSection) }}>
            <h2 style={{
              fontSize: '11pt',
              fontWeight: 'bold',
              color: '#000',
              textTransform: 'uppercase',
              marginTop: '0',
              marginBottom: '6px',
              letterSpacing: '1px'
            }}>
              {isArabic ? 'المهارات' : 'SKILLS'}
            </h2>
            <p style={{ fontSize: '10pt', color: '#222', margin: '0', lineHeight: '1.7' }}>
              {skillsList.join(', ')}
            </p>
          </div>
        )}

        {languagesList.length > 0 && (
          <div data-cv-section="languages" style={{ marginBottom: '18px', ...getSectionBlurStyle('languages', activeSection) }}>
            <h2 style={{
              fontSize: '11pt',
              fontWeight: 'bold',
              color: '#000',
              textTransform: 'uppercase',
              marginTop: '0',
              marginBottom: '6px',
              letterSpacing: '1px'
            }}>
              {isArabic ? 'اللغات' : 'LANGUAGES'}
            </h2>
            <p style={{ fontSize: '10pt', color: '#222', margin: '0' }}>
              {languagesList.map(l => `${l.name}${l.level ? ` (${l.level})` : ''}`).join(', ')}
            </p>
          </div>
        )}

        {certsList.length > 0 && (
          <div data-cv-section="certifications" style={{ marginBottom: '18px', ...getSectionBlurStyle('certifications', activeSection) }}>
            <h2 style={{
              fontSize: '11pt',
              fontWeight: 'bold',
              color: '#000',
              textTransform: 'uppercase',
              marginTop: '0',
              marginBottom: '6px',
              letterSpacing: '1px'
            }}>
              {isArabic ? 'الشهادات' : 'CERTIFICATIONS'}
            </h2>
            <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '10pt', color: '#222', lineHeight: '1.7' }}>
              {certsList.map((cert, idx) => (
                <li key={idx} style={{ marginBottom: '2px' }}>
                  {cert.name}{cert.issuer && ` - ${cert.issuer}`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
