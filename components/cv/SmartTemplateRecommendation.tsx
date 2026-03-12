'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { TEMPLATE_FAMILIES, TemplateFamily } from '@/config/templates';
import { FiZap, FiStar, FiLock, FiCheck, FiX, FiLayout, FiEye, FiAward, FiTrendingUp, FiTarget, FiCpu, FiChevronLeft, FiChevronRight, FiDownload } from 'react-icons/fi';

interface UserProfile {
  role: 'student' | 'employer' | null;
  yearsOfExperience: string;
  jobDomain: string;
  experienceCount: number;
  educationCount: number;
  skillsCount: number;
  summaryLength: number;
}

interface SmartTemplateRecommendationProps {
  userProfile: UserProfile;
  currentTemplate: string;
  onSelectTemplate: (templateId: string) => void;
  isRTL: boolean;
  isContentArabic: boolean;
  userTier: string;
  cvData?: any;
  token?: string;
  cvId?: string;
  onDownload?: () => void;
}

interface RecommendedTemplate {
  template: TemplateFamily;
  tag: 'best-match' | 'recommended' | 'alternative' | 'current';
  reason: string;
  reasonAr: string;
  score: number;
  matchPercent: number;
  qualityLabel: string;
  qualityLabelAr: string;
}

const LEADERSHIP_KEYWORDS = [
  'led', 'managed', 'directed', 'supervised', 'oversaw', 'headed', 'spearheaded',
  'coordinated', 'mentored', 'coached', 'trained', 'recruited', 'built', 'launched',
  'established', 'founded', 'drove', 'orchestrated', 'strategic', 'vision', 'leadership',
  'executive', 'senior', 'director', 'manager', 'chief', 'vp', 'president', 'officer',
  'قاد', 'أدار', 'أشرف', 'وجّه', 'أسّس', 'قيادة', 'استراتيجي', 'مدير', 'رئيس',
];

const CREATIVE_KEYWORDS = [
  'design', 'creative', 'brand', 'visual', 'ui', 'ux', 'art', 'illustrat',
  'photography', 'video', 'animation', 'media', 'content', 'marketing',
  'تصميم', 'إبداعي', 'بصري', 'فن', 'تسويق', 'محتوى',
];

function extractTextFromCvData(cvData: any): string {
  if (!cvData) return '';
  const parts: string[] = [];
  if (cvData.professionalSummary) parts.push(cvData.professionalSummary);
  if (Array.isArray(cvData.experience)) {
    cvData.experience.forEach((e: any) => {
      if (e.position) parts.push(e.position);
      if (e.description) parts.push(e.description.replace(/<[^>]*>/g, ' '));
    });
  }
  return parts.join(' ').toLowerCase();
}

function detectLeadershipKeywords(text: string): { count: number; hasLeadership: boolean } {
  const count = LEADERSHIP_KEYWORDS.filter(k => text.includes(k.toLowerCase())).length;
  return { count, hasLeadership: count >= 2 };
}

function detectCareerGap(cvData: any): boolean {
  if (!cvData?.experience?.length) return false;
  const now = new Date().getFullYear();
  const dates = cvData.experience
    .map((e: any) => {
      const end = e.endDate === 'Present' ? now : parseInt(e.endDate?.split(' ').pop() || '0');
      return end;
    })
    .filter((d: number) => d > 2000);
  if (!dates.length) return false;
  const latest = Math.max(...dates);
  return now - latest >= 2;
}

