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

interface StructuredSidebarProTemplateProps {
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

export default function StructuredSidebarProTemplate({ data, previewMode = false, isArabic = false, settings }: StructuredSidebarProTemplateProps) {
  const personalInfo = data?.personalInfo || {};
  const experience = data?.experience || [];
  const education = data?.education || [];
  const skills = data?.skills;
  const languages = data?.languages || [];
  const certifications = data?.certifications || [];

  const activeSection = settings?.activeSection;

  const fullSummary = data?.professionalSummary || data?.summary || '';
  const fullName = personalInfo?.fullName || personalInfo?.name || 'Your Name';

  let primaryColor = '#2d3748';
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


  const SidebarSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: '18px' }}>
      <h3 style={{
        fontSize: '10pt',
        fontWeight: 'bold',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
        marginTop: '0',
        marginBottom: '10px',
        paddingBottom: '6px',
        borderBottom: '1px solid rgba(255,255,255,0.2)'
      }}>
        {title}
      </h3>
      {children}
    </div>
  );

  const MainSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: '20px' }}>
      <h2 style={{
        fontSize: '12pt',
        fontWeight: 'bold',
        color: primaryColor,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginTop: '0',
        marginBottom: '10px',
        paddingBottom: '6px',
        borderBottom: `2px solid ${primaryColor}`
      }}>
        {title}
      </h2>
      {children}
    </div>
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
        width: '35%',
        backgroundColor: primaryColor,
        color: '#FFFFFF',
        padding: '24px 18px',
        boxSizing: 'border-box'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.15)',
          margin: '0 auto 16px auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          border: '2px solid rgba(255,255,255,0.3)',
          overflow: 'hidden'
        }}>
          {(settings?.photoUrl || personalInfo?.photo) ? (
            <img src={settings?.photoUrl || personalInfo?.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
          ) : (
            <span>👤</span>
          )}
        </div>

        <SidebarSection title={isArabic ? 'التواصل' : 'Contact'}>
          <div style={{ fontSize: '8.5pt', lineHeight: '2.2', opacity: 0.9 }}>
            {personalInfo?.phone && <div>📞 {personalInfo.phone}</div>}
            {personalInfo?.email && <div>✉ {personalInfo.email}</div>}
            {personalInfo?.location && <div>📍 {personalInfo.location}</div>}
            {personalInfo?.nationality && <div>🌍 {personalInfo.nationality}</div>}
            {personalInfo?.linkedin && <div>🔗 {personalInfo.linkedin}</div>}
          </div>
        </SidebarSection>

        {skillsList.length > 0 && (
          <div data-cv-section="skills" style={getSectionBlurStyle('skills', activeSection)}><SidebarSection title={isArabic ? 'المهارات' : 'Skills'}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {skillsList.map((skill, idx) => (
                <span key={idx} style={{
                  display: 'inline-block',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '8pt',
                  border: '1px solid rgba(255,255,255,0.25)'
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </SidebarSection></div>
        )}

        {languagesList.length > 0 && (
          <div data-cv-section="languages" style={getSectionBlurStyle('languages', activeSection)}><SidebarSection title={isArabic ? 'اللغات' : 'Languages'}>
            {languagesList.map((lang, idx) => (
              <div key={idx} style={{ fontSize: '9pt', marginBottom: '4px', opacity: 0.9 }}>
                {lang.name}{lang.level && ` — ${lang.level}`}
              </div>
            ))}
          </SidebarSection></div>
        )}

        {certsList.length > 0 && (
          <div data-cv-section="certifications" style={getSectionBlurStyle('certifications', activeSection)}><SidebarSection title={isArabic ? 'الشهادات' : 'Certifications'}>
            {certsList.map((cert, idx) => (
              <div key={idx} style={{ fontSize: '8.5pt', marginBottom: '6px', opacity: 0.9 }}>
                <div style={{ fontWeight: 'bold' }}>{cert.name}</div>
                {cert.issuer && <div style={{ opacity: 0.7, fontSize: '8pt' }}>{cert.issuer}</div>}
              </div>
            ))}
          </SidebarSection></div>
        )}
      </div>

      <div style={{
        width: '65%',
        padding: '24px 24px',
        boxSizing: 'border-box'
      }}>
<div data-cv-section="personalInfo" style={getSectionBlurStyle('personalInfo', activeSection)}><div style={{ marginBottom: '20px' }}>
          <h1 style={{
            fontSize: '22pt',
            fontWeight: 'bold',
            color: primaryColor,
            margin: '0 0 4px 0',
            letterSpacing: '0.5px'
          }}>
            {fullName}
          </h1>
          {getJobTitle(personalInfo, isArabic) && (
            <div style={{
              fontSize: '11pt',
              color: '#666',
              fontStyle: 'italic'
            }}>
              {getJobTitle(personalInfo, isArabic)}
            </div>
          )}
        </div></div>

        {fullSummary && (
          <div data-cv-section="summary" style={getSectionBlurStyle('summary', activeSection)}><MainSection title={isArabic ? 'الملخص المهني' : 'Professional Summary'}>
            <div className="[&_ul]:list-disc [&_ul]:pl-4 [&_b]:font-bold [&_i]:italic" style={{
              fontSize: '10pt',
              color: '#444',
              lineHeight: '1.7',
              textAlign: 'justify',
              margin: '0'
            }} dangerouslySetInnerHTML={{ __html: fullSummary }} />
          </MainSection></div>
        )}

        {experience.length > 0 && (
          <div data-cv-section="experience" style={getSectionBlurStyle('experience', activeSection)}><MainSection title={isArabic ? 'الخبرة المهنية' : 'Experience'}>
            {experience.map((exp, idx) => {
              const experienceHtml = getExperienceHtml(exp);
              return (
                <div key={idx} style={{
                  marginBottom: '14px',
                  paddingLeft: isArabic ? '0' : '14px',
                  paddingRight: isArabic ? '14px' : '0',
                  borderLeft: isArabic ? 'none' : `3px solid ${primaryColor}40`,
                  borderRight: isArabic ? `3px solid ${primaryColor}40` : 'none'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '10.5pt', fontWeight: 'bold', color: '#1a1a1a' }}>
                      {exp.position || exp.title}
                    </div>
                    <div style={{ fontSize: '8.5pt', color: '#888' }}>
                      {exp.startDate} - {exp.endDate || (isArabic ? 'الحاضر' : 'Present')}
                    </div>
                  </div>
                  <div style={{ fontSize: '9.5pt', color: primaryColor, marginBottom: '5px' }}>
                    {exp.company}{exp.location && ` • ${exp.location}`}
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
          </MainSection></div>
        )}

        {education.length > 0 && (
          <div data-cv-section="education" style={getSectionBlurStyle('education', activeSection)}><MainSection title={isArabic ? 'التعليم' : 'Education'}>
            {education.map((edu, idx) => (
              <div key={idx} style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '10.5pt', fontWeight: 'bold', color: '#1a1a1a' }}>
                  {edu.degree}{(edu.field || edu.fieldOfStudy) && ` in ${edu.field || edu.fieldOfStudy}`}
                </div>
                <div style={{ fontSize: '9.5pt', color: primaryColor }}>
                  {edu.institution || edu.school || 'Not provided'}
                </div>
                {(edu.endDate || edu.graduationYear) && (
                  <div style={{ fontSize: '8.5pt', color: '#888' }}>
                    {edu.startDate ? `${edu.startDate} - ${edu.endDate || 'Present'}` : edu.graduationYear || edu.endDate}
                  </div>
                )}
                {edu.description && (
                  <div style={{ fontSize: '9pt', color: '#444', lineHeight: '1.5', marginTop: '3px' }}>
                    {edu.description}
                  </div>
                )}
              </div>
            ))}
          </MainSection></div>
        )}
      </div>
    </div>
  );
}
