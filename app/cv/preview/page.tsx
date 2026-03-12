'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useAuth } from '@/lib/contexts/AuthContext';
import { FiEdit3, FiPlus, FiMinus, FiChevronDown, FiChevronUp, FiDownload, FiLoader, FiCheck, FiArrowLeft, FiArrowRight, FiAlertCircle, FiGlobe, FiType, FiLock, FiStar, FiEye, FiZap } from 'react-icons/fi';
import AuthModal from '@/components/auth/AuthModal';
import RegenerateModal from '@/components/cv/RegenerateModal';

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

const COLOR_THEMES = [
  { name: 'Classic Blue', primary: '#1e3a5f', accent: '#2563eb' },
  { name: 'Forest Green', primary: '#1a4731', accent: '#059669' },
  { name: 'Burgundy', primary: '#4a1420', accent: '#dc2626' },
  { name: 'Purple', primary: '#3b1464', accent: '#7c3aed' },
  { name: 'Teal', primary: '#134e4a', accent: '#0d9488' },
  { name: 'Charcoal', primary: '#1f2937', accent: '#4b5563' },
  { name: 'Navy Gold', primary: '#1e3a5f', accent: '#d97706' },
  { name: 'Rose', primary: '#4c1d3e', accent: '#e11d48' },
];

const ALL_TEMPLATES = [
  { slug: 'simple-professional', name: 'Simple Professional', nameAr: 'بسيط احترافي', isPremium: false },
  { slug: 'minimalist-clean', name: 'Minimalist Clean', nameAr: 'بسيط ونظيف', isPremium: false },
  { slug: 'modern', name: 'Modern', nameAr: 'عصري', isPremium: false },
  { slug: 'smart', name: 'Smart', nameAr: 'ذكي', isPremium: false },
  { slug: 'strong', name: 'Strong', nameAr: 'قوي', isPremium: false },
  { slug: 'elegant', name: 'Elegant', nameAr: 'أنيق', isPremium: false },
  { slug: 'compact', name: 'Compact', nameAr: 'مختصر', isPremium: false },
  { slug: 'two-column-pro', name: 'Two Column Pro', nameAr: 'عمودين احترافي', isPremium: false },
  { slug: 'clean-modern', name: 'Clean Modern', nameAr: 'عصري نظيف', isPremium: false },
  { slug: 'professional-edge', name: 'Professional Edge', nameAr: 'حافة احترافية', isPremium: false },
  { slug: 'metro', name: 'Metro', nameAr: 'مترو', isPremium: false },
  { slug: 'fresh-start', name: 'Fresh Start', nameAr: 'بداية جديدة', isPremium: false },
  { slug: 'nordic', name: 'Nordic', nameAr: 'نورديك', isPremium: false },
  { slug: 'classic', name: 'Classic', nameAr: 'كلاسيكي', isPremium: true },
  { slug: 'executive', name: 'Executive', nameAr: 'تنفيذي', isPremium: true },
  { slug: 'creative', name: 'Creative', nameAr: 'إبداعي', isPremium: true },
  { slug: 'executive-clean-pro', name: 'Executive Clean Pro', nameAr: 'تنفيذي نظيف', isPremium: true },
  { slug: 'structured-sidebar-pro', name: 'Structured Sidebar Pro', nameAr: 'شريط جانبي', isPremium: true },
  { slug: 'global-professional', name: 'Global Professional', nameAr: 'عالمي احترافي', isPremium: true },
  { slug: 'ats-ultra-pro', name: 'ATS Ultra Pro', nameAr: 'ATS فائق', isPremium: true },
];

interface PersonalInfo {
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  nationality?: string;
  targetJobDomain?: string;
  targetJobTitle?: string;
  professionalTitle?: string;
  photo?: string;
}

interface ExperienceItem {
  company?: string;
  position?: string;
  title?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  achievements?: string[];
}

interface EducationItem {
  institution?: string;
  school?: string;
  degree?: string;
  field?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  graduationYear?: string;
  description?: string;
}

interface CertificationItem {
  name?: string;
  title?: string;
  issuer?: string;
  organization?: string;
  date?: string;
}

interface LanguageItem {
  name?: string;
  language?: string;
  level?: string;
  proficiency?: string;
}

interface CVData {
  personalInfo: PersonalInfo;
  summary?: string;
  professionalSummary?: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: any;
  certifications: CertificationItem[];
  languages: LanguageItem[];
}

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

