'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useCvData } from '@/lib/contexts/CvDataContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  FiLock, FiCheckCircle, FiFileText, FiLinkedin, FiArrowRight, 
  FiEdit3, FiCopy, FiDownload, FiRefreshCw, FiAlertCircle, FiX,
  FiUser, FiBriefcase, FiAward, FiTrendingUp, FiTarget
} from 'react-icons/fi';
import Link from 'next/link';

interface AnalysisStep {
  id: string;
  label: string;
  labelAr: string;
  status: 'pending' | 'loading' | 'complete' | 'error';
}

interface HeadlineOption {
  text: string;
  type: string;
  typeAr: string;
}

interface AboutVariation {
  text: string;
  tone: string;
  toneAr: string;
}

interface ExperienceImprovement {
  original: string;
  improved: string;
  position: string;
  company: string;
}

interface SkillRecommendation {
  skill: string;
  reason: string;
  reasonAr: string;
  priority: 'high' | 'medium' | 'low';
}

interface ProfileScore {
  overall: number;
  completeness: number;
  keywords: number;
  summary: number;
  experience: number;
  achievements: number;
  branding: number;
}

interface OptimizationReport {
  headlines: HeadlineOption[];
  aboutVariations: AboutVariation[];
  experienceImprovements: ExperienceImprovement[];
  skillsToAdd: SkillRecommendation[];
  skillsToImprove: SkillRecommendation[];
  missingSkills: SkillRecommendation[];
  profileScore: ProfileScore;
  generatedAt: string;
}

