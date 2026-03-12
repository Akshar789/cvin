'use client';

import { useState, useRef, useEffect, useCallback, TouchEvent } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import SimpleProfessionalTemplate from '@/components/templates/SimpleProfessionalTemplate';
import ModernTemplate from '@/components/templates/ModernTemplate';
import ClassicTemplate from '@/components/templates/ClassicTemplate';
import ExecutiveTemplate from '@/components/templates/ExecutiveTemplate';
import MinimalistCleanTemplate from '@/components/templates/MinimalistCleanTemplate';
import CreativeTemplate from '@/components/templates/CreativeTemplate';

const sampleDataEN = {
  title: 'Professional Resume',
  personalInfo: {
    name: 'Ahmed Alali',
    fullName: 'Ahmed Alali',
    email: 'ahmed.alali@email.com',
    phone: '+966 50 200 2020',
    location: 'Riyadh, Saudi Arabia',
    professionalTitle: 'Senior Product Manager',
    targetJobTitle: 'Senior Product Manager',
    targetJobDomain: 'Technology',
    photo: '',
  },
  summary: 'Results-driven Senior Product Manager with 8+ years of experience leading cross-functional teams to deliver innovative digital solutions.',
  professionalSummary: 'Results-driven Senior Product Manager with 8+ years of experience leading cross-functional teams to deliver innovative digital solutions.',
  experience: [
    {
      company: 'TechVision Solutions',
      position: 'Senior Product Manager',
      title: 'Senior Product Manager',
      location: 'Riyadh, SA',
      startDate: '2021-03',
      endDate: undefined,
      description: 'Lead product strategy and execution for enterprise SaaS platform.',
      achievements: [
        'Launched 3 major features increasing engagement by 45%',
        'Managed cross-functional team of 12 professionals',
        'Drove $2.3M annual revenue growth',
      ],
    },
    {
      company: 'Innovation Labs',
      position: 'Product Manager',
      title: 'Product Manager',
      location: 'Jeddah, SA',
      startDate: '2018-06',
      endDate: '2021-02',
      description: 'Owned product roadmap for mobile application.',
      achievements: [
        'Increased app rating from 3.8 to 4.7 stars',
        'Drove 150% growth in daily active users',
      ],
    },
  ],
  education: [
    {
      institution: 'King Saud University',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: '2014',
      endDate: '2018',
      description: '',
    },
  ],
  skills: [
    { category: 'Management', skillsList: ['Product Strategy', 'Agile/Scrum', 'User Research'] },
    { category: 'Technical', skillsList: ['SQL', 'Figma', 'JIRA', 'Python'] },
  ],
};

const sampleDataAR = {
  title: 'سيرة ذاتية احترافية',
  personalInfo: {
    name: 'أحمد العلي',
    fullName: 'أحمد العلي',
    email: 'ahmed.alali@email.com',
    phone: '+966 50 200 2020',
    location: 'الرياض، المملكة العربية السعودية',
    professionalTitle: 'مدير منتج أول',
    targetJobTitle: 'مدير منتج أول',
    targetJobDomain: 'التقنية',
    photo: '',
  },
  summary: 'مدير منتج محترف يتمتع بخبرة تزيد عن 8 سنوات في قيادة الفرق لتقديم حلول رقمية مبتكرة.',
  professionalSummary: 'مدير منتج محترف يتمتع بخبرة تزيد عن 8 سنوات في قيادة الفرق لتقديم حلول رقمية مبتكرة.',
  experience: [
    {
      company: 'شركة رؤية التقنية',
      position: 'مدير منتج أول',
      title: 'مدير منتج أول',
      location: 'الرياض',
      startDate: '2021-03',
      endDate: undefined,
      description: 'قيادة استراتيجية المنتج والتنفيذ.',
      achievements: ['إطلاق 3 ميزات رئيسية زادت التفاعل 45٪', 'إدارة فريق من 12 محترف'],
    },
  ],
  education: [
    {
      institution: 'جامعة الملك سعود',
      degree: 'بكالوريوس علوم',
      field: 'علوم الحاسب',
      startDate: '2014',
      endDate: '2018',
      description: '',
    },
  ],
  skills: [
    { category: 'إدارة', skillsList: ['إستراتيجية المنتج', 'Agile/Scrum'] },
    { category: 'تقنية', skillsList: ['SQL', 'Figma', 'JIRA'] },
  ],
};

const allTemplateConfigs = [
  { slug: 'simple-professional', name: 'Simple Professional', nameAR: 'احترافي بسيط', isPremium: false },
  { slug: 'modern', name: 'Modern', nameAR: 'عصري', isPremium: false },
  { slug: 'classic', name: 'Classic', nameAR: 'كلاسيكي', isPremium: true },
  { slug: 'executive', name: 'Executive', nameAR: 'تنفيذي', isPremium: true },
  { slug: 'minimalist-clean', name: 'Minimalist Clean', nameAR: 'بسيط ونظيف', isPremium: false },
  { slug: 'creative', name: 'Creative', nameAR: 'إبداعي', isPremium: true },
];

const templateConfigs = allTemplateConfigs.filter(t => !t.isPremium);

