'use client';

import { useMemo, useCallback } from 'react';
import { 
  validateCV, 
  validatePersonalInfo,
  validateSummary,
  validateEducation,
  validateExperience,
  validateCertifications,
  validateSkills,
  validateLanguages,
  CVValidationResult,
  SectionValidation,
  ValidationError,
  SECTION_ORDER
} from '@/lib/cv/validation';

export interface SectionDefinition {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  order: number;
}

export const SECTION_DEFINITIONS: SectionDefinition[] = [
  { id: 'personalInfo', name: 'Personal Information', nameAr: 'المعلومات الشخصية', icon: '👤', order: 0 },
  { id: 'summary', name: 'Professional Summary', nameAr: 'الملخص المهني', icon: '📝', order: 1 },
  { id: 'education', name: 'Education', nameAr: 'التعليم', icon: '🎓', order: 2 },
  { id: 'experience', name: 'Work Experience', nameAr: 'الخبرة المهنية', icon: '💼', order: 3 },
  { id: 'certifications', name: 'Certifications', nameAr: 'الشهادات', icon: '📜', order: 4 },
  { id: 'skills', name: 'Skills', nameAr: 'المهارات', icon: '⚡', order: 5 },
  { id: 'languages', name: 'Languages', nameAr: 'اللغات', icon: '🌐', order: 6 },
];

export interface FieldError {
  hasError: boolean;
  message: string;
  messageAr: string;
}

export interface UseCVValidationResult {
  validation: CVValidationResult;
  currentSectionValidation: SectionValidation | null;
  getSectionValidation: (sectionId: string) => SectionValidation | null;
  getFieldError: (fieldPath: string) => FieldError | null;
  canAdvanceTo: (targetSectionId: string, currentSectionId: string) => boolean;
  canDownload: boolean;
  getNextSection: (currentSectionId: string) => string | null;
  getPrevSection: (currentSectionId: string) => string | null;
  incompleteSections: SectionValidation[];
}

export function useCVValidation(
  cvData: any, 
  currentSectionId: string = 'personalInfo',
  options?: { isFreshGraduate?: boolean }
): UseCVValidationResult {
  const isFreshGraduate = options?.isFreshGraduate || false;

  const validation = useMemo(() => {
    return validateCV(cvData, { isFreshGraduate });
  }, [cvData, isFreshGraduate]);

  const currentSectionValidation = useMemo(() => {
    return validation.sections.find(s => s.id === currentSectionId) || null;
  }, [validation, currentSectionId]);

  const getSectionValidation = useCallback((sectionId: string): SectionValidation | null => {
    return validation.sections.find(s => s.id === sectionId) || null;
  }, [validation]);

  const getFieldError = useCallback((fieldPath: string): FieldError | null => {
    for (const section of validation.sections) {
      const error = section.errors.find(e => e.field === fieldPath);
      if (error) {
        return {
          hasError: true,
          message: error.message,
          messageAr: error.messageAr
        };
      }
    }
    return null;
  }, [validation]);

  const canAdvanceTo = useCallback((targetSectionId: string, fromSectionId: string): boolean => {
    const targetIndex = SECTION_ORDER.indexOf(targetSectionId);
    const currentIndex = SECTION_ORDER.indexOf(fromSectionId);
    
    if (targetIndex < 0 || currentIndex < 0) return false;
    
    if (targetIndex <= currentIndex) {
      return true;
    }
    
    for (let i = 0; i <= currentIndex; i++) {
      const sectionId = SECTION_ORDER[i];
      const sectionValidation = validation.sections.find(s => s.id === sectionId);
      if (sectionValidation && !sectionValidation.isComplete) {
        return false;
      }
    }
    
    return true;
  }, [validation]);

  const canDownload = useMemo(() => {
    return validation.isValid;
  }, [validation.isValid]);

  const getNextSection = useCallback((currentSectionId: string): string | null => {
    const currentIndex = SECTION_ORDER.indexOf(currentSectionId);
    if (currentIndex < 0 || currentIndex >= SECTION_ORDER.length - 1) return null;
    return SECTION_ORDER[currentIndex + 1];
  }, []);

  const getPrevSection = useCallback((currentSectionId: string): string | null => {
    const currentIndex = SECTION_ORDER.indexOf(currentSectionId);
    if (currentIndex <= 0) return null;
    return SECTION_ORDER[currentIndex - 1];
  }, []);

  const incompleteSections = useMemo(() => {
    return validation.sections.filter(s => !s.isComplete);
  }, [validation]);

  return {
    validation,
    currentSectionValidation,
    getSectionValidation,
    getFieldError,
    canAdvanceTo,
    canDownload,
    getNextSection,
    getPrevSection,
    incompleteSections
  };
}

export function getFieldBorderClass(hasError: boolean, isTouched: boolean = true): string {
  if (!isTouched) return 'border-gray-200 focus:border-turquoise-500';
  return hasError 
    ? 'border-red-500 focus:border-red-500 bg-red-50' 
    : 'border-gray-200 focus:border-turquoise-500';
}
