'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useCvData } from '@/lib/contexts/CvDataContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import UpgradeModal from '@/components/ui/UpgradeModal';
import { FiTarget, FiDownload, FiArrowLeft, FiCheckCircle, FiFileText } from 'react-icons/fi';
import Link from 'next/link';
import axios from 'axios';

export default function IDPGeneratorPage() {
  const router = useRouter();
  const { user, token, loading: authLoading, loggingOut } = useAuth();
  const { isRTL } = useLanguage();
  const { cvs, primaryCv, getCvForInterview } = useCvData();
  const [targetRole, setTargetRole] = useState('');
  const [timeframe, setTimeframe] = useState('12 months');
  const [selectedCvId, setSelectedCvId] = useState('');
  const [interviewData, setInterviewData] = useState<any>(null);
  const [idpContent, setIdpContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user && !loggingOut) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (primaryCv && !selectedCvId) {
      setSelectedCvId(primaryCv.id.toString());
      const data = getCvForInterview(primaryCv.id);
      setInterviewData(data);
      if (data && data.jobTitle) {
        setTargetRole(user?.targetJobTitle || data.jobTitle);
      }
    }
  }, [primaryCv, selectedCvId, getCvForInterview, user]);

  useEffect(() => {
    if (cvs.length > 0 && !selectedCvId) {
      setSelectedCvId(cvs[0].id.toString());
      const data = getCvForInterview(cvs[0].id);
      setInterviewData(data);
    }
  }, [cvs, selectedCvId, getCvForInterview]);

  const handleCvSelection = (cvId: string) => {
    setSelectedCvId(cvId);
    const data = getCvForInterview(Number(cvId));
    setInterviewData(data);
  };

  const handleGenerate = async () => {
    if (!selectedCvId) {
      alert('Please select a CV first');
      return;
    }

    setLoading(true);
    setIdpContent('');

    try {
      const selectedCv = cvs.find(cv => cv.id.toString() === selectedCvId);
      
      const response = await axios.post(
        '/api/ai/generate-idp',
        {
          cvData: selectedCv,
          targetRole,
          timeframe,
          language: isRTL ? 'ar' : 'en',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setIdpContent(response.data.idp);
    } catch (error: any) {
      console.error('IDP generation error:', error);
      if (error.response?.status === 403 && error.response?.data?.error === 'SUBSCRIPTION_REQUIRED') {
        setShowUpgradeModal(true);
      } else {
        alert('Failed to generate IDP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([idpContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `IDP_${targetRole || 'Development_Plan'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-navy-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-600 hover:text-navy-900">
            <FiArrowLeft className={isRTL ? 'rotate-180' : ''} />
            {isRTL ? 'العودة إلى لوحة التحكم' : 'Back to Dashboard'}
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-turquoise-100 rounded-lg">
              <FiTarget className="w-8 h-8 text-turquoise-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-navy-900">
                {isRTL ? 'منشئ خطة التطوير الفردية (IDP)' : 'Individual Development Plan (IDP) Generator'}
              </h1>
              <p className="text-gray-600">
                {isRTL 
                  ? 'أنشئ خطة تطوير مهنية مخصصة بأهداف وإجراءات واضحة'
                  : 'Create a personalized career development plan with clear goals and actions'}
              </p>
            </div>
          </div>

          {/* Integration Indicator */}
          {interviewData && selectedCvId && (
            <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
              <div className="flex items-start gap-3">
                <FiCheckCircle className="w-6 h-6 text-green-600 mt-1" />
                <div className="flex-1">
                  <p className="font-semibold text-navy-900 mb-2">
                    {isRTL 
                      ? `استخدام البيانات من: ${cvs.find(cv => cv.id.toString() === selectedCvId)?.title || 'سيرتك الذاتية'}`
                      : `Using data from: ${cvs.find(cv => cv.id.toString() === selectedCvId)?.title || 'Your CV'}`}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">{isRTL ? 'المسمى الوظيفي:' : 'Job Title:'}</span>
                      <p className="font-medium text-navy-900">{interviewData.jobTitle}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">{isRTL ? 'سنوات الخبرة:' : 'Experience:'}</span>
                      <p className="font-medium text-navy-900">
                        {interviewData.yearsOfExperience} {isRTL ? 'سنوات' : 'years'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">{isRTL ? 'المهارات:' : 'Skills:'}</span>
                      <p className="font-medium text-navy-900">
                        {interviewData.skills.slice(0, 3).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-xl font-bold text-navy-900 mb-4">
              {isRTL ? 'معلومات الخطة' : 'Plan Information'}
            </h2>
            
            <div className="space-y-4">
              {cvs.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800 mb-2">
                    <strong>{isRTL ? 'لم يتم العثور على بيانات السيرة الذاتية.' : 'No CV data found.'}</strong>
                  </p>
                  <p className="text-sm text-yellow-700 mb-3">
                    {isRTL 
                      ? 'يرجى إنشاء سيرة ذاتية أولاً للحصول على خطة تطوير مخصصة.'
                      : 'Please create a CV first to get a personalized development plan.'}
                  </p>
                  <Link href="/template-gallery">
                    <Button variant="outline" size="sm">
                      <FiFileText className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {isRTL ? 'إنشاء السيرة الذاتية' : 'Create CV'}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {isRTL ? 'اختر السيرة الذاتية' : 'Select CV'}
                  </label>
                  <select
                    value={selectedCvId}
                    onChange={(e) => handleCvSelection(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise-500"
                  >
                    {cvs.map((cv) => (
                      <option key={cv.id} value={cv.id}>
                        {cv.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {isRTL ? 'الدور المستهدف (اختياري)' : 'Target Role (Optional)'}
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder={isRTL ? 'مثال: مدير تطوير البرمجيات' : 'e.g., Software Development Manager'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {isRTL ? 'الإطار الزمني' : 'Timeframe'}
                </label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise-500"
                >
                  <option value="6 months">{isRTL ? '6 أشهر' : '6 months'}</option>
                  <option value="12 months">{isRTL ? '12 شهر' : '12 months'}</option>
                  <option value="18 months">{isRTL ? '18 شهر' : '18 months'}</option>
                  <option value="24 months">{isRTL ? '24 شهر' : '24 months'}</option>
                </select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading || !selectedCvId}
                fullWidth
              >
                {loading 
                  ? (isRTL ? 'جاري الإنشاء...' : 'Generating...') 
                  : (isRTL ? 'إنشاء خطة التطوير' : 'Generate IDP')}
              </Button>
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-navy-900">
                {isRTL ? 'خطة التطوير' : 'Development Plan'}
              </h2>
              {idpContent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                >
                  <FiDownload className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {isRTL ? 'تحميل' : 'Download'}
                </Button>
              )}
            </div>

            {idpContent ? (
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {idpContent}
                </pre>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                {isRTL 
                  ? 'ستظهر خطة التطوير الخاصة بك هنا'
                  : 'Your development plan will appear here'}
              </div>
            )}
          </Card>
        </div>
      </div>

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        feature={isRTL ? 'منشئ خطة التطوير الفردية' : 'IDP Generator'}
      />
    </div>
  );
}
