'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useCvData } from '@/lib/contexts/CvDataContext';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import UpgradeModal from '@/components/ui/UpgradeModal';
import VideoRecorder from '@/components/ui/VideoRecorder';
import AIInterviewPrepModal from '@/components/interview/AIInterviewPrepModal';
import { FiMessageSquare, FiDownload, FiArrowLeft, FiCheckCircle, FiFileText, FiClock, FiStar, FiRefreshCw, FiEdit3, FiThumbsUp, FiThumbsDown, FiEye, FiSend, FiVideo, FiMic, FiAlertTriangle } from 'react-icons/fi';
import Link from 'next/link';
import axios from 'axios';

interface TextAnswerEvaluation {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  suggestedAnswer: string;
}

interface VideoAnswerEvaluation {
  score: number;
  feedback: string;
  contentStrengths: string[];
  contentImprovements: string[];
  deliveryTips: string[];
  suggestedAnswer: string;
  transcript: string;
}

const FIXED_VIDEO_QUESTIONS = {
  en: [
    "Tell me about yourself / Introduce Yourself",
    "Why do you want to work here?",
    "Give us three of your strengths and three of your weaknesses?",
    "What can you bring to this company?",
    "Do you have any questions for us?"
  ],
  ar: [
    "أخبرني عن نفسك / قدم نفسك",
    "لماذا تريد العمل هنا؟",
    "أعطنا ثلاث نقاط قوة وثلاث نقاط ضعف لديك؟",
    "ماذا يمكنك أن تقدم لهذه الشركة؟",
    "هل لديك أي أسئلة لنا؟"
  ]
};

interface InterviewPrepResult {
  beforeInterview: {
    tips: string[];
    personalizedGuidance: string[];
    practiceQuestions: string[];
  };
  duringInterview: {
    expectedQuestionTypes: string[];
    communicationAdvice: string[];
    behaviorGuidelines: string[];
    scenarioQuestions: string[];
  };
  afterInterview: {
    followUpSteps: string[];
    thankYouEmailTemplate: string;
    reflectionQuestions: string[];
    improvementAdvice: string[];
  };
}

const EXPERIENCE_LEVELS = [
  { value: 'Entry-level', label: { en: 'Entry Level (0-2 years)', ar: 'مبتدئ (0-2 سنوات)' } },
  { value: 'Junior', label: { en: 'Junior (2-4 years)', ar: 'مبتدئ متقدم (2-4 سنوات)' } },
  { value: 'Mid-level', label: { en: 'Mid-Level (4-7 years)', ar: 'متوسط (4-7 سنوات)' } },
  { value: 'Senior', label: { en: 'Senior (7-10 years)', ar: 'كبير (7-10 سنوات)' } },
  { value: 'Lead', label: { en: 'Lead/Principal (10+ years)', ar: 'قائد (10+ سنوات)' } },
  { value: 'Executive', label: { en: 'Executive/Director', ar: 'مدير تنفيذي' } },
];

const INTERVIEW_STAGES = [
  { value: 'all', label: { en: 'Complete Guide (All Stages)', ar: 'دليل كامل (جميع المراحل)' } },
  { value: 'before', label: { en: 'Before Interview', ar: 'قبل المقابلة' } },
  { value: 'during', label: { en: 'During Interview', ar: 'أثناء المقابلة' } },
  { value: 'after', label: { en: 'After Interview', ar: 'بعد المقابلة' } },
];

const INTERVIEW_TYPES = [
  { value: 'both', label: { en: 'Both (Technical & Behavioral)', ar: 'كلاهما (تقني وسلوكي)' } },
  { value: 'technical', label: { en: 'Technical Interview', ar: 'مقابلة تقنية' } },
  { value: 'behavioral', label: { en: 'Behavioral Interview', ar: 'مقابلة سلوكية' } },
];

