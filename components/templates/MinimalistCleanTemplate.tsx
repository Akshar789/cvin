import React from 'react';
import { getSectionBlurStyle } from './SectionBlur';
import { getExperienceHtml, getJobTitle } from './templateUtils';

interface CVData {
  title?: string;
  personalInfo: {
    name?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    website?: string;
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
  }>;
  skills?: Array<{
    category?: string;
    skillsList?: string[];
  }> | Array<string> | {
    technical?: string[];
    soft?: string[];
    tools?: string[];
  };
  certifications?: Array<{
    name?: string;
    title?: string;
    issuer?: string;
    organization?: string;
    date?: string;
  }>;
  languages?: Array<{
    name?: string;
    language?: string;
    level?: string;
  }> | string[];
}

interface MinimalistCleanTemplateProps {
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

export default function MinimalistCleanTemplate({ data, previewMode = false, isArabic = false, settings }: MinimalistCleanTemplateProps) {
  const { personalInfo, summary, professionalSummary, experience, education, skills, certifications, languages } = data;
  const fullSummary = professionalSummary || summary || '';
  const name = personalInfo?.fullName || personalInfo?.name || 'Your Name';
  const title = getJobTitle(personalInfo, isArabic);
  
  let accentColor = '#A67C52';
  if (settings?.primaryColor && typeof settings.primaryColor === 'string' && settings.primaryColor.trim()) {
    accentColor = settings.primaryColor.trim();
    if (!accentColor.startsWith('#')) {
      accentColor = '#' + accentColor;
    }
  }
  const photoUrl = settings?.photoUrl || personalInfo?.photo;

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
      // Handle {technical: [], soft: [], tools: []} format
      const skillsObj = skills as { technical?: string[]; soft?: string[]; tools?: string[] };
      skillsList = [
        ...(skillsObj.technical || []),
        ...(skillsObj.soft || []),
        ...(skillsObj.tools || [])
      ];
    }
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

  let languagesList: Array<{ name: string; level?: string }> = [];
  if (Array.isArray(languages)) {
    languagesList = languages.map(lang => {
      if (typeof lang === 'string') {
        return { name: lang };
      }
      return { 
        name: lang.name || lang.language || '', 
        level: lang.level 
      };
    }).filter(l => l.name);
  }

  const activeSection = settings?.activeSection;

  const SectionHeader = ({ children }: { children: string }) => (
    <div style={{ 
      display: 'flex',
      alignItems: 'center',
      marginBottom: '16px',
      marginTop: '8px',
      gap: '14px'
    }}>
      <h2 style={{ 
        fontSize: '14pt', 
        fontWeight: '600', 
        color: accentColor,
        margin: '0',
        whiteSpace: 'nowrap',
        fontFamily: 'Georgia, "Times New Roman", serif'
      }}>
        {children}
      </h2>
      <div style={{ 
        flex: 1,
        height: '2px',
        backgroundColor: accentColor,
        opacity: 0.3
      }} />
    </div>
  );

