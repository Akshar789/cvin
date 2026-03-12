'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import UpgradeModal from '@/components/ui/UpgradeModal';
import { FiFileText, FiDownload, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import jsPDF from 'jspdf';

export default function CoverLetterPage() {
  const router = useRouter();
  const { user, token, loading: authLoading, loggingOut } = useAuth();
  const { t, isRTL } = useLanguage();
  const [cvs, setCvs] = useState<any[]>([]);
  const [selectedCvId, setSelectedCvId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [coverLetterContent, setCoverLetterContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user && !loggingOut) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && token) {
      fetchCVs();
    }
  }, [user, token]);

  const fetchCVs = async () => {
    try {
      const response = await axios.get('/api/cvs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCvs(response.data.cvs);
      if (response.data.cvs.length > 0) {
        setSelectedCvId(response.data.cvs[0].id.toString());
      }
    } catch (error) {
      console.error('Failed to fetch CVs:', error);
    }
  };

  const handleGenerate = async () => {
    if (!jobTitle || !company) {
      alert(isRTL ? 'يرجى إدخال المسمى الوظيفي واسم الشركة' : 'Please enter job title and company name');
      return;
    }

    if (!selectedCvId) {
      alert(isRTL ? 'يرجى اختيار السيرة الذاتية' : 'Please select a CV');
      return;
    }

    setLoading(true);
    setCoverLetterContent('');

    try {
      const selectedCv = cvs.find(cv => cv.id.toString() === selectedCvId);
      
      const response = await axios.post(
        '/api/ai/cover-letter',
        {
          cvData: selectedCv,
          cvId: selectedCv.id,
          jobTitle,
          company,
          jobDescription,
          language: isRTL ? 'ar' : 'en',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCoverLetterContent(response.data.content);
    } catch (error: any) {
      console.error('Cover letter generation error:', error);
      if (error.response?.status === 403) {
        setShowUpgradeModal(true);
      } else {
        alert(error.response?.data?.error || (isRTL ? 'فشل في إنشاء خطاب التقديم' : 'Failed to generate cover letter'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    
    const lines = doc.splitTextToSize(coverLetterContent, maxWidth);
    let y = margin;
    
    lines.forEach((line: string) => {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 7;
    });
    
    doc.save(`Cover_Letter_${company}_${jobTitle}.pdf`);
  };

  const handleDownloadWord = () => {
    const header = `Cover Letter - ${jobTitle} at ${company}\n${'='.repeat(50)}\n\n`;
    const content = header + coverLetterContent;
    
    const blob = new Blob([content], { 
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cover_Letter_${company}_${jobTitle}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-navy-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  const isPaidUser = user.subscriptionTier !== 'free';

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

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-turquoise-100 rounded-lg">
              <FiFileText className="w-8 h-8 text-turquoise-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-navy-900">
                {isRTL ? 'منشئ خطاب التقديم' : 'Cover Letter Generator'}
              </h1>
              <p className="text-gray-600">
                {isRTL 
                  ? 'أنشئ خطاب تقديم احترافي مخصص لكل وظيفة'
                  : 'Create professional cover letters tailored to each job'}
              </p>
            </div>
          </div>
          {isPaidUser && (
            <div className="bg-turquoise-50 border border-turquoise-200 rounded-lg px-4 py-3">
              <p className="text-sm text-turquoise-900">
                <strong>{isRTL ? '💡 نصيحة:' : '💡 Tip:'}</strong> {isRTL 
                  ? 'كلما أضفت تفاصيل أكثر عن الوظيفة، كان خطاب التقديم أفضل!'
                  : 'The more details you provide about the job, the better your cover letter will be!'}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h2 className="text-xl font-bold text-navy-900 mb-4">
              {isRTL ? 'تفاصيل الوظيفة' : 'Job Details'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {isRTL ? 'اختر السيرة الذاتية' : 'Select Your CV'}
                </label>
                <select
                  value={selectedCvId}
                  onChange={(e) => setSelectedCvId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-turquoise-500"
                  disabled={!isPaidUser}
                >
                  {cvs.map((cv) => (
                    <option key={cv.id} value={cv.id}>
                      {cv.title}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label={isRTL ? 'المسمى الوظيفي *' : 'Job Title *'}
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder={isRTL ? 'مثال: مطور برمجيات أول' : 'e.g., Senior Software Developer'}
                disabled={!isPaidUser}
              />

              <Input
                label={isRTL ? 'اسم الشركة *' : 'Company Name *'}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder={isRTL ? 'مثال: شركة التقنية المتقدمة' : 'e.g., Tech Solutions Inc.'}
                disabled={!isPaidUser}
              />

              <Textarea
                label={isRTL ? 'وصف الوظيفة (اختياري)' : 'Job Description (Optional)'}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={6}
                placeholder={isRTL 
                  ? 'الصق وصف الوظيفة هنا للحصول على خطاب تقديم أكثر تخصيصاً...'
                  : 'Paste the job description here for a more tailored cover letter...'}
                helperText={isRTL 
                  ? 'إضافة وصف الوظيفة تساعد في إنشاء خطاب تقديم أكثر ملاءمة'
                  : 'Adding job description helps create a more relevant cover letter'}
                disabled={!isPaidUser}
              />

              <Button
                onClick={handleGenerate}
                disabled={loading || !isPaidUser || !selectedCvId}
                fullWidth
              >
                {loading 
                  ? (isRTL ? 'جاري الإنشاء...' : 'Generating...') 
                  : (isRTL ? 'إنشاء خطاب التقديم' : 'Generate Cover Letter')}
              </Button>

              {!isPaidUser && (
                <div className="text-center p-4 bg-gray-100 rounded-lg">
                  <p className="text-sm text-gray-600 mb-3">
                    {isRTL 
                      ? 'خطاب التقديم متاح للمشتركين فقط'
                      : 'Cover Letter Generator is available for subscribers'}
                  </p>
                  <Button size="sm" onClick={() => setShowUpgradeModal(true)}>
                    {isRTL ? 'الترقية إلى Regular' : 'Upgrade to Regular'}
                  </Button>
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-navy-900">
                {isRTL ? 'خطاب التقديم' : 'Your Cover Letter'}
              </h2>
              {coverLetterContent && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadPDF}
                  >
                    <FiDownload className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadWord}
                  >
                    <FiDownload className={`${isRTL ? 'ml-2' : 'mr-2'}`} />
                    Word
                  </Button>
                </div>
              )}
            </div>

            {coverLetterContent ? (
              <div className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                      {coverLetterContent}
                    </pre>
                  </div>
                </div>
                <div className="bg-turquoise-50 border border-turquoise-200 rounded-lg p-4">
                  <p className="text-sm text-turquoise-900">
                    <strong>{isRTL ? '✓ جاهز!' : '✓ Ready!'}</strong> {isRTL 
                      ? 'راجع خطاب التقديم وقم بتحميله بصيغة PDF أو Word'
                      : 'Review your cover letter and download as PDF or Word document'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FiFileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>
                  {isRTL 
                    ? 'سيظهر خطاب التقديم الخاص بك هنا'
                    : 'Your cover letter will appear here'}
                </p>
              </div>
            )}
          </Card>
        </div>

        {coverLetterContent && (
          <Card className="mt-6">
            <h3 className="text-lg font-bold text-navy-900 mb-3">
              {isRTL ? '💡 نصائح لاستخدام خطاب التقديم' : '💡 Tips for Using Your Cover Letter'}
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-turquoise-600 font-bold">1.</span>
                <span>{isRTL 
                  ? 'راجع المحتوى وقم بتخصيصه ليناسب أسلوبك الشخصي'
                  : 'Review and personalize the content to match your writing style'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-turquoise-600 font-bold">2.</span>
                <span>{isRTL 
                  ? 'تحقق من دقة المعلومات وملاءمتها للوظيفة'
                  : 'Verify all information is accurate and relevant to the job'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-turquoise-600 font-bold">3.</span>
                <span>{isRTL 
                  ? 'أضف أمثلة محددة من خبراتك تبرز كفاءتك للوظيفة'
                  : 'Add specific examples from your experience that demonstrate your fit'}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-turquoise-600 font-bold">4.</span>
                <span>{isRTL 
                  ? 'احفظ النسخة النهائية بتنسيق PDF للإرسال إلى أصحاب العمل'
                  : 'Save the final version as PDF for submission to employers'}</span>
              </li>
            </ul>
          </Card>
        )}
      </div>

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        feature={isRTL ? 'منشئ خطاب التقديم' : 'Cover Letter Generator'}
      />
    </div>
  );
}
