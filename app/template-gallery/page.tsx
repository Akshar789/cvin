'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { FiSearch, FiX, FiArrowLeft, FiCheck, FiLock, FiLoader, FiGlobe, FiType } from 'react-icons/fi';

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

interface DBTemplate {
  id: number;
  name: string;
  description: string | null;
  isPremium: boolean;
  language: string;
  previewImage: string | null;
  cssStyles: any;
  layout: any;
  createdAt: string;
}

const sampleData = {
  title: 'Professional CV',
  personalInfo: {
    name: 'Sarah Johnson',
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/sarahjohnson',
    nationality: 'United States',
    professionalTitle: 'Senior Product Manager',
    targetJobTitle: 'Senior Product Manager',
    targetJobDomain: 'Technology',
    photo: '',
  },
  summary: 'Results-driven Senior Product Manager with 8+ years of experience leading cross-functional teams to deliver innovative digital products. Proven track record of increasing user engagement by 45% and driving $2M+ in annual recurring revenue growth through data-driven product strategies.',
  professionalSummary: 'Results-driven Senior Product Manager with 8+ years of experience leading cross-functional teams to deliver innovative digital products. Proven track record of increasing user engagement by 45% and driving $2M+ in annual recurring revenue growth through data-driven product strategies.',
  experience: [
    {
      company: 'TechCorp Solutions',
      position: 'Senior Product Manager',
      title: 'Senior Product Manager',
      location: 'San Francisco, CA',
      startDate: '2020',
      endDate: 'Present',
      description: 'Leading product strategy for the company\'s flagship SaaS platform serving 50K+ users.',
      achievements: [
        'Increased user engagement by 45% through redesigned onboarding flow',
        'Led cross-functional team of 12 engineers, designers, and analysts',
        'Drove $2M ARR growth through new feature launches and pricing optimization',
      ],
    },
    {
      company: 'InnovateTech Inc.',
      position: 'Product Manager',
      title: 'Product Manager',
      location: 'New York, NY',
      startDate: '2016',
      endDate: '2020',
      description: 'Managed product lifecycle for mobile applications with 1M+ downloads.',
      achievements: [
        'Launched 3 successful products reaching 500K+ users in first year',
        'Reduced customer churn by 30% through feedback-driven improvements',
        'Established product analytics framework used company-wide',
      ],
    },
  ],
  education: [
    {
      institution: 'Stanford University',
      school: 'Stanford University',
      degree: 'Master of Business Administration',
      field: 'Technology Management',
      fieldOfStudy: 'Technology Management',
      startDate: '2016',
      endDate: '2018',
      graduationYear: '2018',
      description: 'Focus on Product Management and Technology Strategy',
    },
    {
      institution: 'University of California, Berkeley',
      school: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      fieldOfStudy: 'Computer Science',
      startDate: '2012',
      endDate: '2016',
      graduationYear: '2016',
      description: 'Minor in Business Administration',
    },
  ],
  skills: [
    {
      category: 'Product Management',
      skillsList: ['Product Strategy', 'Roadmap Planning', 'User Research', 'A/B Testing'],
    },
    {
      category: 'Technical Skills',
      skillsList: ['SQL', 'Analytics', 'Agile/Scrum', 'JIRA'],
    },
    {
      category: 'Leadership',
      skillsList: ['Team Management', 'Stakeholder Communication', 'Strategic Planning'],
    },
  ],
  languages: [
    { name: 'English', language: 'English', level: 'Native', proficiency: 'Native' },
    { name: 'Spanish', language: 'Spanish', level: 'Professional', proficiency: 'Professional' },
    { name: 'French', language: 'French', level: 'Intermediate', proficiency: 'Intermediate' },
  ],
  certifications: [
    { name: 'Certified Scrum Product Owner (CSPO)', title: 'Certified Scrum Product Owner (CSPO)', issuer: 'Scrum Alliance', organization: 'Scrum Alliance', date: '2021' },
    { name: 'Google Analytics Certified', title: 'Google Analytics Certified', issuer: 'Google', organization: 'Google', date: '2020' },
  ],
};

