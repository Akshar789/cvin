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

interface StrongTemplateProps {
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

export default function StrongTemplate({ data, previewMode = false, isArabic = false, settings }: StrongTemplateProps) {
  const personalInfo = data?.personalInfo || {};
  const experience = data?.experience || [];
  const education = data?.education || [];
  const skills = data?.skills;
  const languages = data?.languages || [];
  const certifications = data?.certifications || [];

  const activeSection = settings?.activeSection;

  const fullSummary = data?.professionalSummary || data?.summary || '';
  const fullName = personalInfo?.fullName || personalInfo?.name || 'Your Name';

  let primaryColor = '#1e40af';
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
      fontSize: '13pt',
      fontWeight: '800',
      color: primaryColor,
      textTransform: 'uppercase',
      letterSpacing: '2px',
      marginBottom: '12px',
      marginTop: '0',
      fontFamily: 'Arial, Helvetica, sans-serif'
    }}>
      {children}
    </h2>
  );

  const HorizontalRule = () => (
    <hr style={{
      border: 'none',
      borderTop: `2px solid ${primaryColor}`,
      margin: '18px 0'
    }} />
  );

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`${previewMode ? 'scale-75 origin-top' : ''}`}
      style={{
        width: '210mm',
        minHeight: '297mm',
        fontFamily: 'Arial, Helvetica, sans-serif',
        padding: '18mm',
        backgroundColor: '#FFFFFF',
        boxSizing: 'border-box',
        color: '#2d2d2d',
        fontSize: '10pt',
        lineHeight: '1.5'
      }}
    >
      <div data-cv-section="personalInfo" style={{
        ...getSectionBlurStyle('personalInfo', activeSection)
      }}><div style={{
        borderLeft: isArabic ? 'none' : `4px solid ${primaryColor}`,
        borderRight: isArabic ? `4px solid ${primaryColor}` : 'none',
        paddingLeft: isArabic ? '0' : '16px',
        paddingRight: isArabic ? '16px' : '0',
        marginBottom: '6px'
      }}>
        <h1 style={{
          fontSize: '30pt',
          fontWeight: '900',
          color: '#1a1a1a',
          margin: '0',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          {fullName}
        </h1>
        {getJobTitle(personalInfo, isArabic) && (
          <div style={{
            fontSize: '12pt',
            color: primaryColor,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            marginTop: '4px'
          }}>
            {getJobTitle(personalInfo, isArabic)}
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        fontSize: '9pt',
        color: '#555',
        marginTop: '12px',
        marginBottom: '0'
      }}>
        {personalInfo?.phone && <span><strong>Phone:</strong> {personalInfo.phone}</span>}
        {personalInfo?.email && <span><strong>Email:</strong> {personalInfo.email}</span>}
        {personalInfo?.location && <span><strong>Location:</strong> {personalInfo.location}</span>}
        {personalInfo?.nationality && <span><strong>Nationality:</strong> {personalInfo.nationality}</span>}
        {personalInfo?.linkedin && <span><strong>LinkedIn:</strong> {personalInfo.linkedin}</span>}
      </div></div>

      <HorizontalRule />

      {fullSummary && (
        <div data-cv-section="summary" style={getSectionBlurStyle('summary', activeSection)}>
          <SectionTitle>{isArabic ? 'الملخص المهني' : 'PROFESSIONAL SUMMARY'}</SectionTitle>
          <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_b]:font-bold [&_i]:italic" style={{
            fontSize: '10pt',
            color: '#333',
            lineHeight: '1.7',
            textAlign: 'justify',
            margin: '0'
          }} dangerouslySetInnerHTML={{ __html: fullSummary }} />
          <HorizontalRule />
        </div>
      )}

      {experience.length > 0 && (
        <div data-cv-section="experience" style={getSectionBlurStyle('experience', activeSection)}>
          <SectionTitle>{isArabic ? 'الخبرة المهنية' : 'PROFESSIONAL EXPERIENCE'}</SectionTitle>
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
                  <div>
                    <span style={{ fontSize: '11pt', fontWeight: '800', color: '#1a1a1a' }}>
                      {exp.company}
                    </span>
                    {exp.location && (
                      <span style={{ fontSize: '9pt', color: '#777', marginLeft: '8px' }}>
                        | {exp.location}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '9pt', color: primaryColor, fontWeight: '700' }}>
                    {exp.startDate} – {exp.endDate || (isArabic ? 'الحاضر' : 'Present')}
                  </div>
                </div>
                <div style={{
                  fontSize: '10pt',
                  fontWeight: '600',
                  color: primaryColor,
                  marginTop: '2px',
                  marginBottom: '6px'
                }}>
                  {exp.position || exp.title}
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
          <HorizontalRule />
        </div>
      )}

      {education.length > 0 && (
        <div data-cv-section="education" style={getSectionBlurStyle('education', activeSection)}>
          <SectionTitle>{isArabic ? 'التعليم' : 'EDUCATION'}</SectionTitle>
          {education.map((edu, idx) => (
            <div key={idx} style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '11pt', fontWeight: '700', color: '#1a1a1a' }}>
                {edu.degree}{(edu.field || edu.fieldOfStudy) && ` in ${edu.field || edu.fieldOfStudy}`}
              </div>
              <div style={{ fontSize: '10pt', color: '#555' }}>
                {edu.institution || edu.school}
              </div>
              {(edu.endDate || edu.graduationYear) && (
                <div style={{ fontSize: '9pt', color: primaryColor, fontWeight: '600' }}>
                  {edu.startDate ? `${edu.startDate} – ${edu.endDate || 'Present'}` : edu.graduationYear || edu.endDate}
                </div>
              )}
              {edu.description && (
                <div style={{ fontSize: '9pt', color: '#444', lineHeight: '1.5', marginTop: '3px' }}>
                  {edu.description}
                </div>
              )}
            </div>
          ))}
          <HorizontalRule />
        </div>
      )}

      {skillsList.length > 0 && (
        <div data-cv-section="skills" style={getSectionBlurStyle('skills', activeSection)}>
          <SectionTitle>{isArabic ? 'المهارات' : 'SKILLS'}</SectionTitle>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px'
          }}>
            {skillsList.map((skill, idx) => (
              <div key={idx} style={{
                border: `1.5px solid ${primaryColor}`,
                padding: '5px 10px',
                fontSize: '9pt',
                fontWeight: '600',
                color: '#1a1a1a',
                textAlign: 'center'
              }}>
                {skill}
              </div>
            ))}
          </div>
          <HorizontalRule />
        </div>
      )}

      {certsList.length > 0 && (
        <div data-cv-section="certifications" style={getSectionBlurStyle('certifications', activeSection)}>
          <SectionTitle>{isArabic ? 'الشهادات' : 'CERTIFICATIONS'}</SectionTitle>
          <ul style={{
            margin: '0',
            paddingLeft: isArabic ? '0' : '18px',
            paddingRight: isArabic ? '18px' : '0',
            fontSize: '9pt',
            color: '#444',
            lineHeight: '1.7'
          }}>
            {certsList.map((cert, idx) => (
              <li key={idx} style={{ marginBottom: '3px', fontWeight: '600' }}>
                {cert.name}{cert.issuer && <span style={{ fontWeight: '400', color: '#777' }}> – {cert.issuer}</span>}
              </li>
            ))}
          </ul>
          <HorizontalRule />
        </div>
      )}

      {languagesList.length > 0 && (
        <div data-cv-section="languages" style={getSectionBlurStyle('languages', activeSection)}>
          <SectionTitle>{isArabic ? 'اللغات' : 'LANGUAGES'}</SectionTitle>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '10pt' }}>
            {languagesList.map((lang, idx) => (
              <span key={idx}>
                <strong>{lang.name}</strong>{lang.level && ` — ${lang.level}`}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
