'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import StepNavigation from '@/components/cv/StepNavigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { FiArrowLeft, FiArrowRight, FiCheck, FiLock, FiEye, FiLayout, FiFileText, FiStar } from 'react-icons/fi';

interface Template {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  isPremium: boolean;
  features: string[];
  featuresAr: string[];
  previewType: 'ats' | 'modern' | 'creative' | 'executive';
}

const TEMPLATES: Template[] = [
  {
    id: 'simple-professional',
    name: 'Simple Professional',
    nameAr: 'بسيط احترافي',
    description: 'Gray and white simple professional template with clean layout and right-aligned contact info.',
    descriptionAr: 'قالب احترافي بسيط باللون الرمادي والأبيض بتخطيط نظيف ومعلومات الاتصال محاذاة لليمين.',
    isPremium: false,
    features: ['Simple Design', 'Gray & White', 'Clean Layout', 'Professional'],
    featuresAr: ['تصميم بسيط', 'رمادي وأبيض', 'تخطيط نظيف', 'احترافي'],
    previewType: 'ats',
  },
  {
    id: 'minimalist-clean',
    name: 'Minimalist Clean',
    nameAr: 'بسيط نظيف',
    description: 'White minimalist clean template with simple design and numbered contact information.',
    descriptionAr: 'قالب نظيف بسيط باللون الأبيض بتصميم بسيط ومعلومات اتصال مرقمة.',
    isPremium: false,
    features: ['Minimalist', 'White & Clean', 'Simple Design', 'Professional'],
    featuresAr: ['بسيط', 'أبيض ونظيف', 'تصميم بسيط', 'احترافي'],
    previewType: 'ats',
  },
];