const sampleDataAr = {
  title: 'السيرة الذاتية المهنية',
  personalInfo: {
    name: 'سارة أحمد',
    fullName: 'سارة أحمد',
    email: 'sarah.ahmed@email.com',
    phone: '+966 50 200 2002',
    location: 'الرياض، المملكة العربية السعودية',
    linkedin: 'linkedin.com/in/saraahmed',
    nationality: 'سعودية',
    professionalTitle: 'مديرة منتجات أولى',
    targetJobTitle: 'مديرة منتجات أولى',
    targetJobDomain: 'التكنولوجيا',
    photo: '',
  },
  summary: 'مديرة منتجات أولى تتمتع بخبرة تزيد عن 8 سنوات في قيادة فرق متعددة الوظائف لتقديم منتجات رقمية مبتكرة. سجل حافل في زيادة تفاعل المستخدمين بنسبة 45٪ ودفع نمو الإيرادات السنوية المتكررة بأكثر من 2 مليون دولار.',
  professionalSummary: 'مديرة منتجات أولى تتمتع بخبرة تزيد عن 8 سنوات في قيادة فرق متعددة الوظائف لتقديم منتجات رقمية مبتكرة.',
  experience: [
    {
      company: 'تك كورب سولوشنز',
      position: 'مديرة منتجات أولى',
      title: 'مديرة منتجات أولى',
      location: 'الرياض',
      startDate: '2020',
      endDate: 'الحاضر',
      description: 'قيادة استراتيجية المنتج لمنصة SaaS الرئيسية.',
      achievements: [
        'زيادة تفاعل المستخدمين بنسبة 45٪',
        'قيادة فريق من 12 مهندساً ومصمماً',
        'تحقيق نمو بقيمة 2 مليون دولار',
      ],
    },
  ],
  education: [
    {
      institution: 'جامعة الملك سعود',
      school: 'جامعة الملك سعود',
      degree: 'ماجستير إدارة الأعمال',
      field: 'إدارة التكنولوجيا',
      fieldOfStudy: 'إدارة التكنولوجيا',
      startDate: '2016',
      endDate: '2018',
      graduationYear: '2018',
    },
  ],
  skills: [
    { category: 'إدارة المنتجات', skillsList: ['استراتيجية المنتج', 'تخطيط خارطة الطريق', 'بحث المستخدمين'] },
    { category: 'المهارات التقنية', skillsList: ['SQL', 'التحليلات', 'Agile/Scrum'] },
  ],
  languages: [
    { name: 'العربية', language: 'العربية', level: 'اللغة الأم', proficiency: 'اللغة الأم' },
    { name: 'الإنجليزية', language: 'الإنجليزية', level: 'متقدم', proficiency: 'متقدم' },
  ],
  certifications: [
    { name: 'مالك منتج سكرم معتمد', title: 'مالك منتج سكرم معتمد', issuer: 'Scrum Alliance', organization: 'Scrum Alliance', date: '2021' },
  ],
};

const getTemplateSlug = (template: DBTemplate): string => {
  return template.cssStyles?.templateId || template.name.toLowerCase().replace(/\s+/g, '-');
};