function scoreTemplate(
  t: TemplateFamily,
  profile: UserProfile,
  cvData: any,
  flags: {
    isStudent: boolean; isProfessional: boolean; yoe: number;
    hasLeadership: boolean; hasCareerGap: boolean; hasDeepContent: boolean;
    hasHighSkillDensity: boolean; hasDeepExperience: boolean;
    isCreativeDomain: boolean; isTechnical: boolean; isCorporate: boolean; isHealth: boolean;
  }
): { score: number; reason: string; reasonAr: string } {
  const { isStudent, isProfessional, yoe, hasLeadership, hasCareerGap, hasDeepContent, hasHighSkillDensity, hasDeepExperience, isCreativeDomain, isTechnical, isCorporate, isHealth } = flags;
  let score = 50;
  let reason = '';
  let reasonAr = '';

  if (isStudent) {
    if (['minimalist-clean', 'compact', 'fresh-start', 'nordic', 'clean-modern'].includes(t.id)) {
      score += 22;
      reason = 'Clean layout ideal for students and early-career applicants';
      reasonAr = 'تخطيط نظيف مثالي للطلاب وحديثي التخرج';
    }
    if (['modern', 'smart', 'professional-edge'].includes(t.id)) {
      score += 15;
      reason = reason || 'Modern design that stands out for entry-level roles';
      reasonAr = reasonAr || 'تصميم عصري يبرز في المراحل المبكرة';
    }
    if (['executive', 'executive-clean-pro', 'ats-ultra-pro', 'global-professional'].includes(t.id)) { score -= 12; }
  }

  if (isProfessional) {
    if (yoe >= 7) {
      if (['executive', 'executive-clean-pro', 'ats-ultra-pro', 'global-professional'].includes(t.id)) {
        score += 28;
        reason = 'Premium executive layout built for senior-level impact';
        reasonAr = 'تخطيط تنفيذي فاخر مصمم للتأثير على المستوى الأعلى';
      }
      if (['structured-sidebar-pro', 'two-column-pro'].includes(t.id)) {
        score += 18;
        reason = reason || 'Structured layout that showcases depth of experience';
        reasonAr = reasonAr || 'تخطيط منظم يُبرز عمق الخبرة';
      }
    } else if (yoe >= 4) {
      if (['modern', 'two-column-pro', 'smart', 'strong', 'professional-edge'].includes(t.id)) {
        score += 22;
        reason = 'Optimized hierarchy for mid-career professionals';
        reasonAr = 'تسلسل هرمي مُحسّن للمحترفين في منتصف مسيرتهم';
      }
      if (['structured-sidebar-pro', 'executive-clean-pro'].includes(t.id)) {
        score += 15;
        reason = reason || 'Strong structure for growing leadership roles';
        reasonAr = reasonAr || 'هيكل قوي لأدوار قيادية متنامية';
      }
    } else if (yoe >= 1) {
      if (['smart', 'clean-modern', 'metro', 'minimalist-clean'].includes(t.id)) {
        score += 18;
        reason = 'Clean, impactful layout for early professionals';
        reasonAr = 'تخطيط نظيف وفعّال للمهنيين في بداياتهم';
      }
    }
  }

  if (hasLeadership) {
    if (['executive', 'executive-clean-pro', 'strong'].includes(t.id)) {
      score += 16;
      reason = reason || 'Maximizes visibility of your leadership achievements';
      reasonAr = reasonAr || 'يزيد وضوح إنجازاتك القيادية';
    }
    if (['global-professional', 'structured-sidebar-pro'].includes(t.id)) {
      score += 10;
      reason = reason || 'Structured sections highlight your leadership impact';
      reasonAr = reasonAr || 'أقسام منظمة تبرز تأثيرك القيادي';
    }
  }

  if (isCreativeDomain) {
    if (['creative', 'modern', 'elegant'].includes(t.id)) {
      score += 18;
      reason = reason || 'Visual design that resonates with creative industry standards';
      reasonAr = reasonAr || 'تصميم بصري يتوافق مع معايير الصناعات الإبداعية';
    }
    if (['metro', 'clean-modern'].includes(t.id)) {
      score += 10;
      reason = reason || 'Contemporary layout suited for creative professionals';
      reasonAr = reasonAr || 'تخطيط معاصر مناسب للمبدعين';
    }
  }

  if (isTechnical) {
    if (['two-column-pro', 'structured-sidebar-pro', 'compact'].includes(t.id)) {
      score += 18;
      reason = reason || 'Multi-section layout built to display technical depth';
      reasonAr = reasonAr || 'تخطيط متعدد الأقسام يُبرز العمق التقني';
    }
    if (['smart', 'clean-modern', 'metro'].includes(t.id)) {
      score += 12;
      reason = reason || 'ATS-friendly design optimized for technical roles';
      reasonAr = reasonAr || 'تصميم متوافق مع ATS مُحسّن للأدوار التقنية';
    }
  }

  if (isCorporate) {
    if (['executive-clean-pro', 'classic', 'global-professional'].includes(t.id)) {
      score += 18;
      reason = reason || 'Polished corporate design trusted by top recruiters';
      reasonAr = reasonAr || 'تصميم مؤسسي متقن يثق به كبار المسؤولين عن التوظيف';
    }
    if (['professional-edge', 'strong'].includes(t.id)) {
      score += 10;
      reason = reason || 'Strong corporate presence with structured layout';
      reasonAr = reasonAr || 'حضور مؤسسي قوي مع تخطيط منظم';
    }
  }

  if (isHealth) {
    if (['minimalist-clean', 'classic', 'global-professional'].includes(t.id)) {
      score += 14;
      reason = reason || 'Clean, trustworthy design preferred in healthcare';
      reasonAr = reasonAr || 'تصميم نظيف وموثوق يُفضَّل في قطاع الرعاية الصحية';
    }
    if (['nordic', 'simple-professional'].includes(t.id)) {
      score += 8;
      reason = reason || 'Clear, professional structure for healthcare roles';
      reasonAr = reasonAr || 'هيكل واضح واحترافي لأدوار الرعاية الصحية';
    }
  }

  if (hasDeepContent && ['two-column-pro', 'structured-sidebar-pro'].includes(t.id)) {
    score += 10;
    reason = reason || 'Better space utilization for content-rich profiles';
    reasonAr = reasonAr || 'استخدام أفضل للمساحة للملفات الغنية بالمحتوى';
  }
  if (hasHighSkillDensity && ['compact', 'two-column-pro', 'structured-sidebar-pro'].includes(t.id)) {
    score += 10;
    reason = reason || 'Showcases your broad skill set more effectively';
    reasonAr = reasonAr || 'يعرض مجموعة مهاراتك الواسعة بشكل أكثر فعالية';
  }
  if (hasDeepExperience && ['executive', 'strong', 'ats-ultra-pro'].includes(t.id)) {
    score += 10;
    reason = reason || 'Prioritizes your rich experience history for maximum impact';
    reasonAr = reasonAr || 'يُقدّم تاريخك الوظيفي الغني بأقصى تأثير';
  }
  if (hasCareerGap && ['compact', 'smart', 'clean-modern'].includes(t.id)) {
    score += 10;
    reason = reason || 'Focuses on skills and achievements rather than timeline gaps';
    reasonAr = reasonAr || 'يركز على المهارات والإنجازات بدلاً من الفجوات الزمنية';
  }

  // Premium templates get a base quality boost to reflect their higher production value
  if (t.isPremium) score += 8;

  if (!reason) {
    reason = 'Better visual hierarchy and ATS-optimized structure for your profile';
    reasonAr = 'تسلسل بصري أفضل وهيكل مُحسّن لـ ATS لملفك الشخصي';
  }

  return { score, reason, reasonAr };
}

