'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useCvData } from '@/lib/contexts/CvDataContext';
import SmartSearchDropdown from '@/components/ui/SmartSearchDropdown';
import { getPhoneValidationError, normalizeSaudiPhone } from '@/lib/utils/phoneValidation';
import AIGenerationModal from '@/components/cv/AIGenerationModal';
import SmartTemplateRecommendation from '@/components/cv/SmartTemplateRecommendation';
import { TEMPLATE_FAMILIES } from '@/config/templates';
import {
  FiUser, FiMail, FiPhone, FiMapPin,
  FiBriefcase, FiStar, FiZap, FiEdit3, FiLoader, FiCheck,
  FiGlobe, FiBookOpen, FiFileText, FiChevronRight, FiChevronLeft,
  FiPlus, FiTrash2, FiUsers, FiBook, FiClock, FiArrowRight,
  FiRefreshCw, FiAward, FiX, FiCamera
} from 'react-icons/fi';
import ProfilePhotoUpload from '@/components/ui/ProfilePhotoUpload';

type UserRole = 'student' | 'employer' | null;

interface LookupData {
  saudiCities: Array<{ id: number; nameEn: string; nameAr: string; region: string }>;
  jobDomains: Array<{ id: number; slug: string; nameEn: string; nameAr: string; keywords: any; isActive: boolean; sortOrder: number }>;
}

interface ExperienceEntry {
  id: string;
  company: string;
  position: string;
  city: string;
  country: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  isCurrent: boolean;
  description: string;
}

interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
  description: string;
}

interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

interface LanguageEntry {
  id: string;
  language: string;
  proficiency: string;
}

interface AIVariation {
  title: string;
  text: string;
}

const SAUDI_LANGUAGES = [
  { nameEn: 'Arabic', nameAr: 'العربية' },
  { nameEn: 'English', nameAr: 'الإنجليزية' },
  { nameEn: 'Urdu', nameAr: 'الأردية' },
  { nameEn: 'Hindi', nameAr: 'الهندية' },
  { nameEn: 'French', nameAr: 'الفرنسية' },
  { nameEn: 'Filipino', nameAr: 'الفلبينية' },
  { nameEn: 'Bengali', nameAr: 'البنغالية' },
  { nameEn: 'Indonesian', nameAr: 'الإندونيسية' },
  { nameEn: 'Malayalam', nameAr: 'الماليالامية' },
  { nameEn: 'Tamil', nameAr: 'التاميلية' },
  { nameEn: 'Turkish', nameAr: 'التركية' },
  { nameEn: 'Pashto', nameAr: 'البشتونية' },
  { nameEn: 'Somali', nameAr: 'الصومالية' },
  { nameEn: 'Swahili', nameAr: 'السواحيلية' },
  { nameEn: 'Spanish', nameAr: 'الإسبانية' },
  { nameEn: 'German', nameAr: 'الألمانية' },
  { nameEn: 'Chinese', nameAr: 'الصينية' },
  { nameEn: 'Japanese', nameAr: 'اليابانية' },
  { nameEn: 'Korean', nameAr: 'الكورية' },
];

const PROFICIENCY_LEVELS = [
  { value: 'basic', labelEn: 'Basic', labelAr: 'مبتدئ' },
  { value: 'intermediate', labelEn: 'Intermediate', labelAr: 'متوسط' },
  { value: 'professional', labelEn: 'Professional', labelAr: 'متقدم' },
  { value: 'fluent', labelEn: 'Fluent', labelAr: 'طليق' },
  { value: 'native', labelEn: 'Native', labelAr: 'لغة أم' },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => (currentYear - i).toString());

