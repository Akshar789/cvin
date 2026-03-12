'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useCvData } from '@/lib/contexts/CvDataContext';
import CareerToolsSection from '@/components/CareerToolsSection';
import { TemplatePickerAnimation } from '@/components/ui/AnimatedIcons';
import {
  FiPlus, FiFileText, FiDownload, FiEdit, FiTrash2,
  FiArrowRight, FiClock, FiLayout, FiAlertCircle, FiEdit2
} from 'react-icons/fi';

const MOTIVATIONAL_EN = [
  "Let's build your next opportunity.",
  'Upgrade your CV with AI.',
  'Your dream job starts here.',
  'Stand out with confidence.',
  'Make every application count.',
];

const MOTIVATIONAL_AR = [
  'لنبنِ فرصتك القادمة.',
  'طوّر سيرتك الذاتية بالذكاء الاصطناعي.',
  'وظيفة أحلامك تبدأ من هنا.',
  'تميّز بثقة.',
  'اجعل كل طلب توظيف يحسب.',
];

function DashboardTypewriter({ isRTL }: { isRTL: boolean }) {
  const phrases = isRTL ? MOTIVATIONAL_AR : MOTIVATIONAL_EN;
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
      <span
        className="inline-block w-[3px] h-[0.85em] bg-accent-400 rounded-sm align-baseline"
        style={{
          marginInlineStart: '4px',
          animation: 'dashBlink 0.8s step-end infinite',
        }}
      />
    </span>
  );
}

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 22) return 'evening';
  return 'night';
}

