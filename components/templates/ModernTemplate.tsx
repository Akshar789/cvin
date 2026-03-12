import React from 'react';
import { getSectionBlurStyle } from './SectionBlur';
import { getExperienceHtml, getJobTitle } from './templateUtils';

interface CVData {
  title: string;
  personalInfo: {
    name: string;
    fullName?: string;
    email: string;
    phone: string;
    location: string;
    professionalTitle?: string;
    targetJobTitle?: string;
    photo?: string;
  };
  summary: string;
  professionalSummary?: string;
  experience: Array<{
    company: string;
    position: string;
    title?: string;
    location?: string;
    startDate: string;
    endDate?: string;
    description?: string;
    achievements?: string[];
    responsibilities?: string[];
  }>;
  education: Array<{
    institution: string;
    school?: string;
    degree: string;
    field?: string;
    fieldOfStudy?: string;
    startDate?: string;
    endDate?: string;
    graduationYear?: string;
    gpa?: string;
    description?: string;
  }>;
  skills: Array<{
    category?: string;
    skillsList: string[];
  }> | Array<string>;
  languages?: Array<{
    name?: string;
    language?: string;
    level?: string;
  }> | string[];
}

interface ModernTemplateProps {
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

export default function ModernTemplate({ data, previewMode = false, isArabic = false, settings }: ModernTemplateProps) {
  const { personalInfo, summary, professionalSummary, experience, education, skills, languages } = data;
  const fullSummary = professionalSummary || summary || '';
  const name = personalInfo.fullName || personalInfo.name || 'Your Name';
  const title = getJobTitle(personalInfo, isArabic);

  // Normalize skills
  let skillsList: string[] = [];
  if (Array.isArray(skills)) {
    if (skills.length > 0 && typeof skills[0] === 'string') {
      skillsList = skills as string[];
    } else {
      skillsList = (skills as any[]).flatMap(s => 
        Array.isArray(s.skillsList) ? s.skillsList : 
        (typeof s === 'string' ? [s] : [])
      );
    }
  }

  // Normalize languages
  let languagesList: string[] = [];
  if (Array.isArray(languages)) {
    languagesList = languages.map(lang => 
      typeof lang === 'string' ? lang : (lang.name || lang.language || '')
    ).filter(Boolean);
  }

  const activeSection = settings?.activeSection;

  return (
    <div 
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`bg-white ${previewMode ? 'scale-75 origin-top' : ''}`} 
      style={{ 
        width: '210mm', 
        minHeight: '297mm', 
        fontFamily: 'Arial, Helvetica, sans-serif', 
        padding: '15mm',
        color: '#5D6064',
        fontSize: '10pt',
        lineHeight: '1.5',
        backgroundColor: '#FFFFFF',
        boxSizing: 'border-box',
        overflow: 'hidden',
        direction: isArabic ? 'rtl' : 'ltr'
      }}
    >
      {/* Header */}
      <div data-cv-section="personalInfo" style={{ 
        marginBottom: '12px', 
        borderBottom: '2px solid #5D6064', 
        paddingBottom: '6px',
        ...getSectionBlurStyle('personalInfo', activeSection)
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start'
        }}>
          <div style={{ flex: '1', paddingRight: '20px' }}>
            <h1 style={{ 
              fontSize: '28pt', 
              fontWeight: 'bold', 
              color: '#2C2C2C',
              marginBottom: '4px',
              letterSpacing: '0.5px',
              lineHeight: '1.1',
              marginTop: '0',
              textTransform: 'uppercase',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}>
              {name.toUpperCase()}
            </h1>
            {title && (
              <h2 style={{ 
                fontSize: '12pt', 
                fontWeight: 'normal', 
                color: '#5D6064',
                marginTop: '2px',
                marginBottom: '0',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                lineHeight: '1.2',
                fontFamily: 'Arial, Helvetica, sans-serif'
              }}>
                {title.toUpperCase()}
              </h2>
            )}
          </div>
          <div style={{ 
            textAlign: 'right', 
            fontSize: '9pt', 
            color: '#5D6064',
            lineHeight: '1.6',
            flexShrink: '0',
            fontFamily: 'Arial, Helvetica, sans-serif',
            whiteSpace: 'nowrap'
          }}>
            {personalInfo.phone && <div style={{ marginBottom: '2px' }}>{personalInfo.phone}</div>}
            {personalInfo.email && <div style={{ marginBottom: '2px' }}>{personalInfo.email}</div>}
            {personalInfo.location && <div style={{ marginBottom: '2px' }}>{personalInfo.location}</div>}
            {(personalInfo as any)?.nationality && <div>{(personalInfo as any).nationality}</div>}
          </div>
        </div>
      </div>

      {/* Two Column Layout Container */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        alignItems: 'flex-start',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Left Column */}
        <div style={{ 
          flex: '1', 
          minWidth: '0',
          maxWidth: '50%',
          boxSizing: 'border-box'
        }}>
          {/* Profile Section (Left) */}
          {fullSummary && (
            <div data-cv-section="summary" style={{ marginBottom: '15px', ...getSectionBlurStyle('summary', activeSection) }}>
              <h2 style={{ 
                fontSize: '11pt', 
                fontWeight: 'bold', 
                color: '#2C2C2C',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                lineHeight: '1.3',
                marginTop: '0'
              }}>
                {isArabic ? 'الملخص المهني' : 'PROFILE'}
              </h2>
              <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_b]:font-bold [&_i]:italic" style={{ 
                fontSize: '10pt', 
                color: '#5D6064',
                lineHeight: '1.6',
                textAlign: 'justify',
                marginBottom: '0',
                marginTop: '0'
              }} dangerouslySetInnerHTML={{ __html: fullSummary }} />
            </div>
          )}

          {/* Work Experience Section (Left) */}
          {experience && experience.length > 0 && (
            <div data-cv-section="experience" style={{ marginBottom: '15px', ...getSectionBlurStyle('experience', activeSection) }}>
              <h2 style={{ 
                fontSize: '11pt', 
                fontWeight: 'bold', 
                color: '#2C2C2C',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                lineHeight: '1.3',
                marginTop: '0'
              }}>
                {isArabic ? 'الخبرة العملية' : 'WORK EXPERIENCE'}
              </h2>
              <div style={{ lineHeight: '1.6' }}>
                {experience.map((exp, idx) => (
                  <div key={idx} style={{ marginBottom: '14px' }}>
                    <div style={{ marginBottom: '4px' }}>
                      <span style={{ 
                        fontSize: '10pt', 
                        fontWeight: 'bold', 
                        color: '#5D6064'
                      }}>
                        {exp.startDate} - {exp.endDate || (isArabic ? 'الحاضر' : 'PRESENT')}
                      </span>
                    </div>
                    <div style={{ marginBottom: '4px' }}>
                      <span style={{ 
                        fontSize: '11pt', 
                        fontWeight: 'bold', 
                        color: '#2C2C2C'
                      }}>
                        {exp.company}
                      </span>
                      {exp.location && (
                        <span style={{ 
                          fontSize: '10pt', 
                          color: '#5D6064',
                          marginLeft: '8px'
                        }}>
                          | {exp.location}
                        </span>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: '10pt', 
                      fontWeight: 'bold', 
                      color: '#2C2C2C',
                      marginBottom: '6px',
                      fontStyle: 'italic'
                    }}>
                      {exp.position}
                    </div>
                    {(() => {
                      const experienceHtml = getExperienceHtml(exp);
                      return (
                        <>
                          {experienceHtml && (
                            <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-1 [&_li]:mb-0.5 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic" style={{
                              fontSize: '10pt',
                              color: '#5D6064',
                              lineHeight: '1.6'
                            }} dangerouslySetInnerHTML={{ __html: experienceHtml }} />
                          )}
                        </>
                      );
                    })()}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages Section (Left) */}
          {languagesList.length > 0 && (
            <div data-cv-section="languages" style={{ marginBottom: '15px', ...getSectionBlurStyle('languages', activeSection) }}>
              <h2 style={{ 
                fontSize: '11pt', 
                fontWeight: 'bold', 
                color: '#2C2C2C',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                lineHeight: '1.3',
                marginTop: '0'
              }}>
                {isArabic ? 'اللغات' : 'LANGUAGES'}
              </h2>
              <div style={{ 
                fontSize: '10pt', 
                color: '#5D6064',
                lineHeight: '1.6'
              }}>
                {languagesList.map((lang, idx) => (
                  <span key={idx}>
                    {lang}
                    {idx < languagesList.length - 1 && ' • '}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ 
          flex: '1', 
          minWidth: '0',
          maxWidth: '50%',
          boxSizing: 'border-box'
        }}>
          {/* Education Section (Right) */}
          {education && education.length > 0 && (
            <div data-cv-section="education" style={{ marginBottom: '15px', ...getSectionBlurStyle('education', activeSection) }}>
              <h2 style={{ 
                fontSize: '11pt', 
                fontWeight: 'bold', 
                color: '#2C2C2C',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                lineHeight: '1.3',
                marginTop: '0'
              }}>
                {isArabic ? 'التعليم' : 'EDUCATION'}
              </h2>
              <div style={{ lineHeight: '1.6' }}>
                {education.map((edu, idx) => (
                  <div key={idx} style={{ marginBottom: '12px' }}>
                    {edu.startDate && (
                      <div style={{ marginBottom: '4px' }}>
                        <span style={{ 
                          fontSize: '10pt', 
                          fontWeight: 'bold', 
                          color: '#5D6064'
                        }}>
                          {edu.startDate} - {edu.endDate || (isArabic ? 'الحاضر' : 'PRESENT')}
                        </span>
                      </div>
                    )}
                    <div style={{ 
                      fontSize: '11pt', 
                      fontWeight: 'bold', 
                      color: '#2C2C2C',
                      marginBottom: '4px',
                      textTransform: 'uppercase'
                    }}>
                      {edu.institution || edu.school}
                    </div>
                    <div style={{ 
                      fontSize: '10pt', 
                      color: '#5D6064',
                      marginLeft: '8px',
                      lineHeight: '1.5'
                    }}>
                      {edu.degree}
                      {edu.field && ` - ${edu.field}`}
                      {edu.gpa && ` | GPA: ${edu.gpa}`}
                    </div>
                    {edu.description && (
                      <div style={{ fontSize: '9pt', color: '#5D6064', lineHeight: '1.5', marginTop: '3px' }}>
                        {edu.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Section (Right) */}
          {skillsList.length > 0 && (
            <div data-cv-section="skills" style={{ marginBottom: '15px', ...getSectionBlurStyle('skills', activeSection) }}>
              <h2 style={{ 
                fontSize: '11pt', 
                fontWeight: 'bold', 
                color: '#2C2C2C',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                lineHeight: '1.3',
                marginTop: '0'
              }}>
                {isArabic ? 'المهارات' : 'SKILLS'}
              </h2>
              <div style={{ 
                fontSize: '10pt', 
                color: '#5D6064',
                lineHeight: '1.6'
              }}>
                {skillsList.map((skill, idx) => (
                  <span key={idx}>
                    {skill}
                    {idx < skillsList.length - 1 && ' • '}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

