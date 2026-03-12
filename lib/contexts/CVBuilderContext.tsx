'use client';

import React, { createContext, useContext, useState } from 'react';

export interface CVData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    professionalSummary: string;
  };
  experience: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
  }>;
  skills: string[];
  courses: Array<{
    id: string;
    name: string;
    issuer: string;
  }>;
  languages: string[];
}

interface TemplateSettings {
  template: 'ats' | 'attractive';
  primaryColor: string;
  accentColor: string;
  headerBg: string;
  photoUrl?: string;
}

interface CVBuilderContextType {
  cvData: CVData;
  updateCVData: (data: Partial<CVData>) => void;
  templateSettings: TemplateSettings;
  updateTemplateSettings: (settings: Partial<TemplateSettings>) => void;
  step: number;
  setStep: (step: number) => void;
}

const CVBuilderContext = createContext<CVBuilderContextType | undefined>(undefined);

const DEFAULT_CV_DATA: CVData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    professionalSummary: '',
  },
  experience: [],
  education: [],
  skills: [],
  courses: [],
  languages: [],
};

const DEFAULT_TEMPLATE_SETTINGS: TemplateSettings = {
  template: 'ats',
  primaryColor: '#1a73e8',
  accentColor: '#4285f4',
  headerBg: '#f8f9fa',
};

export function CVBuilderProvider({ children }: { children: React.ReactNode }) {
  const [cvData, setCVData] = useState<CVData>(DEFAULT_CV_DATA);
  const [templateSettings, setTemplateSettings] = useState<TemplateSettings>(DEFAULT_TEMPLATE_SETTINGS);
  const [step, setStep] = useState(1);

  const updateCVData = (data: Partial<CVData>) => {
    setCVData(prev => ({ ...prev, ...data }));
  };

  const updateTemplateSettings = (settings: Partial<TemplateSettings>) => {
    setTemplateSettings(prev => ({ ...prev, ...settings }));
  };

  return (
    <CVBuilderContext.Provider value={{ cvData, updateCVData, templateSettings, updateTemplateSettings, step, setStep }}>
      {children}
    </CVBuilderContext.Provider>
  );
}

export function useCVBuilder() {
  const context = useContext(CVBuilderContext);
  if (!context) {
    throw new Error('useCVBuilder must be used within CVBuilderProvider');
  }
  return context;
}
