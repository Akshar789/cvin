'use client';

import { useLanguage } from '@/lib/contexts/LanguageContext';
import {
  AIWritingAnimation,
  GlobeAnimation,
  ExportAnimation,
  FormatAnimation,
  ShieldAnimation,
  ClockAnimation,
} from '@/components/ui/AnimatedIcons';

export default function WhyChooseUs() {
  const { isRTL } = useLanguage();

  const reasons = [
    {
      animation: <AIWritingAnimation className="w-10 h-10" />,
      title: isRTL ? 'مدعوم بالذكاء الاصطناعي' : 'AI-Powered Generation',
      desc: isRTL ? 'ذكاء اصطناعي متقدم يكتب محتوى احترافي ويقترح تحسينات ذكية لسيرتك الذاتية' : 'Advanced AI writes professional content and suggests smart improvements for your CV',
      gradient: 'from-purple-500 to-indigo-600',
      bg: 'bg-purple-50',
    },
    {
      animation: <GlobeAnimation className="w-10 h-10" />,
      title: isRTL ? 'محسّن للسوق السعودي' : 'Saudi Market Optimized',
      desc: isRTL ? 'تنسيقات وقوالب مصممة خصيصاً لتلبية متطلبات سوق العمل في المملكة العربية السعودية' : 'Formats and templates specifically designed to meet Saudi Arabia job market requirements',
      gradient: 'from-emerald-500 to-green-600',
      bg: 'bg-emerald-50',
    },
    {
      animation: <ExportAnimation className="w-10 h-10" />,
      title: isRTL ? 'تصدير سريع بتنسيقات متعددة' : 'Fast Multi-Format Export',
      desc: isRTL ? 'حمّل سيرتك الذاتية بصيغة PDF أو Word بنقرة واحدة مع جودة احترافية' : 'Download your CV in PDF or Word format with one click in professional quality',
      gradient: 'from-blue-500 to-cyan-600',
      bg: 'bg-blue-50',
    },
    {
      animation: <FormatAnimation className="w-10 h-10" />,
      title: isRTL ? 'تنسيق احترافي تلقائي' : 'Professional Auto Formatting',
      desc: isRTL ? 'تنسيق تلقائي يضمن مظهر احترافي مثالي بدون خبرة في التصميم' : 'Automatic formatting ensures a perfect professional look without design experience',
      gradient: 'from-accent-500 to-orange-600',
      bg: 'bg-accent-50',
    },
    {
      animation: <ShieldAnimation className="w-10 h-10" />,
      title: isRTL ? 'متوافق مع أنظمة ATS' : 'ATS Compatible',
      desc: isRTL ? 'جميع القوالب مصممة لتجاوز أنظمة تتبع المتقدمين المستخدمة في الشركات الكبرى' : 'All templates designed to pass applicant tracking systems used by major companies',
      gradient: 'from-rose-500 to-pink-600',
      bg: 'bg-rose-50',
    },
    {
      animation: <ClockAnimation className="w-10 h-10" />,
      title: isRTL ? 'جاهز في دقائق' : 'Ready in Minutes',
      desc: isRTL ? 'أنشئ سيرة ذاتية احترافية كاملة في أقل من 10 دقائق مع المساعد الذكي' : 'Create a complete professional CV in under 10 minutes with the smart assistant',
      gradient: 'from-amber-500 to-yellow-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <section id="features" className="py-20 md:py-28 px-4 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent-50 rounded-full filter blur-[150px] opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50 rounded-full filter blur-[150px] opacity-30"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-navy-50 text-navy-700 rounded-full text-sm font-semibold mb-4">
            {isRTL ? 'لماذا CVin؟' : 'Why CVin?'}
          </span>
          <h2 className="font-telegraf text-3xl md:text-5xl font-extrabold text-navy-900 mb-4">
            {isRTL ? 'كل ما تحتاجه لسيرة ذاتية مثالية' : 'Everything You Need for the Perfect CV'}
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            {isRTL
              ? 'أدوات متقدمة وتقنيات ذكية تجعل إنشاء سيرتك الذاتية تجربة سهلة ومميزة'
              : 'Advanced tools and smart technology make building your CV an easy and exceptional experience'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-7 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 overflow-hidden hover:-translate-y-1"
            >
              <div className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} w-32 h-32 bg-gradient-to-br ${reason.gradient} opacity-5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700`}></div>

              <div className="relative z-10">
                <div className={`inline-flex p-3 rounded-2xl ${reason.bg} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  {reason.animation}
                </div>

                <h3 className="font-telegraf text-lg font-bold text-navy-900 mb-2 group-hover:text-accent-600 transition-colors duration-300">
                  {reason.title}
                </h3>

                <p className="text-sm text-gray-500 leading-relaxed">
                  {reason.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
