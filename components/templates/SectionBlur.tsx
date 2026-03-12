import React from 'react';

interface SectionBlurProps {
  sectionName: string;
  activeSection?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function SectionBlur({ sectionName, activeSection, children, className = '', style = {} }: SectionBlurProps) {
  const isBlurred = activeSection && activeSection !== sectionName;
  
  return (
    <div 
      className={className}
      style={{
        ...style,
        filter: isBlurred ? 'blur(4px)' : 'none',
        opacity: isBlurred ? 0.6 : 1,
        transition: 'filter 0.3s ease, opacity 0.3s ease',
        userSelect: isBlurred ? 'none' as const : 'auto' as const,
      }}
    >
      {children}
    </div>
  );
}

export function getSectionBlurStyle(sectionName: string, activeSection?: string): React.CSSProperties {
  const isBlurred = activeSection && activeSection !== sectionName;
  return {
    filter: isBlurred ? 'blur(4px)' : 'none',
    opacity: isBlurred ? 0.6 : 1,
    transition: 'filter 0.3s ease, opacity 0.3s ease',
    userSelect: isBlurred ? 'none' as const : 'auto' as const,
  };
}
