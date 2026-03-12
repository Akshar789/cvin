'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';

interface AIGenerationModalProps {
  isOpen: boolean;
  onClose?: () => void;
  selectedTemplate?: string;
  selectedTemplateAr?: string;
}

const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  left: `${8 + (i * 6) % 84}%`,
  top: `${6 + (i * 11) % 78}%`,
  delay: `${((i * 0.37) % 2.8).toFixed(2)}s`,
  duration: `${(2.2 + (i * 0.31) % 1.8).toFixed(2)}s`,
  size: i % 3 === 0 ? 4 : i % 3 === 1 ? 3 : 2,
  opacity: i % 4 === 0 ? 0.6 : 0.35,
}));

export default function AIGenerationModal({ isOpen, onClose, selectedTemplate, selectedTemplateAr }: AIGenerationModalProps) {
  const { isRTL, language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  const templateLabel = language === 'ar' ? (selectedTemplateAr || selectedTemplate || 'القالب المختار') : (selectedTemplate || 'Your Template');

  const GENERATION_STEPS = [
    {
      en: 'Analyzing your profile...',
      ar: 'جاري تحليل ملفك الشخصي...',
      icon: '🔍',
    },
    {
      en: `Applying ${templateLabel} layout...`,
      ar: `تطبيق تخطيط ${templateLabel}...`,
      icon: '🎨',
    },
    {
      en: 'Enhancing section balance...',
      ar: 'تحسين توازن الأقسام...',
      icon: '⚡',
    },
    {
      en: 'Generating bilingual version...',
      ar: 'إنشاء النسخة ثنائية اللغة...',
      icon: '🌐',
    },
    {
      en: 'Finalizing professional formatting...',
      ar: 'إنهاء التنسيق الاحترافي...',
      icon: '✨',
    },
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= GENERATION_STEPS.length - 1) return prev;
        return prev + 1;
      });
    }, 900);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const progress = ((currentStep + 1) / GENERATION_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm ai-modal-fade">
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 ai-modal-slide ${isRTL ? 'rtl' : 'ltr'}`}
        style={{ border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {PARTICLES.map(p => (
            <div
              key={p.id}
              className="absolute rounded-full bg-accent-400"
              style={{
                left: p.left,
                top: p.top,
                width: `${p.size}px`,
                height: `${p.size}px`,
                opacity: p.opacity,
                animation: `aiParticleFloat ${p.duration} ease-in-out infinite`,
                animationDelay: p.delay,
              }}
            />
          ))}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)',
            }}
          />
        </div>

        <div className="relative flex flex-col items-center mb-6 gap-3">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, rgba(99,102,241,0.8) 0%, rgba(139,92,246,0.8) 25%, rgba(99,102,241,0.2) 50%, transparent 75%)',
                animation: 'aiSpin 1.8s linear infinite',
              }}
            />
            <div className="absolute inset-1 rounded-full bg-navy-900" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.5)' }}
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-accent-400"
                  style={{ animation: `aiDotBounce 1.2s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>

          {selectedTemplate && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-accent-400/30 bg-accent-500/10">
              <span className="text-[10px] text-accent-300 font-medium">
                {language === 'ar' ? 'القالب المختار:' : 'Template:'}
              </span>
              <span className="text-[10px] font-bold text-white">✨ {templateLabel}</span>
            </div>
          )}
        </div>

        <h2 className="relative text-xl font-bold text-center mb-1 font-telegraf text-white">
          {language === 'ar' ? 'مساعد التصميم الذكي' : 'AI Design Assistant'}
        </h2>
        <p className="relative text-navy-300 text-center mb-6 text-xs">
          {language === 'ar'
            ? 'يقوم الذكاء الاصطناعي بتحسين سيرتك الذاتية...'
            : 'Crafting your perfect professional CV...'}
        </p>

        <div className="relative space-y-2.5 mb-6">
          {GENERATION_STEPS.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            return (
              <div
                key={index}
                className={`flex items-center gap-3 transition-all duration-400 ${
                  isActive ? 'opacity-100' : isCompleted ? 'opacity-60' : 'opacity-25'
                }`}
              >
                <div
                  className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${
                    isCompleted ? 'bg-green-500 shadow-lg' :
                    isActive ? 'bg-accent-500 shadow-lg' :
                    'bg-navy-700'
                  }`}
                  style={isActive ? { boxShadow: '0 0 12px rgba(99,102,241,0.6)' } : undefined}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-xs">{step.icon}</span>
                  )}
                </div>
                <span className={`text-sm font-medium flex-1 ${
                  isActive ? 'text-accent-300' :
                  isCompleted ? 'text-green-400' :
                  'text-navy-500'
                }`}>
                  {language === 'ar' ? step.ar : step.en}
                </span>
                {isActive && (
                  <div className="flex gap-0.5 ml-auto flex-shrink-0">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-1 h-1 rounded-full bg-accent-400"
                        style={{ animation: `aiDotBounce 1.2s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="relative">
          <div className="w-full bg-navy-700/80 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)',
                boxShadow: '0 0 8px rgba(99,102,241,0.6)',
              }}
            />
          </div>
          <p className="text-[10px] text-navy-400 text-center mt-1.5">
            {Math.round(progress)}%
          </p>
        </div>

        <style jsx>{`
          @keyframes aiParticleFloat {
            0%, 100% { transform: translateY(0px) scale(1); }
            33% { transform: translateY(-12px) scale(1.15); }
            66% { transform: translateY(-6px) scale(0.9); }
          }
          @keyframes aiSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes aiDotBounce {
            0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
            40% { transform: scale(1.2); opacity: 1; }
          }
          .ai-modal-fade {
            animation: aiModalFadeIn 0.25s ease-out;
          }
          .ai-modal-slide {
            animation: aiModalSlideUp 0.3s ease-out;
          }
          @keyframes aiModalFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes aiModalSlideUp {
            from { opacity: 0; transform: translateY(24px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
}
