'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { FiLock } from 'react-icons/fi';
import {
  LinkedInToolAnimation,
  InterviewAnimation,
  CareerCoachAnimation,
  JobAnalystAnimation,
  JobPostingAnimation,
} from '@/components/ui/AnimatedIcons';

interface CareerTool {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  animation: React.ReactNode;
  iconBg: string;
  isPremium?: boolean;
  isComingSoon?: boolean;
  redirectUrl?: string;
  statusText?: string;
  statusTextAr?: string;
}

interface CareerToolsSectionProps {
  isRTL?: boolean;
  primaryCvTitle?: string;
  targetJobDomain?: string;
}

export default function CareerToolsSection({
  isRTL: isRTLProp,
  primaryCvTitle,
  targetJobDomain,
}: CareerToolsSectionProps) {
  const lang = useLanguage();
  const isRTL = isRTLProp ?? lang?.isRTL ?? false;

  const careerTools: CareerTool[] = [
    {
      title: 'LinkedIn Optimizer',
      titleAr: 'محسّن LinkedIn',
      description: 'Optimize your LinkedIn profile using your CV data for maximum recruiter visibility.',
      descriptionAr: 'حسّن ملفك الشخصي على LinkedIn باستخدام بيانات سيرتك الذاتية',
      animation: <LinkedInToolAnimation className="w-8 h-8" />,
      iconBg: 'bg-sky-50',
      isPremium: true,
      redirectUrl: '/premium/linkedin',
      statusText: primaryCvTitle ? `Synced with: ${primaryCvTitle}` : 'Synced with your CV',
      statusTextAr: primaryCvTitle ? `متزامن مع: ${primaryCvTitle}` : 'متزامن مع سيرتك الذاتية',
    },
    {
      title: 'Interview Prep & Guidance',
      titleAr: 'التحضير للمقابلات',
      description: 'Practice interviews based on your experience and skills to land your dream job.',
      descriptionAr: 'تدرب على المقابلات بناءً على خبراتك ومهاراتك',
      animation: <InterviewAnimation className="w-8 h-8" />,
      iconBg: 'bg-purple-50',
      redirectUrl: '/interview-prep',
      statusText: primaryCvTitle ? `Using: ${primaryCvTitle}` : 'Will use your CV data',
      statusTextAr: primaryCvTitle ? `يستخدم: ${primaryCvTitle}` : 'سيستخدم بيانات سيرتك الذاتية',
    },
    {
      title: 'AI Career Coach',
      titleAr: 'مدرب مهني ذكي',
      description: 'Get personalized career advice based on your profile and career goals.',
      descriptionAr: 'احصل على نصائح مهنية مخصصة بناءً على ملفك الشخصي',
      animation: <CareerCoachAnimation className="w-8 h-8" />,
      iconBg: 'bg-orange-50',
      isPremium: true,
      redirectUrl: '/premium/career-coach',
      statusText: targetJobDomain ? `Goal: ${targetJobDomain}` : 'Personalized for you',
      statusTextAr: targetJobDomain ? `الهدف: ${targetJobDomain}` : 'مخصص لك',
    },
    {
      title: 'Job Analyst',
      titleAr: 'محلل الوظائف',
      description: 'Analyze job descriptions and match them with your CV to improve your success rate.',
      descriptionAr: 'حلّل متطلبات الوظيفة وطابقها مع سيرتك الذاتية لتحسين فرصك',
      animation: <JobAnalystAnimation className="w-8 h-8" />,
      iconBg: 'bg-emerald-50',
      isPremium: true,
      redirectUrl: '/premium/job-analyst',
      statusText: 'Synced with your CV',
      statusTextAr: 'متزامن مع سيرتك الذاتية',
    },
    {
      title: 'Job Posting',
      titleAr: 'نشر الوظائف',
      description: 'Discover curated job postings tailored to your profile and career goals.',
      descriptionAr: 'اكتشف وظائف مختارة مصممة لملفك المهني وأهدافك',
      animation: <JobPostingAnimation className="w-8 h-8" />,
      iconBg: 'bg-slate-50',
      isComingSoon: true,
      statusText: 'Coming Soon',
      statusTextAr: 'قريباً',
    },
  ];

  return (
    <section
      className="py-20 md:py-28 px-4 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent-50 rounded-full filter blur-[150px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50 rounded-full filter blur-[150px] opacity-20 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-4" style={{ backgroundColor: '#EEF2F7', color: '#1B395D' }}>
            {isRTL ? 'أدوات مهنية' : 'Career Tools'}
          </span>
          <h2 className="font-telegraf text-3xl md:text-5xl font-extrabold text-navy-900 mb-4">
            {isRTL ? 'عزز رحلتك المهنية' : 'Enhance Your Career Journey'}
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            {isRTL
              ? 'استخدم بيانات سيرتك الذاتية عبر أدواتنا المتكاملة للتطوير المهني'
              : 'Use your CV data across our integrated career development tools'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {careerTools.map((tool) => {
            const isDisabled = !!tool.isComingSoon;

            const cardContent = (
              <div
                className={`
                  group relative bg-white rounded-2xl p-7 shadow-sm border border-gray-100
                  transition-all duration-500 h-full flex flex-col
                  ${isDisabled
                    ? 'opacity-55 cursor-not-allowed'
                    : 'hover:shadow-xl hover:-translate-y-1 cursor-pointer'
                  }
                `}
              >
                {/* Badge — rendered first in DOM, absolute positioned, highest z-index */}
                {tool.isPremium && !isDisabled && (
                  <span className={`absolute top-5 ${isRTL ? 'left-5' : 'right-5'} z-20 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full border border-amber-200`}>
                    Premium
                  </span>
                )}
                {isDisabled && (
                  <span className={`absolute top-5 ${isRTL ? 'left-5' : 'right-5'} z-20 text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-gray-400 px-2.5 py-1 rounded-full border border-gray-200 flex items-center gap-1`}>
                    <FiLock className="w-2.5 h-2.5" />
                    {isRTL ? 'قريباً' : 'Soon'}
                  </span>
                )}

                {/* Icon — fixed 56×56 square, constrained, no width bleeding */}
                <div
                  className={`
                    w-14 h-14 flex-shrink-0 flex items-center justify-center rounded-2xl ${tool.iconBg} mb-5
                    transition-transform duration-300
                    ${isDisabled ? '' : 'group-hover:scale-110'}
                  `}
                >
                  {tool.animation}
                </div>

                {/* Title */}
                <h3 className={`font-telegraf text-lg font-bold mb-2 leading-snug ${isDisabled ? 'text-gray-400' : 'text-navy-900 group-hover:text-accent-600'} transition-colors duration-300`}>
                  {isRTL ? tool.titleAr : tool.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-500 leading-relaxed flex-1">
                  {isRTL ? tool.descriptionAr : tool.description}
                </p>

                {/* Status line */}
                {tool.statusText && (
                  <p className={`text-xs font-medium mt-4 ${isDisabled ? 'text-gray-300' : 'text-gray-400'}`}>
                    {isRTL ? tool.statusTextAr : tool.statusText}
                  </p>
                )}
              </div>
            );

            return isDisabled ? (
              <div key={tool.title} className="h-full">
                {cardContent}
              </div>
            ) : (
              <Link key={tool.title} href={tool.redirectUrl!} className="block h-full">
                {cardContent}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
