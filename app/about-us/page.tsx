'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { FiZap, FiLayout, FiTool, FiShield, FiTarget, FiGlobe, FiUsers, FiAward } from 'react-icons/fi';

export default function AboutUsPage() {
  const { isRTL } = useLanguage();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const content = {
    en: {
      title: 'About CVin',
      subtitle: 'Empowering professionals to land their dream jobs with AI-powered career tools.',
      whoTitle: 'Who We Are',
      whoText: 'CVin is a modern, AI-powered CV and career platform built in Saudi Arabia. We help job seekers create professional, ATS-compliant resumes, prepare for interviews, and optimize their career profiles — all in both Arabic and English.',
      missionTitle: 'Our Mission',
      missionText: 'To empower every job seeker with intelligent tools that simplify the job application process and maximize their chances of success. We believe that everyone deserves access to professional-grade career resources, regardless of their background or experience level.',
      visionTitle: 'Our Vision',
      visionText: 'To become the leading career platform in the Middle East, bridging the gap between talent and opportunity through innovative AI technology and bilingual support.',
      whyTitle: 'Why CVin?',
      features: [
        { icon: FiZap, title: 'AI-Powered Optimization', desc: 'Our AI analyzes your experience and generates professionally written, ATS-optimized content tailored to your target roles.' },
        { icon: FiLayout, title: 'Professional Templates', desc: '15 professionally designed templates that work beautifully in both English and Arabic, optimized for applicant tracking systems.' },
        { icon: FiTool, title: 'Career Tools Suite', desc: 'LinkedIn optimization, interview preparation, AI career coaching, and job analysis tools — everything you need in one place.' },
        { icon: FiShield, title: 'Secure & Private', desc: 'Your data is protected with enterprise-grade security. We comply with Saudi Arabia\'s Personal Data Protection Law (PDPL).' },
        { icon: FiGlobe, title: 'Bilingual Support', desc: 'Full Arabic and English support with proper RTL layouts, AI-powered translation, and culturally appropriate content.' },
        { icon: FiTarget, title: 'ATS-Compliant', desc: 'Every template and content suggestion is designed to pass through Applicant Tracking Systems used by top employers.' },
      ],
      statsTitle: 'By the Numbers',
      stats: [
        { value: '15+', label: 'Professional Templates' },
        { value: '2', label: 'Languages Supported' },
        { value: 'GPT-4o', label: 'AI Model' },
        { value: '100%', label: 'PDPL Compliant' },
      ],
    },
    ar: {
      title: 'عن CVin',
      subtitle: 'نمكّن المحترفين من الحصول على وظائف أحلامهم بأدوات مهنية مدعومة بالذكاء الاصطناعي.',
      whoTitle: 'من نحن',
      whoText: 'CVin هي منصة حديثة للسيرة الذاتية والمسار المهني مدعومة بالذكاء الاصطناعي، مبنية في المملكة العربية السعودية. نساعد الباحثين عن عمل في إنشاء سير ذاتية احترافية متوافقة مع أنظمة تتبع المتقدمين، والتحضير للمقابلات، وتحسين ملفاتهم المهنية — بالعربية والإنجليزية.',
      missionTitle: 'مهمتنا',
      missionText: 'تمكين كل باحث عن عمل بأدوات ذكية تبسط عملية التقديم للوظائف وتزيد فرص النجاح. نؤمن بأن الجميع يستحق الوصول إلى موارد مهنية احترافية، بغض النظر عن خلفيتهم أو مستوى خبرتهم.',
      visionTitle: 'رؤيتنا',
      visionText: 'أن نصبح المنصة المهنية الرائدة في الشرق الأوسط، نسد الفجوة بين المواهب والفرص من خلال تقنية الذكاء الاصطناعي المبتكرة والدعم ثنائي اللغة.',
      whyTitle: 'لماذا CVin؟',
      features: [
        { icon: FiZap, title: 'تحسين بالذكاء الاصطناعي', desc: 'يحلل الذكاء الاصطناعي خبرتك وينشئ محتوى مكتوب باحترافية ومحسّن لأنظمة تتبع المتقدمين.' },
        { icon: FiLayout, title: 'قوالب احترافية', desc: '15 قالباً مصمماً باحترافية يعمل بالعربية والإنجليزية، محسّن لأنظمة تتبع المتقدمين.' },
        { icon: FiTool, title: 'أدوات مهنية متكاملة', desc: 'تحسين LinkedIn، التحضير للمقابلات، مدرب مهني بالذكاء الاصطناعي، وتحليل الوظائف — كل ما تحتاجه في مكان واحد.' },
        { icon: FiShield, title: 'آمن وخاص', desc: 'بياناتك محمية بأمان على مستوى المؤسسات. نلتزم بنظام حماية البيانات الشخصية السعودي.' },
        { icon: FiGlobe, title: 'دعم ثنائي اللغة', desc: 'دعم كامل للعربية والإنجليزية مع تخطيطات RTL صحيحة وترجمة بالذكاء الاصطناعي.' },
        { icon: FiTarget, title: 'متوافق مع ATS', desc: 'كل قالب واقتراح محتوى مصمم للمرور عبر أنظمة تتبع المتقدمين المستخدمة من كبار أصحاب العمل.' },
      ],
      statsTitle: 'بالأرقام',
      stats: [
        { value: '+15', label: 'قالب احترافي' },
        { value: '2', label: 'لغات مدعومة' },
        { value: 'GPT-4o', label: 'نموذج الذكاء الاصطناعي' },
        { value: '100%', label: 'متوافق مع PDPL' },
      ],
    },
  };

  const c = isRTL ? content.ar : content.en;

  return (
    <div className={`min-h-screen ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent-500 rounded-full filter blur-[200px] opacity-[0.07]" />
          <div className="absolute bottom-[-30%] left-[-10%] w-[400px] h-[400px] bg-cyan-500 rounded-full filter blur-[180px] opacity-[0.06]" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-28 relative z-10 text-center" style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.7s ease' }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/[0.08] border border-white/[0.12] rounded-full mb-6">
            <FiUsers className="w-4 h-4 text-accent-400" />
            <span className="text-sm text-white/60 font-medium">{isRTL ? 'تعرف علينا' : 'Get to know us'}</span>
          </div>
          <h1 className="font-telegraf text-4xl sm:text-5xl font-extrabold text-white mb-4">{c.title}</h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">{c.subtitle}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12">
        {/* Who We Are */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(15px)', transition: 'all 0.6s ease 0.1s' }}>
          <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50">
              <FiUsers className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="font-telegraf text-xl font-bold text-navy-900">{c.whoTitle}</h2>
          </div>
          <div className="p-8">
            <p className="text-gray-600 leading-relaxed text-[15px]">{c.whoText}</p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5" style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(15px)', transition: 'all 0.6s ease 0.2s' }}>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-accent-50 mb-4">
              <FiTarget className="w-5 h-5 text-accent-600" />
            </div>
            <h2 className="font-telegraf text-lg font-bold text-navy-900 mb-3">{c.missionTitle}</h2>
            <p className="text-gray-600 leading-relaxed text-sm">{c.missionText}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-purple-50 mb-4">
              <FiAward className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="font-telegraf text-lg font-bold text-navy-900 mb-3">{c.visionTitle}</h2>
            <p className="text-gray-600 leading-relaxed text-sm">{c.visionText}</p>
          </div>
        </div>

        {/* Why CVin */}
        <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(15px)', transition: 'all 0.6s ease 0.3s' }}>
          <h2 className="font-telegraf text-2xl font-extrabold text-navy-900 text-center mb-8">{c.whyTitle}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {c.features.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-gray-200 transition-all duration-300">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-navy-800 to-navy-900 mb-4">
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-telegraf font-bold text-navy-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 rounded-2xl p-8 sm:p-10 relative overflow-hidden" style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(15px)', transition: 'all 0.6s ease 0.4s' }}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-30%] right-[-15%] w-[300px] h-[300px] bg-accent-500 rounded-full filter blur-[120px] opacity-[0.1]" />
          </div>
          <h2 className="font-telegraf text-xl font-bold text-white text-center mb-8 relative z-10">{c.statsTitle}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 relative z-10">
            {c.stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-extrabold text-white mb-1">{s.value}</div>
                <div className="text-sm text-white/50">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
