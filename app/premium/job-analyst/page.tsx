'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useCvData } from '@/lib/contexts/CvDataContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import {
  FiLock, FiFileText, FiArrowRight, FiRefreshCw, FiAlertCircle,
  FiCheckCircle, FiXCircle, FiTrendingUp, FiTarget, FiAward,
  FiList, FiEdit3, FiBarChart2,
} from 'react-icons/fi';

interface KeyRequirement {
  requirement: string;
  met: boolean;
  note: string;
}

interface JobAnalysis {
  overallMatch: number;
  matchLevel: string;
  matchLevelAr: string;
  summary: string;
  summaryAr: string;
  matchingSkills: string[];
  missingSkills: string[];
  keyRequirements: KeyRequirement[];
  strengths: string[];
  strengthsAr: string[];
  gaps: string[];
  gapsAr: string[];
  recommendations: string[];
  recommendationsAr: string[];
  cvImprovements: string[];
  cvImprovementsAr: string[];
  jobTitle: string;
  company: string;
  experienceRequired: string;
  salaryMentioned: string;
  generatedAt?: string;
}

export default function JobAnalystPage() {
  const router = useRouter();
  const { user, token, loading: authLoading, loggingOut } = useAuth();
  const { cvs, primaryCv, getCvForLinkedIn, setPrimaryCv } = useCvData();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [selectedCvId, setSelectedCvId] = useState<number | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState<string>('overview');

  const t = {
    title: isRTL ? 'محلل الوظائف' : 'Job Analyst',
    subtitle: isRTL ? 'حلّل متطلبات الوظيفة وطابقها مع سيرتك الذاتية لتحسين فرصك' : 'Analyze job descriptions and match them with your CV to improve your success rate',
    pasteJobDesc: isRTL ? 'الصق وصف الوظيفة هنا...' : 'Paste the job description here...',
    analyzeBtn: isRTL ? 'تحليل الوظيفة' : 'Analyze Job',
    analyzing: isRTL ? 'جارٍ تحليل الوظيفة...' : 'Analyzing job...',
    selectCv: isRTL ? 'اختر السيرة الذاتية:' : 'Select CV to compare:',
    noCvWarning: isRTL ? 'يرجى إنشاء سيرة ذاتية أولاً لاستخدام هذه الميزة.' : 'Please create a CV first to use this feature.',
    createCv: isRTL ? 'إنشاء سيرة ذاتية' : 'Create CV',
    premiumFeature: isRTL ? 'ميزة مميزة' : 'Premium Feature',
    unlockWith: isRTL ? 'افتح محلل الوظائف مع اشتراك مميز' : 'Unlock Job Analyst with a premium subscription',
    upgradeToPremium: isRTL ? 'الترقية إلى المميز' : 'Upgrade to Premium',
    backToDashboard: isRTL ? 'العودة للوحة التحكم' : 'Back to Dashboard',
    syncedWith: isRTL ? 'مقارنة مع:' : 'Comparing with:',
    newAnalysis: isRTL ? 'تحليل جديد' : 'New Analysis',
    analysisReady: isRTL ? 'نتيجة تحليل الوظيفة جاهزة!' : 'Job Analysis Report is Ready!',
    overallMatch: isRTL ? 'نسبة التطابق الكلية' : 'Overall Match',
    matchingSkills: isRTL ? 'المهارات المتطابقة' : 'Matching Skills',
    missingSkills: isRTL ? 'المهارات الناقصة' : 'Missing Skills',
    keyRequirements: isRTL ? 'المتطلبات الرئيسية' : 'Key Requirements',
    strengths: isRTL ? 'نقاط القوة' : 'Your Strengths',
    gaps: isRTL ? 'الثغرات' : 'Gaps to Address',
    recommendations: isRTL ? 'التوصيات' : 'Recommendations',
    cvImprovements: isRTL ? 'تحسينات السيرة الذاتية' : 'CV Improvements',
    jobDetails: isRTL ? 'تفاصيل الوظيفة' : 'Job Details',
    met: isRTL ? 'مستوفى' : 'Met',
    notMet: isRTL ? 'غير مستوفى' : 'Not Met',
    howItWorks: isRTL ? 'كيف يعمل' : 'How It Works',
    step1: isRTL ? 'الخطوة 1: اختر سيرتك الذاتية' : 'Step 1: Select your CV',
    step1Desc: isRTL ? 'اختر السيرة الذاتية التي تريد مقارنتها بالوظيفة' : 'Choose the CV you want to compare against the job',
    step2: isRTL ? 'الخطوة 2: الصق وصف الوظيفة' : 'Step 2: Paste the job description',
    step2Desc: isRTL ? 'انسخ وصف الوظيفة من أي موقع توظيف والصقه هنا' : 'Copy the job description from any job site and paste it here',
    step3: isRTL ? 'الخطوة 3: احصل على التحليل' : 'Step 3: Get the analysis',
    step3Desc: isRTL ? 'يحلل الذكاء الاصطناعي التطابق ويقدم توصيات مخصصة' : 'AI analyzes the match and gives personalized recommendations',
    jobDescRequired: isRTL ? 'يرجى لصق وصف الوظيفة أولاً' : 'Please paste the job description first',
    cvRequired: isRTL ? 'يرجى اختيار سيرة ذاتية' : 'Please select a CV',
    overview: isRTL ? 'نظرة عامة' : 'Overview',
    skills: isRTL ? 'المهارات' : 'Skills',
  };

  useEffect(() => {
    if (!authLoading && !user && !loggingOut) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router, loggingOut]);

  useEffect(() => {
    if (primaryCv && !selectedCvId) {
      setSelectedCvId(primaryCv.id);
    } else if (cvs.length > 0 && !selectedCvId) {
      setSelectedCvId(cvs[0].id);
    }
  }, [primaryCv, cvs, selectedCvId]);

  const handleCvSelection = (cvId: number) => {
    setSelectedCvId(cvId);
    setPrimaryCv(cvId);
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError(t.jobDescRequired);
      return;
    }
    if (!selectedCvId) {
      setError(t.cvRequired);
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const cvData = getCvForLinkedIn(selectedCvId);
      const response = await axios.post(
        '/api/ai/job-analyst',
        { jobDescription, cvData, language },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnalysis({ ...response.data.analysis, generatedAt: response.data.generatedAt });
      setActiveSection('overview');
    } catch (err: any) {
      setError(err.response?.data?.error || (isRTL ? 'فشل التحليل. يرجى المحاولة مرة أخرى.' : 'Analysis failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (score: number) => {
    if (score >= 75) return { bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-200' };
    if (score >= 50) return { bg: 'bg-yellow-500', text: 'text-yellow-600', light: 'bg-yellow-50', border: 'border-yellow-200' };
    return { bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-50', border: 'border-red-200' };
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-navy-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isPremium = user && user.subscriptionTier && user.subscriptionTier !== 'free';
  const cvData = selectedCvId ? getCvForLinkedIn(selectedCvId) : null;
  const selectedCvTitle = cvs?.find((cv: any) => cv.id === selectedCvId)?.title || 'Your CV';

  const sections = [
    { id: 'overview', label: t.overview, icon: FiBarChart2 },
    { id: 'skills', label: t.skills, icon: FiAward },
    { id: 'requirements', label: t.keyRequirements, icon: FiList },
    { id: 'recommendations', label: t.recommendations, icon: FiTarget },
    { id: 'cv', label: t.cvImprovements, icon: FiEdit3 },
  ];

  return (
    <div className={`min-h-screen bg-gray-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <FiTrendingUp className="w-6 h-6 text-emerald-600" />
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
        {/* Premium gate */}
        {!isPremium ? (
          <Card className="text-center py-12">
            <FiLock className="w-16 h-16 mx-auto text-emerald-600 mb-4" />
            <h2 className="text-3xl font-bold text-navy-900 mb-4">{t.premiumFeature}</h2>
            <p className="text-xl text-gray-600 mb-8">{t.unlockWith}</p>
            <Link href="/pricing">
              <Button size="lg">{t.upgradeToPremium}</Button>
            </Link>
          </Card>
        ) : !analysis ? (
          <div className="space-y-6">
            {/* CV Selection status */}
            {cvData && selectedCvId ? (
              <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FiCheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-navy-900">
                        {t.syncedWith} {selectedCvTitle}
                      </p>
                      <p className="text-sm text-gray-600">
                        {isRTL
                          ? 'سيتم مقارنة الوظيفة مع هذه السيرة الذاتية'
                          : 'The job will be matched against this CV'}
                      </p>
                    </div>
                  </div>
                  {cvs && cvs.length > 1 && (
                    <select
                      value={selectedCvId || ''}
                      onChange={(e) => handleCvSelection(Number(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    >
                      {cvs.map((cv: any) => (
                        <option key={cv.id} value={cv.id}>{cv.title}</option>
                      ))}
                    </select>
                  )}
                </div>
              </Card>
            ) : (
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

            {/* How it works */}
            <Card>
              <h2 className="text-xl font-bold text-navy-900 mb-6">{t.howItWorks}</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { num: '1', color: 'bg-emerald-100 text-emerald-600', title: t.step1, desc: t.step1Desc },
                  { num: '2', color: 'bg-teal-100 text-teal-600', title: t.step2, desc: t.step2Desc },
                  { num: '3', color: 'bg-green-100 text-green-600', title: t.step3, desc: t.step3Desc },
                ].map((step) => (
                  <div key={step.num} className="text-center">
                    <div className={`w-12 h-12 rounded-full ${step.color} flex items-center justify-center mx-auto mb-3`}>
                      <span className="font-bold">{step.num}</span>
                    </div>
                    <h3 className="font-semibold text-navy-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.desc}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Job description input */}
            <Card>
              <h2 className="text-xl font-bold text-navy-900 mb-4">
                {isRTL ? 'الصق وصف الوظيفة' : 'Paste Job Description'}
              </h2>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder={t.pasteJobDesc}
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-sm text-gray-800 placeholder-gray-400"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-400">
                  {jobDescription.length} {isRTL ? 'حرف' : 'characters'}
                </span>
                <Button
                  onClick={handleAnalyze}
                  disabled={loading || !jobDescription.trim() || !cvData}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      {t.analyzing}
                    </>
                  ) : (
                    <>
                      <FiTrendingUp className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t.analyzeBtn}
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {error && (
              <Card className="bg-red-50 border border-red-200">
                <p className="text-red-700">{error}</p>
              </Card>
            )}
          </div>
        ) : (
          /* Analysis Results */
          <div className="space-y-6">
            {/* Result Header */}
            <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <FiCheckCircle className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                  <div>
                    <h2 className="text-xl font-bold text-navy-900">{t.analysisReady}</h2>
                    {analysis.jobTitle && (
                      <p className="text-sm text-gray-600 mt-0.5">
                        {isRTL ? 'الوظيفة:' : 'Role:'} <span className="font-medium text-navy-800">{analysis.jobTitle}</span>
                        {analysis.company && <> {isRTL ? 'في' : 'at'} <span className="font-medium text-navy-800">{analysis.company}</span></>}
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="outline" onClick={() => { setAnalysis(null); setJobDescription(''); setError(''); }}>
                  <FiRefreshCw className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t.newAnalysis}
                </Button>
              </div>
            </Card>

            {/* Match Score Hero */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Big score card */}
              <Card className={`md:col-span-1 text-center py-8 border-2 ${getMatchColor(analysis.overallMatch).border}`}>
                <div className={`text-6xl font-extrabold ${getMatchColor(analysis.overallMatch).text} mb-2`}>
                  {analysis.overallMatch}%
                </div>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getMatchColor(analysis.overallMatch).light} ${getMatchColor(analysis.overallMatch).text} mb-3`}>
                  {isRTL ? analysis.matchLevelAr : analysis.matchLevel}
                </div>
                <p className="text-xs text-gray-500">{t.overallMatch}</p>
                <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden mx-4">
                  <div
                    className={`h-full rounded-full ${getMatchColor(analysis.overallMatch).bg} transition-all duration-700`}
                    style={{ width: `${analysis.overallMatch}%` }}
                  />
                </div>
              </Card>

              {/* Summary card */}
              <Card className="md:col-span-2">
                <h3 className="font-bold text-navy-900 mb-2 text-lg">{isRTL ? 'ملخص التحليل' : 'Analysis Summary'}</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {isRTL ? analysis.summaryAr : analysis.summary}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {analysis.experienceRequired && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-0.5">{isRTL ? 'الخبرة المطلوبة' : 'Experience Required'}</p>
                      <p className="font-semibold text-navy-900">{analysis.experienceRequired}</p>
                    </div>
                  )}
                  {analysis.salaryMentioned && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-0.5">{isRTL ? 'الراتب' : 'Salary'}</p>
                      <p className="font-semibold text-navy-900">{analysis.salaryMentioned}</p>
                    </div>
                  )}
                  <div className="bg-emerald-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">{isRTL ? 'مهارات مطابقة' : 'Matching Skills'}</p>
                    <p className="font-semibold text-emerald-700">{analysis.matchingSkills.length}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-0.5">{isRTL ? 'مهارات ناقصة' : 'Missing Skills'}</p>
                    <p className="font-semibold text-red-600">{analysis.missingSkills.length}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Section Navigation */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm ${
                    activeSection === section.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <section.icon className="w-4 h-4" />
                  {section.label}
                </button>
              ))}
            </div>

            {/* Overview section */}
            {activeSection === 'overview' && (
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
                    <FiCheckCircle className="w-5 h-5 text-emerald-500" />
                    {t.strengths}
                  </h3>
                  <ul className="space-y-2">
                    {(isRTL ? analysis.strengthsAr : analysis.strengths).map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </Card>
                <Card>
                  <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
                    <FiXCircle className="w-5 h-5 text-red-500" />
                    {t.gaps}
                  </h3>
                  <ul className="space-y-2">
                    {(isRTL ? analysis.gapsAr : analysis.gaps).map((g, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-red-500 mt-0.5 flex-shrink-0">✗</span>
                        {g}
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            )}

            {/* Skills section */}
            {activeSection === 'skills' && (
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
                    <FiCheckCircle className="w-5 h-5 text-emerald-500" />
                    {t.matchingSkills}
                  </h3>
                  {analysis.matchingSkills.length === 0 ? (
                    <p className="text-gray-500 text-sm">{isRTL ? 'لا توجد مهارات مطابقة محددة' : 'No specific matching skills identified'}</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {analysis.matchingSkills.map((skill, i) => (
                        <span key={i} className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
                <Card>
                  <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
                    <FiXCircle className="w-5 h-5 text-red-500" />
                    {t.missingSkills}
                  </h3>
                  {analysis.missingSkills.length === 0 ? (
                    <p className="text-gray-500 text-sm">{isRTL ? 'لا توجد مهارات ناقصة!' : 'No missing skills!'}</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {analysis.missingSkills.map((skill, i) => (
                        <span key={i} className="px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Key Requirements section */}
            {activeSection === 'requirements' && (
              <Card>
                <h3 className="text-lg font-bold text-navy-900 mb-5">{t.keyRequirements}</h3>
                <div className="space-y-3">
                  {(analysis.keyRequirements || []).map((req, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-4 p-4 rounded-xl border ${
                        req.met ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
                      }`}
                    >
                      {req.met ? (
                        <FiCheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <FiXCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-navy-900 text-sm">{req.requirement}</p>
                        {req.note && <p className="text-xs text-gray-600 mt-0.5">{req.note}</p>}
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                        req.met ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {req.met ? t.met : t.notMet}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Recommendations section */}
            {activeSection === 'recommendations' && (
              <Card>
                <h3 className="text-lg font-bold text-navy-900 mb-5">{t.recommendations}</h3>
                <ul className="space-y-3">
                  {(isRTL ? analysis.recommendationsAr : analysis.recommendations).map((rec, i) => (
                    <li key={i} className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-gray-800">{rec}</p>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* CV Improvements section */}
            {activeSection === 'cv' && (
              <Card>
                <h3 className="text-lg font-bold text-navy-900 mb-2">{t.cvImprovements}</h3>
                <p className="text-sm text-gray-500 mb-5">
                  {isRTL
                    ? 'تحسينات مقترحة لسيرتك الذاتية لتحسين فرصك في هذه الوظيفة'
                    : 'Suggested improvements to tailor your CV for this specific role'}
                </p>
                <ul className="space-y-3">
                  {(isRTL ? analysis.cvImprovementsAr : analysis.cvImprovements).map((imp, i) => (
                    <li key={i} className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                      <FiEdit3 className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-800">{imp}</p>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-5 border-t border-gray-100 flex gap-3 flex-wrap">
                  <Link href="/cv/preview">
                    <Button>
                      <FiEdit3 className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {isRTL ? 'تعديل سيرتك الذاتية' : 'Edit Your CV'}
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={() => { setAnalysis(null); setJobDescription(''); }}>
                    <FiRefreshCw className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t.newAnalysis}
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