function TemplateRenderer({ slug, data, isArabic }: { slug: string; data: any; isArabic: boolean }) {
  switch (slug) {
    case 'simple-professional':
      return <SimpleProfessionalTemplate data={data} previewMode={true} isArabic={isArabic} />;
    case 'modern':
      return <ModernTemplate data={data} previewMode={true} isArabic={isArabic} />;
    case 'classic':
      return <ClassicTemplate data={data} previewMode={true} isArabic={isArabic} />;
    case 'executive':
      return <ExecutiveTemplate data={data} previewMode={true} isArabic={isArabic} />;
    case 'minimalist-clean':
      return <MinimalistCleanTemplate data={data} previewMode={true} isArabic={isArabic} />;
    case 'creative':
      return <CreativeTemplate data={data} previewMode={true} isArabic={isArabic} />;
    default:
      return <SimpleProfessionalTemplate data={data} previewMode={true} isArabic={isArabic} />;
  }
}

export default function TemplatesShowcase() {
  const router = useRouter();
  const { t, isRTL } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const sampleData = isRTL ? sampleDataAR : sampleDataEN;
  const total = templateConfigs.length;

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveIndex(((index % total) + total) % total);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, total]);

  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % total);
    }, 5000);
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [total]);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };
  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (isRTL ? diff < 0 : diff > 0) next();
      else prev();
    }
  };

  const getSlideStyle = (index: number) => {
    let offset = index - activeIndex;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    const isActive = offset === 0;
    const isAdjacent = Math.abs(offset) === 1;
    const isVisible = Math.abs(offset) <= 2;

    if (!isVisible) return { opacity: 0, transform: 'scale(0.6) translateX(0px)', zIndex: 0, pointerEvents: 'none' as const };

    const translateX = offset * 380;
    const scale = isActive ? 1.04 : isAdjacent ? 0.85 : 0.7;
    const opacity = isActive ? 1 : isAdjacent ? 0.45 : 0.15;
    const z = isActive ? 30 : isAdjacent ? 20 : 10;

    return {
      transform: `translateX(${translateX}px) scale(${scale})`,
      opacity,
      zIndex: z,
      pointerEvents: isActive ? 'auto' as const : 'none' as const,
    };
  };

  return (
    <section className="py-14 md:py-20 bg-white relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent-50 rounded-full filter blur-[150px] opacity-20"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 bg-accent-50 text-accent-600 rounded-full text-sm font-semibold mb-4">
            {isRTL ? 'القوالب' : 'Templates'}
          </span>
          <h2 className="font-telegraf text-3xl md:text-5xl font-extrabold text-navy-900 mb-4">
            {t.showcase.title}
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            {t.showcase.description}
          </p>
        </div>

        <div
          className="relative mx-auto"
          style={{ height: '540px', maxWidth: '100%' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {templateConfigs.map((tmpl, index) => {
              const style = getSlideStyle(index);
              const isActive = index === activeIndex;

              return (
                <div
                  key={tmpl.slug}
                  className="absolute transition-all duration-500 ease-out cursor-pointer"
                  style={{
                    ...style,
                    width: '370px',
                  }}
                  onClick={() => {
                    if (isActive) {
                      router.push(`/template-gallery`);
                    } else {
                      goTo(index);
                    }
                  }}
                >
                  <div className={`relative bg-white rounded-2xl overflow-hidden transition-all duration-500 ${isActive ? 'shadow-2xl shadow-navy-900/20 ring-2 ring-accent-300' : 'shadow-lg'}`}>
                    <div className="relative overflow-hidden bg-gray-50 flex flex-col items-center" style={{ height: '480px' }}>
                      <div className="transform scale-[0.44] origin-top" style={{ width: '227%', pointerEvents: 'none' }}>
                        <TemplateRenderer slug={tmpl.slug} data={sampleData} isArabic={isRTL} />
                      </div>

                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent flex items-center justify-center">
                          <span className="text-[10px] font-semibold text-accent-600 bg-accent-50/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-accent-100 shadow-sm">
                            {isRTL ? 'انقر للاستخدام' : 'Click to use'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="py-2.5 text-center bg-white border-t border-gray-50">
                      <h3 className="font-telegraf text-sm font-bold text-navy-900">
                        {isRTL ? tmpl.nameAR : tmpl.name}
                      </h3>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); isRTL ? next() : prev(); }}
            className={`absolute ${isRTL ? 'right-2 md:right-8' : 'left-2 md:left-8'} top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white shadow-lg shadow-navy-900/10 flex items-center justify-center text-navy-700 hover:bg-navy-50 hover:scale-110 transition-all duration-200 border border-gray-100`}
            aria-label="Previous template"
          >
            <FiChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); isRTL ? prev() : next(); }}
            className={`absolute ${isRTL ? 'left-2 md:left-8' : 'right-2 md:right-8'} top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full bg-white shadow-lg shadow-navy-900/10 flex items-center justify-center text-navy-700 hover:bg-navy-50 hover:scale-110 transition-all duration-200 border border-gray-100`}
            aria-label="Next template"
          >
            <FiChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6">
          {templateConfigs.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={`transition-all duration-300 rounded-full ${
                index === activeIndex
                  ? 'w-8 h-3 bg-accent-500'
                  : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to template ${index + 1}`}
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/template-gallery')}
            className="group px-8 py-4 bg-accent-500 text-white text-base font-bold rounded-xl hover:bg-accent-400 transition-all duration-300 shadow-lg shadow-accent-500/20 hover:shadow-xl hover:-translate-y-1 flex items-center gap-2 mx-auto"
          >
            {isRTL ? 'عرض جميع القوالب' : 'View All Templates'}
            <FiArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
          </button>
        </div>
      </div>
    </section>
  );
}
