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
    professionalTitle?: string;
    targetJobTitle?: string;
    targetJobDomain?: string;
    photo?: string;
    website?: string;
    linkedin?: string;
    nationality?: string;
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

interface SimpleProfessionalTemplateProps {
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

export default function SimpleProfessionalTemplate({ data, previewMode = false, isArabic = false, settings }: SimpleProfessionalTemplateProps) {
  const personalInfo = data?.personalInfo || {};
  const experience = data?.experience || [];
  const education = data?.education || [];
  const skills = data?.skills;
  const languages = data?.languages || [];
  const certifications = data?.certifications || [];

  const activeSection = settings?.activeSection;
  
  const fullSummary = data?.professionalSummary || data?.summary || '';
  const fullName = personalInfo?.fullName || personalInfo?.name || 'Your Name';
  
  let primaryColor = '#2C2C2C';
  if (settings?.primaryColor && typeof settings.primaryColor === 'string' && settings.primaryColor.trim()) {
    primaryColor = settings.primaryColor.trim();
    if (!primaryColor.startsWith('#')) {
      primaryColor = '#' + primaryColor;
    }
  }
  const textColor = '#5D6064';

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

  const nameParts = fullName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return (
    <div 
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`${previewMode ? 'scale-75 origin-top' : ''}`} 
      style={{ 
        width: '210mm', 
        minHeight: '297mm', 
        fontFamily: 'Arial, Helvetica, sans-serif', 
        padding: '18mm',
        color: textColor,
        fontSize: '10pt',
        lineHeight: '1.5',
        backgroundColor: '#F8F8F8',
        boxSizing: 'border-box',
        direction: isArabic ? 'rtl' : 'ltr'
      }}
    >
      {/* Header - Name on left (split), Contact on right */}
      <div data-cv-section="personalInfo" style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '18px',
        paddingBottom: '0',
        ...getSectionBlurStyle('personalInfo', activeSection)
      }}>
        {/* Name Section - Split First/Last */}
        <div>
          <h1 style={{ 
            fontSize: '32pt', 
            fontWeight: 'bold', 
            color: primaryColor,
            marginBottom: '0',
            letterSpacing: '3px',
            lineHeight: '1',
            marginTop: '0',
            textTransform: 'uppercase',
            fontFamily: 'Arial, Helvetica, sans-serif'
          }}>
            {firstName.toUpperCase()}
          </h1>
          <h1 style={{ 
            fontSize: '32pt', 
            fontWeight: 'bold', 
            color: primaryColor,
            marginBottom: '6px',
            letterSpacing: '3px',
            lineHeight: '1',
            marginTop: '0',
            textTransform: 'uppercase',
            fontFamily: 'Arial, Helvetica, sans-serif'
          }}>
            {lastName.toUpperCase()}
          </h1>
          {/* Target Job Domain / Professional Title */}
          {getJobTitle(personalInfo, isArabic) && (
            <div style={{ 
              fontSize: '11pt', 
              color: primaryColor,
              fontStyle: 'italic',
              marginTop: '4px'
            }}>
              {getJobTitle(personalInfo, isArabic)}
            </div>
          )}
        </div>

        {/* Contact Info - Right aligned */}
        <div style={{ 
          textAlign: 'right', 
          fontSize: '9pt', 
          color: textColor,
          lineHeight: '1.8',
          fontFamily: 'Arial, Helvetica, sans-serif'
        }}>
          {personalInfo?.phone && <div>{personalInfo.phone}</div>}
          {personalInfo?.email && <div>{personalInfo.email}</div>}
          {personalInfo?.location && <div>{personalInfo.location}</div>}
          {personalInfo?.nationality && <div>{personalInfo.nationality}</div>}
          {personalInfo?.linkedin && <div>{personalInfo.linkedin}</div>}
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ 
        display: 'flex', 
        gap: '20px'
      }}>
        {/* LEFT COLUMN: Profile + Work Experience */}
        <div style={{ flex: '1.1', minWidth: 0 }}>
          {/* Profile Section */}
          {fullSummary && (
            <div data-cv-section="summary" style={{ marginBottom: '18px', ...getSectionBlurStyle('summary', activeSection) }}>
              <h2 style={{ 
                fontSize: '11pt', 
                fontWeight: 'bold', 
                color: primaryColor,
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                lineHeight: '1.3',
                marginTop: '0'
              }}>
                {isArabic ? 'الملخص المهني' : 'PROFILE'}
              </h2>
              <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_b]:font-bold [&_i]:italic" style={{ 
                fontSize: '9pt', 
                color: textColor,
                lineHeight: '1.7',
                textAlign: 'justify',
                marginBottom: '0',
                marginTop: '0'
              }} dangerouslySetInnerHTML={{ __html: fullSummary }} />
            </div>
          )}

          {/* Work Experience - BULLET POINTS ONLY */}
          {experience.length > 0 && (
            <div data-cv-section="experience" style={{ marginBottom: '18px', ...getSectionBlurStyle('experience', activeSection) }}>
              <h2 style={{ 
                fontSize: '11pt', 
                fontWeight: 'bold', 
                color: primaryColor,
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                lineHeight: '1.3',
                marginTop: '0'
              }}>
                {isArabic ? 'الخبرة العملية' : 'WORK EXPERIENCE'}
              </h2>
              {experience.map((exp, idx) => {
                const experienceHtml = getExperienceHtml(exp);
                return (
                  <div key={idx} style={{ marginBottom: '14px' }}>
                    <div style={{ 
                      fontSize: '9pt', 
                      fontWeight: 'bold', 
                      color: textColor,
                      marginBottom: '3px'
                    }}>
                      {exp.startDate} - {exp.endDate || (isArabic ? 'الحاضر' : 'Present')}
                    </div>
                    <div style={{ 
                      fontSize: '10pt', 
                      fontWeight: 'bold', 
                      color: primaryColor,
                      marginBottom: '2px'
                    }}>
                      {exp.company}
                      {exp.location && (
                        <span style={{ fontWeight: 'normal', color: textColor }}> | {exp.location}</span>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: '10pt', 
                      fontStyle: 'italic', 
                      color: primaryColor,
                      marginBottom: '6px'
                    }}>
                      {exp.position || exp.title}
                    </div>
                    {experienceHtml && (
                      <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-1 [&_li]:mb-0.5 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic" style={{
                        fontSize: '9pt',
                        color: textColor,
                        lineHeight: '1.6'
                      }} dangerouslySetInnerHTML={{ __html: experienceHtml }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Education + Skills + Certifications + Languages */}
        <div style={{ flex: '0.9', minWidth: 0 }}>
          {/* Education */}
          {education.length > 0 && (
            <div data-cv-section="education" style={{ marginBottom: '18px', ...getSectionBlurStyle('education', activeSection) }}>
              <h2 style={{ 
                fontSize: '11pt', 
                fontWeight: 'bold', 
                color: primaryColor,
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                lineHeight: '1.3',
                marginTop: '0'
              }}>
                {isArabic ? 'التعليم' : 'EDUCATION'}
              </h2>
              {education.map((edu, idx) => (
                <div key={idx} style={{ marginBottom: '12px' }}>
                  {/* Institution - Larger */}
                  <div style={{ 
                    fontSize: '11pt', 
                    fontWeight: 'bold', 
                    color: primaryColor,
                    marginBottom: '3px',
                    textTransform: 'uppercase',
                    lineHeight: '1.3'
                  }}>
                    {edu.institution || edu.school || 'Not provided'}
                  </div>
                  {/* Degree - Smaller */}
                  <div style={{ fontSize: '9pt', color: textColor, lineHeight: '1.4' }}>
                    {edu.degree}
                    {(edu.field || edu.fieldOfStudy) && ` | ${edu.field || edu.fieldOfStudy}`}
                  </div>
                  {/* Date */}
                  {(edu.startDate || edu.endDate || edu.graduationYear) && (
                    <div style={{ fontSize: '9pt', color: textColor }}>
                      {edu.startDate && edu.endDate 
                        ? `${edu.startDate} - ${edu.endDate}`
                        : edu.graduationYear || edu.endDate || ''
                      }
                    </div>
                  )}
                  {edu.description && (
                    <div style={{ fontSize: '9pt', color: textColor, lineHeight: '1.5', marginTop: '3px' }}>
                      {edu.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {skillsList.length > 0 && (
            <div data-cv-section="skills" style={{ marginBottom: '18px', ...getSectionBlurStyle('skills', activeSection) }}>
              <h2 style={{ 
                fontSize: '11pt', 
                fontWeight: 'bold', 
                color: primaryColor,
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                lineHeight: '1.3',
                marginTop: '0'
              }}>
                {isArabic ? 'المهارات' : 'SKILLS'}
              </h2>
              <ul style={{ 
                margin: '0',
                paddingLeft: '16px',
                fontSize: '9pt', 
                color: textColor,
                lineHeight: '1.7'
              }}>
                {skillsList.map((skill, idx) => (
                  <li key={idx} style={{ marginBottom: '2px' }}>{skill}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Certifications */}
          {certsList.length > 0 && (
            <div data-cv-section="certifications" style={{ marginBottom: '18px', ...getSectionBlurStyle('certifications', activeSection) }}>
              <h2 style={{ 
                fontSize: '11pt', 
                fontWeight: 'bold', 
                color: primaryColor,
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                lineHeight: '1.3',
                marginTop: '0'
              }}>
                {isArabic ? 'الشهادات' : 'CERTIFICATION'}
              </h2>
              <ul style={{ 
                margin: '0',
                paddingLeft: '16px',
                fontSize: '9pt', 
                color: textColor,
                lineHeight: '1.7'
              }}>
                {certsList.map((cert, idx) => (
                  <li key={idx} style={{ marginBottom: '2px' }}>
                    {cert.name}
                    {cert.issuer && ` - ${cert.issuer}`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Languages */}
          {languagesList.length > 0 && (
            <div data-cv-section="languages" style={{ marginBottom: '18px', ...getSectionBlurStyle('languages', activeSection) }}>
              <h2 style={{ 
                fontSize: '11pt', 
                fontWeight: 'bold', 
                color: primaryColor,
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                lineHeight: '1.3',
                marginTop: '0'
              }}>
                {isArabic ? 'اللغات' : 'LANGUAGES'}
              </h2>
              <div style={{ fontSize: '9pt', color: textColor, lineHeight: '1.8' }}>
                {languagesList.map((lang, idx) => (
                  <div key={idx} style={{ marginBottom: '2px' }}>
                    {lang.name}{lang.level && ` (${lang.level})`}
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
