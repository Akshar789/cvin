'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { FiArrowRight, FiCheck, FiFileText, FiZap } from 'react-icons/fi';

export default function CTA() {
  const { t, isRTL } = useLanguage();

  return (
    <section className="relative py-20 md:py-28 px-4 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500 rounded-full filter blur-[150px] cta-float"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full filter blur-[150px] cta-float-delayed"></div>
        </div>

        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-[10%] w-16 h-20 border border-white/20 rounded-lg rotate-12 cta-float-slow"></div>
          <div className="absolute top-20 right-[15%] w-12 h-16 border border-white/20 rounded-lg -rotate-6 cta-float-delayed"></div>
          <div className="absolute bottom-16 left-[20%] w-14 h-18 border border-white/20 rounded-lg rotate-3 cta-float"></div>
          <div className="absolute bottom-24 right-[25%] w-10 h-14 border border-white/20 rounded-lg -rotate-12 cta-float-slow"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent-500/10 border border-accent-500/20 rounded-full mb-8">
          <FiZap className="w-4 h-4 text-accent-400" />
          <span className="text-sm text-accent-300 font-semibold">
            {isRTL ? 'ابدأ مجاناً اليوم' : 'Start Free Today'}
          </span>
        </div>

        <h2 className="font-telegraf text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight">
          {t.cta.title}
        </h2>

        <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
          {t.cta.description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link href="/template-gallery">
            <button className="group w-full sm:w-auto px-10 py-4 bg-accent-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-accent-500/30 hover:bg-accent-400 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 min-h-[56px] flex items-center justify-center gap-2">
              {t.cta.button}
              <FiArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
            </button>
          </Link>
          <Link href="/#pricing">
            <button className="w-full sm:w-auto px-10 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-lg border border-white/20 hover:bg-white/20 transform hover:-translate-y-1 transition-all duration-300 min-h-[56px]">
              {t.cta.viewPricing}
            </button>
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-sm text-white/50">
          <div className="flex items-center gap-2">
            <FiCheck className="w-4 h-4 text-green-400" />
            <span>{t.cta.noCreditCard}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiCheck className="w-4 h-4 text-green-400" />
            <span>{t.cta.cancelAnytime}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiCheck className="w-4 h-4 text-green-400" />
            <span>{t.cta.aiSupport247}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes ctaFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes ctaFloatSlow {
          0%, 100% { transform: translateY(0px) rotate(var(--tw-rotate)); }
          50% { transform: translateY(-10px) rotate(var(--tw-rotate)); }
        }
        .cta-float { animation: ctaFloat 6s ease-in-out infinite; }
        .cta-float-delayed { animation: ctaFloat 6s ease-in-out 2s infinite; }
        .cta-float-slow { animation: ctaFloat 8s ease-in-out 1s infinite; }
      `}</style>
    </section>
  );
}
