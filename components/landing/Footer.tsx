'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { FiMail, FiMapPin, FiArrowRight } from 'react-icons/fi';

export default function Footer() {
  const { t, isRTL } = useLanguage();

  const productLinks = [
    { href: '/template-gallery', label: isRTL ? 'إنشاء سيرة ذاتية' : 'Build Your CV' },
    { href: '/template-gallery', label: t.footer.templates },
    { href: '/#pricing', label: t.footer.pricing },
    { href: '/#features', label: isRTL ? 'المميزات' : 'Features' },
  ];

  const companyLinks = [
    { href: '/about-us', label: t.footer.about },
    { href: '/contact', label: t.footer.contact },
    { href: '/career-tips', label: t.nav.careerTips },
  ];

  const legalLinks = [
    { href: '/legal/privacy-policy', label: t.footer.privacy },
    { href: '/legal/terms-of-use', label: t.footer.terms },
    { href: '/legal/ai-disclosure', label: isRTL ? 'الإفصاح عن الذكاء الاصطناعي' : 'AI Disclosure' },
  ];

  return (
    <footer className="bg-navy-900 text-gray-400 relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500 rounded-full filter blur-[150px]"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500 rounded-full filter blur-[150px]"></div>
      </div>

      <div className="relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
            <div className="md:col-span-4">
              <Link href="/" className="inline-block mb-6">
                <img
                  src="/brand/logo-white.png"
                  alt="CVin"
                  className="h-12 w-auto"
                />
              </Link>
              <p className="text-sm leading-relaxed mb-6 max-w-sm">
                {t.footer.description}
              </p>

              <div className="space-y-3">
                <div className={`flex items-center gap-3 text-sm ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                  <FiMapPin className="w-4 h-4 text-accent-400 flex-shrink-0" />
                  <span>{isRTL ? 'المملكة العربية السعودية' : 'Saudi Arabia'}</span>
                </div>
                <div className={`flex items-center gap-3 text-sm ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                  <FiMail className="w-4 h-4 text-accent-400 flex-shrink-0" />
                  <span>support@cvin.sa</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-white font-telegraf font-bold text-sm uppercase tracking-wider mb-5">{t.footer.product}</h4>
              <ul className="space-y-3">
                {productLinks.map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} className="text-sm hover:text-accent-400 transition-colors duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-white font-telegraf font-bold text-sm uppercase tracking-wider mb-5">{t.footer.company}</h4>
              <ul className="space-y-3">
                {companyLinks.map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} className="text-sm hover:text-accent-400 transition-colors duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-white font-telegraf font-bold text-sm uppercase tracking-wider mb-5">{isRTL ? 'قانوني' : 'Legal'}</h4>
              <ul className="space-y-3">
                {legalLinks.map((link, i) => (
                  <li key={i}>
                    <Link href={link.href} className="text-sm hover:text-accent-400 transition-colors duration-200">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-white font-telegraf font-bold text-sm uppercase tracking-wider mb-5">{isRTL ? 'ابدأ الآن' : 'Get Started'}</h4>
              <Link href="/template-gallery">
                <button className="w-full px-5 py-3 bg-accent-500 text-white rounded-xl font-semibold text-sm hover:bg-accent-400 transition-all duration-300 flex items-center justify-center gap-2 group">
                  {t.hero.cta}
                  <FiArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180' : ''}`} />
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} CVin. {t.footer.rights}
            </p>
            <div className="flex items-center gap-6">
              <Link href="/legal/privacy-policy" className="text-sm text-gray-500 hover:text-accent-400 transition-colors">
                {t.footer.privacy}
              </Link>
              <Link href="/legal/terms-of-use" className="text-sm text-gray-500 hover:text-accent-400 transition-colors">
                {t.footer.terms}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
