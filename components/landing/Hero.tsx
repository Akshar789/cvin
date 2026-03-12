'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useAuth } from '@/lib/contexts/AuthContext';
import { FiArrowRight } from 'react-icons/fi';

const ROTATING_PHRASES_EN = [
  'That Gets You Hired',
  'That Stands Out',
  'Like a Professional',
  'Powered by AI',
  'Built for Success',
  'Designed to Impress',
];

const ROTATING_PHRASES_AR = [
  'تحصل بها على الوظيفة',
  'تتميز عن الآخرين',
  'كالمحترفين',
  'مدعومة بالذكاء الاصطناعي',
  'مصممة للنجاح',
  'تترك انطباعاً مميزاً',
];

function RotatingTypewriter({ isRTL }: { isRTL: boolean }) {
  const phrases = isRTL ? ROTATING_PHRASES_AR : ROTATING_PHRASES_EN;
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];

    const tick = () => {
      if (!isDeleting) {
        const next = currentPhrase.slice(0, displayText.length + 1);
        setDisplayText(next);
        if (next === currentPhrase) {
          timeoutRef.current = setTimeout(() => setIsDeleting(true), 2000);
          return;
        }
        timeoutRef.current = setTimeout(tick, 60 + Math.random() * 40);
      } else {
        const next = currentPhrase.slice(0, displayText.length - 1);
        setDisplayText(next);
        if (next === '') {
          setIsDeleting(false);
          setPhraseIndex((phraseIndex + 1) % phrases.length);
          timeoutRef.current = setTimeout(tick, 300);
          return;
        }
        timeoutRef.current = setTimeout(tick, 30);
      }
    };

    timeoutRef.current = setTimeout(tick, isDeleting ? 30 : 80);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [displayText, isDeleting, phraseIndex, phrases]);

  return (
    <span className="inline-flex items-baseline">
      <span>{displayText}</span>
      <span className="inline-block w-[3px] h-[0.85em] bg-accent-400 ml-1 rounded-sm animate-blink align-baseline"></span>
    </span>
  );
}

