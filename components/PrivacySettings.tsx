'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useAuth } from '@/lib/contexts/AuthContext';
import axios from 'axios';
import { BiCheckCircle, BiXCircle } from 'react-icons/bi';
import { FaDownload, FaTrash, FaGlobe, FaLock } from 'react-icons/fa';

export default function PrivacySettings() {
  const { isRTL } = useLanguage();
  const { user, token } = useAuth();
  const [consent, setConsent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const dataFields = [
    { key: 'fullName', label: 'Full Name', labelAr: 'الاسم الكامل', why: 'Used for CV personalization', whyAr: 'يُستخدم لتخصيص السيرة الذاتية' },
    { key: 'email', label: 'Email', labelAr: 'البريد الإلكتروني', why: 'Account recovery and communication', whyAr: 'استرجاع الحساب والتواصل' },
    { key: 'phoneNumber', label: 'Phone Number', labelAr: 'رقم الهاتف', why: 'Contact information on CV', whyAr: 'معلومات الاتصال على السيرة الذاتية' },
    { key: 'location', label: 'Location', labelAr: 'الموقع', why: 'CV personalization', whyAr: 'تخصيص السيرة الذاتية' },
    { key: 'educationLevel', label: 'Education Level', labelAr: 'المستوى التعليمي', why: 'For CV generation', whyAr: 'لإنشاء السيرة الذاتية' },
    { key: 'degreeLevel', label: 'Degree Level', labelAr: 'مستوى الدرجة العلمية', why: 'AI content personalization', whyAr: 'تخصيص محتوى الذكاء الاصطناعي' },
    { key: 'educationSpecialization', label: 'Specialization', labelAr: 'التخصص', why: 'AI skill and content alignment', whyAr: 'محاذاة مهارات الذكاء الاصطناعي والمحتوى' },
    { key: 'uploadedCV', label: 'Uploaded CV', labelAr: 'السيرة الذاتية المرفوعة', why: 'CV data extraction', whyAr: 'استخراج بيانات السيرة الذاتية' },
    { key: 'uploadedJD', label: 'Job Descriptions', labelAr: 'وصف الوظيفة', why: 'Job matching', whyAr: 'تطابق الوظائف' },
  ];

  useEffect(() => {
    fetchConsent();
  }, [token]);

  const fetchConsent = async () => {
    try {
      const response = await axios.get('/api/privacy/consent', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConsent(response.data.consent);
    } catch (error) {
      console.error('Error fetching consent:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConsent = async (field: string, value: boolean) => {
    setSaving(true);
    try {
      const response = await axios.post('/api/privacy/consent', 
        { [field]: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConsent(response.data.consent);
    } catch (error) {
      console.error('Error updating consent:', error);
    } finally {
      setSaving(false);
    }
  };

  const exportData = async () => {
    try {
      const response = await axios.post('/api/privacy/export', {}, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'my-data.json');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const deleteData = async () => {
    if (window.confirm(isRTL ? 'هل أنت متأكد؟ سيتم حذف جميع بياناتك نهائياً.' : 'Are you sure? This will permanently delete all your data.')) {
      try {
        await axios.post('/api/privacy/delete', {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert(isRTL ? 'تم حذف البيانات بنجاح' : 'Data deleted successfully');
      } catch (error) {
        console.error('Error deleting data:', error);
      }
    }
  };

  if (loading) return <div className="text-center py-8">{isRTL ? 'جاري التحميل...' : 'Loading...'}</div>;

  return (
    <div className={`space-y-8 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Data Listing Panel */}
      <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          {isRTL ? '📊 البيانات المخزنة' : '📊 Data We Store About You'}
        </h3>
        <div className="space-y-4">
          {dataFields.map((field) => (
            <div key={field.key} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="font-semibold text-gray-900">{isRTL ? field.labelAr : field.label}</p>
                <p className="text-sm text-gray-600">{isRTL ? field.whyAr : field.why}</p>
                <p className="text-xs text-gray-500 mt-1">{isRTL ? 'يُحذف بعد 30 يوم من حذف الحساب' : 'Deleted 30 days after account deletion'}</p>
              </div>
              <BiCheckCircle className="text-green-500 text-2xl flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Consent Panel - Required */}
      <div className="bg-blue-50 rounded-lg p-8 shadow-sm border border-blue-200">
        <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
          <FaLock /> {isRTL ? '✔️ موافقات مطلوبة' : '✔️ Required Consents'}
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-blue-200">
            <div>
              <p className="font-semibold text-gray-900">{isRTL ? 'معالجة البيانات الشخصية' : 'Personal Data Processing'}</p>
              <p className="text-sm text-gray-600">{isRTL ? 'مطلوب لاستخدام المنصة' : 'Required to use the platform'}</p>
            </div>
            <input type="checkbox" checked={consent?.dataProcessingConsent} disabled className="w-6 h-6" />
          </div>
          <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-blue-200">
            <div>
              <p className="font-semibold text-gray-900">{isRTL ? 'إنشاء محتوى السيرة الذاتية بالذكاء الاصطناعي' : 'AI CV Generation'}</p>
              <p className="text-sm text-gray-600">{isRTL ? 'لاستخدام ميزات إنشاء السيرة الذاتية' : 'To use CV generation features'}</p>
            </div>
            <input type="checkbox" checked={consent?.aiGenerationConsent} disabled className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Consent Panel - Optional */}
      <div className="bg-indigo-50 rounded-lg p-8 shadow-sm border border-indigo-200">
        <h3 className="text-2xl font-bold text-indigo-900 mb-6">
          {isRTL ? '🎁 موافقات اختيارية' : '🎁 Optional Consents'}
        </h3>
        <div className="space-y-4">
          <label className="flex items-start gap-4 cursor-pointer p-4 bg-white rounded-lg border border-indigo-200 hover:border-indigo-300 transition-colors">
            <input 
              type="checkbox" 
              checked={consent?.featureUpdatesConsent || false}
              onChange={(e) => updateConsent('featureUpdatesConsent', e.target.checked)}
              disabled={saving}
              className="w-6 h-6 mt-1 flex-shrink-0"
            />
            <div>
              <p className="font-semibold text-gray-900">{isRTL ? 'تحديثات الميزات الجديدة' : 'New Features Updates'}</p>
              <p className="text-sm text-gray-600">{isRTL ? 'تلقي إشعارات حول الميزات والتحديثات الجديدة' : 'Receive notifications about new features'}</p>
            </div>
          </label>
          <label className="flex items-start gap-4 cursor-pointer p-4 bg-white rounded-lg border border-indigo-200 hover:border-indigo-300 transition-colors">
            <input 
              type="checkbox" 
              checked={consent?.analyticsConsent || false}
              onChange={(e) => updateConsent('analyticsConsent', e.target.checked)}
              disabled={saving}
              className="w-6 h-6 mt-1 flex-shrink-0"
            />
            <div>
              <p className="font-semibold text-gray-900">{isRTL ? 'تحليلات المنصة' : 'Platform Analytics'}</p>
              <p className="text-sm text-gray-600">{isRTL ? 'مشاركة بيانات مجهولة الهوية لتحسين الخدمة' : 'Share anonymous data to improve our service'}</p>
            </div>
          </label>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-cyan-50 rounded-lg p-8 shadow-sm border border-cyan-200">
        <h3 className="text-2xl font-bold text-cyan-900 mb-6 flex items-center gap-2">
          <FaGlobe /> {isRTL ? '🔐 إعدادات الخصوصية' : '🔐 Privacy Settings'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              {isRTL ? 'رؤية الملف الشخصي' : 'Profile Visibility'}
            </label>
            <select 
              value={consent?.profileVisibility || 'private'}
              onChange={(e) => updateConsent('profileVisibility' as any, e.target.value as any)}
              disabled={saving}
              className="w-full p-3 border border-cyan-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:border-cyan-500"
            >
              <option value="private">{isRTL ? 'خاص - سيرتك الذاتية خاصة بك فقط' : 'Private - Only you can see your CV'}</option>
              <option value="link-only">{isRTL ? 'برابط - المتخصصون في التوظيف يمكنهم الوصول برابط' : 'Link-only - Recruiters with link can view'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Control */}
      <div className="bg-red-50 rounded-lg p-8 shadow-sm border border-red-200">
        <h3 className="text-2xl font-bold text-red-900 mb-6">
          {isRTL ? '⚙️ تحكم البيانات' : '⚙️ Data Control'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={exportData}
            disabled={saving}
            className="flex items-center gap-3 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            <FaDownload /> {isRTL ? 'تحميل بياناتي' : 'Export My Data'}
          </button>
          <button
            onClick={deleteData}
            disabled={saving}
            className="flex items-center gap-3 p-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            <FaTrash /> {isRTL ? 'حذف بياناتي' : 'Delete My Data'}
          </button>
        </div>
        <p className="text-sm text-red-700 mt-4">
          {isRTL 
            ? '⚠️ حذف البيانات دائم. سيتم حذف جميع السيرات الذاتية والمستندات. لا يمكن عكس هذا.'
            : '⚠️ Data deletion is permanent. All CVs and documents will be deleted. This cannot be undone.'
          }
        </p>
      </div>

      {/* PDPL Compliance Info */}
      <div className="bg-green-50 rounded-lg p-8 shadow-sm border border-green-200">
        <h3 className="text-2xl font-bold text-green-900 mb-4">
          {isRTL ? '✅ الامتثال للقوانين' : '✅ Compliance'}
        </h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-center gap-2">
            <BiCheckCircle className="text-green-600 text-xl" />
            {isRTL ? 'متوافق مع نظام حماية البيانات الشخصية السعودي' : 'Saudi PDPL Compliant'}
          </li>
          <li className="flex items-center gap-2">
            <BiCheckCircle className="text-green-600 text-xl" />
            {isRTL ? 'يتبع إرشادات هيئة البيانات والذكاء الاصطناعي' : 'SDAIA Guidelines Compliant'}
          </li>
          <li className="flex items-center gap-2">
            <BiCheckCircle className="text-green-600 text-xl" />
            {isRTL ? 'يتوافق مع معايير صناعة HR-tech' : 'HR-Tech Industry Standards Compliant'}
          </li>
        </ul>
      </div>
    </div>
  );
}
