'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import SmartSearchDropdown from '@/components/ui/SmartSearchDropdown';
import { isProfileComplete } from '@/lib/utils/profile';
import { JOB_DOMAINS } from '@/lib/constants/jobDomains';
import { INDUSTRIES } from '@/lib/constants/profileOptions';
import { FiCheckCircle, FiLogOut, FiArrowRight, FiUser, FiBriefcase, FiBook } from 'react-icons/fi';

export default function ProfileCompletionPage() {
  const router = useRouter();
  const { user, token, loading: authLoading, logout, refreshUser, loggingOut } = useAuth();
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    location: '',
    targetJobDomain: '',
    careerLevel: '',
    industry: '',
    yearsOfExperience: '',
    educationLevel: '',
    degreeLevel: '',
    educationSpecialization: '',
    mostRecentJobTitle: '',
    mostRecentCompany: '',
    employmentStatus: '',
  });

  useEffect(() => {
    if (!authLoading && !user && !loggingOut) {
      router.push('/auth/login');
    } else if (!authLoading && user && !user.onboardingCompleted) {
      router.push('/onboarding');
    } else if (!authLoading && user && isProfileComplete(user)) {
      router.push('/template-gallery');
    } else if (user) {
      setFormData({
        fullName: user.fullName || '',
        location: user.location || '',
        targetJobDomain: user.targetJobDomain || '',
        careerLevel: user.careerLevel || '',
        industry: user.industry || '',
        yearsOfExperience: user.yearsOfExperience || '',
        educationLevel: user.educationLevel || '',
        degreeLevel: user.degreeLevel || '',
        educationSpecialization: user.educationSpecialization || '',
        mostRecentJobTitle: user.mostRecentJobTitle || '',
        mostRecentCompany: user.mostRecentCompany || '',
        employmentStatus: user.employmentStatus || '',
      });
    }
  }, [user, authLoading, router]);

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const hasEmpty = Object.values(formData).some(val => !val || val.toString().trim() === '');
    if (hasEmpty) {
      setMessage(isRTL ? 'يرجى ملء جميع الحقول للمتابعة' : 'Please fill in all fields to continue');
      setLoading(false);
      return;
    }

    try {
      await axios.put('/api/user/profile', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage(isRTL ? 'تم إكمال الملف الشخصي! جاري التحويل إلى منشئ السيرة الذاتية...' : 'Profile completed! Redirecting to CV creator...');
      await refreshUser();
      router.push('/template-gallery');
    } catch (error: any) {
      setMessage(error.response?.data?.error || (isRTL ? 'فشل في حفظ الملف الشخصي' : 'Failed to save profile'));
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
        <div className="w-16 h-16 border-4 border-navy-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  const firstName = user.fullName?.split(' ')[0] || user.username || 'User';

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-navy-800 to-turquoise-600 bg-clip-text text-transparent">
            CVin
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => { logout(); router.push('/'); }} 
              className="text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              <FiLogOut className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'خروج' : 'Logout'}
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Welcome Header Section */}
        <div className="text-center mb-8">
          {/* Main Welcome with Emoji */}
          <h1 className="text-3xl sm:text-4xl font-bold text-navy-800 mb-2">
            {isRTL 
              ? `مرحبًا ${firstName}! 👋`
              : `Welcome ${firstName}! 👋`
            }
          </h1>
          
          {/* Bilingual Subheader */}
          <p className="text-lg text-gray-600 mb-1">
            {isRTL 
              ? 'ابدأ الآن في بناء مستقبلك المهني مع أفضل منصة لتطوير السيرة الذاتية'
              : 'Start shaping your professional future with the most reliable CV platform'
            }
          </p>
          <p className="text-base text-gray-500" dir={isRTL ? 'ltr' : 'rtl'}>
            {isRTL 
              ? 'Let\'s complete your professional profile'
              : 'لنكمل ملفك الشخصي معًا'
            }
          </p>

          {/* Motivational Nudge */}
          <div className="mt-6 inline-block bg-gradient-to-r from-turquoise-50 to-cyan-50 border border-turquoise-200 rounded-xl px-6 py-3">
            <p className="text-turquoise-700 font-medium text-sm sm:text-base">
              {isRTL 
                ? '⚡ أكمل ملفك الشخصي في أقل من دقيقة للحصول على تجربة مخصصة'
                : '⚡ Complete your profile in less than one minute to unlock your customized career path'
              }
            </p>
            <p className="text-turquoise-600 text-xs sm:text-sm mt-1" dir={isRTL ? 'ltr' : 'rtl'}>
              {isRTL 
                ? 'Complete your profile in less than one minute'
                : 'أكمل ملفك في أقل من دقيقة'
              }
            </p>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          {/* Message Alert */}
          {message && (
            <div className={`px-6 py-4 ${message.includes('completed') || message.includes('إكمال') ? 'bg-green-50 border-b border-green-100' : 'bg-red-50 border-b border-red-100'}`}>
              <p className={`text-center font-medium ${message.includes('completed') || message.includes('إكمال') ? 'text-green-700' : 'text-red-700'}`}>
                {message}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Section 1: Account Information */}
            <div className="p-6 sm:p-8 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-turquoise-100 rounded-xl flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-turquoise-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy-800">
                    {isRTL ? 'معلومات الحساب' : 'Account Information'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isRTL ? 'المعلومات الشخصية الأساسية' : 'Basic personal information'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {isRTL ? 'الاسم الكامل' : 'Full Name'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-turquoise-400 focus:ring-2 focus:ring-turquoise-100 transition-all text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {isRTL ? 'الموقع' : 'Location'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder={isRTL ? 'مثال: الرياض، المملكة العربية السعودية' : 'e.g., Riyadh, Saudi Arabia'}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-turquoise-400 focus:ring-2 focus:ring-turquoise-100 transition-all text-gray-800 placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Professional Targeting */}
            <div className="p-6 sm:p-8 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center">
                  <FiBriefcase className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy-800">
                    {isRTL ? 'الاستهداف المهني' : 'Professional Targeting'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isRTL ? 'حدد أهدافك المهنية' : 'Define your career goals'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <SmartSearchDropdown
                    options={JOB_DOMAINS.map(domain => ({
                      value: domain.id,
                      labelEn: domain.nameEn,
                      labelAr: domain.nameAr,
                      keywords: domain.keywords
                    }))}
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
                </div>
                <div>
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
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {isRTL ? 'المستوى الوظيفي' : 'Career Level'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="careerLevel"
                    value={formData.careerLevel}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-turquoise-400 focus:ring-2 focus:ring-turquoise-100 transition-all text-gray-800 appearance-none cursor-pointer"
                  >
                    <option value="">{isRTL ? 'اختر المستوى...' : 'Select level...'}</option>
                    <option value="Fresh Graduate">{isRTL ? 'خريج جديد' : 'Fresh Graduate'}</option>
                    <option value="Entry">{isRTL ? 'مبتدئ' : 'Entry Level'}</option>
                    <option value="Mid">{isRTL ? 'متوسط' : 'Mid-Level'}</option>
                    <option value="Senior">{isRTL ? 'أقدم' : 'Senior'}</option>
                    <option value="Executive">{isRTL ? 'تنفيذي' : 'Executive'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {isRTL ? 'سنوات الخبرة' : 'Years of Experience'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-turquoise-400 focus:ring-2 focus:ring-turquoise-100 transition-all text-gray-800 appearance-none cursor-pointer"
                  >
                    <option value="">{isRTL ? 'اختر...' : 'Select...'}</option>
                    <option value="0">{isRTL ? 'بدون خبرة' : 'No Experience'}</option>
                    <option value="1-3">{isRTL ? '1-3 سنوات' : '1-3 Years'}</option>
                    <option value="3-5">{isRTL ? '3-5 سنوات' : '3-5 Years'}</option>
                    <option value="5-10">{isRTL ? '5-10 سنوات' : '5-10 Years'}</option>
                    <option value="10+">{isRTL ? 'أكثر من 10 سنوات' : '10+ Years'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Career Background */}
            <div className="p-6 sm:p-8 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <FiBook className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy-800">
                    {isRTL ? 'الخلفية المهنية' : 'Career Background'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isRTL ? 'خبراتك التعليمية والعملية' : 'Your education and work experience'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {isRTL ? 'المستوى التعليمي' : 'Education Level'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="educationLevel"
                    value={formData.educationLevel}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-turquoise-400 focus:ring-2 focus:ring-turquoise-100 transition-all text-gray-800 appearance-none cursor-pointer"
                  >
                    <option value="">{isRTL ? 'اختر...' : 'Select...'}</option>
                    <option value="High School">{isRTL ? 'ثانوية' : 'High School'}</option>
                    <option value="Diploma">{isRTL ? 'دبلوم' : 'Diploma'}</option>
                    <option value="Bachelor">{isRTL ? 'بكالوريوس' : 'Bachelor\'s Degree'}</option>
                    <option value="Master">{isRTL ? 'ماجستير' : 'Master\'s Degree'}</option>
                    <option value="PhD">{isRTL ? 'دكتوراه' : 'PhD / Doctorate'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {isRTL ? 'مستوى الدرجة العلمية' : 'Degree Level'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="degreeLevel"
                    value={formData.degreeLevel}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-turquoise-400 focus:ring-2 focus:ring-turquoise-100 transition-all text-gray-800 appearance-none cursor-pointer"
                  >
                    <option value="">{isRTL ? 'اختر...' : 'Select...'}</option>
                    <option value="Diploma">{isRTL ? 'دبلوم' : 'Diploma'}</option>
                    <option value="Bachelor">{isRTL ? 'بكالوريوس' : 'Bachelor'}</option>
                    <option value="Master">{isRTL ? 'ماجستير' : 'Master'}</option>
                    <option value="PhD">{isRTL ? 'دكتوراه' : 'PhD'}</option>
                    <option value="Other">{isRTL ? 'أخرى' : 'Other'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {isRTL ? 'تخصص الدراسة / التخصص الأكاديمي' : 'Education Specialization / Major'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="educationSpecialization"
                    value={formData.educationSpecialization}
                    onChange={handleChange}
                    placeholder={isRTL ? 'مثال: إدارة الأعمال، الموارد البشرية، علوم الحاسب' : 'e.g., Business Administration, HR, Computer Science'}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-turquoise-400 focus:ring-2 focus:ring-turquoise-100 transition-all text-gray-800 placeholder:text-gray-400"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {isRTL 
                      ? 'اختر أو اكتب تخصصك الأكاديمي. هذا يساعدنا في تخصيص السيرة الذاتية بدقة أكبر.'
                      : 'Select or type your academic specialization to help personalize your CV.'
                    }
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {isRTL ? 'الحالة الوظيفية' : 'Employment Status'} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="employmentStatus"
                    value={formData.employmentStatus}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-turquoise-400 focus:ring-2 focus:ring-turquoise-100 transition-all text-gray-800 appearance-none cursor-pointer"
                  >
                    <option value="">{isRTL ? 'اختر...' : 'Select...'}</option>
                    <option value="Employed">{isRTL ? 'موظف' : 'Employed'}</option>
                    <option value="Unemployed">{isRTL ? 'باحث عن عمل' : 'Job Seeker'}</option>
                    <option value="Freelance">{isRTL ? 'عمل حر' : 'Freelancer'}</option>
                    <option value="Fresh Graduate">{isRTL ? 'خريج جديد' : 'Fresh Graduate'}</option>
                    <option value="Student">{isRTL ? 'طالب' : 'Student'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {isRTL ? 'آخر مسمى وظيفي' : 'Most Recent Job Title'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="mostRecentJobTitle"
                    value={formData.mostRecentJobTitle}
                    onChange={handleChange}
                    placeholder={isRTL ? 'مثال: مدير مشاريع' : 'e.g., Project Manager'}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-turquoise-400 focus:ring-2 focus:ring-turquoise-100 transition-all text-gray-800 placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {isRTL ? 'آخر شركة عملت بها' : 'Most Recent Company'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="mostRecentCompany"
                    value={formData.mostRecentCompany}
                    onChange={handleChange}
                    placeholder={isRTL ? 'مثال: شركة أرامكو' : 'e.g., Aramco'}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-turquoise-400 focus:ring-2 focus:ring-turquoise-100 transition-all text-gray-800 placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button Section */}
            <div className="p-6 sm:p-8 bg-gray-50">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-navy-800 to-turquoise-600 hover:from-navy-900 hover:to-turquoise-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-turquoise-500/20 hover:shadow-xl hover:shadow-turquoise-500/30 text-lg"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isRTL ? 'جاري الحفظ...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    {isRTL ? 'إكمال الملف والانتقال لمنشئ السيرة الذاتية' : 'Complete Profile & Create Your CV'}
                    <FiArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>
              
              {/* Helper Text */}
              <p className="text-center text-sm text-gray-500 mt-4">
                {isRTL 
                  ? 'يمكنك تعديل هذه المعلومات لاحقًا من إعدادات حسابك'
                  : 'You can edit this information later from your account settings'
                }
              </p>
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-400 mt-6">
          {isRTL 
            ? 'جميع المعلومات محمية وآمنة 🔒'
            : '🔒 All your information is secure and protected'
          }
        </p>
      </div>
    </div>
  );
}
