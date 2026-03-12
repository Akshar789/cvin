'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiDownload, FiLayout, FiEdit3, FiCheck, FiArrowLeft, FiHome } from 'react-icons/fi';

interface Step {
  id: string;
  path: string;
  icon: React.ReactNode;
  title: string;
  titleAr: string;
  subtitle: string;
  subtitleAr: string;
}

interface StepNavigationProps {
  currentStep: 'content' | 'design' | 'download';
  language?: string;
  onStepClick?: (stepId: string) => void;
}

export default function StepNavigation({ currentStep, language = 'en', onStepClick }: StepNavigationProps) {
  const router = useRouter();
  const isRTL = language === 'ar';

  const steps: Step[] = [
    {
      id: 'content',
      path: '/cv/edit',
      icon: <FiEdit3 className="w-6 h-6" />,
      title: 'Content',
      titleAr: 'المحتوى',
      subtitle: 'Add your information',
      subtitleAr: 'أضف معلوماتك',
    },
    {
      id: 'design',
      path: '/cv/design',
      icon: <FiLayout className="w-6 h-6" />,
      title: 'Design & Format',
      titleAr: 'التصميم والتنسيق',
      subtitle: 'Choose template & style',
      subtitleAr: 'اختر القالب والأسلوب',
    },
    {
      id: 'download',
      path: '/cv/download',
      icon: <FiDownload className="w-6 h-6" />,
      title: 'Download',
      titleAr: 'تحميل',
      subtitle: 'Export your CV',
      subtitleAr: 'صدّر سيرتك الذاتية',
    },
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const currentStepIndex = getCurrentStepIndex();

  const handleStepClick = (step: Step, index: number) => {
    if (onStepClick) {
      onStepClick(step.id);
    }
  };

  const handleBackClick = () => {
    router.push('/cvs');
  };

  const handleDashboardClick = () => {
    router.push('/dashboard');
  };

  return (
    <div className={`w-full bg-white border-b border-gray-200 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-4">
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

        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            const isClickable = index <= currentStepIndex;

            return (
              <React.Fragment key={step.id}>
                <Link
                  href={isClickable ? step.path : '#'}
                  onClick={(e) => {
                    if (!isClickable) {
                      e.preventDefault();
                    } else {
                      handleStepClick(step, index);
                    }
                  }}
                  className={`flex flex-col items-center flex-1 group ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                >
                  <div
                    className={`
                      w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300
                      ${isActive ? 'bg-blue-600 text-white shadow-lg scale-110' : ''}
                      ${isCompleted ? 'bg-green-500 text-white hover:bg-green-600' : ''}
                      ${!isActive && !isCompleted ? 'bg-gray-200 text-gray-400' : ''}
                      ${isClickable && !isActive ? 'group-hover:scale-105' : ''}
                    `}
                  >
                    {isCompleted ? <FiCheck className="w-6 h-6" /> : step.icon}
                  </div>
                  <div className="mt-3 text-center">
                    <p
                      className={`
                        text-sm font-semibold transition-colors duration-200
                        ${isActive ? 'text-blue-600' : ''}
                        ${isCompleted ? 'text-green-600 group-hover:text-green-700' : ''}
                        ${!isActive && !isCompleted ? 'text-gray-400' : ''}
                      `}
                    >
                      {isRTL ? step.titleAr : step.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {isRTL ? step.subtitleAr : step.subtitle}
                    </p>
                  </div>
                </Link>

                {index < steps.length - 1 && (
                  <div className="flex-1 max-w-[120px] px-4 mb-8">
                    <div className="relative">
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`
                            h-full rounded-full transition-all duration-500
                            ${isCompleted ? 'bg-green-500 w-full' : 'bg-transparent w-0'}
                          `}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
