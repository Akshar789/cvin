'use client';

import { useLanguage } from '@/lib/contexts/LanguageContext';
import { FiStar, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

const testimonialsEN = [
  {
    name: 'Sarah Ahmed',
    role: 'Software Engineer',
    company: 'Tech Industry',
    initials: 'SA',
    text: 'CVin helped me create a professional CV that got me noticed. The AI suggestions made my experience section really stand out from other candidates.',
    rating: 5,
    color: 'bg-purple-500',
  },
  {
    name: 'Mohammed Ali',
    role: 'Marketing Manager',
    company: 'Corporate Sector',
    initials: 'MA',
    text: 'The ATS-optimized templates were exactly what I needed. I started getting more interview calls within the first week of using my new CV.',
    rating: 5,
    color: 'bg-accent-500',
  },
  {
    name: 'Fatima Hassan',
    role: 'Recent Graduate',
    company: 'Fresh Career',
    initials: 'FH',
    text: 'As a fresh graduate, I had no idea how to write a professional CV. CVin guided me step by step and I landed my first job within 2 months!',
    rating: 5,
    color: 'bg-blue-500',
  },
];

const testimonialsAR = [
  {
    name: 'سارة أحمد',
    role: 'مهندسة برمجيات',
    company: 'قطاع التقنية',
    initials: 'سأ',
    text: 'ساعدني CVin في إنشاء سيرة ذاتية احترافية لفتت الأنظار. اقتراحات الذكاء الاصطناعي جعلت قسم الخبرات يبرز بشكل رائع.',
    rating: 5,
    color: 'bg-purple-500',
  },
  {
    name: 'محمد علي',
    role: 'مدير تسويق',
    company: 'قطاع الشركات',
    initials: 'مع',
    text: 'القوالب المتوافقة مع ATS كانت بالضبط ما أحتاجه. بدأت أحصل على مكالمات مقابلات أكثر خلال الأسبوع الأول من استخدام سيرتي الجديدة.',
    rating: 5,
    color: 'bg-accent-500',
  },
  {
    name: 'فاطمة حسن',
    role: 'خريجة حديثة',
    company: 'بداية مهنية',
    initials: 'فح',
    text: 'كخريجة حديثة لم أكن أعرف كيف أكتب سيرة ذاتية احترافية. CVin أرشدني خطوة بخطوة وحصلت على وظيفتي الأولى خلال شهرين!',
    rating: 5,
    color: 'bg-blue-500',
  },
];

export default function Testimonials() {
  const { t, isRTL } = useLanguage();
  const testimonials = isRTL ? testimonialsAR : testimonialsEN;

  return (
    <section className="py-20 md:py-28 px-4 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-accent-50 rounded-full filter blur-[150px] opacity-30"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-sm font-semibold mb-4">
            {isRTL ? 'قصص النجاح' : 'Success Stories'}
          </span>
          <h2 className="font-telegraf text-3xl md:text-5xl font-extrabold text-navy-900 mb-4">
            {t.testimonials.title}
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {[...Array(5)].map((_, i) => (
              <FiStar key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            ))}
            <span className="ml-2 text-sm font-semibold text-navy-700">4.9/5</span>
            <span className="text-sm text-gray-400 ml-1">{isRTL ? 'من 10,000+ مستخدم' : 'from 10,000+ users'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-7 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 group"
            >
              <div className="flex items-center gap-1.5 mb-5">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FiStar key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>

              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                <div className={`w-11 h-11 rounded-xl ${testimonial.color} flex items-center justify-center text-white font-bold text-sm`}>
                  {testimonial.initials}
                </div>
                <div>
                  <p className="font-telegraf font-bold text-sm text-navy-900">{testimonial.name}</p>
                  <p className="text-xs text-gray-400">{testimonial.role} &bull; {testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link href="/template-gallery">
            <button className="group px-8 py-3.5 bg-navy-900 text-white rounded-xl font-semibold text-sm hover:bg-navy-800 transition-all duration-300 flex items-center gap-2 mx-auto shadow-lg shadow-navy-900/10">
              {isRTL ? 'ابدأ قصة نجاحك' : 'Start Your Success Story'}
              <FiArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