export default function LinkedInOptimizerPage() {
  const router = useRouter();
  const { user, token, loading: authLoading, loggingOut } = useAuth();
  const { cvs, primaryCv, getCvForLinkedIn, setPrimaryCv } = useCvData();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [selectedCvId, setSelectedCvId] = useState<number | null>(null);
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([]);
  const [report, setReport] = useState<OptimizationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState<string>('headlines');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState('');

  const t = {
    title: isRTL ? 'محسّن LinkedIn' : 'LinkedIn Optimizer',
    subtitle: isRTL ? 'حسّن ملفك الشخصي باستخدام بيانات سيرتك الذاتية' : 'Optimize your profile using your CV data',
    importLinkedIn: isRTL ? 'استيراد من LinkedIn' : 'Import from LinkedIn',
    pasteUrl: isRTL ? 'الصق رابط ملفك الشخصي على LinkedIn' : 'Paste your LinkedIn profile URL',
    analyzeProfile: isRTL ? 'تحليل الملف الشخصي' : 'Analyze Profile',
    publicDataNote: isRTL ? 'سيتم تحليل البيانات العامة فقط' : 'Only public data will be analyzed',
    analyzing: isRTL ? 'جاري مراجعة ملفك الشخصي...' : 'Reviewing Your LinkedIn Profile...',
    analyzingDesc: isRTL ? 'الذكاء الاصطناعي يحلل أقسامك ويستخرج المعلومات المهمة ويقارنها بسيرتك الذاتية.' : 'AI is analyzing your sections, extracting important information, and comparing it to your CV.',
    waitTime: isRTL ? 'قد يستغرق هذا 15-30 ثانية' : 'This may take 15-30 seconds',
    reportReady: isRTL ? 'تقرير تحسين LinkedIn جاهز!' : 'Your LinkedIn Optimization Report is Ready!',
    viewReport: isRTL ? 'عرض التقرير' : 'View Report',
    recommendedHeadlines: isRTL ? 'العناوين الموصى بها' : 'Recommended Headlines',
    recommendedAbout: isRTL ? 'الملخص الموصى به' : 'Recommended About Summary',
    experienceImprovements: isRTL ? 'تحسينات الخبرة' : 'Experience Improvements',
    skillsRecommendations: isRTL ? 'توصيات المهارات' : 'Skills Recommendations',
    profileScore: isRTL ? 'نقاط الملف الشخصي' : 'Profile Score',
    useThis: isRTL ? 'استخدم هذا' : 'Use This',
    edit: isRTL ? 'تعديل' : 'Edit',
    copy: isRTL ? 'نسخ' : 'Copy',
    save: isRTL ? 'حفظ' : 'Save',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    original: isRTL ? 'الأصلي' : 'Original',
    improved: isRTL ? 'المحسّن' : 'Improved',
    skillsToAdd: isRTL ? 'مهارات للإضافة' : 'Skills to Add',
    skillsToImprove: isRTL ? 'مهارات للتحسين' : 'Skills to Improve',
    missingForTarget: isRTL ? 'مهارات مفقودة للوظيفة المستهدفة' : 'Missing for Target Job',
    downloadReport: isRTL ? 'تحميل التقرير PDF' : 'Download Report PDF',
    exportAll: isRTL ? 'تصدير الكل' : 'Export All',
    copied: isRTL ? 'تم النسخ!' : 'Copied!',
    selectCv: isRTL ? 'اختر السيرة الذاتية للاستخدام:' : 'Select CV to use:',
    noCvWarning: isRTL ? 'لم يتم العثور على بيانات سيرة ذاتية. يرجى إنشاء سيرة ذاتية أولاً.' : 'No CV data found. Please create a CV first.',
    createCv: isRTL ? 'إنشاء سيرة ذاتية' : 'Create CV',
    premiumFeature: isRTL ? 'ميزة مميزة' : 'Premium Feature',
    unlockWith: isRTL ? 'افتح محسّن الملف الشخصي على LinkedIn مع اشتراك مميز' : 'Unlock LinkedIn Profile Optimizer with a premium subscription',
    upgradeToPremium: isRTL ? 'الترقية إلى المميز' : 'Upgrade to Premium',
    backToDashboard: isRTL ? 'العودة للوحة التحكم' : 'Back to Dashboard',
    syncedWith: isRTL ? 'متزامن مع:' : 'Synced with:',
    startOptimization: isRTL ? 'بدء التحسين' : 'Start Optimization',
    optimizeWithAi: isRTL ? 'تحسين باستخدام الذكاء الاصطناعي' : 'Optimize with AI',
    howItWorks: isRTL ? 'كيف يعمل' : 'How It Works',
    step1: isRTL ? 'الخطوة 1: استيراد ملفك الشخصي' : 'Step 1: Import your profile',
    step1Desc: isRTL ? 'الصق رابط LinkedIn الخاص بك أو استخدم بيانات سيرتك الذاتية' : 'Paste your LinkedIn URL or use your CV data',
    step2: isRTL ? 'الخطوة 2: تحليل بالذكاء الاصطناعي' : 'Step 2: AI Analysis',
    step2Desc: isRTL ? 'يقارن الذكاء الاصطناعي ملفك الشخصي مع سيرتك الذاتية' : 'AI compares your profile with your CV',
    step3: isRTL ? 'الخطوة 3: احصل على التوصيات' : 'Step 3: Get Recommendations',
    step3Desc: isRTL ? 'احصل على عناوين وملخصات وتحسينات محسنة' : 'Get optimized headlines, summaries, and improvements',
    atsStyle: isRTL ? 'متوافق مع ATS' : 'ATS-Friendly',
    keywordRich: isRTL ? 'غني بالكلمات المفتاحية' : 'Keyword-Rich',
    recruiterAttractive: isRTL ? 'جذاب للموظفين' : 'Recruiter-Attractive',
    corporateTone: isRTL ? 'نبرة رسمية' : 'Corporate Tone',
    conversationalTone: isRTL ? 'نبرة محادثة' : 'Conversational Tone',
    leadershipTone: isRTL ? 'نبرة قيادية' : 'Leadership Tone',
    highPriority: isRTL ? 'أولوية عالية' : 'High Priority',
    mediumPriority: isRTL ? 'أولوية متوسطة' : 'Medium Priority',
    lowPriority: isRTL ? 'أولوية منخفضة' : 'Low Priority',
  };

  const analysisStepsConfig: AnalysisStep[] = [
    { id: 'extract', label: 'Extracting Public Data', labelAr: 'استخراج البيانات العامة', status: 'pending' },
    { id: 'clean', label: 'Cleaning & Normalizing', labelAr: 'التنظيف والتوحيد', status: 'pending' },
    { id: 'compare', label: 'Comparing with Your CV', labelAr: 'المقارنة مع سيرتك الذاتية', status: 'pending' },
    { id: 'generate', label: 'Generating Recommendations', labelAr: 'توليد التوصيات', status: 'pending' },
    { id: 'prepare', label: 'Preparing Report', labelAr: 'إعداد التقرير', status: 'pending' },
  ];

  useEffect(() => {
    if (!authLoading && !user && !loggingOut) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router, loggingOut]);

  useEffect(() => {
    if (primaryCv && !selectedCvId) {
      setSelectedCvId(primaryCv.id);
    }
  }, [primaryCv, selectedCvId]);

  const handleCvSelection = (cvId: number) => {
    setSelectedCvId(cvId);
    setPrimaryCv(cvId);
  };

  const updateStepStatus = (stepId: string, status: AnalysisStep['status']) => {
    setAnalysisSteps(prev => 
      prev.map(step => step.id === stepId ? { ...step, status } : step)
    );
  };

  const simulateAnalysis = async () => {
    setShowUrlModal(false);
    setShowProgressModal(true);
    setAnalysisSteps(analysisStepsConfig);
    setError('');
    setLoading(true);

    try {
      const steps = ['extract', 'clean', 'compare', 'generate', 'prepare'];
      
      for (let i = 0; i < steps.length; i++) {
        updateStepStatus(steps[i], 'loading');
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
        updateStepStatus(steps[i], 'complete');
      }

      const cvData = selectedCvId ? getCvForLinkedIn(selectedCvId) : null;

      const response = await axios.post(
        '/api/ai/linkedin-optimizer/analyze',
        { 
          linkedInUrl: linkedInUrl || null,
          cvData,
          targetJobDomain: cvData?.targetJobDomain || ''
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReport(response.data.report);
      setShowProgressModal(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
      updateStepStatus('prepare', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStartWithUrl = () => {
    setShowUrlModal(true);
  };

  const handleStartWithCv = async () => {
    if (!selectedCvId) {
      setError(t.noCvWarning);
      return;
    }
    setLinkedInUrl('');
    await simulateAnalysis();
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    alert(t.copied);
  };

  const handleDownloadReport = async () => {
    if (!report) return;
    
    if (!isPremium) {
      alert(t.premiumFeature);
      return;
    }
    
    try {
      const response = await axios.post(
        '/api/ai/linkedin-optimizer/export-pdf',
        { report, language },
        { 
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `linkedin-optimization-report-${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      if (err.response?.status === 403) {
        alert(t.premiumFeature);
      } else {
        alert(isRTL ? 'فشل في تحميل التقرير' : 'Failed to download report');
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-navy-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isPremium = user && user.subscriptionTier && user.subscriptionTier !== 'free';
  const cvData = selectedCvId ? getCvForLinkedIn(selectedCvId) : null;

  const renderScoreBar = (score: number, label: string) => (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-700">{label}</span>
        <span className="font-semibold text-navy-900">{score}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${
            score >= 80 ? 'bg-green-500' : 
            score >= 60 ? 'bg-yellow-500' : 
            'bg-red-500'
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-100 rounded-lg">
              <FiLinkedin className="w-6 h-6 text-cyan-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-navy-900">{t.title}</h1>
              <p className="text-sm text-gray-600">{t.subtitle}</p>
            </div>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">{t.backToDashboard}</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {!isPremium ? (
          <Card className="text-center py-12">
            <FiLock className="w-16 h-16 mx-auto text-turquoise-600 mb-4" />
            <h2 className="text-3xl font-bold text-navy-900 mb-4">{t.premiumFeature}</h2>
            <p className="text-xl text-gray-600 mb-8">{t.unlockWith}</p>
            <Link href="/pricing">
              <Button size="lg">{t.upgradeToPremium}</Button>
            </Link>
          </Card>
        ) : !report ? (
          <div className="space-y-6">
            {/* CV Selection & Sync Status */}
            {cvData && selectedCvId && (
              <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-2 border-cyan-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FiCheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-navy-900">
                        {t.syncedWith} {cvs?.find(cv => cv.id === selectedCvId)?.title || 'Your CV'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {isRTL ? 'سيتم تحسين ملفك الشخصي بناءً على بيانات سيرتك الذاتية' : 'Your profile will be optimized based on your CV data'}
                      </p>
                    </div>
                  </div>
                  {cvs && cvs.length > 1 && (
                    <select
                      value={selectedCvId || ''}
                      onChange={(e) => handleCvSelection(Number(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      {cvs.map((cv) => (
                        <option key={cv.id} value={cv.id}>{cv.title}</option>
                      ))}
                    </select>
                  )}
                </div>
              </Card>
            )}

            {!cvData && (
              <Card className="bg-yellow-50 border border-yellow-200">
                <div className="flex items-start gap-3">
                  <FiAlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-800">{t.noCvWarning}</p>
                    <Link href="/template-gallery">
                      <Button variant="outline" size="sm" className="mt-2">
                        <FiFileText className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {t.createCv}
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )}

            {/* How It Works */}
            <Card>
              <h2 className="text-xl font-bold text-navy-900 mb-6">{t.howItWorks}</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center mx-auto mb-3">
                    <span className="text-cyan-600 font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-navy-900 mb-1">{t.step1}</h3>
                  <p className="text-sm text-gray-600">{t.step1Desc}</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-navy-900 mb-1">{t.step2}</h3>
                  <p className="text-sm text-gray-600">{t.step2Desc}</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-navy-900 mb-1">{t.step3}</h3>
                  <p className="text-sm text-gray-600">{t.step3Desc}</p>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleStartWithUrl}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-cyan-100 rounded-lg">
                    <FiLinkedin className="w-8 h-8 text-cyan-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-navy-900">{t.importLinkedIn}</h3>
                    <p className="text-sm text-gray-600">{t.pasteUrl}</p>
                  </div>
                  <FiArrowRight className={`w-5 h-5 text-gray-400 ${isRTL ? 'rotate-180' : ''}`} />
                </div>
              </Card>

              <Card 
                className={`hover:shadow-lg transition-shadow ${cvData ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                onClick={cvData ? handleStartWithCv : undefined}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FiFileText className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-navy-900">{t.optimizeWithAi}</h3>
                    <p className="text-sm text-gray-600">
                      {isRTL ? 'استخدم بيانات سيرتك الذاتية مباشرة' : 'Use your CV data directly'}
                    </p>
                  </div>
                  <FiArrowRight className={`w-5 h-5 text-gray-400 ${isRTL ? 'rotate-180' : ''}`} />
                </div>
              </Card>
            </div>

            {error && (
              <Card className="bg-red-50 border border-red-200">
                <p className="text-red-700">{error}</p>
              </Card>
            )}
          </div>
        ) : (
          /* Report View */
          <div className="space-y-6">
            {/* Report Header */}
            <Card className="bg-gradient-to-r from-green-50 to-cyan-50 border-2 border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FiCheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <h2 className="text-xl font-bold text-navy-900">{t.reportReady}</h2>
                    <p className="text-sm text-gray-600">
                      {isRTL ? `تم الإنشاء في ${new Date(report.generatedAt).toLocaleString('ar-SA')}` : 
                               `Generated on ${new Date(report.generatedAt).toLocaleString()}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleDownloadReport}>
                    <FiDownload className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t.downloadReport}
                  </Button>
                  <Button variant="outline" onClick={() => setReport(null)}>
                    <FiRefreshCw className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? 'تحليل جديد' : 'New Analysis'}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Section Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { id: 'headlines', icon: FiUser, label: t.recommendedHeadlines },
                { id: 'about', icon: FiFileText, label: t.recommendedAbout },
                { id: 'experience', icon: FiBriefcase, label: t.experienceImprovements },
                { id: 'skills', icon: FiAward, label: t.skillsRecommendations },
                { id: 'score', icon: FiTrendingUp, label: t.profileScore },
              ].map(section => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    activeSection === section.id 
                      ? 'bg-cyan-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <section.icon className="w-4 h-4" />
                  {section.label}
                </button>
              ))}
            </div>

            {/* Headlines Section */}
            {activeSection === 'headlines' && (
              <Card>
                <h3 className="text-xl font-bold text-navy-900 mb-4">{t.recommendedHeadlines}</h3>
                <div className="space-y-4">
                  {report.headlines.map((headline, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded mb-2 ${
                            headline.type === 'ats' ? 'bg-green-100 text-green-700' :
                            headline.type === 'keyword' ? 'bg-blue-100 text-blue-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {isRTL ? headline.typeAr : headline.type === 'ats' ? t.atsStyle : 
                             headline.type === 'keyword' ? t.keywordRich : t.recruiterAttractive}
                          </span>
                          <p className="text-gray-900 font-medium">{headline.text}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => copyToClipboard(headline.text)}
                            className="p-2 text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                            title={t.copy}
                          >
                            <FiCopy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* About Section */}
            {activeSection === 'about' && (
              <Card>
                <h3 className="text-xl font-bold text-navy-900 mb-4">{t.recommendedAbout}</h3>
                <div className="space-y-4">
                  {report.aboutVariations.map((variation, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                          variation.tone === 'corporate' ? 'bg-blue-100 text-blue-700' :
                          variation.tone === 'conversational' ? 'bg-green-100 text-green-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {isRTL ? variation.toneAr : 
                           variation.tone === 'corporate' ? t.corporateTone :
                           variation.tone === 'conversational' ? t.conversationalTone : t.leadershipTone}
                        </span>
                        <button 
                          onClick={() => copyToClipboard(variation.text)}
                          className="p-2 text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                          title={t.copy}
                        >
                          <FiCopy className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{variation.text}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Experience Section */}
            {activeSection === 'experience' && (
              <Card>
                <h3 className="text-xl font-bold text-navy-900 mb-4">{t.experienceImprovements}</h3>
                <div className="space-y-6">
                  {report.experienceImprovements.map((exp, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-100 px-4 py-2">
                        <p className="font-semibold text-navy-900">{exp.position}</p>
                        <p className="text-sm text-gray-600">{exp.company}</p>
                      </div>
                      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                        <div className="p-4">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{t.original}</p>
                          <p className="text-gray-700 text-sm">{exp.original}</p>
                        </div>
                        <div className="p-4 bg-green-50">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-green-700 uppercase">{t.improved}</p>
                            <button 
                              onClick={() => copyToClipboard(exp.improved)}
                              className="p-1 text-green-600 hover:text-green-800"
                              title={t.copy}
                            >
                              <FiCopy className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-gray-800 text-sm">{exp.improved}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Skills Section */}
            {activeSection === 'skills' && (
              <div className="space-y-4">
                <Card>
                  <h3 className="text-lg font-bold text-navy-900 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    {t.skillsToAdd}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {report.skillsToAdd.map((skill, index) => (
                      <span 
                        key={index} 
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          skill.priority === 'high' ? 'bg-red-100 text-red-700' :
                          skill.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}
                        title={isRTL ? skill.reasonAr : skill.reason}
                      >
                        {skill.skill}
                      </span>
                    ))}
                  </div>
                </Card>

                <Card>
                  <h3 className="text-lg font-bold text-navy-900 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    {t.skillsToImprove}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {report.skillsToImprove.map((skill, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700"
                        title={isRTL ? skill.reasonAr : skill.reason}
                      >
                        {skill.skill}
                      </span>
                    ))}
                  </div>
                </Card>

                <Card>
                  <h3 className="text-lg font-bold text-navy-900 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    {t.missingForTarget}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {report.missingSkills.map((skill, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700"
                        title={isRTL ? skill.reasonAr : skill.reason}
                      >
                        {skill.skill}
                      </span>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Profile Score Section */}
            {activeSection === 'score' && (
              <Card>
                <h3 className="text-xl font-bold text-navy-900 mb-6">{t.profileScore}</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="flex items-center justify-center">
                    <div className="relative w-48 h-48">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="12"
                        />
                        <circle
                          cx="96"
                          cy="96"
                          r="88"
                          fill="none"
                          stroke={report.profileScore.overall >= 80 ? '#22c55e' : 
                                  report.profileScore.overall >= 60 ? '#eab308' : '#ef4444'}
                          strokeWidth="12"
                          strokeDasharray={`${(report.profileScore.overall / 100) * 553} 553`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-navy-900">{report.profileScore.overall}</span>
                        <span className="text-sm text-gray-500">{isRTL ? 'من 100' : 'out of 100'}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    {renderScoreBar(report.profileScore.completeness, isRTL ? 'الاكتمال' : 'Completeness')}
                    {renderScoreBar(report.profileScore.keywords, isRTL ? 'الكلمات المفتاحية' : 'Keywords')}
                    {renderScoreBar(report.profileScore.summary, isRTL ? 'قوة الملخص' : 'Summary Strength')}
                    {renderScoreBar(report.profileScore.experience, isRTL ? 'تفاصيل الخبرة' : 'Experience Detail')}
                    {renderScoreBar(report.profileScore.achievements, isRTL ? 'ظهور الإنجازات' : 'Achievements')}
                    {renderScoreBar(report.profileScore.branding, isRTL ? 'العلامة الشخصية' : 'Personal Branding')}
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* URL Input Modal */}
      {showUrlModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-navy-900">{t.importLinkedIn}</h3>
              <button onClick={() => setShowUrlModal(false)} className="text-gray-500 hover:text-gray-700">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.pasteUrl}</label>
                <input
                  type="url"
                  value={linkedInUrl}
                  onChange={(e) => setLinkedInUrl(e.target.value)}
                  placeholder="https://www.linkedin.com/in/your-profile"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <p className="text-xs text-gray-500">{t.publicDataNote}</p>
              <Button 
                onClick={simulateAnalysis} 
                fullWidth
                disabled={!linkedInUrl.includes('linkedin.com')}
              >
                {t.analyzeProfile}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Progress Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md text-center">
            <div className="p-6">
              <div className="w-16 h-16 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-navy-900 mb-2">{t.analyzing}</h3>
              <p className="text-gray-600 mb-4">{t.analyzingDesc}</p>
              <p className="text-sm text-gray-500 mb-6">{t.waitTime}</p>
              
              <div className="space-y-3 text-left">
                {analysisSteps.map((step) => (
                  <div key={step.id} className="flex items-center gap-3">
                    {step.status === 'complete' ? (
                      <FiCheckCircle className="w-5 h-5 text-green-500" />
                    ) : step.status === 'loading' ? (
                      <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
                    ) : step.status === 'error' ? (
                      <FiAlertCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                    )}
                    <span className={`text-sm ${step.status === 'complete' ? 'text-green-700' : step.status === 'loading' ? 'text-cyan-700 font-medium' : 'text-gray-500'}`}>
                      {isRTL ? step.labelAr : step.label}
                    </span>
                  </div>
                ))}
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
