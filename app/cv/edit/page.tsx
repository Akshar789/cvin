'use client';

import React, { useEffect, useState, useMemo, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SmartSearchDropdown from '@/components/ui/SmartSearchDropdown';
import SectionChecklist from '@/components/cv-builder/SectionChecklist';
import { useCVValidation, SECTION_DEFINITIONS, getFieldBorderClass } from '@/lib/hooks/useCVValidation';
import { FiArrowRight, FiArrowLeft, FiPlus, FiTrash2, FiEye, FiSave, FiDownload, FiZap, FiAlertCircle, FiCheck, FiHome, FiLock, FiGlobe, FiLoader } from 'react-icons/fi';
import { getFeatureAccess, parseSubscriptionTier, type FeatureAccess } from '@/lib/utils/subscriptionAccess';
import { JOB_DOMAINS } from '@/lib/constants/jobDomains';
import SyncProfileModal, { detectProfileDifferences, type FieldDifference } from '@/components/cv/SyncProfileModal';

import ClassicTemplate from '@/components/templates/ClassicTemplate';
import SimpleProfessionalTemplate from '@/components/templates/SimpleProfessionalTemplate';
import MinimalistCleanTemplate from '@/components/templates/MinimalistCleanTemplate';
import ModernTemplate from '@/components/templates/ModernTemplate';
import ExecutiveTemplate from '@/components/templates/ExecutiveTemplate';
import CreativeTemplate from '@/components/templates/CreativeTemplate';
import ExecutiveCleanProTemplate from '@/components/templates/ExecutiveCleanProTemplate';
import StructuredSidebarProTemplate from '@/components/templates/StructuredSidebarProTemplate';
import GlobalProfessionalTemplate from '@/components/templates/GlobalProfessionalTemplate';
import ATSUltraProTemplate from '@/components/templates/ATSUltraProTemplate';
import SmartTemplate from '@/components/templates/SmartTemplate';
import StrongTemplate from '@/components/templates/StrongTemplate';
import ElegantTemplate from '@/components/templates/ElegantTemplate';
import CompactTemplate from '@/components/templates/CompactTemplate';
import TwoColumnProTemplate from '@/components/templates/TwoColumnProTemplate';
import CleanModernTemplate from '@/components/templates/CleanModernTemplate';
import ProfessionalEdgeTemplate from '@/components/templates/ProfessionalEdgeTemplate';
import MetroTemplate from '@/components/templates/MetroTemplate';
import FreshStartTemplate from '@/components/templates/FreshStartTemplate';
import NordicTemplate from '@/components/templates/NordicTemplate';

function getTemplateComponent(templateSlug: string) {
  const map: Record<string, any> = {
    'classic': ClassicTemplate,
    'simple-professional': SimpleProfessionalTemplate,
    'minimalist-clean': MinimalistCleanTemplate,
    'modern': ModernTemplate,
    'executive': ExecutiveTemplate,
    'creative': CreativeTemplate,
    'executive-clean-pro': ExecutiveCleanProTemplate,
    'structured-sidebar-pro': StructuredSidebarProTemplate,
    'global-professional': GlobalProfessionalTemplate,
    'ats-ultra-pro': ATSUltraProTemplate,
    'smart': SmartTemplate,
    'strong': StrongTemplate,
    'elegant': ElegantTemplate,
    'compact': CompactTemplate,
    'two-column-pro': TwoColumnProTemplate,
    'clean-modern': CleanModernTemplate,
    'professional-edge': ProfessionalEdgeTemplate,
    'metro': MetroTemplate,
    'fresh-start': FreshStartTemplate,
    'nordic': NordicTemplate,
  };
  return map[templateSlug] || SimpleProfessionalTemplate;
}

interface CVData {
  personalInfo: {
    fullName: string;
    name?: string;
    email: string;
    phone: string;
    location: string;
    nationality: string;
    linkedin: string;
    targetJobDomain: string;
  };
  professionalSummary: string;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    location: string;
    responsibilities: string[];
    achievements?: string[];
    description?: string;
  }>;
  education: Array<{
    institution: string;
    school?: string;
    degree: string;
    field?: string;
    fieldOfStudy?: string;
    startDate: string;
    endDate: string;
    graduationYear?: string;
    location: string;
    gpa?: string;
    achievements: string[];
    description?: string;
  }>;
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
  };
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    credentialId?: string;
  }>;
  languages: Array<{
    name: string;
    language?: string;
    proficiency: string;
    level?: string;
  }>;
}