const EXPERIENCE_RANGES = [
  { value: '0-1', labelEn: '0 – 1 years', labelAr: '٠ – ١ سنة' },
  { value: '1-3', labelEn: '1 – 3 years', labelAr: '١ – ٣ سنوات' },
  { value: '3-5', labelEn: '3 – 5 years', labelAr: '٣ – ٥ سنوات' },
  { value: '5+', labelEn: '5+ years', labelAr: '+٥ سنوات' },
];

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function AIDescriptionButton({
  type, entryId, description, isContentArabic, isContentRTL,
  onGenerated, onShowVariations, context, token,
}: {
  type: 'experience' | 'education';
  entryId: string;
  description: string;
  isContentArabic: boolean;
  isContentRTL: boolean;
  onGenerated: (id: string, text: string) => void;
  onShowVariations: (id: string, variations: AIVariation[]) => void;
  context: Record<string, any>;
  token: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);

  const handleGenerate = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ...context, type, language: isContentArabic ? 'ar' : 'en', regenerate: false }),
      });
      if (!res.ok) {
        const err = await res.json();
        console.error('AI error:', err.error);
        return;
      }
      const data = await res.json();
      if (data.description) {
        onGenerated(entryId, data.description);
      }
    } catch (e) {
      console.error('AI generation failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (regenLoading || !description.trim()) return;
    setRegenLoading(true);
    try {
      const res = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ...context, type,
          language: isContentArabic ? 'ar' : 'en',
          regenerate: true,
          existingDescription: description,
        }),
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.variations?.length) {
        onShowVariations(entryId, data.variations);
      }
    } catch (e) {
      console.error('AI regeneration failed:', e);
    } finally {
      setRegenLoading(false);
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 mt-2 ${isContentRTL ? 'flex-row-reverse' : ''}`}>
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-50 text-accent-600 rounded-full text-xs font-medium hover:bg-accent-100 transition-colors disabled:opacity-50"
      >
        {loading ? <FiLoader className="w-3 h-3 animate-spin" /> : <FiZap className="w-3 h-3" />}
        {isContentArabic ? 'إنشاء بالذكاء الاصطناعي' : 'Generate with AI'}
      </button>
      {description.trim() && (
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={regenLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy-50 text-navy-600 rounded-full text-xs font-medium hover:bg-navy-100 transition-colors disabled:opacity-50"
        >
          {regenLoading ? <FiLoader className="w-3 h-3 animate-spin" /> : <FiRefreshCw className="w-3 h-3" />}
          {isContentArabic ? 'إعادة إنشاء (3 خيارات)' : 'Regenerate (3 options)'}
        </button>
      )}
    </div>
  );
}

function VariationPicker({
  variations, isContentArabic, isContentRTL,
  onSelect, onCancel,
}: {
  variations: AIVariation[];
  isContentArabic: boolean;
  isContentRTL: boolean;
  onSelect: (text: string) => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-3 border-2 border-accent-200 rounded-brand bg-accent-50/30 p-4 space-y-3" dir={isContentRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-navy-800">
          {isContentArabic ? 'اختر النسخة المفضلة:' : 'Choose your preferred version:'}
        </p>
        <button onClick={onCancel} className="text-xs text-gray-400 hover:text-gray-600">
          {isContentArabic ? 'إلغاء' : 'Cancel'}
        </button>
      </div>
      {variations.map((v, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(v.text)}
          className="w-full text-left bg-white rounded-brand p-3 border border-gray-200 hover:border-accent-400 hover:shadow-sm transition-all group"
          dir={isContentRTL ? 'rtl' : 'ltr'}
        >
          <p className="text-xs font-semibold text-accent-600 mb-1.5 group-hover:text-accent-700">{v.title}</p>
          <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{v.text}</p>
        </button>
      ))}
    </div>
  );
}

function CreateCVContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token } = useAuth();
  const { isRTL } = useLanguage();
  const { primaryCv, cvs: allCvs } = useCvData();

  const templateId = searchParams.get('template') || '';
  const storedTemplate = typeof window !== 'undefined' ? sessionStorage.getItem('selectedTemplate') : '';
  const [activeTemplate, setActiveTemplate] = useState(templateId || storedTemplate || '');

  useEffect(() => {
    if (!activeTemplate && typeof window !== 'undefined') {
      router.replace('/template-gallery');
    }
  }, [activeTemplate, router]);

  const [role, setRole] = useState<UserRole>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [nationality, setNationality] = useState('');
  const [jobDomain, setJobDomain] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState('');

  const [experiences, setExperiences] = useState<ExperienceEntry[]>([{
    id: generateId(), company: '', position: '', city: '', country: '',
    startMonth: '', startYear: '', endMonth: '', endYear: '', isCurrent: false, description: ''
  }]);

  const [educations, setEducations] = useState<EducationEntry[]>([{
    id: generateId(), institution: '', degree: '', field: '', startYear: '', endYear: '', description: ''
  }]);

  const [skills, setSkills] = useState<{ technical: string[]; soft: string[]; tools: string[] }>({ technical: [], soft: [], tools: [] });
  const [skillInputs, setSkillInputs] = useState<{ technical: string; soft: string; tools: string }>({ technical: '', soft: '', tools: '' });
  const [showSkillsAIModal, setShowSkillsAIModal] = useState(false);
  const [aiSuggestedSkills, setAiSuggestedSkills] = useState<{ english: { technical: string[]; soft: string[]; tools: string[] }; arabic: { technical: string[]; soft: string[]; tools: string[] } }>({ english: { technical: [], soft: [], tools: [] }, arabic: { technical: [], soft: [], tools: [] } });
  const [skillsAILoading, setSkillsAILoading] = useState(false);

  const [certifications, setCertifications] = useState<CertificationEntry[]>([]);
  const [cvLanguages, setCvLanguages] = useState<LanguageEntry[]>([]);

  const [summaryMode, setSummaryMode] = useState<'manual' | 'ai' | null>(null);
  const [professionalSummary, setProfessionalSummary] = useState('');
  const summaryAutoGeneratedRef = useRef(false);

  const [showSyncConfirm, setShowSyncConfirm] = useState(false);
  const [syncConfirmAction, setSyncConfirmAction] = useState<(() => void) | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aiLoading, setAiLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [lookupData, setLookupData] = useState<LookupData>({ saudiCities: [], jobDomains: [] });
  const [navigating, setNavigating] = useState(false);
  const [cvContentLang, setCvContentLang] = useState<'en' | 'ar'>('en');
  const [cvDirectionLocal, setCvDirectionLocal] = useState<'ltr' | 'rtl'>('ltr');
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [draftChecked, setDraftChecked] = useState(false);
  const draftRestoredRef = useRef(false);
  const userDataAppliedRef = useRef(false);

  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const [activeVariations, setActiveVariations] = useState<Record<string, AIVariation[]>>({});
  const [summaryVariations, setSummaryVariations] = useState<AIVariation[]>([]);

  const englishContentRef = useRef<{ experiences: ExperienceEntry[]; educations: EducationEntry[]; summary: string; skills: { technical: string[]; soft: string[]; tools: string[] }; certifications: CertificationEntry[]; cvLanguages: LanguageEntry[] }>({ experiences: [], educations: [], summary: '', skills: { technical: [], soft: [], tools: [] }, certifications: [], cvLanguages: [] });
  const arabicContentRef = useRef<{ experiences: ExperienceEntry[]; educations: EducationEntry[]; summary: string; skills: { technical: string[]; soft: string[]; tools: string[] }; certifications: CertificationEntry[]; cvLanguages: LanguageEntry[] }>({ experiences: [], educations: [], summary: '', skills: { technical: [], soft: [], tools: [] }, certifications: [], cvLanguages: [] });

  useEffect(() => {
    const savedLang = typeof window !== 'undefined' ? sessionStorage.getItem('cvContentLanguage') as 'en' | 'ar' | null : null;
    const savedDir = typeof window !== 'undefined' ? sessionStorage.getItem('cvContentDirection') as 'ltr' | 'rtl' | null : null;
    if (savedLang) setCvContentLang(savedLang);
    if (savedDir) setCvDirectionLocal(savedDir);
  }, []);

  useEffect(() => {
    fetch('/api/lookups')
      .then(res => res.json())
      .then(data => {
        setLookupData({
          saudiCities: data.saudiCities || [],
          jobDomains: data.jobDomains || [],
        });
      })
      .catch(err => console.error('Error fetching lookups:', err));
  }, []);

  useEffect(() => {
    if (user && !draftRestoredRef.current && !userDataAppliedRef.current) {
      userDataAppliedRef.current = true;
      setFullName(prev => prev || user.fullName || '');
      setEmail(prev => prev || user.email || '');
      setPhone(prev => prev || user.phoneNumber || '');
      setCity(prev => prev || user.location?.split(',')[0]?.trim() || '');
      setJobTitle(prev => prev || user.mostRecentJobTitle || '');
    }
  }, [user]);

  const isContentArabic = cvContentLang === 'ar';
  const isContentRTL = cvDirectionLocal === 'rtl';
  const ArrowNext = isRTL ? FiChevronLeft : FiChevronRight;
  const ArrowBack = isRTL ? FiChevronRight : FiChevronLeft;

  const toggleContentLanguage = useCallback(() => {
    const newLang = cvContentLang === 'en' ? 'ar' : 'en';
    const newDir = newLang === 'ar' ? 'rtl' : 'ltr';

    if (cvContentLang === 'en') {
      englishContentRef.current = {
        experiences: JSON.parse(JSON.stringify(experiences)),
        educations: JSON.parse(JSON.stringify(educations)),
        summary: professionalSummary,
        skills: JSON.parse(JSON.stringify(skills)),
        certifications: JSON.parse(JSON.stringify(certifications)),
        cvLanguages: JSON.parse(JSON.stringify(cvLanguages)),
      };
    } else {
      arabicContentRef.current = {
        experiences: JSON.parse(JSON.stringify(experiences)),
        educations: JSON.parse(JSON.stringify(educations)),
        summary: professionalSummary,
        skills: JSON.parse(JSON.stringify(skills)),
        certifications: JSON.parse(JSON.stringify(certifications)),
        cvLanguages: JSON.parse(JSON.stringify(cvLanguages)),
      };
    }

    const targetRef = newLang === 'ar' ? arabicContentRef.current : englishContentRef.current;
    const skillsObj = targetRef.skills || { technical: [], soft: [], tools: [] };
    const hasSkills = skillsObj.technical?.length > 0 || skillsObj.soft?.length > 0 || skillsObj.tools?.length > 0;
    const hasTargetContent = targetRef.experiences.some(e => e.company || e.position || e.description) ||
      targetRef.educations.some(e => e.institution || e.degree || e.description) ||
      targetRef.summary || hasSkills;

    if (hasTargetContent) {
      setExperiences(JSON.parse(JSON.stringify(targetRef.experiences.length > 0 ? targetRef.experiences : [{
        id: generateId(), company: '', position: '', city: '', country: '',
        startMonth: '', startYear: '', endMonth: '', endYear: '', isCurrent: false, description: ''
      }])));
      setEducations(JSON.parse(JSON.stringify(targetRef.educations.length > 0 ? targetRef.educations : [{
        id: generateId(), institution: '', degree: '', field: '', startYear: '', endYear: '', description: ''
      }])));
      setProfessionalSummary(targetRef.summary || '');
      setSkills(targetRef.skills || { technical: [], soft: [], tools: [] });
      setCertifications(JSON.parse(JSON.stringify(targetRef.certifications || [])));
      setCvLanguages(JSON.parse(JSON.stringify(targetRef.cvLanguages || [])));
    }

    setSummaryVariations([]);
    setCvContentLang(newLang);
    setCvDirectionLocal(newDir);
    sessionStorage.setItem('cvContentLanguage', newLang);
    sessionStorage.setItem('cvContentDirection', newDir);
  }, [cvContentLang, experiences, educations, professionalSummary, skills, certifications, cvLanguages]);

  const stepConfig = useMemo(() => {
    if (!role) return [];
    if (role === 'student') {
      return [
        { id: 'basic', label: isContentArabic ? 'المعلومات الأساسية' : 'Basic Info' },
        { id: 'location', label: isContentArabic ? 'الموقع' : 'Location' },
        { id: 'education', label: isContentArabic ? 'التعليم' : 'Education' },
        { id: 'skills', label: isContentArabic ? 'المهارات' : 'Skills' },
        { id: 'certifications', label: isContentArabic ? 'الشهادات' : 'Certificates' },
        { id: 'languages', label: isContentArabic ? 'اللغات' : 'Languages' },
        { id: 'summary', label: isContentArabic ? 'الملخص المهني' : 'Summary' },
        { id: 'smart-template', label: isContentArabic ? 'القالب المقترح' : 'Smart Template' },
      ];
    }
    return [
      { id: 'basic', label: isContentArabic ? 'المعلومات الأساسية' : 'Basic Info' },
      { id: 'location', label: isContentArabic ? 'الموقع' : 'Location' },
      { id: 'exp-years', label: isContentArabic ? 'سنوات الخبرة' : 'Experience Level' },
      { id: 'experience', label: isContentArabic ? 'الخبرة المهنية' : 'Experience' },
      { id: 'education', label: isContentArabic ? 'التعليم' : 'Education' },
      { id: 'skills', label: isContentArabic ? 'المهارات' : 'Skills' },
      { id: 'certifications', label: isContentArabic ? 'الشهادات' : 'Certificates' },
      { id: 'languages', label: isContentArabic ? 'اللغات' : 'Languages' },
      { id: 'summary', label: isContentArabic ? 'الملخص المهني' : 'Summary' },
      { id: 'smart-template', label: isContentArabic ? 'القالب المقترح' : 'Smart Template' },
    ];
  }, [role, isContentArabic]);

  const totalSteps = stepConfig.length;
  const currentStepId = stepConfig[currentStep - 1]?.id || '';
  const progressPercent = role ? (currentStep / totalSteps) * 100 : 0;

  const [securityWarning, setSecurityWarning] = useState(false);
  const securityWarningTimer = useRef<NodeJS.Timeout | null>(null);

  const showSecurityWarning = useCallback(() => {
    setSecurityWarning(true);
    if (securityWarningTimer.current) clearTimeout(securityWarningTimer.current);
    securityWarningTimer.current = setTimeout(() => setSecurityWarning(false), 2500);
  }, []);

  useEffect(() => {
    if (currentStepId !== 'smart-template') return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      showSecurityWarning();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') { e.preventDefault(); showSecurityWarning(); return; }
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.shiftKey && ['I','i','J','j','C','c'].includes(e.key)) { e.preventDefault(); showSecurityWarning(); return; }
      if (ctrl && (e.key === 'u' || e.key === 'U')) { e.preventDefault(); showSecurityWarning(); return; }
      if (ctrl && (e.key === 's' || e.key === 'S')) { e.preventDefault(); showSecurityWarning(); return; }
      if (ctrl && (e.key === 'c' || e.key === 'C')) { e.preventDefault(); showSecurityWarning(); return; }
      if (ctrl && (e.key === 'p' || e.key === 'P')) { e.preventDefault(); showSecurityWarning(); return; }
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      showSecurityWarning();
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleSelectStart = (e: Event) => {
      const target = e.target as Element;
      const isInput = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        (target as HTMLElement).contentEditable === 'true'
      );
      if (!isInput) e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('selectstart', handleSelectStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('selectstart', handleSelectStart);
      if (securityWarningTimer.current) clearTimeout(securityWarningTimer.current);
    };
  }, [currentStepId, showSecurityWarning]);

  const validateStep = useCallback((step: number): boolean => {
    const newErrors: Record<string, string> = {};
    const stepId = stepConfig[step - 1]?.id;

    if (stepId === 'basic') {
      if (!fullName.trim()) newErrors.fullName = isContentArabic ? 'الاسم مطلوب' : 'Name is required';
      if (!email.trim()) newErrors.email = isContentArabic ? 'البريد الإلكتروني مطلوب' : 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = isContentArabic ? 'بريد إلكتروني غير صالح' : 'Invalid email';
      if (!phone.trim()) newErrors.phone = isContentArabic ? 'رقم الهاتف مطلوب' : 'Phone is required';
      else {
        const phoneErr = getPhoneValidationError(phone, isContentArabic);
        if (phoneErr) newErrors.phone = phoneErr;
      }
      if (role === 'employer' && !jobTitle.trim()) newErrors.jobTitle = isContentArabic ? 'المسمى الوظيفي مطلوب' : 'Job title is required';
    }

    if (stepId === 'exp-years') {
      if (!yearsOfExperience) newErrors.yearsOfExperience = isContentArabic ? 'يرجى اختيار مستوى الخبرة' : 'Please select your experience level';
    }

    if (stepId === 'experience') {
      const hasNoCompany = experiences.every(e => !e.company.trim());
      if (hasNoCompany) newErrors.company = isContentArabic ? 'اسم الشركة مطلوب لوظيفة واحدة على الأقل' : 'Company name is required for at least one position';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [stepConfig, fullName, email, phone, role, jobTitle, yearsOfExperience, experiences, isContentArabic]);

  const saveProgressToStorage = useCallback(() => {
    try {
      const progress = {
        role, fullName, email, phone, jobTitle, city, country, nationality, jobDomain, yearsOfExperience,
        experiences, educations, skills, certifications, cvLanguages, professionalSummary, summaryMode,
        currentStep, activeTemplate, cvContentLang, cvDirectionLocal, profilePhoto,
      };
      sessionStorage.setItem('cvBuilderProgress', JSON.stringify(progress));
    } catch (e) {
      console.error('Error saving progress:', e);
    }
  }, [role, fullName, email, phone, jobTitle, city, country, nationality, jobDomain, yearsOfExperience, experiences, educations, skills, certifications, cvLanguages, professionalSummary, summaryMode, currentStep, activeTemplate, cvContentLang, cvDirectionLocal, profilePhoto]);

  const handleNext = useCallback(() => {
    if (navigating) return;
    if (validateStep(currentStep)) {
      setNavigating(true);
      saveProgressToStorage();
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
        setErrors({});
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setTimeout(() => setNavigating(false), 300);
    }
  }, [navigating, validateStep, currentStep, totalSteps, saveProgressToStorage]);

  const handleBack = useCallback(() => {
    if (navigating) return;
    setNavigating(true);
    setErrors({});
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 1) {
      setRole(null);
      setCurrentStep(0);
    }
    setTimeout(() => setNavigating(false), 300);
  }, [navigating, currentStep]);

  const handleSkip = useCallback(() => {
    if (navigating) return;
    setNavigating(true);
    saveProgressToStorage();
    setErrors({});
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setTimeout(() => setNavigating(false), 300);
  }, [navigating, currentStep, totalSteps, saveProgressToStorage]);

  useEffect(() => {
    if (draftChecked) return;
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem('cvBuilderProgress') : null;
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.role || data.fullName || data.jobTitle || data.experiences?.some((e: any) => e.company || e.position)) {
          setShowDraftDialog(true);
          return;
        }
      } catch (e) {}
    }
    setDraftChecked(true);
  }, [draftChecked]);

  const restoreDraft = useCallback(() => {
    const saved = sessionStorage.getItem('cvBuilderProgress');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        draftRestoredRef.current = true;
        if (data.role) setRole(data.role);
        if (data.fullName) setFullName(data.fullName);
        if (data.email) setEmail(data.email);
        if (data.phone) setPhone(data.phone);
        if (data.jobTitle) setJobTitle(data.jobTitle);
        if (data.city) setCity(data.city);
        if (data.country) setCountry(data.country);
        if (data.nationality) setNationality(data.nationality);
        if (data.jobDomain) setJobDomain(data.jobDomain);
        if (data.yearsOfExperience) setYearsOfExperience(data.yearsOfExperience);
        if (data.experiences?.length) setExperiences(data.experiences);
        if (data.educations?.length) setEducations(data.educations);
        if (data.skills) {
          if (Array.isArray(data.skills)) {
            setSkills({ technical: data.skills, soft: [], tools: [] });
          } else if (typeof data.skills === 'object') {
            setSkills({ technical: data.skills.technical || [], soft: data.skills.soft || [], tools: data.skills.tools || [] });
          }
        }
        if (data.certifications?.length) setCertifications(data.certifications);
        if (data.cvLanguages?.length) setCvLanguages(data.cvLanguages);
        if (data.professionalSummary) setProfessionalSummary(data.professionalSummary);
        if (data.summaryMode) setSummaryMode(data.summaryMode);
        if (data.cvContentLang) { setCvContentLang(data.cvContentLang); sessionStorage.setItem('cvContentLanguage', data.cvContentLang); }
        if (data.cvDirectionLocal) { setCvDirectionLocal(data.cvDirectionLocal); sessionStorage.setItem('cvContentDirection', data.cvDirectionLocal); }
        const draftTemplate = data.activeTemplate || activeTemplate;
        const draftTemplateInfo = TEMPLATE_FAMILIES.find(t => t.id === draftTemplate);
        const draftSupportsPhoto = draftTemplateInfo?.layout?.photoPosition != null && draftTemplateInfo.layout.photoPosition !== 'none';
        if (data.profilePhoto && draftSupportsPhoto) setProfilePhoto(data.profilePhoto);
        setCurrentStep(data.currentStep && data.currentStep >= 1 ? data.currentStep : (data.role ? 1 : 0));
      } catch (e) {
        console.error('Error restoring draft:', e);
      }
    }
    setShowDraftDialog(false);
    setDraftChecked(true);
  }, [activeTemplate]);

  const startFresh = useCallback(() => {
    sessionStorage.removeItem('cvBuilderProgress');
    setShowDraftDialog(false);
    setDraftChecked(true);
  }, []);

  const addExperience = useCallback(() => {
    setExperiences(prev => [...prev, {
      id: generateId(), company: '', position: '', city: '', country: '',
      startMonth: '', startYear: '', endMonth: '', endYear: '', isCurrent: false, description: ''
    }]);
  }, []);

  const removeExperience = useCallback((id: string) => {
    setExperiences(prev => prev.length > 1 ? prev.filter(e => e.id !== id) : prev);
  }, []);

  const updateExperience = useCallback((id: string, field: string, value: any) => {
    setExperiences(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
    if (field === 'company') {
      setErrors(prev => {
        if (!prev.company) return prev;
        return { ...prev, company: '' };
      });
    }
  }, []);

  const addEducation = useCallback(() => {
    setEducations(prev => [...prev, {
      id: generateId(), institution: '', degree: '', field: '', startYear: '', endYear: '', description: ''
    }]);
  }, []);

  const removeEducation = useCallback((id: string) => {
    setEducations(prev => prev.length > 1 ? prev.filter(e => e.id !== id) : prev);
  }, []);

  const updateEducation = useCallback((id: string, field: string, value: string) => {
    setEducations(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  }, []);

  const handleAIDescriptionGenerated = useCallback((id: string, text: string) => {
    const isExp = experiences.some(e => e.id === id);
    if (isExp) {
      setExperiences(prev => prev.map(e => e.id === id ? { ...e, description: text } : e));
    } else {
      setEducations(prev => prev.map(e => e.id === id ? { ...e, description: text } : e));
    }
  }, [experiences]);

  const handleShowVariations = useCallback((id: string, variations: AIVariation[]) => {
    setActiveVariations(prev => ({ ...prev, [id]: variations }));
  }, []);

  const handleSelectVariation = useCallback((id: string, text: string) => {
    const isExp = experiences.some(e => e.id === id);
    if (isExp) {
      setExperiences(prev => prev.map(e => e.id === id ? { ...e, description: text } : e));
    } else {
      setEducations(prev => prev.map(e => e.id === id ? { ...e, description: text } : e));
    }
    setActiveVariations(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, [experiences]);

  const handleCancelVariations = useCallback((id: string) => {
    setActiveVariations(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const addSkill = useCallback((category: 'technical' | 'soft' | 'tools', skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills[category].includes(trimmed)) {
      setSkills(prev => ({ ...prev, [category]: [...prev[category], trimmed] }));
    }
  }, [skills]);

  const removeSkill = useCallback((category: 'technical' | 'soft' | 'tools', skill: string) => {
    setSkills(prev => ({ ...prev, [category]: prev[category].filter(s => s !== skill) }));
  }, []);

  const handleSkillInputKeyDown = useCallback((category: 'technical' | 'soft' | 'tools', e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = skillInputs[category].trim();
      if (val) {
        addSkill(category, val);
        setSkillInputs(prev => ({ ...prev, [category]: '' }));
      }
    }
  }, [skillInputs, addSkill]);

  const handleAISkillsSuggest = useCallback(async () => {
    setSkillsAILoading(true);
    setShowSkillsAIModal(true);
    try {
      const response = await fetch('/api/ai/suggest-skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          role,
          jobTitle,
          jobDomain,
          yearsOfExperience,
          educationField: educations[0]?.field || '',
          educationDegree: educations[0]?.degree || '',
          existingSkills: skills,
          experienceDescriptions: experiences
            .map(e => e.description || (Array.isArray(e.responsibilities) ? e.responsibilities.filter(Boolean).join('. ') : ''))
            .filter(Boolean),
        }),
      });
      if (!response.ok) throw new Error('Failed to suggest skills');
      const data = await response.json();
      setAiSuggestedSkills({
        english: {
          technical: data.englishSkills?.technical || [],
          soft: data.englishSkills?.soft || [],
          tools: data.englishSkills?.tools || [],
        },
        arabic: {
          technical: data.arabicSkills?.technical || [],
          soft: data.arabicSkills?.soft || [],
          tools: data.arabicSkills?.tools || [],
        },
      });
    } catch (err) {
      console.error('Error suggesting skills:', err);
    } finally {
      setSkillsAILoading(false);
    }
  }, [token, role, jobTitle, jobDomain, yearsOfExperience, educations, skills]);

  const addCertification = useCallback(() => {
    setCertifications(prev => [...prev, { id: generateId(), name: '', issuer: '', year: '' }]);
  }, []);

  const removeCertification = useCallback((id: string) => {
    setCertifications(prev => prev.filter(c => c.id !== id));
  }, []);

  const updateCertification = useCallback((id: string, field: string, value: string) => {
    setCertifications(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  }, []);

  const addCvLanguage = useCallback(() => {
    setCvLanguages(prev => [...prev, { id: generateId(), language: '', proficiency: '' }]);
  }, []);

  const removeCvLanguage = useCallback((id: string) => {
    setCvLanguages(prev => prev.filter(l => l.id !== id));
  }, []);

  const updateCvLanguage = useCallback((id: string, field: string, value: string) => {
    setCvLanguages(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  }, []);

  const aiContext = useMemo(() => ({
    role, jobTitle, jobDomain, yearsOfExperience,
  }), [role, jobTitle, jobDomain, yearsOfExperience]);

  const handleGenerateAISummary = useCallback(async (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (aiLoading) return;

    setAiLoading(true);
    setSummaryMode('ai');
    setSummaryVariations([]);
    try {
      const response = await fetch('/api/ai/generate-profile-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          targetJobTitle: jobTitle,
          careerLevel: yearsOfExperience,
          industry: jobDomain,
          yearsOfExperience: yearsOfExperience,
          mostRecentJobTitle: experiences[0]?.position || jobTitle,
          mostRecentCompany: experiences[0]?.company || '',
          employmentStatus: '',
          educationLevel: educations[0]?.degree || '',
          educationField: educations[0]?.field || '',
          skills: [...skills.technical, ...skills.soft, ...skills.tools].join(', '),
          role: role,
          language: cvContentLang,
          variations: false,
          experiences: experiences.map(e => ({
            position: e.position,
            company: e.company,
            startDate: e.startDate || (e.startMonth && e.startYear ? `${e.startMonth} ${e.startYear}` : ''),
            endDate: e.endDate || (e.isCurrent ? 'Present' : e.endMonth && e.endYear ? `${e.endMonth} ${e.endYear}` : ''),
            isCurrent: e.isCurrent,
          })),
        }),
      });
      if (!response.ok) throw new Error('AI generation failed');
      const data = await response.json();
      if (data.summary) {
        setProfessionalSummary(data.summary);
      } else if (data.variations?.[0]?.text) {
        setProfessionalSummary(data.variations[0].text);
      }
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setAiLoading(false);
    }
  }, [aiLoading, token, jobTitle, yearsOfExperience, jobDomain, experiences, educations, skills, role, cvContentLang]);

  const handleSelectSummaryVariation = useCallback((text: string) => {
    setProfessionalSummary(text);
    setSummaryVariations([]);
  }, []);

  useEffect(() => {
    if (currentStepId !== 'summary') return;
    if (summaryAutoGeneratedRef.current) return;
    if (professionalSummary.trim()) { summaryAutoGeneratedRef.current = true; setSummaryMode('ai'); return; }
    summaryAutoGeneratedRef.current = true;
    setSummaryMode('ai');
    setAiLoading(true);
    setSummaryVariations([]);
    const ctrl = new AbortController();
    (async () => {
      try {
        const response = await fetch('/api/ai/generate-profile-summary', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          signal: ctrl.signal,
          body: JSON.stringify({
            targetJobTitle: jobTitle,
            careerLevel: yearsOfExperience,
            industry: jobDomain,
            yearsOfExperience,
            mostRecentJobTitle: experiences[0]?.position || jobTitle,
            mostRecentCompany: experiences[0]?.company || '',
            employmentStatus: '',
            educationLevel: educations[0]?.degree || '',
            educationField: educations[0]?.field || '',
            skills: [...skills.technical, ...skills.soft, ...skills.tools].join(', '),
            role,
            language: cvContentLang,
            variations: false,
            experiences: experiences.map(e => ({
              position: e.position,
              company: e.company,
              startDate: e.startDate || (e.startMonth && e.startYear ? `${e.startMonth} ${e.startYear}` : ''),
              endDate: e.endDate || (e.isCurrent ? 'Present' : e.endMonth && e.endYear ? `${e.endMonth} ${e.endYear}` : ''),
              isCurrent: e.isCurrent,
            })),
          }),
        });
        if (!response.ok) throw new Error('AI generation failed');
        const data = await response.json();
        if (data.summary) {
          setProfessionalSummary(data.summary);
        } else if (data.variations?.[0]?.text) {
          setProfessionalSummary(data.variations[0].text);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') console.error('Auto-summary failed:', err);
      } finally {
        setAiLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [currentStepId]);

  const parseDateString = useCallback((dateStr: string): { month: string; year: string } => {
    if (!dateStr || dateStr === 'Present') return { month: '', year: '' };
    const parts = dateStr.trim().split(' ');
    if (parts.length === 2) return { month: parts[0], year: parts[1] };
    if (parts.length === 1 && /^\d{4}$/.test(parts[0])) return { month: '', year: parts[0] };
    return { month: '', year: '' };
  }, []);

  const stripHtmlForForm = useCallback((html: string): string => {
    if (!html) return '';
    const htmlStartIdx = html.indexOf('<');
    if (htmlStartIdx > 0) {
      return html.substring(0, htmlStartIdx).trim();
    }
    return html.replace(/<[^>]*>/g, ' ').replace(/\s{2,}/g, '\n').trim();
  }, []);

  const requestSync = useCallback((stepId: string, hasExistingData: boolean, applyFn: () => void) => {
    if (hasExistingData) {
      setSyncConfirmAction(() => applyFn);
      setShowSyncConfirm(true);
    } else {
      applyFn();
    }
  }, []);

  const handleSyncFromProfile = useCallback((stepId: string) => {
    if (!user) return;

    if (stepId === 'basic') {
      const hasData = !!(fullName.trim() || email.trim() || phone.trim() || jobTitle.trim());
      const apply = () => {
        if (user.fullName) setFullName(user.fullName);
        if (user.email) setEmail(user.email);
        if (user.phoneNumber) setPhone(user.phoneNumber);
        const jt = (user as any).mostRecentJobTitle || (user as any).targetJobTitle;
        if (jt) setJobTitle(jt);
      };
      requestSync(stepId, hasData, apply);

    } else if (stepId === 'location') {
      const hasData = !!(city.trim() || country.trim() || jobDomain.trim());
      const apply = () => {
        if (user.location) {
          const parts = user.location.split(',').map((s: string) => s.trim());
          if (parts[0]) setCity(parts[0]);
          if (parts[1]) setCountry(parts[1]);
        }
        const nat = (user as any).nationality;
        if (nat) setNationality(nat);
        else if ((user as any).location?.toLowerCase().includes('saudi')) {
          setNationality(isContentArabic ? 'سعودي' : 'Saudi');
        }
        const jd = (user as any).targetJobDomain || (user as any).industry;
        if (jd) setJobDomain(jd);
      };
      requestSync(stepId, hasData, apply);

    } else if (stepId === 'exp-years') {
      const hasData = !!yearsOfExperience;
      const apply = () => {
        if (user.yearsOfExperience) setYearsOfExperience(user.yearsOfExperience);
      };
      requestSync(stepId, hasData, apply);

    } else if (stepId === 'experience') {
      const getPiForLang = (lang: 'ar' | 'en') => {
        const cv = lang === 'ar'
          ? (allCvs || []).find((c: any) => c.language === 'ar') || null
          : primaryCv;
        if (!cv) return null;
        const raw = (cv as any).personalInfo;
        try { return typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return raw || null; }
      };

      let srcExp: any[] = [];
      if (isContentArabic) {
        const arPi = getPiForLang('ar');
        const arExp = arPi?.arabicContent?.experience;
        if (Array.isArray(arExp) && arExp.length > 0) srcExp = arExp;
      } else {
        const pi = getPiForLang('en');
        const enBlock = pi?.englishContent;
        srcExp = (Array.isArray(enBlock?.experience) && enBlock.experience.length > 0)
          ? enBlock.experience
          : (Array.isArray(pi?.experience) && pi.experience.length > 0 ? pi.experience : []);
      }

      const hasData = experiences.some(e => e.company || e.position);
      const apply = () => {
        if (srcExp.length > 0) {
          const mapped = srcExp.map((exp: any) => {
            const start = parseDateString(exp.startDate || '');
            const isCurrentJob = exp.endDate === 'Present' || !exp.endDate || exp.current;
            const end = isCurrentJob ? { month: '', year: '' } : parseDateString(exp.endDate || '');
            const loc = (exp.location || '').split(',').map((s: string) => s.trim());
            return {
              id: generateId(),
              company: exp.company || '',
              position: exp.position || exp.title || '',
              city: loc[0] || '',
              country: loc[1] || '',
              startMonth: start.month,
              startYear: start.year,
              endMonth: end.month,
              endYear: end.year,
              isCurrent: !!isCurrentJob,
              description: stripHtmlForForm(exp.description || (Array.isArray(exp.achievements) ? exp.achievements.join('\n') : '')),
            };
          });
          setExperiences(mapped);
        } else if (!isContentArabic && ((user as any).mostRecentJobTitle || (user as any).mostRecentCompany)) {
          setExperiences([{
            id: generateId(),
            company: (user as any).mostRecentCompany || '',
            position: (user as any).mostRecentJobTitle || '',
            city: '', country: '', startMonth: '', startYear: '',
            endMonth: '', endYear: '', isCurrent: false, description: '',
          }]);
        }
      };
      requestSync(stepId, hasData, apply);

    } else if (stepId === 'education') {
      const getPiForLang = (lang: 'ar' | 'en') => {
        const cv = lang === 'ar'
          ? (allCvs || []).find((c: any) => c.language === 'ar') || null
          : primaryCv;
        if (!cv) return null;
        const raw = (cv as any).personalInfo;
        try { return typeof raw === 'string' ? JSON.parse(raw) : raw; } catch { return raw || null; }
      };

      let srcEdu: any[] = [];
      if (isContentArabic) {
        const arPi = getPiForLang('ar');
        const arEdu = arPi?.arabicContent?.education;
        if (Array.isArray(arEdu) && arEdu.length > 0) srcEdu = arEdu;
      } else {
        const pi = getPiForLang('en');
        const enBlock = pi?.englishContent;
        srcEdu = (Array.isArray(enBlock?.education) && enBlock.education.length > 0)
          ? enBlock.education
          : (Array.isArray(pi?.education) && pi.education.length > 0 ? pi.education : []);
      }

      const hasData = educations.some(e => e.institution || e.degree);
      const apply = () => {
        if (srcEdu.length > 0) {
          const mapped = srcEdu.map((edu: any) => ({
            id: generateId(),
            institution: edu.institution || edu.school || '',
            degree: edu.degree || '',
            field: edu.field || edu.fieldOfStudy || '',
            startYear: edu.startDate || '',
            endYear: edu.endDate || edu.graduationYear || '',
            description: edu.description || '',
          }));
          setEducations(mapped);
        }
      };
      requestSync(stepId, hasData, apply);

    } else if (stepId === 'summary') {
      const hasData = !!professionalSummary.trim();
      const apply = () => {
        let src: string | null = null;
        if (isContentArabic) {
          const arCv = (allCvs || []).find((c: any) => c.language === 'ar');
          if (arCv) {
            const raw = (arCv as any).personalInfo;
            const arPi = typeof raw === 'string' ? JSON.parse(raw) : raw;
            src = arPi?.arabicContent?.professionalSummary || arPi?.arabicContent?.summary || null;
          }
        } else {
          const cvPi = (primaryCv?.personalInfo as any);
          const enBlock = cvPi?.englishContent;
          src = enBlock?.professionalSummary || enBlock?.summary
            || (user as any).professionalSummary || primaryCv?.summary || null;
        }
        if (src) {
          setProfessionalSummary(src);
          setSummaryMode('ai');
        }
      };
      requestSync(stepId, hasData, apply);
    }
  }, [user, token, primaryCv, allCvs, isContentArabic, fullName, email, phone, jobTitle, city, country, jobDomain, yearsOfExperience, experiences, educations, professionalSummary, parseDateString, requestSync]);

  const activeTemplateInfo = useMemo(() => TEMPLATE_FAMILIES.find(t => t.id === activeTemplate) || null, [activeTemplate]);
  const showPhotoUpload = useMemo(() => activeTemplateInfo?.layout?.photoPosition != null && activeTemplateInfo.layout.photoPosition !== 'none', [activeTemplateInfo]);

  const handleFinish = useCallback(async () => {
    if (generating || navigating) return;
    if (!validateStep(currentStep)) return;

    setGenerating(true);
    try {
      const normalizedPhone = phone ? normalizeSaudiPhone(phone) : '';
      const personalInfo = {
        fullName, name: fullName, email, phone: normalizedPhone,
        phoneNumber: normalizedPhone, location: city ? `${city}${country ? ', ' + country : ''}` : '',
        targetJobTitle: jobTitle, targetJobDomain: jobDomain,
        nationality: nationality || (country === 'Saudi Arabia' ? (isContentArabic ? 'سعودي' : 'Saudi') : ''),
        ...(showPhotoUpload && profilePhoto ? { photo: profilePhoto } : {}),
      };

      const formattedExperience = experiences.filter(e => e.company || e.position).map(e => ({
        company: e.company, position: e.position, title: e.position,
        location: e.city ? `${e.city}${e.country ? ', ' + e.country : ''}` : '',
        startDate: e.startMonth ? `${e.startMonth} ${e.startYear}` : e.startYear,
        endDate: e.isCurrent ? 'Present' : (e.endMonth ? `${e.endMonth} ${e.endYear}` : e.endYear),
        description: e.description,
        achievements: e.description ? e.description.split('\n').filter(Boolean) : [],
      }));

      const formattedEducation = educations.filter(e => e.institution || e.degree).map(e => ({
        institution: e.institution, school: e.institution,
        degree: e.degree, field: e.field, fieldOfStudy: e.field,
        startDate: e.startYear, endDate: e.endYear, graduationYear: e.endYear,
        description: e.description,
      }));

      const formattedSkills = {
        technical: skills.technical.filter(Boolean),
        soft: skills.soft.filter(Boolean),
        tools: skills.tools.filter(Boolean),
      };

      const formattedCertifications = certifications.filter(c => c.name).map(c => ({
        name: c.name,
        issuer: c.issuer,
        date: c.year,
        year: c.year,
      }));

      const formattedLanguages = cvLanguages.filter(l => l.language).map(l => ({
        name: l.language,
        language: l.language,
        proficiency: l.proficiency,
        level: l.proficiency,
      }));

      const content = {
        personalInfo,
        professionalSummary: professionalSummary,
        summary: professionalSummary,
        experience: role === 'student' ? [] : formattedExperience,
        education: formattedEducation,
        skills: formattedSkills,
        certifications: formattedCertifications,
        languages: formattedLanguages,
      };

      if (cvContentLang === 'en') {
        englishContentRef.current = { experiences: JSON.parse(JSON.stringify(experiences)), educations: JSON.parse(JSON.stringify(educations)), summary: professionalSummary, skills: JSON.parse(JSON.stringify(skills)), certifications: JSON.parse(JSON.stringify(certifications)), cvLanguages: JSON.parse(JSON.stringify(cvLanguages)) };
      } else {
        arabicContentRef.current = { experiences: JSON.parse(JSON.stringify(experiences)), educations: JSON.parse(JSON.stringify(educations)), summary: professionalSummary, skills: JSON.parse(JSON.stringify(skills)), certifications: JSON.parse(JSON.stringify(certifications)), cvLanguages: JSON.parse(JSON.stringify(cvLanguages)) };
      }

      const otherRef = cvContentLang === 'en' ? arabicContentRef.current : englishContentRef.current;
      const buildContent = (ref: typeof englishContentRef.current) => {
        const fExps = ref.experiences.filter(e => e.company || e.position).map(e => ({
          company: e.company, position: e.position, title: e.position,
          location: e.city ? `${e.city}${e.country ? ', ' + e.country : ''}` : '',
          startDate: e.startMonth ? `${e.startMonth} ${e.startYear}` : e.startYear,
          endDate: e.isCurrent ? 'Present' : (e.endMonth ? `${e.endMonth} ${e.endYear}` : e.endYear),
          description: e.description,
          achievements: e.description ? e.description.split('\n').filter(Boolean) : [],
        }));
        const fEdus = ref.educations.filter(e => e.institution || e.degree).map(e => ({
          institution: e.institution, school: e.institution,
          degree: e.degree, field: e.field, fieldOfStudy: e.field,
          startDate: e.startYear, endDate: e.endYear, graduationYear: e.endYear,
          description: e.description,
        }));
        const refSkills = ref.skills || { technical: [], soft: [], tools: [] };
        const fSkills = {
          technical: (refSkills.technical || []).filter(Boolean),
          soft: (refSkills.soft || []).filter(Boolean),
          tools: (refSkills.tools || []).filter(Boolean),
        };
        const fCerts = (ref.certifications || []).filter(c => c.name).map(c => ({
          name: c.name, issuer: c.issuer, date: c.year, year: c.year,
        }));
        const fLangs = (ref.cvLanguages || []).filter(l => l.language).map(l => ({
          name: l.language, language: l.language, proficiency: l.proficiency, level: l.proficiency,
        }));
        return {
          personalInfo,
          professionalSummary: ref.summary, summary: ref.summary,
          experience: role === 'student' ? [] : fExps,
          education: fEdus,
          skills: fSkills,
          certifications: fCerts, languages: fLangs,
        };
      };

      const otherSkills = otherRef.skills || { technical: [], soft: [], tools: [] };
      const otherHasSkills = otherSkills.technical?.length > 0 || otherSkills.soft?.length > 0 || otherSkills.tools?.length > 0;
      const otherHasData = otherRef.experiences.some(e => e.company || e.position || e.description) || !!otherRef.summary || otherHasSkills;

      let otherContent: any;
      if (otherHasData) {
        otherContent = buildContent(otherRef);
      } else {
        try {
          const targetLang = cvContentLang === 'en' ? 'ar' : 'en';
          const transHeaders: Record<string, string> = { 'Content-Type': 'application/json' };
          if (token) transHeaders['Authorization'] = `Bearer ${token}`;
          const transResponse = await fetch('/api/ai/translate-content', {
            method: 'POST',
            headers: transHeaders,
            body: JSON.stringify({ targetLanguage: targetLang, content }),
          });
          if (transResponse.ok) {
            const transData = await transResponse.json();
            const t = transData.translated || {};
            otherContent = {
              ...content,
              personalInfo: {
                ...personalInfo,
                targetJobTitle: t.targetJobTitle || personalInfo.targetJobTitle,
                targetJobDomain: t.targetJobDomain || personalInfo.targetJobDomain,
                location: t.location || personalInfo.location,
                nationality: t.nationality || personalInfo.nationality,
              },
              professionalSummary: t.summary || content.professionalSummary,
              summary: t.summary || content.summary,
              experience: (content.experience || []).map((exp: any, idx: number) => {
                const tExp = t.experience?.[idx];
                const tResps: string[] = Array.isArray(tExp?.responsibilities) && tExp.responsibilities.length > 0 ? tExp.responsibilities : [];
                const tDesc: string = typeof tExp?.description === 'string' ? tExp.description.trim() : '';
                let translatedDescription = '';
                if (tDesc) {
                  translatedDescription = tDesc;
                } else if (tResps.length > 0) {
                  translatedDescription = '<ul>' + tResps.map((r: string) => `<li>${r}</li>`).join('') + '</ul>';
                }
                return {
                  ...exp,
                  position: tExp?.position || exp.position,
                  title: tExp?.position || exp.title,
                  description: translatedDescription || exp.description,
                  location: tExp?.location || exp.location,
                  achievements: tResps.length > 0 ? tResps : exp.achievements,
                  responsibilities: [],
                };
              }),
              education: (content.education || []).map((edu: any, idx: number) => ({
                ...edu,
                degree: t.education?.[idx]?.degree || edu.degree,
                field: t.education?.[idx]?.field || edu.field,
                fieldOfStudy: t.education?.[idx]?.field || edu.fieldOfStudy,
                description: t.education?.[idx]?.description || edu.description,
              })),
              skills: t.skills ? {
                technical: t.skills.technical || content.skills?.technical || [],
                soft: t.skills.soft || content.skills?.soft || [],
                tools: t.skills.tools || content.skills?.tools || [],
              } : content.skills,
            };
          } else {
            otherContent = { ...content, personalInfo: { ...personalInfo } };
          }
        } catch {
          otherContent = { ...content, personalInfo: { ...personalInfo } };
        }
      }

      const cvData: any = {
        generatedContent: content,
        language: cvContentLang,
        textDirection: cvDirectionLocal,
        englishContent: cvContentLang === 'en' ? content : otherContent,
        arabicContent: cvContentLang === 'ar' ? content : otherContent,
        templateId: activeTemplate,
      };

      const editingCvId = typeof window !== 'undefined' ? sessionStorage.getItem('editingCvId') : null;
      sessionStorage.removeItem('editingCvId');
      sessionStorage.setItem('generatedCvData', JSON.stringify(cvData));
      sessionStorage.setItem('guestEmail', email);
      sessionStorage.setItem('selectedTemplate', activeTemplate);
      sessionStorage.setItem('cvContentLanguage', cvContentLang);
      sessionStorage.setItem('cvContentDirection', cvDirectionLocal);
      sessionStorage.setItem('cvBasicInfo', JSON.stringify({
        fullName, email, phone: normalizedPhone, location: personalInfo.location,
        jobDomain, careerLevel: yearsOfExperience, latestJob: jobTitle,
      }));

      if (token) {
        try {
          await fetch('/api/user/update-template', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ templateId: activeTemplate }),
          });
        } catch (err) {
          console.error('Error updating template for user:', err);
        }
      } else {
        try {
          await fetch('/api/guest-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email, fullName, phone: normalizedPhone,
              location: personalInfo.location, latestJob: jobTitle,
              templateId: activeTemplate,
            }),
          });
          await fetch('/api/guest-cv/save-basic-info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email, templateId: activeTemplate,
              basicInfo: { fullName, email, phone: normalizedPhone, location: personalInfo.location, jobDomain, careerLevel: yearsOfExperience, latestJob: jobTitle },
            }),
          });
        } catch (err) {
          console.error('Error saving guest data:', err);
        }
      }

      sessionStorage.removeItem('cvBuilderProgress');
      setGenerating(false);
      const previewUrl = `/cv/preview?template=${activeTemplate}`;
      router.push(previewUrl);
    } catch (error) {
      console.error('Error finishing CV:', error);
      setGenerating(false);
    }
  }, [generating, navigating, validateStep, currentStep, phone, fullName, email, city, country, jobTitle, jobDomain, yearsOfExperience, experiences, educations, professionalSummary, role, cvContentLang, cvDirectionLocal, activeTemplate, token, router, profilePhoto, showPhotoUpload]);

  useEffect(() => {
    if (showPhotoUpload && user && (user as any).profilePicture && !profilePhoto) {
      setProfilePhoto((user as any).profilePicture);
    }
  }, [user, showPhotoUpload]);

  useEffect(() => {
    if (!showPhotoUpload && profilePhoto) {
      setProfilePhoto(null);
    }
  }, [showPhotoUpload]);
  const templateDisplayName = activeTemplateInfo?.name || (activeTemplate
    ? activeTemplate.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : '');
  const templateDisplayNameAr = activeTemplateInfo?.nameAr || templateDisplayName;

  const inputClass = 'w-full px-4 py-3 border-2 border-gray-200 rounded-brand text-base focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none transition-all duration-200 placeholder:text-gray-400 bg-white min-h-[48px]';
  const inputErrorClass = 'w-full px-4 py-3 border-2 border-red-400 bg-red-50/50 rounded-brand text-base focus:border-red-400 focus:ring-2 focus:ring-red-400/20 focus:outline-none transition-all duration-200 placeholder:text-gray-400 min-h-[48px]';
  const selectClass = 'w-full px-4 py-3 border-2 border-gray-200 rounded-brand text-base focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none transition-all duration-200 bg-white min-h-[48px] appearance-none';
  const labelClass = 'block text-sm font-medium text-navy-800 mb-1.5';

  const handleSelectRole = useCallback((selectedRole: UserRole) => {
    setRole(selectedRole);
    setCurrentStep(1);
    setErrors({});
  }, []);

  useEffect(() => {
    if (role && currentStep >= 1 && draftChecked) {
      saveProgressToStorage();
    }
  }, [role, currentStep, draftChecked, saveProgressToStorage]);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const isLastStep = currentStep === totalSteps;

  return (
    <>
      <AIGenerationModal isOpen={generating} selectedTemplate={templateDisplayName} selectedTemplateAr={templateDisplayNameAr} />

      {showDraftDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={startFresh}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-2xl bg-accent-50 flex items-center justify-center mx-auto mb-5">
              <FiFileText className="w-8 h-8 text-accent-500" />
            </div>
            <h3 className="font-telegraf text-xl font-bold text-navy-900 text-center mb-2">
              {isContentArabic ? 'لديك مسودة محفوظة' : 'You have a saved draft'}
            </h3>
            <p className="text-sm text-gray-500 text-center mb-8">
              {isContentArabic
                ? 'وجدنا تقدماً سابقاً محفوظاً. هل تريد المتابعة من حيث توقفت أو البدء من جديد؟'
                : 'We found your previous progress. Would you like to continue where you left off or start fresh?'}
            </p>
            <div className="space-y-3">
              <button onClick={restoreDraft}
                className="w-full py-3.5 bg-accent-500 text-white rounded-brand font-semibold hover:bg-accent-600 transition-all shadow-brand-soft flex items-center justify-center gap-2 min-h-[48px]">
                <FiArrowRight className="w-4 h-4" />
                {isContentArabic ? 'المتابعة من حيث توقفت' : 'Continue where I left off'}
              </button>
              <button onClick={startFresh}
                className="w-full py-3.5 border-2 border-gray-200 text-navy-700 rounded-brand font-medium hover:border-accent-300 hover:text-accent-600 transition-all flex items-center justify-center gap-2 min-h-[48px]">
                {isContentArabic ? 'البدء من جديد' : 'Start fresh'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#f8f9fc]" dir={isRTL ? 'rtl' : 'ltr'}>
        {role && currentStep >= 1 && (
          <div className="sticky top-16 z-30 bg-white border-b border-gray-100 shadow-sm">
            <div className="max-w-2xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent-500 text-white text-[11px] font-bold">{currentStep}</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-navy-800 leading-tight">{stepConfig[currentStep - 1]?.label}</span>
                    <span className="text-[11px] text-gray-400 leading-tight">
                      {isContentArabic ? `الخطوة ${currentStep} من ${totalSteps}` : `Step ${currentStep} of ${totalSteps}`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={toggleContentLanguage}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-navy-50 hover:bg-navy-100 rounded-full text-[10px] sm:text-xs font-semibold text-navy-700 transition-colors border border-navy-100"
                    title={isContentArabic ? 'Switch to English' : 'التبديل إلى العربية'}
                  >
                    <FiGlobe className="w-3 h-3" />
                    <span>{cvContentLang === 'en' ? 'EN' : 'AR'}</span>
                    <span className="text-navy-400">|</span>
                    <span className="text-navy-400">{cvContentLang === 'en' ? 'عربي' : 'EN'}</span>
                  </button>
                  <span className="text-xs font-bold text-accent-500">{Math.round(progressPercent)}%</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent-400 to-accent-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        )}

        <div className={`mx-auto px-4 pt-6 pb-40 md:pb-12 ${currentStepId === 'smart-template' ? 'max-w-5xl' : 'max-w-2xl'}`}>
          {templateDisplayName && role && (
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-navy-50 rounded-full text-xs text-navy-600 font-medium">
                <FiStar className="w-3.5 h-3.5 text-accent-500" />
                <span>{templateDisplayName}</span>
              </div>
            </div>
          )}

          <div className="transition-all duration-300 ease-in-out">
            {!role && currentStep === 0 && (
              <div className="animate-slideIn">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-accent-50 flex items-center justify-center mx-auto mb-4">
                    <FiUsers className="w-8 h-8 text-accent-500" />
                  </div>
                  <h2 className="font-telegraf text-2xl font-bold text-navy-900 mb-2">
                    {isContentArabic ? 'مرحباً! أخبرنا عن نفسك' : 'Welcome! Tell us about yourself'}
                  </h2>
                  <p className="text-sm text-gray-500 max-w-sm mx-auto">
                    {isContentArabic
                      ? 'اختر ما يصفك بشكل أفضل لنخصص تجربتك'
                      : 'Choose what best describes you so we can personalize your experience'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                  <button
                    onClick={() => handleSelectRole('student')}
                    className="bg-white rounded-2xl shadow-card p-6 text-center hover:shadow-brand-md transition-all group border-2 border-transparent hover:border-accent-200 active:scale-[0.98]"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition-colors">
                      <FiBook className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-telegraf font-bold text-navy-900 text-lg mb-1">
                      {isContentArabic ? 'طالب' : 'Student'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {isContentArabic ? 'أبحث عن فرصتي الأولى أو تدريب' : 'Looking for my first opportunity or internship'}
                    </p>
                  </button>

                  <button
                    onClick={() => handleSelectRole('employer')}
                    className="bg-white rounded-2xl shadow-card p-6 text-center hover:shadow-brand-md transition-all group border-2 border-transparent hover:border-accent-200 active:scale-[0.98]"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-accent-50 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-100 transition-colors">
                      <FiBriefcase className="w-8 h-8 text-accent-600" />
                    </div>
                    <h3 className="font-telegraf font-bold text-navy-900 text-lg mb-1">
                      {isContentArabic ? 'موظف' : 'Professional'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {isContentArabic ? 'لدي خبرة مهنية سابقة' : 'I have professional work experience'}
                    </p>
                  </button>
                </div>
              </div>
            )}

            {currentStepId === 'basic' && (
              <div className="animate-slideIn">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-accent-50 flex items-center justify-center mx-auto mb-3">
                    <FiUser className="w-6 h-6 text-accent-500" />
                  </div>
                  <h2 className="font-telegraf text-xl font-bold text-navy-900">
                    {isContentArabic ? 'المعلومات الأساسية' : 'Basic Information'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {isContentArabic ? 'هذه المعلومات ستظهر في أعلى سيرتك الذاتية' : 'This information will appear at the top of your CV'}
                  </p>
                  {user && (
                    <button type="button" onClick={() => handleSyncFromProfile('basic')}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors border border-blue-100">
                      <FiRefreshCw className="w-3 h-3" />
                      {isContentArabic ? 'مزامنة من الملف الشخصي' : 'Sync From Profile'}
                    </button>
                  )}
                </div>

                {showPhotoUpload && (
                  <div className="bg-white rounded-brand-lg shadow-card p-6 mb-4">
                    <div className="flex items-center gap-2 mb-4">
                      <FiCamera className="w-4 h-4 text-accent-500" />
                      <span className="text-sm font-semibold text-navy-800">
                        {isContentArabic ? 'صورة شخصية (اختياري)' : 'Profile Photo (Optional)'}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {isContentArabic ? 'يدعمها القالب المختار' : 'Supported by your template'}
                      </span>
                    </div>
                    <ProfilePhotoUpload
                      currentPhotoUrl={profilePhoto}
                      token={token}
                      isRTL={isContentRTL}
                      onPhotoChange={(url) => setProfilePhoto(url)}
                    />
                  </div>
                )}

                <div className="bg-white rounded-brand-lg shadow-card p-6 space-y-5" dir={isContentRTL ? 'rtl' : 'ltr'}>
                  <div>
                    <label className={labelClass}>
                      <FiUser className={`w-3.5 h-3.5 inline-block text-navy-400 ${isContentRTL ? 'ml-1.5' : 'mr-1.5'}`} />
                      {isContentArabic ? 'الاسم الكامل' : 'Full Name'} <span className="text-red-500">*</span>
                    </label>
                    <input type="text" dir={isContentRTL ? 'rtl' : 'ltr'}
                      value={fullName} onChange={(e) => { setFullName(e.target.value); clearFieldError('fullName'); }}
                      placeholder={isContentArabic ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                      className={errors.fullName ? inputErrorClass : inputClass} />
                    {errors.fullName && <p className="mt-1.5 text-sm text-red-500">{errors.fullName}</p>}
                  </div>

                  {role === 'employer' && (
                    <div>
                      <label className={labelClass}>
                        <FiBriefcase className={`w-3.5 h-3.5 inline-block text-navy-400 ${isContentRTL ? 'ml-1.5' : 'mr-1.5'}`} />
                        {isContentArabic ? 'المسمى الوظيفي' : 'Professional Job Title'} <span className="text-red-500">*</span>
                      </label>
                      <input type="text" dir={isContentRTL ? 'rtl' : 'ltr'}
                        value={jobTitle} onChange={(e) => { setJobTitle(e.target.value); clearFieldError('jobTitle'); }}
                        placeholder={isContentArabic ? 'مثال: مدير مشاريع' : 'e.g., Project Manager'}
                        className={errors.jobTitle ? inputErrorClass : inputClass} />
                      {errors.jobTitle && <p className="mt-1.5 text-sm text-red-500">{errors.jobTitle}</p>}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>
                        <FiMail className={`w-3.5 h-3.5 inline-block text-navy-400 ${isContentRTL ? 'ml-1.5' : 'mr-1.5'}`} />
                        {isContentArabic ? 'البريد الإلكتروني' : 'Email'} <span className="text-red-500">*</span>
                      </label>
                      <input type="email" value={email}
                        onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
                        placeholder={isContentArabic ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                        className={errors.email ? inputErrorClass : inputClass} />
                      {errors.email && <p className="mt-1.5 text-sm text-red-500">{errors.email}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>
                        <FiPhone className={`w-3.5 h-3.5 inline-block text-navy-400 ${isContentRTL ? 'ml-1.5' : 'mr-1.5'}`} />
                        {isContentArabic ? 'رقم الهاتف' : 'Phone Number'} <span className="text-red-500">*</span>
                      </label>
                      <input type="tel" value={phone}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPhone(val);
                          const err = getPhoneValidationError(val, isContentArabic);
                          setErrors(prev => ({ ...prev, phone: err || '' }));
                        }}
                        placeholder={isContentArabic ? '05XXXXXXXX أو +9665XXXXXXXX' : '05XXXXXXXX or +9665XXXXXXXX'}
                        className={errors.phone ? inputErrorClass : inputClass} />
                      {errors.phone && <p className="mt-1.5 text-sm text-red-500">{errors.phone}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStepId === 'location' && (
              <div className="animate-slideIn">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-accent-50 flex items-center justify-center mx-auto mb-3">
                    <FiMapPin className="w-6 h-6 text-accent-500" />
                  </div>
                  <h2 className="font-telegraf text-xl font-bold text-navy-900">
                    {isContentArabic ? 'الموقع' : 'Location'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {isContentArabic ? 'هذه الخطوة اختيارية' : 'This step is optional'}
                  </p>
                  {user && (
                    <button type="button" onClick={() => handleSyncFromProfile('location')}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors border border-blue-100">
                      <FiRefreshCw className="w-3 h-3" />
                      {isContentArabic ? 'مزامنة من الملف الشخصي' : 'Sync From Profile'}
                    </button>
                  )}
                </div>

                <div className="bg-white rounded-brand-lg shadow-card p-6 space-y-5" dir={isContentRTL ? 'rtl' : 'ltr'}>
                  <div>
                    <label className={labelClass}>
                      <FiMapPin className={`w-3.5 h-3.5 inline-block text-navy-400 ${isContentRTL ? 'ml-1.5' : 'mr-1.5'}`} />
                      {isContentArabic ? 'المدينة' : 'City'}
                    </label>
                    <SmartSearchDropdown
                      options={lookupData.saudiCities.map(c => ({ value: c.nameEn, labelEn: `${c.nameEn} (${c.region})`, labelAr: c.nameAr }))}
                      value={city}
                      onChange={(value) => { setCity(value); if (!country) setCountry('Saudi Arabia'); if (!nationality) setNationality(isContentArabic ? 'سعودي' : 'Saudi'); }}
                      placeholder="Select your city" placeholderAr="اختر مدينتك"
                      allowCustom={true} customPlaceholder="Type a city..." customPlaceholderAr="أدخل المدينة..."
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      <FiGlobe className={`w-3.5 h-3.5 inline-block text-navy-400 ${isContentRTL ? 'ml-1.5' : 'mr-1.5'}`} />
                      {isContentArabic ? 'الدولة' : 'Country'}
                    </label>
                    <input type="text" dir={isContentRTL ? 'rtl' : 'ltr'} value={country} onChange={(e) => setCountry(e.target.value)}
                      placeholder={isContentArabic ? 'مثال: المملكة العربية السعودية' : 'e.g., Saudi Arabia'} className={inputClass} />
                  </div>
                  {role === 'employer' && (
                    <div>
                      <label className={labelClass}>
                        <FiBriefcase className={`w-3.5 h-3.5 inline-block text-navy-400 ${isContentRTL ? 'ml-1.5' : 'mr-1.5'}`} />
                        {isContentArabic ? 'المجال الوظيفي' : 'Job Domain'}
                      </label>
                      <SmartSearchDropdown
                        options={lookupData.jobDomains.filter(d => d.isActive).map(d => ({ value: d.slug, labelEn: d.nameEn, labelAr: d.nameAr }))}
                        value={jobDomain} onChange={(value) => setJobDomain(value)}
                        placeholder="Select job domain" placeholderAr="اختر المجال الوظيفي"
                        allowCustom={true} customPlaceholder="Type your domain..." customPlaceholderAr="أدخل المجال..."
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStepId === 'exp-years' && (
              <div className="animate-slideIn">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-accent-50 flex items-center justify-center mx-auto mb-3">
                    <FiClock className="w-6 h-6 text-accent-500" />
                  </div>
                  <h2 className="font-telegraf text-xl font-bold text-navy-900">
                    {isContentArabic ? 'سنوات الخبرة' : 'Years of Experience'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {isContentArabic ? 'كم عدد سنوات خبرتك المهنية؟' : 'How many years of professional experience do you have?'}
                  </p>
                  {user && user.yearsOfExperience && (
                    <button type="button" onClick={() => handleSyncFromProfile('exp-years')}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors border border-blue-100">
                      <FiRefreshCw className="w-3 h-3" />
                      {isContentArabic ? 'مزامنة من الملف الشخصي' : 'Sync From Profile'}
                    </button>
                  )}
                </div>
                {errors.yearsOfExperience && <p className="text-center text-sm text-red-500 mb-4">{errors.yearsOfExperience}</p>}
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  {EXPERIENCE_RANGES.map((range) => (
                    <button key={range.value}
                      onClick={() => { setYearsOfExperience(range.value); setErrors(prev => ({ ...prev, yearsOfExperience: '' })); }}
                      className={`bg-white rounded-brand-lg shadow-card p-5 text-center transition-all border-2 active:scale-[0.98] ${
                        yearsOfExperience === range.value
                          ? 'border-accent-400 bg-accent-50/50 shadow-brand-md'
                          : 'border-transparent hover:border-accent-200 hover:shadow-brand-md'
                      }`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 ${yearsOfExperience === range.value ? 'bg-accent-100' : 'bg-gray-100'}`}>
                        <FiClock className={`w-5 h-5 ${yearsOfExperience === range.value ? 'text-accent-600' : 'text-gray-400'}`} />
                      </div>
                      <span className={`font-bold text-base ${yearsOfExperience === range.value ? 'text-accent-600' : 'text-navy-800'}`}>
                        {isContentArabic ? range.labelAr : range.labelEn}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStepId === 'experience' && (
              <div className="animate-slideIn">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-accent-50 flex items-center justify-center mx-auto mb-3">
                    <FiBriefcase className="w-6 h-6 text-accent-500" />
                  </div>
                  <h2 className="font-telegraf text-xl font-bold text-navy-900">
                    {isContentArabic ? 'الخبرة المهنية' : 'Work Experience'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {isContentArabic ? 'ابدأ بأحدث وظيفة' : 'Start with your most recent job'}
                  </p>
                  {user && (() => {
                    const pi = (primaryCv?.personalInfo as any);
                    return (primaryCv?.experience as any[])?.length > 0
                      || pi?.experience?.length > 0
                      || pi?.englishContent?.experience?.length > 0
                      || (user as any).mostRecentCompany
                      || (user as any).mostRecentJobTitle;
                  })() ? (
                    <button type="button" onClick={() => handleSyncFromProfile('experience')}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors border border-blue-100">
                      <FiRefreshCw className="w-3 h-3" />
                      {isContentArabic ? 'مزامنة من الملف الشخصي' : 'Sync From Profile'}
                    </button>
                  ) : null}
                </div>
                {errors.company && <p className="text-center text-sm text-red-500 mb-4">{errors.company}</p>}
                <div className="space-y-4">
                  {experiences.map((exp, index) => (
                    <div key={exp.id} className="bg-white rounded-brand-lg shadow-card p-6 space-y-4" dir={isContentRTL ? 'rtl' : 'ltr'}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-navy-800 text-sm">
                          {isContentArabic ? `الوظيفة ${index + 1}` : `Position ${index + 1}`}
                        </h3>
                        {experiences.length > 1 && (
                          <button onClick={() => removeExperience(exp.id)} className="text-red-400 hover:text-red-600 p-1">
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div>
                        <label className={labelClass}>{isContentArabic ? 'اسم الشركة' : 'Company Name'} <span className="text-red-500">*</span></label>
                        <input type="text" value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                          placeholder={isContentArabic ? 'مثال: شركة أرامكو' : 'e.g., Saudi Aramco'} className={inputClass} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>{isContentArabic ? 'المسمى الوظيفي' : 'Job Title'}</label>
                          <input type="text" value={exp.position} onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                            placeholder={isContentArabic ? 'مثال: محلل' : 'e.g., Analyst'} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>{isContentArabic ? 'المدينة' : 'City'}</label>
                          <input type="text" value={exp.city} onChange={(e) => updateExperience(exp.id, 'city', e.target.value)}
                            placeholder={isContentArabic ? 'مثال: الرياض' : 'e.g., Riyadh'} className={inputClass} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>{isContentArabic ? 'تاريخ البدء' : 'Start Date'}</label>
                          <div className="grid grid-cols-2 gap-2">
                            <select value={exp.startMonth} onChange={(e) => updateExperience(exp.id, 'startMonth', e.target.value)} className={selectClass}>
                              <option value="">{isContentArabic ? 'الشهر' : 'Month'}</option>
                              {(isContentArabic ? MONTHS_AR : MONTHS).map((m, i) => <option key={i} value={MONTHS[i]}>{m}</option>)}
                            </select>
                            <select value={exp.startYear} onChange={(e) => updateExperience(exp.id, 'startYear', e.target.value)} className={selectClass}>
                              <option value="">{isContentArabic ? 'السنة' : 'Year'}</option>
                              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>{isContentArabic ? 'تاريخ الانتهاء' : 'End Date'}</label>
                          <div className="grid grid-cols-2 gap-2">
                            <select value={exp.endMonth} onChange={(e) => updateExperience(exp.id, 'endMonth', e.target.value)}
                              disabled={exp.isCurrent} className={`${selectClass} ${exp.isCurrent ? 'opacity-50' : ''}`}>
                              <option value="">{isContentArabic ? 'الشهر' : 'Month'}</option>
                              {(isContentArabic ? MONTHS_AR : MONTHS).map((m, i) => <option key={i} value={MONTHS[i]}>{m}</option>)}
                            </select>
                            <select value={exp.endYear} onChange={(e) => updateExperience(exp.id, 'endYear', e.target.value)}
                              disabled={exp.isCurrent} className={`${selectClass} ${exp.isCurrent ? 'opacity-50' : ''}`}>
                              <option value="">{isContentArabic ? 'السنة' : 'Year'}</option>
                              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                          </div>
                          <label className="flex items-center gap-2 mt-2 cursor-pointer">
                            <input type="checkbox" checked={exp.isCurrent}
                              onChange={(e) => updateExperience(exp.id, 'isCurrent', e.target.checked)}
                              className="w-4 h-4 rounded border-gray-300 text-accent-500 focus:ring-accent-500" />
                            <span className="text-sm text-gray-600">{isContentArabic ? 'أعمل هنا حالياً' : 'Present'}</span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>{isContentArabic ? 'الوصف' : 'Description'}</label>
                        <textarea value={exp.description} onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                          placeholder={isContentArabic ? 'صف مسؤولياتك وإنجازاتك...' : 'Describe your responsibilities and achievements...'}
                          rows={4} className={`${inputClass} resize-none`} />
                        <AIDescriptionButton
                          type="experience" entryId={exp.id} description={exp.description}
                          isContentArabic={isContentArabic} isContentRTL={isContentRTL}
                          onGenerated={handleAIDescriptionGenerated}
                          onShowVariations={handleShowVariations}
                          context={{ ...aiContext, company: exp.company, position: exp.position || jobTitle }}
                          token={token}
                        />
                        {activeVariations[exp.id] && (
                          <VariationPicker
                            variations={activeVariations[exp.id]}
                            isContentArabic={isContentArabic} isContentRTL={isContentRTL}
                            onSelect={(text) => handleSelectVariation(exp.id, text)}
                            onCancel={() => handleCancelVariations(exp.id)}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                  <button onClick={addExperience}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-brand text-sm font-medium text-gray-500 hover:border-accent-400 hover:text-accent-500 transition-colors flex items-center justify-center gap-2">
                    <FiPlus className="w-4 h-4" />
                    {isContentArabic ? 'إضافة وظيفة أخرى' : 'Add Another Position'}
                  </button>
                </div>
              </div>
            )}

            {currentStepId === 'education' && (
              <div className="animate-slideIn">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-accent-50 flex items-center justify-center mx-auto mb-3">
                    <FiBookOpen className="w-6 h-6 text-accent-500" />
                  </div>
                  <h2 className="font-telegraf text-xl font-bold text-navy-900">
                    {isContentArabic ? 'التعليم' : 'Education'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {isContentArabic ? 'أضف مؤهلاتك التعليمية' : 'Add your educational qualifications'}
                  </p>
                  {user && (() => {
                    const pi = (primaryCv?.personalInfo as any);
                    return (primaryCv?.education as any[])?.length > 0
                      || pi?.education?.length > 0
                      || pi?.englishContent?.education?.length > 0;
                  })() ? (
                    <button type="button" onClick={() => handleSyncFromProfile('education')}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors border border-blue-100">
                      <FiRefreshCw className="w-3 h-3" />
                      {isContentArabic ? 'مزامنة من الملف الشخصي' : 'Sync From Profile'}
                    </button>
                  ) : null}
                </div>
                <div className="space-y-4">
                  {educations.map((edu, index) => (
                    <div key={edu.id} className="bg-white rounded-brand-lg shadow-card p-6 space-y-4" dir={isContentRTL ? 'rtl' : 'ltr'}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-navy-800 text-sm">
                          {isContentArabic ? `المؤهل ${index + 1}` : `Qualification ${index + 1}`}
                        </h3>
                        {educations.length > 1 && (
                          <button onClick={() => removeEducation(edu.id)} className="text-red-400 hover:text-red-600 p-1">
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div>
                        <label className={labelClass}>{isContentArabic ? 'المؤسسة التعليمية' : 'Institution'}</label>
                        <input type="text" value={edu.institution} onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                          placeholder={isContentArabic ? 'مثال: جامعة الملك سعود' : 'e.g., King Saud University'} className={inputClass} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>{isContentArabic ? 'الدرجة العلمية' : 'Degree'}</label>
                          <input type="text" value={edu.degree} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                            placeholder={isContentArabic ? 'مثال: بكالوريوس' : 'e.g., Bachelor of Science'} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>{isContentArabic ? 'التخصص' : 'Field of Study'}</label>
                          <input type="text" value={edu.field} onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                            placeholder={isContentArabic ? 'مثال: إدارة الأعمال' : 'e.g., Business Administration'} className={inputClass} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>{isContentArabic ? 'سنة البدء' : 'Start Year'}</label>
                          <select value={edu.startYear} onChange={(e) => updateEducation(edu.id, 'startYear', e.target.value)} className={selectClass}>
                            <option value="">{isContentArabic ? 'اختر' : 'Select'}</option>
                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>{isContentArabic ? 'سنة التخرج' : 'Graduation Year'}</label>
                          <select value={edu.endYear} onChange={(e) => updateEducation(edu.id, 'endYear', e.target.value)} className={selectClass}>
                            <option value="">{isContentArabic ? 'اختر' : 'Select'}</option>
                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>{isContentArabic ? 'الوصف' : 'Description'}</label>
                        <textarea value={edu.description} onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                          placeholder={isContentArabic ? 'أضف تفاصيل عن دراستك، مشاريعك، أو إنجازاتك الأكاديمية...' : 'Add details about your studies, projects, or academic achievements...'}
                          rows={3} className={`${inputClass} resize-none`} />
                        <AIDescriptionButton
                          type="education" entryId={edu.id} description={edu.description}
                          isContentArabic={isContentArabic} isContentRTL={isContentRTL}
                          onGenerated={handleAIDescriptionGenerated}
                          onShowVariations={handleShowVariations}
                          context={{ ...aiContext, institution: edu.institution, degree: edu.degree, field: edu.field }}
                          token={token}
                        />
                        {activeVariations[edu.id] && (
                          <VariationPicker
                            variations={activeVariations[edu.id]}
                            isContentArabic={isContentArabic} isContentRTL={isContentRTL}
                            onSelect={(text) => handleSelectVariation(edu.id, text)}
                            onCancel={() => handleCancelVariations(edu.id)}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                  <button onClick={addEducation}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-brand text-sm font-medium text-gray-500 hover:border-accent-400 hover:text-accent-500 transition-colors flex items-center justify-center gap-2">
                    <FiPlus className="w-4 h-4" />
                    {isContentArabic ? 'إضافة مؤهل آخر' : 'Add Another Qualification'}
                  </button>
                </div>
              </div>
            )}

            {currentStepId === 'skills' && (
              <div className="animate-slideIn">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-accent-50 flex items-center justify-center mx-auto mb-3">
                    <FiStar className="w-6 h-6 text-accent-500" />
                  </div>
                  <h2 className="font-telegraf text-xl font-bold text-navy-900">
                    {isContentArabic ? 'المهارات' : 'Skills'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {isContentArabic ? 'أضف مهاراتك المهنية والتقنية' : 'Add your professional and technical skills'}
                  </p>
                </div>

                <div className="bg-white rounded-brand-lg shadow-card p-6 space-y-5" dir={isContentRTL ? 'rtl' : 'ltr'}>
                  {([
                    { key: 'technical' as const, label: isContentArabic ? 'المهارات التقنية' : 'Technical Skills', placeholder: isContentArabic ? 'مثال: Python, React...' : 'e.g. Python, React...' },
                    { key: 'soft' as const, label: isContentArabic ? 'المهارات الشخصية' : 'Soft Skills', placeholder: isContentArabic ? 'مثال: القيادة, التواصل...' : 'e.g. Leadership, Communication...' },
                    { key: 'tools' as const, label: isContentArabic ? 'الأدوات' : 'Tools', placeholder: isContentArabic ? 'مثال: Figma, Jira...' : 'e.g. Figma, Jira...' },
                  ]).map(({ key, label, placeholder }) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold text-navy-800 mb-2">{label}</label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {skills[key].map((skill) => (
                          <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-50 text-accent-700 rounded-full text-sm font-medium">
                            {skill}
                            <button type="button" onClick={() => removeSkill(key, skill)} className="hover:text-red-500 transition-colors">
                              <FiX className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={skillInputs[key]}
                          onChange={(e) => setSkillInputs(prev => ({ ...prev, [key]: e.target.value }))}
                          onKeyDown={(e) => handleSkillInputKeyDown(key, e)}
                          placeholder={placeholder}
                          className={inputClass}
                        />
                        <button type="button" onClick={() => { const val = skillInputs[key].trim(); if (val) { addSkill(key, val); setSkillInputs(prev => ({ ...prev, [key]: '' })); } }}
                          className="px-4 py-3 bg-accent-500 text-white rounded-brand hover:bg-accent-600 transition-colors min-h-[48px]">
                          <FiPlus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={handleAISkillsSuggest} disabled={skillsAILoading}
                    className="mt-4 w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-accent-50 to-accent-100 text-accent-700 rounded-brand font-semibold text-sm hover:from-accent-100 hover:to-accent-200 transition-all border border-accent-200 min-h-[48px]">
                    {skillsAILoading ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiZap className="w-4 h-4" />}
                    {isContentArabic ? 'اقتراح مهارات بالذكاء الاصطناعي' : 'Suggest Skills with AI'}
                  </button>
                </div>
              </div>
            )}

            {showSkillsAIModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowSkillsAIModal(false)}>
                <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-telegraf text-lg font-bold text-navy-900">
                      {isContentArabic ? 'مهارات مقترحة بالذكاء الاصطناعي' : 'AI Suggested Skills'}
                    </h3>
                    <button onClick={() => setShowSkillsAIModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>
                  {skillsAILoading ? (
                    <div className="flex flex-col items-center gap-3 py-12">
                      <FiLoader className="w-8 h-8 text-accent-500 animate-spin" />
                      <p className="text-sm text-gray-500">{isContentArabic ? 'جاري إنشاء الاقتراحات...' : 'Generating suggestions...'}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-500">
                        {isContentArabic ? 'انقر على المهارات لإضافتها:' : 'Click skills to add them:'}
                      </p>
                      {([
                        { key: 'technical' as const, label: isContentArabic ? 'المهارات التقنية' : 'Technical Skills' },
                        { key: 'soft' as const, label: isContentArabic ? 'المهارات الشخصية' : 'Soft Skills' },
                        { key: 'tools' as const, label: isContentArabic ? 'الأدوات' : 'Tools' },
                      ]).map(({ key, label }) => {
                        const suggested = isContentArabic ? aiSuggestedSkills.arabic[key] : aiSuggestedSkills.english[key];
                        if (!suggested || suggested.length === 0) return null;
                        return (
                          <div key={key}>
                            <p className="text-xs font-semibold text-navy-700 mb-2">{label}</p>
                            <div className="flex flex-wrap gap-2">
                              {suggested.map((skill, idx) => {
                                const alreadyAdded = skills[key].includes(skill);
                                return (
                                  <button key={idx} type="button"
                                    onClick={() => { if (!alreadyAdded) addSkill(key, skill); }}
                                    disabled={alreadyAdded}
                                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                                      alreadyAdded
                                        ? 'bg-green-100 text-green-700 cursor-default'
                                        : 'bg-gray-100 text-gray-700 hover:bg-accent-100 hover:text-accent-700 cursor-pointer'
                                    }`}>
                                    {alreadyAdded && <FiCheck className="w-3 h-3 inline mr-1" />}
                                    {skill}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                      <div className="flex gap-2 mt-6">
                        <button type="button" onClick={handleAISkillsSuggest} disabled={skillsAILoading}
                          className="flex-1 py-2.5 border border-accent-300 text-accent-600 rounded-brand text-sm font-medium hover:bg-accent-50 transition-colors flex items-center justify-center gap-1.5">
                          <FiRefreshCw className="w-3.5 h-3.5" /> {isContentArabic ? 'إعادة إنشاء' : 'Regenerate'}
                        </button>
                        <button type="button" onClick={() => setShowSkillsAIModal(false)}
                          className="flex-1 py-2.5 bg-accent-500 text-white rounded-brand text-sm font-semibold hover:bg-accent-600 transition-colors">
                          {isContentArabic ? 'تم' : 'Done'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentStepId === 'certifications' && (
              <div className="animate-slideIn">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-accent-50 flex items-center justify-center mx-auto mb-3">
                    <FiAward className="w-6 h-6 text-accent-500" />
                  </div>
                  <h2 className="font-telegraf text-xl font-bold text-navy-900">
                    {isContentArabic ? 'الشهادات والإنجازات' : 'Certificates & Achievements'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {isContentArabic ? 'أضف شهاداتك المهنية وإنجازاتك' : 'Add your professional certifications and achievements'}
                  </p>
                </div>

                <div className="space-y-4" dir={isContentRTL ? 'rtl' : 'ltr'}>
                  {certifications.map((cert) => (
                    <div key={cert.id} className="bg-white rounded-brand-lg shadow-card p-5 relative">
                      {certifications.length > 1 && (
                        <button onClick={() => removeCertification(cert.id)}
                          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                      <div className="space-y-3">
                        <div>
                          <label className={labelClass}>{isContentArabic ? 'اسم الشهادة / الإنجاز' : 'Certificate / Achievement Name'}</label>
                          <input value={cert.name} onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                            placeholder={isContentArabic ? 'مثال: شهادة تصميم تجربة المستخدم من Google' : 'e.g. Google UX Design Certificate'}
                            className={inputClass} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={labelClass}>{isContentArabic ? 'الجهة المصدرة' : 'Issuer'}</label>
                            <input value={cert.issuer} onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                              placeholder={isContentArabic ? 'مثال: Google' : 'e.g. Google'}
                              className={inputClass} />
                          </div>
                          <div>
                            <label className={labelClass}>{isContentArabic ? 'السنة' : 'Year'}</label>
                            <select value={cert.year} onChange={(e) => updateCertification(cert.id, 'year', e.target.value)} className={selectClass}>
                              <option value="">{isContentArabic ? 'اختر السنة' : 'Select Year'}</option>
                              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={addCertification}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-brand text-sm font-medium text-gray-500 hover:border-accent-400 hover:text-accent-500 transition-colors flex items-center justify-center gap-2">
                    <FiPlus className="w-4 h-4" />
                    {isContentArabic ? 'إضافة شهادة أخرى' : 'Add Certificate'}
                  </button>
                </div>
              </div>
            )}

            {currentStepId === 'languages' && (
              <div className="animate-slideIn">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-accent-50 flex items-center justify-center mx-auto mb-3">
                    <FiGlobe className="w-6 h-6 text-accent-500" />
                  </div>
                  <h2 className="font-telegraf text-xl font-bold text-navy-900">
                    {isContentArabic ? 'اللغات' : 'Languages'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {isContentArabic ? 'أضف اللغات التي تتحدثها ومستوى إتقانك' : 'Add the languages you speak and your proficiency level'}
                  </p>
                </div>

                <div className="space-y-4" dir={isContentRTL ? 'rtl' : 'ltr'}>
                  {cvLanguages.map((lang) => (
                    <div key={lang.id} className="bg-white rounded-brand-lg shadow-card p-5 relative">
                      {cvLanguages.length > 1 && (
                        <button onClick={() => removeCvLanguage(lang.id)}
                          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>{isContentArabic ? 'اللغة' : 'Language'}</label>
                          <select value={lang.language} onChange={(e) => updateCvLanguage(lang.id, 'language', e.target.value)} className={selectClass}>
                            <option value="">{isContentArabic ? 'اختر اللغة' : 'Select Language'}</option>
                            {SAUDI_LANGUAGES.map(l => (
                              <option key={l.nameEn} value={isContentArabic ? l.nameAr : l.nameEn}>
                                {isContentArabic ? l.nameAr : l.nameEn}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>{isContentArabic ? 'مستوى الإتقان' : 'Proficiency'}</label>
                          <select value={lang.proficiency} onChange={(e) => updateCvLanguage(lang.id, 'proficiency', e.target.value)} className={selectClass}>
                            <option value="">{isContentArabic ? 'اختر المستوى' : 'Select Level'}</option>
                            {PROFICIENCY_LEVELS.map(p => (
                              <option key={p.value} value={p.value}>
                                {isContentArabic ? p.labelAr : p.labelEn}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={addCvLanguage}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-brand text-sm font-medium text-gray-500 hover:border-accent-400 hover:text-accent-500 transition-colors flex items-center justify-center gap-2">
                    <FiPlus className="w-4 h-4" />
                    {isContentArabic ? 'إضافة لغة أخرى' : 'Add Language'}
                  </button>
                </div>
              </div>
            )}

            {currentStepId === 'smart-template' && (
              <SmartTemplateRecommendation
                userProfile={{
                  role,
                  yearsOfExperience,
                  jobDomain,
                  experienceCount: experiences.filter(e => e.company || e.position).length,
                  educationCount: educations.filter(e => e.institution || e.degree).length,
                  skillsCount: (skills.technical?.length || 0) + (skills.soft?.length || 0) + (skills.tools?.length || 0),
                  summaryLength: professionalSummary.length,
                }}
                currentTemplate={activeTemplate}
                onSelectTemplate={(templateId) => {
                  setActiveTemplate(templateId);
                  sessionStorage.setItem('selectedTemplate', templateId);
                }}
                isRTL={isRTL}
                isContentArabic={isContentArabic}
                userTier={user?.subscriptionTier || 'free'}
                token={token || undefined}
                cvId={(() => {
                  const editId = typeof window !== 'undefined' ? sessionStorage.getItem('editingCvId') : null;
                  return editId || (primaryCv?.id ? String(primaryCv.id) : undefined);
                })()}
                cvData={{
                  personalInfo: { fullName, email, phone, location: city ? `${city}, ${country || ''}` : '', targetJobTitle: jobTitle, targetJobDomain: jobDomain, nationality: nationality || (country === 'Saudi Arabia' ? (isContentArabic ? 'سعودي' : 'Saudi') : '') },
                  professionalSummary,
                  experience: experiences.filter(e => e.company || e.position).map(e => ({
                    company: e.company, position: e.position, startDate: e.startYear, endDate: e.isCurrent ? 'Present' : e.endYear, description: e.description,
                  })),
                  education: educations.filter(e => e.institution || e.degree).map(e => ({
                    institution: e.institution, degree: e.degree, field: e.field, endDate: e.endYear,
                  })),
                  skills,
                  certifications: certifications.filter(c => c.name).map(c => ({ name: c.name, issuer: c.issuer, date: c.year })),
                  languages: cvLanguages.filter(l => l.language).map(l => ({ name: l.language, proficiency: l.proficiency })),
                }}
                onDownload={handleFinish}
              />
            )}

            {currentStepId === 'summary' && (
              <div className="animate-slideIn">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-accent-50 flex items-center justify-center mx-auto mb-3">
                    <FiFileText className="w-6 h-6 text-accent-500" />
                  </div>
                  <h2 className="font-telegraf text-xl font-bold text-navy-900">
                    {isContentArabic ? 'الملخص المهني' : 'Professional Summary'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {isContentArabic ? 'يتم إنشاؤه تلقائياً بالذكاء الاصطناعي — يمكنك تعديله بحرية' : 'Auto-generated by AI — feel free to edit it'}
                  </p>
                  {user && ((user as any).professionalSummary || primaryCv?.summary) && (
                    <button type="button" onClick={() => handleSyncFromProfile('summary')}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors border border-blue-100">
                      <FiRefreshCw className="w-3 h-3" />
                      {isContentArabic ? 'مزامنة من الملف الشخصي' : 'Sync From Profile'}
                    </button>
                  )}
                </div>

                <div className="bg-white rounded-brand-lg shadow-card p-6" dir={isContentRTL ? 'rtl' : 'ltr'}>
                  {aiLoading ? (
                    <div className="flex flex-col items-center gap-3 py-8">
                      <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center">
                        <FiLoader className="w-5 h-5 text-accent-500 animate-spin" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">
                        {isContentArabic ? 'يقوم الذكاء الاصطناعي بإنشاء ملخصك المهني...' : 'AI is writing your professional summary...'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FiZap className="w-4 h-4 text-accent-500" />
                          <span className="text-sm font-medium text-navy-700">
                            {isContentArabic ? 'ملخصك المهني' : 'Your Professional Summary'}
                          </span>
                        </div>
                        <button type="button" onClick={(e) => handleGenerateAISummary(e)} disabled={aiLoading}
                          className="text-xs px-3 py-1.5 bg-accent-50 text-accent-600 rounded-full hover:bg-accent-100 transition-colors font-medium flex items-center gap-1.5 disabled:opacity-50">
                          {aiLoading ? <FiLoader className="w-3 h-3 animate-spin" /> : <FiRefreshCw className="w-3 h-3" />}
                          {isContentArabic ? 'إعادة إنشاء بالذكاء الاصطناعي' : 'Regenerate with AI'}
                        </button>
                      </div>
                      <textarea value={professionalSummary} onChange={(e) => { setProfessionalSummary(e.target.value); setSummaryMode('manual'); }}
                        placeholder={isContentArabic ? 'اكتب ملخصاً مهنياً مختصراً يبرز خبراتك ومهاراتك الرئيسية...' : 'Write a brief professional summary highlighting your experience and key skills...'}
                        rows={6} className={`${inputClass} resize-none`} />
                      <p className="text-xs text-gray-400 mt-2">
                        {isContentArabic ? 'نصيحة: 3-5 جمل تبرز أبرز إنجازاتك' : 'Tip: 3-5 sentences highlighting your top achievements'}
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {role && currentStep >= 1 && (
            <div className="hidden md:flex gap-4 mt-8">
              <button onClick={handleBack} disabled={navigating}
                className="flex items-center justify-center gap-2 border border-navy-900/20 text-navy-700 rounded-brand px-6 py-3 font-medium hover:bg-gray-50 transition-all min-h-[48px] disabled:opacity-50">
                <ArrowBack className="w-4 h-4" />
                {currentStep === 1 ? (isContentArabic ? 'تغيير الدور' : 'Change Role') : (isContentArabic ? 'رجوع' : 'Back')}
              </button>
              {!isLastStep ? (
                <button onClick={handleNext} disabled={navigating}
                  className="flex-1 flex items-center justify-center gap-2 bg-accent-500 text-white rounded-brand px-8 py-3 font-semibold shadow-brand-soft hover:bg-accent-600 hover:shadow-brand-md transition-all min-h-[48px] disabled:opacity-50">
                  {isContentArabic ? 'التالي' : 'Next'} <ArrowNext className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handleFinish} disabled={generating || navigating}
                  className="flex-1 flex items-center justify-center gap-2 bg-accent-500 text-white rounded-brand px-8 py-3 font-semibold shadow-brand-soft hover:bg-accent-600 hover:shadow-brand-md transition-all min-h-[48px] disabled:opacity-50">
                  {generating ? <FiLoader className="w-5 h-5 animate-spin" /> : <FiCheck className="w-5 h-5" />}
                  {isContentArabic ? 'تحميل سيرتي الذاتية' : 'Download My CV'}
                </button>
              )}
              {!isLastStep && currentStep > 1 && currentStepId !== 'basic' && (
                <button onClick={handleSkip} disabled={navigating}
                  className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 px-4 py-3 text-sm font-medium transition-colors min-h-[48px] disabled:opacity-50">
                  {isContentArabic ? 'تخطي' : 'Skip'}
                </button>
              )}
            </div>
          )}
        </div>

        {role && currentStep >= 1 && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] z-[60] px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="flex gap-3">
              <button onClick={handleBack} disabled={navigating}
                className="flex items-center justify-center gap-1 border border-navy-900/20 text-navy-700 rounded-brand px-4 py-3 font-medium min-h-[48px] disabled:opacity-50">
                <ArrowBack className="w-4 h-4" />
              </button>
              {!isLastStep ? (
                <>
                  <button onClick={handleNext} disabled={navigating}
                    className="flex-1 flex items-center justify-center gap-2 bg-accent-500 text-white rounded-brand px-4 py-3 font-semibold shadow-brand-soft min-h-[48px] disabled:opacity-50">
                    {isContentArabic ? 'التالي' : 'Next'} <ArrowNext className="w-4 h-4" />
                  </button>
                  {currentStep > 1 && currentStepId !== 'basic' && (
                    <button onClick={handleSkip} disabled={navigating}
                      className="flex items-center justify-center text-gray-400 px-3 py-3 text-xs font-medium min-h-[48px] disabled:opacity-50">
                      {isContentArabic ? 'تخطي' : 'Skip'}
                    </button>
                  )}
                </>
              ) : (
                <button onClick={handleFinish} disabled={generating || navigating}
                  className="flex-1 flex items-center justify-center gap-2 bg-accent-500 text-white rounded-brand px-4 py-3 font-semibold shadow-brand-soft min-h-[48px] disabled:opacity-50">
                  {generating ? <FiLoader className="w-5 h-5 animate-spin" /> : <FiCheck className="w-5 h-5" />}
                  {isContentArabic ? 'تحميل سيرتي الذاتية' : 'Download My CV'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {showSyncConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowSyncConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-telegraf text-lg font-bold text-navy-900">
                {isContentArabic ? 'مزامنة من الملف الشخصي' : 'Sync From Profile'}
              </h3>
              <button onClick={() => setShowSyncConfirm(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              {isContentArabic
                ? 'هذه الخطوة تحتوي بالفعل على بيانات. هل تريد استبدالها ببيانات ملفك الشخصي؟'
                : 'This step already has data. Do you want to replace it with your profile data?'}
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowSyncConfirm(false)}
                className="flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-brand font-medium text-sm hover:bg-gray-200 transition-colors">
                {isContentArabic ? 'إلغاء' : 'Cancel'}
              </button>
              <button type="button" onClick={() => {
                if (syncConfirmAction) syncConfirmAction();
                setShowSyncConfirm(false);
                setSyncConfirmAction(null);
              }}
                className="flex-1 py-2.5 px-4 bg-accent-500 text-white rounded-brand font-medium text-sm hover:bg-accent-600 transition-colors flex items-center justify-center gap-1.5">
                <FiRefreshCw className="w-3.5 h-3.5" />
                {isContentArabic ? 'استبدال البيانات' : 'Replace Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {securityWarning && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: '#1e293b',
            color: '#f1f5f9',
            padding: '10px 20px',
            borderRadius: '999px',
            fontSize: '13px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            pointerEvents: 'none',
            animation: 'fadeInUp 0.25s ease-out',
          }}
        >
          <span style={{ fontSize: '15px' }}>🔒</span>
          {isContentArabic
            ? 'المحتوى محمي — لا يمكن نسخه أو تصديره'
            : 'Content is protected — copying and exporting is disabled'}
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slideIn { animation: slideIn 0.35s ease-out; }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
      `}</style>

    </>
  );
}

export default function CreateCVPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
        <FiLoader className="w-8 h-8 animate-spin text-accent-500" />
      </div>
    }>
      <CreateCVContent />
    </Suspense>
  );
}