function RichTextEditor({ value, onChange, placeholder, isRTL, onFocus }: { value: string; onChange: (v: string) => void; placeholder?: string; isRTL?: boolean; onFocus?: () => void }) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isItalicActive, setIsItalicActive] = useState(false);
  const [isListActive, setIsListActive] = useState(false);
  const lastValueRef = React.useRef(value);
  const isUserEditing = React.useRef(false);

  useEffect(() => {
    if (editorRef.current && !isUserEditing.current) {
      if (value !== lastValueRef.current) {
        const hasHtml = /<[^>]+>/.test(value);
        editorRef.current.innerHTML = hasHtml ? value : (value || '');
        lastValueRef.current = value;
      } else if (!lastValueRef.current && value) {
        const hasHtml = /<[^>]+>/.test(value);
        editorRef.current.innerHTML = hasHtml ? value : (value || '');
        lastValueRef.current = value;
      } else if (editorRef.current.innerHTML === '' && value) {
        const hasHtml = /<[^>]+>/.test(value);
        editorRef.current.innerHTML = hasHtml ? value : (value || '');
        lastValueRef.current = value;
      }
    }
  }, [value]);

  const execCmd = (cmd: string, val?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, val);
    updateToolbarState();
    handleInput();
  };

  const updateToolbarState = () => {
    setIsBoldActive(document.queryCommandState('bold'));
    setIsItalicActive(document.queryCommandState('italic'));
    setIsListActive(document.queryCommandState('insertUnorderedList'));
  };

  const handleInput = () => {
    if (editorRef.current) {
      isUserEditing.current = true;
      const html = editorRef.current.innerHTML;
      const cleaned = html === '<br>' || html === '<div><br></div>' ? '' : html;
      lastValueRef.current = cleaned;
      onChange(cleaned);
      setTimeout(() => { isUserEditing.current = false; }, 100);
    }
  };

  return (
    <div className="border-2 border-navy-100 rounded-brand overflow-hidden focus-within:ring-2 focus-within:ring-accent-500/20 focus-within:border-accent-500 transition-colors">
      <div className="flex items-center gap-1 px-3 py-2 bg-navy-50/50 border-b border-navy-100">
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); execCmd('bold'); }}
          className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold transition-colors ${isBoldActive ? 'bg-accent-100 text-accent-700' : 'hover:bg-navy-100 text-navy-600'}`}
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); execCmd('italic'); }}
          className={`w-7 h-7 flex items-center justify-center rounded-md text-xs italic transition-colors ${isItalicActive ? 'bg-accent-100 text-accent-700' : 'hover:bg-navy-100 text-navy-600'}`}
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); execCmd('insertUnorderedList'); }}
          className={`w-7 h-7 flex items-center justify-center rounded-md text-xs transition-colors ${isListActive ? 'bg-accent-100 text-accent-700' : 'hover:bg-navy-100 text-navy-600'}`}
          title={isRTL ? 'قائمة نقطية' : 'Bullet List'}
        >
          &#8226;
        </button>
        <div className="w-px h-4 bg-navy-200 mx-1" />
        <span className="text-xs text-navy-400">{isRTL ? 'محرر نصي' : 'Rich Text Editor'}</span>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyUp={updateToolbarState}
        onMouseUp={updateToolbarState}
        onFocus={onFocus}
        dir={isRTL ? 'rtl' : 'ltr'}
        data-placeholder={placeholder}
        className="w-full px-4 py-3 text-sm focus:outline-none min-h-[100px] empty:before:content-[attr(data-placeholder)] empty:before:text-navy-300 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
      />
    </div>
  );
}

function parseCvPayload(parsed: any): CVData {
  const generated = parsed.generatedContent || {};
  const basicInfo = parsed.basicInfo || {};

  const personalInfo: PersonalInfo = {
    fullName: generated.personalInfo?.fullName || basicInfo.fullName || '',
    email: generated.personalInfo?.email || basicInfo.email || '',
    phone: generated.personalInfo?.phone || basicInfo.phone || '',
    location: generated.personalInfo?.location || basicInfo.location || '',
    targetJobDomain: generated.personalInfo?.targetJobDomain || basicInfo.jobDomain || '',
    targetJobTitle: generated.personalInfo?.targetJobTitle || basicInfo.latestJob || '',
    linkedin: generated.personalInfo?.linkedin || '',
    nationality: generated.personalInfo?.nationality || '',
  };

  const skills = generated.skills || { technical: [], soft: [], tools: [] };
  let normalizedSkills: Record<string, string[]>;
  if (Array.isArray(skills)) {
    if (skills.length > 0 && typeof skills[0] === 'object' && skills[0] !== null && ('category' in skills[0] || 'skillsList' in skills[0])) {
      const result: Record<string, string[]> = {};
      skills.forEach((s: any) => {
        const cat = s.category || 'General';
        const list = Array.isArray(s.skillsList) ? s.skillsList : (typeof s.skillsList === 'string' ? s.skillsList.split(',').map((x: string) => x.trim()) : []);
        result[cat] = list;
      });
      normalizedSkills = result;
    } else {
      normalizedSkills = { technical: skills.filter((s: any) => typeof s === 'string'), soft: [], tools: [] };
    }
  } else {
    normalizedSkills = skills;
  }

  const langs = (generated.languages || []).map((l: any) =>
    typeof l === 'string' ? { name: l, level: '' } : l
  );

  const certs = (generated.certifications || []).map((c: any) =>
    typeof c === 'string' ? { name: c } : c
  );

  const normalizedExperience = (generated.experience || []).map((exp: any) => {
    let mergedDescription = '';
    const hasDescription = exp.description && typeof exp.description === 'string' && exp.description.trim();
    const hasAchievements = Array.isArray(exp.achievements) && exp.achievements.length > 0;

    if (hasDescription && hasAchievements) {
      const achievementsList = exp.achievements
        .filter((a: any) => typeof a === 'string' && a.trim())
        .map((a: string) => `<li>${a.trim()}</li>`)
        .join('');
      mergedDescription = `${exp.description.trim()}<ul>${achievementsList}</ul>`;
    } else if (hasAchievements) {
      const achievementsList = exp.achievements
        .filter((a: any) => typeof a === 'string' && a.trim())
        .map((a: string) => `<li>${a.trim()}</li>`)
        .join('');
      mergedDescription = `<ul>${achievementsList}</ul>`;
    } else if (hasDescription) {
      mergedDescription = exp.description.trim();
    }

    return {
      ...exp,
      description: mergedDescription || exp.description || '',
      achievements: [],
    };
  });

  return {
    personalInfo,
    summary: generated.professionalSummary || generated.summary || '',
    professionalSummary: generated.professionalSummary || generated.summary || '',
    experience: normalizedExperience,
    education: generated.education || [],
    skills: normalizedSkills,
    certifications: certs,
    languages: langs,
  };
}

function PreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isRTL, language, setLanguage } = useLanguage();
  const { user, token, refreshUser } = useAuth();
  const isAuthenticated = !!user && !!token;
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [templateSlug, setTemplateSlug] = useState('simple-professional');
  const [templateName, setTemplateName] = useState('');

  const [cvData, setCvData] = useState<CVData>({
    personalInfo: {},
    experience: [],
    education: [],
    skills: { technical: [], soft: [], tools: [] },
    certifications: [],
    languages: [],
  });
  const [selectedColor, setSelectedColor] = useState(COLOR_THEMES[0]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personalInfo: true,
    summary: true,
    experience: true,
    education: true,
    skills: true,
    certifications: false,
    languages: false,
  });
  
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const savedCvIdRef = React.useRef<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestEmail, setGuestEmail] = useState('');
  const [activeSection, setActiveSection] = useState<string>('personalInfo');
  const [scrollTrigger, setScrollTrigger] = useState(0);
  const [previewZoom, setPreviewZoom] = useState(100);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [generatingEduDesc, setGeneratingEduDesc] = useState<number | null>(null);
  const previewScrollRef = React.useRef<HTMLDivElement>(null);
  const handleZoomIn = () => setPreviewZoom(prev => Math.min(prev + 15, 200));
  const handleZoomOut = () => setPreviewZoom(prev => Math.max(prev - 15, 70));
  const handleZoomReset = () => setPreviewZoom(100);
  const scrollPreview = (dir: 'left' | 'right') => {
    const el = previewScrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };
  const templateSliderRef = React.useRef<HTMLDivElement>(null);
  const scrollTemplateSlider = (dir: 'left' | 'right') => {
    const el = templateSliderRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  const isUserPremium = user && ['regular', 'plus', 'annual', 'premium', 'lifetime', 'yearly'].includes(user.subscriptionTier || '');
  const currentTemplateInfo = ALL_TEMPLATES.find(t => t.slug === templateSlug);
  const isCurrentTemplatePremium = currentTemplateInfo?.isPremium && !isUserPremium;
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [regenModal, setRegenModal] = useState<{
    open: boolean;
    fieldType: string;
    fieldLabel: string;
    currentValue: string;
    experienceIndex?: number;
  }>({ open: false, fieldType: '', fieldLabel: '', currentValue: '' });
  const [regenLoading, setRegenLoading] = useState(false);
  const [regenError, setRegenError] = useState<string | null>(null);
  const [regenVariations, setRegenVariations] = useState<Array<{ title: string; text: string }>>([]);
  const [successToast, setSuccessToast] = useState(false);

  const isDirtyRef = useRef(false);
  const isNewCvCreationRef = useRef(false);
  const rawDbPersonalInfoRef = useRef<any>(null);
  const lastConfirmedTemplateRef = useRef<string>('simple-professional');
  const templateChangedExplicitlyRef = useRef(false);
  const markDirty = useCallback(() => {
    isDirtyRef.current = true;
  }, []);

  const handleTemplateSelect = useCallback((slug: string) => {
    const tmpl = ALL_TEMPLATES.find(t => t.slug === slug);
    if (!tmpl) return;

    if (tmpl.isPremium && !isUserPremium) {
      setShowUpgradeModal(true);
      return;
    }

    lastConfirmedTemplateRef.current = slug;
    templateChangedExplicitlyRef.current = true;
    markDirty();
    setTemplateSlug(slug);
    setTemplateName(tmpl.name);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedTemplate', slug);
      sessionStorage.setItem('selectedTemplateName', tmpl.name);
    }
  }, [markDirty, isUserPremium]);

  useEffect(() => {
    const container = previewScrollRef.current;
    if (!container) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    container.addEventListener('contextmenu', handleContextMenu);
    container.addEventListener('dragstart', handleDragStart);
    container.addEventListener('copy', handleCopy);
    return () => {
      container.removeEventListener('contextmenu', handleContextMenu);
      container.removeEventListener('dragstart', handleDragStart);
      container.removeEventListener('copy', handleCopy);
    };
  }, [loading]);

  const [cvDirection, setCvDirection] = useState<'ltr' | 'rtl'>('ltr');
  const [englishCvData, setEnglishCvData] = useState<CVData | null>(null);
  const [arabicCvData, setArabicCvData] = useState<CVData | null>(null);
  const [currentCvLanguage, setCurrentCvLanguage] = useState<'en' | 'ar'>('en');

  const cvIsRTL = cvDirection === 'rtl';
  const cvIsArabic = currentCvLanguage === 'ar';

  useEffect(() => {
    const paramTemplate = searchParams.get('template');

    initialSyncDone.current = false;

    if (isAuthenticated && token) {
      setGuestEmail('');

      const freshCvData = typeof window !== 'undefined' ? sessionStorage.getItem('generatedCvData') : null;
      if (freshCvData) {
        console.log('[DataLoad] Authenticated user with fresh create-flow data, using sessionStorage');
        sessionStorage.removeItem('guestEmail');
        try {
          const parsed = JSON.parse(freshCvData);
          sessionStorage.removeItem('generatedCvData');
          isNewCvCreationRef.current = true;
          sessionStorage.setItem('newCvCreationInProgress', 'true');

          let enParsed = null;
          let arParsed = null;
          if (parsed.englishContent) {
            enParsed = parseCvPayload({ generatedContent: parsed.englishContent });
            setEnglishCvData(enParsed);
            englishCvDataRef.current = enParsed;
          }
          if (parsed.arabicContent) {
            arParsed = parseCvPayload({ generatedContent: parsed.arabicContent });
            setArabicCvData(arParsed);
            arabicCvDataRef.current = arParsed;
          }

          const savedCvLang = typeof window !== 'undefined' ? sessionStorage.getItem('cvContentLanguage') as 'en' | 'ar' | null : null;
          const savedCvDir = typeof window !== 'undefined' ? sessionStorage.getItem('cvContentDirection') as 'ltr' | 'rtl' | null : null;
          const isArabicLang = parsed.language === 'ar' || savedCvLang === 'ar';
          if (isArabicLang) {
            setCurrentCvLanguage('ar');
            setCvDirection(savedCvDir || 'rtl');
          } else {
            setCurrentCvLanguage(savedCvLang || 'en');
            setCvDirection(savedCvDir || parsed.textDirection || 'ltr');
          }

          const langCorrectData = isArabicLang
            ? (arParsed || parseCvPayload(parsed))
            : (enParsed || parseCvPayload(parsed));
          setCvData(langCorrectData);
          cvDataRef.current = langCorrectData;

          const storedTemplate = typeof window !== 'undefined' ? sessionStorage.getItem('selectedTemplate') : null;
          const slug = paramTemplate || storedTemplate || 'simple-professional';
          setTemplateSlug(slug);
          setTemplateName(slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
          lastConfirmedTemplateRef.current = slug;

          const migratedCvId = typeof window !== 'undefined' ? sessionStorage.getItem('migratedCvId') : null;
          if (migratedCvId) {
            const parsed = parseInt(migratedCvId, 10);
            if (!isNaN(parsed)) {
              savedCvIdRef.current = parsed;
              sessionStorage.setItem('editingCvId', migratedCvId);
            }
            sessionStorage.removeItem('migratedCvId');
            isNewCvCreationRef.current = false;
            sessionStorage.removeItem('newCvCreationInProgress');
          }

          isDirtyRef.current = true;
          setLoading(false);
        } catch (e) {
          console.error('[DataLoad] Failed to parse fresh CV data:', e);
          sessionStorage.removeItem('generatedCvData');
        }
        return;
      }

      sessionStorage.removeItem('guestEmail');
      sessionStorage.removeItem('generatedCvData');

      const isNewCreation = typeof window !== 'undefined' ? sessionStorage.getItem('newCvCreationInProgress') : null;
      if (isNewCreation) {
        sessionStorage.removeItem('newCvCreationInProgress');
        isNewCvCreationRef.current = true;
        isDirtyRef.current = true;
        setLoading(false);
        return;
      }

      const storedCvId = typeof window !== 'undefined' ? sessionStorage.getItem('editingCvId') : null;
      fetch('/api/cvs', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          const userCvs = data.cvs || [];
          if (userCvs.length > 0) {
            let matchingCv = null;
            if (storedCvId) {
              matchingCv = userCvs.find((c: any) => String(c.id) === storedCvId);
            }
            if (!matchingCv && !storedCvId) {
              matchingCv = userCvs[userCvs.length - 1];
            }
            if (!matchingCv) {
              sessionStorage.removeItem('editingCvId');
              setLoading(false);
              return;
            }
            savedCvIdRef.current = matchingCv.id;
            sessionStorage.setItem('editingCvId', String(matchingCv.id));

            const pi = typeof matchingCv.personalInfo === 'string' ? JSON.parse(matchingCv.personalInfo) : matchingCv.personalInfo;
            if (pi) {
              rawDbPersonalInfoRef.current = JSON.parse(JSON.stringify(pi));
              const savedCvLang = typeof window !== 'undefined' ? sessionStorage.getItem('cvContentLanguage') as 'en' | 'ar' | null : null;
              const savedCvDir = typeof window !== 'undefined' ? sessionStorage.getItem('cvContentDirection') as 'ltr' | 'rtl' | null : null;
              const dbLang = savedCvLang || matchingCv.language || 'en';
              const dbDir = savedCvDir || matchingCv.textDirection || 'ltr';

              let parsedEnglish = null;
              let parsedArabic = null;
              if (pi.englishContent) {
                console.log('[DataLoad] Setting englishCvData from DB englishContent');
                parsedEnglish = parseCvPayload({ generatedContent: pi.englishContent });
                setEnglishCvData(parsedEnglish);
                englishCvDataRef.current = parsedEnglish;
              }
              if (pi.arabicContent) {
                console.log('[DataLoad] Setting arabicCvData from DB arabicContent');
                parsedArabic = parseCvPayload({ generatedContent: pi.arabicContent });
                setArabicCvData(parsedArabic);
                arabicCvDataRef.current = parsedArabic;

                const arSummary = pi.arabicContent.professionalSummary || '';
                const enSummary = pi.englishContent?.professionalSummary || '';
                const arabicScriptInSummary = /[\u0600-\u06FF]/.test(arSummary);
                const firstArExp = (pi.arabicContent.experience || [])[0];
                const firstEnExp = (pi.englishContent?.experience || [])[0];
                const arExpDesc = firstArExp?.description || firstArExp?.responsibilities?.join(' ') || '';
                const arabicScriptInExp = !arExpDesc || /[\u0600-\u06FF]/.test(arExpDesc);
                const arabicScriptPresent = arabicScriptInSummary && arabicScriptInExp;
                const hasEnContent = !!(enSummary || firstEnExp?.description || (firstEnExp?.responsibilities?.length > 0));
                if (!arabicScriptPresent && hasEnContent && !arabicRepairAttemptedRef.current) {
                  arabicRepairAttemptedRef.current = true;
                  const srcForRepair = pi.englishContent;
                  setTimeout(async () => {
                    try {
                      const repairRes = await fetch('/api/ai/translate-content', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ targetLanguage: 'ar', content: srcForRepair }),
                      });
                      if (!repairRes.ok) return;
                      const repairData = await repairRes.json();
                      const t = repairData.translated || {};
                      const repairedArabic = {
                        ...srcForRepair,
                        personalInfo: {
                          ...srcForRepair.personalInfo,
                          targetJobTitle: t.targetJobTitle || srcForRepair.personalInfo?.targetJobTitle,
                          targetJobDomain: t.targetJobDomain || srcForRepair.personalInfo?.targetJobDomain,
                          location: t.location || srcForRepair.personalInfo?.location,
                          nationality: t.nationality || srcForRepair.personalInfo?.nationality,
                        },
                        professionalSummary: t.summary || srcForRepair.professionalSummary,
                        experience: (srcForRepair.experience || []).map((exp: any, idx: number) => {
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
                        education: (srcForRepair.education || []).map((edu: any, idx: number) => ({
                          ...edu,
                          degree: t.education?.[idx]?.degree || edu.degree,
                          field: t.education?.[idx]?.field || edu.field,
                          fieldOfStudy: t.education?.[idx]?.field || edu.fieldOfStudy,
                          description: t.education?.[idx]?.description || edu.description,
                        })),
                        skills: t.skills ? {
                          technical: t.skills.technical || srcForRepair.skills?.technical || [],
                          soft: t.skills.soft || srcForRepair.skills?.soft || [],
                          tools: t.skills.tools || srcForRepair.skills?.tools || [],
                        } : srcForRepair.skills,
                      };
                      const repairedParsed = parseCvPayload({ generatedContent: repairedArabic });
                      setArabicCvData(repairedParsed);
                      arabicCvDataRef.current = repairedParsed;
                      if (rawDbPersonalInfoRef.current) {
                        rawDbPersonalInfoRef.current.arabicContent = repairedArabic;
                      }
                      markDirty();
                      console.log('[BilingualRepair] Arabic content repaired and marked dirty for save');
                    } catch (repairErr) {
                      console.error('[BilingualRepair] Failed:', repairErr);
                    }
                  }, 2000);
                }
              }

              if (!parsedArabic && matchingCv.contentAr) {
                console.log('[DataLoad] Setting arabicCvData from DB contentAr');
                const arContent = typeof matchingCv.contentAr === 'string' ? JSON.parse(matchingCv.contentAr) : matchingCv.contentAr;
                parsedArabic = parseCvPayload(arContent);
                setArabicCvData(parsedArabic);
                arabicCvDataRef.current = parsedArabic;
              }

              const topLevelHasContent = (pi.experience && pi.experience.length > 0) || (pi.education && pi.education.length > 0);

              let hasRelatedTableData = false;
              let relatedExperience: any[] = [];
              let relatedEducation: any[] = [];
              let relatedSkills: any = {};

              if (!parsedEnglish && !parsedArabic && !topLevelHasContent) {
                const expRecords = matchingCv.experienceRecords || [];
                const eduRecords = matchingCv.educationRecords || [];
                const skillsRecords = matchingCv.skillsRecords || [];

                if (expRecords.length > 0 || eduRecords.length > 0 || skillsRecords.length > 0) {
                  hasRelatedTableData = true;
                  relatedExperience = expRecords.map((exp: any) => ({
                    company: exp.company || '',
                    position: exp.position || '',
                    location: exp.location || '',
                    startDate: exp.startDate || '',
                    endDate: exp.endDate || '',
                    description: exp.description || '',
                    achievements: typeof exp.achievements === 'string' ? JSON.parse(exp.achievements) : (exp.achievements || []),
                  }));
                  relatedEducation = eduRecords.map((edu: any) => ({
                    institution: edu.institution || '',
                    degree: edu.degree || '',
                    field: edu.field || '',
                    startDate: edu.startDate || '',
                    endDate: edu.endDate || '',
                    description: edu.description || '',
                  }));
                  const skillsObj: Record<string, string[]> = {};
                  skillsRecords.forEach((s: any) => {
                    const list = typeof s.skillsList === 'string' ? JSON.parse(s.skillsList) : (s.skillsList || []);
                    skillsObj[s.category || 'General'] = list;
                  });
                  relatedSkills = skillsObj;
                  console.log('[DataLoad] Reconstructed from related tables:', relatedExperience.length, 'exp,', relatedEducation.length, 'edu');
                }
              }

              let restoredData: any;
              const langContent = dbLang === 'ar' ? (parsedArabic || parsedEnglish) : (parsedEnglish || parsedArabic);

              if (langContent) {
                restoredData = langContent;
                console.log('[DataLoad] Using language-specific content for cvData, lang:', dbLang);
              } else {
                const baseContent = {
                  personalInfo: {
                    fullName: pi.fullName || pi.name || '',
                    name: pi.name || pi.fullName || '',
                    email: pi.email || '',
                    phone: pi.phone || '',
                    location: pi.location || '',
                    targetJobTitle: pi.targetJobTitle || pi.jobTitle || '',
                    targetJobDomain: pi.targetJobDomain || pi.jobDomain || '',
                    linkedin: pi.linkedin || '',
                    website: pi.website || '',
                    nationality: pi.nationality || '',
                  },
                  professionalSummary: pi.professionalSummary || matchingCv.summary || '',
                  experience: hasRelatedTableData ? relatedExperience : (pi.experience || []),
                  education: hasRelatedTableData ? relatedEducation : (pi.education || []),
                  skills: hasRelatedTableData ? relatedSkills : (pi.skills || []),
                  certifications: pi.certifications || [],
                  languages: pi.languages || [],
                };
                restoredData = parseCvPayload({ generatedContent: baseContent });
                console.log('[DataLoad] Using reconstructed content for cvData, hasRelatedData:', hasRelatedTableData);

                if (restoredData.experience.length > 0 || restoredData.education.length > 0) {
                  console.log('[DataLoad] Setting both language contents from reconstructed data');
                  setEnglishCvData(restoredData);
                  englishCvDataRef.current = restoredData;
                  setArabicCvData(restoredData);
                  arabicCvDataRef.current = restoredData;
                  parsedEnglish = restoredData;
                  parsedArabic = restoredData;
                }
              }
              setCvData(restoredData);
              cvDataRef.current = restoredData;

              setCurrentCvLanguage(dbLang);
              setCvDirection(dbDir);

              const dbTemplateSlug = matchingCv.templateId || pi.templateSlug || paramTemplate || 'simple-professional';
              const isNumericTemplate = typeof dbTemplateSlug === 'number' || /^\d+$/.test(String(dbTemplateSlug));
              const finalSlug = isNumericTemplate ? 'simple-professional' : dbTemplateSlug;
              setTemplateSlug(finalSlug);
              setTemplateName(finalSlug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
              lastConfirmedTemplateRef.current = finalSlug;

              if (pi.colorSettings) {
                setSelectedColor(pi.colorSettings);
              }
            }
          } else if (paramTemplate) {
            setTemplateSlug(paramTemplate);
            setTemplateName(paramTemplate.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
      return;
    }

    const storedTemplate = typeof window !== 'undefined' ? sessionStorage.getItem('selectedTemplate') : null;
    const storedName = typeof window !== 'undefined' ? sessionStorage.getItem('selectedTemplateName') : null;
    const slug = paramTemplate || storedTemplate || 'simple-professional';
    setTemplateSlug(slug);
    setTemplateName(storedName || slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
    lastConfirmedTemplateRef.current = slug;

    const storedData = typeof window !== 'undefined' ? sessionStorage.getItem('generatedCvData') : null;
    const storedEmail = typeof window !== 'undefined' ? sessionStorage.getItem('guestEmail') : null;

    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);

        let guestEnParsed = null;
        let guestArParsed = null;
        if (parsed.englishContent) {
          guestEnParsed = parseCvPayload({ generatedContent: parsed.englishContent });
          setEnglishCvData(guestEnParsed);
          englishCvDataRef.current = guestEnParsed;
        }
        if (parsed.arabicContent) {
          guestArParsed = parseCvPayload({ generatedContent: parsed.arabicContent });
          setArabicCvData(guestArParsed);
          arabicCvDataRef.current = guestArParsed;
        }

        const storedContentAr = typeof window !== 'undefined' ? sessionStorage.getItem('cvContentAr') : null;
        if (storedContentAr && !parsed.arabicContent) {
          try {
            const arData = JSON.parse(storedContentAr);
            guestArParsed = parseCvPayload(arData);
            setArabicCvData(guestArParsed);
            arabicCvDataRef.current = guestArParsed;
            console.log('[Preview] Loaded Arabic content from cvContentAr storage');
          } catch (e) {
            console.error('[Preview] Failed to parse cvContentAr from storage');
          }
        }

        const savedCvLang = typeof window !== 'undefined' ? sessionStorage.getItem('cvContentLanguage') as 'en' | 'ar' | null : null;
        const savedCvDir = typeof window !== 'undefined' ? sessionStorage.getItem('cvContentDirection') as 'ltr' | 'rtl' | null : null;

        let guestIsArabic = false;
        if (parsed.language === 'ar') {
          guestIsArabic = true;
          setCurrentCvLanguage('ar');
          setCvDirection('rtl');
        } else if (savedCvLang) {
          guestIsArabic = savedCvLang === 'ar';
          setCurrentCvLanguage(savedCvLang);
          setCvDirection(savedCvDir || (savedCvLang === 'ar' ? 'rtl' : 'ltr'));
        } else if (parsed.language) {
          guestIsArabic = parsed.language === 'ar';
          setCurrentCvLanguage(parsed.language);
          setCvDirection(parsed.textDirection || 'ltr');
        }

        const guestLangData = guestIsArabic
          ? (guestArParsed || parseCvPayload(parsed))
          : (guestEnParsed || parseCvPayload(parsed));
        setCvData(guestLangData);
        cvDataRef.current = guestLangData;
      } catch (e) {
        console.error('Failed to parse stored CV data:', e);
      }
    }

    if (storedEmail && !isAuthenticated) {
      setGuestEmail(storedEmail);
      if (!storedData) {
        fetchGuestCv(storedEmail);
        return;
      }
    }

    setLoading(false);
  }, [searchParams, isAuthenticated, token]);

  async function fetchGuestCv(email: string) {
    try {
      const res = await fetch('/api/guest-cv/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.found && result.data?.cvData) {
          const parsed = typeof result.data.cvData === 'string' ? JSON.parse(result.data.cvData) : result.data.cvData;
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('generatedCvData', JSON.stringify(parsed));
          }

          let fetchEnParsed = null;
          let fetchArParsed = null;
          if (parsed.englishContent) {
            fetchEnParsed = parseCvPayload({ generatedContent: parsed.englishContent });
            setEnglishCvData(fetchEnParsed);
            englishCvDataRef.current = fetchEnParsed;
          }
          if (parsed.arabicContent) {
            fetchArParsed = parseCvPayload({ generatedContent: parsed.arabicContent });
            setArabicCvData(fetchArParsed);
            arabicCvDataRef.current = fetchArParsed;
          }
          if (result.data.templateId) {
            setTemplateSlug(result.data.templateId);
            setTemplateName(result.data.templateId.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
          }

          let fetchIsArabic = false;
          if (parsed.language === 'ar') {
            fetchIsArabic = true;
            setCurrentCvLanguage('ar');
            setCvDirection('rtl');
          } else if (parsed.language) {
            fetchIsArabic = parsed.language === 'ar';
            setCurrentCvLanguage(parsed.language);
            setCvDirection(parsed.textDirection || 'ltr');
          }

          const fetchLangData = fetchIsArabic
            ? (fetchArParsed || parseCvPayload(parsed))
            : (fetchEnParsed || parseCvPayload(parsed));
          setCvData(fetchLangData);
          cvDataRef.current = fetchLangData;
        }
      }
    } catch (e) {
      console.error('Failed to fetch guest CV:', e);
    } finally {
      setLoading(false);
    }
  }

  const cvDataRef = React.useRef(cvData);
  const englishCvDataRef = React.useRef(englishCvData);
  const arabicCvDataRef = React.useRef(arabicCvData);
  const currentCvLanguageRef = React.useRef(currentCvLanguage);
  const [translatingPreview, setTranslatingPreview] = React.useState(false);
  useEffect(() => { cvDataRef.current = cvData; }, [cvData]);
  useEffect(() => { englishCvDataRef.current = englishCvData; }, [englishCvData]);
  useEffect(() => { arabicCvDataRef.current = arabicCvData; }, [arabicCvData]);
  useEffect(() => { currentCvLanguageRef.current = currentCvLanguage; }, [currentCvLanguage]);

  const isContentSameLanguage = React.useCallback((dataA: CVData | null, dataB: CVData | null): boolean => {
    if (!dataA || !dataB) return false;
    const summaryA = (dataA.professionalSummary || '').trim();
    const summaryB = (dataB.professionalSummary || '').trim();
    if (summaryA && summaryB && summaryA === summaryB) return true;
    const expA = dataA.experience?.[0];
    const expB = dataB.experience?.[0];
    if (expA && expB) {
      const descA = (expA.description || (expA as any).responsibilities?.join(' ') || '').trim();
      const descB = (expB.description || (expB as any).responsibilities?.join(' ') || '').trim();
      if (descA && descB && descA === descB) return true;
    }
    return false;
  }, []);

  const translateAndSwitch = React.useCallback(async (targetLang: 'en' | 'ar', sourceData: CVData) => {
    setTranslatingPreview(true);
    try {
      const res = await fetch('/api/ai/translate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetLanguage: targetLang,
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
          targetJobDomain: translated.targetJobDomain || sourceData.personalInfo?.targetJobDomain || '',
          nationality: translated.nationality || sourceData.personalInfo?.nationality || '',
          location: translated.location || sourceData.personalInfo?.location || '',
        },
        professionalSummary: translated.summary || sourceData.professionalSummary || '',
        experience: (sourceData.experience || []).map((exp: any, i: number) => {
          const tExp = Array.isArray(translated.experience) && i < translated.experience.length ? translated.experience[i] : null;
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
            position: tExp?.position || exp.position || '',
            description: translatedDescription,
            location: tExp?.location || exp.location || '',
            responsibilities: [],
            achievements: [],
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
      } as CVData;

      if (targetLang === 'ar') {
        setArabicCvData(translatedCvData);
        arabicCvDataRef.current = translatedCvData;
        setEnglishCvData(JSON.parse(JSON.stringify(sourceData)));
        englishCvDataRef.current = JSON.parse(JSON.stringify(sourceData));
        sessionStorage.setItem('cvContentAr', JSON.stringify(translatedCvData));
      } else {
        setEnglishCvData(translatedCvData);
        englishCvDataRef.current = translatedCvData;
        setArabicCvData(JSON.parse(JSON.stringify(sourceData)));
        arabicCvDataRef.current = JSON.parse(JSON.stringify(sourceData));
        sessionStorage.setItem('generatedCV', JSON.stringify(translatedCvData));
        sessionStorage.setItem('cvContentAr', JSON.stringify(sourceData));
      }
      setCvData(translatedCvData);
      cvDataRef.current = translatedCvData;
      setCvDirection(targetLang === 'ar' ? 'rtl' : 'ltr');
      setCurrentCvLanguage(targetLang);
      currentCvLanguageRef.current = targetLang;
      sessionStorage.setItem('cvContentLanguage', targetLang);
      sessionStorage.setItem('cvContentDirection', targetLang === 'ar' ? 'rtl' : 'ltr');
      needsBilingualSyncRef.current = false;
      markDirty();
      console.log('[Preview] Translation applied successfully for', targetLang);
    } catch (error) {
      console.error('[Preview] Translation error:', error);
    } finally {
      setTranslatingPreview(false);
    }
  }, [markDirty]);

  const switchCvLanguage = React.useCallback((targetLang: 'en' | 'ar') => {
    console.log(`[LangSwitch] switchCvLanguage called: target=${targetLang}, current=${currentCvLanguageRef.current}, hasEnglish=${!!englishCvDataRef.current}, hasArabic=${!!arabicCvDataRef.current}`);
    if (currentCvLanguageRef.current === targetLang) {
      console.log('[LangSwitch] Skipping - already on target language');
      return;
    }

    const currentData = cvDataRef.current;
    const targetRef = targetLang === 'ar' ? arabicCvDataRef.current : englishCvDataRef.current;

    const contentWasEdited = needsBilingualSyncRef.current;
    const needsTranslation = !targetRef
      || isContentSameLanguage(englishCvDataRef.current, arabicCvDataRef.current)
      || contentWasEdited;

    if (needsTranslation) {
      console.log(`[LangSwitch] Translation needed (edited=${contentWasEdited}) - calling API`);
      const sourceData = JSON.parse(JSON.stringify(currentData));
      translateAndSwitch(targetLang, sourceData);
      return;
    }

    const clonedCurrent = JSON.parse(JSON.stringify(currentData));
    if (targetLang === 'ar') {
      setEnglishCvData(clonedCurrent);
      englishCvDataRef.current = clonedCurrent;
      const arabicData = JSON.parse(JSON.stringify(arabicCvDataRef.current));
      setCvData(arabicData);
      cvDataRef.current = arabicData;
      setCvDirection('rtl');
      setCurrentCvLanguage('ar');
      currentCvLanguageRef.current = 'ar';
      sessionStorage.setItem('cvContentLanguage', 'ar');
      sessionStorage.setItem('cvContentDirection', 'rtl');
    } else {
      setArabicCvData(clonedCurrent);
      arabicCvDataRef.current = clonedCurrent;
      const englishData = JSON.parse(JSON.stringify(englishCvDataRef.current));
      setCvData(englishData);
      cvDataRef.current = englishData;
      setCvDirection('ltr');
      setCurrentCvLanguage('en');
      currentCvLanguageRef.current = 'en';
      sessionStorage.setItem('cvContentLanguage', 'en');
      sessionStorage.setItem('cvContentDirection', 'ltr');
    }
  }, [isContentSameLanguage, translateAndSwitch]);

  const initialSyncDone = React.useRef(false);
  useEffect(() => {
    if (initialSyncDone.current) return;
    if (!englishCvData || !arabicCvData) return;
    initialSyncDone.current = true;
    if (currentCvLanguage === 'ar') {
      const arabicData = JSON.parse(JSON.stringify(arabicCvData));
      setCvData(arabicData);
      cvDataRef.current = arabicData;
      setCvDirection('rtl');
    } else {
      const englishData = JSON.parse(JSON.stringify(englishCvData));
      setCvData(englishData);
      cvDataRef.current = englishData;
      setCvDirection('ltr');
    }
    currentCvLanguageRef.current = currentCvLanguage;
    sessionStorage.setItem('cvContentLanguage', currentCvLanguage);
    sessionStorage.setItem('cvContentDirection', currentCvLanguage === 'ar' ? 'rtl' : 'ltr');
  }, [englishCvData, arabicCvData, currentCvLanguage]);

  const SECTION_ORDER = ['personalInfo', 'summary', 'experience', 'education', 'skills', 'certifications', 'languages'];
  const prevSectionRef = React.useRef<string>('personalInfo');

  const scrollToPreviewSection = (section: string) => {
    setActiveSection(section);
    setScrollTrigger(prev => prev + 1);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newState = { ...prev, [section]: !prev[section] };
      if (newState[section]) {
        scrollToPreviewSection(section);
      }
      return newState;
    });
  };

  useEffect(() => {
    if (!activeSection) return;
    const container = previewScrollRef.current;
    if (!container) return;

    prevSectionRef.current = activeSection;

    const timeout = setTimeout(() => {
      const sectionEl = container.querySelector(`[data-cv-section="${activeSection}"]`) as HTMLElement;
      if (!sectionEl) return;

      const scale = previewZoom / 100;
      const containerRect = container.getBoundingClientRect();
      const sectionRect = sectionEl.getBoundingClientRect();
      const sectionTopRelative = (sectionRect.top - containerRect.top) / scale;
      const targetScrollTop = container.scrollTop + sectionTopRelative - 20;
      container.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
    }, 150);
    return () => clearTimeout(timeout);
  }, [activeSection, scrollTrigger, previewZoom]);

  const updatePersonalInfo = (field: string, value: string) => {
    markDirty();
    setCvData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const EXP_STRUCTURAL_FIELDS = ['company', 'startDate', 'endDate', 'location', 'isCurrent'];
  const EXP_TRANSLATABLE_FIELDS = ['description', 'position', 'title'];
  const EDU_STRUCTURAL_FIELDS = ['institution', 'school', 'startDate', 'endDate'];
  const EDU_TRANSLATABLE_FIELDS = ['degree', 'field', 'fieldOfStudy', 'description'];

  const updateExperience = (index: number, field: string, value: any) => {
    markDirty();

    if (EXP_TRANSLATABLE_FIELDS.includes(field)) {
      needsBilingualSyncRef.current = true;
      const curLang = currentCvLanguageRef.current;
      if (curLang === 'en' && englishCvDataRef.current?.experience?.[index] !== undefined) {
        const copy = JSON.parse(JSON.stringify(englishCvDataRef.current));
        copy.experience[index] = { ...copy.experience[index], [field]: value };
        englishCvDataRef.current = copy;
        setEnglishCvData(copy);
      } else if (curLang === 'ar' && arabicCvDataRef.current?.experience?.[index] !== undefined) {
        const copy = JSON.parse(JSON.stringify(arabicCvDataRef.current));
        copy.experience[index] = { ...copy.experience[index], [field]: value };
        arabicCvDataRef.current = copy;
        setArabicCvData(copy);
      }
    } else if (EXP_STRUCTURAL_FIELDS.includes(field)) {
      if (englishCvDataRef.current?.experience?.[index] !== undefined) {
        const enCopy = JSON.parse(JSON.stringify(englishCvDataRef.current));
        enCopy.experience[index] = { ...enCopy.experience[index], [field]: value };
        englishCvDataRef.current = enCopy;
        setEnglishCvData(enCopy);
      }
      if (arabicCvDataRef.current?.experience?.[index] !== undefined) {
        const arCopy = JSON.parse(JSON.stringify(arabicCvDataRef.current));
        arCopy.experience[index] = { ...arCopy.experience[index], [field]: value };
        arabicCvDataRef.current = arCopy;
        setArabicCvData(arCopy);
      }
    }

    setCvData(prev => {
      const updated = [...prev.experience];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experience: updated };
    });
  };

  const addExperience = () => {
    markDirty();
    const blank = { company: '', position: '', startDate: '', endDate: '', description: '', achievements: [] };
    setCvData(prev => ({ ...prev, experience: [...prev.experience, blank] }));
    if (englishCvDataRef.current) {
      const enCopy = JSON.parse(JSON.stringify(englishCvDataRef.current));
      enCopy.experience = [...(enCopy.experience || []), blank];
      englishCvDataRef.current = enCopy;
      setEnglishCvData(enCopy);
    }
    if (arabicCvDataRef.current) {
      const arCopy = JSON.parse(JSON.stringify(arabicCvDataRef.current));
      arCopy.experience = [...(arCopy.experience || []), blank];
      arabicCvDataRef.current = arCopy;
      setArabicCvData(arCopy);
    }
  };

  const removeExperience = (index: number) => {
    markDirty();
    setCvData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));
    if (englishCvDataRef.current) {
      const enCopy = JSON.parse(JSON.stringify(englishCvDataRef.current));
      enCopy.experience = (enCopy.experience || []).filter((_: any, i: number) => i !== index);
      englishCvDataRef.current = enCopy;
      setEnglishCvData(enCopy);
    }
    if (arabicCvDataRef.current) {
      const arCopy = JSON.parse(JSON.stringify(arabicCvDataRef.current));
      arCopy.experience = (arCopy.experience || []).filter((_: any, i: number) => i !== index);
      arabicCvDataRef.current = arCopy;
      setArabicCvData(arCopy);
    }
  };

  const addAchievement = (expIndex: number) => {
    markDirty();
    setCvData(prev => {
      const updated = [...prev.experience];
      const achievements = [...(updated[expIndex].achievements || []), ''];
      updated[expIndex] = { ...updated[expIndex], achievements };
      return { ...prev, experience: updated };
    });
  };

  const removeAchievement = (expIndex: number, achIndex: number) => {
    markDirty();
    setCvData(prev => {
      const updated = [...prev.experience];
      const achievements = (updated[expIndex].achievements || []).filter((_, i) => i !== achIndex);
      updated[expIndex] = { ...updated[expIndex], achievements };
      return { ...prev, experience: updated };
    });
  };

  const updateAchievement = (expIndex: number, achIndex: number, value: string) => {
    markDirty();
    setCvData(prev => {
      const updated = [...prev.experience];
      const achievements = [...(updated[expIndex].achievements || [])];
      achievements[achIndex] = value;
      updated[expIndex] = { ...updated[expIndex], achievements };
      return { ...prev, experience: updated };
    });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    markDirty();

    if (EDU_TRANSLATABLE_FIELDS.includes(field)) {
      needsBilingualSyncRef.current = true;
      const curLang = currentCvLanguageRef.current;
      if (curLang === 'en' && englishCvDataRef.current?.education?.[index] !== undefined) {
        const copy = JSON.parse(JSON.stringify(englishCvDataRef.current));
        copy.education[index] = { ...copy.education[index], [field]: value };
        englishCvDataRef.current = copy;
        setEnglishCvData(copy);
      } else if (curLang === 'ar' && arabicCvDataRef.current?.education?.[index] !== undefined) {
        const copy = JSON.parse(JSON.stringify(arabicCvDataRef.current));
        copy.education[index] = { ...copy.education[index], [field]: value };
        arabicCvDataRef.current = copy;
        setArabicCvData(copy);
      }
    } else if (EDU_STRUCTURAL_FIELDS.includes(field)) {
      if (englishCvDataRef.current?.education?.[index] !== undefined) {
        const enCopy = JSON.parse(JSON.stringify(englishCvDataRef.current));
        enCopy.education[index] = { ...enCopy.education[index], [field]: value };
        englishCvDataRef.current = enCopy;
        setEnglishCvData(enCopy);
      }
      if (arabicCvDataRef.current?.education?.[index] !== undefined) {
        const arCopy = JSON.parse(JSON.stringify(arabicCvDataRef.current));
        arCopy.education[index] = { ...arCopy.education[index], [field]: value };
        arabicCvDataRef.current = arCopy;
        setArabicCvData(arCopy);
      }
    }

    setCvData(prev => {
      const updated = [...prev.education];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, education: updated };
    });
  };

  const addEducation = () => {
    markDirty();
    const blank = { institution: '', degree: '', field: '', startDate: '', endDate: '', description: '' };
    setCvData(prev => ({ ...prev, education: [...prev.education, blank] }));
    if (englishCvDataRef.current) {
      const enCopy = JSON.parse(JSON.stringify(englishCvDataRef.current));
      enCopy.education = [...(enCopy.education || []), blank];
      englishCvDataRef.current = enCopy;
      setEnglishCvData(enCopy);
    }
    if (arabicCvDataRef.current) {
      const arCopy = JSON.parse(JSON.stringify(arabicCvDataRef.current));
      arCopy.education = [...(arCopy.education || []), blank];
      arabicCvDataRef.current = arCopy;
      setArabicCvData(arCopy);
    }
  };

  const removeEducation = (index: number) => {
    markDirty();
    setCvData(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }));
    if (englishCvDataRef.current) {
      const enCopy = JSON.parse(JSON.stringify(englishCvDataRef.current));
      enCopy.education = (enCopy.education || []).filter((_: any, i: number) => i !== index);
      englishCvDataRef.current = enCopy;
      setEnglishCvData(enCopy);
    }
    if (arabicCvDataRef.current) {
      const arCopy = JSON.parse(JSON.stringify(arabicCvDataRef.current));
      arCopy.education = (arCopy.education || []).filter((_: any, i: number) => i !== index);
      arabicCvDataRef.current = arCopy;
      setArabicCvData(arCopy);
    }
  };

  const handleGenerateEduDescription = async (index: number) => {
    setGeneratingEduDesc(index);
    const edu = cvData.education[index];
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: 'education',
          institution: edu.institution,
          degree: edu.degree,
          field: edu.field || edu.fieldOfStudy,
          language: cvIsArabic ? 'ar' : 'en',
          regenerate: false,
          bilingual: false,
        }),
      });
      const data = await res.json();
      if (data.description) {
        updateEducation(index, 'description', data.description);
      }
    } catch (error) {
      console.error('Failed to generate education description:', error);
    } finally {
      setGeneratingEduDesc(null);
    }
  };

  const updateSkill = (category: string, index: number, value: string) => {
    markDirty();
    setCvData(prev => {
      const skills = { ...prev.skills };
      const list = [...(skills[category] || [])];
      list[index] = value;
      skills[category] = list;
      return { ...prev, skills };
    });
  };

  const addSkill = (category: string) => {
    markDirty();
    setCvData(prev => {
      const skills = { ...prev.skills };
      skills[category] = [...(skills[category] || []), ''];
      return { ...prev, skills };
    });
  };

  const removeSkill = (category: string, index: number) => {
    markDirty();
    setCvData(prev => {
      const skills = { ...prev.skills };
      skills[category] = (skills[category] || []).filter((_: any, i: number) => i !== index);
      return { ...prev, skills };
    });
  };

  const addCertification = () => {
    markDirty();
    setCvData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { name: '', issuer: '' }],
    }));
  };

  const removeCertification = (index: number) => {
    markDirty();
    setCvData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  const updateCertification = (index: number, field: string, value: string) => {
    markDirty();
    setCvData(prev => {
      const updated = [...prev.certifications];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, certifications: updated };
    });
  };

  const addLanguage = () => {
    markDirty();
    setCvData(prev => ({
      ...prev,
      languages: [...prev.languages, { name: '', level: '' }],
    }));
  };

  const removeLanguage = (index: number) => {
    markDirty();
    setCvData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }));
  };

  const updateLanguage = (index: number, field: string, value: string) => {
    markDirty();
    setCvData(prev => {
      const updated = [...prev.languages];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, languages: updated };
    });
  };

  const openRegenModal = useCallback((fieldType: string, fieldLabel: string, currentValue: string, experienceIndex?: number) => {
    if (!currentValue || currentValue.replace(/<[^>]+>/g, '').trim().length === 0) {
      alert(cvIsArabic ? 'يرجى إضافة بعض المحتوى قبل إعادة الكتابة.' : 'Please add some content before regenerating.');
      return;
    }
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setRegenVariations([]);
    setRegenError(null);
    setRegenLoading(true);
    setRegenModal({ open: true, fieldType, fieldLabel, currentValue, experienceIndex });

    const skills: string[] = [];
    if (cvData.skills) {
      if (Array.isArray(cvData.skills)) {
        cvData.skills.forEach((s: any) => {
          if (s.skillsList) skills.push(...(Array.isArray(s.skillsList) ? s.skillsList : []));
        });
      } else if (typeof cvData.skills === 'object') {
        Object.values(cvData.skills).forEach((v: any) => {
          if (Array.isArray(v)) skills.push(...v);
        });
      }
    }

    const cvContext: any = {
      fullName: cvData.personalInfo?.fullName || '',
      targetJobTitle: cvData.personalInfo?.targetJobTitle || '',
      targetJobDomain: cvData.personalInfo?.targetJobDomain || '',
      skills: skills.slice(0, 15),
    };

    if (fieldType === 'experience' && experienceIndex !== undefined) {
      const exp = cvData.experience[experienceIndex];
      if (exp) {
        cvContext.position = exp.position || exp.title || '';
        cvContext.company = exp.company || '';
      }
    }

    fetch('/api/ai/regenerate-field', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        fieldType,
        currentValue,
        cvContext,
        language: currentCvLanguage,
      }),
    })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          setRegenError(data.error || (cvIsArabic ? 'حدث خطأ ما. حاول مرة أخرى.' : 'Something went wrong. Please try again.'));
          return;
        }
        setRegenVariations(data.variations || []);
      })
      .catch(() => {
        setRegenError(cvIsArabic ? 'حدث خطأ ما. حاول مرة أخرى.' : 'Something went wrong. Please try again.');
      })
      .finally(() => {
        setRegenLoading(false);
      });
  }, [isAuthenticated, token, cvData, currentCvLanguage, cvIsArabic]);

  const handleRegenSelect = useCallback((text: string) => {
    const curLang = currentCvLanguageRef.current || currentCvLanguage;
    needsBilingualSyncRef.current = true;

    if (regenModal.fieldType === 'summary') {
      markDirty();
      setCvData(prev => {
        const updated = { ...prev, summary: text, professionalSummary: text };
        if (curLang === 'en') {
          const enUpdated = { ...(englishCvDataRef.current || prev), summary: text, professionalSummary: text };
          setEnglishCvData(enUpdated);
          englishCvDataRef.current = enUpdated;
        } else {
          const arUpdated = { ...(arabicCvDataRef.current || prev), summary: text, professionalSummary: text };
          setArabicCvData(arUpdated);
          arabicCvDataRef.current = arUpdated;
        }
        return updated;
      });
    } else if (regenModal.fieldType === 'experience' && regenModal.experienceIndex !== undefined) {
      const expIdx = regenModal.experienceIndex;
      updateExperience(expIdx, 'description', text);

      if (curLang === 'en' && englishCvDataRef.current) {
        const enCopy = JSON.parse(JSON.stringify(englishCvDataRef.current));
        if (enCopy.experience && enCopy.experience[expIdx]) {
          enCopy.experience[expIdx].description = text;
        }
        setEnglishCvData(enCopy);
        englishCvDataRef.current = enCopy;
      } else if (curLang === 'ar' && arabicCvDataRef.current) {
        const arCopy = JSON.parse(JSON.stringify(arabicCvDataRef.current));
        if (arCopy.experience && arCopy.experience[expIdx]) {
          arCopy.experience[expIdx].description = text;
        }
        setArabicCvData(arCopy);
        arabicCvDataRef.current = arCopy;
      }
    }
    setRegenModal({ open: false, fieldType: '', fieldLabel: '', currentValue: '' });
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3000);
  }, [regenModal, markDirty, updateExperience, currentCvLanguage]);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialLoadDoneRef = useRef(false);
  const arabicRepairAttemptedRef = useRef(false);
  const needsBilingualSyncRef = useRef(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const performSave = useCallback(async () => {
    if (isAuthenticated && token) {
      setAutoSaveStatus('saving');
      try {
        const pi = cvData.personalInfo;
        if (!pi || (!pi.fullName && !pi.name)) return;

        let normalizedSkills: any[] = [];
        if (Array.isArray(cvData.skills)) {
          normalizedSkills = cvData.skills.map((skill: any, idx: number) => ({
            id: `skill-${idx}`,
            category: skill.category || 'General',
            skillsList: Array.isArray(skill.skillsList)
              ? skill.skillsList
              : typeof skill.skillsList === 'string'
                ? skill.skillsList.split(',').map((s: string) => s.trim())
                : [],
          }));
        } else if (typeof cvData.skills === 'object' && cvData.skills !== null) {
          normalizedSkills = Object.entries(cvData.skills).map(([cat, list]: [string, any], idx) => ({
            id: `skill-${idx}`,
            category: cat,
            skillsList: Array.isArray(list) ? list : [],
          }));
        }

        const enrichedPersonalInfo: any = {
          ...pi,
          experience: cvData.experience || [],
          education: cvData.education || [],
          skills: normalizedSkills,
          certifications: cvData.certifications || [],
          languages: cvData.languages || [],
          templateSlug: templateSlug,
          colorSettings: selectedColor,
        };

        const currentContent = {
          personalInfo: cvData.personalInfo,
          professionalSummary: cvData.summary || cvData.professionalSummary || '',
          experience: cvData.experience || [],
          education: cvData.education || [],
          skills: cvData.skills || [],
          certifications: cvData.certifications || [],
          languages: cvData.languages || [],
        };

        const enData = englishCvDataRef.current;
        const arData = arabicCvDataRef.current;
        const curLang = currentCvLanguageRef.current || currentCvLanguage;

        const buildLangContent = (data: any) => ({
          personalInfo: data.personalInfo,
          professionalSummary: data.summary || data.professionalSummary || '',
          experience: data.experience || [],
          education: data.education || [],
          skills: data.skills || [],
          certifications: data.certifications || [],
          languages: data.languages || [],
        });

        const rawDbPi = rawDbPersonalInfoRef.current;

        if (curLang === 'en') {
          enrichedPersonalInfo.englishContent = currentContent;
          if (arData && arData.personalInfo) {
            enrichedPersonalInfo.arabicContent = buildLangContent(arData);
          } else if (rawDbPi?.arabicContent) {
            enrichedPersonalInfo.arabicContent = rawDbPi.arabicContent;
          }
        } else {
          enrichedPersonalInfo.arabicContent = currentContent;
          if (enData && enData.personalInfo) {
            enrichedPersonalInfo.englishContent = buildLangContent(enData);
          } else if (rawDbPi?.englishContent) {
            enrichedPersonalInfo.englishContent = rawDbPi.englishContent;
          }
        }

        const payload: any = {
          title: `${pi.fullName || pi.name || 'My'}'s CV`,
          personalInfo: enrichedPersonalInfo,
          summary: cvData.summary || cvData.professionalSummary || '',
          textDirection: cvDirection,
          language: currentCvLanguage,
        };

        if (templateChangedExplicitlyRef.current) {
          if (!isCurrentTemplatePremium) {
            payload.templateId = lastConfirmedTemplateRef.current;
          }
          templateChangedExplicitlyRef.current = false;
        } else if (!savedCvIdRef.current) {
          payload.templateId = isCurrentTemplatePremium
            ? 'simple-professional'
            : lastConfirmedTemplateRef.current;
        }

        if (savedCvIdRef.current) {
          const res = await fetch(`/api/cvs/${savedCvIdRef.current}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            console.error('Auto-save PUT failed:', res.status);
          }
        } else {
          const res = await fetch('/api/cvs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.cv?.id) {
              savedCvIdRef.current = data.cv.id;
              isNewCvCreationRef.current = false;
              if (typeof window !== 'undefined') {
                sessionStorage.setItem('editingCvId', String(data.cv.id));
                sessionStorage.removeItem('newCvCreationInProgress');
              }
            }
          }
        }
        isDirtyRef.current = false;
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
      } catch (error) {
        console.error('Auto-save error:', error);
        setAutoSaveStatus('idle');
      }
      return;
    }

    if (!guestEmail) return;
    setAutoSaveStatus('saving');
    try {
      const storedData = sessionStorage.getItem('generatedCvData');
      const existing = storedData ? JSON.parse(storedData) : {};

      const currentContent = {
        personalInfo: cvData.personalInfo,
        professionalSummary: cvData.summary || cvData.professionalSummary || '',
        experience: cvData.experience,
        education: cvData.education,
        skills: cvData.skills,
        certifications: cvData.certifications,
        languages: cvData.languages,
      };

      const updatedData: any = {
        ...existing,
        generatedContent: currentContent,
        colorSettings: {
          name: selectedColor.name,
          primary: selectedColor.primary,
          accent: selectedColor.accent,
        },
        templateId: lastConfirmedTemplateRef.current,
        language: currentCvLanguage,
        textDirection: cvDirection,
      };

      const guestCurrentContent = {
        personalInfo: cvData.personalInfo,
        professionalSummary: cvData.summary || cvData.professionalSummary || '',
        experience: cvData.experience || [],
        education: cvData.education || [],
        skills: cvData.skills || [],
        certifications: cvData.certifications || [],
        languages: cvData.languages || [],
      };
      const guestEnData = englishCvDataRef.current;
      const guestArData = arabicCvDataRef.current;
      const guestCurLang = currentCvLanguageRef.current || currentCvLanguage;

      if (guestCurLang === 'en') {
        updatedData.englishContent = guestCurrentContent;
        if (guestArData && Array.isArray(guestArData.experience) && guestArData.experience.length > 0) {
          updatedData.arabicContent = {
            personalInfo: guestArData.personalInfo,
            professionalSummary: guestArData.summary || guestArData.professionalSummary || '',
            experience: guestArData.experience || [],
            education: guestArData.education || [],
            skills: guestArData.skills || [],
            certifications: guestArData.certifications || [],
            languages: guestArData.languages || [],
          };
        }
      } else {
        updatedData.arabicContent = guestCurrentContent;
        if (guestEnData && Array.isArray(guestEnData.experience) && guestEnData.experience.length > 0) {
          updatedData.englishContent = {
            personalInfo: guestEnData.personalInfo,
            professionalSummary: guestEnData.summary || guestEnData.professionalSummary || '',
            experience: guestEnData.experience || [],
            education: guestEnData.education || [],
            skills: guestEnData.skills || [],
            certifications: guestEnData.certifications || [],
            languages: guestEnData.languages || [],
          };
        }
      }

      sessionStorage.setItem('generatedCvData', JSON.stringify(updatedData));

      await fetch('/api/guest-cv/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: guestEmail,
          cvData: updatedData,
          templateId: lastConfirmedTemplateRef.current,
        }),
      });

      isDirtyRef.current = false;
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Auto-save error:', error);
      setAutoSaveStatus('idle');
    }
  }, [cvData, guestEmail, templateSlug, selectedColor, currentCvLanguage, cvDirection, isAuthenticated, token, isCurrentTemplatePremium]);

  useEffect(() => {
    if (loading) return;

    if (!initialLoadDoneRef.current) {
      initialLoadDoneRef.current = true;
      if (!isDirtyRef.current) return;
    }

    if (!isDirtyRef.current) {
      return;
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      await performSave();
    }, 1500);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [cvData, selectedColor, templateSlug, cvDirection, currentCvLanguage, loading, performSave]);


  const handleDownload = useCallback(async () => {
    if (!token || !isAuthenticated) return;
    setDownloading(true);
    setDownloadError(null);

    if (isCurrentTemplatePremium) {
      if (!isAuthenticated) {
        setShowAuthModal(true);
      } else {
        setShowUpgradeModal(true);
      }
      setDownloading(false);
      return;
    }

    try {
      const pi = cvData.personalInfo;
      if (!pi || (!pi.fullName && !pi.name)) {
        setDownloadError(isRTL ? 'المعلومات الشخصية مفقودة. يرجى إضافتها قبل التحميل.' : 'Personal Information is missing. Please add it before downloading.');
        setDownloading(false);
        return;
      }

      let normalizedSkills: any[] = [];
      if (Array.isArray(cvData.skills)) {
        normalizedSkills = cvData.skills.map((skill: any, idx: number) => ({
          id: `skill-${idx}`,
          category: skill.category || 'General',
          skillsList: typeof skill === 'string' ? skill.split(',').map((s: string) => s.trim()) : (skill.skillsList || [])
        }));
      } else if (cvData.skills && typeof cvData.skills === 'object') {
        let idx = 0;
        for (const [category, items] of Object.entries(cvData.skills)) {
          if (Array.isArray(items) && items.length > 0) {
            normalizedSkills.push({
              id: `skill-${idx}`,
              category: category.charAt(0).toUpperCase() + category.slice(1),
              skillsList: items,
            });
            idx++;
          }
        }
      }

      const savePayload = {
        title: `${cvData.personalInfo.fullName || 'My'}'s CV`,
        templateId: lastConfirmedTemplateRef.current,
        personalInfo: cvData.personalInfo,
        summary: cvData.summary || cvData.professionalSummary || '',
        experience: cvData.experience,
        education: cvData.education,
        skills: normalizedSkills,
        certifications: cvData.certifications,
        languages: cvData.languages.map((l: any) => ({
          name: l.name || l.language || '',
          level: l.level || l.proficiency || '',
        })),
        language: currentCvLanguage,
        textDirection: cvDirection,
      };

      let cvId: number | null = null;

      const existingRes = await fetch('/api/cvs', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      let userCvIds: number[] = [];
      if (existingRes.ok) {
        const existingData = await existingRes.json();
        const existingCvs = existingData.cvs || [];
        userCvIds = existingCvs.map((c: any) => c.id);
        if (existingCvs.length > 0) {
          const sorted = [...existingCvs].sort((a: any, b: any) =>
            new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime()
          );
          cvId = sorted[0].id;
        }
      }

      if (savedCvIdRef.current && userCvIds.includes(savedCvIdRef.current)) {
        cvId = savedCvIdRef.current;
      } else {
        savedCvIdRef.current = null;
      }

      if (!cvId) {
        const storedId = typeof window !== 'undefined' ? sessionStorage.getItem('downloadCvId') : null;
        if (storedId) {
          const parsed = parseInt(storedId, 10);
          if (!isNaN(parsed) && userCvIds.includes(parsed)) {
            cvId = parsed;
          } else {
            sessionStorage.removeItem('downloadCvId');
          }
        }
      }

      if (cvId) {
        const updateRes = await fetch(`/api/cv/${cvId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(savePayload),
        });
        if (!updateRes.ok) {
          console.warn('Failed to update existing CV, creating new one');
          const saveRes = await fetch('/api/cvs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(savePayload),
          });
          if (!saveRes.ok) throw new Error('Failed to save CV');
          const saveData = await saveRes.json();
          cvId = saveData.cv?.id || saveData.id || saveData.cvId;
        }
      } else {
        const saveRes = await fetch('/api/cvs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(savePayload),
        });
        if (!saveRes.ok) throw new Error('Failed to save CV');
        const saveData = await saveRes.json();
        cvId = saveData.cv?.id || saveData.id || saveData.cvId;
      }

      if (!cvId) {
        throw new Error('No CV ID returned');
      }

      savedCvIdRef.current = cvId;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('downloadCvId', String(cvId));
      }

      const exportUrl = `/api/cv/${cvId}/export-pdf?template=${lastConfirmedTemplateRef.current}&color=${encodeURIComponent(selectedColor.primary)}&direction=${cvDirection}&language=${currentCvLanguage}`;
      const pdfRes = await fetch(exportUrl, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!pdfRes.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await pdfRes.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cvData.personalInfo.fullName || 'CV'}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Download error:', error);
      setDownloadError(isRTL ? 'فشل في تحميل السيرة الذاتية. حاول مرة أخرى.' : 'Failed to download CV. Please try again.');
    } finally {
      setDownloading(false);
    }
  }, [token, isAuthenticated, cvData, templateSlug, selectedColor, cvDirection, currentCvLanguage, isRTL, isCurrentTemplatePremium]);

  const TemplateComponent = getTemplateComponent(templateSlug);

  const templateData = {
    personalInfo: cvData.personalInfo,
    summary: cvData.summary || cvData.professionalSummary || '',
    professionalSummary: cvData.summary || cvData.professionalSummary || '',
    experience: cvData.experience.map((exp: any) => {
      const hasAchievements = Array.isArray(exp.achievements) && exp.achievements.filter((a: string) => a && a.trim()).length > 0;
      if (!hasAchievements) return exp;
      const achievementsHtml = '<ul>' + exp.achievements
        .filter((a: string) => a && a.trim())
        .map((a: string) => `<li>${a.trim()}</li>`)
        .join('') + '</ul>';
      const baseDesc = (exp.description || '').replace(/\s*<ul><li>.*?<\/li><\/ul>\s*$/gs, '').trim();
      return {
        ...exp,
        description: baseDesc ? `${baseDesc}${achievementsHtml}` : achievementsHtml,
      };
    }),
    education: cvData.education,
    skills: cvData.skills,
    certifications: cvData.certifications,
    languages: cvData.languages,
  };

  const SectionHeader = ({ title, section, count }: { title: string; section: string; count?: number }) => (
    <button
      onClick={() => { 
        const isExpanding = !expandedSections[section];
        toggleSection(section);
        if (isExpanding) scrollToPreviewSection(section);
      }}
      className={`w-full flex items-center justify-between px-5 py-4 transition-all ${
        activeSection === section ? `bg-accent-50 ${cvIsRTL ? 'border-r-4' : 'border-l-4'} border-accent-500` : 'hover:bg-navy-50/50'
      }`}
    >
      <div className={`flex items-center gap-2 ${cvIsRTL ? '' : 'pl-1'}`}>
        <span className={`font-telegraf font-bold ${activeSection === section ? 'text-navy-900' : 'text-navy-800'}`}>{title}</span>
        {count !== undefined && (
          <span className="text-xs bg-accent-100 text-accent-700 px-2 py-0.5 rounded-full font-medium">{count}</span>
        )}
      </div>
      <FiChevronDown className={`w-4 h-4 text-navy-400 transition-transform duration-200 ${expandedSections[section] ? 'rotate-180' : ''}`} />
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
        <FiLoader className="w-8 h-8 animate-spin text-accent-500" />
      </div>
    );
  }

  const labels = {
    title: isRTL ? 'معاينة وتعديل السيرة الذاتية' : 'Preview & Edit Your CV',
    subtitle: isRTL ? 'قم بتعديل أي حقل وشاهد التغييرات فوراً' : 'Edit any field and see changes instantly',
    personalInfo: cvIsArabic ? 'المعلومات الشخصية' : 'Personal Information',
    summary: cvIsArabic ? 'الملخص المهني' : 'Professional Summary',
    experience: cvIsArabic ? 'الخبرات العملية' : 'Work Experience',
    education: cvIsArabic ? 'التعليم' : 'Education',
    skills: cvIsArabic ? 'المهارات' : 'Skills',
    certifications: cvIsArabic ? 'الشهادات' : 'Certifications',
    languages: cvIsArabic ? 'اللغات' : 'Languages',
    colors: cvIsArabic ? 'ألوان القالب' : 'Template Colors',
    download: isRTL ? 'تحميل PDF' : 'Download PDF',
    addExperience: cvIsArabic ? 'إضافة خبرة' : 'Add Experience',
    addEducation: cvIsArabic ? 'إضافة تعليم' : 'Add Education',
    addSkill: cvIsArabic ? 'إضافة مهارة' : 'Add Skill',
    addCertification: cvIsArabic ? 'إضافة شهادة' : 'Add Certification',
    addLanguage: cvIsArabic ? 'إضافة لغة' : 'Add Language',
    addAchievement: cvIsArabic ? 'إضافة إنجاز' : 'Add Achievement',
    remove: cvIsArabic ? 'حذف' : 'Remove',
    fullName: cvIsArabic ? 'الاسم الكامل' : 'Full Name',
    email: cvIsArabic ? 'البريد الإلكتروني' : 'Email',
    phone: cvIsArabic ? 'الهاتف' : 'Phone',
    location: cvIsArabic ? 'الموقع' : 'Location',
    linkedin: cvIsArabic ? 'لينكد إن' : 'LinkedIn',
    nationality: cvIsArabic ? 'الجنسية' : 'Nationality',
    jobDomain: cvIsArabic ? 'مجال العمل' : 'Job Domain',
    jobTitle: cvIsArabic ? 'المسمى الوظيفي' : 'Job Title',
    company: cvIsArabic ? 'الشركة' : 'Company',
    position: cvIsArabic ? 'المنصب' : 'Position',
    startDate: cvIsArabic ? 'تاريخ البدء' : 'Start Date',
    endDate: cvIsArabic ? 'تاريخ الانتهاء' : 'End Date',
    description: cvIsArabic ? 'الوصف' : 'Description',
    achievements: cvIsArabic ? 'الإنجازات' : 'Achievements',
    institution: cvIsArabic ? 'المؤسسة' : 'Institution',
    degree: cvIsArabic ? 'الدرجة' : 'Degree',
    field: cvIsArabic ? 'التخصص' : 'Field of Study',
    technical: cvIsArabic ? 'مهارات تقنية' : 'Technical Skills',
    soft: cvIsArabic ? 'مهارات شخصية' : 'Soft Skills',
    tools: cvIsArabic ? 'أدوات' : 'Tools',
    certName: cvIsArabic ? 'اسم الشهادة' : 'Certification Name',
    issuer: cvIsArabic ? 'الجهة المانحة' : 'Issuing Organization',
    langName: cvIsArabic ? 'اللغة' : 'Language',
    level: cvIsArabic ? 'المستوى' : 'Level',
    eduSummary: cvIsArabic ? 'ملخص التعليم (اختياري)' : 'Education Summary (Optional)',
    aiGenerate: cvIsArabic ? 'توليد AI' : 'AI Generate',
    backToBasicInfo: isRTL ? 'العودة للمعلومات الأساسية' : 'Back to Basic Info',
    preview: cvIsArabic ? 'المعاينة' : 'Preview',
    downloadDisabled: isRTL ? 'أنشئ حسابًا مجانيًا لتحميل سيرتك الذاتية' : 'Create a free account to download your CV',
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc]" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 sticky top-16 z-30 shadow-brand-md">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-brand bg-white/10 text-white hover:bg-white/20 transition-colors backdrop-blur-sm">
                {isRTL ? <FiArrowRight className="w-5 h-5" /> : <FiArrowLeft className="w-5 h-5" />}
              </button>
              <div>
                <h1 className="text-xl font-telegraf font-bold text-white">{labels.title}</h1>
                <p className="text-xs text-white/60">{labels.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {autoSaveStatus === 'saving' && (
                <span className="hidden sm:flex items-center gap-1.5 text-xs text-white/60 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <FiLoader className="w-3 h-3 animate-spin" />
                  {isRTL ? 'جاري الحفظ...' : 'Saving...'}
                </span>
              )}
              {autoSaveStatus === 'saved' && (
                <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-500/15 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <FiCheck className="w-3 h-3" />
                  {isRTL ? 'تم الحفظ' : 'Saved'}
                </span>
              )}
              {isAuthenticated ? (
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="hidden sm:flex items-center gap-2 px-6 py-2.5 rounded-brand font-semibold text-sm bg-brand-orange text-white hover:bg-brand-orange-dark shadow-brand-soft hover:shadow-brand-md transition-all disabled:opacity-60"
                >
                  {downloading ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiDownload className="w-4 h-4" />}
                  {downloading ? (isRTL ? 'جاري التحميل...' : 'Downloading...') : labels.download}
                </button>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="hidden sm:flex items-center gap-2 px-6 py-2.5 rounded-brand font-semibold text-sm bg-brand-orange text-white hover:bg-brand-orange-dark shadow-brand-soft hover:shadow-brand-md transition-all"
                >
                  <FiDownload className="w-4 h-4" />
                  {labels.download}
                </button>
              )}
            </div>
          </div>
          <div className="bg-white/10 rounded-brand-lg p-2 backdrop-blur-sm">
            <div className="relative">
              <button
                onClick={() => scrollTemplateSlider('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-brand-soft hover:bg-navy-50 text-navy-600 transition-colors"
              >
                <FiArrowLeft className="w-3 h-3" />
              </button>
              <div
                ref={templateSliderRef}
                className="flex gap-1.5 overflow-x-auto scrollbar-hide px-8 pb-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {ALL_TEMPLATES.map((tmpl) => {
                  const isSelected = templateSlug === tmpl.slug;
                  const displayName = isRTL ? tmpl.nameAr : tmpl.name;
                  return (
                    <button
                      key={tmpl.slug}
                      onClick={() => handleTemplateSelect(tmpl.slug)}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-brand text-xs font-medium transition-all whitespace-nowrap ${
                        isSelected
                          ? 'bg-accent-500 text-white shadow-brand-soft'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {isSelected && <FiCheck className="w-3 h-3" />}
                      {tmpl.isPremium && !isSelected && <FiLock className="w-3 h-3 text-amber-400" />}
                      {tmpl.isPremium && isSelected && <FiLock className="w-3 h-3" />}
                      {displayName}
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : tmpl.isPremium
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {tmpl.isPremium ? (isRTL ? 'مدفوع' : 'Pro') : (isRTL ? 'مجاني' : 'Free')}
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => scrollTemplateSlider('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-brand-soft hover:bg-navy-50 text-navy-600 transition-colors"
              >
                <FiArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-5">
        {downloadError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-brand-lg p-4 flex items-center gap-3 shadow-card">
            <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700 font-medium">{downloadError}</span>
            <button onClick={() => setDownloadError(null)} className="ml-auto text-red-400 hover:text-red-600 text-sm font-bold p-1 rounded-brand hover:bg-red-100 transition-colors">✕</button>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4 lg:max-h-[calc(100vh-180px)] lg:overflow-y-auto lg:pr-3 pb-24 lg:pb-4 lg:scrollbar-thin" dir={cvIsRTL ? 'rtl' : 'ltr'}>
            <div className="bg-white rounded-brand-lg shadow-card p-5">
              <h3 className="font-telegraf font-bold text-navy-900 mb-4 flex items-center gap-2">
                <FiType className="w-4 h-4 text-accent-500" />
                {cvIsArabic ? 'اللغة واتجاه النص' : 'Language & Direction'}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-navy-600">{cvIsArabic ? 'لغة المحتوى' : 'Content Language'}</span>
                    <div className="flex items-center gap-1 bg-navy-50 rounded-full p-1">
                      <button
                        onClick={() => { switchCvLanguage('en'); setLanguage('en'); }}
                        disabled={translatingPreview}
                        className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
                          currentCvLanguage === 'en'
                            ? 'bg-accent-500 text-white shadow-brand-soft'
                            : 'text-navy-500 hover:text-navy-700'
                        } ${translatingPreview ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => { switchCvLanguage('ar'); setLanguage('ar'); }}
                        disabled={translatingPreview}
                        className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all ${
                          currentCvLanguage === 'ar'
                            ? 'bg-accent-500 text-white shadow-brand-soft'
                            : 'text-navy-500 hover:text-navy-700'
                        } ${translatingPreview ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        العربية
                      </button>
                    </div>
                  </div>
                  {translatingPreview && (
                    <div className="flex items-center gap-2 text-xs text-accent-500">
                      <FiLoader className="w-3 h-3 animate-spin" />
                      <span>{cvIsArabic ? 'جاري الترجمة...' : 'Translating content...'}</span>
                    </div>
                  )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-navy-600">{cvIsArabic ? 'اتجاه النص' : 'Text Direction'}</span>
                  <div className="flex items-center gap-1 bg-navy-50 rounded-full p-1">
                    <span className={`px-4 py-1.5 text-xs font-medium rounded-full bg-accent-500 text-white shadow-brand-soft`}>
                      {cvDirection === 'rtl' ? 'RTL' : 'LTR'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-brand-lg shadow-card p-5">
              <h3 className="font-telegraf font-bold text-navy-900 mb-4 flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ background: `linear-gradient(135deg, ${selectedColor.primary}, ${selectedColor.accent})` }} />
                {labels.colors}
              </h3>
              <div className="grid grid-cols-4 gap-3">
                {COLOR_THEMES.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => { markDirty(); setSelectedColor(theme); }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-brand transition-all ${
                      selectedColor.name === theme.name ? 'bg-accent-50 ring-2 ring-accent-500 ring-offset-2' : 'hover:bg-navy-50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full border-2 border-white shadow-brand-soft" style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})` }} />
                    <span className="text-[10px] text-navy-600 truncate w-full text-center font-medium">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-brand-lg shadow-card overflow-hidden">
              <SectionHeader title={labels.personalInfo} section="personalInfo" />
              {expandedSections.personalInfo && (
                <div className="p-5 space-y-3" onFocus={() => scrollToPreviewSection('personalInfo')}>
                  {[
                    { key: 'fullName', label: labels.fullName },
                    { key: 'email', label: labels.email },
                    { key: 'phone', label: labels.phone },
                    { key: 'location', label: labels.location },
                    { key: 'nationality', label: labels.nationality },
                    { key: 'targetJobTitle', label: labels.jobTitle },
                    { key: 'targetJobDomain', label: labels.jobDomain },
                    { key: 'linkedin', label: labels.linkedin },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-navy-600 mb-1.5">{label}</label>
                      <input
                        type="text"
                        value={(cvData.personalInfo as any)[key] || ''}
                        onChange={(e) => updatePersonalInfo(key, e.target.value)}
                        className="w-full px-4 py-3 text-sm border-2 border-navy-100 rounded-brand focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors"
                        dir={cvIsRTL ? 'rtl' : 'ltr'}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-brand-lg shadow-card overflow-hidden">
              <SectionHeader title={labels.summary} section="summary" />
              {expandedSections.summary && (
                <div className="p-5" onFocus={() => scrollToPreviewSection('summary')}>
                  <RichTextEditor
                    value={cvData.summary || cvData.professionalSummary || ''}
                    onChange={(v) => {
                      markDirty();
                      needsBilingualSyncRef.current = true;
                      const curLang = currentCvLanguageRef.current;
                      if (curLang === 'en' && englishCvDataRef.current) {
                        const enCopy = { ...englishCvDataRef.current, summary: v, professionalSummary: v };
                        englishCvDataRef.current = enCopy;
                        setEnglishCvData(enCopy);
                      } else if (curLang === 'ar' && arabicCvDataRef.current) {
                        const arCopy = { ...arabicCvDataRef.current, summary: v, professionalSummary: v };
                        arabicCvDataRef.current = arCopy;
                        setArabicCvData(arCopy);
                      }
                      setCvData(prev => ({ ...prev, summary: v, professionalSummary: v }));
                    }}
                    placeholder={cvIsArabic ? 'اكتب ملخصك المهني هنا...' : 'Write your professional summary here...'}
                    isRTL={cvIsRTL}
                    onFocus={() => scrollToPreviewSection('summary')}
                  />
                  <button
                    onClick={() => openRegenModal(
                      'summary',
                      cvIsArabic ? 'الملخص المهني' : 'Professional Summary',
                      cvData.summary || cvData.professionalSummary || ''
                    )}
                    className="mt-3 flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-accent-500 to-accent-600 rounded-full shadow-brand-soft hover:shadow-brand-md transition-all"
                  >
                    <span>✨</span>
                    {cvIsArabic ? 'إعادة الكتابة بالذكاء الاصطناعي' : 'Regenerate with AI'}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-brand-lg shadow-card overflow-hidden">
              <SectionHeader title={labels.experience} section="experience" count={cvData.experience.length} />
              {expandedSections.experience && (
                <div className="p-5 space-y-4" onFocus={() => scrollToPreviewSection('experience')}>
                  {cvData.experience.map((exp, index) => (
                    <div key={index} className="border-2 border-navy-100 rounded-brand p-4 space-y-3 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-navy-700">
                          {cvIsArabic ? `خبرة ${index + 1}` : `Experience ${index + 1}`}
                        </span>
                        <button onClick={() => removeExperience(index)} className="text-red-400 hover:text-red-600 p-1.5 rounded-brand hover:bg-red-50 transition-colors">
                          <FiMinus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-navy-600 mb-1.5">{labels.position}</label>
                          <input type="text" value={exp.position || exp.title || ''} onChange={(e) => updateExperience(index, 'position', e.target.value)} className="w-full px-4 py-3 text-sm border-2 border-navy-100 rounded-brand focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors" dir={cvIsRTL ? 'rtl' : 'ltr'} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-navy-600 mb-1.5">{labels.company}</label>
                          <input type="text" value={exp.company || ''} onChange={(e) => updateExperience(index, 'company', e.target.value)} className="w-full px-4 py-3 text-sm border-2 border-navy-100 rounded-brand focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors" dir={cvIsRTL ? 'rtl' : 'ltr'} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-navy-600 mb-1.5">{labels.startDate}</label>
                          <input type="text" value={exp.startDate || ''} onChange={(e) => updateExperience(index, 'startDate', e.target.value)} className="w-full px-4 py-3 text-sm border-2 border-navy-100 rounded-brand focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors" placeholder="YYYY" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-navy-600 mb-1.5">{labels.endDate}</label>
                          <input type="text" value={exp.endDate || ''} onChange={(e) => updateExperience(index, 'endDate', e.target.value)} className="w-full px-4 py-3 text-sm border-2 border-navy-100 rounded-brand focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors" placeholder={cvIsArabic ? 'حتى الآن أو YYYY' : 'Present or YYYY'} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-navy-600 mb-1.5">{labels.location}</label>
                          <input type="text" value={exp.location || ''} onChange={(e) => updateExperience(index, 'location', e.target.value)} className="w-full px-4 py-3 text-sm border-2 border-navy-100 rounded-brand focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors" dir={cvIsRTL ? 'rtl' : 'ltr'} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-navy-600 mb-1.5">{labels.description}</label>
                        <RichTextEditor
                          value={exp.description || ''}
                          onChange={(v) => updateExperience(index, 'description', v)}
                          isRTL={cvIsRTL}
                        />
                        <button
                          onClick={() => openRegenModal(
                            'experience',
                            cvIsArabic ? `وصف الخبرة ${index + 1}` : `Experience ${index + 1} Description`,
                            exp.description || '',
                            index
                          )}
                          className="mt-2 flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-accent-500 to-accent-600 rounded-full shadow-brand-soft hover:shadow-brand-md transition-all"
                        >
                          <span>✨</span>
                          {cvIsArabic ? 'إعادة الكتابة بالذكاء الاصطناعي' : 'Regenerate with AI'}
                        </button>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-medium text-navy-600">{labels.achievements}</label>
                          <button onClick={() => addAchievement(index)} className="text-accent-600 hover:text-accent-700 flex items-center gap-1 text-xs font-medium">
                            <FiPlus className="w-3 h-3" /> {labels.addAchievement}
                          </button>
                        </div>
                        {(exp.achievements || []).map((ach, achIdx) => (
                          <div key={achIdx} className="flex items-center gap-2 mb-2">
                            <span className="text-accent-400 text-xs">•</span>
                            <input
                              type="text"
                              value={ach}
                              onChange={(e) => updateAchievement(index, achIdx, e.target.value)}
                              className="flex-1 px-4 py-2.5 text-sm border-2 border-navy-100 rounded-brand focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors"
                              dir={cvIsRTL ? 'rtl' : 'ltr'}
                            />
                            <button onClick={() => removeAchievement(index, achIdx)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors">
                              <FiMinus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button onClick={addExperience} className="w-full py-3 border-2 border-dashed border-accent-300 rounded-brand text-accent-600 hover:bg-accent-50 flex items-center justify-center gap-2 text-sm font-medium transition-colors">
                    <FiPlus className="w-4 h-4" /> {labels.addExperience}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-brand-lg shadow-card overflow-hidden">
              <SectionHeader title={labels.education} section="education" count={cvData.education.length} />
              {expandedSections.education && (
                <div className="p-5 space-y-4" onFocus={() => scrollToPreviewSection('education')}>
                  {cvData.education.map((edu, index) => (
                    <div key={index} className="border-2 border-navy-100 rounded-brand p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-navy-700">
                          {cvIsArabic ? `تعليم ${index + 1}` : `Education ${index + 1}`}
                        </span>
                        <button onClick={() => removeEducation(index)} className="text-red-400 hover:text-red-600 p-1.5 rounded-brand hover:bg-red-50 transition-colors">
                          <FiMinus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-navy-600 mb-1.5">{labels.institution}</label>
                          <input type="text" value={edu.institution || edu.school || ''} onChange={(e) => updateEducation(index, 'institution', e.target.value)} className="w-full px-4 py-3 text-sm border-2 border-navy-100 rounded-brand focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors" dir={cvIsRTL ? 'rtl' : 'ltr'} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-navy-600 mb-1.5">{labels.degree}</label>
                          <input type="text" value={edu.degree || ''} onChange={(e) => updateEducation(index, 'degree', e.target.value)} className="w-full px-4 py-3 text-sm border-2 border-navy-100 rounded-brand focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors" dir={cvIsRTL ? 'rtl' : 'ltr'} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-navy-600 mb-1.5">{labels.field}</label>
                          <input type="text" value={edu.field || edu.fieldOfStudy || ''} onChange={(e) => updateEducation(index, 'field', e.target.value)} className="w-full px-4 py-3 text-sm border-2 border-navy-100 rounded-brand focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors" dir={cvIsRTL ? 'rtl' : 'ltr'} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-navy-600 mb-1.5">{labels.startDate}</label>
                          <input type="text" value={edu.startDate || ''} onChange={(e) => updateEducation(index, 'startDate', e.target.value)} className="w-full px-4 py-3 text-sm border-2 border-navy-100 rounded-brand focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors" placeholder="YYYY" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-navy-600 mb-1.5">{labels.endDate}</label>
                          <input type="text" value={edu.endDate || edu.graduationYear || ''} onChange={(e) => updateEducation(index, 'endDate', e.target.value)} className="w-full px-4 py-3 text-sm border-2 border-navy-100 rounded-brand focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors" placeholder="YYYY" />
                        </div>
                      </div>
                      <div className="col-span-2 mt-1">
                        <label className="block text-xs font-medium text-navy-600 mb-1.5">{labels.eduSummary}</label>
                        <input
                          type="text"
                          value={edu.description || ''}
                          onChange={(e) => updateEducation(index, 'description', e.target.value)}
                          placeholder={cvIsArabic ? 'مثال: بكالوريوس علوم الحاسب مع التركيز على تطوير البرمجيات' : 'e.g., Bachelor of Computer Science with focus on software engineering'}
                          className="w-full px-4 py-3 text-sm border-2 border-navy-100 rounded-brand focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors"
                          dir={cvIsRTL ? 'rtl' : 'ltr'}
                          maxLength={120}
                        />
                        <p className="text-[10px] text-gray-400 mt-1">
                          {cvIsArabic ? 'جملة واحدة مختصرة (20 كلمة كحد أقصى) · تظهر في نموذج السيرة الذاتية' : 'One concise sentence (max 20 words) · appears in your CV template'}
                        </p>
                        <button
                          onClick={() => handleGenerateEduDescription(index)}
                          disabled={generatingEduDesc === index}
                          className="mt-2 flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-accent-500 to-accent-600 rounded-full shadow-brand-soft hover:shadow-brand-md transition-all disabled:opacity-50"
                        >
                          {generatingEduDesc === index ? <FiLoader className="w-4 h-4 animate-spin" /> : <span>✨</span>}
                          {generatingEduDesc === index
                            ? (cvIsArabic ? 'جارٍ التوليد...' : 'Generating...')
                            : (cvIsArabic ? 'توليد بالذكاء الاصطناعي' : 'Generate with AI')}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={addEducation} className="w-full py-3 border-2 border-dashed border-accent-300 rounded-brand text-accent-600 hover:bg-accent-50 flex items-center justify-center gap-2 text-sm font-medium transition-colors">
                    <FiPlus className="w-4 h-4" /> {labels.addEducation}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-brand-lg shadow-card overflow-hidden">
              <SectionHeader title={labels.skills} section="skills" />
              {expandedSections.skills && (
                <div className="p-5 space-y-4" onFocus={() => scrollToPreviewSection('skills')}>
                  {[
                    { key: 'technical', label: labels.technical },
                    { key: 'soft', label: labels.soft },
                    { key: 'tools', label: labels.tools },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-navy-600">{label}</label>
                        <button onClick={() => addSkill(key)} className="text-accent-600 hover:text-accent-700 flex items-center gap-1 text-xs font-medium">
                          <FiPlus className="w-3 h-3" /> {labels.addSkill}
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {((cvData.skills?.[key] || []) as string[]).map((skill: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-1 bg-navy-50 rounded-full px-3 py-1.5 border border-navy-100">
                            <input
                              type="text"
                              value={skill}
                              onChange={(e) => updateSkill(key, idx, e.target.value)}
                              className="bg-transparent text-sm w-24 focus:outline-none focus:w-32 transition-all text-navy-800"
                              dir={cvIsRTL ? 'rtl' : 'ltr'}
                            />
                            <button onClick={() => removeSkill(key, idx)} className="text-red-400 hover:text-red-600">
                              <FiMinus className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-brand-lg shadow-card overflow-hidden">
              <SectionHeader title={labels.certifications} section="certifications" count={cvData.certifications.length} />
              {expandedSections.certifications && (
                <div className="p-5 space-y-3" onFocus={() => scrollToPreviewSection('certifications')}>
                  {cvData.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={cert.name || cert.title || ''}
                        onChange={(e) => updateCertification(index, 'name', e.target.value)}
                        placeholder={labels.certName}
                        className="flex-1 px-4 py-3 text-sm border-2 border-navy-100 rounded-brand focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors"
                        dir={cvIsRTL ? 'rtl' : 'ltr'}
                      />
                      <input
                        type="text"
                        value={cert.issuer || cert.organization || ''}
                        onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                        placeholder={labels.issuer}
                        className="flex-1 px-4 py-3 text-sm border-2 border-navy-100 rounded-brand focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors"
                        dir={cvIsRTL ? 'rtl' : 'ltr'}
                      />
                      <button onClick={() => removeCertification(index)} className="text-red-400 hover:text-red-600 p-1.5 rounded-brand hover:bg-red-50 transition-colors">
                        <FiMinus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button onClick={addCertification} className="w-full py-3 border-2 border-dashed border-accent-300 rounded-brand text-accent-600 hover:bg-accent-50 flex items-center justify-center gap-2 text-sm font-medium transition-colors">
                    <FiPlus className="w-4 h-4" /> {labels.addCertification}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-brand-lg shadow-card overflow-hidden">
              <SectionHeader title={labels.languages} section="languages" count={cvData.languages.length} />
              {expandedSections.languages && (
                <div className="p-5 space-y-3" onFocus={() => scrollToPreviewSection('languages')}>
                  {cvData.languages.map((lang, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={lang.name || lang.language || ''}
                        onChange={(e) => updateLanguage(index, 'name', e.target.value)}
                        placeholder={labels.langName}
                        className="flex-1 px-4 py-3 text-sm border-2 border-navy-100 rounded-brand focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors"
                        dir={cvIsRTL ? 'rtl' : 'ltr'}
                      />
                      <input
                        type="text"
                        value={lang.level || lang.proficiency || ''}
                        onChange={(e) => updateLanguage(index, 'level', e.target.value)}
                        placeholder={labels.level}
                        className="flex-1 px-4 py-3 text-sm border-2 border-navy-100 rounded-brand focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-colors"
                        dir={cvIsRTL ? 'rtl' : 'ltr'}
                      />
                      <button onClick={() => removeLanguage(index)} className="text-red-400 hover:text-red-600 p-1.5 rounded-brand hover:bg-red-50 transition-colors">
                        <FiMinus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button onClick={addLanguage} className="w-full py-3 border-2 border-dashed border-accent-300 rounded-brand text-accent-600 hover:bg-accent-50 flex items-center justify-center gap-2 text-sm font-medium transition-colors">
                    <FiPlus className="w-4 h-4" /> {labels.addLanguage}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-24">
              <div className="bg-white rounded-brand-lg shadow-brand-md overflow-hidden border border-gray-100">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-navy-100 bg-gradient-to-r from-navy-50/50 to-white">
                  <h3 className="font-telegraf font-bold text-navy-900 text-sm">{labels.preview}</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-white rounded-full px-1.5 py-1 border border-navy-200 shadow-brand-soft">
                      <button
                        onClick={handleZoomOut}
                        disabled={previewZoom <= 70}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-navy-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-navy-600"
                        title={isRTL ? 'تصغير' : 'Zoom Out'}
                      >
                        <FiMinus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={handleZoomReset}
                        className="text-[10px] font-medium text-navy-600 hover:text-accent-500 min-w-[36px] text-center transition-colors"
                        title={isRTL ? 'إعادة تعيين' : 'Reset Zoom'}
                      >
                        {previewZoom}%
                      </button>
                      <button
                        onClick={handleZoomIn}
                        disabled={previewZoom >= 200}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-navy-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-navy-600"
                        title={isRTL ? 'تكبير' : 'Zoom In'}
                      >
                        <FiPlus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-[10px] font-medium text-accent-700 bg-accent-50 px-2.5 py-1 rounded-full">
                      {templateName}
                    </span>
                    {!isAuthenticated && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                        {isRTL ? 'محمي' : 'Protected'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-white cv-preview-wrapper" ref={previewScrollRef} style={{ maxHeight: 'calc(100vh - 160px)', overflow: 'auto' }}>
                    <style>{`
                      .cv-preview-wrapper .cv-preview-content > div:first-child {
                        transform: none !important;
                        width: 100% !important;
                        min-height: auto !important;
                        padding: 12px 16px !important;
                      }
                    `}</style>
                    <div style={{ width: `${previewZoom}%`, transition: 'width 0.2s ease' }} className="relative">
                      {translatingPreview && (
                        <div className="absolute inset-0 z-30 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-lg">
                          <div className="flex flex-col items-center gap-3 text-center">
                            <FiLoader className="w-8 h-8 text-accent-500 animate-spin" />
                            <p className="text-sm font-medium text-navy-800">
                              {cvIsArabic ? 'جاري ترجمة المحتوى...' : 'Translating content...'}
                            </p>
                            <p className="text-xs text-navy-500">
                              {cvIsArabic ? 'يرجى الانتظار' : 'Please wait'}
                            </p>
                          </div>
                        </div>
                      )}
                      <div className="cv-preview-content" style={{ transform: `scale(${previewZoom / 100})`, transformOrigin: 'top left', width: `${10000 / previewZoom}%`, transition: 'transform 0.2s ease, width 0.2s ease' }}>
                        <TemplateComponent
                          data={templateData}
                          previewMode={true}
                          isArabic={cvIsRTL}
                          settings={{
                            primaryColor: selectedColor.primary,
                            accentColor: selectedColor.accent,
                            activeSection: isAuthenticated ? undefined : activeSection,
                            photoUrl: cvData.personalInfo?.photo || user?.profilePicture || undefined,
                          }}
                        />
                      </div>
                    </div>
                    {isCurrentTemplatePremium && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center" style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(248,249,252,0.6)' }}>
                        <div className="text-center p-5 bg-white rounded-brand-lg shadow-brand-md border border-accent-200 max-w-[220px]">
                          <div className="w-12 h-12 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <FiLock className="w-5 h-5 text-white" />
                          </div>
                          <p className="text-sm font-telegraf font-bold text-navy-900 mb-1">
                            {isRTL ? 'قالب مميز' : 'Premium Template'}
                          </p>
                          <p className="text-[11px] text-navy-500 mb-3">
                            {isRTL ? 'قم بالترقية لاستخدام هذا القالب' : 'Upgrade to use this template'}
                          </p>
                          <button
                            onClick={() => isAuthenticated ? setShowUpgradeModal(true) : setShowAuthModal(true)}
                            className="text-xs font-semibold px-4 py-2 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-brand hover:from-accent-600 hover:to-accent-700 shadow-brand-soft hover:shadow-brand-md transition-all"
                          >
                            {isAuthenticated ? (isRTL ? 'ترقية الخطة' : 'Upgrade Plan') : (isRTL ? 'تسجيل الدخول' : 'Sign Up / Login')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {previewZoom > 100 && (
                    <>
                      <button
                        onClick={() => scrollPreview('left')}
                        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 border border-navy-200 shadow-brand-soft hover:bg-accent-50 hover:border-accent-300 transition-all text-navy-500 hover:text-accent-600"
                        title={isRTL ? 'تمرير لليمين' : 'Scroll Left'}
                      >
                        <FiArrowLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => scrollPreview('right')}
                        className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 border border-navy-200 shadow-brand-soft hover:bg-accent-50 hover:border-accent-300 transition-all text-navy-500 hover:text-accent-600"
                        title={isRTL ? 'تمرير لليسار' : 'Scroll Right'}
                      >
                        <FiArrowRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
        }}
      />

      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-brand-lg p-6 max-w-sm w-full mx-4 text-center shadow-brand-md">
            <div className="w-14 h-14 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiStar className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-telegraf font-bold text-navy-900 mb-2">
              {isRTL ? 'ترقية إلى الخطة المميزة' : 'Upgrade to Premium'}
            </h3>
            <p className="text-sm text-navy-500 mb-5">
              {isRTL
                ? 'احصل على وصول كامل لجميع القوالب المميزة وميزات الذكاء الاصطناعي المتقدمة.'
                : 'Get full access to all premium templates and advanced AI features.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-2.5 border-2 border-navy-200 rounded-brand text-sm text-navy-600 hover:bg-navy-50 transition-colors font-medium"
              >
                {isRTL ? 'لاحقاً' : 'Maybe Later'}
              </button>
              <button
                onClick={() => { setShowUpgradeModal(false); router.push('/pricing'); }}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-brand text-sm font-semibold hover:from-accent-600 hover:to-accent-700 shadow-brand-soft hover:shadow-brand-md transition-all"
              >
                {isRTL ? 'عرض الخطط' : 'View Plans'}
              </button>
            </div>
          </div>
        </div>
      )}

      <RegenerateModal
        isOpen={regenModal.open}
        onClose={() => setRegenModal({ open: false, fieldType: '', fieldLabel: '', currentValue: '' })}
        onSelect={handleRegenSelect}
        originalContent={regenModal.currentValue}
        variations={regenVariations}
        loading={regenLoading}
        error={regenError}
        isArabic={cvIsArabic}
        fieldLabel={regenModal.fieldLabel}
      />

      {successToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-400 text-white px-6 py-3.5 rounded-brand shadow-brand-md text-sm font-semibold">
            <FiCheck className="w-4 h-4" />
            {cvIsArabic ? 'تم تحديث المحتوى بنجاح' : 'Content updated successfully'}
          </div>
        </div>
      )}

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-brand-md z-40" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
        {autoSaveStatus === 'saving' && (
          <div className="px-4 pt-2">
            <span className="flex items-center gap-1.5 text-xs text-navy-400">
              <FiLoader className="w-3 h-3 animate-spin" />
              {isRTL ? 'حفظ...' : 'Saving...'}
            </span>
          </div>
        )}
        {autoSaveStatus === 'saved' && (
          <div className="px-4 pt-2">
            <span className="flex items-center gap-1.5 text-xs text-accent-600">
              <FiCheck className="w-3 h-3" />
              {isRTL ? 'تم الحفظ' : 'Saved'}
            </span>
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
          {isAuthenticated ? (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-brand font-semibold text-sm bg-brand-orange text-white shadow-brand-soft hover:shadow-brand-md transition-all disabled:opacity-60 min-h-[48px]"
            >
              {downloading ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiDownload className="w-4 h-4" />}
              {downloading ? (isRTL ? 'جاري...' : 'Loading...') : labels.download}
            </button>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-brand font-semibold text-sm bg-brand-orange text-white shadow-brand-soft hover:shadow-brand-md transition-all min-h-[48px]"
            >
              <FiDownload className="w-4 h-4" />
              {labels.download}
            </button>
          )}
        </div>
      </div>

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
          <div className="flex-1 overflow-auto bg-gray-100 p-2 relative">
            {cvData.personalInfo.fullName ? (
              <div className="bg-white rounded-lg shadow-lg mx-auto relative" style={{ maxWidth: '800px' }}>
                <div style={{ 
                  transform: 'scale(0.5)', 
                  transformOrigin: 'top center', 
                  width: '200%', 
                  marginLeft: '-50%',
                  filter: !isAuthenticated ? 'blur(4px)' : 'none',
                  pointerEvents: !isAuthenticated ? 'none' : 'auto'
                }}>
                  <TemplateComponent
                    data={templateData}
                    previewMode={true}
                    isArabic={cvIsRTL}
                    settings={{
                      primaryColor: selectedColor.primary,
                      accentColor: selectedColor.accent,
                      photoUrl: cvData.personalInfo?.photo || user?.profilePicture || undefined,
                    }}
                  />
                </div>
                {!isAuthenticated && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm rounded-lg">
                    <div className="flex flex-col items-center justify-center gap-4 bg-white/95 px-6 py-8 rounded-xl shadow-lg max-w-xs text-center">
                      <FiLock className="w-12 h-12 text-accent-600" />
                      <h4 className="text-lg font-semibold text-gray-900">
                        {isRTL ? 'معاينة محصورة' : 'Preview Limited'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {isRTL ? 'سجل الدخول لرؤية المعاينة الكاملة' : 'Sign in to view full preview'}
                      </p>
                      <button
                        onClick={() => { setShowMobilePreview(false); setShowAuthModal(true); }}
                        className="px-6 py-2.5 bg-accent-600 text-white rounded-brand font-semibold hover:bg-accent-700 transition-colors text-sm"
                      >
                        {isRTL ? 'دخول' : 'Sign In'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <p>{isRTL ? 'أدخل بياناتك لمعاينة السيرة الذاتية' : 'Enter your data to preview CV'}</p>
              </div>
            )}
          </div>
          <div className="bg-white border-t border-gray-200 p-3 flex-shrink-0" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
            <div className="flex gap-2">
              <button
                onClick={() => setShowMobilePreview(false)}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-brand font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all min-h-[48px]"
              >
                {isRTL ? 'رجوع للتعديل' : 'Back to Edit'}
              </button>
              {isAuthenticated ? (
                <button
                  onClick={() => { setShowMobilePreview(false); handleDownload(); }}
                  disabled={downloading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-brand font-semibold text-sm bg-brand-orange text-white shadow-brand-soft hover:shadow-brand-md transition-all disabled:opacity-60 min-h-[48px]"
                >
                  <FiDownload className="w-4 h-4" />
                  {labels.download}
                </button>
              ) : (
                <button
                  onClick={() => { setShowMobilePreview(false); setShowAuthModal(true); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-brand font-semibold text-sm bg-brand-orange text-white shadow-brand-soft hover:shadow-brand-md transition-all min-h-[48px]"
                >
                  <FiDownload className="w-4 h-4" />
                  {labels.download}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
        <FiLoader className="w-8 h-8 animate-spin text-accent-500" />
      </div>
    }>
      <PreviewContent />
    </Suspense>
  );
}
