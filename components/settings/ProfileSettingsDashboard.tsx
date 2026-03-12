'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import Link from 'next/link';
import axios from 'axios';
import Button from '@/components/ui/Button';
import { 
  FiUser, FiBriefcase, FiShield, FiEye, FiLock, FiCreditCard, 
  FiBell, FiFileText, FiChevronRight, FiDownload, FiTrash2,
  FiCheckCircle, FiXCircle, FiEdit2, FiCamera, FiExternalLink
} from 'react-icons/fi';

type SettingsCategory = 
  | 'profile' 
  | 'professional' 
  | 'security' 
  | 'visibility' 
  | 'privacy' 
  | 'subscriptions' 
  | 'notifications' 
  | 'legal';

interface ConsentData {
  dataProcessingConsent: boolean;
  aiGenerationConsent: boolean;
  documentStorageConsent: boolean;
  profileGenerationConsent: boolean;
  featureUpdatesConsent: boolean;
  analyticsConsent: boolean;
  surveyConsent: boolean;
  profileVisibility: string;
  terms_accepted_at?: string;
  privacy_accepted_at?: string;
}

export default function ProfileSettingsDashboard() {
  const { user, token } = useAuth();
  const { t, isRTL } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('profile');
  const [consent, setConsent] = useState<ConsentData | null>(null);
  const [loadingConsent, setLoadingConsent] = useState(true);

  useEffect(() => {
    const fetchConsent = async () => {
      if (!token) return;
      try {
        const response = await axios.get('/api/privacy/consent', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConsent(response.data.consent);
      } catch (error) {
        console.error('Failed to fetch consent:', error);
      } finally {
        setLoadingConsent(false);
      }
    };
    fetchConsent();
  }, [token]);

  const categories = [
    { id: 'profile' as SettingsCategory, label: t.settings?.profileInformation || 'Profile Information', icon: FiUser },
    { id: 'professional' as SettingsCategory, label: t.settings?.professionalDetails || 'Professional Details', icon: FiBriefcase },
    { id: 'security' as SettingsCategory, label: t.settings?.securityAndLogin || 'Security & Login', icon: FiShield },
    { id: 'visibility' as SettingsCategory, label: t.settings?.visibilitySettings || 'Visibility Settings', icon: FiEye },
    { id: 'privacy' as SettingsCategory, label: t.settings?.privacyAndDataUsage || 'Privacy & Data Usage', icon: FiLock },
    { id: 'subscriptions' as SettingsCategory, label: t.settings?.subscriptionsAndBilling || 'Subscriptions & Billing', icon: FiCreditCard },
    { id: 'notifications' as SettingsCategory, label: t.settings?.notifications || 'Notifications', icon: FiBell },
    { id: 'legal' as SettingsCategory, label: t.settings?.legalDocuments || 'Legal Documents', icon: FiFileText },
  ];

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-navy-800">{t.settings?.profileInformation || 'Profile Information'}</h2>
        <Link href="/settings">
          <Button variant="outline" size="sm">
            <FiEdit2 className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t.settings?.editProfile || 'Edit Profile'}
          </Button>
        </Link>
      </div>
      
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
        <div className="flex items-start gap-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-navy-600 to-turquoise-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-200 hover:bg-gray-50">
              <FiCamera className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900">{user?.fullName || 'Not set'}</h3>
            <p className="text-gray-600">{user?.email}</p>
            {user?.location && <p className="text-gray-500 text-sm mt-1">{user.location}</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard label={t.settings?.fullName || 'Full Name'} value={user?.fullName} />
        <InfoCard label={t.settings?.email || 'Email'} value={user?.email} />
        <InfoCard label={t.settings?.phone || 'Phone'} value={user?.phoneNumber} />
        <InfoCard label={t.settings?.location || 'Location'} value={user?.location} />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p>{isRTL ? 'تأكد من مطابقة معلومات ملفك الشخصي مع البيانات المخزنة لضمان التكامل السلس مع ميزات الذكاء الاصطناعي وإنشاء السيرة الذاتية.' : 'Ensure your profile information matches the stored data for seamless integration with AI features and CV generation.'}</p>
      </div>
    </div>
  );

  const renderProfessionalSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-navy-800">{t.settings?.professionalDetails || 'Professional Details'}</h2>
        <Link href="/settings">
          <Button variant="outline" size="sm">
            <FiExternalLink className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t.settings?.linkToEdit || 'Link to Edit'}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InfoCard label={t.settings?.targetJobDomain || 'Target Job Domain'} value={user?.targetJobDomain} />
        <InfoCard label={t.settings?.industry || 'Industry'} value={user?.industry} />
        <InfoCard label={t.settings?.careerLevel || 'Career Level'} value={user?.careerLevel} />
        <InfoCard label={t.settings?.yearsOfExperience || 'Years of Experience'} value={user?.yearsOfExperience} />
        <InfoCard label={t.settings?.degreeLevel || 'Degree Level'} value={user?.degreeLevel} />
        <InfoCard label={t.settings?.academicSpecialization || 'Academic Specialization'} value={user?.educationSpecialization} />
        <InfoCard label={isRTL ? 'المسمى الوظيفي الأخير' : 'Most Recent Job Title'} value={user?.mostRecentJobTitle} />
        <InfoCard label={isRTL ? 'الشركة الأخيرة' : 'Most Recent Company'} value={user?.mostRecentCompany} />
        <InfoCard label={isRTL ? 'حالة التوظيف' : 'Employment Status'} value={user?.employmentStatus} />
        <InfoCard label={isRTL ? 'مستوى التعليم' : 'Education Level'} value={user?.educationLevel} />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
        <p>{isRTL ? 'جميع الحقول للقراءة فقط هنا. استخدم رابط التعديل للتحديث. يتم الحفاظ على اتساق البيانات عبر جميع صفحات الملف الشخصي.' : 'All fields are read-only here. Use the edit link to update. Data consistency is maintained across all profile pages.'}</p>
      </div>
    </div>
  );

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-navy-800 mb-6">{t.settings?.securityAndLogin || 'Security & Login'}</h2>

      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900">{t.settings?.changePassword || 'Change Password'}</h4>
            <p className="text-sm text-gray-500">{isRTL ? 'تحديث كلمة المرور بانتظام للحفاظ على أمان حسابك' : 'Update your password regularly to keep your account secure'}</p>
          </div>
          <Button variant="outline" size="sm">{t.settings?.changePassword || 'Change Password'}</Button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900">{t.settings?.activeSessions || 'Active Sessions'}</h4>
            <p className="text-sm text-gray-500">{isRTL ? 'عرض وإدارة الأجهزة المسجلة حاليًا' : 'View and manage currently logged in devices'}</p>
          </div>
          <Button variant="outline" size="sm">{t.settings?.viewAll || 'View All'}</Button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900">{t.settings?.logoutAllDevices || 'Log Out of All Devices'}</h4>
            <p className="text-sm text-gray-500">{isRTL ? 'تسجيل الخروج من جميع الأجهزة باستثناء هذا الجهاز' : 'Sign out from all devices except this one'}</p>
          </div>
          <Button variant="danger" size="sm">{t.settings?.logoutAllDevices || 'Log Out All'}</Button>
        </div>

        <div className="bg-gray-100 border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <FiShield className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-600">{isRTL ? 'المصادقة الثنائية' : 'Two-Factor Authentication'}</h4>
              <p className="text-sm text-gray-400">{isRTL ? 'قريبًا' : 'Coming Soon'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVisibilitySection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-navy-800 mb-6">{t.settings?.visibilitySettings || 'Visibility Settings'}</h2>

      <div className="space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h4 className="font-semibold text-gray-900 mb-4">{t.settings?.cvVisibility || 'CV Visibility'}</h4>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" name="visibility" defaultChecked className="w-4 h-4 text-turquoise-600" />
              <div>
                <span className="font-medium text-gray-900">{t.settings?.private || 'Private'}</span>
                <p className="text-sm text-gray-500">{isRTL ? 'فقط أنت يمكنك رؤية سيرتك الذاتية' : 'Only you can see your CV'}</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="radio" name="visibility" className="w-4 h-4 text-turquoise-600" />
              <div>
                <span className="font-medium text-gray-900">{t.settings?.limitedLink || 'Limited Link'}</span>
                <p className="text-sm text-gray-500">{isRTL ? 'أي شخص لديه الرابط يمكنه رؤية سيرتك الذاتية' : 'Anyone with the link can view your CV'}</p>
              </div>
            </label>
          </div>
        </div>

        <ToggleOption 
          label={t.settings?.enableSharedLink || 'Enable Shared Link'} 
          description={isRTL ? 'السماح بمشاركة سيرتك الذاتية عبر رابط' : 'Allow sharing your CV via a link'}
          defaultChecked={false}
        />
        <ToggleOption 
          label={t.settings?.showProfilePhoto || 'Show Profile Photo'} 
          description={isRTL ? 'عرض صورتك على السير الذاتية المُنشأة' : 'Display your photo on generated CVs'}
          defaultChecked={true}
        />
        <ToggleOption 
          label={t.settings?.showContactInfo || 'Show Contact Info on Generated CVs'} 
          description={isRTL ? 'إظهار معلومات الاتصال على السير الذاتية' : 'Show contact details on CVs'}
          defaultChecked={true}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p>{isRTL ? 'الإعداد الافتراضي هو "خاص" وفقًا لنظام حماية البيانات الشخصية السعودي (PDPL).' : 'Default setting is "Private" per Saudi PDPL compliance.'}</p>
      </div>
    </div>
  );

  const renderPrivacySection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-navy-800 mb-6">{t.settings?.privacyAndDataUsage || 'Privacy & Data Usage'}</h2>

      {loadingConsent ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-navy-700 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h4 className="font-semibold text-gray-900 mb-4">{isRTL ? 'البيانات المخزنة' : 'Stored Data Fields'}</h4>
            <div className="space-y-3 text-sm">
              <DataFieldRow field={isRTL ? 'الاسم والبريد الإلكتروني' : 'Name & Email'} purpose={isRTL ? 'تحديد الهوية والتواصل' : 'Identity & Communication'} required={true} />
              <DataFieldRow field={isRTL ? 'رقم الهاتف' : 'Phone Number'} purpose={isRTL ? 'التحقق والتواصل' : 'Verification & Contact'} required={false} />
              <DataFieldRow field={isRTL ? 'التفاصيل المهنية' : 'Professional Details'} purpose={isRTL ? 'إنشاء السيرة الذاتية والذكاء الاصطناعي' : 'CV Generation & AI'} required={true} />
              <DataFieldRow field={isRTL ? 'محتوى السيرة الذاتية' : 'CV Content'} purpose={isRTL ? 'تخزين المستندات' : 'Document Storage'} required={true} />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h4 className="font-semibold text-gray-900 mb-4">{t.settings?.consentStatus || 'Consent Status'}</h4>
            <div className="space-y-3">
              <ConsentRow label={isRTL ? 'معالجة البيانات' : 'Data Processing'} granted={consent?.dataProcessingConsent} required={true} />
              <ConsentRow label={isRTL ? 'إنشاء الذكاء الاصطناعي' : 'AI Generation'} granted={consent?.aiGenerationConsent} required={true} />
              <ConsentRow label={isRTL ? 'تخزين المستندات' : 'Document Storage'} granted={consent?.documentStorageConsent} required={true} />
              <ConsentRow label={isRTL ? 'تحديثات الميزات' : 'Feature Updates'} granted={consent?.featureUpdatesConsent} required={false} />
              <ConsentRow label={isRTL ? 'التحليلات' : 'Analytics'} granted={consent?.analyticsConsent} required={false} />
            </div>
            {consent?.terms_accepted_at && (
              <p className="text-xs text-gray-500 mt-4">
                {isRTL ? 'تم قبول الشروط في: ' : 'Terms accepted on: '}
                {new Date(consent.terms_accepted_at).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" className="flex-1">
              <FiDownload className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t.settings?.downloadMyData || 'Download My Data'}
            </Button>
            <Button variant="danger" className="flex-1">
              <FiTrash2 className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t.settings?.deleteMyData || 'Delete My Data'}
            </Button>
          </div>
        </>
      )}
    </div>
  );

  const renderSubscriptionsSection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-navy-800 mb-6">{t.settings?.subscriptionsAndBilling || 'Subscriptions & Billing'}</h2>

      <div className="bg-gradient-to-br from-navy-700 to-navy-900 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-navy-200 text-sm">{t.settings?.currentPlan || 'Current Plan'}</p>
            <h3 className="text-2xl font-bold capitalize">{user?.subscriptionTier || 'Free'}</h3>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <FiCreditCard className="w-6 h-6" />
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div>
            <p className="text-navy-200">{t.settings?.status || 'Status'}</p>
            <p className="font-semibold text-green-400">{isRTL ? 'نشط' : 'Active'}</p>
          </div>
          {user?.subscriptionEndDate && (
            <div>
              <p className="text-navy-200">{t.settings?.renewalDate || 'Renewal Date'}</p>
              <p className="font-semibold">{new Date(user.subscriptionEndDate).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>

      {user?.subscriptionTier === 'free' && (
        <div className="bg-gradient-to-r from-turquoise-50 to-cyan-50 border border-turquoise-200 rounded-xl p-6">
          <h4 className="font-bold text-turquoise-800 mb-2">{isRTL ? 'ترقية إلى مميز' : 'Upgrade to Pro'}</h4>
          <p className="text-turquoise-700 text-sm mb-4">{isRTL ? 'احصل على وصول غير محدود لإنشاء السيرة الذاتية، قوالب مميزة، وميزات الذكاء الاصطناعي المتقدمة.' : 'Get unlimited CV generation, premium templates, and advanced AI features.'}</p>
          <Link href="/pricing">
            <Button variant="secondary">{t.settings?.upgradeToPro || 'Upgrade to Pro'}</Button>
          </Link>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h4 className="font-semibold text-gray-900 mb-4">{isRTL ? 'استخدام الرصيد' : 'Credit Usage'}</h4>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-navy-800">{user?.freeCredits || 0}</p>
            <p className="text-xs text-gray-500">{isRTL ? 'رصيد متبقي' : 'Credits Left'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-navy-800">{user?.cvGenerations || 0}</p>
            <p className="text-xs text-gray-500">{isRTL ? 'سير ذاتية' : 'CVs Generated'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-navy-800">{user?.textImprovements || 0}</p>
            <p className="text-xs text-gray-500">{isRTL ? 'تحسينات' : 'Improvements'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-navy-800 mb-6">{t.settings?.notifications || 'Notifications'}</h2>

      <div className="space-y-4">
        <ToggleOption 
          label={t.settings?.emailNotifications || 'Email Notifications'} 
          description={isRTL ? 'تلقي تحديثات عبر البريد الإلكتروني' : 'Receive updates via email'}
          defaultChecked={false}
        />
        <ToggleOption 
          label={t.settings?.featureUpdates || 'Feature Updates'} 
          description={isRTL ? 'كن أول من يعرف عن الميزات الجديدة' : 'Be the first to know about new features'}
          defaultChecked={false}
        />
        <ToggleOption 
          label={t.settings?.aiSuggestions || 'AI Suggestions'} 
          description={isRTL ? 'احصل على اقتراحات مخصصة بالذكاء الاصطناعي' : 'Get personalized AI suggestions'}
          defaultChecked={false}
        />
        <ToggleOption 
          label={t.settings?.reminders || 'Reminders'} 
          description={isRTL ? 'تذكيرات لتحديث سيرتك الذاتية' : 'Reminders to update your CV'}
          defaultChecked={false}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p>{isRTL ? 'الإعداد الافتراضي هو "إيقاف" وفقًا لمبدأ تقليل البيانات في نظام حماية البيانات الشخصية السعودي (PDPL).' : 'Default is OFF per Saudi PDPL data minimization principle.'}</p>
      </div>
    </div>
  );

  const renderLegalSection = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-navy-800 mb-6">{t.settings?.legalDocuments || 'Legal Documents'}</h2>

      <div className="space-y-4">
        <LegalLink href="/legal/terms-of-use" label={t.settings?.termsOfUse || 'Terms of Use'} />
        <LegalLink href="/legal/privacy-policy" label={t.settings?.privacyPolicy || 'Privacy Policy'} />
        <LegalLink href="/legal/ai-disclosure" label={t.settings?.aiUsageDisclosure || 'AI Usage Disclosure'} />
        <LegalLink href="/legal/privacy-policy#data-retention" label={t.settings?.dataRetentionPolicy || 'Data Retention Policy'} />
        <LegalLink href="/legal/privacy-policy#cross-border" label={t.settings?.crossBorderProcessing || 'Cross-Border Processing Notice'} />
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
        <p>{isRTL ? 'جميع المستندات القانونية متوفرة باللغتين العربية والإنجليزية ومتوافقة مع نظام حماية البيانات الشخصية السعودي.' : 'All legal documents are available in Arabic and English and comply with Saudi PDPL regulations.'}</p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeCategory) {
      case 'profile': return renderProfileSection();
      case 'professional': return renderProfessionalSection();
      case 'security': return renderSecuritySection();
      case 'visibility': return renderVisibilitySection();
      case 'privacy': return renderPrivacySection();
      case 'subscriptions': return renderSubscriptionsSection();
      case 'notifications': return renderNotificationsSection();
      case 'legal': return renderLegalSection();
      default: return renderProfileSection();
    }
  };

  return (
    <div className="hidden lg:block">
      <div className="flex gap-8">
        {/* Left Sidebar */}
        <div className="w-72 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-navy-800">{t.settings?.title || 'Settings'}</h2>
            </div>
            <nav className="p-2">
              {categories.map((category) => {
                const Icon = category.icon;
                const isActive = activeCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-turquoise-50 text-turquoise-700 border-l-4 border-turquoise-500' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1 text-start">{category.label}</span>
                    <FiChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'rotate-90' : ''}`} />
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Right Content Panel */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="font-medium text-gray-900">{value || 'Not set'}</p>
    </div>
  );
}

function ToggleOption({ label, description, defaultChecked }: { label: string; description: string; defaultChecked: boolean }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between">
      <div>
        <h4 className="font-semibold text-gray-900">{label}</h4>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-turquoise-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-turquoise-500"></div>
      </label>
    </div>
  );
}

function DataFieldRow({ field, purpose, required }: { field: string; purpose: string; required: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div>
        <p className="font-medium text-gray-900">{field}</p>
        <p className="text-xs text-gray-500">{purpose}</p>
      </div>
      <span className={`text-xs px-2 py-1 rounded-full ${required ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
        {required ? 'Required' : 'Optional'}
      </span>
    </div>
  );
}

function ConsentRow({ label, granted, required }: { label: string; granted?: boolean; required: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2">
        {granted ? (
          <FiCheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <FiXCircle className="w-5 h-5 text-red-500" />
        )}
        <span className="text-gray-900">{label}</span>
      </div>
      <span className={`text-xs px-2 py-1 rounded-full ${required ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
        {required ? 'Required' : 'Optional'}
      </span>
    </div>
  );
}

function LegalLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-turquoise-300 hover:shadow-sm transition-all">
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-900">{label}</span>
        <FiExternalLink className="w-5 h-5 text-gray-400" />
      </div>
    </Link>
  );
}