// Helper function to normalize LinkedIn URLs to canonical format
const normalizeLinkedInUrl = (url: string): { normalized: string; isValid: boolean } => {
  const trimmed = url.trim();
  
  // Empty is valid (optional field)
  if (!trimmed) {
    return { normalized: '', isValid: true };
  }
  
  // Prepend https:// if missing protocol
  let fullUrl = trimmed;
  if (!trimmed.match(/^https?:\/\//i)) {
    fullUrl = 'https://' + trimmed;
  }
  
  try {
    const urlObj = new URL(fullUrl);
    
    // Check if this is a LinkedIn URL (must be exactly linkedin.com or www.linkedin.com)
    const host = urlObj.host.toLowerCase();
    const isLinkedIn = host === 'linkedin.com' || host === 'www.linkedin.com';
    if (!isLinkedIn) {
      // Not a LinkedIn URL - return as invalid
      return { normalized: trimmed, isValid: false };
    }
    
    // Check if path exists (e.g., /in/profile)
    if (!urlObj.pathname || urlObj.pathname === '/') {
      // LinkedIn URL without path is invalid
      return { normalized: trimmed, isValid: false };
    }
    
    // Enforce canonical format: https://www.linkedin.com + path
    const canonical = `https://www.linkedin.com${urlObj.pathname}${urlObj.search}${urlObj.hash}`;
    return { normalized: canonical, isValid: true };
  } catch (e) {
    // Invalid URL format
    return { normalized: trimmed, isValid: false };
  }
};

const ALL_TEMPLATES = [
  { id: 'simple-professional', name: 'Simple Professional', nameAr: 'بسيط احترافي', category: 'free', defaultColor: '#333333' },
  { id: 'minimalist-clean', name: 'Minimalist Clean', nameAr: 'بسيط نظيف', category: 'free', defaultColor: '#B8860B' },
  { id: 'classic', name: 'Classic', nameAr: 'كلاسيكي', category: 'free', defaultColor: '#2563eb' },
  { id: 'modern', name: 'Modern', nameAr: 'حديث', category: 'free', defaultColor: '#0891b2' },
  { id: 'compact', name: 'Compact', nameAr: 'مضغوط', category: 'free', defaultColor: '#475569' },
  { id: 'smart', name: 'Smart', nameAr: 'ذكي', category: 'free', defaultColor: '#2563eb' },
  { id: 'strong', name: 'Strong', nameAr: 'قوي', category: 'free', defaultColor: '#1e3a5f' },
  { id: 'ats-ultra-pro', name: 'ATS Ultra Pro', nameAr: 'ATS الترا برو', category: 'free', defaultColor: '#1e40af' },
  { id: 'executive', name: 'Executive', nameAr: 'تنفيذي', category: 'premium', defaultColor: '#1e3a5f' },
  { id: 'creative', name: 'Creative', nameAr: 'إبداعي', category: 'premium', defaultColor: '#7c3aed' },
  { id: 'elegant', name: 'Elegant', nameAr: 'أنيق', category: 'premium', defaultColor: '#854d0e' },
  { id: 'executive-clean-pro', name: 'Executive Clean Pro', nameAr: 'تنفيذي نظيف برو', category: 'premium', defaultColor: '#0f172a' },
  { id: 'structured-sidebar-pro', name: 'Structured Sidebar', nameAr: 'شريط جانبي منظم', category: 'premium', defaultColor: '#1e293b' },
  { id: 'global-professional', name: 'Global Professional', nameAr: 'محترف عالمي', category: 'premium', defaultColor: '#0c4a6e' },
  { id: 'two-column-pro', name: 'Two Column Pro', nameAr: 'عمودين برو', category: 'premium', defaultColor: '#1e40af' },
];

function CVEditPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token, loading: authLoading, loggingOut } = useAuth();
  const { t, isRTL, language, setLanguage, isHydrated } = useLanguage();
  
  const [cvData, setCvData] = useState<CVData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      nationality: '',
      linkedin: '',
      targetJobDomain: '',
    },
    professionalSummary: '',
    experience: [],
    education: [],
    skills: {
      technical: [],
      soft: [],
      tools: [],
    },
    certifications: [],
    languages: [],
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatingSection, setGeneratingSection] = useState<string | null>(null);
  const [editingCvId, setEditingCvId] = useState<string | null>(null);
  
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [profileDifferences, setProfileDifferences] = useState<FieldDifference[]>([]);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [cvContentLang, setCvContentLang] = useState<'en' | 'ar'>('en');
  const [translating, setTranslating] = useState(false);
  const englishCvDataRef = useRef<CVData | null>(null);
  const arabicCvDataRef = useRef<CVData | null>(null);
  const contentArLoadedRef = useRef(false);
  
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Section-by-section validation state
  const [currentSection, setCurrentSection] = useState('personalInfo');
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  
  // Section save status: 'idle' | 'saving' | 'saved' | 'error'
  const [sectionSaveStatus, setSectionSaveStatus] = useState<Record<string, 'idle' | 'saving' | 'saved' | 'error'>>({
    personalInfo: 'idle',
    summary: 'idle',
    experience: 'idle',
    education: 'idle',
    skills: 'idle',
    certifications: 'idle',
    languages: 'idle',
  });
  
  // Section refs for scrolling
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const urlTemplate = searchParams.get('template');
  const initialTemplate = urlTemplate || (typeof window !== 'undefined' ? sessionStorage.getItem('selectedTemplate') : null) || 'simple-professional';
  const initialColor = (typeof window !== 'undefined' ? sessionStorage.getItem('selectedColor') : null) || '#333333';
  
  const [selectedTemplate, setSelectedTemplate] = useState<string>(initialTemplate);
  const [templateVariant, setTemplateVariant] = useState<string>(initialTemplate);
  const [primaryColor, setPrimaryColor] = useState<string>(initialColor);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (templateVariant) {
      sessionStorage.setItem('selectedTemplate', templateVariant);
    }
  }, [templateVariant]);

  useEffect(() => {
    if (primaryColor) {
      sessionStorage.setItem('selectedColor', primaryColor);
    }
  }, [primaryColor]);
  
  // Template preview now uses direct React component rendering instead of PDF iframe
  
  // Subscription tier and feature access (memoized for stable values across renders)
  const subscriptionTier = useMemo(() => parseSubscriptionTier(user?.subscriptionTier), [user?.subscriptionTier]);
  const featureAccess = useMemo(() => getFeatureAccess(subscriptionTier), [subscriptionTier]);
  
  // CV Validation hook
  const cvValidation = useCVValidation(cvData, currentSection, { isFreshGraduate: false });
  
  // Helper to mark a field as touched
  const markFieldTouched = useCallback((fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
  }, []);
  
  // Helper to check if a field is touched
  const isFieldTouched = useCallback((fieldName: string) => {
    return touchedFields.has(fieldName);
  }, [touchedFields]);
  
  // Helper to get field validation state
  const getFieldValidation = useCallback((fieldPath: string) => {
    const error = cvValidation.getFieldError(fieldPath);
    const isTouched = isFieldTouched(fieldPath);
    return {
      hasError: isTouched && error?.hasError,
      error: isTouched ? error : null
    };
  }, [cvValidation, isFieldTouched]);
  
  // Handle section click from checklist
  const handleSectionClick = useCallback((sectionId: string) => {
    // Check if we can navigate to this section
    if (!cvValidation.canAdvanceTo(sectionId, currentSection)) {
      // Show error - cannot skip ahead
      const currentSectionData = cvValidation.getSectionValidation(currentSection);
      if (currentSectionData && !currentSectionData.isComplete) {
        alert(isRTL 
          ? 'يرجى إكمال القسم الحالي قبل المتابعة'
          : 'Please complete the current section before proceeding'
        );
        return;
      }
    }
    
    setCurrentSection(sectionId);
    
    // Scroll to section
    const sectionRef = sectionRefs.current[sectionId];
    if (sectionRef) {
      sectionRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [cvValidation, currentSection, isRTL]);
  
  // Save section data to sessionStorage and optionally to backend
  const saveSectionData = useCallback(async (sectionId: string): Promise<boolean> => {
    if (!token) return false;
    
    // Set saving status
    setSectionSaveStatus(prev => ({ ...prev, [sectionId]: 'saving' }));
    
    try {
      // Normalize LinkedIn URL if saving personal info section
      let normalizedCvData = { ...cvData };
      if (sectionId === 'personalInfo' && cvData.personalInfo.linkedin) {
        const result = normalizeLinkedInUrl(cvData.personalInfo.linkedin);
        if (!result.isValid) {
          setSectionSaveStatus(prev => ({ ...prev, [sectionId]: 'error' }));
          return false;
        }
        normalizedCvData = {
          ...cvData,
          personalInfo: {
            ...cvData.personalInfo,
            linkedin: result.normalized
          }
        };
        setCvData(normalizedCvData);
      }
      
      // Save to sessionStorage
      sessionStorage.setItem('generatedCV', JSON.stringify(normalizedCvData));
      
      // If we have an existing CV ID, save to backend
      if (editingCvId) {
        const savedTemplate = sessionStorage.getItem('selectedTemplate') || 'simple-professional';
        const title = normalizedCvData.personalInfo?.fullName 
          ? `${normalizedCvData.personalInfo.fullName}'s CV`
          : 'My CV';
        
        const enData = cvContentLang === 'en' ? normalizedCvData : englishCvDataRef.current;
        const arData = cvContentLang === 'ar' ? normalizedCvData : arabicCvDataRef.current;
        const dataToSave = enData || normalizedCvData;

        const buildLangBlob = (data: any) => ({
          personalInfo: data.personalInfo || {},
          professionalSummary: data.professionalSummary || '',
          experience: data.experience || [],
          education: data.education || [],
          skills: data.skills || { technical: [], soft: [], tools: [] },
          certifications: data.certifications || [],
          languages: data.languages || [],
        });

        const enrichedPi: any = { ...(dataToSave.personalInfo || {}) };
        if (enData) enrichedPi.englishContent = buildLangBlob(enData);
        if (arData) enrichedPi.arabicContent = buildLangBlob(arData);

        const payload: any = {
          title,
          templateId: savedTemplate,
          personalInfo: enrichedPi,
          summary: dataToSave.professionalSummary || '',
          professionalSummary: dataToSave.professionalSummary || '',
          experience: dataToSave.experience || [],
          education: dataToSave.education || [],
          skills: dataToSave.skills || { technical: [], soft: [], tools: [] },
          certifications: dataToSave.certifications || [],
          languages: dataToSave.languages || [],
          language: 'en',
          textDirection: cvContentLang === 'ar' ? 'rtl' : 'ltr',
        };

        if (arData) {
          payload.contentAr = buildLangBlob(arData);
        }
        
        console.log('[CV Edit] Saving to backend:', {
          cvId: editingCvId,
          hasPersonalInfo: !!payload.personalInfo,
          hasExperience: Array.isArray(payload.experience),
          hasEducation: Array.isArray(payload.education),
          hasSkills: !!payload.skills,
        });
        
        await axios.put(
          `/api/cv/${editingCvId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      // Set saved status - persist until next edit
      setSectionSaveStatus(prev => ({ ...prev, [sectionId]: 'saved' }));
      
      return true;
    } catch (error: any) {
      console.error('Failed to save section:', error);
      
      // Extract error message
      let errorMessage = 'Failed to save';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      console.error('Save error details:', {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data,
      });
      
      setSectionSaveStatus(prev => ({ ...prev, [sectionId]: 'error' }));
      
      return false;
    }
  }, [token, cvData, editingCvId, language, cvContentLang]);
  
  // Reset save status when user starts editing a section
  const markSectionEditing = useCallback((sectionId: string) => {
    setSectionSaveStatus(prev => {
      // Only reset if currently showing 'saved' or 'error'
      if (prev[sectionId] === 'saved' || prev[sectionId] === 'error') {
        return { ...prev, [sectionId]: 'idle' };
      }
      return prev;
    });
  }, []);
  
  const [translationError, setTranslationError] = useState<string | null>(null);

  const cvContentLangRef = useRef(cvContentLang);
  useEffect(() => { cvContentLangRef.current = cvContentLang; }, [cvContentLang]);

  const isContentIdentical = useCallback((dataA: CVData | null, dataB: CVData | null): boolean => {
    if (!dataA || !dataB) return false;
    const summaryA = (dataA.professionalSummary || '').trim();
    const summaryB = (dataB.professionalSummary || '').trim();
    if (summaryA && summaryB && summaryA === summaryB) return true;
    const expA = dataA.experience?.[0];
    const expB = dataB.experience?.[0];
    if (expA && expB) {
      const descA = (expA.description || expA.responsibilities?.join(' ') || '').trim();
      const descB = (expB.description || expB.responsibilities?.join(' ') || '').trim();
      if (descA && descB && descA === descB) return true;
    }
    return false;
  }, []);

  const doTranslation = useCallback(async (newLang: 'en' | 'ar', sourceData: CVData) => {
    setTranslating(true);
    console.log('[CV Edit] Translating content to', newLang, 'via API');
    try {
      const res = await fetch('/api/ai/translate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          targetLanguage: newLang,
          content: {
            summary: sourceData.professionalSummary || '',
            experience: (sourceData.experience || []).map((exp: any) => ({
              position: exp.position || '',
              description: exp.description || '',
              location: exp.location || '',
              responsibilities: exp.responsibilities || [],
            })),
            education: (sourceData.education || []).map((edu: any) => ({
              degree: edu.degree || '',
              field: edu.field || edu.fieldOfStudy || '',
              description: edu.description || '',
            })),
            skills: sourceData.skills || { technical: [], soft: [], tools: [] },
            personalInfo: {
              targetJobDomain: sourceData.personalInfo?.targetJobDomain || '',
              nationality: sourceData.personalInfo?.nationality || '',
              location: sourceData.personalInfo?.location || '',
            },
          },
        }),
      });
      if (!res.ok) throw new Error(`Translation failed: ${res.status}`);
      const data = await res.json();
      const translated = data.translated;
      if (!translated) throw new Error('Empty translation response');

      const translatedCvData: CVData = {
        personalInfo: {
          ...sourceData.personalInfo,
          targetJobDomain: translated.targetJobDomain || sourceData.personalInfo.targetJobDomain || '',
          nationality: translated.nationality || sourceData.personalInfo.nationality || '',
          location: translated.location || sourceData.personalInfo.location || '',
        },
        professionalSummary: translated.summary || sourceData.professionalSummary || '',
        experience: (sourceData.experience || []).map((exp: any, i: number) => {
          const tExp = Array.isArray(translated.experience) && i < translated.experience.length ? translated.experience[i] : null;
          return {
            ...exp,
            position: tExp?.position || exp.position || '',
            description: tExp?.description || exp.description || '',
            location: tExp?.location || exp.location || '',
            responsibilities: Array.isArray(tExp?.responsibilities) ? tExp.responsibilities : (exp.responsibilities || []),
          };
        }),
        education: (sourceData.education || []).map((edu: any, i: number) => {
          const tEdu = Array.isArray(translated.education) && i < translated.education.length ? translated.education[i] : null;
          return {
            ...edu,
            degree: tEdu?.degree || edu.degree || '',
            field: tEdu?.field || edu.field || edu.fieldOfStudy || '',
            description: tEdu?.description || edu.description || '',
          };
        }),
        skills: (translated.skills && typeof translated.skills === 'object')
          ? {
              technical: Array.isArray(translated.skills.technical) ? translated.skills.technical : (sourceData.skills?.technical || []),
              soft: Array.isArray(translated.skills.soft) ? translated.skills.soft : (sourceData.skills?.soft || []),
              tools: Array.isArray(translated.skills.tools) ? translated.skills.tools : (sourceData.skills?.tools || []),
            }
          : sourceData.skills,
        certifications: sourceData.certifications,
        languages: sourceData.languages,
      };

      if (newLang === 'ar') {
        arabicCvDataRef.current = translatedCvData;
        englishCvDataRef.current = JSON.parse(JSON.stringify(sourceData));
        sessionStorage.setItem('cvContentAr', JSON.stringify(translatedCvData));
      } else {
        englishCvDataRef.current = translatedCvData;
        arabicCvDataRef.current = JSON.parse(JSON.stringify(sourceData));
        sessionStorage.setItem('generatedCV', JSON.stringify(translatedCvData));
        sessionStorage.setItem('cvContentAr', JSON.stringify(sourceData));
      }

      setCvData(translatedCvData);
      setCvContentLang(newLang);
      sessionStorage.setItem('cvContentLanguage', newLang);
      console.log('[CV Edit] Translation applied successfully for', newLang);
    } catch (error: any) {
      console.error('[CV Edit] Translation error:', error);
      setTranslationError(
        newLang === 'ar'
          ? 'Failed to translate. Please try again.'
          : 'فشلت الترجمة. يرجى المحاولة مرة أخرى.'
      );
    } finally {
      setTranslating(false);
    }
  }, [token]);

  const switchCvContentLanguage = useCallback((newLang: 'en' | 'ar') => {
    if (newLang === cvContentLangRef.current) return;
    if (translating) return;
    setTranslationError(null);

    const currentLang = cvContentLangRef.current;
    if (currentLang === 'en') {
      englishCvDataRef.current = JSON.parse(JSON.stringify(cvData));
    } else {
      arabicCvDataRef.current = JSON.parse(JSON.stringify(cvData));
    }

    const targetRef = newLang === 'ar' ? arabicCvDataRef.current : englishCvDataRef.current;
    const needsTranslation = !targetRef || isContentIdentical(englishCvDataRef.current, arabicCvDataRef.current);

    if (!needsTranslation && targetRef) {
      setCvData(JSON.parse(JSON.stringify(targetRef)));
      setCvContentLang(newLang);
      sessionStorage.setItem('cvContentLanguage', newLang);
      console.log('[CV Edit] Switched to cached', newLang, 'content');
      return;
    }

    const sourceData = JSON.parse(JSON.stringify(cvData));
    doTranslation(newLang, sourceData);
  }, [cvData, translating, isContentIdentical, doTranslation]);

  const toggleCvContentLanguage = useCallback(() => {
    const newLang = cvContentLang === 'en' ? 'ar' : 'en';
    switchCvContentLanguage(newLang);
  }, [cvContentLang, switchCvContentLanguage]);

  useEffect(() => {
    if (language !== cvContentLang) {
      switchCvContentLanguage(language as 'en' | 'ar');
    }
  }, [language]);

  // Save Status Indicator Component
  const SaveStatusIndicator = ({ sectionId }: { sectionId: string }) => {
    const status = sectionSaveStatus[sectionId];
    
    if (status === 'idle') return null;
    
    return (
      <div className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
        status === 'saving' ? 'bg-blue-100 text-blue-700' :
        status === 'saved' ? 'bg-green-100 text-green-700' :
        'bg-red-100 text-red-700'
      }`}>
        {status === 'saving' && (
          <>
            <div className="w-3 h-3 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
            <span>{t.builder.saving}</span>
          </>
        )}
        {status === 'saved' && (
          <>
            <FiCheck className="w-3 h-3" />
            <span>{t.builder.saved}</span>
          </>
        )}
        {status === 'error' && (
          <>
            <FiAlertCircle className="w-3 h-3" />
            <span>{t.builder.saveError}</span>
          </>
        )}
      </div>
    );
  };
  
  // Handle next section navigation with save
  const handleNextSection = useCallback(async () => {
    const currentSectionData = cvValidation.getSectionValidation(currentSection);
    
    // Mark all fields in current section as touched
    if (currentSectionData) {
      currentSectionData.requiredFields.forEach(field => {
        if (currentSection === 'personalInfo') {
          markFieldTouched(field);
        } else if (currentSection === 'summary') {
          markFieldTouched('summary');
        } else {
          markFieldTouched(field);
        }
      });
    }
    
    // Check if current section is complete
    if (currentSectionData && !currentSectionData.isComplete) {
      alert(isRTL 
        ? 'يرجى إكمال الحقول المطلوبة في هذا القسم'
        : 'Please complete all required fields in this section'
      );
      return;
    }
    
    // Additional validation for summary section (min 50 characters)
    if (currentSection === 'summary' && cvData.professionalSummary.length < 50) {
      alert(isRTL ? t.builder.summaryMinChars : t.builder.summaryMinChars);
      return;
    }
    
    // Save current section before navigating
    const saveSuccess = await saveSectionData(currentSection);
    if (!saveSuccess) {
      // If save failed for personal info due to LinkedIn, show specific error
      if (currentSection === 'personalInfo' && cvData.personalInfo.linkedin) {
        alert(isRTL 
          ? 'يرجى إدخال رابط LinkedIn صالح بتنسيق: https://www.linkedin.com/in/your-profile'
          : 'Please enter a valid LinkedIn URL in the format: https://www.linkedin.com/in/your-profile'
        );
      }
      return;
    }
    
    const nextSection = cvValidation.getNextSection(currentSection);
    if (nextSection) {
      setCurrentSection(nextSection);
      const sectionRef = sectionRefs.current[nextSection];
      if (sectionRef) {
        sectionRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [cvValidation, currentSection, markFieldTouched, isRTL, cvData, saveSectionData, t]);
  
  // Handle previous section navigation
  const handlePrevSection = useCallback(() => {
    const prevSection = cvValidation.getPrevSection(currentSection);
    if (prevSection) {
      setCurrentSection(prevSection);
      const sectionRef = sectionRefs.current[prevSection];
      if (sectionRef) {
        sectionRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [cvValidation, currentSection]);

  useEffect(() => {
    if (!authLoading && !user && !loggingOut) {
      router.push('/auth/login');
      return;
    }

    if (!authLoading && user) {
      // Check if we're editing an existing CV
      const storedCvId = sessionStorage.getItem('editingCvId');
      if (storedCvId) {
        setEditingCvId(storedCvId);
      }
      
      const storedCV = sessionStorage.getItem('generatedCV');
      if (storedCV) {
        const parsedCV = JSON.parse(storedCV);
        if (parsedCV.languages && Array.isArray(parsedCV.languages)) {
          parsedCV.languages = parsedCV.languages.map((lang: any) => {
            if (typeof lang === 'string') {
              return { name: lang, proficiency: '' };
            }
            return lang;
          });
        }
        if (!parsedCV.personalInfo?.nationality) {
          const loc = (parsedCV.personalInfo?.location || '').toLowerCase();
          if (loc.includes('saudi') || !loc) {
            parsedCV.personalInfo = { ...parsedCV.personalInfo, nationality: parsedCV.cvLanguage === 'ar' ? 'سعودي' : 'Saudi' };
          }
        }
        setCvData(parsedCV);
        englishCvDataRef.current = JSON.parse(JSON.stringify(parsedCV));

        const storedContentAr = sessionStorage.getItem('cvContentAr');
        if (storedContentAr) {
          try {
            const arRaw = JSON.parse(storedContentAr);
            const normalizedAr: CVData = {
              personalInfo: {
                fullName: arRaw.personalInfo?.fullName || arRaw.personalInfo?.name || parsedCV.personalInfo?.fullName || '',
                email: arRaw.personalInfo?.email || parsedCV.personalInfo?.email || '',
                phone: arRaw.personalInfo?.phone || parsedCV.personalInfo?.phone || '',
                location: arRaw.personalInfo?.location || parsedCV.personalInfo?.location || '',
                nationality: arRaw.personalInfo?.nationality || parsedCV.personalInfo?.nationality || '',
                linkedin: arRaw.personalInfo?.linkedin || parsedCV.personalInfo?.linkedin || '',
                targetJobDomain: arRaw.personalInfo?.targetJobDomain || parsedCV.personalInfo?.targetJobDomain || '',
              },
              professionalSummary: arRaw.professionalSummary || arRaw.summary || '',
              experience: Array.isArray(arRaw.experience) ? arRaw.experience.map((exp: any) => ({
                company: exp.company || '',
                position: exp.position || exp.title || '',
                location: exp.location || '',
                startDate: exp.startDate || '',
                endDate: exp.endDate || '',
                responsibilities: Array.isArray(exp.responsibilities) ? exp.responsibilities : (exp.description ? [exp.description] : ['']),
                description: exp.description || '',
              })) : parsedCV.experience || [],
              education: Array.isArray(arRaw.education) ? arRaw.education.map((edu: any) => ({
                institution: edu.institution || edu.school || '',
                degree: edu.degree || '',
                field: edu.field || edu.fieldOfStudy || '',
                startDate: edu.startDate || '',
                endDate: edu.endDate || edu.graduationDate || '',
                location: edu.location || '',
                gpa: edu.gpa || '',
                description: edu.description || '',
                achievements: Array.isArray(edu.achievements) ? edu.achievements : [],
              })) : parsedCV.education || [],
              skills: (arRaw.skills && typeof arRaw.skills === 'object' && !Array.isArray(arRaw.skills))
                ? {
                    technical: Array.isArray(arRaw.skills.technical) ? arRaw.skills.technical : [],
                    soft: Array.isArray(arRaw.skills.soft) ? arRaw.skills.soft : [],
                    tools: Array.isArray(arRaw.skills.tools) ? arRaw.skills.tools : [],
                  }
                : parsedCV.skills || { technical: [], soft: [], tools: [] },
              certifications: Array.isArray(arRaw.certifications) ? arRaw.certifications : (parsedCV.certifications || []),
              languages: Array.isArray(arRaw.languages) ? arRaw.languages : (parsedCV.languages || []),
            };
            arabicCvDataRef.current = normalizedAr;
            contentArLoadedRef.current = true;
            console.log('[CV Edit] Loaded and normalized Arabic content from storage');
          } catch (e) {
            console.error('[CV Edit] Failed to parse stored Arabic content');
          }
        }

        const storedLang = sessionStorage.getItem('cvContentLanguage');
        if (storedLang === 'ar' || storedLang === 'en') {
          setCvContentLang(storedLang);
          if (storedLang === 'ar' && arabicCvDataRef.current) {
            setCvData(JSON.parse(JSON.stringify(arabicCvDataRef.current)));
          }
        }

        if (storedCvId && token && parsedCV.experience?.length > 0) {
          fetch(`/api/cv/${storedCvId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then(async (res) => {
            if (!res.ok) return;
            const dbData = await res.json();
            const dbCv = dbData.cv;
            const dbExpCount = dbCv?.experience?.length || 0;
            const dbSummary = dbCv?.professionalSummary || dbCv?.summary || '';
            const dbEduCount = dbCv?.education?.length || 0;
            const dbSkills = dbCv?.skills;
            const hasDbSkills = dbSkills && (
              (Array.isArray(dbSkills.technical) && dbSkills.technical.length > 0) ||
              (Array.isArray(dbSkills.soft) && dbSkills.soft.length > 0) ||
              (Array.isArray(dbSkills.tools) && dbSkills.tools.length > 0)
            );

            if (dbExpCount > 0 || dbSummary || dbEduCount > 0 || hasDbSkills) {
              console.log('[CV Edit] DB already has content (exp:', dbExpCount, 'edu:', dbEduCount, 'skills:', !!hasDbSkills, 'summary:', !!dbSummary, '), skipping auto-sync');
              return;
            }

            const savedTemplate = sessionStorage.getItem('selectedTemplate') || parsedCV?.personalInfo?.templateSlug || 'simple-professional';
            const fullName = parsedCV.personalInfo?.fullName || parsedCV.personalInfo?.name || 'My CV';
            const enData = parsedCV;
            const arData = arabicCvDataRef.current;

            const syncPayload: any = {
              title: `${fullName}'s CV`,
              templateId: savedTemplate,
              personalInfo: enData.personalInfo || {},
              summary: enData.professionalSummary || '',
              professionalSummary: enData.professionalSummary || '',
              experience: enData.experience || [],
              education: enData.education || [],
              skills: enData.skills || { technical: [], soft: [], tools: [] },
              certifications: enData.certifications || [],
              languages: enData.languages || [],
              language: 'en',
              textDirection: 'ltr',
            };
            if (arData) {
              syncPayload.contentAr = {
                personalInfo: arData.personalInfo || {},
                professionalSummary: arData.professionalSummary || '',
                experience: arData.experience || [],
                education: arData.education || [],
                skills: arData.skills || { technical: [], soft: [], tools: [] },
                certifications: arData.certifications || [],
                languages: arData.languages || [],
              };
            }
            console.log('[CV Edit] DB content is empty, auto-syncing sessionStorage data for CV', storedCvId);
            const saveRes = await fetch(`/api/cv/${storedCvId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(syncPayload),
            });
            if (saveRes.ok) console.log('[CV Edit] Auto-sync to DB succeeded');
            else console.error('[CV Edit] Auto-sync to DB failed:', saveRes.status);
          }).catch(err => console.error('[CV Edit] Auto-sync check error:', err));
        }
      } else {
        setCvData({
          personalInfo: {
            fullName: user.fullName || '',
            email: user.email || '',
            phone: user.phoneNumber || '',
            location: (user as any).location || '',
            nationality: (user as any).nationality || '',
            linkedin: (user as any).linkedin || '',
            targetJobDomain: (user as any).targetJobDomain || '',
          },
          professionalSummary: '',
          experience: [{
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            location: '',
            responsibilities: [''],
          }],
          education: [{
            institution: '',
            degree: '',
            startDate: '',
            endDate: '',
            location: '',
            gpa: '',
            achievements: [],
          }],
          skills: {
            technical: [],
            soft: [],
            tools: [],
          },
          certifications: [],
          languages: [{
            name: language === 'ar' ? 'العربية' : 'English',
            proficiency: language === 'ar' ? 'لغة أم' : 'Native'
          }],
        });
      }
    }
  }, [user, authLoading, router, language, token]);

  // Convert JOB_DOMAINS to SmartSearchDropdown format
  const jobDomainOptions = JOB_DOMAINS.map(domain => ({
    value: domain.id,
    labelEn: domain.nameEn,
    labelAr: domain.nameAr,
    keywords: domain.keywords
  }));

  // Helper to get job domain display name
  const getJobDomainDisplayName = (domainId: string) => {
    const domain = JOB_DOMAINS.find(d => d.id === domainId);
    if (domain) {
      return isRTL ? domain.nameAr : domain.nameEn;
    }
    return domainId; // Return as-is if custom value
  };

  const handleGenerateSummary = async () => {
    if (!token) return;
    setGeneratingSection('summary');
    try {
      const response = await axios.post(
        '/api/cv/ai/summary',
        { language },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCvData(prev => ({
        ...prev,
        professionalSummary: response.data.summary
      }));
      // Auto-save after AI generation
      setTimeout(() => saveSectionData('summary'), 100);
    } catch (error) {
      console.error('Failed to generate summary:', error);
      alert(isRTL ? 'فشل إنشاء الملخص' : 'Failed to generate summary');
    } finally {
      setGeneratingSection(null);
    }
  };

  const handleGenerateSkills = async () => {
    if (!token) return;
    setGeneratingSection('skills');
    try {
      const experienceDescriptions = cvData.experience
        .map(exp => [
          ...(Array.isArray(exp.responsibilities) ? exp.responsibilities : []),
          exp.description || '',
        ].filter(Boolean).join('. '))
        .filter(Boolean);
      const response = await axios.post(
        '/api/cv/ai/skills',
        { language, experienceDescriptions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCvData(prev => ({
        ...prev,
        skills: response.data.skills
      }));
      setTimeout(() => saveSectionData('skills'), 100);
    } catch (error) {
      console.error('Failed to generate skills:', error);
      alert(isRTL ? 'فشل إنشاء المهارات' : 'Failed to generate skills');
    } finally {
      setGeneratingSection(null);
    }
  };

  const handleGenerateEduDescription = async (index: number) => {
    if (!token) return;
    const edu = cvData.education[index];
    setGeneratingSection(`edu-desc-${index}`);
    try {
      const res = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: 'education',
          institution: edu.institution,
          degree: edu.degree,
          field: edu.field || edu.degree,
          language,
          regenerate: false,
          bilingual: true,
        }),
      });
      if (!res.ok) throw new Error('AI generation failed');
      const data = await res.json();
      if (data.description) {
        const updated = [...cvData.education];
        updated[index] = { ...updated[index], description: data.description };
        setCvData(prev => ({ ...prev, education: updated }));
        setTimeout(() => saveSectionData('education'), 100);
      }
    } catch (error) {
      console.error('Failed to generate education description:', error);
      alert(isRTL ? 'فشل إنشاء وصف التعليم' : 'Failed to generate education description');
    } finally {
      setGeneratingSection(null);
    }
  };

  const handleGenerateResponsibilities = async (index: number) => {
    if (!token) return;
    const exp = cvData.experience[index];
    if (!exp.position || !exp.company) {
      alert(isRTL ? 'يرجى إدخال المسمى الوظيفي واسم الشركة أولاً' : 'Please enter job title and company first');
      return;
    }

    setGeneratingSection(`exp-${index}`);
    try {
      const response = await axios.post(
        '/api/cv/ai/responsibilities',
        {
          jobTitle: exp.position,
          company: exp.company,
          language,
          minBulletPoints: 3,
          maxBulletPoints: 15
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const updatedExperience = [...cvData.experience];
      // Ensure min 3 and max 15 bullet points
      const responsibilities = response.data.responsibilities.slice(0, 15);
      if (responsibilities.length < 3 && responsibilities.length > 0) {
        // If less than 3, pad with empty strings for user to fill
        while (responsibilities.length < 3) {
          responsibilities.push('');
        }
      }
      updatedExperience[index].responsibilities = responsibilities;
      setCvData(prev => ({
        ...prev,
        experience: updatedExperience
      }));
      // Auto-save after AI generation
      setTimeout(() => saveSectionData('experience'), 100);
    } catch (error) {
      console.error('Failed to generate responsibilities:', error);
      alert(isRTL ? 'فشل إنشاء المسؤوليات' : 'Failed to generate responsibilities');
    } finally {
      setGeneratingSection(null);
    }
  };

  const updatePersonalInfo = (field: string, value: string) => {
    markSectionEditing('personalInfo');
    setCvData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const addExperience = () => {
    setCvData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        location: '',
        responsibilities: ['']
      }]
    }));
  };

  const removeExperience = (index: number) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const updateExperience = (index: number, field: string, value: string) => {
    markSectionEditing('experience');
    const updated = [...cvData.experience];
    (updated[index] as any)[field] = value;
    setCvData(prev => ({ ...prev, experience: updated }));
  };

  const updateResponsibility = (expIndex: number, respIndex: number, value: string) => {
    markSectionEditing('experience');
    const updated = [...cvData.experience];
    updated[expIndex].responsibilities[respIndex] = value;
    setCvData(prev => ({ ...prev, experience: updated }));
  };

  const addResponsibility = (expIndex: number) => {
    const updated = [...cvData.experience];
    const currentCount = updated[expIndex].responsibilities.length;
    
    // Enforce max 15
    if (currentCount >= 15) {
      alert(isRTL ? 'الحد الأقصى هو 15 نقطة رئيسية' : 'Maximum 15 key responsibilities allowed');
      return;
    }
    
    updated[expIndex].responsibilities.push('');
    setCvData(prev => ({ ...prev, experience: updated }));
  };

  const removeResponsibility = (expIndex: number, respIndex: number) => {
    const updated = [...cvData.experience];
    updated[expIndex].responsibilities = updated[expIndex].responsibilities.filter((_, i) => i !== respIndex);
    setCvData(prev => ({ ...prev, experience: updated }));
  };

  const addEducation = () => {
    setCvData(prev => ({
      ...prev,
      education: [...prev.education, {
        institution: '',
        degree: '',
        startDate: '',
        endDate: '',
        location: '',
        gpa: '',
        achievements: []
      }]
    }));
  };

  const removeEducation = (index: number) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const updateEducation = (index: number, field: string, value: string) => {
    markSectionEditing('education');
    const updated = [...cvData.education];
    (updated[index] as any)[field] = value;
    setCvData(prev => ({ ...prev, education: updated }));
  };

  const addSkill = (category: 'technical' | 'soft' | 'tools') => {
    const skill = prompt(isRTL ? 'أدخل المهارة:' : 'Enter skill:');
    if (skill && skill.trim()) {
      markSectionEditing('skills');
      setCvData(prev => ({
        ...prev,
        skills: {
          ...prev.skills,
          [category]: [...prev.skills[category], skill.trim()]
        }
      }));
    }
  };

  const removeSkill = (category: 'technical' | 'soft' | 'tools', index: number) => {
    markSectionEditing('skills');
    setCvData(prev => ({
      ...prev,
      skills: {
        ...prev.skills,
        [category]: prev.skills[category].filter((_, i) => i !== index)
      }
    }));
  };

  // Certification handlers
  const addCertification = () => {
    setCvData(prev => ({
      ...prev,
      certifications: [...prev.certifications, {
        name: '',
        issuer: '',
        date: '',
        credentialId: ''
      }]
    }));
  };

  const removeCertification = (index: number) => {
    setCvData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const updateCertification = (index: number, field: string, value: string) => {
    markSectionEditing('certifications');
    const updated = [...cvData.certifications];
    (updated[index] as any)[field] = value;
    setCvData(prev => ({ ...prev, certifications: updated }));
  };

  // Language handlers
  const addLanguage = () => {
    setCvData(prev => ({
      ...prev,
      languages: [...prev.languages, {
        name: '',
        proficiency: ''
      }]
    }));
  };

  const removeLanguage = (index: number) => {
    setCvData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
  };

  const updateLanguage = (index: number, field: string, value: string) => {
    markSectionEditing('languages');
    const updated = [...cvData.languages];
    (updated[index] as any)[field] = value;
    setCvData(prev => ({ ...prev, languages: updated }));
  };

  // Enforce responsibility limits (min 3, max 15)
  const enforceResponsibilityLimits = (expIndex: number) => {
    const updated = [...cvData.experience];
    const currentResp = updated[expIndex].responsibilities.filter(r => r.trim() !== '');
    
    // Enforce max 15
    if (currentResp.length > 15) {
      updated[expIndex].responsibilities = currentResp.slice(0, 15);
      alert(isRTL ? 'الحد الأقصى هو 15 نقطة رئيسية' : 'Maximum 15 key responsibilities allowed');
      setCvData(prev => ({ ...prev, experience: updated }));
      return false;
    }
    
    return true;
  };

  const handleDirectDownload = async () => {
    if (!token) {
      alert(isRTL ? 'يرجى تسجيل الدخول للتحميل' : 'Please log in to download');
      return;
    }

    // Normalize LinkedIn URL
    let normalizedCvData = { ...cvData };
    if (cvData.personalInfo.linkedin) {
      const result = normalizeLinkedInUrl(cvData.personalInfo.linkedin);
      if (!result.isValid) {
        alert(isRTL 
          ? 'يرجى إدخال رابط LinkedIn صالح'
          : 'Please enter a valid LinkedIn URL'
        );
        return;
      }
      normalizedCvData = {
        ...cvData,
        personalInfo: {
          ...cvData.personalInfo,
          linkedin: result.normalized
        }
      };
      setCvData(normalizedCvData);
    }

    setDownloading(true);
    setSaving(true);

    try {
      // Save CV first
      let savedCvId = editingCvId;
      const savedTemplate = templateVariant || 'simple-professional';

      if (!savedCvId) {
        const saveResponse = await axios.post(
          '/api/cv/save',
          {
            title: `${normalizedCvData.personalInfo.fullName || 'My'}'s CV`,
            templateId: savedTemplate,
            content: normalizedCvData,
            language: language
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // API returns { cvId: number, success: boolean }
        savedCvId = saveResponse.data?.cvId || saveResponse.data?.id;
        if (!savedCvId) {
          console.error('Save response:', saveResponse.data);
          throw new Error('Failed to get CV ID from save response. Response: ' + JSON.stringify(saveResponse.data));
        }
        setEditingCvId(savedCvId);
      } else {
        await axios.put(
          `/api/cv/${savedCvId}`,
          {
            title: `${normalizedCvData.personalInfo.fullName || 'My'}'s CV`,
            templateId: savedTemplate,
            personalInfo: normalizedCvData.personalInfo,
            summary: normalizedCvData.professionalSummary,
            experience: normalizedCvData.experience,
            education: normalizedCvData.education,
            skills: normalizedCvData.skills,
            certifications: normalizedCvData.certifications,
            languages: normalizedCvData.languages,
            language: language
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Generate PDF via API
      const templateMap: Record<string, string> = {
        'simple-professional': 'simple-professional',
        'minimalist-clean': 'minimalist-clean',
        'ats': 'classic-ats',
      };
      
      if (!savedCvId) {
        throw new Error('CV ID is required for PDF export');
      }

      const apiTemplate = templateMap[savedTemplate] || 'classic-ats';
      const params = new URLSearchParams({
        template: apiTemplate,
        color: primaryColor.replace('#', ''),
      });

      const pdfResponse = await fetch(`/api/cv/${savedCvId}/export-pdf?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!pdfResponse.ok) {
        const errorText = await pdfResponse.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Failed to generate PDF' };
        }
        console.error('PDF export error:', errorData);
        throw new Error(errorData.error || `Failed to generate PDF (${pdfResponse.status})`);
      }

      const blob = await pdfResponse.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${normalizedCvData.personalInfo.fullName || 'CV'}_${savedTemplate}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Download error:', error);
      alert(isRTL ? 'فشل التحميل. يرجى المحاولة مرة أخرى.' : 'Download failed. Please try again.');
    } finally {
      setDownloading(false);
      setSaving(false);
    }
  };

  const handleSaveAndContinue = async () => {
    if (!token) return;
    
    // Normalize and validate LinkedIn URL before saving
    let normalizedCvData = { ...cvData };
    if (cvData.personalInfo.linkedin) {
      const result = normalizeLinkedInUrl(cvData.personalInfo.linkedin);
      if (!result.isValid) {
        alert(isRTL 
          ? 'يرجى إدخال رابط LinkedIn صالح بتنسيق: https://www.linkedin.com/in/your-profile'
          : 'Please enter a valid LinkedIn URL in the format: https://www.linkedin.com/in/your-profile'
        );
        // Focus the LinkedIn field to help user fix it
        const linkedinInput = document.querySelector('input[type="url"][placeholder*="linkedin"]') as HTMLInputElement;
        if (linkedinInput) {
          linkedinInput.focus();
          linkedinInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return; // Block save
      }
      // Update to normalized value before saving (handles save-without-blur case)
      normalizedCvData = {
        ...cvData,
        personalInfo: {
          ...cvData.personalInfo,
          linkedin: result.normalized
        }
      };
      // Also update local state to show normalized value
      setCvData(normalizedCvData);
    }
    
    setSaving(true);
    
    try {
      // Save CV data to backend with normalized LinkedIn URL
      const savedTemplate = templateVariant || sessionStorage.getItem('selectedTemplate') || 'simple-professional';
      
      // Check if we're updating an existing CV or creating a new one
      if (editingCvId) {
        // Update existing CV
        await axios.put(
          `/api/cv/${editingCvId}`,
          {
            title: `${normalizedCvData.personalInfo.fullName}'s CV`,
            templateId: savedTemplate,
            personalInfo: normalizedCvData.personalInfo,
            summary: normalizedCvData.professionalSummary,
            experience: normalizedCvData.experience,
            education: normalizedCvData.education,
            skills: normalizedCvData.skills,
            certifications: normalizedCvData.certifications,
            languages: normalizedCvData.languages,
            language: language
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new CV
        await axios.post(
          '/api/cv/save',
          {
            title: `${normalizedCvData.personalInfo.fullName}'s CV`,
            templateId: savedTemplate,
            content: normalizedCvData,
            language: language
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      // Also save to sessionStorage for next step
      sessionStorage.setItem('generatedCV', JSON.stringify(normalizedCvData));
      
      // Check for profile differences before navigating
      if (user) {
        const syncKey = `syncDismissed_${editingCvId || 'new'}`;
        const alreadyDismissed = sessionStorage.getItem(syncKey);
        
        if (!alreadyDismissed) {
          const differences = detectProfileDifferences(normalizedCvData.personalInfo, user);
          
          if (differences.length > 0) {
            setProfileDifferences(differences);
            setPendingNavigation('/cv/design');
            setShowSyncModal(true);
            setSaving(false);
            return;
          }
        }
      }
      
      // Navigate to next step
      router.push('/cv/design');
    } catch (error) {
      console.error('Failed to save CV:', error);
      alert(isRTL ? 'فشل حفظ السيرة الذاتية' : 'Failed to save CV');
    } finally {
      setSaving(false);
    }
  };
  
  const handleSyncModalClose = () => {
    setShowSyncModal(false);
    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    }
  };
  
  const handleSyncComplete = () => {
    setShowSyncModal(false);
    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  // Show loading state until hydrated (prevents hydration mismatch)
  if (!isHydrated || authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <SyncProfileModal
        isOpen={showSyncModal}
        onClose={handleSyncModalClose}
        differences={profileDifferences}
        cvId={editingCvId || 'new'}
        onSyncComplete={handleSyncComplete}
      />
      {/* Simple Header - Back and Dashboard */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/cvs')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
            >
              <FiArrowLeft className={`w-5 h-5 group-hover:${isRTL ? 'translate-x-1' : '-translate-x-1'} transition-transform`} />
              <span className="font-medium">{isRTL ? 'العودة للسير الذاتية' : 'Back to CVs'}</span>
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <FiHome className="w-4 h-4" />
              <span className="text-sm">{isRTL ? 'لوحة التحكم' : 'Dashboard'}</span>
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TOP: SECTION CHECKLIST - Horizontal */}
        <div className="mb-6">
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-navy-800 text-sm whitespace-nowrap">
                  {isRTL ? 'قائمة الأقسام المطلوبة' : 'Required Sections Checklist'}
                </h3>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  ({cvValidation.validation.completedSections} of {cvValidation.validation.totalSections} complete)
                </span>
              </div>
              <div className="flex-1 min-w-[200px] h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-turquoise-500 to-turquoise-600 transition-all duration-500"
                  style={{ width: `${(cvValidation.validation.completedSections / cvValidation.validation.totalSections) * 100}%` }}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {cvValidation.validation.sections.map((section) => {
                  const icon = section.id === 'personalInfo' ? '👤' :
                              section.id === 'summary' ? '📝' :
                              section.id === 'education' ? '🎓' :
                              section.id === 'experience' ? '💼' :
                              section.id === 'certifications' ? '📜' :
                              section.id === 'skills' ? '⚡' :
                              section.id === 'languages' ? '🌐' : '📋';
                  const isActive = currentSection === section.id;
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => handleSectionClick(section.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                        isActive 
                          ? 'bg-turquoise-100 text-turquoise-700 border-2 border-turquoise-300' 
                          : section.isComplete
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      <span>{icon}</span>
                      <span>{isRTL ? section.nameAr : section.name}</span>
                      {section.isComplete ? (
                        <FiCheck className="w-3 h-3" />
                      ) : (
                        <span className="text-[10px]">({section.errors.length})</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* Template & Color Selection */}
        <div className="mb-6">
          <Card className="p-4">
            <div className="flex flex-wrap items-start gap-6">
              {/* Template Selection */}
              <div className="flex-1 min-w-[300px]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-900">
                    {isRTL ? 'القالب' : 'Template'}
                  </h3>
                  <button
                    onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {showTemplateSelector 
                      ? (isRTL ? 'إخفاء' : 'Hide') 
                      : (isRTL ? 'تغيير القالب' : 'Change Template')}
                  </button>
                </div>
                
                {!showTemplateSelector ? (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: primaryColor }} />
                    <div>
                      <div className="font-semibold text-sm text-gray-900">
                        {(() => { const t = ALL_TEMPLATES.find(t => t.id === templateVariant); return isRTL ? t?.nameAr : t?.name; })() || templateVariant}
                      </div>
                      <div className="text-xs text-gray-500">
                        {ALL_TEMPLATES.find(t => t.id === templateVariant)?.category === 'free' 
                          ? (isRTL ? 'مجاني' : 'Free') 
                          : (isRTL ? 'مميز' : 'Premium')}
                      </div>
                    </div>
                    <FiCheck className="w-4 h-4 text-blue-600 ml-auto" />
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-1">
                    {ALL_TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => {
                          setTemplateVariant(template.id);
                          setSelectedTemplate(template.id);
                          setPrimaryColor(template.defaultColor);
                          setShowTemplateSelector(false);
                        }}
                        className={`p-2.5 rounded-lg border-2 transition-all text-left relative ${
                          templateVariant === template.id
                            ? 'border-blue-600 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start gap-1.5">
                          <div 
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
                            style={{ backgroundColor: template.defaultColor }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-xs text-gray-900 leading-tight">
                              {isRTL ? template.nameAr : template.name}
                            </div>
                            {template.category === 'premium' && (
                              <div className="flex items-center gap-0.5 mt-0.5">
                                <FiLock className="w-2.5 h-2.5 text-amber-500" />
                                <span className="text-[10px] text-amber-600">{isRTL ? 'مميز' : 'Premium'}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {templateVariant === template.id && (
                          <div className="absolute top-1.5 right-1.5">
                            <FiCheck className="w-3.5 h-3.5 text-blue-600" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Color Selection */}
              <div className="flex-1 min-w-[300px]">
                <h3 className="text-sm font-bold text-gray-900 mb-3">
                  {isRTL ? 'اختر اللون الأساسي' : 'Primary Color'}
                </h3>
                <div className="flex items-center gap-3">
                  <div className="grid grid-cols-6 gap-2 flex-1">
                    {[
                      '#333333', '#2563eb', '#7c3aed', '#dc2626', 
                      '#059669', '#ea580c', '#0891b2', '#be185d',
                      '#1e40af', '#7e22ce', '#b91c1c', '#047857'
                    ].map((color) => (
                      <button
                        key={color}
                        onClick={() => setPrimaryColor(color)}
                        className={`w-10 h-10 rounded-lg border-2 transition-all ${
                          primaryColor === color 
                            ? 'border-gray-900 scale-110 shadow-md' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-16 h-10 rounded-lg cursor-pointer border border-gray-300"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
          
          {/* LEFT SIDE: EDITING FORM */}
          <div className="lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] flex flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden lg:pr-2">
              <div className="space-y-6 pb-24 lg:pb-4 relative">
            {translating && (
              <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-start justify-center pt-32 rounded-lg">
                <div className="flex flex-col items-center gap-3 text-center">
                  <FiLoader className="w-8 h-8 text-blue-600 animate-spin" />
                  <p className="text-sm font-medium text-gray-700">
                    {isRTL ? 'جاري ترجمة المحتوى...' : 'Translating content...'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isRTL ? 'يرجى الانتظار بينما يتم ترجمة جميع الحقول' : 'Please wait while all fields are being translated'}
                  </p>
                </div>
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {isRTL ? 'قم بتحرير محتوى سيرتك الذاتية' : 'Edit Your CV Content'}
                </h1>
              </div>
              <p className="text-gray-600 mb-3">
                {isRTL ? 'أضف أو عدّل المعلومات. التحديثات تظهر مباشرة في المعاينة.' : 'Add or edit information. Updates appear instantly in the preview.'}
              </p>
              <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                <FiGlobe className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 flex-1">
                  {isRTL ? 'لغة محتوى السيرة الذاتية:' : 'CV Content Language:'}
                </span>
                <div className="flex items-center bg-white rounded-lg border border-blue-200 overflow-hidden shadow-sm">
                  <button
                    onClick={() => { switchCvContentLanguage('en'); setLanguage('en'); }}
                    disabled={translating}
                    className={`px-4 py-2 text-sm font-semibold transition-all ${
                      cvContentLang === 'en'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    } disabled:opacity-60`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => { switchCvContentLanguage('ar'); setLanguage('ar'); }}
                    disabled={translating}
                    className={`px-4 py-2 text-sm font-semibold transition-all ${
                      cvContentLang === 'ar'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    } disabled:opacity-60`}
                  >
                    عربي
                  </button>
                </div>
                {translating && (
                  <FiLoader className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0" />
                )}
              </div>
              {translationError && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
                  <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{translationError}</span>
                  <button onClick={() => setTranslationError(null)} className="ml-auto text-red-400 hover:text-red-600 font-bold">✕</button>
                </div>
              )}
            </div>

            {/* Personal Information */}
            <div ref={(el) => { sectionRefs.current['personalInfo'] = el; }} id="section-personalInfo">
              <Card className={`p-6 ${currentSection === 'personalInfo' ? 'ring-2 ring-turquoise-500' : ''}`}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-lg">👤</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {isRTL ? 'المعلومات الشخصية' : 'Personal Information'}
                  </h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isRTL ? 'الاسم الكامل' : 'Full Name'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={cvData.personalInfo.fullName || ''}
                      onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                      onBlur={() => markFieldTouched('name')}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${getFieldBorderClass(!!getFieldValidation('name').hasError, isFieldTouched('name'))}`}
                    />
                    {getFieldValidation('name').hasError && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <FiAlertCircle className="w-3 h-3" />
                        {isRTL ? getFieldValidation('name').error?.messageAr : getFieldValidation('name').error?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isRTL ? 'البريد الإلكتروني' : 'Email'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={cvData.personalInfo.email || ''}
                      onChange={(e) => updatePersonalInfo('email', e.target.value)}
                      onBlur={() => markFieldTouched('email')}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${getFieldBorderClass(!!getFieldValidation('email').hasError, isFieldTouched('email'))}`}
                    />
                    {getFieldValidation('email').hasError && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <FiAlertCircle className="w-3 h-3" />
                        {isRTL ? getFieldValidation('email').error?.messageAr : getFieldValidation('email').error?.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isRTL ? 'رقم الهاتف' : 'Phone'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={cvData.personalInfo.phone || ''}
                      onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                      onBlur={() => markFieldTouched('phone')}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${getFieldBorderClass(!!getFieldValidation('phone').hasError, isFieldTouched('phone'))}`}
                    />
                    {getFieldValidation('phone').hasError && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <FiAlertCircle className="w-3 h-3" />
                        {isRTL ? getFieldValidation('phone').error?.messageAr : getFieldValidation('phone').error?.message}
                      </p>
                    )}
                  </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isRTL ? 'الموقع' : 'Location'}
                  </label>
                  <input
                    type="text"
                    value={cvData.personalInfo.location || ''}
                    onChange={(e) => updatePersonalInfo('location', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={isRTL ? 'مثال: الرياض، المملكة العربية السعودية' : 'e.g., Riyadh, Saudi Arabia'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isRTL ? 'الجنسية' : 'Nationality'}
                  </label>
                  <input
                    type="text"
                    value={cvData.personalInfo.nationality || ''}
                    onChange={(e) => updatePersonalInfo('nationality', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={isRTL ? 'مثال: سعودي' : 'e.g., Saudi'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isRTL ? 'المسمى الوظيفي' : 'Job Title'}
                  </label>
                  <input
                    type="text"
                    value={cvData.personalInfo.targetJobTitle || ''}
                    onChange={(e) => updatePersonalInfo('targetJobTitle', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder={isRTL ? 'مثال: مطور برمجيات' : 'e.g., Software Developer'}
                  />
                </div>
                {/* Target Job Domain - SmartSearchDropdown */}
                <div>
                  <SmartSearchDropdown
                    options={jobDomainOptions}
                    value={cvData.personalInfo.targetJobDomain || ''}
                    onChange={(value) => setCvData(prev => ({
                      ...prev,
                      personalInfo: {
                        ...prev.personalInfo,
                        targetJobDomain: value
                      }
                    }))}
                    label="Job Domain"
                    labelAr="المجال الوظيفي"
                    placeholder="Search job domains..."
                    placeholderAr="ابحث عن مجال وظيفي..."
                    required={true}
                    allowCustom={true}
                    customPlaceholder="Add custom domain"
                    customPlaceholderAr="إضافة مجال مخصص"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {isRTL ? 'اختر المجال الوظيفي الواسع (مثل: الموارد البشرية، التسويق، الهندسة)' : 'Select broad job domain (e.g., Human Resources, Marketing, Engineering)'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isRTL ? 'رابط LinkedIn' : 'LinkedIn Profile URL'}
                  </label>
                  <input
                    type="url"
                    value={cvData.personalInfo.linkedin || ''}
                    onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                    onBlur={(e) => {
                      const result = normalizeLinkedInUrl(e.target.value);
                      if (result.isValid && result.normalized !== e.target.value) {
                        updatePersonalInfo('linkedin', result.normalized);
                      }
                    }}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://www.linkedin.com/in/your-profile"
                  />
                  {cvData.personalInfo.linkedin && !cvData.personalInfo.linkedin.toLowerCase().startsWith('https://www.linkedin.com/') && (
                    <p className="text-xs text-red-500 mt-1">
                      {isRTL ? 'يجب أن يبدأ الرابط بـ https://www.linkedin.com/in/your-profile' : 'URL must start with https://www.linkedin.com/in/your-profile'}
                    </p>
                  )}
                  {!cvData.personalInfo.linkedin && (
                    <p className="text-xs text-gray-500 mt-1">
                      {isRTL ? 'سيتم تنسيق الرابط تلقائيًا كـ https://www.linkedin.com/...' : 'We\'ll format your URL as https://www.linkedin.com/...'}
                    </p>
                  )}
                </div>
                </div>
                
                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                  <SaveStatusIndicator sectionId="personalInfo" />
                  <Button
                    onClick={handleNextSection}
                    disabled={!cvValidation.getSectionValidation('personalInfo')?.isComplete || sectionSaveStatus['personalInfo'] === 'saving'}
                    className="flex items-center gap-2 bg-gradient-to-r from-turquoise-500 to-turquoise-600 hover:from-turquoise-600 hover:to-turquoise-700"
                  >
                    {sectionSaveStatus['personalInfo'] === 'saving' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t.builder.saving}
                      </>
                    ) : (
                      <>
                        {t.builder.nextAndSave}
                        <FiArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Professional Summary */}
            <div ref={(el) => { sectionRefs.current['summary'] = el; }} id="section-summary">
              <Card className={`p-6 ${currentSection === 'summary' ? 'ring-2 ring-turquoise-500' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-purple-600 text-lg">✨</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {isRTL ? 'الملخص المهني' : 'Professional Summary'} <span className="text-red-500">*</span>
                    </h2>
                  </div>
                  <Button
                    onClick={handleGenerateSummary}
                    loading={generatingSection === 'summary'}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2"
                  >
                    <FiZap className="w-4 h-4" />
                    {isRTL ? 'إنشاء بالذكاء الاصطناعي' : 'AI Generate'}
                  </Button>
                </div>
                <textarea
                  value={cvData.professionalSummary || ''}
                  onChange={(e) => {
                    markSectionEditing('summary');
                    setCvData(prev => ({ ...prev, professionalSummary: e.target.value }));
                  }}
                  onBlur={() => markFieldTouched('summary')}
                  rows={4}
                  placeholder={isRTL ? 'اكتب ملخصًا مهنيًا مقنعًا...' : 'Write a compelling professional summary...'}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${getFieldBorderClass(!!getFieldValidation('summary').hasError, isFieldTouched('summary'))}`}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    {isRTL ? '2-3 جمل توضح خبرتك ومهاراتك الأساسية (50 حرفًا على الأقل)' : '2-3 sentences highlighting your experience and key skills (min 50 chars)'}
                  </p>
                  <span className={`text-xs ${cvData.professionalSummary.length >= 50 ? 'text-green-600' : 'text-gray-400'}`}>
                    {cvData.professionalSummary.length}/50+
                  </span>
                </div>
                {getFieldValidation('summary').hasError && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <FiAlertCircle className="w-3 h-3" />
                    {isRTL ? getFieldValidation('summary').error?.messageAr : getFieldValidation('summary').error?.message}
                  </p>
                )}
                
                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handlePrevSection}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <FiArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                      {isRTL ? 'السابق' : 'Previous'}
                    </Button>
                    <SaveStatusIndicator sectionId="summary" />
                  </div>
                  <Button
                    onClick={handleNextSection}
                    disabled={!cvValidation.getSectionValidation('summary')?.isComplete || sectionSaveStatus['summary'] === 'saving'}
                    className="flex items-center gap-2 bg-gradient-to-r from-turquoise-500 to-turquoise-600 hover:from-turquoise-600 hover:to-turquoise-700"
                  >
                    {sectionSaveStatus['summary'] === 'saving' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t.builder.saving}
                      </>
                    ) : (
                      <>
                        {t.builder.nextAndSave}
                        <FiArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Experience Section */}
            <div ref={(el) => { sectionRefs.current['experience'] = el; }} id="section-experience">
              <Card className={`p-6 ${currentSection === 'experience' ? 'ring-2 ring-turquoise-500' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-green-600 text-lg">💼</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {isRTL ? 'الخبرة المهنية' : 'Professional Experience'} <span className="text-red-500">*</span>
                    </h2>
                  </div>
                  <Button onClick={addExperience} className="flex items-center gap-2">
                    <FiPlus className="w-4 h-4" />
                    {isRTL ? 'إضافة خبرة' : 'Add Experience'}
                  </Button>
                </div>

              <div className="space-y-6">
                {cvData.experience.map((exp, index) => (
                  <div key={index} className="border-2 border-gray-200 rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900">
                        {isRTL ? `الخبرة ${index + 1}` : `Experience ${index + 1}`}
                      </h3>
                      {cvData.experience.length > 1 && (
                        <button
                          onClick={() => removeExperience(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {isRTL ? 'المسمى الوظيفي' : 'Job Title'}
                        </label>
                        <input
                          type="text"
                          value={exp.position || ''}
                          onChange={(e) => updateExperience(index, 'position', e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {isRTL ? 'الشركة' : 'Company'}
                        </label>
                        <input
                          type="text"
                          value={exp.company || ''}
                          onChange={(e) => updateExperience(index, 'company', e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {isRTL ? 'تاريخ البدء' : 'Start Date'}
                        </label>
                        <input
                          type="text"
                          value={exp.startDate || ''}
                          onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                          placeholder="Jan 2020"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {isRTL ? 'تاريخ الانتهاء' : 'End Date'}
                        </label>
                        <input
                          type="text"
                          value={exp.endDate || ''}
                          onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                          placeholder="Present"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {isRTL ? 'الموقع' : 'Location'}
                        </label>
                        <input
                          type="text"
                          value={exp.location || ''}
                          onChange={(e) => updateExperience(index, 'location', e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <label className="block text-sm font-medium text-gray-700">
                            {isRTL ? 'المسؤوليات الرئيسية' : 'Key Responsibilities'}
                          </label>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            exp.responsibilities.length >= 15 ? 'bg-red-100 text-red-700' :
                            exp.responsibilities.length >= 10 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {exp.responsibilities.length} / 15
                          </span>
                        </div>
                        <Button
                          onClick={() => handleGenerateResponsibilities(index)}
                          loading={generatingSection === `exp-${index}`}
                          size="sm"
                          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-3 py-1"
                        >
                          <FiZap className="w-3 h-3" />
                          {isRTL ? 'AI' : 'AI'}
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {exp.responsibilities.map((resp, respIndex) => (
                          <div key={respIndex} className="flex gap-2">
                            <span className="text-gray-500 mt-2">•</span>
                            <input
                              type="text"
                              value={resp || ''}
                              onChange={(e) => updateResponsibility(index, respIndex, e.target.value)}
                              placeholder={isRTL ? 'أضف نقطة رئيسية بأفعال قوية...' : 'Add bullet point with strong action verbs...'}
                              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            {exp.responsibilities.length > 1 && (
                              <button
                                onClick={() => removeResponsibility(index, respIndex)}
                                className="text-red-600 hover:text-red-800 px-2"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        {exp.responsibilities.length >= 15 && (
                          <p className="text-xs text-red-600 mt-2">
                            {isRTL ? 'وصلت إلى الحد الأقصى (15 نقطة)' : 'Maximum limit reached (15 bullet points)'}
                          </p>
                        )}
                        <Button
                          onClick={() => {
                            if (exp.responsibilities.length >= 15) {
                              alert(isRTL ? 
                                'لا يمكنك إضافة أكثر من 15 نقطة مسؤولية لكل وظيفة' : 
                                'You cannot add more than 15 responsibility points per job'
                              );
                              return;
                            }
                            addResponsibility(index);
                          }}
                          size="sm"
                          variant="outline"
                          className="w-full mt-2"
                          disabled={exp.responsibilities.length >= 15}
                        >
                          <FiPlus className="w-4 h-4 inline mr-2" />
                          {isRTL ? 'إضافة نقطة' : 'Add Bullet Point'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
                
                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handlePrevSection}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <FiArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                      {isRTL ? 'السابق' : 'Previous'}
                    </Button>
                    <SaveStatusIndicator sectionId="experience" />
                  </div>
                  <Button
                    onClick={handleNextSection}
                    disabled={!cvValidation.getSectionValidation('experience')?.isComplete || sectionSaveStatus['experience'] === 'saving'}
                    className="flex items-center gap-2 bg-gradient-to-r from-turquoise-500 to-turquoise-600 hover:from-turquoise-600 hover:to-turquoise-700"
                  >
                    {sectionSaveStatus['experience'] === 'saving' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t.builder.saving}
                      </>
                    ) : (
                      <>
                        {t.builder.nextAndSave}
                        <FiArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Education Section */}
            <div ref={(el) => { sectionRefs.current['education'] = el; }} id="section-education">
              <Card className={`p-6 ${currentSection === 'education' ? 'ring-2 ring-turquoise-500' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 text-lg">🎓</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {isRTL ? 'التعليم' : 'Education'} <span className="text-red-500">*</span>
                    </h2>
                  </div>
                  <Button onClick={addEducation} className="flex items-center gap-2">
                    <FiPlus className="w-4 h-4" />
                    {isRTL ? 'إضافة تعليم' : 'Add Education'}
                  </Button>
                </div>

              <div className="space-y-4">
                {cvData.education.map((edu, index) => (
                  <div key={index} className="border-2 border-gray-200 rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900">
                        {isRTL ? `التعليم ${index + 1}` : `Education ${index + 1}`}
                      </h3>
                      {cvData.education.length > 1 && (
                        <button
                          onClick={() => removeEducation(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {isRTL ? 'المؤسسة التعليمية' : 'Institution'}
                        </label>
                        <input
                          type="text"
                          value={edu.institution || ''}
                          onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {isRTL ? 'الدرجة العلمية' : 'Degree'}
                        </label>
                        <input
                          type="text"
                          value={edu.degree || ''}
                          onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {isRTL ? 'سنة البدء' : 'Start Year'}
                        </label>
                        <input
                          type="text"
                          value={edu.startDate || ''}
                          onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                          placeholder="2015"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {isRTL ? 'سنة التخرج' : 'End Year'}
                        </label>
                        <input
                          type="text"
                          value={edu.endDate || ''}
                          onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                          placeholder="2019"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {isRTL ? 'الموقع' : 'Location'}
                        </label>
                        <input
                          type="text"
                          value={edu.location || ''}
                          onChange={(e) => updateEducation(index, 'location', e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {isRTL ? 'المعدل التراكمي (اختياري)' : 'GPA (Optional)'}
                        </label>
                        <input
                          type="text"
                          value={edu.gpa || ''}
                          onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                          placeholder="3.8/4.0"
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Education Description */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-gray-700">
                          {isRTL ? 'ملخص التعليم (اختياري)' : 'Education Summary (Optional)'}
                        </label>
                        <Button
                          onClick={() => handleGenerateEduDescription(index)}
                          loading={generatingSection === `edu-desc-${index}`}
                          size="sm"
                          className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-1 text-xs"
                        >
                          <FiZap className="w-3 h-3" />
                          {isRTL ? 'توليد AI' : 'AI Generate'}
                        </Button>
                      </div>
                      <input
                        type="text"
                        value={edu.description || ''}
                        onChange={(e) => updateEducation(index, 'description', e.target.value)}
                        placeholder={isRTL ? 'مثال: بكالوريوس علوم الحاسب مع التركيز على تطوير البرمجيات' : 'e.g., Bachelor of Computer Science with focus on software engineering'}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        maxLength={120}
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        {isRTL ? 'جملة واحدة مختصرة (20 كلمة كحد أقصى) · تظهر في نموذج السيرة الذاتية' : 'One concise sentence (max 20 words) · appears in your CV template'}
                      </p>
                    </div>
                  </div>
                ))}
                </div>
                
                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handlePrevSection}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <FiArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                      {isRTL ? 'السابق' : 'Previous'}
                    </Button>
                    <SaveStatusIndicator sectionId="education" />
                  </div>
                  <Button
                    onClick={handleNextSection}
                    disabled={!cvValidation.getSectionValidation('education')?.isComplete || sectionSaveStatus['education'] === 'saving'}
                    className="flex items-center gap-2 bg-gradient-to-r from-turquoise-500 to-turquoise-600 hover:from-turquoise-600 hover:to-turquoise-700"
                  >
                    {sectionSaveStatus['education'] === 'saving' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t.builder.saving}
                      </>
                    ) : (
                      <>
                        {t.builder.nextAndSave}
                        <FiArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Skills Section */}
            <div ref={(el) => { sectionRefs.current['skills'] = el; }} id="section-skills">
              <Card className={`p-6 ${currentSection === 'skills' ? 'ring-2 ring-turquoise-500' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <span className="text-orange-600 text-lg">⚡</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {isRTL ? 'المهارات والكفاءات' : 'Skills & Competencies'} <span className="text-red-500">*</span>
                    </h2>
                  </div>
                  <Button
                    onClick={handleGenerateSkills}
                    loading={generatingSection === 'skills'}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2"
                  >
                    <FiZap className="w-4 h-4" />
                    {isRTL ? 'إنشاء بالذكاء الاصطناعي' : 'AI Generate'}
                  </Button>
                </div>

              <div className="space-y-4">
                {/* Technical Skills */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {isRTL ? 'المهارات التقنية' : 'Technical Skills'}
                    </label>
                    <Button
                      onClick={() => addSkill('technical')}
                      size="sm"
                      variant="outline"
                    >
                      <FiPlus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cvData.skills.technical.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill('technical', index)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {cvData.skills.technical.length === 0 && (
                      <p className="text-gray-400 text-sm">{isRTL ? 'لا توجد مهارات تقنية' : 'No technical skills'}</p>
                    )}
                  </div>
                </div>

                {/* Soft Skills */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {isRTL ? 'المهارات الشخصية' : 'Soft Skills'}
                    </label>
                    <Button
                      onClick={() => addSkill('soft')}
                      size="sm"
                      variant="outline"
                    >
                      <FiPlus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cvData.skills.soft.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill('soft', index)}
                          className="text-green-600 hover:text-green-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {cvData.skills.soft.length === 0 && (
                      <p className="text-gray-400 text-sm">{isRTL ? 'لا توجد مهارات شخصية' : 'No soft skills'}</p>
                    )}
                  </div>
                </div>

                {/* Tools & Software */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {isRTL ? 'الأدوات والبرامج' : 'Tools & Software'}
                    </label>
                    <Button
                      onClick={() => addSkill('tools')}
                      size="sm"
                      variant="outline"
                    >
                      <FiPlus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cvData.skills.tools.map((tool, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-2"
                      >
                        {tool}
                        <button
                          onClick={() => removeSkill('tools', index)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {cvData.skills.tools.length === 0 && (
                      <p className="text-gray-400 text-sm">{isRTL ? 'لا توجد أدوات' : 'No tools'}</p>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  {isRTL ? 'الحد الموصى به: 8-15 مهارة إجمالية' : 'Recommended: 8-15 skills total'}
                </p>
                </div>
                
                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handlePrevSection}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <FiArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                      {isRTL ? 'السابق' : 'Previous'}
                    </Button>
                    <SaveStatusIndicator sectionId="skills" />
                  </div>
                  <Button
                    onClick={handleNextSection}
                    disabled={!cvValidation.getSectionValidation('skills')?.isComplete || sectionSaveStatus['skills'] === 'saving'}
                    className="flex items-center gap-2 bg-gradient-to-r from-turquoise-500 to-turquoise-600 hover:from-turquoise-600 hover:to-turquoise-700"
                  >
                    {sectionSaveStatus['skills'] === 'saving' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t.builder.saving}
                      </>
                    ) : (
                      <>
                        {t.builder.nextAndSave}
                        <FiArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Certifications Section */}
            <div ref={(el) => { sectionRefs.current['certifications'] = el; }} id="section-certifications">
              <Card className={`p-6 ${currentSection === 'certifications' ? 'ring-2 ring-turquoise-500' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <span className="text-yellow-600 text-lg">🎓</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {isRTL ? 'الشهادات والتدريب' : 'Certifications & Training'} <span className="text-red-500">*</span>
                    </h2>
                  </div>
                  <Button
                    onClick={addCertification}
                    className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    {isRTL ? 'إضافة شهادة' : 'Add Certification'}
                  </Button>
                </div>

              <div className="space-y-4">
                {cvData.certifications.map((cert, index) => (
                  <div key={index} className="p-4 border-2 border-gray-200 rounded-lg relative">
                    <button
                      onClick={() => removeCertification(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {isRTL ? 'اسم الشهادة *' : 'Certification Name *'}
                        </label>
                        <input
                          type="text"
                          value={cert.name || ''}
                          onChange={(e) => updateCertification(index, 'name', e.target.value)}
                          placeholder={isRTL ? 'مثال: شهادة PMP' : 'e.g., PMP Certification'}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {isRTL ? 'الجهة المانحة' : 'Issuing Organization'}
                        </label>
                        <input
                          type="text"
                          value={cert.issuer || ''}
                          onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                          placeholder={isRTL ? 'مثال: PMI' : 'e.g., PMI'}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {isRTL ? 'تاريخ الحصول' : 'Date Obtained'}
                        </label>
                        <input
                          type="text"
                          value={cert.date || ''}
                          onChange={(e) => updateCertification(index, 'date', e.target.value)}
                          placeholder={isRTL ? 'مثال: يناير 2024' : 'e.g., January 2024'}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {isRTL ? 'رقم الشهادة (اختياري)' : 'Credential ID (Optional)'}
                        </label>
                        <input
                          type="text"
                          value={cert.credentialId || ''}
                          onChange={(e) => updateCertification(index, 'credentialId', e.target.value)}
                          placeholder={isRTL ? 'مثال: ABC123456' : 'e.g., ABC123456'}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {cvData.certifications.length === 0 && (
                  <p className="text-gray-400 text-center py-8">{isRTL ? 'لا توجد شهادات. انقر فوق "إضافة شهادة" للبدء.' : 'No certifications yet. Click "Add Certification" to get started.'}</p>
                )}
                </div>
                
                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handlePrevSection}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <FiArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                      {isRTL ? 'السابق' : 'Previous'}
                    </Button>
                    <SaveStatusIndicator sectionId="certifications" />
                  </div>
                  <Button
                    onClick={handleNextSection}
                    disabled={!cvValidation.getSectionValidation('certifications')?.isComplete || sectionSaveStatus['certifications'] === 'saving'}
                    className="flex items-center gap-2 bg-gradient-to-r from-turquoise-500 to-turquoise-600 hover:from-turquoise-600 hover:to-turquoise-700"
                  >
                    {sectionSaveStatus['certifications'] === 'saving' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t.builder.saving}
                      </>
                    ) : (
                      <>
                        {t.builder.nextAndSave}
                        <FiArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </div>

            {/* Languages Section */}
            <div ref={(el) => { sectionRefs.current['languages'] = el; }} id="section-languages">
              <Card className={`p-6 ${currentSection === 'languages' ? 'ring-2 ring-turquoise-500' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 text-lg">🌍</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {isRTL ? 'اللغات' : 'Languages'} <span className="text-red-500">*</span>
                    </h2>
                  </div>
                  <Button
                    onClick={addLanguage}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2"
                  >
                    <FiPlus className="w-4 h-4" />
                    {isRTL ? 'إضافة لغة' : 'Add Language'}
                  </Button>
                </div>

              <div className="space-y-4">
                {cvData.languages.map((lang, index) => (
                  <div key={index} className="p-4 border-2 border-gray-200 rounded-lg relative">
                    <button
                      onClick={() => removeLanguage(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {isRTL ? 'اللغة *' : 'Language *'}
                        </label>
                        <input
                          type="text"
                          value={lang.name || ''}
                          onChange={(e) => updateLanguage(index, 'name', e.target.value)}
                          placeholder={isRTL ? 'مثال: العربية' : 'e.g., English'}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {isRTL ? 'مستوى الإتقان *' : 'Proficiency Level *'}
                        </label>
                        <select
                          value={lang.proficiency || ''}
                          onChange={(e) => updateLanguage(index, 'proficiency', e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">{isRTL ? 'اختر المستوى' : 'Select Level'}</option>
                          <option value={isRTL ? 'لغة أم' : 'Native'}>{isRTL ? 'لغة أم' : 'Native'}</option>
                          <option value={isRTL ? 'طليق' : 'Fluent'}>{isRTL ? 'طليق' : 'Fluent'}</option>
                          <option value={isRTL ? 'متقدم' : 'Advanced'}>{isRTL ? 'متقدم' : 'Advanced'}</option>
                          <option value={isRTL ? 'متوسط' : 'Intermediate'}>{isRTL ? 'متوسط' : 'Intermediate'}</option>
                          <option value={isRTL ? 'مبتدئ' : 'Basic'}>{isRTL ? 'مبتدئ' : 'Basic'}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500 mt-4">
                {isRTL ? 'نصيحة: اذكر اللغات التي تتحدثها بطلاقة أو بمستوى متقدم' : 'Tip: List languages you speak fluently or at an advanced level'}
              </p>
                
                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handlePrevSection}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <FiArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                      {isRTL ? 'السابق' : 'Previous'}
                    </Button>
                    <SaveStatusIndicator sectionId="languages" />
                  </div>
                  <Button
                    onClick={async () => {
                      const validation = cvValidation.getSectionValidation('languages');
                      if (!validation?.isComplete) {
                        alert(isRTL ? 'يرجى إكمال جميع الحقول المطلوبة في هذا القسم' : 'Please complete all required fields in this section');
                        return;
                      }
                      await saveSectionData('languages');
                    }}
                    disabled={!cvValidation.getSectionValidation('languages')?.isComplete || sectionSaveStatus['languages'] === 'saving'}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    {sectionSaveStatus['languages'] === 'saving' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t.builder.saving}
                      </>
                    ) : (
                      <>
                        <FiCheck className="w-4 h-4" />
                        {isRTL ? 'حفظ وإنهاء' : 'Save & Finish'}
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </div>
            </div>
            </div>
            
            {/* Save and Continue Button - Desktop only (mobile uses fixed bottom bar) */}
            <div className="hidden lg:block sticky bottom-4 bg-white border-2 border-gray-200 rounded-lg p-4 shadow-lg mt-4 flex-shrink-0">
              {!cvValidation.canDownload && (
                <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-700 flex items-center gap-2">
                    <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>
                      {isRTL 
                        ? 'يرجى إكمال جميع الأقسام المطلوبة قبل المتابعة'
                        : 'Please complete all required sections before continuing'
                      }
                    </span>
                  </p>
                </div>
              )}
              <Button
                onClick={handleDirectDownload}
                loading={downloading || saving}
                disabled={false}
                className="w-full py-3 text-lg flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <FiDownload className="w-5 h-5" />
                {downloading || saving 
                  ? (isRTL ? 'جاري التحميل...' : 'Downloading...')
                  : (isRTL ? 'تحميل السيرة الذاتية' : 'Download CV')
                }
              </Button>
            </div>
          </div>

          {/* RIGHT SIDE: PREVIEW ONLY (hidden on mobile) */}
          <div className="hidden lg:block lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
            {/* Live Preview */}
            <Card className="p-2 h-full flex flex-col bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="flex items-center justify-between mb-2 flex-shrink-0 px-2">
                <div className="flex items-center gap-2">
                  <FiEye className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-900">
                    {isRTL ? 'معاينة القالب' : 'Template Preview'}
                  </h2>
                </div>
                <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full border border-gray-200">
                  {isRTL ? 'تحديث مباشر' : 'Live Update'}
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-auto rounded-lg shadow-xl bg-white relative">
                {cvData.personalInfo.fullName ? (
                  <div className="cv-preview-container" style={{ transform: 'scale(0.55)', transformOrigin: 'top center', width: '181.8%', marginLeft: '-40.9%' }}>
                    {(() => {
                      const TemplateComp = getTemplateComponent(templateVariant);
                      return (
                        <TemplateComp
                          data={{
                            personalInfo: {
                              ...cvData.personalInfo,
                              fullName: cvData.personalInfo.fullName || cvData.personalInfo.name || '',
                              name: cvData.personalInfo.fullName || cvData.personalInfo.name || '',
                            },
                            summary: cvData.professionalSummary || '',
                            professionalSummary: cvData.professionalSummary || '',
                            experience: (cvData.experience || []).map(exp => ({
                              ...exp,
                              description: exp.description || (Array.isArray(exp.responsibilities) ? exp.responsibilities.join(', ') : ''),
                            })),
                            education: (cvData.education || []).map(edu => ({
                              ...edu,
                              institution: edu.institution || edu.school || '',
                              school: edu.institution || edu.school || '',
                              field: edu.field || edu.fieldOfStudy || '',
                              fieldOfStudy: edu.field || edu.fieldOfStudy || '',
                            })),
                            skills: cvData.skills,
                            certifications: cvData.certifications,
                            languages: cvData.languages.map((l: any) =>
                              typeof l === 'string' ? { name: l, level: 'Fluent' } : { name: l.name || l.language || '', level: l.level || l.proficiency || 'Fluent' }
                            ),
                          }}
                          previewMode={true}
                          isArabic={cvContentLang === 'ar'}
                          settings={{
                            primaryColor: primaryColor || '#1e3a5f',
                            accentColor: primaryColor || '#2563eb',
                          }}
                        />
                      );
                    })()}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 min-h-[400px]">
                    <p>{isRTL ? 'أدخل بياناتك لمعاينة السيرة الذاتية' : 'Enter your data to preview CV'}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar: Preview + Download */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.1)]" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
        {!cvValidation.canDownload && (
          <div className="px-3 pt-2">
            <p className="text-xs text-amber-600 flex items-center gap-1.5 bg-amber-50 rounded-lg px-3 py-1.5 border border-amber-200">
              <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {isRTL ? 'أكمل الأقسام المطلوبة' : 'Complete required sections'}
            </p>
          </div>
        )}
        <div className="flex gap-2 p-3">
          <button
            onClick={() => setShowMobilePreview(true)}
            className="flex-1 py-3 border-2 border-blue-600 text-blue-600 rounded-brand font-semibold flex items-center justify-center gap-2 hover:bg-blue-50 transition-all min-h-[48px]"
          >
            <FiEye className="w-5 h-5" />
            {isRTL ? 'معاينة' : 'Preview'}
          </button>
          <Button
            onClick={handleDirectDownload}
            loading={downloading || saving}
            disabled={false}
            className="flex-1 py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 min-h-[48px]"
          >
            <FiDownload className="w-5 h-5" />
            {downloading || saving 
              ? (isRTL ? 'جاري...' : 'Loading...')
              : (isRTL ? 'تحميل' : 'Download')
            }
          </Button>
        </div>
      </div>

      {/* Mobile Preview Modal */}
      {showMobilePreview && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-2">
              <FiEye className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-gray-900">
                {isRTL ? 'معاينة السيرة الذاتية' : 'CV Preview'}
              </h3>
            </div>
            <button
              onClick={() => setShowMobilePreview(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-600 text-xl font-bold"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-auto bg-gray-100 p-2">
            {cvData.personalInfo.fullName ? (
              <div className="bg-white rounded-lg shadow-lg mx-auto" style={{ maxWidth: '800px' }}>
                <div style={{ transform: 'scale(0.5)', transformOrigin: 'top center', width: '200%', marginLeft: '-50%' }}>
                  {(() => {
                    const TemplateComp = getTemplateComponent(templateVariant);
                    return (
                      <TemplateComp
                        data={{
                          personalInfo: {
                            ...cvData.personalInfo,
                            fullName: cvData.personalInfo.fullName || cvData.personalInfo.name || '',
                            name: cvData.personalInfo.fullName || cvData.personalInfo.name || '',
                          },
                          summary: cvData.professionalSummary || '',
                          professionalSummary: cvData.professionalSummary || '',
                          experience: (cvData.experience || []).map(exp => ({
                            ...exp,
                            description: exp.description || (Array.isArray(exp.responsibilities) ? exp.responsibilities.join(', ') : ''),
                          })),
                          education: (cvData.education || []).map(edu => ({
                            ...edu,
                            institution: edu.institution || edu.school || '',
                            school: edu.institution || edu.school || '',
                            field: edu.field || edu.fieldOfStudy || '',
                            fieldOfStudy: edu.field || edu.fieldOfStudy || '',
                          })),
                          skills: cvData.skills,
                          certifications: cvData.certifications,
                          languages: cvData.languages.map((l: any) =>
                            typeof l === 'string' ? { name: l, level: 'Fluent' } : { name: l.name || l.language || '', level: l.level || l.proficiency || 'Fluent' }
                          ),
                        }}
                        previewMode={true}
                        isArabic={cvContentLang === 'ar'}
                        settings={{
                          primaryColor: primaryColor || '#1e3a5f',
                          accentColor: primaryColor || '#2563eb',
                        }}
                      />
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <p>{isRTL ? 'أدخل بياناتك لمعاينة السيرة الذاتية' : 'Enter your data to preview CV'}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CVEditPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CVEditPageContent />
    </Suspense>
  );

}