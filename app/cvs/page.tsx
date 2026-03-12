'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useCvData } from '@/lib/contexts/CvDataContext';
import TemplatePreview from '@/components/cv-builder/TemplatePreview';
import { TEMPLATE_FAMILIES } from '@/config/templates';
import {
  FiPlus, FiFileText, FiDownload, FiEdit, FiTrash2,
  FiEye, FiX, FiArrowLeft, FiCalendar, FiSearch,
  FiZap, FiStar, FiEdit2,
} from 'react-icons/fi';

interface CVData {
  id: number;
  title: string;
  personalInfo: any;
  summary: string;
  experience: any[];
  education: any[];
  skills: any[];
  languages: any[];
  courses: any[];
  templateId?: string | number;
  templateName?: string;
  colorSettings?: { name?: string; primary?: string; accent?: string } | null;
  language?: string;
  updatedAt?: string;
  createdAt?: string;
}

export default function CVsManagementPage() {
  const router = useRouter();
  const { user, token, loading: authLoading, loggingOut } = useAuth();
  const { isRTL } = useLanguage();
  const { cvs, loading: cvLoading, error: cvError, refreshCvs } = useCvData();

  const [previewCv, setPreviewCv] = useState<CVData | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cvToDelete, setCvToDelete] = useState<CVData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [renamingCvId, setRenamingCvId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [localCvTitles, setLocalCvTitles] = useState<Record<number, string>>({});
  const renameInputRef = useRef<HTMLInputElement>(null);
  const renameCancelledRef = useRef(false);

  const t = (en: string, ar: string) => isRTL ? ar : en;

  const getTemplateSlug = (templateId?: string | number): string => {
    if (!templateId) return 'simple-professional';
    return String(templateId).toLowerCase().trim();
  };

  const getTemplateInfo = (templateId?: string | number) => {
    const slug = getTemplateSlug(templateId);
    return TEMPLATE_FAMILIES.find(tf => tf.id === slug) || null;
  };

  const getCvColors = (cv: any) => {
    const topLevel = cv.colorSettings;
    const pi = typeof cv.personalInfo === 'string' ? JSON.parse(cv.personalInfo) : cv.personalInfo;
    const nested = pi?.colorSettings;
    const colors = topLevel || nested;
    return {
      primaryColor: colors?.primary || '#1a365d',
      accentColor: colors?.accent || '#e07b2a',
    };
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  useEffect(() => {
    if (!authLoading && !user && !loggingOut) router.push('/auth/login');
    else if (!authLoading && user && !user.onboardingCompleted) router.push('/onboarding');
  }, [user, authLoading, router, loggingOut]);

  useEffect(() => {
    if (user && !authLoading) {
      refreshCvs();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const enrichCvForPreview = useCallback((cv: CVData, forceArabic?: boolean): CVData => {
    const pi = typeof cv.personalInfo === 'string' ? JSON.parse(cv.personalInfo) : cv.personalInfo;
    if (!pi) return cv;
    const useArabic = forceArabic || isRTL;
    const primary = useArabic ? pi.arabicContent : pi.englishContent;
    const fallback = useArabic ? pi.englishContent : pi.arabicContent;
    const content = primary || fallback || {};
    const contentPi = content.personalInfo || {};
    // NOTE: hasTopExp/hasTopEdu/hasTopSkills are kept only as a final fallback.
    // Language-specific JSON content (content.experience etc.) always takes priority
    // to prevent mixed-language rendering when UI language differs from the last-saved DB language.
    const hasTopExp = cv.experience && cv.experience.length > 0;
    const hasTopEdu = cv.education && cv.education.length > 0;
    const hasTopSkills = cv.skills && cv.skills.length > 0;
    const displayName = useArabic
      ? (contentPi.fullName || contentPi.name || content.name || content.fullName || pi.fullName || pi.name || '')
      : (pi.fullName || pi.name || contentPi.fullName || content.name || '');
    const displayTitle = useArabic
      ? (contentPi.targetJobTitle || contentPi.professionalTitle || content.professionalTitle || content.targetJobTitle || pi.targetJobTitle || pi.professionalTitle || '')
      : (content.professionalTitle || contentPi.targetJobTitle || pi.targetJobTitle || pi.professionalTitle || '');
    const displayLocation = useArabic
      ? (contentPi.location || content.location || pi.location || '')
      : (pi.location || contentPi.location || content.location || '');
    return {
      ...cv,
      personalInfo: {
        name: displayName,
        fullName: displayName,
        professionalTitle: displayTitle,
        targetJobTitle: displayTitle,
        email: pi.email || content.email || '',
        phone: pi.phone || content.phone || '',
        location: displayLocation,
        nationality: content.nationality || pi.nationality || '',
        linkedin: pi.linkedin || content.linkedin || '',
        photoUrl: pi.photoUrl || '',
      },
      experience: (content.experience && content.experience.length > 0) ? content.experience : (hasTopExp ? cv.experience : (pi.experience || [])),
      education: (content.education && content.education.length > 0) ? content.education : (hasTopEdu ? cv.education : (pi.education || [])),
      skills: (content.skills && content.skills.length > 0) ? content.skills : (hasTopSkills ? cv.skills : (pi.skills || [])),
      summary: content.professionalSummary || pi.professionalSummary || cv.summary || '',
      professionalSummary: content.professionalSummary || pi.professionalSummary || cv.summary || '',
      languages: cv.languages?.length ? cv.languages : (content.languages || pi.languages || []),
      certifications: cv.certifications?.length ? cv.certifications : (content.certifications || pi.certifications || []),
      courses: cv.courses?.length ? cv.courses : (content.courses || pi.courses || []),
    } as CVData;
  }, [isRTL]);

  const openPreview = useCallback(async (cv: CVData) => {
    if (!token) return;
    setLoadingPreview(true);
    const enriched = enrichCvForPreview(cv);
    setPreviewCv(enriched);
    setLoadingPreview(false);
  }, [token, enrichCvForPreview]);

  const closePreview = useCallback(() => {
    setPreviewCv(null);
    setLoadingPreview(false);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closePreview(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closePreview]);

  const handleDelete = async () => {
    if (!cvToDelete || !token) return;
    setDeleting(cvToDelete.id);
    try {
      const endpoint = (cvToDelete as any).isGuest
        ? `/api/guest-cv/${cvToDelete.id}`
        : `/api/cvs/${cvToDelete.id}`;
      await axios.delete(endpoint, { headers: { Authorization: `Bearer ${token}` } });
      if (previewCv?.id === cvToDelete.id) closePreview();
      await refreshCvs();
      setShowDeleteModal(false);
      setCvToDelete(null);
    } catch {
      alert(t('Failed to delete CV', 'فشل في حذف السيرة الذاتية'));
    } finally {
      setDeleting(null);
    }
  };

  const handleDownload = async (cv: CVData, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!token) return;
    try {
      const templateSlug = getTemplateSlug(cv.templateId);
      const colorParam = cv.colorSettings?.primary ? cv.colorSettings.primary.replace('#', '') : '';
      const language = isRTL ? 'ar' : 'en';
      const queryParams = new URLSearchParams({ template: templateSlug, language });
      if (colorParam) queryParams.set('color', colorParam);
      const response = await fetch(`/api/cv/${cv.id}/export-pdf?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(localCvTitles[cv.id] || cv.title || 'CV').replace(/[^a-z0-9]/gi, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      alert(t('Failed to download CV', 'فشل في تحميل السيرة الذاتية'));
    }
  };

  const handleRenameStart = (cv: CVData) => {
    renameCancelledRef.current = false;
    setRenameValue(localCvTitles[cv.id] || cv.title);
    setRenamingCvId(cv.id);
    setTimeout(() => renameInputRef.current?.focus(), 30);
  };

  const handleRenameCancel = () => {
    renameCancelledRef.current = true;
    setRenamingCvId(null);
    setRenameValue('');
  };

  const handleRenameSubmit = async (cv: CVData) => {
    if (renameCancelledRef.current) {
      renameCancelledRef.current = false;
      return;
    }
    const newTitle = renameValue.trim();
    const currentTitle = localCvTitles[cv.id] || cv.title;
    if (!newTitle || newTitle === currentTitle) {
      setRenamingCvId(null);
      return;
    }
    setRenamingCvId(null);
    try {
      await axios.patch(`/api/cv/${cv.id}`, { title: newTitle }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLocalCvTitles(prev => ({ ...prev, [cv.id]: newTitle }));
    } catch {
      alert(t('Failed to rename CV', 'فشل في تغيير اسم السيرة الذاتية'));
    }
  };

  const handleEdit = async (cv: CVData, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if ((cv as any).isGuest) {
      try {
        const res = await axios.post('/api/guest-cv/migrate',
          { guestCvId: cv.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.migrated && res.data.cvId) {
          const migratedTemplate = res.data.templateId || 'simple-professional';
          sessionStorage.setItem('selectedTemplate', migratedTemplate);
          sessionStorage.setItem('editingCvId', String(res.data.cvId));
          await refreshCvs();
          router.push(`/cv/preview?template=${migratedTemplate}`);
        } else {
          alert(t('Failed to migrate CV', 'فشل في نقل السيرة الذاتية'));
        }
      } catch {
        alert(t('Failed to migrate CV', 'فشل في نقل السيرة الذاتية'));
      }
      return;
    }
    const templateSlug = getTemplateSlug(cv.templateId);
    sessionStorage.removeItem('selectedTemplate');
    sessionStorage.removeItem('selectedTemplateName');
    sessionStorage.removeItem('generatedCvData');
    sessionStorage.removeItem('newCvCreationInProgress');
    sessionStorage.setItem('editingCvId', String(cv.id));
    router.push(`/cv/preview?template=${templateSlug}`);
  };

  const openDeleteModal = (cv: CVData, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCvToDelete(cv);
    setShowDeleteModal(true);
  };

  const filteredCvs = cvs.filter(cv =>
    (localCvTitles[cv.id] || cv.title).toLowerCase().includes(searchQuery.toLowerCase()) ||
    cv.personalInfo?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || cvLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">{t('Loading...', 'جاري التحميل...')}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-accent-500/10 blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl translate-y-1/2 -translate-x-1/4" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <Link
            href="/dashboard"
            className={`inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <FiArrowLeft className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
            {t('Back to Dashboard', 'العودة للوحة التحكم')}
          </Link>

          <div className={`flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <div>
              <div className={`flex items-center gap-2 mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-lg bg-accent-500/20 flex items-center justify-center">
                  <FiZap className="w-4 h-4 text-accent-400" />
                </div>
                <span className="text-accent-400 text-xs font-bold uppercase tracking-widest">
                  {t('AI-Powered', 'مدعوم بالذكاء الاصطناعي')}
                </span>
              </div>
              <h1 className="font-telegraf text-3xl sm:text-4xl font-extrabold text-white mb-2">
                {t('My Resumes', 'سيرتي الذاتية')}
              </h1>
              <p className="text-white/50 text-sm">
                {t('Manage and optimize your CVs with AI.', 'إدارة وتحسين سيرك الذاتية بالذكاء الاصطناعي.')}
              </p>
              {cvs.length > 0 && (
                <div className="mt-3 inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-white/70 text-xs font-medium">
                    {cvs.length} {t(cvs.length !== 1 ? 'Resumes' : 'Resume', 'سيرة ذاتية')}
                  </span>
                </div>
              )}
            </div>

            <Link href="/template-gallery">
              <button className="flex items-center gap-2 px-5 py-3 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-accent-500/30 text-sm">
                <FiPlus className="w-4 h-4" />
                {t('Create New CV', 'إنشاء سيرة ذاتية جديدة')}
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {cvError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <FiX className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-800 text-sm">{t('Unable to load your CVs', 'تعذر تحميل السير الذاتية')}</p>
              <p className="text-red-600 text-xs mt-1">{cvError}</p>
              <button onClick={() => refreshCvs()} className="mt-2 text-xs font-semibold text-red-700 underline">
                {t('Try Again', 'حاول مرة أخرى')}
              </button>
            </div>
          </div>
        )}

        {/* Search Bar */}
        {cvs.length > 0 && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <FiSearch className={`absolute top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 ${isRTL ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                placeholder={t('Search your CVs...', 'ابحث في سيرك الذاتية...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full bg-white border border-gray-200 rounded-xl py-2.5 text-sm focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all outline-none ${isRTL ? 'pr-9 pl-4 text-right' : 'pl-9 pr-4'}`}
              />
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredCvs.length === 0 && !cvError && (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-2xl bg-navy-50 flex items-center justify-center mx-auto mb-5">
              <FiFileText className="w-10 h-10 text-navy-300" />
            </div>
            <h2 className="font-telegraf text-2xl font-bold text-navy-900 mb-2">
              {searchQuery ? t('No results found', 'لا توجد نتائج') : t('No CVs yet', 'لا توجد سير ذاتية')}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {searchQuery
                ? t('Try a different search term', 'جرب مصطلح بحث مختلف')
                : t('Create your first professional CV', 'أنشئ سيرتك الذاتية الأولى')}
            </p>
            {!searchQuery && (
              <Link href="/template-gallery">
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-xl transition-colors">
                  <FiPlus className="w-4 h-4" />
                  {t('Create New CV', 'إنشاء سيرة ذاتية جديدة')}
                </button>
              </Link>
            )}
          </div>
        )}

        {/* CV Grid */}
        {filteredCvs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCvs.map((cv) => {
              const templateInfo = getTemplateInfo(cv.templateId);
              const isPremiumTemplate = templateInfo?.isPremium ?? false;
              const templateName = templateInfo
                ? (isRTL ? templateInfo.nameAr : templateInfo.name)
                : getTemplateSlug(cv.templateId);
              const enrichedCv = enrichCvForPreview(cv as CVData);

              return (
                <div
                  key={cv.id}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
                >
                  {/* Thumbnail / Top Preview Area */}
                  <div
                    className="relative bg-gray-50 overflow-hidden cursor-pointer"
                    style={{ height: '220px' }}
                    onClick={() => openPreview(cv as CVData)}
                  >
                    <CardThumbnail
                      enrichedCv={enrichedCv}
                      templateSlug={getTemplateSlug(cv.templateId)}
                      colors={getCvColors(cv)}
                      isRTL={isRTL}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <button
                      onClick={(e) => { e.stopPropagation(); openPreview(cv as CVData); }}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-navy-900 text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
                        <FiEye className="w-3.5 h-3.5" />
                        {t('Preview', 'معاينة')}
                      </span>
                    </button>
                    {isPremiumTemplate && (
                      <div className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'}`}>
                        <span className="flex items-center gap-1 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                          <FiStar className="w-2.5 h-2.5" />
                          {t('Premium', 'مميز')}
                        </span>
                      </div>
                    )}
                    {!isPremiumTemplate && (
                      <div className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'}`}>
                        <span className="bg-green-100 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded-full">
                          {t('Free', 'مجاني')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex-1">
                      <div className={`flex items-center gap-1.5 mb-1 min-w-0 group/rename`}>
                        {renamingCvId === cv.id ? (
                          <input
                            ref={renameInputRef}
                            value={renameValue}
                            onChange={e => setRenameValue(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') { e.preventDefault(); handleRenameSubmit(cv as CVData); }
                              if (e.key === 'Escape') { e.preventDefault(); handleRenameCancel(); }
                            }}
                            onBlur={() => handleRenameSubmit(cv as CVData)}
                            onClick={e => e.stopPropagation()}
                            className="font-telegraf font-bold text-navy-900 text-base border-b-2 border-accent-500 bg-transparent outline-none min-w-0 flex-1 py-0.5"
                            maxLength={100}
                          />
                        ) : (
                          <>
                            <h3 className={`font-telegraf font-bold text-navy-900 text-base leading-tight truncate ${isRTL ? 'text-right' : ''}`}>
                              {localCvTitles[cv.id] || cv.title}
                            </h3>
                            <button
                              onClick={e => { e.stopPropagation(); handleRenameStart(cv as CVData); }}
                              className="flex-shrink-0 text-gray-400 hover:text-accent-500 transition-colors"
                              title={t('Rename', 'إعادة تسمية')}
                            >
                              <FiEdit2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                      <p className={`text-xs text-gray-400 truncate mb-2 ${isRTL ? 'text-right' : ''}`}>
                        {templateName}
                      </p>
                      {cv.updatedAt && (
                        <div className={`flex items-center gap-1.5 text-[11px] text-gray-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <FiCalendar className="w-3 h-3 flex-shrink-0" />
                          <span>{t('Updated', 'تحديث')} {formatDate(cv.updatedAt)}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className={`flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <button
                        onClick={(e) => handleEdit(cv as CVData, e)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-accent-500 hover:bg-accent-600 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        <FiEdit className="w-3.5 h-3.5" />
                        {t('Edit', 'تعديل')}
                      </button>
                      <button
                        onClick={(e) => handleDownload(cv as CVData, e)}
                        className="flex items-center gap-1.5 px-3 py-2 bg-navy-50 hover:bg-navy-100 text-navy-700 text-xs font-semibold rounded-lg transition-colors"
                      >
                        <FiDownload className="w-3.5 h-3.5" />
                        {t('Download', 'تحميل')}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openPreview(cv as CVData); }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold rounded-lg transition-colors"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                        {t('Preview', 'معاينة')}
                      </button>
                      <button
                        onClick={(e) => openDeleteModal(cv as CVData, e)}
                        disabled={deleting === cv.id}
                        className="ml-auto p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title={t('Delete', 'حذف')}
                      >
                        {deleting === cv.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FiTrash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Create New CV Card */}
            <Link href="/template-gallery" className="group">
              <div className="h-full min-h-[320px] rounded-2xl border-2 border-dashed border-gray-200 hover:border-accent-300 hover:bg-accent-50/30 flex flex-col items-center justify-center gap-3 transition-all duration-300 cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-gray-100 group-hover:bg-accent-100 flex items-center justify-center transition-colors">
                  <FiPlus className="w-6 h-6 text-gray-400 group-hover:text-accent-500 transition-colors" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-gray-500 group-hover:text-accent-600 text-sm transition-colors">
                    {t('Create New CV', 'إنشاء سيرة ذاتية جديدة')}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {t('Start from scratch or use AI', 'ابدأ من الصفر أو استخدم الذكاء الاصطناعي')}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewCv && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={closePreview}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-3 min-w-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
                  <FiFileText className="w-4 h-4 text-navy-600" />
                </div>
                <div className={`min-w-0 ${isRTL ? 'text-right' : ''}`}>
                  <h3 className="font-telegraf font-bold text-navy-900 text-sm truncate">{previewCv.title}</h3>
                  <p className="text-[11px] text-gray-400 truncate">
                    {(() => {
                      const info = getTemplateInfo(previewCv.templateId);
                      return info ? (isRTL ? info.nameAr : info.name) : getTemplateSlug(previewCv.templateId);
                    })()}
                  </p>
                </div>
              </div>
              <div className={`flex items-center gap-2 flex-shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button
                  onClick={(e) => handleEdit(previewCv, e)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-500 hover:bg-accent-600 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  <FiEdit className="w-3 h-3" />
                  {t('Edit', 'تعديل')}
                </button>
                <button
                  onClick={(e) => handleDownload(previewCv, e)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-50 hover:bg-navy-100 text-navy-700 text-xs font-semibold rounded-lg transition-colors"
                >
                  <FiDownload className="w-3 h-3" />
                  {t('Download', 'تحميل')}
                </button>
                <button
                  onClick={closePreview}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body - Scrollable Preview */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
              {loadingPreview ? (
                <div className="flex items-center justify-center py-24">
                  <div className="text-center">
                    <div className="w-10 h-10 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-400">{t('Loading preview...', 'جاري تحميل المعاينة...')}</p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
                  <PreviewScaled cv={previewCv} getTemplateSlug={getTemplateSlug} getCvColors={getCvColors} isRTL={isRTL} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && cvToDelete && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
                <FiTrash2 className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="font-telegraf text-lg font-bold text-navy-900 mb-2">
                {t('Delete CV', 'حذف السيرة الذاتية')}
              </h3>
              <p className="text-sm text-gray-500">
                {t(
                  `Are you sure you want to delete "${cvToDelete.title}"? This cannot be undone.`,
                  `هل أنت متأكد أنك تريد حذف "${cvToDelete.title}"؟ لا يمكن التراجع عن هذا الإجراء.`
                )}
              </p>
            </div>
            <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                {t('Cancel', 'إلغاء')}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting === cvToDelete?.id}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors text-sm disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting === cvToDelete?.id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><FiTrash2 className="w-4 h-4" />{t('Delete', 'حذف')}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CardThumbnail({ enrichedCv, templateSlug, colors, isRTL }: {
  enrichedCv: CVData;
  templateSlug: string;
  colors: { primaryColor: string; accentColor: string };
  isRTL: boolean;
}) {
  const A4_W = 794;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.offsetWidth;
      if (w > 0) setScale(w / A4_W);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={containerRef} dir="ltr" className="absolute inset-0 overflow-hidden">
      <div style={{ width: A4_W + 'px', transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        <TemplatePreview
          template={templateSlug}
          settings={{ ...colors, headerBg: '', photoUrl: enrichedCv.personalInfo?.photoUrl || '' }}
          data={enrichedCv as any}
          isRTL={isRTL}
        />
      </div>
    </div>
  );
}

function PreviewScaled({ cv, getTemplateSlug, getCvColors, isRTL }: { cv: CVData; getTemplateSlug: (id?: string | number) => string; getCvColors: (cv: any) => { primaryColor: string; accentColor: string }; isRTL: boolean }) {
  const SCALE = 0.66;
  const A4_W = 794;
  return (
    <div dir="ltr" style={{ width: Math.round(A4_W * SCALE) + 'px', margin: '0 auto', overflow: 'auto', maxHeight: '70vh' }}>
      <div style={{ width: A4_W + 'px', transform: `scale(${SCALE})`, transformOrigin: 'top left', marginBottom: '-34%' }}>
        <TemplatePreview
          template={getTemplateSlug(cv.templateId)}
          settings={{
            ...getCvColors(cv),
            headerBg: '',
            photoUrl: cv.personalInfo?.photoUrl || '',
          }}
          data={cv as any}
          isRTL={isRTL}
        />
      </div>
    </div>
  );
}