function GreetingIcon({ timeOfDay }: { timeOfDay: string }) {
  if (timeOfDay === 'morning') {
    return (
      <div className="dash-icon-morning w-8 h-8 sm:w-9 sm:h-9 relative">
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
          <circle cx="16" cy="16" r="6" fill="#E57D30" className="dash-sun-glow" />
          <circle cx="16" cy="16" r="9" fill="none" stroke="#E57D30" strokeWidth="0.5" opacity="0.3" className="dash-sun-ring" />
          <g className="dash-sun-rays">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
              const rad = (angle * Math.PI) / 180;
              const x1 = 16 + Math.cos(rad) * 10;
              const y1 = 16 + Math.sin(rad) * 10;
              const x2 = 16 + Math.cos(rad) * 13;
              const y2 = 16 + Math.sin(rad) * 13;
              return (
                <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#E57D30" strokeWidth="1.5" strokeLinecap="round" opacity="0.7">
                  <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" begin={`${angle / 360}s`} repeatCount="indefinite" />
                </line>
              );
            })}
          </g>
        </svg>
      </div>
    );
  }

  if (timeOfDay === 'afternoon') {
    return (
      <div className="dash-icon-afternoon w-8 h-8 sm:w-9 sm:h-9 relative">
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
          <circle cx="16" cy="16" r="7" fill="#E57D30" className="dash-sun-glow" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 16 + Math.cos(rad) * 10.5;
            const y1 = 16 + Math.sin(rad) * 10.5;
            const x2 = 16 + Math.cos(rad) * 13;
            const y2 = 16 + Math.sin(rad) * 13;
            return (
              <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#E57D30" strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
                <animate attributeName="opacity" values="0.4;0.9;0.4" dur="4s" begin={`${angle / 360}s`} repeatCount="indefinite" />
              </line>
            );
          })}
        </svg>
      </div>
    );
  }

  return (
    <div className="dash-icon-night w-8 h-8 sm:w-9 sm:h-9 relative">
      <svg viewBox="0 0 32 32" fill="none" className="w-full h-full" style={{ overflow: 'visible' }}>
        <defs>
          {/* Mask carves a crescent from the full circle — the black circle is the "shadow" side */}
          <mask id="dashMoonCrescentMask">
            <rect width="32" height="32" fill="white" />
            <circle cx="19.5" cy="13.5" r="7" fill="black" />
          </mask>
          {/* Radial gradient: bright silver-white at the lit edge, cooler indigo towards the dark side */}
          <radialGradient id="dashMoonFaceGrad" cx="32%" cy="32%" r="68%" fx="32%" fy="32%">
            <stop offset="0%"   stopColor="#EEF2FF" />
            <stop offset="55%"  stopColor="#C7D2FE" />
            <stop offset="100%" stopColor="#818CF8" />
          </radialGradient>
        </defs>

        {/* Soft outer halo — gives the moon an atmospheric glow ring */}
        <circle cx="14" cy="17" r="9.5" fill="none" stroke="#818CF8" strokeWidth="3.5" opacity="0.10" />
        <circle cx="14" cy="17" r="8.2" fill="none" stroke="#A5B4FC" strokeWidth="1.5" opacity="0.12" />

        {/* Moon body — full circle clipped to a crescent by the mask */}
        <circle cx="14" cy="17" r="7.5" fill="url(#dashMoonFaceGrad)" mask="url(#dashMoonCrescentMask)" />

        {/* Limb brightening — subtle highlight arc along the lit edge of the crescent */}
        <path
          d="M10.5 11.5 Q11 9 14 8.5 Q16.5 8.5 18 10"
          stroke="#EEF2FF" strokeWidth="0.7" strokeLinecap="round"
          opacity="0.45" fill="none"
        />

        {/* Stars — staggered SMIL animations for organic twinkling */}
        {/* Star A — brightest, upper right */}
        <circle cx="24.5" cy="8" r="1.1" fill="white">
          <animate attributeName="opacity" values="0.2;1;0.2"   dur="3.2s"                repeatCount="indefinite" />
          <animate attributeName="r"       values="0.8;1.3;0.8" dur="3.2s"                repeatCount="indefinite" />
        </circle>

        {/* Star B — medium, far right */}
        <circle cx="27.5" cy="16" r="0.85" fill="#E0E7FF">
          <animate attributeName="opacity" values="0.1;0.85;0.1" dur="3.8s" begin="0.9s"  repeatCount="indefinite" />
          <animate attributeName="r"       values="0.6;1.05;0.6" dur="3.8s" begin="0.9s"  repeatCount="indefinite" />
        </circle>

        {/* Star C — small, top center-right */}
        <circle cx="21.5" cy="4.5" r="0.7" fill="#C7D2FE">
          <animate attributeName="opacity" values="0.1;0.75;0.1" dur="4.4s" begin="1.6s"  repeatCount="indefinite" />
          <animate attributeName="r"       values="0.5;0.9;0.5"  dur="4.4s" begin="1.6s"  repeatCount="indefinite" />
        </circle>

        {/* Star D — tiny, far top-right */}
        <circle cx="28" cy="10.5" r="0.55" fill="white">
          <animate attributeName="opacity" values="0.15;0.9;0.15" dur="2.9s" begin="0.4s" repeatCount="indefinite" />
          <animate attributeName="r"       values="0.4;0.7;0.4"   dur="2.9s" begin="0.4s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

function SkeletonPulse({ className }: { className: string }) {
  return <div className={`bg-white/10 rounded-2xl animate-pulse ${className}`} />;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, loading: authLoading, loggingOut } = useAuth();
  const { t, isRTL } = useLanguage();
  const { cvs, primaryCv, loading: cvLoading, error: cvError, refreshCvs } = useCvData();
  const [migratingCvId, setMigratingCvId] = useState<number | null>(null);
  const [deletingCvId, setDeletingCvId] = useState<number | null>(null);
  const [downloadingCvId, setDownloadingCvId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [renamingCvId, setRenamingCvId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [localCvTitles, setLocalCvTitles] = useState<Record<number, string>>({});
  const renameInputRef = useRef<HTMLInputElement>(null);
  const renameCancelledRef = useRef(false);

  const timeOfDay = getTimeOfDay();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!authLoading && !user && !loggingOut) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || !token) return;
    refreshCvs();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshCvs();
      }
    };
    const handleFocus = () => {
      refreshCvs();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, token]);

  const handleDelete = async (cv: any) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذه السيرة الذاتية؟' : 'Are you sure you want to delete this CV?')) return;
    setDeletingCvId(cv.id);
    try {
      if (cv.isGuest) {
        await axios.delete(`/api/guest-cv/${cv.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.delete(`/api/cvs/${cv.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      refreshCvs();
    } catch (error) {
      console.error('Failed to delete CV:', error);
      alert(isRTL ? 'فشل في حذف السيرة الذاتية' : 'Failed to delete CV');
    } finally {
      setDeletingCvId(null);
    }
  };

  const handleDownload = async (cv: any) => {
    if (!token) {
      alert(isRTL ? 'يرجى تسجيل الدخول للتحميل' : 'Please login to download');
      return;
    }
    setDownloadingCvId(cv.id);
    try {
      const templateSlug = cv.templateId || 'simple-professional';
      const personalInfo = typeof cv.personalInfo === 'string' ? JSON.parse(cv.personalInfo) : cv.personalInfo || {};
      const colorSettings = personalInfo?.colorSettings;
      const colorParam = colorSettings?.primary || '';
      const language = isRTL ? 'ar' : 'en';
      let exportUrl = `/api/cv/${cv.id}/export-pdf?template=${encodeURIComponent(templateSlug)}&language=${language}`;
      if (colorParam) exportUrl += `&color=${encodeURIComponent(colorParam)}`;

      const response = await axios.get(exportUrl, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${(localCvTitles[cv.id] || cv.title).replace(/[^a-z0-9]/gi, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Failed to download CV:', error);
      if (error.response?.status === 403) {
        alert(isRTL ? 'ليس لديك صلاحية لتحميل هذه السيرة الذاتية' : 'You do not have permission to download this CV');
      } else {
        alert(isRTL ? 'فشل في تحميل السيرة الذاتية' : 'Failed to download CV');
      }
    } finally {
      setDownloadingCvId(null);
    }
  };

  const handleRenameStart = (cv: any) => {
    renameCancelledRef.current = false;
    setRenameValue(localCvTitles[cv.id] || cv.title);
    setRenamingCvId(cv.id);
    setTimeout(() => renameInputRef.current?.focus(), 30);
  };

  const handleRenameCancel = () => {
    renameCancelledRef.current = true;
    setRenamingCvId(null);
    setRenameValue('');
  };

  const handleRenameSubmit = async (cv: any) => {
    if (renameCancelledRef.current) {
      renameCancelledRef.current = false;
      return;
    }
    const newTitle = renameValue.trim();
    const currentTitle = localCvTitles[cv.id] || cv.title;
    if (!newTitle || newTitle === currentTitle) {
      setRenamingCvId(null);
      return;
    }
    setRenamingCvId(null);
    try {
      await axios.patch(`/api/cv/${cv.id}`, { title: newTitle }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLocalCvTitles(prev => ({ ...prev, [cv.id]: newTitle }));
    } catch {
      alert(isRTL ? 'فشل في تغيير اسم السيرة الذاتية' : 'Failed to rename CV');
    }
  };

  const handleMigrateAndEdit = async (cv: any) => {
    if (!token) return;
    setMigratingCvId(cv.id);
    try {
      const res = await axios.post('/api/guest-cv/migrate',
        { guestCvId: cv.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.migrated && res.data.cvId) {
        const migratedTemplate = res.data.templateId || 'simple-professional';
        sessionStorage.setItem('selectedTemplate', migratedTemplate);
        await refreshCvs();
        router.push(`/cv/preview?template=${migratedTemplate}`);
      } else {
        alert(isRTL ? 'فشل في نقل السيرة الذاتية' : 'Failed to migrate CV');
      }
    } catch (error) {
      console.error('Migration failed:', error);
      alert(isRTL ? 'فشل في نقل السيرة الذاتية' : 'Failed to migrate CV');
    } finally {
      setMigratingCvId(null);
    }
  };

  if (authLoading || cvLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-900 via-navy-800 to-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-20">
          <SkeletonPulse className="h-10 w-72 mb-3" />
          <SkeletonPulse className="h-5 w-96 mb-10" />
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[...Array(3)].map((_, i) => <SkeletonPulse key={i} className="h-28" />)}
          </div>
          <SkeletonPulse className="h-48 mb-10" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const firstName = user.fullName?.split(' ')[0] || user.email?.split('@')[0] || '';
  const totalCvs = cvs.length;
  const hasCvs = totalCvs > 0;

  const greetingEN: Record<string, string> = {
    morning: 'Good Morning',
    afternoon: 'Good Afternoon',
    evening: 'Good Evening',
    night: 'Good Night',
  };
  const greetingAR: Record<string, string> = {
    morning: 'صباح الخير',
    afternoon: 'مساء الخير',
    evening: 'مساء الخير',
    night: 'مساء الخير',
  };

  const greeting = isRTL ? greetingAR[timeOfDay] : greetingEN[timeOfDay];

  return (
    <div className={`min-h-screen ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ─── HERO SECTION ─── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
        <div className="absolute inset-0 pointer-events-none">
          <div className="dash-blob-1 absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-accent-500 rounded-full filter blur-[200px] opacity-[0.07]" />
          <div className="dash-blob-2 absolute bottom-[-30%] left-[-10%] w-[500px] h-[500px] bg-cyan-500 rounded-full filter blur-[180px] opacity-[0.06]" />
          <div className="dash-blob-3 absolute top-[30%] left-[40%] w-[300px] h-[300px] bg-purple-500 rounded-full filter blur-[150px] opacity-[0.04]" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-14 sm:pb-20 relative z-10">
          <div
            className="transition-all duration-700"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            }}
          >
            <p className="text-sm sm:text-base text-white/40 font-medium mb-1.5 tracking-wide">
              {isRTL ? 'مرحبًا بعودتك' : 'Welcome back'}
            </p>
            <div className="flex items-center gap-3 mb-3">
              <GreetingIcon timeOfDay={timeOfDay} />
              <h1 className="font-telegraf text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
                {greeting}, {firstName}
              </h1>
            </div>

            <p className="text-lg sm:text-xl text-white/50 max-w-xl min-h-[1.75em]">
              <DashboardTypewriter isRTL={isRTL} />
            </p>
          </div>

          {/* Stats bar — 3 cards */}
          {hasCvs && (
            <div
              className="grid grid-cols-3 gap-3 sm:gap-4 mt-10"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                transition: 'opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s',
              }}
            >
              {[
                { label: isRTL ? 'السير الذاتية' : 'Total CVs', value: totalCvs, icon: <FiFileText className="w-4 h-4" />, accent: 'text-accent-400' },
                { label: isRTL ? 'آخر تحديث' : 'Last Updated', value: cvs[0]?.updatedAt ? new Date(cvs[0].updatedAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' }) : '—', icon: <FiClock className="w-4 h-4" />, accent: 'text-purple-400' },
                { label: isRTL ? 'القوالب المستخدمة' : 'Templates Used', value: new Set(cvs.map((cv: any) => cv.templateId || 'simple-professional')).size, icon: <FiLayout className="w-4 h-4" />, accent: 'text-emerald-400' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white/[0.06] backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/[0.08] hover:bg-white/[0.1] transition-all duration-300 group"
                >
                  <div className={`${stat.accent} mb-2.5 transition-transform duration-300 group-hover:scale-110`}>
                    {stat.icon}
                  </div>
                  <div className="font-telegraf text-xl sm:text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-[11px] text-white/40 mt-0.5 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="bg-gradient-to-b from-gray-50 to-white relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-50 rounded-full filter blur-[180px] opacity-15 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-50 rounded-full filter blur-[150px] opacity-15 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">

          {/* Error alert */}
          {cvError && (
            <div className="pt-8">
              <div className="bg-red-50 rounded-2xl p-5 border border-red-100 flex items-start gap-4">
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-red-100">
                  <FiAlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-1 text-sm">
                    {isRTL ? 'تعذر تحميل السير الذاتية' : 'Unable to load your CVs'}
                  </h3>
                  <p className="text-xs text-red-600 mb-3">
                    {isRTL
                      ? 'حدث خطأ أثناء تحميل بيانات السيرة الذاتية. يرجى المحاولة مرة أخرى.'
                      : 'There was an error loading your CV data. Please try again.'}
                  </p>
                  <button
                    onClick={() => refreshCvs()}
                    className="text-xs font-semibold text-red-700 hover:text-red-800 underline underline-offset-2"
                  >
                    {isRTL ? 'حاول مرة أخرى' : 'Try Again'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── CREATE NEW CV — PRIMARY CTA ─── */}
          <div className="pt-10 sm:pt-14 pb-12 sm:pb-16">
            <span className="inline-block px-3.5 py-1.5 rounded-full text-xs font-semibold mb-5" style={{ backgroundColor: '#EEF2F7', color: '#1B395D' }}>
              {isRTL ? 'مساحة العمل' : 'Your Workspace'}
            </span>

            <Link href="/template-gallery" className="block group">
              <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-xl hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-500/[0.03] via-transparent to-navy-500/[0.03] pointer-events-none" />

                <div className="relative p-7 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 flex items-center justify-center rounded-2xl bg-accent-50 border border-accent-100 transition-transform duration-500 group-hover:scale-105">
                    <TemplatePickerAnimation className="w-14 h-14 sm:w-16 sm:h-16" />
                  </div>

                  <div className="flex-1">
                    <h2 className="font-telegraf text-2xl sm:text-3xl font-extrabold text-navy-900 mb-2 group-hover:text-accent-600 transition-colors duration-300">
                      {isRTL ? 'أنشئ سيرة ذاتية جديدة' : 'Create New CV'}
                    </h2>
                    <p className="text-gray-500 leading-relaxed mb-5 max-w-lg">
                      {isRTL
                        ? 'اختر من بين أكثر من 15 قالبًا احترافيًا وأنشئ سيرة ذاتية مميزة بمساعدة الذكاء الاصطناعي في دقائق.'
                        : 'Choose from 15+ professional templates and build a standout CV with AI assistance in minutes.'}
                    </p>
                    <span className="inline-flex items-center gap-2 px-6 py-3 bg-accent-500 text-white font-semibold rounded-xl text-sm transition-all duration-300 group-hover:bg-accent-600 group-hover:gap-3">
                      <FiPlus className="w-4 h-4" />
                      {isRTL ? 'ابدأ الإنشاء' : 'Start Creating'}
                      <FiArrowRight className={`w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* ─── CV LIST ─── */}
          {hasCvs && (
            <div className="pb-14 sm:pb-16">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3" style={{ backgroundColor: '#EEF2F7', color: '#1B395D' }}>
                    {isRTL ? 'سيرك الذاتية' : 'Your CVs'}
                  </span>
                  <h2 className="font-telegraf text-2xl md:text-3xl font-extrabold text-navy-900">
                    {isRTL ? 'إدارة سيرك الذاتية' : 'Manage Your CVs'}
                  </h2>
                </div>
                <Link href="/cvs">
                  <button className="text-sm font-semibold text-navy-700 hover:text-accent-600 transition-colors flex items-center gap-1.5">
                    {isRTL ? 'عرض الكل' : 'View All'}
                    <FiArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                  </button>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {cvs.slice(0, 4).map((cv: any) => {
                  const isGuest = !!cv.isGuest;
                  const templateName = cv.templateId || 'simple-professional';
                  const updatedDate = cv.updatedAt
                    ? new Date(cv.updatedAt).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })
                    : '';

                  return (
                    <div
                      key={`${isGuest ? 'guest' : 'cv'}-${cv.id}`}
                      className={`group bg-white rounded-2xl p-5 sm:p-6 shadow-sm border transition-all duration-500 hover:shadow-lg hover:-translate-y-0.5 ${
                        isGuest ? 'border-amber-200 border-dashed' : 'border-gray-100'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-2xl ${isGuest ? 'bg-amber-50' : 'bg-navy-50'}`}>
                          <FiFileText className={`w-5 h-5 ${isGuest ? 'text-amber-600' : 'text-navy-700'}`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5 min-w-0">
                            {!isGuest && renamingCvId === cv.id ? (
                              <input
                                ref={renameInputRef}
                                value={renameValue}
                                onChange={e => setRenameValue(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') { e.preventDefault(); handleRenameSubmit(cv); }
                                  if (e.key === 'Escape') { e.preventDefault(); handleRenameCancel(); }
                                }}
                                onBlur={() => handleRenameSubmit(cv)}
                                onClick={e => e.stopPropagation()}
                                className="font-telegraf font-bold text-navy-900 text-sm border-b-2 border-accent-500 bg-transparent outline-none min-w-0 flex-1 py-0.5"
                                maxLength={100}
                              />
                            ) : (
                              <>
                                <h4 className="font-telegraf font-bold text-navy-900 truncate">
                                  {localCvTitles[cv.id] || cv.title}
                                </h4>
                                {!isGuest && (
                                  <button
                                    onClick={e => { e.stopPropagation(); handleRenameStart(cv); }}
                                    className="flex-shrink-0 text-gray-400 hover:text-accent-500 transition-colors"
                                    title={isRTL ? 'إعادة تسمية' : 'Rename'}
                                  >
                                    <FiEdit2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </>
                            )}
                            {isGuest && (
                              <span className="flex-shrink-0 px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-bold uppercase rounded-full border border-amber-200">
                                {isRTL ? 'ضيف' : 'Guest'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            {updatedDate && (
                              <span className="flex items-center gap-1">
                                <FiClock className="w-3 h-3" />
                                {updatedDate}
                              </span>
                            )}
                            <span className="capitalize">{templateName.replace(/-/g, ' ')}</span>
                          </div>
                        </div>

                        <div className={`flex items-center gap-1.5 flex-shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          {isGuest ? (
                            <button
                              onClick={() => handleMigrateAndEdit(cv)}
                              disabled={migratingCvId === cv.id}
                              className="w-9 h-9 flex items-center justify-center rounded-xl bg-accent-50 text-accent-600 hover:bg-accent-100 transition-colors disabled:opacity-50"
                              title={isRTL ? 'تعديل' : 'Edit'}
                            >
                              {migratingCvId === cv.id ? (
                                <div className="w-4 h-4 border-2 border-accent-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <FiEdit className="w-4 h-4" />
                              )}
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  sessionStorage.setItem('editingCvId', String(cv.id));
                                  router.push(`/cv/preview?template=${templateName}`);
                                }}
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-navy-50 text-navy-700 hover:bg-navy-100 transition-colors"
                                title={isRTL ? 'تعديل' : 'Edit'}
                              >
                                <FiEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDownload(cv)}
                                disabled={downloadingCvId === cv.id}
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                title={isRTL ? 'تحميل' : 'Download'}
                              >
                                {downloadingCvId === cv.id ? (
                                  <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <FiDownload className="w-4 h-4" />
                                )}
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(cv)}
                            disabled={deletingCvId === cv.id}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-50"
                            title={isRTL ? 'حذف' : 'Delete'}
                          >
                            {deletingCvId === cv.id ? (
                              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <FiTrash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalCvs > 4 && (
                <div className="mt-5 text-center">
                  <Link href="/cvs">
                    <button className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-navy-50 text-navy-700 text-sm font-semibold hover:bg-navy-100 transition-colors">
                      {isRTL ? `عرض جميع السير الذاتية (${totalCvs})` : `View All CVs (${totalCvs})`}
                      <FiArrowRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Empty state — no CVs yet */}
          {!hasCvs && !cvError && (
            <div className="pb-14 sm:pb-16">
              <div className="bg-white rounded-2xl p-10 sm:p-14 shadow-sm border border-gray-100 text-center">
                <div className="w-16 h-16 mx-auto mb-5 flex items-center justify-center rounded-2xl bg-accent-50">
                  <FiFileText className="w-8 h-8 text-accent-600" />
                </div>
                <h3 className="font-telegraf text-2xl font-bold text-navy-900 mb-2">
                  {isRTL ? 'ابدأ رحلتك المهنية' : 'Start Your Career Journey'}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {isRTL
                    ? 'أنشئ سيرتك الذاتية الأولى باستخدام الذكاء الاصطناعي وقوالب احترافية'
                    : 'Create your first professional CV with AI-powered tools and premium templates'}
                </p>
                <Link href="/template-gallery">
                  <button className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-xl transition-colors text-base">
                    <FiPlus className="w-5 h-5" />
                    {isRTL ? 'إنشاء أول سيرة ذاتية' : 'Create Your First CV'}
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── CAREER TOOLS ─── */}
      <CareerToolsSection
        isRTL={isRTL}
        primaryCvTitle={primaryCv?.title}
        targetJobDomain={user?.targetJobDomain}
      />

      <style jsx global>{`
        @keyframes dashBlobDrift1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }
        @keyframes dashBlobDrift2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, 20px) scale(1.04); }
          66% { transform: translate(15px, -25px) scale(0.96); }
        }
        @keyframes dashBlobDrift3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, 10px) scale(1.08); }
        }
        .dash-blob-1 { animation: dashBlobDrift1 12s ease-in-out infinite; }
        .dash-blob-2 { animation: dashBlobDrift2 15s ease-in-out infinite; }
        .dash-blob-3 { animation: dashBlobDrift3 10s ease-in-out infinite; }

        @keyframes dashSunRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes dashSunGlow {
          0%, 100% { filter: drop-shadow(0 0 3px rgba(229, 125, 48, 0.4)); }
          50% { filter: drop-shadow(0 0 8px rgba(229, 125, 48, 0.7)); }
        }
        .dash-icon-morning {
          animation: dashSunGlow 3s ease-in-out infinite;
        }
        .dash-icon-morning .dash-sun-rays {
          transform-origin: 16px 16px;
          animation: dashSunRotate 20s linear infinite;
        }

        @keyframes dashFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes dashAfternoonGlow {
          0%, 100% { filter: drop-shadow(0 0 4px rgba(229, 125, 48, 0.3)); }
          50% { filter: drop-shadow(0 0 10px rgba(229, 125, 48, 0.6)); }
        }
        .dash-icon-afternoon {
          animation: dashFloat 4s ease-in-out infinite, dashAfternoonGlow 4s ease-in-out infinite;
        }

        /* Moon — premium indigo glow matching site palette */
        @keyframes dashMoonGlow {
          0%, 100% {
            filter:
              drop-shadow(0 0 4px rgba(129, 140, 248, 0.45))
              drop-shadow(0 0 1px rgba(199, 210, 254, 0.55));
          }
          50% {
            filter:
              drop-shadow(0 0 12px rgba(129, 140, 248, 0.75))
              drop-shadow(0 0 4px rgba(165, 180, 252, 0.65))
              drop-shadow(0 0 20px rgba(99, 102, 241, 0.25));
          }
        }
        /* Float path mirrors the sun — up-drift with a very gentle tilt */
        @keyframes dashMoonFloat {
          0%, 100% { transform: translateY(0px)   rotate(0deg); }
          35%       { transform: translateY(-2.5px) rotate(-4deg); }
          70%       { transform: translateY(-1px)   rotate(-2deg); }
        }
        .dash-icon-night {
          animation:
            dashMoonGlow  4s ease-in-out infinite,
            dashMoonFloat 7s ease-in-out infinite;
        }

        @keyframes dashBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