const renderTemplatePreview = (templateSlug: string, isRTL: boolean = false) => {
  const defaultSettings = {
    primaryColor: '#1e40af',
    accentColor: '#3b82f6',
    headerBg: '#1e3a8a',
    photoUrl: '',
  };

  const commonProps = {
    data: isRTL ? sampleDataAr : sampleData,
    previewMode: true,
    isArabic: isRTL,
    settings: defaultSettings,
  };

  switch (templateSlug) {
    case 'classic':
      return <ClassicTemplate {...commonProps} />;
    case 'simple-professional':
      return <SimpleProfessionalTemplate {...commonProps} />;
    case 'minimalist-clean':
      return <MinimalistCleanTemplate {...commonProps} />;
    case 'modern':
      return <ModernTemplate {...commonProps} />;
    case 'executive':
      return <ExecutiveTemplate {...commonProps} />;
    case 'creative':
      return <CreativeTemplate {...commonProps} />;
    case 'executive-clean-pro':
      return <ExecutiveCleanProTemplate {...commonProps} />;
    case 'structured-sidebar-pro':
      return <StructuredSidebarProTemplate {...commonProps} />;
    case 'global-professional':
      return <GlobalProfessionalTemplate {...commonProps} />;
    case 'ats-ultra-pro':
      return <ATSUltraProTemplate {...commonProps} />;
    case 'smart':
      return <SmartTemplate {...commonProps} />;
    case 'strong':
      return <StrongTemplate {...commonProps} />;
    case 'elegant':
      return <ElegantTemplate {...commonProps} />;
    case 'compact':
      return <CompactTemplate {...commonProps} />;
    case 'two-column-pro':
      return <TwoColumnProTemplate {...commonProps} />;
    case 'clean-modern':
      return <CleanModernTemplate {...commonProps} />;
    case 'professional-edge':
      return <ProfessionalEdgeTemplate {...commonProps} />;
    case 'metro':
      return <MetroTemplate {...commonProps} />;
    case 'fresh-start':
      return <FreshStartTemplate {...commonProps} />;
    case 'nordic':
      return <NordicTemplate {...commonProps} />;
    default:
      return null;
  }
};

