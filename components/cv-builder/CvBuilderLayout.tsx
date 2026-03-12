'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiCheck, FiEdit3, FiLayout, FiDownload, FiArrowLeft, FiHome } from 'react-icons/fi';
import { useLanguage } from '@/lib/contexts/LanguageContext';

interface CvBuilderLayoutProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  children: React.ReactNode;
}

export default function CvBuilderLayout({
  currentStep,
  onStepChange,
  children,
}: CvBuilderLayoutProps) {
  const router = useRouter();
  const { isRTL } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [cvId, setCvId] = useState<number | null>(null);

  useEffect(() => {
    const editingCvJson = sessionStorage.getItem('editingCv');
    if (editingCvJson) {
      try {
        const editingCv = JSON.parse(editingCvJson);
        setIsEditing(true);
        setCvId(editingCv.id || null);
      } catch (error) {
        console.error('Failed to parse editingCv:', error);
      }
    }
  }, []);

  const handleBackClick = () => {
    router.push('/cvs');
  };

  const handleDashboardClick = () => {
    router.push('/dashboard');
  };

  const steps = [
    { number: 1, label: isRTL ? 'المحتوى' : 'Content', icon: FiEdit3, description: isRTL ? 'أضف معلوماتك' : 'Add your information' },
    { number: 2, label: isRTL ? 'التصميم والتنسيق' : 'Design & Format', icon: FiLayout, description: isRTL ? 'اختر القالب والأسلوب' : 'Choose template & style' },
    { number: 3, label: isRTL ? 'تحميل' : 'Download', icon: FiDownload, description: isRTL ? 'صدّر سيرتك الذاتية' : 'Export your CV' },
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Enhanced Stepper */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {/* Navigation Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackClick}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
              >
                <FiArrowLeft className={`w-5 h-5 group-hover:${isRTL ? 'translate-x-1' : '-translate-x-1'} transition-transform`} />
                <span className="font-medium">{isRTL ? 'العودة للسير الذاتية' : 'Back to CVs'}</span>
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleDashboardClick}
                className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <FiHome className="w-4 h-4" />
                <span className="text-sm">{isRTL ? 'لوحة التحكم' : 'Dashboard'}</span>
              </button>
            </div>
          </div>
          
          <div className="flex justify-center items-center">
            <div className="flex items-center space-x-4 md:space-x-8 max-w-4xl w-full">
              {steps.map((step, idx) => (
                <div key={step.number} className="flex items-center flex-1">
                  {/* Step Circle with Icon */}
                  <div className="flex flex-col items-center relative group">
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center font-bold cursor-pointer transition-all duration-300 transform ${
                        currentStep === step.number
                          ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg scale-110 ring-4 ring-blue-100'
                          : currentStep > step.number
                          ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-md hover:scale-105'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      onClick={() => currentStep > step.number && onStepChange(step.number)}
                    >
                      {currentStep > step.number ? (
                        <FiCheck className="w-6 h-6" />
                      ) : (
                        <step.icon className="w-6 h-6" />
                      )}
                    </div>
                    
                    {/* Step Label */}
                    <div className="mt-3 text-center">
                      <div className={`font-semibold text-sm transition-colors duration-200 ${
                        currentStep >= step.number ? 'text-blue-700' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </div>
                      <div className={`text-xs mt-0.5 transition-colors duration-200 hidden sm:block ${
                        currentStep === step.number ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {step.description}
                      </div>
                    </div>

                    {/* Progress indicator underneath current step */}
                    {currentStep === step.number && (
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>

                  {/* Connector Line */}
                  {idx < steps.length - 1 && (
                    <div className="flex-1 mx-2 md:mx-4 h-1 rounded-full relative overflow-hidden bg-gray-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${
                          currentStep > step.number 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 w-full' 
                            : 'w-0'
                        }`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content with smooth transition */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 transition-opacity duration-300">
        {children}
      </div>
    </div>
  );
}
