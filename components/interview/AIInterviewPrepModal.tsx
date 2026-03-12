'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { FiMessageSquare } from 'react-icons/fi';

interface AIInterviewPrepModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

const GENERATION_STEPS = [
  { en: 'Analyzing your CV and profile...', ar: 'جاري تحليل سيرتك الذاتية...' },
  { en: 'Researching industry trends...', ar: 'البحث في اتجاهات الصناعة...' },
  { en: 'Generating preparation tips...', ar: 'إنشاء نصائح التحضير...' },
  { en: 'Creating practice questions...', ar: 'إنشاء أسئلة التدريب...' },
  { en: 'Preparing interview guidance...', ar: 'إعداد إرشادات المقابلة...' },
  { en: 'Finalizing your preparation guide...', ar: 'إنهاء دليل التحضير...' },
];

export default function AIInterviewPrepModal({ isOpen, onClose }: AIInterviewPrepModalProps) {
  const { isRTL, language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= GENERATION_STEPS.length - 1) {
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm animate-fadeIn">
      <div 
        className={`bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all duration-300 ${
          isRTL ? 'rtl' : 'ltr'
        }`}
        style={{ animation: 'modalSlideUp 0.3s ease-out' }}
      >
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-purple-200 animate-pulse"></div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-t-purple-600 border-r-indigo-600 border-b-transparent border-l-transparent animate-spin"></div>
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 animate-pulse">
                <div className="w-full h-full flex items-center justify-center">
                  <FiMessageSquare className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-purple-600"
                    style={{
                      animation: `bounce 1.4s infinite ease-in-out`,
                      animationDelay: `${i * 0.16}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          {language === 'ar' ? 'الذكاء الاصطناعي يحضّر دليلك...' : 'AI is preparing your guide...'}
        </h2>
        
        <p className="text-gray-500 text-center mb-6 text-sm">
          {language === 'ar' 
            ? 'الرجاء الانتظار بينما نقوم بإنشاء دليل التحضير للمقابلة'
            : 'Please wait while we create your interview preparation guide'}
        </p>

        <div className="space-y-3">
          {GENERATION_STEPS.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div
                key={index}
                className={`flex items-center gap-3 transition-all duration-300 ${
                  isActive ? 'opacity-100 scale-105' : isCompleted ? 'opacity-60' : 'opacity-30'
                }`}
              >
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  isCompleted 
                    ? 'bg-green-500' 
                    : isActive 
                      ? 'bg-purple-600 animate-pulse' 
                      : 'bg-gray-300'
                }`}>
                  {isCompleted ? (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  isActive ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {language === 'ar' ? step.ar : step.en}
                </span>
                {isActive && (
                  <div className="flex gap-1 ml-auto">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-purple-600"
                        style={{
                          animation: `bounce 1.4s infinite ease-in-out`,
                          animationDelay: `${i * 0.16}s`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-500 ease-out rounded-full"
            style={{ 
              width: `${((currentStep + 1) / GENERATION_STEPS.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce {
          0%, 80%, 100% { 
            transform: scale(0);
          } 
          40% { 
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