export default function CVDesignPage() {
  const router = useRouter();
  const { user, loading: authLoading, loggingOut } = useAuth();
  const { isRTL, language } = useLanguage();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('simple-professional');
  const [cvData, setCvData] = useState<any>(null);

  const isPremium = user?.subscriptionTier !== 'free';

  useEffect(() => {
    if (!authLoading && !user && !loggingOut) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router, loggingOut]);

  useEffect(() => {
    const storedCV = sessionStorage.getItem('generatedCV');
    if (storedCV) {
      try {
        setCvData(JSON.parse(storedCV));
      } catch (e) {
        console.error('Failed to parse CV data:', e);
      }
    }
    
    const savedTemplate = sessionStorage.getItem('selectedTemplate');
    if (savedTemplate) {
      setSelectedTemplate(savedTemplate);
    }
  }, []);

  const handleTemplateSelect = (templateId: string) => {
    const template = TEMPLATES.find(t => t.id === templateId);
    if (template?.isPremium && !isPremium) {
      return;
    }
    setSelectedTemplate(templateId);
    sessionStorage.setItem('selectedTemplate', templateId);
  };

  const handleBack = () => {
    router.push('/cv/edit');
  };

  const handleNext = () => {
    sessionStorage.setItem('selectedTemplate', selectedTemplate);
    router.push('/cv/download');
  };

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const selectedTemplateData = TEMPLATES.find(t => t.id === selectedTemplate);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <StepNavigation currentStep="design" language={language} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {isRTL ? 'اختيار التصميم والقالب' : 'Choose Your Template'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {isRTL 
              ? 'اختر قالباً احترافياً يناسب مجالك المهني ويبرز مهاراتك بشكل مميز'
              : 'Select a professional template that matches your industry and highlights your skills'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TEMPLATES.map((template) => {
                const isLocked = template.isPremium && !isPremium;
                const isSelected = selectedTemplate === template.id;
                
                return (
                  <Card
                    key={template.id}
                    onClick={() => !isLocked && handleTemplateSelect(template.id)}
                    className={`
                      relative cursor-pointer transition-all duration-300 overflow-hidden
                      ${isSelected 
                        ? 'ring-2 ring-blue-600 border-blue-600 shadow-xl scale-[1.02] bg-gradient-to-br from-blue-50 to-indigo-50' 
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-lg bg-white'
                      }
                      ${isLocked ? 'opacity-70 cursor-not-allowed' : ''}
                    `}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-gray-900">
                              {isRTL ? template.nameAr : template.name}
                            </h3>
                            {isSelected && (
                              <FiCheck className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {isRTL ? template.descriptionAr : template.description}
                          </p>
                        </div>
                        {template.isPremium && (
                          <span className={`
                            flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold
                            ${isLocked 
                              ? 'bg-amber-100 text-amber-700' 
                              : 'bg-purple-100 text-purple-700'
                            }
                          `}>
                            {isLocked ? <FiLock className="w-3 h-3" /> : <FiStar className="w-3 h-3" />}
                            {isRTL ? 'مميز' : 'Pro'}
                          </span>
                        )}
                        {!template.isPremium && (
                          <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            <FiCheck className="w-3 h-3" />
                            {isRTL ? 'مجاني' : 'Free'}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-4">
                        {(isRTL ? template.featuresAr : template.features).map((feature, idx) => (
                          <span 
                            key={idx}
                            className={`
                              text-xs px-2 py-1 rounded-full
                              ${isSelected 
                                ? 'bg-blue-100 text-blue-700' 
                                : 'bg-gray-100 text-gray-600'
                              }
                            `}
                          >
                            {feature}
                          </span>
                        ))}
                      </div>

                      {isLocked && (
                        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <p className="text-xs text-amber-700 font-medium">
                            {isRTL 
                              ? 'متاح للمشتركين في الخطط المدفوعة'
                              : 'Available in Pro plans'}
                          </p>
                        </div>
                      )}

                      {isSelected && !isLocked && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {!isPremium && (
              <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold mb-1">
                        {isRTL ? 'احصل على قوالب احترافية إضافية' : 'Unlock More Premium Templates'}
                      </h3>
                      <p className="text-sm opacity-90">
                        {isRTL 
                          ? 'ترقية للوصول إلى جميع القوالب المميزة والميزات الإضافية'
                          : 'Upgrade to access all premium templates and advanced features'}
                      </p>
                    </div>
                    <Button
                      onClick={() => router.push('/subscription')}
                      className="!bg-purple-600 !text-white hover:!bg-purple-700 font-bold border-2 border-purple-600"
                    >
                      {isRTL ? 'ترقية الآن' : 'Upgrade Now'}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="bg-white shadow-xl border border-gray-100">
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                    <FiEye className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-lg text-gray-800">
                      {isRTL ? 'معاينة القالب' : 'Template Preview'}
                    </h3>
                  </div>
                  
                  <div className="bg-gray-100 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
                    <TemplatePreviewMini 
                      templateId={selectedTemplate} 
                      cvData={cvData}
                      isRTL={isRTL}
                    />
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">
                      {selectedTemplateData ? (isRTL ? selectedTemplateData.nameAr : selectedTemplateData.name) : ''}
                    </h4>
                    <p className="text-sm text-blue-700">
                      {selectedTemplateData ? (isRTL ? selectedTemplateData.descriptionAr : selectedTemplateData.description) : ''}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-200">
          <Button
            onClick={handleBack}
            variant="outline"
            className="flex items-center gap-2 px-6 py-3"
          >
            {isRTL ? (
              <>
                {isRTL ? 'العودة للمحتوى' : 'Back to Content'}
                <FiArrowRight className="w-5 h-5" />
              </>
            ) : (
              <>
                <FiArrowLeft className="w-5 h-5" />
                Back to Content
              </>
            )}
          </Button>

          <Button
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isRTL ? (
              <>
                <FiArrowLeft className="w-5 h-5" />
                {isRTL ? 'التالي: التحميل' : 'Next: Download'}
              </>
            ) : (
              <>
                Next: Download
                <FiArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function TemplatePreviewMini({ templateId, cvData, isRTL }: { templateId: string; cvData: any; isRTL: boolean }) {
  const getName = () => cvData?.personalInfo?.fullName || cvData?.personalInfo?.name || '';
  const getEmail = () => cvData?.personalInfo?.email || '';
  const getSummary = () => cvData?.professionalSummary || cvData?.summary || '';
  const getExperience = () => cvData?.experience?.[0] || null;
  const getEducation = () => cvData?.education?.[0] || null;

  const getPreviewContent = () => {
    switch (templateId) {
      case 'simple-professional':
        return (
          <div className="bg-white p-4 shadow-lg w-full h-full text-xs">
            <div className="border-b-2 border-gray-600 pb-2 mb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-bold text-sm uppercase tracking-wide text-gray-800">
                    {getName()}
                  </div>
                  <div className="text-[10px] text-gray-600 mt-1">
                    Professional Title
                  </div>
                </div>
                <div className="text-[9px] text-gray-600 text-right">
                  <div>Phone</div>
                  <div>Email</div>
                  <div>Location</div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <div className="font-bold uppercase text-[9px] tracking-widest border-b border-gray-400 pb-0.5 mb-1">
                  PROFILE
                </div>
                <div className="text-[8px] text-gray-700 leading-relaxed line-clamp-2">
                  {getSummary()}
                </div>
              </div>
              <div>
                <div className="font-bold uppercase text-[9px] tracking-widest border-b border-gray-400 pb-0.5 mb-1">
                  WORK EXPERIENCE
                </div>
                <div className="text-[8px] text-gray-700">
                  <div className="font-semibold">{getExperience()?.position || 'Position'}</div>
                  <div className="text-gray-500">{getExperience()?.company || 'Company'}</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'minimalist-clean':
        return (
          <div className="bg-white p-4 shadow-lg w-full h-full text-xs">
            <div className="border-b border-gray-300 pb-2 mb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-bold text-sm text-black">
                    {getName()}
                  </div>
                  <div className="text-[10px] text-gray-600 mt-1">
                    Professional Title
                  </div>
                </div>
                <div className="text-[9px] text-gray-600 text-right">
                  <div>(1) Phone</div>
                  <div>(2) Email</div>
                  <div>(3) @linkedin</div>
                  <div>(4) Location</div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <div className="font-bold uppercase text-[9px] tracking-widest text-black pb-0.5 mb-1">
                  PROFESSIONAL SUMMARY
                </div>
                <div className="text-[8px] text-gray-700 leading-relaxed line-clamp-2">
                  {getSummary()}
                </div>
              </div>
              <div>
                <div className="font-bold uppercase text-[9px] tracking-widest text-black pb-0.5 mb-1">
                  PROFESSIONAL EXPERIENCE
                </div>
                <div className="text-[8px] text-gray-700">
                  <div className="font-semibold">{getExperience()?.position || 'Position'}</div>
                  <div className="text-gray-500">{getExperience()?.company || 'Company'}</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'classic':
      case 'ats-optimized':
        return (
          <div className="bg-white p-4 shadow-lg w-full h-full text-xs">
            <div className="border-b-2 border-black pb-2 mb-3">
              <div className="font-bold text-sm uppercase tracking-wide text-black">
                {getName()}
              </div>
              <div className="text-[10px] text-gray-600 mt-1">
                {getEmail()}
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <div className="font-bold uppercase text-[9px] tracking-widest border-b border-gray-400 pb-0.5 mb-1">
                  Professional Summary
                </div>
                <div className="text-[8px] text-gray-700 leading-relaxed line-clamp-2">
                  {getSummary()}
                </div>
              </div>
              <div>
                <div className="font-bold uppercase text-[9px] tracking-widest border-b border-gray-400 pb-0.5 mb-1">
                  Experience
                </div>
                <div className="text-[8px] text-gray-700">
                  <div className="font-semibold">{getExperience()?.position || 'Position'}</div>
                  <div className="text-gray-500">{getExperience()?.company || 'Company'}</div>
                </div>
              </div>
              <div>
                <div className="font-bold uppercase text-[9px] tracking-widest border-b border-gray-400 pb-0.5 mb-1">
                  Education
                </div>
                <div className="text-[8px] text-gray-700">
                  <div className="font-semibold">{getEducation()?.degree || 'Degree'}</div>
                  <div className="text-gray-500">{getEducation()?.institution || 'Institution'}</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'modern':
        return (
          <div className="bg-white shadow-lg w-full h-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
              <div className="font-bold text-sm">
                {getName()}
              </div>
              <div className="text-[10px] opacity-90">
                {getEmail()}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 p-3">
              <div className="col-span-1 space-y-2">
                <div className="text-[8px] font-bold text-blue-600 uppercase border-b border-blue-200 pb-0.5">Skills</div>
                <div className="text-[7px] text-gray-600">• Skills listed</div>
              </div>
              <div className="col-span-2 space-y-2">
                <div className="text-[8px] font-bold text-blue-600 uppercase border-b border-blue-200 pb-0.5">Summary</div>
                <div className="text-[7px] text-gray-700 line-clamp-2">
                  {getSummary()}
                </div>
              </div>
            </div>
          </div>
        );

      case 'creative':
        return (
          <div className="bg-gradient-to-br from-purple-600 to-pink-500 shadow-lg w-full h-full overflow-hidden">
            <div className="p-4 text-white">
              <div className="font-bold text-lg tracking-wide">
                {getName()}
              </div>
              <div className="text-[10px] opacity-90 mt-1">
                Creative Professional
              </div>
            </div>
            <div className="bg-white m-2 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-purple-50 p-2 rounded">
                  <div className="text-[8px] font-bold text-purple-700">Skills</div>
                </div>
                <div className="bg-pink-50 p-2 rounded">
                  <div className="text-[8px] font-bold text-pink-700">Experience</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'clean-modern':
        return (
          <div className="bg-white p-4 shadow-lg w-full h-full text-xs">
            <div className="pb-2 mb-3 border-b-2" style={{ borderColor: '#1e40af' }}>
              <div className="font-light text-sm tracking-wide text-gray-900">{getName()}</div>
              <div className="text-[10px] mt-0.5" style={{ color: '#1e40af' }}>Professional Title</div>
              <div className="text-[8px] text-gray-500 mt-1">Phone | Email | Location</div>
            </div>
            <div className="space-y-2">
              <div>
                <div className="font-semibold uppercase text-[9px] tracking-wide pb-0.5 mb-1 pl-2" style={{ borderLeft: '3px solid #1e40af', color: '#1e40af' }}>PROFILE</div>
                <div className="text-[8px] text-gray-700 leading-relaxed line-clamp-2">{getSummary()}</div>
              </div>
              <div>
                <div className="font-semibold uppercase text-[9px] tracking-wide pb-0.5 mb-1 pl-2" style={{ borderLeft: '3px solid #1e40af', color: '#1e40af' }}>EXPERIENCE</div>
                <div className="text-[8px] text-gray-700">
                  <div className="font-semibold">{getExperience()?.position || 'Position'}</div>
                  <div className="text-gray-500">{getExperience()?.company || 'Company'}</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'professional-edge':
        return (
          <div className="bg-white shadow-lg w-full h-full text-xs">
            <div className="p-3 text-white" style={{ backgroundColor: '#1e40af' }}>
              <div className="font-bold text-sm tracking-wide">{getName()}</div>
              <div className="text-[10px] opacity-90 mt-0.5">Professional Title</div>
            </div>
            <div className="px-3 py-1.5 bg-gray-50 text-[8px] text-gray-600">Phone | Email | Location</div>
            <div className="p-3 space-y-2">
              <div>
                <div className="font-bold uppercase text-[9px] tracking-widest pb-0.5 mb-1" style={{ borderBottom: '2px solid #1e40af', color: '#1e40af' }}>PROFILE</div>
                <div className="text-[8px] text-gray-700 leading-relaxed line-clamp-2">{getSummary()}</div>
              </div>
              <div>
                <div className="font-bold uppercase text-[9px] tracking-widest pb-0.5 mb-1" style={{ borderBottom: '2px solid #1e40af', color: '#1e40af' }}>EXPERIENCE</div>
                <div className="text-[8px] text-gray-700">
                  <div className="font-semibold">{getExperience()?.position || 'Position'}</div>
                  <div className="text-gray-500">{getExperience()?.company || 'Company'}</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'metro':
        return (
          <div className="bg-white shadow-lg w-full h-full text-xs">
            <div className="p-3 text-white" style={{ backgroundColor: '#1e40af' }}>
              <div className="font-bold text-sm uppercase tracking-wider">{getName()}</div>
              <div className="text-[10px] opacity-80 mt-0.5">Professional Title</div>
              <div className="text-[8px] opacity-70 mt-1">Phone | Email | Location</div>
            </div>
            <div className="p-3 space-y-2">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-1.5 h-1.5" style={{ backgroundColor: '#1e40af' }}></div>
                  <div className="font-bold uppercase text-[9px] tracking-wider text-gray-800">PROFILE</div>
                </div>
                <div className="text-[8px] text-gray-700 leading-relaxed line-clamp-2">{getSummary()}</div>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <div className="w-1.5 h-1.5" style={{ backgroundColor: '#1e40af' }}></div>
                  <div className="font-bold uppercase text-[9px] tracking-wider text-gray-800">EXPERIENCE</div>
                </div>
                <div className="text-[8px] text-gray-700">
                  <div className="font-semibold">{getExperience()?.position || 'Position'}</div>
                  <div className="text-gray-500">{getExperience()?.company || 'Company'}</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'fresh-start':
        return (
          <div className="bg-white p-4 shadow-lg w-full h-full text-xs">
            <div className="pb-2 mb-3 border-b border-gray-200">
              <div className="font-bold text-sm text-gray-900">{getName()}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">Professional Title | Phone | Email</div>
            </div>
            <div className="space-y-2">
              <div>
                <div className="inline-block text-[9px] font-semibold px-2 py-0.5 rounded-full mb-1" style={{ backgroundColor: 'rgba(30,64,175,0.1)', color: '#1e40af' }}>PROFILE</div>
                <div className="text-[8px] text-gray-700 leading-relaxed line-clamp-2">{getSummary()}</div>
              </div>
              <div>
                <div className="inline-block text-[9px] font-semibold px-2 py-0.5 rounded-full mb-1" style={{ backgroundColor: 'rgba(30,64,175,0.1)', color: '#1e40af' }}>EXPERIENCE</div>
                <div className="text-[8px] text-gray-700">
                  <div className="font-semibold">{getExperience()?.position || 'Position'}</div>
                  <div className="text-gray-500">{getExperience()?.company || 'Company'}</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'nordic':
        return (
          <div className="bg-white p-4 shadow-lg w-full h-full text-xs">
            <div className="pb-2 mb-3">
              <div className="font-light text-sm text-gray-800 tracking-wide">{getName()}</div>
              <div className="text-[10px] text-gray-400 mt-1 font-light">Phone · Email · Location</div>
              <div className="border-b border-gray-200 mt-2"></div>
            </div>
            <div className="space-y-2">
              <div>
                <div className="text-[9px] tracking-widest text-gray-400 lowercase mb-1">profile</div>
                <div className="text-[8px] text-gray-600 leading-relaxed line-clamp-2">{getSummary()}</div>
                <div className="border-b border-gray-100 mt-2"></div>
              </div>
              <div>
                <div className="text-[9px] tracking-widest text-gray-400 lowercase mb-1">experience</div>
                <div className="text-[8px] text-gray-600">
                  <div className="font-medium text-gray-700">{getExperience()?.position || 'Position'}</div>
                  <div className="text-gray-400">{getExperience()?.company || 'Company'}</div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white p-4 shadow-lg w-full h-full text-xs">
            <div className="border-b-2 border-black pb-2 mb-3">
              <div className="font-bold text-sm uppercase tracking-wide text-black">
                {getName()}
              </div>
              <div className="text-[10px] text-gray-600 mt-1">
                {getEmail()}
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <div className="font-bold uppercase text-[9px] tracking-widest border-b border-gray-400 pb-0.5 mb-1">
                  Professional Summary
                </div>
                <div className="text-[8px] text-gray-700 leading-relaxed line-clamp-2">
                  {getSummary()}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-[200px] h-[280px] mx-auto rounded-lg overflow-hidden border border-gray-200 shadow-sm">
      {getPreviewContent()}
    </div>
  );
}