function FloatingCVCard({ isRTL }: { isRTL: boolean }) {
  const [highlightIndex, setHighlightIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHighlightIndex(prev => (prev + 1) % 5);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const sections = [
    { label: isRTL ? 'الاسم' : 'Name', width: '60%', isHeader: true },
    { label: isRTL ? 'المسمى الوظيفي' : 'Job Title', width: '45%', isHeader: false },
    { label: isRTL ? 'الملخص المهني' : 'Summary', width: '90%', isHeader: false },
    { label: isRTL ? 'الخبرات' : 'Experience', width: '75%', isHeader: false },
    { label: isRTL ? 'المهارات' : 'Skills', width: '55%', isHeader: false },
  ];

  return (
    <div className="relative hero-cv-float">
      <div className="absolute -inset-8 bg-accent-500/10 rounded-full filter blur-[60px] animate-pulse"></div>

      <div className="relative w-[260px] md:w-[300px] bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-5 shadow-2xl shadow-black/20">
        <div className="absolute top-3 right-3 flex gap-1">
          <div className="w-2 h-2 rounded-full bg-green-400"></div>
          <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
          <div className="w-2 h-2 rounded-full bg-red-400"></div>
        </div>

        <div className="space-y-3 mt-4">
          {sections.map((section, i) => (
            <div key={i} className="relative">
              <div className={`text-[10px] uppercase tracking-wider mb-1 transition-colors duration-500 ${
                highlightIndex === i ? 'text-accent-400' : 'text-white/40'
              }`}>
                {section.label}
              </div>
              <div
                className={`h-2.5 rounded-full transition-all duration-700 ${
                  section.isHeader ? 'h-3.5' : ''
                } ${
                  highlightIndex === i
                    ? 'bg-accent-400/60 shadow-sm shadow-accent-400/30'
                    : 'bg-white/15'
                }`}
                style={{ width: section.width }}
              />
              {!section.isHeader && (
                <div
                  className="h-1.5 rounded-full bg-white/8 mt-1.5"
                  style={{ width: `calc(${section.width} - 15%)` }}
                />
              )}
              {highlightIndex === i && (
                <div className="absolute -left-2 top-0 bottom-0 w-0.5 bg-accent-400 rounded-full cv-highlight-line"></div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <div className="h-6 flex-1 rounded-lg bg-accent-500/30 border border-accent-400/30 flex items-center justify-center">
            <span className="text-[9px] font-bold text-accent-300 tracking-wide">PDF</span>
          </div>
          <div className="h-6 flex-1 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center">
            <span className="text-[9px] font-bold text-white/40 tracking-wide">WORD</span>
          </div>
        </div>

        <div className="cv-typing-indicator mt-3 flex items-center gap-2">
          <div className="flex gap-0.5">
            <div className="w-1 h-1 rounded-full bg-accent-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 h-1 rounded-full bg-accent-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1 h-1 rounded-full bg-accent-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-[9px] text-accent-400/70">{isRTL ? 'الذكاء الاصطناعي يحسّن...' : 'AI optimizing...'}</span>
        </div>
      </div>

      <div className="absolute -top-4 -right-4 w-12 h-12 rounded-xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center shadow-lg shadow-accent-500/30 cv-badge-pop">
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
    </div>
  );
}

export default function Hero() {
  const { t, isHydrated, isRTL } = useLanguage();
  const { user } = useAuth();

  if (!isHydrated) {
    return (
      <section className="relative py-16 md:py-20 flex items-center justify-center overflow-hidden px-4 pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-50 via-white to-accent-50/30"></div>
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="h-12 w-64 bg-gray-200 rounded animate-pulse mx-auto mb-4"></div>
          <div className="h-6 w-80 bg-gray-200 rounded animate-pulse mx-auto mb-3"></div>
          <div className="h-10 w-40 bg-gray-200 rounded animate-pulse mx-auto"></div>
        </div>
      </section>
    );
  }

  const features = [
    { text: isRTL ? 'كتابة بالذكاء الاصطناعي' : 'AI-Powered Writing' },
    { text: isRTL ? 'متوافق مع ATS' : 'ATS-Compliant' },
    { text: isRTL ? 'عربي وإنجليزي' : 'Arabic & English' },
  ];

  return (
    <>
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(229, 125, 48, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(27, 57, 93, 0.3) 0%, transparent 50%)',
            }}></div>
          </div>
          <div className="absolute top-20 left-[10%] w-72 h-72 bg-accent-500 rounded-full mix-blend-screen filter blur-[120px] opacity-20 hero-float"></div>
          <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[120px] opacity-15 hero-float-delayed"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto w-full py-16 md:py-24">
          <div className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-16 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
            <div className={`flex-1 ${isRTL ? 'text-right' : 'text-center lg:text-left'} hero-fade-up`}>
              <div className={`inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white/90 rounded-full text-sm font-medium border border-white/10 mb-6`}>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                {t.hero.badge}
              </div>

              <h1 className="font-telegraf text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-white leading-[1.1]">
                {t.hero.title}
                <span className="block mt-2 bg-gradient-to-r from-accent-400 to-accent-300 bg-clip-text text-transparent min-h-[1.2em]">
                  <RotatingTypewriter isRTL={isRTL} />
                </span>
              </h1>

              <p className="text-lg md:text-xl text-white/70 mb-10 max-w-xl leading-relaxed">
                {t.hero.description}
              </p>

              <div className={`flex flex-col sm:flex-row gap-4 ${isRTL ? 'justify-end' : 'justify-center lg:justify-start'} mb-8`}>
                <Link href="/template-gallery">
                  <button className="group w-full sm:w-auto px-10 py-4 bg-accent-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-accent-500/30 hover:bg-accent-400 hover:shadow-xl hover:shadow-accent-500/40 transform hover:-translate-y-1 transition-all duration-300 min-h-[56px] flex items-center justify-center gap-2">
                    {t.hero.cta}
                    <FiArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                  </button>
                </Link>
                {!user && (
                  <Link href="/auth/login">
                    <button className="w-full sm:w-auto px-10 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold text-lg border border-white/20 hover:bg-white/20 transform hover:-translate-y-1 transition-all duration-300 min-h-[56px]">
                      {t.nav.login}
                    </button>
                  </Link>
                )}
              </div>

              <div className={`flex flex-wrap items-center gap-6 text-sm text-white/60 ${isRTL ? 'justify-end' : 'justify-center lg:justify-start'}`}>
                {features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-400"></span>
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:flex flex-shrink-0 items-center justify-center hero-fade-up-delayed">
              <FloatingCVCard isRTL={isRTL} />
            </div>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto hero-fade-up-delayed">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-white">50K+</div>
              <div className="text-xs md:text-sm text-white/50 mt-1">{t.hero.cvsCreated}</div>
            </div>
            <div className="text-center border-x border-white/10">
              <div className="text-3xl md:text-4xl font-extrabold text-white">98%</div>
              <div className="text-xs md:text-sm text-white/50 mt-1">{t.hero.successRate}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-white">24/7</div>
              <div className="text-xs md:text-sm text-white/50 mt-1">{t.hero.aiSupport}</div>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .hero-float { animation: heroFloat 8s ease-in-out infinite; }
        .hero-float-delayed { animation: heroFloat 8s ease-in-out 2s infinite; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-fade-up { animation: fadeInUp 0.8s ease-out; }
        .hero-fade-up-delayed { animation: fadeInUp 0.8s ease-out 0.3s both; }
        @keyframes cvFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-12px) rotate(1deg); }
          66% { transform: translateY(-6px) rotate(-0.5deg); }
        }
        .hero-cv-float { animation: cvFloat 6s ease-in-out infinite; }
        @keyframes badgePop {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .cv-badge-pop { animation: badgePop 3s ease-in-out infinite; }
        @keyframes highlightSlide {
          from { height: 0; }
          to { height: 100%; }
        }
        .cv-highlight-line { animation: highlightSlide 0.3s ease-out; }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink { animation: blink 0.8s step-end infinite; }
      `}</style>
    </>
  );
}
