'use client';

import { FiEdit, FiZap, FiFileText, FiGlobe, FiShield, FiLayout } from 'react-icons/fi';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import Link from 'next/link';

export default function Features() {
  const { t, isRTL } = useLanguage();

  const features = [
    {
      icon: FiEdit,
      title: t.features.aiPowered.title,
      description: t.features.aiPowered.description,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
    },
    {
      icon: FiZap,
      title: t.features.atsFriendly.title,
      description: t.features.atsFriendly.description,
      color: 'text-accent-600',
      bg: 'bg-accent-50',
      border: 'border-accent-100',
    },
    {
      icon: FiFileText,
      title: t.features.multipleFormats.title,
      description: t.features.multipleFormats.description,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-100',
    },
    {
      icon: FiGlobe,
      title: t.features.bilingual.title,
      description: t.features.bilingual.description,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      icon: FiShield,
      title: isRTL ? 'تنسيق سعودي محسّن' : 'Saudi-Optimized Format',
      description: isRTL ? 'مُصمم خصيصاً لسوق العمل السعودي مع تنسيقات تتوافق مع متطلبات التوظيف المحلية' : 'Specifically designed for the Saudi job market with formats that meet local hiring requirements',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      icon: FiLayout,
      title: isRTL ? '15+ قالب احترافي' : '15+ Professional Templates',
      description: isRTL ? 'مجموعة واسعة من القوالب الاحترافية المصممة لمختلف المجالات والمستويات المهنية' : 'A wide range of professionally designed templates for various fields and career levels',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 px-4 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent-50 rounded-full filter blur-[120px] opacity-40 -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50 rounded-full filter blur-[120px] opacity-40 translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-navy-50 text-navy-700 rounded-full text-sm font-semibold mb-4">
            {isRTL ? 'المميزات' : 'Features'}
          </span>
          <h2 className="font-telegraf text-3xl md:text-5xl font-extrabold text-navy-900 mb-4">
            {t.features.title}
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            {t.features.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative bg-white rounded-2xl p-7 shadow-sm hover:shadow-xl transition-all duration-500 border ${feature.border} overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-gray-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>

              <div className="relative z-10">
                <div className={`inline-flex p-3.5 rounded-2xl ${feature.bg} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>

                <h3 className="font-telegraf text-lg font-bold text-navy-900 mb-2 group-hover:text-accent-600 transition-colors duration-300">
                  {feature.title}
                </h3>

                <p className="text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 px-5 py-2.5 bg-accent-50 rounded-full text-sm font-medium text-accent-700">
            <FiZap className="w-4 h-4" />
            <span>{t.cta.freeTrialAvailable}</span>
          </div>
          <div className="flex items-center gap-2 px-5 py-2.5 bg-green-50 rounded-full text-sm font-medium text-green-700">
            <FiShield className="w-4 h-4" />
            <span>{t.cta.noCreditCard}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
