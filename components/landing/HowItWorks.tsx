'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { FiArrowRight } from 'react-icons/fi';
import { TemplatePickerAnimation, TypingAnimation, DownloadAnimation } from '@/components/ui/AnimatedIcons';

export default function HowItWorks() {
  const { t, isRTL } = useLanguage();

  const steps = [
    {
      animation: <TemplatePickerAnimation className="w-16 h-16" />,
      number: '1',
      title: t.hero.step1Title,
      description: t.hero.step1Desc,
      color: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-50',
    },
    {
      animation: <TypingAnimation className="w-16 h-16" />,
      number: '2',
      title: t.hero.step2Title,
      description: t.hero.step2Desc,
      color: 'from-accent-500 to-orange-600',
      bg: 'bg-accent-50',
    },
    {
      animation: <DownloadAnimation className="w-16 h-16" />,
      number: '3',
      title: t.hero.step3Title,
      description: t.hero.step3Desc,
      color: 'from-green-500 to-emerald-600',
      bg: 'bg-green-50',
    },
  ];

  return (
    <>
      <section className="py-20 md:py-28 px-4 bg-gradient-to-b from-white to-gray-50/50 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent-100 rounded-full filter blur-[120px] opacity-30"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-accent-50 text-accent-600 rounded-full text-sm font-semibold mb-4">
              {isRTL ? 'كيف يعمل' : 'How It Works'}
            </span>
            <h2 className="font-telegraf text-3xl md:text-5xl font-extrabold text-navy-900 mb-4">
              {t.hero.stepsTitle}
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              {t.hero.createInMinutes}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5">
              <div className="w-full h-full bg-gradient-to-r from-blue-200 via-accent-200 to-green-200 rounded-full"></div>
            </div>

            {steps.map((step, index) => (
              <div key={index} className="relative flex flex-col items-center text-center group step-card" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="relative mb-6">
                  <div className={`w-24 h-24 rounded-3xl ${step.bg} flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-lg shadow-gray-200/50`}>
                    {step.animation}
                  </div>
                  <div className={`absolute -top-3 ${isRTL ? '-left-3' : '-right-3'} w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} text-white flex items-center justify-center text-base font-bold shadow-lg`}>
                    {step.number}
                  </div>
                </div>

                <h3 className="font-telegraf text-xl font-bold text-navy-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-[260px]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link href="/template-gallery">
              <button className="group px-10 py-4 bg-navy-900 text-white rounded-xl font-bold text-base shadow-lg shadow-navy-900/20 hover:bg-navy-800 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 min-h-[56px] flex items-center justify-center gap-2 mx-auto">
                {t.hero.cta}
                <FiArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
              </button>
            </Link>
            <p className="mt-4 text-sm text-gray-400 flex items-center justify-center gap-2">
              <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
              </span>
              {t.hero.noCreditCard}
            </p>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes stepAppear {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .step-card { animation: stepAppear 0.6s ease-out both; }
      `}</style>
    </>
  );
}
