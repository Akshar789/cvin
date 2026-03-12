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

interface ClassicTemplateProps {
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

export default function ClassicTemplate({ data, previewMode = false, isArabic = false, settings }: ClassicTemplateProps) {
  const personalInfo = data?.personalInfo || {};
  const experience = data?.experience || [];
  const education = data?.education || [];
  const skills = data?.skills;
  const languages = data?.languages || [];
  const certifications = data?.certifications || [];

  const activeSection = settings?.activeSection;
  
  const fullSummary = data?.professionalSummary || data?.summary || '';
  const fullName = personalInfo?.fullName || personalInfo?.name || 'Your Name';
  
  // Primary color - used for name, position titles, degree titles
  let primaryColor = '#2563eb';
  if (settings?.primaryColor && typeof settings.primaryColor === 'string' && settings.primaryColor.trim()) {
    primaryColor = settings.primaryColor.trim();
    if (!primaryColor.startsWith('#')) {
      primaryColor = '#' + primaryColor;
    }
  }
  
  // Accent color derived from primary - used for section titles and icons
  const accentColor = primaryColor;

  // Normalize skills from various formats
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

  // Normalize languages
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

  // Normalize certifications
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
      fontSize: '14pt', 
      fontWeight: 'bold', 
      color: accentColor,
      marginBottom: '12px',
      marginTop: '0',
      letterSpacing: '0.5px',
      fontFamily: 'Georgia, "Times New Roman", serif'
    }}>
      {children}
    </h2>
  );

  // Icon component with primary color
  const ContactIcon = ({ emoji }: { emoji: string }) => (
    <span style={{ 
      width: '20px', 
      height: '20px', 
      borderRadius: '50%', 
      backgroundColor: primaryColor,
      color: 'white',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '10px',
      marginRight: '6px'
    }}>{emoji}</span>
  );

  return (
    <div 
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`${previewMode ? 'scale-75 origin-top' : ''}`}
      style={{ 
        width: '210mm', 
        minHeight: '297mm', 
        fontFamily: 'Georgia, "Times New Roman", serif', 
        padding: '18mm',
        backgroundColor: '#FFFFFF',
        boxSizing: 'border-box',
        color: '#333333',
        fontSize: '10pt',
        lineHeight: '1.5',
        direction: isArabic ? 'rtl' : 'ltr'
      }}
    >
      {/* Header */}
      <div data-cv-section="personalInfo" style={{ marginBottom: '20px', ...getSectionBlurStyle('personalInfo', activeSection) }}>
        <h1 style={{ 
          fontSize: '28pt', 
          fontWeight: 'normal', 
          color: primaryColor,
          marginBottom: '4px',
          marginTop: '0',
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontStyle: 'italic'
        }}>
          {fullName}
        </h1>
        
        {/* Target Job Domain / Professional Title */}
        {getJobTitle(personalInfo, isArabic) && (
          <div style={{ 
            fontSize: '12pt', 
            color: primaryColor,
            marginBottom: '10px',
            fontStyle: 'italic'
          }}>
            {getJobTitle(personalInfo, isArabic)}
          </div>
        )}
        
        {/* Contact Info - Icons with primary color */}
        <div style={{ 
          fontSize: '9pt', 
          color: '#666666',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center'
        }}>
          {personalInfo?.phone && (
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              <ContactIcon emoji="📞" />
              {personalInfo.phone}
            </span>
          )}
          {personalInfo?.email && (
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              <ContactIcon emoji="✉" />
              {personalInfo.email}
            </span>
          )}
          {personalInfo?.location && (
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              <ContactIcon emoji="📍" />
              {personalInfo.location}
            </span>
          )}
          {personalInfo?.nationality && (
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              <ContactIcon emoji="🌍" />
              {personalInfo.nationality}
            </span>
          )}
          {personalInfo?.linkedin && (
            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
              <ContactIcon emoji="🔗" />
              {personalInfo.linkedin}
            </span>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {fullSummary && (
        <div data-cv-section="summary" style={{ marginBottom: '20px', ...getSectionBlurStyle('summary', activeSection) }}>
          <SectionTitle>{isArabic ? 'الملخص المهني' : 'Professional Summary'}</SectionTitle>
          <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_b]:font-bold [&_i]:italic" style={{ 
            fontSize: '10pt', 
            color: '#333333',
            lineHeight: '1.65',
            textAlign: 'justify',
            margin: '0'
          }} dangerouslySetInnerHTML={{ __html: fullSummary }} />
        </div>
      )}

      {/* Professional Experience */}
      {experience.length > 0 && (
        <div data-cv-section="experience" style={{ marginBottom: '20px', ...getSectionBlurStyle('experience', activeSection) }}>
          <SectionTitle>{isArabic ? 'الخبرة المهنية' : 'Professional Experience'}</SectionTitle>
          {experience.map((exp, idx) => {
            const experienceHtml = getExperienceHtml(exp);
            return (
              <div key={idx} style={{ marginBottom: '16px' }}>
                <div style={{ 
                  fontSize: '11pt', 
                  fontWeight: 'bold', 
                  color: primaryColor,
                  marginBottom: '2px'
                }}>
                  {exp.position || exp.title}
                </div>
                <div style={{ 
                  fontSize: '10pt', 
                  color: '#333333',
                  marginBottom: '2px'
                }}>
                  {exp.company}
                  {exp.location && ` • ${exp.location}`}
                </div>
                <div style={{ 
                  fontSize: '9pt', 
                  color: primaryColor,
                  marginBottom: '8px',
                  fontStyle: 'italic'
                }}>
                  {exp.startDate} - {exp.endDate || (isArabic ? 'الحاضر' : 'Present')}
                </div>
                {experienceHtml && (
                  <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-1 [&_li]:mb-0.5 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic" style={{
                    fontSize: '9pt',
                    color: '#333333',
                    lineHeight: '1.65'
                  }} dangerouslySetInnerHTML={{ __html: experienceHtml }} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div data-cv-section="education" style={{ marginBottom: '20px', ...getSectionBlurStyle('education', activeSection) }}>
          <SectionTitle>{isArabic ? 'التعليم' : 'Education'}</SectionTitle>
          {education.map((edu, idx) => (
            <div key={idx} style={{ marginBottom: '10px' }}>
              <div style={{ 
                fontSize: '11pt', 
                fontWeight: 'bold', 
                color: primaryColor,
                marginBottom: '2px'
              }}>
                {edu.degree}
                {(edu.field || edu.fieldOfStudy) && ` in ${edu.field || edu.fieldOfStudy}`}
              </div>
              <div style={{ fontSize: '10pt', color: '#333333' }}>
                {edu.institution || edu.school || 'Not provided'}
              </div>
              {(edu.endDate || edu.graduationYear) && (
                <div style={{ fontSize: '9pt', color: primaryColor, fontStyle: 'italic' }}>
                  {edu.startDate ? `${edu.startDate} - ${edu.endDate || 'Present'}` : edu.graduationYear || edu.endDate}
                </div>
              )}
              {edu.description && (
                <div style={{ fontSize: '9pt', color: '#333333', lineHeight: '1.5', marginTop: '3px' }}>
                  {edu.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Certification */}
      {certsList.length > 0 && (
        <div data-cv-section="certifications" style={{ marginBottom: '20px', ...getSectionBlurStyle('certifications', activeSection) }}>
          <SectionTitle>{isArabic ? 'الشهادات' : 'Certification'}</SectionTitle>
          <ul style={{ 
            margin: '0',
            paddingLeft: '18px',
            fontSize: '9pt',
            color: '#333333',
            lineHeight: '1.7'
          }}>
            {certsList.map((cert, idx) => (
              <li key={idx} style={{ marginBottom: '3px' }}>
                {cert.name}
                {cert.issuer && ` - ${cert.issuer}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Languages */}
      {languagesList.length > 0 && (
        <div data-cv-section="languages" style={{ marginBottom: '20px', ...getSectionBlurStyle('languages', activeSection) }}>
          <SectionTitle>{isArabic ? 'اللغات' : 'Languages'}</SectionTitle>
          <ul style={{ 
            margin: '0',
            paddingLeft: '18px',
            fontSize: '9pt',
            color: '#333333',
            lineHeight: '1.7'
          }}>
            {languagesList.map((lang, idx) => (
              <li key={idx} style={{ marginBottom: '3px' }}>
                {lang.name}{lang.level && ` (${lang.level})`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Skills */}
      {skillsList.length > 0 && (
        <div data-cv-section="skills" style={{ marginBottom: '20px', ...getSectionBlurStyle('skills', activeSection) }}>
          <SectionTitle>{isArabic ? 'المهارات' : 'Skills'}</SectionTitle>
          <div style={{ 
            fontSize: '9pt',
            color: '#333333',
            lineHeight: '1.7'
          }}>
            {skillsList.map((skill, idx) => (
              <span key={idx} style={{ 
                display: 'inline-block',
                backgroundColor: `${primaryColor}15`,
                color: primaryColor,
                padding: '3px 10px',
                borderRadius: '12px',
                marginRight: '6px',
                marginBottom: '6px',
                fontSize: '9pt'
              }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