function getRecommendations(
  profile: UserProfile,
  cvData: any,
  currentTemplate: string
): { picks: RecommendedTemplate[]; currentMatchPercent: number } {
  const { role, yearsOfExperience, jobDomain, experienceCount, skillsCount, summaryLength } = profile;
  const yoe = parseInt(yearsOfExperience) || 0;

  const fullText = extractTextFromCvData(cvData);
  const { hasLeadership } = detectLeadershipKeywords(fullText);
  const hasCareerGap = detectCareerGap(cvData);

  const flags = {
    isStudent: role === 'student',
    isProfessional: role === 'employer',
    yoe,
    hasLeadership,
    hasCareerGap,
    hasDeepContent: summaryLength > 200,
    hasHighSkillDensity: skillsCount >= 10,
    hasDeepExperience: experienceCount >= 3,
    isCreativeDomain: CREATIVE_KEYWORDS.some(d => (jobDomain?.toLowerCase() || '').includes(d)) || CREATIVE_KEYWORDS.some(k => fullText.includes(k)),
    isTechnical: ['software', 'engineering', 'it', 'data', 'development', 'tech', 'برمجيات', 'هندسة', 'تقنية'].some(d => (jobDomain?.toLowerCase() || '').includes(d)),
    isCorporate: ['finance', 'banking', 'consulting', 'management', 'business', 'مالية', 'إدارة', 'أعمال'].some(d => (jobDomain?.toLowerCase() || '').includes(d)),
    isHealth: ['health', 'medical', 'pharma', 'nursing', 'doctor', 'صحة', 'طب', 'تمريض'].some(d => (jobDomain?.toLowerCase() || '').includes(d)),
  };

  // Score ALL templates including current through the unified engine
  const allScored = TEMPLATE_FAMILIES.map(t => ({
    template: t,
    isCurrent: t.id === currentTemplate,
    ...scoreTemplate(t, profile, cvData, flags),
  }));

  // Absolute tier-based scoring — zero overlap between tiers by design:
  //   Free templates:    65 – 75%  (good match, clean layout)
  //   Premium templates: 90 – 96%  (ATS optimised, high impact)
  //   Current template:  score within its own tier range
  // This eliminates ALL relative "+X% better" cross-tier confusion.

  const currentIsPremium = TEMPLATE_FAMILIES.find(t => t.id === currentTemplate)?.isPremium ?? false;
  const currentRaw = allScored.find(s => s.isCurrent)?.score ?? 50;
  const currentNorm = Math.max(0, Math.min(1, (currentRaw - 50) / 50));
  const currentMatchPercent = currentIsPremium
    ? Math.round(90 + currentNorm * 6)   // 90–96 for premium current
    : Math.round(65 + currentNorm * 10);  // 65–75 for free current

  // Candidates (excluding current template)
  const candidates = allScored.filter(s => !s.isCurrent).sort((a, b) => b.score - a.score);
  const freeTemplates = candidates.filter(s => !s.template.isPremium);
  const premiumTemplates = candidates.filter(s => s.template.isPremium);

  // Quality labels per slot — no relative comparisons, purely descriptive
  const FREE_QUALITY    = ['Best Free Match', 'Good Match', 'Standard Layout'];
  const FREE_QUALITY_AR = ['أفضل خيار مجاني', 'مطابقة جيدة', 'تخطيط معياري'];
  const PREM_QUALITY    = ['ATS Optimized', 'High Impact'];
  const PREM_QUALITY_AR = ['محسّن لـ ATS', 'تأثير عالٍ'];

  // Free scoring: 65–75, ordered best→lowest (never overlaps premium 90–96)
  const FREE_BASE = [73, 70, 67];
  // Premium scoring: 90–96, ordered best→lowest
  const PREM_BASE = [95, 92];

  const picks: RecommendedTemplate[] = [];

  freeTemplates.slice(0, 3).forEach((item, idx) => {
    const tag: RecommendedTemplate['tag'] = idx === 0 ? 'best-match' : idx === 1 ? 'recommended' : 'alternative';
    const norm = Math.max(0, Math.min(1, (item.score - 50) / 50));
    const matchPercent = Math.min(75, Math.max(65, Math.round(FREE_BASE[idx] + norm * 2)));
    picks.push({
      template: item.template, tag,
      reason: item.reason, reasonAr: item.reasonAr,
      score: item.score, matchPercent,
      qualityLabel: FREE_QUALITY[idx], qualityLabelAr: FREE_QUALITY_AR[idx],
    });
  });

  premiumTemplates.slice(0, 2).forEach((item, idx) => {
    const tag: RecommendedTemplate['tag'] = idx === 0 ? 'best-match' : 'recommended';
    const norm = Math.max(0, Math.min(1, (item.score - 50) / 50));
    const matchPercent = Math.min(96, Math.max(90, Math.round(PREM_BASE[idx] + norm * 1)));
    picks.push({
      template: item.template, tag,
      reason: item.reason, reasonAr: item.reasonAr,
      score: item.score, matchPercent,
      qualityLabel: PREM_QUALITY[idx], qualityLabelAr: PREM_QUALITY_AR[idx],
    });
  });

  // Sort descending: premium (90–96) always above free (65–75) — guaranteed by ranges
  picks.sort((a, b) => b.matchPercent - a.matchPercent);

  return { picks, currentMatchPercent };
}

