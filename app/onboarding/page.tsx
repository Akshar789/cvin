'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Card from '@/components/ui/Card';
import SmartSearchDropdown from '@/components/ui/SmartSearchDropdown';
import { JOB_DOMAINS } from '@/lib/constants/jobDomains';
import { INDUSTRIES } from '@/lib/constants/profileOptions';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, token, loading, refreshUser } = useAuth();
  const { t, isRTL } = useLanguage();
  const [formData, setFormData] = useState({
    phoneNumber: '',
    location: '',
    targetJobDomain: '',
    careerLevel: '',
    industry: '',
    yearsOfExperience: '',
    educationLevel: '',
    mostRecentJobTitle: '',
    mostRecentCompany: '',
    employmentStatus: '',
    professionalSummary: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [error, setError] = useState('');
  const [aiError, setAiError] = useState('');
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.freeCredits !== undefined) {
      setCreditsRemaining(user.freeCredits);
    }
    if (user) {
      setFormData({
        phoneNumber: user.phoneNumber || '',
        location: user.location || '',
        targetJobDomain: user.targetJobDomain || user.targetJobTitle || '',
        careerLevel: user.careerLevel || '',
        industry: user.industry || '',
        yearsOfExperience: user.yearsOfExperience || '',
        educationLevel: user.educationLevel || '',
        mostRecentJobTitle: user.mostRecentJobTitle || '',
        mostRecentCompany: user.mostRecentCompany || '',
        employmentStatus: user.employmentStatus || '',
        professionalSummary: user.professionalSummary || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGenerateAI = async () => {
    setGeneratingAI(true);
    setAiError('');
    try {
      const response = await axios.post('/api/ai/generate-profile-summary', {
        targetJobDomain: formData.targetJobDomain,
        careerLevel: formData.careerLevel,
        industry: formData.industry,
        yearsOfExperience: formData.yearsOfExperience,
        educationLevel: formData.educationLevel,
        mostRecentJobTitle: formData.mostRecentJobTitle,
        mostRecentCompany: formData.mostRecentCompany,
        employmentStatus: formData.employmentStatus,
      });

      if (!response.data.summary || response.data.summary.trim() === '') {
        setAiError(t.auth.aiEmptyResponse);
      } else {
        setFormData({ ...formData, professionalSummary: response.data.summary });
      }
      
      if (response.data.creditsRemaining !== undefined) {
        setCreditsRemaining(response.data.creditsRemaining);
      }
    } catch (err: any) {
      console.error('AI generation error:', err);
      
      if (err.response?.status === 403 && err.response?.data?.requiresUpgrade) {
        setAiError(t.auth.insufficientCredits);
        setCreditsRemaining(0);
      } else if (err.response?.status === 402) {
        setAiError(t.auth.insufficientCredits);
        setCreditsRemaining(0);
      } else {
        setAiError(err.response?.data?.error || t.auth.aiGenerationError);
      }
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await axios.patch('/api/profile/update', {
        ...formData,
        onboardingCompleted: true,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await refreshUser();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to complete onboarding');
    } finally {
      setSubmitting(false);
    }
  };

  const hasRequiredFields = formData.targetJobDomain && formData.careerLevel && formData.industry && formData.yearsOfExperience;
  const hasCredits = creditsRemaining === null || creditsRemaining > 0;
  const canGenerateAI = hasRequiredFields && hasCredits;
  const charCount = formData.professionalSummary.length;
  const maxChars = 500;

  // Convert JOB_DOMAINS to SmartSearchDropdown format
  const jobDomainOptions = JOB_DOMAINS.map(domain => ({
    value: domain.id,
    labelEn: domain.nameEn,
    labelAr: domain.nameAr,
    keywords: domain.keywords
  }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-50 to-turquoise-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquoise-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-navy-50 to-turquoise-50 py-8 px-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-navy-900 mb-2">
            {isRTL ? `مرحباً ${user.fullName}! 👋` : `Welcome ${user.fullName}! 👋`}
          </h1>
          <p className="text-gray-600 text-lg">
            {isRTL ? 'دعنا نكمل ملفك المهني' : 'Let\'s complete your professional profile'}
          </p>
        </div>

        <Card className="w-full">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display Name and Email (Read-only) */}
            <div>
              <h3 className="text-lg font-semibold text-navy-800 mb-4 pb-2 border-b border-gray-200">
                {isRTL ? 'معلومات الحساب' : 'Account Information'}
              </h3>
              <div className="space-y-4">
                <Input
                  type="text"
                  label={t.auth.fullName}
                  value={user.fullName || ''}
                  disabled
                  className="bg-gray-100"
                />
                <Input
                  type="email"
                  label={t.auth.email}
                  value={user.email}
                  disabled
                  className="bg-gray-100"
                />
                <Input
                  type="tel"
                  name="phoneNumber"
                  label={t.auth.phoneNumber}
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder={isRTL ? '+966 50 123 4567' : '+1 (555) 123-4567'}
                />
              </div>
            </div>

            {/* Professional Profile Section */}
            <div>
              <h3 className="text-lg font-semibold text-navy-800 mb-4 pb-2 border-b border-gray-200">
                {isRTL ? 'الملف المهني' : 'Professional Profile'}
              </h3>
              <div className="space-y-4">
                <Input
                  type="text"
                  name="location"
                  label={t.auth.location}
                  value={formData.location}
                  onChange={handleChange}
                  placeholder={t.auth.locationPlaceholder}
                  helperText={t.auth.locationHelper}
                  required
                />
                
                {/* Target Job Domain - SmartSearchDropdown */}
                <SmartSearchDropdown
                  options={jobDomainOptions}
                  value={formData.targetJobDomain}
                  onChange={(value) => setFormData({ ...formData, targetJobDomain: value })}
                  label="Target Job Domain"
                  labelAr="المجال الوظيفي المستهدف"
                  placeholder="Search job domains..."
                  placeholderAr="ابحث عن مجال وظيفي..."
                  required={true}
                  allowCustom={true}
                  customPlaceholder="Add custom domain"
                  customPlaceholderAr="إضافة مجال مخصص"
                />
                <Select
                  name="careerLevel"
                  label={t.auth.careerLevel}
                  value={formData.careerLevel}
                  onChange={handleChange}
                  helperText={t.auth.careerLevelHelper}
                  required
                  options={[
                    { value: '', label: isRTL ? 'اختر...' : 'Select...' },
                    { value: 'Student', label: isRTL ? 'طالب' : 'Student' },
                    { value: 'Fresh Graduate', label: isRTL ? 'خريج جديد' : 'Fresh Graduate' },
                    { value: 'Entry-Level', label: isRTL ? 'مبتدئ' : 'Entry-Level' },
                    { value: 'Mid-Level', label: isRTL ? 'متوسط' : 'Mid-Level' },
                    { value: 'Senior-Level', label: isRTL ? 'كبير' : 'Senior-Level' },
                  ]}
                />
                <SmartSearchDropdown
                  options={INDUSTRIES}
                  value={formData.industry}
                  onChange={(value) => setFormData({ ...formData, industry: value })}
                  label="Industry"
                  labelAr="القطاع"
                  placeholder="Search industries..."
                  placeholderAr="ابحث عن قطاع..."
                  required={true}
                  allowCustom={true}
                  customPlaceholder="Add custom industry"
                  customPlaceholderAr="إضافة قطاع مخصص"
                />
                <Select
                  name="yearsOfExperience"
                  label={t.auth.yearsOfExperience}
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  helperText={t.auth.yearsHelper}
                  required
                  options={[
                    { value: '', label: isRTL ? 'اختر...' : 'Select...' },
                    { value: '0', label: isRTL ? '0 سنوات' : '0 years' },
                    { value: '1-3', label: isRTL ? '1-3 سنوات' : '1-3 years' },
                    { value: '3-5', label: isRTL ? '3-5 سنوات' : '3-5 years' },
                    { value: '5+', label: isRTL ? '5+ سنوات' : '5+ years' },
                  ]}
                />
                <Select
                  name="educationLevel"
                  label={t.auth.educationLevel}
                  value={formData.educationLevel}
                  onChange={handleChange}
                  helperText={t.auth.educationHelper}
                  required
                  options={[
                    { value: '', label: isRTL ? 'اختر...' : 'Select...' },
                    { value: 'High School', label: isRTL ? 'ثانوية عامة' : 'High School' },
                    { value: 'Diploma', label: isRTL ? 'دبلوم' : 'Diploma' },
                    { value: 'Bachelor', label: isRTL ? 'بكالوريوس' : 'Bachelor' },
                    { value: 'Masters', label: isRTL ? 'ماجستير' : 'Masters' },
                  ]}
                />
                <Input
                  type="text"
                  name="mostRecentJobTitle"
                  label={t.auth.mostRecentJobTitle}
                  value={formData.mostRecentJobTitle}
                  onChange={handleChange}
                  placeholder={t.auth.mostRecentJobPlaceholder}
                  required
                />
                <Input
                  type="text"
                  name="mostRecentCompany"
                  label={t.auth.mostRecentCompany}
                  value={formData.mostRecentCompany}
                  onChange={handleChange}
                  placeholder={t.auth.mostRecentCompanyPlaceholder}
                  required
                />
                <Select
                  name="employmentStatus"
                  label={t.auth.employmentStatus}
                  value={formData.employmentStatus}
                  onChange={handleChange}
                  helperText={t.auth.employmentStatusHelper}
                  required
                  options={[
                    { value: '', label: isRTL ? 'اختر...' : 'Select...' },
                    { value: 'Employed', label: isRTL ? 'موظف' : 'Employed' },
                    { value: 'Unemployed', label: isRTL ? 'غير موظف' : 'Unemployed' },
                    { value: 'Fresh Graduate', label: isRTL ? 'خريج جديد' : 'Fresh Graduate' },
                  ]}
                />
              </div>
            </div>

            {/* Professional Summary Section */}
            <div>
              <h3 className="text-lg font-semibold text-navy-800 mb-4 pb-2 border-b border-gray-200">
                {t.auth.professionalSummary} <span className="text-sm font-normal text-gray-500">({t.auth.optionalField})</span>
              </h3>
              <div className="space-y-3">
                <Textarea
                  name="professionalSummary"
                  label={t.auth.professionalSummary}
                  value={formData.professionalSummary}
                  onChange={handleChange}
                  placeholder={t.auth.professionalSummaryPlaceholder}
                  helperText={t.auth.professionalSummaryHelper}
                  rows={4}
                  maxLength={maxChars}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={handleGenerateAI}
                      disabled={!canGenerateAI || generatingAI}
                      variant="secondary"
                      size="sm"
                      title={!hasCredits ? t.auth.noCreditsAvailable : ''}
                    >
                      {generatingAI ? t.auth.generatingAI : (formData.professionalSummary ? t.auth.regenerateWithAI : t.auth.generateWithAI)}
                    </Button>
                    {creditsRemaining !== null && (
                      <span className={`text-xs ${creditsRemaining === 0 ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                        {creditsRemaining} {t.auth.creditsRemaining}
                      </span>
                    )}
                  </div>
                  <div className={`text-sm ${charCount > maxChars ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                    {charCount > maxChars 
                      ? `${charCount - maxChars} ${t.auth.charLimitExceeded}` 
                      : `${maxChars - charCount} ${t.auth.charLimit}`
                    }
                  </div>
                </div>
                {aiError && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-amber-600">⚠️</span>
                      <div className="flex-1">
                        <p className="text-sm text-amber-800">{aiError}</p>
                        {creditsRemaining === 0 && (
                          <a href="/pricing" className="inline-block mt-2">
                            <Button variant="primary" size="sm">
                              {t.auth.upgradeToPremium}
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <Button type="submit" fullWidth loading={submitting}>
              {submitting ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'اكتمال الملف' : 'Complete Profile')}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
