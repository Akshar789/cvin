'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import StepNavigation from '@/components/cv/StepNavigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import TemplatePreview from '@/components/cv-builder/TemplatePreview';
import { FiArrowLeft, FiDownload, FiFile, FiCheck, FiLoader, FiSave, FiAlertCircle, FiLock } from 'react-icons/fi';
import axios from 'axios';
import { prepareCvForPersistence } from '@/lib/cv/schema';
import { TEMPLATE_FAMILIES, COLOR_THEMES, getTemplateFamily, getColorTheme, isThemeSupportedByTemplate } from '@/config/templates';

function validateCVForDownload(cvData: any, isRTL: boolean): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!cvData.personalInfo?.fullName && !cvData.personalInfo?.name) {
    errors.push(isRTL ? 'الاسم مطلوب' : 'Name is required');
  }
  if (!cvData.personalInfo?.email) {
    errors.push(isRTL ? 'البريد الإلكتروني مطلوب' : 'Email is required');
  }
  if (!cvData.personalInfo?.phone) {
    errors.push(isRTL ? 'رقم الهاتف مطلوب' : 'Phone number is required');
  }
  
  const summary = cvData.professionalSummary || cvData.summary || '';
  if (!summary || summary.length < 50) {
    errors.push(isRTL ? 'الملخص المهني قصير جداً (50 حرف على الأقل)' : 'Professional summary is too short (min 50 characters)');
  }
  
  if (!cvData.education || cvData.education.length === 0) {
    errors.push(isRTL ? 'يجب إضافة تعليم واحد على الأقل' : 'At least one education entry is required');
  }
  
  let hasSkills = false;
  if (Array.isArray(cvData.skills) && cvData.skills.length > 0) {
    hasSkills = true;
  } else if (typeof cvData.skills === 'object' && cvData.skills) {
    hasSkills = Object.values(cvData.skills).some((arr: any) => Array.isArray(arr) && arr.length > 0);
  }
  if (!hasSkills) {
    errors.push(isRTL ? 'يجب إضافة مهارة واحدة على الأقل' : 'At least one skill is required');
  }
  
  if (!cvData.languages || cvData.languages.length === 0) {
    errors.push(isRTL ? 'يجب إضافة لغة واحدة على الأقل' : 'At least one language is required');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export default function CVDownloadPage() {
  const router = useRouter();
  const { user, token, loading: authLoading, loggingOut } = useAuth();
  const { isRTL, language } = useLanguage();
  const [cvData, setCvData] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('simple-professional');
  const [selectedColorTheme, setSelectedColorTheme] = useState<string>('blue');
  
  // Log template changes for debugging
  useEffect(() => {
    console.log('[Template State] Selected template changed to:', selectedTemplate);
  }, [selectedTemplate]);
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'pdf' | 'docx' | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cvId, setCvId] = useState<number | null>(null);

  const isPremium = user?.subscriptionTier !== 'free';

  const validation = useMemo(() => {
    if (!cvData) return { valid: false, errors: [] };
    return validateCVForDownload(cvData, isRTL);
  }, [cvData, isRTL]);

  const availableColorThemes = useMemo(() => {
    const template = getTemplateFamily(selectedTemplate);
    if (!template) return COLOR_THEMES;
    return COLOR_THEMES.filter(theme => template.supportedColorThemes.includes(theme.id));
  }, [selectedTemplate]);

  useEffect(() => {
    if (!isThemeSupportedByTemplate(selectedTemplate, selectedColorTheme)) {
      const template = getTemplateFamily(selectedTemplate);
      if (template && template.supportedColorThemes.length > 0) {
        setSelectedColorTheme(template.supportedColorThemes[0]);
      }
    }
  }, [selectedTemplate, selectedColorTheme]);

  useEffect(() => {
    if (!authLoading && !user && !loggingOut) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router, loggingOut]);

  const [cvLanguage, setCvLanguage] = useState<string>('en');

  useEffect(() => {
    const storedCV = sessionStorage.getItem('generatedCV');
    if (storedCV) {
      try {
        const parsedCV = JSON.parse(storedCV);
        setCvData(parsedCV);
        if (parsedCV.cvLanguage) {
          setCvLanguage(parsedCV.cvLanguage);
        }
      } catch (e) {
        console.error('Failed to parse CV data:', e);
        router.push('/cv/edit');
        return;
      }
    } else {
      router.push('/cv/edit');
      return;
    }
    
    const savedTemplate = sessionStorage.getItem('selectedTemplate');
    if (savedTemplate) {
      setSelectedTemplate(savedTemplate);
    }

    const savedLanguage = sessionStorage.getItem('cvLanguage');
    if (savedLanguage) {
      setCvLanguage(savedLanguage);
    }
  }, [router]);

  // Map template ID to template type
  const getTemplateType = (): 'ats' | 'attractive' | 'simple-professional' | 'minimalist-clean' => {
    const templateId = String(selectedTemplate).toLowerCase().trim();
    if (templateId === 'minimalist-clean' || templateId === 'minimalist' || templateId === 'white-minimalist') {
      return 'minimalist-clean';
    }
    if (templateId === 'simple-professional' || templateId === 'simple') {
      return 'simple-professional';
    }
    return 'ats';
  };

  const handleSaveCV = async (): Promise<number | null> => {
    if (!token || !cvData) {
      setError(isRTL ? 'يرجى تسجيل الدخول أولاً' : 'Please log in first');
      return null;
    }

    setSaving(true);
    setError(null);

    try {
      let normalizedSkills: any[] = [];
      if (Array.isArray(cvData.skills)) {
        normalizedSkills = cvData.skills.map((skill: any, idx: number) => ({
          id: `skill-${idx}`,
          category: skill.category || 'General',
          skillsList: typeof skill === 'string' ? skill.split(',').map((s: string) => s.trim()) : (skill.skillsList || [])
        }));
      } else if (cvData.skills && typeof cvData.skills === 'object') {
        let idx = 0;
        const skillCategories: Record<string, string> = {
          'technical': 'Technical Skills',
          'soft': 'Soft Skills', 
          'tools': 'Tools & Technologies',
          'professional': 'Professional Skills'
        };
        for (const [key, value] of Object.entries(cvData.skills)) {
          if (Array.isArray(value) && value.length > 0) {
            normalizedSkills.push({
              id: `skill-${idx}`,
              category: skillCategories[key] || key,
              skillsList: value
            });
            idx++;
          }
        }
      }

      const normalizedCvData = {
        ...cvData,
        professionalSummary: cvData.professionalSummary || cvData.summary || '',
        skills: normalizedSkills,
        courses: Array.isArray(cvData.courses) ? cvData.courses.map((course: any, idx: number) => 
          typeof course === 'string' ? { id: `course-${idx}`, name: course.trim() } : course
        ) : (typeof cvData.courses === 'string' ? 
          (cvData.courses as string).split('\n').filter((c: string) => c.trim()).map((c: string, idx: number) => ({
            id: `course-${idx}`,
            name: c.trim()
          })) : []),
        languages: Array.isArray(cvData.languages) ? cvData.languages.map((lang: any, idx: number) => 
          typeof lang === 'string' ? { id: `lang-${idx}`, name: lang, level: 'Fluent' } : lang
        ) : []
      };

      const normalizedData = prepareCvForPersistence(normalizedCvData);

      if (cvId) {
        // Update CV with template information
        await axios.put(
          `/api/cv/${cvId}`,
          {
            ...normalizedData,
            templateId: selectedTemplate,
            language: cvLanguage,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return cvId;
      } else {
        const response = await axios.post(
          '/api/cvs',
          {
            title: `CV - ${cvData.personalInfo?.fullName || cvData.personalInfo?.name || 'Untitled'}`,
            personalInfo: normalizedData.personalInfo,
            summary: normalizedData.summary,
            templateId: selectedTemplate,
            language: cvLanguage,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (!response.data || !response.data.cv || !response.data.cv.id) {
          setError(isRTL ? 'خطأ في استجابة الخادم' : 'Invalid response from server');
          return null;
        }

        const newCvId = response.data.cv.id;
        setCvId(newCvId);
        
        await axios.put(
          `/api/cv/${newCvId}`,
          normalizedData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        return newCvId;
      }
    } catch (error: any) {
      console.error('Save CV error:', error);
      let errorMessage = error.response?.data?.error || (isRTL ? 'فشل في حفظ السيرة الذاتية' : 'Failed to save CV');
      
      // Check if it's a premium template access error
      if (error.response?.status === 403 && error.response?.data?.error?.includes('Premium template')) {
        const templateData = TEMPLATE_FAMILIES.find(t => t.id === selectedTemplate);
        if (templateData?.isPremium) {
          errorMessage = isRTL 
            ? 'هذا القالب يتطلب اشتراكاً مميزاً. يرجى الترقية أو اختيار قالب مجاني.'
            : 'This template requires a premium subscription. Please upgrade or select a free template.';
        }
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async (format: 'pdf' | 'docx') => {
    if (!token || !cvData) {
      setError(isRTL ? 'لا توجد بيانات للتحميل' : 'No data to download');
      return;
    }

    setDownloading(true);
    setDownloadFormat(format);
    setError(null);

    try {
      const savedCvId = await handleSaveCV();
      
      if (!savedCvId) {
        setError(isRTL ? 'فشل في حفظ السيرة الذاتية قبل التحميل' : 'Failed to save CV before download');
        return;
      }

      if (format === 'pdf') {
        const exportUrl = `/api/cv/${savedCvId}/export-pdf?template=${selectedTemplate}&color=${selectedColorTheme}&language=${cvLanguage}`;
        console.log('[Download] Exporting PDF with:', {
          savedCvId,
          selectedTemplate,
          selectedColorTheme,
          cvLanguage,
          exportUrl
        });
        const response = await fetch(exportUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          let errorMessage = 'Failed to generate PDF';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            const errorText = await response.text();
            console.error('PDF export error response:', errorText);
          }
          throw new Error(errorMessage);
        }

        const blob = await response.blob();
        console.log('PDF blob size:', blob.size, 'type:', blob.type);
        
        if (blob.size === 0) {
          throw new Error('Generated PDF is empty. Please try again.');
        }
        
        // Verify it's actually a PDF
        if (!blob.type.includes('pdf') && blob.size > 0) {
          console.warn('Response is not PDF type, but has content. Proceeding with download.');
        }

        const fileName = `${cvData.personalInfo?.fullName || cvData.personalInfo?.name || 'CV'}.pdf`;
        
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        
        if (isIOS) {
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
          }, 10000);
        } else if (isMobile) {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          a.style.display = 'none';
          document.body.appendChild(a);
          
          setTimeout(() => {
            a.click();
            setTimeout(() => {
              window.URL.revokeObjectURL(url);
              document.body.removeChild(a);
            }, 1000);
          }, 100);
        } else {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }
        
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setError(isRTL ? 'تصدير Word قريباً!' : 'Word export coming soon!');
      }
    } catch (error: any) {
      console.error('Download failed:', error);
      const errorMessage = isRTL ? 'فشل في تحميل السيرة الذاتية' : 'Failed to download CV';
      setError(errorMessage);
    } finally {
      setDownloading(false);
      setDownloadFormat(null);
    }
  };

  const handleBack = () => {
    router.push('/cv/design');
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const selectedTemplateData = getTemplateFamily(selectedTemplate);
  const selectedColorData = getColorTheme(selectedColorTheme);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <StepNavigation currentStep="download" language={language} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <FiCheck className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {isRTL ? 'سيرتك الذاتية جاهزة!' : 'Your CV is Ready!'}
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            {isRTL 
              ? 'اختر القالب واللون المفضل، ثم حمّل سيرتك الذاتية'
              : 'Choose your template and color, then download your CV'}
          </p>
        </div>

        {/* Validation Warning */}
        {!validation.valid && validation.errors.length > 0 && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <FiAlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-800 mb-2">
                    {isRTL ? 'تنبيه: معلومات مفقودة' : 'Warning: Missing Information'}
                  </h4>
                  <ul className="text-sm text-amber-700 space-y-1 mb-3">
                    {validation.errors.map((err, idx) => (
                      <li key={idx}>• {err}</li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => router.push('/cv/edit')}
                    variant="outline"
                    size="sm"
                    className="text-amber-700 border-amber-300 hover:bg-amber-100"
                  >
                    {isRTL ? 'العودة للتعديل' : 'Go Back to Edit'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          </div>
        )}

        {saveSuccess && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
              <FiCheck className="w-5 h-5" />
              {isRTL ? 'تم تحميل السيرة الذاتية بنجاح!' : 'CV downloaded successfully!'}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column - Steps */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* STEP 1: Template Selection */}
            <Card className="bg-white shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <h3 className="font-bold text-lg text-white">
                    {isRTL ? 'اختر القالب' : 'Choose Template'}
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {TEMPLATE_FAMILIES.map(template => {
                    const isSelected = selectedTemplate === template.id;
                    const isLocked = template.isPremium && !isPremium;
                    
                    return (
                      <button
                        key={template.id}
                        onClick={() => {
                          if (!isLocked) {
                            console.log('[Template Selection] Selecting template:', template.id);
                            setSelectedTemplate(template.id);
                          }
                        }}
                        disabled={isLocked}
                        className={`
                          relative p-4 rounded-xl border-2 text-${isRTL ? 'right' : 'left'} transition-all duration-200
                          ${isSelected 
                            ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' 
                            : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'}
                          ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        {isLocked && (
                          <div className="absolute top-3 right-3 flex items-center gap-1 bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">
                            <FiLock className="w-3 h-3" />
                            <span>Pro</span>
                          </div>
                        )}
                        
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'bg-indigo-500' : 'bg-gray-100'
                          }`}>
                            {isSelected ? (
                              <FiCheck className="w-5 h-5 text-white" />
                            ) : (
                              <FiFile className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-semibold text-sm mb-1 ${isSelected ? 'text-indigo-700' : 'text-gray-900'}`}>
                              {isRTL ? template.nameAr : template.name}
                            </h4>
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {isRTL ? template.descriptionAr : template.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* STEP 2: Color Selection */}
            <Card className="bg-white shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-pink-500 to-rose-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <h3 className="font-bold text-lg text-white">
                    {isRTL ? 'اختر اللون' : 'Choose Color'}
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-3">
                  {availableColorThemes.map(theme => {
                    const isSelected = selectedColorTheme === theme.id;
                    
                    return (
                      <button
                        key={theme.id}
                        onClick={() => setSelectedColorTheme(theme.id)}
                        className={`
                          group relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200
                          ${isSelected 
                            ? 'bg-gray-100 ring-2 ring-gray-300' 
                            : 'hover:bg-gray-50'}
                        `}
                        title={isRTL ? theme.nameAr : theme.name}
                      >
                        <div 
                          className={`
                            w-12 h-12 rounded-xl shadow-md transition-transform duration-200
                            ${isSelected ? 'scale-110 ring-2 ring-offset-2 ring-gray-400' : 'group-hover:scale-105'}
                          `}
                          style={{ backgroundColor: theme.primary }}
                        >
                          {isSelected && (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiCheck className="w-6 h-6 text-white drop-shadow-sm" />
                            </div>
                          )}
                        </div>
                        <span className={`text-xs font-medium ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                          {isRTL ? theme.nameAr : theme.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
                
                {/* Selected combination display */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    {isRTL ? 'الاختيار الحالي:' : 'Current selection:'}{' '}
                    <span className="font-medium text-gray-800">
                      {isRTL ? selectedTemplateData?.nameAr : selectedTemplateData?.name}
                    </span>
                    {' + '}
                    <span 
                      className="font-medium px-2 py-0.5 rounded text-white text-xs"
                      style={{ backgroundColor: selectedColorData?.primary }}
                    >
                      {isRTL ? selectedColorData?.nameAr : selectedColorData?.name}
                    </span>
                  </p>
                </div>
              </div>
            </Card>

            {/* STEP 3: Download */}
            <Card className="bg-white shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <h3 className="font-bold text-lg text-white">
                    {isRTL ? 'حمّل سيرتك الذاتية' : 'Download Your CV'}
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* PDF Download */}
                  <button
                    onClick={() => handleDownload('pdf')}
                    disabled={downloading}
                    className={`
                      group relative p-5 rounded-xl border-2 transition-all duration-300 text-${isRTL ? 'right' : 'left'}
                      ${downloading && downloadFormat === 'pdf' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-green-400 hover:shadow-lg hover:scale-[1.02] bg-white'
                      }
                    `}
                  >
                    <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                        {downloading && downloadFormat === 'pdf' ? (
                          <FiLoader className="w-8 h-8 text-white animate-spin" />
                        ) : (
                          <FiDownload className="w-8 h-8 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-900 mb-1">
                          {isRTL ? 'تحميل PDF' : 'Download PDF'}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {isRTL ? 'الأفضل للتقديم على الوظائف' : 'Best for job applications'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Free badge */}
                    <div className="absolute top-3 right-3 bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                      {isRTL ? 'مجاني' : 'Free'}
                    </div>
                  </button>

                  {/* Word Download */}
                  <button
                    onClick={() => handleDownload('docx')}
                    disabled={downloading || !isPremium}
                    className={`
                      group relative p-5 rounded-xl border-2 transition-all duration-300 text-${isRTL ? 'right' : 'left'}
                      ${!isPremium 
                        ? 'opacity-70 cursor-not-allowed border-gray-200 bg-gray-50' 
                        : 'border-gray-200 hover:border-blue-400 hover:shadow-lg hover:scale-[1.02] bg-white'}
                    `}
                  >
                    <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className={`p-3 rounded-xl shadow-lg transition-shadow ${
                        !isPremium ? 'bg-gray-400' : 'bg-gradient-to-br from-blue-500 to-blue-600 group-hover:shadow-xl'
                      }`}>
                        <FiFile className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-900 mb-1">
                          {isRTL ? 'تحميل Word' : 'Download Word'}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {isRTL ? 'قابل للتعديل بسهولة' : 'Easy to edit later'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Pro badge */}
                    <div className={`absolute top-3 right-3 flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                      isPremium ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {!isPremium && <FiLock className="w-3 h-3" />}
                      <span>Pro</span>
                    </div>
                  </button>
                </div>

                {/* Save to profile button */}
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} gap-4`}>
                    <Button
                      onClick={async () => {
                        const savedId = await handleSaveCV();
                        if (savedId) {
                          setSaveSuccess(true);
                          setTimeout(() => setSaveSuccess(false), 3000);
                        }
                      }}
                      loading={saving}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <FiSave className="w-4 h-4" />
                      {isRTL ? 'حفظ في حسابي' : 'Save to My Profile'}
                    </Button>
                    <p className="text-sm text-gray-500">
                      {isRTL ? 'احفظ للوصول لاحقاً' : 'Save for later access'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tips Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <span className="text-lg">💡</span>
                {isRTL ? 'نصائح مهمة' : 'Helpful Tips'}
              </h4>
              <ul className="text-sm text-blue-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  {isRTL ? 'استخدم PDF للتقديم على الوظائف عبر الإنترنت' : 'Use PDF format when applying to jobs online'}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  {isRTL ? 'تأكد من صحة معلومات الاتصال قبل التحميل' : 'Double-check your contact information before downloading'}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  {isRTL ? 'احفظ نسخة في حسابك للتعديل المستقبلي' : 'Save a copy to your profile for future edits'}
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <Card className="bg-white shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <FiFile className="w-5 h-5 text-white" />
                    <h3 className="font-bold text-white">
                      {isRTL ? 'المعاينة' : 'Preview'}
                    </h3>
                  </div>
                </div>
                
                <div className="p-4">
                  <div 
                    id="cv-preview"
                    className="max-h-[600px] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-inner"
                  >
                    <div style={{ transform: 'scale(0.7)', transformOrigin: 'top center' }}>
                      {cvData && (() => {
                        // Normalize skills data for preview
                        let normalizedSkills: any[] = [];
                        if (Array.isArray(cvData.skills)) {
                          normalizedSkills = cvData.skills;
                        } else if (cvData.skills && typeof cvData.skills === 'object') {
                          if (cvData.skills.technical && Array.isArray(cvData.skills.technical)) {
                            normalizedSkills.push({ category: cvLanguage === 'ar' ? 'المهارات التقنية' : 'Technical', skillsList: cvData.skills.technical });
                          }
                          if (cvData.skills.soft && Array.isArray(cvData.skills.soft)) {
                            normalizedSkills.push({ category: cvLanguage === 'ar' ? 'المهارات الشخصية' : 'Soft Skills', skillsList: cvData.skills.soft });
                          }
                          if (cvData.skills.tools && Array.isArray(cvData.skills.tools)) {
                            normalizedSkills.push({ category: cvLanguage === 'ar' ? 'الأدوات' : 'Tools', skillsList: cvData.skills.tools });
                          }
                        }
                        
                        const normalizedCvData = {
                          ...cvData,
                          skills: normalizedSkills,
                        };
                        
                        return (
                          <TemplatePreview 
                            template={getTemplateType()} 
                            settings={{
                              primaryColor: selectedColorData?.primary || '#1a73e8',
                              accentColor: selectedColorData?.secondary || '#4285f4',
                              headerBg: '#f8f9fa',
                              photoUrl: '',
                            }}
                            data={normalizedCvData}
                            isRTL={cvLanguage === 'ar'}
                          />
                        );
                      })()}
                    </div>
                  </div>
                  
                  {/* Preview info */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 text-center">
                      {isRTL 
                        ? 'هذه معاينة مصغرة. الملف المحمّل سيكون بالحجم الكامل.'
                        : 'This is a scaled preview. Downloaded file will be full size.'}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className={`flex items-center justify-between mt-8 pt-6 border-t border-gray-200 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Button
            onClick={handleBack}
            variant="outline"
            className="flex items-center gap-2 px-5 py-2.5"
          >
            {isRTL ? (
              <>
                {isRTL ? 'العودة للتصميم' : 'Back to Design'}
                <FiArrowLeft className="w-4 h-4 rotate-180" />
              </>
            ) : (
              <>
                <FiArrowLeft className="w-4 h-4" />
                Back to Design
              </>
            )}
          </Button>

          <Button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-md hover:shadow-lg transition-all"
          >
            {isRTL ? 'الانتقال للوحة التحكم' : 'Go to Dashboard'}
          </Button>
        </div>
      </div>
    </div>
  );
}