export default function InterviewPrepPage() {
  const router = useRouter();
  const { user, token, loading: authLoading, loggingOut } = useAuth();
  const { isRTL } = useLanguage();
  const { cvs, primaryCv, getCvForInterview } = useCvData();
  
  const [selectedCvId, setSelectedCvId] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Mid-level');
  const [interviewStage, setInterviewStage] = useState('all');
  const [interviewType, setInterviewType] = useState('both');
  const [targetRole, setTargetRole] = useState('');
  const [industry, setIndustry] = useState('');
  const [interviewData, setInterviewData] = useState<any>(null);
  
  const [prepResult, setPrepResult] = useState<InterviewPrepResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'before' | 'during' | 'after' | 'practice'>('before');

  const [practiceQuestionIndex, setPracticeQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [suggestedAnswers, setSuggestedAnswers] = useState<Record<number, string>>({});
  const [evaluations, setEvaluations] = useState<Record<number, TextAnswerEvaluation>>({});
  const [loadingSuggestion, setLoadingSuggestion] = useState<Record<number, boolean>>({});
  const [loadingEvaluation, setLoadingEvaluation] = useState<Record<number, boolean>>({});
  const [showSuggested, setShowSuggested] = useState<Record<number, boolean>>({});

  const [videoBlobs, setVideoBlobs] = useState<Record<number, Blob>>({});
  const [videoEvaluations, setVideoEvaluations] = useState<Record<number, VideoAnswerEvaluation>>({});
  const [loadingVideoEvaluation, setLoadingVideoEvaluation] = useState<Record<number, boolean>>({});
  const [practiceMode, setPracticeMode] = useState<'qa' | 'video'>('qa');

  useEffect(() => {
    if (!authLoading && !user && !loggingOut) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router, loggingOut]);

  useEffect(() => {
    if (primaryCv && !selectedCvId) {
      setSelectedCvId(primaryCv.id.toString());
      const data = getCvForInterview(primaryCv.id);
      setInterviewData(data);
      if (data) {
        setTargetRole(user?.targetJobTitle || data.jobTitle || '');
        setIndustry(user?.industry || data.industry || '');
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

  useEffect(() => {
    if (user?.careerLevel) {
      const mappedLevel = EXPERIENCE_LEVELS.find(l => 
        l.value.toLowerCase().includes(user.careerLevel?.toLowerCase() || '')
      );
      if (mappedLevel) {
        setExperienceLevel(mappedLevel.value);
      }
    }
  }, [user]);

  const handleCvSelection = (cvId: string) => {
    setSelectedCvId(cvId);
    const data = getCvForInterview(Number(cvId));
    setInterviewData(data);
    if (data) {
      setTargetRole(data.jobTitle || '');
      setIndustry(data.industry || '');
    }
  };

  const handleGenerate = async () => {
    if (!selectedCvId) {
      alert(isRTL ? 'يرجى اختيار سيرة ذاتية أولاً' : 'Please select a CV first');
      return;
    }

    setLoading(true);
    setPrepResult(null);

    try {
      const selectedCv = cvs.find(cv => cv.id.toString() === selectedCvId);
      
      const response = await axios.post(
        '/api/ai/interview-prep',
        {
          cvData: selectedCv,
          experienceLevel,
          interviewStage,
          interviewType,
          targetRole,
          industry,
          language: isRTL ? 'ar' : 'en',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPrepResult(response.data.interviewPrep);
    } catch (error: any) {
      console.error('Interview prep generation error:', error);
      if (error.response?.status === 403 && error.response?.data?.error === 'SUBSCRIPTION_REQUIRED') {
        setShowUpgradeModal(true);
      } else {
        alert(isRTL ? 'فشل في إنشاء محتوى التحضير للمقابلة. يرجى المحاولة مرة أخرى.' : 'Failed to generate interview preparation. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!prepResult) return;

    let content = isRTL ? '=== دليل التحضير للمقابلة ===\n\n' : '=== INTERVIEW PREPARATION GUIDE ===\n\n';
    
    content += isRTL ? '--- قبل المقابلة ---\n\n' : '--- BEFORE INTERVIEW ---\n\n';
    content += isRTL ? 'نصائح التحضير:\n' : 'Preparation Tips:\n';
    prepResult.beforeInterview.tips.forEach((tip, i) => {
      content += `${i + 1}. ${tip}\n`;
    });
    content += isRTL ? '\nإرشادات مخصصة:\n' : '\nPersonalized Guidance:\n';
    prepResult.beforeInterview.personalizedGuidance.forEach((g, i) => {
      content += `${i + 1}. ${g}\n`;
    });
    content += isRTL ? '\nأسئلة للتدريب:\n' : '\nPractice Questions:\n';
    prepResult.beforeInterview.practiceQuestions.forEach((q, i) => {
      content += `${i + 1}. ${q}\n`;
    });

    content += isRTL ? '\n--- أثناء المقابلة ---\n\n' : '\n--- DURING INTERVIEW ---\n\n';
    content += isRTL ? 'أنواع الأسئلة المتوقعة:\n' : 'Expected Question Types:\n';
    prepResult.duringInterview.expectedQuestionTypes.forEach((t, i) => {
      content += `${i + 1}. ${t}\n`;
    });
    content += isRTL ? '\nنصائح التواصل:\n' : '\nCommunication Advice:\n';
    prepResult.duringInterview.communicationAdvice.forEach((a, i) => {
      content += `${i + 1}. ${a}\n`;
    });
    content += isRTL ? '\nإرشادات السلوك:\n' : '\nBehavior Guidelines:\n';
    prepResult.duringInterview.behaviorGuidelines.forEach((g, i) => {
      content += `${i + 1}. ${g}\n`;
    });
    content += isRTL ? '\nأسئلة سيناريو:\n' : '\nScenario Questions:\n';
    prepResult.duringInterview.scenarioQuestions.forEach((q, i) => {
      content += `${i + 1}. ${q}\n`;
    });

    content += isRTL ? '\n--- بعد المقابلة ---\n\n' : '\n--- AFTER INTERVIEW ---\n\n';
    content += isRTL ? 'خطوات المتابعة:\n' : 'Follow-up Steps:\n';
    prepResult.afterInterview.followUpSteps.forEach((s, i) => {
      content += `${i + 1}. ${s}\n`;
    });
    content += isRTL ? '\nقالب رسالة الشكر:\n' : '\nThank You Email Template:\n';
    content += prepResult.afterInterview.thankYouEmailTemplate + '\n';
    content += isRTL ? '\nأسئلة للتأمل:\n' : '\nReflection Questions:\n';
    prepResult.afterInterview.reflectionQuestions.forEach((q, i) => {
      content += `${i + 1}. ${q}\n`;
    });
    content += isRTL ? '\nنصائح للتحسين:\n' : '\nImprovement Advice:\n';
    prepResult.afterInterview.improvementAdvice.forEach((a, i) => {
      content += `${i + 1}. ${a}\n`;
    });

    // Add Q&A Practice Results if any evaluations exist
    const hasQAResults = Object.keys(evaluations).length > 0;
    if (hasQAResults) {
      content += isRTL ? '\n\n=== نتائج تمرين الأسئلة والأجوبة ===\n\n' : '\n\n=== Q&A PRACTICE RESULTS ===\n\n';
      
      prepResult.beforeInterview.practiceQuestions.forEach((question, idx) => {
        if (evaluations[idx]) {
          const evaluation = evaluations[idx];
          content += isRTL ? `السؤال ${idx + 1}: ${question}\n` : `Question ${idx + 1}: ${question}\n`;
          content += isRTL ? `إجابتك: ${userAnswers[idx] || ''}\n` : `Your Answer: ${userAnswers[idx] || ''}\n`;
          content += isRTL ? `الدرجة: ${evaluation.score}/10\n` : `Score: ${evaluation.score}/10\n`;
          content += isRTL ? `التعليق: ${evaluation.feedback}\n` : `Feedback: ${evaluation.feedback}\n`;
          
          if (evaluation.strengths.length > 0) {
            content += isRTL ? 'نقاط القوة:\n' : 'Strengths:\n';
            evaluation.strengths.forEach((s, i) => {
              content += `  - ${s}\n`;
            });
          }
          
          if (evaluation.improvements.length > 0) {
            content += isRTL ? 'نقاط للتحسين:\n' : 'Areas for Improvement:\n';
            evaluation.improvements.forEach((imp, i) => {
              content += `  - ${imp}\n`;
            });
          }
          
          content += isRTL ? `الإجابة المقترحة: ${evaluation.suggestedAnswer}\n` : `Suggested Answer: ${evaluation.suggestedAnswer}\n`;
          content += '\n---\n\n';
        }
      });
    }

    // Add Video Practice Results if any evaluations exist
    const hasVideoResults = Object.keys(videoEvaluations).length > 0;
    if (hasVideoResults) {
      content += isRTL ? '\n\n=== نتائج تمرين الفيديو ===\n\n' : '\n\n=== VIDEO PRACTICE RESULTS ===\n\n';
      
      const videoQuestionsList = FIXED_VIDEO_QUESTIONS[isRTL ? 'ar' : 'en'];
      videoQuestionsList.forEach((question, idx) => {
        if (videoEvaluations[idx]) {
          const evaluation = videoEvaluations[idx];
          content += isRTL ? `السؤال ${idx + 1}: ${question}\n` : `Question ${idx + 1}: ${question}\n`;
          content += isRTL ? `النص المسجل: ${evaluation.transcript}\n` : `Transcript: ${evaluation.transcript}\n`;
          content += isRTL ? `الدرجة: ${evaluation.score}/10\n` : `Score: ${evaluation.score}/10\n`;
          content += isRTL ? `التعليق: ${evaluation.feedback}\n` : `Feedback: ${evaluation.feedback}\n`;
          
          if (evaluation.contentStrengths.length > 0) {
            content += isRTL ? 'نقاط القوة في المحتوى:\n' : 'Content Strengths:\n';
            evaluation.contentStrengths.forEach((s) => {
              content += `  - ${s}\n`;
            });
          }
          
          if (evaluation.contentImprovements.length > 0) {
            content += isRTL ? 'تحسينات المحتوى:\n' : 'Content Improvements:\n';
            evaluation.contentImprovements.forEach((imp) => {
              content += `  - ${imp}\n`;
            });
          }
          
          if (evaluation.deliveryTips.length > 0) {
            content += isRTL ? 'نصائح الإلقاء:\n' : 'Delivery Tips:\n';
            evaluation.deliveryTips.forEach((tip) => {
              content += `  - ${tip}\n`;
            });
          }
          
          content += isRTL ? `الإجابة المقترحة: ${evaluation.suggestedAnswer}\n` : `Suggested Answer: ${evaluation.suggestedAnswer}\n`;
          content += '\n---\n\n';
        }
      });
    }

    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `Interview_Prep_${targetRole || 'Guide'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleGetSuggestedAnswer = async (questionIndex: number, question: string) => {
    if (suggestedAnswers[questionIndex]) {
      setShowSuggested(prev => ({ ...prev, [questionIndex]: !prev[questionIndex] }));
      return;
    }

    if (!token || !selectedCvId) {
      alert(isRTL ? 'يرجى تسجيل الدخول واختيار سيرة ذاتية' : 'Please login and select a CV');
      return;
    }

    setLoadingSuggestion(prev => ({ ...prev, [questionIndex]: true }));
    try {
      const selectedCv = cvs.find(cv => cv.id.toString() === selectedCvId);
      const response = await axios.post(
        '/api/ai/interview-prep/evaluate-answer',
        {
          question,
          cvData: selectedCv,
          targetRole,
          industry,
          language: isRTL ? 'ar' : 'en',
          mode: 'suggest',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuggestedAnswers(prev => ({ ...prev, [questionIndex]: response.data.suggestedAnswer }));
      setShowSuggested(prev => ({ ...prev, [questionIndex]: true }));
    } catch (error: any) {
      console.error('Failed to get suggested answer:', error);
      alert(isRTL ? 'فشل في الحصول على الإجابة المقترحة' : 'Failed to get suggested answer');
    } finally {
      setLoadingSuggestion(prev => ({ ...prev, [questionIndex]: false }));
    }
  };

  const handleEvaluateAnswer = async (questionIndex: number, question: string) => {
    const userAnswer = userAnswers[questionIndex];
    if (!userAnswer || userAnswer.trim().length < 10) {
      alert(isRTL ? 'يرجى كتابة إجابة أطول (10 أحرف على الأقل)' : 'Please write a longer answer (at least 10 characters)');
      return;
    }

    if (!token || !selectedCvId) {
      alert(isRTL ? 'يرجى تسجيل الدخول واختيار سيرة ذاتية' : 'Please login and select a CV');
      return;
    }

    setLoadingEvaluation(prev => ({ ...prev, [questionIndex]: true }));
    try {
      const selectedCv = cvs.find(cv => cv.id.toString() === selectedCvId);
      const response = await axios.post(
        '/api/ai/interview-prep/evaluate-answer',
        {
          question,
          candidateAnswer: userAnswer,
          cvData: selectedCv,
          targetRole,
          industry,
          language: isRTL ? 'ar' : 'en',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvaluations(prev => ({ ...prev, [questionIndex]: response.data.evaluation }));
    } catch (error: any) {
      console.error('Failed to evaluate answer:', error);
      alert(isRTL ? 'فشل في تقييم الإجابة' : 'Failed to evaluate answer');
    } finally {
      setLoadingEvaluation(prev => ({ ...prev, [questionIndex]: false }));
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const videoQuestions = FIXED_VIDEO_QUESTIONS[isRTL ? 'ar' : 'en'];

  const handleVideoRecordingComplete = (blob: Blob, questionId: number) => {
    setVideoBlobs(prev => ({ ...prev, [questionId]: blob }));
  };

  const handleVideoDelete = (questionId: number) => {
    setVideoBlobs(prev => {
      const newBlobs = { ...prev };
      delete newBlobs[questionId];
      return newBlobs;
    });
    setVideoEvaluations(prev => {
      const newEvaluations = { ...prev };
      delete newEvaluations[questionId];
      return newEvaluations;
    });
  };

  const handleEvaluateVideo = async (questionId: number) => {
    const videoBlob = videoBlobs[questionId];
    if (!videoBlob) {
      alert(isRTL ? 'يرجى تسجيل الفيديو أولاً' : 'Please record a video first');
      return;
    }

    if (!token || !selectedCvId) {
      alert(isRTL ? 'يرجى تسجيل الدخول واختيار سيرة ذاتية' : 'Please login and select a CV');
      return;
    }

    setLoadingVideoEvaluation(prev => ({ ...prev, [questionId]: true }));
    try {
      const selectedCv = cvs.find(cv => cv.id.toString() === selectedCvId);
      const formData = new FormData();
      formData.append('video', videoBlob, 'recording.webm');
      formData.append('questionId', questionId.toString());
      formData.append('cvData', JSON.stringify(selectedCv));
      formData.append('targetRole', targetRole);
      formData.append('industry', industry);
      formData.append('language', isRTL ? 'ar' : 'en');

      const response = await axios.post(
        '/api/ai/interview-prep/evaluate-video',
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
          } 
        }
      );
      setVideoEvaluations(prev => ({ ...prev, [questionId]: response.data.evaluation }));
    } catch (error: any) {
      console.error('Failed to evaluate video:', error);
      const errorMessage = error.response?.data?.error || (isRTL ? 'فشل في تقييم الفيديو' : 'Failed to evaluate video');
      alert(errorMessage);
    } finally {
      setLoadingVideoEvaluation(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const practiceQuestions = prepResult?.beforeInterview.practiceQuestions || [];

  const isCvComplete = () => {
    if (!interviewData) return false;
    const hasExperience = interviewData.yearsOfExperience > 0 || (interviewData.experience && interviewData.experience.length > 0);
    const hasSkills = interviewData.skills && interviewData.skills.length > 0;
    const hasJobTitle = interviewData.jobTitle && interviewData.jobTitle !== 'Professional';
    return hasExperience && hasSkills && hasJobTitle;
  };

  const getMissingFields = () => {
    const missing: string[] = [];
    if (!interviewData) return missing;
    
    if (interviewData.yearsOfExperience === 0 && (!interviewData.experience || interviewData.experience.length === 0)) {
      missing.push(isRTL ? 'الخبرات العملية' : 'Work Experience');
    }
    if (!interviewData.skills || interviewData.skills.length === 0) {
      missing.push(isRTL ? 'المهارات' : 'Skills');
    }
    if (!interviewData.jobTitle || interviewData.jobTitle === 'Professional') {
      missing.push(isRTL ? 'المسمى الوظيفي' : 'Job Title');
    }
    return missing;
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

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FiMessageSquare className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-navy-900">
                {isRTL ? 'التحضير للمقابلات والإرشادات' : 'Interview Preparation & Guidance'}
              </h1>
              <p className="text-gray-600">
                {isRTL 
                  ? 'احصل على نصائح مخصصة وأسئلة تدريبية بناءً على خبراتك ومهاراتك'
                  : 'Get personalized tips and practice questions based on your experience and skills'}
              </p>
            </div>
          </div>

          {interviewData && selectedCvId && (
            <Card className={`border-2 ${isCvComplete() ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200' : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300'}`}>
              <div className="flex items-start gap-3">
                {isCvComplete() ? (
                  <FiCheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                ) : (
                  <FiAlertTriangle className="w-6 h-6 text-yellow-600 mt-1 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-navy-900">
                      {isRTL 
                        ? `استخدام البيانات من: ${cvs.find(cv => cv.id.toString() === selectedCvId)?.title || 'سيرتك الذاتية'}`
                        : `Using data from: ${cvs.find(cv => cv.id.toString() === selectedCvId)?.title || 'Your CV'}`}
                    </p>
                    <Link href={`/cv/edit?id=${selectedCvId}`}>
                      <Button variant="outline" size="sm">
                        <FiEdit3 className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                        {isRTL ? 'تعديل' : 'Edit CV'}
                      </Button>
                    </Link>
                  </div>
                  
                  {!isCvComplete() && (
                    <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mb-3">
                      <p className="text-sm text-yellow-800 font-medium mb-1">
                        {isRTL ? 'سيرتك الذاتية غير مكتملة' : 'Your CV is incomplete'}
                      </p>
                      <p className="text-sm text-yellow-700">
                        {isRTL 
                          ? `يرجى إضافة: ${getMissingFields().join('، ')}`
                          : `Please add: ${getMissingFields().join(', ')}`}
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">
                        {isRTL 
                          ? 'للحصول على نتائج أفضل، أكمل سيرتك الذاتية أولاً'
                          : 'For better results, complete your CV first'}
                      </p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">{isRTL ? 'المسمى الوظيفي:' : 'Job Title:'}</span>
                      <p className={`font-medium ${interviewData.jobTitle === 'Professional' ? 'text-yellow-600 italic' : 'text-navy-900'}`}>
                        {interviewData.jobTitle === 'Professional' 
                          ? (isRTL ? 'غير محدد' : 'Not specified') 
                          : interviewData.jobTitle}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">{isRTL ? 'سنوات الخبرة:' : 'Experience:'}</span>
                      <p className={`font-medium ${interviewData.yearsOfExperience === 0 ? 'text-yellow-600 italic' : 'text-navy-900'}`}>
                        {interviewData.yearsOfExperience === 0 
                          ? (isRTL ? 'غير محدد' : 'Not specified')
                          : `${interviewData.yearsOfExperience} ${isRTL ? 'سنوات' : 'years'}`}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">{isRTL ? 'المهارات:' : 'Skills:'}</span>
                      <p className={`font-medium ${!interviewData.skills || interviewData.skills.length === 0 ? 'text-yellow-600 italic' : 'text-navy-900'}`}>
                        {!interviewData.skills || interviewData.skills.length === 0 
                          ? (isRTL ? 'غير محددة' : 'Not specified')
                          : interviewData.skills.slice(0, 3).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <h2 className="text-xl font-bold text-navy-900 mb-4">
                {isRTL ? 'خيارات التحضير' : 'Preparation Options'}
              </h2>
              
              <div className="space-y-4">
                {cvs.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 mb-2">
                      <strong>{isRTL ? 'لم يتم العثور على سيرة ذاتية.' : 'No CV found.'}</strong>
                    </p>
                    <p className="text-sm text-yellow-700 mb-3">
                      {isRTL 
                        ? 'يرجى إنشاء سيرة ذاتية للحصول على تحضير مخصص.'
                        : 'Please create a CV to get personalized preparation.'}
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    {isRTL ? 'مستوى الخبرة' : 'Experience Level'}
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {EXPERIENCE_LEVELS.map((level) => (
                      <option key={level.value} value={level.value}>
                        {isRTL ? level.label.ar : level.label.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {isRTL ? 'مرحلة المقابلة' : 'Interview Stage'}
                  </label>
                  <select
                    value={interviewStage}
                    onChange={(e) => setInterviewStage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {INTERVIEW_STAGES.map((stage) => (
                      <option key={stage.value} value={stage.value}>
                        {isRTL ? stage.label.ar : stage.label.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {isRTL ? 'نوع المقابلة' : 'Interview Type'}
                  </label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {INTERVIEW_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {isRTL ? type.label.ar : type.label.en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {isRTL ? 'الوظيفة المستهدفة (اختياري)' : 'Target Role (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder={isRTL ? 'مثال: مهندس برمجيات' : 'e.g., Software Engineer'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {isRTL ? 'المجال/الصناعة (اختياري)' : 'Industry (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder={isRTL ? 'مثال: التكنولوجيا' : 'e.g., Technology'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={loading || !selectedCvId || !isCvComplete()}
                  fullWidth
                  className={`${isCvComplete() ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400 cursor-not-allowed'}`}
                >
                  {loading ? (
                    <>
                      <FiRefreshCw className={`w-4 h-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {isRTL ? 'جاري الإنشاء...' : 'Generating...'}
                    </>
                  ) : (
                    <>
                      <FiStar className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {isRTL ? 'إنشاء دليل التحضير' : 'Generate Prep Guide'}
                    </>
                  )}
                </Button>
                
                {!isCvComplete() && selectedCvId && (
                  <p className="text-xs text-center text-yellow-600 mt-2">
                    {isRTL 
                      ? 'أكمل سيرتك الذاتية للمتابعة'
                      : 'Complete your CV to continue'}
                  </p>
                )}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {prepResult ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex bg-white rounded-lg border border-gray-200 p-1">
                    <button
                      onClick={() => setActiveTab('before')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === 'before' 
                          ? 'bg-purple-600 text-white' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {isRTL ? 'قبل المقابلة' : 'Before'}
                    </button>
                    <button
                      onClick={() => setActiveTab('during')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === 'during' 
                          ? 'bg-purple-600 text-white' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {isRTL ? 'أثناء المقابلة' : 'During'}
                    </button>
                    <button
                      onClick={() => setActiveTab('after')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === 'after' 
                          ? 'bg-purple-600 text-white' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {isRTL ? 'بعد المقابلة' : 'After'}
                    </button>
                    <button
                      onClick={() => setActiveTab('practice')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeTab === 'practice' 
                          ? 'bg-green-600 text-white' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        <FiEdit3 className="w-4 h-4" />
                        {isRTL ? 'تدريب' : 'Practice'}
                      </span>
                    </button>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <FiDownload className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {isRTL ? 'تحميل الدليل' : 'Download Guide'}
                  </Button>
                </div>

                {activeTab === 'before' && (
                  <div className="space-y-4">
                    <Card className="border-l-4 border-blue-500">
                      <h3 className="text-lg font-bold text-navy-900 mb-3 flex items-center gap-2">
                        <FiStar className="w-5 h-5 text-blue-600" />
                        {isRTL ? 'نصائح التحضير المخصصة' : 'Personalized Preparation Tips'}
                      </h3>
                      <ul className="space-y-2">
                        {prepResult.beforeInterview.tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">{i + 1}.</span>
                            <span className="text-gray-700">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>

                    <Card className="border-l-4 border-green-500">
                      <h3 className="text-lg font-bold text-navy-900 mb-3 flex items-center gap-2">
                        <FiCheckCircle className="w-5 h-5 text-green-600" />
                        {isRTL ? 'إرشادات مخصصة بناءً على سيرتك الذاتية' : 'Personalized Guidance Based on Your CV'}
                      </h3>
                      <ul className="space-y-2">
                        {prepResult.beforeInterview.personalizedGuidance.map((guidance, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-green-600">•</span>
                            <span className="text-gray-700">{guidance}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>

                    <Card className="border-l-4 border-purple-500">
                      <h3 className="text-lg font-bold text-navy-900 mb-3 flex items-center gap-2">
                        <FiMessageSquare className="w-5 h-5 text-purple-600" />
                        {isRTL ? 'أسئلة للتدريب' : 'Practice Questions'}
                      </h3>
                      <ul className="space-y-3">
                        {prepResult.beforeInterview.practiceQuestions.map((question, i) => (
                          <li key={i} className="bg-gray-50 p-3 rounded-lg">
                            <span className="font-medium text-purple-700">{isRTL ? 'س' : 'Q'}{i + 1}:</span>
                            <span className="text-gray-700 ml-2">{question}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>
                )}

                {activeTab === 'during' && (
                  <div className="space-y-4">
                    <Card className="border-l-4 border-orange-500">
                      <h3 className="text-lg font-bold text-navy-900 mb-3 flex items-center gap-2">
                        <FiClock className="w-5 h-5 text-orange-600" />
                        {isRTL ? 'أنواع الأسئلة المتوقعة' : 'Expected Question Types'}
                      </h3>
                      <ul className="space-y-2">
                        {prepResult.duringInterview.expectedQuestionTypes.map((type, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-orange-600">•</span>
                            <span className="text-gray-700">{type}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>

                    <Card className="border-l-4 border-cyan-500">
                      <h3 className="text-lg font-bold text-navy-900 mb-3">
                        {isRTL ? 'نصائح التواصل' : 'Communication Advice'}
                      </h3>
                      <ul className="space-y-2">
                        {prepResult.duringInterview.communicationAdvice.map((advice, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-cyan-600">•</span>
                            <span className="text-gray-700">{advice}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>

                    <Card className="border-l-4 border-indigo-500">
                      <h3 className="text-lg font-bold text-navy-900 mb-3">
                        {isRTL ? 'إرشادات السلوك' : 'Behavior Guidelines'}
                      </h3>
                      <ul className="space-y-2">
                        {prepResult.duringInterview.behaviorGuidelines.map((guideline, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-indigo-600">•</span>
                            <span className="text-gray-700">{guideline}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>

                    <Card className="border-l-4 border-pink-500">
                      <h3 className="text-lg font-bold text-navy-900 mb-3 flex items-center gap-2">
                        <FiMessageSquare className="w-5 h-5 text-pink-600" />
                        {isRTL ? 'أسئلة سيناريو محتملة' : 'Scenario Questions You May Face'}
                      </h3>
                      <ul className="space-y-3">
                        {prepResult.duringInterview.scenarioQuestions.map((question, i) => (
                          <li key={i} className="bg-gray-50 p-3 rounded-lg">
                            <span className="font-medium text-pink-700">{isRTL ? 'س' : 'Q'}{i + 1}:</span>
                            <span className="text-gray-700 ml-2">{question}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>
                )}

                {activeTab === 'after' && (
                  <div className="space-y-4">
                    <Card className="border-l-4 border-teal-500">
                      <h3 className="text-lg font-bold text-navy-900 mb-3">
                        {isRTL ? 'خطوات المتابعة' : 'Follow-up Steps'}
                      </h3>
                      <ul className="space-y-2">
                        {prepResult.afterInterview.followUpSteps.map((step, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="bg-teal-100 text-teal-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {i + 1}
                            </span>
                            <span className="text-gray-700">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>

                    <Card className="border-l-4 border-emerald-500">
                      <h3 className="text-lg font-bold text-navy-900 mb-3">
                        {isRTL ? 'قالب رسالة الشكر' : 'Thank You Email Template'}
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-700 text-sm font-mono">
                        {prepResult.afterInterview.thankYouEmailTemplate}
                      </div>
                    </Card>

                    <Card className="border-l-4 border-amber-500">
                      <h3 className="text-lg font-bold text-navy-900 mb-3">
                        {isRTL ? 'أسئلة للتأمل الذاتي' : 'Reflection Questions'}
                      </h3>
                      <ul className="space-y-3">
                        {prepResult.afterInterview.reflectionQuestions.map((question, i) => (
                          <li key={i} className="bg-amber-50 p-3 rounded-lg">
                            <span className="text-gray-700">{question}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>

                    <Card className="border-l-4 border-rose-500">
                      <h3 className="text-lg font-bold text-navy-900 mb-3">
                        {isRTL ? 'نصائح للتحسين المستمر' : 'Improvement Advice'}
                      </h3>
                      <ul className="space-y-2">
                        {prepResult.afterInterview.improvementAdvice.map((advice, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-rose-600">•</span>
                            <span className="text-gray-700">{advice}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>
                )}

                {activeTab === 'practice' && (
                  <div className="space-y-6">
                    <div className="flex bg-white rounded-lg border border-gray-200 p-1 mb-4">
                      <button
                        onClick={() => setPracticeMode('qa')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          practiceMode === 'qa' 
                            ? 'bg-green-600 text-white' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <FiEdit3 className="w-4 h-4" />
                        {isRTL ? 'تدريب الأسئلة والأجوبة' : 'Q&A Practice'}
                      </button>
                      <button
                        onClick={() => setPracticeMode('video')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          practiceMode === 'video' 
                            ? 'bg-purple-600 text-white' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <FiVideo className="w-4 h-4" />
                        {isRTL ? 'تدريب الفيديو' : 'Video Practice'}
                      </button>
                    </div>

                    {practiceMode === 'qa' && (
                      <>
                        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                          <div className="flex items-start gap-3">
                            <FiEdit3 className="w-6 h-6 text-green-600 mt-1" />
                            <div>
                              <h3 className="text-lg font-bold text-navy-900 mb-1">
                                {isRTL ? 'وضع التدريب على الأسئلة والأجوبة' : 'Q&A Practice Mode'}
                              </h3>
                              <p className="text-gray-600 text-sm">
                                {isRTL 
                                  ? 'اكتب إجاباتك على الأسئلة أدناه واحصل على تقييم فوري من الذكاء الاصطناعي'
                                  : 'Write your answers to the questions below and get instant AI evaluation'}
                              </p>
                            </div>
                          </div>
                        </Card>

                        {practiceQuestions.length === 0 ? (
                          <Card className="text-center py-8">
                            <p className="text-gray-600">
                              {isRTL ? 'لا توجد أسئلة للتدريب. يرجى إنشاء دليل التحضير أولاً.' : 'No practice questions available. Please generate the prep guide first.'}
                            </p>
                          </Card>
                        ) : (
                          <div className="space-y-6">
                            {practiceQuestions.map((question, index) => (
                              <Card key={index} className="border-l-4 border-green-500">
                                <div className="mb-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="inline-flex items-center justify-center w-8 h-8 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                                      {index + 1}
                                    </span>
                                    <h4 className="text-lg font-semibold text-navy-900">
                                      {isRTL ? 'السؤال' : 'Question'}
                                    </h4>
                                  </div>
                                  <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{question}</p>
                                </div>

                                <div className="mb-4">
                                  <button
                                    onClick={() => handleGetSuggestedAnswer(index, question)}
                                    disabled={loadingSuggestion[index]}
                                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 mb-2"
                                  >
                                    <FiEye className="w-4 h-4" />
                                    {loadingSuggestion[index] 
                                      ? (isRTL ? 'جاري التحميل...' : 'Loading...') 
                                      : showSuggested[index] 
                                        ? (isRTL ? 'إخفاء الإجابة المقترحة' : 'Hide Suggested Answer')
                                        : (isRTL ? 'عرض الإجابة المقترحة' : 'Show Suggested Answer')}
                                  </button>
                                  
                                  {showSuggested[index] && suggestedAnswers[index] && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                      <p className="text-sm font-medium text-blue-800 mb-2">
                                        {isRTL ? 'الإجابة المقترحة من الذكاء الاصطناعي:' : 'AI Suggested Answer:'}
                                      </p>
                                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{suggestedAnswers[index]}</p>
                                    </div>
                                  )}
                                </div>

                                <div className="mb-4">
                                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    {isRTL ? 'إجابتك:' : 'Your Answer:'}
                                  </label>
                                  <textarea
                                    value={userAnswers[index] || ''}
                                    onChange={(e) => setUserAnswers(prev => ({ ...prev, [index]: e.target.value }))}
                                    placeholder={isRTL ? 'اكتب إجابتك هنا...' : 'Write your answer here...'}
                                    rows={5}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                                  />
                                  <p className="text-xs text-gray-500 mt-1">
                                    {userAnswers[index]?.length || 0} {isRTL ? 'حرف' : 'characters'}
                                  </p>
                                </div>

                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEvaluateAnswer(index, question)}
                                    disabled={loadingEvaluation[index] || !userAnswers[index] || userAnswers[index].trim().length < 10}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    {loadingEvaluation[index] ? (
                                      <>
                                        <FiRefreshCw className="w-4 h-4 animate-spin" />
                                        {isRTL ? 'جاري التقييم...' : 'Evaluating...'}
                                      </>
                                    ) : (
                                      <>
                                        <FiSend className="w-4 h-4" />
                                        {isRTL ? 'تقييم إجابتي' : 'Evaluate My Answer'}
                                      </>
                                    )}
                                  </button>
                                </div>

                                {evaluations[index] && (
                                  <div className="mt-6 space-y-4 border-t pt-4">
                                    <div className="flex items-center gap-4">
                                      <div className={`px-4 py-2 rounded-lg font-bold text-xl ${getScoreColor(evaluations[index].score)}`}>
                                        {evaluations[index].score}/10
                                      </div>
                                      <p className="text-gray-700 flex-1">{evaluations[index].feedback}</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="bg-green-50 rounded-lg p-4">
                                        <h5 className="font-semibold text-green-800 flex items-center gap-2 mb-2">
                                          <FiThumbsUp className="w-4 h-4" />
                                          {isRTL ? 'نقاط القوة' : 'Strengths'}
                                        </h5>
                                        <ul className="space-y-1">
                                          {evaluations[index].strengths.map((s, i) => (
                                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                              <span className="text-green-600">✓</span>
                                              {s}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>

                                      <div className="bg-orange-50 rounded-lg p-4">
                                        <h5 className="font-semibold text-orange-800 flex items-center gap-2 mb-2">
                                          <FiThumbsDown className="w-4 h-4" />
                                          {isRTL ? 'مجالات التحسين' : 'Areas for Improvement'}
                                        </h5>
                                        <ul className="space-y-1">
                                          {evaluations[index].improvements.map((imp, i) => (
                                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                              <span className="text-orange-600">→</span>
                                              {imp}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>

                                    {evaluations[index].suggestedAnswer && (
                                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                        <h5 className="font-semibold text-purple-800 mb-2">
                                          {isRTL ? 'نسخة محسنة من إجابتك:' : 'Improved Version of Your Answer:'}
                                        </h5>
                                        <p className="text-gray-700 text-sm whitespace-pre-wrap">{evaluations[index].suggestedAnswer}</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </Card>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {practiceMode === 'video' && (
                      <>
                        <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
                          <div className="flex items-start gap-3">
                            <FiVideo className="w-6 h-6 text-purple-600 mt-1" />
                            <div>
                              <h3 className="text-lg font-bold text-navy-900 mb-1">
                                {isRTL ? 'وضع تدريب الفيديو' : 'Video Practice Mode'}
                              </h3>
                              <p className="text-gray-600 text-sm">
                                {isRTL 
                                  ? 'سجل إجاباتك بالفيديو على الأسئلة الشائعة في المقابلات واحصل على تقييم الذكاء الاصطناعي بناءً على النص المستخرج'
                                  : 'Record video answers to common interview questions and get AI evaluation based on the transcribed text'}
                              </p>
                            </div>
                          </div>
                        </Card>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                          <FiMic className="w-5 h-5 text-amber-600 mt-0.5" />
                          <div>
                            <p className="text-sm text-amber-800 font-medium mb-1">
                              {isRTL ? 'نصائح للتسجيل الجيد:' : 'Tips for a good recording:'}
                            </p>
                            <ul className="text-sm text-amber-700 space-y-1">
                              <li>• {isRTL ? 'تأكد من إضاءة جيدة ومايكروفون واضح' : 'Ensure good lighting and clear microphone'}</li>
                              <li>• {isRTL ? 'تحدث بوضوح وبسرعة معتدلة' : 'Speak clearly and at a moderate pace'}</li>
                              <li>• {isRTL ? 'الحد الأقصى للتسجيل 3 دقائق لكل سؤال' : 'Maximum recording time is 3 minutes per question'}</li>
                            </ul>
                          </div>
                        </div>

                        <div className="space-y-6">
                          {videoQuestions.map((question, index) => {
                            const questionId = index + 1;
                            return (
                              <Card key={questionId} className="border-l-4 border-purple-500">
                                <VideoRecorder
                                  questionId={questionId}
                                  questionText={question}
                                  isRTL={isRTL}
                                  onRecordingComplete={handleVideoRecordingComplete}
                                  onDelete={handleVideoDelete}
                                  disabled={loadingVideoEvaluation[questionId]}
                                />

                                {videoBlobs[questionId] && !videoEvaluations[questionId] && (
                                  <div className="mt-4">
                                    <button
                                      onClick={() => handleEvaluateVideo(questionId)}
                                      disabled={loadingVideoEvaluation[questionId]}
                                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                      {loadingVideoEvaluation[questionId] ? (
                                        <>
                                          <FiRefreshCw className="w-4 h-4 animate-spin" />
                                          {isRTL ? 'جاري تحليل الفيديو...' : 'Analyzing video...'}
                                        </>
                                      ) : (
                                        <>
                                          <FiSend className="w-4 h-4" />
                                          {isRTL ? 'إرسال للتقييم' : 'Submit for Evaluation'}
                                        </>
                                      )}
                                    </button>
                                  </div>
                                )}

                                {videoEvaluations[questionId] && (
                                  <div className="mt-6 space-y-4 border-t pt-4">
                                    <div className="flex items-center gap-4">
                                      <div className={`px-4 py-2 rounded-lg font-bold text-xl ${getScoreColor(videoEvaluations[questionId].score)}`}>
                                        {videoEvaluations[questionId].score}/10
                                      </div>
                                      <p className="text-gray-700 flex-1">{videoEvaluations[questionId].feedback}</p>
                                    </div>

                                    {videoEvaluations[questionId].transcript && (
                                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <h5 className="font-semibold text-gray-800 mb-2">
                                          {isRTL ? 'النص المستخرج من الفيديو:' : 'Transcribed Text:'}
                                        </h5>
                                        <p className="text-gray-600 text-sm whitespace-pre-wrap">{videoEvaluations[questionId].transcript}</p>
                                      </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="bg-green-50 rounded-lg p-4">
                                        <h5 className="font-semibold text-green-800 flex items-center gap-2 mb-2">
                                          <FiThumbsUp className="w-4 h-4" />
                                          {isRTL ? 'نقاط القوة في المحتوى' : 'Content Strengths'}
                                        </h5>
                                        <ul className="space-y-1">
                                          {videoEvaluations[questionId].contentStrengths.map((s, i) => (
                                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                              <span className="text-green-600">✓</span>
                                              {s}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>

                                      <div className="bg-orange-50 rounded-lg p-4">
                                        <h5 className="font-semibold text-orange-800 flex items-center gap-2 mb-2">
                                          <FiThumbsDown className="w-4 h-4" />
                                          {isRTL ? 'مجالات التحسين' : 'Areas for Improvement'}
                                        </h5>
                                        <ul className="space-y-1">
                                          {videoEvaluations[questionId].contentImprovements.map((imp, i) => (
                                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                              <span className="text-orange-600">→</span>
                                              {imp}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>

                                    {videoEvaluations[questionId].deliveryTips.length > 0 && (
                                      <div className="bg-blue-50 rounded-lg p-4">
                                        <h5 className="font-semibold text-blue-800 flex items-center gap-2 mb-2">
                                          <FiMic className="w-4 h-4" />
                                          {isRTL ? 'نصائح للإلقاء' : 'Delivery Tips'}
                                        </h5>
                                        <ul className="space-y-1">
                                          {videoEvaluations[questionId].deliveryTips.map((tip, i) => (
                                            <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                              <span className="text-blue-600">•</span>
                                              {tip}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {videoEvaluations[questionId].suggestedAnswer && (
                                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                        <h5 className="font-semibold text-purple-800 mb-2">
                                          {isRTL ? 'نسخة محسنة من إجابتك:' : 'Improved Version of Your Answer:'}
                                        </h5>
                                        <p className="text-gray-700 text-sm whitespace-pre-wrap">{videoEvaluations[questionId].suggestedAnswer}</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </Card>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <Card className="text-center py-16">
                <FiMessageSquare className="w-16 h-16 mx-auto text-purple-300 mb-4" />
                <h3 className="text-xl font-bold text-navy-900 mb-2">
                  {isRTL ? 'ابدأ التحضير للمقابلة' : 'Start Your Interview Preparation'}
                </h3>
                <p className="text-gray-600 mb-4 max-w-md mx-auto">
                  {isRTL 
                    ? 'اختر سيرتك الذاتية وحدد خياراتك، ثم انقر على "إنشاء دليل التحضير" للحصول على نصائح وأسئلة مخصصة'
                    : 'Select your CV and choose your preferences, then click "Generate Prep Guide" to get personalized tips and questions'}
                </p>
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-8">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <p className="text-sm text-gray-600">{isRTL ? 'قبل المقابلة' : 'Before'}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-purple-600 font-bold">2</span>
                    </div>
                    <p className="text-sm text-gray-600">{isRTL ? 'أثناء المقابلة' : 'During'}</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-green-600 font-bold">3</span>
                    </div>
                    <p className="text-sm text-gray-600">{isRTL ? 'بعد المقابلة' : 'After'}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        feature={isRTL ? 'التحضير للمقابلات' : 'Interview Preparation'}
      />

      <AIInterviewPrepModal isOpen={loading} />
    </div>
  );
}