  const ContactItem = ({ icon, text }: { icon: string; text: string }) => (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      fontSize: '9pt',
      color: '#333333'
    }}>
      <div style={{
        width: '22px',
        height: '22px',
        borderRadius: '50%',
        backgroundColor: accentColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF',
        fontSize: '10px'
      }}>
        {icon}
      </div>
      <span>{text}</span>
    </div>
  );

  return (
    <div 
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`${previewMode ? 'scale-75 origin-top' : ''}`} 
      style={{ 
        width: '210mm', 
        minHeight: '297mm', 
        fontFamily: 'Arial, Helvetica, sans-serif', 
        padding: '20mm 22mm',
        color: '#000000',
        fontSize: '10pt',
        lineHeight: '1.6',
        backgroundColor: '#FFFFFF',
        boxSizing: 'border-box',
        direction: isArabic ? 'rtl' : 'ltr'
      }}
    >
      {/* Header - Photo Left, Name/Title/Contact Right */}
      <div data-cv-section="personalInfo" style={{ 
        display: 'flex',
        alignItems: 'flex-start',
        marginBottom: '22px',
        gap: '18px',
        ...getSectionBlurStyle('personalInfo', activeSection)
      }}>
        {/* Photo */}
        {photoUrl && (
          <div style={{
            width: '90px',
            height: '110px',
            flexShrink: 0,
            overflow: 'hidden',
            borderRadius: '4px'
          }}>
            <img 
              src={photoUrl} 
              alt={name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
        )}
        
        {/* Name, Title and Contact */}
        <div style={{ flex: 1 }}>
          <h1 style={{ 
            fontSize: '26pt', 
            fontWeight: 'normal', 
            color: accentColor,
            marginBottom: '2px',
            marginTop: '0',
            lineHeight: '1.1',
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontStyle: 'italic'
          }}>
            {name}
          </h1>
          
          {title && (
            <h2 style={{ 
              fontSize: '11pt', 
              fontWeight: '600', 
              color: '#333333',
              marginTop: '4px',
              marginBottom: '14px',
              lineHeight: '1.3',
              fontFamily: 'Arial, Helvetica, sans-serif'
            }}>
              {title}
            </h2>
          )}
          
          {/* Contact Grid - 2x3 */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px 20px'
          }}>
            {personalInfo?.phone && (
              <ContactItem icon="📞" text={personalInfo.phone} />
            )}
            {personalInfo?.email && (
              <ContactItem icon="✉" text={personalInfo.email} />
            )}
            {personalInfo?.location && (
              <ContactItem icon="📍" text={personalInfo.location} />
            )}
            {personalInfo?.nationality && (
              <ContactItem icon="🌍" text={personalInfo.nationality} />
            )}
            {personalInfo?.linkedin && (
              <ContactItem icon="🔗" text={personalInfo.linkedin} />
            )}
            {personalInfo?.website && !personalInfo?.linkedin && (
              <ContactItem icon="🌐" text={personalInfo.website} />
            )}
          </div>
        </div>
      </div>

      {/* Professional Summary */}
      {fullSummary && (
        <div data-cv-section="summary" style={{ marginBottom: '24px', ...getSectionBlurStyle('summary', activeSection) }}>
          <SectionHeader>{isArabic ? 'الملخص المهني' : 'Professional Summary'}</SectionHeader>
          <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_b]:font-bold [&_i]:italic" style={{ 
            fontSize: '10pt', 
            color: '#333333',
            lineHeight: '1.65',
            textAlign: 'justify',
            marginTop: '0',
            marginBottom: '0'
          }} dangerouslySetInnerHTML={{ __html: fullSummary }} />
        </div>
      )}

      {/* Skills - Show skills as tags */}
      {skillsList.length > 0 && (
        <div data-cv-section="skills" style={{ marginBottom: '24px', ...getSectionBlurStyle('skills', activeSection) }}>
          <SectionHeader>{isArabic ? 'المهارات' : 'Skills'}</SectionHeader>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {skillsList.map((skill, idx) => (
              <span key={idx} style={{ 
                display: 'inline-block',
                backgroundColor: `${accentColor}15`,
                color: accentColor,
                padding: '4px 12px',
                borderRadius: '14px',
                fontSize: '9pt',
                border: `1px solid ${accentColor}30`
              }}>
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Education - Two Column Layout */}
      {education && education.length > 0 && (
        <div data-cv-section="education" style={{ marginBottom: '24px', ...getSectionBlurStyle('education', activeSection) }}>
          <SectionHeader>{isArabic ? 'التعليم' : 'Education'}</SectionHeader>
          {education.map((edu, idx) => (
            <div key={idx} style={{ 
              display: 'flex',
              marginBottom: '12px',
              gap: '20px'
            }}>
              {/* Left Column - Degree, Institution */}
              <div style={{ 
                width: '35%',
                flexShrink: 0
              }}>
                <div style={{ 
                  fontSize: '10pt', 
                  fontWeight: 'bold', 
                  color: '#000000',
                  marginBottom: '2px',
                  lineHeight: '1.3'
                }}>
                  {edu.degree}
                  {(edu.field || edu.fieldOfStudy) && ` | ${edu.field || edu.fieldOfStudy}`}
                </div>
                <div style={{ 
                  fontSize: '9pt', 
                  color: '#333333',
                  marginBottom: '2px'
                }}>
                  {edu.institution || edu.school}
                </div>
                {(edu.endDate || edu.graduationYear) && (
                  <div style={{ 
                    fontSize: '9pt', 
                    color: '#666666'
                  }}>
                    {edu.startDate ? `${edu.startDate} - ${edu.endDate || 'Present'}` : `Graduated: ${edu.graduationYear || edu.endDate}`}
                  </div>
                )}
              </div>
              
              {/* Right Column - Description */}
              <div style={{ 
                flex: 1,
                fontSize: '9pt',
                color: '#333333',
                lineHeight: '1.6'
              }}>
                {edu.description || ''}
                {edu.gpa && <span> GPA: {edu.gpa}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certification */}
      {certsList.length > 0 && (
        <div data-cv-section="certifications" style={{ marginBottom: '24px', ...getSectionBlurStyle('certifications', activeSection) }}>
          <SectionHeader>{isArabic ? 'الشهادات' : 'Certification'}</SectionHeader>
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
                {cert.issuer && <span style={{ color: '#666666' }}> – {cert.issuer}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Languages */}
      {languagesList.length > 0 && (
        <div data-cv-section="languages" style={{ marginBottom: '24px', ...getSectionBlurStyle('languages', activeSection) }}>
          <SectionHeader>{isArabic ? 'اللغات' : 'Languages'}</SectionHeader>
          <ul style={{ 
            margin: '0',
            paddingLeft: '18px',
            fontSize: '9pt',
            color: '#333333',
            lineHeight: '1.7'
          }}>
            {languagesList.map((lang, idx) => (
              <li key={idx} style={{ marginBottom: '2px' }}>
                {lang.name}
                {lang.level && ` (${lang.level})`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Professional Experience - Two Column Layout - LAST */}
      {experience && experience.length > 0 && (
        <div data-cv-section="experience" style={{ marginBottom: '24px', ...getSectionBlurStyle('experience', activeSection) }}>
          <SectionHeader>{isArabic ? 'الخبرة المهنية' : 'Professional Experience'}</SectionHeader>
          {experience.map((exp, idx) => (
            <div key={idx} style={{ 
              display: 'flex',
              marginBottom: '14px',
              gap: '20px'
            }}>
              {/* Left Column - Job Title, Company, Dates */}
              <div style={{ 
                width: '35%',
                flexShrink: 0
              }}>
                <div style={{ 
                  fontSize: '10pt', 
                  fontWeight: 'bold', 
                  color: '#000000',
                  marginBottom: '2px',
                  lineHeight: '1.3'
                }}>
                  {exp.position || exp.title}
                </div>
                <div style={{ 
                  fontSize: '9pt', 
                  color: '#333333',
                  marginBottom: '2px'
                }}>
                  {exp.company}
                </div>
                {exp.startDate && (
                  <div style={{ 
                    fontSize: '9pt', 
                    color: '#666666'
                  }}>
                    {exp.startDate} – {exp.endDate || (isArabic ? 'الحاضر' : 'Present')}
                  </div>
                )}
              </div>
              
              {/* Right Column - Description with Bullet Points */}
              <div style={{ 
                flex: 1,
                fontSize: '9pt',
                color: '#333333',
                lineHeight: '1.6'
              }}>
                {(() => {
                  const experienceHtml = getExperienceHtml(exp);
                  return (
                    <>
                      {experienceHtml && (
                        <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_ul]:my-1 [&_li]:mb-0.5 [&_b]:font-bold [&_strong]:font-bold [&_i]:italic [&_em]:italic" style={{
                          fontSize: '9pt',
                          color: '#333333',
                          lineHeight: '1.6'
                        }} dangerouslySetInnerHTML={{ __html: experienceHtml }} />
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
