'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { JOB_DOMAINS } from '@/lib/constants/jobDomains';
import { CAREER_LEVELS } from '@/lib/constants/profileOptions';
import SmartSearchDropdown from '@/components/ui/SmartSearchDropdown';
import { getPhoneValidationError, cleanPhoneNumber, normalizeSaudiPhone } from '@/lib/utils/phoneValidation';
import AIGenerationModal from '@/components/cv/AIGenerationModal';
import { FiArrowLeft, FiArrowRight, FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiStar, FiZap, FiEdit3, FiLoader, FiCheckCircle, FiGlobe, FiType, FiCheck } from 'react-icons/fi';

interface LookupData {
  saudiCities: Array<{ id: number; nameEn: string; nameAr: string; region: string }>;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  jobDomain: string;
  careerLevel: string;
  latestJob: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  jobDomain?: string;
  careerLevel?: string;
  latestJob?: string;
}

function BasicInfoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, token } = useAuth();
  const { isRTL } = useLanguage();

  const templateId = searchParams.get('template') || '';
  const storedTemplate = typeof window !== 'undefined' ? sessionStorage.getItem('selectedTemplate') : '';
  const activeTemplate = templateId || storedTemplate || '';

  useEffect(() => {
    if (!activeTemplate && typeof window !== 'undefined') {
      router.replace('/template-gallery');
    }
  }, [activeTemplate, router]);

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    jobDomain: '',
    careerLevel: '',
    latestJob: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [aiLoading, setAiLoading] = useState(false);
  const [manualLoading, setManualLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [resumeChecked, setResumeChecked] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [lookupData, setLookupData] = useState<LookupData>({ saudiCities: [] });

  const [cvContentLang, setCvContentLang] = useState<'en' | 'ar'>('en');
  const [cvDirectionLocal, setCvDirectionLocal] = useState<'ltr' | 'rtl'>('ltr');

  useEffect(() => {
    const savedLang = typeof window !== 'undefined' ? sessionStorage.getItem('cvContentLanguage') as 'en' | 'ar' | null : null;
    const savedDir = typeof window !== 'undefined' ? sessionStorage.getItem('cvContentDirection') as 'ltr' | 'rtl' | null : null;
    if (savedLang) setCvContentLang(savedLang);
    if (savedDir) setCvDirectionLocal(savedDir);
  }, []);

  const handleCvLangChange = (lang: 'en' | 'ar') => {
    setCvContentLang(lang);
    sessionStorage.setItem('cvContentLanguage', lang);
    if (lang === 'ar') {
      setCvDirectionLocal('rtl');
      sessionStorage.setItem('cvContentDirection', 'rtl');
    } else {
      setCvDirectionLocal('ltr');
      sessionStorage.setItem('cvContentDirection', 'ltr');
    }
  };

  const handleCvDirectionChange = (dir: 'ltr' | 'rtl') => {
    setCvDirectionLocal(dir);
    sessionStorage.setItem('cvContentDirection', dir);
  };

  useEffect(() => {
    fetch('/api/lookups')
      .then(res => res.json())
      .then(data => {
        if (data.saudiCities) {
          setLookupData({ saudiCities: data.saudiCities });
        }
      })
      .catch(err => console.error('Error fetching lookups:', err));
  }, []);

  const jobDomainOptions = useMemo(() =>
    JOB_DOMAINS.map(domain => ({
      value: domain.id,
      labelEn: domain.nameEn,
      labelAr: domain.nameAr,
      keywords: domain.keywords,
    })),
  []);

  const careerLevelOptions = useMemo(() =>
    CAREER_LEVELS.map(level => ({
      value: level.value,
      labelEn: level.labelEn,
      labelAr: level.labelAr,
    })),
  []);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        fullName: user.fullName || prev.fullName,
        email: user.email || prev.email,
        phone: user.phoneNumber || prev.phone,
        location: user.location || prev.location,
        jobDomain: user.targetJobDomain || prev.jobDomain,
        careerLevel: user.careerLevel || prev.careerLevel,
        latestJob: user.mostRecentJobTitle || prev.latestJob,
      }));
    }
  }, [user]);

  const isContentArabic = cvContentLang === 'ar';
  const isContentRTL = cvDirectionLocal === 'rtl';

  const validateField = (name: string, value: string): string | undefined => {
    if (!value.trim()) {
      return isRTL ? 'هذا الحقل مطلوب' : 'This field is required';
    }
    if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return isRTL ? 'يرجى إدخال بريد إلكتروني صالح' : 'Please enter a valid email address';
    }
    if (name === 'phone') {
      return getPhoneValidationError(value, isContentArabic);
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof FormData>).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      location: true,
      jobDomain: true,
      careerLevel: true,
      latestJob: true,
    });

    return isValid;
  };

  const handleChange = (name: keyof FormData, value: string) => {
    let sanitized = value;
    if (name === 'phone') {
      sanitized = value.replace(/[^0-9+\s\-()]/g, '');
      if (sanitized.lastIndexOf('+') > 0) {
        sanitized = sanitized.charAt(0) + sanitized.slice(1).replace(/\+/g, '');
      }
    }
    setFormData(prev => ({ ...prev, [name]: sanitized }));
    if (touched[name]) {
      const error = validateField(name, sanitized);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name: keyof FormData) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const checkExistingCV = async (email: string) => {
    if (!email || user || resumeChecked) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    try {
      const response = await fetch(`/api/guest-cv/get-by-email?email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (data.found) {
        setShowResumePrompt(true);
      }
      setResumeChecked(true);
    } catch (error) {
      console.error('Error checking existing CV:', error);
    }
  };

  const handleResumeCV = async () => {
    try {
      const response = await fetch('/api/guest-cv/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await response.json();

      if (data.found && data.data?.cvData) {
        const cvData = data.data.cvData;
        setFormData({
          fullName: cvData.fullName || '',
          email: cvData.email || formData.email,
          phone: cvData.phone || '',
          location: cvData.location || '',
          jobDomain: cvData.jobDomain || '',
          careerLevel: cvData.careerLevel || '',
          latestJob: cvData.latestJob || '',
        });
      }
    } catch (error) {
      console.error('Error resuming CV:', error);
    }
    setShowResumePrompt(false);
  };

  const handleSubmit = async (isAIGeneration: boolean) => {
    if (!validateForm()) return;

    if (isAIGeneration) {
      setAiLoading(true);
    } else {
      setManualLoading(true);
    }

    try {
      if (token) {
        await fetch('/api/user/update-template', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ templateId: activeTemplate }),
        });
      }

      const normalizedPhone = formData.phone ? normalizeSaudiPhone(formData.phone) : '';
      const normalizedFormData = { ...formData, phone: normalizedPhone };
      sessionStorage.setItem('cvBasicInfo', JSON.stringify(normalizedFormData));
      sessionStorage.setItem('selectedTemplate', activeTemplate);

      if (!token) {
        try {
          await fetch('/api/guest-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: formData.email,
              fullName: formData.fullName,
              phone: normalizedPhone,
              location: formData.location,
              jobDomain: formData.jobDomain,
              careerLevel: formData.careerLevel,
              latestJob: formData.latestJob,
              templateId: activeTemplate,
            }),
          });
        } catch (err) {
          console.error('Error saving guest user:', err);
        }
      }

      if (isAIGeneration) {
        setAiLoading(false);
        setGenerating(true);

        try {
          const response = await fetch('/api/guest-cv/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: formData.email,
              fullName: formData.fullName,
              phone: normalizedPhone,
              location: formData.location,
              jobDomain: formData.jobDomain,
              careerLevel: formData.careerLevel,
              latestJob: formData.latestJob,
              templateId: activeTemplate,
              language: cvContentLang,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Generation failed');
          }

          const enrichedCvData = {
            ...data.cvData,
            language: cvContentLang,
            textDirection: cvDirectionLocal,
          };
          sessionStorage.setItem('generatedCvData', JSON.stringify(enrichedCvData));
          sessionStorage.setItem('guestEmail', formData.email);

          await new Promise(resolve => setTimeout(resolve, 2000));

          setGenerating(false);
          router.push(`/cv/preview?template=${activeTemplate}`);
        } catch (error) {
          console.error('AI generation error:', error);
          setGenerating(false);
          alert(isRTL ? 'فشل في إنشاء السيرة الذاتية. حاول مرة أخرى.' : 'Failed to generate CV. Please try again.');
        }
      } else {
        const manualPersonalInfo = {
          fullName: formData.fullName,
          name: formData.fullName,
          email: formData.email,
          phone: normalizedPhone,
          phoneNumber: normalizedPhone,
          location: formData.location,
          targetJobTitle: formData.latestJob,
          targetJobDomain: formData.jobDomain,
        };
        const manualContent = {
          personalInfo: manualPersonalInfo,
          professionalSummary: '',
          summary: '',
          experience: [],
          education: [],
          skills: { technical: [], soft: [], tools: [] },
          certifications: [],
          languages: [],
        };
        const manualCvData: any = {
          generatedContent: manualContent,
          language: cvContentLang,
          textDirection: cvDirectionLocal,
        };
        manualCvData.englishContent = manualContent;
        manualCvData.arabicContent = { ...manualContent, personalInfo: { ...manualPersonalInfo } };

        sessionStorage.setItem('generatedCvData', JSON.stringify(manualCvData));
        sessionStorage.setItem('guestEmail', formData.email);

        await fetch('/api/guest-cv/save-basic-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            templateId: activeTemplate,
            basicInfo: formData,
          }),
        });

        router.push(`/cv/preview?template=${activeTemplate}`);
      }
    } catch (error) {
      console.error('Error saving data:', error);
    } finally {
      setAiLoading(false);
      setManualLoading(false);
    }
  };

  const templateDisplayName = activeTemplate
    ? activeTemplate.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : '';

  const isFormComplete = Object.keys(formData).every(key => formData[key as keyof FormData].trim() !== '');

  const getInputClass = (name: keyof FormData) => {
    const base = 'w-full px-4 py-3 border-2 border-gray-200 rounded-brand text-base focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 focus:outline-none transition-all duration-200 placeholder:text-gray-400 bg-white min-h-[48px]';
    if (touched[name] && errors[name]) {
      return `${base} border-red-400 bg-red-50/50 focus:border-red-400 focus:ring-red-400/20`;
    }
    if (touched[name] && !errors[name] && formData[name].trim()) {
      return `${base} border-green-400`;
    }
    return base;
  };

  const labelClass = 'block text-sm font-medium text-navy-800 mb-1.5';

  const steps = [
    { label: isRTL ? 'القالب' : 'Template', status: 'completed' as const },
    { label: isRTL ? 'المعلومات' : 'Basic Info', status: 'current' as const },
    { label: isRTL ? 'المعاينة' : 'Preview', status: 'upcoming' as const },
  ];

  return (
    <>
      <AIGenerationModal isOpen={generating} />
      <div className="min-h-screen bg-[#f8f9fc]" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="max-w-2xl mx-auto px-4 pt-24 pb-36 md:pb-12">

          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center">
              {steps.map((step, i) => (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <div className={`w-12 sm:w-20 h-0.5 ${
                      step.status === 'completed' || steps[i-1].status === 'completed' && step.status === 'current'
                        ? 'bg-green-400'
                        : 'bg-gray-200'
                    }`} />
                  )}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                      step.status === 'completed'
                        ? 'bg-green-500 text-white'
                        : step.status === 'current'
                          ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/30'
                          : 'bg-gray-200 text-gray-400'
                    }`}>
                      {step.status === 'completed' ? (
                        <FiCheck className="w-4 h-4" />
                      ) : (
                        <span>{i + 1}</span>
                      )}
                    </div>
                    <span className={`text-xs font-medium ${
                      step.status === 'completed'
                        ? 'text-green-600'
                        : step.status === 'current'
                          ? 'text-accent-500'
                          : 'text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="font-telegraf text-2xl font-bold text-navy-900">
              {isRTL ? 'أخبرنا عنك' : 'Tell Us About You'}
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              {isRTL
                ? 'أدخل معلوماتك الأساسية لبناء سيرتك الذاتية'
                : 'Enter your basic information to build your professional CV'}
            </p>
            {templateDisplayName && (
              <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-navy-50 rounded-full text-xs text-navy-600 font-medium">
                <FiStar className="w-3.5 h-3.5 text-accent-500" />
                <span>{templateDisplayName}</span>
              </div>
            )}
          </div>

          <div className="bg-white rounded-brand-lg shadow-card p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <FiGlobe className="w-4 h-4 text-navy-400" />
                <span className="text-sm font-medium text-navy-700">
                  {isRTL ? 'لغة السيرة الذاتية' : 'CV Language'}
                </span>
                <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
                  <button
                    onClick={() => handleCvLangChange('en')}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
                      cvContentLang === 'en'
                        ? 'bg-accent-500 text-white shadow-sm'
                        : 'bg-transparent text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => handleCvLangChange('ar')}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
                      cvContentLang === 'ar'
                        ? 'bg-accent-500 text-white shadow-sm'
                        : 'bg-transparent text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    العربية
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <FiType className="w-4 h-4 text-navy-400" />
                <span className="text-sm font-medium text-navy-700">
                  {isRTL ? 'اتجاه النص' : 'Direction'}
                </span>
                <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
                  <span className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-accent-500 text-white shadow-sm">
                    {cvDirectionLocal === 'rtl' ? 'RTL' : 'LTR'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {showResumePrompt && (
            <div className="mb-6 p-5 bg-accent-50 border border-accent-200 rounded-brand-lg">
              <p className="text-navy-800 font-medium mb-3">
                {isRTL
                  ? 'وجدنا سيرة ذاتية سابقة بهذا البريد الإلكتروني. هل تريد استئناف العمل عليها؟'
                  : 'We found a previous CV with this email. Would you like to resume working on it?'}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleResumeCV}
                  className="px-5 py-2.5 bg-accent-500 text-white rounded-brand hover:bg-accent-600 transition-colors font-semibold min-h-[48px]"
                >
                  {isRTL ? 'نعم، استأنف' : 'Yes, Resume'}
                </button>
                <button
                  onClick={() => setShowResumePrompt(false)}
                  className="px-5 py-2.5 bg-white text-navy-700 border border-navy-900/20 rounded-brand hover:bg-navy-50 transition-colors font-semibold min-h-[48px]"
                >
                  {isRTL ? 'لا، ابدأ من جديد' : 'No, Start Fresh'}
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-brand-lg shadow-card p-6 space-y-5 mb-6" dir={isContentRTL ? 'rtl' : 'ltr'}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-accent-500/10 flex items-center justify-center">
                <FiUser className="w-4 h-4 text-accent-500" />
              </div>
              <h2 className="font-telegraf font-bold text-navy-900 text-lg">
                {isContentArabic ? 'المعلومات الشخصية' : 'Personal Details'}
              </h2>
            </div>

            <div>
              <label className={labelClass}>
                <FiUser className={`w-3.5 h-3.5 inline-block text-navy-400 ${isContentRTL ? 'ml-1.5' : 'mr-1.5'}`} />
                {isContentArabic ? 'الاسم الكامل' : 'Full Name'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                dir={isContentRTL ? 'rtl' : 'ltr'}
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                onBlur={() => handleBlur('fullName')}
                placeholder={isContentArabic ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                className={getInputClass('fullName')}
              />
              {touched.fullName && errors.fullName && (
                <p className="mt-1.5 text-sm text-red-500">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                <FiMail className={`w-3.5 h-3.5 inline-block text-navy-400 ${isContentRTL ? 'ml-1.5' : 'mr-1.5'}`} />
                {isContentArabic ? 'البريد الإلكتروني' : 'Email'} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={(e) => {
                  handleBlur('email');
                  checkExistingCV(e.target.value);
                }}
                placeholder={isContentArabic ? 'أدخل بريدك الإلكتروني' : 'Enter your email address'}
                className={getInputClass('email')}
              />
              {touched.email && errors.email && (
                <p className="mt-1.5 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label className={labelClass}>
                <FiPhone className={`w-3.5 h-3.5 inline-block text-navy-400 ${isContentRTL ? 'ml-1.5' : 'mr-1.5'}`} />
                {isContentArabic ? 'رقم الهاتف' : 'Phone Number'} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                onBlur={() => handleBlur('phone')}
                placeholder="+966 5X XXX XXXX"
                className={getInputClass('phone')}
              />
              {touched.phone && errors.phone && (
                <p className="mt-1.5 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-brand-lg shadow-card p-6 space-y-5 mb-6" dir={isContentRTL ? 'rtl' : 'ltr'}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-accent-500/10 flex items-center justify-center">
                <FiBriefcase className="w-4 h-4 text-accent-500" />
              </div>
              <h2 className="font-telegraf font-bold text-navy-900 text-lg">
                {isContentArabic ? 'المعلومات المهنية' : 'Career Information'}
              </h2>
            </div>

            <div>
              <label className={labelClass}>
                <FiBriefcase className={`w-3.5 h-3.5 inline-block text-navy-400 ${isContentRTL ? 'ml-1.5' : 'mr-1.5'}`} />
                {isContentArabic ? 'مجال العمل المستهدف' : 'Target Job Domain'} <span className="text-red-500">*</span>
              </label>
              <SmartSearchDropdown
                options={jobDomainOptions}
                value={formData.jobDomain}
                onChange={(value) => {
                  handleChange('jobDomain', value);
                  setTouched(prev => ({ ...prev, jobDomain: true }));
                }}
                placeholder="Select your job domain"
                placeholderAr="اختر مجال عملك"
                allowCustom={true}
                customPlaceholder="Type a custom domain..."
                customPlaceholderAr="أدخل مجالاً مخصصاً..."
                className={touched.jobDomain && errors.jobDomain ? 'border-red-400' : ''}
              />
              {touched.jobDomain && errors.jobDomain && (
                <p className="mt-1.5 text-sm text-red-500">{errors.jobDomain}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>
                  <FiStar className={`w-3.5 h-3.5 inline-block text-navy-400 ${isContentRTL ? 'ml-1.5' : 'mr-1.5'}`} />
                  {isContentArabic ? 'المستوى المهني' : 'Career Level'} <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.careerLevel}
                  onChange={(e) => {
                    handleChange('careerLevel', e.target.value);
                    setTouched(prev => ({ ...prev, careerLevel: true }));
                  }}
                  onBlur={() => handleBlur('careerLevel')}
                  className={getInputClass('careerLevel')}
                >
                  <option value="">{isContentArabic ? 'اختر المستوى' : 'Select level'}</option>
                  {careerLevelOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {isContentArabic ? option.labelAr : option.labelEn}
                    </option>
                  ))}
                </select>
                {touched.careerLevel && errors.careerLevel && (
                  <p className="mt-1.5 text-sm text-red-500">{errors.careerLevel}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>
                  <FiBriefcase className={`w-3.5 h-3.5 inline-block text-navy-400 ${isContentRTL ? 'ml-1.5' : 'mr-1.5'}`} />
                  {isContentArabic ? 'آخر وظيفة' : 'Latest Job Title'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  dir={isContentRTL ? 'rtl' : 'ltr'}
                  value={formData.latestJob}
                  onChange={(e) => handleChange('latestJob', e.target.value)}
                  onBlur={() => handleBlur('latestJob')}
                  placeholder={isContentArabic ? 'مثال: مدير مشاريع' : 'e.g., Project Manager'}
                  className={getInputClass('latestJob')}
                />
                {touched.latestJob && errors.latestJob && (
                  <p className="mt-1.5 text-sm text-red-500">{errors.latestJob}</p>
                )}
              </div>
            </div>

            <div>
              <label className={labelClass}>
                <FiMapPin className={`w-3.5 h-3.5 inline-block text-navy-400 ${isContentRTL ? 'ml-1.5' : 'mr-1.5'}`} />
                {isContentArabic ? 'الموقع' : 'Location'} <span className="text-red-500">*</span>
              </label>
              <SmartSearchDropdown
                options={lookupData.saudiCities.map(city => ({
                  value: `${city.nameEn}, Saudi Arabia`,
                  labelEn: `${city.nameEn} (${city.region})`,
                  labelAr: `${city.nameAr}`,
                }))}
                value={formData.location}
                onChange={(value) => {
                  handleChange('location', value);
                  setTouched(prev => ({ ...prev, location: true }));
                }}
                placeholder="Select your city in Saudi Arabia"
                placeholderAr="اختر مدينتك في المملكة العربية السعودية"
                allowCustom={false}
                className={touched.location && errors.location ? 'border-red-400' : ''}
              />
              {touched.location && errors.location && (
                <p className="mt-1.5 text-sm text-red-500">{errors.location}</p>
              )}
            </div>
          </div>

          <div className="hidden md:flex gap-4 mt-8">
            <Link
              href="/template-gallery"
              className="flex items-center justify-center gap-2 border border-navy-900/20 text-navy-700 rounded-brand px-6 py-3 font-medium hover:bg-gray-50 transition-all min-h-[48px]"
            >
              {isRTL ? <FiArrowRight className="w-4 h-4" /> : <FiArrowLeft className="w-4 h-4" />}
              {isRTL ? 'رجوع' : 'Back'}
            </Link>

            <button
              onClick={() => handleSubmit(true)}
              disabled={aiLoading || manualLoading}
              className={`flex-1 flex items-center justify-center gap-2 bg-brand-orange text-white rounded-brand px-8 py-3 font-semibold shadow-brand-soft hover:shadow-brand-md transition-all min-h-[48px] ${
                aiLoading || manualLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {aiLoading ? (
                <FiLoader className="w-5 h-5 animate-spin" />
              ) : (
                <FiZap className="w-5 h-5" />
              )}
              {isRTL ? 'إنشاء بالذكاء الاصطناعي' : 'Generate with AI'}
            </button>

            <button
              onClick={() => handleSubmit(false)}
              disabled={aiLoading || manualLoading}
              className={`flex items-center justify-center gap-2 border border-navy-900/20 text-navy-700 rounded-brand px-6 py-3 font-medium hover:bg-gray-50 transition-all min-h-[48px] ${
                aiLoading || manualLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {manualLoading ? (
                <FiLoader className="w-5 h-5 animate-spin" />
              ) : (
                <FiEdit3 className="w-5 h-5" />
              )}
              {isRTL ? 'متابعة يدوياً' : 'Continue Manually'}
            </button>
          </div>

          {!isFormComplete && (
            <p className="hidden md:block text-center text-sm text-gray-400 mt-3">
              {isRTL ? 'يرجى ملء جميع الحقول المطلوبة للمتابعة' : 'Please fill in all required fields to continue'}
            </p>
          )}
        </div>

        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="flex gap-3">
            <button
              onClick={() => handleSubmit(true)}
              disabled={aiLoading || manualLoading}
              className={`flex-1 flex items-center justify-center gap-2 bg-brand-orange text-white rounded-brand px-4 py-3 font-semibold shadow-brand-soft hover:shadow-brand-md transition-all min-h-[48px] ${
                aiLoading || manualLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {aiLoading ? (
                <FiLoader className="w-5 h-5 animate-spin" />
              ) : (
                <FiZap className="w-5 h-5" />
              )}
              {isRTL ? 'إنشاء بالـ AI' : 'Generate with AI'}
            </button>

            <button
              onClick={() => handleSubmit(false)}
              disabled={aiLoading || manualLoading}
              className={`flex-1 flex items-center justify-center gap-2 border border-navy-900/20 text-navy-700 rounded-brand px-4 py-3 font-medium hover:bg-gray-50 transition-all min-h-[48px] ${
                aiLoading || manualLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {manualLoading ? (
                <FiLoader className="w-5 h-5 animate-spin" />
              ) : (
                <FiEdit3 className="w-5 h-5" />
              )}
              {isRTL ? 'يدوياً' : 'Manual'}
            </button>
          </div>

          {!isFormComplete && (
            <p className="text-center text-xs text-gray-400 mt-2">
              {isRTL ? 'يرجى ملء جميع الحقول المطلوبة' : 'Fill all required fields to continue'}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default function BasicInfoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
        <FiLoader className="w-8 h-8 animate-spin text-accent-500" />
      </div>
    }>
      <BasicInfoContent />
    </Suspense>
  );
}