export default function SmartTemplateRecommendation({
  userProfile, currentTemplate, onSelectTemplate, isRTL, isContentArabic, userTier, cvData, token, cvId, onDownload,
}: SmartTemplateRecommendationProps) {
  const [activePreview, setActivePreview] = useState<string>(currentTemplate);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [toastData, setToastData] = useState<{ name: string; visible: boolean } | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isFreeTier = !userTier || userTier === 'free';
  const isGuest = !token;

  const { picks: recommendations, currentMatchPercent } = useMemo(
    () => getRecommendations(userProfile, cvData, currentTemplate),
    [userProfile, cvData, currentTemplate]
  );

  const currentTemplateInfo = useMemo(() => TEMPLATE_FAMILIES.find((t: TemplateFamily) => t.id === currentTemplate) || null, [currentTemplate]);

  useEffect(() => {
    if (!activePreview && recommendations.length > 0) setActivePreview(recommendations[0].template.id);
  }, [recommendations, activePreview]);

  const triggerToast = useCallback((templateName: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastData({ name: templateName, visible: true });
    toastTimerRef.current = setTimeout(() => {
      setToastData(prev => prev ? { ...prev, visible: false } : null);
      setTimeout(() => setToastData(null), 400);
    }, 3000);
  }, []);

  const handleSelect = useCallback(async (templateId: string, isPremium: boolean, templateName: string) => {
    if (isPremium && isFreeTier) { setShowUpgradeModal(true); return; }
    onSelectTemplate(templateId);
    setActivePreview(templateId);
    triggerToast(templateName);
    if (token && cvId) {
      try {
        await fetch(`/api/cvs/${cvId}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId }) });
      } catch (err) { console.error('[SmartTemplate] DB save error:', err); }
    }
  }, [isFreeTier, onSelectTemplate, triggerToast, token, cvId]);

  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container) return;
    const prevent = (e: Event) => e.preventDefault();
    container.addEventListener('contextmenu', prevent);
    container.addEventListener('dragstart', prevent);
    container.addEventListener('copy', prevent);
    return () => { container.removeEventListener('contextmenu', prevent); container.removeEventListener('dragstart', prevent); container.removeEventListener('copy', prevent); };
  }, []);

  const previewData = useMemo(() => {
    if (!cvData) {
      return {
        personalInfo: { fullName: 'Ahmad Al-Rashidi', email: 'ahmad@email.com', phone: '+966 50 000 0000', location: 'Riyadh, Saudi Arabia', targetJobTitle: 'Senior Software Engineer' },
        professionalSummary: 'Experienced professional with a strong track record of delivering results.',
        experience: [{ company: 'Tech Corp', position: 'Senior Developer', startDate: 'Jan 2020', endDate: 'Present', description: 'Led development of enterprise applications.' }],
        education: [{ institution: 'King Saud University', degree: 'Bachelor', field: 'Computer Science', endDate: '2019' }],
        skills: { technical: ['JavaScript', 'React', 'Node.js'], soft: ['Leadership'], tools: ['Git', 'AWS'] },
        certifications: [], languages: [{ name: 'English', proficiency: 'Fluent' }, { name: 'Arabic', proficiency: 'Native' }],
      };
    }
    return cvData;
  }, [cvData]);

  const activePreviewInfo = useMemo(() => TEMPLATE_FAMILIES.find((t: TemplateFamily) => t.id === activePreview) || null, [activePreview]);
  const activeRec = recommendations.find(r => r.template.id === activePreview);
  const isActivePremium = activePreviewInfo?.isPremium && isFreeTier;

  const scrollSlider = (dir: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const scrollAmount = 280;
    sliderRef.current.scrollBy({ left: dir === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  const getTagLabel = (tag: RecommendedTemplate['tag'], isPremium?: boolean) => {
    if (tag === 'current') return isContentArabic ? 'اختيارك الحالي' : 'Your Pick';
    if (isPremium) {
      if (tag === 'best-match') return isContentArabic ? 'الأفضل أداءً' : 'Top Performer';
      return isContentArabic ? 'ترقية مميزة' : 'Premium Upgrade';
    }
    if (tag === 'best-match') return isContentArabic ? 'أفضل مجاني' : 'Best Free';
    if (tag === 'recommended') return isContentArabic ? 'خيار جيد' : 'Good Option';
    return isContentArabic ? 'بديل معياري' : 'Alternative';
  };

  const getTagColors = (tag: RecommendedTemplate['tag'], isPremium?: boolean) => {
    if (tag === 'current') return 'bg-green-50 text-green-700 border-green-200';
    if (isPremium) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (tag === 'best-match') return 'bg-accent-50 text-accent-700 border-accent-200';
    if (tag === 'recommended') return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-purple-50 text-purple-700 border-purple-200';
  };

  const currentTemplateScored = useMemo(() => {
    if (!currentTemplateInfo) return null;
    return {
      template: currentTemplateInfo,
      tag: 'current' as const,
      reason: 'Your current selection — explore options below',
      reasonAr: 'قالبك الحالي — استكشف الخيارات أدناه',
      score: 0,
      matchPercent: currentMatchPercent,
      qualityLabel: currentTemplateInfo.isPremium ? 'Current Premium' : 'Current Free',
      qualityLabelAr: currentTemplateInfo.isPremium ? 'مميز حالي' : 'مجاني حالي',
    };
  }, [currentTemplateInfo, currentMatchPercent]);

  const allCards: RecommendedTemplate[] = useMemo(() => {
    const cards: RecommendedTemplate[] = [];
    if (currentTemplateScored) cards.push(currentTemplateScored);
    cards.push(...recommendations);
    return cards;
  }, [currentTemplateScored, recommendations]);

  const showGuestOverlay = isGuest && !isActivePremium;

  return (
    <div className="str-animate-in">
      <div className={`text-center mb-6 ${isContentArabic ? 'text-right' : ''}`}>
        <div className={`flex items-center gap-3 justify-center mb-3 ${isContentArabic ? 'flex-row-reverse' : ''}`}>
          <div className="relative w-11 h-11">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-md">
              <FiCpu className="w-5.5 h-5.5 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white str-pulse" />
            </div>
          </div>
          <div>
            <h2 className="font-telegraf text-xl font-bold text-navy-900 leading-tight">
              {isContentArabic ? 'مساعد تصميم السيرة الذاتية' : 'AI Career Design Assistant'}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
              {isContentArabic
                ? 'بناءً على تجربتك ومجالك — اخترنا لك أفضل القوالب'
                : 'Based on your experience and domain — we picked the best templates for you'}
            </p>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-5 ${isContentArabic ? 'direction-rtl' : ''}`}>
        <div className="lg:col-span-5">
          <div className={`flex items-center justify-between mb-3 ${isContentArabic ? 'flex-row-reverse' : ''}`}>
            <p className={`text-xs font-bold text-navy-600 uppercase tracking-wider flex items-center gap-1.5 ${isContentArabic ? 'flex-row-reverse' : ''}`}>
              <FiZap className="w-3.5 h-3.5 text-accent-500" />
              {isContentArabic ? 'القوالب المقترحة' : 'Recommended'}
            </p>
          </div>

          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1 str-hide-scrollbar">
            {allCards.map((rec) => {
              const t = rec.template;
              const isSelected = currentTemplate === t.id;
              const isActive = activePreview === t.id;
              const isPremiumLocked = t.isPremium && isFreeTier;

              return (
                <div
                  key={t.id}
                  onClick={() => setActivePreview(t.id)}
                  className={`relative bg-white rounded-xl cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-2 border-green-400 shadow-sm'
                      : isActive
                      ? 'border-2 border-accent-400 shadow-sm'
                      : 'border border-gray-200 hover:border-accent-200 hover:shadow-sm'
                  }`}
                >
                  <div className="p-3.5">
                    <div className={`flex items-center gap-2.5 ${isContentArabic ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-green-500' :
                        t.isPremium ? 'bg-amber-500' :
                        isActive ? 'bg-accent-500' :
                        'bg-navy-700'
                      }`}>
                        {isSelected ? <FiCheck className="w-4 h-4 text-white" /> :
                         t.isPremium ? <FiStar className="w-4 h-4 text-white" /> :
                         <FiLayout className="w-4 h-4 text-white" />}
                      </div>
                      <div className={`flex-1 min-w-0 ${isContentArabic ? 'text-right' : ''}`}>
                        <h3 className="font-telegraf font-bold text-navy-900 text-sm leading-tight truncate">
                          {isContentArabic ? t.nameAr : t.name}
                        </h3>
                        <div className={`flex items-center gap-1.5 mt-1 flex-wrap ${isContentArabic ? 'justify-end' : ''}`}>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTagColors(rec.tag, t.isPremium)}`}>
                            {getTagLabel(rec.tag, t.isPremium)}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.isPremium ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                            {t.isPremium ? (isContentArabic ? 'مميز' : 'Premium') : (isContentArabic ? 'مجاني' : 'Free')}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            rec.tag === 'current'
                              ? 'bg-gray-100 text-gray-500'
                              : t.isPremium
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-blue-50 text-blue-600'
                          }`}>
                            {rec.matchPercent}% {isContentArabic ? 'تطابق' : 'match'}
                          </span>
                          {rec.tag !== 'current' && (
                            t.isPremium ? (
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                <FiAward className="w-2.5 h-2.5" />
                                {isContentArabic ? rec.qualityLabelAr : rec.qualityLabel}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                <FiCheck className="w-2.5 h-2.5" />
                                {isContentArabic ? rec.qualityLabelAr : rec.qualityLabel}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {isSelected ? (
                          <span className="text-xs font-semibold text-green-600 flex items-center gap-0.5">
                            <FiCheck className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSelect(t.id, t.isPremium, isContentArabic ? t.nameAr : t.name); }}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                              isPremiumLocked
                                ? 'bg-amber-500 text-white hover:bg-amber-600'
                                : 'bg-accent-500 text-white hover:bg-accent-600'
                            }`}
                          >
                            {isPremiumLocked ? (
                              <span className="flex items-center gap-1"><FiLock className="w-3 h-3" />{isContentArabic ? 'ترقية' : 'Upgrade'}</span>
                            ) : (
                              <>{isContentArabic ? 'استخدام' : 'Use'}</>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    <p className={`text-xs text-gray-400 leading-relaxed mt-2 line-clamp-1 ${isContentArabic ? 'text-right' : ''}`}>
                      {isContentArabic ? rec.reasonAr : rec.reason}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 px-4 py-2.5 bg-navy-50/50 rounded-lg border border-navy-100/50">
            <p className="text-xs text-navy-500 text-center leading-relaxed">
              <FiTarget className="w-3 h-3 inline mr-1 text-navy-400" />
              {isContentArabic
                ? 'يمكنك تغيير القالب لاحقاً من صفحة التحميل'
                : 'You can change your template anytime from the download page'}
            </p>
          </div>
        </div>

        <div className="lg:col-span-7" ref={previewContainerRef}>
          <div className={`flex items-center justify-between mb-3 ${isContentArabic ? 'flex-row-reverse' : ''}`}>
            <p className={`text-xs font-bold text-navy-600 uppercase tracking-wider flex items-center gap-1.5 ${isContentArabic ? 'flex-row-reverse' : ''}`}>
              <FiEye className="w-3.5 h-3.5 text-gray-400" />
              {isContentArabic ? 'المعاينة' : 'Preview'}
            </p>
            {activePreviewInfo && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-navy-700">
                  {isContentArabic ? activePreviewInfo.nameAr : activePreviewInfo.name}
                </span>
                {activePreview === currentTemplate && (
                  <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    {isContentArabic ? 'محدد' : 'Selected'}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="relative" style={{ height: '620px', overflow: 'hidden' }}>
              {isActivePremium && (
                <div
                  className="absolute inset-0 z-20 flex items-center justify-center"
                  style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                  onMouseMove={(e) => { if (!isGuest) return; const rect = e.currentTarget.getBoundingClientRect(); setHoverPos({ x: e.clientX - rect.left, y: e.clientY - rect.top }); }}
                  onMouseLeave={() => setHoverPos(null)}
                >
                  {isGuest ? (
                    <div className="absolute inset-0" style={{
                      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', backgroundColor: 'rgba(255,255,255,0.4)',
                      maskImage: hoverPos ? `radial-gradient(circle 70px at ${hoverPos.x}px ${hoverPos.y}px, transparent 30px, black 80px)` : 'none',
                      WebkitMaskImage: hoverPos ? `radial-gradient(circle 70px at ${hoverPos.x}px ${hoverPos.y}px, transparent 30px, black 80px)` : 'none',
                    }} />
                  ) : (
                    <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
                  )}
                  <div className="relative z-10 text-center p-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <FiLock className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-telegraf text-lg font-bold text-navy-900 mb-1">
                      {isContentArabic ? 'قالب مميز' : 'Premium Template'}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{isGuest ? (isContentArabic ? 'سجل دخولك وقم بالترقية' : 'Sign in and upgrade') : (isContentArabic ? 'قم بالترقية لفتح القوالب المميزة' : 'Upgrade to unlock premium templates')}</p>
                    <button onClick={() => setShowUpgradeModal(true)} className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-sm font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-md">
                      {isContentArabic ? 'ترقية الآن' : 'Upgrade Now'}
                    </button>
                  </div>
                </div>
              )}

              {showGuestOverlay && (
                <div
                  className="absolute inset-0 z-20 flex flex-col items-center justify-end"
                  style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                >
                  <div className="absolute inset-0">
                    <div className="absolute inset-0" style={{ top: '200px', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', backgroundColor: 'rgba(255,255,255,0.45)' }} />
                    <div className="absolute inset-0" style={{ top: '160px', background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.2) 15%, rgba(255,255,255,0.75) 45%, rgba(255,255,255,0.95) 100%)' }} />
                  </div>
                  <div className="relative z-10 text-center pb-8 px-6">
                    <p className="md:hidden text-xs text-gray-500 mb-3">
                      {isContentArabic
                        ? 'يرجى التسجيل أو تسجيل الدخول لمراجعة السيرة الذاتية كاملة.'
                        : 'Please sign up / log in to review the full CV.'}
                    </p>
                    <button
                      onClick={() => onDownload?.()}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-accent-500 to-accent-600 text-white text-sm font-semibold rounded-xl hover:from-accent-600 hover:to-accent-700 transition-all shadow-lg"
                    >
                      <FiDownload className="w-4 h-4" />
                      {isContentArabic ? 'تحميل سيرتي الذاتية' : 'Download My CV'}
                    </button>
                  </div>
                </div>
              )}

              <div
                className="bg-gray-50 h-full flex items-start justify-center overflow-hidden"
                style={{ userSelect: 'none', WebkitUserSelect: 'none', pointerEvents: (isActivePremium || showGuestOverlay) ? 'none' : 'auto' }}
              >
                {activePreview && (
                  <div className="transform origin-top str-preview-scale" style={{ width: '210mm', height: '297mm' }}>
                    <TemplatePreviewMini templateId={activePreview} data={previewData} isRTL={isRTL} />
                  </div>
                )}
              </div>
            </div>

            {activePreview && activePreview !== currentTemplate && !isActivePremium && (
              <div className="px-4 py-2.5 border-t border-gray-100 bg-white flex items-center gap-2">
                <button
                  onClick={() => {
                    const info = TEMPLATE_FAMILIES.find(t => t.id === activePreview);
                    if (info) handleSelect(info.id, info.isPremium, isContentArabic ? info.nameAr : info.name);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg bg-accent-500 text-white hover:bg-accent-600 transition-colors"
                >
                  {isContentArabic ? 'استخدام هذا القالب' : 'Use This Template'}
                </button>
                {activeRec && (() => {
                  const activeInfo = TEMPLATE_FAMILIES.find(t => t.id === activePreview);
                  return activeInfo?.isPremium ? (
                    <span className="text-xs font-bold text-amber-700 flex-shrink-0 flex items-center gap-1">
                      <FiAward className="w-3.5 h-3.5" />
                      {isContentArabic ? activeRec.qualityLabelAr : activeRec.qualityLabel}
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-blue-600 flex-shrink-0 flex items-center gap-1">
                      <FiCheck className="w-3.5 h-3.5" />
                      {isContentArabic ? activeRec.qualityLabelAr : activeRec.qualityLabel}
                    </span>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {toastData && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] transition-all duration-300 ${toastData.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="flex items-center gap-3 bg-navy-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-white/10">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <FiCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold">{isContentArabic ? `تم اختيار "${toastData.name}"` : `"${toastData.name}" selected`}</p>
            </div>
          </div>
        </div>
      )}

      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowUpgradeModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 str-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex justify-end">
              <button onClick={() => setShowUpgradeModal(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <FiX className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-3 shadow-lg">
                <FiStar className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-telegraf text-xl font-bold text-navy-900">{isContentArabic ? 'احصل على القالب المميز' : 'Unlock Premium Template'}</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{isContentArabic ? 'مصمم لملفات التعريف المهنية عالية التأثير' : 'Designed for high-impact professional profiles'}</p>
            </div>
            <div className="space-y-3 mb-6">
              {[
                { en: 'All 15 professional templates', ar: 'جميع 15 قالباً احترافياً' },
                { en: 'Unlimited AI content generation', ar: 'إنشاء محتوى ذكاء اصطناعي غير محدود' },
                { en: 'Premium career tools', ar: 'أدوات مهنية متميزة' },
                { en: 'Priority support', ar: 'دعم ذو أولوية' },
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-accent-100 flex items-center justify-center flex-shrink-0"><FiCheck className="w-3 h-3 text-accent-600" /></div>
                  <span className="text-sm text-gray-700">{isContentArabic ? feat.ar : feat.en}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <a href="/dashboard#pricing" className="block w-full py-3.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white font-semibold rounded-xl text-center text-sm hover:from-accent-600 hover:to-accent-700 transition-all shadow-lg">{isContentArabic ? 'ترقية الآن' : 'Upgrade Now'}</a>
              <button onClick={() => setShowUpgradeModal(false)} className="w-full py-3 text-sm text-gray-500 hover:text-gray-700 transition-colors font-medium">{isContentArabic ? 'ربما لاحقاً' : 'Maybe Later'}</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .str-animate-in { animation: strSlideIn 0.4s ease-out; }
        .str-scale-in { animation: strScaleIn 0.25s ease-out; }
        .str-pulse { animation: strPulse 2s ease-in-out infinite; }
        .str-hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .str-hide-scrollbar::-webkit-scrollbar { display: none; }
        .str-preview-scale { transform: scale(0.58); }
        .line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .direction-rtl { direction: rtl; }
        @keyframes strSlideIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes strScaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes strPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}

function TemplatePreviewMini({ templateId, data, isRTL }: { templateId: string; data: any; isRTL: boolean }) {
  const [TemplateComponent, setTemplateComponent] = React.useState<React.ComponentType<any> | null>(null);
  React.useEffect(() => {
    const loadTemplate = async () => {
      try {
        let mod: any;
        switch (templateId) {
          case 'simple-professional': mod = await import('@/components/templates/SimpleProfessionalTemplate'); break;
          case 'minimalist-clean': mod = await import('@/components/templates/MinimalistCleanTemplate'); break;
          case 'classic': mod = await import('@/components/templates/ClassicTemplate'); break;
          case 'modern': mod = await import('@/components/templates/ModernTemplate'); break;
          case 'executive': mod = await import('@/components/templates/ExecutiveTemplate'); break;
          case 'creative': mod = await import('@/components/templates/CreativeTemplate'); break;
          case 'executive-clean-pro': mod = await import('@/components/templates/ExecutiveCleanProTemplate'); break;
          case 'structured-sidebar-pro': mod = await import('@/components/templates/StructuredSidebarProTemplate'); break;
          case 'global-professional': mod = await import('@/components/templates/GlobalProfessionalTemplate'); break;
          case 'ats-ultra-pro': mod = await import('@/components/templates/ATSUltraProTemplate'); break;
          case 'smart': mod = await import('@/components/templates/SmartTemplate'); break;
          case 'strong': mod = await import('@/components/templates/StrongTemplate'); break;
          case 'elegant': mod = await import('@/components/templates/ElegantTemplate'); break;
          case 'compact': mod = await import('@/components/templates/CompactTemplate'); break;
          case 'two-column-pro': mod = await import('@/components/templates/TwoColumnProTemplate'); break;
          case 'clean-modern': mod = await import('@/components/templates/CleanModernTemplate'); break;
          case 'professional-edge': mod = await import('@/components/templates/ProfessionalEdgeTemplate'); break;
          case 'metro': mod = await import('@/components/templates/MetroTemplate'); break;
          case 'fresh-start': mod = await import('@/components/templates/FreshStartTemplate'); break;
          case 'nordic': mod = await import('@/components/templates/NordicTemplate'); break;
          default: mod = await import('@/components/templates/SimpleProfessionalTemplate');
        }
        setTemplateComponent(() => mod.default);
      } catch (e) { console.error('Template load error:', e); }
    };
    loadTemplate();
  }, [templateId]);

  if (!TemplateComponent) {
    return (<div className="w-full h-full flex items-center justify-center bg-gray-100"><div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" /></div>);
  }
  return <TemplateComponent data={data} isRTL={isRTL} colorTheme={null} />;
}