export default function TemplateGalleryPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { isRTL, language, setLanguage } = useLanguage();
  const [templates, setTemplates] = useState<DBTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'free' | 'premium'>('all');
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectingTemplateId, setSelectingTemplateId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [cvContentLang, setCvContentLang] = useState<'en' | 'ar'>(language as 'en' | 'ar');
  const [cvDirection, setCvDirection] = useState<'ltr' | 'rtl'>(language === 'ar' ? 'rtl' : 'ltr');
  const cvIsArabic = cvContentLang === 'ar';
  const prevGlobalLangRef = React.useRef(language);

  useEffect(() => {
    if (language !== prevGlobalLangRef.current) {
      prevGlobalLangRef.current = language;
      const globalLang = language as 'en' | 'ar';
      setCvContentLang(globalLang);
      const dir = globalLang === 'ar' ? 'rtl' : 'ltr';
      setCvDirection(dir);
      sessionStorage.setItem('cvContentLanguage', globalLang);
      sessionStorage.setItem('cvContentDirection', dir);
    }
  }, [language]);

  const handleCvLangChange = (lang: 'en' | 'ar') => {
    setCvContentLang(lang);
    sessionStorage.setItem('cvContentLanguage', lang);
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    setCvDirection(dir);
    sessionStorage.setItem('cvContentDirection', dir);
    setLanguage(lang);
  };

  const tierToCheck = (user?.subscriptionTier || 'free').toLowerCase().trim();
  const canAccessPremium = tierToCheck !== 'free' && tierToCheck !== '';

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch('/api/templates?showAll=true', { headers });
      const data = await response.json();
      if (data.success && data.templates) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(t => {
    if (filterType === 'free') return !t.isPremium;
    if (filterType === 'premium') return t.isPremium;
    return true;
  }).filter(t => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const nameAr = t.cssStyles?.nameAr || '';
    return t.name.toLowerCase().includes(query) || nameAr.toLowerCase().includes(query);
  }).sort((a, b) => {
    if (a.isPremium === b.isPremium) return 0;
    return a.isPremium ? 1 : -1;
  });

  const handleSelectTemplate = async (template: DBTemplate) => {
    if (template.isPremium && !canAccessPremium) {
      router.push('/pricing');
      return;
    }

    const templateSlug = getTemplateSlug(template);
    setSaving(true);
    setSelectingTemplateId(template.id);

    try {
      if (token) {
        await fetch('/api/user/update-template', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ templateId: templateSlug }),
        });
      }

      sessionStorage.setItem('selectedTemplate', templateSlug);
      sessionStorage.setItem('selectedTemplateName', template.name);
      sessionStorage.setItem('selectedTemplateDbId', String(template.id));
      sessionStorage.setItem('cvContentLanguage', cvContentLang);
      sessionStorage.setItem('cvContentDirection', cvDirection);
      router.push(`/cv/create?template=${templateSlug}`);
    } catch (error) {
      console.error('Error saving template selection:', error);
      sessionStorage.setItem('selectedTemplate', templateSlug);
      sessionStorage.setItem('selectedTemplateName', template.name);
      sessionStorage.setItem('cvContentLanguage', cvContentLang);
      sessionStorage.setItem('cvContentDirection', cvDirection);
      router.push(`/cv/create?template=${templateSlug}`);
    }
  };

  const previewTemplateData = previewTemplate
    ? templates.find(t => getTemplateSlug(t) === previewTemplate)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8f9fc' }} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <FiLoader className="w-8 h-8 animate-spin text-accent-500 mx-auto mb-4" />
          <p className="text-navy-500 font-body">{isRTL ? 'جارٍ تحميل القوالب...' : 'Loading templates...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fc' }} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-turquoise-500 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 relative z-10">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-navy-200 hover:text-white mb-6 transition-colors">
            <FiArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
          </Link>

          <h1 className="font-telegraf text-3xl md:text-4xl font-bold text-white mb-2">
            {isRTL ? 'اختر قالبك' : 'Choose Your Template'}
          </h1>
          <p className="text-navy-200 text-base md:text-lg max-w-2xl mb-8">
            {isRTL
              ? 'اختر من بين 15 قالباً احترافياً مصمماً لتناسب جميع المجالات المهنية'
              : 'Browse our collection of professionally designed CV templates crafted for every career path'}
          </p>

          <div className="sticky top-0 z-30 flex flex-wrap items-center gap-4 bg-white/10 backdrop-blur-md rounded-brand-lg p-4 border border-white/10">
            <div className="flex items-center gap-2">
              <FiGlobe className="w-4 h-4 text-accent-400" />
              <span className="text-sm font-medium text-white">
                {isRTL ? 'لغة السيرة الذاتية' : 'CV Language'}
              </span>
              <div className="flex items-center gap-1 bg-navy-950/50 rounded-full p-0.5">
                <button
                  onClick={() => handleCvLangChange('en')}
                  className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all min-h-[36px] ${
                    cvContentLang === 'en'
                      ? 'bg-accent-500 text-white shadow-sm'
                      : 'text-navy-200 hover:text-white'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => handleCvLangChange('ar')}
                  className={`px-4 py-1.5 text-xs font-medium rounded-full transition-all min-h-[36px] ${
                    cvContentLang === 'ar'
                      ? 'bg-accent-500 text-white shadow-sm'
                      : 'text-navy-200 hover:text-white'
                  }`}
                >
                  العربية
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FiType className="w-4 h-4 text-accent-400" />
              <span className="text-sm font-medium text-white">
                {isRTL ? 'اتجاه النص' : 'Direction'}
              </span>
              <div className="flex items-center gap-1 bg-navy-950/50 rounded-full p-0.5">
                <span className="px-4 py-1.5 text-xs font-medium rounded-full bg-accent-500 text-white shadow-sm min-h-[36px] flex items-center">
                  {cvDirection === 'rtl' ? 'RTL' : 'LTR'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-1 pb-16 md:pb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-6">
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all' as const, label: isRTL ? 'الكل' : 'All', count: templates.length },
              { key: 'free' as const, label: isRTL ? 'مجاني' : 'Free', count: templates.filter(t => !t.isPremium).length },
              { key: 'premium' as const, label: isRTL ? 'متميز' : 'Premium', count: templates.filter(t => t.isPremium).length },
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setFilterType(filter.key)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2 min-h-[44px] ${
                  filterType === filter.key
                    ? 'bg-accent-500 text-white shadow-md'
                    : 'bg-white text-navy-700 hover:bg-navy-50 border-2 border-navy-200 hover:border-navy-400'
                }`}
              >
                {filter.label}
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  filterType === filter.key ? 'bg-white/25 text-white' : 'bg-navy-100 text-navy-600'
                }`}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRTL ? 'ابحث عن قالب...' : 'Search templates...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-brand border-2 border-navy-200 bg-white text-navy-900 text-sm placeholder:text-navy-400 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-100 transition-all min-h-[44px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => {
            const templateSlug = getTemplateSlug(template);
            const nameAr = template.cssStyles?.nameAr || template.name;
            const features = template.cssStyles?.features || [];
            const featuresAr = template.cssStyles?.featuresAr || [];

            return (
              <div
                key={template.id}
                className="group bg-white rounded-brand-lg shadow-card overflow-hidden hover:shadow-card-hover hover:scale-[1.02] hover:border-accent-300 border-2 border-transparent transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredTemplate(templateSlug)}
                onMouseLeave={() => setHoveredTemplate(null)}
                onClick={() => setPreviewTemplate(templateSlug)}
              >
                <div className="relative overflow-hidden bg-navy-50/50 rounded-t-brand-lg" style={{ aspectRatio: '210/270', direction: 'ltr' }}>
                  <div
                    className="absolute overflow-hidden pointer-events-none"
                    style={{
                      top: 0,
                      left: 0,
                      width: '793.7px',
                      height: '1122.5px',
                      transform: 'scale(var(--preview-scale, 0.3))',
                      transformOrigin: 'top left',
                    }}
                    ref={(el) => {
                      if (el) {
                        const parent = el.parentElement;
                        if (parent) {
                          const scale = parent.offsetWidth / 793.7;
                          el.style.setProperty('--preview-scale', String(scale));
                        }
                      }
                    }}
                  >
                    {renderTemplatePreview(templateSlug, cvIsArabic)}
                  </div>

                  {template.isPremium ? (
                    <div className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} z-20`}>
                      <span className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-accent-500 text-white text-[11px] font-bold rounded-full shadow-md flex items-center gap-1">
                        <FiLock className="w-3 h-3" />
                        Premium
                      </span>
                    </div>
                  ) : (
                    <div className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} z-20`}>
                      <span className="px-2.5 py-1 bg-emerald-500 text-white text-[11px] font-bold rounded-full shadow-md">
                        {isRTL ? 'مجاني' : 'Free'}
                      </span>
                    </div>
                  )}

                  {template.isPremium && !canAccessPremium && (
                    <div className="absolute inset-0 bg-navy-900/10 z-10 pointer-events-none" />
                  )}

                  {selectingTemplateId === template.id ? (
                    <div className="absolute inset-0 bg-navy-900/60 z-[30] flex items-center justify-center">
                      <div className="bg-white rounded-brand px-5 py-4 shadow-brand-xl flex flex-col items-center gap-2">
                        <FiLoader className="w-6 h-6 animate-spin text-accent-500" />
                        <span className="text-xs font-semibold text-navy-800">
                          {isRTL ? 'جاري تحديد القالب...' : 'Selecting...'}
                        </span>
                      </div>
                    </div>
                  ) : hoveredTemplate === templateSlug && !saving && (
                    <div className="absolute inset-0 bg-navy-900/40 z-[25] flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewTemplate(templateSlug);
                        }}
                        className="px-5 py-2.5 bg-white text-navy-800 text-sm font-semibold rounded-brand hover:bg-navy-50 transition-all shadow-brand-lg flex items-center gap-2 min-h-[44px]"
                      >
                        <FiSearch className="w-4 h-4" />
                        {isRTL ? 'معاينة' : 'Preview'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="px-4 py-4">
                  <h3 className="font-telegraf text-base font-bold text-navy-900 mb-2 truncate">
                    {isRTL ? nameAr : template.name}
                  </h3>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {(isRTL ? featuresAr : features).slice(0, 2).map((feature: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-navy-50 text-navy-600 text-[11px] font-medium rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSelectTemplate(template); }}
                    disabled={saving}
                    className={`w-full py-2.5 rounded-brand text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 min-h-[44px] ${
                      template.isPremium && !canAccessPremium
                        ? 'bg-navy-900 text-white hover:bg-navy-800 shadow-brand-soft'
                        : 'bg-brand-orange text-white hover:bg-brand-orange-dark shadow-brand-soft'
                    } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {selectingTemplateId === template.id ? (
                      <>
                        <FiLoader className="w-4 h-4 animate-spin" />
                        {isRTL ? 'جاري...' : 'Loading...'}
                      </>
                    ) : template.isPremium && !canAccessPremium ? (
                      <>
                        <FiLock className="w-4 h-4" />
                        {isRTL ? 'ترقية' : 'Upgrade'}
                      </>
                    ) : (
                      <>
                        <FiCheck className="w-4 h-4" />
                        {isRTL ? 'استخدم القالب' : 'Use Template'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-16">
            <FiSearch className="w-12 h-12 text-navy-300 mx-auto mb-4" />
            <p className="text-navy-600 font-telegraf text-lg font-semibold">
              {isRTL ? 'لم يتم العثور على قوالب' : 'No templates found'}
            </p>
            <p className="text-navy-400 text-sm mt-1">
              {isRTL ? 'حاول تغيير معايير البحث' : 'Try adjusting your search or filters'}
            </p>
          </div>
        )}
      </div>

      {previewTemplate && previewTemplateData && (
        <div
          className="fixed inset-0 bg-navy-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="relative bg-white rounded-brand-xl shadow-brand-xl max-w-[95vw] max-h-[95vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-navy-100 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <h2 className="font-telegraf text-xl font-bold text-navy-900">
                  {isRTL ? (previewTemplateData.cssStyles?.nameAr || previewTemplateData.name) : previewTemplateData.name}
                </h2>
                {previewTemplateData.isPremium && (
                  <span className="px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-accent-500 text-white text-xs font-bold rounded-full">
                    {isRTL ? 'متميز' : 'Premium'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setPreviewTemplate(null);
                    handleSelectTemplate(previewTemplateData);
                  }}
                  disabled={saving}
                  className={`px-5 py-2.5 rounded-brand font-semibold transition-all duration-300 flex items-center gap-2 min-h-[44px] ${
                    previewTemplateData.isPremium && !canAccessPremium
                      ? 'bg-navy-900 text-white hover:bg-navy-800'
                      : 'bg-brand-orange text-white hover:bg-brand-orange-dark'
                  } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {selectingTemplateId === previewTemplateData.id ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      {isRTL ? 'جاري التحميل...' : 'Loading...'}
                    </>
                  ) : previewTemplateData.isPremium && !canAccessPremium ? (
                    <>
                      <FiLock className="w-4 h-4" />
                      {isRTL ? 'ترقية للاستخدام' : 'Upgrade to Use'}
                    </>
                  ) : (
                    <>
                      <FiCheck className="w-4 h-4" />
                      {isRTL ? 'استخدم هذا القالب' : 'Use This Template'}
                    </>
                  )}
                </button>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="p-2.5 hover:bg-navy-50 rounded-brand transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <FiX className="w-5 h-5 text-navy-500" />
                </button>
              </div>
            </div>

            <div className="overflow-auto p-8" style={{ maxHeight: 'calc(95vh - 80px)', backgroundColor: '#f8f9fc' }}>
              <div className="flex justify-center" style={{ direction: 'ltr' }}>
                <div className="bg-white shadow-brand-xl rounded-brand" style={{ width: '210mm', minHeight: '297mm' }}>
                  {renderTemplatePreview(previewTemplate, cvIsArabic)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
